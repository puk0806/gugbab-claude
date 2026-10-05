## 6. Spring Boot 2 → 3 마이그레이션 체크리스트

### 6.1 필수 변경 사항

| 영역 | 2.x | 3.x |
|------|-----|-----|
| 최소 Java | 8 | **17** |
| Spring Framework | 5.3 | 6.0+ |
| 네임스페이스 | `javax.*` | **`jakarta.*`** |
| Servlet API | 4.0 / 5.0 | 6.0 |
| MySQL 드라이버 | `mysql:mysql-connector-java` | `com.mysql:mysql-connector-j` |
| 외장 Tomcat | 9.x | **10.1.x 이상** |
| Spring Security | 5.5.x~5.8.x | **6.x** |
| API 문서화 | Springfox 2.9.x (EOL) | **Springdoc OpenAPI 2.x** |
| 분산 추적 | Spring Cloud Sleuth 3.0.x | **Micrometer Tracing** |
| 빌드 태스크 | `bootWar` (기본) | `bootJar` (기본, Native 옵션) |

### 6.2 마이그레이션 순서 (공식 권장)

1. 먼저 **Spring Boot 2.7 최신 패치**(2.7.18)로 올린다
2. `spring-boot-properties-migrator` 모듈을 임시로 추가해 런타임 속성 경고를 확인
3. 의존성을 점검하고 Spring Security는 5.8로 먼저 올림
4. Spring Boot 3.x로 올리고 `javax.*` → `jakarta.*` 일괄 치환 (OpenRewrite 또는 IntelliJ IDEA 마이그레이션 툴 사용)
5. 빌드 성공 후 `spring-boot-properties-migrator` 제거

### 6.3 자동 마이그레이션 도구

- **OpenRewrite**: `org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_4` 레시피
- **Spring Boot Migrator**: `spring-boot-migrator` CLI
- **IntelliJ IDEA**: 내장 Jakarta EE Migration 리팩토링

### 6.4 제거/변경된 기능

- `banner.gif/jpg/png` 이미지 배너 지원 삭제
- `YamlJsonParser` 제거
- `spring.factories` 기반 자동설정 등록 → `org.springframework.boot.autoconfigure.AutoConfiguration.imports` 파일로 이동
- `spring.profiles: xxx` 문법 제거 (`spring.config.activate.on-profile`만 유효)

### 6.5 도구·프레임워크 교체 (필수 확인)

Spring Boot 3로 올릴 때 **의존 라이브러리·도구도 함께 교체**해야 한다. 단순 namespace 치환만으로 해결되지 않는 영역.

#### Spring Security 5 → 6

주요 Breaking Change:
- `WebSecurityConfigurerAdapter` **완전 제거** → `SecurityFilterChain` Bean 방식 필수
- `authorizeRequests()` **deprecated** → `authorizeHttpRequests()` 사용
- `antMatchers()` **제거** → `requestMatchers()` 사용
- `.and()` 체이닝 → 람다 DSL (`.csrf(csrf -> csrf.disable())` 등)
- `oauth2ResourceServer(...)` 설정도 람다 DSL 필수
- jjwt 0.10.x → 0.12.x (API 완전 재작성, `parserBuilder` 제거)

> 상세(해당 템플릿이 설치된 경우): `.claude/skills/spring-security-5-jwt-jjwt10/SKILL.md` (레거시) / `spring-security-6-jwt-jjwt12/SKILL.md` (모던)

#### API 문서화: Springfox → Springdoc OpenAPI

Springfox 2.9.2는 **사실상 EOL** (마지막 릴리즈 2019년, Spring Boot 3 미지원). Springdoc OpenAPI로 전환 필수.

| 항목 | Springfox 2.9.x | Springdoc OpenAPI 2.x |
|------|----------------|----------------------|
| 의존성 | `io.springfox:springfox-swagger2` + `springfox-swagger-ui` | `org.springdoc:springdoc-openapi-starter-webmvc-ui:2.x` |
| 활성화 | `@EnableSwagger2` + `Docket` Bean | 자동 활성화 (starter만 추가) |
| 어노테이션 | `@Api`, `@ApiOperation`, `@ApiParam` | `@Tag`, `@Operation`, `@Parameter` |
| UI 경로 | `/swagger-ui.html` | `/swagger-ui.html` (동일) 또는 `/swagger-ui/index.html` |
| OpenAPI 스펙 | 2.0 (Swagger) | **3.1** |

Gradle 예시 (모던):
```groovy
implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0'
```

#### 분산 추적: Spring Cloud Sleuth → Micrometer Tracing

Spring Boot 3부터 **Sleuth는 삭제됨** (Sleuth GitHub Issue #2239). Micrometer Tracing으로 전환 필수.

| 항목 | Sleuth 3.0.x (SB 2.5) | Micrometer Tracing (SB 3.x) |
|------|---------------------|---------------------------|
| 의존성 | `spring-cloud-starter-sleuth` (+ `-zipkin`) | `micrometer-tracing-bridge-brave` (+ `zipkin-reporter-brave`) 또는 `-otel` |
| Zipkin 전송 | `spring.zipkin.base-url` | `management.zipkin.tracing.endpoint` |
| 샘플링 | `spring.sleuth.sampler.probability` | `management.tracing.sampling.probability` |
| 커스텀 span | `@NewSpan`, `@SpanTag` (Sleuth 어노테이션) | `@Observed` + `@ObservationRegistry` (또는 `Tracer` API) |
| 전파 포맷 | B3 (기본) | W3C Trace Context (기본) |
| MDC 키 | `traceId`, `spanId` (동일) | **`traceId`, `spanId` (변경 없음)** → 로그 패턴 유지 가능 |

> 상세: `.claude/skills/logback-mdc-tracing/SKILL.md` (Sleuth·Micrometer Tracing 양쪽 분기 커버)

> 주의: 마이그레이션 중에 **B3 포맷 서비스와 W3C 포맷 서비스가 공존**하면 traceId가 이어지지 않는다. 전파 포맷을 맞추거나 동시에 전환해야 함.

---

## 7. 자주 쓰는 명령어

```bash
# 의존성 트리 확인
./gradlew dependencies

# 내장 서버로 실행
./gradlew bootRun

# 프로파일 지정 실행
./gradlew bootRun --args='--spring.profiles.active=local'

# Jar 빌드 (모던)
./gradlew bootJar

# WAR 빌드 (레거시)
./gradlew bootWar

# Native 빌드 (모던 + GraalVM)
./gradlew nativeCompile

# OCI 이미지 빌드 (Paketo Buildpack)
./gradlew bootBuildImage --imageName=myorg/myapp

# 테스트
./gradlew test

# 빌드 캐시 클린
./gradlew clean build
```

---

## 8. 흔한 실수

| 실수 | 증상 | 해결 |
|------|------|------|
| WAR 배포 시 `providedRuntime` 없이 `starter-tomcat`을 `implementation`으로 선언 | 외장 Tomcat에서 `ClassCastException` 또는 포트 충돌 | `providedRuntime 'spring-boot-starter-tomcat'` 사용 |
| `SpringBootServletInitializer` 상속 없이 WAR 배포 | 외장 Tomcat에 배포해도 컨트롤러가 매핑되지 않음 | 메인 클래스가 `SpringBootServletInitializer` 상속 |
| Spring Boot 3.x에서 `javax.servlet.*` import 잔존 | 컴파일 에러 또는 런타임 `ClassNotFoundException` | `jakarta.servlet.*`로 일괄 치환 |
| Spring Boot 3.4 + Gradle 8.3 조합 | 빌드 시 Gradle 버전 지원 중단 메시지 | Gradle 8.4+ 또는 7.6.4로 변경 |
| `@Valid`가 동작 안 함 (Spring Boot 3.x) | 검증 에러가 던져지지 않음 | `spring-boot-starter-validation` 명시적 추가 |
| 프로파일별 값이 병합되지 않는다고 착각 | `application-prod.yml`에만 있는 값이 적용 안 됨 | 프로파일 활성화(`--spring.profiles.active`) 확인 |
| Native 빌드 시 리플렉션 실패 | `ClassNotFoundException` at runtime | `@RegisterReflectionForBinding` 또는 `reflect-config.json` 추가 |

---

## 9. Spring Boot 4.x 마이그레이션 포인트

> 기준: Spring Boot 4.0 GA (2025-11-30) / 4.1 (2026-06-10) / Spring Framework 7.0
> 소스: https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Release-Notes
>       https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide
>       https://endoflife.date/spring-boot
> 검증일: 2026-09-28 (최초 2026-06-19) — Gradle 8.14+/Jackson 3.0 group id/GraalVM 25+ 요건 재확인, 9.7 Starter 이름 변경 신설

> 주의: Spring Boot 3.5의 OSS 지원은 2026-06-30 종료. 신규 프로젝트는 4.1을 선택하거나, OSS 지원 연장이 필요하면 3.5 상용 LTS 지원을 검토할 것.

### 9.1 버전 매트릭스 (3.x vs 4.x)

| 항목 | 3.4.x | 3.5.x (LTS) | 4.0.x | 4.1.x |
|------|-------|-------------|-------|-------|
| 최소 Java | 17 | 17 | 17 | 17 |
| Spring Framework | 6.2 | 6.3 | **7.0** | **7.0** |
| Gradle 최소 | 7.6.4 or 8.4 | 7.6.4 or 8.4 | **8.14 or 9.x** | **8.14 or 9.x** |
| Servlet API | 6.0 | 6.0 | **6.1** | **6.1** |
| 내장 Tomcat | 10.1 | 10.1 | **11.0** | **11.0** |
| Jackson | 2.x | 2.x | **3.0** (Group ID 변경) | **3.0** |

### 9.2 Gradle 버전 요구사항 강화

Spring Boot 4.0은 **Gradle 8.14 이상 또는 9.x** 를 요구한다.

```bash
# Gradle Wrapper 업그레이드
./gradlew wrapper --gradle-version 8.14
```

### 9.3 build.gradle.kts (4.x 기준)

```kotlin
plugins {
    java
    id("org.springframework.boot") version "4.1.0"
    id("io.spring.dependency-management") version "1.1.7"
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)  // 17 이상 필수, 21 LTS 권장
    }
}
```

### 9.4 Jackson 3.0 Group ID 변경 (주의)

Spring Boot 4.0은 Jackson 3.0을 번들. **Group ID가 변경**되었다.

```gradle
// 3.x: com.fasterxml.jackson
// 4.x: tools.jackson
```

Jackson 버전을 직접 선언하는 경우 Group ID를 수정해야 빌드가 통과된다. Spring Boot BOM을 사용하면 자동 관리된다.

### 9.5 제거된 기능

| 기능 | 4.x 대체 |
|------|---------|
| Undertow 임베디드 서버 | Tomcat 또는 Jetty |
| `RestTemplate` 자동 구성 | `RestClient` 또는 `WebClient` |
| GraalVM 21 지원 | **GraalVM 25 이상 필요** |
| Kotlin 1.9 지원 | **Kotlin 2.2 이상 필요** |

### 9.6 마이그레이션 순서 (3.5 → 4.0)

1. Spring Boot 3.5 최신 패치로 올리고 모든 deprecation warning 해소
2. `@MockBean` → `@MockitoBean` 전환 (3.4에서 deprecated, 4.0에서 제거)
3. Gradle **8.14 이상**으로 업그레이드
4. Undertow 사용 중이면 Tomcat 또는 Jetty로 전환
5. Spring Boot 4.0 GA로 업그레이드 후 `spring-boot-properties-migrator` 실행
6. 9.7절 표대로 `build.gradle(.kts)`의 Starter 좌표 갱신(`-web`→`-webmvc` 등)

### 9.7 Starter 이름 변경 (4.0)

Spring Boot 4.0에서 모듈 정합성을 위해 여러 Starter POM이 개명되었다. 기존 이름도 당분간 동작하지만 **deprecated**이며 향후 릴리스에서 제거 예정이므로, 4.x로 올릴 때 `build.gradle(.kts)` 의존성 좌표를 아래 표대로 갱신한다.

| 기존 Starter | 4.0 신규 이름 |
|------|------|
| `spring-boot-starter-web` | `spring-boot-starter-webmvc` |
| `spring-boot-starter-web-services` | `spring-boot-starter-webservices` |
| `spring-boot-starter-aop` | `spring-boot-starter-aspectj` |
| `spring-boot-starter-oauth2-client` | `spring-boot-starter-security-oauth2-client` |
| `spring-boot-starter-oauth2-resource-server` | `spring-boot-starter-security-oauth2-resource-server` |
| `spring-boot-starter-oauth2-authorization-server` | `spring-boot-starter-security-oauth2-authorization-server` |

> 주의: `spring-boot-starter-web`은 Spring MVC 전용임을 명확히 하기 위해 개명되었다(WebFlux와의 혼동 방지 목적). WebFlux는 계속 `spring-boot-starter-webflux`를 그대로 사용하며 이름이 바뀌지 않았다.

개별 좌표를 다 바꿀 시간이 없는 빠른 마이그레이션을 위해 과도기용 "classic" starter도 제공된다:

| 용도 | Classic 대체 |
|------|------|
| `spring-boot-starter` | `spring-boot-starter-classic` |
| `spring-boot-starter-test` | `spring-boot-starter-test-classic` |

> 주의: classic starter는 4.0에서 모듈이 분리되면서 빠진 구성 요소를 다시 묶어 제공하는 **과도기 전용 대체재**다. 장기적으로는 위 표의 신규 이름으로 개별 전환하는 편이 권장된다(공식 가이드에 정확한 제거 시점은 아직 명시되지 않음).

> 소스: https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide ("Deprecated Starters", "AOP Starter POM", "Classic Starters" 섹션) — 2026-09-28 확인
