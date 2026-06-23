#!/usr/bin/env node
// confirmation-gate.js — PreToolUse Write / Edit
// task-plan-guard.js가 설정한 .awaiting-confirmation 플래그가 있으면
// 사용자 확인 전까지 파일 수정을 exit(2)로 차단한다.
// 사용자가 "진행해" 등 확인 응답 → task-plan-guard가 플래그 삭제 → 차단 해제

const fs = require('fs')
const path = require('path')

const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd()
const FLAG_FILE = path.join(PROJECT_DIR, '.claude', '.awaiting-confirmation')
const EXPIRE_MS = 4 * 60 * 60 * 1000 // 4시간 후 자동 만료

try {
  if (!fs.existsSync(FLAG_FILE)) process.exit(0)

  // 플래그 만료 확인
  const content = fs.readFileSync(FLAG_FILE, 'utf8').trim()
  const flagTime = new Date(content).getTime()
  if (isNaN(flagTime) || Date.now() - flagTime > EXPIRE_MS) {
    try { fs.unlinkSync(FLAG_FILE) } catch {}
    process.exit(0)
  }

  // 차단
  process.stderr.write('[confirmation-gate] 사용자 확인 전 파일 수정 불가\n')
  process.stderr.write('  → 먼저 계획을 제시하고 "진행할까요?" 로 사용자 승인을 받으세요.\n')
  process.stderr.write('  → 사용자가 "진행해" 라고 응답하면 이 차단이 해제됩니다.\n')
  process.exit(2)
} catch {
  process.exit(0)
}
