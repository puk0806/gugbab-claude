#!/usr/bin/env node
/**
 * skill-md-guard.js
 * Claude Code PostToolUse Hook
 *
 * 목적: SKILL.md 구조 검증
 *
 * 이벤트:
 *   PreToolUse Write — tool_input.content 사전 검증. 위반 시 저장 자체를 차단 (exit 2)
 *   PostToolUse Edit — 수정 반영된 파일을 디스크에서 재읽기 검증. 위반 시 수정 요구 (exit 2)
 *
 * 검증 항목:
 *   1. YAML frontmatter 존재 (--- 블록)
 *   2. frontmatter에 name: 필드
 *   3. frontmatter에 description: 필드
 *   4. 본문에 > 소스: 줄 존재 (공식 문서 출처)
 *   5. 본문에 > 검증일: 줄 존재
 *   6. 저장 위치가 1단 `.claude/skills/<name>/SKILL.md` (2026-10-05)
 *      — Claude Code 는 `.claude/skills/<name>/SKILL.md` 만 스킬로 등록한다. 카테고리 폴더로 한 단계 더 중첩하면
 *        저장은 되지만 스킬 목록에 뜨지 않는다(조용한 실패). 이 레포 스킬 184종이 그 상태로 동작해 온 것을 계기로 추가.
 *   7. frontmatter name 이 폴더 이름과 같음 — 다르면 `/폴더명` 이 아닌 다른 이름으로 등록돼 참조가 어긋난다
 */

const readline = require('readline')
const fs = require('fs')

const SKILL_MD_PATTERN = /\.claude\/skills\/.+\/SKILL\.md$/

// 가장 가까운 .claude/skills/ 기준 상대경로 — 정확히 `<name>/SKILL.md` 여야 등록된다 (모노레포 하위
// `apps/web/.claude/skills/<name>/SKILL.md` 도 그 위치 기준 1단이면 정상)
function skillLocation(filePath) {
  const i = filePath.lastIndexOf('/.claude/skills/')
  const rest = i >= 0 ? filePath.slice(i + '/.claude/skills/'.length)
    : filePath.startsWith('.claude/skills/') ? filePath.slice('.claude/skills/'.length) : null
  if (rest === null) return null
  const parts = rest.split('/')
  return { rest, parts, name: parts.length === 2 ? parts[0] : null }
}

function validatePath(filePath) {
  const loc = skillLocation(filePath)
  if (!loc || loc.name) return []
  const name = loc.parts[loc.parts.length - 2]
  return [`저장 위치가 .claude/skills/${loc.rest} 입니다 — Claude Code 는 1단 경로 .claude/skills/<이름>/SKILL.md 만 스킬로 등록합니다. ` +
    `.claude/skills/${name}/SKILL.md 로 저장하세요 (카테고리는 폴더가 아니라 짝 검증 문서 docs/skills/<카테고리>/${name}/ 위치로 표시).`]
}

function validateName(filePath, content) {
  const loc = skillLocation(filePath)
  if (!loc || !loc.name) return []
  const fm = (content.match(/^---\n([\s\S]*?)\n---/) || [])[1]
  if (fm === undefined) return []
  const m = fm.match(/^name\s*:\s*["']?([^"'\n#]*?)["']?\s*(?:#.*)?$/m)
  if (!m || m[1] === loc.name) return []
  return [`frontmatter name: "${m[1]}" 이 폴더 이름 "${loc.name}" 과 다릅니다 — 스킬은 name 으로 등록되므로 폴더 이름과 맞추세요.`]
}

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

  const filePath = (tool_input.file_path || '').replace(/\\/g, '/')
  if (!SKILL_MD_PATTERN.test(filePath)) return process.exit(0)

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
  const pathErrors = validatePath(filePath)
  if (!content && pathErrors.length === 0) return process.exit(0)

  const errors = [...pathErrors, ...(content ? [...validate(content), ...validateName(filePath, content)] : [])]
  if (errors.length === 0) return process.exit(0)

  const blocked = eventName === 'PreToolUse'
  const message = [
    `[skill-md-guard] SKILL.md 구조 검증 실패${blocked ? ' — 저장 차단됨' : ''}: ${filePath}`,
    '',
    ...errors.map((e, i) => `${i + 1}. ${e}`),
    '',
    blocked ? '위 항목을 포함한 내용으로 다시 저장하세요.' : '위 항목을 추가한 뒤 SKILL.md를 재작성하세요.',
  ].join('\n')

  // exit 2 의 메시지 채널은 stderr — PreToolUse: 도구 실행 차단 사유 / PostToolUse: Claude 에게 수정 요구 피드백.
  // (stdout {reason} 단독은 decision:"block" 이 없어 blocking 사유로 쓰이지 않고 유실됨 — 공식 hooks 문서 Exit code 2)
  process.stderr.write(message + '\n')
  process.exit(2)
}

if (require.main === module) main().catch(() => process.exit(0))
else module.exports = { validate, validatePath, validateName, skillLocation }
