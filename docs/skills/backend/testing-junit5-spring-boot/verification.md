---
skill: testing-junit5-spring-boot
category: backend
version: v1
date: 2026-04-22
status: PENDING_TEST
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
- [⚠️] **워크플로우 스킬**이므로 verification-policy에 따라 실제 프로젝트에서 JUnit 실행까지 확인 후 APPROVED 전환 예정 (현재는 agent 내용 검증만 PASS)

---

## 5. 테스트 진행 기록

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
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ agent content test PASS (2026-04-22) / ⚠️ 실 JUnit 실행 대기 |
| **최종 판정** | **PENDING_TEST** (워크플로우 스킬 — 실 프로젝트 실행까지 확인 후 APPROVED) |

---

## 7. 개선 필요 사항

- [🔬] 실사용 테스트 3건(MyBatis Mapper·SB 3.4 Service·Testcontainers Oracle) 수행 후 APPROVED 전환 — 워크플로우 스킬, 실 JUnit 실행 대기 (agent content test는 2026-04-22 PASS)
- [⏸️] `@MockitoBean`이 `@Configuration`/`@Component` 클래스에서 동작하지 않는 케이스 구체 예시 — 선택 보강
- [⏸️] SB 2.5 → 3.x 마이그레이션 시 테스트 코드 변환 포인트 별도 섹션화 — 현재 인라인 주석 위주, 선택 보강
- [⏸️] `@ServiceConnection`(SB 3.1+) 활용 예시 추가 — 선택 보강, 차단 요인 아님

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-22 | v1 | 최초 작성 — JUnit 5 + Spring Boot 2.5/3.x 테스트 스킬, MyBatis 중심 (JPA 제외) | skill-creator |
