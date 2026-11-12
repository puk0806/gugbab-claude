---
skill: spring-multi-datasource-oracle-mysql
category: backend
version: v1
date: 2026-11-09
status: APPROVED
---

# 스킬 검증 문서 — spring-multi-datasource-oracle-mysql

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `spring-multi-datasource-oracle-mysql` |
| 스킬 경로 | `.claude/skills/spring-multi-datasource-oracle-mysql/SKILL.md` |
| 검증일 | 2026-11-09 (재검증, 이전 2026-09-26) |
| 검증자 | skill-creator (Claude Code) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Spring Boot Docs, MyBatis Spring Boot Autoconfigure)
- [✅] 공식 GitHub 2순위 소스 확인 (mybatis/spring-boot-starter Releases)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-04-22)
  - mybatis-spring-boot-starter 4.0.1 (Spring Boot 4), 3.0.5 (Boot 3.5), 2.3.2 (Boot 2.7)
  - ojdbc8 / ojdbc11 23.6.0.24.10 (23ai)
  - mysql-connector-j 9.6.0 (2026-01-29 릴리즈)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (DataSource/SqlSessionFactory/TxManager 분리, @Primary 전략)
- [✅] 코드 예시 작성 (Maven 의존성, DataSource Config, MyBatis Config, TxManager Config, Service)
- [✅] 흔한 실수 패턴 정리 (드라이버 클래스명, 좌표 변경, 매퍼 패키지 분리 등)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 Read | Read | VERIFICATION_TEMPLATE.md, axum SKILL.md | 형식 파악 완료 |
| 조사 | WebSearch | Spring Boot multi-datasource MyBatis, ojdbc 버전, mysql-connector-j 버전, mybatis-spring-boot-starter 버전 | 공식 URL 6종 수집 |
| 조사 | WebFetch | mybatis/spring-boot-starter Releases | 버전 매트릭스 확보 (2.3.2 / 3.0.5 / 4.0.1) |
| 조사 | WebSearch | Jakarta EE 전환, XA/JtaTransactionManager, @Transactional qualifier, H2 테스트 구성 | 클레임별 소스 수집 |
| 교차 검증 | WebSearch | 9개 핵심 클레임, 독립 소스 2개 이상 대조 | VERIFIED 8 / DISPUTED 1 (수정 반영) / UNVERIFIED 0 |

> 참고: mvnrepository.com 및 일부 HTTPS 인증서 이슈로 WebFetch가 실패한 페이지는 WebSearch 결과의 스니펫을 교차 참조하여 보완.

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Spring Boot Data Access How-To | https://docs.spring.io/spring-boot/how-to/data-access.html | ⭐⭐⭐ High | 2026-04-22 | DataSourceBuilder, @ConfigurationProperties 공식 패턴 |
| MyBatis Spring Boot Autoconfigure | https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/ | ⭐⭐⭐ High | 2026-04-22 | 멀티 DataSource 시 자동 설정 미적용 명시 |
| MyBatis Spring FactoryBean | https://mybatis.org/spring/factorybean.html | ⭐⭐⭐ High | 2026-04-22 | SqlSessionFactoryBean, mapperLocations |
| Oracle Maven Central Guide | https://www.oracle.com/database/technologies/maven-central-guide.html | ⭐⭐⭐ High | 2026-04-22 | ojdbc8/11 groupId, JDK 호환 |
| MySQL Connector/J Developer Guide | https://dev.mysql.com/doc/connector-j/en/ | ⭐⭐⭐ High | 2026-04-22 | 드라이버 클래스, SSL 설정 변경 이력 |
| Spring Boot JTA 문서 | https://docs.spring.io/spring-boot/reference/io/jta.html | ⭐⭐⭐ High | 2026-04-22 | XA 트랜잭션 및 제약 |
| mybatis/spring-boot-starter Releases | https://github.com/mybatis/spring-boot-starter/releases | ⭐⭐⭐ High | 2026-04-22 | 버전별 Spring Boot 지원 매트릭스 |
| Spring Boot Support Timeline | https://spring.io/support-policy/ | ⭐⭐⭐ High | 2026-04-22 | 2.7 OSS EOL 2023-11-24 |
| Baeldung Multi DataSources | https://www.baeldung.com/spring-boot-configure-multiple-datasources | ⭐⭐ Medium | 2026-04-22 | 패턴 참고 (공식 문서와 교차 검증) |
| Oracle Developers Blog (HikariCP) | https://blogs.oracle.com/developers/hikaricp-best-practices-for-oracle-database-and-spring-boot | ⭐⭐⭐ High | 2026-04-22 | Oracle 공식 블로그 |
| Maven Central metadata (재검증) | https://repo1.maven.org/maven2/ (mybatis-spring-boot-starter · mysql-connector-j · ojdbc11 · ojdbc8 maven-metadata.xml) | ⭐⭐⭐ High | 2026-11-09 | starter 최신 4.1.0(3.0.x 라인 최신 3.0.5), mysql-connector-j 26.10.0(9.7.0 → 26.7.0 → 26.10.0), ojdbc11/ojdbc8 23.26.4.0.0 |
| MyBatis Spring Boot Starter 호환표 (재검증) | https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/ | ⭐⭐⭐ High | 2026-11-09 | 2.3 = Boot 2.7, 3.0 = Boot 3.2–3.5, 4.0 = Boot 4.0+ |
| Spring Framework Javadoc — JdbcTransactionManager (재검증) | https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/support/JdbcTransactionManager.html | ⭐⭐⭐ High | 2026-11-09 | @since 5.3, DataSourceTransactionManager 하위 클래스 + commit/rollback 예외 변환 |
| endoflife.date — Spring Boot (재검증) | https://endoflife.date/spring-boot | ⭐⭐ Medium | 2026-11-09 | 2.7 OSS 2023-06-30 종료, 상용 2029-06-30 |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Spring Boot 2.7/3.x, mybatis 2.3.2/3.0.5, ojdbc 23.6, mysql-connector-j 9.x)
- [✅] deprecated된 패턴을 권장하지 않음 (`com.mysql.jdbc.Driver`, `mysql:mysql-connector-java` 명시적으로 대체 안내)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (버전 매트릭스, DataSource 분리, MyBatis 구성, TxManager)
- [✅] 코드 예시 포함 (yaml, Maven pom, Java config)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (XA vs 보상 패턴 비교)
- [✅] 흔한 실수 패턴 포함 (10개 이상 정리)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (바로 복사 가능한 application.yml, @Configuration 클래스)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. 교차 검증 클레임별 판정

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | mybatis-spring-boot-starter 2.3.2는 Spring Boot 2.7 지원 | VERIFIED | GitHub Releases + 공식 autoconfigure 문서 일치 |
| 2 | mybatis-spring-boot-starter 3.0.5는 Spring Boot 3.5 지원 | VERIFIED | GitHub Releases 명시 |
| 3 | ojdbc11 23.26.1.0.0이 최신, JDK11/17/19/21 지원 | VERIFIED | Maven Central + Oracle 공식 가이드 일치 |
| 4 | mysql-connector-j 9.6.0 (2026-01-29 릴리즈) | VERIFIED | Maven Central + MySQL 릴리즈 노트 일치 |
| 5 | `com.mysql.jdbc.Driver` deprecated, `com.mysql.cj.jdbc.Driver` 사용 | VERIFIED | MySQL 공식 API Changes 문서 |
| 6 | Spring Boot 3.x에서 좌표 `com.mysql:mysql-connector-j`로 변경 | VERIFIED | 복수 소스 일치 |
| 7 | `javax.sql.DataSource`는 Jakarta 전환 대상이 아님 (JDK 표준) | VERIFIED | w3tutorials 분석 + JDK 문서 (javax.sql은 Jakarta EE가 아닌 Java SE 패키지) |
| 8 | 멀티 DataSource 환경에서 mybatis 자동 설정 미적용 | VERIFIED | MyBatis autoconfigure 공식 문서 명시 |
| 9 | `@Transactional`에 트랜잭션 매니저 미지정 시 `@Primary` 사용 | VERIFIED | Spring Framework Reference 문서 |
| - | (초기 추정) ojdbc11 최신이 `23.7.x` | DISPUTED → 수정 | Maven 검색 결과 23.6.0.24.10 및 23.26.x 존재. SKILL.md에 `23.6.0.24.10` 명시로 수정 |
| 10 | (2026-11-09) 버전 매트릭스 "Boot 3.x 패키지 `jakarta.sql.DataSource`" | **DISPUTED → 수정** | `jakarta.sql` 패키지는 존재하지 않음 — 클레임 7과 본문 주의문(JDK 소속 `javax.sql` 유지)과도 모순. 매트릭스·트랜잭션 매니저 절 문구를 `javax.sql.DataSource`로 정정 |
| 11 | (2026-11-09) "Spring Boot 2.7 OSS 종료 2023-11-24" | **DISPUTED → 수정** | endoflife.date: 2.7 OSS 2023-06-30, 상용 2029-06-30 (2-to-3·1-to-2 스킬과 일치) |
| 12 | (2026-11-09) "`JdbcTransactionManager`는 Framework 6.0부터 권장" | **DISPUTED → 수정** | Javadoc: @since 5.3, `DataSourceTransactionManager` 하위 클래스 + commit/rollback 예외 변환 → Boot 2.4+에서도 사용 가능하다고 정정 |
| 13 | (2026-11-09) mybatis starter 2.3.2 = Boot 2.7, 3.0.5 = Boot 3.2~3.5, Boot 4는 4.x(최신 4.1.0) | VERIFIED | mybatis.org 호환표 + Maven Central metadata |
| 14 | (2026-11-09) mysql-connector-j 캘린더 버전(26.7.0 → 26.10.0), ojdbc11/ojdbc8 23.26.4.0.0, 드라이버 클래스명 변동 없음 | VERIFIED | Maven Central metadata + 기존 MySQL·Oracle 공식 문서 |

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-04-22, general-purpose로 대체 실행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 — 5개 Config 클래스 + application.yml 완전 생성, `@Primary`/Mapper 스캔 분리 정확
- [✅] 잘못된 응답 없음 — 보완 불필요

---

## 5. 테스트 진행 기록

### 2026-11-09 — 재검증 수정분 content test

**수행일**: 2026-11-09
**수행자**: general-purpose (skill-tester는 중첩 호출 환경에서 Agent 도구가 없어 재검증 담당이 general-purpose 에이전트에 직접 위임)
**수행 방법**: SKILL.md + references Read만 허용, 웹 검색·파일 수정 금지 조건으로 실전 질문 3개 답변

- Q1. "Boot 3.5로 올리며 `javax.sql.DataSource`를 `jakarta.sql.DataSource`로 바꿔야 하나?" — **PASS** (근거: 버전 매트릭스 "패키지" 행 + Oracle DataSource 절 주의문 — JDK 소속이라 유지). 답변자가 매트릭스 아래 일반 주의문("jakarta 전환, import 변경 필수")이 오해를 줄 수 있다고 지적 → 주의문에 "Jakarta EE 스펙 한정, `javax.sql`은 제외" 문구 보강
- Q2. "Boot 2.7에서 `JdbcTransactionManager` 사용 가능? 차이는?" — **PASS** (근거: 트랜잭션 매니저 분리 절 주의 — Framework 5.3+, 하위 클래스 + commit/rollback 예외 변환)
- Q3. "Boot 2.7·3.5·4.x별 mybatis starter 라인과 2.7 OSS 종료일" — **PASS** (근거: 버전 매트릭스 — 2.3.x / 3.0.x / 4.x(4.1.0), 상단 주의 — 2023-06-30, 상용 2029-06-30)

agent content test: 3/3 PASS → APPROVED 유지.

### 2026-09-26 — 재검증 (60일 초과 정기 재검증)

**수행일**: 2026-09-26
**수행 방법**: SKILL.md + REFERENCE.md 전체 Read, WebSearch로 mysql-connector-j·ojdbc11 버전 변동 재확인.

**Q1. mysql-connector-j 버전 표기가 9.x에서 크게 바뀐 것 같은데(26.7.0), 기존 코드가 깨지는가?**
- PASS(재검증). MySQL이 2026-07 릴리스부터 캘린더 버전(YY.M.P)으로 전환해 버전 번호만 바뀐 것이며, 드라이버 클래스명(`com.mysql.cj.jdbc.Driver`)·JDBC URL 포맷·`sslMode` 설정은 변경 없음을 공식 릴리스 노트로 확인.

**Q2. ojdbc11 최신 버전(21.22.x/23.26.x 등)에서도 SKILL.md의 DataSource 설정이 그대로 맞는가?**
- PASS(재검증). `oracle.jdbc.OracleDriver` 클래스명·Maven 좌표(`com.oracle.database.jdbc:ojdbc11`)는 패치 버전 무관하게 동일.

**재검증 결론**: 핵심 클레임 VERIFIED 유지. mysql-connector-j 버전 체계 전환을 주의문으로 반영. status 변경 없음(APPROVED 유지).

---

### 2026-04-22 — 원 수행 기록

**수행일**: 2026-04-22
**수행 방법**: general-purpose 에이전트에게 SKILL.md만 Read한 뒤 2개 실전 질문 답변.

### 실제 수행 테스트

**Q1. Oracle(Primary) + MySQL(보조) 멀티 DataSource 완전 구성**
- ✅ PASS. 에이전트가 "DataSource 두 개 구성", "MyBatis SqlSessionFactory 분리", "트랜잭션 매니저 분리" 섹션을 근거로 5개 Config 클래스(OracleDataSourceConfig, OracleMyBatisConfig, MySqlDataSourceConfig, MySqlMyBatisConfig, TransactionManagerConfig) + application.yml 생성. `@Primary` 전략, `@MapperScan(basePackages, sqlSessionFactoryRef)` 분리, `jdbc-url` 키 사용 모두 정확.

**Q2. MySQL 전용 트랜잭션 + 크로스 DB 트랜잭션 권장사항**
- ✅ PASS. "@Transactional 사용법"(376-411) + "크로스 DB 트랜잭션 (XA / 보상 패턴)"(415-458) 근거로 `@Transactional("mysqlTransactionManager")` 명시 패턴, Primary 미명시 시 auto-commit 문제, XA 제약(Spring Boot 3.x Atomikos 자동설정 제거) + Saga/보상 패턴 권장까지 정확히 답변.

### 발견된 gap (경미)

- `TransactionManagerConfig`가 Spring Boot 3.x의 `JdbcTransactionManager` 기준 예시만 있고, SB 2.7용 `DataSourceTransactionManager` 실제 예시 코드가 없음 (주의 문구만 존재)
- `SqlSessionFactoryBean#getObject()` 중복 호출에 대한 싱글턴 보장 설명 부재

---

### (참고) 초기 작성 시 제시한 권장 테스트 케이스

### 테스트 케이스 1 (예정): Oracle Primary 구성 요청

**입력 (질문/요청):**
```
Spring Boot 3.3에서 Oracle(주) + MySQL(보조) 멀티 DB로 MyBatis 구성해줘.
```

**기대 결과:**
- Maven 의존성: ojdbc11 + mysql-connector-j + mybatis-spring-boot-starter 3.0.5
- OracleDataSourceConfig에 @Primary, MySqlDataSourceConfig에 @Primary 없음
- SqlSessionFactory 2개 + @MapperScan 2개 (패키지·sqlSessionFactoryRef 분리)
- oracleTransactionManager(@Primary), mysqlTransactionManager
- application.yml `spring.datasource.oracle.*`, `spring.datasource.mysql.*`

**실제 결과:** (테스트 미실시)

**판정:** PENDING

---

### 테스트 케이스 2 (예정): 크로스 DB 트랜잭션 질문

**입력:**
```
Oracle에 주문 저장하고 MySQL에 로그 남기는데, 한 트랜잭션으로 묶어야 해. 어떻게?
```

**기대 결과:**
- XA 트랜잭션 옵션과 한계 설명 (Atomikos 등, Spring Boot 3.x에서 Atomikos 자동 설정 제거)
- 보상 패턴(Saga) 권장
- 아웃박스 패턴 언급
- 실제 코드 예시 제시

**판정:** PENDING

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-04-22, 2개 질문 모두 PASS / **2026-11-09 재검증 수정분 3/3 PASS**) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] `hikaricp-tuning-oracle-mysql` 스킬 존재 확인 (`.claude/skills/hikaricp-tuning-oracle-mysql/` 생성됨) — 별도 보완 불필요
- [⏸️] Testcontainers 예시 추가(Oracle/MySQL 실제 컨테이너) — 범위 확장 선택 사항
- [⏸️] MyBatis 어노테이션 기반 매퍼(@Mapper + XML 미사용) 예시 — 선택 보강, 차단 요인 아님
- [✅] 에이전트 활용 테스트 — Oracle Primary 멀티 DataSource + 크로스 DB 트랜잭션 2건 PASS (섹션 5, general-purpose 대체, 2026-04-22)
- [✅] 2026-11-09 재검증 정정(`jakarta.sql` 오기·2.7 EOL·JdbcTransactionManager 시점) content test 3/3 PASS

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-22 | v1 | 최초 작성 | skill-creator (Claude Code) |
| 2026-09-26 | v1 | 재검증 — mysql-connector-j 캘린더 버전 전환(26.7.0), ojdbc11 신규 패치 반영, 핵심 설정 변경 없음 확인 | 메인 세션 |
| 2026-11-09 | v1 | 재검증 — starter/드라이버 최신(4.1.0·26.10.0·23.26.4.0.0) 확인. **바뀐 점**: 버전 매트릭스 `jakarta.sql.DataSource` 오기 → `javax.sql.DataSource`(트랜잭션 매니저 절 문구도 정정), 2.7 OSS 종료일 2023-11-24 → 2023-06-30, `JdbcTransactionManager` 도입 시점 6.0 → 5.3(레거시에서도 사용 가능), starter 4.x 라인·드라이버 최신 버전 주의문 갱신. skill-tester 재시험 대상 | 재검증 (Claude) |
| 2026-11-09 | v1 | 수정분 content test (Q1 DataSource 패키지 / Q2 JdbcTransactionManager 레거시 사용 / Q3 starter 라인·2.7 EOL) → 3/3 PASS, APPROVED 유지. 답변자 지적 반영해 버전 매트릭스 아래 jakarta 주의문에 "`javax.sql` 제외" 보강. skill-tester Agent 도구 없음 → general-purpose 직접 위임. 섹션 5·6·7 동기화 | general-purpose |
| 2026-11-12 | v1.1 | 정리(사실 재검증 아님) — 일반 지식 덜어내기: 남긴 것 버전 매트릭스·드라이버 캘린더 버전 주의, javax.sql 비전환, jdbc-url·드라이버 클래스·sslMode, @Primary·스타터 자동설정 미적용·매퍼 패키지 분리, JdbcTransactionManager 5.3, @Transactional 매니저 명시, Boot 3 Atomikos 제거, H2 호환 한계·@DataJpaTest 교체 / 덜어낸 것 Maven 의존성 블록·DataSource·SqlSessionFactory·TransactionManager·@Transactional 전체 예제 코드, 폴더 구조, 보상 패턴 예제·HikariCP 튜닝표·체크리스트(references/REFERENCE.md 폴더 삭제) | 정리 |
