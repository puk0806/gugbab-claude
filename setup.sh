#!/bin/bash
# setup.sh — gugbab-claude 글로벌 설정 동기화
#
# 이 레포의 에이전트·규칙을 ~/.claude/에 심링크해서
# 모든 프로젝트에서 자동 사용되게 합니다.
#
# 사용법:
#   ./setup.sh          # 심링크 생성/갱신
#   ./setup.sh --check  # 현재 상태 확인만

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

check_only=false
if [ "$1" = "--check" ]; then check_only=true; fi

echo "=== gugbab-claude 글로벌 설정 동기화 ==="
echo "소스: $REPO_DIR"
echo "대상: $CLAUDE_DIR"
echo ""

# ── 에이전트 카테고리 심링크 ───────────────────────────────────────
mkdir -p "$CLAUDE_DIR/agents"
echo "[에이전트]"
for dir in "$REPO_DIR/.claude/agents"/*/; do
  category=$(basename "$dir")
  target="$CLAUDE_DIR/agents/$category"

  if $check_only; then
    if [ -L "$target" ] && [ "$(readlink "$target")" = "$dir" ]; then
      echo "  ✓ agents/$category"
    else
      echo "  ✗ agents/$category (동기화 필요)"
    fi
    continue
  fi

  [ -L "$target" ] && rm "$target"
  ln -s "$dir" "$target"
  echo "  → agents/$category"
done

# ── rules 심링크 ────────────────────────────────────────────────────
echo ""
echo "[규칙]"
target="$CLAUDE_DIR/rules"

if $check_only; then
  if [ -L "$target" ] && [ "$(readlink "$target")" = "$REPO_DIR/.claude/rules" ]; then
    echo "  ✓ rules/"
  else
    echo "  ✗ rules/ (동기화 필요)"
  fi
else
  [ -L "$target" ] && rm "$target"
  ln -s "$REPO_DIR/.claude/rules" "$target"
  echo "  → rules/"
fi

echo ""
if $check_only; then
  echo "확인 완료. 동기화하려면 ./setup.sh 실행"
else
  echo "완료. 이제 모든 프로젝트에서 에이전트·규칙이 자동 적용됩니다."
  echo ""
  echo "적용된 에이전트:"
  ls "$CLAUDE_DIR/agents/"
fi
