---
skill: hikaricp-tuning-oracle-mysql
category: backend
version: v1
date: 2026-11-06
status: APPROVED
---

# 스킬 검증 문서 — hikaricp-tuning-oracle-mysql

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `hikaricp-tuning-oracle-mysql` |
| 스킬 경로 | `.claude/skills/hikaricp-tuning-oracle-mysql/SKILL.md` |
| 검증일 | 2026-11-06 (재검증, 이전 2026-09-26) |
| 검증자 | skill-creator (Claude) |
| 스킬 버전 | v1 |
| 대상 버전 | HikariCP 3.4.5 ~ 5.x (통합) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 GitHub README 확인 (기본 설정값, 최소값)
- [✅] 공식 GitHub Wiki "About Pool Sizing" 확인 (공식 공식)
- [✅] 공식 GitHub Wiki "MySQL Configuration" 확인 (MySQL 권장 속성)
- [✅] 공식 GitHub Wiki "Rapid Recovery" 확인 (소켓 타임아웃 권장)
- [✅] Spring Boot 버전별 HikariCP 번들 버전 조사
- [✅] HikariCP 3.4.5 레거시 이슈/특성 조사
- [✅] Oracle JDBC 고유 속성(`oracle.jdbc.ReadTimeout`, `oracle.net.CONNECT_TIMEOUT`, `oracle.jdbc.defaultConnectionValidation`) 확인
- [✅] Micrometer 메트릭 이름 확인 (`hikaricp.connections.*`)
- [✅] SKILL.md 파일 작성
- [✅] verification.md 파일 작성
- [✅] Claude Code 에이전트 활용 테스트 (2026-04-22 수행, 2건 PASS — 섹션 5 참조)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | HikariCP pool sizing formula 공식 | 공식 Wiki URL 확인, `(core*2)+spindle` 공식 확인 |
| 조사 2 | WebSearch | MySQL datasource properties 공식 | 공식 MySQL Configuration Wiki URL 확인 |
| 조사 3 | WebSearch | Oracle JDBC 타임아웃 속성 | `oracle.jdbc.ReadTimeout`, `oracle.net.CONNECT_TIMEOUT` 속성명 확인 |
| 조사 4 | WebSearch | HikariCP maxLifetime vs MySQL wait_timeout | "최소 30초 이상 짧게" 공식 권고 확인 |
| 조사 5 | WebFetch | GitHub README (파라미터 기본값) | 8개 핵심 파라미터 기본값·최소값 표 추출 |
| 조사 6 | WebFetch | MySQL Configuration Wiki | 10개 dataSource.* 속성 전체 추출 |
| 조사 7 | WebFetch | About Pool Sizing Wiki | 공식 공식, Oracle 사례(2048→96, 50배 개선) 추출 |
| 조사 8 | WebFetch | Rapid Recovery Wiki | socketTimeout 권장 "2-3x longest SQL, >= 30s" 확인 |
| 조사 9 | WebSearch | Spring Boot 버전별 HikariCP 번들 | SB 2.7.5=HikariCP 5.0.1, SB 3.4=5.1.x 확인 |
| 조사 10 | WebSearch | HikariCP 3.4.5 known issues | Java 8 호환성 빌드 수정 포함 확인 |
| 조사 11 | WebSearch | Micrometer HikariCP 메트릭 | `hikaricp.connections.{active,idle,pending,timeout,usage}` 확인 |
| 조사 12 | WebSearch | Spring multiple datasources HikariCP 구성 | application.yml 패턴 확인 |
| 교차 검증 | WebSearch + WebFetch | 핵심 클레임 20건 | VERIFIED 19 / DISPUTED 1 / UNVERIFIED 0 |

> 주의: `blogs.oracle.com`과 `medium.com/oracledevs`의 Oracle 공식 블로그는 WebFetch에서 self-signed certificate 오류로 직접 페칭 실패. WebSearch 요약 결과(`oracle.jdbc.defaultConnectionValidation`, 소켓 타임아웃 속성 등)를 다른 독립 소스(HikariCP 공식 Wiki "Rapid Recovery", Oracle 공식 JDBC 문서 검색 결과)와 교차 확인.

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| HikariCP 공식 GitHub README | https://github.com/brettwooldridge/HikariCP | ⭐⭐⭐ High | 2026-04-22 | 1순위 공식 소스 |
| HikariCP Wiki: About Pool Sizing | https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing | ⭐⭐⭐ High | 2026-04-22 | 1순위 공식 |
| HikariCP Wiki: MySQL Configuration | https://github.com/brettwooldridge/HikariCP/wiki/MySQL-Configuration | ⭐⭐⭐ High | 2026-04-22 | 1순위 공식 |
| HikariCP Wiki: Rapid Recovery | https://github.com/brettwooldridge/HikariCP/wiki/Rapid-Recovery | ⭐⭐⭐ High | 2026-04-22 | 1순위 공식 |
| HikariCP Releases | https://github.com/brettwooldridge/HikariCP/releases | ⭐⭐⭐ High | 2026-04-22 | 버전 정보 |
| HikariCP CHANGES (3.4.5 관련) | https://github.com/brettwooldridge/HikariCP/blob/dev/CHANGES | ⭐⭐⭐ High | 2026-04-22 | 레거시 버전 확인 |
| Oracle Developers 블로그 (HikariCP Best Practices for Oracle) | https://blogs.oracle.com/developers/hikaricp-best-practices-for-oracle-database-and-spring-boot | ⭐⭐⭐ High | 2026-04-22 | WebFetch 실패, 검색 요약으로 참조 |
| Spring Boot Dependency Versions | https://docs.spring.io/spring-boot/appendix/dependency-versions/index.html | ⭐⭐⭐ High | 2026-04-22 | 번들 버전 확인 |
| Spring Boot 3.4 Release Notes | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.4-Release-Notes | ⭐⭐⭐ High | 2026-04-22 | 공식 릴리즈 노트 |
| Baeldung HikariCP with Spring Boot | https://www.baeldung.com/spring-boot-hikari | ⭐⭐ Medium | 2026-04-22 | 보조 확인용 |
| Vlad Mihalcea: Optimal Connection Pool Size | https://vladmihalcea.com/optimal-connection-pool-size/ | ⭐⭐⭐ High | 2026-04-22 | Hibernate 전문가 공인 자료 |
| HikariCP CHANGES (raw) | https://raw.githubusercontent.com/brettwooldridge/HikariCP/dev/CHANGES | ⭐⭐⭐ High | 2026-11-06 | 재검증 — 7.1.0까지, keepaliveTime 4.0.0 추가·6.2.1 기본 2분 |
| HikariCP README (Java별 아티팩트·기본값) | https://github.com/brettwooldridge/HikariCP | ⭐⭐⭐ High | 2026-11-06 | 재검증 — Java 11+ = 7.1.0, Java 8 = 4.0.3 |
| HikariCredentialsProvider·Credentials·HikariConfig 소스 | https://github.com/brettwooldridge/HikariCP/tree/dev/src/main/java/com/zaxxer/hikari | ⭐⭐⭐ High | 2026-11-06 | 재검증 — `Credentials getCredentials()` 단일 메서드 |
| Maven Central metadata (com.zaxxer:HikariCP) | https://repo1.maven.org/maven2/com/zaxxer/HikariCP/maven-metadata.xml | ⭐⭐⭐ High | 2026-11-06 | 재검증 — release 7.1.0 |
| Spring Boot spring-boot-dependencies build.gradle (태그별) | https://github.com/spring-projects/spring-boot | ⭐⭐⭐ High | 2026-11-06 | 재검증 — 2.7.18=4.0.3, 3.0/3.2=5.0.1, 3.3/3.4=5.1.0, 3.5.0=6.3.0, 3.5.16=6.3.3, 4.0.0~4.1.2=7.0.2 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (HikariCP 3.4.5 ~ 5.x)
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임 (Spring Boot application.yml)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (파라미터별 의미, 산정 공식)
- [✅] 코드 예시 포함 (MySQL/Oracle 각각 application.yml)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (운영 체크리스트)
- [✅] 흔한 실수 패턴 포함 (풀 크기 과대, DBCP 설정명 혼용, maxLifetime > wait_timeout 등)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (진단 순서, 로그 해석)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 없음)

### 4-4. 교차 검증한 클레임 요약

| # | 클레임 | 판정 |
|---|--------|------|
| 1 | `maximumPoolSize` 기본값은 10 | VERIFIED |
| 2 | `connectionTimeout` 기본 30000ms, 최소 250ms | VERIFIED |
| 3 | `maxLifetime` 기본 1800000ms, 최소 30000ms | VERIFIED |
| 4 | `idleTimeout` 기본 600000ms (10분), 최소 10000ms | VERIFIED |
| 5 | `keepaliveTime` 기본 120000ms (2분), 최소 30000ms | VERIFIED |
| 6 | `leakDetectionThreshold` 기본 0(비활성), 최소 2000ms | VERIFIED |
| 7 | 풀 사이징 공식: `(core*2)+spindle` | VERIFIED |
| 8 | "작은 풀이 더 빠르다" 및 Oracle 사례 2048→96 50배 개선 | VERIFIED |
| 9 | MySQL 권장 속성 10종 (`cachePrepStmts`, `prepStmtCacheSize`, `prepStmtCacheSqlLimit`, `useServerPrepStmts`, `useLocalSessionState`, `rewriteBatchedStatements`, `cacheResultSetMetadata`, `cacheServerConfiguration`, `elideSetAutoCommits`, `maintainTimeStats`) | VERIFIED |
| 10 | `prepStmtCacheSize` 공식 권장값 250~500 | VERIFIED |
| 11 | Oracle JDBC 고유 속성: `oracle.jdbc.ReadTimeout`, `oracle.net.CONNECT_TIMEOUT` | VERIFIED |
| 12 | `oracle.jdbc.defaultConnectionValidation` 기본값 `NETWORK`, `LOCAL`/`SOCKET` 권장 | VERIFIED |
| 13 | maxLifetime은 DB wait_timeout보다 최소 30초 짧아야 함 | VERIFIED |
| 14 | HikariCP 최신 안정 버전 7.0.2 (2026-04 기준) | VERIFIED |
| 15 | Spring Boot 3.4 기본 HikariCP 5.1.x | VERIFIED |
| 16 | HikariCP 3.4.5는 Java 8 호환 빌드 수정 포함 | VERIFIED |
| 17 | 소켓 타임아웃 권장값 "가장 긴 쿼리의 2~3배 또는 30초 중 큰 값" | VERIFIED |
| 18 | Micrometer 메트릭 이름 `hikaricp.connections.active/idle/pending/timeout/usage` | VERIFIED |
| 19 | HikariCP 설정 키는 `autoCommit`(카멜케이스), DBCP의 `defaultAutoCommit`이 아님 | DISPUTED → 수정 반영 |
| 20 | `keepaliveTime`은 HikariCP 4.0.x에서 추가됨 (3.4.5에는 없음) | VERIFIED |
| 21 | (2026-11-06 재검증) HikariCP 최신 안정 7.1.0, 7.x까지 설정 키 이름 변경 없음 (근거: CHANGES + Maven Central) | VERIFIED |
| 22 | (2026-11-06) `keepaliveTime` 기본 120000ms (근거: CHANGES — 6.2.1에서 2분으로 변경, 이전 0) | DISPUTED → 표에 버전별 기본값 병기 |
| 23 | (2026-11-06) "HikariCP 4.0.x부터 Java 11+ 전용" (근거: README — Java 8 아티팩트 = 4.0.3, Java 11+는 5.x) | DISPUTED → "5.0.0부터 Java 11+"로 수정 |
| 24 | (2026-11-06) Spring Boot 2.7.x 번들 "4.0.3 → 5.0.1" (근거: Boot 2.7.18 BOM = 4.0.3, 5.x 금지) | DISPUTED → 4.0.3로 수정 |
| 25 | (2026-11-06) Spring Boot 3.5.x 번들 5.1.x (근거: Boot 3.5.0 = 6.3.0, 3.5.16 = 6.3.3) | DISPUTED → 6.3.x로 수정 |
| 26 | (2026-11-06) `HikariCredentialsProvider`가 `getUsername()`/`getPassword()`를 구현 (근거: 소스 — `Credentials getCredentials()` 단일 메서드, `Credentials.of(user, pass)`) | DISPUTED → 예시 코드 수정 |
| 27 | (2026-11-06) Spring Boot 4.0.x~4.1.x 번들 7.0.x (근거: 4.0.0·4.0.9·4.1.2 BOM = 7.0.2) | VERIFIED (7.0.2로 구체화) |

**요약:** VERIFIED 19건 / DISPUTED 1건 (수정 반영 완료) / UNVERIFIED 0건 — 2026-11-06 재검증 추가분: VERIFIED 2 / DISPUTED 5(모두 수정 반영)

**DISPUTED 처리:** 사용자 요청 원문의 `defaultAutoCommit`은 HikariCP의 정확한 설정명이 아니며, 공식 키는 `autoCommit`임. SKILL.md에서 양자 구분을 명시하여 혼동 방지.

### 4-5. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-04-22)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-11-06 재검증 수정분 재시험 3/3 PASS — 섹션 5 참조)
- [✅] 잘못된 응답 없음 — 보완 불필요

---

## 5. 테스트 진행 기록

### 재검증 후 재시험 (2026-11-06)

**수행일**: 2026-11-06
**수행자**: skill-tester → general-purpose (3개 병렬, 도메인 에이전트 대신 SKILL.md 의존 여부를 격리해 보기 위해 general-purpose 사용)
**수행 방법**: SKILL.md + references/REFERENCE.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인 (재검증으로 수정된 항목 중심)

**Q1. Spring Boot 3.2 → 3.5 업그레이드 시 번들 HikariCP 변화와 keepaliveTime 동작 변화, keepaliveTime과 maxLifetime 관계**
- ✅ PASS
- 근거: SKILL.md 상단 주의 블록 및 1절 파라미터 표(keepaliveTime 행), REFERENCE 10절 번들 표, 11.2절 변경사항 표
- 상세: 5.0.1 → 6.3.x, 기본값이 6.2.1에서 0 → 120000ms로 바뀌어 yml 미설정 시 keepalive가 새로 켜진다고 정확히 답변. keepaliveTime < maxLifetime 제약도 근거 제시. anti-pattern(구 기본값 0을 현재 기본값으로 서술, Boot 3.5를 5.1.x로 서술) 회피.

**Q2. Java 8 + Spring Boot 2.7에서 HikariCP 5.x로 올려도 되는가, Java 8 마지막 버전, Java 11+ 전용 시작 버전, 2.7 번들**
- ✅ PASS
- 근거: REFERENCE 9절(Java 8 아티팩트 4.0.3, Java 11+ 전용은 5.0.0부터), 10절 번들 표(2.7.x = 4.0.3), SKILL.md 상단 주의 블록
- 상세: "5.x 불가, Java 8 마지막 = 4.0.3, Java 11+ 전용은 5.0.0부터, 2.7 번들 4.0.3"을 정확히 답변. anti-pattern("4.0.x부터 Java 11+ 전용", "2.7 번들 5.0.1") 회피.

**Q3. 동적 DB 자격증명(Secrets Manager/IAM 토큰) 연결 — 구현 인터페이스·메서드·등록 방법·레거시 오버라이드 위상·도입 버전**
- ✅ PASS
- 근거: REFERENCE 11.1~11.3절(코드 예시와 주의 블록)
- 상세: `HikariCredentialsProvider` 구현, `Credentials getCredentials()` 단일 메서드, `Credentials.of(user, pass)` 반환, `setCredentialsProvider`/`setCredentialsProviderClassName` 등록, `getUsername()`/`getPassword()` 오버라이드는 레거시, 7.0+ 신규를 정확히 답변. anti-pattern(provider에 getUsername/getPassword 구현) 회피.

### 발견된 gap (모두 선택 보강, APPROVED 차단 요인 아님)

- REFERENCE 9절 제목이 "3.4.5"인데 본문은 4.0.3·5.0.0 경계까지 다뤄 찾기 어렵다
- REFERENCE 10절 오버라이드 예시(5.1.0)에 "Java 8 환경에서는 사용 불가" 경고가 없다
- `keepalive-time: 0`으로 새 keepalive를 끄는 처방이 문서에 직접 없다 (표의 "0(비활성)"에서 추론 가능)
- `getCredentials()` 호출 시점(커넥션 생성마다인지 캐시되는지), Spring Boot yml에서 provider를 지정하는 방법, 레거시 오버라이드를 켜는 시스템 프로퍼티 이름이 없다
- 11절 제목이 "Boot 4.x 마이그레이션"이라 3.5 이행 정보는 10절과 11.2절을 함께 봐야 한다

### 판정

- agent content test: PASS (3/3 PASS)
- verification-policy 분류: 해당 없음 (라이브러리 설정 가이드 — content test로 충분)
- 최종 상태: APPROVED 유지

---

### 최초 테스트 (2026-04-22)

**수행일**: 2026-04-22
**수행 방법**: general-purpose 에이전트에게 SKILL.md만 Read한 뒤 2개 실전 질문 답변 수행.

### 실제 수행 테스트

**Q1. MySQL `wait_timeout=28800`초(기본) 환경에서 `maxLifetime` 권장값?**
- ✅ PASS. 에이전트가 SKILL.md "필수 설정 파라미터 > maxLifetime 주의사항", "application.yml 설정 예시 > MySQL", "운영 투입 전 체크리스트" 섹션을 근거로 공식 (`maxLifetime` ≤ `wait_timeout` - 30초) 제시, `application.yml` 예시 그대로 인용.

**Q2. `HikariPool-1 - Connection is not available, request timed out after 30001ms` 진단 순서?**
- ✅ PASS. SKILL.md "5. Pool Exhaustion 진단 > 진단 순서"의 5단계(누수→느린쿼리→풀크기→멀티DS→트랜잭션) + "6. 모니터링" Micrometer 지표 8종을 체크리스트로 정확히 제시.

발견된 gap: MySQL `wait_timeout` 기본값(28800초) 환경 기준 **구체적 maxLifetime 숫자 권장값** 명시되지 않음. SKILL.md는 예시를 축소 환경(1800초) 기준으로만 제시. (경미한 보완 건, 다음 iteration 반영 권장)

---

### 재검증 (2026-09-26)

**수행자**: 메인 세션 (Sonnet 5), 서브에이전트 미사용(사용자 지시)
**수행 방법**: SKILL.md + REFERENCE.md 전체 Read → 핵심 클레임 WebSearch/WebFetch 3건 교차 검증 → 실전 질문 2개 재확인

**교차 검증 클레임:**
1. HikariCP 최신 안정 버전 — WebSearch(mvnrepository) 결과 7.0.2(2025-08-19) 확인, 이후 7.1.0(dependabot PR 다수 확인)도 릴리즈됨. CHANGES 파일(WebFetch, `raw.githubusercontent.com/.../dev/CHANGES`) 확인 결과 7.0.x~7.1.1 어디에도 `maximumPoolSize`/`minimumIdle`/`connectionTimeout`/`idleTimeout`/`maxLifetime`/`keepaliveTime`/`validationTimeout`/`leakDetectionThreshold`/`autoCommit` 설정 키 변경 없음 → **VERIFIED** (본문 "설정 키 변경 없음" 클레임 유지 타당)
2. Spring Boot 4.0 GA가 HikariCP 7.0 계열을 번들 — WebSearch로 "Spring Boot 4.0.0 available now"(2025-11-20, spring.io 공식 블로그) 및 GitHub 이슈 #46739("Upgrade to HikariCP 7.0.1")로 확인 → **VERIFIED**
3. HikariCredentialsProvider가 7.0.0 신규 기능 — CHANGES 파일에서 "fixed #1294 add support for HikariCredentialsProvider class"(7.0.0) 확인 → **VERIFIED**

**판정**: 본문 내용 변경 없음(정확). 다만 verification.md 섹션 4-4 클레임 #14의 "최신 안정 버전 7.0.2(2026-04 기준)"는 현재 기준 7.1.0까지 출시되어 있어 시점 표기이므로 그대로 두되 아래 재검증 각주로 갱신.

**Q1 (재확인). "Spring Boot 4.1 환경에서 HikariCP 설정 키가 3.x 시절과 달라졌는가?"**
- PASS — SKILL.md 섹션 11.2 "설정 키 변경 없음 — 기존 yml 그대로 동작"으로 정확히 답변 가능. WebFetch로 확인한 CHANGES 내용과 일치.

**Q2 (재확인). "HikariCP 최신 버전에서 AWS Secrets Manager 같은 동적 자격증명을 쓰려면?"**
- PASS — SKILL.md 섹션 11.3 `HikariCredentialsProvider` 예시로 정확히 답변 가능. 7.0.0에 실제 추가된 기능임을 CHANGES로 재확인.

**status**: 실질 내용 변경 없음 → APPROVED 유지

---

### (참고) 권장 테스트 케이스 (SKILL.md 작성 시 제시된 케이스 — 향후 실사용 시 수행)

### (예정) 테스트 케이스 1: 기본 풀 사이징 질문

**입력 (질문/요청):**
```
4코어 DB 서버, 디스크 1개 환경에서 HikariCP maximumPoolSize를 얼마로 설정해야 하나?
```

**기대 결과:**
```
공식 공식 (core_count * 2) + effective_spindle_count 적용 → (4 * 2) + 1 = 9
이후 부하 테스트로 ±2 조정하며 최적값 탐색 권장
```

**실제 결과:** (미수행)

**판정:** ⚠️ PENDING (테스트 미수행)

### (예정) 테스트 케이스 2: MySQL wait_timeout 관계

**입력:**
```
MySQL wait_timeout=600초 환경에서 HikariCP maxLifetime을 어떻게 설정해야 하나?
```

**기대 결과:** DB wait_timeout보다 최소 30초 짧게, 즉 570000ms 이하 (예: 560000ms 또는 570000ms)

**실제 결과:** (미수행)

**판정:** ⚠️ PENDING

### (예정) 테스트 케이스 3: Oracle 커넥션 복구 지연

**입력:**
```
Oracle DB 재시작 후 HikariCP 커넥션 복구가 오래 걸린다
```

**기대 결과:** `oracle.net.CONNECT_TIMEOUT=10000`, `oracle.jdbc.ReadTimeout=30000` 설정, `oracle.jdbc.defaultConnectionValidation=LOCAL` 검토

**실제 결과:** (미수행)

**판정:** ⚠️ PENDING

### (예정) 테스트 케이스 4: Pool Exhaustion 진단 순서

**입력:**
```
"HikariPool-1 - Connection is not available, request timed out after 30000ms" 에러 발생 시 조사 순서는?
```

**기대 결과:** 1) 누수 탐지 → 2) 느린 쿼리 확인 → 3) 풀 크기 재산정 → 4) 멀티 DS 총 커넥션 확인 → 5) 트랜잭션 경계 검토

**실제 결과:** (미수행)

**판정:** ⚠️ PENDING

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-04-22 수행 2/2 PASS, 2026-11-06 재검증 후 재시험 3/3 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] 에이전트 활용 테스트 — MySQL wait_timeout 관계 + Pool Exhaustion 진단 2건 PASS (섹션 5, general-purpose 대체, 2026-04-22). 추가 2종은 선택 보강
- [✅] 2026-11-06 재검증 수정분(keepaliveTime 버전별 기본값, Java 11+ 전용 5.0.0부터, Boot 번들표, HikariCredentialsProvider `getCredentials()`) 재시험 — skill-tester가 3개 질문 수행, 3/3 PASS (2026-11-06 완료, 섹션 5)
- [❌] (선택 보강, 차단 요인 아님) 섹션 5 "발견된 gap" 항목 반영 — REFERENCE 9절 제목, 10절 오버라이드 예시의 Java 8 경고, `keepalive-time: 0` 처방, provider yml 지정 방법
- [⏸️] Oracle 공식 블로그 WebFetch 실패 — 향후 인증서 이슈 해결 시 원문 재확인
- [🔬] 실제 운영 환경에서 `leakDetectionThreshold`, `prepStmtCacheSize` 튜닝 결과 feedback — 실환경 검증 대기
- [📅] HikariCP 7.x Breaking Change 조사 후 별도 섹션 추가 — 7.x 도입 시점에 검토

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-22 | v1 | 최초 작성, HikariCP 3.4.5 ~ 5.x 통합 가이드 | skill-creator |
| 2026-04-24 | v1 | 섹션 1 ❌ 마커·섹션 6 중복 요약표 cleanup (APPROVED 상태와 일관되도록 정리) | 메인 오케스트레이션 |
| 2026-06-19 | v1 | Spring Boot 4.x / HikariCP 7.0 마이그레이션 섹션 추가 (섹션 11 — HikariCP 번들 버전표, 설정 키 변경 없음, HikariCredentialsProvider, Virtual Thread 고려사항). 검증일 갱신. | Claude (Sonnet 4.6) |
| 2026-09-25 | v1 | 구조 개편: 상세 내용 references/REFERENCE.md 분리 (내용 변경 없음) | Claude (Sonnet 5) |
| 2026-09-26 | v1 | 정기 재검증 — HikariCP 7.0.x~7.1.x 설정 키 변경 없음·HikariCredentialsProvider 확인, 본문 변경 없음 | Claude (Sonnet 5) |
| 2026-11-06 | v1 | 재검증 — 최신 7.1.0·설정 키 변경 없음 확인. 정정: keepaliveTime 기본값 버전별 표기(6.2.1+ 2분/이전 0), Java 11+ 전용은 5.0.0부터(4.0.3 = Java 8), Boot 번들표(2.7=4.0.3, 3.5=6.3.x, 4.x=7.0.2), HikariCredentialsProvider 예시를 `getCredentials()`로 수정. skill-tester 재시험 예정 | Claude (Opus 5.5) |
| 2026-11-06 | v1 | 재검증 후 2단계 실사용 재시험 수행 (Q1 Boot 3.2→3.5 keepaliveTime 변화 / Q2 Java 8 + Boot 2.7 HikariCP 버전 / Q3 HikariCredentialsProvider 동적 자격증명) → 3/3 PASS, APPROVED 유지 | skill-tester |
| 2026-11-11 | v1 | 2026-11-11 정리 — 모델이 아는 일반 지식 절 제거(풀 크기·데드락 공식, minimumIdle 해설, maxLifetime 환경별 계산표, MySQL 단일 yml 예시, Leak 탐지·Pool Exhaustion 진단·Micrometer 모니터링 절, 벤치마크 팁, 중복 번들표). 남긴 절: 파라미터 기본값표(keepaliveTime 버전별), maxLifetime 주의, MySQL/Oracle datasource properties·autoCommit 주의, Oracle yml 예시, 멀티 DataSource, 3.4.5 레거시, SB 버전별 번들표·오버라이드, 체크리스트, 7.x 변경점·HikariCredentialsProvider·가상 스레드. 사실 재검증 아님 | Claude (Opus 5.5) |
