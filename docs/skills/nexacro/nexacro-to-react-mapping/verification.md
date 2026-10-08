---
skill: nexacro-to-react-mapping
category: nexacro
version: v1
date: 2026-10-08
status: PENDING_TEST
---

# nexacro-to-react-mapping 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `nexacro-to-react-mapping` |
| 스킬 경로 | `.claude/skills/nexacro-to-react-mapping/SKILL.md` |
| 검증일 | 2026-10-08 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.tobesoft.com, ag-grid.com, nextjs.org, tanstack.com, react-hook-form.com, poi.apache.org, docs.sheetjs.com)
- [✅] 공식 GitHub 2순위 소스 확인 (AG Grid 공식 블로그 v34 릴리스, v33.3.2 아카이브 문서로 버전 경계 확인)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-10-08 — AG Grid 문서 36.2.0, POI 5.5.1, SheetJS 0.20.3)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (대응표 7개 영역)
- [✅] 코드 예시 작성 (diffRows, useSaveItems, 모달, Parallel Routes 구조, readOnlyEdit 패턴, SXSSF)
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿·기존 스킬 확인 | Read / Glob / Grep | VERIFICATION_TEMPLATE.md, 중복 스킬 검색, ag-grid·nextjs·tanstack-query·form-handling·zod-schema-validation·state-management SKILL.md | 중복 없음. 라이브러리 사용법은 기존 스킬에 위임하고 대응 규칙에 집중하도록 범위 결정 |
| 조사 | WebFetch | 투비소프트 마이그레이션 마법사·Grid 기본·Grid 셀·Grid 응용(N)·Dataset XML·transaction 튜토리얼·xeni 기술노트/서버 가이드 | 마법사 14→17 한정·"완벽한 마이그레이션 보장 불가" 원문, 행 타입 insert/update/delete, xeni = POI 기반 확인 |
| 조사 | WebFetch | AG Grid react-data-grid: column-groups, row-spanning, cell-editing, cell-editing-batch, aggregation-total-rows, row-pinning, tree-data, excel-export, excel-import, modules, value-setters(readOnlyEdit), community-vs-enterprise | 문서 버전 36.2.0, 기능별 Community/Enterprise 판정 |
| 조사 | WebFetch | nextjs.org parallel-routes, tanstack invalidations-from-mutations, RHF useFieldArray·formState, POI how-to·changes·download·SXSSF javadoc, SheetJS 설치 문서, netsgo0319/nexacro-test | 조건부 슬롯 서버 실행 경고, onSuccess Promise 반환, keyName 덮어쓰기·제거 예정, POI 5.3.0 close() 임시파일 삭제 |
| 교차 검증 | WebSearch | AG Grid batch editing 도입 버전, row spanning, POI dispose/close, Next.js 16.4, 넥사크로 :U/:A/:N, getRowType, showModal 반환값, 넥사크로→React 전환 사례, xeni | 31개 클레임: VERIFIED 24 / DISPUTED 1 / UNVERIFIED 6 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 투비소프트 넥사크로 17 개발도구 가이드 — 마이그레이션 | https://docs.tobesoft.com/development_tools_guide_nexacro_17_ko/25c78f15984ab038 | ⭐⭐⭐ High | 2026-10-08 확인 | 공식 |
| 투비소프트 넥사크로 17 개발자 가이드 — Grid 기본 | https://docs.tobesoft.com/developer_guide_nexacro_17_ko/ccdb97b19fa824d8 | ⭐⭐⭐ High | 2026-10-08 | 공식 (getRowType·applyChange·reset·band) |
| 투비소프트 넥사크로 17 개발자 가이드 — Grid 셀 | https://docs.tobesoft.com/developer_guide_nexacro_17_ko/c196a2765af480f4 | ⭐⭐⭐ High | 2026-10-08 | 공식 (displaytype·edittype·suppress) |
| 투비소프트 넥사크로 N 개발자 가이드 — Grid 응용 | https://docs.tobesoft.com/developer_guide_nexacro_n_ko/1ca1cbe08e856976 | ⭐⭐⭐ High | 2026-10-08 | 공식 (합계·트리·복사붙여넣기 기능 범위) |
| 투비소프트 넥사크로 17 고급 개발 가이드 — Dataset XML Format | https://docs.tobesoft.com/advanced_development_guide_nexacro_17_en_kr/bf38022de252cfc6 | ⭐⭐⭐ High | 2026-10-08 | 공식 (행 type insert/update/delete) |
| 투비소프트 Getting Started — Data Transactions | https://docs.tobesoft.com/getting_started_nexacro_n_en/f58e7c64b69e2051 | ⭐⭐⭐ High | 2026-10-08 | 공식 (transaction 파라미터) |
| 투비소프트 기술노트 — Excel Import/Export | https://docs.tobesoft.com/nexacro_technical_note_en/067d3e071928b598 | ⭐⭐⭐ High | 2026-10-08 | "Excel Export/Import use POI(Jakarta POI) module." |
| 투비소프트 넥사크로 17 서버 설정 가이드 — Export | https://docs.tobesoft.com/server_setup_guide_nexacro_17_en_kr/80a75366180e47b2 | ⭐⭐⭐ High | 2026-10-08 | xeni 서버 모듈·ExcelExportObject |
| AG Grid React 문서 (기능별 페이지) | https://www.ag-grid.com/react-data-grid/ | ⭐⭐⭐ High | 2026-10-08 (문서 36.2.0) | 공식 |
| AG Grid v33.3.2 아카이브 | https://www.ag-grid.com/archive/33.3.2/react-data-grid/row-spanning/ | ⭐⭐⭐ High | 2026-10-08 | Row spanning v33 존재, batch editing 페이지 404 |
| AG Grid 블로그 — What's New in 34 | https://www.ag-grid.com/blog/whats-new-in-ag-grid-34/ | ⭐⭐⭐ High | 2026-10-08 | Batch Cell Editing 도입 |
| Next.js Parallel Routes | https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes | ⭐⭐⭐ High | 2026-10-08 (페이지 메타 16.4.0, lastUpdated 2026-08-21) | 공식 |
| TanStack Query — Invalidations from Mutations | https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations | ⭐⭐⭐ High | 2026-10-08 | 공식 |
| React Hook Form useFieldArray / formState | https://react-hook-form.com/docs/usefieldarray · https://react-hook-form.com/docs/useform/formstate | ⭐⭐⭐ High | 2026-10-08 | 공식 |
| Apache POI how-to / changes / download / SXSSF javadoc | https://poi.apache.org/components/spreadsheet/how-to.html · https://poi.apache.org/changes.html · https://poi.apache.org/download.html | ⭐⭐⭐ High | 2026-10-08 | 공식 (5.3.0 변경, 최신 5.5.1) |
| SheetJS 설치 문서 | https://docs.sheetjs.com/docs/getting-started/installation/frameworks | ⭐⭐⭐ High | 2026-10-08 | 공식 |
| velog 넥사크로 교육 정리 | https://velog.io/@itkang0219/교육-06 | ⭐ Low | 2024-07-03 | `:U`/`:A` 의미 — 공식 원문 미확보로 보조 근거만 |
| netsgo0319/nexacro-test | https://github.com/netsgo0319/nexacro-test | ⭐ Low | 2026-10-08 확인 | Stars 0 개인 PoC — 참고만 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 1건 수정 반영)
- [✅] 버전 정보가 명시되어 있음 (AG Grid 36.2.0 문서 기준, Batch Editing v34+, POI 5.3.0 경계, SheetJS 0.20.3)
- [✅] deprecated된 패턴을 권장하지 않음 (useFieldArray keyName 제거 예정 명시, npm xlsx 0.18.5 비권장)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (§10)
- [✅] 흔한 실수 패턴 포함 (§9)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X — 특정 회사 코드 없음)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-10-08, 3문항)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (FAIL 없음, 보완 불필요)

### 4-5. 클레임 교차 검증 결과

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | 투비소프트 마이그레이션 마법사는 넥사크로플랫폼 14→17 변환 도구이며 "완벽한 마이그레이션을 보장하지 못합니다" | VERIFIED | 투비소프트 공식 원문 + 타 프레임워크 변환 언급 없음 |
| 2 | 넥사크로→React 공개 전환 사례·자동 변환률 근거 없음 | UNVERIFIED | 검색으로 부재만 확인(부재 증명 불가) → `> 주의:` 표기 |
| 3 | Dataset 행 상태는 insert/update/delete로 구분되고 getRowType()으로 확인 | VERIFIED | Dataset XML Format(행 type) + Grid 기본(getRowType) |
| 4 | applyChange()/reset()이 편집 확정/되돌리기 | VERIFIED | Grid 기본 문서 |
| 5 | transaction 인자: 서비스ID·URL·입력·출력 Dataset·인자·콜백(+비동기 등 3개) | VERIFIED | Getting Started(N) + 넥사크로 17 Form 예제(검색 결과) |
| 6 | 입력 Dataset `:U` = 변경 행만, `:A` = 전체 행 | UNVERIFIED | 커뮤니티 자료(velog)만, 공식 원문 미확보 → `> 주의:` 표기 |
| 7 | `:N`의 의미 | UNVERIFIED | 확인 불가 → 대응 규칙에서 제외 |
| 8 | showModal 반환값 규약 | UNVERIFIED | 공식 문서 확인 실패 → `> 주의:` 표기 |
| 9 | nexacro-xeni는 서버 모듈이며 POI 기반 | VERIFIED | 기술노트 원문 + 서버 설정 가이드(XExportImport 서버 엔드포인트) |
| 10 | useMutation onSuccess에서 Promise 반환 시 invalidate 완료까지 isPending 유지 | VERIFIED | TanStack 공식 + `tanstack-query` 스킬 |
| 11 | useFieldArray는 key용 id 자동 생성 → `field.id`를 key로 | VERIFIED | RHF 공식 Rules |
| 12 | 데이터의 기존 `id`는 자동 id로 덮어써짐, keyName은 다음 메이저에서 제거 예정 | VERIFIED | RHF 공식 Props 표 원문 |
| 13 | 액션을 연달아 쌓지 말 것, append 등에는 완전한 객체 | VERIFIED | RHF 공식 Rules |
| 14 | dirtyFields는 필드 단위, defaultValues 전체 제공 필요 | VERIFIED | RHF formState 공식 |
| 15 | Parallel+Intercepting 모달: URL 공유·새로고침 유지·뒤로가기로 닫힘·앞으로가기로 재오픈 | VERIFIED | Next.js 공식 parallel-routes |
| 16 | 조건부 슬롯은 모두 서버에서 실행·응답 포함 → page/DAL에서 인가 | VERIFIED | Next.js 공식 원문("The conditional decides what the user sees, not what runs") |
| 17 | default.js 없으면 하드 내비게이션 시 404, 닫기는 router.back()/null 반환 catch-all | VERIFIED | Next.js 공식 |
| 18 | Column Groups는 Community, 전용 모듈 없음 | VERIFIED | AG Grid column-groups + modules 목록에 ColumnGroupModule 없음 |
| 19 | Row Spanning: enableCellSpan(초기 속성)+spanRows, CellSpanModule(Community), v33에도 존재 | VERIFIED | 36.2.0 문서 + modules 표 + v33.3.2 아카이브 |
| 20 | 셀 편집 Community(editable, TextEditorModule 등, cellValueChanged), readOnlyEdit → cellEditRequest | VERIFIED | cell-editing + value-setters(readOnlyEdit) 문서 |
| 21 | Batch Editing은 Enterprise(BatchEditModule), start/commit/cancelBatchEdit, API 전용·CSRM 전용, v34 도입 | VERIFIED | cell-editing-batch 문서 + v34 블로그 + v33.3.2 아카이브 404 |
| 22 | grandTotalRow는 Enterprise, 값 'top'/'bottom'/'pinnedTop'/'pinnedBottom' | VERIFIED | aggregation-total-rows 문서(enterprise 표기·예제 RowGroupingModule) |
| 23 | grandTotalRow를 평면 데이터+CSRM에서 사용 가능 여부 | UNVERIFIED | 문서는 SSRM 평면 그리드만 명시 → `> 주의:` 표기 |
| 24 | pinnedBottomRowData는 Community, 고정 행은 정렬·필터·그룹·선택 불가 | VERIFIED | row-pinning 문서 + modules(PinnedRowModule Community) |
| 25 | Tree Data는 Enterprise(TreeDataModule), treeData+getDataPath / parentId / children 필드 | VERIFIED | tree-data 문서 + `ag-grid` 스킬 라이선스 표 |
| 26 | Excel Export는 Enterprise, exportDataAsExcel, ExcelExportModule / CSV는 Community | VERIFIED | excel-export 문서 + modules 표 + community-vs-enterprise |
| 27 | Excel Import는 내장 아님, 공식 예제는 SheetJS(xlsx) | VERIFIED | excel-import 문서 원문 |
| 28 | SheetJS 정본은 CDN, npm 레지스트리 xlsx는 0.18.5에서 멈춤 | VERIFIED | SheetJS 공식 설치 문서 |
| 29 | SXSSF 슬라이딩 윈도우 기본 100행, 병합 영역·하이퍼링크·코멘트는 메모리 상주 | VERIFIED | POI how-to 원문 + SXSSF javadoc |
| 30 | "SXSSF dispose() 필수" | **DISPUTED** | POI changes 5.3.0(2024-07-02): close()가 임시 파일 삭제 → 5.3.0 미만에만 dispose 필수로 수정, `> 주의:` 표기 |
| 31 | Next.js 버전 표기 | UNVERIFIED | parallel-routes 페이지 메타는 16.4.0이나 안정판 여부 미확인(`nextjs` 스킬은 16.3.6 기준) → 스킬은 "16.x"로만 표기 |

판정 합계: **VERIFIED 24 / DISPUTED 1 / UNVERIFIED 6** (총 31)

---

## 5. 테스트 진행 기록

**수행일**: 2026-10-08
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 대신 general-purpose 사용)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. `:U` 저장하던 그리드 편집 화면을 Community AG Grid로 이식 (행 상태 추적·저장·서버 책임)**
- ✅ PASS
- 근거: SKILL.md §2-4, §3-2, §5-1, §5-2, §9
- 상세: `_rowType` 플래그 대신 `diffRows`, `readOnlyEdit` + 로컬 사본, `useMutation` + `await invalidateQueries`, "변경 없음" 시 호출 생략, 서버 재검증(IDOR·조작 키)을 모두 정확히 제시. Batch Editing(Enterprise)을 Community 경로에서 배제. `:U`/`:A`는 커뮤니티 자료 기준, `:N` 미검증이라는 주의를 정확히 구분.

**Q2. 함정 — 역할별 조건부 슬롯으로 "숨김" / useFieldArray에 PK `id` + `key={index}` / 값 반환형 showModal**
- ✅ PASS
- 근거: SKILL.md §4, §4-1, §4-2, §2-2, §7, §9
- 상세: 조건부 슬롯도 서버 실행·응답 포함이므로 page/DAL에서 인가, PK는 `rowKey`로 두고 `key={field.id}`, 값 반환형은 클라이언트 모달 `onSelect` 콜백으로 정확히 답변. `showModal` 반환값 규약 미검증 주의도 인용. anti-pattern(UI 숨김=권한, index key) 모두 회피.

**Q3. Grid 6개 기능(헤더 병합·suppress·합계·트리·엑셀 내보내기/가져오기) Community/Enterprise 경로 + POI 버전 + 자동 변환률**
- ✅ PASS
- 근거: SKILL.md §0, §5-1, §5-2, §6, §6-1, §6-2, §9
- 상세: 기능별 두 경로(Column Groups·Row Spanning 공통 / pinnedBottomRowData vs grandTotalRow / Tree Data Enterprise 전용 / 수십만 행은 서버 SXSSF), POI 5.3.0 경계(미만은 dispose 필수), 자동 변환률 사용 금지, `grandTotalRow` 평면 CSRM 미검증을 정확히 지적.

### 발견된 gap (있으면)

- 모두 차단 요인 아닌 선택 보강: (1) §5-2 코드의 `tempKey`가 `ItemRow` 타입에 정의되지 않음, (2) 서버 SXSSF vs 클라이언트 `exportDataAsExcel` 전환 임계값이 "수만 행 이상" 수준으로만 제시됨, (3) 권한 검사(page/DAL)의 구체 코드 예시 없음, (4) 신규 행 추가·삭제 UI 코드 예시 없음

### 판정

- agent content test: PASS (3/3 PASS)
- verification-policy 분류: 마이그레이션 가이드 (실사용 필수 스킬 — 실제 화면 재작성에서 작동 확인 필요)
- 최종 상태: PENDING_TEST (유지)

### (참고) 작성 시 예정 템플릿

### 테스트 케이스 1: (예정) 저장 버튼 이식

**입력 (질문/요청):**
```
넥사크로 화면에서 ds_list를 :U로 저장하던 그리드 편집 화면을 Next.js로 옮기려 한다. 행 상태 추적과 저장 호출을 어떻게 구성해야 하나?
```

**기대 결과:**
```
useQuery 조회 + readOnlyEdit 로컬 사본 + diffRows 변경분 DTO + useMutation/await invalidateQueries, 서버 재검증, :U 의미는 공식 미확인 주의
```

**판정:** (미실시)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (DISPUTED 1건 수정, UNVERIFIED 6건 주의 표기·제외) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-10-08, 3/3 PASS) |
| **최종 판정** | **PENDING_TEST** (content test 통과, 마이그레이션 가이드 카테고리라 실제 화면 재작성 사용 후 APPROVED) |

---

## 7. 개선 필요 사항

- [❌] 넥사크로 17 공식 레퍼런스(Form.transaction)에서 입력 Dataset 접미사 `:U`/`:A`/`:N` 원문 확보 후 주의 표기 해소
- [❌] `showModal` 반환값 규약 공식 원문 확보
- [❌] AG Grid `grandTotalRow`의 평면 데이터 + Client-Side Row Model 동작을 실제 버전으로 확인
- [❌] 대상 프로젝트의 AG Grid 버전(v33 vs v34+)·Enterprise 라이선스 결정 후 §5 경로 확정
- [✅] skill-tester로 2단계 content test 수행 (2026-10-08 완료, 3/3 PASS)
- [❌] 실제 넥사크로 화면 1개 이상을 이 대응표로 재작성해 동작 확인 (차단 요인: 마이그레이션 가이드 카테고리의 APPROVED 전환 조건)
- [❌] §5-2 코드의 `tempKey` 타입 정의, 엑셀 경로 전환 임계값 보강 (선택 보강, 차단 요인 아님)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-10-08 | v1 | 최초 작성 (대응표 7개 영역, 클레임 31개 교차 검증) | skill-creator |
| 2026-10-08 | v1 | 2단계 실사용 테스트 수행 (Q1 :U 그리드 저장 이식 / Q2 조건부 슬롯·useFieldArray·값 반환 모달 함정 / Q3 Grid 6기능 Community·Enterprise 경로·POI·자동 변환률) → 3/3 PASS, PENDING_TEST 유지(마이그레이션 가이드 카테고리) | skill-tester |
| 2026-10-08 | v1.1 | 설치 검수 반영 — nexacro 템플릿에 설치되지 않는 `zod-schema-validation` 참조 3곳(§1 표·§4 입력 Dataset·§7 업로드)을 `form-handling` 병기 + "(설치된 경우)" 조건으로 정정, 업로드 재검증은 Java 서버 Bean Validation / Node 서버 Zod로 구분. 내용 클레임 변경 없음 | Claude |
