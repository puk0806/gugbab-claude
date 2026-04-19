#!/usr/bin/env node
/**
 * skill-md-guard.js
 * Claude Code PostToolUse Hook
 *
 * 목적: SKILL.md 작성 후 구조 검증
 *
 * 대상: Write 도구로 .claude/skills/{category}/{name}/SKILL.md 경로에 저장할 때
 *
 * 검증 항목:
 *   1. YAML frontmatter 존재 (--- 블록)
 *   2. frontmatter에 name: 필드
 *   3. frontmatter에 description: 필드
 *   4. 본문에 > 소스: 줄 존재 (공식 문서 출처)
 *   5. 본문에 > 검증일: 줄 존재
 */

const readline = require('readline')

const SKILL_MD_PATTERN = /\.claude\/skills\/.+\/SKILL\.md$/

function validate(content) {
  const errors = []

  // 1. YAML frontmatter 존재 여부
  const hasFrontmatter = /^---\n[\s\S]*?\n---/.test(content)
  if (!hasFrontmatter) {
    errors.push('YAML frontmatter(--- 블록)가 없습니다.')
  } else {
    // frontmatter 내용 추출
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
    const fm = fmMatch ? fmMatch[1] : ''

    // 2. name: 필드
    if (!/^name\s*:/m.test(fm)) {
      errors.push('frontmatter에 name: 필드가 없습니다.')
    }

    // 3. description: 필드
    if (!/^description\s*:/m.test(fm)) {
      errors.push('frontmatter에 description: 필드가 없습니다.')
    }
  }

  // 4. > 소스: 줄 존재
  if (!/^>\s*소스\s*:/m.test(content)) {
    errors.push('> 소스: 줄이 없습니다. 공식 문서 URL 또는 서적 정보를 명시하세요.')
  }

  // 5. > 검증일: 줄 존재
  if (!/^>\s*검증일\s*:/m.test(content)) {
    errors.push('> 검증일: 줄이 없습니다. (예: > 검증일: 2026-04-17)')
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
  if (!SKILL_MD_PATTERN.test(filePath)) return process.exit(0)

  const content = tool_input.content || ''
  const errors = validate(content)

  if (errors.length === 0) return process.exit(0)

  const message = [
    `[skill-md-guard] SKILL.md 구조 검증 실패: ${filePath}`,
    '',
    ...errors.map((e, i) => `${i + 1}. ${e}`),
    '',
    '위 항목을 추가한 뒤 SKILL.md를 재작성하세요.',
  ].join('\n')

  process.stdout.write(JSON.stringify({ reason: message }) + '\n')
  process.exit(2)
}

main().catch(() => process.exit(0))
