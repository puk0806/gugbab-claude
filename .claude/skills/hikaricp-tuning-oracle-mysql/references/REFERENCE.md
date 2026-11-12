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

## 9. 레거시 3.4.5 버전 관련 주의점

HikariCP 3.4.5의 확인된 특성:

- **Java 8 호환성 수정 포함** (3.4.5에서 proxy가 Java 8로 생성되도록 build 수정, Java 11 클래스 참조 제거)
- 4.0.x(최종 4.0.3)도 **Java 8 아티팩트**다 — 공식 README: Java 8 = `HikariCP:4.0.3`(deprecated), Java 11+ = 5.x 이상
- Java 11+ 전용은 **5.0.0부터**. Java 8 환경의 마지막 선택지는 4.0.3(Spring Boot 2.7 번들)

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
| 2.7.x | 4.0.3 (5.x는 Java 11+라 2.7 BOM이 5.x를 금지) | 8 |
| 3.0.x ~ 3.2.x | 5.0.1 | 17 |
| 3.3.x ~ 3.4.x | 5.1.0 | 17 |
| 3.5.x | 6.3.x (3.5.0 = 6.3.0, 최신 3.5.x = 6.3.3) | 17 |
| 4.0.x ~ 4.1.x | 7.0.2 | 17 |

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

---

## 11. Spring Boot 4.x / HikariCP 7.0 마이그레이션 포인트

> 기준: Spring Boot 4.0 번들 HikariCP 7.0.x / Java 17+
> 소스: https://github.com/brettwooldridge/HikariCP/blob/dev/CHANGES
>       https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Release-Notes
> 검증일: 2026-11-06 (재검증 — 최신 안정 7.1.0·설정 키 변경 없음 재확인, 번들표·HikariCredentialsProvider 예시 정정)

### 11.1 Spring Boot 버전별 HikariCP 번들

10절 표 참조. **4.0.x ~ 4.1.x** = **7.0.2** (HikariCP 최신 7.1.0은 직접 오버라이드 필요)

### 11.2 HikariCP 7.0 변경사항 요약

**설정 파라미터 이름 자체는 변경 없다.** 기존 `application.yml`의 `spring.datasource.hikari.*` 키 이름을 그대로 사용 가능.

| 항목 | 내용 |
|------|------|
| 설정 키 변경 | **없음** — 기존 yml 그대로 동작 |
| `HikariCredentialsProvider` | 신규 추가 — 동적 자격증명 공급자 인터페이스 |
| 가상 스레드 최적화 | ConcurrentBag의 virtual-thread yield 스핀 최소화 |
| 메트릭 이름 | 변경 없음 (`hikaricp.connections.*`) |
| `keepaliveTime` 기본값 | 6.2.1에서 0(비활성) → 120000ms(2분)로 변경 — 5.x 이하에서 올라오면 keepalive가 새로 켜진다 |
| 시간 값 표기 | 6.3.0+ 프로퍼티에 `30s`·`10m` 같은 단위 값 허용 |

### 11.3 HikariCredentialsProvider (7.0+ 신규)

AWS Secrets Manager, Vault 동적 시크릿 등 자격증명을 동적으로 제공해야 하는 환경을 위한 확장 포인트.

```java
import com.zaxxer.hikari.HikariCredentialsProvider;
import com.zaxxer.hikari.util.Credentials;

public class AwsIamCredentialsProvider implements HikariCredentialsProvider {
    @Override
    public Credentials getCredentials() {          // 인터페이스 메서드는 이것 하나
        return Credentials.of(fetchUsernameFromSecretsManager(), generateIamAuthToken());
    }
}

// HikariConfig에 등록 (인스턴스 또는 클래스명)
config.setCredentialsProvider(new AwsIamCredentialsProvider());
// config.setCredentialsProviderClassName("com.example.AwsIamCredentialsProvider");
```

> 주의: `HikariDataSource`를 상속해 `getUsername()`/`getPassword()`를 오버라이드하던 방식은 레거시다. 공식 README는 `getCredentials()` 오버라이드를 권장하며, 6.3.2에서 레거시 오버라이드 지원을 시스템 프로퍼티로 켜도록 했다(CHANGES #2256).

### 11.4 Virtual Thread 환경 고려사항 (Spring Boot 4.x)

Spring Boot 4.x에서 가상 스레드 활성화 시 HikariCP 7.x의 ConcurrentBag 최적화가 자동 적용된다. 별도 설정 변경 불필요.

> 주의: Virtual Thread 환경에서는 물리 스레드 기반 공식인 `(core_count * 2) + spindle`보다 낮은 커넥션 수에서도 높은 처리량이 유지되는 경우가 많다. 기존 값부터 시작해 실측값을 기반으로 조정할 것.
