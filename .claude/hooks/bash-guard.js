#!/usr/bin/env node
/**
 * bash-guard.js
 * Claude Code PreToolUse + PermissionRequest Hook
 *
 * 목적: Bash 명령어 안전 관리
 *
 * PreToolUse:
 *   - 위험한 Bash 패턴 → deny
 *   - 그 외 → null (다른 훅에 위임)
 *
 * PermissionRequest:
 *   - git commit / git push → null (사용자 확인 필요)
 *   - 그 외 Bash → allow
 *   - Bash 외 도구 → null (auto-approve.js에 위임)
 */

const readline = require('readline')

const DENY_PATTERNS = [
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

const REQUIRE_APPROVAL_PATTERNS = [
  /git\s+commit\b/,
  /git\s+push\b/,
]

function handlePreToolUse(toolName, toolInput) {
  if (toolName !== 'Bash') return null

  const cmd = (toolInput.command || '').trim()
  for (const { pattern, reason } of DENY_PATTERNS) {
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

  return null
}

function handlePermissionRequest(toolName, toolInput) {
  if (toolName !== 'Bash') return null

  const cmd = (toolInput.command || '').trim()
  for (const pattern of REQUIRE_APPROVAL_PATTERNS) {
    if (pattern.test(cmd)) return null // 사용자 확인 필요
  }

  return {
    hookSpecificOutput: {
      hookEventName: 'PermissionRequest',
      decision: { behavior: 'allow' },
    },
  }
}

// .claude/ 하위 모니터링 경로 — 변경 시 README 동기화 필요
const README_SYNC_PATHS = ['.claude/hooks/', '.claude/skills/', '.claude/agents/']

function handlePostToolUse(toolName, toolInput) {
  if (toolName !== 'Bash') return null

  const cmd = (toolInput.command || '').trim()

  // rm 또는 mv 가 모니터링 경로를 타겟으로 하는지 확인
  const isDestructiveOrMove = /\brm\b|\bmv\b/.test(cmd)
  const touchesMonitored = README_SYNC_PATHS.some(p => cmd.includes(p))

  if (isDestructiveOrMove && touchesMonitored) {
    return {
      decision: 'block',
      reason: 'README.md 동기화 필요: .claude/ 경로 파일이 삭제·이동됐습니다. 프로젝트 구조도·목록·스킬 수를 README.md에 즉시 반영하세요.',
    }
  }

  return null
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

  const result = eventName === 'PermissionRequest'
    ? handlePermissionRequest(tool_name, tool_input)
    : eventName === 'PostToolUse'
      ? handlePostToolUse(tool_name, tool_input)
      : handlePreToolUse(tool_name, tool_input)

  if (result) process.stdout.write(JSON.stringify(result) + '\n')

  process.exit(0)
}

main().catch(() => process.exit(0))
