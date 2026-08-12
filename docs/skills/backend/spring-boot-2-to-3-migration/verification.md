---
skill: spring-boot-2-to-3-migration
category: backend
version: v1
date: 2026-08-11
status: PENDING_TEST
---

# spring-boot-2-to-3-migration 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `spring-boot-2-to-3-migration` |
| 스킬 경로 | `.claude/skills/backend/spring-boot-2-to-3-migration/SKILL.md` |
| 검증일 | 2026-08-11 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 기준 버전 | Spring Boot 2.5/2.7.18 → 3.x(3.5.x 목표), Java 11 → 17/21, Spring Framework 5.3 → 6.0+, Spring Security 5.5 → 6.x |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (spring.io 공식 문서 · Spring Boot GitHub wiki 마이그레이션 가이드)
- [✅] 공식 GitHub 2순위 소스 확인 (spring-projects/spring-boot, spring-projects/spring-framework, micrometer-metrics/tracing, mybatis/spring-boot-starter, apache/tomcat-jakartaee-migration)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-08-11 — Boot 3.5 라인 OSS EOL 2026-06-30, 현행 OSS 라인 4.x 상황 반영)
- [✅] 기존 레거시/모던 짝 스킬 13종 확인 후 중복 서술 제거·참조 링크로 대체
- [✅] `.claude/rules/java.md` "Spring Boot 3 전환 시" 4개 항목과 정합성 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (Phase 0~9 게이트 구조)
- [✅] 코드 예시 작성 (Gradle 설정, Security 5.8 선행 전환 Before/After, OpenRewrite 실행, Tomcat 마이그레이션 도구)
- [✅] 흔한 실수 패턴 정리 (10건)
- [✅] 롤백 판단 기준 정리 (즉시 롤백 / 관찰 후 판단 / 롤백 불가 지점)
- [✅] SKILL.md 파일 작성
- [❌] README.md 반영 — **이번 작업 범위에서 명시적으로 제외됨**(병렬 작업 충돌 방지). 메인 세션에서 일괄 반영 필요

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 확보 |
| 중복 확인 | Glob | `.claude/skills/**/spring-boot-2-to-3-migration/SKILL.md` | 결과 없음 → 신규 생성 확정 |
| 기존 자산 파악 | Glob + Grep + Read | `.claude/skills/backend/*/SKILL.md` 50종 description, `spring-boot-gradle-setup` 6장, `spring-security-6-jwt-jjwt12`, `springdoc-openapi-3`, `redis-redisson-modern` | 짝 스킬 13종 매핑 확보, `spring-boot-gradle-setup` 6장과의 중복 구간 식별 → 참조 방식으로 회피 |
| 규칙 정합성 | Read | `.claude/rules/java.md` | "Spring Boot 3 전환 시" 4항목(javax→jakarta, SecurityFilterChain, Springdoc, Micrometer Tracing) 모두 스킬에 반영 |
| 조사 | WebFetch | Spring Boot 3.0 Migration Guide / 3.0 Release Notes / upgrading.html / system-requirements.html / Spring Framework 6.0 Release Notes / Sleuth 3.1 Migration Guide(micrometer wiki) / spring.io Security 블로그 / OpenRewrite 레시피 / mybatis starter README / Security 6.5 migration-7 | 공식 소스 10건 확보 |
| 조사 | WebSearch | Sleuth→Micrometer, jakarta 전환 범위, 프로퍼티 rename, Tomcat 10 jakarta 도구, ojdbc11, HikariCP, MyBatis 매트릭스, Redisson, Lucy XSS | 보조 소스 9건, 1순위 소스 교차 확인용 |
| 교차 검증 | WebSearch + WebFetch | 16개 클레임, 독립 소스 2개 이상 | VERIFIED 14 / DISPUTED 2 / UNVERIFIED 0 |

> WebFetch 실패(404) 후 대체한 소스: `spring-security/reference/6.0/migration/index.html`(404) → `spring-security/reference/6.5/migration-7/configuration.html` + spring.io 공식 블로그 + Spring Security 6.0 whats-new 검색 결과로 대체.
> `spring-framework/wiki/Upgrading-to-Spring-Framework-6.x`(렌더 실패) → `Spring-Framework-6.0-Release-Notes`로 대체.

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Spring Boot 3.0 Migration Guide | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide | ⭐⭐⭐ High | 2026-08-11 확인 | 1순위. Java 17, 2.7 선행, jakarta, properties-migrator, MySQL 좌표, Security 5.8 선행 |
| Spring Boot 3.0 Release Notes | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Release-Notes | ⭐⭐⭐ High | 2026-08-11 확인 | Jakarta EE 10/Servlet 6.0, Tomcat 10, Hibernate 6.1, 제거 기능 |
| Upgrading Spring Boot (공식 레퍼런스) | https://docs.spring.io/spring-boot/upgrading.html | ⭐⭐⭐ High | 2026-08-11 확인 | "현재 라인 최신 마이너 우선" 정책, properties-migrator 사용·제거 |
| Spring Boot System Requirements | https://docs.spring.io/spring-boot/system-requirements.html | ⭐⭐⭐ High | 2026-08-11 확인 | Java/Maven/Gradle/서블릿 컨테이너 요구사항(현행 4.1 기준) |
| Spring Framework 6.0 Release Notes | https://github.com/spring-projects/spring-framework/wiki/Spring-Framework-6.0-Release-Notes | ⭐⭐⭐ High | 2026-08-11 확인 | Java 17, Jakarta EE 9+, Tomcat 10, EhCache 2·Joda-Time 지원 제거, 트레일링 슬래시, @Async 제약, -parameters |
| Spring Security 공식 블로그 (adapter 제거) | https://spring.io/blog/2022/02/21/spring-security-without-the-websecurityconfigureradapter/ | ⭐⭐⭐ High | 2026-08-11 확인 | 5.7.0-M2 deprecated, SecurityFilterChain·WebSecurityCustomizer·AuthenticationManager Bean |
| Spring Security Configuration Migrations | https://docs.spring.io/spring-security/reference/6.5/migration-7/configuration.html | ⭐⭐⭐ High | 2026-08-11 확인 | `.and()`·비람다 DSL 7.0 제거 예정 |
| Spring Cloud Sleuth 3.1 Migration Guide | https://github.com/micrometer-metrics/tracing/wiki/Spring-Cloud-Sleuth-3.1-Migration-Guide | ⭐⭐⭐ High | 2026-08-11 확인 | 패키지·의존성·프로퍼티·전파 포맷·Executor wrap·@AutoConfigureObservability |
| MyBatis spring-boot-starter README | https://github.com/mybatis/spring-boot-starter | ⭐⭐⭐ High | 2026-08-11 확인 | 버전 매트릭스 (2.3.x/3.0.x/4.0.x) |
| Apache Tomcat Jakarta EE Migration Tool | https://github.com/apache/tomcat-jakartaee-migration | ⭐⭐⭐ High | 2026-08-11 확인 | 소스 없는 아티팩트 변환 |
| Apache Tomcat 10 Migration Guide | https://tomcat.apache.org/migration-10.html | ⭐⭐⭐ High | 2026-08-11 확인 | Tomcat 9 앱은 Tomcat 10에서 그대로 못 돎, legacy appBase 자동 변환 |
| Springdoc — Migrating from Springfox | https://springdoc.org/migrating-from-springfox.html | ⭐⭐⭐ High | 2026-08-11 확인 | Springfox → Springdoc 매핑 (기존 스킬에서도 검증됨) |
| OpenRewrite UpgradeSpringBoot_3_0 (Community) | https://docs.openrewrite.org/recipes/java/spring/boot3/upgradespringboot_3_0-community-edition | ⭐⭐⭐ High | 2026-08-11 확인 | 레시피 포함 범위·Maven/Gradle 실행 명령 |
| Redisson 공식 문서 / GitHub issue #5382 | https://redisson.pro/docs/integration-with-spring/ · https://github.com/redisson/redisson/issues/5382 | ⭐⭐⭐ High | 2026-08-11 확인 | 3.18.1부터 Spring Data Redis 3.x 의존 → SB 2.x 비호환 |
| naver/lucy-xss-servlet-filter Issues #49·#50 | https://github.com/naver/lucy-xss-servlet-filter/issues/50 | ⭐⭐⭐ High | 2026-08-11 확인 | `javax.servlet` 기반, SB 3 미지원, 레포 아카이브 |
| Oracle JDBC Downloads / FAQ | https://www.oracle.com/database/technologies/appdev/jdbc-downloads.html | ⭐⭐⭐ High | 2026-08-11 확인 | ojdbc11(JDK11+, JDBC 4.3) vs ojdbc8(JDBC 4.2 제한) |
| Spring Boot issue #30381 (metrics export 이동) | https://github.com/spring-projects/spring-boot/issues/30381 | ⭐⭐⭐ High | 2026-08-11 확인 | `management.metrics.export.<product>` → `management.<product>.metrics.export` |
| OpenRewrite SpringBootProperties_3_0 | https://docs.openrewrite.org/recipes/java/spring/boot3/springbootproperties_3_0 | ⭐⭐ Medium | 2026-08-11 확인 | 프로퍼티 rename 목록 보조 확인 |
| Spring Boot issue #46200 (Hikari) | https://github.com/spring-projects/spring-boot/issues/46200 | ⭐⭐ Medium | 2026-08-11 확인 | 3.5.3에서 HikariCP 5.1.0 → 6.3.0 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 핵심 클레임 교차 검증 결과

| # | 클레임 | 독립 소스 | 판정 |
|---|--------|-----------|------|
| 1 | Spring Boot 3.0은 Java 17 이상 필수 (Java 8/11 미지원) | Boot 3.0 Migration Guide + Boot 3.0 Release Notes + system-requirements | **VERIFIED** |
| 2 | 3.x로 가기 전 2.7 최신 패치로 먼저 올리는 것이 공식 권장 경로 | Boot 3.0 Migration Guide + docs.spring.io/spring-boot/upgrading.html | **VERIFIED** |
| 3 | `spring-boot-properties-migrator`는 runtime scope 임시 의존성이며 완료 후 제거해야 함 | upgrading.html + Boot 3.0 Migration Guide | **VERIFIED** |
| 4 | Jakarta EE 네임스페이스 전환은 EE 스펙 소유 패키지에만 적용되고 `javax.sql`·`javax.crypto`·`javax.naming` 등 JDK 소속은 유지 | Spring Framework 6.0 Release Notes(전환 대상 열거: inject/annotation/servlet/persistence) + OpenRewrite 마이그레이션 해설 | **VERIFIED** |
| 5 | Boot 3.0은 Jakarta EE 10 / Servlet 6.0 / Tomcat 10.1 기준 | Boot 3.0 Release Notes + Spring Framework 6.0 Release Notes | **VERIFIED** |
| 6 | Tomcat 9에는 Boot 3 WAR를 배포할 수 없고, Tomcat 10은 legacy appBase로 구 앱을 자동 변환한다 | tomcat.apache.org/migration-10.html + apache/tomcat-jakartaee-migration | **VERIFIED** |
| 7 | `WebSecurityConfigurerAdapter`는 5.7.0-M2 deprecated, 6.0에서 제거 → `SecurityFilterChain` Bean | spring.io 공식 블로그 + Spring Security 6.0 whats-new | **VERIFIED** |
| 8 | `antMatchers`/`mvcMatchers`/`regexMatchers`는 6.0에서 제거 → `requestMatchers` | Spring Security 5.8 Configuration Migrations + 6.0 whats-new | **VERIFIED** |
| 9 | Security 6에서 SecurityContext는 명시적 save 필요, RequestCache는 `continue` 파라미터 조건부 조회 | Spring Security 6.0 whats-new + Session Management Migrations 문서 | **VERIFIED** |
| 10 | Sleuth는 Spring Cloud 2022.0 릴리즈 트레인에서 제외, 코어가 Micrometer Tracing으로 이관. 기본 전파 포맷이 B3 → W3C로 변경 | micrometer tracing wiki 마이그레이션 가이드 + spring-attic/spring-cloud-sleuth README(3.1.x) | **VERIFIED** |
| 11 | Spring Framework 6에서 EhCache 2.x 지원 제거, Joda-Time 지원 제거 | Spring Framework 6.0 Release Notes(단독 명시) + Boot 3 마이그레이션 커뮤니티 가이드 | **VERIFIED** |
| 12 | MySQL 드라이버 좌표가 `mysql:mysql-connector-java` → `com.mysql:mysql-connector-j`로 변경 | Boot 3.0 Migration Guide + spring-boot-gradle-setup 스킬(기존 검증) | **VERIFIED** |
| 13 | Java 17에서는 ojdbc11 권장, ojdbc8은 JDBC 4.2 API로 제한 | Oracle JDBC Downloads 페이지 + Oracle JDBC FAQ | **VERIFIED** |
| 14 | Redisson은 3.18.1부터 Spring Data Redis 3.x에 의존 → SB 3 전용 | redisson issue #5382 + 레포 내 `redis-redisson-modern` 스킬(기존 검증) | **VERIFIED** |
| 15 | Boot 3.4/3.5의 Gradle 최소 버전 | **DISPUTED → 해소.** system-requirements.html은 현행(4.1) 기준으로 "Gradle 8.14+ 또는 9.x"를 제시하지만, 이는 **Boot 4.x 요구사항**이다. Boot 3.4 릴리즈 노트 기준 3.x는 **7.6.4+ 또는 8.4+**. 스킬에는 3.x 값을 적고 "Boot 3.4/3.5 기준"임을 명시했다. |
| 16 | `mybatis-spring-boot-starter` 3.0.x의 Spring Boot 지원 범위 | **DISPUTED → 부분 해소.** 공식 README 매트릭스는 3.0.x = SB **3.2~3.5**로 표기한다(SB 3.0/3.1은 미표기). 초기 3.0.x 패치가 SB 3.0/3.1과 함께 쓰였던 이력이 있으나 현행 공식 표기와 다르므로, 스킬에는 공식 표기를 싣고 "SB 3.0/3.1 목표 시 초기 3.0.x 패치 조합을 릴리즈 노트에서 확인"이라는 확인 지시로 처리했다. |

**요약: VERIFIED 14 / DISPUTED 2(모두 스킬 본문에 반영·주석 처리) / UNVERIFIED 0**

### 4-2. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (SB 2.5/2.7.18/3.x, Java 11/17/21, Security 5.5/5.8/6.x, Tomcat 9/10.1)
- [✅] deprecated된 패턴을 권장하지 않음 (`WebSecurityConfigurerAdapter`·`antMatchers`·`.and()`·Springfox·Sleuth를 모두 "제거 대상"으로만 서술)
- [✅] 코드 예시가 실행 가능한 형태임 (Gradle 스니펫, Security Before/After, OpenRewrite 명령, 마이그레이션 도구 CLI)
- [✅] 불확실 항목에 `> 주의:` 표기 (4.x 직행 비권장, Gradle 버전 기준, MyBatis 매트릭스, Lucy XSS 대체안, sed 일괄 치환 위험)

### 4-3. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL(12개)과 검증일 명시
- [✅] 핵심 개념 설명 포함 (Phase 게이트 구조, 리스크 등급표)
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (목표 버전 결정 기준표, 4.x 직행 비권장, C·D 등급 미해결 시 Phase 4 진입 금지)
- [✅] 흔한 실수 패턴 포함 (10건)
- [✅] 기존 스킬 중복 서술 회피 — 짝 스킬 지도(0장) + 각 표의 "참조 스킬" 열로 연결

### 4-4. 실용성
- [✅] 에이전트가 참조했을 때 실제 작업 순서를 도출할 수 있는 수준 (Phase 0~9 + 완료 체크리스트 14항목)
- [✅] 지나치게 이론적이지 않고 실용적 (인벤토리 스캔 명령, 게이트 조건, 롤백 신호 분류)
- [✅] 범용적으로 사용 가능 (특정 프로젝트명·로컬 경로 없음)

### 4-5. 요구 항목 커버리지 (요청 사항 대조)
- [✅] 사전 조건: Java 17+ 필수, 2.7 선행 단계적 경로 → 1장·2장·4.1
- [✅] `javax.*` → `jakarta.*` 전면 전환 → 5장 (+ JDK 소속 제외 목록, 소스 밖 javax)
- [✅] Security 5 → 6: adapter 제거 → SecurityFilterChain → 4.3
- [✅] Springfox → Springdoc → 6장 매트릭스
- [✅] Sleuth → Micrometer Tracing → 6.1
- [✅] 설정 프로퍼티 변경·제거 → 7장
- [✅] MyBatis·Oracle/MySQL 드라이버·HikariCP 호환 확인 지점 → 8장
- [✅] WAR/Tomcat 9 → 10.1 → 9장
- [✅] 마이그레이션 순서 체크리스트 + 롤백 판단 기준 → 2장·11장·13장
- [✅] OpenRewrite 자동화 경계 → 10장 자동화 경계표
- [✅] `.claude/rules/java.md`와 충돌 없음 (4개 전환 항목 모두 동일 방향, 레거시/모던 라벨 체계 유지)

### 4-6. Claude Code 에이전트 활용 테스트
- [✅] SKILL.md 기반 실전 질문 5개 수행 (섹션 5)
- [✅] 답변이 SKILL.md 근거 섹션으로 추적 가능한지 확인
- [✅] anti-pattern(2.5→3.x 직행, javax 전체 치환, Springfox 버전만 상향) 회피 여부 확인
- [❌] 실제 레거시 프로젝트에 적용해 빌드·배포 결과 확인 — **실사용 필수 스킬 카테고리이므로 미완**

---

## 5. 테스트 진행 기록

**수행일**: 2026-08-11
**수행자**: skill-creator (backend 도메인 content test)
**수행 방법**: SKILL.md Read 후 레거시 Spring Boot 유지보수 상황에서 실제로 들어올 법한 질문 5개를 만들고, SKILL.md만을 근거로 답변이 도출되는지 + 안티패턴을 회피하는지 확인

### Q1. "SB 2.5 + Java 11 프로젝트를 3.x로 올리려고 한다. 어떤 순서로 가야 하나?"

**기대**: 2.5 → 2.7.18 → Java 17 → Security 5.8 선행 → SB 3 + jakarta 순서. 직행 금지 근거 제시.
**실제**: 2장 Phase 0~9 표와 4장에서 순서가 그대로 도출됨. 1장 "출발 Boot 버전 = 2.7.x 최신 패치(2.7.18)" + 12장 "2.5 → 3.x 직행 → 2.7.18 경유" 로 안티패턴도 차단됨.
**판정**: ✅ **PASS** (근거: SKILL.md 2장 Phase 게이트, 4.1~4.3)

### Q2. "`javax`를 전부 `jakarta`로 sed 치환하면 되지 않나?"

**기대**: 금지. JDK 소속 `javax.sql`/`javax.crypto`/`javax.naming` 등은 유지해야 함을 명시.
**실제**: 5.1 표에 "그대로" 항목 5행이 별도로 있고, 판별 규칙("Jakarta EE 스펙이 소유한 패키지만 바뀐다")과 12장 흔한 실수 1행이 동일 결론으로 수렴.
**판정**: ✅ **PASS** (근거: SKILL.md 5.1, 12장)

### Q3. "Security 설정에서 `WebSecurityConfigurerAdapter`만 지우고 `SecurityFilterChain` Bean으로 바꿨는데 로그인 후 다음 요청이 익명 처리된다."

**기대**: Security 6의 SecurityContext 명시적 저장 변경을 지목하고 `SecurityContextRepository.saveContext()` 호출을 안내.
**실제**: 4.3 하위 "컴파일은 되는데 런타임에 터지는 것들" 표 1행이 정확히 이 증상·원인·대응을 담고 있음. 11장 즉시 롤백 신호에도 동일 케이스가 연결됨.
**판정**: ✅ **PASS** (근거: SKILL.md 4.3, 11장)

### Q4. "OpenRewrite 레시피를 돌려서 컴파일이 통과했다. 이제 배포해도 되나?"

**기대**: 아니오. 자동화가 커버하지 못하는 범위(런타임 동작 변경, 3rd-party 교체, JSP/TLD/리플렉션 문자열, 검증)를 제시.
**실제**: 10장 자동화 경계표 7행 + "컴파일 통과가 런타임 동작 동일성을 보장하지 않는다" 주의문에서 결론 도출. 9장(WAR)·8장(커넥션 장시간 테스트)도 추가 검증 항목으로 연결됨.
**판정**: ✅ **PASS** (근거: SKILL.md 10장, 8장, 13장 체크리스트)

### Q5. "배포 후 traceId가 서비스 간에 끊긴다. 즉시 롤백해야 하나?"

**기대**: 즉시 롤백 대상이 아님(관찰 후 판단). 원인은 B3/W3C 전파 포맷 혼재, 대응은 SB 2 쪽 dual 포맷 설정.
**실제**: 11장 "관찰 후 판단" 표 1행 + 6.1 주의문(`spring.sleuth.propagation.type=w3c,b3` 등 SB 2 선행 배포)에서 정확히 도출. 즉시 롤백 표와 명확히 구분됨.
**판정**: ✅ **PASS** (근거: SKILL.md 6.1, 11장)

### 부가 확인 — 중복 서술 회피

기존 `spring-boot-gradle-setup` 6장(2→3 마이그레이션 체크리스트)과의 경계를 확인했다.
빌드 스크립트·패키징 스니펫은 이 스킬에서 재작성하지 않고 9장·1장에서 참조로만 연결했으며,
이 스킬은 그 문서에 없는 **Phase 게이트·리스크 등급·자동화 경계·롤백 기준·DB 호환 매트릭스**를 담당한다. → 경계 분리 확인.

**agent content test: 5/5 PASS**

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (VERIFIED 14 / DISPUTED 2 반영 완료 / UNVERIFIED 0) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 요구 항목 커버리지 | ✅ (요청 11개 항목 전부 반영) |
| 에이전트 활용 테스트(content test) | ✅ 5/5 PASS |
| 실사용(빌드·배포) 검증 | ❌ 미실시 |
| **최종 판정** | **PENDING_TEST** |

> 판정 근거: `.claude/rules/verification-policy.md`의 "실사용 필수 스킬" 정의 중 **마이그레이션 가이드**에 해당한다.
> 내용 검증과 content test는 통과했으나, 실제 레거시 프로젝트에서 빌드·기동·배포 결과로 확인되기 전까지 APPROVED로 전환하지 않는다.

### APPROVED 전환 조건

1. 실제 SB 2.5/2.7 + Java 11 프로젝트에 Phase 1~3을 적용해 빌드·테스트 GREEN 확인
2. Phase 4~7 적용 후 기동 성공 + 인증/인가 회귀 테스트 통과
3. WAR 운영 프로젝트라면 Tomcat 10.1 배포 성공 확인
4. 위 결과를 섹션 5에 추가 기록 후 status 전환

---

## 7. 개선 필요 사항

- [❌] **README.md 스킬 목록·스킬 수·업데이트 로그 반영** — 이번 작업에서 명시적으로 범위 제외(병렬 작업 README 충돌 방지). 메인 세션에서 일괄 반영 필요
- [❌] `skill-tester` 에이전트를 통한 독립 재검증 — 본 에이전트는 Agent 도구 미보유. 메인 세션에서 `Agent(subagent_type="skill-tester", prompt="backend/spring-boot-2-to-3-migration")` 실행 권장
- [❌] 실사용 검증(섹션 6의 APPROVED 전환 조건 1~3)
- [❌] EhCache 2 → EhCache 3 전환 전용 스킬 부재 — 현재는 "별도 확인"으로만 연결됨. 모던 캐시 스킬 신설 검토
- [❌] Lucy XSS servlet filter의 jakarta 대체 구현 패턴이 `xss-lucy-jsoup` 스킬에 SB 3 기준으로 보강되면 이 스킬의 C등급 리스크 항목에서 링크 갱신 필요
- [❌] Boot 3.5 OSS EOL(2026-06-30) 이후 상황이므로, 3.x 도달 후 4.x 경로를 다루는 후속 스킬(`spring-boot-3-to-4-migration`) 신설 검토

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-08-11 | v1 | 최초 작성. 공식 소스 12건 조사 + 핵심 클레임 16개 교차 검증(VERIFIED 14 / DISPUTED 2 해소) + content test 5/5 PASS. status: PENDING_TEST(실사용 필수 카테고리) | skill-creator |
