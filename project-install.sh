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
echo "  7) unity-game        — Unity 6 LTS 2D 모바일 게임 개발"
echo "  8) academic          — 논문·학술 작업 (humanities/education/research/writing)"
echo "  9) dream-interpretation         — 꿈 해몽 앱 개발 (dream 전용 스킬·에이전트 포함)"
echo ""

while true; do
  read -rp "번호 입력 (0-9): " TEMPLATE_NUM
  case "$TEMPLATE_NUM" in
    0) TEMPLATE="all"; break ;;
    1) TEMPLATE="util"; break ;;
    2) TEMPLATE="react-spa"; break ;;
    3) TEMPLATE="nextjs"; break ;;
    4) TEMPLATE="rust-axum"; break ;;
    5) TEMPLATE="java-spring-legacy"; break ;;
    6) TEMPLATE="java-spring-modern"; break ;;
    7) TEMPLATE="unity-game"; break ;;
    8) TEMPLATE="academic"; break ;;
    9) TEMPLATE="dream-interpretation"; break ;;
    *) echo "오류: 0~9 중 하나를 입력하세요." ;;
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

# 유틸: 범용 훅 (보안·알림·컨텍스트 요약)
# 개발: 유틸 훅 + 검증·품질·TDD 훅 전체
HOOKS_UTIL=(
  "bash-guard.js"
  "auto-approve.js"
  "session-start.js"
  "session-summary.js"
  "parry.js"
  "cc-notify.js"
  "pre-compact.js"
  "instructions-loaded.js"
  "user-prompt-submit.js"
  "subagent-audit.js"
)
HOOKS_DEV=(
  "${HOOKS_UTIL[@]}"
  "verification-guard.js"
  "skill-md-guard.js"
  "pending-test-guard.js"
  "drift-monitor.js"
  "tdd-guard.js"
  "typescript-quality.js"
)

if [ "$TEMPLATE" = "util" ]; then
  HOOKS=("${HOOKS_UTIL[@]}")
else
  HOOKS=("${HOOKS_DEV[@]}")
fi

for hook in "${HOOKS[@]}"; do
  if cp -f "$REPO_DIR/.claude/hooks/$hook" "$TARGET/.claude/hooks/$hook" 2>/dev/null; then
    echo "  → .claude/hooks/$hook"
  else
    echo "  ✗ .claude/hooks/$hook (복사 실패)"
  fi
done

# git 훅 (.githooks/pre-commit) — 개발 템플릿만
if [ "$TEMPLATE" != "util" ]; then
  if [ -d "$REPO_DIR/.githooks" ]; then
    mkdir -p "$TARGET/.githooks"
    if cp -Rf "$REPO_DIR/.githooks/." "$TARGET/.githooks/" 2>/dev/null; then
      chmod +x "$TARGET/.githooks/"* 2>/dev/null || true
      echo "  → .githooks/ (활성화: cd $TARGET && git config core.hooksPath .githooks)"
    else
      echo "  ✗ .githooks/ (복사 실패)"
    fi
  fi
fi

# ── 2. agents ─────────────────────────────────────────────────────────
echo ""
echo "[agents]"

# ── 에이전트 카테고리 정의 ────────────────────────────────────────────────

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

# academic: 논문·학술 전용 에이전트 허용 목록
ACADEMIC_AGENTS=(
  "education/curriculum-2022-fact-checker.md"
  "research/academic-researcher.md"
  "research/defense-question-simulator.md"
  "research/literature-review-synthesizer.md"
  "research/research-proposal-coach.md"
  "research/research-reviewer.md"
  "research/socratic-interviewer.md"
  "research/translation-comparison.md"
  "research/web-searcher.md"
  "research/deep-researcher.md"
  "validation/abstract-reviewer.md"
  "validation/argument-reviewer.md"
  "validation/citation-checker.md"
  "validation/fact-checker.md"
  "validation/peer-review-simulator.md"
  "validation/source-validator.md"
  "meta/planner.md"
  "meta/claude-code-guide.md"
  "meta/freshness-auditor.md"
)

# dream-interpretation: 꿈 앱 전용 에이전트 허용 목록
DREAM_APP_AGENTS=(
  "frontend/frontend-developer.md"
  "frontend/frontend-architect.md"
  "backend/python-backend-developer.md"
  "backend/python-backend-architect.md"
  "backend/database-architect.md"
  "devops/devops-engineer.md"
  "domain/api-spec-designer.md"
  "domain/product-planner.md"
  "domain/ui-ux-designer.md"
  "research/dream-journal-coach.md"
  "research/dream-multi-perspective-synthesizer.md"
  "research/web-searcher.md"
  "research/deep-researcher.md"
  "research/research-reviewer.md"
  "validation/dream-image-safety-classifier.md"
  "validation/dream-interpretation-prompt-tester.md"
  "validation/dream-safety-classifier.md"
  "validation/fact-checker.md"
  "validation/source-validator.md"
  "validation/qa-engineer.md"
  "validation/security-auditor.md"
  "meta/planner.md"
  "meta/claude-code-guide.md"
  "meta/tech-stack-advisor.md"
  "meta/mvp-scope-planner.md"
  "meta/project-scaffolder.md"
)

# 특수 목적 에이전트 (일반 개발 템플릿에서 제외)
SPECIAL_AGENTS_ACADEMIC=(
  "education/curriculum-2022-fact-checker.md"
  "research/academic-researcher.md"
  "research/defense-question-simulator.md"
  "research/literature-review-synthesizer.md"
  "research/research-proposal-coach.md"
  "research/socratic-interviewer.md"
  "research/translation-comparison.md"
  "validation/abstract-reviewer.md"
  "validation/argument-reviewer.md"
  "validation/citation-checker.md"
  "validation/peer-review-simulator.md"
)
SPECIAL_AGENTS_DREAM=(
  "research/dream-journal-coach.md"
  "research/dream-multi-perspective-synthesizer.md"
  "validation/dream-image-safety-classifier.md"
  "validation/dream-interpretation-prompt-tester.md"
  "validation/dream-safety-classifier.md"
)
SPECIAL_AGENTS_GAME=(
  "game/game-asset-ai-director.md"
  "game/game-design-document-writer.md"
  "game/game-monetization-strategist.md"
  "game/mobile-app-publisher.md"
  "game/unity-architect.md"
  "game/unity-developer.md"
)

# 기술 스택별 제외 목록
EXCLUDE_AGENTS_FRONTEND=(
  "backend/rust-backend-developer.md"
  "backend/rust-backend-architect.md"
  "backend/java-backend-developer.md"
  "backend/java-backend-architect.md"
)
EXCLUDE_AGENTS_RUST=(
  "frontend/frontend-developer.md"
  "frontend/frontend-architect.md"
  "backend/java-backend-developer.md"
  "backend/java-backend-architect.md"
)
EXCLUDE_AGENTS_JAVA=(
  "frontend/frontend-developer.md"
  "frontend/frontend-architect.md"
  "backend/rust-backend-developer.md"
  "backend/rust-backend-architect.md"
  "backend/build-error-resolver.md"
)
EXCLUDE_AGENTS_GAME=(
  "frontend/frontend-developer.md"
  "frontend/frontend-architect.md"
  "backend/rust-backend-developer.md"
  "backend/rust-backend-architect.md"
  "backend/java-backend-developer.md"
  "backend/java-backend-architect.md"
  "backend/build-error-resolver.md"
)

# 에이전트 제외 여부 확인 헬퍼
is_in_list() {
  local needle="$1"; shift
  for item in "$@"; do [ "$item" = "$needle" ] && return 0; done
  return 1
}

for src_path in "$REPO_DIR/.claude/agents"/**/*.md "$REPO_DIR/.claude/agents"/*.md; do
  [ -f "$src_path" ] || continue
  rel="${src_path#$REPO_DIR/.claude/agents/}"

  # 화이트리스트 템플릿 (util / academic / dream-interpretation)
  if [ "$TEMPLATE" = "util" ]; then
    is_in_list "$rel" "${UTIL_AGENTS[@]}" || continue
  fi
  if [ "$TEMPLATE" = "academic" ]; then
    is_in_list "$rel" "${ACADEMIC_AGENTS[@]}" || continue
  fi
  if [ "$TEMPLATE" = "dream-interpretation" ]; then
    is_in_list "$rel" "${DREAM_APP_AGENTS[@]}" || continue
  fi

  # 일반 개발 템플릿: 특수 목적 에이전트 공통 제외
  if [[ "$TEMPLATE" =~ ^(react-spa|nextjs|rust-axum|java-spring-legacy|java-spring-modern|unity-game)$ ]]; then
    if is_in_list "$rel" "${SPECIAL_AGENTS_ACADEMIC[@]}"; then
      echo "  skip (학술 전용) .claude/agents/$rel" && continue
    fi
    if is_in_list "$rel" "${SPECIAL_AGENTS_DREAM[@]}"; then
      echo "  skip (dream 전용) .claude/agents/$rel" && continue
    fi
  fi

  # 게임 에이전트 제외 (unity-game 외 모두)
  if [ "$TEMPLATE" != "unity-game" ] && [ "$TEMPLATE" != "all" ]; then
    if is_in_list "$rel" "${SPECIAL_AGENTS_GAME[@]}"; then
      echo "  skip (게임 전용) .claude/agents/$rel" && continue
    fi
  fi

  # 기술 스택별 제외
  if [ "$TEMPLATE" = "react-spa" ] || [ "$TEMPLATE" = "nextjs" ]; then
    is_in_list "$rel" "${EXCLUDE_AGENTS_FRONTEND[@]}" && \
      echo "  skip (타언어 백엔드) .claude/agents/$rel" && continue
  fi
  if [ "$TEMPLATE" = "rust-axum" ]; then
    is_in_list "$rel" "${EXCLUDE_AGENTS_RUST[@]}" && \
      echo "  skip (rust 외) .claude/agents/$rel" && continue
  fi
  if [ "$TEMPLATE" = "java-spring-legacy" ] || [ "$TEMPLATE" = "java-spring-modern" ]; then
    is_in_list "$rel" "${EXCLUDE_AGENTS_JAVA[@]}" && \
      echo "  skip (java 외) .claude/agents/$rel" && continue
  fi
  if [ "$TEMPLATE" = "unity-game" ]; then
    is_in_list "$rel" "${EXCLUDE_AGENTS_GAME[@]}" && \
      echo "  skip (웹·서버 에이전트 제외) .claude/agents/$rel" && continue
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

# ── 스킬 카테고리 정의 ────────────────────────────────────────────────────

# SEO 관련 writing 스킬 — frontend 템플릿에서 유지
SEO_WRITING_SKILLS=(
  "writing/content-eeat-quality"
  "writing/multilingual-content-strategy"
  "writing/ymyl-content-seo"
  "writing/accessibility-vpat-writing"
)

# dream-interpretation 전용 humanities 스킬 (academic 템플릿에서 제외)
DREAM_HUMANITIES_SKILLS=(
  "humanities/dream-content-privacy-ethics"
  "humanities/dream-content-research"
  "humanities/dream-psychology-jung-freud"
  "humanities/korean-dream-interpretation-tradition"
  "humanities/crisis-intervention-resources-korea"
  "humanities/attachment-theory-basics"
  "humanities/relational-pattern-analysis"
)

# dream-interpretation 전용 meta 스킬
DREAM_META_SKILLS=(
  "meta/dream-interpretation-ab-testing-prompts"
  "meta/dream-interpretation-prompt-engineering"
  "meta/dream-safety-classifier-prompts"
)

is_seo_writing() {
  local prefix="$1"
  for s in "${SEO_WRITING_SKILLS[@]}"; do [[ "$prefix" == "$s" ]] && return 0; done
  return 1
}

is_dream_humanities() {
  local prefix="$1"
  for s in "${DREAM_HUMANITIES_SKILLS[@]}"; do [[ "$prefix" == "$s" ]] && return 0; done
  return 1
}

is_dream_meta() {
  local prefix="$1"
  for s in "${DREAM_META_SKILLS[@]}"; do [[ "$prefix" == "$s" ]] && return 0; done
  return 1
}

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

  # ── 템플릿별 스킬 필터 ────────────────────────────────────────────────

  # 유틸: 기술 스택 스킬 전부 제외
  if [ "$TEMPLATE" = "util" ]; then
    [[ "$rel" == frontend/* ]] && continue
    [[ "$rel" == backend/* ]] && continue
    [[ "$rel" == devops/* ]] && continue
    [[ "$rel" == architecture/* ]] && continue
    [[ "$rel" == game/* ]] && continue
    [[ "$rel" == humanities/* ]] && continue
    [[ "$rel" == education/* ]] && continue
    [[ "$rel" == research/* ]] && continue
    [[ "$rel" == writing/* ]] && continue
  fi

  # academic: 학술·논문 스킬만 포함
  if [ "$TEMPLATE" = "academic" ]; then
    [[ "$rel" == frontend/* ]] && continue
    [[ "$rel" == backend/* ]] && continue
    [[ "$rel" == devops/* ]] && continue
    [[ "$rel" == game/* ]] && continue
    # dream-interpretation 전용 humanities는 제외
    if [[ "$rel" == humanities/* ]] && is_dream_humanities "$skill_prefix"; then
      echo "  skip (dream 전용) .claude/skills/$rel" && continue
    fi
    # dream-interpretation 전용 meta는 제외
    if [[ "$rel" == meta/* ]] && is_dream_meta "$skill_prefix"; then
      echo "  skip (dream 전용) .claude/skills/$rel" && continue
    fi
    # architecture는 ddd만 허용
    if [[ "$rel" == architecture/* ]] && [[ "$skill_prefix" != "architecture/ddd" ]]; then
      echo "  skip (비학술 architecture) .claude/skills/$rel" && continue
    fi
  fi

  # dream-interpretation: 꿈 앱 스킬 포함 (game·학술·비드림 humanities 제외)
  if [ "$TEMPLATE" = "dream-interpretation" ]; then
    [[ "$rel" == game/* ]] && continue
    [[ "$rel" == education/* ]] && continue
    [[ "$rel" == research/* ]] && continue
    # humanities: dream 관련만 허용
    if [[ "$rel" == humanities/* ]] && ! is_dream_humanities "$skill_prefix"; then
      echo "  skip (비dream humanities) .claude/skills/$rel" && continue
    fi
    # writing: SEO 관련만 허용
    if [[ "$rel" == writing/* ]] && ! is_seo_writing "$skill_prefix"; then
      echo "  skip (학술 writing) .claude/skills/$rel" && continue
    fi
    # backend: python 계열만 허용
    if [[ "$rel" == backend/* ]] && [[ "$skill_prefix" != backend/python-* ]]; then
      echo "  skip (비python 백엔드) .claude/skills/$rel" && continue
    fi
    # meta: dream 전용 + 범용만 허용 (riper-workflow, ralph-loop, continuous-learning 포함)
  fi

  # react-spa / nextjs: 백엔드·게임·학술 스킬 제외, SEO writing 유지
  if [ "$TEMPLATE" = "react-spa" ] || [ "$TEMPLATE" = "nextjs" ]; then
    [[ "$rel" == backend/* ]] && echo "  skip (backend 제외) .claude/skills/$rel" && continue
    [[ "$rel" == game/* ]] && echo "  skip (game 제외) .claude/skills/$rel" && continue
    [[ "$rel" == humanities/* ]] && echo "  skip (humanities 제외) .claude/skills/$rel" && continue
    [[ "$rel" == education/* ]] && echo "  skip (education 제외) .claude/skills/$rel" && continue
    [[ "$rel" == research/* ]] && echo "  skip (research 제외) .claude/skills/$rel" && continue
    if [[ "$rel" == writing/* ]] && ! is_seo_writing "$skill_prefix"; then
      echo "  skip (학술 writing 제외) .claude/skills/$rel" && continue
    fi
  fi

  # rust-axum: 프론트엔드·Java·게임·학술 스킬 제외
  if [ "$TEMPLATE" = "rust-axum" ]; then
    [[ "$rel" == frontend/* ]] && echo "  skip (frontend 제외) .claude/skills/$rel" && continue
    [[ "$rel" == game/* ]] && echo "  skip (game 제외) .claude/skills/$rel" && continue
    [[ "$rel" == humanities/* ]] && echo "  skip (humanities 제외) .claude/skills/$rel" && continue
    [[ "$rel" == education/* ]] && echo "  skip (education 제외) .claude/skills/$rel" && continue
    [[ "$rel" == research/* ]] && echo "  skip (research 제외) .claude/skills/$rel" && continue
    [[ "$rel" == writing/* ]] && echo "  skip (writing 제외) .claude/skills/$rel" && continue
    if [[ "$rel" == backend/* ]] && is_java_skill "$skill_prefix"; then
      echo "  skip (java 스킬 제외) .claude/skills/$rel" && continue
    fi
  fi

  # java-spring-legacy: 프론트엔드 + Rust 백엔드 + Security 6(모던) + 게임·학술 제외
  if [ "$TEMPLATE" = "java-spring-legacy" ]; then
    [[ "$rel" == frontend/* ]] && echo "  skip (frontend 제외) .claude/skills/$rel" && continue
    [[ "$rel" == game/* ]] && echo "  skip (game 제외) .claude/skills/$rel" && continue
    [[ "$rel" == humanities/* ]] && echo "  skip (humanities 제외) .claude/skills/$rel" && continue
    [[ "$rel" == education/* ]] && echo "  skip (education 제외) .claude/skills/$rel" && continue
    [[ "$rel" == research/* ]] && echo "  skip (research 제외) .claude/skills/$rel" && continue
    [[ "$rel" == writing/* ]] && echo "  skip (writing 제외) .claude/skills/$rel" && continue
    if [[ "$rel" == backend/* ]] && ! is_java_skill "$skill_prefix"; then
      echo "  skip (rust 백엔드 제외) .claude/skills/$rel" && continue
    fi
    for m in "${JAVA_SKILLS_MODERN_ONLY[@]}"; do
      if [[ "$skill_prefix" == "$m" ]]; then
        echo "  skip (모던 전용 스킬 제외) .claude/skills/$rel" && continue 2
      fi
    done
  fi

  # java-spring-modern: 프론트엔드 + Rust 백엔드 + Security 5(레거시) + 게임·학술 제외
  if [ "$TEMPLATE" = "java-spring-modern" ]; then
    [[ "$rel" == frontend/* ]] && echo "  skip (frontend 제외) .claude/skills/$rel" && continue
    [[ "$rel" == game/* ]] && echo "  skip (game 제외) .claude/skills/$rel" && continue
    [[ "$rel" == humanities/* ]] && echo "  skip (humanities 제외) .claude/skills/$rel" && continue
    [[ "$rel" == education/* ]] && echo "  skip (education 제외) .claude/skills/$rel" && continue
    [[ "$rel" == research/* ]] && echo "  skip (research 제외) .claude/skills/$rel" && continue
    [[ "$rel" == writing/* ]] && echo "  skip (writing 제외) .claude/skills/$rel" && continue
    if [[ "$rel" == backend/* ]] && ! is_java_skill "$skill_prefix"; then
      echo "  skip (rust 백엔드 제외) .claude/skills/$rel" && continue
    fi
    for l in "${JAVA_SKILLS_LEGACY_ONLY[@]}"; do
      if [[ "$skill_prefix" == "$l" ]]; then
        echo "  skip (레거시 전용 스킬 제외) .claude/skills/$rel" && continue 2
      fi
    done
  fi

  # unity-game: 웹 프론트엔드 + 서버 백엔드 + 학술 스킬 제외
  if [ "$TEMPLATE" = "unity-game" ]; then
    [[ "$rel" == frontend/* ]] && echo "  skip (웹 프론트엔드 제외) .claude/skills/$rel" && continue
    [[ "$rel" == backend/* ]] && echo "  skip (서버 백엔드 제외) .claude/skills/$rel" && continue
    [[ "$rel" == humanities/* ]] && echo "  skip (humanities 제외) .claude/skills/$rel" && continue
    [[ "$rel" == education/* ]] && echo "  skip (education 제외) .claude/skills/$rel" && continue
    [[ "$rel" == research/* ]] && echo "  skip (research 제외) .claude/skills/$rel" && continue
    [[ "$rel" == writing/* ]] && echo "  skip (writing 제외) .claude/skills/$rel" && continue
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
if [ "$TEMPLATE" != "util" ]; then
  echo "  3. git 훅 활성화 (시크릿 스캔 pre-commit):"
  echo "       git config core.hooksPath .githooks"
fi
echo ""
echo "  git add .claude/ CLAUDE.md"
echo "  git commit -m '[config] Add: Claude Code 컨벤션 설정'"
echo ""
echo "팀원은 git clone 후 바로 Claude Code 사용 가능합니다."
