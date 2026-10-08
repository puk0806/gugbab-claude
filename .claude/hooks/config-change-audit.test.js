#!/usr/bin/env node
/**
 * config-change-audit.test.js
 * 실행: node .claude/hooks/config-change-audit.test.js
 *
 * 3계층: 정상(세션 시작 스냅샷 → 변경 요약 알림·로그) / 악성(훅 제거·deny 제거·넓은 허용·bypass·disableAllHooks 를 ⚠ 로 표시)
 *        / 이상·경계(스냅샷 없음·깨진 JSON·파일 삭제·skills·policy·깨진 입력, 차단하지 않음)
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'config-change-audit.js')

let passed = 0, failed = 0
const check = (desc, cond, detail) => {
  console.log(`  ${cond ? '✅' : '❌'} ${desc}${cond ? '' : ` → FAIL ${detail !== undefined ? JSON.stringify(detail).slice(0, 300) : ''}`}`)
  cond ? passed++ : failed++
}

const base = fs.mkdtempSync(path.join(os.tmpdir(), 'cca-'))
const proj = path.join(base, 'proj'); fs.mkdirSync(path.join(proj, '.claude'), { recursive: true })
const transcriptDir = path.join(base, 'transcripts'); fs.mkdirSync(transcriptDir)
const SETTINGS = path.join(proj, '.claude', 'settings.json')
const H = (n) => ({ type: 'command', command: `node "$CLAUDE_PROJECT_DIR"/.claude/hooks/${n}` })
const ORIGINAL = {
  permissions: { defaultMode: 'acceptEdits', allow: ['Bash(npm*)'], deny: ['Bash(git push --force*)'] },
  hooks: { PreToolUse: [{ matcher: '*', hooks: [H('bash-guard.js'), H('auto-approve.js')] }], Stop: [{ hooks: [H('deliverable-guard.js')] }] },
}
const write = (obj) => fs.writeFileSync(SETTINGS, typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2))

let n = 0
function run(input, sid) {
  const full = { session_id: sid, transcript_path: path.join(transcriptDir, `${sid}.jsonl`), cwd: proj, ...input }
  const r = spawnSync('node', [HOOK], { input: JSON.stringify(full), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: proj }, timeout: 5000 })
  let out = null
  try { out = JSON.parse(r.stdout) } catch { /* 출력 없음 */ }
  return { code: r.status, out, msg: out && out.systemMessage }
}
function scenario(mutate) {
  const sid = `cca-${n++}`
  write(ORIGINAL)
  run({ hook_event_name: 'SessionStart', source: 'startup' }, sid)
  const next = JSON.parse(JSON.stringify(ORIGINAL)); mutate(next); write(next)
  return run({ hook_event_name: 'ConfigChange', source: 'project_settings', file_path: SETTINGS }, sid)
}

console.log('🔍 config-change-audit 테스트 시작')

console.log('\n── 정상 경로 ──')
{
  const r = scenario(s => s.permissions.allow.push('Bash(cargo*)'))
  check('평범한 허용 추가 → 알림(⚠ 없음)', r.code === 0 && r.msg && !r.msg.startsWith('⚠') && r.msg.includes('허용 1개 추가'), r)
}
{
  const r = scenario(s => s.hooks.Stop[0].hooks.push(H('cc-notify.js')))
  check('훅 추가 → 알림(⚠ 없음)', r.msg && !r.msg.startsWith('⚠') && r.msg.includes('훅 1개 추가'), r)
}
{
  const r = scenario(() => {})
  check('내용 변화 없음(저장만) → 알림 없음', r.code === 0 && !r.msg, r)
}
{
  const sid = `cca-${n++}`
  write(ORIGINAL); run({ hook_event_name: 'SessionStart', source: 'startup' }, sid)
  const s1 = JSON.parse(JSON.stringify(ORIGINAL)); s1.permissions.allow.push('Bash(go*)'); write(s1)
  run({ hook_event_name: 'ConfigChange', source: 'project_settings', file_path: SETTINGS }, sid)
  const r2 = run({ hook_event_name: 'ConfigChange', source: 'project_settings', file_path: SETTINGS }, sid)
  check('같은 변경을 두 번 알리지 않음 (스냅샷 갱신)', !r2.msg, r2)
  const log = fs.readFileSync(path.join(transcriptDir, 'config-audit', 'audit.log'), 'utf8')
  check('감사 로그에 기록됨', log.includes('[project_settings]') && log.includes('settings.json'))
}

console.log('\n── 보호 장치를 끄는 변경 → ⚠ ──')
{
  const r = scenario(s => { s.hooks.PreToolUse[0].hooks = [H('auto-approve.js')] })
  check('bash-guard 훅 제거 → ⚠ + 훅 이름', r.msg && r.msg.startsWith('⚠') && r.msg.includes('bash-guard'), r)
}
{
  const r = scenario(s => { s.permissions.deny = [] })
  check('deny 규칙 제거 → ⚠', r.msg && r.msg.startsWith('⚠') && r.msg.includes('차단 규칙 1개 제거'), r)
}
for (const rule of ['Bash', 'Bash(*)', 'Write', 'mcp__x__y(*)']) {
  const r = scenario(s => s.permissions.allow.push(rule))
  check(`넓은 허용 "${rule}" 추가 → ⚠`, r.msg && r.msg.startsWith('⚠') && r.msg.includes('넓은 허용'), r)
}
{
  const r = scenario(s => { s.permissions.defaultMode = 'bypassPermissions' })
  check('권한 모드 bypassPermissions → ⚠', r.msg && r.msg.startsWith('⚠') && r.msg.includes('bypassPermissions'), r)
}
{
  const r = scenario(s => { s.disableAllHooks = true })
  check('disableAllHooks=true → ⚠', r.msg && r.msg.startsWith('⚠') && r.msg.includes('disableAllHooks'), r)
}
{
  const r = scenario(s => { delete s.hooks })
  check('hooks 통째 삭제 → ⚠ 훅 3개 제거', r.msg && r.msg.includes('훅 3개 제거'), r)
}
{
  const sid = `cca-${n++}`
  write(ORIGINAL); run({ hook_event_name: 'SessionStart', source: 'startup' }, sid)
  write('{ broken json')
  const r = run({ hook_event_name: 'ConfigChange', source: 'project_settings', file_path: SETTINGS }, sid)
  check('깨진 JSON 으로 바뀜 → ⚠ (훅·권한 전부 빠졌을 수 있음)', r.msg && r.msg.startsWith('⚠') && r.msg.includes('읽을 수 없음'), r)
}
{
  const sid = `cca-${n++}`
  write(ORIGINAL); run({ hook_event_name: 'SessionStart', source: 'startup' }, sid)
  fs.rmSync(SETTINGS)
  const r = run({ hook_event_name: 'ConfigChange', source: 'project_settings', file_path: SETTINGS }, sid)
  check('설정 파일 삭제 → ⚠', r.msg && r.msg.startsWith('⚠'), r)
}

console.log('\n── 이상·경계 경로 (차단하지 않음) ──')
{
  const r = scenario(s => { s.hooks.PreToolUse = [] })
  check('위험 변경이어도 차단 안 함 (exit 0, decision 없음)', r.code === 0 && !(r.out && r.out.decision), r)
}
{
  write(ORIGINAL)
  const r = run({ hook_event_name: 'ConfigChange', source: 'project_settings', file_path: SETTINGS }, 'cca-nosnap')
  check('스냅샷 없음(세션 시작 훅 미실행) → 전부 새로 생긴 것으로 보고 알림, 크래시 없음', r.code === 0 && r.msg && !r.msg.startsWith('⚠'), r)
}
{
  const r = run({ hook_event_name: 'ConfigChange', source: 'skills', file_path: path.join(proj, '.claude/skills/x/SKILL.md') }, `cca-${n++}`)
  check('skills 변경 → 기록만, 알림 없음', r.code === 0 && !r.msg, r)
}
{
  const r = run({ hook_event_name: 'ConfigChange', source: 'project_settings' }, `cca-${n++}`)
  check('file_path 누락 → 크래시 없이 처리', r.code === 0, r)
}
{
  const r = run({ hook_event_name: 'ConfigChange', source: 'project_settings', file_path: SETTINGS, session_id: '../../evil' }, '../../evil')
  const escaped = fs.existsSync(path.join(base, 'evil.snapshot.json')) || fs.existsSync(path.join(transcriptDir, '..', '..', 'evil.snapshot.json'))
  check('세션 id 경로 조작 → 스냅샷이 밖으로 새지 않음', r.code === 0 && !escaped)
}
for (const [desc, stdin] of [['깨진 JSON', '{x'], ['빈 입력', ''], ['null', 'null'], ['다른 이벤트', JSON.stringify({ hook_event_name: 'Stop' })]]) {
  const r = spawnSync('node', [HOOK], { input: stdin, encoding: 'utf8', timeout: 5000 })
  check(`${desc} → exit 0, 출력 없음`, r.status === 0 && !(r.stdout || '').trim())
}

fs.rmSync(base, { recursive: true, force: true })
console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
