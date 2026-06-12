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

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
