---
name: nexacro-17-xfdl-anatomy
description: 넥사크로플랫폼 17/17.1 프로젝트 소스(.xprj·.xadl·typedefinition.xml·.xfdl·.xjs)를 정확히 읽기 위한 사전과 화면 1개 명세 추출 체크리스트 — 레거시 넥사크로 화면 분석·명세화·마이그레이션 시 사용
---

# 넥사크로 17 소스 해부 사전 + 화면 명세 추출 체크리스트

> 소스: https://docs.tobesoft.com/product_information_nexacro_17_ko · https://docs.tobesoft.com/advanced_development_guide_nexacro_17_ko/00512d676e7e6fb6 · https://docs.tobesoft.com/advanced_development_guide_nexacro_n_en/db7432d00cb85b21 · https://docs.tobesoft.com/reference_guide_nexacro_n_v24_ko/Form · https://docs.tobesoft.com/reference_guide_nexacro_n_v24_ko/Dataset · https://docs.tobesoft.com/reference_guide_nexacro_n_v24_ko/Grid · https://docs.tobesoft.com/reference_guide_nexacro_n_v24_ko/ChildFrame · https://docs.tobesoft.com/getting_started_nexacro_17_ko/d82e8b8cd262cb1a · https://docs.tobesoft.com/developer_guide_nexacro_17_ko/e0ebcf8534a1e9fc · https://docs.tobesoft.com/developer_guide_nexacro_17_ko/e3bc5853556cf5bf · https://docs.tobesoft.com/developer_guide_nexacro_n_v24_en/7cae57082a6c190c · https://github.com/TOBESOFT-DOCS/sample_nexacroplatform_17
> 검증일: 2026-10-08

> 주의: **넥사크로 17 전용 API 레퍼런스는 공개 웹에서 확인되지 않는다.** 이 문서의 메서드 시그니처·상수·이벤트는 **N V24 레퍼런스 기준이며 17과 차이가 있을 수 있다.** XML 구조는 17 공식 샘플(v17.1.2.200)로 직접 대조했다. 실제 레거시 소스와 다르면 **소스가 정답**이다.

---

## 0. 언제 쓰나 / 언제 안 쓰나

| 사용 | 사용하지 않음 |
|------|--------------|
| 레거시 넥사크로 17/17.1 화면(.xfdl)을 읽고 기능 명세를 뽑을 때 | 신규 넥사크로 N V24 개발 가이드가 필요할 때(V24 공식 문서 직접 참조) |
| 넥사크로 → React/Vue 등 마이그레이션 전 화면 인벤토리 작성 | 넥사크로 서버 측(X-API/nexacro-xeni) 구현 |
| 공통 라이브러리(.xjs) 의존 관계 파악 | 넥사크로 Studio 사용법·빌드/배포 |

---

## 1. 버전 계보

| 제품 | 핵심 사실 (공식 문서 기준) |
|------|-----------------------------|
| nexacro platform 14 | 앱 객체를 `application.` 전역으로 참조하는 코드가 흔함 |
| Nexacro Platform 17 | 하나의 소스로 웹(WRE)·데스크톱/모바일(NRE) 실행. 17 공식 샘플은 `nexacro.getApplication()` 사용 |
| Nexacro Platform 17.1 | 17의 후속 릴리스. Skia 도입으로 Windows XP 미지원, DataObject(17.1.2.100) 추가. **제품 정보 목록상 최신 릴리스 노트 = 2024년 1월** (문서 제목 17.1.3.1700, 파일 버전 2024.01.23.1) |
| Nexacro N (V21) | 2021-09 출시(언론 보도 기준) |
| Nexacro N V24 | 첫 릴리스 2023-11 (24.0.0.100), 직전 버전은 V21. IE10/11 미지원. `set_속성()` 스크립트는 계속 지원하되 신규 코드는 직접 대입 권장 |

> 주의: 넥사크로 17/17.1의 **공식 지원 종료(EOL) 일자는 확인되지 않았다.** "2024-01이 마지막 릴리스"는 공식 제품 정보 페이지의 릴리스 노트 목록 기준이지 EOL 공지가 아니다.

**읽을 때 의미:** 17 소스는 `this.Grid00.set_binddataset("ds")`처럼 **`set_` 세터 호출**이 기본 형태다. 직접 대입(`obj.text = ...`)은 V24 권장 스타일이므로 17 코드에서 섞여 있으면 후대 수정 흔적일 수 있다.

---

## 2. 프로젝트 파일 구조

| 파일 | 역할 | 명세 추출 시 볼 것 |
|------|------|------------------|
| `{프로젝트}.xprj` | 프로젝트 설정. environment·typedefinition·appvariables·xadl 위치를 가리킴 | 진입점 |
| `{앱}.xadl` | Application 설정(MainFrame/ChildFrame 레이아웃, 앱 스크립트, 스타일 xcss) | 첫 화면 `formurl`, 전역 스크립트 |
| `typedefinition.xml` | 모듈·컴포넌트·**Services**(prefixid↔url)·프로토콜·업데이트 정보 | **`Prefix::` 해석표** |
| `environment.xml` | Screen 정의, Variable, Cookie, HTTP Header | 공통 헤더·쿠키·테마 |
| `appvariables.xml` | 앱 전역 Dataset·Variable(·17.1은 DataObject) | 전역 Dataset(코드·세션 정보) |
| `*.xfdl` | Form(화면). 레이아웃 + Dataset + 바인딩 + 스크립트 | **분석 대상 본체** |
| `*.xjs` | 공통 스크립트 라이브러리 | 공통 함수 의존 |
| `*.xcss` | 스타일(빌드 시 브라우저별 CSS 생성). Form 단위로는 지정 불가, 앱/테마 수준 | 대개 명세 대상 아님 |

### .xprj (17 공식 샘플)

```xml
<Project version="2.1">
  <EnvironmentDefinition url="environment.xml"/>
  <TypeDefinition url="typedefinition.xml"/>
  <AppVariables url="appvariables.xml"/>
  <AppInfos>
    <AppInfo url="sample_nexacroplatform_17.xadl"/>
  </AppInfos>
</Project>
```

### .xadl (17 공식 샘플)

```xml
<ADL version="2.0">
  <Application id="sample_nexacroplatform_17" screenid="Screen_D,Screen_jp">
    <Layout>
      <MainFrame id="mainframe" ...>
        <ChildFrame id="ChildFrame00" formurl="Base::main.xfdl" .../>
      </MainFrame>
    </Layout>
    <Style url="xcssrc::sample_common_style.xcss"/>
  </Application>
</ADL>
```

### typedefinition.xml — Services (Prefix 해석의 근거)

17 공식 샘플의 Service 항목(속성: `prefixid`, `type`, `url`, `cachelevel`):

| prefixid | type | url |
|----------|------|-----|
| Base | form | ./Base/ |
| Sample | form | ./Sample/ |
| SvcGetSource | file | ./Service/ |
| theme / imagerc / font / xcssrc / initvalue | resource | ./_resource_/... |

- `formurl="Base::main.xfdl"` → `./Base/main.xfdl`
- `include "Base::libCommon.xjs";` → `./Base/libCommon.xjs`
- `transaction(..., "SvcList::search.jsp", ...)` → SvcList 서비스의 url + `search.jsp`

**URL 확정 절차:** transaction URL의 `Prefix::` 앞부분을 typedefinition.xml Services에서 찾아 실제 서버 경로를 계산한다. 운영/개발 서버별로 Services url을 런타임에 바꾸는 공통 코드가 있을 수 있으니 `.xadl` 스크립트도 확인한다.

> 주의: typedefinition에 `initvalue` 리소스 서비스가 존재함은 샘플로 확인했지만, **InitValue 파일의 내부 형식은 확인되지 않았다.** 컴포넌트 기본값이 화면과 다르게 보이면 `_resource_/_initvalue_/` 폴더를 직접 열어 확인한다.

---

## 3. .xfdl XML 골격

```xml
<?xml version="1.0" encoding="utf-8"?>
<FDL version="2.0">                         <!-- 17 샘플은 2.0, N 문서 예시는 2.1 -->
  <Form id="frmSample" width="1024" height="768" titletext="..." onload="form_onload">
    <Layouts>
      <Layout height="768" width="1024">      <!-- 보이는 컴포넌트 배치 -->
        <Button id="btnSearch" text="조회" onclick="btnSearch_onclick" .../>
        <Grid id="grdList" binddataset="dsList" ...> <Formats>...</Formats> </Grid>
        <Edit id="edtKeyword" .../>
      </Layout>
    </Layouts>
    <Script type="xscript5.1"><![CDATA[ ... ]]></Script>   <!-- 이벤트 함수·로직 -->
    <Objects>                                  <!-- 보이지 않는 객체 -->
      <Dataset id="dsList">
        <ColumnInfo>
          <Column id="NAME" type="STRING" size="256"/>
          <Column id="SALARY" type="INT" size="10"/>
        </ColumnInfo>
        <Rows>
          <Row><Col id="NAME">John</Col><Col id="SALARY">15000</Col></Row>
        </Rows>
      </Dataset>
    </Objects>
    <Bind>                                     <!-- Dataset 컬럼 ↔ 컴포넌트 속성 -->
      <BindItem id="item0" compid="edtKeyword" propid="value" datasetid="dsSearch" columnid="KEYWORD"/>
    </Bind>
  </Form>
</FDL>
```

읽는 요령:

- **이벤트 연결은 XML 속성**이다: `onclick="btnSearch_onclick"` → Script 안의 `this.btnSearch_onclick = function(obj, e) {...}`. Script만 grep하면 어떤 컴포넌트가 호출하는지 놓친다.
- **Dataset 컬럼 타입**(SSV/XML 공통 명칭): `STRING, INT, FLOAT, DECIMAL, BIGDECIMAL, DATE, DATETIME, TIME, BLOB`.
- `<Rows>`에 값이 있으면 **화면 내장 정적 데이터**(콤보 코드 등)다. 비어 있으면 transaction으로 채워진다.
- **BindItem** 속성: `compid`(컴포넌트), `propid`(속성), `datasetid`, `columnid`. `propid="value"`일 때는 컴포넌트 수정값이 Dataset에 되돌아 반영된다(양방향). 그 외 속성 바인딩은 표시용이다.
- Div 내부 컴포넌트는 별도 `form`을 가진다(스크립트에서 `this.divSearch.form.edtKeyword`).

> 주의: Div 내부 컴포넌트를 BindItem의 `compid`로 지정하는 문자열 형식(예: 점 표기)은 공식 문서에서 확인되지 않았다. 소스에 나온 형식을 그대로 기록한다.

---

## 4. .xjs 공통 스크립트와 include

공식 문서 형식(문장형, 세미콜론 필수, 스크립트 최상단):

```javascript
include "Base::libCommon.xjs";

// libCommon.xjs 안 — 함수는 this. 로 선언 (this 없으면 전역 처리)
this.isNumber = function(str)
{
    var retVal = nexacro.isNumeric(str);
    return retVal;
}
```

- include 대상도 `Prefix::파일` → typedefinition Services로 경로 해석.
- 공통 xjs 안에서 다른 xjs를 다시 include하는 체인이 공식적으로 안내된다 → **include 그래프를 끝까지 따라가야** 의존 함수 목록이 완성된다.
- include된 `this.xxx` 함수는 Form의 `this`에 붙으므로, 화면 스크립트에서 정의 없이 호출되는 `this.xxx()`는 include 체인에서 찾는다.

> 주의: 공식 문서에는 `include "..."` 문장형만 나온다. `include("...")` 같은 괄호형이 레거시 소스에 보이면 소스를 따르되 공식 형식은 아님을 인지한다.

### 공통 라이브러리 관례 (gfn_ 등)

`gfn_`, `gfn` 접두어(전역 공통 함수), `fn_`(화면 함수), `ds`(Dataset) 같은 이름은 **넥사크로 공식 규칙이 아니라 프로젝트 관례**다. 공식 문서 예시는 `libCommon.xjs` + `this.isNumber`처럼 접두어가 없다.

실제 레포에서 읽어내는 절차:

1. typedefinition.xml Services 중 `lib`, `common`, `Base` 류 prefix의 폴더를 찾는다.
2. `.xadl` Script와 모든 `.xfdl` 최상단의 `include` 문을 수집해 include 그래프를 만든다.
3. 공통 xjs에서 `this.<이름> = function` 선언을 모두 추출해 **공통 함수 사전**(이름·인자·역할)을 만든다.
4. 특히 다음 래퍼를 우선 식별한다: transaction 래퍼(공통 에러 처리·세션 만료·로딩바), 팝업 래퍼(showModal 감싸기), 메시지/confirm 래퍼, 권한 체크, 엑셀 내보내기 래퍼, 코드(콤보) 조회 래퍼.
5. 화면 분석 시 원시 `this.transaction(...)` 대신 래퍼가 쓰였다면, 래퍼 내부의 인자 조립 규칙(URL prefix 부착, 공통 인자 추가 등)을 역으로 적용해 **실제 호출 값**을 기록한다.

---

## 5. Dataset — API·행 상태·이벤트

> 주의: 아래는 N V24 레퍼런스 기준. 17과 차이 가능.

### 행 상태(Row Type) 상수 — `ds.getRowType(nRow)` 반환값

| 상수 | 값 | 의미 |
|------|----|------|
| `Dataset.ROWTYPE_EMPTY` | 0 | 존재하지 않는 행 |
| `Dataset.ROWTYPE_NORMAL` | 1 | 초기(조회된) 상태 |
| `Dataset.ROWTYPE_INSERT` | 2 | 추가된 행 |
| `Dataset.ROWTYPE_UPDATE` | 4 | 수정된 행 |
| `Dataset.ROWTYPE_DELETE` | 8 | 삭제된 행 |
| `Dataset.ROWTYPE_GROUP` | 16 | 그룹(keystring) 정보 행 |

- 삭제 행은 일반 행 범위에서 빠지므로 `getDeletedRowCount()`, `getDeletedColumn()`으로 따로 읽는다.
- `getRowType`·`getOrgColumn`은 필터로 숨은 행을 제외, `getRowTypeNF` 등 `NF` 접미 메서드는 포함한다.
- SSV 전송 시 행 타입 문자: `N`(Normal)·`I`(Insert)·`U`(Update)·`D`(Delete)·`O`(Original).

### 자주 나오는 메서드

| 분류 | 메서드 |
|------|--------|
| 행 | `addRow`, `insertRow`, `deleteRow`, `deleteAll`, `deleteMultiRows`, `applyChange`, `reset` |
| 값 | `getColumn`, `setColumn`, `getOrgColumn`, `copyData`, `copyRow`, `appendData`, `clearData` |
| 검색 | `findRow`, `findRowExpr`, `extractRows`, `lookup`, `filter` |
| 집계 | `getSum`, `getAvg`, `getCount`, `getCaseSum`, `getCaseCount` 등 |

### 이벤트 (Dataset XML 속성 또는 addEventHandler로 연결)

`onload`, `cancolumnchange`(변경 전, 거부 가능), `oncolumnchanged`, `canrowposchange`, `onrowposchanged`, `onrowsetchanged`(reason: `REASON_APPEND`·`REASON_MERGE`·`REASON_MOVE`·`REASON_LOAD`·`REASON_RESET` 등).

**명세 관점:** `cancolumnchange`/`canrowposchange`에 `return false` 류가 있으면 **입력 검증·행 이동 차단 규칙**이다. `oncolumnchanged`는 **연동 계산(파생 컬럼)** 규칙이다.

---

## 6. transaction() — 서버 통신

> 주의: 시그니처·nDataType·기본값은 N V24 레퍼런스 기준. 17 getting started 예제의 6인자 형태와는 일치하지만 7번째 이후 인자는 17에서 미확인.

```
Form.transaction(strSvcID, strURL, strInDatasets, strOutDatasets, strArgument
                 [, strCallbackFunc [, bAsync [, nDataType [, bCompress]]]])
```

| 인자 | 형식 | 비고 |
|------|------|------|
| strSvcID | 문자열 | 콜백에서 어떤 호출인지 구분하는 ID |
| strURL | `"Prefix::파일"` 또는 절대 URL | Prefix → typedefinition Services |
| strInDatasets | `"서버측ID=폼Dataset"` 공백 구분 다중 | 예: `"input1=dsSearch"`. 형식에서 벗어난 접미·표기가 보이면 해석하지 말고 소스 그대로 기록 |
| strOutDatasets | `"폼Dataset=서버측ID"` 공백 구분 다중 | 예: `"dsList=output1"` — **in과 좌우가 반대** |
| strArgument | `"변수ID=값"` 공백 구분 | 예: `"argu0=test argu1=30"` |
| strCallbackFunc | 콜백 함수 이름(문자열) | Form 또는 Application 범위에 정의 |
| bAsync | boolean | 미설정 시 `true`(비동기) |
| nDataType | 0 XML / 1 Binary / 2 SSV / 3 JSON | 미설정 시 0 |
| bCompress | boolean | 미설정 시 false |

```javascript
this.btnSearch_onclick = function(obj, e)
{
    // 서버 output1 → 폼 dsList
    this.transaction("search", "SvcList::search.jsp", "input1=dsSearch", "dsList=output1", "", "fn_callback");
};

this.fn_callback = function(strSvcID, nErrorCode, strErrorMsg)
{
    if (nErrorCode < 0) {            // 음수 = 실패
        this.alert("Error[" + nErrorCode + "]:" + strErrorMsg);
        return;
    }
    switch (strSvcID) {             // 0 이상 = 성공
        case "search": /* 조회 후처리 */ break;
    }
};
```

- 콜백 규약: **ErrorCode 0 이상 = 성공, 0 미만(음수) = 실패.** (기술 노트는 양수를 경고로 설명)
- 콜백 하나에서 `switch(strSvcID)`로 여러 호출을 처리하는 패턴이 흔하다 → **svcID별로 후처리 로직을 분리 기록**한다.
- 비동기이므로 `transaction()` 다음 줄은 응답 전에 실행된다. 결과 의존 로직은 콜백 안에 있다.

> 주의: N V24는 `strCallbackFunc`를 생략하면 **Promise를 반환**한다. **넥사크로 17에서 Promise 반환 지원 여부는 미확인**이다. 17 소스에 `await this.transaction(...)`이 보이면 런타임 버전을 재확인한다.

---

## 7. Grid

```xml
<Grid id="grdList" binddataset="dsList" autoenter="none" selecttype="row" ...>
  <Formats>
    <Format id="default">
      <Columns>
        <Column size="80"/>
        <Column size="100"/>
      </Columns>
      <Rows>
        <Row size="24" band="head"/>
        <Row size="24"/>
      </Rows>
      <Band id="head">
        <Cell text="Name"/>
        <Cell col="1" text="Salary"/>
      </Band>
      <Band id="body">
        <Cell text="bind:Name" textAlign="left"/>
        <Cell col="1" text="bind:Salary" displaytype="currency" textAlign="right"/>
      </Band>
    </Format>
    <Format id="format00"> ... </Format>   <!-- 복수 Format: formatid 로 전환 -->
  </Formats>
</Grid>
```

| 항목 | 읽는 법 |
|------|---------|
| `binddataset` | Grid 전체 셀과 바인드되는 Dataset ID |
| `formats` / `formatid` | 복수 Format 정의 시 `formatid`(또는 스크립트)로 표시 Format 전환 → **Format마다 컬럼 목록 기록** |
| Columns `size` / Rows `size`·`band` | 열 너비·행 높이. `band="head"` 행은 헤더 |
| `Cell col`/`row`/`colspan`/`rowspan` | 셀 위치·병합(헤더 다단) |
| `text="bind:컬럼"` | Dataset 컬럼 바인딩. `expr:` 접두는 표현식(계산 표시) |
| `displaytype` | 표시 형식. 미설정 시 `normal`. 공식 자료에서 확인한 값: `currency`, `checkboxcontrol`, `decoratetext`, `treeitemcontrol` 등 |
| `edittype` | 편집 형식. 공식 자료에서 확인한 값: `normal`, `date`, `mask`, `tree` 등. 미설정 셀은 편집 불가로 보고 소스의 스크립트 변경(`setCellProperty`) 여부를 함께 확인 |
| `suppress` | 같은 값 연속 셀을 하나로 합쳐 표시. 값은 숫자 레벨(1, 2…) |
| `autoenter`, `selecttype` | 편집 진입 방식, 선택 단위(`row`/`multirow`/`cell`/`area`/`multiarea`) |

- **트리 Grid (17 개발자 가이드):** Cell `displaytype="treeitemcontrol"`, `treelevel="bind:레벨컬럼"`, 편집 시 `edittype="tree"`. Grid `treeinitstatus`(`"expand,all"`·`"collapse,all"`), `treeuseline` 등. 관련 메서드 `getTreeStatus`·`setTreeStatus`·`getTreeChildCount`.
- **이벤트:** `oncellclick`, `oncelldblclick`, `onheadclick`(헤더 정렬 구현에 흔함), `oncellposchanged`, `onexpanddown`.
- 스크립트로 셀 속성을 바꾸는 `setCellProperty("body", nCellIdx, "edittype", "normal")` 류가 있으면 **조건부 편집 가능 규칙**이다.

> 주의: 넥사크로 14 시절 기술 노트는 트리 표시에 `displaytype=tree`를 쓴다. 17 개발자 가이드는 `treeitemcontrol`. 소스에 둘 중 무엇이 있든 "트리 컬럼"으로 기록한다.
> 주의: 합계 밴드의 XML `Band id`는 Grid 메서드 band 인자 기준 `"summary"`로 보이나 **17 XML 표기는 미확인**(`summ`도 보일 수 있음). 17 가이드의 `summ`은 사용자 정의 속성 예시였다.

### 엑셀 내보내기 (ExcelExportObject)

```javascript
this.exportObj = new ExcelExportObject("Export00", this);
this.exportObj.set_exportfilename("ExcelExportFile");
this.exportObj.set_exporttype(nexacro.ExportTypes.EXCEL2007);   // xls(97-2003)/xlsx 지원
this.exportObj.set_exporturl("<엑셀 처리 서버 URL>");
this.exportObj.addExportItem(nexacro.ExportItemTypes.GRID, this.grdList, "Sheet1!A1");
var nExported = this.exportObj.exportData();                       // onsuccess / onerror 이벤트
```

- 엑셀 파일 처리는 **서버 측 nexacro-xeni** 등 별도 서버 앱이 필요하다(`exporturl`) → 마이그레이션 시 서버 의존성으로 기록.
- 공식 17 샘플은 onsuccess/onerror 핸들러를 `this.addEventHandler(...)`로 등록한다. 레거시 코드에서 핸들러 등록 대상이 어디인지 소스 그대로 확인한다.

---

## 8. 팝업 — ChildFrame.showModal

> 주의: 시그니처는 N V24 레퍼런스 기준. 17과 차이 가능.

```
ChildFrame.showModal([strID,] objParentFrame, [{objArguList} [, objOpener [, callbackFunc]]])
```

```javascript
var objFrame = new ChildFrame();
objFrame.init("popSample", 0, 0, 500, 400);
objFrame.set_formurl("Base::popSample.xfdl");       // 17 스타일 세터
objFrame.set_openalign("center middle");
objFrame.showModal(this.getOwnerFrame(), {param1:"a"}, this, "fn_popupCallback");

this.fn_popupCallback = function(strID, vArgu)         // 팝업 close("값")의 값이 vArgu
{
    if (strID == "popSample" && vArgu) { /* 반영 */ }
};

// 팝업 쪽: 인자 읽기 → 닫으며 값 반환
// var v = this.parent.param1;     (objArguList 키는 팝업 Frame 쪽에서 참조)
// this.close("returnValue");
```

- `showModal()`은 **스크립트를 블로킹하지 않는다** — 호출 다음 줄이 즉시 실행된다. 결과 처리는 콜백에 있다.
- 콜백 시그니처 `function(strID, vArgu)` — `vArgu`는 팝업이 `close(값)`으로 넘긴 값(문자열인 경우가 많아 JSON 문자열·구분자 문자열 파싱 코드가 따라오는지 확인).
- 실무 레거시는 대부분 **공통 팝업 래퍼**(예: `gfn...Popup`류)로 감싼다 → 래퍼의 인자 → showModal 인자 매핑을 먼저 해석한다.

> 주의: N V24는 callbackFunc 생략 시 Promise 반환, 블로킹용 `showModalSync()`도 있다. **17에서 두 기능의 지원 여부는 미확인.**
> 주의: 팝업 쪽에서 objArguList 값을 읽는 정확한 경로(`this.parent.키` 등)는 공식 문서로 확정하지 못했다. 소스의 실제 참조 방식을 기록한다.

---

## 9. 흔한 오독(誤讀) 패턴

| 오독 | 바른 해석 |
|------|----------|
| inDatasets·outDatasets를 같은 방향으로 읽음 | in은 `서버=폼`, out은 `폼=서버` |
| 콜백 `nErrorCode != 0`이면 무조건 실패로 기록 | 공식 규약은 **음수만 실패**. 단, 레거시 코드의 실제 분기 조건을 그대로 명세에 적는다 |
| `transaction` 다음 줄을 응답 후 로직으로 읽음 | 기본 비동기. 후처리는 콜백 |
| Script만 보고 이벤트 목록 작성 | 이벤트 연결은 Layout XML 속성(`onclick=` 등)에 있다 |
| Dataset `<Rows>` 정적 데이터를 누락 | 콤보 코드·고정 옵션의 원천이다 |
| `Prefix::` URL을 문자열 그대로 명세에 기재 | typedefinition Services로 실제 경로 해석 |
| `gfn_` 함수를 넥사크로 내장 API로 오인 | 프로젝트 공통 라이브러리 관례. include 체인에서 정의를 찾는다 |
| Grid Format이 하나라고 가정 | `<Format id=...>` 복수 + `formatid` 전환 가능 |
| 삭제 행을 rowcount에서 셈 | 삭제 행은 `getDeletedRowCount()` 별도 |

---

## 10. 화면 1개 명세 추출 체크리스트

`.xfdl` 하나를 받으면 아래 순서로 채운다. 각 항목은 **소스 위치(XML 요소 id / 함수명)** 를 함께 적는다.

### A. 기본 정보
- [ ] 파일 경로, Form `id`, `titletext`, 크기(width/height)
- [ ] 이 화면을 여는 진입점(메뉴 데이터, 다른 화면의 `go()`/showModal/ChildFrame `formurl`)
- [ ] `include` 목록과 include 체인 전체

### B. Dataset · 컬럼
- [ ] Objects 내 Dataset 전체: id, 컬럼(id·type·size), 정적 Rows 유무
- [ ] 용도 분류: 조회조건 / 목록 / 상세 / 코드(콤보) / 저장용 / 임시
- [ ] appvariables.xml 전역 Dataset 참조 여부(세션·권한·코드 정보)
- [ ] Dataset 이벤트(`cancolumnchange`·`oncolumnchanged`·`onrowposchanged`) 로직

### C. transaction 호출표
| svcID | URL(Prefix 해석 후) | inDatasets(서버=폼) | outDatasets(폼=서버) | argument | 콜백 후처리 | 호출 트리거 |
|-------|-------------------|--------------------|---------------------|----------|------------|-------------|
- [ ] 래퍼 사용 시 래퍼가 덧붙이는 공통 인자·URL 규칙 반영
- [ ] nDataType·bAsync 명시값(있을 때)
- [ ] 저장 전 행 상태 필터링(ROWTYPE 2/4/8) 여부

### D. 버튼 · 이벤트
- [ ] Layout의 모든 이벤트 속성(`onclick`·`onchanged`·`onkeydown`·Form `onload`/`onbeforeclose` 등) → 핸들러 함수 → 하는 일
- [ ] 버튼별: 활성/비활성·표시 조건(권한·행 상태)

### E. Grid 기능
- [ ] Grid별 binddataset, Format 수와 전환 조건
- [ ] 컬럼별: 헤더 텍스트, 바인드 컬럼, displaytype, edittype(편집 가능 여부), 정렬, 너비
- [ ] suppress·셀 병합·다단 헤더, 합계(summary)·`expr:` 계산
- [ ] 트리(treelevel·treeinitstatus), 체크박스 선택, 헤더 클릭 정렬, 더블클릭 동작
- [ ] 엑셀 내보내기/가져오기(서버 URL·대상 Grid·시트)

### F. 팝업 흐름
- [ ] 열리는 팝업 목록: formurl, 전달 인자, 콜백 함수, 반환값 형식과 반영 로직
- [ ] 이 화면이 팝업으로 열리는 경우: 받는 인자, `close()` 반환값

### G. 검증 규칙
- [ ] 필수값·형식(mask·숫자·날짜)·길이 체크(저장/조회 전 함수, 공통 검증 함수 호출)
- [ ] `cancolumnchange`·`canrowposchange` 차단 규칙
- [ ] confirm 메시지·변경 여부 확인(`onbeforeclose`의 미저장 경고 등)

### H. 권한 처리
- [ ] 버튼 표시/활성 제어 코드와 권한 정보 원천(전역 Dataset·Variable·공통 함수)
- [ ] 서버 측에 맡기는 권한 체크인지 클라이언트만의 제어인지 구분(마이그레이션 시 클라이언트 전용 제어는 보안 통제로 간주하지 말 것)

### I. 공통 함수 의존
- [ ] 화면에서 호출하는 공통 함수 목록(이름·호출 위치·추정 역할)
- [ ] 공통 함수가 내부에서 부르는 transaction·팝업·메시지 → 화면 명세로 전개
- [ ] 전역 Variable·Cookie·HTTP Header(environment.xml) 의존
