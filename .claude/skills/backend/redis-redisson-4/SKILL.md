---
name: redis-redisson-4
description: Redisson 4.x — 3.x→4.x Breaking Change 전체(Config 최상위 재편·패키지 이동·RScript enum 개명·Spring Cache/Transaction 모듈 분리·코덱 제거), Spring Boot 3.x/4.x 호환 매트릭스, 분산 락(RLock·tryLock·watchdog·NonReentrant·Fenced), RMap/RBucket 자료구조, 캐시 패턴, 코덱 선택, 커넥션 풀 설정, 실제 마이그레이션 코드 diff
---

# Redisson 4.x (Valkey & Redis Java Client)

> 소스: https://github.com/redisson/redisson/releases/tag/redisson-4.0.0 | https://raw.githubusercontent.com/redisson/redisson/master/CHANGELOG.md | https://github.com/redisson/redisson (README) | https://redisson.pro/docs/configuration/ | https://redisson.pro/docs/integration-with-spring/ | https://redisson.pro/docs/data-and-services/data-serialization/ | 소스 코드: `org/redisson/config/Config.java`, `BaseConfig.java`, `org/redisson/api/RLock.java`, `RBucket.java`, `redisson-spring/redisson-spring-boot-starter/pom.xml`
> 검증일: 2026-08-11

---

## 이 스킬의 범위 — Redisson 스킬 3종 역할 분리

| 스킬 | 대상 버전 | 언제 참조하나 |
|------|-----------|---------------|
| `redis-redisson-legacy` | Redisson **2.15.2** | Spring Boot 2.5 + Java 11 고정 레거시 유지보수 |
| `redis-redisson-modern` | Redisson **3.18.1 ~ 3.51.x** | Spring Boot 3.x + Java 17 운영 중, 3.x 라인 유지 |
| **`redis-redisson-4` (이 스킬)** | Redisson **4.0.0 ~ 4.7.x** | 4.x 신규 도입, 또는 **3.x → 4.x 업그레이드** |

- **API 기본 사용법(RLock/RMap/RTopic 등 개념·표준 패턴)은 3종이 거의 동일**하다. 이 스킬은 **4.x에서 달라진 것**과 **마이그레이션**에 집중하며, 공통 패턴은 요약만 싣는다. 3.x 상세 예제가 필요하면 `redis-redisson-modern`을 참조한다.
- 2.x → 4.x 직행은 권장하지 않는다. `redis-redisson-legacy` → 3.x 안정화 → 4.x 순서로 두 단계로 나눈다(2.x→3.x는 패키지·`RFuture` 시그니처가 통째로 바뀌므로 4.x 변경과 섞으면 원인 추적이 불가능해진다).

---

## 1. 버전·호환성 매트릭스

| 항목 | 값 | 근거 |
|------|-----|------|
| 4.x 최신 안정판 | **4.7.0** (2026-08-04) | CHANGELOG `04-August-2026 - 4.7.0`, GitHub Releases |
| 4.0.0 최초 릴리스 | **2025-12-16** | CHANGELOG `16-Dec-2025 - 4.0.0` |
| 주요 중간 릴리스 | 4.1.0(2025-12-30), 4.2.0(2026-02-05), 4.3.0(2026-03-02), 4.4.0(2026-05-12), 4.5.0(2026-06-05), 4.6.0(2026-06-15), 4.6.1(2026-06-18) | CHANGELOG |
| **최소 JDK** | **Java 8+** (상향 없음) | README "JDK 1.8+ up to the latest version", `pom.xml` `maven.compiler.release=8` |
| Redis 지원 | 3.0 ~ 최신 | README |
| Valkey 지원 | 7.2.5 ~ 최신 | README |
| **라이선스** | **Apache License 2.0 — 변경 없음** | `pom.xml` `<licenses>` = "Apache v2" |
| 상용 에디션 | Redisson PRO (`pro.redisson:redisson`) 별도 존재 — 4.x에서 새로 생긴 것 아님 | 공식 docs |

> 주의: **4.x는 Java 버전 상향을 요구하지 않는다.** "메이저 버전 올리면 Java 17 필요하겠지"라는 가정으로 JDK를 먼저 올리지 말 것. 다만 Spring Boot 4.x 스타터를 함께 쓴다면 **Spring Boot 4.x가 요구하는 JDK**(17 이상)를 따라야 한다 — 제약의 출처는 Redisson이 아니라 Spring Boot다.

> 주의: 라이선스는 Apache 2.0 그대로다. 단, **일부 신규 기능은 커뮤니티 에디션에 없다**(§8 참조). 릴리스 노트 헤드라인 기능을 무료 에디션 기준으로 착각하지 말 것.

### Spring Boot 호환

`redisson-spring-boot-starter`는 Spring Boot **1.3.x ~ 4.1.x**를 커버하며, 스타터 아티팩트는 **가장 최신 Spring Boot에 맞는 `redisson-spring-data-XX` 모듈을 기본 번들**한다.

| Redisson 버전 | 스타터가 기본 번들하는 모듈 | 대응 Spring Boot |
|---------------|---------------------------|------------------|
| 4.7.0 | `redisson-spring-data-41` | Spring Boot 4.1.x |
| 4.6.1 | `redisson-spring-data-40` | Spring Boot 4.0.x |

레포에 존재하는 모듈: `-16 -17 -18 -20 -21 -22 -23 -24 -25 -26 -27 -30 -31 -32 -33 -34 -35 -40 -41`
→ **Spring Boot 3.0 ~ 3.5는 `-30` ~ `-35` 모듈로 Redisson 4.x에서도 계속 지원된다.**

> 주의: **"Redisson 4.x = Spring Boot 4.x 필수"가 아니다.** Spring Boot 3.x에 머문 채 Redisson만 4.x로 올리는 것이 가능하며, 이 경우 스타터가 끌어오는 `redisson-spring-data-41`을 **exclude하고 자기 Boot 버전에 맞는 모듈을 직접 선언**해야 한다(§2 참조). 이것을 놓치면 Spring Data Redis 4.1 클래스가 클래스패스에 섞여 `NoSuchMethodError`/`ClassNotFoundException`이 런타임에 터진다.

---

## 2. 의존성 설정

### Spring Boot 4.x 사용 (기본값 그대로)

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>4.7.0</version>
</dependency>
```

```groovy
implementation 'org.redisson:redisson-spring-boot-starter:4.7.0'
```

### Spring Boot 3.x 유지 + Redisson만 4.x로 (실무에서 가장 흔한 조합)

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>4.7.0</version>
    <exclusions>
        <exclusion>
            <groupId>org.redisson</groupId>
            <artifactId>redisson-spring-data-41</artifactId>  <!-- Boot 4.1용 기본 번들 제거 -->
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-data-35</artifactId>          <!-- Spring Boot 3.5 -->
    <version>4.7.0</version>
</dependency>
```

### Spring Cache / Spring Transaction을 쓴다면 — 별도 의존성 필수 (4.1.0 변경)

스타터 `pom.xml`은 `redisson-spring-cache`·`redisson-spring-transaction`을 **`<optional>true</optional>`로 선언**한다. optional 의존성은 **하위 프로젝트로 전이(transitive)되지 않으므로**, 스타터만 넣으면 `RedissonSpringCacheManager`를 찾을 수 없다.

```xml
<!-- @EnableCaching + RedissonSpringCacheManager 사용 시 -->
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-cache</artifactId>
    <version>4.7.0</version>
</dependency>

<!-- RedissonTransactionManager 사용 시 -->
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-transaction</artifactId>
    <version>4.7.0</version>
</dependency>
```

> 주의: 3.x에서 4.x로 올린 직후 가장 많이 터지는 컴파일 에러가 `RedissonSpringCacheManager` / `RedissonTransactionManager` **미해결(cannot find symbol)**이다. 코드가 잘못된 게 아니라 **모듈이 분리**된 것이다(4.1.0).

### core만 사용 (Spring 미사용)

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson</artifactId>
    <version>4.7.0</version>
</dependency>
```

---

## 3. 3.x → 4.x Breaking Change 전체 목록

### 3-1. 4.0.0 (2025-12-16)

| # | 변경 | 영향 |
|---|------|------|
| 1 | **JSON 설정 포맷 지원 제거** | `Config.fromJSON()` / `toJSON()` 사용 코드·`.json` 설정 파일 전면 YAML 전환 |
| 2 | **인증 파라미터가 `Config` 최상위로 이동** | `useSingleServer().setPassword(...)` → `config.setPassword(...)` |
| 3 | **`nameMapper` / `commandMapper`가 `Config` 최상위로 이동** | 서버 설정 블록에서 루트로 |
| 4 | **ssl 파라미터가 `Config` 최상위로 이동** | `setSslKeystore`·`setSslTruststore`·`setSslVerificationMode` 등 전부 |
| 5 | **tcp / keepAlive 파라미터가 `Config` 최상위로 이동** | `setTcpNoDelay`·`setTcpKeepAlive*`·`setTcpUserTimeout` |
| 6 | `RedissonClient.getNodesGroup()`·`getClusterNodesGroup()` **제거** | 노드 조회 코드 재작성 |
| 7 | `RGeo`의 deprecated 메서드 **제거** | Geo API 재확인 |
| 8 | `RFuture`의 deprecated 메서드 **제거** | `RFuture` 콜백/변환 코드 재확인 |
| 9 | **Spring XML 설정 지원 제거** | `<redisson:client/>` XML 네임스페이스 → Java Config 전환 |
| 10 | **Redisson 자체 Spring Session 구현 제거** | 표준 `spring-session-data-redis`로 전환 |
| 11 | `RScript.ReturnType.MULTI` → **`LIST`** | Lua 스크립트 호출부 컴파일 에러 |
| 12 | `RScript.ReturnType.STATUS` → **`STRING`** | 〃 |
| 13 | `RScript.ReturnType.INTEGER` → **`LONG`** | 〃 |
| 14 | `NameMapper`, `NatMapper` → **`org.redisson.config`** 패키지 | import 수정 |
| 15 | `GeoUnit`, `GeoPosition`, `GeoOrder`, `GeoEntry` → **`org.redisson.api.geo`** | import 수정 |
| 16 | `StreamConsumer`, `StreamGroup`, `StreamInfo`, `StreamMessageId`, `PendingEntry`, `PendingResult`, `AutoClaimResult`, `FastAutoClaimResult` → **`org.redisson.api.stream`** | import 수정 |
| 17 | Config 파싱이 SnakeYAML 직접 사용으로 변경 | 비표준 YAML(탭 들여쓰기, 중복 키 등)이 이전엔 통과했다면 실패할 수 있음 |

### 3-2. 4.1.0 (2025-12-30)

| 변경 | 영향 |
|------|------|
| **Spring Cache → `redisson-spring-cache` 모듈로 분리** | 의존성 추가 필요 (§2) |
| **Spring Transaction → `redisson-spring-transaction` 모듈로 분리** | 의존성 추가 필요 |
| **코덱 제거: `FstCodec`, `FuryCodec`, `MarshallingCodec`, `SnappyCodec`** | 해당 코덱 설정 시 클래스 미존재 → 기동 실패 (§7 대체표) |

### 3-3. 4.2.0 이후

| 버전 | 변경 |
|------|------|
| 4.2.0 (2026-02-05) | `RSet.containsEach()` 반환 타입이 **`Set`으로 변경** |
| 4.5.0 (2026-06-05) | **map listener 시그니처 변경** — field name 파라미터 추가. `EntryCreatedListener` 등 커스텀 리스너 구현체 전부 수정 필요 |
| 4.7.0 (2026-08-04) | `@RFieldAccessor` deprecated → **`@RGetter` / `@RSetter`** 로 대체 (Live Object 사용 시) |

### 3-4. 제거는 아니지만 4.x에서 deprecated된 것 (지금 고쳐두면 다음 메이저에서 안 터짐)

| Deprecated | 대체 |
|------------|------|
| `BaseConfig`의 인증 관련 setter(`setPassword`/`setUsername`/`setCredentialsResolver`) | `Config`의 동명 메서드 |
| `BaseConfig.setSsl*` 전부, `setTcpNoDelay`, `setTcpKeepAlive*`, `setTcpUserTimeout`, `setKeepAlive` | 동명의 `Config.setXxx` |
| `BaseConfig.setNameMapper` / `setCommandMapper` | `Config.setNameMapper` / `setCommandMapper` |
| `setRetryInterval(int)` | **`setRetryDelay(DelayStrategy)`** |
| `setSslEnableEndpointIdentification(boolean)` | **`setSslVerificationMode(SslVerificationMode)`** |
| `RBucket.set/getAndSet/setIfExists/trySet(V, long, TimeUnit)` | **`set/getAndSet/setIfExists(V, Duration)`**, `trySet` → **`setIfAbsent`** |
| `RedissonClient.getRedLock(...)` | `getLock()` 또는 **`getFencedLock()`** |

> 주의: `BaseConfig`의 이동 대상 setter들은 **제거된 게 아니라 `@Deprecated`로 남아 있다.** 그래서 3.x 코드가 **컴파일은 그대로 통과**한다. "빌드 됐으니 마이그레이션 끝"이라고 판단하면 안 된다 — 특히 **YAML 설정 파일은 컴파일 대상이 아니므로 조용히 무시되거나 파싱 오류로 기동 시점에 터진다.** §4의 설정 파일 이관을 반드시 수행한다.

---

## 4. 실제 마이그레이션 코드 diff

### 4-1. Config Bean (Java)

```java
// ❌ 3.x 스타일 — 4.x에서 컴파일은 되지만 전부 @Deprecated
@Bean(destroyMethod = "shutdown")
public RedissonClient redissonClient(@Value("${app.redis.secret:}") String secret) {
    Config config = new Config();
    config.useSingleServer()
          .setAddress("redis://127.0.0.1:6379")
          .setUsername("app")
          .setPassword(secret)            // ← Config 레벨로 이동됨
          .setTcpNoDelay(true)            // ← Config 레벨로 이동됨
          .setSslVerificationMode(SslVerificationMode.STRICT)  // ← Config 레벨로 이동됨
          .setRetryInterval(1500)         // ← setRetryDelay 로 대체됨
          .setConnectionPoolSize(64);
    config.setCodec(new Kryo5Codec());
    return Redisson.create(config);
}
```

```java
// ✅ 4.x 권장
import org.redisson.config.Config;
import org.redisson.config.ConstantDelay;          // 또는 EqualJitterDelay / FullJitterDelay / DecorrelatedJitterDelay
import org.redisson.config.SslVerificationMode;
import org.redisson.codec.Kryo5Codec;
import java.time.Duration;

@Bean(destroyMethod = "shutdown")
public RedissonClient redissonClient(@Value("${app.redis.secret:}") String secret) {
    Config config = new Config();

    // --- Config 최상위로 올라온 항목들 (값은 환경변수/시크릿 매니저에서 주입) ---
    config.setUsername("app");
    config.setPassword(secret.isBlank() ? null : secret);
    config.setTcpNoDelay(true);
    config.setSslVerificationMode(SslVerificationMode.STRICT);
    config.setCodec(new Kryo5Codec());

    // --- 서버 블록에 남는 항목들 (address·database·pool·timeout·retryAttempts) ---
    config.useSingleServer()
          .setAddress("redis://127.0.0.1:6379")
          .setDatabase(0)
          .setConnectionPoolSize(64)
          .setConnectionMinimumIdleSize(24)
          .setSubscriptionConnectionPoolSize(50)
          .setConnectTimeout(3000)
          .setTimeout(3000)
          .setRetryAttempts(3)
          .setRetryDelay(new ConstantDelay(Duration.ofMillis(1500)));  // ← setRetryInterval 대체

    return Redisson.create(config);
}
```

**재시도 지연 전략(`DelayStrategy`) 구현체 4종** — `org.redisson.config` 패키지:

| 클래스 | 생성자 | 성격 |
|--------|--------|------|
| `ConstantDelay` | `(Duration delay)` | 고정 간격. 3.x `setRetryInterval`과 동등 |
| `EqualJitterDelay` | `(Duration baseDelay, Duration maxDelay)` | 지수 백오프의 절반 고정 + 절반 랜덤 |
| `FullJitterDelay` | `(Duration baseDelay, Duration maxDelay)` | 전 구간 랜덤 — thundering herd 억제에 가장 강함 |
| `DecorrelatedJitterDelay` | `(Duration baseDelay, Duration maxDelay)` | 직전 지연에 연동된 랜덤 |

> 다수 인스턴스가 동시에 재접속을 시도하는 클러스터/장애복구 상황에서는 `ConstantDelay`보다 jitter 계열을 쓴다.

### 4-2. YAML 설정 파일 — 최상위 레벨로 키 이동

```yaml
# ❌ 3.x — 인증/ssl/tcp 키가 서버 블록 안에 있음
singleServerConfig:
  address: "redis://127.0.0.1:6379"
  username: "app"
  password: ${REDIS_SECRET}
  tcpNoDelay: true
  sslVerificationMode: "STRICT"
  connectionPoolSize: 64
  timeout: 3000
codec: !<org.redisson.codec.Kryo5Codec> {}
```

```yaml
# ✅ 4.x — 인증/ssl/tcp/nameMapper 는 루트 레벨
singleServerConfig:
  address: "redis://127.0.0.1:6379"
  database: 0
  connectionPoolSize: 64
  connectionMinimumIdleSize: 24
  subscriptionConnectionPoolSize: 50
  idleConnectionTimeout: 10000
  connectTimeout: 10000
  timeout: 3000
  retryAttempts: 3
username: "app"
password: ${REDIS_SECRET}
tcpNoDelay: true
sslVerificationMode: "STRICT"
codec: !<org.redisson.codec.Kryo5Codec> {}
threads: 16
nettyThreads: 32
```

**JSON 설정 파일은 4.x에서 지원되지 않는다.**

```java
// ❌ 4.0.0에서 제거
Config config = Config.fromJSON(new File("redisson.json"));

// ✅ YAML로 전환
Config config = Config.fromYAML(new File("redisson.yaml"));
```

### 4-3. Spring Boot 프로퍼티 키 — 변경 없음

```yaml
spring:
  data:
    redis:                       # Spring Boot 3.x·4.x 공통 (Boot 2.7 이하는 spring.redis.*)
      host: localhost
      port: 6379
  redis:
    redisson:
      file: classpath:redisson.yaml     # ← 4.x에서도 그대로 spring.redis.redisson.*
```

> 주의: Redisson 전용 키는 4.x에서도 여전히 **`spring.redis.redisson.config` / `spring.redis.redisson.file`** 두 개뿐이다(`@ConfigurationProperties(prefix = "spring.redis.redisson")`). `spring.data.redis.redisson.*`로 옮기면 **조용히 무시**된다 — 3.x와 동일한 함정이다.

### 4-4. RScript enum 개명

```java
// ❌ 3.x
List<Object> res = redisson.getScript()
        .eval(RScript.Mode.READ_ONLY, luaScript, RScript.ReturnType.MULTI, keys);
Long n = redisson.getScript()
        .eval(RScript.Mode.READ_WRITE, luaScript, RScript.ReturnType.INTEGER, keys);
String s = redisson.getScript()
        .eval(RScript.Mode.READ_WRITE, luaScript, RScript.ReturnType.STATUS, keys);

// ✅ 4.x
List<Object> res = redisson.getScript()
        .eval(RScript.Mode.READ_ONLY, luaScript, RScript.ReturnType.LIST, keys);
Long n = redisson.getScript()
        .eval(RScript.Mode.READ_WRITE, luaScript, RScript.ReturnType.LONG, keys);
String s = redisson.getScript()
        .eval(RScript.Mode.READ_WRITE, luaScript, RScript.ReturnType.STRING, keys);
```

### 4-5. import 이관 (3개 패키지)

```java
// ❌ 3.x
import org.redisson.api.NameMapper;
import org.redisson.api.NatMapper;
import org.redisson.api.GeoUnit;
import org.redisson.api.GeoPosition;
import org.redisson.api.GeoOrder;
import org.redisson.api.GeoEntry;
import org.redisson.api.StreamMessageId;
import org.redisson.api.StreamGroup;
import org.redisson.api.PendingEntry;

// ✅ 4.x
import org.redisson.config.NameMapper;
import org.redisson.config.NatMapper;
import org.redisson.api.geo.GeoUnit;
import org.redisson.api.geo.GeoPosition;
import org.redisson.api.geo.GeoOrder;
import org.redisson.api.geo.GeoEntry;
import org.redisson.api.stream.StreamMessageId;
import org.redisson.api.stream.StreamGroup;
import org.redisson.api.stream.PendingEntry;
```

일괄 치환용 정규식(검토 후 적용):

```
org\.redisson\.api\.(NameMapper|NatMapper)                   → org.redisson.config.$1
org\.redisson\.api\.(GeoUnit|GeoPosition|GeoOrder|GeoEntry)  → org.redisson.api.geo.$1
org\.redisson\.api\.(Stream(Consumer|Group|Info|MessageId)|PendingEntry|PendingResult|(Fast)?AutoClaimResult) → org.redisson.api.stream.$1
```

### 4-6. TTL 파라미터 — `TimeUnit` → `Duration`

```java
// ❌ deprecated (동작은 함)
bucket.set(user, 10, TimeUnit.MINUTES);
bucket.trySet(user, 10, TimeUnit.MINUTES);
bucket.setIfExists(user, 10, TimeUnit.MINUTES);
bucket.getAndSet(user, 10, TimeUnit.MINUTES);

// ✅ 4.x 권장
bucket.set(user, Duration.ofMinutes(10));
bucket.setIfAbsent(user, Duration.ofMinutes(10));   // trySet 대체
bucket.setIfExists(user, Duration.ofMinutes(10));
bucket.getAndSet(user, Duration.ofMinutes(10));
```

### 4-7. Spring Session — 자체 구현 제거

```java
// ❌ 4.0.0에서 제거된 Redisson 자체 Spring Session 구현
// (org.redisson.spring.session.* 기반 설정)

// ✅ 표준 spring-session-data-redis 사용 + RedissonConnectionFactory
@EnableRedisHttpSession
@Configuration
public class SessionConfig { }
```

`redisson-spring-data-XX`가 제공하는 `RedissonConnectionFactory`가 `spring-session-data-redis`의 백엔드로 동작한다.

### 4-8. Spring XML 설정 제거

```xml
<!-- ❌ 4.0.0에서 제거 -->
<redisson:client id="redissonClient">
    <redisson:single-server address="redis://127.0.0.1:6379"/>
</redisson:client>
```

→ §4-1의 Java `@Configuration` 방식으로 전환한다. XML 설정에 의존하던 레거시 프로젝트는 이 항목이 4.x 업그레이드의 최대 작업량이다.

---

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
