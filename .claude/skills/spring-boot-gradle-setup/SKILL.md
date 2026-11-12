---
name: spring-boot-gradle-setup
description: Spring Boot 프로젝트 초기 셋업 - 레거시(2.5.12/Java 11/WAR/Tomcat 9)와 모던(3.4+/Java 21/Jar/Native) Gradle 빌드 스크립트, Gradle 호환 매트릭스, WAR 배포 흔한 실수, 4.x 마이그레이션 포인트(버전 매트릭스·Starter 이름 변경)
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
> 검증일: 2026-11-09 (최초 2026-04-22)

> 주의: Spring Boot 2.5.x는 OSS 지원이 종료된 상태(2.5 EOL ≈ 2023-02)이며, 2.7.x만 상용 Extended 지원이 연장되어 있습니다. 레거시 스택 유지 보수 용도로만 사용하고, 신규 프로젝트에는 3.4+ 또는 4.0+를 선택하세요.
>
> 주의: 2026-11-09 기준 Spring Boot 최신 안정은 4.1.2(Spring Framework 7 기반, 3.x 마지막 라인 최신은 3.5.16)입니다. 본 스킬은 사용자가 요청한 3.4+를 메인으로 작성하되, 4.0+/4.1+ 마이그레이션 포인트(9.7 Starter 이름 변경 포함)는 섹션 9(references/REFERENCE.md)에서 별도로 다룹니다.

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

> 주의: Maven(`spring-boot-starter-parent`)은 공식 예제가 `native-maven-plugin`을 버전 없이 선언합니다. Gradle은 공식 문서에 "`plugins` 블록에 `org.graalvm.buildtools.native`를 포함하라"고만 되어 있고 버전 생략 가능 여부는 명시돼 있지 않으므로 **버전을 명시**합니다(Boot 3.5.16 시스템 요구사항 기준 Native Build Tools 0.10.6). 실행 시에는 GraalVM JDK(예: GraalVM 21) toolchain이 필요합니다.
>
> 주의: 미검증 — Gradle `plugins` 블록에서 Boot가 이 플러그인 버전을 대신 정해 주는지는 확인하지 못했습니다(2026-11-09).

빌드 명령:
```bash
./gradlew nativeCompile        # 네이티브 실행 파일 생성 → build/native/nativeCompile/
./gradlew bootBuildImage --imageName=myorg/myapp   # OCI 이미지 (Paketo buildpack)
```

### 3.3 Gradle 호환성 매트릭스 (검증된 조합)

| Gradle | Gradle 실행 JVM | Java 21 컴파일(toolchain) |
|--------|----------------|----------------|
| 7.6.x | 8 ~ 19 | ❌ (toolchain은 8.4+) |
| 8.4 | 8 ~ 20 (21 위에서 실행 불가) | ✅ (toolchain 지원 시작) |
| 8.5+ | 8 ~ 21+ (21 위 실행은 8.5부터) | ✅ |
| 9.x | **17+** 필수 (25는 9.1.0+, 26은 9.4.0+) | ✅ |

> 근거: Gradle 공식 호환성 표(2026-11-09 확인, 현행 Gradle 9.9.0) — Java 21은 toolchain 8.4 / 실행 8.5, Java 25는 9.1.0, Java 26은 9.4.0.

> 주의: Gradle 자체를 실행하는 JVM 버전(= `gradle --version`의 JVM)과 빌드 대상 Java 버전(toolchain)은 분리됩니다. toolchain을 쓰면 Gradle 실행 JDK는 낮은 버전을 써도 컴파일은 Java 21로 수행 가능합니다.

---

## 4. Spring Boot Starter 의존성 선택

> 주의: Spring Boot **2.3**부터 `starter-validation`이 `starter-web`에 자동 포함되지 않으므로(2.5 레거시·3.x 모두 해당) 별도 선언해야 `@Valid`가 동작합니다.

---

> 상세 레퍼런스 (흔한 실수·Spring Boot 4.x 마이그레이션 포인트) → [`references/REFERENCE.md`](references/REFERENCE.md)
