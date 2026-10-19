#!/usr/bin/env node
/**
 * wrapper-version-check.js — SessionStart: 하네스 버전·업데이트 결과를 사용자에게 보여 주고, 이 세션을 띄운 래퍼가 지금 설치된 하네스와
 *                            같은 버전인지 확인 (비차단, 안내만)
 *
 *   ⓪ 버전 안내 (2026-10-19) — 래퍼가 실행마다 GUGBAB_LAUNCH 를 만들고 self-update 가 확인 결과를 <데이터>/state/last-check.json 에
 *      그 값과 함께 남긴다. launch 가 이 세션 것과 같고 아직 안 보여 줬으면 결과를 보여 주고 shown 표시
 *        "[gugbab] 하네스 v1.0.4 → v1.0.5 로 업데이트됐습니다" / "[gugbab] 하네스 v1.0.5 — 최신입니다 (방금 확인)" /
 *        "[gugbab] 하네스 v1.0.5 — 업데이트 확인 건너뜀 (마지막 확인 09:34, 1시간마다 확인 …)" 등
 *      기록이 없거나 다른 실행 것이면 새 세션(startup·resume)일 때만 "[gugbab] 하네스 v1.0.5" — /clear·compact 에서는 반복하지 않음
 *   래퍼(gugbab-claude)는 업데이트되면 새 버전 자신으로 다시 실행하고(2026-10-19), claude 를 띄울 때 하네스 커밋을
 *   GUGBAB_WRAPPER_REV 로 넘긴다. 이 훅은 그 값을 설치본의 HEAD 와 비교한다.
 *   ① 값이 없음 = 다시 실행 기능이 없던 예전 래퍼(v1.0.4 이하)가 업데이트한 직후 띄운 세션
 *      → 래퍼 수정이 이 세션에 반영되지 않았으니 터미널에서 다시 실행하라고 안내 (재시작 표시는 남기지 않는다 —
 *        예전 래퍼의 재시작은 여전히 값을 넘기지 않아 매번 다시 시작하게 되므로)
 *   ② 값이 HEAD 와 다름 = 세션 도중(다른 세션 등에서) 하네스가 업데이트됨
 *      → 설정 폴더에 재시작 표시(.gugbab-restart)를 남겨 /exit 하면 래퍼가 새 버전으로 대화를 이어서 다시 띄우게 하고 안내
 *   건너뜀: 개발 모드(GUGBAB_DEV≠0), 래퍼가 조립한 설정 폴더가 아님. ①②는 커밋을 알 수 없음(unknown·형식 틀림)·git 실패여도 건너뜀(⓪은 그대로)
 *
 *   입력 환경: GUGBAB_DEV · GUGBAB_HOME(하네스 폴더) · GUGBAB_DATA(데이터 폴더, 없으면 하네스 폴더) · GUGBAB_LAUNCH · GUGBAB_WRAPPER_REV · CLAUDE_CONFIG_DIR
 *   출력: hookSpecificOutput.additionalContext + systemMessage (SessionStart — systemMessage 는 사용자 화면에 표시). 항상 exit 0
 *   모듈: checkWrapperVersion({ env, headOf, source, now })
 */
'use strict'
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const SHA_RE = /^[0-9a-f]{40}$/

function defaultHeadOf(home) {
  const out = execFileSync('git', ['-C', home, 'rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 2000, maxBuffer: 4096 })
  return String(out).trim()
}

// 래퍼가 조립한 설정 폴더 = 실제 폴더 이름이 .claude 이고 안에 일반 파일 .gugbab-state.json 이 있음
function wrapperConfigDir(cfg) {
  if (typeof cfg !== 'string' || !path.isAbsolute(cfg)) return null
  try {
    const real = fs.realpathSync(cfg)
    if (path.basename(real) !== '.claude' || !fs.statSync(real).isDirectory()) return null
    if (!fs.lstatSync(path.join(real, '.gugbab-state.json')).isFile()) return null
    return real
  } catch { return null }
}

function versionOf(home) {
  try {
    const v = fs.readFileSync(path.join(home, 'VERSION'), 'utf8').trim()
    return /^\d{1,6}\.\d{1,6}\.\d{1,6}$/.test(v) ? `v${v}` : null
  } catch { return null }
}

// 재시작 표시 — 이미 있으면 그대로, 링크·폴더 등 일반 파일이 아닌 것이 있으면 건드리지 않음
function markRestart(cfgDir) {
  const f = path.join(cfgDir, '.gugbab-restart')
  try { return fs.lstatSync(f).isFile() } catch { /* 없음 → 새로 */ }
  try { fs.writeFileSync(f, 'wrapper-version-check\n', { flag: 'wx' }); return true } catch { return false }
}

// ── ⓪ 버전 안내 ──
const LAUNCH_RE = /^\d{1,10}-\d{1,13}$/
const LABEL_RE = /^[A-Za-z0-9][A-Za-z0-9._/ -]{0,119}$/ // 태그(v1.0.5) · "main abc1234" · 브랜치 이름 — 제어문자·셸 문자는 버림
const MAX_RECORD = 4096
const label = (v) => (typeof v === 'string' && LABEL_RE.test(v) ? v : null)
const hhmm = (t) => { const d = new Date(t); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }

// 일반 파일·작은 JSON 객체만 (링크·폴더·초대용량·깨진 JSON → null)
function readRecord(f) {
  try {
    const st = fs.lstatSync(f)
    if (!st.isFile() || st.size > MAX_RECORD) return null
    const v = JSON.parse(fs.readFileSync(f, 'utf8'))
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null
  } catch { return null }
}

// shown 표시 — 임시 파일 → rename (링크 자리면 readRecord 가 이미 거름)
function markShown(f, rec) {
  const tmp = `${f}.${process.pid}.shown.tmp`
  try { fs.writeFileSync(tmp, JSON.stringify({ ...rec, shown: true }), { flag: 'wx' }); fs.renameSync(tmp, f); return true } catch {
    try { if (fs.lstatSync(tmp).isFile()) fs.rmSync(tmp) } catch { /* 없음 */ }
    return false
  }
}

function checkResultText(rec, ver, now) {
  const v = ver || '(버전 모름)'
  switch (rec.result) {
    case 'updated': {
      const from = label(rec.from), to = label(rec.to)
      return from && to ? `하네스 ${from} → ${to} 로 업데이트됐습니다` : `하네스가 ${v} 로 업데이트됐습니다`
    }
    case 'up-to-date': return `하네스 ${v} — 최신입니다 (방금 확인)`
    case 'recent': {
      const t = Number(rec.lastCheckAt)
      const when = Number.isFinite(t) && t > 0 && t <= now ? `마지막 확인 ${hhmm(t)}, ` : ''
      return `하네스 ${v} — 업데이트 확인 건너뜀 (${when}1시간마다 확인 · 바로 받으려면 터미널에서 \`gugbab-claude update\`)`
    }
    case 'fetch-failed': return `하네스 ${v} — 업데이트 확인 실패 (원격에 연결 못 함), 지금 버전으로 실행합니다`
    case 'pinned': return `하네스 ${v} — 버전 고정이라 업데이트를 확인하지 않습니다`
    case 'local-changes': return `하네스 ${v} — 하네스 폴더에 로컬 변경이 있어 업데이트하지 않았습니다 (\`gugbab-claude doctor\`)`
    case 'not-ff': return `하네스 ${v} — 원격 이력이 달라 업데이트하지 않았습니다 (\`gugbab-claude doctor\`)`
    case 'failed': case 'error': return `하네스 ${v} — 업데이트 중 오류가 나 지금 버전으로 실행합니다 (\`gugbab-claude doctor\`)`
    case 'no-tag': case 'no-target': case 'not-git': case 'bad-branch':
      return `하네스 ${v} — 업데이트를 확인하지 못했습니다 (${rec.result}, \`gugbab-claude doctor\`)`
    default: return null
  }
}

function versionNotice({ env, home, source, now }) {
  const ver = versionOf(home)
  const dataDir = typeof env.GUGBAB_DATA === 'string' && path.isAbsolute(env.GUGBAB_DATA) ? env.GUGBAB_DATA : home
  const f = path.join(dataDir, 'state', 'last-check.json')
  const launch = env.GUGBAB_LAUNCH
  const rec = typeof launch === 'string' && LAUNCH_RE.test(launch) ? readRecord(f) : null
  if (rec && rec.launch === launch) {
    if (rec.shown === true) return null
    const text = checkResultText(rec, ver, now)
    if (text) { markShown(f, rec); return text }
  }
  // 이 실행의 확인 기록이 없음(업데이트 확인 안 한 실행·예전 래퍼) — 새 세션일 때만 지금 버전
  if (source === 'startup' || source === 'resume') return ver ? `하네스 ${ver}` : null
  return null
}

function checkWrapperVersion({ env = process.env, headOf = defaultHeadOf, source = 'startup', now = Date.now() } = {}) {
  const res = { kind: null, marked: false, message: null, notice: null }
  if (env.GUGBAB_DEV !== '0') return res
  const cfgDir = wrapperConfigDir(env.CLAUDE_CONFIG_DIR)
  if (!cfgDir) return res
  const home = env.GUGBAB_HOME
  if (typeof home !== 'string' || !path.isAbsolute(home)) return res
  try { res.notice = versionNotice({ env, home, source, now }) } catch { /* 안내 실패는 무시 */ }
  const rev = env.GUGBAB_WRAPPER_REV
  let head
  try { head = headOf(home) } catch { return res }
  if (!SHA_RE.test(head || '')) return res
  const ver = versionOf(home)
  const harness = ver ? `하네스 ${ver}` : '하네스'
  if (rev === undefined) {
    res.kind = 'old-wrapper'
    res.message = `이 세션은 업데이트 전 버전의 래퍼로 시작됐습니다 — ${harness}로 갱신됐지만 래퍼 자체의 수정은 이 세션에 반영되지 않았습니다. ` +
      '`/exit` 후 터미널에서 `gugbab-claude -c` 로 다시 실행하면 대화를 이어서 새 래퍼로 열립니다. (이 안내는 다시 실행 기능이 들어간 버전으로 한 번 넘어갈 때만 나옵니다)'
    return res
  }
  if (!SHA_RE.test(rev) || rev === head) return res
  res.kind = 'updated-during-session'
  res.marked = markRestart(cfgDir)
  res.message = `이 세션이 열린 뒤 ${harness}가 업데이트됐습니다 (${rev.slice(0, 7)} → ${head.slice(0, 7)}). ` +
    (res.marked
      ? '`/exit` 하면 래퍼가 새 버전으로 대화를 이어서(--continue) 다시 시작합니다.'
      : '`/exit` 후 터미널에서 `gugbab-claude -c` 로 다시 실행하면 새 버전으로 대화를 이어 갑니다.')
  return res
}

module.exports = { checkWrapperVersion, wrapperConfigDir, markRestart }

if (require.main === module) {
  const hardStop = setTimeout(() => process.exit(0), 3000) // SessionStart 지연 상한
  hardStop.unref()
  let raw = ''
  try { raw = fs.readFileSync(0, 'utf8') } catch { process.exit(0) }
  let input
  try { input = JSON.parse(raw) } catch { process.exit(0) }
  const event = input && (input.hook_event_name || input.hookEventName)
  if (event !== 'SessionStart') process.exit(0)
  const source = typeof input.source === 'string' ? input.source : 'startup'
  let r
  try { r = checkWrapperVersion({ source }) } catch { process.exit(0) }
  // 버전 안내는 사용자 화면(systemMessage)에 바로 보이므로 Claude 에게 전달을 부탁하지 않는다. 래퍼 안내(①②)만 전달 요청
  const shown = [], context = []
  if (r.notice) { shown.push(`[gugbab] ${r.notice}`); context.push(`[gugbab] ${r.notice} (사용자 화면에 이미 표시됨)`) }
  if (r.message) {
    const text = `[wrapper-version-check] ${r.message}`
    shown.push(text); context.push(`${text}\n이 내용을 사용자에게 한 번 알려 주세요.`)
  }
  if (shown.length) {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context.join('\n') }, systemMessage: shown.join('\n') }) + '\n')
  }
  process.exit(0)
}
