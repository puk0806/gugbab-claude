---
name: spring-boot-gradle-setup
description: Spring Boot 프로젝트 초기 셋업 - 레거시(2.5.12/Java 11/WAR/Tomcat 9)와 모던(3.4+/Java 21/Jar/Native) Gradle 빌드 스크립트, 패키징, 프로파일 분리, 2→3 마이그레이션 포인트
---

# Spring Boot + Gradle 프로젝트 셋업

> 소스:
> - https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.4-Release-Notes
> - https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide
> - https://docs.spring.io/spring-boot/how-to/deployment/traditional-deployment.html
> - https://docs.spring.io/spring-boot/reference/features/profiles.html
> - https://docs.gradle.org/current/userguide/compatibility.html
> - https://endoflife.date/spring-boot
> - https://plugins.gradle.org/plugin/org.springframework.boot
>
> 검증일: 2026-04-22

> 주의: Spring Boot 2.5.x는 OSS 지원이 종료된 상태(2.5 EOL ≈ 2023-02)이며, 2.7.x만 상용 Extended 지원이 연장되어 있습니다. 레거시 스택 유지 보수 용도로만 사용하고, 신규 프로젝트에는 3.4+ 또는 4.0+를 선택하세요.
>
> 주의: 2026-04 기준 Spring Boot 최신 안정은 4.0.5입니다. 본 스킬은 사용자가 요청한 3.4+를 기준으로 작성하되, 4.0+는 Spring Framework 7.0 기반으로 또 다른 마이그레이션 포인트가 있으므로 별도 확인이 필요합니다.

---

## 1. 빠른 선택 가이드

| 항목 | 레거시 | 모던 |
|------|--------|------|
| Spring Boot | 2.5.12 (마지막 2.5 패치는 2.5.15) | 3.4.x 또는 3.5.x |
| Java | 11 (8/11/16 지원) | 17 필수, 21 권장 |
| 패키징 | WAR → 외장 Tomcat 9 | Jar (기본) / 선택적 Native |
| Servlet API | 4.0 (`javax.servlet`) | 6.0 (`jakarta.servlet`) |
| Gradle | 7.6.4 이하 호환 | 7.6.4+ 또는 8.4+ |
| Gradle DSL | Groovy (`build.gradle`) | Kotlin (`build.gradle.kts`) 권장 |
| Spring Framework | 5.3 | 6.2 (3.4) |

> 주의: 레거시 프로젝트를 여전히 유지해야 한다면, 보안 패치 수령을 위해 2.5.12 → 2.7.18(Extended Support)로 먼저 올린 뒤 3.x로 마이그레이션하는 2단계 전략을 공식이 권장합니다.

---

## 2. 레거시 셋업 (Spring Boot 2.5.12 + Java 11 + WAR + Tomcat 9)

### 2.1 `build.gradle` (Groovy DSL)

```groovy
plugins {
    id 'org.springframework.boot' version '2.5.12'
    id 'io.spring.dependency-management' version '1.0.15.RELEASE'
    id 'java'
    id 'war'
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '11'
targetCompatibility = '11'

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-validation'

    // 외장 Tomcat에 배포할 때는 임베디드 Tomcat을 bundle하지 않는다
    providedRuntime 'org.springframework.boot:spring-boot-starter-tomcat'

    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

test {
    useJUnitPlatform()
}
```

**핵심 포인트:**
- `id 'war'` 플러그인 적용 필수
- `providedRuntime`으로 `spring-boot-starter-tomcat` 선언 → WAR에 Tomcat jar가 포함되지 않아 외장 Tomcat 9와 충돌하지 않음
- `bootWar` 태스크가 `gradle build` 시 자동 실행되어 `build/libs/*.war` 생성

### 2.2 `SpringBootServletInitializer` 상속 (WAR 배포 전용)

외장 서블릿 컨테이너(Tomcat 9)에 배포하려면 메인 클래스가 `SpringBootServletInitializer`를 상속해 `configure`를 오버라이드해야 합니다.

```java
package com.example.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class Application extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(Application.class);
    }

    // main()은 임베디드 실행용으로 유지해도 되고 삭제해도 됨
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 2.3 Tomcat 9 호환성

| 항목 | Tomcat 9 |
|------|----------|
| Servlet API | 4.0 |
| JSP | 2.3 |
| EL | 3.0 |
| Java EE 플랫폼 | Java EE 8 |
| 네임스페이스 | `javax.servlet.*`, `javax.persistence.*` |

> 주의: Spring Boot 2.5.x와 Tomcat 9(또는 그 이하)는 정확히 맞물립니다. 외장 Tomcat을 10.x로 올리려면 Jakarta 네임스페이스가 필요하므로 반드시 Spring Boot 3.x로 올려야 합니다.

### 2.4 Java 버전 설정 (레거시 방식)

Gradle 7.x 이전 스타일에서는 `sourceCompatibility`/`targetCompatibility`를 문자열로 설정하는 관행을 여전히 사용할 수 있습니다. toolchain으로 바꾸고 싶다면 아래 3.3 참고.

```groovy
sourceCompatibility = '11'
targetCompatibility = '11'
```

---

## 3. 모던 셋업 (Spring Boot 3.4+ + Java 21 + Jar)

### 3.1 `build.gradle.kts` (Kotlin DSL)

```kotlin
plugins {
    java
    id("org.springframework.boot") version "3.4.3"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-validation")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```

**핵심 포인트:**
- `bootJar` 태스크가 기본 활성화되어 `build/libs/*.jar`에 실행 가능한 fat jar 생성
- `java.toolchain`을 사용하면 Gradle이 자동으로 JDK 21을 다운로드해 빌드·실행
- `sourceCompatibility`/`targetCompatibility`는 toolchain 설정 시 불필요

> 주의: Spring Boot 3.4는 Gradle 7.6.4 이상 또는 Gradle 8.4 이상이 필요합니다. Gradle 7.5, 8.0~8.3은 Spring Boot 3.4에서 지원 제거되었습니다.

### 3.2 선택적 Native Image 활성화

GraalVM Native Image로 빌드하려면 플러그인을 추가합니다.

```kotlin
plugins {
    java
    id("org.springframework.boot") version "3.4.3"
    id("io.spring.dependency-management") version "1.1.7"
    id("org.graalvm.buildtools.native") version "0.10.3"
}
```

> 주의: Spring Boot 3.2+ 이후 Spring Boot BOM이 `org.graalvm.buildtools.native` 플러그인 버전(0.10.x)을 관리하므로, 버전 번호를 생략해도 BOM이 자동 주입합니다. 실행 시에는 GraalVM JDK(예: GraalVM 21) toolchain이 필요합니다.

빌드 명령:
```bash
./gradlew nativeCompile        # 네이티브 실행 파일 생성 → build/native/nativeCompile/
./gradlew bootBuildImage --imageName=myorg/myapp   # OCI 이미지 (Paketo buildpack)
```

### 3.3 Gradle 호환성 매트릭스 (검증된 조합)

| Gradle | JDK 빌드 실행 | Java 21 컴파일 |
|--------|--------------|----------------|
| 7.x | 11 ~ 19 | ❌ (8.5+에서 지원) |
| 8.4 | 8 ~ 21 | ✅ |
| 8.5+ | 8 ~ 21+ | ✅ (공식 지원 시작) |
| 9.x | 17 ~ 26 | ✅ |

> 주의: Gradle 자체를 실행하는 JVM 버전(= `gradle --version`의 JVM)과 빌드 대상 Java 버전(toolchain)은 분리됩니다. toolchain을 쓰면 Gradle 실행 JDK는 낮은 버전을 써도 컴파일은 Java 21로 수행 가능합니다.

---

## 4. Spring Boot Starter 의존성 선택

자주 사용하는 스타터 (Spring Boot 2.5 / 3.4 공통):

| 스타터 | 용도 | 포함 주요 라이브러리 |
|--------|------|----------------------|
| `spring-boot-starter-web` | REST API, 내장 Tomcat | Spring MVC, Jackson, Tomcat |
| `spring-boot-starter-webflux` | 리액티브 WebFlux | Reactor Netty, Spring WebFlux |
| `spring-boot-starter-validation` | Bean Validation | Hibernate Validator |
| `spring-boot-starter-data-jpa` | JPA + Hibernate | Spring Data JPA, Hibernate |
| `spring-boot-starter-security` | 인증/인가 | Spring Security |
| `spring-boot-starter-actuator` | 헬스체크, 메트릭 | Micrometer |
| `spring-boot-starter-test` | 테스트 | JUnit 5, Mockito, AssertJ, Spring Test |
| `spring-boot-starter-tomcat` | 내장 Tomcat (교체/exclude 용) | Tomcat Embed |

**자주 쓰는 선택 패턴:**

- REST JSON API 기본: `starter-web` + `starter-validation` + `starter-test`
- DB 연동 추가: `starter-data-jpa` + JDBC 드라이버 (예: `com.mysql:mysql-connector-j` — 3.x에서는 `mysql:mysql-connector-java`가 아님)
- Netty 전환: `starter-web` 제거 후 `starter-webflux`

> 주의: Spring Boot 3.x부터 `starter-validation`이 `starter-web`에 자동 포함되지 않으므로 별도 선언해야 `@Valid`가 동작합니다.

---

## 5. `application.yml` 프로파일 분리

### 5.1 파일 분리 방식 (권장)

```
src/main/resources/
├── application.yml               # 공통/기본값
├── application-local.yml         # 로컬 개발
├── application-prod.yml          # 운영
└── application-test.yml          # 테스트
```

**`application.yml` (공통):**
```yaml
spring:
  application:
    name: my-service

server:
  port: 8080

management:
  endpoints:
    web:
      exposure:
        include: health,info
```

**`application-local.yml`:**
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:devdb
    username: sa
    password: ""

logging:
  level:
    com.example: DEBUG
    org.springframework.web: DEBUG
```

**`application-prod.yml`:**
```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USER}
    password: ${DB_PASSWORD}

logging:
  level:
    root: INFO
    com.example: INFO
```

### 5.2 프로파일 활성화

```bash
# 실행 시 프로파일 지정
java -jar app.jar --spring.profiles.active=prod

# 또는 환경변수
export SPRING_PROFILES_ACTIVE=prod
java -jar app.jar

# Gradle bootRun
./gradlew bootRun --args='--spring.profiles.active=local'
```

### 5.3 시크릿 관리 규칙

- `application-prod.yml`에 실제 비밀번호·키를 하드코딩하지 않는다
- 운영 환경 값은 `${ENV_VAR}` 플레이스홀더로 참조하고 실제 값은 배포 환경의 환경변수/시크릿 매니저(AWS SSM, Vault 등)로 주입
- `application-local.yml`도 개인 계정 정보가 들어가면 Git에 커밋하지 말고 `.gitignore`에 추가

### 5.4 단일 파일 멀티 프로파일 (대안)

소규모 프로젝트에서는 `---` 구분자로 한 파일에 모두 기재할 수 있습니다.

```yaml
spring:
  application:
    name: my-service

---
spring:
  config:
    activate:
      on-profile: local
  datasource:
    url: jdbc:h2:mem:devdb

---
spring:
  config:
    activate:
      on-profile: prod
  datasource:
    url: ${DB_URL}
```

> 주의: Spring Boot 2.4+에서는 `spring.profiles: prod` 대신 `spring.config.activate.on-profile: prod` 문법을 사용해야 합니다. 2.4 이전 문법은 deprecated되었고 3.x에서는 완전 제거되었습니다.

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
