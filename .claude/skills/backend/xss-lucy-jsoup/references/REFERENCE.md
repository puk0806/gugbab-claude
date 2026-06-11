## 5. Lucy + jsoup 조합 패턴

### 5-1. 표준 구성

| 입력 종류 | 방어 주체 | rule XML 설정 |
|-----------|-----------|----------------|
| form 파라미터 (제목, 닉네임, 검색어) | Lucy `XssPreventerDefender` | default 적용 |
| form 파라미터 중 HTML 본문 | **Lucy 제외** + Service 레이어 jsoup | `<param name="content" useDefender="false"/>` |
| JSON `@RequestBody` 전체 | jsoup (Lucy는 form만 처리) | rule XML 무관 |
| webhook / 외부 연동 | Lucy 전체 비활성 | `<url disable="true">/api/webhook/**</url>` |

### 5-2. JSON 요청 방어 (Lucy는 적용되지 않음)

Lucy는 `HttpServletRequest.getParameter()`만 감싸므로 `@RequestBody`로 바인딩된 JSON에는 작동하지 않는다. Jackson 디시리얼라이저를 커스텀하거나 서비스 레이어에서 직접 sanitize한다.

**옵션 A: Jackson `StdScalarDeserializer` 커스텀**

```java
public class HtmlEscapeDeserializer extends StdScalarDeserializer<String> {
    public HtmlEscapeDeserializer() { super(String.class); }

    @Override
    public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String raw = p.getValueAsString();
        return raw == null ? null : Jsoup.clean(raw, Safelist.none());
    }
}

@Configuration
public class JacksonConfig {
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer xssCustomizer() {
        return builder -> builder.deserializerByType(String.class, new HtmlEscapeDeserializer());
    }
}
```

> 주의: 전역 String 디시리얼라이저는 **모든 문자열**을 sanitize하므로 URL/base64 등 의도된 특수 문자가 깨질 수 있다. 필드별 `@JsonDeserialize(using = ...)` 또는 DTO별 처리 권장.

**옵션 B: DTO/Service 레이어에서 명시적 sanitize (권장)**

필드별 의도가 명확하므로 범용 커스텀보다 예측 가능.

---

## 6. Spring Boot 2.5 vs 3.x

| 항목 | Spring Boot 2.5 (javax) | Spring Boot 3.x (jakarta) |
|------|--------------------------|----------------------------|
| Servlet API | `javax.servlet.*` | `jakarta.servlet.*` |
| Lucy 호환 | ✅ 직접 호환 (Lucy가 javax.servlet 사용) | ⚠️ **javax → jakarta 변환 필요** |
| jsoup | ✅ Java 8+ 동일 | ✅ Java 17+ 동일 |
| FilterRegistrationBean | `org.springframework.boot.web.servlet.FilterRegistrationBean` | 동일 (패키지 변경 없음) |
| Spring Security 기본 `X-XSS-Protection` | `1; mode=block` | `0` (OWASP 권고 반영) |

### 6-1. Spring Boot 3.x에서 Lucy 사용 시 대안

Lucy 2.0.1은 `javax.servlet.Filter` 구현체이므로 Spring Boot 3.x(Jakarta EE 9+)에서 **그대로는 동작하지 않는다**. 옵션:

1. **변환 (Eclipse Transformer / Tomcat migration tool)**: 빌드 타임에 javax → jakarta 바이트코드 변환. 커뮤니티에 변환 산출물을 공유하는 레포들이 있으나 공식이 아니므로 검증 필요.
2. **ServletRequestWrapper 직접 작성**: Lucy의 핵심 로직(HTML 엔티티 이스케이프)은 몇십 줄로 재구현 가능. jakarta API로 작성한 커스텀 필터 + jsoup 조합.
3. **ESAPI / OWASP Java HTML Sanitizer로 대체**: 유지보수 활발한 라이브러리.

> 주의: Spring Boot 3.x + Lucy 그대로 사용은 `ClassNotFoundException: javax.servlet.Filter`로 실패합니다. 프로젝트가 3.x라면 먼저 호환성 전략을 결정하세요.

---

## 7. Spring Security XSS 헤더

### 7-1. 현재 권장 (2026 기준)

Spring Security 6의 기본 `X-XSS-Protection: 0` 은 OWASP 권고에 따라 **의도적으로 비활성화**된 값이다. `X-XSS-Protection`은 모든 주요 브라우저에서 제거/미지원이므로 해당 헤더에 의존하지 말고 **Content-Security-Policy**로 방어한다.

### 7-2. Spring Security 6.x 설정

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filter(HttpSecurity http) throws Exception {
        http
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp.policyDirectives(
                    "default-src 'self'; " +
                    "script-src 'self' 'nonce-{generated}'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "img-src 'self' data: https:; " +
                    "object-src 'none'; " +
                    "base-uri 'self'; " +
                    "frame-ancestors 'none'"
                ))
                // X-XSS-Protection: 0 명시 (기본값이지만 가독성 위해)
                .xssProtection(xss -> xss.headerValue(
                    XXssProtectionHeaderWriter.HeaderValue.DISABLED
                ))
                .contentTypeOptions(withDefaults())    // X-Content-Type-Options: nosniff
                .frameOptions(frame -> frame.deny())   // X-Frame-Options: DENY
            );
        return http.build();
    }
}
```

### 7-3. CSP 주요 디렉티브

| 디렉티브 | 의미 | XSS 방어 기여 |
|----------|------|----------------|
| `default-src 'self'` | 모든 리소스 동일 출처만 | 외부 스크립트 차단 |
| `script-src 'self' 'nonce-xxx'` | nonce 부여된 인라인 스크립트만 허용 | 인라인 XSS 차단 (가장 강력) |
| `object-src 'none'` | `<object>`, `<embed>` 금지 | Flash 류 벡터 차단 |
| `base-uri 'self'` | `<base>` 조작 방지 | base tag injection 차단 |
| `frame-ancestors 'none'` | iframe 임베딩 금지 | 클릭재킹 차단 |

> 주의: `'unsafe-inline'`은 script-src에 절대 허용하지 않는다. 스타일은 nonce/hash 도입 전 단계적 허용 가능.

---

## 8. 대안 도구 비교

| 도구 | 포지션 | 강점 | 약점 |
|------|--------|------|------|
| **Naver Lucy** | 서블릿 필터 (파라미터) | 한국 엔터프라이즈 표준, rule XML로 URL별 제어 | 2015 이후 업데이트 드뭄, 2025-06 archived, javax.servlet 한정 |
| **jsoup Safelist** | HTML sanitize | 활발한 유지보수, 직관적 프리셋, 독립적 파서 | HTML 외 컨텍스트(JS, CSS) 처리 불가 |
| **OWASP Java Encoder** | 출력 인코더 | context-aware(HTML/Attr/JS/CSS/URL), 공식 OWASP, 경량 | sanitize가 아닌 **인코딩** 전용 |
| **OWASP Java HTML Sanitizer** | HTML sanitize | 공식 OWASP, 정책 DSL 강력, 활발한 유지보수 | jsoup 대비 학습 곡선 |
| **ESAPI (legacy)** | 종합 보안 라이브러리 | 과거 표준 | 레거시, OWASP 자체도 Java Encoder 권장으로 이동 |

**조합 권장:**
- 기존 한국 엔터프라이즈 레거시 유지 → Lucy + jsoup (본 스킬)
- 신규 Spring Boot 3.x → OWASP Java HTML Sanitizer(또는 jsoup) + OWASP Java Encoder + CSP
- 출력 시점 이스케이프는 템플릿 엔진 기본 기능(Thymeleaf `th:text`) 활용

---

## 9. 완전한 구성 예 (Spring Boot 3.x 기준, Lucy 미사용 대체안)

Lucy가 Spring Boot 3.x에서 까다로운 경우, 동등한 필터를 직접 구현하는 패턴:

```java
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

public class XssEscapeFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        chain.doFilter(new XssRequestWrapper((HttpServletRequest) req), res);
    }

    static class XssRequestWrapper extends HttpServletRequestWrapper {
        XssRequestWrapper(HttpServletRequest req) { super(req); }

        @Override
        public String getParameter(String name) {
            String raw = super.getParameter(name);
            return raw == null ? null : Jsoup.clean(raw, Safelist.none());
        }

        @Override
        public String[] getParameterValues(String name) {
            String[] raw = super.getParameterValues(name);
            if (raw == null) return null;
            String[] out = new String[raw.length];
            for (int i = 0; i < raw.length; i++) {
                out[i] = raw[i] == null ? null : Jsoup.clean(raw[i], Safelist.none());
            }
            return out;
        }
    }
}
```

```java
@Bean
public FilterRegistrationBean<XssEscapeFilter> xssEscapeFilter() {
    FilterRegistrationBean<XssEscapeFilter> reg = new FilterRegistrationBean<>();
    reg.setFilter(new XssEscapeFilter());
    reg.addUrlPatterns("/*");
    reg.setOrder(Ordered.HIGHEST_PRECEDENCE + 10);
    return reg;
}
```

URL별 제외 로직은 필터 내부에서 `request.getRequestURI()` 패턴 매칭으로 직접 구현한다(Lucy의 rule XML만큼 선언적이지는 않지만 간결).

---

## 10. 자주 하는 실수

| 실수 | 원인 | 수정 |
|------|------|------|
| Lucy 적용했으니 출력 시점 이스케이프 생략 | Lucy는 form 파라미터 한정, JSON·DB 기존 데이터는 미보호 | Thymeleaf/JSP 기본 이스케이프 유지 + CSP 병행 |
| Thymeleaf `th:utext` 사용 | `utext`는 **이스케이프 없이** 출력 | sanitize된 HTML만 `utext`에 전달하거나 `text` 사용 |
| 조회 시점에 jsoup sanitize | 매 요청마다 파싱 비용 + 불필요한 이스케이프 중복 | persist 직전에 sanitize 후 DB에 저장 |
| 서비스 레이어에서 Entity에 dirty HTML 그대로 setter | Lucy가 form만 처리했다고 신뢰 → JSON 유입분 누락 | 모든 HTML-허용 필드를 Service/DTO 단계에서 sanitize |
| Spring Boot 3.x에 Lucy 2.0.1 그대로 추가 | javax.servlet 의존으로 ClassNotFound | jakarta 변환 또는 커스텀 필터 + jsoup |
| CSP 없이 `X-XSS-Protection: 1; mode=block` 신뢰 | 모든 주요 브라우저에서 제거/deprecated | CSP 도입, X-XSS-Protection은 0 (기본값 유지) |
| `Safelist.relaxed()`에 무조건 `style` 속성 추가 | CSS 기반 XSS 벡터 (`expression`, `url(javascript:)`) | style 허용 시 CSP `style-src` 제한 필수 |
| Lucy rule XML에 HTML 본문 필드를 default defender로 방치 | `<`, `>`가 `&lt;`, `&gt;`로 변환되어 리치 에디터가 깨짐 | `<param name="content" useDefender="false"/>` + Service 단 jsoup |
| 전역 Jackson String 디시리얼라이저로 sanitize | URL, base64, 이메일 등 의도된 특수문자까지 변형 | 필드별 `@JsonDeserialize` 또는 DTO 레이어 명시 처리 |
| `preserveRelativeLinks(true)` 무심결 사용 | 과거 XSS 우회 벡터 존재 (jsoup 1.15.3에서 패치) | 기본값 `false` 유지, 상대 경로가 꼭 필요하면 jsoup 최신 버전 사용 |
| 쿠키에 `HttpOnly` 누락 | XSS로 세션 쿠키 탈취 가능 | `Set-Cookie` 헤더에 `HttpOnly; Secure; SameSite=Lax` |
| `@RequestBody`에 `@Valid`만 걸고 XSS 검증 생략 | `@Valid`는 타입·범위 검증, HTML 살균 아님 | 별도 sanitize 단계 필수 |
