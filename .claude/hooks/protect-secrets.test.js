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

// ── 2026-11-06 감사: Grep 은 path 만 보던 문제 — 인증 폴더 통째·glob 패턴으로 개인키를 뒤질 수 있었다 ──
function testGrepIn(desc, ti, expectedExit) {
  const r = spawnSync('node', [HOOK], { input: JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Grep', tool_input: { pattern: 'x', ...ti } }), encoding: 'utf8', timeout: 5000 })
  const err = r.stderr || ''
  const pass = r.status === expectedExit && (expectedExit === 2 ? err.includes('[protect-secrets]') : !err.includes('[protect-secrets]'))
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status})`}`)
  pass ? passed++ : failed++
}
console.log('\n── Grep 인증 폴더·glob (악성 → exit 2) ──')
testGrepIn('Grep path=~/.aws (틸드, 인증 폴더 통째)', { path: '~/.aws' }, 2)
testGrepIn('Grep path=<HOME>/.aws', { path: `${HOME}/.aws` }, 2)
testGrepIn('Grep path=<HOME>/.kube', { path: `${HOME}/.kube` }, 2)
testGrepIn('Grep path=<HOME>/.config (gh·gcloud 인증 포함)', { path: `${HOME}/.config` }, 2)
testGrepIn('Grep path=<HOME>/.config/gh', { path: `${HOME}/.config/gh` }, 2)
testGrepIn('Grep path=<HOME>/.claude (.credentials.json 포함)', { path: `${HOME}/.claude` }, 2)
testGrepIn('Grep path=~ + glob **/.ssh/*', { path: '~', glob: '**/.ssh/*' }, 2)
testGrepIn('Grep glob *.pem (path 없음)', { glob: '*.pem' }, 2)
testGrepIn('Grep glob *.{pem,key} (중괄호)', { glob: '*.{pem,key}' }, 2)
testGrepIn('Grep glob **/id_rsa*', { glob: '**/id_rsa*' }, 2)
testGrepIn('Grep glob **/.aws/**', { path: HOME, glob: '**/.aws/**' }, 2)
testGrepIn('Grep glob **/credentials', { glob: '**/credentials' }, 2)
testGrepIn('Grep glob .git-credentials', { path: HOME, glob: '.git-credentials' }, 2)
testGrepIn('Grep glob .npmrc (홈)', { path: HOME, glob: '.npmrc' }, 2)
testGrepIn('Grep glob 대문자 *.PEM', { glob: '*.PEM' }, 2)
testGrepIn('Grep path=~/.ssh/../.aws (상위 이동 위장)', { path: '~/.ssh/../.aws' }, 2)

console.log('\n── Grep 정상 (exit 0) ──')
testGrepIn('Grep path=<HOME> (홈 전체, glob 없음)', { path: HOME }, 0)
testGrepIn('Grep glob *.ts', { glob: '*.ts' }, 0)
testGrepIn('Grep glob **/*.{js,json}', { path: '/proj', glob: '**/*.{js,json}' }, 0)
testGrepIn('Grep glob *.keystore.md (key 접두만 같음)', { glob: '*.keystore.md' }, 0)
testGrepIn('Grep path=<HOME>/.claude/projects (메모리 검색)', { path: `${HOME}/.claude/projects` }, 0)
testGrepIn('Grep path=<HOME>/.config/nvim (인증 아님)', { path: `${HOME}/.config/nvim` }, 0)

console.log('\n── Grep 이상 입력 (exit 0, 크래시 없음) ──')
testGrepIn('glob 숫자', { glob: 7 }, 0)
testGrepIn('glob 빈 문자열', { glob: '' }, 0)
testGrepIn('glob 초장문', { glob: '*.' + 'a'.repeat(100000) }, 0)

console.log('\n── 추가 홈 인증 파일 읽기 (악성 → exit 2) ──')
test('Read ~/.git-credentials', 'Read', `${HOME}/.git-credentials`, 2)
test('Read ~/.config/gh/hosts.yml', 'Read', `${HOME}/.config/gh/hosts.yml`, 2)
test('Read ~/.npmrc', 'Read', `${HOME}/.npmrc`, 2)
test('Read ~/.claude/.credentials.json', 'Read', `${HOME}/.claude/.credentials.json`, 2)
test('Read ~/.npmrc (틸드)', 'Read', '~/.npmrc', 2)
console.log('\n── 추가 항목 주변 정상 (exit 0) ──')
test('Read 프로젝트 .npmrc (홈 아님)', 'Read', '/proj/.npmrc', 0)
test('Read ~/.config/gh/config.yml (토큰 아님)', 'Read', `${HOME}/.config/gh/config.yml`, 0)
test('Read ~/.claude/settings.json', 'Read', `${HOME}/.claude/settings.json`, 0)

console.log('\n── 입력을 못 읽으면 차단 (다른 보안 훅과 같게 — 예전엔 exit 0 통과) ──')
for (const [desc, stdin] of [['깨진 JSON', '{x'], ['빈 입력', ''], ['null', 'null'], ['JSON 배열', '[]'], ['숫자', '42']]) {
  const r = spawnSync('node', [HOOK], { input: stdin, encoding: 'utf8', timeout: 5000 })
  const pass = r.status === 2 && (r.stderr || '').includes('입력(JSON)을 읽지 못해')
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → exit 2 → ${pass ? 'PASS' : `FAIL (exit ${r.status})`}`)
  pass ? passed++ : failed++
}

console.log('\n── 이상 입력 (객체) → 크래시 없이 exit 0 ──')
for (const [desc, stdin] of [['tool_input 문자열', JSON.stringify({ tool_name: 'Read', tool_input: 'x' })],
  ['file_path 숫자', JSON.stringify({ tool_name: 'Read', tool_input: { file_path: 7 } })], ['초장문 경로', JSON.stringify({ tool_name: 'Read', tool_input: { file_path: '/a/' + 'b'.repeat(100000) } })]]) {
  const r = spawnSync('node', [HOOK], { input: stdin, encoding: 'utf8', timeout: 5000 })
  const pass = r.status === 0
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (exit ${r.status})`}`)
  pass ? passed++ : failed++
}

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
