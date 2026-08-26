---
skill: frontend-domain-structure
category: architecture
version: v1
date: 2026-08-26
status: APPROVED
---

# frontend-domain-structure 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `frontend-domain-structure` |
| 스킬 경로 | `.claude/skills/architecture/frontend-domain-structure/SKILL.md` |
| 검증일 | 2026-08-26 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 기준 버전 | FSD 스펙 2.1 (2024-11-13 릴리즈) / Next.js 16.3.3 (문서 기준일 2026-07-21) / Turborepo 2.10.12 / React 18·19 |
| 적용 대상 | ① Next.js App Router + Turborepo 모노레포 ② 대규모 Vite + React SPA(수천 파일 규모 단일 앱) |

---

## 1. 작업 목록 (Task List)

- [✅] 검증 템플릿 확인 (`docs/skills/VERIFICATION_TEMPLATE.md` — 8개 섹션 구조 확보)
- [✅] 중복 스킬 확인 (Glob: `.claude/skills/architecture/*/SKILL.md` → 동명 스킬 없음, 신규 생성 확정)
- [✅] 레포 작성 관례 확인 (`architecture/ddd` SKILL.md Read → frontmatter `user-invocable: false`, `> 소스:` 다중 행, `> 검증일:` 형식, 표 중심 섹션 스타일 채택)
- [✅] 기존 `architecture/ddd` 스킬과의 범위 분리 (바운디드 컨텍스트·유비쿼터스 언어·서브도메인은 중복 서술하지 않고 상호 참조 포인터로 연결)
- [✅] 공식 문서 1순위 소스 확인 (FSD 공식 문서 7종, Next.js 공식 문서 2종 + 공식 블로그 1종, Turborepo 공식 문서 2종, Nx 공식 문서 1종, React 공식 FAQ 1종)
- [✅] 공식 GitHub 2순위 소스 확인 (feature-sliced/documentation releases·steiger, vercel/turborepo best-practices RULE.md, sverweij/dependency-cruiser, adamtornhill/code-maat)
- [✅] 최신 스펙·버전 기준 확인 (날짜: 2026-08-26 — FSD 2.1 / Next.js 16.3.3 / turbo 2.10.12)
- [✅] 요구 주제 1: layer-first vs domain-first 비교 + 붕괴 지점 + 전환 판단 기준 정리
- [✅] 요구 주제 2: FSD 2.1 layers·slices·segments·import 방향·`@x`·public API 정본 정리
- [✅] 요구 주제 3: FSD 미적용 경량 대안 + Next.js App Router 공존(route group·private folder·colocation)
- [✅] 요구 주제 4: 모노레포 폴더↔패키지 승격 기준 (Turborepo·Nx)
- [✅] 요구 주제 5: colocation 원칙 + public API(index.ts) 노출 규칙 + 배럴 파일 트레이드오프
- [✅] 요구 주제 6: 전환 실패 패턴 6종 (shared 비대화·entities 남용·순환 의존·도메인=라우트 착각·조기 추상화 + 빈발 패턴 표)
- [✅] 요구 주제 7: 도메인 경계 역추출 (import 그래프·change coupling·용어 클러스터)
- [✅] 코드·설정 예시 작성 (ESLint `import/no-restricted-paths`, dependency-cruiser `forbidden`, Nx `depConstraints`, Turborepo `exports`, Next.js 폴더 트리, code-maat 명령)
- [✅] 전환 플레이북(스트랭글러 6단계) 및 체크리스트 작성
- [✅] SKILL.md 파일 작성
- [✅] verification.md 작성
- [⏸] README.md 갱신 — **의도적 미수행**. 병렬 스킬 생성 충돌 방지를 위해 오케스트레이터가 일괄 정리

---

## 2. 실행 에이전트 로그

> 이 스킬의 모든 서술은 아래 WebSearch·WebFetch 실행 결과에 근거한다. 미확인 항목은 4-6에 기재하고 SKILL.md에서 제거하거나 주의 표기했다.

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션(1. 작업 목록 ~ 8. 변경 이력) 구조 확보 |
| 형식 확인 | Read | `docs/skills/frontend/tanstack-query/verification.md` | frontmatter 키·섹션 번호·교차 검증 판정표(4-5) 서식 채택 |
| 관례 확인 | Read | `.claude/skills/architecture/ddd/SKILL.md` | frontmatter·소스/검증일 블록·표 스타일 확인, 중복 범위(바운디드 컨텍스트 등) 식별 |
| 중복 확인 | Glob | `.claude/skills/architecture/*/SKILL.md` | `ddd`, `dream-journal-data-modeling` 2종만 존재 → 신규 생성 확정 |
| 조사 | WebSearch | "Feature-Sliced Design 2.1 official documentation layers slices segments" / "FSD v2.1 pages-first 2024 spec changes" / "FSD v2.1 released November 2024" / "steiger FSD official linter eslint-plugin-boundaries dependency-cruiser" / "Turborepo internal packages one purpose package granularity" / "barrel files index.ts performance tree-shaking optimizePackageImports" / "FSD Next.js app router _pages rename" | 7회 검색. FSD 2.1 릴리즈일(2024-11-13)·pages-first 전환·processes deprecated·배럴 파일 성능 논쟁 소스 확보 |
| 조사 | WebFetch | FSD 공식: overview / reference-layers / reference-slices-segments / reference-public-api / guides-tech-with-nextjs / guides-examples-types / guides-migration-from-v2-0 / releases·releases-tag-v2.1 / steiger | 9회 페치. 레이어 정의 원문, import 규칙 원문, 세그먼트 표준명, `types` 폴더 금지 문구, `@x` 표기, public API 3원칙, Steiger 규칙 목록 확보 |
| 조사 | WebFetch | Next.js 공식: `app/getting-started/project-structure` / `config/next-config-js/optimizePackageImports` / Vercel 블로그 `how-we-optimized-package-imports-in-next-js` | 3회 페치. 문서 메타에서 버전 16.3.3·기준일 확인. colocation·private folder·route group 원문, 3가지 조직 전략, 기본 최적화 라이브러리 목록, 배럴 성능 측정치 확보 |
| 조사 | WebFetch | Turborepo 공식: structuring-a-repository / creating-an-internal-package / vercel/turborepo RULE.md / npm registry `turbo/latest` | 4회 페치(1회는 turborepo.com→turborepo.dev 리다이렉트 재시도). apps·packages 분할, 단일 purpose, 중첩 금지, `@repo/` 네임스페이스, exports 진입점, turbo 2.10.12 확인 |
| 조사 | WebFetch | Nx `features/enforce-module-boundaries`, React legacy FAQ `faq-structure`, bulletproof-react `docs/project-structure.md`, dependency-cruiser README, kentcdodds.com/blog/colocation | 5회 페치. 태그·depConstraints, 파일 구조 2분류·중첩 3~4단계 권고, ESLint zones 설정 원문, forbidden 규칙 서식, colocation 격언 확보 |
| 오탐 확인 | WebFetch | nextjs.org/blog/our-journey-with-caching (배럴 관련 여부 확인) | 배럴 주제 아님 확인 → 소스 목록에서 제외 |
| 교차 검증 | WebSearch + WebFetch | 17개 클레임, 각 2개 이상 독립 소스 대조 | VERIFIED 14 / DISPUTED 2 / UNVERIFIED 1 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| FSD 공식 — Overview | https://feature-sliced.design/docs/get-started/overview | ⭐⭐⭐ High | 2026-08-26 | 레이어 7종 정의 원문, 현재 스펙 v2.1 |
| FSD 공식 — Layers | https://feature-sliced.design/docs/reference/layers | ⭐⭐⭐ High | 2026-08-26 | import 규칙 원문, processes deprecated, app·shared 예외 |
| FSD 공식 — Slices and segments | https://feature-sliced.design/docs/reference/slices-segments | ⭐⭐⭐ High | 2026-08-26 | slice 독립성, 세그먼트 5종, "purpose not essence" |
| FSD 공식 — Public API | https://feature-sliced.design/docs/reference/public-api | ⭐⭐⭐ High | 2026-08-26 | index.ts 계약, `export *` 경고, `@x`, 환경별 진입점 |
| FSD 공식 — Usage with Next.js | https://feature-sliced.design/docs/guides/tech/with-nextjs | ⭐⭐⭐ High | 2026-08-26 | `_app`/`_pages` 리네이밍, src 배치, index.server.ts |
| FSD 공식 — Types 배치 가이드 | https://feature-sliced.design/docs/guides/examples/types | ⭐⭐⭐ High | 2026-08-26 | `shared/types`·`types` 세그먼트 금지 문구 |
| FSD 공식 — Migration from v2.0 to v2.1 | https://feature-sliced.design/docs/guides/migration/from-v2-0 | ⭐⭐⭐ High | 2026-08-26 | pages-first, 추출 임계값, 네임스페이스 논리 |
| FSD 공식 GitHub — Releases / v2.1 태그 | https://github.com/feature-sliced/documentation/releases/tag/v2.1 | ⭐⭐⭐ High | 2026-08-26 | 릴리즈일 11-13, breaking change 없음, @x 표준화 |
| FSD 공식 GitHub — Steiger | https://github.com/feature-sliced/steiger | ⭐⭐⭐ High | 2026-08-26 | 규칙 목록, beta 상태, 0.5.0 설정 breaking change |
| Next.js 공식 — Project structure | https://nextjs.org/docs/app/getting-started/project-structure | ⭐⭐⭐ High | 2026-08-26 | 문서 메타 version 16.3.3 / lastUpdated 2026-07-21. colocation·`_`·`()`·src·3전략 |
| Next.js 공식 — optimizePackageImports | https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports | ⭐⭐⭐ High | 2026-08-26 | experimental 표기, 기본 최적화 라이브러리 목록 |
| Vercel 공식 블로그 — How we optimized package imports | https://vercel.com/blog/how-we-optimized-package-imports-in-next-js | ⭐⭐⭐ High | 2026-08-26 | 배럴 비용 설명 + 측정치(10.2s→2.9s, build 28%, cold start 40%) |
| Turborepo 공식 — Structuring a repository | https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository | ⭐⭐⭐ High | 2026-08-26 | apps/packages, 네임스페이스, 중첩 미지원, `../` 경고 |
| Turborepo 공식 — Creating an Internal Package | https://turborepo.dev/docs/crafting-your-repository/creating-an-internal-package | ⭐⭐⭐ High | 2026-08-26 | 단일 "purpose", exports 진입점 예시 |
| Turborepo 공식 GitHub — best-practices RULE.md | https://github.com/vercel/turborepo/blob/main/skills/turborepo/references/best-practices/RULE.md | ⭐⭐⭐ High | 2026-08-26 | "each package should do one thing well", 앱=끝점 |
| npm registry — turbo/latest | https://registry.npmjs.org/turbo/latest | ⭐⭐⭐ High | 2026-08-26 | 2.10.12 |
| Nx 공식 — Enforce Module Boundaries | https://nx.dev/features/enforce-module-boundaries | ⭐⭐⭐ High | 2026-08-26 | tags·depConstraints·태그 패턴 4종·무태그 기본 제약 |
| React 공식(legacy) — FAQ File Structure | https://legacy.reactjs.org/docs/faq-structure.html | ⭐⭐⭐ High | 2026-08-26 | feature/route vs file type 2분류, 3~4단계 중첩 권고 |
| bulletproof-react — Project Structure | https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md | ⭐⭐ Medium-High | 2026-08-26 | 커뮤니티 레퍼런스(스타 다수). features 구조, 배럴 지양, ESLint zones 원문 |
| dependency-cruiser | https://github.com/sverweij/dependency-cruiser | ⭐⭐⭐ High | 2026-08-26 | forbidden 규칙 서식, 순환·orphan 탐지, 그래프 출력 |
| Kent C. Dodds — Colocation | https://kentcdodds.com/blog/colocation | ⭐⭐ Medium-High | 2026-08-26 | 저자 명확·널리 인용되는 원저 글. colocation 격언과 예외(E2E) |
| Adam Tornhill — code-maat / Software Design X-Rays | https://github.com/adamtornhill/code-maat | ⭐⭐⭐ High | 2026-08-26 | change/temporal coupling 분석 원저자 도구 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 2건은 SKILL.md에 `> 주의:`로 명시 처리)
- [✅] 버전 정보가 명시되어 있음 (FSD 2.1 / Next.js 16.3.3 / Turborepo 2.10.12 / React 18·19)
- [✅] deprecated된 패턴을 권장하지 않음 (FSD `processes` 레이어 폐기 명시, v2.0식 entity-first 분해를 안티패턴으로 기술)
- [✅] 실험적 기능에 실험 상태를 표기함 (`optimizePackageImports` experimental, Steiger beta)
- [✅] 코드·설정 예시가 실행 가능한 형태임 (ESLint zones, dependency-cruiser forbidden, Nx depConstraints, package.json exports, git log + code-maat 명령)
- [✅] 경험칙과 공식 규정을 구분 표기함 (1-3 임계치 표에 "공식 스펙이 정한 수치가 아님" 주의 삽입)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description) + 레포 관례 `user-invocable: false`
- [✅] `> 소스:` 다중 행 + `> 검증일: 2026-08-26` 명시
- [✅] 기준 버전 블록 명시
- [✅] 핵심 개념 설명 포함 (layer-first/domain-first, FSD 3단계 계층, 변경 국소성)
- [✅] 코드·폴더 트리 예시 포함 (전 섹션)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (1-3 전환 판단 기준, 2-8 FSD 채택 판단, 4-2 패키지 승격 판단)
- [✅] 흔한 실수 패턴 포함 (8장 6종 상세 + 빈발 패턴 표 8행)
- [✅] 실행 체크리스트 포함 (9장 3구간)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 구조 설계·전환 판단에 쓸 수 있는 수준
- [✅] 지나치게 이론적이지 않고 실행 가능한 절차 포함 (7장 전환 플레이북 6단계, 6-4 실행 순서)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 없음. 대상은 "Next.js App Router 모노레포"·"대규모 Vite SPA"로 일반화)
- [✅] 기존 `architecture/ddd` 스킬과 중복 없이 참조 포인터로 연결 (바운디드 컨텍스트·유비쿼터스 언어는 ddd 스킬로 위임)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] skill-tester 호출 — 수행 완료 (2026-08-26, frontend-developer 서브에이전트 3회)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS, 근거 섹션 전부 실제 존재)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (해당 없음 — FAIL/PARTIAL 없음)

### 4-5. 교차 검증 판정표

| # | 클레임 | 소스 1 | 소스 2 | 판정 |
|---|--------|--------|--------|------|
| 1 | FSD 현재 스펙 버전은 **2.1**이며 2024-11-13 릴리즈, v2.0 대비 breaking change 없음 | FSD 공식 Overview(v2.1 표기) | GitHub releases + v2.1 태그(날짜·"no breaking changes") | **VERIFIED** |
| 2 | FSD 레이어 import 규칙 = "A module (file) in a slice can only import other slices when they are located on layers **strictly below**" | FSD 공식 Layers 레퍼런스 | FSD 공식 Slices and segments(동일 문장 재인용) | **VERIFIED** |
| 3 | `processes` 레이어는 **deprecated**이며 내용은 `features`·`app`으로 이동 | FSD 공식 Layers("This layer has been deprecated…") | v2.0.0 릴리즈 노트(폐기 안내) | **VERIFIED** |
| 4 | `app`·`shared`는 slice가 없고 세그먼트로 바로 나뉘며 내부 상호 참조 자유 | FSD 공식 Layers | FSD 공식 Slices and segments("The Shared and App layers don't contain slices") | **VERIFIED** |
| 5 | 표준 세그먼트는 `ui`·`api`·`model`·`lib`·`config`이며 이름은 "본질이 아니라 목적"을 나타내야 함 | FSD 공식 Slices and segments | FSD 공식 Types 가이드(동일 논리로 `types` 세그먼트 금지) | **VERIFIED** |
| 6 | FSD는 `shared/types` 폴더·`types` 세그먼트 생성을 명시적으로 금지 | FSD 공식 Types 가이드 원문 인용 | FSD 공식 Slices and segments(`components`·`hooks` 류 이름 회피 규칙) | **VERIFIED** |
| 7 | v2.1은 "pages-first" 분해를 권장 — 재사용 없는 UI·폼·데이터 로직은 페이지 slice에 유지, 여러 페이지 재사용 시에만 추출 | FSD 공식 Migration from v2.0 | v2.1 릴리즈 노트 + 공식 Discussion #756 요약 | **VERIFIED** |
| 8 | `@x` 크로스 임포트는 v2.1에서 표준화되었고 **entities 레이어로 제한**해 최소로 사용 | FSD 공식 Public API 레퍼런스 | v2.1 릴리즈 노트(@x 표준화) + Migration 가이드 | **VERIFIED** |
| 9 | Next.js `app/`에서 `page.js`/`route.js`가 없으면 라우팅되지 않아 프로젝트 파일 colocation이 안전하고, `_folder`는 하위 전체를 라우팅에서 제외, `(folder)`는 URL에서 제외 | Next.js 공식 Project structure(원문 인용, 문서 version 16.3.3) | 동 문서의 경로 표(`app/blog/_components/Post.tsx` → 비라우팅, `app/(marketing)/page.tsx` → `/`) | **VERIFIED** |
| 10 | Turborepo 권장 구조는 `apps/`(끝점, 다른 패키지의 의존성이 되면 안 됨) + `packages/`, 패키지는 단일 purpose, 중첩 금지, `@repo/` 네임스페이스 | Turborepo 공식 Structuring a repository + Creating an Internal Package | vercel/turborepo 공식 GitHub best-practices RULE.md | **VERIFIED** |
| 11 | Nx는 tags + `@nx/enforce-module-boundaries`의 `depConstraints`로 경계를 강제하며, 태그 없는 프로젝트는 어떤 프로젝트에도 의존할 수 없음 | Nx 공식 Enforce Module Boundaries | 동 문서의 태그 패턴 4종·설정 예시 | **VERIFIED** |
| 12 | 배럴 파일(index.ts)은 모듈 그래프 확대·tree-shaking 비용으로 빌드/개발 속도를 저하시킨다 | Vercel 공식 블로그(측정치: `@material-ui/icons` 10.2s→2.9s, `next build` ~28%, cold start 최대 40%) | bulletproof-react(배럴 지양 → 직접 import 권장) | **VERIFIED (단, FSD public API 요구와 충돌 → #13에서 처리)** |
| 13 | "FSD의 slice별 `index.ts` public API 필수" vs "배럴 파일을 쓰지 말라"는 권고가 **상충**한다 | FSD 공식 Public API("Every slice … must contain a public API definition") | bulletproof-react + Vercel 공식 블로그(배럴 비용) | **DISPUTED → 절충안 명시 반영** |
| 14 | Next.js `optimizePackageImports`가 로컬 배럴(`@/components`)까지 자동 최적화한다 | 3rd-party 블로그 요약(검색 결과) | Next.js 공식 문서 — 대상은 설정에 나열한 **패키지**, 로컬 배럴 자동 처리 언급 없음. 또한 **experimental** 표기 | **UNVERIFIED → 해당 서술 제거 + 주의 표기** |
| 15 | FSD 공식 Next.js 가이드는 FSD `app`·`pages` 레이어를 **양쪽 모두** `_app`·`_pages`로 리네이밍할 것을 권고하며 공식 린터와 호환 | FSD 공식 with-nextjs 페이지 본문 | 동 페이지에 대한 검색 인덱스 요약(동일 문구 재확인) | **VERIFIED (단, Next.js 공식 규약 아님 → #16)** |
| 16 | `src/_pages`의 `_`가 Next.js private folder 규칙과 같은 것이다 | 표기 유사성에 기반한 통념 | Next.js 공식 문서: `_folder` 규칙은 **`app/` 디렉터리 내부**의 라우팅 제외 규칙 | **DISPUTED → "이름 충돌 회피용 접두사일 뿐"으로 정정 표기** |
| 17 | Steiger는 FSD 조직이 관리하는 아키텍처 린터이며 `forbidden-imports`·`public-api`·`insignificant-slice`·`excessive-slicing` 등을 검사 | steiger 공식 GitHub | FSD 공식 Migration 가이드(마이그레이션 절차에서 두 규칙 활용 안내) | **VERIFIED (단 beta 단계 — 주의 표기)** |

### 4-6. DISPUTED / UNVERIFIED 처리 내역

**#13 — public API(index.ts) 필수 vs 배럴 파일 금지 (DISPUTED)**
- 충돌 내용: FSD는 slice마다 public API 정의를 **필수**로 규정한다. 반면 bulletproof-react는 배럴 파일이 Vite tree shaking을 방해한다며 직접 import를 권장하고, Vercel 공식 블로그는 배럴로 인한 빌드 지연을 수치로 제시한다.
- 조치: 어느 한쪽을 정답으로 쓰지 않고 SKILL.md 5-3에 **양측 입장 표 + 절충 5원칙**을 명시했다. ① 도메인 루트 배럴 1개만 유지(중간 배럴 금지) ② `export *` 금지 ③ 도메인 내부는 상대 경로 직접 import(자기 배럴 경유 시 순환 위험) ④ 실측 문제 발생 시에만 서브패스 진입점 전환 + 계약은 린트로 대체 ⑤ 외부 라이브러리 배럴은 번들러 옵션으로 완화.
- 2-5 말미에 5-3으로 가는 포인터를 넣어 독자가 FSD 규칙만 읽고 무비판적으로 전 폴더 배럴을 만드는 것을 방지했다.

**#16 — `_app`/`_pages`의 `_`와 Next.js private folder (DISPUTED)**
- 혼동 내용: FSD 공식 Next.js 가이드의 `_app`·`_pages` 접두사와 Next.js의 `_folder`(private folder)는 표기만 같고 의미가 다르다. Next.js의 규칙은 **`app/` 디렉터리 내부**에서 라우팅 대상을 제외하는 규약이며, `src/_pages`는 단순한 이름 충돌 회피용이다.
- 조치: SKILL.md 3-3 말미에 `> 주의:`로 두 개념을 구분해 명시하고, "두 개념을 같은 것으로 설명하지 말 것"을 못박았다.

**#14 — `optimizePackageImports`의 적용 범위 (UNVERIFIED)**
- 검색 결과 요약에는 "`import { Button } from '@/components'`를 자동으로 개별 경로로 바꾼다"는 서술이 있었으나, Next.js 공식 문서에는 대상이 설정에 나열한 **패키지**라고만 되어 있고 로컬 배럴 자동 처리에 대한 언급이 없다.
- 조치: 해당 서술을 SKILL.md에서 제외하고, 5-3에 "공식 문서에서 확인되지 않았다 — 그 전제로 설계하지 말 것" 주의를 넣었다. 아울러 이 옵션이 **experimental**이며 공식 문서가 "not recommended for production"으로 표기한다는 사실을 함께 명시했다.

**보조 처리 — 수치 임계치의 지위**
- 1-3의 전환 판단 기준 표(파일 수·팀 수 등)는 어떤 공식 문서에도 근거가 없는 **경험칙**이다. 표 상단에 그 사실을 `> 주의:`로 명시하고, 대신 6-2의 change coupling 지표로 검증하도록 유도했다.

---

## 5. 테스트 진행 기록

**수행일**: 2026-08-26
**수행자**: skill-tester → frontend-developer (domain-specific 에이전트, 3회 병렬 호출)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. layer-first(types/·utils/·api/ 도메인명 반복) → domain-first 전환 첫 단계**
- ✅ PASS
- 근거: SKILL.md "6-4 실행 순서", "7-1/7-2 전환 플레이북", "2-4"(줄 209), "9. 체크리스트"
- 상세: "그냥 order.ts들을 features/order/로 옮기면 된다"는 제안에 정확히 반박. 올바른 첫 단계는 0단계 청소(orphan·순환 제거, dependency-cruiser)→1단계 계측(change coupling·import 그래프로 도메인 후보 도출)이며, 단순 폴더 이동은 2-4/8-6이 명시한 "문제를 한 단계 아래로 내렸을 뿐" 안티패턴과 동일하다고 정확히 식별함. 세그먼트 분산(model/api/lib) 필요성도 언급.

**Q2. FSD 레이어 간 import 방향 + 같은 레이어 slice 간 import 가능 여부**
- ✅ PASS
- 근거: SKILL.md "2-3 import 방향 규칙", "8-3 순환 의존"
- 상세: "위 레이어→아래 레이어만, 역방향·같은 레이어 slice 간 import 금지"를 정확히 인용. `@x` 크로스 임포트가 **entities 레이어에만 한정**됨을 정확히 짚었고, features 레이어 slice 간 충돌 시 대안(레이어 강등/shared·entities 추출)도 근거 문장(743행)으로 제시.

**Q3. Next.js App Router private folder(`_`)·route group(`()`)의 정확한 의미 + 도메인 폴더 1:1 매핑 제안 평가**
- ✅ PASS
- 근거: SKILL.md "3-2 Next.js App Router와의 공존" 표, "규칙 4가지"의 4번, "8-4 도메인과 라우트를 1:1로 착각"
- 상세: private folder는 "폴더+모든 하위 폴더를 라우팅에서 제외", route group은 "URL 미노출, 레이아웃 분기용"임을 정확히 구분. "route group 이름=도메인 이름 1:1 매핑" 제안에 대해 8-4 근거로 명확히 반대(라우트=네비게이션 단위, 도메인=변경·오너십 단위가 다르다는 논리까지 재현).

### 발견된 gap

- 경미: Q2 — `@x`를 entities로 제한하는 이유 문장이 FSD 공식 인용인지 스킬 저자 해석인지 구분 표기가 없음(기능상 답변에는 지장 없음, 향후 보강 시 참고).
- 경미: Q3 — private folder와 route group을 동시 중첩할 때의 상호작용, route group 중첩 시 레이아웃 병합 규칙은 SKILL.md 범위 밖(원래 다루는 주제가 아님, 결격 아님).

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: "개념·설계 기준" 스킬 — content test PASS로 APPROVED 전환 가능 (실사용 필수 카테고리 아님)
- 최종 상태: APPROVED

---

### 이전 상태 (참고, 해소됨)

과거 기록: 본 스킬 생성 작업은 `creation-workflow.md`의 단계 1~4(조사→교차 검증→작성→검증 문서 저장)까지만 범위가 지정되어 skill-tester 호출(단계 5)이 미수행 상태였다. 위 2026-08-26 기록으로 해소되었다.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (17개 클레임 중 VERIFIED 14, DISPUTED 2는 정정·절충안 반영, UNVERIFIED 1은 서술 제거 + 주의 표기) |
| 구조 완전성 | ✅ (frontmatter·소스 URL 22종·검증일·기준 버전·주의 표기·흔한 실수·체크리스트) |
| 실용성 | ✅ (전환 플레이북 6단계, 실행 가능한 린트/분석 설정, 프로젝트 비종속) |
| 기존 스킬과의 중복 | ✅ 분리 완료 (`architecture/ddd` = 도메인 개념·바운디드 컨텍스트 / 본 스킬 = 프론트엔드 폴더 구조·의존 방향, 참조 포인터로 연결) |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-08-26, frontend-developer 3회) |
| **최종 판정** | **APPROVED** |

> 카테고리 판정 참고: 본 스킬은 `verification-policy.md`의 "개념·이론 정리 스킬"에 가까워 content test PASS만으로 APPROVED 전환이 가능한 유형이다. 2026-08-26 skill-tester가 3개 질문(전환 첫 단계·FSD import 방향·Next.js private folder/route group)을 frontend-developer로 검증해 3/3 PASS, APPROVED로 전환했다.

---

## 7. 개선 필요 사항

- [✅] skill-tester를 통한 agent content test 수행 및 섹션 5·6 갱신 (2026-08-26 완료, 3/3 PASS)
- [❌] README.md 스킬 목록·스킬 수·업데이트 로그 반영 — 차단 요인 아님, 병렬 충돌 방지를 위해 의도적 미수행. 오케스트레이터가 일괄 정리 예정
- [❌] Steiger가 stable(1.x)에 도달하면 2-7의 beta 주의 문구와 규칙 목록 재검증 필요
- [❌] Next.js `optimizePackageImports`가 experimental에서 승격되면 5-3의 주의 문구 갱신 필요
- [❌] FSD 스펙 2.2 이상이 릴리즈되면 2장 전체(레이어 정의·pages-first·@x) 재검증 필요
- [❌] React 공식 FAQ는 legacy 문서를 인용하고 있음 — 현행 react.dev에 대응 서술이 생기면 소스 교체 검토
- [❌] `eslint-plugin-boundaries` 등 대안 린터는 이름만 언급했을 뿐 설정 예시를 검증하지 않음 — 필요 시 별도 조사 후 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-08-26 | v1 | 최초 작성 — 공식 문서 21회 페치·7회 검색 기반, 17개 클레임 교차 검증(DISPUTED 2건 정정 반영, UNVERIFIED 1건 제거). 단계 1~4만 수행, skill-tester 미호출로 PENDING_TEST 유지 | skill-creator |
| 2026-08-26 | v1 | 2단계 실사용 테스트 수행 (Q1 layer-first→domain-first 전환 첫 단계 / Q2 FSD 레이어 import 방향·slice 간 import 가능 여부 / Q3 Next.js private folder·route group 의미와 도메인 1:1 매핑 평가) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
