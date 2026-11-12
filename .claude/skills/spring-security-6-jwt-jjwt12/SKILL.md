---
name: spring-security-6-jwt-jjwt12
description: Spring Boot 3.x + Spring Security 6.5 + jjwt 0.12.x/0.13 JWT 인증 — 버전 매트릭스(Security 7 authorizeRequests·.and() 제거, SB 3.5 EOL), jjwt 3모듈 의존성, JwtException을 401로 처리하는 필터, jjwt 0.10→0.12 API 대응표, DaoAuthenticationProvider 6.5 생성자 변경
---

# Spring Security 6 + JWT (jjwt 0.12.x) 모던 인증 패턴

> 소스: https://docs.spring.io/spring-security/reference/servlet/ | https://github.com/jwtk/jjwt | https://spring.io/projects/spring-boot
> 검증일: 2026-11-09

> 주의: 이 문서는 Spring Boot 3.5.x + Spring Security 6.5.x + jjwt 0.12.7 (또는 0.13.0) + Java 17+ 기준입니다. Spring Boot 3.5는 2026-06-30 OSS EOL(최종 패치 3.5.16)이며, Spring Security 6.5는 3개 동시 지원 라인 중 하나로 계속 OSS 지원됩니다(공식 종료일 미확정 — 최소 12개월 지원 원칙, 2026-09 기준 현역).
> **주의(2026-11-09 재검증)**: 2026-11 기준 **Spring Boot 4.1.2(Spring Security 7.1.2 번들)이 현행 최신 GA 라인**입니다. Spring Security **7.0에서 `authorizeRequests()`와 `.and()` 체이닝이 실제로 제거**되었습니다(본 스킬 작성 시점엔 "제거 예정"으로 기술 — 현재는 기정사실). 본 스킬의 코드 예시는 처음부터 `authorizeHttpRequests()` + 람다 DSL만 사용하므로 **코드 변경은 불필요**하지만, Boot 4.x/Security 7.x로 넘어가는 신규 프로젝트는 별도 최신 스킬 확인을 권장합니다. 레거시 Spring Security 5.x/`WebSecurityConfigurerAdapter` 패턴은 별도 스킬을 참조하세요.

---

## 적용 범위

| 항목 | 최소 버전 | 권장 버전 (2026-11 기준, 본 스킬 대상 라인) |
|------|-----------|--------------------------|
| Java | 17 | 21 (Virtual Threads 사용 시) |
| Spring Boot | 3.2 | 3.5.16 (3.5 라인 최신 패치. **2026-11 기준 현행 최신 GA는 4.1.2 — 별도 최신 스킬 확인 권장**) |
| Spring Security | 6.2 | 6.5.11 (Boot 3.5.16에 번들. **2026-11 기준 현행 최신은 7.1.2**) |
| jjwt | 0.12.0 | 0.12.7 (또는 0.13.0 — 0.13.0은 자체적으로 "legacy" 표기, 신규 개발은 0.14.0+에서 진행) |
| Jakarta Servlet | 5.0+ (`jakarta.servlet`) | 6.0 (Boot 3.x 기본) |

> 주의: `javax.servlet.*` 패키지는 Spring Boot 3.x에서 제거되었습니다. 반드시 `jakarta.servlet.*`를 사용합니다.

---

## 의존성 설정

### Gradle (Kotlin DSL)

```kotlin
dependencies {
    // Spring Boot 3.x 번들에 Security 6.x 포함
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-web")

    // jjwt 0.12.x — 3개 모듈 분리
    implementation("io.jsonwebtoken:jjwt-api:0.12.7")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.7")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.7")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
}
```

> 주의: jjwt 0.12.x는 `jjwt-api`, `jjwt-impl`, `jjwt-jackson` 3개 모듈로 분리되어 있습니다. 단일 `jjwt` 아티팩트는 legacy입니다. `impl`과 `jackson`은 반드시 `runtime` 스코프로 선언합니다.

---

## SecurityFilterChain — 버전 주의

- **`authorizeHttpRequests()`**: Security 6에서 deprecated된 `authorizeRequests()`의 대체. **Spring Security 7.0(2026-09 기준 GA)에서 `authorizeRequests()`와 `.and()` 체이닝이 실제로 제거**되어 람다 DSL만 허용됩니다.

---

## JwtAuthenticationFilter — OncePerRequestFilter 상속

`jakarta.servlet.*` 네임스페이스를 사용합니다. `javax.servlet.*`는 금지입니다.

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        try {
            final String username = jwtService.extractUsername(jwt);   // 만료·위조·형식 오류면 JwtException

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
            // 잘못된 토큰은 인증 없이 통과시킨다 → 이후 인가 단계에서 AuthenticationEntryPoint가 401 반환
            SecurityContextHolder.clearContext();
        }
        filterChain.doFilter(request, response);
    }
}
```

> 주의(2026-11-09 재검증): `parseSignedClaims()`는 만료(`ExpiredJwtException`)·서명 위조(`SignatureException`)·형식 오류(`MalformedJwtException`) 시 모두 `JwtException` 계열을 던집니다. 이 필터는 `ExceptionTranslationFilter`보다 앞에 있으므로 잡지 않으면 401이 아니라 500(또는 컨테이너 오류 응답)이 됩니다 — 위 예시처럼 `try/catch`로 감싸 인증 없이 통과시킵니다.

> 주의: 이 필터를 `@Component`로 등록하면 서블릿 컨테이너가 자동으로도 실행하려 할 수 있습니다. 스프링 컨벤션 중 하나를 선택하세요.
> - **권장**: `@Component`로 선언하고 SecurityConfig에서 `addFilterBefore(...)`로 등록. Spring Security가 체인 안에서만 실행합니다.
> - **대안**: `@Component`를 제거하고 `@Bean`으로 등록 시 `FilterRegistrationBean`으로 `setEnabled(false)` 지정하여 서블릿 직접 등록 방지.

---

## jjwt 0.12.x API 변경 요약 (vs 0.10.x/0.11.x)

| 0.10.x / 0.11.x | 0.12.x |
|-----------------|--------|
| `Jwts.parserBuilder()` | `Jwts.parser()` |
| `.setSigningKey(key)` | `.verifyWith(key)` (SecretKey/PublicKey 오버로드) |
| `.parseClaimsJws(token).getBody()` | `.parseSignedClaims(token).getPayload()` |
| `.setSubject(...)`, `.setIssuedAt(...)`, `.setExpiration(...)` | `.subject(...)`, `.issuedAt(...)`, `.expiration(...)` |
| `.setClaims(map)` | `.claims(map)` |
| `.signWith(SignatureAlgorithm.HS256, key)` | `.signWith(key)` (알고리즘 자동 선택) |

> 주의: `SignatureAlgorithm` enum은 0.12.x에서 deprecated되었습니다. `signWith(SecretKey)`는 키 크기에 따라 HS256/HS384/HS512를 자동 선택합니다. 명시적으로 지정하려면 `signWith(key, Jwts.SIG.HS256)`.

> 주의: `Keys.hmacShaKeyFor(byte[])`는 32바이트(256비트) 미만의 키가 전달되면 `WeakKeyException`을 던집니다. RFC 7518 §3.2 준수를 위함입니다.

---

## DaoAuthenticationProvider — 버전별 생성 방식

```java
@Bean
public AuthenticationProvider authenticationProvider() {
    // Security 6.5+ / 7.x: UserDetailsService는 생성자로 전달
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService());
    authProvider.setPasswordEncoder(passwordEncoder());
    return authProvider;
}
```

> 주의(2026-11-09 재검증): `DaoAuthenticationProvider(UserDetailsService)` 생성자는 **6.5에서 추가**되었고, 같은 버전에서 무인자 생성자·`setUserDetailsService()`가 deprecated, **7.x에서는 제거**되었습니다(생성자 하나만 남음). Security 6.2~6.4를 쓰는 프로젝트는 `new DaoAuthenticationProvider()` + `setUserDetailsService(...)`를 써야 합니다.

> 주의: Spring Security 5에서 사용하던 `@Autowired AuthenticationManagerBuilder auth` 패턴은 Security 6에서 권장되지 않습니다. `AuthenticationConfiguration.getAuthenticationManager()`로 Bean을 꺼내 사용하세요.

---

> 상세 레퍼런스 (버전 관련 흔한 실수·참고 자료) → [`references/REFERENCE.md`](references/REFERENCE.md)
