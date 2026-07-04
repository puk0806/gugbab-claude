#!/usr/bin/env node
/**
 * deliverable-guard.js — 산출물 완결성 체크
 * Claude Code PostToolUse (Write/Edit) + PreToolUse (Bash) + Stop Hook
 *
 * 구 readme-guard.js + pending-test-guard.js + session-summary.js(파일 추적) 통합.
 * Stop 훅 스태킹을 줄이기 위해 산출물 관련 검사를 훅 1개로 병합했다.
 *
 * PostToolUse (Write/Edit):
 *   - 수정된 파일 경로를 /tmp/claude-session-{session_id}.json에 누적 기록
 *     (README 검사에서 스킬/에이전트 파일 수정 여부를 세션 단위로 추적하는 용도)
 *
 * PreToolUse (Bash):
 *   - git commit / git push 직전 README.md 동기화 검사
 *     → SKILL.md / agents/*.md / .changeset/*.md 수정 시 README 미업데이트 → deny
 *
 * Stop:
 *   1. README.md 동기화 검사 (위와 동일 조건, staged+unstaged+untracked까지)
 *   2. 오늘 생성·수정된 PENDING_TEST 스킬의 2단계 테스트 미수행 검사
 *      → verification.md 섹션 5에 "수행일" 라인 + 진짜 테스트 흔적 키워드 필요
 *      → "skill-tester 호출 미수행" 등 자백 라인만 있으면 차단
 *   위반 시 exit 2 (세션 종료 차단)
 *
 * 스캔 제외: .claude/worktrees/ (워크트리 잔재 오탐 방지), node_modules/
 * 안전장치: 에러 발생 시 exit 0 (차단 않음)
 *
 * 옵션: --no-readme — README 동기화 검사 비활성화 (PENDING_TEST 검사·세션 추적만 수행).
 *       gen-settings.js가 --readme-guard 미선택 템플릿에 전달 (opt-in 의미 보존)
 */

const readline = require('readline')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execSync } = require('child_process')

// ── 세션 파일 추적 (구 session-summary) ─────────────────────────────

function sessionFilePath(sessionId) {
  return path.join(os.tmpdir(), `claude-session-${sessionId}.json`)
}

function loadSession(sessionId) {
  const fp = sessionFilePath(sessionId)
  if (!fs.existsSync(fp)) return { files: [] }
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')) } catch { return { files: [] } }
}

function saveSession(sessionId, data) {
  try { fs.writeFileSync(sessionFilePath(sessionId), JSON.stringify(data)) } catch {}
}

function recordModifiedFile(sessionId, toolName, toolInput) {
  if (!['Write', 'Edit'].includes(toolName)) return
  const filePath = (toolInput.file_path || '').trim()
  if (!filePath) return
  const session = loadSession(sessionId)
  if (!Array.isArray(session.files)) session.files = []
  if (!session.files.includes(filePath)) session.files.push(filePath)
  saveSession(sessionId, session)
}

// ── README 동기화 검사 (구 readme-guard) ────────────────────────────

function runGit(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
      .split('\n').filter(Boolean)
  } catch { return [] }
}

const SKILL_PATTERN = /\.claude\/skills\/.+\/SKILL\.md$/
const AGENT_PATTERN = /\.claude\/agents\/.+\.md$/
const CHANGESET_PATTERN = /\.changeset\/.+\.md$/

// 루트 README.md 여부 판정 — 하위 패키지·참조 레포 README는 제외
function isRootReadme(filePath) {
  if (!filePath.endsWith('README.md')) return false
  const projectDir = process.env.CLAUDE_PROJECT_DIR
  if (projectDir) {
    return path.normalize(filePath) === path.normalize(path.join(projectDir, 'README.md'))
  }
  const normalized = filePath.replace(/\\/g, '/')
  return !normalized.match(/\/_radix-reference\/|\/node_modules\/|\/packages\/[^/]+\/README|\/apps\/[^/]+\/README|\/docs\/[^/]+\/README/)
}

/**
 * 변경된 감시 대상 파일과 타입을 반환 — README 업데이트됐으면 null
 * stagedOnly=true  → PreToolUse(commit/push): 스테이지된 파일만 검사
 * stagedOnly=false → Stop: 스테이지+미스테이지+미추적 파일까지 검사
 */
function getReadmeViolations(sessionId, stagedOnly = false) {
  const session = loadSession(sessionId)
  const sessionFiles = session.files || []

  // skill/agent: Write/Edit 도구로 기록됨 → session 기반
  const skillAgentFiles = sessionFiles.filter(f => SKILL_PATTERN.test(f) || AGENT_PATTERN.test(f))

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd()
  const toAbs = (files) => files.map(f => path.isAbsolute(f) ? f : path.join(projectDir, f))

  // changeset: Bash(pnpm changeset)로 생성 → git diff로 탐지
  const staged = toAbs(runGit('git diff --staged --name-only'))
  const unstaged = stagedOnly ? [] : toAbs(runGit('git diff --name-only'))
  const untracked = stagedOnly ? [] : toAbs(runGit('git ls-files --others --exclude-standard'))
  const changesetFiles = [...new Set([...staged, ...unstaged, ...untracked])]
    .filter(f => CHANGESET_PATTERN.test(f) && fs.existsSync(f))

  if (skillAgentFiles.length === 0 && changesetFiles.length === 0) return null

  const allGitReadmeFiles = stagedOnly ? staged : [...staged, ...unstaged]
  if (sessionFiles.some(isRootReadme) || allGitReadmeFiles.some(isRootReadme)) return null

  return { skillAgentFiles, changesetFiles }
}

function shortPath(fp) {
  const parts = fp.split('/')
  for (const anchor of ['.claude', 'docs', '.changeset']) {
    const idx = parts.indexOf(anchor)
    if (idx !== -1) return parts.slice(idx).join('/')
  }
  return parts.slice(-3).join('/')
}

function buildFileList(files) {
  const list = files.slice(0, 5).map(f => `  · ${shortPath(f)}`).join('\n')
  const overflow = files.length > 5 ? `\n  ... 외 ${files.length - 5}개` : ''
  return list + overflow
}

function buildReadmeReason(violations, action) {
  const lines = [`[deliverable-guard] README.md 미업데이트 — ${action} 차단`, '']

  if (violations.changesetFiles.length > 0) {
    lines.push(
      `⚠️  changeset 파일 ${violations.changesetFiles.length}개 추가됨 → README 패키지 버전 테이블 업데이트 필수`,
      '',
      'changeset 파일:',
      buildFileList(violations.changesetFiles),
      '',
      '조치: README.md "배포 패키지" 섹션의 버전 컬럼과 업데이트 로그를 수정한 뒤 다시 시도하세요.',
    )
  }

  if (violations.skillAgentFiles.length > 0) {
    if (violations.changesetFiles.length > 0) lines.push('')
    lines.push(
      `⚠️  스킬/에이전트 파일 ${violations.skillAgentFiles.length}개 수정됨 → README 자산 현황 업데이트 필수`,
      '',
      '수정된 파일:',
      buildFileList(violations.skillAgentFiles),
      '',
      '조치: README.md의 해당 섹션(목록·스킬 수·업데이트 로그)을 업데이트한 뒤 다시 시도하세요.',
    )
  }

  lines.push('', '참고: @.claude/rules/readme-update.md')
  return lines.join('\n')
}

// ── PENDING_TEST 검사 (구 pending-test-guard) ──────────────────────

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 워크트리 잔재·의존성 디렉토리는 스캔 제외 (오탐 방지)
const SCAN_EXCLUDE = [
  `${path.sep}.claude${path.sep}worktrees${path.sep}`,
  `${path.sep}node_modules${path.sep}`,
]

function isExcludedPath(fullPath) {
  return SCAN_EXCLUDE.some(seg => fullPath.includes(seg))
}

function findVerificationFiles(rootDir) {
  const results = []
  if (!fs.existsSync(rootDir)) return results
  const walk = (dir) => {
    if (isExcludedPath(dir + path.sep)) return
    let entries
    try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (isExcludedPath(full)) continue
      if (entry.isDirectory()) walk(full)
      else if (entry.name === 'verification.md') results.push(full)
    }
  }
  walk(rootDir)
  return results
}

function extractStatus(content) {
  const fm = content.match(/^---\s*\n([\s\S]*?)\n---/m)
  if (!fm) return null
  const sm = fm[1].match(/^\s*status\s*:\s*([A-Z_]+)\s*$/m)
  return sm ? sm[1].trim() : null
}

// 진짜 테스트 수행 흔적 키워드 (1개 이상 매치되어야 함)
const GENUINE_TEST_KEYWORDS = [
  /\bPASS\b/,
  /\bFAIL\b/,
  /\bPARTIAL\b/,
  /\bQ\d+\./,                              // Q1. / Q2. 형식 질문 라벨
  /skill-tester\s+(정식\s+)?호출/,
  /agent\s+content\s+test/i,
  /수행자\s*[:：]\s*skill-tester/,
  /\d+\/\d+\s*(PASS|FAIL)/,                // 3/3 PASS 형식
]

// 명시적 *미수행 자백* 키워드 — 검출되면 그 라인 자체는 진짜 수행으로 간주 안 함
const NEGATION_KEYWORDS = [
  /skill-tester\s+호출\s+미수행/,
  /skill-tester\s+미수행/,
  /agent\s+content\s+test\s+미수행/i,
  /셀프\s+검증\s*\(skill-tester\s+호출\s+미수행\)/,
]

function extractSection5(content) {
  const m = content.match(
    /##\s+5\.\s+테스트\s+진행\s+기록([\s\S]*?)(?=\n##\s+\d|\n---\s*$|$)/i
  )
  return m ? m[1] : null
}

function hasAnyDateLine(body) {
  return /수행일[\s*:：]+\d{4}-\d{2}-\d{2}/.test(body)
}

function hasGenuineTestEvidence(body) {
  // NEGATION 매치되는 라인은 먼저 제거한 뒤 GENUINE 검사
  const cleaned = body
    .split(/\r?\n/)
    .filter(line => !NEGATION_KEYWORDS.some(re => re.test(line)))
    .join('\n')
  return GENUINE_TEST_KEYWORDS.some(re => re.test(cleaned))
}

function hasOnlyNegationConfession(body) {
  const hasNegation = NEGATION_KEYWORDS.some(re => re.test(body))
  return hasNegation && !hasGenuineTestEvidence(body)
}

function hasTodayTestRecord(content, today) {
  const body = extractSection5(content)
  if (!body) return false
  const todayRe = new RegExp(`수행일[\\s*:：]+${today}`)
  if (!todayRe.test(body)) return false
  return hasGenuineTestEvidence(body)
}

function hasAnyTestRecord(content) {
  const body = extractSection5(content)
  if (!body) return false
  if (!hasAnyDateLine(body)) return false
  if (hasOnlyNegationConfession(body)) return false
  return hasGenuineTestEvidence(body)
}

function getPendingTestViolations(cwd) {
  const today = todayStr()
  const docsDir = path.join(cwd, 'docs', 'skills')
  if (!fs.existsSync(docsDir)) return []

  const files = findVerificationFiles(docsDir)
  const missing = []

  for (const f of files) {
    let stat
    try { stat = fs.statSync(f) } catch { continue }
    const mtimeLocal = new Date(stat.mtime.getTime() - stat.mtime.getTimezoneOffset() * 60000)
    const mtimeStr = mtimeLocal.toISOString().slice(0, 10)
    if (mtimeStr !== today) continue

    let content
    try { content = fs.readFileSync(f, 'utf8') } catch { continue }

    if (extractStatus(content) !== 'PENDING_TEST') continue

    // 과거 수행 기록도 없고 오늘 수행 기록도 없는 경우에만 차단
    if (!hasAnyTestRecord(content) && !hasTodayTestRecord(content, today)) {
      missing.push(path.relative(cwd, f))
    }
  }
  return missing
}

function buildPendingTestReason(missing) {
  const today = todayStr()
  return [
    '',
    '═══════════════════════════════════════════════════════════════',
    '❌ 세션 종료 차단 — PENDING_TEST 스킬의 2단계 테스트 미수행',
    '═══════════════════════════════════════════════════════════════',
    '',
    `다음 ${missing.length}개 스킬이 오늘(${today}) 생성/수정됐지만`,
    '섹션 5 "테스트 진행 기록"에 *진짜* 수행 기록이 없습니다.',
    '',
    '판정 기준:',
    '  • "수행일: YYYY-MM-DD" 라인 + 실제 테스트 흔적 키워드 동시 필요',
    '    (PASS / FAIL / Q1·Q2 / skill-tester 호출 / agent content test / N/N PASS)',
    '  • "skill-tester 호출 미수행", "셀프 검증" 같은 자백 라인만 있으면 차단',
    '',
    ...missing.map(f => `  • ${f}`),
    '',
    '조치 (하나 선택):',
    '  A. skill-tester 에이전트 호출 (권장)',
    '  B. 수동으로 section 5에 테스트 기록 작성 ("**수행일**: ' + today + '" + PASS/FAIL)',
    '  C. "실사용 필수 스킬" 카테고리면 agent content test 기록만으로 PENDING_TEST 유지 가능',
    '',
    '참고: @.claude/rules/verification-policy.md, @.claude/rules/creation-workflow.md',
    '═══════════════════════════════════════════════════════════════',
    '',
  ].join('\n')
}

// ── 진입점 ───────────────────────────────────────────────────────

async function readStdin() {
  const rl = readline.createInterface({ input: process.stdin, terminal: false })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  return raw.trim()
}

async function main() {
  const raw = await readStdin()
  if (!raw) return process.exit(0)

  let input
  try { input = JSON.parse(raw) } catch { return process.exit(0) }

  const readmeCheckEnabled = !process.argv.includes('--no-readme')
  const { hook_event_name, hookEventName, session_id, tool_name, tool_input = {} } = input
  const eventName = hook_event_name || hookEventName

  // ── PostToolUse Write/Edit: 세션 파일 추적 ──────────────────────
  if (eventName === 'PostToolUse') {
    if (session_id) recordModifiedFile(session_id, tool_name, tool_input)
    return process.exit(0)
  }

  // ── PreToolUse Bash: git commit / push 직전 README 검사 ─────────
  if (eventName === 'PreToolUse') {
    if (!readmeCheckEnabled) return process.exit(0)
    if (!session_id || tool_name !== 'Bash') return process.exit(0)
    const cmd = (tool_input.command || '').trim()
    if (!/\bgit\s+(commit|push)\b/.test(cmd)) return process.exit(0)

    const violations = getReadmeViolations(session_id, true)
    if (!violations) return process.exit(0)

    const action = cmd.includes('push') ? '푸시' : '커밋'
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: buildReadmeReason(violations, action),
      },
    }) + '\n')
    return process.exit(0)
  }

  // ── Stop: README 동기화 + PENDING_TEST 검사 ─────────────────────
  if (eventName === 'Stop') {
    const messages = []

    if (readmeCheckEnabled && session_id) {
      const readmeViolations = getReadmeViolations(session_id, false)
      if (readmeViolations) messages.push(buildReadmeReason(readmeViolations, '세션 종료'))
    }

    const cwd = input.cwd || process.cwd()
    const pendingMissing = getPendingTestViolations(cwd)
    if (pendingMissing.length > 0) messages.push(buildPendingTestReason(pendingMissing))

    if (messages.length === 0) return process.exit(0)

    process.stderr.write(messages.join('\n\n'))
    return process.exit(2)
  }

  process.exit(0)
}

if (require.main === module) {
  main().catch(err => {
    process.stderr.write(`deliverable-guard error (non-blocking): ${err.message}\n`)
    process.exit(0)
  })
}

module.exports = {
  // 세션 추적
  sessionFilePath,
  loadSession,
  recordModifiedFile,
  // README 검사
  isRootReadme,
  getReadmeViolations,
  buildReadmeReason,
  // PENDING_TEST 검사
  extractStatus,
  extractSection5,
  hasAnyDateLine,
  hasGenuineTestEvidence,
  hasOnlyNegationConfession,
  hasTodayTestRecord,
  hasAnyTestRecord,
  findVerificationFiles,
  isExcludedPath,
  getPendingTestViolations,
  GENUINE_TEST_KEYWORDS,
  NEGATION_KEYWORDS,
}
