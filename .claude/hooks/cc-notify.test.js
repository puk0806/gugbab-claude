#!/usr/bin/env node
/**
 * cc-notify.test.js — Stop 훅(macOS 데스크톱 알림) 테스트
 *
 * 격리 방식: 실제 osascript를 호출하지 않도록, PATH 맨 앞에 임시 디렉토리를 두고
 * 그 안에 진짜 알림을 띄우지 않는 가짜 osascript 실행 파일을 배치한다.
 * cc-notify.js는 execSync('osascript ...')를 env 오버라이드 없이 호출하므로
 * 부모(테스트)가 넘기는 PATH를 그대로 상속받아 가짜 바이너리가 먼저 잡힌다.
 * 이 레포 실행 환경은 darwin이므로(process.platform === 'darwin') 실제로
 * 이 경로를 타는 것을 확인할 수 있다 — 격리 불가 사유 없음.
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'cc-notify.js')

let passed = 0, failed = 0

function makeFakeOsascriptDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-notify-fakepath-'))
  const logFile = path.join(dir, 'osascript.log')
  const bin = path.join(dir, 'osascript')
  // 인자를 그대로 로그에 남기고 종료. 실제 알림 절대 발생시키지 않음.
  fs.writeFileSync(bin, `#!/bin/sh\nprintf '%s\\n' "$*" >> "${logFile}"\nexit 0\n`)
  fs.chmodSync(bin, 0o755)
  return { dir, logFile }
}

function runHook(stdinRaw, fakeDir) {
  const env = { ...process.env, PATH: `${fakeDir}:${process.env.PATH}` }
  return spawnSync('node', [HOOK], { input: stdinRaw, encoding: 'utf8', timeout: 5000, env })
}

function readLog(logFile) {
  try { return fs.readFileSync(logFile, 'utf8') } catch { return null }
}

function test(desc, stdinRaw, expect) {
  const { dir, logFile } = makeFakeOsascriptDir()
  const r = runHook(stdinRaw, dir)
  const log = readLog(logFile)

  let pass = r.status === 0
  if (pass && expect.notifyCalled === true) pass = pass && log !== null
  if (pass && expect.notifyCalled === false) pass = pass && log === null
  if (pass && expect.logIncludes) pass = pass && log !== null && log.includes(expect.logIncludes)
  if (pass && expect.logExcludes) pass = pass && (log === null || !log.includes(expect.logExcludes))

  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (exit ${r.status}, log: ${JSON.stringify(log)})`}`)
  pass ? passed++ : failed++
  try { fs.rmSync(dir, { recursive: true, force: true }) } catch {}
}

console.log(`🔍 cc-notify 테스트 시작 (platform=${process.platform})`)

if (process.platform !== 'darwin') {
  console.log('⚠️  이 실행 환경이 darwin이 아니라서 cc-notify는 즉시 exit 0으로 종료됩니다.')
  console.log('   (osascript 호출 자체가 발생하지 않으므로 격리 검증은 darwin 환경에서만 유효합니다.)')
}

console.log('\n── 정상 흐름 ──')
// 공식 Stop 입력: stop_hook_active, last_assistant_message, background_tasks, session_crons (stop_reason 없음)
const isMac = process.platform === 'darwin'
test('정상 Stop(stop_hook_active=false) → 완료 메시지로 알림 호출',
  JSON.stringify({ hook_event_name: 'Stop', stop_hook_active: false, last_assistant_message: '끝', background_tasks: [], session_crons: [] }),
  { notifyCalled: isMac, logIncludes: isMac ? '작업이 완료됐어요' : undefined })
test('stop_hook_active=true(다른 Stop 훅이 차단해 계속 진행 중) → 완료 알림 안 보냄',
  JSON.stringify({ hook_event_name: 'Stop', stop_hook_active: true }),
  { notifyCalled: false })
test('background_tasks 진행 중 → "완료" 대신 백그라운드 대기 알림',
  JSON.stringify({ hook_event_name: 'Stop', stop_hook_active: false, background_tasks: [{ id: 't1', type: 'shell', status: 'running' }] }),
  { notifyCalled: isMac, logIncludes: isMac ? '백그라운드 작업' : undefined, logExcludes: '작업이 완료됐어요' })
test('존재하지 않는 필드 stop_reason="error" → 무시(오류 분기 없음), 완료 메시지',
  JSON.stringify({ stop_reason: 'error' }),
  { notifyCalled: isMac, logIncludes: isMac ? '작업이 완료됐어요' : undefined, logExcludes: '오류가 발생했어요' })

console.log('\n── 악성/경계 — 필드 타입 위장 ──')
test('stop_hook_active 문자열 "true" → 불리언 아님, 완료 알림(크래시 없음)',
  JSON.stringify({ stop_hook_active: 'true' }), { notifyCalled: isMac, logIncludes: isMac ? '작업이 완료됐어요' : undefined })
test('background_tasks 가 배열 아님(문자열·객체) → 무시, 완료 알림',
  JSON.stringify({ background_tasks: 'running', session_crons: { a: 1 } }), { notifyCalled: isMac, logIncludes: isMac ? '작업이 완료됐어요' : undefined })
test('last_assistant_message 에 셸 메타문자 → 알림 문구에 반영 안 됨(고정 리터럴)',
  JSON.stringify({ last_assistant_message: `"'; touch /tmp/cc-notify-pwned-${Date.now()}; '` }),
  { notifyCalled: isMac, logIncludes: isMac ? '작업이 완료됐어요' : undefined, logExcludes: 'pwned' })
test('JSON null → exit 0, 알림 호출 안 함(크래시 없음)', 'null', { notifyCalled: false })

console.log('\n── 악성/경계 — stdin 조작 ──')
test('빈 stdin → JSON.parse 실패 → exit 0, 알림 호출 안 함', '', { notifyCalled: false })
test('깨진 JSON stdin → exit 0, 알림 호출 안 함', '{broken json,,,', { notifyCalled: false })
test('공백만 있는 stdin → exit 0, 알림 호출 안 함', '   ', { notifyCalled: false })
test('최상위가 배열인 JSON → exit 0 (stop_reason 접근 시 undefined, 크래시 없이 완료 메시지)',
  '[1,2,3]',
  { notifyCalled: process.platform === 'darwin' })
test('필드 누락(빈 객체) → reason 기본값으로 완료 메시지 알림 호출',
  '{}',
  { notifyCalled: process.platform === 'darwin', logIncludes: process.platform === 'darwin' ? '작업이 완료됐어요' : undefined })

console.log('\n── 악성/경계 — 거대 입력 ──')
const hugeValid = JSON.stringify({ stop_reason: 'other', padding: 'a'.repeat(1_500_000) })
test('거대 유효 JSON(1.5MB) → exit 0, 정상 처리', hugeValid, { notifyCalled: process.platform === 'darwin' })
const hugeBroken = 'x'.repeat(1_500_000) + '{not json'
test('거대 깨진 입력(1.5MB) → exit 0, 알림 호출 안 함, 멈추지 않음', hugeBroken, { notifyCalled: false })

console.log('\n── 악성/경계 — 셸 인젝션 시도 (stop_reason은 고정 리터럴로만 매핑되므로 반영되면 안 됨) ──')
test('stop_reason에 셸 메타문자(따옴표 탈출 시도) → 알림 메시지는 고정 리터럴 유지, 인젝션 없음',
  JSON.stringify({ stop_reason: `"; touch /tmp/cc-notify-pwned-${Date.now()}; echo "` }),
  { notifyCalled: process.platform === 'darwin', logIncludes: process.platform === 'darwin' ? '작업이 완료됐어요' : undefined, logExcludes: 'pwned' })
test('stop_reason에 경로 조작 문자열 → 영향 없음, 완료 메시지 그대로',
  JSON.stringify({ stop_reason: '../../../../etc/passwd' }),
  { notifyCalled: process.platform === 'darwin', logIncludes: process.platform === 'darwin' ? '작업이 완료됐어요' : undefined })
test('stop_reason에 백틱/서브셸 조합 → 인젝션 없음, 완료 메시지 그대로',
  JSON.stringify({ stop_reason: '`id`$(whoami)' }),
  { notifyCalled: process.platform === 'darwin', logIncludes: process.platform === 'darwin' ? '작업이 완료됐어요' : undefined })

// 인젝션 마커가 실제로 생성되지 않았는지 최종 확인 (혹시 실제 osascript가 호출됐더라도 서브셸이 실행됐는지 점검)
const injectionMarkers = fs.readdirSync(os.tmpdir()).filter(f => f.startsWith('cc-notify-pwned-'))
if (injectionMarkers.length > 0) {
  console.log(`  ❌ 인젝션 마커 파일 발견(${injectionMarkers.length}개) — 셸 인젝션 의심`)
  failed++
} else {
  console.log('  ✅ 인젝션 마커 파일 없음 — stop_reason이 셸로 실행되지 않음 확인')
  passed++
}

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
