---
skill: ag-grid
category: frontend
version: v1
date: 2026-08-26
status: APPROVED
---

# ag-grid 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `ag-grid` |
| 스킬 경로 | `.claude/skills/frontend/ag-grid/SKILL.md` |
| 검증일 | 2026-08-26 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 기준 버전 | `ag-grid-community` / `ag-grid-react` **33.x** (React 18/19, Next.js App Router) |
| 최신 메이저 대조 | 36.1.0 (npm `ag-grid-react` latest, 2026-08-26 확인) |

---

## 1. 작업 목록 (Task List)

- [✅] 템플릿 확인 (`docs/skills/VERIFICATION_TEMPLATE.md` 8개 섹션 구조 확보)
- [✅] 중복 스킬 확인 (`.claude/skills/**/ag-grid/SKILL.md` → 결과 없음, 신규 생성 확정)
- [✅] 레포 작성 관례 확인 (기존 frontend 라이브러리 스킬 1종 Read — frontmatter·`> 소스:`/`> 검증일:` 줄·섹션 구성·코드 예시 밀도)
- [✅] 공식 문서 1순위 소스 확인 (ag-grid.com — v33 아카이브 문서 + 최신 업그레이드 가이드)
- [✅] 공식 GitHub / npm registry 2순위 소스 확인 (ag-grid/ag-grid, registry.npmjs.org)
- [✅] 최신 버전 기준 확인 (날짜: 2026-08-26 / npm latest = 36.1.0)
- [✅] v33 도입 변경(Theming API 기본화, 모듈 등록 의무화, 패키지 통합) 릴리스 노트로 확인
- [✅] v33 → v34 → v35 → v36 breaking change 각 메이저 업그레이드 문서로 개별 확인
- [✅] Community(MIT) vs Enterprise(상용) 경계 공식 문서 + 패키지 export 목록으로 이중 확인
- [✅] Theming API(`theme` 옵션, `themeQuartz`, `withParams`/`withPart`) 및 레거시 CSS 테마 공존 방식 확인
- [✅] React 통합(커스텀 셀 렌더러, `useMemo`/`useCallback` 권장, `getRowId`, 불변성) 공식 권장 문구 확보
- [✅] Next.js App Router 관련 공식 가이드 확인 (`'use client'` 경계)
- [✅] Row Model 4종 + 라이선스 구분, `rowBuffer` 기본값·픽셀 계산 확인
- [✅] 기존 가상 스크롤 스킬(react-virtuoso)과의 선택 기준 섹션 작성 + 상호 참조
- [✅] 흔한 실수 패턴 20종 정리
- [✅] SKILL.md 파일 작성
- [✅] verification.md 작성
- [✅] skill-tester 2단계 테스트 (2026-08-26 수행 완료 — 3/3 PASS, 섹션 5 참조)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 확보 |
| 중복 확인 | Glob | `.claude/skills/**/ag-grid/SKILL.md` | 결과 없음 → 신규 생성 |
| 관례 확인 | Read | 기존 frontend 라이브러리 스킬 SKILL.md 1종 + verification.md 1종 | frontmatter·소스/검증일 표기·섹션 구성 관례 반영 |
| 조사 | WebSearch | "AG Grid latest version 2026 release notes", "v33 Theming API modules breaking changes", "ValidationModule AllCommunityModule", "Infinite Row Model community", "rowSelection multiRow deprecated", "error #200 module not registered", "CustomCellRendererProps import", "GetRowIdParams", "Next.js App Router use client dynamic import", "React 19 StrictMode", "Theming API vs legacy CSS 충돌", "Enterprise 라이선스 워터마크" | 12회 검색 — 최신 메이저 36.1.0 확인, v33 변경 축 확정, 라이선스 경계 단서 확보 |
| 조사 | WebFetch | v33 아카이브 문서 12종(modules / themes / theming / theming-migration / theming-parameters / getting-started / react-hooks / row-ids / row-models / column-state / grid-state / column-menu / dom-virtualisation / community-vs-enterprise / typescript-generics / component-cell-renderer / data-update-row-data / data-update-single-row-cell) + 업그레이드 가이드 4종(33·34·35·36) + 최신 modules 문서 + 공식 블로그 2종 + npm registry + jsdocs 패키지 export 목록 | 총 24회 페치 — API 시그니처·기본값·모듈명·라이선스 경계 원문 확보 |
| 교차 검증 | WebSearch + WebFetch | 14개 클레임, 각 독립 소스 2개 이상 대조 | VERIFIED 13 / DISPUTED 1 / UNVERIFIED 0 (+ 미검증 표기 2건) |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 공식 업그레이드 가이드 (v33, React) | https://www.ag-grid.com/react-data-grid/upgrading-to-ag-grid-33/ | ⭐⭐⭐ High | 2026-08-26 | 패키지 통합·모듈 분할·Theming 기본화·제거 API |
| 공식 업그레이드 가이드 (v34) | https://www.ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-34/ | ⭐⭐⭐ High | 2026-08-26 | "no breaking changes" 원문 + deprecation 3건 |
| 공식 업그레이드 가이드 (v35) | https://www.ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-35/ | ⭐⭐⭐ High | 2026-08-26 | 타입 제거 2건 + 동작 변경 3건 |
| 공식 업그레이드 가이드 (v36) | https://www.ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-36/ | ⭐⭐⭐ High | 2026-08-26 | DOM 개편·ValidationModule 제외·CSRM 코어 편입·TS 5.8.3 |
| 공식 문서 v33 (Modules) | https://www.ag-grid.com/archive/33.3.2/react-data-grid/modules/ | ⭐⭐⭐ High | 2026-08-26 | registerModules·All*Module·per-grid modules·isModuleRegistered |
| 공식 문서 v33 (Modules, JS) | https://www.ag-grid.com/archive/33.3.2/javascript-data-grid/modules/ | ⭐⭐⭐ High | 2026-08-26 | "ValidationModule is included by default" 원문 |
| 공식 문서 최신 (Modules) | https://www.ag-grid.com/react-data-grid/modules/ | ⭐⭐⭐ High | 2026-08-26 | 미등록 시 에러 코드 축약, AgGridProvider, 트리 셰이킹 |
| 공식 문서 v33 (Themes) | https://www.ag-grid.com/archive/33.3.2/react-data-grid/themes/ | ⭐⭐⭐ High | 2026-08-26 | themeQuartz/Balham/Material/Alpine, `theme` 옵션 |
| 공식 문서 v33 (Theming Parameters) | https://www.ag-grid.com/archive/33.3.2/react-data-grid/theming-parameters/ | ⭐⭐⭐ High | 2026-08-26 | withParams 코드·`--ag-*` CSS 변수 매핑 |
| 공식 문서 v33 (Theming Migration) | https://www.ag-grid.com/archive/33.3.2/react-data-grid/theming-migration/ | ⭐⭐⭐ High | 2026-08-26 | `theme: "legacy"`·CSS import 경로·provideGlobalGridOptions |
| 공식 문서 v33 (React Hooks) | https://www.ag-grid.com/archive/33.3.2/react-data-grid/react-hooks/ | ⭐⭐⭐ High | 2026-08-26 | useState/useMemo/useCallback 권장 원문 |
| 공식 문서 v33 (Row IDs) | https://www.ag-grid.com/archive/33.3.2/react-data-grid/row-ids/ | ⭐⭐⭐ High | 2026-08-26 | getRowId 3대 제약 |
| 공식 문서 v33 (Updating Row Data) | https://www.ag-grid.com/archive/33.3.2/react-data-grid/data-update-row-data/ | ⭐⭐⭐ High | 2026-08-26 | "rips all data out" 원문·델타 갱신·트랜잭션 비교 |
| 공식 문서 v33 (Single Row/Cell Update) | https://www.ag-grid.com/archive/33.3.2/react-data-grid/data-update-single-row-cell/ | ⭐⭐⭐ High | 2026-08-26 | setData/updateData/setDataValue 한계 원문 |
| 공식 문서 v33 (Row Models) | https://www.ag-grid.com/archive/33.3.2/react-data-grid/row-models/ | ⭐⭐⭐ High | 2026-08-26 | 4종 모델 + Community/Enterprise 구분 |
| 공식 문서 v33 (Community vs Enterprise) | https://www.ag-grid.com/archive/33.3.2/react-data-grid/community-vs-enterprise/ | ⭐⭐⭐ High | 2026-08-26 | 기능별 라이선스 경계 |
| 공식 문서 v33 (Column Menu) | https://www.ag-grid.com/archive/33.3.2/react-data-grid/column-menu/ | ⭐⭐⭐ High | 2026-08-26 | "Community does not have a menu" 원문 |
| 공식 문서 v33 (Column State) | https://www.ag-grid.com/archive/33.3.2/react-data-grid/column-state/ | ⭐⭐⭐ High | 2026-08-26 | getColumnState/applyColumnState·applyOrder·defaultState·false 반환 |
| 공식 문서 v33 (Grid State) | https://www.ag-grid.com/archive/33.3.2/react-data-grid/grid-state/ | ⭐⭐⭐ High | 2026-08-26 | initialState "read once"·getState·onStateUpdated·partialColumnState |
| 공식 문서 v33 (DOM Virtualisation) | https://www.ag-grid.com/archive/33.3.2/react-data-grid/dom-virtualisation/ | ⭐⭐⭐ High | 2026-08-26 | rowBuffer 기본 10·픽셀 범위 계산·suppress* 옵션 |
| 공식 문서 v33 (TypeScript Generics) | https://www.ag-grid.com/archive/33.3.2/react-data-grid/typescript-generics/ | ⭐⭐⭐ High | 2026-08-26 | ColDef/GridOptions/AgGridReact 제네릭 코드 |
| 공식 문서 v33 (Cell Components) | https://www.ag-grid.com/archive/33.3.2/react-data-grid/component-cell-renderer/ | ⭐⭐⭐ High | 2026-08-26 | CustomCellRendererProps·cellRenderer 3가지 등록법 |
| 공식 문서 v33 (Getting Started) | https://www.ag-grid.com/archive/33.3.2/react-data-grid/getting-started/ | ⭐⭐⭐ High | 2026-08-26 | v33 퀵스타트 코드·컨테이너 높이 요구사항 |
| 공식 호환성 표 (React) | https://www.ag-grid.com/react-data-grid/compatibility/ | ⭐⭐⭐ High | 2026-08-26 | React 19 ↔ AG Grid 32.3+ |
| 공식 블로그 (What's New in v33) | https://www.ag-grid.com/blog/whats-new-in-ag-grid-33/ | ⭐⭐⭐ High | 2026-08-26 | 번들 20~40% 감소 수치, Theming API 전면 채택 |
| 공식 블로그 (AG Grid + Next.js) | https://www.ag-grid.com/blog/using-ag-grid-with-react-and-next-js/ | ⭐⭐⭐ High | 2026-08-26 | `'use client'` 필요성·모듈 전역 등록 위치 |
| npm registry (`ag-grid-react` latest) | https://registry.npmjs.org/ag-grid-react/latest | ⭐⭐⭐ High | 2026-08-26 | 36.1.0, peer react ^16.8 \|\| ^17 \|\| ^18 \|\| ^19 |
| AG Grid 공식 GitHub | https://github.com/ag-grid/ag-grid | ⭐⭐⭐ High | 2026-08-26 | 릴리스 목록·태그 소스 확인 |
| 패키지 export 목록 (`ag-grid-enterprise`) | https://www.jsdocs.io/package/ag-grid-enterprise | ⭐⭐ Medium | 2026-08-26 | Enterprise 모듈 40종 export 목록 (라이선스 경계 교차 확인용) |
| npm (`@ag-grid-community/infinite-row-model`) | https://www.npmjs.com/package/@ag-grid-community/infinite-row-model | ⭐⭐⭐ High | 2026-08-26 | Infinite Row Model = MIT / v33부터 `ag-grid-community`로 통합 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 1건은 공식 문서 기준으로 수정 반영)
- [✅] 버전 정보가 명시되어 있음 (기준 v33.x, 최신 대조 36.1.0, React 18/19, TS 최소 버전)
- [✅] deprecated된 패턴을 권장하지 않음 (`ModuleRegistry.register` 단수형, `rowSelection="multiple"` 문자열, 레거시 CSS 테마를 기본 권장하지 않음)
- [✅] 코드 예시가 실행 가능한 형태임 (TypeScript + React 함수 컴포넌트)
- [✅] 라이선스 경계를 Community/Enterprise 표로 분리하고 Enterprise 기능에 명시 표기

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] `> 소스:` URL 다중 명시 + `> 검증일: 2026-08-26` 명시
- [✅] 핵심 개념 설명 포함 (모듈 등록 · 테마 · row model · 상태 소유권)
- [✅] 코드 예시 포함 (전 12개 섹션)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (11절 react-virtuoso 선택 기준, 10-1 row model 선택표)
- [✅] 흔한 실수 패턴 포함 (20종 표)
- [✅] 불확실 항목에 `> 주의:` 표기 (StrictMode 지침, next/dynamic 패턴, 컬럼 메뉴 오답 방지, SSRM 라이선스 오답 방지)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X — 도메인 예시는 일반적인 상품 그리드)
- [✅] 기존 `frontend/react-virtuoso` 스킬과 범위 중복 없이 선택 기준 섹션 + 상호 참조 삽입
- [✅] 기존 `frontend/tanstack-query` 스킬로 서버 상태 캐싱 규칙 위임 (중복 서술 회피)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-08-26, general-purpose 3회)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 — 3/3 PASS, 근거 섹션 정확히 인용
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — 해당 없음(FAIL 없음), 경미한 gap만 섹션 7에 기록

### 4-5. 교차 검증 판정표

| # | 클레임 | 소스 1 | 소스 2 | 판정 |
|---|--------|--------|--------|------|
| 1 | 최신 안정 메이저는 **36.1.0** (2026-08 기준), v33은 현행 최신이 아님 | npm registry `ag-grid-react` latest = 36.1.0 | 공식 v36 업그레이드 가이드 존재 + 릴리스 목록 | **VERIFIED** |
| 2 | v33에서 Theming API가 **기본**이 되었고, 레거시 CSS 테마는 `theme: "legacy"`로 옵트인 | v33 업그레이드 가이드(React) | v33 Theming Migration 문서 + 공식 블로그 "fully commits to the Theming API" | **VERIFIED** |
| 3 | v33 내장 테마 객체는 `themeQuartz`·`themeBalham`·`themeMaterial`·`themeAlpine`이며 `theme` 그리드 옵션에 전달 | v33 Themes 문서 | v33 Theming Parameters 문서(`themeQuartz.withParams`) | **VERIFIED** |
| 4 | Theming API 사용 시 `ag-grid.css` 등 CSS 파일을 import하면 안 되며, 그리드가 CSS를 직접 주입 | v33 Theming Migration 문서 | 공식 문서 서술 "the grid is now responsible for inserting the correct CSS into the document head" | **VERIFIED** |
| 5 | v33부터 패키지가 `ag-grid-community`/`ag-grid-enterprise`/`ag-grid-react`로 통합되고, `ModuleRegistry.register`(단수) deprecated → `registerModules([...])` | v33 업그레이드 가이드(React) | v33 Modules 문서 코드 예시 | **VERIFIED** |
| 6 | 모듈 미등록 시 `error #200 Unable to use X as XModule is not registered` 형태 에러 발생 | 최신 Modules 문서(에러 코드 축약 서술) + 다수 실사용 이슈 보고 | v33 업그레이드 가이드(rowSelection → RowSelectionModule 등록 필요 서술) | **VERIFIED** |
| 7 | v33의 `AllCommunityModule`/`AllEnterpriseModule`에는 `ValidationModule`이 **포함**되며, 개별 등록 방식에서는 개발 빌드에만 넣는 것이 권장 | v33 Modules(JS) 문서 원문 "the ValidationModule is included by default" | v33 Modules(React) 문서의 `process.env.NODE_ENV !== 'production'` 예시 | **VERIFIED** |
| 8 | `AllCommunityModule` 사용 시 **트리 셰이킹이 되지 않음** → 번들 최소화하려면 개별 모듈 등록 | 최신 Modules 문서(트리 셰이킹 설계 서술) | AG Grid 번들 최소화 가이드/블로그(모듈 선택기 권장) | **VERIFIED** |
| 9 | Row Model 4종 중 **Client-Side·Infinite = Community**, **Server-Side·Viewport = Enterprise** | v33 Row Models 문서 | `ag-grid-enterprise` export 목록(ServerSideRowModelModule·ViewportRowModelModule 포함) + `@ag-grid-community/infinite-row-model` MIT | **VERIFIED** |
| 10 | **컬럼 메뉴·컨텍스트 메뉴는 Enterprise**이며 Community에는 메뉴 자체가 없음(필터만 노출) | v33 Column Menu 문서 원문 "AG Grid Community does not have a menu, but can launch Column Filters if enabled" | v33 업그레이드 가이드(MenuModule → ColumnMenuModule/ContextMenuModule 분할, enterprise 패키지 export) | **VERIFIED** |
| 11 | React 옵션 전달 시 `rowData`는 `useState`, `columnDefs`/객체 옵션은 `useState`·`useMemo`, 함수 옵션은 `useCallback` 권장 | v33 React Hooks 문서 원문 인용 | v33 TypeScript Generics / Getting Started 예시 코드 패턴 | **VERIFIED** |
| 12 | `getRowId` 미설정 시 `rowData` 교체가 전체 재생성이며, 설정 시 델타 갱신 + 선택·그룹 상태 유지 | v33 Updating Row Data 문서 원문 "rips all data out of the grid" | v33 Row IDs 문서(3대 제약 + 상태 유지 효과) | **VERIFIED** |
| 13 | `rowBuffer` 기본값 10이며 버퍼는 **픽셀 범위(기본 행 높이 42px 기준 420px)**로 계산됨 | v33 DOM Virtualisation 문서(수치 원문) | 동 문서 100px 행 높이 예시(5행만 들어감) | **VERIFIED** |
| 14 | Next.js에서 그리드 컴포넌트는 `'use client'`가 필요하며 모듈 등록도 클라이언트 측에서 수행 | AG Grid 공식 Next.js 블로그 | 최신 Modules 문서 "if using server-side rendering, ensure modules are registered in the client side" | **VERIFIED** |
| 15 | v34는 breaking change가 없고 deprecation만 존재 / v35·v36에 실제 breaking change 존재 | 공식 v34 업그레이드 가이드 원문 "There are no breaking changes in AG Grid version 34.0" | 공식 v35·v36 업그레이드 가이드(타입 제거·DOM 개편·기본값 변경) | **VERIFIED** |
| 16 | 행 선택 설정은 v33 기준 **객체 API**(`rowSelection: { mode: 'multiRow' }`)이며 문자열 `'single'`/`'multiple'`은 deprecated | v32.2.1 업그레이드 가이드(문자열 → mode 전환 공지) | v33 업그레이드 가이드(RowSelectionModule 등록 필요 + 새 API) | **VERIFIED** |
| 17 | v33 모듈화로 번들이 "최대 40% 감소" | 초기 검색 요약(검색 엔진 생성 문구) | 공식 블로그 원문 "vary between **20-40%** depending on the features you're using" | **DISPUTED → 수정 반영** |

### 4-6. DISPUTED / 미검증 처리 내역

**#17 — 번들 감소 폭**
- 최초 검색 요약에는 "reduce your bundle size by up to 40%"로 단정 표현이 나왔다.
- 공식 블로그 원문은 "a significant reduction in bundle size which will vary between **20-40%** depending on the features you're using" — 사용 기능에 따른 **범위** 값이다.
- 조치: SKILL.md 0절에 "사용하는 기능에 따라 번들 크기를 **20~40%** 줄인다"로 범위와 조건을 명시해 작성.

**미검증 표기 1 — React StrictMode 전용 지침**
- AG Grid 공식 문서에 StrictMode 전용 페이지·문장이 없음(호환성 표는 React 버전만 명시).
- 조치: 삭제하지 않고 SKILL.md 5-3절에 `> 주의:` 블록으로 "공식 문서에 명문화된 문장이 아니며, 모듈 등록 시점·API 준비 시점 규칙을 StrictMode 환경에 적용한 실무 지침"임을 명시.

**미검증 표기 2 — `next/dynamic` + `ssr: false` 패턴**
- AG Grid 공식 Next.js 가이드는 `'use client'` 경계까지만 다루며 동적 import를 권고하지 않음.
- 조치: SKILL.md 7-3절에 `> 주의:` 블록으로 "AG Grid 공식 권고가 아니라 Next.js의 클라이언트 전용 지연 로딩 패턴을 적용한 것"임을 명시하고, 과잉 적용 경고(SEO·LCP 손해)를 함께 기재.

**라이선스 경계 관련 안전장치**
- Enterprise 모듈 목록은 최신(36.x) 패키지 export 기준이므로 v33에 없는 신규 모듈(예: 수식·배치 편집·AI 계열)이 섞일 위험이 있었다.
- 조치: SKILL.md 2절 표에는 **v33 업그레이드 가이드·v33 문서로 직접 확인된 모듈만** 수록하고, 판별 규칙을 "`ag-grid-community`에서 import되면 Community, `ag-grid-enterprise`에서 import되면 Enterprise"라는 **버전 불변 규칙**으로 제시했다.

---

## 5. 테스트 진행 기록

**수행일**: 2026-08-26
**수행자**: skill-tester → general-purpose (3회 병렬 호출)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Community 프로젝트에서 헤더 컬럼 메뉴(햄버거 아이콘) 요청 — 라이선스 경계**
- ✅ PASS
- 근거: SKILL.md 2절 "라이선스 경계", 2-1 기능 구분표(168행), 168행 하단 `> 주의:` 블록(183행)
- 상세: 컬럼 메뉴가 Enterprise 전용(`ColumnMenuModule`)임을 정확히 식별하고 "Community에는 컬럼 메뉴 자체가 없다"는 공식 인용문을 그대로 근거로 제시. Community 대안(필터 버튼·플로팅 필터·정렬)도 2-1 표에서 정확히 인용. Enterprise 기능을 Community인 것처럼 답하는 anti-pattern 회피. 경미한 gap(컬럼 숨기기 API의 라이선스 소속 미명시)은 섹션 7에 기록.

**Q2. v33 모듈 미등록 에러(`error #200 ... RowSelectionModule is not registered`)**
- ✅ PASS
- 근거: SKILL.md 1절 "모듈 등록", 1-1/1-2절 코드, 12절 흔한 실수 표 1번·14번·19번
- 상세: 에러 코드 `#200`의 의미와 `ModuleRegistry.registerModules([...])` 해결책을 정확히 제시. v33 객체형 API `rowSelection={{ mode: 'multiRow' }}`를 사용해 문자열 `'multiple'` anti-pattern을 회피. 모듈 스코프 등록 원칙(useEffect 등록 금지)도 12절 14번 근거로 정확히 언급.

**Q3. Next.js App Router에서 서버/클라이언트 컴포넌트 분리 + columnDefs 배치**
- ✅ PASS
- 근거: SKILL.md 7-1절 "클라이언트 컴포넌트 경계" + 코드 예시(536~546행), 12절 흔한 실수 표 13번
- 상세: 서버 컴포넌트는 데이터 조회만, 그리드·columnDefs는 클라이언트 컴포넌트에서 생성해야 하는 이유(함수 직렬화 에러)를 정확히 설명. 잘못된 위치에 columnDefs를 두는 anti-pattern을 정확히 지적.

### 발견된 gap

- Q1에서 확인된 경미한 gap: 컬럼 숨기기(`applyColumnState`의 `hide` 토글)가 Community API인지 SKILL.md에 명시적 언급이 없음 — 2-1 라이선스 표에 `getColumnState`/`applyColumnState` 자체가 목록화되어 있지 않아 답변자가 "추정"이라 표시함. 차단 요인 아님(핵심 라이선스 판별은 정확), 선택 보강 대상.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 (content test PASS = APPROVED 가능)
- 최종 상태: APPROVED

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (17개 클레임 중 VERIFIED 16, DISPUTED 1은 수정 반영, 미검증 2건은 `> 주의:` 표기) |
| 구조 완전성 | ✅ (frontmatter·소스 URL 다중·검증일·버전 기준·주의 표기·흔한 실수 20종) |
| 실용성 | ✅ (전 섹션 실행 가능한 TypeScript/React 예시, 프로젝트 비종속) |
| 라이선스 경계 명확성 | ✅ (기능별 Community/Enterprise 표 + 버전 불변 판별 규칙 + 오답 방지 주의 2건) |
| 기존 스킬과의 중복 | ✅ 분리 완료 (가상 스크롤은 react-virtuoso 선택 기준으로 연결, 서버 상태 캐싱은 tanstack-query로 위임) |
| 에이전트 활용 테스트 | ✅ 2026-08-26 skill-tester → general-purpose 3회 수행, 3/3 PASS |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-08-26 완료, 3/3 PASS)
- [❌] 컬럼 숨기기(`applyColumnState`의 `hide` 토글)가 Community API인지 2-1 라이선스 표에 명시 필요 — 선택 보강(차단 요인 아님, Q1 테스트에서 발견된 경미한 gap)
- [❌] v36 이후 실제 마이그레이션 시 DOM 클래스명 변경(`ag-floating-top` → `.ag-grid-pinned-top-rows-container` 등) 전체 매핑표가 필요 — 현재 스킬에는 대표 예시 1건과 위험도 경고만 포함. 선택 보강(실제 v36 마이그레이션 착수 시점에 필요)
- [❌] Enterprise 모듈의 v33 시점 전체 목록은 공식 Module Selector(동적 UI)에 있어 정적 페이지로 확보하지 못함 — 표에는 문서로 직접 확인된 모듈만 수록. 선택 보강(대상 버전 문서 재확인 필요 시)
- [❌] Server-Side Row Model 실제 구현 패턴(그룹·집계·캐시 블록 설정)은 Enterprise 전용이라 별도 스킬로 분리하는 편이 적합 — 후속 스킬 신설 과제, 차단 요인 아님
- [❌] React StrictMode·React 19 동시성 환경에서의 그리드 동작은 공식 문서 근거가 없어 실사용 검증 후 보강 필요 — 선택 보강(실전 도입 이후 흔한 실수 축적 후 반영)
- [❌] 사용 중인 코드베이스가 v33에서 상위 메이저로 승급하면 0절·8절 기준 버전 재검증 필요 — 선택 보강(버전 승급 시점에 필요)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-08-26 | v1 | 최초 작성 — 공식 문서 24회 페치·12회 검색 기반, 17개 클레임 교차 검증(DISPUTED 1건 수정 반영, 미검증 2건 `> 주의:` 표기). v33 기준 + v33→v36 breaking change 정리, Community/Enterprise 라이선스 경계표 포함. skill-tester 테스트는 오케스트레이터가 별도 수행 예정 | skill-creator |
| 2026-08-26 | v1 | 2단계 실사용 테스트 수행 (Q1 라이선스 경계 / Q2 v33 모듈 미등록 에러 / Q3 Next.js App Router 컴포넌트 분리) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
