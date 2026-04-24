---
name: spring-security-6-jwt-jjwt12
description: Spring Boot 3.x + Spring Security 6.x + jjwt 0.12.x 기반 모던 JWT 인증 패턴. SecurityFilterChain Bean, 람다 DSL, jakarta.servlet, Virtual Threads 적용
---

# Spring Security 6 + JWT (jjwt 0.12.x) 모던 인증 패턴

> 소스: https://docs.spring.io/spring-security/reference/servlet/ | https://github.com/jwtk/jjwt | https://spring.io/projects/spring-boot
> 검증일: 2026-04-22

> 주의: 이 문서는 Spring Boot 3.5.x + Spring Security 6.5.x + jjwt 0.12.6 (또는 0.13.0) + Java 17+ 기준입니다. Spring Boot 3.4 이하는 2025-12-31 EOL입니다. 레거시 Spring Security 5.x/`WebSecurityConfigurerAdapter` 패턴은 별도 스킬을 참조하세요.

---

## 적용 범위

| 항목 | 최소 버전 | 권장 버전 (2026-04 기준) |
|------|-----------|--------------------------|
| Java | 17 | 21 (Virtual Threads 사용 시) |
| Spring Boot | 3.2 | 3.5.13 |
| Spring Security | 6.2 | 6.5.x (Boot 3.5에 번들) |
| jjwt | 0.12.0 | 0.12.6 이상 (또는 0.13.0) |
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
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")

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
        <version>0.12.6</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.6</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.6</version>
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

## 인증 컨트롤러 (로그인 → JWT 발급)

```java
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          UserDetailsService userDetailsService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    public record LoginRequest(String email, String password) {}
    public record AuthResponse(String token) {}

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );
        UserDetails user = userDetailsService.loadUserByUsername(req.email());
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
```

---

## OAuth2 Resource Server — JWT 옵션 (자체 필터 대체)

자체 `OncePerRequestFilter`를 구현하는 대신, **외부 IdP(Keycloak, Auth0, Okta 등)가 발급한 JWT**를 검증만 한다면 `oauth2ResourceServer().jwt()`가 더 간결합니다.

### 의존성 추가

```kotlin
implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
```

### 설정

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/admin/**").hasAuthority("SCOPE_admin")
            .anyRequest().authenticated()
        )
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .oauth2ResourceServer(oauth2 -> oauth2
            .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
        );
    return http.build();
}
```

### application.yml (JWK 기반 검증)

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://your-idp.example.com/realms/myrealm
          # 또는 공개키 JWK Set URL 직접 지정:
          # jwk-set-uri: https://your-idp.example.com/realms/myrealm/protocol/openid-connect/certs
```

### 커스텀 권한 추출기

```java
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

@Bean
public JwtAuthenticationConverter jwtAuthenticationConverter() {
    JwtGrantedAuthoritiesConverter grantedConverter = new JwtGrantedAuthoritiesConverter();
    grantedConverter.setAuthoritiesClaimName("roles");      // JWT 내 권한 클레임 명
    grantedConverter.setAuthorityPrefix("ROLE_");

    JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
    converter.setJwtGrantedAuthoritiesConverter(grantedConverter);
    return converter;
}
```

### 자체 JWT 필터 vs OAuth2 Resource Server 선택 기준

| 상황 | 권장 방식 |
|------|----------|
| 자체 발급/검증 (단일 서버에서 로그인 + API) | 자체 JwtAuthenticationFilter + jjwt |
| 외부 IdP(Keycloak/Auth0/Okta) 발급 JWT 검증만 | `oauth2ResourceServer().jwt()` |
| 다수 마이크로서비스가 공통 IdP 사용 | `oauth2ResourceServer().jwt()` (JWK 공개키 회전 자동 처리) |

---

## Virtual Threads 활성화 (Spring Boot 3.2+, Java 21)

Java 21 이상에서 단일 프로퍼티로 Tomcat 요청 스레드·`@Async`·`applicationTaskExecutor`를 가상 스레드로 전환합니다.

```yaml
# application.yml
spring:
  threads:
    virtual:
      enabled: true
```

### 효과

- Tomcat의 요청 처리 스레드가 가상 스레드로 실행됩니다.
- `@Async` 메서드, Spring MVC 비동기 요청, WebFlux blocking execution이 가상 스레드 풀을 사용합니다.
- I/O 대기가 많은 REST API에서 처리량이 크게 향상됩니다.

> 주의: Java 17에서는 Virtual Threads를 사용할 수 없습니다 (Java 21 정식 기능). JDK 19/20은 preview였으므로 프로덕션 불가입니다.

> 주의: 가상 스레드는 CPU 바운드 작업에는 이점이 없습니다. 순수 계산 집약 코드는 기존 플랫폼 스레드 풀로 유지하세요.

> 주의: `synchronized` 블록 내부에서 블로킹 I/O를 호출하면 가상 스레드가 **pinning** 되어 이점이 사라집니다. `ReentrantLock`으로 교체하거나 블록을 최소화하세요.

---

## 시크릿·키 관리

### application.yml (환경변수 치환 권장)

```yaml
app:
  jwt:
    secret: ${APP_JWT_SECRET}      # Base64 인코딩된 32바이트 이상
    expiration: 86400000           # 24시간 (ms)
```

### 키 생성 (최소 256비트)

```bash
# 32바이트(256비트) 랜덤 키를 Base64로 출력
openssl rand -base64 32
```

### Jasypt 기반 application.yml 암호화 (선택)

```yaml
app:
  jwt:
    secret: ENC(AbCdEf...)         # 암호화된 값
```

```kotlin
// Gradle
implementation("com.github.ulisesbocchio:jasypt-spring-boot-starter:3.0.5")
```

실행 시 `-Djasypt.encryptor.password=<master>` 로 마스터 키 전달.

### 금지 패턴

- 시크릿 키를 `application.yml`에 **평문 하드코딩** 금지 (Git에 그대로 푸시됨)
- 32바이트 미만 키 사용 금지 — jjwt가 `WeakKeyException` 던짐
- 프로덕션/스테이징/개발 **동일 키** 사용 금지
- JWT payload에 비밀번호·신용카드 등 민감 정보 **평문 저장 금지** (JWT는 서명일 뿐 암호화가 아님 — 누구나 디코딩 가능)

---

## 흔한 실수 패턴

### ❌ 1. `javax.servlet.*` 임포트

```java
// 금지 — Spring Boot 3.x에서 컴파일 에러
import javax.servlet.FilterChain;
import javax.servlet.http.HttpServletRequest;

// 올바름
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
```

### ❌ 2. `WebSecurityConfigurerAdapter` 상속

```java
// 금지 — Security 6에서 클래스 자체가 제거됨
public class SecurityConfig extends WebSecurityConfigurerAdapter { ... }

// 올바름 — @Bean SecurityFilterChain 사용
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception { ... }
}
```

### ❌ 3. `antMatchers()` / `authorizeRequests()` 사용

```java
// 금지 — deprecated, Security 7에서 제거 예정
http.authorizeRequests()
    .antMatchers("/admin/**").hasRole("ADMIN");

// 올바름
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/admin/**").hasRole("ADMIN")
);
```

### ❌ 4. jjwt 0.10.x 스타일 API 사용

```java
// 금지 — 0.12.x에서 deprecated
Claims claims = Jwts.parserBuilder()
    .setSigningKey(key)
    .build()
    .parseClaimsJws(token)
    .getBody();

// 올바름 — 0.12.x
Claims claims = Jwts.parser()
    .verifyWith(key)
    .build()
    .parseSignedClaims(token)
    .getPayload();
```

### ❌ 5. `.and()` 체이닝

```java
// 금지 — 람다 DSL로 통합됨. Security 7에서 제거 예정
http.authorizeHttpRequests().anyRequest().authenticated()
    .and()
    .sessionManagement()...

// 올바름
http.authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
    .sessionManagement(s -> s.sessionCreationPolicy(STATELESS));
```

### ❌ 6. `hasRole()`에 `ROLE_` 접두사 중복

```java
// 금지 — hasRole()이 자동으로 ROLE_ 접두사를 붙여서 최종 체크는 ROLE_ROLE_ADMIN이 됨
.requestMatchers("/admin/**").hasRole("ROLE_ADMIN")

// 올바름 — 둘 중 하나 선택
.requestMatchers("/admin/**").hasRole("ADMIN")                // → ROLE_ADMIN 체크
.requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")      // 직접 명시
```

### ❌ 7. 세션 + JWT 혼용

```java
// 금지 — 세션이 생성되어 STATELESS 의미 상실, CSRF 이슈 재발생
.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

// 올바름 — JWT 환경은 반드시 STATELESS
.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
```

### ❌ 8. JWT 페이로드에 민감정보 저장

```java
// 금지 — JWT는 Base64URL 인코딩일 뿐, 누구나 jwt.io에서 디코딩 가능
Map<String, Object> claims = Map.of("password", user.getPassword(), "ssn", user.getSsn());

// 올바름 — subject + 권한 메타데이터만
Map<String, Object> claims = Map.of("roles", user.getAuthorities());
```

---

## 체크리스트

스킬 적용 시 확인:

- [ ] Java 17 이상, Spring Boot 3.2 이상, Spring Security 6.x 번들 확인
- [ ] `jakarta.servlet.*` 사용 (javax 전무)
- [ ] `@Bean SecurityFilterChain` + 람다 DSL로 설정
- [ ] `authorizeHttpRequests()` + `requestMatchers()` 사용
- [ ] `SessionCreationPolicy.STATELESS` 지정
- [ ] `csrf(csrf -> csrf.disable())` 설정 (토큰 기반 API 한정)
- [ ] `addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)` 로 필터 등록
- [ ] jjwt 0.12.x 3개 모듈(`api`/`impl`/`jackson`) 선언, `impl`/`jackson`은 runtime 스코프
- [ ] jjwt API는 `Jwts.parser()` / `verifyWith()` / `parseSignedClaims()` 사용
- [ ] `Keys.hmacShaKeyFor()` 또는 `Jwts.SIG.HS256.key()` 로 키 생성
- [ ] JWT 시크릿은 환경변수 또는 Jasypt로 주입, 평문 커밋 금지
- [ ] 키 길이 256비트(32바이트) 이상
- [ ] `DaoAuthenticationProvider` + `BCryptPasswordEncoder` 구성
- [ ] Java 21 환경이면 `spring.threads.virtual.enabled=true` 고려

---

## 참고 자료

- [Spring Security Reference (Servlet)](https://docs.spring.io/spring-security/reference/servlet/)
- [Spring Security Configuration Migration Guide](https://docs.spring.io/spring-security/reference/6.5-SNAPSHOT/migration-7/configuration.html)
- [OAuth 2.0 Resource Server JWT](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html)
- [jjwt GitHub (0.12.x README)](https://github.com/jwtk/jjwt)
- [jjwt-api 0.12.x JavaDoc](https://javadoc.io/doc/io.jsonwebtoken/jjwt-api/latest/)
- [Spring Boot Dependency Versions](https://docs.spring.io/spring-boot/appendix/dependency-versions/index.html)
- [Spring Boot Virtual Threads (Baeldung)](https://www.baeldung.com/spring-6-virtual-threads)
- [RFC 7518 JWA §3.2 — HMAC minimum key size](https://www.rfc-editor.org/rfc/rfc7518#section-3.2)
