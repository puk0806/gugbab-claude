#!/usr/bin/env node
/**
 * auto-approve.test.js
 * 실행: node .claude/hooks/auto-approve.test.js
 */

const { execSync } = require('child_process')
const path = require('path')
const HOOK = path.join(__dirname, 'auto-approve.js')

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

function getDecision(result, eventName) {
  if (eventName === 'PermissionRequest') {
    return result?.hookSpecificOutput?.decision?.behavior ?? 'null'
  }
  return result?.hookSpecificOutput?.permissionDecision ?? 'null'
}

function test(desc, toolName, toolInput, expected, eventName = 'PreToolUse') {
  const result = runHook(toolName, toolInput, eventName)
  const actual = getDecision(result, eventName)
  const pass = actual === expected
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대: ${expected}, 실제: ${actual})`}`)
  if (!pass) console.log(`     출력: ${JSON.stringify(result)}`)
  pass ? passed++ : failed++
}

function section(title) { console.log(`\n── ${title} ──`) }

console.log('🔍 auto-approve 테스트 시작')

section('PreToolUse — 안전한 비-Bash 도구 → allow')
test('Read', 'Read', { file_path: 'README.md' }, 'allow')
test('Write', 'Write', { file_path: 'README.md' }, 'allow')
test('Edit', 'Edit', { file_path: 'README.md' }, 'allow')
test('Glob', 'Glob', { pattern: '**/*.ts' }, 'allow')
test('Grep', 'Grep', { pattern: 'test' }, 'allow')
test('WebSearch', 'WebSearch', { query: 'DDD' }, 'allow')
test('WebFetch', 'WebFetch', { url: 'https://example.com' }, 'allow')
test('Agent', 'Agent', { task: 'research' }, 'allow')
test('TodoWrite', 'TodoWrite', { todos: [] }, 'allow')

section('PreToolUse — Bash → null (bash-guard.js가 담당)')
test('Bash → null', 'Bash', { command: 'git status' }, 'null')

section('PreToolUse — 알 수 없는 도구 → null')
test('Unknown 도구', 'UnknownTool', {}, 'null')

section('PermissionRequest — 안전한 비-Bash 도구 → allow')
test('Read', 'Read', {}, 'allow', 'PermissionRequest')
test('Write', 'Write', {}, 'allow', 'PermissionRequest')
test('Edit', 'Edit', {}, 'allow', 'PermissionRequest')
test('Agent', 'Agent', {}, 'allow', 'PermissionRequest')
test('WebSearch', 'WebSearch', {}, 'allow', 'PermissionRequest')

section('PermissionRequest — Bash → null (bash-guard.js가 담당)')
test('Bash → null', 'Bash', { command: 'git status' }, 'null', 'PermissionRequest')

console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
