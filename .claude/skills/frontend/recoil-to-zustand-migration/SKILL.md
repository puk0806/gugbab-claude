---
name: recoil-to-zustand-migration
description: 유지보수 중단된 Recoil 0.7에서 Zustand v5 / Jotai v2로 빠져나오는 전환 경로 — 대안 선택 기준, 개념 대응표, async selector 분리, 브리지 공존 패턴, 점진 이동 절차
---

# Recoil 탈출 마이그레이션 (→ Zustand v5 / Jotai v2)

> 소스: https://github.com/facebookexperimental/Recoil | https://recoiljs.org/docs | https://jotai.org/docs | https://zustand.docs.pmnd.rs | https://react.dev/blog/2024/04/25/react-19-upgrade-guide | https://github.com/pmndrs/jotai/releases (v3 마이그레이션 가이드)
> 검증일: 2026-09-28 (실사용 검증 v1.2, 직전 30~60일 주기 재검증 2026-09-26 — **Jotai 3.0.0 신규 릴리스 반영**, 이전 검증 2026-08-26)

---

## 0. 이 스킬의 범위와 상호 참조

이 스킬은 **전환 경로(migration path)** 만 다룬다. 도착지 라이브러리의 기본 사용법은 반복하지 않는다.

| 알고 싶은 것 | 참조할 스킬 |
|---|---|
| Zustand v5 기본 사용법·슬라이스·미들웨어·상태 레이어 분리 | `frontend/state-management` |
| TanStack Query v5 캐시·무효화·낙관적 업데이트·SSR | `frontend/tanstack-query` |
| **Recoil에서 무엇을 어떤 순서로 어떻게 빼낼 것인가** | **이 스킬** |

기준 버전 (2026-09-26 재확인):

| 패키지 | 버전 | React peer |
|---|---|---|
| `recoil` | **0.7.7** (2023-03-01, 마지막 릴리스, 변동 없음) | `>=16.13.1` |
| `zustand` | 5.0.15 (변동 없음) | `>=18.0.0` |
| `jotai` | **3.0.0** (2026-09 릴리스 — 2026-08-26 확인 시 2.20.3, **메이저 업 + 이 스킬 예제에 영향 있는 breaking change 포함**, §3-5 참조) | `>=18.0.0` (v3에서 상향, 이전 `>=17.0.0`) |
| `valtio` | 2.3.2 (변동 없음) | `>=18.0.0` |

> 이 스킬의 Jotai 코드 예시(2-3-3-1, 6-2, 6-3)는 **Jotai v2 API**로 작성되어 있다. `jotai@2.x`를 그대로 설치하면 예시가 정확히 동작한다. `jotai@3`를 새로 설치하는 경우 §3-5의 이관 표를 반드시 적용한다 — 특히 `atomFamily`·`loadable`은 **import 경로 자체가 바뀌거나 삭제**되어 예시를 그대로 복붙하면 컴파일이 안 된다.

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
| `atomFamily({key, default})` | **대응물 없음** → `Map`/레코드를 스토어에 보관 | `atomFamily((param) => atom(...))` (**v2**: `jotai/utils` / **v3**: `jotai-family` 패키지 — 3-5) | 파라미터 비교 규칙이 다름 (3-3) |
| `selectorFamily({key, get})` | 셀렉터 팩토리 `(id) => (s) => ...` + `useCallback` | `atomFamily((param) => atom((get) => ...))` | Zustand는 팩토리를 렌더마다 새로 만들면 안 됨 |
| `useRecoilState(a)` | `useStore((s) => s.v)` + `useStore((s) => s.setV)` | `useAtom(a)` | Jotai가 시그니처까지 동일 |
| `useRecoilValue(a)` | `useStore((s) => s.v)` | `useAtomValue(a)` | |
| `useSetRecoilState(a)` | `useStore((s) => s.setV)` | `useSetAtom(a)` | 값 구독 없이 쓰기만 → 리렌더 회피 목적 동일 |
| `useResetRecoilState(a)` | 액션에 `reset()` 직접 구현 | `useResetAtom(a)` + `atomWithReset` (`jotai/utils`) | Jotai는 **일반 atom에는 못 씀** — `atomWithReset`으로 선언해야 함 |
| `useRecoilValueLoadable(a)` | 대응물 없음 (TanStack Query로) | `loadable(a)` (**v2**: `jotai/utils` / **v3**: 제거됨, `unwrap` + 직접 구현 — 3-5) | **상태 문자열이 다름** (3-2) |
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

### 3-5. Jotai v3(2026-09 릴리스) — 이 스킬 예시에 영향 있는 breaking change

Recoil → Jotai로 갈 때 "Jotai 최신을 설치하자"고 무심코 `jotai@3`를 넣으면, 이 스킬의 v2 기반 예시가 **그대로 깨진다.** 공식 마이그레이션 가이드 기준 변경 사항:

| 항목 | v2 | v3 | 이 스킬에서 영향받는 곳 |
|---|---|---|---|
| **`atomFamily`** | `import { atomFamily } from 'jotai/utils'` | 별도 패키지로 이동 — `npm i jotai-family` 후 `import { atomFamily } from 'jotai-family'` | 3-3·6-2·6-3 (atomFamily 관련 코드 전부) |
| **`loadable`** | `import { loadable } from 'jotai/utils'` | **완전 제거, 직접 대체 패키지 없음.** `unwrap` 유틸 + `atom()` + try/catch로 직접 구현해야 함 | 3-2·4-2·6-3 (loadable 관련 코드 전부) |
| `atomWithReset` / `atomWithStorage` (`jotai/utils`) | 유지 | **변동 없음** — 계속 `jotai/utils`에서 import | 영향 없음 |
| read 함수의 `setSelf` | 지원 | **직접 대체 없음** — `onMount` 또는 `jotai-effect`로 재구현 | 이 스킬에서는 미사용(Recoil 개념) |
| 모듈 포맷 | CJS/UMD/ESM | **ESM 전용** (CJS·UMD·SystemJS 빌드 제거) | 번들러 미사용 환경이면 `NODE_ENV` 수동 정의 필요 |
| 최소 요구 | React 17 / TS 3.8 / Node 12.20 | **React 18 / TS 5.5 / Node ≥22.12.0** | React 17 프로젝트는 v3 설치 불가 |

```ts
// ❌ v3에서 그대로 쓰면 컴파일 에러 — 'jotai/utils'에 atomFamily 없음
import { atomFamily } from 'jotai/utils'

// ✅ v3
import { atomFamily } from 'jotai-family'   // npm install jotai-family 필요
```

```ts
// ❌ v3에서 'jotai/utils'에 loadable이 없음
import { loadable } from 'jotai/utils'

// ✅ v3 — unwrap + 직접 구현 (공식 가이드 권장 패턴)
import { atom } from 'jotai'
import { unwrap } from 'jotai/utils'

function myLoadable<T>(asyncAtom: ReturnType<typeof atom<Promise<T>>>) {
  return atom((get) => {
    try {
      const data = unwrap(asyncAtom, (prev) => prev)(get)
      return data === undefined
        ? ({ state: 'loading' } as const)
        : ({ state: 'hasData', data } as const)
    } catch (e) {
      return { state: 'hasError', error: e } as const
    }
  })
}
```

> **판단 기준**: 신규로 Recoil → Jotai 전환을 시작한다면 `jotai@3`으로 바로 가고 위 이관표를 적용한다. 이미 `jotai@2`로 전환을 진행 중이라면, 전환이 끝날 때까지 v2에 머무르고(2.20.3은 계속 npm에 남아 있다) 전환 완료 후 별도 태스크로 v3 업그레이드를 진행하는 편이 안전하다 — 전환과 메이저 업그레이드를 같은 PR에 섞지 않는다(9장 원칙과 동일).

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

> → references/REFERENCE.md §5 점진 마이그레이션 절차 — Recoil과 공존시키며 도메인 단위로

---

> → references/REFERENCE.md §6 실제 변환 예시

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

> → references/REFERENCE.md §8 흔한 실수

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

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
