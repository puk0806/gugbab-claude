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

---

## 11. Spring Boot 4.x / HikariCP 7.0 마이그레이션 포인트

> 기준: Spring Boot 4.0 번들 HikariCP 7.0.x / Java 17+
> 소스: https://github.com/brettwooldridge/HikariCP/blob/dev/CHANGES
>       https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Release-Notes
> 검증일: 2026-06-19

### 11.1 Spring Boot 버전별 HikariCP 번들

| Spring Boot | 번들 HikariCP |
|-------------|---------------|
| 2.7.x | 4.0.3 ~ 5.0.1 |
| 3.0.x ~ 3.2.x | 5.0.x |
| 3.3.x ~ 3.5.x | 5.1.x |
| **4.0.x ~ 4.1.x** | **7.0.x** |

### 11.2 HikariCP 7.0 변경사항 요약

**설정 파라미터 이름 자체는 변경 없다.** 기존 `application.yml`의 `spring.datasource.hikari.*` 키 이름을 그대로 사용 가능.

| 항목 | 내용 |
|------|------|
| 설정 키 변경 | **없음** — 기존 yml 그대로 동작 |
| `HikariCredentialsProvider` | 신규 추가 — 동적 자격증명 공급자 인터페이스 |
| 가상 스레드 최적화 | ConcurrentBag의 virtual-thread yield 스핀 최소화 |
| 메트릭 이름 | 변경 없음 (`hikaricp.connections.*`) |

### 11.3 HikariCredentialsProvider (7.0+ 신규)

AWS Secrets Manager, Vault 동적 시크릿 등 자격증명을 동적으로 제공해야 하는 환경을 위한 확장 포인트.

```java
import com.zaxxer.hikari.HikariCredentialsProvider;

public class AwsIamCredentialsProvider implements HikariCredentialsProvider {
    @Override
    public String getUsername() { return fetchUsernameFromSecretsManager(); }
    @Override
    public String getPassword() { return generateIamAuthToken(); }
}

// HikariConfig에 등록
config.setCredentialsProvider(new AwsIamCredentialsProvider());
```

### 11.4 Virtual Thread 환경 고려사항 (Spring Boot 4.x)

Spring Boot 4.x에서 가상 스레드 활성화 시 HikariCP 7.x의 ConcurrentBag 최적화가 자동 적용된다. 별도 설정 변경 불필요.

> 주의: Virtual Thread 환경에서는 물리 스레드 기반 공식인 `(core_count * 2) + spindle`보다 낮은 커넥션 수에서도 높은 처리량이 유지되는 경우가 많다. 기존 값부터 시작해 실측값을 기반으로 조정할 것.
- [ ] 부하 테스트로 p95/p99 지연 측정 완료
