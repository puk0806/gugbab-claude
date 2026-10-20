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
 *   - 2026-10-16 계획서 12장: ArtifactData(삭제만 확인)·ArtifactComments·PushNotification·ExitWorktree·TaskStop·LSP 자동,
 *     CronCreate·CronDelete·RemoteTrigger·DesignSync·PowerShell·Google Drive update_file 확인
 *   - 2026-10-20 결정 40: SendMessage 자동 — 받는 세션이 내용을 보고 진행 여부를 확인한다
 *   - 래퍼 설정 폴더의 projects/·plans/ 링크는 실제 위치(~/.claude)로 따라가 판정
 *
 * 자동 승인하지 않는 것 (정적 검사 불가 셸 — 승인하면 bash-guard 검사 전체를 우회한다):
 *   - Bash → bash-guard.js 전담 (변수로 만든 명령 등 판정 불가 Bash 는 bash-guard 가 null → 사용자 확인)
 *   - PowerShell → 분석기 없음 → 확인
 * 홈 설정 파일 쓰기·개인키 읽기 차단(deny)은 protect-secrets.js 담당.
 */

const fs = require('fs')
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
  // 2026-10-16 계획서 12.1 신규 자동 허용 (ArtifactData 는 delete 만 확인 — classify 에서 따로)
  'ArtifactData',
  'ArtifactComments',
  'PushNotification',
  'ExitWorktree',
  'TaskStop',
  'LSP',
  // 2026-10-20 결정 40 — 세션 간 메시지: 받는 세션이 내용을 보고 진행 여부를 확인하므로 보내는 쪽 확인은 중복 (사용자 결정)
  'SendMessage',
])

// 2026-10-16 계획서 12.2 신규 확인 — 예약 실행·외부 동기화처럼 지금 대화 밖으로 영향이 나가는 도구, 분석기 없는 셸
// (SendMessage 는 2026-10-20 결정 40 으로 자동 — 받는 쪽이 확인)
const ASK_TOOLS = new Map([
  ['CronCreate', '예약 실행을 만듭니다'],
  ['CronDelete', '예약 실행을 지웁니다'],
  ['RemoteTrigger', '원격 실행을 시작합니다'],
  ['DesignSync', '외부 디자인 도구와 동기화합니다'],
  ['PowerShell', 'PowerShell 은 명령 분석기가 없습니다'],
])
// 덮어쓰기라 되돌릴 수 없는 MCP 도구 (서버 이름 + 도구 이름)
const MCP_OVERWRITE_RE = /google_drive$/i

// mcp__<서버>__<도구> — 서버·도구 이름이 모두 있어야 한다 ("mcp__" 단독·빈 세그먼트 거부)
const MCP_TOOL_RE = /^mcp__([A-Za-z0-9_.-]+?)__([A-Za-z0-9_.-]+)$/
// MCP 도구 이름 중 되돌릴 수 없거나 외부에 공개하는 동작 (단어 경계: _ - . 또는 양끝)
const MCP_DESTRUCTIVE_RE = /(?:^|[_.-])(?:delete|trash|share|remove|destroy|purge|unpublish|revoke)(?:$|[_.-])/i

const WRITE_TOOLS = new Set(['Write', 'Edit', 'NotebookEdit'])

const HOME = (() => { try { return path.resolve(os.homedir()) } catch { return null } })()
// 프로젝트 밖이지만 Claude Code 가 정상적으로 쓰는 위치 — 메모리(projects/<해시>/memory)·계획 파일
const CLAUDE_WORK_DIRS = HOME ? [path.join(HOME, '.claude', 'projects'), path.join(HOME, '.claude', 'plans')] : []

// 가장 가까운 실제 존재하는 상위 폴더의 실경로 + 나머지 — 링크를 따라간 실제 위치
function realLocation(abs) {
  let cur = abs
  const rest = []
  for (let i = 0; i < 256; i++) {
    try { return path.join(fs.realpathSync(cur), ...rest.reverse()) } catch { /* 없음 → 한 단계 위로 */ }
    const up = path.dirname(cur)
    if (up === cur) return null
    rest.push(path.basename(cur))
    cur = up
  }
  return null
}
const realDirs = (() => {
  let cache = null
  return () => cache || (cache = CLAUDE_WORK_DIRS.map(d => { try { return fs.realpathSync(d) } catch { return d } }))
})()

// 래퍼(gugbab-claude)는 설정 폴더의 projects/·plans/ 를 ~/.claude 쪽으로 링크한다 — 링크를 따라간 실제 위치로 판정한다.
// 이름만 projects 인 진짜 폴더나 CLAUDE_CONFIG_DIR 위장은 실제 위치가 ~/.claude 밖이라 통과하지 못한다
function isClaudeWorkPath(abs) {
  if (CLAUDE_WORK_DIRS.some(d => abs.startsWith(d + path.sep))) return true
  const real = realLocation(abs)
  return !!real && realDirs().some(d => real.startsWith(d + path.sep))
}

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
  if (isClaudeWorkPath(abs)) return true
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

  // ArtifactData — 삭제는 확인. batch 안에 delete 를 섞어 넣는 우회도 확인
  if (toolName === 'ArtifactData' && toolInput && typeof toolInput === 'object') {
    const ops = Array.isArray(toolInput.batch) ? toolInput.batch : []
    if (toolInput.action === 'delete' || ops.some(o => o && typeof o === 'object' && o.action === 'delete')) {
      return { level: 'ask', reason: 'Artifact 저장소 문서 삭제는 되돌릴 수 없어 사용자 확인이 필요합니다.' }
    }
  }

  if (ASK_TOOLS.has(toolName)) {
    return { level: 'ask', reason: `${toolName} — ${ASK_TOOLS.get(toolName)}. 사용자 확인이 필요합니다.` }
  }

  if (SAFE_TOOLS.has(toolName)) return { level: 'allow' }

  const m = MCP_TOOL_RE.exec(toolName)
  if (m) {
    if (MCP_DESTRUCTIVE_RE.test(m[2])) {
      return { level: 'ask', reason: `삭제·공유 계열 MCP 도구(${m[2]})는 사용자 확인이 필요합니다.` }
    }
    if (MCP_OVERWRITE_RE.test(m[1]) && m[2] === 'update_file') {
      return { level: 'ask', reason: 'Google Drive 파일 덮어쓰기(update_file)는 되돌릴 수 없어 사용자 확인이 필요합니다.' }
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
