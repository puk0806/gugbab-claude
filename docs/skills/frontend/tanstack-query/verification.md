---
skill: tanstack-query
category: frontend
version: v1
date: 2026-08-11
status: APPROVED
---

# tanstack-query 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `tanstack-query` |
| 스킬 경로 | `.claude/skills/frontend/tanstack-query/SKILL.md` |
| 검증일 | 2026-08-11 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 기준 버전 | `@tanstack/react-query` 5.101.4 (React 18+ / 19) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (tanstack.com/query — caching / important-defaults / query-keys / query-invalidation / optimistic-updates / suspense / advanced-ssr / prefetching / disabling-queries / query-functions / query-cancellation / query-retries / infinite-queries / query-options / useQuery / useMutation / QueryClient / useQueryErrorResetBoundary)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/TanStack/query — main 브랜치 docs 원문, 릴리즈, 이슈 #9660)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-08-11 / npm registry latest = 5.101.4)
- [✅] React 어댑터의 v6 존재 여부 확인 (Svelte v6·Solid v6 beta만 존재, React는 v5가 안정 메이저)
- [✅] 기존 `frontend/state-management` 스킬 Read → 중복 범위 제거 및 상호 참조 포인터 삽입
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (queryKey·queryOptions·캐시 수명·낙관적 업데이트·무효화 범위·Suspense·무한스크롤·SSR·에러 경계)
- [✅] 코드 예시 작성 (전 섹션 TypeScript 실행 가능 형태)
- [✅] 흔한 실수 패턴 정리 (useEffect 수동 fetch / 불안정 queryKey / 전역 스토어 중복 저장 + 표 8종)
- [✅] SKILL.md 파일 작성
- [✅] verification.md 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 확보 |
| 중복 확인 | Glob | `.claude/skills/**/tanstack*/SKILL.md` | 결과 없음 → 신규 생성 확정 |
| 범위 분리 | Read | `.claude/skills/frontend/state-management/SKILL.md` | Zustand·상태 분류·v4→v5 표는 기존 스킬에 존재 → 이 스킬에서 제외하고 포인터로 연결 |
| 조사 | WebSearch | "TanStack Query v6 release stable 2026", "latest npm @tanstack/react-query 2026", "staleTime static 옵션", "environmentManager.isServer 릴리즈", "mutation onMutateResult 시그니처 변경", "staleTime vs gcTime" | 6회 검색 / v6는 Svelte·Solid 어댑터 한정, React는 v5, 5.101.4 확인 |
| 조사 | WebFetch | 공식 문서 페이지 13종 + GitHub main 브랜치 docs 원문 6종 + npm registry latest + 이슈 #9660 | 총 21회 페치, 캐시 수명·키 규칙·뮤테이션 콜백·SSR·Suspense·무한쿼리 원문 확보 |
| 교차 검증 | WebSearch + WebFetch | 12개 클레임, 독립 소스 2개 이상씩 대조 | VERIFIED 11 / DISPUTED 1 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| TanStack Query 공식 문서 (Caching) | https://tanstack.com/query/latest/docs/framework/react/guides/caching | ⭐⭐⭐ High | 2026-08-11 | staleTime 0 / gcTime 5분 |
| 공식 문서 (Important Defaults) | https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults | ⭐⭐⭐ High | 2026-08-11 | refetch 트리거·retry 3회·structural sharing |
| 공식 문서 (Query Keys) | https://github.com/TanStack/query/blob/main/docs/framework/react/guides/query-keys.md | ⭐⭐⭐ High | 2026-08-11 | 배열 키·결정적 해싱·의존성 포함 |
| 공식 문서 (Query Invalidation) | https://github.com/TanStack/query/blob/main/docs/framework/react/guides/query-invalidation.md | ⭐⭐⭐ High | 2026-08-11 | prefix·exact·predicate |
| 공식 레퍼런스 (QueryClient) | https://github.com/TanStack/query/blob/main/docs/reference/QueryClient.md | ⭐⭐⭐ High | 2026-08-11 | refetchType 4종·setQueryData 불변성·cancelQueries |
| 공식 문서 (Optimistic Updates) | https://github.com/TanStack/query/blob/main/docs/framework/react/guides/optimistic-updates.md | ⭐⭐⭐ High | 2026-08-11 | UI 변수 방식 vs 캐시 방식, onMutateResult 인자명 |
| 공식 문서 (Mutations) + useMutation 레퍼런스 | https://github.com/TanStack/query/blob/main/docs/framework/react/guides/mutations.md | ⭐⭐⭐ High | 2026-08-11 | 콜백 4종 시그니처·retry 0·scope·콜백 실행 순서 |
| 공식 문서 (Suspense) | https://tanstack.com/query/latest/docs/framework/react/guides/suspense | ⭐⭐⭐ High | 2026-08-11 | enabled 미지원·placeholderData 없음·throwOnError 기본식 |
| 공식 문서 (Advanced SSR) | https://github.com/TanStack/query/blob/main/docs/framework/react/guides/advanced-ssr.md | ⭐⭐⭐ High | 2026-08-11 | get-query-client 패턴·streaming·shouldDehydrateQuery |
| 공식 문서 (Prefetching) | https://github.com/TanStack/query/blob/main/docs/framework/react/guides/prefetching.md | ⭐⭐⭐ High | 2026-08-11 | prefetchQuery staleTime 존중 / ensureQueryData 무시 |
| 공식 문서 (Infinite Queries) | https://github.com/TanStack/query/blob/main/docs/framework/react/guides/infinite-queries.md | ⭐⭐⭐ High | 2026-08-11 | initialPageParam·maxPages·순차 전체 refetch |
| 공식 문서 (Disabling Queries) | https://github.com/TanStack/query/blob/main/docs/framework/react/guides/disabling-queries.md | ⭐⭐⭐ High | 2026-08-11 | isLoading vs isPending·skipToken 제약 |
| 공식 문서 (Query Functions / Cancellation / Retries) | https://github.com/TanStack/query/tree/main/docs/framework/react/guides | ⭐⭐⭐ High | 2026-08-11 | must throw·signal·백오프 공식 |
| 공식 문서 (Query Options / TypeScript) | https://github.com/TanStack/query/blob/main/docs/framework/react/guides/query-options.md | ⭐⭐⭐ High | 2026-08-11 | queryOptions·infiniteQueryOptions |
| 공식 레퍼런스 (useQuery) | https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | ⭐⭐⭐ High | 2026-08-11 | staleTime 함수·'static'·throwOnError·select |
| npm registry (latest) | https://registry.npmjs.org/@tanstack/react-query/latest | ⭐⭐⭐ High | 2026-08-11 | version 5.101.4, peer react ^18 \|\| ^19 |
| GitHub 이슈 #9660 (v5.89.0 시그니처 변경) | https://github.com/TanStack/query/issues/9660 | ⭐⭐⭐ High | 2026-08-11 | 콜백 3번째 인자 → onMutateResult 삽입 보고 |
| 공식 레퍼런스 (environmentManager) | https://tanstack.com/query/latest/docs/reference/environmentManager | ⭐⭐⭐ High | 2026-08-11 | core 5.91.1 도입, isServer export deprecated |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 1건은 공식 문서 기준으로 수정 반영)
- [✅] 버전 정보가 명시되어 있음 (`@tanstack/react-query` 5.101.4, React 18+/19, core 5.89.0·5.91.1 변경점 각주)
- [✅] deprecated된 패턴을 권장하지 않음 (`cacheTime`·`isServer` export·useQuery의 `onSuccess` 미사용)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (fresh/stale · active/inactive 2축 모델)
- [✅] 코드 예시 포함 (전 12개 섹션)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (state-management와의 역할 분리표, 캐시 방식 vs variables 방식 선택 기준, useSuspenseQuery 제약)
- [✅] 흔한 실수 패턴 포함 (3개 상세 + 표 8종)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)
- [✅] 기존 `frontend/state-management` 스킬과 중복 없이 양방향 참조 포인터 삽입

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 실전 질문 3개 수행 (섹션 5 참조)
- [✅] 스킬 내용이 올바른 답변 경로를 도출하는지 확인
- [✅] 오답 유도 시나리오 회귀 확인 2건 수행 (v6 권고 방지, gcTime 오해 방지)

### 4-5. 교차 검증 판정표

| # | 클레임 | 소스 1 | 소스 2 | 판정 |
|---|--------|--------|--------|------|
| 1 | React 어댑터 최신 안정 메이저는 **v5**이며 v6는 Svelte(정식)·Solid(beta) 어댑터 한정 | npm registry latest = 5.101.4 | TanStack/query 릴리즈 + v5 설치 문서(v6 언급 없음) | **VERIFIED** |
| 2 | `staleTime` 기본값 0, `gcTime` 기본값 5분 | 공식 Caching 가이드 | 공식 Important Defaults 가이드 | **VERIFIED** |
| 3 | `gcTime`은 **inactive 이후** 캐시 삭제 타이머이며 refetch 빈도와 무관 | 공식 Caching 가이드(gc 타이머 시작 시점) | 커뮤니티 해설 다수(가장 빈번한 혼동으로 보고) | **VERIFIED** |
| 4 | `staleTime`은 함수 지정 가능, `'static'` 값 지원(invalidate로도 stale 안 됨) | useQuery 레퍼런스(`number \| 'static' \| fn`) | core 커밋 `feat(core): staleTime: 'static'` + v5 문서 설명 | **VERIFIED** |
| 5 | 쿼리 키의 객체는 **프로퍼티 순서와 무관하게 결정적으로 해싱**되고, 배열 원소 순서는 유의미 | 공식 Query Keys 가이드 | 동 문서 예시(`{status,page}` = `{page,status}`) | **VERIFIED (원 요구사항 정정)** |
| 6 | 뮤테이션 콜백 3번째 인자가 `onMutateResult`, 4번째가 MutationFunctionContext (v5.89.0+) | 공식 optimistic-updates·mutations 문서 원문 코드 | GitHub 이슈 #9660 (5.89.0 변경 보고) | **DISPUTED → 수정 반영** |
| 7 | 낙관적 업데이트 절차 = cancelQueries → getQueryData 스냅샷 → setQueryData → 롤백 → onSettled invalidate | 공식 Optimistic Updates 가이드 | QueryClient 레퍼런스(cancelQueries "낙관적 업데이트 시 필요") | **VERIFIED** |
| 8 | `invalidateQueries`는 prefix 매칭이 기본이며 `exact`·`predicate`·`refetchType`(active/inactive/all/none) 제어 | 공식 Query Invalidation 가이드 | QueryClient 레퍼런스 | **VERIFIED** |
| 9 | `useSuspenseQuery`는 `enabled`·`placeholderData` 미지원, 쿼리 취소 불가, throwOnError 기본이 "데이터 없을 때만 throw" | 공식 Suspense 가이드 | useQuery 레퍼런스(throwOnError 시그니처) | **VERIFIED** |
| 10 | App Router 권장 패턴 = `environmentManager.isServer()` 분기 + prefetch + `HydrationBoundary`, 스트리밍은 `shouldDehydrateQuery`로 pending 포함 | 공식 Advanced SSR 가이드(main 원문 코드) | environmentManager 레퍼런스(core 5.91.1 도입, isServer deprecated) | **VERIFIED** |
| 11 | `useInfiniteQuery`는 `initialPageParam` 필수, stale 시 첫 페이지부터 순차 전체 refetch, `maxPages`로 상한 | 공식 Infinite Queries 가이드 | 동 문서 refetch 동작 설명 | **VERIFIED** |
| 12 | 쿼리 retry 기본 3회 + `Math.min(1000 * 2 ** attemptIndex, 30000)`, 서버에서는 0, 뮤테이션은 0 | 공식 Query Retries 가이드 | useMutation 레퍼런스(retry 기본 0) | **VERIFIED** |

### 4-6. DISPUTED 처리 내역

**#6 — 뮤테이션 콜백 시그니처**
- 기존 통념(및 레포 내 `state-management` 스킬 예시): `onError: (err, variables, context)` — 여기서 `context`가 onMutate 반환값.
- 현행 공식 문서: `onError: (err, variables, onMutateResult, context)` — 3번째가 onMutate 반환값, 4번째는 `client`·`meta`를 담은 MutationFunctionContext. v5.89.0에서 확장됨.
- 조치: SKILL.md 섹션 5-1에 `> 주의:` 블록으로 **버전별 차이와 위치 의미**를 명시하고, 예제 코드도 새 규약(`onMutateResult`)으로 작성.

**#5 — "queryKey에 객체를 넣으면 불안정하다"는 통념 정정**
- 객체 리터럴 자체는 안전하다(결정적 해싱). 실제 위험은 ① 렌더마다 내용이 달라지는 값, ② 직렬화 불가능한 값, ③ queryFn 의존 변수 누락.
- 조치: SKILL.md 섹션 11에 `> 정정:` 블록으로 정확한 원인 3가지를 명시.

---

## 5. 테스트 진행 기록

**수행일**: 2026-08-11
**수행자**: skill-creator (frontend 라이브러리 사용법 카테고리 — agent content test)
**수행 방법**: 작성된 SKILL.md만을 근거로 실전 질문 3개의 답변 경로를 도출하고, 공식 문서 원문과 일치하는지 대조

### Q1. "목록 화면을 갔다 올 때마다 API가 다시 호출됩니다. gcTime을 10분으로 늘렸는데 그대로예요. 왜죠?"

- 기대 답변 경로: `staleTime` 기본값이 0이라 마운트마다 백그라운드 refetch 발생 → `gcTime`은 inactive 이후 캐시 삭제 타이머일 뿐 refetch 빈도와 무관 → `staleTime`을 올려야 하며 `gcTime >= staleTime` 유지.
- SKILL.md 도출 경로: 섹션 1(두 축 분리) + 섹션 2(표·핵심 정리 1~3·데이터 성격별 값 표).
- 공식 문서 대조: Caching / Important Defaults 가이드와 일치.
- **판정: PASS** (근거: SKILL.md "2. staleTime vs gcTime" 섹션)

### Q2. "좋아요를 낙관적으로 반영했는데 가끔 눌렀다가 원래 값으로 되돌아갑니다."

- 기대 답변 경로: `onMutate`에서 `cancelQueries`를 먼저 호출하지 않아 뮤테이션 직전 시작된 refetch 응답이 낙관값을 덮어씀 → cancelQueries → getQueryData 스냅샷 → setQueryData(불변) → onError 롤백(onMutateResult) → onSettled invalidate 4단계 확인.
- SKILL.md 도출 경로: 섹션 5-2 코드 + 체크포인트 4항목, 섹션 11 표("onMutate에서 cancelQueries 생략").
- 공식 문서 대조: Optimistic Updates 가이드 / QueryClient.cancelQueries 설명과 일치. 콜백 인자명도 현행(v5.89.0+) 규약과 일치.
- **판정: PASS** (근거: SKILL.md "5-2. 캐시 롤백 방식" 섹션)

### Q3. "Next.js App Router에서 서버 prefetch를 했는데 클라이언트에서 같은 요청이 한 번 더 나갑니다."

- 기대 답변 경로: ① `staleTime: 0`이면 하이드레이션 직후 재요청되므로 기본값을 60초 등으로 설정 ② 서버 prefetch와 클라이언트 훅의 queryKey·queryFn이 완전히 동일해야 함(`queryOptions` 공유) ③ `HydrationBoundary`로 감쌌는지 확인 ④ 서버에서는 요청마다 QueryClient 생성.
- SKILL.md 도출 경로: 섹션 10(get-query-client 코드 + 주의 6항목), 섹션 3(queryOptions 공유).
- 공식 문서 대조: Advanced SSR 가이드와 일치(`environmentManager.isServer()` 포함, 도입 버전 각주까지 명시).
- **판정: PASS** (근거: SKILL.md "10. SSR — Next.js App Router" 섹션)

### 추가 회귀 확인 (오답 방지)

- "React 프로젝트를 TanStack Query v6로 올려라"라는 잘못된 조언 → 섹션 0이 차단. **PASS**
- "요청을 줄이려면 gcTime을 늘려라"라는 잘못된 조언 → 섹션 2 핵심 정리 2가 차단. **PASS**

**agent content test: 3/3 PASS** (추가 회귀 2/2 PASS)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (12개 클레임 중 VERIFIED 11, DISPUTED 1은 수정 반영) |
| 구조 완전성 | ✅ (frontmatter·소스 URL·검증일·버전 기준·주의 표기·흔한 실수·체크리스트) |
| 실용성 | ✅ (전 섹션 실행 가능한 TypeScript 예시, 프로젝트 비종속) |
| 기존 스킬과의 중복 | ✅ 분리 완료 (state-management = 선택 기준·Zustand / 이 스킬 = TanStack Query 사용법, 양방향 포인터) |
| 에이전트 활용 테스트 | ✅ 3/3 PASS |
| **최종 판정** | **APPROVED** |

> 판정 근거: `verification-policy.md`의 "실사용 검증이 필요 없는 스킬 — 라이브러리 사용법 스킬은 content test PASS = APPROVED" 기준 적용.
> 빌드 산출물·실행 결과로만 검증 가능한 항목(마이그레이션·빌드 설정)은 포함돼 있지 않다.

---

## 7. 개선 필요 사항

- [❌] `frontend/state-management` 스킬의 낙관적 업데이트 예시가 v5.89.0 이전 콜백 네이밍(`(err, newData, context)`)을 사용 중 — 별도 작업으로 해당 스킬 갱신 검토 필요(이번 작업 범위 밖, 파일 미수정)
- [❌] React 어댑터 v6가 정식 출시되면 섹션 0(버전 기준)과 마이그레이션 포인터 재검증 필요
- [❌] `environmentManager.isServer()` 미지원 버전(코어 5.91.1 미만) 프로젝트용 폴백은 각주 수준 — 레거시 적용 시 확인 필요

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-08-11 | v1 | 최초 작성 — 공식 문서 21회 페치·6회 검색 기반, 12개 클레임 교차 검증(DISPUTED 1건 수정 반영), content test 3/3 PASS로 APPROVED | skill-creator |
| 2026-08-26 | v1.1 | v5.102.0 통합 메서드 반영 — `prefetchQuery`/`fetchQuery`/`ensureQueryData` 계열 `@deprecated`(v6 제거 예정), `queryClient.query()`/`infiniteQuery()` 대체 및 동작 차이(throw·`staleTime: 'static'`) 주의 블록을 섹션 10에 추가. fact-checker 5개 독립 소스 VERIFIED(소스 JSDoc·마이그레이션 가이드·QueryClient 레퍼런스·RFC #9135·PR #11282). 기존 예시는 v5 내 유효하므로 유지 | orchestrator + fact-checker |
