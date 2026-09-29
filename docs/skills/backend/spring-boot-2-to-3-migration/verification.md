---
skill: spring-boot-2-to-3-migration
category: backend
version: v2
date: 2026-09-28
status: PENDING_TEST
---

# spring-boot-2-to-3-migration 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `spring-boot-2-to-3-migration` |
| 스킬 경로 | `.claude/skills/backend/spring-boot-2-to-3-migration/SKILL.md` |
| 검증일 | 2026-09-28 (재검증, 이전 2026-08-11) |
| 검증자 | skill-creator (최초), 재검증 2차 작업(2026-09-28) |
| 스킬 버전 | v2 |
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

### [2026-09-29] 실사용(실행) 검증

**수행일**: 2026-09-29
**수행 방법**: 격리된 실험 lab 폴더(`sb-migrate/`)에 OpenJDK 17(레포 환경에 11 미설치) + Gradle Wrapper(services.gradle.org 배포본 7.6.4, 부트스트랩용 Gradle 배포본은 로컬 lab 안에서만 사용, 전역 설치 없음)로 작은 Spring Boot 프로젝트를 만들어 SKILL.md의 Phase 순서를 그대로 밟았다.
샘플 규모: 컨트롤러 2개(공개 ping + JPA CRUD 1건), `javax.servlet.Filter` 구현 1개(+`javax.annotation.PostConstruct`/`PreDestroy`), `WebSecurityConfigurerAdapter` 기반 Security 설정 1개, JPA 엔티티/리포지토리 1쌍(H2 인메모리), MockMvc 기반 테스트 7개(정상 2 · 인가 회귀 2 · 검증 실패 1 · public 1 · 트레일링 슬래시 404 회귀 1). 각 Phase 전환마다 로컬 git(레포 밖, lab 전용)으로 커밋해 자동/수동 변경을 diff로 분리 보존.

**실행 결과 (Phase별)**:
- **Phase 0** (SB 2.5.15, sourceCompatibility 11, JVM은 17 — JDK 11 미설치로 처음부터 17에서 실행): `./gradlew build` GREEN, 6/6 테스트 통과.
- **Phase 1** (2.5.15→2.7.18 + `properties-boot-migrator` 임시 추가): 기동 로그에 프로퍼티 경고 0건 확인(샘플이 단순해 실제 rename 케이스는 없었음) → SKILL.md 서술과 일치.
- **Phase 2** (Java 11→17 + `-parameters`): 빌드·6/6 테스트 GREEN. **한계**: JDK 11이 환경에 없어 "11에서 17로 바뀌는 실제 전환 효과"(리플렉션 예외 등)는 검증 못 함 — sourceCompatibility 값만 바꿨고 JVM은 애초부터 17이었다.
- **Phase 3** (Security 5.8 선행 — `WebSecurityConfigurerAdapter`→`SecurityFilterChain` Bean, `antMatchers`→`requestMatchers`, `.and()`→람다): **서술과 실행 결과 불일치 발견** — Boot 2.7.18이 관리하는 Spring Security는 5.7.11이며 `requestMatchers(String...)` 오버로드가 없어(5.8.0부터 추가) 컴파일 실패. `ext['spring-security.version']='5.8.16'` 수동 오버라이드 후 컴파일·6/6 테스트 GREEN. SKILL.md 4.3절에 이 오버라이드 필요성을 명시하는 주의문을 추가(최소 정정, 아래 8장 참조).
- **Phase 4** (SB 3.x + javax→jakarta): OpenRewrite Gradle 플러그인으로 `UpgradeSpringBoot_3_0`(rewrite-spring 5.24.0) 실행 → 2.7.18→3.0.13 자동 상향 + `javax.servlet`/`javax.annotation`/`javax.persistence`/`javax.validation` 전부 `jakarta.*`로 자동 치환 + `@Bean` 메서드 public 제거 + 단일 생성자 `@Autowired` 제거까지 SKILL.md 10장 "자동화 경계표"가 예고한 항목이 정확히 그대로 나타남. 동일 rewrite-spring 버전에는 `UpgradeSpringBoot_3_5` 레시피가 없어(`UpgradeSpringBoot_3_2`까지만 존재) 그 레시피로 3.2.12까지 추가 자동 상향 후, 3.5.16(스킬 권장 목표 라인)까지는 **수동으로** 버전 문자열만 교체 — "OpenRewrite 결과물은 리뷰 대상 PR이지 최종 산출물이 아니다"(10장)와 정확히 일치하는 경험. 최종 빌드 GREEN, `grep -rn "import javax\." src/` = 0건, 7/7 테스트 GREEN. Security 6.5.11 / Hibernate 6.6.53으로 정상 기동.
- **부가 확인**: SKILL.md 7장 "로그 날짜 포맷이 ISO-8601로 변경" — Boot 2.x 로그(`2026-09-28 09:36:47.765`, 공백 구분)와 Boot 3.5.16 로그(`2026-09-29T09:03:47.208+09:00`, `T`+타임존)를 실제 로그로 대조해 확인(VERIFIED). "트레일링 슬래시 매칭 기본값 false"도 3.5.16에서 `/api/public/ping/` 요청이 실제로 404가 됨을 MockMvc 테스트로 확인(VERIFIED).
- **Phase 5~8 (라이브러리 교체·설정 프로퍼티·WAR/Tomcat·카나리)**: 샘플에 Springfox/Sleuth/EhCache2/Redisson/WAR 배포가 없어 **검증 범위 밖** — 진행하지 않음(과장 없이 명시). Phase 9(properties-migrator 제거)는 Phase 4 마무리 시점에 함께 제거해 확인.

**졸업 조건 충족 여부**: **부분**. 충족: Phase 0~4(+9) 전 구간을 실제 빌드·테스트로 실행해 GREEN 확인, OpenRewrite 자동화 경계 서술과 실제 동작 일치 확인, 서술 오류 1건(Security 5.8 오버라이드 누락) 발견·정정.
남은 것: (1) Java 11 환경 부재로 "11→17 전환의 실제 효과" 미검증, (2) Phase 5 라이브러리 교체 매트릭스(Springfox/Sleuth/EhCache2/Redisson) 미검증, (3) Phase 7 WAR/Tomcat 10.1 배포 미검증, (4) Phase 8 카나리·부하 테스트·롤백 리허설은 로컬 lab 환경 특성상 검증 불가, (5) MyBatis 경로(JPA만 선택) 미검증.

**판정**: **PENDING_TEST 유지** — "실제 SB 2.5 프로젝트"라는 졸업 조건을 소규모 샘플로 부분 충족했을 뿐, 전체 라이브러리 매트릭스·WAR 배포·실환경 카나리까지는 확인하지 못했다. 다만 이번 실행으로 Phase 0~4의 핵심 경로(버전 상향·Java 전환·Security DSL 전환·jakarta 전환·OpenRewrite 경계)는 실제 근거로 뒷받침됨.

---

### [2026-09-28] skill-tester 독립 재테스트 — §1.1 4.0 이행 체크포인트 + 깨진 참조 정정분 검증

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (도메인 특화 에이전트 부재로 대체)
**수행 방법**: SKILL.md만 근거로 답하도록 지시한 general-purpose 에이전트 2건을 병렬 실행. 2026-09-28 2차 재검증에서 신설된 §1.1(4.0 이행 체크포인트)과 정정된 "spring-boot-gradle-setup 9장" 참조를 겨냥한 질문으로 설계.

**Q8. "Boot 3.5.x 안정화 후 4.x로 갈지 검토 중인데 Undertow와 Jersey를 일부 쓰고 있다. 4.x 전환 가능한가?"**
- ✅ PASS
- 근거: SKILL.md §1.1 "4.0 이행 체크포인트" 표 (서블릿 컨테이너·JSON 라이브러리 행)
- 상세: 표의 "3.5.x에 머문다" 칸(Undertow 사용 / Jersey 사용)에 정확히 해당함을 지적하고 "지금 상태로는 4.x 전환 권장 안 됨, 두 조건 해소 후 재판단" 결론 도출. 사전 조건·배치 조건도 추가로 확인하라고 정확히 안내. anti-pattern(조건 무시하고 바로 전환 권장) 회피.

**Q9. "4.0 이행 체크포인트 표로 전환 가능 판단했다. Jackson 3 포함 3.x→4.x 세부 절차는 `spring-boot-gradle-setup` 9장에 있다고 들었는데 맞나?"**
- ✅ PASS
- 근거: SKILL.md 30~32행 상단 주의 블록, §1.1 하단 각주(105행), 9장 각주(384행)
- 상세: "9장에 있다"는 전제 자체를 SKILL.md 근거로 반박 — "3.x→4.x 세부 절차는 이 스킬 범위 밖이며, 2026-09-28 확인 시점 기준 spring-boot-gradle-setup에는 해당 절이 아직 없음"이라는 정정된 문구를 정확히 인용. 384행의 "9장" 언급은 이 SKILL.md 자신의 9장(WAR/Tomcat)이지 다른 스킬의 9장이 아님까지 정확히 구분. **정정 전 상태였다면 존재하지 않는 참조를 그대로 안내했을 자리에서, 정정이 답변에 정확히 반영됨을 확인.**

**agent content test: 2/2 PASS** (기존 2026-08-11 5/5 PASS 누적 — 합산 7/7 PASS)

---

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

### [2026-09-28] 재검증(2차) — Boot 4.0 이행 체크포인트 보강 + 깨진 참조 정정

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임을 공식 소스(GitHub wiki Spring Boot 4.0 Migration Guide, endoflife.date/spring-boot)와 대조, 레포 내부 상호 참조 정합성 확인

**클레임 대조 결과**:
1. "Spring Boot 3.5 라인 OSS 지원 2026-06-30 종료, 현행 GA 라인은 4.x" → VERIFIED (endoflife.date/spring-boot 재확인 — 2026-09-28 기준 최신 GA는 4.1)
2. "3.x → 4.x 세부 절차는 `spring-boot-gradle-setup` 9장을 참조" → **DISPUTED(정정)**. 해당 스킬의 SKILL.md를 직접 확인한 결과 섹션은 1~5장까지만 존재하고 9장은 없음 — 깨진 참조였다. SKILL.md 본문에서 특정 절 번호 인용을 제거하고 "레포에 아직 없음, 별도 스킬 신설 필요"로 정정
3. "Spring Boot 4.0은 Java 17 이상 요구, Jakarta EE 11/Servlet 6.1, Jackson 3가 기본 JSON 라이브러리로 전환(그룹ID `tools.jackson`), Undertow 제거, Jersey는 Jackson 3 미지원" → VERIFIED (GitHub 공식 wiki `Spring-Boot-4.0-Migration-Guide` 직접 인용 확인: "Spring Boot 4.0 requires Java 17 or later", "Jakarta EE 11, Servlet 6.1", "Spring Boot now uses Jackson 3 as its preferred JSON library", Undertow/Jersey 관련 3.5 유지 조건 명시)
4. "Boot 4.0 전환 전 최신 3.5.x로 먼저 업그레이드 권장, 과도기용 `spring-boot-jackson2` 호환 모듈 제공(사용 중단 예정)" → VERIFIED (동일 공식 wiki 직접 확인)

**보강(ADD)**: §1.1 "4.0 이행 체크포인트" 신설 — "3.5에 머물지 4.x로 갈지"를 공식 Migration Guide 조건(사전 조건/Java/서블릿 컨테이너/JSON 라이브러리/배치)으로 판단하는 표 + Jackson 2→3 그룹ID·클래스명·애노테이션 변경 요약. **정정**: 존재하지 않는 `spring-boot-gradle-setup` "9장" 참조 2곳을 실제 상태(해당 절 없음, 레포에 아직 미신설)로 수정. 축소 없음(레거시 버전 고정·주의사항·실전 예제 전부 유지).

**실전 질문 재검증**:
- Q6. "Boot 3.5까지 올렸는데 4.x로 넘어가도 되는지 어떻게 판단하나?" → SKILL.md "1.1 4.0 이행 체크포인트" 표 근거로 PASS (Undertow/Jersey/Java 버전/Jackson 3 준비 여부로 판단)
- Q7. "Jackson 2→3 전환이 왜 별도 작업으로 분리되어 있나?" → SKILL.md 1.1절 주의문 근거로 PASS (그룹ID·클래스명·애노테이션 변경 + `spring-boot-jackson2` 과도기 모듈)

**재검증 최종 판정**: status **PENDING_TEST 유지** (실사용 필수 카테고리 — 마이그레이션 가이드. 보강·정정 있었으나 실사용 검증 전까지 APPROVED 불가라는 기존 판정 근거는 변경 없음)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (VERIFIED 14 / DISPUTED 2 반영 완료 / UNVERIFIED 0). 2026-09-28 재검증에서 깨진 내부 참조 1건 추가 정정 |
| 구조 완전성 | ✅ |
| 실용성 | ✅ (4.0 이행 체크포인트 보강) |
| 요구 항목 커버리지 | ✅ (요청 11개 항목 전부 반영) |
| 에이전트 활용 테스트(content test) | ✅ 7/7 PASS 누적 (2026-08-11 5/5 + 2026-09-28 skill-tester 독립 재테스트 2/2 — §1.1 보강분·깨진 참조 정정분 모두 반영 확인) |
| 실사용(빌드·배포) 검증 | 🟡 **부분 실시** (2026-09-29, 소규모 lab 샘플로 Phase 0~4+9 실제 빌드·테스트 GREEN 확인 — 섹션 5 "[2026-09-29] 실사용(실행) 검증" 참조). Phase 5·7·8은 샘플 범위 밖 |
| **최종 판정** | **PENDING_TEST** (유지) |

> 판정 근거: `.claude/rules/verification-policy.md`의 "실사용 필수 스킬" 정의 중 **마이그레이션 가이드**에 해당한다.
> 2026-09-29 실행 검증으로 Phase 0~4(+9)의 핵심 경로(버전 상향·Java 전환·Security DSL·jakarta 전환·OpenRewrite 경계)는 실제 근거로 뒷받침됐고, 서술 오류 1건(Security 5.8 오버라이드 누락, SKILL.md 4.3절 수정 완료)을 발견·정정했다.
> 다만 "실제 SB 2.5/2.7 + Java 11 프로젝트"·Phase 5(라이브러리 매트릭스)·Phase 7(WAR/Tomcat 10.1)·Phase 8(카나리·부하·롤백 리허설)까지는 확인하지 못해 APPROVED 전환 조건 전부를 충족하지 못했다 — PENDING_TEST 유지.

### APPROVED 전환 조건

1. 실제 SB 2.5/2.7 + Java 11 프로젝트에 Phase 1~3을 적용해 빌드·테스트 GREEN 확인 — 🟡 부분(Java 11 환경 없이 소규모 샘플로만 확인, 2026-09-29)
2. Phase 4~7 적용 후 기동 성공 + 인증/인가 회귀 테스트 통과 — 🟡 부분(Phase 4만 확인, Phase 5·6·7 미실시, 2026-09-29)
3. WAR 운영 프로젝트라면 Tomcat 10.1 배포 성공 확인 — ❌ 미실시
4. 위 결과를 섹션 5에 추가 기록 후 status 전환 — 위 1~3이 전부 충족되기 전까지는 status 전환하지 않음

---

## 7. 개선 필요 사항

- [❌] **README.md 스킬 목록·스킬 수·업데이트 로그 반영** — 이번 작업에서 명시적으로 범위 제외(병렬 작업 README 충돌 방지). 메인 세션에서 일괄 반영 필요
- [✅] `skill-tester` 에이전트를 통한 독립 재검증 — 2026-09-28 완료. general-purpose 2건(§1.1 체크포인트 판단 / 깨진 참조 정정 반영 확인) 2/2 PASS (섹션 5 "[2026-09-28] skill-tester 독립 재테스트" 참조)
- [🟡] 실사용 검증(섹션 6의 APPROVED 전환 조건 1~3) — **부분 진행**(2026-09-29, 소규모 lab 샘플로 Phase 0~4+9 GREEN 확인). 남은 차단 요인: Java 11 실환경, Phase 5 라이브러리 매트릭스(Springfox/Sleuth/EhCache2/Redisson), Phase 7 WAR/Tomcat 10.1, Phase 8 카나리·롤백 리허설, MyBatis 경로 — 이들 확인 전까지 APPROVED 불가
- [❌] EhCache 2 → EhCache 3 전환 전용 스킬 부재 — 현재는 "별도 확인"으로만 연결됨. 모던 캐시 스킬 신설 검토
- [❌] Lucy XSS servlet filter의 jakarta 대체 구현 패턴이 `xss-lucy-jsoup` 스킬에 SB 3 기준으로 보강되면 이 스킬의 C등급 리스크 항목에서 링크 갱신 필요
- [❌] Boot 3.5 OSS EOL(2026-06-30) 이후 상황이므로, 3.x 도달 후 4.x 경로를 다루는 후속 스킬(`spring-boot-3-to-4-migration`) 신설 검토

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-08-11 | v1 | 최초 작성. 공식 소스 12건 조사 + 핵심 클레임 16개 교차 검증(VERIFIED 14 / DISPUTED 2 해소) + content test 5/5 PASS. status: PENDING_TEST(실사용 필수 카테고리) | skill-creator |
| 2026-09-25 | v1 | 교차 참조 조건부 표기 (내용 변경 없음) | Claude (Sonnet 5) |
| 2026-09-28 | v2 | **재검증(2차) — Boot 4.0 Migration Guide 공식 소스로 §1.1 "4.0 이행 체크포인트" 신설, 깨진 내부 참조 정정.** `spring-boot-gradle-setup` "9장" 참조 2곳이 실제로 존재하지 않는 절이었음을 확인해 정정. status **PENDING_TEST 유지**(실사용 필수 카테고리) | 재검증(2차) 작업 |
| 2026-09-28 | v2 | 2단계 실사용(content) 재테스트 수행 (Q8 §1.1 4.0 이행 체크포인트 판단 / Q9 깨진 참조 정정 반영 확인) → 2/2 PASS, 누적 7/7 PASS. PENDING_TEST 유지(마이그레이션 가이드 — 실사용 검증 전까지 APPROVED 불가) | skill-tester |
| 2026-09-28 | v2 | **재교차확인 — 앞선 "9장 없음" 판정은 오판이었음.** `spring-boot-gradle-setup`을 SKILL.md만 보고 판단해 §9(references/REFERENCE.md, 2026-06-19 신설)를 놓쳤다. 해당 절은 실재하며 §9.1~9.7(Gradle 최소버전·플러그인 좌표·Jackson 3 group id·Starter 이름 변경)까지 다룬다. SKILL.md 30~32행·105행 인용 문구를 "그 스킬 §9(빌드 설정 관점)는 존재/참조, Jackson·Security·Framework 7 API 레벨 세부만 별도 스킬 필요"로 재정정 | Claude (Sonnet 5) |
| 2026-09-29 | v2 | **실사용(실행) 검증 — 부분.** 격리 lab(OpenJDK 17 + Gradle Wrapper 7.6.4/services.gradle.org)에 SB 2.5.15 소규모 샘플(Web+javax 필터/컨트롤러+`WebSecurityConfigurerAdapter`+JPA+테스트 7개)을 만들어 Phase 0→1→2→3→4(+9)를 실제 실행. 전 구간 GREEN. 서술 오류 1건 발견·정정: SKILL.md 4.3절에 "Boot 2.7.18의 관리 Security는 5.7.11까지라 `requestMatchers(String...)`가 없고 `ext['spring-security.version']='5.8.x'` 수동 오버라이드가 필요하다"는 주의문 추가. OpenRewrite `UpgradeSpringBoot_3_0`→`UpgradeSpringBoot_3_2`(rewrite-spring 5.24.0 기준 최대치)까지 자동 전환 확인, 3.5.16까지는 수동 상향(10장 서술과 일치). "ISO-8601 로그 포맷"·"트레일링 슬래시 404" 클레임도 실행 로그·테스트로 추가 확인(VERIFIED). Phase 5·7·8과 Java 11 실환경·MyBatis 경로는 샘플 범위 밖이라 미검증 — status **PENDING_TEST 유지** | Claude (Sonnet 5) |
