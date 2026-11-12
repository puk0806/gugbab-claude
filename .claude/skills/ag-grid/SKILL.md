---
name: ag-grid
description: AG Grid v33 기준 함정과 v33→v36 breaking change — 모듈 등록 필수(error #200·AllCommunityModule 트리 셰이킹 불가·ValidationModule), Theming API vs 레거시 CSS 동시 사용 금지, Community/Enterprise 라이선스 경계(컬럼 메뉴·SSRM은 Enterprise), v36 ValidationModule 제외·CSRM 코어 편입·DOM 클래스명 개편·TS 5.8.3, Next.js columnDefs 직렬화, 상태 복원·rowBuffer 함정
---

# AG Grid (React) 데이터 그리드

> 소스: https://www.ag-grid.com/react-data-grid/upgrading-to-ag-grid-33/
> 소스: https://www.ag-grid.com/archive/33.3.2/react-data-grid/modules/
> 소스: https://www.ag-grid.com/archive/33.3.2/react-data-grid/themes/
> 소스: https://www.ag-grid.com/archive/33.3.2/react-data-grid/theming-migration/
> 소스: https://www.ag-grid.com/archive/33.3.2/react-data-grid/react-hooks/
> 소스: https://www.ag-grid.com/archive/33.3.2/react-data-grid/row-ids/
> 소스: https://www.ag-grid.com/archive/33.3.2/react-data-grid/row-models/
> 소스: https://www.ag-grid.com/archive/33.3.2/react-data-grid/community-vs-enterprise/
> 소스: https://www.ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-34/
> 소스: https://www.ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-35/
> 소스: https://www.ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-36/
> 소스: https://github.com/ag-grid/ag-grid
> 검증일: 2026-11-09 (재검증, 이전 2026-09-26 / 최초 검증 2026-08-26)
> 버전 기준: `ag-grid-community` / `ag-grid-react` **33.x** (최신 안정 메이저는 36.3.0(2026-11-04), 36.2.0 → 마이너 갱신, breaking change 없음 — 6절에 v33→v36 차이 정리)

---

## 이 스킬의 범위

v33의 구조 변경에서 터지는 지점, 라이선스 경계, v33→v36 breaking change, 실측 함정만 다룬다.

> 기본 사용법(`AgGridReact` 기본 예제·제네릭 타입·`valueFormatter`/`valueGetter`·셀 렌더러 작성·`withParams` 테마 커스터마이징·Infinite Row Model 골격)은 공식 문서 수준이라 싣지 않는다.

---

## 0. v32 이하 → v33 근본 변경

| 축 | v32 이하 | v33 |
|----|----------|-----|
| 패키지 | `@ag-grid-community/*`, `@ag-grid-enterprise/*` 스코프 패키지 다수 | `ag-grid-community` / `ag-grid-enterprise` / `ag-grid-react` 로 통합 |
| 기능 활성화 | 패키지 import만으로 대부분 동작 | **모듈 등록 필수** (`ModuleRegistry.registerModules`) |
| 스타일 | CSS 파일 import + `ag-theme-*` 클래스 | **Theming API 기본** (`theme` 그리드 옵션에 JS 테마 객체) |
| 행 선택 | `rowSelection="multiple"` 문자열 | 객체 API `rowSelection={{ mode: 'multiRow' }}` (문자열은 deprecated 경고) |

> AG Grid 공식 발표 기준 v33의 모듈 아키텍처는 사용하는 기능에 따라 번들 크기를 **20~40%** 줄인다.

- `ag-grid-react`는 `ag-grid-community`를 동일 버전으로 의존한다. **세 패키지의 버전은 반드시 일치**시켜야 한다(혼용 시 모듈 레지스트리 불일치로 런타임 에러).
- React 지원 범위는 `^16.8 || ^17 || ^18 || ^19` 이며, 공식 호환성 표 기준 **React 19는 AG Grid 32.3 이상**에서 지원된다.

---

## 1. 모듈 등록 — v33에서 가장 많이 터지는 지점

```
AG Grid: error #200 Unable to use rowSelection as RowSelectionModule is not registered.
```

`#200`은 "모듈 미등록" 에러 코드다. **에러 메시지에 적힌 모듈을 등록하면 그대로 해결된다.**

- 전역 `ModuleRegistry.registerModules([...])`는 그리드 인스턴스화 **전에**, **모듈 스코프에서 1회**. `useEffect`에서 등록하면 StrictMode 이중 실행·초기화 순서와 얽힌다. 그리드 단위 `modules` prop은 전역 등록분과 합쳐진다. 확인은 `api.isModuleRegistered('SetFilterModule')`.
- **`AllCommunityModule`은 모든 Community 모듈을 포함하므로 트리 셰이킹이 되지 않는다.** 번들이 중요하면 `ClientSideRowModelModule`·`TextFilterModule`·`PaginationModule`·`RowSelectionModule` 등을 개별 등록.
- **`ValidationModule`**: v33의 `AllCommunityModule`/`AllEnterpriseModule`에는 기본 포함. 개별 등록 방식이면 프로덕션 번들에서 제외하는 것이 공식 권장(미등록 시 콘솔 메시지가 **에러 코드 + 문서 링크**로 축약). v36에서는 All* 모듈에서도 빠졌다(6절).
- Enterprise Integrated Charts / Sparklines는 **AG Charts를 별도 의존성으로 추가하고 `.with()`로 주입**해야 한다(v33 신규): `AllEnterpriseModule.with(AgChartsEnterpriseModule)`.

> 주의: AG Grid 공식 문서에는 React StrictMode 전용 지침 페이지가 없다. "모듈 스코프에서 1회 등록"·"API는 `onGridReady`의 `event.api` 기준(`gridRef.current.api`는 마운트 직후 `null`일 수 있음)"은 "모듈 등록 시점"·"API 준비 시점" 규칙을 StrictMode 이중 마운트 환경에 적용한 실무 지침이며, 공식 문서에 명문화된 문장은 아니다.

---

## 2. 라이선스 경계 — Community(MIT) vs Enterprise(상용)

> **`ag-grid-community`에서 import되면 Community(MIT), `ag-grid-enterprise`에서 import되면 Enterprise(상용 EULA)다.**

Enterprise는 라이선스 키 없이도 *동작은* 하지만 **워터마크와 콘솔 에러가 표시**되며 프로덕션 사용에는 유료 라이선스가 필요하다(`LicenseManager.setLicenseKey`). 키 없이 허용되는 것은 로컬 평가/개발, 프로덕션 테스트에는 트라이얼 키.

| Community (MIT) | Enterprise (상용) |
|---|---|
| 정렬·페이지네이션, 텍스트/숫자/날짜/커스텀/플로팅 필터, 행·열 가상화, 커스텀 셀 렌더러·에디터, 행 선택, CSV 내보내기, Client-Side·**Infinite** Row Model, 테마, 그리드 상태 저장/복원(`GridStateModule`) | **컬럼 메뉴**(`ColumnMenuModule`), 컨텍스트 메뉴, **Set/Multi/Advanced Filter**, 행 그룹핑·집계·피벗, Tree Data, Master/Detail, **Excel 내보내기**, 클립보드, 셀(범위) 선택, 사이드바·툴 패널·상태 바, Integrated Charts·Sparklines, Rich Select, **Server-Side·Viewport Row Model** |

> 주의: **Community에는 컬럼 메뉴 자체가 없다.** 공식 문서 표현 그대로 "AG Grid Community does not have a menu, but can launch Column Filters if enabled" — Community에서는 헤더의 필터 버튼/플로팅 필터로 필터만 띄울 수 있다. "필터 UI가 필요하다 → 컬럼 메뉴 예시"로 답하면 Enterprise 기능을 Community인 것처럼 제시하는 오답이 된다.

> 주의: 대량 데이터 처리에서 **서버 페이징이 필요하면 Community 범위는 Infinite Row Model까지**다. 서버 사이드 그룹핑·집계가 필요한 순간 Server-Side Row Model = Enterprise 영역으로 넘어간다. "대량 데이터 = SSRM"으로 반사적으로 답하지 말 것.

대안: Set Filter → 커스텀 필터, SSRM → Infinite Row Model.

---

## 3. 테마 — Theming API vs 레거시 CSS

- Theming API는 JS 객체(`themeQuartz`·`themeBalham`·`themeMaterial`·`themeAlpine`)를 `theme` 옵션으로 넘기고 **CSS 파일 import는 하지 않는다**(그리드가 head에 직접 주입). 파라미터는 CSS 커스텀 프로퍼티라 `withParams()` 값은 기본값이고 앱 스타일시트의 `--ag-*`로 덮을 수 있다. `withParams`/`withPart`는 새 객체를 반환하므로 매 렌더 호출하지 말고 모듈 스코프 상수로.
- 레거시 유지: `theme="legacy"` + `ag-grid.css`/`ag-theme-*.css` import + `ag-theme-*` 클래스. 전역은 `provideGlobalGridOptions({ theme: 'legacy' })`. 전환 전략: 업그레이드 즉시 전역 legacy로 회귀 0 → 그리드 단위 `theme={appGridTheme}`로 이관(개별 prop이 전역을 덮음) → 다 끝나면 CSS import·클래스·전역 설정 제거.

> 주의: **레거시 CSS import와 Theming API를 동시에 쓰면 스타일이 깨진다.** Theming API 사용 시 `ag-grid.css` / `ag-theme-*.css` import를 반드시 제거해야 한다. 레거시 테마는 v33에서 지원되지만 **deprecated이며 향후 메이저에서 제거 예정**이다.

---

## 4. 데이터 갱신·상태 함정

- **`getRowId` 없으면** `rowData` 교체 시 "the grid rips all data out of the grid and starts from scratch" — 선택·펼친 그룹 유실, DOM 전체 재생성. 인덱스·랜덤 ID 금지, 숫자 PK는 `String()`. 서버 상태(TanStack Query 등)와 조합할 때 사실상 필수.
- 델타 갱신은 같은 ID 행의 **객체 참조가 바뀌었는지**로 판단 → 제자리 mutate는 반영 안 됨.
- `rowNode.setData`/`updateData`/`setDataValue` 공식 경고: "the grid will not update to reflect a change in sorting, filtering or grouping" → `refreshClientSideRowModel()` 또는 `applyTransaction`(초고빈도는 `applyTransactionAsync`).
- 공식 React 권장: `rowData`는 `useState`, `columnDefs`·객체 옵션은 `useState`/`useMemo`, 함수 옵션(`getRowId`·`isRowSelectable` 등)은 `useCallback`("we **strongly recommend** you use `useCallback` to avoid resetting grid state on every render"). 인라인 리터럴이면 렌더마다 컬럼 상태·정렬·필터가 리셋된다. 셀 렌더러는 모듈 스코프에 정의(부모 안 정의 시 매 렌더 리마운트).
- 정렬·필터 상태를 Redux/Zustand로 이중 관리 → `columnDefs` 재생성 → 리셋 루프. 그리드 내부 상태로 두고 스냅샷만 저장.
- `applyColumnState`는 **state에 없는 컬럼을 찾지 못하면 `false`를 반환** — 컬럼 구성이 바뀐 배포 후 옛 저장본 복원 시 반환값을 확인하고 실패 시 폐기. 순서까지는 `applyOrder: true`, 나머지 컬럼 처리는 `defaultState: { sort: null }`.
- `initialState`는 **"It is only read once when the grid is created"** — `useState(() => load())`로 고정, 현재 상태는 `api.getState()`/`onStateUpdated`. 일부 컬럼 상태만 적용은 `partialColumnState: true`.
- **`rowBuffer`(기본 10)는 픽셀 범위로 계산된다.** 기본 행 높이 42px 기준 위아래 각 420px — 행 높이를 키우면 실제 버퍼 행 수가 줄어 빠른 스크롤 시 빈 영역 → `rowBuffer`도 상향. `suppressRowVirtualisation`/`suppressColumnVirtualisation`은 대량 데이터에서 즉시 프리즈.
- 그리드는 부모 크기를 채운다 — 부모 `height` 미지정이면 안 보인다.

---

## 5. Next.js App Router

- 그리드를 렌더하는 컴포넌트는 `'use client'`(AG Grid 공식 Next.js 가이드 방식). 서버 컴포넌트는 데이터 조회까지만.
- **`columnDefs`에 함수(`valueGetter`·`cellRenderer`)가 들어가므로 서버 컴포넌트에서 만들어 prop으로 내리면 직렬화 에러**가 난다. 컬럼 정의는 항상 클라이언트 파일에서.
- 첫 화면 요소가 아니면 클라이언트 래퍼 안에서 `next/dynamic(..., { ssr: false })`로 지연 로딩(`ssr: false`는 서버 컴포넌트에서 허용되지 않음). Enterprise import는 그리드 청크 안에 가둔다.

> 주의: `next/dynamic` + `ssr: false` 조합은 AG Grid 공식 문서가 명시적으로 권고한 패턴이 아니라, Next.js 공식 문서의 클라이언트 전용 컴포넌트 지연 로딩 패턴을 AG Grid에 적용한 것이다. 공식 AG Grid Next.js 가이드는 `'use client'` 경계까지만 다룬다.

---

## 6. v33 → 최신(v36) breaking change 요약

> 최신 안정 메이저는 **36.3.0** (npm `ag-grid-community` latest 기준, 2026-11-09 재확인 — 36.2.0에서 마이너 갱신, 공식 36.3 업그레이드 가이드상 breaking·behaviour change·API 제거 없음). 아래는 v33 기준 코드베이스를 올릴 때 실제로 손봐야 하는 항목만 추린 것이다.

| 버전 | 성격 | 내용 |
|------|------|------|
| **v34** | **breaking change 없음** | 공식 업그레이드 문서: "There are no breaking changes in AG Grid version 34.0" |
| v34 | deprecation | `suppressAdvancedFilterEval` 제거 예정(고급 필터가 더 이상 eval을 쓰지 않음) |
| v34 | deprecation | `ISetFilter` → `SetFilterUi` / `SetFilterHandler`로 분리 |
| v34 | deprecation | 필터 인스턴스의 `getModel()` / `setModel()` → `api.getColumnFilterModel()` / `api.setColumnFilterModel()` |
| **v35** | 타입 제거 | `columnTypes` 타입 정의에서 `cellDataType` 제거 (값이 항상 무시됐음) |
| v35 | 타입 제거 | `autoGroupColumnDef`에서 `colId` 제거 → `autoGroupColumnDef.context` 사용 |
| v35 | 동작 변경 | `suppressAutoSize`가 API 호출·컬럼 메뉴·더블클릭 등 **모든** 자동 크기 조정에 적용 |
| v35 | 동작 변경 | 필터 결과 없음·내보내기 시 **오버레이 메시지가 기본 표시** → `suppressOverlays`로 억제 |
| v35 | 동작 변경 | Integrated Charts가 그룹 컬럼을 자동으로 카테고리로 쓰지 않음 → `useGroupColumnAsCategory: true` 명시 필요 |
| v35 | 연쇄 | AG Charts 13 동반 릴리스 — 차트 관련 breaking change는 AG Charts 업그레이드 문서 참조 |
| **v36** | 모듈 | `ValidationModule`이 `AllCommunityModule`/`AllEnterpriseModule`에서 **제외** → 진단이 필요하면 `enableDevValidations()` 사용 |
| v36 | 모듈 | **Client-Side Row Model이 코어에 편입** — `ClientSideRowModelModule` 명시 등록 불필요 |
| v36 | 모듈 | 공통 라이브러리 `ag-stack` 의존성 추가 |
| v36 | DOM | 스크롤 구조 전면 개편(9개 이상 컨테이너 → 단일 컨테이너, 네이티브 스크롤). **클래스명 변경** (예: `ag-floating-top` → `.ag-grid-pinned-top-rows-container`) |
| v36 | 기본값 | `suppressContentVisibilityAuto` 기본값 `false` → `true` |
| v36 | 테마 | `fontWeight` 파라미터 기본값이 페이지 상속 대신 `400` |
| v36 | 테마 | 피커 필드가 하드코딩 `5px` 대신 `borderRadius` 파라미터를 따름 |
| v36 | 테마 | `createTheme()`이 버튼·컬럼 드롭 컴포넌트 스타일을 더 이상 포함하지 않음 (필요 시 수동 추가) |
| v36 | 툴체인 | **최소 TypeScript 5.8.3** |
| v36.3 | deprecation | `debug` 그리드 옵션 → `enableDevValidations({ debug: true })`, 이벤트 `calculatedColumnExpressionChanged` → `calculatedColumnChanged`, 지역만 붙은 로케일 export(`AG_GRID_LOCALE_CN`) → BCP47(`AG_GRID_LOCALE_ZH_CN`) — 기존 것도 계속 동작 |

**업그레이드 시 위험도 순위**
1. **v36의 DOM/클래스명 개편** — `.ag-*` 클래스를 직접 겨냥한 커스텀 CSS·E2E 셀렉터·시각 회귀 스냅샷이 전부 깨질 수 있다. 여기가 가장 비싸다.
2. **v36의 ValidationModule 제외** — 업그레이드 직후 진단 메시지가 사라져 원인 파악이 어려워진다. 개발 빌드에서 `enableDevValidations()`를 먼저 켜고 올린다.
3. v35의 오버레이 기본 표시 — "없는 데이터"에 대한 UI 스냅샷/E2E가 깨질 수 있다.
4. v34는 무해하므로 **33 → 34는 안전한 중간 착지점**이다.

> 주의: AG Grid는 각 메이저마다 코드모드(codemod)를 제공한다. 대규모 코드베이스는 수동 치환보다 공식 코드모드를 먼저 돌리고 차이를 리뷰하는 편이 안전하다.

---

## 7. 흔한 실수

| 실수 | 해결 |
|------|------|
| v33에서 모듈 미등록 (`error #200`) | 에러 메시지의 모듈 등록 |
| `AllCommunityModule`만 쓰고 번들 방치 | 개별 모듈 등록 |
| Theming API + 레거시 CSS 동시 사용 | 하나로 통일 |
| Enterprise 기능을 Community 프로젝트에 | 2절 표로 사전 확인 |
| 서버 컴포넌트에서 `columnDefs` 생성 | 클라이언트 파일에서 생성 |
| `rowSelection="multiple"` 문자열 | `{ mode: 'multiRow' }` |
| community/enterprise/react 버전 불일치 | 세 패키지 동시 고정·승급 |
| v36 업그레이드 후 진단 메시지 사라짐 | `enableDevValidations()` |
| v36에서 `.ag-*` 클래스 겨냥 CSS·E2E 셀렉터 유지 | 클래스명 개편 확인 후 갱신 |
| 행 높이 키우고 `rowBuffer` 그대로 | 버퍼는 픽셀 기준 → 상향 |
