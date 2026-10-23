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
 *   ③ UserPromptSubmit (2026-10-23) — 세션이 켜져 있는 동안 마지막 업데이트 확인에서 24시간이 지났으면 self-update 를 뒤에서 띄워
 *      자동 업데이트하고, 이 세션이 열린 뒤 하네스가 바뀌었으면 커밋마다 한 번 안내 + 재시작 표시 (아래 promptCheck)
 *   건너뜀: 개발 모드(GUGBAB_DEV≠0), 래퍼가 조립한 설정 폴더가 아님. ①②는 커밋을 알 수 없음(unknown·형식 틀림)·git 실패여도 건너뜀(⓪은 그대로)
 *
 *   입력 환경: GUGBAB_DEV · GUGBAB_HOME(하네스 폴더) · GUGBAB_DATA(데이터 폴더, 없으면 하네스 폴더) · GUGBAB_LAUNCH · GUGBAB_WRAPPER_REV · CLAUDE_CONFIG_DIR
 *   출력: hookSpecificOutput.additionalContext + systemMessage. 항상 exit 0
 *         SessionStart 의 systemMessage 는 기록에만 남고 첫 화면에 안 보여서(2026-10-19 실측), 버전 안내도 additionalContext 로
 *         "첫 답변 맨 위에 그대로 한 번" 전하라고 Claude 에게 요청한다 (systemMessage 는 보이는 환경을 위해 유지)
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
    case 'locked': return `하네스 ${v} — 다른 세션이 업데이트 중이라 이번엔 확인을 건너뛰었습니다`
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
  markNotified(cfgDir, head) // 다음 질문(UserPromptSubmit)에서 같은 안내를 반복하지 않게
  res.message = `이 세션이 열린 뒤 ${harness}가 업데이트됐습니다 (${rev.slice(0, 7)} → ${head.slice(0, 7)}). ` +
    (res.marked
      ? '`/exit` 하면 래퍼가 새 버전으로 대화를 이어서(--continue) 다시 시작합니다.'
      : '`/exit` 후 터미널에서 `gugbab-claude -c` 로 다시 실행하면 새 버전으로 대화를 이어 갑니다.')
  return res
}

// ── 세션 중 자동 업데이트 (2026-10-23) ──
// 래퍼는 실행할 때만 업데이트를 확인하므로(1시간 간격), 며칠씩 켜 둔 세션은 새 버전을 받지 못했다.
// UserPromptSubmit 마다 마지막 확인 시각(<데이터>/state/update-check.json)만 읽고, 24시간이 지났으면
// 시작할 때와 같은 `node <하네스>/cli/main.js self-update` 를 뒤에서 따로 띄운다(질문은 기다리지 않음 — fetch·checkout 은 그쪽에서).
// 실제 판정(채널·버전 고정·로컬 변경·fast-forward·잠금)은 self-update 가 그대로 한다. 바뀐 하네스는 다음 질문에서 아래 안내로 알린다
const SESSION_INTERVAL_MS = 24 * 60 * 60 * 1000
function defaultSpawnUpdate(home, env) {
  const { spawn } = require('child_process')
  const childEnv = { ...env }
  delete childEnv.GUGBAB_LAUNCH // 이 세션 시작 기록(last-check.json)을 덮어쓰지 않게
  const child = spawn(process.execPath, [path.join(home, 'cli', 'main.js'), 'self-update'], { cwd: home, env: childEnv, detached: true, stdio: 'ignore', windowsHide: true })
  child.on('error', () => {})
  child.unref()
}

function maybeSessionUpdate({ env = process.env, now = Date.now(), spawnUpdate = defaultSpawnUpdate } = {}) {
  if (env.GUGBAB_DEV !== '0') return 'dev'
  if (!wrapperConfigDir(env.CLAUDE_CONFIG_DIR)) return 'not-wrapper'
  const home = env.GUGBAB_HOME
  if (typeof home !== 'string' || !path.isAbsolute(home)) return 'no-home'
  try { if (!fs.lstatSync(path.join(home, 'cli', 'main.js')).isFile()) return 'no-cli' } catch { return 'no-cli' }
  const dataDir = typeof env.GUGBAB_DATA === 'string' && path.isAbsolute(env.GUGBAB_DATA) ? env.GUGBAB_DATA : home
  const rec = readRecord(path.join(dataDir, 'state', 'update-check.json'))
  const last = rec ? Number(rec.at) : NaN
  // 미래 시각·깨진 값은 확인할 때가 된 것으로 본다 (self-update 의 1시간 판정과 같은 방향)
  if (Number.isFinite(last) && last > 0 && last <= now && now - last < SESSION_INTERVAL_MS) return 'recent'
  try { spawnUpdate(home, env) } catch { return 'spawn-failed' }
  return 'spawned'
}

// 세션 도중 업데이트 안내는 하네스 커밋마다 한 번 — 설정 폴더의 .gugbab-update-notified 에 알린 커밋을 남긴다
function notifiedHead(cfgDir) {
  try {
    const f = path.join(cfgDir, '.gugbab-update-notified')
    const st = fs.lstatSync(f)
    if (!st.isFile() || st.size > 100) return null
    return fs.readFileSync(f, 'utf8').trim()
  } catch { return null }
}
function markNotified(cfgDir, head) {
  const f = path.join(cfgDir, '.gugbab-update-notified')
  try { if (!fs.lstatSync(f).isFile()) return false } catch { /* 없음 → 새로 */ }
  const tmp = `${f}.${process.pid}.tmp`
  try { fs.writeFileSync(tmp, head + '\n', { flag: 'wx' }); fs.renameSync(tmp, f); return true } catch {
    try { if (fs.lstatSync(tmp).isFile()) fs.rmSync(tmp) } catch { /* 없음 */ }
    return false
  }
}

// UserPromptSubmit: 자동 업데이트를 띄우고, 이 세션이 열린 뒤 하네스가 바뀌었으면(커밋당 한 번) 안내
function promptCheck({ env = process.env, headOf = defaultHeadOf, now = Date.now(), spawnUpdate } = {}) {
  const res = { update: null, message: null }
  try { res.update = maybeSessionUpdate({ env, now, spawnUpdate }) } catch { /* 무시 */ }
  if (env.GUGBAB_DEV !== '0') return res
  const cfgDir = wrapperConfigDir(env.CLAUDE_CONFIG_DIR)
  const home = env.GUGBAB_HOME
  const rev = env.GUGBAB_WRAPPER_REV
  if (!cfgDir || typeof home !== 'string' || !path.isAbsolute(home) || !SHA_RE.test(rev || '')) return res
  let head
  try { head = headOf(home) } catch { return res }
  if (!SHA_RE.test(head || '') || head === rev) return res
  if (notifiedHead(cfgDir) === head) return res
  markNotified(cfgDir, head)
  const marked = markRestart(cfgDir)
  const ver = versionOf(home)
  res.message = `이 세션이 열린 뒤 ${ver ? `하네스 ${ver}` : '하네스'}로 업데이트됐습니다 (${rev.slice(0, 7)} → ${head.slice(0, 7)}). ` +
    '이미 연결된 훅·스킬·커맨드는 지금부터 새 버전으로 동작하고, 룰·CLAUDE.md·에이전트·설정은 ' +
    (marked ? '`/exit` 하면 래퍼가 새 버전으로 대화를 이어서(--continue) 다시 시작할 때 반영됩니다.' : '`/exit` 후 터미널에서 `gugbab-claude -c` 로 다시 실행하면 반영됩니다.')
  return res
}

module.exports = { checkWrapperVersion, wrapperConfigDir, markRestart, maybeSessionUpdate, promptCheck, SESSION_INTERVAL_MS }

if (require.main === module) {
  const hardStop = setTimeout(() => process.exit(0), 3000) // SessionStart 지연 상한
  hardStop.unref()
  let raw = ''
  try { raw = fs.readFileSync(0, 'utf8') } catch { process.exit(0) }
  let input
  try { input = JSON.parse(raw) } catch { process.exit(0) }
  const event = input && (input.hook_event_name || input.hookEventName)
  if (event === 'UserPromptSubmit') {
    let p
    try { p = promptCheck() } catch { process.exit(0) }
    if (p && p.message) {
      const text = `[wrapper-version-check] ${p.message}`
      process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: `${text}\n이 내용을 이번 답변 맨 위에 사용자에게 한 번 알려 주세요.` } }) + '\n')
    }
    process.exit(0)
  }
  if (event !== 'SessionStart') process.exit(0)
  const source = typeof input.source === 'string' ? input.source : 'startup'
  let r
  try { r = checkWrapperVersion({ source }) } catch { process.exit(0) }
  // SessionStart 의 systemMessage 는 기록에만 남고 첫 화면에 안 보인다(2026-10-19 실측) → 버전 안내도 Claude 가 첫 답변 맨 위에 그대로 전하게 한다.
  // systemMessage 는 보이는 환경을 위해 그대로 둔다
  const shown = [], context = []
  if (r.notice) {
    shown.push(`[gugbab] ${r.notice}`)
    context.push(`[gugbab] ${r.notice}\n위 [gugbab] 한 줄을 이 세션의 첫 답변 맨 위에 고치지 말고 그대로 한 번 보여 주세요(사용자 화면에는 아직 보이지 않음). 두 번째 답변부터는 반복하지 마세요.`)
  }
  if (r.message) {
    const text = `[wrapper-version-check] ${r.message}`
    shown.push(text); context.push(`${text}\n이 내용을 사용자에게 한 번 알려 주세요.`)
  }
  if (shown.length) {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context.join('\n') }, systemMessage: shown.join('\n') }) + '\n')
  }
  process.exit(0)
}
