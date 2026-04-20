#!/usr/bin/env node
/**
 * session-summary.js
 * Claude Code PostToolUse + Stop Hook
 *
 * PostToolUse (Write/Edit/Bash):
 *   - 수정된 파일 경로를 /tmp/claude-session-{session_id}.json에 누적 기록
 *
 * Stop:
 *   - 세션에서 수정한 파일 목록을 요약 출력
 *   - 파일 변경이 없으면 조용히 종료
 */

const readline = require('readline')
const fs = require('fs')
const os = require('os')
const path = require('path')

// ── 세션 파일 경로 ──────────────────────────────────────────────
function sessionFilePath(sessionId) {
  return path.join(os.tmpdir(), `claude-session-${sessionId}.json`)
}

function loadSession(sessionId) {
  const fp = sessionFilePath(sessionId)
  if (!fs.existsSync(fp)) return { files: [], tools: {} }
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')) } catch { return { files: [], tools: {} } }
}

function saveSession(sessionId, data) {
  try { fs.writeFileSync(sessionFilePath(sessionId), JSON.stringify(data)) } catch {}
}

// ── 이벤트 핸들러 ────────────────────────────────────────────────
function handlePostToolUse(sessionId, toolName, toolInput) {
  if (!['Write', 'Edit'].includes(toolName)) return

  const filePath = (toolInput.file_path || '').trim()
  if (!filePath) return

  const session = loadSession(sessionId)

  if (!session.files.includes(filePath)) session.files.push(filePath)
  session.tools[toolName] = (session.tools[toolName] || 0) + 1

  saveSession(sessionId, session)
}

function handleStop(sessionId) {
  const session = loadSession(sessionId)
  if (session.files.length === 0) return

  const toolSummary = Object.entries(session.tools)
    .map(([t, c]) => `${t} ${c}회`)
    .join(' · ')

  // 경로를 프로젝트 루트 기준 상대 경로로 축약
  const shorten = (fp) => {
    const parts = fp.split('/')
    // .claude/, docs/, src/ 등 의미 있는 기준점 이후 경로 추출
    const anchor = ['.claude', 'docs', 'src']
    for (const a of anchor) {
      const idx = parts.indexOf(a)
      if (idx !== -1) return parts.slice(idx).join('/')
    }
    return parts.slice(-3).join('/')
  }

  const fileList = session.files
    .slice(0, 8)
    .map(f => `  · ${shorten(f)}`)
    .join('\n')
  const overflow = session.files.length > 8 ? `\n  ... 외 ${session.files.length - 8}개` : ''

  const msg = [
    '',
    `📋 세션 작업 요약  (${session.files.length}개 파일 수정 | ${toolSummary})`,
    fileList + overflow,
    '',
  ].join('\n')

  process.stderr.write(msg)
}

// ── 진입점 ───────────────────────────────────────────────────────
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

  if (eventName === 'PostToolUse') {
    handlePostToolUse(session_id, tool_name, tool_input)
  } else if (eventName === 'Stop') {
    handleStop(session_id)
  }

  process.exit(0)
}

main().catch(() => process.exit(0))
