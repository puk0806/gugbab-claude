---
name: spring-security-5-jwt-jjwt10
description: Spring Security 5.5.x + jjwt 0.10.7 레거시 JWT 인증에서 최신 API 섞기 막기 — Boot 2.5~2.7 번들 Security 버전, WebSecurityConfigurerAdapter 가 5.5 표준(SecurityFilterChain·requestMatchers·jakarta 쓰지 말 것), jjwt 0.10 parser() vs 0.11 parserBuilder()/0.12 Jwts.SIG, io.jsonwebtoken.security.SecurityException import 함정(500), runtime 스코프, 필터 @Component 이중 등록, ROLE_ 접두사, CVE-2024-31033
---

# Spring Security 5 + jjwt 0.10.x 레거시 JWT 인증

> 소스: https://docs.spring.io/spring-security/site/docs/5.5.x-SNAPSHOT/reference/html5/ | https://github.com/jwtk/jjwt/tree/0.10.7 | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.5-Release-Notes
> 검증일: 2026-11-09

> 주의: 이 스킬은 **Spring Boot 2.5.x + Spring Security 5.5.x + jjwt 0.10.7 + Java 11 + javax.\*** 레거시 환경 전용입니다.
> 신규 프로젝트는 Spring Security 6 + jjwt 0.12.x (parserBuilder, jakarta.\*) 기반 모던 스킬을 사용하세요.
> `WebSecurityConfigurerAdapter`는 Spring Security 5.7부터 deprecated, **Spring Security 6.x에서 완전히 제거**되었습니다(2026-09 재확인). 5.5.x에서는 여전히 표준 패턴입니다.
> **주의(2026-09-26 재검증)**: Spring Boot 2.5는 OSS 오픈소스 지원이 완전히 종료된 상태입니다(공식 EOL). 신규 CVE에 대한 공식 패치가 나오지 않으므로, 이 스킬은 **기존 레거시 프로젝트 유지보수 전용**으로만 사용하고 신규 기능 확장 시 업그레이드 경로(하단 표) 검토를 권장합니다.
> **주의(2026-09-26 재검증)**: jjwt에는 CVE-2024-31033(`setSigningKey()`/`signWith()`의 String 오버로드가 일부 문자를 무시할 수 있다는 지적, jjwt 메인테이너는 "정상 사용 시 발생 안 함"으로 반박·비공식 판정)이 보고되어 있습니다. 이 스킬의 `Keys.hmacShaKeyFor(byte[])` 기반 키 생성 패턴은 해당 String 오버로드를 사용하지 않으므로 영향 없습니다 — 코드 예시 변경 불필요.

---

## 이 스킬의 범위

JWT 필터·UserDetailsService·EntryPoint 작성 같은 기본 사용법은 공식 문서 수준이라 싣지 않는다. 여기엔 **레거시 버전에 최신 API(Security 6·jjwt 0.11/0.12·jakarta)를 섞지 않도록 하는 경고와 실측 함정**만 둔다. 모던 쪽은 `spring-security-6-jwt-jjwt12`, 전환 순서는 `spring-boot-2-to-3-migration`.

## 1. 환경 전제

| 항목 | 버전 |
|------|------|
| Java | 11 |
| Spring Boot | 2.5.x (번들 Spring Security 5.5.x) |
| jjwt | 0.10.7 (`jjwt-api` compile, `jjwt-impl`·`jjwt-jackson` **runtime**) |
| Servlet API | `javax.servlet.*` (jakarta 아님 — jakarta로 쓰면 컴파일 불가) |

> 주의: Spring Boot 2.5는 Spring Security 5.5.x를 관리합니다(2.5.0 = 5.5.0, 마지막 2.5.15 = 5.5.8). 2.6은 5.6(2.6.15 = 5.6.10), 2.7은 5.7(2.7.18 = 5.7.11)로 올라갑니다 — Maven Central `spring-boot-dependencies` POM 기준.

> 주의: `jjwt-impl`과 `jjwt-jackson`은 반드시 `runtime` 스코프로 선언합니다. `jjwt-api` 외부 API의 하위 호환성 보증을 위해 impl 패키지는 런타임에만 노출됩니다.

---

## 2. Security 5.5 — 최신 API를 쓰면 안 되는 곳

| 모델이 쓰기 쉬운 최신 API | 5.5.x 레거시에서 쓸 것 |
|---------------------------|------------------------|
| `SecurityFilterChain` Bean + 람다 DSL | `extends WebSecurityConfigurerAdapter` + `configure(HttpSecurity)` 오버라이드, `.and()` 체이닝 |
| `requestMatchers(...)` | `antMatchers(...)` |
| `authorizeHttpRequests(...)` | `authorizeRequests()` |
| `WebSecurityCustomizer` Bean | `configure(WebSecurity web)` → `web.ignoring().antMatchers(...)` |
| `UserDetailsService`/`AuthenticationManager`를 별도 Bean으로만 구성 | `configure(AuthenticationManagerBuilder)` + `@Bean @Override authenticationManagerBean()` (노출해야 로그인 컨트롤러에서 주입 가능) |
| `jakarta.servlet.*` | `javax.servlet.*` |

```java
@Configuration
@EnableWebSecurity   // Adapter 와 함께 필수
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable().httpBasic().disable().formLogin().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and().exceptionHandling()
                .authenticationEntryPoint(entryPoint).accessDeniedHandler(deniedHandler)
            .and().authorizeRequests()
                .antMatchers("/api/auth/**").permitAll()
                .anyRequest().hasRole("USER")
            .and()
            .addFilterBefore(new JwtAuthenticationFilter(jwtProvider),
                             UsernamePasswordAuthenticationFilter.class);
    }
}
```

함정:
- `configure(HttpSecurity)`를 생략하면 기본 설정(폼 로그인/세션)이 켜진다 — STATELESS·CSRF disable을 명시.
- **JWT 필터를 `@Component`로 등록하면** Spring Boot가 서블릿 필터로 자동 등록해 **이중 실행**된다. SecurityConfig 안에서 `new`로만 만들거나 `FilterRegistrationBean`으로 자동 등록을 끈다.
- `hasRole("USER")`는 내부적으로 `ROLE_USER`로 확장된다. `hasRole("ROLE_USER")`로 쓰지 말고, 권한 값은 `ROLE_` 접두사를 붙여 저장.
- 필터에서 검증 실패 시 예외를 던지지 말고 SecurityContext를 비운 채 체인을 진행 → 401은 `AuthenticationEntryPoint`가 처리.

> 주의: 전역 `@RestControllerAdvice` + `@ExceptionHandler(AuthenticationException.class)`를 두면 `AuthenticationEntryPoint` 가 호출되지 않는 경우가 있습니다. Security 필터 체인 단계에서 발생한 예외는 `DispatcherServlet`에 도달하기 전에 처리되어야 하므로 Entry Point/Handler 쪽에서 처리하는 것이 정석입니다.

---

## 3. jjwt 0.10.7 — 0.11/0.12 API 섞기 금지

| 작업 | 0.10.7 (이 환경) | 0.11.x | 0.12.x |
|------|------------------|--------|--------|
| 파서 | `Jwts.parser().setSigningKey(key).parseClaimsJws(token).getBody()` | `Jwts.parserBuilder().setSigningKey(key).build()...` 빌더/파서 메서드 다수 개명 (`spring-security-6-jwt-jjwt12`) |
| 서명 | `signWith(key, SignatureAlgorithm.HS256)` | 동일 | `Jwts.SIG.HS256` |
| 빌더 클레임 | `setSubject()`·`setIssuedAt()`·`setExpiration()` | 동일 | 개명 |
| 키 | `Keys.hmacShaKeyFor(byte[])` (HS256 최소 32바이트, 부족하면 `WeakKeyException`) | 동일 | 동일 |

`Jwts.parserBuilder()`는 **0.10.7에 없다** — 쓰면 컴파일 에러.

> 주의(2026-11-09 재검증): `validateToken`의 `SecurityException`은 반드시 `io.jsonwebtoken.security.SecurityException`을 import해야 합니다. import 없이 쓰면 `java.lang.SecurityException`으로 해석되어 서명 위조 토큰의 `SignatureException`(0.10.7 계층: `security.SignatureException` → `io.jsonwebtoken.SignatureException` → `security.SecurityException` → `JwtException`)을 잡지 못하고 필터 밖으로 던져져 401 대신 500이 납니다.

```java
import io.jsonwebtoken.security.SecurityException; // ← 필수

try {
    Jwts.parser().setSigningKey(key).parseClaimsJws(token);
    return true;
} catch (ExpiredJwtException e) { ...
} catch (MalformedJwtException | SecurityException e) { ...
} catch (UnsupportedJwtException | IllegalArgumentException e) { ... }
return false;
```

> 주의: 0.10.x의 `Jwts.parser()`는 thread-safe가 보장되지 않습니다. 0.11부터 `parserBuilder()`로 immutable 파서가 도입되었으며, 가능하면 요청마다 파싱 인스턴스를 지역 변수로 사용하세요.

> 주의: 시크릿 키는 환경변수·Vault에서 주입하고 프로퍼티 파일에 평문으로 두지 마세요. Base64 디코딩 전 길이가 HS256 기준 256-bit 이상인지 확인합니다.

---

## 4. 업그레이드 경로

| 현재 | 다음 단계 | 주요 변경 |
|------|-----------|-----------|
| jjwt 0.10.7 | jjwt 0.11.x | `Jwts.parser()` → `Jwts.parserBuilder().build()` |
| jjwt 0.11.x | jjwt 0.12.x | `SignatureAlgorithm.HS256` → `Jwts.SIG.HS256`, 빌더/파서 메서드 다수 개명 |
| Spring Security 5.5 | 5.7 | `WebSecurityConfigurerAdapter` deprecated → `SecurityFilterChain` Bean |
| Spring Boot 2.5 | 3.x | `javax.*` → `jakarta.*`, Java 17 이상 |

> 주의: 위 경로는 1단계씩 올리는 것을 권장. jjwt 0.10 → 0.12 직행, Boot 2.5 → 3.x 직행은 변경점이 커서 회귀 테스트 부담이 큽니다.
