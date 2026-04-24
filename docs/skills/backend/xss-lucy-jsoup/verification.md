---
skill: xss-lucy-jsoup
category: backend
version: v1
date: 2026-04-22
status: APPROVED
---

# xss-lucy-jsoup 검증 문서

> Naver Lucy XSS Servlet Filter + jsoup Safelist 조합 스킬의 검증 기록

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `xss-lucy-jsoup` |
| 스킬 경로 | `.claude/skills/backend/xss-lucy-jsoup/SKILL.md` |
| 검증일 | 2026-04-22 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 기준 버전 | Naver Lucy XSS Servlet 2.0.0 / 2.0.1, jsoup 1.18.x / 1.22.x |

---

## 1. 작업 목록 (Task List)

- [✅] Naver Lucy 공식 GitHub 및 매뉴얼 확인
- [✅] jsoup 공식 문서 (Safelist API) 확인
- [✅] OWASP XSS Prevention Cheat Sheet 참조
- [✅] Spring Security 헤더 권장사항 확인 (X-XSS-Protection deprecated)
- [✅] FilterRegistrationBean 등록 방식 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | Naver Lucy xss-servlet-filter, jsoup Safelist, OWASP XSS, Spring Security headers | 공식 GitHub, jsoup.org, OWASP cheat sheet 수집 |
| 조사 | WebFetch | github.com/naver/lucy-xss-servlet-filter, jsoup.org/cookbook/cleaning-html | 설정 예제·Safelist 변형 확인 |
| 교차 검증 | WebSearch | Lucy archived 여부, jsoup preserveRelativeLinks XSS 우회, CSP 헤더 | Lucy 레포 2025-06-09 archived 확인, jsoup 1.15.3 패치 확인 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Naver Lucy GitHub | https://github.com/naver/lucy-xss-servlet-filter | ⭐⭐⭐ High | 2026-04-22 | 공식 저장소 (archived 2025-06-09) |
| Naver Lucy Manual | https://github.com/naver/lucy-xss-servlet-filter/blob/master/doc/manual.md | ⭐⭐⭐ High | 2026-04-22 | 공식 매뉴얼 |
| jsoup Safelist Cookbook | https://jsoup.org/cookbook/cleaning-html/safelist-sanitizer | ⭐⭐⭐ High | 2026-04-22 | 공식 가이드 |
| jsoup Safelist API | https://jsoup.org/apidocs/org/jsoup/safety/Safelist | ⭐⭐⭐ High | 2026-04-22 | API 스펙 |
| Spring Security Headers | https://docs.spring.io/spring-security/reference/servlet/exploits/headers.html | ⭐⭐⭐ High | 2026-04-22 | X-XSS-Protection deprecated, CSP 권장 |
| OWASP XSS Prevention | https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html | ⭐⭐⭐ High | 2026-04-22 | 표준 방어 전략 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보 명시 (Lucy 2.0.0/2.0.1, jsoup 1.18.3 LTS성 / 1.22.x)
- [✅] deprecated된 패턴 주의 (X-XSS-Protection deprecated, jsoup `Whitelist` → `Safelist`)
- [✅] 코드 예시가 실행 가능한 형태임
- [✅] Lucy archived 상태 상단 주의문으로 명시

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함
- [✅] 소스 URL과 검증일 명시 (6개 소스)
- [✅] 핵심 개념 설명 (Lucy=서블릿 파라미터 레벨, jsoup=HTML 본문 sanitize 역할 분담)
- [✅] 코드 예시 포함 (FilterRegistrationBean, Safelist 변형, CSP 헤더)
- [✅] 대안 도구 비교 섹션 (OWASP Java Encoder, ESAPI)
- [✅] 흔한 실수 패턴 포함

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 구현에 도움이 되는 수준
- [✅] 한국 엔터프라이즈 실무 패턴 반영 (Lucy + jsoup 병행)
- [✅] 범용적으로 사용 가능 (SB 2.x/3.x 양쪽)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-04-23, general-purpose로 대체 실행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 — Lucy SB 3.x 비호환 경고 정확히 재현, `Safelist.none()` 기반 커스텀 + `addEnforcedAttribute("a","rel","nofollow noopener noreferrer")` 모범 패턴 제시
- [✅] 잘못된 응답 없음 (`Whitelist` deprecated 회피, `Safelist` 사용 확인)

---

## 5. 테스트 진행 기록

**수행일**: 2026-04-23
**수행 방법**: general-purpose 에이전트에게 SKILL.md만 Read한 뒤 2개 실전 질문 답변.

### 실제 수행 테스트

**Q1. SB 3.x + FilterRegistrationBean + `/api/**` 경로 + rule XML**
- ✅ PASS. 섹션 3-5 (FilterRegistrationBean) + 섹션 3-3 (rule XML) + 섹션 6-1 (Lucy SB 3.x jakarta 비호환 주의) 모두 근거 제시. Config 클래스 코드 + `lucy-xss-servlet-filter-rule.xml` 완전 작성, `CharacterEncodingFilter` 이후 `Ordered.HIGHEST_PRECEDENCE + 10` 배치 이유, 서블릿 URL 패턴(`/api/*`) vs Ant 스타일 차이까지 설명. Lucy 2.0.1이 `javax.servlet.Filter` 기반이라 SB 3.x에서는 jakarta 변환이 필요하다는 경고를 스킬이 올바르게 유도함.

**Q2. 게시판 본문 HTML sanitize (허용 태그 8종)**
- ✅ PASS. 섹션 4-4 (커스텀 Safelist) + 섹션 4-6 (persist 직전 sanitize) 근거로 `Safelist.none()` 기반 `addTags/addAttributes/addProtocols/addEnforcedAttribute` chain 완전 작성. `Whitelist`(deprecated) 회피, 서비스 레이어에서 `@Transactional` 내 `Jsoup.clean()` 호출 패턴까지 제시.

### 발견된 gap (경미)

- `Safelist.basic()` 프리셋이 `br` 태그를 포함하는지 SKILL.md에서 명시되지 않음 — 에이전트는 안전하게 `none()` 기반으로 커스텀을 권장. 다음 iteration에 프리셋 태그 전체 목록 표 추가 권장

---

### (참고) 초기 작성 시 제시한 권장 테스트 케이스

### (예정) 테스트 케이스 1: Spring Boot에 Lucy 필터 등록

**입력:** `Spring Boot 3.x에서 Naver Lucy XSS 필터를 등록하려면?`

**기대 결과:** `FilterRegistrationBean` + `lucy-xss-servlet-filter-rule.xml` 설정, jakarta.servlet 네임스페이스

### (예정) 테스트 케이스 2: 게시판 본문 HTML sanitize

**입력:** `게시판 본문에 허용된 태그만 남기고 나머지 제거하려면 jsoup으로?`

**기대 결과:** `Safelist.basicWithImages()` 또는 커스텀 Safelist, `Jsoup.clean(html, safelist)` 사용

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-04-23, 2개 질문 모두 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] 에이전트 활용 테스트 — SB 3.x FilterRegistrationBean + jsoup Safelist 2건 PASS (섹션 5, general-purpose 대체, 2026-04-23)
- [⏸️] Lucy 대체재(OWASP Java Encoder 기반 커스텀 필터) 별도 스킬 — 범위 확장 선택 사항
- [⏸️] CSP 헤더 세밀 설정 가이드 보강 — 선택 보강, 차단 요인 아님

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-22 | v1 | 최초 작성 — Naver Lucy + jsoup + CSP 조합, SB 2.5/3.x 통합, Lucy archived 주의 명시 | skill-creator |
