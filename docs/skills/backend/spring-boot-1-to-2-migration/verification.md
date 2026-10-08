---
skill: spring-boot-1-to-2-migration
category: backend
version: v1
date: 2026-10-08
status: PENDING_TEST
---

# spring-boot-1-to-2-migration 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `spring-boot-1-to-2-migration` |
| 스킬 경로 | `.claude/skills/spring-boot-1-to-2-migration/SKILL.md` |
| 검증일 | 2026-10-08 |
| 검증자 | skill-creator (Claude) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Spring Boot 공식 위키 릴리스 노트·Migration Guide, docs.spring.io, spring.io)
- [✅] 공식 GitHub 2순위 소스 확인 (spring-projects/spring-boot wiki, mybatis 공식 사이트, OpenRewrite 공식 문서)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-10-08 — 1.x 마지막 1.5.22, 2.x 마지막 2.7.18, 현행 OSS 4.x)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (단계 경로, 구간별 변경, 자동화 경계)
- [✅] 코드 예시 작성 (테스트 애노테이션, @Validated, Gradle 2.0 플러그인, ServletInitializer, Actuator 보안, OpenRewrite)
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성
- [✅] 기존 `spring-boot-2-to-3-migration` 스킬과 범위 중복 확인 (2.7 → 3.x 내용은 반복하지 않고 연결만)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch | Spring Boot 2.0 Migration Guide, 1.4·1.5 Release Notes, 2.1~2.7 Release Notes(7개), 1.5.22 시스템 요구사항, 1.4.x API deprecated-list | 1.3→2.7 구간 변경 사항 수집, 공식 전제 문구("latest 1.5.x") 원문 확인 |
| 조사 | WebFetch | OpenRewrite `UpgradeSpringBoot_2_0`·`UpgradeSpringBoot_2_7` 레시피 문서, Spring Boot 1→2 가이드 | 레시피 구성·연쇄 적용·라이선스(Moderne Source Available)·미지원 항목 확인 |
| 조사 | WebFetch | mybatis.org 호환표, spring.io/support-policy, endoflife.date/spring-boot | starter 대응표, 13/25개월·마지막 마이너 +5년 규칙, 라인별 종료일(2차) |
| 교차 검증 | WebSearch | 37개 클레임, 독립 소스(spring.io 블로그, Baeldung·개인 기술 블로그, OpenRewrite 문서, mvnrepository, 공식 API 문서) | VERIFIED 34 / DISPUTED 1 / UNVERIFIED 2 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Spring Boot 2.0 Migration Guide | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.0-Migration-Guide | ⭐⭐⭐ High | 2026-10-08 확인 | 공식 위키 |
| Spring Boot 1.4 / 1.5 Release Notes | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-1.4-Release-Notes , .../Spring-Boot-1.5-Release-Notes | ⭐⭐⭐ High | 2026-10-08 확인 | 공식 위키 |
| Spring Boot 2.1~2.7 Release Notes | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.1-Release-Notes (2.2~2.7 동일 패턴) | ⭐⭐⭐ High | 2026-10-08 확인 | 공식 위키 |
| Spring Boot 1.5.22 System Requirements | https://docs.spring.io/spring-boot/docs/1.5.22.RELEASE/reference/html/getting-started-system-requirements.html | ⭐⭐⭐ High | 2026-10-08 확인 | 공식 문서 |
| Spring Boot 1.4.x Deprecated API | https://docs.spring.io/spring-boot/docs/1.4.x/api/deprecated-list.html | ⭐⭐⭐ High | 2026-10-08 확인 | 공식 Javadoc |
| Config file processing in Spring Boot 2.4 | https://spring.io/blog/2020/08/14/config-file-processing-in-spring-boot-2-4 | ⭐⭐⭐ High | 2020-08-14 | 공식 블로그 |
| OpenRewrite UpgradeSpringBoot_2_0 / 2_7 | https://docs.openrewrite.org/recipes/java/spring/boot2/upgradespringboot_2_0 , .../upgradespringboot_2_7 | ⭐⭐⭐ High | 2026-10-08 확인 | 도구 공식 문서 |
| OpenRewrite Spring Boot 1→2 가이드 | https://docs.openrewrite.org/running-recipes/popular-recipe-guides/spring-boot-2.x-migration-from-spring-boot-1.x | ⭐⭐⭐ High | 2026-10-08 확인 | 도구 공식 문서 |
| MyBatis Spring Boot Starter 호환표 | https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/ | ⭐⭐⭐ High | 2026-10-08 확인 | 공식 문서 |
| Spring Support Policy | https://spring.io/support-policy | ⭐⭐⭐ High | 2026-10-08 확인 | 공식 정책 |
| endoflife.date — Spring Boot | https://endoflife.date/spring-boot | ⭐⭐ Medium | 2026-10-08 확인 | 2차 소스(날짜 표) |
| Spring Boot 2.0 actuator change analysis | https://blog.frankel.ch/spring-boot-2-actuator-change-analysis/ | ⭐⭐ Medium | — | 교차 검증용 기술 블로그 |
| Baeldung — BeanDefinitionOverrideException | https://www.baeldung.com/spring-boot-bean-definition-override-exception | ⭐⭐ Medium | — | 교차 검증용 |

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 클레임별 교차 검증 결과

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | 2.0 가이드는 "시작 전 최신 1.5.x로 먼저 업그레이드"를 전제로 한다 | VERIFIED | 2.0 Migration Guide 원문 + OpenRewrite 가이드 |
| 2 | 공식 문서에 "1.x→3 직행 금지"라는 별도 문구는 없다(각 가이드의 전제로만 표현) | VERIFIED | 2.0 가이드·1.4/1.5 노트 원문 확인 — 해당 문구 부재 |
| 3 | 1.4에서 `-ws`→`-web-services`, `-redis`→`-data-redis` 이름 변경, 1.5에서 구 이름 제거 | VERIFIED | 1.4·1.5 Release Notes 양쪽 |
| 4 | 1.4에서 Log4j 1 지원 제거, 1.3 deprecated 제거 | VERIFIED | 1.4 Release Notes |
| 5 | 1.4 Hibernate 5.0 기본, `hibernate.version`으로 4.3 임시 복귀 가능 | VERIFIED | 1.4 Release Notes |
| 6 | 1.4 `SpringPhysicalNamingStrategy` + Hibernate 기본 Implicit 전략 | VERIFIED | 1.4 Release Notes, OpenRewrite 2.7 레시피 타입 마이그레이션 항목 |
| 7 | 1.4 `@SpringApplicationConfiguration`/`@IntegrationTest`/`@WebIntegrationTest` → `@SpringBootTest` | VERIFIED | 1.4 Release Notes + 1.4 API deprecated-list |
| 8 | `SpringBootServletInitializer` 패키지: `context.web`(1.3) → `web.support`(1.4) → `web.servlet.support`(2.0) | VERIFIED | 1.4 API deprecated-list + OpenRewrite 패키지 이동 레시피 + 검색 |
| 9 | 1.4 실행 jar 레이아웃 `BOOT-INF/lib` | VERIFIED | 1.4 Release Notes |
| 10 | 1.5 JSR-303 `@ConfigurationProperties`에 `@Validated` 필요(당장은 경고) | VERIFIED | 1.5 Release Notes |
| 11 | 1.5 `spring.session.store-type` 명시 필요 | VERIFIED | 1.5 Release Notes |
| 12 | 1.5 Actuator 기본 보호, 역할 `ADMIN`→`ACTUATOR` | VERIFIED | 1.5 Release Notes |
| 13 | 1.5는 Java 7+(Java 8 권장), Framework 4.3.x | VERIFIED | 1.5.22 시스템 요구사항 |
| 14 | 2.0은 Java 8+, Spring Framework 5.0 | VERIFIED | 2.0 Migration Guide + 검색 |
| 15 | `spring-boot-properties-migrator` 임시 사용 후 제거 | VERIFIED | 2.0 Migration Guide + 기존 2-to-3 스킬 근거와 일치 |
| 16 | relaxed binding 엄격화, canonical(kebab) 형식, `RelaxedPropertyResolver` 제거 | VERIFIED | 2.0 Migration Guide |
| 17 | `security.basic.*` 등 제거, 커스텀 `WebSecurityConfigurerAdapter` 시 back off, `management.security.*` 제거 | VERIFIED | 2.0 Migration Guide |
| 18 | Actuator `/actuator` 기본 경로, 웹 노출 기본 `health`·`info`, `/autoconfig`→`/conditions`, `/trace`→`/httptrace` | VERIFIED | 2.0 Migration Guide + frankel.ch 블로그 |
| 19 | 2.0 기본 커넥션 풀 Tomcat → HikariCP | VERIFIED | 2.0 Migration Guide + 검색 |
| 20 | Hibernate 최소 5.2, `use-new-id-generator-mappings` 기본 true | VERIFIED | 2.0 Migration Guide |
| 21 | Gradle 4+, dependency-management 자동 적용 중단, `bootRepackage`→`bootJar`/`bootWar` | VERIFIED | 2.0 Migration Guide + OpenRewrite(Gradle wrapper 4.x) |
| 22 | Jackson JSR-310 ISO-8601 기본, Lettuce 기본, `.json` suffix 기본 비활성, Thymeleaf 3, Flyway/Liquibase `spring.*` 이동, DataSource 초기화 임베디드 한정 | VERIFIED | 2.0 Migration Guide(2회 조회) |
| 23 | 2.1 bean overriding 기본 비활성 (`allow-bean-definition-overriding`) | VERIFIED | 2.1 Release Notes + Baeldung |
| 24 | 2.2 JUnit 5 기본(Vintage 포함), `logging.file.name`/`logging.file.path` | VERIFIED | 2.2 Release Notes |
| 25 | 2.3 web starter에서 validation 제외 → `spring-boot-starter-validation` | VERIFIED | 2.3 Release Notes |
| 26 | 2.4 설정 파일 처리 변경, `spring.config.use-legacy-processing`, `spring.config.activate.on-profile` | VERIFIED | 2.4 Release Notes + spring.io 블로그 |
| 27 | 2.4 `spring-boot-starter-test`에서 Vintage 엔진 제거 | VERIFIED | 2.4 Release Notes |
| 28 | 2.5 `spring.sql.init.*`, `data.sql`이 Hibernate 전에 실행, `defer-datasource-initialization` | VERIFIED | 2.5 Release Notes |
| 29 | 2.6 순환 참조 기본 금지(`allow-circular-references`), `PathPatternParser` 기본 | VERIFIED | 2.6 Release Notes + 검색(다수 독립 블로그) |
| 30 | 2.7 `spring.factories` 자동설정 등록 deprecated → `AutoConfiguration.imports`, `WebSecurityConfigurerAdapter` deprecated | VERIFIED | 2.7 Release Notes + 기존 2-to-3 스킬 근거 |
| 31 | MySQL 드라이버 좌표 `com.mysql:mysql-connector-j` 변경은 2.7.8부터 | VERIFIED | 2.7 Release Notes(패치별 갱신) + 검색(2.7.8 릴리스) |
| 32 | `UpgradeSpringBoot_2_0` 구성(패키지 이동·MyBatis 2.0·Gradle 4.x 등), `UpgradeSpringBoot_2_7`은 하위 버전 연쇄 포함, 1→2 가이드 권장 레시피 = 2_7, 미지원 항목 3종 | VERIFIED | OpenRewrite 레시피 문서 2종 + 가이드 |
| 33 | rewrite-spring 레시피 라이선스 = Moderne Source Available License | VERIFIED | OpenRewrite 레시피 문서 2종 |
| 34 | mybatis-spring-boot-starter 대응표(1.1~1.3 → 2.0~2.3) | DISPUTED | 공식 페이지는 2.3 = Boot **2.7**, 과거 표·검색 요약은 2.3 = 2.5–2.7. 공식 현행 페이지 값 채택 + SKILL.md `> 주의:` 표기 |
| 35 | 지원 정책: 마이너 OSS 최소 13개월, 상용 최소 25개월, 마지막 마이너 +5년 | VERIFIED | spring.io/support-policy + endoflife.date 날짜 패턴과 일치 |
| 36 | 라인별 종료일(1.5·2.0·2.7·3.5·4.0·4.1) | UNVERIFIED | endoflife.date 단독(2차). 3.5 OSS 종료(2026-06-30)는 기존 2-to-3 스킬과 일치하나 나머지는 1차 원문 대조 미실시 → SKILL.md `> 주의:` 표기 |
| 37 | Spring Cloud 릴리스 트레인 대응, Springfox 2.x와 2.6 경로 매칭 충돌 세부 | UNVERIFIED | 원문 대조 미실시 → SKILL.md `> 주의: 미검증` 성격 문구로 표기 |

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (1.3/1.4/1.5.22, 2.0~2.7.18, Framework 4.3/5.0/5.1/5.3)
- [✅] deprecated된 패턴을 권장하지 않음 (`WebSecurityConfigurerAdapter`는 2.0 단계 한정 사용으로 명시, 2.7에서 전환 안내)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (0장)
- [✅] 흔한 실수 패턴 포함 (9장)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 회사 코드 예시 없음)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-10-08, 3문항, general-purpose 대체 사용)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (잘못된 응답 없음. 경미한 상호참조 오류 1건은 섹션 7에 후속으로 기록)

---

## 5. 테스트 진행 기록

**수행일**: 2026-10-08
**수행자**: skill-tester → general-purpose (java-backend-developer 대신 general-purpose로 대체 사용)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 1.3.x WAR 레거시를 "2.7로 한 번에" 올리자는 제안 — 경로·직행 불가 사유·단계별 필수 작업**
- ✅ PASS
- 근거: SKILL.md 1장(공식 전제 경로), 2.1·2.2장, 3.2장, 4장, 7장 체크리스트, 9장 첫 행
- 상세: 1.3→1.4→1.5.22→2.0→2.7.18 경로와 단계별 독립 배포를 제시했다. 직행 불가 사유는 "2.0 가이드의 최신 1.5.x 전제"와 "deprecated 경고 단계 생략"으로 제시했고, "공식 문서에 직행 금지 문구가 있다"는 식의 과장 없이 SKILL.md 1장 서술과 일치했다. `@SpringBootTest` 전환, starter 이름(`-web-services`, `-data-redis`), `SpringBootServletInitializer` 패키지 2회 이동, `bootWar`/dependency-management 명시 적용, Java 8 유지 가능을 모두 정확히 인용했다. anti-pattern(`bootRepackage` 유지, 구 테스트 애노테이션 유지) 없음.

**Q2. 2.0 배포 후 LB 비정상 / 커넥션 대기 / 날짜 파싱 실패, 2.4 업그레이드 후 테스트 수 감소 및 프로파일 값 덮어쓰기**
- ✅ PASS
- 근거: SKILL.md 3.4장 "기본 경로", 3.5장 "기본 커넥션 풀"·"Jackson 날짜", 4장 2.4 두 행, 9장, Phase 2·3 체크리스트
- 상세: `/actuator/health` 경로 변경 + 인프라 동시 배포, Tomcat JDBC 키 무시 → `spring.datasource.hikari.*`, ISO-8601 날짜 및 `write-dates-as-timestamps`, Vintage 제거로 JUnit 4 테스트 조용히 미실행, `spring.config.activate.on-profile` 재작성(임시 `use-legacy-processing`은 3.x 전 제거) 모두 SKILL.md와 일치. 5개 증상 모두 원인·조치가 표와 9장에 직접 대응.

**Q3. 2.7.18이 도착지인가 / 현재 보안 패치를 위한 목표 버전 / 상용 계약 없고 Java 8 고정 시 / OpenRewrite 범위 / mybatis starter 버전**
- ✅ PASS
- 근거: SKILL.md 8장(중기 기착지 결론·지원 종료표), 5장 도구/사람 표, 6.1장 mybatis 호환표(`> 주의:` 포함)
- 상세: "2.7.18은 중간 기착지", OSS 지원 중인 라인은 4.x뿐(2차 소스 날짜 단서 포함 인용), Java 8이면 2.7이 상한이며 Java 업그레이드 선행, OpenRewrite 자동화/수동 항목 및 Moderne 라이선스 주의, mybatis starter 2.3(공식 페이지 기준 Boot 2.7)과 대응표 DISPUTED 주의를 정확히 인용했다.

### 발견된 gap (있으면)

- SKILL.md 2.1장 WAR 초기화 클래스 행의 "(2.0에서 한 번 더 이동 — 3.3)" 상호참조 번호가 부정확 (실제 내용은 3.2장 표). 답변 정확성에는 영향 없음, 선택 보강.
- 6.1장 표에서 mybatis starter 2.2(Boot 2.5–2.7)와 2.3(Boot 2.7) 범위가 겹쳐 2.7.x에서 어느 쪽이 필수인지 표만으로는 모호 (본문 "2.7 도착 시 목표"와 주의문으로 해소됨).
- Java 8에 묶이고 상용 지원이 없는 경우의 임시 위험 완화책은 다루지 않음 (범위 밖, 선택 보강).
- 1.x 구간의 Gradle 플러그인 처리, Hikari 키 상세 매핑은 이 스킬에 없음 (후자는 hikaricp-tuning-oracle-mysql 스킬로 위임됨).

### 판정

- agent content test: PASS (3/3 PASS)
- verification-policy 분류: 마이그레이션 가이드 (실사용 필수 스킬)
- 최종 상태: PENDING_TEST 유지 (content test는 통과했으나 실제 1.x 프로젝트 적용 전까지 APPROVED 전환 불가)

### (참고) 기존 템플릿

(예정) 테스트 질문 2~3개 수행 후 기록하는 형식은 위 "실제 수행 테스트" 블록으로 대체되었다.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (DISPUTED 1건 수정 반영, UNVERIFIED 2건 주의 표기) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-10-08, 3/3 PASS) |
| **최종 판정** | **PENDING_TEST** (content test 통과, 마이그레이션 가이드 카테고리라 실사용 전까지 유지) |

> 참고: 이 스킬은 마이그레이션 가이드이므로 verification-policy.md "실사용 필수 스킬"에 해당한다. content test 통과 후에도 실제 프로젝트 적용 전까지 PENDING_TEST 유지가 원칙이다.

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-10-08 완료, 3/3 PASS)
- [❌] SKILL.md 2.1장 "(2.0에서 한 번 더 이동 — 3.3)" 상호참조를 3.2로 정정 (선택 보강, 차단 요인 아님)
- [❌] endoflife.date 날짜(클레임 36)를 spring.io 프로젝트 지원 페이지 등 1차 소스와 대조 (선택 보강, 차단 요인 아님)
- [❌] Spring Cloud 릴리스 트레인 ↔ Boot 2.x 마이너 대응표 원문 확인 후 6.2절 보강 (클레임 37)
- [❌] 실제 1.x 레거시 프로젝트에 적용해 단계별 체크리스트 검증 (실사용 필수 카테고리 — APPROVED 전환의 유일한 차단 요인)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-10-08 | v1 | 최초 작성 | skill-creator (Claude) |
| 2026-10-08 | v1 | 2단계 실사용 테스트 수행 (Q1 1.3→2.7 경로·직행 불가·단계별 작업 / Q2 2.0 배포 장애 3종 + 2.4 테스트 감소·프로파일 덮어쓰기 / Q3 최종 목표 버전·OpenRewrite 범위·mybatis starter) → 3/3 PASS, PENDING_TEST 유지 (마이그레이션 가이드 = 실사용 필수) | skill-tester |
