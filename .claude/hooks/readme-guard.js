#!/usr/bin/env node
/**
 * readme-guard.js
 * Claude Code PreToolUse (Bash) + Stop Hook
 *
 * 목적: 스킬/에이전트/changeset 파일 추가·수정 후 README.md 미업데이트 감지
 *
 * 동작:
 *   PreToolUse Bash — git commit / git push 직전 체크
 *     → SKILL.md / agents/*.md / .changeset/*.md 수정 시 README.md 미업데이트 → permissionDecision: deny (차단)
 *   Stop — 동일 조건 → exit 2 (세션 종료 차단)
 *
 * 설계 의도:
 *   - changeset 추가 시점에 README 패키지 버전 테이블도 반드시 동기화
 *   - CI 봇(changesets/action)은 로컬 훅 범위 밖이므로 changeset 생성 시점에 차단
 */

const readline = require('readline')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execSync } = require('child_process')

function runGit(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] })
      .split('\n').filter(Boolean)
  } catch { return [] }
}

function sessionFilePath(sessionId) {
  return path.join(os.tmpdir(), `claude-session-${sessionId}.json`)
}

function loadSession(sessionId) {
  const fp = sessionFilePath(sessionId)
  if (!fs.existsSync(fp)) return { files: [] }
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')) } catch { return { files: [] } }
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
 *
 * stagedOnly=true  → PreToolUse(commit/push): 스테이지된 파일만 검사
 * stagedOnly=false → Stop: 스테이지+미스테이지+미추적 파일까지 검사
 *
 * P1 fix: pnpm changeset은 Bash로 실행 → session.files에 기록 안 됨.
 *         git diff로 직접 탐지해 Bash 우회 문제 해결.
 * P2 fix: changeset version 후 삭제된 파일이 session에 잔류해 false positive 발생.
 *         fs.existsSync() + git 실시간 조회로 해결.
 */
function getViolations(sessionId, stagedOnly = false) {
  const session = loadSession(sessionId)
  const sessionFiles = session.files || []

  // skill/agent: Write/Edit 도구로 기록됨 → session 기반 유지
  const skillAgentFiles = sessionFiles.filter(f => SKILL_PATTERN.test(f) || AGENT_PATTERN.test(f))

  // git diff는 상대경로를 반환 → isRootReadme의 절대경로 비교와 맞추기 위해 절대경로로 변환
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd()
  const toAbs = (files) => files.map(f => path.isAbsolute(f) ? f : path.join(projectDir, f))

  // changeset: Bash(pnpm changeset)로 생성 → git diff로 탐지 (P1 fix)
  const staged = toAbs(runGit('git diff --staged --name-only'))
  const unstaged = stagedOnly ? [] : toAbs(runGit('git diff --name-only'))
  const untracked = stagedOnly ? [] : toAbs(runGit('git ls-files --others --exclude-standard'))
  const changesetFiles = [...new Set([...staged, ...unstaged, ...untracked])]
    .filter(f => CHANGESET_PATTERN.test(f) && fs.existsSync(f))

  if (skillAgentFiles.length === 0 && changesetFiles.length === 0) return null

  // README 업데이트 여부: session + staged + (Stop 시: unstaged까지) 확인 (P2 fix)
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

function buildReason(violations, action) {
  const lines = [`[readme-guard] README.md 미업데이트 — ${action} 차단`, '']

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

async function main() {
  const rl = readline.createInterface({ input: process.stdin })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  raw = raw.trim()

  if (!raw) return process.exit(0)

  let input
  try { input = JSON.parse(raw) } catch { return process.exit(0) }

  const { hook_event_name, hookEventName, session_id, tool_name, tool_input = {} } = input
  const eventName = hook_event_name || hookEventName

  if (!session_id) return process.exit(0)

  // ── PreToolUse Bash: git commit / git push 직전 차단 ──────────────────
  if (eventName === 'PreToolUse') {
    if (tool_name !== 'Bash') return process.exit(0)
    const cmd = (tool_input.command || '').trim()
    if (!/\bgit\s+(commit|push)\b/.test(cmd)) return process.exit(0)

    const violations = getViolations(session_id, true)
    if (!violations) return process.exit(0)

    const action = cmd.includes('push') ? '푸시' : '커밋'
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: buildReason(violations, action),
      },
    }) + '\n')
    return process.exit(0)
  }

  // ── Stop: 세션 종료 차단 ───────────────────────────────────────────────
  if (eventName === 'Stop') {
    const violations = getViolations(session_id, false)
    if (!violations) return process.exit(0)

    process.stdout.write(buildReason(violations, '세션 종료'))
    return process.exit(2)
  }

  process.exit(0)
}

main().catch(() => process.exit(0))
