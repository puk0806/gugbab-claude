#!/usr/bin/env node
/**
 * tdd-guard.test.js — 소스 수정 시 대응 테스트 파일 존재 검사 테스트
 * 실행: node .claude/hooks/tdd-guard.test.js
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'tdd-guard.js')

let passed = 0, failed = 0

function test(desc, filePath, expectedExit) {
  const input = JSON.stringify({
    hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: filePath },
  })
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000 })
  const pass = r.status === expectedExit
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status})`}`)
  pass ? passed++ : failed++
}

console.log('🔍 tdd-guard 테스트 시작')

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tdd-test-'))
fs.mkdirSync(path.join(tmp, 'src'), { recursive: true })

console.log('\n── 테스트 파일 없는 소스 → exit 2 ──')
fs.writeFileSync(path.join(tmp, 'src', 'orphan.ts'), 'export const x = 1')
test('테스트 없는 .ts', path.join(tmp, 'src', 'orphan.ts'), 2)

console.log('\n── 테스트 파일 있는 소스 → exit 0 ──')
fs.writeFileSync(path.join(tmp, 'src', 'covered.ts'), 'export const y = 2')
fs.writeFileSync(path.join(tmp, 'src', 'covered.test.ts'), 'test')
test('같은 디렉토리 .test.ts 존재', path.join(tmp, 'src', 'covered.ts'), 0)

fs.mkdirSync(path.join(tmp, 'src', '__tests__'), { recursive: true })
fs.writeFileSync(path.join(tmp, 'src', 'nested.ts'), 'export const z = 3')
fs.writeFileSync(path.join(tmp, 'src', '__tests__', 'nested.test.ts'), 'test')
test('__tests__ 하위 테스트 존재', path.join(tmp, 'src', 'nested.ts'), 0)

console.log('\n── 검사 제외 대상 → exit 0 ──')
test('테스트 파일 자체', path.join(tmp, 'src', 'covered.test.ts'), 0)
test('.claude/hooks 파일', '/proj/.claude/hooks/some-hook.js', 0)
test('scripts/ 파일', '/proj/scripts/gen-settings.js', 0)
test('설정 파일 (*.config.ts)', path.join(tmp, 'vite.config.ts'), 0)
test('마크다운 (소스 아님)', path.join(tmp, 'README.md'), 0)
test('file_path 없음', '', 0)

fs.rmSync(tmp, { recursive: true, force: true })

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
