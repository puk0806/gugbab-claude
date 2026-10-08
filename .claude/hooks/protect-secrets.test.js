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
