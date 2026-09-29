## 5. 점진 마이그레이션 절차 — Recoil과 공존시키며 도메인 단위로

전면 교체(빅뱅)는 대규모 SPA에서 거의 실패한다. Recoil은 **동작하는 상태로 남겨둔 채** 도메인 단위로 빼낸다.

### 5-1. 0단계 — 인벤토리 (코드 수정 없음)

```bash
# atom / selector 목록과 key 추출
rg -n "atom\(\{|selector\(\{|atomFamily\(\{|selectorFamily\(\{" src --stats

# 위험 신호 먼저 찾기
rg -n "useRecoilTransactionObserver_UNSTABLE|useGotoRecoilSnapshot|snapshot\.map|retain\(" src
rg -n "effects(_UNSTABLE)?:" src          # atom effects → 이동 비용 높음
rg -n "cachePolicy_UNSTABLE" src
rg -n "useRecoilValueLoadable|useRecoilRefresher_UNSTABLE" src
```

인벤토리 표를 만든다 — 컬럼: `key` / 종류(atom·selector·family) / **의존하는 노드** / **이 노드를 참조하는 노드** / 참조 컴포넌트 수 / 서버 데이터 여부 / effects 여부.

### 5-2. 이동 순서 — "말단(leaf)"의 정의부터 정확히

여기서 말단은 **다른 selector가 참조하지 않는 노드**다(= 의존 그래프에서 나가는 화살표만 있고 들어오는 파생이 없는 노드). 이런 atom은 파생 그래프를 건드리지 않고 통째로 옮길 수 있다.

```
1. 어떤 selector도 참조하지 않는 atom          ← 가장 안전, 여기서 시작
2. 단일 컴포넌트에서만 쓰이는 atom             ← 전역에서 제거하고 useState로 강등
3. 서버 데이터 async selector/selectorFamily   ← TanStack Query로 분리 (독립적으로 진행 가능)
4. 1단계 파생 selector (atom 하나만 참조)
5. 다단 파생 selector / selectorFamily         ← 하위 노드가 모두 이동된 뒤에
6. atom effects가 붙은 atom (영속화 등)         ← 저장 포맷 마이그레이션 동반
7. Snapshot 의존 기능 (undo/redo, 타임트래블)   ← 별도 설계 태스크
8. <RecoilRoot> 제거 + recoil 패키지 제거
```

원칙: **한 상태의 소유자는 항상 한 곳.** 도메인 하나를 옮기는 PR 안에서 해당 도메인은 완전히 넘어가야 하고, 절반만 옮긴 채 머지하지 않는다.

### 5-3. 공존 (브리지 없이) — 가능하면 이쪽

도메인이 **서로 참조하지 않는다면** 브리지가 필요 없다. `RecoilRoot`와 Zustand/Jotai는 아무 충돌 없이 같은 트리에서 동작한다.

```tsx
// App.tsx — 이행 기간
<RecoilRoot>          {/* 아직 안 옮긴 도메인 */}
  <QueryClientProvider client={qc}>
    <App />           {/* Zustand는 Provider 불필요, Jotai는 provider-less 사용 */}
  </QueryClientProvider>
</RecoilRoot>
```

**브리지는 최후의 수단이다.** 아래 조건일 때만 쓴다:
- 옮긴 도메인 A를 아직 못 옮긴 도메인 B의 selector가 참조한다
- 그리고 B를 이번 릴리스에 같이 옮길 수 없다

### 5-4. 브리지 패턴 (양방향 동기화) — 위험을 알고 쓴다

```ts
// bridge/themeBridge.ts — Recoil atom ↔ Zustand store 단일 값 동기화 (임시 코드)
import { atom, type AtomEffect } from 'recoil'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const useThemeStore = create<{ theme: Theme; setTheme: (t: Theme) => void }>()(
  subscribeWithSelector((set) => ({
    theme: 'light',
    setTheme: (theme) => set({ theme }),
  })),
)

// Recoil → Zustand, Zustand → Recoil 양방향
const bridgeEffect: AtomEffect<Theme> = ({ setSelf, onSet }) => {
  // 초기 동기화: 진실 원천은 "새 스토어"로 고정한다
  setSelf(useThemeStore.getState().theme)

  // Recoil에서 바뀌면 스토어로 밀어넣기
  onSet((newValue, _old, isReset) => {
    const next = isReset ? 'light' : newValue
    if (useThemeStore.getState().theme !== next) {
      useThemeStore.getState().setTheme(next)     // 값이 같으면 쓰지 않는다 (루프 차단)
    }
  })

  // 스토어에서 바뀌면 Recoil로 밀어넣기 — 셀렉터 구독이므로 theme 변경 시에만 발화
  return useThemeStore.subscribe((s) => s.theme, (theme) => setSelf(theme))
  //     ↑ 반환값 = cleanup 핸들러 (atom effect 규약)
}

export const themeState = atom<Theme>({
  key: 'theme',
  default: 'light',
  effects: [bridgeEffect],
})
```

무한 루프가 안 나는 근거 (둘 다 필요):
1. Recoil 공식 규약 — `onSet` "callback is not called due to changes from this effect's own `setSelf()`" → 스토어→Recoil 방향이 되돌아오지 않는다.
2. `subscribeWithSelector` + 반대 방향의 값 비교 가드 → Recoil→스토어 방향이 되돌아오지 않는다.

**브리지의 위험 — 반드시 인지할 것:**

| 위험 | 내용 | 완화 |
|---|---|---|
| 진실 원천 이중화 | 같은 값이 두 시스템에 존재. 한쪽만 리셋되면 영구 불일치 | 방향을 **한쪽 소유**로 고정. 리셋 경로도 반드시 양쪽 통과 |
| 무한 루프 | 가드 없이 서로 쓰기 | 값 비교 가드 + 셀렉터 구독 필수 |
| 렌더 타이밍 어긋남 | 두 스토어가 서로 다른 배치에서 리렌더 → 한 프레임 불일치 화면 | 같은 화면에서 두 값을 동시에 읽지 않게 설계 |
| 영구화 | "임시"라던 브리지가 남아 기술 부채가 됨 | 브리지 파일 상단에 제거 기한·담당 도메인 주석 필수, `bridge/` 폴더로 격리 |
| 테스트 취약 | 브리지가 전역 부수효과라 테스트 격리가 깨짐 | 브리지 등록을 앱 진입점 1곳으로 모으고 테스트에서는 미등록 |

> 브리지 개수 상한을 미리 정하라(예: 동시에 3개 이하). 상한에 걸리면 새 도메인 이동을 멈추고 기존 브리지부터 걷어낸다.

### 5-5. 단계별 검증 방법

각 도메인 PR마다 아래를 통과시킨다.

| 단계 | 검증 |
|---|---|
| 이동 전 | 해당 도메인 동작을 커버하는 테스트가 있는가? 없으면 **먼저 작성**(리팩터링 안전망) |
| 타입 | `tsc --noEmit` — 상태 타입이 그대로 옮겨졌는지. `any`로 뚫린 곳은 수동 확인 |
| 잔존 참조 | `rg "useRecoilValue|useRecoilState|useSetRecoilState" src/features/<domain>` 결과 0건 |
| 이중 소유 | 옮긴 상태의 Recoil atom이 **삭제되었거나** 브리지로만 존재하는가 (양쪽에 살아 있으면 실패) |
| 런타임 동등성 | 이동 전/후 동일 시나리오에서 렌더 결과 동일 — E2E 스모크 또는 스토리북 스냅샷 |
| 리렌더 회귀 | React DevTools Profiler로 이동 전/후 리렌더 횟수 비교 (셀렉터 미지정으로 늘어나기 쉬움) |
| 영속 데이터 | 기존 localStorage 값으로 앱을 켰을 때 정상 복원되는가 (6-4) |
| 최종 | `package.json`에서 `recoil`·`recoil-persist` 제거, `<RecoilRoot>` 삭제, 번들 사이즈 감소 확인 |

---

## 6. 실제 변환 예시

### 6-1. 기본 atom + 파생 상태

```ts
// ── Recoil (기존)
import { atom, selector } from 'recoil'

export const todosState = atom<Todo[]>({ key: 'todos', default: [] })
export const filterState = atom<Filter>({ key: 'filter', default: 'all' })

export const visibleTodosState = selector<Todo[]>({
  key: 'visibleTodos',
  get: ({ get }) => {
    const todos = get(todosState)
    const filter = get(filterState)
    return filter === 'all' ? todos : todos.filter((t) => t.status === filter)
  },
})
export const remainingCountState = selector<number>({
  key: 'remainingCount',
  get: ({ get }) => get(todosState).filter((t) => t.status === 'active').length,
})
```

```ts
// ── Zustand v5 버전
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

interface TodoStore {
  todos: Todo[]
  filter: Filter
  setTodos: (todos: Todo[]) => void
  setFilter: (filter: Filter) => void
  toggle: (id: string) => void
}

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  filter: 'all',
  setTodos: (todos) => set({ todos }),
  setFilter: (filter) => set({ filter }),
  toggle: (id) =>
    set((s) => ({
      todos: s.todos.map((t) =>
        t.id === id ? { ...t, status: t.status === 'done' ? 'active' : 'done' } : t,
      ),
    })),
}))

// 파생 상태 = 스토어 밖 순수 셀렉터 함수 (그래프 노드가 아님 → 캐시 없음)
export const selectVisibleTodos = (s: TodoStore) =>
  s.filter === 'all' ? s.todos : s.todos.filter((t) => t.status === s.filter)

export const selectRemainingCount = (s: TodoStore) =>
  s.todos.filter((t) => t.status === 'active').length

// 사용
const visible = useTodoStore(useShallow(selectVisibleTodos))  // ⚠️ 새 배열 반환 → useShallow 필수
const remaining = useTodoStore(selectRemainingCount)          // number(원시값) → 불필요
```

> **v5 필수 주의:** Zustand v5는 셀렉터가 새 참조를 반환하면 무한 루프가 발생할 수 있다(공식 마이그레이션 문서: "if a selector returns a new reference, it may cause infinite loops"). `filter`/`map`/객체 리터럴을 반환하는 셀렉터에는 `useShallow`를 붙인다. Recoil selector는 자동 캐싱되어 이 문제가 없었으므로, **기계적으로 옮기면 반드시 밟는 함정**이다.

```ts
// ── Jotai v2 버전 — 그래프 구조가 그대로 보존된다
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'

export const todosAtom = atom<Todo[]>([])
export const filterAtom = atom<Filter>('all')

export const visibleTodosAtom = atom((get) => {
  const todos = get(todosAtom)
  const filter = get(filterAtom)
  return filter === 'all' ? todos : todos.filter((t) => t.status === filter)
})
export const remainingCountAtom = atom(
  (get) => get(todosAtom).filter((t) => t.status === 'active').length,
)

// 쓰기 전용 atom = Recoil의 writable selector / useRecoilCallback 대체
export const toggleTodoAtom = atom(null, (get, set, id: string) => {
  set(todosAtom, get(todosAtom).map((t) =>
    t.id === id ? { ...t, status: t.status === 'done' ? 'active' : 'done' } : t,
  ))
})

// 사용
const [todos, setTodos] = useAtom(todosAtom)   // useRecoilState와 동일
const visible = useAtomValue(visibleTodosAtom) // useRecoilValue와 동일
const toggle = useSetAtom(toggleTodoAtom)      // useSetRecoilState와 동일
```

변환 규칙 요약(Jotai): `atom({key, default: X})` → `atom(X)`, `selector({key, get: ({get}) => ...})` → `atom((get) => ...)`, `useRecoilValue` → `useAtomValue`. **`key` 프로퍼티는 전부 삭제**하고 export 변수명이 사실상의 식별자가 된다.

### 6-2. atomFamily / selectorFamily

```ts
// ── Recoil
export const todoItemState = atomFamily<Todo | null, string>({
  key: 'todoItem',
  default: null,
})
export const todoLabelState = selectorFamily<string, string>({
  key: 'todoLabel',
  get: (id) => ({ get }) => get(todoItemState(id))?.title ?? '(없음)',
})
// 사용: const label = useRecoilValue(todoLabelState(id))
```

> 아래는 **Jotai v2** 기준 예시다. `jotai@3`(2026-09 릴리스)를 쓴다면 `atomFamily`의 import 경로가 `jotai-family` 패키지로 바뀐다 — SKILL.md §3-5 참조.

```ts
// ── Jotai — 거의 1:1 (v2: 'jotai/utils' / v3: 'jotai-family'로 패키지 자체가 바뀜 — SKILL.md §3-5)
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

export const todoItemFamily = atomFamily((id: string) => atom<Todo | null>(null))
export const todoLabelFamily = atomFamily((id: string) =>
  atom((get) => get(todoItemFamily(id))?.title ?? '(없음)'),
)
// 사용: const label = useAtomValue(todoLabelFamily(id))

// 무한 파라미터(검색어·스크롤 인덱스 등)라면 정리 정책 필수
todoItemFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60_000)
// 특정 항목 즉시 제거
todoItemFamily.remove(id)
```

```tsx
// ── Zustand — family에 대응물이 없다. 레코드로 접는다
import { useCallback } from 'react'

interface TodoItemStore {
  byId: Record<string, Todo | null>
  setItem: (id: string, todo: Todo | null) => void
  removeItem: (id: string) => void
}
export const useTodoItemStore = create<TodoItemStore>((set) => ({
  byId: {},
  setItem: (id, todo) => set((s) => ({ byId: { ...s.byId, [id]: todo } })),
  removeItem: (id) =>
    set((s) => {
      const { [id]: _removed, ...rest } = s.byId
      return { byId: rest }
    }),
}))

// 파라미터 있는 셀렉터: 렌더마다 새 함수가 되지 않게 useCallback으로 고정
function TodoLabel({ id }: { id: string }) {
  const label = useTodoItemStore(
    useCallback((s) => s.byId[id]?.title ?? '(없음)', [id]),   // 원시값 반환 → useShallow 불필요
  )
  return <span>{label}</span>
}
```

> `atomFamily`를 광범위하게 쓰고 있다면 이 표가 **Jotai를 고르는 결정적 근거**다. Zustand로 접으면 (1) 항목별 구독이 레코드 전체 구독으로 퇴화하기 쉽고, (2) 항목 삭제·GC를 직접 구현해야 하며, (3) 셀렉터 팩토리 메모이제이션 실수가 리렌더 폭증으로 이어진다.

### 6-3. async selector

```tsx
// ── Recoil
export const userQuery = selectorFamily<User, string>({
  key: 'userQuery',
  get: (id) => async () => {
    const res = await fetch(`/api/users/${id}`)
    if (!res.ok) throw new Error('failed')
    return res.json()
  },
})

function Profile({ id }: { id: string }) {
  const l = useRecoilValueLoadable(userQuery(id))
  if (l.state === 'loading') return <Spinner />
  if (l.state === 'hasError') return <Err />
  return <View user={l.contents} />
}
```

```tsx
// ── ✅ 권장: 서버 데이터 → TanStack Query (4장)
function Profile({ id }: { id: string }) {
  const { data, isPending, isError } = useQuery({
    queryKey: userKeys.detail(id),      // selectorFamily 파라미터 = queryKey
    queryFn: () => fetchUser(id),
  })
  if (isPending) return <Spinner />
  if (isError) return <Err />
  return <View user={data} />
}
```

> 아래도 **Jotai v2** 기준이다. `jotai@3`에서는 `loadable`이 **완전히 제거**되고 대체 패키지도 없다(`unwrap` + 직접 구현 필요), `atomFamily`는 `jotai-family` 패키지로 이동한다 — SKILL.md §3-5 참조.

```tsx
// ── 클라이언트 파생 비동기라면 Jotai async atom + loadable (v2 API — v3는 SKILL.md §3-5 참조)
import { atom, useAtomValue } from 'jotai'
import { atomFamily, loadable } from 'jotai/utils'

const heavyCalcFamily = atomFamily((id: string) =>
  atom(async (get, { signal }) => {                 // signal로 취소 지원
    const raw = get(rawDataAtom)
    return runInWorker(raw, id, signal)
  }),
)
const heavyCalcLoadableFamily = atomFamily((id: string) => loadable(heavyCalcFamily(id)))

function Panel({ id }: { id: string }) {
  const l = useAtomValue(heavyCalcLoadableFamily(id))
  if (l.state === 'loading') return <Spinner />
  if (l.state === 'hasError') return <Err />
  return <View data={l.data} />                     // ⚠️ hasData / data (3-2)
}
```

### 6-4. 영속화 — `recoil-persist` → `persist` / `atomWithStorage`

```ts
// ── Recoil (기존)
import { recoilPersist } from 'recoil-persist'
const { persistAtom } = recoilPersist({ key: 'app-state' })   // 기본 key: 'recoil-persist'

export const themeState = atom<Theme>({
  key: 'theme',
  default: 'light',
  effects_UNSTABLE: [persistAtom],
})
export const localeState = atom<Locale>({
  key: 'locale',
  default: 'ko',
  effects_UNSTABLE: [persistAtom],
})
```

`recoil-persist`는 **여러 atom을 하나의 스토리지 키에 객체로 모아** 저장한다(`app-state` → `{"theme":"dark","locale":"en"}`). 반면 `zustand/persist`는 `{ state: {...}, version: n }` 래핑 포맷을 쓴다. **키 이름을 재사용해도 포맷이 달라 그대로는 못 읽는다** — 기존 사용자 설정이 날아간다.

```ts
// ── Zustand v5 + persist (+ 기존 값 1회성 인계)
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const LEGACY_KEY = 'app-state'

function readLegacy(): Partial<{ theme: Theme; locale: Locale }> {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)           // recoil-persist 포맷: { [atomKey]: value }
    return { theme: parsed.theme, locale: parsed.locale }
  } catch {
    return {}                                 // 파싱 실패 시 조용히 기본값
  }
}

interface SettingsStore {
  theme: Theme
  locale: Locale
  setTheme: (t: Theme) => void
  setLocale: (l: Locale) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'light',
      locale: 'ko',
      ...readLegacy(),                        // 최초 1회 인계
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'settings-storage',               // 새 키 (기존 키와 분리)
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme, locale: s.locale }),  // 함수는 저장 대상에서 제외
      version: 1,
      migrate: (persisted, _from) => persisted as SettingsStore,  // 이후 스키마 변경 대비
    },
  ),
)

// 인계가 끝난 릴리스 이후 정리
// localStorage.removeItem(LEGACY_KEY)
```

> **v5 변경점:** "Persist middleware no longer stores item at store creation" — 스토어 생성만으로는 스토리지에 기록되지 않는다. 첫 `set` 이전 상태가 저장될 것으로 가정한 코드가 있으면 깨진다.
> 하이드레이션 타이밍이 필요하면 `onRehydrateStorage`, `persist.hasHydrated()`, `persist.onFinishHydration()`을 쓰고, SSR에서는 `skipHydration` + 수동 `rehydrate()`를 쓴다.

```ts
// ── Jotai 버전
import { atomWithStorage } from 'jotai/utils'

export const themeAtom = atomWithStorage<Theme>('theme', 'light', undefined, {
  getOnInit: true,     // ⚠️ 기본값 false — 지정하지 않으면 첫 렌더에 저장값이 아닌 initialValue가 나온다
})
```

`atomWithStorage`는 기본적으로 localStorage + `storage` 이벤트 구독(탭 간 동기화)을 쓰고, `RESET` 심볼을 세팅하면 항목을 삭제한다. `getOnInit`을 켜면 첫 렌더부터 저장값을 읽지만 **SSR에서는 hydration mismatch**가 나므로, 서버 렌더가 있는 앱이라면 client-only 경계로 감싸거나 `typeof window !== 'undefined'` 가드를 둔다.

### 6-5. RecoilRoot 제거 / 테스트 격리

```tsx
// ── Recoil: 테스트마다 새 RecoilRoot로 상태 격리
render(
  <RecoilRoot initializeState={({ set }) => set(themeState, 'dark')}>
    <Target />
  </RecoilRoot>,
)

// ── Jotai: createStore + Provider (동일한 격리 효과)
import { createStore, Provider } from 'jotai'
const store = createStore()
store.set(themeAtom, 'dark')
render(<Provider store={store}><Target /></Provider>)

// ── Zustand: 모듈 스토어는 테스트 간 상태가 남는다 → 명시적 리셋 필요
const initial = useSettingsStore.getState()
beforeEach(() => useSettingsStore.setState(initial, true))   // replace=true로 완전 초기화
```

> Zustand의 모듈 스토어는 **테스트 간 상태가 공유된다.** Recoil은 `RecoilRoot`가 테스트마다 새 스코프를 만들어 줬으므로, 이동 후 테스트가 실행 순서에 따라 깨지기 시작하면 십중팔구 이 리셋 누락이다.
> v5에서 `setState(x, true)`는 완전한 상태 객체를 요구한다(타입이 엄격해짐).

---

## 8. 흔한 실수

### 8-1. 전역 스토어 하나에 전부 몰아넣기

```ts
// ❌ Recoil atom 100개를 Zustand 스토어 하나의 필드 100개로 평면 이식
export const useAppStore = create<Everything>(() => ({
  user: null, todos: [], modalOpen: false, tableRows: {}, draftForm: {}, /* … */
}))
const state = useAppStore()   // 전체 구독 → 아무 필드나 바뀌면 전 컴포넌트 리렌더
```

Recoil은 atom 단위 자동 구독이었기 때문에 이 문제가 없었다. Zustand로 접을 때는 **셀렉터를 반드시 지정**하고, 도메인별 슬라이스로 나눈다(슬라이스 패턴은 `frontend/state-management` 참조). 필드가 수십 개를 넘어가고 화면 단위로 잘게 갈린다면 그건 Zustand가 아니라 **Jotai를 골랐어야 한다는 신호**다(2-2).

### 8-2. 서버 상태를 그대로 옮겨오기

```ts
// ❌ async selector를 Zustand 액션으로 "직역"
const useUserStore = create((set) => ({
  user: null,
  loading: false,
  fetchUser: async (id) => {
    set({ loading: true })
    set({ user: await fetchUser(id), loading: false })
  },
}))
// → 재요청·stale 판정·취소·중복 요청 제거·에러 재시도·캐시 무효화를 전부 손으로 다시 짜게 된다
```

Recoil async selector에는 최소한 **입력별 캐시**가 있었으므로, 위 코드는 기존보다 **기능이 후퇴한 상태**다. 서버 데이터는 TanStack Query로 보낸다(4장).

### 8-3. selector를 `useMemo`로 순진하게 대체하기

```ts
// ❌ selector를 컴포넌트 안 useMemo로 옮김
const todos = useTodoStore((s) => s.todos)
const filter = useTodoStore((s) => s.filter)
const visible = useMemo(() => todos.filter((t) => t.status === filter), [todos, filter])
```

무엇이 문제인가:
- Recoil selector는 **전역에 하나 존재하는 그래프 노드**라 N개 컴포넌트가 써도 계산은 1회. `useMemo`는 **컴포넌트 인스턴스마다 별도 캐시** → N배 계산 + N배 메모리.
- 파생이 다단계면 각 단계가 컴포넌트별로 중복 계산된다.
- 의존성 배열을 손으로 관리하게 되어 누락 시 stale 값이 조용히 남는다.

```ts
// ✅ Zustand: 파생 로직을 모듈 스코프 순수 함수로 두고 셀렉터로 사용
export const selectVisibleTodos = (s: TodoStore) => /* … */
const visible = useTodoStore(useShallow(selectVisibleTodos))
// 계산이 정말 비싸면 reselect 등 메모이즈 셀렉터를 모듈 스코프에 1개 생성해 공유

// ✅ Jotai: 파생 atom = 그래프 노드 → Recoil selector와 동일한 공유 캐시 의미론
export const visibleTodosAtom = atom((get) => /* … */)
```

### 8-4. 그 밖의 실수 목록

| 실수 | 결과 | 대응 |
|---|---|---|
| Recoil atom과 새 스토어에 **같은 상태를 동시에** 남겨둠 | 화면마다 다른 값이 보이는 유령 버그 | 도메인 이동 PR에서 원본 atom을 반드시 삭제 또는 브리지 전용으로 축소 |
| Jotai `atomFamily`에 객체 파라미터를 넘기며 `areEqual` 미지정 | 매 렌더 새 atom, 상태 유실 + 메모리 누수 | `deepEqual` 지정 (3-3) |
| `l.state === 'hasValue'` / `l.contents`를 Jotai에서 그대로 사용 | 항상 로딩 화면 | `hasData` / `data` (3-2) |
| Zustand 셀렉터가 새 객체·배열을 반환하는데 `useShallow` 미사용 | v5에서 무한 렌더 루프 | `useShallow` 또는 원시값 단위 구독 |
| 파라미터 셀렉터를 렌더 안에서 인라인 생성 | 매 렌더 새 함수 → 구독 재설정 | `useCallback([id])`로 고정 |
| `recoil-persist` 키를 `zustand/persist` `name`에 그대로 재사용 | 포맷 불일치로 사용자 설정 초기화 | 새 키 + 1회성 인계 코드 (6-4) |
| `atomWithStorage`에 `getOnInit` 미지정 | 첫 렌더에 저장값 대신 기본값 표시(깜빡임) | `{ getOnInit: true }` (SSR이면 client-only 경계) |
| 테스트에서 Zustand 스토어 리셋 누락 | 테스트 실행 순서에 따라 간헐 실패 | `beforeEach`에서 초기 상태 복원 (6-5) |
| 브리지를 "임시"라며 방치 | 두 시스템 영구 공존 = 부채 고착 | 브리지 개수 상한 + 제거 기한 주석 (5-4) |
| `Snapshot` 기반 undo/redo를 마지막에 발견 | 일정 붕괴 | 0단계 인벤토리에서 먼저 찾아 별도 태스크로 분리 (3-4) |
