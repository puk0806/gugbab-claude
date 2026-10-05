---
skill: tanstack-query-v4-to-v5-migration
category: frontend
version: v1.1
date: 2026-09-28
status: APPROVED
---

# tanstack-query-v4-to-v5-migration 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `tanstack-query-v4-to-v5-migration` |
| 스킬 경로 | `.claude/skills/frontend/tanstack-query-v4-to-v5-migration/SKILL.md` |
| 검증일 | 2026-09-28 (실사용 검증 v1.1, 직전 30~60일 주기 재검증 2026-09-26, 이전 검증 2026-08-26) |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 기준 버전 | 출발 = `@tanstack/react-query` 4.44.0 (v4 마지막, 변동 없음) / 도착 = 5.104.0 (v5 최신, 2026-08-26 확인 시 5.102.4) |

---

## 1. 작업 목록 (Task List)

- [✅] 검증 템플릿 확인 (`docs/skills/VERIFICATION_TEMPLATE.md` — 8개 섹션 구조)
- [✅] 중복 스킬 확인 (`.claude/skills/**/tanstack-query*/SKILL.md` → 기존 v5 사용법 스킬 1종만 존재, 마이그레이션 스킬 없음 → 신규 생성 확정)
- [✅] 기존 `frontend/tanstack-query` SKILL.md Read → 작성 관례(범위 분리표·소스/검증일 블록·흔한 실수 표·리뷰 체크리스트) 승계
- [✅] 기존 `frontend/state-management` SKILL.md의 "TanStack Query v4 → v5 주요 변경사항" 절 확인 → **2항목(오브젝트 문법·쿼리 콜백 제거) 요약 수준**임을 확인, 중복 회피 + 정본 포인터 명시
- [✅] 공식 문서 1순위 소스 확인 (tanstack.com 공식 마이그레이션 가이드 + GitHub main 브랜치 원문 마크다운)
- [✅] 공식 GitHub 2순위 소스 확인 (migrating-to-v5.md, QueryClient.md, devtools.md, installation.md, persistQueryClient.md)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-08-26 / npm dist-tags: `latest` = 5.102.4, `previous` = 4.44.0)
- [✅] v5 breaking change 전수 목록 확보 (마이그레이션 가이드 H3 헤딩 35개 + New Features 8개 전량 열거 후 본문 대조)
- [✅] 각 breaking change의 before/after 코드 쌍 작성
- [✅] 공식 codemod 실행법 및 자동/수동 경계 정리
- [✅] 점진 전환 전략(3단계) + PR 분할 설계
- [✅] 타입 에러 없이 동작만 바뀌는 런타임 함정 13종 별도 표 작성
- [✅] 생태계 패키지(devtools · persist) v4↔v5 prop/옵션 차이 정리
- [✅] 전환 후 검증 방법(정적 검증·쿼리 키 감사·devtools 확인·회귀 체크리스트·롤백 기준) 작성
- [✅] 흔한 실수 패턴 표 작성 (18종)
- [✅] SKILL.md 파일 작성
- [✅] verification.md 작성
- [❌] skill-tester 2단계 테스트 (오케스트레이터가 별도 수행 — 이번 작업 범위 밖)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 확보 |
| 중복 확인 | Glob | `.claude/skills/**/tanstack-query*/SKILL.md` | 1건(`frontend/tanstack-query`)만 존재 → 마이그레이션 스킬 신규 |
| 관례 확인 | Read | `.claude/skills/frontend/tanstack-query/SKILL.md`, `docs/skills/frontend/tanstack-query/verification.md` | 문서 포맷·범위 분리 서술 방식 승계 |
| 중복 범위 조사 | Grep + Read | `.claude/skills/frontend/state-management/SKILL.md` 내 `v4|v5|cacheTime|gcTime|isPending|keepPreviousData` | v4→v5 절이 2항목 요약뿐임을 확인 → 이 스킬이 정본임을 명시 |
| 조사 | WebFetch | 공식 마이그레이션 가이드 (tanstack.com 렌더 + GitHub raw 원문). 헤딩 전량 열거 1회 + 구간별 축자 재현 5회 | 35개 breaking change 헤딩 + New Features 8개 확보, 구간별 before/after 코드 확보 |
| 조사 | WebFetch | `docs/reference/QueryClient.md`, `docs/framework/react/reference/useQuery.md`, `installation.md`, `devtools.md`(v5), `plugins/persistQueryClient.md` | `query()`/`infiniteQuery()` 등재 확인, `isInitialLoading` deprecated 확인, React 18+/브라우저 요건, devtools v5 옵션표, persistOptions 필드 |
| 조사 | WebFetch | v4 문서 — `tanstack.com/query/v4/.../reference/useQuery`, `/eslint/no-deprecated-options`, `/devtools` | v4의 `isInitialLoading`·`structuralSharing` 함수형 존재 확인, v4 eslint 규칙 2종 확인, v4 devtools prop 확인 |
| 조사 | WebFetch | npm registry — `@tanstack/react-query`, `react-query-devtools`, `react-query-persist-client`, `query-sync-storage-persister`의 `latest` + dist-tags | 4종 모두 latest 5.102.4 / previous 4.44.0, peerDeps `@tanstack/react-query ^5.102.4` 확인 |
| 조사 | WebFetch | https://tanstack.com/blog/announcing-tanstack-query-v5 | 공식 공지로 단일 시그니처·gcTime·pending·maxPages·suspense 훅 교차 확인 |
| 조사 | WebFetch | https://tkdodo.eu/blog/breaking-react-querys-api-on-purpose | 쿼리 콜백 제거 근거 + QueryCache 전역 콜백/`meta`/파생값 대체 패턴 코드 확보 |
| 교차 검증 | WebSearch | codemod 패키지명·실행법, `prefer-query-object-syntax` 삭제, isLoading/isPending·gcTime·throwOnError 3자 해설, `queryClient.query()` 도입 RFC, `isInitialLoading` 도입 버전 | 독립 해설 소스(BigBinary·Dreamix·PkgPulse·GitHub Discussions) 확보 |
| 교차 검증 | WebFetch | `registry.npmjs.org/@tanstack/query-codemods` | **HTTP 404** — 요구사항에 있던 패키지명이 실존하지 않음을 확인 |
| 교차 검증 | 종합 | 18개 클레임, 각 2개 이상 독립 소스 대조 | VERIFIED 15 / DISPUTED 2 / UNVERIFIED 1 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 공식 마이그레이션 가이드 (렌더) | https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5 | ⭐⭐⭐ High | 2026-08-26 | 1차 소스 |
| 공식 마이그레이션 가이드 (GitHub raw 원문) | https://raw.githubusercontent.com/TanStack/query/main/docs/framework/react/guides/migrating-to-v5.md | ⭐⭐⭐ High | 2026-08-26 | 헤딩 35개 전수 + 구간별 축자 재현 |
| 공식 릴리즈 공지 | https://tanstack.com/blog/announcing-tanstack-query-v5 | ⭐⭐⭐ High | 2026-08-26 | 단일 시그니처·gcTime·pending·maxPages·suspense 훅 교차 확인 |
| 공식 레퍼런스 (QueryClient) | https://raw.githubusercontent.com/TanStack/query/main/docs/reference/QueryClient.md | ⭐⭐⭐ High | 2026-08-26 | `query`/`infiniteQuery` 등재, fetch/prefetch/ensure 미등재 |
| 공식 레퍼런스 (useQuery v5) | https://raw.githubusercontent.com/TanStack/query/main/docs/framework/react/reference/useQuery.md | ⭐⭐⭐ High | 2026-08-26 | `isInitialLoading` = deprecated alias of `isLoading` |
| 공식 문서 (Installation) | https://raw.githubusercontent.com/TanStack/query/main/docs/framework/react/installation.md | ⭐⭐⭐ High | 2026-08-26 | React 18+ / 브라우저 요건 |
| 공식 문서 (Devtools v5) | https://raw.githubusercontent.com/TanStack/query/main/docs/framework/react/devtools.md | ⭐⭐⭐ High | 2026-08-26 | `buttonPosition`/`position`/`client`, production import 경로 |
| 공식 문서 (Devtools v4) | https://tanstack.com/query/v4/docs/framework/react/devtools | ⭐⭐⭐ High | 2026-08-26 | v4 `position`/`panelPosition`/`context`/`panelProps` |
| 공식 문서 (persistQueryClient) | https://raw.githubusercontent.com/TanStack/query/main/docs/framework/react/plugins/persistQueryClient.md | ⭐⭐⭐ High | 2026-08-26 | persistOptions 필드·buster·gcTime/maxAge 관계 |
| 공식 레퍼런스 (useQuery v4) | https://tanstack.com/query/v4/docs/framework/react/reference/useQuery | ⭐⭐⭐ High | 2026-08-26 | v4의 `isInitialLoading`·`structuralSharing` 함수형 존재, 콜백/`isDataEqual` deprecated 표기 |
| 공식 eslint 문서 (v4 no-deprecated-options) | https://tanstack.com/query/v4/docs/eslint/no-deprecated-options | ⭐⭐⭐ High | 2026-08-26 | onSuccess·onError·onSettled·isDataEqual 검출 |
| npm registry (4종 dist-tags·latest) | https://registry.npmjs.org/@tanstack/react-query 외 3종 | ⭐⭐⭐ High | 2026-08-26 | latest 5.102.4 / previous 4.44.0 / peer `^5.102.4` |
| npm registry (query-codemods) | https://registry.npmjs.org/@tanstack/query-codemods | ⭐⭐⭐ High | 2026-08-26 | **404 — 패키지 미존재** |
| TkDodo(메인테이너) 블로그 | https://tkdodo.eu/blog/breaking-react-querys-api-on-purpose | ⭐⭐⭐ High | 2026-08-26 | 콜백 제거 근거 + 대체 패턴 3종 |
| GitHub Discussion #9135 (RFC: Unified Imperative Query Methods) | https://github.com/TanStack/query/discussions/9135 | ⭐⭐⭐ High | 2026-08-26 | `query()`/`infiniteQuery()` 도입, v6 제거 예정 |
| GitHub Issue #6548 / Discussion #7048 / #7154 | https://github.com/TanStack/query/issues/6548 | ⭐⭐ Medium | 2026-08-26 | codemod의 useMutation 미처리, `.cjs`·ERR_REQUIRE_ESM |
| BigBinary — Migrating to TanStack Query v5 | https://www.bigbinary.com/blog/migrating-to-tanstack-query-v5 | ⭐⭐ Medium | 2026-08-26 | isLoading/isPending·gcTime·throwOnError 독립 확인 |
| Dreamix — v5 migration key aspects | https://dreamix.eu/insights/tanstack-query-v5-migration-made-easy-key-aspects-breaking-changes/ | ⭐⭐ Medium | 2026-08-26 | breaking change 목록 독립 확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 2건은 공식/레지스트리 기준으로 수정 반영)
- [✅] 버전 정보가 명시되어 있음 (출발 4.44.0 / 도착 5.102.4, React 18+, TS 4.7+)
- [✅] deprecated된 패턴을 권장하지 않음 (`isInitialLoading`·`cacheTime`·쿼리 콜백을 "쓰라"고 하지 않음, `fetchQuery` 계열 deprecated 표기 별도 주의 블록)
- [✅] 코드 예시가 실행 가능한 형태임 (before/after 쌍 25개 이상, TSX)
- [✅] 미확인 사항은 `> 주의:` / "미검증"으로 명시 (`queryClient.query()` 도입 패치, v4 `isInitialLoading` 도입 패치)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] `> 소스:` URL과 `> 검증일: 2026-08-26` 명시
- [✅] 핵심 개념 설명 포함 (3단계 전환 모델, 롤백 단위 기준의 PR 분할)
- [✅] 코드 예시 포함 (전 섹션)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (범위 분리표 — v5 사용법은 `frontend/tanstack-query`, 상태 분류는 `frontend/state-management`)
- [✅] 흔한 실수 패턴 포함 (18종 표)
- [✅] 완료 체크리스트 포함 (단계별 3블록)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 마이그레이션 작업에 도움이 되는 수준 (실행 가능한 codemod 명령·grep 명령·PR 분할표)
- [✅] 지나치게 이론적이지 않고 실용적 (자동/수동 경계표, 런타임 함정표, 롤백 기준)
- [✅] 범용적으로 사용 가능 (특정 프로젝트명·경로 비종속. Vite/React 18 SPA는 "예시 조건"으로만 언급)
- [✅] 기존 스킬과 중복 없이 포인터 연결 (`frontend/tanstack-query` 섹션 2·3·5-1·7 참조, `frontend/state-management` 정본 관계 명시)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-08-26, skill-tester → frontend-developer 4문항)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (4/4 PASS, 근거 섹션 명시)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — 4문항 모두 PASS로 보완 불필요

### 4-5. 교차 검증 판정표

| # | 클레임 | 소스 1 | 소스 2 | 판정 |
|---|--------|--------|--------|------|
| 1 | v5 최신 안정 = **5.102.4**, v4 마지막 = **4.44.0**, 서브패키지 4종 동일 | npm dist-tags `@tanstack/react-query` | devtools·persist-client·sync-storage-persister dist-tags 3종 동일 | **VERIFIED** |
| 2 | v5 서브패키지 peerDependency가 `@tanstack/react-query ^5.102.4` → 코어만 부분 업그레이드 불가 | persist-client `latest` 매니페스트 | devtools `latest` 매니페스트 | **VERIFIED** |
| 3 | 모든 훅·QueryClient 메서드가 **단일 오브젝트 시그니처**만 지원 | 공식 마이그레이션 가이드 §단일 시그니처 | 공식 v5 릴리즈 공지("you always just pass one object") | **VERIFIED** |
| 4 | `status: 'loading'` → `'pending'`, `isLoading` → `isPending`, **v4의 `isInitialLoading` → v5의 `isLoading`(= `isPending && isFetching`)**, v5 `isInitialLoading`은 deprecated 별칭 | 공식 마이그레이션 가이드 해당 절 | v5 useQuery 레퍼런스("**deprecated** An alias for isLoading, will be removed in the next major version") + BigBinary 해설 | **VERIFIED** |
| 5 | `cacheTime` → `gcTime` (의미 동일, 기본 5분) | 공식 마이그레이션 가이드 | v5 useQuery 레퍼런스(gcTime 기본 5분) + 공식 공지 | **VERIFIED** |
| 6 | `keepPreviousData` 제거 → `placeholderData: keepPreviousData`(import한 identity 함수), `isPreviousData` → `isPlaceholderData` | 공식 마이그레이션 가이드 축자 코드 | Dreamix·BigBinary 독립 해설 | **VERIFIED** |
| 7 | `useErrorBoundary` → `throwOnError` (framework-agnostic 목적) | 공식 마이그레이션 가이드 | BigBinary 인용문 | **VERIFIED** |
| 8 | `onSuccess`/`onError`/`onSettled`가 **useQuery/QueryObserver에서만** 제거, useMutation은 유지 | 공식 마이그레이션 가이드("removed from Queries … remains available for mutations only") | TkDodo 블로그 + GitHub Discussion #5279 | **VERIFIED** |
| 9 | 콜백 대체 = QueryCache 전역 `onError` / `meta` 필드 / 파생값(필요 시 useEffect, data·error는 참조 안정) | TkDodo 블로그 코드 3종 | 공식 마이그레이션 가이드(콜백 제거 안내) + Discussion #6451 | **VERIFIED** |
| 10 | `query.remove()` 제거 → `queryClient.removeQueries({ queryKey })` / `getQueryData`·`getQueryState`는 **queryKey만** 수용 | 공식 마이그레이션 가이드 축자 코드 | 공식 QueryClient 레퍼런스 | **VERIFIED** |
| 11 | `refetchPage` 제거 → `maxPages`, 무한쿼리 `initialPageParam` 필수, manual mode 제거, `getNextPageParam` 필수, `null` 반환 = 페이지 없음 | 공식 마이그레이션 가이드 해당 4개 절 | 공식 공지(maxPages) + 공식 infinite-queries 가이드 | **VERIFIED** |
| 12 | `contextSharing` 제거 / 커스텀 `context` prop 제거 → 훅 2번째 인자로 `queryClient` 전달 | 공식 마이그레이션 가이드 축자 코드 | 동 가이드 별도 절(contextSharing) 상호 정합 | **VERIFIED** |
| 13 | TS 최소 4.7, React 최소 18.0(`useSyncExternalStore`), 브라우저 Chrome≥91/Safari≥15 등 | 공식 마이그레이션 가이드 | 공식 installation 문서(React 18+ / browserslist) | **VERIFIED** |
| 14 | `Hydrate` → `HydrationBoundary`, `useHydrate` 제거, HydrationBoundary는 쿼리만 하이드레이션 / `dehydrateQueries`·`dehydrateMutations` → `shouldDehydrateQuery`·`shouldDehydrateMutation` | 공식 마이그레이션 가이드 §Hydration API changes, §New dehydrate API | 공식 advanced-ssr 가이드의 `shouldDehydrateQuery` 사용례 | **VERIFIED** |
| 15 | `useQuery({ suspense: true })` 제거 → `useSuspenseQuery`/`useSuspenseInfiniteQuery`/`useSuspenseQueries` | 공식 마이그레이션 가이드 §new hooks for suspense("experimental suspense boolean … discontinued") | 공식 v5 공지(suspense 정식화) | **VERIFIED** |
| 16 | 공식 codemod는 **`@tanstack/react-query` 패키지 동봉 jscodeshift 트랜스폼**이며, `@tanstack/query-codemods` npm 패키지는 존재하지 않음 | npm registry `@tanstack/query-codemods` → **404** | 공식 마이그레이션 가이드 §Codemod 축자 명령(`node_modules/@tanstack/react-query/build/codemods/...remove-overloads.cjs`) | **DISPUTED → 수정 반영** |
| 17 | `fetchQuery`/`prefetchQuery`/`ensureQueryData`/`fetchInfiniteQuery`/`prefetchInfiniteQuery`가 현행 v5 문서에서 **deprecated**, `queryClient.query()`/`infiniteQuery()`로 대체(v6 제거 예정) | 공식 마이그레이션 가이드 §Imperative QueryClient methods | 공식 QueryClient 레퍼런스에 `query`/`infiniteQuery`만 등재 + Discussion #9135 | **DISPUTED → 수정 반영 (도입 패치 버전은 미검증)** |
| 18 | v4의 `isInitialLoading`·`structuralSharing` 함수형이 **정확히 어느 4.x 패치부터** 제공되는지 | v4 useQuery 레퍼런스(4.44 기준 존재 확인) | 패치 단위 CHANGELOG 확인 실패 | **UNVERIFIED → "4.44.0 선행 업그레이드" 권고로 회피** |

### 4-6. DISPUTED / UNVERIFIED 처리 내역

**#16 — codemod 패키지명 (요청 사항과 실제가 불일치)**
- 작업 요청서에는 `@tanstack/query-codemods` 실행법을 다루라고 되어 있었다.
- 실제: npm 레지스트리에 해당 패키지가 **존재하지 않는다(404)**. 공식 경로는 설치된 `@tanstack/react-query` 내부의
  `build/codemods/src/v5/remove-overloads/remove-overloads.cjs`를 `npx jscodeshift`로 실행하는 것 하나뿐이다.
- 조치: SKILL.md 섹션 2에 `> 주의:` 블록으로 **패키지 미존재 사실**과 정확한 명령(TS는 `--parser=tsx` 필수, 확장자 `.cjs`)을 명시.
  섹션 7 흔한 실수 표에도 "`@tanstack/query-codemods` 설치 시도 → 404" 행을 추가.

**#17 — 명령형 QueryClient 메서드의 현재 상태**
- 통념(및 레포 내 `frontend/tanstack-query` 스킬 예시): v5에서 `prefetchQuery`/`ensureQueryData`가 권장 API.
- 현행 공식 문서: 이 5종을 deprecated로 표기하고 `queryClient.query()`/`infiniteQuery()`로 통합, v6에서 제거 예정.
  QueryClient 레퍼런스에도 신규 메서드만 등재돼 있다.
- 다만 **어느 5.x 패치부터 신규 메서드가 존재하는지**는 확인하지 못했다.
- 조치: SKILL.md 섹션 3-8에서 **2단계(버전 업)에서는 기존 이름의 오브젝트 인자화만 수행**하고,
  `query()` 전환은 3단계에서 설치 버전의 타입 정의를 확인한 뒤 진행하도록 안내. 미검증 사실도 함께 표기.

**#18 — v4 하위 기능의 도입 패치 버전 미확인**
- `isInitialLoading`·`structuralSharing` 함수형이 4.44.0 문서에는 존재하지만 도입 패치는 미확인.
- 조치: "1단계의 첫 PR을 4.x → **4.44.0** 패치 업으로 잡는다"는 권고로 우회하고, 미확인 사실을 `> 주의:`로 명시.
  이 권고 자체가 마이그레이션 관행상 안전한 순서이므로 실용성 손실이 없다.

---

## 5. 테스트 진행 기록

### [2026-09-28] skill-tester 재테스트 — 실사용 검증에서 정정된 codemod 경로·경계표·트랩 #3/#4 서술 확인

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션 존재 여부 확인. 직전 실사용(실행) 검증(2026-09-28, lab 샘플 v4→v5 실전환)에서 정정된 3가지 서술(codemod 경로·자동/수동 경계표·트랩 #3/#4)이 content test로도 정확히 반영되는지 확인.

### 실제 수행 테스트

**Q1. `useInfiniteQuery(key, fn, options)` 위치 인자와 `cacheTime` 옵션이 codemod로 자동 변환되는가**
- ✅ PASS
- 근거: SKILL.md "2-1. 자동/수동 경계" 표(200~214행)
- 상세: `useInfiniteQuery`는 `remove-overloads`의 대상 hook(`useQuery`/`useIsFetching`/`useMutation`/`useIsMutating`)에 없어 **경고 없이 조용히 건너뛴다**(❌ 수동)는 것과, `cacheTime`→`gcTime`은 별도 `rename-properties` 코드모드가 **자동 처리**(✅)한다는 것을 정정된 표 그대로 정확히 구분. 6-1 grep 재확인 필요성까지 근거로 제시. 정정 전 서술(둘 다 반대로 기재)이 남아있지 않음을 확인.

**Q2. `hasNextPage` 확인 없이 `fetchNextPage()`를 직접 호출하는 코드가 v4→v5에서 문제가 되는가, "hasNextPage 플래그의 null 처리 오류"로 이해하면 맞는가**
- ✅ PASS
- 근거: SKILL.md "섹션 4 함정표 #3"(237행)
- 상세: "hasNextPage 플래그 자체는 v4.44.0에서도 이미 null을 정확히 판정한다"는 정정된 서술을 정확히 인용해 질문의 오해("hasNextPage 자체 문제")를 **틀렸다고 정정**하고, 진짜 원인이 `fetchNextPage()` 내부 `fetchPage()` 가드 차이(v4 `typeof param==='undefined'` vs v5 `param==null`)임을 정확히 답변. 이전 버전의 부정확한 서술(hasNextPage 플래그 문제로 기재)이 남아있지 않음을 확인.

### 발견된 gap

- 없음. 2문항 모두 2026-09-28 실행 검증으로 정정된 서술을 그대로 반영하고 있으며, 정정 전 내용과 모순되는 잔재가 없음을 확인.

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 실사용 필수 카테고리(마이그레이션 가이드)이나, 직전 2026-09-28 실사용(실행) 검증으로 이미 졸업 조건을 충족해 APPROVED 상태 — 이번 재테스트는 그 정정 내용의 content test 재확인
- 최종 상태: **APPROVED 유지** (정정된 codemod 경계표·트랩 #3/#4 서술 재테스트 2/2 PASS)

---

### [2026-09-28] 실사용(실행) 검증

**수행일**: 2026-09-28
**수행 방법**: Node v22.23.1 / npm 10.9.8 / lab 격리 폴더에 Vite5+React18+TS5.6 샘플 프로젝트 신규 생성(`@tanstack/react-query` 4.44.0 baseline). 샘플은 스킬이 다루는 패턴을 전부 포함: `useQuery`/`useInfiniteQuery`/`useMutation` 위치 인자 오버로드, `cacheTime`, `useErrorBoundary`, `onSuccess` 콜백(useQuery), `keepPreviousData`/`isPreviousData`, `status==='loading'` 문자열 비교, `getNextPageParam` null 반환, devtools v4 props(`position`/`panelPosition`). v4 베이스라인에서 `tsc --noEmit`·`vite build`·vitest(5개, RTL 렌더 기반 실제 캐시/네트워크 동작 검증) 전부 통과 확인 후, ① `npx jscodeshift` 로 공식 `remove-overloads` codemod 실행 → ② 실행 중 발견한 추가 공식 codemod 4종(`rename-properties`/`keep-previous-data`/`is-loading`/`rename-hydrate`) 중 적용 가능한 2종(`rename-properties`,`keep-previous-data`) 실행 → ③ 나머지는 스킬 절차대로 수동 정리(`useInfiniteQuery` 오브젝트화+`initialPageParam`, `onSuccess`→파생값 useEffect 치환, `isLoading`→`isPending`/`status`→`'pending'`, `isPreviousData`→`isPlaceholderData`, devtools prop 재배치) → ④ 패키지를 5.104.0으로 전환 → ⑤ `tsc --noEmit`·`vite build`·vitest 5개 재실행.
**실행 결과**:
- v4 baseline: tsc 통과, build 통과, vitest 5/5 통과(캐시 GC 실측·infinite query 과잉 fetch 실측 포함).
- codemod 실행 결과, **SKILL.md 서술과 3가지 불일치 발견** → SKILL.md 최소 정정 완료(Edit, 아래 3항목):
  1. **codemod 경로 오류 + 소스 오해**: 서술된 경로 `build/codemods/src/v5/remove-overloads/remove-overloads.cjs`는 `src/` 세그먼트가 실재하지 않는다(정확한 경로: `build/codemods/v5/remove-overloads/remove-overloads.cjs`). 더 중요하게, 이 codemod들은 **v5 패키지에만 존재**한다 — v4.44.0 설치본에는 `codemods/v4/`(v3→v4용)만 있고 `v5/`가 없다. "1단계에서 v4 유지한 채 codemod 실행"이라는 서술이 마치 v4 설치본만으로 가능한 것처럼 읽히나, 실제로는 v5 패키지를 먼저 설치(또는 코드모드 스크립트만 확보)해야 한다.
  2. **자동/수동 경계표 5항목 오류**: `useInfiniteQuery`는 `remove-overloads`의 대상 hook 목록(`useQuery`/`useIsFetching`/`useMutation`/`useIsMutating`)에 **없어 조용히 건너뛴다**(경고조차 없음) — 표는 ✅로 잘못 기재. 반대로 `cacheTime→gcTime`·`useErrorBoundary→throwOnError`는 별도 `rename-properties` codemod가, `keepPreviousData→placeholderData`(리터럴 `true`인 경우)는 `keep-previous-data` codemod가, `Hydrate→HydrationBoundary`는 `rename-hydrate` codemod가 **자동으로 처리**하는데 표는 전부 ❌ 수동으로 기재. `isLoading→isPending`도 `is-loading` codemod가 존재하나 섹션 4-1의 의미 판별 없이 맹목적으로 치환하므로 그대로 쓰면 위험하다는 경고를 추가.
  3. **트랩 표 #3·#4 부정확**: #3은 `hasNextPage` 플래그 자체가 아니라(v4.44.0도 이미 null-aware) **`hasNextPage`를 거치지 않고 `fetchNextPage()`를 직접 호출했을 때**의 내부 `fetchPage()` 가드 차이(`typeof param==='undefined'` vs `param==null`)가 실제 원인임을 실행으로 확인(query-core 4.44.0/5.104.0 소스 대조 + RTL 테스트로 재현: v4는 과잉 fetch 발생(호출 4회), v5는 미발생(3회)). #4의 "타입 에러 없음"은 옵션 객체가 콜사이트 인라인 리터럴일 때는 **거짓**(tsc가 `TS2769`로 실제로 잡음, 실행 확인) — 옵션을 변수로 감싼 경우에만 참. 두 케이스 모두 SKILL.md에 정확히 반영.
- 수동 정리 + codemod 적용 후 v5.104.0: **tsc 통과, vite build 통과, vitest 5/5 통과**(동일 5개 테스트, 그 중 2개는 v4/v5 간 기대값이 실제로 뒤바뀌는 것까지 확인 — infinite query 과잉 fetch 4→3회, `hasNextPage` 가드는 양쪽 다 정상).
- `npm ls @tanstack/query-core` 단일 버전 확인(섹션 6-1 ②), grep 기반 v4 잔재 검색(섹션 6-1 ③~⑤) 0건 확인.
**졸업 조건 충족 여부**: **충족** — PENDING_TEST.md 표의 요구("v4 프로젝트를 v5로 올려 codemod(remove-overloads) 실행 + isLoading/gcTime/콜백 제거 수동 정리 후 devtools로 캐시 동작 확인")를 전부 실행. devtools "육안 확인" 대신 **테스트 코드로 캐시 동작(GC 수명, 무한쿼리 과잉 fetch 유무)을 재현 가능하게 검증**했다(브리프의 "가능하면 테스트로 캐시 동작 확인"에 해당, devtools 렌더 자체는 런타임 에러 없이 표시되는 것도 build/typecheck로 간접 확인).
**판정**: **APPROVED 전환** (서술 오류 3건은 실행 근거로 SKILL.md에 이미 정정 반영, 재실행까지 통과 확인)

---

**수행일**: 2026-08-26
**수행자**: skill-tester → frontend-developer (domain-specific 에이전트, 세션 registry 존재하여 general-purpose 대체 불필요)
**수행 방법**: SKILL.md Read 후 실전 질문 4개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. v4 `useQuery(key, fn, { onSuccess })`를 v5로 옮길 때 onSuccess는 어떻게 되는지와 대체 패턴**
- ✅ PASS
- 근거: SKILL.md 섹션 3-6("useQuery의 onSuccess/onError/onSettled 제거"), 섹션 4 표 #4, 섹션 7 흔한 실수 표
- 상세: "옵션 자체가 없다"(타입 에러 없이 조용히 무시됨)를 정확히 지적하고, 3-6의 대체 패턴 3종(QueryCache 전역 콜백/meta/파생값) 중 로컬 state 동기화 케이스에 맞는 "파생값" 패턴을 정확히 매칭. useMutation은 콜백이 유지된다는 예외까지 정확히 구분.

**Q2. `@tanstack/query-codemods` 설치 요청에 대한 올바른 안내**
- ✅ PASS
- 근거: SKILL.md 섹션 2("공식 codemod") 168~183줄, 섹션 7 흔한 실수 표
- 상세: 해당 npm 패키지가 존재하지 않음(레지스트리 404)을 정확히 지적하고, 실제 경로(`node_modules/@tanstack/react-query/build/codemods/src/v5/remove-overloads/remove-overloads.cjs`)와 `--parser=tsx` 필수, `.cjs` 확장자 필수(`.js`는 `ERR_REQUIRE_ESM`)까지 정확히 안내. 허위 설치 명령을 제시하지 않음(anti-pattern 회피).

**Q3. `isLoading` 의미가 v4→v5에서 어떻게 바뀌는지**
- ✅ PASS
- 근거: SKILL.md 섹션 3-3("isLoading/status 이름 변경 — 가장 위험한 항목"), 섹션 4 표 #1, 섹션 4-1(판별 절차)
- 상세: v4 `isLoading`→v5 `isPending`, v4 `isInitialLoading`→v5 `isLoading`(의미 자체가 바뀜)을 정확히 구분. "전부 isPending 치환" 또는 "전부 유지" 각각의 실패 사례를 섹션 7 흔한 실수 표와 연결해 정확히 설명. 4-1의 `enabled` 여부 기반 판별 플로우차트와 grep 스크립트까지 재현. 일괄 치환을 권고하지 않음(anti-pattern 회피).

**Q4. persist/devtools 패키지를 v4에 두고 core만 v5로 올릴 수 있는지**
- ✅ PASS
- 근거: SKILL.md 섹션 0-2("서브패키지는 한 커밋에서 같은 버전으로 올린다"), 섹션 7 흔한 실수 표
- 상세: "불가능"을 명확히 답하고 peerDependency(`^5.102.4` 이상 요구) 및 "No QueryClient set" 런타임 에러 근거를 정확히 인용. 4종 동시 업그레이드 + 3단계 점진 전환 전략을 대안으로 제시. 부분 업그레이드를 허용하지 않음(anti-pattern 회피).

### 발견된 gap

- 없음. 4문항 모두 SKILL.md 단독 정보만으로 PASS, 근거 섹션이 명확하고 서로 다른 섹션(3-3/3-6/4/4-1/0-2/7) 간 교차 일관성도 확인됨.
- Q1 답변 에이전트가 지적한 사소한 참고사항: "setLocalState의 구체적 목적(단순 복사 vs 파생 로직)에 따라 파생값/useEffect 중 어느 쪽이 맞는지는 원칙만 제시" — 이는 SKILL.md의 의도된 설계(개별 사례 판단은 사용자 맥락 필요)이므로 보완 불필요로 판단.

### 판정

- agent content test: 4/4 PASS
- verification-policy 분류: **실사용 필수 카테고리 — 마이그레이션 가이드** (빌드/설정 변환이 실제로 작동하는지 확인 필요)
- 최종 상태: **PENDING_TEST 유지** (content test PASS이지만 실사용 필수 카테고리이므로 실제 코드베이스에서 v4→v5 전환을 수행해 빌드·런타임 결과를 확인하기 전까지 APPROVED 전환 보류)

---

### 5-1. 2026-09-26 재검증 (30~60일 주기, verification-policy.md 절차)

**수행일**: 2026-09-26
**수행 방법**: SKILL.md + references/REFERENCE.md 전체 Read → 핵심 클레임 3개 WebSearch/WebFetch 재검증 → 실전 질문 2개로 SKILL.md 자체 답변 재확인

**재검증 클레임**:
| # | 클레임 | 재확인 결과 |
|---|--------|------|
| R1 | v5 최신 버전 5.102.4 | npm registry 재확인 → **5.102.4 → 5.104.0** 마이너 갱신, breaking change 없음 |
| R2 | v4 마지막 버전 4.44.0(변동 없음, v4는 더 이상 릴리스 안 됨) | npm dist-tag `previous` 재확인 → ✅ VERIFIED, 변동 없음 |
| R3 | React Query에 v6가 존재하는가(§3-8의 "v6에서 제거 예정" 서술 재확인) | WebSearch 재확인 — **React Query 코어는 여전히 v5.**"v6" 표기는 Solid/Svelte 어댑터 한정 RC이며 React 어댑터에는 v6가 없음. `fetchQuery`/`prefetchQuery` 등은 여전히 deprecated 상태로 유지, `query()`/`infiniteQuery()` 통합은 계획대로 v6에서 제거 예정(미출시) | ✅ VERIFIED, 변동 없음 |

**Q1(재검증). "TanStack Query v6가 나왔다는데 이 스킬이 여전히 유효한가?"**
- SKILL.md 답변: React Query에는 아직 v6가 없다(2026-09-26 기준). "v6"라는 표기는 Solid/Svelte 어댑터 RC에 한정된 것이며, React 코어는 여전히 v5.104.0이다. 스킬의 v4→v5 전환 내용과 §3-8의 "v6 제거 예정" 경고 모두 그대로 유효.
- **판정: ✅ PASS**

**Q2(재검증). "지금 v5로 올리면 몇 버전을 쓰면 되나?"**
- SKILL.md 답변: 5.104.0(2026-09-26 기준 최신, 5.102.4에서 마이너 갱신, breaking change 없음)
- **판정: ✅ PASS**

**재검증 결과**: 3개 클레임 모두 실질 변경 없음(버전 번호만 마이너 갱신). **status PENDING_TEST 유지**(원래 사유인 "실사용 필수 카테고리 — 마이그레이션 가이드"는 이번 재검증과 무관하게 그대로 유지).

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (18개 클레임 중 VERIFIED 15, DISPUTED 2는 수정 반영, UNVERIFIED 1은 주의 표기 + 회피 권고) |
| 구조 완전성 | ✅ (frontmatter·소스 URL·검증일·버전 기준·주의 표기·흔한 실수·완료 체크리스트) |
| 실용성 | ✅ (실행 가능한 codemod/grep 명령, PR 분할표, 롤백 기준, 프로젝트 비종속) |
| 기존 스킬과의 중복 | ✅ 분리 완료 (`frontend/tanstack-query` = v5 사용법 / `frontend/state-management` = 상태 분류 · v4→v5 요약 / 이 스킬 = 전환 정본) |
| 에이전트 활용 테스트 | ✅ 수행 완료 (2026-08-26, skill-tester → frontend-developer 4문항, 4/4 PASS) |
| 실사용(실행) 검증 (2026-09-28) | ✅ v4.44.0→v5.104.0 샘플 프로젝트 실전환 완료 — codemod 5종 중 3종 적용(`remove-overloads`+`rename-properties`+`keep-previous-data`), 나머지 수동 정리, tsc·build·vitest(5/5) 전부 통과. 서술 오류 3건 발견 후 SKILL.md 정정 반영 |
| skill-tester content test 재테스트 (2026-09-28) | ✅ 정정된 codemod 자동/수동 경계표 + 트랩 #3/#4 서술 2문항 재테스트 2/2 PASS — 정정 전 오류 잔재 없음 확인 |
| **최종 판정** | **APPROVED 유지** — content test(2026-08-26) + 실사용 실행 검증(2026-09-28) + skill-tester 정정분 재테스트(2026-09-28) 모두 완료 |

> 이 스킬은 `verification-policy.md`의 **"실사용 필수 스킬 — 마이그레이션 가이드"** 카테고리였다.
> 2026-09-28에 실제 v4→v5 전환을 lab 샘플 프로젝트에서 수행해 빌드·타입체크·테스트(캐시 GC·무한쿼리 과잉 fetch 재현)로 결과를 확인했고, 그 과정에서 SKILL.md의 codemod 자동/수동 경계·트랩 서술 오류 3건을 발견해 정정했다. 이로써 실사용 필수 카테고리의 졸업 조건을 충족해 `APPROVED`로 전환한다.

---

## 7. 개선 필요 사항

- [✅] skill-tester 2단계 테스트 수행 및 섹션 5·6 갱신 (2026-08-26 완료, 4/4 PASS — frontend-developer 대상 Q1 onSuccess 대체·Q2 codemod 패키지·Q3 isLoading 의미·Q4 부분 업그레이드 불가 4문항)
- [❌] `queryClient.query()`/`infiniteQuery()`의 정확한 도입 5.x 패치 버전 확인 → 확인되면 섹션 3-8의 "미검증" 표기 해제 및 `frontend/tanstack-query` 스킬(현재 `prefetchQuery` 사용)과의 정합 재검토 — **차단 요인 아님(선택 보강)**: 현재도 "미검증" 명시 + 2단계에서는 기존 이름 유지 안내로 안전하게 우회되어 있음
- [❌] v4의 `isInitialLoading`·`structuralSharing` 함수형 도입 패치 버전 확인 (패치 단위 CHANGELOG 대조 필요) — **차단 요인 아님(선택 보강)**: "4.44.0 선행 업그레이드" 권고로 실용상 우회됨
- [❌] v5 devtools에서 `panelProps`/`toggleButtonProps`/`closeButtonProps` 제거 여부는 **v5 문서 옵션 목록에 부재**한다는 간접 근거로 판단함 → 타입 정의(d.ts) 직접 대조로 확정 필요 — **차단 요인 아님(선택 보강)**
- [❌] persist `buster` 변경 권고는 공식 문서 명시 사항이 아닌 도출된 예방 조치 → 실제 v4 캐시를 v5로 복원하는 재현 테스트로 확증 필요 — **차단 요인 아님(선택 보강)**: 2026-09-28 실행 검증의 샘플에는 `PersistQueryClientProvider`를 포함하지 않아 이 항목은 검증 범위 밖. PENDING_TEST.md 졸업 조건 문구(codemod+isLoading/gcTime/콜백 수동정리+캐시 동작 확인) 자체에는 persist 재현이 포함되지 않아 APPROVED 판정에는 영향 없으나, persist 실사용 시에는 별도로 재현 검증 권장
- [❌] React 어댑터 v6가 정식 출시되면 섹션 3-8(v6 제거 예정 항목)과 이 스킬의 도착 버전 기준 전면 재검증 필요 — **차단 요인 아님(미래 이벤트 트리거형 후속 과제)**
- [✅] 실제 v4→v5 전환 실행 결과 확인 (2026-09-28 완료) — lab 샘플 프로젝트로 codemod 5종 확인·적용 3종·수동 정리·tsc/build/vitest 전부 통과. 과정에서 SKILL.md 서술 오류 3건(codemod 경로·자동/수동 경계표·트랩 #3·#4) 발견 후 정정
- [✅] skill-tester가 정정된 codemod 경계표·트랩 #3/#4 서술을 content test로 재확인 (2026-09-28 완료, 2/2 PASS — 정정 전 오류 잔재 없음 확인)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-08-26 | v1 | 최초 작성 — 공식 마이그레이션 가이드(헤딩 35개 전수) 및 공식 레퍼런스·npm 레지스트리 기반, 18개 클레임 교차 검증(DISPUTED 2건 수정 반영·UNVERIFIED 1건 주의 표기). skill-tester 미수행으로 PENDING_TEST | skill-creator |
| 2026-08-26 | v1 | 2단계 실사용 테스트 수행 (Q1 onSuccess 제거·대체 패턴 / Q2 `@tanstack/query-codemods` 패키지 미존재 안내 / Q3 isLoading v4↔v5 의미 변화 판별 / Q4 코어만 v5 부분 업그레이드 불가) → 4/4 PASS, 실사용 필수 카테고리(마이그레이션 가이드)이므로 PENDING_TEST 유지 | skill-tester |
| 2026-09-25 | v1 | 구조 개편: 상세 내용 references/REFERENCE.md 분리 (내용 변경 없음) | skill-creator |
| 2026-09-26 | v1 | 30~60일 주기 재검증. v5 5.102.4→5.104.0 버전 갱신(breaking change 없음), React Query v6 미출시 확인(Solid/Svelte 어댑터 한정). status PENDING_TEST 유지 | 메인 세션 |
| 2026-09-28 | v1.1 | 실사용(실행) 검증 완료 — lab 샘플로 v4.44.0→v5.104.0 실전환(codemod 5종 확인, 3종 실행, 나머지 수동 정리, tsc/build/vitest 5/5 통과). 서술 오류 3건 발견 후 SKILL.md 정정: ① codemod 경로(`build/codemods/src/v5/...`→`build/codemods/v5/...`, v5 패키지 전용) ② 자동/수동 경계표(`useInfiniteQuery` ✅→❌, `cacheTime`·`useErrorBoundary`·`keepPreviousData`·`Hydrate` ❌→✅, `isLoading` 코드모드 존재하나 맹목적 치환 경고 추가) ③ 트랩 #3(`hasNextPage`가 아니라 `fetchNextPage()` 내부 가드 차이가 원인) · #4("타입 에러 없음"은 인라인 리터럴이 아닐 때만 참, 인라인은 tsc가 TS2769로 잡음). status PENDING_TEST → **APPROVED** | 메인 세션(fe-migrate lab) |
| 2026-09-28 | v1.1 | 2단계 실사용 재테스트 수행 (Q1 codemod 자동/수동 경계표 `useInfiniteQuery`/`cacheTime` 정정 확인 / Q2 트랩 #3 `hasNextPage` vs `fetchNextPage()` 가드 정정 확인) → 2/2 PASS, 정정 전 오류 잔재 없음 확인, **APPROVED 유지**. 섹션 5·6·7·8 동기화 | skill-tester |
