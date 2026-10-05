## 선언적 락: `@RedissonLock` 어노테이션이 존재하는가

> 주의: **Redisson 공식이 제공하는 `@RedissonLock` 어노테이션은 없다.** 블로그·예제에서 보이는 `@DistributedLock`, `@RedisLock` 등은 모두 사용자가 **Spring AOP(`@Aspect`)로 직접 구현**한 커스텀 어노테이션이다.

필요하다면 아래 패턴으로 직접 구현한다.

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface DistributedLock {
    String key();                    // SpEL 지원하려면 파싱 추가
    long waitTime()  default 3;
    long leaseTime() default 10;
    TimeUnit unit()  default TimeUnit.SECONDS;
}

@Aspect
@Component
@RequiredArgsConstructor
public class DistributedLockAspect {
    private final RedissonClient redisson;

    @Around("@annotation(lockAnno)")
    public Object around(ProceedingJoinPoint pjp, DistributedLock lockAnno) throws Throwable {
        RLock lock = redisson.getLock(lockAnno.key());
        boolean acquired = lock.tryLock(lockAnno.waitTime(), lockAnno.leaseTime(), lockAnno.unit());
        if (!acquired) throw new IllegalStateException("lock busy: " + lockAnno.key());
        try {
            return pjp.proceed();
        } finally {
            if (lock.isHeldByCurrentThread()) lock.unlock();
        }
    }
}
```

> `@Transactional`과 함께 쓰면 순서 주의: 트랜잭션 커밋 **전에** unlock이 실행되어 다른 스레드가 커밋 직전 상태의 DB를 읽을 수 있다. 커밋 완료 뒤 unlock이 필요하면 락을 트랜잭션 바깥으로 빼거나 `TransactionSynchronization`을 활용한다.

---

## 비동기 API (RFuture) 및 Reactive API

### Async — `RFuture` (`CompletionStage` 구현)

모든 동기 메서드에는 `*Async()` 버전이 있다. 반환형은 `RFuture<T>`이며 `CompletionStage`를 구현한다.

```java
RBucket<String> bucket = redisson.getBucket("k1");
RFuture<Void> setF = bucket.setAsync("v1");
setF.thenRun(() -> log.info("set ok"));

RFuture<String> getF = bucket.getAsync();
getF.whenComplete((val, ex) -> {
    if (ex != null) log.error("fail", ex);
    else            log.info("got {}", val);
});
```

### Reactive — Project Reactor `Mono` / `Flux`

```java
RedissonReactiveClient reactive = redisson.reactive();

// RBucketReactive
RBucketReactive<AnyObject> bucketR = reactive.getBucket("k2");
Mono<Void>      setMono = bucketR.set(new AnyObject(1));
Mono<AnyObject> getMono = bucketR.get();

// RLockReactive
RLockReactive lockR = reactive.getLock("reactiveLock");
Mono<Boolean> tryLockMono = lockR.tryLock(3, 10, TimeUnit.SECONDS);
```

Spring WebFlux 환경에서 `@Autowired RedissonReactiveClient`를 그대로 주입해 사용할 수 있다.

**Reactive 락의 release 패턴 — `Mono.usingWhen`** (try-finally 대체):

동기 코드의 `try-finally unlock`은 Reactive 체인에 그대로 대응하지 못한다. Reactor의 `Mono.usingWhen`을 사용해 **자원 획득 → 본문 → 항상 cleanup** 흐름을 선언적으로 구성한다.

```java
public Mono<Order> placeOrderReactive(Long orderId) {
    RLockReactive lock = redisson.reactive().getLock("lock:order:" + orderId);

    return Mono.usingWhen(
        // 1) 자원 획득 — tryLock 성공하면 lock 자체를 방출
        lock.tryLock(3, 10, TimeUnit.SECONDS)
            .filter(Boolean::booleanValue)
            .switchIfEmpty(Mono.error(new IllegalStateException("lock not acquired")))
            .thenReturn(lock),

        // 2) 본문 — 임계 영역
        acquired -> orderService.processReactive(orderId),

        // 3) 정상 종료 시 cleanup
        acquired -> acquired.unlock(),

        // 4) 에러 발생 시 cleanup
        (acquired, err) -> acquired.unlock(),

        // 5) 취소(cancel) 시 cleanup
        acquired -> acquired.unlock()
    );
}
```

핵심:
- `usingWhen`은 **본문 Mono가 정상/에러/취소 어느 경로로 끝나든 cleanup이 실행**된다. Reactive 체인의 표준 릴리즈 패턴.
- `lock.unlock()`은 `Mono<Void>`를 반환한다 — cleanup 람다는 `Publisher` 반환이어야 함.
- `leaseTime` 지정 시(예: 10초) Watchdog은 비활성되므로, 본문이 leaseTime을 넘기면 락이 자동 해제되어 다른 스레드가 동시 진입할 수 있음을 유의.

### RxJava 3

```java
RedissonRxClient rx = redisson.rxJava();
RBucketRx<String> bucketRx = rx.getBucket("k3");
Completable setRx = bucketRx.set("v");
Maybe<String> getRx = bucketRx.get();
```

---

## 분산 객체

### RBucket — 단일 값 저장 + CAS

```java
RBucket<Ledger> bucket = redisson.getBucket("ledger:42");
bucket.set(new Ledger());
bucket.set(new Ledger(), Duration.ofMinutes(5));        // TTL
Ledger l = bucket.get();
boolean ok = bucket.compareAndSet(oldVal, newVal);      // 원자적 CAS
Ledger prev = bucket.getAndSet(newVal);
```

### RMap / RMapCache — ConcurrentMap + TTL

```java
RMap<String, User> map = redisson.getMap("users");
map.put("u1", user1);
User u = map.get("u1");

// TTL이 필요하면 RMapCache
RMapCache<String, User> mapCache = redisson.getMapCache("users");
mapCache.put("u1", user1, 10, TimeUnit.MINUTES);                       // TTL
mapCache.put("u2", user2, 10, TimeUnit.MINUTES, 5, TimeUnit.MINUTES);  // TTL + maxIdleTime
```

### RSet / RSortedSet / RScoredSortedSet

```java
RSet<String> tags = redisson.getSet("tags:42");
tags.add("sale");
boolean has = tags.contains("sale");

RScoredSortedSet<String> leaderboard = redisson.getScoredSortedSet("leaderboard");
leaderboard.add(100.0, "player1");
Collection<String> top10 = leaderboard.valueRange(0, 9);
```

### RQueue / RDeque / RBlockingQueue

```java
RQueue<String> q = redisson.getQueue("queue:jobs");
q.offer("job1");
String job = q.poll();

RBlockingQueue<String> bq = redisson.getBlockingQueue("queue:jobs");
String jobBlock = bq.poll(5, TimeUnit.SECONDS);    // 5초 블로킹 대기
```

### RDelayedQueue — 지연 메시지

```java
RBlockingQueue<String> destQ = redisson.getBlockingQueue("dest");
RDelayedQueue<String> delayQ = redisson.getDelayedQueue(destQ);
delayQ.offer("task-A", 30, TimeUnit.SECONDS);      // 30초 뒤 destQ로 이동
String msg = destQ.take();
```

> 주의: Redisson 3.x 후반부(대략 3.47+)에서 **`RDelayedQueue`와 `RBoundedBlockingQueue`는 deprecated**로 표시되었고 **`RReliableQueue`** 사용이 권장된다. `RReliableQueue`는 ACK·재배달·visibility timeout·dedup을 제공한다. 신규 프로젝트라면 `RReliableQueue`를 우선 검토하되, 사용 중인 Redisson 버전의 javadoc에서 지원 여부를 확인한다.

### RAtomicLong / RAtomicDouble

```java
RAtomicLong counter = redisson.getAtomicLong("counter:requests");
long v = counter.incrementAndGet();
counter.addAndGet(5);
boolean ok = counter.compareAndSet(10, 11);
```

### RRateLimiter — 토큰 버킷 기반

```java
RRateLimiter limiter = redisson.getRateLimiter("rl:api:public");
// 1분당 100 요청 (전체 클라이언트 합산)
limiter.trySetRate(RateType.OVERALL, 100, 1, RateIntervalUnit.MINUTES);

if (limiter.tryAcquire(1)) {
    callApi();
} else {
    throw new TooManyRequestsException();
}
```

`RateType.OVERALL`은 모든 인스턴스 합산, `RateType.PER_CLIENT`는 Redisson 클라이언트별 독립.

### RStream — Redis Streams

```java
RStream<String, String> stream = redisson.getStream("events");
StreamMessageId id = stream.add(StreamAddArgs.entry("type", "login"));
// Consumer Group
stream.createGroup(StreamCreateGroupArgs.name("g1").id(StreamMessageId.ALL));
```

---

## Pub/Sub — RTopic

```java
// Publisher
RTopic topic = redisson.getTopic("ch:orders");
topic.publish(new OrderEvent(orderId));

// Subscriber
RTopic subTopic = redisson.getTopic("ch:orders");
int listenerId = subTopic.addListener(OrderEvent.class, (channel, msg) -> {
    log.info("got {} on {}", msg, channel);
});
// 해제
subTopic.removeListener(listenerId);
```

- `RPatternTopic`으로 와일드카드 구독도 가능 (`news.*`).
- `RReliableTopic`: 오프라인 subscriber도 메시지 수신(히스토리 재생).

---

## Spring Data Redis 통합 (Lettuce 기본)

`redisson-spring-boot-starter`를 쓰면 `RedisTemplate`·`ReactiveRedisTemplate` 빈이 **Redisson의 Netty 커넥션** 위에 얹혀 자동 등록된다. 즉, 별도의 Lettuce 설정 없이도 spring-data-redis 코드를 그대로 쓸 수 있다.

### `@Cacheable` + `RedissonSpringCacheManager`

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(RedissonClient redisson) {
        Map<String, CacheConfig> configMap = new HashMap<>();
        // ttl 24분, maxIdleTime 12분 (단위: ms)
        configMap.put("userCache",  new CacheConfig(24 * 60 * 1000, 12 * 60 * 1000));
        configMap.put("orderCache", new CacheConfig(10 * 60 * 1000,  5 * 60 * 1000));
        return new RedissonSpringCacheManager(redisson, configMap);
    }
}
```

- `org.redisson.spring.cache.CacheConfig` — Redisson 전용 (`org.springframework.cache` 아님)
- `ttl`, `maxIdleTime` 모두 **0 또는 미지정 시 무한 보관**.

```java
@Service
public class UserService {

    @Cacheable(cacheNames = "userCache", key = "#id")
    public User findById(Long id) { ... }

    @CacheEvict(cacheNames = "userCache", key = "#id")
    public void evict(Long id) { }
}
```

---

## 레거시 2.x → 모던 3.x 주요 차이

| 영역 | Redisson 2.15.2 (레거시) | Redisson 3.18.1+ (모던) |
|------|--------------------------|--------------------------|
| 최소 JDK | Java 6/7 | Java 8+ (Spring Boot 3.x 쓰려면 17+) |
| Spring Boot 지원 | 1.x ~ 2.x 일부 | **Spring Boot 3.x 공식 지원** (3.18.1 이후) |
| 패키지 | `org.redisson.core.*` 일부 존재 | **`org.redisson.api.*`로 통일** |
| Async 반환 타입 | `io.netty.util.concurrent.Future` (Netty Future) | **`RFuture`** (`CompletionStage` 구현, `CompletableFuture` 유사) |
| Reactive API | 초기 RxJava1 기반, 제한적 | **Reactor(Mono/Flux) + RxJava3 전면 제공** |
| Codec 기본값 | Jackson/Kryo 혼재 | `Marshalling`→`Jackson` 권장 (3.x 후반 일부 Codec deprecated) |
| Config 진입점 | `Config#useSingleServer()` 등 동일 | 동일하나 옵션 항목(예: `subscriptionMode`) 확대 |
| Spring 통합 Bean | `RedissonSpringDataFactory` 조합 필요 | **starter가 `RedisTemplate`까지 자동 등록** |
| RedLock | `redisson.getRedLock(...)` | **`getMultiLock(...)`** (`getRedLock` deprecated) |
| DelayedQueue | 존재 | 존재하나 **deprecated**, `RReliableQueue` 권장 |
| Spring Cache | `org.redisson.spring.cache.RedissonSpringCacheManager` | 동일 클래스, **`CacheConfig` 시그니처 일부 확장**(maxIdleTime 추가) |

### 마이그레이션 체크리스트

- [ ] `pom.xml`에서 `redisson` 단일 jar → **`redisson-spring-boot-starter`**로 교체
- [ ] `spring.redis.*` → **`spring.data.redis.*`** 이동 (Spring Boot 3.x)
- [ ] `io.netty.util.concurrent.Future` 반환 코드 → `RFuture` / `CompletionStage` API로 교체 (`toCompletableFuture()` 사용 가능)
- [ ] `getRedLock(...)` → **`getMultiLock(...)`**
- [ ] `RDelayedQueue` 신규 사용처 → **`RReliableQueue`** 검토
- [ ] 수동으로 `RedissonClient` 빈 선언한 곳 → starter 자동 구성으로 치환(Config 빈 방식만 남기고 나머지 제거)
- [ ] `javax.*` → **`jakarta.*`** (Spring Boot 3.x 전반 영향)

---

## 자주 하는 실수

| 실수 | 수정 |
|------|------|
| `spring.redis.host` 사용 (Spring Boot 3.x) | **`spring.data.redis.host`**로 이동 |
| `spring.data.redis.redisson.file` 사용 | Redisson 전용 키는 **`spring.redis.redisson.file`** — 이동하지 않는다 |
| `tryLock` 반환값을 무시하고 `finally`에서 무조건 `unlock()` | `boolean acquired` + `isHeldByCurrentThread()` 체크 후 unlock |
| `leaseTime`과 Watchdog을 동시에 기대 | `leaseTime` 명시하면 Watchdog 비활성. `-1` 주면 Watchdog 갱신 |
| Config Bean에 `destroyMethod` 누락 | `@Bean(destroyMethod = "shutdown")` 반드시 지정 |
| 클러스터에서 읽기를 항상 마스터로 보냄 | `readMode: SLAVE` 또는 `MASTER_SLAVE` 설정으로 부하 분산 |
| `java.util.concurrent.Future`로 반환 타입 지정 | **`RFuture`** 로 받으면 `CompletionStage` 메서드 사용 가능 |
| `@Cacheable`과 `RedissonSpringCacheManager`에서 `CacheConfig`를 `org.springframework.cache.CacheConfig`로 import | **`org.redisson.spring.cache.CacheConfig`** 로 import |
| `RDelayedQueue` 신규 프로젝트 채택 | **`RReliableQueue`** 검토 (ACK/retry/visibility 제공) |
| 같은 Redisson 클라이언트를 테스트마다 새로 생성 | `Redisson.create()`는 비용이 크다 — 스프링 빈으로 주입 |
| `getRedLock`으로 RedLock 구현 | **`getMultiLock`** 사용 (`getRedLock` deprecated) |
| Reactive 체인 내부에서 동기 `RLock.tryLock()` 호출 | `RLockReactive`로 전환, 블로킹 호출 금지 |
| Redisson 3.18.0에서 Spring Boot 3 사용 시도 | 3.18.1 이상 사용 (Spring Data Redis 3.x 의존) |
