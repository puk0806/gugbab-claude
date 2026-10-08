---
name: xapi-to-rest-migration
description: 넥사크로 17 X-API(PlatformRequest/PlatformResponse·PlatformData·DataSet·VariableList) 기반 Spring 컨트롤러를 Spring Boot 3 @RestController + JSON DTO(record)로 옮기는 백엔드 마이그레이션 패턴 — Dataset/VariableList→DTO 매핑, ErrorCode/ErrorMsg→HTTP 상태+RFC 9457 ProblemDetail, 행 상태 일괄 저장(POST /batch, @Transactional), 낙관적 잠금, X-API 어댑터와 REST 공존, xeni 엑셀→POI SXSSF, 서버 측 검증·권한 재배치, 체크리스트와 흔한 실수
---

# 넥사크로 X-API 컨트롤러 → Spring Boot 3 REST 마이그레이션

> 소스:
> - 넥사크로 17 X-API 서비스 작성: https://docs.tobesoft.com/getting_started_nexacro_17_ko/d82e8b8cd262cb1a
> - 넥사크로 N V24 서버 설치 가이드(X-API jar·Jakarta): https://docs.tobesoft.com/server_setup_guide_nexacro_n_v24_en/638d458b567ddda9
> - 넥사크로 N 서버 설치 가이드(이전판): https://docs.tobesoft.com/server_setup_guide_nexacro_n_en/e11221d55800ca9f
> - 넥사크로 14 관리자 가이드(Dataset XML·ErrorCode): https://docs.tobesoft.com/admin_guide_nexacro_14_en_kr/ea2d0a940547e4a5
> - Spring Framework Error Responses(ProblemDetail): https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html
> - Spring Framework @Transactional: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html
> - Spring MVC Validation: https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html
> - RFC 9457 Problem Details for HTTP APIs: https://www.rfc-editor.org/rfc/rfc9457.html
> - JSON:API Atomic Operations: https://jsonapi.org/ext/atomic/
> - MyBatis 3 Java API: https://mybatis.org/mybatis-3/java-api.html
> - Jakarta Persistence @Version: https://jakarta.ee/specifications/persistence/3.1/apidocs/jakarta.persistence/jakarta/persistence/version
> - Apache POI SXSSF: https://poi.apache.org/components/spreadsheet/how-to.html , https://poi.apache.org/changes.html
> 검증일: 2026-10-08

---

## 0. 이 스킬의 위치 — 무엇을 다루고 무엇을 넘기는가

| 질문 | 담당 |
|------|------|
| 기존 X-API 서버 코드를 **읽고 분석**(행 타입 읽기 메서드, xeni 설정, 14/17/N 패키지 차이) | `nexacro-xapi-server` 스킬 |
| X-API 컨트롤러를 **REST로 옮기는 설계·코드 패턴** | **이 스킬** |
| `javax`→`jakarta`, Security 5→6 등 Spring Boot 2→3 자체 이관 | `spring-boot-2-to-3-migration` 스킬 |
| `@RestControllerAdvice`·ErrorCode enum·BusinessException 계층·Bean Validation 기본 | `global-exception-validation` 스킬 |
| MyBatis 매퍼 XML·동적 SQL·`<foreach>` 작성법 | `mybatis-mapper-patterns` 스킬 |
| 화면(.xfdl) → Next.js 변환 | `nexacro-to-react-mapping` 스킬 / `nexacro-screen-converter` 에이전트 |

**언제 사용**: 넥사크로 화면이 `transaction()`으로 호출하던 서버 서비스를 JSON REST API로 바꿀 때, 그리고 전환기에 두 방식을 함께 운영해야 할 때.
**언제 사용하지 않음**: 넥사크로 화면을 그대로 두고 서버만 유지보수할 때(→ `nexacro-xapi-server`), 신규 REST API를 처음부터 설계할 때(→ `api-spec-designer` 에이전트).

---

## 1. 바뀌는 것 한눈에 — X-API 계약 vs REST 계약

| 항목 | X-API (넥사크로 17) | REST (Spring Boot 3) |
|------|--------------------|----------------------|
| 전송 포맷 | Dataset XML/Binary 등 (`PlatformType.CONTENT_TYPE_XML` 등) | JSON (`application/json`) |
| 요청 단위 | `PlatformData` 1개 = `VariableList` + 여러 `DataSet` | 엔드포인트별 요청 DTO 1개 |
| 엔드포인트 | 보통 서비스 URL 하나에 여러 Dataset을 싣는다 | 리소스·행위별로 나눈다 (`GET /orders`, `POST /orders/batch`) |
| 성공/실패 | HTTP는 대개 200, `VariableList`의 `ErrorCode`(음수=실패) + `ErrorMsg` | HTTP 상태 코드 + 오류 본문(RFC 9457 ProblemDetail) |
| 행 변경 정보 | Dataset 행 타입 `insert`/`update`/`delete` + update 행의 `OrgRow`(원래값) | 명시적 필드: `created[]`/`updated[]`/`deleted[]` + version 또는 원래값 |
| 입력 검증 | 화면 스크립트에 몰려 있는 경우가 많다 | 서버 Bean Validation이 **필수** |
| 의존 jar | `nexacro17-xapi-1.0.jar`, `commons-logging`, 라이선스 xml(`nexacro17_server_license.xml`) | 표준 Spring Web + Jackson |

넥사크로 17 공식 예제의 기본 흐름(17 가이드 인용, 요약):

```java
// com.nexacro17.xapi.data.*, com.nexacro17.xapi.tx.*
PlatformData pdata = new PlatformData();
int nErrorCode = 0; String strErrorMsg = "START";
try {
    // ... 처리
    nErrorCode = 0; strErrorMsg = "SUCC";
} catch (Throwable th) {
    nErrorCode = -1; strErrorMsg = th.getMessage();
}
VariableList varList = pdata.getVariableList();
varList.add("ErrorCode", nErrorCode);
varList.add("ErrorMsg", strErrorMsg);
HttpPlatformResponse res = new HttpPlatformResponse(response, PlatformType.CONTENT_TYPE_XML, "UTF-8");
res.setData(pdata);
res.sendData();
```

> 주의: X-API에서 행 타입·삭제 행·원래값을 읽는 Java 메서드명(예: `getRowType`, `getRemovedRowCount`, `getSavedData`)은 공개 17 문서에서 확인하지 못했다(미검증). 기존 코드 분석은 `nexacro-xapi-server` 스킬 5-2절과 실제 jar를 기준으로 하고, 이 스킬은 **옮긴 뒤의 모양**만 다룬다.

---

## 2. Dataset·VariableList → 요청/응답 DTO(record) 매핑 규칙

### 2-1. 매핑 원칙

| X-API 요소 | REST DTO | 규칙 |
|-----------|----------|------|
| 입력 `VariableList` 변수 (`searchKeyword` 등 스칼라) | 조회는 쿼리 파라미터 record, 저장은 요청 본문의 최상위 필드 | 이름을 그대로 쓰지 말고 의미 이름으로(`sKey` → `keyword`) |
| 입력 Dataset (조회 조건 1행짜리) | 조회 조건 record 1개 | 1행 Dataset은 배열로 만들지 않는다 |
| 입력 Dataset (편집 그리드 N행) | `BatchRequest` 안의 `created`/`updated`/`deleted` 배열 (§3) | 행 타입 → 배열 위치로 바꾼다 |
| 출력 Dataset (목록) | `List<RowDto>` 또는 페이지 응답 record | 컬럼 = record 컴포넌트 |
| 출력 여러 Dataset (마스터 + 디테일) | 한 응답 record에 이름 붙은 필드 2개 | 화면이 실제로 같이 쓰는지 먼저 확인. 따로 쓰면 엔드포인트 분리 |
| 출력 `VariableList` 일반 변수(합계·건수) | 응답 record의 필드 | |
| `ErrorCode` / `ErrorMsg` | **본문에서 제거** → HTTP 상태 + ProblemDetail (§2-3) | 성공 응답에 `errorCode: 0` 같은 필드를 남기지 않는다 |

### 2-2. 컬럼 타입 대응

넥사크로 Dataset 컬럼 타입(14 관리자 가이드: STRING, INT, FLOAT, DECIMAL, BIGDECIMAL, DATE(YYYYMMDD), DATETIME(YYYYMMDDHHmmssuuu), TIME(HHmmssuuu), BLOB)을 Java 타입으로 옮긴다.

| Dataset 타입 | record 컴포넌트 | JSON 표현 제안 |
|-------------|----------------|----------------|
| STRING | `String` | 문자열 |
| INT | `Integer` (null 허용) / `int` (필수) | 숫자 |
| FLOAT, DECIMAL, BIGDECIMAL | `BigDecimal` (금액·수량) | 숫자 또는 문자열(정밀도 보존 필요 시) |
| DATE | `LocalDate` | ISO-8601 `"2026-10-08"` |
| DATETIME | `LocalDateTime` 또는 `OffsetDateTime` | ISO-8601 |
| TIME | `LocalTime` | ISO-8601 |
| BLOB | 별도 업로드/다운로드 엔드포인트 | JSON에 base64로 싣지 않는 것을 기본으로 |

- 넥사크로는 `YYYYMMDD` 문자열로 날짜를 주고받는 코드가 많다. REST에서는 ISO-8601로 바꾸되, 전환기 X-API 어댑터(§5)에서는 기존 포맷을 유지한다.
- 금액에 `double`을 쓰지 않는다. 기존 Dataset이 FLOAT여도 업무 의미가 금액이면 `BigDecimal`.
- Jackson의 `java.time` 처리·직렬화 포맷 상세는 `jackson-time-migration` 스킬을 따른다.

### 2-3. 예시 — 조회

```java
// 기존: dsSearch(1행) + VariableList → dsList 반환
public record OrderSearchCond(
        @Size(max = 50) String keyword,
        @NotNull LocalDate fromDate,
        @NotNull LocalDate toDate,
        @Min(1) @Max(500) Integer size) {}

public record OrderRow(
        Long orderId,
        String customerName,
        BigDecimal amount,
        LocalDate orderDate,
        long version) {}            // 낙관적 잠금용 (§4)

public record OrderListResponse(List<OrderRow> items, long totalCount) {}

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
class OrderController {
    private final OrderService orderService;

    @GetMapping
    OrderListResponse search(@Valid OrderSearchCond cond) {   // 쿼리 파라미터 바인딩
        return orderService.search(cond);
    }
}
```

### 2-4. ErrorCode/ErrorMsg → HTTP 상태 + ProblemDetail

Spring Framework 6은 RFC 9457 "Problem Details for HTTP APIs"를 지원한다(`ProblemDetail`, `ErrorResponse`, `ErrorResponseException`, `ResponseEntityExceptionHandler`). Jackson은 `application/problem+json`으로 내보내며, `ProblemDetail`의 `properties` 맵은 최상위 JSON 필드로 펼쳐진다. RFC 9457은 RFC 7807을 대체(obsolete)하며 표준 필드는 `type`(없으면 `about:blank`), `title`, `status`, `detail`, `instance`다.

**대응 규칙(설계 제안)**:

| 기존 X-API 실패 유형 | HTTP 상태 | ProblemDetail |
|---------------------|----------|---------------|
| 입력값 오류 (`ErrorCode=-1`, "필수값 누락") | 400 | `title`, 필드별 오류는 확장 필드 `errors` |
| 로그인 필요 / 세션 만료 | 401 | |
| 권한 없음 | 403 | |
| 대상 없음 | 404 | |
| 동시 수정 충돌 (§4) | 409 | 확장 필드 `conflicts`(충돌 행 키) |
| 업무 규칙 위반 (재고 부족 등, 기존 `ErrorCode` 음수 업무코드) | 422 또는 409 — 팀 규칙으로 하나를 고정 | 기존 업무코드를 확장 필드 `code`로 보존 |
| 예상 못한 예외 (`catch (Throwable)` → -1) | 500 | `detail`에 내부 메시지를 노출하지 않는다 |

```java
@RestControllerAdvice
class ApiExceptionHandler extends ResponseEntityExceptionHandler {   // Spring MVC 표준 예외는 부모가 ProblemDetail로 처리

    @ExceptionHandler(BusinessException.class)
    ProblemDetail business(BusinessException e) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(e.getStatus(), e.getMessage());
        pd.setTitle(e.getTitle());
        pd.setProperty("code", e.getCode());          // 기존 업무 ErrorCode 보존 → 최상위 "code" 필드
        return pd;
    }

    @ExceptionHandler(OptimisticConflictException.class)
    ProblemDetail conflict(OptimisticConflictException e) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        pd.setTitle("다른 사용자가 먼저 수정했습니다");
        pd.setProperty("conflicts", e.getKeys());
        return pd;
    }
}
```

- Spring Boot에서 `spring.mvc.problemdetails.enabled=true`는 내장 예외를 ProblemDetail로 처리하는 `ResponseEntityExceptionHandler`를 자동 구성한다. 기본값은 `false`다. 위처럼 직접 `ResponseEntityExceptionHandler`를 상속했다면 이 속성은 켜지 않아도 된다(둘 다 쓰면 어느 핸들러가 이기는지 헷갈리므로 하나만 쓴다).
- 팀이 이미 `global-exception-validation` 스킬의 ErrorResponse DTO 방식을 쓰고 있다면 그 형식을 유지해도 된다. 중요한 것은 **"HTTP 200 + 본문 ErrorCode" 관행을 버리는 것**이다.
- 프론트 변경 포인트: 넥사크로 `transaction` 콜백의 `nErrorCode < 0` 분기는 `fetch` 응답의 `!res.ok` 분기로 바뀐다. 전환 화면 목록에 이 변경을 함께 기록한다.

---

## 3. 행 상태 일괄 저장 → `POST /…/batch`

> 주의: Spring 공식 문서에는 "그리드 일괄 저장" REST 패턴이 없다. 아래는 **설계 제안**이며, 공개 표준 중 가장 가까운 참고는 JSON:API Atomic Operations 확장이다.

### 3-1. 참고 표준 — JSON:API Atomic Operations

- 요청 본문의 `atomic:operations` 배열에 `op`가 `add`/`update`/`remove`인 연산을 담아 POST한다.
- "서버는 모든 연산을 원자적으로 수행해야 하며(MUST), 한 연산이 실패하면 앞선 연산의 효과도 무효화해야 한다(MUST)."
- 연산은 배열에 나온 순서대로 수행해야 한다(MUST).
- 미디어 타입: `application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"`.

JSON:API 전체를 도입할 필요는 없다. **원자성(전부 성공 또는 전부 실패)과 순서 명시**라는 두 성질만 가져온다.

### 3-2. 요청 DTO

```java
public record OrderBatchRequest(
        @NotNull @Size(max = 1000) List<@Valid OrderCreate> created,
        @NotNull @Size(max = 1000) List<@Valid OrderUpdate> updated,
        @NotNull @Size(max = 1000) List<@Valid OrderKey>    deleted) {}

public record OrderCreate(@NotBlank @Size(max = 100) String customerName,
                          @NotNull @PositiveOrZero BigDecimal amount,
                          @NotNull LocalDate orderDate) {}

public record OrderUpdate(@NotNull Long orderId,
                          @NotNull Long version,          // 또는 원래값 필드들 (§4)
                          @NotBlank @Size(max = 100) String customerName,
                          @NotNull @PositiveOrZero BigDecimal amount) {}

public record OrderKey(@NotNull Long orderId, @NotNull Long version) {}

public record BatchResult(int created, int updated, int deleted, List<Long> createdIds) {}
```

- 컨테이너 원소 검증은 `List<@Valid OrderCreate>`처럼 **타입 인자 위치**에 `@Valid`를 둔다(Jakarta Bean Validation 컨테이너 원소 cascade).
- 빈 배열은 허용, `null`은 거부(`@NotNull`) — "보내지 않음"과 "0건"을 구분하지 않게 해서 클라이언트 버그를 빨리 드러낸다.
- 배열 크기 상한(`@Size(max=…)`)을 둔다. 넥사크로 시절에는 화면이 행 수를 사실상 제한했지만 REST는 누구나 호출할 수 있다.
- 클라이언트 임시 행 식별자가 필요하면 `OrderCreate`에 `clientKey`를 두고, 응답에서 `clientKey → 새 ID` 매핑을 돌려준다.

### 3-3. 컨트롤러·서비스 — 한 트랜잭션

```java
@PostMapping("/batch")
BatchResult saveBatch(@Valid @RequestBody OrderBatchRequest req, @AuthenticationPrincipal LoginUser user) {
    return orderService.saveBatch(req, user);
}

@Service
@RequiredArgsConstructor
class OrderService {
    private final OrderMapper orderMapper;

    @Transactional   // RuntimeException·Error → 롤백, checked 예외는 기본 롤백 안 됨
    public BatchResult saveBatch(OrderBatchRequest req, LoginUser user) {
        // 처리 순서를 고정한다: 삭제 → 수정 → 추가 (유니크 키 재사용 충돌 방지). 레거시 순서가 다르면 그 순서를 따른다.
        req.deleted().forEach(k -> requireOne(orderMapper.deleteByIdAndVersion(k.orderId(), k.version(), user.tenantId()), k.orderId()));
        req.updated().forEach(u -> requireOne(orderMapper.updateWithVersion(u, user.tenantId()), u.orderId()));
        List<Long> ids = req.created().stream().map(c -> orderMapper.insertAndReturnId(c, user)).toList();
        return new BatchResult(req.created().size(), req.updated().size(), req.deleted().size(), ids);
    }

    private static void requireOne(int affected, Long id) {
        if (affected != 1) throw new OptimisticConflictException(List.of(id));   // RuntimeException → 전체 롤백
    }
}
```

`@Transactional` 함정(Spring 공식 문서):
- **기본 롤백 규칙**: `RuntimeException`·`Error`만 롤백한다. checked 예외를 던지는 레거시 코드를 옮길 때는 `rollbackFor`를 지정하거나 런타임 예외로 감싼다.
- **자기 호출(self-invocation)**: 프록시 모드에서 같은 클래스 안의 `this.saveBatch()` 호출에는 트랜잭션이 적용되지 않는다. 컨트롤러 → 서비스 빈 경계에서 시작한다.
- **가시성**: 기본은 public 메서드. 6.0부터 클래스 기반 프록시에서는 protected·package 가시성도 지원하지만, 인터페이스 기반 프록시는 public + 인터페이스 정의 메서드여야 한다.
- 레거시 X-API 컨트롤러에서 흔한 `catch (Throwable th) { ErrorCode=-1 }`를 **서비스 안으로 옮기지 않는다**. 예외를 삼키면 트랜잭션이 커밋된다. 예외 → HTTP 변환은 `@RestControllerAdvice`에서만.

MyBatis 일괄 INSERT(`<foreach>`)·배치 실행기 사용법은 `mybatis-mapper-patterns` 스킬을 따른다.

---

## 4. 동시 수정 충돌 — 낙관적 잠금

넥사크로 update 행은 `OrgRow`에 수정 전 원래값을 함께 보낸다. 레거시 서버가 이를 `WHERE` 조건에 써서 "그 사이 남이 바꿨는지"를 막고 있었다면, REST에서도 같은 보호를 **명시적으로** 다시 만들어야 한다. JSON에는 `OrgRow`가 자동으로 따라오지 않는다.

### 4-1. 방법 선택

| 방법 | 언제 | REST 요청에 실을 것 |
|------|------|------------------|
| version 컬럼 (권장) | 테이블에 컬럼 추가 가능 | 조회 때 받은 `version` |
| 원래값 비교 | 스키마 변경 불가 레거시 테이블 | 수정 대상 컬럼들의 원래값 (`originalAmount` 등) 또는 `updated_at` |
| 없음 (마지막 저장 우선) | 레거시도 보호가 없었고 업무가 허용 | — (의도적 결정으로 문서화) |

### 4-2. MyBatis — 조건부 UPDATE + 영향 행 수 확인

MyBatis의 `insert`/`update`/`delete`는 **영향받은 행 수**를 반환한다.

```xml
<update id="updateWithVersion">
  UPDATE orders
     SET customer_name = #{u.customerName},
         amount        = #{u.amount},
         version       = version + 1
   WHERE order_id  = #{u.orderId}
     AND version   = #{u.version}
     AND tenant_id = #{tenantId}          <!-- 권한 범위도 WHERE에 (§6) -->
</update>
```

```java
int updateWithVersion(@Param("u") OrderUpdate u, @Param("tenantId") String tenantId);
```

- 반환값이 0이면 "남이 먼저 수정" 또는 "없는 행/권한 밖 행"이다 → 예외를 던져 배치 전체를 롤백하고 409로 응답한다.
- 원래값 비교 방식은 `AND amount = #{u.originalAmount}`처럼 쓴다. NULL 가능 컬럼은 `=`로 비교되지 않으므로 DB별 NULL-safe 비교가 필요하다.

### 4-3. JPA를 쓰는 경우

`@Version`은 낙관적 잠금 값으로 쓰는 필드를 지정한다. 지원 타입은 `int`, `Integer`, `short`, `Short`, `long`, `Long`, `java.sql.Timestamp`이며 엔티티당 하나만 둔다. 충돌 시 Spring은 `ObjectOptimisticLockingFailureException`(JPA는 `JpaOptimisticLockingFailureException`)으로 변환하므로 이를 409로 매핑한다. 단, 요청 DTO의 version을 엔티티에 반영하지 않고 DB에서 새로 읽은 엔티티를 수정하면 비교가 무의미해진다 — 요청 version과 엔티티 version을 먼저 비교한다.

---

## 5. 전환기 공존 — 같은 서비스 앞에 X-API 어댑터와 REST 컨트롤러

화면을 한 번에 옮기지 않으므로 한동안 두 프로토콜을 함께 받는다. 핵심은 **업무 로직을 서비스 계층 하나로 모으고**, 프로토콜 변환만 양쪽 컨트롤러가 맡는 것이다.

```
넥사크로 화면 ──(Dataset XML)──▶ OrderXapiController ──┐  Dataset → OrderBatchRequest 변환
                                                         ├──▶ OrderService.saveBatch()  (@Transactional, 검증·권한 포함)
Next.js 화면  ──(JSON)─────────▶ OrderRestController ───┘
```

- X-API 어댑터는 Dataset 행 타입을 `created`/`updated`/`deleted`로, `OrgRow` 값을 version/원래값으로 옮겨 **같은 `OrderBatchRequest`를 만든다**. 그래야 두 경로의 저장 결과가 같다(동등성 테스트는 `migration-parity-tester` 에이전트).
- 어댑터는 예외를 받아 `ErrorCode`(음수)/`ErrorMsg`로 바꾸는 일만 한다. 검증·권한 검사를 어댑터에만 두지 않는다.
- 어댑터 쪽 Bean Validation: Dataset에서 만든 DTO는 `@Valid` 바인딩을 거치지 않으므로 서비스에 `@Validated` + 파라미터 `@Valid`를 두거나 `Validator`를 직접 호출한다.
- 화면이 모두 옮겨지면 어댑터와 X-API 의존성을 함께 제거한다. 남은 호출이 있는지 접근 로그로 확인한다.

### Spring Boot 3(Jakarta)에서 X-API를 계속 쓸 수 있는가

Spring Boot 3는 `jakarta.servlet`을 쓰므로 `javax.servlet` 기반 X-API jar는 그대로 동작하지 않는다.

> 주의: 넥사크로 **N** V24 서버 가이드는 "Versions **1.0.11** and later provide an X-API that can be used in WAS implemented with the Jakarta EE specification"이라 쓰고 파일명은 `nexacro-xapi-java-jakarta_x.x.x.jar`다. 같은 벤더의 이전 N 가이드는 같은 문장을 "**1.0.12** and later"로 적는다(문서 간 불일치 — 실제 배포 파일로 확인).
> 주의: 이 Jakarta jar는 N 계열이다. **넥사크로 17 라이선스로 N 계열 Jakarta X-API를 사용할 수 있는지는 미확인**이다. 벤더 확인 전에는 다음 중 하나를 전제로 계획한다: ① X-API 어댑터는 기존 Spring Boot 2(javax) 앱에 남기고 REST만 새 Boot 3 앱에서 제공(서비스 계층은 공유 모듈 또는 API 호출로) ② 벤더 확인 후 Jakarta jar로 한 앱에서 공존.
> 주의: N V24 가이드에는 Spring Boot 3에 대한 직접 언급이 없다. Boot 3 호환은 Jakarta EE 지원에서 유추한 것이다.

---

## 6. 입력 검증·권한 검사를 REST 쪽에 다시 둔다

넥사크로 화면은 필수값·길이·형식·버튼 노출 같은 검사를 **화면 스크립트**에서 하는 경우가 많고, 서버는 화면이 걸러 준 데이터만 온다고 가정하는 경우가 많다. REST API는 브라우저 밖에서도 호출되므로 이 가정이 깨진다.

| 화면 스크립트에 있던 것 | REST에서 둘 곳 |
|----------------------|---------------|
| 필수값·길이·숫자 범위·날짜 형식 | DTO record의 Bean Validation(`@NotNull`, `@Size`, `@Positive`, `@Pattern`) |
| 시작일 ≤ 종료일 같은 필드 간 규칙 | 클래스 수준 커스텀 제약 또는 서비스 검증 |
| 코드값 유효성(공통코드 목록에 있는가) | 서비스 검증(DB/캐시 조회) |
| "이 버튼은 관리자만 보임" | `@PreAuthorize` 또는 서비스 권한 검사 — **버튼 숨김은 보안이 아니다** |
| "자기 부서 데이터만 조회" (화면이 조건을 고정) | 서버가 로그인 사용자로부터 범위를 정하고 SQL `WHERE`에 넣는다. 요청 파라미터의 부서코드를 믿지 않는다 |
| 행 상태 일관성 (삭제된 행 수정 불가 등) | 서비스에서 상태 전이 검증 |

- Spring Framework 6.1+는 컨트롤러 메서드 검증을 내장한다. `@RequestBody`에 `@Valid`를 붙이면 객체 검증(`MethodArgumentNotValidException`), 메서드 파라미터에 직접 제약을 붙이면 메서드 검증(`HandlerMethodValidationException`)이 일어난다. 6.1 내장 메서드 검증을 쓰려면 컨트롤러 클래스의 `@Validated`를 제거한다. 두 예외 모두 `ResponseEntityExceptionHandler`가 ProblemDetail(400)로 처리한다.
- `@RequestBody`가 `List<…>` 자체이면 객체 단위 검증이 적용되지 않는다(컨테이너는 command object가 아님). §3처럼 record로 감싸면 단순해진다.
- 금액·단가처럼 **서버가 계산할 수 있는 값은 클라이언트 값을 저장하지 않는다**. 넥사크로 화면에서 계산해 보내던 합계 컬럼은 서버에서 재계산한다.
- IDOR 방지: `deleted[]`·`updated[]`의 ID마다 소유/권한 범위를 `WHERE`에 넣어 확인한다(§4-2 예시의 `tenant_id`). 영향 행 수 0이면 409/404 구분 없이 실패로 처리해도 정보 노출이 적다.
- Bean Validation 어노테이션 목록·커스텀 Validator 작성은 `global-exception-validation` 스킬을 따른다.

---

## 7. 엑셀(xeni) 대체 — 서버 Apache POI SXSSF 다운로드 엔드포인트

넥사크로는 `nexacro-xeni` 모듈로 Grid 내용을 엑셀로 export/import한다(설정은 `nexacro-xapi-server` 스킬 7절). REST 전환 후에는 서버가 같은 조회 조건으로 데이터를 읽어 직접 xlsx를 만드는 엔드포인트로 대체하는 것이 일반적이다. 화면 Grid의 서식·병합을 그대로 재현하려 하지 말고 **업무에 필요한 열·형식을 명세로 다시 정한다**.

SXSSF 핵심(공식 how-to):
- 슬라이딩 윈도 안의 행만 메모리에 두고, 윈도 밖 행은 디스크(임시 파일)로 내보낸다. 기본 윈도는 100행(`new SXSSFWorkbook(int windowSize)`).
- **내보낸 행은 다시 접근할 수 없다** — 행을 다 쓴 뒤 앞 행을 고치는 로직(합계 행을 맨 위에 넣기 등)은 순서를 바꿔야 한다.
- 병합 영역·하이퍼링크·코멘트 등은 윈도와 무관하게 **메모리에 남는다** — 병합을 많이 쓰면 메모리가 커진다.
- 임시 파일 압축: `setCompressTempFiles(true)`.

```java
@GetMapping(value = "/export", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
void export(@Valid OrderSearchCond cond, HttpServletResponse res, @AuthenticationPrincipal LoginUser user) throws IOException {
    res.setHeader(HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment().filename("orders.xlsx", StandardCharsets.UTF_8).build().toString());

    SXSSFWorkbook wb = new SXSSFWorkbook(100);
    try {
        wb.setCompressTempFiles(true);
        Sheet sheet = wb.createSheet("orders");
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("주문번호");
        header.createCell(1).setCellValue("고객명");
        header.createCell(2).setCellValue("금액");

        int[] r = {1};
        orderService.streamForExport(cond, user, row -> {          // 대량이면 MyBatis ResultHandler/Cursor로 스트리밍
            Row x = sheet.createRow(r[0]++);
            x.createCell(0).setCellValue(row.orderId());
            x.createCell(1).setCellValue(row.customerName());
            x.createCell(2).setCellValue(row.amount().doubleValue());
        });
        wb.write(res.getOutputStream());
    } finally {
        wb.dispose();   // 임시 파일 삭제 (5.3.0 미만에서는 필수)
        wb.close();
    }
}
```

> 주의: POI how-to 문서는 "SXSSF allocates temporary files that you **must** always clean up explicitly"(`dispose()`)라고 쓰지만, POI 변경 이력상 **5.3.0(2024-07-02)부터 `SXSSFWorkbook.close()`가 임시 파일을 지운다**(Bug 68183). 사용하는 POI 버전이 5.3.0 이상인지 모를 때는 위처럼 `dispose()`와 `close()`를 모두 호출한다.

- 권한·조회 범위 검사는 조회 API와 똑같이 적용한다. 엑셀 엔드포인트만 검사를 빠뜨리는 실수가 흔하다.
- 행 수 상한을 둔다(예: 조회 조건 기간 제한). 무제한 export는 서버 자원 고갈 공격 표면이다.
- 사용자 입력 문자열이 `=`, `+`, `-`, `@`로 시작하면 엑셀에서 수식으로 해석될 수 있다(CSV/수식 인젝션) — 문자열 셀은 수식이 아닌 값으로 쓰고, 필요하면 앞에 `'`를 붙이는 정책을 정한다.
- 엑셀 **업로드**(xeni import 대체)는 업로드 파일을 신뢰하지 않는다 — `spring.servlet.multipart.max-file-size`·`max-request-size`로 크기 상한, 확장자 화이트리스트(`.xlsx`) + 내용 시그니처 확인(xlsx는 ZIP `PK\x03\x04`로 시작), 읽기 전 행 수·셀 길이 상한을 정한 뒤 POI로 읽는다. 읽은 행은 §3 배치 DTO로 만들어 같은 Bean Validation·권한 검사·트랜잭션을 거친다.

---

## 8. 마이그레이션 체크리스트

**화면 1개(서비스 1개) 단위로 반복한다.**

1. [ ] 기존 서비스의 입력/출력 Dataset·Variable 목록과 컬럼 타입을 표로 뽑았다 (`nexacro-xapi-server` 체크리스트, `legacy-spec-extractor` 에이전트 — spec-extraction 템플릿 함께 설치 시)
2. [ ] 한 서비스 URL에 섞인 여러 작업(조회+저장)을 REST 엔드포인트로 나눴다
3. [ ] 요청/응답 record를 만들고 날짜·금액 타입을 Java 타입으로 정했다 (§2-2)
4. [ ] `ErrorCode` 음수 분기들을 목록화해 HTTP 상태 + ProblemDetail로 대응시켰다 (§2-4)
5. [ ] 행 타입 저장 로직을 `created`/`updated`/`deleted` 배치로 옮기고, 처리 순서를 레거시와 같게 고정했다 (§3)
6. [ ] 레거시가 `OrgRow`(원래값)를 `WHERE`에 쓰고 있었는지 확인하고, version/원래값 비교로 대체했다 (§4)
7. [ ] 영향 행 수 0을 실패로 처리하고 전체 롤백되는지 테스트했다
8. [ ] checked 예외 롤백 여부(`rollbackFor`)와 `catch (Throwable)` 삼킴을 제거했다
9. [ ] 화면 스크립트의 검증·권한 로직을 서버 Bean Validation·권한 검사로 옮겼다 (§6)
10. [ ] 배열 크기·문자열 길이·export 행 수 상한을 정했다
11. [ ] 전환기 X-API 어댑터가 같은 서비스·같은 DTO를 쓰는지 확인했다 (§5)
12. [ ] 엑셀 export/import를 SXSSF 엔드포인트로 대체하고 임시 파일 정리를 확인했다 (§7)
13. [ ] 레거시와 신규의 조회·저장·오류 결과 동등성 테스트 + 권한 우회·잘못된 입력 적대적 테스트를 만들었다 (`migration-parity-tester` 에이전트, `testing-junit5-spring-boot` 스킬)
14. [ ] 프론트 화면의 성공/실패 분기(`nErrorCode < 0` → HTTP 상태)를 바꿨다

---

## 9. 흔한 실수

| 실수 | 결과 | 바로잡기 |
|------|------|---------|
| 성공 응답 본문에 `errorCode`/`errorMsg`를 그대로 두고 HTTP는 항상 200 | 캐시·모니터링·클라이언트 라이브러리가 실패를 성공으로 본다 | HTTP 상태 + ProblemDetail |
| Dataset 하나를 `List<Map<String,Object>>`로 받음 | 타입·검증이 사라지고 오타 컬럼이 조용히 무시된다 | 컬럼별 record |
| 삭제 행 처리를 빠뜨림 (X-API에서 삭제 행은 별도 버퍼에 있어 `getRowCount()` 루프에 안 보임) | 화면에서 지운 행이 DB에 남는다 | `deleted[]`를 별도 필드로, 레거시 삭제 처리 위치를 먼저 찾는다 |
| 행마다 별도 HTTP 호출(행 단위 PUT/DELETE를 반복) | 중간 실패 시 일부만 반영 — 레거시의 "한 번에 저장"이 깨진다 | 배치 엔드포인트 + 한 트랜잭션 |
| 서비스 안에서 예외를 잡아 실패 객체 반환 | 트랜잭션 커밋 → 부분 저장 | 예외는 던지고 advice에서 변환 |
| `OrgRow` 기반 동시성 보호를 옮기지 않음 | 나중 저장이 앞 저장을 조용히 덮어씀 | version 또는 원래값 조건부 UPDATE + 영향 행 수 확인 |
| 화면이 걸러 주던 검증을 서버에 안 옮김 | 직접 API 호출로 음수 수량·타 부서 데이터 수정 | Bean Validation + 서버 권한 범위 `WHERE` |
| 요청 본문의 사용자ID·부서코드를 신뢰 | 수평 권한 상승(IDOR) | 인증 주체에서 꺼낸다 |
| X-API 어댑터와 REST 컨트롤러에 업무 로직을 각각 복사 | 두 경로 결과가 달라짐 | 서비스 계층 하나 + 같은 DTO |
| Boot 3 앱에 javax 기반 X-API jar를 넣음 | 서블릿 타입 불일치로 기동/호출 실패 | §5 — Jakarta jar(라이선스 확인) 또는 앱 분리 |
| SXSSF에서 `dispose()`/`close()` 누락 | 임시 디렉터리에 파일 누적 | `finally`에서 정리 |
| 엑셀 export 엔드포인트만 권한·행수 제한 누락 | 대량 데이터 유출·서버 부하 | 조회 API와 같은 검사 + 상한 |
