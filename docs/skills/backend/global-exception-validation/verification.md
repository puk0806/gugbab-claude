---
skill: global-exception-validation
category: backend
version: v1
date: 2026-04-22
status: APPROVED
---

# Spring Boot 글로벌 예외 처리 + Bean Validation 스킬 검증

> 이 문서는 `docs/skills/VERIFICATION_TEMPLATE.md`를 기반으로 작성되었습니다.

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증) — 완료 ✅
  ├─ 공식 문서 기반으로 내용 작성 ✅
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST  ← 현재 상태

[2단계] 실제 사용 중 (온라인 검증) — 미실시
  └─ java-backend-developer 에이전트에서 테스트 후 APPROVED 전환
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `global-exception-validation` |
| 스킬 경로 | `.claude/skills/backend/global-exception-validation/SKILL.md` |
| 검증일 | 2026-04-22 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 버전 기준 | Spring Boot 2.x(`javax`) / Spring Boot 3.x(`jakarta`) 병기, Hibernate Validator 6.x / 8.x |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Spring Framework Reference, Hibernate Validator docs, Spring Boot reference)
- [✅] 공식 GitHub 2순위 소스 확인 (spring-projects/spring-boot, hibernate/hibernate-validator)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-04-22, SB 3.5.x/4.0.x 활성 지원)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (@RestControllerAdvice, ErrorResponse, ErrorCode enum, Business 예외)
- [✅] 코드 예시 작성 (Java 17+ record 기준)
- [✅] 흔한 실수 패턴 정리 (10건)
- [✅] SKILL.md 파일 작성
- [✅] javax ↔ jakarta 네임스페이스 매핑표 포함
- [✅] 권장 HTTP 상태 코드 매핑표 포함

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | VERIFICATION_TEMPLATE.md, 기존 axum SKILL.md | 섹션 구조·frontmatter 형식 파악 |
| 조사 | WebSearch | "Spring Boot 3 @ControllerAdvice @ExceptionHandler best practices 2025" | 10개 소스, 핵심: @RestControllerAdvice, 다수 advice 가능, ProblemDetail 지원(SF 6.2+) |
| 조사 | WebSearch | "jakarta.validation vs javax.validation Spring Boot 3 migration" | 10개 소스, 핵심: SB3 = jakarta, HV 8.x 기준 |
| 조사 | WebSearch | "Spring Boot 3.4 current version latest stable 2025 2026" | SB 3.4 EOL(2025-12-31), 활성 지원 3.5.x/4.0.x |
| 조사 | WebSearch | "MethodArgumentNotValidException BindingResult field errors" | getBindingResult().getFieldErrors() 패턴 확인 |
| 조사 | WebSearch | "ConstraintValidator custom validator Spring Boot" | isValid/initialize 구조, DI 자동 주입 |
| 조사 | WebSearch | "Spring Boot validation groups @Validated" | Create/Update 마커 인터페이스 + @Validated(Group.class) |
| 조사 | WebSearch | "spring-boot-starter-validation 2.3 split" | SB 2.3부터 starter-web에서 분리 확인 |
| 조사 | WebSearch | "Spring @ExceptionHandler ProblemDetail docs" | ProblemDetail/ErrorResponse 반환 가능 |
| 조사 | WebSearch | "Spring Boot Micrometer Tracing traceId MDC" | SB3: Sleuth → Micrometer Tracing, MDC 키 X-B3-TraceId → traceId |
| 조사 | WebSearch | "Hibernate Validator 8 Jakarta Bean Validation 3" | HV 8.0.3.Final / HV 9.1(JBV 3.1) |
| 조사 | WebSearch | "@Valid @Validated difference nested validation" | @Valid=JSR 표준, @Validated=Spring 전용(그룹 지원) |
| 조사 | WebSearch | "ConstraintViolationException PathVariable @Validated class level" | 클래스 @Validated 필요, 기본 HTTP 500 → 400으로 재매핑 필요 |
| 교차 검증 | WebSearch | 11개 핵심 클레임, 독립 소스 2+개씩 | VERIFIED 11 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Spring Framework Reference — Exceptions | https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html | ⭐⭐⭐ High | 2026-04-22 | @ExceptionHandler 인자·반환 타입 공식 스펙 |
| Spring Framework Reference — Error Responses | https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html | ⭐⭐⭐ High | 2026-04-22 | ProblemDetail(RFC 9457) 반환 관련 |
| Spring Framework Reference — Validation | https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html | ⭐⭐⭐ High | 2026-04-22 | @Valid/@Validated 사용법 |
| Spring Framework Javadoc — MethodArgumentNotValidException | https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/MethodArgumentNotValidException.html | ⭐⭐⭐ High | 2026-04-22 | getBindingResult() API |
| Spring Framework Javadoc — BindingResult | https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/validation/BindingResult.html | ⭐⭐⭐ High | 2026-04-22 | FieldError 접근 |
| Spring Framework Javadoc — Validated | https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/validation/annotation/Validated.html | ⭐⭐⭐ High | 2026-04-22 | 그룹 검증 공식 API |
| Spring Boot Reference — Tracing | https://docs.spring.io/spring-boot/reference/actuator/tracing.html | ⭐⭐⭐ High | 2026-04-22 | Micrometer Tracing + MDC 키 |
| Spring Boot 3.0 Migration Guide | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide | ⭐⭐⭐ High | 2026-04-22 | javax → jakarta 네임스페이스 이전 |
| Spring Boot Releases (GitHub) | https://github.com/spring-projects/spring-boot/releases | ⭐⭐⭐ High | 2026-04-22 | 현재 지원 버전 확인 (3.4 EOL, 3.5.x/4.0.x 활성) |
| Spring Boot Release Blog (3.5) | https://spring.io/blog/2025/05/22/spring-boot-3-5-0-available-now/ | ⭐⭐⭐ High | 2026-04-22 | 3.5.x 릴리즈 공식 공지 |
| Hibernate Validator 8.0 Reference | https://docs.hibernate.org/validator/8.0/reference/en-US/html_single/ | ⭐⭐⭐ High | 2026-04-22 | SB 3.x 기준 구현체 공식 문서 |
| Hibernate Validator Releases | https://hibernate.org/validator/releases/ | ⭐⭐⭐ High | 2026-04-22 | 8.0.3.Final / 9.1 버전 확인 |
| Jakarta Bean Validation 3.0 | https://beanvalidation.org/3.0/ | ⭐⭐⭐ High | 2026-04-22 | Jakarta Validation 표준 스펙 |
| Maven Central — spring-boot-starter-validation | https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-validation | ⭐⭐⭐ High | 2026-04-22 | starter-web 분리 시점 확인 |
| Baeldung — Error Handling for REST with Spring | https://www.baeldung.com/exception-handling-for-rest-with-spring | ⭐⭐ Medium | 2026-04-22 | 교차 확인용 |
| Baeldung — Validating RequestParams and PathVariables | https://www.baeldung.com/spring-validate-requestparam-pathvariable | ⭐⭐ Medium | 2026-04-22 | ConstraintViolationException 동작 교차 확인 |
| Reflectoring — Validation with Spring Boot | https://reflectoring.io/bean-validation-with-spring-boot/ | ⭐⭐ Medium | 2026-04-22 | 그룹/커스텀 검증 교차 확인 |
| Spring Blog — Observability with Spring Boot 3 | https://spring.io/blog/2022/10/12/observability-with-spring-boot-3/ | ⭐⭐⭐ High | 2026-04-22 | Sleuth → Micrometer Tracing 전환 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (SB 2.x/3.x, HV 6.x/8.x, Spring Framework 6+)
- [✅] deprecated된 패턴을 권장하지 않음 (Sleuth 대신 Micrometer Tracing, javax는 레거시 표기)
- [✅] 코드 예시가 실행 가능한 형태임 (Java 17 record, 실제 import 경로 포함)

#### 교차 검증 결과 요약

| 번호 | 클레임 | 판정 | 근거 |
|------|--------|------|------|
| 1 | SB 2.3+부터 `spring-boot-starter-validation`이 `starter-web`에서 분리됨 | VERIFIED | Baeldung + Maven Central + reflectoring.io 일치 |
| 2 | SB 3.x는 `jakarta.validation.*` 사용, SB 2.x는 `javax.validation.*` | VERIFIED | Spring Boot 3.0 Migration Guide + Hibernate Validator 8.0 docs |
| 3 | `@RestControllerAdvice`는 `@ControllerAdvice` + `@ResponseBody`의 조합 | VERIFIED | Spring Framework Reference + 다수 Medium 기사 |
| 4 | `@RequestBody` 검증 실패 → `MethodArgumentNotValidException` | VERIFIED | Spring Framework Javadoc + Baeldung |
| 5 | `@PathVariable`/`@RequestParam` 검증 실패 → `ConstraintViolationException` (클래스에 `@Validated` 필요) | VERIFIED | Baeldung + reflectoring.io + Spring issue #10471 |
| 6 | `ConstraintViolationException`은 기본 HTTP 500 (핸들러 없으면) | VERIFIED | Spring issue #10471 + reflectoring.io |
| 7 | `@Valid`는 JSR/Jakarta 표준, `@Validated`는 Spring 전용(그룹 지원) | VERIFIED | Baeldung + Spring Javadoc + codestudy.net |
| 8 | 중첩 객체 검증은 필드에 `@Valid` 필수 | VERIFIED | Baeldung + Jakarta Validation 3.0 스펙 |
| 9 | `@Validated(Group.class)`는 그룹 없는 제약을 실행하지 않음 (Default 명시 필요) | VERIFIED | Hibernate Validator 5.1 Chapter 5 Grouping + Spring Validated Javadoc |
| 10 | `ConstraintValidator.isValid`에서 null은 `@NotNull`이 담당하도록 true 반환 관례 | VERIFIED | Hibernate Validator docs + Baeldung custom validator 예시 |
| 11 | SB 3부터 Sleuth는 Micrometer Tracing으로 대체, MDC 키는 `traceId`/`spanId` | VERIFIED | Spring Blog + Spring Boot Reference (tracing) |

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (상단에 5개 공식 URL + 2026-04-22)
- [✅] 핵심 개념 설명 포함 (@RestControllerAdvice, ErrorResponse, ErrorCode, Business 예외, Bean Validation)
- [✅] 코드 예시 포함 (DTO, ErrorCode enum, 커스텀 예외, Advice, 컨트롤러, 커스텀 Validator, 테스트)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 ("언제 사용하는가" 섹션 + @Valid vs @Validated 표)
- [✅] 흔한 실수 패턴 포함 (10건)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (완성된 6계층 예시: ErrorCode enum → Exception → Advice → DTO → Controller → Test)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (실제 User/Order 도메인 예시)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X, 회사명·프레임워크 고유 코드 없음)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-04-22, general-purpose로 대체 실행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 — `MethodArgumentNotValidException`·`ConstraintViolationException` 핸들러 + `@Validated` 클래스 레벨 어노테이션 정확히 제시
- [✅] 잘못된 응답 없음 — 보완 불필요

---

## 5. 테스트 진행 기록

**수행일**: 2026-04-22
**수행 방법**: general-purpose 에이전트에게 SKILL.md만 Read한 뒤 2개 실전 질문 답변.

### 실제 수행 테스트

**Q1. `@Valid` 실패 시 공통 JSON 에러 응답 (`MethodArgumentNotValidException` 핸들러)**
- ✅ PASS. 에이전트가 "공통 ErrorResponse DTO"(89-117) + "@RestControllerAdvice 글로벌 예외 처리" 섹션 근거로 `ErrorResponse` record, `GlobalExceptionHandler`에서 `getBindingResult().getFieldErrors()` 스트림 변환, `ErrorCode.VALIDATION_FAILED` enum 매핑까지 정확 제시.

**Q2. `@PathVariable @Min(1)` 검증 + `ConstraintViolationException` 처리**
- ✅ PASS. "Controller에서 @Valid / @Validated 사용"(390-431) + "흔한 실수 패턴 3"(616-620) 근거로 **클래스 레벨 `@Validated` 필수** 올바르게 지적. `ex.getConstraintViolations().stream()` → `FieldError` 변환 핸들러 작성.

### 발견된 gap (경미)

- 질문의 커스텀 JSON 스펙(`{code, message, errors:[{field, message}]}`)과 SKILL.md의 ErrorResponse 구조(`path/timestamp/traceId/rejectedValue` 포함)가 다를 때 커스터마이징 방법 가이드 부재

---

### (참고) 초기 작성 시 제시한 권장 테스트 케이스

### 테스트 케이스 1: Spring Boot 3 + jakarta 네임스페이스로 User 생성 API 검증

**입력 (질문/요청):**
```
Spring Boot 3.5 프로젝트에서 POST /api/v1/users 엔드포인트에 이메일·이름·나이 검증을 붙이고,
검증 실패 시 400과 필드별 에러 메시지를 반환하는 전체 코드를 작성해줘.
```

**기대 결과:**
- `jakarta.validation.constraints.*` import 사용
- `CreateUserRequest` DTO에 `@NotBlank`, `@Email`, `@Min` 적용
- `@RestControllerAdvice`에 `MethodArgumentNotValidException` 핸들러 등록
- `ErrorResponse`에 `errors` 배열 포함 (field, rejectedValue, message)
- `spring-boot-starter-validation` 의존성 명시

**실제 결과:** {테스트 후 기록}

**판정:** ⏳ PENDING

---

### 테스트 케이스 2: PathVariable 검증 + ConstraintViolationException 핸들링

**입력:**
```
GET /api/v1/users/{id} 에서 id가 1 미만이면 400을 돌리고 싶은데,
현재 500이 떨어져. 어떻게 고치지?
```

**기대 결과:**
- 컨트롤러 클래스에 `@Validated` 추가 필요
- `@PathVariable @Min(1) Long id` 사용
- `@ExceptionHandler(ConstraintViolationException.class)` 추가로 400 매핑
- `ex.getConstraintViolations()`에서 `propertyPath`, `invalidValue`, `message` 추출

**판정:** ⏳ PENDING

---

### 테스트 케이스 3: 커스텀 Validator (비밀번호 강도)

**입력:**
```
비밀번호가 대·소문자·숫자·특수문자를 모두 포함해야 한다는 커스텀 검증을 만들어줘.
jakarta 네임스페이스 기준.
```

**기대 결과:**
- `@Constraint(validatedBy = ...)` 어노테이션 정의
- `ConstraintValidator<StrongPassword, String>` 구현
- `initialize` + `isValid` 구현, null은 true 반환
- message/groups/payload 필드 필수 포함

**판정:** ⏳ PENDING

---

### 테스트 케이스 4: 그룹 검증 Create/Update 구분

**입력:**
```
같은 DTO로 POST(생성)와 PUT(업데이트)을 처리하되, 생성 시에만 name이 필수고
업데이트 시에는 id가 필수인 그룹 검증을 구현해줘.
```

**기대 결과:**
- `OnCreate`, `OnUpdate` 마커 인터페이스 정의
- `@NotBlank(groups = OnCreate.class)`, `@NotNull(groups = OnUpdate.class)` 적용
- 컨트롤러에서 `@Validated(OnCreate.class)` / `@Validated(OnUpdate.class)`
- Default 그룹 함께 포함 시 `{OnCreate.class, Default.class}` 명시 언급

**판정:** ⏳ PENDING

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (11개 핵심 클레임 VERIFIED) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-04-22, 2개 질문 모두 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] 에이전트 활용 테스트 — @Valid MethodArgumentNotValidException + @PathVariable ConstraintViolationException 2건 PASS (섹션 5, general-purpose 대체, 2026-04-22)
- [⏸️] WebFlux(리액티브 스택) 차이점 서브 섹션 — 범위 확장 선택 사항, 현 Servlet MVC 기준
- [⏸️] Spring Framework 6.2+의 `ProblemDetail`(RFC 9457) 기반 대안 예시 — 선택 보강, 차단 요인 아님
- [⏸️] Kotlin 예시 추가 — 선택 보강, 현재 Java record 기준
- [📅] Hibernate Validator 9.1 / Jakarta Validation 3.1 신규 기능 반영 — 도입 시점에 검토

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-22 | v1 | 최초 작성 (SB 2.x/3.x 병기, 11개 클레임 교차 검증 완료) | skill-creator |
