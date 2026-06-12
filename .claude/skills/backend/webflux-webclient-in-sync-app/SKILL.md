---
name: webflux-webclient-in-sync-app
description: Spring WebFlux WebClient를 블로킹(WebMVC) 애플리케이션에서 부분 비동기 HTTP 클라이언트로 사용하는 패턴 - 의존성, 타임아웃, 에러/재시도, ExchangeFilter, MockWebServer 테스트, 흔한 실수
---

# WebFlux WebClient를 동기 앱에서 사용하는 패턴

> 소스: https://docs.spring.io/spring-framework/reference/web/webflux-webclient.html | https://docs.spring.io/spring-framework/reference/web/webflux-webclient/client-synchronous.html | https://docs.spring.io/spring-framework/reference/web/webflux-webclient/client-builder.html | https://docs.spring.io/spring-framework/reference/web/webflux-webclient/client-filter.html | https://docs.spring.io/projectreactor/reactor-netty/docs/current/reference/html/http-client.html | https://github.com/square/okhttp/tree/master/mockwebserver | https://spring.io/blog/2025/09/30/the-state-of-http-clients-in-spring/
> 검증일: 2026-04-23

> 주의: 이 문서는 **Spring Boot 2.5 ~ 3.x** 범위에서 **WebMVC(블로킹) 애플리케이션**이 `spring-boot-starter-webflux`를 **WebClient 목적으로만** 함께 포함하는 시나리오를 다룹니다. 앱 자체의 WebFlux 전면 도입(리액티브 스택 전환)은 범위 밖입니다.

> 주의: Spring 7.0(2025 하반기)에서 RestTemplate은 deprecated로 향하고 있고, 동기 스택에서는 Spring 6.1+의 `RestClient`가 Spring 팀의 1순위 권장입니다. 그럼에도 WebClient를 선택하는 합리적 이유는 ① 이미 `spring-boot-starter-webflux`가 포함되어 있음 ② 부분적으로 리액티브 조합(`Mono.zip` 등)을 사용해 외부 호출을 병렬화하고 싶음 ③ 스트리밍/backpressure가 필요함 ④ Spring Boot 2.5처럼 RestClient가 없는 버전 등입니다. RestTemplate 대비 WebClient가 권장되는 것은 변함없습니다.

---

## 언제 이 패턴을 쓰나

| 상황 | 적합 여부 |
|------|:---:|
| WebMVC 앱에서 외부 HTTP 호출 일부를 비동기 조합(`Mono.zip`)하고 싶음 | ✅ |
| 동일 요청 처리 안에서 외부 API 2~3개를 병렬 호출 → 합쳐 응답 | ✅ |
| 스트리밍 응답(SSE/NDJSON) 수신 | ✅ |
| Spring Boot 2.5/2.7 환경이라 `RestClient`가 없음 | ✅ |
| 전체 애플리케이션을 리액티브로 전환 | ❌ (별도 WebFlux 마이그레이션 스킬) |
| Spring Boot 3.2+ 신규 프로젝트에서 단순 동기 호출만 필요 | ⚠️ `RestClient`가 더 적합 |

---

## 의존성

### Spring Boot 3.x (3.2 ~ 3.5)

```xml
<!-- pom.xml -->
<dependencies>
    <!-- WebMVC 앱 본체는 그대로 유지 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- WebClient만 가져오기 위해 WebFlux starter를 함께 포함 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>
</dependencies>
```

Spring Boot BOM이 Spring 6.x + Reactor Netty를 관리한다. 별도 버전 명시 불필요.

### Spring Boot 2.5 ~ 2.7

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

동일. 2.5는 Spring 5.3 + Reactor Netty 1.0이 BOM에 포함.

### 서버 스택은 Tomcat 유지됨

`spring-boot-starter-webflux`를 추가해도 `spring-boot-starter-web`이 함께 있으면 Spring Boot는 **WebMVC(Tomcat) 모드로 기동**한다. Reactor Netty는 **클라이언트 측에서만** 사용된다. 전환되지 않는다.

> 주의: 서버 타입을 명시적으로 고정하려면 `spring.main.web-application-type=servlet`을 설정해 혼동 가능성을 없애는 것이 안전하다.

---

## RestTemplate / WebClient / RestClient 선택 기준

| 클라이언트 | 스택 | 상태 (2026-04 기준) | 주요 용도 |
|-----------|------|------|-----------|
| `RestTemplate` | 동기 | Spring 5.0+ **유지보수 모드**, Spring 7.0에서 deprecated 진행, 8.0에서 제거 예정 | 레거시 유지 |
| `RestClient` | 동기 | Spring 6.1+ / Boot 3.2+ 권장 | 동기 앱의 기본 선택 |
| `WebClient` | 리액티브 (동기 사용 가능) | 활발히 유지됨 | 리액티브/스트리밍/병렬 조합 |

**"WebMVC + WebClient 일부 사용"**은 정식으로 권장되는 패턴이다. Spring 공식 레퍼런스에도 `block()` 기반 동기 사용법이 별도 섹션으로 문서화되어 있다.

---

## WebClient 생성과 Bean 설정

### 간단 생성

```java
WebClient simple = WebClient.create();
WebClient withBaseUrl = WebClient.create("https://api.example.com");
```

### Builder 기반 — 권장

```java
WebClient client = WebClient.builder()
    .baseUrl("https://api.example.com")
    .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
    .build();
```

### Spring Boot가 제공하는 `WebClient.Builder` 자동 설정

Spring Boot는 `WebClientAutoConfiguration`을 통해 **prototype 스코프의 `WebClient.Builder`를 자동 등록**한다. 주입받을 때마다 새 복제본이 오므로 API별로 커스터마이징해 여러 WebClient를 만들 수 있다.

```java
@Configuration
public class PaymentClientConfig {

    @Bean
    public WebClient paymentWebClient(WebClient.Builder builder) {
        return builder
            .baseUrl("https://pay.example.com")
            .defaultHeader("X-Client-Id", "myapp")
            .build();
    }

    @Bean
    public WebClient authWebClient(WebClient.Builder builder) {
        return builder
            .baseUrl("https://auth.example.com")
            .build();
    }
}
```

**핵심:**
- 매 요청마다 `WebClient.builder().build()`를 호출하지 않는다 — 커넥션풀/코덱이 매번 생성된다
- 외부 API별로 한 번만 Bean으로 만들어 주입해 쓴다

### 전역 커스터마이징: `WebClientCustomizer`

모든 `WebClient.Builder`에 일괄 적용하려면:

```java
@Bean
public WebClientCustomizer tracingCustomizer() {
    return builder -> builder.defaultHeader("X-Trace-Id", UUID.randomUUID().toString());
}
```

---

## 타임아웃 설정 (필수)

기본 WebClient는 **응답 타임아웃이 없다**. 외부 API가 응답하지 않으면 호출 스레드(WebMVC 워커)가 무한정 매달린다. 반드시 설정한다.

### Reactor Netty HttpClient 커스터마이징

```java
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Bean
public WebClient paymentWebClient(WebClient.Builder builder) {
    HttpClient httpClient = HttpClient.create()
        // TCP 연결 수립 타임아웃
        .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 3_000)
        // HTTP 요청 송신 ~ 응답 수신 완료까지 전체 시간
        .responseTimeout(Duration.ofSeconds(5))
        // 저수준 read/write idle 타임아웃
        .doOnConnected(conn -> conn
            .addHandlerLast(new ReadTimeoutHandler(5, TimeUnit.SECONDS))
            .addHandlerLast(new WriteTimeoutHandler(5, TimeUnit.SECONDS)));

    return builder
        .baseUrl("https://pay.example.com")
        .clientConnector(new ReactorClientHttpConnector(httpClient))
        .build();
}
```

| 설정 | 의미 |
|------|------|
| `CONNECT_TIMEOUT_MILLIS` | TCP SYN → 연결 수립까지 허용 시간 |
| `responseTimeout(Duration)` | HTTP 요청 시작 ~ 응답 완료까지 전체 시간 (가장 중요) |
| `ReadTimeoutHandler` | 소켓이 이 시간 동안 **읽기 없음** 상태면 에러 |
| `WriteTimeoutHandler` | 소켓이 이 시간 동안 **쓰기 없음** 상태면 에러 |

> 주의: `responseTimeout`은 HTTP 요청/응답 전체 시간을 재는 반면, `ReadTimeoutHandler`는 HTTP 의미가 아닌 Netty 채널의 read idle 감지다. 둘은 목적이 다르며 **둘 다 설정**하는 것이 안전하다.

### `block(Duration)` 방어선

동기 사용 시에도 타임아웃을 한 겹 더 두는 것이 좋다:

```java
Payment p = paymentWebClient.get().uri("/payments/{id}", id)
    .retrieve()
    .bodyToMono(Payment.class)
    .block(Duration.ofSeconds(10));   // HttpClient 타임아웃과 별개의 최종 방어선
```

---

## 동기 사용 기본 패턴 (`block()`)

Spring 공식 레퍼런스 "Synchronous Use" 섹션에 명시된 패턴이다.

### 본문만 받기 — `bodyToMono` + `block`

```java
Person person = client.get().uri("/person/{id}", id)
    .retrieve()
    .bodyToMono(Person.class)
    .block();
```

### 리스트 받기 — `bodyToFlux` + `collectList`

```java
List<Person> persons = client.get().uri("/persons")
    .retrieve()
    .bodyToFlux(Person.class)
    .collectList()
    .block();
```

### 헤더/상태 코드까지 받기 — `toEntity`

```java
ResponseEntity<Payment> res = client.get().uri("/payments/{id}", id)
    .retrieve()
    .toEntity(Payment.class)
    .block();

HttpStatusCode status = res.getStatusCode();
Payment body = res.getBody();
```

| 메서드 | 반환 |
|--------|------|
| `bodyToMono(T.class)` | 바디만 `Mono<T>` |
| `bodyToFlux(T.class)` | 요소 스트림 `Flux<T>` |
| `toEntity(T.class)` | `Mono<ResponseEntity<T>>` (헤더+상태+바디) |
| `toEntityList(T.class)` | `Mono<ResponseEntity<List<T>>>` |
| `toBodilessEntity()` | `Mono<ResponseEntity<Void>>` (DELETE 등) |

### 여러 호출을 병렬로 — `Mono.zip`

동기 앱이라도 **한 요청 처리 내에서 여러 외부 호출을 병렬화**하는 것이 WebClient를 쓰는 실익이다.

```java
Mono<Person> personMono = client.get().uri("/person/{id}", pid)
    .retrieve().bodyToMono(Person.class);
Mono<List<Hobby>> hobbiesMono = client.get().uri("/person/{id}/hobbies", pid)
    .retrieve().bodyToFlux(Hobby.class).collectList();

Map<String, Object> result = Mono.zip(personMono, hobbiesMono, (person, hobbies) -> {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("person", person);
    m.put("hobbies", hobbies);
    return m;
}).block(Duration.ofSeconds(5));
```

공식 레퍼런스 권장: **여러 호출은 개별 `block()`보다 `zip` 후 한 번에 `block()`** 한다.

> 주의: WebMVC에서는 요청 단위로 Tomcat 워커 스레드가 할당되어 있고, 거기서 `.block()`을 호출한다. 이 스레드는 외부 응답이 올 때까지 점유된다. 따라서 타임아웃 설정과 동시 요청 수 × 평균 대기 시간을 고려해 `server.tomcat.threads.max`를 조정해야 한다.

---

## 에러 처리

### `onStatus` — 상태 코드별 예외 매핑

```java
Payment p = client.get().uri("/payments/{id}", id)
    .retrieve()
    .onStatus(HttpStatusCode::is4xxClientError, resp ->
        resp.bodyToMono(String.class)
            .defaultIfEmpty("")
            .map(body -> new PaymentNotFoundException("4xx: " + body)))
    .onStatus(HttpStatusCode::is5xxServerError, resp ->
        resp.bodyToMono(String.class)
            .defaultIfEmpty("")
            .map(body -> new PaymentUpstreamException("5xx: " + body)))
    .bodyToMono(Payment.class)
    .block(Duration.ofSeconds(5));
```

**특정 상태 코드 분리 매핑 (401/403을 별도 처리)** — `onStatus` predicate는 `HttpStatusCode` 객체를 받으므로 `status.value() == N` 또는 enum 비교로 세밀하게 분기 가능. 매핑은 **위에서 아래로 순서대로** 평가되므로, 좁은 조건을 먼저 두고 포괄 조건을 뒤에 둔다.

```java
Payment p = client.post().uri("/pay")
    .bodyValue(req)
    .retrieve()
    // 401 — 인증 만료 (재시도 대상 아님, 토큰 재발급 유도)
    .onStatus(status -> status.value() == 401, resp ->
        resp.bodyToMono(String.class).defaultIfEmpty("")
            .map(body -> new PaymentAuthExpiredException(body)))
    // 403 — 권한 부족 (재시도 불가)
    .onStatus(status -> status.value() == 403, resp ->
        resp.bodyToMono(String.class).defaultIfEmpty("")
            .map(body -> new PaymentForbiddenException(body)))
    // 그 외 4xx — 포괄 처리
    .onStatus(HttpStatusCode::is4xxClientError, resp ->
        resp.bodyToMono(String.class).defaultIfEmpty("")
            .map(body -> new PaymentBadRequestException(body)))
    // 5xx — 재시도 대상
    .onStatus(HttpStatusCode::is5xxServerError, resp ->
        resp.bodyToMono(String.class).defaultIfEmpty("")
            .map(body -> new PaymentUpstreamException(body)))
    .bodyToMono(Payment.class)
    .block(Duration.ofSeconds(30));
```

### 기본 예외: `WebClientResponseException`

`onStatus`를 지정하지 않으면 `retrieve()`는 4xx/5xx에서 `WebClientResponseException`(또는 하위 클래스 `BadRequest`, `NotFound`, `InternalServerError` 등)을 발생시킨다.

```java
try {
    Payment p = client.get().uri("/payments/{id}", id)
        .retrieve().bodyToMono(Payment.class).block();
} catch (WebClientResponseException.NotFound e) {
    // 404 처리
} catch (WebClientResponseException e) {
    int code = e.getStatusCode().value();
    String body = e.getResponseBodyAsString();
    // ...
}
```

### 재시도 — `retryWhen` + `Retry.backoff`

Reactor의 `Retry.backoff`로 지수 백오프 재시도를 구성한다. **5xx만 재시도, 4xx는 재시도하지 않음**이 기본 원칙이다.

```java
import reactor.util.retry.Retry;

Payment p = client.get().uri("/payments/{id}", id)
    .retrieve()
    .bodyToMono(Payment.class)
    .retryWhen(Retry.backoff(3, Duration.ofMillis(200))
        .maxBackoff(Duration.ofSeconds(2))
        .filter(throwable -> throwable instanceof WebClientResponseException ex
            && ex.getStatusCode().is5xxServerError())
        .onRetryExhaustedThrow((spec, signal) -> signal.failure()))
    .block(Duration.ofSeconds(10));
```

- `filter`로 재시도 대상 예외 제한
- `onRetryExhaustedThrow`로 재시도 소진 시 원래 예외를 그대로 던지도록 설정
- `block()`의 최종 타임아웃은 **재시도 총합**을 고려해 넉넉히 잡는다

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
