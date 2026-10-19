<!-- 생성 파일 — 손으로 고치지 말고 node scripts/build-defaults-doc.js 로 다시 만든다 (재료: manifest.json) -->

# 기본값·고정 목록 — gugbab-claude

새 프로젝트에서 `gugbab-claude` 를 처음 열 때 무엇이 켜지고, 무엇이 고정(끌 수 없음)이며, 기본·프리셋마다 모든 항목이 🔒 고정·✅ 켜짐·⬜ 꺼짐 중 무엇인지 정리한 문서입니다.
기본값의 원본은 [항목 체크리스트](plans/2026-10-15-harness-item-checklist.md) 이고, 프로젝트마다 바꾸는 법은 세션 안 `/harness` — [사용 안내](USAGE.md) 를 보세요.

적용 순서: 🔒 고정 > 프로젝트 `.gugbab.json` > 이 프로젝트 설정 > 모든 프로젝트 설정 > 기본값 (이 문서)

## 요약

| 종류 | 🔒 고정 | ✅ 기본 켬 | ⬜ 기본 끔 | 합계 |
|---|---:|---:|---:|---:|
| 설정 | 5 | 2 | 0 | 7 |
| 훅 | 19 | 13 | 0 | 32 |
| 룰 | 3 | 11 | 0 | 14 |
| 커맨드 | 1 | 11 | 0 | 12 |
| 에이전트 | 7 | 32 | 22 | 61 |
| 스킬 | 0 | 1 | 194 | 195 |
| **합계** | **35** | **70** | **216** | **321** |

## 🔒 고정 — 35개

어느 프로젝트에서도 끌 수 없습니다. 고정 항목이 필요로 하는 것도 같이 고정됩니다.

- **설정** (5): 시작 권한 모드 `acceptEdits` · 위험 명령 차단 목록 (deny) · 임시 폴더 접근 허용 · 자동 허용 목록 (allow) · 전역 CLAUDE.md 공통 부분
- **훅** (19): auto-approve · auto-format · bash-guard · cc-notify · claude-version-check · config-change-audit · korean-response-guard · package-manager-guard · parallel-hint · parry · progress-tracker · protect-secrets · release-version-guard · session-export · session-start · task-confirm-guard · typescript-quality · verification-guard · wrapper-version-check
- **룰** (3): info-verification.md · task-workflow.md · verification-policy.md
- **커맨드** (1): harness
- **에이전트** (7): claude-code-guide · fact-checker · research-reviewer · socratic-interviewer · source-validator · tech-stack-advisor · web-searcher

## ✅ 기본으로 켜짐 — 70개

처음부터 켜져 있고, 프로젝트마다 끌 수 있습니다.

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (13): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · relation-guard · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (11): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · java.md · memory-sync.md · readme-update.md · rust.md · typescript.md
- **커맨드** (11): agent-status · codex-review · commit · context-prime · create-plan · create-pr · fix-pr · sparc-refine · spec-extract · tdd-implement · update-docs
- **에이전트** (32): agent-creator · api-spec-designer · build-error-resolver · business-domain-analyst · changelog-writer · codebase-domain-analyst · competitor-analyst · data-analyst · database-architect · deep-researcher · devops-engineer · freshness-auditor · frontend-architect · frontend-developer · frontend-domain-refactorer · java-backend-architect · java-backend-developer · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · pr-reviewer · product-planner · project-scaffolder · qa-engineer · security-auditor · skill-creator · skill-tester · spec-reviewer · typescript-backend-architect · typescript-backend-developer · ui-ux-designer
- **스킬** (1): spec-extraction-method

## ⬜ 기본으로 꺼짐 — 216개

처음에는 꺼져 있습니다. 스택에 맞는 블록·프리셋을 켜면 들어옵니다.

<details><summary>개발 공통 — 꺼진 항목 6개</summary>

- **스킬**: claude-code-hook-authoring · ddd · docker-deployment · github-actions · incremental-refactoring · module-boundaries

</details>

<details><summary>프론트 핵심 — 꺼진 항목 15개</summary>

- **스킬**: ag-grid · bundle-size-analysis · bundling-compiler · core-web-vitals-optimization · e2e-testing · form-handling · frontend-domain-structure · monorepo-turborepo · nextjs · state-management · tanstack-query · tanstack-query-v4-to-v5-migration · typescript-v4 · typescript-v5 · vite-advanced-splitting

</details>

<details><summary>프론트 도구·품질 — 꺼진 항목 27개</summary>

- **에이전트**: a11y-auditor · build-perf-benchmarker · perf-report-writer
- **스킬**: animation · build-perf-benchmarking · code-convention · design-token-scss · dev-server-hmr-benchmarking · font-optimization · github-actions-visual-regression · indexeddb-dexie · lighthouse-ci-setup · mui-v5 · mui-v9 · next-intl-i18n · pwa-push-notifications · recoil-to-zustand-migration · rsbuild · storybook · storybook-visual-testing · swiper · testing · tsup · vite-pwa-service-worker · wcag-2.2-checklist · web-vitals-rum-comparison · webpack-vite-config-mapping

</details>

<details><summary>TS 백엔드 — 꺼진 항목 5개</summary>

- **스킬**: better-auth · drizzle-neon-postgres · hono-api-patterns · prisma-orm · zod-schema-validation

</details>

<details><summary>Java 공통 — 꺼진 항목 13개</summary>

- **스킬**: bouncycastle-crypto · global-exception-validation · hikaricp-tuning-oracle-mysql · jackson-time-migration · jasypt-encrypted-config · logback-mdc-tracing · lombok-mapstruct-modelmapper · mybatis-mapper-patterns · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · testing-junit5-spring-boot · webflux-webclient-in-sync-app · xss-lucy-jsoup

</details>

<details><summary>Java 레거시 (SB 2) — 꺼진 항목 6개</summary>

- **스킬**: aws-sdk-v1-s3-rekognition · ehcache-2-legacy · redis-redisson-legacy · spring-boot-2-to-3-migration · spring-security-5-jwt-jjwt10 · swagger-springfox-2

</details>

<details><summary>Java 모던 (SB 3) — 꺼진 항목 5개</summary>

- **스킬**: aws-sdk-v2-s3-rekognition · redis-redisson-4 · redis-redisson-modern · spring-security-6-jwt-jjwt12 · springdoc-openapi-3

</details>

<details><summary>Rust — 꺼진 항목 11개</summary>

- **에이전트**: rust-backend-architect · rust-backend-developer
- **스킬**: axum · jwt-auth · multipart-upload · project-structure · reqwest · sqlx · sse-streaming · testing-rust · tower-http

</details>

<details><summary>Python — 꺼진 항목 12개</summary>

- **에이전트**: python-backend-architect · python-backend-developer
- **스킬**: python-anthropic-sdk · python-async-asyncio · python-cli-typer · python-embeddings-vector-db · python-fastapi · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · python-pydantic-v2 · python-uv-project-setup

</details>

<details><summary>Unity — 꺼진 항목 22개</summary>

- **에이전트**: game-asset-ai-director · game-design-document-writer · game-monetization-strategist · mobile-app-publisher · unity-architect · unity-developer
- **스킬**: ai-game-asset-pipeline · app-store-submission · game-audio-ai-tools · game-design-document · mobile-user-acquisition · unity-6-2d-fundamentals · unity-addressables · unity-cicd-codemagic · unity-firebase · unity-game-feel · unity-iap · unity-levelplay-ads · unity-live-ops · unity-mobile-optimization · unity-save-system · unity-ui-system

</details>

<details><summary>SEO·GEO — 꺼진 항목 27개</summary>

- **에이전트**: content-quality-reviewer · seo-auditor
- **스킬**: accessibility-vpat-writing · bot-management-seo · content-eeat-quality · ecommerce-seo · geo-ai-discoverability · google-indexing-api · i18n-seo · image-optimization-seo · kakao-share-optimization · local-business-seo · mobile-seo-pwa · multilingual-content-strategy · naver-seo-specifics · og-image-generation · schema-org-patterns · search-console-webmaster · security-headers-seo · seo-monitoring-automation · seo-nextjs · seo-static-html · seo-vite-spa · site-migration-seo · structured-data-validation-api · url-canonicalization-redirects · ymyl-content-seo

</details>

<details><summary>AI 앱 공통 — 꺼진 항목 9개</summary>

- **스킬**: chat-ui-pattern · claude-api-streaming-frontend · emotion-tagging-input · media-recorder-api · pwa-offline-llm-fallback · srs-spaced-repetition · voice-input-ui · web-speech-api-stt · whisper-api-integration

</details>

<details><summary>n8n — 꺼진 항목 5개</summary>

- **스킬**: n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · n8n-workflow-design

</details>

<details><summary>꿈 도메인 — 꺼진 항목 23개</summary>

- **에이전트**: dream-image-safety-classifier · dream-interpretation-prompt-tester · dream-journal-coach · dream-multi-perspective-synthesizer · dream-safety-classifier
- **스킬**: attachment-theory-basics · crisis-intervention-resources-korea · dream-app-ab-testing-prompts · dream-app-onboarding · dream-content-privacy-ethics · dream-content-research · dream-export-import · dream-image-generation · dream-interpretation-prompt-engineering · dream-journal-data-modeling · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-recurrence-detection · dream-safety-classifier-prompts · dream-sharing-anonymized · dream-statistics-visualization · dream-symbol-tagging · korean-dream-interpretation-tradition

</details>

<details><summary>운세 도메인 — 꺼진 항목 11개</summary>

- **에이전트**: fortune-interpretation-prompt-tester
- **스킬**: daily-fortune-retention-loop · fortune-interpretation-prompt-engineering · korean-lunar-calendar-manseryeok · korean-saju-tradition · palm-photo-capture-vision · palmistry-limitations · saju-chart-visualization · saju-tarot-data-modeling · tarot-card-deck-ui · tarot-history-symbolism

</details>

<details><summary>건강 도메인 — 꺼진 항목 6개</summary>

- **에이전트**: nutrition-prompt-tester
- **스킬**: ingredient-management · korean-food-nutrition · meal-recommendation-prompt · nutrition-analysis-prompt · nutrition-basics

</details>

<details><summary>스펙 추출 — 꺼진 항목 4개</summary>

- **스킬**: characterization-testing · nexacro-17-xfdl-anatomy · react-spec-extraction · spring-mybatis-spec-extraction

</details>

<details><summary>넥사크로 — 꺼진 항목 6개</summary>

- **스킬**: ibatis-to-mybatis-migration · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · spring-boot-1-to-2-migration · xapi-to-rest-migration

</details>

<details><summary>기타 — 꺼진 항목 3개</summary>

- **스킬**: claude-code-headless · vercel-sandbox · vercel-workflow

</details>

## 블록 구성

블록 = 한 스택의 스킬·에이전트·언어 룰 묶음. `/harness` 에서 블록을 켜고 끄면 안의 항목이 한 번에 바뀝니다.

| 블록 | 제목 | 항목 수 | 기본 켬 |
|---|---|---:|---:|
| `block:core` | 공통 에이전트 | 15 | 15 |
| `block:dev-common` | 개발 공통 | 14 | 8 |
| `block:frontend-core` | 프론트 핵심 | 19 | 4 |
| `block:frontend-tooling` | 프론트 도구·품질 | 27 | 0 |
| `block:ts-backend` | TS 백엔드 | 7 | 2 |
| `block:java-common` | Java 공통 | 16 | 3 |
| `block:java-legacy` | Java 레거시 (SB 2) | 6 | 0 |
| `block:java-modern` | Java 모던 (SB 3) | 5 | 0 |
| `block:rust` | Rust | 12 | 1 |
| `block:python` | Python | 12 | 0 |
| `block:unity` | Unity | 22 | 0 |
| `block:seo-geo` | SEO·GEO | 27 | 0 |
| `block:ai-app` | AI 앱 공통 | 9 | 0 |
| `block:n8n` | n8n | 5 | 0 |
| `block:dream` | 꿈 도메인 | 23 | 0 |
| `block:fortune` | 운세 도메인 | 11 | 0 |
| `block:health` | 건강 도메인 | 6 | 0 |
| `block:spec-extraction` | 스펙 추출 | 8 | 4 |
| `block:nexacro` | 넥사크로 | 9 | 3 |
| `block:misc` | 기타 | 3 | 0 |
| `block:harness-authoring` | 하네스 제작 에이전트 | 4 | 4 |

## 묶음 구성

묶음 = 한 기능을 이루는 훅·룰·커맨드(·에이전트). 같이 켜고 끕니다.

| 묶음 | 제목 | 구성 |
|---|---|---|
| `bundle:task-confirm` | 작업 확인 절차 | task-confirm-guard · progress-tracker · task-workflow.md |
| `bundle:verification` | 스킬 검증 문서 | verification-guard · verification-policy.md |
| `bundle:dev-quality` | 테스트 품질 (TDD·적대적 테스트) | tdd-guard · adversarial-test-guard · fake-impl-guard · test-fake-guard · adversarial-testing.md · tdd-implement |
| `bundle:codex-review` | Codex 리뷰 | codex-review-guard · codex-review.md · codex-review |
| `bundle:memory-share` | 메모리 공유 | memory-pull · memory-sync · memory-sync.md |
| `bundle:harness-authoring` | 하네스 제작 (스킬·에이전트 만들기) | skill-md-guard · agent-md-guard · deliverable-guard · staleness-check · relation-guard · agent-design.md · creation-workflow.md · readme-update.md · commands.md · agent-status · agent-creator · skill-creator · skill-tester · freshness-auditor |

## 기본 프리셋 설정

프리셋 = 스택에 맞는 블록 여러 개를 한 번에 켜는 것. 프로젝트마다 따로 정합니다.

- **처음 실행할 때 고름** — 프로젝트(git 최상위 폴더)에서 `gugbab-claude` 를 처음 띄우면 프로젝트 파일을 보고 추천한 뒤 번호로 고릅니다(여러 개는 쉼표, Enter = 추천, 0 = 고르지 않음 → 아래 "기본" 상태). 프로젝트마다 한 번만 묻습니다.
- **나중에 바꿈** — 세션 안 `/harness` 화면의 `p`, 또는 `gugbab-claude preset <이름>`. 프리셋은 블록을 켜기만 하므로, 다른 프리셋을 더하면 합쳐집니다(애드온은 이렇게 더해 쓰는 것).
- **범위** — 기본은 이 프로젝트만. `--all`(화면에서는 범위 전환)이면 모든 프로젝트 설정에 들어가고, 프로젝트 자기 설정이 있으면 그쪽이 이깁니다.
- **git 으로 공유** — 프로젝트 루트 `.gugbab.json` 의 `enable`(켤 것)·`lock`(못 끄게)을 팀이 함께 씁니다. 이 파일이 있으면 처음 실행 때 묻지 않습니다.
- **우선순위** — 🔒 고정 > `.gugbab.json` > 이 프로젝트 설정 > 모든 프로젝트 설정 > 기본값. 고정 항목은 어느 프리셋에서도 켜져 있습니다.

## 프리셋 한눈 표

기본값에 그 프리셋 **하나만** 적용했을 때의 실제 상태입니다(필수 의존·충돌 반영). 종류 칸은 `켜짐(🔒 포함)/전체`.

| 프리셋 | 설명 | 🔒 고정 | ✅ 켜짐 | ⬜ 꺼짐 | 설정 | 훅 | 룰 | 커맨드 | 에이전트 | 스킬 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 기본 | 프리셋 없음 (처음 상태) | 35 | 70 | 216 | 7/7 | 32/32 | 14/14 | 12/12 | 39/61 | 1/195 |
| `nextjs` | React·Next.js (+TS 백엔드) | 35 | 123 | 163 | 7/7 | 32/32 | 14/14 | 12/12 | 42/61 | 51/195 |
| `java-legacy` | Java Spring 레거시 | 35 | 95 | 191 | 7/7 | 32/32 | 14/14 | 12/12 | 39/61 | 26/195 |
| `java-modern` | Java Spring 모던 | 35 | 94 | 192 | 7/7 | 32/32 | 14/14 | 12/12 | 39/61 | 25/195 |
| `rust` | Rust Axum | 35 | 87 | 199 | 7/7 | 32/32 | 14/14 | 12/12 | 41/61 | 16/195 |
| `python` | Python FastAPI | 35 | 88 | 198 | 7/7 | 32/32 | 14/14 | 12/12 | 41/61 | 17/195 |
| `unity` | Unity 게임 | 35 | 98 | 188 | 7/7 | 32/32 | 14/14 | 12/12 | 45/61 | 23/195 |
| `dream` | 꿈 해몽 앱 | 35 | 144 | 142 | 7/7 | 32/32 | 14/14 | 12/12 | 47/61 | 67/195 |
| `fortune` | 운세 앱 | 35 | 132 | 154 | 7/7 | 32/32 | 14/14 | 12/12 | 43/61 | 59/195 |
| `health` | 건강·식단 앱 | 35 | 127 | 159 | 7/7 | 32/32 | 14/14 | 12/12 | 43/61 | 54/195 |
| `nexacro` | 넥사크로 마이그레이션 | 35 | 115 | 171 | 7/7 | 31/32 | 14/14 | 12/12 | 39/61 | 47/195 |
| `seo-geo` | 애드온 · SEO·GEO | 35 | 97 | 189 | 7/7 | 32/32 | 14/14 | 12/12 | 41/61 | 26/195 |
| `spec-extraction` | 애드온 · 레거시 스펙 추출 | 35 | 74 | 212 | 7/7 | 32/32 | 14/14 | 12/12 | 39/61 | 5/195 |
| `n8n` | 애드온 · n8n | 35 | 75 | 211 | 7/7 | 32/32 | 14/14 | 12/12 | 39/61 | 6/195 |

## 항목 × 프리셋 표

🔒 고정 · ✅ 켜짐 · ⬜ 꺼짐. 칸마다 기본값에 그 프리셋 하나만 적용한 상태입니다. 종류별로 펼쳐 보세요.

<details><summary>설정 — 7개</summary>

| 항목 | 기본 | `nextjs` | `java-legacy` | `java-modern` | `rust` | `python` | `unity` | `dream` | `fortune` | `health` | `nexacro` | `seo-geo` | `spec-extraction` | `n8n` |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| superpowers 플러그인 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 상태줄 `statusline.sh` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 시작 권한 모드 `acceptEdits` | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| 위험 명령 차단 목록 (deny) | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| 임시 폴더 접근 허용 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| 자동 허용 목록 (allow) | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| 전역 CLAUDE.md 공통 부분 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |

</details>

<details><summary>훅 — 32개</summary>

| 항목 | 기본 | `nextjs` | `java-legacy` | `java-modern` | `rust` | `python` | `unity` | `dream` | `fortune` | `health` | `nexacro` | `seo-geo` | `spec-extraction` | `n8n` |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| adversarial-test-guard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| agent-md-guard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| auto-approve | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| auto-format | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| bash-guard | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| branch-protection | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| cc-notify | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| claude-version-check | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| codex-review-guard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| config-change-audit | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| deliverable-guard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| fake-impl-guard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| korean-response-guard | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| memory-pull | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| memory-sync | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| package-manager-guard | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| parallel-hint | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| parry | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| progress-tracker | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| protect-secrets | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| relation-guard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| release-version-guard | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| session-export | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| session-start | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| skill-md-guard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| staleness-check | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| task-confirm-guard | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| tdd-guard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ | ✅ | ✅ | ✅ |
| test-fake-guard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| typescript-quality | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| verification-guard | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| wrapper-version-check | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |

</details>

<details><summary>룰 — 14개</summary>

| 항목 | 기본 | `nextjs` | `java-legacy` | `java-modern` | `rust` | `python` | `unity` | `dream` | `fortune` | `health` | `nexacro` | `seo-geo` | `spec-extraction` | `n8n` |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| adversarial-testing.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| agent-design.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| codex-review.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| commands.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| creation-workflow.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| git.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| info-verification.md | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| java.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| memory-sync.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| readme-update.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| rust.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| task-workflow.md | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| typescript.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| verification-policy.md | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |

</details>

<details><summary>커맨드 — 12개</summary>

| 항목 | 기본 | `nextjs` | `java-legacy` | `java-modern` | `rust` | `python` | `unity` | `dream` | `fortune` | `health` | `nexacro` | `seo-geo` | `spec-extraction` | `n8n` |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| agent-status | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| codex-review | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| commit | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| context-prime | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| create-plan | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| create-pr | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| fix-pr | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| harness | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| sparc-refine | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| spec-extract | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| tdd-implement | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| update-docs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

</details>

<details><summary>에이전트 — 61개</summary>

| 항목 | 블록 | 기본 | `nextjs` | `java-legacy` | `java-modern` | `rust` | `python` | `unity` | `dream` | `fortune` | `health` | `nexacro` | `seo-geo` | `spec-extraction` | `n8n` |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| a11y-auditor | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| agent-creator | 하네스 제작 에이전트 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| api-spec-designer | 공통 에이전트 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| build-error-resolver | 개발 공통 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| build-perf-benchmarker | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| business-domain-analyst | 개발 공통 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| changelog-writer | 개발 공통 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| claude-code-guide | 공통 에이전트 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| codebase-domain-analyst | 개발 공통 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| competitor-analyst | 개발 공통 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| content-quality-reviewer | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| data-analyst | 개발 공통 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| database-architect | 개발 공통 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| deep-researcher | 공통 에이전트 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| devops-engineer | 공통 에이전트 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| dream-image-safety-classifier | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-interpretation-prompt-tester | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-journal-coach | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-multi-perspective-synthesizer | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-safety-classifier | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| fact-checker | 공통 에이전트 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| fortune-interpretation-prompt-tester | 운세 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| freshness-auditor | 하네스 제작 에이전트 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| frontend-architect | 프론트 핵심 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| frontend-developer | 프론트 핵심 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| frontend-domain-refactorer | 프론트 핵심 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| game-asset-ai-director | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| game-design-document-writer | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| game-monetization-strategist | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| java-backend-architect | Java 공통 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| java-backend-developer | Java 공통 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| legacy-spec-extractor | 스펙 추출 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| migration-parity-tester | 넥사크로 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| mobile-app-publisher | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| nexacro-screen-analyzer | 넥사크로 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| nexacro-screen-converter | 넥사크로 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| nutrition-prompt-tester | 건강 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| perf-report-writer | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| pr-reviewer | 개발 공통 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| product-planner | 공통 에이전트 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| project-scaffolder | 공통 에이전트 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| python-backend-architect | Python | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| python-backend-developer | Python | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| qa-engineer | 공통 에이전트 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| research-reviewer | 공통 에이전트 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| rust-backend-architect | Rust | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| rust-backend-developer | Rust | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| security-auditor | 공통 에이전트 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| seo-auditor | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| skill-creator | 하네스 제작 에이전트 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| skill-tester | 하네스 제작 에이전트 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| socratic-interviewer | 공통 에이전트 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| source-validator | 공통 에이전트 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| spec-reviewer | 스펙 추출 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| tech-stack-advisor | 공통 에이전트 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| typescript-backend-architect | TS 백엔드 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| typescript-backend-developer | TS 백엔드 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ui-ux-designer | 공통 에이전트 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| unity-architect | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| unity-developer | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| web-searcher | 공통 에이전트 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |

</details>

<details><summary>스킬 — 195개</summary>

| 항목 | 블록 | 기본 | `nextjs` | `java-legacy` | `java-modern` | `rust` | `python` | `unity` | `dream` | `fortune` | `health` | `nexacro` | `seo-geo` | `spec-extraction` | `n8n` |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| accessibility-vpat-writing | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| ag-grid | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| ai-game-asset-pipeline | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| animation | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| app-store-submission | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| attachment-theory-basics | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| aws-sdk-v1-s3-rekognition | Java 레거시 (SB 2) | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| aws-sdk-v2-s3-rekognition | Java 모던 (SB 3) | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| axum | Rust | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| better-auth | TS 백엔드 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| bot-management-seo | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| bouncycastle-crypto | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| build-perf-benchmarking | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| bundle-size-analysis | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| bundling-compiler | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| characterization-testing | 스펙 추출 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ |
| chat-ui-pattern | AI 앱 공통 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| claude-api-streaming-frontend | AI 앱 공통 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| claude-code-headless | 기타 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| claude-code-hook-authoring | 개발 공통 | ⬜ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| code-convention | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| content-eeat-quality | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| core-web-vitals-optimization | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| crisis-intervention-resources-korea | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| daily-fortune-retention-loop | 운세 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| ddd | 개발 공통 | ⬜ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| design-token-scss | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| dev-server-hmr-benchmarking | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| docker-deployment | 개발 공통 | ⬜ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| dream-app-ab-testing-prompts | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-app-onboarding | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-content-privacy-ethics | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-content-research | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-export-import | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-image-generation | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-interpretation-prompt-engineering | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-journal-data-modeling | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-privacy-consent-ui | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-psychology-jung-freud | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-recurrence-detection | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-safety-classifier-prompts | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-sharing-anonymized | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-statistics-visualization | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-symbol-tagging | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| drizzle-neon-postgres | TS 백엔드 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| e2e-testing | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| ecommerce-seo | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| ehcache-2-legacy | Java 레거시 (SB 2) | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| emotion-tagging-input | AI 앱 공통 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| font-optimization | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| form-handling | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| fortune-interpretation-prompt-engineering | 운세 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| frontend-domain-structure | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| game-audio-ai-tools | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| game-design-document | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| geo-ai-discoverability | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| github-actions | 개발 공통 | ⬜ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| github-actions-visual-regression | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| global-exception-validation | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| google-indexing-api | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| hikaricp-tuning-oracle-mysql | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| hono-api-patterns | TS 백엔드 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| i18n-seo | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| ibatis-to-mybatis-migration | 넥사크로 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| image-optimization-seo | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| incremental-refactoring | 개발 공통 | ⬜ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| indexeddb-dexie | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| ingredient-management | 건강 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| jackson-time-migration | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| jasypt-encrypted-config | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| jwt-auth | Rust | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| kakao-share-optimization | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| korean-dream-interpretation-tradition | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| korean-food-nutrition | 건강 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| korean-lunar-calendar-manseryeok | 운세 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| korean-saju-tradition | 운세 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| lighthouse-ci-setup | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| local-business-seo | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| logback-mdc-tracing | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| lombok-mapstruct-modelmapper | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| meal-recommendation-prompt | 건강 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| media-recorder-api | AI 앱 공통 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| mobile-seo-pwa | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| mobile-user-acquisition | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| module-boundaries | 개발 공통 | ⬜ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| monorepo-turborepo | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| mui-v5 | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| mui-v9 | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| multilingual-content-strategy | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| multipart-upload | Rust | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| mybatis-mapper-patterns | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| n8n-error-handling | n8n | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ |
| n8n-llm-integration | n8n | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ |
| n8n-self-hosting | n8n | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ |
| n8n-webhook-patterns | n8n | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ |
| n8n-workflow-design | n8n | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ |
| naver-seo-specifics | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| nexacro-17-xfdl-anatomy | 스펙 추출 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ |
| nexacro-strangler-coexistence | 넥사크로 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| nexacro-to-react-mapping | 넥사크로 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| nexacro-xapi-server | 넥사크로 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| next-intl-i18n | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| nextjs | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| nutrition-analysis-prompt | 건강 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| nutrition-basics | 건강 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| og-image-generation | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| palm-photo-capture-vision | 운세 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| palmistry-limitations | 운세 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| prisma-orm | TS 백엔드 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| project-structure | Rust | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| pwa-offline-llm-fallback | AI 앱 공통 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| pwa-push-notifications | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| python-anthropic-sdk | Python | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| python-async-asyncio | Python | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| python-cli-typer | Python | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| python-embeddings-vector-db | Python | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| python-fastapi | Python | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| python-korean-nlp-konlpy | Python | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| python-langchain-current | Python | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| python-llamaindex | Python | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| python-pydantic-v2 | Python | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| python-uv-project-setup | Python | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| react-spec-extraction | 스펙 추출 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ |
| recoil-to-zustand-migration | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| redis-redisson-4 | Java 모던 (SB 3) | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| redis-redisson-legacy | Java 레거시 (SB 2) | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| redis-redisson-modern | Java 모던 (SB 3) | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| reqwest | Rust | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| rsbuild | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| saju-chart-visualization | 운세 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| saju-tarot-data-modeling | 운세 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| schema-org-patterns | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| search-console-webmaster | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| security-headers-seo | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| seo-monitoring-automation | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| seo-nextjs | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| seo-static-html | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| seo-vite-spa | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| site-migration-seo | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| spec-extraction-method | 스펙 추출 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| spring-boot-1-to-2-migration | 넥사크로 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| spring-boot-2-to-3-migration | Java 레거시 (SB 2) | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| spring-boot-gradle-setup | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| spring-multi-datasource-oracle-mysql | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| spring-mybatis-spec-extraction | 스펙 추출 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ |
| spring-security-5-jwt-jjwt10 | Java 레거시 (SB 2) | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| spring-security-6-jwt-jjwt12 | Java 모던 (SB 3) | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| springdoc-openapi-3 | Java 모던 (SB 3) | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| sqlx | Rust | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| srs-spaced-repetition | AI 앱 공통 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| sse-streaming | Rust | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| state-management | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| storybook | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| storybook-visual-testing | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| structured-data-validation-api | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| swagger-springfox-2 | Java 레거시 (SB 2) | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| swiper | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| tanstack-query | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| tanstack-query-v4-to-v5-migration | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| tarot-card-deck-ui | 운세 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| tarot-history-symbolism | 운세 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| testing | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| testing-junit5-spring-boot | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| testing-rust | Rust | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| tower-http | Rust | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| tsup | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| typescript-v4 | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| typescript-v5 | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| unity-6-2d-fundamentals | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| unity-addressables | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| unity-cicd-codemagic | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| unity-firebase | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| unity-game-feel | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| unity-iap | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| unity-levelplay-ads | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| unity-live-ops | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| unity-mobile-optimization | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| unity-save-system | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| unity-ui-system | Unity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| url-canonicalization-redirects | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| vercel-sandbox | 기타 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| vercel-workflow | 기타 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| vite-advanced-splitting | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ |
| vite-pwa-service-worker | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| voice-input-ui | AI 앱 공통 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| wcag-2.2-checklist | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| web-speech-api-stt | AI 앱 공통 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| web-vitals-rum-comparison | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| webflux-webclient-in-sync-app | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| webpack-vite-config-mapping | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| whisper-api-integration | AI 앱 공통 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| xapi-to-rest-migration | 넥사크로 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| xss-lucy-jsoup | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| ymyl-content-seo | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| zod-schema-validation | TS 백엔드 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

</details>

## 프리셋별 상세

🔒 고정 항목은 모든 프리셋에서 같습니다(위 "🔒 고정" 목록).

### 기본 — 프리셋 없음 (처음 상태)

- 🔒 고정 35 · ✅ 켜짐 70 · ⬜ 꺼짐 216

<details><summary>✅ 켜짐 70개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (13): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · relation-guard · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (11): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · java.md · memory-sync.md · readme-update.md · rust.md · typescript.md
- **커맨드** (11): agent-status · codex-review · commit · context-prime · create-plan · create-pr · fix-pr · sparc-refine · spec-extract · tdd-implement · update-docs
- **에이전트** (32): agent-creator · api-spec-designer · build-error-resolver · business-domain-analyst · changelog-writer · codebase-domain-analyst · competitor-analyst · data-analyst · database-architect · deep-researcher · devops-engineer · freshness-auditor · frontend-architect · frontend-developer · frontend-domain-refactorer · java-backend-architect · java-backend-developer · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · pr-reviewer · product-planner · project-scaffolder · qa-engineer · security-auditor · skill-creator · skill-tester · spec-reviewer · typescript-backend-architect · typescript-backend-developer · ui-ux-designer
- **스킬** (1): spec-extraction-method

</details>

<details><summary>⬜ 꺼짐 216개</summary>

- **에이전트** (22): a11y-auditor · build-perf-benchmarker · content-quality-reviewer · dream-image-safety-classifier · dream-interpretation-prompt-tester · dream-journal-coach · dream-multi-perspective-synthesizer · dream-safety-classifier · fortune-interpretation-prompt-tester · game-asset-ai-director · game-design-document-writer · game-monetization-strategist · mobile-app-publisher · nutrition-prompt-tester · perf-report-writer · python-backend-architect · python-backend-developer · rust-backend-architect · rust-backend-developer · seo-auditor · unity-architect · unity-developer
- **스킬** (194): accessibility-vpat-writing · ag-grid · ai-game-asset-pipeline · animation · app-store-submission · attachment-theory-basics · aws-sdk-v1-s3-rekognition · aws-sdk-v2-s3-rekognition · axum · better-auth · bot-management-seo · bouncycastle-crypto · build-perf-benchmarking · bundle-size-analysis · bundling-compiler · characterization-testing · chat-ui-pattern · claude-api-streaming-frontend · claude-code-headless · claude-code-hook-authoring · code-convention · content-eeat-quality · core-web-vitals-optimization · crisis-intervention-resources-korea · daily-fortune-retention-loop · ddd · design-token-scss · dev-server-hmr-benchmarking · docker-deployment · dream-app-ab-testing-prompts · dream-app-onboarding · dream-content-privacy-ethics · dream-content-research · dream-export-import · dream-image-generation · dream-interpretation-prompt-engineering · dream-journal-data-modeling · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-recurrence-detection · dream-safety-classifier-prompts · dream-sharing-anonymized · dream-statistics-visualization · dream-symbol-tagging · drizzle-neon-postgres · e2e-testing · ecommerce-seo · ehcache-2-legacy · emotion-tagging-input · font-optimization · form-handling · fortune-interpretation-prompt-engineering · frontend-domain-structure · game-audio-ai-tools · game-design-document · geo-ai-discoverability · github-actions · github-actions-visual-regression · global-exception-validation · google-indexing-api · hikaricp-tuning-oracle-mysql · hono-api-patterns · i18n-seo · ibatis-to-mybatis-migration · image-optimization-seo · incremental-refactoring · indexeddb-dexie · ingredient-management · jackson-time-migration · jasypt-encrypted-config · jwt-auth · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · local-business-seo · logback-mdc-tracing · lombok-mapstruct-modelmapper · meal-recommendation-prompt · media-recorder-api · mobile-seo-pwa · mobile-user-acquisition · module-boundaries · monorepo-turborepo · mui-v5 · mui-v9 · multilingual-content-strategy · multipart-upload · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · n8n-workflow-design · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · og-image-generation · palm-photo-capture-vision · palmistry-limitations · prisma-orm · project-structure · pwa-offline-llm-fallback · pwa-push-notifications · python-anthropic-sdk · python-async-asyncio · python-cli-typer · python-embeddings-vector-db · python-fastapi · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · python-pydantic-v2 · python-uv-project-setup · react-spec-extraction · recoil-to-zustand-migration · redis-redisson-4 · redis-redisson-legacy · redis-redisson-modern · reqwest · rsbuild · saju-chart-visualization · saju-tarot-data-modeling · schema-org-patterns · search-console-webmaster · security-headers-seo · seo-monitoring-automation · seo-nextjs · seo-static-html · seo-vite-spa · site-migration-seo · spring-boot-1-to-2-migration · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · springdoc-openapi-3 · sqlx · srs-spaced-repetition · sse-streaming · state-management · storybook · storybook-visual-testing · structured-data-validation-api · swagger-springfox-2 · swiper · tanstack-query · tanstack-query-v4-to-v5-migration · tarot-card-deck-ui · tarot-history-symbolism · testing · testing-junit5-spring-boot · testing-rust · tower-http · tsup · typescript-v4 · typescript-v5 · unity-6-2d-fundamentals · unity-addressables · unity-cicd-codemagic · unity-firebase · unity-game-feel · unity-iap · unity-levelplay-ads · unity-live-ops · unity-mobile-optimization · unity-save-system · unity-ui-system · url-canonicalization-redirects · vercel-sandbox · vercel-workflow · vite-advanced-splitting · vite-pwa-service-worker · voice-input-ui · wcag-2.2-checklist · web-speech-api-stt · web-vitals-rum-comparison · webflux-webclient-in-sync-app · webpack-vite-config-mapping · whisper-api-integration · xapi-to-rest-migration · xss-lucy-jsoup · ymyl-content-seo · zod-schema-validation

</details>

### `nextjs` — React·Next.js (+TS 백엔드)

- 켜는 블록: `dev-common` · `frontend-core` · `frontend-tooling` · `ts-backend`
- 🔒 고정 35 · ✅ 켜짐 123 · ⬜ 꺼짐 163
- 기본과 비교: 새로 켜짐 53개 (에이전트 3 · 스킬 50)

<details><summary>새로 켜지는 항목 53개</summary>

- **에이전트**: a11y-auditor · build-perf-benchmarker · perf-report-writer
- **스킬**: ag-grid · animation · better-auth · build-perf-benchmarking · bundle-size-analysis · bundling-compiler · claude-code-hook-authoring · code-convention · core-web-vitals-optimization · ddd · design-token-scss · dev-server-hmr-benchmarking · docker-deployment · drizzle-neon-postgres · e2e-testing · font-optimization · form-handling · frontend-domain-structure · github-actions · github-actions-visual-regression · hono-api-patterns · incremental-refactoring · indexeddb-dexie · lighthouse-ci-setup · module-boundaries · monorepo-turborepo · mui-v5 · mui-v9 · next-intl-i18n · nextjs · prisma-orm · pwa-push-notifications · recoil-to-zustand-migration · rsbuild · state-management · storybook · storybook-visual-testing · swiper · tanstack-query · tanstack-query-v4-to-v5-migration · testing · tsup · typescript-v4 · typescript-v5 · vite-advanced-splitting · vite-pwa-service-worker · wcag-2.2-checklist · web-vitals-rum-comparison · webpack-vite-config-mapping · zod-schema-validation

</details>

<details><summary>✅ 켜짐 123개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (13): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · relation-guard · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (11): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · java.md · memory-sync.md · readme-update.md · rust.md · typescript.md
- **커맨드** (11): agent-status · codex-review · commit · context-prime · create-plan · create-pr · fix-pr · sparc-refine · spec-extract · tdd-implement · update-docs
- **에이전트** (35): a11y-auditor · agent-creator · api-spec-designer · build-error-resolver · build-perf-benchmarker · business-domain-analyst · changelog-writer · codebase-domain-analyst · competitor-analyst · data-analyst · database-architect · deep-researcher · devops-engineer · freshness-auditor · frontend-architect · frontend-developer · frontend-domain-refactorer · java-backend-architect · java-backend-developer · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · perf-report-writer · pr-reviewer · product-planner · project-scaffolder · qa-engineer · security-auditor · skill-creator · skill-tester · spec-reviewer · typescript-backend-architect · typescript-backend-developer · ui-ux-designer
- **스킬** (51): ag-grid · animation · better-auth · build-perf-benchmarking · bundle-size-analysis · bundling-compiler · claude-code-hook-authoring · code-convention · core-web-vitals-optimization · ddd · design-token-scss · dev-server-hmr-benchmarking · docker-deployment · drizzle-neon-postgres · e2e-testing · font-optimization · form-handling · frontend-domain-structure · github-actions · github-actions-visual-regression · hono-api-patterns · incremental-refactoring · indexeddb-dexie · lighthouse-ci-setup · module-boundaries · monorepo-turborepo · mui-v5 · mui-v9 · next-intl-i18n · nextjs · prisma-orm · pwa-push-notifications · recoil-to-zustand-migration · rsbuild · spec-extraction-method · state-management · storybook · storybook-visual-testing · swiper · tanstack-query · tanstack-query-v4-to-v5-migration · testing · tsup · typescript-v4 · typescript-v5 · vite-advanced-splitting · vite-pwa-service-worker · wcag-2.2-checklist · web-vitals-rum-comparison · webpack-vite-config-mapping · zod-schema-validation

</details>

<details><summary>⬜ 꺼짐 163개</summary>

- **에이전트** (19): content-quality-reviewer · dream-image-safety-classifier · dream-interpretation-prompt-tester · dream-journal-coach · dream-multi-perspective-synthesizer · dream-safety-classifier · fortune-interpretation-prompt-tester · game-asset-ai-director · game-design-document-writer · game-monetization-strategist · mobile-app-publisher · nutrition-prompt-tester · python-backend-architect · python-backend-developer · rust-backend-architect · rust-backend-developer · seo-auditor · unity-architect · unity-developer
- **스킬** (144): accessibility-vpat-writing · ai-game-asset-pipeline · app-store-submission · attachment-theory-basics · aws-sdk-v1-s3-rekognition · aws-sdk-v2-s3-rekognition · axum · bot-management-seo · bouncycastle-crypto · characterization-testing · chat-ui-pattern · claude-api-streaming-frontend · claude-code-headless · content-eeat-quality · crisis-intervention-resources-korea · daily-fortune-retention-loop · dream-app-ab-testing-prompts · dream-app-onboarding · dream-content-privacy-ethics · dream-content-research · dream-export-import · dream-image-generation · dream-interpretation-prompt-engineering · dream-journal-data-modeling · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-recurrence-detection · dream-safety-classifier-prompts · dream-sharing-anonymized · dream-statistics-visualization · dream-symbol-tagging · ecommerce-seo · ehcache-2-legacy · emotion-tagging-input · fortune-interpretation-prompt-engineering · game-audio-ai-tools · game-design-document · geo-ai-discoverability · global-exception-validation · google-indexing-api · hikaricp-tuning-oracle-mysql · i18n-seo · ibatis-to-mybatis-migration · image-optimization-seo · ingredient-management · jackson-time-migration · jasypt-encrypted-config · jwt-auth · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · local-business-seo · logback-mdc-tracing · lombok-mapstruct-modelmapper · meal-recommendation-prompt · media-recorder-api · mobile-seo-pwa · mobile-user-acquisition · multilingual-content-strategy · multipart-upload · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · n8n-workflow-design · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · nutrition-analysis-prompt · nutrition-basics · og-image-generation · palm-photo-capture-vision · palmistry-limitations · project-structure · pwa-offline-llm-fallback · python-anthropic-sdk · python-async-asyncio · python-cli-typer · python-embeddings-vector-db · python-fastapi · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · python-pydantic-v2 · python-uv-project-setup · react-spec-extraction · redis-redisson-4 · redis-redisson-legacy · redis-redisson-modern · reqwest · saju-chart-visualization · saju-tarot-data-modeling · schema-org-patterns · search-console-webmaster · security-headers-seo · seo-monitoring-automation · seo-nextjs · seo-static-html · seo-vite-spa · site-migration-seo · spring-boot-1-to-2-migration · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · springdoc-openapi-3 · sqlx · srs-spaced-repetition · sse-streaming · structured-data-validation-api · swagger-springfox-2 · tarot-card-deck-ui · tarot-history-symbolism · testing-junit5-spring-boot · testing-rust · tower-http · unity-6-2d-fundamentals · unity-addressables · unity-cicd-codemagic · unity-firebase · unity-game-feel · unity-iap · unity-levelplay-ads · unity-live-ops · unity-mobile-optimization · unity-save-system · unity-ui-system · url-canonicalization-redirects · vercel-sandbox · vercel-workflow · voice-input-ui · web-speech-api-stt · webflux-webclient-in-sync-app · whisper-api-integration · xapi-to-rest-migration · xss-lucy-jsoup · ymyl-content-seo

</details>

### `java-legacy` — Java Spring 레거시

- 켜는 블록: `dev-common` · `java-common` · `java-legacy`
- 🔒 고정 35 · ✅ 켜짐 95 · ⬜ 꺼짐 191
- 기본과 비교: 새로 켜짐 25개 (스킬 25)

<details><summary>새로 켜지는 항목 25개</summary>

- **스킬**: aws-sdk-v1-s3-rekognition · bouncycastle-crypto · claude-code-hook-authoring · ddd · docker-deployment · ehcache-2-legacy · github-actions · global-exception-validation · hikaricp-tuning-oracle-mysql · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · logback-mdc-tracing · lombok-mapstruct-modelmapper · module-boundaries · mybatis-mapper-patterns · redis-redisson-legacy · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-security-5-jwt-jjwt10 · swagger-springfox-2 · testing-junit5-spring-boot · webflux-webclient-in-sync-app · xss-lucy-jsoup

</details>

<details><summary>✅ 켜짐 95개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (13): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · relation-guard · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (11): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · java.md · memory-sync.md · readme-update.md · rust.md · typescript.md
- **커맨드** (11): agent-status · codex-review · commit · context-prime · create-plan · create-pr · fix-pr · sparc-refine · spec-extract · tdd-implement · update-docs
- **에이전트** (32): agent-creator · api-spec-designer · build-error-resolver · business-domain-analyst · changelog-writer · codebase-domain-analyst · competitor-analyst · data-analyst · database-architect · deep-researcher · devops-engineer · freshness-auditor · frontend-architect · frontend-developer · frontend-domain-refactorer · java-backend-architect · java-backend-developer · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · pr-reviewer · product-planner · project-scaffolder · qa-engineer · security-auditor · skill-creator · skill-tester · spec-reviewer · typescript-backend-architect · typescript-backend-developer · ui-ux-designer
- **스킬** (26): aws-sdk-v1-s3-rekognition · bouncycastle-crypto · claude-code-hook-authoring · ddd · docker-deployment · ehcache-2-legacy · github-actions · global-exception-validation · hikaricp-tuning-oracle-mysql · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · logback-mdc-tracing · lombok-mapstruct-modelmapper · module-boundaries · mybatis-mapper-patterns · redis-redisson-legacy · spec-extraction-method · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-security-5-jwt-jjwt10 · swagger-springfox-2 · testing-junit5-spring-boot · webflux-webclient-in-sync-app · xss-lucy-jsoup

</details>

<details><summary>⬜ 꺼짐 191개</summary>

- **에이전트** (22): a11y-auditor · build-perf-benchmarker · content-quality-reviewer · dream-image-safety-classifier · dream-interpretation-prompt-tester · dream-journal-coach · dream-multi-perspective-synthesizer · dream-safety-classifier · fortune-interpretation-prompt-tester · game-asset-ai-director · game-design-document-writer · game-monetization-strategist · mobile-app-publisher · nutrition-prompt-tester · perf-report-writer · python-backend-architect · python-backend-developer · rust-backend-architect · rust-backend-developer · seo-auditor · unity-architect · unity-developer
- **스킬** (169): accessibility-vpat-writing · ag-grid · ai-game-asset-pipeline · animation · app-store-submission · attachment-theory-basics · aws-sdk-v2-s3-rekognition · axum · better-auth · bot-management-seo · build-perf-benchmarking · bundle-size-analysis · bundling-compiler · characterization-testing · chat-ui-pattern · claude-api-streaming-frontend · claude-code-headless · code-convention · content-eeat-quality · core-web-vitals-optimization · crisis-intervention-resources-korea · daily-fortune-retention-loop · design-token-scss · dev-server-hmr-benchmarking · dream-app-ab-testing-prompts · dream-app-onboarding · dream-content-privacy-ethics · dream-content-research · dream-export-import · dream-image-generation · dream-interpretation-prompt-engineering · dream-journal-data-modeling · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-recurrence-detection · dream-safety-classifier-prompts · dream-sharing-anonymized · dream-statistics-visualization · dream-symbol-tagging · drizzle-neon-postgres · e2e-testing · ecommerce-seo · emotion-tagging-input · font-optimization · form-handling · fortune-interpretation-prompt-engineering · frontend-domain-structure · game-audio-ai-tools · game-design-document · geo-ai-discoverability · github-actions-visual-regression · google-indexing-api · hono-api-patterns · i18n-seo · ibatis-to-mybatis-migration · image-optimization-seo · indexeddb-dexie · ingredient-management · jwt-auth · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · local-business-seo · meal-recommendation-prompt · media-recorder-api · mobile-seo-pwa · mobile-user-acquisition · monorepo-turborepo · mui-v5 · mui-v9 · multilingual-content-strategy · multipart-upload · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · n8n-workflow-design · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · og-image-generation · palm-photo-capture-vision · palmistry-limitations · prisma-orm · project-structure · pwa-offline-llm-fallback · pwa-push-notifications · python-anthropic-sdk · python-async-asyncio · python-cli-typer · python-embeddings-vector-db · python-fastapi · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · python-pydantic-v2 · python-uv-project-setup · react-spec-extraction · recoil-to-zustand-migration · redis-redisson-4 · redis-redisson-modern · reqwest · rsbuild · saju-chart-visualization · saju-tarot-data-modeling · schema-org-patterns · search-console-webmaster · security-headers-seo · seo-monitoring-automation · seo-nextjs · seo-static-html · seo-vite-spa · site-migration-seo · spring-boot-1-to-2-migration · spring-mybatis-spec-extraction · spring-security-6-jwt-jjwt12 · springdoc-openapi-3 · sqlx · srs-spaced-repetition · sse-streaming · state-management · storybook · storybook-visual-testing · structured-data-validation-api · swiper · tanstack-query · tanstack-query-v4-to-v5-migration · tarot-card-deck-ui · tarot-history-symbolism · testing · testing-rust · tower-http · tsup · typescript-v4 · typescript-v5 · unity-6-2d-fundamentals · unity-addressables · unity-cicd-codemagic · unity-firebase · unity-game-feel · unity-iap · unity-levelplay-ads · unity-live-ops · unity-mobile-optimization · unity-save-system · unity-ui-system · url-canonicalization-redirects · vercel-sandbox · vercel-workflow · vite-advanced-splitting · vite-pwa-service-worker · voice-input-ui · wcag-2.2-checklist · web-speech-api-stt · web-vitals-rum-comparison · webpack-vite-config-mapping · whisper-api-integration · xapi-to-rest-migration · ymyl-content-seo · zod-schema-validation

</details>

### `java-modern` — Java Spring 모던

- 켜는 블록: `dev-common` · `java-common` · `java-modern`
- 🔒 고정 35 · ✅ 켜짐 94 · ⬜ 꺼짐 192
- 기본과 비교: 새로 켜짐 24개 (스킬 24)

<details><summary>새로 켜지는 항목 24개</summary>

- **스킬**: aws-sdk-v2-s3-rekognition · bouncycastle-crypto · claude-code-hook-authoring · ddd · docker-deployment · github-actions · global-exception-validation · hikaricp-tuning-oracle-mysql · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · logback-mdc-tracing · lombok-mapstruct-modelmapper · module-boundaries · mybatis-mapper-patterns · redis-redisson-4 · redis-redisson-modern · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-security-6-jwt-jjwt12 · springdoc-openapi-3 · testing-junit5-spring-boot · webflux-webclient-in-sync-app · xss-lucy-jsoup

</details>

<details><summary>✅ 켜짐 94개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (13): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · relation-guard · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (11): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · java.md · memory-sync.md · readme-update.md · rust.md · typescript.md
- **커맨드** (11): agent-status · codex-review · commit · context-prime · create-plan · create-pr · fix-pr · sparc-refine · spec-extract · tdd-implement · update-docs
- **에이전트** (32): agent-creator · api-spec-designer · build-error-resolver · business-domain-analyst · changelog-writer · codebase-domain-analyst · competitor-analyst · data-analyst · database-architect · deep-researcher · devops-engineer · freshness-auditor · frontend-architect · frontend-developer · frontend-domain-refactorer · java-backend-architect · java-backend-developer · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · pr-reviewer · product-planner · project-scaffolder · qa-engineer · security-auditor · skill-creator · skill-tester · spec-reviewer · typescript-backend-architect · typescript-backend-developer · ui-ux-designer
- **스킬** (25): aws-sdk-v2-s3-rekognition · bouncycastle-crypto · claude-code-hook-authoring · ddd · docker-deployment · github-actions · global-exception-validation · hikaricp-tuning-oracle-mysql · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · logback-mdc-tracing · lombok-mapstruct-modelmapper · module-boundaries · mybatis-mapper-patterns · redis-redisson-4 · redis-redisson-modern · spec-extraction-method · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-security-6-jwt-jjwt12 · springdoc-openapi-3 · testing-junit5-spring-boot · webflux-webclient-in-sync-app · xss-lucy-jsoup

</details>

<details><summary>⬜ 꺼짐 192개</summary>

- **에이전트** (22): a11y-auditor · build-perf-benchmarker · content-quality-reviewer · dream-image-safety-classifier · dream-interpretation-prompt-tester · dream-journal-coach · dream-multi-perspective-synthesizer · dream-safety-classifier · fortune-interpretation-prompt-tester · game-asset-ai-director · game-design-document-writer · game-monetization-strategist · mobile-app-publisher · nutrition-prompt-tester · perf-report-writer · python-backend-architect · python-backend-developer · rust-backend-architect · rust-backend-developer · seo-auditor · unity-architect · unity-developer
- **스킬** (170): accessibility-vpat-writing · ag-grid · ai-game-asset-pipeline · animation · app-store-submission · attachment-theory-basics · aws-sdk-v1-s3-rekognition · axum · better-auth · bot-management-seo · build-perf-benchmarking · bundle-size-analysis · bundling-compiler · characterization-testing · chat-ui-pattern · claude-api-streaming-frontend · claude-code-headless · code-convention · content-eeat-quality · core-web-vitals-optimization · crisis-intervention-resources-korea · daily-fortune-retention-loop · design-token-scss · dev-server-hmr-benchmarking · dream-app-ab-testing-prompts · dream-app-onboarding · dream-content-privacy-ethics · dream-content-research · dream-export-import · dream-image-generation · dream-interpretation-prompt-engineering · dream-journal-data-modeling · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-recurrence-detection · dream-safety-classifier-prompts · dream-sharing-anonymized · dream-statistics-visualization · dream-symbol-tagging · drizzle-neon-postgres · e2e-testing · ecommerce-seo · ehcache-2-legacy · emotion-tagging-input · font-optimization · form-handling · fortune-interpretation-prompt-engineering · frontend-domain-structure · game-audio-ai-tools · game-design-document · geo-ai-discoverability · github-actions-visual-regression · google-indexing-api · hono-api-patterns · i18n-seo · ibatis-to-mybatis-migration · image-optimization-seo · indexeddb-dexie · ingredient-management · jwt-auth · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · local-business-seo · meal-recommendation-prompt · media-recorder-api · mobile-seo-pwa · mobile-user-acquisition · monorepo-turborepo · mui-v5 · mui-v9 · multilingual-content-strategy · multipart-upload · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · n8n-workflow-design · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · og-image-generation · palm-photo-capture-vision · palmistry-limitations · prisma-orm · project-structure · pwa-offline-llm-fallback · pwa-push-notifications · python-anthropic-sdk · python-async-asyncio · python-cli-typer · python-embeddings-vector-db · python-fastapi · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · python-pydantic-v2 · python-uv-project-setup · react-spec-extraction · recoil-to-zustand-migration · redis-redisson-legacy · reqwest · rsbuild · saju-chart-visualization · saju-tarot-data-modeling · schema-org-patterns · search-console-webmaster · security-headers-seo · seo-monitoring-automation · seo-nextjs · seo-static-html · seo-vite-spa · site-migration-seo · spring-boot-1-to-2-migration · spring-boot-2-to-3-migration · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · sqlx · srs-spaced-repetition · sse-streaming · state-management · storybook · storybook-visual-testing · structured-data-validation-api · swagger-springfox-2 · swiper · tanstack-query · tanstack-query-v4-to-v5-migration · tarot-card-deck-ui · tarot-history-symbolism · testing · testing-rust · tower-http · tsup · typescript-v4 · typescript-v5 · unity-6-2d-fundamentals · unity-addressables · unity-cicd-codemagic · unity-firebase · unity-game-feel · unity-iap · unity-levelplay-ads · unity-live-ops · unity-mobile-optimization · unity-save-system · unity-ui-system · url-canonicalization-redirects · vercel-sandbox · vercel-workflow · vite-advanced-splitting · vite-pwa-service-worker · voice-input-ui · wcag-2.2-checklist · web-speech-api-stt · web-vitals-rum-comparison · webpack-vite-config-mapping · whisper-api-integration · xapi-to-rest-migration · ymyl-content-seo · zod-schema-validation

</details>

### `rust` — Rust Axum

- 켜는 블록: `dev-common` · `rust`
- 🔒 고정 35 · ✅ 켜짐 87 · ⬜ 꺼짐 199
- 기본과 비교: 새로 켜짐 17개 (에이전트 2 · 스킬 15)

<details><summary>새로 켜지는 항목 17개</summary>

- **에이전트**: rust-backend-architect · rust-backend-developer
- **스킬**: axum · claude-code-hook-authoring · ddd · docker-deployment · github-actions · incremental-refactoring · jwt-auth · module-boundaries · multipart-upload · project-structure · reqwest · sqlx · sse-streaming · testing-rust · tower-http

</details>

<details><summary>✅ 켜짐 87개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (13): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · relation-guard · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (11): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · java.md · memory-sync.md · readme-update.md · rust.md · typescript.md
- **커맨드** (11): agent-status · codex-review · commit · context-prime · create-plan · create-pr · fix-pr · sparc-refine · spec-extract · tdd-implement · update-docs
- **에이전트** (34): agent-creator · api-spec-designer · build-error-resolver · business-domain-analyst · changelog-writer · codebase-domain-analyst · competitor-analyst · data-analyst · database-architect · deep-researcher · devops-engineer · freshness-auditor · frontend-architect · frontend-developer · frontend-domain-refactorer · java-backend-architect · java-backend-developer · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · pr-reviewer · product-planner · project-scaffolder · qa-engineer · rust-backend-architect · rust-backend-developer · security-auditor · skill-creator · skill-tester · spec-reviewer · typescript-backend-architect · typescript-backend-developer · ui-ux-designer
- **스킬** (16): axum · claude-code-hook-authoring · ddd · docker-deployment · github-actions · incremental-refactoring · jwt-auth · module-boundaries · multipart-upload · project-structure · reqwest · spec-extraction-method · sqlx · sse-streaming · testing-rust · tower-http

</details>

<details><summary>⬜ 꺼짐 199개</summary>

- **에이전트** (20): a11y-auditor · build-perf-benchmarker · content-quality-reviewer · dream-image-safety-classifier · dream-interpretation-prompt-tester · dream-journal-coach · dream-multi-perspective-synthesizer · dream-safety-classifier · fortune-interpretation-prompt-tester · game-asset-ai-director · game-design-document-writer · game-monetization-strategist · mobile-app-publisher · nutrition-prompt-tester · perf-report-writer · python-backend-architect · python-backend-developer · seo-auditor · unity-architect · unity-developer
- **스킬** (179): accessibility-vpat-writing · ag-grid · ai-game-asset-pipeline · animation · app-store-submission · attachment-theory-basics · aws-sdk-v1-s3-rekognition · aws-sdk-v2-s3-rekognition · better-auth · bot-management-seo · bouncycastle-crypto · build-perf-benchmarking · bundle-size-analysis · bundling-compiler · characterization-testing · chat-ui-pattern · claude-api-streaming-frontend · claude-code-headless · code-convention · content-eeat-quality · core-web-vitals-optimization · crisis-intervention-resources-korea · daily-fortune-retention-loop · design-token-scss · dev-server-hmr-benchmarking · dream-app-ab-testing-prompts · dream-app-onboarding · dream-content-privacy-ethics · dream-content-research · dream-export-import · dream-image-generation · dream-interpretation-prompt-engineering · dream-journal-data-modeling · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-recurrence-detection · dream-safety-classifier-prompts · dream-sharing-anonymized · dream-statistics-visualization · dream-symbol-tagging · drizzle-neon-postgres · e2e-testing · ecommerce-seo · ehcache-2-legacy · emotion-tagging-input · font-optimization · form-handling · fortune-interpretation-prompt-engineering · frontend-domain-structure · game-audio-ai-tools · game-design-document · geo-ai-discoverability · github-actions-visual-regression · global-exception-validation · google-indexing-api · hikaricp-tuning-oracle-mysql · hono-api-patterns · i18n-seo · ibatis-to-mybatis-migration · image-optimization-seo · indexeddb-dexie · ingredient-management · jackson-time-migration · jasypt-encrypted-config · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · local-business-seo · logback-mdc-tracing · lombok-mapstruct-modelmapper · meal-recommendation-prompt · media-recorder-api · mobile-seo-pwa · mobile-user-acquisition · monorepo-turborepo · mui-v5 · mui-v9 · multilingual-content-strategy · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · n8n-workflow-design · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · og-image-generation · palm-photo-capture-vision · palmistry-limitations · prisma-orm · pwa-offline-llm-fallback · pwa-push-notifications · python-anthropic-sdk · python-async-asyncio · python-cli-typer · python-embeddings-vector-db · python-fastapi · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · python-pydantic-v2 · python-uv-project-setup · react-spec-extraction · recoil-to-zustand-migration · redis-redisson-4 · redis-redisson-legacy · redis-redisson-modern · rsbuild · saju-chart-visualization · saju-tarot-data-modeling · schema-org-patterns · search-console-webmaster · security-headers-seo · seo-monitoring-automation · seo-nextjs · seo-static-html · seo-vite-spa · site-migration-seo · spring-boot-1-to-2-migration · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · springdoc-openapi-3 · srs-spaced-repetition · state-management · storybook · storybook-visual-testing · structured-data-validation-api · swagger-springfox-2 · swiper · tanstack-query · tanstack-query-v4-to-v5-migration · tarot-card-deck-ui · tarot-history-symbolism · testing · testing-junit5-spring-boot · tsup · typescript-v4 · typescript-v5 · unity-6-2d-fundamentals · unity-addressables · unity-cicd-codemagic · unity-firebase · unity-game-feel · unity-iap · unity-levelplay-ads · unity-live-ops · unity-mobile-optimization · unity-save-system · unity-ui-system · url-canonicalization-redirects · vercel-sandbox · vercel-workflow · vite-advanced-splitting · vite-pwa-service-worker · voice-input-ui · wcag-2.2-checklist · web-speech-api-stt · web-vitals-rum-comparison · webflux-webclient-in-sync-app · webpack-vite-config-mapping · whisper-api-integration · xapi-to-rest-migration · xss-lucy-jsoup · ymyl-content-seo · zod-schema-validation

</details>

### `python` — Python FastAPI

- 켜는 블록: `dev-common` · `python`
- 🔒 고정 35 · ✅ 켜짐 88 · ⬜ 꺼짐 198
- 기본과 비교: 새로 켜짐 18개 (에이전트 2 · 스킬 16)

<details><summary>새로 켜지는 항목 18개</summary>

- **에이전트**: python-backend-architect · python-backend-developer
- **스킬**: claude-code-hook-authoring · ddd · docker-deployment · github-actions · incremental-refactoring · module-boundaries · python-anthropic-sdk · python-async-asyncio · python-cli-typer · python-embeddings-vector-db · python-fastapi · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · python-pydantic-v2 · python-uv-project-setup

</details>

<details><summary>✅ 켜짐 88개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (13): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · relation-guard · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (11): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · java.md · memory-sync.md · readme-update.md · rust.md · typescript.md
- **커맨드** (11): agent-status · codex-review · commit · context-prime · create-plan · create-pr · fix-pr · sparc-refine · spec-extract · tdd-implement · update-docs
- **에이전트** (34): agent-creator · api-spec-designer · build-error-resolver · business-domain-analyst · changelog-writer · codebase-domain-analyst · competitor-analyst · data-analyst · database-architect · deep-researcher · devops-engineer · freshness-auditor · frontend-architect · frontend-developer · frontend-domain-refactorer · java-backend-architect · java-backend-developer · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · pr-reviewer · product-planner · project-scaffolder · python-backend-architect · python-backend-developer · qa-engineer · security-auditor · skill-creator · skill-tester · spec-reviewer · typescript-backend-architect · typescript-backend-developer · ui-ux-designer
- **스킬** (17): claude-code-hook-authoring · ddd · docker-deployment · github-actions · incremental-refactoring · module-boundaries · python-anthropic-sdk · python-async-asyncio · python-cli-typer · python-embeddings-vector-db · python-fastapi · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · python-pydantic-v2 · python-uv-project-setup · spec-extraction-method

</details>

<details><summary>⬜ 꺼짐 198개</summary>

- **에이전트** (20): a11y-auditor · build-perf-benchmarker · content-quality-reviewer · dream-image-safety-classifier · dream-interpretation-prompt-tester · dream-journal-coach · dream-multi-perspective-synthesizer · dream-safety-classifier · fortune-interpretation-prompt-tester · game-asset-ai-director · game-design-document-writer · game-monetization-strategist · mobile-app-publisher · nutrition-prompt-tester · perf-report-writer · rust-backend-architect · rust-backend-developer · seo-auditor · unity-architect · unity-developer
- **스킬** (178): accessibility-vpat-writing · ag-grid · ai-game-asset-pipeline · animation · app-store-submission · attachment-theory-basics · aws-sdk-v1-s3-rekognition · aws-sdk-v2-s3-rekognition · axum · better-auth · bot-management-seo · bouncycastle-crypto · build-perf-benchmarking · bundle-size-analysis · bundling-compiler · characterization-testing · chat-ui-pattern · claude-api-streaming-frontend · claude-code-headless · code-convention · content-eeat-quality · core-web-vitals-optimization · crisis-intervention-resources-korea · daily-fortune-retention-loop · design-token-scss · dev-server-hmr-benchmarking · dream-app-ab-testing-prompts · dream-app-onboarding · dream-content-privacy-ethics · dream-content-research · dream-export-import · dream-image-generation · dream-interpretation-prompt-engineering · dream-journal-data-modeling · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-recurrence-detection · dream-safety-classifier-prompts · dream-sharing-anonymized · dream-statistics-visualization · dream-symbol-tagging · drizzle-neon-postgres · e2e-testing · ecommerce-seo · ehcache-2-legacy · emotion-tagging-input · font-optimization · form-handling · fortune-interpretation-prompt-engineering · frontend-domain-structure · game-audio-ai-tools · game-design-document · geo-ai-discoverability · github-actions-visual-regression · global-exception-validation · google-indexing-api · hikaricp-tuning-oracle-mysql · hono-api-patterns · i18n-seo · ibatis-to-mybatis-migration · image-optimization-seo · indexeddb-dexie · ingredient-management · jackson-time-migration · jasypt-encrypted-config · jwt-auth · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · local-business-seo · logback-mdc-tracing · lombok-mapstruct-modelmapper · meal-recommendation-prompt · media-recorder-api · mobile-seo-pwa · mobile-user-acquisition · monorepo-turborepo · mui-v5 · mui-v9 · multilingual-content-strategy · multipart-upload · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · n8n-workflow-design · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · og-image-generation · palm-photo-capture-vision · palmistry-limitations · prisma-orm · project-structure · pwa-offline-llm-fallback · pwa-push-notifications · react-spec-extraction · recoil-to-zustand-migration · redis-redisson-4 · redis-redisson-legacy · redis-redisson-modern · reqwest · rsbuild · saju-chart-visualization · saju-tarot-data-modeling · schema-org-patterns · search-console-webmaster · security-headers-seo · seo-monitoring-automation · seo-nextjs · seo-static-html · seo-vite-spa · site-migration-seo · spring-boot-1-to-2-migration · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · springdoc-openapi-3 · sqlx · srs-spaced-repetition · sse-streaming · state-management · storybook · storybook-visual-testing · structured-data-validation-api · swagger-springfox-2 · swiper · tanstack-query · tanstack-query-v4-to-v5-migration · tarot-card-deck-ui · tarot-history-symbolism · testing · testing-junit5-spring-boot · testing-rust · tower-http · tsup · typescript-v4 · typescript-v5 · unity-6-2d-fundamentals · unity-addressables · unity-cicd-codemagic · unity-firebase · unity-game-feel · unity-iap · unity-levelplay-ads · unity-live-ops · unity-mobile-optimization · unity-save-system · unity-ui-system · url-canonicalization-redirects · vercel-sandbox · vercel-workflow · vite-advanced-splitting · vite-pwa-service-worker · voice-input-ui · wcag-2.2-checklist · web-speech-api-stt · web-vitals-rum-comparison · webflux-webclient-in-sync-app · webpack-vite-config-mapping · whisper-api-integration · xapi-to-rest-migration · xss-lucy-jsoup · ymyl-content-seo · zod-schema-validation

</details>

### `unity` — Unity 게임

- 켜는 블록: `dev-common` · `unity`
- 🔒 고정 35 · ✅ 켜짐 98 · ⬜ 꺼짐 188
- 기본과 비교: 새로 켜짐 28개 (에이전트 6 · 스킬 22)

<details><summary>새로 켜지는 항목 28개</summary>

- **에이전트**: game-asset-ai-director · game-design-document-writer · game-monetization-strategist · mobile-app-publisher · unity-architect · unity-developer
- **스킬**: ai-game-asset-pipeline · app-store-submission · claude-code-hook-authoring · ddd · docker-deployment · game-audio-ai-tools · game-design-document · github-actions · incremental-refactoring · mobile-user-acquisition · module-boundaries · unity-6-2d-fundamentals · unity-addressables · unity-cicd-codemagic · unity-firebase · unity-game-feel · unity-iap · unity-levelplay-ads · unity-live-ops · unity-mobile-optimization · unity-save-system · unity-ui-system

</details>

<details><summary>✅ 켜짐 98개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (13): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · relation-guard · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (11): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · java.md · memory-sync.md · readme-update.md · rust.md · typescript.md
- **커맨드** (11): agent-status · codex-review · commit · context-prime · create-plan · create-pr · fix-pr · sparc-refine · spec-extract · tdd-implement · update-docs
- **에이전트** (38): agent-creator · api-spec-designer · build-error-resolver · business-domain-analyst · changelog-writer · codebase-domain-analyst · competitor-analyst · data-analyst · database-architect · deep-researcher · devops-engineer · freshness-auditor · frontend-architect · frontend-developer · frontend-domain-refactorer · game-asset-ai-director · game-design-document-writer · game-monetization-strategist · java-backend-architect · java-backend-developer · legacy-spec-extractor · migration-parity-tester · mobile-app-publisher · nexacro-screen-analyzer · nexacro-screen-converter · pr-reviewer · product-planner · project-scaffolder · qa-engineer · security-auditor · skill-creator · skill-tester · spec-reviewer · typescript-backend-architect · typescript-backend-developer · ui-ux-designer · unity-architect · unity-developer
- **스킬** (23): ai-game-asset-pipeline · app-store-submission · claude-code-hook-authoring · ddd · docker-deployment · game-audio-ai-tools · game-design-document · github-actions · incremental-refactoring · mobile-user-acquisition · module-boundaries · spec-extraction-method · unity-6-2d-fundamentals · unity-addressables · unity-cicd-codemagic · unity-firebase · unity-game-feel · unity-iap · unity-levelplay-ads · unity-live-ops · unity-mobile-optimization · unity-save-system · unity-ui-system

</details>

<details><summary>⬜ 꺼짐 188개</summary>

- **에이전트** (16): a11y-auditor · build-perf-benchmarker · content-quality-reviewer · dream-image-safety-classifier · dream-interpretation-prompt-tester · dream-journal-coach · dream-multi-perspective-synthesizer · dream-safety-classifier · fortune-interpretation-prompt-tester · nutrition-prompt-tester · perf-report-writer · python-backend-architect · python-backend-developer · rust-backend-architect · rust-backend-developer · seo-auditor
- **스킬** (172): accessibility-vpat-writing · ag-grid · animation · attachment-theory-basics · aws-sdk-v1-s3-rekognition · aws-sdk-v2-s3-rekognition · axum · better-auth · bot-management-seo · bouncycastle-crypto · build-perf-benchmarking · bundle-size-analysis · bundling-compiler · characterization-testing · chat-ui-pattern · claude-api-streaming-frontend · claude-code-headless · code-convention · content-eeat-quality · core-web-vitals-optimization · crisis-intervention-resources-korea · daily-fortune-retention-loop · design-token-scss · dev-server-hmr-benchmarking · dream-app-ab-testing-prompts · dream-app-onboarding · dream-content-privacy-ethics · dream-content-research · dream-export-import · dream-image-generation · dream-interpretation-prompt-engineering · dream-journal-data-modeling · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-recurrence-detection · dream-safety-classifier-prompts · dream-sharing-anonymized · dream-statistics-visualization · dream-symbol-tagging · drizzle-neon-postgres · e2e-testing · ecommerce-seo · ehcache-2-legacy · emotion-tagging-input · font-optimization · form-handling · fortune-interpretation-prompt-engineering · frontend-domain-structure · geo-ai-discoverability · github-actions-visual-regression · global-exception-validation · google-indexing-api · hikaricp-tuning-oracle-mysql · hono-api-patterns · i18n-seo · ibatis-to-mybatis-migration · image-optimization-seo · indexeddb-dexie · ingredient-management · jackson-time-migration · jasypt-encrypted-config · jwt-auth · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · local-business-seo · logback-mdc-tracing · lombok-mapstruct-modelmapper · meal-recommendation-prompt · media-recorder-api · mobile-seo-pwa · monorepo-turborepo · mui-v5 · mui-v9 · multilingual-content-strategy · multipart-upload · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · n8n-workflow-design · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · og-image-generation · palm-photo-capture-vision · palmistry-limitations · prisma-orm · project-structure · pwa-offline-llm-fallback · pwa-push-notifications · python-anthropic-sdk · python-async-asyncio · python-cli-typer · python-embeddings-vector-db · python-fastapi · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · python-pydantic-v2 · python-uv-project-setup · react-spec-extraction · recoil-to-zustand-migration · redis-redisson-4 · redis-redisson-legacy · redis-redisson-modern · reqwest · rsbuild · saju-chart-visualization · saju-tarot-data-modeling · schema-org-patterns · search-console-webmaster · security-headers-seo · seo-monitoring-automation · seo-nextjs · seo-static-html · seo-vite-spa · site-migration-seo · spring-boot-1-to-2-migration · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · springdoc-openapi-3 · sqlx · srs-spaced-repetition · sse-streaming · state-management · storybook · storybook-visual-testing · structured-data-validation-api · swagger-springfox-2 · swiper · tanstack-query · tanstack-query-v4-to-v5-migration · tarot-card-deck-ui · tarot-history-symbolism · testing · testing-junit5-spring-boot · testing-rust · tower-http · tsup · typescript-v4 · typescript-v5 · url-canonicalization-redirects · vercel-sandbox · vercel-workflow · vite-advanced-splitting · vite-pwa-service-worker · voice-input-ui · wcag-2.2-checklist · web-speech-api-stt · web-vitals-rum-comparison · webflux-webclient-in-sync-app · webpack-vite-config-mapping · whisper-api-integration · xapi-to-rest-migration · xss-lucy-jsoup · ymyl-content-seo · zod-schema-validation

</details>

### `dream` — 꿈 해몽 앱

- 켜는 블록: `frontend-core` · `frontend-tooling` · `ai-app` · `dream`
- 🔒 고정 35 · ✅ 켜짐 144 · ⬜ 꺼짐 142
- 기본과 비교: 새로 켜짐 74개 (에이전트 8 · 스킬 66)

<details><summary>새로 켜지는 항목 74개</summary>

- **에이전트**: a11y-auditor · build-perf-benchmarker · dream-image-safety-classifier · dream-interpretation-prompt-tester · dream-journal-coach · dream-multi-perspective-synthesizer · dream-safety-classifier · perf-report-writer
- **스킬**: ag-grid · animation · attachment-theory-basics · build-perf-benchmarking · bundle-size-analysis · bundling-compiler · chat-ui-pattern · claude-api-streaming-frontend · code-convention · core-web-vitals-optimization · crisis-intervention-resources-korea · design-token-scss · dev-server-hmr-benchmarking · dream-app-ab-testing-prompts · dream-app-onboarding · dream-content-privacy-ethics · dream-content-research · dream-export-import · dream-image-generation · dream-interpretation-prompt-engineering · dream-journal-data-modeling · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-recurrence-detection · dream-safety-classifier-prompts · dream-sharing-anonymized · dream-statistics-visualization · dream-symbol-tagging · e2e-testing · emotion-tagging-input · font-optimization · form-handling · frontend-domain-structure · github-actions-visual-regression · indexeddb-dexie · korean-dream-interpretation-tradition · lighthouse-ci-setup · media-recorder-api · monorepo-turborepo · mui-v5 · mui-v9 · next-intl-i18n · nextjs · pwa-offline-llm-fallback · pwa-push-notifications · recoil-to-zustand-migration · rsbuild · srs-spaced-repetition · state-management · storybook · storybook-visual-testing · swiper · tanstack-query · tanstack-query-v4-to-v5-migration · testing · tsup · typescript-v4 · typescript-v5 · vite-advanced-splitting · vite-pwa-service-worker · voice-input-ui · wcag-2.2-checklist · web-speech-api-stt · web-vitals-rum-comparison · webpack-vite-config-mapping · whisper-api-integration

</details>

<details><summary>✅ 켜짐 144개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (13): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · relation-guard · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (11): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · java.md · memory-sync.md · readme-update.md · rust.md · typescript.md
- **커맨드** (11): agent-status · codex-review · commit · context-prime · create-plan · create-pr · fix-pr · sparc-refine · spec-extract · tdd-implement · update-docs
- **에이전트** (40): a11y-auditor · agent-creator · api-spec-designer · build-error-resolver · build-perf-benchmarker · business-domain-analyst · changelog-writer · codebase-domain-analyst · competitor-analyst · data-analyst · database-architect · deep-researcher · devops-engineer · dream-image-safety-classifier · dream-interpretation-prompt-tester · dream-journal-coach · dream-multi-perspective-synthesizer · dream-safety-classifier · freshness-auditor · frontend-architect · frontend-developer · frontend-domain-refactorer · java-backend-architect · java-backend-developer · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · perf-report-writer · pr-reviewer · product-planner · project-scaffolder · qa-engineer · security-auditor · skill-creator · skill-tester · spec-reviewer · typescript-backend-architect · typescript-backend-developer · ui-ux-designer
- **스킬** (67): ag-grid · animation · attachment-theory-basics · build-perf-benchmarking · bundle-size-analysis · bundling-compiler · chat-ui-pattern · claude-api-streaming-frontend · code-convention · core-web-vitals-optimization · crisis-intervention-resources-korea · design-token-scss · dev-server-hmr-benchmarking · dream-app-ab-testing-prompts · dream-app-onboarding · dream-content-privacy-ethics · dream-content-research · dream-export-import · dream-image-generation · dream-interpretation-prompt-engineering · dream-journal-data-modeling · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-recurrence-detection · dream-safety-classifier-prompts · dream-sharing-anonymized · dream-statistics-visualization · dream-symbol-tagging · e2e-testing · emotion-tagging-input · font-optimization · form-handling · frontend-domain-structure · github-actions-visual-regression · indexeddb-dexie · korean-dream-interpretation-tradition · lighthouse-ci-setup · media-recorder-api · monorepo-turborepo · mui-v5 · mui-v9 · next-intl-i18n · nextjs · pwa-offline-llm-fallback · pwa-push-notifications · recoil-to-zustand-migration · rsbuild · spec-extraction-method · srs-spaced-repetition · state-management · storybook · storybook-visual-testing · swiper · tanstack-query · tanstack-query-v4-to-v5-migration · testing · tsup · typescript-v4 · typescript-v5 · vite-advanced-splitting · vite-pwa-service-worker · voice-input-ui · wcag-2.2-checklist · web-speech-api-stt · web-vitals-rum-comparison · webpack-vite-config-mapping · whisper-api-integration

</details>

<details><summary>⬜ 꺼짐 142개</summary>

- **에이전트** (14): content-quality-reviewer · fortune-interpretation-prompt-tester · game-asset-ai-director · game-design-document-writer · game-monetization-strategist · mobile-app-publisher · nutrition-prompt-tester · python-backend-architect · python-backend-developer · rust-backend-architect · rust-backend-developer · seo-auditor · unity-architect · unity-developer
- **스킬** (128): accessibility-vpat-writing · ai-game-asset-pipeline · app-store-submission · aws-sdk-v1-s3-rekognition · aws-sdk-v2-s3-rekognition · axum · better-auth · bot-management-seo · bouncycastle-crypto · characterization-testing · claude-code-headless · claude-code-hook-authoring · content-eeat-quality · daily-fortune-retention-loop · ddd · docker-deployment · drizzle-neon-postgres · ecommerce-seo · ehcache-2-legacy · fortune-interpretation-prompt-engineering · game-audio-ai-tools · game-design-document · geo-ai-discoverability · github-actions · global-exception-validation · google-indexing-api · hikaricp-tuning-oracle-mysql · hono-api-patterns · i18n-seo · ibatis-to-mybatis-migration · image-optimization-seo · incremental-refactoring · ingredient-management · jackson-time-migration · jasypt-encrypted-config · jwt-auth · kakao-share-optimization · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · local-business-seo · logback-mdc-tracing · lombok-mapstruct-modelmapper · meal-recommendation-prompt · mobile-seo-pwa · mobile-user-acquisition · module-boundaries · multilingual-content-strategy · multipart-upload · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · n8n-workflow-design · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · nutrition-analysis-prompt · nutrition-basics · og-image-generation · palm-photo-capture-vision · palmistry-limitations · prisma-orm · project-structure · python-anthropic-sdk · python-async-asyncio · python-cli-typer · python-embeddings-vector-db · python-fastapi · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · python-pydantic-v2 · python-uv-project-setup · react-spec-extraction · redis-redisson-4 · redis-redisson-legacy · redis-redisson-modern · reqwest · saju-chart-visualization · saju-tarot-data-modeling · schema-org-patterns · search-console-webmaster · security-headers-seo · seo-monitoring-automation · seo-nextjs · seo-static-html · seo-vite-spa · site-migration-seo · spring-boot-1-to-2-migration · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · springdoc-openapi-3 · sqlx · sse-streaming · structured-data-validation-api · swagger-springfox-2 · tarot-card-deck-ui · tarot-history-symbolism · testing-junit5-spring-boot · testing-rust · tower-http · unity-6-2d-fundamentals · unity-addressables · unity-cicd-codemagic · unity-firebase · unity-game-feel · unity-iap · unity-levelplay-ads · unity-live-ops · unity-mobile-optimization · unity-save-system · unity-ui-system · url-canonicalization-redirects · vercel-sandbox · vercel-workflow · webflux-webclient-in-sync-app · xapi-to-rest-migration · xss-lucy-jsoup · ymyl-content-seo · zod-schema-validation

</details>

### `fortune` — 운세 앱

- 켜는 블록: `frontend-core` · `frontend-tooling` · `ai-app` · `fortune`
- 🔒 고정 35 · ✅ 켜짐 132 · ⬜ 꺼짐 154
- 기본과 비교: 새로 켜짐 62개 (에이전트 4 · 스킬 58)

<details><summary>새로 켜지는 항목 62개</summary>

- **에이전트**: a11y-auditor · build-perf-benchmarker · fortune-interpretation-prompt-tester · perf-report-writer
- **스킬**: ag-grid · animation · build-perf-benchmarking · bundle-size-analysis · bundling-compiler · chat-ui-pattern · claude-api-streaming-frontend · code-convention · core-web-vitals-optimization · daily-fortune-retention-loop · design-token-scss · dev-server-hmr-benchmarking · e2e-testing · emotion-tagging-input · font-optimization · form-handling · fortune-interpretation-prompt-engineering · frontend-domain-structure · github-actions-visual-regression · indexeddb-dexie · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · media-recorder-api · monorepo-turborepo · mui-v5 · mui-v9 · next-intl-i18n · nextjs · palm-photo-capture-vision · palmistry-limitations · pwa-offline-llm-fallback · pwa-push-notifications · recoil-to-zustand-migration · rsbuild · saju-chart-visualization · saju-tarot-data-modeling · srs-spaced-repetition · state-management · storybook · storybook-visual-testing · swiper · tanstack-query · tanstack-query-v4-to-v5-migration · tarot-card-deck-ui · tarot-history-symbolism · testing · tsup · typescript-v4 · typescript-v5 · vite-advanced-splitting · vite-pwa-service-worker · voice-input-ui · wcag-2.2-checklist · web-speech-api-stt · web-vitals-rum-comparison · webpack-vite-config-mapping · whisper-api-integration

</details>

<details><summary>✅ 켜짐 132개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (13): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · relation-guard · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (11): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · java.md · memory-sync.md · readme-update.md · rust.md · typescript.md
- **커맨드** (11): agent-status · codex-review · commit · context-prime · create-plan · create-pr · fix-pr · sparc-refine · spec-extract · tdd-implement · update-docs
- **에이전트** (36): a11y-auditor · agent-creator · api-spec-designer · build-error-resolver · build-perf-benchmarker · business-domain-analyst · changelog-writer · codebase-domain-analyst · competitor-analyst · data-analyst · database-architect · deep-researcher · devops-engineer · fortune-interpretation-prompt-tester · freshness-auditor · frontend-architect · frontend-developer · frontend-domain-refactorer · java-backend-architect · java-backend-developer · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · perf-report-writer · pr-reviewer · product-planner · project-scaffolder · qa-engineer · security-auditor · skill-creator · skill-tester · spec-reviewer · typescript-backend-architect · typescript-backend-developer · ui-ux-designer
- **스킬** (59): ag-grid · animation · build-perf-benchmarking · bundle-size-analysis · bundling-compiler · chat-ui-pattern · claude-api-streaming-frontend · code-convention · core-web-vitals-optimization · daily-fortune-retention-loop · design-token-scss · dev-server-hmr-benchmarking · e2e-testing · emotion-tagging-input · font-optimization · form-handling · fortune-interpretation-prompt-engineering · frontend-domain-structure · github-actions-visual-regression · indexeddb-dexie · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · media-recorder-api · monorepo-turborepo · mui-v5 · mui-v9 · next-intl-i18n · nextjs · palm-photo-capture-vision · palmistry-limitations · pwa-offline-llm-fallback · pwa-push-notifications · recoil-to-zustand-migration · rsbuild · saju-chart-visualization · saju-tarot-data-modeling · spec-extraction-method · srs-spaced-repetition · state-management · storybook · storybook-visual-testing · swiper · tanstack-query · tanstack-query-v4-to-v5-migration · tarot-card-deck-ui · tarot-history-symbolism · testing · tsup · typescript-v4 · typescript-v5 · vite-advanced-splitting · vite-pwa-service-worker · voice-input-ui · wcag-2.2-checklist · web-speech-api-stt · web-vitals-rum-comparison · webpack-vite-config-mapping · whisper-api-integration

</details>

<details><summary>⬜ 꺼짐 154개</summary>

- **에이전트** (18): content-quality-reviewer · dream-image-safety-classifier · dream-interpretation-prompt-tester · dream-journal-coach · dream-multi-perspective-synthesizer · dream-safety-classifier · game-asset-ai-director · game-design-document-writer · game-monetization-strategist · mobile-app-publisher · nutrition-prompt-tester · python-backend-architect · python-backend-developer · rust-backend-architect · rust-backend-developer · seo-auditor · unity-architect · unity-developer
- **스킬** (136): accessibility-vpat-writing · ai-game-asset-pipeline · app-store-submission · attachment-theory-basics · aws-sdk-v1-s3-rekognition · aws-sdk-v2-s3-rekognition · axum · better-auth · bot-management-seo · bouncycastle-crypto · characterization-testing · claude-code-headless · claude-code-hook-authoring · content-eeat-quality · crisis-intervention-resources-korea · ddd · docker-deployment · dream-app-ab-testing-prompts · dream-app-onboarding · dream-content-privacy-ethics · dream-content-research · dream-export-import · dream-image-generation · dream-interpretation-prompt-engineering · dream-journal-data-modeling · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-recurrence-detection · dream-safety-classifier-prompts · dream-sharing-anonymized · dream-statistics-visualization · dream-symbol-tagging · drizzle-neon-postgres · ecommerce-seo · ehcache-2-legacy · game-audio-ai-tools · game-design-document · geo-ai-discoverability · github-actions · global-exception-validation · google-indexing-api · hikaricp-tuning-oracle-mysql · hono-api-patterns · i18n-seo · ibatis-to-mybatis-migration · image-optimization-seo · incremental-refactoring · ingredient-management · jackson-time-migration · jasypt-encrypted-config · jwt-auth · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · local-business-seo · logback-mdc-tracing · lombok-mapstruct-modelmapper · meal-recommendation-prompt · mobile-seo-pwa · mobile-user-acquisition · module-boundaries · multilingual-content-strategy · multipart-upload · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · n8n-workflow-design · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · nutrition-analysis-prompt · nutrition-basics · og-image-generation · prisma-orm · project-structure · python-anthropic-sdk · python-async-asyncio · python-cli-typer · python-embeddings-vector-db · python-fastapi · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · python-pydantic-v2 · python-uv-project-setup · react-spec-extraction · redis-redisson-4 · redis-redisson-legacy · redis-redisson-modern · reqwest · schema-org-patterns · search-console-webmaster · security-headers-seo · seo-monitoring-automation · seo-nextjs · seo-static-html · seo-vite-spa · site-migration-seo · spring-boot-1-to-2-migration · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · springdoc-openapi-3 · sqlx · sse-streaming · structured-data-validation-api · swagger-springfox-2 · testing-junit5-spring-boot · testing-rust · tower-http · unity-6-2d-fundamentals · unity-addressables · unity-cicd-codemagic · unity-firebase · unity-game-feel · unity-iap · unity-levelplay-ads · unity-live-ops · unity-mobile-optimization · unity-save-system · unity-ui-system · url-canonicalization-redirects · vercel-sandbox · vercel-workflow · webflux-webclient-in-sync-app · xapi-to-rest-migration · xss-lucy-jsoup · ymyl-content-seo · zod-schema-validation

</details>

### `health` — 건강·식단 앱

- 켜는 블록: `frontend-core` · `frontend-tooling` · `ai-app` · `health`
- 🔒 고정 35 · ✅ 켜짐 127 · ⬜ 꺼짐 159
- 기본과 비교: 새로 켜짐 57개 (에이전트 4 · 스킬 53)

<details><summary>새로 켜지는 항목 57개</summary>

- **에이전트**: a11y-auditor · build-perf-benchmarker · nutrition-prompt-tester · perf-report-writer
- **스킬**: ag-grid · animation · build-perf-benchmarking · bundle-size-analysis · bundling-compiler · chat-ui-pattern · claude-api-streaming-frontend · code-convention · core-web-vitals-optimization · design-token-scss · dev-server-hmr-benchmarking · e2e-testing · emotion-tagging-input · font-optimization · form-handling · frontend-domain-structure · github-actions-visual-regression · indexeddb-dexie · ingredient-management · korean-food-nutrition · lighthouse-ci-setup · meal-recommendation-prompt · media-recorder-api · monorepo-turborepo · mui-v5 · mui-v9 · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · pwa-offline-llm-fallback · pwa-push-notifications · recoil-to-zustand-migration · rsbuild · srs-spaced-repetition · state-management · storybook · storybook-visual-testing · swiper · tanstack-query · tanstack-query-v4-to-v5-migration · testing · tsup · typescript-v4 · typescript-v5 · vite-advanced-splitting · vite-pwa-service-worker · voice-input-ui · wcag-2.2-checklist · web-speech-api-stt · web-vitals-rum-comparison · webpack-vite-config-mapping · whisper-api-integration

</details>

<details><summary>✅ 켜짐 127개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (13): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · relation-guard · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (11): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · java.md · memory-sync.md · readme-update.md · rust.md · typescript.md
- **커맨드** (11): agent-status · codex-review · commit · context-prime · create-plan · create-pr · fix-pr · sparc-refine · spec-extract · tdd-implement · update-docs
- **에이전트** (36): a11y-auditor · agent-creator · api-spec-designer · build-error-resolver · build-perf-benchmarker · business-domain-analyst · changelog-writer · codebase-domain-analyst · competitor-analyst · data-analyst · database-architect · deep-researcher · devops-engineer · freshness-auditor · frontend-architect · frontend-developer · frontend-domain-refactorer · java-backend-architect · java-backend-developer · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · nutrition-prompt-tester · perf-report-writer · pr-reviewer · product-planner · project-scaffolder · qa-engineer · security-auditor · skill-creator · skill-tester · spec-reviewer · typescript-backend-architect · typescript-backend-developer · ui-ux-designer
- **스킬** (54): ag-grid · animation · build-perf-benchmarking · bundle-size-analysis · bundling-compiler · chat-ui-pattern · claude-api-streaming-frontend · code-convention · core-web-vitals-optimization · design-token-scss · dev-server-hmr-benchmarking · e2e-testing · emotion-tagging-input · font-optimization · form-handling · frontend-domain-structure · github-actions-visual-regression · indexeddb-dexie · ingredient-management · korean-food-nutrition · lighthouse-ci-setup · meal-recommendation-prompt · media-recorder-api · monorepo-turborepo · mui-v5 · mui-v9 · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · pwa-offline-llm-fallback · pwa-push-notifications · recoil-to-zustand-migration · rsbuild · spec-extraction-method · srs-spaced-repetition · state-management · storybook · storybook-visual-testing · swiper · tanstack-query · tanstack-query-v4-to-v5-migration · testing · tsup · typescript-v4 · typescript-v5 · vite-advanced-splitting · vite-pwa-service-worker · voice-input-ui · wcag-2.2-checklist · web-speech-api-stt · web-vitals-rum-comparison · webpack-vite-config-mapping · whisper-api-integration

</details>

<details><summary>⬜ 꺼짐 159개</summary>

- **에이전트** (18): content-quality-reviewer · dream-image-safety-classifier · dream-interpretation-prompt-tester · dream-journal-coach · dream-multi-perspective-synthesizer · dream-safety-classifier · fortune-interpretation-prompt-tester · game-asset-ai-director · game-design-document-writer · game-monetization-strategist · mobile-app-publisher · python-backend-architect · python-backend-developer · rust-backend-architect · rust-backend-developer · seo-auditor · unity-architect · unity-developer
- **스킬** (141): accessibility-vpat-writing · ai-game-asset-pipeline · app-store-submission · attachment-theory-basics · aws-sdk-v1-s3-rekognition · aws-sdk-v2-s3-rekognition · axum · better-auth · bot-management-seo · bouncycastle-crypto · characterization-testing · claude-code-headless · claude-code-hook-authoring · content-eeat-quality · crisis-intervention-resources-korea · daily-fortune-retention-loop · ddd · docker-deployment · dream-app-ab-testing-prompts · dream-app-onboarding · dream-content-privacy-ethics · dream-content-research · dream-export-import · dream-image-generation · dream-interpretation-prompt-engineering · dream-journal-data-modeling · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-recurrence-detection · dream-safety-classifier-prompts · dream-sharing-anonymized · dream-statistics-visualization · dream-symbol-tagging · drizzle-neon-postgres · ecommerce-seo · ehcache-2-legacy · fortune-interpretation-prompt-engineering · game-audio-ai-tools · game-design-document · geo-ai-discoverability · github-actions · global-exception-validation · google-indexing-api · hikaricp-tuning-oracle-mysql · hono-api-patterns · i18n-seo · ibatis-to-mybatis-migration · image-optimization-seo · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · jwt-auth · kakao-share-optimization · korean-dream-interpretation-tradition · korean-lunar-calendar-manseryeok · korean-saju-tradition · local-business-seo · logback-mdc-tracing · lombok-mapstruct-modelmapper · mobile-seo-pwa · mobile-user-acquisition · module-boundaries · multilingual-content-strategy · multipart-upload · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · n8n-workflow-design · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · og-image-generation · palm-photo-capture-vision · palmistry-limitations · prisma-orm · project-structure · python-anthropic-sdk · python-async-asyncio · python-cli-typer · python-embeddings-vector-db · python-fastapi · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · python-pydantic-v2 · python-uv-project-setup · react-spec-extraction · redis-redisson-4 · redis-redisson-legacy · redis-redisson-modern · reqwest · saju-chart-visualization · saju-tarot-data-modeling · schema-org-patterns · search-console-webmaster · security-headers-seo · seo-monitoring-automation · seo-nextjs · seo-static-html · seo-vite-spa · site-migration-seo · spring-boot-1-to-2-migration · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · springdoc-openapi-3 · sqlx · sse-streaming · structured-data-validation-api · swagger-springfox-2 · tarot-card-deck-ui · tarot-history-symbolism · testing-junit5-spring-boot · testing-rust · tower-http · unity-6-2d-fundamentals · unity-addressables · unity-cicd-codemagic · unity-firebase · unity-game-feel · unity-iap · unity-levelplay-ads · unity-live-ops · unity-mobile-optimization · unity-save-system · unity-ui-system · url-canonicalization-redirects · vercel-sandbox · vercel-workflow · webflux-webclient-in-sync-app · xapi-to-rest-migration · xss-lucy-jsoup · ymyl-content-seo · zod-schema-validation

</details>

### `nexacro` — 넥사크로 마이그레이션

- 켜는 블록: `dev-common` · `frontend-core` · `java-common` · `java-legacy` · `nexacro`
- 🔒 고정 35 · ✅ 켜짐 115 · ⬜ 꺼짐 171
- 기본과 비교: 새로 켜짐 46개 (스킬 46) · 충돌로 꺼짐 1개: tdd-guard

<details><summary>새로 켜지는 항목 46개</summary>

- **스킬**: ag-grid · aws-sdk-v1-s3-rekognition · bouncycastle-crypto · bundle-size-analysis · bundling-compiler · claude-code-hook-authoring · core-web-vitals-optimization · ddd · docker-deployment · e2e-testing · ehcache-2-legacy · form-handling · frontend-domain-structure · github-actions · global-exception-validation · hikaricp-tuning-oracle-mysql · ibatis-to-mybatis-migration · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · logback-mdc-tracing · lombok-mapstruct-modelmapper · module-boundaries · monorepo-turborepo · mybatis-mapper-patterns · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · nextjs · redis-redisson-legacy · spring-boot-1-to-2-migration · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-security-5-jwt-jjwt10 · state-management · swagger-springfox-2 · tanstack-query · tanstack-query-v4-to-v5-migration · testing-junit5-spring-boot · typescript-v4 · typescript-v5 · vite-advanced-splitting · webflux-webclient-in-sync-app · xapi-to-rest-migration · xss-lucy-jsoup

</details>

<details><summary>✅ 켜짐 115개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (12): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · relation-guard · skill-md-guard · staleness-check · test-fake-guard
- **룰** (11): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · java.md · memory-sync.md · readme-update.md · rust.md · typescript.md
- **커맨드** (11): agent-status · codex-review · commit · context-prime · create-plan · create-pr · fix-pr · sparc-refine · spec-extract · tdd-implement · update-docs
- **에이전트** (32): agent-creator · api-spec-designer · build-error-resolver · business-domain-analyst · changelog-writer · codebase-domain-analyst · competitor-analyst · data-analyst · database-architect · deep-researcher · devops-engineer · freshness-auditor · frontend-architect · frontend-developer · frontend-domain-refactorer · java-backend-architect · java-backend-developer · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · pr-reviewer · product-planner · project-scaffolder · qa-engineer · security-auditor · skill-creator · skill-tester · spec-reviewer · typescript-backend-architect · typescript-backend-developer · ui-ux-designer
- **스킬** (47): ag-grid · aws-sdk-v1-s3-rekognition · bouncycastle-crypto · bundle-size-analysis · bundling-compiler · claude-code-hook-authoring · core-web-vitals-optimization · ddd · docker-deployment · e2e-testing · ehcache-2-legacy · form-handling · frontend-domain-structure · github-actions · global-exception-validation · hikaricp-tuning-oracle-mysql · ibatis-to-mybatis-migration · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · logback-mdc-tracing · lombok-mapstruct-modelmapper · module-boundaries · monorepo-turborepo · mybatis-mapper-patterns · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · nextjs · redis-redisson-legacy · spec-extraction-method · spring-boot-1-to-2-migration · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-security-5-jwt-jjwt10 · state-management · swagger-springfox-2 · tanstack-query · tanstack-query-v4-to-v5-migration · testing-junit5-spring-boot · typescript-v4 · typescript-v5 · vite-advanced-splitting · webflux-webclient-in-sync-app · xapi-to-rest-migration · xss-lucy-jsoup

</details>

<details><summary>⬜ 꺼짐 171개</summary>

- **훅** (1): tdd-guard
- **에이전트** (22): a11y-auditor · build-perf-benchmarker · content-quality-reviewer · dream-image-safety-classifier · dream-interpretation-prompt-tester · dream-journal-coach · dream-multi-perspective-synthesizer · dream-safety-classifier · fortune-interpretation-prompt-tester · game-asset-ai-director · game-design-document-writer · game-monetization-strategist · mobile-app-publisher · nutrition-prompt-tester · perf-report-writer · python-backend-architect · python-backend-developer · rust-backend-architect · rust-backend-developer · seo-auditor · unity-architect · unity-developer
- **스킬** (148): accessibility-vpat-writing · ai-game-asset-pipeline · animation · app-store-submission · attachment-theory-basics · aws-sdk-v2-s3-rekognition · axum · better-auth · bot-management-seo · build-perf-benchmarking · characterization-testing · chat-ui-pattern · claude-api-streaming-frontend · claude-code-headless · code-convention · content-eeat-quality · crisis-intervention-resources-korea · daily-fortune-retention-loop · design-token-scss · dev-server-hmr-benchmarking · dream-app-ab-testing-prompts · dream-app-onboarding · dream-content-privacy-ethics · dream-content-research · dream-export-import · dream-image-generation · dream-interpretation-prompt-engineering · dream-journal-data-modeling · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-recurrence-detection · dream-safety-classifier-prompts · dream-sharing-anonymized · dream-statistics-visualization · dream-symbol-tagging · drizzle-neon-postgres · ecommerce-seo · emotion-tagging-input · font-optimization · fortune-interpretation-prompt-engineering · game-audio-ai-tools · game-design-document · geo-ai-discoverability · github-actions-visual-regression · google-indexing-api · hono-api-patterns · i18n-seo · image-optimization-seo · indexeddb-dexie · ingredient-management · jwt-auth · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · local-business-seo · meal-recommendation-prompt · media-recorder-api · mobile-seo-pwa · mobile-user-acquisition · mui-v5 · mui-v9 · multilingual-content-strategy · multipart-upload · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · n8n-workflow-design · naver-seo-specifics · nexacro-17-xfdl-anatomy · next-intl-i18n · nutrition-analysis-prompt · nutrition-basics · og-image-generation · palm-photo-capture-vision · palmistry-limitations · prisma-orm · project-structure · pwa-offline-llm-fallback · pwa-push-notifications · python-anthropic-sdk · python-async-asyncio · python-cli-typer · python-embeddings-vector-db · python-fastapi · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · python-pydantic-v2 · python-uv-project-setup · react-spec-extraction · recoil-to-zustand-migration · redis-redisson-4 · redis-redisson-modern · reqwest · rsbuild · saju-chart-visualization · saju-tarot-data-modeling · schema-org-patterns · search-console-webmaster · security-headers-seo · seo-monitoring-automation · seo-nextjs · seo-static-html · seo-vite-spa · site-migration-seo · spring-mybatis-spec-extraction · spring-security-6-jwt-jjwt12 · springdoc-openapi-3 · sqlx · srs-spaced-repetition · sse-streaming · storybook · storybook-visual-testing · structured-data-validation-api · swiper · tarot-card-deck-ui · tarot-history-symbolism · testing · testing-rust · tower-http · tsup · unity-6-2d-fundamentals · unity-addressables · unity-cicd-codemagic · unity-firebase · unity-game-feel · unity-iap · unity-levelplay-ads · unity-live-ops · unity-mobile-optimization · unity-save-system · unity-ui-system · url-canonicalization-redirects · vercel-sandbox · vercel-workflow · vite-pwa-service-worker · voice-input-ui · wcag-2.2-checklist · web-speech-api-stt · web-vitals-rum-comparison · webpack-vite-config-mapping · whisper-api-integration · ymyl-content-seo · zod-schema-validation

</details>

### `seo-geo` — 애드온 · SEO·GEO

- 애드온 — 다른 프리셋에 더해 씀
- 켜는 블록: `seo-geo`
- 🔒 고정 35 · ✅ 켜짐 97 · ⬜ 꺼짐 189
- 기본과 비교: 새로 켜짐 27개 (에이전트 2 · 스킬 25)

<details><summary>새로 켜지는 항목 27개</summary>

- **에이전트**: content-quality-reviewer · seo-auditor
- **스킬**: accessibility-vpat-writing · bot-management-seo · content-eeat-quality · ecommerce-seo · geo-ai-discoverability · google-indexing-api · i18n-seo · image-optimization-seo · kakao-share-optimization · local-business-seo · mobile-seo-pwa · multilingual-content-strategy · naver-seo-specifics · og-image-generation · schema-org-patterns · search-console-webmaster · security-headers-seo · seo-monitoring-automation · seo-nextjs · seo-static-html · seo-vite-spa · site-migration-seo · structured-data-validation-api · url-canonicalization-redirects · ymyl-content-seo

</details>

<details><summary>✅ 켜짐 97개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (13): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · relation-guard · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (11): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · java.md · memory-sync.md · readme-update.md · rust.md · typescript.md
- **커맨드** (11): agent-status · codex-review · commit · context-prime · create-plan · create-pr · fix-pr · sparc-refine · spec-extract · tdd-implement · update-docs
- **에이전트** (34): agent-creator · api-spec-designer · build-error-resolver · business-domain-analyst · changelog-writer · codebase-domain-analyst · competitor-analyst · content-quality-reviewer · data-analyst · database-architect · deep-researcher · devops-engineer · freshness-auditor · frontend-architect · frontend-developer · frontend-domain-refactorer · java-backend-architect · java-backend-developer · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · pr-reviewer · product-planner · project-scaffolder · qa-engineer · security-auditor · seo-auditor · skill-creator · skill-tester · spec-reviewer · typescript-backend-architect · typescript-backend-developer · ui-ux-designer
- **스킬** (26): accessibility-vpat-writing · bot-management-seo · content-eeat-quality · ecommerce-seo · geo-ai-discoverability · google-indexing-api · i18n-seo · image-optimization-seo · kakao-share-optimization · local-business-seo · mobile-seo-pwa · multilingual-content-strategy · naver-seo-specifics · og-image-generation · schema-org-patterns · search-console-webmaster · security-headers-seo · seo-monitoring-automation · seo-nextjs · seo-static-html · seo-vite-spa · site-migration-seo · spec-extraction-method · structured-data-validation-api · url-canonicalization-redirects · ymyl-content-seo

</details>

<details><summary>⬜ 꺼짐 189개</summary>

- **에이전트** (20): a11y-auditor · build-perf-benchmarker · dream-image-safety-classifier · dream-interpretation-prompt-tester · dream-journal-coach · dream-multi-perspective-synthesizer · dream-safety-classifier · fortune-interpretation-prompt-tester · game-asset-ai-director · game-design-document-writer · game-monetization-strategist · mobile-app-publisher · nutrition-prompt-tester · perf-report-writer · python-backend-architect · python-backend-developer · rust-backend-architect · rust-backend-developer · unity-architect · unity-developer
- **스킬** (169): ag-grid · ai-game-asset-pipeline · animation · app-store-submission · attachment-theory-basics · aws-sdk-v1-s3-rekognition · aws-sdk-v2-s3-rekognition · axum · better-auth · bouncycastle-crypto · build-perf-benchmarking · bundle-size-analysis · bundling-compiler · characterization-testing · chat-ui-pattern · claude-api-streaming-frontend · claude-code-headless · claude-code-hook-authoring · code-convention · core-web-vitals-optimization · crisis-intervention-resources-korea · daily-fortune-retention-loop · ddd · design-token-scss · dev-server-hmr-benchmarking · docker-deployment · dream-app-ab-testing-prompts · dream-app-onboarding · dream-content-privacy-ethics · dream-content-research · dream-export-import · dream-image-generation · dream-interpretation-prompt-engineering · dream-journal-data-modeling · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-recurrence-detection · dream-safety-classifier-prompts · dream-sharing-anonymized · dream-statistics-visualization · dream-symbol-tagging · drizzle-neon-postgres · e2e-testing · ehcache-2-legacy · emotion-tagging-input · font-optimization · form-handling · fortune-interpretation-prompt-engineering · frontend-domain-structure · game-audio-ai-tools · game-design-document · github-actions · github-actions-visual-regression · global-exception-validation · hikaricp-tuning-oracle-mysql · hono-api-patterns · ibatis-to-mybatis-migration · incremental-refactoring · indexeddb-dexie · ingredient-management · jackson-time-migration · jasypt-encrypted-config · jwt-auth · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · logback-mdc-tracing · lombok-mapstruct-modelmapper · meal-recommendation-prompt · media-recorder-api · mobile-user-acquisition · module-boundaries · monorepo-turborepo · mui-v5 · mui-v9 · multipart-upload · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · n8n-workflow-design · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · palm-photo-capture-vision · palmistry-limitations · prisma-orm · project-structure · pwa-offline-llm-fallback · pwa-push-notifications · python-anthropic-sdk · python-async-asyncio · python-cli-typer · python-embeddings-vector-db · python-fastapi · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · python-pydantic-v2 · python-uv-project-setup · react-spec-extraction · recoil-to-zustand-migration · redis-redisson-4 · redis-redisson-legacy · redis-redisson-modern · reqwest · rsbuild · saju-chart-visualization · saju-tarot-data-modeling · spring-boot-1-to-2-migration · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · springdoc-openapi-3 · sqlx · srs-spaced-repetition · sse-streaming · state-management · storybook · storybook-visual-testing · swagger-springfox-2 · swiper · tanstack-query · tanstack-query-v4-to-v5-migration · tarot-card-deck-ui · tarot-history-symbolism · testing · testing-junit5-spring-boot · testing-rust · tower-http · tsup · typescript-v4 · typescript-v5 · unity-6-2d-fundamentals · unity-addressables · unity-cicd-codemagic · unity-firebase · unity-game-feel · unity-iap · unity-levelplay-ads · unity-live-ops · unity-mobile-optimization · unity-save-system · unity-ui-system · vercel-sandbox · vercel-workflow · vite-advanced-splitting · vite-pwa-service-worker · voice-input-ui · wcag-2.2-checklist · web-speech-api-stt · web-vitals-rum-comparison · webflux-webclient-in-sync-app · webpack-vite-config-mapping · whisper-api-integration · xapi-to-rest-migration · xss-lucy-jsoup · zod-schema-validation

</details>

### `spec-extraction` — 애드온 · 레거시 스펙 추출

- 애드온 — 다른 프리셋에 더해 씀
- 켜는 블록: `spec-extraction`
- 🔒 고정 35 · ✅ 켜짐 74 · ⬜ 꺼짐 212
- 기본과 비교: 새로 켜짐 4개 (스킬 4)

<details><summary>새로 켜지는 항목 4개</summary>

- **스킬**: characterization-testing · nexacro-17-xfdl-anatomy · react-spec-extraction · spring-mybatis-spec-extraction

</details>

<details><summary>✅ 켜짐 74개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (13): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · relation-guard · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (11): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · java.md · memory-sync.md · readme-update.md · rust.md · typescript.md
- **커맨드** (11): agent-status · codex-review · commit · context-prime · create-plan · create-pr · fix-pr · sparc-refine · spec-extract · tdd-implement · update-docs
- **에이전트** (32): agent-creator · api-spec-designer · build-error-resolver · business-domain-analyst · changelog-writer · codebase-domain-analyst · competitor-analyst · data-analyst · database-architect · deep-researcher · devops-engineer · freshness-auditor · frontend-architect · frontend-developer · frontend-domain-refactorer · java-backend-architect · java-backend-developer · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · pr-reviewer · product-planner · project-scaffolder · qa-engineer · security-auditor · skill-creator · skill-tester · spec-reviewer · typescript-backend-architect · typescript-backend-developer · ui-ux-designer
- **스킬** (5): characterization-testing · nexacro-17-xfdl-anatomy · react-spec-extraction · spec-extraction-method · spring-mybatis-spec-extraction

</details>

<details><summary>⬜ 꺼짐 212개</summary>

- **에이전트** (22): a11y-auditor · build-perf-benchmarker · content-quality-reviewer · dream-image-safety-classifier · dream-interpretation-prompt-tester · dream-journal-coach · dream-multi-perspective-synthesizer · dream-safety-classifier · fortune-interpretation-prompt-tester · game-asset-ai-director · game-design-document-writer · game-monetization-strategist · mobile-app-publisher · nutrition-prompt-tester · perf-report-writer · python-backend-architect · python-backend-developer · rust-backend-architect · rust-backend-developer · seo-auditor · unity-architect · unity-developer
- **스킬** (190): accessibility-vpat-writing · ag-grid · ai-game-asset-pipeline · animation · app-store-submission · attachment-theory-basics · aws-sdk-v1-s3-rekognition · aws-sdk-v2-s3-rekognition · axum · better-auth · bot-management-seo · bouncycastle-crypto · build-perf-benchmarking · bundle-size-analysis · bundling-compiler · chat-ui-pattern · claude-api-streaming-frontend · claude-code-headless · claude-code-hook-authoring · code-convention · content-eeat-quality · core-web-vitals-optimization · crisis-intervention-resources-korea · daily-fortune-retention-loop · ddd · design-token-scss · dev-server-hmr-benchmarking · docker-deployment · dream-app-ab-testing-prompts · dream-app-onboarding · dream-content-privacy-ethics · dream-content-research · dream-export-import · dream-image-generation · dream-interpretation-prompt-engineering · dream-journal-data-modeling · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-recurrence-detection · dream-safety-classifier-prompts · dream-sharing-anonymized · dream-statistics-visualization · dream-symbol-tagging · drizzle-neon-postgres · e2e-testing · ecommerce-seo · ehcache-2-legacy · emotion-tagging-input · font-optimization · form-handling · fortune-interpretation-prompt-engineering · frontend-domain-structure · game-audio-ai-tools · game-design-document · geo-ai-discoverability · github-actions · github-actions-visual-regression · global-exception-validation · google-indexing-api · hikaricp-tuning-oracle-mysql · hono-api-patterns · i18n-seo · ibatis-to-mybatis-migration · image-optimization-seo · incremental-refactoring · indexeddb-dexie · ingredient-management · jackson-time-migration · jasypt-encrypted-config · jwt-auth · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · local-business-seo · logback-mdc-tracing · lombok-mapstruct-modelmapper · meal-recommendation-prompt · media-recorder-api · mobile-seo-pwa · mobile-user-acquisition · module-boundaries · monorepo-turborepo · mui-v5 · mui-v9 · multilingual-content-strategy · multipart-upload · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · n8n-workflow-design · naver-seo-specifics · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · og-image-generation · palm-photo-capture-vision · palmistry-limitations · prisma-orm · project-structure · pwa-offline-llm-fallback · pwa-push-notifications · python-anthropic-sdk · python-async-asyncio · python-cli-typer · python-embeddings-vector-db · python-fastapi · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · python-pydantic-v2 · python-uv-project-setup · recoil-to-zustand-migration · redis-redisson-4 · redis-redisson-legacy · redis-redisson-modern · reqwest · rsbuild · saju-chart-visualization · saju-tarot-data-modeling · schema-org-patterns · search-console-webmaster · security-headers-seo · seo-monitoring-automation · seo-nextjs · seo-static-html · seo-vite-spa · site-migration-seo · spring-boot-1-to-2-migration · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · springdoc-openapi-3 · sqlx · srs-spaced-repetition · sse-streaming · state-management · storybook · storybook-visual-testing · structured-data-validation-api · swagger-springfox-2 · swiper · tanstack-query · tanstack-query-v4-to-v5-migration · tarot-card-deck-ui · tarot-history-symbolism · testing · testing-junit5-spring-boot · testing-rust · tower-http · tsup · typescript-v4 · typescript-v5 · unity-6-2d-fundamentals · unity-addressables · unity-cicd-codemagic · unity-firebase · unity-game-feel · unity-iap · unity-levelplay-ads · unity-live-ops · unity-mobile-optimization · unity-save-system · unity-ui-system · url-canonicalization-redirects · vercel-sandbox · vercel-workflow · vite-advanced-splitting · vite-pwa-service-worker · voice-input-ui · wcag-2.2-checklist · web-speech-api-stt · web-vitals-rum-comparison · webflux-webclient-in-sync-app · webpack-vite-config-mapping · whisper-api-integration · xapi-to-rest-migration · xss-lucy-jsoup · ymyl-content-seo · zod-schema-validation

</details>

### `n8n` — 애드온 · n8n

- 애드온 — 다른 프리셋에 더해 씀
- 켜는 블록: `n8n`
- 🔒 고정 35 · ✅ 켜짐 75 · ⬜ 꺼짐 211
- 기본과 비교: 새로 켜짐 5개 (스킬 5)

<details><summary>새로 켜지는 항목 5개</summary>

- **스킬**: n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · n8n-workflow-design

</details>

<details><summary>✅ 켜짐 75개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (13): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · relation-guard · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (11): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · java.md · memory-sync.md · readme-update.md · rust.md · typescript.md
- **커맨드** (11): agent-status · codex-review · commit · context-prime · create-plan · create-pr · fix-pr · sparc-refine · spec-extract · tdd-implement · update-docs
- **에이전트** (32): agent-creator · api-spec-designer · build-error-resolver · business-domain-analyst · changelog-writer · codebase-domain-analyst · competitor-analyst · data-analyst · database-architect · deep-researcher · devops-engineer · freshness-auditor · frontend-architect · frontend-developer · frontend-domain-refactorer · java-backend-architect · java-backend-developer · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · pr-reviewer · product-planner · project-scaffolder · qa-engineer · security-auditor · skill-creator · skill-tester · spec-reviewer · typescript-backend-architect · typescript-backend-developer · ui-ux-designer
- **스킬** (6): n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · n8n-workflow-design · spec-extraction-method

</details>

<details><summary>⬜ 꺼짐 211개</summary>

- **에이전트** (22): a11y-auditor · build-perf-benchmarker · content-quality-reviewer · dream-image-safety-classifier · dream-interpretation-prompt-tester · dream-journal-coach · dream-multi-perspective-synthesizer · dream-safety-classifier · fortune-interpretation-prompt-tester · game-asset-ai-director · game-design-document-writer · game-monetization-strategist · mobile-app-publisher · nutrition-prompt-tester · perf-report-writer · python-backend-architect · python-backend-developer · rust-backend-architect · rust-backend-developer · seo-auditor · unity-architect · unity-developer
- **스킬** (189): accessibility-vpat-writing · ag-grid · ai-game-asset-pipeline · animation · app-store-submission · attachment-theory-basics · aws-sdk-v1-s3-rekognition · aws-sdk-v2-s3-rekognition · axum · better-auth · bot-management-seo · bouncycastle-crypto · build-perf-benchmarking · bundle-size-analysis · bundling-compiler · characterization-testing · chat-ui-pattern · claude-api-streaming-frontend · claude-code-headless · claude-code-hook-authoring · code-convention · content-eeat-quality · core-web-vitals-optimization · crisis-intervention-resources-korea · daily-fortune-retention-loop · ddd · design-token-scss · dev-server-hmr-benchmarking · docker-deployment · dream-app-ab-testing-prompts · dream-app-onboarding · dream-content-privacy-ethics · dream-content-research · dream-export-import · dream-image-generation · dream-interpretation-prompt-engineering · dream-journal-data-modeling · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-recurrence-detection · dream-safety-classifier-prompts · dream-sharing-anonymized · dream-statistics-visualization · dream-symbol-tagging · drizzle-neon-postgres · e2e-testing · ecommerce-seo · ehcache-2-legacy · emotion-tagging-input · font-optimization · form-handling · fortune-interpretation-prompt-engineering · frontend-domain-structure · game-audio-ai-tools · game-design-document · geo-ai-discoverability · github-actions · github-actions-visual-regression · global-exception-validation · google-indexing-api · hikaricp-tuning-oracle-mysql · hono-api-patterns · i18n-seo · ibatis-to-mybatis-migration · image-optimization-seo · incremental-refactoring · indexeddb-dexie · ingredient-management · jackson-time-migration · jasypt-encrypted-config · jwt-auth · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · local-business-seo · logback-mdc-tracing · lombok-mapstruct-modelmapper · meal-recommendation-prompt · media-recorder-api · mobile-seo-pwa · mobile-user-acquisition · module-boundaries · monorepo-turborepo · mui-v5 · mui-v9 · multilingual-content-strategy · multipart-upload · mybatis-mapper-patterns · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · og-image-generation · palm-photo-capture-vision · palmistry-limitations · prisma-orm · project-structure · pwa-offline-llm-fallback · pwa-push-notifications · python-anthropic-sdk · python-async-asyncio · python-cli-typer · python-embeddings-vector-db · python-fastapi · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · python-pydantic-v2 · python-uv-project-setup · react-spec-extraction · recoil-to-zustand-migration · redis-redisson-4 · redis-redisson-legacy · redis-redisson-modern · reqwest · rsbuild · saju-chart-visualization · saju-tarot-data-modeling · schema-org-patterns · search-console-webmaster · security-headers-seo · seo-monitoring-automation · seo-nextjs · seo-static-html · seo-vite-spa · site-migration-seo · spring-boot-1-to-2-migration · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · springdoc-openapi-3 · sqlx · srs-spaced-repetition · sse-streaming · state-management · storybook · storybook-visual-testing · structured-data-validation-api · swagger-springfox-2 · swiper · tanstack-query · tanstack-query-v4-to-v5-migration · tarot-card-deck-ui · tarot-history-symbolism · testing · testing-junit5-spring-boot · testing-rust · tower-http · tsup · typescript-v4 · typescript-v5 · unity-6-2d-fundamentals · unity-addressables · unity-cicd-codemagic · unity-firebase · unity-game-feel · unity-iap · unity-levelplay-ads · unity-live-ops · unity-mobile-optimization · unity-save-system · unity-ui-system · url-canonicalization-redirects · vercel-sandbox · vercel-workflow · vite-advanced-splitting · vite-pwa-service-worker · voice-input-ui · wcag-2.2-checklist · web-speech-api-stt · web-vitals-rum-comparison · webflux-webclient-in-sync-app · webpack-vite-config-mapping · whisper-api-integration · xapi-to-rest-migration · xss-lucy-jsoup · ymyl-content-seo · zod-schema-validation

</details>
