#!/usr/bin/env node
/**
 * protect-secrets.test.js — 민감 파일 수정 차단 테스트
 * 실행: node .claude/hooks/protect-secrets.test.js
 */

const { spawnSync } = require('child_process')
const path = require('path')
const HOOK = path.join(__dirname, 'protect-secrets.js')

let passed = 0, failed = 0

function test(desc, toolName, filePath, expectedExit) {
  const input = JSON.stringify({
    hook_event_name: 'PreToolUse', tool_name: toolName,
    tool_input: { file_path: filePath, content: 'x' },
  })
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000 })
  // 메시지 채널 단언 — PreToolUse exit 2 는 stderr 가 차단 사유로 Claude 에게 전달된다
  const TAG = '[protect-secrets]', out = r.stdout || '', err = r.stderr || ''
  const chanErr = expectedExit === 2
    ? (!err.includes(TAG) ? 'stderr 에 차단 사유 없음' : out.includes(TAG) ? 'stdout 에 차단 사유가 섞임' : '')
    : ((out + err).includes(TAG) ? '통과인데 차단 사유 출력' : '')
  const pass = r.status === expectedExit && !chanErr
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status}${chanErr ? ', ' + chanErr : ''})`}`)
  pass ? passed++ : failed++
}

console.log('🔍 protect-secrets 테스트 시작')

console.log('\n── 민감 파일 → exit 2 ──')
test('.env', 'Write', '/proj/.env', 2)
test('.env.production', 'Write', '/proj/.env.production', 2)
test('server.pem', 'Write', '/proj/certs/server.pem', 2)
test('private.key', 'Edit', '/proj/private.key', 2)
test('credentials.json', 'Write', '/proj/credentials.json', 2)
test('id_rsa', 'Write', '/Users/x/.ssh/id_rsa', 2)
test('service-account.json', 'Write', '/proj/service-account.json', 2)

console.log('\n── 안전 파일 → exit 0 ──')
test('.env.example', 'Write', '/proj/.env.example', 0)
test('.env.sample', 'Write', '/proj/.env.sample', 0)
test('.env.test', 'Edit', '/proj/.env.test', 0)
test('일반 소스', 'Write', '/proj/src/app.ts', 0)
test('일반 마크다운', 'Write', '/proj/README.md', 0)

console.log('\n── 대상 외 도구 → exit 0 ──')
test('Read 도구 (.env 읽기 허용)', 'Read', '/proj/.env', 0)
test('Bash 도구', 'Bash', '/proj/.env', 0)

// ── 2026-10-06 사용자 결정: 홈 설정 파일 쓰기 차단 · 개인키·인증 파일 읽기 차단 (.env 읽기는 허용) ──
const HOME = require('os').homedir()
function testGrep(desc, p, expectedExit) {
  const r = spawnSync('node', [HOOK], { input: JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Grep', tool_input: { pattern: 'x', path: p } }), encoding: 'utf8', timeout: 5000 })
  const pass = r.status === expectedExit && (expectedExit !== 2 || r.stderr.includes('[protect-secrets]'))
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status})`}`)
  pass ? passed++ : failed++
}

console.log('\n── 홈 셸·SSH·git 설정 파일 쓰기 → exit 2 ──')
test('~/.zshrc (절대경로)', 'Write', `${HOME}/.zshrc`, 2)
test('~/.zshrc (틸드)', 'Edit', '~/.zshrc', 2)
test('~/.bashrc', 'Write', `${HOME}/.bashrc`, 2)
test('~/.gitconfig', 'Edit', `${HOME}/.gitconfig`, 2)
test('~/.ssh/config', 'Write', `${HOME}/.ssh/config`, 2)
test('~/.ssh/authorized_keys (뒷문 심기)', 'Write', `${HOME}/.ssh/authorized_keys`, 2)
test('상위 이동으로 위장: ~/x/../.zshrc', 'Write', `${HOME}/x/../.zshrc`, 2)
test('NotebookEdit 도 동일 판정', 'NotebookEdit', `${HOME}/.zshrc`, 2)

console.log('\n── 개인키·클라우드 인증 읽기 → exit 2 ──')
test('Read ~/.ssh/id_rsa', 'Read', `${HOME}/.ssh/id_rsa`, 2)
test('Read ~/.ssh/id_ed25519', 'Read', '~/.ssh/id_ed25519', 2)
test('Read ~/.ssh/id_rsa_work (접미사)', 'Read', `${HOME}/.ssh/id_rsa_work`, 2)
test('Read ~/.ssh/config', 'Read', `${HOME}/.ssh/config`, 2)
test('Read ~/.aws/credentials', 'Read', `${HOME}/.aws/credentials`, 2)
test('Read ~/.netrc', 'Read', `${HOME}/.netrc`, 2)
test('Read 프로젝트 안 server.pem', 'Read', '/proj/certs/server.pem', 2)
test('Read 프로젝트 안 private.key', 'Read', '/proj/private.key', 2)
test('Read 상위 이동 위장 ~/a/../.ssh/id_rsa', 'Read', `${HOME}/a/../.ssh/id_rsa`, 2)
testGrep('Grep path=~/.ssh (디렉토리 통째)', `${HOME}/.ssh`, 2)
testGrep('Grep path=~/.aws/credentials', `${HOME}/.aws/credentials`, 2)

console.log('\n── 읽기 허용 (사용자 결정·정상 경로) → exit 0 ──')
test('Read .env (디버깅용 허용)', 'Read', '/proj/.env', 0)
test('Read ~/.ssh/id_rsa.pub (공개키)', 'Read', `${HOME}/.ssh/id_rsa.pub`, 0)
test('Read ~/.ssh/known_hosts', 'Read', `${HOME}/.ssh/known_hosts`, 0)
test('Read 일반 소스', 'Read', '/proj/src/app.ts', 0)
test('Read ~/.zshrc (읽기는 허용)', 'Read', `${HOME}/.zshrc`, 0)
test('Write 프로젝트 안 zshrc 이름 파일', 'Write', '/proj/docs/.zshrc', 0)
testGrep('Grep 경로 없음 (cwd 검색)', undefined, 0)
testGrep('Grep 프로젝트 폴더', '/proj/src', 0)

// ── 2026-10-20 윈도우 2단계: 대소문자 무시·~\ 확장·%USERPROFILE%·MSYS 경로, PowerShell 프로필·시작프로그램 쓰기, _netrc·%APPDATA%\gcloud ──
const { IS_WIN } = require('./lib/winpath')
if (!IS_WIN) {
  console.log('\n── 윈도우 경로 ──\n  ⚠️ 건너뜀: 윈도우 경로 시험 (맥 — 윈도우 PC 에서만 의미 있음)')
} else {
  const W = (p) => p.replace(/\//g, '\\')
  const HOMEM = '/' + HOME[0].toLowerCase() + HOME.slice(2).replace(/\\/g, '/')
  const APPDATA = process.env.APPDATA || path.join(HOME, 'AppData', 'Roaming')
  const STARTUP = path.join(APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup')

  console.log('\n── 윈도우: 홈 설정·자동 실행 위치 쓰기 → exit 2 ──')
  test('~\\.bashrc (틸드 + 역슬래시)', 'Write', '~\\.bashrc', 2)
  test('C:/Users/<me>/.BASHRC (대소문자 무시)', 'Edit', `${HOME.replace(/\\/g, '/')}/.BASHRC`, 2)
  test('/c/Users/<me>/.gitconfig (MSYS)', 'Write', `${HOMEM}/.gitconfig`, 2)
  test('%USERPROFILE%\\.ssh\\authorized_keys (미확장 변수)', 'Write', '%USERPROFILE%\\.ssh\\authorized_keys', 2)
  test('~\\.SSH\\config (대소문자)', 'Write', '~\\.SSH\\config', 2)
  test('PowerShell 5 프로필', 'Write', path.join(HOME, 'Documents', 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1'), 2)
  test('PowerShell 7 프로필 (대소문자 섞임)', 'Edit', path.join(HOME, 'documents', 'POWERSHELL', 'profile.ps1'), 2)
  test('시작프로그램 폴더 x.js', 'Write', path.join(STARTUP, 'x.js'), 2)
  test('시작프로그램 폴더 대문자 STARTUP', 'Write', path.join(path.dirname(STARTUP), 'STARTUP', 'evil.bat'), 2)
  test('시작프로그램 .. 우회 (Startup\\sub\\..\\x.vbs)', 'Write', path.join(STARTUP, 'sub', '..', 'x.vbs'), 2)
  test('프로젝트 안 .ENV (대문자)', 'Write', 'C:\\proj\\.ENV', 2)
  test('프로젝트 안 ID_RSA (대문자)', 'Write', 'C:\\proj\\ID_RSA', 2)

  console.log('\n── 윈도우: 개인키·인증 읽기 → exit 2 ──')
  test('Read ~\\.ssh\\id_rsa', 'Read', '~\\.ssh\\id_rsa', 2)
  test('Read <HOME>\\.SSH\\ID_ED25519 (대소문자)', 'Read', path.join(HOME, '.SSH', 'ID_ED25519'), 2)
  test('Read <HOME>\\.AWS\\Credentials (대소문자)', 'Read', path.join(HOME, '.AWS', 'Credentials'), 2)
  test('Read /c/Users/<me>/.aws/credentials (MSYS)', 'Read', `${HOMEM}/.aws/credentials`, 2)
  test('Read ~\\_netrc (윈도우 netrc)', 'Read', '~\\_netrc', 2)
  test('Read %APPDATA%\\gcloud ADC (미확장 변수)', 'Read', '%APPDATA%\\gcloud\\application_default_credentials.json', 2)
  test('Read <APPDATA>\\gcloud\\credentials.db', 'Read', path.join(APPDATA, 'gcloud', 'credentials.db'), 2)
  test('Read 상위 이동 위장 <HOME>\\a\\..\\.ssh\\id_rsa', 'Read', path.join(HOME, 'a') + '\\..\\.ssh\\id_rsa', 2)
  testGrep('Grep path=<HOME>\\.ssh (디렉토리 통째)', W(path.join(HOME, '.ssh')), 2)

  console.log('\n── 윈도우: 허용 (과잉 차단 없음) → exit 0 ──')
  test('Read ~\\.ssh\\id_rsa.PUB (공개키 대소문자)', 'Read', '~\\.ssh\\id_rsa.PUB', 0)
  test('Read ~\\.ssh\\known_hosts', 'Read', '~\\.ssh\\known_hosts', 0)
  test('Write Documents\\PowerShellNotes (접두만 같은 형제 폴더)', 'Write', path.join(HOME, 'Documents', 'PowerShellNotes', 'x.txt'), 0)
  test('Write Startup2 (접두만 같은 형제 폴더)', 'Write', path.join(path.dirname(STARTUP), 'Startup2', 'x.txt'), 0)
  test('Write 프로젝트 안 docs\\.bashrc', 'Write', 'C:\\proj\\docs\\.bashrc', 0)
  test('Read <HOME>\\.bashrc (읽기는 허용)', 'Read', path.join(HOME, '.bashrc'), 0)
  test('Read <APPDATA>\\gcloud\\configurations\\config_default (인증 아님)', 'Read', path.join(APPDATA, 'gcloud', 'configurations', 'config_default'), 0)

  console.log('\n── 윈도우: 이상 경로 → 크래시 없이 판정 ──')
  test('미정의 변수 %BOGUS%\\x → exit 0', 'Write', '%BOGUS%\\x.txt', 0)
  test('드라이브 상대 C:x → exit 0', 'Write', 'C:x.txt', 0)
  test('UNC \\\\srv\\share\\.env → 이름으로 차단(2)', 'Write', '\\\\srv\\share\\.env', 2)
}

console.log('\n── 이상 입력 → 크래시 없이 exit 0 ──')
for (const [desc, stdin] of [['깨진 JSON', '{x'], ['빈 입력', ''], ['null', 'null'], ['tool_input 문자열', JSON.stringify({ tool_name: 'Read', tool_input: 'x' })],
  ['file_path 숫자', JSON.stringify({ tool_name: 'Read', tool_input: { file_path: 7 } })], ['초장문 경로', JSON.stringify({ tool_name: 'Read', tool_input: { file_path: '/a/' + 'b'.repeat(100000) } })]]) {
  const r = spawnSync('node', [HOOK], { input: stdin, encoding: 'utf8', timeout: 5000 })
  const pass = r.status === 0
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (exit ${r.status})`}`)
  pass ? passed++ : failed++
}

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
