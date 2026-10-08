---
name: spring-boot-1-to-2-migration
description: Spring Boot 1.x(예 1.3.x·Java 8·WAR) 레거시를 2.7.x까지 올리는 단계 가이드 — 공식 전제 경로(1.3→최신 1.5.x→2.0→최신 2.7.x), 1.4·1.5 변경(starter 이름·테스트 애노테이션·Actuator 역할·@Validated·session store-type), 2.0 변경(Framework 5·properties-migrator·relaxed binding·Security/Actuator·Hikari·Hibernate 5.2·Gradle 플러그인), 2.1~2.7 동작 변경(bean overriding·설정 파일 처리·순환 참조 등), OpenRewrite 범위와 한계, mybatis-spring-boot-starter 대응표, 체크리스트, 지원 종료와 최종 목표 버전 결정. 2.7→3.x는 spring-boot-2-to-3-migration으로 이어진다
---

# Spring Boot 1.x → 2.7.x 마이그레이션 가이드

> 소스:
> - https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-1.4-Release-Notes
> - https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-1.5-Release-Notes
> - https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.0-Migration-Guide
> - https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.1-Release-Notes ~ Spring-Boot-2.7-Release-Notes (2.1·2.2·2.3·2.4·2.5·2.6·2.7)
> - https://spring.io/blog/2020/08/14/config-file-processing-in-spring-boot-2-4
> - https://docs.spring.io/spring-boot/docs/1.5.22.RELEASE/reference/html/getting-started-system-requirements.html
> - https://docs.spring.io/spring-boot/docs/1.4.x/api/deprecated-list.html
> - https://docs.openrewrite.org/recipes/java/spring/boot2/upgradespringboot_2_0
> - https://docs.openrewrite.org/recipes/java/spring/boot2/upgradespringboot_2_7
> - https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/
> - https://spring.io/support-policy
> - https://endoflife.date/spring-boot (2차 소스 — 날짜 표 확인용)
>
> 검증일: 2026-10-08

> 주의: 이 스킬은 **경로(path) 스킬**이다. "무엇을, 어떤 순서로, 어디까지 자동화하는가"만 다룬다.
> 2.7.x 도착 이후의 **2.7 → 3.x** 구간(Java 17, javax→jakarta, Security 6 등)은 `spring-boot-2-to-3-migration` 스킬이 담당하며
> 이 문서에서 반복하지 않는다. 그 스킬은 출발점을 2.5로 가정하므로, 이 스킬로 2.7.18에 도착했다면 그 스킬의 Phase 1(2.5→2.7.18)은 완료된 것으로 보고 Phase 2(Java 17)부터 읽는다.

---

## 0. 언제 쓰고 언제 쓰지 않는가

| 상황 | 이 스킬 |
|------|---------|
| Spring Boot 1.3/1.4/1.5 레거시(Java 7·8, WAR/Jar)를 살려서 올려야 한다 | 사용 |
| 이미 2.x인데 2.7로 올리기만 하면 된다 | 4장(2.1~2.7)만 사용 |
| 2.7 → 3.x/4.x | `spring-boot-2-to-3-migration` |
| 기능이 작고 테스트가 거의 없어 재작성이 더 싸다 | 이 스킬 대신 최신 버전 신규 셋업 검토 |

---

## 1. 공식 전제 경로 — "각 단계의 최신 패치를 먼저"

공식 문서에는 **"1.x에서 3.x로 직행하지 말라"는 문구가 따로 있지는 않다.** 대신 각 메이저 가이드가 다음을 **전제**로 한다.

- Spring Boot 2.0 Migration Guide: *"Before you start the upgrade, make sure to upgrade to the latest `1.5.x` available version."*
- Spring Boot 3.0 Migration Guide: 같은 방식으로 최신 2.7.x를 먼저 거치도록 전제한다(`spring-boot-2-to-3-migration` 참조).
- 1.x 마이너 사이에서는 각 릴리스 노트가 "직전 마이너에서 deprecated된 것은 이번에 제거됐다"고 적는다(1.4·1.5 모두). 즉 **마이너를 건너뛰면 deprecated 경고 단계를 못 보고 바로 컴파일 에러를 맞는다.**

그래서 실무 경로는 다음과 같다.

```
1.3.x ─► 1.4.x(최신) ─► 1.5.22(1.x 마지막) ─► 2.0.x ─► 2.1 … 2.6 ─► 2.7.18(2.x 마지막) ─► (spring-boot-2-to-3-migration)
          ★배포              ★배포                ★배포                  ★배포 (필요시 마이너 단위)
```

| 구간 | 독립 배포 권장 이유 |
|------|---------------------|
| 1.3 → 1.4 | 테스트 애노테이션 전면 교체, Hibernate 5 기본, starter 이름 변경(구 이름 deprecated) |
| 1.4 → 1.5.22 | 1.4 deprecated 제거, Actuator 보안 기본값 변경 — **2.0 진입 전 deprecated 경고 0** 만드는 단계 |
| 1.5 → 2.0 | 가장 큰 단절(Framework 5, 설정 키·바인딩·Security·Actuator·커넥션 풀). 단독 배포 |
| 2.0 → 2.7 | 동작 기본값 변경이 마이너마다 하나씩 있다(4장). 테스트가 충분하면 몇 마이너씩 묶어도 되지만 **2.1·2.4·2.6은 기동 실패를 유발하는 변경**이 있어 경계로 삼기 좋다 |

> 주의: 1.4.x·2.0~2.6.x의 "최신 패치" 번호는 이 문서에서 고정하지 않는다(모든 라인이 OSS 지원 종료 상태). 1.5.22와 2.7.18이 각 메이저의 마지막 패치라는 점은 endoflife.date(2차 소스)로 확인했다.

### 전 구간 공통 사전 조건

| 항목 | 값 | 근거 |
|------|-----|------|
| Java | 1.5까지 Java 7+(8 권장), **2.0부터 Java 8 필수** — 2.7까지 Java 8 유지 가능 | 1.5 시스템 요구사항, 2.0 Migration Guide, 2.x 릴리스 노트(각 마이너가 Java 8 호환 유지 명시) |
| Spring Framework | 1.4·1.5 = 4.3, 2.0 = 5.0, 2.1 = 5.1, 2.4 = 5.3 | 각 릴리스 노트 |
| Gradle | 2.0부터 **Gradle 4+** (2.3부터 6.3+) | 2.0 Migration Guide, 2.3 Release Notes |
| 테스트 | 회귀 기준이 될 통합 테스트(최소 주요 API 스모크) | 이 스킬 원칙 — 없으면 0단계에서 먼저 만든다 |

> Java 8로 2.7까지 올라간 뒤 3.x로 가려면 Java 17이 필수다. Java 업그레이드는 **Boot 업그레이드와 다른 배포**로 분리한다.

---

## 2. 1.3 → 1.4 → 1.5 구간

### 2.1 1.4 (Spring Framework 4.3 필요)

| 변경 | 내용 | 조치 |
|------|------|------|
| starter 이름 변경 | `spring-boot-starter-ws` → `spring-boot-starter-web-services`, `spring-boot-starter-redis` → `spring-boot-starter-data-redis` (구 이름은 1.5에서 제거 예정으로 공지) | 의존성 좌표 교체 |
| 1.3 deprecated 제거 | 1.3에서 deprecated된 클래스·메서드 삭제. **Log4j 1 지원 제거** | 컴파일 에러 목록 = 할 일 목록. Log4j 1 → Logback(또는 Log4j2) |
| Hibernate 5.0 기본 | 4.3 → 5.0. 문제가 크면 `hibernate.version`을 4.3.11.Final로 임시 고정 가능 | JPA 사용 시 회귀 테스트 |
| 네이밍 전략 | `SpringNamingStrategy`는 더 이상 쓰이지 않고 `SpringPhysicalNamingStrategy` + Hibernate 기본 `ImplicitNamingStrategy` 조합 | `spring.jpa.hibernate.naming-strategy` → `naming.physical-strategy`/`naming.implicit-strategy`. **테이블·컬럼명이 바뀌지 않는지 DDL 비교** |
| DataSource 바인딩 | 풀 전용 설정이 `spring.datasource.tomcat.*` / `hikari.*` / `dbcp2.*` 네임스페이스로 분리 | 풀 튜닝 키를 해당 네임스페이스로 이동 |
| 테스트 재편 | `@SpringApplicationConfiguration` → `@SpringBootTest(classes=…)`, `@IntegrationTest` → `@SpringBootTest(webEnvironment=NONE)`, `@WebIntegrationTest` → `@SpringBootTest(webEnvironment=RANDOM_PORT/DEFINED_PORT)` | 테스트 코드 일괄 치환 |
| WAR 초기화 클래스 | `org.springframework.boot.context.web.SpringBootServletInitializer` deprecated → `org.springframework.boot.web.support.SpringBootServletInitializer` | import 교체 (2.0에서 한 번 더 이동 — 3.3) |
| 실행 jar 레이아웃 | 라이브러리 위치 `lib/` → `BOOT-INF/lib/` | jar 내부 경로를 가정한 배포 스크립트 점검 |
| 서드파티 | Tomcat 8.5, Jetty 9.3, Jackson 2.7, Jersey 2.23 | 외장 WAS에 WAR 배포 시 WAS 버전 호환 확인 |

```java
// Before (1.3)
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = DemoApplication.class)
@WebIntegrationTest(randomPort = true)
public class OrderApiIT { }

// After (1.4+)
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class OrderApiIT { }
```

### 2.2 1.5 (1.x 마지막 라인, 마지막 패치 1.5.22)

| 변경 | 내용 | 조치 |
|------|------|------|
| 1.4 deprecated 제거 | 1.4에서 deprecated된 클래스·메서드·**프로퍼티** 삭제. HornetQ·Velocity 지원 제거 | 1.4에서 경고 0을 만들고 올 것 |
| starter 구 이름 제거 | 1.4에서 바뀐 `-ws`, `-redis` 구 이름이 **삭제** → "unresolved dependency" | 2.1 표대로 교체 완료 확인 |
| `@ConfigurationProperties` 검증 | JSR-303 제약을 쓰는 프로퍼티 클래스에 **`@Validated` 필요**. 당장은 경고만 남기고 동작 | 클래스에 `@Validated` 추가(2.0 이후 필수 동작 기준) |
| Spring Session | Redis 자동 선택이 없어짐 → **`spring.session.store-type=redis` 명시** | 미설정 시 세션 저장소 미구성으로 기동 실패/동작 변화 |
| Actuator 보안 | 민감 엔드포인트는 Spring Security가 없어도 **기본 보호**, 필요 역할 `ADMIN` → **`ACTUATOR`** | 모니터링 계정에 `ACTUATOR` 역할 부여, 또는(내부망 한정) `management.security.enabled=false` |
| JPA DB 감지 | `spring.jpa.database`를 `spring.datasource.url`에서 자동 감지 | 방언 문제 시 `spring.jpa.database-platform` 명시 |

```java
@Validated                                  // 1.5부터 필요 (없으면 경고)
@ConfigurationProperties(prefix = "app.mail")
public class MailProperties {
    @NotBlank private String host;
    // getter/setter
}
```

---

## 3. 1.5 → 2.0 (가장 큰 단절)

### 3.1 시작 전

1. **1.5.22에서 deprecated 경고 0**, 테스트 GREEN.
2. 임시로 `spring-boot-properties-migrator`를 추가한다(아래). 기동 로그가 이름이 바뀐 키를 진단하고 **런타임에 임시 치환**해 준다.

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-properties-migrator</artifactId>
  <scope>runtime</scope>
</dependency>
```

> 공식 가이드: 마이그레이션이 끝나면 이 모듈을 **반드시 의존성에서 제거**한다. 런타임 치환에 기대 운영하면 "잘못된 키가 계속 동작하는" 착시가 생긴다.

### 3.2 기반 변경

| 항목 | 1.5 | 2.0 |
|------|-----|-----|
| Java | 7+ | **8+** |
| Spring Framework | 4.3 | **5.0** |
| 내장 컨테이너 패키지 | `org.springframework.boot.context.embedded` | `org.springframework.boot.web.server` 등으로 재배치 (`EmbeddedServletContainer` → `WebServer`) |
| WAR 초기화 클래스 | `org.springframework.boot.web.support.SpringBootServletInitializer` | **`org.springframework.boot.web.servlet.support.SpringBootServletInitializer`** |
| Gradle 플러그인 | `dependency-management` 자동 적용, `bootRepackage` | dependency-management **자동 적용 안 됨(명시 적용)**, `bootRepackage` → **`bootJar` / `bootWar`**, Gradle 4+ |

```groovy
// Spring Boot 2.0 Gradle — dependency-management를 직접 적용해야 한다
plugins {
    id 'org.springframework.boot' version '2.0.9.RELEASE'
    id 'war'
}
apply plugin: 'io.spring.dependency-management'
// 실행: ./gradlew bootWar   (1.x의 bootRepackage 대체)
```

```java
// WAR 배포 진입점 — 1.3 → 1.4 → 2.0 에서 패키지가 두 번 바뀐다
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer; // 2.0+

public class ServletInitializer extends SpringBootServletInitializer {
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(DemoApplication.class);
    }
}
```

### 3.3 설정 키·바인딩

| 변경 | 내용 |
|------|------|
| relaxed binding 엄격화 | 바인딩이 새 `Binder` API로 재작성, `RelaxedPropertyResolver` 제거. 키는 **canonical 형식(kebab-case, 예 `acme.my-property`)** 으로 쓴다 |
| 서블릿 키 이동 | `server.context-path` → **`server.servlet.context-path`**, `server.servlet-path` → `server.servlet.path`(2.1에서 다시 `spring.mvc.servlet.path`로 이동), JSP·컨텍스트 파라미터 키도 `server.servlet.*` 아래로 |
| Flyway/Liquibase | `flyway.*` → `spring.flyway.*`, `liquibase.*` → `spring.liquibase.*` |
| DataSource 초기화 | 기본 `DataSource` 초기화(schema.sql/data.sql)는 **임베디드 DB에서만** 기본 활성. 운영 DB에서 스크립트를 돌려 왔다면 `spring.datasource.initialization-mode`로 명시 |

> 주의: relaxed binding 변화는 properties-migrator가 **못 잡는 경우가 있다**(키 이름은 같고 표기만 다른 경우, `@Value`로 직접 읽는 경우). 환경변수·시스템 프로퍼티로 주입하던 값은 기동 후 실제 바인딩 값을 `/actuator/configprops`(노출 시) 또는 테스트로 확인한다.

### 3.4 Security·Actuator

| 변경 | 내용 | 조치 |
|------|------|------|
| Security 자동 설정 단순화 | `security.basic.*`, `security.enable-csrf`, `security.headers.*`, `security.ignored`, `security.require-ssl`, `security.sessions` **제거**. 직접 `WebSecurityConfigurerAdapter`를 정의하면 Boot 기본 보안은 **물러난다(back off)** | 위 키로 하던 설정을 Java 설정으로 옮긴다 |
| Actuator 별도 보안 제거 | `management.security.*` 자동 설정 없음 → 애플리케이션 보안 규칙에 Actuator 경로를 직접 포함 | 1.5에서 쓰던 `ACTUATOR` 역할 규칙을 SecurityConfig로 이전 |
| 기본 경로 | 모든 엔드포인트가 **`/actuator`** 아래로 (`/health` → `/actuator/health`) | 로드밸런서 헬스체크·모니터링 URL 변경 |
| 웹 노출 기본값 | Spring Security 유무와 무관하게 **`health`, `info`만 웹 노출** | 필요한 것만 `management.endpoints.web.exposure.include`로 노출 |
| 엔드포인트 ID | `/autoconfig` → `/conditions`, `/trace` → `/httptrace` | 대시보드 수정 |
| 키 구조 | `endpoints.<id>.*` → `management.endpoint.<id>.*` | |

```java
// 2.0 — Actuator 보안을 애플리케이션 보안 설정에 직접 포함 (Security 5.0 스타일)
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
            .requestMatchers(EndpointRequest.to("health", "info")).permitAll()
            .requestMatchers(EndpointRequest.toAnyEndpoint()).hasRole("ACTUATOR")
            .anyRequest().authenticated()
            .and().httpBasic();
    }
}
```

> 이 시점에서는 `WebSecurityConfigurerAdapter`를 그대로 쓴다. 2.7에서 deprecated되고 3.x(Security 6)에서 제거되므로, **`SecurityFilterChain` Bean 전환은 2.7 단계에서** 한다(4장, `spring-boot-2-to-3-migration` Phase 3).

### 3.5 데이터·기타 기본값 변경

| 변경 | 1.5 | 2.0 | 영향·조치 |
|------|-----|-----|-----------|
| 기본 커넥션 풀 | Tomcat JDBC | **HikariCP** | `spring.datasource.tomcat.*` 튜닝 값이 **조용히 무시**된다 → `spring.datasource.hikari.*`로 재설정 (`hikaricp-tuning-oracle-mysql` 스킬) |
| Hibernate | 5.0 | **최소 5.2** | `spring.jpa.hibernate.use-new-id-generator-mappings` 기본 **`true`** — `@GeneratedValue(AUTO)` 전략이 바뀌어 **ID 생성(시퀀스/테이블) 동작이 달라질 수 있음**. 기존 동작 유지가 필요하면 `false` 명시 |
| Redis 드라이버 | Jedis | **Lettuce** | Jedis 전용 설정을 쓰고 있었다면 Jedis 의존성 명시 + 설정 확인 |
| Jackson 날짜 | (timestamp 숫자) | **JSR-310 날짜를 ISO-8601 문자열**로 출력 | API 응답 포맷이 바뀐다. 클라이언트 호환이 필요하면 `spring.jackson.serialization.write-dates-as-timestamps=true` |
| MVC 확장자 매칭 | `.json` suffix 매칭 | **기본 비활성** | `GET /items/1.json` 같은 호출이 깨진다 |
| Thymeleaf | 2 | **3** | 템플릿 문법 마이그레이션 필요 |
| Mustache | `.html` | 기본 확장자 **`.mustache`** | |
| 메트릭 | Boot 자체 메트릭 | **Micrometer** 기반으로 재설계 | 커스텀 메트릭 코드 재작성 |

---

## 4. 2.0 → 2.7 — 마이너별 "기동·동작이 바뀌는" 변경

> 아래는 각 릴리스 노트의 업그레이드 섹션에서 **기동 실패 또는 조용한 동작 변화**를 일으키는 항목만 고른 것이다. 전체 목록은 릴리스 노트 원문을 본다.

| 버전 | 변경 | 증상 | 복구 키(임시) / 정공법 |
|------|------|------|------------------------|
| **2.1** (Framework 5.1, Java 11 지원) | **bean overriding 기본 비활성화** | 같은 이름 Bean 정의 시 `BeanDefinitionOverrideException`으로 기동 실패 | `spring.main.allow-bean-definition-overriding=true` / 중복 Bean 제거·이름 분리 |
| 2.1 | `server.servlet.path` → `spring.mvc.servlet.path` | DispatcherServlet 경로 미적용 | 키 변경 |
| 2.1 | Hibernate 5.3, JPA API 좌표 `javax.persistence:javax.persistence-api` | 의존성 충돌 | 구 `hibernate-jpa-2.1-api` 직접 선언 제거 |
| 2.1 | Security가 있고 커스텀 설정이 없으면 `/info`·`/health` 공개 | 노출 범위 변화 | Actuator 보안 명시 |
| **2.2** | `spring-boot-starter-test`가 **JUnit 5 기본**(Vintage 엔진 포함) | JUnit 4 테스트는 아직 동작 | 2.4 전에 JUnit 5로 이행 시작 |
| 2.2 | Java EE 의존성 **좌표**가 Jakarta 좌표로(예 `com.sun.mail:jakarta.mail`) — 패키지는 여전히 `javax.*` | 좌표 직접 선언 시 중복 jar | 구 좌표 직접 선언 제거 |
| 2.2 | `logging.file` → `logging.file.name`, `logging.path` → `logging.file.path` | 로그 파일 미생성 | 키 변경 |
| 2.2 | Actuator HTTP trace·auditing 기본 비활성 | `/actuator/httptrace` 빈 응답 | 저장소 Bean 등록 시 재활성 |
| **2.3** | web starter가 **validation을 더 이상 포함하지 않음** | `@Valid` 무시·`javax.validation` 클래스 없음 | `spring-boot-starter-validation` 추가 |
| 2.3 | 기본 에러 응답에서 `message`·binding errors 제외 | 클라이언트가 의존하던 에러 메시지 사라짐 | `server.error.include-message`, `include-binding-errors` (노출은 보안 검토 후) |
| 2.3 | 서버 스레드 키가 `server.tomcat.threads.*` 등으로 이동, Gradle 6.3+ | | 키 변경 |
| **2.4** (Framework 5.3) | **설정 파일 처리 방식 변경** — 문서 정의 순서대로 로드, 프로파일 전용 문서에서 프로파일 활성화 불가, 다문서 YAML의 `spring.profiles` → **`spring.config.activate.on-profile`** | 프로파일별 값이 예상과 다르게 덮어써짐(기동은 되는데 값이 틀림) | 임시 `spring.config.use-legacy-processing=true` / 정공법은 Config Data Migration Guide대로 YAML 재작성 + 프로파일 그룹 |
| 2.4 | `spring-boot-starter-test`에서 **Vintage 엔진 제거** | JUnit 4 테스트가 **조용히 실행 안 됨** | `junit-vintage-engine` 직접 추가 또는 JUnit 5 이행 |
| 2.4 | Logback 키 이동(`logging.pattern.rolling-file-name` → `logging.logback.rollingpolicy.file-name-pattern`, `logging.file.max-size` → `logging.logback.rollingpolicy.max-file-size` 등) | 롤링 정책 미적용 | 키 변경 |
| 2.4 | 임베디드 DB 판정이 "인메모리일 때만"으로 | 파일 모드 H2 등에서 초기화 스크립트 미실행 | 초기화 모드 명시 |
| **2.5** | `spring.datasource.initialization-mode` 등 → **`spring.sql.init.*`** | | 키 변경 |
| 2.5 | `data.sql`이 **Hibernate 초기화 전에** 실행 | Hibernate DDL로 만든 테이블에 넣던 `data.sql` 실패 | `spring.jpa.defer-datasource-initialization=true` |
| 2.5 | Actuator `/info` 웹 기본 비노출, Security 있으면 인증 필요 | 모니터링 수집 실패 | exposure 설정 |
| 2.5 | EL 구현 Glassfish → Tomcat | 검증 메시지 보간 차이 가능 | 메시지 확인 |
| **2.6** | **순환 참조 기본 금지** | `BeanCurrentlyInCreationException`으로 기동 실패 | 임시 `spring.main.allow-circular-references=true` / 정공법은 순환 의존 제거(생성자 주입 재설계) |
| 2.6 | Spring MVC 경로 매칭 기본 `AntPathMatcher` → **`PathPatternParser`** | 일부 패턴·`mvcMatchers` 동작 차이, Springfox 2.x와 충돌이 흔함 | 임시 `spring.mvc.pathmatch.matching-strategy=ant-path-matcher` |
| 2.6 | `env` info contributor 기본 비활성 | `/actuator/info`의 `info.*` 값 사라짐 | `management.info.env.enabled=true` |
| 2.6 | Kafka 3.0 idempotence 기본 활성 | 권한 없는 클러스터에서 인가 예외 | 필요 시 `spring.kafka.producer.properties.enable.idempotence=false` |
| **2.7** | 자동 설정 등록: `spring.factories` 방식 **deprecated** → `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` + `@AutoConfiguration` | 2.7은 동작, 3.0에서 제거 | 사내 공용 auto-config 모듈을 2.7에서 이전 |
| 2.7 | `WebSecurityConfigurerAdapter` **deprecated** | 경고 | `SecurityFilterChain` Bean으로 전환(→ `spring-boot-2-to-3-migration` Phase 3) |
| 2.7 | H2 2.1(비호환 변경), Flyway 8.5(DB별 모듈 분리 예 `flyway-mysql`), MSSQL 드라이버 10 암호화 기본 활성 | 테스트 DB·마이그레이션 실패 | 각 마이그레이션 가이드 |
| 2.7.8+ | MySQL 드라이버 좌표 `mysql:mysql-connector-java` → **`com.mysql:mysql-connector-j`** | 구 좌표는 Boot 관리 버전이 적용되지 않음 | 좌표 교체 |

> 주의: `allow-bean-definition-overriding`, `use-legacy-processing`, `allow-circular-references`, `ant-path-matcher` 같은 **복구 키는 업그레이드를 통과시키기 위한 임시 수단**이다. 특히 `spring.config.use-legacy-processing`은 2.4 이후 이행 기간용 키이므로 3.x로 가기 전에 YAML을 새 방식으로 재작성해 두고 제거한다. 복구 키는 티켓으로 관리하고 2.7 도착 시점에 0개를 목표로 한다.

---

## 5. 자동화 — OpenRewrite의 범위와 한계

| 레시피 | 역할 |
|--------|------|
| `org.openrewrite.java.spring.boot2.UpgradeSpringBoot_2_0` | 1.x → 2.0. 빌드 파일 버전, `@ConditionalOnBean` 다중 조건 변환, 패키지 이동(`SpringBootServletInitializer`, `HttpMessageConverters`, `ErrorController`, `LocalServerPort`), `WebServerFactoryCustomizer` 전환, 일부 프로퍼티(banner-mode 등), Mockito 3·Commons Lang 3·MyBatis Spring Boot 2.0 업그레이드, Gradle wrapper 4.x |
| `org.openrewrite.java.spring.boot2.UpgradeSpringBoot_2_7` | 2.6 레시피를 먼저 포함하며 **2.x 단계를 연쇄적으로 적용**. OpenRewrite의 "Spring Boot 1 → 2" 가이드가 권장하는 진입 레시피 |

```bash
# Maven (rewrite-spring 레시피 모듈 필요)
mvn -U org.openrewrite.maven:rewrite-maven-plugin:run \
  -Drewrite.recipeArtifactCoordinates=org.openrewrite.recipe:rewrite-spring:RELEASE \
  -Drewrite.activeRecipes=org.openrewrite.java.spring.boot2.UpgradeSpringBoot_2_7
```

```groovy
// Gradle
plugins { id 'org.openrewrite.rewrite' version 'latest.release' }
rewrite { activeRecipe('org.openrewrite.java.spring.boot2.UpgradeSpringBoot_2_7') }
dependencies { rewrite('org.openrewrite.recipe:rewrite-spring:latest.release') }
// 실행: ./gradlew rewriteRun   (미리보기: ./gradlew rewriteDryRun)
```

| 도구가 하는 것 | 사람이 해야 하는 것 |
|----------------|---------------------|
| 버전·좌표 상향, 패키지 이동, 이름 바뀐 프로퍼티 치환, 일부 API 변환 | **기본값 변화로 인한 동작 차이**(Hikari 튜닝, ID 생성 전략, Jackson 날짜 포맷, Actuator 경로·노출, bean overriding·순환 참조, 설정 파일 처리 순서) |
| | Security 설정 재작성(`security.*` 키 제거분), Log4j 1 제거, Thymeleaf 3 템플릿 |
| | 공식 가이드가 밝힌 미지원 항목: JAX-RS → Spring MVC 애노테이션 변환, `@EmbeddedKafkaRule` → `@EmbeddedKafka`, 부모 클래스 조건의 `ConditionalOnAnyBean` 등 |
| | 사내 공용 라이브러리·사내 starter의 Boot 2 호환 버전 확보 |

> 주의: rewrite-spring 레시피는 **Moderne Source Available License**다(Apache 2.0 아님). 소스는 공개지만 사내 도입 시 라이선스 정책 확인이 필요하다.
> 주의: 레시피를 한 번에 2.7까지 돌려도 **배포는 1장의 단계별로 끊는다.** 자동 변환 커밋과 수동 수정 커밋은 분리해 리뷰 가능하게 남긴다. "컴파일 통과"는 동작 동일성을 보장하지 않는다.

---

## 6. 의존성 대응

### 6.1 mybatis-spring-boot-starter (공식 호환표)

| starter | MyBatis-Spring | Spring Boot | Java | 상태 |
|---------|----------------|-------------|------|------|
| 1.1 | 1.3 | 1.3 | 6+ | EOL |
| 1.2 | 1.3 | 1.4 | 6+ | EOL |
| 1.3 | 1.3 | 1.5 | 6+ | EOL |
| 2.0 | 2.0 | 2.0–2.1 | 8+ | EOL |
| 2.1 | 2.0 (2.0.6+) | 2.1–2.4 | 8+ | EOL |
| 2.2 | 2.0 (2.0.6+) | 2.5–2.7 | 8+ | EOL |
| **2.3** | 2.1 | **2.7** | 8+ | 2.7 도착 시 목표 |
| 3.0 | 3.0 | 3.2–3.5 | 17+ | (다음 스킬) |

> 주의: 2.3의 Spring Boot 대응 범위가 소스마다 다르다 — 현재 공식 페이지는 **2.7**로, 과거 표·일부 2차 자료는 "2.5–2.7"로 적는다. 이 문서는 2026-10-08 확인한 공식 페이지(2.7)를 따른다. Boot 업그레이드 단계마다 starter도 같은 행으로 맞춘다(예: Boot 2.0 배포 = starter 2.0.x).

- MyBatis 매퍼 XML·SQL은 이 구간에서 거의 영향이 없다. 사고는 **커넥션 풀 전환(Tomcat JDBC → Hikari)** 에서 난다(3.5).
- 매퍼 패턴은 `mybatis-mapper-patterns`, 풀 튜닝은 `hikaricp-tuning-oracle-mysql` 스킬 참조.

### 6.2 기타 흔한 의존성

| 영역 | 확인 지점 |
|------|-----------|
| Log4j 1 | 1.4에서 지원 제거 → Logback(기본) 또는 Log4j2 starter |
| Springfox(Swagger 2) | 2.6의 `PathPatternParser` 기본값과 충돌이 흔함 → 임시 `ant-path-matcher`. 장기적으로 3.x에서 springdoc로 교체(`swagger-springfox-2` → `springdoc-openapi-3`) |
| Spring Cloud | Boot 마이너마다 대응 릴리스 트레인이 정해져 있다 — Boot와 **같은 배포에서** 트레인을 맞춘다 |
| Redis | 2.0 Lettuce 기본. Redisson 등 별도 클라이언트는 Boot/Spring Data Redis 버전과 맞는 라인 확인(`redis-redisson-legacy`) |
| JUnit | 2.2 JUnit 5 기본, 2.4 Vintage 제거 → 2.2~2.3 구간에서 JUnit 5 이행(`testing-junit5-spring-boot`) |
| 외장 WAS(WAR) | 1.4부터 번들 Tomcat 8.5. 목표 Boot 버전의 공식 시스템 요구사항(지원 Servlet 버전)과 운영 WAS 버전을 Phase 0에서 대조 |

> 주의: Spring Cloud 릴리스 트레인 대응표, Springfox와 2.6의 구체적 충돌 메시지는 이 스킬 작성 시 원문 대조를 하지 않았다(미검증). 해당 프로젝트의 공식 호환표를 직접 확인한다.

---

## 7. 단계별 체크리스트

### Phase 0 — 인벤토리 (코드 변경 없음)
- [ ] 현재 Boot·Java·빌드 도구·외장 WAS 버전 기록
- [ ] `mvn dependency:tree` / `./gradlew dependencies`로 직접 선언한 버전 고정(hard pin) 목록 추출 — Boot 관리 버전과 충돌 후보
- [ ] 사내 공용 jar·사내 starter의 Boot 2 호환 버전 존재 여부
- [ ] 주요 API 회귀 테스트(최소 스모크)와 응답 스냅샷 확보 — Jackson 날짜·에러 응답 비교용
- [ ] 최종 목표 버전 결정(8장)

### Phase 1 — 1.3 → 1.4 → 1.5.22
- [ ] starter 이름 교체(`-web-services`, `-data-redis`)
- [ ] 테스트 애노테이션 교체(`@SpringBootTest`), `SpringBootServletInitializer` import 교체
- [ ] Log4j 1 제거, Hibernate 5 네이밍 전략 확인(DDL 비교)
- [ ] `@ConfigurationProperties` + JSR-303 클래스에 `@Validated`
- [ ] `spring.session.store-type` 명시, Actuator `ACTUATOR` 역할 반영
- [ ] **deprecated 경고 0**

### Phase 2 — 1.5.22 → 2.0
- [ ] Java 8, Gradle 4+ / dependency-management 명시 적용, `bootWar`/`bootJar`
- [ ] `spring-boot-properties-migrator` 임시 추가 → 기동 경고 0까지 키 수정
- [ ] `server.servlet.context-path` 등 서블릿 키, `spring.flyway`/`spring.liquibase` 키
- [ ] `security.*` 키 제거분을 Java 설정으로, Actuator 경로 `/actuator`·노출 범위·보안 재설정
- [ ] Hikari 튜닝 이전(`spring.datasource.hikari.*`), `use-new-id-generator-mappings` 결정
- [ ] Jackson 날짜 포맷·`.json` suffix·Lettuce 영향 확인
- [ ] 헬스체크 URL 변경을 인프라(LB·모니터링)와 **같은 배포 일정으로** 합의

### Phase 3 — 2.0 → 2.7.18 (필요 시 2.1 / 2.4 / 2.6 경계에서 끊기)
- [ ] 2.1 중복 Bean 제거, 2.3 `spring-boot-starter-validation` 추가
- [ ] 2.2~2.4 JUnit 5 이행(Vintage 제거 전)
- [ ] 2.4 YAML 프로파일 재작성(`spring.config.activate.on-profile`), 프로파일별 실제 값 테스트
- [ ] 2.5 `spring.sql.init.*`, `data.sql` 실행 순서 확인
- [ ] 2.6 순환 참조 제거, 경로 매칭 전략 확인
- [ ] 2.7 `spring.factories` → `AutoConfiguration.imports`, MySQL 좌표, mybatis starter 2.3
- [ ] 복구 키(임시 플래그) 0개, `spring-boot-properties-migrator` **제거**
- [ ] 이후 `spring-boot-2-to-3-migration`의 Java 17 단계로 이동

---

## 8. 지원 종료와 최종 목표 버전 결정 (2026-10 기준)

공식 정책(spring.io/support-policy):
- Spring Boot 마이너는 출시 후 **최소 13개월 OSS 지원**, 상용(구독) 지원은 **최소 25개월**.
- 각 메이저의 **마지막 마이너(예: 2.7, 3.5)** 는 상용 지원에 **5년 enterprise 지원 기간이 추가**된다.

2차 소스(endoflife.date, 2026-10-08 확인) 날짜:

| 라인 | OSS 지원 종료 | 상용 지원 종료 | 마지막/최신 패치 |
|------|--------------|----------------|------------------|
| 1.5 | 2019-08-06 | 2020-11-06 | 1.5.22 |
| 2.0 | 2019-03-01 | 2020-06-01 | 2.0.9 |
| 2.7 | 2023-06-30 | 2029-06-30 | 2.7.18 |
| 3.5 | **2026-06-30 (종료)** | 2032-06-30 | 3.5.x |
| 4.0 | 2026-12-31 | 2027-12-31 | 4.0.x |
| 4.1 | 2027-07-31 | 2028-07-31 | 4.1.x |

> 주의: 위 날짜는 endoflife.date(2차 소스) 값이다. 공식 정책은 "최소 기간" 규칙이므로 실제 종료일은 spring.io의 프로젝트 지원 페이지·상용 계약에서 최종 확인한다.

**결론 — 2.7.18은 도착지가 아니라 중간 기착지다.**

| 상황 | 최종 목표 |
|------|-----------|
| OSS 패치(보안 수정)를 계속 받아야 한다 | 2026-10 현재 OSS 지원 중인 라인은 **4.x뿐**(3.x OSS 종료). 2.7.18 → 3.5.x → 4.x 순서로 단계 이행 |
| 상용 지원 계약이 있고 변경 최소화가 우선 | 2.7(상용 ~2029-06) 또는 3.5(상용 ~2032-06)에 머무르는 선택 가능 — 계약 범위 확인 |
| Java 8을 당장 못 벗어난다 | 2.7이 상한(3.x는 Java 17 필수). 이 경우 Java 업그레이드 계획이 Boot 계획보다 먼저다 |

> 1.x에서 2.7까지 올리는 동안에는 **OSS 보안 패치가 없는 버전들을 지나간다.** 중간 단계 버전으로 오래 운영하지 말고, 단계 배포 간격을 짧게 잡는다.

---

## 9. 흔한 실수

| 실수 | 증상 | 해결 |
|------|------|------|
| 1.3 → 2.x 직행 | deprecated 경고 단계 없이 수백 개 컴파일 에러 + 동작 변화가 한꺼번에 | 1.4 → 1.5.22 경유, 경고 0 후 2.0 |
| Tomcat JDBC 튜닝 키를 그대로 둠 | 2.0에서 풀 설정이 무시되고 Hikari 기본값으로 동작 → 부하 시 커넥션 대기 | `spring.datasource.hikari.*`로 이전 |
| 헬스체크 URL 미변경 | 2.0 배포 직후 LB가 전 인스턴스를 비정상 판정 | `/actuator/health`로 인프라와 동시 변경 |
| `use-new-id-generator-mappings` 무시 | JPA 신규 행 ID가 다른 시퀀스/테이블에서 생성되어 키 충돌 | 기존 전략 유지 시 `false`, 스테이징에서 INSERT 검증 |
| Jackson 날짜 포맷 변화 미인지 | 프런트·외부 연동이 날짜 파싱 실패 | 응답 스냅샷 비교, 필요 시 `write-dates-as-timestamps=true` |
| 2.4 설정 처리 변경을 legacy 플래그로만 넘김 | 3.x 이행 시 다시 터짐 | YAML을 `spring.config.activate.on-profile`로 재작성 |
| 2.4에서 JUnit 4 테스트가 실행 안 되는 걸 못 봄 | 테스트 수가 줄었는데 빌드는 GREEN | 테스트 개수 추이 모니터링, Vintage 추가 또는 JUnit 5 이행 |
| 복구 키·properties-migrator 방치 | 문제를 숨긴 채 운영 | 2.7 도착 시 0개 확인 |
| OpenRewrite 결과를 검토 없이 머지 | 컴파일은 되나 기본값 변화로 운영 장애 | 자동/수동 커밋 분리, 5장 "사람이 해야 하는 것" 점검 |
| 업그레이드 배포에 기능 변경 동봉 | 장애 원인 분리·롤백 판단 불가 | 프레임워크 업그레이드 배포는 단독으로 |
