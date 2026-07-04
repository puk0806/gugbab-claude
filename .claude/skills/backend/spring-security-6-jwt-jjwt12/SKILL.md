---
name: spring-security-6-jwt-jjwt12
description: Spring Boot 3.x + Spring Security 6.x + jjwt 0.12.x 기반 모던 JWT 인증 패턴. SecurityFilterChain Bean, 람다 DSL, jakarta.servlet, Virtual Threads 적용
---

# Spring Security 6 + JWT (jjwt 0.12.x) 모던 인증 패턴

> 소스: https://docs.spring.io/spring-security/reference/servlet/ | https://github.com/jwtk/jjwt | https://spring.io/projects/spring-boot
> 검증일: 2026-07-04

> 주의: 이 문서는 Spring Boot 3.5.x + Spring Security 6.5.x + jjwt 0.12.7 (또는 0.13.0) + Java 17+ 기준입니다. Spring Boot 3.5는 2026-06-30 OSS EOL(최종 패치 3.5.16)이며 현행 OSS 지원 라인은 Boot 4.x입니다. 단, Spring Security 6.5는 2027-07-31까지 OSS 지원됩니다. 레거시 Spring Security 5.x/`WebSecurityConfigurerAdapter` 패턴은 별도 스킬을 참조하세요.

---

## 적용 범위

| 항목 | 최소 버전 | 권장 버전 (2026-07 기준) |
|------|-----------|--------------------------|
| Java | 17 | 21 (Virtual Threads 사용 시) |
| Spring Boot | 3.2 | 3.5.16 (3.5 라인 최종 OSS 패치) |
| Spring Security | 6.2 | 6.5.11 (Boot 3.5에 번들, OSS 지원 2027-07-31까지) |
| jjwt | 0.12.0 | 0.12.7 (또는 0.13.0) |
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

### Maven

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.7</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.7</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.7</version>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

> 주의: jjwt 0.12.x는 `jjwt-api`, `jjwt-impl`, `jjwt-jackson` 3개 모듈로 분리되어 있습니다. 단일 `jjwt` 아티팩트는 legacy입니다. `impl`과 `jackson`은 반드시 `runtime` 스코프로 선언합니다.

---

## SecurityFilterChain Bean 설정 (Security 6 필수 패턴)

Spring Security 6에서 `WebSecurityConfigurerAdapter`는 **완전히 제거**되었습니다. `@Bean SecurityFilterChain` + 람다 DSL만 사용합니다.

> **메서드 레벨 보안(`@PreAuthorize`, `@PostAuthorize`, `@Secured`) 쓰려면:** Config 클래스에 `@EnableMethodSecurity` 추가 필수. Spring Security 5.x의 `@EnableGlobalMethodSecurity(prePostEnabled = true)`는 6에서 deprecated → `@EnableMethodSecurity`가 기본값으로 prePostEnabled=true 활성화함. 활성화 후에만 Controller·Service 메서드에 `@PreAuthorize("hasRole('ADMIN')")` 등이 동작.

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // @PreAuthorize/@PostAuthorize 활성화 (prePostEnabled=true 기본)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter,
                          AuthenticationProvider authenticationProvider) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())                                   // JWT는 CSRF 불필요
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/invoices/**").hasAuthority("invoice:read")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)     // JWT는 세션 미사용
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

### 핵심 포인트

- **`authorizeHttpRequests()`**: Security 6에서 deprecated된 `authorizeRequests()`의 대체. Spring Security 7에서 람다 DSL만 허용됩니다.
- **`requestMatchers()`**: Security 5의 `antMatchers()`/`mvcMatchers()`를 모두 대체합니다.
- **`hasRole("ADMIN")`** vs **`hasAuthority("ROLE_ADMIN")`**: `hasRole`은 자동으로 `ROLE_` 접두사를 붙입니다. 커스텀 권한명(`invoice:read` 등)은 `hasAuthority()`를 사용합니다.
- **`csrf(csrf -> csrf.disable())`**: STATELESS + 토큰 기반 API는 CSRF 보호가 불필요합니다.

---

## JwtAuthenticationFilter — OncePerRequestFilter 상속

`jakarta.servlet.*` 네임스페이스를 사용합니다. `javax.servlet.*`는 금지입니다.

```java
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

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
        final String username = jwtService.extractUsername(jwt);

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
        filterChain.doFilter(request, response);
    }
}
```

> 주의: 이 필터를 `@Component`로 등록하면 서블릿 컨테이너가 자동으로도 실행하려 할 수 있습니다. 스프링 컨벤션 중 하나를 선택하세요.
> - **권장**: `@Component`로 선언하고 SecurityConfig에서 `addFilterBefore(...)`로 등록 (위 예시). Spring Security가 체인 안에서만 실행합니다.
> - **대안**: `@Component`를 제거하고 `@Bean`으로 등록 시 `FilterRegistrationBean`으로 `setEnabled(false)` 지정하여 서블릿 직접 등록 방지.

---

## JwtService — jjwt 0.12.x API

jjwt 0.12.x는 0.10.x와 API가 크게 다릅니다. 아래가 0.12.x 표준 패턴입니다.

```java
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secretKey;           // Base64 인코딩 문자열 (32바이트 이상 원본)

    @Value("${app.jwt.expiration}")
    private long jwtExpiration;         // 밀리초 단위

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .claims(extraClaims)                                        // 0.12.x: setClaims → claims
                .subject(userDetails.getUsername())                         // 0.12.x: setSubject → subject
                .issuedAt(new Date(System.currentTimeMillis()))             // 0.12.x: setIssuedAt → issuedAt
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration)) // 0.12.x: setExpiration → expiration
                .signWith(getSignInKey())                                   // 알고리즘 자동 선택 (키 크기 기반)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()                                                // 0.12.x: parserBuilder() → parser()
                .verifyWith(getSignInKey())                                 // 0.12.x: setSigningKey → verifyWith
                .build()
                .parseSignedClaims(token)                                   // 0.12.x: parseClaimsJws → parseSignedClaims
                .getPayload();                                              // 0.12.x: getBody → getPayload
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);                                // 32바이트(256bit) 미만이면 WeakKeyException
    }
}
```

### jjwt 0.12.x API 변경 요약 (vs 0.10.x/0.11.x)

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

## UserDetailsService + DaoAuthenticationProvider

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class ApplicationConfig {

    private final UserRepository userRepository;

    public ApplicationConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

> 주의: Spring Security 5에서 사용하던 `@Autowired AuthenticationManagerBuilder auth` 패턴은 Security 6에서 권장되지 않습니다. `AuthenticationConfiguration.getAuthenticationManager()`로 Bean을 꺼내 사용하세요.

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
