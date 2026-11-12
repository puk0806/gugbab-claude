## 흔한 실수 패턴 (버전 관련)

### ❌ 3. `antMatchers()` / `authorizeRequests()` 사용

```java
// 금지 — Security 6에서 deprecated, Security 7.0(2026-09 기준 GA)에서 실제로 제거됨
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
// 금지 — 람다 DSL로 통합됨. Security 7.0(2026-09 기준 GA)에서 `.and()` 체이닝 자체가 컴파일 불가로 제거됨
http.authorizeHttpRequests().anyRequest().authenticated()
    .and()
    .sessionManagement()...

// 올바름
http.authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
    .sessionManagement(s -> s.sessionCreationPolicy(STATELESS));
```

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
