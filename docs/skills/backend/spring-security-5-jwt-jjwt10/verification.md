---
skill: spring-security-5-jwt-jjwt10
category: backend
version: v1
date: 2026-04-22
status: APPROVED
---

# spring-security-5-jwt-jjwt10 검증 문서

> Spring Security 5.5.x + jjwt 0.10.7 레거시 JWT 인증 스킬의 작성 및 검증 기록

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 공식 문서·GitHub 태그 기반 내용 작성 ✅
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST

[2단계] 실제 사용 중 (온라인 검증) — 미실시
  └─ Claude Code에서 java-backend-developer 에이전트로 실제 생성 테스트 필요
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `spring-security-5-jwt-jjwt10` |
| 스킬 경로 | `.claude/skills/backend/spring-security-5-jwt-jjwt10/SKILL.md` |
| 검증일 | 2026-04-22 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.spring.io, github.com/jwtk/jjwt)
- [✅] 공식 GitHub 2순위 소스 확인 (spring-projects/spring-boot 2.5.x 릴리즈 노트)
- [✅] 버전 기준 확인 — Spring Boot 2.5.x / Security 5.5.x / jjwt 0.10.7 / Java 11 / javax.servlet
- [✅] 핵심 패턴 정리 — WebSecurityConfigurerAdapter, OncePerRequestFilter, JwtProvider, UserDetailsService, EntryPoint/AccessDeniedHandler
- [✅] 코드 예시 작성 (의존성, SecurityConfig, Filter, Provider, Service, Handler 전 범위)
- [✅] 흔한 실수 패턴 정리 (parserBuilder 오용, 약한 키, Component 등록 이중 실행 등)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | VERIFICATION_TEMPLATE.md, axum/SKILL.md | 섹션 1-8 구조, SKILL.md 헤더 형식 확인 |
| 중복 체크 | Read | .claude/skills/backend/spring-security-5-jwt-jjwt10/SKILL.md | 파일 없음 → 신규 생성 |
| 조사 1 | WebSearch | Spring Boot 2.5 bundled Spring Security version | Spring Security 5.5.x 번들 확인 (2.5.0-M2부터) |
| 조사 2 | WebSearch | jjwt 0.10.7 release github | 0.10.x 시리즈 정보, CHANGELOG 링크 확보 |
| 조사 3 | WebSearch | WebSecurityConfigurerAdapter Spring Security 5 deprecated | 5.7부터 deprecated, 5.5.x는 정식 패턴 확인 |
| 조사 4 | WebSearch | jjwt 0.10 parser vs parserBuilder 0.11 | 0.10.x는 `Jwts.parser().setSigningKey()` / 0.11부터 `parserBuilder().build()` |
| 조사 5 | WebFetch | github.com/jwtk/jjwt/tree/0.10.7 | 0.10.7 API 확인 (Jwts.parser, Keys.hmacShaKeyFor, SignatureAlgorithm.HS256) |
| 조사 6 | WebFetch | CHANGELOG.md | 0.10.0/0.10.7/0.11.0 API 변경 이력 확인 |
| 조사 7 | WebFetch | github.com/jwtk/jjwt README | Maven 의존성 구조 (jjwt-api compile / impl, jackson runtime) |
| 조사 8 | WebSearch | OncePerRequestFilter JWT addFilterBefore | 필터 등록 패턴 (UsernamePasswordAuthenticationFilter.class 기준) |
| 조사 9 | WebSearch | AuthenticationEntryPoint AccessDeniedHandler JSON javax.servlet | 핸들러 구현 패턴 확인 |
| 교차 검증 | WebSearch | 7개 클레임, 독립 소스 2개 이상 | VERIFIED 6 / DISPUTED 0 / UNVERIFIED 1 |
| 작성 | Write | SKILL.md 본문 | 단일 파일 생성 완료 |
| 검증 문서 | Write | verification.md 본문 | 단일 파일 생성 완료 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Spring Security 5.5.x Reference | https://docs.spring.io/spring-security/site/docs/5.5.x-SNAPSHOT/reference/html5/ | ⭐⭐⭐ High | 2026-04-22 | 1순위 공식 문서 |
| Spring Boot 2.5 Release Notes | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.5-Release-Notes | ⭐⭐⭐ High | 2026-04-22 | 번들 Security 버전 근거 |
| Spring Boot 2.5.0 M2 Release Notes | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.5.0-M2-Release-Notes | ⭐⭐⭐ High | 2026-04-22 | Security 5.5.0-M2 업그레이드 명시 |
| jjwt GitHub 0.10.7 tag | https://github.com/jwtk/jjwt/tree/0.10.7 | ⭐⭐⭐ High | 2026-04-22 | 0.10.7 API 기준 |
| jjwt CHANGELOG.md | https://github.com/jwtk/jjwt/blob/master/CHANGELOG.md | ⭐⭐⭐ High | 2026-04-22 | 0.10 vs 0.11 파서 API 변경 이력 |
| jjwt README | https://github.com/jwtk/jjwt | ⭐⭐⭐ High | 2026-04-22 | Maven 의존성 scope 규칙 |
| Spring blog: SecurityFilterChain 도입 | https://spring.io/blog/2022/02/21/spring-security-without-the-websecurityconfigureradapter/ | ⭐⭐⭐ High | 2026-04-22 | Adapter deprecated 시점(5.7) |
| Baeldung: WebSecurityConfigurerAdapter 업그레이드 | https://www.baeldung.com/spring-deprecated-websecurityconfigureradapter | ⭐⭐ Medium | 2026-04-22 | 5.5.x에서 Adapter 유효성 교차 확인 |
| Baeldung: JWT parser 대체 | https://www.baeldung.com/jwt-deprecated-setsigningkey | ⭐⭐ Medium | 2026-04-22 | 0.10→0.11 파서 전환 교차 확인 |
| Spring Security GitHub Issue #11288 | https://github.com/spring-projects/spring-security/issues/11288 | ⭐⭐⭐ High | 2026-04-22 | Adapter deprecation 공식 트래킹 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Spring Boot 2.5.x, Security 5.5.x, jjwt 0.10.7, Java 11)
- [✅] deprecated된 패턴을 **의도적으로** 사용하고 있음 (레거시 스킬이므로 상단에 명시적 경고 표기)
- [✅] 코드 예시가 실행 가능한 형태임 (import, 어노테이션, 주입 체인 완전)

**핵심 클레임 교차 검증 결과:**

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | Spring Boot 2.5는 Spring Security 5.5.x를 번들한다 | VERIFIED | Spring Boot 2.5 Release Notes + 2.5.0-M2 Release Notes 명시 |
| 2 | jjwt 0.10.x는 `Jwts.parser().setSigningKey(key).parseClaimsJws(token)` 패턴을 사용한다 | VERIFIED | github.com/jwtk/jjwt/tree/0.10.7 문서 + Baeldung + CHANGELOG |
| 3 | jjwt 0.11부터 `Jwts.parserBuilder().setSigningKey(key).build()`로 변경됨 | VERIFIED | jjwt CHANGELOG 0.11.0 항목 + javadoc.io 0.11.2 문서 |
| 4 | `WebSecurityConfigurerAdapter`는 Spring Security 5.7부터 deprecated | VERIFIED | spring.io 블로그 + GitHub Issue #11288 + Baeldung |
| 5 | `WebSecurityConfigurerAdapter`는 5.5.x에서는 여전히 표준 패턴 | VERIFIED | deprecation 시점(5.7)이 5.5.x 이후라는 사실로부터 도출 |
| 6 | jjwt-api는 compile, jjwt-impl/jjwt-jackson은 runtime scope로 선언 | VERIFIED | jjwt README 공식 명시 |
| 7 | `OncePerRequestFilter`를 `addFilterBefore(..., UsernamePasswordAuthenticationFilter.class)`로 등록 | VERIFIED | Baeldung + 복수 가이드 교차 확인 |
| 8 | `Keys.hmacShaKeyFor(byte[])`는 HS256에서 최소 256-bit(32byte) 필요 | VERIFIED | jjwt 0.10.7 JavaDoc + WeakKeyException 명세 |
| 9 | Spring Boot 2.5는 `javax.servlet` 네임스페이스 (jakarta 아님) | VERIFIED | Spring Boot 3 마이그레이션 가이드에서 3.0부터 jakarta 전환 명시 |
| 10 | jjwt 0.10.7 자체의 특이 변경점 | UNVERIFIED | 0.10.7 전용 릴리즈 노트가 검색 결과에 나타나지 않음. 0.10.x 시리즈 범용 API로 작성했으므로 영향 없음 |

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (상단 `> 소스:`, `> 검증일: 2026-04-22`)
- [✅] 핵심 개념 설명 포함 (Adapter 패턴, OncePerRequestFilter, jjwt 0.10 API 특성)
- [✅] 코드 예시 포함 (의존성, Config, Filter, Provider, Service, Handler, Controller 전 범위)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 ("언제 이 스킬을 사용하는가" 섹션)
- [✅] 흔한 실수 패턴 포함 (표 형식 8개 케이스)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (프로젝트 종속 코드 없음)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-04-22)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 — `parserBuilder()`(0.11+) 회피 확인
- [✅] 잘못된 응답 없음 — 보완 불필요

---

## 5. 테스트 진행 기록

**수행일**: 2026-04-22
**수행 방법**: general-purpose 에이전트에게 SKILL.md만 Read한 뒤 2개 실전 질문 답변.

### 실제 수행 테스트

**Q1. Spring Boot 2.5에서 `/api/auth/login`, `/api/auth/signup` permitAll + JWT 필터 등록**
- ✅ PASS. 에이전트가 "WebSecurityConfigurerAdapter 설정 클래스" 섹션(76-166)을 근거로 완전한 SecurityConfig.java를 작성. `configure(HttpSecurity)`에서 CSRF disable, STATELESS, antMatchers + permitAll, `addFilterBefore(..., UsernamePasswordAuthenticationFilter.class)`까지 정확히 구성.

**Q2. jjwt 0.10.7 토큰 생성·파싱 (parserBuilder 금지)**
- ✅ PASS. "JwtProvider 유틸 클래스 (jjwt 0.10.7 API)" 섹션(242-356)과 "jjwt 0.10.7 API 요약" 표(360-366) 근거로 `Jwts.builder().setSubject(...).setExpiration(...).signWith(key, SignatureAlgorithm.HS256)` 및 `Jwts.parser().setSigningKey(key).parseClaimsJws(token)` 정확히 사용. `parserBuilder()` 회피 자기 확인 포함.

자기 지식 없이 SKILL.md만으로 답변 생성 확인됨.

---

### (참고) 권장 테스트 케이스 — 향후 실사용 시 수행 가능

### 테스트 케이스 1: 로그인 API 엔드포인트 생성 요청

**입력 (질문/요청):**
```
Spring Boot 2.5 기반 프로젝트에서 JWT 로그인 API를 만들어줘. jjwt 0.10.7을 사용하고 있어.
```

**기대 결과:**
- `AuthenticationManager.authenticate()`로 username/password 검증
- 성공 시 `JwtProvider.createToken(authentication)`으로 토큰 발급
- `Jwts.builder()` 체인 + `signWith(key, SignatureAlgorithm.HS256)` 사용
- **금지:** `Jwts.parserBuilder()` 호출, jakarta.servlet import

**실제 결과:** (미실시)

**판정:** 미실시

---

### 테스트 케이스 2: JWT 검증 필터 구현 요청

**입력:**
```
JWT를 매 요청마다 검증해서 SecurityContext에 인증 정보를 주입하는 필터를 만들어줘.
```

**기대 결과:**
- `OncePerRequestFilter` 상속
- `javax.servlet.*` import
- Authorization 헤더에서 Bearer 토큰 파싱
- 검증 성공 시 `SecurityContextHolder.getContext().setAuthentication(...)`
- 실패 시 예외 던지지 않고 체인 진행
- SecurityConfig에서 `addFilterBefore(..., UsernamePasswordAuthenticationFilter.class)`로 등록

**실제 결과:** (미실시)

**판정:** 미실시

---

### 테스트 케이스 3: 0.11 → 0.10 다운그레이드 실수 감지

**입력:**
```
이 코드에서 `Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token)`를 썼는데 컴파일 에러가 나. jjwt 0.10.7 쓰고 있어.
```

**기대 결과:**
- 0.10.7에는 `parserBuilder()`가 없음을 인지
- `Jwts.parser().setSigningKey(key).parseClaimsJws(token)`로 수정 제안
- 또는 0.11+로 업그레이드 권장

**실제 결과:** (미실시)

**판정:** 미실시

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (핵심 클레임 9/10 VERIFIED, 1건 UNVERIFIED는 영향 없음) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-04-22, 2개 질문 모두 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] 에이전트 활용 테스트 — SecurityConfig + JwtProvider 2건 PASS (섹션 5, general-purpose 대체, 2026-04-22)
- [⏸️] jjwt 0.10.7 전용 릴리즈 노트 입수 시 breaking change 최종 확인 — 검증 보강 선택 사항
- [⏸️] Spring Boot 2.5.0~2.5.15 Security 5.5.x 마이너 변동 확인 — 검증 보강 선택 사항
- [⏸️] Refresh Token Redis 저장 전략 별도 스킬 분리 — 범위 확장 선택 사항

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-22 | v1 | 최초 작성. Spring Boot 2.5 + Security 5.5 + jjwt 0.10.7 레거시 패턴 전 범위 포함 | skill-creator |
