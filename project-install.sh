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
echo "  11/seo-geo            — SEO·GEO 검색 노출 (프레임워크 비종속 — 스택 템플릿과 병행 선택)"
echo ""
echo "  복수 선택 예시: react-spa,health  또는  2,10  또는  java-spring-legacy,seo-geo (5,11)"
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
    11|seo-geo)             echo "seo-geo" ;;
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

# 애드온 템플릿(seo-geo)은 CLAUDE.md 베이스가 될 수 없다 — 베이스 예시는 첫 템플릿 것을 통째로 쓰고 나머지는
# 도메인 섹션만 append 하므로, `11,5`처럼 애드온을 앞에 쓰면 Java 의 `## 금지 사항` 같은 스택 가드레일이 통째로
# 빠진 채 조용히 설치된다 (2026-09-01 Codex R1). 입력 순서와 무관하게 스택 템플릿 → 애드온 순으로 정규화한다.
ADDON_TEMPLATES=("seo-geo")
_STACK_TMPLS=(); _ADDON_TMPLS=()
for _t in "${TEMPLATES[@]}"; do
  _is_addon=false
  for _a in "${ADDON_TEMPLATES[@]}"; do [ "$_t" = "$_a" ] && _is_addon=true; done
  if [ "$_is_addon" = true ]; then _ADDON_TMPLS+=("$_t"); else _STACK_TMPLS+=("$_t"); fi
done
if [ "${#_STACK_TMPLS[@]}" -gt 0 ] && [ "${#_ADDON_TMPLS[@]}" -gt 0 ] && [ "${TEMPLATES[0]}" != "${_STACK_TMPLS[0]}" ]; then
  echo "  ℹ 애드온 템플릿(${_ADDON_TMPLS[*]})은 뒤로 정렬 — CLAUDE.md 베이스: ${_STACK_TMPLS[0]}"
fi
TEMPLATES=("${_STACK_TMPLS[@]}" "${_ADDON_TMPLS[@]}")

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

# 이번 실행이 java 템플릿만으로 구성됐는가 — java 고유 누수(n8n·SEO devops·에이전트)의 prune 기록 조건.
# (react-spa 등 타 템플릿과 병행 설치 시엔 그 템플릿 소유 자산일 수 있어 prune 기록 금지 — 템플릿은 가산적)
# seo-geo(2026-09-01)는 java 누수 목록 중 자기 소유분(site-migration-seo·SEO 에이전트)만 갖는 애드온이라
# 조합에 허용하되, 기록 시점에 seo-geo 소유 스킬은 is_seo_geo_skill 로 걸러낸다.
is_only_java_selected() {
  has_template "java-spring-legacy" || has_template "java-spring-modern" || return 1
  for _tmpl in "${TEMPLATES[@]}"; do
    case "$_tmpl" in
      java-spring-legacy|java-spring-modern|seo-geo) ;;
      *) return 1 ;;
    esac
  done
  return 0
}

# 이번 실행의 모든 템플릿이 dream·프론트 아키텍처 스킬의 정당한 소유자가 아닌 조합(java·rust·unity·seo-geo)인가.
# 이때만 해당 누수 잔재를 prune 기록해 rust/unity·혼합 재설치도 수렴한다 (2026-08-31 Codex R1).
# ts·dream·health 템플릿이 섞이면 그쪽 소유일 수 있어 기록하지 않는다.
is_leakscope_only_selected() {
  for _tmpl in "${TEMPLATES[@]}"; do
    case "$_tmpl" in
      java-spring-legacy|java-spring-modern|rust-axum|unity-game|seo-geo) ;;
      *) return 1 ;;
    esac
  done
  return 0
}

# 제외 스킬을 prune 목록에 기록 — 대상에 이미 존재하는 짝 docs 파일도 함께 (2026-08-31 Codex R1: docs 잔존)
# SKILL.md만이 아니라 스킬 폴더 아래 전체 파일(references/ 등)을 큐잉한다
# (2026-08-31 Codex R2: references 복사 도입 후 SKILL.md만 prune하면 부속 파일이 영구 잔존).
# 삭제 자체는 prune-option-excluded.js가 파일별 매니페스트 해시 증명으로만 수행한다.
record_excluded_skill() {
  local _rel="$1" _prefix="$2"
  if [ -d "$TARGET/.claude/skills/$_prefix" ]; then
    ( cd "$TARGET/.claude/skills" && find "$_prefix" -type f 2>/dev/null ) | \
      sed 's/^/skills|/' >> "$OPTION_EXCLUDED_TMP"
  else
    echo "skills|$_rel" >> "$OPTION_EXCLUDED_TMP"
  fi
  if [ -d "$TARGET/docs/skills/$_prefix" ]; then
    ( cd "$TARGET/docs" && find "skills/$_prefix" -type f 2>/dev/null ) | \
      sed 's/^/docs|/' >> "$OPTION_EXCLUDED_TMP"
  fi
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

# y/N 질문 공용 함수 — y/Y → 0(yes), n/N/엔터 → 1(no), 그 외 입력은 재질문
ask_yn() {
  local _prompt="$1" _ans
  while true; do
    read -rp "$_prompt" _ans
    case "$_ans" in
      y|Y)    return 0 ;;
      n|N|"") return 1 ;;
      *)      echo "  y 또는 n을 입력하세요. (엔터 = n)" ;;
    esac
  done
}

# ── Memory 공유 기능 ────────────────────────────────────────────────────
echo ""
if ask_yn "크로스 데스크탑 Claude memory 공유 기능 포함하시겠습니까? (y/N): "; then
  INCLUDE_MEMORY=true
else
  INCLUDE_MEMORY=false
fi

# ── Superpowers 스킬 시스템 ─────────────────────────────────────────────
echo ""
echo "Superpowers 스킬·에이전트 시스템을 활성화하시겠습니까?"
echo "  (superpowers CLI 설치 필요. settings.json에 superpowers@superpowers-marketplace 플러그인 등록)"
if ask_yn "  활성화 (y/N): "; then
  INCLUDE_SUPERPOWERS=true
else
  INCLUDE_SUPERPOWERS=false
fi

# ── Codex 적대적 코드 리뷰 (개발 템플릿 전용) ─────────────────────────
INCLUDE_CODEX=false
if is_dev_selected; then
  echo ""
  echo "Codex 적대적 코드 리뷰를 활성화하시겠습니까?"
  echo "  (codex CLI 설치 + 로그인 필요. settings.json에 codex@openai-codex 플러그인 등록)"
  if ask_yn "  활성화 (y/N): "; then
    INCLUDE_CODEX=true
  fi
fi

# ── 레거시 대형 프로젝트 프로파일 (dev + TypeScript 템플릿 전용) ───────
# 테스트가 거의 없고 tsc가 느린 기존 코드베이스에 일반 dev 프로파일을 깔면
# tdd-guard가 사실상 모든 편집을 차단하고 typescript-quality가 매 저장마다 타임아웃을 낸다.
INCLUDE_LEGACY=false
if is_dev_selected && is_ts_selected; then
  echo ""
  echo "레거시 대형 프로젝트 프로파일을 적용하시겠습니까?"
  echo "  - tdd-guard 제외 (테스트 파일 없는 소스 편집 차단 해제)"
  echo "  - typescript-quality --changed-only (증분 컴파일 + 방금 저장한 파일의 에러만 차단, 타임아웃 180s)"
  echo "  - 대상: 소스 수천 개·테스트 수십 개, tsc --noEmit 30초 초과인 기존 프로젝트"
  if ask_yn "  적용 (y/N): "; then
    INCLUDE_LEGACY=true
  fi
fi

# ── SEO·GEO 스킬 프로파일 (react-spa·nextjs 템플릿 + seo-geo 템플릿) ────────────
# 검색 노출이 목적이 아닌 사내 어드민·커머스 백오피스에는 SEO 계열 20종이 노이즈다.
# seo-geo 템플릿(2026-09-01)은 SEO 자체가 목적이라 n(제외)을 받지 않는다 — 프로파일(전체/커머스)만 고른다.
INCLUDE_SEO=true   # true=전체 / commerce=커머스 프로파일 / false=제외
if has_template "seo-geo"; then
  echo ""
  echo "seo-geo 템플릿 SEO·GEO 프로파일을 선택하세요 (프레임워크 비종속 17종 + writing 4종 + site-migration-seo):"
  echo "  c — 커머스·서비스 사이트 프로파일 (상품·카테고리·검색·카카오·네이버·GEO 중심. 로컬비즈니스·다국어·YMYL·VPAT·사이트 이전·Indexing API·모니터링 제외)"
  echo "  y — 전체 (블로그·미디어·다국어·로컬 비즈니스까지)"
  while true; do
    read -rp "  선택 (Y/c): " _seo_ans
    case "$_seo_ans" in
      y|Y|"") INCLUDE_SEO=true; break ;;
      c|C)    INCLUDE_SEO=commerce; break ;;
      n|N)    echo "  seo-geo 템플릿은 SEO 제외(n)가 없습니다 — SEO가 필요 없으면 템플릿 목록에서 11을 빼세요." ;;
      *)      echo "  y 또는 c를 입력하세요. (엔터 = y)" ;;
    esac
  done
elif has_template "react-spa" || has_template "nextjs"; then
  echo ""
  echo "SEO·GEO 스킬(sitemap·robots·JSON-LD·네이버·카카오·GEO 등 20종 + writing 4종)을 어떻게 포함할까요?"
  echo "  n — 제외 (로그인 뒤의 어드민·백오피스·사내 도구)"
  echo "  c — 커머스·서비스 사이트 프로파일 (상품·카테고리·검색·카카오·네이버·GEO 중심. 로컬비즈니스·다국어·YMYL·VPAT·사이트 이전·Indexing API 제외)"
  echo "  y — 전체 (블로그·미디어·다국어·로컬 비즈니스까지)"
  while true; do
    read -rp "  선택 (y/c/N): " _seo_ans
    case "$_seo_ans" in
      y|Y)    INCLUDE_SEO=true; break ;;
      c|C)    INCLUDE_SEO=commerce; break ;;
      n|N|"") INCLUDE_SEO=false; break ;;
      *)      echo "  y, c 또는 n을 입력하세요. (엔터 = n)" ;;
    esac
  done
fi

# ── 스킬·에이전트 작성 도구 (전 템플릿, util 제외) ───────────────────────
# 대상 프로젝트에서 자산을 직접 만들지 않으면 작성 규칙 5종(agent-design·creation-workflow·verification-policy·
# commands·readme-update ≈ 세션당 6k 토큰)과 작성 에이전트 3종이 순수 노이즈다. 기본 n.
INCLUDE_AUTHORING=false
if ! is_util_only; then
  echo ""
  echo "이 프로젝트 안에서 스킬·에이전트를 직접 작성·검증할 계획이 있습니까?"
  echo "  - y: 작성 규칙 5종 + agent-creator·skill-creator·skill-tester 포함"
  echo "  - n: 제외 (자산은 원본 레포에서 만들고 export만 하는 경우 — 세션당 약 6k 토큰 절약)"
  if ask_yn "  포함 (y/N): "; then
    INCLUDE_AUTHORING=true
  fi
fi
# 옵션 파생 제외 목록 — 에이전트·rules 루프보다 앞에 있어야 한다 (2026-08-26: 스킬 섹션에 두었다가 빈 배열로 평가되던 버그)
SEO_AGENTS=("validation/seo-auditor.md" "validation/content-quality-reviewer.md")
# seo-geo 템플릿 화이트리스트 (2026-09-01) — SEO 감사 2종 + 단독 설치 시에도 쓸 수 있는 조사·검증 최소 세트.
# 스택 에이전트(java-backend-developer 등)는 병행 선택한 스택 템플릿이 union 으로 보탠다.
SEO_GEO_AGENTS=(
  "validation/seo-auditor.md"
  "validation/content-quality-reviewer.md"
  "validation/fact-checker.md"
  "validation/source-validator.md"
  "research/web-searcher.md"
  "meta/claude-code-guide.md"
)
AUTHORING_AGENTS=("meta/agent-creator.md" "meta/skill-creator.md" "meta/skill-tester.md" "CLAUDE.md")
AUTHORING_RULES=("agent-design.md" "creation-workflow.md" "verification-policy.md" "commands.md" "readme-update.md")

# ── README 미업데이트 커밋 차단 (readme-guard) ─────────────────────────
INCLUDE_README_GUARD=false
if ! is_util_only; then
  echo ""
  echo "스킬/에이전트 수정 후 README 미업데이트 시 git commit/push 차단하시겠습니까?"
  echo "  (.claude/skills/ 또는 .claude/agents/ 파일 수정 시 적용)"
  if ask_yn "  활성화 (y/N): "; then
    INCLUDE_README_GUARD=true
  fi
fi

# ── staleness-check 강제 모드 (스킬 검증일 60일 초과 시 재검증 강제 지시) ──
INCLUDE_STALENESS_GUARD=false
if ! is_util_only; then
  echo ""
  echo "스킬 검증일 60일 초과 시 세션 시작마다 freshness-auditor 강제 재검증을 활성화하시겠습니까?"
  echo "  (30~59일: 경고만. 60일+: Claude가 다른 작업 전 반드시 재검증)"
  if ask_yn "  활성화 (y/N): "; then
    INCLUDE_STALENESS_GUARD=true
  fi
fi

# ── 브랜치 보호 규칙 ────────────────────────────────────────────────────
echo ""
echo "브랜치 보호 규칙을 활성화하시겠습니까?"
echo "  - main 브랜치로 직접 push 금지 (PR 필수)"
echo "  - 피처 브랜치에서 새 브랜치 생성 금지 (main에서만 브랜치 생성 허용)"
if ask_yn "  활성화 (y/N): "; then
  INCLUDE_BRANCH_PROTECTION=true
else
  INCLUDE_BRANCH_PROTECTION=false
fi

# ── 설치 시작 ─────────────────────────────────────────────────────────
echo ""
echo "대상: $TARGET"
echo "템플릿: $TEMPLATE_DISPLAY"
echo "memory 공유: $INCLUDE_MEMORY"
echo "Superpowers: $INCLUDE_SUPERPOWERS"
echo "Codex 리뷰: $INCLUDE_CODEX"
echo "레거시 프로파일: $INCLUDE_LEGACY"
echo "SEO 스킬: $INCLUDE_SEO"
echo "작성 도구: $INCLUDE_AUTHORING"
echo "README guard: $INCLUDE_README_GUARD"
echo "Staleness guard: $INCLUDE_STALENESS_GUARD"
echo "Branch protection: $INCLUDE_BRANCH_PROTECTION"
echo ""

# 기존 .claude/ 폴더가 있으면 쓰기 권한 확보
if [ -d "$TARGET/.claude" ]; then
  chmod -R u+w "$TARGET/.claude" 2>/dev/null || true
fi

# ── 0.5 이전 설치 잔재 정리 ─────────────────────────────────────────────
# 옵션 OFF 시 해당 훅·배선·rules·플러그인 잔재를 정리하고, 소스에서 폐지된 훅과
# 구세대 .cjs 훅을 제거한다. settings.json 덮어쓰기를 skip해도 옵션 선택이 반영된다.
# memory OFF 시 구버전 전역 symlink를 실제 디렉토리로 마이그레이션하고
# 레포 memory/ 를 전역으로 이전한다 (메모리 유실 없음). 상세: scripts/install-cleanup.js
if [ -d "$TARGET/.claude" ]; then
  echo "[cleanup] 이전 설치 잔재 정리"
  CLEANUP_KEEP=""
  [ "$INCLUDE_MEMORY" = "true" ]            && CLEANUP_KEEP="$CLEANUP_KEEP --keep-memory"
  [ "$INCLUDE_CODEX" = "true" ]             && CLEANUP_KEEP="$CLEANUP_KEEP --keep-codex"
  [ "$INCLUDE_BRANCH_PROTECTION" = "true" ] && CLEANUP_KEEP="$CLEANUP_KEEP --keep-branch-protection"
  [ "$INCLUDE_SUPERPOWERS" = "true" ]       && CLEANUP_KEEP="$CLEANUP_KEEP --keep-superpowers"
  [ "$INCLUDE_README_GUARD" = "true" ]      && CLEANUP_KEEP="$CLEANUP_KEEP --keep-readme-guard"
  [ "$INCLUDE_STALENESS_GUARD" = "true" ]   && CLEANUP_KEEP="$CLEANUP_KEEP --keep-staleness-strict"
  is_dev_selected                            && CLEANUP_KEEP="$CLEANUP_KEEP --keep-dev"
  [ "$INCLUDE_LEGACY" = "true" ]            && CLEANUP_KEEP="$CLEANUP_KEEP --legacy"
  [ "$INCLUDE_AUTHORING" = "true" ]         && CLEANUP_KEEP="$CLEANUP_KEEP --keep-authoring"
  is_ts_selected                             && CLEANUP_KEEP="$CLEANUP_KEEP --keep-typescript"

  # 매니페스트가 없는 구버전 설치 → 1회 확인 후 소스에 없는 스킬·에이전트·폐지 훅 일괄 정리.
  # 이후 설치부터는 매니페스트가 기록되므로 이 질문은 다시 나오지 않는다.
  if [ ! -f "$TARGET/.claude/.install-manifest.json" ] && \
     { [ -d "$TARGET/.claude/agents" ] || [ -d "$TARGET/.claude/skills" ] || [ -d "$TARGET/.claude/hooks" ]; }; then
    echo ""
    echo "  이 프로젝트에는 설치 매니페스트가 없습니다 (구버전 설치)."
    echo "  소스 레포에 없는 스킬·에이전트·폐지된 훅을 이전 설치 잔재로 보고 삭제할까요?"
    echo "  (이 프로젝트에서 직접 만든 커스텀 파일이 있다면 N — 목록만 경고로 출력됩니다)"
    read -rp "  잔재 삭제? [y/N] " _ORPHAN_ANSWER
    case "$_ORPHAN_ANSWER" in
      y|Y) CLEANUP_KEEP="$CLEANUP_KEEP --delete-orphans" ;;
    esac
    echo ""
  fi

  # shellcheck disable=SC2086 — keep 플래그는 공백 분리 의도
  node "$REPO_DIR/scripts/install-cleanup.js" --target "$TARGET" --source "$REPO_DIR" $CLEANUP_KEEP || \
    echo "  ⚠ 잔재 정리 실패 — 설치는 계속 진행"
  echo ""
fi

# 설치 매니페스트 수집 시작 — 이번 실행이 복사하는 에이전트·스킬·훅을 기록해
# 설치 마지막에 .claude/.install-manifest.json 으로 저장한다 (재설치 시 폐기 수렴 근거)
MANIFEST_AGENTS_TMP=$(mktemp)
MANIFEST_SKILLS_TMP=$(mktemp)
MANIFEST_DOCS_TMP=$(mktemp)   # 짝 docs(docs/skills/**, docs/agents/**) — <target>/docs/ 기준 상대경로 (2026-08-31)
MANIFEST_HOOKS_TMP=$(mktemp)

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
HOOKS_DEV_ONLY=("tdd-guard.js" "test-fake-guard.js" "adversarial-test-guard.js" "fake-impl-guard.js")

# TypeScript 전용 (react-spa·nextjs만)
HOOKS_TS_ONLY=("typescript-quality.js")

# Memory 선택 시 추가
HOOKS_MEMORY_SET=("memory-pull.js" "memory-sync.js")

# Codex 선택 시 추가
HOOKS_CODEX_SET=("codex-review-guard.js")

# Branch protection 선택 시 추가
HOOKS_BRANCH_SET=("branch-protection.js")

# 복사 목록 구성
HOOKS=("${HOOKS_COMMON[@]}")

if is_dev_selected; then
  if [ "$INCLUDE_LEGACY" = "true" ]; then
    # 레거시 프로파일: tdd-guard 제외
    for _h in "${HOOKS_DEV_ONLY[@]}"; do [ "$_h" != "tdd-guard.js" ] && HOOKS+=("$_h"); done
  else
    HOOKS+=("${HOOKS_DEV_ONLY[@]}")
  fi
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
    echo "$hook" >> "$MANIFEST_HOOKS_TMP"
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
  "meta/claude-code-guide.md"
  "meta/freshness-auditor.md"
)

# dream-interpretation: 꿈 앱 전용 에이전트 허용 목록
DREAM_APP_AGENTS=(
  "frontend/frontend-developer.md"
  "frontend/frontend-architect.md"
  "domain/frontend-domain-refactorer.md"
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
  "meta/claude-code-guide.md"
  "meta/tech-stack-advisor.md"
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
  # build-error-resolver 는 tsc·Vite/webpack 에러도 담당하므로 프론트 템플릿에 포함한다
  # (2026-08-26: 도메인 리팩터링 중 import 경로 깨짐 → tsc 에러 대량 발생 시 필요)
)
EXCLUDE_AGENTS_RUST=(
  "frontend/frontend-developer.md"
  "frontend/frontend-architect.md"
  "domain/frontend-domain-refactorer.md"
  "backend/java-backend-developer.md"
  "backend/java-backend-architect.md"
)
EXCLUDE_AGENTS_JAVA=(
  "frontend/frontend-developer.md"
  "frontend/frontend-architect.md"
  "domain/frontend-domain-refactorer.md"
  "backend/rust-backend-developer.md"
  "backend/rust-backend-architect.md"
  "backend/build-error-resolver.md"
  # 2026-08-31 누수 수정 — 프론트·SEO 전용 에이전트가 java 백엔드에 딸려가던 것 차단
  # (java 템플릿에서는 SEO 옵트아웃 질문이 나오지 않아 INCLUDE_SEO=true 기본값이 항상 통과했음)
  "frontend/CLAUDE.md"
  "validation/seo-auditor.md"
  "validation/content-quality-reviewer.md"
  "validation/a11y-auditor.md"
  "validation/build-perf-benchmarker.md"
  "validation/perf-report-writer.md"
)
# 위 2026-08-31 추가분 — 순수 java 재설치 시 이전 설치 잔재 정리(prune) 기록 대상
JAVA_AGENTS_NEWLY_EXCLUDED=(
  "frontend/CLAUDE.md"
  "validation/seo-auditor.md"
  "validation/content-quality-reviewer.md"
  "validation/a11y-auditor.md"
  "validation/build-perf-benchmarker.md"
  "validation/perf-report-writer.md"
)
EXCLUDE_AGENTS_GAME=(
  "frontend/frontend-developer.md"
  "frontend/frontend-architect.md"
  "domain/frontend-domain-refactorer.md"
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
  if [ "$tmpl" = "seo-geo" ]; then
    is_in_list "$rel" "${SEO_GEO_AGENTS[@]}" && return 0; return 1
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

# 옵션 파생 제외 (템플릿과 무관) — 재설치 시 정리 대상이 되도록 목록에도 기록
OPTION_EXCLUDED_TMP=$(mktemp)
_option_excluded_agent() {
  local rel="$1"
  [ "$INCLUDE_SEO" = "false" ]       && is_in_list "$rel" "${SEO_AGENTS[@]}"       && return 0
  [ "$INCLUDE_AUTHORING" = "false" ] && is_in_list "$rel" "${AUTHORING_AGENTS[@]}" && return 0
  return 1
}

# 선택된 템플릿 중 하나라도 포함하면 포함 (union)
should_include_agent() {
  local rel="$1"
  if _option_excluded_agent "$rel"; then record_excluded_agent "$rel"; return 1; fi
  # 작성 도구 y 는 템플릿 화이트리스트(seo-geo·academic·dream)보다 우선 — 질문이 약속한 에이전트 3종(+agents/CLAUDE.md)이
  # 화이트리스트 템플릿 단독 설치에서 조용히 빠지던 계약 위반 수정 (2026-09-01 Codex R3). util 단독은 질문 자체가 없다.
  if [ "$INCLUDE_AUTHORING" = "true" ] && is_in_list "$rel" "${AUTHORING_AGENTS[@]}"; then return 0; fi
  for _tmpl in "${TEMPLATES[@]}"; do
    _agent_ok_for_tmpl "$rel" "$_tmpl" && return 0
  done
  # java 템플릿 누수 수정(2026-08-31)으로 새로 제외된 에이전트 — 순수 java 재설치에서 잔재 정리 기록
  if is_only_java_selected && is_in_list "$rel" "${JAVA_AGENTS_NEWLY_EXCLUDED[@]}"; then
    record_excluded_agent "$rel"
  fi
  # seo-geo 소유 에이전트가 빠졌다면(애드온 제거 `11→util`·`5,11→5`) 조합 조건 없이 기록 (2026-09-01 Codex R2).
  # 여기 도달 = 선택된 어떤 템플릿도 포함하지 않음. 삭제는 매니페스트 해시 증명 하에서만.
  if is_in_list "$rel" "${SEO_GEO_AGENTS[@]}"; then
    record_excluded_agent "$rel"
  fi
  return 1
}

# 제외 에이전트를 prune 목록에 기록 — 짝 docs(문서·verification)도 함께 (2026-08-31 Codex R1)
record_excluded_agent() {
  local _rel="$1"
  echo "agents|$_rel" >> "$OPTION_EXCLUDED_TMP"
  [ -f "$TARGET/docs/agents/$_rel" ] && echo "docs|agents/$_rel" >> "$OPTION_EXCLUDED_TMP"
  [ -f "$TARGET/docs/agents/${_rel%.md}-verification.md" ] && \
    echo "docs|agents/${_rel%.md}-verification.md" >> "$OPTION_EXCLUDED_TMP"
  return 0
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
    echo "$rel" >> "$MANIFEST_AGENTS_TMP"

    # 같은 에이전트의 docs 페어링 복사
    # 1) docs/agents/{cat}/{name}.md
    agent_doc_src="$REPO_DIR/docs/agents/$rel"
    if [ -f "$agent_doc_src" ]; then
      agent_doc_dest="$TARGET/docs/agents/$rel"
      mkdir -p "$(dirname "$agent_doc_dest")"
      if cp -f "$agent_doc_src" "$agent_doc_dest" 2>/dev/null; then
        echo "  → docs/agents/$rel"
        echo "agents/$rel" >> "$MANIFEST_DOCS_TMP"
      fi
    fi
    # 2) docs/agents/{cat}/{name}-verification.md (접미사 형태)
    agent_name_no_ext="${rel%.md}"
    agent_verif_rel="${agent_name_no_ext}-verification.md"
    agent_verif_src="$REPO_DIR/docs/agents/$agent_verif_rel"
    if [ -f "$agent_verif_src" ]; then
      agent_verif_dest="$TARGET/docs/agents/$agent_verif_rel"
      mkdir -p "$(dirname "$agent_verif_dest")"
      if cp -f "$agent_verif_src" "$agent_verif_dest" 2>/dev/null; then
        echo "  → docs/agents/$agent_verif_rel"
        echo "agents/$agent_verif_rel" >> "$MANIFEST_DOCS_TMP"
      fi
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
    adversarial-testing.md)
      # 적대적 테스트 강제 훅(adversarial-test-guard·fake-impl-guard)이 참조 — dev 템플릿 전체에 포함
      case "$tmpl" in all|react-spa|nextjs|rust-axum|java-spring-legacy|java-spring-modern|unity-game|health) return 0 ;; esac ;;
  esac
  return 1
}

should_include_rule() {
  local name="$1"
  [ "$name" = "memory-sync.md" ]  && { [ "$INCLUDE_MEMORY" = "true" ] && return 0 || return 1; }
  [ "$name" = "codex-review.md" ] && { [ "$INCLUDE_CODEX" = "true" ]  && return 0 || return 1; }
  [ "$INCLUDE_AUTHORING" = "false" ] && is_in_list "$name" "${AUTHORING_RULES[@]}" && return 1
  for _tmpl in "${TEMPLATES[@]}"; do
    _rule_ok_for_tmpl "$name" "$_tmpl" && return 0
  done
  return 1
}

mkdir -p "$TARGET/.claude/rules"
MANIFEST_RULES_TMP=$(mktemp)
for rule in "$REPO_DIR/.claude/rules"/*.md; do
  [ -f "$rule" ] || continue
  name="$(basename "$rule")"
  if ! should_include_rule "$name"; then continue; fi
  if cp -f "$rule" "$TARGET/.claude/rules/$name" 2>/dev/null; then
    echo "  → .claude/rules/$name"
    echo "$name" >> "$MANIFEST_RULES_TMP"
  else
    echo "  ✗ .claude/rules/$name (복사 실패)"
  fi
done

# ── 4. skills ────────────────────────────────────────────────────────────
echo ""
echo "[skills]"

# skills/CLAUDE.md (스킬 작업 시 creation-workflow, info-verification 자동 로드) — 작성 도구 선택 시에만.
# 선택 해제 재설치면 이전 설치분을 정리하되, 소스와 동일(미수정)할 때만 삭제한다 (매니페스트 비대상 파일이라 cmp로 소유 증명)
if [ "$INCLUDE_AUTHORING" = "false" ] && [ -f "$TARGET/.claude/skills/CLAUDE.md" ]; then
  if cmp -s "$REPO_DIR/.claude/skills/CLAUDE.md" "$TARGET/.claude/skills/CLAUDE.md"; then
    rm -f "$TARGET/.claude/skills/CLAUDE.md" && echo "  [prune] 작성 도구 제외로 삭제: .claude/skills/CLAUDE.md"
  else
    echo "  ⚠ .claude/skills/CLAUDE.md 가 소스와 달라 보존합니다 (로컬 수정본?)"
  fi
fi
if [ "$INCLUDE_AUTHORING" = "true" ] && [ -f "$REPO_DIR/.claude/skills/CLAUDE.md" ]; then
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
  "meta/dream-app-ab-testing-prompts"   # 2026-08-26: 실제 폴더명으로 정정 (구 dream-interpretation-ab-testing-prompts — 오타로 제외가 안 되고 있었음)
  "meta/dream-interpretation-prompt-engineering"
  "meta/dream-safety-classifier-prompts"
)

# dream-interpretation 전용 architecture 스킬
DREAM_ARCH_SKILLS=("architecture/dream-journal-data-modeling")

# n8n 자동화 스킬 — LLM 워크플로우 템플릿(health·dream)과 백엔드에서만. 프론트(react-spa·nextjs)에는 노이즈 (2026-08-26)
N8N_SKILLS=(
  "devops/n8n-error-handling"
  "devops/n8n-llm-integration"
  "devops/n8n-self-hosting"
  "devops/n8n-webhook-patterns"
  "devops/n8n-workflow-design"
)

# SEO 옵트아웃 시 함께 빠지는 devops 스킬 (에이전트·규칙 목록은 옵션 질문 직후에 정의 — 에이전트·rules 루프가 먼저 돈다)
SEO_DEVOPS_SKILLS=("devops/site-migration-seo")

# 커머스 프로파일(INCLUDE_SEO=commerce)에서 제외 — 상품·서비스 사이트에 무관한 SEO 스킬 (2026-08-26)
# google-indexing-api 는 공식적으로 JobPosting·BroadcastEvent 전용이라 상품 페이지에 쓰면 오남용
SEO_NONCOMMERCE_SKILLS=(
  "frontend/local-business-seo"
  "frontend/i18n-seo"
  "frontend/google-indexing-api"
  "frontend/seo-monitoring-automation"
  "writing/ymyl-content-seo"
  "writing/multilingual-content-strategy"
  "writing/accessibility-vpat-writing"
  "devops/site-migration-seo"
)

# 프레임워크별 SEO 구현 스킬 — 템플릿과 맞지 않는 것은 프로파일과 무관하게 제외 (react-spa 에 seo-nextjs 가 딸려가던 노이즈)
_seo_framework_skill_ok() {
  local prefix="$1" tmpl="$2"
  case "$prefix" in
    frontend/seo-nextjs)      [ "$tmpl" = "nextjs" ] ;;
    frontend/seo-vite-spa)    [ "$tmpl" = "react-spa" ] || [ "$tmpl" = "health" ] ;;
    frontend/seo-static-html) return 1 ;;
    *) return 0 ;;
  esac
}

is_in_skill_list() { local p="$1"; shift; for s in "$@"; do [[ "$p" == "$s" ]] && return 0; done; return 1; }

# dream-interpretation 전용 frontend 스킬 — react-spa·nextjs·health 템플릿에서 제외 (2026-08-26)
# (꿈 일기 앱의 UI·음성·SRS·LLM 채팅 기능. 일반 프론트 프로젝트에는 노이즈)
DREAM_FRONTEND_SKILLS=(
  "frontend/dream-app-onboarding"
  "frontend/dream-export-import"
  "frontend/dream-image-generation"
  "frontend/dream-privacy-consent-ui"
  "frontend/dream-recurrence-detection"
  "frontend/dream-sharing-anonymized"
  "frontend/dream-statistics-visualization"
  "frontend/dream-symbol-tagging"
  "frontend/emotion-tagging-input"
  "frontend/srs-spaced-repetition"
  "frontend/voice-input-ui"
  "frontend/web-speech-api-stt"
  "frontend/web-speech-api-tts"
  "frontend/whisper-api-integration"
  "frontend/media-recorder-api"
  "frontend/pwa-offline-llm-fallback"
  "frontend/chat-ui-pattern"
  "frontend/claude-api-streaming-frontend"
)

# SEO·GEO 계열 frontend 스킬 — INCLUDE_SEO=false 면 react-spa·nextjs에서 제외 (2026-08-26)
SEO_FRONTEND_SKILLS=(
  "frontend/bot-management-seo"
  "frontend/ecommerce-seo"
  "frontend/geo-ai-discoverability"
  "frontend/google-indexing-api"
  "frontend/i18n-seo"
  "frontend/image-optimization-seo"
  "frontend/kakao-share-optimization"
  "frontend/local-business-seo"
  "frontend/mobile-seo-pwa"
  "frontend/naver-seo-specifics"
  "frontend/og-image-generation"
  "frontend/schema-org-patterns"
  "frontend/search-console-webmaster"
  "frontend/security-headers-seo"
  "frontend/seo-monitoring-automation"
  "frontend/seo-nextjs"
  "frontend/seo-static-html"
  "frontend/seo-vite-spa"
  "frontend/structured-data-validation-api"
  "frontend/url-canonicalization-redirects"
)

is_dream_frontend() {
  local prefix="$1"
  for s in "${DREAM_FRONTEND_SKILLS[@]}"; do [[ "$prefix" == "$s" ]] && return 0; done
  return 1
}

is_seo_frontend() {
  local prefix="$1"
  for s in "${SEO_FRONTEND_SKILLS[@]}"; do [[ "$prefix" == "$s" ]] && return 0; done
  return 1
}

is_seo_writing() {
  local prefix="$1"
  for s in "${SEO_WRITING_SKILLS[@]}"; do [[ "$prefix" == "$s" ]] && return 0; done
  return 1
}

# seo-geo 템플릿(11) 소유 스킬 (2026-09-01) — 프레임워크 비종속 SEO·GEO 17종 + writing 4종 + site-migration-seo.
# 프레임워크 종속 3종(seo-nextjs·seo-vite-spa·og-image-generation[Next ImageResponse/satori])은 nextjs·react-spa 소유 유지 —
# `3,11`처럼 병행 선택하면 union 으로 함께 온다. seo-static-html 은 그간 어느 템플릿도 소유하지 않아 export 되지 않던 스킬로,
# JSP·Thymeleaf 등 서버 렌더 HTML 에 가장 가까워 이 템플릿이 소유한다.
SEO_GEO_SKILLS=(
  "frontend/bot-management-seo"
  "frontend/ecommerce-seo"
  "frontend/geo-ai-discoverability"
  "frontend/google-indexing-api"
  "frontend/i18n-seo"
  "frontend/image-optimization-seo"
  "frontend/kakao-share-optimization"
  "frontend/local-business-seo"
  "frontend/mobile-seo-pwa"
  "frontend/naver-seo-specifics"
  "frontend/schema-org-patterns"
  "frontend/search-console-webmaster"
  "frontend/security-headers-seo"
  "frontend/seo-monitoring-automation"
  "frontend/seo-static-html"
  "frontend/structured-data-validation-api"
  "frontend/url-canonicalization-redirects"
  "writing/content-eeat-quality"
  "writing/multilingual-content-strategy"
  "writing/ymyl-content-seo"
  "writing/accessibility-vpat-writing"
  "devops/site-migration-seo"
)

is_seo_geo_skill() {
  local prefix="$1"
  for s in "${SEO_GEO_SKILLS[@]}"; do [[ "$prefix" == "$s" ]] && return 0; done
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
  # 2.5→3.x 탈출 경로는 레거시 템플릿의 핵심 유스케이스 (2026-08-31: 배열 미등록으로 탈락하던 버그 수정)
  "backend/spring-boot-2-to-3-migration"
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

# java 템플릿에서 제외할 backend 외 카테고리 스킬 (2026-08-31)
# — "backend만 화이트리스트, 나머지 카테고리 fallthrough" 구조라 dream·n8n·SEO·frontend 계열이
#   자바 백엔드 프로젝트에 흘러들던 누수 차단. docker-deployment·github-actions·ddd·
#   incremental-refactoring·module-boundaries·meta 워크플로우 3종은 백엔드에도 유효해 유지.
JAVA_EXCLUDED_EXTRA_SKILLS=(
  "architecture/frontend-domain-structure"
  "devops/site-migration-seo"
  "devops/github-actions-visual-regression"
  "devops/vercel-sandbox"
)
is_java_noncore_excluded() {
  local prefix="$1"
  is_dream_meta "$prefix" && return 0
  is_in_skill_list "$prefix" "${DREAM_ARCH_SKILLS[@]}" && return 0
  is_in_skill_list "$prefix" "${N8N_SKILLS[@]}" && return 0
  is_in_skill_list "$prefix" "${JAVA_EXCLUDED_EXTRA_SKILLS[@]}" && return 0
  return 1
}

# ── 다중 템플릿 스킬 포함 판정 ──────────────────────────────────────────

# 단일 템플릿 기준으로 스킬 포함 여부 반환 (0=포함, 1=제외)
_skill_ok_for_tmpl() {
  local rel="$1" skill_prefix="$2" tmpl="$3"
  if [ "$tmpl" = "all" ]; then return 0; fi
  # health 도메인 스킬(영양·식단 5종)은 health 템플릿에서만 — 그 외 전 템플릿(util·academic·dream·rust·java·unity·react·next) 누출 차단
  if [[ "$rel" == health/* && "$tmpl" != "health" ]]; then return 1; fi
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
    # 꿈 일기 앱 전용 스킬(frontend 18·meta 3·architecture 1)은 dream-interpretation 템플릿에서만
    [[ "$rel" == frontend/* ]] && is_dream_frontend "$skill_prefix" && return 1
    [[ "$rel" == meta/* ]] && is_dream_meta "$skill_prefix" && return 1
    is_in_skill_list "$skill_prefix" "${DREAM_ARCH_SKILLS[@]}" && return 1
    # n8n 자동화는 프론트 템플릿(react-spa·nextjs)에 노이즈 — health 는 LLM 워크플로우가 있어 유지
    [[ "$tmpl" != "health" ]] && is_in_skill_list "$skill_prefix" "${N8N_SKILLS[@]}" && return 1
    # SEO 계열은 사용자가 n 을 고르면 제외 (writing 4종·devops 1종 포함)
    if [ "$INCLUDE_SEO" = "false" ]; then
      [[ "$rel" == frontend/* ]] && is_seo_frontend "$skill_prefix" && return 1
      [[ "$rel" == writing/* ]] && return 1
      is_in_skill_list "$skill_prefix" "${SEO_DEVOPS_SKILLS[@]}" && return 1
    fi
    # 커머스 프로파일 — 무관 SEO 8종 제외
    if [ "$INCLUDE_SEO" = "commerce" ]; then
      is_in_skill_list "$skill_prefix" "${SEO_NONCOMMERCE_SKILLS[@]}" && return 1
    fi
    # 프레임워크에 안 맞는 SEO 구현 스킬 제외 (프로파일 무관)
    _seo_framework_skill_ok "$skill_prefix" "$tmpl" || return 1
    [[ "$rel" == writing/* ]] && ! is_seo_writing "$skill_prefix" && return 1
    return 0
  fi
  if [ "$tmpl" = "rust-axum" ]; then
    [[ "$rel" == frontend/* || "$rel" == game/* || "$rel" == humanities/* ||
       "$rel" == education/* || "$rel" == research/* || "$rel" == writing/* ]] && return 1
    [[ "$rel" == backend/* ]] && is_java_skill "$skill_prefix" && return 1
    # dream 전용·프론트 아키텍처 스킬 fallthrough 누수 차단 (2026-08-31, java와 동일 결함)
    [[ "$rel" == meta/* ]] && is_dream_meta "$skill_prefix" && return 1
    is_in_skill_list "$skill_prefix" "${DREAM_ARCH_SKILLS[@]}" && return 1
    [[ "$skill_prefix" == "architecture/frontend-domain-structure" ]] && return 1
    return 0
  fi
  if [ "$tmpl" = "java-spring-legacy" ]; then
    [[ "$rel" == frontend/* || "$rel" == game/* || "$rel" == humanities/* ||
       "$rel" == education/* || "$rel" == research/* || "$rel" == writing/* ]] && return 1
    [[ "$rel" == backend/* ]] && ! is_java_skill "$skill_prefix" && return 1
    is_java_noncore_excluded "$skill_prefix" && return 1
    for _m in "${JAVA_SKILLS_MODERN_ONLY[@]}"; do
      [[ "$skill_prefix" == "$_m" ]] && return 1
    done
    return 0
  fi
  if [ "$tmpl" = "java-spring-modern" ]; then
    [[ "$rel" == frontend/* || "$rel" == game/* || "$rel" == humanities/* ||
       "$rel" == education/* || "$rel" == research/* || "$rel" == writing/* ]] && return 1
    [[ "$rel" == backend/* ]] && ! is_java_skill "$skill_prefix" && return 1
    is_java_noncore_excluded "$skill_prefix" && return 1
    for _l in "${JAVA_SKILLS_LEGACY_ONLY[@]}"; do
      [[ "$skill_prefix" == "$_l" ]] && return 1
    done
    return 0
  fi
  if [ "$tmpl" = "unity-game" ]; then
    [[ "$rel" == frontend/* || "$rel" == backend/* || "$rel" == humanities/* ||
       "$rel" == education/* || "$rel" == research/* || "$rel" == writing/* ]] && return 1
    # dream 전용·프론트 아키텍처 스킬 fallthrough 누수 차단 (2026-08-31, java와 동일 결함)
    [[ "$rel" == meta/* ]] && is_dream_meta "$skill_prefix" && return 1
    is_in_skill_list "$skill_prefix" "${DREAM_ARCH_SKILLS[@]}" && return 1
    [[ "$skill_prefix" == "architecture/frontend-domain-structure" ]] && return 1
    return 0
  fi
  if [ "$tmpl" = "seo-geo" ]; then
    # 화이트리스트 방식 — 소유 목록 밖은 전부 제외 (스택 스킬은 병행 템플릿이 union 으로 보탠다)
    is_seo_geo_skill "$skill_prefix" || return 1
    # 커머스 프로파일: 상품·서비스 사이트에 무관한 8종 제외 (react-spa·nextjs 와 같은 기준)
    [ "$INCLUDE_SEO" = "commerce" ] && is_in_skill_list "$skill_prefix" "${SEO_NONCOMMERCE_SKILLS[@]}" && return 1
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
    # 이번 템플릿 범위인데 옵션(SEO n)·전용 스킬 누출 차단으로 빠진 것은 재설치 정리 목록에 기록
    if is_ts_selected && { is_seo_frontend "$skill_prefix" || is_dream_frontend "$skill_prefix" || is_dream_meta "$skill_prefix" ||
         is_in_skill_list "$skill_prefix" "${DREAM_ARCH_SKILLS[@]}" "${N8N_SKILLS[@]}" "${SEO_DEVOPS_SKILLS[@]}" "${SEO_WRITING_SKILLS[@]}" "${SEO_NONCOMMERCE_SKILLS[@]}"; }; then
      record_excluded_skill "$rel" "$skill_prefix"
    fi
    # seo-geo 소유 스킬이 이번에 빠졌다면 조합 조건 없이 기록 (2026-09-01, Codex R2: 애드온 제거 `5,11→5`·`11→util`
    # 미수렴 지적 수용). should_include_skill 이 false 라는 것 자체가 "선택된 어떤 템플릿도 소유하지 않는다"는 뜻이라
    # 프로파일 전환(전체→커머스)·애드온 제거 어느 경로든 안전하다. 삭제는 여전히 매니페스트 해시 증명 하에서만.
    # ts 템플릿 병행 시 위 분기와 중복 기록될 수 있으나 prune 은 파일 단위 존재·해시 검사라 무해하다.
    if is_seo_geo_skill "$skill_prefix"; then
      record_excluded_skill "$rel" "$skill_prefix"
    fi
    # 템플릿 누수 수정(2026-08-31)으로 제외된 스킬 — 소유자 없는 템플릿 조합의 재설치에서 잔재 정리 기록
    # (seo-geo 병행 시 그 소유분은 위에서 처리했거나 포함됐으므로 여기선 제외)
    if is_only_java_selected && is_java_noncore_excluded "$skill_prefix" && ! is_seo_geo_skill "$skill_prefix"; then
      record_excluded_skill "$rel" "$skill_prefix"          # java 고유 누수 전체 (n8n·SEO devops 포함)
    elif is_leakscope_only_selected && { { [[ "$rel" == meta/* ]] && is_dream_meta "$skill_prefix"; } ||
         is_in_skill_list "$skill_prefix" "${DREAM_ARCH_SKILLS[@]}" ||
         [[ "$skill_prefix" == "architecture/frontend-domain-structure" ]]; }; then
      record_excluded_skill "$rel" "$skill_prefix"          # java·rust·unity 공통 누수 (혼합 조합 포함)
    fi
    echo "  skip .claude/skills/$rel" && continue
  fi

  dest="$TARGET/.claude/skills/$rel"
  mkdir -p "$(dirname "$dest")"
  if cp -f "$src_path" "$dest" 2>/dev/null; then
    echo "  → .claude/skills/$rel"
    echo "$rel" >> "$MANIFEST_SKILLS_TMP"

    # SKILL.md 외 부속 파일(references/ 등)도 함께 복사 — 본문이 참조하는 파일 누락 방지 (2026-08-31)
    # 파일별로 매니페스트에 기록해 재설치 정리(소유 증명) 대상에 포함한다
    _skill_src_dir="$(dirname "$src_path")"
    while IFS= read -r _extra; do
      _extra_rel="${_extra#$REPO_DIR/.claude/skills/}"
      _extra_dest="$TARGET/.claude/skills/$_extra_rel"
      mkdir -p "$(dirname "$_extra_dest")"
      if cp -f "$_extra" "$_extra_dest" 2>/dev/null; then
        echo "  → .claude/skills/$_extra_rel"
        echo "$_extra_rel" >> "$MANIFEST_SKILLS_TMP"
      else
        echo "  ✗ .claude/skills/$_extra_rel (복사 실패)"
      fi
    done < <(find "$_skill_src_dir" -type f ! -name 'SKILL.md' 2>/dev/null)

    # 같은 스킬의 docs 페어링 복사 (docs/skills/{cat}/{name}/)
    docs_src_dir="$REPO_DIR/docs/skills/$skill_prefix"
    if [ -d "$docs_src_dir" ]; then
      docs_dest_dir="$TARGET/docs/skills/$skill_prefix"
      mkdir -p "$docs_dest_dir"
      if cp -Rf "$docs_src_dir/." "$docs_dest_dir/" 2>/dev/null; then
        echo "  → docs/skills/$skill_prefix/"
        ( cd "$TARGET/docs" && find "skills/$skill_prefix" -type f 2>/dev/null ) >> "$MANIFEST_DOCS_TMP"
      else
        echo "  ✗ docs/skills/$skill_prefix/ (복사 실패)"
      fi
    fi
  else
    echo "  ✗ .claude/skills/$rel (복사 실패)"
  fi
done

# ── 4.5 commands (슬래시 커맨드) ──────────────────────────────────────────
# 그동안 export 대상에서 빠져 있었다 (2026-08-26 추가). /commit·/create-pr 등은 rules/git.md 와
# 짝이라 규칙만 가고 커맨드가 없으면 반쪽이다. util 은 git 계열만, codex-review 는 Codex 선택 시만.
echo ""
echo "[commands]"
COMMANDS_UTIL=("commit.md" "create-pr.md" "context-prime.md")
COMMANDS_DEV=("create-plan.md" "fix-pr.md" "update-docs.md" "tdd-implement.md" "agent-status.md" "sparc-refine.md")
COMMANDS=("${COMMANDS_UTIL[@]}")
is_util_only || COMMANDS+=("${COMMANDS_DEV[@]}")
[ "$INCLUDE_CODEX" = "true" ] && COMMANDS+=("codex-review.md")
# 레거시 프로파일에서 /tdd-implement 는 tdd-guard 없이도 동작하지만 강제 흐름이 아니라 안내용으로 남긴다
mkdir -p "$TARGET/.claude/commands"
MANIFEST_COMMANDS_TMP=$(mktemp)
for cmd in "${COMMANDS[@]}"; do
  if [ -f "$REPO_DIR/.claude/commands/$cmd" ]; then
    if cp -f "$REPO_DIR/.claude/commands/$cmd" "$TARGET/.claude/commands/$cmd" 2>/dev/null; then
      echo "  → .claude/commands/$cmd"
      echo "$cmd" >> "$MANIFEST_COMMANDS_TMP"
    else
      echo "  ✗ .claude/commands/$cmd (복사 실패)"
    fi
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
      echo "skills/VERIFICATION_TEMPLATE.md" >> "$MANIFEST_DOCS_TMP"
    else
      echo "  ✗ docs/skills/VERIFICATION_TEMPLATE.md (복사 실패)"
    fi
  fi

  # docs/hooks/ (훅 문서 — 모든 템플릿이 동일한 훅 세트를 받으므로 통째 복사)
  # 공용 docs도 매니페스트에 기록해 소유 증명을 남긴다 (2026-08-31 Codex R2 — 삭제 경로는 후속 과제)
  if [ -d "$REPO_DIR/docs/hooks" ]; then
    mkdir -p "$TARGET/docs/hooks"
    if cp -Rf "$REPO_DIR/docs/hooks/." "$TARGET/docs/hooks/" 2>/dev/null; then
      echo "  → docs/hooks/"
      ( cd "$TARGET/docs" && find "hooks" -type f 2>/dev/null ) >> "$MANIFEST_DOCS_TMP"
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
  [ "$INCLUDE_LEGACY" = "true" ]      && GEN_FLAGS="$GEN_FLAGS --legacy"
  [ "$INCLUDE_MEMORY" = "true" ]      && GEN_FLAGS="$GEN_FLAGS --memory"
  [ "$INCLUDE_SUPERPOWERS" = "true" ] && GEN_FLAGS="$GEN_FLAGS --superpowers"
  [ "$INCLUDE_CODEX" = "true" ]       && GEN_FLAGS="$GEN_FLAGS --codex"
  [ "$INCLUDE_README_GUARD" = "true" ]      && GEN_FLAGS="$GEN_FLAGS --readme-guard"
  [ "$INCLUDE_STALENESS_GUARD" = "true" ]   && GEN_FLAGS="$GEN_FLAGS --staleness-guard"
  [ "$INCLUDE_BRANCH_PROTECTION" = "true" ] && GEN_FLAGS="$GEN_FLAGS --branch-protection"

  if node "$REPO_DIR/scripts/gen-settings.js" $GEN_FLAGS > "$SETTINGS_FILE" 2>/dev/null; then
    _SUFFIX=""
    [ "$INCLUDE_LEGACY" = "true" ]      && _SUFFIX="$_SUFFIX +legacy"
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
      # 을 제외한 도메인 전용 ## 섹션 추출. 연속 빈 줄 접기는 awk 로 — 이전의
      # `sed '/…/{ N; /…/d }'` 는 BSD sed(macOS)에서 "extra characters at the end of d command" 로 실패해
      # 다중 템플릿 도메인 섹션이 macOS 에서 한 번도 append 되지 않고 있었다 (2026-09-01 seo-geo E2E 에서 발견).
      _domain_content=$(awk '
        /^# /                                         { skip=1; next }
        /^## (필수 원칙|금지 사항|규칙 참조)/         { skip=1; next }
        /^## /                                        { skip=0 }
        /^---/                                        { skip=0; next }
        /^<!-- common-rules -->/                      { skip=1; next }
        !skip                                         { print }
      ' "$_add_src" | awk '
        NF        { if (!started) started=1; lines[++n]=$0; last=n; next }
        started   { lines[++n]=$0 }
        END       { blank=0
                    for (i=1; i<=last; i++) {
                      if (lines[i] ~ /^[[:space:]]*$/) { if (blank) continue; blank=1 } else blank=0
                      print lines[i]
                    } }')   # 앞뒤 빈 줄 제거 + 연속 빈 줄 접기

      if [ -n "$_domain_content" ]; then
        # ## 규칙 참조 섹션 바로 앞에 "도메인 섹션 + ---" 삽입 (베이스 CLAUDE.md 의 `---` 다음 자리).
        # `awk -v domain="<여러 줄>"` 은 BSD awk(macOS)가 "newline in string" 으로 거부하므로 임시 파일 + getline 으로 주입.
        _DOMAIN_TMP=$(mktemp)
        printf '%s\n' "$_domain_content" > "$_DOMAIN_TMP"
        TMP=$(mktemp)
        awk -v dfile="$_DOMAIN_TMP" '
          /^## 규칙 참조/ && added==0 {
            while ((getline line < dfile) > 0) print line
            close(dfile)
            print ""
            print "---"
            print ""
            added=1
          }
          { print }
        ' "$CLAUDE_FILE" > "$TMP" && mv "$TMP" "$CLAUDE_FILE"
        rm -f "$_DOMAIN_TMP"
        echo "  ✓ ${_add_tmpl} 도메인 섹션 추가"
      fi

      # 추가 템플릿의 `## 금지 사항` 항목은 버리지 않고 베이스 금지 사항 끝에 병합한다 (2026-09-01 Codex R3:
      # seo-geo 의 클로킹·미검증 JSON-LD·robots 변경 금지 같은 핵심 가드레일이 `5,11` 에서 통째로 빠지던 문제).
      # `<!-- common-rules -->` 자리표시자는 베이스에서 이미 주입됐으므로 `- ` 항목만 가져온다.
      _domain_prohibitions=$(awk '
        /^## 금지 사항/ { f=1; next }
        /^## / || /^---/ { f=0 }
        f && /^- /      { print }
      ' "$_add_src")
      if [ -n "$_domain_prohibitions" ] && grep -q "^## 금지 사항" "$CLAUDE_FILE" 2>/dev/null; then
        _PROHIB_TMP=$(mktemp)
        { echo "<!-- ${_add_tmpl} 금지 사항 -->"; printf '%s\n' "$_domain_prohibitions"; } > "$_PROHIB_TMP"
        TMP=$(mktemp)
        awk -v pfile="$_PROHIB_TMP" '
          /^## 금지 사항/ { insec=1 }
          insec && /^---/ && !done {
            while ((getline line < pfile) > 0) print line
            close(pfile)
            print ""
            done=1; insec=0
          }
          { print }
        ' "$CLAUDE_FILE" > "$TMP" && mv "$TMP" "$CLAUDE_FILE"
        rm -f "$_PROHIB_TMP"
        echo "  ✓ ${_add_tmpl} 금지 사항 병합"
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

# ── 설치 매니페스트 저장 ────────────────────────────────────────────────
# 이번 실행이 복사한 파일 + (이전 매니페스트 중 아직 대상에 존재하는 파일)의 합집합에
# 설치 시점 sha256을 함께 기록한다. 재설치 시 cleanup이 이 목록으로 "설치 관리 파일 vs
# 커스텀"을 추측 없이 판별하고, 해시가 일치하는(=손대지 않은) 파일만 폐기 삭제한다.
# memoryManaged는 옵션값이 기본이되 memory 이전 미완 시 유지된다 — 상세: scripts/write-install-manifest.js
# 옵션 제외분 정리 — 이전 설치가 복사했지만 이번에 옵션(SEO n·작성 도구 n)이나 전용 스킬 차단으로 빠진 파일을
# 매니페스트 소유 증명(기록+해시 일치) 하에 삭제한다. 다른 템플릿 자산은 목록에 없으므로 건드리지 않는다.
if [ -s "$OPTION_EXCLUDED_TMP" ]; then
  echo ""
  echo "[옵션 제외 정리]"
  node "$REPO_DIR/scripts/prune-option-excluded.js" "$TARGET" "$OPTION_EXCLUDED_TMP" "$REPO_DIR" || echo "  ⚠ 옵션 제외 정리 실패 — 잔재는 다음 재설치에서 재시도"
fi
rm -f "$OPTION_EXCLUDED_TMP"

node "$REPO_DIR/scripts/write-install-manifest.js" \
  "$TARGET" "$MANIFEST_AGENTS_TMP" "$MANIFEST_SKILLS_TMP" "$INCLUDE_MEMORY" "$MANIFEST_HOOKS_TMP" "$MANIFEST_COMMANDS_TMP" "$MANIFEST_RULES_TMP" "$MANIFEST_DOCS_TMP" || \
  echo "  ⚠ 매니페스트 저장 실패 — 다음 재설치 시 잔재 확인 질문이 다시 표시됩니다"
rm -f "$MANIFEST_AGENTS_TMP" "$MANIFEST_SKILLS_TMP" "$MANIFEST_HOOKS_TMP" "$MANIFEST_COMMANDS_TMP" "$MANIFEST_RULES_TMP" "$MANIFEST_DOCS_TMP"

# ── 레거시 프로파일: typescript-quality 베이스라인 시드 ─────────────────
# --changed-only 는 "직전 통과 시점의 에러 집합"과 비교해 새 에러만 차단한다. 베이스라인이 없는 첫 저장은
# 편집 파일의 에러로만 판정할 수밖에 없어 다른 파일의 회귀를 한 번 놓칠 수 있으므로 지금 만들어 둔다.
if [ "$INCLUDE_LEGACY" = "true" ] && [ -f "$TARGET/.claude/hooks/typescript-quality.js" ]; then
  echo ""
  echo "[typescript-quality 베이스라인]"
  # 훅은 편집 파일에서 가장 가까운 tsconfig 디렉토리를 프로젝트 루트로 삼는다. 루트 tsconfig 가 있어도 패키지마다
  # 자체 tsconfig 가 있는 모노레포가 흔하므로 **루트 + 중첩 패키지(깊이 2~3) 전부**를 시드한다
  # (2026-08-26 Codex 리뷰: 루트만 시드하면 패키지 안 첫 저장에서 소비자 회귀 공백이 다시 열린다).
  _TS_ROOTS=()
  [ -f "$TARGET/tsconfig.json" ] && _TS_ROOTS+=("$TARGET")
  while IFS= read -r _f; do _TS_ROOTS+=("$(dirname "$_f")"); done < <(
    find "$TARGET" -mindepth 2 -maxdepth 3 -name tsconfig.json -not -path '*/node_modules/*' -not -path '*/.claude/*' 2>/dev/null | sort)
  if [ "${#_TS_ROOTS[@]}" -gt 0 ]; then
    echo "  레거시 프로파일은 기존 TS 에러 집합(베이스라인)을 기준으로 새 에러만 차단합니다."
    echo "  tsconfig.json 을 가진 루트 ${#_TS_ROOTS[@]}개를 각각 tsc --noEmit 1회로 시드하면 첫 저장부터 다른 파일의 회귀도 잡힙니다:"
    for _d in "${_TS_ROOTS[@]}"; do echo "     - ${_d#$TARGET}"; done | sed 's|^     - $|     - (루트)|; s|^     - /|     - |'
    echo "  (대형 프로젝트는 수 분 걸릴 수 있음. 건너뛰면 각 루트의 첫 저장 때 자동 생성되며, 그 한 번은 편집 파일만 판정)"
    if ask_yn "  지금 실행 (y/N): "; then
      for _d in "${_TS_ROOTS[@]}"; do
        echo "  → ${_d#$TARGET/}"
        node "$TARGET/.claude/hooks/typescript-quality.js" --seed --project "$_d" || \
          echo "  ⚠ ${_d#$TARGET/} 베이스라인 생성 실패 — 나중에 직접: node .claude/hooks/typescript-quality.js --seed --project ${_d#$TARGET/}"
      done
    fi
  else
    echo "  ℹ tsconfig.json 을 찾지 못했습니다. TS 패키지에서 직접 실행하세요:"
    echo "     node .claude/hooks/typescript-quality.js --seed --project <tsconfig 디렉토리>"
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
