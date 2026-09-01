---
name: project-install-sh
description: "gugbab-claude → 다른 프로젝트 이식 구조. 11개 템플릿(0~10, 10=health), JAVA_SKILLS 필터, 도메인 스킬 카테고리는 소유 템플릿만 포함(누출 주의), settings.json 단일 source-of-truth"
metadata: 
  node_type: memory
  type: project
  originSessionId: 9152b891-1df7-4c78-8301-10defaed293c
  modified: 2026-09-01T08:50:37.590Z
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
- `11` seo-geo (2026-09-01 신설) — **애드온 템플릿**: 프레임워크 비종속 SEO·GEO 스킬 17종 + writing 4종 + site-migration-seo(=22종, 커머스 프로파일 c면 SEO_NONCOMMERCE 8종 빠져 14종) + 에이전트 6종 화이트리스트(seo-auditor·content-quality-reviewer·fact-checker·source-validator·web-searcher·claude-code-guide). 스택 템플릿과 `5,11`·`3,11`처럼 병행하는 게 기본 용법. 프레임워크 종속 3종(seo-nextjs·seo-vite-spa·og-image-generation)은 nextjs·react-spa 소유 유지. **사용자 결정: java 분기에 SEO 조건을 덧대지 말고 템플릿으로 분리해 union 조합** — 조건 분기 제안은 기각됨. 프로파일 질문은 n 없이 y(기본)/c만. `seo-static-html`은 이전까지 어느 템플릿도 소유 안 해 export 안 되던 죽은 스킬 → seo-geo 소유로 해소. 첫 타깃: [[lfcp-ui-ssr-target]]. **Codex 3라운드 반영 규칙**: `ADDON_TEMPLATES` 정규화(애드온은 입력 순서 무관 뒤로 → CLAUDE.md 베이스는 항상 스택), seo-geo 소유 자산은 제외되면 조합 조건 없이 prune 기록(제외 = 어떤 선택 템플릿도 미소유), 작성 도구 y는 화이트리스트 템플릿(seo-geo·academic·dream)보다 우선, 병행 설치 시 추가 템플릿 `## 금지 사항`을 베이스에 병합. E2E 21건

> **도메인 스킬 누출 주의 (2026-07-21 수정):** react-spa/nextjs/health는 같은 `_skill_ok_for_tmpl` 블록을 공유하는데, "제외 목록에 없으면 포함" 방식이라 도메인 카테고리를 명시 제외하지 않으면 새어나간다. `health/*`(영양·식단 도메인 5종)가 제외 목록에 빠져 react-spa·nextjs 선택 시에도 export되던 버그를 `[[ "$rel" == health/* && "$tmpl" != "health" ]] && return 1`로 수정. 즉 도메인 스킬은 소유 템플릿에서만.

**필터 배열 (스크립트 내부):**
- `UTIL_AGENTS` — 유틸 템플릿에서 허용할 범용 에이전트 화이트리스트
- `EXCLUDE_AGENTS_FRONTEND` — react-spa/nextjs 시 제외 (Rust/Java 백엔드 에이전트)
- `EXCLUDE_AGENTS_BACKEND` — rust-axum 시 제외 (프론트엔드 + Java 에이전트)
- `EXCLUDE_AGENTS_JAVA` — java-spring-* 시 제외 (프론트엔드 + Rust 에이전트, build-error-resolver는 Rust/TS 전용)
- `JAVA_SKILLS_COMMON` — java-spring-legacy/modern 양쪽에 포함 (현재 13종)
- `JAVA_SKILLS_LEGACY_ONLY` — java-spring-legacy 전용 (현재 6종: spring-security-5, springfox-2, redisson-legacy, ehcache-2, aws-sdk-v1, **spring-boot-2-to-3-migration** — 2026-08-31 미등록 버그 수정으로 추가)
- `JAVA_SKILLS_MODERN_ONLY` — java-spring-modern 전용 (현재 4종: spring-security-6, springdoc-3, redisson-modern, aws-sdk-v2)
- `is_java_skill()` 함수 — backend/ 폴더 내에서 Java 스킬과 Rust 스킬 구분
- **2026-08-31 누수 차단**: `is_java_noncore_excluded()`(java에서 dream meta 3·dream arch 1·n8n 5·site-migration-seo·VR·vercel-sandbox·frontend-domain-structure 제외), rust·unity 분기에도 dream+frontend-domain-structure 제외. `EXCLUDE_AGENTS_JAVA`에 seo-auditor·content-quality·a11y·perf 2종·frontend/CLAUDE.md 추가. prune 기록은 `is_only_java_selected`/`is_leakscope_only_selected`(java·rust·unity 조합) 조건 — ts·dream·health 혼합 시엔 소유 가능성 때문에 기록 안 함. java-legacy 설치본 = 스킬 27·에이전트 28
- **references 복사 (2026-08-31)**: 스킬 복사 루프가 SKILL.md 외 부속 파일(references/)도 파일별 매니페스트 기록과 함께 복사. 제외 기록(`record_excluded_skill`)도 폴더 전체 파일 큐잉
- **매니페스트 docs kind (2026-08-31)**: 짝 docs(docs/skills/**·docs/agents/**·공용 docs)를 `docs` kind로 기록(rel은 docs/ 루트 기준). prune이 docs 루트 지원 + 구버전 매니페스트(docs 섹션 없음) 대응으로 **docs 한정 소스 동일성 폴백 증명**(레포 원본과 바이트 동일할 때만 삭제). 회귀: `scripts/template-separation.test.js` — 6템플릿 실설치 E2E 12건(업그레이드 경로·파괴 방어·경계 포함)
- **미결 3건 (2026-08-31, 사용자 결정 대기)**: ① rust·unity의 n8n 5종·vercel-sandbox·site-migration-seo·VR 유지 여부 — 현재는 2026-08-26 "백엔드·LLM 워크플로우엔 n8n 유지" 결정대로 유지, vercel-sandbox는 relay 프로젝트([[claude-relay-plan]]) 연관이라 rust에서 빼면 안 될 수 있음 ② `backend/redis-redisson-4` 스킬이 어느 템플릿에도 미등록(modern은 redisson-modern 사용 중이라 의도 여부 불명) ③ util 다운그레이드 시 공용 docs(docs/hooks 등) 실제 삭제 경로 — 소유 증명 기록까지만 완료(README 후속 과제 명시)

**기타 동작:**
- `CLAUDE.md` / `settings.json`: 존재 시 덮어쓸지 사용자에게 질문 (기본 N)
- **다중 템플릿 CLAUDE.md 도메인 섹션 append (2026-09-01 macOS 버그 수정)**: 첫 템플릿 예시가 베이스, 나머지 템플릿의 `## 도메인` 섹션을 `## 규칙 참조` 앞에 삽입. 기존 구현은 BSD sed `{ N; …d }`(구문 오류)와 BSD awk `-v var="여러 줄"`("newline in string") 두 군데가 macOS에서 실패해 **어떤 조합도 도메인 섹션이 붙지 않고 있었음** — awk 배열 접기 + 임시 파일 getline 주입으로 교체. 셸 스크립트에서 `sed -i`/`sed {…}`/`awk -v` 여러 줄은 macOS·Linux 양쪽에서 검증할 것
- hooks/agents/rules/skills: 같은 이름이면 덮어쓰기, 없는 것만 추가
- **잔재 정리 (2026-08-07 신설, 2026-08-12 매니페스트 체계로 개편 — `scripts/install-cleanup.js`)**: 훅 복사 직전 0.5단계로 실행.
  옵션 OFF 시 해당 훅 파일·rules·플러그인·마커 삭제 + 기존 settings.json에서 배선 수술적 제거
  (settings 덮어쓰기 skip해도 옵션 선택 반영됨). memory OFF 시 구버전 전역 symlink → 실제 디렉토리
  마이그레이션 + 레포 memory/ 의 `.md`만 전역 이전(그 외 파일은 앱 데이터로 보고 보존).
  **소유권 판정은 `.claude/.install-manifest.json`이 기준** — 설치 마지막에 `scripts/write-install-manifest.js`가
  복사한 에이전트·스킬·훅 목록 + 설치 시점 sha256을 기록. 삭제는 "매니페스트에 있고 + 해시 일치
  (=설치 후 안 건드림)"일 때만. 폐지 훅·옵션 OFF 훅도 동일한 소유 증명 필요(basename만으로 삭제 금지).
  매니페스트 없는 레거시 설치는 첫 재설치 때 1회 확인(`잔재 삭제? [y/N]`) → `--delete-orphans`.
  상세 규칙은 [[full-audit-2026-08-11]] 매니페스트 섹션. 테스트: install-cleanup 146건 + write-install-manifest 27건.
  배경: 재설치 시 이전 설치 잔재가 정리되지 않아 N 선택이 무시되던 문제
  (실제로 01~05 + lf-ui·lfos-ui 전부 memory 잔재/symlink 활성 상태였음 — 2026-08-07 감사).
  **미정리 프로젝트는 각자 재설치를 돌려야 정리 적용됨** — 첫 회에 y 응답하면 폐기 에이전트 4종(planner 등)도 자동 제거
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
