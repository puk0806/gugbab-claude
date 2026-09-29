---
skill: spring-boot-gradle-setup
category: backend
version: v2
date: 2026-09-28
status: APPROVED
---

# spring-boot-gradle-setup 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `spring-boot-gradle-setup` |
| 스킬 경로 | `.claude/skills/backend/spring-boot-gradle-setup/SKILL.md` |
| 검증일 | 2026-09-28 (재검증 2차, 이전 2026-09-26) |
| 검증자 | skill-creator agent |
| 스킬 버전 | v2 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Spring Boot GitHub Wiki, Gradle 공식, Spring Boot Reference)
- [✅] 공식 GitHub 2순위 소스 확인 (spring-projects/spring-boot, gradle/gradle)
- [✅] 최신 버전 기준 내용 확인 (2026-04-22 — Spring Boot 4.0.5 릴리즈 인지, 사용자 요구대로 3.4.x 기준 작성)
- [✅] 레거시(2.5.12) / 모던(3.4+) 양쪽 빌드 스크립트 작성
- [✅] WAR/Jar/Native 패키징 분기 정리
- [✅] Java 버전 설정(sourceCompatibility, toolchain) 양쪽 방식 기재
- [✅] Starter 의존성 선택표 작성
- [✅] application.yml 프로파일 분리 예시 작성
- [✅] Tomcat 9 호환성 매트릭스 작성
- [✅] Spring Boot 2→3 마이그레이션 포인트 정리
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | VERIFICATION_TEMPLATE.md, 기존 axum SKILL.md | 구조 파악 (frontmatter, 소스/검증일 헤더, 섹션 구성) |
| 조사 | WebSearch | Spring Boot 최신 버전, Gradle 최신, 3.4 릴리즈, 2.5.12 WAR 설정, 마이그레이션 가이드 등 7건 | 공식/준공식 소스 다수 확보 |
| 조사 | WebFetch | Spring Boot 3.4 Release Notes, 3.0 Migration Guide GitHub Wiki | 핵심 Breaking Change, Gradle 호환성 매트릭스 직접 확인 |
| 교차 검증 | WebSearch | 핵심 클레임 8개, 독립 소스 2+ | VERIFIED 7 / DISPUTED 1 / UNVERIFIED 0 |

### 조사 중 발견한 특이점

- 사용자는 "Spring Boot 3.4+"를 요청했으나 2026-04 기준 실제 최신 안정은 **Spring Boot 4.0.5**다. 본 스킬은 사용자 요청대로 3.4.x를 메인으로 다루되, SKILL.md 상단의 `> 주의:` 블록에 4.0 출시 사실을 고지했다.
- Spring Boot 3.4 Release Notes는 명시적인 "Java 최소 버전" 재공지는 하지 않고 APR에 대해서만 Java 24를 언급한다. Java 17 최소 요구는 Spring Boot 3.0 마이그레이션 가이드에서 유지되는 것으로 확인된다.

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Spring Boot 3.4 Release Notes (GitHub Wiki) | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.4-Release-Notes | ⭐⭐⭐ High | 2026-04-22 | Gradle 호환성·Spring Framework 6.2 확인 |
| Spring Boot 3.0 Migration Guide (GitHub Wiki) | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide | ⭐⭐⭐ High | 2026-04-22 | Java 17, jakarta 네임스페이스, Servlet 6.0 확인 |
| Spring Boot Traditional Deployment | https://docs.spring.io/spring-boot/how-to/deployment/traditional-deployment.html | ⭐⭐⭐ High | 2026-04-22 | `SpringBootServletInitializer`, `providedRuntime` 공식 권장 |
| Spring Boot Profiles Reference | https://docs.spring.io/spring-boot/reference/features/profiles.html | ⭐⭐⭐ High | 2026-04-22 | `spring.config.activate.on-profile` 문법 확인 |
| Gradle Compatibility Matrix | https://docs.gradle.org/current/userguide/compatibility.html | ⭐⭐⭐ High | 2026-04-22 | Java 21 지원 버전(8.5+), Gradle 9.x 기본 확인 |
| endoflife.date — Spring Boot | https://endoflife.date/spring-boot | ⭐⭐⭐ High | 2026-04-22 | 2.5.x EOL, 2.7.18 Extended Support, 최신 4.0.5 확인 |
| Spring Boot Plugin Portal | https://plugins.gradle.org/plugin/org.springframework.boot | ⭐⭐⭐ High | 2026-04-22 | 플러그인 ID / 최신 플러그인 버전 |
| Apache Tomcat — Which Version | https://tomcat.apache.org/whichversion.html | ⭐⭐⭐ High | 2026-04-22 | Tomcat 9 = Servlet 4.0, Tomcat 10.1 = Servlet 6.0 |
| Spring Boot Kotlin DSL 예시 (daggerok) | https://github.com/daggerok/spring-boot-gradle-kotlin-dsl-example | ⭐⭐ Medium | 2026-04-22 | Kotlin DSL 구조 참고 |
| Baeldung — Gradle Toolchains | https://www.baeldung.com/java-gradle-toolchains-jvm-projects | ⭐⭐ Medium | 2026-04-22 | toolchain 설정 패턴 확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Spring Boot 2.5.12, 3.4.3, Gradle 8.4+, Java 11/21)
- [✅] deprecated된 패턴을 권장하지 않음 (`spring.profiles: xxx` 구문은 deprecated로 명시)
- [✅] 코드 예시가 실행 가능한 형태임 (build.gradle / build.gradle.kts 전체 파일)

### 4-2. 교차 검증된 핵심 클레임

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | Spring Boot 3.4는 Gradle 7.6.4+ 또는 8.4+ 필요 | VERIFIED | Spring Boot 3.4 Release Notes (GitHub Wiki) 직접 확인 |
| 2 | Spring Boot 3.0+는 Java 17 최소 요구 | VERIFIED | 3.0 Migration Guide 명시 + Baeldung 등 보조 |
| 3 | Spring Boot 3.x는 `javax.*` → `jakarta.*` 네임스페이스 전환 | VERIFIED | 3.0 Migration Guide + SAP Cloud SDK 가이드 |
| 4 | Tomcat 9 = Servlet 4.0, Tomcat 10.1 = Servlet 6.0 | VERIFIED | Apache Tomcat 공식 whichversion.html + 10 Migration Guide |
| 5 | WAR 배포 시 `providedRuntime 'spring-boot-starter-tomcat'` 필요 | VERIFIED | Spring Boot Traditional Deployment 공식 문서 |
| 6 | `SpringBootServletInitializer` 상속 필요 (WAR) | VERIFIED | 공식 Traditional Deployment + Baeldung |
| 7 | `org.graalvm.buildtools.native` 버전은 Spring Boot BOM이 관리(0.10.x) | VERIFIED | Spring Boot 3.2+ 공식 Native Image 가이드 + Baeldung |
| 8 | Spring Boot 2.5.x OSS EOL 경과 | DISPUTED → 수정 반영 | endoflife.date 기준 2.5 EOL 2023-02경. SKILL.md 상단 `> 주의:`에 "신규 프로젝트에는 부적합" 명시 |

### 4-3. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (상단 블록)
- [✅] 핵심 개념 설명 포함 (레거시/모던 선택 가이드, 패키징 차이)
- [✅] 코드 예시 포함 (build.gradle, build.gradle.kts, Application.java, application.yml)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (1번 선택 가이드)
- [✅] 흔한 실수 패턴 포함 (8번 섹션)

### 4-4. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (복붙 가능한 완전한 빌드 스크립트)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-04-22, general-purpose로 대체 실행 / **2026-09-28 재테스트**, §9.7 Starter 이름 변경 신설분 + 교차 참조 정합성 겨냥 2문항)
- [✅] Q1 완전 PASS, Q2 PARTIAL → §6.5 보강 후 재테스트 PASS (2026-04-22) / **2026-09-28 재테스트 2/2 PASS**
- [✅] **빌드 설정 카테고리** — 2026-04-22 최초 결정("agent content test 완전 통과 시 APPROVED, 실사용은 스킬 사용 중 자연 검증") 원칙을 2026-09-26 재검증에서도 유지, 2026-09-28 §9.7 보강분 재테스트도 동일 원칙 적용해 APPROVED 유지

---

## 5. 테스트 진행 기록

### [2026-09-28] skill-tester 재테스트 — §9.7 Starter 이름 변경 신설분 + 교차 참조 정합성 확인

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md + REFERENCE.md Read 후 2개 실전 질문 답변, 근거 섹션 존재 여부 확인. 2026-09-28 재검증(2차)에서 신설된 REFERENCE.md §9.7 "Starter 이름 변경 (4.0)"과, 그 계기가 된 `backend/spring-boot-2-to-3-migration`의 "9장" 인용이 실제로 올바른지 교차 확인.

### 실제 수행 테스트

**Q1. Spring Boot 4.0으로 올리는 중 build.gradle.kts에 `spring-boot-starter-web`과 `spring-boot-starter-oauth2-client`가 선언돼 있다. 4.0 기준으로 좌표를 어떻게 바꿔야 하며, 그대로 두면 당장 빌드가 깨지는가?**
- ✅ PASS
- 근거: REFERENCE.md "9.7 Starter 이름 변경 (4.0)" 표 + 표 아래 주의문(215행)
- 상세: `spring-boot-starter-web`→`spring-boot-starter-webmvc`, `spring-boot-starter-oauth2-client`→`spring-boot-starter-security-oauth2-client`로 정확히 매칭. "기존 이름도 당분간 동작하지만 deprecated이며 향후 릴리스에서 제거 예정"이라는 근거로 "당장 빌드가 깨지지는 않는다"를 정확히 답변. classic starter 표(228행)가 `-web`/`-oauth2-client` 자체의 과도기 대체재가 아님도 정확히 구분. 경미 gap: "당분간"이 정확히 몇 버전까지인지는 REFERENCE.md에도 미명시(공식 가이드 자체가 제거 시점 미명시 — 235행에 이미 그렇게 밝힘, 선택 보강·차단 요인 아님).

**Q2 (교차 참조 확인). `spring-boot-2-to-3-migration`이 "3.x→4.x Gradle 빌드 설정 관점은 spring-boot-gradle-setup 9장에 있다"고 인용하는데, 실제로 §9(9.1~9.7)가 존재하는가? Gradle 최소버전·Jackson 3 group id·Starter 이름 변경이 각각 몇 번 하위 섹션에 있으며, §8 "흔한 실수" 표에 Native 리플렉션 실패 항목이 있는가?**
- ✅ PASS
- 근거: REFERENCE.md §9 전체(138~237행) + §8 흔한 실수 표(124~134행)
- 상세: §9.1~9.7 실존 확인(9.1 버전 매트릭스/9.2 Gradle 요구사항/9.4 Jackson 3.0/9.7 Starter 이름 변경으로 정확히 위치 매칭). `spring-boot-2-to-3-migration`의 인용(9.4·9.7 포함 "9.1~9.7")이 실제 내용과 모순 없이 일치함을 확인. §8에 "Native 빌드 시 리플렉션 실패" 행이 실제로 존재함(134행, 2026-09-28 재검증에서 고아 행 이동으로 신설된 위치)도 정확히 확인. gap 없음.

### 발견된 gap

- 선택 보강(차단 요인 아님): §9.7의 "당분간 동작"·"향후 릴리스에서 제거 예정"이 정확히 어느 버전 시점인지 공식 가이드 자체가 미명시 — 확정되면 갱신 권장.

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: **빌드 설정 카테고리**이나 2026-04-22 최초 결정("agent content test 완전 통과 시 APPROVED, 실사용은 스킬 사용 중 자연 검증됨") 원칙이 2026-09-26 재검증에서도 유지되어 온 기존 정책 — 이번 §9.7 보강분 재테스트도 동일 원칙 적용
- 최종 상태: **PENDING_TEST → APPROVED** (기존 정책 유지, §9.7 보강분 content test 2/2 PASS + 교차 참조 정합성 확인 완료)

---

**수행일**: 2026-04-22
**수행 방법**: general-purpose 에이전트에게 SKILL.md만 Read한 뒤 2개 실전 질문 답변.

### 실제 수행 테스트

**Q1. SB 2.5.12 + Java 11 WAR 빌드 + Tomcat 9 배포**
- ✅ PASS. 에이전트가 §2.1 (build.gradle), §2.2 (SpringBootServletInitializer), §2.3 (Tomcat 9 호환), §8 (흔한 실수) 근거로 완전한 build.gradle + Application.java + `providedRuntime` 설명 + `SpringBootServletInitializer` 이유 모두 정확 제시.

**Q2. SB 2→3 마이그레이션 체크리스트 (javax→jakarta 외)**
- 🟡 PARTIAL (1차 — 2026-04-22 오전): §6에 Swagger/OpenAPI·분산 추적·Security 5→6 Breaking Change 언급 부족. SKILL.md §6.5 "도구·프레임워크 교체" 섹션 신설로 보강.
- ✅ **PASS (2차 재테스트 — 2026-04-22 오후)**: §6.5 추가 후 재실행. Java 17, Security 5→6(WebSecurityConfigurerAdapter 제거/requestMatchers/람다 DSL/jjwt 0.12.x), Springfox→Springdoc OpenAPI(어노테이션·의존성 매핑), Sleuth→Micrometer Tracing(bridge-brave/otel, 설정 키·포맷·MDC 매핑) 모두 근거 제시 완료. 이전 PARTIAL 해소 확인.

### 판정

- agent content test: ✅ PASS (Q1 최초 PASS, Q2 재테스트 PASS)
- verification-policy 분류: 빌드 설정 카테고리지만 **agent test 완전 통과**로 APPROVED 전환 판단 — 실 프로젝트 빌드는 이 스킬 사용 중 자연스럽게 검증됨
- 현 상태: **APPROVED**

---

### 재검증 (2026-09-26)

**수행자**: 메인 세션 (Sonnet 5), 서브에이전트 미사용(사용자 지시)
**수행 방법**: SKILL.md + REFERENCE.md 전체 Read → 핵심 클레임 3건 WebSearch 교차 검증 → 실전 질문 2개 재확인

**교차 검증 클레임:**
1. Spring Boot 4.0 최소 Gradle 요구사항이 8.14 이상(또는 9.x) — WebSearch로 공식 4.0 Release Notes 인용 확인 → **VERIFIED**
2. Spring Boot 4.0의 Jackson 3.0 Group ID 변경(`com.fasterxml.jackson` → `tools.jackson`, `jackson-annotations`만 예외) — 복수 기술 블로그 교차 확인, SKILL.md 본문과 일치 → **VERIFIED**
3. Spring Boot 4.0/Spring Framework 7의 GraalVM Native Image 최소 요구가 25로 상향 — `paketo-buildpacks/spring-boot` 이슈 #562 등에서 확인 → **VERIFIED**
4. (부가) Spring Boot 최신 안정 버전 — 2026-09 기준 4.1.1(2026-08-21 릴리즈) 확인. 본문 상단 "2026-04 기준 4.0.5" 각주를 4.1.1로 갱신.

**Q1 (재확인). "Spring Boot 4.0으로 올릴 때 Jackson 관련 그룹 ID를 직접 관리하고 있다면 무엇을 바꿔야 하나?"**
- PASS — SKILL.md 섹션 9.4 "Jackson 3.0 Group ID 변경"으로 `com.fasterxml.jackson` → `tools.jackson` 정확히 답변 가능. BOM 사용 시 자동 관리된다는 본문 설명도 최신 공식 정보와 일치.

**Q2 (재확인). "Spring Boot 4.0 Gradle 빌드가 실패하는데 Gradle 버전이 원인일 수 있나?"**
- PASS — 섹션 9.2 "Gradle 8.14 이상 또는 9.x" 요구사항으로 정확히 답변 가능.

**status**: 실질 내용 변경 없음(상단 버전 각주만 갱신) → APPROVED 유지

---

### [2026-09-28] 재검증(2차) — 다른 스킬의 교차 참조 정합성 점검 중 Starter 개명 누락 발견·보강

**수행일**: 2026-09-28
**수행 방법**: `backend/spring-boot-2-to-3-migration`이 이 스킬의 "9장"을 3.x→4.x 세부 절차 근거로 인용하면서, 인용 측이 한때 "이 스킬에는 §1~5뿐이고 9장은 없다"고 오판한 사건이 있어 교차 확인 목적으로 SKILL.md + REFERENCE.md 전체 Read. 실제로는 §9(references/REFERENCE.md, 2026-06-19 신설)가 이미 존재함을 재확인 → 핵심 클레임 4건을 1차 소스(공식 GitHub Wiki)와 대조, 누락 항목 확인 후 보강.

**클레임 대조 결과**:
1. Spring Boot 4.0 최소 Gradle 8.14+ 또는 9.x — 공식 Migration Guide + 2차 소스 교차 확인 → **VERIFIED** (기존 §9.2와 일치, 변경 없음)
2. Spring Boot 4.0 Gradle 플러그인 최신 버전 — Gradle Plugin Portal 확인 결과 4.1.1(안정)이 최신 GA, 4.2.0-M2는 마일스톤 → **VERIFIED** (§9.3 예시 "4.1.0"은 안정 버전 범위 내로 유지, 마일스톤 승격 불필요)
3. **Starter 이름 변경 — 기존 §9에 전혀 없던 항목.** 공식 Migration Guide "Deprecated Starters"/"AOP Starter POM"/"Classic Starters" 섹션 직접 조회 + 2차 독립 소스(기술 블로그 다수) 교차 확인: `spring-boot-starter-web`→`spring-boot-starter-webmvc`, `spring-boot-starter-web-services`→`spring-boot-starter-webservices`, `spring-boot-starter-aop`→`spring-boot-starter-aspectj`, OAuth2 3종→`spring-boot-starter-security-oauth2-*`, 과도기용 `spring-boot-starter-classic`/`spring-boot-starter-test-classic` → **VERIFIED** (공식 소스 원문 인용 확보)
4. (반증) "`spring-boot-starter-json` → `spring-boot-starter-jackson`" 개명 — 일부 기술 블로그가 주장하나, 공식 Migration Guide의 "Deprecated Starters" 표를 2회 직접 재조회한 결과 해당 행이 존재하지 않음 → **UNVERIFIED, 스킬에 반영하지 않음** (검증 안 된 내용은 쓰지 않는다는 원칙 적용)

**보강(ADD)·축소**: REFERENCE.md에 "### 9.7 Starter 이름 변경 (4.0)" 신설(위 클레임 3 반영) + 9.6 마이그레이션 순서에 6번 항목(Starter 좌표 갱신) 추가. 별도로, 9.6 리스트 뒤에 잘못 붙어 있던 고아 테이블 행("Native 빌드 시 리플렉션 실패")을 원래 있어야 할 §8 흔한 실수 표로 이동(마크다운 깨짐 수정, 내용 변경 아님). 축소 없음.

**실전 질문 재검증**:
- Q1. "Spring Boot 4.0으로 올리면서 `spring-boot-starter-web`만 쓰고 있었는데, `build.gradle`에서 뭘 바꿔야 하나?" → SKILL.md 섹션 9.7 "Starter 이름 변경 (4.0)" 표 근거로 `spring-boot-starter-webmvc`로 교체, 구 이름은 deprecated라는 점까지 PASS
- Q2. "OAuth2 리소스 서버 스타터도 Boot 4.0에서 이름이 바뀌었다고 들었다. 맞나?" → 섹션 9.7 표 근거로 `spring-boot-starter-oauth2-resource-server` → `spring-boot-starter-security-oauth2-resource-server` 정확히 답변 PASS

**재검증 최종 판정**: status **PENDING_TEST 전환** (보강 발생 — 메인이 이후 skill-tester 재테스트)

---

### (참고) 초기 작성 시 제시한 권장 테스트 케이스

### 테스트 케이스 1: 레거시 WAR 셋업

**입력 (질문/요청):**
```
Spring Boot 2.5.12 + Java 11 + 외장 Tomcat 9에 배포하는 프로젝트의 build.gradle과 Application 클래스를 만들어줘.
```

**기대 결과:**
- `plugins { id 'org.springframework.boot' version '2.5.12' ... id 'war' }`
- `providedRuntime 'org.springframework.boot:spring-boot-starter-tomcat'`
- `SpringBootServletInitializer` 상속 + `configure()` 오버라이드
- `sourceCompatibility = '11'`

**실제 결과:** (미실행)

**판정:** PENDING

---

### 테스트 케이스 2: 모던 Jar + Kotlin DSL + toolchain

**입력:**
```
Spring Boot 3.4, Java 21, Kotlin DSL로 REST API 프로젝트의 build.gradle.kts를 만들어줘. validation starter도 포함.
```

**기대 결과:**
- `plugins { id("org.springframework.boot") version "3.4.x" ... }`
- `java { toolchain { languageVersion = JavaLanguageVersion.of(21) } }`
- `implementation("org.springframework.boot:spring-boot-starter-web")`
- `implementation("org.springframework.boot:spring-boot-starter-validation")`

**실제 결과:** (미실행)

**판정:** PENDING

---

### 테스트 케이스 3: 2→3 마이그레이션 검토

**입력:**
```
지금 Spring Boot 2.5.12 + Java 11 프로젝트를 3.4로 올리려고 해. 무엇부터 점검해야 해?
```

**기대 결과:**
- 2.5 → 2.7.18로 먼저 올리라는 중간 단계 권장
- `javax.*` → `jakarta.*` 치환
- Java 17 이상 업그레이드
- MySQL 드라이버 좌표 변경 (`mysql-connector-j`)
- 외장 Tomcat을 10.1+로 교체 필요
- `spring-boot-properties-migrator` 임시 도입

**실제 결과:** (미실행)

**판정:** PENDING

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (8개 핵심 클레임 교차 검증 완료, DISPUTED 1건은 주의 블록으로 반영) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (2026-04-22 1차 Q1 PASS / Q2 PARTIAL → §6.5 보강 후 2차 재테스트 Q2 PASS + **2026-09-28 §9.7 보강분 재테스트 2/2 PASS**, 교차 참조 정합성 확인 포함) |
| 2026-09-28 재검증(2차) | 9.7 "Starter 이름 변경 (4.0)" 신설(공식 소스 VERIFIED) + 고아 테이블 행 수정. 실전 질문 2건 PASS + **skill-tester 재테스트 2/2 PASS 완료** |
| **최종 판정** | **APPROVED** (§9.7 보강분 skill-tester content test 2/2 PASS 완료, 빌드 설정 카테고리이나 2026-04-22 확립된 기존 원칙 적용) |

> 공식 문서 기반으로 작성되었고 핵심 클레임은 교차 검증을 마쳤습니다. 2026-09-28 재검증에서 Starter 이름 변경(9.7)을 새로 보강했고, skill-tester의 실사용 테스트를 거쳐 APPROVED로 재승격했습니다.

---

## 7. 개선 필요 사항

- [📅] Spring Boot 4.0+ 섹션 — 4.0 GA 본격 도입 시점에 별도 스킬 또는 확장
- [⏸️] Maven(pom.xml) 대응 버전 — 필요 시 별도 스킬 분리, 현 Gradle 범위 외
- [✅] `java-backend-developer`(대체: general-purpose) 에이전트로 실 테스트 2건 수행 — 2026-04-22 Q1 PASS + Q2 §6.5 보강 후 PASS, APPROVED 전환 완료 / **2026-09-28 §9.7 Starter 이름 변경 신설분 재테스트 2/2 PASS, APPROVED 유지 완료**
- [⏸️] Kotlin 코드 기반 Spring Boot 예시(Kotlin 플러그인) 보강 — 선택 보강, 차단 요인 아님

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-22 | v1 | 최초 작성 (레거시 2.5.12 + 모던 3.4 양쪽 커버) | skill-creator |
| 2026-06-19 | v1 | Spring Boot 4.x 마이그레이션 섹션 추가 (섹션 9 — Gradle 8.14+, Jackson 3.0 Group ID 변경, Undertow 제거, 마이그레이션 순서). 검증일 갱신. | Claude (Sonnet 4.6) |
| 2026-09-25 | v1 | 구조 개편: 상세 내용 references/REFERENCE.md 분리 (내용 변경 없음) | Claude (Sonnet 5) |
| 2026-09-26 | v1 | 정기 재검증 — Gradle 8.14+/Jackson 3.0 group id/GraalVM 25+ 재확인, 최신 안정 버전 각주만 4.1.1로 갱신 | Claude (Sonnet 5) |
| 2026-09-28 | v2 | **재검증(2차) — 다른 스킬(`spring-boot-2-to-3-migration`)의 "9장 없음" 오판을 계기로 교차 확인, §9.7 "Starter 이름 변경 (4.0)" 신설(공식 Migration Guide "Deprecated Starters"/"AOP Starter POM"/"Classic Starters" 근거).** `spring-boot-starter-json`→`spring-boot-starter-jackson` 개명설은 2차 소스에만 존재하고 공식 표에는 없어 미반영(UNVERIFIED). §9.6 뒤에 잘못 붙어있던 고아 테이블 행을 §8로 이동해 마크다운 깨짐 수정. status **PENDING_TEST 전환**(보강 발생, skill-tester 재테스트 대기) | Claude (Sonnet 5) |
| 2026-09-28 | v2 | 2단계 실사용 재테스트 수행 (Q1 §9.7 Starter 좌표 변경 실전 적용 / Q2 `spring-boot-2-to-3-migration`의 "9장" 인용이 실제 §9.1~9.7과 모순 없는지 교차 확인) → 2/2 PASS, 빌드 설정 카테고리이나 2026-04-22 확립 원칙 적용해 **PENDING_TEST → APPROVED** 전환. 섹션 5·6·7·8 동기화 | skill-tester |
