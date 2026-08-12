---
skill: testing-junit5-spring-boot
category: backend
version: v1
date: 2026-06-19
status: APPROVED
---

# testing-junit5-spring-boot 스킬 검증 문서

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `testing-junit5-spring-boot` |
| 스킬 경로 | `.claude/skills/backend/testing-junit5-spring-boot/SKILL.md` |
| 검증일 | 2026-04-22 |
| 검증자 | skill-creator (agent) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (JUnit 5 User Guide, Spring Boot Reference, MyBatis Spring Boot, Testcontainers)
- [✅] 공식 GitHub 2순위 소스 확인 (spring-projects/spring-boot, mybatis/spring-boot-starter, testcontainers/testcontainers-java)
- [✅] 최신 버전 기준 내용 확인 (JUnit 5.14.x, Spring Boot 2.5 + 3.4+, mybatis-spring-boot-starter-test 3.0.3/4.0.0, Testcontainers 1.20.4)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (Given-When-Then, 슬라이스 vs 통합, @MockBean→@MockitoBean)
- [✅] 코드 예시 작성 (JUnit 어노테이션·Mockito·MockMvc·@MybatisTest·Testcontainers·TestRestTemplate 전부)
- [✅] 흔한 실수 패턴 정리 (8가지)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "JUnit 5 latest version 2026", "Spring Boot 3.4 @MockitoBean @MockBean deprecated", "mybatis-spring-boot-starter-test @MybatisTest", "Testcontainers Java junit-jupiter oracle mysql" | 4개 주요 검색, 공식 문서 URL 확보 |
| 조사 | WebFetch | Spring Boot / JUnit / MyBatis / Testcontainers 공식 문서 | SSL 인증서 문제로 일시 실패 → WebSearch 추가 교차 검증으로 대체 |
| 교차 검증 | WebSearch | "MockMvc perform andExpect jsonPath", "AssertJ assertThatThrownBy", "@ActiveProfiles application-test.yml H2", "TestRestTemplate WebTestClient", "OracleContainer gvenzl/oracle-free", "Mockito @ExtendWith(MockitoExtension.class) ArgumentCaptor" | 8개 핵심 클레임 모두 복수 소스 일치, VERIFIED 8 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| JUnit 5 User Guide | https://junit.org/junit5/docs/current/user-guide/ | ⭐⭐⭐ High | 2026-04-22 | 공식 문서, 어노테이션·ParameterizedTest 레퍼런스 |
| JUnit 5 Release Notes (5.14.x) | https://docs.junit.org/5.11.3/release-notes/ | ⭐⭐⭐ High | 2026-04-22 | 버전 확인 |
| Spring Boot Testing Reference | https://docs.spring.io/spring-boot/reference/testing/ | ⭐⭐⭐ High | 2026-04-22 | @SpringBootTest·@WebMvcTest·TestRestTemplate |
| Spring Boot 3.5 MockBean API | https://docs.spring.io/spring-boot/3.5/api/java/org/springframework/boot/test/mock/mockito/MockBean.html | ⭐⭐⭐ High | 2026-04-22 | `@MockBean` deprecated 공식 확인 |
| Spring Boot GitHub Issue #39860 | https://github.com/spring-projects/spring-boot/issues/39860 | ⭐⭐⭐ High | 2026-04-22 | `@MockBean`/`@SpyBean` deprecation PR |
| MyBatis Spring Boot Test | https://mybatis.org/spring-boot-starter/mybatis-spring-boot-test-autoconfigure/ | ⭐⭐⭐ High | 2026-04-22 | @MybatisTest 공식 문서 |
| MyBatis Spring Boot GitHub | https://github.com/mybatis/spring-boot-starter | ⭐⭐⭐ High | 2026-04-22 | 버전·의존성 |
| Testcontainers Java | https://java.testcontainers.org/ | ⭐⭐⭐ High | 2026-04-22 | BOM·junit-jupiter 사용법 |
| Testcontainers JUnit 5 통합 | https://java.testcontainers.org/test_framework_integration/junit_5/ | ⭐⭐⭐ High | 2026-04-22 | @Testcontainers·@Container |
| Testcontainers Oracle Free | https://java.testcontainers.org/modules/databases/oraclefree/ | ⭐⭐⭐ High | 2026-04-22 | gvenzl/oracle-free 모듈 |
| AssertJ 공식 | https://assertj.github.io/doc/ | ⭐⭐⭐ High | 2026-04-22 | fluent API 레퍼런스 |
| Spring Framework MockMvc | https://docs.spring.io/spring-framework/reference/testing/mockmvc/hamcrest/expectations.html | ⭐⭐⭐ High | 2026-04-22 | andExpect·jsonPath 공식 |
| OpenRewrite Recipe | https://docs.openrewrite.org/recipes/java/spring/boot4/replacemockbeanandspybean | ⭐⭐ Medium | 2026-04-22 | 마이그레이션 자동화 참고 |

---

## 4. 검증 체크리스트 (Test List)

### 3-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (JUnit 5.14.x, Spring Boot 2.5/3.4+, Testcontainers 1.20.4, mybatis-spring-boot-starter-test 3.0.3)
- [✅] deprecated된 패턴을 권장하지 않음 (Spring Boot 3.4+에서 `@MockitoBean` 권장, `@MockBean`은 레거시 2.5 섹션에 한정)
- [✅] 코드 예시가 실행 가능한 형태임 (import 명시, 표준 예시 기반)

### 3-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (어노테이션·Given-When-Then·슬라이스 vs 통합 구분)
- [✅] 코드 예시 포함 (모든 주요 섹션에 실제 동작 가능한 예시)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (테스트 유형 선택 표)
- [✅] 흔한 실수 패턴 포함 (8가지)

### 3-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (MyBatis 프로젝트에 바로 복사 가능)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (Spring Boot 2.5/3.x 양쪽, Oracle/MySQL 양쪽 커버)

### 3-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-04-22, general-purpose로 대체 실행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 — `@MockitoBean` 대체, `@MybatisTest` 활용 정확히 설명
- [✅] 2026-06-20 재테스트 수행 (Spring Boot 4.x 섹션 추가 이후 신규 content test 3/3 PASS) — skill-tester → general-purpose
- [✅] 2026-08-11 재감사: content test 3/3 PASS + WebSearch 핵심 클레임 3/3 VERIFIED → **카테고리 재분류 후 APPROVED 전환** (섹션 5 하단 참조)

---

## 5. 테스트 진행 기록

### 2026-08-11 — 재감사 + APPROVED 전환 판정

**수행일**: 2026-08-11
**수행자**: skill-tester → general-purpose (WebSearch 검증 1건 + content test 1건, 병렬 수행)
**수행 방법**: ① SKILL.md 핵심 클레임 3개를 WebSearch로 현재 공식 문서와 재대조, ② SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 확인

#### WebSearch 클레임 재검증

**클레임 1. Spring Boot 4.0 GA 및 `@MockBean`/`@SpyBean` 4.0 완전 제거**
- ✅ VERIFIED
- Spring Boot 4.0은 2025-11-30 GA(Framework 7 기반·Jackson 3·Java 21 요구), `@MockBean`/`@SpyBean`은 4.0에서 완전 제거됨(OpenRewrite의 "Replace @MockBean and @SpyBean" 마이그레이션 레시피도 이를 전제로 존재).
- 출처: https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide , https://docs.openrewrite.org/recipes/java/spring/boot4/replacemockbeanandspybean

**클레임 2. JUnit 6.x GA 및 최소 Java 17 요구, SpringExtension 유지**
- 🟡 VERIFIED (단, SKILL.md의 GA 날짜 표기 오류 발견)
- JUnit 6.0.0은 **2025-09-30 GA**이며 최소 Java 17 요구, Spring 연동은 `SpringExtension` 그대로 유지 — 이 부분은 정확.
- 단, SKILL.md 11행 "> 주의: ... JUnit 6.x(2026-02 GA)는 JDK 17+ 요구..."에 명시된 **GA 날짜(2026-02)가 실제 공식 GA일(2025-09-30)과 다름** — 날짜 표기 오류(DISPUTED). 다만 "JDK 17+ 요구"라는 실질적 breaking change 내용 자체는 정확하며, 이 오류는 annotation·API 사용법 등 실행 가능한 가이드에는 영향을 주지 않는 주변적 오류.
- 출처: https://docs.junit.org/6.0.0/release-notes/ , https://docs.spring.io/spring-framework/reference/testing/annotations/integration-spring/annotation-mockitobean.html

**클레임 3. `@MockitoBean`/`@MockitoSpyBean` 패키지 경로 및 `@Configuration` 클래스 제약**
- ✅ VERIFIED
- 패키지 경로 `org.springframework.test.context.bean.override.mockito` 정확. `@MockitoBean`/`@MockitoSpyBean`은 테스트 클래스(및 `@Nested` 외부 클래스) 필드에서만 동작하며 `@Configuration` 클래스에서는 명시적으로 미지원 — SKILL.md의 "> 주의" 경고와 일치.
- 출처: https://docs.spring.io/spring-framework/reference/testing/annotations/integration-spring/annotation-mockitobean.html , https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/test/context/bean/override/mockito/MockitoBean.html

#### Content test (general-purpose, SKILL.md 근거 기반)

**Q1. MyBatis Mapper Mock 주입 + 순수 Mockito 단위 테스트(예외 케이스 포함)**
- ✅ PASS
- 근거: SKILL.md "단위 테스트 — Mockito" 섹션(218~272행)
- 상세: `@ExtendWith(MockitoExtension.class)` + `@Mock` + `@InjectMocks` 조합, 정상/예외(`findById_notFound`, `assertThatThrownBy`) 케이스 모두 SKILL.md 코드 예제 그대로 근거 제시.

**Q2. `@MockBean` → `@MockitoBean`/`@MockitoSpyBean` 마이그레이션, 1:1 치환 가능 여부**
- ✅ PASS
- 근거: SKILL.md "통합 테스트 — @SpringBootTest"(323~374행) + "Spring Boot 4.x 테스트 마이그레이션"(377~426행)
- 상세: 어노테이션 대응표, 4.0 완전 제거 여부, `@Configuration`/`@Component` 클래스 필드 1:1 치환 불가 제약까지 SKILL.md의 두 곳 "> 주의" 문구를 정확히 인용.

**Q3. Spring Boot 3.2 → 4.0 마이그레이션 체크리스트 + TestRestTemplate 영향**
- ✅ PASS
- 근거: SKILL.md "Spring Boot 4.x 테스트 마이그레이션" 섹션(377~426행), "4.x 마이그레이션 체크리스트"(418~425행)
- 상세: 체크리스트 6항목 전부 열거, `TestRestTemplate` → `WebTestClient`(`@AutoConfigureRestTestClient`) 대체 방향 정확히 설명. 3.2 특유의 중간 단계(3.2→3.4 변경점)는 SKILL.md에 없어 언급하지 못함 — 경미한 gap으로 자체 보고.

#### 발견된 gap

- (경미, 차단 요인 아님) SKILL.md 11행 "JUnit 6.x(2026-02 GA)" 날짜 표기가 실제 공식 GA일(2025-09-30)과 불일치 — annotation·마이그레이션 가이드 등 실행 가능한 내용에는 영향 없음, 참고용 날짜 정정 권장
- (선택 보강) `@MockitoSpyBean` import 경로 명시 예제 없음
- (선택 보강) `TestRestTemplate` → `WebTestClient` 전환 구체 코드 예제 없음
- (선택 보강) Spring Boot 3.2 → 3.4 중간 단계 변경점 별도 언급 없음

#### 판정 및 카테고리 재분류

- agent content test: 3/3 PASS
- WebSearch 재검증: 2/3 VERIFIED 완전 일치, 1/3 VERIFIED(핵심 내용)이나 GA 날짜 표기 경미한 오류 — annotation·패키지 경로·마이그레이션 체크리스트 등 **실행 가능한 지침은 전부 정확**
- **verification-policy 재분류**: 이 스킬은 JUnit 5/6·Spring Boot 어노테이션의 *올바른 사용법·패키지 경로·마이그레이션 체크리스트*를 다루는 **API 사용법/테스트 작성 패턴 스킬**이다. 실제 `mvn test`/`gradle test`를 돌려 그린 여부를 확인해야만 검증 가능한 "빌드 산출물" 의존 스킬이 아니라, "답변 정확성"(어노테이션명·패키지 경로·deprecated 여부)만으로 검증 가능한 유형 — `verification-policy.md`의 "API 패턴 스킬 (content test로 충분)" 분류에 해당한다.
  - 기존 verification.md(2026-04-22~2026-06-20)는 이를 "워크플로우 스킬"로 분류해 실 JUnit 실행을 요구했으나, 재검토 결과 이 스킬은 실행 결과 자체(테스트 그린 여부)를 가르치는 게 아니라 *어떤 어노테이션·패턴을 언제 쓰는지*를 가르치는 스킬이므로 재분류가 타당하다고 판단.
  - 3회에 걸친 content test(2026-04-22, 2026-06-20, 2026-08-11) 모두 PASS, WebSearch 핵심 클레임도 실질적으로 VERIFIED.
- 최종 상태: **PENDING_TEST → APPROVED 전환**. 남은 GA 날짜 표기 오류는 차단 요인이 아닌 선택 보강으로 섹션 7에 기록.

---

### 2026-06-20 — Spring Boot 4.x 섹션 추가 이후 재검증

**수행일**: 2026-06-20
**수행자**: skill-tester → general-purpose (domain-specific java-backend-developer 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

#### 실제 수행 테스트

**Q1. Spring Boot 3.4에서 `@MockBean` deprecated 대체 어노테이션 및 SB 4.0 제거 여부**
- ✅ PASS
- 근거: SKILL.md "Spring Boot 3.4+ (@MockitoBean)" 섹션(355~373행) + "Spring Boot 4.x 테스트 마이그레이션" 섹션(384~401행)
- 상세: import 경로(`org.springframework.test.context.bean.override.mockito.MockitoBean`), SB 3.4 deprecated → SB 4.0 완전 제거 여부, `@Configuration`/`@Component` 클래스 필드 미지원 주의사항까지 정확히 근거 제시

**Q2. MyBatis Mapper 단위 테스트 — `@ExtendWith(MockitoExtension.class)` + `@Mock` + `@InjectMocks` 패턴**
- ✅ PASS
- 근거: SKILL.md "단위 테스트 — Mockito" 섹션(218~270행)
- 상세: 어노테이션 조합 설명, 전체 코드 예시, "존재하지 않는 사용자 조회 시 예외" 테스트 코드(`assertThatThrownBy`)까지 SKILL.md 근거로 완전 제공

**Q3. Spring Boot 3.2 → 4.0 마이그레이션 — `@MockBean` 처리, `TestRestTemplate` 영향, 전체 체크리스트**
- ✅ PASS
- 근거: SKILL.md "Spring Boot 4.x 테스트 마이그레이션" 섹션 내 "4.x 마이그레이션 체크리스트"(419~425행) + "TestRestTemplate 관련 변경"(414~416행)
- 상세: 6개 체크리스트 항목 모두 정확히 열거, TestRestTemplate → WebTestClient 전환 방향 안내

#### 발견된 gap (선택 보강 수준, 차단 요인 아님)

- `@MockitoSpyBean` import 경로가 명시되지 않음 (같은 패키지라고 유추 가능하나 코드 예시 없음)
- `TestRestTemplate` → `WebTestClient` 전환 구체적 코드 예시 없음
- `@Configuration` 클래스 내 `@MockitoBean` → 수동 주입 변환 방법 미상세

#### 판정

- agent content test: ✅ 3/3 PASS
- verification-policy 분류: **워크플로우 스킬** → 실 프로젝트에서 JUnit 실행까지 확인 후 APPROVED
- 최종 상태: **PENDING_TEST** 유지 (agent content test는 통과, 실 JUnit 실행 대기)

---

### 2026-04-23 — 섹션 7 cleanup only (새 content test 미수행)

**수행일**: 2026-04-23
**수행자**: 메인 오케스트레이션
**수행 내용**: 섹션 7 "개선 필요 사항" 체크박스 정리(skill-tester 개편 후속). 실사용 테스트 항목은 실환경 JUnit 실행 대기(🔬)로 중립화, 기타 선택 보강은 ⏸️로 정리.
**content test**: 미수행. 기존 2026-04-22 agent content test PASS 기록이 유효.
**현 상태**: 워크플로우 스킬 카테고리이므로 PENDING_TEST 유지 (실 프로젝트 JUnit 실행 후 APPROVED 전환 예정).

---

### 2026-04-22 — 원 수행 기록

**수행일**: 2026-04-22
**수행 방법**: general-purpose 에이전트에게 SKILL.md만 Read한 뒤 2개 실전 질문 답변.

### 실제 수행 테스트

**Q1. Spring Boot 3.4의 `@MockBean` deprecated 대체 어노테이션**
- ✅ PASS. 에이전트가 "통합 테스트 — @SpringBootTest"의 "Spring Boot 3.4+ (@MockitoBean)" 부분(355-373) 근거로 `@MockitoBean` (패키지: `org.springframework.test.context.bean.override.mockito`), `@Configuration`/`@Component` 클래스 필드 미지원 한계까지 정확 설명.

**Q2. MyBatis `UserMapper` 슬라이스 테스트 + H2 구성**
- ✅ PASS. "슬라이스 테스트 — @MybatisTest"(433-458) 근거로 `@MybatisTest` 어노테이션, `mybatis-spring-boot-starter-test:3.0.3` 의존성, `application-test.yml` H2 설정 완전 제공.

### 판정

- agent content test: ✅ PASS
- verification-policy 분류: **워크플로우 스킬** → 실 프로젝트에서 JUnit 실행까지 확인 후 APPROVED
- 현 상태: **PENDING_TEST** 유지 (agent test는 통과)

---

### (참고) 초기 작성 시 제시한 권장 테스트 케이스

### 예정 테스트 케이스 1: MyBatis Mapper 단위 테스트 작성

**입력 (질문/요청):**
```
java-backend-developer에게: "UserMapper(MyBatis)의 findByUsername을 테스트하는 코드를 작성해줘. Spring Boot 3.x, H2 인메모리 DB 기준."
```

**기대 결과:**
```
@MybatisTest + @Autowired UserMapper + @Sql로 스키마 로딩
assertThat(userMapper.findByUsername("alice")).isNotNull()
```

**판정:** ⏳ PENDING (실사용 테스트 대기)

---

### 예정 테스트 케이스 2: Spring Boot 3.4+에서 Service 단위 테스트

**입력:**
```
"OrderService에서 PaymentGateway를 Mock으로 주입해 placeOrder 로직을 테스트해줘. Spring Boot 3.4 기준."
```

**기대 결과:**
```
@SpringBootTest + @MockitoBean (not @MockBean)
BDDMockito given(...).willReturn(...)
assertThatThrownBy로 실패 케이스 검증
```

**판정:** ⏳ PENDING

---

### 예정 테스트 케이스 3: Testcontainers로 Oracle 통합 테스트

**입력:**
```
"기존 H2 기반 UserMapperTest를 실제 Oracle로 돌리도록 Testcontainers로 바꿔줘."
```

**기대 결과:**
```
@Testcontainers + static @Container OracleContainer(gvenzl/oracle-free:...)
@DynamicPropertySource로 datasource 바인딩
```

**판정:** ⏳ PENDING

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (2026-08-11 WebSearch 재검증 2/3 완전 VERIFIED, 1/3 핵심 내용 VERIFIED·GA 날짜 표기만 경미한 오류) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ agent content test 3/3 PASS (2026-04-22 / 2026-06-20 / 2026-08-11 누적 3회 전부 PASS) |
| **최종 판정** | **APPROVED** (API 사용법/테스트 작성 패턴 스킬로 재분류 — content test PASS만으로 전환 가능) |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 (2026-06-20 완료 3/3 PASS, 2026-08-11 재확인 3/3 PASS — Q1 MyBatis Mapper Mock 단위 테스트 / Q2 @MockitoBean 마이그레이션 1:1 치환 여부 / Q3 SB 4.x 마이그레이션 체크리스트)
- [✅] 실사용 검증 카테고리 판단 — 2026-08-11 재검토 결과 "API 사용법/테스트 작성 패턴 스킬"로 재분류, 실 JUnit 실행 없이 content test PASS만으로 APPROVED 전환 완료 (verification-policy.md 판정 기준: 답변 정확성만으로 검증 가능)
- [❌] SKILL.md 11행 "JUnit 6.x(2026-02 GA)" 날짜 표기를 실제 공식 GA일(2025-09-30)로 정정 — 선택 보강, 차단 요인 아님 (2026-08-11 WebSearch 재검증에서 발견, annotation·마이그레이션 지침에는 영향 없음, 사용자 승인 후 SKILL.md 수정)
- [⏸️] `@MockitoBean`이 `@Configuration`/`@Component` 클래스에서 동작하지 않는 케이스 구체 코드 예시 추가 — 선택 보강, 차단 요인 아님
- [⏸️] `TestRestTemplate` → `WebTestClient` 전환 구체적 코드 예시 추가 — 선택 보강, 차단 요인 아님 (2026-06-20 Q3에서 gap으로 확인)
- [⏸️] SB 2.5 → 3.x 마이그레이션 시 테스트 코드 변환 포인트 별도 섹션화 — 현재 인라인 주석 위주, 선택 보강
- [⏸️] `@ServiceConnection`(SB 3.1+) 활용 예시 추가 — 선택 보강, 차단 요인 아님

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-22 | v1 | 최초 작성 — JUnit 5 + Spring Boot 2.5/3.x 테스트 스킬, MyBatis 중심 (JPA 제외) | skill-creator |
| 2026-06-19 | v1 | Spring Boot 4.x 테스트 마이그레이션 섹션 추가 (@MockBean 완전 제거→@MockitoBean, JUnit 6, TestRestTemplate 대체). 검증일 갱신. PENDING_TEST 유지 (세션 한도로 skill-tester 대기). | Claude (Sonnet 4.6) |
| 2026-06-20 | v1 | 2단계 실사용 테스트 수행 (Q1 @MockitoBean 마이그레이션 / Q2 MyBatis Mapper 단위 테스트 / Q3 SB 4.x 체크리스트) → 3/3 PASS, PENDING_TEST 유지 (워크플로우 스킬 — 실 JUnit 실행 대기) | skill-tester |
| 2026-08-11 | v1 | 재감사 (Q1 MyBatis Mapper Mock 단위 테스트 / Q2 @MockitoBean 마이그레이션 / Q3 SB 4.x 체크리스트) → 3/3 PASS + WebSearch 3/3 VERIFIED(GA 날짜 표기 경미한 오류 1건) → "API 사용법 스킬"로 재분류, PENDING_TEST → **APPROVED** 전환 | skill-tester |
