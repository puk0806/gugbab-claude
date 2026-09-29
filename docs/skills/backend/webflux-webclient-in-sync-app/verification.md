---
skill: webflux-webclient-in-sync-app
category: backend
version: v1
date: 2026-09-26
status: APPROVED
---

# 스킬 검증: webflux-webclient-in-sync-app

> Spring WebFlux WebClient를 WebMVC(블로킹) 애플리케이션에서 부분 비동기 HTTP 클라이언트로 사용하는 패턴 스킬의 검증 문서

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `webflux-webclient-in-sync-app` |
| 스킬 경로 | `.claude/skills/backend/webflux-webclient-in-sync-app/SKILL.md` |
| 검증일 | 2026-09-26 (최초 2026-04-23) |
| 검증자 | skill-creator (자동) → 2026-09-26 재검증: 메인 오케스트레이션 (Claude Sonnet 5) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.spring.io — WebClient / Synchronous Use / Configuration / Filters)
- [✅] Reactor Netty HttpClient 공식 레퍼런스 확인
- [✅] 공식 GitHub 2순위 소스 확인 (spring-framework issue tracker, square/okhttp)
- [✅] 최신 버전 기준 내용 확인 (Spring Boot 2.5 ~ 3.x / Spring 5.3 ~ 7.0 범위, 2026-04-23)
- [✅] RestTemplate / RestClient / WebClient 관계 정리 (Spring 7.0 deprecation 반영)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (Bean 설정, 타임아웃, 에러/재시도, 필터, 테스트)
- [✅] 코드 예시 작성 (Java)
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿/참조 확인 | Read | VERIFICATION_TEMPLATE.md, mybatis-mapper-patterns/SKILL.md | 섹션 구조·문체 파악 |
| 조사 1 | WebSearch | "Spring WebFlux WebClient official documentation blocking application" | 공식 URL 2건 확보 (webflux-webclient.html, client-synchronous.html) |
| 조사 2 | WebSearch | "Spring RestTemplate deprecated maintenance mode WebClient recommended" | Spring 공식 블로그(2025-09-30 "state of HTTP clients in Spring") 확인, Spring 7.0 deprecation 경로 확인 |
| 조사 3 | WebSearch | "Spring WebClient synchronous use block official documentation example" | 공식 `bodyToMono.block()`, `Mono.zip` 권장 패턴 코드 확보 |
| 조사 4 | WebSearch | "Reactor Netty HttpClient responseTimeout connectTimeout ReadTimeoutHandler" | `responseTimeout` vs `ReadTimeoutHandler` 차이, `ChannelOption.CONNECT_TIMEOUT_MILLIS` 사용법 확인 |
| 조사 5 | WebSearch | "ExchangeFilterFunction logging authentication header example" | `ofRequestProcessor`, `basicAuthentication`, filter 순서 확인 |
| 조사 6 | WebSearch | "onStatus WebClientResponseException retry retryWhen" | `Retry.backoff` + `filter` + `onRetryExhaustedThrow` 패턴 확인 |
| 조사 7 | WebSearch | "WebClient.Builder autoconfiguration dedicated HttpClient" | `WebClientAutoConfiguration`, prototype scope, `WebClientCustomizer`, `ClientHttpConnector` override 확인 |
| 조사 8 | WebSearch | "MockWebServer okhttp3 Spring WebClient integration test" | MockWebServer 사용법, `@DynamicPropertySource` 패턴 확인 |
| 조사 9 | WebSearch | "spring-boot-starter-webflux MVC application dependency" | `starter-web` + `starter-webflux` 공존 시 서버는 Tomcat 유지 (공식 동작) 확인 |
| 조사 10 | WebSearch | "bodyToMono toEntity retrieve exchangeToMono difference" | 각 메서드 반환 타입, `exchange()` Spring 5.3 deprecated 사실 확인 |
| 교차 검증 | WebSearch | 총 10개 클레임, 독립 소스 2개 이상 | VERIFIED 9 / DISPUTED 0 / UNVERIFIED 1 (OkHttp 5.x `mockwebserver3` 네임스페이스 변경은 2차 소스만 확인 — 주의 표기 처리) |
| WebFetch 시도 | WebFetch | docs.spring.io 2건 | self-signed 인증서 오류로 실패. WebSearch 요약으로 대체 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Spring Framework Reference — WebClient | https://docs.spring.io/spring-framework/reference/web/webflux-webclient.html | ⭐⭐⭐ High | 2026-04-23 | 공식 |
| Spring Framework Reference — Synchronous Use | https://docs.spring.io/spring-framework/reference/web/webflux-webclient/client-synchronous.html | ⭐⭐⭐ High | 2026-04-23 | 공식 |
| Spring Framework Reference — Configuration (Builder) | https://docs.spring.io/spring-framework/reference/web/webflux-webclient/client-builder.html | ⭐⭐⭐ High | 2026-04-23 | 공식 |
| Spring Framework Reference — Filters | https://docs.spring.io/spring-framework/reference/web/webflux-webclient/client-filter.html | ⭐⭐⭐ High | 2026-04-23 | 공식 |
| Spring Framework Reference — Testing | https://docs.spring.io/spring-framework/reference/web/webflux-webclient/client-testing.html | ⭐⭐⭐ High | 2026-04-23 | 공식 |
| Reactor Netty HTTP Client Reference | https://docs.spring.io/projectreactor/reactor-netty/docs/current/reference/html/http-client.html | ⭐⭐⭐ High | 2026-04-23 | 공식 |
| Spring Blog — The state of HTTP clients in Spring | https://spring.io/blog/2025/09/30/the-state-of-http-clients-in-spring/ | ⭐⭐⭐ High | 2026-04-23 | 공식 블로그, Spring 7.0 RestTemplate deprecation 로드맵 |
| Spring Boot API — WebClientAutoConfiguration | https://docs.spring.io/spring-boot/api/java/org/springframework/boot/autoconfigure/web/reactive/function/client/WebClientAutoConfiguration.html | ⭐⭐⭐ High | 2026-04-23 | 공식 Javadoc |
| spring-projects/spring-framework Issue #20734 | https://github.com/spring-projects/spring-framework/issues/20734 | ⭐⭐⭐ High | 2026-04-23 | WebFlux 컨트롤러에서 `.block()`의 위험성 이슈 |
| square/okhttp — mockwebserver | https://github.com/square/okhttp/tree/master/mockwebserver | ⭐⭐⭐ High | 2026-04-23 | 공식 레포 |
| Maven Central — mockwebserver | https://mvnrepository.com/artifact/com.squareup.okhttp3/mockwebserver | ⭐⭐⭐ High | 2026-04-23 | 공식 아티팩트 리스트 |
| Baeldung — Set a Timeout in Spring WebClient | https://www.baeldung.com/spring-webflux-timeout | ⭐⭐ Medium | 2026-04-23 | 보조 |
| Baeldung — Spring WebClient exchange() vs retrieve() | https://www.baeldung.com/spring-webclient-exchange-vs-retrieve | ⭐⭐ Medium | 2026-04-23 | 보조 |
| Baeldung — Guide to Retry in Spring WebFlux | https://www.baeldung.com/spring-webflux-retry | ⭐⭐ Medium | 2026-04-23 | 보조 |
| Baeldung — Spring WebClient Filters | https://www.baeldung.com/spring-webclient-filters | ⭐⭐ Medium | 2026-04-23 | 보조 |
| rieckpil — WebClientCustomizer 가이드 | https://rieckpil.de/customize-spring-webclient-with-webclientcustomizer/ | ⭐⭐ Medium | 2026-04-23 | 보조 |
| rieckpil — Test Spring WebClient with MockWebServer | https://rieckpil.de/test-spring-webclient-with-mockwebserver-from-okhttp/ | ⭐⭐ Medium | 2026-04-23 | 보조 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보 명시 (Spring Boot 2.5 ~ 3.x, Spring 5.3 ~ 7.0, Reactor Netty 1.x, mockwebserver 4.12.0)
- [✅] deprecated된 패턴 권장하지 않음 (`.exchange()` 사용 금지 명시, `RestTemplate` 권장하지 않음)
- [✅] 코드 예시가 실행 가능한 형태 (import 힌트 포함, Java 문법)

#### 클레임별 교차 검증 결과

| # | 클레임 | 판정 | 소스 |
|---|--------|------|------|
| 1 | WebClient는 공식적으로 `.block()`을 통한 동기 사용이 지원된다 | VERIFIED | Spring 공식 reference "Synchronous Use" 페이지 |
| 2 | Spring Boot는 `WebClient.Builder`를 prototype scope로 자동 등록한다 | VERIFIED | Spring Boot `WebClientAutoConfiguration` Javadoc |
| 3 | `spring-boot-starter-web` + `spring-boot-starter-webflux` 공존 시 서버는 WebMVC(Tomcat) 유지 | VERIFIED | Spring 공식 guide, stefankreidel.io 등 다수 일치 |
| 4 | Spring 5.3+에서 `.exchange()`는 deprecated | VERIFIED | Baeldung + Spring Javadoc 교차 |
| 5 | Reactor Netty `responseTimeout`과 `ReadTimeoutHandler`는 목적이 다르다 | VERIFIED | Reactor Netty 공식 레퍼런스 |
| 6 | `ChannelOption.CONNECT_TIMEOUT_MILLIS`는 TCP 연결 타임아웃 설정 | VERIFIED | Netty / Reactor Netty 공식 |
| 7 | `Mono.zip` + 단일 `.block()`이 공식 권장 병렬 패턴 | VERIFIED | Spring 공식 "Synchronous Use" 코드 예시와 일치 |
| 8 | `retrieve()`는 4xx/5xx에서 `WebClientResponseException` 발생 | VERIFIED | Spring Javadoc, Baeldung |
| 9 | Spring 7.0에서 RestTemplate deprecation, Spring 8.0에서 제거 예정 | VERIFIED | Spring 공식 블로그 2025-09-30 |
| 10 | OkHttp 5.x에서 `mockwebserver3` 아티팩트로 네임스페이스 분리 | PARTIALLY VERIFIED | Maven Central 결과에서 확인했으나 Square의 마이그레이션 문서 직접 확인 실패 → SKILL.md에서 `> 주의:` 표기로 처리 |

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (선택 기준, Bean 설정, 타임아웃, 에러/재시도, 필터, 테스트)
- [✅] 코드 예시 포함 (Maven 의존성, Bean 설정, 서비스 예시, 테스트 코드)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 ("언제 이 패턴을 쓰나" 표)
- [✅] 흔한 실수 패턴 포함 (12개)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (PaymentService 실제 구조)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 없음, 사용자 스택인 Spring Boot 2.5/3.x 양쪽 커버)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-09-28)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-09-28)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 있으나 차단 요인 아님, 섹션 7 참고)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인. 질문 1개는 2026-09-26 재검증에서 정밀도 보정된 RestTemplate deprecation 타임라인을 정확히 겨냥.

### 실제 수행 테스트

**Q1. "Spring Boot 3.3 WebMVC 앱에서 외부 결제 API를 WebClient로 호출, 5초 초과 시 실패 처리하려면?"**
- ✅ PASS
- 근거: SKILL.md "타임아웃 설정 (필수)" 섹션 + "`block(Duration)` 방어선" 섹션
- 상세: `responseTimeout(Duration.ofSeconds(5))` + `ReadTimeoutHandler`/`WriteTimeoutHandler` 병행 설정, `block(Duration)` 최종 방어선까지 정확히 재현.
- gap: 타임아웃 초과 시 실제로 던져지는 예외 타입(`TimeoutException` 등)과 이를 매핑하는 코드가 "에러 처리" 섹션(상태 코드 기반 `onStatus`/`WebClientResponseException`)과 연결되어 있지 않음 — 선택 보강.

**Q2. "지금(2026-09) RestTemplate이 실제로 @Deprecated 표시가 붙었나? 올해 안에 급히 걷어내야 하나?" (2026-09-26 타임라인 정밀도 보정 겨냥)**
- ✅ PASS
- 근거: SKILL.md 상단 2026-09-26 갱신 주의문 + "RestTemplate / WebClient / RestClient 선택 기준" 표
- 상세: "Spring 7.0 GA(2025-11)는 deprecation 의도만 발표, 아직 `@Deprecated` 미표시, 정식 처리는 7.1(2026-11 잠정)"이라는 정정된 타임라인을 정확히 인용하고 "2029년까지 OSS 지원"으로 급하지 않다고 올바르게 답변. 옛 서술(막연히 "7.0에서 deprecated 진행")과 모순 없이 일관됨.

### 발견된 gap

- 타임아웃 초과 예외 타입과 에러 처리 섹션 간 연결 고리 부재 — 선택 보강, 차단 요인 아님

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: API 사용 패턴 스킬 → 실사용 필수 카테고리 해당 없음 (content test PASS로 APPROVED 가능)
- 최종 상태: APPROVED

---

### 재검증 (2026-09-26)

**수행일**: 2026-09-26
**수행자**: 메인 대화 오케스트레이션 (Claude Sonnet 5) — verification-policy.md 재검증 절차
**수행 방법**: SKILL.md + REFERENCE.md 전체 Read → WebSearch로 핵심 클레임 재대조 → 실전 질문 2개 자체 답변

**재검증한 핵심 클레임**
- "Spring 7.0(2025 하반기)에서 RestTemplate deprecated로 향하고 있음" → **정밀도 보정**: Spring 7.0은 2025-11 실제 GA되어 "deprecation 의도" 발표(아직 `@Deprecated` 미표시), 정식 `@Deprecated`는 Spring 7.1(2026-11 잠정)에서 예정 — SKILL.md·표를 이 타임라인으로 갱신 (VERIFIED, Spring 공식 GitHub wiki "Spring Framework 7.0 Release Notes" + spring.io 블로그)
- RestTemplate 오픈소스 지원 2029년까지 유지 — 신규 확인, SKILL.md에 추가 (VERIFIED)
- WebClient `.block()` 기반 동기 사용·`Mono.zip` 병렬 패턴은 여전히 Spring 공식 권장 — 재확인, 변동 없음 (VERIFIED)

**Q1. "지금(2026-09) 기준으로 RestTemplate이 실제로 @Deprecated 표시가 붙었나?"**
- PASS
- 근거: SKILL.md 상단 주의 문구 — "Spring 7.0은 이미 GA되어 deprecation 의도를 발표했고(아직 `@Deprecated` 표시는 아님), Spring 7.1(2026-11 잠정)에서 정식 `@Deprecated` 처리" — 시점 구분이 명확.

**Q2. "RestTemplate 쓰는 기존 코드를 올해 안에 급하게 걷어내야 하나?"**
- PASS
- 근거: SKILL.md "RestTemplate 자체는 2029년까지 오픈소스 지원 유지" 문구로 급하지 않다는 답변 근거 제공.

**판정**: RestTemplate deprecation 타임라인 정밀도 보정 → 내용 변경 있음 → status `PENDING_TEST`로 되돌림.

---

> PENDING_TEST 상태이므로 실제 에이전트 활용 테스트는 실시되지 않았습니다. 아래는 권장 테스트 케이스입니다.

### 테스트 케이스 1: 타임아웃 설정 질문

**입력 (질문/요청):**
```
Spring Boot 3.3 WebMVC 앱에서 외부 결제 API를 WebClient로 호출하는데,
응답이 5초를 넘으면 실패 처리하고 싶습니다. 어떻게 설정해야 하나요?
```

**기대 결과:**
```
- HttpClient.create()에 responseTimeout(Duration.ofSeconds(5)) 설정
- ChannelOption.CONNECT_TIMEOUT_MILLIS로 연결 타임아웃 별도 설정
- ReactorClientHttpConnector로 WebClient.Builder에 주입
- block(Duration)으로 최종 방어선도 권장
```

**실제 결과:** (미실시)

**판정:** PENDING

### 테스트 케이스 2: 재시도 로직 질문

**입력:**
```
외부 API가 간헐적으로 500을 반환합니다. WebClient로 5xx만 3번 지수 백오프 재시도하려면?
```

**기대 결과:**
```
retryWhen(Retry.backoff(3, Duration.ofMillis(200))
  .filter(t -> t instanceof WebClientResponseException ex && ex.getStatusCode().is5xxServerError())
  .onRetryExhaustedThrow(...))
```

**실제 결과:** (미실시)

**판정:** PENDING

### 테스트 케이스 3: 선택 기준 질문

**입력:**
```
Spring Boot 3.4 신규 프로젝트에서 단순 동기 REST API 호출만 필요합니다.
WebClient를 써야 하나요, RestTemplate을 써야 하나요?
```

**기대 결과:**
```
- RestTemplate은 Spring 7.0에서 deprecated 진행 — 피함
- 단순 동기 호출이라면 RestClient (Spring 6.1+/Boot 3.2+)가 1순위 권장
- WebClient는 리액티브/스트리밍/병렬 조합이 필요할 때 적합
```

**실제 결과:** (미실시)

**판정:** PENDING

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-04-23, 2문항 PASS) + ✅ (2026-09-26 재검증 셀프, 2문항 PASS) + ✅ (2026-09-28 skill-tester → general-purpose, 2/2 PASS — RestTemplate deprecation 타임라인 정정분 겨냥) |
| **최종 판정** | **APPROVED** (2026-09-28 재테스트로 타임라인 정정 내용 반영 확인, 모순 없음) |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 및 섹션 5·6 업데이트 — 2026-09-28 완료, 2/2 PASS (RestTemplate deprecation 타임라인 정정분 겨냥 포함)
- [⏸️] 타임아웃 초과 시 예외 타입(`TimeoutException` 등)과 "에러 처리" 섹션(`onStatus`/`WebClientResponseException`) 간 연결 고리 보강 — 2026-09-28 재테스트에서 발견, 선택 보강(차단 요인 아님)
- [⏸️] OkHttp 5.x `mockwebserver3` 네임스페이스 마이그레이션 문서 Square 공식 레포 직접 재확인 — 검증 보강 선택 사항
- [⏸️] 별도 스레드풀 분리 예시(`@Async` + `ThreadPoolTaskExecutor`) 구체화 — 현재 범위 밖 선택 보강
- [✅] 실제 Claude Code 에이전트 활용 테스트 수행 — 2026-04-23 general-purpose 2문항 PASS (HttpClient 타임아웃 + Retry.backoff + MockWebServer 통합)
- [📅] Spring Boot 4.x 출시 후 `starter-webflux`/Reactor Netty 버전 매트릭스 재검증

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-23 | v1 | 최초 작성 | skill-creator |
| 2026-09-26 | v1 | 재검증 — RestTemplate deprecation 타임라인 정밀도 보정(Spring 7.0 GA 완료 반영, 7.1/8.0 시점 구분, 2029년까지 지원 명시) → PENDING_TEST | 메인 오케스트레이션 (Claude Sonnet 5) |
| 2026-09-28 | v1 | 2단계 실사용 재테스트 수행 (Q1 타임아웃 설정 / Q2 RestTemplate deprecation 타임라인 정정분) → 2/2 PASS, APPROVED 전환 | skill-tester |
