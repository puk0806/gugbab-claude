---
name: tanstack-query-v4-to-v5-migration
description: TanStack Query v4 → v5 마이그레이션 전용 — breaking change 전수·before/after, 공식 codemod 자동/수동 경계, 대규모 코드베이스 점진 전환 PR 분할, 타입 에러 없이 동작만 바뀌는 런타임 함정, devtools·persist 패키지 정합, 전환 후 검증 체크리스트
---

# TanStack Query v4 → v5 마이그레이션

> 소스: https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5 (공식 마이그레이션 가이드)
> 보조 소스: https://github.com/TanStack/query/blob/main/docs/framework/react/guides/migrating-to-v5.md (원문 마크다운),
> https://tanstack.com/blog/announcing-tanstack-query-v5 (공식 릴리즈 공지),
> https://tkdodo.eu/blog/breaking-react-querys-api-on-purpose (메인테이너 TkDodo — 콜백 제거 근거·대체 패턴),
> https://registry.npmjs.org/@tanstack/react-query (버전 확인)
> 검증일: 2026-08-26
> 기준 버전: v4 마지막 = **4.44.0** (npm dist-tag `previous`) / v5 최신 = **5.102.4** (npm dist-tag `latest`)

---

## 이 스킬의 범위 — 다른 스킬과의 역할 분리

| 스킬 | 다루는 것 |
|------|----------|
| `frontend/state-management` | 서버/클라이언트 상태 분리 기준, Zustand. v4→v5 변경은 **맛보기 수준 요약만** 있음 (`onSuccess` 제거·object syntax 2개 예시) |
| `frontend/tanstack-query` | **v5를 어떻게 쓰는지** — queryKey 설계, staleTime/gcTime 튜닝, 낙관적 업데이트, invalidate 범위, Suspense·SSR |
| **이 스킬** | **v4에서 v5로 어떻게 건너가는지** — breaking change 전수, codemod, 전환 순서·PR 분할, 런타임 함정, 전환 후 검증 |

> - **v5 사용법 자체(키 설계·캐시 수명 튜닝·낙관적 업데이트 구현 등)는 여기서 반복하지 않는다.** → `frontend/tanstack-query` 참조.
> - `frontend/state-management`의 "TanStack Query v4 → v5 주요 변경사항" 절은 2항목 요약이라 마이그레이션 근거로 삼기엔 부족하다.
>   **v4→v5 전환 판단은 항상 이 스킬을 정본으로 본다.**
> - 전환이 끝난 뒤의 코드 품질·패턴 리뷰는 다시 `frontend/tanstack-query`의 리뷰 체크리스트를 쓴다.

---

## 0. 버전 좌표와 패키지 정합 — 먼저 확정할 것

### 0-1. 버전 사실

| 항목 | 값 |
|------|-----|
| v4 마지막 안정 버전 | **4.44.0** (서브패키지 4종 공통, npm dist-tag `previous`) |
| v5 최신 안정 버전 | **5.102.4** (검증일 기준 `latest`) |
| React 최소 버전 | **18.0+** (`useSyncExternalStore` 의존). v4는 17도 지원했다 |
| TypeScript 최소 버전 | **4.7+** (v4는 4.1+) |
| 지원 브라우저 | Chrome ≥ 91, Firefox ≥ 90, Edge ≥ 91, Safari ≥ 15, iOS ≥ 15, Opera ≥ 77 |

> React 18 SPA(Vite 등)라면 React 최소 버전 요건은 이미 충족이다. **React 17 잔존 프로젝트는 v5로 갈 수 없다** — React 업그레이드가 선행 과제다.

### 0-2. 서브패키지는 **한 커밋에서 같은 버전으로** 올린다

v5 서브패키지의 peerDependency는 `@tanstack/react-query`를 **`^5.102.4`처럼 자기 자신과 같은 패치 이상**으로 요구한다.
즉 코어만 v5로 올리고 devtools/persist를 v4로 두는 "부분 업그레이드"는 **성립하지 않는다.**

```jsonc
// package.json — 4종을 동시에 같은 버전으로
{
  "dependencies": {
    "@tanstack/react-query": "5.102.4",
    "@tanstack/react-query-persist-client": "5.102.4",
    "@tanstack/query-sync-storage-persister": "5.102.4"
  },
  "devDependencies": {
    "@tanstack/react-query-devtools": "5.102.4",
    "@tanstack/eslint-plugin-query": "5.x"   // v4 전용 규칙 2종이 사라지므로 마지막에 올린다 (섹션 1-2)
  }
}
```

- 락파일에 v4/v5 코어가 **동시에 존재**하면 `QueryClientProvider` 컨텍스트가 갈라져 "Provider 안인데 No QueryClient set" 류 런타임 에러가 난다.
  업그레이드 후 반드시 중복 설치를 확인한다: `npm ls @tanstack/query-core` (pnpm/yarn도 동일 취지).
- 모노레포라면 패키지별로 나눠 올리지 말고 루트에서 한 번에 올린다(같은 이유).

---

## 1. 점진 전환 전략 — 3단계로 쪼갠다

대규모 코드베이스에서 "버전 올리고 전부 고치기"를 한 PR에 담으면 리뷰가 불가능하고 롤백도 못 한다.
**v4 안에서 미리 할 수 있는 것 / 버전 업과 반드시 같이 가야 하는 것 / 나중에 해도 되는 것**을 나눈다.

### 1-1. 3단계 개요

```
[1단계] v4 유지 + v5 호환 형태로 코드 정리   ← PR 여러 개, 각각 독립 머지·배포 가능
   ↓
[2단계] 4.44.0 → 5.102.4 버전 업 + 필수 치환   ← 단일 PR (쪼갤 수 없는 원자적 변경)
   ↓
[3단계] v5 전용 기능으로 잔여 정리           ← PR 여러 개, 급하지 않음
```

### 1-2. 1단계 — v4 안에서 미리 끝낼 수 있는 것

아래는 v4에서도 유효한 문법이라 **버전을 올리지 않고 머지·배포**할 수 있다. 여기서 최대한 많이 끝낼수록 2단계 PR이 작아진다.

| 작업 | v4에서 가능한 이유 |
|------|------------------|
| **위치 인자 → 오브젝트 인자 전면 전환** | v4도 오브젝트 시그니처를 오버로드로 지원한다 |
| **`useQuery`의 `onSuccess`/`onError`/`onSettled` 제거** | v4 문서에서 이미 deprecated 표기. 제거해도 v4에서 정상 동작 |
| **`isDataEqual` → `structuralSharing` 함수형** | `structuralSharing: boolean \| ((oldData, newData) => TData)`는 v4에도 있다 |
| **`query.remove()` → `queryClient.removeQueries({ queryKey })`** | `removeQueries`는 v4에도 있다 |
| **`setQueryDefaults` 등록 순서를 "일반 → 구체"로 재배열** | v4에서도 동작에 문제없고, v5의 병합 규칙과 어긋나지 않게 미리 맞춘다 |
| **`isLoading` 사용처 전수 조사 + 의도 판별표 작성** | 실제 치환은 2단계지만 **어느 의미로 쓰였는지 판별**은 미리 해둔다 (→ 섹션 4-1) |

**v4 eslint 규칙 2개를 1단계 게이트로 쓴다** (v4 `@tanstack/eslint-plugin-query`):

```jsonc
{
  "rules": {
    "@tanstack/query/prefer-query-object-syntax": "error",  // 위치 인자 전면 차단
    "@tanstack/query/no-deprecated-options": "error"        // onSuccess·onError·onSettled·isDataEqual 검출
  }
}
```

> 이 두 규칙은 **v5의 eslint-plugin-query에서 삭제**됐다(문법이 하나뿐이라 불필요해짐).
> 오직 1단계(v4 재직 중)에만 쓸 수 있는 도구다. 두 규칙 모두 0건이 되면 1단계 완료로 본다.

> **주의:** `isInitialLoading`·`structuralSharing` 함수형이 v4의 정확히 **어느 패치부터** 제공되는지는 확인하지 못했다(4.44.0 문서에는 존재).
> 따라서 **1단계의 첫 PR은 "4.x → 4.44.0 패치 업"으로 잡는 것이 안전하다.** 4.12 같은 초·중반 v4에서 바로 5로 뛰지 않는다.

### 1-3. 2단계 — 원자적으로 한 번에 가야 하는 것

버전을 올리는 순간 **깨지는** 항목들이다. 같은 PR에 담는다.

- 패키지 4종 버전 업 (섹션 0-2)
- `cacheTime` → `gcTime`
- `useErrorBoundary` → `throwOnError`
- `keepPreviousData: true` → `placeholderData: keepPreviousData`, `isPreviousData` → `isPlaceholderData`
- `status: 'loading'` → `'pending'`, `isLoading` → (판별 결과에 따라) `isPending` 또는 유지
- 무한쿼리 `initialPageParam` 추가, `refetchPage` → `maxPages`
- `Hydrate` → `HydrationBoundary`, `useHydrate` 제거
- `hashQueryKey` → `hashKey`
- 커스텀 `context` prop → 2번째 인자 `queryClient`, `contextSharing` 제거
- `refetchInterval` 콜백 시그니처
- `dehydrate` 옵션 함수화 (persist 사용 시 필수)
- devtools prop 재배치 (섹션 5-1)

**2단계 PR을 최대한 작게 만드는 요령:** 1단계에서 위치 인자·쿼리 콜백을 다 없앴다면, 2단계에 남는 것은 대부분 **기계적 식별자 치환**뿐이다.
그러면 diff 줄 수가 커도 리뷰어가 "이름만 바뀐 것"으로 빠르게 훑을 수 있다.

### 1-4. 3단계 — 급하지 않은 정리

- `useQuery({ suspense: true })` 잔재 → `useSuspenseQuery`
- 콜백 대체를 임시 `useEffect`로 때웠다면 → `QueryCache`/`MutationCache` 전역 콜백 + `meta`로 정리 (섹션 3-6)
- `queryOptions()` 헬퍼 도입 (v5 신규)
- `useQueries`의 `combine`
- `maxPages`로 무한쿼리 메모리 상한
- `fetchQuery`/`prefetchQuery`/`ensureQueryData` → `queryClient.query()`/`infiniteQuery()` (섹션 3-8 주의 참조)

### 1-5. PR 분할 예시 (대규모 SPA)

| PR | 범위 | 단독 롤백 |
|----|------|:---:|
| #1 | `4.12 → 4.44.0` 패치 업 + 회귀 확인 | ✅ |
| #2 | eslint 규칙 2종 도입 + 도메인 A 위치 인자 → 오브젝트 인자 | ✅ |
| #3~#N | 도메인 B, C… 위치 인자 전환 (**도메인/폴더 단위로 쪼갠다**) | ✅ |
| #N+1 | `useQuery` 콜백 제거 + `remove()`·`isDataEqual` 정리 | ✅ |
| #N+2 | **버전 업 + 필수 치환 (2단계 전체)** | ⚠️ 이 PR만 원자적 |
| #N+3~ | Suspense 훅 전환, 전역 콜백 정리, `queryOptions` 도입 | ✅ |

> 분할 축은 **"파일 수"가 아니라 "롤백 단위"** 다. #N+2 하나만 되돌리면 v4로 완전 복귀되도록,
> 앞 PR들을 전부 **v4-호환 상태로 유지**하는 것이 이 전략의 핵심이다.

---

## 2. 공식 codemod — 무엇이 자동이고 무엇이 수동인가

v5는 **오버로드 제거(위치 인자 → 오브젝트 인자)** 만을 대상으로 하는 codemod를 패키지 안에 동봉한다.
별도 npm 패키지가 아니라 **설치된 `@tanstack/react-query` 안의 파일**을 jscodeshift로 실행한다.

```bash
# TypeScript / TSX  ← --parser=tsx 를 빼면 변환이 적용되지 않는다
npx jscodeshift@latest ./path/to/src/ \
  --extensions=ts,tsx \
  --parser=tsx \
  --transform=./node_modules/@tanstack/react-query/build/codemods/src/v5/remove-overloads/remove-overloads.cjs

# JavaScript / JSX
npx jscodeshift@latest ./path/to/src/ \
  --extensions=js,jsx \
  --transform=./node_modules/@tanstack/react-query/build/codemods/src/v5/remove-overloads/remove-overloads.cjs
```

> **주의:** `@tanstack/query-codemods`라는 npm 패키지는 **존재하지 않는다**(레지스트리 404).
> 공식 경로는 위의 `node_modules/@tanstack/react-query/build/codemods/...` 하나뿐이다.
> 확장자도 `.js`가 아니라 **`.cjs`** 를 써야 한다 — `.js`로 실행하면 `ERR_REQUIRE_ESM`이 난다.

### 2-1. 자동 / 수동 경계

| 항목 | codemod가 해주나 |
|------|:---:|
| `useQuery(key, fn, options)` → 오브젝트 | ✅ |
| `useInfiniteQuery(key, fn, options)` → 오브젝트 | ✅ |
| `useIsFetching(key, filters)` / `useIsMutating` → 오브젝트 | ✅ |
| `queryClient.invalidateQueries(key, filters, options)` 류 → 오브젝트 | ✅ |
| `useMutation(fn, options)` → 오브젝트 | ⚠️ **불완전** (미처리 사례 보고 다수 — 반드시 육안 확인) |
| `cacheTime` → `gcTime` | ❌ 수동 |
| `useErrorBoundary` → `throwOnError` | ❌ 수동 |
| `keepPreviousData` → `placeholderData` | ❌ 수동 |
| `isLoading` → `isPending`, `status: 'loading'` → `'pending'` | ❌ 수동 (**의미 판별 필요** — 섹션 4-1) |
| `onSuccess`/`onError`/`onSettled` 제거 및 대체 | ❌ 수동 |
| `initialPageParam` 추가 | ❌ 수동 |
| `refetchPage` → `maxPages` | ❌ 수동 |
| `Hydrate` → `HydrationBoundary` | ❌ 수동 |
| `context` prop → `queryClient` 인자 | ❌ 수동 |
| devtools / persist 옵션 | ❌ 수동 |

**운용 규칙:**
1. codemod는 **1단계에서 v4를 유지한 채** 돌린다(오브젝트 문법은 v4에서도 유효하므로 안전하다).
2. "best efforts" 도구다. 추론에 실패하면 **파일명·라인 번호를 콘솔에 남기고 건너뛴다** — 이 로그를 반드시 수거해 수동 처리 목록으로 만든다.
3. 실행 직후 Prettier/ESLint로 포맷을 복구한다(codemod 출력은 포맷이 깨진다).
4. 나머지 이름 치환은 codemod가 아니라 **타입 에러 + grep**으로 잡는 것이 확실하다 (섹션 6-1).

---

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

## 4. 타입 에러가 안 나는데 동작만 바뀌는 항목 — 별도 경고

**컴파일이 통과했다고 마이그레이션이 끝난 게 아니다.** 아래는 TypeScript가 잡아주지 못하거나(이름이 양쪽에 존재)
잡아줘도 "이름만 바꾸면 되는 줄 알고" 넘어가기 쉬운 항목들이다. **QA 회귀 시나리오를 여기에 집중시킨다.**

| # | 항목 | v4 동작 | v5 동작 | 증상 |
|---|------|---------|---------|------|
| 1 | **`isLoading`** | 캐시 데이터 없음 (= v5의 `isPending`) | `isPending && isFetching` | `enabled: false` 쿼리에서 **스켈레톤이 안 뜨거나** 반대로 계속 뜬다. **타입 에러 없음** |
| 2 | `status === 'loading'` 문자열 비교 | 참 | 항상 거짓 (`'pending'`) | 로딩 분기 통째로 죽음. TS면 잡히지만 **JS·`String(status)`·로깅·테스트 픽스처는 안 잡힘** |
| 3 | `getNextPageParam`이 `null` 반환 | "다음 페이지 있음"으로 취급 → 계속 fetch | **"페이지 없음"으로 종료** | 무한스크롤이 **조기에 멈춤**(또는 v4의 과잉 fetch가 사라짐) |
| 4 | `useQuery`의 `onSuccess`/`onError` | 가끔 실행(캐시 히트 시 스킵) | **옵션 자체가 무시됨** | 토스트·분석 이벤트·로컬 state 갱신이 **조용히 사라짐** |
| 5 | `dehydrateQueries`/`dehydrateMutations` | 동작 | **알 수 없는 키로 무시** | persist가 의도치 않은 데이터까지 저장/미저장 |
| 6 | 창 포커스 refetch | `focus` + `visibilitychange` | **`visibilitychange`만** | 같은 탭에서 다른 앱 갔다 와도 refetch가 **덜 일어남** |
| 7 | 오프라인 판정 | `navigator.onLine` 사용 | **미사용**, 기본 `online: true` + online/offline 이벤트 | 오프라인 배너·`fetchStatus: 'paused'` 타이밍 변화 |
| 8 | `setQueryDefaults` 다중 등록 | **첫 매칭만** 적용 | **매칭 전부 병합** | 넓은 키의 기본값이 예상보다 넓게 먹음. 등록 순서를 **일반 → 구체**로 정렬해야 함 |
| 9 | `refetchInterval` 콜백 첫 인자 | `data` (select 적용됨) | `query` (원본 데이터) | 폴링이 **영원히 안 멈추거나** 즉시 멈춤 |
| 10 | 에러 기본 타입 | `unknown` | `Error` | `error.message` 접근이 갑자기 통과 → **Error가 아닌 값을 throw하는 queryFn**에서 런타임 `undefined` |
| 11 | SSR에서 `retry` | 3 | **0** | SSR/프리렌더 실패가 즉시 표면화 (순수 SPA면 영향 없음) |
| 12 | `isPreviousData` | 존재 | **없음** (`isPlaceholderData`) | 페이지네이션 버튼 disable이 **항상 false** → 연타 가능 |
| 13 | 내부 private 필드 접근 | TS `private`이라 런타임 접근 가능 | ECMAScript `#` — **접근 불가** | 캐시 내부를 뚫던 유틸/테스트 헬퍼가 `undefined` |

> **#1은 반드시 수동 판별한다.** 기계적으로 `isLoading` → `isPending`으로 전부 바꾸면 "지연 쿼리 스피너" 용도가 망가지고,
> 전부 그대로 두면 "첫 화면 스켈레톤" 용도가 망가진다.

### 4-1. `isLoading` 판별 절차

```
해당 쿼리에 enabled(또는 skipToken)가 걸려 있나?
├─ 아니오 → v4 isLoading == v5 isPending == v5 isLoading (실질적으로 동일)
│            → isPending 으로 바꾸면 안전
└─ 예     → 의도를 묻는다
            ├─ "인자가 준비될 때까지 스켈레톤을 계속 보여주고 싶다"  → isPending
            └─ "실제로 요청이 나갈 때만 스피너"                    → isLoading (v5 의미 그대로, 코드 수정 불필요)
```

```bash
# 1단계에서 전수 조사해 두면 2단계 PR이 안전해진다
rg -n "isLoading|isInitialLoading|['\"]loading['\"]" src/
rg -n "enabled\s*:" src/     # 위 결과와 교차해 판별 대상을 좁힌다
```

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

## 6. 전환 후 검증 — 무엇을 어떻게 확인하나

### 6-1. 1차: 정적 검증 (기계가 잡는 것)

```bash
# ① 타입 체크 — 이름 변경 계열 대부분이 여기서 잡힌다
tsc --noEmit

# ② 코어 중복 설치 확인 — v4/v5 동시 존재 시 컨텍스트가 갈라진다
npm ls @tanstack/query-core

# ③ v4 잔재 전수 검색 (타입 에러가 안 나는 것까지 포함)
rg -n "cacheTime|useErrorBoundary|keepPreviousData|isPreviousData|isDataEqual|refetchPage|hashQueryKey|contextSharing|useHydrate|<Hydrate|dehydrateQueries|dehydrateMutations|suspense:\s*true|panelPosition|panelProps|toggleButtonProps" src/

# ④ 위치 인자 잔재 (codemod가 놓친 것)
rg -n "useQuery\(\[|useInfiniteQuery\(\[|useMutation\([a-zA-Z]" src/

# ⑤ 상태 문자열 잔재
rg -n "['\"]loading['\"]" src/

# ⑥ eslint — v5 플러그인의 exhaustive-deps 규칙으로 queryKey 누락 검출
eslint src/ --max-warnings=0
```

> ③의 `cacheTime`·`useErrorBoundary`·`keepPreviousData`는 **잉여 프로퍼티 검사에 걸리지 않는 위치**
> (스프레드로 합쳐지는 옵션 객체, `as const` 없이 만든 공용 옵션 상수 등)에 있으면 타입 에러 없이 통과한다. 그래서 grep이 필수다.

### 6-2. 2차: 쿼리 키 감사

전환 중 옵션 객체를 재작성하면서 **queryKey에서 변수를 빠뜨리는 실수**가 잦다(위치 인자 시절엔 클로저로만 쓰던 값).

```tsx
// 감사 도구: 캐시에 등록된 키 전량 덤프
queryClient.getQueryCache().getAll().forEach((q) => {
  console.log(q.queryHash, q.state.status, q.state.dataUpdatedAt)
})
```

- [ ] 필터·정렬·페이지·userId 등 **queryFn이 참조하는 모든 변수**가 키에 있는가
- [ ] 같은 데이터를 두 화면이 **서로 다른 키**로 부르고 있지 않은가(손으로 옮기다 생긴 오타)
- [ ] `queryHash` 개수가 v4 대비 비정상적으로 늘지 않았는가(불안정 키 유입 신호)
- [ ] `invalidateQueries` 호출부의 키 계층이 그대로인가 → 키 팩토리가 없다면 이 기회에 도입 (`frontend/tanstack-query` 섹션 3)

### 6-3. 3차: devtools로 캐시 수명·상태 확인

v5 devtools를 열고 주요 쿼리에 대해:

- [ ] **status 배지가 `pending`/`success`/`error`** 로 표시되는가(`loading`이 보이면 잔재)
- [ ] `gcTime`이 v4의 `cacheTime` 값과 **동일한가** — 이름만 바뀐 것이므로 값이 달라졌다면 치환 실수다
- [ ] `staleTime` 기본값이 의도대로인가(전역 `defaultOptions`가 통째로 유실되는 사고가 잦다)
- [ ] 화면을 떠났다 돌아왔을 때 **요청 횟수가 v4와 같은가** — 늘었다면 `staleTime` 유실, 줄었다면 refetch 옵션 유실
- [ ] inactive 쿼리가 gcTime 경과 후 목록에서 사라지는가

### 6-4. 4차: 회귀 체크리스트 (수동 QA — 섹션 4의 함정과 1:1 대응)

- [ ] **로딩 UI**: 첫 진입 스켈레톤 / 백그라운드 refetch 인디케이터 / `enabled:false` 지연 쿼리 3종이 v4와 동일한가 (함정 #1·#2)
- [ ] **무한 스크롤**: 끝까지 스크롤 시 정상 종료되는가, 조기 종료되지 않는가 (함정 #3)
- [ ] **페이지네이션**: 페이지 전환 시 깜빡임 없는가, "다음" 버튼이 로딩 중 disable 되는가 (함정 #12)
- [ ] **에러 토스트·분석 이벤트**: v4의 쿼리 `onSuccess`/`onError`에 있던 부수효과가 전부 살아 있는가 (함정 #4)
- [ ] **뮤테이션**: 낙관적 업데이트 → 실패 롤백 → invalidate 재동기화 흐름이 정상인가
- [ ] **창 전환 refetch**: 탭 전환 시 갱신되는가 (함정 #6)
- [ ] **오프라인**: 네트워크 차단 시 `fetchStatus: 'paused'` 및 오프라인 배너 동작 (함정 #7)
- [ ] **persist**: 새로고침 후 캐시 복원, 그리고 **v4 캐시가 남은 브라우저에서 크래시하지 않는가** (5-2)
- [ ] **폴링 화면**: `refetchInterval` 콜백이 조건 충족 시 멈추는가 (함정 #9)
- [ ] **ErrorBoundary**: `throwOnError` 전환 후에도 에러 경계가 여전히 잡는가
- [ ] **Devtools**: 개발 빌드에서 정상 렌더되고 프로덕션 번들에는 포함되지 않는가

### 6-5. 롤백 기준

2단계 PR 배포 후 아래 중 하나라도 나오면 즉시 롤백한다.

- 특정 화면의 요청 수가 **배 이상** 증가 (staleTime·`defaultOptions` 유실)
- `No QueryClient set` 류 에러 (코어 중복 설치)
- persist 복원 단계에서 화이트스크린 (v4 캐시 포맷 — `buster` 미변경)

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

---

## 8. 마이그레이션 완료 체크리스트

**1단계 (v4 유지)**
- [ ] 4.44.0까지 패치 업 완료
- [ ] eslint `prefer-query-object-syntax` 0건
- [ ] eslint `no-deprecated-options` 0건 (쿼리 콜백·`isDataEqual` 제거 완료)
- [ ] `query.remove()` 호출 0건
- [ ] `isLoading` 사용처 전수 판별표 작성 완료

**2단계 (버전 업)**
- [ ] 코어·devtools·persist·sync-storage-persister **동일 버전**
- [ ] `npm ls @tanstack/query-core` 단일 버전
- [ ] `tsc --noEmit` 통과
- [ ] 6-1의 grep 항목 0건
- [ ] 무한쿼리 전부 `initialPageParam` 보유
- [ ] persist `buster` 변경 + `dehydrateOptions` 함수형 전환
- [ ] devtools prop 재배치 완료
- [ ] 6-4 회귀 체크리스트 전 항목 수동 확인

**3단계 (정리)**
- [ ] `suspense: true` 잔재 없음 → `useSuspenseQuery`
- [ ] 임시 `useEffect` 콜백 대체분을 전역 콜백/`meta`/파생값으로 정리
- [ ] `queryOptions()` 도입 검토 (`frontend/tanstack-query` 섹션 3)
- [ ] `fetchQuery`/`prefetchQuery`/`ensureQueryData` → `queryClient.query()` 전환 검토 (설치 버전 타입 정의 확인 후)
