#!/bin/bash
# statusline.sh — Claude Code statusLine
# 현재 브랜치 + 미커밋 수 + PENDING_TEST 스킬 수를 한 줄로 출력

BRANCH=$(git branch --show-current 2>/dev/null)
[ -z "$BRANCH" ] && exit 0

DIRTY=$(git status --short 2>/dev/null | wc -l | tr -d ' ')
PENDING=0
if [ -d ".claude/skills" ]; then
  PENDING=$(grep -rl "status: PENDING_TEST" ".claude/skills" 2>/dev/null | wc -l | tr -d ' ')
fi

PARTS=("$BRANCH")
[ "$DIRTY" -gt 0 ]   && PARTS+=("${DIRTY} uncommitted")
[ "$PENDING" -gt 0 ] && PARTS+=("${PENDING} pending")

(IFS=" | "; echo "${PARTS[*]}")
