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
