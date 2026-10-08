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

// 2026-10-06 — 설정이 없어 매번 확인 창이 뜨던 도구(C 분류)를 자동 승인으로 이동
section('2026-10-06 추가 도구 → allow (PreToolUse·PermissionRequest 모두)')
for (const tool of ['Skill', 'Monitor', 'Workflow', 'EnterWorktree', 'Artifact', 'ShareOnboardingGuide', 'NotebookEdit']) {
  test(`${tool} (Pre)`, tool, {}, 'allow')
  test(`${tool} (PermissionRequest)`, tool, {}, 'allow', 'PermissionRequest')
}

section('MCP 도구 → allow')
for (const tool of ['mcp__claude_ai_Claude_Docs__batch', 'mcp__claude_ai_Claude_Docs__update', 'mcp__claude_ai_Google_Drive__read_file_content',
  'mcp__claude-in-chrome__computer', 'mcp__plugin_vercel_vercel__authenticate', 'mcp__x__shareholder_report', 'mcp__x__deleted_items_list']) {
  test(`${tool} (Pre)`, tool, {}, 'allow')
  test(`${tool} (PermissionRequest)`, tool, {}, 'allow', 'PermissionRequest')
}

// 2026-10-06 사용자 결정 — 되돌릴 수 없거나 외부에 공개하는 MCP 동작은 확인
section('삭제·공유 계열 MCP·Artifact 삭제 → 확인 (Pre=ask, PermissionRequest=null)')
for (const tool of ['mcp__claude_ai_Claude_Docs__delete', 'mcp__claude_ai_Google_Drive__share_file', 'mcp__claude_ai_Google_Drive__trash_file',
  'mcp__x__remove_member', 'mcp__x__purge-cache', 'mcp__x__REVOKE_TOKEN']) {
  test(`${tool} (Pre)`, tool, {}, 'ask')
  test(`${tool} (PermissionRequest)`, tool, {}, 'null', 'PermissionRequest')
}
test('Artifact action=delete (Pre)', 'Artifact', { action: 'delete', url: 'x' }, 'ask')
test('Artifact action=delete (PermissionRequest)', 'Artifact', { action: 'delete' }, 'null', 'PermissionRequest')
test('Artifact action=publish → 자동', 'Artifact', { action: 'publish' }, 'allow')

section('프로젝트 밖 쓰기 → 확인 / 안쪽·메모리·임시 → 자동')
{
  const os = require('os')
  const HOME = os.homedir()
  test('Write ~/Documents/x.txt (밖)', 'Write', { file_path: `${HOME}/Documents/x.txt` }, 'ask')
  test('Edit /etc/hosts (밖)', 'Edit', { file_path: '/etc/hosts' }, 'ask')
  test('Write ~/.claude/settings.json (전역 설정 — 밖)', 'Write', { file_path: `${HOME}/.claude/settings.json` }, 'ask')
  test('Write 프로젝트 상위로 이동 위장 ../outside.txt', 'Write', { file_path: '../outside.txt' }, 'ask')
  test('Write 밖 (PermissionRequest → 사용자에게)', 'Write', { file_path: `${HOME}/Documents/x.txt` }, 'null', 'PermissionRequest')
  test('Write 프로젝트 안 README.md', 'Write', { file_path: 'README.md' }, 'allow')
  test('Write 메모리 폴더', 'Write', { file_path: `${HOME}/.claude/projects/-x/memory/a.md` }, 'allow')
  test('Write 계획 폴더', 'Write', { file_path: `${HOME}/.claude/plans/p.md` }, 'allow')
  test('Write 임시 폴더', 'Write', { file_path: '/private/tmp/claude-1/a.txt' }, 'allow')
  test('NotebookEdit 밖', 'NotebookEdit', { notebook_path: `${HOME}/Documents/n.ipynb` }, 'ask')
}

section('악성·우회 시도 → null (자동 승인 금지)')
test('PowerShell — 분석기 없는 셸', 'PowerShell', { command: 'Remove-Item -Recurse C:\\' }, 'null')
test('PowerShell (PermissionRequest)', 'PowerShell', {}, 'null', 'PermissionRequest')
test('ExitPlanMode — 사용자 결정으로 자동 (확인은 task-confirm-guard 가 강제)', 'ExitPlanMode', {}, 'allow')
test('ExitPlanMode (PermissionRequest)', 'ExitPlanMode', {}, 'allow', 'PermissionRequest')
test('"mcp__" 단독 — 서버·도구 이름 없음', 'mcp__', {}, 'null')
test('"mcp__server" — 도구 이름 없음', 'mcp__server', {}, 'null')
test('"mcp__server__" — 빈 도구 이름', 'mcp__server__', {}, 'null')
test('"xmcp__a__b" — 접두 위장', 'xmcp__a__b', {}, 'null')
test('"Bash " — 공백 붙인 위장', 'Bash ', {}, 'null')
test('"skill" — 대소문자 위장', 'skill', {}, 'null')
test('"mcp__a__b; rm -rf /" — 이름에 셸 문자', 'mcp__a__b; rm -rf /', {}, 'null')
test('Bash 를 MCP 처럼 보이게 (mcp__x__Bash 는 MCP 도구라 허용, Bash 자체는 아님)', 'Bash', {}, 'null', 'PermissionRequest')

section('이상·경계 입력 → null (크래시 없이)')
{
  const { execSync } = require('child_process')
  const raw = (stdin) => {
    try { return execSync(`node "${HOOK}"`, { input: stdin, encoding: 'utf8', timeout: 3000 }).trim() } catch { return 'CRASH' }
  }
  const cases = [
    ['빈 stdin', ''],
    ['깨진 JSON', '{not json'],
    ['JSON null', 'null'],
    ['배열', '[]'],
    ['tool_name 숫자', JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 42 })],
    ['tool_name 객체', JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: { name: 'Read' } })],
    ['tool_name 누락', JSON.stringify({ hook_event_name: 'PreToolUse' })],
    ['이벤트 누락 (Read)', JSON.stringify({ tool_name: 'Read' })],
    ['다른 이벤트(PostToolUse)', JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Read' })],
    ['초장문 도구 이름', JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'mcp__a__' + 'b'.repeat(100000) + ' x' })],
  ]
  for (const [desc, stdin] of cases) {
    const out = raw(stdin)
    const pass = out === ''
    console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (출력: ${out.slice(0, 120)})`}`)
    pass ? passed++ : failed++
  }
}

console.log(`\n${'─'.repeat(40)}`)
console.log(`결과: ${passed}/${passed + failed} 통과 ${failed > 0 ? `(${failed}개 실패)` : ''}`)
if (failed === 0) console.log('✅ 모든 테스트 통과')
else { console.log('❌ 일부 테스트 실패'); process.exit(1) }
