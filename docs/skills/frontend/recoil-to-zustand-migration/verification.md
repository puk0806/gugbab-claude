---
skill: recoil-to-zustand-migration
category: frontend
version: v1
date: 2026-08-26
status: PENDING_TEST
---

# recoil-to-zustand-migration 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `recoil-to-zustand-migration` |
| 스킬 경로 | `.claude/skills/frontend/recoil-to-zustand-migration/SKILL.md` |
| 검증일 | 2026-08-26 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 기준 버전 | `recoil` 0.7.7 / `zustand` 5.0.15 / `jotai` 2.20.3 / `valtio` 2.3.2 (React 18 기준, React 19 비호환 경로 포함) |

---

## 1. 작업 목록 (Task List)

- [✅] 검증 템플릿 확인 (`docs/skills/VERIFICATION_TEMPLATE.md` — 8개 섹션 구조)
- [✅] 중복 스킬 확인 (`.claude/skills/**/recoil*/SKILL.md` → 결과 없음, 신규 생성 확정)
- [✅] 기존 `frontend/state-management` 스킬 Read → 중복 범위 제거 및 상호 참조 포인터 삽입
- [✅] 기존 `frontend/tanstack-query` verification.md 형식 확인 → 동일 8개 섹션 구조 준수
- [✅] 1순위 소스 확인 — Recoil 저장소 아카이브 상태·CHANGELOG·릴리스·공식 문서(recoiljs.org)
- [✅] 1순위 소스 확인 — Jotai 공식 문서(core/atom, core/store, core/use-atom, utils family·async·resettable·storage, basics/comparison)
- [✅] 1순위 소스 확인 — Zustand 공식 문서(persist 레퍼런스, v5 마이그레이션 가이드), Valtio 공식 문서
- [✅] 1순위 소스 확인 — React 공식(StrictMode 레퍼런스, React 19 릴리스·업그레이드 가이드)
- [✅] 최신 버전 확인 (날짜: 2026-08-26 / npm registry latest 4종 조회)
- [✅] Recoil 유지보수 현황을 **관측 사실 단위**로 분해 (아카이브일·마지막 릴리스·미해결 이슈) — 추정·단정 배제
- [✅] 대안 비교표 + 코드베이스별 선택 기준표 작성 (atom 개수 / 그래프 깊이 / family 사용량 / async selector / 학습 비용)
- [✅] 개념 대응표 작성 (코어 API 19행 + Loadable 상태 + atomFamily 파라미터 규칙 + Snapshot 용도 분해)
- [✅] async selector → TanStack Query 분리 판정 규칙 작성 + 기존 스킬 2종 상호 참조
- [✅] 점진 마이그레이션 절차(인벤토리 → 이동 순서 → 공존 → 브리지 → 단계별 검증) 작성
- [✅] 변환 코드 예시 작성 (기본 atom·파생 / atomFamily·selectorFamily / async / persist / 테스트 격리 — 각각 Zustand·Jotai 대비)
- [✅] React 18 StrictMode·동시성 주의점 정리
- [✅] 흔한 실수 패턴 정리 (3개 상세 + 표 10종)
- [✅] SKILL.md 파일 작성
- [✅] verification.md 작성
- [✅] skill-tester 2단계 테스트 — 2026-08-26 완료 (Q1~Q4 4/4 PASS, 섹션 5 참조)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 확보 |
| 중복 확인 | Glob | `.claude/skills/**/recoil*/SKILL.md` | 결과 없음 → 신규 생성 확정 |
| 범위 분리 | Read | `.claude/skills/frontend/state-management/SKILL.md` | Zustand 기본 사용법·슬라이스·미들웨어·상태 분류표는 기존 스킬에 존재 → 이 스킬에서 제외하고 포인터로 연결 |
| 형식 정렬 | Read | `docs/skills/frontend/tanstack-query/verification.md` | 섹션 번호·제목·판정표 형식 정렬 |
| 조사 | WebFetch | Recoil 저장소 루트, `CHANGELOG-recoil.md`(raw), 릴리스 목록, 이슈 #2318·#2324, recoiljs.org 블로그·0.7.6 릴리스 노트, 공식 문서 6종(atomFamily·useRecoilValueLoadable·RecoilRoot·Snapshot·selector·asynchronous-data-queries·atom-effects·useRecoilState) | Recoil 유지보수 사실·API 원문 확보 |
| 조사 | WebFetch | jotai.org 문서 7종(basics/concepts·basics/comparison·core/atom·core/store·core/use-atom·utils family·utils async·utils resettable·utils storage·extensions/query) + GitHub raw `docs/utilities/storage.mdx` | atom 모델·Recoil 비교 원문·family 규칙·loadable 형태·getOnInit 기본값 확보 |
| 조사 | WebFetch | zustand.docs.pmnd.rs (persist 레퍼런스, v5 마이그레이션), valtio.dev getting-started, npm registry latest 4종 | 버전·peerDeps·persist 옵션·v5 breaking change 확보 |
| 조사 | WebFetch | react.dev — StrictMode 레퍼런스, React 19 릴리스 포스트, React 19 업그레이드 가이드 | StrictMode 이중 호출 목록, SECRET_INTERNALS 개명 원문 확보 |
| 교차 검증 | WebSearch | "Recoil repository archived date", "Recoil 0.7.7 React 19 useSyncExternalStore", "React 19 SECRET_INTERNALS 개명", "zustand v5 breaking changes", "zustand subscribeWithSelector", "RecoilEnv duplicate atom key" 등 6회 | 14개 클레임을 독립 소스 2개 이상으로 대조 |
| 교차 검증 결과 | — | 14개 클레임 | **VERIFIED 13 / DISPUTED 1 / UNVERIFIED 0** |

> 총 WebFetch 약 30회, WebSearch 6회. 모든 핵심 클레임은 공식 저장소·공식 문서·npm registry 원문에서 확인했으며, 커뮤니티 글은 근거로 채택하지 않았다(검색 결과 요약만으로 서술한 항목 없음).

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Recoil 공식 저장소 (아카이브 배너) | https://github.com/facebookexperimental/Recoil | ⭐⭐⭐ High | 2026-08-26 | "archived by the owner on Jan 1, 2025. It is now read-only." |
| Recoil CHANGELOG (main, raw) | https://raw.githubusercontent.com/facebookexperimental/Recoil/main/CHANGELOG-recoil.md | ⭐⭐⭐ High | 2026-08-26 | 0.7.7 = 2023-03-01, 0.7.0 = 2022-03-31, UPCOMING 섹션 잔존 |
| Recoil 이슈 #2318 (React 19 support) | https://github.com/facebookexperimental/Recoil/issues/2318 | ⭐⭐⭐ High | 2026-08-26 | React 19 RC에서 `__SECRET_INTERNALS...` undefined, 미해결 |
| Recoil 이슈 #2324 (유지보수 문의) | https://github.com/facebookexperimental/Recoil/issues/2324 | ⭐⭐⭐ High | 2026-08-26 | 2024-08 문의, 유지보수 답변 없음 |
| Recoil 블로그 목록 | https://recoiljs.org/blog/ | ⭐⭐⭐ High | 2026-08-26 | 최신 포스트 = Recoil 0.7.7 (2023-03-01) |
| Recoil 0.7.6 릴리스 노트 | https://recoiljs.org/blog/2022/10/11/recoil-0.7.6-release/ | ⭐⭐⭐ High | 2026-08-26 | `RecoilEnv.RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED` 및 경고 문구 |
| Recoil 공식 문서 (atomFamily) | https://recoiljs.org/docs/api-reference/utils/atomFamily/ | ⭐⭐⭐ High | 2026-08-26 | "compared using value-equality and must be serializable" |
| Recoil 공식 문서 (useRecoilValueLoadable) | https://recoiljs.org/docs/api-reference/core/useRecoilValueLoadable/ | ⭐⭐⭐ High | 2026-08-26 | state = `hasValue`/`loading`/`hasError`, 값은 `contents` |
| Recoil 공식 문서 (RecoilRoot) | https://recoiljs.org/docs/api-reference/core/RecoilRoot/ | ⭐⭐⭐ High | 2026-08-26 | 필수 Provider, `initializeState`, `override` 중첩 스코프 |
| Recoil 공식 문서 (Snapshot) | https://recoiljs.org/docs/api-reference/core/Snapshot/ | ⭐⭐⭐ High | 2026-08-26 | "immutable snapshot", 용도 = dev tools·동기화·history navigation |
| Recoil 공식 문서 (selector) | https://recoiljs.org/docs/api-reference/core/selector/ | ⭐⭐⭐ High | 2026-08-26 | `cachePolicy_UNSTABLE` 기본 `keep-all`, "may change in the future" |
| Recoil 공식 가이드 (Asynchronous Data Queries) | https://recoiljs.org/docs/guides/asynchronous-data-queries/ | ⭐⭐⭐ High | 2026-08-26 | 캐시 문구, refresh 3전략, Loadable 대안 |
| Recoil 공식 가이드 (Atom Effects) | https://recoiljs.org/docs/guides/atom-effects/ | ⭐⭐⭐ High | 2026-08-26 | effect 시그니처, cleanup 반환, "not called due to this effect's own setSelf()" |
| Recoil 공식 문서 (useRecoilState) | https://recoiljs.org/docs/api-reference/core/useRecoilState/ | ⭐⭐⭐ High | 2026-08-26 | 읽기/쓰기 전용 훅 권장 근거 |
| recoil-persist 저장소 | https://github.com/polemius/recoil-persist | ⭐⭐ Medium-High | 2026-08-26 | 커뮤니티 패키지(공식 아님). 기본 key `recoil-persist`, 단일 키에 통합 저장 |
| Jotai 공식 문서 (comparison) | https://jotai.org/docs/basics/comparison | ⭐⭐⭐ High | 2026-08-26 | Recoil = string key vs Jotai = 참조 동일성, Zustand/Jotai 선택 기준 |
| Jotai 공식 문서 (core/atom) | https://jotai.org/docs/core/atom | ⭐⭐⭐ High | 2026-08-26 | primitive/derived/write-only, key 불필요, async atom + signal |
| Jotai 공식 문서 (core/store) | https://jotai.org/docs/core/store | ⭐⭐⭐ High | 2026-08-26 | `createStore`(get/set/sub), `getDefaultStore` provider-less |
| Jotai 공식 문서 (core/use-atom) | https://jotai.org/docs/core/use-atom | ⭐⭐⭐ High | 2026-08-26 | `useAtom`/`useAtomValue`/`useSetAtom`, 참조 동일성 경고 |
| Jotai 공식 문서 (utils/family) | https://jotai.org/docs/utilities/family | ⭐⭐⭐ High | 2026-08-26 | `areEqual` 기본 `Object.is`, deepEqual = Recoil 동작, 메모리 누수 경고, remove/setShouldRemove |
| Jotai 공식 문서 (utils/async) | https://jotai.org/docs/utilities/async | ⭐⭐⭐ High | 2026-08-26 | `loadable` state = `loading`/`hasData`/`hasError`, `unwrap` |
| Jotai 공식 문서 (utils/resettable) | https://jotai.org/docs/utilities/resettable | ⭐⭐⭐ High | 2026-08-26 | `atomWithReset`/`RESET`/`useResetAtom` 시그니처 |
| Jotai 공식 문서 (utils/storage) + GitHub raw | https://jotai.org/docs/utilities/storage / https://raw.githubusercontent.com/pmndrs/jotai/main/docs/utilities/storage.mdx | ⭐⭐⭐ High | 2026-08-26 | `atomWithStorage` 시그니처, `getOnInit` 기본 false, SSR 주의 |
| Jotai 공식 확장 (TanStack Query) | https://jotai.org/docs/extensions/query | ⭐⭐⭐ High | 2026-08-26 | `jotai-tanstack-query`, TanStack Query v5 대응 |
| Zustand 공식 문서 (persist) | https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data | ⭐⭐⭐ High | 2026-08-26 | name/storage/partialize/version/migrate/merge/skipHydration, hasHydrated·rehydrate |
| Zustand 공식 문서 (v5 마이그레이션) | https://zustand.docs.pmnd.rs/reference/migrations/migrating-to-v5 | ⭐⭐⭐ High | 2026-08-26 | React 18·TS 4.5 최소, default export 제거, 새 참조 반환 시 무한 루프, persist 생성 시 미저장 |
| Zustand 저장소 (subscribeWithSelector) | https://github.com/pmndrs/zustand/blob/main/src/middleware/subscribeWithSelector.ts | ⭐⭐⭐ High | 2026-08-26 | `subscribe(selector, listener, {equalityFn, fireImmediately})` |
| Valtio 공식 문서 | https://valtio.dev/docs/introduction/getting-started | ⭐⭐⭐ High | 2026-08-26 | proxy 뮤테이션 + `useSnapshot` 자동 추적 |
| npm registry (recoil / zustand / jotai / valtio) | https://registry.npmjs.org/{pkg}/latest | ⭐⭐⭐ High | 2026-08-26 | 0.7.7 / 5.0.15 / 2.20.3 / 2.3.2 및 peerDeps |
| React 공식 (StrictMode) | https://react.dev/reference/react/StrictMode | ⭐⭐⭐ High | 2026-08-26 | 이중 호출 대상 4종, development-only |
| React 공식 (19 업그레이드 가이드) | https://react.dev/blog/2024/04/25/react-19-upgrade-guide | ⭐⭐⭐ High | 2026-08-26 | "renamed the `SECRET_INTERNALS` suffix to `_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE`" |
| React 공식 (v19 릴리스) | https://react.dev/blog/2024/12/05/react-19 | ⭐⭐⭐ High | 2026-08-26 | React 19 stable = 2024-12-05 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 1건은 1차 소스 3종 기준으로 확정 후 반영)
- [✅] 버전 정보가 명시되어 있음 (recoil 0.7.7 / zustand 5.0.15 / jotai 2.20.3 / valtio 2.3.2 + peerDeps 표)
- [✅] deprecated·중단 상태를 **사실 기반**으로만 서술 (아카이브일·릴리스 중단·미해결 이슈. "Meta 공식 deprecated 선언"은 확인 불가로 명시적 부정)
- [✅] deprecated 패턴을 권장하지 않음 (zustand default import·`create(...)(equalityFn)` 미사용, `effects_UNSTABLE`는 기존 코드 인용에만 등장)
- [✅] 코드 예시가 실행 가능한 형태임 (import 문 포함, TS 타입 명시)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (`> 소스:` / `> 검증일: 2026-08-26`)
- [✅] 핵심 개념 설명 포함 (atom 그래프 vs 단일 스토어 모델 대비)
- [✅] 코드 예시 포함 (5개 변환 시나리오 × Zustand/Jotai 대비)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (2-2 선택 기준표, 4-1 async 판정 규칙, 5-3 브리지 사용 조건)
- [✅] 흔한 실수 패턴 포함 (상세 3개 + 표 10종)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (대응표 → 코드 → 검증 순으로 연결)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (인벤토리 rg 명령, 브리지 구현, persist 인계 코드)
- [✅] 범용적으로 사용 가능 (특정 프로젝트명·경로 종속 없음. Vite·React 18 상황은 일반화된 서술로만 등장)
- [✅] 기존 스킬과 중복 없이 상호 참조 (`frontend/state-management` = Zustand 사용법, `frontend/tanstack-query` = 서버 상태, 이 스킬 = 전환 경로)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] skill-tester 호출로 실전 질문 수행 — 2026-08-26 완료 (Q1~Q4, frontend-developer 에이전트)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 — 4/4 PASS, 전부 SKILL.md 섹션 근거 명시
- [✅] 잘못된 응답 발생 시 스킬 내용 보완 — 해당 없음 (FAIL/PARTIAL 없어 보완 불필요)

### 4-5. 교차 검증 판정표

| # | 클레임 | 소스 1 | 소스 2 | 판정 |
|---|--------|--------|--------|------|
| 1 | Recoil 저장소는 **2025-01-01**에 아카이브되어 read-only | GitHub 저장소 아카이브 배너 원문 | WebSearch 교차 확인 (저장소 activity·이슈 페이지 배너 동일 표기) | **VERIFIED** |
| 2 | 마지막 릴리스는 **0.7.7 / 2023-03-01**이며 이후 신규 릴리스 없음 | `CHANGELOG-recoil.md` "0.7.7 (2023-03-01)" | npm registry latest = 0.7.7 (publish 타임스탬프 2023-03-01) + recoiljs.org 블로그 최신 포스트 = 0.7.7 (March 1, 2023) | **DISPUTED → 확정 후 반영** (아래 4-6) |
| 3 | `main` 브랜치에 릴리스되지 않은 `UPCOMING` 섹션이 존재 → npm 0.7.7과 HEAD 불일치 | `CHANGELOG-recoil.md` 상단 UPCOMING | npm latest가 0.7.7에서 멈춰 있음 | **VERIFIED** |
| 4 | React 19에서 `useRecoilValue`/`useRecoilValueLoadable` 사용 시 `__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED is undefined` 오류 발생, 미해결 | 이슈 #2318 원문 (2024-05 오픈, Open 상태로 아카이브) | 저장소 아카이브 상태(수정 불가) + 다수 라이브러리에서 동일 원인 보고(relay #4688, headlessui #3167) | **VERIFIED** |
| 5 | 원인은 React 19가 `SECRET_INTERNALS` 접미사를 `_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE`로 개명한 것 | React 19 Upgrade Guide 원문 인용구 | 이슈 #2318의 오류 메시지 + 동일 원인 타 라이브러리 이슈 | **VERIFIED** |
| 6 | Recoil은 React 18까지 정상 동작하며 0.7.0에서 React 18 API·StrictMode 수정 반영, `useTransition` 지원은 `_TRANSITION_SUPPORT_UNSTABLE` 실험 단계 | `CHANGELOG-recoil.md` 0.7.0 (2022-03-31) 항목 | 0.7.6 항목의 "Workaround for React 18 environments … `useSyncExternalStore()`" | **VERIFIED** |
| 7 | Recoil의 atom·selector 모델과 가장 가까운 것은 **Jotai** — Recoil은 문자열 key, Jotai는 atom 객체 참조 동일성으로 식별 | Jotai 공식 comparison "Jotai depends on atom object referential identities / Recoil depends on atom string keys", "similar about the general goals and basic techniques" | Recoil atom 문서(key 필수) + Jotai core/atom("Atoms don't require keys") | **VERIFIED** |
| 8 | Zustand vs Jotai 선택 기준(Redux DevTools → Zustand / Suspense·코드 스플리팅 → Jotai / module state → Zustand) | Jotai 공식 comparison 원문 | Zustand 공식 문서(persist·미들웨어 생태계) 및 Jotai core/atom의 async·Suspense 지원 | **VERIFIED** |
| 9 | Recoil `atomFamily` 파라미터는 **값 동등성 + 직렬화 필수**, Jotai `atomFamily`는 기본 `Object.is`이며 deepEqual 지정 시 Recoil과 동등 | Recoil atomFamily 문서 "compared using value-equality and must be serializable" | Jotai family 문서 "Defaults to `Object.is`… For deep equality matching (similar to Recoil's behavior), pass `deepEqual`" | **VERIFIED** |
| 10 | Jotai `atomFamily`는 명시적 제거 없이는 메모리 누수 → `remove`/`setShouldRemove` 필요 | Jotai family 문서 "Unless you explicitly remove unused params, this leads to memory leaks" | 동 문서 API 목록(remove·setShouldRemove) | **VERIFIED** |
| 11 | Loadable 상태 문자열이 다름 — Recoil `hasValue`/`contents` vs Jotai `hasData`/`data` | Recoil `useRecoilValueLoadable` 문서 (state: hasValue·loading·hasError, 값 = contents) | Jotai utils/async 문서 (state: loading·hasData·hasError, 값 = data / error) | **VERIFIED** |
| 12 | Zustand v5 breaking change — React 18 최소 요구(네이티브 `useSyncExternalStore`), default export 제거, 셀렉터가 새 참조 반환 시 무한 루프 가능(`useShallow` 필요), persist가 스토어 생성 시점에 저장하지 않음 | Zustand 공식 v5 마이그레이션 문서 원문 | pmnd.rs "Announcing Zustand v5" + npm registry peerDeps `react >=18.0.0` | **VERIFIED** |
| 13 | Zustand `persist` 옵션(name 필수·storage·partialize·version·migrate·merge·skipHydration)과 `createJSONStorage`, `hasHydrated`/`rehydrate` API | Zustand 공식 persist 레퍼런스 원문 | GitHub 저장소 `docs/reference/integrations/persisting-store-data.md` 및 `src/middleware/persist.ts` | **VERIFIED** |
| 14 | `atomWithStorage`의 `getOnInit` 기본값은 **false** → 지정하지 않으면 첫 렌더에 저장값이 아닌 initialValue가 노출됨 | Jotai utils/storage 문서 | GitHub raw `docs/utilities/storage.mdx` "getOnInit … by default false" | **VERIFIED** |

부가 확인 (SKILL.md 서술 근거로 사용, 단일 1차 소스로 충분한 사실):
- Recoil atom effects의 `onSet`은 "not called due to changes from this effect's own `setSelf()`" (Atom Effects 공식 가이드) → 브리지 무한 루프 차단 근거.
- Recoil selector 기본 캐시 정책은 `keep-all`이며 "may change in the future" (selector 공식 문서) → TanStack Query 분리 근거.
- `RecoilEnv.RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED` 및 "use with caution!" 경고 (0.7.6 릴리스 노트).
- React StrictMode 이중 호출 대상 4종 및 "development-only" (React 공식 StrictMode 레퍼런스).
- React 19 stable = 2024-12-05 (React 공식 릴리스 포스트).

### 4-6. DISPUTED 처리 내역

**#2 — Recoil 0.7.7의 릴리스 날짜**

- 불일치: GitHub **Releases 페이지**를 통해 얻은 표기는 0.7.7을 "April 11"로 보여준 반면, `CHANGELOG-recoil.md`는 "0.7.7 (2023-03-01)", recoiljs.org 블로그 목록은 "Recoil 0.7.7 — March 1, 2023", npm registry publish 타임스탬프도 2023-03-01로 수렴.
- 판단: 1차 소스 3종(changelog·공식 블로그·npm)이 **2023-03-01로 일치**하므로 이를 채택. GitHub Releases 표기는 릴리스 오브젝트 생성/수정 시각이거나 파싱 오류일 가능성이 높아 근거로 쓰지 않음.
- 조치: SKILL.md 1장·0장에 **0.7.7 (2023-03-01)** 로 기재하고, 근거를 "CHANGELOG·블로그·npm registry"로 병기. 파생 서술인 "아카이브까지 약 22개월간 릴리스 없음"도 2023-03-01 기준으로 계산.

**UNVERIFIED로 판정되어 SKILL.md에서 제외한 서술**

- "Meta가 Recoil을 공식적으로 deprecated 선언했다" — 공식 선언문·블로그·릴리스 노트 어디에서도 확인되지 않음. → SKILL.md 1장에 **"그런 공지는 확인되지 않았다"** 로 명시적으로 부정 서술을 넣어 오답을 차단.
- "Recoil이 React 18 동시성 모드에서 tearing이 발생한다" — 근거를 찾지 못함(0.7.0이 React 18 API를 활용한다는 changelog만 확인). → 서술하지 않음. 대신 "React 18까지는 정상 동작" + "transition 지원만 실험적"으로 한정.
- Recoil 대비 각 대안의 정량 성능 비교(번들 크기·리렌더 수치) — 신뢰 가능한 1차 측정 소스 없음. → 정량 수치 일절 미기재, 정성 기준표로만 서술.

---

## 5. 테스트 진행 기록

**수행일**: 2026-08-26
**수행자**: skill-tester → frontend-developer (도메인 특화 에이전트, general-purpose 대체 아님)
**수행 방법**: SKILL.md Read 후 실전 질문 4개 답변, 근거 섹션 및 anti-pattern 회피 확인 (verification-policy.md 3·4단계 수행)

### 실제 수행 테스트

**Q1. Recoil deprecated 여부 — 정확한 현재 상태(아카이브 시점·마지막 버전·React 18/19 호환)**
- ✅ PASS
- 근거: SKILL.md "1. 왜 옮기는가 — 확인된 사실만" 표 + "정리 — 정확한 서술 방식" + 0장 기준 버전 표
- 상세: "Meta가 공식적으로 deprecated 선언" 주장을 SKILL.md의 명시적 반박(❌ 항목)으로 정확히 정정. 아카이브일(2025-01-01)·마지막 릴리스(0.7.7, 2023-03-01)·React 18 정상 동작·React 19 미해결 이슈(#2318)·원인(SECRET_INTERNALS 개명)까지 표 그대로 정확히 인용. "당장 다 걷어내야 한다"는 결론도 1장 "의사결정 기준"(React 18 유지 시 긴급하지 않음) 및 5장 점진 전략과 대조해 절충안 제시.

**Q2. selectorFamily + async selector 서버 데이터 이관 — Zustand vs 다른 곳**
- ✅ PASS
- 근거: SKILL.md 4장 "async selector 처리" 4-1 판정 규칙 + 8-2 흔한 실수 + 6-3 코드 예시
- 상세: fetch 기반 selectorFamily를 "서버가 소유한 데이터"로 정확히 분류해 TanStack Query 분리를 판정. 8-2의 "Zustand 액션으로 직역" anti-pattern을 명시적으로 회피하도록 안내했고, 6-3의 역할 분리 코드(선택 상태=Zustand, 서버 데이터=TanStack Query)를 정확히 인용.

**Q3. useRecoilValueLoadable의 hasValue/contents를 Jotai로 옮길 때 조용히 깨지는 지점**
- ✅ PASS
- 근거: SKILL.md 3-2 "Loadable 상태 문자열이 다르다" + 8-4 흔한 실수 표
- 상세: `hasValue`→`hasData`, `contents`→`data` 치환 필요성과 "TS가 `state` 유니온은 잡아도 `contents`의 any 흐름은 런타임까지 조용히 통과한다"는 SKILL.md 설명을 정확히 재현. anti-pattern(옛 상태 문자열 그대로 사용)을 정확히 지적하고 올바른 코드로 수정.

**Q4. 4,000파일 규모 SPA에서 Recoil과 새 스토어 공존 이동 순서**
- ✅ PASS
- 근거: SKILL.md 5장 전체(5-1 인벤토리 → 5-2 8단계 이동 순서 → 5-3 공존 우선 → 5-4 브리지 최후수단 → 5-5 PR 검증표) + 8-4 이중 소유 금지
- 상세: "말단 atom부터" 8단계 순서, "브리지는 최후의 수단"(두 조건 충족 시만), 브리지 위험표·개수 상한 규율, PR 완료 기준(잔존 참조 0건·이중 소유 없음)까지 SKILL.md 구조를 정확히 재구성. anti-pattern(같은 상태 양쪽에 동시 존재) 회피 안내 포함.

### 발견된 gap

- 없음 (4/4 PASS, DISPUTED/에러 미발견). 각 에이전트가 지적한 사소한 개선점(peer 요구사항 출처 명시, 브리지 상한 산정 근거 등)은 스킬 사용성에 영향 없는 참고 수준.

### 판정

- agent content test: 4/4 PASS
- verification-policy 분류: **실사용 필수 스킬 — 마이그레이션 가이드** (verification-policy.md "실사용 필수 스킬" 항목)
- 최종 상태: **PENDING_TEST 유지** — content test는 통과했으나, 마이그레이션 가이드 스킬은 실제 코드베이스 전환 결과(빌드·런타임 동작 확인)로 검증되기 전까지 APPROVED 전환 대상이 아님. content test 자체는 필수 이행 완료.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (14개 클레임 중 VERIFIED 13, DISPUTED 1은 1차 소스 3종 기준으로 확정 반영) |
| 구조 완전성 | ✅ (frontmatter·소스 URL·검증일·버전 기준표·주의 표기·흔한 실수·체크리스트) |
| 실용성 | ✅ (5개 변환 시나리오 × 2개 도착지 대비, 인벤토리·검증 명령 포함, 프로젝트 비종속) |
| 기존 스킬과의 중복 | ✅ 분리 완료 (state-management = Zustand 사용법 / tanstack-query = 서버 상태 / 이 스킬 = 전환 경로, 상호 참조 삽입) |
| 에이전트 활용 테스트 | ✅ 4/4 PASS (2026-08-26, skill-tester → frontend-developer, Q1~Q4 전부 SKILL.md 근거 명시·anti-pattern 회피 확인) |
| **최종 판정** | **PENDING_TEST 유지** (content test 4/4 PASS, 실사용 필수 카테고리라 실제 전환 검증 전까지 APPROVED 보류) |

> 이 스킬은 `verification-policy.md`의 **"실사용 필수 스킬 — 마이그레이션 가이드"** 카테고리에 해당한다. 따라서 content test를 통과하더라도 실제 코드베이스 전환 결과로 검증되기 전까지는 PENDING_TEST 유지가 원칙이다. content test 자체(2단계)는 2026-08-26에 완료됨 — 섹션 5 참조.

---

## 7. 개선 필요 사항

- [❌] Recoil 커뮤니티 포크(React 19 대응)의 신뢰도·유지 상태를 별도 조사해 "당장 못 옮길 때의 임시 대안" 섹션 추가 검토 — 이번 작업에서는 신뢰도 기준(Stars·유지보수 이력) 미충족 판단으로 스킬에 포함하지 않음. **선택 보강** (차단 요인 아님, content test 4/4 PASS에 영향 없음)
- [❌] undo/redo 대체 구현(`zundo` 등 서드파티)은 이름만 언급 상태 — 실사용 검증 후 코드 예시 보강 필요. **선택 보강** (Snapshot 의존 undo/redo는 SKILL.md가 이미 "별도 설계 태스크"로 명시적으로 분리해둔 영역이라 차단 요인 아님)
- [❌] `jotai-tanstack-query` 실제 적용 예시 미포함 (포인터만 제공) — 필요 시 별도 스킬 또는 섹션 확장. **선택 보강**
- [❌] Valtio 전환 경로는 "국소 도입 권고" 수준 — Valtio를 주 도착지로 삼는 코드베이스가 생기면 대응표 확장 필요. **선택 보강**
- [❌] Zustand v6·Jotai v3 등 차기 메이저가 나오면 0장 버전표와 v5 breaking change 서술 재검증 필요. **차기 메이저 릴리스 시점에 재검증 필요** (현재는 차단 요인 아님)
- [✅] skill-tester 2단계 테스트 수행 (2026-08-26 완료, Q1~Q4 4/4 PASS, frontend-developer 에이전트 활용) — 섹션 5·6 갱신 완료. 이 스킬은 실사용 필수 카테고리(마이그레이션 가이드)이므로 content test PASS와 별개로 **실제 코드베이스 전환 검증 전까지 PENDING_TEST 유지**가 남는 후속 과제(차단 요인, 실사용 검증되면 APPROVED 전환)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-08-26 | v1 | 최초 작성 — 공식 소스 약 30회 페치·6회 검색 기반, 14개 클레임 교차 검증(DISPUTED 1건 확정 반영, UNVERIFIED 서술 3건 제외). skill-tester 미수행으로 PENDING_TEST | skill-creator |
| 2026-08-26 | v1 | 2단계 실사용 테스트 수행 (Q1 Recoil deprecated 상태 정확성 / Q2 selectorFamily async selector 이관 판정 / Q3 Loadable hasValue·contents Jotai 함정 / Q4 4천 파일 SPA 공존 이동 순서) → 4/4 PASS, 실사용 필수 카테고리(마이그레이션 가이드)라 PENDING_TEST 유지 | skill-tester |
