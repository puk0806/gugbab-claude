---
name: nexacro-to-react-mapping
description: 넥사크로 17 화면을 Next.js(App Router·React 19)로 규칙 기반 재작성할 때 쓰는 대응표 — Dataset→TanStack Query/RHF, transaction→REST 훅(:U 변경분 전송), showModal→클라이언트 모달/Parallel+Intercepting Routes, Grid→AG Grid(Community/Enterprise 두 경로), xeni 엑셀→POI SXSSF/SheetJS, gfn_ 공통함수→공통 훅, 화면 1개 재작성 체크리스트
---

# 넥사크로 17 → Next.js 화면 재작성 대응표

> 소스: https://docs.tobesoft.com/development_tools_guide_nexacro_17_ko/25c78f15984ab038 (마이그레이션 마법사 범위·한계)
> 소스: https://docs.tobesoft.com/developer_guide_nexacro_17_ko/ccdb97b19fa824d8 (Grid 기본 — band·getRowType·applyChange·reset)
> 소스: https://docs.tobesoft.com/advanced_development_guide_nexacro_17_en_kr/bf38022de252cfc6 (Dataset XML 행 타입 insert/update/delete)
> 소스: https://docs.tobesoft.com/getting_started_nexacro_n_en/f58e7c64b69e2051 (transaction 파라미터)
> 소스: https://docs.tobesoft.com/nexacro_technical_note_en/067d3e071928b598 (nexacro-xeni 엑셀 — POI 기반)
> 소스: https://www.ag-grid.com/react-data-grid/ (column-groups · row-spanning · cell-editing · cell-editing-batch · aggregation-total-rows · row-pinning · tree-data · excel-export · excel-import · modules)
> 소스: https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes
> 소스: https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations
> 소스: https://react-hook-form.com/docs/usefieldarray · https://react-hook-form.com/docs/useform/formstate
> 소스: https://poi.apache.org/components/spreadsheet/how-to.html · https://poi.apache.org/changes.html
> 소스: https://docs.sheetjs.com/docs/getting-started/installation/frameworks
> 검증일: 2026-10-08
> 버전 기준: 넥사크로 17 · Next.js 16.x App Router · React 19 · TanStack Query v5 · react-hook-form 7.x · **AG Grid 문서 기준 36.2.0** · Apache POI 5.5.1 · SheetJS 0.20.3

이 스킬은 **"무엇을 무엇으로 바꾸는가"의 판단 규칙**만 고정한다. 각 라이브러리 사용법은 아래 스킬이 정본이다(설치된 경우).

| 주제 | 정본 스킬 |
|------|-----------|
| AG Grid 모듈 등록·라이선스 경계·getRowId·테마 | `ag-grid` |
| App Router·Server/Client 경계·캐싱 | `nextjs` |
| queryKey 설계·staleTime·invalidate 범위·SSR | `tanstack-query` |
| RHF + Zod 폼 기본 | `form-handling` |
| 서버 측 요청 검증·악성 입력 방어 | `form-handling`(폼·Zod 기본) · `zod-schema-validation`(서버 검증 상세 — 설치된 경우) |
| 서버 상태 vs 클라이언트 상태 분류 | `state-management` |

---

## 0. 전제 — 자동 변환은 없다

- 투비소프트 **마이그레이션 마법사는 넥사크로플랫폼 14 → 17 프로젝트 변환 도구**다. 공식 문서 원문: "마이그레이션 기능은 사용자의 마이그레이션 수행을 보조하는 도구일 뿐 **완벽한 마이그레이션을 보장하지 못합니다.**" React 등 타 프레임워크 변환은 다루지 않는다.
- 따라서 넥사크로 → React는 **화면 단위 규칙 기반 재작성**이다. 1:1 문법 치환(xfdl 컴포넌트 → JSX 태그)이 아니라 "이 화면이 하는 일"을 React 관용구로 다시 표현한다.

> 주의: **넥사크로 → React 공개 전환 사례·자동 변환률에 대한 공신력 있는 근거는 찾지 못했다**(2026-10-08 검색). "N% 자동 변환" 같은 수치로 일정을 잡지 않는다.
>
> 참고(낮은 신뢰도): `github.com/netsgo0319/nexacro-test` — Stars 0 개인 PoC. 넥사크로 N 화면 8개를 Vue/React/JSP로 변환해 보며 미지원 기능은 TODO로 수동 처리했다고 기술. 방법론 참고만, 근거로 인용하지 않는다.

---

## 1. 한 장 대응표

| 넥사크로 17 | React / Next.js | 상세 |
|---|---|---|
| Dataset (조회 결과) | `useQuery` 캐시 (서버 상태) | §2-1 |
| Dataset (편집 중인 반복 행 — 폼) | RHF `useFieldArray` (`field.id` key) | §2-2 |
| Dataset (편집 중인 반복 행 — 그리드) | AG Grid `rowData` 로컬 사본 + `getRowId` | §2-3, §5 |
| `getRowType()` insert/update/delete | 원본 vs 현재 **diff 함수**로 계산 | §2-4 |
| `applyChange()` / `reset()` | 저장 성공 후 invalidate로 재조회 / 폼 `reset(원본)` | §2-4 |
| `transaction(svcID, url, in, out, args, callback)` | 도메인별 `useXxxQuery` / `useSaveXxx` 훅 + 요청/응답 DTO | §3 |
| 입력 Dataset `:U` (변경 행만) | `{ inserted, updated, deleted }` 변경분 DTO | §3-2 |
| `showModal` (값 선택 후 반환) | 클라이언트 모달 컴포넌트 (`onSelect` 콜백) | §4 |
| `showModal` (상세 화면, URL 공유 필요) | Parallel Routes + Intercepting Routes | §4 |
| Grid 헤더 병합 | Column Groups (Community) | §5 |
| Grid `suppress` (같은 값 세로 병합) | Row Spanning (Community) | §5 |
| Grid `edittype` 셀 편집 | Cell Editing (Community) | §5 |
| Grid summary 밴드 (합계) | `pinnedBottomRowData` (Community) / `grandTotalRow` (Enterprise) | §5 |
| Grid 트리 (`treelevel`) | Tree Data (Enterprise) | §5 |
| nexacro-xeni 엑셀 내보내기/가져오기 | 서버 Apache POI SXSSF / 클라이언트 SheetJS / AG Grid Excel Export(Enterprise) | §6 |
| `gfn_*` 공통 함수 | 공통 훅·컴포넌트 (`useAppMessage`, `useCommonCode` …) | §7 |

---

## 2. Dataset 중심 상태 → 상태 레이어 분리

넥사크로 Dataset은 **조회 결과 + 편집 버퍼 + 행 상태 추적**을 한 객체가 다 한다. React에서는 셋을 분리한다.

### 2-1. 조회 → TanStack Query

```ts
// features/items/api/queries.ts
export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (cond: ItemSearchCond) => [...itemKeys.lists(), cond] as const,
};

export function useItemList(cond: ItemSearchCond) {
  return useQuery({
    queryKey: itemKeys.list(cond),
    queryFn: () => fetchItems(cond), // 응답 DTO 반환
  });
}
```

- 조회 버튼 = 검색 조건 state 변경 → queryKey 변경으로 재조회. `refetch()`를 조회 버튼마다 부르는 구조로 옮기지 않는다.
- queryKey 설계·staleTime은 `tanstack-query` 스킬을 따른다.

### 2-2. 반복 행 편집(폼) → RHF `useFieldArray`

```tsx
const { control, register } = useForm<ItemsForm>({ defaultValues: { rows: initialRows } });
const { fields, append, remove } = useFieldArray({ control, name: 'rows' });

return fields.map((field, index) => (
  <div key={field.id}> {/* index 금지 — 공식 규칙 */}
    <input {...register(`rows.${index}.name`)} />
    <button type="button" onClick={() => remove(index)}>삭제</button>
  </div>
));
```

공식 규칙 중 이식 시 걸리는 것:
- `useFieldArray`는 key용 고유 `id`를 **자동 생성**한다 → `key={field.id}`.
- 필드 객체에 이미 `id`(DB PK)가 있으면 **자동 생성 id로 덮어써진다**(커스텀 `keyName`으로 피할 수 있으나 `keyName`은 다음 메이저에서 제거 예정). → **서버 PK는 `id`가 아닌 이름(예: `rowKey`)으로 둔다.**
- 액션을 연달아 쌓지 않는다(`append` 직후 `remove` 등) — 공식 권장.
- `append`/`insert`에는 등록된 모든 필드의 값을 갖춘 완전한 객체를 넘긴다.

### 2-3. 반복 행 편집(그리드)

수십 행 이상 + 엑셀형 편집이면 폼이 아니라 AG Grid로 편집한다(§5). 이때도 **쿼리 캐시 객체를 그리드에 그대로 넘기지 않는다** — §5-2의 `readOnlyEdit` 패턴으로 로컬 사본을 불변 갱신한다.

### 2-4. 행 상태(insert/update/delete) 추적 — diff로 계산

넥사크로는 행마다 상태(insert/update/delete — Dataset XML의 `type` 속성, `getRowType()`)를 보관한다. React에서는 **행에 상태 플래그를 들고 다니지 말고, 저장 시점에 "원본(서버 응답)"과 "현재 편집본"을 비교해 계산**한다. 플래그 방식은 "추가 후 삭제", "수정 후 원복" 같은 경계에서 상태가 틀어지기 쉽다.

```ts
// shared/lib/row-changes.ts
export interface RowChanges<T> {
  inserted: T[];
  updated: T[];
  deleted: string[]; // 서버 키만
}

export function diffRows<T>(
  original: readonly T[],
  current: readonly T[],
  getKey: (row: T) => string | undefined, // 신규 행은 undefined
  isEqual: (a: T, b: T) => boolean,
): RowChanges<T> {
  const originalByKey = new Map<string, T>();
  for (const row of original) {
    const key = getKey(row);
    if (key !== undefined) originalByKey.set(key, row);
  }

  const inserted: T[] = [];
  const updated: T[] = [];
  const seen = new Set<string>();

  for (const row of current) {
    const key = getKey(row);
    if (key === undefined) {
      inserted.push(row);
      continue;
    }
    const before = originalByKey.get(key);
    if (before === undefined) continue; // 원본에 없는 키 = 조작된 입력, 무시(서버도 재검증)
    seen.add(key);
    if (!isEqual(before, row)) updated.push(row);
  }

  const deleted = [...originalByKey.keys()].filter((k) => !seen.has(k));
  return { inserted, updated, deleted };
}
```

- "추가 후 삭제"한 행은 원본에 없으므로 자연히 어디에도 안 잡힌다(넥사크로에서 신규 행 삭제가 전송되지 않는 것과 같은 결과).
- RHF `formState.dirtyFields`는 **필드 단위** 변경 표시라 행 삭제를 표현하지 못한다 → 저장 페이로드는 diff로 만들고, `isDirty`는 "저장 버튼 활성화"·"이탈 경고" 용도로만 쓴다(`defaultValues` 전체 제공 필수).
- `reset()`(넥사크로) ↔ RHF `reset(원본)` / 그리드 로컬 사본을 원본으로 되돌림. `applyChange()` ↔ 저장 성공 후 `invalidateQueries`로 재조회해 원본 자체를 갱신.

---

## 3. `transaction()` → REST 호출 훅

### 3-1. 파라미터 대응

| `transaction()` 인자 | React 쪽 |
|---|---|
| 서비스 ID (`strSvcID`) | 훅 이름 + 엔드포인트 (`useSaveItems` → `POST /api/items/changes`). mutationKey로도 사용 가능 |
| URL | API 클라이언트의 경로 상수 |
| 입력 Dataset (`"서버명=화면Dataset"`) | **요청 DTO 타입** (Zod 스키마로 정의 → 서버와 공유, `form-handling` · `zod-schema-validation`(설치된 경우) 참조) |
| 출력 Dataset (`"화면Dataset=서버명"`) | **응답 DTO 타입**. 응답을 화면 상태에 직접 대입하지 말고 쿼리 캐시로 받음 |
| 인자 문자열 (`strArgument`) | query string / body 필드로 명시적 타입화 |
| 콜백 (`svcID, errorCode, errorMsg`) | `onSuccess` / `onError` (+ 공통 에러 처리는 QueryClient 기본 옵션이나 공통 훅) |
| 동기 호출 (`bAsync=false`) | 대응 없음 — `await mutateAsync()`로 순서를 표현. 동기 블로킹을 흉내 내지 않는다 |

한 화면의 `fn_search` / `fn_save` / `fn_delete` 콜백 분기(`switch(svcID)`)는 **훅 단위로 쪼갠다**. 서비스 ID 문자열로 분기하는 공용 콜백을 React에 옮기지 않는다.

### 3-2. 저장 = `useMutation` + `invalidateQueries`

```ts
export function useSaveItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (changes: RowChanges<ItemRow>) => postItemChanges(changes),
    // 공식 문서: onSuccess에서 Promise를 반환하면 invalidate가 끝날 때까지 isPending 유지
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}

// 화면
const save = useSaveItems();
const onSave = () => {
  const changes = diffRows(original, current, (r) => r.rowKey, isSameItem);
  if (!changes.inserted.length && !changes.updated.length && !changes.deleted.length) {
    showInfo('변경된 내용이 없습니다.'); // 넥사크로의 "변경 없음" 체크 대응
    return;
  }
  save.mutate(changes);
};
```

- **`:U`(변경 행만 전송) 대응 = `diffRows` 결과만 보내는 변경분 DTO.** 전체 목록 교체가 필요한 화면(넥사크로에서 `:A`로 보내던 경우)은 별도 "전체 교체(PUT)" 엔드포인트로 의도를 드러낸다.
- 서버는 클라이언트가 보낸 분류(inserted/updated/deleted)를 **신뢰하지 않는다**: 각 키의 존재·소유권·권한을 재검증하고, 수량·금액 등 파생 값은 서버에서 재계산한다(적대적 테스트 대상 — IDOR, 조작된 키, 빈 배열, 초대량 배열).

> 주의: 입력 Dataset 접미사 `:U`(변경 행만) / `:A`(전체 행)의 의미는 **커뮤니티 자료 기준**이며, 투비소프트 공식 레퍼런스 원문은 이번 검증에서 확인하지 못했다. `:N`의 정확한 의미는 미검증이므로 이 스킬에서 대응 규칙을 두지 않는다 — 기존 화면에 `:N`이 있으면 서버 쪽 처리 코드를 읽어 실제 전송 행을 확인한 뒤 결정한다.

---

## 4. `showModal` 팝업 → 두 갈래

| 기존 팝업 성격 | 대응 | 이유 |
|---|---|---|
| 값을 골라 **부모로 돌려주는** 팝업 (코드 검색, 거래처 선택, 확인창) | **클라이언트 모달 컴포넌트** + `onSelect` 콜백 | 부모 상태와 강하게 결합. URL이 필요 없음 |
| **독립 화면**인데 목록 위에 띄우던 팝업 (상세 조회·수정) — 링크 공유·새로고침 유지가 필요 | **Parallel Routes + Intercepting Routes** | 공식 문서: URL로 공유 가능, 새로고침 시 맥락 유지, 뒤로가기로 닫힘, 앞으로가기로 다시 열림 |

### 4-1. 값 반환형 → 클라이언트 모달

```tsx
'use client';
interface CodePickerModalProps {
  open: boolean;
  groupCode: string;
  onSelect: (code: { value: string; label: string }) => void;
  onClose: () => void;
}
// 부모
<CodePickerModal
  open={pickerOpen}
  groupCode="REGION"
  onSelect={(c) => { setValue('regionCode', c.value); setPickerOpen(false); }}
  onClose={() => setPickerOpen(false)}
/>
```

- 반환값은 **타입이 있는 콜백 인자**로 받는다. "닫힐 때 문자열 하나 반환 → 부모가 파싱" 같은 구조는 옮기지 않는다.

> 주의: 넥사크로 17 `showModal`의 **반환값 규약(닫을 때 값 전달 방식·콜백 시그니처)은 이번 검증에서 공식 문서로 확인하지 못했다.** 기존 화면의 팝업 호출부와 팝업 쪽 닫기 코드를 직접 읽어 "무엇을 어떤 형태로 돌려주는지"를 먼저 정리한 뒤 `onSelect` 인자 타입으로 옮긴다.

### 4-2. URL 공유형 → Parallel + Intercepting Routes

```
app/items/
├── layout.tsx              # { children, modal } 두 슬롯 렌더
├── page.tsx                # 목록
├── [rowKey]/page.tsx       # 상세 전체 페이지 (새로고침·직접 진입)
└── @modal/
    ├── default.tsx         # return null — 모달 비활성 상태
    └── (.)[rowKey]/page.tsx  # 목록에서 클릭 시 가로채서 모달로 렌더
```

- 닫기: `router.back()` 또는 `Link`. Link로 다른 경로로 갈 때 모달이 남지 않게 하려면 슬롯에 `null`을 반환하는 페이지(필요 시 `[...catchAll]`)를 둔다.
- `default.tsx`가 없으면 새로고침 시 매칭되지 않는 슬롯이 404가 된다.
- **권한 주의 (공식 문서):** 레이아웃에서 역할에 따라 슬롯을 골라 렌더해도 **두 슬롯 모두 서버에서 실행되고 결과가 응답에 포함된다** — "조건문은 무엇을 보여줄지 결정할 뿐 무엇이 실행될지는 결정하지 않는다." → 권한 검사는 **각 슬롯의 page 안 또는 DAL(Data Access Layer)** 에서 한다. 넥사크로처럼 "버튼/팝업을 안 보이게 하면 끝"으로 옮기지 않는다.

---

## 5. Grid → AG Grid 대응표

> 주의: **AG Grid 버전과 Enterprise 라이선스 결정이 선행돼야 한다.** 이 절은 공식 문서 **36.2.0** 기준이다. `ag-grid` 스킬은 v33 기준으로 작성돼 있으며, **Batch Editing은 v34에서 추가**되어 v33에는 없다(v33.3.2 아카이브에 해당 페이지 없음). Enterprise 기능은 라이선스 키 없이 동작은 하지만 워터마크·콘솔 에러가 뜨며 프로덕션 사용에는 상용 라이선스가 필요하다(`ag-grid` 스킬 §2).

### 5-1. 기능별 대응 — 무료/유료 두 경로

| 넥사크로 Grid 기능 | Community(MIT) 경로 | Enterprise 경로 |
|---|---|---|
| 헤더 병합(head 밴드 셀 병합) | **Column Groups** — `ColGroupDef { headerName, children }` (전용 모듈 없음) | 동일 |
| `suppress`(같은 값 세로 병합) | **Row Spanning** — `enableCellSpan: true`(초기 속성, 생성 후 변경 불가) + `colDef.spanRows: true` 또는 콜백, `CellSpanModule` | 동일 |
| `edittype` 셀 편집 | **Cell Editing** — `editable: true`/콜백, `TextEditorModule`·`NumberEditorModule` 등. 변경 이벤트 `cellValueChanged` | 동일 + Rich Select 등 |
| 편집 후 "저장" 시 일괄 반영 | `readOnlyEdit` + `onCellEditRequest`로 로컬 사본 불변 갱신 → 저장 시 `diffRows` (§5-2) | **Batch Editing** — `BatchEditModule`, `api.startBatchEdit()` / `commitBatchEdit()` / `cancelBatchEdit()`. API로만 사용, **Client-Side Row Model 전용**, v34+ |
| summary 밴드 합계 | **`pinnedBottomRowData`** 에 `useMemo`로 계산한 합계 행 1개. 고정 행은 **정렬·필터·그룹·선택 불가** | **`grandTotalRow`**: `'top' \| 'bottom' \| 'pinnedTop' \| 'pinnedBottom'` + `aggFunc` (`RowGroupingModule`) |
| 트리(`treelevel`) | 내장 없음 — 대안: 서버에서 평탄화 + 들여쓰기 셀 렌더러 + 자체 펼침 상태(직접 구현 비용 큼) | **Tree Data** — `treeData: true` + `getDataPath` 또는 `treeDataParentIdField`/`treeDataChildrenField`, `TreeDataModule` |
| 엑셀 내보내기 | CSV(`CsvExportModule`)만 내장 → xlsx가 필요하면 서버 POI 또는 SheetJS(§6) | **`api.exportDataAsExcel()`**, `ExcelExportModule` |
| 엑셀 가져오기 | **내장 아님** — 공식 예제는 SheetJS(xlsx)로 파싱 후 `rowData`로 주입 | 동일(Enterprise도 내장 아님) |
| 엑셀 복사·붙여넣기 | 내장 없음 | Clipboard·Cell Selection (Enterprise) |

> 주의: `grandTotalRow`를 **그룹 없는 평면 데이터 + Client-Side Row Model**에서 쓰는 경우의 동작은 공식 문서에 명시되지 않았다(평면 그리드 지원은 Server-Side Row Model에 대해서만 명시). 도입 전 실제 버전으로 확인한다.

### 5-2. Community 일괄 저장 패턴 — 캐시를 직접 편집하지 않는다

```tsx
'use client';
const { data } = useItemList(cond);
const original = useMemo(() => data ?? [], [data]); // `data ?? []`를 그대로 deps에 넣으면 매 렌더 새 배열 → 무한 루프
const [rows, setRows] = useState<ItemRow[]>([]);
useEffect(() => { setRows(structuredClone(original)); }, [original]); // 캐시와 분리된 편집본(재조회 시 초기화)

const onCellEditRequest = useCallback((e: CellEditRequestEvent<ItemRow>) => {
  const field = e.colDef.field as keyof ItemRow;
  setRows((prev) =>
    prev.map((r) => (r.rowKey === e.data.rowKey ? { ...r, [field]: e.newValue } : r)),
  );
}, []);

<AgGridReact<ItemRow>
  rowData={rows}
  getRowId={(p) => p.data.rowKey ?? p.data.tempKey} // 신규 행은 임시 키(crypto.randomUUID()로 1회 생성해 행에 저장)
  readOnlyEdit  // 편집이 그리드 데이터를 직접 바꾸지 않고 cellEditRequest만 발생
  onCellEditRequest={onCellEditRequest}
  columnDefs={columnDefs}
/>
```

- `readOnlyEdit`(Community): "셀 편집이 그리드 내부 데이터를 갱신하지 않고 `cellEditRequest` 이벤트를 발생시킨다." → 원본(쿼리 캐시)은 그대로, 편집본만 바뀌므로 `diffRows(original, rows, …)`가 정확해진다.
- 합계 행: `const pinnedBottomRowData = useMemo(() => [sumRow(rows)], [rows]);`
- `getRowId`·불변 갱신 규칙은 `ag-grid` 스킬 §4를 따른다(인덱스·매 렌더 랜덤 ID 금지).

---

## 6. 엑셀(nexacro-xeni) → 서버 POI 또는 클라이언트 SheetJS

nexacro-xeni는 서버 WAS에 배포하는 엑셀 처리 모듈이며 투비소프트 기술 노트상 "Excel Export/Import use POI(Jakarta POI) module." 즉 원래도 서버 POI 처리였다.

| 상황 | 선택 |
|---|---|
| 대용량(수만 행 이상)·서버 데이터 그대로 다운로드·양식(서식) 고정 | **서버 Apache POI SXSSF** — 백엔드가 파일 스트림 응답 |
| 화면에 보이는 그리드 그대로·소량·서버 수정 불가 | **클라이언트 SheetJS** (또는 Enterprise `exportDataAsExcel`) |
| 업로드(가져오기) | 소량 미리보기는 SheetJS 파싱 → 그리드 표시 → **저장은 서버 재검증 API**. 대량은 서버 파싱 |

### 6-1. 서버 — POI SXSSF

```java
try (SXSSFWorkbook wb = new SXSSFWorkbook(100)) { // 메모리에 유지할 행 창(기본 100)
    Sheet sheet = wb.createSheet("data");
    // ... 행 쓰기
    wb.write(out);
} // POI 5.3.0+ : close()가 임시 파일까지 삭제
```

- SXSSF는 **슬라이딩 윈도우**(기본 100행) 밖 행을 임시 파일로 내린다.
- **병합 영역·하이퍼링크·코멘트는 여전히 메모리에만 저장**된다(공식 how-to). 넥사크로 suppress/헤더 병합을 엑셀에 그대로 재현하려고 행마다 병합을 걸면 대용량에서 메모리가 터진다 → 병합은 헤더 등 최소로.

> 주의(DISPUTED 수정): "SXSSF는 `dispose()` 필수"는 **POI 5.3.0 미만에만 해당**한다. POI 변경 이력(5.3.0, 2024-07-02): "SXSSFWorkbook now removes temp files when closed - removing need for a separate dispose call". 5.3.0 이상은 try-with-resources(`close()`)로 충분하고, **5.3.0 미만(레거시 서버)에서는 `finally`에서 `dispose()`를 반드시 호출**한다. 현재 최신 안정판은 5.5.1.

### 6-2. 클라이언트 — SheetJS

```bash
# 공식: npm 레지스트리의 xlsx는 0.18.5에서 멈춘 구버전. CDN tarball이 정본
npm i --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
```

- 가져오기: `XLSX.read()` → `XLSX.utils.sheet_to_json()` (AG Grid 공식 excel-import 예제와 동일 흐름).
- 업로드된 파일은 **신뢰하지 않는다**: 행 수·셀 길이 상한, 컬럼 화이트리스트, 서버 저장 전 재검증(Java 서버면 Bean Validation, Node 서버면 Zod — `zod-schema-validation`(설치된 경우)).

---

## 7. 공통 함수(`gfn_*`) → 공통 훅·컴포넌트

원칙:
1. **함수 단위 1:1 이식 금지.** `gfn_` 목록을 그대로 `utils.ts`로 옮기지 말고, 역할별로 묶어 훅·컴포넌트로 만든다.
2. **한 곳에서만 구현**하고 화면은 호출만 한다. 화면별 복붙 변형이 보이면 공통 훅 옵션으로 흡수.
3. **UI 숨김 ≠ 권한.** 권한 함수는 버튼 표시 여부(UX)에만 쓰고, 실제 차단은 서버 API·DAL에서 한다(§4-2와 동일 원칙).

| 기존 공통 함수 역할 | 대응 |
|---|---|
| 메시지·확인창 (`alert`/`confirm` 래퍼, 메시지 코드 → 문구) | `useAppMessage()` — `showInfo`, `showError`, `confirm(): Promise<boolean>` + 메시지 사전 |
| 권한 체크 (버튼 활성/비활성) | `usePermission(menuId)` → `{ canSave, canDelete }` (서버 응답 기반, UX 용도) |
| 공통 코드 조회 (콤보 Dataset 채우기) | `useCommonCode(groupCode)` = `useQuery` + 긴 `staleTime` + `<CodeSelect groupCode=… />` |
| transaction 공통 래퍼 (세션 만료·에러 코드 처리) | API 클라이언트 인터셉터 + QueryClient 기본 `onError` |
| 날짜·숫자 포맷 | 순수 함수 모듈(테스트 필수) |
| 필수값 검증 | Zod 스키마 + RHF resolver (`form-handling`) |

---

## 8. 화면 1개 재작성 체크리스트

**분석**
- [ ] 화면의 Dataset 목록을 "조회 결과 / 편집 버퍼 / 콤보용 코드 / 검색 조건"으로 분류했다
- [ ] 모든 `transaction` 호출의 서비스 ID·입출력 Dataset·접미사(`:U`/`:A`/기타)·콜백 분기를 표로 정리했다
- [ ] 팝업마다 "값 반환형 / URL 공유형"을 판정하고, 반환값 형태를 팝업 코드에서 직접 확인했다
- [ ] Grid 기능을 §5-1 표로 대조해 **Enterprise 필요 항목**을 목록화하고 라이선스 결정을 받았다
- [ ] 사용 중인 `gfn_*` 함수를 §7 역할 표로 분류했다(이미 있는 공통 훅 재사용 우선)

**구현**
- [ ] 조회 = `useQuery`(조건이 queryKey에 포함), 저장 = `useMutation` + `await invalidateQueries`
- [ ] 저장 페이로드 = `diffRows` 변경분 DTO, "변경 없음"이면 호출 안 함
- [ ] 반복 행 key = `field.id`(폼) / `getRowId` 안정 키(그리드). 서버 PK는 `id` 이외 이름
- [ ] 쿼리 캐시 객체를 직접 편집하지 않음(그리드는 `readOnlyEdit` 또는 사본)
- [ ] 권한은 서버/DAL에서 검사, 조건부 슬롯·숨김 버튼에 의존하지 않음
- [ ] AG Grid 모듈 등록·제네릭 타입 적용(`ag-grid` 스킬)

**검증**
- [ ] 기존 화면과 같은 입력으로 조회 결과·합계가 일치
- [ ] 신규→삭제, 수정→원복, 빈 목록 저장, 중복 클릭 저장에서 페이로드가 올바름
- [ ] 적대적 테스트: 타인 키로 update/delete(IDOR), 원본에 없는 키 주입, 초대량 배열·초장문, 조작된 엑셀 업로드
- [ ] 엑셀 내보내기 결과 컬럼·서식이 기존과 일치(대용량은 서버 메모리 확인)

---

## 9. 흔한 실수

| 실수 | 왜 문제인가 | 바로잡기 |
|---|---|---|
| Dataset 하나를 전역 스토어 하나로 옮김 | 서버 상태 캐시·무효화를 직접 재구현하게 됨 | 조회 = Query, 편집 = 폼/그리드 로컬 (`state-management`) |
| 행에 `_rowType` 플래그를 들고 다님 | 추가→삭제, 수정→원복에서 상태가 틀어짐 | 저장 시 diff 계산(§2-4) |
| `key={index}` 또는 PK를 `id` 필드로 둔 채 `useFieldArray` | 재정렬·삭제 시 입력값 꼬임 / PK 덮어쓰기 | `key={field.id}`, PK는 `rowKey` |
| 그리드에 쿼리 캐시 배열을 그대로 전달 후 편집 | 캐시 원본이 바뀌어 diff가 항상 "변경 없음" | `readOnlyEdit` + 로컬 사본 |
| `svcID` 문자열 switch 공용 콜백 이식 | 타입 안정성·추적성 상실 | 훅 단위 분리 |
| Enterprise 기능을 Community 전제로 설계 | 라이선스 위반 또는 막판 재설계 | §5-1 표로 착수 전 판정 |
| 역할별 조건부 슬롯으로 관리자 화면 "숨김" | 숨긴 슬롯도 서버 실행·응답 포함 | page/DAL에서 인가 |
| 엑셀에 suppress 병합을 행마다 재현 | SXSSF에서도 병합 영역은 메모리 상주 | 병합 최소화 |
| `npm i xlsx` | 0.18.5 구버전 | CDN tarball |

---

## 10. 언제 쓰나 / 쓰지 않나

- **쓴다:** 넥사크로 17(또는 14/N 문법이 비슷한) 업무 화면을 Next.js App Router + React 19로 화면 단위 재작성할 때, 대응 판단을 화면마다 다시 하지 않기 위해.
- **쓰지 않는다:** 넥사크로 버전 업그레이드(14→17/N — 투비소프트 마이그레이션 마법사 영역), 라이브러리 자체 사용법(각 정본 스킬), 백엔드 X-API 서비스 재작성(별도 백엔드 스킬).
