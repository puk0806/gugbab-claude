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
