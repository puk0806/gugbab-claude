// session-handoff.js — Stop
// 세션 종료 시 git 상태를 handoff 파일에 기록 — 다음 세션에서 session-handoff-inject.js가 주입
const fs = require('fs')
const path = require('path')
const { run, getHandoffFile } = require(path.join(__dirname, '_lib.js'))

try {
  const branch = run('git branch --show-current')
  if (!branch) process.exit(0) // git repo 아님

  const handoffFile = getHandoffFile()
  const now = new Date().toISOString()

  const status   = run('git status --short')
  const staged   = run('git diff --cached --name-only')
  const modified = run('git diff --name-only')
  const recent   = run('git log --oneline -5')

  const content = `# 세션 핸드오프
생성: ${now}
브랜치: ${branch}

## 최근 커밋
\`\`\`
${recent || '(없음)'}
\`\`\`

## 미커밋 변경 (unstaged)
\`\`\`
${modified || '(없음)'}
\`\`\`

## 스테이징된 파일
\`\`\`
${staged || '(없음)'}
\`\`\`

## git status
\`\`\`
${status || '(클린)'}
\`\`\`
`

  fs.writeFileSync(handoffFile, content, 'utf8')
} catch {}

process.exit(0)
