---
name: ehcache-2-legacy
description: EhCache 2.10.x 레거시 로컬 인메모리 캐시 스킬 - Spring Boot 2.5 + Java 11 환경 기준. ehcache.xml 설정, TTL/eviction, 디스크 오버플로우, CacheEventListener, 프로그래매틱 CacheManager, Redis 2계층 캐시 패턴, EhCache 3.x 차이점
---

# EhCache 2.10.x 레거시 스킬 (Spring Boot 2.5 + Java 11)

> 소스: https://www.ehcache.org/documentation/2.8/ | https://www.ehcache.org/apidocs/2.10.4/ | https://github.com/ehcache/ehcache2 | https://docs.spring.io/spring-boot/docs/2.1.6.RELEASE/reference/html/boot-features-caching.html
> 검증일: 2026-04-23

> **⚠️ 중요 경고 — 신규 프로젝트 금지**
>
> - EhCache 2.x는 **FOSS 유지보수 종료 상태**다. 공식 공지에 따르면 2023년 9월 이후 오픈소스 2.x 라인은 더 이상 유지되지 않는다.
> - 2.10.9.2 (2021-04-24 릴리스)가 사실상 마지막 OSS 패치이며, 이후 보안 패치도 매우 드물다.
> - **신규 프로젝트는 반드시 EhCache 3.x(JSR-107) 또는 Caffeine을 사용하라.** 이 스킬은 이미 EhCache 2.x로 운영 중인 Spring Boot 2.5 / Java 11 **레거시 시스템의 유지·보수**를 위한 것이다.
> - 클러스터(Terracotta) 구성은 상용 라이선스 이슈가 있다 — Fast Restartability(`LOCALRESTARTABLE`), BigMemory 등은 엔터프라이즈 상용 제품 기능이며 OSS에서는 `LOCALTEMPSWAP` 및 non-clustered 로컬 캐시만 자유롭게 사용 가능.

---

## 1. 의존성 설정

### pom.xml (Spring Boot 2.5 + Java 11)

```xml
<dependencies>
    <!-- Spring Cache 추상화 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-cache</artifactId>
    </dependency>

    <!-- EhCache 2.x (net.sf.ehcache 네임스페이스) -->
    <dependency>
        <groupId>net.sf.ehcache</groupId>
        <artifactId>ehcache</artifactId>
        <version>2.10.9.2</version>
    </dependency>
</dependencies>
```

- `net.sf.ehcache:ehcache:2.10.9.2` — 2.10 브랜치 마지막 공개 릴리스. Maven Central에 공개 (2021-04-24)
- 그룹 ID가 `net.sf.ehcache`인 점이 중요. EhCache 3.x는 `org.ehcache`로 완전히 다른 아티팩트다
- Spring Boot 2.5 기준 `spring-boot-starter-cache`가 `EhCacheCacheManager`(Spring Framework `org.springframework.cache.ehcache` 패키지)를 통해 2.x를 지원한다

### application.yml

```yaml
spring:
  cache:
    type: ehcache
    ehcache:
      config: classpath:ehcache.xml
```

> 주의: Spring Boot의 자동 감지 순서상 JSR-107(EhCache 3 포함) → EhCache 2.x → Caffeine → ... 순이다. EhCache 3 JAR이 동시에 클래스패스에 있으면 3이 우선 적용되어 설정이 무시될 수 있으니 2.x 단독 사용을 확인할 것.

---

## 2. `ehcache.xml` 설정

`src/main/resources/ehcache.xml`에 둔다.

### 기본 형태

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ehcache xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="http://www.ehcache.org/ehcache.xsd"
         updateCheck="false"
         monitoring="off"
         dynamicConfig="false">

    <!-- 디스크 오버플로우 저장 경로 -->
    <diskStore path="java.io.tmpdir/ehcache-app"/>

    <!-- 프로그래매틱 생성 캐시의 기본값 -->
    <defaultCache
            maxEntriesLocalHeap="10000"
            eternal="false"
            timeToIdleSeconds="120"
            timeToLiveSeconds="600"
            diskExpiryThreadIntervalSeconds="120"
            memoryStoreEvictionPolicy="LRU">
        <persistence strategy="localTempSwap"/>
    </defaultCache>

    <!-- 네임드 캐시 -->
    <cache name="users"
           maxEntriesLocalHeap="5000"
           eternal="false"
           timeToLiveSeconds="1800"
           timeToIdleSeconds="600"
           memoryStoreEvictionPolicy="LRU"/>

    <cache name="codes"
           maxEntriesLocalHeap="2000"
           eternal="true"
           memoryStoreEvictionPolicy="LFU"/>
</ehcache>
```

### 주요 속성

| 속성 | 의미 | 비고 |
|------|------|------|
| `maxEntriesLocalHeap` | 힙 메모리에 저장할 최대 엔트리 수 | `0`이면 무제한 |
| `eternal` | true면 TTL/TTI 무시하고 영구 보관 | 코드 성 데이터에 사용 |
| `timeToLiveSeconds` | 엔트리가 생성된 시점부터의 최대 생존 시간 (초) | `eternal=false`일 때만 적용 |
| `timeToIdleSeconds` | 마지막 접근 이후 유효 시간 (초) | `eternal=false`일 때만 적용 |
| `memoryStoreEvictionPolicy` | 힙 가득 찼을 때 축출 정책 | `LRU` (기본) / `LFU` / `FIFO` |
| `diskExpiryThreadIntervalSeconds` | 디스크 만료 스레드 실행 주기 (초) | 기본 120. 너무 작게 하면 디스크 락 경합 |
| `updateCheck` | EhCache 버전 업데이트 확인(외부 HTTP 호출) | 프로덕션에서는 `false` 권장 |

### 축출 정책 3가지

- **LRU** (Least Recently Used, 기본): 가장 오랫동안 접근되지 않은 항목부터 축출
- **LFU** (Least Frequently Used): 접근 빈도가 가장 낮은 항목부터 축출
- **FIFO** (First In First Out): 가장 먼저 들어온 항목부터 축출

`memoryStoreEvictionPolicy` 속성은 EhCache 1.2부터 지원되며 2.10에서도 유효하다.

---

## 3. 디스크 저장(오버플로우·영속화)

EhCache 2.6부터 `overflowToDisk` / `diskPersistent` 속성은 `<persistence strategy="...">`로 **대체**되었다. 2.10에서도 속성 자체는 동작하지만 신규 구성은 `<persistence>`를 쓰는 편이 낫다.

### 2.6+ 권장 방식: `<persistence strategy="...">`

```xml
<diskStore path="java.io.tmpdir/ehcache-app"/>

<cache name="products"
       maxEntriesLocalHeap="10000"
       maxEntriesLocalDisk="100000"
       eternal="false"
       timeToLiveSeconds="3600">
    <persistence strategy="localTempSwap"/>
</cache>
```

| 전략 | 효과 | 라이선스 |
|------|------|---------|
| `none` | 디스크 미사용 (힙 전용) | OSS |
| `localTempSwap` | 힙 초과분을 디스크로 스왑. 재시작 시 날아감 | OSS |
| `localRestartable` | RestartStore 사용, 재시작 후에도 복구 (Fast Restartability) | **Enterprise 상용** |
| `distributed` | Terracotta 클러스터 | **Enterprise 상용** |

> 주의: `localRestartable`, `distributed`는 BigMemory / Terracotta 엔터프라이즈 라이선스가 필요하다. OSS 환경에서는 `localTempSwap`까지만 쓸 수 있다.

### 레거시 속성(여전히 동작, 비권장)

```xml
<cache name="legacy"
       maxEntriesLocalHeap="1000"
       overflowToDisk="true"
       diskPersistent="false"
       diskExpiryThreadIntervalSeconds="120"
       eternal="false"
       timeToLiveSeconds="600"/>
```

- `overflowToDisk="true"` ≈ `<persistence strategy="localTempSwap"/>`
- `diskPersistent="true"`는 엔터프라이즈 기능(`localRestartable`)로 대체됨 — OSS에서는 신뢰할 수 없음
- 속성명 오타(`overFlowToDisk`, `OverflowToDisk`)는 무시되거나 파싱 경고만 남으므로 대소문자 정확히 작성

---

## 4. Spring Boot 통합

### 4-1. 어노테이션 기반 설정

```java
@Configuration
@EnableCaching
public class CacheConfig {
    // application.yml의 spring.cache.ehcache.config로 ehcache.xml을 지정하면
    // 추가 @Bean 정의 없이도 EhCacheCacheManager가 자동 구성된다.
}
```

### 4-2. 프로그래매틱 @Bean 설정 (YAML 대신 Java로)

```java
import net.sf.ehcache.CacheManager;
import org.springframework.cache.ehcache.EhCacheCacheManager;
import org.springframework.cache.ehcache.EhCacheManagerFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean(destroyMethod = "shutdown")
    public EhCacheManagerFactoryBean ehCacheManagerFactoryBean() {
        EhCacheManagerFactoryBean factory = new EhCacheManagerFactoryBean();
        factory.setConfigLocation(new ClassPathResource("ehcache.xml"));
        factory.setShared(true);   // 같은 JVM 내 중복 CacheManager 방지
        return factory;
    }

    @Bean
    public EhCacheCacheManager cacheManager(CacheManager ehCacheManager) {
        return new EhCacheCacheManager(ehCacheManager);
    }
}
```

- `EhCacheCacheManager` / `EhCacheManagerFactoryBean`은 **Spring Framework 제공 클래스** (`org.springframework.cache.ehcache` 패키지)
- `setShared(true)` — 같은 JVM 내에서 `CacheManager.getInstance()`와 Spring Bean이 같은 인스턴스를 공유하도록 한다

### 4-3. `@Cacheable` / `@CacheEvict` / `@CachePut`

```java
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Cacheable(value = "users", key = "#id")
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    @CachePut(value = "users", key = "#user.id")
    public User update(User user) {
        return userRepository.save(user);
    }

    @CacheEvict(value = "users", key = "#id")
    public void delete(Long id) {
        userRepository.deleteById(id);
    }

    @CacheEvict(value = "users", allEntries = true)
    public void evictAll() { }
}
```

- `value`는 `ehcache.xml`에 정의된 `<cache name="...">`과 일치해야 한다
- 정의되지 않은 캐시명 사용 시 `defaultCache` 템플릿으로 런타임에 생성된다
- `@EnableCaching`은 `@Configuration` 또는 `@SpringBootApplication` 클래스에 한 번만 선언

### 4-4. 키 생성 규칙 (흔한 실수)

Spring Cache 추상화의 기본 `KeyGenerator`는 다음 규칙으로 작동한다:

| 메서드 파라미터 수 | 생성 키 |
|--------------------|---------|
| 0개 | `SimpleKey.EMPTY` |
| 1개 | 그 파라미터 자체 (원시 타입이면 그대로, 객체면 해당 인스턴스) |
| 2개 이상 | `SimpleKey(param1, param2, ...)` — 모든 파라미터의 `hashCode`/`equals` 기반 |

흔한 실수:

```java
// 잘못 — 파라미터 하나지만 객체의 id로 키를 만들고 싶으면 SpEL 명시 필요
@Cacheable(value = "users")
public User get(UserCriteria criteria) { ... }

// 올바름 — SpEL로 키 필드 지정
@Cacheable(value = "users", key = "#criteria.id")
public User get(UserCriteria criteria) { ... }
```

- 파라미터 객체의 `equals/hashCode`가 올바르게 구현되지 않으면 캐시 히트율이 떨어지거나 엉뚱한 값이 조회된다
- `null` 반환을 캐시하지 않으려면 `@Cacheable(unless = "#result == null")` 사용

---

## 5. 프로그래매틱 CacheManager 접근

Spring을 쓰지 않거나, 배치 스크립트 등에서 EhCache를 직접 조작해야 할 때.

```java
import net.sf.ehcache.CacheManager;
import net.sf.ehcache.Cache;
import net.sf.ehcache.Element;

public class DirectCacheExample {

    public static void main(String[] args) {
        // classpath의 ehcache.xml을 자동으로 로드
        CacheManager cm = CacheManager.getInstance();

        // 네임드 캐시 접근
        Cache cache = cm.getCache("users");

        // put
        cache.put(new Element(1L, new User(1L, "alice")));

        // get — Element를 통해 감싸져 있음
        Element el = cache.get(1L);
        User user = (el != null) ? (User) el.getObjectValue() : null;

        // remove
        cache.remove(1L);

        // 전체 비우기
        cache.removeAll();

        // 애플리케이션 종료 시
        cm.shutdown();
    }
}
```

- `CacheManager.getInstance()`는 싱글턴 CacheManager를 반환 (2.5 이후에는 `CacheManager.create()`도 가능하지만 싱글턴과의 혼용 주의)
- `Element`는 key/value 래퍼. 값 꺼낼 때 `getObjectValue()` 또는 `getValue()`(deprecated는 아니지만 `getObjectValue()` 권장)
- `shutdown()` 호출 중요 — 디스크 스토어 정리 및 스레드 종료

---

## 6. CacheEventListener — 캐시 이벤트 훅

캐시에 put, update, remove, expired 등이 발생할 때 콜백을 받을 수 있다.

### 6-1. 리스너 구현 (CacheEventListenerAdapter 상속 권장)

```java
import net.sf.ehcache.Ehcache;
import net.sf.ehcache.Element;
import net.sf.ehcache.event.CacheEventListenerAdapter;

public class LoggingCacheListener extends CacheEventListenerAdapter {

    @Override
    public void notifyElementPut(Ehcache cache, Element element) {
        log.info("[{}] put key={}", cache.getName(), element.getObjectKey());
    }

    @Override
    public void notifyElementUpdated(Ehcache cache, Element element) {
        log.info("[{}] updated key={}", cache.getName(), element.getObjectKey());
    }

    @Override
    public void notifyElementRemoved(Ehcache cache, Element element) {
        log.info("[{}] removed key={}", cache.getName(), element.getObjectKey());
    }

    @Override
    public void notifyElementExpired(Ehcache cache, Element element) {
        log.info("[{}] expired key={}", cache.getName(), element.getObjectKey());
    }

    @Override
    public void notifyElementEvicted(Ehcache cache, Element element) {
        log.info("[{}] evicted key={}", cache.getName(), element.getObjectKey());
    }
}
```

`CacheEventListener` 인터페이스를 직접 구현해도 되지만, 모든 메서드(`notifyRemoveAll`, `dispose`, `clone` 등)를 다뤄야 한다. `CacheEventListenerAdapter`를 상속하면 필요한 메서드만 오버라이드할 수 있다.

> 주의: 콜백은 **동기·동일 스레드**에서 호출된다. 리스너에서 오래 걸리는 작업(외부 HTTP 호출 등)을 하면 `cache.put()` 등이 블로킹된다. 필요하면 내부에서 별도 스레드로 위임한다.

### 6-2. CacheEventListenerFactory

XML에 등록하려면 팩토리가 필요하다.

```java
import net.sf.ehcache.event.CacheEventListener;
import net.sf.ehcache.event.CacheEventListenerFactory;

import java.util.Properties;

public class LoggingCacheListenerFactory extends CacheEventListenerFactory {
    @Override
    public CacheEventListener createCacheEventListener(Properties properties) {
        // properties는 XML의 properties 속성으로 넘어온 name-value 쌍
        return new LoggingCacheListener();
    }
}
```

### 6-3. ehcache.xml에서 등록

```xml
<cache name="users"
       maxEntriesLocalHeap="5000"
       eternal="false"
       timeToLiveSeconds="1800">
    <cacheEventListenerFactory
            class="com.example.cache.LoggingCacheListenerFactory"
            properties="env=prod"
            propertySeparator=","/>
</cache>
```

### 6-4. 프로그래매틱 등록

```java
Cache cache = CacheManager.getInstance().getCache("users");
cache.getCacheEventNotificationService()
     .registerListener(new LoggingCacheListener());
```

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
