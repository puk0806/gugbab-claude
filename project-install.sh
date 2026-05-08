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
echo "  0) 전체              — 모든 에이전트·스킬·규칙 복사"
echo "  1) 유틸              — 비개발자용 (리서치·검증·플래너 등 범용 에이전트만)"
echo "  2) react-spa         — React SPA"
echo "  3) nextjs            — Next.js App Router"
echo "  4) rust-axum         — Rust + Axum 백엔드"
echo "  5) java-spring-legacy — Java 11 + Spring Boot 2.5 + WAR + MyBatis"
echo "  6) java-spring-modern — Java 21 + Spring Boot 3.x + Jar/Native + MyBatis"
echo ""

while true; do
  read -rp "번호 입력 (0/1/2/3/4/5/6): " TEMPLATE_NUM
  case "$TEMPLATE_NUM" in
    0) TEMPLATE="all"; break ;;
    1) TEMPLATE="util"; break ;;
    2) TEMPLATE="react-spa"; break ;;
    3) TEMPLATE="nextjs"; break ;;
    4) TEMPLATE="rust-axum"; break ;;
    5) TEMPLATE="java-spring-legacy"; break ;;
    6) TEMPLATE="java-spring-modern"; break ;;
    *) echo "오류: 0, 1, 2, 3, 4, 5, 6 중 하나를 입력하세요." ;;
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
  HOOKS=("bash-guard.js" "auto-approve.js" "session-summary.js" "verification-guard.js" "skill-md-guard.js" "pending-test-guard.js")
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

# react-spa / nextjs: Rust/Java 백엔드 에이전트 제외
EXCLUDE_AGENTS_FRONTEND=(
  "backend/rust-backend-developer.md"
  "backend/rust-backend-architect.md"
  "backend/java-backend-developer.md"
  "backend/java-backend-architect.md"
)

# rust-axum: 프론트엔드·Java 에이전트 제외
EXCLUDE_AGENTS_BACKEND=(
  "frontend/frontend-developer.md"
  "frontend/frontend-architect.md"
  "backend/java-backend-developer.md"
  "backend/java-backend-architect.md"
)

# java-spring-*: 프론트엔드·Rust 백엔드 에이전트 제외 (build-error-resolver는 Rust/TS/Vite 전용이라 Java 제외)
EXCLUDE_AGENTS_JAVA=(
  "frontend/frontend-developer.md"
  "frontend/frontend-architect.md"
  "backend/rust-backend-developer.md"
  "backend/rust-backend-architect.md"
  "backend/build-error-resolver.md"
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

  # react-spa / nextjs: Rust/Java 에이전트 제외
  if [ "$TEMPLATE" = "react-spa" ] || [ "$TEMPLATE" = "nextjs" ]; then
    skip=false
    for ex in "${EXCLUDE_AGENTS_FRONTEND[@]}"; do
      [ "$rel" = "$ex" ] && skip=true && break
    done
    $skip && echo "  skip (타언어 백엔드) .claude/agents/$rel" && continue
  fi

  # rust-axum: 프론트엔드·Java 에이전트 제외
  if [ "$TEMPLATE" = "rust-axum" ]; then
    skip=false
    for ex in "${EXCLUDE_AGENTS_BACKEND[@]}"; do
      [ "$rel" = "$ex" ] && skip=true && break
    done
    $skip && echo "  skip (rust 외) .claude/agents/$rel" && continue
  fi

  # java-spring-*: 프론트엔드·Rust 에이전트 제외
  if [ "$TEMPLATE" = "java-spring-legacy" ] || [ "$TEMPLATE" = "java-spring-modern" ]; then
    skip=false
    for ex in "${EXCLUDE_AGENTS_JAVA[@]}"; do
      [ "$rel" = "$ex" ] && skip=true && break
    done
    $skip && echo "  skip (java 외) .claude/agents/$rel" && continue
  fi

  dest="$TARGET/.claude/agents/$rel"
  mkdir -p "$(dirname "$dest")"
  if cp -f "$src_path" "$dest" 2>/dev/null; then
    echo "  → .claude/agents/$rel"

    # 같은 에이전트의 docs 페어링 복사
    # 1) docs/agents/{cat}/{name}.md
    agent_doc_src="$REPO_DIR/docs/agents/$rel"
    if [ -f "$agent_doc_src" ]; then
      agent_doc_dest="$TARGET/docs/agents/$rel"
      mkdir -p "$(dirname "$agent_doc_dest")"
      cp -f "$agent_doc_src" "$agent_doc_dest" 2>/dev/null && \
        echo "  → docs/agents/$rel"
    fi
    # 2) docs/agents/{cat}/{name}-verification.md (접미사 형태)
    agent_name_no_ext="${rel%.md}"
    agent_verif_rel="${agent_name_no_ext}-verification.md"
    agent_verif_src="$REPO_DIR/docs/agents/$agent_verif_rel"
    if [ -f "$agent_verif_src" ]; then
      agent_verif_dest="$TARGET/docs/agents/$agent_verif_rel"
      mkdir -p "$(dirname "$agent_verif_dest")"
      cp -f "$agent_verif_src" "$agent_verif_dest" 2>/dev/null && \
        echo "  → docs/agents/$agent_verif_rel"
    fi
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

# Java 스킬 분류 (backend/ 아래에 Rust·Java 스킬이 혼재해 세밀한 필터 필요)
JAVA_SKILLS_COMMON=(
  "backend/spring-boot-gradle-setup"
  "backend/mybatis-mapper-patterns"
  "backend/spring-multi-datasource-oracle-mysql"
  "backend/hikaricp-tuning-oracle-mysql"
  "backend/global-exception-validation"
  "backend/testing-junit5-spring-boot"
  "backend/lombok-mapstruct-modelmapper"
  "backend/logback-mdc-tracing"
  "backend/jasypt-encrypted-config"
  "backend/xss-lucy-jsoup"
  "backend/jackson-time-migration"
  "backend/webflux-webclient-in-sync-app"
  "backend/bouncycastle-crypto"
)
JAVA_SKILLS_LEGACY_ONLY=(
  "backend/spring-security-5-jwt-jjwt10"
  "backend/swagger-springfox-2"
  "backend/redis-redisson-legacy"
  "backend/ehcache-2-legacy"
  "backend/aws-sdk-v1-s3-rekognition"
)
JAVA_SKILLS_MODERN_ONLY=(
  "backend/spring-security-6-jwt-jjwt12"
  "backend/springdoc-openapi-3"
  "backend/redis-redisson-modern"
  "backend/aws-sdk-v2-s3-rekognition"
)

is_java_skill() {
  local prefix="$1"
  for s in "${JAVA_SKILLS_COMMON[@]}" "${JAVA_SKILLS_LEGACY_ONLY[@]}" "${JAVA_SKILLS_MODERN_ONLY[@]}"; do
    [[ "$prefix" == "$s" ]] && return 0
  done
  return 1
}

for src_path in "$REPO_DIR/.claude/skills"/*/*/SKILL.md; do
  [ -f "$src_path" ] || continue
  rel="${src_path#$REPO_DIR/.claude/skills/}"
  skill_prefix="${rel%/SKILL.md}"   # backend/foo

  # 유틸: 기술 스택 스킬 전부 제외
  if [ "$TEMPLATE" = "util" ]; then
    [[ "$rel" == frontend/* ]] && continue
    [[ "$rel" == backend/* ]] && continue
    [[ "$rel" == devops/* ]] && continue
    [[ "$rel" == architecture/* ]] && continue
  fi

  # react-spa / nextjs: 백엔드 스킬 전부 제외
  if [ "$TEMPLATE" = "react-spa" ] || [ "$TEMPLATE" = "nextjs" ]; then
    if [[ "$rel" == backend/* ]]; then
      echo "  skip (backend 제외) .claude/skills/$rel"
      continue
    fi
  fi

  # rust-axum: 프론트엔드 + Java 스킬 제외
  if [ "$TEMPLATE" = "rust-axum" ]; then
    if [[ "$rel" == frontend/* ]]; then
      echo "  skip (frontend 제외) .claude/skills/$rel"
      continue
    fi
    if [[ "$rel" == backend/* ]] && is_java_skill "$skill_prefix"; then
      echo "  skip (java 스킬 제외) .claude/skills/$rel"
      continue
    fi
  fi

  # java-spring-legacy: 프론트엔드 + Rust 백엔드 + Security 6(모던) 제외
  if [ "$TEMPLATE" = "java-spring-legacy" ]; then
    if [[ "$rel" == frontend/* ]]; then
      echo "  skip (frontend 제외) .claude/skills/$rel"
      continue
    fi
    if [[ "$rel" == backend/* ]] && ! is_java_skill "$skill_prefix"; then
      echo "  skip (rust 백엔드 제외) .claude/skills/$rel"
      continue
    fi
    for m in "${JAVA_SKILLS_MODERN_ONLY[@]}"; do
      if [[ "$skill_prefix" == "$m" ]]; then
        echo "  skip (모던 전용 스킬 제외) .claude/skills/$rel"
        continue 2
      fi
    done
  fi

  # java-spring-modern: 프론트엔드 + Rust 백엔드 + Security 5(레거시) 제외
  if [ "$TEMPLATE" = "java-spring-modern" ]; then
    if [[ "$rel" == frontend/* ]]; then
      echo "  skip (frontend 제외) .claude/skills/$rel"
      continue
    fi
    if [[ "$rel" == backend/* ]] && ! is_java_skill "$skill_prefix"; then
      echo "  skip (rust 백엔드 제외) .claude/skills/$rel"
      continue
    fi
    for l in "${JAVA_SKILLS_LEGACY_ONLY[@]}"; do
      if [[ "$skill_prefix" == "$l" ]]; then
        echo "  skip (레거시 전용 스킬 제외) .claude/skills/$rel"
        continue 2
      fi
    done
  fi

  dest="$TARGET/.claude/skills/$rel"
  mkdir -p "$(dirname "$dest")"
  if cp -f "$src_path" "$dest" 2>/dev/null; then
    echo "  → .claude/skills/$rel"

    # 같은 스킬의 docs 페어링 복사 (docs/skills/{cat}/{name}/)
    docs_src_dir="$REPO_DIR/docs/skills/$skill_prefix"
    if [ -d "$docs_src_dir" ]; then
      docs_dest_dir="$TARGET/docs/skills/$skill_prefix"
      mkdir -p "$docs_dest_dir"
      if cp -Rf "$docs_src_dir/." "$docs_dest_dir/" 2>/dev/null; then
        echo "  → docs/skills/$skill_prefix/"
      else
        echo "  ✗ docs/skills/$skill_prefix/ (복사 실패)"
      fi
    fi
  else
    echo "  ✗ .claude/skills/$rel (복사 실패)"
  fi
done

# ── 5. docs (공용 항목만 — 페어링 docs는 위 루프에서 처리) ─────────────
echo ""
echo "[docs (공용)]"

# 정책 (옵션 B):
#   - 스킬·에이전트 docs는 각자 export될 때 페어링되어 위 루프에서 복사됨
#   - 공용 항목(VERIFICATION_TEMPLATE.md, hooks/)만 여기서 처리
#   - 내부 자료(docs/domain, docs/research)는 외부 export 제외

if [ "$TEMPLATE" = "util" ]; then
  echo "  - 유틸 모드: docs/ 건너뜀"
else
  # docs/skills/VERIFICATION_TEMPLATE.md (스킬 검증 공용 템플릿)
  if [ -f "$REPO_DIR/docs/skills/VERIFICATION_TEMPLATE.md" ]; then
    mkdir -p "$TARGET/docs/skills"
    if cp -f "$REPO_DIR/docs/skills/VERIFICATION_TEMPLATE.md" \
            "$TARGET/docs/skills/VERIFICATION_TEMPLATE.md" 2>/dev/null; then
      echo "  → docs/skills/VERIFICATION_TEMPLATE.md"
    else
      echo "  ✗ docs/skills/VERIFICATION_TEMPLATE.md (복사 실패)"
    fi
  fi

  # docs/hooks/ (훅 문서 — 모든 템플릿이 동일한 훅 세트를 받으므로 통째 복사)
  if [ -d "$REPO_DIR/docs/hooks" ]; then
    mkdir -p "$TARGET/docs/hooks"
    if cp -Rf "$REPO_DIR/docs/hooks/." "$TARGET/docs/hooks/" 2>/dev/null; then
      echo "  → docs/hooks/"
    else
      echo "  ✗ docs/hooks/ (복사 실패)"
    fi
  fi

  # docs/domain, docs/research 는 레포 내부 자료라 외부 export에서 제외
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
  # 단일 source of truth — 템플릿 파일을 그대로 복사한다
  # 유틸: examples/settings/util.json (보수적 hook + 비개발자 권한 세트)
  # 그 외: .claude/settings.json (이 레포의 운영 설정 = 모든 개선 자동 반영)
  if [ "$TEMPLATE" = "util" ]; then
    SETTINGS_SRC="$REPO_DIR/examples/settings/util.json"
  else
    SETTINGS_SRC="$REPO_DIR/.claude/settings.json"
  fi

  if [ ! -f "$SETTINGS_SRC" ]; then
    echo "  ✗ .claude/settings.json (템플릿 누락: $SETTINGS_SRC)"
  elif cp -f "$SETTINGS_SRC" "$SETTINGS_FILE" 2>/dev/null; then
    echo "  → .claude/settings.json (from $(basename "$(dirname "$SETTINGS_SRC")")/$(basename "$SETTINGS_SRC"))"
  else
    echo "  ✗ .claude/settings.json (복사 실패)"
  fi
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
