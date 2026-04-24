---
name: hikaricp-tuning-oracle-mysql
description: HikariCP 커넥션 풀 튜닝 가이드 - Oracle/MySQL 환경 필수 파라미터, DB별 datasource properties, Leak 탐지, Pool Exhaustion 진단, 모니터링
---

# HikariCP 커넥션 풀 튜닝 (Oracle + MySQL)

> 소스: https://github.com/brettwooldridge/HikariCP | https://github.com/brettwooldridge/HikariCP/wiki/MySQL-Configuration | https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing | https://github.com/brettwooldridge/HikariCP/wiki/Rapid-Recovery
> 검증일: 2026-04-22

> 주의: 이 문서는 HikariCP 3.4.5(레거시) ~ 5.x(현재 Spring Boot 3.x 번들) 기준입니다. 이 범위에서 API 및 설정 키는 사실상 동일하므로 통합 가이드로 사용 가능합니다. 7.x에서 일부 Breaking Change가 있으므로 최신 버전 사용 시 공식 changelog를 확인하세요.

---

## 1. 필수 설정 파라미터

### 공식 기본값 및 설명

| 파라미터 | 기본값 | 최소값 | 설명 |
|---------|--------|--------|------|
| `maximumPoolSize` | 10 | — | 풀이 가질 수 있는 최대 커넥션 수(유휴 + 사용 중) |
| `minimumIdle` | `maximumPoolSize`와 동일 | — | 유지할 최소 유휴 커넥션 수 (공식 권장: 건드리지 말 것) |
| `connectionTimeout` | 30000ms (30초) | 250ms | 클라이언트가 커넥션을 기다릴 최대 시간 |
| `idleTimeout` | 600000ms (10분) | 10000ms | 유휴 커넥션이 제거되기 전 대기 시간. `minimumIdle < maximumPoolSize`일 때만 적용 |
| `maxLifetime` | 1800000ms (30분) | 30000ms | 커넥션의 최대 수명. 반드시 DB `wait_timeout`보다 짧게 |
| `keepaliveTime` | 120000ms (2분) | 30000ms | 유휴 커넥션 ping 주기. `maxLifetime`보다 작아야 함 |
| `validationTimeout` | 5000ms | 250ms | 커넥션 유효성 검증 최대 시간 |
| `leakDetectionThreshold` | 0 (비활성) | 2000ms | 커넥션 누수 의심 경고 임계값. 0이면 비활성화 |

### maximumPoolSize 산정 공식 (공식 Wiki)

PostgreSQL 프로젝트 기반 공식:

```
connections = ((core_count * 2) + effective_spindle_count)
```

- **core_count**: 물리 CPU 코어 수 (HT 스레드 제외)
- **effective_spindle_count**:
  - 데이터셋이 캐시에 전부 올라가면 0
  - 캐시 히트율이 낮을수록 실제 스핀들 수에 근접

**예시:** 4-core i7 + HDD 1개 → `(4 × 2) + 1 = 9`

> 주의: HikariCP 공식 문서는 **"작은 풀이 더 빠르다"**는 원칙을 명시합니다. Oracle 실증 사례에서 커넥션을 2048 → 96으로 줄이자 응답 시간이 ~100ms → ~2ms로 **50배 개선**되었습니다. 커넥션을 무작정 늘리는 것은 성능을 오히려 해칩니다.

### Deadlock 방지 공식

```
pool_size = (max_threads × (max_connections_per_thread - 1)) + 1
```

**예시:** 한 트랜잭션에서 커넥션 4개를 동시에 보유하는 스레드가 3개라면 → `3 × (4 - 1) + 1 = 10`

### minimumIdle 권장

공식 문서는 `minimumIdle`을 **기본값 그대로 두는 것(=maximumPoolSize와 동일)**을 권장합니다. 이유는 응답시간 변동을 줄이는 고정 크기 풀(fixed-size pool) 동작이 일반적으로 더 우수하기 때문입니다.

### maxLifetime 주의사항

- DB의 `wait_timeout`(MySQL)이나 유사 제한보다 **최소 30초 이상 짧게** 설정
- 방화벽·로드밸런서의 idle timeout보다도 짧게 설정
- 공식 권장 공식: `maxLifetime ≤ (DB wait_timeout - 30s)`

**환경별 구체 권장값:**

| DB wait_timeout | 권장 maxLifetime | 설정값 (ms) |
|:---:|:---:|:---:|
| 28800s (MySQL 기본 8시간) | HikariCP 기본값 유지 권장 | `1800000` (30분) |
| 3600s (축소 운영 1시간) | ≤ 3570s | `3500000` (58분) |
| 1800s (축소 운영 30분) | ≤ 1770s | `1700000` (약 28분) |
| 600s (축소 운영 10분) | ≤ 570s | `560000` (약 9분) |

- MySQL 기본 8시간 환경이면 HikariCP 기본 30분을 그대로 두는 것이 가장 안전 (공식 기본값이 이미 DB 기본값보다 충분히 짧음)
- 운영 DB에서 `wait_timeout`이 축소되어 있는 경우가 흔하므로 **설정 전 DBA·운영팀에 반드시 확인**

---

## 2. DB별 권장 설정

### MySQL 공식 권장 (HikariCP Wiki)

```properties
jdbcUrl=jdbc:mysql://host:3306/dbname
username=...
password=...

dataSource.cachePrepStmts=true
dataSource.prepStmtCacheSize=250
dataSource.prepStmtCacheSqlLimit=2048
dataSource.useServerPrepStmts=true
dataSource.useLocalSessionState=true
dataSource.rewriteBatchedStatements=true
dataSource.cacheResultSetMetadata=true
dataSource.cacheServerConfiguration=true
dataSource.elideSetAutoCommits=true
dataSource.maintainTimeStats=false
```

**속성별 효과:**

| 속성 | 효과 |
|------|------|
| `cachePrepStmts=true` | PreparedStatement 캐시 활성화 (MySQL 드라이버 기본값 false). 이것이 true여야 `prepStmtCacheSize`/`prepStmtCacheSqlLimit`이 의미 있음 |
| `prepStmtCacheSize=250` | 커넥션당 캐시할 PreparedStatement 수 (드라이버 기본 25). 공식 권장: 250~500 |
| `prepStmtCacheSqlLimit=2048` | 캐시 대상 SQL 최대 길이 (드라이버 기본 256 바이트). ORM 생성 SQL 대응 |
| `useServerPrepStmts=true` | 서버 사이드 PreparedStatement 사용 (성능 향상) |
| `useLocalSessionState=true` | autoCommit/isolation 상태를 로컬 캐시해 불필요한 서버 왕복 제거 |
| `rewriteBatchedStatements=true` | 배치 INSERT/UPDATE를 단일 문으로 재작성하여 대량 처리 성능 향상 |

**MySQL Rapid Recovery (네트워크 장애 복구):**
```properties
dataSource.socketTimeout=30000   # 가장 긴 트랜잭션의 2~3배, 또는 30초 이상
```

### Oracle 권장

Oracle JDBC 드라이버 고유 속성을 `dataSourceProperties`로 전달합니다.

```properties
jdbcUrl=jdbc:oracle:thin:@host:1521/SERVICE

# 타임아웃 (드라이버 단 소켓 타임아웃)
dataSource.oracle.net.CONNECT_TIMEOUT=10000     # ms, 최초 TCP 연결 타임아웃
dataSource.oracle.jdbc.ReadTimeout=30000        # ms, 소켓 read 타임아웃

# 커넥션 검증 — 기본 NETWORK는 비용이 큼
dataSource.oracle.jdbc.defaultConnectionValidation=LOCAL
```

> 주의: Oracle JDBC의 `oracle.jdbc.defaultConnectionValidation` 기본값은 `NETWORK`이며, 이는 borrow 시마다 서버 왕복이 발생해 비용이 큽니다. 대부분의 애플리케이션에서는 `LOCAL` 또는 `SOCKET`으로 변경하는 것이 권장됩니다.

**`defaultAutoCommit` 관련 주의:**

- HikariCP의 `autoCommit` 기본값은 `true`
- Spring의 `@Transactional`을 사용하면 Spring이 트랜잭션 경계에서 autoCommit을 조정하므로 HikariCP 레벨 값은 영향이 제한적
- Oracle 환경에서 트랜잭션을 명시적으로 관리한다면 `autoCommit=false`로 두는 것이 흔한 관행
- 다만 HikariCP는 커넥션 반환 시 autoCommit을 원래 상태로 복원하므로, 풀 레벨 설정과 JDBC 호출 레벨 설정이 일치하는지 반드시 확인

> 주의: `defaultAutoCommit`이라는 키는 Apache DBCP의 설정명입니다. HikariCP에서 동일 역할의 키는 **`autoCommit`**(카멜케이스)입니다.

**Oracle Rapid Recovery:**
- `oracle.net.CONNECT_TIMEOUT`: 연결 요청이 블로킹되지 않도록 10초 전후 설정
- `oracle.jdbc.ReadTimeout`: 쿼리 결과 수신 타임아웃. 가장 긴 쿼리의 2~3배

---

## 3. Spring Boot application.yml 설정 예시

### MySQL — 단일 DataSource

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/appdb?useSSL=false&serverTimezone=Asia/Seoul
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      pool-name: MySQLMainPool
      maximum-pool-size: 20
      minimum-idle: 20                     # maximumPoolSize와 동일 권장
      connection-timeout: 30000            # 30초
      idle-timeout: 600000                 # 10분
      max-lifetime: 1700000                # DB wait_timeout(1800초)보다 짧게
      keepalive-time: 120000               # 2분
      validation-timeout: 5000
      leak-detection-threshold: 60000      # 60초 이상 반환 안 되면 누수 의심
      data-source-properties:
        cachePrepStmts: true
        prepStmtCacheSize: 250
        prepStmtCacheSqlLimit: 2048
        useServerPrepStmts: true
        useLocalSessionState: true
        rewriteBatchedStatements: true
        cacheResultSetMetadata: true
        cacheServerConfiguration: true
        elideSetAutoCommits: true
        maintainTimeStats: false
        socketTimeout: 30000
```

### Oracle — 단일 DataSource

```yaml
spring:
  datasource:
    url: jdbc:oracle:thin:@//oracle-host:1521/ORCL
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    driver-class-name: oracle.jdbc.OracleDriver
    hikari:
      pool-name: OracleMainPool
      maximum-pool-size: 20
      minimum-idle: 20
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1700000
      keepalive-time: 120000
      leak-detection-threshold: 60000
      auto-commit: false                    # 명시적 트랜잭션 관리 시
      data-source-properties:
        oracle.net.CONNECT_TIMEOUT: 10000
        oracle.jdbc.ReadTimeout: 30000
        oracle.jdbc.defaultConnectionValidation: LOCAL
        oracle.jdbc.implicitStatementCacheSize: 100
```

---

## 4. Connection Leak 탐지

### 활성화

```yaml
spring:
  datasource:
    hikari:
      leak-detection-threshold: 60000   # 60초. 최소값 2000ms
```

### 로그 해석

```
WARN com.zaxxer.hikari.pool.ProxyLeakTask : Connection leak detection triggered for
  oracle.jdbc.driver.T4CConnection@abc123 on thread http-nio-8080-exec-3,
  stack trace follows
  java.lang.Exception: Apparent connection leak detected
    at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:128)
    at com.example.service.UserService.findAll(UserService.java:42)
    ...
```

- 경고는 **threshold 시간 경과 시점에** 1회 발생 (커넥션이 결국 반환되면 정상 복귀)
- 스택 트레이스의 상단이 누수 발생 코드 위치
- 주요 원인:
  - `try-with-resources`/`@Transactional` 없이 커넥션 획득 후 `close()` 누락
  - 예외 경로에서 커넥션 반환 누락
  - 매우 긴 외부 API 호출 중 트랜잭션 보유

### 운영 팁

- 초기엔 `leakDetectionThreshold`를 짧게(10~30초) 설정해 즉각 감지
- 안정화 후엔 60초 이상으로 완화하여 정상 장시간 트랜잭션과 구분

---

## 5. Pool Exhaustion 진단

### 전형적 에러

```
HikariPool-1 - Connection is not available, request timed out after 30000ms.
  Total connections: 20, active: 20, idle: 0, waiting: 5
```

의미: `maximumPoolSize(20)`개가 모두 사용 중, 5개 스레드가 `connectionTimeout` 동안 대기하다 실패.

### 진단 순서

1. **커넥션 누수인가?**
   - `leakDetectionThreshold`를 활성화하고 로그 확인
   - active 수가 줄지 않고 계속 꽉 차있다면 누수 가능성 높음

2. **느린 쿼리가 커넥션을 오래 잡고 있는가?**
   - DB의 slow query log 확인
   - `SHOW PROCESSLIST` (MySQL), `V$SESSION` (Oracle)로 오래 실행 중인 세션 확인
   - 느린 쿼리의 인덱스·실행 계획 점검

3. **풀 크기가 부족한가? (누수·느린 쿼리가 아닐 경우)**
   - 공식 공식으로 재산정: `(core × 2) + spindle`
   - 이때 DB 서버 리소스도 함께 확인 — 풀을 키웠는데 DB가 못 받으면 오히려 악화

4. **멀티 DataSource의 총 커넥션이 DB `max_connections`를 넘지는 않는가?**
   - MySQL: `SHOW VARIABLES LIKE 'max_connections'`
   - Oracle: `SELECT value FROM v$parameter WHERE name='processes';`

5. **트랜잭션이 비정상적으로 길어지는가?**
   - `@Transactional` 메서드 내부에서 외부 HTTP 호출 등 오래 걸리는 I/O 수행 금지
   - 트랜잭션 범위를 DB 작업으로만 한정

### 임시 완화 vs 근본 해결

| 접근 | 효과 | 주의 |
|------|------|------|
| `maximumPoolSize` 증가 | 단기 완화 | 근본 원인이 누수/느린 쿼리면 DB 과부하로 번질 수 있음 |
| `connectionTimeout` 증가 | 실패 대신 느린 응답으로 전환 | UX 악화, 카스케이딩 장애 위험 |
| 누수 코드 수정 | 근본 해결 | 최우선 |
| 느린 쿼리 최적화 | 근본 해결 | DB 부하도 함께 감소 |

---

## 6. 모니터링 (Micrometer / Actuator)

HikariCP는 Micrometer에 Meter를 자동 등록합니다. Spring Boot Actuator + Micrometer가 클래스패스에 있으면 별도 설정 없이 `/actuator/metrics`에 노출됩니다.

### 주요 메트릭

| 메트릭 | 의미 | 경보 기준 예시 |
|--------|------|---------------|
| `hikaricp.connections` | 풀 내 총 커넥션 수 | — |
| `hikaricp.connections.active` | 현재 사용 중인 커넥션 수 | `maximumPoolSize`에 근접하면 위험 |
| `hikaricp.connections.idle` | 유휴 커넥션 수 | — |
| `hikaricp.connections.pending` | 커넥션을 기다리는 스레드 수 | > 0이 지속되면 풀 부족 신호 |
| `hikaricp.connections.timeout` | `connectionTimeout`으로 실패한 횟수 (Counter) | 증가하면 즉시 조사 |
| `hikaricp.connections.usage` | 커넥션 대여 → 반환까지 소요 시간 (Timer) | p99가 급증하면 트랜잭션 길어짐 |
| `hikaricp.connections.acquire` | 커넥션 획득 소요 시간 (Timer) | p99 급증은 풀 부족 신호 |
| `hikaricp.connections.creation` | 새 커넥션 생성 소요 시간 (Timer) | DB 네트워크 지연 지표 |

### Prometheus 스크랩 설정 예시

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health, metrics, prometheus
  metrics:
    tags:
      application: ${spring.application.name}
```

`pool-name`을 명시적으로 설정하면 여러 풀 구분이 쉬워집니다 (`pool: MySQLMainPool` 태그로 노출).

---

## 7. 멀티 DataSource 환경 (Oracle + MySQL)

### 설정 예시

```yaml
app:
  datasource:
    oracle:
      url: jdbc:oracle:thin:@//oracle-host:1521/ORCL
      username: ${ORACLE_USER}
      password: ${ORACLE_PASSWORD}
      driver-class-name: oracle.jdbc.OracleDriver
      hikari:
        pool-name: OraclePool
        maximum-pool-size: 15
        minimum-idle: 15
        max-lifetime: 1700000
        leak-detection-threshold: 60000
        data-source-properties:
          oracle.net.CONNECT_TIMEOUT: 10000
          oracle.jdbc.ReadTimeout: 30000
          oracle.jdbc.defaultConnectionValidation: LOCAL

    mysql:
      url: jdbc:mysql://mysql-host:3306/appdb
      username: ${MYSQL_USER}
      password: ${MYSQL_PASSWORD}
      driver-class-name: com.mysql.cj.jdbc.Driver
      hikari:
        pool-name: MySQLPool
        maximum-pool-size: 20
        minimum-idle: 20
        max-lifetime: 1700000
        leak-detection-threshold: 60000
        data-source-properties:
          cachePrepStmts: true
          prepStmtCacheSize: 250
          prepStmtCacheSqlLimit: 2048
          useServerPrepStmts: true
          useLocalSessionState: true
          rewriteBatchedStatements: true
```

### Java 설정 (핵심만)

```java
@Configuration
public class DataSourceConfig {

    @Bean
    @ConfigurationProperties("app.datasource.oracle")
    public DataSourceProperties oracleProps() {
        return new DataSourceProperties();
    }

    @Bean
    @ConfigurationProperties("app.datasource.oracle.hikari")
    public HikariDataSource oracleDataSource(
            @Qualifier("oracleProps") DataSourceProperties props) {
        return props.initializeDataSourceBuilder()
                    .type(HikariDataSource.class)
                    .build();
    }

    // mysql도 동일 패턴 + @Primary는 상황에 맞게 한쪽에만
}
```

### 총 커넥션 수 계산

각 앱 인스턴스가 갖는 커넥션 총합을 반드시 추산합니다.

```
총 커넥션 = Σ(풀별 maximumPoolSize) × 앱 인스턴스 수
```

**예시:**
- Oracle 풀 15, MySQL 풀 20, 앱 인스턴스 8개 →
  - Oracle DB 측 사용: 15 × 8 = **120**
  - MySQL DB 측 사용: 20 × 8 = **160**
- 각각 DB의 `max_connections`를 초과하지 않는지 **반드시** 확인
- DBA 관리자 커넥션, 백업/모니터링 도구 커넥션도 여유로 남겨두기

---

## 8. 성능 벤치마크 팁

- **절대 피할 것:** "혹시 모르니까" 풀 크기를 100, 500으로 설정
- **시작점:** `(core_count × 2) + effective_spindle_count`
- **방법:**
  1. 기준 풀 크기로 부하 테스트 (JMeter/k6) 실행
  2. 처리량(TPS)과 p95/p99 지연 기록
  3. 풀 크기를 ±2씩 조정하며 반복
  4. 처리량이 더는 증가하지 않거나 감소하는 지점 이전이 최적값
- **지표 기반 검증:** 부하 테스트 중 `hikaricp.connections.pending`이 0에 수렴하고 `active`가 `maximumPoolSize`에 항상 닿지 않으면 여유 있음

> 주의: 커넥션을 늘려 TPS가 개선되는 것처럼 보여도, DB 서버의 컨텍스트 스위칭·락 경합이 증가해 p99 지연이 악화되는 경우가 흔합니다. 처리량만 보지 말고 p95/p99를 반드시 함께 확인하세요.

---

## 9. 레거시 3.4.5 버전 관련 주의점

HikariCP 3.4.5의 확인된 특성:

- **Java 8 호환성 수정 포함** (3.4.5에서 proxy가 Java 8로 생성되도록 build 수정, Java 11 클래스 참조 제거)
- 이후 4.0.x부터는 **Java 11+ 전용**으로 전환됨
- 3.4.5는 Java 7/8 환경을 지원하는 마지막 안정 계열에 가까움

**3.4.5 → 최신(5.x) 차이 요약:**

| 항목 | 3.4.5 | 5.x (Spring Boot 3.x 번들) |
|------|-------|---------------------------|
| 최소 Java | 8 | 11 |
| API / 설정 키 | 동일 | 동일 |
| Micrometer 메트릭 이름 | 동일 | 동일 |
| 성능 | 유사, 대부분 내부 최적화 | 소폭 개선 |

> 주의: 3.4.5에서 `keepaliveTime`은 존재하지 않습니다. `keepaliveTime`은 4.0.x부터 추가되었습니다. 3.4.5 환경에서는 `maxLifetime` + 드라이버 단 `socketTimeout`/`oracle.jdbc.ReadTimeout`으로 대체하여 네트워크 장애 복구를 설계해야 합니다.

---

## 10. Spring Boot 버전별 HikariCP 번들

| Spring Boot | 번들 HikariCP | 최소 Java |
|-------------|---------------|-----------|
| 2.0.x | 2.7.x | 8 |
| 2.4.x | 3.4.x | 8 |
| 2.7.x | 4.0.3 → 5.0.1 (2.7 중반부터 5.x) | 8 |
| 3.0.x ~ 3.2.x | 5.0.x | 17 |
| 3.3.x ~ 3.4.x | 5.1.x | 17 |

> 주의: 정확한 번들 버전은 `mvn dependency:tree | grep HikariCP` 또는 `./gradlew dependencies | grep HikariCP`로 **현재 프로젝트에서 직접 확인**하세요. 위 표는 개괄이며 패치 버전은 유동적입니다.

### 명시적 오버라이드

번들 버전이 아닌 특정 버전을 사용하려면:

```xml
<!-- Maven -->
<properties>
    <hikaricp.version>5.1.0</hikaricp.version>
</properties>
```

```gradle
// Gradle
ext['hikaricp.version'] = '5.1.0'
```

---

## 체크리스트 — 운영 투입 전

- [ ] `maxLifetime` < DB `wait_timeout` 최소 30초 차이 확인
- [ ] `leakDetectionThreshold` 활성화 (최소 2000ms)
- [ ] `maximumPoolSize`가 공식 기반인가? 근거 없는 큰 값 아닌가?
- [ ] `minimumIdle`을 `maximumPoolSize`와 동일하게 유지(또는 근거 있는 값으로)
- [ ] MySQL: `cachePrepStmts` 외 6종 속성 설정
- [ ] Oracle: `CONNECT_TIMEOUT` / `ReadTimeout` / `defaultConnectionValidation=LOCAL`
- [ ] `pool-name` 명시로 메트릭/로그에서 풀 구분
- [ ] Actuator `/metrics`에 `hikaricp.connections.*` 노출 확인
- [ ] 멀티 DataSource 총합이 DB `max_connections`의 80% 이하인가
- [ ] 부하 테스트로 p95/p99 지연 측정 완료
