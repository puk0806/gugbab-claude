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
echo "템플릿을 선택하세요 (쉼표로 구분해서 복수 선택 가능):"
echo "   0/all                — 전체 (모든 에이전트·스킬·규칙)"
echo "   1/util               — 유틸 (비개발자용 범용 에이전트만)"
echo "   2/react-spa          — React SPA (Vite + TypeScript)"
echo "   3/nextjs             — Next.js App Router"
echo "   4/rust-axum          — Rust + Axum 백엔드"
echo "   5/java-spring-legacy — Java 11 + Spring Boot 2.5 + MyBatis"
echo "   6/java-spring-modern — Java 21 + Spring Boot 3.x + MyBatis"
echo "   7/unity-game         — Unity 6 LTS 2D 모바일 게임"
echo "   8/academic           — 논문·학술 작업"
echo "   9/dream-interpretation — 꿈 해몽 앱 개발"
echo "  10/health             — 건강·식단 PWA 앱"
echo ""
echo "  복수 선택 예시: react-spa,health  또는  2,10  또는  nextjs,java-spring-modern"
echo ""

_parse_template() {
  local raw="${1// /}"  # trim spaces
  case "$raw" in
    0|all)                  echo "all" ;;
    1|util)                 echo "util" ;;
    2|react-spa)            echo "react-spa" ;;
    3|nextjs)               echo "nextjs" ;;
    4|rust-axum)            echo "rust-axum" ;;
    5|java-spring-legacy)   echo "java-spring-legacy" ;;
    6|java-spring-modern)   echo "java-spring-modern" ;;
    7|unity-game)           echo "unity-game" ;;
    8|academic)             echo "academic" ;;
    9|dream-interpretation) echo "dream-interpretation" ;;
    10|health)              echo "health" ;;
    *) return 1 ;;
  esac
}

while true; do
  read -rp "번호 또는 이름 입력 (쉼표로 구분): " TEMPLATE_INPUT
  TEMPLATES=()
  _VALID=true
  IFS=',' read -ra _RAW_LIST <<< "$TEMPLATE_INPUT"
  for _raw in "${_RAW_LIST[@]}"; do
    _parsed=$(_parse_template "$_raw")
    if [ $? -ne 0 ]; then
      echo "오류: 알 수 없는 템플릿 '${_raw// /}'"
      _VALID=false; break
    fi
    TEMPLATES+=("$_parsed")
  done
  [ "$_VALID" = true ] && [ "${#TEMPLATES[@]}" -gt 0 ] && break
  echo "다시 입력해주세요."
done

TEMPLATE="${TEMPLATES[0]}"   # 첫 번째를 기본 템플릿으로 사용 (CLAUDE.md·docs 선택 기준)
_TMPL_STR="${TEMPLATES[*]}"
TEMPLATE_DISPLAY="${_TMPL_STR// /,}"  # 표시용 (쉼표 구분)

# ── 다중 템플릿 헬퍼 함수 ─────────────────────────────────────────────

# 특정 템플릿 포함 여부
has_template() {
  local _t="$1"
  for _tmpl in "${TEMPLATES[@]}"; do [ "$_tmpl" = "$_t" ] && return 0; done
  return 1
}

# 개발 템플릿(코딩 작업)이 하나라도 선택되었는가
is_dev_selected() {
  for _tmpl in "${TEMPLATES[@]}"; do
    case "$_tmpl" in
      react-spa|nextjs|rust-axum|java-spring-legacy|java-spring-modern|unity-game|health|all)
        return 0 ;;
    esac
  done
  return 1
}

# TypeScript 대상 템플릿이 하나라도 선택되었는가
is_ts_selected() {
  for _tmpl in "${TEMPLATES[@]}"; do
    case "$_tmpl" in react-spa|nextjs|health|all) return 0 ;; esac
  done
  return 1
}

# util만 선택되었는가 (util 단독일 때만 true)
is_util_only() {
  [ "${#TEMPLATES[@]}" -eq 1 ] && has_template "util"
}

# ── Memory 공유 기능 ────────────────────────────────────────────────────
echo ""
read -rp "크로스 데스크탑 Claude memory 공유 기능 포함하시겠습니까? (y/N): " _MEM_ANS
case "$_MEM_ANS" in
  y|Y) INCLUDE_MEMORY=true ;;
  *)   INCLUDE_MEMORY=false ;;
esac

# ── Superpowers 스킬 시스템 ─────────────────────────────────────────────
echo ""
echo "Superpowers 스킬·에이전트 시스템을 활성화하시겠습니까?"
echo "  (superpowers CLI 설치 필요. settings.json에 superpowers@superpowers-marketplace 플러그인 등록)"
read -rp "  활성화 (y/N): " _SP_ANS
case "$_SP_ANS" in
  y|Y) INCLUDE_SUPERPOWERS=true ;;
  *)   INCLUDE_SUPERPOWERS=false ;;
esac

# ── Codex 적대적 코드 리뷰 (개발 템플릿 전용) ─────────────────────────
INCLUDE_CODEX=false
if is_dev_selected; then
  echo ""
  echo "Codex 적대적 코드 리뷰를 활성화하시겠습니까?"
  echo "  (codex CLI 설치 + 로그인 필요. settings.json에 codex@openai-codex 플러그인 등록)"
  read -rp "  활성화 (y/N): " _CODEX_ANS
  case "$_CODEX_ANS" in
    y|Y) INCLUDE_CODEX=true ;;
    *)   INCLUDE_CODEX=false ;;
  esac
fi

# ── README 미업데이트 커밋 차단 (readme-guard) ─────────────────────────
INCLUDE_README_GUARD=false
if ! is_util_only; then
  echo ""
  echo "스킬/에이전트 수정 후 README 미업데이트 시 git commit/push 차단하시겠습니까?"
  echo "  (.claude/skills/ 또는 .claude/agents/ 파일 수정 시 적용)"
  read -rp "  활성화 (y/N): " _README_GUARD_ANS
  case "$_README_GUARD_ANS" in
    y|Y) INCLUDE_README_GUARD=true ;;
    *)   INCLUDE_README_GUARD=false ;;
  esac
fi

# ── staleness-check 강제 모드 (스킬 검증일 60일 초과 시 재검증 강제 지시) ──
INCLUDE_STALENESS_GUARD=false
if ! is_util_only; then
  echo ""
  echo "스킬 검증일 60일 초과 시 세션 시작마다 freshness-auditor 강제 재검증을 활성화하시겠습니까?"
  echo "  (30~59일: 경고만. 60일+: Claude가 다른 작업 전 반드시 재검증)"
  read -rp "  활성화 (y/N): " _STALE_ANS
  case "$_STALE_ANS" in
    y|Y) INCLUDE_STALENESS_GUARD=true ;;
    *)   INCLUDE_STALENESS_GUARD=false ;;
  esac
fi

# ── 브랜치 보호 규칙 ────────────────────────────────────────────────────
echo ""
echo "브랜치 보호 규칙을 활성화하시겠습니까?"
echo "  - main 브랜치로 직접 push 금지 (PR 필수)"
echo "  - 피처 브랜치에서 새 브랜치 생성 금지 (main에서만 브랜치 생성 허용)"
read -rp "  활성화 (y/N): " _BRANCH_ANS
case "$_BRANCH_ANS" in
  y|Y) INCLUDE_BRANCH_PROTECTION=true ;;
  *)   INCLUDE_BRANCH_PROTECTION=false ;;
esac

# ── 설치 시작 ─────────────────────────────────────────────────────────
echo ""
echo "대상: $TARGET"
echo "템플릿: $TEMPLATE_DISPLAY"
echo "memory 공유: $INCLUDE_MEMORY"
echo "Superpowers: $INCLUDE_SUPERPOWERS"
echo "Codex 리뷰: $INCLUDE_CODEX"
echo "README guard: $INCLUDE_README_GUARD"
echo "Staleness guard: $INCLUDE_STALENESS_GUARD"
echo "Branch protection: $INCLUDE_BRANCH_PROTECTION"
echo ""

# 기존 .claude/ 폴더가 있으면 쓰기 권한 확보
if [ -d "$TARGET/.claude" ]; then
  chmod -R u+w "$TARGET/.claude" 2>/dev/null || true
fi

# ── 1. hooks ────────────────────────────────────────────────────────────
mkdir -p "$TARGET/.claude/hooks"
echo "[hooks]"

# 공통 — 모든 템플릿
# (2026-07 훅 다이어트: session-summary/handoff·pending-test-guard·readme-guard·
#  task-plan-guard → deliverable-guard 통합 또는 네이티브 기능(Plan Mode·resume)으로 대체)
HOOKS_COMMON=(
  "_lib.js"
  "bash-guard.js"
  "auto-approve.js"
  "parry.js"
  "protect-secrets.js"
  "session-start.js"
  "session-export.js"
  "cc-notify.js"
  "instructions-loaded.js"
  "deliverable-guard.js"
  "skill-md-guard.js"
  "agent-md-guard.js"
  "verification-guard.js"
  "staleness-check.js"
  "statusline.sh"
)

# 개발 전용 (util·academic·dream 제외)
HOOKS_DEV_ONLY=("tdd-guard.js" "test-fake-guard.js")

# TypeScript 전용 (react-spa·nextjs만)
HOOKS_TS_ONLY=("typescript-quality.js")

# Memory 선택 시 추가
HOOKS_MEMORY_SET=("memory-pull.js" "memory-sync.js" "memory-stop-guard.js")

# Codex 선택 시 추가
HOOKS_CODEX_SET=("codex-review-guard.js")

# Branch protection 선택 시 추가
HOOKS_BRANCH_SET=("branch-protection.js")

# 복사 목록 구성
HOOKS=("${HOOKS_COMMON[@]}")

if is_dev_selected; then
  HOOKS+=("${HOOKS_DEV_ONLY[@]}")
fi

if is_ts_selected; then
  HOOKS+=("${HOOKS_TS_ONLY[@]}")
fi

if [ "$INCLUDE_MEMORY" = "true" ]; then
  HOOKS+=("${HOOKS_MEMORY_SET[@]}")
fi

if [ "$INCLUDE_CODEX" = "true" ]; then
  HOOKS+=("${HOOKS_CODEX_SET[@]}")
fi

if [ "$INCLUDE_BRANCH_PROTECTION" = "true" ]; then
  HOOKS+=("${HOOKS_BRANCH_SET[@]}")
fi

for hook in "${HOOKS[@]}"; do
  if cp -f "$REPO_DIR/.claude/hooks/$hook" "$TARGET/.claude/hooks/$hook" 2>/dev/null; then
    echo "  → .claude/hooks/$hook"
  else
    echo "  ✗ .claude/hooks/$hook (복사 실패 또는 미존재)"
  fi
done

# git 훅 (.githooks/pre-commit) — util 단독 제외
if ! is_util_only; then
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
  "backend/python-backend-developer.md"
  "backend/python-backend-architect.md"
  "backend/database-architect.md"
  "backend/build-error-resolver.md"
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

# 에이전트 포함 여부 확인 헬퍼
is_in_list() {
  local needle="$1"; shift
  for item in "$@"; do [ "$item" = "$needle" ] && return 0; done
  return 1
}

# ── 다중 템플릿 에이전트 포함 판정 ──────────────────────────────────────

# 단일 템플릿 기준으로 에이전트 포함 여부 반환 (0=포함, 1=제외)
_agent_ok_for_tmpl() {
  local rel="$1" tmpl="$2"
  # 화이트리스트 방식 템플릿
  if [ "$tmpl" = "util" ]; then
    is_in_list "$rel" "${UTIL_AGENTS[@]}" && return 0; return 1
  fi
  if [ "$tmpl" = "academic" ]; then
    is_in_list "$rel" "${ACADEMIC_AGENTS[@]}" && return 0; return 1
  fi
  if [ "$tmpl" = "dream-interpretation" ]; then
    is_in_list "$rel" "${DREAM_APP_AGENTS[@]}" && return 0; return 1
  fi
  if [ "$tmpl" = "all" ]; then return 0; fi
  # 개발 템플릿 공통: 학술·dream 전용 제외
  is_in_list "$rel" "${SPECIAL_AGENTS_ACADEMIC[@]}" && return 1
  is_in_list "$rel" "${SPECIAL_AGENTS_DREAM[@]}" && return 1
  # unity-game 외 게임 에이전트 제외
  if [ "$tmpl" != "unity-game" ]; then
    is_in_list "$rel" "${SPECIAL_AGENTS_GAME[@]}" && return 1
  fi
  # 기술 스택별 추가 제외
  case "$tmpl" in
    react-spa|nextjs|health)
      is_in_list "$rel" "${EXCLUDE_AGENTS_FRONTEND[@]}" && return 1 ;;
    rust-axum)
      is_in_list "$rel" "${EXCLUDE_AGENTS_RUST[@]}" && return 1 ;;
    java-spring-legacy|java-spring-modern)
      is_in_list "$rel" "${EXCLUDE_AGENTS_JAVA[@]}" && return 1 ;;
    unity-game)
      is_in_list "$rel" "${EXCLUDE_AGENTS_GAME[@]}" && return 1 ;;
  esac
  return 0
}

# 선택된 템플릿 중 하나라도 포함하면 포함 (union)
should_include_agent() {
  local rel="$1"
  for _tmpl in "${TEMPLATES[@]}"; do
    _agent_ok_for_tmpl "$rel" "$_tmpl" && return 0
  done
  return 1
}

for src_path in "$REPO_DIR/.claude/agents"/**/*.md "$REPO_DIR/.claude/agents"/*.md; do
  [ -f "$src_path" ] || continue
  rel="${src_path#$REPO_DIR/.claude/agents/}"

  if ! should_include_agent "$rel"; then
    echo "  skip .claude/agents/$rel" && continue
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

# 공통 — 모든 템플릿
RULES_COMMON=(
  "git.md"
  "info-verification.md"
  "agent-design.md"
  "commands.md"
  "creation-workflow.md"
  "readme-update.md"
  "verification-policy.md"
  "task-workflow.md"
)

# util 전용 (최소)
RULES_UTIL=("git.md" "info-verification.md")

# ── 다중 템플릿 규칙 포함 판정 ──────────────────────────────────────────

_rule_ok_for_tmpl() {
  local name="$1" tmpl="$2"
  if [ "$tmpl" = "util" ]; then
    is_in_list "$name" "${RULES_UTIL[@]}" && return 0; return 1
  fi
  is_in_list "$name" "${RULES_COMMON[@]}" && return 0
  case "$name" in
    java.md)
      [[ "$tmpl" == all || "$tmpl" == java-spring-legacy || "$tmpl" == java-spring-modern ]] && return 0 ;;
    rust.md)
      [[ "$tmpl" == all || "$tmpl" == rust-axum ]] && return 0 ;;
    typescript.md)
      [[ "$tmpl" == all || "$tmpl" == react-spa || "$tmpl" == nextjs || "$tmpl" == health ]] && return 0 ;;
  esac
  return 1
}

should_include_rule() {
  local name="$1"
  [ "$name" = "memory-sync.md" ]  && { [ "$INCLUDE_MEMORY" = "true" ] && return 0 || return 1; }
  [ "$name" = "codex-review.md" ] && { [ "$INCLUDE_CODEX" = "true" ]  && return 0 || return 1; }
  for _tmpl in "${TEMPLATES[@]}"; do
    _rule_ok_for_tmpl "$name" "$_tmpl" && return 0
  done
  return 1
}

mkdir -p "$TARGET/.claude/rules"
for rule in "$REPO_DIR/.claude/rules"/*.md; do
  [ -f "$rule" ] || continue
  name="$(basename "$rule")"
  if ! should_include_rule "$name"; then continue; fi
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

# ── 다중 템플릿 스킬 포함 판정 ──────────────────────────────────────────

# 단일 템플릿 기준으로 스킬 포함 여부 반환 (0=포함, 1=제외)
_skill_ok_for_tmpl() {
  local rel="$1" skill_prefix="$2" tmpl="$3"
  if [ "$tmpl" = "all" ]; then return 0; fi
  if [ "$tmpl" = "util" ]; then
    [[ "$rel" == frontend/* || "$rel" == backend/* || "$rel" == devops/* ||
       "$rel" == architecture/* || "$rel" == game/* || "$rel" == humanities/* ||
       "$rel" == education/* || "$rel" == research/* || "$rel" == writing/* ]] && return 1
    return 0
  fi
  if [ "$tmpl" = "academic" ]; then
    [[ "$rel" == frontend/* || "$rel" == backend/* || "$rel" == devops/* || "$rel" == game/* ]] && return 1
    [[ "$rel" == humanities/* ]] && is_dream_humanities "$skill_prefix" && return 1
    [[ "$rel" == meta/* ]] && is_dream_meta "$skill_prefix" && return 1
    [[ "$rel" == architecture/* ]] && [[ "$skill_prefix" != "architecture/ddd" ]] && return 1
    return 0
  fi
  if [ "$tmpl" = "dream-interpretation" ]; then
    [[ "$rel" == game/* || "$rel" == education/* || "$rel" == research/* ]] && return 1
    [[ "$rel" == humanities/* ]] && ! is_dream_humanities "$skill_prefix" && return 1
    [[ "$rel" == writing/* ]] && ! is_seo_writing "$skill_prefix" && return 1
    [[ "$rel" == backend/* ]] && [[ "$skill_prefix" != backend/python-* ]] && return 1
    return 0
  fi
  if [[ "$tmpl" =~ ^(react-spa|nextjs|health)$ ]]; then
    # Claude 구독 중계(relay) 등 Next.js 프로젝트에서 쓰는 backend 예외 스킬
    [[ "$skill_prefix" == "backend/claude-code-headless" ]] && return 0
    [[ "$rel" == backend/* || "$rel" == game/* || "$rel" == humanities/* ||
       "$rel" == education/* || "$rel" == research/* ]] && return 1
    [[ "$rel" == writing/* ]] && ! is_seo_writing "$skill_prefix" && return 1
    return 0
  fi
  if [ "$tmpl" = "rust-axum" ]; then
    [[ "$rel" == frontend/* || "$rel" == game/* || "$rel" == humanities/* ||
       "$rel" == education/* || "$rel" == research/* || "$rel" == writing/* ]] && return 1
    [[ "$rel" == backend/* ]] && is_java_skill "$skill_prefix" && return 1
    return 0
  fi
  if [ "$tmpl" = "java-spring-legacy" ]; then
    [[ "$rel" == frontend/* || "$rel" == game/* || "$rel" == humanities/* ||
       "$rel" == education/* || "$rel" == research/* || "$rel" == writing/* ]] && return 1
    [[ "$rel" == backend/* ]] && ! is_java_skill "$skill_prefix" && return 1
    for _m in "${JAVA_SKILLS_MODERN_ONLY[@]}"; do
      [[ "$skill_prefix" == "$_m" ]] && return 1
    done
    return 0
  fi
  if [ "$tmpl" = "java-spring-modern" ]; then
    [[ "$rel" == frontend/* || "$rel" == game/* || "$rel" == humanities/* ||
       "$rel" == education/* || "$rel" == research/* || "$rel" == writing/* ]] && return 1
    [[ "$rel" == backend/* ]] && ! is_java_skill "$skill_prefix" && return 1
    for _l in "${JAVA_SKILLS_LEGACY_ONLY[@]}"; do
      [[ "$skill_prefix" == "$_l" ]] && return 1
    done
    return 0
  fi
  if [ "$tmpl" = "unity-game" ]; then
    [[ "$rel" == frontend/* || "$rel" == backend/* || "$rel" == humanities/* ||
       "$rel" == education/* || "$rel" == research/* || "$rel" == writing/* ]] && return 1
    return 0
  fi
  return 1
}

# 선택된 템플릿 중 하나라도 포함하면 포함 (union)
should_include_skill() {
  local rel="$1" skill_prefix="$2"
  for _tmpl in "${TEMPLATES[@]}"; do
    _skill_ok_for_tmpl "$rel" "$skill_prefix" "$_tmpl" && return 0
  done
  return 1
}

for src_path in "$REPO_DIR/.claude/skills"/*/*/SKILL.md; do
  [ -f "$src_path" ] || continue
  rel="${src_path#$REPO_DIR/.claude/skills/}"
  skill_prefix="${rel%/SKILL.md}"   # backend/foo

  if ! should_include_skill "$rel" "$skill_prefix"; then
    echo "  skip .claude/skills/$rel" && continue
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

if is_util_only; then
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
  # gen-settings.js로 템플릿·옵션에 맞는 settings.json 동적 생성
  GEN_FLAGS=""
  # --util: util 단독 선택 시에만
  is_util_only && GEN_FLAGS="$GEN_FLAGS --util"
  # --dev: 개발 템플릿 하나라도 포함 시
  is_dev_selected && GEN_FLAGS="$GEN_FLAGS --dev"
  # --typescript: TypeScript 템플릿 하나라도 포함 시
  is_ts_selected && GEN_FLAGS="$GEN_FLAGS --typescript"
  [ "$INCLUDE_MEMORY" = "true" ]      && GEN_FLAGS="$GEN_FLAGS --memory"
  [ "$INCLUDE_SUPERPOWERS" = "true" ] && GEN_FLAGS="$GEN_FLAGS --superpowers"
  [ "$INCLUDE_CODEX" = "true" ]       && GEN_FLAGS="$GEN_FLAGS --codex"
  [ "$INCLUDE_README_GUARD" = "true" ]      && GEN_FLAGS="$GEN_FLAGS --readme-guard"
  [ "$INCLUDE_STALENESS_GUARD" = "true" ]   && GEN_FLAGS="$GEN_FLAGS --staleness-guard"
  [ "$INCLUDE_BRANCH_PROTECTION" = "true" ] && GEN_FLAGS="$GEN_FLAGS --branch-protection"

  if node "$REPO_DIR/scripts/gen-settings.js" $GEN_FLAGS > "$SETTINGS_FILE" 2>/dev/null; then
    _SUFFIX=""
    [ "$INCLUDE_MEMORY" = "true" ]      && _SUFFIX="$_SUFFIX +memory"
    [ "$INCLUDE_SUPERPOWERS" = "true" ] && _SUFFIX="$_SUFFIX +superpowers"
    [ "$INCLUDE_CODEX" = "true" ]       && _SUFFIX="$_SUFFIX +codex"
    [ "$INCLUDE_README_GUARD" = "true" ] && _SUFFIX="$_SUFFIX +readme-guard"
    [ "$INCLUDE_STALENESS_GUARD" = "true" ]   && _SUFFIX="$_SUFFIX +staleness-guard"
    [ "$INCLUDE_BRANCH_PROTECTION" = "true" ] && _SUFFIX="$_SUFFIX +branch-protection"
    echo "  → .claude/settings.json (생성: $TEMPLATE_DISPLAY$_SUFFIX)"
  else
    echo "  ✗ .claude/settings.json (gen-settings.js 실패)"
  fi
fi

# ── 7. CLAUDE.md ─────────────────────────────────────────────────────
echo ""
echo "[CLAUDE.md]"

CLAUDE_FILE="$TARGET/CLAUDE.md"

# 첫 번째 템플릿 기준으로 CLAUDE.md 소스 선택
CLAUDE_SRC="$REPO_DIR/examples/CLAUDE.${TEMPLATE}.md"
[ -f "$CLAUDE_SRC" ] || CLAUDE_SRC="$REPO_DIR/examples/CLAUDE.template.md"

CLAUDE_WRITTEN=false

if [ -f "$CLAUDE_FILE" ]; then
  echo "  ⚠ CLAUDE.md 이미 존재합니다."
  while true; do
    read -rp "  덮어쓸까요? (y/N): " OVERWRITE_CLAUDE
    case "$OVERWRITE_CLAUDE" in
      y|Y) cp "$CLAUDE_SRC" "$CLAUDE_FILE"
           echo "  → CLAUDE.md 덮어쓰기 (기본 템플릿: $TEMPLATE)"
           CLAUDE_WRITTEN=true; break ;;
      n|N|"") echo "  → 건너뜀 (프로젝트 고유 파일 보존)"; break ;;
      *) echo "  y 또는 n을 입력하세요." ;;
    esac
  done
else
  cp "$CLAUDE_SRC" "$CLAUDE_FILE"
  echo "  → CLAUDE.md (기본 템플릿: $TEMPLATE)"
  CLAUDE_WRITTEN=true
fi

if [ "$CLAUDE_WRITTEN" = true ]; then
  # 공통 규칙 주입 (<!-- common-rules --> 플레이스홀더 → CLAUDE.common.md 내용으로 대체)
  CLAUDE_COMMON="$REPO_DIR/examples/CLAUDE.common.md"
  if [ -f "$CLAUDE_COMMON" ] && grep -q "<!-- common-rules -->" "$CLAUDE_FILE" 2>/dev/null; then
    TMP=$(mktemp)
    sed "/<!-- common-rules -->/r $CLAUDE_COMMON" "$CLAUDE_FILE" | sed "/<!-- common-rules -->/d" > "$TMP" && mv "$TMP" "$CLAUDE_FILE"
    echo "  ✓ 공통 규칙 주입 (CLAUDE.common.md)"
  fi

  # ── 추가 템플릿 도메인 섹션 append (다중 템플릿 선택 시) ──────────────
  if [ "${#TEMPLATES[@]}" -gt 1 ]; then
    for _idx in "${!TEMPLATES[@]}"; do
      [ "$_idx" -eq 0 ] && continue  # 첫 번째는 이미 base로 사용
      _add_tmpl="${TEMPLATES[$_idx]}"
      _add_src="$REPO_DIR/examples/CLAUDE.${_add_tmpl}.md"
      [ -f "$_add_src" ] || continue

      # 표준 섹션(# 헤더, ## 필수 원칙/금지 사항/규칙 참조, ---, <!-- common-rules -->)
      # 을 제외한 도메인 전용 ## 섹션 추출
      _domain_content=$(awk '
        /^# /                                         { skip=1; next }
        /^## (필수 원칙|금지 사항|규칙 참조)/         { skip=1; next }
        /^## /                                        { skip=0 }
        /^---/                                        { skip=0; next }
        /^<!-- common-rules -->/                      { skip=1; next }
        !skip                                         { print }
      ' "$_add_src" | sed '/^[[:space:]]*$/{ N; /^\n[[:space:]]*$/d }')

      if [ -n "$_domain_content" ]; then
        # ## 규칙 참조 섹션 바로 앞에 도메인 섹션 삽입
        TMP=$(mktemp)
        awk -v domain="$_domain_content" -v added=0 '
          /^## 규칙 참조/ && added==0 {
            print "---"
            print ""
            print domain
            print ""
            added=1
          }
          { print }
        ' "$CLAUDE_FILE" > "$TMP" && mv "$TMP" "$CLAUDE_FILE"
        echo "  ✓ ${_add_tmpl} 도메인 섹션 추가"
      fi
    done
  fi

  read -rp "  프로젝트명을 입력하세요 (Enter로 건너뜀): " PROJECT_NAME
  if [ -n "$PROJECT_NAME" ]; then
    TMP=$(mktemp)
    sed "s|{프로젝트명}|$PROJECT_NAME|g" "$CLAUDE_FILE" > "$TMP" && mv "$TMP" "$CLAUDE_FILE"
    echo "  ✓ 프로젝트명: $PROJECT_NAME"
  fi
  read -rp "  프로젝트 설명을 입력하세요 (Enter로 건너뜀): " PROJECT_DESC
  if [ -n "$PROJECT_DESC" ]; then
    TMP=$(mktemp)
    sed "s|{프로젝트 한 줄 설명}|$PROJECT_DESC|g" "$CLAUDE_FILE" > "$TMP" && mv "$TMP" "$CLAUDE_FILE"
    TMP=$(mktemp)
    sed "s|{논문·연구 주제 한 줄 설명}|$PROJECT_DESC|g" "$CLAUDE_FILE" > "$TMP" && mv "$TMP" "$CLAUDE_FILE"
    echo "  ✓ 프로젝트 설명 적용"
  fi
  if [ -z "$PROJECT_NAME" ] && [ -z "$PROJECT_DESC" ]; then
    echo "  ℹ {프로젝트명}과 {설명}을 직접 수정하세요"
  fi
fi

# ── 완료 ─────────────────────────────────────────────────────────────
echo ""
echo "✓ 설치 완료!"
echo ""
echo "다음 단계:"
echo "  1. CLAUDE.md 열어서 프로젝트명·실행 명령어 수정"
echo "  2. .claude/ 와 CLAUDE.md 를 git에 커밋"
if ! is_util_only; then
  echo "  3. git 훅 활성화 (시크릿 스캔 pre-commit):"
  echo "       git config core.hooksPath .githooks"
fi
echo ""
echo "  git add .claude/ CLAUDE.md"
echo "  git commit -m '[config] Add: Claude Code 컨벤션 설정'"
echo ""
echo "팀원은 git clone 후 바로 Claude Code 사용 가능합니다."
