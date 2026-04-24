---
name: springdoc-openapi-3
description: Springdoc OpenAPI 2.x 기반 모던 API 문서화 - Spring Boot 3.x, OpenAPI 3.1, Swagger UI, JWT 통합, GroupedOpenApi, Springfox 마이그레이션
---

# Springdoc OpenAPI 2.x (Spring Boot 3.x / Java 17+)

> 소스: https://springdoc.org/ | https://github.com/springdoc/springdoc-openapi | https://springdoc.org/faq.html | https://springdoc.org/migrating-from-springfox.html
> 검증일: 2026-04-23

> 주의: 이 문서는 **springdoc-openapi 2.x (2.8.x 기준)** + **Spring Boot 3.2 ~ 3.5** + **Java 17+** 환경을 기준으로 합니다. Spring Boot 2.x는 `springdoc-openapi v1.8.0` (별도 스킬)을 사용하고, Spring Boot 4.x는 `springdoc-openapi v3.x`를 사용합니다. 사실상의 표준이 된 Springfox 대체재이며, 레거시 Springfox(`@Api`, `@ApiOperation` 등) 어노테이션은 이 스킬에서 다루지 않습니다.

---

## 의존성 설정

### WebMVC (대부분의 Spring Boot 3.x 프로젝트)

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.8.17</version>
</dependency>
```

```kotlin
// build.gradle.kts
implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.17")
```

- 2.8.17 (2025-04-11) 기준. Spring Boot 3.5.x, swagger-core 2.2.47, swagger-ui 5.32.2 포함
- JSON만 필요하면 `springdoc-openapi-starter-webmvc-api` (UI 제외)

### WebFlux (리액티브)

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webflux-ui</artifactId>
    <version>2.8.17</version>
</dependency>
```

### Spring Boot 호환 매트릭스

| Spring Boot | springdoc-openapi | 비고 |
|-------------|-------------------|------|
| 1.5.x / 2.x | **v1.8.0** (레거시) | Jakarta 미전환. 이 스킬 범위 밖 |
| 3.0 ~ 3.5   | **v2.x** (2.8.17 최신) | Jakarta EE 9+, Java 17+ |
| 4.0+        | **v3.x** (3.0.3+) | 별도 라인 |

> 주의: springdoc 2.x는 마이너 릴리스마다 Spring Boot 의존 버전을 끌어올리므로, 프로젝트가 고정된 Spring Boot 버전을 쓰고 있다면 springdoc 버전을 임의로 최신으로 올리기 전에 호환성을 확인해야 한다.

---

## Zero-config 자동 활성화

starter만 추가하면 별도 설정 없이 다음 엔드포인트가 즉시 활성화된다.

| 엔드포인트 | 내용 |
|-----------|------|
| `/v3/api-docs` | OpenAPI JSON 스펙 |
| `/v3/api-docs.yaml` | OpenAPI YAML 스펙 |
| `/swagger-ui.html` | Swagger UI 진입점 (실제로는 `/swagger-ui/index.html`로 리다이렉트) |
| `/swagger-ui/index.html` | Swagger UI 본체 |

> **OpenAPI 3.1 기본값:** springdoc 2.8.0부터 기본 스펙 버전이 **OpenAPI 3.1**로 변경되었다. 3.0으로 고정하려면 `springdoc.api-docs.version=openapi_3_0`.

---

## 전역 API 정보: `OpenAPI` Bean

title/version/contact/license/server 목록은 `OpenAPI` Bean으로 지정한다.

```java
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI apiInfo() {
        return new OpenAPI()
            .info(new Info()
                .title("User API")
                .description("유저 도메인 REST API")
                .version("v1.0.0")
                .contact(new Contact()
                    .name("Backend Team")
                    .email("backend@example.com"))
                .license(new License()
                    .name("Apache 2.0")
                    .url("https://www.apache.org/licenses/LICENSE-2.0")))
            .servers(List.of(
                new Server().url("https://api.example.com").description("Prod"),
                new Server().url("https://api-stg.example.com").description("Staging"),
                new Server().url("http://localhost:8080").description("Local")
            ));
    }
}
```

---

## 컨트롤러/엔드포인트 어노테이션 (io.swagger.v3)

springdoc이 사용하는 어노테이션은 모두 `io.swagger.v3.oas.annotations` 패키지다. Springfox의 `io.swagger.annotations`(v2)와 다르다.

### `@Tag` — 컨트롤러 그룹

```java
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User", description = "유저 관리 API")
public class UserController {
    // ...
}
```

### `@Operation` — 각 엔드포인트 설명

```java
import io.swagger.v3.oas.annotations.Operation;

@Operation(
    summary = "유저 단건 조회",
    description = "ID로 유저 정보를 조회한다. 관리자만 다른 유저 조회 가능."
)
@GetMapping("/{id}")
public UserDto findOne(@PathVariable Long id) { ... }
```

### `@Parameter` — 파라미터 설명

```java
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;

@GetMapping
public List<UserDto> list(
    @Parameter(description = "검색어 (이름/이메일 부분 일치)", example = "john")
    @RequestParam(required = false) String q,

    @Parameter(description = "페이지 (0부터 시작)", in = ParameterIn.QUERY, example = "0")
    @RequestParam(defaultValue = "0") int page
) { ... }
```

### `@ApiResponse` / `@ApiResponses` — 응답 정의

```java
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@Operation(summary = "유저 생성")
@ApiResponses({
    @ApiResponse(responseCode = "201", description = "생성 성공",
        content = @Content(schema = @Schema(implementation = UserDto.class))),
    @ApiResponse(responseCode = "400", description = "요청 값 오류",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
    @ApiResponse(responseCode = "409", description = "이메일 중복")
})
@PostMapping
public ResponseEntity<UserDto> create(@RequestBody @Valid CreateUserReq req) { ... }
```

> 주의: springdoc에서 `responseCode`는 **String**이다 (Springfox의 `code = 404` → springdoc `responseCode = "404"`).

### `@Schema` — DTO 필드 문서화

```java
import io.swagger.v3.oas.annotations.media.Schema;

public record CreateUserReq(
    @Schema(description = "유저명", example = "john_doe", minLength = 3, maxLength = 20)
    String username,

    @Schema(description = "이메일", example = "john@example.com", format = "email")
    String email,

    @Schema(description = "나이", example = "28", nullable = true)
    Integer age
) {}
```

`record` 또는 일반 클래스 양쪽 모두 동작한다. `@Valid` 제약(`@NotBlank`, `@Email` 등)도 자동으로 스펙에 반영된다.

### `@Hidden` — 문서에서 제외

```java
import io.swagger.v3.oas.annotations.Hidden;

@Hidden  // 컨트롤러 전체 또는 메서드 단위
@GetMapping("/internal/debug")
public String debug() { ... }
```

---

## JWT / Bearer 인증 통합

### 방식 1: `OpenAPI` Bean에 Components 등록

```java
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI apiInfo() {
        return new OpenAPI()
            .info(new Info().title("User API").version("v1.0.0"))
            .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
            .components(new Components()
                .addSecuritySchemes(SECURITY_SCHEME_NAME,
                    new SecurityScheme()
                        .name(SECURITY_SCHEME_NAME)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
    }
}
```

`addSecurityItem`은 **전역 보안 요구**를 의미 → 모든 엔드포인트에 JWT 헤더 요구 표시. 공개 엔드포인트는 `@SecurityRequirements()` 로 해제한다.

### 방식 2: 클래스 레벨 `@SecurityScheme` 어노테이션

```java
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;

@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT"
)
@Configuration
public class OpenApiConfig { ... }
```

### 엔드포인트 단위 보안 요구

```java
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;

@SecurityRequirement(name = "bearerAuth")   // 인증 필요 표시
@GetMapping("/me")
public UserDto me() { ... }

@SecurityRequirements()   // 전역 보안 해제 (로그인 등 공개 API)
@PostMapping("/auth/login")
public TokenDto login(@RequestBody LoginReq req) { ... }
```

Swagger UI에 **Authorize** 버튼이 생기고, 입력한 토큰이 `Authorization: Bearer {token}` 헤더로 전송된다.

---

## Spring Security 통합 (필수)

Spring Security를 사용하면 swagger-ui / api-docs 경로를 `permitAll`로 열어야 한다. 빠뜨리면 401로 UI가 뜨지 않는다.

```java
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String[] SWAGGER_WHITELIST = {
        "/swagger-ui.html",
        "/swagger-ui/**",
        "/v3/api-docs",
        "/v3/api-docs/**",
        "/v3/api-docs.yaml"
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(SWAGGER_WHITELIST).permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .build();
    }
}
```

> 주의: springdoc이 리소스를 서빙하는 정확한 경로는 `/swagger-ui/**`(UI 정적 리소스)와 `/v3/api-docs/**`(JSON/그룹별 JSON)다. `/swagger-resources/**`는 Springfox 시절 경로이므로 springdoc에서는 필요 없다.

---

## GroupedOpenApi — API 그룹 분리

패키지·경로 기준으로 여러 그룹을 분리해 UI 상단 드롭다운에서 선택할 수 있다.

```java
import org.springdoc.core.models.GroupedOpenApi;

@Configuration
public class GroupConfig {

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
            .group("public")
            .pathsToMatch("/api/public/**")
            .build();
    }

    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
            .group("admin")
            .pathsToMatch("/api/admin/**")
            .packagesToScan("com.example.admin")
            .build();
    }

    @Bean
    public GroupedOpenApi v1Api() {
        return GroupedOpenApi.builder()
            .group("v1")
            .pathsToMatch("/api/v1/**")
            .addOpenApiCustomizer(openApi ->
                openApi.info(new Info().title("V1 API").version("1.0")))
            .build();
    }
}
```

그룹별 JSON 경로는 `/v3/api-docs/{groupName}` (예: `/v3/api-docs/admin`).

---

## application.yml 커스터마이징

```yaml
springdoc:
  api-docs:
    path: /v3/api-docs           # JSON 경로 (기본값)
    enabled: true
    version: openapi_3_1         # 기본값 (2.8.0+). openapi_3_0 으로 고정 가능
  swagger-ui:
    path: /swagger-ui.html       # 리다이렉트 진입점
    operations-sorter: method    # alpha | method
    tags-sorter: alpha
    try-it-out-enabled: true     # Swagger UI에서 "Try it out" 기본 활성
    filter: true                 # 태그 필터 입력창
    display-request-duration: true
    doc-expansion: none          # list | full | none
  packages-to-scan: com.example.api
  paths-to-match: /api/**
  default-produces-media-type: application/json
  show-actuator: false           # true면 actuator 엔드포인트도 문서화
  writer-with-default-pretty-printer: true
```

---

## Springfox → Springdoc 어노테이션 매핑

레거시 프로젝트 마이그레이션 시 1:1 대체.

| Springfox (io.swagger.annotations, v2) | Springdoc (io.swagger.v3.oas.annotations) |
|-----------------------------------------|-------------------------------------------|
| `@Api(tags = "...")` | `@Tag(name = "...")` |
| `@ApiOperation(value, notes)` | `@Operation(summary, description)` |
| `@ApiParam` | `@Parameter` |
| `@ApiImplicitParam` | `@Parameter` |
| `@ApiImplicitParams` | `@Parameters` |
| `@ApiModel` | `@Schema` |
| `@ApiModelProperty` | `@Schema` |
| `@ApiModelProperty(allowEmptyValue = true)` | `@Schema(nullable = true)` |
| `@ApiResponse(code = 404, message = "")` | `@ApiResponse(responseCode = "404", description = "")` |
| `@ApiResponses` | `@ApiResponses` (패키지만 변경) |
| `@ApiIgnore` | `@Hidden` 또는 `@Parameter(hidden = true)` / `@Operation(hidden = true)` |
| `Docket` Bean | `GroupedOpenApi` Bean |

**마이그레이션 체크리스트:**
1. `springfox-*` 의존성 모두 제거
2. `springdoc-openapi-starter-webmvc-ui` 추가
3. `import io.swagger.annotations.*` → `import io.swagger.v3.oas.annotations.*`
4. `javax.*` → `jakarta.*` 전환 (Spring Boot 3 공통)
5. `Docket` 빈 → `GroupedOpenApi` 빈으로 재작성
6. `@ApiResponse(code = 404)` 숫자 → `responseCode = "404"` 문자열로 치환

---

## 언제 쓰고 언제 쓰지 않나

| 상황 | 판단 |
|------|------|
| Spring Boot 3.x + REST API 문서화 | ✅ springdoc 2.x 표준 선택 |
| Spring Boot 2.x 유지보수 프로젝트 | ❌ 이 스킬 범위 밖 (springdoc 1.8.0 또는 Springfox) |
| GraphQL API | ❌ OpenAPI 대상 아님 |
| 스펙 우선(spec-first) 개발, YAML 수기 작성 후 코드 생성 | ❌ openapi-generator 조합을 검토 |
| 코드(어노테이션) 우선 + 문서 자동 생성 | ✅ springdoc |

---

## 자주 하는 실수

| 실수 | 수정 |
|------|------|
| `io.swagger.annotations.*` (Springfox v2) 어노테이션을 그대로 사용 | `io.swagger.v3.oas.annotations.*`로 전환 (패키지 다름) |
| Spring Security 설정에서 `/swagger-ui/**`, `/v3/api-docs/**` permitAll 누락 | 화이트리스트에 추가 |
| `javax.servlet.*` 잔존 | `jakarta.servlet.*`로 전환 (Spring Boot 3 전체 요구사항) |
| `@ApiResponse(code = 404)` 숫자 사용 | `@ApiResponse(responseCode = "404")` 문자열 |
| `Docket` Bean 유지 | `GroupedOpenApi` Bean으로 교체 |
| `@Api`, `@ApiOperation` 등 레거시 어노테이션 혼용 | 프로젝트 내 어노테이션을 한쪽으로 통일 (혼용 시 일부만 문서화됨) |
| starter 버전을 Spring Boot 버전 확인 없이 최신으로 고정 | 호환 매트릭스 확인 후 버전 지정 |
| OpenAPI 3.1 전환 후 Swagger UI 일부 기능 이슈 | 필요 시 `springdoc.api-docs.version=openapi_3_0`으로 고정 |
| `show-actuator: true`로 두고 프로덕션 배포 | 운영에서는 비활성 또는 인증 필요로 제한 |
| 전역 `addSecurityItem` 설정 후 로그인 엔드포인트에도 Authorize 요구 표시 | 로그인 메서드에 `@SecurityRequirements()` (빈 배열)로 해제 |
