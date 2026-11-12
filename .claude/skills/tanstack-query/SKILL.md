---
name: tanstack-query
description: TanStack Query(React Query) v5 최신 변경점(5.89 onMutate 시그니처·5.102 통합 메서드 deprecated·5.105.3 'static')과 실측 함정, App Router SSR 구성, v4→v5 마이그레이션 codemod 위치·런타임 함정
---

# TanStack Query v5 실전 패턴

> 소스: https://tanstack.com/query/latest/docs/framework/react (공식 문서)
> 보조 소스: https://github.com/TanStack/query (공식 GitHub), https://registry.npmjs.org/@tanstack/react-query
> 마이그레이션(6절, 구 tanstack-query-v4-to-v5-migration 에서 옮김): https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5 · https://github.com/TanStack/query/blob/main/docs/framework/react/guides/migrating-to-v5.md · https://tanstack.com/blog/announcing-tanstack-query-v5 · https://tkdodo.eu/blog/breaking-react-querys-api-on-purpose
> 검증일: 2026-11-09 (최초 2026-08-11 · 08-26 v5.102 통합 메서드 deprecated 반영 · 09-28 재검증(2차) · 11-09 재검증: 5.107.1까지 추가 deprecated 없음, 5.105.3 `'static'` 판정 변경 반영)
> 기준 버전: `@tanstack/react-query` **5.107.1** (React 18+ / 19 지원)

---

## 이 스킬의 범위

| 스킬 | 다루는 것 |
|------|----------|
| **`frontend/tanstack-query` (이 스킬)** | v5 최신 변경점(5.89 콜백 시그니처·5.102 통합 메서드·5.105.3 `'static'`)과 실측 함정, SSR 구성, v4→v5 마이그레이션(codemod·런타임 함정) |

> 기본 사용법(useQuery·invalidate·useInfiniteQuery 해설)은 공식 문서 수준이라 싣지 않는다. **이미 서버 상태로 분류된 데이터**를 다루는 방법만 다룬다.
>
> 레포 규칙(`.claude/rules/typescript.md`): "서버 상태·캐싱: TanStack Query — `useQuery`, `useMutation` 직접 사용".

---

## 0. 버전 기준 — v5가 현재 안정 메이저다

- **React 어댑터(`@tanstack/react-query`)의 최신 안정 메이저는 v5**다 (검증 시점 5.107.1).
- v6는 **Svelte 어댑터(`@tanstack/svelte-query` v6, Svelte 5 대응, latest 6.4.x)** 와 **Solid 어댑터 v6 RC**(dist-tag `rc`, `latest`는 여전히 5.x)에만 존재한다. 코어는 여전히 v5 계열이다.
  → **React 프로젝트에 "v6로 올려라"라고 조언하면 현재 시점에서 틀린 말이다.**
- v4 → v5 마이그레이션은 6절(codemod 위치·런타임 함정)에 있다.

---

## 1. 자주 틀리는 판단 — staleTime·gcTime·`'static'`

| 판단 | 맞는 답 |
|------|---------|
| "화면 이동할 때마다 요청이 나간다" | 기본 `staleTime: 0` 때문이다 → **`staleTime`** 을 올린다. `gcTime`을 늘려도 요청 수는 그대로다 |
| `gcTime` < `staleTime` | 금지 — 신선 판정 전에 캐시가 사라져 매번 스피너. 규칙 **`gcTime >= staleTime`** |
| 재시도 기본값 | 쿼리 3회(지수 백오프 최대 30s), **서버(SSR)에서는 0회**, 뮤테이션 0회 |
| `staleTime: 'static'` | `Infinity`보다 강하다 — `invalidateQueries()`·`refetchOnMount: 'always'`도 무시. **단 5.105.3부터 데이터가 있을 때만 static** — 데이터가 없는 쿼리(최초 실패·reset 직후)는 reset·invalidate·명시적 refetch 때 다시 가져온다. 배포 단위 상수 같은 진짜 불변 데이터에만 |

```typescript
new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000, retry: 2 } },  // 전역은 "합리적 하한", 쿼리별로 덮어쓴다
})
```

---

## 2. queryKey + `queryOptions` — 서버 prefetch와 공유하는 기본형

- queryFn이 참조하는 **모든 변수를 키에** 넣고, `['todos'] → ['todos','list',filters] → ['todos','detail',id]`처럼 넓은 것→좁은 것으로 쌓는다(무효화가 prefix 매칭이라 이것이 곧 무효화 범위 설계).
- 키 안 객체의 프로퍼티 순서는 무관(결정적 해싱). 문제는 렌더마다 내용이 바뀌는 값(`new Date()`)·직렬화 불가 값(함수·`Map`)·키 누락이다.
- key+fn+옵션을 **`queryOptions()`로 한 덩어리로** 묶어 `useQuery`/`useSuspenseQuery`/prefetch/`setQueryData`에서 같은 정의를 쓴다(무한 쿼리는 `infiniteQueryOptions()`).

```typescript
// queries/todo.ts
import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query'

export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: TodoFilter) => [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
}

export const todoListQuery = (filters: TodoFilter) =>
  queryOptions({
    queryKey: todoKeys.list(filters),
    queryFn: ({ signal }) => fetchTodos(filters, signal),
    staleTime: 60 * 1000,
  })

export const todoDetailQuery = (id: string) =>
  queryOptions({
    queryKey: todoKeys.detail(id),
    queryFn: ({ signal }) => fetchTodo(id, signal),
  })
```

```typescript
useQuery(todoListQuery(filters))
useSuspenseQuery(todoDetailQuery(id))
queryClient.setQueryData(todoDetailQuery(id).queryKey, next)   // 타입 추론됨
const title = useQuery({ ...todoDetailQuery(id), select: (d) => d.title })  // 컴포넌트 단위 덮어쓰기
```

---

## 3. 실측 함정 — 타입은 통과하는데 동작이 틀리는 곳

| 영역 | 함정 | 대응 |
|------|------|------|
| 상태 플래그 | `enabled: false` 쿼리는 `isPending`이 **계속 true** (`isLoading` = `isPending && isFetching`) | 지연 쿼리 스피너는 `isLoading`, 첫 화면 스켈레톤은 `isPending` |
| `skipToken` | `skipToken` 쿼리에 `refetch()` → `Missing queryFn` 에러 | 수동 refetch가 필요하면 `enabled: false` |
| queryFn | `fetch`는 4xx/5xx에 throw하지 않는다 → 404가 "성공"으로 캐시 | `res.ok` 확인 후 throw. `signal`을 넘기지 않으면 취소돼도 요청은 계속 진행 |
| invalidate | `refetchType` 기본 `'active'`, `'none'`은 stale 표시만. `'static'` 쿼리는 invalidate도 무시 | 목록·상세가 함께 바뀌면 상위 키 한 번. `removeQueries`는 스피너를 되살리니 좁게 |
| Suspense | `useSuspenseQuery`는 `enabled`·`placeholderData`가 없고 `cancelQueries`가 안 듣는다. 형제 호출은 워터폴 | 조건부는 `useQuery`, 키 변경은 `startTransition`, 병렬은 `useSuspenseQueries`/부모 prefetch |
| Suspense 에러 | `throwOnError` 기본값 = `(error, query) => typeof query.state.data === 'undefined'` → **캐시가 있으면 refetch 실패가 경계로 안 올라감** | 모두 올리려면 `throwOnError: true`. 경계 재시도는 `useQueryErrorResetBoundary`의 `reset`을 `onReset`에 |
| 무한 쿼리 | stale refetch 시 **첫 페이지부터 전부 순차로 다시** 가져온다(커서 정합성 의도) | `maxPages`로 상한, `staleTime` 넉넉히. 정렬·필터는 키에 넣어 새 쿼리로 분리. `initialPageParam` 필수 |
| 4xx 재시도 | 401에도 기본 3회 재시도 | `retry: (n, e) => e.status >= 500 && n < 2` |

---

## 4. SSR — Next.js App Router (prefetch + HydrationBoundary)

> **주의 (2026-08-26 갱신, v5.102.0+):** `queryClient.prefetchQuery` / `fetchQuery` / `ensureQueryData` / `prefetchInfiniteQuery` / `fetchInfiniteQuery` / `ensureInfiniteQueryData` 는 **`@deprecated`** 표기되었고 통합 메서드 **`queryClient.query(options)` / `queryClient.infiniteQuery(options)`** 로 대체된다(v6에서 제거 예정, 공식 예제·QueryClient 레퍼런스는 이미 신규 메서드 기준). 이 절의 `prefetchQuery` 예시는 v5 전 구간에서 계속 동작하므로 당장 바꿀 필요는 없지만, **신규 코드는 `query()`를 쓴다.** 단순 이름 치환이 아니다:
> - `prefetchQuery` 는 에러를 삼켰지만 `query()` 는 **throw 한다** → prefetch 용도면 `queryClient.query(opts).catch(() => {})`
> - `ensureQueryData` 의 "무효화 무시" 의미는 `query({ ...opts, staleTime: 'static' })` 로 표현
> - `staleTime` 존중은 동일
> 소스: https://tanstack.com/query/v5/docs/react/guides/migrating-to-v5 (Imperative QueryClient methods) · https://github.com/TanStack/query/discussions/9135 · `packages/query-core/src/queryClient.ts` JSDoc

```typescript
// app/get-query-client.ts
import { environmentManager, QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 },   // 하이드레이션 직후 즉시 재요청 방지 — 0이면 안 됨
      dehydrate: {
        // 스트리밍: 아직 pending인 쿼리도 직렬화해서 내려보낸다
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (environmentManager.isServer()) return makeQueryClient()   // 요청마다 새 인스턴스
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient                                     // 브라우저는 싱글턴
}
```

```typescript
// app/todos/page.tsx — Server Component
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'

export default function TodosPage() {
  const queryClient = getQueryClient()

  // await 없이 시작 → 렌더를 막지 않고 스트리밍 (위의 pending 직렬화 설정이 있을 때)
  queryClient.prefetchQuery(todoListQuery({ status: 'open' }))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TodoList />   {/* Client Component: 동일 옵션으로 useQuery/useSuspenseQuery → 캐시 히트 */}
    </HydrationBoundary>
  )
}
```

주의:
- **서버에서 QueryClient를 모듈 최상위 싱글턴으로 두면 요청 간 데이터가 섞인다**(다른 사용자 데이터 유출). 반드시 위 분기 구조를 쓴다.
- 클라이언트 Provider는 `useState(() => makeQueryClient())`로 렌더당 1회 생성한다(`new QueryClient()`를 렌더 본문에 직접 두지 않는다).
- 서버 prefetch와 클라이언트 훅의 **queryKey·queryFn이 정확히 일치**해야 한다 → `queryOptions` 공유가 사실상 필수.
- SSR에서 `staleTime: 0`이면 하이드레이션 직후 똑같은 요청이 한 번 더 나간다.
- `environmentManager.isServer()`는 코어 5.91.1에서 도입됐다. 그 이전 버전은 `isServer` export(현재 deprecated) 또는 `typeof window === 'undefined'`를 쓴다.
- `prefetchQuery`는 절대 throw하지 않는다(에러는 클라이언트에서 다시 표면화된다). 서버에서 에러를 잡아야 하면 `fetchQuery`를 쓴다.

- 호버 프리페치는 `staleTime`을 존중하므로 `staleTime`을 반드시 설정한다(안 하면 매 호버가 실제 요청).

---

## 5. useMutation 콜백 시그니처 (v5.89.0+)

```typescript
useMutation({
  mutationFn,
  onMutate:  (variables, context) => { /* 반환값 = onMutateResult */ },
  onError:   (error, variables, onMutateResult, context) => {},
  onSettled: (data, error, variables, onMutateResult, context) => {},
})
```

- 3번째 인자 이름이 **`onMutateResult`**(onMutate 반환값), 마지막 `context`는 `client`·`meta`를 담은 **MutationFunctionContext**다 — 과거 문서의 `context`(=onMutate 반환값)와 이름이 겹치니 혼동 주의. 기존 3-인자 코드는 그대로 동작한다. 5.89.0 미만은 `(err, variables, context)` 3-인자 형태.
- 낙관적 업데이트는 `cancelQueries` → `getQueryData` 스냅샷(onMutate 안에서) → 불변 `setQueryData` → 실패 시 롤백 → `onSettled` invalidate. 한 화면만 반영되면 캐시 대신 `mutation.variables` + `isPending`으로 그리는 편이 간단하다.

> 전체 예제·흔한 실수 → references/REFERENCE.md

---

## 6. v4 → v5 마이그레이션 — codemod 위치와 런타임 함정만

> 2026-11-11 구 `tanstack-query-v4-to-v5-migration` 스킬에서 옮긴 절(원 검증일 2026-11-09, codemod 실행 검증은 5.104.0 설치본). v4 마지막 = **4.44.0**. React 최소 18.0, TypeScript 최소 4.7. 이름 바꾸기 목록(`cacheTime`→`gcTime` 등)은 공식 가이드 참조.

### 6-1. 패키지 정합

- 코어·devtools·persist-client·sync-storage-persister를 **한 커밋에서 같은 버전**으로 올린다 — v5 서브패키지의 peer는 코어를 자기와 같은 패치 이상(`^5.x.y`)으로 요구한다. 모노레포도 루트에서 한 번에.
- 락파일에 v4/v5 코어가 함께 있으면 컨텍스트가 갈라져 "Provider 안인데 No QueryClient set" 에러 → `npm ls @tanstack/query-core`로 단일 버전 확인.
- v4 eslint 규칙 `prefer-query-object-syntax`·`no-deprecated-options`는 **v5 플러그인에서 삭제**됐다 — v4에 머무는 동안만 쓸 수 있는 정리 게이트다.
- `isInitialLoading`·`structuralSharing` 함수형이 v4 어느 패치부터인지는 확인 못 했다 → 첫 PR은 "4.x → 4.44.0 패치 업"으로 잡는다(> 주의: 미확인).

### 6-2. 공식 codemod — 위치·실행법 (실측)

- 5종(`remove-overloads`·`rename-properties`·`keep-previous-data`·`is-loading`·`rename-hydrate`)이 **v5 패키지 안에만** 있다. v4.44.0 설치본에는 `codemods/v4/`(v3→v4용)만 있다 → v4를 유지한 채 돌리려면 v5 패키지를 따로 설치하거나 `npm pack`으로 받아 스크립트만 쓴다.
- `@tanstack/query-codemods` npm 패키지는 **없다**(404). 경로에 `src/`가 없고 확장자는 **`.cjs`**(`.js`면 `ERR_REQUIRE_ESM`). TS는 `--parser=tsx`를 빼면 변환이 적용되지 않는다.

```bash
npx jscodeshift@latest ./src/ --extensions=ts,tsx --parser=tsx \
  --transform=./node_modules/@tanstack/react-query/build/codemods/v5/remove-overloads/remove-overloads.cjs
# 나머지 4종은 v5/<이름>/<이름>.cjs 로 경로만 교체
```

| 항목 | codemod |
|------|:---:|
| `useQuery`·`useIsFetching`·`useIsMutating`·`invalidateQueries` 류 위치 인자 → 오브젝트 | ✅ `remove-overloads` |
| `useMutation(fn, options)` | ⚠️ 불완전 — 육안 확인 |
| **`useInfiniteQuery` 위치 인자** | ❌ **경고 없이 조용히 건너뜀**(대상 hook 목록에 없음) |
| `cacheTime`→`gcTime`, `useErrorBoundary`→`throwOnError` | ✅ `rename-properties` |
| `keepPreviousData: true` → `placeholderData: keepPreviousData` | ✅ 부분 — `true` 리터럴만, 그 외 값은 경고 후 건너뜀 |
| `isLoading`→`isPending`, `'loading'`→`'pending'` | ⚠️ `is-loading`은 맹목 치환 — 6-3 #1 판별 없이 돌리지 않는다 |
| `Hydrate` → `HydrationBoundary` | ✅ `rename-hydrate`(alias import 포함) |
| 쿼리 `onSuccess`/`onError` 제거, `initialPageParam`, `refetchPage`→`maxPages`, `context` prop, devtools·persist | ❌ 수동 |

- "0 errors"를 전부 처리됐다는 뜻으로 믿지 말고, 실패 로그(파일·라인)를 수거해 수동 목록으로 만든다. 실행 뒤 Prettier/ESLint로 포맷 복구.

### 6-3. 타입 에러 없이 동작만 바뀌는 항목 (QA 집중 대상)

| # | 항목 | v4 → v5 | 증상 |
|---|------|---------|------|
| 1 | `isLoading` | "데이터 없음" → `isPending && isFetching` | `enabled` 쿼리의 스켈레톤/스피너가 뒤바뀜. `enabled`·`skipToken` 없는 쿼리만 `isPending`으로 안전 치환, 있는 쿼리는 의도를 판별 |
| 2 | `status === 'loading'` | 항상 거짓(`'pending'`) | JS·로깅·테스트 픽스처는 TS가 못 잡는다 |
| 3 | `getNextPageParam`이 `null` | v4 `fetchNextPage()` 가드는 `undefined`만 막아 `null`이면 **요청 1회 더**, v5는 `== null`로 둘 다 차단 | `hasNextPage` 확인 없이 부르는 IntersectionObserver 트리거에서 v4 과잉 fetch(query-core 4.44.0/5.104.0 소스 대조) |
| 4 | `useQuery`의 `onSuccess`/`onError` | 옵션 자체가 무시됨 | 인라인 리터럴이면 `TS2769`로 잡히지만, **옵션을 변수에 담아 넘기면 조용히 사라진다**(토스트·분석 이벤트 유실) |
| 5 | `dehydrateQueries`/`dehydrateMutations` | 알 수 없는 키로 무시 | persist 저장 범위가 바뀜 |
| 6 | 포커스 refetch | `focus`+`visibilitychange` → `visibilitychange`만 | refetch가 덜 일어남 |
| 7 | 오프라인 판정 | `navigator.onLine` 미사용, 기본 `online: true` | `fetchStatus: 'paused'`·오프라인 배너 타이밍 변화 |
| 8 | `setQueryDefaults` 다중 등록 | 첫 매칭만 → **전부 병합** | 등록 순서를 일반 → 구체로 |
| 9 | `refetchInterval` 콜백 첫 인자 | `data` → `query` | 폴링이 안 멈추거나 즉시 멈춤 |
| 10 | 에러 기본 타입 | `unknown` → `Error` | Error 아닌 값을 throw하는 queryFn에서 `error.message`가 런타임 `undefined` |
| 11 | `isPreviousData` | 없음(`isPlaceholderData`) | 페이지 버튼 disable이 항상 false |
| 12 | 내부 private 필드 | ECMAScript `#` — 접근 불가 | 캐시 내부를 뚫던 테스트 헬퍼가 `undefined` |
| 13 | persist `buster` 미변경 | 구 포맷 캐시 복원 | 배포 직후 화이트스크린 → 전환 배포에서 `buster` 값을 바꾼다 |

- 스프레드로 합쳐지는 옵션 객체·공용 옵션 상수 안의 `cacheTime` 등은 초과 프로퍼티 검사에 안 걸린다 → `tsc` 뒤에 grep으로 잔재 확인:
  `rg -n "cacheTime|useErrorBoundary|keepPreviousData|isPreviousData|isDataEqual|refetchPage|hashQueryKey|contextSharing|useHydrate|<Hydrate|dehydrateQueries|suspense:\s*true" src/`
- 롤백 기준: 화면 요청 수 배 이상 증가(`defaultOptions`·`staleTime` 유실) / `No QueryClient set`(코어 중복) / persist 복원 화이트스크린(`buster` 미변경).

---

## 7. 리뷰 체크리스트

- [ ] queryKey에 queryFn이 쓰는 모든 변수가 들어 있는가
- [ ] key + fn을 `queryOptions`로 묶어 서버 prefetch와 공유하는가
- [ ] `staleTime`을 데이터 성격에 맞게 지정했는가(기본 0 방치 아님)
- [ ] `gcTime >= staleTime`인가
- [ ] 낙관적 업데이트에 `cancelQueries` → 스냅샷 → 롤백 → `onSettled` invalidate 4단계가 다 있는가
- [ ] invalidate 범위가 의도적으로 좁혀져 있는가(`exact`/`lists()`/`refetchType`)
- [ ] queryFn이 HTTP 에러에서 throw하고 `signal`을 전달하는가
- [ ] 4xx에 재시도하지 않는가
- [ ] 서버 데이터가 전역 스토어에 중복 저장돼 있지 않은가
- [ ] SSR: QueryClient가 요청마다 생성되는가 / `HydrationBoundary`로 감쌌는가
- [ ] 신규 코드는 `queryClient.query()`/`infiniteQuery()`를 쓰는가(prefetch 용도면 `.catch(() => {})`)
- [ ] (v4에서 올렸다면) 서브패키지 동일 버전·`npm ls @tanstack/query-core` 단일·6-3 함정 QA·persist `buster` 변경

---

> 상세 레퍼런스 (useMutation 낙관적 업데이트·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
