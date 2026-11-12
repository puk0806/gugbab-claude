---
name: redis-redisson-4
description: Redisson 4.x(4.0.0~4.8.x) 변경점 — 3.x→4.x Breaking Change 전체(Config 최상위 재편·JSON 설정 제거·패키지 이동·RScript enum 개명·Spring Cache/Transaction 모듈 분리·코덱 제거·4.2~4.8 시그니처 변경), deprecated 대체표, Spring Boot 3.x 유지 시 spring-data 모듈 exclude, spring.redis.redisson 키, 4.4 NonReentrantLock·GCRA, getMapCacheNative 조건, 커뮤니티/PRO 구분, 마이그레이션 체크리스트
---

# Redisson 4.x (Valkey & Redis Java Client)

> 소스: https://github.com/redisson/redisson/releases/tag/redisson-4.0.0 | https://raw.githubusercontent.com/redisson/redisson/master/CHANGELOG.md | https://github.com/redisson/redisson (README) | https://redisson.pro/docs/configuration/ | https://redisson.pro/docs/integration-with-spring/ | https://redisson.pro/docs/data-and-services/data-serialization/ | 소스 코드: `org/redisson/config/Config.java`, `BaseConfig.java`, `org/redisson/api/RLock.java`, `RBucket.java`, `redisson-spring/redisson-spring-boot-starter/pom.xml`
> 검증일: 2026-11-09

---

## 이 스킬의 범위

**4.x에서 달라진 것과 3.x→4.x 마이그레이션**만 담는다. RLock·RMap·RBucket·RTopic 기본 사용법(2.x·3.x·4.x 거의 동일)과 커넥션 풀 설정은 공식 문서 수준이라 싣지 않는다. 2.15.2 레거시는 `redis-redisson-legacy`.

- 2.x → 4.x 직행은 권장하지 않는다. 2.x → 3.x 안정화 → 4.x 두 단계로 나눈다(2.x→3.x는 패키지·`RFuture` 시그니처가 통째로 바뀌므로 4.x 변경과 섞으면 원인 추적이 불가능해진다).

---

## 1. 버전·호환성 매트릭스

| 항목 | 값 |
|------|-----|
| 4.x 최신 안정판 | **4.8.0** (2026-10-02) |
| 4.0.0 최초 릴리스 | **2025-12-16** |
| 주요 중간 릴리스 | 4.1.0(2025-12-30), 4.2.0(2026-02-05), 4.3.0(2026-03-02), 4.4.0(2026-05-12), 4.5.0(2026-06-05), 4.6.0(2026-06-15), 4.6.1(2026-06-18), 4.7.0(2026-08-04) |
| **최소 JDK** | **Java 8+** (상향 없음) |
| Redis / Valkey | 3.0 ~ 최신 / 7.2.5 ~ 최신 |
| **라이선스** | **Apache License 2.0 — 변경 없음**. 상용 Redisson PRO(`pro.redisson:redisson`)는 별도(4.x 신설 아님) |

> 주의: **4.x는 Java 버전 상향을 요구하지 않는다.** "메이저 버전 올리면 Java 17 필요하겠지"라는 가정으로 JDK를 먼저 올리지 말 것. 다만 Spring Boot 4.x 스타터를 함께 쓴다면 **Spring Boot 4.x가 요구하는 JDK**(17 이상)를 따라야 한다 — 제약의 출처는 Redisson이 아니라 Spring Boot다.

> 주의: 라이선스는 Apache 2.0 그대로다. 단, **일부 신규 기능은 커뮤니티 에디션에 없다**(§6 참조). 릴리스 노트 헤드라인 기능을 무료 에디션 기준으로 착각하지 말 것.

### Spring Boot 호환

`redisson-spring-boot-starter`는 Spring Boot **1.3.x ~ 4.1.x**를 커버하며, 스타터는 **가장 최신 Boot에 맞는 `redisson-spring-data-XX` 모듈을 기본 번들**한다: 4.8.0·4.7.0 = `-41`(Boot 4.1.x), 4.6.1 = `-40`. 모듈은 `-16 … -27 -30 -31 -32 -33 -34 -35 -40 -41`이 존재 → **Boot 3.0~3.5는 `-30`~`-35`로 4.x에서도 계속 지원**.

> 주의: **"Redisson 4.x = Spring Boot 4.x 필수"가 아니다.** Spring Boot 3.x에 머문 채 Redisson만 4.x로 올리는 것이 가능하며, 이 경우 스타터가 끌어오는 `redisson-spring-data-41`을 **exclude하고 자기 Boot 버전에 맞는 모듈을 직접 선언**해야 한다. 이것을 놓치면 Spring Data Redis 4.1 클래스가 클래스패스에 섞여 `NoSuchMethodError`/`ClassNotFoundException`이 런타임에 터진다.

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>4.8.0</version>
    <exclusions>
        <exclusion><groupId>org.redisson</groupId><artifactId>redisson-spring-data-41</artifactId></exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-data-35</artifactId>   <!-- Spring Boot 3.5 -->
    <version>4.8.0</version>
</dependency>
```

### Spring Cache / Transaction — 별도 의존성 필수 (4.1.0)

스타터 `pom.xml`은 `redisson-spring-cache`·`redisson-spring-transaction`을 **`<optional>true</optional>`** 로 선언 → 전이되지 않는다. 쓰려면 `org.redisson:redisson-spring-cache` / `redisson-spring-transaction`(4.8.0)을 직접 추가.

> 주의: 3.x에서 4.x로 올린 직후 가장 많이 터지는 컴파일 에러가 `RedissonSpringCacheManager` / `RedissonTransactionManager` **미해결(cannot find symbol)**이다. 코드가 잘못된 게 아니라 **모듈이 분리**된 것이다(4.1.0).

---

## 2. 3.x → 4.x Breaking Change

### 4.0.0 (2025-12-16)

| # | 변경 | 영향 |
|---|------|------|
| 1 | **JSON 설정 포맷 지원 제거** | `Config.fromJSON()`/`toJSON()`·`.json` 파일 → `Config.fromYAML()` |
| 2 | **인증 파라미터가 `Config` 최상위로 이동** | `useSingleServer().setPassword(...)` → `config.setPassword(...)` |
| 3 | **`nameMapper` / `commandMapper` 최상위 이동** | 서버 블록 → 루트 |
| 4 | **ssl 파라미터 최상위 이동** | `setSslKeystore`·`setSslTruststore`·`setSslVerificationMode` 등 |
| 5 | **tcp / keepAlive 최상위 이동** | `setTcpNoDelay`·`setTcpKeepAlive*`·`setTcpUserTimeout` |
| 6 | `getNodesGroup()`·`getClusterNodesGroup()` **제거** | 노드 조회 재작성 |
| 7 | `RGeo`·`RFuture`의 deprecated 메서드 **제거** | |
| 8 | **Spring XML 설정(`<redisson:client/>`) 제거** | Java Config로. XML 의존 프로젝트는 최대 작업량 |
| 9 | **Redisson 자체 Spring Session 구현 제거** | 표준 `spring-session-data-redis` + `RedissonConnectionFactory` |
| 10 | `RScript.ReturnType` `MULTI`→**`LIST`**, `STATUS`→**`STRING`**, `INTEGER`→**`LONG`** | 컴파일 에러 |
| 11 | `NameMapper`, `NatMapper` → **`org.redisson.config`** | import |
| 12 | `GeoUnit`, `GeoPosition`, `GeoOrder`, `GeoEntry` → **`org.redisson.api.geo`** | import |
| 13 | `StreamConsumer`, `StreamGroup`, `StreamInfo`, `StreamMessageId`, `PendingEntry`, `PendingResult`, `AutoClaimResult`, `FastAutoClaimResult` → **`org.redisson.api.stream`** | import |
| 14 | Config 파싱이 SnakeYAML 직접 사용 | 비표준 YAML(탭 들여쓰기, 중복 키 등)이 실패할 수 있음 |

import 일괄 치환 정규식(검토 후 적용):

```
org\.redisson\.api\.(NameMapper|NatMapper)                   → org.redisson.config.$1
org\.redisson\.api\.(GeoUnit|GeoPosition|GeoOrder|GeoEntry)  → org.redisson.api.geo.$1
org\.redisson\.api\.(Stream(Consumer|Group|Info|MessageId)|PendingEntry|PendingResult|(Fast)?AutoClaimResult) → org.redisson.api.stream.$1
```

### 4.1.0 (2025-12-30)

- Spring Cache → `redisson-spring-cache`, Spring Transaction → `redisson-spring-transaction` 모듈 분리
- **코덱 제거**: `FstCodec`→`Kryo5Codec`, `FuryCodec`→**`ForyCodec`**, `MarshallingCodec`→`Kryo5Codec`(또는 `SerializationCodec`), `SnappyCodec`→**`SnappyCodecV2`**. 설정에 남아 있으면 클래스 미존재로 기동 실패

### 4.2.0 이후

| 버전 | 변경 |
|------|------|
| 4.2.0 (2026-02-05) | `RSet.containsEach()` 반환 타입이 **`Set`으로 변경**. `JsonJackson3Codec`(Jackson 3) 추가 |
| 4.4.0 (2026-05-12) | `getNonReentrantLock()`·`getNonReentrantFairLock()`(같은 스레드 재획득 시 `IllegalMonitorStateException`), GCRA 레이트 리미터, `RRateLimiter.set()`/`update()`(기존 설정 덮어쓰기 — `trySetRate`는 이미 있으면 무시) |
| 4.5.0 (2026-06-05) | **map listener 시그니처 변경** — field name 파라미터 추가. `EntryCreatedListener` 등 커스텀 구현체 전부 수정 |
| 4.7.0 (2026-08-04) | `@RFieldAccessor` deprecated → **`@RGetter` / `@RSetter`** (Live Object) |
| 4.8.0 (2026-10-02) | 제거·시그니처 변경 없음(기능 추가 릴리스). `RTimeSeries` 옛 `add()` 들 deprecated → `add(TimeSeriesAddArgs)`, `FailedNodeDetector` 옛 메서드 deprecated(노드 주소 받는 메서드로). `JsonJacksonCodec`/`JsonJackson3Codec` 에 역직렬화 허용 클래스 제한 `allowedClasses` 설정 추가. Redisson AI(`RVectorStore`·`RSemanticCache` 등) 객체 추가 — **PRO 전용**(공식 AI 문서 명시, §6) |

### 4.x에서 deprecated (지금 고쳐두면 다음 메이저에서 안 터짐)

| Deprecated | 대체 |
|------------|------|
| `BaseConfig`의 인증 setter(`setPassword`/`setUsername`/`setCredentialsResolver`), `setSsl*`, `setTcpNoDelay`, `setTcpKeepAlive*`, `setTcpUserTimeout`, `setKeepAlive`, `setNameMapper`/`setCommandMapper` | 동명의 `Config.setXxx` |
| `setRetryInterval(int)` | **`setRetryDelay(DelayStrategy)`** — `org.redisson.config`의 `ConstantDelay(Duration)`(3.x와 동등), `EqualJitterDelay`·`FullJitterDelay`·`DecorrelatedJitterDelay(base, max)`. 다수 인스턴스 동시 재접속엔 jitter 계열 |
| `setSslEnableEndpointIdentification(boolean)` | **`setSslVerificationMode(SslVerificationMode)`** |
| `RBucket.set/getAndSet/setIfExists/trySet(V, long, TimeUnit)` | **`set/getAndSet/setIfExists(V, Duration)`**, `trySet` → **`setIfAbsent`** |
| `RedissonClient.getRedLock(...)` | `getLock()` 또는 **`getFencedLock()`** |

> 주의: `BaseConfig`의 이동 대상 setter들은 **제거된 게 아니라 `@Deprecated`로 남아 있다.** 그래서 3.x 코드가 **컴파일은 그대로 통과**한다. "빌드 됐으니 마이그레이션 끝"이라고 판단하면 안 된다 — 특히 **YAML 설정 파일은 컴파일 대상이 아니므로 조용히 무시되거나 파싱 오류로 기동 시점에 터진다.** YAML의 `username`·`password`·`tcpNoDelay`·`sslVerificationMode` 등을 `singleServerConfig:` 밖 **루트 레벨로 옮긴다.**

---

## 3. Spring Boot 프로퍼티 키 — 변경 없음

> 주의: Redisson 전용 키는 4.x에서도 여전히 **`spring.redis.redisson.config` / `spring.redis.redisson.file`** 두 개뿐이다(`@ConfigurationProperties(prefix = "spring.redis.redisson")`). `spring.data.redis.redisson.*`로 옮기면 **조용히 무시**된다 — 3.x와 동일한 함정이다.

(Boot 3.x·4.x의 일반 Redis 키는 `spring.data.redis.*`, Boot 2.7 이하는 `spring.redis.*`.)

---

## 4. 락·자료구조 — 4.x 기준 유의점

- **`RLock` 인터페이스는 4.x에서 변경되지 않았다** — 3.x 코드 그대로 동작. `leaseTime`을 명시하면 watchdog(기본 30,000ms)은 동작하지 않으며, 만료된 락 `unlock()`은 `IllegalMonitorStateException` → `acquired && isHeldByCurrentThread()` 체크는 그대로 필요.
- watchdog은 JVM이 살아 있는 한 계속 연장 → GC 폭주 등으로 멈춘 채 살아 있으면 락이 오래 안 풀린다. 작업 상한이 예측 가능하면 `leaseTime` 명시.
- `RLock`은 pub/sub으로 해제 통지를 받는다 → 락이 많으면 `subscriptionConnectionPoolSize`가 먼저 마른다 → `getSpinLock()` 검토.
- `RSemaphore.releaseIfExists()`(4.0.0 신규, 객체 없으면 no-op).
- `RMap.fastPut`/`fastRemove`는 이전 값을 돌려받지 않아 왕복 절약. `keySet()`·`values()`·`entrySet()`는 전체 스캔.
- `getMapCacheNative(name)` = 엔트리별 TTL을 서버 측 필드 만료로 처리, **Redis 7.4+ / Valkey 9.0+** 필요. `getMapCache()`는 클라이언트 eviction 태스크가 돈다.

> 주의(2026-09-26 정정): 기본판 `getMapCacheNative()`(Redis 7.4+/Valkey 9.0+)는 **커뮤니티 에디션에서도 사용 가능**하다 — 이전 버전 문서에서 PRO 전용으로 잘못 기재했던 항목. 단 `getMapCacheNativeV2()`(사이즈 제한)와 클러스터 대응 변종은 공식 docs에서 **Redisson PRO 전용**으로 명시된다. 고급 변종이 필요 없다면 기본 `getMapCacheNative()`로 충분하고, PRO 기능이 필요한 경우에만 `getMapCache()`(스크립트 eviction) 또는 개별 `RBucket` 분리 설계로 대체한다.

> 주의: Cluster 모드는 `database` 인덱스를 쓸 수 없다(Redis Cluster는 DB 0만 허용). 논리 분리는 키 프리픽스나 `nameMapper`로 한다 — 4.x에서 `nameMapper`는 **`Config` 최상위**에 설정한다.

---

## 5. 코덱

**기본 코덱: `org.redisson.codec.Kryo5Codec`**. Jackson 3 앱은 `JsonJackson3Codec`(4.2.0), `FuryCodec` 후속은 `ForyCodec`.

> 주의: 코덱 교체는 **저장 포맷 변경**이다. 이미 Redis에 들어 있는 값은 새 코덱으로 역직렬화되지 않는다. 마이그레이션 시 ① 캐시성 데이터는 키 프리픽스를 바꿔 자연 소멸시키거나 ② 영속 데이터는 이관 배치를 돌린다. **무중단 배포 중 두 버전이 공존하면 양쪽 다 깨진다** — 프리픽스 분리가 가장 안전하다.

---

## 6. 4.x 신규 기능 — 커뮤니티/PRO 구분

| 기능 | 버전 | 에디션 |
|------|------|--------|
| Reliable Pub/Sub (`RReliablePubSubTopic`, ACK, Dead Letter Topic, seek/replay) | 4.0.0 | **PRO 전용** — docs 명시 "This feature is available only in Redisson PRO edition" |
| Spring Boot 4.0 / Spring Data Redis 4.0 모듈, Quarkus 3.30.x | 4.0.0 | 커뮤니티 |
| Spring AI Vector Store, Jackson3 코덱군, `RBloomFilterNative`(`BF.*`) | 4.2.0 | 커뮤니티 |
| JMS API 구현, `RCuckooFilter` | 4.3.0 | 커뮤니티 |
| GCRA Rate Limiter, Non-Reentrant Lock, Hibernate 7.3.x, io_uring 전송 | 4.4.0 | 커뮤니티 |
| Micronaut 5.0, Array/BitVector Store 컬렉션 | 4.5.0 | 커뮤니티 |
| T-digest / Top-k 확률형 자료구조, Spring Boot·Data Redis 4.1 | 4.6.0 | 커뮤니티 |
| `RMaps`(벌크 맵 연산), 배열 기반 Circular Buffer, `@RGetter`/`@RSetter` | 4.7.0 | 커뮤니티 |
| Redisson AI — `REmbeddingModel`·`REmbeddingsCache`·`RVectorStore`·`RSemanticCache`·`RAgentMemory`, Spring AI 2.0 Chat Memory·Semantic Cache | 4.8.0 | **PRO 전용** — AI 문서 "This feature is available only in Redisson PRO edition" |
| Count-min sketch(`RCountMin`), Time Series(Native), Valkey 8.0+ AZ affinity 읽기 모드, Fory JSON 코덱, `JsonJacksonCodec.allowedClasses` | 4.8.0 | 커뮤니티 CHANGELOG 수록 — 에디션 표기는 > 주의: 미검증(공식 비교표로 확인) |

> 주의: 릴리스 노트 헤드라인 기능이라도 PRO 전용일 수 있다. 특히 **Reliable Pub/Sub는 4.0의 대표 기능이지만 커뮤니티 에디션에서는 쓸 수 없다.** 커뮤니티에서 신뢰성 있는 메시징이 필요하면 `RStream`(Redis Streams) + consumer group을 사용한다.

---

## 7. 마이그레이션 체크리스트 (3.x → 4.x)

1. [ ] Spring Boot 버전 고정 — Boot 3.x 유지면 `redisson-spring-data-41` **exclude + 3X 모듈 명시**
2. [ ] `redisson-spring-cache` / `redisson-spring-transaction` 의존성 추가
3. [ ] `.json` 설정 → **YAML**, 인증·`ssl*`·`tcp*`·`nameMapper` 키를 **루트 레벨로**
4. [ ] Java Config `useXxxServer().setPassword/setSsl*/setTcp*` → `config.setXxx()`, `setRetryInterval` → `setRetryDelay`, `setSslEnableEndpointIdentification` → `setSslVerificationMode`
5. [ ] `RScript.ReturnType` MULTI/STATUS/INTEGER → LIST/STRING/LONG, import 이관 3종
6. [ ] `getNodesGroup()`·`getClusterNodesGroup()` 제거, Spring XML → Java Config, 자체 Spring Session → `spring-session-data-redis`
7. [ ] 제거된 코덱 사용 여부 + **저장 데이터 호환성 계획**
8. [ ] `RSet.containsEach()`(4.2.0), map listener 시그니처(4.5.0) 확인
9. [ ] 스테이징에서 **기동(설정 파싱) → 락 획득/해제 → 캐시 read/write → 페일오버** 순 검증

> 컴파일 성공은 마이그레이션 완료 신호가 아니다. 이동된 setter들이 `@Deprecated`로 남아 있고, YAML은 컴파일되지 않는다. **반드시 기동 + 실제 명령 실행까지 확인**한다.
