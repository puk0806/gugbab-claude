// session-handoff-inject.js — SessionStart
// 직전 세션 핸드오프 파일이 있으면(24h 이내) 컨텍스트로 주입한다
const fs = require('fs')
const path = require('path')
const { getHandoffFile, getMtime } = require(path.join(__dirname, '_lib.js'))

const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24h

try {
  const handoffFile = getHandoffFile()
  const mtime = getMtime(handoffFile)

  if (!mtime) process.exit(0)

  const ageMs = Date.now() - mtime
  if (ageMs > MAX_AGE_MS) process.exit(0)

  const content = fs.readFileSync(handoffFile, 'utf8')
  process.stderr.write('\n─────────────────────────────────────────\n')
  process.stderr.write(content)
  process.stderr.write('─────────────────────────────────────────\n\n')
} catch {}

process.exit(0)
