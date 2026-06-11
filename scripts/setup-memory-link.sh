#!/usr/bin/env bash
# setup-memory-link.sh
# 새 데스크탑에서 처음 한 번만 실행 — Claude 메모리 디렉토리를 repo memory/ 로 연결한다.
#
# 사용법:
#   cd <repo-root>
#   bash scripts/setup-memory-link.sh
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MEMORY_REPO="$REPO_ROOT/memory"

# Claude 프로젝트 인코딩: 선행 / 제거 후 나머지 / 를 - 로 치환
ENCODED_PATH="$(echo "$REPO_ROOT" | sed 's|^/||' | tr '/' '-')"
CLAUDE_MEMORY_DIR="$HOME/.claude/projects/$ENCODED_PATH/memory"

echo "Repository:    $REPO_ROOT"
echo "Memory source: $MEMORY_REPO"
echo "Claude target: $CLAUDE_MEMORY_DIR"
echo ""

# 부모 디렉토리 생성
mkdir -p "$(dirname "$CLAUDE_MEMORY_DIR")"

# 실제 디렉토리(symlink 아님)가 있으면: repo로 병합 후 삭제
if [ -d "$CLAUDE_MEMORY_DIR" ] && [ ! -L "$CLAUDE_MEMORY_DIR" ]; then
  echo "→ 기존 로컬 memory 디렉토리 발견. repo로 병합 중..."
  cp -n "$CLAUDE_MEMORY_DIR"/*.md "$MEMORY_REPO/" 2>/dev/null || true
  rm -rf "$CLAUDE_MEMORY_DIR"
  echo "  병합 완료 (기존 파일은 repo에서 확인)"
fi

# 깨진 symlink 제거
if [ -L "$CLAUDE_MEMORY_DIR" ] && [ ! -e "$CLAUDE_MEMORY_DIR" ]; then
  rm "$CLAUDE_MEMORY_DIR"
fi

# symlink 생성
if [ ! -L "$CLAUDE_MEMORY_DIR" ]; then
  ln -s "$MEMORY_REPO" "$CLAUDE_MEMORY_DIR"
  echo "✓ Symlink 생성: $CLAUDE_MEMORY_DIR → $MEMORY_REPO"
else
  echo "✓ Symlink 이미 존재"
fi

echo ""
echo "설정 완료."
echo "세션 시작 전 최신 메모리를 가져오려면: git pull"
