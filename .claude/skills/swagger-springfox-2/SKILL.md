---
name: swagger-springfox-2
description: Springfox(2.9.2·3.0.0, EOL) 레거시 Swagger 문서화에 springdoc/OpenAPI 3 버릇을 섞지 않기 위한 함정 — io.swagger.annotations(Swagger 2) vs io.swagger.v3, @ApiResponse code/message, 2.9.2↔3.0.0 차이(@EnableSwagger2·globalOperationParameters→globalRequestParameters·UI URL), 버전 혼용 금지, Spring Boot 2.6+ PathPatternParser NPE(ant_path_matcher), Boot 3 미지원, Security permitAll 경로, groupName 필수, Springdoc 전환 매핑표
---

# Springfox 레거시 Swagger 2 API 문서화

> 소스: https://github.com/springfox/springfox | https://github.com/springfox/springfox/issues/3462 | https://github.com/springfox/springfox/issues/3955 | https://github.com/springfox/springfox/issues/3982 | https://springfox.github.io/springfox/docs/current/ | https://springdoc.org/migrating-from-springfox.html | https://central.sonatype.com/artifact/io.springfox/springfox-swagger2/2.9.2 | https://mvnrepository.com/artifact/io.springfox/springfox-boot-starter/3.0.0
> 검증일: 2026-11-09 (2026-04-23 최초 검증 · 재검증 이력은 8절 참조. 재검증 결과 변동 없음 — Springfox는 여전히 3.0.0(2020-07-14)이 마지막 릴리스이며 신규 릴리스 없음)

> 주의 (EOL 상태): Springfox는 **2020-07-14 3.0.0 릴리즈 이후 신규 릴리즈가 없고 사실상 유지보수 중단(EOL) 상태**입니다. Spring Boot 2.6+ 에서 `NullPointerException`을 일으키는 공식 이슈(#3462, #3955, #3982)도 해결되지 않았습니다. **신규 프로젝트는 반드시 Springdoc(`springdoc-openapi`)을 사용**하세요. 이 스킬은 레거시 유지보수 목적(이미 Springfox로 작성된 프로젝트) 전용입니다.

> 주의 (적용 범위): 본 문서는 **Spring Boot 2.5 / Java 11 + Springfox 3.0.0 (또는 2.9.2) 레거시 환경** 기준입니다. Spring Boot 2.6+ 사용 시에는 하단 "Spring Boot 2.6+ 호환성" 섹션을 반드시 적용해야 기동됩니다.

## 이 스킬의 범위

Docket Bean·`select()` 체인·`@Api` 계열 어노테이션의 기본 사용법은 공식 문서 수준이라 싣지 않는다. 여기엔 **모델이 springdoc/OpenAPI 3 문법을 Springfox 레거시에 섞는 실수를 막는 경고와 기동 함정**만 둔다.

---

## 1. 두 계통 — 섞지 말 것

| 항목 | 2.9.2 (2018-06-23) | 3.0.0 (2020-07-14, 마지막) |
|------|--------------------|---------------------------|
| 의존성 | `io.springfox:springfox-swagger2` + `springfox-swagger-ui` **둘 다** (ui 누락 시 `/swagger-ui.html` 404) | `io.springfox:springfox-boot-starter` 하나 |
| `@EnableSwagger2` | **필수** | 선택(자동 구성). 붙여도 되지만 **Bean 중복 선언 금지** |
| 스펙 | `DocumentationType.SWAGGER_2`만 | `SWAGGER_2` 또는 `OAS_30`(OpenAPI 3.0.3) |
| 전역 헤더 | `globalOperationParameters` + `ParameterBuilder`(`.modelRef(new ModelRef("string")).parameterType("header")`) | `globalRequestParameters` + `RequestParameterBuilder`(`.in(ParameterType.HEADER)`, `.query(q -> q.model(m -> m.scalarModel(ScalarType.STRING)))`) |
| UI 경로 | `/swagger-ui.html` | `/swagger-ui/index.html` (`/swagger-ui/`는 리다이렉트), base-url은 `springfox.documentation.swagger-ui.base-url` |
| 스펙 JSON | `/v2/api-docs` | `/v2/api-docs`(SWAGGER_2) / `/v3/api-docs`(OAS_30), 그룹은 `?group={name}` |

- 2.9.2로 안정 운영 중이면 3.0.0으로 굳이 올리지 않는다(API 변경 범위가 큼).
- **2.9.2와 3.0.0 아티팩트 혼용 금지**(예: `springfox-swagger2:2.9.2` + `springfox-swagger-ui:3.0.0`) — 내부 API 호환성 깨짐.

> 주의: `springfox-swagger2 2.9.2`는 `io.springfox` 그룹이 맞습니다. 과거에 `com.github.springfox.springfox` 같은 다른 그룹 좌표가 Maven Central에 존재하지만, 공식 좌표는 `io.springfox`입니다.

> 주의: Springfox 3.0.0에서 `globalOperationParameters`는 deprecated입니다. 3.0.0 기반 신규 코드에는 `globalRequestParameters`를 사용하세요.

> 주의: 2.9.2에서 3.0.0으로 올릴 때 **UI 접근 URL이 `/swagger-ui.html` → `/swagger-ui/index.html`로 바뀝니다.** 내부 운영 문서·북마크·Security 화이트리스트를 모두 업데이트하세요.

---

## 2. 어노테이션 — OpenAPI 3 패키지를 쓰지 말 것

Springfox가 스캔하는 어노테이션은 **`io.swagger.annotations.*`(Swagger Core 1.5)** 다. `io.swagger.v3.oas.annotations.*`(`@Tag`·`@Operation`·`@Schema`)는 인식하지 않는다.

> 주의: `@ApiResponse`의 필드명은 Springfox/Swagger 2에서 **`code` + `message`** 입니다. OpenAPI 3(`io.swagger.v3.oas.annotations`)의 `responseCode` + `description`과 다르므로 혼용하지 마세요.

- `@ApiParam`은 `@RequestParam`/`@PathVariable` 같은 Spring 어노테이션이 함께 있어야 파라미터로 인식된다. 선언되지 않은 파라미터(인터셉터 주입 등)는 `@ApiImplicitParam(s)`.
- Docket이 2개 이상이면 각각 `.groupName("...")` **필수** — 미지정 시 그룹명 충돌로 기동 실패.

---

## 3. Spring Boot 2.6+ 호환성 이슈 (필수 대응)

Spring Boot 2.6부터 기본 URL 매칭이 `AntPathMatcher` → `PathPatternParser`로 변경되었고, Springfox는 이 변경을 반영한 릴리즈가 없다:

```
Failed to start bean 'documentationPluginsBootstrapper';
nested exception is java.lang.NullPointerException:
Cannot invoke "springfox.documentation.spring.web.WebMvcPatternsRequestConditionWrapper.getPatterns()"
because "this.condition" is null
```

해결: `spring.mvc.pathmatch.matching-strategy: ant_path_matcher`

> 주의: 이 설정은 **Springfox가 동작하게 하는 우회책일 뿐**이며 Springfox 자체 버그를 고치지 않습니다. Spring Boot 2.7이 2.x의 마지막 마이너이고 공식 OSS 지원 종료일이 2023-06-30이고 마지막 OSS 릴리스는 2.7.18(2023-11-23)이므로, 이 설정을 쓰고 있다면 **Springdoc 전환을 계획**하는 것이 옳습니다.

> 주의: Spring Boot 3.x에서는 Springfox가 **동작하지 않습니다** (Spring 6 / Jakarta EE 9+ 전환 미대응). Spring Boot 3.x 프로젝트는 Springdoc이 유일한 선택입니다.

### Spring Security permitAll 경로

`/swagger-ui.html`, `/swagger-ui/**`, `/swagger-resources/**`, `/v2/api-docs`, `/v3/api-docs`, `/webjars/**`, `/configuration/ui`, `/configuration/security`. `/swagger-resources/**`·`/configuration/**`은 UI가 내부 호출하는 Springfox 엔드포인트, `/webjars/**`는 UI 정적 리소스 — 누락 시 UI는 뜨지만 스펙 로드 실패로 빈 화면. (Boot 2.5 / Security 5.5에서는 Adapter + `antMatchers` 문법 — `spring-security-5-jwt-jjwt10` 참조.)

---

## 4. Springdoc 전환 매핑

의존성: Boot 2.x = `org.springdoc:springdoc-openapi-ui:1.8.0`, Boot 3.x = `org.springdoc:springdoc-openapi-starter-webmvc-ui:2.x`. Docket 대신 `OpenAPI` Bean으로 전역 메타·보안 스킴(`SecurityScheme.Type.HTTP`, `bearer`, `JWT`)을 선언한다.

| Springfox (Swagger 2) | Springdoc (OpenAPI 3) |
|----------------------|----------------------|
| `@Api(tags = "x")` | `@Tag(name = "x")` |
| `@ApiOperation(value = "a", notes = "b")` | `@Operation(summary = "a", description = "b")` |
| `@ApiParam(value = "x", required = true)` | `@Parameter(description = "x", required = true)` |
| `@ApiImplicitParam` / `@ApiImplicitParams` | `@Parameter` / `@Parameters` |
| `@ApiResponse(code = 404, message = "not found")` | `@ApiResponse(responseCode = "404", description = "not found")` |
| `@ApiResponses` | `@ApiResponses` (동일 이름, 다른 패키지) |
| `@ApiModel` / `@ApiModelProperty(value = "x", example = "y")` | `@Schema` / `@Schema(description = "x", example = "y")` |
| `@ApiIgnore` | `@Parameter(hidden = true)` / `@Operation(hidden = true)` / `@Hidden` |

Springdoc 기본 경로: UI `/swagger-ui.html`(→ `/swagger-ui/index.html` 리다이렉트), JSON `/v3/api-docs`.
