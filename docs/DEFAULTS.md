<!-- 생성 파일 — 손으로 고치지 말고 node scripts/build-defaults-doc.js 로 다시 만든다 (재료: manifest.json) -->

# 기본값·고정 목록 — gugbab-claude

새 프로젝트에서 `gugbab-claude` 를 처음 열 때 무엇이 켜지고, 무엇이 고정(끌 수 없음)이며, 기본·프리셋마다 모든 항목이 🔒 고정·✅ 켜짐·⬜ 꺼짐 중 무엇인지 정리한 문서입니다.
기본값의 원본은 [항목 체크리스트](plans/2026-10-15-harness-item-checklist.md) 이고, 프로젝트마다 바꾸는 법은 세션 안 `/harness` — [사용 안내](USAGE.md) 를 보세요.

적용 순서: 🔒 고정 > 프로젝트 `.gugbab.json` > 이 프로젝트 설정 > 모든 프로젝트 설정 > 기본값 (이 문서)

## 요약

| 종류 | 🔒 고정 | ✅ 기본 켬 | ⬜ 기본 끔 | 합계 |
|---|---:|---:|---:|---:|
| 설정 | 5 | 2 | 0 | 7 |
| 훅 | 17 | 12 | 0 | 29 |
| 룰 | 3 | 8 | 3 | 14 |
| 커맨드 | 1 | 5 | 1 | 7 |
| 에이전트 | 1 | 1 | 8 | 10 |
| 스킬 | 0 | 0 | 90 | 90 |
| **합계** | **27** | **28** | **102** | **157** |

## 🔒 고정 — 27개

어느 프로젝트에서도 끌 수 없습니다. 고정 항목이 필요로 하는 것도 같이 고정됩니다.

- **설정** (5): 시작 권한 모드 `acceptEdits` · 위험 명령 차단 목록 (deny) · 임시 폴더 접근 허용 · 자동 허용 목록 (allow) · 전역 CLAUDE.md 공통 부분
- **훅** (17): auto-approve · auto-format · bash-guard · cc-notify · claude-version-check · config-change-audit · korean-response-guard · package-manager-guard · parry · progress-tracker · protect-secrets · release-version-guard · session-export · task-confirm-guard · typescript-quality · verification-guard · wrapper-version-check
- **룰** (3): info-verification.md · task-workflow.md · verification-policy.md
- **커맨드** (1): harness
- **에이전트** (1): fact-checker

## ✅ 기본으로 켜짐 — 28개

처음부터 켜져 있고, 프로젝트마다 끌 수 있습니다.

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (12): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (8): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · memory-sync.md · readme-update.md
- **커맨드** (5): agent-status · codex-review · commit · create-pr · fix-pr
- **에이전트** (1): skill-tester

## ⬜ 기본으로 꺼짐 — 102개

처음에는 꺼져 있습니다. 스택에 맞는 블록·프리셋을 켜면 들어옵니다.

<details><summary>개발 공통 — 꺼진 항목 3개</summary>

- **스킬**: claude-code-hook-authoring · incremental-refactoring · module-boundaries

</details>

<details><summary>프론트 핵심 — 꺼진 항목 7개</summary>

- **스킬**: ag-grid · frontend-domain-structure · monorepo-turborepo · nextjs · tanstack-query · typescript-v5 · vite-advanced-splitting

</details>

<details><summary>프론트 도구·품질 — 꺼진 항목 13개</summary>

- **스킬**: build-perf-benchmarking · code-convention · github-actions-visual-regression · lighthouse-ci-setup · mui-v5 · mui-v9 · next-intl-i18n · pwa-push-notifications · storybook · testing · wcag-2.2-checklist · web-vitals-rum-comparison · webpack-vite-config-mapping

</details>

<details><summary>TS 백엔드 — 꺼진 항목 4개</summary>

- **스킬**: better-auth · drizzle-neon-postgres · prisma-orm · zod-schema-validation

</details>

<details><summary>Java 공통 — 꺼진 항목 9개</summary>

- **스킬**: bouncycastle-crypto · hikaricp-tuning-oracle-mysql · jackson-time-migration · jasypt-encrypted-config · mybatis-mapper-patterns · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · webflux-webclient-in-sync-app · xss-lucy-jsoup

</details>

<details><summary>Java 레거시 (SB 2) — 꺼진 항목 6개</summary>

- **스킬**: aws-sdk-v1-s3-rekognition · ehcache-2-legacy · redis-redisson-legacy · spring-boot-2-to-3-migration · spring-security-5-jwt-jjwt10 · swagger-springfox-2

</details>

<details><summary>Java 모던 (SB 3) — 꺼진 항목 2개</summary>

- **스킬**: redis-redisson-4 · spring-security-6-jwt-jjwt12

</details>

<details><summary>Python — 꺼진 항목 3개</summary>

- **스킬**: python-korean-nlp-konlpy · python-langchain-current · python-llamaindex

</details>

<details><summary>SEO·GEO — 꺼진 항목 7개</summary>

- **스킬**: bot-management-seo · content-eeat-quality · geo-ai-discoverability · kakao-share-optimization · naver-seo-specifics · search-console-webmaster · seo-vite-spa

</details>

<details><summary>AI 앱 공통 — 꺼진 항목 2개</summary>

- **스킬**: srs-spaced-repetition · voice-input-ui

</details>

<details><summary>n8n — 꺼진 항목 4개</summary>

- **스킬**: n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns

</details>

<details><summary>꿈 도메인 — 꺼진 항목 10개</summary>

- **에이전트**: dream-interpretation-prompt-tester
- **스킬**: attachment-theory-basics · crisis-intervention-resources-korea · dream-content-privacy-ethics · dream-content-research · dream-interpretation-prompt-engineering · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-safety-classifier-prompts · korean-dream-interpretation-tradition

</details>

<details><summary>운세 도메인 — 꺼진 항목 5개</summary>

- **에이전트**: fortune-interpretation-prompt-tester
- **스킬**: fortune-interpretation-prompt-engineering · korean-lunar-calendar-manseryeok · korean-saju-tradition · saju-chart-visualization

</details>

<details><summary>건강 도메인 — 꺼진 항목 5개</summary>

- **에이전트**: nutrition-prompt-tester
- **스킬**: korean-food-nutrition · meal-recommendation-prompt · nutrition-analysis-prompt · nutrition-basics

</details>

<details><summary>스펙 추출 — 꺼진 항목 7개</summary>

- **에이전트**: legacy-spec-extractor · spec-reviewer
- **스킬**: characterization-testing · nexacro-17-xfdl-anatomy · react-spec-extraction · spec-extraction-method · spring-mybatis-spec-extraction

</details>

<details><summary>넥사크로 — 꺼진 항목 8개</summary>

- **에이전트**: migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter
- **스킬**: ibatis-to-mybatis-migration · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · xapi-to-rest-migration

</details>

<details><summary>기타 — 꺼진 항목 3개</summary>

- **스킬**: claude-code-headless · vercel-sandbox · vercel-workflow

</details>

- **룰** (3): java.md · rust.md · typescript.md
- **커맨드** (1): spec-extract

## 블록 구성

블록 = 한 스택의 스킬·에이전트·언어 룰 묶음. `/harness` 에서 블록을 켜고 끄면 안의 항목이 한 번에 바뀝니다.

| 블록 | 제목 | 항목 수 | 기본 켬 |
|---|---|---:|---:|
| `block:core` | 공통 에이전트 | 1 | 1 |
| `block:dev-common` | 개발 공통 | 3 | 0 |
| `block:frontend-core` | 프론트 핵심 | 8 | 0 |
| `block:frontend-tooling` | 프론트 도구·품질 | 13 | 0 |
| `block:ts-backend` | TS 백엔드 | 4 | 0 |
| `block:java-common` | Java 공통 | 10 | 0 |
| `block:java-legacy` | Java 레거시 (SB 2) | 6 | 0 |
| `block:java-modern` | Java 모던 (SB 3) | 2 | 0 |
| `block:rust` | Rust | 1 | 0 |
| `block:python` | Python | 3 | 0 |
| `block:seo-geo` | SEO·GEO | 7 | 0 |
| `block:ai-app` | AI 앱 공통 | 2 | 0 |
| `block:n8n` | n8n | 4 | 0 |
| `block:dream` | 꿈 도메인 | 10 | 0 |
| `block:fortune` | 운세 도메인 | 5 | 0 |
| `block:health` | 건강 도메인 | 5 | 0 |
| `block:spec-extraction` | 스펙 추출 | 8 | 0 |
| `block:nexacro` | 넥사크로 | 8 | 0 |
| `block:misc` | 기타 | 3 | 0 |
| `block:harness-authoring` | 하네스 제작 에이전트 | 1 | 1 |

## 묶음 구성

묶음 = 한 기능을 이루는 훅·룰·커맨드(·에이전트). 같이 켜고 끕니다.

| 묶음 | 제목 | 구성 |
|---|---|---|
| `bundle:task-confirm` | 작업 확인 절차 | task-confirm-guard · progress-tracker · task-workflow.md |
| `bundle:verification` | 스킬 검증 문서 | verification-guard · verification-policy.md |
| `bundle:dev-quality` | 테스트 품질 (TDD·적대적 테스트) | tdd-guard · adversarial-test-guard · fake-impl-guard · test-fake-guard · adversarial-testing.md |
| `bundle:codex-review` | Codex 리뷰 | codex-review-guard · codex-review.md · codex-review |
| `bundle:memory-share` | 메모리 공유 | memory-pull · memory-sync · memory-sync.md |
| `bundle:harness-authoring` | 하네스 제작 (스킬·에이전트 만들기) | skill-md-guard · agent-md-guard · deliverable-guard · staleness-check · agent-design.md · creation-workflow.md · readme-update.md · commands.md · agent-status · skill-tester |

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
| 기본 | 프리셋 없음 (처음 상태) | 27 | 28 | 102 | 7/7 | 29/29 | 11/14 | 6/7 | 2/10 | 0/90 |
| `nextjs` | React·Next.js (+TS 백엔드) | 27 | 56 | 74 | 7/7 | 29/29 | 12/14 | 6/7 | 2/10 | 27/90 |
| `java-legacy` | Java Spring 레거시 | 27 | 47 | 83 | 7/7 | 29/29 | 12/14 | 6/7 | 2/10 | 18/90 |
| `java-modern` | Java Spring 모던 | 27 | 43 | 87 | 7/7 | 29/29 | 12/14 | 6/7 | 2/10 | 14/90 |
| `rust` | Rust | 27 | 32 | 98 | 7/7 | 29/29 | 12/14 | 6/7 | 2/10 | 3/90 |
| `python` | Python LLM·한국어 NLP | 27 | 34 | 96 | 7/7 | 29/29 | 11/14 | 6/7 | 2/10 | 6/90 |
| `dream` | 꿈 해몽 앱 | 27 | 61 | 69 | 7/7 | 29/29 | 12/14 | 6/7 | 3/10 | 31/90 |
| `fortune` | 운세 앱 | 27 | 56 | 74 | 7/7 | 29/29 | 12/14 | 6/7 | 3/10 | 26/90 |
| `health` | 건강·식단 앱 | 27 | 56 | 74 | 7/7 | 29/29 | 12/14 | 6/7 | 3/10 | 26/90 |
| `nexacro` | 넥사크로 마이그레이션 (java-legacy·nextjs 와 조합) | 27 | 39 | 91 | 7/7 | 28/29 | 11/14 | 6/7 | 5/10 | 9/90 |
| `seo-geo` | 애드온 · SEO·GEO | 27 | 35 | 95 | 7/7 | 29/29 | 11/14 | 6/7 | 2/10 | 7/90 |
| `spec-extraction` | 애드온 · 레거시 스펙 추출 | 27 | 36 | 94 | 7/7 | 29/29 | 11/14 | 7/7 | 4/10 | 5/90 |
| `n8n` | 애드온 · n8n | 27 | 32 | 98 | 7/7 | 29/29 | 11/14 | 6/7 | 2/10 | 4/90 |

## 항목 × 프리셋 표

🔒 고정 · ✅ 켜짐 · ⬜ 꺼짐. 칸마다 기본값에 그 프리셋 하나만 적용한 상태입니다. 종류별로 펼쳐 보세요.

<details><summary>설정 — 7개</summary>

| 항목 | 기본 | `nextjs` | `java-legacy` | `java-modern` | `rust` | `python` | `dream` | `fortune` | `health` | `nexacro` | `seo-geo` | `spec-extraction` | `n8n` |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| superpowers 플러그인 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 상태줄 `statusline.sh` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 시작 권한 모드 `acceptEdits` | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| 위험 명령 차단 목록 (deny) | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| 임시 폴더 접근 허용 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| 자동 허용 목록 (allow) | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| 전역 CLAUDE.md 공통 부분 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |

</details>

<details><summary>훅 — 29개</summary>

| 항목 | 기본 | `nextjs` | `java-legacy` | `java-modern` | `rust` | `python` | `dream` | `fortune` | `health` | `nexacro` | `seo-geo` | `spec-extraction` | `n8n` |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| adversarial-test-guard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| agent-md-guard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| auto-approve | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| auto-format | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| bash-guard | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| branch-protection | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| cc-notify | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| claude-version-check | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| codex-review-guard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| config-change-audit | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| deliverable-guard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| fake-impl-guard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| korean-response-guard | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| memory-pull | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| memory-sync | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| package-manager-guard | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| parry | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| progress-tracker | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| protect-secrets | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| release-version-guard | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| session-export | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| skill-md-guard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| staleness-check | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| task-confirm-guard | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| tdd-guard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ | ✅ | ✅ | ✅ |
| test-fake-guard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| typescript-quality | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| verification-guard | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| wrapper-version-check | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |

</details>

<details><summary>룰 — 14개</summary>

| 항목 | 기본 | `nextjs` | `java-legacy` | `java-modern` | `rust` | `python` | `dream` | `fortune` | `health` | `nexacro` | `seo-geo` | `spec-extraction` | `n8n` |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| adversarial-testing.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| agent-design.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| codex-review.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| commands.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| creation-workflow.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| git.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| info-verification.md | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| java.md | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| memory-sync.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| readme-update.md | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| rust.md | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| task-workflow.md | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| typescript.md | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| verification-policy.md | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |

</details>

<details><summary>커맨드 — 7개</summary>

| 항목 | 기본 | `nextjs` | `java-legacy` | `java-modern` | `rust` | `python` | `dream` | `fortune` | `health` | `nexacro` | `seo-geo` | `spec-extraction` | `n8n` |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| agent-status | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| codex-review | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| commit | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| create-pr | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| fix-pr | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| harness | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| spec-extract | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ |

</details>

<details><summary>에이전트 — 10개</summary>

| 항목 | 블록 | 기본 | `nextjs` | `java-legacy` | `java-modern` | `rust` | `python` | `dream` | `fortune` | `health` | `nexacro` | `seo-geo` | `spec-extraction` | `n8n` |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| dream-interpretation-prompt-tester | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| fact-checker | 공통 에이전트 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| fortune-interpretation-prompt-tester | 운세 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| legacy-spec-extractor | 스펙 추출 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ |
| migration-parity-tester | 넥사크로 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| nexacro-screen-analyzer | 넥사크로 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| nexacro-screen-converter | 넥사크로 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| nutrition-prompt-tester | 건강 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| skill-tester | 하네스 제작 에이전트 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| spec-reviewer | 스펙 추출 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ |

</details>

<details><summary>스킬 — 90개</summary>

| 항목 | 블록 | 기본 | `nextjs` | `java-legacy` | `java-modern` | `rust` | `python` | `dream` | `fortune` | `health` | `nexacro` | `seo-geo` | `spec-extraction` | `n8n` |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| ag-grid | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| attachment-theory-basics | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| aws-sdk-v1-s3-rekognition | Java 레거시 (SB 2) | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| better-auth | TS 백엔드 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| bot-management-seo | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| bouncycastle-crypto | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| build-perf-benchmarking | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| characterization-testing | 스펙 추출 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ |
| claude-code-headless | 기타 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| claude-code-hook-authoring | 개발 공통 | ⬜ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| code-convention | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| content-eeat-quality | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| crisis-intervention-resources-korea | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-content-privacy-ethics | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-content-research | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-interpretation-prompt-engineering | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-privacy-consent-ui | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-psychology-jung-freud | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| dream-safety-classifier-prompts | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| drizzle-neon-postgres | TS 백엔드 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| ehcache-2-legacy | Java 레거시 (SB 2) | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| fortune-interpretation-prompt-engineering | 운세 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| frontend-domain-structure | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| geo-ai-discoverability | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| github-actions-visual-regression | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| hikaricp-tuning-oracle-mysql | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| ibatis-to-mybatis-migration | 넥사크로 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| incremental-refactoring | 개발 공통 | ⬜ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| jackson-time-migration | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| jasypt-encrypted-config | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| kakao-share-optimization | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| korean-dream-interpretation-tradition | 꿈 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| korean-food-nutrition | 건강 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| korean-lunar-calendar-manseryeok | 운세 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| korean-saju-tradition | 운세 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| lighthouse-ci-setup | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| meal-recommendation-prompt | 건강 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| module-boundaries | 개발 공통 | ⬜ | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| monorepo-turborepo | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| mui-v5 | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| mui-v9 | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| mybatis-mapper-patterns | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| n8n-error-handling | n8n | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ |
| n8n-llm-integration | n8n | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ |
| n8n-self-hosting | n8n | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ |
| n8n-webhook-patterns | n8n | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ |
| naver-seo-specifics | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| nexacro-17-xfdl-anatomy | 스펙 추출 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ✅ | ⬜ |
| nexacro-strangler-coexistence | 넥사크로 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| nexacro-to-react-mapping | 넥사크로 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| nexacro-xapi-server | 넥사크로 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| next-intl-i18n | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| nextjs | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| nutrition-analysis-prompt | 건강 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| nutrition-basics | 건강 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| prisma-orm | TS 백엔드 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| pwa-push-notifications | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| python-korean-nlp-konlpy | Python | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| python-langchain-current | Python | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| python-llamaindex | Python | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| react-spec-extraction | 스펙 추출 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ |
| redis-redisson-4 | Java 모던 (SB 3) | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| redis-redisson-legacy | Java 레거시 (SB 2) | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| saju-chart-visualization | 운세 도메인 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| search-console-webmaster | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| seo-vite-spa | SEO·GEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ |
| spec-extraction-method | 스펙 추출 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ |
| spring-boot-2-to-3-migration | Java 레거시 (SB 2) | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| spring-boot-gradle-setup | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| spring-multi-datasource-oracle-mysql | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| spring-mybatis-spec-extraction | 스펙 추출 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ |
| spring-security-5-jwt-jjwt10 | Java 레거시 (SB 2) | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| spring-security-6-jwt-jjwt12 | Java 모던 (SB 3) | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| srs-spaced-repetition | AI 앱 공통 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| storybook | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| swagger-springfox-2 | Java 레거시 (SB 2) | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| tanstack-query | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| testing | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| typescript-v5 | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| vercel-sandbox | 기타 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| vercel-workflow | 기타 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| vite-advanced-splitting | 프론트 핵심 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| voice-input-ui | AI 앱 공통 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| wcag-2.2-checklist | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| web-vitals-rum-comparison | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| webflux-webclient-in-sync-app | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| webpack-vite-config-mapping | 프론트 도구·품질 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| xapi-to-rest-migration | 넥사크로 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ | ⬜ | ⬜ | ⬜ |
| xss-lucy-jsoup | Java 공통 | ⬜ | ⬜ | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| zod-schema-validation | TS 백엔드 | ⬜ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

</details>

## 프리셋별 상세

🔒 고정 항목은 모든 프리셋에서 같습니다(위 "🔒 고정" 목록).

### 기본 — 프리셋 없음 (처음 상태)

- 🔒 고정 27 · ✅ 켜짐 28 · ⬜ 꺼짐 102

<details><summary>✅ 켜짐 28개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (12): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (8): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · memory-sync.md · readme-update.md
- **커맨드** (5): agent-status · codex-review · commit · create-pr · fix-pr
- **에이전트** (1): skill-tester

</details>

<details><summary>⬜ 꺼짐 102개</summary>

- **룰** (3): java.md · rust.md · typescript.md
- **커맨드** (1): spec-extract
- **에이전트** (8): dream-interpretation-prompt-tester · fortune-interpretation-prompt-tester · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · nutrition-prompt-tester · spec-reviewer
- **스킬** (90): ag-grid · attachment-theory-basics · aws-sdk-v1-s3-rekognition · better-auth · bot-management-seo · bouncycastle-crypto · build-perf-benchmarking · characterization-testing · claude-code-headless · claude-code-hook-authoring · code-convention · content-eeat-quality · crisis-intervention-resources-korea · dream-content-privacy-ethics · dream-content-research · dream-interpretation-prompt-engineering · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-safety-classifier-prompts · drizzle-neon-postgres · ehcache-2-legacy · fortune-interpretation-prompt-engineering · frontend-domain-structure · geo-ai-discoverability · github-actions-visual-regression · hikaricp-tuning-oracle-mysql · ibatis-to-mybatis-migration · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · meal-recommendation-prompt · module-boundaries · monorepo-turborepo · mui-v5 · mui-v9 · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · prisma-orm · pwa-push-notifications · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · react-spec-extraction · redis-redisson-4 · redis-redisson-legacy · saju-chart-visualization · search-console-webmaster · seo-vite-spa · spec-extraction-method · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · srs-spaced-repetition · storybook · swagger-springfox-2 · tanstack-query · testing · typescript-v5 · vercel-sandbox · vercel-workflow · vite-advanced-splitting · voice-input-ui · wcag-2.2-checklist · web-vitals-rum-comparison · webflux-webclient-in-sync-app · webpack-vite-config-mapping · xapi-to-rest-migration · xss-lucy-jsoup · zod-schema-validation

</details>

### `nextjs` — React·Next.js (+TS 백엔드)

- 켜는 블록: `dev-common` · `frontend-core` · `frontend-tooling` · `ts-backend`
- 🔒 고정 27 · ✅ 켜짐 56 · ⬜ 꺼짐 74
- 기본과 비교: 새로 켜짐 28개 (룰 1 · 스킬 27)

<details><summary>새로 켜지는 항목 28개</summary>

- **룰**: typescript.md
- **스킬**: ag-grid · better-auth · build-perf-benchmarking · claude-code-hook-authoring · code-convention · drizzle-neon-postgres · frontend-domain-structure · github-actions-visual-regression · incremental-refactoring · lighthouse-ci-setup · module-boundaries · monorepo-turborepo · mui-v5 · mui-v9 · next-intl-i18n · nextjs · prisma-orm · pwa-push-notifications · storybook · tanstack-query · testing · typescript-v5 · vite-advanced-splitting · wcag-2.2-checklist · web-vitals-rum-comparison · webpack-vite-config-mapping · zod-schema-validation

</details>

<details><summary>✅ 켜짐 56개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (12): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (9): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · memory-sync.md · readme-update.md · typescript.md
- **커맨드** (5): agent-status · codex-review · commit · create-pr · fix-pr
- **에이전트** (1): skill-tester
- **스킬** (27): ag-grid · better-auth · build-perf-benchmarking · claude-code-hook-authoring · code-convention · drizzle-neon-postgres · frontend-domain-structure · github-actions-visual-regression · incremental-refactoring · lighthouse-ci-setup · module-boundaries · monorepo-turborepo · mui-v5 · mui-v9 · next-intl-i18n · nextjs · prisma-orm · pwa-push-notifications · storybook · tanstack-query · testing · typescript-v5 · vite-advanced-splitting · wcag-2.2-checklist · web-vitals-rum-comparison · webpack-vite-config-mapping · zod-schema-validation

</details>

<details><summary>⬜ 꺼짐 74개</summary>

- **룰** (2): java.md · rust.md
- **커맨드** (1): spec-extract
- **에이전트** (8): dream-interpretation-prompt-tester · fortune-interpretation-prompt-tester · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · nutrition-prompt-tester · spec-reviewer
- **스킬** (63): attachment-theory-basics · aws-sdk-v1-s3-rekognition · bot-management-seo · bouncycastle-crypto · characterization-testing · claude-code-headless · content-eeat-quality · crisis-intervention-resources-korea · dream-content-privacy-ethics · dream-content-research · dream-interpretation-prompt-engineering · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-safety-classifier-prompts · ehcache-2-legacy · fortune-interpretation-prompt-engineering · geo-ai-discoverability · hikaricp-tuning-oracle-mysql · ibatis-to-mybatis-migration · jackson-time-migration · jasypt-encrypted-config · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · meal-recommendation-prompt · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · nutrition-analysis-prompt · nutrition-basics · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · react-spec-extraction · redis-redisson-4 · redis-redisson-legacy · saju-chart-visualization · search-console-webmaster · seo-vite-spa · spec-extraction-method · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · srs-spaced-repetition · swagger-springfox-2 · vercel-sandbox · vercel-workflow · voice-input-ui · webflux-webclient-in-sync-app · xapi-to-rest-migration · xss-lucy-jsoup

</details>

### `java-legacy` — Java Spring 레거시

- 켜는 블록: `dev-common` · `java-common` · `java-legacy`
- 🔒 고정 27 · ✅ 켜짐 47 · ⬜ 꺼짐 83
- 기본과 비교: 새로 켜짐 19개 (룰 1 · 스킬 18)

<details><summary>새로 켜지는 항목 19개</summary>

- **룰**: java.md
- **스킬**: aws-sdk-v1-s3-rekognition · bouncycastle-crypto · claude-code-hook-authoring · ehcache-2-legacy · hikaricp-tuning-oracle-mysql · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · module-boundaries · mybatis-mapper-patterns · redis-redisson-legacy · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-security-5-jwt-jjwt10 · swagger-springfox-2 · webflux-webclient-in-sync-app · xss-lucy-jsoup

</details>

<details><summary>✅ 켜짐 47개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (12): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (9): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · java.md · memory-sync.md · readme-update.md
- **커맨드** (5): agent-status · codex-review · commit · create-pr · fix-pr
- **에이전트** (1): skill-tester
- **스킬** (18): aws-sdk-v1-s3-rekognition · bouncycastle-crypto · claude-code-hook-authoring · ehcache-2-legacy · hikaricp-tuning-oracle-mysql · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · module-boundaries · mybatis-mapper-patterns · redis-redisson-legacy · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-security-5-jwt-jjwt10 · swagger-springfox-2 · webflux-webclient-in-sync-app · xss-lucy-jsoup

</details>

<details><summary>⬜ 꺼짐 83개</summary>

- **룰** (2): rust.md · typescript.md
- **커맨드** (1): spec-extract
- **에이전트** (8): dream-interpretation-prompt-tester · fortune-interpretation-prompt-tester · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · nutrition-prompt-tester · spec-reviewer
- **스킬** (72): ag-grid · attachment-theory-basics · better-auth · bot-management-seo · build-perf-benchmarking · characterization-testing · claude-code-headless · code-convention · content-eeat-quality · crisis-intervention-resources-korea · dream-content-privacy-ethics · dream-content-research · dream-interpretation-prompt-engineering · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-safety-classifier-prompts · drizzle-neon-postgres · fortune-interpretation-prompt-engineering · frontend-domain-structure · geo-ai-discoverability · github-actions-visual-regression · ibatis-to-mybatis-migration · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · meal-recommendation-prompt · monorepo-turborepo · mui-v5 · mui-v9 · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · prisma-orm · pwa-push-notifications · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · react-spec-extraction · redis-redisson-4 · saju-chart-visualization · search-console-webmaster · seo-vite-spa · spec-extraction-method · spring-mybatis-spec-extraction · spring-security-6-jwt-jjwt12 · srs-spaced-repetition · storybook · tanstack-query · testing · typescript-v5 · vercel-sandbox · vercel-workflow · vite-advanced-splitting · voice-input-ui · wcag-2.2-checklist · web-vitals-rum-comparison · webpack-vite-config-mapping · xapi-to-rest-migration · zod-schema-validation

</details>

### `java-modern` — Java Spring 모던

- 켜는 블록: `dev-common` · `java-common` · `java-modern`
- 🔒 고정 27 · ✅ 켜짐 43 · ⬜ 꺼짐 87
- 기본과 비교: 새로 켜짐 15개 (룰 1 · 스킬 14)

<details><summary>새로 켜지는 항목 15개</summary>

- **룰**: java.md
- **스킬**: bouncycastle-crypto · claude-code-hook-authoring · hikaricp-tuning-oracle-mysql · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · module-boundaries · mybatis-mapper-patterns · redis-redisson-4 · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-security-6-jwt-jjwt12 · webflux-webclient-in-sync-app · xss-lucy-jsoup

</details>

<details><summary>✅ 켜짐 43개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (12): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (9): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · java.md · memory-sync.md · readme-update.md
- **커맨드** (5): agent-status · codex-review · commit · create-pr · fix-pr
- **에이전트** (1): skill-tester
- **스킬** (14): bouncycastle-crypto · claude-code-hook-authoring · hikaricp-tuning-oracle-mysql · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · module-boundaries · mybatis-mapper-patterns · redis-redisson-4 · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-security-6-jwt-jjwt12 · webflux-webclient-in-sync-app · xss-lucy-jsoup

</details>

<details><summary>⬜ 꺼짐 87개</summary>

- **룰** (2): rust.md · typescript.md
- **커맨드** (1): spec-extract
- **에이전트** (8): dream-interpretation-prompt-tester · fortune-interpretation-prompt-tester · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · nutrition-prompt-tester · spec-reviewer
- **스킬** (76): ag-grid · attachment-theory-basics · aws-sdk-v1-s3-rekognition · better-auth · bot-management-seo · build-perf-benchmarking · characterization-testing · claude-code-headless · code-convention · content-eeat-quality · crisis-intervention-resources-korea · dream-content-privacy-ethics · dream-content-research · dream-interpretation-prompt-engineering · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-safety-classifier-prompts · drizzle-neon-postgres · ehcache-2-legacy · fortune-interpretation-prompt-engineering · frontend-domain-structure · geo-ai-discoverability · github-actions-visual-regression · ibatis-to-mybatis-migration · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · meal-recommendation-prompt · monorepo-turborepo · mui-v5 · mui-v9 · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · prisma-orm · pwa-push-notifications · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · react-spec-extraction · redis-redisson-legacy · saju-chart-visualization · search-console-webmaster · seo-vite-spa · spec-extraction-method · spring-boot-2-to-3-migration · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · srs-spaced-repetition · storybook · swagger-springfox-2 · tanstack-query · testing · typescript-v5 · vercel-sandbox · vercel-workflow · vite-advanced-splitting · voice-input-ui · wcag-2.2-checklist · web-vitals-rum-comparison · webpack-vite-config-mapping · xapi-to-rest-migration · zod-schema-validation

</details>

### `rust` — Rust

- 켜는 블록: `dev-common` · `rust`
- 🔒 고정 27 · ✅ 켜짐 32 · ⬜ 꺼짐 98
- 기본과 비교: 새로 켜짐 4개 (룰 1 · 스킬 3)

<details><summary>새로 켜지는 항목 4개</summary>

- **룰**: rust.md
- **스킬**: claude-code-hook-authoring · incremental-refactoring · module-boundaries

</details>

<details><summary>✅ 켜짐 32개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (12): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (9): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · memory-sync.md · readme-update.md · rust.md
- **커맨드** (5): agent-status · codex-review · commit · create-pr · fix-pr
- **에이전트** (1): skill-tester
- **스킬** (3): claude-code-hook-authoring · incremental-refactoring · module-boundaries

</details>

<details><summary>⬜ 꺼짐 98개</summary>

- **룰** (2): java.md · typescript.md
- **커맨드** (1): spec-extract
- **에이전트** (8): dream-interpretation-prompt-tester · fortune-interpretation-prompt-tester · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · nutrition-prompt-tester · spec-reviewer
- **스킬** (87): ag-grid · attachment-theory-basics · aws-sdk-v1-s3-rekognition · better-auth · bot-management-seo · bouncycastle-crypto · build-perf-benchmarking · characterization-testing · claude-code-headless · code-convention · content-eeat-quality · crisis-intervention-resources-korea · dream-content-privacy-ethics · dream-content-research · dream-interpretation-prompt-engineering · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-safety-classifier-prompts · drizzle-neon-postgres · ehcache-2-legacy · fortune-interpretation-prompt-engineering · frontend-domain-structure · geo-ai-discoverability · github-actions-visual-regression · hikaricp-tuning-oracle-mysql · ibatis-to-mybatis-migration · jackson-time-migration · jasypt-encrypted-config · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · meal-recommendation-prompt · monorepo-turborepo · mui-v5 · mui-v9 · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · prisma-orm · pwa-push-notifications · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · react-spec-extraction · redis-redisson-4 · redis-redisson-legacy · saju-chart-visualization · search-console-webmaster · seo-vite-spa · spec-extraction-method · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · srs-spaced-repetition · storybook · swagger-springfox-2 · tanstack-query · testing · typescript-v5 · vercel-sandbox · vercel-workflow · vite-advanced-splitting · voice-input-ui · wcag-2.2-checklist · web-vitals-rum-comparison · webflux-webclient-in-sync-app · webpack-vite-config-mapping · xapi-to-rest-migration · xss-lucy-jsoup · zod-schema-validation

</details>

### `python` — Python LLM·한국어 NLP

- 켜는 블록: `dev-common` · `python`
- 🔒 고정 27 · ✅ 켜짐 34 · ⬜ 꺼짐 96
- 기본과 비교: 새로 켜짐 6개 (스킬 6)

<details><summary>새로 켜지는 항목 6개</summary>

- **스킬**: claude-code-hook-authoring · incremental-refactoring · module-boundaries · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex

</details>

<details><summary>✅ 켜짐 34개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (12): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (8): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · memory-sync.md · readme-update.md
- **커맨드** (5): agent-status · codex-review · commit · create-pr · fix-pr
- **에이전트** (1): skill-tester
- **스킬** (6): claude-code-hook-authoring · incremental-refactoring · module-boundaries · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex

</details>

<details><summary>⬜ 꺼짐 96개</summary>

- **룰** (3): java.md · rust.md · typescript.md
- **커맨드** (1): spec-extract
- **에이전트** (8): dream-interpretation-prompt-tester · fortune-interpretation-prompt-tester · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · nutrition-prompt-tester · spec-reviewer
- **스킬** (84): ag-grid · attachment-theory-basics · aws-sdk-v1-s3-rekognition · better-auth · bot-management-seo · bouncycastle-crypto · build-perf-benchmarking · characterization-testing · claude-code-headless · code-convention · content-eeat-quality · crisis-intervention-resources-korea · dream-content-privacy-ethics · dream-content-research · dream-interpretation-prompt-engineering · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-safety-classifier-prompts · drizzle-neon-postgres · ehcache-2-legacy · fortune-interpretation-prompt-engineering · frontend-domain-structure · geo-ai-discoverability · github-actions-visual-regression · hikaricp-tuning-oracle-mysql · ibatis-to-mybatis-migration · jackson-time-migration · jasypt-encrypted-config · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · meal-recommendation-prompt · monorepo-turborepo · mui-v5 · mui-v9 · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · prisma-orm · pwa-push-notifications · react-spec-extraction · redis-redisson-4 · redis-redisson-legacy · saju-chart-visualization · search-console-webmaster · seo-vite-spa · spec-extraction-method · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · srs-spaced-repetition · storybook · swagger-springfox-2 · tanstack-query · testing · typescript-v5 · vercel-sandbox · vercel-workflow · vite-advanced-splitting · voice-input-ui · wcag-2.2-checklist · web-vitals-rum-comparison · webflux-webclient-in-sync-app · webpack-vite-config-mapping · xapi-to-rest-migration · xss-lucy-jsoup · zod-schema-validation

</details>

### `dream` — 꿈 해몽 앱

- 켜는 블록: `frontend-core` · `frontend-tooling` · `ai-app` · `dream`
- 🔒 고정 27 · ✅ 켜짐 61 · ⬜ 꺼짐 69
- 기본과 비교: 새로 켜짐 33개 (룰 1 · 에이전트 1 · 스킬 31)

<details><summary>새로 켜지는 항목 33개</summary>

- **룰**: typescript.md
- **에이전트**: dream-interpretation-prompt-tester
- **스킬**: ag-grid · attachment-theory-basics · build-perf-benchmarking · code-convention · crisis-intervention-resources-korea · dream-content-privacy-ethics · dream-content-research · dream-interpretation-prompt-engineering · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-safety-classifier-prompts · frontend-domain-structure · github-actions-visual-regression · korean-dream-interpretation-tradition · lighthouse-ci-setup · monorepo-turborepo · mui-v5 · mui-v9 · next-intl-i18n · nextjs · pwa-push-notifications · srs-spaced-repetition · storybook · tanstack-query · testing · typescript-v5 · vite-advanced-splitting · voice-input-ui · wcag-2.2-checklist · web-vitals-rum-comparison · webpack-vite-config-mapping

</details>

<details><summary>✅ 켜짐 61개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (12): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (9): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · memory-sync.md · readme-update.md · typescript.md
- **커맨드** (5): agent-status · codex-review · commit · create-pr · fix-pr
- **에이전트** (2): dream-interpretation-prompt-tester · skill-tester
- **스킬** (31): ag-grid · attachment-theory-basics · build-perf-benchmarking · code-convention · crisis-intervention-resources-korea · dream-content-privacy-ethics · dream-content-research · dream-interpretation-prompt-engineering · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-safety-classifier-prompts · frontend-domain-structure · github-actions-visual-regression · korean-dream-interpretation-tradition · lighthouse-ci-setup · monorepo-turborepo · mui-v5 · mui-v9 · next-intl-i18n · nextjs · pwa-push-notifications · srs-spaced-repetition · storybook · tanstack-query · testing · typescript-v5 · vite-advanced-splitting · voice-input-ui · wcag-2.2-checklist · web-vitals-rum-comparison · webpack-vite-config-mapping

</details>

<details><summary>⬜ 꺼짐 69개</summary>

- **룰** (2): java.md · rust.md
- **커맨드** (1): spec-extract
- **에이전트** (7): fortune-interpretation-prompt-tester · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · nutrition-prompt-tester · spec-reviewer
- **스킬** (59): aws-sdk-v1-s3-rekognition · better-auth · bot-management-seo · bouncycastle-crypto · characterization-testing · claude-code-headless · claude-code-hook-authoring · content-eeat-quality · drizzle-neon-postgres · ehcache-2-legacy · fortune-interpretation-prompt-engineering · geo-ai-discoverability · hikaricp-tuning-oracle-mysql · ibatis-to-mybatis-migration · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · kakao-share-optimization · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · meal-recommendation-prompt · module-boundaries · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · nutrition-analysis-prompt · nutrition-basics · prisma-orm · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · react-spec-extraction · redis-redisson-4 · redis-redisson-legacy · saju-chart-visualization · search-console-webmaster · seo-vite-spa · spec-extraction-method · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · swagger-springfox-2 · vercel-sandbox · vercel-workflow · webflux-webclient-in-sync-app · xapi-to-rest-migration · xss-lucy-jsoup · zod-schema-validation

</details>

### `fortune` — 운세 앱

- 켜는 블록: `frontend-core` · `frontend-tooling` · `ai-app` · `fortune`
- 🔒 고정 27 · ✅ 켜짐 56 · ⬜ 꺼짐 74
- 기본과 비교: 새로 켜짐 28개 (룰 1 · 에이전트 1 · 스킬 26)

<details><summary>새로 켜지는 항목 28개</summary>

- **룰**: typescript.md
- **에이전트**: fortune-interpretation-prompt-tester
- **스킬**: ag-grid · build-perf-benchmarking · code-convention · fortune-interpretation-prompt-engineering · frontend-domain-structure · github-actions-visual-regression · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · monorepo-turborepo · mui-v5 · mui-v9 · next-intl-i18n · nextjs · pwa-push-notifications · saju-chart-visualization · srs-spaced-repetition · storybook · tanstack-query · testing · typescript-v5 · vite-advanced-splitting · voice-input-ui · wcag-2.2-checklist · web-vitals-rum-comparison · webpack-vite-config-mapping

</details>

<details><summary>✅ 켜짐 56개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (12): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (9): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · memory-sync.md · readme-update.md · typescript.md
- **커맨드** (5): agent-status · codex-review · commit · create-pr · fix-pr
- **에이전트** (2): fortune-interpretation-prompt-tester · skill-tester
- **스킬** (26): ag-grid · build-perf-benchmarking · code-convention · fortune-interpretation-prompt-engineering · frontend-domain-structure · github-actions-visual-regression · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · monorepo-turborepo · mui-v5 · mui-v9 · next-intl-i18n · nextjs · pwa-push-notifications · saju-chart-visualization · srs-spaced-repetition · storybook · tanstack-query · testing · typescript-v5 · vite-advanced-splitting · voice-input-ui · wcag-2.2-checklist · web-vitals-rum-comparison · webpack-vite-config-mapping

</details>

<details><summary>⬜ 꺼짐 74개</summary>

- **룰** (2): java.md · rust.md
- **커맨드** (1): spec-extract
- **에이전트** (7): dream-interpretation-prompt-tester · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · nutrition-prompt-tester · spec-reviewer
- **스킬** (64): attachment-theory-basics · aws-sdk-v1-s3-rekognition · better-auth · bot-management-seo · bouncycastle-crypto · characterization-testing · claude-code-headless · claude-code-hook-authoring · content-eeat-quality · crisis-intervention-resources-korea · dream-content-privacy-ethics · dream-content-research · dream-interpretation-prompt-engineering · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-safety-classifier-prompts · drizzle-neon-postgres · ehcache-2-legacy · geo-ai-discoverability · hikaricp-tuning-oracle-mysql · ibatis-to-mybatis-migration · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · meal-recommendation-prompt · module-boundaries · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · nutrition-analysis-prompt · nutrition-basics · prisma-orm · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · react-spec-extraction · redis-redisson-4 · redis-redisson-legacy · search-console-webmaster · seo-vite-spa · spec-extraction-method · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · swagger-springfox-2 · vercel-sandbox · vercel-workflow · webflux-webclient-in-sync-app · xapi-to-rest-migration · xss-lucy-jsoup · zod-schema-validation

</details>

### `health` — 건강·식단 앱

- 켜는 블록: `frontend-core` · `frontend-tooling` · `ai-app` · `health`
- 🔒 고정 27 · ✅ 켜짐 56 · ⬜ 꺼짐 74
- 기본과 비교: 새로 켜짐 28개 (룰 1 · 에이전트 1 · 스킬 26)

<details><summary>새로 켜지는 항목 28개</summary>

- **룰**: typescript.md
- **에이전트**: nutrition-prompt-tester
- **스킬**: ag-grid · build-perf-benchmarking · code-convention · frontend-domain-structure · github-actions-visual-regression · korean-food-nutrition · lighthouse-ci-setup · meal-recommendation-prompt · monorepo-turborepo · mui-v5 · mui-v9 · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · pwa-push-notifications · srs-spaced-repetition · storybook · tanstack-query · testing · typescript-v5 · vite-advanced-splitting · voice-input-ui · wcag-2.2-checklist · web-vitals-rum-comparison · webpack-vite-config-mapping

</details>

<details><summary>✅ 켜짐 56개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (12): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (9): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · memory-sync.md · readme-update.md · typescript.md
- **커맨드** (5): agent-status · codex-review · commit · create-pr · fix-pr
- **에이전트** (2): nutrition-prompt-tester · skill-tester
- **스킬** (26): ag-grid · build-perf-benchmarking · code-convention · frontend-domain-structure · github-actions-visual-regression · korean-food-nutrition · lighthouse-ci-setup · meal-recommendation-prompt · monorepo-turborepo · mui-v5 · mui-v9 · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · pwa-push-notifications · srs-spaced-repetition · storybook · tanstack-query · testing · typescript-v5 · vite-advanced-splitting · voice-input-ui · wcag-2.2-checklist · web-vitals-rum-comparison · webpack-vite-config-mapping

</details>

<details><summary>⬜ 꺼짐 74개</summary>

- **룰** (2): java.md · rust.md
- **커맨드** (1): spec-extract
- **에이전트** (7): dream-interpretation-prompt-tester · fortune-interpretation-prompt-tester · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · spec-reviewer
- **스킬** (64): attachment-theory-basics · aws-sdk-v1-s3-rekognition · better-auth · bot-management-seo · bouncycastle-crypto · characterization-testing · claude-code-headless · claude-code-hook-authoring · content-eeat-quality · crisis-intervention-resources-korea · dream-content-privacy-ethics · dream-content-research · dream-interpretation-prompt-engineering · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-safety-classifier-prompts · drizzle-neon-postgres · ehcache-2-legacy · fortune-interpretation-prompt-engineering · geo-ai-discoverability · hikaricp-tuning-oracle-mysql · ibatis-to-mybatis-migration · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · kakao-share-optimization · korean-dream-interpretation-tradition · korean-lunar-calendar-manseryeok · korean-saju-tradition · module-boundaries · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · prisma-orm · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · react-spec-extraction · redis-redisson-4 · redis-redisson-legacy · saju-chart-visualization · search-console-webmaster · seo-vite-spa · spec-extraction-method · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · swagger-springfox-2 · vercel-sandbox · vercel-workflow · webflux-webclient-in-sync-app · xapi-to-rest-migration · xss-lucy-jsoup · zod-schema-validation

</details>

### `nexacro` — 넥사크로 마이그레이션 (java-legacy·nextjs 와 조합)

- 켜는 블록: `dev-common` · `nexacro`
- 🔒 고정 27 · ✅ 켜짐 39 · ⬜ 꺼짐 91
- 기본과 비교: 새로 켜짐 12개 (에이전트 3 · 스킬 9) · 충돌로 꺼짐 1개: tdd-guard

<details><summary>새로 켜지는 항목 12개</summary>

- **에이전트**: migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter
- **스킬**: claude-code-hook-authoring · ibatis-to-mybatis-migration · incremental-refactoring · module-boundaries · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · xapi-to-rest-migration

</details>

<details><summary>✅ 켜짐 39개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (11): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · skill-md-guard · staleness-check · test-fake-guard
- **룰** (8): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · memory-sync.md · readme-update.md
- **커맨드** (5): agent-status · codex-review · commit · create-pr · fix-pr
- **에이전트** (4): migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · skill-tester
- **스킬** (9): claude-code-hook-authoring · ibatis-to-mybatis-migration · incremental-refactoring · module-boundaries · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · xapi-to-rest-migration

</details>

<details><summary>⬜ 꺼짐 91개</summary>

- **훅** (1): tdd-guard
- **룰** (3): java.md · rust.md · typescript.md
- **커맨드** (1): spec-extract
- **에이전트** (5): dream-interpretation-prompt-tester · fortune-interpretation-prompt-tester · legacy-spec-extractor · nutrition-prompt-tester · spec-reviewer
- **스킬** (81): ag-grid · attachment-theory-basics · aws-sdk-v1-s3-rekognition · better-auth · bot-management-seo · bouncycastle-crypto · build-perf-benchmarking · characterization-testing · claude-code-headless · code-convention · content-eeat-quality · crisis-intervention-resources-korea · dream-content-privacy-ethics · dream-content-research · dream-interpretation-prompt-engineering · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-safety-classifier-prompts · drizzle-neon-postgres · ehcache-2-legacy · fortune-interpretation-prompt-engineering · frontend-domain-structure · geo-ai-discoverability · github-actions-visual-regression · hikaricp-tuning-oracle-mysql · jackson-time-migration · jasypt-encrypted-config · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · meal-recommendation-prompt · monorepo-turborepo · mui-v5 · mui-v9 · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · naver-seo-specifics · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · prisma-orm · pwa-push-notifications · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · react-spec-extraction · redis-redisson-4 · redis-redisson-legacy · saju-chart-visualization · search-console-webmaster · seo-vite-spa · spec-extraction-method · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · srs-spaced-repetition · storybook · swagger-springfox-2 · tanstack-query · testing · typescript-v5 · vercel-sandbox · vercel-workflow · vite-advanced-splitting · voice-input-ui · wcag-2.2-checklist · web-vitals-rum-comparison · webflux-webclient-in-sync-app · webpack-vite-config-mapping · xss-lucy-jsoup · zod-schema-validation

</details>

### `seo-geo` — 애드온 · SEO·GEO

- 애드온 — 다른 프리셋에 더해 씀
- 켜는 블록: `seo-geo`
- 🔒 고정 27 · ✅ 켜짐 35 · ⬜ 꺼짐 95
- 기본과 비교: 새로 켜짐 7개 (스킬 7)

<details><summary>새로 켜지는 항목 7개</summary>

- **스킬**: bot-management-seo · content-eeat-quality · geo-ai-discoverability · kakao-share-optimization · naver-seo-specifics · search-console-webmaster · seo-vite-spa

</details>

<details><summary>✅ 켜짐 35개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (12): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (8): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · memory-sync.md · readme-update.md
- **커맨드** (5): agent-status · codex-review · commit · create-pr · fix-pr
- **에이전트** (1): skill-tester
- **스킬** (7): bot-management-seo · content-eeat-quality · geo-ai-discoverability · kakao-share-optimization · naver-seo-specifics · search-console-webmaster · seo-vite-spa

</details>

<details><summary>⬜ 꺼짐 95개</summary>

- **룰** (3): java.md · rust.md · typescript.md
- **커맨드** (1): spec-extract
- **에이전트** (8): dream-interpretation-prompt-tester · fortune-interpretation-prompt-tester · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · nutrition-prompt-tester · spec-reviewer
- **스킬** (83): ag-grid · attachment-theory-basics · aws-sdk-v1-s3-rekognition · better-auth · bouncycastle-crypto · build-perf-benchmarking · characterization-testing · claude-code-headless · claude-code-hook-authoring · code-convention · crisis-intervention-resources-korea · dream-content-privacy-ethics · dream-content-research · dream-interpretation-prompt-engineering · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-safety-classifier-prompts · drizzle-neon-postgres · ehcache-2-legacy · fortune-interpretation-prompt-engineering · frontend-domain-structure · github-actions-visual-regression · hikaricp-tuning-oracle-mysql · ibatis-to-mybatis-migration · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · meal-recommendation-prompt · module-boundaries · monorepo-turborepo · mui-v5 · mui-v9 · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · prisma-orm · pwa-push-notifications · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · react-spec-extraction · redis-redisson-4 · redis-redisson-legacy · saju-chart-visualization · spec-extraction-method · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · srs-spaced-repetition · storybook · swagger-springfox-2 · tanstack-query · testing · typescript-v5 · vercel-sandbox · vercel-workflow · vite-advanced-splitting · voice-input-ui · wcag-2.2-checklist · web-vitals-rum-comparison · webflux-webclient-in-sync-app · webpack-vite-config-mapping · xapi-to-rest-migration · xss-lucy-jsoup · zod-schema-validation

</details>

### `spec-extraction` — 애드온 · 레거시 스펙 추출

- 애드온 — 다른 프리셋에 더해 씀
- 켜는 블록: `spec-extraction`
- 🔒 고정 27 · ✅ 켜짐 36 · ⬜ 꺼짐 94
- 기본과 비교: 새로 켜짐 8개 (커맨드 1 · 에이전트 2 · 스킬 5)

<details><summary>새로 켜지는 항목 8개</summary>

- **커맨드**: spec-extract
- **에이전트**: legacy-spec-extractor · spec-reviewer
- **스킬**: characterization-testing · nexacro-17-xfdl-anatomy · react-spec-extraction · spec-extraction-method · spring-mybatis-spec-extraction

</details>

<details><summary>✅ 켜짐 36개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (12): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (8): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · memory-sync.md · readme-update.md
- **커맨드** (6): agent-status · codex-review · commit · create-pr · fix-pr · spec-extract
- **에이전트** (3): legacy-spec-extractor · skill-tester · spec-reviewer
- **스킬** (5): characterization-testing · nexacro-17-xfdl-anatomy · react-spec-extraction · spec-extraction-method · spring-mybatis-spec-extraction

</details>

<details><summary>⬜ 꺼짐 94개</summary>

- **룰** (3): java.md · rust.md · typescript.md
- **에이전트** (6): dream-interpretation-prompt-tester · fortune-interpretation-prompt-tester · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · nutrition-prompt-tester
- **스킬** (85): ag-grid · attachment-theory-basics · aws-sdk-v1-s3-rekognition · better-auth · bot-management-seo · bouncycastle-crypto · build-perf-benchmarking · claude-code-headless · claude-code-hook-authoring · code-convention · content-eeat-quality · crisis-intervention-resources-korea · dream-content-privacy-ethics · dream-content-research · dream-interpretation-prompt-engineering · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-safety-classifier-prompts · drizzle-neon-postgres · ehcache-2-legacy · fortune-interpretation-prompt-engineering · frontend-domain-structure · geo-ai-discoverability · github-actions-visual-regression · hikaricp-tuning-oracle-mysql · ibatis-to-mybatis-migration · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · meal-recommendation-prompt · module-boundaries · monorepo-turborepo · mui-v5 · mui-v9 · mybatis-mapper-patterns · n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns · naver-seo-specifics · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · prisma-orm · pwa-push-notifications · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · redis-redisson-4 · redis-redisson-legacy · saju-chart-visualization · search-console-webmaster · seo-vite-spa · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · srs-spaced-repetition · storybook · swagger-springfox-2 · tanstack-query · testing · typescript-v5 · vercel-sandbox · vercel-workflow · vite-advanced-splitting · voice-input-ui · wcag-2.2-checklist · web-vitals-rum-comparison · webflux-webclient-in-sync-app · webpack-vite-config-mapping · xapi-to-rest-migration · xss-lucy-jsoup · zod-schema-validation

</details>

### `n8n` — 애드온 · n8n

- 애드온 — 다른 프리셋에 더해 씀
- 켜는 블록: `n8n`
- 🔒 고정 27 · ✅ 켜짐 32 · ⬜ 꺼짐 98
- 기본과 비교: 새로 켜짐 4개 (스킬 4)

<details><summary>새로 켜지는 항목 4개</summary>

- **스킬**: n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns

</details>

<details><summary>✅ 켜짐 32개 (🔒 고정 제외)</summary>

- **설정** (2): superpowers 플러그인 · 상태줄 `statusline.sh`
- **훅** (12): adversarial-test-guard · agent-md-guard · branch-protection · codex-review-guard · deliverable-guard · fake-impl-guard · memory-pull · memory-sync · skill-md-guard · staleness-check · tdd-guard · test-fake-guard
- **룰** (8): adversarial-testing.md · agent-design.md · codex-review.md · commands.md · creation-workflow.md · git.md · memory-sync.md · readme-update.md
- **커맨드** (5): agent-status · codex-review · commit · create-pr · fix-pr
- **에이전트** (1): skill-tester
- **스킬** (4): n8n-error-handling · n8n-llm-integration · n8n-self-hosting · n8n-webhook-patterns

</details>

<details><summary>⬜ 꺼짐 98개</summary>

- **룰** (3): java.md · rust.md · typescript.md
- **커맨드** (1): spec-extract
- **에이전트** (8): dream-interpretation-prompt-tester · fortune-interpretation-prompt-tester · legacy-spec-extractor · migration-parity-tester · nexacro-screen-analyzer · nexacro-screen-converter · nutrition-prompt-tester · spec-reviewer
- **스킬** (86): ag-grid · attachment-theory-basics · aws-sdk-v1-s3-rekognition · better-auth · bot-management-seo · bouncycastle-crypto · build-perf-benchmarking · characterization-testing · claude-code-headless · claude-code-hook-authoring · code-convention · content-eeat-quality · crisis-intervention-resources-korea · dream-content-privacy-ethics · dream-content-research · dream-interpretation-prompt-engineering · dream-privacy-consent-ui · dream-psychology-jung-freud · dream-safety-classifier-prompts · drizzle-neon-postgres · ehcache-2-legacy · fortune-interpretation-prompt-engineering · frontend-domain-structure · geo-ai-discoverability · github-actions-visual-regression · hikaricp-tuning-oracle-mysql · ibatis-to-mybatis-migration · incremental-refactoring · jackson-time-migration · jasypt-encrypted-config · kakao-share-optimization · korean-dream-interpretation-tradition · korean-food-nutrition · korean-lunar-calendar-manseryeok · korean-saju-tradition · lighthouse-ci-setup · meal-recommendation-prompt · module-boundaries · monorepo-turborepo · mui-v5 · mui-v9 · mybatis-mapper-patterns · naver-seo-specifics · nexacro-17-xfdl-anatomy · nexacro-strangler-coexistence · nexacro-to-react-mapping · nexacro-xapi-server · next-intl-i18n · nextjs · nutrition-analysis-prompt · nutrition-basics · prisma-orm · pwa-push-notifications · python-korean-nlp-konlpy · python-langchain-current · python-llamaindex · react-spec-extraction · redis-redisson-4 · redis-redisson-legacy · saju-chart-visualization · search-console-webmaster · seo-vite-spa · spec-extraction-method · spring-boot-2-to-3-migration · spring-boot-gradle-setup · spring-multi-datasource-oracle-mysql · spring-mybatis-spec-extraction · spring-security-5-jwt-jjwt10 · spring-security-6-jwt-jjwt12 · srs-spaced-repetition · storybook · swagger-springfox-2 · tanstack-query · testing · typescript-v5 · vercel-sandbox · vercel-workflow · vite-advanced-splitting · voice-input-ui · wcag-2.2-checklist · web-vitals-rum-comparison · webflux-webclient-in-sync-app · webpack-vite-config-mapping · xapi-to-rest-migration · xss-lucy-jsoup · zod-schema-validation

</details>
