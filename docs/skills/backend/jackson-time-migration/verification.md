---
skill: jackson-time-migration
category: backend
version: v1
date: 2026-04-22
status: APPROVED
---

# jackson-time-migration 검증 문서

> Jackson + 자바 시간 API(Joda-Time → java.time) 마이그레이션 스킬의 검증 기록

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `jackson-time-migration` |
| 스킬 경로 | `.claude/skills/backend/jackson-time-migration/SKILL.md` |
| 검증일 | 2026-04-22 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (FasterXML GitHub, JodaOrg GitHub, Spring Boot 문서)
- [✅] 공식 GitHub 2순위 소스 확인 (jackson-modules-java8, jackson-datatype-joda, joda-time)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-04-22)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (타임존 처리, 타입 선택 기준)
- [✅] 코드 예시 작성 (레거시/모던 양쪽 ObjectMapper 설정, 타입 변환 유틸)
- [✅] 흔한 실수 패턴 정리 (10개 항목)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "Jackson jackson-datatype-jsr310 Spring Boot auto-configuration" | Spring Boot 자동 등록 동작, JavaTimeModule 클래스명 확인 |
| 조사 | WebSearch | "jackson-datatype-joda JodaModule DateTime serialization" | JodaModule 등록 방법, Joda 2.10+ 지원 확인 |
| 조사 | WebSearch | "Joda-Time deprecated java.time JSR-310 migration official" | Joda-Time 공식 README의 migration 권고 문구 확인 |
| 조사 | WebFetch | github.com/FasterXML/jackson-modules-java8 | JavaTimeModule 등록법, JSR310Module deprecated 확인 |
| 조사 | WebFetch | github.com/FasterXML/jackson-datatype-joda | 현재 버전, registerModule 문법, JsonMapper.builder 신규 스타일 |
| 조사 | WebFetch | github.com/JodaOrg/joda-time README | 프로젝트 "finished" 상태, java.time 이관 공식 권고 |
| 조사 | WebSearch | "Spring Boot write-dates-as-timestamps time-zone properties" | spring.jackson.* 프로퍼티 동작 확인 |
| 조사 | WebSearch | "LocalDateTime OffsetDateTime ZonedDateTime Instant when to use" | 타입별 사용 기준(Baeldung, Oracle docs) |
| 조사 | WebSearch | "MyBatis 3.5 java.time LocalDateTime TypeHandler built-in" | MyBatis 3.4.5+ JSR-310 내장 지원 확인 |
| 조사 | WebSearch | "@DateTimeFormat vs @JsonFormat difference request body" | MVC 바인딩 vs JSON 바디 차이 확인 |
| 조사 | WebSearch | "Joda DateTime ZonedDateTime OffsetDateTime migration mapping" | 타입 매핑 공식 권장 확인 |
| 교차 검증 | WebSearch | 핵심 클레임 8개, 독립 소스 2개 이상 | VERIFIED 8 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| FasterXML jackson-modules-java8 GitHub | https://github.com/FasterXML/jackson-modules-java8 | ⭐⭐⭐ High | 2026-04-22 | JSR-310 모듈 공식 레포 |
| FasterXML jackson-datatype-joda GitHub | https://github.com/FasterXML/jackson-datatype-joda | ⭐⭐⭐ High | 2026-04-22 | Joda 모듈 공식 레포 |
| JodaOrg/joda-time GitHub README | https://github.com/JodaOrg/joda-time/blob/main/README.md | ⭐⭐⭐ High | 2026-04-22 | Joda-Time 공식, 저자 Stephen Colebourne |
| Stephen Colebourne 블로그 | https://blog.joda.org/2014/11/converting-from-joda-time-to-javatime.html | ⭐⭐⭐ High | 2026-04-22 | Joda-Time/JSR-310 공동 저자의 공식 이관 가이드 |
| MyBatis 공식 API Javadoc | https://mybatis.org/mybatis-3/apidocs/org/apache/ibatis/type/LocalDateTimeTypeHandler.html | ⭐⭐⭐ High | 2026-04-22 | LocalDateTimeTypeHandler 내장 확인 |
| MyBatis typehandlers-jsr310 GitHub | https://github.com/mybatis/typehandlers-jsr310 | ⭐⭐⭐ High | 2026-04-22 | 3.4.5 이전용 별도 패키지 (현재는 내장) |
| Maven Central jsr310 | https://central.sonatype.com/artifact/com.fasterxml.jackson.datatype/jackson-datatype-jsr310 | ⭐⭐⭐ High | 2026-04-22 | 최신 버전 2.21.2 확인 |
| Maven Central joda | https://central.sonatype.com/artifact/com.fasterxml.jackson.datatype/jackson-datatype-joda | ⭐⭐⭐ High | 2026-04-22 | 최신 2.21.0 확인 |
| Spring Boot issue #26859 | https://github.com/spring-projects/spring-boot/issues/26859 | ⭐⭐⭐ High | 2026-04-22 | SB 2.5.0 Instant 직렬화 이슈 |
| Baeldung — Jackson Date | https://www.baeldung.com/jackson-serialize-dates | ⭐⭐ Medium | 2026-04-22 | Jackson 날짜 직렬화 보충 |
| Baeldung — ZonedDateTime vs OffsetDateTime | https://www.baeldung.com/java-zoneddatetime-offsetdatetime | ⭐⭐ Medium | 2026-04-22 | 타입 선택 기준 보충 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Jackson 2.12 ~ 2.21, Spring Boot 2.5/2.7/3.x, MyBatis 3.4.5+, Joda 2.10.10)
- [✅] deprecated된 패턴을 권장하지 않음 (`JSR310Module` → `JavaTimeModule`, `new Date()` 금지)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (상단 `> 소스:`, `> 검증일:`)
- [✅] 핵심 개념 설명 포함 (1~5장)
- [✅] 코드 예시 포함 (설정, DTO, 변환 유틸)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (4장 타입 선택 결정 트리)
- [✅] 흔한 실수 패턴 포함 (9장, 10개 항목)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (설정 yml, DTO, Mapper, 어댑터 모두 포함)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (SB 2.5 레거시 → 모던 전환 단계 구체화)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-04-23, general-purpose로 대체 실행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 — `JavaTimeModule` 자동 등록, `WRITE_DATES_AS_TIMESTAMPS=false`, Joda→java.time 타입 매핑 표, 점진 마이그레이션 4단계 모두 정확 제시
- [✅] 잘못된 응답 없음

---

## 5. 테스트 진행 기록

**수행일**: 2026-04-23
**수행 방법**: general-purpose 에이전트에게 SKILL.md만 Read한 뒤 2개 실전 질문 답변.

### 실제 수행 테스트

**Q1. `java.time.OffsetDateTime` DTO 직렬화 — 기본 문제 + 해결**
- ✅ PASS. 섹션 3-1/3-2/3-4 근거로 epoch ms 출력 방지, `WRITE_DATES_AS_TIMESTAMPS=false` 필수, 커스텀 ObjectMapper 시 `JavaTimeModule` 명시 등록, `spring.jackson.*` application.yml 완전 예시. `spring.jackson.date-format`이 `java.time.*`에는 적용 안 된다는 주의점까지 정확 인용.

**Q2. Joda `DateTime` → java.time `ZonedDateTime` 마이그레이션 (+ Jackson, MyBatis, 점진 전환)**
- ✅ PASS. 섹션 6(타입 매핑 표), 섹션 7(4단계 전환), 섹션 8(MyBatis 3.4.5+ java.time 기본 지원) 근거로 `DateTime → ZonedDateTime/OffsetDateTime` 선택 기준, 같은 ObjectMapper에 `JodaModule + JavaTimeModule` 병존 단계, `TimeAdapters` 경계 어댑터, Joda TypeHandler 수동 관리 불필요까지 정확 제시.

---

### (참고) 초기 작성 시 제시한 권장 테스트 케이스

### 테스트 케이스 1: 커스텀 ObjectMapper에서 Instant 직렬화 실패

**입력 (질문/요청):**
```
Spring Boot에서 @Bean ObjectMapper를 직접 등록했더니 "InvalidDefinitionException:
Java 8 date/time type `java.time.Instant` not supported by default" 에러가 납니다.
어떻게 고치나요?
```

**기대 결과:**
- 원인: 커스텀 ObjectMapper 빈 등록 시 Spring Boot 자동 설정이 꺼져 JavaTimeModule이 등록되지 않음
- 해결: `registerModule(new JavaTimeModule())` 명시 등록
- `WRITE_DATES_AS_TIMESTAMPS` disable 권장
- (스킬 3-3, 9장 해당)

**실제 결과:** (실제 에이전트 활용 테스트 전 — PENDING)

**판정:** PENDING

---

### 테스트 케이스 2: 레거시 DateTime을 모던으로 바꾸는 매핑

**입력:**
```
Spring Boot 2.5 + Joda 2.10.10 프로젝트를 현대화하려고 합니다.
현재 DTO에 org.joda.time.DateTime startAt 필드가 있는데,
java.time으로 바꿀 때 ZonedDateTime과 OffsetDateTime 중 뭘 써야 하나요?
```

**기대 결과:**
- DB 저장·API 전송 용도라면 `OffsetDateTime` 권장 (오프셋만 필요, 왕복 안전)
- 미래 시각 예약·DST 고려 필요 시 `ZonedDateTime`
- 타입 매핑 표(6장) 제시
- 점진 마이그레이션 단계(7장) 제시

**실제 결과:** (실제 에이전트 활용 테스트 전 — PENDING)

**판정:** PENDING

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-04-23, 2개 질문 모두 PASS) |
| **최종 판정** | **APPROVED** |

**판정 근거:**
- 공식 문서(FasterXML GitHub, JodaOrg README, MyBatis API)와 커뮤니티 소스(Baeldung, Stephen Colebourne 블로그)로 모든 핵심 클레임을 교차 검증했습니다.
- 8개 핵심 클레임 모두 VERIFIED:
  1. `JavaTimeModule` 클래스명 및 `JSR310Module` deprecated 상태 — VERIFIED
  2. Spring Boot 자동 등록 동작 (spring-boot-starter-json 포함) — VERIFIED
  3. `spring.jackson.serialization.write-dates-as-timestamps` 프로퍼티 동작 — VERIFIED
  4. Joda-Time 공식 "migrate to java.time" 권고 — VERIFIED (README 원문 인용)
  5. MyBatis 3.4.5부터 JSR-310 내장 지원 — VERIFIED (mybatis/typehandlers-jsr310 레포의 3.4.5 이후 merge 안내)
  6. Joda DateTime → ZonedDateTime/OffsetDateTime 매핑 권장 — VERIFIED (저자 블로그)
  7. `@DateTimeFormat` vs `@JsonFormat` 역할 차이 — VERIFIED
  8. SB 2.5.0 + 커스텀 ObjectMapper Instant 이슈 — VERIFIED (spring-boot#26859)
- 실사용 에이전트 테스트는 미수행 → PENDING_TEST 유지.

---

## 7. 개선 필요 사항

- [✅] 에이전트 활용 테스트 — OffsetDateTime 직렬화 + Joda→java.time 마이그레이션 2건 PASS (섹션 5, general-purpose 대체, 2026-04-23)
- [🔬] Oracle DATE 컬럼 ↔ `LocalDateTime`/`OffsetDateTime` 왕복 실제 검증 — 실환경 검증 대기
- [📅] Jackson 3.x로 넘어갈 때의 변경사항(내장된 jsr310) 별도 섹션 추가 검토
- [⏸️] PostgreSQL `timestamptz` vs MySQL `TIMESTAMP` 실제 왕복 값 비교 예시 — 선택 보강, 차단 요인 아님

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-22 | v1 | 최초 작성 — Jackson + 시간 API 마이그레이션 스킬 (Joda 2.10.10 → java.time) | skill-creator |
