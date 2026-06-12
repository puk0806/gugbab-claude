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
