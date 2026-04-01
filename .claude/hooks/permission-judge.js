#!/usr/bin/env node
/**
 * permission-judge.js
 * Claude Code PreToolUse Hook — 자동 허가 판단기
 *
 * 역할: 각 tool 실행 전 안전 여부를 판단하여
 *       - 안전한 작업 → 자동 승인 (사용자에게 묻지 않음)
 *       - 위험한 작업 → 즉시 차단
 *       - 판단 불명확 → 사용자에게 위임 (기존 동작 유지)
 *
 * 출력 형식:
 *   { "decision": "approve", "reason": "..." }  → 자동 승인
 *   { "decision": "block",   "reason": "..." }  → 차단
 *   (아무것도 출력 안 함)                         → 사용자에게 위임
 */

const readline = require('readline')

// ─────────────────────────────────────────────
// 판단 기준 정의
// ─────────────────────────────────────────────

/** 항상 안전한 읽기 전용 도구 */
const READ_ONLY_TOOLS = ['Read', 'Glob', 'Grep', 'WebSearch', 'WebFetch']

/** 내부 상태 도구 (파일시스템 변경 없음) */
const INTERNAL_TOOLS = ['TodoWrite', 'NotebookEdit']

/**
 * Write/Edit 허용 경로 패턴
 * 이 패턴에 매칭되는 경로는 자동 승인
 */
const SAFE_WRITE_PATHS = [
  /\/.claude\/(agents|skills|rules|hooks)\//,    // Claude 에이전트/스킬/규칙
  /\/docs\/(agents|skills|hooks)\//,             // 문서
  /\/(README|CLAUDE)\.md$/,                      // 루트 문서
  /\/SKILL\.md$/,                                // 스킬 파일
  /\/verification\.md$/,                         // 검증 문서
  /\/VERIFICATION_TEMPLATE\.md$/,                // 검증 템플릿
]

/**
 * Bash 명령어 — 자동 승인 패턴
 * 읽기 전용이거나 프로젝트 내 안전한 작업
 */
const BASH_APPROVE_PATTERNS = [
  // git 읽기 전용
  { pattern: /^git\s+(status|diff|log|branch|show|remote)/, reason: 'git 읽기 작업' },
  // git 스테이징 (commit 아님)
  { pattern: /^git\s+add\s+/, reason: 'git 파일 스테이징' },
  // 파일 읽기 유틸
  { pattern: /^(ls|ll|cat|head|tail|pwd|which|wc|find)\s/, reason: '파일 읽기 명령어' },
  { pattern: /^(ls|ll|pwd)$/, reason: '디렉토리 확인' },
  // 디렉토리 생성 (프로젝트 내부)
  { pattern: /^mkdir\s+-p\s+.*\/(\.claude|docs|apps|packages)\//, reason: '프로젝트 폴더 생성' },
  // 패키지 스크립트 실행
  { pattern: /^(pnpm|npm)\s+run\s+(lint|typecheck|format|test|build|dev)/, reason: '패키지 스크립트 실행' },
  { pattern: /^(pnpm|npm)\s+test/, reason: '테스트 실행' },
  // 환경 확인
  { pattern: /^(node|npx)\s+--version/, reason: '버전 확인' },
  { pattern: /^(node|npx)\s+.*\.test\.(js|ts)$/, reason: '테스트 파일 실행' },
  // Husky 훅 설정
  { pattern: /^npx\s+husky/, reason: 'Husky 설정' },
  // echo/printf (출력 전용)
  { pattern: /^(echo|printf)\s+/, reason: '텍스트 출력' },
]

/**
 * Bash 명령어 — 즉시 차단 패턴
 * 되돌리기 어렵거나 명백히 위험한 작업
 */
const BASH_DENY_PATTERNS = [
  { pattern: /git\s+push\s+(--force|-f)\b/, reason: 'force push는 히스토리를 덮어씁니다. 직접 실행하세요.' },
  { pattern: /git\s+push\s+.*-f\b/, reason: 'force push 감지. 직접 실행하세요.' },
  { pattern: /rm\s+-rf\s+\/(?!(sessions|tmp|var\/tmp))/, reason: '시스템 루트 삭제는 차단됩니다.' },
  { pattern: /rm\s+-rf\s+\.\.\//,  reason: '상위 디렉토리 삭제는 차단됩니다.' },
  { pattern: /curl\s+.*\|\s*(ba)?sh/, reason: '원격 스크립트 실행(curl|bash)은 차단됩니다.' },
  { pattern: /wget\s+.*\|\s*(ba)?sh/, reason: '원격 스크립트 실행(wget|bash)은 차단됩니다.' },
  { pattern: /chmod\s+777/, reason: '777 권한 설정은 보안 위험입니다.' },
  { pattern: /git\s+reset\s+--hard\s+HEAD~[2-9]\d*/, reason: '10개 이상의 커밋 되돌리기는 위험합니다. 직접 실행하세요.' },
  { pattern: /:\s*\(\)\s*\{.*:\|:.*\}/, reason: 'Fork bomb 패턴 감지. 차단합니다.' },
]

/**
 * Bash 명령어 — 사용자 확인 필요 패턴
 * 안전하지만 의도 확인이 필요한 작업
 */
const BASH_ASK_PATTERNS = [
  /^git\s+push\b/,           // git push (force 제외)
  /^git\s+commit\b/,         // git commit (사용자 명시 요청 시에만)
  /^git\s+reset\b/,          // git reset
  /^git\s+checkout\b/,       // git checkout
  /^git\s+merge\b/,          // git merge
  /^git\s+rebase\b/,         // git rebase
  /^(pnpm|npm)\s+add\s+\S/,  // 새 패키지 설치
  /^(pnpm|npm)\s+install\s+\S/, // npm install <package>
  /^(pnpm|npm)\s+remove\b/,  // 패키지 제거
]

// ─────────────────────────────────────────────
// 판단 로직
// ─────────────────────────────────────────────

function judge(toolName, toolInput) {
  // 1. 읽기 전용 도구 → 항상 승인
  if (READ_ONLY_TOOLS.includes(toolName)) {
    return approve(`${toolName}: 읽기 전용 작업`)
  }

  // 2. 내부 상태 도구 → 항상 승인
  if (INTERNAL_TOOLS.includes(toolName)) {
    return approve(`${toolName}: 내부 상태 변경`)
  }

  // 3. Write / Edit → 경로 기반 판단
  if (toolName === 'Write' || toolName === 'Edit') {
    const filePath = toolInput.file_path || ''
    if (SAFE_WRITE_PATHS.some(p => p.test(filePath))) {
      return approve(`${toolName}: 안전한 프로젝트 경로 (${filePath.split('/').slice(-2).join('/')})`)
    }
    // 프로젝트 내 다른 경로 → 사용자 확인
    return null
  }

  // 4. Bash → 명령어 내용 기반 판단
  if (toolName === 'Bash') {
    return judgeBash(toolInput.command || '')
  }

  // 5. Agent (서브에이전트) → 항상 승인 (에이전트는 자체 권한 관리)
  if (toolName === 'Agent') {
    return approve('서브에이전트 실행')
  }

  // 6. 알 수 없는 도구 → 사용자에게 위임
  return null
}

function judgeBash(command) {
  const cmd = command.trim()

  // 1순위: 차단 패턴 확인 (위험 > 안전)
  for (const { pattern, reason } of BASH_DENY_PATTERNS) {
    if (pattern.test(cmd)) {
      return deny(reason)
    }
  }

  // 2순위: 사용자 확인 패턴 (명시적 위임)
  for (const pattern of BASH_ASK_PATTERNS) {
    if (pattern.test(cmd)) {
      return null // 사용자에게 위임
    }
  }

  // 3순위: 승인 패턴
  for (const { pattern, reason } of BASH_APPROVE_PATTERNS) {
    if (pattern.test(cmd)) {
      return approve(`Bash: ${reason}`)
    }
  }

  // 4순위: 멀티라인 명령어 중 하나라도 위험하면 사용자 확인
  if (cmd.includes('\n') || cmd.includes('&&') || cmd.includes(';')) {
    // 위험 패턴이 없으면 (1순위에서 통과) 사용자에게 위임
    return null
  }

  // 기본: 판단 불명확 → 사용자에게 위임
  return null
}

function approve(reason) {
  return { decision: 'approve', reason }
}

function deny(reason) {
  return { decision: 'block', reason }
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
    // JSON 파싱 실패 → 사용자에게 위임 (안전한 기본값)
    process.exit(0)
  }

  const { tool_name, tool_input = {} } = input
  const decision = judge(tool_name, tool_input)

  if (decision) {
    process.stdout.write(JSON.stringify(decision) + '\n')
  }
  // decision이 null이면 아무것도 출력 안 함 → 사용자에게 위임

  process.exit(0)
}

main().catch(() => process.exit(0))
