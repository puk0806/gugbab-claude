---
name: redis-redisson-modern
description: Redisson 3.x 모던 — Spring Boot 3.x + Java 17+ 기반 RedissonClient 자동 구성, 분산 락(RLock/RReadWriteLock/RSemaphore), 분산 객체(RMap/RBucket/RTopic/RRateLimiter), 비동기·Reactive API, Spring Cache 통합, 레거시 2.x 대비 마이그레이션
---

# Redisson 3.x 모던 (Spring Boot 3.x + Java 17+)

> 소스: https://github.com/redisson/redisson/blob/master/docs/integration-with-spring.md | https://redisson.pro/docs/integration-with-spring/ | https://redisson.pro/docs/data-and-services/locks-and-synchronizers/ | https://github.com/redisson/redisson/blob/master/redisson/src/main/java/org/redisson/api/RLock.java | https://www.baeldung.com/redis-redisson
> 검증일: 2026-04-23

> 주의: 본 스킬은 **Redisson 3.18.1 ~ 3.51.0** 범위(Spring Boot 3.x + Spring Data Redis 3.x 호환)를 기준으로 합니다. Redisson 4.x는 Spring 통합 모듈 분리 등 Breaking Change가 있어 별도 스킬로 분리됩니다. 레거시 2.15.2는 `redis-redisson-legacy` 스킬을 참조하세요.

---

## 버전·호환성 매트릭스

| 항목 | 값 |
|------|-----|
| Redisson 최신 3.x 안정판 | **3.51.0** (2024-08-22) |
| Spring Boot 지원 범위 (전체) | 1.3.x ~ 4.0.x |
| Spring Boot 3.x 지원 시작 | Redisson **3.18.1** 이후 (Spring Data Redis 3.x 의존성 도입) |
| 필수 JDK | Java 8+ (Redisson 핵심), Spring Boot 3.x 사용 시 **Java 17+** |
| Spring Data Redis 3.x 대응 모듈 | `redisson-spring-data-33` (Spring Boot 3.3 등) |

> 주의: Redisson 3.18.0 **이하**는 Spring Boot 2.x 계열과 묶여 있어, 3.18.1로 올린 순간 Spring Boot 2.x는 호환이 깨집니다. 업그레이드 시 두 버전을 함께 이동해야 합니다.

---

## 의존성 설정

### Maven — Spring Boot 3.x + Java 17+

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>3.51.0</version>
</dependency>
```

### Gradle

```groovy
implementation 'org.redisson:redisson-spring-boot-starter:3.51.0'
```

### 스프링 데이터 모듈 버전 다운그레이드가 필요할 때

`redisson-spring-boot-starter`는 최신 Spring Boot에 맞춘 `redisson-spring-data-XX`를 기본 포함한다. 프로젝트가 더 낮은 Spring Boot 3.x(예: 3.0)라면 상위 의존성을 제외하고 맞는 버전을 직접 지정한다.

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>3.51.0</version>
    <exclusions>
        <exclusion>
            <groupId>org.redisson</groupId>
            <artifactId>redisson-spring-data-33</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-data-31</artifactId>
    <version>3.51.0</version>
</dependency>
```

---

## RedissonClient 자동 구성

`redisson-spring-boot-starter`를 추가하면 다음 빈이 **자동으로 등록**된다. 별도의 `@Bean` 정의 없이 바로 주입해 쓸 수 있다.

- `RedissonClient` — 동기 API 진입점
- `RedissonReactiveClient` — Project Reactor 기반
- `RedissonRxClient` — RxJava 기반
- `RedisTemplate` / `ReactiveRedisTemplate` — spring-data-redis 연동

### application.yml — 기본 설정 (Spring Boot 3.x)

```yaml
spring:
  data:
    redis:                         # ← Spring Boot 3.x는 spring.data.redis 로 이동
      host: localhost
      port: 6379
      password: ${REDIS_PASSWORD:}
      database: 0
      ssl: false
      timeout: 3000
      connect-timeout: 3000
      client-name: my-app
```

> 주의: Spring Boot 3.x부터 `spring.redis.*`는 **`spring.data.redis.*`**로 바뀌었다. 2.7 이하에서 올라왔다면 키를 전부 이동해야 한다. 이 키만 놓쳐도 RedissonClient는 `127.0.0.1:6379` 기본값으로 접속을 시도한다.

### 클러스터 / 센티널 (기본 설정)

```yaml
spring:
  data:
    redis:
      cluster:
        nodes:
          - 10.0.0.1:7000
          - 10.0.0.2:7000
          - 10.0.0.3:7000
      # sentinel:
      #   master: mymaster
      #   nodes:
      #     - 10.0.0.1:26379
      #     - 10.0.0.2:26379
      password: ${REDIS_PASSWORD}
```

`spring.data.redis.*`만으로는 Redisson의 세밀한 튜닝(타임아웃, read/write 분리, SSL 옵션 등)이 제한적이다. 세밀한 제어가 필요하면 아래 YAML/Config 방식으로 넘어간다.

---

## 설정 방식: YAML 파일 vs Config Bean

Redisson 특유의 옵션(`readMode`, `subscriptionMode`, 커넥션 풀 크기, Codec 등)을 쓰려면 세 방식 중 하나를 선택한다.

### 방식 A: 외부 YAML 파일 (`spring.redis.redisson.file`)

```yaml
# application.yml
spring:
  data:
    redis:
      host: localhost
      port: 6379
  redis:
    redisson:
      file: classpath:redisson.yml    # ← Redisson 전용 설정
```

```yaml
# src/main/resources/redisson.yml
singleServerConfig:
  address: "redis://localhost:6379"
  password: null
  database: 0
  connectionPoolSize: 64
  connectionMinimumIdleSize: 10
  subscriptionConnectionPoolSize: 50
  idleConnectionTimeout: 10000
  connectTimeout: 10000
  timeout: 3000
  retryAttempts: 3
  retryInterval: 1500
codec: !<org.redisson.codec.JsonJacksonCodec> {}
threads: 16
nettyThreads: 32
```

> 주의: Spring Boot 3.x라도 Redisson 전용 설정 키는 여전히 **`spring.redis.redisson.*`** 이다. `spring.data.redis.redisson.*`가 아니므로 혼동 금지.

### 방식 B: 인라인 Config (`spring.redis.redisson.config`)

```yaml
spring:
  redis:
    redisson:
      config: |
        clusterServersConfig:
          idleConnectionTimeout: 10000
          connectTimeout: 10000
          timeout: 3000
          retryAttempts: 3
          readMode: "SLAVE"
          subscriptionMode: "MASTER"
          nodeAddresses:
            - "redis://10.0.0.1:7000"
            - "redis://10.0.0.2:7000"
            - "redis://10.0.0.3:7000"
        codec: !<org.redisson.codec.JsonJacksonCodec> {}
```

### 방식 C: Config Bean 직접 등록

세밀한 프로그래밍 제어·조건부 구성·테스트 치환이 필요할 때.

```java
@Configuration
public class RedissonConfig {

    @Bean(destroyMethod = "shutdown")
    public RedissonClient redissonClient(
            @Value("${redis.address}") String address,
            @Value("${redis.password:}") String password
    ) {
        Config config = new Config();
        config.useSingleServer()
              .setAddress(address)             // "redis://host:port"
              .setPassword(password.isBlank() ? null : password)
              .setConnectionPoolSize(64)
              .setConnectionMinimumIdleSize(10)
              .setTimeout(3000)
              .setRetryAttempts(3);
        config.setCodec(new JsonJacksonCodec());
        return Redisson.create(config);
    }
}
```

- `destroyMethod = "shutdown"`을 반드시 명시해야 애플리케이션 종료 시 Netty 리소스가 정리된다.
- `@ConditionalOnMissingBean`으로 인해 사용자가 직접 `RedissonClient` 빈을 선언하면 자동 구성은 비활성화된다.

### 선택 기준

| 상황 | 권장 방식 |
|------|----------|
| 단순 설정, 환경변수 치환 중심 | A (외부 YAML 파일) |
| application.yml 하나로 통합 관리 | B (인라인 config) |
| 동적 구성, 테스트 시 Embedded Redis 치환 | C (Config Bean) |

---

## 분산 락 (RLock, RReadWriteLock, RSemaphore)

### 핵심 메서드 시그니처 (`org.redisson.api.RLock`)

```java
// 확장 메서드 (Redisson 전용)
boolean tryLock(long waitTime, long leaseTime, TimeUnit unit) throws InterruptedException;
void    lock(long leaseTime, TimeUnit unit);
void    lockInterruptibly(long leaseTime, TimeUnit unit) throws InterruptedException;
boolean isLocked();
boolean isHeldByCurrentThread();
boolean forceUnlock();

// java.util.concurrent.locks.Lock 상속 메서드도 사용 가능
void    lock();
boolean tryLock();
void    unlock();
```

### 표준 사용 패턴 — try-finally 필수

```java
@Service
@RequiredArgsConstructor
public class OrderService {

    private final RedissonClient redisson;

    public void placeOrder(Long orderId) {
        RLock lock = redisson.getLock("lock:order:" + orderId);
        boolean acquired = false;
        try {
            // waitTime=3초까지 대기, 획득 후 leaseTime=10초 뒤 자동 해제
            acquired = lock.tryLock(3, 10, TimeUnit.SECONDS);
            if (!acquired) {
                throw new IllegalStateException("lock not acquired: " + orderId);
            }
            // --- 임계 영역 ---
            doPlaceOrder(orderId);
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

**세 파라미터의 의미:**

| 파라미터 | 의미 |
|----------|------|
| `waitTime` | 락 획득을 대기하는 최대 시간. 초과 시 `false` 반환 |
| `leaseTime` | 락을 **자동으로 해제**하기까지의 시간. 크리티컬 섹션이 예상보다 길어져도 이 시간 지나면 풀림 |
| `unit` | `TimeUnit` — SECONDS/MILLISECONDS 등 |

> 주의: `leaseTime`을 너무 짧게 잡으면 작업 도중 락이 풀려 **다른 워커가 진입**할 수 있다. 반대로 너무 길게 잡으면 프로세스가 죽었을 때 복구가 늦다. `leaseTime = -1`로 주면 **Watchdog**이 30초마다 자동 갱신하지만(`lockWatchdogTimeout` 기본 30초), 프로세스가 살아있는 한 영원히 풀리지 않는다.
>
> `leaseTime`을 명시적으로 부여하면 Watchdog이 **동작하지 않는다**. 둘 중 하나만 쓴다.

### 절대 하면 안 되는 패턴

```java
// ❌ try-finally 없음 — 임계 영역에서 예외 시 락 영구 점유
RLock lock = redisson.getLock("x");
lock.lock();
doWork();          // 여기서 예외 나면 unlock() 호출 안 됨
lock.unlock();

// ❌ isHeldByCurrentThread() 체크 없이 unlock() — 다른 스레드의 락 해제 시도 시 예외
finally {
    lock.unlock();
}

// ❌ 획득 실패(false)인데 finally에서 unlock() 호출
boolean ok = lock.tryLock(...);   // false
// ... ok 체크 없이 unlock() 호출 시 IllegalMonitorStateException
```

### Fair Lock — FIFO 순서 보장

```java
RLock fairLock = redisson.getFairLock("lock:order:queue");
fairLock.tryLock(3, 10, TimeUnit.SECONDS);
```

### ReadWriteLock — 읽기 다수, 쓰기 단일

```java
RReadWriteLock rwLock = redisson.getReadWriteLock("rw:cache");

// 읽기 락 (여러 스레드 동시 획득 가능)
RLock readLock = rwLock.readLock();
readLock.lock(5, TimeUnit.SECONDS);
try { return cache.get(key); } finally { readLock.unlock(); }

// 쓰기 락 (단일 스레드 독점)
RLock writeLock = rwLock.writeLock();
writeLock.lock(5, TimeUnit.SECONDS);
try { cache.put(key, val); } finally { writeLock.unlock(); }
```

### Semaphore — N개 허가

```java
RSemaphore sem = redisson.getSemaphore("sem:api:quota");
sem.trySetPermits(10);                                // 최초 1회 허가 수 설정
if (sem.tryAcquire(1, 3, TimeUnit.SECONDS)) {
    try { callExternalApi(); } finally { sem.release(); }
}
```

### MultiLock — 여러 락 원자적 동시 획득 (RedLock 대체)

```java
RLock l1 = redissonA.getLock("l1");
RLock l2 = redissonB.getLock("l2");
RLock l3 = redissonC.getLock("l3");

RLock multi = redisson.getMultiLock(l1, l2, l3);
multi.tryLock(3, 10, TimeUnit.SECONDS);
try { ... } finally { multi.unlock(); }
```

> 과거 `getRedLock()`은 `@Deprecated` 처리되었으며 **`getMultiLock()`** 사용이 권장된다.

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
