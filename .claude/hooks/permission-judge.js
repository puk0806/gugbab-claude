#!/usr/bin/env node
/**
 * permission-judge.js
 * Claude Code PreToolUse + PermissionRequest Hook
 *
 * PreToolUse:
 *   - 안전한 도구 → permissionDecision: "allow" (즉시 승인)
 *   - 위험한 Bash 패턴 → permissionDecision: "deny" (차단)
 *   - 그 외 Bash → 위임 (settings.json allow/deny)
 *
 * PermissionRequest:
 *   - 권한 다이얼로그가 표시되기 직전에 실행
 *   - 안전한 도구 → behavior: "allow" (다이얼로그 없이 자동 승인)
 */

const readline = require('readline')

// PreToolUse에서 자동 승인할 도구 목록 (Bash 제외 — Bash는 별도 패턴 체크)
const AUTO_APPROVE_TOOLS = new Set([
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

// PermissionRequest에서 추가 승인할 도구 목록
// PreToolUse에서 위험 패턴을 이미 차단했으므로 Bash도 여기서 승인
const PERMISSION_REQUEST_APPROVE_TOOLS = new Set([
  ...AUTO_APPROVE_TOOLS,
  'Bash',
])

// 위험한 Bash 패턴
const BASH_DENY_PATTERNS = [
  { pattern: /git\s+push\s+(--force|-f)\b/, reason: 'force push는 히스토리를 덮어씁니다. 직접 실행하세요.' },
  { pattern: /git\s+push\s+.*-f\b/, reason: 'force push 감지. 직접 실행하세요.' },
  { pattern: /rm\s+-rf\s+\/(bin|boot|dev|etc|lib|lib64|proc|root|sbin|sys|usr|var)(\/|$|\s|$)/, reason: '시스템 디렉토리 삭제는 차단됩니다.' },
  { pattern: /rm\s+-rf\s+\/$/, reason: '루트 디렉토리 삭제는 차단됩니다.' },
  { pattern: /rm\s+-rf\s+\/\s/, reason: '루트 디렉토리 삭제는 차단됩니다.' },
  { pattern: /rm\s+-rf\s+\.\.\//, reason: '상위 디렉토리 삭제는 차단됩니다.' },
  { pattern: /curl\s+.*\|\s*(ba)?sh/, reason: '원격 스크립트 실행(curl|bash)은 차단됩니다.' },
  { pattern: /wget\s+.*\|\s*(ba)?sh/, reason: '원격 스크립트 실행(wget|bash)은 차단됩니다.' },
  { pattern: /chmod\s+777/, reason: '777 권한 설정은 보안 위험입니다.' },
  { pattern: /git\s+reset\s+--hard\s+HEAD~[2-9]\d*/, reason: '10개 이상의 커밋 되돌리기는 위험합니다. 직접 실행하세요.' },
  { pattern: /:\s*\(\)\s*\{.*:\|:.*\}/, reason: 'Fork bomb 패턴 감지. 차단합니다.' },
]

function handlePreToolUse(toolName, toolInput) {
  if (AUTO_APPROVE_TOOLS.has(toolName)) {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'allow',
      },
    }
  }

  if (toolName === 'Bash') {
    const cmd = (toolInput.command || '').trim()
    for (const { pattern, reason } of BASH_DENY_PATTERNS) {
      if (pattern.test(cmd)) {
        return {
          hookSpecificOutput: {
            hookEventName: 'PreToolUse',
            permissionDecision: 'deny',
            permissionDecisionReason: reason,
          },
        }
      }
    }
  }

  return null
}

function handlePermissionRequest(toolName) {
  if (PERMISSION_REQUEST_APPROVE_TOOLS.has(toolName)) {
    return {
      hookSpecificOutput: {
        hookEventName: 'PermissionRequest',
        decision: { behavior: 'allow' },
      },
    }
  }
  return null
}

async function readStdin() {
  const rl = readline.createInterface({ input: process.stdin })
  let data = ''
  for await (const line of rl) {
    data += line + '\n'
  }
  return data.trim()
}

async function main() {
  let raw
  try {
    raw = await readStdin()
    if (!raw) process.exit(0)
  } catch {
    process.exit(0)
  }

  let input
  try {
    input = JSON.parse(raw)
  } catch {
    process.exit(0)
  }

  // 입력은 snake_case(hook_event_name), 출력은 camelCase(hookEventName)
  const { hook_event_name, hookEventName, tool_name, tool_input = {} } = input
  const eventName = hook_event_name || hookEventName

  let decision = null
  if (eventName === 'PermissionRequest') {
    decision = handlePermissionRequest(tool_name)
  } else {
    decision = handlePreToolUse(tool_name, tool_input)
  }

  if (decision) {
    process.stdout.write(JSON.stringify(decision) + '\n')
  }

  process.exit(0)
}

main().catch(() => process.exit(0))
