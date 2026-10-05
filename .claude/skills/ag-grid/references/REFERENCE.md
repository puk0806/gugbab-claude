## 5. React 통합 주의점

### 5-1. 안정 참조 — `useMemo` / `useCallback` 필수 지점

공식 권장을 그대로 옮기면:

| 대상 | 권장 훅 | 공식 문구 |
|------|---------|-----------|
| `rowData` | `useState` (정적이면 `useMemo`) | "we recommend using `useState` to maintain a consistent array reference across renders" |
| `columnDefs` | `useState` 또는 `useMemo` | 없으면 "the grid will be provided with a new set of Column Definitions **every time** the component is rendered" |
| 객체 옵션 (`defaultColDef`, `sideBar`, `statusBar` …) | `useState` 또는 `useMemo` | "For all properties that are Objects … we recommend `useState` or `useMemo`" |
| 함수 옵션 (`isRowSelectable`, `getRowId`, `getRowClass` …) | `useCallback` | "we **strongly recommend** you use `useCallback` to avoid resetting grid state on every render" |

인라인 객체/함수를 그대로 넘기면 렌더마다 새 참조가 들어가 **컬럼 상태·정렬·필터가 리셋**되는 전형적 버그가 난다.

```tsx
// ❌ 렌더마다 새 객체 — 컬럼 상태 초기화
<AgGridReact defaultColDef={{ filter: true }} columnDefs={[{ field: 'name' }]} />

// ✅
const defaultColDef = useMemo<ColDef<Product>>(() => ({ filter: true }), []);
```

### 5-2. 커스텀 셀 렌더러 (React 컴포넌트)

```tsx
import type { CustomCellRendererProps } from 'ag-grid-react';

// ✅ 모듈 스코프에 정의 — 매 렌더 새 컴포넌트 타입이 생기면 셀이 통째로 언마운트/리마운트된다
function StockCell({ value }: CustomCellRendererProps<Product, number>) {
  if (value == null) return null;
  return (
    <span className={value === 0 ? 'text-red-600' : undefined}>
      {value === 0 ? '품절' : `${value}개`}
    </span>
  );
}

const columnDefs: ColDef<Product>[] = [
  { field: 'stock', cellRenderer: StockCell },
  // 추가 파라미터
  {
    field: 'name',
    cellRenderer: LinkCell,
    cellRendererParams: { basePath: '/products' },
  },
];
```

**등록 방법 3가지** — ① 문자열(내장 컴포넌트, 예: `'agGroupCellRenderer'`) ② 컴포넌트 직접 참조 ③ 인라인 함수(`cellRenderer: (p) => <b>{p.value}</b>`).

**리렌더 비용 관리**
- 셀 렌더러 인스턴스는 **뷰포트에 보이는 셀에만** 생성된다(가상화). 스크롤할 때마다 마운트/언마운트가 발생하므로 렌더러 안에서 무거운 계산·데이터 페칭을 하면 안 된다.
- 값 가공만 필요하면 렌더러 대신 `valueFormatter`, 파생 값은 `valueGetter`를 쓴다. **컴포넌트가 필요 없는 곳에 컴포넌트를 두지 않는 것**이 가장 큰 성능 이득이다.
- 셀 렌더러에서 전역 스토어를 구독하면 스토어 갱신마다 보이는 모든 셀이 리렌더된다. 필요한 값은 `cellRendererParams`나 `context`로 내려준다.
- 컴포넌트 직접 참조 방식이 "AG Grid will avoid most unnecessary renders"로 문서화돼 있다.

### 5-3. React 19 / StrictMode

- `ag-grid-react` 33.x의 peer 범위에 React 19가 포함되고, 공식 호환성 표에서도 React 19는 AG Grid 32.3 이상이면 지원된다.
- 모듈 등록은 **모듈 스코프에서 1회** 수행한다. `useEffect`에서 등록하면 StrictMode의 이중 실행/그리드 초기화 순서와 얽힌다.
- `gridRef.current.api`는 마운트 직후 `null`일 수 있다. API 접근은 `onGridReady`에서 받은 `event.api`를 기준으로 한다.

> 주의: AG Grid 공식 문서에는 React StrictMode 전용 지침 페이지가 없다. 위 두 항목은 "모듈 등록 시점"·"API 준비 시점" 규칙을 StrictMode 이중 마운트 환경에 적용한 실무 지침이며, 공식 문서에 명문화된 문장은 아니다.

---

## 6. 테마 — Theming API vs 레거시 CSS 테마

### 6-1. Theming API (v33 기본)

테마는 **JS 객체**이며 `theme` 그리드 옵션으로 전달한다. CSS 파일 import는 **하지 않는다** — 그리드가 필요한 CSS를 올바른 순서로 document head에 직접 주입한다.

```tsx
import { themeQuartz } from 'ag-grid-community';

<AgGridReact theme={themeQuartz} rowData={rows} columnDefs={columnDefs} />
```

내장 테마 4종: `themeQuartz`(기본) · `themeBalham` · `themeMaterial` · `themeAlpine`.

**커스텀 토큰 적용 — `withParams`**

```ts
import { themeQuartz, colorSchemeDark } from 'ag-grid-community';

export const appGridTheme = themeQuartz.withParams({
  accentColor: '#2563eb',
  backgroundColor: '#ffffff',
  fontFamily: 'Pretendard, sans-serif',
  spacing: 8,
  headerHeight: 44,
  rowHeight: 40,
  borderRadius: 6,
});

// 다크 모드 등 파트 교체
export const appGridThemeDark = appGridTheme.withPart(colorSchemeDark);
```

테마 파라미터는 내부적으로 **CSS 커스텀 프로퍼티**로 구현된다. `withParams()`가 세팅하는 값은 *기본값*이므로, 앱 스타일시트에서 `--ag-*` 변수로 덮어쓸 수 있다.

```css
/* 디자인 시스템 토큰과 연결 */
.my-grid-wrapper {
  --ag-accent-color: var(--brand-primary);
  --ag-border-color: var(--color-border-subtle);
  --ag-spacing: 8px;
}
```

`withParams` / `withPart`는 새 테마 객체를 반환한다. **컴포넌트 안에서 매 렌더 호출하지 말고 모듈 스코프 상수로 만들거나 `useMemo`로 고정**한다.

### 6-2. 레거시 CSS 테마와의 공존·전환

v32 방식(CSS import + `ag-theme-*` 클래스)을 유지하려면 `theme` 옵션에 문자열 `"legacy"`를 넘긴다.

```tsx
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

<div className="ag-theme-quartz" style={{ height: 500 }}>
  <AgGridReact theme="legacy" rowData={rows} columnDefs={columnDefs} />
</div>
```

전역으로 돌리려면:

```ts
import { provideGlobalGridOptions } from 'ag-grid-community';
provideGlobalGridOptions({ theme: 'legacy' });
```

**전환 전략**
1. v33 업그레이드 즉시에는 `provideGlobalGridOptions({ theme: 'legacy' })`로 기존 CSS를 유지해 회귀를 0으로 만든다.
2. 그리드 단위로 `theme={appGridTheme}`를 지정해 하나씩 Theming API로 이관한다(개별 prop이 전역 기본값을 덮는다).
3. 전부 이관되면 CSS import와 `ag-theme-*` 클래스, 전역 legacy 설정을 제거한다.

> 주의: **레거시 CSS import와 Theming API를 동시에 쓰면 스타일이 깨진다.** Theming API 사용 시 `ag-grid.css` / `ag-theme-*.css` import를 반드시 제거해야 한다. 레거시 테마는 v33에서 지원되지만 **deprecated이며 향후 메이저에서 제거 예정**이다.

---

## 7. Next.js App Router

### 7-1. 클라이언트 컴포넌트 경계

AG Grid는 브라우저 API에 의존하므로 **그리드를 렌더하는 컴포넌트는 클라이언트 컴포넌트여야 한다.** AG Grid 공식 Next.js 가이드도 `'use client'` 방식을 사용한다.

```tsx
// components/product-grid.tsx
'use client';

import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([AllCommunityModule]);

export function ProductGrid(/* ... */) { /* ... */ }
```

```tsx
// app/products/page.tsx  ← 서버 컴포넌트 유지
import { ProductGrid } from '@/components/product-grid';

export default async function Page() {
  const rows = await fetchProducts(); // 서버에서 데이터만 조회
  return <ProductGrid rows={rows} />; // 직렬화 가능한 데이터만 전달
}
```

**설계 원칙**: 서버 컴포넌트는 *데이터 조회*까지만 하고, 그리드는 클라이언트 경계 안쪽에서만 산다. 컬럼 정의에 함수(`valueGetter`, `cellRenderer`)가 들어가므로 **`columnDefs`를 서버 컴포넌트에서 만들어 prop으로 내려보내면 직렬화 에러**가 난다. 컬럼 정의는 항상 클라이언트 파일에서 만든다.

### 7-2. 스타일 import 위치

- **Theming API 사용 시**: CSS import 자체가 없다. 별도 처리 불필요.
- **레거시 테마 사용 시**: CSS import는 클라이언트 컴포넌트 파일이나 `app/layout.tsx`에서 한다. 서버 컴포넌트 트리 어디서든 import 가능하지만, 그리드 컴포넌트와 같은 파일에 두면 의존 관계가 명확하다.

### 7-3. 번들 크기와 동적 import

AG Grid는 무거운 의존성이다. 그리드가 첫 화면(LCP) 요소가 아니라면 클라이언트 래퍼에서 지연 로딩한다.

```tsx
'use client';
import dynamic from 'next/dynamic';

const ProductGrid = dynamic(
  () => import('./product-grid').then((m) => m.ProductGrid),
  { ssr: false, loading: () => <GridSkeleton /> },
);
```

**주의점**
- `ssr: false`가 붙은 `next/dynamic` 호출은 **클라이언트 컴포넌트 안**에 있어야 한다(App Router에서 서버 컴포넌트에서는 허용되지 않는다).
- `ssr: false`는 서버 HTML을 건너뛰므로 SEO·LCP에 불리하다. 그리드가 페이지 주요 콘텐츠라면 `'use client'`만으로 충분하고 동적 import는 과잉이다.
- Enterprise를 쓴다면 `ag-grid-enterprise` import를 그리드 청크 안에 가둬야 초기 번들이 커지지 않는다.

> 주의: `next/dynamic` + `ssr: false` 조합은 AG Grid 공식 문서가 명시적으로 권고한 패턴이 아니라, Next.js 공식 문서의 클라이언트 전용 컴포넌트 지연 로딩 패턴을 AG Grid에 적용한 것이다. 공식 AG Grid Next.js 가이드는 `'use client'` 경계까지만 다룬다.

---

## 8. v33 → 최신(v36) breaking change 요약

> 최신 안정 메이저는 **36.2.0** (npm `ag-grid-react` latest 기준, 2026-09-26 재확인 — 2026-08-26 확인 시 36.1.0에서 마이너 갱신, breaking change 없음). 아래는 v33 기준 코드베이스를 올릴 때 실제로 손봐야 하는 항목만 추린 것이다.

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

**업그레이드 시 위험도 순위**
1. **v36의 DOM/클래스명 개편** — `.ag-*` 클래스를 직접 겨냥한 커스텀 CSS·E2E 셀렉터·시각 회귀 스냅샷이 전부 깨질 수 있다. 여기가 가장 비싸다.
2. **v36의 ValidationModule 제외** — 업그레이드 직후 진단 메시지가 사라져 원인 파악이 어려워진다. 개발 빌드에서 `enableDevValidations()`를 먼저 켜고 올린다.
3. v35의 오버레이 기본 표시 — "없는 데이터"에 대한 UI 스냅샷/E2E가 깨질 수 있다.
4. v34는 무해하므로 **33 → 34는 안전한 중간 착지점**이다.

> 주의: AG Grid는 각 메이저마다 코드모드(codemod)를 제공한다. 대규모 코드베이스는 수동 치환보다 공식 코드모드를 먼저 돌리고 차이를 리뷰하는 편이 안전하다.

---

## 9. 상태 관리 연동

### 9-1. 원칙 — 서버 데이터와 그리드 UI 상태를 분리한다

| 상태 종류 | 소유자 | 이유 |
|-----------|--------|------|
| 행 데이터(서버 원본) | TanStack Query 등 서버 상태 라이브러리 | 캐시·리페치·무효화는 그리드의 책임이 아님 |
| 정렬·필터·컬럼 폭/순서/핀 | **그리드 내부 상태** (필요 시 스냅샷만 외부 저장) | 그리드가 이미 단일 소스로 관리 중 |
| 선택된 행 ID | 앱 상태(선택 결과를 다른 화면에서 쓸 때만) | 그리드 밖에서 소비되면 밖으로 승격 |
| 화면 전환 후 복원용 뷰 설정 | 앱 스토어/localStorage/서버 | 그리드 수명주기보다 오래 살아야 함 |

**안티패턴**: 정렬·필터 상태를 Redux/Zustand에 두고 그리드 이벤트마다 dispatch → 스토어 변경 → `columnDefs` 재생성 → 그리드 상태 리셋 루프. 그리드가 스스로 관리하는 상태를 밖에서 이중 관리하지 않는다.

### 9-2. TanStack Query와의 조합

```tsx
'use client';

function ProductGridContainer() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 60_000,
  });

  // 서버 상태 → rowData 단방향. 그리드는 데이터를 소유하지 않는다.
  return (
    <div style={{ height: 500 }}>
      <AgGridReact<Product>
        theme={appGridTheme}
        rowData={data}
        loading={isLoading}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowId}
      />
    </div>
  );
}
```

- `getRowId`가 있으므로 리페치로 `rowData` 배열이 새로 와도 **선택·펼침·스크롤이 유지**되고 바뀐 행만 갱신된다. 서버 상태 + 그리드 조합에서 `getRowId`가 사실상 필수인 이유다.
- 낙관적 업데이트는 Query 캐시(`setQueryData`)에서 처리하고, 그리드는 그 결과를 받기만 한다. 그리드 API로 직접 행을 고치면 캐시와 화면이 어긋난다.
- 서버 상태 캐싱 규칙 자체는 `frontend/tanstack-query` 스킬을 참조한다.

### 9-3. 컬럼 상태 저장/복원

```ts
// 저장 — 정렬·폭·순서·핀·표시여부·그룹 등 컬럼 관련 상태
const columnState = api.getColumnState();
localStorage.setItem('product-grid-columns', JSON.stringify(columnState));

// 복원
const saved = localStorage.getItem('product-grid-columns');
if (saved) {
  api.applyColumnState({
    state: JSON.parse(saved),
    applyOrder: true, // 컬럼 순서까지 반영
  });
}

// 저장본에 없는 컬럼 처리 — 예: 나머지 컬럼 정렬 해제
api.applyColumnState({
  state: savedState,
  defaultState: { sort: null },
});
```

`applyColumnState`는 **state에 없는 컬럼을 찾지 못하면 `false`를 반환**한다. 컬럼 구성이 바뀌는 배포 후 옛 저장본을 복원할 때는 반환값을 확인하고, 실패 시 저장본을 폐기하는 로직을 둔다.

### 9-4. 그리드 전체 상태 (`initialState` / `getState`)

컬럼뿐 아니라 필터·선택·페이지·피벗·사이드바까지 한 번에 다루려면 Grid State를 쓴다.

```tsx
const [initialState] = useState(() => loadGridState()); // 최초 1회만 읽는다

<AgGridReact
  initialState={initialState}
  onStateUpdated={(e) => saveGridStateDebounced(e.state)}
  /* ... */
/>
```

- `initialState`는 공식 문서 표현대로 **"It is only read once when the grid is created"** — 이후에 값을 바꿔도 반영되지 않는다. 리렌더마다 새 객체를 만들지 말고 `useState` 초기화 함수로 고정한다.
- 현재 상태는 `api.getState()` 또는 `onStateUpdated` 이벤트로 얻는다.
- 모든 상태 속성이 optional이므로, 복원하고 싶지 않은 항목(예: 스크롤 위치)은 저장 시 제외하면 된다. 컬럼 상태 일부만 적용할 때는 `partialColumnState: true`를 쓴다.

**선택 기준**: 컬럼 레이아웃만 저장 → `getColumnState`/`applyColumnState`. 화면 전체 뷰(필터·페이지 포함)를 복원 → `initialState`/`getState`.

---

## 10. 성능 — Row Model과 가상화

### 10-1. Row Model 선택 (라이선스 포함)

| Row Model | 라이선스 | 모듈 | 언제 |
|-----------|:---:|------|------|
| **Client-Side** (기본) | Community | `ClientSideRowModelModule` | 전체 데이터를 한 번에 받아도 되는 경우. 정렬·필터·그룹을 브라우저가 처리. 실무 상한은 대략 수만 행 |
| **Infinite** | Community | `InfiniteRowModelModule` | 스크롤에 따라 블록 단위로 서버에서 더 받아옴. 서버 페이징만 필요하고 그룹핑은 불필요할 때 |
| **Server-Side** | **Enterprise** | `ServerSideRowModelModule` | 서버에서 정렬·필터·**그룹·집계**까지 수행. 수백만 행 + 그룹 트리 |
| **Viewport** | **Enterprise** | `ViewportRowModelModule` | 서버가 "지금 보이는 행 범위"를 알아야 하는 실시간 시세형 화면 |

> 주의: "대량 데이터 = Server-Side Row Model"로 반사적으로 답하면 안 된다. **SSRM은 Enterprise 전용**이다. Community 프로젝트에서 서버 페이징이 필요하면 Infinite Row Model이 답이다.

**Infinite Row Model 골격**

```ts
api.setGridOption('datasource', {
  getRows: async (params) => {
    // params.startRow / params.endRow / params.sortModel / params.filterModel
    const res = await fetchPage(params.startRow, params.endRow, params.sortModel);
    params.successCallback(res.rows, res.totalCount);
  },
});
```

### 10-2. 가상화와 `rowBuffer`

그리드는 화면에 보이는 행·열만 DOM에 그린다. 1,000행 × 20열이라도 실제 렌더는 보이는 50행 × 10열 수준이다.

- `rowBuffer` 기본값은 **10** — 뷰포트 위아래로 10행씩 더 그려 스크롤 시 빈 공간을 방지한다.
- **버퍼는 픽셀 범위로 계산된다.** 기본 행 높이 42px 기준 `rowBuffer=10`은 위아래 각 420px이다. 행 높이를 100px로 키우면 같은 420px 안에 5행밖에 안 들어가 실제 버퍼 행 수가 줄어든다. 행 높이를 키웠다면 `rowBuffer`도 함께 올린다.
- `suppressColumnVirtualisation` / `suppressRowVirtualisation`은 가상화를 끈다. 테스트 편의나 인쇄용 외에는 쓰지 않는다(대량 데이터에서 즉시 프리즈).

### 10-3. 실무 성능 체크리스트

- [ ] `getRowId` 설정 — 갱신 시 DOM 전체 재생성 방지
- [ ] `rowData`·`columnDefs`·객체/함수 옵션에 안정 참조(`useState`/`useMemo`/`useCallback`) 적용
- [ ] 셀 렌더러 남용 금지 — 텍스트 가공은 `valueFormatter`, 파생 값은 `valueGetter`
- [ ] 고빈도 갱신은 `applyTransaction` / `applyTransactionAsync`
- [ ] 컬럼 수가 많으면 `flex`·`minWidth`로 폭을 정의하고 전체 `autoSizeAllColumns` 반복 호출 금지
- [ ] 모듈은 개별 등록으로 트리 셰이킹 (`AllCommunityModule`은 트리 셰이킹 불가)
- [ ] 프로덕션 번들에서 `ValidationModule` 제외 (v33 개별 등록 시)
- [ ] 그리드가 첫 화면 요소가 아니면 코드 스플리팅

---

## 11. AG Grid vs react-virtuoso — 선택 기준

가상 스크롤이라는 점에서 겹치지만 해결하는 문제가 다르다. react-virtuoso API 요약은 `frontend/chat-ui-pattern` 스킬의 references/REFERENCE.md 16절에 있다(그 스킬이 설치되지 않은 템플릿이면 https://virtuoso.dev/react-virtuoso/ 공식 문서를 본다).

| 요구사항 | AG Grid | react-virtuoso |
|----------|:---:|:---:|
| 표 형태 + 컬럼 정렬·필터·리사이즈·핀 고정 | ✅ | ❌ (직접 구현) |
| 셀 편집, 클립보드, 엑셀형 인터랙션 | ✅ | ❌ |
| 그룹핑·피벗·집계 | ✅ (Enterprise) | ❌ |
| 컬럼 상태 저장/복원, 툴 패널 | ✅ | ❌ |
| **가변 높이 아이템 자동 측정** | 제한적(`autoHeight` 필요, 비용 있음) | ✅ 기본 동작 |
| 카드/피드/채팅처럼 행 구조가 자유로운 리스트 | ❌ 과잉 | ✅ |
| 그룹 헤더 sticky 리스트 | Enterprise 그룹핑 필요 | ✅ `GroupedVirtuoso` |
| 번들 크기 | 큼 (그리드 엔진 전체) | 작음 |
| 라이선스 | Community MIT / 고급 기능 상용 | MIT |

**판단 규칙**
- 사용자가 **컬럼을 조작**(정렬·필터·순서 변경·폭 조절)해야 하면 → AG Grid.
- 데이터가 표지만 **읽기 전용이고 컬럼 조작이 없으며** 행이 단순하면 → `TableVirtuoso`로 충분하고 번들이 훨씬 가볍다.
- 행이 표가 아니라 **카드·메시지·피드**면 → react-virtuoso.
- 무한 스크롤만 필요하고 그리드 기능이 필요 없는데 AG Grid Infinite Row Model을 도입하는 것은 과잉이다.

---

## 12. 흔한 실수 패턴

| # | 실수 | 증상 | 해결 |
|---|------|------|------|
| 1 | v33에서 모듈 미등록 | `error #200 ... is not registered`, 기능 무반응 | 에러 메시지의 모듈을 `ModuleRegistry.registerModules`로 등록 |
| 2 | `AllCommunityModule`만 쓰고 번들 최적화 방치 | 초기 번들 과대 | 개별 모듈 등록으로 전환 (AllCommunity는 트리 셰이킹 불가) |
| 3 | Theming API + 레거시 CSS 동시 사용 | 스타일 깨짐·중복 적용 | CSS import 제거하거나 `theme="legacy"` 중 하나로 통일 |
| 4 | 그리드 컨테이너에 높이 미지정 | 그리드가 보이지 않음 | 부모에 `height` 지정 (그리드는 부모 크기를 채운다) |
| 5 | `getRowId` 미설정 | 갱신마다 선택·펼침 유실, DOM 전체 재생성 | 서버 PK 기반 `getRowId` 설정 |
| 6 | `getRowId`를 인덱스/랜덤으로 반환 | 정렬·필터 후 행이 뒤섞임, 선택 깨짐 | 안정적·유일한 문자열 ID 사용 |
| 7 | `rowData` 배열/객체 제자리 수정 | 화면이 갱신되지 않음 | 새 배열 + 바뀐 행만 새 객체 |
| 8 | `columnDefs`/`defaultColDef`를 인라인 리터럴로 전달 | 정렬·필터·컬럼 폭이 리렌더마다 초기화 | `useMemo`/`useState`로 참조 고정 |
| 9 | 함수 옵션에 `useCallback` 미적용 | 그리드 상태 리셋 | 공식 문구대로 함수 옵션은 `useCallback` "strongly recommend" |
| 10 | 셀 렌더러를 부모 컴포넌트 안에서 정의 | 셀이 매 렌더 언마운트/리마운트, 포커스 유실 | 모듈 스코프로 이동 |
| 11 | 단순 포맷팅에 셀 렌더러 사용 | 스크롤 성능 저하 | `valueFormatter`/`valueGetter` 사용 |
| 12 | Enterprise 기능을 Community 프로젝트에 도입 | 워터마크 + 콘솔 에러, 라이선스 위반 | 2절 표로 사전 확인. 대안: Set Filter → 커스텀 필터, SSRM → Infinite Row Model |
| 13 | 서버 컴포넌트에서 `columnDefs` 생성해 전달 | 함수 직렬화 에러 | 컬럼 정의는 클라이언트 컴포넌트에서 생성 |
| 14 | 모듈 등록을 `useEffect`에서 수행 | StrictMode 이중 실행·초기화 순서 문제 | 모듈 스코프에서 1회 등록 |
| 15 | `gridRef.current.api`를 마운트 직후 접근 | `null` 참조 에러 | `onGridReady`의 `event.api` 사용 |
| 16 | 정렬·필터 상태를 전역 스토어로 이중 관리 | 상태 리셋 루프, 무한 렌더 | 그리드 내부 상태로 두고 스냅샷만 저장 |
| 17 | 행 높이를 키우고 `rowBuffer` 그대로 | 빠른 스크롤 시 빈 영역 | 버퍼는 픽셀 기준 → `rowBuffer` 상향 |
| 18 | 대량 데이터에서 가상화 억제 옵션 사용 | 브라우저 프리즈 | `suppressRowVirtualisation` 등은 쓰지 않는다 |
| 19 | `rowSelection="multiple"` (문자열) 사용 | deprecated 경고 | `rowSelection={{ mode: 'multiRow' }}` |
| 20 | community/enterprise/react 패키지 버전 불일치 | 런타임 모듈 에러 | 세 패키지 버전 고정·동시 승급 |
