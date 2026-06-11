## UserDetailsService 구현 (MyBatis Mapper 기반)

```java
package com.example.security.service;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.user.mapper.UserMapper;
import com.example.user.domain.MemberEntity;
import com.example.user.domain.MemberRoleEntity;

import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JpaUserDetailsService implements UserDetailsService {

    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        MemberEntity member = userMapper.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException(username + " not found"));

        List<MemberRoleEntity> roles = userMapper.findRolesByMemberId(member.getId());
        List<SimpleGrantedAuthority> authorities = roles.stream()
            // hasRole("USER")와 매칭하려면 "ROLE_USER" 형태로 저장
            .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getRoleName()))
            .collect(Collectors.toList());

        return User.builder()
            .username(member.getUsername())
            .password(member.getPasswordHash()) // 이미 BCrypt 해시된 값
            .authorities(authorities)
            .disabled(!member.isActive())
            .accountExpired(false)
            .accountLocked(false)
            .credentialsExpired(false)
            .build();
    }
}
```

**핵심 포인트:**

- `UserDetailsService.loadUserByUsername`은 사용자를 못 찾으면 반드시 `UsernameNotFoundException`을 던져야 함 (null 반환 금지)
- `@Transactional(readOnly = true)`로 읽기 전용 트랜잭션 선언 → Lazy 로딩/커넥션 관리 효율
- `authorities` 컬렉션은 `GrantedAuthority`의 getAuthority() 값이 `ROLE_XXX` 형태여야 `hasRole("XXX")`가 매칭됨
- 비밀번호는 반드시 BCrypt 해시된 상태로 DB에 저장. 평문 비교 금지

---

## 인증 실패 핸들러

### AuthenticationEntryPoint (401 Unauthorized)

```java
package com.example.security.handler;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        objectMapper.writeValue(response.getWriter(), new ErrorResponse(
            "UNAUTHORIZED", "인증이 필요하거나 토큰이 유효하지 않습니다."));
    }
}
```

### AccessDeniedHandler (403 Forbidden)

```java
package com.example.security.handler;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException ex) throws IOException {

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        objectMapper.writeValue(response.getWriter(), new ErrorResponse(
            "FORBIDDEN", "해당 리소스에 접근할 권한이 없습니다."));
    }
}
```

> 주의: 전역 `@RestControllerAdvice` + `@ExceptionHandler(AuthenticationException.class)`를 두면 `AuthenticationEntryPoint` 가 호출되지 않는 경우가 있습니다. Security 필터 체인 단계에서 발생한 예외는 `DispatcherServlet`에 도달하기 전에 처리되어야 하므로 Entry Point/Handler 쪽에서 처리하는 것이 정석입니다.

---

## 로그인 엔드포인트 예시

```java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest req) {
        // 1) AuthenticationManager로 username/password 인증
        UsernamePasswordAuthenticationToken authToken =
            new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword());
        Authentication authentication = authenticationManager.authenticate(authToken);

        // 2) 인증 성공 → JWT 발급
        String accessToken = jwtProvider.createToken(authentication);
        return ResponseEntity.ok(new TokenResponse(accessToken));
    }
}
```

---

## 리프레시 토큰 전략 (Redis)

짧은 유효기간의 Access Token + 길게 유지되는 Refresh Token 조합. Refresh Token은 서버 측에서 무효화가 가능해야 하므로 Redis에 저장.

**저장 구조 예:**

```
KEY:   refresh:{memberId}
VALUE: {랜덤 UUID 기반 refresh token}
TTL:   7일 또는 14일
```

**플로우:**

1. 로그인 성공 시 Access(30분) + Refresh(7일) 발급 → Redis에 `SET refresh:{id} {token} EX 604800`
2. 클라이언트는 Access 만료 시 `/api/auth/refresh` 호출 (Refresh 토큰 바디 전송)
3. 서버는 Redis에서 저장된 Refresh와 대조 → 일치하면 새 Access(+선택적으로 Refresh Rotation) 발급
4. 로그아웃 시 Redis 키 삭제로 즉시 무효화

> 주의: Refresh Token도 JWT로 발급해도 되지만, 서버 측 무효화(블랙리스트/로테이션)가 필요하면 반드시 Redis·DB 등 상태 저장소가 필요합니다. 순수 stateless JWT만으로는 강제 로그아웃이 불가능합니다.

---

## 흔한 실수 패턴

| 실수 | 올바른 패턴 |
|------|-------------|
| `Jwts.parserBuilder()` 호출 (0.10.x에 없음) | 0.10.x는 `Jwts.parser().setSigningKey(key)` 사용. 0.11+로 업그레이드해야 `parserBuilder()` 사용 가능 |
| HS256 키를 16바이트로 사용 | `WeakKeyException` 발생. 최소 32바이트(256-bit) 필요 |
| `@Override protected configure(HttpSecurity)` 생략 | 기본 설정이 적용되어 폼 로그인/세션이 활성화됨. 명시적으로 STATELESS + CSRF disable |
| JWT 필터를 `@Component`로 등록 | Spring Boot가 필터 체인에 자동 등록해 이중 실행됨. `new JwtAuthenticationFilter(...)`로 SecurityConfig 내부에서만 생성하거나, `FilterRegistrationBean`으로 자동 등록을 명시적으로 disable |
| `hasRole("ROLE_USER")` 사용 | `hasRole("USER")`로 작성. Security가 내부에서 `ROLE_` 접두사를 자동 부여 |
| 필터에서 검증 실패 시 `throw` | 필터에서는 SecurityContext를 비워두고 체인 진행. 401은 AuthenticationEntryPoint가 처리 |
| jakarta.servlet 사용 | Spring Boot 2.5는 `javax.servlet.*`. jakarta로 바꾸면 컴파일 불가 |
| Refresh Token도 stateless JWT로만 처리 | 강제 로그아웃 불가. Redis 저장으로 상태 관리 필요 |

---

## 언제 이 스킬을 사용하는가

**사용:**

- 기존 Spring Boot 2.5.x 기반 레거시 프로젝트 유지보수
- Java 11 + `javax.servlet` 네임스페이스 제약이 있는 환경
- jjwt 0.10.x에서 0.11/0.12로 올릴 수 없는 사유 (다른 라이브러리 호환성 등)

**사용하지 않음:**

- 신규 프로젝트 → Spring Security 6 + jjwt 0.12.x + jakarta 스킬 사용
- Spring Boot 2.7+ 프로젝트 → `WebSecurityConfigurerAdapter`는 5.7부터 deprecated. `SecurityFilterChain` Bean 방식 권장
- OAuth2/OIDC 통합 → Spring Security OAuth2 Resource Server 스킬 사용

---

## 업그레이드 경로 (참고)

| 현재 | 다음 단계 | 주요 변경 |
|------|-----------|-----------|
| jjwt 0.10.7 | jjwt 0.11.x | `Jwts.parser()` → `Jwts.parserBuilder().build()` |
| jjwt 0.11.x | jjwt 0.12.x | `SignatureAlgorithm.HS256` → `Jwts.SIG.HS256`, 빌더/파서 메서드 다수 개명 |
| Spring Security 5.5 | 5.7 | `WebSecurityConfigurerAdapter` deprecated → `SecurityFilterChain` Bean |
| Spring Boot 2.5 | 3.x | `javax.*` → `jakarta.*`, Java 17 이상 |

> 주의: 위 경로는 1단계씩 올리는 것을 권장. jjwt 0.10 → 0.12 직행, Boot 2.5 → 3.x 직행은 변경점이 커서 회귀 테스트 부담이 큽니다.
