#!/usr/bin/env node
/**
 * verification-guard.js
 * Claude Code PostToolUse Hook
 *
 * 목적: verification.md 품질 자동 검증
 *
 * 이벤트:
 *   PreToolUse Write — tool_input.content 사전 검증. 위반 시 저장 자체를 차단 (exit 2)
 *   PostToolUse Edit — 수정 반영된 파일을 디스크에서 재읽기 검증. 위반 시 수정 요구 (exit 2)
 *
 * 검사 항목:
 *   1. 에이전트 로그에 "내장 지식" 구문 → 조사를 내장 지식으로 대체한 자백
 *      ("내장" 단독 매칭은 오탐 — 예: "Python 내장 자료형" 스킬의 정당한 문맥)
 *   2. frontmatter status 필드 누락
 *   3. 필수 8개 섹션 누락
 *   4. 검증 체크박스 전부 [❌] → 체크리스트 미완성
 *   5. status: UNVERIFIED 저장 차단
 */

const readline = require('readline')
const fs = require('fs')

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

  // 2. 에이전트 로그 "내장 지식" 구문 감지 ("내장" 단독은 정당한 문맥 오탐 — 문맥 좁힘)
  const agentLogMatch = content.match(/##\s+2\.\s+실행\s+에이전트\s+로그([\s\S]*?)(?=\n##\s+|\n---\s*$|$)/i)
  if (agentLogMatch && /내장\s*지식/.test(agentLogMatch[1])) {
    errors.push(
      '에이전트 로그에 "내장 지식" 구문이 감지됐습니다.\n' +
      '  → skill-creator는 반드시 WebSearch/WebFetch로 공식 문서를 직접 조사·교차 검증해야 합니다.\n' +
      '  → 내장 지식으로 대체하는 것은 금지입니다. 실제 조사를 수행한 뒤 verification.md를 재작성하세요.'
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

  // 5. UNVERIFIED 상태 저장 차단
  const fmBlock = content.match(/^---\n([\s\S]*?)\n---/m)
  if (fmBlock) {
    const statusMatch = fmBlock[1].match(/^\s*status\s*:\s*(\S+)/m)
    if (statusMatch && statusMatch[1] === 'UNVERIFIED') {
      errors.push(
        'status: UNVERIFIED 상태로 저장할 수 없습니다.\n' +
        '  → verification.md는 최소 PENDING_TEST 이상이어야 합니다.\n' +
        '  → 교차 검증을 완료한 뒤 status: PENDING_TEST로 변경하세요.'
      )
    }
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
  if (!VERIFICATION_PATH_PATTERN.test(filePath)) return process.exit(0)

  // PreToolUse Write: 저장될 전체 내용을 사전 검증 → 위반 시 저장 차단
  // PostToolUse Edit: 파일이 이미 갱신됐으므로 디스크에서 전체 재읽기 검증
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
    `[verification-guard] ❌ verification.md 검증 실패${blocked ? ' — 저장 차단됨' : ''}: ${filePath}`,
    '',
    ...errors.map((e, i) => `${i + 1}. ${e}`),
    '',
    blocked ? '위 문제를 수정한 내용으로 다시 저장하세요.' : '위 문제를 수정한 뒤 verification.md를 재작성하세요.',
  ].join('\n')

  if (blocked) {
    process.stderr.write(message + '\n')       // PreToolUse: stderr + exit 2 → 도구 실행 차단
  } else {
    process.stdout.write(JSON.stringify({ reason: message }) + '\n') // PostToolUse: 수정 요구 피드백
  }
  process.exit(2)
}

main().catch(() => process.exit(0))
