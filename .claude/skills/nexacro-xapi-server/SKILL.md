---
name: nexacro-xapi-server
description: 넥사크로 17 화면과 통신하는 Java 서버(X-API·Spring 연동·nexacro-xeni 엑셀 모듈)를 읽고 유지보수·분석할 때 사용. HttpPlatformRequest→PlatformData→DataSet 흐름, 행 타입·원래값, ErrorCode/ErrorMsg, 14/17/N 패키지 차이, Jakarta jar, xeni 설정, 레거시 서버 분석 체크리스트.
---

# 넥사크로 17 서버 측 X-API · Spring 연동 · xeni 읽기 가이드

> 소스: https://docs.tobesoft.com/getting_started_nexacro_17_ko/d82e8b8cd262cb1a (X-API 화면 만들기, 17)
> 소스: https://docs.tobesoft.com/server_setup_guide_nexacro_17_en_kr/4fe8e637183e9fc4 (17 X-API 설치)
> 소스: https://docs.tobesoft.com/server_setup_guide_nexacro_n_v24_en/638d458b567ddda9 (N V24 X-API 설치, Jakarta jar)
> 소스: https://docs.tobesoft.com/admin_guide_nexacro_14_en_kr/ea2d0a940547e4a5 (Dataset XML 포맷)
> 소스: https://docs.tobesoft.com/xeni_user_manual_ko/42332e9efc1e46a3 (nexacro-xeni 매뉴얼)
> 검증일: 2026-10-08

이 스킬은 **마이그레이션 전 "현 백엔드 읽기"**용이다. 넥사크로 화면이 `transaction()`으로 보낸 요청을 Java 서버가 어디서 받고, 어떻게 Dataset을 풀고, 어디서 SQL을 부르고, 어떻게 응답하는지 추적하는 데 필요한 지식만 담는다.

---

## 1. 언제 사용 / 언제 사용하지 않을지

| 사용 | 사용하지 않음 |
|------|---------------|
| `com.nexacro17.xapi` / `com.nexacro.xapi` import가 있는 Java·JSP 코드 분석 | 넥사크로 클라이언트(XFDL·JS) 화면 스크립트 작성 |
| Spring 컨트롤러가 Dataset을 받는 구조 파악 | X-API 신규 도입 설계(라이선스·제품 버전 결정은 벤더 확인 필요) |
| `nexacro-xeni` 엑셀 export/import 서버 설정 파악 | xeni 확장 인터페이스(DRM 등) 구현 상세 |
| 레거시 서버 → 신규 스택 이관 전 엔드포인트·데이터 흐름 목록화 | 넥사크로 화면 자체의 마이그레이션 |

---

## 2. 제품 계열별 패키지·jar·라이선스 (가장 먼저 확인)

import 문 하나로 어느 계열인지 판별할 수 있다.

| 계열 | Java 패키지 | jar 파일 | 라이선스 파일 |
|------|------------|----------|---------------|
| 넥사크로플랫폼 14 | `com.nexacro.xapi.data.*`, `com.nexacro.xapi.tx.*` | (14 설치 가이드 기준) | (14 계열 라이선스) |
| 넥사크로플랫폼 17 | `com.nexacro17.xapi.data.*`, `com.nexacro17.xapi.tx.*` | `nexacro17-xapi-1.0.jar` 등 (`nexacro-xapi-x.x.x.jar` 표기) + `commons-logging-x.x.x.jar` | `nexacro17_server_license.xml` |
| 넥사크로 N (V24 가이드) | `com.nexacro.java.xapi.data.*`, `com.nexacro.java.xapi.tx.*` | `nexacro-xapi-java-x.x.x.jar` 또는 `nexacro-xapi-java-jakarta_x.x.x.jar` (+ 2.x 계열 `nexacro-xapi-java-main-2.x.x.jar`) + `commons-logging` + `json-simple` | `NexacroN_server_license.xml` |

공통 설치 규칙 (17·N 공식 설치 가이드):
- jar는 WAS의 `/WEB-INF/lib` 또는 정의된 classpath에 둔다.
- 라이선스 파일은 **jar와 같은 디렉터리** 또는 classpath에 둔다. 여러 경로에 있으면 jar와 같은 디렉터리의 것이 우선.
- jar 파일명에 버전이 들어가므로 구버전 jar를 지우지 않으면 엉뚱한 버전이 로드될 수 있다.
- 버전 확인: `java -jar nexacro17-xapi-1.0.jar` 실행 후 manifest의 `Implementation-Version` 확인 (또는 `com.nexacro17.xapi.util.JarInfo`).
- 요구 JDK: 17 가이드는 JDK/JRE 1.4+, N V24 가이드는 1.4+ (2.X.X 이상은 1.8+).

### Jakarta(Spring Boot 3) 관련

N V24 서버 가이드: "Versions **1.0.11** and later provide an X-API that can be used in WAS implemented with the Jakarta EE specification." 파일명은 `nexacro-xapi-java-jakarta_x.x.x.jar`.
→ `javax.servlet` → `jakarta.servlet` 네임스페이스를 쓰는 WAS(예: Tomcat 10+, Spring Boot 3)에서 X-API를 쓸 수 있는 jar가 **N 계열에는 존재**한다.

> 주의: 같은 벤더의 이전 N 가이드(server_setup_guide_nexacro_n_en)는 같은 문장을 "**1.0.12** and later"로 적는다. 문서 간 버전 표기가 불일치(DISPUTED)하므로 실제 배포 파일명으로 확인한다.
> 주의: Jakarta jar의 패키지는 `com.nexacro.java.xapi`(N 계열)이다. **17 계열 라이선스(`nexacro17_server_license.xml`)로 N 계열 Jakarta jar를 써도 되는지는 미확인**이다. 17 화면 + Spring Boot 3 공존은 "가능성"일 뿐이며 벤더(투비소프트) 확인 전 전제로 삼지 않는다.
> 주의: N V24 가이드에는 Spring Boot 3에 대한 직접 언급이 없다. Spring Boot 3 호환은 Jakarta EE 지원에서 유추한 것이다.

---

## 3. 핵심 객체 (17 기준, `com.nexacro17.xapi`)

| 클래스 | 패키지 | 역할 |
|--------|--------|------|
| `PlatformData` | `data` | 요청/응답 전체 컨테이너. Dataset 목록 + 변수 목록 |
| `DataSet` | `data` | 2차원 표. 컬럼 정의 + 행 + 행 타입 + 원래값 |
| `DataSetList` | `data` | PlatformData 안의 Dataset 집합 |
| `VariableList` / `Variable` | `data` | 단일 값 파라미터 (ErrorCode, ErrorMsg, 검색조건 등) |
| `DataTypes` | `data` | 컬럼 타입 상수 (`DataTypes.STRING` 등) |
| `PlatformRequest` / `HttpPlatformRequest` | `tx` | 입력 스트림/HTTP 요청에서 데이터 수신 |
| `PlatformResponse` / `HttpPlatformResponse` | `tx` | 출력 스트림/HTTP 응답으로 데이터 송신 |
| `PlatformType` | `tx` | 콘텐츠 타입 상수 (`CONTENT_TYPE_XML`, `CONTENT_TYPE_BINARY`) |
| `PlatformException` | `tx` | 송수신 예외 |

---

## 4. 요청 → 응답 기본 흐름

공식 예제(`save_list.jsp` 계열)를 17 패키지로 정리한 일반 형태다. 서블릿·JSP·Spring 어디에 있든 이 6줄이 핵심이며, 레거시 코드에서 이 호출을 찾으면 넥사크로 진입점이다.

```java
import com.nexacro17.xapi.data.*;
import com.nexacro17.xapi.tx.*;

// 1) 수신
HttpPlatformRequest req = new HttpPlatformRequest(request);   // HttpServletRequest
req.receiveData();
PlatformData inData = req.getData();

// 2) 꺼내기
DataSet ds = inData.getDataSet("dsCustomers");                // 화면 transaction의 inDatasets 이름
VariableList inVars = inData.getVariableList();

// 3) 처리 (DAO/Service/SQL 호출)
int nErrorCode = 0;
String strErrorMsg = "SUCC";
// ...

// 4) 응답 조립
PlatformData outData = new PlatformData();
// outData.addDataSet(resultDs);
VariableList outVars = outData.getVariableList();
outVars.add("ErrorCode", nErrorCode);
outVars.add("ErrorMsg", strErrorMsg);

// 5) 송신
HttpPlatformResponse res = new HttpPlatformResponse(response, PlatformType.CONTENT_TYPE_XML, "UTF-8");
res.setData(outData);
res.sendData();
```

결과 Dataset 생성(공식 initdata 예제):

```java
DataSet ds = new DataSet("customers");
ds.addColumn("id", DataTypes.STRING, 4);
ds.addColumn("name", DataTypes.STRING, 16);
int row = ds.newRow();
ds.set(row, "id", "TC-001");
ds.set(row, "name", "Harry A. Brown");
outData.addDataSet(ds);
```

파일/스트림 직렬화(공식 예제): `new PlatformResponse(outputStream, PlatformType.CONTENT_TYPE_BINARY)` / `new PlatformRequest(inputStream, PlatformType.CONTENT_TYPE_BINARY)`.

> 주의: `PlatformType.CONTENT_TYPE_XML`·`CONTENT_TYPE_BINARY`는 공식 예제에서 확인했다. SSV·JSON 등 다른 콘텐츠 타입 상수명은 **미검증** — 코드에서 발견되면 jar의 `PlatformType` 클래스를 직접 확인한다.
> 주의: Variable/Dataset 값 읽기 메서드(`getString`, `getObject` 등)의 정확한 시그니처는 공식 공개 문서에서 확인하지 못했다(미검증). 레거시 코드에 있는 호출을 그대로 읽고, 새로 작성할 때는 jar의 javadoc/IDE로 확인한다.

### ErrorCode / ErrorMsg 규약

- 응답 `VariableList`에 `ErrorCode`(int)와 `ErrorMsg`(string)를 담는다.
- 공식 Dataset XML 문서 기준: **음수 = 실패, 0 이상 = 성공**. 클라이언트 `transaction` 콜백이 이 값으로 성공/실패를 분기한다.
- 레거시 분석 시 "예외를 catch해서 ErrorCode=-1 + 메시지"로 내려주는 공통 처리 위치(인터셉터·공통 컨트롤러·AOP)를 반드시 찾는다.

---

## 5. Dataset 행 타입과 원래값 (저장 로직 읽기의 핵심)

### 5-1. 전송 포맷 (Dataset XML)

```xml
<Root xmlns="http://www.nexacroplatform.com/platform/dataset" ver="4000">
  <Parameters>
    <Parameter id="ErrorCode" type="int">0</Parameter>
    <Parameter id="ErrorMsg" type="string">SUCC</Parameter>
  </Parameters>
  <Dataset id="dsCustomers">
    <ColumnInfo>
      <Column id="id" type="STRING" size="4"/>
      <Column id="name" type="STRING" size="16"/>
    </ColumnInfo>
    <Rows>
      <Row type="insert"><Col id="id">TC-002</Col><Col id="name">New</Col></Row>
      <Row type="update">
        <Col id="id">TC-001</Col><Col id="name">Changed</Col>
        <OrgRow><Col id="id">TC-001</Col><Col id="name">Original</Col></OrgRow>
      </Row>
      <Row type="delete"><Col id="id">TC-003</Col><Col id="name">Gone</Col></Row>
    </Rows>
  </Dataset>
</Root>
```

- 행 타입: `insert` / `update` / `delete` (type 없음 = 변경 없는 정상 행).
- `update` 행은 `<OrgRow>`에 **수정 전 원래값**을 함께 보낸다 → 서버의 `WHERE` 조건(원래 PK)이나 낙관적 잠금에 쓰인다.
- 컬럼 타입: STRING, INT, FLOAT, DECIMAL, BIGDECIMAL, DATE(YYYYMMDD), DATETIME(YYYYMMDDHHmmssuuu), TIME(HHmmssuuu), BLOB.
- `ConstColumn`은 모든 행에 같은 고정값을 가진다.

> 주의: 컬럼 타입 목록·날짜 포맷과 ErrorCode 부호 규칙은 14 관리자 가이드(1순위) 단일 소스 기준이다. 17 실제 응답 XML로 한 번 대조한다.

### 5-2. Java에서 행 타입 읽기

```java
for (int i = 0; i < ds.getRowCount(); i++) {
    int rowType = ds.getRowType(i);
    if (rowType == DataSet.ROW_TYPE_NORMAL) continue;  // 변경 없음
    // insert / update 분기 → INSERT / UPDATE SQL
    if (ds.hasSavedRow(i)) {
        Object orgVal = ds.getSavedData(i, 0);           // 원래값(OrgRow) — 컬럼 인덱스
    }
}
// 삭제된 행은 일반 행 목록에 없고 별도 버퍼에 있다
for (int r = 0; r < ds.getRemovedRowCount(); r++) {
    Object val = ds.getRemovedData(r, 0);                // → DELETE SQL
}
```

> 주의: 위 메서드(`getRowType`, `ROW_TYPE_NORMAL`, `ROW_TYPE_DELETED`, `hasSavedRow`, `getSavedData`, `getRemovedRowCount`, `getRemovedData`)는 **14 계열 커뮤니티 라이브러리(nexacro-spring/nexacro-core) 소스에서만 확인**했다(낮은 신뢰도). 17 jar에서도 동일한지, 그리고 INSERT/UPDATE 상수명(`ROW_TYPE_INSERTED`/`ROW_TYPE_UPDATED` 등)은 **미검증** — 레거시 코드의 실제 사용을 그대로 따르고 jar로 확인한다.

**흔한 분석 실수**: `getRowCount()` 루프만 보고 "삭제 처리가 없다"고 결론 내리는 것. 삭제 행은 removed 버퍼에 있으므로 `getRemovedRowCount`류 호출이나 공통 변환 클래스의 삭제 처리 부분을 따로 찾아야 한다.

---

## 6. Spring 연동 패턴 (레거시에서 보이는 형태)

레거시 Spring 서버는 보통 아래 둘 중 하나다. 어느 쪽인지 먼저 판별한다.

### 6-1. 공통 변환 클래스 방식 (직접 구현)

컨트롤러가 `HttpServletRequest`를 받아 공통 유틸로 X-API를 감싼다.

```java
@RequestMapping("/customer/save.do")
public void save(HttpServletRequest request, HttpServletResponse response) throws Exception {
    PlatformData in = NexacroUtil.receive(request);                 // 내부: HttpPlatformRequest + receiveData + getData
    List<Map<String, Object>> rows = NexacroUtil.toMapList(in.getDataSet("dsCustomers")); // 행타입 → 맵 키로 변환
    customerService.save(rows);
    NexacroUtil.send(response, new PlatformData(), 0, "SUCC");      // 내부: ErrorCode/ErrorMsg + HttpPlatformResponse
}
```
(`NexacroUtil`은 설명용 가상 이름이다. 실제 이름은 프로젝트마다 다르다.)

찾을 것: `HttpPlatformRequest`를 `new` 하는 유일한 위치, Dataset→`List<Map>`/DTO 변환 메서드, 행 타입을 맵에 넣는 키 이름(예: `_rowType_` 같은 관례), 응답 공통 메서드.

### 6-2. ArgumentResolver 방식 (라이브러리)

`HandlerMethodArgumentResolver` / `HandlerMethodReturnValueHandler`를 등록해 컨트롤러 파라미터로 바로 받는다. 커뮤니티 라이브러리 `nexacro-spring/nexacro-core`(14 계열, `com.nexacro.spring`) 구조 예:

| 구성 요소 | 역할 |
|-----------|------|
| `NexacroMethodArgumentResolver` | `PlatformData`, `DataSetList`, `VariableList`, `HttpPlatformRequest/Response`를 파라미터로 주입, `@ParamDataSet`·`@ParamVariable`로 `DataSet`·`List<Map>`·`List<VO>`·기본형 변환 |
| `@ParamDataSet(name="ds", required=true)` | Dataset → List/POJO 변환. `required` 기본 `true`(없으면 예외) |
| `@ParamVariable` | Variable → 기본형 변환 |
| `NexacroResult` | 반환 객체. `addDataSet(name, List)`, `addVariable(name, obj)`, `setErrorCode(int)`, `setErrorMsg(String)` |
| `NexacroHandlerMethodReturnValueHandler` | `NexacroResult` → X-API 응답 변환 |
| `NexacroMappingExceptionResolver` | 예외 → ErrorCode/ErrorMsg 응답 |
| `DataSetRowTypeAccessor` / `DataSetSavedDataAccessor` | 행 타입·원래값을 VO에 실어 나르는 인터페이스 |

```java
@RequestMapping("/customer/save.do")
public NexacroResult save(@ParamDataSet(name = "dsCustomers") List<Map<String, Object>> rows) {
    customerService.save(rows);
    return new NexacroResult();
}
```

> 주의: **Spring 연동 라이브러리 신뢰도 낮음.** nexacro-spring/nexacro-core는 GitHub Stars 10, 마지막 커밋 2017-06-19, xapi 의존성 `com.nexacro:nexacro-xapi:1.0`(14 계열 `com.nexacro.xapi` 패키지)이다. 투비소프트는 별도로 "uiadapter"라는 Spring 연동 모듈을 제공하는 것으로 보이나(xeni 매뉴얼의 `xeni.multipart.proc` 설명에서 언급, 아키타입 좌표는 미검증) 그 공개 문서 본문은 확인하지 못했다. 레거시 코드의 클래스명이 위 표와 비슷해도 **실제 jar/소스를 기준으로 읽는다.**
> 주의: **전자정부 표준프레임워크 연동 가이드 본문 미확인.** 투비소프트 기술노트는 eGovFrame 위키의 "UI Adaptor" 문서로 링크만 걸어두며 본문은 확인하지 못했다. 전자정부 기반 레거시라면 eGovFrame 쪽 UI Adaptor 설정(XML 빈 등록)을 함께 찾는다.

---

## 7. nexacro-xeni (엑셀 export/import 서버 모듈)

- 정의: 넥사크로플랫폼 `ExcelExportObject`/`ExcelImportObject` 기능을 처리하는 **별도 서버 모듈(WAR)**. Apache POI 기반.
- 배포: `nexacro-xeni.war`를 WAS에 배포(자동 전개 또는 수동 전개 + context path 설정). 라이선스 파일(X-API 라이선스)을 `nexacro-xeni/WEB-INF/lib`에 둔다. 파일명에 `_jakarta_`가 있는 배포본은 Jakarta EE WAS용.
- 설치 확인: 브라우저로 접근 시 `ErrorCode(-2006) ErrorMsg(Input data does not exist. ...)` 응답이면 정상.
- 버전 확인: `nexacro-xeni/META-INF/MANIFEST.MF`.
- 17 매뉴얼 기준 버전: "넥사크로플랫폼 17 nexacro-xeni 20200103", 포함 POI **3.10-FINAL**(poi, poi-scratchpad, poi-ooxml, poi-ooxml-schemas) + commons-codec/fileupload/io/logging, dom4j, log4j, stax-api, xmlbeans, nexacro-xapi. 버전별로 라이브러리 목록이 다르다.

### 엔드포인트

클라이언트 예제: `exportObj.set_exporturl("http://127.0.0.1:8080/nexacro-xeni/XExportImport")`. import는 `/XImport` 경로도 존재(14 관리자 가이드).

> 주의: **xeni 서블릿 클래스명 미확인(17 기준).** 14 관리자 가이드는 `XExportImport`·`XImport` 두 서블릿 모두 `com.nexacro.xeni.services.GridExportImportServlet`로 정의하지만, 17 xeni 매뉴얼의 web.xml 페이지는 servlet 요소를 보여주지 않는다. 17 배포본의 `web.xml`을 직접 열어 확인한다.

### web.xml `<context-param>` (xeni 매뉴얼)

| param-name | 기본값 | 의미 |
|------------|--------|------|
| `export-path` | `/export` | export 파일 저장 경로 |
| `import-path` | `/import` | import 임시 파일 경로 |
| `import-temp-name` | `true` | 임시 파일명을 `import_temp`로 고정 |
| `monitor-enabled` | `true` | 임시 파일 자동 정리 |
| `monitor-cycle-time` | `30` | 정리 주기(분, `30/sec` 형식으로 초 지정 가능) |
| `file-storage-time` | `10` | 임시 파일·chunked data 보관 시간(분) |
| `csv-quote` | `true` | 텍스트 처리 시 따옴표 사용 |

### xeni.properties (선택)

위치: `WEB-INF/classes`, `WEB-INF/lib`, 또는 CLASSPATH.

| 키 | 의미 |
|----|------|
| `xeni.exportimport.storage` | `XeniExcelDataStorageBase` 구현 클래스 — 임시파일 대신 DB 등 저장소 사용 |
| `xeni.multipart.proc` | `XeniMultipartProcBase` 구현 클래스 — Spring 등 프레임워크의 multipart 처리 연동(uiadapter와 함께) |

> 주의: 매뉴얼은 xeni.properties 설명이 N 기준이며 14·17.1은 확장 인터페이스 문서를 참조하라고 한다. 17 버전에서 동일 키가 동작하는지는 배포본으로 확인한다.

### 지원 포맷

| 포맷 | 확장자 | 지원 |
|------|--------|------|
| Excel 97-2003 | xls | Export / Import |
| Excel 2007/2010 | xlsx | Export / Import |
| CSV | csv | Import 전용 |
| 한셀 2010 | cell | Export 전용 |
| 한셀 2014 | cell | Export / Import |

---

## 8. 레거시 서버 분석 체크리스트

이관 전 "현 백엔드 읽기" 순서. 각 항목의 결과를 표로 남긴다.

1. **계열 판별** — `grep -r "com.nexacro17.xapi\|com.nexacro.xapi\|com.nexacro.java.xapi"`로 import 계열 확인. `WEB-INF/lib`의 jar 파일명·라이선스 파일명 기록.
2. **진입점 찾기** — `new HttpPlatformRequest(` / `receiveData(` 호출 위치. 1곳(공통 유틸)인지, 컨트롤러마다 있는지. JSP 파일에 직접 있는 경우도 확인.
3. **Spring 연동 방식** — `HandlerMethodArgumentResolver` 구현체, `@ParamDataSet`류 어노테이션, `NexacroResult`류 반환 타입, 전자정부 UI Adaptor 설정 존재 여부.
4. **URL 매핑 목록** — `@RequestMapping`/`*.do` 매핑과 넥사크로 화면의 `transaction("id", "svc::path.do", "in=ds", "out=ds", args, callback)` 대응표. 서비스 URL prefix(TypeDefinition의 Services)도 같이 기록.
5. **Dataset ↔ DTO/Map 변환 위치** — 변환 유틸/컨버터 클래스, 행 타입을 무엇으로 표시하는지(맵 키·VO 필드), OrgRow(원래값)를 쓰는지, **삭제 행(removed 버퍼) 처리 위치**.
6. **SQL 호출 위치** — 서비스 → DAO → MyBatis/iBATIS mapper 또는 JDBC. 행 타입별 insert/update/delete 분기가 서비스에 있는지 mapper에 있는지.
7. **에러 규약** — ErrorCode/ErrorMsg를 세팅하는 공통 위치(예외 리졸버·인터셉터·AOP), 음수 코드 체계.
8. **응답 콘텐츠 타입** — `PlatformType.CONTENT_TYPE_*`와 문자셋(`"UTF-8"` 등). 화면이 기대하는 포맷과 일치하는지.
9. **xeni 사용 여부** — `nexacro-xeni` WAR 별도 배포 여부, `exporturl`/`importurl`, web.xml context-param, xeni.properties 확장 클래스(DB 저장·multipart).
10. **런타임 제약** — JDK 버전, `javax.servlet` vs `jakarta.servlet`. Spring Boot 3 이관을 검토한다면 Jakarta jar(N 계열)·라이선스 문제를 벤더에 먼저 확인.

---

## 9. 흔한 실수

| 실수 | 바른 방법 |
|------|-----------|
| 14 예제(`com.nexacro.xapi`)를 17 코드에 그대로 붙임 | 17은 `com.nexacro17.xapi`, N은 `com.nexacro.java.xapi` — import 계열을 맞춘다 |
| 새 jar를 넣고 구버전 jar를 남김 | 파일명에 버전이 있으므로 구버전 삭제 후 WAS 재기동 |
| 라이선스 파일을 엉뚱한 경로에 둠 | jar와 같은 디렉터리(우선) 또는 classpath |
| `getRowCount()` 루프만 보고 삭제 처리 누락 판단 | removed 버퍼 처리(공통 변환기 포함)를 따로 확인 |
| update 시 현재값으로 WHERE 작성 | PK 변경 가능 화면이면 OrgRow(원래값) 사용 여부 확인 |
| ErrorCode를 안 내려 화면 콜백이 성공으로 처리 | 실패 시 음수 ErrorCode + ErrorMsg |
| "Jakarta jar가 있으니 17 + Spring Boot 3 가능"으로 단정 | N 계열 jar이며 17 라이선스 호환 미확인 → 벤더 확인 |
