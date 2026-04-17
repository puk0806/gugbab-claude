#!/usr/bin/env node
/**
 * verification-guard.js
 * Claude Code PostToolUse Hook
 *
 * 목적: verification.md 작성 직후 품질 자동 검증
 *
 * 검사 항목:
 *   1. 에이전트 로그에 "내장" 키워드 → 서브에이전트 미호출
 *   2. frontmatter status 필드 누락
 *   3. 필수 8개 섹션 누락
 *   4. 검증 체크박스 전부 [❌] → 체크리스트 미완성
 *
 * 조건: Write 도구로 docs/skills/{category}/{name}/verification.md 경로에 저장할 때만 동작
 */

const readline = require('readline')

const VERIFICATION_PATH_PATTERN = /docs\/skills\/.+\/verification\.md$/

// verification.md 필수 섹션 (VERIFICATION_TEMPLATE.md 기준)
const REQUIRED_SECTIONS = [
  { key: '작업 목록', pattern: /##\s+1\.\s+작업\s+목록|Task\s+List/i },
  { key: '실행 에이전트 로그', pattern: /##\s+2\.\s+실행\s+에이전트\s+로그/i },
  { key: '조사 소스', pattern: /##\s+3\.\s+조사\s+소스/i },
  { key: '검증 체크리스트', pattern: /##\s+4\.\s+검증\s+체크리스트|Test\s+List/i },
  { key: '테스트 진행 기록', pattern: /##\s+5\.\s+테스트\s+진행\s+기록/i },
  { key: '검증 결과 요약', pattern: /##\s+6\.\s+검증\s+결과\s+요약/i },
  { key: '개선 필요 사항', pattern: /##\s+7\.\s+개선\s+필요\s+사항/i },
  { key: '변경 이력', pattern: /##\s+8\.\s+변경\s+이력/i },
]

function validate(content) {
  const errors = []

  // 1. frontmatter status 필드 확인
  if (!/^---[\s\S]+?status:\s*\S+[\s\S]+?---/m.test(content)) {
    errors.push('frontmatter에 status 필드가 없습니다.')
  }

  // 2. 에이전트 로그 "내장" 키워드 감지
  const agentLogMatch = content.match(/##\s+2\.\s+실행\s+에이전트\s+로그([\s\S]*?)(?=\n##\s+|\n---\s*$|$)/i)
  if (agentLogMatch && /내장/.test(agentLogMatch[1])) {
    errors.push(
      '에이전트 로그에 "내장" 키워드가 감지됐습니다.\n' +
      '  → skill-creator는 반드시 Agent 도구로 web-searcher/deep-researcher, fact-checker를 실제 호출해야 합니다.\n' +
      '  → 내장 지식으로 대체하는 것은 금지입니다. 서브에이전트를 호출한 뒤 verification.md를 재작성하세요.'
    )
  }

  // 3. 필수 섹션 누락 확인
  const missingSections = REQUIRED_SECTIONS.filter(({ pattern }) => !pattern.test(content))
  if (missingSections.length > 0) {
    errors.push(
      `필수 섹션 ${missingSections.length}개가 누락됐습니다: ${missingSections.map(s => s.key).join(', ')}\n` +
      '  → docs/skills/VERIFICATION_TEMPLATE.md의 8개 섹션 구조를 그대로 사용하세요.'
    )
  }

  // 4. 검증 체크박스 전부 [❌] 확인 (최소 1개는 ✅ 이어야 함)
  const checkboxes = content.match(/\[([✅❌])\]/g) || []
  const allUnchecked = checkboxes.length > 0 && checkboxes.every(c => c.includes('❌'))
  if (allUnchecked) {
    errors.push(
      '검증 체크리스트가 전부 [❌] 상태입니다.\n' +
      '  → 완료된 항목은 [✅]로 표기하세요.'
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

  // PostToolUse + Write 도구만 처리
  if (eventName !== 'PostToolUse' || tool_name !== 'Write') return process.exit(0)

  const filePath = (tool_input.file_path || '').replace(/\\/g, '/')
  if (!VERIFICATION_PATH_PATTERN.test(filePath)) return process.exit(0)

  const content = tool_input.content || ''
  const errors = validate(content)

  if (errors.length === 0) return process.exit(0)

  const message = [
    `[verification-guard] ❌ verification.md 검증 실패: ${filePath}`,
    '',
    ...errors.map((e, i) => `${i + 1}. ${e}`),
    '',
    '위 문제를 수정한 뒤 verification.md를 재작성하세요.',
  ].join('\n')

  // PostToolUse: stdout 출력 → Claude에게 피드백으로 전달
  process.stdout.write(JSON.stringify({ reason: message }) + '\n')
  process.exit(2) // exit 2 = 오류 신호, Claude가 수정 필요성 인식
}

main().catch(() => process.exit(0))
