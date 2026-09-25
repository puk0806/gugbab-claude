---
name: ag-grid
description: AG Grid v33 데이터 그리드 — 모듈 등록(ModuleRegistry/AllCommunityModule), Theming API, Community vs Enterprise 라이선스 경계, React 커스텀 셀 렌더러·getRowId·useMemo, Next.js App Router, 그리드 상태 저장/복원, row model별 성능 전략
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
> 검증일: 2026-08-26
> 버전 기준: `ag-grid-community` / `ag-grid-react` **33.x** (최신 안정 메이저는 36.1.0 — 8절에 v33→v36 차이 정리)

---

## 0. 버전 기준

이 스킬은 **v33.x**를 기준으로 작성했다. v33은 AG Grid 역사상 변경 폭이 가장 큰 메이저 중 하나로, 아래 두 가지가 v32 이하와 근본적으로 다르다.

| 축 | v32 이하 | v33 |
|----|----------|-----|
| 패키지 | `@ag-grid-community/*`, `@ag-grid-enterprise/*` 스코프 패키지 다수 | `ag-grid-community` / `ag-grid-enterprise` / `ag-grid-react` 로 통합 |
| 기능 활성화 | 패키지 import만으로 대부분 동작 | **모듈 등록 필수** (`ModuleRegistry.registerModules`) |
| 스타일 | CSS 파일 import + `ag-theme-*` 클래스 | **Theming API 기본** (`theme` 그리드 옵션에 JS 테마 객체) |

> AG Grid 공식 발표 기준 v33의 모듈 아키텍처는 사용하는 기능에 따라 번들 크기를 **20~40%** 줄인다.

**설치 (v33)**

```bash
npm install ag-grid-community@33 ag-grid-react@33
# Enterprise 기능을 쓸 때만 (상용 라이선스 필요)
npm install ag-grid-enterprise@33
```

`ag-grid-react`는 `ag-grid-community`를 동일 버전으로 의존한다. **세 패키지의 버전은 반드시 일치**시켜야 한다(혼용 시 모듈 레지스트리 불일치로 런타임 에러).

React 지원 범위는 `^16.8 || ^17 || ^18 || ^19` 이며, 공식 호환성 표 기준 **React 19는 AG Grid 32.3 이상**에서 지원된다. 즉 v33 + React 19 조합은 공식 지원 범위 안이다.

---

## 1. 모듈 등록 — v33에서 가장 많이 터지는 지점

v33부터는 **쓰려는 기능의 모듈을 등록하지 않으면 그 기능이 아예 동작하지 않는다.** 등록 누락 시 콘솔에 다음 형태의 에러가 뜬다.

```
AG Grid: error #200 Unable to use rowSelection as RowSelectionModule is not registered.
```

`#200`은 "모듈 미등록" 에러 코드다. `rowSelection` 자리에 미등록 기능명, `RowSelectionModule` 자리에 필요한 모듈명이 들어간다. **에러 메시지에 적힌 모듈을 등록하면 그대로 해결된다.**

### 1-1. 전역 등록 (가장 흔한 방식)

```ts
// grid-setup.ts — 앱 엔트리에서 1회만 import
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);
```

- 반드시 **그리드가 인스턴스화되기 전에** 실행돼야 한다.
- 한 번 등록하면 앱 내 모든 그리드에 적용된다.
- 모듈 스코프(파일 최상단)에서 호출하므로 React 리렌더·StrictMode 중복 마운트와 무관하다.

### 1-2. 개별 모듈 등록 (트리 셰이킹용 — 권장)

`AllCommunityModule`은 편하지만 **모든 Community 모듈을 포함하므로 트리 셰이킹이 되지 않는다.** 번들 크기가 중요하면 필요한 모듈만 등록한다.

```ts
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  PaginationModule,
  RowSelectionModule,
  CsvExportModule,
  ValidationModule,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  PaginationModule,
  RowSelectionModule,
  CsvExportModule,
  // 개발 빌드에서만 — 설정 오류 진단용
  ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);
```

**`ValidationModule`**: 잘못된 설정을 콘솔 경고로 알려주는 진단 모듈이다.
- v33의 `AllCommunityModule` / `AllEnterpriseModule`에는 **기본 포함**되어 있다.
- 개별 등록 방식을 쓰면 프로덕션 번들에서 제외하는 것이 공식 권장이다. 미등록 상태에서는 콘솔 메시지가 전체 문구 대신 **에러 코드 + 문서 링크**로 축약된다.

### 1-3. 그리드 단위 등록

그리드마다 필요한 기능이 다르거나 지연 로딩하고 싶을 때 사용한다. 전역 등록분과 **합쳐져서** 적용된다.

```tsx
<AgGridReact
  modules={[ClientSideRowModelModule, CsvExportModule]}
  rowData={rowData}
  columnDefs={columnDefs}
/>
```

등록 여부는 런타임에서 확인할 수 있다.

```ts
api.isModuleRegistered('SetFilterModule'); // boolean
```

### 1-4. Enterprise 모듈 등록

Enterprise 모듈은 `ag-grid-enterprise`에서 import한다. Integrated Charts / Sparklines는 **AG Charts를 별도 의존성으로 추가하고 `.with()`로 주입**해야 한다(v33 신규 요구사항).

```ts
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

ModuleRegistry.registerModules([
  AllEnterpriseModule.with(AgChartsEnterpriseModule),
]);
```

---

## 2. 라이선스 경계 — Community(MIT) vs Enterprise(상용)

**이 절을 잘못 읽으면 라이선스 위반 코드를 쓰게 된다.** 판별 규칙은 단순하다.

> **`ag-grid-community`에서 import되면 Community(MIT), `ag-grid-enterprise`에서 import되면 Enterprise(상용 EULA)다.**

Enterprise는 소스가 공개돼 있고 라이선스 키 없이도 *동작은* 하지만, **워터마크와 콘솔 에러가 표시**되며 프로덕션 사용에는 유료 라이선스가 필요하다. 라이선스 키 없이 허용되는 것은 로컬 평가/개발이며, 프로덕션 테스트에는 트라이얼 키를 발급받아야 한다.

```ts
import { LicenseManager } from 'ag-grid-enterprise';

LicenseManager.setLicenseKey(process.env.NEXT_PUBLIC_AG_GRID_LICENSE_KEY!);
```

### 2-1. 기능 구분표

| 기능 | Community (MIT) | Enterprise (상용) | 모듈 |
|------|:---:|:---:|------|
| 컬럼 정의·정렬·페이지네이션 | ✅ | | `PaginationModule` 등 |
| 텍스트/숫자/날짜 필터, 커스텀 필터, 플로팅 필터 | ✅ | | `TextFilterModule` / `NumberFilterModule` / `DateFilterModule` / `CustomFilterModule` |
| 행/열 가상화 (DOM 가상 스크롤) | ✅ | | (코어) |
| 커스텀 셀 렌더러·에디터 (React 컴포넌트) | ✅ | | (코어 / 에디터별 모듈) |
| 행 선택 (단일·다중) | ✅ | | `RowSelectionModule` |
| CSV 내보내기 | ✅ | | `CsvExportModule` |
| Client-Side Row Model | ✅ | | `ClientSideRowModelModule` |
| **Infinite Row Model** | ✅ | | `InfiniteRowModelModule` |
| 테마·CSS 커스터마이징, 접근성(ARIA)·키보드 내비 | ✅ | | (코어) |
| 그리드 상태 저장/복원 (`initialState`/`getState`) | ✅ | | `GridStateModule` |
| **컬럼 메뉴** (헤더 햄버거 메뉴) | | ✅ | `ColumnMenuModule` |
| **컨텍스트 메뉴** (우클릭) | | ✅ | `ContextMenuModule` |
| **Set Filter / Multi Filter / Advanced Filter** | | ✅ | `SetFilterModule` / `MultiFilterModule` / `AdvancedFilterModule` |
| **행 그룹핑 / 집계 / 피벗** | | ✅ | `RowGroupingModule` / `PivotModule` / `RowGroupingPanelModule` |
| **Tree Data** | | ✅ | `TreeDataModule` |
| **Master / Detail** | | ✅ | `MasterDetailModule` |
| **Excel 내보내기** (스타일·수식 포함) | | ✅ | `ExcelExportModule` |
| **클립보드 (엑셀 유사 복붙)** | | ✅ | `ClipboardModule` |
| **셀(범위) 선택** | | ✅ | `CellSelectionModule` |
| **사이드바 / 툴 패널 / 상태 바** | | ✅ | `SideBarModule` / `ColumnsToolPanelModule` / `FiltersToolPanelModule` / `StatusBarModule` |
| **Integrated Charts / Sparklines** | | ✅ | `IntegratedChartsModule` / `SparklinesModule` (+ AG Charts) |
| **Rich Select 에디터** | | ✅ | `RichSelectModule` |
| **Server-Side Row Model** | | ✅ | `ServerSideRowModelModule` |
| **Viewport Row Model** | | ✅ | `ViewportRowModelModule` |

> 주의: **Community에는 컬럼 메뉴 자체가 없다.** 공식 문서 표현 그대로 "AG Grid Community does not have a menu, but can launch Column Filters if enabled" — Community에서는 헤더의 필터 버튼/플로팅 필터로 필터만 띄울 수 있다. "필터 UI가 필요하다 → 컬럼 메뉴 예시"로 답하면 Enterprise 기능을 Community인 것처럼 제시하는 오답이 된다.

> 주의: 대량 데이터 처리에서 **서버 페이징이 필요하면 Community 범위는 Infinite Row Model까지**다. 서버 사이드 그룹핑·집계가 필요한 순간 Server-Side Row Model = Enterprise 영역으로 넘어간다.

---

## 3. 기본 사용 — `AgGridReact` + TypeScript 제네릭

```tsx
'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  themeQuartz,
  type ColDef,
  type GetRowIdParams,
  type GridApi,
  type GridReadyEvent,
  type ValueFormatterParams,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  updatedAt: string;
}

export function ProductGrid({ rows }: { rows: Product[] }) {
  const gridRef = useRef<AgGridReact<Product>>(null);
  const [api, setApi] = useState<GridApi<Product> | null>(null);

  // 객체·배열 prop은 반드시 안정 참조로 (5절 참조)
  const columnDefs = useMemo<ColDef<Product>[]>(
    () => [
      { field: 'name', headerName: '상품명', flex: 2, minWidth: 160 },
      {
        field: 'price',
        headerName: '가격',
        type: 'rightAligned',
        valueFormatter: (p: ValueFormatterParams<Product, number>) =>
          p.value == null ? '' : `${p.value.toLocaleString()}원`,
      },
      { field: 'stock', headerName: '재고', width: 110 },
      // 파생 값은 rowData를 늘리지 말고 valueGetter로
      {
        colId: 'total',
        headerName: '재고금액',
        valueGetter: (p) =>
          p.data ? p.data.price * p.data.stock : null,
      },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef<Product>>(
    () => ({ sortable: true, filter: true, resizable: true }),
    [],
  );

  // 행 동일성 판별 키 — 4절 참조
  const getRowId = useCallback(
    (params: GetRowIdParams<Product>) => params.data.id,
    [],
  );

  const onGridReady = useCallback((e: GridReadyEvent<Product>) => {
    setApi(e.api);
  }, []);

  return (
    // 그리드는 부모 컨테이너 크기를 채운다 — 높이 지정 필수
    <div style={{ height: 500 }}>
      <AgGridReact<Product>
        ref={gridRef}
        theme={themeQuartz}
        rowData={rows}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowId}
        onGridReady={onGridReady}
        // v33: 문자열 'single'/'multiple' 대신 객체 API
        rowSelection={{ mode: 'multiRow' }}
      />
    </div>
  );
}
```

### 3-1. 제네릭 타입 정리

| 타입 | 용도 |
|------|------|
| `ColDef<TRow, TValue>` | 컬럼 정의. `TValue`까지 주면 `valueFormatter`/`valueGetter` 파라미터가 좁혀진다 |
| `ColGroupDef<TRow>` | 그룹 헤더 정의 (`children` 보유) |
| `GridOptions<TRow>` | 옵션 객체를 밖에서 만들 때. 제네릭이 하위 콜백 파라미터로 전파된다 |
| `GridApi<TRow>` | 그리드 API. `onGridReady`의 `event.api` 또는 `gridRef.current.api` |
| `AgGridReact<TRow>` | 컴포넌트 + ref 타입. `useRef<AgGridReact<Product>>(null)` |
| `GetRowIdParams<TRow>` | `getRowId` 콜백 파라미터. `params.data`가 `TRow` |
| `CustomCellRendererProps<TRow, TValue>` | React 셀 렌더러 props (`ag-grid-react`에서 import) |

제네릭은 **선택**이며 생략 시 `any`로 동작한다. 도메인 리팩터링 대상 그리드라면 반드시 붙여서 필드명 오타를 컴파일 타임에 잡는다.

### 3-2. `gridOptions` vs 개별 prop

`AgGridReact`는 개별 prop과 `gridOptions` 객체를 모두 받는다. 실무에서는 **개별 prop을 기본**으로 하고, 여러 그리드가 공유하는 공통 설정만 `gridOptions`로 뽑는 편이 타입 추론·가독성 모두 낫다.

```ts
// 여러 그리드가 공유하는 기본값
export const baseGridOptions: GridOptions<Product> = {
  animateRows: true,
  rowHeight: 40,
  suppressCellFocus: false,
};
```

> 주의: `gridOptions`와 동일 키의 개별 prop을 같이 주면 어느 쪽이 이기는지 헷갈리는 코드가 된다. **한 키는 한 곳에서만** 정의한다.

앱 전역 기본값은 `provideGlobalGridOptions`로도 줄 수 있다.

```ts
import { provideGlobalGridOptions } from 'ag-grid-community';

provideGlobalGridOptions({ theme: 'legacy' });
```

---

## 4. `getRowId` — 그리드 동작의 근간

공식 문서 표현: "Provide a pure function that returns a string ID to uniquely identify a given row."

### 4-1. 없을 때 vs 있을 때

| | `getRowId` 없음 | `getRowId` 있음 |
|---|---|---|
| `rowData` 교체 시 | "the grid rips all data out of the grid and starts from scratch" — 전부 파기 후 재생성 | ID 비교로 **변경분만** 델타 갱신 |
| 행 선택 | 유실 | 유지 |
| 펼친 그룹 | 유실 | 유지 |
| DOM | 전체 재렌더 | 바뀐 행만 갱신 + 위치 애니메이션 |

**세 가지 제약**
1. 유일성 — 두 행이 같은 ID를 가지면 안 된다.
2. 안정성 — 같은 행이면 항상 같은 문자열을 반환해야 한다 (인덱스 기반 ID 금지).
3. 문자열 — 숫자 PK면 `String(params.data.id)`로 변환한다.

```ts
// ❌ 인덱스·랜덤 — 재정렬/재조회마다 ID가 바뀌어 선택·상태가 전부 깨진다
getRowId={(p) => String(p.node.rowIndex)}
getRowId={() => crypto.randomUUID()}

// ✅ 서버 PK
getRowId={(p) => String(p.data.id)}
// ✅ 복합키
getRowId={(p) => `${p.data.orderId}:${p.data.lineNo}`}
```

### 4-2. `rowData` 불변성

델타 갱신은 **ID가 같은 행의 객체 참조가 달라졌는지**로 "변경"을 판단한다. 따라서 기존 객체를 제자리 수정하면 그리드가 변경을 인지하지 못한다.

```ts
// ❌ 원본 배열/객체 mutate — 참조가 그대로라 갱신 안 됨
rows[3].stock = 0;
setRows(rows);

// ✅ 바뀐 행만 새 객체로 교체
setRows((prev) =>
  prev.map((r) => (r.id === targetId ? { ...r, stock: 0 } : r)),
);
```

### 4-3. 고빈도 갱신은 트랜잭션으로

`rowData` 교체는 그리드가 "무엇이 바뀌었는지" 스스로 계산해야 하므로 오버헤드가 있다. 수천 행 이상 + 초당 다수 갱신이면 변경분을 명시하는 트랜잭션이 낫다.

```ts
api.applyTransaction({
  add: [newRow],
  update: [changedRow],
  remove: [{ id: removedId } as Product],
});

// 초고빈도 스트리밍 — 비동기 큐에 모아 배치 적용
api.applyTransactionAsync({ update: ticks });
```

> `rowNode.setData` / `updateData` / `setDataValue`는 단일 행/셀만 갱신한다. 공식 문서 경고: "the grid will not update to reflect a change in sorting, filtering or grouping" — 정렬·필터·그룹까지 반영하려면 `refreshClientSideRowModel()`을 부르거나 `applyTransaction`을 쓴다.

---

> → references/REFERENCE.md §5 React 통합 주의점

---

> → references/REFERENCE.md §6 테마 — Theming API vs 레거시 CSS 테마

---

> → references/REFERENCE.md §7 Next.js App Router

---

> → references/REFERENCE.md §8 v33 → 최신(v36) breaking change 요약

---

> → references/REFERENCE.md §9 상태 관리 연동

---

> → references/REFERENCE.md §10 성능 — Row Model과 가상화

---

> → references/REFERENCE.md §11 AG Grid vs react-virtuoso — 선택 기준

---

> → references/REFERENCE.md §12 흔한 실수 패턴

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
