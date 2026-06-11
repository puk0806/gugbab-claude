---
name: global-exception-validation
description: Spring Boot 글로벌 예외 처리 + Bean Validation 패턴 - @RestControllerAdvice, ErrorResponse DTO, 도메인 커스텀 예외, Bean Validation 어노테이션, 커스텀 Validator, javax/jakarta 네임스페이스
---

# Spring Boot 글로벌 예외 처리 + Bean Validation

> 소스:
> - https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html
> - https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html
> - https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html
> - https://docs.hibernate.org/validator/8.0/reference/en-US/html_single/
> - https://docs.spring.io/spring-boot/reference/actuator/tracing.html
>
> 검증일: 2026-04-22

> 주의: Spring Boot 3.x 기준 jakarta 네임스페이스가 기본입니다. Spring Boot 2.x (javax 네임스페이스)도 함께 다루며, 각 섹션에서 차이점을 명시합니다. Spring Boot 3.4.x는 2025-12-31 EOL, 현재 활성 지원은 3.5.x와 4.0.x입니다.

---

## 언제 사용하는가

- REST API에서 예외를 HTTP 상태 코드 + JSON 에러 응답으로 일관되게 변환하고 싶을 때
- 입력 검증을 도메인 계층이 아닌 DTO 경계에서 선언적으로 처리하고 싶을 때
- 컨트롤러마다 반복되는 try/catch 블록을 제거하고 싶을 때

---

## 의존성

### Spring Boot 3.x (jakarta 네임스페이스)

```xml
<!-- Maven -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- (선택) 분산 추적 traceId 활용 시 -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-brave</artifactId>
</dependency>
```

```kotlin
// Gradle (Kotlin DSL)
implementation("org.springframework.boot:spring-boot-starter-web")
implementation("org.springframework.boot:spring-boot-starter-validation")
implementation("io.micrometer:micrometer-tracing-bridge-brave") // 선택
```

> 주의: Spring Boot **2.3부터** `spring-boot-starter-validation`이 `starter-web`에서 분리되었습니다. 2.3 이상에서는 **반드시 명시적으로 추가**해야 Bean Validation이 동작합니다.

### Spring Boot 2.x (javax 네임스페이스)

의존성 좌표는 동일합니다. 다만 Hibernate Validator 6.x가 포함되어 `javax.validation.*`을 사용합니다. Spring Boot 3.x는 Hibernate Validator 8.x가 포함되어 `jakarta.validation.*`을 사용합니다.

---

## 네임스페이스 매핑 (javax ↔ jakarta)

| Spring Boot | Hibernate Validator | 검증 어노테이션 패키지 |
|-------------|---------------------|-----------------------|
| 2.x         | 6.x                 | `javax.validation.constraints.*` / `javax.validation.Valid` |
| 3.x         | 8.x                 | `jakarta.validation.constraints.*` / `jakarta.validation.Valid` |

```java
// Spring Boot 2.x (레거시)
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.ConstraintViolationException;

// Spring Boot 3.x (모던)
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.ConstraintViolationException;
```

> 주의: 두 네임스페이스는 혼용 불가입니다. Spring Boot 3.x에서 `javax.validation`을 import하면 어노테이션이 무시됩니다 (컴파일 에러는 없지만 검증이 실행되지 않음). OpenRewrite나 IntelliJ 마이그레이션 도구로 일괄 변경하는 것이 안전합니다.

---

## 공통 ErrorResponse DTO

```java
package com.example.api.common.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
    String code,                // 도메인 에러 코드 (예: "USER_NOT_FOUND")
    String message,             // 사람이 읽을 수 있는 메시지
    String path,                // 요청 경로 (예: /api/v1/users/42)
    OffsetDateTime timestamp,   // 발생 시각 (ISO-8601)
    String traceId,             // 분산 추적 ID (선택)
    List<FieldError> errors     // 필드 검증 에러 목록 (선택)
) {
    public record FieldError(
        String field,
        Object rejectedValue,
        String message
    ) {}
}
```

- `code`는 프론트엔드·클라이언트가 i18n 매핑 키로 사용할 수 있도록 안정적인 문자열로 유지한다.
- `errors`는 검증 실패 시에만 채우고, 그 외에는 null(`@JsonInclude(NON_NULL)`로 생략)로 둔다.
- 필요하면 RFC 9457 `ProblemDetail`을 대신 반환할 수도 있다 (Spring Framework 6+). 단, 이 스킬은 팀에서 커스터마이징이 쉬운 DTO 방식을 기준으로 한다.

### JSON 응답 스펙 커스터마이징

팀에서 요구하는 JSON 형식이 다르면 `ErrorResponse` record 필드를 조정한다. 흔한 변형:

| 요구 스펙 | 조정 방법 |
|----------|----------|
| `{code, message, errors:[{field, message}]}`처럼 **축약** | `ErrorResponse`에서 `path`/`timestamp`/`traceId` 제거, `FieldError`에서 `rejectedValue` 제거 |
| 프론트가 `status` 필드(HTTP 코드 숫자) 요구 | `int status` 필드 추가, 핸들러에서 `ErrorCode.xxx.status().value()` 주입 |
| 다국어 메시지 지원 | `message`를 `messageKey` + `messageArgs` 배열로 분리, 클라이언트에서 i18n 조립 |
| 개발/운영 환경별 상세도 차등 | `@JsonInclude` + 프로필별 Advice 분기 또는 응답 직렬화 시 필드 필터링 |

`@JsonInclude(NON_NULL)` 덕에 **불필요 필드는 응답에서 자동 생략**되므로, 단일 `ErrorResponse`를 확장 형태로 정의하고 요청별로 필요한 필드만 채우는 전략이 가장 유연하다.

---

## 도메인 커스텀 예외 계층

### 1) ErrorCode enum — 코드·메시지·HTTP 상태 매핑

```java
package com.example.api.common.error;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    // 400 Bad Request
    INVALID_REQUEST("INVALID_REQUEST", "잘못된 요청입니다.", HttpStatus.BAD_REQUEST),
    VALIDATION_FAILED("VALIDATION_FAILED", "요청 값이 유효하지 않습니다.", HttpStatus.BAD_REQUEST),

    // 401 Unauthorized
    UNAUTHORIZED("UNAUTHORIZED", "인증이 필요합니다.", HttpStatus.UNAUTHORIZED),

    // 403 Forbidden
    FORBIDDEN("FORBIDDEN", "접근 권한이 없습니다.", HttpStatus.FORBIDDEN),

    // 404 Not Found
    USER_NOT_FOUND("USER_NOT_FOUND", "사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND", "리소스를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),

    // 409 Conflict
    DUPLICATE_EMAIL("DUPLICATE_EMAIL", "이미 사용 중인 이메일입니다.", HttpStatus.CONFLICT),

    // 500 Internal Server Error
    INTERNAL_ERROR("INTERNAL_ERROR", "서버 내부 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String defaultMessage;
    private final HttpStatus status;

    ErrorCode(String code, String defaultMessage, HttpStatus status) {
        this.code = code;
        this.defaultMessage = defaultMessage;
        this.status = status;
    }

    public String code() { return code; }
    public String defaultMessage() { return defaultMessage; }
    public HttpStatus status() { return status; }
}
```

### 2) BusinessException 추상 클래스

```java
package com.example.api.common.error;

public abstract class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;

    protected BusinessException(ErrorCode errorCode) {
        super(errorCode.defaultMessage());
        this.errorCode = errorCode;
    }

    protected BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public ErrorCode errorCode() {
        return errorCode;
    }
}
```

### 3) 구체 예외

```java
package com.example.api.user;

import com.example.api.common.error.BusinessException;
import com.example.api.common.error.ErrorCode;

public class UserNotFoundException extends BusinessException {
    public UserNotFoundException(Long userId) {
        super(ErrorCode.USER_NOT_FOUND, "User not found: id=" + userId);
    }
}

public class DuplicateEmailException extends BusinessException {
    public DuplicateEmailException(String email) {
        super(ErrorCode.DUPLICATE_EMAIL, "Duplicate email: " + email);
    }
}
```

> 주의: 커스텀 예외는 `RuntimeException`을 상속한 `BusinessException`을 통해 작성한다. Checked Exception은 Spring이 `@Transactional`에서 기본적으로 롤백하지 않으므로 권장하지 않는다.

---

## @RestControllerAdvice 글로벌 예외 처리

```java
package com.example.api.common.error;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1) 도메인 비즈니스 예외
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(
        BusinessException ex,
        HttpServletRequest request
    ) {
        ErrorCode ec = ex.errorCode();
        ErrorResponse body = new ErrorResponse(
            ec.code(),
            ex.getMessage(),
            request.getRequestURI(),
            OffsetDateTime.now(),
            MDC.get("traceId"),
            null
        );
        return ResponseEntity.status(ec.status()).body(body);
    }

    // 2) @RequestBody + @Valid 실패 시
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
        MethodArgumentNotValidException ex,
        HttpServletRequest request
    ) {
        List<ErrorResponse.FieldError> fieldErrors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(fe -> new ErrorResponse.FieldError(
                fe.getField(),
                fe.getRejectedValue(),
                fe.getDefaultMessage()
            ))
            .toList();

        ErrorResponse body = new ErrorResponse(
            ErrorCode.VALIDATION_FAILED.code(),
            ErrorCode.VALIDATION_FAILED.defaultMessage(),
            request.getRequestURI(),
            OffsetDateTime.now(),
            MDC.get("traceId"),
            fieldErrors
        );
        return ResponseEntity.status(ErrorCode.VALIDATION_FAILED.status()).body(body);
    }

    // 3) @PathVariable / @RequestParam 검증 실패 시 (클래스에 @Validated 붙인 경우)
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
        ConstraintViolationException ex,
        HttpServletRequest request
    ) {
        List<ErrorResponse.FieldError> fieldErrors = ex.getConstraintViolations()
            .stream()
            .map(v -> new ErrorResponse.FieldError(
                v.getPropertyPath().toString(),
                v.getInvalidValue(),
                v.getMessage()
            ))
            .toList();

        ErrorResponse body = new ErrorResponse(
            ErrorCode.VALIDATION_FAILED.code(),
            ErrorCode.VALIDATION_FAILED.defaultMessage(),
            request.getRequestURI(),
            OffsetDateTime.now(),
            MDC.get("traceId"),
            fieldErrors
        );
        return ResponseEntity.status(ErrorCode.VALIDATION_FAILED.status()).body(body);
    }

    // 4) 최종 fallback
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(
        Exception ex,
        HttpServletRequest request
    ) {
        ErrorResponse body = new ErrorResponse(
            ErrorCode.INTERNAL_ERROR.code(),
            ErrorCode.INTERNAL_ERROR.defaultMessage(),
            request.getRequestURI(),
            OffsetDateTime.now(),
            MDC.get("traceId"),
            null
        );
        return ResponseEntity.status(ErrorCode.INTERNAL_ERROR.status()).body(body);
    }
}
```

> 주의:
> - `@RestControllerAdvice` = `@ControllerAdvice` + `@ResponseBody` (반환값이 JSON 직렬화 대상). REST API에서는 이것만 사용한다.
> - `ConstraintViolationException`은 Spring이 기본적으로 HTTP 500으로 변환한다. 위처럼 별도 핸들러를 정의해 400으로 돌려야 한다.
> - Spring Boot 2.x에서는 `jakarta.servlet` → `javax.servlet`, `jakarta.validation.ConstraintViolationException` → `javax.validation.ConstraintViolationException`으로 바꾼다.

### traceId (Micrometer Tracing) 연동

Spring Boot 3.x에서 `micrometer-tracing-bridge-*` 의존성이 있으면 MDC에 `traceId`/`spanId`가 자동으로 들어간다.

```properties
# application.properties
management.tracing.sampling.probability=1.0
logging.pattern.level=%5p [${spring.application.name:},%X{traceId:-},%X{spanId:-}]
```

> 주의: 과거에는 Spring Cloud Sleuth가 MDC에 `X-B3-TraceId`를 넣었지만, Spring Boot 3부터는 Sleuth가 Micrometer Tracing으로 대체되었고 MDC 키는 `traceId`/`spanId`입니다. Sleuth 가이드 예제는 그대로 적용되지 않습니다.

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
