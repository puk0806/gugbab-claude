#!/usr/bin/env node
/**
 * agent-md-guard.test.js — 에이전트 MD frontmatter 구조 검증 테스트
 * 실행: node .claude/hooks/agent-md-guard.test.js
 */

const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const HOOK = path.join(__dirname, 'agent-md-guard.js')

let passed = 0, failed = 0

function runTest(desc, toolName, toolInput, expectedExit, eventName = 'PostToolUse') {
  const input = JSON.stringify({
    hook_event_name: eventName, tool_name: toolName, tool_input: toolInput,
  })
  const r = spawnSync('node', [HOOK], { input, encoding: 'utf8', timeout: 5000 })
  const pass = r.status === expectedExit
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status})`}`)
  pass ? passed++ : failed++
}

// Write 검증은 PreToolUse 사전 차단
function test(desc, filePath, content, expectedExit) {
  runTest(desc, 'Write', { file_path: filePath, content }, expectedExit, 'PreToolUse')
}

const AGENT_PATH = '/proj/.claude/agents/research/test-agent.md'

const validAgent = (model) => `---
name: test-agent
description: >
  테스트 에이전트
  <example>사용자: "테스트해줘"</example>
tools:
  - Read
model: ${model}
---

# 역할
`

console.log('🔍 agent-md-guard 테스트 시작')

console.log('\n── 유효한 에이전트 MD → exit 0 ──')
test('model: sonnet', AGENT_PATH, validAgent('sonnet'), 0)
test('model: opus', AGENT_PATH, validAgent('opus'), 0)
test('model: claude-fable-5 (agent-design.md fable 티어)', AGENT_PATH, validAgent('claude-fable-5'), 0)
test('model: claude-opus-4-8', AGENT_PATH, validAgent('claude-opus-4-8'), 0)

console.log('\n── 구조 위반 → exit 2 ──')
test('frontmatter 없음', AGENT_PATH, '# 제목뿐인 파일', 2)
test('model 필드 없음', AGENT_PATH, '---\nname: x\ndescription: y\ntools:\n  - Read\n---\n<example>a</example>', 2)
test('유효하지 않은 model (gpt-4)', AGENT_PATH, validAgent('gpt-4'), 2)
test('example 태그 없음', AGENT_PATH, '---\nname: x\ndescription: y\ntools:\n  - Read\nmodel: sonnet\n---\n본문', 2)
test('tools 필드 없음', AGENT_PATH, '---\nname: x\ndescription: y\nmodel: sonnet\n---\n<example>a</example>', 2)

console.log('\n── Edit — 디스크의 전체 파일을 읽어 검증 ──')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'amg-test-'))
const editDir = path.join(tmp, '.claude', 'agents', 'research')
fs.mkdirSync(editDir, { recursive: true })
const validPath = path.join(editDir, 'valid-agent.md')
const brokenPath = path.join(editDir, 'broken-agent.md')
fs.writeFileSync(validPath, validAgent('sonnet'))
fs.writeFileSync(brokenPath, '# frontmatter 없는 에이전트')
runTest('Edit — 디스크 파일이 유효 → exit 0 (부분 문자열 오탐 없음)',
  'Edit', { file_path: validPath, new_string: '한 줄 수정' }, 0)
runTest('Edit — 디스크 파일이 구조 위반 → exit 2',
  'Edit', { file_path: brokenPath, new_string: '한 줄 수정' }, 2)
runTest('Edit — 파일 없음 → exit 0 (안전장치)',
  'Edit', { file_path: path.join(editDir, 'missing.md'), new_string: 'x' }, 0)
fs.rmSync(tmp, { recursive: true, force: true })

console.log('\n── 대상 외 → exit 0 ──')
test('에이전트 경로 아님', '/proj/docs/agents/readme.md', '# 문서', 0)
test('agents/ 하위 CLAUDE.md (디렉토리 컨텍스트 파일)', '/proj/.claude/agents/CLAUDE.md', '# 컨텍스트 문서', 0)
test('agents/ 하위 카테고리 CLAUDE.md', '/proj/.claude/agents/backend/CLAUDE.md', '# 백엔드 컨텍스트', 0)
test('content 없음 (Write 빈 내용)', AGENT_PATH, '', 0)
runTest('PostToolUse Write → 무시 (사전 차단으로 이동됨)',
  'Write', { file_path: AGENT_PATH, content: '# frontmatter 없음' }, 0, 'PostToolUse')
runTest('PreToolUse Edit → 무시 (사후 검증 담당)',
  'Edit', { file_path: AGENT_PATH, new_string: 'x' }, 0, 'PreToolUse')

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
