## 5. 분산 락 (RLock)

**`RLock` 인터페이스는 4.x에서 변경되지 않았다** — 3.x 코드가 그대로 동작한다.

```java
// org.redisson.api.RLock — 4.x 기준 주요 시그니처 (deprecated 없음)
boolean tryLock(long waitTime, long leaseTime, TimeUnit unit) throws InterruptedException;
void    lock(long leaseTime, TimeUnit unit);
void    lockInterruptibly(long leaseTime, TimeUnit unit) throws InterruptedException;
boolean isLocked();
boolean isHeldByCurrentThread();
boolean isHeldByThread(long threadId);
int     getHoldCount();
long    remainTimeToLive();
boolean forceUnlock();
```

### 표준 패턴 — try-finally 필수

```java
@Service
@RequiredArgsConstructor
public class OrderService {

    private final RedissonClient redisson;

    public void placeOrder(Long orderId) {
        RLock lock = redisson.getLock("lock:order:" + orderId);
        boolean acquired = false;
        try {
            acquired = lock.tryLock(3, 10, TimeUnit.SECONDS);   // waitTime 3s, leaseTime 10s
            if (!acquired) {
                throw new IllegalStateException("lock not acquired: " + orderId);
            }
            doPlaceOrder(orderId);                              // 임계 영역
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("interrupted while acquiring lock", e);
        } finally {
            if (acquired && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

| 파라미터 | 의미 |
|----------|------|
| `waitTime` | 락 획득 대기 최대 시간. 초과 시 `false` 반환 |
| `leaseTime` | 자동 해제까지의 시간. 이 시간이 지나면 임계 영역 실행 중이어도 풀린다 |

### Watchdog — `leaseTime`을 주지 않을 때만 동작

```java
lock.lock();          // leaseTime 미지정 → lockWatchdogTimeout(기본 30초) 기준으로 자동 갱신
try {
    longRunningJob();
} finally {
    if (lock.isHeldByCurrentThread()) lock.unlock();
}
```

- `Config.setLockWatchdogTimeout(long ms)` — 기본 30,000ms.
- **`leaseTime`을 명시하면 watchdog은 동작하지 않는다.** 둘 중 하나만 쓴다.
- watchdog은 JVM이 살아 있는 한 계속 연장한다 → 프로세스가 멈춘 채 살아 있으면(GC 폭주 등) 락이 오래 풀리지 않을 수 있다. 작업 상한이 예측 가능하면 `leaseTime` 명시가 안전하다.

### 락 종류 선택표 (4.x 기준)

| API | 특성 | 언제 |
|-----|------|------|
| `getLock(name)` | 비공정·**재진입** | 기본 선택 |
| `getFairLock(name)` | FIFO 획득 순서 보장 | 순서 공정성이 요구될 때(성능 저하 감수) |
| `getSpinLock(name)` / `getSpinLock(name, BackOff)` | pub/sub 미사용 | 구독 커넥션이 부족하거나 락 개수가 매우 많을 때 |
| **`getNonReentrantLock(name)`** | 같은 스레드 재획득 시 `IllegalMonitorStateException` | **4.4.0 신규.** 재진입을 버그로 간주하고 조기에 잡고 싶을 때 |
| **`getNonReentrantFairLock(name)`** | 비재진입 + FIFO | 4.4.0 신규 |
| `getFencedLock(name)` | 펜싱 토큰 발급 | 락 만료 후 지연 도착한 작업의 쓰기를 외부 저장소에서 거부해야 할 때 |
| `getMultiLock(locks...)` | 여러 락 원자적 획득 | 다중 리소스 잠금 |
| `getReadWriteLock(name)` | 읽기 다수 / 쓰기 단독 | 읽기 비중이 큰 캐시 갱신 |
| `getRedLock(...)` | **deprecated** | 사용 금지 → `getLock()` 또는 `getFencedLock()` |

```java
// 4.4.0 신규 — 재진입을 허용하지 않는 락
RLock lock = redisson.getNonReentrantLock("lock:job:daily-settlement");
// 같은 스레드가 중첩 호출하면 IllegalMonitorStateException → 재진입 버그를 런타임에 즉시 노출
```

> `leaseTime`이 만료되어 이미 풀린 락을 `unlock()`하면 `IllegalMonitorStateException`이 발생한다. `isHeldByCurrentThread()` 체크는 4.x에서도 그대로 필요하다.

### 세마포어 / 레이트 리미터

```java
RSemaphore sem = redisson.getSemaphore("sem:api:quota");
sem.trySetPermits(10);
if (sem.tryAcquire(1, 3, TimeUnit.SECONDS)) {
    try { callExternalApi(); } finally { sem.release(); }
}
sem.releaseIfExists();   // 4.0.0 신규 — 객체가 없으면 no-op

RRateLimiter limiter = redisson.getRateLimiter("rate:sms");
limiter.trySetRate(RateType.OVERALL, 100, Duration.ofSeconds(1));
limiter.acquire(1);
```

- 4.4.0에서 **GCRA 방식 레이트 리미터**가 추가됐다(버스트 트래픽에 대해 기존 방식보다 매끄럽게 제한).
- 4.4.0에서 `RRateLimiter.set()` / `update()` 메서드가 추가되어 **기존 설정 덮어쓰기**가 가능해졌다(`trySetRate`는 이미 설정돼 있으면 무시된다).

---

## 6. 자료구조 · 캐시 패턴

### RBucket — 단일 값

```java
RBucket<User> bucket = redisson.getBucket("user:1001");
bucket.set(user);
bucket.set(user, Duration.ofMinutes(10));        // TTL (Duration 권장)
bucket.setAndKeepTTL(user);                      // 값만 교체, TTL 유지
boolean created   = bucket.setIfAbsent(user);    // trySet 대체
boolean refreshed = bucket.setIfExists(user, Duration.ofMinutes(10));
boolean swapped   = bucket.compareAndSet(prev, next);
User old = bucket.getAndSet(next);
User v   = bucket.getAndExpire(Duration.ofMinutes(5));
```

### RMap 계열 선택표

| API | TTL | 전제 조건 | 비고 |
|-----|-----|-----------|------|
| `getMap(name)` | 맵 전체 TTL만 | — | 기본 선택 |
| `getMapCache(name)` | **엔트리별 TTL/maxIdle** | — | 클라이언트 측 eviction 태스크가 돈다. 엔트리 수가 많으면 부하 |
| `getMapCacheNative(name)` | **엔트리별 TTL** | **Redis 7.4+ / Valkey 9.0+** | 서버 측 필드 만료 사용, eviction 태스크 없음 |
| `getLocalCachedMap(...)` | 옵션 | — | 로컬 near-cache로 읽기 지연 최소화, 무효화 메시지 전파 |

> 주의: `getMapCacheNative()`·`getMapCacheNativeV2()`는 공식 docs 표에서 **Redisson PRO** 기능으로 표기된다. 커뮤니티 에디션 프로젝트라면 `getMapCache()`(스크립트 eviction) 또는 TTL 필요 엔트리를 개별 `RBucket`으로 분리하는 설계를 택한다.

```java
RMap<String, User> users = redisson.getMap("users");
users.put("u1", user);            // 이전 값을 반환 → 값 전송 발생
users.fastPut("u1", user);        // 이전 값 반환 안 함 → 네트워크 왕복 절약 (반환값 불필요 시 항상 이 쪽)
users.putIfAbsent("u1", user);
Map<String, User> some = users.getAll(Set.of("u1", "u2"));
users.fastRemove("u1", "u2");     // remove()와 달리 이전 값을 가져오지 않음
```

> 주의: `keySet()`·`values()`·`entrySet()`는 **전체 스캔**이다. 대형 맵에서는 `keyIterator()`·`entryIterator()` 같은 스트리밍 API를 쓰거나 아예 호출하지 않는다.

### Cache-Aside 패턴 (락으로 캐시 스탬피드 방지)

```java
public User findUser(Long id) {
    RBucket<User> cache = redisson.getBucket("cache:user:" + id);
    User cached = cache.get();
    if (cached != null) return cached;

    RLock lock = redisson.getLock("lock:cache:user:" + id);
    boolean acquired = false;
    try {
        acquired = lock.tryLock(2, 5, TimeUnit.SECONDS);
        if (!acquired) {
            return userRepository.findById(id).orElseThrow();  // 락 실패 시 DB 직행(폴백)
        }
        User again = cache.get();                              // 이중 확인 — 대기 중 다른 스레드가 채웠을 수 있음
        if (again != null) return again;

        User loaded = userRepository.findById(id).orElseThrow();
        cache.set(loaded, Duration.ofMinutes(10));
        return loaded;
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new IllegalStateException(e);
    } finally {
        if (acquired && lock.isHeldByCurrentThread()) lock.unlock();
    }
}
```

### Spring Cache 통합 (4.1.0 이후 — 모듈 분리 반영)

```java
// build: org.redisson:redisson-spring-cache 의존성 필수 (§2)
import org.redisson.spring.cache.CacheConfig;
import org.redisson.spring.cache.RedissonSpringCacheManager;

@Configuration
@EnableCaching
public class CacheConfiguration {

    @Bean
    public CacheManager cacheManager(RedissonClient redisson) {
        Map<String, CacheConfig> config = new HashMap<>();
        config.put("users", new CacheConfig(60 * 60 * 1000, 30 * 60 * 1000)); // ttl, maxIdleTime (ms)
        return new RedissonSpringCacheManager(redisson, config);
    }
}
```

---

## 7. 직렬화 코덱 선택

**기본 코덱: `org.redisson.codec.Kryo5Codec`** (설정 미지정 시).

| 코덱 | 특성 | 언제 |
|------|------|------|
| `Kryo5Codec` | 바이너리, 빠르고 작음 | **기본값.** Java↔Java 전용 시스템 |
| `JsonJacksonCodec` | JSON, 사람이 읽을 수 있음 | 다른 언어 클라이언트와 공유, `redis-cli`로 값을 직접 봐야 할 때 |
| `JsonJackson3Codec` | Jackson 3 기반 JSON | **4.2.0 신규.** 애플리케이션이 Jackson 3을 쓸 때 |
| `TypedJsonJacksonCodec` / `TypedJsonJackson3Codec` | 타입 고정 JSON | 제네릭 타입 정보 손실 방지 |
| `StringCodec` / `LongCodec` / `ByteArrayCodec` | 원시 타입 | 다른 시스템이 쓴 raw 값을 읽을 때 |
| `ProtobufCodec` | Protobuf | 스키마 계약이 있는 조직 |
| `ForyCodec` | Apache Fory 기반 바이너리 | `FuryCodec`의 후속 |
| `CompositeCodec` | key/value에 서로 다른 코덱 | 키는 String, 값은 바이너리 등 |
| `LZ4Codec` / `LZ4CodecV2` / `ZStdCodec` / `SnappyCodecV2` | 압축 래퍼 | 큰 값 저장 시 다른 코덱을 감싸서 사용 |

### 4.1.0에서 제거된 코덱 → 대체

| 제거됨 | 대체 |
|--------|------|
| `FstCodec` | `Kryo5Codec` |
| `FuryCodec` | **`ForyCodec`** |
| `MarshallingCodec` | `Kryo5Codec` (또는 `SerializationCodec`) |
| `SnappyCodec` | **`SnappyCodecV2`** |

> 주의: 코덱 교체는 **저장 포맷 변경**이다. 이미 Redis에 들어 있는 값은 새 코덱으로 역직렬화되지 않는다. 마이그레이션 시 ① 캐시성 데이터는 키 프리픽스를 바꿔 자연 소멸시키거나 ② 영속 데이터는 이관 배치를 돌린다. **무중단 배포 중 두 버전이 공존하면 양쪽 다 깨진다** — 프리픽스 분리가 가장 안전하다.

---

## 8. 4.x 신규 기능 (커뮤니티/PRO 구분 주의)

| 기능 | 버전 | 에디션 |
|------|------|--------|
| Reliable Pub/Sub (`RReliablePubSubTopic`, subscription/consumer, ACK, Dead Letter Topic, seek/replay) | 4.0.0 | **PRO 전용** — docs 명시 "This feature is available only in Redisson PRO edition" |
| Spring Boot 4.0 / Spring Data Redis 4.0 모듈, Quarkus 3.30.x | 4.0.0 | 커뮤니티 |
| Spring AI Vector Store, Jackson3 코덱군, `RBloomFilterNative`(`BF.*`) | 4.2.0 | 커뮤니티 |
| JMS API 구현, `RCuckooFilter` | 4.3.0 | 커뮤니티 |
| GCRA Rate Limiter, Non-Reentrant Lock, Hibernate 7.3.x, io_uring 전송 | 4.4.0 | 커뮤니티 |
| Micronaut 5.0, Array/BitVector Store 컬렉션 | 4.5.0 | 커뮤니티 |
| T-digest / Top-k 확률형 자료구조, Spring Boot·Data Redis 4.1 | 4.6.0 | 커뮤니티 |
| `RMaps`(벌크 맵 연산), 배열 기반 Circular Buffer, `@RGetter`/`@RSetter` | 4.7.0 | 커뮤니티 |

> 주의: 릴리스 노트 헤드라인 기능이라도 PRO 전용일 수 있다. 특히 **Reliable Pub/Sub는 4.0의 대표 기능이지만 커뮤니티 에디션에서는 쓸 수 없다.** 커뮤니티에서 신뢰성 있는 메시징이 필요하면 `RStream`(Redis Streams) + consumer group을 사용한다.

---

## 9. 커넥션 풀 설정

`SingleServerConfig`의 풀 관련 setter는 4.x에서 변경·deprecated 없음.

```yaml
singleServerConfig:
  address: "redis://127.0.0.1:6379"
  connectionPoolSize: 64                    # 기본 64
  connectionMinimumIdleSize: 24             # 기본 24
  subscriptionConnectionPoolSize: 50        # 기본 50
  subscriptionConnectionMinimumIdleSize: 1  # 기본 1
  subscriptionsPerConnection: 5
  idleConnectionTimeout: 10000
  connectTimeout: 10000
  timeout: 3000
  retryAttempts: 3
  pingConnectionInterval: 30000
  dnsMonitoringInterval: 5000
threads: 16          # Redisson 작업 스레드
nettyThreads: 32     # Netty I/O 스레드
```

| 설정 | 튜닝 관점 |
|------|-----------|
| `connectionPoolSize` | 락 대기가 많은 워크로드는 상향. 단, Redis 서버의 `maxclients`와 인스턴스 수를 곱해 초과하지 않도록 |
| `subscriptionConnectionPoolSize` | **`RLock`은 pub/sub으로 해제 통지를 받는다.** 락 사용량이 많으면 이 풀이 먼저 마른다 → `getSpinLock()` 검토 |
| `pingConnectionInterval` | 방화벽/LB의 idle 커넥션 끊김 방지. 클라우드 환경에서는 반드시 설정 |
| `timeout` vs `connectTimeout` | 전자는 명령 응답 대기, 후자는 TCP 연결 수립. 혼동 주의 |
| `retryAttempts` + `retryDelay` | `retryAttempts × retryDelay`가 상위 HTTP 타임아웃을 넘지 않도록 계산 |

> 주의: Cluster 모드는 `database` 인덱스를 쓸 수 없다(Redis Cluster는 DB 0만 허용). 논리 분리는 키 프리픽스나 `nameMapper`로 한다 — 4.x에서 `nameMapper`는 **`Config` 최상위**에 설정한다.

---

## 10. 마이그레이션 체크리스트 (3.x → 4.x)

1. [ ] Spring Boot 버전을 먼저 고정한다 — Boot 3.x 유지면 `redisson-spring-data-41` **exclude + 3X 모듈 명시**
2. [ ] `redisson-spring-cache` / `redisson-spring-transaction` 의존성 추가 (Spring Cache·Transaction 사용 시)
3. [ ] `.json` Redisson 설정 파일 → **YAML 변환**
4. [ ] YAML의 인증·`ssl*`·`tcp*`·`nameMapper` 키를 **루트 레벨로 이동**
5. [ ] Java Config의 `useXxxServer().setPassword/setSsl*/setTcp*` → `config.setXxx()`로 이동
6. [ ] `setRetryInterval` → `setRetryDelay(DelayStrategy)` / `setSslEnableEndpointIdentification` → `setSslVerificationMode`
7. [ ] `RScript.ReturnType` MULTI/STATUS/INTEGER → LIST/STRING/LONG
8. [ ] import 이관 3종 (`org.redisson.config`, `org.redisson.api.geo`, `org.redisson.api.stream`)
9. [ ] `getNodesGroup()`·`getClusterNodesGroup()` 호출부 제거
10. [ ] Spring XML 설정 → Java Config
11. [ ] Redisson 자체 Spring Session → `spring-session-data-redis`
12. [ ] 제거된 코덱(`FstCodec`/`FuryCodec`/`MarshallingCodec`/`SnappyCodec`) 사용 여부 확인 + **저장 데이터 호환성 계획**
13. [ ] `RSet.containsEach()` 반환 타입(4.2.0), map listener 시그니처(4.5.0) 사용 여부 확인
14. [ ] 스테이징에서 **기동(설정 파싱) → 락 획득/해제 → 캐시 read/write → 페일오버** 순으로 검증

> 컴파일 성공은 마이그레이션 완료 신호가 아니다. 이동된 setter들이 `@Deprecated`로 남아 있고, YAML은 컴파일되지 않는다. **반드시 기동 + 실제 명령 실행까지 확인**한다.

---

## 11. 이 스킬을 쓸 때 / 쓰지 않을 때

| 상황 | 판단 |
|------|------|
| Redisson 4.x 신규 프로젝트 | ✅ 이 스킬 |
| 3.x → 4.x 업그레이드 | ✅ 이 스킬 (+ 기존 코드 이해는 `redis-redisson-modern`) |
| 3.x 라인 유지·운영 | ❌ `redis-redisson-modern` |
| 2.15.2 레거시 | ❌ `redis-redisson-legacy` |
| Spring Data Redis(Lettuce/Jedis)만 쓰고 분산 락 불필요 | ❌ Redisson 자체가 과한 선택 |
| Redis Streams·Pub/Sub만 필요 | ⚠️ 표준 `spring-data-redis`로 충분한지 먼저 검토 |

---

## 12. 흔한 실수

| 실수 | 결과 | 대응 |
|------|------|------|
| 4.x 올리면서 JDK도 17로 올려야 한다고 가정 | 불필요한 대규모 변경 | Redisson 4.x는 **Java 8+**. JDK 상향 요구는 Spring Boot 4.x 쪽 |
| 컴파일 통과 = 마이그레이션 완료로 판단 | 운영 기동 시 설정 파싱 실패, 인증 정보 누락으로 접속 실패 | §10 체크리스트 완주 |
| 스타터만 추가하고 `RedissonSpringCacheManager` 사용 | `cannot find symbol` | `redisson-spring-cache` 의존성 추가(optional이라 전이 안 됨) |
| Boot 3.x인데 스타터 기본 번들(`-41`) 방치 | 런타임 `NoSuchMethodError`/`ClassNotFoundException` | `-3X` 모듈로 교체 |
| `spring.data.redis.redisson.file`로 작성 | 설정이 조용히 무시됨 | `spring.redis.redisson.file` (4.x도 동일) |
| 코덱만 바꾸고 배포 | 기존 캐시 값 역직렬화 실패 | 키 프리픽스 분리 또는 이관 배치 |
| Reliable Pub/Sub을 커뮤니티에서 사용 시도 | 기능 없음 | `RStream` + consumer group |
| `leaseTime` 지정 + watchdog 기대 | 자동 연장 안 됨 | 둘 중 하나만 사용 |
| `acquired` 확인 없이 `finally { lock.unlock(); }` | `IllegalMonitorStateException` | `acquired && isHeldByCurrentThread()` |
| `RBucket.set(v, long, TimeUnit)` 신규 작성 | deprecated 경로 확산 | `set(v, Duration)` |
