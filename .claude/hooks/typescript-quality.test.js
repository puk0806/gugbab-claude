#!/usr/bin/env node
/**
 * typescript-quality.test.js — tsc 실행 조건 판정 테스트
 * 실행: node .claude/hooks/typescript-quality.test.js
 * 주의: 실제 tsc 실행(느림·네트워크)은 하지 않고, 실행 조건 분기만 검증한다.
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'typescript-quality.js')

let passed = 0, failed = 0

function test(desc, filePath, expectedExit) {
  const input = JSON.stringify({
    hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: filePath },
  })
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 10000 })
  const pass = r.status === expectedExit
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status})`}`)
  pass ? passed++ : failed++
}

console.log('🔍 typescript-quality 테스트 시작')

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tsq-test-'))
fs.mkdirSync(path.join(tmp, 'deep', 'nested'), { recursive: true })
fs.writeFileSync(path.join(tmp, 'deep', 'nested', 'file.ts'), 'const x: number = 1')

console.log('\n── 검사 제외 (tsc 실행 안 함) → exit 0 ──')
test('.js 파일 (대상 아님)', '/proj/src/app.js', 0)
test('.md 파일 (대상 아님)', '/proj/README.md', 0)
test('file_path 없음', '', 0)
test('tsconfig 없는 .ts (상위 5단계 내 미존재)', path.join(tmp, 'deep', 'nested', 'file.ts'), 0)

fs.rmSync(tmp, { recursive: true, force: true })

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
