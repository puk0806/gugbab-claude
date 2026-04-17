#!/usr/bin/env node
/**
 * auto-approve.js
 * Claude Code PreToolUse + PermissionRequest Hook
 *
 * 목적: 안전한 도구 자동 승인으로 불필요한 사용자 확인 마찰 제거
 *
 * PreToolUse:
 *   - 안전한 비-Bash 도구 → allow (Bash는 bash-guard.js가 담당)
 *   - 그 외 → null
 *
 * PermissionRequest:
 *   - 안전한 비-Bash 도구 → allow
 *   - 그 외 → null (bash-guard.js 또는 사용자 확인)
 *
 * 주의: Bash는 이 파일에서 승인하지 않는다. bash-guard.js가 전담한다.
 */

const readline = require('readline')

// Bash 제외 — bash-guard.js가 담당
const SAFE_TOOLS = new Set([
  'Agent',
  'Read',
  'Write',
  'Edit',
  'Glob',
  'Grep',
  'WebSearch',
  'WebFetch',
  'TodoRead',
  'TodoWrite',
  'NotebookRead',
  'NotebookEdit',
  'Task',
])

function approve(eventName) {
  return eventName === 'PermissionRequest'
    ? { hookSpecificOutput: { hookEventName: 'PermissionRequest', decision: { behavior: 'allow' } } }
    : { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow' } }
}

function handle(eventName, toolName) {
  if (!SAFE_TOOLS.has(toolName)) return null
  return approve(eventName)
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  raw = raw.trim()

  if (!raw) return process.exit(0)

  let input
  try { input = JSON.parse(raw) } catch { return process.exit(0) }

  const { hook_event_name, hookEventName, tool_name } = input
  const eventName = hook_event_name || hookEventName

  const result = handle(eventName, tool_name)
  if (result) process.stdout.write(JSON.stringify(result) + '\n')

  process.exit(0)
}

main().catch(() => process.exit(0))
