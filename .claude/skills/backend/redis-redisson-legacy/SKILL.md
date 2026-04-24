---
name: redis-redisson-legacy
description: Redis + Redisson 2.15.2 레거시 스택 - Spring Boot 2.5 + Java 11 + spring-data-redis 2.6.0 환경에서 Redisson 2.x API로 분산 락(RLock), 분산 자료구조(RMap/RSet/RQueue/RBucket), Pub/Sub(RTopic), Spring Cache 통합, 연결 설정(Single/Sentinel/Cluster) 다루기
---

# Redis + Redisson 2.15.2 레거시 스킬

> 소스: https://github.com/redisson/redisson/wiki | https://github.com/redisson/redisson/milestone/89 | https://github.com/redisson/redisson/blob/master/CHANGELOG.md | https://redisson.pro/docs/integration-with-spring/
> 검증일: 2026-04-23

> **주의 — 레거시 경고:** Redisson 2.15.2는 2019년 2월 릴리스된 매우 오래된 버전입니다(GitHub milestone #89는 2019-02-14 종료). 보안 패치·버그 수정이 오래 중단됐으며, 최신 Valkey·Redis 7.x 기능을 지원하지 않습니다. **가능하면 Redisson 3.x로 업그레이드를 강력히 권장**합니다. 이 스킬은 기존 스택이 Redisson 2.15.2에 고정된 프로젝트(업그레이드 전까지의 유지보수·신규 기능 추가)를 위한 패턴 가이드입니다.

> **주의 — 버전 매트릭스 이해:** 사용자 스택은 **Spring Boot 2.5 + Java 11 + spring-data-redis 2.6.0 + Redisson 2.15.2** 조합입니다. Redisson 2.x와 Spring Boot 2.5는 공식 호환 매트릭스에 포함되지 않은 조합이며, **`redisson-spring-boot-starter` 2.x 버전은 Spring Boot 1.5~2.0 시절에 맞춰져 있어 2.5와 직접 연동이 까다롭습니다**. 이 문서에서는 스타터 대신 **core `org.redisson:redisson:2.15.2`를 직접 의존하고 `RedissonClient`를 수동 `@Bean`으로 등록**하는 방식을 표준으로 소개합니다. 스타터를 꼭 써야 한다면 Redisson 3.x 업그레이드 경로를 우선 검토하세요.

---

## 1. 의존성 설정

### 1-1. core Redisson 2.15.2 단독 사용 (권장 — 2.x 유지 시)

```xml
<!-- pom.xml -->
<properties>
    <java.version>11</java.version>
    <spring-boot.version>2.5.14</spring-boot.version>
</properties>

<dependencies>
    <!-- Spring Boot 2.5 BOM이 spring-data-redis 2.6.0 으로 관리 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
        <!-- 2.5.x BOM이 spring-data-redis 2.6.x를 끌어옴 (단순 캐싱/RedisTemplate 용도) -->
    </dependency>

    <!-- Redisson core 2.15.2 (분산 락, 고급 자료구조용) -->
    <dependency>
        <groupId>org.redisson</groupId>
        <artifactId>redisson</artifactId>
        <version>2.15.2</version>
    </dependency>

    <!-- Jackson이 Redisson 코덱에 필요. Spring Boot BOM이 버전 관리 -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
</dependencies>
```

> 주의: spring-boot-starter-data-redis 2.5.x는 기본 Lettuce를 포함합니다. Redisson은 **별도의 자체 클라이언트**를 사용하므로 Lettuce/Jedis와 **완전히 독립**된 커넥션 풀을 가집니다. 두 클라이언트가 동일 Redis에 동시에 붙을 수 있습니다.

### 1-2. `redisson-spring-boot-starter` 2.x 사용 시 (비권장)

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <!-- 2.x 라인은 Spring Boot 1.5~2.0 시절 타겟. 2.5와는 미검증 조합 -->
    <version>2.15.2</version>
</dependency>
```

> 주의: `redisson-spring-boot-starter:2.15.2`와 Spring Boot 2.5 간 공식 호환 선언은 확인되지 않았습니다. 자동 구성(AutoConfiguration) 클래스 이름·프로퍼티 경로가 Spring Boot 2.5와 어긋날 수 있어 실환경에서는 core Redisson 의존성 + 수동 `@Bean` 방식(1-1)이 더 안전합니다.

---

## 2. Redisson 2.x vs 3.x 핵심 차이

| 항목 | Redisson 2.x (2.15.2) | Redisson 3.x |
|------|----------------------|---------------|
| 릴리스 시기 | 2.15.2: 2019-02 | 3.x: 2018~현재 (활발히 유지) |
| 최소 Java | Java 1.6+ (실무는 8+) | Java 8+ (최신은 11/17) |
| 패키지 구조 | `org.redisson.*` 일부 내부 API 노출 | `org.redisson.api.*`로 깔끔히 정리 |
| Reactive API | RxJava 1 기반 | RxJava 2/3, Project Reactor |
| `RFuture` | 커스텀 Future | Netty `io.netty.util.concurrent.Future` 기반으로 일관 |
| Spring Boot | 1.5~2.0 타겟 | 2.x(≤3.17), 3.x(3.18+), 최신은 Boot 3.x |
| Spring Data Redis | 1.x~2.1 호환 | 모듈별 분리 (`redisson-spring-data-XX`) |
| Codec 기본값 | `JsonJacksonCodec` | `Kryo5Codec` (3.30+) 등 |
| Breaking changes | 3.x 전환 시 패키지/메서드명 다수 변경 | — |

**실무 원칙:**
- 2.x 코드에서 새로 만드는 컴포넌트도 **`org.redisson.api.*` 인터페이스**(예: `RLock`, `RMap`, `RTopic`)만 참조하세요. 구현체 클래스 직접 참조 금지.
- 2.x 코드를 3.x로 마이그레이션할 때 가장 먼저 깨지는 곳: `Redisson.create(config)` 반환 타입, `RFuture` 시그니처, Spring Cache/Session 클래스 경로.

---

## 3. `RedissonClient` 수동 `@Bean` 구성 (Spring Boot 2.5 + Redisson 2.15.2)

```java
package com.example.config;

import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.codec.JsonJacksonCodec;
import org.redisson.config.Config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RedissonConfig {

    @Value("${app.redis.address:redis://127.0.0.1:6379}")
    private String address;

    @Value("${app.redis.password:}")
    private String password;

    @Value("${app.redis.database:0}")
    private int database;

    @Bean(destroyMethod = "shutdown")
    public RedissonClient redissonClient() {
        Config config = new Config();
        config.setCodec(new JsonJacksonCodec());   // 2.x 기본 코덱으로 명시

        config.useSingleServer()
              .setAddress(address)
              .setDatabase(database)
              .setConnectionPoolSize(32)
              .setConnectionMinimumIdleSize(8)
              .setConnectTimeout(3000)
              .setTimeout(3000)
              .setRetryAttempts(3)
              .setRetryInterval(1500)
              .setPassword(password.isEmpty() ? null : password);

        return Redisson.create(config);
    }
}
```

**중요 포인트:**
- `destroyMethod = "shutdown"`을 지정해야 애플리케이션 종료 시 Redisson의 Netty 스레드가 정상 종료됩니다.
- `setAddress`에 `redis://host:port` 스킴을 붙입니다. 2.x부터 스킴 필수.
- `setPassword(null)`은 암호 미사용을 의미. 빈 문자열을 그대로 넘기면 인증 실패할 수 있어 분기 처리.

### 3-1. Sentinel 모드

```java
config.useSentinelServers()
      .setMasterName("mymaster")
      .addSentinelAddress("redis://sentinel-1:26379",
                          "redis://sentinel-2:26379",
                          "redis://sentinel-3:26379")
      .setDatabase(0)
      .setPassword(password);
```

### 3-2. Cluster 모드

```java
config.useClusterServers()
      .setScanInterval(2000)
      .addNodeAddress("redis://node1:7000",
                      "redis://node2:7001",
                      "redis://node3:7002")
      .setPassword(password);
```

> 주의: Cluster 모드에서는 `setDatabase`를 사용할 수 없습니다(Redis Cluster는 DB 0만 허용). 키 네이밍으로 논리 분리하세요.

### 3-3. 외부 YAML 파일 로딩

```java
@Bean(destroyMethod = "shutdown")
public RedissonClient redissonClient() throws IOException {
    Config config = Config.fromYAML(new ClassPathResource("redisson.yml").getInputStream());
    return Redisson.create(config);
}
```

```yaml
# src/main/resources/redisson.yml
singleServerConfig:
  address: "redis://127.0.0.1:6379"
  database: 0
  connectionPoolSize: 32
  connectionMinimumIdleSize: 8
  connectTimeout: 3000
  timeout: 3000
  retryAttempts: 3
  password: null
codec: !<org.redisson.codec.JsonJacksonCodec> {}
```

---

## 4. 분산 락 — `RLock`

Redisson의 간판 기능. 여러 JVM 인스턴스 간 상호배제가 필요한 곳(동일 자원의 중복 처리 방지, 스케줄러 단일 실행 보장 등)에서 사용.

### 4-1. 기본 사용 패턴 (try-finally + tryLock + leaseTime)

```java
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final RedissonClient redissonClient;

    public void processOrder(Long orderId) {
        String key = "lock:order:" + orderId;
        RLock lock = redissonClient.getLock(key);

        boolean acquired = false;
        try {
            // waitTime: 최대 3초 획득 시도, leaseTime: 획득 시 10초 후 자동 해제
            acquired = lock.tryLock(3, 10, TimeUnit.SECONDS);
            if (!acquired) {
                throw new IllegalStateException("lock acquire failed: " + key);
            }

            // --- 임계영역 ---
            doProcess(orderId);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("interrupted while locking", e);
        } finally {
            // 락을 내가 보유 중일 때만 해제 — lease timeout으로 이미 풀렸을 수 있음
            if (acquired && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

**핵심 규칙:**

1. **반드시 `try-finally`로 `unlock()` 보장.** 예외로 언락이 빠지면 leaseTime까지 락이 그대로 점유됩니다.
2. **`tryLock(waitTime, leaseTime, unit)` 사용을 기본으로.** `lock()`(인자 없음)은 기본 watchdog(30초)이 계속 갱신돼, 프로세스가 비정상 종료되면 최대 30초 이내에만 풀립니다. 명시적 leaseTime이 장애 전파 측면에서 예측 가능.
3. **`isHeldByCurrentThread()` 체크 후 unlock.** leaseTime이 만료돼 이미 해제된 락을 다시 unlock하면 `IllegalMonitorStateException: attempt to unlock lock, not locked by current thread`가 발생합니다.
4. **락 키는 네임스페이스를 붙이고 의미 있는 식별자 포함.** `"lock:order:"+id` 같은 패턴으로 충돌 방지·운영 가시성 확보.

> 주의: `isHeldByCurrentThread()` + `unlock()` 사이의 race는 여전히 존재합니다(극히 짧은 구간). 완전히 방지하려면 낙관적으로 `try { lock.unlock(); } catch (IllegalMonitorStateException ignore) {}` 패턴도 사용됩니다. 단, 예외 삼킴은 로그로 남기세요.

### 4-2. Watchdog(자동 연장) 방식

```java
lock.lock();   // leaseTime 지정 없음 → lockWatchdogTimeout(기본 30초) 기준으로 자동 연장
try {
    // 임계영역 — 실행 시간을 예측할 수 없을 때 유효
} finally {
    if (lock.isHeldByCurrentThread()) lock.unlock();
}
```

- `Config.setLockWatchdogTimeout(long ms)`로 워치독 타임아웃 조정 가능 (기본 30,000ms).
- JVM이 크래시하면 최대 워치독 타임아웃 내에 락이 자동 해제.
- **주의:** leaseTime을 명시하면 워치독이 비활성화됩니다. "긴 작업 + 자동 연장" 조합이 필요하면 leaseTime을 지정하지 마세요.

### 4-3. FairLock · MultiLock · ReadWriteLock

```java
RLock fair = redissonClient.getFairLock("fair-key");       // FIFO 대기 순서 보장
RLock multi = redissonClient.getMultiLock(lockA, lockB);   // 여러 락 동시 획득 (all-or-nothing)
RReadWriteLock rw = redissonClient.getReadWriteLock("rw-key");
rw.readLock().lock();
rw.writeLock().lock();
```

| 락 종류 | 용도 |
|---------|------|
| `getLock(name)` | 일반 재진입 분산 락 |
| `getFairLock(name)` | 공정성 필요할 때(대기 시간 순) — 성능 낮음 |
| `getMultiLock(locks...)` | 여러 리소스를 원자적으로 잠금 |
| `getReadWriteLock(name)` | 읽기 다수 / 쓰기 단수 |

---

## 5. 분산 자료구조

### 5-1. `RBucket` — 단일 객체 보관

```java
RBucket<User> bucket = redissonClient.getBucket("user:1001");
bucket.set(new User("alice", 30));
bucket.set(new User("alice", 31), 10, TimeUnit.MINUTES);  // TTL
User u = bucket.get();

// 원자 연산
boolean replaced = bucket.compareAndSet(prev, next);
User old = bucket.getAndSet(next);
```

- `SET` 명령과 1:1 대응. 캐시·세션 토큰 저장·단일 설정 값 보관에 사용.
- `trySet`, `setIfExists` 등 CAS 스타일 메서드 지원.

### 5-2. `RMap` — 분산 해시

```java
RMap<String, User> users = redissonClient.getMap("users");
users.put("u1", new User("alice", 30));
User u = users.get("u1");

// 부분 업데이트 원자 연산
users.putIfAbsent("u1", new User("bob", 25));
users.replace("u1", newUser);

// 벌크 로드
Map<String, User> loaded = users.getAll(Set.of("u1", "u2", "u3"));
```

- Redis HASH 자료구조 기반. 수백만 건의 대형 해시도 가능.
- **주의:** `map.entrySet()`·`keySet()`·`values()`를 호출하면 전체를 스캔합니다. 큰 맵에서는 `map.readAllKeySet()` 대신 `keyIterator()`·`entryIterator()` 같은 스트리밍 API를 사용하거나, 아예 호출하지 마세요.

### 5-3. `RSet` — 분산 집합

```java
RSet<String> tags = redissonClient.getSet("post:1:tags");
tags.add("redis");
tags.addAll(Set.of("distributed", "cache"));
boolean contains = tags.contains("redis");

// 집합 연산
Set<String> union = tags.readUnion("post:2:tags");
Set<String> diff  = tags.readDiff("post:2:tags");
```

- Redis SET 대응. 중복 제거·교집합/합집합 필요 시 사용.

### 5-4. `RQueue` · `RBlockingQueue` · `RDeque`

```java
RQueue<Task> queue = redissonClient.getQueue("tasks");
queue.offer(new Task("t1"));
Task t = queue.poll();              // 비차단, null 가능

RBlockingQueue<Task> bq = redissonClient.getBlockingQueue("tasks-blocking");
Task tb = bq.poll(5, TimeUnit.SECONDS);   // 최대 5초 대기
Task tb2 = bq.take();                      // 무한 대기
```

- `RBlockingQueue`는 Java `BlockingQueue` 인터페이스 구현 → 분산 환경의 워커 풀에 그대로 사용 가능.
- Redis LIST 기반(`LPUSH`/`BRPOP` 매핑).

### 5-5. `RAtomicLong` · `RAtomicDouble`

```java
RAtomicLong counter = redissonClient.getAtomicLong("visits");
long v = counter.incrementAndGet();
counter.compareAndSet(100L, 0L);
```

- 전역 카운터·분산 시퀀스 발행 등에 사용.
- 원자성은 Redis 단일 노드 또는 cluster 같은 해시슬롯 내에서만 보장.

---

## 6. Pub/Sub — `RTopic`

### 6-1. 발행/구독 기본

```java
// 구독자
RTopic topic = redissonClient.getTopic("order-events");
int listenerId = topic.addListener(OrderEvent.class, new MessageListener<OrderEvent>() {
    @Override
    public void onMessage(CharSequence channel, OrderEvent msg) {
        log.info("received from {}: {}", channel, msg);
    }
});

// 발행자 (다른 JVM 가능)
RTopic topic2 = redissonClient.getTopic("order-events");
long clients = topic2.publish(new OrderEvent(orderId, "CREATED"));
```

**특징:**
- 리스너는 재연결·페일오버 후 **자동으로 재구독**됩니다 (2.x부터 지원).
- `topic.publish()`의 반환값은 메시지를 수신한 구독자 수.
- 패턴 구독은 `redissonClient.getPatternTopic("order-*")`.

> 주의: Redisson 2.x의 `MessageListener`는 `org.redisson.api.listener.MessageListener` 경로. 3.x도 동일하나 2.x 초기 릴리스 일부에서는 `org.redisson.core.MessageListener` 경로였습니다. 2.15.2는 `api.listener` 경로 사용.

### 6-2. Redis Pub/Sub의 한계

- 메시지 **영속화 없음**. 구독자가 오프라인이면 메시지 유실.
- "이벤트 버스"로 사용할 때만 권장. 작업 큐 용도로는 `RBlockingQueue`나 Redis Streams(2.x는 미지원, 3.x 필요) 사용.

---

## 7. Spring Cache 통합 (`@Cacheable` + Redisson)

Redis를 Spring Cache 백엔드로 사용하는 경로는 두 가지가 있습니다.

| 방법 | 구현체 | 특징 |
|------|--------|------|
| A. spring-data-redis `RedisCacheManager` | Spring Data Redis가 제공 | 단순, 의존성 추가 없음, TTL 설정 간단 |
| B. Redisson `RedissonSpringCacheManager` | Redisson이 제공 | `maxIdleTime` 지원, 캐시별 세밀 제어, Redisson 이미 쓴다면 통합 관리 |

### 7-1. 방법 A: Spring Data Redis `RedisCacheManager`

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory cf) {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        // 캐시별 TTL 개별 지정
        Map<String, RedisCacheConfiguration> perCache = new HashMap<>();
        perCache.put("users", defaultConfig.entryTtl(Duration.ofHours(1)));
        perCache.put("shortLived", defaultConfig.entryTtl(Duration.ofSeconds(30)));

        return RedisCacheManager.builder(cf)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(perCache)
                .build();
    }
}
```

```java
@Service
public class UserService {
    @Cacheable(value = "users", key = "#id")
    public User findById(Long id) { ... }

    @CacheEvict(value = "users", key = "#id")
    public void delete(Long id) { ... }
}
```

> 이 경로는 Redisson을 거치지 않고 Lettuce/Jedis 커넥션을 사용합니다. 단순 읽기/쓰기 캐싱만 필요하면 가장 깔끔한 선택.

### 7-2. 방법 B: `RedissonSpringCacheManager`

```java
@Configuration
@EnableCaching
public class RedissonCacheConfig {

    @Bean
    public CacheManager cacheManager(RedissonClient redissonClient) {
        Map<String, CacheConfig> config = new HashMap<>();
        // ttl = 1시간, maxIdleTime = 15분 (모두 ms)
        config.put("users",      new CacheConfig(60 * 60 * 1000L, 15 * 60 * 1000L));
        config.put("shortLived", new CacheConfig(30 * 1000L, 10 * 1000L));

        return new RedissonSpringCacheManager(redissonClient, config);
    }
}
```

- `CacheConfig(ttl, maxIdleTime)` 인자는 **밀리초**. 0 또는 미지정은 "무한" 의미.
- `maxIdleTime`은 마지막 접근 이후 만료 (LRU-like 동작).
- 2.15.2의 `RedissonSpringCacheManager`는 `org.redisson.spring.cache.RedissonSpringCacheManager` 경로.

> 주의: 2.15.2의 `RedissonSpringCacheManager`는 Spring 4.x ~ 5.0 타겟으로 설계됐습니다. Spring Boot 2.5(Spring 5.3)에서 대부분 동작하지만 `CacheManager` 인터페이스의 새 메서드(default 메서드 포함) 호환 문제는 실테스트로 확인하세요.

---

## 8. Spring Session Redis 연동 (선택)

Redis를 세션 저장소로 쓰려면 **spring-session-data-redis**를 사용합니다. Redisson 2.x는 자체 Tomcat 세션 모듈(`redisson-tomcat-*`)은 있지만, Spring 앱에서는 spring-session이 더 일반적.

```xml
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
</dependency>
```

```java
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 1800)
@Configuration
public class SessionConfig {
    // RedisConnectionFactory는 spring-boot-starter-data-redis 자동 구성이 제공
}
```

> 주의: spring-session-data-redis는 Redisson이 아닌 Lettuce/Jedis 커넥션을 사용합니다. Redisson `RedissonClient`와는 독립이며, 같은 Redis에 별도로 접속합니다.

---

## 9. 연결 설정 — 단일/Sentinel/Cluster 선택 기준

| 배포 형태 | 선택 | 특징 |
|-----------|------|------|
| 개발·단일 서버 | `useSingleServer()` | 가장 단순, HA 없음 |
| Master + Sentinels 3+ | `useSentinelServers()` | 자동 페일오버, 일반 운영 표준 |
| Redis Cluster 모드 | `useClusterServers()` | 샤딩·HA, 대규모 |
| 읽기 분산 필요 | `useMasterSlaveServers()` 또는 Sentinel | slave에 읽기 라우팅 |

### 9-1. 공통 성능 튜닝

```java
config.useSingleServer()
      .setAddress("redis://...")
      .setConnectionPoolSize(64)            // 총 커넥션 풀 (기본 64)
      .setConnectionMinimumIdleSize(24)     // 최소 idle (기본 24)
      .setSubscriptionConnectionPoolSize(50)// pub/sub 전용 풀 (기본 50)
      .setConnectTimeout(10000)             // ms
      .setTimeout(3000)                     // 명령 타임아웃 ms
      .setRetryAttempts(3)                  // 재시도 횟수
      .setRetryInterval(1500);              // 재시도 간격 ms
```

### 9-2. `lockWatchdogTimeout`

```java
config.setLockWatchdogTimeout(30_000L);  // 기본 30초. 락 leaseTime 미지정 시 연장 주기
```

---

## 10. spring-data-redis 2.6.0과의 역할 분담

같은 프로젝트에서 spring-data-redis 2.6.0과 Redisson 2.15.2를 함께 쓰는 것이 흔한 패턴입니다.

| 용도 | 추천 클라이언트 | 이유 |
|------|-----------------|------|
| 단순 `GET/SET`, `HGET/HSET` | spring-data-redis (`RedisTemplate`, `StringRedisTemplate`) | 간결, Boot BOM 자동 구성 |
| `@Cacheable` 기본 캐싱 | spring-data-redis (`RedisCacheManager`) | TTL만 있으면 충분 |
| Spring Session | spring-session-data-redis | 표준 경로 |
| 분산 락 | Redisson (`RLock`) | spring-data-redis에는 분산 락 기본 API 없음 |
| 분산 자료구조(큐·셋·맵) | Redisson (`RMap`, `RQueue`) | Java Collection 인터페이스 호환 |
| Pub/Sub (다중 인스턴스) | Redisson (`RTopic`) 또는 spring-data-redis `MessageListener` | 둘 다 가능, Redisson이 재구독 자동화 |
| 복잡한 원자 연산 | Redisson | 내장 Lua 스크립트 연산 |

### 10-1. `RedisTemplate` 기본 설정

```java
@Configuration
public class RedisTemplateConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory cf) {
        RedisTemplate<String, Object> t = new RedisTemplate<>();
        t.setConnectionFactory(cf);
        t.setKeySerializer(new StringRedisSerializer());
        t.setHashKeySerializer(new StringRedisSerializer());
        t.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        t.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        t.afterPropertiesSet();
        return t;
    }
}
```

> 주의: **Redisson이 저장한 값과 `RedisTemplate`이 저장한 값은 직렬화 포맷이 달라 서로 읽을 수 없습니다.** 같은 키를 두 클라이언트가 공유하지 않도록 네임스페이스를 분리하세요 (`cache:*` vs `lock:*` vs `queue:*`).

---

## 11. 자주 하는 실수

| 실수 | 수정 |
|------|------|
| `unlock()`을 `try-finally`에 넣지 않음 | 예외 발생 시 leaseTime까지 락 점유 → 반드시 finally |
| `leaseTime` 미지정 + 긴 작업 | 기본 워치독 30초가 연장하지만 예측 불가. 명시 권장 |
| `lock.unlock()` 무조건 호출 | leaseTime 만료 후 unlock 시 `IllegalMonitorStateException` → `isHeldByCurrentThread()` 체크 |
| `Redisson.create(config)`만 호출, `shutdown` 누락 | 애플리케이션 종료 시 Netty 스레드 미종료. `destroyMethod="shutdown"` 필수 |
| `setAddress("127.0.0.1:6379")` (스킴 없음) | Redisson 2.x는 `redis://` 또는 `rediss://`(SSL) 스킴 필수 |
| Redisson과 `RedisTemplate`이 **같은 키**를 읽고 씀 | 직렬화 불일치로 깨짐. 키 네임스페이스 분리 |
| `useClusterServers()` + `setDatabase(1)` | Cluster 모드는 DB 0만 허용. 키 프리픽스로 논리 분리 |
| 2.x 코드에서 3.x 가이드 API 사용 | 2.x vs 3.x 메서드 시그니처 다름. 2.15.2 javadoc 기준으로 확인 |
| `redisson-spring-boot-starter:2.15.2` + Spring Boot 2.5 자동 구성 기대 | 공식 호환 미확인 조합. core 의존성 + 수동 `@Bean`이 안전 |
| `RMap.entrySet()` 대형 맵에서 호출 | 전체 로드 → 메모리 폭증. `entryIterator()` 사용 |
| Pub/Sub으로 중요 이벤트 전송 | 구독자 오프라인 시 메시지 유실. 영속 필요하면 큐/스트림 사용 |
| leaseTime 명시 후 watchdog 자동 연장 기대 | leaseTime 명시 시 watchdog 비활성화. 자동 연장 원하면 인자 없는 `lock()` 사용 |
| `RLock` 키를 DB 행별로 매번 다른 네임으로 생성 | 과도한 키 폭증. `"lock:<resource>:<id>"` 형식 표준화 |

---

## 12. 업그레이드 경로 (참고)

Redisson 2.15.2 → 3.x 전환 시 주의 지점(실제 업그레이드 작업 시):

- `org.redisson.core.*` → `org.redisson.api.*`로 경로 변경
- `RFuture` 반환 타입 일부 변경 (Netty `Future` 기반)
- `Config` YAML 스키마 일부 필드 추가/이름 변경
- `RedissonSpringCacheManager` 경로 동일, 내부 동작 소폭 변경
- `redisson-spring-boot-starter` 3.x 사용 시 Spring Boot 2.5 호환되는 버전은 **3.17.x 이하** (3.18+ 는 Spring Boot 3.x 전용)

> 주의: 이 경로·버전 경계는 마이그레이션 시점에 반드시 당시 최신 공식 문서로 재확인하세요.

---

## 출처

- Redisson GitHub Wiki: https://github.com/redisson/redisson/wiki
- Redisson milestone #89 (2.15.2): https://github.com/redisson/redisson/milestone/89
- Redisson CHANGELOG: https://github.com/redisson/redisson/blob/master/CHANGELOG.md
- Redisson Spring Integration: https://redisson.pro/docs/integration-with-spring/
- Redisson 2.8.2 javadoc (2.x 시리즈 API 참조): https://www.javadoc.io/doc/org.redisson/redisson/2.8.2/
- Spring Data Redis: https://docs.spring.io/spring-data/redis/docs/2.6.0/reference/html/
