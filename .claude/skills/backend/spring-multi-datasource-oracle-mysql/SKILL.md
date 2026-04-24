---
name: spring-multi-datasource-oracle-mysql
description: Spring Boot 2.5/2.7 및 3.x에서 Oracle(Primary) + MySQL(Secondary) 멀티 데이터소스를 MyBatis 기반으로 구성하는 패턴 — DataSource/SqlSessionFactory/TransactionManager 분리, @MapperScan, XA 대안 및 H2 테스트 구성 포함
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
> 검증일: 2026-04-22

> 주의: 본 스킬은 Spring Boot 2.7 + Java 8/11 (레거시 환경)과 Spring Boot 3.x + Java 17+ (모던 환경) 두 축을 동시에 다룹니다. 각 섹션에서 버전별 분기를 명시합니다. Spring Boot 2.7은 2023-11-24로 OSS 지원이 종료되었으므로 신규 프로젝트에는 3.x 사용을 권장합니다.

---

## 버전 매트릭스

| 항목 | Spring Boot 2.7 (레거시) | Spring Boot 3.x (모던) |
|------|---------------------------|-----------------------|
| Java | 8 / 11 | 17+ |
| mybatis-spring-boot-starter | 2.3.2 | 3.0.5 (Boot 3.5 기준) |
| 패키지 | `javax.sql.DataSource` | `jakarta.sql.DataSource` |
| Oracle JDBC | `ojdbc8` | `ojdbc11` |
| MySQL | `com.mysql:mysql-connector-j` | `com.mysql:mysql-connector-j` |

> 주의: Spring Boot 3.x부터 `jakarta.*` 네임스페이스로 전환되었습니다. import 변경이 필수이며, OpenRewrite / Spring Boot Migrator를 이용한 자동 변환 도구가 제공됩니다.

---

## 의존성 설정

### Maven (Spring Boot 3.x)

```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>

    <!-- MyBatis - Spring Boot 3.x는 3.x 라인 -->
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>3.0.5</version>
    </dependency>

    <!-- Oracle JDBC - JDK 17+ 환경 -->
    <dependency>
        <groupId>com.oracle.database.jdbc</groupId>
        <artifactId>ojdbc11</artifactId>
        <version>23.6.0.24.10</version>
    </dependency>

    <!-- MySQL Connector/J - Spring Boot 3.x 좌표 -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

### Maven (Spring Boot 2.7 레거시)

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>

    <!-- MyBatis - Spring Boot 2.7은 2.3.x 라인 -->
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>2.3.2</version>
    </dependency>

    <!-- Oracle JDBC - JDK 8/11 환경 -->
    <dependency>
        <groupId>com.oracle.database.jdbc</groupId>
        <artifactId>ojdbc8</artifactId>
        <version>23.6.0.24.10</version>
    </dependency>

    <!-- MySQL Connector/J (Spring Boot 2.x도 신규 좌표 사용 가능) -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

> 주의: Spring Boot 2.x 구버전 프로젝트 중 아직 `mysql:mysql-connector-java` 좌표를 쓰는 경우가 있습니다. Spring Boot 3.x부터는 반드시 `com.mysql:mysql-connector-j`로 변경해야 하며, 2.7에서도 신규 좌표가 권장됩니다.

> 주의: MySQL Connector/J 8.0부터 드라이버 클래스명이 `com.mysql.jdbc.Driver` → `com.mysql.cj.jdbc.Driver`로 변경되었습니다. 구 클래스명은 deprecated되었으며 최신 버전에서는 `ClassNotFoundException`이 발생합니다. `application.yml`의 `driver-class-name`을 반드시 확인하세요.

---

## application.yml 구조

```yaml
spring:
  datasource:
    oracle:
      # Oracle (Primary) - 주력 DB
      jdbc-url: jdbc:oracle:thin:@//localhost:1521/ORCLPDB1
      username: ${ORACLE_USER}
      password: ${ORACLE_PASSWORD}
      driver-class-name: oracle.jdbc.OracleDriver
      hikari:
        pool-name: OracleHikariPool
        maximum-pool-size: 20
        minimum-idle: 5
        connection-timeout: 30000
        idle-timeout: 600000
        max-lifetime: 1800000

    mysql:
      # MySQL (Secondary) - 보조 DB
      jdbc-url: jdbc:mysql://localhost:3306/appdb?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Seoul
      username: ${MYSQL_USER}
      password: ${MYSQL_PASSWORD}
      driver-class-name: com.mysql.cj.jdbc.Driver
      hikari:
        pool-name: MySqlHikariPool
        maximum-pool-size: 10
        minimum-idle: 2
        connection-timeout: 30000
        idle-timeout: 600000
        max-lifetime: 1800000

mybatis:
  configuration:
    map-underscore-to-camel-case: true
    default-fetch-size: 100
    default-statement-timeout: 30
```

> 주의: `spring.datasource.oracle.url` 대신 `jdbc-url`을 사용합니다. `DataSourceBuilder.create().type(HikariDataSource.class)`가 내부적으로 HikariCP 프로퍼티 매핑 규칙을 따르기 때문에 `url` 키는 인식되지 않을 수 있습니다.

> 주의: MySQL Connector/J 8.0.13부터 `useSSL`이 deprecated되고 `sslMode`(기본값 PREFERRED)로 대체되었습니다. SSL 미지원 서버에 연결하려면 `sslMode=DISABLED`를 명시합니다. `allowPublicKeyRetrieval`의 기본값은 `false`이며, caching_sha2_password 인증이 필요한 MySQL 8.x 환경에서 비SSL 접속 시 `allowPublicKeyRetrieval=true`가 필요할 수 있습니다.

---

## DataSource 두 개 구성 (@Primary 전략)

### Oracle DataSource (Primary)

```java
package com.example.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource; // Spring Boot 3.x에서는 jakarta.sql.DataSource 가 아님 (DataSource는 계속 javax.sql에 있음)

@Configuration
public class OracleDataSourceConfig {

    @Bean(name = "oracleDataSource")
    @Primary
    @ConfigurationProperties(prefix = "spring.datasource.oracle")
    public DataSource oracleDataSource() {
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .build();
    }
}
```

> 주의: `javax.sql.DataSource`는 Spring Boot 3.x의 Jakarta EE 9 전환 대상이 **아닙니다**. `java.sql`, `javax.sql`은 JDK 표준 패키지이므로 그대로 유지됩니다. `jakarta.*`로 바뀐 것은 Servlet, Persistence(JPA), Validation 등 Jakarta EE 스펙입니다.

### MySQL DataSource (Secondary)

```java
package com.example.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class MySqlDataSourceConfig {

    @Bean(name = "mysqlDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.mysql")
    public DataSource mysqlDataSource() {
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .build();
    }
}
```

> 주의: 멀티 DataSource 환경에서는 Spring Boot의 DataSource 자동 설정이 동작하지 않습니다. `@Primary`가 지정된 Bean이 기본 DataSource로 사용되며, `@Primary` 없이 2개 이상의 DataSource Bean만 등록하면 "No qualifying bean" 또는 "more than one qualifying bean" 오류가 발생합니다.

---

## MyBatis SqlSessionFactory 분리

### 폴더 구조

```
src/main/java/com/example/
├── oracle/
│   └── mapper/
│       ├── UserMapper.java
│       └── OrderMapper.java
└── mysql/
    └── mapper/
        ├── LogMapper.java
        └── StatsMapper.java

src/main/resources/
└── mapper/
    ├── oracle/
    │   ├── UserMapper.xml
    │   └── OrderMapper.xml
    └── mysql/
        ├── LogMapper.xml
        └── StatsMapper.xml
```

### Oracle SqlSessionFactory + MapperScan

```java
package com.example.config;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import javax.sql.DataSource;

@Configuration
@MapperScan(
    basePackages = "com.example.oracle.mapper",
    sqlSessionFactoryRef = "oracleSqlSessionFactory"
)
public class OracleMyBatisConfig {

    @Bean(name = "oracleSqlSessionFactory")
    @Primary
    public SqlSessionFactory oracleSqlSessionFactory(
            @Qualifier("oracleDataSource") DataSource dataSource) throws Exception {
        SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
        factoryBean.setDataSource(dataSource);
        factoryBean.setMapperLocations(
            new PathMatchingResourcePatternResolver()
                .getResources("classpath:mapper/oracle/*.xml")
        );
        factoryBean.getObject().getConfiguration().setMapUnderscoreToCamelCase(true);
        return factoryBean.getObject();
    }

    @Bean(name = "oracleSqlSessionTemplate")
    @Primary
    public SqlSessionTemplate oracleSqlSessionTemplate(
            @Qualifier("oracleSqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }
}
```

### MySQL SqlSessionFactory + MapperScan

```java
package com.example.config;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import javax.sql.DataSource;

@Configuration
@MapperScan(
    basePackages = "com.example.mysql.mapper",
    sqlSessionFactoryRef = "mysqlSqlSessionFactory"
)
public class MySqlMyBatisConfig {

    @Bean(name = "mysqlSqlSessionFactory")
    public SqlSessionFactory mysqlSqlSessionFactory(
            @Qualifier("mysqlDataSource") DataSource dataSource) throws Exception {
        SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
        factoryBean.setDataSource(dataSource);
        factoryBean.setMapperLocations(
            new PathMatchingResourcePatternResolver()
                .getResources("classpath:mapper/mysql/*.xml")
        );
        return factoryBean.getObject();
    }

    @Bean(name = "mysqlSqlSessionTemplate")
    public SqlSessionTemplate mysqlSqlSessionTemplate(
            @Qualifier("mysqlSqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }
}
```

> 주의: `mybatis-spring-boot-starter`의 자동 설정은 멀티 DataSource 환경에서는 적용되지 않습니다(공식 문서 명시). 각 DataSource별 `SqlSessionFactory`·`SqlSessionTemplate`·`@MapperScan`을 수동 구성해야 합니다.

> 주의: Mapper 인터페이스 패키지는 반드시 분리해야 합니다. 동일 패키지에 Oracle/MySQL 매퍼가 섞여 있으면 `@MapperScan`이 양쪽 팩토리에 등록되어 런타임 충돌이 발생합니다.

---

## 트랜잭션 매니저 분리

### TransactionManager Bean 정의

```java
package com.example.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.support.JdbcTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;

@Configuration
public class TransactionManagerConfig {

    @Bean(name = "oracleTransactionManager")
    @Primary
    public PlatformTransactionManager oracleTransactionManager(
            @Qualifier("oracleDataSource") DataSource dataSource) {
        return new JdbcTransactionManager(dataSource);
    }

    @Bean(name = "mysqlTransactionManager")
    public PlatformTransactionManager mysqlTransactionManager(
            @Qualifier("mysqlDataSource") DataSource dataSource) {
        return new JdbcTransactionManager(dataSource);
    }
}
```

> 주의: Spring Framework 6.0부터 `DataSourceTransactionManager`보다 `JdbcTransactionManager` 사용이 권장됩니다(이전 버전 호환성 유지). 둘 다 `PlatformTransactionManager`를 구현하며 동작은 동일하지만 `JdbcTransactionManager`가 예외 변환을 추가로 수행합니다.

**Spring Boot 2.5/2.7 (레거시) 버전** — `DataSourceTransactionManager` 사용:

```java
package com.example.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;

@Configuration
public class TransactionManagerConfig {

    @Bean(name = "oracleTransactionManager")
    @Primary
    public PlatformTransactionManager oracleTransactionManager(
            @Qualifier("oracleDataSource") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);  // 레거시
    }

    @Bean(name = "mysqlTransactionManager")
    public PlatformTransactionManager mysqlTransactionManager(
            @Qualifier("mysqlDataSource") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);  // 레거시
    }
}
```

레거시/모던 간 차이는 import 경로(`org.springframework.jdbc.datasource.DataSourceTransactionManager` vs `org.springframework.jdbc.support.JdbcTransactionManager`)와 `javax.sql`/`jakarta.sql` 네임스페이스뿐. 로직·빈 이름·`@Primary` 전략은 동일.

### @Transactional 사용법

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserMapper userMapper;        // Oracle
    private final LogMapper logMapper;          // MySQL

    public UserService(UserMapper userMapper, LogMapper logMapper) {
        this.userMapper = userMapper;
        this.logMapper = logMapper;
    }

    // 명시적으로 Oracle 트랜잭션 매니저 지정
    @Transactional("oracleTransactionManager")
    public void createUser(User user) {
        userMapper.insert(user);
    }

    // 명시적으로 MySQL 트랜잭션 매니저 지정
    @Transactional("mysqlTransactionManager")
    public void recordLog(LogEntry log) {
        logMapper.insert(log);
    }

    // 미지정 시 @Primary 지정된 oracleTransactionManager 사용
    @Transactional
    public void defaultTransaction() {
        userMapper.insert(...); // Oracle 트랜잭션
    }
}
```

> 주의: `@Transactional` 속성에 트랜잭션 매니저를 지정하지 않으면 `@Primary`로 마킹된 매니저가 사용됩니다. **양쪽 DB에 쓰는 서비스 메서드는 반드시 트랜잭션 매니저를 명시**해야 하며, 미지정 시 보조 DB 호출은 개별 트랜잭션(또는 auto-commit)으로 실행되어 의도치 않은 결과를 낳을 수 있습니다.

---

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
