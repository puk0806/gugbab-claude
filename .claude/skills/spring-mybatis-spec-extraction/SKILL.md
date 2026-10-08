---
name: spring-mybatis-spec-extraction
user-invocable: false
description: Java Spring(Boot 1.x~3.x·Spring MVC)·MyBatis 3/iBATIS 2 레거시 백엔드에서 API 명세·데이터 사용 명세(SQL ID·테이블·CRUD 매트릭스)·배치/외부 연동 목록을 기계적으로 뽑는 방법 - 매핑 어노테이션과 클래스 prefix 합성, web.xml 서블릿·필터 매핑, 넥사크로 X-API(Dataset 본문) 표시법, Actuator mappings(Boot 2+ /actuator/mappings, 1.x /mappings), springdoc 버전 대응과 빌드 시 OpenAPI 생성 플러그인, 매퍼 XML 파싱(namespace.id·FROM/JOIN/INTO/UPDATE·동적 SQL "추정"·include·프로시저), iBATIS sqlMap 차이, 매퍼 인터페이스↔XML·서비스→매퍼 추적, CRUD 매트릭스, @Scheduled·Quartz·Spring Batch·RestTemplate/WebClient/Feign 목록, 실행 검증한 읽기 전용 스크립트. 양식·규약은 spec-extraction-method를 따른다
---

# Spring · MyBatis/iBATIS 레거시 스펙 추출

> 소스: https://docs.spring.io/spring-boot/api/rest/actuator/mappings.html
> 소스: https://docs.spring.io/spring-boot/reference/actuator/endpoints.html
> 소스: https://docs.spring.io/spring-boot/docs/1.5.x/reference/html/production-ready-endpoints.html
> 소스: https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html
> 소스: https://docs.spring.io/spring-framework/reference/integration/scheduling.html
> 소스: https://springdoc.org/ · https://springdoc.org/v1/
> 소스: https://github.com/springdoc/springdoc-openapi-maven-plugin · https://github.com/springdoc/springdoc-openapi-gradle-plugin
> 소스: https://mybatis.org/mybatis-3/sqlmap-xml.html · https://mybatis.org/mybatis-3/dynamic-sql.html · https://mybatis.org/mybatis-3/getting-started.html
> 소스: https://mybatis.org/spring/batch.html
> 소스: https://github.com/mybatis/ibatis2mybatis/wiki · https://ibatis.apache.org/dtd/sql-map-2.dtd
> 검증일: 2026-10-08

---

## 0. 범위 — 무엇을 여기서, 무엇을 다른 스킬에서

| 질문 | 담당 (이 스킬·`spec-extraction-method` 외에는 설치된 경우) |
|------|------|
| 무엇을 어떤 양식(근거 `파일:줄`·확신도·사용 여부)·순서로 남기나, CRUD 완전성 규칙, LLM 추출 규약 | **`spec-extraction-method`** — 먼저 Read하고 그 7절 양식 그대로 산출 |
| Spring·MyBatis/iBATIS 코드에서 **실제로 어떻게 뽑나** (grep·스크립트·실행 시 추출) | **이 스킬** |
| springdoc 설정·어노테이션 자체 | `springdoc-openapi-3` |
| Springfox(`@EnableSwagger2`·Docket) 설정 | `swagger-springfox-2` |
| 매퍼 XML 문법·동적 SQL 작성법 | `mybatis-mapper-patterns` |
| 넥사크로 X-API 서버 객체(PlatformData·DataSet·행 타입) | `nexacro-xapi-server` |
| iBATIS → MyBatis 이관 | `ibatis-to-mybatis-migration` (설치된 경우) |
| 뽑은 동작을 테스트로 고정 | `characterization-testing` (설치된 경우) |

이 스킬은 **소스를 바꾸지 않는다.** 모든 명령·스크립트는 읽기 전용이다.

---

## 1. 산출물과 순서

```
[인벤토리]  ① API 목록(정적)  ② API 목록(실행 시)  → 차이 대조
            ③ SQL 인벤토리(매퍼 XML + XML 밖 SQL)
            ④ 배치·스케줄러 목록   ⑤ 외부 연동 목록
[연결]      ⑥ API → 서비스 → SQL ID 추적표
[데이터]    ⑦ CRUD 매트릭스(프로세스 × 테이블) + 완전성 점검
[명세]      ⑧ spec-extraction-method 7-2(API)·7-3(데이터)·7-5(배치·연동) 표로 옮김
```

- ①~⑤는 **목록만** 기계적으로 뽑는다(설계 복원 금지). ⑥부터 사람·LLM 판단이 섞이므로 확신도를 매긴다.
- 스크립트 3종(매핑 인벤토리·SQL 인벤토리·CRUD 매트릭스) 전문 → [`references/extract-scripts.md`](references/extract-scripts.md)

---

## 2. 정적 추출 — API 목록

### 2-1. 매핑 어노테이션 grep (1차 훑기)

```bash
# 컨트롤러 파일 수 / 매핑 어노테이션 수 — 규모 파악
grep -rlE '@(Rest)?Controller\b' --include='*.java' src/main/java | wc -l
grep -rnE '@(Request|Get|Post|Put|Delete|Patch)Mapping\b' --include='*.java' src/main/java | wc -l

# 매핑 줄 + 근거(파일:줄)
grep -rnE '@(Request|Get|Post|Put|Delete|Patch)Mapping\b' --include='*.java' src/main/java

# 경로가 상수인 매핑 (수동 치환 대상) — 연결식("/a" + X)은 스크립트 CONCAT 플래그로
grep -rnE '@(Request|Get|Post|Put|Delete|Patch)Mapping\((value *= *|path *= *)?[A-Za-z_][A-Za-z0-9_.]*[[:space:]]*[,)]' --include='*.java' src/main/java
```

- `@GetMapping`·`@PostMapping`·`@PutMapping`·`@DeleteMapping`·`@PatchMapping`은 Spring 4.3에서 추가된 `@RequestMapping(method=...)`의 합성 어노테이션이다. Spring 4.2 이하 레거시는 `@RequestMapping(value=..., method=RequestMethod.X)`만 보인다.
- `path`는 4.2부터 `value`의 별칭(`@AliasFor`)이다. 두 속성 모두 잡아야 한다.
- `method`가 없는 `@RequestMapping`은 **모든 HTTP 메서드**에 매칭된다 → 표에는 `ANY`로 쓰고 사용 여부 확인 시 실제 메서드를 로그로 채운다.

### 2-2. 클래스 레벨 prefix 합성 — grep으로는 안 된다

공식 문서 예: 클래스 `@RequestMapping("/persons")` + 메서드 `@GetMapping("/{id}")` → `GET /persons/{id}`. 줄 단위 grep은 두 줄을 합치지 못하므로 **파일 단위 파싱**이 필요하다.

```bash
python3 -I ~/spec-tools/mapping_inventory.py <대상레포>/src/main/java > api-inventory.tsv
# 출력: http_method  path  handler  file:line  flags(CONST·CONCAT·IFACE·XAPI)
```

합성 규칙(스크립트가 하는 일 = 사람이 손으로 할 때도 같은 규칙):

| 상황 | 결과 |
|------|------|
| 클래스 `{"/a","/b"}` × 메서드 `"/x"` | `/a/x`, `/b/x` 두 행 (데카르트 곱) |
| 메서드에 경로 없음(`@PostMapping`) | 클래스 경로 그대로 |
| `method = {GET, POST}` | 메서드별로 행 분리 |
| 경로 상수(`Urls.ORDER`) | `<상수:Urls.ORDER>` + `CONST` → 상수 파일 열어 치환 |
| 인터페이스에 매핑, 구현 클래스는 `@RestController`만 | `IFACE` → 구현 클래스로 핸들러 정정 |

> 주의: 같은 요소에 `@RequestMapping` 계열을 둘 이상 붙이면 Spring은 **첫 번째만 쓰고 경고를 남긴다**(공식 문서). 코드에 둘이 보이면 둘 다 명세에 쓰지 말고 첫 번째만 "확인됨", 나머지는 "미사용(무시됨)"으로 표기한다.

### 2-3. 어노테이션 밖의 진입점 — 놓치기 쉬운 것

```bash
# web.xml 서블릿·필터 매핑 (DispatcherServlet 외 서블릿, 확장자 매핑 *.do 등)
grep -n -A4 -E '<servlet-mapping>|<filter-mapping>' src/main/webapp/WEB-INF/web.xml

# 서블릿 3.0 어노테이션 / Boot 코드 등록
grep -rnE '@WebServlet|@WebFilter|ServletRegistrationBean|FilterRegistrationBean' --include='*.java' src/main/java

# XML 기반 핸들러 매핑 (어노테이션 이전 스타일, 뷰 컨트롤러)
grep -rnE 'BeanNameUrlHandlerMapping|SimpleUrlHandlerMapping|<bean[^>]+name="/|mvc:view-controller' --include='*.xml' src/main

# 코드로 동적 등록 / Spring 6 @HttpExchange 컨트롤러
grep -rnE 'registerMapping\(|@HttpExchange|@(Get|Post|Put|Delete|Patch)Exchange' --include='*.java' src/main/java
```

서블릿 URL 패턴 해석(서블릿 스펙): **정확 일치 → 가장 긴 경로 prefix(`/a/*`) → 확장자(`*.do`) → 기본 서블릿(`/`)** 순으로 먼저 맞는 하나가 선택된다. `*.do`로 매핑된 DispatcherServlet이면 API 명세의 URL에 `.do`까지 그대로 적는다. 필터는 API가 아니지만 인증·인코딩·로깅 동작의 근거이므로 API 명세의 `인증` 칸 근거로 쓴다.

### 2-4. 요청·응답 스키마 칸 채우기

| 코드 형태 | 명세 표기 | 확신도 |
|------|------|------|
| `@RequestBody OrderDto` | DTO 필드 목록(필드·타입·검증 어노테이션) | 확인됨 |
| `@RequestParam`·`@PathVariable`·`@RequestHeader` | 이름·필수 여부(`required`)·기본값 | 확인됨 |
| `@ModelAttribute`/어노테이션 없는 VO 파라미터 | VO 필드 = 쿼리/폼 파라미터 | 확인됨 |
| `Map<String,Object>`·`HttpServletRequest.getParameter("x")` | 코드에서 꺼내는 키를 모두 나열 | 키 누락 가능 → **추정** |
| 응답 `ResponseEntity<?>`·`Object`·`ModelAndView` | 실제 반환 지점 전부 확인 | 추정 |

### 2-5. 넥사크로 X-API 컨트롤러 표시법 (요청 본문이 Dataset)

`flags`에 `XAPI`가 붙은 핸들러는 JSON DTO가 아니라 **PlatformData(Dataset 목록 + Variable 목록)** 를 주고받는다. 객체 구조와 행 타입은 `nexacro-xapi-server` 스킬(설치된 경우 — nexacro 템플릿)이 기준이다. API 명세(7-2)에는 아래처럼 적는다.

```markdown
| 칸 | 값 |
|------|------|
| 메서드+URL | POST /order/saveOrder.do (전송 포맷: 넥사크로 XML/SSV — 응답 Content-Type 근거 줄 명시) |
| 요청 | Dataset `ds_order`(컬럼: ORDER_ID STRING(20), QTY INT …, **행 타입 사용: insert/update/delete**) · Variable `searchYm` |
| 응답 | Dataset `ds_result`(컬럼 …) · ErrorCode/ErrorMsg (실패 시 음수 코드) |
| 행 타입 처리 | insert→`OrderMapper.insertOrder`, update→`updateOrder`, delete(removed 버퍼)→`deleteOrder` |
| 근거 | OrderController.java:42, NexacroConverter.java:88 |
```

- Dataset 이름·컬럼은 **서버 코드의 `getDataSet("ds_x")`·컨버터 매핑**과 **화면 `transaction()`의 in/out 인자** 양쪽에서 확인해야 "확인됨"이다. 한쪽만 보면 "추정".
- 공통 컨버터가 Dataset을 `Map`/VO로 바꾸는 구조면 컬럼 목록은 컨버터가 아니라 **그 뒤 매퍼 SQL의 `#{}` 파라미터**에서 역으로 확정한다.

> 주의(추정): springdoc·Springfox는 `HttpServletRequest`를 직접 파싱하는 X-API 핸들러의 Dataset 구조를 알 수 없으므로, 3절의 OpenAPI 생성 결과에는 이 엔드포인트가 **URL만 있고 본문 스키마가 빈 상태**로 나올 것으로 본다(실행 검증 안 함). X-API 엔드포인트의 요청·응답 칸은 정적 추출로만 채운다.

---

## 3. 실행 시 추출 — 앱이 실제로 등록한 매핑

정적 추출은 프로파일·조건부 빈(`@ConditionalOn…`, `@Profile`)을 모른다. 실행 시 추출은 **실제로 등록된 것**만 보여 주지만, 비활성 프로파일의 컨트롤러는 빠진다. **둘 다 뽑아 차이를 대조**하는 것이 원칙이다(3-4).

### 3-1. Spring Boot Actuator `mappings`

| Boot | 경로 | 노출 조건 |
|------|------|------|
| 2.x ~ 4.x | `GET /actuator/mappings` (base path: `management.endpoints.web.base-path`, 기본 `/actuator`) | 기본 HTTP 노출은 `health`뿐(2.5+). `management.endpoints.web.exposure.include=mappings` 필요 |
| 1.5.x | `GET /mappings` (설명: "Displays a collated list of all `@RequestMapping` paths") | 기본 **sensitive=true** → 인증 필요. `management.context-path` 설정 시 그 아래로 이동 |

> 주의: Boot 2.0~2.4는 기본 HTTP 노출이 `health`·`info`였고 2.5부터 `info`가 빠져 `health`만 남았다. 어느 버전이든 `mappings`는 명시적으로 열어야 한다. **운영 환경에서 열지 말고** 로컬·검증 환경에서만, 추출 후 설정을 되돌린다.

Boot 2+ 응답 구조(공식 API 문서): `contexts.<id>.mappings` 아래 `dispatcherServlets`(WebMVC) / `dispatcherHandlers`(WebFlux) / `servletFilters` / `servlets`. 디스패처 항목은 `handler`·`predicate`·`details.requestMappingConditions`(`methods`·`patterns`·`params`·`headers`·`consumes`·`produces`)를 가진다.

```bash
# WebMVC 매핑 → TSV (methods 빈 배열 = ANY)
curl -s http://localhost:8080/actuator/mappings | jq -r '
  .contexts[].mappings.dispatcherServlets // {} | .[][]
  | select(.details.requestMappingConditions)
  | .details.requestMappingConditions as $c
  | [ ($c.methods | if length == 0 then "ANY" else join(",") end),
      ($c.patterns | join(",")), .handler ] | @tsv' | sort > api-runtime.tsv

# 서블릿·필터 매핑 (web.xml·RegistrationBean 정적 결과와 대조)
curl -s http://localhost:8080/actuator/mappings | jq '.contexts[].mappings | {servlets, servletFilters}'
```

> 주의: Boot 1.5의 `/mappings` 응답은 2.x와 형식이 다르다 — `"{[/path],methods=[GET]}"` 같은 문자열 키 아래 `bean`·`method`(핸들러 메서드 시그니처)가 오는 평면 맵으로 알려져 있다(2차 소스·이슈 기준, 원문 예시 미확인). 위 jq는 1.5에 쓰지 말고 키 문자열을 정규식으로 파싱한다.

### 3-2. springdoc-openapi로 OpenAPI 문서 생성

| Spring Boot | springdoc-openapi | 의존성 예 |
|------|------|------|
| 1.5.x / 2.x | **v1** (OSS 마지막 1.8.0) | `org.springdoc:springdoc-openapi-ui` |
| 3.x | **v2** | `org.springdoc:springdoc-openapi-starter-webmvc-ui` (UI 불필요 시 `-webmvc-api`) |
| 4.x | **v3** | 아티팩트명 v2와 동일, 버전만 3.x |

- 기본 문서 경로 `/v3/api-docs`(JSON), `/v3/api-docs.yaml`(YAML). 설정·어노테이션은 `springdoc-openapi-3` 스킬(설치된 경우)로.
- 스펙 추출용이면 **UI 없는 api 아티팩트**로 충분하고, 추출 브랜치에서만 의존성을 추가한 뒤 되돌린다(레거시 본선 변경 금지 — 소스를 바꾸지 않는다는 0절 원칙의 예외이므로 별도 브랜치·사람 승인).

> 주의(DISPUTED): "Boot 1.x는 springdoc 미지원"이라는 통념과 달리, springdoc v1 공식 문서의 호환표는 모든 1.x 행에 Spring Boot `1.5.x`를 함께 적고 있다(예: `2.7.x, 1.5.x → 1.6.11+`). 다만 v1은 OSS 지원이 끝난 라인(1.8.0이 마지막 OSS 릴리스)이고 1.5 + springdoc 조합의 실제 기동은 이 스킬에서 검증하지 않았다. **Boot 1.3 이하는 호환표에 없다.** 레거시 1.x에서는 ① 이미 Springfox가 있으면 그 `/v2/api-docs`를 쓰고(`swagger-springfox-2` — 설치된 경우), ② 없으면 의존성을 새로 넣기보다 **정적 추출(2절) + Actuator `/mappings`(3-1)** 를 기본으로 한다.

**빌드 시 생성 (앱을 띄워서 문서를 받아 파일로 저장):**

```xml
<!-- Maven: spring-boot-maven-plugin start/stop + springdoc-openapi-maven-plugin generate, `mvn verify` -->
<plugin>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-maven-plugin</artifactId>
  <configuration><jvmArguments>-Dspring.application.admin.enabled=true</jvmArguments></configuration>
  <executions>
    <execution><id>pre-integration-test</id><goals><goal>start</goal></goals></execution>
    <execution><id>post-integration-test</id><goals><goal>stop</goal></goals></execution>
  </executions>
</plugin>
<plugin>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-maven-plugin</artifactId>
  <version><!-- Maven Central 최신 확인 --></version>
  <executions><execution><id>integration-test</id><goals><goal>generate</goal></goals></execution></executions>
  <!-- 기본값: apiDocsUrl=http://localhost:8080/v3/api-docs, outputFileName=openapi.json, outputDir=${project.build.directory} -->
</plugin>
```

```kotlin
// Gradle: 플러그인이 forkedSpringBootRun + generateOpenApiDocs 태스크 생성 → `gradle clean generateOpenApiDocs`
plugins {
    id("org.springframework.boot") version "<프로젝트 버전>"
    id("org.springdoc.openapi-gradle-plugin") version "1.9.0"
}
openApi { // 기본값: apiDocsUrl=http://localhost:8080/v3/api-docs, outputDir=$buildDir, outputFileName=openapi.json, waitTimeInSeconds=30
    outputFileName.set("openapi.json")
}
```

> 주의: Maven 플러그인 README는 `spring-boot-maven-plugin`에 JVM 인자 `-Dspring.application.admin.enabled=true`를 넣는 구성을 보여 준다(start/stop 골이 앱 기동 완료를 확인하는 데 쓰임). 두 플러그인 모두 **앱이 실제로 떠야** 하므로 DB·외부 시스템 연결이 필요한 레거시는 로컬 프로파일·테스트 DB를 먼저 준비한다. Gradle 플러그인은 Gradle 7.0+ 기준이다.

생성된 `openapi.json`에서 경로 목록만 뽑기:

```bash
jq -r '.paths | to_entries[] | .key as $p | .value | keys[] | select(test("^(get|post|put|delete|patch)$")) | "\(ascii_upcase)\t\($p)"' openapi.json | sort
```

### 3-3. 앱을 띄울 수 없을 때

DB 접속 불가·라이선스 서버 의존 등으로 기동이 안 되면 실행 시 추출은 건너뛰고, API 명세의 `확신도`를 정적 근거 기준으로만 매긴다. README에 "실행 시 대조 미수행"을 명시한다(spec-extraction-method 8절 "숨기지 않는다").

### 3-4. 정적 ↔ 실행 시 대조

```bash
cut -f1,2 api-inventory.tsv | sort -u > a.tsv     # 정적
cut -f1,2 api-runtime.tsv   | sort -u > b.tsv     # 실행 시
comm -23 a.tsv b.tsv   # 코드엔 있는데 등록 안 됨 → 프로파일/조건부 빈/죽은 코드 후보
comm -13 a.tsv b.tsv   # 등록됐는데 정적 목록에 없음 → 상수 경로·라이브러리 컨트롤러·동적 등록
```

> 주의: Boot 2.6+ 기본 경로 매처(PathPatternParser)와 정적 문자열은 표기가 다를 수 있다(예: 정규식 경로 변수, 끝 슬래시). 차이가 나면 둘 중 하나를 고치지 말고 행마다 원인을 적는다. Actuator·springdoc 자체 경로(`/actuator/**`, `/v3/api-docs/**`)와 `BasicErrorController`의 `/error`는 대조에서 제외한다.

---

## 4. 데이터 — MyBatis 매퍼 XML / iBATIS sqlMap 파싱

### 4-1. SQL ID 규칙

- MyBatis 3: **SQL ID = `namespace` + `.` + 문장 `id`**. 공식 문서상 namespace는 매퍼 인터페이스의 FQCN이며, 같은 이름의 메서드가 그 문장에 바인딩된다. 짧은 이름이 여러 namespace에 겹치면 MyBatis가 "모호하다"는 오류를 낸다 → 명세에는 **항상 전체 이름**을 쓴다.
- 최상위 요소: `cache`·`cache-ref`·`resultMap`·`parameterMap`(deprecated)·`sql`·`insert`·`update`·`delete`·`select`. 이 중 SQL 인벤토리 대상은 `select/insert/update/delete`(+ 참조되는 `sql` 조각).

```bash
python3 -I ~/spec-tools/mapper_inventory.py <대상레포>/src/main/resources > sql-inventory.tsv
# 출력: sql_id  tag  tables(이름:CRUD;…)  cond_tables  proc  dynamic  dollar  unresolved_include  file:line

# 수량 교차 확인 (스크립트 누락 탐지용)
grep -rhoE '<(select|insert|update|delete|statement|procedure)[[:space:]][^>]*id="[^"]+"' --include='*.xml' src/main/resources | wc -l
wc -l < sql-inventory.tsv
```

### 4-2. 테이블·CRUD 판정 규칙

| SQL 절 | 판정 |
|------|------|
| `INSERT INTO t` / Oracle `INSERT ALL INTO t1 … INTO t2` | t = **C** |
| `UPDATE t SET` (단 `FOR UPDATE`·MySQL `ON DUPLICATE KEY UPDATE` 뒤는 제외) | t = **U** |
| `DELETE [FROM] t` | t = **D** |
| `MERGE INTO t` | t = **C+U** (WHEN 절 확인 후 필요 시 D 추가) |
| `INSERT … ON DUPLICATE KEY UPDATE` | t = **C+U** |
| `FROM t`·`JOIN t`·`FROM a, b`·`USING t`(MERGE 원본)·서브쿼리 | t = **R** |
| `DUAL` | 제외 |

`<select>`인데 `FOR UPDATE`면 R로 두고 "잠금 조회" 메모, `<update>` 태그 안에 INSERT가 있는 식의 **태그-SQL 불일치**는 흔하므로 판정은 태그가 아니라 SQL 본문 기준으로 한다.

### 4-3. 동적 SQL — "추정" 표기 규칙

MyBatis 동적 요소: `if`·`choose/when/otherwise`·`trim/where/set`·`foreach`·`bind`(+ 어노테이션 매퍼의 `<script>`). 실행 경로마다 SQL이 달라지므로 정적 파싱으로는 **"이 SQL이 언제 어떤 테이블을 건드리는가"를 확정할 수 없다.**

| 상황 | 데이터 명세 표기 |
|------|------|
| 동적 태그 **밖**에 있는 테이블 | 확신도 확인됨 |
| 동적 태그 **안에서만** 나오는 테이블(`cond_tables` 칸) | 확신도 **추정** + `동적 조건` 칸에 `test` 식 원문(예: `itemName != null`) |
| `foreach` IN 목록 | 컬럼은 확인됨, 건수는 "가변" |
| `${…}` 문자열 치환(`dollar=Y`) — 특히 테이블·컬럼·ORDER BY | 대상 테이블 **미확인** + 호출부 파라미터 출처 추적. 보안 메모(인젝션 가능 지점) 별도 기록 |
| `choose`로 서로 다른 테이블 분기 | 분기별로 행을 나누고 각 행 추정 |

동적 SQL의 실제 경로를 확정하려면 실행 로그(MyBatis 로거 DEBUG의 Preparing 문)로 **사용 여부**와 함께 채운다.

### 4-4. `<sql>` / `<include>` 해석

- `<include refid="x"/>`는 같은 namespace의 `x`, 또는 `다른NS.x` 전체 이름을 가리킨다. 스크립트는 전 파일의 `<sql>` 조각을 모은 뒤 치환하고, 못 찾으면 `unresolved_include` 칸에 남긴다 → **미해결 조각이 있는 행은 테이블 목록이 불완전**하므로 "추정".
- `<include>` 안의 `<property name value>`로 조각 속 `${}`를 치환하는 패턴은 스크립트가 치환하지 않는다 → 원문 확인.

### 4-5. 프로시저 호출 표시

- MyBatis: `statementType="CALLABLE"` + `{call pkg.proc(#{a})}`. iBATIS 2: `<procedure>` 태그.
- 데이터 명세에는 CRUD 대신 **`P: <프로시저명>`** 으로 적고, 내부 테이블은 DB에서 프로시저 소스를 따로 뽑아 같은 규칙(4-2)으로 판정한다. 소스를 못 보면 "미확인" — 프로시저 안의 DML이 CRUD 매트릭스의 "C 없음" 원인인 경우가 많다.

### 4-6. XML 밖의 SQL — 반드시 별도 수집

```bash
# 어노테이션 SQL / Provider
grep -rnE '@(Select|Insert|Update|Delete)(Provider)?\(' --include='*.java' src/main/java
# Java 문자열 SQL·JdbcTemplate·JPA 네이티브 쿼리 혼재 여부
grep -rnE 'JdbcTemplate|NamedParameterJdbcTemplate|createNativeQuery|@Query\(' --include='*.java' src/main/java
grep -rniE '"[[:space:]]*(select|insert[[:space:]]+into|update|delete[[:space:]]+from)[[:space:]]' --include='*.java' src/main/java
```

`@SelectProvider`는 SQL을 Java 메서드가 조립하므로 동적 SQL과 같은 "추정" 규칙을 적용한다.

### 4-7. iBATIS 2 sqlMap 차이

| 항목 | MyBatis 3 mapper | iBATIS 2 sqlMap |
|------|------|------|
| 루트 / DTD | `<mapper namespace>` / mybatis-3-mapper.dtd | `<sqlMap namespace>`(**선택**) / sql-map-2.dtd |
| 문장 태그 | select·insert·update·delete | 위 4개 + **`<statement>`(종류 무관)** + **`<procedure>`** |
| 파라미터 | `#{prop}` / `${prop}` | `#prop#` / `$prop$` (`#prop:VARCHAR#` 형태도) |
| 타입 속성 | parameterType·resultType | parameterClass·resultClass |
| 동적 태그 | if·choose·where·set·trim·foreach·bind | `<dynamic prepend>`·`<iterate>`·`isNull/isNotNull`·`isEmpty/isNotEmpty`·`isEqual/isNotEqual`·`isGreaterThan/…`·`isPropertyAvailable`·`isParameterPresent` 등 |
| ID 호출 | `ns.id` 또는 매퍼 인터페이스 메서드 | `useStatementNamespaces` 설정이 true면 `ns.id`, 아니면 **`id`만** |
| Spring 연동 | mybatis-spring `SqlSessionTemplate`·매퍼 인터페이스 | `SqlMapClientTemplate`/`SqlMapClientDaoSupport` (Spring 3.2 deprecated, **4.0에서 제거**) |

> 주의(미검증): `useStatementNamespaces` 값에 따른 호출 ID 형태(true=`ns.id`, false=`id`)는 iBATIS 2 개발자 가이드 원문을 직접 열람하지 못했다(ibatis2mybatis 위키는 "MyBatis 3에서는 namespace가 필수가 되어 이 설정이 불필요"하다고만 적는다). 매칭 전에 **실제 호출 문자열 몇 건**을 열어 접두어 유무를 확인한다.

- `<statement>`는 태그로 CRUD를 알 수 없다 → SQL 본문으로만 판정(스크립트도 본문 기준).
- `sqlMapConfig.xml`의 `<sqlMap resource="…">` 목록이 **실제 로드되는 sqlMap 파일 목록**이다. 디렉터리에만 있고 설정에 없는 파일은 `사용 여부 = 미사용` 후보.

```bash
grep -rn 'useStatementNamespaces' --include='*.xml' src/main
grep -rhoE '<sqlMap[[:space:]]+resource="[^"]+"' --include='*.xml' src/main | sort -u
```

---

## 5. API → 서비스 → SQL 연결

### 5-1. 호출 형태별 SQL ID 확정법

| 호출 형태 | SQL ID | 확신도 |
|------|------|------|
| 매퍼 인터페이스 `orderMapper.selectOrder(…)` | `<인터페이스 FQCN>.selectOrder` (XML namespace와 일치 확인) | 확인됨 |
| `sqlSession.selectList("com.x.OrderMapper.selectOrder", p)` (SqlSessionTemplate) | 문자열 그대로 | 확인됨 |
| 공통 DAO 래퍼 `dao.list("selectOrder", p)` (접두어를 래퍼가 붙임) | 래퍼 구현을 열어 접두어 규칙 확인 후 합성 | 래퍼 확인 전 추정 |
| iBATIS `getSqlMapClientTemplate().queryForList("Order.select", p)` | 문자열(4-7 namespace 규칙) | 확인됨 |
| SQL ID를 변수·상수·문자열 연결로 조립 | 가능한 값 전부 나열 | 추정 |

```bash
# 매퍼 인터페이스 ↔ XML 연결 확인: namespace 목록과 @Mapper/@MapperScan 대상
grep -rhoE 'namespace="[^"]+"' --include='*.xml' src/main/resources | sort -u
grep -rnE '@Mapper\b|@MapperScan|MapperScannerConfigurer|basePackage' --include='*.java' --include='*.xml' src/main

# 문자열 SQL ID 호출 (SqlSession·iBATIS)
grep -rnE '\.(selectOne|selectList|selectMap|selectCursor|insert|update|delete|queryForObject|queryForList|queryForMap)\("[^"]+"' --include='*.java' src/main/java
```

namespace와 인터페이스가 어긋나는 행(인터페이스는 있는데 같은 FQCN의 namespace XML이 없음, 또는 반대)은 "매퍼 연결 끊김" 목록으로 따로 남긴다.

### 5-2. 추적 절차 (API 1건당)

1. 핸들러 메서드 본문에서 서비스 호출을 찾는다(필드 타입 → 구현체. 인터페이스 구현체가 둘 이상이면 `@Primary`·`@Qualifier`·프로파일 확인, 못 정하면 추정).
2. 서비스 메서드에서 매퍼/DAO 호출을 5-1 규칙으로 SQL ID로 바꾼다. 서비스 → 서비스 호출은 재귀로 따라간다(깊이 제한을 두고 넘으면 "미확인").
3. 결과를 `api-sql.tsv`로 남긴다: `메서드+URL \t 핸들러 \t SQL ID \t 근거(서비스 파일:줄)`.
4. **분기 안 호출**(if·행 타입별 insert/update/delete 분기)은 SQL ID 옆에 조건을 적는다. X-API 저장 API는 행 타입 분기가 핵심이므로 반드시 적는다.

> AOP(`@Around`)·이벤트 리스너·`@Async`·리플렉션 호출은 정적 추적에서 빠진다. `@Aspect` 목록을 따로 뽑아(`grep -rn '@Aspect'`) 포인트컷이 매퍼/서비스에 걸리면 해당 API 행에 메모한다.

대규모 레포는 이 단계를 **모듈(패키지) 단위 서브에이전트**로 나눈다 — 규약 R1~R9는 `spec-extraction-method` 6-2를 그대로 따른다.

---

## 6. CRUD 매트릭스

1. **프로세스 ↔ API 귀속**: 업무 프로세스 ID(spec-extraction-method 3·8절)에 API·배치를 묶는다(사람 판단).
2. **프로세스 ↔ SQL**: `api-sql.tsv`와 배치 목록(7절)을 합쳐 `process-sql.tsv`(`프로세스ID \t SQL ID \t 근거`)를 만든다.
3. **행렬 생성**:
   ```bash
   python3 -I ~/spec-tools/crud_matrix.py process-sql.tsv sql-inventory.tsv > crud-matrix.tsv
   # 행=테이블, 열=프로세스, 칸=CRUD, 끝 칸 '없는 연산'·'C 다중'
   ```
4. **완전성 점검**: `없는 연산`·`C 다중`의 해석과 조치는 `spec-extraction-method` 5절 원인 표를 따른다(여기서 반복하지 않는다). Spring·MyBatis 레거시에서 특히 먼저 볼 곳:
   - C 없음 → 프로시저 내부 DML(4-5), 배치 Writer(7-1), DB 링크·외부 적재, 다른 애플리케이션.
   - 어느 프로세스에도 안 걸린 SQL ID → `sql-inventory.tsv`에는 있는데 `process-sql.tsv`에 없는 행. 매퍼 인터페이스 호출부가 없으면 `사용 여부 = 미사용` 후보.
   ```bash
   cut -f1 sql-inventory.tsv | sort -u > all-sql.txt
   cut -f2 process-sql.tsv   | sort -u > used-sql.txt
   comm -23 all-sql.txt used-sql.txt   # 호출 경로 미발견 SQL ID
   ```
5. 동적 SQL에서 나온 칸(`cond_tables`)은 행렬에서도 구분 표기(예: `R?`)해 "확인됨" 칸과 섞지 않는다.

---

## 7. 배치·스케줄러·외부 연동 목록

### 7-1. 배치·스케줄러

```bash
# Spring 스케줄링: @Scheduled(cron·fixedDelay·fixedRate·initialDelay·zone), XML task 네임스페이스
grep -rnE '@Scheduled\(|@EnableScheduling|SchedulingConfigurer|<task:scheduled\b|<task:scheduler\b' --include='*.java' --include='*.xml' src/main

# Quartz (Spring 통합 FactoryBean 포함)
grep -rnE 'implements +Job\b|QuartzJobBean|JobDetailFactoryBean|MethodInvokingJobDetailFactoryBean|CronTriggerFactoryBean|SimpleTriggerFactoryBean|SchedulerFactoryBean|cronExpression' --include='*.java' --include='*.xml' src/main

# Spring Batch (4.x JobBuilderFactory → 5.0 deprecated, JobBuilder(name, jobRepository))
grep -rnE '@EnableBatchProcessing|JobBuilderFactory|StepBuilderFactory|new JobBuilder\(|new StepBuilder\(|ItemReader|ItemWriter|Tasklet' --include='*.java' src/main/java

# MyBatis 배치 Reader/Writer → SQL ID 연결 (queryId / statementId 속성)
grep -rnE 'MyBatis(Paging|Cursor)ItemReader|MyBatisBatchItemWriter|queryId|statementId' --include='*.java' --include='*.xml' src/main
```

- cron·주기가 `${batch.order.cron}` 같은 플레이스홀더면 **프로파일별 설정 파일**(`application-*.yml`·`*.properties`·JNDI)에서 값을 찾아 프로파일별로 적는다. 못 찾으면 "미확인".
- 레포 밖 트리거(OS crontab·Jenkins·외부 스케줄러가 `main` 클래스나 URL을 호출)는 코드로 확정할 수 없다 → 배치 명세에 "외부 트리거 — 담당자 확인 필요"로 남긴다. `public static void main` 클래스와 배치용 HTTP 엔드포인트도 후보로 나열한다.
- MyBatis 배치 컴포넌트는 Reader가 `queryId`, Writer가 `statementId`로 SQL을 지정한다 → 이 값이 배치의 입출력 테이블(7-5 칸)을 정한다.

### 7-2. 외부 호출 (연동 대상)

```bash
grep -rnE 'RestTemplate|WebClient|RestClient|@FeignClient|HttpClient|CloseableHttpClient|HttpURLConnection|OkHttpClient' --include='*.java' src/main/java
grep -rnE 'JmsTemplate|KafkaTemplate|RabbitTemplate|@KafkaListener|@JmsListener|@RabbitListener' --include='*.java' src/main/java
grep -rnE 'JavaMailSender|FTPClient|ChannelSftp|JSch|new Socket\(' --include='*.java' src/main/java
# 연동 URL·호스트 설정
grep -rnE '(url|uri|host|endpoint)[[:space:]]*[:=]' src/main/resources/application*.{yml,yaml,properties} 2>/dev/null
```

각 호출 지점마다 7-5 칸(대상·방향·프로토콜·포맷·실패 처리)을 채운다. URL이 설정값이면 프로파일별 값, 실패 처리는 try/catch·재시도(`@Retryable`)·타임아웃 설정 근거 줄을 함께 적는다. **수신 측**(외부가 우리를 호출) 연동은 2절 API 목록에서 인증 방식(필터·IP 제한)으로 식별해 같은 표에 방향 "인바운드"로 넣는다.

---

## 8. 명세 칸 매핑 (spec-extraction-method 7절 양식에 넣는 법)

| 산출 파일 | 들어가는 명세 | 칸 |
|------|------|------|
| `api-inventory.tsv` + `api-runtime.tsv` | 7-2 API | 메서드+URL·핸들러·근거, 대조 결과는 `확신도` |
| 2-4·2-5 결과 | 7-2 API | 요청·응답 스키마·인증 |
| `api-sql.tsv` | 7-2 API `사용 SQL ID` / 7-3 연결 키 | SQL ID·조건 |
| `sql-inventory.tsv` | 7-3 데이터 | SQL ID·C/R/U/D·테이블·동적 조건(cond_tables·test 식) |
| `crud-matrix.tsv` | 7-3 CRUD 매트릭스·완전성 점검 | — |
| 7-1·7-2 결과 | 7-5 배치·연동 | 배치ID·주기·트리거·입출력 테이블 / 대상·방향·프로토콜 |

모든 행에 `근거`·`확신도`·`사용 여부` 칸을 붙인다(공통 칸 규칙은 spec-extraction-method 7-0). `사용 여부`는 접근 로그(URL별 호출 수)·MyBatis SQL 로그·DB 통계로 채우며, 정적 추출만으로는 항상 "미확인"이다.

---

## 9. 스크립트 결과 검증 · 언제 쓰나

**스크립트 결과를 그대로 명세로 확정하지 않는다.** 정규식 기반이라 오탐·누락이 있다.

1. 각 TSV에서 무작위 10행을 뽑아 근거 줄을 열고 대조한다(spec-extraction-method R3).
2. 4-1의 수량 교차 확인(grep 문장 수 ↔ 인벤토리 행 수), 3-4의 정적 ↔ 실행 시 대조로 누락을 찾는다.
3. 불일치 유형을 README의 "추출 도구 한계"에 남긴다.

**적합:** Spring MVC + MyBatis/iBATIS 레거시를 재구축·이관하기 전 API·SQL·배치 인벤토리가 필요할 때 / 넥사크로 화면 + X-API 백엔드 조합에서 화면 → API → SQL 추적표를 만들 때.

**부적합:** JPA/Hibernate 위주 코드(엔티티·리포지토리 메서드 이름 규칙 해석이 따로 필요 — 이 스킬은 4-6에서 존재 여부만 잡는다) / WebFlux 함수형 라우터(`RouterFunction`)만 쓰는 앱(2-1 어노테이션 추출이 안 됨 → Actuator `dispatcherHandlers`로) / 소스 없이 WAR만 있는 경우(디컴파일은 범위 밖).

---

## 10. 흔한 실수

| 실수 | 왜 문제인가 | 올바른 접근 |
|------|------|------|
| 메서드 레벨 매핑만 grep해 URL 확정 | 클래스 prefix 누락으로 URL이 전부 틀림 | 파일 단위 합성(2-2) |
| `@RequestMapping` method 없음을 GET으로 가정 | 모든 메서드에 매칭됨 | `ANY` 표기 후 로그로 확정 |
| web.xml의 `*.do`·추가 서블릿·필터 무시 | 진입점·인증 근거 누락 | 2-3 grep + Actuator `servlets`/`servletFilters` 대조 |
| Actuator를 운영에서 열어 추출 | 내부 구조 노출 | 로컬·검증 환경에서만, 추출 후 원복 |
| Boot 2.x jq를 1.5 `/mappings`에 사용 | 응답 형식이 다름 | 1.5는 키 문자열 파싱 |
| "Boot 1.x는 springdoc 불가"로 단정하거나 반대로 무작정 추가 | 공식 호환표는 1.5.x를 적지만 v1은 OSS 종료·미검증 | 정적 + `/mappings` 기본, 기존 Springfox 우선 |
| OpenAPI 생성 결과를 X-API 엔드포인트 스키마로 사용 | Dataset 구조가 반영되지 않음 | 2-5 정적 표시법 |
| 매퍼 XML만 파싱하고 `@Select`·`@SelectProvider`·JdbcTemplate 누락 | SQL 인벤토리 불완전 | 4-6 별도 수집 |
| 동적 태그 안 테이블을 "확인됨"으로 기록 | 실행 경로에 따라 안 쓰일 수 있음 | `cond_tables` = 추정 + test 식 |
| `${}`를 일반 파라미터처럼 취급 | 대상 테이블 미확정·인젝션 지점 누락 | 미확인 + 보안 메모 |
| iBATIS `<statement>`를 태그 이름으로 CRUD 판정 | 종류가 태그에 없음 | SQL 본문 기준 |
| iBATIS ID를 무조건 `ns.id`로 매칭 | `useStatementNamespaces=false`면 코드엔 `id`만 | 설정 확인 후 매칭 |
| 프로시저를 R로 기록 | 내부 DML 누락 → C 없음 오판 | `P: 이름` + 프로시저 소스 별도 판정 |
| cron 플레이스홀더를 기본값 하나로 기록 | 프로파일별로 다름 | 프로파일별 값 |
| 레포 밖 crontab·Jenkins 트리거를 없다고 판단 | 코드로 확정 불가 | "외부 트리거 — 담당자 확인" |
| 스크립트 출력을 검증 없이 명세 확정 | 정규식 오탐·누락 | 9절 표본 대조 |
| 대상 레포 안에서 스크립트 실행 | 같은 이름 모듈 import 위험 | 레포 밖에 두고 `python3 -I` |
