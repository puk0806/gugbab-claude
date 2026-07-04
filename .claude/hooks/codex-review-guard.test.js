#!/usr/bin/env node
/**
 * codex-review-guard.test.js — Codex 리뷰 강제 훅의 스킵 경로 테스트
 * 실행: node .claude/hooks/codex-review-guard.test.js
 * 주의: codex CLI·로그인 상태에 의존하는 차단 경로는 환경 의존적이라 테스트하지 않고,
 *       결정론적인 스킵(통과) 경로만 검증한다.
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'codex-review-guard.js')

let passed = 0, failed = 0

function test(desc, input, expectedExit, cwd, stderrIncludes) {
  const r = spawnSync('node', [HOOK], {
    input: input === null ? '' : JSON.stringify(input),
    encoding: 'utf8', timeout: 10000, cwd,
  })
  let pass = r.status === expectedExit
  if (pass && stderrIncludes) pass = r.stderr.includes(stderrIncludes)
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status}, stderr: ${r.stderr.slice(0, 80)})`}`)
  pass ? passed++ : failed++
}

console.log('🔍 codex-review-guard 테스트 시작 (스킵 경로)')

const noRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'crg-test-'))

test('빈 stdin → exit 0 (스킵)', null, 0, noRepo, 'stdin')
test('Stop 아닌 이벤트 → exit 0 (스킵)', { hook_event_name: 'SessionStart' }, 0, noRepo, '이벤트 아님')
test('git 레포 아님 → exit 0 (스킵)', { hook_event_name: 'Stop' }, 0, noRepo, 'git 레포 아님')

fs.rmSync(noRepo, { recursive: true, force: true })

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
