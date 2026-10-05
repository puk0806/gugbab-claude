## 크로스 DB 트랜잭션 (XA / 보상 패턴)

### XA 트랜잭션의 한계

Spring Boot는 JTA(XA) 트랜잭션을 지원하지만 다음 제약이 있습니다:

- 외부 JTA 트랜잭션 매니저 필요 (Atomikos 등 — Atomikos는 상용 라이선스)
- XA 호환 JDBC 드라이버 필요 (`OracleXADataSource`, `MysqlXADataSource`)
- 2PC(Two-Phase Commit) 오버헤드로 성능 저하
- 마이크로서비스 아키텍처에서 XA 지원이 어려움
- Spring Boot 3.x에서는 Atomikos 자동 설정이 제거됨 (`spring-boot-starter-jta-atomikos` 미지원)

### 권장: 보상 트랜잭션(Saga) 패턴

```java
@Service
public class OrderService {

    @Transactional("oracleTransactionManager")
    public void createOrder(Order order) {
        // 1) Oracle 트랜잭션 내 주력 작업
        orderMapper.insert(order);

        try {
            // 2) MySQL 로그 기록 (별도 트랜잭션)
            logService.recordOrderCreated(order);
        } catch (Exception e) {
            // 3) 보상 로직 — 로그 실패는 주문 롤백을 유발하지 않음
            // 대신 비동기 재시도 큐에 적재
            retryQueue.push(new LogRetryJob(order));
        }
    }
}

@Service
class LogService {
    @Transactional("mysqlTransactionManager")
    public void recordOrderCreated(Order order) {
        logMapper.insert(...);
    }
}
```

> 주의: 완벽한 분산 트랜잭션 보장이 필요하다면 XA를 선택할 수 있으나, 보편적인 웹 애플리케이션에서는 보상 패턴·이벤트 기반 비동기 처리(아웃박스 패턴 포함)가 권장됩니다.

---

## HikariCP 튜닝 요점

자세한 내용은 `hikaricp-tuning` 스킬을 참조하고, 여기서는 멀티 DataSource 특유의 고려사항만 정리합니다.

| 항목 | 기본값 | 권장 기준 |
|------|--------|-----------|
| `maximum-pool-size` | 10 | DB별로 분리 — 주력(Oracle) 15~20, 보조(MySQL) 5~10 |
| `minimum-idle` | `maximum-pool-size`와 동일 | 변동 트래픽은 낮게, 고정 트래픽은 pool size와 동일 |
| `connection-timeout` | 30,000ms | 일반적으로 기본값 유지 |
| `idle-timeout` | 600,000ms (10분) | `max-lifetime`보다 작아야 함 |
| `max-lifetime` | 1,800,000ms (30분) | DB 서버 `wait_timeout`보다 작게 설정 |
| `pool-name` | auto | 각 DataSource별로 명시 (로그·메트릭 구분) |

> 주의: HikariCP 공식 가이드는 "기본값은 안전한 출발점일 뿐 최적값은 아니다"라고 명시합니다. 멀티 DB 환경에서는 각 DB의 `wait_timeout`(MySQL), `idle_time_limit`(Oracle)을 확인해 `max-lifetime`을 그보다 작게 설정해야 "connection was closed" 오류를 방지합니다.

---

## 테스트 환경: H2 DataSource 교체

### application-test.yml

```yaml
spring:
  datasource:
    oracle:
      jdbc-url: jdbc:h2:mem:oracledb;MODE=Oracle;DB_CLOSE_DELAY=-1
      username: sa
      password:
      driver-class-name: org.h2.Driver
    mysql:
      jdbc-url: jdbc:h2:mem:mysqldb;MODE=MySQL;DB_CLOSE_DELAY=-1
      username: sa
      password:
      driver-class-name: org.h2.Driver
```

### 테스트 구성

```java
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class UserServiceTest {
    // H2가 Oracle/MySQL 모드로 각각 기동됨
    // 실제 서비스 코드는 프로덕션과 동일 경로 실행
}
```

> 주의: H2의 Oracle/MySQL 호환 모드는 100% 호환이 아닙니다. Oracle CONNECT BY, MySQL 스토어드 프로시저 등 DB 고유 기능을 쓰는 경우 테스트와 프로덕션의 결과가 다를 수 있습니다. 중요한 경우 Testcontainers로 실제 Oracle/MySQL 컨테이너를 띄우는 것이 권장됩니다.

> 주의: `@DataJpaTest`는 기본적으로 `@AutoConfigureTestDatabase`로 DataSource를 H2로 교체합니다. 멀티 DataSource 프로젝트에서는 커스텀 DataSource Bean을 보존하려면 `@AutoConfigureTestDatabase(replace = Replace.NONE)` 지정이 필요합니다. MyBatis 환경에서는 `@DataJpaTest` 대신 `@SpringBootTest` 또는 `@MybatisTest`를 사용합니다.

---

## 흔한 실수

| 실수 | 결과 | 해결 |
|------|------|------|
| `url` 키 사용 | DataSourceBuilder가 URL 인식 못함 | `jdbc-url` 사용 |
| `com.mysql.jdbc.Driver` 지정 | `ClassNotFoundException` (Connector/J 8.0+) | `com.mysql.cj.jdbc.Driver` |
| `mysql:mysql-connector-java` 좌표 | Spring Boot 3.x에서 누락 | `com.mysql:mysql-connector-j` |
| Mapper 패키지 미분리 | 런타임 양쪽 팩토리 중복 등록 | 패키지를 Oracle/MySQL로 완전 분리 |
| `@Transactional` 매니저 미지정 | Primary(Oracle)만 트랜잭션, MySQL은 auto-commit | `@Transactional("mysqlTransactionManager")` 명시 |
| `@Primary` 2개 지정 | Bean 중복으로 기동 실패 | Primary는 단 하나의 DataSource/SqlSessionFactory/TransactionManager에만 |
| `max-lifetime`이 DB의 `wait_timeout`보다 큼 | "Connection was closed" 에러 | DB `wait_timeout`보다 작게 설정 |
| 양쪽 DB 쓰기 메서드에서 하나의 트랜잭션 기대 | 부분 성공/실패 발생 | 보상 패턴 또는 JTA/XA 사용 |

---

## 체크리스트 (구성 후 확인)

- [ ] `application.yml`에 `spring.datasource.oracle.jdbc-url` / `spring.datasource.mysql.jdbc-url` 둘 다 존재
- [ ] Oracle DataSource Bean에 `@Primary` 지정, MySQL에는 미지정
- [ ] Mapper 인터페이스 패키지 완전 분리 (`com.example.oracle.mapper`, `com.example.mysql.mapper`)
- [ ] Mapper XML 경로 분리 (`mapper/oracle/*.xml`, `mapper/mysql/*.xml`)
- [ ] `@MapperScan`에 `sqlSessionFactoryRef` 명시
- [ ] TransactionManager Bean 2개 정의, Oracle에 `@Primary`
- [ ] 양쪽 DB 쓰는 서비스 메서드에 `@Transactional("...")` 명시
- [ ] HikariCP pool-name을 각 DataSource별로 지정 (로그 식별 용이)
- [ ] 테스트용 `application-test.yml`에 H2 설정 또는 Testcontainers 준비
