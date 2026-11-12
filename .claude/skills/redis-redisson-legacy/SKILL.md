---
name: redis-redisson-legacy
description: Redisson 2.15.2 레거시(Spring Boot 2.5 + Java 11 + spring-data-redis 2.6.0) 함정과 3.x/4.x API 섞기 막기 — CVE-2023-42809, starter 2.x 대신 core + 수동 @Bean, 2.x vs 3.x 차이표, redis:// 스킴·shutdown·Cluster DB0, RLock leaseTime 지정 시 watchdog 비활성·isHeldByCurrentThread, Redis Streams 미지원, RedissonSpringCacheManager ms 단위·Spring 5.3 호환 확인, RedisTemplate 직렬화 불일치, 3.17.x 이하 업그레이드 경계
---

# Redis + Redisson 2.15.2 레거시 스킬

> 소스: https://github.com/redisson/redisson/wiki | https://github.com/redisson/redisson/milestone/89 | https://github.com/redisson/redisson/blob/master/CHANGELOG.md | https://redisson.pro/docs/integration-with-spring/
> 검증일: 2026-11-09 (2026-04-23 최초 검증 · 재검증 이력은 verification.md 8절 참조)

> **주의 — 레거시 경고:** Redisson 2.15.2는 2019년 2월 릴리스된 매우 오래된 버전입니다(GitHub milestone #89는 2019-02-14 종료). 보안 패치·버그 수정이 오래 중단됐으며, 최신 Valkey·Redis 7.x 기능을 지원하지 않습니다. **가능하면 Redisson 3.x로 업그레이드를 강력히 권장**합니다. 이 스킬은 기존 스택이 Redisson 2.15.2에 고정된 프로젝트(업그레이드 전까지의 유지보수·신규 기능 추가)를 위한 패턴 가이드입니다.
>
> **⚠️ 주의 — CVE (2026-09-26 추가):** Redisson **3.22.0 미만 전 버전**(2.15.2 포함)에는 **CVE-2023-42809**(안전하지 않은 역직렬화) 취약점이 있습니다. Redis 서버 응답에 포함된 Java 객체를 클라이언트가 추가 검증 없이 역직렬화하는 구조라, 공격자가 클라이언트를 악성 서버에 연결시키면 임의 코드 실행으로 이어질 수 있습니다. 신뢰할 수 없는 네트워크·멀티테넌트 환경에서 Redis 서버를 운용한다면 이 CVE가 직접적인 리스크입니다 — **3.x(3.22.0+)로 업그레이드가 최우선 대응책**이며, 당장 불가능하다면 최소한 Redis 서버 접근을 신뢰된 네트워크로 제한하세요.

> **주의 — 버전 매트릭스 이해:** 사용자 스택은 **Spring Boot 2.5 + Java 11 + spring-data-redis 2.6.0 + Redisson 2.15.2** 조합입니다. Redisson 2.x와 Spring Boot 2.5는 공식 호환 매트릭스에 포함되지 않은 조합이며, **`redisson-spring-boot-starter` 2.x 버전은 Spring Boot 1.5~2.0 시절에 맞춰져 있어 2.5와 직접 연동이 까다롭습니다**. 이 문서에서는 스타터 대신 **core `org.redisson:redisson:2.15.2`를 직접 의존하고 `RedissonClient`를 수동 `@Bean`으로 등록**하는 방식을 표준으로 소개합니다. 스타터를 꼭 써야 한다면 Redisson 3.x 업그레이드 경로를 우선 검토하세요.

---

## 이 스킬의 범위

`RLock`·`RMap`·`RBucket`·`RQueue`·`RTopic` 기본 사용법과 Single/Sentinel/Cluster 설정 메서드는 공식 문서 수준이라 싣지 않는다. 여기엔 **2.15.2 고정 환경의 함정과, 3.x/4.x 문서 API를 2.x에 잘못 쓰지 않도록 하는 경고**만 둔다. 3.x/4.x 쪽은 `redis-redisson-4`.

---

## 1. Redisson 2.x vs 3.x — 3.x 가이드 API를 2.x에 쓰지 말 것

| 항목 | Redisson 2.x (2.15.2) | Redisson 3.x |
|------|----------------------|---------------|
| 릴리스 시기 | 2.15.2: 2019-02-07 (2.x 마지막) | 3.x: 2018~2025-09 (3.52.0 이 마지막). 이후 4.x 라인(4.0.0 2025-12-16 ~ 4.8.0 2026-10-02)이 계속 유지 |
| 최소 Java | Java 1.6+ (실무는 8+) | Java 8+ (최신은 11/17) |
| 패키지 구조 | `org.redisson.*` 일부 내부 API 노출 | `org.redisson.api.*`로 깔끔히 정리 |
| Reactive API | RxJava 1 기반 | RxJava 2/3, Project Reactor |
| `RFuture` | 커스텀 Future | Netty `io.netty.util.concurrent.Future` 기반으로 일관 |
| Spring Boot | 1.5~2.0 타겟 | 2.x(≤3.17), 3.x(3.18+). Boot 4.x 는 Redisson 4.x 부터 |
| Spring Data Redis | 1.x~2.1 호환 | 모듈별 분리 (`redisson-spring-data-XX`) |
| Codec 기본값 | `JsonJacksonCodec` | `Kryo5Codec` (3.30+) 등 |
| Redis Streams | **미지원** | 지원 |

- 2.x에서 새로 만드는 컴포넌트도 **`org.redisson.api.*` 인터페이스**(`RLock`, `RMap`, `RTopic`)만 참조. 구현체 직접 참조 금지.
- 2.x vs 3.x 메서드 시그니처가 다르다 — 2.15.2 javadoc 기준으로 확인(https://www.javadoc.io/doc/org.redisson/redisson/2.8.2/ 가 2.x 시리즈 API 참조).

> 주의: Redisson 2.x의 `MessageListener`는 `org.redisson.api.listener.MessageListener` 경로. 3.x도 동일하나 2.x 초기 릴리스 일부에서는 `org.redisson.core.MessageListener` 경로였습니다. 2.15.2는 `api.listener` 경로 사용.

---

## 2. `RedissonClient` 수동 Bean 함정

- `@Bean(destroyMethod = "shutdown")` 필수 — 빠지면 종료 시 Netty 스레드가 안 끝난다.
- `setAddress`는 `redis://host:port`(SSL은 `rediss://`) — 2.x부터 **스킴 필수**.
- 비밀번호 미사용은 `setPassword(null)`. 빈 문자열을 넘기면 인증 실패할 수 있다.
- 2.x 기본 코덱은 `JsonJacksonCodec` — 3.x로 갈 때 기본값이 바뀌니 명시해 두면 안전.
- Redisson은 Lettuce/Jedis와 **완전히 독립된** 커넥션 풀을 가진다(spring-data-redis·spring-session-data-redis는 Lettuce 사용).

> 주의: Cluster 모드에서는 `setDatabase`를 사용할 수 없습니다(Redis Cluster는 DB 0만 허용). 키 네이밍으로 논리 분리하세요.

> 주의: `redisson-spring-boot-starter:2.15.2`와 Spring Boot 2.5 간 공식 호환 선언은 확인되지 않았습니다. 자동 구성(AutoConfiguration) 클래스 이름·프로퍼티 경로가 Spring Boot 2.5와 어긋날 수 있어 실환경에서는 core Redisson 의존성 + 수동 `@Bean` 방식이 더 안전합니다.

---

## 3. RLock 함정

| 함정 | 올바른 처리 |
|------|-------------|
| leaseTime 명시 후 watchdog 자동 연장 기대 | **leaseTime을 명시하면 watchdog이 비활성화된다.** 자동 연장이 필요하면 인자 없는 `lock()`(기본 `lockWatchdogTimeout` 30,000ms, `Config.setLockWatchdogTimeout`) |
| `unlock()` 무조건 호출 | leaseTime 만료 후 unlock 시 `IllegalMonitorStateException: attempt to unlock lock, not locked by current thread` → `acquired && lock.isHeldByCurrentThread()` 체크 후 해제 |
| `unlock()`을 finally 밖에 둠 | 예외 시 leaseTime까지 락 점유 |
| `InterruptedException` 삼킴 | `Thread.currentThread().interrupt()` 복구 |

> 주의: `isHeldByCurrentThread()` + `unlock()` 사이의 race는 여전히 존재합니다(극히 짧은 구간). 완전히 방지하려면 낙관적으로 `try { lock.unlock(); } catch (IllegalMonitorStateException ignore) {}` 패턴도 사용됩니다. 단, 예외 삼킴은 로그로 남기세요.

기타: 대형 `RMap`에서 `entrySet()`·`keySet()`·`values()`는 전체를 스캔·로드한다 → `entryIterator()`·`keyIterator()`. `RAtomicLong` 원자성은 단일 노드 또는 같은 해시슬롯 안에서만. Pub/Sub(`RTopic`)은 영속화가 없어 구독자 오프라인 시 유실된다(재연결 후 재구독은 자동).

---

## 4. Spring 통합 함정

- `RedissonSpringCacheManager`(`org.redisson.spring.cache.RedissonSpringCacheManager`)의 `CacheConfig(ttl, maxIdleTime)` 인자는 **밀리초**, 0/미지정은 무한.

> 주의: 2.15.2의 `RedissonSpringCacheManager`는 Spring 4.x ~ 5.0 타겟으로 설계됐습니다. Spring Boot 2.5(Spring 5.3)에서 대부분 동작하지만 `CacheManager` 인터페이스의 새 메서드(default 메서드 포함) 호환 문제는 실테스트로 확인하세요.

> 주의: **Redisson이 저장한 값과 `RedisTemplate`이 저장한 값은 직렬화 포맷이 달라 서로 읽을 수 없습니다.** 같은 키를 두 클라이언트가 공유하지 않도록 네임스페이스를 분리하세요 (`cache:*` vs `lock:*` vs `queue:*`).

역할 분담: 단순 GET/SET·`@Cacheable`·Spring Session은 spring-data-redis, 분산 락·분산 자료구조는 Redisson.

---

## 5. 업그레이드 경로 (2.15.2 → 3.x)

- `org.redisson.core.*` → `org.redisson.api.*`로 경로 변경
- `RFuture` 반환 타입 일부 변경 (Netty `Future` 기반)
- `Config` YAML 스키마 일부 필드 추가/이름 변경
- `RedissonSpringCacheManager` 경로 동일, 내부 동작 소폭 변경
- `redisson-spring-boot-starter` 3.x 사용 시 Spring Boot 2.5 호환되는 버전은 **3.17.x 이하** (3.18+ 는 Spring Boot 3.x 전용)

> 주의: 이 경로·버전 경계는 마이그레이션 시점에 반드시 당시 최신 공식 문서로 재확인하세요.
