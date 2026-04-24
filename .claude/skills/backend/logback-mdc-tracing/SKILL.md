---
name: logback-mdc-tracing
description: Spring Boot 애플리케이션의 구조화된 로깅과 분산 추적 - Logback + MDC + Spring Cloud Sleuth(SB 2.5, 레거시) / Micrometer Tracing(SB 3.x, 모던) 통합
---

# Logback + MDC + 분산 추적 통합

> 소스:
> - Logback: https://logback.qos.ch/manual/appenders.html (logback-classic 1.5.x)
> - Spring Boot Logging: https://docs.spring.io/spring-boot/how-to/logging.html
> - Spring Boot Tracing: https://docs.spring.io/spring-boot/reference/actuator/tracing.html
> - Spring Cloud Sleuth (레거시): https://github.com/spring-cloud/spring-cloud-sleuth/blob/3.1.x/README.adoc
> - Micrometer Tracing: https://docs.micrometer.io/tracing/reference/index.html
> - SLF4J MDC: https://www.slf4j.org/api/org/slf4j/MDC.html
>
> 검증일: 2026-04-22

> 주의: 이 문서는 Logback 1.5.x, Spring Boot 3.4+/3.5(Micrometer Tracing 1.3.x~1.5.x), Spring Boot 2.5.x(Sleuth 3.0.x / 3.1.x)를 기준으로 작성되었습니다. Sleuth는 **Spring Boot 3.x에서 동작하지 않으며**, 레거시 유지보수 프로젝트에만 사용합니다.

---

## 언제 이 스킬을 사용하는가

- 운영 중인 Spring Boot 서비스에 구조화된 로그(logback-spring.xml) 설정이 필요할 때
- 분산 환경에서 traceId/spanId 기반 요청 추적이 필요할 때
- Spring Boot 2.x(레거시) 기반 서비스와 Spring Boot 3.x(신규) 서비스가 혼재하는 팀에서 규칙을 맞출 때
- `@Async`, 메시지 큐 등 비동기 경계에서 로그 컨텍스트가 끊기는 이슈를 해결할 때

---

## 공통: Logback 기본 설정

### 파일 위치와 이름

- `src/main/resources/logback-spring.xml` — **권장**. Spring Boot 확장(`<springProfile>`, `<springProperty>`) 사용 가능.
- `src/main/resources/logback.xml` — 비권장. Logback이 Spring 초기화 전에 로드되어 Spring 확장 기능을 쓸 수 없음.

### 최소 구성 (logback-spring.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="30 seconds">

    <!-- Spring Boot 기본 정의(패턴/변환 규칙) 포함 -->
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>

    <!-- 로그 패턴: traceId/spanId MDC 포함 -->
    <property name="LOG_PATTERN"
        value="%d{yyyy-MM-dd HH:mm:ss.SSS} [%X{traceId:-}/%X{spanId:-}] [%thread] %-5level %logger{36} - %msg%n"/>

    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
    </root>
</configuration>
```

**핵심 포인트:**
- `%X{traceId:-}` — MDC에서 `traceId` 키를 읽고, 없으면 빈 문자열 출력 (`-`는 기본값 구분자)
- `scan="true"` — 설정 파일 변경 감지 후 자동 리로드 (운영에서는 성능 영향 없는 수준)
- `defaults.xml` include — Spring Boot가 제공하는 기본 변환 규칙(`CONSOLE_LOG_PATTERN` 등) 활용

### Spring Profile별 설정 분리

```xml
<springProfile name="local | dev">
    <root level="DEBUG">
        <appender-ref ref="CONSOLE"/>
    </root>
</springProfile>

<springProfile name="prod">
    <root level="INFO">
        <appender-ref ref="ASYNC_FILE"/>
    </root>
</springProfile>
```

> `<springProfile>`은 `logback.xml`에서는 동작하지 않는다. 반드시 `logback-spring.xml`을 사용한다.

---

## 공통: Appender 구성

### ConsoleAppender

```xml
<appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
        <pattern>${LOG_PATTERN}</pattern>
    </encoder>
</appender>
```

### RollingFileAppender + TimeBasedRollingPolicy

```xml
<property name="LOG_PATH" value="${LOG_PATH:-./logs}"/>

<appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${LOG_PATH}/application.log</file>
    <encoder>
        <pattern>${LOG_PATTERN}</pattern>
    </encoder>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <!-- 일별 롤링 + gzip 압축 (확장자로 자동 활성화) -->
        <fileNamePattern>${LOG_PATH}/archived/application-%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
        <maxHistory>30</maxHistory>
        <totalSizeCap>5GB</totalSizeCap>
        <!-- 일별 롤링 중 파일 크기 제한 동시 적용 시 SizeAndTimeBased 사용 -->
        <timeBasedFileNamingAndTriggeringPolicy
            class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
            <maxFileSize>100MB</maxFileSize>
        </timeBasedFileNamingAndTriggeringPolicy>
    </rollingPolicy>
</appender>
```

**옵션 의미:**
| 옵션 | 설명 |
|------|------|
| `fileNamePattern` | 롤링 주기는 패턴 자체에서 유추 (`%d{yyyy-MM-dd}` → 일별) |
| `maxHistory` | 보관할 최대 아카이브 파일 수(일 단위 롤링이면 일 수) |
| `totalSizeCap` | 아카이브 전체 크기 상한. 초과 시 오래된 파일부터 삭제 |
| `.gz` / `.zip` | fileNamePattern 확장자로 자동 압축 활성화 |
| `maxFileSize` | 같은 날 안에서 크기로 추가 롤링 |

### AsyncAppender

I/O가 핫패스를 블록하지 않도록 운영 환경에서 파일 appender 앞에 둔다.

```xml
<appender name="ASYNC_FILE" class="ch.qos.logback.classic.AsyncAppender">
    <queueSize>1024</queueSize>
    <discardingThreshold>0</discardingThreshold>  <!-- 0이면 INFO 이상도 버리지 않음 -->
    <neverBlock>false</neverBlock>                <!-- true면 큐 가득 차도 블록 안 함(로그 유실 위험) -->
    <appender-ref ref="FILE"/>
</appender>
```

> 주의: `discardingThreshold` 기본값은 `queueSize / 5` 이며 큐가 80% 이상 찬 상태에서 TRACE/DEBUG/INFO를 **자동으로 버린다**. 전량 보존이 필요하면 `0`으로 설정한다.

---

## 공통: 로그 레벨 제어

`application.yml`에서 패키지별 레벨 오버라이드.

```yaml
logging:
  level:
    root: INFO
    com.example.myapp: DEBUG
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.orm.jdbc.bind: TRACE   # 파라미터 바인딩 로그
```

환경변수로도 조정 가능: `LOGGING_LEVEL_COM_EXAMPLE_MYAPP=DEBUG`.

---

## 공통: SLF4J 사용법

### Lombok @Slf4j

```java
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class UserService {
    public User findById(Long id) {
        log.info("finding user: id={}", id);
        // ...
    }
}
```

### 파라미터화 로깅 (중요)

```java
// 권장: 파라미터화 — 레벨 비활성 시 toString/concat 비용 없음
log.debug("user found: id={}, name={}", id, name);

// 금지: 문자열 연결 — 항상 연결 비용 발생
log.debug("user found: id=" + id + ", name=" + name);
```

### 예외 로깅 — 예외는 마지막 인자

```java
try {
    userService.save(user);
} catch (DuplicateKeyException e) {
    // 마지막 인자가 Throwable이면 SLF4J가 스택 트레이스를 자동 출력
    log.error("failed to save user: key={}", user.getEmail(), e);
}
```

> SLF4J 1.6.0+는 "placeholder 개수보다 인자가 하나 더 많고 그 마지막 인자가 Throwable"이면 스택 트레이스로 취급한다. placeholder를 추가로 쓰면 일반 객체로 다뤄져 스택이 출력되지 않는다.

---

## 공통: MDC 직접 사용

MDC(Mapped Diagnostic Context)는 **스레드 로컬**이다. 반드시 요청 종료 시 clean up.

### try-with-resources (권장)

```java
import org.slf4j.MDC;

public void handleRequest(String userId) {
    try (MDC.MDCCloseable ignored = MDC.putCloseable("userId", userId)) {
        log.info("processing request");  // 로그 패턴의 %X{userId}로 출력됨
        // ...
    } // 블록 종료 시 자동으로 MDC.remove("userId") 호출
}
```

### 수동 put/remove (try/finally 필수)

```java
MDC.put("userId", userId);
MDC.put("requestId", requestId);
try {
    // ...
} finally {
    MDC.remove("userId");
    MDC.remove("requestId");
    // 또는 전체 초기화: MDC.clear();
}
```

> `MDC.put()` 후 `remove()`를 빠뜨리면 스레드 풀 재사용 시 **다른 요청의 로그에 이전 값이 남는다**. 반드시 try-with-resources 또는 try/finally로 감싼다.

### 로그 패턴에 MDC 노출

```xml
<!-- %X{key:-default} 문법 -->
<pattern>%d [%X{userId:-anonymous}] %msg%n</pattern>
```

---

## 레거시: Spring Cloud Sleuth (Spring Boot 2.5.x)

> 주의: Sleuth는 Spring Boot 3.x에서 **동작하지 않는다**. Sleuth 3.1.x가 최종 마이너 버전이며 현재 유지보수 모드다. 신규 프로젝트는 Micrometer Tracing(아래 섹션)을 사용한다.

### 의존성 (Spring Boot 2.5.x + Sleuth 3.0.x)

```xml
<!-- pom.xml -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>2020.0.6</version>  <!-- Sleuth 3.0.x → Spring Boot 2.5 호환 -->
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-sleuth</artifactId>
    </dependency>
    <!-- Zipkin으로 span 전송이 필요한 경우 -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-sleuth-zipkin</artifactId>
    </dependency>
</dependencies>
```

> 주의: Spring Boot 2.6.0+는 Sleuth 3.0.x와 호환성 이슈(circular dependency)가 있었다. 2.5.x 라인 유지 또는 Sleuth 3.1.x로 업그레이드 필요.

### 자동 MDC 주입

Sleuth는 의존성을 추가하는 것만으로 `traceId`, `spanId`를 MDC에 자동 주입한다. 로그 패턴에 `%X{traceId}` / `%X{spanId}`를 넣으면 즉시 출력된다.

### 기본 설정

```yaml
# application.yml
spring:
  application:
    name: my-service
  sleuth:
    sampler:
      probability: 1.0          # 100% 샘플링 (운영은 0.1 권장)
  zipkin:
    base-url: http://zipkin:9411
```

### 커스텀 Span 생성 — `@NewSpan`, `@SpanTag`

```java
import org.springframework.cloud.sleuth.annotation.NewSpan;
import org.springframework.cloud.sleuth.annotation.SpanTag;

@Service
public class PaymentService {

    @NewSpan("process-payment")
    public Receipt process(@SpanTag("orderId") Long orderId, BigDecimal amount) {
        // 새 span이 생성되고 "orderId" 태그가 부착됨
        return ...;
    }
}
```

### HTTP 클라이언트 자동 인스트루먼테이션

`RestTemplate`, `WebClient`는 Spring 빈으로 주입하면 Sleuth가 자동으로 trace 헤더(B3)를 전파한다. `new RestTemplate()`으로 직접 생성하면 전파되지 않는다.

---

## 모던: Micrometer Tracing (Spring Boot 3.x)

### 의존성 — Brave(Zipkin) 기반

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-tracing-bridge-brave</artifactId>
    </dependency>
    <!-- Zipkin으로 span 전송 시 -->
    <dependency>
        <groupId>io.zipkin.reporter2</groupId>
        <artifactId>zipkin-reporter-brave</artifactId>
    </dependency>
</dependencies>
```

### 의존성 — OpenTelemetry 기반

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-otlp</artifactId>
</dependency>
```

> 두 bridge를 **동시에 포함하지 않는다**. 하나만 선택. 버전은 Spring Boot BOM이 관리하므로 명시하지 않는다.

### 기본 설정

```yaml
# application.yml
spring:
  application:
    name: my-service

management:
  tracing:
    enabled: true
    sampling:
      probability: 1.0      # 개발 100%, 운영은 0.1~0.3 권장
  zipkin:
    tracing:
      endpoint: http://zipkin:9411/api/v2/spans

# 로그 패턴에 correlation 주입 (Spring Boot가 기본 제공)
logging:
  pattern:
    correlation: "[${spring.application.name:},%X{traceId:-},%X{spanId:-}] "
  include-application-name: false
```

### MDC 키 호환성

Micrometer Tracing도 MDC 키로 `traceId`, `spanId`를 사용한다. **Sleuth 시절과 동일한 키이므로 로그 패턴 변경이 필요 없다.**

> 주의: Sleuth는 기본적으로 B3 전파 포맷을, Micrometer Tracing은 W3C Trace Context 포맷을 사용한다. Sleuth와 Micrometer 기반 서비스를 혼합 운용하면 traceId가 이어지지 않을 수 있다. 양측 포맷을 맞추거나 운영 마이그레이션을 일시에 수행한다.

### 커스텀 Span — Tracer API 직접 사용

```java
import io.micrometer.tracing.Tracer;
import io.micrometer.tracing.Span;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final Tracer tracer;

    public Receipt process(Long orderId, BigDecimal amount) {
        Span span = tracer.nextSpan().name("process-payment").start();
        try (Tracer.SpanInScope ws = tracer.withSpan(span)) {
            span.tag("orderId", String.valueOf(orderId));
            return doProcess(orderId, amount);
        } catch (Exception e) {
            span.error(e);
            throw e;
        } finally {
            span.end();
        }
    }
}
```

### `@NewSpan` / `@Observed` (애노테이션 기반)

Spring Boot 3.0 초기에는 `@NewSpan`에 해당하는 AOP가 빠져 있었고 **Spring Boot 3.1 + Micrometer Tracing 1.1.0부터 지원**된다. 활성화하려면:

```yaml
management:
  observations:
    annotations:
      enabled: true
```

```xml
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
</dependency>
```

```java
import io.micrometer.observation.annotation.Observed;

@Service
public class PaymentService {
    @Observed(name = "payment.process", contextualName = "process-payment")
    public Receipt process(Long orderId) { ... }
}
```

> `@Observed`가 권장 방향이다. `@NewSpan`/`@SpanTag`는 Sleuth에서 이식되었으나 Observation 생태계에 더 적합한 `@Observed`가 신규 API다.

### HTTP 클라이언트 자동 인스트루먼테이션

- `RestTemplateBuilder`로 주입받은 `RestTemplate`
- `WebClient.Builder`로 주입받은 `WebClient`
- Spring 6.1+의 `RestClient.Builder`

는 자동으로 trace 헤더를 전파한다. 직접 `new`로 생성하면 전파되지 않는다.

---

## 비동기 컨텍스트 전파 (@Async, ExecutorService)

### 문제

`@Async` 또는 커스텀 `ExecutorService`에 작업을 던지면 MDC는 **다른 스레드로 복사되지 않는다**. 결과적으로 traceId/spanId 및 커스텀 MDC가 모두 끊긴다.

### 해결 1: TaskDecorator로 MDC 복사

```java
import org.slf4j.MDC;
import org.springframework.core.task.TaskDecorator;

import java.util.Map;

public class MdcTaskDecorator implements TaskDecorator {
    @Override
    public Runnable decorate(Runnable runnable) {
        Map<String, String> context = MDC.getCopyOfContextMap();
        return () -> {
            Map<String, String> previous = MDC.getCopyOfContextMap();
            if (context != null) MDC.setContextMap(context);
            try {
                runnable.run();
            } finally {
                if (previous != null) MDC.setContextMap(previous);
                else MDC.clear();
            }
        };
    }
}
```

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(16);
        executor.setTaskDecorator(new MdcTaskDecorator());
        executor.initialize();
        return executor;
    }
}
```

### 해결 2: Micrometer Context Propagation (Spring Boot 3.x 권장)

Micrometer는 `ContextSnapshot`으로 MDC + Tracing 컨텍스트를 통째로 스냅숏·복원하는 메커니즘을 제공한다.

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>context-propagation</artifactId>
</dependency>
```

```java
import io.micrometer.context.ContextSnapshotFactory;

ContextSnapshotFactory factory = ContextSnapshotFactory.builder().build();
executor.setTaskDecorator(runnable ->
    factory.captureAll().wrap(runnable)
);
```

> `@Async` 뿐 아니라 `CompletableFuture`, Reactor `Mono/Flux`, `@Scheduled` 스레드에서도 같은 패턴으로 MDC 전파가 필요하다.

---

## 외부 시스템 추적 — HTTP 클라이언트

| 클라이언트 | 자동 전파 조건 |
|------------|---------------|
| `RestTemplate` | `RestTemplateBuilder`로 생성 (Spring 빈) |
| `WebClient` | `WebClient.Builder`로 생성 (Spring 빈) |
| `RestClient` (Spring 6.1+) | `RestClient.Builder`로 생성 |
| `FeignClient` | Spring Cloud OpenFeign 의존성 + Micrometer Observation 통합 |

**금지 패턴:** `new RestTemplate()`, `WebClient.create()` — 수동 생성은 trace 헤더가 주입되지 않는다.

---

## 프로덕션 운영 팁

### 1. 환경별 로그 분리

```xml
<springProfile name="prod">
    <!-- 일반 로그 -->
    <root level="INFO">
        <appender-ref ref="ASYNC_FILE"/>
    </root>
    <!-- 에러 전용 파일 appender 추가 -->
    <logger name="com.example" level="INFO" additivity="false">
        <appender-ref ref="ASYNC_FILE"/>
        <appender-ref ref="ERROR_FILE"/>
    </logger>
</springProfile>
```

### 2. 샘플링 전략

- 개발/스테이징: `probability: 1.0` (100%)
- 운영: `probability: 0.1` 이하. Tail-based 샘플링이 필요하면 OTel Collector에 위임
- 디버그 필요 시: 특정 엔드포인트만 헤더 전파로 강제 샘플링

### 3. 개인정보/시크릿 마스킹

- 패스워드, 주민번호, 카드번호, 토큰 등을 MDC에 **절대 넣지 않는다**
- 예외 메시지에 평문 비밀이 섞이지 않도록 도메인 에러로 래핑
- 외부 전송용 span attribute에도 동일 원칙 적용 (Zipkin/OTel 백엔드에도 PII 노출됨)

### 4. 로그 레벨 런타임 변경

Spring Boot Actuator의 `loggers` 엔드포인트로 재배포 없이 레벨 변경 가능.

```yaml
management:
  endpoints:
    web:
      exposure:
        include: loggers, health
```

```bash
curl -X POST http://app/actuator/loggers/com.example.myapp \
  -H 'Content-Type: application/json' \
  -d '{"configuredLevel": "DEBUG"}'
```

### 5. 로그 수집 파이프라인과의 정합성

- JSON 구조화 로그가 필요하면 `logstash-logback-encoder`의 `LogstashEncoder` 사용
- 파일 롤링 기반 수집(Fluentd, Filebeat)은 `maxHistory`·`totalSizeCap`으로 디스크 폭주 방어
- 직접 TCP 전송은 장애 전파 위험 — 파일→사이드카 수집 권장

---

## 흔한 실수 패턴

| 실수 | 결과 | 해결 |
|------|------|------|
| `logback.xml` 사용 | `<springProfile>` 무시됨 | `logback-spring.xml` 사용 |
| MDC.put 후 remove 누락 | 스레드 풀 재사용 시 다른 요청에 값 누출 | try-with-resources (MDC.putCloseable) |
| 문자열 연결 로깅 `"x=" + x` | 레벨 비활성 시에도 연결 비용 | `log.debug("x={}", x)` 파라미터화 |
| `new RestTemplate()` 수동 생성 | trace 헤더 미전파 | `RestTemplateBuilder` 주입 |
| `@Async` 메서드에서 traceId 끊김 | 로그 상관관계 소실 | `TaskDecorator` 또는 Context Propagation |
| AsyncAppender `discardingThreshold` 기본값 | 부하 시 INFO 로그 유실 | 필요 시 `0`으로 명시 |
| Sleuth와 Micrometer 혼용 | B3 vs W3C 포맷 불일치로 trace 단절 | 전파 포맷 통일 |
| Spring Boot 3.x에 Sleuth 의존성 | 기동 실패 / 동작 안 함 | Micrometer Tracing으로 교체 |
| MDC에 PII 저장 | 로그·Trace 백엔드에 개인정보 유출 | 마스킹 또는 저장 금지 |
| `log.error(msg, e.getMessage())` | 스택 트레이스 소실 | `log.error(msg, e)` — 예외 객체 자체를 전달 |

---

## 빠른 판단 매트릭스

| 상황 | 선택 |
|------|------|
| Spring Boot 2.5.x, 기존 Sleuth 사용 중 | Sleuth 3.0.x 유지 또는 SB3+Micrometer로 마이그레이션 |
| Spring Boot 3.x 신규 프로젝트 | Micrometer Tracing + bridge-brave(또는 otel) |
| Zipkin만 필요 | bridge-brave + zipkin-reporter-brave |
| OpenTelemetry 생태계(Jaeger, OTLP Collector) | bridge-otel + opentelemetry-exporter-otlp |
| 애노테이션 기반 span | `@Observed` (SB 3.1+) / `@NewSpan` (Sleuth) |
| 비동기 컨텍스트 전파 | `TaskDecorator` + (SB3면) `ContextSnapshotFactory` |
