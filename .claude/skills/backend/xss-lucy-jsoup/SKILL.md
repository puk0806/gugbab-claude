---
name: xss-lucy-jsoup
description: Spring Boot XSS 방어 패턴 - Naver Lucy XSS Servlet Filter(요청 파라미터 레벨) + jsoup Safelist(HTML 본문 sanitize) 조합. Spring Boot 2.5 / 3.x 양쪽, FilterRegistrationBean 등록, rule XML 설정, CSP 헤더, 한국 엔터프라이즈 실무 패턴
---

# Spring Boot XSS 방어 — Lucy Servlet Filter + jsoup Safelist

> 소스:
> - https://github.com/naver/lucy-xss-servlet-filter
> - https://github.com/naver/lucy-xss-servlet-filter/blob/master/doc/manual.md
> - https://jsoup.org/cookbook/cleaning-html/safelist-sanitizer
> - https://jsoup.org/apidocs/org/jsoup/safety/Safelist
> - https://docs.spring.io/spring-security/reference/servlet/exploits/headers.html
> - https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
>
> 검증일: 2026-04-22

> 주의: `com.navercorp.lucy:lucy-xss-servlet` 레포는 2025-06-09 GitHub에서 **archived** 상태로 전환되었습니다. 최신 버전은 2.0.1 (Maven Central)이며 2.0.0(2015-05-15) 이후 신규 기능 추가는 드뭅니다. 신규 프로젝트라면 OWASP Java Encoder + jsoup + Content-Security-Policy 조합도 함께 검토하세요. 다만 한국 엔터프라이즈에서 Lucy는 여전히 널리 사용 중이며, 서블릿 파라미터 레벨 방어에는 충분히 안정적입니다.

> 주의: jsoup 버전은 공식 Maven Central(https://central.sonatype.com/artifact/org.jsoup/jsoup/versions)에서 최신 안정 버전 확인 후 사용하세요. 본 문서는 1.18.3 (LTS성) 및 최신 1.22.x 계열을 기준으로 합니다. Safelist API는 1.14.2부터 안정적이며 이전의 `Whitelist`(deprecated)와 호환됩니다.

---

## 1. XSS 위협 개요

| 유형 | 설명 | 주요 진입점 |
|------|------|-------------|
| Reflected | 요청 파라미터가 그대로 응답에 반사 | GET/POST 파라미터 → 즉시 렌더 |
| Stored | 악성 스크립트가 DB에 저장 후 다른 사용자에게 노출 | 게시글 본문, 댓글, 닉네임 |
| DOM-based | 서버 왕복 없이 클라이언트 JS가 DOM에 주입 | `location.hash`, `document.write` |

**서버 사이드 방어 원칙 (OWASP XSS Prevention Cheat Sheet):**
1. 입력 검증(whitelist) + 출력 시점 context-aware 이스케이프 (HTML / attribute / JS / CSS / URL)
2. rich text(HTML 허용 필드)는 반드시 sanitize(allowlist 기반)
3. Content-Security-Policy로 브라우저 레벨 방어 추가
4. 쿠키에 `HttpOnly`, `Secure`, `SameSite` 설정

본 스킬은 서버 사이드(2번·일부 1번) 방어에 집중한다.

---

## 2. 방어 레이어 매핑

```
[Client Request]
     │
     ▼
┌─────────────────────────────────────────┐
│ (A) Lucy XSS Servlet Filter             │  ← 요청 파라미터(form/query)
│     - request.getParameter(…) 인터셉트  │    HTML 엔티티 이스케이프
│     - ServletRequestWrapper 형태        │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ Controller / Service                    │
│                                         │
│ (B) jsoup Safelist sanitize             │  ← HTML 본문(게시판, 댓글 rich text)
│     - Jsoup.clean(dirty, safelist)      │    태그/속성 allowlist 기반
│     - JSON body, RequestBody 대상       │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ DB Persist                              │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ (C) 출력 시점                           │  ← Thymeleaf `th:text` 기본 이스케이프
│     - Thymeleaf / JSP <c:out> / React   │    (절대 신뢰 X, sanitize 병행)
│     - HTTP 응답 헤더: CSP, HSTS 등      │
└─────────────────────────────────────────┘
```

| 레이어 | 도구 | 처리 대상 | 이유 |
|--------|------|-----------|------|
| A | Lucy Servlet Filter | form/query 파라미터 | 필터 레벨에서 일괄 처리, 애플리케이션 코드 무침투 |
| B | jsoup | 게시글 본문, 댓글 등 HTML 허용 필드 | Lucy는 HTML 본문을 완전 제거하지 않고 이스케이프만 하므로 rich text엔 부적합 |
| C | 템플릿 엔진 + CSP | 렌더링 | 다중 방어 |

**Lucy는 요청 파라미터 보호, jsoup은 HTML 본문 sanitize.** 둘은 역할이 겹치지 않고 보완적이다.

---

## 3. Naver Lucy XSS Servlet Filter

### 3-1. 의존성

```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.navercorp.lucy</groupId>
    <artifactId>lucy-xss-servlet</artifactId>
    <version>2.0.1</version>
</dependency>
```

```gradle
// build.gradle
implementation 'com.navercorp.lucy:lucy-xss-servlet:2.0.1'
```

> 주의: Lucy는 `jakarta.servlet` 이 아닌 `javax.servlet` API에 의존합니다. **Spring Boot 3.x (Jakarta EE 9+)** 환경에서는 별도 대응이 필요할 수 있습니다 (아래 6절 참고).

### 3-2. 동작 방식

- `XssEscapeServletFilter`가 `HttpServletRequest`를 래핑
- `request.getParameter(…)` / `getParameterValues(…)` / `getParameterMap()` 호출 시점에 defender가 값을 필터링
- URL 호출 시점이 아니라 **파라미터 접근 시점**에 변환되므로 `@RequestBody`(JSON)에는 **적용되지 않는다**

### 3-3. lucy-xss-servlet-filter-rule.xml (`src/main/resources/` 루트)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<config xmlns="http://www.navercorp.com/lucy-xss-servlet">

    <!-- 1. defender 정의: 어떤 방식으로 필터링할지 -->
    <defenders>
        <defender>
            <name>xssPreventerDefender</name>
            <class>com.navercorp.lucy.security.xss.servletfilter.defender.XssPreventerDefender</class>
        </defender>
        <defender>
            <name>xssSaxFilterDefender</name>
            <class>com.navercorp.lucy.security.xss.servletfilter.defender.XssSaxFilterDefender</class>
            <init-param>
                <param-value>lucy-xss-sax.xml</param-value>
                <param-value>false</param-value>
            </init-param>
        </defender>
        <defender>
            <name>xssFilterDefender</name>
            <class>com.navercorp.lucy.security.xss.servletfilter.defender.XssFilterDefender</class>
            <init-param>
                <param-value>lucy-xss.xml</param-value>
                <param-value>false</param-value>
            </init-param>
        </defender>
    </defenders>

    <!-- 2. default: 규칙에 명시되지 않은 파라미터에 적용되는 기본 defender -->
    <default>
        <defender>xssPreventerDefender</defender>
    </default>

    <!-- 3. global: 모든 URL에서 필터링 제외할 파라미터 -->
    <global>
        <params>
            <param name="csrfToken" useDefender="false"/>
            <param name="_method"   useDefender="false"/>
            <!-- 접두어 매칭 -->
            <param name="dummy_" usePrefix="true" useDefender="false"/>
        </params>
    </global>

    <!-- 4. url-rule-set: URL 패턴별 세부 규칙 -->
    <url-rule-set>
        <!-- 4-1. 특정 URL 전체 필터링 비활성화 -->
        <url-rule>
            <url disable="true">/api/webhook/**</url>
        </url-rule>

        <!-- 4-2. 특정 URL에서 일부 파라미터만 제외 -->
        <url-rule>
            <url>/board/write</url>
            <params>
                <param name="content" useDefender="false"/>  <!-- 본문은 jsoup으로 별도 처리 -->
                <param name="title">
                    <defender>xssPreventerDefender</defender>
                </param>
            </params>
        </url-rule>

        <!-- 4-3. 풍부한 HTML 허용이 필요한 필드는 SAX defender -->
        <url-rule>
            <url>/editor/save</url>
            <params>
                <param name="htmlBody">
                    <defender>xssSaxFilterDefender</defender>
                </param>
            </params>
        </url-rule>
    </url-rule-set>
</config>
```

### 3-4. defender 3종 비교

| Defender | 동작 | 용도 |
|----------|------|------|
| `XssPreventerDefender` | `<`, `>`, `&`, `"`, `'`를 HTML 엔티티로 **이스케이프**(태그 자체 유지) | 일반 파라미터 기본값 |
| `XssSaxFilterDefender` | SAX 기반으로 태그를 파싱 후 `lucy-xss-sax.xml` 화이트리스트에 따라 허용/제거. 메모리 효율적 | 대용량 HTML 입력, 스트리밍 |
| `XssFilterDefender` | DOM 기반 파싱 후 `lucy-xss.xml` 화이트리스트 적용 | 작은 HTML, 정밀한 구조 제어 |

### 3-5. Spring Boot FilterRegistrationBean 등록

레거시 `web.xml` 대신 Spring Boot에서는 Java config로 등록한다.

```java
package com.example.config;

import com.navercorp.lucy.security.xss.servletfilter.XssEscapeServletFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

@Configuration
public class XssFilterConfig {

    @Bean
    public FilterRegistrationBean<XssEscapeServletFilter> xssEscapeServletFilter() {
        FilterRegistrationBean<XssEscapeServletFilter> reg = new FilterRegistrationBean<>();
        reg.setFilter(new XssEscapeServletFilter());
        reg.addUrlPatterns("/*");
        reg.setName("xssEscapeServletFilter");
        // 인코딩 필터 뒤에 배치 — Spring의 CharacterEncodingFilter order보다 크게
        reg.setOrder(Ordered.HIGHEST_PRECEDENCE + 10);
        return reg;
    }
}
```

- `CharacterEncodingFilter` **이후**에 등록되어야 한다 (인코딩이 먼저 확정되어야 필터링 정확).
- `/*` 패턴으로 전체 요청 적용, 세부 제외는 rule XML에서 처리.

### 3-6. 레거시 web.xml 등록 (WAR 배포)

```xml
<!-- WEB-INF/web.xml -->
<filter>
    <filter-name>xssEscapeServletFilter</filter-name>
    <filter-class>com.navercorp.lucy.security.xss.servletfilter.XssEscapeServletFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>xssEscapeServletFilter</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```

---

## 4. jsoup Safelist — HTML 본문 Sanitize

### 4-1. 의존성

```xml
<dependency>
    <groupId>org.jsoup</groupId>
    <artifactId>jsoup</artifactId>
    <version>1.18.3</version>  <!-- 또는 최신 1.22.x -->
</dependency>
```

```gradle
implementation 'org.jsoup:jsoup:1.18.3'
```

> 주의: Safelist API는 jsoup 1.14.2부터 이름이 바뀌었으며, 이전의 `org.jsoup.safety.Whitelist`는 deprecated됐습니다. 신규 코드는 `org.jsoup.safety.Safelist`를 사용하세요.

### 4-2. Safelist 프리셋 5종

| 메서드 | 허용 태그 | 용도 |
|--------|-----------|------|
| `Safelist.none()` | (없음, 텍스트만) | 태그를 전부 제거하고 텍스트만 남김 |
| `Safelist.simpleText()` | `b, em, i, strong, u` | 채팅, 짧은 코멘트 |
| `Safelist.basic()` | `a, b, blockquote, br, cite, code, dd, dl, dt, em, i, li, ol, p, pre, q, small, span, strike, strong, sub, sup, u, ul` (링크 + 인용, `rel="nofollow"` 강제) | 일반 댓글 |
| `Safelist.basicWithImages()` | `basic()` + `img` (src http/https만) | 이미지 포함 댓글·설명 |
| `Safelist.relaxed()` | 테이블·헤딩 포함한 넓은 구조 HTML (`h1-h6, table, thead, tbody, tr, td, ...`) | 게시판 본문 (rich text editor) |

모두 공통으로 `<script>`, `<iframe>`, `<object>`, `<embed>`, 인라인 이벤트 핸들러(`onclick` 등), `javascript:` URL은 **제거**한다.

### 4-3. 기본 사용

```java
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

public class HtmlSanitizer {

    // 게시판 본문: 풍부한 HTML 허용
    public static String sanitizeRichText(String dirtyHtml) {
        if (dirtyHtml == null) return null;
        return Jsoup.clean(dirtyHtml, Safelist.relaxed());
    }

    // 댓글: 기본 텍스트 + 링크
    public static String sanitizeComment(String dirtyHtml) {
        if (dirtyHtml == null) return null;
        return Jsoup.clean(dirtyHtml, Safelist.basic());
    }

    // 닉네임·제목: 태그 제거, 텍스트만
    public static String stripHtml(String dirty) {
        if (dirty == null) return null;
        return Jsoup.clean(dirty, Safelist.none());
    }
}
```

### 4-4. 커스텀 Safelist

rich text editor(TinyMCE, CKEditor 등)가 생성하는 HTML에 맞춰 확장.

```java
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

public class EditorSanitizer {

    private static final Safelist EDITOR_SAFELIST = Safelist.relaxed()
            // 태그 추가
            .addTags("figure", "figcaption", "hr")
            // 속성 허용
            .addAttributes("img", "data-src", "loading", "srcset")
            .addAttributes("a", "target", "rel")
            .addAttributes(":all", "class", "style")  // 모든 태그에 class/style 허용
            // URL 프로토콜 제한
            .addProtocols("img", "src", "http", "https", "data")  // data: URI는 신중히
            .addProtocols("a", "href", "http", "https", "mailto")
            // 강제 속성 (보안 목적)
            .addEnforcedAttribute("a", "rel", "nofollow noopener noreferrer");

    public static String clean(String dirty) {
        if (dirty == null) return null;
        return Jsoup.clean(dirty, EDITOR_SAFELIST);
    }
}
```

> 주의: `style` 속성을 허용하면 `background: url(javascript:...)` 같은 CSS 기반 XSS 벡터가 생길 수 있다. jsoup은 style 내부 값을 검사하지 않으므로, style 허용 시에는 CSP의 `style-src` 제한을 반드시 병행한다.

### 4-5. `preserveRelativeLinks` 주의

```java
Safelist safelist = Safelist.basic().preserveRelativeLinks(true);
```

- 기본값은 `false`(상대 경로를 절대 경로로 강제 변환).
- `true`로 설정 시 crafted XSS 우회 가능성이 과거 보고됨 (GHSA-gp7f-rwcx-9369). **1.15.3 이상에서 패치**되었지만, 꼭 필요한 경우가 아니면 기본값 유지 권장.

### 4-6. 서비스 레이어 통합

```java
@Service
@RequiredArgsConstructor
public class PostService {

    private final PostMapper postMapper;

    @Transactional
    public Long writePost(PostWriteReq req) {
        // 제목: Lucy가 필터에서 이미 이스케이프했으나, 한 번 더 방어
        String safeTitle = Jsoup.clean(req.getTitle(), Safelist.none());

        // 본문: rich text이므로 Lucy는 rule XML에서 제외하고 jsoup으로만 처리
        String safeContent = Jsoup.clean(req.getContent(), Safelist.relaxed());

        Post post = Post.of(safeTitle, safeContent, currentUserId());
        postMapper.insert(post);
        return post.getId();
    }
}
```

**중요:** sanitize는 **persist 직전**에 수행한다. 조회 시점에 sanitize하면 매 요청마다 비용이 발생하고, 이미 저장된 악성 HTML이 조회 시점 실수로 통과할 수 있다. 단, 기존 DB의 데이터를 신뢰할 수 없다면 출력 시점 추가 sanitize도 검토.

---

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
