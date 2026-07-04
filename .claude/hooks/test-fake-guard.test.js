#!/usr/bin/env node
/**
 * test-fake-guard.test.js — 가짜 테스트 실행 차단 테스트
 * 실행: node .claude/hooks/test-fake-guard.test.js
 */

const { spawnSync } = require('child_process')
const path = require('path')
const HOOK = path.join(__dirname, 'test-fake-guard.js')

let passed = 0, failed = 0

function test(desc, command, expectedExit) {
  const input = JSON.stringify({
    hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command },
  })
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000 })
  const pass = r.status === expectedExit
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status})`}`)
  pass ? passed++ : failed++
}

console.log('🔍 test-fake-guard 테스트 시작')

console.log('\n── 가짜 테스트 결과 위장 → exit 2 ──')
test('echo 전체 통과 위장', 'echo "All tests passed"', 2)
test('echo 숫자 통과 위장', 'echo "10/10 tests passed"', 2)
test('printf PASS 위장', 'printf "PASS: auth module"', 2)
test('echo 체크마크+숫자', 'echo "✅ 12 cases"', 2)
test('단독 true', 'true', 2)
test('단독 exit 0', 'exit 0', 2)

console.log('\n── 실제 테스트 러너 포함 → exit 0 ──')
test('pnpm test', 'pnpm test', 0)
test('vitest run', 'npx vitest run src/x.test.ts', 0)
test('cargo test', 'cargo test --workspace', 0)
test('러너 + 결과 echo 조합', 'pnpm test && echo "tests passed"', 0)
test('gradlew test', './gradlew test', 0)

console.log('\n── 무해한 echo → exit 0 ──')
test('echo Building', 'echo "Building..."', 0)
test('echo Done', 'echo "Done"', 0)
test('일반 명령', 'ls -al', 0)

console.log('\n── 대상 외 → exit 0 ──')
{
  const input = JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: 'echo "tests passed"' } })
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000 })
  const pass = r.status === 0
  console.log(`  ${pass ? '✅' : '❌'} PostToolUse 이벤트는 검사 안 함 → ${pass ? 'PASS' : 'FAIL'}`)
  pass ? passed++ : failed++
}

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
