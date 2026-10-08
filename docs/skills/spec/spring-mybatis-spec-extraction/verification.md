---
skill: spring-mybatis-spec-extraction
category: spec
version: v1
date: 2026-10-08
status: APPROVED
---

# spring-mybatis-spec-extraction 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `spring-mybatis-spec-extraction` |
| 스킬 경로 | `.claude/skills/spring-mybatis-spec-extraction/SKILL.md` (+ `references/extract-scripts.md`) |
| 검증일 | 2026-10-08 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Spring Boot Actuator API·레퍼런스, Boot 1.5 레퍼런스, Spring Framework MVC·스케줄링, springdoc.org v1·현행, MyBatis 3 sqlmap-xml·dynamic-sql·getting-started, mybatis-spring batch)
- [✅] 공식 GitHub 2순위 소스 확인 (springdoc-openapi-maven-plugin README, springdoc-openapi-gradle-plugin README, mybatis/ibatis2mybatis 위키, iBATIS sql-map-2.dtd)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-10-08 — Boot 2~4 Actuator, springdoc v1/v2/v3, Spring Batch 5, Gradle 플러그인 1.9.0)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (정적·실행 시 이중 추출과 대조, SQL ID 규칙, CRUD 판정 규칙, 동적 SQL 추정 표기, API→SQL 추적, CRUD 매트릭스, 배치·연동 목록)
- [✅] 코드 예시 작성 (읽기 전용 grep·jq 명령, Python 스크립트 3종 — 가상 예제로 실행 확인, 특정 회사 코드 없음)
- [✅] 흔한 실수 패턴 정리 (10절 17항목)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿·중복·경계 확인 | Read / Bash(읽기) | VERIFICATION_TEMPLATE.md, spec-extraction-method SKILL.md·verification.md, springdoc-openapi-3·swagger-springfox-2·mybatis-mapper-patterns·nexacro-xapi-server SKILL.md | 동명 스킬 없음. 공통 양식·CRUD 완전성 규칙은 spec-extraction-method 참조로만, springdoc 설정·Springfox·매퍼 문법·X-API 객체는 각 스킬 참조로 경계 설정 |
| 조사 | WebFetch | docs.spring.io/spring-boot/api/rest/actuator/mappings.html, docs.spring.io/spring-boot/reference/actuator/endpoints.html, docs.spring.io/spring-boot/docs/1.5.x/.../production-ready-endpoints.html, springdoc.org(현행·v1), github springdoc maven/gradle 플러그인 README, mybatis.org sqlmap-xml·dynamic-sql·getting-started·spring/batch, ibatis2mybatis 위키, ibatis sql-map-2.dtd, Spring Framework ann-requestmapping·scheduling | 1·2순위 소스 14개 수집 |
| 교차 검증 | WebSearch | springdoc v1 Boot 1.x 지원, Boot 2.5 info 노출 변경, Boot 1.5 /mappings 응답 형식, Spring 4.3 합성 어노테이션·4.2 path 별칭, 서블릿 URL 패턴 규칙, Spring 4.0 iBATIS 지원 제거, Spring Batch 5 JobBuilderFactory deprecated, iBATIS 동적 태그 | 23개 클레임, 독립 소스 2개 이상 대조(공식 문서 단일인 항목은 표에 명시) |
| 스크립트 실행 검증 | Bash | 가상 예제(컨트롤러 1·MyBatis 매퍼 1·iBATIS sqlMap 1)로 mapping_inventory.py·mapper_inventory.py·crud_matrix.py 실행, grep·jq 명령 표본 실행 | 클래스 prefix 합성·상수/X-API 플래그·include 해석·동적 조건부 테이블·MERGE C+U·upsert C+U·프로시저·`${}` 탐지 확인. 상수 경로 grep 오탐 1건 발견 후 패턴 수정 |
| 판정 | — | 23개 클레임 | VERIFIED 19 / DISPUTED 1 / UNVERIFIED 3 (UNVERIFIED는 제거 대신 `> 주의:` 표기) |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Spring Boot Actuator API — Mappings | https://docs.spring.io/spring-boot/api/rest/actuator/mappings.html | ⭐⭐⭐ High | 확인 2026-10-08 | 공식 문서(응답 필드) |
| Spring Boot Reference — Endpoints | https://docs.spring.io/spring-boot/reference/actuator/endpoints.html | ⭐⭐⭐ High | 확인 2026-10-08 | 공식 문서(노출 기본값·base-path) |
| Spring Boot 1.5 Reference — Endpoints | https://docs.spring.io/spring-boot/docs/1.5.x/reference/html/production-ready-endpoints.html | ⭐⭐⭐ High | 1.5.x | 공식 문서(`/mappings`, sensitive) |
| Spring Boot 2.5 Actuator 문서·2.5.0-M1 블로그 | https://docs.spring.io/spring-boot/docs/2.5.5/reference/html/actuator.html , https://spring.io/blog/2021/01/21/spring-boot-2-5-0-m1-available-now | ⭐⭐⭐ High | 2021 | info 기본 노출 제외(검색 요약 기준) |
| spring-boot 이슈 #9979 | https://github.com/spring-projects/spring-boot/issues/9979 | ⭐⭐ Medium | 2017 | Boot 1.5 `/mappings` 응답 형식(검색 요약만) |
| Spring Framework — Mapping Requests | https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html | ⭐⭐⭐ High | 확인 2026-10-08 | 클래스·메서드 매핑, 중복 매핑 규칙, `@HttpExchange`, `registerMapping` |
| Spring Framework 4.3 / 4.2 What's New | https://docs.spring.io/spring-framework/docs/4.3.x/spring-framework-reference/html/new-in-4.3.html , https://docs.spring.io/spring-framework/docs/4.2.x/spring-framework-reference/html/new-in-4.2.html | ⭐⭐⭐ High | 4.3 / 4.2 | 합성 어노테이션·`@AliasFor`(검색 요약) |
| Spring Framework — Task Execution and Scheduling | https://docs.spring.io/spring-framework/reference/integration/scheduling.html | ⭐⭐⭐ High | 확인 2026-10-08 | `@Scheduled`, task 네임스페이스, Quartz FactoryBean |
| Spring 3.2 ORM iBATIS 패키지 javadoc / CAMEL-7467 | https://docs.spring.io/spring-framework/docs/3.2.x/javadoc-api/org/springframework/orm/ibatis/package-summary.html , https://issues.apache.org/jira/browse/CAMEL-7467 | ⭐⭐⭐ High / ⭐⭐ Medium | 3.2 / 2014 | 3.2 deprecated, 4.x 제거(검색 요약) |
| Spring Batch 5.0 deprecated list / OpenRewrite 레시피 | https://docs.spring.io/spring-batch/docs/5.0.2/api/deprecated-list.html , https://docs.openrewrite.org/recipes/java/spring/batch/migratestepbuilderfactory | ⭐⭐⭐ High / ⭐⭐ Medium | 5.0 | JobBuilderFactory deprecated(검색 요약) |
| springdoc.org (현행) | https://springdoc.org/ | ⭐⭐⭐ High | 확인 2026-10-08 | `/v3/api-docs`, Boot 4 = v3, 플러그인 개요 |
| springdoc.org v1 | https://springdoc.org/v1/ | ⭐⭐⭐ High | 아카이브 | 호환표(모든 1.x 행에 Boot 1.5.x) |
| springdoc README (jsDelivr 미러) | https://cdn.jsdelivr.net/gh/springdoc/springdoc-openapi@main/README.md | ⭐⭐⭐ High | 확인 2026-10-08 | "v1.8.0 is the latest Open Source release supporting Spring Boot 2.x and 1.x"(검색 결과) |
| springdoc-openapi-maven-plugin | https://github.com/springdoc/springdoc-openapi-maven-plugin | ⭐⭐⭐ High | 확인 2026-10-08 | generate 골·integration-test 단계·기본값·`mvn verify`·JVM 인자 원문 |
| springdoc-openapi-gradle-plugin | https://github.com/springdoc/springdoc-openapi-gradle-plugin | ⭐⭐⭐ High | 확인 2026-10-08 | 플러그인 ID, 1.9.0, 태스크, 기본값, Gradle 7.0+ |
| MyBatis 3 — Mapper XML Files | https://mybatis.org/mybatis-3/sqlmap-xml.html | ⭐⭐⭐ High | 확인 2026-10-08 | 최상위 요소, statementType, `${}` 경고, sql/include |
| MyBatis 3 — Dynamic SQL | https://mybatis.org/mybatis-3/dynamic-sql.html | ⭐⭐⭐ High | 확인 2026-10-08 | 동적 요소 목록 |
| MyBatis 3 — Getting Started | https://mybatis.org/mybatis-3/getting-started.html | ⭐⭐⭐ High | 확인 2026-10-08 | namespace = 인터페이스 FQCN, 짧은 이름 모호성 오류 |
| MyBatis-Spring — Spring Batch | https://mybatis.org/spring/batch.html | ⭐⭐⭐ High | 확인 2026-10-08 | queryId / statementId |
| mybatis/ibatis2mybatis 위키 | https://github.com/mybatis/ibatis2mybatis/wiki | ⭐⭐⭐ High | 확인 2026-10-08 | sqlMap→mapper, `#prop#`, parameterClass, procedure 제거, 동적 태그 |
| iBATIS SQL Map 2.0 DTD | https://ibatis.apache.org/dtd/sql-map-2.dtd | ⭐⭐⭐ High | 2.0 | sqlMap 자식·statement/procedure·동적 태그 전체 목록 |
| 서블릿 URL 패턴 규칙(Jakarta Servlet API·벤더 문서) | https://jakarta.ee/specifications/servlet/5.0/apidocs/jakarta/servlet/http/httpservletmapping , https://infocenter.sybase.com/help/topic/com.sybase.infocenter.dc00466.0600/html/easwapp/CHDJFIBI.htm | ⭐⭐⭐ High / ⭐⭐ Medium | 확인 2026-10-08 | 정확→prefix→확장자→기본(검색 요약) |
| 기존 레포 스킬 `springdoc-openapi-3`·`swagger-springfox-2` | (레포 내부) | ⭐⭐ Medium | 2026-09-26 검증 | Boot↔springdoc 매트릭스·Boot 2.6 PathPatternParser 교차 확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 핵심 클레임 교차 검증 결과

| # | 클레임 | 소스 | 판정 |
|---|------|------|------|
| C1 | Boot 2+ `GET /actuator/mappings`, 응답 `contexts.*.mappings`의 dispatcherServlets·servletFilters·servlets·dispatcherHandlers, `details.requestMappingConditions`(methods·patterns·params·headers·consumes·produces), `handler`·`predicate` | Actuator API 문서, Endpoints 레퍼런스 | VERIFIED |
| C2 | Boot 1.5 `mappings` 경로 `/mappings`, 기본 sensitive=true, 설명 "Displays a collated list of all @RequestMapping paths" | Boot 1.5 레퍼런스, 검색 결과(2차) | VERIFIED |
| C3 | 현행 기본 HTTP 노출은 health만, `management.endpoints.web.exposure.include`, base-path `/actuator`; 2.5부터 info 제외 | Endpoints 레퍼런스, 2.5 문서·블로그(검색) | VERIFIED |
| C4 | Boot 1.5 `/mappings` 응답 = `"{[/path],methods=[GET]}"` 키 + bean·method 평면 맵 | spring-boot 이슈·블로그(검색 요약만) | UNVERIFIED → SKILL.md 3-1 주의 표기 |
| C5 | Boot 3 = springdoc v2(`springdoc-openapi-starter-webmvc-ui`/`-api`), Boot 4 = v3(아티팩트명 동일), 기본 경로 `/v3/api-docs`·`.yaml` | springdoc.org, 기존 springdoc-openapi-3 스킬 | VERIFIED |
| C6 | "Spring Boot 1.x는 springdoc 미지원" (작업 지시의 전제) | springdoc v1 호환표: 모든 1.x 행에 `1.5.x` 병기 / README: v1.8.0이 2.x·1.x 지원 마지막 OSS | **DISPUTED** → "공식 호환표는 1.5.x 포함, 단 OSS 종료·실기동 미검증, 1.3 이하는 표에 없음"으로 수정 + 주의 표기, 실무 권장은 정적+`/mappings`·기존 Springfox |
| C7 | springdoc v1.8.0 = Boot 2.x/1.x 지원 마지막 OSS 릴리스 | springdoc README(검색), springdoc.org 요약 | VERIFIED |
| C8 | Maven 플러그인: `generate` 골, integration-test 단계, spring-boot-maven-plugin start/stop 필요, JVM 인자 `-Dspring.application.admin.enabled=true`, 기본 apiDocsUrl `http://localhost:8080/v3/api-docs`·outputFileName `openapi.json`·outputDir `${project.build.directory}`, `mvn verify` | 플러그인 README(원문 재확인), springdoc.org | VERIFIED (1차 요약에서 JVM 인자가 잘못 요약돼 raw README로 재확인) |
| C9 | Gradle 플러그인 `org.springdoc.openapi-gradle-plugin` 1.9.0, `forkedSpringBootRun`·`generateOpenApiDocs`, 기본값(outputDir `$buildDir`, waitTimeInSeconds 30), Gradle 7.0+ | 플러그인 README, springdoc.org | VERIFIED |
| C10 | `@GetMapping` 등 합성 어노테이션 = Spring 4.3, `path`는 4.2부터 `value` 별칭 | 4.3·4.2 What's New(검색), Baeldung·Sonar 규칙(검색) | VERIFIED |
| C11 | 클래스 레벨 + 메서드 레벨 매핑 합성 예, 같은 요소에 `@RequestMapping` 계열 둘 이상이면 첫 번째만 사용·경고 | Spring Framework 공식 문서(단일 1차 소스) | VERIFIED (공식 1차 소스) |
| C12 | 서블릿 URL 패턴 선택 순서: 정확 → 최장 prefix → 확장자 → 기본 서블릿 | Jakarta Servlet API 문서·벤더 문서(검색 복수) | VERIFIED |
| C13 | MyBatis 최상위 요소 목록(parameterMap deprecated), namespace+id = 전체 이름, statementType STATEMENT/PREPARED/CALLABLE, `${}` 인젝션 경고, `<sql>`/`<include>` | sqlmap-xml, getting-started, 기존 mybatis-mapper-patterns | VERIFIED |
| C14 | namespace = 매퍼 인터페이스 FQCN·메서드 바인딩, 짧은 이름 중복 시 모호성 오류 | getting-started(원문 인용), 기존 mybatis-mapper-patterns | VERIFIED |
| C15 | 동적 SQL 요소 if·choose/when/otherwise·trim/where/set·foreach·bind·script | dynamic-sql, 기존 mybatis-mapper-patterns | VERIFIED |
| C16 | iBATIS 2: `<sqlMap namespace>`(선택), statement/insert/update/delete/select/procedure, `#prop#`/`$prop$`, parameterClass/resultClass, 동적 태그(dynamic·iterate·is*) | ibatis2mybatis 위키, sql-map-2.dtd | VERIFIED |
| C17 | `useStatementNamespaces` true=`ns.id`, false=`id`만 | 위키는 "MyBatis 3에서 불필요"만 언급, 개발자 가이드 원문 미열람 | UNVERIFIED → SKILL.md 4-7 주의 표기(실제 호출 문자열로 확인하도록) |
| C18 | Spring `SqlMapClientTemplate` 등 iBATIS 지원: 3.2 deprecated, 4.0 제거 | Spring 3.2 javadoc(검색), CAMEL-7467 | VERIFIED |
| C19 | `@Scheduled`(cron·fixedDelay·fixedRate·initialDelay·zone), `@EnableScheduling`, `<task:scheduled>`, Quartz `JobDetailFactoryBean`·`MethodInvokingJobDetailFactoryBean`·`CronTriggerFactoryBean`·`SimpleTriggerFactoryBean`·`SchedulerFactoryBean` | Spring Framework 스케줄링 공식 문서(단일 1차 소스) | VERIFIED (공식 1차 소스) |
| C20 | Spring Batch 5.0: JobBuilderFactory·StepBuilderFactory deprecated → `JobBuilder(name, JobRepository)` | Batch 5.0.2 deprecated list(검색), OpenRewrite 레시피 | VERIFIED |
| C21 | mybatis-spring 배치: MyBatisPagingItemReader·MyBatisCursorItemReader(`queryId`), MyBatisBatchItemWriter(`statementId`) | mybatis.org/spring/batch.html(단일 1차 소스) | VERIFIED (공식 1차 소스) |
| C22 | springdoc·Springfox는 `HttpServletRequest`를 직접 파싱하는 X-API 핸들러의 Dataset 본문 스키마를 문서화하지 못함 | 추론(실행 검증 없음) | UNVERIFIED → SKILL.md 2-5 "주의(추정)" 표기 |
| C23 | Boot 2.6+ 기본 경로 매처가 PathPatternParser로 바뀌어 표기 차이가 날 수 있음 | 기존 swagger-springfox-2 스킬(springfox #3462 등), Spring MVC 문서 PathPattern 기본 | VERIFIED |

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (작업 지시 전제 C6은 공식 호환표 기준으로 수정)
- [✅] 버전 정보가 명시되어 있음 (Boot 1.5/2.x/2.5/2.6/3.x/4.x, Spring 4.2/4.3/3.2/4.0, springdoc v1 1.8.0·v2·v3, Gradle 플러그인 1.9.0, Spring Batch 5.0)
- [✅] deprecated된 패턴을 권장하지 않음 (JobBuilderFactory·SqlMapClientTemplate은 "레거시에서 찾는 대상"으로만 등장, Actuator 운영 노출 금지 명시)
- [✅] 코드 예시가 실행 가능한 형태임 (스크립트 3종·grep·jq 표본을 가상 예제로 실행 확인. Maven/Gradle 플러그인 설정은 README 기준이며 실행하지 않음)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (9절)
- [✅] 흔한 실수 패턴 포함 (10절)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 추출 작업에 도움이 되는 수준 (명령·스크립트·판정 규칙·명세 칸 매핑)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (가상 예제만, 특정 회사 코드 없음, 공통 양식은 spec-extraction-method 참조)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-10-08, 3문항)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (해당 없음 — FAIL 0, 선택 보강 gap만 기록)

---

## 5. 테스트 진행 기록

**수행일**: 2026-10-08
**수행자**: skill-tester → general-purpose (도메인 에이전트 대신 general-purpose 사용, 질문당 1개 에이전트)
**수행 방법**: SKILL.md(+references) Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Spring 4.2 컨트롤러(클래스 prefix 2개, method 배열, method 없음, 상수 경로, 인터페이스 매핑)의 API 목록 합성**
- ✅ PASS
- 근거: SKILL.md 2-1·2-2 합성 규칙 표, 10절, extract-scripts.md 알려진 한계 표
- 상세: 메서드 레벨 grep 불가 이유(클래스 prefix 누락)를 제시하고, 8행(A 4 = 2메서드×2prefix, B 2 `ANY`, C 2 `<상수:…>`+`CONST`)을 올바르게 도출. method 없음을 GET으로 가정하지 않음(anti-pattern 회피), 인터페이스 매핑은 `IFACE` 후 구현 클래스로 정정. 후속 조치(상수 치환, 로그로 메서드 확정, 표본 대조)도 근거와 일치.

**Q2. 동적 태그 안 JOIN / `${}` FROM / `<update>` 태그의 MERGE / CALLABLE 프로시저의 SQL ID·CRUD·확신도 기록**
- ✅ PASS
- 근거: SKILL.md 4-1·4-2·4-3·4-5, 6절 5항, 9·10절
- 상세: 전체 이름(namespace.id) 사용, 동적 태그 안 테이블은 R + 추정 + test 식 원문(`R?` 구분), `${}`는 대상 미확인+보안 메모, MERGE는 태그가 아닌 본문 기준 C+U, 프로시저는 `P: 이름`(R 기록 금지). 스크립트 결과를 검증 없이 확정하지 않고 표본 10행·수량 교차 확인을 수행해야 한다고 답함.

**Q3. Boot 1.5 레거시(Springfox 없음)의 실행 시 API 추출·정적 대조·springdoc 도입·X-API 칸·운영 환경 여부**
- ✅ PASS
- 근거: SKILL.md 3-1·3-2(DISPUTED 주의)·3-4·2-5·10절
- 상세: `GET /mappings`(sensitive 인증, context-path), 2.x jq를 1.5에 쓰지 않고 키 문자열 파싱, `comm`으로 양방향 대조(`/actuator/**`·`/error` 제외), springdoc은 호환표상 가능하나 OSS 종료·미검증이라 정적+`/mappings` 기본, 도입 시 별도 브랜치·승인. X-API는 OpenAPI 결과 미사용·정적 표기, 서버·화면 양쪽 확인 시에만 "확인됨". 운영 Actuator 개방 금지. anti-pattern 모두 회피.

### 발견된 gap (있으면)

모두 선택 보강이며 차단 요인 아님.
- 상수 경로 + 클래스 prefix 2개 결합 행의 출력 예시 없음(스크립트 코드로 추론해야 함)
- 인터페이스↔구현체 연결 grep이 없음(5-2 `@Primary` 규칙만 존재)
- `ANY` 행과 특정 메서드 행이 같은 URL일 때 충돌 처리 규칙 없음
- `${}` 쿼리의 CRUD 동사 칸(R 유지 + 테이블 미확인) 명시 없음, 프로시저 `P:` 행의 확신도 값 지정 없음
- Boot 1.5 `/mappings` 파싱 예시 없음(원문 미확인 상태와 일치), sensitive 인증 curl 방법 없음

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 — 답변 정확성(판정 규칙·합성 규칙·확신도 표기)으로 검증 가능한 방법론 스킬. 스크립트 3종은 작성 시 가상 예제 실행으로 동작 확인 완료. 실 레거시 레포 오탐·누락률 측정은 선택 후속 과제로 분리
- 최종 상태: APPROVED

### (참고) 기존 예정 템플릿

### 테스트 케이스 1: (위 실제 수행 테스트로 대체됨)

**입력 (질문/요청):**
```
(skill-tester가 생성)
```

**판정:** 미실시

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (DISPUTED 1·UNVERIFIED 3은 수정·주의 표기로 반영) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-10-08, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 2단계 content test 수행 후 섹션 4-4·5·6 갱신 (2026-10-08 완료, 3/3 PASS)
- [❌] Boot 1.5 `/mappings` 응답 원문 예시 확인(C4) — 1.5 Actuator API 문서 또는 실제 1.5 앱 응답
- [❌] iBATIS 2 개발자 가이드에서 `useStatementNamespaces` 의미 원문 확인(C17)
- [❌] X-API 핸들러에 springdoc 적용 시 생성 결과 실측(C22)
- [❌] Boot 1.5 + springdoc v1 실기동 확인(C6 보강) — 위 C4·C17·C22·C6 4건은 모두 SKILL.md에 `> 주의`로 미검증 표기됨, 선택 보강(차단 요인 아님)
- [❌] 실제 레거시 레포(Spring + MyBatis/iBATIS)에서 스크립트 3종의 오탐·누락률 측정 후 한계 표 보강 — 선택 보강(차단 요인 아님). 2026-10-08 판단: 규칙·판정 표는 답변 정확성으로 검증되고 스크립트는 가상 예제 실행 확인을 마쳐 APPROVED 전환, 실측은 도입 후 한계 표 보강용
- [❌] test 중 발견된 선택 gap(상수+prefix 출력 예시, 인터페이스→구현체 grep, `${}` CRUD 칸·프로시저 확신도 명시, Boot 1.5 /mappings 파싱 예시) — 선택 보강(차단 요인 아님)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-10-08 | v1 | 최초 작성 (SKILL.md + references/extract-scripts.md, 클레임 23개 검증: VERIFIED 19 / DISPUTED 1 / UNVERIFIED 3, 스크립트 3종 가상 예제 실행 확인) | skill-creator |
| 2026-10-08 | v1 | 2단계 실사용 테스트 수행 (Q1 클래스 prefix 합성·ANY·상수 경로 / Q2 동적 SQL·`${}`·MERGE·프로시저 CRUD 표기 / Q3 Boot 1.5 실행 시 추출·springdoc 판단·X-API 칸) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-10-08 | v1.1 | 설치 검수 반영 — spec-extraction 템플릿 단독 설치본에 없는 스킬(`springdoc-openapi-3`·`swagger-springfox-2`·`mybatis-mapper-patterns`·`nexacro-xapi-server`) 참조에 "(설치된 경우)" 조건 표기(담당 표 머리글·X-API 절·springdoc 절·DISPUTED 주의). 내용 클레임 변경 없음 | Claude |
