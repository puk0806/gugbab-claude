# 템플릿: health (10)

건강·식단 PWA 앱. 영양 계산(KDRIs 2020) · 식재료 관리 · Claude AI 식단 추천.
백엔드 없음 — IndexedDB(Dexie.js) 로컬 저장 전용.

```
./project-install.sh  →  번호 입력: 10  (또는 복수: react-spa,health)
```

---

## 에이전트 (31종 — 작성 도구 y 시 34종)

| 카테고리 | 에이전트 | 설명 |
|----------|---------|------|
| meta | [freshness-auditor](../../.claude/agents/meta/freshness-auditor.md) | 에이전트·스킬 최신화 필요 항목 감사 |
| meta | [claude-code-guide](../../.claude/agents/meta/claude-code-guide.md) | Claude Code CLI 사용법·설정 가이드 |
| meta | [tech-stack-advisor](../../.claude/agents/meta/tech-stack-advisor.md) | 요구사항에 맞는 기술 스택 추천·비교 |
| meta | [project-scaffolder](../../.claude/agents/meta/project-scaffolder.md) | 결정된 스택으로 프로젝트 부트스트랩 |
| meta | [changelog-writer](../../.claude/agents/meta/changelog-writer.md) | git log → CHANGELOG.md 자동 작성 |
| frontend | [frontend-developer](../../.claude/agents/frontend/frontend-developer.md) | React/Next.js 컴포넌트·훅·API 연동 구현 |
| frontend | [frontend-architect](../../.claude/agents/frontend/frontend-architect.md) | 프론트엔드 아키텍처 설계·기술 판단 |
| backend | [build-error-resolver](../../.claude/agents/backend/build-error-resolver.md) | tsc·Vite/webpack 빌드·타입 에러 진단·최소 수정 (리팩터링 중 import 깨짐 대응) |
| backend | [typescript-backend-developer](../../.claude/agents/backend/typescript-backend-developer.md) | Node/TS 백엔드 구현 (Hono·Zod·Prisma/Drizzle) — 2026-09-25 신설, health 소유 |
| backend | [typescript-backend-architect](../../.claude/agents/backend/typescript-backend-architect.md) | Node/TS 백엔드 아키텍처 설계 |
| domain | [business-domain-analyst](../../.claude/agents/domain/business-domain-analyst.md) | 비즈니스 요구사항 → DDD 도메인 모델 도출 |
| domain | [codebase-domain-analyst](../../.claude/agents/domain/codebase-domain-analyst.md) | 코드베이스 역분석 → 도메인 구조 진단 |
| domain | [frontend-domain-refactorer](../../.claude/agents/domain/frontend-domain-refactorer.md) | layer-first → domain-first 재구조화 실행 계획 (경계 역추출·배치·codemod·경계 규칙) |
| domain | [product-planner](../../.claude/agents/domain/product-planner.md) | 아이디어·요구사항 → PRD 작성 |
| domain | [ui-ux-designer](../../.claude/agents/domain/ui-ux-designer.md) | PRD → 와이어프레임·디자인 토큰·컴포넌트 스펙 |
| domain | [api-spec-designer](../../.claude/agents/domain/api-spec-designer.md) | PRD → OpenAPI 3.1 스펙·에러 코드 설계 |
| devops | [devops-engineer](../../.claude/agents/devops/devops-engineer.md) | Dockerfile·GitHub Actions·Vercel 배포 설정 |
| research | [deep-researcher](../../.claude/agents/research/deep-researcher.md) | 논문/오픈소스/기업 사례 3축 딥 리서치 |
| research | [web-searcher](../../.claude/agents/research/web-searcher.md) | 검색 축별 소스 탐색 전담 |
| research | [research-reviewer](../../.claude/agents/research/research-reviewer.md) | 리서치 보고서 품질 평가 |
| research | [data-analyst](../../.claude/agents/research/data-analyst.md) | 이벤트 택소노미·퍼널 분석·A/B 테스트 설계 |
| research | [competitor-analyst](../../.claude/agents/research/competitor-analyst.md) | 경쟁사 분석·기능 비교·차별화 포인트 도출 |
| validation | [fact-checker](../../.claude/agents/validation/fact-checker.md) | 사실·수치·주장 교차 검증 |
| validation | [source-validator](../../.claude/agents/validation/source-validator.md) | URL·문서 신뢰도 판정 |
| validation | [qa-engineer](../../.claude/agents/validation/qa-engineer.md) | E2E 테스트·Playwright 코드 생성 |
| validation | [security-auditor](../../.claude/agents/validation/security-auditor.md) | OWASP·PIPA 보안 감사 |
| validation | [pr-reviewer](../../.claude/agents/validation/pr-reviewer.md) | PR diff 리뷰 코멘트·판정 생성 |
| validation | [a11y-auditor](../../.claude/agents/validation/a11y-auditor.md) | WCAG 2.2 접근성 자동 점검 |
| validation | [build-perf-benchmarker](../../.claude/agents/validation/build-perf-benchmarker.md) | 빌드·번들·Lighthouse 성능 실측 |
| validation | [perf-report-writer](../../.claude/agents/validation/perf-report-writer.md) | 성능 실측 결과 → 이해관계자용 보고서 작성 |
| health | [nutrition-prompt-tester](../../.claude/agents/health/nutrition-prompt-tester.md) | 식단 추천·영양 분석 프롬프트 4축 평가(근거·의료 단정 회피·알레르기/질환 가드·출력 포맷) — **health·all 전용** (2026-09-25, 타 템플릿 누수 차단) |

> 작성 도구 3종(agent-creator·skill-creator·skill-tester)은 "작성 도구" 옵션 y일 때만 포함됩니다 (기본 n).
> 2026-09-30 실측: SEO n·작성도구 n·codex n 기본 옵션 설치 기준 31종 (SEO y 시 33종).

---

## 스킬

| 카테고리 | 종류 | 비고 |
|----------|------|------|
| health (5종) | nutrition-basics · korean-food-nutrition · ingredient-management · meal-recommendation-prompt · nutrition-analysis-prompt | 건강·식단 도메인 핵심 |
| frontend (40종 / SEO y 시 58종) | 프레임워크·상태관리·UI·빌드·테스트·성능·LLM (+ SEO·GEO 는 옵트인) | indexeddb-dexie · claude-api-streaming-frontend · chat-ui-pattern · pwa-offline-llm-fallback 포함 (LLM PWA 공용 3종은 dream 목록에 섞여 있어 2026-09-11 전까지 실제로는 빠져 있었음) |
| devops (10종 / SEO y 시 11종) | Docker·GitHub Actions·n8n·Vercel Sandbox·Vercel Workflow (+ site-migration-seo 는 옵트인) | vercel-workflow 는 사용자별 지정 시각 Web Push 예약용 (2026-09-17) |
| architecture (4종) | DDD·프론트 도메인 구조·모듈 경계·점진 리팩터링 | |
| backend (6종) | claude-code-headless (Claude 구독 중계 연동용 예외) + TS 백엔드 5종 — hono-api-patterns·prisma-orm·zod-schema-validation·better-auth·drizzle-neon-postgres (짝 에이전트 typescript-backend-* 소유, 2026-09-25 신설) | |
| meta (1종) | claude-code-hook-authoring | |
| writing (0종 / SEO y 시 4종) | SEO 콘텐츠 품질 — 옵트인 | |

> **SEO·GEO 옵트인 (2026-09-11)**: react-spa·nextjs와 같은 질문(`y` 전체 / `c` 커머스 / `n` 제외, 엔터 = n)을 받는다. 이전에는 스킬 필터가 SEO 옵션을 읽고 있었지만 질문이 나오지 않아 기본값(전체 포함)이 항상 통과했다. 개인용 PWA면 n. 기본 옵션 실측(2026-09-30, 이전 2026-09-25 실측 스킬 75·훅 20): 스킬 66(SEO c 81 · SEO y 89) · 에이전트 31 · 훅 19 · 규칙 5 · 매니페스트 `templates: ["health"]`.

---

## 핵심 스킬 연동 관계

```
nutrition-basics           ← 영양소 기준값·BMR/TDEE 공식
korean-food-nutrition      ← 한국 식품 DB + 공공데이터 API
ingredient-management      ← TypeScript 도메인 모델 + Dexie 쿼리
meal-recommendation-prompt ← 식재료 기반 Claude 식단 추천
nutrition-analysis-prompt  ← 하루 식단 영양소 분석
frontend/indexeddb-dexie   ← IndexedDB 로컬 저장 (Dexie.js)
frontend/claude-api-streaming-frontend ← 프론트→Claude API 직접 호출
```

---

## 훅 (25종 — 공통 18 + 개발 전용 6 + TypeScript 1)

### 공통 (18종)

react-spa 템플릿과 동일한 공통 훅 세트. 자세한 목록은 [fortune-app.md](./fortune-app.md#훅-25종--공통-18--개발-전용-6--typescript-1) 참조.

### 개발 전용 (6종)

`tdd-guard.js` · `test-fake-guard.js` · `adversarial-test-guard.js` · `fake-impl-guard.js`

### TypeScript 전용 (1종)

`typescript-quality.js`

---

## 규칙 (5종 기본 / 작성 도구 y 시 10종)

| 규칙 | 조건 |
|------|------|
| git.md | 항상 |
| info-verification.md | 항상 |
| task-workflow.md | 항상 |
| typescript.md | 항상 (PWA TypeScript 기반) |
| adversarial-testing.md | 항상 (dev 템플릿 공통) |
| agent-design.md | 작성 도구 y |
| creation-workflow.md | 작성 도구 y |
| commands.md | 작성 도구 y |
| readme-update.md | 작성 도구 y |
| verification-policy.md | 작성 도구 y |
| memory-sync.md | memory 공유 선택 시 |
| codex-review.md | Codex 선택 시 |

---

## CLAUDE.md 예시

→ [examples/CLAUDE.health.md](../../examples/CLAUDE.health.md)

도메인 특화 규칙:
- KDRIs 2020 영양 기준 준수
- 식품안전나라 데이터 소스 명시
- AI 응답 면책 문구 필수
- IndexedDB 로컬 전용 원칙

---

## 복수 템플릿 조합 예시

```bash
# React SPA + 건강 도메인 (가장 일반적)
./project-install.sh → react-spa,health

# Next.js + 건강 도메인
./project-install.sh → nextjs,health
```

복수 선택 시 agents·skills·rules는 **union(합집합)** 으로 병합됩니다.
CLAUDE.md는 첫 번째 템플릿 기반 + 추가 템플릿 도메인 섹션 append 방식으로 병합됩니다.
