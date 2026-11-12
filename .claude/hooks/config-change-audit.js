#!/usr/bin/env node
// config-change-audit.js — SessionStart + ConfigChange Hook (공통)
//
// 목적: 세션 도중 설정 파일이 바뀌면 "무엇이 바뀌었는지" 기록하고 사용자에게 알린다 (2026-10-06 사용자 요청)
//   하네스의 보호 장치(훅 배선·deny·권한 모드)는 settings.json 에 있다. 누군가(Claude 포함) 이 파일을 고쳐
//   훅을 빼거나 허용을 넓히면 보호가 조용히 꺼진다 → 위험한 변경은 ⚠ 로 표시해 알린다.
//   차단은 하지 않는다 — 하네스 레포는 설정 자체를 개발하므로 차단하면 작업이 막힌다 (기록 + 알림만).
//
// 공식 문서(code.claude.com/docs/en/hooks — ConfigChange): 입력 source(user_settings·project_settings·
//   local_settings·policy_settings·skills)·file_path, exit 2·decision:block 은 변경 차단(미사용).
//   "Claude Code acts on the blocking decision ... and discards systemMessage and continue" — ConfigChange 의 알림은 어디에도 안 보인다
//
// SessionStart: 프로젝트·로컬·사용자 settings 를 스냅샷으로 저장 (비교 기준)
// ConfigChange: 스냅샷과 비교 → 감사 로그 기록, 스냅샷 갱신, 위험 변경(⚠)은 세션별 대기 파일에 쌓음 (2026-11-06)
// UserPromptSubmit: 대기 알림이 있으면 additionalContext 로 한 번 전하고(Claude 가 답변 맨 위에 사용자에게 알림) 대기 파일 삭제
//   skills 변경은 스킬 작성 중 자주 일어나므로 로그만 남기고 알리지 않는다
// 저장 위치: 대화 기록 폴더(~/.claude/projects/<해시>/) — 레포 워킹트리를 더럽히지 않는다

const fs = require('fs')
const os = require('os')
const path = require('path')

const SETTINGS_SOURCES = new Set(['user_settings', 'project_settings', 'local_settings', 'policy_settings'])

function storeDir(input) {
  const t = input && typeof input.transcript_path === 'string' ? input.transcript_path : ''
  if (t && path.isAbsolute(t)) return path.dirname(t)
  return path.join(os.tmpdir(), 'claude-config-audit')
}
function sessionKey(input) {
  const id = input && typeof input.session_id === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(input.session_id) ? input.session_id : 'unknown'
  return id
}
function snapshotPath(input) { return path.join(storeDir(input), 'config-audit', `${sessionKey(input)}.snapshot.json`) }
function logPath(input) { return path.join(storeDir(input), 'config-audit', 'audit.log') }

function readJson(p) {
  try { const v = JSON.parse(fs.readFileSync(p, 'utf8')); return v && typeof v === 'object' ? v : null } catch { return null }
}

function settingsFiles(cwd) {
  const proj = path.resolve(process.env.CLAUDE_PROJECT_DIR || cwd || process.cwd())
  const files = [path.join(proj, '.claude', 'settings.json'), path.join(proj, '.claude', 'settings.local.json')]
  // 사용자 설정: 래퍼(gugbab-claude)로 실행하면 설정 폴더(CLAUDE_CONFIG_DIR, 절대 경로만)가 그 자리다
  const cfg = process.env.CLAUDE_CONFIG_DIR
  if (cfg && path.isAbsolute(cfg)) files.push(path.join(cfg, 'settings.json'))
  else { try { files.push(path.join(os.homedir(), '.claude', 'settings.json')) } catch { /* ignore */ } }
  return files
}

function hookCommands(s) {
  const out = []
  const hooks = s && s.hooks && typeof s.hooks === 'object' ? s.hooks : {}
  for (const [event, groups] of Object.entries(hooks)) {
    if (!Array.isArray(groups)) continue
    for (const g of groups) {
      for (const h of (g && Array.isArray(g.hooks) ? g.hooks : [])) {
        if (h && typeof h.command === 'string') out.push(`${event}|${g.matcher || '*'}|${h.command}`)
      }
    }
  }
  return out
}
const list = (s, key) => (s && s.permissions && Array.isArray(s.permissions[key]) ? s.permissions[key].filter(x => typeof x === 'string') : [])

// 이전 → 이후 비교. 반환: { risky: [...], other: [...] }
function diffSettings(before, after) {
  const risky = [], other = []
  if (!after) { risky.push('설정 파일을 읽을 수 없음(삭제·깨진 JSON) — 이 파일의 훅·권한이 모두 빠졌을 수 있음'); return { risky, other } }
  const b = before || {}
  const bh = new Set(hookCommands(b)), ah = new Set(hookCommands(after))
  const removedHooks = [...bh].filter(h => !ah.has(h))
  const addedHooks = [...ah].filter(h => !bh.has(h))
  if (removedHooks.length) risky.push(`훅 ${removedHooks.length}개 제거: ${removedHooks.map(h => h.split('|')[0] + ' ' + (h.match(/hooks[\\/]([\w.-]+)/) || [, h.split('|')[2]])[1]).slice(0, 5).join(', ')}`)
  if (addedHooks.length) other.push(`훅 ${addedHooks.length}개 추가`)
  const addedAllow = list(after, 'allow').filter(x => !list(b, 'allow').includes(x))
  const removedDeny = list(b, 'deny').filter(x => !list(after, 'deny').includes(x))
  const wide = addedAllow.filter(x => /^(?:Bash|Write|Edit|mcp__[^(]*)(?:\(\*?\))?$|\(\*\)$/.test(x))
  if (wide.length) risky.push(`넓은 허용 추가: ${wide.join(', ')}`)
  if (addedAllow.length - wide.length > 0) other.push(`허용 ${addedAllow.length - wide.length}개 추가`)
  if (removedDeny.length) risky.push(`차단 규칙 ${removedDeny.length}개 제거: ${removedDeny.slice(0, 5).join(', ')}`)
  const bm = b.permissions && b.permissions.defaultMode, am = after.permissions && after.permissions.defaultMode
  if (bm !== am) (am === 'bypassPermissions' ? risky : other).push(`권한 모드 ${bm || '(없음)'} → ${am || '(없음)'}`)
  if (after.disableAllHooks === true && b.disableAllHooks !== true) risky.push('disableAllHooks=true — 모든 훅이 꺼짐')
  return { risky, other }
}

function writeSnapshot(input, files) {
  const snap = {}
  for (const f of files) snap[f] = readJson(f)
  try {
    fs.mkdirSync(path.dirname(snapshotPath(input)), { recursive: true })
    fs.writeFileSync(snapshotPath(input), JSON.stringify(snap))
  } catch { /* 스냅샷 실패 → 다음 변경은 기준 없이 비교 */ }
  return snap
}

function appendLog(input, line) {
  try {
    fs.mkdirSync(path.dirname(logPath(input)), { recursive: true })
    fs.appendFileSync(logPath(input), `${new Date().toISOString()} ${line}\n`)
  } catch { /* 로그 실패는 무시 */ }
}

function handle(input) {
  if (!input || typeof input !== 'object') return null
  const event = input.hook_event_name || input.hookEventName

  if (event === 'SessionStart') {
    writeSnapshot(input, settingsFiles(input.cwd))
    return null
  }
  if (event === 'UserPromptSubmit') return promptNotice(input)
  if (event !== 'ConfigChange') return null

  const source = typeof input.source === 'string' ? input.source : 'unknown'
  const file = typeof input.file_path === 'string' ? input.file_path : ''
  if (!SETTINGS_SOURCES.has(source)) {
    appendLog(input, `[${source}] ${file}`)
    return null // skills 등 — 기록만
  }
  const snap = readJson(snapshotPath(input)) || {}
  const before = file && Object.prototype.hasOwnProperty.call(snap, file) ? snap[file] : null
  const after = file ? readJson(file) : null
  const { risky, other } = diffSettings(before, after)
  appendLog(input, `[${source}] ${file} risky=${JSON.stringify(risky)} other=${JSON.stringify(other)}`)
  // 스냅샷 갱신 (같은 변경을 반복 경고하지 않도록)
  if (file) {
    snap[file] = after
    try { fs.writeFileSync(snapshotPath(input), JSON.stringify(snap)) } catch { /* ignore */ }
  }
  // 공식: ConfigChange 의 systemMessage·continue 는 버려진다(화면에도 Claude 에도 안 감) → 위험 변경만 대기 파일에 쌓아 두고
  // 다음 UserPromptSubmit 에서 additionalContext 로 한 번 알린다. 보호에 영향 없는 변경은 감사 로그에만
  if (risky.length === 0) return null
  const name = file ? path.basename(path.dirname(file)) + '/' + path.basename(file) : source
  const msg = `⚠ [config-change-audit] ${name} 변경 — 보호 장치에 영향: ${risky.join(' / ')}${other.length ? ` (그 외: ${other.join(', ')})` : ''}. 의도한 변경이 아니면 되돌리세요.`
  queueNotice(input, msg)
  return null
}

// ── 다음 질문에서 알릴 대기 목록 (세션별) ──
const PENDING_MAX = 20
const NOTICE_CAP = 9000 // 공식 additionalContext 상한 10,000자 — 여유
function pendingPath(input) { return path.join(storeDir(input), 'config-audit', `${sessionKey(input)}.pending.json`) }
function readPending(p) {
  try { const v = JSON.parse(fs.readFileSync(p, 'utf8')); return Array.isArray(v) ? v.filter(x => typeof x === 'string' && x) : [] } catch { return [] }
}
function queueNotice(input, msg) {
  const p = pendingPath(input)
  const list = readPending(p).concat(msg).slice(-PENDING_MAX)
  try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(list)) } catch { /* 대기 실패 — 감사 로그에는 남아 있음 */ }
}
function takeNotices(input) {
  const p = pendingPath(input)
  let exists = false
  try { exists = fs.lstatSync(p).isFile() } catch { return [] }
  const list = exists ? readPending(p) : []
  try { fs.unlinkSync(p) } catch { /* ignore */ }
  return list
}
function promptNotice(input) {
  const list = takeNotices(input)
  if (!list.length) return null
  const tail = '\n위 설정 변경 알림을 이번 답변 맨 위에 사용자에게 한 번 알려 주세요(화면에는 아직 보이지 않음).'
  let body = list.join('\n')
  if (body.length + tail.length > NOTICE_CAP) {
    // 최근 것 위주로 남긴다 — 오래된 것부터 뺀다
    const keep = []
    let n = 0
    for (let i = list.length - 1; i >= 0; i--) {
      const s = list[i].length > 1500 ? list[i].slice(0, 1500) + '…' : list[i]
      if (n + s.length + 1 + tail.length + 40 > NOTICE_CAP) break
      keep.unshift(s); n += s.length + 1
    }
    body = (keep.length < list.length ? `(앞선 알림 ${list.length - keep.length}건 생략 — 감사 로그 config-audit/audit.log)\n` : '') + keep.join('\n')
  }
  return { hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: body + tail } }
}

if (require.main === module) {
  let input = null
  try { input = JSON.parse(fs.readFileSync(0, 'utf8')) } catch { process.exit(0) }
  let r = null
  try { r = handle(input) } catch { r = null }
  if (r) process.stdout.write(JSON.stringify(r) + '\n')
  process.exit(0)
} else {
  module.exports = { handle, diffSettings, hookCommands, settingsFiles }
}
