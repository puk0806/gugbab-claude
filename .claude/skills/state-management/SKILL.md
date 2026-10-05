---
name: state-management
description: Zustand v5 전역 상태관리, TanStack Query v5 서버 상태/캐싱 전략, 상태 레이어 분리 아키텍처
---

# 상태 관리 패턴 (Zustand v5 + TanStack Query v5)

> 소스: https://zustand.docs.pmnd.rs | https://tanstack.com/query/v5/docs
> 검증일: 2026-09-28 (최초 2026-06-20 · 08-26/09-28 재검증: Zustand 5.0.15·TanStack Query 5.104.0 최신, Zustand API 변경 없음. TanStack Query 사용법 상세는 `frontend/tanstack-query`, v4→v5 전환은 `frontend/tanstack-query-v4-to-v5-migration`이 정본 — 본문 중복 절 축소 완료(2026-09-28))

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

## TanStack Query v5 — 이 스킬의 범위

이 스킬은 **상태 분류 기준**(무엇을 서버 상태/Zustand/지역 상태로 볼지)과 **Zustand ↔ TanStack Query 조합 패턴**까지만 다룬다.
쿼리 키 팩토리·`useQuery` 핵심 옵션·`useMutation`(낙관적 업데이트 포함)·`useInfiniteQuery`·Next.js SSR prefetch 같은 TanStack Query 사용법 상세와 v4→v5 마이그레이션은 아래 정본 스킬에만 싣는다 (중복 방지 — 특히 낙관적 업데이트 콜백 시그니처는 v5.89.0에서 `(err, variables, onMutateResult, context)`로 확장되었으므로 반드시 정본 쪽을 따른다).

| 필요한 것 | 정본 스킬 |
|-----------|-----------|
| `useQuery`/`useMutation`/`useInfiniteQuery` 사용법, 쿼리 키 팩토리, SSR prefetch, 낙관적 업데이트 | `frontend/tanstack-query` |
| v4 → v5 전환(콜백 제거·객체 문법·`cacheTime`→`gcTime` 등) | `frontend/tanstack-query-v4-to-v5-migration` |

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
// (쿼리 키 팩토리 패턴은 frontend/tanstack-query 참조)
const selectedUserId = useStore((s) => s.selectedUserId)
const { data: user } = useQuery({
  queryKey: ['user', selectedUserId],
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
