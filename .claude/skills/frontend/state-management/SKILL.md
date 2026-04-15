---
name: state-management
description: Zustand v5 전역 상태관리, TanStack Query v5 서버 상태/캐싱 전략, 상태 레이어 분리 아키텍처
---

# 상태 관리 패턴 (Zustand v5 + TanStack Query v5)

> 소스: https://zustand.docs.pmnd.rs | https://tanstack.com/query/v5/docs
> 검증일: 2026-03-27

---

## 상태 분류 — 무엇으로 관리할지 판단 기준

```
상태 종류?
├─ 서버에서 오는 데이터 (API 응답, 캐싱 필요)
│  └─ TanStack Query (useQuery, useMutation)
│
├─ 클라이언트 전역 상태 (여러 컴포넌트 공유, 서버 무관)
│  └─ Zustand
│
└─ 특정 컴포넌트 내 지역 상태
   └─ useState / useReducer
```

| 상태 유형 | 도구 | 예시 |
|----------|------|------|
| 서버 데이터 | TanStack Query | 유저 목록, 게시글, 프로필 |
| 전역 UI 상태 | Zustand | 사이드바 열림/닫힘, 선택된 탭, 모달 |
| 인증 상태 | Zustand | 로그인 유저 정보, 토큰 |
| 폼 상태 | React Hook Form | 폼 입력값, 유효성 |
| 지역 상태 | useState | 버튼 hover, 토글 |

**❌ 피해야 할 패턴:** 서버 데이터를 Zustand에 저장 → TanStack Query가 캐싱/동기화를 더 잘 처리함

---

## Zustand v5

### 기본 스토어 생성

```typescript
// store/ui.ts
import { create } from 'zustand'

interface SidebarStore {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
```

### Zustand v4 → v5 주요 변경사항

```typescript
// ❌ v4 방식
import create from 'zustand'  // default import
const useStore = create(...)

// ✅ v5 방식
import { create } from 'zustand'  // named import
const useStore = create(...)

// v5 추가: useShallow (shallow compare)
import { useShallow } from 'zustand/react/shallow'
const { open, close } = useStore(useShallow((s) => ({ open: s.open, close: s.close })))
```

### 슬라이스 패턴 (스토어 분리)

```typescript
// store/slices/auth.ts
import { StateCreator } from 'zustand'

export interface AuthSlice {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
})

// store/slices/ui.ts
export interface UISlice {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
})

// store/index.ts — 슬라이스 합치기
import { create } from 'zustand'
import { createAuthSlice, AuthSlice } from './slices/auth'
import { createUISlice, UISlice } from './slices/ui'

type StoreState = AuthSlice & UISlice

export const useStore = create<StoreState>((...args) => ({
  ...createAuthSlice(...args),
  ...createUISlice(...args),
}))
```

### 미들웨어: devtools + persist

```typescript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface SettingsStore {
  theme: 'light' | 'dark'
  language: string
  setTheme: (theme: 'light' | 'dark') => void
}

export const useSettingsStore = create<SettingsStore>()(
  devtools(                          // Redux DevTools 연동
    persist(                         // localStorage 영속화
      (set) => ({
        theme: 'light',
        language: 'ko',
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: 'settings-storage',    // localStorage 키
        partialize: (state) => ({    // 저장할 필드만 선택
          theme: state.theme,
          language: state.language,
        }),
      }
    ),
    { name: 'SettingsStore' }        // DevTools에 표시될 이름
  )
)
```

### 선택적 구독 (리렌더링 최적화)

```typescript
// ❌ 스토어 전체를 구독 → 어떤 값이 바뀌어도 리렌더링
const store = useStore()

// ✅ 필요한 값만 구독
const user = useStore((s) => s.user)
const isOpen = useSidebarStore((s) => s.isOpen)

// ✅ 여러 값 구독 시 useShallow로 객체 비교
import { useShallow } from 'zustand/react/shallow'
const { open, close } = useStore(
  useShallow((s) => ({ open: s.open, close: s.close }))
)
```

---

## TanStack Query v5

### 기본 설정 (Next.js App Router)

```typescript
// providers/query-provider.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,    // 1분: 데이터 신선도 유지 시간
            gcTime: 5 * 60 * 1000,  // 5분: 캐시 보관 시간 (v4의 cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### TanStack Query v4 → v5 주요 변경사항

```typescript
// ❌ v4
const { data, isLoading } = useQuery(['users'], fetchUsers)
const { data } = useQuery(['user', id], () => fetchUser(id), {
  onSuccess: (data) => console.log(data),  // v5에서 제거됨
  onError: (err) => console.error(err),   // v5에서 제거됨
})

// ✅ v5
const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
})
const { data } = useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
  // onSuccess/onError 대신 useEffect나 useMutation callbacks 사용
})
```

### Query Key 관리 패턴

```typescript
// queries/user.keys.ts — 키 팩토리 패턴
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilter) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// 사용
useQuery({ queryKey: userKeys.detail(userId), queryFn: () => fetchUser(userId) })

// 관련 캐시 전체 무효화
queryClient.invalidateQueries({ queryKey: userKeys.all })
// 목록만 무효화
queryClient.invalidateQueries({ queryKey: userKeys.lists() })
```

### useQuery 핵심 옵션

```typescript
const { data, isPending, isError, error, isFetching, isStale } = useQuery({
  queryKey: ['posts', filters],
  queryFn: () => fetchPosts(filters),

  staleTime: 5 * 60 * 1000,   // 5분간 캐시 신선도 유지 (refetch 안 함)
  gcTime: 10 * 60 * 1000,     // 10분 후 캐시 가비지 컬렉션
  enabled: !!userId,           // userId 있을 때만 실행
  placeholderData: keepPreviousData,  // 페이지 전환 시 이전 데이터 유지
  select: (data) => data.items,       // 데이터 변환/선택
  refetchInterval: 30 * 1000,         // 30초마다 폴링
})

// isPending vs isLoading (v5 차이)
// isPending: 캐시 데이터도 없고 fetching 중
// isLoading: isPending && isFetching (= 첫 번째 로딩)
```

### useMutation + 캐시 업데이트

```typescript
// queries/post.mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postKeys } from './post.keys'

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePostInput) => createPost(data),

    // 성공 후 관련 캐시 무효화
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
    },

    // 낙관적 업데이트
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: postKeys.lists() })
      const previous = queryClient.getQueryData(postKeys.lists())

      queryClient.setQueryData(postKeys.lists(), (old: Post[]) => [
        ...old,
        { ...newData, id: 'temp', createdAt: new Date() },
      ])

      return { previous }  // rollback용 컨텍스트
    },

    onError: (err, newData, context) => {
      // 실패 시 롤백
      queryClient.setQueryData(postKeys.lists(), context?.previous)
    },

    onSettled: () => {
      // 성공/실패 무관 최종 동기화
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}
```

### 무한 스크롤 (useInfiniteQuery)

```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['posts', 'infinite'],
  queryFn: ({ pageParam }) => fetchPosts({ cursor: pageParam, limit: 20 }),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => lastPage.nextCursor,  // undefined면 마지막 페이지
})

// 전체 아이템 flatten
const posts = data?.pages.flatMap((page) => page.items) ?? []
```

### Next.js App Router + Prefetching (SSR)

```typescript
// app/posts/page.tsx (Server Component)
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

async function PostsPage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: postKeys.lists(),
    queryFn: fetchPosts,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostList />  {/* Client Component에서 useQuery → 캐시 히트 */}
    </HydrationBoundary>
  )
}
```

---

## Zustand + TanStack Query 조합 패턴

```typescript
// ✅ 올바른 역할 분리
// Zustand: 클라이언트 전용 UI 상태
const useModalStore = create<ModalStore>(...)
const useAuthStore = create<AuthStore>(...)

// TanStack Query: 서버 데이터
const { data: posts } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts })

// 조합 예시: 선택된 유저 ID는 Zustand, 유저 데이터는 Query
const selectedUserId = useStore((s) => s.selectedUserId)
const { data: user } = useQuery({
  queryKey: userKeys.detail(selectedUserId),
  queryFn: () => fetchUser(selectedUserId),
  enabled: !!selectedUserId,  // 선택된 유저 있을 때만 페칭
})

// ❌ 피해야 할 패턴: 서버 데이터를 Zustand에 저장
const usePostStore = create((set) => ({
  posts: [],  // ❌ API 응답 데이터를 Zustand에 저장
  fetchPosts: async () => {
    const data = await api.getPosts()
    set({ posts: data })  // ❌ 캐싱/동기화 직접 관리 = 복잡도 증가
  },
}))
```

---

## 스토어 파일 구조

```
src/
└── store/
    ├── index.ts              # 통합 스토어 export
    ├── slices/
    │   ├── auth.ts           # 인증 슬라이스
    │   ├── ui.ts             # UI 상태 슬라이스
    │   └── settings.ts       # 설정 슬라이스
    └── queries/
        ├── user.keys.ts      # 쿼리 키 팩토리
        ├── user.queries.ts   # useQuery 훅
        ├── user.mutations.ts # useMutation 훅
        └── post.keys.ts
```

---

## 흔한 실수 패턴

```typescript
// ❌ 컴포넌트 외부에서 QueryClient 생성 (Next.js SSR에서 공유됨)
const queryClient = new QueryClient()  // 모듈 최상위 → 요청 간 상태 공유 위험

// ✅ useState로 인스턴스당 생성
const [queryClient] = useState(() => new QueryClient())

// ❌ v5에서 onSuccess 사용
useQuery({ queryKey: ['x'], queryFn: fn, onSuccess: cb })  // 타입 에러

// ✅ useEffect 또는 mutation 콜백 사용
const { data } = useQuery(...)
useEffect(() => { if (data) doSomething(data) }, [data])

// ❌ enabled 없이 조건부 쿼리
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),  // userId가 undefined일 때 API 호출됨
})

// ✅ enabled 조건 설정
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId!),
  enabled: !!userId,
})
```
