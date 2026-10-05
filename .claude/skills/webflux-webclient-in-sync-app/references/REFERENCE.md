## ExchangeFilterFunction — 로깅·인증 헤더 주입

`ExchangeFilterFunction`은 모든 요청/응답을 가로채는 필터다.

### 요청 로깅 필터

```java
public static ExchangeFilterFunction logRequest() {
    return ExchangeFilterFunction.ofRequestProcessor(req -> {
        log.info("[WebClient] {} {}", req.method(), req.url());
        req.headers().forEach((name, values) -> {
            if ("Authorization".equalsIgnoreCase(name)) {
                log.debug("  {}: ***", name);        // 민감 헤더는 마스킹
            } else {
                values.forEach(v -> log.debug("  {}: {}", name, v));
            }
        });
        return Mono.just(req);
    });
}
```

### 인증 헤더 자동 주입

```java
public static ExchangeFilterFunction authHeader(TokenProvider tokens) {
    return (req, next) -> tokens.getAccessToken()      // Mono<String>
        .map(token -> ClientRequest.from(req)
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
            .build())
        .flatMap(next::exchange);
}
```

토큰이 동기적으로 이미 있으면 `ofRequestProcessor`로 단순화 가능:

```java
public static ExchangeFilterFunction staticApiKey(String key) {
    return ExchangeFilterFunction.ofRequestProcessor(req ->
        Mono.just(ClientRequest.from(req)
            .header("X-API-Key", key)
            .build()));
}
```

### 등록 순서

```java
@Bean
public WebClient paymentWebClient(WebClient.Builder builder, TokenProvider tokens) {
    return builder
        .baseUrl("https://pay.example.com")
        .filter(logRequest())        // 로깅이 먼저
        .filter(authHeader(tokens))  // 인증 다음
        .build();
}
```

> 주의: `filter()` 호출 순서대로 요청에 적용된다. 로깅을 먼저 걸면 인증 헤더가 찍히지 않아 마스킹 고민이 줄어드는 이점이 있다.

### 기본 제공 필터

- `ExchangeFilterFunctions.basicAuthentication(user, pass)` — HTTP Basic 인증
- 참고: OAuth2는 별도의 `ServerOAuth2AuthorizedClientExchangeFilterFunction` 사용

---

## 외부 API 연동 실제 예

```java
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final WebClient paymentWebClient;

    public Payment create(CreatePaymentReq req) {
        return paymentWebClient.post()
            .uri("/v1/payments")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(req)
            .retrieve()
            .onStatus(HttpStatusCode::is4xxClientError, resp ->
                resp.bodyToMono(ErrorBody.class)
                    .map(eb -> new PaymentBadRequestException(eb.message())))
            .bodyToMono(Payment.class)
            .retryWhen(Retry.backoff(2, Duration.ofMillis(300))
                .filter(t -> t instanceof WebClientResponseException ex
                    && ex.getStatusCode().is5xxServerError()))
            .block(Duration.ofSeconds(10));
    }

    public Payment findById(String id) {
        return paymentWebClient.get()
            .uri("/v1/payments/{id}", id)
            .retrieve()
            .bodyToMono(Payment.class)
            .block(Duration.ofSeconds(5));
    }
}
```

컨트롤러는 평범한 WebMVC:

```java
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Payment> create(@RequestBody CreatePaymentReq req) {
        return ResponseEntity.ok(paymentService.create(req));
    }
}
```

---

## 테스트 — MockWebServer (Square OkHttp)

Mockito로 WebClient 자체를 mocking하는 것은 fluent API 때문에 매우 장황하다. **실제 로컬 HTTP 서버를 띄워 통합 테스트**하는 것이 공식적으로도 권장된다.

### 의존성

```xml
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>mockwebserver</artifactId>
    <version>4.12.0</version>
    <scope>test</scope>
</dependency>
```

> 주의: OkHttp 5.x 라인에서는 `mockwebserver3` 아티팩트(신규 네임스페이스)가 별도 제공된다. 프로젝트의 OkHttp 버전과 정렬해 선택한다. 4.x 계열 4.12.0은 JVM 동기 테스트에 안정적으로 사용되고 있다.

### 기본 테스트 패턴

```java
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.*;

import static org.assertj.core.api.Assertions.*;

class PaymentServiceMockServerTest {

    private MockWebServer server;
    private PaymentService service;

    @BeforeEach
    void setUp() throws Exception {
        server = new MockWebServer();
        server.start();
        WebClient wc = WebClient.builder()
            .baseUrl(server.url("/").toString())
            .build();
        service = new PaymentService(wc);
    }

    @AfterEach
    void tearDown() throws Exception {
        server.shutdown();
    }

    @Test
    void findById_returnsPayment() throws Exception {
        server.enqueue(new MockResponse()
            .setResponseCode(200)
            .setHeader("Content-Type", "application/json")
            .setBody("""
                {"id":"p1","amount":1000}
                """));

        Payment p = service.findById("p1");

        assertThat(p.id()).isEqualTo("p1");
        RecordedRequest req = server.takeRequest();
        assertThat(req.getMethod()).isEqualTo("GET");
        assertThat(req.getPath()).isEqualTo("/v1/payments/p1");
    }
}
```

### Spring Boot 통합 테스트 — `@DynamicPropertySource`

```java
@SpringBootTest
class PaymentApiIntegrationTest {

    static MockWebServer server;

    @BeforeAll
    static void start() throws Exception {
        server = new MockWebServer();
        server.start();
    }

    @AfterAll
    static void stop() throws Exception {
        server.shutdown();
    }

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("payment.base-url", () -> server.url("/").toString());
    }

    @Autowired PaymentService paymentService;

    @Test
    void callsExternal() throws Exception {
        server.enqueue(new MockResponse().setResponseCode(200).setBody("{\"id\":\"p1\"}"));
        // ...
    }
}
```

Bean 설정 쪽에서 `@Value("${payment.base-url}")`로 baseUrl을 주입받도록 해두면 테스트 시 MockWebServer URL로 치환된다.

---

## 자주 하는 실수

| 실수 | 증상 | 수정 |
|------|------|------|
| 매 요청마다 `WebClient.builder().build()` 호출 | 커넥션풀·코덱이 매번 생성, 누수 | `@Bean`으로 한 번만 생성해 주입 |
| `.block()` 없이 `bodyToMono(...)` 반환 후 결과 기대 | **결과가 나오지 않음** (Mono는 subscribe 전엔 실행 안 됨) | 동기 앱에서는 `.block()` 또는 `.block(Duration)` 필수 |
| `block()`에 타임아웃 미지정 | 외부 API 행(hang) 시 Tomcat 워커가 영원히 점유 | `block(Duration.ofSeconds(N))` |
| `HttpClient`에 `responseTimeout` 미설정 | 응답 무한 대기 | `HttpClient.create().responseTimeout(...)` 필수 |
| `exchange()` 사용 | Spring 5.3부터 deprecated, 메모리/커넥션 누수 위험 | `retrieve()` 또는 `exchangeToMono()/exchangeToFlux()` |
| 4xx까지 `retryWhen`으로 재시도 | 클라이언트 에러를 수 차례 반복 호출해 상대 API 부하 증가 | `filter(ex -> ex.is5xxServerError())` |
| `spring-boot-starter-webflux` 추가 후 서버가 Netty로 전환됐다고 오해 | 사실은 Tomcat 유지 | `starter-web`이 함께 있으면 Servlet 스택, 명시적으로 `spring.main.web-application-type=servlet` 지정 가능 |
| 공용 Tomcat 워커 스레드 풀에 그대로 blocking I/O 쌓기 | 동시 요청 수 × 평균 응답 시간이 크면 풀 고갈 | 타임아웃 엄격화, `server.tomcat.threads.max` 조정, 필요 시 외부 호출은 별도 스레드풀(예: `@Async` + `ThreadPoolTaskExecutor`)로 분리 검토 |
| Mockito로 WebClient mocking 시도 | fluent chain 때문에 테스트 코드 과다 | MockWebServer로 로컬 서버 기동 |
| `ExchangeFilterFunction`에서 원본 `ClientRequest`에 헤더 직접 set 시도 | `ClientRequest`는 불변 | `ClientRequest.from(req).header(...).build()`로 새 객체 생성 |
| 전체 WebFlux 전환과 혼동 | 컨트롤러를 `Mono<ResponseEntity<...>>`로 바꾸려 함 | WebMVC 앱은 컨트롤러 그대로, WebClient는 **서비스 레이어 내부에서만** 사용해 `.block()`으로 종결 |
