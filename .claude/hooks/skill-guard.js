#!/usr/bin/env node
/**
 * skill-guard.js
 * Claude Code PreToolUse Hook
 *
 * 목적: SKILL.md 직접 작성 차단 — skill-creator 에이전트 사용 강제
 *
 * 규칙:
 *   - Write to .claude/skills/{category}/SKILL.md → deny
 *   - 그 외 모든 도구 → null (다른 훅에 위임)
 */

const readline = require('readline')

const SKILL_MD_PATTERN = /\.claude\/skills\/.+\/SKILL\.md$/

function handle(toolName, toolInput) {
  if (toolName !== 'Write') return null

  const filePath = (toolInput.file_path || '').replace(/\\/g, '/')
  if (!SKILL_MD_PATTERN.test(filePath)) return null

  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        'SKILL.md는 직접 작성할 수 없습니다. skill-creator 에이전트를 사용하세요.',
    },
  }
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  raw = raw.trim()

  if (!raw) return process.exit(0)

  let input
  try { input = JSON.parse(raw) } catch { return process.exit(0) }

  const { tool_name, tool_input = {} } = input
  const result = handle(tool_name, tool_input)
  if (result) process.stdout.write(JSON.stringify(result) + '\n')

  process.exit(0)
}

main().catch(() => process.exit(0))
