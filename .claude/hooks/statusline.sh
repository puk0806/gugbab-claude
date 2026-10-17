#!/bin/bash
# statusline.sh — Claude Code statusLine
# 현재 브랜치 + 미커밋 수 + PENDING_TEST 스킬 수를 한 줄로 출력 (0 인 부분은 생략, git 레포가 아니면 출력 없음)
# PENDING_TEST 는 docs/skills/<카테고리>/<이름>/verification.md 의 frontmatter `status:` 줄만 센다 (2026-10-16 —
# 예전엔 .claude/skills 본문의 예시 글자까지 세어 숫자가 틀렸다)

BRANCH=$(git branch --show-current 2>/dev/null)
[ -z "$BRANCH" ] && exit 0

DIRTY=$(git status --short 2>/dev/null | wc -l | tr -d ' ')
PENDING=0
if [ -d "docs/skills" ]; then
  PENDING=$(find docs/skills -name verification.md -type f -print0 2>/dev/null \
    | xargs -0 awk 'FNR==1{fm=0; if ($0=="---") {fm=1; next}} fm && $0=="---"{fm=0; nextfile} fm && /^status:[[:space:]]*PENDING_TEST[[:space:]]*$/{n++; nextfile} END{print n+0}' 2>/dev/null)
  PENDING=${PENDING:-0}
fi

OUT="$BRANCH"
[ "$DIRTY" -gt 0 ]   && OUT="$OUT | ${DIRTY} uncommitted"
[ "$PENDING" -gt 0 ] && OUT="$OUT | ${PENDING} pending"
printf '%s\n' "$OUT"
