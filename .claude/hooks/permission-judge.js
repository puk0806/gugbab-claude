#!/usr/bin/env node
/**
 * permission-judge.js
 * Claude Code PreToolUse Hook — 위험 작업 차단기
 *
 * 역할: settings.json permissions.allow/deny로 처리 안 되는
 *       동적 패턴 기반 위험 작업을 추가로 차단한다.
 *
 * 퍼미션 처리 우선순위:
 *   1. settings.json permissions.allow  → 자동 승인 (사용자 프롬프트 없음)
 *   2. settings.json permissions.deny   → 자동 차단
 *   3. 이 훅 (PreToolUse)               → block 반환 시 차단, 그 외 위임
 *   4. 사용자 프롬프트                   → 최종 결정
 *
 * 출력 형식:
 *   { "decision": "block", "reason": "..." }  → 차단
 *   (아무것도 출력 안 함)                       → 사용자에게 위임
 */

const readline = require('readline')

// ─────────────────────────────────────────────
// 차단 패턴 (동적 판단이 필요한 위험 패턴)
// 정적 패턴은 settings.json permissions.deny에 정의
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// 판단 로직
// ─────────────────────────────────────────────

function judge(toolName, toolInput) {
  if (toolName === 'Bash') {
    const cmd = (toolInput.command || '').trim()
    for (const { pattern, reason } of BASH_DENY_PATTERNS) {
      if (pattern.test(cmd)) {
        return { decision: 'block', reason }
      }
    }
  }
  // 그 외 모든 경우 → settings.json permissions 또는 사용자에게 위임
  return null
}

// ─────────────────────────────────────────────
// 메인 실행
// ─────────────────────────────────────────────

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

  const { tool_name, tool_input = {} } = input
  const decision = judge(tool_name, tool_input)

  if (decision) {
    process.stdout.write(JSON.stringify(decision) + '\n')
  }

  process.exit(0)
}

main().catch(() => process.exit(0))
