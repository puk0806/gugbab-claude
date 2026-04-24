---
name: swagger-springfox-2
description: Springfox 기반 레거시 Swagger 2 API 문서화 패턴 - @EnableSwagger2·Docket Bean, @Api/@ApiOperation/@ApiParam/@ApiModel 어노테이션, Docket 그룹화, 전역 JWT 헤더, Spring Boot 2.6+ 호환성 이슈(PathPatternParser NPE), Springdoc 전환 가이드
---

# Springfox 레거시 Swagger 2 API 문서화

> 소스: https://github.com/springfox/springfox | https://github.com/springfox/springfox/issues/3462 | https://github.com/springfox/springfox/issues/3955 | https://github.com/springfox/springfox/issues/3982 | https://springfox.github.io/springfox/docs/current/ | https://springdoc.org/migrating-from-springfox.html | https://central.sonatype.com/artifact/io.springfox/springfox-swagger2/2.9.2 | https://mvnrepository.com/artifact/io.springfox/springfox-boot-starter/3.0.0
> 검증일: 2026-04-23

> 주의 (EOL 상태): Springfox는 **2020-07-14 3.0.0 릴리즈 이후 신규 릴리즈가 없고 사실상 유지보수 중단(EOL) 상태**입니다. Spring Boot 2.6+ 에서 `NullPointerException`을 일으키는 공식 이슈(#3462, #3955, #3982)도 해결되지 않았습니다. **신규 프로젝트는 반드시 Springdoc(`springdoc-openapi`)을 사용**하세요. 이 스킬은 레거시 유지보수 목적(이미 Springfox로 작성된 프로젝트) 전용입니다.

> 주의 (적용 범위): 본 문서는 **Spring Boot 2.5 / Java 11 + Springfox 3.0.0 (또는 2.9.2) 레거시 환경** 기준입니다. Spring Boot 2.6+ 사용 시에는 하단 "Spring Boot 2.6+ 호환성" 섹션을 반드시 적용해야 기동됩니다.

---

## 의존성 선택

Springfox는 "3.0.0 (Boot Starter)"과 "2.9.2 (개별 모듈)" 두 계통이 모두 레거시 프로젝트에서 쓰입니다. 현재 상태에 맞춰 선택합니다.

### 권장: Springfox 3.0.0 (Boot Starter, 2020-07-14)

```xml
<!-- pom.xml -->
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-boot-starter</artifactId>
    <version>3.0.0</version>
</dependency>
```

- 단일 스타터가 `springfox-swagger2`, `springfox-swagger-ui`, 자동 구성을 모두 포함
- `@EnableSwagger2` 어노테이션이 없어도 자동 구성되지만, `Docket` Bean 커스터마이징은 여전히 필요
- OpenAPI 3.0.3 스펙 지원 (`DocumentationType.OAS_30`)
- **Springfox의 공식 마지막 안정 버전**

### 레거시 유지: Springfox 2.9.2 (2018-06-23)

```xml
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger2</artifactId>
    <version>2.9.2</version>
</dependency>
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger-ui</artifactId>
    <version>2.9.2</version>
</dependency>
```

- `@EnableSwagger2` 어노테이션 **필수**
- Swagger 2 스펙(`DocumentationType.SWAGGER_2`)만 지원
- 이미 2.9.2로 안정 운영 중인 프로젝트라면 굳이 3.0.0으로 올릴 필요는 없습니다(3.0.0은 `globalOperationParameters` → `globalRequestParameters`, `ParameterBuilder` → `RequestParameterBuilder` 등 API 변경이 있어 수정 범위가 큼).

> 주의: `springfox-swagger2 2.9.2`는 `io.springfox` 그룹이 맞습니다. 과거에 `com.github.springfox.springfox` 같은 다른 그룹 좌표가 Maven Central에 존재하지만, 공식 좌표는 `io.springfox`입니다.

---

## 기본 설정 — @EnableSwagger2 + Docket Bean

### 2.9.2 기준 (가장 흔한 레거시 형태)

```java
package com.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@Configuration
@EnableSwagger2
public class SwaggerConfig {

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo())
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.example.controller"))
                .paths(PathSelectors.ant("/api/**"))
                .build();
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("Example API")
                .description("Spring Boot 2.5 + Springfox 레거시 API 문서")
                .version("1.0.0")
                .contact(new Contact("Backend Team", "https://example.com", "dev@example.com"))
                .build();
    }
}
```

### 3.0.0 기준 (Boot Starter)

```java
@Configuration
public class SwaggerConfig {

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.OAS_30)                  // OpenAPI 3.0 스펙
                .apiInfo(apiInfo())
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.example.controller"))
                .paths(PathSelectors.any())
                .build();
    }
    // apiInfo()는 동일
}
```

- 3.0.0에서도 `DocumentationType.SWAGGER_2`를 그대로 사용할 수 있습니다. 기존 UI·툴링 호환성을 유지하려면 SWAGGER_2를 유지하세요.
- `@EnableSwagger2`는 3.0.0에서 선택사항(자동 구성). 명시해도 동작에 문제는 없습니다.

### `select()` 체인 의미

| 메서드 | 역할 |
|--------|------|
| `.apis(RequestHandlerSelectors.any())` | 모든 컨트롤러 포함 |
| `.apis(RequestHandlerSelectors.basePackage("x.y"))` | 특정 패키지만 |
| `.apis(RequestHandlerSelectors.withClassAnnotation(RestController.class))` | 특정 어노테이션 |
| `.paths(PathSelectors.any())` | 모든 경로 |
| `.paths(PathSelectors.ant("/api/**"))` | Ant 패턴 매칭 |
| `.paths(PathSelectors.regex("/v1/.*"))` | 정규식 매칭 |

---

## API 어노테이션

Springfox가 스캔하는 어노테이션은 `io.swagger.annotations.*` (Swagger Core 1.5) 패키지입니다. OpenAPI 3의 `io.swagger.v3.oas.annotations.*`가 아닙니다.

### 컨트롤러·엔드포인트

```java
import io.swagger.annotations.*;

@Api(tags = "User", description = "유저 관리 API")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @ApiOperation(
        value = "유저 단건 조회",
        notes = "id로 유저를 조회합니다. 없으면 404.",
        response = UserResponse.class
    )
    @ApiResponses({
        @ApiResponse(code = 200, message = "성공"),
        @ApiResponse(code = 404, message = "유저 없음"),
        @ApiResponse(code = 500, message = "서버 오류")
    })
    @GetMapping("/{id}")
    public UserResponse getUser(
        @ApiParam(value = "유저 ID", required = true, example = "1")
        @PathVariable Long id
    ) {
        return userService.findById(id);
    }

    @ApiOperation("유저 생성")
    @PostMapping
    public UserResponse create(
        @ApiParam(value = "유저 생성 요청", required = true)
        @RequestBody @Valid CreateUserReq req
    ) {
        return userService.create(req);
    }
}
```

### 모델(DTO)

```java
@ApiModel(description = "유저 생성 요청")
public class CreateUserReq {

    @ApiModelProperty(value = "유저명", required = true, example = "hong")
    private String username;

    @ApiModelProperty(value = "이메일", required = true, example = "hong@example.com")
    private String email;

    @ApiModelProperty(value = "나이", required = false, example = "30", allowableValues = "range[0, 150]")
    private Integer age;
}
```

### 어노테이션 대응표 (Springfox ↔ 설명)

| 어노테이션 | 위치 | 역할 |
|-----------|------|------|
| `@Api` | 클래스 | 컨트롤러 전체 태그/설명 |
| `@ApiOperation` | 메서드 | 개별 엔드포인트 요약/설명/응답 타입 |
| `@ApiParam` | 파라미터 | 파라미터 설명·필수 여부·예시 |
| `@ApiImplicitParam` / `@ApiImplicitParams` | 메서드 | 선언되지 않은 파라미터(예: Interceptor가 주입) 문서화 |
| `@ApiResponse` / `@ApiResponses` | 메서드 | 응답 코드별 설명 |
| `@ApiModel` | DTO 클래스 | 모델 설명 |
| `@ApiModelProperty` | DTO 필드 | 필드 설명·필수·예시·허용값 |
| `@ApiIgnore` | 컨트롤러/메서드/파라미터 | 문서에서 제외 |

> 주의: `@ApiResponse`의 필드명은 Springfox/Swagger 2에서 **`code` + `message`** 입니다. OpenAPI 3(`io.swagger.v3.oas.annotations`)의 `responseCode` + `description`과 다르므로 혼용하지 마세요.

---

## Docket 그룹화 — 여러 API 세트 분리

버전별 API, 관리자·사용자 API 분리 시 `groupName`이 다른 Docket Bean을 여러 개 등록합니다.

```java
@Configuration
@EnableSwagger2
public class SwaggerConfig {

    @Bean
    public Docket publicApi() {
        return new Docket(DocumentationType.SWAGGER_2)
                .groupName("public-v1")
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.example.api.v1"))
                .paths(PathSelectors.ant("/api/v1/**"))
                .build()
                .apiInfo(new ApiInfoBuilder().title("Public API v1").version("1.0").build());
    }

    @Bean
    public Docket adminApi() {
        return new Docket(DocumentationType.SWAGGER_2)
                .groupName("admin")
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.example.api.admin"))
                .paths(PathSelectors.ant("/admin/**"))
                .build()
                .apiInfo(new ApiInfoBuilder().title("Admin API").version("1.0").build());
    }
}
```

- Swagger UI 우측 상단에 그룹 드롭다운이 표시되어 전환 가능
- 각 그룹의 스펙 URL은 `/v2/api-docs?group=public-v1`, `/v2/api-docs?group=admin`

---

## 전역 헤더 (JWT Authorization)

### 2.9.2 — globalOperationParameters

```java
import springfox.documentation.builders.ParameterBuilder;
import springfox.documentation.schema.ModelRef;
import springfox.documentation.service.Parameter;

import java.util.ArrayList;
import java.util.List;

@Bean
public Docket api() {
    return new Docket(DocumentationType.SWAGGER_2)
            .select()
            .apis(RequestHandlerSelectors.basePackage("com.example.controller"))
            .paths(PathSelectors.any())
            .build()
            .globalOperationParameters(globalAuthHeader());
}

private List<Parameter> globalAuthHeader() {
    List<Parameter> params = new ArrayList<>();
    params.add(new ParameterBuilder()
            .name("Authorization")
            .description("JWT 토큰 (Bearer {token})")
            .modelRef(new ModelRef("string"))
            .parameterType("header")
            .required(false)
            .build());
    return params;
}
```

### 3.0.0 — globalRequestParameters (권장)

```java
import springfox.documentation.builders.RequestParameterBuilder;
import springfox.documentation.schema.ScalarType;
import springfox.documentation.service.ParameterType;
import springfox.documentation.service.RequestParameter;

import java.util.Collections;
import java.util.List;

@Bean
public Docket api() {
    return new Docket(DocumentationType.OAS_30)
            .select()
            .apis(RequestHandlerSelectors.basePackage("com.example.controller"))
            .paths(PathSelectors.any())
            .build()
            .globalRequestParameters(globalAuthHeader());
}

private List<RequestParameter> globalAuthHeader() {
    return Collections.singletonList(
        new RequestParameterBuilder()
            .in(ParameterType.HEADER)
            .name("Authorization")
            .description("JWT 토큰 (Bearer {token})")
            .required(false)
            .query(q -> q.model(m -> m.scalarModel(ScalarType.STRING)))
            .build()
    );
}
```

> 주의: Springfox 3.0.0에서 `globalOperationParameters`는 deprecated입니다. 3.0.0 기반 신규 코드에는 `globalRequestParameters`를 사용하세요.

---

## Spring Boot 2.6+ 호환성 이슈 (필수 대응)

Spring Boot 2.6부터 기본 URL 매칭이 `AntPathMatcher` → `PathPatternParser`로 변경되었고, Springfox는 이 변경을 반영한 릴리즈가 없습니다. 결과:

```
Failed to start bean 'documentationPluginsBootstrapper';
nested exception is java.lang.NullPointerException:
Cannot invoke "springfox.documentation.spring.web.WebMvcPatternsRequestConditionWrapper.getPatterns()"
because "this.condition" is null
```

공식 이슈: [#3462](https://github.com/springfox/springfox/issues/3462), [#3955](https://github.com/springfox/springfox/issues/3955), [#3982](https://github.com/springfox/springfox/issues/3982)

### 해결: 매칭 전략을 Ant로 되돌림

```properties
# application.properties
spring.mvc.pathmatch.matching-strategy=ant_path_matcher
```

```yaml
# application.yml
spring:
  mvc:
    pathmatch:
      matching-strategy: ant_path_matcher
```

> 주의: 이 설정은 **Springfox가 동작하게 하는 우회책일 뿐**이며 Springfox 자체 버그를 고치지 않습니다. Spring Boot 2.7이 2.x의 마지막 마이너이고 2023-11-18에 OSS 지원 종료되었으므로, 이 설정을 쓰고 있다면 **Springdoc 전환을 계획**하는 것이 옳습니다.

> 주의: Spring Boot 3.x에서는 Springfox가 **동작하지 않습니다** (Spring 6 / Jakarta EE 9+ 전환 미대응). Spring Boot 3.x 프로젝트는 Springdoc이 유일한 선택입니다.

---

## Spring Security와 함께 쓸 때 — Swagger UI 접근 허용

Spring Security를 사용 중이면 Swagger UI·스펙 JSON 경로를 permitAll 해야 합니다. 누락 시 401/403으로 UI가 빈 화면이 됩니다.

### Spring Security 5.7+ (SecurityFilterChain 방식)

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String[] SWAGGER_WHITELIST = {
        "/swagger-ui.html",
        "/swagger-ui/**",
        "/swagger-resources/**",
        "/v2/api-docs",
        "/v3/api-docs",
        "/webjars/**",
        "/configuration/ui",
        "/configuration/security"
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(SWAGGER_WHITELIST).permitAll()
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
```

- `/swagger-resources/**`, `/configuration/**`은 Springfox 내부 엔드포인트로 UI가 내부적으로 호출합니다. 누락하면 UI 일부 기능이 동작하지 않습니다.
- `/webjars/**`는 Swagger UI 정적 리소스 경로.

---

## 접근 경로

Springfox 3.0.0 기본값:

| 경로 | 내용 |
|------|------|
| `/swagger-ui/index.html` | Swagger UI 메인 페이지 (3.0.0 기본) |
| `/swagger-ui/` | `index.html`로 리다이렉트 |
| `/v2/api-docs` | Swagger 2 JSON 스펙 (`DocumentationType.SWAGGER_2`) |
| `/v3/api-docs` | OpenAPI 3 JSON 스펙 (`DocumentationType.OAS_30`) |
| `/v2/api-docs?group={name}` | 그룹별 스펙 |
| `/swagger-resources` | 등록된 그룹·엔드포인트 메타 |

Springfox 2.9.2 기본값:

| 경로 | 내용 |
|------|------|
| `/swagger-ui.html` | Swagger UI (2.x 기본, 단일 HTML) |
| `/v2/api-docs` | Swagger 2 JSON 스펙 |

> 주의: 2.9.2에서 3.0.0으로 올릴 때 **UI 접근 URL이 `/swagger-ui.html` → `/swagger-ui/index.html`로 바뀝니다.** 내부 운영 문서·북마크·Security 화이트리스트를 모두 업데이트하세요.

### base-url 커스터마이징 (3.0.0)

```properties
springfox.documentation.swagger-ui.base-url=/docs
# 결과: /docs/swagger-ui/index.html
```

---

## Springdoc 전환 가이드 (권장)

Springfox는 EOL이므로 가능한 한 빨리 Springdoc으로 전환합니다. Springdoc는 공식 문서에 [Migrating from SpringFox](https://springdoc.org/migrating-from-springfox.html) 페이지를 제공합니다.

### 의존성 교체

```xml
<!-- 제거: springfox 관련 전부 -->
<!-- 추가 (Spring Boot 2.x) -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-ui</artifactId>
    <version>1.8.0</version>
</dependency>

<!-- 추가 (Spring Boot 3.x) -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.x.x</version>
</dependency>
```

### 어노테이션 매핑 (패키지 변경: `io.swagger.annotations` → `io.swagger.v3.oas.annotations`)

| Springfox (Swagger 2) | Springdoc (OpenAPI 3) |
|----------------------|----------------------|
| `@Api(tags = "x")` | `@Tag(name = "x")` |
| `@ApiOperation(value = "a", notes = "b")` | `@Operation(summary = "a", description = "b")` |
| `@ApiParam(value = "x", required = true)` | `@Parameter(description = "x", required = true)` |
| `@ApiImplicitParam` | `@Parameter` |
| `@ApiImplicitParams` | `@Parameters` |
| `@ApiResponse(code = 404, message = "not found")` | `@ApiResponse(responseCode = "404", description = "not found")` |
| `@ApiResponses` | `@ApiResponses` (동일 이름, 다른 패키지) |
| `@ApiModel` | `@Schema` |
| `@ApiModelProperty(value = "x", example = "y")` | `@Schema(description = "x", example = "y")` |
| `@ApiIgnore` | `@Parameter(hidden = true)` / `@Operation(hidden = true)` / `@Hidden` |

### 기본 경로 변화 (Springdoc 기본값)

| 용도 | Springfox 3.0.0 | Springdoc |
|------|-----------------|-----------|
| UI | `/swagger-ui/index.html` | `/swagger-ui.html` (자동으로 `/swagger-ui/index.html`로 리다이렉트) |
| JSON | `/v2/api-docs` 또는 `/v3/api-docs` | `/v3/api-docs` |

Docket Bean은 필요 없고, `OpenAPI` Bean으로 전역 메타·보안 스킴을 선언합니다:

```java
@Bean
public OpenAPI openAPI() {
    return new OpenAPI()
        .info(new Info().title("Example API").version("1.0.0"))
        .components(new Components().addSecuritySchemes("bearerAuth",
            new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
        .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
}
```

> 전환 상세는 별도 스킬(예: `swagger-springdoc-openapi`)에서 다룹니다. 이 스킬은 매핑 표만 제공합니다.

---

## 자주 하는 실수

| 실수 | 수정 |
|------|------|
| `@EnableSwagger2`와 `springfox-boot-starter:3.0.0`을 함께 쓰며 동작 안 함 | 3.0.0은 자동 구성. 어노테이션은 있어도 되지만 **Bean 중복 선언 금지** |
| Spring Boot 2.6+에서 기동 시 `documentationPluginsBootstrapper` NPE | `spring.mvc.pathmatch.matching-strategy=ant_path_matcher` 추가 |
| Spring Boot 3.x에서 Springfox 사용 시도 | Springdoc으로 전환. Springfox는 Spring 6 미지원 |
| `io.swagger.v3.oas.annotations.*` (OpenAPI 3 패키지)를 Springfox와 혼용 | Springfox는 `io.swagger.annotations.*` (Swagger 2)만 스캔 |
| `@ApiResponse(responseCode = "404", description = "...")` 사용 | Springfox는 `@ApiResponse(code = 404, message = "...")` |
| Spring Security permitAll에 `/swagger-resources/**`·`/webjars/**` 누락 | UI는 뜨지만 스펙 로드 실패로 빈 화면 |
| 2.9.2 → 3.0.0 업그레이드 시 UI URL이 바뀐 것 모름 | `/swagger-ui.html` → `/swagger-ui/index.html` |
| 2.9.2에서 `springfox-swagger2`만 추가하고 `springfox-swagger-ui` 누락 | UI용 webjar가 없어 `/swagger-ui.html` 404 |
| `@ApiParam`이 Swagger UI에 안 보임 | `@RequestParam` / `@PathVariable`과 같은 Spring 어노테이션이 먼저 있어야 Springfox가 파라미터로 인식 |
| 2.9.2와 3.0.0 의존성을 섞어 씀 (예: `springfox-swagger2:2.9.2` + `springfox-swagger-ui:3.0.0`) | 완전히 통일. 절대 혼용 금지 — 내부 API 호환성 깨짐 |
| `globalOperationParameters`를 3.0.0에서 사용 | deprecated. `globalRequestParameters` + `RequestParameterBuilder` 사용 |
| Docket 2개 이상인데 `groupName` 미지정 | 그룹명 충돌로 기동 실패. 각 Docket에 `.groupName("...")` 필수 |
