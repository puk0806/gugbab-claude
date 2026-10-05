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
 *
 * 비차단 경고 (PostToolUse Edit/Write, 2026-09-30):
 *   frontmatter date · 메타 표 `| 검증일 |` · 짝 SKILL.md `> 검증일:` 가 서로 다른 날짜면
 *   additionalContext 로 알린다 (exit 0). 저장 차단 조건은 늘리지 않는다 — 에이전트가 네 곳을
 *   순차 Edit 하는 중간 상태를 막게 되기 때문. 판독은 staleness-check.js 의 함수를 재사용하며,
 *   그 파일이 설치돼 있지 않으면 조용히 생략한다.
 */

const readline = require('readline')
const fs = require('fs')
const path = require('path')

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
      '  → skill-creator(작성 도구 설치 시) 또는 직접 작성하는 경우 모두 반드시 WebSearch/WebFetch로 공식 문서를 직접 조사·교차 검증해야 합니다.\n' +
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

// 날짜 불일치 경고 문자열(없으면 null). 어떤 실패도 저장 흐름을 막지 않는다.
function dateDriftWarning(verifFile) {
  try {
    const { checkDateConsistency, skillMdFor } = require('./staleness-check.js')
    const norm = path.resolve(verifFile).replace(/\\/g, '/')
    const i = norm.lastIndexOf('/docs/skills/')
    if (i < 0) return null
    const root = norm.slice(0, i)
    const rel = path.posix.dirname(norm.slice(i + '/docs/skills/'.length))
    // docs/skills/{category}/{name}/ ↔ .claude/skills/{name}/SKILL.md (1단 — 2026-10-05 평탄화)
    const skillMd = skillMdFor(path.join(root, '.claude', 'skills'), rel.split('/').join(path.sep))
    const problems = checkDateConsistency(verifFile, skillMd, { allowMissing: true })
    if (problems.length === 0) return null
    return `[verification-guard] ⚠️ 검증일 기록 불일치 (경고만, 저장은 완료됨): ${rel}\n` +
      problems.map(p => `  - ${p}`).join('\n') +
      '\n  → 재검증 시 frontmatter date · 메타 표 `| 검증일 |` · SKILL.md `> 검증일:` · 섹션 8 변경 이력을 같은 날짜로 함께 갱신하세요' +
      ' (여러 곳을 순차 수정 중이면 마지막 수정 뒤 이 경고가 사라지는지 확인).'
  } catch { return null }
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
  } else if (eventName === 'PostToolUse' && (tool_name === 'Edit' || tool_name === 'Write')) {
    try { content = fs.readFileSync(tool_input.file_path, 'utf8') } catch { return process.exit(0) }
  } else {
    return process.exit(0)
  }
  if (!content) return process.exit(0)

  // PostToolUse Write 는 Pre 단계가 이미 검증·차단했다 — 여기서는 새 차단 없이 날짜 경고만.
  const errors = eventName === 'PostToolUse' && tool_name === 'Write' ? [] : validate(content)
  if (errors.length === 0) {
    if (eventName === 'PostToolUse') {
      const warn = dateDriftWarning(tool_input.file_path)
      if (warn) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: warn } }))
    }
    return process.exit(0)
  }

  const blocked = eventName === 'PreToolUse'
  const message = [
    `[verification-guard] ❌ verification.md 검증 실패${blocked ? ' — 저장 차단됨' : ''}: ${filePath}`,
    '',
    ...errors.map((e, i) => `${i + 1}. ${e}`),
    '',
    blocked ? '위 문제를 수정한 내용으로 다시 저장하세요.' : '위 문제를 수정한 뒤 verification.md를 재작성하세요.',
  ].join('\n')

  // exit 2 의 메시지 채널은 stderr — PreToolUse: 도구 실행 차단 사유 / PostToolUse: Claude 에게 수정 요구 피드백.
  // (stdout {reason} 단독은 decision:"block" 이 없어 blocking 사유로 쓰이지 않고 유실됨 — 공식 hooks 문서 Exit code 2)
  process.stderr.write(message + '\n')
  process.exit(2)
}

main().catch(() => process.exit(0))
