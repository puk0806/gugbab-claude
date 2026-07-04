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
  const pass = r.status === expectedExit
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status})`}`)
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
test('Read 도구', 'Read', '/proj/.env', 0)
test('Bash 도구', 'Bash', '/proj/.env', 0)

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
