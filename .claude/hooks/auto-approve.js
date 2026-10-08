#!/usr/bin/env node
/**
 * auto-approve.js
 * Claude Code PreToolUse + PermissionRequest Hook
 *
 * 목적: 안전한 도구 자동 승인으로 불필요한 사용자 확인 마찰 제거
 *
 * 판정 (PreToolUse / PermissionRequest 공통 분류):
 *   - 확인 필요(ask) → PreToolUse: permissionDecision 'ask'(확인 창 강제) / PermissionRequest: null(사용자 확인)
 *       · Write·Edit·NotebookEdit 가 프로젝트·허용 폴더 밖 경로 (메모리·계획·임시 폴더는 제외) — 2026-10-06
 *       · 삭제·공유 계열 MCP 도구(delete·trash·share·remove 등)·Artifact 삭제 — 2026-10-06
 *   - 자동 승인(allow) → SAFE_TOOLS 의 비-Bash 도구 + 그 외 MCP 도구(mcp__<서버>__<도구>) — 2026-10-06
 *   - 그 외 → null (다른 훅 또는 사용자 확인)
 *
 * 자동 승인하지 않는 것 (정적 검사 불가 셸 — 승인하면 bash-guard 검사 전체를 우회한다):
 *   - Bash → bash-guard.js 전담 (변수로 만든 명령 등 판정 불가 Bash 는 bash-guard 가 null → 사용자 확인)
 *   - PowerShell → 분석기 없음
 * 홈 설정 파일 쓰기·개인키 읽기 차단(deny)은 protect-secrets.js 담당.
 */

const os = require('os')
const path = require('path')
const readline = require('readline')
const { getAllowedDirs, isUnderAllowed, isUnderTempDir } = require('./bash-guard.js')

// 공식 도구 표(code.claude.com/docs/en/tools-reference)에서 "Permission required: Yes" 이거나
// 이 하네스에서 자동 승인할 도구. 권한이 원래 불필요한 도구(ToolSearch·TodoWrite 등)는 넣어도 무해하다.
const SAFE_TOOLS = new Set([
  'Agent',
  'Task',           // Agent 의 구 이름 — 구버전 Claude Code 호환
  'Read',
  'Write',
  'Edit',
  'Glob',
  'Grep',
  'WebSearch',
  'WebFetch',
  'TodoWrite',
  'NotebookEdit',
  // 2026-10-06 추가 — 설정이 없어 매번 확인 창이 뜨던 도구
  'Skill',
  'Monitor',
  'Workflow',       // 도구 자체가 사용자 명시 요청 시에만 호출 — 확인 창은 중복 (사용자 결정)
  'EnterWorktree',
  'Artifact',
  'ShareOnboardingGuide',
  // 계획 승인 버튼 — 사용자 결정(2026-10-06): 계획 확인은 task-confirm-guard 가 "진행할까요?" 절차로 강제하므로 자동
  'ExitPlanMode',
])

// mcp__<서버>__<도구> — 서버·도구 이름이 모두 있어야 한다 ("mcp__" 단독·빈 세그먼트 거부)
const MCP_TOOL_RE = /^mcp__([A-Za-z0-9_.-]+?)__([A-Za-z0-9_.-]+)$/
// MCP 도구 이름 중 되돌릴 수 없거나 외부에 공개하는 동작 (단어 경계: _ - . 또는 양끝)
const MCP_DESTRUCTIVE_RE = /(?:^|[_.-])(?:delete|trash|share|remove|destroy|purge|unpublish|revoke)(?:$|[_.-])/i

const WRITE_TOOLS = new Set(['Write', 'Edit', 'NotebookEdit'])

const HOME = (() => { try { return path.resolve(os.homedir()) } catch { return null } })()
// 프로젝트 밖이지만 Claude Code 가 정상적으로 쓰는 위치 — 메모리(projects/<해시>/memory)·계획 파일
const CLAUDE_WORK_DIRS = HOME ? [path.join(HOME, '.claude', 'projects'), path.join(HOME, '.claude', 'plans')] : []

function writeTargetOf(toolInput) {
  if (!toolInput || typeof toolInput !== 'object') return null
  const p = toolInput.file_path || toolInput.notebook_path || toolInput.path
  return typeof p === 'string' && p ? p : null
}

// 쓰기 경로가 프로젝트·허용 폴더 안인가 (판정 불가 → false = 확인)
function isWriteInsideAllowed(filePath, cwd) {
  if (typeof filePath !== 'string' || !filePath) return false
  let v = filePath
  if (HOME && (v === '~' || v.startsWith('~/'))) v = HOME + v.slice(1)
  let abs
  try { abs = path.resolve(cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd(), v) } catch { return false }
  if (isUnderTempDir(abs)) return true
  if (CLAUDE_WORK_DIRS.some(d => abs.startsWith(d + path.sep))) return true
  return isUnderAllowed(abs, getAllowedDirs(cwd))
}

// 반환: { level: 'allow'|'ask', reason } | null
function classify(toolName, toolInput, cwd) {
  if (typeof toolName !== 'string' || !toolName) return null

  if (WRITE_TOOLS.has(toolName)) {
    const target = writeTargetOf(toolInput)
    if (target && !isWriteInsideAllowed(target, cwd)) {
      return { level: 'ask', reason: `프로젝트·허용 폴더 밖 파일 수정(${target})은 사용자 확인이 필요합니다.` }
    }
    return { level: 'allow' }
  }

  if (toolName === 'Artifact' && toolInput && typeof toolInput === 'object' && toolInput.action === 'delete') {
    return { level: 'ask', reason: 'Artifact 삭제는 되돌릴 수 없어 사용자 확인이 필요합니다.' }
  }

  if (SAFE_TOOLS.has(toolName)) return { level: 'allow' }

  const m = MCP_TOOL_RE.exec(toolName)
  if (m) {
    if (MCP_DESTRUCTIVE_RE.test(m[2])) {
      return { level: 'ask', reason: `삭제·공유 계열 MCP 도구(${m[2]})는 사용자 확인이 필요합니다.` }
    }
    return { level: 'allow' }
  }
  return null
}

function handle(eventName, toolName, toolInput, cwd) {
  if (eventName !== 'PreToolUse' && eventName !== 'PermissionRequest') return null
  const c = classify(toolName, toolInput, cwd)
  if (!c) return null
  if (eventName === 'PermissionRequest') {
    return c.level === 'allow'
      ? { hookSpecificOutput: { hookEventName: 'PermissionRequest', decision: { behavior: 'allow' } } }
      : null // 확인 필요 → 사용자에게 넘김
  }
  return c.level === 'allow'
    ? { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow' } }
    : { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'ask', permissionDecisionReason: `auto-approve: ${c.reason}` } }
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  raw = raw.trim()

  if (!raw) return process.exit(0)

  let input
  try { input = JSON.parse(raw) } catch { return process.exit(0) }
  if (!input || typeof input !== 'object') return process.exit(0)

  const { hook_event_name, hookEventName, tool_name, tool_input, cwd } = input
  const eventName = hook_event_name || hookEventName

  const result = handle(eventName, tool_name, tool_input, typeof cwd === 'string' ? cwd : undefined)
  if (result) process.stdout.write(JSON.stringify(result) + '\n')

  process.exit(0)
}

if (require.main === module) {
  main().catch(() => process.exit(0))
} else {
  module.exports = { classify, handle, isWriteInsideAllowed }
}
