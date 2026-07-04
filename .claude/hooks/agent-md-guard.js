#!/usr/bin/env node
/**
 * agent-md-guard.js
 * Claude Code PreToolUse (Write) + PostToolUse (Edit) Hook
 *
 * 목적: .claude/agents/{category}/{name}.md 저장 시 agent-design.md 규칙 구조 검증
 *   PreToolUse Write — 사전 검증, 위반 시 저장 자체 차단 (exit 2)
 *   PostToolUse Edit — 디스크 전체 재읽기 검증, 위반 시 수정 요구 (exit 2)
 *
 * 검증 항목:
 *   1. YAML frontmatter 존재 (--- 블록)
 *   2. frontmatter에 name: 필드 (kebab-case)
 *   3. frontmatter에 description: 필드
 *   4. frontmatter에 tools: 필드
 *   5. frontmatter에 model: 필드 (opus/sonnet/haiku 계열)
 *   6. description 또는 본문에 <example> 태그 최소 1개
 *
 * 대상: Write/Edit 도구로 .claude/agents/ 하위 .md 파일 저장 시
 */

const readline = require('readline')
const fs = require('fs')

// CLAUDE.md(디렉토리 컨텍스트)·README.md는 에이전트 정의가 아니므로 제외
const AGENT_MD_PATTERN = /\.claude\/agents\/.+\.md$/
const NON_AGENT_BASENAMES = new Set(['CLAUDE.md', 'README.md'])

// 유효한 model 값 (단축명 + 전체 ID) — agent-design.md 모델 표와 동기화
// 'fable' 별칭은 불허 — agent-design.md 규정상 frontmatter에는 전체 ID
// claude-fable-5만 사용 (별칭 해석 미보장)
const VALID_MODELS = new Set([
  'opus', 'sonnet', 'haiku',
  'claude-fable-5',
  'claude-opus-4-6', 'claude-opus-4-7', 'claude-opus-4-8',
  'claude-sonnet-4-6',
  'claude-haiku-4-5', 'claude-haiku-4-5-20251001',
])

function validate(content) {
  const errors = []

  // 1. YAML frontmatter 존재 여부
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) {
    errors.push('YAML frontmatter(--- 블록)가 없습니다.')
    return errors  // frontmatter 없으면 이후 검사 불가
  }

  const fm = fmMatch[1]

  // 2. name: 필드
  if (!/^name\s*:/m.test(fm)) {
    errors.push('frontmatter에 name: 필드가 없습니다. (예: name: my-agent)')
  }

  // 3. description: 필드
  if (!/^description\s*:/m.test(fm)) {
    errors.push('frontmatter에 description: 필드가 없습니다.')
  }

  // 4. tools: 필드
  if (!/^tools\s*:/m.test(fm)) {
    errors.push(
      'frontmatter에 tools: 필드가 없습니다.\n' +
      '  → 필요한 도구만 최소로 명시하세요. (agent-design.md 원칙 참조)'
    )
  }

  // 5. model: 필드 + 유효한 값 확인
  const modelMatch = fm.match(/^model\s*:\s*(\S+)/m)
  if (!modelMatch) {
    errors.push(
      'frontmatter에 model: 필드가 없습니다.\n' +
      '  → opus / sonnet / haiku 중 하나를 지정하세요.'
    )
  } else {
    const model = modelMatch[1].replace(/^['"]|['"]$/g, '')
    if (!VALID_MODELS.has(model)) {
      errors.push(
        `model: "${model}"은 유효하지 않습니다.\n` +
        '  → opus / sonnet / haiku (또는 전체 모델 ID) 중 하나를 사용하세요.\n' +
        '  → 선택 기준: 오케스트레이터 → opus, 검색·코드·검증 → sonnet, 단순 변환 → haiku'
      )
    }
  }

  // 6. <example> 태그 최소 1개
  if (!/<example>/i.test(content)) {
    errors.push(
      'description 또는 본문에 <example> 태그가 없습니다.\n' +
      '  → Claude가 에이전트를 자동 선택하려면 <example>사용자: "..."</example> 태그 2-3개가 필요합니다.'
    )
  }

  return errors
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  raw = raw.trim()

  if (!raw) return process.exit(0)

  let input
  try { input = JSON.parse(raw) } catch { return process.exit(0) }

  const { hook_event_name, hookEventName, tool_name, tool_input = {} } = input
  const eventName = hook_event_name || hookEventName

  const filePath = (tool_input.file_path || '').replace(/\\/g, '/')
  if (!AGENT_MD_PATTERN.test(filePath)) return process.exit(0)
  if (NON_AGENT_BASENAMES.has(filePath.split('/').pop())) return process.exit(0)

  // PreToolUse Write: tool_input.content가 저장될 전체 내용 → 사전 검증, 위반 시 저장 차단
  // PostToolUse Edit: new_string은 파일 *일부*라 그대로 검증하면 오탐 →
  //                   파일이 이미 갱신됐으므로 디스크에서 전체 내용을 읽어 검증
  let content = ''
  if (eventName === 'PreToolUse' && tool_name === 'Write') {
    content = tool_input.content || ''
  } else if (eventName === 'PostToolUse' && tool_name === 'Edit') {
    try { content = fs.readFileSync(tool_input.file_path, 'utf8') } catch { return process.exit(0) }
  } else {
    return process.exit(0)
  }
  if (!content) return process.exit(0)

  const errors = validate(content)
  if (errors.length === 0) return process.exit(0)

  const blocked = eventName === 'PreToolUse'
  const message = [
    `[agent-md-guard] ⚠️  에이전트 파일 구조 검증 실패${blocked ? ' — 저장 차단됨' : ''}: ${filePath}`,
    '',
    ...errors.map((e, i) => `${i + 1}. ${e}`),
    '',
    blocked
      ? '위 항목을 수정한 내용으로 다시 저장하세요. (참조: @.claude/rules/agent-design.md)'
      : '위 항목을 수정하세요. (참조: @.claude/rules/agent-design.md)',
  ].join('\n')

  if (blocked) {
    process.stderr.write(message + '\n')
  } else {
    process.stdout.write(JSON.stringify({ reason: message }) + '\n')
  }
  process.exit(2)
}

main().catch(() => process.exit(0))
