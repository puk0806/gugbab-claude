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

// 프로젝트 내부 .claude/ 모니터링 경로 — 삭제·이동 시 README 동기화 필요
// 셸 구문 단위(statement)로 판단 — node -e "..." 등 인수 내부 문자열은 제외
function postToolUseMonitoredPath(cmd) {
  // 세미콜론·&&·||·개행으로 구분된 개별 구문으로 분리
  const statements = cmd.split(/;|&&|\|\||\n/)
  return statements.some(stmt => {
    const s = stmt.trim()
    // 구문이 rm / mv 로 시작하고, 상대 경로 .claude/(hooks|skills|agents)/ 를 포함
    return /^(rm|mv)\s/.test(s) && /\s\.claude\/(hooks|skills|agents)\//.test(s)
  })
}

function handlePostToolUse(toolName, toolInput) {
  if (toolName !== 'Bash') return null

  const cmd = (toolInput.command || '').trim()

  if (postToolUseMonitoredPath(cmd)) {
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
