---
name: lfcp-nxapi-target
description: lfcp-nxapi(실무 Java 레거시 커머스 API) 스택 실측 결과와 java-spring-legacy 템플릿 설치 준비 상태 (2026-08-31 전수 검사)
metadata: 
  node_type: memory
  type: project
  originSessionId: 326d382d-a205-4839-bf71-16d21252358a
  modified: 2026-08-31T07:53:45.985Z
---

`~/Desktop/workspace/04_lfcp-nxapi/lfcp-nxapi` — 실무 Java 레거시 백엔드. [[project-install-sh]] 템플릿 **5 (java-spring-legacy)** 설치 대상으로 2026-08-31 전수 검사 완료. `.claude/`·`CLAUDE.md` 미설치 상태였음.

**스택 실측 (build.gradle + 소스 4,515개 grep):**
- Java 11 / Spring Boot 2.5.12 / Gradle 7.6.4 / WAR (Tomcat 9.0.111) — legacy 템플릿 전제와 1:1
- MyBatis 3.5.4 (`@Mapper` 112파일, mapper XML 130개), HikariCP 3.4.5
- **Oracle 전용** — 전 환경(dev/stg/prod) JDBC가 oracle:thin뿐. MySQL 커넥터 5.1.38은 죽은 의존성 의심 → spring-multi-datasource-oracle-mysql 스킬은 이 프로젝트에선 무용(무해)
- Redisson **2.15.2** + spring-data-redis 2.6.0 + spring-session-data-redis — redis-redisson-legacy 스킬과 버전 자릿수까지 일치
- EhCache 2.10.2 (@Cacheable 52파일), MapStruct 113파일, **Joda-Time 269파일** vs java.time 44 (jackson-time-migration 스킬 가치 최대), Springfox 2.9.2, jjwt 0.10.7 + WebSecurityConfigurerAdapter, Jasypt(yml ENC 다수), Lucy XSS+jsoup, AWS SDK v1 S3+Rekognition, BouncyCastle
- 스킬 없는 소규모 기술(전용 스킬 불필요 판정): innorules BRMS(2), spring-integration-ip(1), jcodec(1), geoip2(1), spring-mobile(2), SCI 본인인증·paysgift·ezwel·benepia(벤더 독점)

**프로젝트 측 정리 후보 (레포 작업 아님, 참고):** SAP JCo(lib/sapjco3 + LQ2.jcoDestination — 소스 import 0·build.gradle lib 참조 없음, 잔재 의심), log4j 1.2.17 직접 의존(EOL), build.gradle에 SonarQube·Nexus 자격증명 평문, sleuth는 import 0이지만 auto-config라 미사용 단정 금지.

**Why:** 반복 참조 대상 — 이 프로젝트에 설치·스킬 추가 판단 시 실측 근거 재사용.

**How to apply:** 설치는 `./project-install.sh` → 5 (기본 옵션이면 스킬 27·에이전트 28). 스킬 추가 제안 전 [[verify-usage-before-library-skill]] 원칙대로 import 파일 수 실측 선행.
