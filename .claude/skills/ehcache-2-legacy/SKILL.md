---
name: ehcache-2-legacy
description: EhCache 2.10.x 레거시(Spring Boot 2.5 + Java 11) 함정과 3.x API 섞기 막기 — FOSS 유지 종료·번들 jackson-databind CVE, net.sf.ehcache vs org.ehcache, Boot 2.5 캐시 공급자 감지 순서(JCache 가 먼저 잡혀 ehcache.xml 무시), Spring 6 에서 org.springframework.cache.ehcache 삭제, persistence 전략 OSS/상용 경계, setShared·updateCheck·리스너 동기 호출, 2.x vs 3.x 차이·3.11.1/3.12.x 이전 대상
---

# EhCache 2.10.x 레거시 스킬 (Spring Boot 2.5 + Java 11)

> 소스: https://www.ehcache.org/documentation/2.8/ | https://www.ehcache.org/apidocs/2.10.4/ | https://github.com/ehcache/ehcache2 | https://docs.spring.io/spring-boot/docs/2.5.x/reference/html/features.html#features.caching.provider | https://github.com/spring-projects/spring-framework/wiki/Spring-Framework-6.0-Release-Notes | https://repo1.maven.org/maven2/org/ehcache/ehcache/maven-metadata.xml
> 검증일: 2026-11-09 (2026-04-23 최초 검증 · 이전 2026-09-26 · 재검증 이력은 verification.md 8절 참조)

> **⚠️ 중요 경고 — 신규 프로젝트 금지**
>
> - EhCache 2.x는 **FOSS 유지보수 종료 상태**다. 공식 공지에 따르면 2023년 9월 이후 오픈소스 2.x 라인은 더 이상 유지되지 않는다.
> - 2.10.9.2 (2021-04-24 릴리스)가 사실상 마지막 OSS 패치이며, 이후 보안 패치도 매우 드물다.
> - **신규 프로젝트는 반드시 EhCache 3.x(JSR-107) 또는 Caffeine을 사용하라.** 이 스킬은 이미 EhCache 2.x로 운영 중인 Spring Boot 2.5 / Java 11 **레거시 시스템의 유지·보수**를 위한 것이다.
> - 클러스터(Terracotta) 구성은 상용 라이선스 이슈가 있다 — Fast Restartability(`LOCALRESTARTABLE`), BigMemory 등은 엔터프라이즈 상용 제품 기능이며 OSS에서는 `LOCALTEMPSWAP` 및 non-clustered 로컬 캐시만 자유롭게 사용 가능.
> - **주의 (CVE, 2026-09-26 추가):** `net.sf.ehcache:ehcache:2.10.6` 등 구버전에는 재패키징된 `jackson-databind 2.9.6`이 번들되어 있고, 이 버전대에는 다수의 공개 CVE(역직렬화 계열)가 존재한다. 2.10.9.2를 쓰더라도 번들 `jackson-databind`가 최신인지 `mvn dependency:tree`로 직접 확인하고, 필요하면 `<dependencyManagement>`로 안전한 버전을 강제 override할 것 — EhCache 2.x는 더 이상 이 의존성을 갱신하지 않는다.

---

## 이 스킬의 범위

`ehcache.xml` 속성(maxEntriesLocalHeap·TTL/TTI·LRU/LFU/FIFO), `@Cacheable`·키 생성 규칙, `Element` 기반 직접 API, 리스너 작성 같은 기본 사용법은 공식 문서 수준이라 싣지 않는다. 여기엔 **2.x 고정 환경의 함정과, 3.x/JCache 문서를 2.x에 잘못 쓰지 않도록 하는 경고**만 둔다.

---

## 1. 좌표·Spring 연동 함정

- 좌표는 **`net.sf.ehcache:ehcache:2.10.9.2`**(2.10 브랜치 마지막 공개 릴리스). EhCache 3.x는 **`org.ehcache`** — 완전히 다른 아티팩트다. 두 JAR을 섞지 말 것.
- Boot 2.5는 Spring Framework의 `org.springframework.cache.ehcache.EhCacheCacheManager`·`EhCacheManagerFactoryBean`으로 2.x를 지원한다. 설정: `spring.cache.type: ehcache` + `spring.cache.ehcache.config: classpath:ehcache.xml`.
- 3.x XML을 2.x에 쓰면 안 된다 — XSD가 완전히 다르다(2.x는 `http://www.ehcache.org/ehcache.xsd`).

> 주의: Spring Boot 2.5 는 `CacheManager` 빈(또는 `cacheResolver`)이 없으면 **Generic → JCache(JSR-107: EhCache 3·Hazelcast·Infinispan 등) → EhCache 2.x → Hazelcast → Infinispan → Couchbase → Redis → Caffeine → Simple** 순으로 공급자를 감지한다. `Cache` 빈이 하나라도 있으면 Generic 이, EhCache 3 등 JSR-107 공급자 JAR 이 클래스패스에 있으면 JCache 가 먼저 잡혀 `ehcache.xml`(2.x) 설정이 무시될 수 있다. 위 예처럼 `spring.cache.type: ehcache`로 강제하고 2.x 단독 사용을 확인할 것.
>
> 주의: **Spring Framework 6(Spring Boot 3)에서 `org.springframework.cache.ehcache` 패키지(`EhCacheCacheManager`·`EhCacheManagerFactoryBean`)가 삭제**됐다. Boot 3 로 올리려면 EhCache 2.x 를 그대로 쓸 수 없고, EhCache 3(JCache, jakarta 분류자 `org.ehcache:ehcache:3.12.x:jakarta`) 또는 Caffeine 으로 바꿔야 한다.

- 수동 Bean 구성 시 `EhCacheManagerFactoryBean.setShared(true)` — 안 하면 `CacheManager.getInstance()`와 Spring Bean이 **다른 인스턴스**가 된다. `@Bean(destroyMethod = "shutdown")`로 디스크 스토어·스레드 정리.
- `<ehcache updateCheck="false">` — 기본값이면 EhCache 공식 서버로 외부 HTTP 호출이 나간다.
- `ehcache.xml`에 없는 캐시명은 `defaultCache` 템플릿으로 런타임 생성된다(오타가 조용히 새 캐시가 됨).

---

## 2. 디스크 저장 — OSS/상용 경계

EhCache 2.6부터 `overflowToDisk` / `diskPersistent` 속성은 `<persistence strategy="...">`로 **대체**되었다. 2.10에서도 속성 자체는 동작하지만 신규 구성은 `<persistence>`를 쓰는 편이 낫다.

| 전략 | 효과 | 라이선스 |
|------|------|---------|
| `none` | 디스크 미사용 (힙 전용) | OSS |
| `localTempSwap` | 힙 초과분을 디스크로 스왑. 재시작 시 날아감 (`overflowToDisk="true"` ≈ 이것) | OSS |
| `localRestartable` | 재시작 후에도 복구 (Fast Restartability) | **Enterprise 상용** |
| `distributed` | Terracotta 클러스터 | **Enterprise 상용** |

> 주의: `localRestartable`, `distributed`는 BigMemory / Terracotta 엔터프라이즈 라이선스가 필요하다. OSS 환경에서는 `localTempSwap`까지만 쓸 수 있다.

- `diskPersistent="true"`는 엔터프라이즈 기능으로 대체됨 — OSS에서 재시작 영속성은 신뢰할 수 없다.
- 속성명 오타(`overFlowToDisk`)는 무시되거나 경고만 남는다 — 대소문자 정확히.
- `diskStore path`는 `java.io.tmpdir` 심볼 사용, 컨테이너에선 쓰기 권한 확인. `diskExpiryThreadIntervalSeconds`(기본 120)를 너무 작게 하면 디스크 락 경합.
- `statistics="true"` 속성은 2.7에서 deprecated, 2.8+에서는 설정 API로 통일(2.10에서도 태그는 있으나 제한적).

---

## 3. 리스너

> 주의: 콜백은 **동기·동일 스레드**에서 호출된다. 리스너에서 오래 걸리는 작업(외부 HTTP 호출 등)을 하면 `cache.put()` 등이 블로킹된다. 필요하면 내부에서 별도 스레드로 위임한다.

`CacheEventListener`를 직접 구현하면 `notifyRemoveAll`·`dispose`·`clone`까지 다뤄야 하므로 `CacheEventListenerAdapter` 상속 권장. XML 등록에는 `CacheEventListenerFactory` 서브클래스가 필요.

---

## 4. Redis 2계층(L1=EhCache, L2=Redis)

> 주의: Spring Cache 추상화 자체는 계층 조회를 기본 제공하지 않는다. 2계층 동작을 원하면 `AbstractValueAdaptingCache`를 상속한 커스텀 래퍼가 필요하다.

L1은 노드 간 동기화가 없어 stale이 생긴다 → L1 TTL을 L2보다 훨씬 짧게(예: 30초 vs 10분) + 갱신 시 Redis Pub/Sub으로 각 노드 L1 무효화.

---

## 5. 2.x vs 3.x — 3.x API를 2.x에 쓰지 말 것

| 항목 | 2.x | 3.x |
|------|-----|-----|
| Maven groupId | `net.sf.ehcache` | `org.ehcache` |
| 주요 API | `net.sf.ehcache.Cache`, `Element` 래퍼, `Object` 기반 | `org.ehcache.Cache<K, V>`, JSR-107 `javax.cache.Cache` |
| JSR-107 | 별도 `ehcache-jcache` 모듈 필요 | **내장 지원** |
| 설정 XML | 자유로운 속성 | 엄격한 XSD, resources → expiry 순서 고정 |
| 축출 정책 | `LRU`/`LFU`/`FIFO` 선택 | 기본 `LRU`(힙), `LFU`(디스크) — 선택 불가 |
| CacheManager | `CacheManager.getInstance()` 싱글턴 | `CacheManagerBuilder` / `Caching.getCachingProvider()` |
| Listener | `CacheEventListenerFactory` | JSR-107 `CacheEntryListenerConfiguration` |
| 유지보수 | **종료(2023-09)** | 활성 (3.11.1 부터 IBM 소유 하에 릴리스) |

신규 JDK: Java 17/21 동작 보고는 있으나 공식 지원 매트릭스는 8/11 기준(모듈 시스템 이슈 가능).

### 3.x 이전 시

1. 의존성 교체: `net.sf.ehcache:ehcache:2.10.x` → `org.ehcache:ehcache:3.12.x` (2026-11 기준 Maven Central 최신 3.12.0 · 3.11 릴리스 노트상 3.11 이 Java 8 지원 마지막 라인이고 다음 라인은 Java 17 기준 — Java 11 레거시가 당장 옮길 대상은 3.11.1. > 주의: 3.12.0 의 Java 기준은 GitHub 릴리스 노트가 없어 미검증) + JSR-107 `javax.cache:cache-api`. Spring Boot 3(Spring 6, Jakarta) 에서는 `jakarta` 분류자 아티팩트를 쓴다
   - Spring 6 에서 `org.springframework.cache.ehcache` 패키지가 삭제됐으므로 Spring 쪽은 `org.springframework.cache.jcache.JCacheCacheManager`(Boot 는 `spring.cache.type: jcache` 자동 구성)로 바꾼다
2. `ehcache.xml` 전면 재작성 — XSD가 완전히 다르므로 수기 변환 필수 (자동 변환 도구 없음)
3. `Element` 래핑 제거, 리스너는 `CacheEventListener<K, V>` + `CacheEventListenerConfigurationBuilder`로 재작성
4. eviction 타이밍·만료 검사 주기가 동일하지 않으므로 테스트 보강. 로컬 캐시만 쓴다면 Caffeine 대체도 고려
