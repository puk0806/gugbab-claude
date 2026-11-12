# react-spec-extraction — 상세 레퍼런스 (§7 ~ §9)

> SKILL.md 본문에서 분리한 절. 절 번호와 §참조(§2·§3-3·§5 등)는 SKILL.md 본문 기준이다.

## 7. 전역 상태 목록

화면 간에 데이터를 넘기는 통로라서 "화면 이동 시 무엇이 유지되나"의 근거가 된다. 목록 칸: `상태 이름(key) / 라이브러리 / 초기값 / 정의 위치 / 읽는 화면 / 쓰는 화면`.

| 라이브러리 | 정의 패턴 | 읽기/쓰기 추적 |
|------|------|------|
| Recoil | `atom({ key, default })`, `selector({ key, get, set? })`, `atomFamily`/`selectorFamily` — `key` 필수 | `useRecoilState`·`useRecoilValue`·`useSetRecoilState`의 인자 참조 |
| Redux Toolkit | `createSlice({ name, initialState, reducers, extraReducers })` | `useSelector((s) => s.<slice>…)`, `dispatch(<action>())` |
| zustand | `create(...)` / `create<T>()(...)` | `use<Store>(selector)` 훅 참조 |
| Context | `createContext(...)` + Provider `value` | `useContext(X)` |

```bash
rg -n -t ts -t js -e '\b(atom|selector|atomFamily|selectorFamily)\(\s*\{' -e 'createSlice\(\s*\{' -e '\bcreate(<[^>]*>)?\(\)?\(' -e 'createContext\(' src
```

- 읽기/쓰기 위치는 3-3의 `findReferencesAsNodes()`를 상태 선언(atom 변수·slice actions·store 훅)에 그대로 적용한다.
- **서버 상태(TanStack Query 캐시)는 전역 상태 목록에 넣지 않는다** — API 명세 쪽 정보다.
- Recoil은 GitHub 저장소(facebookexperimental/Recoil)가 **archived** 상태이고 npm 최신이 0.7.7이다. 추출 단계에서는 key 목록만 정확히 남긴다(대체 스택 결정은 메인 대화에서).

---

## 8. 7-1/7-2 표로 병합하는 법

1. §2 출력의 각 화면 행 → 화면ID 부여(`SCR-<도메인>-<번호>`, 규칙은 spec-extraction-method 양식) + 근거 = 라우트 정의 줄;컴포넌트 파일.
2. §3-3 체인으로 화면 컴포넌트에 닿은 API 행 → 해당 화면의 "버튼·이벤트 → 호출 API". §5-1 결과로 어느 버튼인지 붙인다. 버튼 없이 마운트 시 호출(useQuery·useEffect)이면 이벤트 = "화면 진입".
3. §4 필드 → 입력 필드 표. §6 → 권한 칸. §5-2 → 화면 이동·팝업 칸.
4. 모든 행에 `확신도`: 스크립트가 "확인됨"을 찍어도 **R3(근거 줄 재확인)** 전까지는 초안. 동적 URL·props 경유·미확인 체인은 "추정"/"미확인" 유지.
5. `사용 여부`는 코드로 알 수 없다 → 접근 로그·애널리틱스 페이지뷰(라우트 경로 기준)로 채운다(spec-extraction-method 3-2).
6. 화면이 많으면 **라우트 묶음(=도메인) 단위로 서브에이전트 분할**(R1). 스크립트 TSV를 먼저 만들어 두고, 서브에이전트는 TSV + 해당 파일만 읽게 하면 컨텍스트가 작다.

**부적합:** 화면 몇 개짜리 앱(직접 읽는 게 빠르다) / 런타임 조립이 지배적인 앱(SDUI, 메뉴·권한·폼을 DB 메타데이터로 생성) — 이 경우 코드가 아니라 **메타데이터 테이블**이 스펙 원천이므로 데이터 추출로 전환한다.

---

## 9. 흔한 실수

| 실수 | 왜 문제인가 | 올바른 접근 |
|------|------|------|
| Next.js 폴더 수를 화면 수로 셈 | `page` 없는 폴더·`_private`·`(group)`은 화면이 아님 | `page`/`route` 파일 기준(§2-1) |
| 인터셉트·병렬 라우트를 별도 화면으로 등록 | 같은 URL의 표시 방식일 뿐 → 중복 화면 | 비고 칸에 "모달 표시"로 |
| `route.ts`·`pages/api`를 화면 목록에 섞음 | API다 | API 명세로 분리 |
| `rg "\.get\("` 로 API 수집 | Map·URLSearchParams까지 잡힘, 인스턴스 import는 놓침 | ts-morph 타입 판별(§3-2) |
| 대상 레포 `node_modules` 없이 ts-morph 실행 | axios 타입이 any → axios 호출 전부 누락 | 의존성 설치 후 실행, 0건이면 의심 |
| 동적 URL을 그럴듯하게 채움 | R4·R5 위반 — 추정이 사실로 둔갑 | `{url}` 그대로 + 추정, HAR로 확인 |
| queryKey를 API 경로로 기록 | 캐시 식별자일 뿐 실제 요청과 다를 수 있음 | queryFn 안의 실제 호출을 기록 |
| `z.toJSONSchema` 결과만으로 검증 명세 확정 | 메시지·`.refine` 교차 규칙이 조용히 빠짐(실측) | 메시지·refine은 AST로 보완 |
| zod 3 프로젝트에서 `z.toJSONSchema` 호출 | 4.0부터 제공 — zod 3엔 없음 | 버전 확인, 필요 시 zod-to-json-schema |
| 하위 `<Routes>` 경로를 루트 기준으로 기록 | v6 descendant routes는 부모 경로 기준 상대 경로 | 부모 `/*` 경로와 결합 |
| 버튼 숨김(조건부 렌더)을 권한 명세 전체로 간주 | 서버 검증 여부 불명 | 서버 API 명세와 교차, 없으면 "서버 검증 미확인" |
| TanStack Query 캐시를 전역 상태 목록에 포함 | 서버 상태와 클라이언트 상태 혼동 | 전역 상태 = Recoil/Redux/zustand/Context만 |
| 스크립트 출력 "확인됨"을 그대로 확정 | 스크립트 버그·누락 가능 | R3 근거 재확인 + 표본 수동 대조 |
