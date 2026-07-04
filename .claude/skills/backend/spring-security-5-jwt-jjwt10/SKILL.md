---
name: spring-security-5-jwt-jjwt10
description: Spring Security 5.5.x + jjwt 0.10.7 레거시 JWT 인증 - WebSecurityConfigurerAdapter, OncePerRequestFilter, javax.servlet 환경
---

# Spring Security 5 + jjwt 0.10.x 레거시 JWT 인증

> 소스: https://docs.spring.io/spring-security/site/docs/5.5.x-SNAPSHOT/reference/html5/ | https://github.com/jwtk/jjwt/tree/0.10.7 | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.5-Release-Notes
> 검증일: 2026-07-04

> 주의: 이 스킬은 **Spring Boot 2.5.x + Spring Security 5.5.x + jjwt 0.10.7 + Java 11 + javax.\*** 레거시 환경 전용입니다.
> 신규 프로젝트는 Spring Security 6 + jjwt 0.12.x (parserBuilder, jakarta.\*) 기반 모던 스킬을 사용하세요.
> `WebSecurityConfigurerAdapter`는 Spring Security 5.7부터 deprecated되었으며, 5.5.x에서는 아직 표준 패턴입니다.

---

## 환경 전제

| 항목 | 버전 |
|------|------|
| Java | 11 |
| Spring Boot | 2.5.x (번들 Spring Security 5.5.x) |
| Spring Security | 5.5.x |
| jjwt | 0.10.7 |
| Servlet API | `javax.servlet.*` (jakarta 아님) |

> 주의: Spring Boot 2.5는 출시 시점 Spring Security 5.5.0-M2 이상을 번들합니다. 2.5.15 기준으로도 5.5.x 라인을 유지합니다. 2.6은 5.6, 2.7은 5.7로 올라갑니다.

---

## 의존성 설정

### Maven

```xml
<!-- Spring Security (Spring Boot BOM이 5.5.x 버전 관리) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- jjwt 0.10.7: api는 compile, impl/jackson은 runtime -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.10.7</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.10.7</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.10.7</version>
    <scope>runtime</scope>
</dependency>
```

### Gradle

```groovy
implementation 'org.springframework.boot:spring-boot-starter-security'

implementation 'io.jsonwebtoken:jjwt-api:0.10.7'
runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.10.7'
runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.10.7'
```

> 주의: `jjwt-impl`과 `jjwt-jackson`은 반드시 `runtime` 스코프로 선언합니다. `jjwt-api` 외부 API의 하위 호환성 보증을 위해 impl 패키지는 런타임에만 노출됩니다.

---

## WebSecurityConfigurerAdapter 설정 클래스

레거시 Security 5.5.x의 핵심 패턴은 `WebSecurityConfigurerAdapter`를 상속하고 세 개의 `configure(...)` 메서드를 오버라이드하는 것입니다.

```java
package com.example.security.config;

import javax.servlet.http.HttpServletResponse; // javax 네임스페이스

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    private final UserDetailsService userDetailsService;
    private final JwtProvider jwtProvider;
    private final AuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final AccessDeniedHandler jwtAccessDeniedHandler;

    // 1) AuthenticationManager: UserDetailsService + PasswordEncoder 연결
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService)
            .passwordEncoder(passwordEncoder());
    }

    // 2) AuthenticationManager를 Bean으로 노출 (로그인 엔드포인트에서 주입용)
    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    // 3) WebSecurity: 정적 리소스·Swagger 등 필터 체인 자체를 건너뛸 경로
    @Override
    public void configure(WebSecurity web) {
        web.ignoring()
           .antMatchers("/h2-console/**", "/favicon.ico",
                        "/swagger-ui/**", "/v3/api-docs/**");
    }

    // 4) HttpSecurity: 실제 인가·필터 구성
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable()                                       // REST API: CSRF 불필요
            .httpBasic().disable()
            .formLogin().disable()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // 세션 사용 안 함
            .and()
            .exceptionHandling()
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)  // 401
                .accessDeniedHandler(jwtAccessDeniedHandler)            // 403
            .and()
            .authorizeRequests()
                .antMatchers("/api/auth/**", "/api/public/**").permitAll()
                .antMatchers(HttpMethod.GET, "/api/posts/**").permitAll()
                .antMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().hasRole("USER")
            .and()
            // JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 등록
            .addFilterBefore(new JwtAuthenticationFilter(jwtProvider),
                             UsernamePasswordAuthenticationFilter.class);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

**핵심 포인트:**

- `@EnableWebSecurity`는 `WebSecurityConfigurerAdapter`와 함께 있을 때 필수
- `authenticationManagerBean()`을 `@Bean`으로 노출해야 다른 컴포넌트에서 `AuthenticationManager`를 주입받을 수 있음 (예: 로그인 컨트롤러)
- `sessionCreationPolicy(STATELESS)`로 HTTP 세션을 끄면 SecurityContext가 요청 간 유지되지 않음 → JWT로 매 요청 인증
- `hasRole("USER")`는 내부적으로 `ROLE_USER` 권한으로 확장됨. `GrantedAuthority` 값을 저장할 때 `ROLE_` 접두사 포함 여부에 주의

---

## JwtAuthenticationFilter (OncePerRequestFilter)

```java
package com.example.security.filter;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String BEARER_PREFIX = "Bearer ";

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String token = resolveToken(request);

        if (StringUtils.hasText(token) && jwtProvider.validateToken(token)) {
            Authentication authentication = jwtProvider.getAuthentication(token);
            // SecurityContextHolder에 인증 정보 주입 → 이후 컨트롤러·@PreAuthorize에서 사용
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.debug("Set authentication for '{}' : {}", authentication.getName(), request.getRequestURI());
        }

        chain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}
```

**핵심 포인트:**

- `OncePerRequestFilter`는 Spring이 요청당 정확히 한 번 실행을 보장. forward/include 시 중복 실행 방지
- 검증 실패 시 예외를 던지지 말고 조용히 체인을 이어간다 → `SecurityContextHolder`가 비어있으면 이후 인가 단계에서 `AuthenticationEntryPoint`가 401을 반환
- `SecurityContextHolder`에 주입하는 `Authentication`은 `UsernamePasswordAuthenticationToken` 또는 커스텀 토큰. 반드시 `setAuthenticated(true)` 또는 권한 인자 생성자 사용

---

## JwtProvider 유틸 클래스 (jjwt 0.10.7 API)

```java
package com.example.security.jwt;

import java.security.Key;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class JwtProvider {

    private static final String AUTHORITIES_KEY = "auth";
    private static final long ACCESS_TOKEN_VALIDITY_MS = 30 * 60 * 1000L; // 30분

    @Value("${jwt.secret}") // Base64 인코딩된 256-bit 이상 키
    private String secretBase64;

    private Key key;

    @PostConstruct
    public void init() {
        byte[] keyBytes = Decoders.BASE64.decode(secretBase64);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        // 주의: HS256은 최소 256-bit (32 byte) 키 필요. 부족하면 WeakKeyException.
    }

    // 토큰 생성
    public String createToken(Authentication authentication) {
        String authorities = authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.joining(","));

        long now = System.currentTimeMillis();
        Date expiry = new Date(now + ACCESS_TOKEN_VALIDITY_MS);

        return Jwts.builder()
            .setSubject(authentication.getName())
            .claim(AUTHORITIES_KEY, authorities)
            .setIssuedAt(new Date(now))
            .setExpiration(expiry)
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    // 토큰 검증
    public boolean validateToken(String token) {
        try {
            // 0.10.x: Jwts.parser().setSigningKey(key).parseClaimsJws(token)
            //         0.11부터는 parserBuilder().setSigningKey(key).build() 로 변경됨
            Jwts.parser().setSigningKey(key).parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.debug("Expired JWT token");
        } catch (MalformedJwtException | SecurityException e) {
            log.debug("Invalid JWT signature or format");
        } catch (UnsupportedJwtException e) {
            log.debug("Unsupported JWT token");
        } catch (IllegalArgumentException e) {
            log.debug("JWT claims string is empty");
        }
        return false;
    }

    // 토큰에서 Authentication 복원
    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parser()
            .setSigningKey(key)
            .parseClaimsJws(token)
            .getBody();

        String authoritiesStr = claims.get(AUTHORITIES_KEY, String.class);
        Collection<? extends GrantedAuthority> authorities = (authoritiesStr == null || authoritiesStr.isEmpty())
            ? java.util.Collections.emptyList()
            : Arrays.stream(authoritiesStr.split(","))
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

        User principal = new User(claims.getSubject(), "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    public String getUsername(String token) {
        return Jwts.parser()
            .setSigningKey(key)
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
}
```

**jjwt 0.10.7 API 요약:**

| 작업 | API |
|------|-----|
| 빌더 시작 | `Jwts.builder()` |
| 키 생성 | `Keys.hmacShaKeyFor(byte[])` (최소 256-bit) |
| 알고리즘 지정 | `signWith(key, SignatureAlgorithm.HS256)` |
| 파서 (0.10.x) | `Jwts.parser().setSigningKey(key).parseClaimsJws(token)` |
| 파서 (0.11+) | `Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token)` ← 0.10.7은 **사용 불가** |

> 주의: 0.10.x의 `Jwts.parser()`는 thread-safe가 보장되지 않습니다. 0.11부터 `parserBuilder()`로 immutable 파서가 도입되었으며, 가능하면 요청마다 파싱 인스턴스를 지역 변수로 사용하세요.

> 주의: 시크릿 키는 환경변수·Vault에서 주입하고 프로퍼티 파일에 평문으로 두지 마세요. Base64 디코딩 전 길이가 HS256 기준 256-bit 이상인지 확인합니다.

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
