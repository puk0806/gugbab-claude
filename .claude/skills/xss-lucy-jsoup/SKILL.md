---
name: xss-lucy-jsoup
description: Naver Lucy XSS Servlet Filter + jsoup Safelist 레거시 XSS 방어의 함정 — Lucy 2.0.1 archived·javax.servlet 전용(SB 3 ClassNotFound)·@RequestBody(JSON) 미적용, rule XML(default·global·url-rule·useDefender=false) 핵심, defender 3종, CharacterEncodingFilter 이후 등록, jsoup 1.24.1 셀렉터 주의·Whitelist→Safelist, style 허용 CSS 벡터, preserveRelativeLinks GHSA, persist 직전 sanitize, X-XSS-Protection 기본값 차이, 전역 Jackson 디시리얼라이저 부작용, SB 3 대안
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
> 검증일: 2026-11-09 (재검증, 최초 2026-04-22 · 이전 재검증 2026-09-26)

> 주의: `com.navercorp.lucy:lucy-xss-servlet` 레포는 2025-06-09 GitHub에서 **archived** 상태로 전환되었습니다. 최신 버전은 2.0.1 (Maven Central)이며 2.0.0(2015-05-15) 이후 신규 기능 추가는 드뭅니다. 신규 프로젝트라면 OWASP Java Encoder + jsoup + Content-Security-Policy 조합도 함께 검토하세요. 다만 한국 엔터프라이즈에서 Lucy는 여전히 널리 사용 중이며, 서블릿 파라미터 레벨 방어에는 충분히 안정적입니다. (2026-09-26 재검증: archived 상태·2.0.1 최신 버전 변경 없음 확인)

> 주의: jsoup 버전은 공식 Maven Central(https://central.sonatype.com/artifact/org.jsoup/jsoup/versions)에서 최신 안정 버전 확인 후 사용하세요. 본 문서는 1.18.3 (LTS성) 및 최신 1.24.x 계열을 기준으로 합니다. Safelist API는 1.14.2부터 안정적이며 이전의 `Whitelist`(deprecated)와 호환됩니다.
>
> 주의(2026-11-09 재검증): jsoup 최신 버전은 **1.24.1**(2026-11-03)입니다. 1.24.1의 변경은 CSS 셀렉터(opt-in "Web query mode", 1.25.1에서 기본값 예정)·HTML 파서 표준 정렬 위주이고, `Safelist` 프리셋(`none/simpleText/basic/basicWithImages/relaxed`)·`addTags/addAttributes/addProtocols/addEnforcedAttribute`·`Jsoup.clean` API는 변경 없이 그대로 유효합니다. `preserveRelativeLinks` 관련 GHSA-gp7f-rwcx-9369 패치도 유지됩니다. 단, 같은 프로젝트에서 jsoup 셀렉터(`select()`)로 HTML을 파싱·추출하고 있다면 1.24.1 업그레이드 전 셀렉터 마이그레이션 가이드(https://jsoup.org/news/selector-migration)를 확인하세요.

---

## 이 스킬의 범위

XSS 유형·OWASP 원칙·CSP 디렉티브 해설·`Jsoup.clean` 기본 사용법은 공식 문서 수준이라 싣지 않는다. 여기엔 **한국 레거시에서 쓰는 Lucy 필터의 설정·한계와 jsoup 조합의 함정**만 둔다. 역할 분담: Lucy = form/query 파라미터 이스케이프, jsoup = HTML 허용 본문 sanitize, 출력 시점 = 템플릿 이스케이프 + CSP.

---

## 1. Lucy XSS Servlet Filter

- 좌표 `com.navercorp.lucy:lucy-xss-servlet:2.0.1`, 필터 클래스 `com.navercorp.lucy.security.xss.servletfilter.XssEscapeServletFilter`, 설정 파일 `src/main/resources/lucy-xss-servlet-filter-rule.xml`.
- `HttpServletRequest`를 래핑해 `getParameter`/`getParameterValues`/`getParameterMap` **호출 시점**에 필터링한다 → **`@RequestBody`(JSON)에는 적용되지 않는다.**
- Boot에선 `FilterRegistrationBean`으로 `/*` 등록, **`CharacterEncodingFilter` 이후** 순서(예: `Ordered.HIGHEST_PRECEDENCE + 10`) — 인코딩이 먼저 확정돼야 정확하다. WAR는 `web.xml` `<filter>`로.

> 주의: Lucy는 `jakarta.servlet` 이 아닌 `javax.servlet` API에 의존합니다. **Spring Boot 3.x (Jakarta EE 9+)** 환경에서는 별도 대응이 필요할 수 있습니다 (아래 4절 참고).

### rule XML 핵심 (namespace `http://www.navercorp.com/lucy-xss-servlet`)

```xml
<config xmlns="http://www.navercorp.com/lucy-xss-servlet">
    <defenders>  <!-- name + class (+ init-param: lucy-xss-sax.xml / lucy-xss.xml, false) -->
        <defender>
            <name>xssPreventerDefender</name>
            <class>com.navercorp.lucy.security.xss.servletfilter.defender.XssPreventerDefender</class>
        </defender>
    </defenders>
    <default><defender>xssPreventerDefender</defender></default>   <!-- 규칙 없는 파라미터 -->
    <global><params>                                               <!-- 모든 URL 공통 제외 -->
        <param name="csrfToken" useDefender="false"/>
        <param name="dummy_" usePrefix="true" useDefender="false"/>
    </params></global>
    <url-rule-set>
        <url-rule><url disable="true">/api/webhook/**</url></url-rule>   <!-- URL 전체 비활성 -->
        <url-rule><url>/board/write</url><params>
            <param name="content" useDefender="false"/>                  <!-- 본문은 jsoup 으로 -->
        </params></url-rule>
    </url-rule-set>
</config>
```

| Defender | 동작 | 용도 |
|----------|------|------|
| `XssPreventerDefender` | `<`, `>`, `&`, `"`, `'`를 HTML 엔티티로 **이스케이프**(태그 자체 유지) | 일반 파라미터 기본값 |
| `XssSaxFilterDefender` | SAX 기반으로 태그를 파싱 후 `lucy-xss-sax.xml` 화이트리스트에 따라 허용/제거. 메모리 효율적 | 대용량 HTML 입력, 스트리밍 |
| `XssFilterDefender` | DOM 기반 파싱 후 `lucy-xss.xml` 화이트리스트 적용 | 작은 HTML, 정밀한 구조 제어 |

함정: HTML 본문 필드를 default defender에 두면 `<`·`>`가 `&lt;`·`&gt;`로 바뀌어 **리치 에디터가 깨진다** → `useDefender="false"` + 서비스 단 jsoup.

---

## 2. jsoup Safelist 함정

> 주의: Safelist API는 jsoup 1.14.2부터 이름이 바뀌었으며, 이전의 `org.jsoup.safety.Whitelist`는 deprecated됐습니다. 신규 코드는 `org.jsoup.safety.Safelist`를 사용하세요.

- 프리셋: `none()`(텍스트만) · `simpleText()` · `basic()`(링크, `rel="nofollow"` 강제) · `basicWithImages()`(img src http/https) · `relaxed()`(테이블·헤딩 포함 게시판 본문). 모두 `<script>`·`<iframe>`·이벤트 핸들러·`javascript:` URL 제거.
- 에디터 확장: `addTags`·`addAttributes(":all", ...)`·`addProtocols`·`addEnforcedAttribute("a", "rel", "nofollow noopener noreferrer")`. `data:` 프로토콜 허용은 신중히.

> 주의: `style` 속성을 허용하면 `background: url(javascript:...)` 같은 CSS 기반 XSS 벡터가 생길 수 있다. jsoup은 style 내부 값을 검사하지 않으므로, style 허용 시에는 CSP의 `style-src` 제한을 반드시 병행한다.

- `preserveRelativeLinks(true)`: 기본값은 `false`(상대 경로를 절대 경로로 변환). `true`면 crafted XSS 우회가 과거 보고됨(GHSA-gp7f-rwcx-9369, **1.15.3 이상에서 패치**) — 꼭 필요하지 않으면 기본값 유지.
- sanitize는 **persist 직전**에. 조회 시점 sanitize는 매 요청 비용 + 누락 위험. 기존 DB 데이터를 신뢰할 수 없다면 출력 시점 추가 sanitize 검토.
- Thymeleaf `th:utext`는 이스케이프 없이 출력 — sanitize된 HTML만 넘긴다. `@Valid`는 HTML 살균이 아니다.

---

## 3. JSON 요청 — Lucy가 못 막는 곳

| 입력 | 방어 주체 |
|------|-----------|
| form 파라미터(제목·닉네임·검색어) | Lucy `XssPreventerDefender`(default) |
| form 파라미터 중 HTML 본문 | Lucy 제외(`useDefender="false"`) + 서비스 jsoup |
| JSON `@RequestBody` 전체 | jsoup (Lucy는 form만) |
| webhook·외부 연동 | Lucy `<url disable="true">` |

Jackson `StdScalarDeserializer<String>`로 전역 sanitize하는 방법도 있지만:

> 주의: 전역 String 디시리얼라이저는 **모든 문자열**을 sanitize하므로 URL/base64 등 의도된 특수 문자가 깨질 수 있다. 필드별 `@JsonDeserialize(using = ...)` 또는 DTO별 처리 권장.

권장은 DTO/서비스 레이어에서 필드별 명시 sanitize.

---

## 4. Spring Boot 2.5 vs 3.x

| 항목 | Spring Boot 2.5 (javax) | Spring Boot 3.x (jakarta) |
|------|--------------------------|----------------------------|
| Lucy 호환 | ✅ 직접 호환 | ⚠️ **javax → jakarta 변환 필요** |
| `FilterRegistrationBean` | `org.springframework.boot.web.servlet.FilterRegistrationBean` | 동일 |
| Spring Security 기본 `X-XSS-Protection` | `1; mode=block` | `0` (OWASP 권고 반영) |

> 주의: Spring Boot 3.x + Lucy 그대로 사용은 `ClassNotFoundException: javax.servlet.Filter`로 실패합니다. 프로젝트가 3.x라면 먼저 호환성 전략을 결정하세요.

SB 3 대안: ① Eclipse Transformer / Tomcat migration tool로 빌드 타임 javax→jakarta 변환(커뮤니티 산출물은 비공식 — 검증 필요) ② jakarta `HttpServletRequestWrapper` 커스텀 필터(`getParameter`/`getParameterValues`를 `Jsoup.clean(raw, Safelist.none())`로) + URL 제외는 `getRequestURI()` 매칭 ③ OWASP Java HTML Sanitizer(+ OWASP Java Encoder)로 대체.

`X-XSS-Protection`은 모든 주요 브라우저에서 제거/미지원 — 의존하지 말고 CSP로 방어한다(`script-src`에 `'unsafe-inline'` 금지). 세션 쿠키엔 `HttpOnly; Secure; SameSite`.
