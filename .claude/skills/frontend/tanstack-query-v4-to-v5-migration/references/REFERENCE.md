## 3. Breaking Change 전수 (before → after)

### 3-1. 단일 시그니처 — 오브젝트 인자만 허용

```tsx
// ❌ v4
useQuery(['todos'], fetchTodos, { staleTime: 5000 })
useInfiniteQuery(['feed'], fetchFeed, { getNextPageParam })
useMutation(createTodo, { onSuccess })
useIsFetching(['todos'])
useIsMutating(['todos'])

// ✅ v5
useQuery({ queryKey: ['todos'], queryFn: fetchTodos, staleTime: 5000 })
useInfiniteQuery({ queryKey: ['feed'], queryFn: fetchFeed, getNextPageParam, initialPageParam: 0 })
useMutation({ mutationFn: createTodo, onSuccess })
useIsFetching({ queryKey: ['todos'] })
useIsMutating({ mutationKey: ['todos'] })
```

QueryClient 메서드도 동일하다.

```tsx
// ❌ v4
queryClient.invalidateQueries(['todos'], { exact: true })
queryClient.removeQueries(['todos'])
queryClient.resetQueries(['todos'])
queryClient.cancelQueries(['todos'])
queryClient.refetchQueries(['todos'])
queryClient.setQueriesData(['todos'], updater)
queryClient.getQueriesData(['todos'])
queryClient.isFetching(['todos'])

// ✅ v5
queryClient.invalidateQueries({ queryKey: ['todos'], exact: true })
queryClient.removeQueries({ queryKey: ['todos'] })
queryClient.resetQueries({ queryKey: ['todos'] })
queryClient.cancelQueries({ queryKey: ['todos'] })
queryClient.refetchQueries({ queryKey: ['todos'] })
queryClient.setQueriesData({ queryKey: ['todos'] }, updater)
queryClient.getQueriesData({ queryKey: ['todos'] })
queryClient.isFetching({ queryKey: ['todos'] })
```

### 3-2. `getQueryData` / `getQueryState` — queryKey만 받는다

```tsx
// ❌ v4 — 2번째 filters 인자 지원
queryClient.getQueryData(queryKey, filters)
queryClient.getQueryState(queryKey, filters)

// ✅ v5
queryClient.getQueryData(queryKey)
queryClient.getQueryState(queryKey)
```

> 이건 "오브젝트로 감싸라"가 아니라 **인자 자체가 사라진 것**이다. codemod가 오브젝트로 감싸버리면 오히려 틀린다 — 육안 확인 대상.

### 3-3. `isLoading` / `status` 이름 변경 — 가장 위험한 항목

```tsx
// ❌ v4
const { data, isLoading, status } = useQuery(['todos'], fetchTodos)
if (status === 'loading') return <Skeleton />
if (isLoading) return <Skeleton />

// ✅ v5
const { data, isPending, status } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })
if (status === 'pending') return <Skeleton />
if (isPending) return <Skeleton />
```

**세 플래그의 대응 관계 (이 문서에서 가장 중요한 표):**

| v4 | v5 | 의미 |
|----|----|------|
| `status === 'loading'` | `status === 'pending'` | 캐시 데이터가 아직 없음 |
| `isLoading` | **`isPending`** | 캐시 데이터가 아직 없음 (`status === 'pending'`) |
| `isInitialLoading` | **`isLoading`** | 첫 fetch 진행 중 (`isPending && isFetching`) |
| — | `isInitialLoading` | v5에서 `isLoading`의 **deprecated 별칭**. 다음 메이저에서 제거 |

> **`isLoading`이라는 이름이 v4/v5 양쪽에 존재하지만 의미가 다르다.** 이름을 안 바꾸면 타입 에러가 나지 않고 **동작만 조용히 바뀐다.**
> → 섹션 4-1의 판별 절차를 반드시 거친다.

뮤테이션도 동일하게 `status: 'loading'` → `'pending'`, `isLoading` → `isPending`이다(뮤테이션에는 새 `isLoading`이 없다).

```tsx
// ❌ v4
const { isLoading } = useMutation(createTodo)
// ✅ v5
const { isPending } = useMutation({ mutationFn: createTodo })
```

### 3-4. `cacheTime` → `gcTime`

```tsx
// ❌ v4
new QueryClient({ defaultOptions: { queries: { cacheTime: 10 * 60 * 1000 } } })
useQuery(['todos'], fetchTodos, { cacheTime: 0 })

// ✅ v5
new QueryClient({ defaultOptions: { queries: { gcTime: 10 * 60 * 1000 } } })
useQuery({ queryKey: ['todos'], queryFn: fetchTodos, gcTime: 0 })
```

이름만 바뀌었고 **의미는 동일**하다("쿼리가 unused가 된 뒤 캐시에서 수거되기까지의 시간").
`gc` = garbage collect. 기본값 5분도 그대로다. → 개념 설명은 `frontend/tanstack-query` 섹션 2 참조.

### 3-5. `keepPreviousData` → `placeholderData: keepPreviousData`

```tsx
// ❌ v4
const { data, isPreviousData } = useQuery(['todos', page], () => fetchPage(page), {
  keepPreviousData: true,
})

// ✅ v5
import { keepPreviousData } from '@tanstack/react-query'

const { data, isPlaceholderData } = useQuery({
  queryKey: ['todos', page],
  queryFn: () => fetchPage(page),
  placeholderData: keepPreviousData,   // 또는 (previousData) => previousData
})
```

- 반환 플래그도 `isPreviousData` → **`isPlaceholderData`** 로 바뀐다(페이지네이션 버튼 disable 로직이 여기 걸려 있는 경우가 많다).
- `keepPreviousData`는 이제 **import해서 쓰는 identity 함수**다. `true`가 아니다.

### 3-6. `useQuery`의 `onSuccess`/`onError`/`onSettled` **제거** (뮤테이션은 유지)

```tsx
// ❌ v4 — 쿼리 콜백
useQuery(['todos'], fetchTodos, {
  onSuccess: (data) => setLocalState(data),
  onError: (err) => toast.error(err.message),
  onSettled: () => log('done'),
})

// ✅ v5 — 쿼리에는 이 옵션 자체가 없다
useQuery({ queryKey: ['todos'], queryFn: fetchTodos })
```

> **제거 이유(메인테이너 설명):** 콜백이 **일관되지 않게** 실행됐기 때문이다.
> `staleTime`이 설정된 상태에서 키가 바뀌어 캐시 히트가 나면 `onSuccess`가 **아예 실행되지 않는다.**
> 즉 v4 코드가 이미 "가끔만 도는" 버그를 품고 있었을 가능성이 높다 — 옮길 때 **그대로 옮기지 말고 의도를 다시 정의한다.**

**대체 패턴 3종 (용도별로 고른다):**

```tsx
// (1) 에러 토스트 등 "쿼리당 1회" 부수효과 → QueryCache 전역 콜백
//     컴포넌트 개수와 무관하게 쿼리 하나당 정확히 1번 실행된다 (v4 콜백의 중복 실행 문제도 함께 해결)
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => toast.error(`Something went wrong: ${error.message}`),
  }),
})

// (2) 쿼리마다 다른 메시지가 필요하면 meta 필드
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.errorMessage) toast.error(query.meta.errorMessage as string)
    },
  }),
})

useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  meta: { errorMessage: '할 일 목록을 불러오지 못했습니다' },
})

// (3) 로컬 state 동기화가 목적이었다면 → 동기화하지 말고 파생시킨다
// ❌ const [count, setCount] = useState(0); onSuccess: (d) => setCount(d.length)
// ✅
const { data: todos } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })
const todoCount = todos?.length ?? 0
```

- 정말로 상태 동기화가 불가피할 때만 `useEffect`를 쓴다. `useQuery`가 반환하는 `data`/`error`는 **참조가 안정적**이라 `useEffect` 의존성으로 안전하다.
- **`useMutation`의 `onSuccess`/`onError`/`onSettled`는 v5에도 그대로 있다.** 지우면 안 된다.
  단 v5 후기 패치에서 콜백 인자 위치가 확장됐다 → `frontend/tanstack-query` 섹션 5-1의 `onMutateResult` 주의 참조.

### 3-7. `query.remove()` 제거

```tsx
// ❌ v4
const query = useQuery(['todos'], fetchTodos)
query.remove()

// ✅ v5
const queryClient = useQueryClient()
const query = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })
queryClient.removeQueries({ queryKey: ['todos'] })
```

### 3-8. QueryClient 명령형 메서드 — 오브젝트 인자화

```tsx
// ❌ v4
queryClient.fetchQuery(key, fn, options)
queryClient.prefetchQuery(key, fn, options)
queryClient.fetchInfiniteQuery(key, fn, options)
queryClient.prefetchInfiniteQuery(key, fn, options)
queryClient.ensureQueryData(key, options)

// ✅ v5 (전환 시 최소 변경)
queryClient.fetchQuery({ queryKey: key, queryFn: fn, ...options })
queryClient.prefetchQuery({ queryKey: key, queryFn: fn, ...options })
queryClient.fetchInfiniteQuery({ queryKey: key, queryFn: fn, ...options })
queryClient.prefetchInfiniteQuery({ queryKey: key, queryFn: fn, ...options })
queryClient.ensureQueryData({ queryKey: key, ...options })
```

> **주의 (v5 진행 중 변경):** 검증일 기준 **최신 v5 공식 문서는 이 5종을 deprecated로 표기**하고,
> 통합 메서드 `queryClient.query()` / `queryClient.infiniteQuery()`로 대체하며 **v6에서 제거 예정**이라고 안내한다.
> QueryClient 레퍼런스 문서에도 `query`/`infiniteQuery`만 등재돼 있다.
>
> ```tsx
> queryClient.query({ queryKey, queryFn, ...options })                        // ← fetchQuery
> queryClient.query({ queryKey, queryFn, ...options }).catch(noop)            // ← prefetchQuery
> queryClient.query({ queryKey, ...options, staleTime: 'static' })            // ← ensureQueryData
> queryClient.infiniteQuery({ queryKey, queryFn, ...options })                // ← fetchInfiniteQuery
> queryClient.infiniteQuery({ queryKey, queryFn, ...options }).catch(noop)    // ← prefetchInfiniteQuery
> ```
>
> **이 통합 메서드가 정확히 어느 5.x 패치부터 존재하는지는 확인하지 못했다(미검증).**
> 따라서 **2단계(버전 업 PR)에서는 기존 이름을 오브젝트 인자로만 바꾸고**, `query()` 전환은 3단계에서
> 실제 설치 버전의 타입 정의에 존재하는지 확인한 뒤 진행한다.

### 3-9. 커스텀 `context` prop 제거 → `queryClient` 인자

```tsx
// ❌ v4 — 마이크로프론트엔드/라이브러리 격리에 쓰던 패턴
const customContext = React.createContext<QueryClient | undefined>(undefined)

<QueryClientProvider client={queryClient} context={customContext}>
useQuery(['users', id], fetchUser, { context: customContext })

// ✅ v5 — 훅의 2번째 인자로 queryClient 인스턴스를 직접 넘긴다
<QueryClientProvider client={queryClient}>
useQuery({ queryKey: ['users', id], queryFn: fetchUser }, queryClient)
useMutation({ mutationFn: createUser }, queryClient)
```

### 3-10. `contextSharing` 제거

```tsx
// ❌ v4
<QueryClientProvider client={queryClient} contextSharing={true}>

// ✅ v5 — 격리·공유가 목적이면 공유할 queryClient 인스턴스를 직접 전달한다 (3-9와 같은 방식)
<QueryClientProvider client={queryClient}>
```

### 3-11. 무한 쿼리 — `initialPageParam` 필수 / manual mode 제거 / `null` 종료

```tsx
// ❌ v4
useInfiniteQuery(['feed'], ({ pageParam = 0 }) => fetchFeed(pageParam), {
  getNextPageParam: (last) => last.next,       // 선택이었다
  refetchPage: (page, index) => index === 0,
})
fetchNextPage({ pageParam: 5 })                // manual mode

// ✅ v5
useInfiniteQuery({
  queryKey: ['feed'],
  queryFn: ({ pageParam }) => fetchFeed(pageParam),
  initialPageParam: 0,                          // 필수
  getNextPageParam: (last) => last.next,        // 필수
  maxPages: 3,                                  // refetchPage 대체 — 보관/refetch할 페이지 상한
})
fetchNextPage()                                 // pageParam 수동 지정 불가
```

- **`getNextPageParam`/`getPreviousPageParam`이 `null`을 반환하면 이제 "다음 페이지 없음"** 으로 해석된다.
  v4에서는 `undefined`만 종료 신호였다. `nextCursor: null`을 그대로 반환하던 API라면
  **v4에서는 불필요한 추가 fetch, v5에서는 정상 종료**로 동작이 달라진다.
- `refetchPage`와 `maxPages`는 **1:1 대응이 아니다.** `refetchPage`는 "어떤 페이지를 refetch할지" 필터였고,
  `maxPages`는 "몇 페이지까지 보관/refetch할지" 상한이다. `refetchPage: (_, i) => i === 0`은 `maxPages: 1`로 근사되지만
  의도가 다르면 재설계가 필요하다.

### 3-12. `refetchInterval` 콜백 시그니처

```tsx
// ❌ v4
refetchInterval: (data, query) => (data?.status === 'done' ? false : 1000)

// ✅ v5
refetchInterval: (query) => (query.state.data?.status === 'done' ? false : 1000)
```

> `query.state.data`는 **`select`가 적용되지 않은 원본 데이터**다. v4에서 첫 인자로 받던 `data`가 select 결과였다면 로직을 조정해야 한다.

### 3-13. `isDataEqual` 제거 → `structuralSharing` 함수

```tsx
// ❌ v4
useQuery(['todos'], fetchTodos, {
  isDataEqual: (oldData, newData) => customCheck(oldData, newData),
})

// ✅ v5
import { replaceEqualDeep } from '@tanstack/react-query'

useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  structuralSharing: (oldData, newData) =>
    customCheck(oldData, newData) ? oldData : replaceEqualDeep(oldData, newData),
})
```

### 3-14. Hydration API — `Hydrate` → `HydrationBoundary`

```tsx
// ❌ v4
import { Hydrate, useHydrate } from '@tanstack/react-query'
<Hydrate state={dehydratedState}><App /></Hydrate>

// ✅ v5
import { HydrationBoundary } from '@tanstack/react-query'
<HydrationBoundary state={dehydratedState}><App /></HydrationBoundary>
```

- **`useHydrate` 훅은 제거**됐다.
- `HydrationBoundary`는 **쿼리만 하이드레이션**한다. 뮤테이션까지 복원하려면 저수준 `hydrate` API나 persist 플러그인을 쓴다.

### 3-15. `dehydrate` 옵션 — 불리언 → 함수

```tsx
// ❌ v4
dehydrate(queryClient, {
  dehydrateMutations: false,
  dehydrateQueries: true,
})

// ✅ v5
dehydrate(queryClient, {
  shouldDehydrateMutation: () => false,
  shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query),
})
```

> persist를 쓰는 프로젝트는 `persistOptions.dehydrateOptions`에 이 옵션들이 들어 있는 경우가 많다
> — **놓치면 타입/런타임 에러 없이 조용히 무시된다.**

### 3-16. `hashQueryKey` → `hashKey`

```tsx
// ❌ v4
import { hashQueryKey } from '@tanstack/react-query'
// ✅ v5 — 뮤테이션 키도 해싱하므로 이름이 일반화됐다
import { hashKey } from '@tanstack/react-query'
```

### 3-17. 그 밖의 제거·변경

| 항목 | v4 | v5 |
|------|----|----|
| 커스텀 logger | `new QueryClient({ logger })` (deprecated) | **제거** |
| eslint `prefer-query-object-syntax` | 존재 | **규칙 삭제** (문법이 하나뿐이라 불필요) |
| `useQuery({ suspense: true })` | experimental 옵션 | **제거** → `useSuspenseQuery` / `useSuspenseInfiniteQuery` / `useSuspenseQueries` |
| 배칭 | `unstable_batchedUpdates`를 기본 배치 함수로 사용 | React 18에서 noop이라 **미설정**. 필요 시 `notifyManager.setBatchNotifyFunction` |
| private 필드 | TS `private` | ECMAScript `#` private — 런타임 접근 불가(내부 필드를 뚫던 코드가 깨진다) |
| TS 에러 기본 타입 | `unknown` | **`Error`** |
| 서버(SSR) `retry` | 3 | **0** |

```tsx
// TS 에러 기본 타입 변경 — Error가 아닌 것을 throw한다면 제네릭 명시
useQuery<number, string>({
  queryKey: ['some-query'],
  queryFn: async () => {
    if (Math.random() > 0.5) throw 'some error'
    return 42
  },
})
```

```tsx
// suspense 옵션 제거
// ❌ v4
const { data } = useQuery(['post', id], () => fetchPost(id), { suspense: true })
// ✅ v5 — data가 타입 수준에서 undefined가 아님이 보장된다
const { data } = useSuspenseQuery({ queryKey: ['post', id], queryFn: () => fetchPost(id) })
```

> `useSuspenseQuery`는 `enabled`·`placeholderData`를 지원하지 않는 등 제약이 있다 → `frontend/tanstack-query` 섹션 7 참조.

---

## 5. 생태계 패키지 — devtools · persist

### 5-1. `@tanstack/react-query-devtools`

v5 devtools는 내부 구현이 교체되면서 **prop 이름이 재배치**됐다. 특히 `position`의 의미가 바뀐 것이 함정이다.

```tsx
// ❌ v4
<ReactQueryDevtools
  initialIsOpen={false}
  position="bottom-left"      // 토글 버튼 위치
  panelPosition="bottom"      // 패널 위치
  context={customContext}
  panelProps={{ className: 'x' }}
  toggleButtonProps={{ /* ... */ }}
  closeButtonProps={{ /* ... */ }}
/>

// ✅ v5
<ReactQueryDevtools
  initialIsOpen={false}
  buttonPosition="bottom-right"  // ← v4의 position
  position="bottom"              // ← v4의 panelPosition (의미가 바뀐 prop!)
  client={queryClient}           // ← v4의 context 대체
/>
```

| v4 prop | v5 | 비고 |
|---------|----|------|
| `position` (기본 `bottom-left`) | **`buttonPosition`** (기본 `bottom-right`) | `"relative"` 값 추가 |
| `panelPosition` (기본 `bottom`) | **`position`** | 이름 재사용 — **가장 헷갈리는 지점** |
| `context` | **`client`** | 커스텀 QueryClient 전달 |
| `panelProps` / `toggleButtonProps` / `closeButtonProps` | **v5 옵션 목록에 없음** | 스타일 커스터마이징 코드는 제거 대상 |
| — | `theme`(`light`/`dark`/`system`), `styleNonce`, `shadowDOMTarget` | v5 신규 |

- 임베디드 패널은 v5에서 `ReactQueryDevtoolsPanel`로 분리됐다(`style`·`onClose` 지원).
- 프로덕션 지연 로딩 경로는 v4/v5 동일하게 `@tanstack/react-query-devtools/production`
  (번들러 exports 미지원 시 `@tanstack/react-query-devtools/build/modern/production.js`). 개발 빌드에만 포함되는 기본 동작도 동일하다.
- `position="bottom-left"`를 v5에 그대로 두면 **타입 에러가 난다**(패널 위치 허용값은 `top|bottom|left|right`) — 이건 안전한 축이다.
  진짜 문제는 **`position="bottom"`처럼 양쪽 모두 유효한 값**이라 조용히 의미가 바뀌는 경우다.

### 5-2. `@tanstack/react-query-persist-client` + `@tanstack/query-sync-storage-persister`

패키지 이름과 기본 API 형태는 v4/v5가 같다. **버전만 코어와 동일하게 올린다.**

```tsx
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const persister = createSyncStoragePersister({ storage: window.localStorage })

<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister,
    maxAge: 1000 * 60 * 60 * 24,   // 기본 24시간
    buster: 'v5-migration',        // ← 전환 시 반드시 값을 바꾼다 (아래 2번)
    dehydrateOptions: {
      // ❌ v4: dehydrateQueries / dehydrateMutations (불리언)
      shouldDehydrateQuery: (query) => query.state.status === 'success',
    },
  }}
>
  <App />
</PersistQueryClientProvider>
```

전환 시 확인할 것:

1. **`dehydrateOptions` 안의 불리언 옵션(3-15)을 함수형으로 바꾼다.** 안 바꾸면 조용히 무시된다.
2. **`buster` 값을 반드시 변경한다.**
   v4가 저장한 캐시에는 `status: 'loading'` 같은 **v4 시절 상태 문자열**이 그대로 들어 있다. v5는 `'pending'`을 기대한다.
   배포 직후 기존 사용자 브라우저에는 v4 포맷 캐시가 남아 있으므로, `buster`를 바꿔 **강제 무효화**하는 것이 안전하다.
   > 이 "v4 캐시 포맷 비호환"은 공식 문서가 명시한 breaking change가 아니라, 상태 문자열 변경(3-3)에서 도출한 **예방 조치**다.
   > 비용이 사실상 0이므로 하지 않을 이유가 없다.
3. `gcTime >= maxAge`를 유지한다(gcTime이 더 짧으면 저장해 둔 캐시가 먼저 수거된다).
   v4의 `cacheTime` 설정이 있었다면 이름부터 바꾼다 — 놓치면 하이드레이션 기본값 5분으로 떨어진다.
4. `PersistQueryClientProvider`를 쓰면 `persistQueryClient`를 직접 호출하지 않는다(복원 중 fetch 시작 방지를 Provider가 처리한다).

---

## 7. 흔한 실수 패턴

| 실수 | 결과 | 수정 |
|------|------|------|
| `isLoading`을 전부 `isPending`으로 일괄 치환 | 지연 쿼리 스피너가 사라지지 않음 | 4-1 판별 절차로 개별 판단 |
| `isLoading`을 전부 그대로 둠 | `enabled:false` 화면에서 스켈레톤 미표시 | 동일 |
| codemod만 돌리고 끝냄 | 이름 변경 계열 전부 미처리 | codemod는 **오버로드 제거 전용**. 2-1 표로 수동 목록 관리 |
| codemod를 v5로 올린 뒤에 실행 | 중간 상태가 빌드 불가 → 롤백 어려움 | **v4 상태에서** 실행 (1단계) |
| `--parser=tsx` 누락 | 변환이 조용히 적용 안 됨 | TS/TSX는 반드시 `--parser=tsx` |
| `.js` 트랜스폼 경로 사용 | `ERR_REQUIRE_ESM` | `.cjs` 사용 |
| `@tanstack/query-codemods` 설치 시도 | 404 — 그런 패키지 없음 | `node_modules/@tanstack/react-query/build/codemods/...` |
| 코어만 v5로 올리고 devtools/persist는 v4 유지 | peer 충돌·컨텍스트 분리 | 4종 동시 업 (0-2) |
| `getQueryData(key, filters)`를 오브젝트로 감쌈 | 잘못된 인자 | 2번째 인자를 **삭제**한다 (3-2) |
| `keepPreviousData: true` → `placeholderData: true` | 타입 에러 또는 무의미한 값 | `import { keepPreviousData }` 후 함수로 전달 |
| 쿼리 `onSuccess`를 그대로 `useEffect`로 1:1 이식 | v4의 "가끔만 실행" 버그를 다른 형태로 재현 | QueryCache 전역 콜백 + `meta`, 또는 파생값으로 재설계 (3-6) |
| `useMutation`의 콜백까지 지움 | 낙관적 업데이트·토스트 소실 | **뮤테이션 콜백은 v5에도 존재** |
| `refetchPage`를 `maxPages`로 기계적 치환 | refetch 대상이 달라짐 | 의도 재확인 (3-11) |
| `initialPageParam` 누락 | `pageParam`이 undefined로 첫 요청 실패 | 무한쿼리 전수 확인 |
| persist `buster` 미변경 | 구 포맷 캐시 복원 시 이상 동작 | 전환 배포에서 값 변경 (5-2) |
| devtools `panelPosition`만 `position`으로 바꾸고 버튼 prop 방치 | 버튼 위치가 기본값으로 이동 | `position`→`buttonPosition` 동시 처리 (5-1) |
| 전역 `defaultOptions`에 `cacheTime`을 남겨둠 | 옵션 무시 → 캐시 수명이 기본 5분으로 리셋 | `gcTime`으로 치환 후 devtools로 확인 |
