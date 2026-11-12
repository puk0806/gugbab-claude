---
name: webflux-webclient-in-sync-app
description: Spring WebFlux WebClient를 블로킹(WebMVC) 애플리케이션에서 부분 비동기 HTTP 클라이언트로 사용하는 패턴 - RestTemplate 7.1 forRemoval·RestClient 선택 기준, SB 2.5~3.x 의존성(서버는 Tomcat 유지), 타임아웃 필수 설정, Mono.zip 병렬 호출, MockWebServer 버전, 흔한 실수
---

# WebFlux WebClient를 동기 앱에서 사용하는 패턴

> 소스: https://docs.spring.io/spring-framework/reference/web/webflux-webclient.html | https://docs.spring.io/spring-framework/reference/web/webflux-webclient/client-synchronous.html | https://docs.spring.io/spring-framework/reference/web/webflux-webclient/client-builder.html | https://docs.spring.io/spring-framework/reference/web/webflux-webclient/client-filter.html | https://docs.spring.io/projectreactor/reactor-netty/docs/current/reference/html/http-client.html | https://github.com/square/okhttp/tree/master/mockwebserver | https://spring.io/blog/2025/09/30/the-state-of-http-clients-in-spring/
> 검증일: 2026-11-09 (2026-04-23 최초 검증 · 재검증 이력은 8절 참조)

> 주의: 이 문서는 **Spring Boot 2.5 ~ 3.x** 범위에서 **WebMVC(블로킹) 애플리케이션**이 `spring-boot-starter-webflux`를 **WebClient 목적으로만** 함께 포함하는 시나리오를 다룹니다. 앱 자체의 WebFlux 전면 도입(리액티브 스택 전환)은 범위 밖입니다.

> 주의: **(2026-11-09 갱신)** Spring Framework 7.0(2025-11 GA)이 RestTemplate "deprecation 의도"를 공식 발표했고, **7.1에서 `@Deprecated(since = "7.1", forRemoval = true)`가 실제로 붙었습니다**(7.1.x Javadoc·소스 확인, "in favor of RestClient. For removal in 8.0"). 2026-11-09 현재 7.1은 **7.1.0-RC2**까지 나왔고 GA는 2026-11 예정입니다 — Spring Boot 4.2 가 7.1 을 쓰므로 4.2 업그레이드 시 RestTemplate 사용처에 deprecation 경고가 납니다. 완전 제거는 8.0. RestTemplate 자체는 2029년까지 오픈소스 지원이 유지되므로 기존 코드의 즉각 마이그레이션이 급한 것은 아닙니다. 동기 스택에서는 Spring 6.1+의 `RestClient`가 Spring 팀의 1순위 권장입니다. 그럼에도 WebClient를 선택하는 합리적 이유는 ① 이미 `spring-boot-starter-webflux`가 포함되어 있음 ② 부분적으로 리액티브 조합(`Mono.zip` 등)을 사용해 외부 호출을 병렬화하고 싶음 ③ 스트리밍/backpressure가 필요함 ④ Spring Boot 2.5처럼 RestClient가 없는 버전 등입니다. RestTemplate 대비 WebClient가 권장되는 것은 변함없습니다.

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

`spring-boot-starter-web`(WebMVC 앱 본체)에 `spring-boot-starter-webflux`를 WebClient만 가져오기 위해 함께 포함한다. Spring Boot BOM이 버전을 관리한다. 2.5는 Spring 5.3 + Reactor Netty 1.0이 BOM에 포함.

### 서버 스택은 Tomcat 유지됨

`spring-boot-starter-webflux`를 추가해도 `spring-boot-starter-web`이 함께 있으면 Spring Boot는 **WebMVC(Tomcat) 모드로 기동**한다. Reactor Netty는 **클라이언트 측에서만** 사용된다. 전환되지 않는다.

> 주의: 서버 타입을 명시적으로 고정하려면 `spring.main.web-application-type=servlet`을 설정해 혼동 가능성을 없애는 것이 안전하다.

---

## RestTemplate / WebClient / RestClient 선택 기준

| 클라이언트 | 스택 | 상태 (2026-11 기준) | 주요 용도 |
|-----------|------|------|-----------|
| `RestTemplate` | 동기 | Spring 5.0+ **유지보수 모드**. Spring 7.0(2025-11 GA)이 deprecation 의도 발표, 7.1(현재 RC2, 2026-11 GA 예정)에서 `@Deprecated(forRemoval = true)` 확정, 8.0에서 제거 예정. 오픈소스 지원은 2029년까지 | 레거시 유지 |
| `RestClient` | 동기 | Spring 6.1+ / Boot 3.2+ 권장 | 동기 앱의 기본 선택 |
| `WebClient` | 리액티브 (동기 사용 가능) | 활발히 유지됨 | 리액티브/스트리밍/병렬 조합 |

**"WebMVC + WebClient 일부 사용"**은 정식으로 권장되는 패턴이다. Spring 공식 레퍼런스에도 `block()` 기반 동기 사용법이 별도 섹션으로 문서화되어 있다.

---

## 타임아웃 설정 (필수)

기본 WebClient는 **응답 타임아웃이 없다**. 외부 API가 응답하지 않으면 호출 스레드(WebMVC 워커)가 무한정 매달린다. 반드시 설정한다.

### Reactor Netty HttpClient 커스터마이징

```java
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

> 주의: `responseTimeout`은 HTTP 요청/응답 전체 시간을 재는 반면, `ReadTimeoutHandler`는 HTTP 의미가 아닌 Netty 채널의 read idle 감지다. 둘은 목적이 다르며 **둘 다 설정**하는 것이 안전하다.

### `block(Duration)` 방어선

동기 사용 시에도 타임아웃을 한 겹 더 두는 것이 좋다 — `.block(Duration.ofSeconds(10))`은 HttpClient 타임아웃과 별개의 최종 방어선이다. 재시도(`retryWhen`)를 걸면 `block()`의 최종 타임아웃은 **재시도 총합**을 고려해 넉넉히 잡는다.

---

## 여러 호출을 병렬로 — `Mono.zip`

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

> 상세 레퍼런스 (MockWebServer 버전·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
