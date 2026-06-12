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

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
