#!/usr/bin/env node
// branch-protection.js — PreToolUse Bash
//
// 브랜치 보호 규칙 강제 (2가지):
//   1. main 브랜치로 직접 push 금지 — PR을 통해 머지해야 함
//   2. 피처 브랜치에서 새 브랜치 생성 금지 — 새 브랜치는 반드시 main에서
//
// 복합 명령어(&&, ||, ;) 처리: 각 세그먼트를 독립적으로 검사.
// heredoc/따옴표 내부 텍스트 오탐 방지: 세그먼트 앞부분 git 명령만 매칭.

const { execSync } = require('child_process')
const fs = require('fs')

try {
  const raw = fs.readFileSync('/dev/stdin', 'utf8')
  const input = JSON.parse(raw || '{}')

  if (input.tool_name !== 'Bash') process.exit(0)

  const cmd = (input.tool_input?.command || '').trim()
  if (!/\bgit\b/.test(cmd)) process.exit(0)

  // 현재 브랜치 확인
  let currentBranch = ''
  try {
    currentBranch = execSync('git branch --show-current 2>/dev/null', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()
  } catch {
    process.exit(0)
  }
  if (!currentBranch) process.exit(0) // detached HEAD 또는 git 레포 아님

  // 복합 명령어를 세그먼트로 분리 (&&, ||, ; 기준)
  // heredoc 내부 텍스트 오탐 방지: heredoc 시작(<<) 이후는 제거
  const beforeHeredoc = cmd.split(/<<\s*['"]?[A-Z_]+['"]?/)[0]
  const segments = beforeHeredoc.split(/&&|\|\||;/).map(s => s.trim()).filter(Boolean)

  for (const seg of segments) {
    // ── Rule 1: main으로 직접 push 금지 ──────────────────────────────
    if (/^git\s+push\b/.test(seg) && !/--delete\b/.test(seg)) {
      const onMain = currentBranch === 'main'
      const explicitMain = /^git\s+push\s+\S+\s+main\b/.test(seg)  // git push origin main
      const refspecToMain = /:main\b/.test(seg)                     // git push origin HEAD:main

      if (onMain || explicitMain || refspecToMain) {
        process.stderr.write('[branch-protection] main 브랜치로 직접 push할 수 없습니다.\n')
        process.stderr.write('  → PR(Pull Request)을 통해 머지하세요.\n')
        if (onMain) {
          process.stderr.write('  → 현재 main 브랜치입니다. 피처 브랜치로 이동 후 push하세요:\n')
          process.stderr.write('      git checkout -b feature/{작업명}\n')
        }
        process.exit(2)
      }
    }

    // ── Rule 2: 피처 브랜치에서 새 브랜치 생성 금지 ─────────────────
    if (currentBranch !== 'main' && /^git\s+(checkout\s+-b|switch\s+-c)\b/.test(seg)) {
      process.stderr.write(`[branch-protection] 피처 브랜치(${currentBranch})에서 새 브랜치를 만들 수 없습니다.\n`)
      process.stderr.write('  → 새 브랜치는 반드시 main에서 생성해야 합니다:\n')
      process.stderr.write('      git checkout main\n')
      process.stderr.write('      git checkout -b feature/{작업명}\n')
      process.exit(2)
    }
  }

} catch {}

process.exit(0)
