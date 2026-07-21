---
name: project-install-sh
description: "gugbab-claude → 다른 프로젝트 이식 구조. 11개 템플릿(0~10, 10=health), JAVA_SKILLS 필터, 도메인 스킬 카테고리는 소유 템플릿만 포함(누출 주의), settings.json 단일 source-of-truth"
metadata: 
  node_type: memory
  type: project
  originSessionId: 9152b891-1df7-4c78-8301-10defaed293c
---

gugbab-claude는 Claude Code 컨벤션 소스 레포. `project-install.sh`로 다른 프로젝트에 이식.

**10개 템플릿 (2026-06-11 기준):**
- `0` 전체 — 모든 에이전트·스킬·규칙 복사
- `1` 유틸 — 비개발자용 (리서치·검증·플래너 등 범용 에이전트만)
- `2` react-spa — React SPA
- `3` nextjs — Next.js App Router
- `4` rust-axum — Rust + Axum 백엔드
- `5` java-spring-legacy — Java 11 + Spring Boot 2.5 + WAR + MyBatis
- `6` java-spring-modern — Java 21 + Spring Boot 3.x + Jar/Native + MyBatis
- `7` unity-game — Unity 6 LTS 2D 모바일 게임 (game/* 스킬 17종 + 게임 에이전트 6종)
- `8` academic — 학술·논문·인문학 특화 (humanities·education·research·writing + ACADEMIC_AGENTS 19종 화이트리스트)
- `9` dream-interpretation — 꿈 해몽 도메인 특화 (dream 스킬 전체 + DREAM_INTERPRETATION_AGENTS 25종 화이트리스트)
- `10` health — 건강·식단 PWA (프론트엔드/TS 그룹 = react-spa·nextjs와 같은 프론트 스킬셋 + health/* 도메인 스킬 5종 전용)

> **도메인 스킬 누출 주의 (2026-07-21 수정):** react-spa/nextjs/health는 같은 `_skill_ok_for_tmpl` 블록을 공유하는데, "제외 목록에 없으면 포함" 방식이라 도메인 카테고리를 명시 제외하지 않으면 새어나간다. `health/*`(영양·식단 도메인 5종)가 제외 목록에 빠져 react-spa·nextjs 선택 시에도 export되던 버그를 `[[ "$rel" == health/* && "$tmpl" != "health" ]] && return 1`로 수정. 즉 도메인 스킬은 소유 템플릿에서만.

**필터 배열 (스크립트 내부):**
- `UTIL_AGENTS` — 유틸 템플릿에서 허용할 범용 에이전트 화이트리스트
- `EXCLUDE_AGENTS_FRONTEND` — react-spa/nextjs 시 제외 (Rust/Java 백엔드 에이전트)
- `EXCLUDE_AGENTS_BACKEND` — rust-axum 시 제외 (프론트엔드 + Java 에이전트)
- `EXCLUDE_AGENTS_JAVA` — java-spring-* 시 제외 (프론트엔드 + Rust 에이전트, build-error-resolver는 Rust/TS 전용)
- `JAVA_SKILLS_COMMON` — java-spring-legacy/modern 양쪽에 포함 (현재 13종)
- `JAVA_SKILLS_LEGACY_ONLY` — java-spring-legacy 전용 (현재 5종: spring-security-5, springfox-2, redisson-legacy, ehcache-2, aws-sdk-v1)
- `JAVA_SKILLS_MODERN_ONLY` — java-spring-modern 전용 (현재 4종: spring-security-6, springdoc-3, redisson-modern, aws-sdk-v2)
- `is_java_skill()` 함수 — backend/ 폴더 내에서 Java 스킬과 Rust 스킬 구분

**기타 동작:**
- `CLAUDE.md` / `settings.json`: 존재 시 덮어쓸지 사용자에게 질문 (기본 N)
- hooks/agents/rules/skills: 같은 이름이면 덮어쓰기, 없는 것만 추가
- settings.json 생성: `scripts/gen-settings.js` 스크립트로 자동 생성 (2026-06-15 기준)
  - `--superpowers` 플래그 → `superpowers@superpowers-marketplace: true` 추가 (조건부, codex와 동일 방식)
  - `--codex` 플래그 → `codex@openai-codex: true` 추가 (조건부)
  - 두 플래그 모두 없으면 `enabledPlugins` 필드 자체 생략
  - `Bash(tee*)` 권한 포함 (codex review 출력 캡처용)
  - `--util` 플래그 → 유틸 템플릿용 (구조 검증 3종 제외)
  - `--dev` 플래그 → dev 템플릿용 (tdd-guard·test-fake-guard + 2026-07-21 신설 adversarial-test-guard·fake-impl-guard 포함) — HOOKS_DEV_ONLY 4종
  - `--typescript` → typescript-quality 훅 추가
  - 플래그 없음 → 공통 훅만 (academic·dream-interpretation 등)
  - 회귀 방지: `scripts/gen-settings.test.js` 17 케이스 (플래그 조합·구조 검증)

**Why:** 팀원은 프로젝트만 git clone하면 동일한 Claude Code 환경 사용 가능. gugbab-claude 자체를 공유하지 않음. gen-settings.js로 중앙화한 이유는 템플릿별 settings.json 변경 누락을 방지하기 위함.

**How to apply:**
- 새 에이전트 추가 시 → 카테고리에 따라 EXCLUDE_AGENTS_* 배열에 명시 필요한지 검토
- 새 Java 스킬 추가 시 → COMMON / LEGACY_ONLY / MODERN_ONLY 중 어디에 분류할지 결정 후 배열에 추가
- **새 도메인 스킬 카테고리 추가 시** → `_skill_ok_for_tmpl`의 *모든 비소유 템플릿* 분기에 명시 제외 추가(안 하면 "제외목록에 없으면 포함" 규칙 탓에 누출). health/* 누출 전례 참조
- **새 훅 추가 시** → `project-install.sh` HOOKS 배열 + `scripts/gen-settings.js` hooks 섹션 수정
- **새 권한/디렉토리 추가 시** → `scripts/gen-settings.js` 내 permissions 섹션 수정
- 변경 후 `bash -n project-install.sh`로 구문 검증
