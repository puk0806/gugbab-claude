---
name: spring-multi-datasource-oracle-mysql
description: Spring Boot 2.5/2.7·3.x + MyBatis Oracle(Primary)+MySQL(Secondary) 멀티 DataSource 함정 — 버전 매트릭스(starter·ojdbc8/11·mysql-connector-j 캘린더 버전), javax.sql 은 jakarta 전환 대상 아님, jdbc-url 키·드라이버 클래스·sslMode, 스타터 자동설정 미적용·매퍼 패키지 분리, JdbcTransactionManager 는 5.3부터(레거시 사용 가능), @Transactional 매니저 명시, Boot 3 Atomikos 자동설정 제거, H2 호환 모드 한계
---

# Spring Boot + MyBatis 멀티 데이터소스 (Oracle + MySQL)

> 소스:
> - https://docs.spring.io/spring-boot/how-to/data-access.html
> - https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/
> - https://mybatis.org/spring/factorybean.html
> - https://www.oracle.com/database/technologies/maven-central-guide.html
> - https://dev.mysql.com/doc/connector-j/en/
> - https://docs.spring.io/spring-boot/reference/io/jta.html
>
> 검증일: 2026-11-09 (최초 2026-04-22, 이전 재검증 2026-09-26)

---

## 이 스킬의 범위

DataSource 2개 + `SqlSessionFactory`·`SqlSessionTemplate`·`@MapperScan(sqlSessionFactoryRef=...)`·TransactionManager를 DB별로 수동 구성하는 기본 사용법은 공식 문서 수준이라 싣지 않는다. 여기엔 **버전 매트릭스와 틀리기 쉬운 함정**만 둔다. 풀 튜닝은 `hikaricp-tuning-oracle-mysql`, 매퍼 작성은 `mybatis-mapper-patterns`.

> 주의: 본 스킬은 Spring Boot 2.7 + Java 8/11 (레거시 환경)과 Spring Boot 3.x + Java 17+ (모던 환경) 두 축을 동시에 다룹니다. 각 섹션에서 버전별 분기를 명시합니다. Spring Boot 2.7은 2023-06-30으로 OSS 지원이 종료되었으므로(상용 지원은 2029-06-30까지) 신규 프로젝트에는 3.x 사용을 권장합니다.
>
> 주의(2026-11-09 재검증): MySQL은 2026-07 릴리스(26.7.0)부터 `com.mysql:mysql-connector-j` 버전 표기를 캘린더 버전(YY.M.P)으로 전환했습니다(9.7.0의 후속, 2026-11 최신 26.10.0). 드라이버 클래스명(`com.mysql.cj.jdbc.Driver`)·`sslMode`/`allowPublicKeyRetrieval` 설정은 변경 없이 그대로 유효합니다. `ojdbc11`/`ojdbc8`도 23.26.x 표기로 신규 패치가 배포되었으나(2026-11 최신 23.26.4.0.0) API·드라이버 클래스명(`oracle.jdbc.OracleDriver`)은 동일합니다. 아래 예제의 `23.6.0.24.10`은 예시 고정값입니다. 의존성 버전은 `mysql-connector-j`/`ojdbc11` 모두 Spring Boot BOM 또는 최신 안정 버전 확인 후 프로젝트에 맞게 고정하세요.

---

## 1. 버전 매트릭스

| 항목 | Spring Boot 2.7 (레거시) | Spring Boot 3.x (모던) |
|------|---------------------------|-----------------------|
| Java | 8 / 11 | 17+ |
| mybatis-spring-boot-starter | 2.3.2 | 3.0.5 (Boot 3.2~3.5) — Boot 4.x는 4.x 라인(최신 4.1.0) |
| 패키지 | `javax.sql.DataSource` | `javax.sql.DataSource` (JDK 소속 — jakarta 전환 대상 아님) |
| Oracle JDBC | `ojdbc8` (예: `23.6.0.24.10`) | `ojdbc11` |
| MySQL | `com.mysql:mysql-connector-j` | `com.mysql:mysql-connector-j` |

> 주의: Spring Boot 3.x부터 Jakarta EE 스펙(Servlet·JPA·Validation 등)이 `jakarta.*` 네임스페이스로 전환되었습니다(이 스킬의 `javax.sql.DataSource`는 JDK 소속이라 제외). 해당 import 변경이 필수이며, OpenRewrite / Spring Boot Migrator를 이용한 자동 변환 도구가 제공됩니다.

> 주의: `javax.sql.DataSource`는 Spring Boot 3.x의 Jakarta EE 9 전환 대상이 **아닙니다**. `java.sql`, `javax.sql`은 JDK 표준 패키지이므로 그대로 유지됩니다. `jakarta.*`로 바뀐 것은 Servlet, Persistence(JPA), Validation 등 Jakarta EE 스펙입니다.

`import jakarta.sql.DataSource`는 틀린 코드다 — 3.x에서도 `javax.sql.DataSource`.

> 주의: Spring Boot 2.x 구버전 프로젝트 중 아직 `mysql:mysql-connector-java` 좌표를 쓰는 경우가 있습니다. Spring Boot 3.x부터는 반드시 `com.mysql:mysql-connector-j`로 변경해야 하며, 2.7에서도 신규 좌표가 권장됩니다.

> 주의: MySQL Connector/J 8.0부터 드라이버 클래스명이 `com.mysql.jdbc.Driver` → `com.mysql.cj.jdbc.Driver`로 변경되었습니다. 구 클래스명은 deprecated되었으며 최신 버전에서는 `ClassNotFoundException`이 발생합니다. `application.yml`의 `driver-class-name`을 반드시 확인하세요.

---

## 2. 설정 함정

```yaml
spring:
  datasource:
    oracle:
      jdbc-url: jdbc:oracle:thin:@//localhost:1521/ORCLPDB1   # url 아님
      driver-class-name: oracle.jdbc.OracleDriver
      hikari: { pool-name: OracleHikariPool }                  # DB별 pool-name 명시
    mysql:
      jdbc-url: jdbc:mysql://localhost:3306/appdb?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Seoul
      driver-class-name: com.mysql.cj.jdbc.Driver
      hikari: { pool-name: MySqlHikariPool }
```

> 주의: `spring.datasource.oracle.url` 대신 `jdbc-url`을 사용합니다. `DataSourceBuilder.create().type(HikariDataSource.class)`가 내부적으로 HikariCP 프로퍼티 매핑 규칙을 따르기 때문에 `url` 키는 인식되지 않을 수 있습니다.

> 주의: MySQL Connector/J 8.0.13부터 `useSSL`이 deprecated되고 `sslMode`(기본값 PREFERRED)로 대체되었습니다. SSL 미지원 서버에 연결하려면 `sslMode=DISABLED`를 명시합니다. `allowPublicKeyRetrieval`의 기본값은 `false`이며, caching_sha2_password 인증이 필요한 MySQL 8.x 환경에서 비SSL 접속 시 `allowPublicKeyRetrieval=true`가 필요할 수 있습니다.

> 주의: 멀티 DataSource 환경에서는 Spring Boot의 DataSource 자동 설정이 동작하지 않습니다. `@Primary`가 지정된 Bean이 기본 DataSource로 사용되며, `@Primary` 없이 2개 이상의 DataSource Bean만 등록하면 "No qualifying bean" 또는 "more than one qualifying bean" 오류가 발생합니다.

반대로 `@Primary`를 2개 지정하면 Bean 중복으로 기동 실패 — Primary는 단 하나의 DataSource/SqlSessionFactory/TransactionManager에만.

> 주의: `mybatis-spring-boot-starter`의 자동 설정은 멀티 DataSource 환경에서는 적용되지 않습니다(공식 문서 명시). 각 DataSource별 `SqlSessionFactory`·`SqlSessionTemplate`·`@MapperScan`을 수동 구성해야 합니다.

> 주의: Mapper 인터페이스 패키지는 반드시 분리해야 합니다. 동일 패키지에 Oracle/MySQL 매퍼가 섞여 있으면 `@MapperScan`이 양쪽 팩토리에 등록되어 런타임 충돌이 발생합니다.

XML 경로도 `mapper/oracle/*.xml`·`mapper/mysql/*.xml`로 분리하고, `@MapperScan`에 `sqlSessionFactoryRef`를 명시한다.

---

## 3. 트랜잭션 매니저

> 주의: `JdbcTransactionManager`는 Spring Framework **5.3**부터 있는 `DataSourceTransactionManager`의 하위 클래스로, commit·rollback 단계에서 JDBC 예외 변환(`TransactionSystemException` 대신 `ConcurrencyFailureException` 등 `DataAccessException`)을 추가로 수행합니다. Framework 5.3 기반인 Boot 2.4+(2.5/2.7 포함)에서도 쓸 수 있으며, `DataSourceTransactionManager`는 기존 코드 유지용 선택지입니다.

패키지: `org.springframework.jdbc.support.JdbcTransactionManager` vs `org.springframework.jdbc.datasource.DataSourceTransactionManager`.

> 주의: `@Transactional` 속성에 트랜잭션 매니저를 지정하지 않으면 `@Primary`로 마킹된 매니저가 사용됩니다. **양쪽 DB에 쓰는 서비스 메서드는 반드시 트랜잭션 매니저를 명시**해야 하며, 미지정 시 보조 DB 호출은 개별 트랜잭션(또는 auto-commit)으로 실행되어 의도치 않은 결과를 낳을 수 있습니다.

### 크로스 DB 원자성 — XA는 신중히

- XA는 외부 JTA 매니저(Atomikos — 상용 라이선스)·XA 드라이버(`OracleXADataSource`, `MysqlXADataSource`)·2PC 오버헤드가 따른다.
- **Spring Boot 3.x에서는 Atomikos 자동 설정이 제거됨** (`spring-boot-starter-jta-atomikos` 미지원) — 모델이 SB3에 이 스타터를 제안하면 틀린 것.
- 보편적인 웹 애플리케이션에서는 주력(Oracle) 트랜잭션 + 보조(MySQL) 별도 트랜잭션 실패 시 재시도 큐 같은 보상·아웃박스 패턴이 권장된다.

---

## 4. 테스트

> 주의: H2의 Oracle/MySQL 호환 모드(`MODE=Oracle`/`MODE=MySQL`)는 100% 호환이 아닙니다. Oracle CONNECT BY, MySQL 스토어드 프로시저 등 DB 고유 기능을 쓰는 경우 테스트와 프로덕션의 결과가 다를 수 있습니다. 중요한 경우 Testcontainers로 실제 Oracle/MySQL 컨테이너를 띄우는 것이 권장됩니다.

> 주의: `@DataJpaTest`는 기본적으로 `@AutoConfigureTestDatabase`로 DataSource를 H2로 교체합니다. 멀티 DataSource 프로젝트에서는 커스텀 DataSource Bean을 보존하려면 `@AutoConfigureTestDatabase(replace = Replace.NONE)` 지정이 필요합니다. MyBatis 환경에서는 `@DataJpaTest` 대신 `@SpringBootTest` 또는 `@MybatisTest`를 사용합니다.

> 주의: HikariCP 공식 가이드는 "기본값은 안전한 출발점일 뿐 최적값은 아니다"라고 명시합니다. 멀티 DB 환경에서는 각 DB의 `wait_timeout`(MySQL), `idle_time_limit`(Oracle)을 확인해 `max-lifetime`을 그보다 작게 설정해야 "connection was closed" 오류를 방지합니다.
