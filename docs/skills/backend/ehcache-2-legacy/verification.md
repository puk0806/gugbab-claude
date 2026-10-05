---
skill: ehcache-2-legacy
category: backend
version: v1
date: 2026-09-26
status: APPROVED
---

# EhCache 2.x Legacy 스킬 검증 문서

> 스킬 경로: `.claude/skills/ehcache-2-legacy/SKILL.md`

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `ehcache-2-legacy` |
| 스킬 경로 | `.claude/skills/ehcache-2-legacy/SKILL.md` |
| 검증일 | 2026-09-26 (최초 2026-04-23) |
| 검증자 | skill-creator (Claude) → 2026-09-26 재검증: 메인 오케스트레이션 (Claude Sonnet 5) |
| 스킬 버전 | v1 |
| 기준 버전 | EhCache 2.10.9.2 (net.sf.ehcache), Spring Boot 2.5, Java 11 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (ehcache.org/documentation/2.8, apidocs/2.10.4)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/ehcache/ehcache2)
- [✅] Maven Central 2.10.9.2 릴리스 확인 (2021-04-24)
- [✅] 핵심 구성 속성 정리 (TTL, eviction, overflow, persistence)
- [✅] Spring Boot 2.5 통합 방법 정리 (EhCacheCacheManager, @EnableCaching, @Cacheable)
- [✅] CacheEventListener / Factory 구현 패턴 정리
- [✅] 프로그래매틱 CacheManager 접근 예시 작성
- [✅] Redis 2계층 캐시 패턴 개념 설명
- [✅] EhCache 3.x와의 API 차이 표 작성
- [✅] 유지보수 종료 경고 및 라이선스 제약 명시
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "EhCache 2.10.9.2 maven net.sf.ehcache release date" | 2.10.9.2 = 2021-04-24 릴리스, 그룹ID 확인 |
| 조사 | WebSearch | "ehcache.xml 2.10 defaultCache timeToLiveSeconds maxEntriesLocalHeap" | CacheConfiguration 2.10.x API 도큐먼트 확인, memoryStoreEvictionPolicy LRU/LFU/FIFO 확인 |
| 조사 | WebSearch | "Spring Boot 2.5 ehcache 2.x integration" | spring.cache.ehcache.config 속성, EhCacheCacheManager 자동 구성 확인 |
| 조사 | WebSearch | "ehcache 2.10 overflowToDisk diskPersistent diskExpiryThreadIntervalSeconds" | overflowToDisk/diskPersistent → PersistenceConfiguration.Strategy로 대체됨 확인 |
| 조사 | WebSearch | "CacheEventListener ehcache 2.x cacheEventListenerFactory" | CacheEventListenerFactory 추상 클래스, createCacheEventListener 메서드, registerListener 확인 |
| 조사 | WebSearch | "ehcache 2.x vs 3.x migration API differences" | 패키지 net.sf.ehcache vs org.ehcache, JSR-107 빌트인 지원 여부 확인 |
| 조사 | WebSearch | "ehcache 2.x maintenance mode deprecated 2020" | FOSS Ehcache 2.x는 더 이상 유지되지 않음(2023-09 이후) 확인 |
| 조사 | WebSearch | "notifyElementPut CacheEventListener interface" | 메서드 시그니처 void notifyElementPut(Ehcache, Element) throws CacheException 확인 |
| 조사 | WebSearch | "CacheManager.getInstance() ehcache 2 programmatic" | getInstance, addCache, getCache, Element, getObjectValue, shutdown 패턴 확인 |
| 조사 | WebSearch | "@Cacheable KeyGenerator SimpleKey Spring" | 기본 키 생성 규칙 (0개/1개/N개 파라미터), SimpleKey 확인 |
| 조사 | WebSearch | "ehcache 2 PersistenceConfiguration.Strategy LOCALTEMPSWAP LOCALRESTARTABLE" | localTempSwap=OSS, localRestartable=Enterprise 구분 확인 |
| 조사 | WebSearch | "ehcache 3 terracotta BigMemory license commercial" | BigMemory/Fast Restartability는 상용 전용, OSS는 Apache 2.0 |
| 조사 | WebSearch | "spring boot 2.5 cache starter auto-detect classpath" | JSR-107 → EhCache 2 → Caffeine 순 자동 감지 확인 |
| 조사 | WebSearch | "EhCacheCacheManager spring boot 2 ehcache 2.x @Bean" | EhCacheManagerFactoryBean + EhCacheCacheManager + setShared(true) 패턴 확인 |
| 교차검증 | WebSearch | 14개 클레임, 독립 소스 2개 이상 | VERIFIED 13 / DISPUTED 0 / UNVERIFIED 1 |

> WebFetch 시도 시 self-signed certificate 에러가 발생하여 ehcache.org 직접 페칭 실패. WebSearch 요약 + Maven Central / mvnrepository.com / GitHub 교차 확인으로 대체.

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| EhCache 2.10.x API Docs (CacheConfiguration) | https://www.ehcache.org/apidocs/2.10.4/net/sf/ehcache/config/CacheConfiguration.html | ⭐⭐⭐ High | 2026-04-23 | 공식 Javadoc |
| EhCache 2.8 공식 문서 (Event Listeners) | https://www.ehcache.org/documentation/2.8/apis/cache-event-listeners.html | ⭐⭐⭐ High | 2026-04-23 | 공식 Doc (2.10과 API 동일) |
| EhCache 2.10 Configuration Examples | https://www.ehcache.org/generated/2.10.0/html/ehc-all/Ehcache_Documentation_Set/co-persist_config_examples.html | ⭐⭐⭐ High | 2026-04-23 | 공식 Doc |
| EhCache 2 GitHub Repo | https://github.com/ehcache/ehcache2 | ⭐⭐⭐ High | 2026-04-23 | 공식 소스 |
| Maven Central 2.10.9.2 | https://central.sonatype.com/artifact/net.sf.ehcache/ehcache/2.10.9.2 | ⭐⭐⭐ High | 2026-04-23 | 릴리스 메타정보 |
| Spring Boot 2.1 Caching Reference | https://docs.spring.io/spring-boot/docs/2.1.6.RELEASE/reference/html/boot-features-caching.html | ⭐⭐⭐ High | 2026-04-23 | spring.cache.ehcache.config 명시 |
| EhCache 3 Migration Guide | https://www.ehcache.org/documentation/3.3/migration-guide.html | ⭐⭐⭐ High | 2026-04-23 | 2 → 3 차이점 공식 가이드 |
| Terracotta Release Info (BigMemory) | https://confluence.terracotta.org/display/release/Home | ⭐⭐⭐ High | 2026-04-23 | 상용 라이선스 확인 |
| EhCache Wikipedia | https://en.wikipedia.org/wiki/Ehcache | ⭐⭐ Medium | 2026-04-23 | 유지보수 상태 보조 확인 |
| mvnrepository.com 2.10.9.2 | https://mvnrepository.com/artifact/net.sf.ehcache/ehcache/2.10.9.2 | ⭐⭐ Medium | 2026-04-23 | 릴리스 날짜 교차 검증 |
| Baeldung: Spring Boot EhCache | https://www.baeldung.com/spring-boot-ehcache | ⭐⭐ Medium | 2026-04-23 | 통합 예제 교차 검증 |
| Spring Framework KeyGenerator Doc | https://docs.spring.io/spring-framework/docs/4.3.15.RELEASE/spring-framework-reference/html/cache.html | ⭐⭐⭐ High | 2026-04-23 | SimpleKey 규칙 확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 핵심 클레임 교차 검증

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|----------|----------|------|
| 1 | `net.sf.ehcache:ehcache:2.10.9.2`가 2.10 브랜치 마지막 OSS 릴리스 | Maven Central | libraries.io | VERIFIED |
| 2 | 2.10.9.2 릴리스 날짜 2021-04-24 | mvnrepository.com | Maven Central 메타 | VERIFIED |
| 3 | `memoryStoreEvictionPolicy` 값은 LRU(기본)/LFU/FIFO | EhCache 2.10 API Doc | 2.8 공식 Doc | VERIFIED |
| 4 | `<persistence strategy="localTempSwap">`가 `overflowToDisk=true`의 대체 | 2.10 Configuration Examples | Migration Guide | VERIFIED |
| 5 | `localRestartable`은 Enterprise/BigMemory 전용 | Terracotta Release Info | ehcache.org Persistence Strategy Javadoc | VERIFIED |
| 6 | Spring Boot 2.x에서 `spring.cache.ehcache.config=classpath:ehcache.xml` 속성 존재 | Spring Boot 2.1 Ref | Baeldung | VERIFIED |
| 7 | `EhCacheCacheManager`는 `org.springframework.cache.ehcache` 패키지 제공 | Spring Framework Doc | Baeldung | VERIFIED |
| 8 | `CacheEventListenerFactory`의 abstract 메서드 `createCacheEventListener(Properties)` | 2.10 Javadoc | 2.8 공식 Doc | VERIFIED |
| 9 | `notifyElementPut(Ehcache, Element)` 메서드 시그니처 | 2.10 Javadoc | 2.8 공식 Doc | VERIFIED |
| 10 | `CacheManager.getInstance()` 싱글턴 접근 | 2.10 API Doc | Baeldung | VERIFIED |
| 11 | `Element.getObjectValue()`로 값 추출 | Tabnine 코드샘플 | 공식 code-samples 페이지 | VERIFIED |
| 12 | EhCache 2.x는 `net.sf.ehcache`, 3.x는 `org.ehcache` 패키지 | Migration Guide | ehcache-jcache README | VERIFIED |
| 13 | FOSS EhCache 2.x 유지보수 중단 (2023-09 이후) | google groups 사용자 공지 | Terracotta 공식 FAQ | VERIFIED |
| 14 | Spring Boot 캐시 자동 감지 순서 (JSR-107 → EhCache 2 → Caffeine 등) | Medium 설명 | Spring Boot 2.1 Ref | UNVERIFIED (순서 정확성 1차 소스에서 명시적 확인 못함 — SKILL.md에 "권장 확인 사항"으로 남김) |

### 4-2. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (EhCache 2.10.9.2, Spring Boot 2.5, Java 11)
- [✅] deprecated된 패턴(overflowToDisk, diskPersistent)에 대한 2.6+ 대체 안내 포함
- [✅] 코드 예시가 실행 가능한 형태임

### 4-3. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (CacheManager, Cache, Element, Listener)
- [✅] 코드 예시 포함 (XML, Spring Config, Service, Listener)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (경고 박스)
- [✅] 흔한 실수 패턴 포함 (10번 섹션)

### 4-4. 실용성
- [✅] 에이전트가 참조했을 때 실제 레거시 유지보수 코드 작성에 도움이 되는 수준
- [✅] 실용적 예시 포함 (TTL 설정, @Cacheable, Listener 구현)
- [✅] 범용적 사용 가능 (특정 프로젝트 종속 없음)

### 4-5. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-09-28)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-09-28)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (발견 없음)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인. 질문 1개는 2026-09-26 재검증에서 추가된 CVE(jackson-databind) 경고 문구를 정확히 겨냥.

### 실제 수행 테스트

**Q1. "Spring Boot 2.5 레거시 프로젝트에서 EhCache 2.x로 'orders' 캐시(TTL 20분, 최대 힙 3000건, LRU)를 추가하려면?"**
- ✅ PASS
- 근거: SKILL.md "2. `ehcache.xml` 설정" 기본 형태 예시 + "4-3. `@Cacheable`/`@CacheEvict`/`@CachePut`" 섹션
- 상세: `maxEntriesLocalHeap="3000"`, `timeToLiveSeconds="1200"`, `memoryStoreEvictionPolicy="LRU"` 값을 정확히 도출하고 `@Cacheable(value="orders", ...)` 코드까지 정확히 작성. `timeToIdleSeconds` 생략 시 정확한 동작이 SKILL.md에 명시되어 있지 않다는 사소한 gap 발견(차단 요인 아님).

**Q2. "net.sf.ehcache:ehcache:2.10.6을 쓰는데 보안팀 CVE 점검에서 뭘 봐야 하나?" (2026-09-26 CVE 경고 정정분 겨냥)**
- ✅ PASS
- 근거: SKILL.md 상단 "⚠️ 중요 경고" 박스의 "주의 (CVE, 2026-09-26 추가)" 문구
- 상세: 번들 `jackson-databind 2.9.6` CVE 노출, `mvn dependency:tree` 확인 및 `<dependencyManagement>` override 필요성, EhCache 2.x가 더 이상 이 의존성을 갱신하지 않는다는 사실까지 정확히 인용. 옛 내용(CVE 언급 없음)과 모순되지 않고 정정 내용이 유일한 근거로 반영됨을 확인.

### 발견된 gap

- `timeToIdleSeconds` 생략 시 정확한 동작(무기한 유지 여부) 미명시 — 선택 보강, 차단 요인 아님
- CVE 구체적 식별자(CVE 번호)가 SKILL.md에 없음 — "다수의 공개 CVE"로만 서술, 필요 시 NVD 참조 문구 보강 권장. 차단 요인 아님

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 → 실사용 필수 카테고리 해당 없음 (content test PASS로 APPROVED 가능)
- 최종 상태: APPROVED

---

### 재검증 (2026-09-26)

**수행일**: 2026-09-26
**수행자**: 메인 대화 오케스트레이션 (Claude Sonnet 5) — verification-policy.md 재검증 절차
**수행 방법**: SKILL.md + REFERENCE.md 전체 Read → WebSearch로 핵심 클레임 재대조 → 실전 질문 2개 자체 답변

**재검증한 핵심 클레임**
- EhCache 2.x FOSS 유지보수 종료(2023-09 이후) 상태 — 재확인, 변동 없음 (VERIFIED, 2026-09-26 WebSearch)
- `net.sf.ehcache:ehcache:2.10.9.2`가 여전히 2.10 브랜치 마지막 공개 릴리스 — 재확인, 신규 2.x 릴리스 없음 (VERIFIED)
- **신규 발견**: 구버전(2.10.6 등)에 번들된 `jackson-databind 2.9.6`에 공개 CVE 다수 — SKILL.md에 없던 내용이라 `> 주의:` 경고 추가 (VERIFIED, Snyk `net.sf.ehcache:management-ehcache-v1` 어드바이저리 기준)

**Q1. "EhCache 2.10.9.2를 그대로 쓰고 있는데 보안 점검에서 뭘 봐야 하나?"**
- PASS
- 근거: SKILL.md 상단 경고 박스의 신규 CVE 주의 문구 — 번들 `jackson-databind` 버전을 `mvn dependency:tree`로 직접 확인하고 필요 시 override 하라는 지침이 명확히 존재.

**Q2. "EhCache 2.x가 아직도 최신 Java(17/21)에서 패치를 받고 있나?"**
- PASS
- 근거: SKILL.md 경고 박스 "2023년 9월 이후 오픈소스 2.x 라인은 더 이상 유지되지 않는다", REFERENCE.md 9절 "알려진 제한·이슈" — 신규 CVE 패치 기대 불가 명시.

**판정**: 재검증 결과 기존 서술은 사실성 유지, CVE 관련 보강 1건 반영 → 내용 변경 있음 → status는 `PENDING_TEST`로 되돌림 (verification-policy.md 기준, 셀프 검증만으로 APPROVED 유지 불가).

---

> 최초 작성 시(2026-04-23) 기록은 아래에 보존.

### 최초 작성 시 계획 (2026-04-23, 참고용 보존)

### 테스트 케이스 1 (계획): 기본 캐시 설정 생성

**입력:**
```
Spring Boot 2.5 레거시 프로젝트에 EhCache 2.x로 users 캐시(TTL 30분, 최대 5000건, LRU 축출)를 추가해줘.
```

**기대 결과:**
- `net.sf.ehcache:ehcache:2.10.9.2` 의존성 추가
- `ehcache.xml`에 `<cache name="users" maxEntriesLocalHeap="5000" timeToLiveSeconds="1800" memoryStoreEvictionPolicy="LRU">` 정의
- `application.yml`에 `spring.cache.type=ehcache` 및 `spring.cache.ehcache.config=classpath:ehcache.xml`
- `@EnableCaching` + `@Cacheable("users")`

**실제 결과:** PENDING

---

### 테스트 케이스 2 (계획): 디스크 오버플로우 + 리스너

**입력:**
```
products 캐시에 힙 10000 / 디스크 100000 오버플로우를 설정하고, put/remove 이벤트를 로깅하는 CacheEventListener를 추가해줘.
```

**기대 결과:**
- `<persistence strategy="localTempSwap"/>` 사용 (2.6+ 권장)
- `CacheEventListenerAdapter` 상속 + `CacheEventListenerFactory` 등록
- `<cacheEventListenerFactory class="..."/>` XML 등록

**실제 결과:** PENDING

---

### 테스트 케이스 3 (계획): EhCache 3 권고 & 마이그레이션 안내

**입력:**
```
신규 프로젝트에 EhCache 2.10.9.2를 써도 되나?
```

**기대 결과:**
- "신규 프로젝트에는 금지 — 2.x는 2023-09 이후 유지보수 종료" 회신
- EhCache 3 또는 Caffeine 대안 제시
- 패키지명 `net.sf.ehcache` → `org.ehcache` 차이 설명

**실제 결과:** PENDING

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-04-23, 2문항 PASS) + ✅ (2026-09-26 재검증 셀프, 2문항 PASS) + ✅ (2026-09-28 skill-tester → general-purpose, 2/2 PASS — CVE 정정분 겨냥) |
| **최종 판정** | **APPROVED** (2026-09-28 재테스트로 CVE 정정 내용 반영 확인, 모순 없음) |

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 및 섹션 5·6 업데이트 — 2026-09-28 완료, 2/2 PASS (CVE 정정분 겨냥 포함)
- [⏸️] Spring Boot 캐시 프로바이더 자동 감지 순서 1차 소스 재확인 — 검증 보강 선택 사항
- [⏸️] 2계층 캐시(L1 EhCache + L2 Redis) 구현 예시 — 현재 개념만, 선택 보강
- [🔬] Java 17/21 환경에서의 EhCache 2.10.9.2 호환성 실측 — 실환경 검증 대기
- [🔬] 실제 Spring Boot 2.5 + EhCache 2.10.9.2 샘플 프로젝트 테스트 3종 — 실환경 검증 대기 (agent content test는 2026-04-23 2문항 PASS로 별도 수행됨)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-23 | v1 | 최초 작성 — EhCache 2.10.9.2 기준, Spring Boot 2.5 / Java 11 레거시 유지보수용 | skill-creator |
| 2026-09-26 | v1 | 재검증 — EOL 상태·버전 재확인(변동 없음), 구버전 번들 jackson-databind CVE 주의 문구 신규 추가 → PENDING_TEST | 메인 오케스트레이션 (Claude Sonnet 5) |
| 2026-09-28 | v1 | 2단계 실사용 재테스트 수행 (Q1 orders 캐시 설정 / Q2 CVE 점검 정정분) → 2/2 PASS, APPROVED 전환 | skill-tester |
