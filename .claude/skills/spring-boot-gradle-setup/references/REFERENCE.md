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
> 검증일: 2026-11-09 (최초 2026-06-19) — Gradle 8.14+/Jackson 3.0 group id/GraalVM 25+ 요건 재확인, 9.7 Starter 이름 변경 신설. 2026-11-09: 3.5 Framework 6.3→6.2 정정, RestTemplate "제거"→`spring-boot-restclient` 모듈 분리로 정정, 예제 4.1.2

> 주의: Spring Boot 3.5의 OSS 지원은 2026-06-30 종료. 신규 프로젝트는 4.1을 선택하거나, OSS 지원 연장이 필요하면 3.5 상용 LTS 지원을 검토할 것.

### 9.1 버전 매트릭스 (3.x vs 4.x)

| 항목 | 3.4.x | 3.5.x (LTS) | 4.0.x | 4.1.x |
|------|-------|-------------|-------|-------|
| 최소 Java | 17 | 17 | 17 | 17 |
| Spring Framework | 6.2 | 6.2 (3.5.16 = 6.2.19+) | **7.0** | **7.0** (4.1.2 = 7.0.10+) |
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
    id("org.springframework.boot") version "4.1.2"
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
| (제거 아님) `RestClient`·`RestTemplate` 자동 구성 | **`spring-boot-restclient` 모듈로 분리** — 모듈형 구조라 해당 모듈(스타터) 의존성이 있어야 자동 구성됨. 신규 코드는 `RestClient` 권장 |
| `@MockBean`·`@SpyBean` | `@MockitoBean`·`@MockitoSpyBean` |
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
