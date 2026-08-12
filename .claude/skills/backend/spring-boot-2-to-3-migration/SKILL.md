---
name: spring-boot-2-to-3-migration
description: Spring Boot 2.5(Java 11) → 3.x(Java 17/21) 마이그레이션 실전 경로 — 2.7 선행 업그레이드, javax→jakarta 전면 전환, Security 5→6 / Springfox→Springdoc / Sleuth→Micrometer Tracing 교체, 설정 프로퍼티 변경, MyBatis·JDBC·HikariCP 호환 확인, WAR/Tomcat 10.1, OpenRewrite 자동화 경계, 순서 체크리스트와 롤백 판단 기준
---

# Spring Boot 2.5(Java 11) → 3.x(Java 17/21) 마이그레이션 가이드

> 소스:
> - https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide
> - https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Release-Notes
> - https://docs.spring.io/spring-boot/upgrading.html
> - https://docs.spring.io/spring-boot/system-requirements.html
> - https://github.com/spring-projects/spring-framework/wiki/Spring-Framework-6.0-Release-Notes
> - https://spring.io/blog/2022/02/21/spring-security-without-the-websecurityconfigureradapter/
> - https://docs.spring.io/spring-security/reference/6.5/migration-7/configuration.html
> - https://github.com/micrometer-metrics/tracing/wiki/Spring-Cloud-Sleuth-3.1-Migration-Guide
> - https://springdoc.org/migrating-from-springfox.html
> - https://github.com/mybatis/spring-boot-starter
> - https://github.com/apache/tomcat-jakartaee-migration
> - https://docs.openrewrite.org/recipes/java/spring/boot3/upgradespringboot_3_0-community-edition
>
> 검증일: 2026-08-11

> 주의: 이 스킬은 **경로(path) 스킬**이다. 각 목적지 기술의 사용법은 이 문서에서 반복하지 않고 짝 스킬로 연결한다.
> "무엇을, 어떤 순서로, 어디까지 자동화하고, 언제 되돌릴지"만 다룬다.

> 주의: 2026-08 기준 Spring Boot 3.5 라인의 OSS 지원은 2026-06-30 종료되었고 현행 OSS 라인은 4.x다.
> 그럼에도 2.x → 4.x **직행은 권장되지 않는다**. 공식 업그레이드 정책은 "현재 라인의 최신 마이너 → 다음 메이저"이므로
> 2.5 → 2.7.18 → **3.x** → (필요 시) 4.x 순서를 밟는다. 3.x → 4.x 구간은
> `.claude/skills/backend/spring-boot-gradle-setup/SKILL.md` 9장을 참조한다.

---

## 0. 이 스킬의 위치 — 레거시/모던 짝 스킬 지도

이 레포에는 출발지(레거시)와 목적지(모던) 스킬이 이미 있다. 이 스킬은 **둘을 잇는 경로**만 담당한다.

| 영역 | 출발지 (SB 2.5 / Java 11) | 목적지 (SB 3.x / Java 17+) |
|------|---------------------------|----------------------------|
| 빌드·패키징 | `backend/spring-boot-gradle-setup` (2장) | `backend/spring-boot-gradle-setup` (3장) |
| 인증 | `backend/spring-security-5-jwt-jjwt10` | `backend/spring-security-6-jwt-jjwt12` |
| API 문서 | `backend/swagger-springfox-2` | `backend/springdoc-openapi-3` |
| 추적·로깅 | `backend/logback-mdc-tracing` (Sleuth 분기) | `backend/logback-mdc-tracing` (Micrometer 분기) |
| 로컬 캐시 | `backend/ehcache-2-legacy` | (EhCache 3 / JCache — 별도 확인) |
| 분산 캐시·락 | `backend/redis-redisson-legacy` | `backend/redis-redisson-modern` |
| AWS SDK | `backend/aws-sdk-v1-s3-rekognition` | `backend/aws-sdk-v2-s3-rekognition` |
| 시간 타입 | (Joda-Time) | `backend/jackson-time-migration` |
| 검증·예외 | `backend/global-exception-validation` (javax/jakarta 양쪽 커버) | 동일 |
| MyBatis | `backend/mybatis-mapper-patterns` | 동일 |
| 커넥션 풀 | `backend/hikaricp-tuning-oracle-mysql` | 동일 |
| 멀티 DataSource | `backend/spring-multi-datasource-oracle-mysql` | 동일 |
| 테스트 | `backend/testing-junit5-spring-boot` | 동일 |

> 각 경로의 "왜 바꾸는가 / 언제 바꾸는가"는 이 문서, "어떻게 쓰는가"는 위 스킬을 본다.

---

## 1. 사전 조건 — 여기서 하나라도 못 지키면 시작하지 않는다

| 조건 | 값 | 근거 |
|------|-----|------|
| **Java** | **17 이상 필수** (21 LTS 권장) | Spring Boot 3.0은 Java 17 baseline, Java 8/11 미지원 |
| Spring Framework | 6.0+ (Boot가 관리) | Boot 3.0 = Framework 6.0 |
| Jakarta EE | 9+ (Boot 3.0은 EE 10 / Servlet 6.0) | `javax.*` → `jakarta.*` |
| 출발 Boot 버전 | **2.7.x 최신 패치(2.7.18)** | 공식: "현재 라인의 최신 마이너로 먼저 올린다" |
| Gradle | 7.6.4+ 또는 8.4+ (Boot 3.4/3.5 기준) | Boot 3.4 릴리즈 노트 |
| Maven | 3.6.3 이상 | Boot 시스템 요구사항 |
| 서블릿 컨테이너(WAR) | **Tomcat 10.1+** (Servlet 6.0) | Boot 3.0 번들 Tomcat 10.1 |

> 주의: Java 17 전환 자체가 별도의 리스크다. Lombok·MapStruct·ByteBuddy·Mockito·JaCoCo 등 **바이트코드를 다루는 도구**는
> Java 17 지원 버전으로 먼저 올려야 한다(`.claude/skills/backend/lombok-mapstruct-modelmapper/SKILL.md` 참조).
> Java 17의 강한 캡슐화 때문에 리플렉션 기반 라이브러리에서 `InaccessibleObjectException`이 나면
> 임시로 `--add-opens java.base/java.lang=ALL-UNNAMED`로 넘기되, **임시 조치임을 티켓으로 남긴다.**

### 목표 버전 결정 기준

| 상황 | 목표 |
|------|------|
| 레거시 유지보수 + 최소 변경 | Boot **3.5.x** (3.x 마지막 라인). 단 OSS 패치는 2026-06-30 종료 → 상용 확장 지원 여부 확인 |
| 계속 발전시킬 서비스 | Boot 3.5.x로 **먼저 안정화**한 뒤 별도 배포 사이클에서 4.x |
| 신규 재작성 | 이 스킬 대신 4.x 신규 셋업 |

> 3.x를 건너뛰고 4.x로 직행하면 Jakarta 전환 + Spring Framework 7 + Jackson 3 + Security 7 변경이 **한 배포에 겹친다.**
> 장애 원인 분리가 불가능해지므로 권장하지 않는다.

---

## 2. 전체 순서 — Phase 게이트 체크리스트

각 Phase는 **독립 배포 가능한 단위**로 끊는다. 한 번에 몰아서 하면 롤백 단위가 사라진다.

```
Phase 0  인벤토리·리스크 스캔            (코드 변경 없음)
   ↓  게이트: jakarta 미지원 의존성 목록과 대체안이 전부 확정됐는가?
Phase 1  SB 2.5 → 2.7.18 (Java 11 유지)  ★ 배포 1
   ↓  게이트: properties-migrator 경고 0, 기존 테스트 전부 GREEN
Phase 2  Java 11 → 17 (SB 2.7 유지)      ★ 배포 2
   ↓  게이트: 빌드·테스트·런타임 정상, 리플렉션 예외 없음
Phase 3  Security 5.8 선행 + 람다 DSL 전환 (SB 2.7 유지)  ★ 배포 3
   ↓  게이트: WebSecurityConfigurerAdapter 제거 완료, 인증/인가 회귀 테스트 GREEN
Phase 4  SB 3.x 업그레이드 + javax→jakarta 일괄 전환
Phase 5  교체 필수 라이브러리 전환 (Springfox·Sleuth·EhCache2·Redisson 등)
Phase 6  설정 프로퍼티 정리
Phase 7  패키징·배포 형상 전환 (WAR → Tomcat 10.1 또는 Jar)
   ↓  게이트: 스테이징에서 전 API 회귀 + 부하 테스트 통과
Phase 8  카나리 배포 → 전면 배포                    ★ 배포 4
Phase 9  임시 의존성 제거(properties-migrator 등)   ★ 배포 5
```

> Phase 4~7은 하나의 배포로 묶일 수밖에 없다(컴파일이 안 되므로 쪼갤 수 없음).
> **그래서 Phase 1~3에서 최대한 덜어내는 것이 이 마이그레이션의 핵심 전략이다.**

---

## 3. Phase 0 — 인벤토리·리스크 스캔

코드를 고치기 전에 "무엇이 막힐지"를 먼저 센다.

```bash
# 1) javax 사용량 — 작업량 추정 (JDK 소속 javax는 5.1 표로 걸러낸다)
grep -rn "import javax\." src/main/java | wc -l
grep -rho "import javax\.[a-zA-Z.]*" src/main/java | sort | uniq -c | sort -rn

# 2) 의존성 전체 목록 — jakarta 지원 여부를 라이브러리별로 확인
./gradlew dependencies --configuration runtimeClasspath > deps.txt

# 3) 컴파일된 서드파티 jar 내부의 javax 잔존 확인 (직접 import가 없어도 막힌다)
unzip -l some-legacy.jar | grep -i "javax/servlet"
```

### 리스크 등급표 (인벤토리 결과를 이 표로 분류)

| 등급 | 정의 | 대응 |
|------|------|------|
| A. 안전 | jakarta 지원 버전이 이미 존재 | 버전만 올림 |
| B. 교체 | 대체 라이브러리로 전환 필요 (Springfox, Sleuth, EhCache 2) | 6장 매트릭스 |
| C. 위험 | 유지보수 중단 + jakarta 미지원 (예: Naver Lucy XSS servlet filter) | **fork 재빌드 or 자체 구현.** 전체 일정을 좌우 |
| D. 사내 공용 | 사내 공통 jar가 `javax.servlet` 의존 | 소유 팀과 릴리즈 일정 합의 — 가장 흔한 지연 원인 |

> 주의: C·D 등급이 하나라도 미해결이면 Phase 4에 진입하지 않는다. 컴파일 단계에서 전진도 후퇴도 못 하는 상태가 된다.

---

## 4. Phase 1~3 — 사전 정지 작업 (Java 11 / SB 2.7에서 끝낸다)

### 4.1 Phase 1: 2.5 → 2.7.18

```groovy
plugins { id 'org.springframework.boot' version '2.7.18' }

dependencies {
    // 임시: 이름이 바뀌거나 제거된 프로퍼티를 시작 시 진단 + 런타임 임시 치환
    runtimeOnly 'org.springframework.boot:spring-boot-properties-migrator'
}
```

- 기동 로그의 프로퍼티 경고를 **0으로 만들 때까지** yml을 고친다.
- 이 모듈은 마이그레이션이 끝나면 **반드시 제거**한다(Phase 9). `@PropertySource`로 늦게 추가되는 프로퍼티는 감지하지 못한다.

### 4.2 Phase 2: Java 11 → 17

```groovy
java { toolchain { languageVersion = JavaLanguageVersion.of(17) } }
tasks.withType(JavaCompile) { options.compilerArgs << '-parameters' }  // ← Framework 6 권장
```

> `-parameters` 플래그: Spring Framework 6는 `-debug` 기반 파라미터명 추론(`LocalVariableTableParameterNameDiscoverer`)을
> 폐기했다. 지금 켜 두면 Phase 4에서 파라미터명 관련 바인딩 실패를 예방한다.

### 4.3 Phase 3: Spring Security 5.8 선행 (효과가 가장 큰 단계)

Spring Security 5.8에서 6.0 스타일로 **미리** 바꿔 두면, Phase 4에서 남는 작업은 import 치환뿐이다.

- `WebSecurityConfigurerAdapter` 상속 제거 → `SecurityFilterChain` **Bean** (5.7.0-M2에서 deprecated, **6.0에서 제거**)
- `configure(WebSecurity)` → `WebSecurityCustomizer` Bean
- `configure(AuthenticationManagerBuilder)` → `UserDetailsService` / `AuthenticationManager` Bean
- `antMatchers()` / `mvcMatchers()` / `regexMatchers()` → **`requestMatchers()`** (셋 다 6.0에서 제거)
- `authorizeRequests()` → `authorizeHttpRequests()` (7.0 제거 예정)
- `.and()` 체이닝 → **람다 DSL** (6.2부터 deprecated, 7.0 제거)

```java
// Before (SB 2.5 / Security 5.5)
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable()
            .authorizeRequests()
                .antMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated();
    }
}

// After (Security 5.8에서 미리 적용 → 6.0에서 무수정 통과)
@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated());
        return http.build();
    }
}
```

> 상세 코드: 출발지 `backend/spring-security-5-jwt-jjwt10`, 목적지 `backend/spring-security-6-jwt-jjwt12`.
> jjwt 0.10.x → 0.12.x는 API가 재작성되었으므로 **Phase 4의 별도 작업**으로 잡는다(5.8 단계에서는 건드리지 않는다).

#### Security 6에서 바뀌는 "동작" — 컴파일은 되는데 런타임에 터지는 것들

| 변경 | 증상 | 대응 |
|------|------|------|
| `SecurityContextHolderFilter`는 컨텍스트를 읽어 올 뿐 **자동 저장하지 않음**(명시적 save 필요) | 로그인은 되는데 다음 요청에서 익명 취급 | 커스텀 인증 필터에서 `SecurityContextRepository.saveContext()` 명시 호출 |
| `RequestCache`가 기본적으로 `continue` 파라미터가 있을 때만 조회 | 로그인 후 원래 요청 URL로 복귀하지 않음 | 필요 시 `HttpSessionRequestCache`의 matchingRequestParameterName 설정 |

---

## 5. Phase 4 — javax → jakarta 전면 전환 (작업량 1위)

### 5.1 바꿔야 하는 것 / 절대 바꾸면 안 되는 것

| 패키지 | 전환 | 비고 |
|--------|------|------|
| `javax.servlet.*` | → `jakarta.servlet.*` | 필터·리스너·`HttpServletRequest` 전부 |
| `javax.persistence.*` | → `jakarta.persistence.*` | JPA 엔티티 |
| `javax.validation.*` | → `jakarta.validation.*` | `@Valid`, `@NotNull` 등 |
| `javax.annotation.*` (`@PostConstruct`, `@PreDestroy`, `@Resource`) | → `jakarta.annotation.*` | |
| `javax.inject.*` | → `jakarta.inject.*` | |
| `javax.transaction.*` | → `jakarta.transaction.*` | |
| `javax.xml.bind.*` (JAXB) | → `jakarta.xml.bind.*` | |
| `javax.mail.*` | → `jakarta.mail.*` | |
| **`javax.sql.*`** | **그대로** | JDK 소속 (`DataSource` 등) |
| **`javax.crypto.*`** | **그대로** | JDK 소속 |
| **`javax.naming.*`** | **그대로** | JDK 소속 |
| **`javax.net.ssl.*`**, `javax.security.auth.*` | **그대로** | JDK 소속 |
| **`javax.management.*`**, `javax.imageio.*`, `javax.script.*` | **그대로** | JDK 소속 |

> 판별 규칙: **Jakarta EE 스펙이 소유한 패키지만 `jakarta.*`로 바뀐다. JDK가 소유한 `javax.*`는 그대로다.**
> `javax` 전체를 sed로 일괄 치환하면 JDK 클래스까지 깨진다. OpenRewrite·IDE 마이그레이션 도구는 이 구분을 지키지만,
> 수동 치환할 경우 반드시 패키지 단위로 한정한다.

### 5.2 소스 밖의 javax

코드만 고쳐도 끝나지 않는다. 아래를 함께 스캔한다.

- `web.xml`, `*.tld`, JSP (`<%@ page import="javax.servlet..." %>`)
- `logback.xml` / `logback-spring.xml`의 커스텀 필터 클래스명 문자열
- 리플렉션 문자열 (`Class.forName("javax.servlet...")`)
- `spring.factories` → Boot 3에서 자동설정 등록이 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 로 이동
- **사내 공통 jar 내부의 컴파일된 클래스** — 소스가 없으면 Tomcat Jakarta 마이그레이션 도구로 변환하거나 재빌드 요청(9장)

---

## 6. Phase 5 — 교체 필수 라이브러리 매트릭스

| 영역 | SB 2.5 | SB 3.x | 이유 | 참조 스킬 |
|------|--------|--------|------|-----------|
| API 문서 | Springfox 2.9.x | **springdoc-openapi 2.x** | Springfox는 SB 3 미지원(사실상 EOL) | `backend/swagger-springfox-2` → `backend/springdoc-openapi-3` |
| 분산 추적 | Spring Cloud Sleuth 3.x | **Micrometer Tracing** | Sleuth는 Spring Cloud 2022.0 릴리즈 트레인에서 제외, 코어가 Micrometer Tracing으로 이관 | `backend/logback-mdc-tracing` |
| 로컬 캐시 | EhCache 2.x | **EhCache 3(jakarta classifier) 또는 JCache** | Spring Framework 6에서 EhCache 2.x 지원 제거 | `backend/ehcache-2-legacy` |
| 분산 락·캐시 | Redisson 2.15.x | **Redisson 3.18.1+** | 3.18.1부터 Spring Data Redis 3.x 의존 → SB 3 전용 | `backend/redis-redisson-legacy` → `backend/redis-redisson-modern` |
| JWT | jjwt 0.10.x | **jjwt 0.12.x** | API 재작성 | `backend/spring-security-6-jwt-jjwt12` |
| AWS SDK | v1 (1.12.x) | **v2** (권장) | v1은 유지보수 종료 흐름 | `backend/aws-sdk-v1-s3-rekognition` → `backend/aws-sdk-v2-s3-rekognition` |
| 시간 타입 | Joda-Time | **java.time** | Framework 6에서 Joda-Time 지원 제거 | `backend/jackson-time-migration` |
| 암호화 | bouncycastle `jdk15on` | `jdk18on` | JDK 대응 아티팩트 | `backend/bouncycastle-crypto` |
| XSS 필터 | Naver Lucy XSS **servlet filter** | **직접 대응 필요** | `javax.servlet` 기반 + 레포 아카이브 → jakarta 미지원 | `backend/xss-lucy-jsoup` |
| 설정 암호화 | jasypt-spring-boot | SB 3 호환 버전 확인 필요 | | `backend/jasypt-encrypted-config` |

> 주의(C등급 리스크): Naver `lucy-xss-servlet-filter`는 `javax.servlet` 기반이고 GitHub 레포가 아카이브(read-only)되었다.
> SB 3에서는 ① jakarta 네임스페이스로 fork 재빌드, ② 필터를 자체 구현하고 본문 sanitize는 jsoup Safelist로 대체,
> ③ 파라미터 이스케이프를 프레임워크 레벨(ControllerAdvice·컨버터)로 이동 — 셋 중 하나를 **Phase 0에서 결정**한다.

### 6.1 Sleuth → Micrometer Tracing 매핑 (가장 실수 잦은 구간)

| 항목 | Sleuth (SB 2.x) | Micrometer Tracing (SB 3.x) |
|------|-----------------|------------------------------|
| 의존성 | `spring-cloud-starter-sleuth`, `spring-cloud-sleuth-zipkin` | `io.micrometer:micrometer-tracing-bridge-brave` + `io.zipkin.reporter2:zipkin-reporter-brave` (또는 `-otel` 브리지) |
| 패키지 | `org.springframework.cloud.sleuth` | `io.micrometer.tracing` |
| 자동설정 위치 | Sleuth | **Spring Boot 본체**로 이관 |
| 전파 포맷 기본값 | B3 | **W3C Trace Context**, traceId 128bit |
| 비동기 컨텍스트 전파 | `LazyTraceExecutor` | `ContextExecutorService.wrap()` / `ContextScheduledExecutorService.wrap()` / `ContextSnapshot.wrap()` |
| 테스트에서 Tracer 주입 | Sleuth 테스트 설정 | `@AutoConfigureObservability` |
| 로그 패턴 | Sleuth가 자동 주입 | `logging.pattern.level`에 `%X{traceId:-}`, `%X{spanId:-}` **직접 지정** |

> 주의: 마이그레이션 기간 동안 **SB 2 서비스(B3)와 SB 3 서비스(W3C)가 공존**하면 traceId가 끊긴다.
> SB 2 쪽에 `spring.sleuth.propagation.type=w3c,b3`, `spring.sleuth.traceId128=true`, `spring.sleuth.supportsJoin=false`를
> **먼저 배포**해 두면 두 포맷을 함께 발행해 추적이 이어진다. (이 설정은 Phase 1에 넣는 것이 이상적이다.)

---

## 7. Phase 6 — 설정 프로퍼티 변경

`spring-boot-properties-migrator`가 대부분 잡아주지만, **런타임 임시 치환일 뿐 영구 수정이 아니다.** 반드시 yml을 고친다.

| 구분 | 2.5 | 3.x |
|------|-----|-----|
| Redis | `spring.redis.*` | `spring.data.redis.*` |
| 메트릭 익스포트 | `management.metrics.export.<product>.*` | `management.<product>.metrics.export.*` (예: `management.prometheus.metrics.export.*`) |
| HTTP 서버 메트릭 이름 | `management.metrics.web.server.request.metric-name` | `management.observations.http.server.requests.name` |
| Zipkin 엔드포인트 | `spring.zipkin.base-url` | `management.zipkin.tracing.endpoint` |
| 샘플링 | `spring.sleuth.sampler.probability` | `management.tracing.sampling.probability` |
| 자동설정 등록 | `META-INF/spring.factories` | `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` |
| 로깅 설정 파일 | `logback.xml` | `logback-spring.xml` 권장(Boot 확장 태그 사용 시 필수) |

### 코드·동작 레벨 비호환 (프로퍼티가 아니라 migrator가 못 잡음)

| 변경 | 영향 |
|------|------|
| **트레일링 슬래시 매칭 기본값 `false`** (Framework 6) | `/api/users/` 로 호출하던 클라이언트가 **404**. 레거시 클라이언트가 있으면 게이트웨이 리라이트 또는 명시 매핑 필요 |
| `@Async` 메서드 반환 타입은 `void` / `Future` 계열만 허용 | 그 외 반환 타입은 예외 발생 |
| 인터페이스 기반 프록시 컨트롤러 미지원 | 클래스에 `@Controller` 직접 부착 필요 |
| `@ConstructorBinding` 타입 레벨 불필요 | 단일 파라미터 생성자면 자동 인식 (부착 위치 제약이 바뀜) |
| 이미지 배너(`banner.gif/png`) 지원 제거 | `banner.txt`만 |
| 로그 날짜 포맷이 ISO-8601로 변경 | **로그 파싱 파이프라인(ELK 등) 정규식이 깨진다** — 인프라 팀과 사전 공유 |
| Java `SecurityManager`, `CommonsMultipartResolver` 지원 제거 | 파일 업로드는 표준 서블릿 멀티파트 방식으로 |

---

## 8. DB·커넥션 풀·MyBatis 호환 확인 지점

Boot 3는 DB 계층 자체를 바꾸지 않지만, **버전 매트릭스가 어긋나면 기동조차 안 된다.**

| 항목 | 확인 지점 |
|------|-----------|
| **MyBatis** | `mybatis-spring-boot-starter` **2.3.x(SB 2.7 / Java 8+) → 3.0.x(MyBatis-Spring 3.0 / Java 17+)**. 공식 매트릭스상 3.0.x는 SB 3.2~3.5 대응이므로, SB 3.0/3.1을 목표로 한다면 초기 3.0.x 패치와의 조합을 릴리즈 노트에서 확인 |
| **MySQL 드라이버** | 좌표 변경: `mysql:mysql-connector-java` → **`com.mysql:mysql-connector-j`** (구 좌표를 두면 Boot의 관리 버전이 적용되지 않는다) |
| **Oracle 드라이버** | Java 17에서는 **`ojdbc11`** 사용(JDK 11 컴파일·JDBC 4.3). `ojdbc8`은 JDK 17에서 JDBC 4.2 API로 기능이 제한됨 |
| **HikariCP** | Boot 3.x가 관리 버전을 올린다(3.5.3부터 HikariCP 6.3.0). 풀 파라미터·버전을 **직접 고정(hard pin)** 해 두었다면 충돌 확인 → `backend/hikaricp-tuning-oracle-mysql` |
| **멀티 DataSource** | `SqlSessionFactory` / `TransactionManager` 수동 구성 코드는 jakarta 전환만 하면 대부분 유지 → `backend/spring-multi-datasource-oracle-mysql` |
| **JPA 사용 시** | Hibernate 5.x → **6.1+**. 암묵적 네이밍 전략·타입 매핑 변경으로 **DDL과 쿼리 결과가 달라질 수 있음**. MyBatis 전용 프로젝트면 해당 없음 |
| **MyBatis XML** | 매퍼 XML 자체는 영향 없음. 단 `TypeHandler`가 `javax.*` 타입을 다루면 전환 대상 → `backend/mybatis-mapper-patterns` |

> 주의: MyBatis는 SQL이 그대로라 "안전"해 보이지만 사고는 **커넥션 풀·드라이버 버전 조합**에서 난다.
> Phase 4 이후 스테이징에서 **장시간(최소 수 시간) 커넥션 유지 테스트**를 수행해 idle 커넥션 회수 동작을 확인한다.

---

## 9. Phase 7 — WAR / Tomcat 9 → Tomcat 10.1

### 핵심 사실

- Boot 3는 **Servlet 6.0** 기준이며 번들 Tomcat은 **10.1**이다.
- **Tomcat 9에는 Boot 3 WAR를 배포할 수 없다.** Tomcat 9는 `javax.servlet`, Tomcat 10+는 `jakarta.servlet`이다.
- Tomcat 10 이상은 `javax` 기반 레거시 앱을 legacy appBase(`webapps-javaee`)에 두면 배포 시점에 자동 변환해 준다. 이는 **레거시 WAR를 임시로 돌리기 위한 기능**이며 Boot 3 앱에는 해당하지 않는다.

### 선택지

| 방식 | 언제 | 주의 |
|------|------|------|
| **Jar 전환 (권장)** | 컨테이너 운영 자유도가 있을 때 | 배포 스크립트·헬스체크·포트 정책 변경 필요 |
| WAR 유지 + Tomcat 10.1 | 외장 WAS 정책이 강제될 때 | `SpringBootServletInitializer` 상속 유지, `spring-boot-starter-tomcat`은 `providedRuntime` |
| Apache Tomcat Jakarta EE Migration Tool | **소스 없는 사내 공통 jar/war**를 변환해야 할 때 | 클래스·문자열 상수·설정 파일·JSP·TLD의 패키지명을 변환. **임시 방편** — 소유 팀 재빌드가 정답 |

```bash
# 소스 없는 레거시 아티팩트 변환 (apache/tomcat-jakartaee-migration)
java -jar jakartaee-migration-*-shaded.jar legacy-common.jar legacy-common-jakarta.jar
```

> 빌드·패키징 스크립트 전문은 `backend/spring-boot-gradle-setup` 2~3장 참조. 이 문서에서 중복 서술하지 않는다.

---

## 10. OpenRewrite — 어디까지 자동이고 무엇이 사람 몫인가

```bash
# Maven
mvn -U org.openrewrite.maven:rewrite-maven-plugin:run \
  -Drewrite.activeRecipes=org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_0
```

```groovy
// Gradle
plugins { id 'org.openrewrite.rewrite' version 'latest.release' }
rewrite { activeRecipe('org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_0') }
dependencies { rewrite('org.openrewrite.recipe:rewrite-spring:latest.release') }
// 실행: ./gradlew rewriteRun
```

### 자동화 경계표

| 구분 | 도구가 해주는 것 | 사람이 해야 하는 것 |
|------|------------------|---------------------|
| 빌드 파일 | 부모·플러그인·의존성 버전 상향, Java 17 설정 | 사내 저장소에 jakarta 버전이 올라와 있는지, 라이선스·보안 정책 통과 여부 |
| 네임스페이스 | `javax.*` → `jakarta.*` 치환 (JDK 소속 javax는 건드리지 않음) | JSP·TLD·`web.xml`·리플렉션 문자열, 컴파일된 서드파티 jar |
| 프로퍼티 | 이름이 바뀐 프로퍼티 자동 치환 | 조직 표준 설정·프로파일별 값의 의미 변화 검토 |
| 어노테이션·리소스 | `@ConstructorBinding`·`@EnableBatchProcessing` 정리, `logback.xml` → `logback-spring.xml` | 커스텀 자동설정의 `spring.factories` → `AutoConfiguration.imports` 이전 검토 |
| Security | 일부 구성 API 치환 | **동작 변경**(SecurityContext 명시 저장, RequestCache) — 자동화 불가 |
| 3rd-party 교체 | 일부 레시피 존재(Sleuth → Micrometer Tracing 등) | Springfox→Springdoc 어노테이션 의미 매핑, EhCache 2→3 캐시 정책 재설계, Lucy XSS 대체 |
| 검증 | 없음 | **회귀 테스트·부하 테스트·로그 파이프라인 확인** |

> 주의: OpenRewrite 결과물은 **리뷰 대상 PR**이지 최종 산출물이 아니다.
> "컴파일이 통과했다"는 것은 치환이 끝났다는 뜻일 뿐 **런타임 동작 동일성은 전혀 보장하지 않는다.**
> 자동 변환 커밋과 수동 수정 커밋은 반드시 분리해 diff를 검토 가능하게 남긴다.

---

## 11. 롤백 판단 기준

### 사전 준비 (Phase 4 진입 전에 갖춘다)

- 이전 아티팩트(2.7 / Java 11 빌드)를 **재빌드 없이 즉시 배포 가능**한 상태로 보관
- 트래픽을 나눌 수 있는 배포 방식(카나리·블루그린) 확보 — 불가하면 저트래픽 시간대 + 즉시 롤백 절차 문서화
- 롤백 리허설 1회 수행 (문서만 있고 해본 적 없으면 없는 것과 같다)

### 즉시 롤백 (판단 유예 없음)

| 신호 |
|------|
| 애플리케이션 기동 실패 / 헬스체크 미통과 |
| 인증·인가 회귀 — 세션 유실, 권한 검사 우회 가능성 (Security 6 명시 저장 이슈의 전형) |
| 5xx 비율이 기준선 대비 유의미하게 상승 |
| DB 커넥션 고갈·풀 대기 급증 |
| 데이터 정합성 이상(중복 처리·누락) 발견 |

### 관찰 후 판단 (즉시 롤백 아님)

| 신호 | 조치 |
|------|------|
| traceId 단절 (B3/W3C 혼재) | 관측성 문제 — 전파 포맷 설정으로 대응 |
| 로그 파싱 실패 (ISO-8601 포맷 변경) | 로그 파이프라인 정규식 수정 |
| Swagger UI 문서 누락·형식 변화 | 문서 이슈 — 별도 수정 배포 |
| 특정 API의 트레일링 슬래시 404 | 게이트웨이 리라이트로 임시 완화 후 정리 |

### 롤백 불가 지점 (넘기 전에 승인 필요)

- **DB 스키마 변경을 동반한 배포**(JPA 사용 시 Hibernate 6 자동 DDL 포함) — 마이그레이션 배포에 스키마 변경을 **섞지 않는다**
- 외부 시스템과의 프로토콜·헤더 포맷 전환을 동시에 진행한 경우
- 메시지 큐 페이로드 스키마 변경

> 원칙: **프레임워크 업그레이드 배포에는 기능 변경·스키마 변경을 함께 넣지 않는다.**
> 섞는 순간 롤백 결정은 기술 판단이 아니라 협상이 된다.

---

## 12. 흔한 실수

| 실수 | 증상 | 해결 |
|------|------|------|
| 2.5 → 3.x 직행 | 원인 불명 오류가 한꺼번에 발생, 분리 불가 | 2.7.18 경유 (Phase 1) |
| `javax` 전체 sed 치환 | `javax.sql.DataSource` 등 JDK 클래스까지 깨짐 | 5.1 표의 "그대로" 목록 확인, OpenRewrite·IDE 사용 |
| Security 전환을 Phase 4에 몰아넣음 | 컴파일 에러와 인증 회귀가 동시에 터짐 | 5.8 단계에서 선행 (Phase 3) |
| `WebSecurityConfigurerAdapter`만 지우고 동작 검증 생략 | 로그인 후 다음 요청이 익명 처리 | SecurityContext 명시적 저장 확인 |
| properties-migrator를 제거하지 않고 운영 배포 | 경고 누적 + 잘못된 프로퍼티가 계속 동작하는 착시 | Phase 9에서 제거 후 재검증 |
| Tomcat 9에 Boot 3 WAR 배포 | `jakarta.servlet.*` 관련 기동 실패 | Tomcat 10.1+ 또는 Jar 전환 |
| Springfox 버전만 올려 해결 시도 | SB 3에서 기동 실패 | Springdoc 2.x로 **교체** |
| Sleuth 의존성만 제거 | 추적 전면 유실 | Micrometer Tracing 브리지 + 리포터 추가, 로그 패턴 재설정 |
| 사내 공용 jar를 Phase 0에서 확인 안 함 | 막바지에 발견 → 일정 전면 지연 | 인벤토리 D등급으로 사전 관리 |
| 마이그레이션 배포에 신규 기능 동봉 | 장애 시 원인 분리 불가·롤백 협상 | 배포 분리 |

---

## 13. 완료 체크리스트

- [ ] Java 17+ 툴체인, `-parameters` 컴파일 옵션 적용
- [ ] 2.7.18 경유 후 properties-migrator 경고 0 → **최종적으로 의존성 제거**
- [ ] `grep -rn "import javax\." src/` 결과가 JDK 소속 패키지만 남음
- [ ] JSP·TLD·`web.xml`·리플렉션 문자열 스캔 완료
- [ ] `WebSecurityConfigurerAdapter` 0건, `antMatchers`/`mvcMatchers`/`regexMatchers` 0건, 람다 DSL 전환
- [ ] 인증 세션 유지·권한 거부(403)·토큰 만료 회귀 테스트 GREEN
- [ ] Springfox 제거 + Springdoc 문서 정상 노출
- [ ] Sleuth 제거 + traceId/spanId가 로그·수집기에 정상 표시, 서비스 간 추적 연결 확인
- [ ] MyBatis starter / MySQL(`mysql-connector-j`) / Oracle(`ojdbc11`) / HikariCP 버전 매트릭스 확정
- [ ] 장시간 커넥션 유지 테스트 통과
- [ ] 패키징 형상(Jar 또는 WAR + Tomcat 10.1) 배포 검증
- [ ] 로그 파싱 파이프라인·모니터링 대시보드 정상
- [ ] 롤백 아티팩트 보관 + 롤백 리허설 완료
- [ ] `.claude/rules/java.md` "Spring Boot 3 전환 시" 항목과 결과물 일치 확인
