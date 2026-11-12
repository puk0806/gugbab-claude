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
  // 메시지 채널 단언 — PreToolUse·PostToolUse 모두 exit 2 시 Claude 에게 가는 것은 stderr.
  // (PostToolUse 에서 stdout JSON 은 decision:"block" 이 있어야만 reason 이 쓰이므로 {reason} 단독은 유실)
  const TAG = '[agent-md-guard]'
  const out = r.stdout || '', err = r.stderr || ''
  let chanErr = ''
  if (expectedExit === 2) {
    if (!err.includes(TAG)) chanErr = 'stderr 에 차단 사유 없음'
    else if (out.includes(TAG)) chanErr = 'stdout 에 차단 사유가 섞임'
  } else if (out.includes(TAG) || err.includes(TAG)) {
    chanErr = '통과인데 차단 사유 출력'
  }
  const pass = r.status === expectedExit && !chanErr
  console.log(`  ${pass ? '✅' : '❌'} ${desc} → ${pass ? 'PASS' : `FAIL (기대 exit ${expectedExit}, 실제 ${r.status}${chanErr ? ', ' + chanErr : ''})`}`)
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
test('model: claude-fable-5-2 (현행 fable 티어, 2026-11-09 출시)', AGENT_PATH, validAgent('claude-fable-5-2'), 0)
test('model: claude-fable-5-1 (구세대 — 레거시 대응용 허용)', AGENT_PATH, validAgent('claude-fable-5-1'), 0)
test('model: claude-opus-5-5 (현행 Opus)', AGENT_PATH, validAgent('claude-opus-5-5'), 0)
test('model: claude-fable-5 (구세대 — 레거시 대응용 허용)', AGENT_PATH, validAgent('claude-fable-5'), 0)
test('model: claude-opus-5 (구세대 — 레거시 대응용 허용)', AGENT_PATH, validAgent('claude-opus-5'), 0)
test('model: claude-sonnet-5-5 (현행 Sonnet)', AGENT_PATH, validAgent('claude-sonnet-5-5'), 0)
test('model: claude-haiku-5-5 (현행 Haiku)', AGENT_PATH, validAgent('claude-haiku-5-5'), 0)
test('model: haiku (별칭)', AGENT_PATH, validAgent('haiku'), 0)
test('model: inherit (공식 유효값 — 메인 대화 모델 사용)', AGENT_PATH, validAgent('inherit'), 0)
test('model: "claude-sonnet-5-5" (따옴표 감싼 값)', AGENT_PATH, validAgent('"claude-sonnet-5-5"'), 0)
test('model: claude-sonnet-5 (구세대 — 레거시 대응용 허용)', AGENT_PATH, validAgent('claude-sonnet-5'), 0)
test('model: claude-opus-4-8 (구세대 — 레거시 대응용 허용)', AGENT_PATH, validAgent('claude-opus-4-8'), 0)
test('model: claude-opus-4-6 (구세대 — 레거시 대응용 허용)', AGENT_PATH, validAgent('claude-opus-4-6'), 0)
test('model: claude-opus-4-7 (구세대 — 레거시 대응용 허용)', AGENT_PATH, validAgent('claude-opus-4-7'), 0)
test('model: claude-sonnet-4-6 (구세대 — 레거시 대응용 허용)', AGENT_PATH, validAgent('claude-sonnet-4-6'), 0)
test('model: claude-haiku-4-5 (구세대 — 레거시 대응용 허용)', AGENT_PATH, validAgent('claude-haiku-4-5'), 0)
test('model: claude-haiku-4-5-20251001 (구세대 날짜 고정판 — 레거시 대응용 허용)', AGENT_PATH, validAgent('claude-haiku-4-5-20251001'), 0)

console.log('\n── 구조 위반 → exit 2 ──')
test('frontmatter 없음', AGENT_PATH, '# 제목뿐인 파일', 2)
test('model 필드 없음', AGENT_PATH, '---\nname: x\ndescription: y\ntools:\n  - Read\n---\n<example>a</example>', 2)
test('유효하지 않은 model (gpt-4)', AGENT_PATH, validAgent('gpt-4'), 2)
// CRLF 줄바꿈 (윈도우 autocrlf 체크아웃, 2026-10-20) — LF 와 같은 판정
test('model: sonnet (CRLF) → 통과', AGENT_PATH, validAgent('sonnet').replace(/\n/g, '\r\n'), 0)
test('유효하지 않은 model (CRLF, gpt-4) → 그래도 차단', AGENT_PATH, validAgent('gpt-4').replace(/\n/g, '\r\n'), 2)
test('model 필드 없음 (CRLF) → 차단', AGENT_PATH, '---\r\nname: x\r\ndescription: y\r\ntools:\r\n  - Read\r\n---\r\n<example>a</example>', 2)
test('실존하지 않는 model (claude-sonnet-4-7)', AGENT_PATH, validAgent('claude-sonnet-4-7'), 2)
test('날짜 접미사 위조 model (claude-opus-5-5-20260901)', AGENT_PATH, validAgent('claude-opus-5-5-20260901'), 2)
test('fable 별칭 불허 (fable)', AGENT_PATH, validAgent('fable'), 2)
// Fable 5.2 ID 위조·경계 (2026-11-11) — 없는 세대·날짜 접미사·Mythos(검증 조직 전용, 이 레포 문서에 없음)·공백 섞기는 차단
test('날짜 접미사 위조 model (claude-fable-5-2-20261109)', AGENT_PATH, validAgent('claude-fable-5-2-20261109'), 2)
test('없는 세대 model (claude-fable-5-3)', AGENT_PATH, validAgent('claude-fable-5-3'), 2)
test('Mythos 5.2 는 문서에 없어 차단 (claude-mythos-5-2)', AGENT_PATH, validAgent('claude-mythos-5-2'), 2)
test('대소문자 변형 model (Claude-Fable-5-2)', AGENT_PATH, validAgent('Claude-Fable-5-2'), 2)
test('중간 공백 model (claude-fable- 5-2)', AGENT_PATH, validAgent('claude-fable- 5-2'), 2)
test('대소문자 변형 model (Claude-Opus-5-5)', AGENT_PATH, validAgent('Claude-Opus-5-5'), 2)
test('은퇴된 model (claude-sonnet-4-20250514)', AGENT_PATH, validAgent('claude-sonnet-4-20250514'), 2)
test('은퇴된 model (claude-3-haiku-20240307)', AGENT_PATH, validAgent('claude-3-haiku-20240307'), 2)
test('은퇴된 model (claude-opus-4-20250514)', AGENT_PATH, validAgent('claude-opus-4-20250514'), 2)
// 새 ID 위조·경계 (2026-11-06) — 현행 ID 를 흉내낸 값은 모두 차단
test('날짜 접미사 위조 model (claude-sonnet-5-5-20260928)', AGENT_PATH, validAgent('claude-sonnet-5-5-20260928'), 2)
test('날짜 접미사 위조 model (claude-haiku-5-5-20261007)', AGENT_PATH, validAgent('claude-haiku-5-5-20261007'), 2)
test('실존하지 않는 model (claude-haiku-5)', AGENT_PATH, validAgent('claude-haiku-5'), 2)
test('실존하지 않는 model (claude-sonnet-5-6)', AGENT_PATH, validAgent('claude-sonnet-5-6'), 2)
test('대소문자 변형 model (Claude-Sonnet-5-5)', AGENT_PATH, validAgent('Claude-Sonnet-5-5'), 2)
test('대소문자 변형 별칭 (Inherit)', AGENT_PATH, validAgent('Inherit'), 2)
test('공급자 접두사 model (anthropic.claude-haiku-5-5 — Bedrock ID)', AGENT_PATH, validAgent('anthropic.claude-haiku-5-5'), 2)
test('[1m] 접미사 model (claude-sonnet-5-5[1m])', AGENT_PATH, validAgent('claude-sonnet-5-5[1m]'), 2)
test('경로 조작 문자열 model (../claude-opus-5-5)', AGENT_PATH, validAgent('../claude-opus-5-5'), 2)
test('빈 따옴표 model ("")', AGENT_PATH, validAgent('""'), 2)
test('초장문 model (claude-opus-5-5 + 5000자)', AGENT_PATH, validAgent('claude-opus-5-5' + 'x'.repeat(5000)), 2)
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

console.log('\n── agent-design.md ↔ VALID_MODELS 동기화 ──')
{
  const RULES = path.join(__dirname, '..', 'rules', 'agent-design.md')
  const hookSrc = fs.readFileSync(HOOK, 'utf8')
  const docSrc = fs.readFileSync(RULES, 'utf8')

  // 훅 소스의 "구세대" 주석 이후 ~ Set 닫는 괄호(])) 사이의 'claude-...' 리터럴만 추출
  const hookLegacyBlockMatch = hookSrc.match(/\/\/\s*아직 서비스되는 구세대[\s\S]*?\]\)/)
  const hookLegacyIds = hookLegacyBlockMatch
    ? Array.from(hookLegacyBlockMatch[0].matchAll(/'(claude-[^']+)'/g)).map(m => m[1]).sort()
    : []

  // 문서의 "구세대 ID를 ... 하드코딩하지 말 것" 문단에서 "은 아직 서비스되지만" 앞까지만 추출
  // (같은 문단 뒤쪽의 `claude-opus-5-5`(권장 기본값)는 구세대가 아니므로 제외)
  const docLegacySentenceMatch = docSrc.match(/하드코딩하지 말 것\.\*\*\s*([\s\S]*?)은\s*아직 서비스되지만/)
  const docLegacyIds = docLegacySentenceMatch
    ? Array.from(docLegacySentenceMatch[1].matchAll(/`(claude-[^`]+)`/g)).map(m => m[1]).sort()
    : []

  ok('훅 소스에서 구세대 ID 블록을 찾음', hookLegacyIds.length > 0)
  ok('문서에서 구세대 ID 문장을 찾음', docLegacyIds.length > 0)
  ok(
    `구세대 ID 목록 일치 (훅: [${hookLegacyIds.join(', ')}] ↔ 문서: [${docLegacyIds.join(', ')}])`,
    JSON.stringify(hookLegacyIds) === JSON.stringify(docLegacyIds)
  )

  // 훅 "현행 세대" 블록의 ID 가 문서 모델 표(| 모델 | 최신 ID | ...)의 "최신 ID" 열과 일치하는지
  // (현행 목록만 바꾸고 표를 안 고치는 드리프트, 또는 그 반대를 잡는다 — 2026-11-06)
  const hookCurrentBlockMatch = hookSrc.match(/\/\/\s*현행 세대[\s\S]*?\/\/\s*아직 서비스되는 구세대/)
  const hookCurrentIds = hookCurrentBlockMatch
    ? Array.from(hookCurrentBlockMatch[0].replace(/\/\/.*$/gm, '').matchAll(/'(claude-[^']+)'/g)).map(m => m[1]).sort()
    : []
  const docTableIds = Array.from(docSrc.matchAll(/^\|[^|\n]+\|\s*`(claude-[^`]+)`\s*\|/gm)).map(m => m[1]).sort()
  ok('훅 소스에서 현행 ID 블록을 찾음', hookCurrentIds.length > 0)
  ok(
    `현행 ID 목록 일치 (훅: [${hookCurrentIds.join(', ')}] ↔ 문서 표: [${docTableIds.join(', ')}])`,
    JSON.stringify(hookCurrentIds) === JSON.stringify(docTableIds)
  )

  // 문서에 등장하는 모든 claude-* ID(백틱 표기)가 훅의 VALID_MODELS 전체 집합에 존재하는지
  // (문서가 훅이 거부할 ID를 "사용 가능"인 것처럼 잘못 안내하는 드리프트를 잡는다)
  const setBlockMatch = hookSrc.match(/const VALID_MODELS = new Set\(\[([\s\S]*?)\]\)/)
  const allValidModels = setBlockMatch
    ? new Set(Array.from(setBlockMatch[1].matchAll(/'([^']+)'/g)).map(m => m[1]))
    : new Set()
  const allDocIds = Array.from(docSrc.matchAll(/`(claude-[a-zA-Z0-9.-]+)`/g)).map(m => m[1])
  const unknownDocIds = allDocIds.filter(id => !allValidModels.has(id))
  ok(
    `문서에 등장하는 모든 claude-* ID가 훅 VALID_MODELS에 존재${unknownDocIds.length ? ` (누락: ${unknownDocIds.join(', ')})` : ''}`,
    unknownDocIds.length === 0
  )
}

function ok(desc, cond) {
  console.log(`  ${cond ? '✅' : '❌'} ${desc}`)
  cond ? passed++ : failed++
}

console.log(`\n결과: ${passed}/${passed + failed} 통과`)
if (failed > 0) { console.log('❌ 일부 테스트 실패'); process.exit(1) }
console.log('✅ 모든 테스트 통과')
