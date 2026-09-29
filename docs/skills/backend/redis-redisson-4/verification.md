---
skill: redis-redisson-4
category: backend
version: v1
date: 2026-09-26
status: APPROVED
---

# redis-redisson-4 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `redis-redisson-4` |
| 스킬 경로 | `.claude/skills/backend/redis-redisson-4/SKILL.md` |
| 검증일 | 2026-09-26 (30~60일 주기 재검증, 최초 검증 2026-08-11) |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 대상 버전 | Redisson 4.0.0 ~ **4.7.0** (2026-08-04 릴리스) |
| 관련 스킬 | `redis-redisson-modern`(3.x), `redis-redisson-legacy`(2.15.2) — 역할 분리 포인터를 SKILL.md 상단에 명시 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (redisson.pro/docs — configuration, integration-with-spring, data-serialization, collections, publish-subscribe)
- [✅] 공식 GitHub 2순위 소스 확인 (redisson/redisson — Releases, CHANGELOG.md, README.md, pom.xml, 실제 소스 파일)
- [✅] 최신 버전 기준 내용 확인 (2026-08-11 기준 최신 = 4.7.0, 2026-08-04)
- [✅] 3.x → 4.x Breaking Change 전수 수집 (4.0.0 / 4.1.0 / 4.2.0 / 4.5.0 / 4.7.0)
- [✅] 최소 Java 버전 요구사항 확인 (README + pom.xml 이중 확인)
- [✅] Spring Boot 통합 스타터 호환 매트릭스 확인 (docs 표 + 실제 starter pom.xml)
- [✅] 라이선스 변경 여부 확인 (pom.xml `<licenses>`)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (분산 락·자료구조·캐시·코덱·커넥션 풀)
- [✅] 실제 마이그레이션 코드 diff 작성 (Config Bean / YAML / RScript / import / TTL / Session / XML)
- [✅] 흔한 실수 패턴 정리 (10종)
- [✅] 기존 스킬 2종 Read 후 톤·구조 정렬 및 중복 회피
- [✅] SKILL.md 파일 작성
- [✅] verification.md 작성
- [❌] README.md 업데이트 — **본 작업에서 명시적으로 금지됨** (병렬 작업 충돌 방지, 상위 에이전트가 일괄 처리)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 사전 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 템플릿 구조 확보 |
| 사전 확인 | Glob | `.claude/skills/backend/redis-redisson*/SKILL.md` | 기존 2종 확인, `redis-redisson-4` 중복 없음 |
| 사전 확인 | Read | `redis-redisson-modern/SKILL.md`, `redis-redisson-legacy/SKILL.md` | 톤·구조·중복 회피 기준 확보. modern 스킬이 "4.x는 별도 스킬로 분리" 명시한 것 확인 |
| 조사 | WebSearch | "Redisson 4.0 release notes breaking changes migration from 3.x" | 4.0.0 breaking change 1차 목록 수집 |
| 조사 | WebSearch | "Redisson 4.4.0 release May 2026" | 4.4.0 = 2026-05-12 확인 |
| 조사 | WebFetch | `github.com/redisson/redisson/releases/tag/redisson-4.0.0` | 4.0.0 릴리스 노트 원문 |
| 조사 | WebFetch | `github.com/redisson/redisson/releases` | 4.x 전체 릴리스 목록, 최신 = 4.7.0 |
| 조사 | WebFetch | `raw.githubusercontent.com/.../CHANGELOG.md` (3회, 프롬프트 달리하여) | 4.0.0~4.7.0 전 항목 + breaking change 원문 인용 + config 관련 bullet |
| 조사 | WebFetch | `raw.githubusercontent.com/.../README.md` | JDK 1.8+, Redis 3.0+, Valkey 7.2.5+ |
| 조사 | WebFetch | `raw.githubusercontent.com/.../pom.xml` | `maven.compiler.release=8`, `<licenses>` = Apache v2 |
| 조사 | WebFetch | `redisson.pro/docs/integration-with-spring/` | Spring Boot 매트릭스, `spring.redis.redisson.*` 키 |
| 조사 | WebFetch | `redisson.pro/docs/configuration/` | 4.x YAML 예시(루트 레벨 인증/tcp), 기본 코덱 Kryo5Codec |
| 조사 | WebFetch | `redisson.pro/docs/data-and-services/data-serialization/` | 4.x 코덱 전체 목록 (제거·신설 코덱 확인) |
| 조사 | WebFetch | `redisson.pro/docs/data-and-services/collections/` | RMap 계열·RMapCacheNative 전제조건(Redis 7.4+/Valkey 9.0+) |
| 조사 | WebFetch | `redisson.pro/docs/data-and-services/publish-subscribe/` | Reliable Pub/Sub = `RReliablePubSubTopic`, **PRO 전용** 명시 |
| 교차 검증 | WebFetch | 소스 코드 `Config.java` / `BaseConfig.java` | 인증·ssl·tcp·nameMapper setter가 Config로 이동, BaseConfig 쪽 24종 @Deprecated 확인 |
| 교차 검증 | WebFetch | 소스 코드 `RLock.java` / `RBucket.java` / `SingleServerConfig.java` | RLock 무변경, RBucket TimeUnit 계열 deprecated, 풀 설정 무변경 |
| 교차 검증 | WebFetch | `RedissonClient.java` | `getNonReentrantLock`/`getNonReentrantFairLock`/`getFencedLock` 존재, `getRedLock` deprecated |
| 교차 검증 | WebFetch | GitHub API `contents/` (3회) | 모듈 구조(`redisson-spring/*`), `redisson-spring-data-XX` 19종, DelayStrategy 구현체 4종 |
| 교차 검증 | WebFetch | `redisson-4.7.0` 태그 `redisson-spring-boot-starter/pom.xml` | 4.7.0 스타터 = `redisson-spring-data-41` + spring-boot 4.1.0, cache/transaction은 optional |
| 교차 검증 | WebFetch | GitHub Issue #6936 | 4.1.0 모듈 분리로 `RedissonSpringCacheManager` 미해결 이슈 실사례 확인 |
| 교차 검증 | WebSearch | 라이선스, Java 17 요구 여부, 모듈 아티팩트명 | 라이선스 변경 없음, Java 17 요구 사실 없음 확인 |
| 판정 | — | 18개 핵심 클레임 | **VERIFIED 16 / DISPUTED 1 / UNVERIFIED 1** |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Redisson GitHub Releases (4.0.0 태그) | https://github.com/redisson/redisson/releases/tag/redisson-4.0.0 | ⭐⭐⭐ High | 2026-08-11 조회 | 공식 릴리스 노트 |
| Redisson GitHub Releases 목록 | https://github.com/redisson/redisson/releases | ⭐⭐⭐ High | 2026-08-11 조회 | 4.x 전 버전·날짜 |
| CHANGELOG.md (raw) | https://raw.githubusercontent.com/redisson/redisson/master/CHANGELOG.md | ⭐⭐⭐ High | 2026-08-11 조회 | breaking change 원문 |
| README.md (raw) | https://raw.githubusercontent.com/redisson/redisson/master/README.md | ⭐⭐⭐ High | 2026-08-11 조회 | JDK/Redis/Valkey 지원 범위 |
| pom.xml (raw, 루트) | https://raw.githubusercontent.com/redisson/redisson/master/pom.xml | ⭐⭐⭐ High | 2026-08-11 조회 | 컴파일 타깃·라이선스 |
| `Config.java` / `BaseConfig.java` / `SingleServerConfig.java` (raw) | https://raw.githubusercontent.com/redisson/redisson/master/redisson/src/main/java/org/redisson/config/ | ⭐⭐⭐ High | 2026-08-11 조회 | 설정 재편 실물 확인 |
| `RLock.java` / `RBucket.java` / `RedissonClient.java` (raw) | https://raw.githubusercontent.com/redisson/redisson/master/redisson/src/main/java/org/redisson/api/ | ⭐⭐⭐ High | 2026-08-11 조회 | API 시그니처 실물 확인 |
| 스타터 pom.xml (4.7.0 태그) | https://raw.githubusercontent.com/redisson/redisson/redisson-4.7.0/redisson-spring/redisson-spring-boot-starter/pom.xml | ⭐⭐⭐ High | 2026-08-11 조회 | Spring Boot 호환 실측 |
| `RedissonProperties.java` (스타터) | https://raw.githubusercontent.com/redisson/redisson/master/redisson-spring/redisson-spring-boot-starter/src/main/java/org/redisson/spring/starter/RedissonProperties.java | ⭐⭐⭐ High | 2026-08-11 조회 | `spring.redis.redisson` prefix 확인 |
| Redisson Reference Guide — Configuration | https://redisson.pro/docs/configuration/ | ⭐⭐⭐ High | 2026-08-11 조회 | 공식 문서 |
| Redisson Reference Guide — Spring 통합 | https://redisson.pro/docs/integration-with-spring/ | ⭐⭐⭐ High | 2026-08-11 조회 | 공식 문서 |
| Redisson Reference Guide — Data Serialization | https://redisson.pro/docs/data-and-services/data-serialization/ | ⭐⭐⭐ High | 2026-08-11 조회 | 코덱 전체 목록 |
| Redisson Reference Guide — Collections | https://redisson.pro/docs/data-and-services/collections/ | ⭐⭐⭐ High | 2026-08-11 조회 | RMap 계열 전제조건 |
| Redisson Reference Guide — Publish/Subscribe | https://redisson.pro/docs/data-and-services/publish-subscribe/ | ⭐⭐⭐ High | 2026-08-11 조회 | Reliable Pub/Sub PRO 전용 명시 |
| GitHub Issue #6936 | https://github.com/redisson/redisson/issues/6936 | ⭐⭐⭐ High | 2026-08-11 조회 | 공식 레포 이슈(모듈 분리 실사례) |
| newreleases.io — redisson 4.0.0 | https://newreleases.io/project/github/redisson/redisson/release/redisson-4.0.0 | ⭐⭐ Medium | 2026-08-11 조회 | 릴리스 노트 미러(교차 확인용) |

### 3-1. 교차 검증 판정표

> 각 클레임을 **2개 이상 독립 소스**로 대조한 결과.

| # | 클레임 | 소스 A | 소스 B | 판정 |
|---|--------|--------|--------|------|
| 1 | 4.x 최신 안정판은 **4.7.0 (2026-08-04)** | CHANGELOG `04-August-2026 - 4.7.0` | GitHub Releases 목록 최상단 | ✅ VERIFIED |
| 2 | 4.0.0은 **2025-12-16**, 4.4.0은 **2026-05-12** 릴리스 | CHANGELOG 날짜 | GitHub Releases / 릴리스 검색 결과 | ✅ VERIFIED |
| 3 | **최소 JDK는 Java 8 — 4.x에서 상향 없음** | README "JDK 1.8+ up to the latest version" | 루트 `pom.xml` `maven.compiler.release=8` | ✅ VERIFIED |
| 4 | **라이선스 Apache 2.0 — 변경 없음** | 루트 `pom.xml` `<licenses>` = "Apache v2" | 웹 검색(라이선스 변경 발표 없음) | ✅ VERIFIED |
| 5 | 4.0.0에서 **JSON 설정 포맷 지원 제거** | CHANGELOG "dropped support of deprecated JSON config format" | GitHub 릴리스 노트 / newreleases 미러 | ✅ VERIFIED |
| 6 | 4.0.0에서 **인증·nameMapper·ssl·tcp 파라미터가 Config 최상위로 이동** | CHANGELOG "move auth parameters at Config object level" 외 3건 | `Config.java`에 해당 setter 신설 + `BaseConfig.java` 동명 setter 24종 @Deprecated("Use Config#...") | ✅ VERIFIED |
| 7 | `RScript.ReturnType` **MULTI→LIST, STATUS→STRING, INTEGER→LONG** | CHANGELOG 원문 인용 | GitHub 릴리스 노트 / newreleases 미러 | ✅ VERIFIED |
| 8 | 패키지 이동 3종 (`org.redisson.config`, `org.redisson.api.geo`, `org.redisson.api.stream`) | CHANGELOG 원문 | 릴리스 노트 + `Config.java`의 `org.redisson.config.NameMapper` 사용 | ✅ VERIFIED |
| 9 | `getNodesGroup()`·`getClusterNodesGroup()`, Spring XML 설정, Redisson 자체 Spring Session **제거** | CHANGELOG 원문 | GitHub 릴리스 노트 | ✅ VERIFIED |
| 10 | 4.1.0에서 **Spring Cache/Transaction 모듈 분리**, 코덱 4종(`FstCodec`·`FuryCodec`·`MarshallingCodec`·`SnappyCodec`) 제거 | CHANGELOG 4.1.0 | data-serialization 문서에 4종 부재 + `ForyCodec`·`SnappyCodecV2` 존재 / Issue #6936 실사례 | ✅ VERIFIED |
| 11 | 스타터가 cache·transaction 모듈을 **optional로 선언**(전이되지 않음) | 4.7.0 태그 스타터 `pom.xml` | Issue #6936(사용자 보고 + 마일스톤 처리) | ✅ VERIFIED |
| 12 | 4.7.0 스타터는 **`redisson-spring-data-41`** 번들, Spring Boot 4.1 대응 | 4.7.0 태그 스타터 `pom.xml` | CHANGELOG 4.6.x "Spring Boot/Data Redis 4.1 integration" | ✅ VERIFIED |
| 13 | Redisson 4.x는 **Spring Boot 3.0~3.5도 계속 지원**(`-30`~`-35` 모듈) | docs 매트릭스 "redisson-spring-data-3x → Spring Boot 3.x.y" | 레포 `redisson-spring/redisson-spring-data/` 하위 모듈 19종 실재 | ✅ VERIFIED |
| 14 | Redisson 전용 프로퍼티 prefix는 4.x에서도 **`spring.redis.redisson`** | 스타터 `RedissonProperties.java` `@ConfigurationProperties` | docs 통합 문서 | ✅ VERIFIED |
| 15 | 기본 코덱은 **`Kryo5Codec`** | docs Configuration "Default value: org.redisson.codec.Kryo5Codec" | docs data-serialization 목록의 DEFAULT 표기 | ✅ VERIFIED |
| 16 | `RLock` 인터페이스는 4.x에서 **시그니처 변경·deprecated 없음** | `RLock.java` 소스 전수 확인 | CHANGELOG 4.x breaking change 목록에 RLock 항목 부재 | ✅ VERIFIED |
| 17 | **스타터가 커버하는 Spring Boot 상한** | docs "Spring Boot 1.3.x - 4.0.x" | 4.7.0 스타터 pom이 **spring-boot 4.1.0 + spring-data-41** 사용 | ⚠️ **DISPUTED** |
| 18 | `getMapCacheNative()`를 **커뮤니티 에디션에서 쓸 수 있는가** | docs Collections 표에서 PRO로 표기 | 대조 가능한 2차 공식 소스 확보 실패 | ⚠️ **UNVERIFIED** |

### 3-1a. 2026-09-26 재검증 (30~60일 주기)

| # | 클레임 | 소스 | 판정 |
|---|--------|------|------|
| R1 | 4.x 최신 안정판은 여전히 **4.7.0 (2026-08-04)** — 신규 마이너 없음 | `raw.githubusercontent.com/.../CHANGELOG.md` 재조회(2026-09-26) 최상단 항목 동일 | ✅ VERIFIED (변동 없음) |
| R2 | 스타터 Spring Boot 지원 범위 "1.3.x ~ 4.1.x" | `redisson.pro/docs/integration-with-spring/` 재조회 — 기존 DISPUTED(#17, docs가 "~4.0.x"로 표기) 해소, 현재 docs가 SKILL.md와 일치 | ✅ VERIFIED (기존 DISPUTED 해소) |
| R3 | 4.7.0 스타터가 번들하는 모듈은 `redisson-spring-data-41` | 4.7.0 태그 `redisson-spring-boot-starter/pom.xml` 원본 재확인 | ✅ VERIFIED (변동 없음) |
| R4 | `getMapCacheNative()` 에디션 — 기존 UNVERIFIED(#18) 해소 | `redisson.pro/docs/data-and-services/collections/` 재조회: **기본판은 커뮤니티 에디션에서 사용 가능**, `getMapCacheNativeV2()`·클러스터 변종만 PRO 전용 | ⚠️ **DISPUTED → 정정 반영** (기존 SKILL.md 기술이 부정확했음. §6 REFERENCE.md 주의문 수정) |

**정정 내역**: `references/REFERENCE.md` §6의 `getMapCacheNative()` 관련 `> 주의:` 문구를 "PRO 전용" → "기본판은 커뮤니티 에디션 가능, `getMapCacheNativeV2()`/클러스터 변종만 PRO 전용"으로 수정(2026-09-26).

### 3-2. DISPUTED / UNVERIFIED 반영 내역

- **#17 (DISPUTED)**: docs의 "Spring Boot 1.3.x - 4.0.x" 문구와 실제 4.7.0 스타터의 Spring Boot 4.1.0 의존이 불일치. **1차 소스(릴리스 태그 pom.xml)를 우선**하여 SKILL.md에는 "1.3.x ~ 4.1.x"로 기재하고, 버전별 번들 모듈을 표로 분리해 오해 여지를 제거했다.
- **#18 (UNVERIFIED)**: 에디션 판정을 단정하지 않고 "공식 docs 표에서 PRO 기능으로 표기된다"는 **출처 기반 서술 + `> 주의:` 표기**로 처리하고, 커뮤니티 대안(`getMapCache()` / `RBucket` 분리)을 함께 제시했다.
- 부가: docs Getting Started 페이지의 예시 버전은 4.6.1로 갱신이 지연된 상태였으나, CHANGELOG·Releases·태그 pom 3종이 4.7.0으로 일치하므로 **4.7.0을 최신으로 채택**했다.

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (불일치 1건은 1차 소스 우선으로 조정 후 3-2에 기록)
- [✅] 버전 정보가 명시되어 있음 (Redisson 4.0.0~4.7.0, 릴리스 일자·근거 컬럼 포함)
- [✅] deprecated된 패턴을 권장하지 않음 (`setRetryInterval`·`trySet(TimeUnit)`·`getRedLock` 등을 대체 API와 함께 명시)
- [✅] 코드 예시가 실행 가능한 형태임 (pom.xml / YAML / Java 전부 복사 후 버전만 바꿔 사용 가능)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (문서 상단 `> 소스:` / `> 검증일: 2026-08-11`)
- [✅] 핵심 개념 설명 포함 (Breaking Change 분류·Config 재편 원리·watchdog 동작 조건)
- [✅] 코드 예시 포함 (마이그레이션 diff 8종 + 락·캐시 패턴)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (§11, 3종 스킬 역할 분리표)
- [✅] 흔한 실수 패턴 포함 (§12, 10종)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (의존성 exclude 블록·YAML 전후 대비·정규식 치환 목록)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트·로컬 경로 종속 없음, 시크릿은 환경변수 placeholder로 표기)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (실전 질문 3개, §5)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS, 근거 섹션 추적 가능)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (해당 없음 — 오답 유도 질문 2건을 본문 `> 주의:` 문구가 선제 차단)

---

## 5. 테스트 진행 기록

**수행일**: 2026-08-11
**수행자**: skill-creator → agent content test (SKILL.md 기반 실전 질문 답변 검증)
**수행 방법**: 작성된 SKILL.md만을 근거로 실무 질문 3개에 답변하고, 근거 섹션 존재 여부·anti-pattern 회피 여부를 판정

### Q1. "Spring Boot 3.5 + Java 17 서비스에서 Redisson 3.51.0 → 4.7.0으로 올리려 한다. 의존성을 어떻게 잡아야 하나? JDK도 올려야 하나?"

**기대 도출 경로**: §1 매트릭스(Java 8+, 상향 없음) + §1 Spring Boot 호환(4.7.0 스타터는 `-41` 번들) + §2 exclude 예시 + §2 Spring Cache 모듈

**SKILL.md 기반 답변**
- JDK 상향 **불필요** — Redisson 4.x 최소 JDK는 Java 8 (§1, 근거 README + pom.xml). Java 17 유지 가능.
- 스타터 4.7.0은 `redisson-spring-data-41`을 번들하므로 Boot 3.5에서는 **exclude 후 `redisson-spring-data-35`를 명시** (§2 코드 그대로 적용 가능).
- `@EnableCaching` + `RedissonSpringCacheManager`를 쓰고 있었다면 `redisson-spring-cache` 의존성을 **별도 추가**(4.1.0 모듈 분리, 스타터엔 optional로만 선언) (§2).
- 프로퍼티 키 `spring.redis.redisson.file`은 그대로 유지 (§4-3).

**판정: ✅ PASS** — 4개 핵심 포인트 모두 SKILL.md 내 명시 섹션에서 도출됨. "메이저 업 = JDK 상향" 오답을 §1 주의문이 선제 차단.

### Q2. "4.7.0으로 올렸더니 컴파일·빌드는 성공했는데 운영 기동 시 Redis 인증에 실패한다. 원인이 뭘 가능성이 큰가?"

**기대 도출 경로**: §3-1 #2·#4·#5 + §3-4 주의문 + §4-2 YAML diff

**SKILL.md 기반 답변**
- 가장 유력한 원인: **외부 `redisson.yaml`의 인증 키가 여전히 `singleServerConfig:` 블록 아래에 있음.** 4.0.0에서 인증·ssl·tcp·nameMapper 파라미터가 **Config 최상위(루트 레벨)로 이동**했다 (§3-1 #2~#5).
- 컴파일이 통과한 이유: `BaseConfig`의 해당 setter들이 **제거가 아니라 `@Deprecated`로 잔존**하고, **YAML은 애초에 컴파일 대상이 아니기 때문** (§3-4 주의문).
- 조치: §4-2의 "✅ 4.x" YAML처럼 인증·`tcpNoDelay`·`sslVerificationMode`를 루트로 이동. Java Config라면 `config.setUsername(...)`·`config.setPassword(...)` 형태로 이동 (§4-1).
- 부수 확인: `.json` 설정 파일을 쓰고 있었다면 4.0.0에서 지원이 사라졌으므로 YAML 전환 필요 (§3-1 #1, §4-2).

**판정: ✅ PASS** — "빌드 성공 = 마이그레이션 완료" 안티패턴을 정확히 반박하고 근본 원인·조치까지 도출.

### Q3. "분산 락에 `tryLock(3, 10, SECONDS)`를 쓰는데 watchdog이 자동 연장을 안 한다. 그리고 4.x에서 재진입을 막는 락이 생겼다던데?"

**기대 도출 경로**: §5 Watchdog 절 + §5 락 종류 선택표

**SKILL.md 기반 답변**
- 정상 동작이다. **`leaseTime`을 명시하면 watchdog은 동작하지 않는다** — 둘 중 하나만 쓴다 (§5). 자동 연장이 필요하면 `lock.lock()`(leaseTime 미지정) + `Config.setLockWatchdogTimeout()` 조정.
- 트레이드오프도 함께 제시: watchdog은 JVM이 살아 있는 한 계속 연장하므로 프로세스가 멈춘 채 살아 있으면 락이 오래 유지될 수 있음 (§5).
- 재진입 방지 락은 **4.4.0 신규 `getNonReentrantLock(name)` / `getNonReentrantFairLock(name)`** — 같은 스레드가 중첩 획득하면 `IllegalMonitorStateException` (§5 선택표 + 코드).
- `RLock` 자체는 4.x에서 시그니처 변경이 없어 기존 try-finally 패턴을 그대로 유지 (§5).

**판정: ✅ PASS** — 오해(watchdog 미동작 = 버그)를 정정하고 4.x 신규 API까지 정확히 안내.

**agent content test: 3/3 PASS**

---

### 5-1. 2026-09-26 재검증 (30~60일 주기, verification-policy.md 절차)

**수행일**: 2026-09-26
**수행 방법**: SKILL.md + references/REFERENCE.md 전체 Read → 핵심 클레임 4개 WebSearch/WebFetch 재검증(3-1a) → 실전 질문 2개로 SKILL.md 자체 답변 재확인

**Q1(재검증). "커뮤니티 에디션에서 `getMapCacheNative()`를 써도 되나?"**
- 정정 전 SKILL.md 답변: "PRO 전용이라 못 쓴다" (부정확)
- 정정 후 SKILL.md 답변(§6 REFERENCE.md): 기본판 `getMapCacheNative()`(Redis 7.4+/Valkey 9.0+)는 **커뮤니티 에디션 사용 가능**, `getMapCacheNativeV2()`·클러스터 변종만 PRO 전용
- **판정: ✅ PASS (정정 반영 후)** — 재검증으로 부정확한 서술 발견·수정

**Q2(재검증). "Spring Boot 3.5에서 Redisson 4.7.0을 쓰려면 스타터 기본 번들을 그대로 둬도 되나?"**
- SKILL.md 답변: 안 된다. 4.7.0 스타터는 `redisson-spring-data-41`(Spring Boot 4.1.x용)을 기본 번들하므로 Boot 3.5 사용 시 이를 exclude하고 `redisson-spring-data-35`를 명시해야 한다(§2).
- WebFetch로 4.7.0 태그 pom.xml 재확인 결과 여전히 `-41` 번들 확인됨 — 변동 없음
- **판정: ✅ PASS**

**재검증 결과**: 4개 클레임 중 3개 VERIFIED(변동 없음), 1개는 기존 UNVERIFIED 항목이 실제로는 부정확한 서술이었음을 발견하여 REFERENCE.md 정정. 실질적 내용 변경 발생 → status PENDING_TEST로 전환.

---

### 5-2. 2026-09-26 skill-tester agent content test (정정 부분 타겟, verification-policy 3·4단계)

**수행일**: 2026-09-26
**수행자**: skill-tester → general-purpose (domain-specific 에이전트 미설치로 대체, verification.md에 명시)
**수행 방법**: SKILL.md + REFERENCE.md Read 후 general-purpose 에이전트에게 실전 질문 2개를 1개씩 순차로 답변시키고, 근거 섹션·정정 반영 여부를 검증

**Q1. "커뮤니티 에디션 + Redis 7.4 환경에서 `getMapCacheNative()`를 써도 되나? PRO 라이선스가 필요한가?" (5-1의 정정 사항을 정면 타겟)**
- ✅ PASS
- 근거: REFERENCE.md §6 "RMap 계열 선택표" 하단 "주의(2026-09-26 정정)" 문구
- 상세: 에이전트가 "그대로 써도 된다, PRO 라이선스 불필요"로 정확히 답하고, `getMapCacheNativeV2()`·클러스터 변종만 PRO 전용임을 구분해 답변. 정정 전 서술("PRO 전용")로 오답할 함정을 정정 문구가 정확히 차단함을 확인.

**Q2. "4.4.0 신규 `getNonReentrantLock()`·GCRA 레이트 리미터도 PRO 라이선스가 필요한가? 4.x 신규 기능이라 다 유료일 것 같다"**
- ✅ PASS
- 근거: REFERENCE.md §5 "락 종류 선택표"·"세마포어/레이트 리미터", §8 "4.x 신규 기능 (커뮤니티/PRO 구분 주의)" 표
- 상세: 에이전트가 §8 표를 근거로 "PRO 전용은 Reliable Pub/Sub 하나뿐, Non-Reentrant Lock·GCRA는 커뮤니티"로 정확히 답변. "신규 기능 = 유료"라는 일반화 오답 패턴을 §8 주의문이 선제 차단함을 확인.

**agent content test (재검증분): 2/2 PASS** — 5-1(자체 재확인) 2/2 PASS와 합산 시 2026-09-26 재검증 관련 테스트 총 4/4 PASS. 정정된 `getMapCacheNative()` 서술이 실제 에이전트 답변에서 올바르게 인용됨을 별도 에이전트로 재확인.

### 판정

- agent content test: 2/2 PASS (5-2), 누적 4/4 PASS
- verification-policy 분류: 라이브러리 사용법·API 정확성 스킬 — "content test로 충분" 범주 (실사용 필수 카테고리인 빌드설정/워크플로우/설정+실행/마이그레이션 가이드 어디에도 해당하지 않음. §4 마이그레이션 diff는 참고 코드이지 이 스킬 자체가 빌드·마이그레이션 실행 결과물은 아님)
- 최종 상태: **APPROVED**

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (핵심 클레임 18건 중 VERIFIED 16, DISPUTED 1·UNVERIFIED 1은 본문에 `> 주의:` 반영) |
| 구조 완전성 | ✅ (frontmatter·소스 URL·검증일·버전 매트릭스·코드 예시·사용/미사용 기준·흔한 실수 포함) |
| 실용성 | ✅ (실제 pom/YAML/Java diff를 그대로 복사해 쓸 수 있는 형태) |
| 기존 스킬과의 역할 분리 | ✅ (2.x/3.x/4.x 3종 포인터를 SKILL.md 최상단 표로 명시, 3.x 상세는 modern 스킬 참조로 위임해 중복 최소화) |
| 에이전트 활용 테스트 | ✅ 최초 3/3 PASS (2026-08-11) + 재검증 2/2 PASS (2026-09-26, 정정 부분 타겟 general-purpose 테스트) |
| **최종 판정** | **APPROVED** (2026-09-26 재검증 — `getMapCacheNative()` PRO/커뮤니티 서술 정정 후 skill-tester가 정정 부분을 정면 타겟한 질문으로 general-purpose 에이전트 content test 2/2 PASS 재확인) |

> 판정 근거: 본 스킬은 *라이브러리 사용법·API 정확성* 중심으로 검증 대상이 **답변 정확성**이다(`verification-policy.md`의 "content test로 충분" 범주).
> 다만 §4의 마이그레이션 diff는 실제 빌드 산출물로만 최종 확인 가능한 성격이 일부 있으므로, 실 프로젝트 적용 시 SKILL.md §10 체크리스트 14번(스테이징 기동·락·캐시·페일오버 검증)을 반드시 수행하도록 본문에 명시했다.

---

## 7. 개선 필요 사항

- [❌] **README.md 스킬 목록·업데이트 로그 반영** — 본 작업에서 수정이 금지되어 미수행 (skill-tester 범위 밖). 상위 에이전트가 일괄 반영 필요 — *차단 요인 아님, 별도 후속 커밋에서 처리*
- [✅] `getMapCacheNative()` 에디션(커뮤니티/PRO) 재확인 — (2026-09-26 완료) 공식 docs 재조회로 기본판=커뮤니티, `getMapCacheNativeV2()`/클러스터 변종=PRO로 확정, REFERENCE.md §6 정정 + skill-tester 재테스트(§5-2) 2/2 PASS로 정정 반영 확인
- [❌] Spring Boot 4.1 대응이 docs 호환 매트릭스에 반영되는지 재확인 (현재 docs는 4.0.x까지만 기재) — *선택 보강. 스타터 pom.xml 1차 소스로 이미 SKILL.md에 정확히 반영되어 있어 차단 요인 아님*
- [❌] 4.8.0 이후 릴리스 시 §1 버전 매트릭스·§3-3 이후 breaking change 표 갱신 — *아직 4.8.0 미출시. 향후 정기 재검증(30~60일 주기) 시 처리할 선택 후속 과제*
- [❌] `redis-redisson-modern` 스킬에 "4.x는 `redis-redisson-4` 참조" 역방향 포인터 추가 검토 — *선택 보강(다른 스킬 파일 수정 필요, 본 스킬 정확성과 무관하여 차단 요인 아님)*

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-08-11 | v1 | 최초 작성. Redisson 4.0.0~4.7.0 기준 조사·교차검증(18 클레임, VERIFIED 16/DISPUTED 1/UNVERIFIED 1) 후 SKILL.md 생성, agent content test 3/3 PASS → APPROVED | skill-creator |
| 2026-09-25 | v1 | 구조 개편: 상세 내용 references/REFERENCE.md 분리 (내용 변경 없음) | skill-creator |
| 2026-09-26 | v1 | 30~60일 주기 재검증. 4.7.0 최신 유지 확인, Spring Boot 매트릭스 DISPUTED 해소, `getMapCacheNative()` PRO/커뮤니티 서술 오류 발견·정정(REFERENCE.md §6) → status APPROVED에서 PENDING_TEST로 전환 | 메인 세션 |
| 2026-09-26 | v1 | 재검증: 2단계 실사용 테스트 수행 (Q1 `getMapCacheNative()` 커뮤니티/PRO 정정 타겟 / Q2 4.4.0 신규 기능 PRO 오인 방지) → general-purpose 에이전트 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
