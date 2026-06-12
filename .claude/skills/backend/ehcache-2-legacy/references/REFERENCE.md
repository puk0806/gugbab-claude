## 7. Redis와의 2계층 캐시 패턴 (L1=EhCache, L2=Redis)

고빈도·저용량의 hot data는 로컬(EhCache)에서, 중·저빈도의 cold data는 분산(Redis)에서 가져오는 패턴.

### 개념도

```
                 [Service 메서드]
                        ↓
              ┌──── L1: EhCache ────┐   ← 프로세스 로컬 힙, nanosec 접근
              │  miss → fallthrough │
              └──────────┬──────────┘
                         ↓
              ┌──── L2: Redis ──────┐   ← 네트워크 hop, ms 단위, 인스턴스 간 공유
              │  miss → fallthrough │
              └──────────┬──────────┘
                         ↓
                    [DB / 원본]
```

### 장단점

| 항목 | 장점 | 단점 |
|------|------|------|
| L1(EhCache) | GC 힙 내 접근, 외부 통신 없음, 서브 microsec | 노드 간 동기화 없음 — stale 데이터 |
| L2(Redis) | 인스턴스 공유, 즉시 invalidate 전파 가능 | 네트워크 latency, 직렬화 오버헤드 |

### 구현 방향 (구현 상세는 별도)

- **읽기**: L1 먼저 조회 → miss이면 L2 조회 → miss이면 DB → 가져온 값을 L2, L1 순으로 채움
- **쓰기/갱신**: DB 반영 → L2 갱신 또는 삭제 → Redis Pub/Sub으로 다른 노드에 invalidate 알림 → 각 노드 L1 제거
- **일관성 정책**: 완전한 write-through보다는 **TTL 기반 허용된 stale**이 현실적. L1 TTL은 L2보다 훨씬 짧게(예: 30초 vs 10분)
- **Spring Cache 조합**: Spring `CompositeCacheManager`에 EhCache CacheManager와 Redis CacheManager를 순서대로 등록. 또는 커스텀 `Cache` 구현에서 수동으로 L1→L2 체인 작성

> 주의: Spring Cache 추상화 자체는 계층 조회를 기본 제공하지 않는다. 2계층 동작을 원하면 `AbstractValueAdaptingCache`를 상속한 커스텀 래퍼가 필요하다.

---

## 8. EhCache 2.x vs 3.x 주요 차이점

| 항목 | 2.x | 3.x |
|------|-----|-----|
| Maven groupId | `net.sf.ehcache` | `org.ehcache` |
| 주요 API 패키지 | `net.sf.ehcache.Cache`, `Element` | `org.ehcache.Cache`, JSR-107 `javax.cache.Cache` |
| JSR-107 (JCache) | 별도 `ehcache-jcache` 모듈 필요 | **내장 지원** |
| 설정 XML 스키마 | `http://www.ehcache.org/ehcache.xsd` (자유로운 속성) | 엄격한 XSD, resources → expiry 순서 고정 |
| 값 래퍼 | `Element` 객체 | 직접 값 (제네릭 타입 안전) |
| 타입 안전성 | `Object` 기반 | `Cache<K, V>` 제네릭 |
| 축출 정책 | `LRU`/`LFU`/`FIFO` 선택 | 기본 `LRU`(힙), `LFU`(디스크) — 선택 불가 |
| CacheManager 생성 | `CacheManager.getInstance()` 싱글턴 | `CacheManagerBuilder` / `Caching.getCachingProvider()` |
| Listener 팩토리 | `CacheEventListenerFactory` | JSR-107 `CacheEntryListenerConfiguration` |
| 유지보수 | **종료(2023-09)** | 활성 (Terracotta/Software AG) |

### 마이그레이션 지침 (요약)

1. 의존성 교체: `net.sf.ehcache:ehcache:2.10.x` → `org.ehcache:ehcache:3.10.x` (또는 JSR-107 `javax.cache:cache-api`)
2. 모든 `net.sf.ehcache.*` import → `org.ehcache.*` 또는 `javax.cache.*`
3. `ehcache.xml` 전면 재작성 — XSD가 완전히 다르므로 수기 변환 필수 (자동 변환 도구 없음)
4. `Element` 래핑 제거 — `cache.put(key, value)` / `cache.get(key)` 직접 사용
5. 리스너 재작성 — `CacheEventListenerFactory` → `CacheEventListener<K, V>` 구현 + `CacheEventListenerConfigurationBuilder`
6. 테스트 보강 — 행동이 완전히 동일하지 않음 (특히 eviction 타이밍, 만료 검사 주기)

> 전면 교체가 부담이면 같은 교체 단계에서 **Caffeine**으로 대체하는 것도 고려. 로컬 캐시만 쓴다면 Caffeine이 성능·API 모두 우수하다.

---

## 9. 알려진 제한·이슈

| 항목 | 설명 |
|------|------|
| 유지보수 종료 | 2023-09 이후 OSS 2.x 공식 유지 중단. 보안 CVE 패치 기대 불가 |
| 신규 JDK 호환 | Java 17/21에서 동작 보고 있지만 공식 지원 매트릭스는 8/11 기준. 모듈 시스템 이슈 가능 |
| 클러스터링 | 분산 캐시(Terracotta) 연동은 상용 라이선스 필요. OSS는 로컬 캐시 한정 |
| `diskPersistent` OSS 제약 | 2.6+ OSS에서는 신뢰할 수 있는 재시작 영속성 불가 (`localRestartable`은 유료) |
| 업데이트 체커 | 기본 설정이 EhCache 공식 서버로 HTTP 호출을 보냄. `updateCheck="false"` 명시 권장 |
| 통계 수집 | `statistics="true"` 속성은 2.7에서 deprecated, 2.8+에서는 설정 API로 통일. 2.10에서도 태그 존재하나 제한적 |

---

## 10. 자주 하는 실수

| 실수 | 수정 |
|------|------|
| `org.ehcache`와 `net.sf.ehcache` 의존성 혼재 | 2.x만 쓸 때는 `net.sf.ehcache:ehcache:2.10.9.2`만 포함. 3.x JAR은 제외 |
| `overflowToDisk` 오타(`overFlowToDisk` 등) | 대소문자 정확히. 2.6+는 `<persistence strategy="localTempSwap"/>` 권장 |
| `@EnableCaching` 누락 | `@Configuration` 또는 메인 클래스에 반드시 선언 |
| 캐시명이 `ehcache.xml`에 없음 | `defaultCache` 템플릿으로 자동 생성되지만, 관리상 명시 정의 권장 |
| `@Cacheable` 키 생성 오동작 | 파라미터 객체의 `equals/hashCode` 재정의 확인. 필요 시 SpEL `key` 명시 |
| 리스너에서 블로킹 작업 | 콜백은 동기 동일 스레드 — 오래 걸리면 put 자체가 느려짐. 별도 executor 위임 |
| `Element.getValue()` NPE | `cache.get(key)` 결과가 null일 수 있음 — null 체크 후 `getObjectValue()` |
| `updateCheck` 기본값 사용 | 프로덕션에서 외부 HTTP 호출 발생 — `updateCheck="false"` |
| Terracotta/BigMemory 기능을 OSS에서 사용 시도 | `localRestartable`, `distributed`는 엔터프라이즈. 라이선스 확인 |
| `diskStore path`가 쓰기 불가 디렉토리 | 컨테이너 환경에서 `/tmp` 볼륨/쓰기 권한 확인. `java.io.tmpdir` 심볼 사용 권장 |
| `CacheManager.getInstance()`와 Spring Bean이 다른 인스턴스 | `EhCacheManagerFactoryBean.setShared(true)` 설정 |
| `@Cacheable`이 `null` 반환까지 캐시 | `unless = "#result == null"` 또는 `null` 반환 대신 Optional 사용 |
| EhCache 3 XML을 2.x에 그대로 사용 | XSD가 완전히 다름. 2.x 스키마로 재작성 |
