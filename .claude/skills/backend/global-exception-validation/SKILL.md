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

## Bean Validation 표준 어노테이션

| 어노테이션 | 적용 대상 | 설명 |
|-----------|----------|------|
| `@NotNull` | 모든 타입 | null 금지 (빈 문자열 허용) |
| `@NotBlank` | CharSequence | null·빈 문자열·공백만 있는 문자열 금지 |
| `@NotEmpty` | CharSequence / Collection / Map / Array | null·빈 값 금지 |
| `@Size(min, max)` | CharSequence / Collection / Map / Array | 크기 제약 |
| `@Min(n)` / `@Max(n)` | 숫자 | 정수 범위 |
| `@Positive` / `@PositiveOrZero` | 숫자 | 양수 제약 |
| `@Negative` / `@NegativeOrZero` | 숫자 | 음수 제약 |
| `@Email` | CharSequence | 이메일 형식 (기본 정규식은 느슨함, 필요시 `regexp` 속성 지정) |
| `@Pattern(regexp)` | CharSequence | 정규식 매칭 |
| `@Past` / `@PastOrPresent` / `@Future` / `@FutureOrPresent` | 시간 | 시간 제약 |
| `@Digits(integer, fraction)` | 숫자 | 정수부·소수부 자릿수 제약 |

```java
package com.example.api.user;

import jakarta.validation.constraints.*;

public record CreateUserRequest(
    @NotBlank(message = "이름은 필수입니다.")
    @Size(max = 50, message = "이름은 50자 이하여야 합니다.")
    String name,

    @NotBlank
    @Email(message = "유효한 이메일 형식이 아닙니다.")
    String email,

    @NotNull
    @Min(value = 0, message = "나이는 0 이상이어야 합니다.")
    @Max(value = 150, message = "나이는 150 이하여야 합니다.")
    Integer age,

    @Pattern(
        regexp = "^01[0-9]-\\d{3,4}-\\d{4}$",
        message = "전화번호 형식이 올바르지 않습니다."
    )
    String phone
) {}
```

---

## Controller에서 @Valid / @Validated 사용

```java
package com.example.api.user;

import com.example.api.common.error.ErrorResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@Validated  // ← 클래스 레벨: @PathVariable/@RequestParam 검증에 필수
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // @RequestBody 검증 → @Valid로 충분, 실패 시 MethodArgumentNotValidException
    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
        return ResponseEntity.ok(userService.create(req));
    }

    // @PathVariable 검증 → 클래스에 @Validated 필요, 실패 시 ConstraintViolationException
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> get(@PathVariable @Min(1) Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    // @RequestParam 검증
    @GetMapping
    public ResponseEntity<?> list(@RequestParam @Min(1) int page) {
        return ResponseEntity.ok(userService.list(page));
    }
}
```

### @Valid vs @Validated 선택 기준

| 상황 | 어노테이션 | 예외 타입 |
|------|-----------|----------|
| `@RequestBody` DTO 검증 | `@Valid` (또는 `@Validated`) | `MethodArgumentNotValidException` |
| `@PathVariable`, `@RequestParam` 검증 | 클래스에 `@Validated` + 파라미터에 제약 어노테이션 | `ConstraintViolationException` |
| 그룹 기반 검증이 필요할 때 | `@Validated(Group.class)` | 상황에 따름 |
| 중첩 객체 내부 재귀 검증 | 필드에 `@Valid` | 상위 경로 예외와 동일 |

> 주의: `@Valid`는 Jakarta Bean Validation 표준(`jakarta.validation.Valid`), `@Validated`는 Spring 전용(`org.springframework.validation.annotation.Validated`)입니다. 그룹 지원은 Spring의 `@Validated`에만 있습니다.

---

## 중첩 검증

```java
public record OrderRequest(
    @NotNull
    @Valid                          // ← 없으면 Address 내부 필드 검증이 실행되지 않음
    Address shippingAddress,

    @NotEmpty
    @Valid                          // ← 컬렉션 내부 각 OrderItem 도 검증
    List<OrderItem> items
) {}

public record Address(
    @NotBlank String zipCode,
    @NotBlank String line1,
    @Size(max = 200) String line2
) {}

public record OrderItem(
    @NotNull Long productId,
    @Min(1) int quantity
) {}
```

---

## 그룹 검증 (Create/Update 구분)

```java
// 1) 마커 인터페이스
public interface OnCreate {}
public interface OnUpdate {}

// 2) DTO에 그룹별 제약 부여
public record UserUpsertRequest(
    @NotNull(groups = OnUpdate.class)          // 업데이트 시만 id 필수
    Long id,

    @NotBlank(groups = OnCreate.class)          // 생성 시만 필수
    @Size(max = 50, groups = {OnCreate.class, OnUpdate.class})
    String name,

    @NotBlank(groups = OnCreate.class)
    @Email(groups = {OnCreate.class, OnUpdate.class})
    String email
) {}

// 3) 컨트롤러에서 @Validated 로 그룹 지정
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @PostMapping
    public ResponseEntity<?> create(
        @Validated(OnCreate.class) @RequestBody UserUpsertRequest req
    ) { /* ... */ }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
        @Validated(OnUpdate.class) @RequestBody UserUpsertRequest req
    ) { /* ... */ }
}
```

> 주의: 그룹을 지정하지 않은 제약은 기본 그룹(`jakarta.validation.groups.Default`)에 속합니다. `@Validated(OnCreate.class)`로 그룹을 지정하면 기본 그룹 제약은 **실행되지 않습니다.** 두 그룹 모두 실행하려면 `@Validated({OnCreate.class, Default.class})`처럼 명시해야 합니다.

---

## 커스텀 Validator 작성

요구사항 예시: 비밀번호가 최소 1개의 대문자·소문자·숫자·특수문자를 포함하는지 검증.

### 1) 커스텀 어노테이션

```java
package com.example.api.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = StrongPasswordValidator.class)
@Documented
public @interface StrongPassword {
    String message() default "비밀번호는 대/소문자·숫자·특수문자를 포함해야 합니다.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    int minLength() default 8;
}
```

### 2) ConstraintValidator 구현

```java
package com.example.api.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StrongPasswordValidator
    implements ConstraintValidator<StrongPassword, String> {

    private int minLength;

    @Override
    public void initialize(StrongPassword annotation) {
        this.minLength = annotation.minLength();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return true; // null 은 @NotNull 이 담당
        if (value.length() < minLength) return false;

        boolean hasUpper = value.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = value.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = value.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = value.chars().anyMatch(c -> "!@#$%^&*()".indexOf(c) >= 0);

        return hasUpper && hasLower && hasDigit && hasSpecial;
    }
}
```

### 3) 사용

```java
public record SignUpRequest(
    @NotBlank
    @Email
    String email,

    @NotBlank
    @StrongPassword(minLength = 10)
    String password
) {}
```

> 주의:
> - `isValid`는 null 처리를 `@NotNull`에 위임하고 `null → true`로 반환하는 것이 관례다 (Hibernate Validator 공식 패턴).
> - Bean 주입이 필요한 Validator(예: DB 중복 체크)는 `@Component`로 등록하지 않아도 Spring의 `LocalValidatorFactoryBean`이 DI를 처리한다. 생성자/필드 주입을 그대로 쓰면 된다.
> - Spring Boot 2.x에서는 `jakarta.validation.*` → `javax.validation.*`으로 치환한다.

---

## 권장 HTTP 상태 코드 매핑

| HTTP | 의미 | 발생 상황 |
|------|------|----------|
| 400 Bad Request | 요청 형식/검증 실패 | `MethodArgumentNotValidException`, `ConstraintViolationException`, `HttpMessageNotReadableException`(JSON 파싱 실패) |
| 401 Unauthorized | 인증 필요/실패 | 토큰 없음, 만료, 위조 |
| 403 Forbidden | 권한 부족 | 인증은 되었으나 리소스 접근 권한 없음 |
| 404 Not Found | 리소스 없음 | `XxxNotFoundException` |
| 409 Conflict | 상태 충돌 | 중복 이메일, 낙관적 락 실패 |
| 422 Unprocessable Entity | 의미적 검증 실패 | (선택) 형식은 맞지만 비즈니스 규칙 위반 |
| 500 Internal Server Error | 서버 내부 오류 | 예상치 못한 예외 |

---

## 흔한 실수 패턴

1. **`spring-boot-starter-validation` 빠뜨림 (SB 2.3+)**
   - 어노테이션을 달아도 검증이 조용히 무시된다. 반드시 starter를 추가한다.

2. **`javax`와 `jakarta` 네임스페이스 혼용 (SB 3.x)**
   - 예전 블로그 코드를 복사하면 `javax.validation.constraints.NotBlank`가 섞인다. Spring Boot 3.x에서는 어노테이션이 무시되므로 일괄 치환 필수.

3. **클래스에 `@Validated` 없이 `@PathVariable`에 `@Min` 걸기**
   - Spring이 파라미터 레벨 제약을 스캔하지 않아 검증이 실행되지 않는다. 컨트롤러 클래스에 `@Validated`를 붙여야 한다.

4. **`ConstraintViolationException`을 핸들링하지 않음**
   - 기본 응답이 HTTP 500이 되어 클라이언트가 서버 오류로 오인한다. 전용 핸들러에서 400으로 돌린다.

5. **중첩 객체에 `@Valid` 빼먹음**
   - `@Valid List<OrderItem>` 없이 `List<OrderItem>`만 선언하면 내부 `OrderItem`의 제약은 실행되지 않는다.

6. **검증 그룹 지정 시 `Default` 누락**
   - `@Validated(OnCreate.class)`만 쓰면 그룹 없는(기본) 제약이 실행되지 않는다. `@Validated({OnCreate.class, Default.class})`로 명시.

7. **`@RestControllerAdvice` 대신 `@ControllerAdvice` 사용**
   - `@ResponseBody`가 빠져 반환 객체가 JSON으로 직렬화되지 않고 뷰 이름으로 해석되어 404/500이 발생한다. REST API는 `@RestControllerAdvice`.

8. **비즈니스 예외를 Checked Exception으로 선언**
   - `@Transactional`이 기본적으로 `RuntimeException`에만 롤백하므로 의도치 않게 커밋된다. `RuntimeException`을 상속하거나 `@Transactional(rollbackFor = ...)` 지정.

9. **`Exception.class` fallback 핸들러가 스택트레이스를 응답에 그대로 노출**
   - 보안상 내부 메시지를 마스킹하고, 서버 로그에는 full stacktrace를 남긴다.

10. **커스텀 Validator에서 null 처리**
    - `null`에 대해 `false`를 반환하면 `@NotNull` 없이도 null 금지가 암묵적으로 적용되어 단일 책임이 깨진다. `null → true`로 돌리고 null 금지는 `@NotNull`에 위임한다.

---

## 테스트 예시 (참고용)

```java
@WebMvcTest(UserController.class)
class UserControllerValidationTest {

    @Autowired MockMvc mockMvc;
    @MockBean UserService userService;

    @Test
    void 잘못된_이메일은_400과_VALIDATION_FAILED_코드를_반환한다() throws Exception {
        String body = """
            { "name": "홍길동", "email": "not-an-email", "age": 30 }
            """;

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
            .andExpect(jsonPath("$.errors[0].field").value("email"));
    }
}
```
