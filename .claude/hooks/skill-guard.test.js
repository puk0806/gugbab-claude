#!/usr/bin/env node
/**
 * skill-guard.test.js
 * 실행: node .claude/hooks/skill-guard.test.js
 */

const { execSync } = require('child_process')
const path = require('path')
const HOOK = path.join(__dirname, 'skill-guard.js')

let passed = 0, failed = 0

function runHook(toolName, toolInput = {}, eventName = 'PreToolUse') {
  const input = JSON.stringify({ hook_event_name: eventName, tool_name: toolName, tool_input: toolInput })
  try {
    const output = execSync(`echo '${input.replace(/'/g, "\\'")}' | node "${HOOK}"`, {
      encoding: 'utf8', timeout: 3000,
    }).trim()
    return output ? JSON.parse(output) : null
  } catch { return null }
}

function isDenied(result) {
  return result?.hookSpecificOutput?.permissionDecision === 'deny'
}

function test(desc, toolName, toolInput, expectDenied) {
  const result = runHook(toolName, toolInput)
  const actual = isDenied(result)
  const pass = actual === expectDenied
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대: ${expectDenied ? 'deny' : 'pass'}, 실제: ${actual ? 'deny' : 'pass'})`}`)
  if (!pass) console.log(`     출력: ${JSON.stringify(result)}`)
  pass ? passed++ : failed++
}

function section(title) { console.log(`\n── ${title} ──`) }

console.log('🔍 skill-guard 테스트 시작')

section('SKILL.md 직접 Write → deny')
test('절대경로 SKILL.md', 'Write', { file_path: '/project/.claude/skills/frontend/react/SKILL.md' }, true)
test('상대경로 SKILL.md', 'Write', { file_path: '.claude/skills/backend/axum/SKILL.md' }, true)
test('중첩 경로 SKILL.md', 'Write', { file_path: '/home/user/.claude/skills/architecture/ddd/SKILL.md' }, true)

section('SKILL.md 외 경로 → pass')
test('verification.md는 통과', 'Write', { file_path: '.claude/skills/frontend/react/verification.md' }, false)
test('에이전트 .md는 통과', 'Write', { file_path: '.claude/agents/domain/test.md' }, false)
test('README.md는 통과', 'Write', { file_path: 'README.md' }, false)
test('다른 도구(Read)는 통과', 'Read', { file_path: '.claude/skills/frontend/react/SKILL.md' }, false)
test('Bash는 통과', 'Bash', { command: 'echo hello' }, false)

console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
