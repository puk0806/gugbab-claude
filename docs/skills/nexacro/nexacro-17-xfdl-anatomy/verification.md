---
skill: nexacro-17-xfdl-anatomy
category: nexacro
version: v1
date: 2026-10-08
status: APPROVED
---

# nexacro-17-xfdl-anatomy 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `nexacro-17-xfdl-anatomy` |
| 스킬 경로 | `.claude/skills/nexacro-17-xfdl-anatomy/SKILL.md` |
| 검증일 | 2026-10-08 |
| 검증자 | skill-creator (Claude) |
| 스킬 버전 | v1 |
| 버전 기준 | Nexacro Platform 17 / 17.1 (공식 샘플 v17.1.2.200). API 시그니처는 N V24 레퍼런스 기준 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.tobesoft.com — 17 제품 정보·고급 가이드·개발자 가이드·getting started, N/N V24 레퍼런스)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/TOBESOFT-DOCS/sample_nexacroplatform_17 — .xprj·.xadl·typedefinition.xml·environment.xml·appvariables.xml·.xfdl 원문 대조)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-10-08 — 17.1 최신 릴리스 노트 2024-01, N V24 최신 2026-03 24.0.0.1000)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (파일 구조·xfdl 골격·Dataset·transaction·Grid·showModal·include)
- [✅] 코드 예시 작성 (공식 문서·공식 샘플 기반 일반 예시만, 특정 회사 코드 없음)
- [✅] 흔한 실수 패턴 정리 (섹션 9 오독 패턴)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch | product_information_nexacro_17_ko (+ 6b366e2b289d3393, update_note_17_1, release_note_17_1_3, 5fb32e780d7a80dc) | 17 개요·17.1 변경점·2024-01 릴리스 노트 확인. EOL 정보 없음 |
| 조사 | WebFetch | product_information_nexacro_n_v24_en (+ 8aba7f56b662339c) | V24 릴리스 목록(2023-11~2026-03), 직전 V21, IE10/11 미지원, set_ 스크립트 지원 유지 |
| 조사 | WebFetch | advanced_development_guide_nexacro_17_ko/00512d676e7e6fb6 | 프로젝트 파일 구조·.xprj/.xadl 예시 |
| 조사 | WebFetch | advanced_development_guide_nexacro_n_en/db7432d00cb85b21 | .xfdl 골격(FDL/Form/Layouts/Script/Objects/Bind) |
| 조사 | WebFetch | reference_guide_nexacro_n_v24_ko/Form (offset 0·100000) | transaction 시그니처·in/out 형식·nDataType·기본값·ErrorCode 규약·Promise |
| 조사 | WebFetch | reference_guide_nexacro_n_v24_ko/Dataset (+ /getRowType) | ROWTYPE 상수·메서드·이벤트·onrowsetchanged reason |
| 조사 | WebFetch | reference_guide_nexacro_n_v24_ko/Grid (offset 0·100000·200000), /ChildFrame, /BindItem | Grid 속성·이벤트·메서드, showModal 시그니처·비블로킹·Promise, BindItem 속성 |
| 조사 | WebFetch | getting_started_nexacro_17_ko/d82e8b8cd262cb1a, getting_started_nexacro_n_en/f58e7c64b69e2051 | transaction 예제·reqDs/respDs 방향 정의·콜백 |
| 조사 | WebFetch | developer_guide_nexacro_17_ko/c196a2765af480f4, e0ebcf8534a1e9fc, e3bc5853556cf5bf | Grid 셀·트리(treeitemcontrol/treelevel)·suppress·엑셀 ExcelExportObject |
| 조사 | WebFetch | developer_guide_nexacro_n_v24_en/7cae57082a6c190c, developer_guide_nexacro_n_en/6d608b222b86650d | include "Base::libCommon.xjs"; 문장형, this. 함수 선언 |
| 조사 | WebFetch | GitHub TOBESOFT-DOCS/sample_nexacroplatform_17 (레포, raw .xprj/.xadl/typedefinition.xml/environment.xml/appvariables.xml, Sample/*.xfdl 5종) | XML 원문 대조: FDL 2.0, Grid Column/Row `size`, Row `band="head"`, Services 표, nexacro.getApplication() |
| 교차 검증 | WebSearch | transaction 인자·ROWTYPE·BindItem·include·트리 displaytype·showModal 콜백·gfn 관례·N 출시·17.1 릴리스 (검색 13회) | 기술 노트(e7404eee777a03d5, 9f5386dac8fb2335), velog 2건, inflearn Q&A, asiae 기사 등 독립 소스 확보 |
| 교차 검증 | 집계 | 41개 클레임 | VERIFIED 30 / DISPUTED 4 / UNVERIFIED 7 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 넥사크로 17 제품 정보 | https://docs.tobesoft.com/product_information_nexacro_17_ko | ⭐⭐⭐ High | 2026-10-08 확인 | 릴리스 노트 목록(최신 2024-01) |
| 17.1 릴리스 노트 2024-01 | https://docs.tobesoft.com/product_information_nexacro_17_ko/release_note_17_1_3 | ⭐⭐⭐ High | 2024-01 | 파일 버전 2024.01.23.1 |
| 17.1 주요 변경 사항 | https://docs.tobesoft.com/product_information_nexacro_17_ko/update_note_17_1 | ⭐⭐⭐ High | - | Skia·XP 미지원·DataObject |
| N V24 제품 정보 / 버전 정보 | https://docs.tobesoft.com/product_information_nexacro_n_v24_en , https://docs.tobesoft.com/product_information_nexacro_n_v24_en/8aba7f56b662339c | ⭐⭐⭐ High | 2023-11~2026-03 | V21 → V24 |
| 17 고급 가이드 — 파일 구조 | https://docs.tobesoft.com/advanced_development_guide_nexacro_17_ko/00512d676e7e6fb6 | ⭐⭐⭐ High | - | 17 전용 |
| N 고급 가이드 — Form 구조 | https://docs.tobesoft.com/advanced_development_guide_nexacro_n_en/db7432d00cb85b21 | ⭐⭐⭐ High | - | xfdl 골격 |
| N V24 레퍼런스 Form/Dataset/Grid/ChildFrame/BindItem | https://docs.tobesoft.com/reference_guide_nexacro_n_v24_ko/Form 외 | ⭐⭐⭐ High | - | 17과 차이 가능(17 전용 레퍼런스 미공개) |
| 17 Getting Started — 화면 만들기(X-API) | https://docs.tobesoft.com/getting_started_nexacro_17_ko/d82e8b8cd262cb1a | ⭐⭐⭐ High | - | 17 transaction 예제 |
| N Getting Started — Data Transactions | https://docs.tobesoft.com/getting_started_nexacro_n_en/f58e7c64b69e2051 | ⭐⭐⭐ High | - | reqDs/respDs 방향 정의 원문 |
| 17 개발자 가이드 — Grid·엑셀 | https://docs.tobesoft.com/developer_guide_nexacro_17_ko/c196a2765af480f4 , /e0ebcf8534a1e9fc , /e3bc5853556cf5bf | ⭐⭐⭐ High | - | 17 전용 |
| N/N V24 개발자 가이드 — 공통 스크립트 | https://docs.tobesoft.com/developer_guide_nexacro_n_v24_en/7cae57082a6c190c , https://docs.tobesoft.com/developer_guide_nexacro_n_en/6d608b222b86650d | ⭐⭐⭐ High | - | include 문장형 |
| 넥사크로 기술 노트 | https://docs.tobesoft.com/nexacro_technical_note_ko/e7404eee777a03d5 , https://docs.tobesoft.com/nexacro_technical_note_en/9f5386dac8fb2335 | ⭐⭐ Medium | 구버전 추정 | ErrorCode 양수=경고, 트리 displaytype=tree(구버전) |
| 공식 샘플 레포 | https://github.com/TOBESOFT-DOCS/sample_nexacroplatform_17 | ⭐⭐⭐ High | v17.1.2.200 | XML 원문 대조 |
| velog 넥사크로 DataSet 정리 | https://velog.io/@5tmdhkfem/Nexacro-DataSet-Method | ⭐ Low | - | ROWTYPE 값 교차 확인용 |
| 인프런 Q&A "팝업 종료 콜백" | https://www.inflearn.com/questions/967563/팝업-종료-콜백 | ⭐ Low | - | 팝업 콜백(strId, strVal)·공통 팝업 래퍼 관례 확인용 |
| 아시아경제 기사(Nexacro N 출시) | https://view.asiae.co.kr/en/article/2022062013284263607 | ⭐⭐ Medium | 2022 | N 2021-09 출시 |

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 클레임 판정표

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | 17.1 최신 릴리스 노트는 2024-01(파일 버전 2024.01.23.1) | VERIFIED | 17 제품 정보 목록 + 릴리스 노트 페이지 |
| 2 | Nexacro N 2021-09 출시 | VERIFIED | 언론 기사 2건(검색 결과) |
| 3 | N V24 첫 릴리스 2023-11(24.0.0.100), 직전 V21 | VERIFIED | V24 제품 정보 + 버전 정보 페이지 |
| 4 | N V24 IE10/11 미지원 | VERIFIED | V24 버전 정보 + V24 제품 정보(지원 환경) |
| 5 | 17/17.1 공식 EOL 일자 | UNVERIFIED | 공식 문서에 없음 → `> 주의:` 표기 |
| 6 | .xprj 구조(EnvironmentDefinition·TypeDefinition·AppVariables·AppInfos) | VERIFIED | 17 고급 가이드 + 17 샘플 원문 |
| 7 | .xadl 구조(Application·Layout·MainFrame·ChildFrame formurl·Style) | VERIFIED | 17 고급 가이드 + 17 샘플 원문 |
| 8 | typedefinition Services = prefixid·type·url·cachelevel | VERIFIED | 17 고급 가이드 + 17 샘플 원문 |
| 9 | environment.xml = Screen·Variable·Cookie·HTTP Header | VERIFIED | 17 고급 가이드 + 17 샘플 원문 |
| 10 | appvariables.xml = 전역 Dataset·Variable(17.1 DataObject) | VERIFIED | 17 고급 가이드 + 17 샘플 원문 + 17.1 변경 사항 |
| 11 | .xfdl 골격 FDL/Form/Layouts/Layout/Script/Objects/Bind/BindItem | VERIFIED | N 고급 가이드 + 17 샘플 원문(FDL 2.0) |
| 12 | Grid Format XML의 Column/Row 크기 속성은 `size`, 헤더 행은 `band="head"` | DISPUTED → 수정 | 17 개발자 가이드 요약에서 `width`/`height`로 추출됐으나 17 샘플 원문은 `size` → 샘플 원문 기준으로 작성 |
| 13 | 공통 xjs include 형식 | DISPUTED → 수정 | 의뢰 단서 `include("lib::x.xjs")` 괄호형 vs 공식 문서 2곳은 `include "Base::libCommon.xjs";` 문장형 → 문장형으로 작성, `> 주의:` 표기 |
| 14 | xjs 함수는 `this.`로 선언(없으면 전역) | VERIFIED | N 개발자 가이드 + 검색 결과(공통 스크립트 페이지) |
| 15 | ROWTYPE EMPTY0/NORMAL1/INSERT2/UPDATE4/DELETE8/GROUP16 | VERIFIED | V24 Dataset 레퍼런스(getRowType) + velog |
| 16 | Dataset 이벤트 cancolumnchange·oncolumnchanged·canrowposchange·onrowposchanged·onrowsetchanged·onload | VERIFIED | V24 Dataset 레퍼런스(2구간 확인) |
| 17 | transaction 시그니처(strSvcID, strURL, strInDatasets, strOutDatasets, strArgument[, strCallbackFunc[, bAsync[, nDataType[, bCompress]]]]) | VERIFIED (17 차이 가능 표기) | V24 Form 레퍼런스 + 17 getting started 6인자 예제 + 검색 결과 |
| 18 | in = `서버ID=폼Dataset`, out = `폼Dataset=서버ID` | VERIFIED | V24 레퍼런스 + N getting started 원문 정의 + 검색 예 `"input1=Dataset02","Dataset03=output1"` |
| 19 | nDataType 0 XML / 1 Binary / 2 SSV / 3 JSON, 기본 0 | VERIFIED (17 차이 가능 표기) | V24 레퍼런스 + 검색 결과(2=SSV) |
| 20 | 콜백 ErrorCode 판정 | DISPUTED → 수정 | 의뢰 단서 "0 성공·음수 오류" vs 레퍼런스 "0 이상 성공, 음수 실패", 기술 노트 "양수=경고" → "0 이상 성공·음수 실패"로 작성 |
| 21 | bAsync 기본 true(비동기) | VERIFIED | V24 레퍼런스 + 기술 노트("basically asynchronous") |
| 22 | transaction Promise 반환(콜백 생략 시) — 17 | UNVERIFIED | V24에서만 확인 → `> 주의:` 표기 |
| 23 | Grid binddataset·formats·formatid, 복수 Format | VERIFIED | V24 Grid 레퍼런스 + 17 샘플(Format 2개) |
| 24 | 트리 셀 displaytype | DISPUTED → 수정 | 17 개발자 가이드 `treeitemcontrol` vs 구버전 기술 노트 `tree` → 17은 treeitemcontrol, 구버전 tree 병기 `> 주의:` |
| 25 | treelevel `bind:컬럼`, edittype `tree`, treeinitstatus `expand,all`/`collapse,all` | VERIFIED | 17 개발자 가이드 + 기술 노트(edittype=tree) |
| 26 | suppress = 같은 값 연속 셀 병합, 숫자 레벨 | VERIFIED | 17 개발자 가이드 2페이지(c196·e0eb) |
| 27 | 합계 Band XML id `summary` | UNVERIFIED | 메서드 band 인자는 "summary" 확인, 17 XML 표기 미확인 → `> 주의:` |
| 28 | ExcelExportObject API(set_exportfilename·set_exporttype·set_exporturl·addExportItem·exportData) | VERIFIED | 17 개발자 가이드 + 17 샘플 원문 |
| 29 | 엑셀 내보내기는 서버 측(nexacro-xeni) 필요 | VERIFIED | 17 개발자 가이드 + 17 샘플(exporturl 서버) |
| 30 | showModal 시그니처([strID,] objParentFrame, [objArguList[, objOpener[, callbackFunc]]]) | VERIFIED (17 차이 가능 표기) | V24 ChildFrame 레퍼런스 + 레퍼런스 예제 |
| 31 | showModal 콜백 (strID, vArgu), 팝업 close(값) 반환 | VERIFIED | V24 레퍼런스 + 인프런 Q&A(strId, strVal) |
| 32 | showModal은 스크립트 비블로킹 | VERIFIED | V24 레퍼런스 + 인프런 Q&A(콜백에서 후처리) |
| 33 | showModal Promise 반환·showModalSync — 17 | UNVERIFIED | V24에서만 확인 → `> 주의:` |
| 34 | gfn_ 접두어는 공식 규칙이 아닌 관례 | VERIFIED | 공식 공통 스크립트 문서 2곳 예시에 접두어 없음 + 커뮤니티의 gfnOpenPopup 래퍼 사례 |
| 35 | InitValue 파일 형식 | UNVERIFIED | 서비스 존재만 샘플로 확인 → `> 주의:` |
| 36 | 17 샘플은 nexacro.getApplication(), 14는 application. 전역 | VERIFIED | 17 샘플 원문 + 기술 노트/검색 예 `application.transaction(...)` |
| 37 | 17 스크립트는 set_ 세터, V24는 직접 대입 권장(set_ 지원 유지) | VERIFIED | 17 샘플 원문 + V24 버전 정보 |
| 38 | Dataset 컬럼 타입 STRING·INT·FLOAT·DECIMAL·BIGDECIMAL·DATE·DATETIME·TIME·BLOB | VERIFIED | N 고급 가이드(SSV) + 17 샘플(STRING·INT) + 17.1 릴리스 노트(BIGDECIMAL) |
| 39 | BindItem compid·propid·datasetid·columnid, value 바인딩은 양방향 | VERIFIED | V24 BindItem 레퍼런스 + N 개발자 가이드 바인딩 페이지 |
| 40 | Div 내부 컴포넌트의 BindItem compid 문자열 형식 | UNVERIFIED | 공식 문서에 없음 → `> 주의:` |
| 41 | 팝업 쪽에서 objArguList 값을 읽는 경로(`this.parent.키` 등) | UNVERIFIED | 공식 문서로 확정 못 함 → `> 주의:` |

> 집계: 클레임 41개 — VERIFIED 30 / DISPUTED 4 (#12·#13·#20·#24) / UNVERIFIED 7 (#5·#22·#27·#33·#35·#40·#41)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 4건은 공식 문서·샘플 원문 기준으로 수정)
- [✅] 버전 정보가 명시되어 있음 (17 / 17.1, 샘플 v17.1.2.200, N V24 레퍼런스 기준 표기)
- [✅] deprecated된 패턴을 권장하지 않음 (분석용 사전 — 17 코드 스타일 설명, V24 차이 표기)
- [✅] 코드 예시가 실행 가능한 형태임 (공식 샘플·문서 예시 기반)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (섹션 0)
- [✅] 흔한 실수 패턴 포함 (섹션 9)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 분석·명세 작성에 도움이 되는 수준 (섹션 10 체크리스트)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 회사 코드·화면명·URL 미포함)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-10-08, general-purpose 3건)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (FAIL 없음, 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-10-08
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 미설치로 대체 사용)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. transaction 호출표 한 줄 정리 + `Prefix::` URL 확정 + 콜백 ErrorCode 판정**
- ✅ PASS
- 근거: SKILL.md "6. transaction()", "2. typedefinition.xml — Services", "9. 흔한 오독 패턴", "10-C"
- 상세: in=서버=폼 / out=폼=서버 방향을 올바르게 구분. `:U` 접미를 임의 해석하지 않고 "소스 그대로 기록" 규칙 적용. URL은 typedefinition Services의 prefixid url + 파일명으로 확정하고 미정의 prefix 값을 추측하지 않음. 음수만 실패(공식 규약)이되 명세에는 소스의 실제 분기 조건을 적는다는 점 반영. 피해야 할 오답(in/out 동일 방향, `!= 0` 무조건 실패, Prefix 문자열 그대로 기재) 모두 회피.

**Q2. showModal 다음 줄 Grid 갱신을 팝업 결과 반영으로 적어도 되는가 + `await showModal`**
- ✅ PASS
- 근거: SKILL.md "8. 팝업 — ChildFrame.showModal", "6" Promise 주의, "10-F"
- 상세: 비블로킹이므로 결과 반영은 콜백 `(strID, vArgu)`임을 정확히 제시. vArgu 문자열 파싱 확인, 래퍼 인자 매핑, 인자 읽기 경로 미확정 주의 반영. `await`는 17 지원 미확인으로 런타임 버전 재확인·소스 그대로 기록(transaction 규칙에서 유추, 오답 아님).

**Q3. `gfn_transaction` 정체·정의 탐색 / 저장 행 상태·삭제 행 수 / Script만으로 이벤트 목록 추출 위험**
- ✅ PASS
- 근거: SKILL.md "4. 공통 라이브러리 관례", "5. Dataset — 행 상태", "3. 읽는 요령", "9", "10-C·D·I"
- 상세: gfn_ 는 내장 API가 아닌 프로젝트 관례, include 체인에서 정의 탐색 후 래퍼 인자 조립 규칙을 역적용해 실제 호출 값 기록. ROWTYPE 2/4/8·SSV 문자, 삭제 행은 `getDeletedRowCount()` 별도 집계(rowcount 아님). 이벤트는 Layout XML 속성에 있어 Script만 grep하면 누락됨을 정확히 지적.

### 발견된 gap (있으면)

모두 선택 보강이며 판정 차단 요인 아님.
- 섹션 9 오독 표에 "showModal 다음 줄을 결과 반영으로 읽음" 항목이 없음 (섹션 8에는 있음)
- `await showModal` 소스를 만났을 때의 행동 지침이 transaction(섹션 6)과 비대칭
- `dsList:U` 류 Dataset 접미 의미 미정의 (현재는 "해석하지 말고 소스 그대로 기록"으로 처리)
- 저장 래퍼의 행 상태 필터링 전형 패턴 예시 없음

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (읽기 사전 + 추출 체크리스트 → 답변 정확성으로 검증 가능, 빌드 설정·마이그레이션 실행·워크플로우 실행 결과 검증 대상 아님)
- 최종 상태: APPROVED

### 사전 템플릿 (참고용, 위 실제 수행으로 대체됨)

### 테스트 케이스 1: transaction 호출표 추출

**입력 (질문/요청):**
```
xfdl Script에 this.transaction("save", "SvcA::save.do", "input1=dsList:U", "dsResult=output1", "mode=I", "fn_callback") 가 있다. 호출표 한 줄로 정리하고 URL 실제 경로는 어떻게 확정하나?
```

**기대 결과:**
```
in = 서버 input1 ← 폼 dsList(접미 표기는 소스 그대로), out = 폼 dsResult ← 서버 output1, 인자 mode=I, 콜백 fn_callback(음수 실패).
URL은 typedefinition.xml Services의 prefixid "SvcA" url + save.do.
```

**실제 결과:** (미실시)

**판정:** 미실시

---

### 테스트 케이스 2: 팝업 흐름 명세

**입력:**
```
showModal 다음 줄에서 Grid를 갱신하는 코드가 있다. 팝업 결과 반영 시점으로 명세에 적어도 되나?
```

**기대 결과:** 아니다. showModal은 비블로킹이므로 결과 반영은 콜백(strID, vArgu)에 있다. 17에서 Promise/showModalSync 지원은 미확인.

**실제 결과:** (미실시)

**판정:** 미실시

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (17 전용 레퍼런스 부재로 V24 기준 표기) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-10-08, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester 2단계 content test 수행 및 섹션 5·6 갱신 (2026-10-08 완료, 3/3 PASS)
- [❌] 넥사크로 17 전용 API 레퍼런스(Studio F1 도움말 등) 확보 시 transaction·showModal 시그니처 17 기준 재대조 — 선택 보강(차단 요인 아님, 17 전용 문서 공개 시)
- [❌] 17/17.1 공식 EOL 공지 확인 시 섹션 1 갱신 — 선택 보강(차단 요인 아님)
- [❌] 합계 Band XML id(`summary`/`summ`) 17 샘플로 확정 — 선택 보강(차단 요인 아님)
- [❌] InitValue 파일 형식 확인 — 선택 보강(차단 요인 아님)
- [❌] 실제 레거시 넥사크로 17 레포에서 체크리스트 적용해 누락 항목 보완(실사용 검증) — 선택 보강(content test 기준 APPROVED에는 영향 없음)
- [❌] 섹션 9 오독 표에 showModal 항목 추가·`await showModal` 처리 지침·Dataset 접미(`:U`) 설명 보강 — 선택 보강(테스트 gap, 차단 요인 아님)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-10-08 | v1 | 최초 작성 (클레임 41개: VERIFIED 30 / DISPUTED 4 / UNVERIFIED 7) | skill-creator |
| 2026-10-08 | v1 | 2단계 실사용 테스트 수행 (Q1 transaction 호출표·URL 확정·ErrorCode / Q2 showModal 비블로킹·콜백 / Q3 gfn 래퍼·행 상태·이벤트 연결) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
