---
name: recoil-to-zustand-migration
description: 유지보수 중단된 Recoil 0.7에서 Zustand v5 / Jotai v2로 빠져나오는 전환 경로 — 대안 선택 기준, 개념 대응표, async selector 분리, 브리지 공존 패턴, 점진 이동 절차
---

# Recoil 탈출 마이그레이션 (→ Zustand v5 / Jotai v2)

> 소스: https://github.com/facebookexperimental/Recoil | https://recoiljs.org/docs | https://jotai.org/docs | https://zustand.docs.pmnd.rs | https://react.dev/blog/2024/04/25/react-19-upgrade-guide
> 검증일: 2026-08-26

---

## 0. 이 스킬의 범위와 상호 참조

이 스킬은 **전환 경로(migration path)** 만 다룬다. 도착지 라이브러리의 기본 사용법은 반복하지 않는다.

| 알고 싶은 것 | 참조할 스킬 |
|---|---|
| Zustand v5 기본 사용법·슬라이스·미들웨어·상태 레이어 분리 | `frontend/state-management` |
| TanStack Query v5 캐시·무효화·낙관적 업데이트·SSR | `frontend/tanstack-query` |
| **Recoil에서 무엇을 어떤 순서로 어떻게 빼낼 것인가** | **이 스킬** |

기준 버전 (2026-08-26 확인):

| 패키지 | 버전 | React peer |
|---|---|---|
| `recoil` | **0.7.7** (2023-03-01, 마지막 릴리스) | `>=16.13.1` |
| `zustand` | 5.0.15 | `>=18.0.0` |
| `jotai` | 2.20.3 | `>=17.0.0` |
| `valtio` | 2.3.2 | `>=18.0.0` |

---

## 1. 왜 옮기는가 — 확인된 사실만

아래는 1차 소스로 확인된 내용이다. "Meta가 공식적으로 deprecated를 선언했다" 같은 **선언문은 존재하지 않는다** — 근거로 쓸 수 있는 것은 아카이브·릴리스 중단·미해결 이슈라는 관측 사실뿐이다.

| 사실 | 근거 |
|---|---|
| `facebookexperimental/Recoil` 저장소는 **2025-01-01에 소유자에 의해 아카이브**되어 read-only 상태 | GitHub 저장소 상단 아카이브 배너 |
| 마지막 릴리스는 **0.7.7 (2023-03-01)**. 아카이브 시점까지 약 22개월간 신규 릴리스 없음 | `CHANGELOG-recoil.md`, recoiljs.org 블로그 목록, npm registry |
| `main` 브랜치 CHANGELOG에는 릴리스되지 않은 `UPCOMING` 섹션이 남아 있음 → npm의 0.7.7과 저장소 HEAD가 다름 | `CHANGELOG-recoil.md` |
| **React 19에서 동작하지 않음.** `useRecoilValue`/`useRecoilValueLoadable` 호출 시 `TypeError: ...__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED is undefined` | 이슈 #2318 "React 19 support" (2024-05 오픈, 미해결 상태로 아카이브됨) |
| 원인: React 19가 `SECRET_INTERNALS` 접미사를 `_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE`로 **개명**. Recoil은 이 내부 객체를 뒤져 `useSyncExternalStore` 지원 여부를 판별했다 | React 19 Upgrade Guide — "we have renamed the `SECRET_INTERNALS` suffix" / "In the future we will more aggressively block accessing internals" |
| **React 18까지는 정상 동작**한다. 0.7.0(2022-03-31)에서 "Leverage new React 18 APIs", "Fixes for `<StrictMode>`" 반영 | `CHANGELOG-recoil.md` 0.7.0 항목 |
| `useTransition()` 연동은 **실험적**이며 `_TRANSITION_SUPPORT_UNSTABLE` 접미사 훅으로만 제공됨 | 동 changelog 0.7.0 항목 |

**정리 — 정확한 서술 방식:**

- ✅ "Recoil 저장소는 2025-01-01 아카이브되어 더 이상 수정이 반영되지 않는다. React 19 비호환 이슈가 미해결로 남았다."
- ❌ "Recoil은 버그투성이라 지금 당장 못 쓴다" — React 18 스택에서는 현재도 동작한다.
- ❌ "Meta가 Recoil을 deprecated로 공식 선언했다" — 그런 공지는 확인되지 않았다.

> **의사결정 기준:** React 18에 머무를 수 있고 Recoil 관련 장애가 없다면 **긴급하지 않다**. 다만 React 19 업그레이드·보안 패치·신규 채용자 학습비용을 고려하면 **탈출 경로를 미리 확보**해두는 것이 합리적이다. Vite + React 18 SPA라면 "React 19 업그레이드를 시도하는 순간 막힌다"가 실질적인 데드라인이다.

---

## 2. 대안 비교 — "무조건 Zustand"가 아니다

### 2-1. 모델 차이

| | Recoil | Zustand v5 | Jotai v2 | Valtio v2 |
|---|---|---|---|---|
| 상태 모델 | atom 그래프 (bottom-up) | 단일 스토어 + 셀렉터 (top-down) | **atom 그래프 (bottom-up)** | proxy 뮤테이션 + 스냅샷 |
| 상태 식별 | 문자열 `key` 필수 | 스토어 객체 + 셀렉터 경로 | **atom 객체의 참조 동일성** (key 없음) | 프로퍼티 접근 경로 |
| 파생 상태 | `selector` (그래프 노드) | 셀렉터 함수 (렌더 시 계산) | **파생 atom** (그래프 노드) | 스냅샷에서 계산 |
| 비동기 | async selector + Suspense/Loadable | 미들웨어 없음 (직접 구현) | **async atom + Suspense/loadable** | 없음 |
| Provider | `RecoilRoot` **필수** | 불필요 (모듈 스토어) | 선택 (provider-less 모드 지원) | 불필요 |
| 리렌더 최적화 | atom 단위 자동 구독 | 셀렉터 수동 지정 | atom 단위 자동 구독 | 접근한 프로퍼티 자동 추적 |

Jotai 공식 비교 문서는 Recoil과의 관계를 이렇게 적는다:
> "Jotai depends on atom object referential identities" / "Recoil depends on atom string keys"
> "similar about the general goals and basic techniques"

즉 **Recoil의 atom·selector 모델과 구조적으로 가장 가까운 것은 Jotai**다. Zustand는 모델 자체가 다르므로(그래프 → 단일 스토어) 전환이 곧 **재설계**를 의미한다.

### 2-2. 코드베이스별 선택 기준

| 판단 축 | Zustand v5로 | Jotai v2로 | 비고 |
|---|---|---|---|
| **atom 개수** | 수십 개 이하, 도메인 몇 개로 묶임 | 수백 개, 화면/행/셀 단위로 잘게 쪼개짐 | atom이 많을수록 단일 스토어로 접으면 셀렉터 지옥 |
| **selector 의존 그래프 깊이** | 1~2단계 (파생이 얕음) | **3단계 이상 / selector가 selector를 참조** | 깊은 그래프를 셀렉터 함수로 펴면 중복 계산·메모이제이션 부담 |
| **`atomFamily`/`selectorFamily` 사용량** | 거의 없음 | **광범위** | family는 Jotai에 1:1 대응물이 있음, Zustand에는 없음 |
| **async selector 사용 여부** | 서버 데이터가 대부분 → **TanStack Query로 분리**하고 나머지만 Zustand | 클라이언트 파생 비동기(계산·IndexedDB 등)가 섞여 있음 | 4장 참조 |
| **팀 학습 비용** | 낮음 (스토어 1개 + 셀렉터, Redux 경험 재사용) | 중간 (atom 사고방식 유지 = **Recoil 경험 재사용**) | 팀이 이미 atom 사고에 익숙하면 Jotai가 오히려 저렴 |
| **React 외부에서 상태 읽기/쓰기** | 쉬움 (`store.getState()`) | 가능 (`createStore()`/`getDefaultStore()`) | 둘 다 가능 |
| **DevTools 요구** | Redux DevTools 연동 성숙 | 상대적으로 약함 | Jotai 공식 비교: "if you prefer Redux devtools" → Zustand |
| **Suspense 적극 활용** | 부적합 | **적합** | Jotai 공식 비교: "if you want to make use of Suspense" → Jotai |
| **코드 스플리팅 중요** | 보통 | 유리 | Jotai 공식 비교: "If code splitting is important, Jotai should perform well" |

**Valtio는 언제?** 폼·에디터·캔버스처럼 **깊게 중첩된 객체를 잦게 국소 수정**하는 화면에 강하다(`state.rows[3].cells[2].value = 1`). 다만 Recoil의 atom 그래프와 모델이 가장 멀어 대규모 일괄 전환 대상으로는 부적합하다. 특정 화면에 국소 도입하는 용도로 고려한다.

### 2-3. 현실적인 권고 — 혼합이 정답인 경우가 많다

```
Recoil 상태 인벤토리
├─ 서버에서 온 데이터 (async selector/selectorFamily로 fetch)
│   └─→ TanStack Query v5        ← 대개 전체의 절반 이상
├─ 전역 UI/세션 상태 (모달, 사이드바, 인증, 설정)
│   └─→ Zustand v5 (슬라이스)
├─ 화면 단위로 잘게 쪼개진 파생 상태·atomFamily 다수
│   └─→ Jotai v2 (atom 구조 그대로 유지)
└─ 한 컴포넌트에서만 쓰이던 atom
    └─→ useState / useReducer (전역에서 아예 제거)
```

> Zustand와 Jotai는 **같은 프로젝트에 공존해도 문제없다**(둘 다 pmndrs, 서로 의존 없음). "하나만 골라야 한다"는 제약을 스스로 만들지 말 것. 다만 *같은 상태를 두 곳에 두는 것*은 금지다(8장).

---

## 3. 개념 대응표

### 3-1. 코어 API

| Recoil | Zustand v5 | Jotai v2 | 주의 |
|---|---|---|---|
| `atom({key, default})` | 스토어의 필드 1개 + setter | `atom(initialValue)` | Jotai는 **key 불필요** — `key` 문자열 전부 삭제 대상 |
| `selector({key, get})` | 셀렉터 함수 `(s) => ...` (그래프 노드 아님) | `atom((get) => ...)` (읽기 전용 파생 atom) | Zustand는 캐시가 없음 → 매 렌더 재계산 |
| `selector({key, get, set})` (쓰기 가능 selector) | 스토어 액션 함수 | `atom(read, write)` (read-write atom) | Jotai write 시그니처: `(get, set, ...args)` |
| `atomFamily({key, default})` | **대응물 없음** → `Map`/레코드를 스토어에 보관 | `atomFamily((param) => atom(...))` (`jotai/utils`) | 파라미터 비교 규칙이 다름 (3-3) |
| `selectorFamily({key, get})` | 셀렉터 팩토리 `(id) => (s) => ...` + `useCallback` | `atomFamily((param) => atom((get) => ...))` | Zustand는 팩토리를 렌더마다 새로 만들면 안 됨 |
| `useRecoilState(a)` | `useStore((s) => s.v)` + `useStore((s) => s.setV)` | `useAtom(a)` | Jotai가 시그니처까지 동일 |
| `useRecoilValue(a)` | `useStore((s) => s.v)` | `useAtomValue(a)` | |
| `useSetRecoilState(a)` | `useStore((s) => s.setV)` | `useSetAtom(a)` | 값 구독 없이 쓰기만 → 리렌더 회피 목적 동일 |
| `useResetRecoilState(a)` | 액션에 `reset()` 직접 구현 | `useResetAtom(a)` + `atomWithReset` (`jotai/utils`) | Jotai는 **일반 atom에는 못 씀** — `atomWithReset`으로 선언해야 함 |
| `useRecoilValueLoadable(a)` | 대응물 없음 (TanStack Query로) | `loadable(a)` (`jotai/utils`) | **상태 문자열이 다름** (3-2) |
| `useRecoilCallback(({snapshot, set}) => ...)` | `store.getState()` / `store.setState()` | `useAtomCallback` 또는 `useStore()` + `store.get/set` | |
| `<RecoilRoot>` | 불필요 (제거) | `<Provider>` (선택) 또는 provider-less | RecoilRoot는 **필수**였지만 Jotai Provider는 선택 |
| `<RecoilRoot override>` 중첩 스코프 | 스토어 인스턴스를 Context로 주입 | `createStore()` + `<Provider store={...}>` | 테스트 격리에서 자주 쓰이던 패턴 |
| `initializeState` (RecoilRoot prop) | `create()` 초기값 / `setState` | `useHydrateAtoms` 또는 `store.set` | |
| `Snapshot` / `useRecoilTransactionObserver_UNSTABLE` / `useGotoRecoilSnapshot` | **1:1 대응물 없음** | **1:1 대응물 없음** | 3-4 참조 |
| atom effects (`effects: [...]`) | 미들웨어 / `store.subscribe` | `atom`의 `onMount` + 커스텀 write | 영속화는 전용 유틸로 대체(6-4) |
| `cachePolicy_UNSTABLE` (selector LRU) | 없음 | 없음 | 캐시 정책이 필요하면 TanStack Query |

### 3-2. Loadable 상태 문자열이 다르다 (자동 치환 금지)

| | Recoil `Loadable` | Jotai `loadable()` |
|---|---|---|
| 성공 | `state === 'hasValue'`, 값은 **`contents`** | `state === 'hasData'`, 값은 **`data`** |
| 로딩 | `state === 'loading'`, `contents`는 Promise | `state === 'loading'` |
| 실패 | `state === 'hasError'`, `contents`는 Error | `state === 'hasError'`, 에러는 **`error`** |

```ts
// ❌ Recoil 습관 그대로 — Jotai에서는 영원히 false
if (l.state === 'hasValue') render(l.contents)

// ✅ Jotai
if (l.state === 'hasData') render(l.data)
```

`hasValue` → `hasData`, `contents` → `data`/`error` 두 군데를 함께 바꿔야 한다. `state` 값은 타입상 유니온이므로 TS에서 잡히지만, `contents`를 `any`로 흘려보내던 코드는 런타임까지 조용히 통과한다.

### 3-3. atomFamily 파라미터 비교 규칙이 다르다 (조용한 버그 1순위)

| | Recoil `atomFamily` | Jotai `atomFamily` |
|---|---|---|
| 비교 방식 | **값 동등성(value-equality), 직렬화 필수** | 기본 `Object.is` (**참조 동등성**) |
| 허용 파라미터 | primitive, 배열, 객체, Map, Set, `toJSON()` 보유 객체. "Custom classes or functions are not allowed" | 제한 없음 (`areEqual`로 제어) |
| 정리(cleanup) | 문서화된 명시적 제거 API 없음 | `family.remove(param)`, `family.setShouldRemove(fn)` |

```ts
// Recoil: 매번 새 객체를 넘겨도 같은 atom을 얻었다
const a = todoItemState({ listId: 1, index: 2 })

// ❌ Jotai 기본값(Object.is)에서는 렌더마다 다른 atom이 생성된다 → 상태 유실 + 메모리 누수
const b = todoItemFamily({ listId: 1, index: 2 })

// ✅ 객체 파라미터면 areEqual을 반드시 지정
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import deepEqual from 'fast-deep-equal'

export const todoItemFamily = atomFamily(
  (p: { listId: number; index: number }) => atom<Todo | null>(null),
  deepEqual,   // Recoil의 value-equality와 동등한 동작
)
```

> Jotai 공식 문서 경고: "Unless you explicitly remove unused params, this leads to memory leaks. This is crucial if you use infinite number of params."
> Recoil에서 무한 파라미터(스크롤 인덱스, 검색어 등)로 family를 쓰고 있었다면, 이동과 동시에 `setShouldRemove`를 붙여야 한다.

### 3-4. Snapshot에는 대응물이 없다 — 먼저 용도를 분류하라

Recoil `Snapshot`은 "an immutable snapshot of the state of Recoil atoms"이며 공식 용도는 "dev tools, global state synchronization, history navigation" 등이다. Zustand·Jotai에 **동일 기능은 없다.** 용도별로 다르게 처리한다.

| Snapshot 사용 목적 | 이동 방법 |
|---|---|
| 콜백 안에서 최신 값 읽기 (`snapshot.getLoadable(a).getValue()`) | Zustand `store.getState()` / Jotai `store.get(atom)` — **가장 흔한 케이스, 쉽게 대체됨** |
| 로깅·디버깅 (`useRecoilTransactionObserver_UNSTABLE`) | Zustand `devtools` 미들웨어 + `store.subscribe` / Jotai `store.sub` |
| Undo·Redo, 타임트래블 | **직접 구현 필요.** 히스토리 스택을 담는 전용 스토어를 새로 설계 (`zundo` 같은 서드파티 검토) |
| 전체 상태 덤프/복원 (에러 리포트 첨부 등) | 대상 상태를 명시적으로 나열하는 직렬화 함수를 손으로 작성 |

> 타임트래블·전체 덤프에 Snapshot을 쓰고 있었다면 **이 항목이 마이그레이션에서 가장 비싼 부분**이다. 인벤토리 단계에서 먼저 찾아내 별도 태스크로 분리하라.

---

## 4. async selector 처리 — 대부분은 "옮기는 게" 아니라 "분리하는 것"

Recoil의 async selector는 문서상 "The results are cached, so the query will only execute once per unique input"이지만, 동시에 "selector evaluations may be cached, restarted, or executed multiple times"이며 기본 캐시 정책은 `keep-all`(무한 보관, "may change in the future")이다.

즉 Recoil의 async selector는 **캐시는 있지만 서버 캐시 정책이 없다.**

| 서버 상태에 필요한 것 | Recoil async selector | TanStack Query v5 |
|---|---|---|
| stale 판정 / 자동 재요청 | 없음 (`useRecoilRefresher_UNSTABLE` 수동 호출) | `staleTime`, refetch 트리거 |
| 재시도·백오프 | 없음 | `retry` |
| 요청 취소 | 없음 | `AbortSignal` |
| 낙관적 업데이트·롤백 | 직접 구현 | `onMutate`/`onSettled` |
| 캐시 무효화 범위 지정 | 없음 | `invalidateQueries` (prefix 매칭) |
| GC | `cachePolicy_UNSTABLE`(UNSTABLE, 기본 keep-all) | `gcTime` |

### 4-1. 판정 규칙

```
그 async selector가 하는 일이…
├─ 네트워크/DB에서 "서버가 소유한 데이터"를 가져온다
│   └─→ TanStack Query로 분리  ✅ (기본값)
│        · queryKey = selectorFamily의 파라미터
│        · Zustand/Jotai에는 "선택된 id" 같은 입력값만 남긴다
│
├─ 이미 로드된 클라이언트 상태로부터 비동기 계산을 한다
│   (worker 호출, IndexedDB 조회, WASM 계산 등)
│   └─→ Jotai async atom + loadable  ✅
│
└─ 사실은 동기 계산인데 Promise로 감싸져 있다
    └─→ 그냥 동기 파생 atom / 셀렉터 함수로 내려라
```

```ts
// Recoil — 서버 데이터를 selectorFamily로 가져오던 코드
export const userQuery = selectorFamily<User, string>({
  key: 'userQuery',
  get: (id) => async () => (await fetch(`/api/users/${id}`)).json(),
})
// 컴포넌트: const user = useRecoilValue(userQuery(id))
//          또는 const l = useRecoilValueLoadable(userQuery(id))

// ✅ 이동 결과 — 상태 소유권 분리
// (1) "무엇을 보고 있는가"만 클라이언트 스토어에
const useSelectionStore = create<{ userId: string | null; select: (id: string) => void }>(
  (set) => ({ userId: null, select: (userId) => set({ userId }) }),
)

// (2) 서버 데이터는 TanStack Query
const userId = useSelectionStore((s) => s.userId)
const { data, isPending, isError } = useQuery({
  queryKey: userKeys.detail(userId!),
  queryFn: () => fetchUser(userId!),
  enabled: !!userId,
})
```

- 쿼리 키 설계·무효화·낙관적 업데이트는 **`frontend/tanstack-query` 스킬** 참조.
- 역할 분리 원칙(서버 상태를 전역 스토어에 넣지 않기)은 **`frontend/state-management` 스킬** 참조.

### 4-2. Suspense/Loadable 경계는 그대로 옮길 수 있다

| Recoil | TanStack Query | Jotai |
|---|---|---|
| `useRecoilValue(asyncSelector)` + `<Suspense>` | `useSuspenseQuery` + `<Suspense>` | `useAtomValue(asyncAtom)` + `<Suspense>` |
| `useRecoilValueLoadable` (Suspense 회피) | `useQuery` + `isPending`/`isError` | `useAtomValue(loadable(asyncAtom))` |
| 에러 → ErrorBoundary | `throwOnError` | ErrorBoundary |

> Jotai를 쓸 거라면 공식 확장 `jotai-tanstack-query`(TanStack Query v5 대응, `atomWithQuery`/`atomWithInfiniteQuery`/`atomWithMutation` 등)로 **atom 인터페이스를 유지한 채** 서버 상태만 Query로 넘길 수도 있다. Recoil의 `selectorFamily(query)` 형태를 최소 변경으로 살리고 싶을 때 유용하다.

---

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

```ts
// ── Jotai — 거의 1:1
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

```tsx
// ── 클라이언트 파생 비동기라면 Jotai async atom + loadable
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

## 7. React 18 StrictMode·동시성 주의점

React 공식 문서 기준, `<StrictMode>`는 **개발 환경에서만** 다음을 두 번 실행한다.
- 컴포넌트 함수 본문(최상위 로직)
- `useState`·set 함수·`useMemo`·`useReducer`에 넘긴 함수(초기화·업데이터)
- Effect를 setup → cleanup → setup 로 한 번 더
- ref 콜백을 setup → cleanup → setup 로 한 번 더

> "All of these checks are development-only and do not impact the production build."

이 동작이 마이그레이션에서 문제를 일으키는 지점:

| 주의점 | 내용 | 대응 |
|---|---|---|
| **렌더 중 스토어 생성** | `create()`를 컴포넌트 본문에서 호출하면 StrictMode에서 두 번 만들어지고, 리렌더마다 스토어가 갈린다 | `create()`는 **모듈 최상위**에. 인스턴스별 스토어가 필요하면 `useRef`/`useState(() => createStore())` + Context |
| **렌더 중 atom 생성** | Jotai atom은 참조 동일성이 곧 식별자다. 렌더에서 `atom()`을 만들면 매번 새 상태 + 무한 루프 위험 | 모듈 최상위 또는 `useMemo`/`useRef`. 공식 문구: "Referential equality is important … otherwise it can cause infinite loops" |
| **effect에서 중복 초기화** | setup이 두 번 도는데 cleanup이 없으면 브리지 구독·타이머가 이중 등록 | 5-4 브리지처럼 **항상 cleanup 반환**. Recoil atom effect도 cleanup 핸들러를 반환할 수 있다 |
| **렌더 중 setState** | 파생값을 effect로 스토어에 되쓰는 패턴은 StrictMode에서 두 번 발화 | 파생값은 스토어에 저장하지 말고 셀렉터/파생 atom으로 계산 |
| **tearing (동시성)** | Zustand v5는 React 18의 네이티브 `useSyncExternalStore`를 사용한다(v5에서 React 18 최소 요구, `use-sync-external-store` 의존 제거) → 동시 렌더링에서 찢어짐 방지 | 별도 조치 불필요. 단 **React 18 미만은 v5 불가** |
| **Recoil의 transition 지원은 실험적** | `useTransition()` 연동이 `_TRANSITION_SUPPORT_UNSTABLE` 접미사 훅으로만 제공됨 | 이행 기간 중 Recoil 값을 transition으로 감싸 최적화하려 하지 말 것 — 이동 후 정식 API로 처리 |
| **HMR에서 duplicate atom key** | Vite/Fast Refresh 환경에서 파일이 재평가되며 같은 key로 atom이 재선언되어 경고가 쏟아짐 | 0.7.6+의 `RecoilEnv.RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED = false`로 억제 가능하나 공식 경고: "This disables all checks for duplicate atom keys including legitimate errors, so use with caution!" — **이행 기간 임시 조치로만** 쓰고, 이동이 끝나면 원인 자체가 사라진다 |

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

---

## 9. 마이그레이션 체크리스트

```
[ ] 0. 인벤토리 작성 (atom/selector/family 목록 + 의존 그래프 + effects/Snapshot 사용처)
[ ] 1. 도착지 결정 — 2-2 기준표로 Zustand / Jotai / 혼합 판정, 결정 근거를 문서화
[ ] 2. 서버 데이터 async selector 목록 분리 → TanStack Query 이관 계획 (독립 트랙)
[ ] 3. 이동 순서 확정 — 말단 atom → 단일 컴포넌트 atom → 1단 파생 → 다단 파생 → effects → Snapshot
[ ] 4. 도메인별 테스트 안전망 확보 (없으면 먼저 작성)
[ ] 5. 공존 구성: RecoilRoot 유지한 채 새 스토어 도입, 브리지는 필요한 경우만·상한 설정
[ ] 6. 도메인 PR 단위 이동 + 5-5 검증표 통과 (잔존 참조 0건 / 이중 소유 없음 / 리렌더 회귀 확인)
[ ] 7. 영속 데이터 인계 확인 (기존 localStorage로 앱 기동 → 설정 유지)
[ ] 8. RecoilRoot 제거, recoil·recoil-persist 의존성 제거, 브리지 코드 삭제
[ ] 9. React 19 업그레이드 재시도 (원래 목표였다면)
```
