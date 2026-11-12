---
name: hikaricp-tuning-oracle-mysql
description: HikariCP 커넥션 풀 튜닝 가이드 - 버전별 기본값(keepaliveTime 6.2.1 변경)·Spring Boot 버전별 번들표, Oracle/MySQL datasource properties, Oracle+MySQL 멀티 DataSource, 3.4.5 레거시 주의점, 7.x 변경점
---

# HikariCP 커넥션 풀 튜닝 (Oracle + MySQL)

> 소스: https://github.com/brettwooldridge/HikariCP | https://github.com/brettwooldridge/HikariCP/wiki/MySQL-Configuration | https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing | https://github.com/brettwooldridge/HikariCP/wiki/Rapid-Recovery
> 검증일: 2026-11-06

> 주의: 이 문서는 HikariCP 3.4.5(레거시) ~ 7.x 기준입니다(최신 안정 7.1.0, 2026-11 확인). Spring Boot 번들: 2.7 = 4.0.3, 3.0~3.2 = 5.0.1, 3.3~3.4 = 5.1.0, 3.5 = 6.3.x, 4.0~4.1 = 7.0.2. 이 범위에서 설정 키 이름은 같지만 **`keepaliveTime` 기본값이 6.2.1에서 바뀌었으니** 아래 표의 버전 표기를 확인하세요.

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
| `keepaliveTime` | 120000ms (2분) — 6.2.1+ / 0(비활성) — 4.0.0~6.2.0 | 30000ms | 유휴 커넥션 ping 주기. `maxLifetime`보다 작아야 함. 4.0.0에서 추가(3.x에는 없음) |
| `validationTimeout` | 5000ms | 250ms | 커넥션 유효성 검증 최대 시간 |
| `leakDetectionThreshold` | 0 (비활성) | 2000ms | 커넥션 누수 의심 경고 임계값. 0이면 비활성화 |

### maxLifetime 주의사항

- DB의 `wait_timeout`(MySQL)이나 유사 제한보다 **최소 30초 이상 짧게** 설정
- 방화벽·로드밸런서의 idle timeout보다도 짧게 설정
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

MySQL은 2절의 `dataSource.*` 속성을 `data-source-properties:` 아래에 같은 이름으로 넣는다(Oracle+MySQL 동시 설정 예시는 REFERENCE 7절).

---

> 상세 레퍼런스 (멀티 DataSource·3.4.5 레거시·버전별 번들·7.x 변경점·체크리스트) → [`references/REFERENCE.md`](references/REFERENCE.md)
