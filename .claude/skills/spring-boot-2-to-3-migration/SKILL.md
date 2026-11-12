---
name: spring-boot-2-to-3-migration
description: Spring Boot 2.5(Java 11) → 3.x 마이그레이션에서 모델이 틀리기 쉬운 지점 — 2.7.18 경유·Phase 분리, Boot 2.7 에서 Security 5.8 선행 시 관리 버전 오버라이드 함정, Security 6 런타임 동작 변경, 바꾸면 안 되는 JDK javax, 교체 필수 라이브러리(Lucy XSS C등급), Sleuth B3/W3C 공존, migrator 가 못 잡는 비호환, MyBatis·드라이버·HikariCP 버전 매트릭스, Tomcat 10.1, 4.x 이행 체크포인트
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
> - https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide (§1.1 4.0 이행 체크포인트 근거)
>
> 검증일: 2026-11-09 (최초 2026-08-11)

---

## 이 스킬의 범위

2.5 → 3.x 경로에서 **모델이 틀리기 쉬운 순서·버전·동작 변경**만 담는다. jakarta 전환·SecurityFilterChain 작성법·OpenRewrite 실행법 같은 기본 사용법은 공식 문서 수준이라 싣지 않는다.
각 목적지 기술의 사용법은 짝 스킬로 연결한다: 빌드 `spring-boot-gradle-setup`, 인증 `spring-security-5-jwt-jjwt10` → `spring-security-6-jwt-jjwt12`, 캐시·락 `ehcache-2-legacy`·`redis-redisson-legacy` → `redis-redisson-4`, 시간 `jackson-time-migration`, 커넥션 풀 `hikaricp-tuning-oracle-mysql`, 멀티 DataSource `spring-multi-datasource-oracle-mysql`, MyBatis `mybatis-mapper-patterns`. (모던 쪽 스킬은 프로젝트에서 켠 묶음에 따라 없을 수 있다.)

> 주의: 2026-08 기준 Spring Boot 3.5 라인의 OSS 지원은 2026-06-30 종료되었고 현행 OSS 라인은 4.x다.
> 그럼에도 2.x → 4.x **직행은 권장되지 않는다**. 공식 업그레이드 정책은 "현재 라인의 최신 마이너 → 다음 메이저"이므로
> 2.5 → 2.7.18 → **3.x** → (필요 시) 4.x 순서를 밟는다. "3.5에 머물지 4.x로 갈지"의 판단 기준은 1.1절 참조.
> 3.x → 4.x 세부 절차 중 **Gradle 빌드 설정 관점**(Gradle 최소 버전·플러그인 좌표·Jackson 3 group id·Starter 이름 변경 등)은
> `backend/spring-boot-gradle-setup` 9장(`references/REFERENCE.md` §9, 2026-09-28 확인 시점 기준 §9.1~9.7)에 있다.
> 다만 Jackson 3·Security 7·Framework 7의 **API 레벨 전환**(클래스명·애노테이션·설정 코드 변경)은 그 스킬의 범위 밖이라
> 여전히 별도 스킬·문서가 필요하다(2026-09-28 확인 시점 기준 레포에 아직 없음).

---

## 1. 사전 조건

| 조건 | 값 |
|------|-----|
| **Java** | **17 이상 필수** (21 LTS 권장). Boot 3.0 은 Java 8/11 미지원 |
| Jakarta EE | 9+ (Boot 3.0은 EE 10 / Servlet 6.0) |
| 출발 Boot 버전 | **2.7.x 최신 패치(2.7.18)** |
| Gradle | 7.6.4+ 또는 8.4+ (Boot 3.4/3.5 기준) |
| Maven | 3.6.3 이상 |
| 서블릿 컨테이너(WAR) | **Tomcat 10.1+** (Servlet 6.0) |

> 주의: Java 17 전환 자체가 별도의 리스크다. Lombok·MapStruct·ByteBuddy·Mockito·JaCoCo 등 **바이트코드를 다루는 도구**는
> Java 17 지원 버전으로 먼저 올려야 한다.
> Java 17의 강한 캡슐화 때문에 리플렉션 기반 라이브러리에서 `InaccessibleObjectException`이 나면
> 임시로 `--add-opens java.base/java.lang=ALL-UNNAMED`로 넘기되, **임시 조치임을 티켓으로 남긴다.**

목표 버전: 레거시 유지보수·최소 변경 = Boot **3.5.x**(3.x 마지막 라인, OSS 패치 2026-06-30 종료 → 상용 확장 지원 확인). 계속 발전시킬 서비스 = 3.5.x 안정화 후 **별도 배포 사이클**에서 4.x. 3.x를 건너뛰면 Jakarta + Framework 7 + Jackson 3 + Security 7 변경이 한 배포에 겹친다.

### 1.1 4.0 이행 체크포인트 — "3.5에서 멈출지 4.x까지 갈지"

| 조건 | 4.x로 전환 가능 | 3.5.x에 머문다 |
|------|----------------|----------------|
| 사전 조건 | **"최신 3.5.x로 먼저 업그레이드"** 후 deprecated 호출 정리 완료 | 아직 3.5.x 최신 패치에 못 미침 |
| Java | 17 이상(21 LTS 이상 권장) | Java 17 미만 |
| 서블릿 컨테이너 | Jakarta EE 11 / Servlet 6.1 대응 가능 | **Undertow 사용** — Boot 4에서 지원 제거 |
| JSON 라이브러리 | Jackson 3(`tools.jackson.*`) 전환 준비, 또는 과도기 `spring-boot-jackson2` 모듈로 유예 | **Jersey 사용** — Jackson 3 미지원 |
| 배치 | 해당 없음 또는 이관 완료 | Spring Batch가 **DB 메타데이터 저장소**에 의존 |

> 주의: Jackson 2→3은 그룹ID(`com.fasterxml.jackson` → `tools.jackson`)·클래스명(예: `Jackson2ObjectMapperBuilderCustomizer` → `JsonMapperBuilderCustomizer`)·애노테이션(`@JsonComponent` → `@JacksonComponent`)이 바뀌는 **별도의 큰 마이그레이션**이다. Boot 4는 과도기용 `spring-boot-jackson2` 모듈(사용 중단 예정)을 제공한다. 그룹ID 변경과 관련 Starter 이름 변경(`spring-boot-starter-web`→`-webmvc` 등)은 `backend/spring-boot-gradle-setup` §9.4·§9.7(build.gradle 좌표 관점)에서 다룬다. 이 스킬의 범위는 2.5→3.x까지이며, 4.x 전환이 확정된 뒤의 Jackson 3·Security 7·Framework 7 **API 레벨** 세부 절차(클래스명·애노테이션·설정 코드 변경)는 이 문서에서 다루지 않는다 — 별도 스킬·문서 신설 필요(2026-09-28 확인 시점 기준 레포에 아직 없음).

---

## 2. Phase 게이트 — 핵심은 "3.x 배포 전에 덜어내기"

```
Phase 0  인벤토리·리스크 스캔 (jakarta 미지원 의존성·사내 공용 jar 대체안 확정)
Phase 1  SB 2.5 → 2.7.18 (Java 11 유지)   ★ 배포 1 — properties-migrator 경고 0
Phase 2  Java 11 → 17 (SB 2.7 유지)       ★ 배포 2 — -parameters 컴파일 옵션도 이때
Phase 3  Security 5.8 스타일 선행 전환 (SB 2.7 유지) ★ 배포 3
Phase 4~7 SB 3.x + jakarta + 교체 라이브러리 + 프로퍼티 + 패키징 (컴파일 때문에 쪼갤 수 없음)
Phase 8  카나리 → 전면 배포                 ★ 배포 4
Phase 9  properties-migrator 등 임시 의존성 제거 ★ 배포 5
```

- `spring-boot-properties-migrator`는 **런타임 임시 치환일 뿐 영구 수정이 아니다** — yml을 고치고 Phase 9에서 반드시 제거. `@PropertySource`로 늦게 추가되는 프로퍼티는 감지 못 한다.
- `-parameters`: Framework 6는 `-debug` 기반 파라미터명 추론(`LocalVariableTableParameterNameDiscoverer`)을 폐기했다. Phase 2에서 켜 두면 바인딩 실패를 예방한다.
- 리스크 등급 **C(유지보수 중단 + jakarta 미지원, 예: Lucy XSS servlet filter)·D(사내 공통 jar가 `javax.servlet` 의존)** 가 하나라도 미해결이면 Phase 4에 진입하지 않는다. D가 가장 흔한 지연 원인이다. 서드파티 jar 내부 javax는 `unzip -l x.jar | grep javax/servlet` 로 확인.
- 프레임워크 업그레이드 배포에는 **기능 변경·DB 스키마 변경을 섞지 않는다**(JPA 사용 시 Hibernate 6 자동 DDL 포함) — 섞으면 롤백 불가 지점이 생긴다.

---

## 3. Phase 3 — Security 5.8 선행 (가장 효과 큰 단계)

> 주의(실행 검증, 2026-09-29): Boot 2.7.x가 관리하는 Spring Security 버전은 **2.7.18 기준 5.7.11**까지이며, 5.8에서
> 추가된 `requestMatchers(String...)` 오버로드가 없어 컴파일이 안 된다(`RequestMatcher...`만 받는 구버전 시그니처와 충돌).
> Boot 2.7 라인에 머문 채 Security 5.8 스타일로 먼저 전환하려면 `ext['spring-security.version'] = '5.8.x'`(Gradle)
> 또는 동일한 Maven `<properties>` 오버라이드로 **관리 버전을 수동 상향**해야 한다. 5.8.x는 Spring Framework 5.3.22+를
> 요구하는데 2.7.18이 관리하는 Framework 버전이 이를 충족하므로 오버라이드만으로 별다른 부작용 없이 동작한다(작은 샘플
> 프로젝트로 확인).
> `.and()`/`authorizeRequests()` 자체는 5.7.11에도 이미 있어 컴파일되지만, `requestMatchers()`를 쓰려면 위 오버라이드가 필수다.

제거·폐기 시점(혼동 주의):
- `WebSecurityConfigurerAdapter` — 5.7.0-M2 deprecated, **6.0 제거**
- `antMatchers()` / `mvcMatchers()` / `regexMatchers()` — **6.0 제거** → `requestMatchers()`
- `authorizeRequests()` → `authorizeHttpRequests()` (7.0 제거 예정)
- `.and()` 체이닝 — 6.2 deprecated, 7.0 제거 → 람다 DSL
- jjwt 0.10.x → 0.12.x는 API 재작성이므로 5.8 단계에서 건드리지 말고 Phase 4 별도 작업으로.

### Security 6 런타임 동작 변경 — 컴파일은 되는데 터지는 것

| 변경 | 증상 | 대응 |
|------|------|------|
| `SecurityContextHolderFilter`는 컨텍스트를 읽어 올 뿐 **자동 저장하지 않음** | 로그인은 되는데 다음 요청에서 익명 취급 | 커스텀 인증 필터에서 `SecurityContextRepository.saveContext()` 명시 호출 |
| `RequestCache`가 기본적으로 `continue` 파라미터가 있을 때만 조회 | 로그인 후 원래 URL로 복귀 안 함 | `HttpSessionRequestCache`의 matchingRequestParameterName 설정 |

OpenRewrite는 이 동작 변경을 자동화하지 못한다.

---

## 4. Phase 4 — javax → jakarta: 바꾸면 안 되는 것

Jakarta EE 스펙 소유 패키지(`servlet`·`persistence`·`validation`·`annotation`·`inject`·`transaction`·`xml.bind`·`mail`)만 `jakarta.*`로 바뀐다. **JDK 소유 javax는 그대로다**:

`javax.sql.*`(DataSource) · `javax.crypto.*` · `javax.naming.*` · `javax.net.ssl.*` · `javax.security.auth.*` · `javax.management.*` · `javax.imageio.*` · `javax.script.*`

> `javax` 전체를 sed로 일괄 치환하면 JDK 클래스까지 깨진다. 수동 치환은 패키지 단위로 한정한다.

소스 밖 javax도 스캔: `web.xml`·`*.tld`·JSP import, `logback(-spring).xml`의 커스텀 클래스명, `Class.forName("javax.servlet...")` 문자열, `spring.factories`(Boot 3에서 자동설정 등록은 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`로 이동), **컴파일된 사내 공통 jar**.

---

## 5. Phase 5 — 교체 필수 라이브러리

| 영역 | SB 2.5 | SB 3.x | 이유 |
|------|--------|--------|------|
| API 문서 | Springfox 2.9.x | **springdoc-openapi 2.x** | Springfox는 SB 3 미지원 — 버전 올리기로 해결 불가, **교체** |
| 분산 추적 | Spring Cloud Sleuth 3.x | **Micrometer Tracing** | Sleuth는 Spring Cloud 2022.0에서 제외 |
| 로컬 캐시 | EhCache 2.x | **EhCache 3(jakarta classifier) 또는 JCache** | Framework 6에서 EhCache 2.x 지원 제거 |
| 분산 락·캐시 | Redisson 2.15.x | **Redisson 3.18.1+** | 3.18.1부터 Spring Data Redis 3.x 의존 → SB 3 전용 |
| JWT | jjwt 0.10.x | **jjwt 0.12.x** | API 재작성 |
| AWS SDK | v1 (1.12.x) | **v2** (권장) | v1은 유지보수 종료 흐름 (`aws-sdk-v1-s3-rekognition`) |
| 시간 타입 | Joda-Time | **java.time** | Framework 6에서 Joda-Time 지원 제거 |
| 암호화 | bouncycastle `jdk15on` | `jdk18on` | (`bouncycastle-crypto`) |
| XSS 필터 | Naver Lucy XSS **servlet filter** | **직접 대응 필요** | `javax.servlet` 기반 + 레포 아카이브 |
| 설정 암호화 | jasypt-spring-boot | SB 3 호환 버전 확인 필요 | (`jasypt-encrypted-config`) |

> 주의(C등급 리스크): Naver `lucy-xss-servlet-filter`는 `javax.servlet` 기반이고 GitHub 레포가 아카이브(read-only)되었다.
> SB 3에서는 ① jakarta 네임스페이스로 fork 재빌드, ② 필터를 자체 구현하고 본문 sanitize는 jsoup Safelist로 대체,
> ③ 파라미터 이스케이프를 프레임워크 레벨(ControllerAdvice·컨버터)로 이동 — 셋 중 하나를 **Phase 0에서 결정**한다.

### Sleuth → Micrometer Tracing 함정

| 항목 | Sleuth (SB 2.x) | Micrometer Tracing (SB 3.x) |
|------|-----------------|------------------------------|
| 의존성 | `spring-cloud-starter-sleuth`, `spring-cloud-sleuth-zipkin` | `io.micrometer:micrometer-tracing-bridge-brave` + `io.zipkin.reporter2:zipkin-reporter-brave` (또는 `-otel` 브리지) |
| 전파 포맷 기본값 | B3 | **W3C Trace Context**, traceId 128bit |
| 비동기 전파 | `LazyTraceExecutor` | `ContextExecutorService.wrap()` / `ContextScheduledExecutorService.wrap()` / `ContextSnapshot.wrap()` |
| 테스트 Tracer 주입 | Sleuth 테스트 설정 | `@AutoConfigureObservability` |
| 로그 패턴 | 자동 주입 | `logging.pattern.level`에 `%X{traceId:-}`, `%X{spanId:-}` **직접 지정** |

> 주의: 마이그레이션 기간 동안 **SB 2 서비스(B3)와 SB 3 서비스(W3C)가 공존**하면 traceId가 끊긴다.
> SB 2 쪽에 `spring.sleuth.propagation.type=w3c,b3`, `spring.sleuth.traceId128=true`, `spring.sleuth.supportsJoin=false`를
> **먼저 배포**해 두면 두 포맷을 함께 발행해 추적이 이어진다. (이 설정은 Phase 1에 넣는 것이 이상적이다.)

Sleuth 의존성만 제거하면 추적이 전면 유실된다 — 브리지 + 리포터 추가와 로그 패턴 재설정이 같이 가야 한다.

---

## 6. Phase 6 — 프로퍼티·동작 변경

| 구분 | 2.5 | 3.x |
|------|-----|-----|
| Redis | `spring.redis.*` | `spring.data.redis.*` |
| 메트릭 익스포트 | `management.metrics.export.<product>.*` | `management.<product>.metrics.export.*` |
| HTTP 서버 메트릭 이름 | `management.metrics.web.server.request.metric-name` | `management.observations.http.server.requests.name` |
| Zipkin 엔드포인트 | `spring.zipkin.base-url` | `management.zipkin.tracing.endpoint` |
| 샘플링 | `spring.sleuth.sampler.probability` | `management.tracing.sampling.probability` |

### migrator가 못 잡는 코드·동작 비호환

| 변경 | 영향 |
|------|------|
| **트레일링 슬래시 매칭 기본값 `false`** (Framework 6) | `/api/users/` 호출 클라이언트가 **404** → 게이트웨이 리라이트 또는 명시 매핑 |
| `@Async` 반환 타입은 `void` / `Future` 계열만 | 그 외는 예외 |
| 인터페이스 기반 프록시 컨트롤러 미지원 | 클래스에 `@Controller` 직접 부착 |
| `@ConstructorBinding` 타입 레벨 불필요 | 단일 생성자면 자동 인식 |
| 이미지 배너 지원 제거 | `banner.txt`만 |
| 로그 날짜 포맷이 ISO-8601로 변경 | **ELK 등 로그 파싱 정규식이 깨진다** — 인프라 팀과 사전 공유 |
| `SecurityManager`, `CommonsMultipartResolver` 지원 제거 | 표준 서블릿 멀티파트로 |

---

## 7. DB·커넥션 풀·MyBatis 버전 매트릭스

| 항목 | 확인 지점 |
|------|-----------|
| **MyBatis** | `mybatis-spring-boot-starter` **2.3.x(SB 2.7 / Java 8+) → 3.0.x(MyBatis-Spring 3.0 / Java 17+)**. 공식 매트릭스상 3.0.x는 SB 3.2~3.5 대응이므로, SB 3.0/3.1을 목표로 한다면 초기 3.0.x 패치와의 조합을 릴리즈 노트에서 확인 |
| **MySQL 드라이버** | 좌표 변경: `mysql:mysql-connector-java` → **`com.mysql:mysql-connector-j`** (구 좌표를 두면 Boot 관리 버전이 적용되지 않는다) |
| **Oracle 드라이버** | Java 17에서는 **`ojdbc11`**. `ojdbc8`은 JDK 17에서 JDBC 4.2 API로 기능이 제한됨 |
| **HikariCP** | Boot 3.x가 관리 버전을 올린다(3.4.x = HikariCP 5.1.0, **3.5.0부터 6.3.x** — 3.5.0 = 6.3.0, 3.5.16 = 6.3.3). 직접 고정(hard pin)해 두었다면 충돌 확인 → `hikaricp-tuning-oracle-mysql` |
| **JPA 사용 시** | Hibernate 5.x → **6.1+**. 네이밍 전략·타입 매핑 변경으로 DDL·쿼리 결과가 달라질 수 있음 |
| **MyBatis TypeHandler** | 매퍼 XML은 영향 없음. `javax.*` 타입을 다루는 TypeHandler만 전환 대상 |

> 주의: MyBatis는 SQL이 그대로라 "안전"해 보이지만 사고는 **커넥션 풀·드라이버 버전 조합**에서 난다.
> Phase 4 이후 스테이징에서 **장시간(최소 수 시간) 커넥션 유지 테스트**를 수행해 idle 커넥션 회수 동작을 확인한다.

---

## 8. Phase 7 — WAR / Tomcat 9 → 10.1

- **Tomcat 9에는 Boot 3 WAR를 배포할 수 없다**(Tomcat 9 = `javax.servlet`, 10+ = `jakarta.servlet`).
- Tomcat 10+의 legacy appBase(`webapps-javaee`) 자동 변환은 **레거시 javax WAR를 임시로 돌리는 기능**이지 Boot 3 앱용이 아니다.
- 소스 없는 사내 공통 jar/war는 Apache Tomcat Jakarta EE Migration Tool로 임시 변환 가능 — 정답은 소유 팀 재빌드.

```bash
java -jar jakartaee-migration-*-shaded.jar legacy-common.jar legacy-common-jakarta.jar
```

---

## 9. OpenRewrite 경계

레시피 `org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_0`은 빌드 버전·`javax→jakarta`(JDK javax 제외)·프로퍼티 이름·`logback.xml→logback-spring.xml` 등을 치환한다. **못 하는 것**: JSP·TLD·`web.xml`·리플렉션 문자열, 컴파일된 서드파티 jar, Security 동작 변경, Springfox→Springdoc 의미 매핑, EhCache 2→3 정책 재설계, Lucy XSS 대체, 회귀·부하 검증.

> 주의: OpenRewrite 결과물은 **리뷰 대상 PR**이지 최종 산출물이 아니다.
> "컴파일이 통과했다"는 것은 치환이 끝났다는 뜻일 뿐 **런타임 동작 동일성은 전혀 보장하지 않는다.**
> 자동 변환 커밋과 수동 수정 커밋은 반드시 분리해 diff를 검토 가능하게 남긴다.

---

## 10. 배포 후 신호 — 즉시 롤백 vs 관찰

| 즉시 롤백 | 관찰 후 판단 (설정으로 대응) |
|-----------|-----------------------------|
| 기동 실패·헬스체크 미통과 | traceId 단절(B3/W3C 혼재) |
| 인증 회귀 — 세션 유실(Security 6 명시 저장 이슈의 전형) | 로그 파싱 실패(ISO-8601) |
| 5xx 유의미한 상승, DB 커넥션 고갈·풀 대기 급증 | Swagger 문서 누락, 트레일링 슬래시 404 |

롤백 아티팩트(2.7 / Java 11 빌드)는 재빌드 없이 즉시 배포 가능하게 보관한다.
