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

> → references/REFERENCE.md §5 분산 락 (RLock)

---

> → references/REFERENCE.md §6 자료구조 · 캐시 패턴

---

> → references/REFERENCE.md §7 직렬화 코덱 선택

---

> → references/REFERENCE.md §8 4.x 신규 기능 (커뮤니티/PRO 구분 주의)

---

> → references/REFERENCE.md §9 커넥션 풀 설정

---

> → references/REFERENCE.md §10 마이그레이션 체크리스트 (3.x → 4.x)

---

> → references/REFERENCE.md §11 이 스킬을 쓸 때 / 쓰지 않을 때

---

> → references/REFERENCE.md §12 흔한 실수

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
