---
skill: mybatis-mapper-patterns
category: backend
version: v1
date: 2026-11-09
status: APPROVED
---

# MyBatis Mapper Patterns 스킬 검증 문서

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `mybatis-mapper-patterns` |
| 스킬 경로 | `.claude/skills/mybatis-mapper-patterns/SKILL.md` |
| 검증일 | 2026-11-09 (재검증, 이전 2026-09-26) |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 기준 버전 | MyBatis 3.5.16 ~ 3.5.19 (3.6.0 주의 표기), mybatis-spring-boot-starter 2.3.2 / 3.0.5 / 4.0.1 / 4.1.0 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (mybatis.org/mybatis-3)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/mybatis/mybatis-3, github.com/mybatis/spring-boot-starter)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-04-22, MyBatis 3.5.19 / spring-boot-starter 3.0.5)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | MyBatis 3.5.16 release, spring-boot-starter 버전, 동적 SQL, resultMap, TypeHandler, #{} vs ${}, @Mapper vs @MapperScan, Oracle selectKey, Oracle OFFSET FETCH, MySQL LIMIT | 10회 검색, mybatis.org 공식 문서 + GitHub Release + FAQ 수집 |
| 조사 | WebFetch | github.com/mybatis/spring-boot-starter, github.com/mybatis/spring-boot-starter/releases | 버전 호환 매트릭스 및 최신 릴리스(3.0.5 / 4.0.1 / 2.3.2) 확인. mybatis.org 공식 페이지 WebFetch는 SSL 오류로 실패해 WebSearch 결과로 대체 |
| 교차 검증 | WebSearch | 버전 번호, 호환성, selectKey Oracle 예제, useGeneratedKeys MySQL 예제, ${} 인젝션 위험 | VERIFIED 11 / DISPUTED 0 / UNVERIFIED 1 (Jasypt 세부 모듈 명) |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| MyBatis 3 공식 문서 (Dynamic SQL) | https://mybatis.org/mybatis-3/dynamic-sql.html | ⭐⭐⭐ High | 2026-04-22 | 공식 문서 |
| MyBatis 3 공식 문서 (Mapper XML) | https://mybatis.org/mybatis-3/sqlmap-xml.html | ⭐⭐⭐ High | 2026-04-22 | 공식 문서 |
| MyBatis 3 FAQ (#{} vs ${}) | https://github.com/mybatis/mybatis-3/wiki/FAQ | ⭐⭐⭐ High | 2026-04-22 | 공식 위키 |
| mybatis-spring-boot-starter GitHub | https://github.com/mybatis/spring-boot-starter | ⭐⭐⭐ High | 2026-04-22 | 공식 저장소, 버전 호환성 매트릭스 |
| spring-boot-starter Releases | https://github.com/mybatis/spring-boot-starter/releases | ⭐⭐⭐ High | 2026-04-22 | 3.0.5 (2024-07-12), 4.0.1 (2024-12-28), 2.3.2 (2023-11-25) |
| Maven Central | https://mvnrepository.com/artifact/org.mybatis.spring.boot/mybatis-spring-boot-starter | ⭐⭐⭐ High | 2026-04-22 | 버전 목록 확인 |
| mybatis-spring-boot-autoconfigure Introduction | https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/ | ⭐⭐⭐ High | 2026-04-22 | 자동 설정 속성 (검색 결과로 간접 확인, 직접 fetch는 SSL 오류) |
| MyBatis 3 Releases | https://github.com/mybatis/mybatis-3/releases | ⭐⭐⭐ High | 2026-04-22 | 3.5.16 (2024-04-02), 3.5.19 공식 릴리스 |
| Baeldung — MyBatis with Spring | https://www.baeldung.com/spring-mybatis | ⭐⭐ Medium | 2026-04-22 | @Mapper vs @MapperScan 보조 |
| Maven Central — mybatis 메타데이터·POM | https://repo1.maven.org/maven2/org/mybatis/mybatis/maven-metadata.xml | ⭐⭐⭐ High | 2026-11-09 | 3.6.0 게시(2026-10-23), POM `java.version` 11 |
| MyBatis 3.6.0 릴리스 노트 | https://github.com/mybatis/mybatis-3/releases/tag/mybatis-3.6.0 | ⭐⭐⭐ High | 2026-11-09 | Java 11 필수, TypeHandler Type 기반 해석, 알려진 이슈(3.6.1에서 수정 예정) |
| Maven Central — starter POM (3.0.5·4.0.1·4.1.0) | https://repo1.maven.org/maven2/org/mybatis/spring/boot/mybatis-spring-boot/ | ⭐⭐⭐ High | 2026-11-09 | 세 버전 모두 MyBatis 3.5.19 번들, 3.0.5 게시 2025-07-11, 4.1.0 게시 2026-07-16 |
| spring-boot-starter README 호환표 | https://github.com/mybatis/spring-boot-starter | ⭐⭐⭐ High | 2026-11-09 | master(4.1)/4.0.x/3.0.x/2.3.x 행 재확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (MyBatis 3.5.x, starter 2.3.2 / 3.0.5 / 4.0.x)
- [✅] deprecated된 패턴을 권장하지 않음 (ROWNUM은 12c 이전 레거시로 명시)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (의존성, Mapper 인터페이스+XML, 어노테이션, 동적 SQL, resultMap, TypeHandler, Oracle/MySQL 특화, 페이징, N+1, #{} vs ${})
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (XML vs 어노테이션, Nested Results vs Nested Select)
- [✅] 흔한 실수 패턴 포함

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-04-22, 재시험 2026-11-09)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답 없음 — 보완 불필요

---

## 4-5. 핵심 클레임 교차 검증 결과

| 클레임 | 판정 | 근거 |
|--------|:----:|------|
| MyBatis 3.5.16은 2024-04-02 릴리스 | VERIFIED | GitHub Releases, Maven Central |
| MyBatis 최신 3.5.x 라인은 3.5.19 | VERIFIED | mvnrepository, GitHub Releases |
| mybatis-spring-boot-starter 3.0.5 = MyBatis 3.5.19 + MyBatis-Spring 3.0.5, Spring Boot 3.5 baseline | VERIFIED | GitHub Release notes |
| 3.0.x 브랜치는 Java 17+, Spring Boot 3.2~3.5 | VERIFIED | GitHub README compatibility table |
| 2.3.x 브랜치는 Java 8+, Spring Boot 2.7 공식 지원, 2.3.2가 마지막 | VERIFIED | GitHub Release notes (2.3.2: 2023-11-25, "likely the final 2.3.x") |
| `#{}`는 PreparedStatement 바인딩, `${}`는 문자열 치환 | VERIFIED | MyBatis FAQ 공식 |
| `${}`는 SQL 인젝션 위험, 테이블/컬럼명 동적 지정 등 제한적 사용처에서만 허용 | VERIFIED | MyBatis Issue #206, 공식 FAQ |
| 동적 SQL 요소: if, choose/when/otherwise, where, set, trim, foreach | VERIFIED | mybatis.org/mybatis-3/dynamic-sql.html |
| Oracle: selectKey + order="BEFORE" + 시퀀스.NEXTVAL FROM DUAL | VERIFIED | 공식 문서 + 다수 독립 소스 |
| MySQL: useGeneratedKeys="true" + keyProperty로 AUTO_INCREMENT 반환 | VERIFIED | MyBatis Mapper XML 공식 문서 |
| Oracle 12c+ OFFSET ROWS FETCH NEXT ROWS ONLY | VERIFIED | Oracle 공식 12c Row Limiting Clause |
| Nested Select + fetchType="lazy"로 N+1 완화 가능 | VERIFIED | 공식 문서 + N+1 참고 블로그 |
| (2026-11-09) 현행 스타터 3.0.5·4.0.1·4.1.0 모두 MyBatis 3.5.19 번들, 4.1.x = Spring Boot 4.1 | VERIFIED | Maven Central POM + GitHub README 호환표 |
| (2026-11-09) starter 3.0.5 릴리스일 2024-07-12 | DISPUTED → 2025-07-11로 정정 | Maven Central POM last-modified 2025-07-11, 번들 Spring Boot 3.5.0(2025-05 출시)과도 정합 |
| (2026-11-09) MyBatis 3.6.0 출시(2026-10-23), Java 11+ 필수, TypeHandler 해석 변경·알려진 이슈 | VERIFIED | GitHub 릴리스 노트 + Maven Central POM — SKILL.md 주의문 추가 |
| (2026-11-09) `#{}`/`${}`·동적 SQL 요소 문법은 3.6.0에서도 유지 | VERIFIED | 3.6.0 릴리스 노트에 해당 변경 없음 (`<choose>` 내 미지 요소 예외만 추가) |
| Jasypt의 구체적 MyBatis 연동 모듈명 | UNVERIFIED | SKILL.md에 "사용 중인 Jasypt 버전 문서를 확인"으로 표기, 구체 클래스명 기재하지 않음 |

---

## 5. 테스트 진행 기록

**수행일**: 2026-11-09
**수행자**: skill-tester → general-purpose (도메인 에이전트 대신 대체 사용)
**수행 방법**: 2026-11-09 재검증으로 수정된 내용(3.6.0 주의문, starter 4.0.1·4.1.0, 3.0.5 날짜 정정)을 겨냥해 SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트 (2026-11-09 재시험)

**Q1. 운영 중인 Spring Boot 3.5 + Java 17에서 MyBatis 3.6.0으로 올려도 되나?**
- ✅ PASS
- 근거: SKILL.md 상단 주의 블록(15행, 13행) + 의존성 설정 32~33행
- 상세: "지금은 올리지 말고 3.6.1 이후 권장, 스타터 번들 3.5.19 유지" 결론 도출. Java 11+, TypeHandler Type 기반 해석 변경, `<choose>` 미지 요소 예외까지 정확히 인용. anti-pattern(3.6.0 즉시 업그레이드 권장) 회피.

**Q2. Spring Boot 4.1 / 3.5 / 2.7 각각의 starter 버전·번들 MyBatis·Java·릴리스일은?**
- ✅ PASS
- 근거: SKILL.md "의존성 설정" 섹션(21~49행) + 13행
- 상세: 4.1.x(4.1.0, 2026-07-16, 3.5.19, Java 17+) / 3.0.5(2025-07-11, 3.5.19, Java 17+) / 2.3.2(2023-11-25, 2.3.x 마지막, Java 8+) 모두 정확. 정정된 3.0.5 날짜(2025-07-11)를 올바르게 인용.

### 발견된 gap (경미, 차단 아님)

- 4.1.x는 pom.xml 예제 블록이 없고 정보가 주의 블록(13·49행)에 분산됨
- 2.3.2가 번들하는 MyBatis 정확한 패치 버전 미기재
- 3.6.1 예상 릴리스 시점·스타터 번들 버전 오버라이드 방법 미기재

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (라이브러리 사용법 스킬, content test로 충분)
- 최종 상태: APPROVED 유지

---

### 2026-09-26 — 재검증 (60일 초과 정기 재검증)

**수행일**: 2026-09-26
**수행 방법**: SKILL.md + REFERENCE.md 전체 Read, WebSearch로 mybatis-spring-boot-starter 브랜치 현황 재확인.

**Q1. Spring Boot 4.1 프로젝트에 mybatis-spring-boot-starter를 붙이려면?**
- PASS(재검증). GitHub 저장소에 `master`(Spring Boot 4.1 대상, MyBatis-Spring 4.1)와 `4.0.x`(Spring Boot 4.0 대상) 브랜치가 신설된 것을 확인. `@Mapper`/`@MapperScan`, XML 매퍼 구조는 브랜치와 무관하게 동일.

**Q2. 동적 SQL(`<if>`/`<where>`/`<foreach>`)이 최신 MyBatis에서도 동일하게 동작하는가?**
- PASS(재검증). MyBatis 3.5.x 라인에 breaking change 없음. 3.5.19 이후 신규 마이너 릴리스도 Mapper API 안정성 유지.

**재검증 결론**: 핵심 클레임 VERIFIED 유지. Spring Boot 4.x 대응 브랜치 정보만 주의문에 추가. status 변경 없음(APPROVED 유지).

---

### 2026-04-22 — 원 수행 기록

**수행일**: 2026-04-22
**수행 방법**: general-purpose 에이전트에게 SKILL.md만 Read한 후 답변하도록 요청 (java-backend-developer가 세션 로드 전이라 general-purpose로 대체, 동일 기능)

### 테스트 케이스 1: 동적 SQL — name + age 범위 조건

**입력:**
```
UserMapper.xml에서 이름(name)과 나이 범위(ageMin, ageMax)로 조회하는 쿼리를 동적 SQL로.
ageMin이 null이면 나이 조건 자체 생략, ageMax도 독립적으로.
```

**기대 결과:** `<where>` + 독립 `<if>` 3개 (name, ageMin, ageMax), `#{}` 파라미터 바인딩, LIKE에 CONCAT 사용.

**실제 결과:** ✅ 에이전트가 SKILL.md '동적 SQL > `<if>`' 섹션(줄 202-215)과 '`<where>`' 섹션(줄 217-233)을 정확히 근거로 제시, 3개 `<if>` 독립 조건 + `<where>` 조합, `CONCAT('%', #{name}, '%')` 활용. 비교 연산자 XML 이스케이프(`&gt;`, `&lt;`)까지 처리.

**판정:** ✅ PASS

---

### 테스트 케이스 2: MySQL AUTO_INCREMENT PK 반환

**입력:**
```
MySQL `id BIGINT AUTO_INCREMENT PK` INSERT 후 Java 객체에 생성 id 채우기 — 어노테이션/XML 양쪽.
```

**기대 결과:** `useGeneratedKeys="true"` + `keyProperty="id"` (XML), `@Options(useGeneratedKeys = true, keyProperty = "id")` (어노테이션).

**실제 결과:** ✅ SKILL.md 'MySQL 특화' 섹션(줄 591-609) 근거로 XML과 어노테이션 두 방식 모두 정확히 제시, `userMapper.insert(user)` 후 `user.getId()`로 회수 가능함까지 설명.

**판정:** ✅ PASS

---

### 발견된 gap (경미, 다음 iteration에서 보완)

- XML 내 비교 연산자 이스케이프(`&gt;`/`&lt;` vs CDATA) 가이드 한 줄 추가 권장
- `@Param("cond")` 중첩 객체 외 플랫 파라미터일 때 `test` 표현식 예시 추가 권장

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-04-22 2/2 PASS, 재시험 2026-11-09 2/2 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [⏸️] Jasypt + MyBatis 연동 구체 모듈명·클래스명 조사 후 예제 보완 — 선택 보강, 현재 범용 가이드 제공
- [⏸️] MyBatis Dynamic SQL 라이브러리(별도 프로젝트) 사용 시 차이점 섹션 — 범위 확장 선택 사항
- [⏸️] `mybatis-config.xml` vs Spring Boot 자동 설정만 쓰는 경우 비교 — 선택 보강, 차단 요인 아님
- [✅] 에이전트 활용 테스트 — 동적 SQL name+age + MySQL AUTO_INCREMENT PK 2건 PASS (섹션 5, general-purpose 대체, 2026-04-22)
- [✅] 2026-11-09 재검증 수정분 재시험 — 3.6.0 업그레이드 판단 + starter 버전 선택 2건 PASS (2026-11-09 완료, 2/2 PASS)
- [⏸️] 4.1.x pom.xml 예제 블록 추가, 2.3.2 번들 MyBatis 패치 버전 명시, 3.6.1 릴리스 후 주의문 갱신 — 선택 보강, 차단 요인 아님

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-22 | v1 | 최초 작성 — MyBatis 3.5.x + Spring Boot 2.5/3.x 통합 패턴, 동적 SQL, resultMap, TypeHandler, Oracle/MySQL 특화, 페이징, N+1 방지, SQL 인젝션 방지 포함 | skill-creator |
| 2026-09-26 | v1 | 재검증 — mybatis-spring-boot-starter Spring Boot 4.0/4.1 대응 브랜치 반영, 핵심 패턴 변경 없음 확인 | 메인 세션 |
| 2026-11-09 | v1 | 재검증 — MyBatis 3.6.0(2026-10-23, Java 11+, 알려진 TypeHandler 이슈) 주의문 추가, starter 4.0.1·4.1.0 릴리스·모두 3.5.19 번들 반영, starter 3.0.5 날짜 2024-07-12 → 2025-07-11 정정. Mapper·동적 SQL 패턴 변경 없음 | 메인 세션 |
| 2026-11-09 | v1 | 재검증 수정분 2단계 재시험 (Q1 3.6.0 업그레이드 가능 여부 / Q2 Boot 4.1·3.5·2.7별 starter 버전) → 2/2 PASS, APPROVED 유지 | skill-tester |
| 2026-11-11 | v1 | 2026-11-11 정리 — 모델이 아는 일반 지식 절 제거(인터페이스+XML 기본 구조, `@Mapper` vs `@MapperScan`, 어노테이션 방식·`@Param` 해설, `<if>`/`<where>`/`<choose>`/`<set>`/`<trim>` 예제, N+1 해설, 내장 enum·JSON TypeHandler, `#{}` vs `${}` 해설, Spring Boot 통합 요약·트랜잭션·SQL 로깅). 남긴 절: 3.6.0·스타터 4.x 주의문, 의존성 설정·application.yml, XML 비교 연산자 주의, `<foreach>`, resultMap(association·collection), YnFlag TypeHandler·등록·Jasypt, Oracle 특화, MySQL 특화, 자주 하는 실수. 사실 재검증 아님 | Claude (Opus 5.5) |
