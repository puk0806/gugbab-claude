'use strict'
// vcs-request.js — 커밋·푸시·PR·머지는 사용자가 "가장 최근 메시지"에서 직접 요청했을 때만 (2026-11-13 사고 대응, 사용자 결정 B)
//
// 사고: 계획 목록에 "배포: 피처 브랜치 → PR → 머지"를 넣고 "진행해"(계획 승인)를 그 항목 승인으로 해석해
//       commit → push → gh pr create → gh pr merge(=운영 배포)까지 실행했다. 확인 창은 첫 사유("git commit")만 보여 줬다.
// 규칙(CLAUDE.md 금지 사항): 커밋·푸시는 사용자가 명시적으로 요청할 때만. 계획 승인은 허락이 아니다.
//
// requestedActions(prompt) — 사용자 메시지에서 요청한 동작 { commit, push, pr, merge } (느슨한 키워드 + 부정 표현 제외)
//   머지·배포 요청 → pr·push·commit 도 포함 / PR 요청 → push 포함 (PR 을 만들려면 푸시가 필요하다)
//   푸시만 요청 → 커밋은 포함하지 않는다 / 커밋만 요청 → 푸시는 포함하지 않는다
// commandActions(cmd) — 셸 명령이 실제로 하는 동작 (bash-guard 해석기 기준. 해석 불가·동적·인터프리터 코드는 글자로 보수 판정)

let G = null
try { G = require('../bash-guard.js'); if (typeof G.analyzeShell !== 'function') G = null } catch { G = null }

const ACTIONS = ['commit', 'push', 'pr', 'merge']
const LABEL = { commit: 'git commit', push: 'git push', pr: 'gh pr create', merge: 'gh pr merge·머지 API' }
const ASK_WORD = { commit: '커밋', push: '푸시', pr: 'PR', merge: '머지·배포' }

// 키워드 — 오타·띄어쓰기에 느슨하게 ("커밋 푸쉬진해아혹" 실사례)
const KW = {
  // 영어 단어는 낱말 경계로 (commitx·pushover 같은 다른 낱말은 요청 아님)
  commit: /커\s?밋|컴밋|커빗|\bcommit(?:s|ted|ting)?\b/gi,
  push: /푸\s?[시쉬씨]|퓨\s?[시쉬]|\bpush(?:es|ed|ing)?\b/gi,
  pr: /\bPR\b|피알|풀\s?리퀘|\bpull\s?request|\bcreate-pr\b/gi,
  merge: /머\s?지|\bmerg(?:e|es|ed|ing)\b|병합|배\s?포|\bdeploy(?:s|ed|ing)?\b/gi,
}
// 동작 요청이 아닌 같은 글자 — "나머지"·"푸시 알림"·"배포 전에" 같은 명사 쓰임은 허락이 되면 안 된다 (키워드 앞뒤 글자로 본다)
const NOT_REQUEST = {
  commit: { before: /(?!)/, after: /^\s?(?:메시지|로그|이력|내역|해시|규칙|컨벤션)/ },
  push: { before: /(?:웹\s?|web\s?)$/i, after: /^\s?(?:알림|알람|메시지|구독|서버|notification|subscription|api)/i },
  pr: { before: /(?!)/, after: /^\s?(?:리뷰\s?코멘트|목록|번호|설명|본문|템플릿)/ },
  merge: { before: /(?:나|재|앞|이|뒤|그)$|\bun$/i, after: /^\s?(?:충돌|컨플릭트|conflict|전에|전략|규칙|정책|용|환경|판|본|버전|설정|일정|계획|파일|대상|서버|파이프라인|방식|구조)/i },
}
// 키워드 바로 뒤(같은 절)의 부정 — "커밋하지 마", "푸시는 말고", "머지 금지", "배포 없이", "커밋 안 해도", "don't"
const NEG_AFTER = /^[^,.。!?\n]{0,14}?(?:하지\s?(?:마|말|않)|말고|말아|금지|없이|안\s?(?:해|하|함|돼|됨)|빼고|제외|ㄴㄴ|nope|보류|나중에|하면\s?안)/i
// 부정은 같은 절에서만 — 다음 동작 단어·접속어("하고"·"그리고"·"랑"·쉼표) 앞에서 자른다 ("커밋하고 푸시는 하지 마" → 커밋은 요청)
const CLAUSE_END = /하고|그리고|이랑|랑\s|및|하면서|한\s?다음|한\s?뒤|후에|,|커\s?밋|컴밋|commit|푸\s?[시쉬씨]|push|\bPR\b|피알|머\s?지|merge|배\s?포|deploy/i
const clause = (s) => { const m = CLAUSE_END.exec(s); return m ? s.slice(0, m.index) : s }
const NEG_BEFORE = /(?:don'?t|do\s+not|never|no|without|skip)\s+$/i

// 인용·붙여넣기·코드 블록 안의 글자는 사용자 요청이 아니다 (붙여넣은 로그의 "git commit" 이 허락이 되면 안 된다)
function stripQuoted(prompt) {
  return String(prompt)
    .replace(/<pasted_content\b[^>]*>[\s\S]*?<\/pasted_content>/gi, ' ')
    .replace(/<cross-session-message\b[^>]*>[\s\S]*?<\/cross-session-message>/gi, ' ')
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/gi, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^>.*$/gm, ' ')
}

function requestedActions(prompt) {
  const out = { commit: false, push: false, pr: false, merge: false }
  if (typeof prompt !== 'string' || !prompt) return out
  let p = stripQuoted(prompt).slice(0, 20000)
  // 슬래시 커맨드 — /commit = 커밋, /create-pr = 푸시+PR (인자 글자도 요청으로 본다)
  // UserPromptSubmit 의 prompt 가 친 글자 그대로("/commit …")인지 태그 형태인지 공식 문서로 확인하지 못해 둘 다 받는다
  const typed = /^\s*\/((?:[\w-]+:)?(?:commit|create-pr))(?=\s|$)([\s\S]*)$/i.exec(prompt)
  const cmd = typed || /<command-name>\s*\/?([\w:-]+)\s*<\/command-name>/i.exec(prompt)
  if (cmd) {
    const name = cmd[1].toLowerCase().replace(/^.*:/, '')
    if (name === 'commit') out.commit = true
    if (name === 'create-pr') { out.push = true; out.pr = true }
    const args = typed ? [null, typed[2]] : /<command-args>([\s\S]*?)<\/command-args>/i.exec(prompt)
    p = args ? args[1] : ''
  }
  for (const a of ACTIONS) {
    KW[a].lastIndex = 0
    let m
    while ((m = KW[a].exec(p))) {
      const after = clause(p.slice(m.index + m[0].length, m.index + m[0].length + 30))
      const before = p.slice(Math.max(0, m.index - 12), m.index)
      if (NEG_AFTER.test(after) || NEG_BEFORE.test(before)) continue
      const raw = p.slice(m.index + m[0].length, m.index + m[0].length + 12)
      if (NOT_REQUEST[a].before.test(p.slice(Math.max(0, m.index - 4), m.index)) || NOT_REQUEST[a].after.test(raw)) continue
      out[a] = true
      break
    }
  }
  if (out.merge) { out.pr = true; out.push = true; out.commit = true }
  if (out.pr) out.push = true
  return out
}

const INTERP = /^(?:python[0-9.]*|node|nodejs|deno|bun|perl[0-9.]*|ruby|php|lua|osascript|pwsh|powershell)$/
const GH_VALUE = new Set(['-R', '--repo', '--hostname'])
const MERGE_PATH = /(?:^|\/)(?:pulls\/[^/\s]+\/merge|merges)(?:[/?]|$)/

// 글자 기준 보수 판정 — 해석기가 내용을 볼 수 없는 곳(인터프리터 인라인 코드·동적 명령·해석 불가)에 쓴다
function textActions(s, out) {
  const t = String(s).replace(/\.push\s*\(/g, '')
  if (/\bgit\b[^\n]{0,80}?\bcommit\b/i.test(t)) out.add('commit')
  if (/\bgit\b[^\n]{0,80}?\bpush\b/i.test(t)) out.add('push')
  if (/\bgh\b[^\n]{0,40}?\bpr\b[^\n]{0,20}?\bcreate\b/i.test(t)) out.add('pr')
  if (/\bgh\b[^\n]{0,40}?\bpr\b[^\n]{0,20}?\bmerge\b/i.test(t) || /\bgh\b[^\n]{0,20}?\bapi\b[^\n]{0,200}?(?:pulls\/[^/\s]+\/merge|\/merges)\b/i.test(t)) out.add('merge')
}

function commandActions(cmd) {
  const out = new Set()
  if (typeof cmd !== 'string' || !cmd.trim()) return out
  if (!G) { textActions(cmd, out); return out }
  let acc
  try { acc = G.analyzeShell(cmd) } catch { textActions(cmd, out); return out }
  const clean = (v) => (typeof G.cleanValue === 'function' ? G.cleanValue(v) : v)
  if (acc.unknown && acc.unknown.length) textActions(cmd, out)
  for (const inv of acc.invocations || []) {
    if (inv.dynamicName) { textActions(cmd, out); continue }
    const nm = inv.name
    if (nm === 'eval' || nm === 'source' || nm === '.' || nm === 'xargs' || INTERP.test(nm || '')) { textActions(cmd, out); continue }
    if (nm === 'git') {
      const g = inv.git
      if (!g || !g.sub || g.subDyn || Object.keys(g.aliases || {}).length) { textActions(cmd, out); continue }
      if (g.sub === 'commit') out.add('commit')
      if (g.sub === 'push') out.add('push')
      continue
    }
    if (nm === 'gh') {
      const vals = inv.args.map(a => clean(a.value))
      if (inv.args.some(a => a.dyn || a.subst)) textActions(cmd, out)
      const pos = []
      for (let i = 0; i < vals.length && pos.length < 2; i++) {
        if (GH_VALUE.has(vals[i])) { i++; continue }
        if (String(vals[i]).startsWith('-')) continue
        pos.push(vals[i])
      }
      if (pos[0] === 'pr' && pos[1] === 'create') out.add('pr')
      if (pos[0] === 'pr' && pos[1] === 'merge') out.add('merge')
      if (pos[0] === 'api' && vals.some(v => MERGE_PATH.test(String(v)))) {
        const write = vals.some((v, i) => (/^(?:-X|--method)$/.test(v) && String(vals[i + 1] || '').toUpperCase() !== 'GET')
          || /^(?:-X|--method=)(?!GET$)\w+/i.test(v) || /^(?:-f|-F|--field|--raw-field|--input)(?:=|$)/.test(v))
        if (write) out.add('merge')
      }
    }
  }
  return out
}

// 요청하지 않은 동작 목록 (빈 배열 = 통과)
function missingActions(cmd, requested) {
  const req = requested && typeof requested === 'object' ? requested : {}
  return [...commandActions(cmd)].filter(a => req[a] !== true)
}

function blockMessage(missing) {
  const what = missing.map(a => LABEL[a]).join(' · ')
  const words = [...new Set(missing.map(a => ASK_WORD[a]))].join('·')
  return [
    `[task-confirm-guard] 사용자가 가장 최근 메시지에서 요청하지 않은 동작이라 막았습니다: ${what}`,
    `  → 커밋·푸시·PR·머지는 사용자가 직접 요청할 때만 합니다. 계획 승인("진행해")은 허락이 아닙니다.`,
    `  → 필요하면 사용자에게 물어보세요. 사용자가 "${words}" 를 직접 요청하면 그 차례에 실행할 수 있습니다.`,
  ].join('\n')
}

module.exports = { requestedActions, commandActions, missingActions, blockMessage, stripQuoted }
