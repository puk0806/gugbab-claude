---
skill: xss-lucy-jsoup
category: backend
version: v1
date: 2026-11-09
status: APPROVED
---

# xss-lucy-jsoup 검증 문서

> Naver Lucy XSS Servlet Filter + jsoup Safelist 조합 스킬의 검증 기록

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `xss-lucy-jsoup` |
| 스킬 경로 | `.claude/skills/xss-lucy-jsoup/SKILL.md` |
| 검증일 | 2026-11-09 (재검증, 이전 2026-09-26 · 최초 2026-04-22) |
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
| jsoup GitHub Releases (재검증) | https://github.com/jhy/jsoup/releases | ⭐⭐⭐ High | 2026-11-09 | 1.24.1(2026-11-03) — 셀렉터 Web query mode·파서 표준 정렬, Safelist/Cleaner/보안 관련 항목 없음 |
| Maven Central jsoup metadata (재검증) | https://repo1.maven.org/maven2/org/jsoup/jsoup/maven-metadata.xml | ⭐⭐⭐ High | 2026-11-09 | 최신 1.24.1 교차 확인 |
| Maven Central lucy-xss-servlet metadata + GitHub API (재검증) | https://repo1.maven.org/maven2/com/navercorp/lucy/lucy-xss-servlet/maven-metadata.xml | ⭐⭐⭐ High | 2026-11-09 | release 2.0.1 그대로, GitHub 저장소 archived=true 유지 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보 명시 (Lucy 2.0.0/2.0.1, jsoup 1.18.3 LTS성 / 1.22.x)
- [✅] deprecated된 패턴 주의 (X-XSS-Protection deprecated, jsoup `Whitelist` → `Safelist`)
- [✅] 코드 예시가 실행 가능한 형태임
- [✅] Lucy archived 상태 상단 주의문으로 명시

#### 재검증 클레임 판정 (2026-11-09)

| # | 클레임 | 소스 1 | 소스 2 | 판정 |
|---|--------|--------|--------|------|
| R1 | jsoup 최신 1.23.2 | GitHub Releases (1.24.1, 2026-11-03) | Maven Central metadata | DISPUTED → 1.24.1 로 수정 |
| R2 | `Safelist` 프리셋·`addTags/addAttributes/addProtocols/addEnforcedAttribute`·`Jsoup.clean` API 불변 | 1.24.1 릴리스 노트(Safelist/Cleaner/보안 항목 없음) | jsoup Safelist Javadoc | VERIFIED |
| R3 | Lucy 2.0.1 최신·저장소 archived | Maven Central metadata(release 2.0.1) | GitHub API(archived=true) | VERIFIED (변경 없음) |
| R4 | 1.24.1 셀렉터 Web query mode 가 1.25.1 에서 기본값 예정 | GitHub Releases 본문 | jsoup.org selector migration 안내 링크 | VERIFIED → 주의문에 추가 |

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

**수행일**: 2026-11-09
**수행자**: skill-tester → general-purpose (도메인 에이전트 대신 대체 실행)
**수행 방법**: 2026-11-09 재검증(jsoup 1.24.1 갱신·셀렉터 마이그레이션 주의 추가) 후 SKILL.md Read, 실전 질문 2개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 댓글에서 a/b/i만 허용 + 링크 rel 강제, 최신 jsoup 버전과 Safelist API 변경 여부**
- ✅ PASS
- 근거: SKILL.md "4-2 Safelist 프리셋", "4-4 커스텀 Safelist", 상단 2026-11-09 재검증 주의 블록
- 상세: `Safelist.none()` 기반 `addTags/addAttributes/addProtocols/addEnforcedAttribute` 체인 제시, `Whitelist`(deprecated) 회피, 최신 1.24.1 및 Safelist API 불변 정확히 인용, persist 직전 sanitize 언급.

**Q2. Spring Boot 3.x에서 jsoup 1.24.1 업그레이드 가능 여부(select() 병용) 및 Lucy의 @RequestBody JSON 방어 여부**
- ✅ PASS
- 근거: SKILL.md 상단 재검증 주의 블록, "3-2 동작 방식", "2 방어 레이어 매핑", "4-6 서비스 레이어 통합"
- 상세: sanitize는 영향 없고 select() 사용 시 셀렉터 마이그레이션 가이드 확인 필요(Web query mode, 1.25.1 기본값 예정)라고 정확히 답변. Lucy는 JSON 본문에 적용되지 않으므로 jsoup으로 직접 sanitize해야 한다고 근거 제시.

### 발견된 gap (경미, 차단 요인 아님)

- 3-1절 주의문의 "아래 6절 참고"가 깨진 참조(본문에 6절 없음, 상세는 references로 이동됨)
- 4-1절 의존성 예제·20행 "1.22.x 계열 기준" 표현이 최신 1.24.1과 불일치
- `a, b, i`만 허용하는 최소 `none()` 기반 예제 부재(4-4절 응용으로 도출 가능)

### 판정

- agent content test: PASS (2/2 PASS)
- verification-policy 분류: 해당 없음 (라이브러리 사용법 스킬, content test로 충분)
- 최종 상태: APPROVED 유지

---

### 2026-09-26 — 재검증 (60일 초과 정기 재검증)

**수행일**: 2026-09-26
**수행 방법**: SKILL.md + REFERENCE.md 전체 Read, WebSearch로 jsoup·Lucy 최신 상태 재확인.

**Q1. jsoup 최신 버전(1.23.2)에서도 `Safelist.relaxed()` 기반 커스텀 sanitize 코드가 그대로 동작하는가?**
- PASS(재검증). jsoup 1.23.2(2026-08-26) 릴리스 노트 확인 결과 XML/W3C DOM 성능·HTTP 스트리밍 개선이 주 내용이며 `Safelist` API 변경 없음.

**Q2. Naver Lucy가 archived된 지 1년 넘었는데 여전히 쓸 수 있는가?**
- PASS(재검증). 레포 상태(archived, 2025-06-09)·최신 버전(2.0.1) 변경 없음 확인. 신규 기능 추가가 없다는 성격상 archived 상태가 오히려 API 안정성을 의미하며 SKILL.md의 "안정적으로 사용 가능" 평가 유지.

**재검증 결론**: 핵심 클레임 VERIFIED 유지. jsoup 최신 버전만 갱신. status 변경 없음(APPROVED 유지).

---

### 2026-04-23 — 원 수행 기록

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
| 에이전트 활용 테스트 | ✅ (2026-04-23 2/2 PASS, 2026-11-09 재검증 후 재시험 2/2 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] 에이전트 활용 테스트 — SB 3.x FilterRegistrationBean + jsoup Safelist 2건 PASS (섹션 5, general-purpose 대체, 2026-04-23)
- [✅] 2026-11-09 재검증 후 skill-tester 재시험 수행 (2/2 PASS, 섹션 5·6 반영)
- [⏸️] 3-1절 주의문 "아래 6절 참고" 깨진 참조 및 4-1절/20행 "1.22.x" 표기를 1.24.1 기준으로 정리 — 선택 보강, 차단 요인 아님
- [⏸️] Lucy 대체재(OWASP Java Encoder 기반 커스텀 필터) 별도 스킬 — 범위 확장 선택 사항
- [⏸️] CSP 헤더 세밀 설정 가이드 보강 — 선택 보강, 차단 요인 아님

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-22 | v1 | 최초 작성 — Naver Lucy + jsoup + CSP 조합, SB 2.5/3.x 통합, Lucy archived 주의 명시 | skill-creator |
| 2026-09-26 | v1 | 재검증 — jsoup 1.23.2 최신 확인, Lucy archived 상태 변경 없음 확인 | 메인 세션 |
| 2026-11-09 | v1 | 재검증 — jsoup 최신 1.23.2→1.24.1 갱신(Safelist API 변경 없음 확인), 1.24.1 셀렉터 Web query mode 마이그레이션 주의 추가. Lucy 2.0.1·archived 변경 없음 | Claude (Opus 5.5) |
| 2026-11-09 | v1 | 재검증 후 2단계 재시험 수행 (Q1 a/b/i 허용 + rel 강제 Safelist·최신 버전 / Q2 1.24.1 업그레이드 select() 주의·Lucy JSON 본문 미적용) → 2/2 PASS, APPROVED 유지 | skill-tester |
| 2026-11-12 | v1.1 | 정리(사실 재검증 아님) — 일반 지식 덜어내기: 남긴 것 Lucy archived·jsoup 1.24.1 셀렉터 주의, Lucy javax 전용·@RequestBody 미적용·필터 순서, rule XML 핵심·defender 3종·리치 에디터 깨짐, Whitelist→Safelist·style CSS 벡터·preserveRelativeLinks GHSA·persist 직전, JSON 방어 분담·전역 디시리얼라이저 부작용, SB 2.5 vs 3.x·X-XSS-Protection 기본값·SB 3 대안 / 덜어낸 것 XSS 위협 개요·방어 레이어 그림, 의존성 블록, rule XML 전체 예제, FilterRegistrationBean·web.xml·HtmlSanitizer·EditorSanitizer·서비스 통합 예제, Security 6 헤더 설정 코드·CSP 디렉티브 표, 대안 도구 비교표, 커스텀 jakarta 필터 전체 코드, 흔한 실수 표(references/REFERENCE.md 본문 흡수 후 폴더 삭제) | 정리 |
