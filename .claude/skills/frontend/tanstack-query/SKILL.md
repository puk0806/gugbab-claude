---
name: tanstack-query
description: TanStack Query(React Query) v5 실전 사용 패턴 — queryKey 설계·staleTime/gcTime·낙관적 업데이트·invalidate 범위·Suspense·무한스크롤·App Router SSR
---

# TanStack Query v5 실전 패턴

> 소스: https://tanstack.com/query/latest/docs/framework/react (공식 문서)
> 보조 소스: https://github.com/TanStack/query (공식 GitHub), https://registry.npmjs.org/@tanstack/react-query
> 검증일: 2026-08-26 (최초 2026-08-11 · 08-26에 v5.102 통합 메서드 deprecated 반영)
> 기준 버전: `@tanstack/react-query` **5.101.4** (React 18+ / 19 지원)

---

## 이 스킬의 범위 — state-management와의 역할 분리

| 스킬 | 다루는 것 |
|------|----------|
| `frontend/state-management` | **무엇을 어디에 둘지** — 서버 상태 / 전역 클라이언트 상태(Zustand) / 지역 상태 선택 기준, Zustand 사용법, 두 도구 조합 원칙 |
| **`frontend/tanstack-query` (이 스킬)** | **TanStack Query를 실제로 어떻게 쓰는지** — 캐시 수명 튜닝, 키 설계, 뮤테이션·낙관적 업데이트, 무효화 범위, Suspense·SSR·에러 경계 연동 |

> "이 데이터를 Query에 둘지 Zustand에 둘지" 판단이 필요하면 `frontend/state-management`를 먼저 본다.
> 이 스킬은 **이미 서버 상태로 분류된 데이터**를 다루는 방법만 다룬다.
>
> 레포 규칙(`.claude/rules/typescript.md`): "서버 상태·캐싱: TanStack Query — `useQuery`, `useMutation` 직접 사용".

---

## 0. 버전 기준 — v5가 현재 안정 메이저다

- **React 어댑터(`@tanstack/react-query`)의 최신 안정 메이저는 v5**다 (검증 시점 5.101.4).
- v6는 **Svelte 어댑터(`@tanstack/svelte-query` v6, Svelte 5 대응)** 와 **Solid 어댑터 v6 beta**에만 존재한다. 코어는 여전히 v5 계열이다.
  → **React 프로젝트에 "v6로 올려라"라고 조언하면 현재 시점에서 틀린 말이다.**
- v4 → v5 마이그레이션(단일 객체 인자, `cacheTime`→`gcTime`, `useQuery`의 `onSuccess`/`onError` 제거, `isLoading`→`isPending`)은
  `frontend/state-management` 스킬의 "v4 → v5 주요 변경사항"에 정리돼 있다. 여기서는 반복하지 않는다.

---

## 1. 멘탈 모델 — 두 축을 분리해서 본다

캐시된 각 쿼리는 **독립된 두 축**의 상태를 가진다. 이걸 섞어서 이해하면 `staleTime`/`gcTime`을 반드시 틀린다.

```
축 1: 신선도(freshness)   fresh ──staleTime 경과──▶ stale
       └ "refetch를 트리거할 것인가"를 결정

축 2: 활성도(activity)    active ──관찰자 0개──▶ inactive ──gcTime 경과──▶ 캐시에서 삭제
       └ "메모리에 얼마나 남겨둘 것인가"를 결정
```

- **fresh** = 어떤 트리거(마운트/포커스/재연결)가 와도 네트워크 요청 없음. 캐시에서만 읽는다.
- **stale** = 트리거가 오면 백그라운드 refetch. 그동안 **기존 데이터는 계속 보여준다**(stale-while-revalidate).
- **inactive** = 그 키를 구독하는 컴포넌트가 하나도 없는 상태. gcTime 타이머는 이때부터 돈다.

---

## 2. staleTime vs gcTime — 가장 많이 틀리는 지점

| 옵션 | 기본값 | 의미 | 잘못된 이해 |
|------|--------|------|------------|
| `staleTime` | **0** | 데이터를 "신선"하다고 볼 시간. 이 시간 안에는 refetch를 **안 한다** | ❌ "캐시 유지 시간" |
| `gcTime` | **5분** | **inactive가 된 뒤** 캐시에서 지워지기까지의 시간 (v4의 `cacheTime`) | ❌ "이 시간 지나면 다시 fetch한다" |

**핵심 정리:**

1. `staleTime: 0`(기본)이므로 기본 설정에서는 **컴포넌트가 마운트될 때마다 백그라운드 refetch가 돈다.**
   "왜 화면 이동할 때마다 요청이 나가지?"의 원인은 거의 항상 이것이다. → 해결책은 `gcTime`이 아니라 **`staleTime`** 을 올리는 것.
2. `gcTime`을 늘려도 refetch 횟수는 **줄지 않는다.** 캐시가 남아 "즉시 이전 데이터가 보이는" 효과만 커진다.
3. `gcTime`을 `staleTime`보다 **작게 두면 안 된다.** 신선하다고 판단하기도 전에 캐시가 사라져 매번 스피너가 뜬다.
   → 규칙: **`gcTime >= staleTime`**.
4. `staleTime`은 **함수**도 받는다: `staleTime: (query) => ...` — 응답의 `max-age` 등에 맞출 때 쓴다.
5. `staleTime: 'static'` — `Infinity`보다 강하다. `invalidateQueries()`로도 stale이 되지 않고 `refetchOnMount: 'always'` 류도 무시한다.
   진짜 불변 데이터(배포 단위 상수, 이미 확정된 과거 문서)에만 쓴다.

**선택 기준 (기본값 대신 쓸 값):**

| 데이터 성격 | staleTime | gcTime | 예 |
|------------|-----------|--------|-----|
| 거의 안 변함 | `Infinity` 또는 `'static'` | 기본(5분)~`Infinity` | 코드 테이블, 국가 목록, 약관 |
| 하루 단위 변동 | 5~30분 | staleTime 이상 | 사용자 프로필, 설정 |
| 자주 변동, 즉시성 중요 | 0~30초 | 5분 | 대시보드 지표, 알림 수 |
| 실시간성 필수 | 0 + `refetchInterval` | 5분 | 주문 상태, 채팅 목록 |

```typescript
// 전역 기본값은 "합리적 하한"으로 잡고 쿼리별로 덮어쓴다
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,   // 1분 — 마운트마다 도는 refetch 폭풍 방지
      gcTime: 5 * 60 * 1000,  // 기본값과 동일(명시 목적)
      retry: 2,               // 기본 3회 + 지수 백오프(1s→2s→4s… 최대 30s)
    },
  },
})
```

> 참고: 실패한 쿼리는 기본 **3회** 재시도하며 지연은 `Math.min(1000 * 2 ** attemptIndex, 30000)`이다.
> **서버(SSR)에서는 retry 기본값이 0**이다. 뮤테이션은 기본 **0회**(재시도 안 함).

---

## 3. queryKey 설계 — 캐시 식별자이자 의존성 배열

### 규칙

1. **항상 배열**이며 JSON 직렬화 가능해야 한다.
2. **queryFn이 참조하는 모든 변수를 키에 포함**한다. React 훅의 의존성 배열과 같은 역할이다.
3. **넓은 것 → 좁은 것** 순서로 계층을 쌓는다: `['todos'] → ['todos','list',filters] → ['todos','detail',id]`.
   무효화가 prefix 매칭이므로 이 계층 설계가 곧 **무효화 범위 설계**다.
4. 배열 **원소의 순서는 의미가 있다**(`['todos', 5]` ≠ `[5, 'todos']`).
   반면 **키 안 객체의 프로퍼티 순서는 무관**하다 — 결정적으로 해싱되므로 `{status, page}`와 `{page, status}`는 같은 키다.

### query key factory + `queryOptions` 헬퍼 (권장 기본형)

키만 모아두는 factory보다 **`queryOptions()`로 key+fn+옵션을 한 덩어리로 묶는 방식**이 v5의 권장 형태다.
런타임에는 인자를 그대로 반환할 뿐이지만, TypeScript 추론이 전 구간(`useQuery`/`useSuspenseQuery`/`prefetchQuery`/`setQueryData`)에서 유지된다.

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
// 같은 정의를 어디서나 재사용 — 키/타입 불일치가 구조적으로 불가능해진다
useQuery(todoListQuery(filters))
useSuspenseQuery(todoDetailQuery(id))
queryClient.prefetchQuery(todoListQuery(filters))
queryClient.setQueryData(todoDetailQuery(id).queryKey, next)   // 타입 추론됨

// 컴포넌트 단위 옵션만 덮어쓰기
const title = useQuery({ ...todoDetailQuery(id), select: (d) => d.title })
```

> 무한 쿼리는 `infiniteQueryOptions()`를 쓴다.

---

## 4. useQuery 실전 옵션

```typescript
const { data, isPending, isLoading, isFetching, isError, error, refetch } = useQuery({
  ...todoListQuery(filters),
  enabled: !!userId,                      // 조건부 실행 (함수도 가능)
  select: (d) => d.items,                 // 파생 데이터 — select 결과가 바뀔 때만 리렌더
  placeholderData: keepPreviousData,      // 페이지/필터 전환 시 이전 데이터 유지(깜빡임 제거)
  refetchInterval: 30_000,                // 폴링
  notifyOnChangeProps: ['data', 'error'], // 리렌더 트리거 축소(고빈도 화면)
})
```

**상태 플래그 구분:**

| 플래그 | 참인 조건 | 용도 |
|--------|----------|------|
| `isPending` | 캐시된 데이터가 아직 없음(status === 'pending') | 첫 화면 스켈레톤 |
| `isLoading` | **첫 fetch가 진행 중**(`isPending && isFetching`) | 지연(lazy) 쿼리의 스피너 |
| `isFetching` | queryFn 실행 중(백그라운드 refetch 포함) | 상단 미세 로딩 인디케이터 |

- `enabled: false`인 쿼리는 `isPending`이 계속 true다. **비활성 쿼리 UI 분기에는 `isLoading`을 쓴다.**
- TypeScript에서 "인자가 없으면 실행 안 함"을 타입 안전하게 표현하려면 `queryFn: skipToken`을 쓴다.
  단, `skipToken` 쿼리에 `refetch()`를 호출하면 `Missing queryFn` 에러가 난다 → 수동 refetch가 필요하면 `enabled: false`.
- **queryFn은 실패 시 반드시 throw(또는 reject)** 해야 한다. `fetch`는 4xx/5xx에 throw하지 않으므로 직접 던진다.
- `signal`을 queryFn에 넘기면(`fetch(url, { signal })`, axios 0.22+ `{ signal }`) 쿼리 취소 시 실제 요청도 중단된다.
  signal을 소비하지 않으면 언마운트해도 요청은 그대로 진행된다.

---

## 5. useMutation + 낙관적 업데이트 전체 흐름

### 5-1. 콜백 시그니처 (v5.89.0+ 주의)

```typescript
useMutation({
  mutationFn,
  onMutate:   (variables, context) => { /* 반환값 = onMutateResult */ },
  onSuccess:  (data, variables, onMutateResult, context) => {},
  onError:    (error, variables, onMutateResult, context) => {},
  onSettled:  (data, error, variables, onMutateResult, context) => {},
})
```

> **주의:** v5.89.0에서 콜백 시그니처가 확장됐다. `onMutate`가 반환한 롤백용 값은 이제 **`onMutateResult`(3번째 인자)** 라는 이름이며,
> 마지막 `context`는 `client`·`meta`를 담은 **MutationFunctionContext**다(과거 문서의 `context`와 이름이 겹치니 혼동 주의).
> 3번째 위치가 여전히 onMutate 반환값이라 기존 3-인자 코드는 동작하지만, **네이밍은 새 규약을 따른다.**
> 5.89.0 미만을 쓰는 프로젝트라면 `(err, variables, context)` 3-인자 형태가 맞다.

### 5-2. 캐시 롤백 방식 (여러 화면이 같은 데이터를 보여줄 때)

```typescript
export function useUpdateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTodo,

    // 1) 낙관적 반영 + 스냅샷
    onMutate: async (newTodo) => {
      // 진행 중인 refetch가 낙관값을 덮어쓰지 않도록 먼저 취소
      await queryClient.cancelQueries({ queryKey: todoKeys.detail(newTodo.id) })

      const previous = queryClient.getQueryData(todoKeys.detail(newTodo.id))

      // 반드시 불변 갱신
      queryClient.setQueryData(todoKeys.detail(newTodo.id), (old) => ({ ...old, ...newTodo }))

      return { previous }        // → onMutateResult
    },

    // 2) 실패 시 스냅샷으로 롤백
    onError: (_err, newTodo, onMutateResult) => {
      queryClient.setQueryData(todoKeys.detail(newTodo.id), onMutateResult?.previous)
    },

    // 3) 성공/실패 무관하게 서버 진실로 재동기화
    onSettled: (_data, _err, newTodo) => {
      queryClient.invalidateQueries({ queryKey: todoKeys.detail(newTodo.id) })
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
  })
}
```

체크포인트:
- `cancelQueries` 없이 낙관적 업데이트를 하면, 뮤테이션 직전에 시작된 refetch 응답이 낙관값을 되돌려 **깜빡임/되감김**이 생긴다.
- 롤백 스냅샷은 반드시 `onMutate` 안에서 `getQueryData`로 뜬다(외부 변수 캡처 금지 — 동시 뮤테이션에서 꼬인다).
- `setQueryData`는 **불변 갱신**이어야 한다. `old.push(...)` 금지.
- 최종 정합성은 `onSettled`의 invalidate가 책임진다. 낙관값이 서버 결과와 달라도 여기서 수렴한다.

### 5-3. UI 변수 방식 (한 곳에만 보이면 이게 더 간단하다)

캐시를 건드리지 않고 `mutation.variables` + `isPending`으로 임시 항목을 그리는 방법. 롤백 코드가 필요 없다.

```typescript
const addTodo = useMutation({
  mutationFn: createTodo,
  onSettled: () => queryClient.invalidateQueries({ queryKey: todoKeys.lists() }),
})

{addTodo.isPending && <TodoRow todo={addTodo.variables} style={{ opacity: 0.5 }} />}
{addTodo.isError && <RetryRow onRetry={() => addTodo.mutate(addTodo.variables)} />}
```

> 선택 기준: **한 화면에서만 반영되면 variables 방식**, **여러 화면·목록이 같은 데이터를 동시에 보여주면 캐시 방식**.
> 다른 컴포넌트에서 진행 상태를 읽어야 하면 `mutationKey` + `useMutationState`를 쓴다.

### 5-4. mutate vs mutateAsync

- 기본은 `mutate` — 에러가 unhandled rejection이 되지 않는다.
- `mutateAsync`는 Promise를 반환하지만 **직접 try/catch 하지 않으면 unhandled rejection**이다. 순차 실행이 꼭 필요할 때만 쓴다.
- 같은 리소스에 대한 뮤테이션 직렬화가 필요하면 `scope: { id: 'todo' }`를 쓴다.
- 훅 레벨 콜백이 먼저, `mutate(vars, { onSuccess })`의 콜백이 나중에 실행된다.

---

## 6. invalidateQueries — 범위를 의도적으로 지정한다

```typescript
// 1) prefix 매칭(기본) — ['todos', ...]로 시작하는 모든 쿼리
queryClient.invalidateQueries({ queryKey: todoKeys.all })

// 2) 목록만 (상세 캐시는 유지)
queryClient.invalidateQueries({ queryKey: todoKeys.lists() })

// 3) 정확히 그 키 하나만
queryClient.invalidateQueries({ queryKey: todoKeys.detail(id), exact: true })

// 4) 조건 지정
queryClient.invalidateQueries({
  predicate: (query) => query.queryKey[0] === 'todos' && (query.queryKey[2] as any)?.status === 'done',
})

// 5) refetch 대상 제어
queryClient.invalidateQueries({ queryKey: todoKeys.all, refetchType: 'none' })
```

`refetchType` 값:

| 값 | 동작 |
|----|------|
| `'active'` (기본) | 현재 렌더링 중인 쿼리만 즉시 refetch |
| `'inactive'` | 화면에 없는 쿼리만 refetch |
| `'all'` | 전부 refetch |
| `'none'` | stale 표시만, 즉시 refetch 없음(다음 마운트 때 갱신) |

원칙:
- **무효화는 넓게, 삭제(`removeQueries`)는 좁게.** invalidate는 stale 표시일 뿐이라 비용이 낮고, `removeQueries`는 스피너를 되살린다.
- `invalidateQueries`는 `staleTime`을 무시하고 stale로 만든다. 단 `staleTime: 'static'`은 예외다.
- 목록·상세가 함께 바뀌는 뮤테이션이면 `todoKeys.all` 한 번이 `lists()`+`detail()` 두 번보다 낫다.

---

## 7. Suspense 연동 — useSuspenseQuery

```typescript
function TodoDetail({ id }: { id: string }) {
  // data는 항상 정의됨 — 로딩/에러는 경계가 처리
  const { data } = useSuspenseQuery(todoDetailQuery(id))
  return <h1>{data.title}</h1>
}

<ErrorBoundary fallback={<Error />}>
  <Suspense fallback={<Skeleton />}>
    <TodoDetail id={id} />
  </Suspense>
</ErrorBoundary>
```

제약(문서 명시):
- **`enabled`를 지원하지 않는다.** `data`가 항상 정의됨을 타입으로 보장하기 때문이다. 조건부 실행이 필요하면 `useQuery`를 쓴다.
- **`placeholderData`가 없다.** 키가 바뀔 때 화면이 fallback으로 대체되는 걸 막으려면 키 변경을 `startTransition`으로 감싼다.
- **쿼리 취소(`cancelQueries`)가 동작하지 않는다.**
- 형제 컴포넌트에서 각각 호출하면 **워터폴**이 생긴다. 병렬이 필요하면 `useSuspenseQueries` 또는 부모에서 prefetch.
- 무한 스크롤용 `useSuspenseInfiniteQuery`도 있다.

---

## 8. 에러 처리와 ErrorBoundary 연계

```typescript
// 1) 렌더 트리 안에서 에러를 던지게 한다
useQuery({ ...todoDetailQuery(id), throwOnError: true })

// 2) 5xx만 경계로 올리고 4xx는 컴포넌트에서 처리
useQuery({
  ...todoDetailQuery(id),
  throwOnError: (error) => (error as HttpError).status >= 500,
  retry: (count, error) => (error as HttpError).status >= 500 && count < 2, // 4xx 재시도 금지
})
```

```typescript
// 3) 경계에서 "다시 시도" — 쿼리 에러 상태까지 리셋해야 재요청이 된다
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

function Boundary({ children }: { children: React.ReactNode }) {
  const { reset } = useQueryErrorResetBoundary()
  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ resetErrorBoundary }) => (
        <button onClick={resetErrorBoundary}>다시 시도</button>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
```

- **Suspense 훅의 `throwOnError` 기본값**은 `(error, query) => typeof query.state.data === 'undefined'`다.
  즉 **캐시 데이터가 있으면 refetch 실패는 경계로 올라가지 않고 이전 데이터가 계속 보인다.** 모든 에러를 올리려면 `throwOnError: true`를 명시한다.
- 뮤테이션 에러는 경계보다 **인라인 피드백(토스트/폼 에러)** 이 낫다. 사용자가 방금 한 행동의 결과이기 때문이다.
- 전역 공통 처리(로깅, 인증 만료)는 `QueryCache`/`MutationCache`의 `onError`에 둔다.
- 사용자에게 보이는 메시지에 스택·엔드포인트를 노출하지 않는다(레포 규칙 `typescript.md`).

---

## 9. 무한 스크롤 — useInfiniteQuery

```typescript
export const todoFeedQuery = () =>
  infiniteQueryOptions({
    queryKey: [...todoKeys.all, 'feed'] as const,
    queryFn: ({ pageParam, signal }) => fetchFeed({ cursor: pageParam, limit: 20 }, signal),
    initialPageParam: null as string | null,                      // 필수
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,  // null/undefined면 끝
    // getPreviousPageParam: (firstPage) => firstPage.prevCursor ?? null,
    maxPages: 5,                                                  // 보관 페이지 상한(메모리·refetch 비용 제어)
  })

const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(todoFeedQuery())
const items = data?.pages.flatMap((p) => p.items) ?? []
```

- 반환 데이터는 `{ pages: TPage[], pageParams: unknown[] }` 구조다. 렌더 전에 `flatMap`으로 평탄화한다.
- **stale 상태에서 refetch되면 첫 페이지부터 순차적으로 전부 다시 가져온다.** 커서 정합성을 위한 의도된 동작이며,
  페이지가 많이 쌓인 피드에서는 비용이 크다 → `maxPages`로 상한을 두거나 `staleTime`을 넉넉히 준다.
- 정렬·필터가 바뀌면 **키에 포함**시켜 새 무한 쿼리로 분리한다(같은 키에 이어붙이면 커서가 깨진다).
- 커서가 없는 API면 `pageParam`을 페이지 번호로 두고 `getNextPageParam: (last, all) => last.hasMore ? all.length + 1 : undefined`.

---

## 10. SSR — Next.js App Router (prefetch + HydrationBoundary)

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

**호버 프리페치(체감 속도 개선):**

```typescript
<Link onMouseEnter={() => queryClient.prefetchQuery(todoDetailQuery(id))} href={`/todos/${id}`} />
```
`prefetchQuery`는 `staleTime`을 존중하므로, 매 호버가 실제 요청이 되지 않도록 `staleTime`을 반드시 설정한다.
"캐시에 있으면 그대로 쓰고 없으면 가져온다"(staleTime 무시)가 필요하면 `ensureQueryData`.

---

## 11. 흔한 실수

### ❌ useEffect로 수동 fetch 후 setState

```typescript
// ❌ 중복 요청·경쟁 조건·캐시 없음·취소 없음·에러/로딩 수동 관리
useEffect(() => {
  let alive = true
  setLoading(true)
  fetch(`/api/todos/${id}`).then(r => r.json()).then(d => alive && setTodo(d))
  return () => { alive = false }
}, [id])

// ✅
const { data, isPending, isError } = useQuery(todoDetailQuery(id))
```
StrictMode 이중 실행, 응답 순서 역전(늦게 온 옛 응답이 최신 값을 덮어씀), 화면 복귀 시 갱신 없음 — 전부 Query가 해결하는 문제다.

### ❌ queryKey에 불안정한 값 넣기

```typescript
// ❌ 렌더마다 값이 달라지는 것 → 매 렌더 새 캐시 엔트리 + 무한 요청
useQuery({ queryKey: ['todos', new Date()], queryFn: fetchTodos })
useQuery({ queryKey: ['todos', () => filterFn], queryFn: fetchTodos })  // 함수는 직렬화 불가

// ✅ 안정적인 원시값 / 직렬화 가능한 객체만
useQuery({ queryKey: ['todos', { status, page }], queryFn: () => fetchTodos({ status, page }) })
```
> 정정: **인라인 객체 리터럴 자체는 문제가 아니다.** 키는 결정적으로 해싱되며 프로퍼티 순서도 무관하다.
> 진짜 문제는 ① 렌더마다 **내용이 달라지는 값**(`new Date()`, `Math.random()`, 매번 순서가 바뀌는 배열),
> ② **직렬화 불가능한 값**(함수, 클래스 인스턴스, `Map`/`Set`),
> ③ 반대로 **queryFn이 쓰는 변수를 키에서 누락**해 필터를 바꿔도 캐시가 그대로인 경우다.

### ❌ 서버 데이터를 전역 상태 라이브러리에 복사

```typescript
// ❌ Query로 받아서 Zustand/Redux에 다시 저장 → 진실의 원천 2개, 동기화 지옥
const { data } = useQuery(todoListQuery(f))
useEffect(() => { setTodos(data) }, [data])

// ✅ 캐시가 곧 스토어다. 필요한 컴포넌트에서 같은 키로 useQuery를 다시 호출한다(중복 요청 안 남)
const { data } = useQuery(todoListQuery(f))

// ✅ 파생값이 필요하면 select
const doneCount = useQuery({ ...todoListQuery(f), select: (d) => d.filter(t => t.done).length })

// ✅ 전역 스토어에는 "선택된 id" 같은 클라이언트 상태만 둔다 (→ frontend/state-management)
```

### ❌ 기타

| 실수 | 결과 | 수정 |
|------|------|------|
| `staleTime`은 두고 `gcTime`만 늘림 | 요청 수 그대로 | `staleTime`을 올린다 |
| `enabled` 없이 id가 undefined인 채 호출 | `/api/todos/undefined` 요청 | `enabled: !!id` 또는 `skipToken` |
| queryFn에서 `res.ok` 확인 안 함 | 404 응답이 "성공"으로 캐시됨 | 상태 확인 후 throw |
| `onMutate`에서 `cancelQueries` 생략 | 낙관값 되감김 | 스냅샷 전에 `cancelQueries` |
| 뮤테이션 후 `setQueryData`만 하고 invalidate 없음 | 서버 파생 필드(updatedAt 등) 불일치 | `onSettled`에서 invalidate |
| 인증 401에도 3회 재시도 | 로그인 지연·서버 부하 | `retry: (n, e) => e.status >= 500 && n < 2` |
| 모듈 최상위 `new QueryClient()` (SSR) | 요청 간 캐시 공유 = 데이터 유출 | `getQueryClient()` 분기 |
| `useSuspenseQuery`에 `enabled` 사용 | 지원 안 됨 | `useQuery`로 전환 |

---

## 12. 리뷰 체크리스트

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
