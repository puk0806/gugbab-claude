#!/bin/bash
# project-install.sh — 다른 프로젝트에 Claude Code 컨벤션 설치

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── 프로젝트 경로 입력 ─────────────────────────────────────────────────
echo ""
echo "=== gugbab-claude 프로젝트 설치 ==="
echo ""

while true; do
  read -rp "프로젝트 경로를 입력하세요: " TARGET
  TARGET="${TARGET/#\~/$HOME}"  # ~ 를 절대경로로 변환

  if [ -z "$TARGET" ]; then
    echo "오류: 경로를 입력해주세요."
    continue
  fi

  if [ ! -d "$TARGET" ]; then
    echo "오류: '$TARGET' 디렉토리가 존재하지 않습니다."
    continue
  fi

  break
done

# ── 템플릿 선택 ────────────────────────────────────────────────────────
echo ""
echo "템플릿을 선택하세요:"
echo "  0) 전체       — 모든 에이전트·스킬·규칙 복사"
echo "  1) 유틸       — 비개발자용 (리서치·검증·플래너 등 범용 에이전트만)"
echo "  2) react-spa  — React SPA"
echo "  3) nextjs     — Next.js App Router"
echo "  4) rust-axum  — Rust + Axum 백엔드"
echo ""

while true; do
  read -rp "번호 입력 (0/1/2/3/4): " TEMPLATE_NUM
  case "$TEMPLATE_NUM" in
    0) TEMPLATE="all"; break ;;
    1) TEMPLATE="util"; break ;;
    2) TEMPLATE="react-spa"; break ;;
    3) TEMPLATE="nextjs"; break ;;
    4) TEMPLATE="rust-axum"; break ;;
    *) echo "오류: 0, 1, 2, 3, 4 중 하나를 입력하세요." ;;
  esac
done

# ── 설치 시작 ─────────────────────────────────────────────────────────
echo ""
echo "대상: $TARGET"
echo "템플릿: $TEMPLATE"
echo ""

# 기존 .claude/ 폴더가 있으면 쓰기 권한 확보
if [ -d "$TARGET/.claude" ]; then
  chmod -R u+w "$TARGET/.claude" 2>/dev/null || true
fi

# ── 1. hooks ────────────────────────────────────────────────────────────
mkdir -p "$TARGET/.claude/hooks"
echo "[hooks]"

# 유틸: 기본 3개만 / 나머지: 검증 훅 포함 전체
if [ "$TEMPLATE" = "util" ]; then
  HOOKS=("bash-guard.js" "auto-approve.js" "session-summary.js")
else
  HOOKS=("bash-guard.js" "auto-approve.js" "session-summary.js" "verification-guard.js" "skill-md-guard.js")
fi

for hook in "${HOOKS[@]}"; do
  if cp -f "$REPO_DIR/.claude/hooks/$hook" "$TARGET/.claude/hooks/$hook" 2>/dev/null; then
    echo "  → .claude/hooks/$hook"
  else
    echo "  ✗ .claude/hooks/$hook (복사 실패)"
  fi
done

# ── 2. agents ─────────────────────────────────────────────────────────
echo ""
echo "[agents]"

# 유틸: 범용 에이전트만 허용 (비개발자도 사용 가능한 것)
UTIL_AGENTS=(
  "meta/planner.md"
  "meta/claude-code-guide.md"
  "research/deep-researcher.md"
  "research/web-searcher.md"
  "research/research-reviewer.md"
  "research/data-analyst.md"
  "research/competitor-analyst.md"
  "validation/fact-checker.md"
  "validation/source-validator.md"
  "validation/qa-engineer.md"
  "domain/product-planner.md"
  "domain/ui-ux-designer.md"
)

# react-spa / nextjs: Rust 백엔드 에이전트 제외
EXCLUDE_AGENTS_FRONTEND=(
  "backend/rust-backend-developer.md"
  "backend/rust-backend-architect.md"
)

# rust-axum: 프론트엔드 에이전트 제외
EXCLUDE_AGENTS_BACKEND=(
  "frontend/frontend-developer.md"
  "frontend/frontend-architect.md"
)

for src_path in "$REPO_DIR/.claude/agents"/**/*.md "$REPO_DIR/.claude/agents"/*.md; do
  [ -f "$src_path" ] || continue
  rel="${src_path#$REPO_DIR/.claude/agents/}"

  # 유틸: 허용 목록에 없으면 건너뜀
  if [ "$TEMPLATE" = "util" ]; then
    allowed=false
    for ua in "${UTIL_AGENTS[@]}"; do
      [ "$rel" = "$ua" ] && allowed=true && break
    done
    $allowed || continue
  fi

  # react-spa / nextjs: Rust 에이전트 제외
  if [ "$TEMPLATE" = "react-spa" ] || [ "$TEMPLATE" = "nextjs" ]; then
    skip=false
    for ex in "${EXCLUDE_AGENTS_FRONTEND[@]}"; do
      [ "$rel" = "$ex" ] && skip=true && break
    done
    $skip && echo "  skip (rust전용) .claude/agents/$rel" && continue
  fi

  # rust-axum: 프론트엔드 에이전트 제외
  if [ "$TEMPLATE" = "rust-axum" ]; then
    skip=false
    for ex in "${EXCLUDE_AGENTS_BACKEND[@]}"; do
      [ "$rel" = "$ex" ] && skip=true && break
    done
    $skip && echo "  skip (frontend전용) .claude/agents/$rel" && continue
  fi

  dest="$TARGET/.claude/agents/$rel"
  mkdir -p "$(dirname "$dest")"
  if cp -f "$src_path" "$dest" 2>/dev/null; then
    echo "  → .claude/agents/$rel"
  else
    echo "  ✗ .claude/agents/$rel (복사 실패)"
  fi
done

# ── 3. rules ────────────────────────────────────────────────────────────
echo ""
echo "[rules]"

# 유틸 모드: 기술 스택 무관한 규칙만
UTIL_RULES=("git.md" "info-verification.md")

mkdir -p "$TARGET/.claude/rules"
for rule in "$REPO_DIR/.claude/rules"/*.md; do
  [ -f "$rule" ] || continue
  name="$(basename "$rule")"

  if [ "$TEMPLATE" = "util" ]; then
    allowed=false
    for ur in "${UTIL_RULES[@]}"; do
      [ "$name" = "$ur" ] && allowed=true && break
    done
    $allowed || continue
  fi

  if cp -f "$rule" "$TARGET/.claude/rules/$name" 2>/dev/null; then
    echo "  → .claude/rules/$name"
  else
    echo "  ✗ .claude/rules/$name (복사 실패)"
  fi
done

# ── 4. skills ────────────────────────────────────────────────────────────
echo ""
echo "[skills]"

# skills/CLAUDE.md (스킬 작업 시 creation-workflow, info-verification 자동 로드)
if [ -f "$REPO_DIR/.claude/skills/CLAUDE.md" ]; then
  mkdir -p "$TARGET/.claude/skills"
  if cp -f "$REPO_DIR/.claude/skills/CLAUDE.md" "$TARGET/.claude/skills/CLAUDE.md" 2>/dev/null; then
    echo "  → .claude/skills/CLAUDE.md"
  else
    echo "  ✗ .claude/skills/CLAUDE.md (복사 실패)"
  fi
fi

for src_path in "$REPO_DIR/.claude/skills"/*/*/SKILL.md; do
  [ -f "$src_path" ] || continue
  rel="${src_path#$REPO_DIR/.claude/skills/}"

  # 유틸: 기술 스택 스킬 전부 제외
  if [ "$TEMPLATE" = "util" ]; then
    [[ "$rel" == frontend/* ]] && continue
    [[ "$rel" == backend/* ]] && continue
    [[ "$rel" == devops/* ]] && continue
    [[ "$rel" == architecture/* ]] && continue
  fi

  # react-spa / nextjs: 백엔드 스킬 제외
  if [ "$TEMPLATE" = "react-spa" ] || [ "$TEMPLATE" = "nextjs" ]; then
    if [[ "$rel" == backend/* ]]; then
      echo "  skip (rust전용) .claude/skills/$rel"
      continue
    fi
  fi

  # rust-axum: 프론트엔드 스킬 제외
  if [ "$TEMPLATE" = "rust-axum" ]; then
    if [[ "$rel" == frontend/* ]]; then
      echo "  skip (frontend전용) .claude/skills/$rel"
      continue
    fi
  fi

  dest="$TARGET/.claude/skills/$rel"
  mkdir -p "$(dirname "$dest")"
  if cp -f "$src_path" "$dest" 2>/dev/null; then
    echo "  → .claude/skills/$rel"
  else
    echo "  ✗ .claude/skills/$rel (복사 실패)"
  fi
done

# ── 5. docs ──────────────────────────────────────────────────────────────
echo ""
echo "[docs]"

if [ "$TEMPLATE" = "util" ]; then
  echo "  - 유틸 모드: docs/ 건너뜀"
else
  if [ -d "$REPO_DIR/docs" ]; then
    cp -rf "$REPO_DIR/docs" "$TARGET/docs" 2>/dev/null || true
    echo "  → docs/ (검증 문서·에이전트 문서 전체)"
  fi
fi

# ── 6. settings.json ────────────────────────────────────────────────────
echo ""
echo "[settings]"
SETTINGS_FILE="$TARGET/.claude/settings.json"

if [ -f "$SETTINGS_FILE" ]; then
  echo "  ⚠ settings.json 이미 존재합니다."
  while true; do
    read -rp "  덮어쓸까요? (y/N): " OVERWRITE_SETTINGS
    case "$OVERWRITE_SETTINGS" in
      y|Y) echo "  → settings.json 덮어쓰기"; break ;;
      n|N|"") echo "  → 건너뜀 (프로젝트 고유 설정 보존)"
              echo "    참고 템플릿: $REPO_DIR/.claude/settings.json"
              OVERWRITE_SETTINGS="skip"; break ;;
      *) echo "  y 또는 n을 입력하세요." ;;
    esac
  done
fi

if [ ! -f "$SETTINGS_FILE" ] || ([ -f "$SETTINGS_FILE" ] && [ "$OVERWRITE_SETTINGS" != "skip" ]); then
  # 유틸과 개발 템플릿은 Write PostToolUse 훅 구성이 다름
  if [ "$TEMPLATE" = "util" ]; then
    cat > "$SETTINGS_FILE" << 'EOF'
{
  "defaultMode": "auto",
  "enabledPlugins": {
    "codex@openai-codex": true,
    "superpowers@superpowers-marketplace": true
  },
  "permissions": {
    "allow": [
      "Bash(node*)", "Bash(npx*)", "Bash(pnpm*)", "Bash(npm*)", "Bash(codex*)",
      "Bash(git status*)", "Bash(git diff*)", "Bash(git log*)",
      "Bash(git branch*)", "Bash(git show*)", "Bash(git remote*)",
      "Bash(git add*)", "Bash(git stash*)", "Bash(git fetch*)",
      "Bash(ls*)", "Bash(cat*)", "Bash(head*)", "Bash(tail*)",
      "Bash(find*)", "Bash(grep*)", "Bash(wc*)", "Bash(pwd)",
      "Bash(which*)", "Bash(echo*)", "Bash(mkdir*)", "Bash(touch*)",
      "Bash(cp*)", "Bash(mv*)",
      "Write(**)", "Edit(**)", "Read(**)", "WebSearch", "WebFetch", "Agent"
    ],
    "deny": [
      "Bash(git push --force*)", "Bash(git push -f*)",
      "Bash(git reset --hard HEAD~[2-9]*)",
      "Bash(rm -rf /bin*)", "Bash(rm -rf /etc*)", "Bash(rm -rf /usr*)",
      "Bash(chmod 777*)", "Bash(curl*|*bash)", "Bash(wget*|*sh)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      { "matcher": "*", "hooks": [
        { "type": "command", "command": "node .claude/hooks/bash-guard.js" },
        { "type": "command", "command": "node .claude/hooks/auto-approve.js" }
      ]}
    ],
    "PostToolUse": [
      { "matcher": "Write", "hooks": [
        { "type": "command", "command": "node .claude/hooks/session-summary.js" }
      ]},
      { "matcher": "Edit", "hooks": [
        { "type": "command", "command": "node .claude/hooks/session-summary.js" }
      ]},
      { "matcher": "Bash", "hooks": [
        { "type": "command", "command": "node .claude/hooks/bash-guard.js" }
      ]}
    ],
    "Stop": [
      { "hooks": [
        { "type": "command", "command": "node .claude/hooks/session-summary.js" }
      ]}
    ],
    "PermissionRequest": [
      { "matcher": "*", "hooks": [
        { "type": "command", "command": "node .claude/hooks/bash-guard.js" },
        { "type": "command", "command": "node .claude/hooks/auto-approve.js" }
      ]}
    ]
  }
}
EOF
  else
    cat > "$SETTINGS_FILE" << 'EOF'
{
  "defaultMode": "auto",
  "enabledPlugins": {
    "codex@openai-codex": true,
    "superpowers@superpowers-marketplace": true
  },
  "permissions": {
    "allow": [
      "Bash(node*)", "Bash(npx*)", "Bash(pnpm*)", "Bash(npm*)", "Bash(codex*)",
      "Bash(git status*)", "Bash(git diff*)", "Bash(git log*)",
      "Bash(git branch*)", "Bash(git show*)", "Bash(git remote*)",
      "Bash(git add*)", "Bash(git stash*)", "Bash(git fetch*)",
      "Bash(ls*)", "Bash(cat*)", "Bash(head*)", "Bash(tail*)",
      "Bash(find*)", "Bash(grep*)", "Bash(wc*)", "Bash(pwd)",
      "Bash(which*)", "Bash(echo*)", "Bash(mkdir*)", "Bash(touch*)",
      "Bash(cp*)", "Bash(mv*)",
      "Write(**)", "Edit(**)", "Read(**)", "WebSearch", "WebFetch", "Agent"
    ],
    "deny": [
      "Bash(git push --force*)", "Bash(git push -f*)",
      "Bash(git reset --hard HEAD~[2-9]*)",
      "Bash(rm -rf /bin*)", "Bash(rm -rf /etc*)", "Bash(rm -rf /usr*)",
      "Bash(chmod 777*)", "Bash(curl*|*bash)", "Bash(wget*|*sh)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      { "matcher": "*", "hooks": [
        { "type": "command", "command": "node .claude/hooks/bash-guard.js" },
        { "type": "command", "command": "node .claude/hooks/auto-approve.js" }
      ]}
    ],
    "PostToolUse": [
      { "matcher": "Write", "hooks": [
        { "type": "command", "command": "node .claude/hooks/verification-guard.js" },
        { "type": "command", "command": "node .claude/hooks/skill-md-guard.js" },
        { "type": "command", "command": "node .claude/hooks/session-summary.js" }
      ]},
      { "matcher": "Edit", "hooks": [
        { "type": "command", "command": "node .claude/hooks/session-summary.js" }
      ]},
      { "matcher": "Bash", "hooks": [
        { "type": "command", "command": "node .claude/hooks/bash-guard.js" }
      ]}
    ],
    "Stop": [
      { "hooks": [
        { "type": "command", "command": "node .claude/hooks/session-summary.js" }
      ]}
    ],
    "PermissionRequest": [
      { "matcher": "*", "hooks": [
        { "type": "command", "command": "node .claude/hooks/bash-guard.js" },
        { "type": "command", "command": "node .claude/hooks/auto-approve.js" }
      ]}
    ]
  }
}
EOF
  fi
  echo "  → .claude/settings.json"
fi

# ── 7. CLAUDE.md ─────────────────────────────────────────────────────
echo ""
echo "[CLAUDE.md]"

CLAUDE_FILE="$TARGET/CLAUDE.md"
if [ -f "$CLAUDE_FILE" ]; then
  echo "  ⚠ CLAUDE.md 이미 존재합니다."
  while true; do
    read -rp "  덮어쓸까요? (y/N): " OVERWRITE_CLAUDE
    case "$OVERWRITE_CLAUDE" in
      y|Y) cp "$REPO_DIR/examples/CLAUDE.template.md" "$CLAUDE_FILE"
           echo "  → CLAUDE.md 덮어쓰기"
           echo "  ℹ {프로젝트명}과 {설명}을 수정하세요"; break ;;
      n|N|"") echo "  → 건너뜀 (프로젝트 고유 파일 보존)"; break ;;
      *) echo "  y 또는 n을 입력하세요." ;;
    esac
  done
else
  cp "$REPO_DIR/examples/CLAUDE.template.md" "$CLAUDE_FILE"
  echo "  → CLAUDE.md (최초 생성)"
  echo "  ℹ {프로젝트명}과 {설명}을 수정하세요"
fi

# ── 완료 ─────────────────────────────────────────────────────────────
echo ""
echo "✓ 설치 완료!"
echo ""
echo "다음 단계:"
echo "  1. CLAUDE.md 열어서 프로젝트명·실행 명령어 수정"
echo "  2. .claude/ 와 CLAUDE.md 를 git에 커밋"
echo ""
echo "  git add .claude/ CLAUDE.md"
echo "  git commit -m '[config] Add: Claude Code 컨벤션 설정'"
echo ""
echo "팀원은 git clone 후 바로 Claude Code 사용 가능합니다."
