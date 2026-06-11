#!/usr/bin/env node
/**
 * pre-compact.js
 * Claude Code PreCompact Hook
 *
 * 컨텍스트 압축 직전에 현재 세션 상태를 /tmp에 스냅샷으로 저장
 * 압축 후 Claude가 "이전에 뭘 했는지" 참조할 수 있도록 보존
 *
 * 스냅샷: /tmp/claude-pre-compact-{session_id}.json
 */

const readline = require('readline')
const fs = require('fs')
const os = require('os')
const path = require('path')

function sessionFilePath(sessionId) {
  return path.join(os.tmpdir(), `claude-session-${sessionId}.json`)
}

function snapshotFilePath(sessionId) {
  return path.join(os.tmpdir(), `claude-pre-compact-${sessionId}.json`)
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin })
  let raw = ''
  for await (const line of rl) raw += line + '\n'
  raw = raw.trim()

  if (!raw) return process.exit(0)

  let input
  try { input = JSON.parse(raw) } catch { return process.exit(0) }

  const { session_id = 'unknown' } = input

  // session-summary.js가 기록한 세션 상태 읽기
  const sessionFile = sessionFilePath(session_id)
  let session = { files: [], tools: {} }
  if (fs.existsSync(sessionFile)) {
    try { session = JSON.parse(fs.readFileSync(sessionFile, 'utf8')) } catch {}
  }

  // 스냅샷 저장
  const snapshot = {
    snapshot_at: new Date().toISOString(),
    session_id,
    modified_files: session.files || [],
    tool_usage: session.tools || {},
    file_count: (session.files || []).length,
  }

  try {
    fs.writeFileSync(snapshotFilePath(session_id), JSON.stringify(snapshot, null, 2))
  } catch {}

  // 파일이 있을 때만 알림 출력
  if (snapshot.file_count > 0) {
    const snapshotPath = snapshotFilePath(session_id)

    // 경로 축약 헬퍼
    const shorten = (fp) => {
      const anchors = ['.claude', 'docs', 'src']
      const parts = fp.split('/')
      for (const a of anchors) {
        const idx = parts.indexOf(a)
        if (idx !== -1) return parts.slice(idx).join('/')
      }
      return parts.slice(-3).join('/')
    }

    const fileList = snapshot.modified_files.slice(0, 5).map(f => `  · ${shorten(f)}`).join('\n')
    const overflow = snapshot.file_count > 5 ? `\n  ... 외 ${snapshot.file_count - 5}개` : ''

    const msg = [
      '',
      `⚡ PreCompact 스냅샷 저장 (${snapshot.file_count}개 파일)`,
      fileList + overflow,
      `   → ${snapshotPath}`,
      '',
    ].join('\n')

    process.stderr.write(msg)
  }

  process.exit(0)
}

main().catch(() => process.exit(0))
