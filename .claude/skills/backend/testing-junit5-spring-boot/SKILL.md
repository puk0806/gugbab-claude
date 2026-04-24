---
name: testing-junit5-spring-boot
description: JUnit 5 + Spring Boot(2.5 & 3.x) 테스트 패턴 - 단위·슬라이스·통합·E2E 테스트, Mockito, MockMvc, MyBatis 테스트, Testcontainers
---

# JUnit 5 + Spring Boot 테스트 스킬

> 소스: https://junit.org/junit5/docs/current/user-guide/ | https://docs.spring.io/spring-boot/reference/testing/ | https://mybatis.org/spring-boot-starter/mybatis-spring-boot-test-autoconfigure/ | https://java.testcontainers.org/test_framework_integration/junit_5/
> 검증일: 2026-04-22

> 주의: 이 문서는 JUnit 5.14.x(LTS)와 Spring Boot 2.5 / 3.x 양쪽을 대상으로 합니다. JUnit 6.x(2026-02 GA)는 JDK 17+ 요구 등 breaking change가 있어 기존 2.5/3.x 프로젝트에서는 JUnit 5.x를 유지하는 것이 안전합니다.

> 주의: MyBatis 기반 프로젝트를 전제로 합니다. JPA 관련 어노테이션(`@DataJpaTest` 등)은 의도적으로 제외했습니다.

---

## 의존성 설정

### Spring Boot 3.x (Maven)

```xml
<!-- pom.xml -->
<dependencies>
    <!-- Spring Boot 테스트 (JUnit 5, Mockito, AssertJ, MockMvc 포함) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>

    <!-- MyBatis 테스트 슬라이스 -->
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter-test</artifactId>
        <version>3.0.3</version>
        <scope>test</scope>
    </dependency>

    <!-- H2 인메모리 DB (슬라이스/통합 테스트용) -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>test</scope>
    </dependency>

    <!-- Testcontainers (실제 DB 통합 테스트) -->
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>1.20.4</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>oracle-free</artifactId>
        <version>1.20.4</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>mysql</artifactId>
        <version>1.20.4</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Spring Boot 2.5 (Maven)

```xml
<!-- spring-boot-starter-test은 동일 (JUnit 5가 2.2부터 기본) -->
<!-- 다만 mybatis-spring-boot-starter-test 버전은 2.2.x 계열 사용 -->
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter-test</artifactId>
    <version>2.2.2</version>
    <scope>test</scope>
</dependency>
```

> 주의: `spring-boot-starter-test`는 2.2+부터 JUnit 5가 기본이며, JUnit 4를 쓰려면 vintage engine을 명시적으로 추가해야 합니다. Spring Boot 2.5 / 3.x 모두 JUnit 5를 기본으로 사용합니다.

### Gradle

```gradle
dependencies {
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter-test:3.0.3'
    testRuntimeOnly 'com.h2database:h2'
    testImplementation 'org.testcontainers:junit-jupiter:1.20.4'
    testImplementation 'org.testcontainers:oracle-free:1.20.4'
    testImplementation 'org.testcontainers:mysql:1.20.4'
}

test {
    useJUnitPlatform()
}
```

---

## JUnit 5 핵심 어노테이션

| 어노테이션 | 역할 |
|-----------|------|
| `@Test` | 테스트 메서드 표시 |
| `@BeforeEach` | 각 테스트 실행 전 호출 (테스트 격리 setup) |
| `@AfterEach` | 각 테스트 실행 후 호출 (cleanup) |
| `@BeforeAll` | 클래스 내 모든 테스트 실행 전 1회 (static 메서드) |
| `@AfterAll` | 클래스 내 모든 테스트 실행 후 1회 (static 메서드) |
| `@DisplayName("...")` | 테스트 이름을 읽기 쉬운 문자열로 지정 |
| `@Disabled("reason")` | 테스트 일시 비활성화 |
| `@Nested` | 중첩 테스트 클래스 (문맥별 그룹화) |
| `@ParameterizedTest` | 파라미터를 바꿔가며 반복 실행 |

```java
import org.junit.jupiter.api.*;

@DisplayName("UserService 단위 테스트")
class UserServiceTest {

    @BeforeAll
    static void initAll() {
        // 클래스 전체 1회 실행 (e.g. DB 커넥션 풀 초기화)
    }

    @BeforeEach
    void setUp() {
        // 각 테스트 전 실행 (e.g. 테스트 대상 객체 생성)
    }

    @Test
    @DisplayName("사용자 ID로 조회 시 정상 반환된다")
    void findById_returnsUser() {
        // ...
    }

    @Test
    @Disabled("외부 API 의존으로 임시 비활성화 - 2026Q2 복구 예정")
    void callsExternalApi() { }

    @AfterEach
    void tearDown() { }

    @Nested
    @DisplayName("인증 실패 시")
    class WhenUnauthenticated {
        @Test
        void throwsException() { }
    }
}
```

### @ParameterizedTest

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

class ValidationTest {

    @ParameterizedTest
    @ValueSource(strings = {"", " ", "a"})
    @DisplayName("username이 짧거나 공백이면 유효하지 않다")
    void invalidUsernames(String username) {
        assertThat(UserValidator.isValid(username)).isFalse();
    }

    @ParameterizedTest
    @CsvSource({
        "1, 1, 2",
        "2, 3, 5",
        "10, -5, 5"
    })
    void add_returnsSum(int a, int b, int expected) {
        assertThat(Calculator.add(a, b)).isEqualTo(expected);
    }
}
```

---

## Given-When-Then 패턴

테스트 가독성을 위해 세 구역으로 분리합니다.

```java
@Test
@DisplayName("잔액이 충분하면 출금 후 잔액이 감소한다")
void withdraw_sufficientBalance_decreasesBalance() {
    // given - 사전 상태 준비
    Account account = new Account("user-1", 10_000L);

    // when - 테스트 대상 동작 수행
    account.withdraw(3_000L);

    // then - 결과 검증
    assertThat(account.getBalance()).isEqualTo(7_000L);
}
```

BDD 스타일이 필요하면 Mockito의 `given()`·`willReturn()`도 함께 사용할 수 있습니다.

```java
import static org.mockito.BDDMockito.given;

// given
given(userRepository.findById(1L)).willReturn(Optional.of(user));
// when
User result = userService.getUser(1L);
// then
assertThat(result.getName()).isEqualTo("Alice");
```

---

## 단위 테스트 — Mockito

`@ExtendWith(MockitoExtension.class)` + `@Mock` + `@InjectMocks` 조합. Spring 컨텍스트 로딩 없이 순수 객체 단위로 검증한다.

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserMapper userMapper;          // MyBatis Mapper를 Mock

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;        // 위 @Mock들이 자동 주입됨

    @Test
    @DisplayName("존재하는 사용자 조회")
    void findById_existingUser() {
        // given
        User user = new User(1L, "alice", "hash");
        when(userMapper.findById(1L)).thenReturn(user);

        // when
        User result = userService.findById(1L);

        // then
        assertThat(result.getUsername()).isEqualTo("alice");
        verify(userMapper).findById(1L);
    }

    @Test
    @DisplayName("존재하지 않는 사용자 조회 시 예외")
    void findById_notFound() {
        // given
        when(userMapper.findById(anyLong())).thenReturn(null);

        // when & then
        assertThatThrownBy(() -> userService.findById(999L))
            .isInstanceOf(UserNotFoundException.class)
            .hasMessageContaining("999");
    }
}
```

### Mockito 스텁·검증 API

```java
// 스텁
when(mock.method(any())).thenReturn(value);
when(mock.method(any())).thenThrow(new RuntimeException());

// 연속 호출 시 다른 값 반환
when(mock.method(any()))
    .thenReturn(first)
    .thenReturn(second)
    .thenThrow(new RuntimeException());

// 호출 검증
verify(mock).method(any());             // 1회 호출
verify(mock, times(2)).method(any());   // 정확히 2회
verify(mock, never()).method(any());    // 0회
verify(mock, atLeastOnce()).method(any());

// 호출 순서 검증
InOrder inOrder = inOrder(mockA, mockB);
inOrder.verify(mockA).call1();
inOrder.verify(mockB).call2();
```

### ArgumentCaptor

```java
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;

@Captor
private ArgumentCaptor<User> userCaptor;

@Test
void save_capturesUserArgument() {
    // when
    userService.register("alice", "password");

    // then - 실제 전달된 인자 캡처 후 검증
    verify(userMapper).insert(userCaptor.capture());
    User captured = userCaptor.getValue();
    assertThat(captured.getUsername()).isEqualTo("alice");
    assertThat(captured.getPassword()).startsWith("$2a$"); // bcrypt
}
```

---

## 통합 테스트 — @SpringBootTest

전체 Spring 컨텍스트를 로딩한다. 가장 무겁지만 가장 현실에 가깝다.

### Spring Boot 2.5 (`@MockBean`)

```java
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootTest
@ActiveProfiles("test")
class OrderServiceIntegrationTest {

    @Autowired
    private OrderService orderService;

    @MockBean                          // Spring Boot 2.5: @MockBean
    private PaymentGateway paymentGateway;

    @Test
    void placeOrder_callsPaymentGateway() {
        when(paymentGateway.charge(any())).thenReturn(PaymentResult.success());

        Order order = orderService.place(new CreateOrderCommand(/* ... */));

        assertThat(order.getStatus()).isEqualTo(OrderStatus.PAID);
    }
}
```

### Spring Boot 3.4+ (`@MockitoBean`)

```java
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
class OrderServiceIntegrationTest {

    @Autowired
    private OrderService orderService;

    @MockitoBean                       // Spring Boot 3.4+: @MockitoBean 권장
    private PaymentGateway paymentGateway;
    // ...
}
```

> 주의: `@MockBean`과 `@SpyBean`은 Spring Boot 3.4.0부터 deprecated이며 4.0.0에서 제거 예정입니다. Spring Boot 3.4+ 프로젝트는 `@MockitoBean` / `@MockitoSpyBean`(패키지: `org.springframework.test.context.bean.override.mockito`)으로 마이그레이션해야 합니다. 단, `@MockitoBean`은 `@Configuration`·`@Component` 클래스의 필드에서는 동작하지 않으므로 1:1 치환이 불가능한 경우가 있습니다.

---

## 슬라이스 테스트

전체 컨텍스트 대신 필요한 계층만 로딩해 빠르게 실행한다.

### @WebMvcTest — Controller 계층

```java
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean           // 또는 Spring Boot 2.5에서는 @MockBean
    private UserService userService;

    @Test
    @DisplayName("GET /users/{id} - 200 OK")
    void getUser() throws Exception {
        // given
        given(userService.findById(1L))
            .willReturn(new UserResponse(1L, "alice"));

        // when & then
        mockMvc.perform(get("/users/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.username").value("alice"));
    }

    @Test
    @DisplayName("POST /users - 201 Created")
    void createUser() throws Exception {
        String body = """
            {"username": "bob", "email": "bob@example.com"}
            """;

        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andExpect(header().exists("Location"));
    }
}
```

> 주의: `@WebMvcTest`는 `@Controller`, `@ControllerAdvice`, `@JsonComponent`, `Filter`, `WebMvcConfigurer`만 로딩합니다. `@Service`, `@Repository`, `@Component`는 로딩되지 않으므로 `@MockitoBean`/`@MockBean`으로 대체해야 합니다.

### @MybatisTest — Mapper 계층

```java
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;

import static org.assertj.core.api.Assertions.*;

@MybatisTest
// 기본 임베디드(H2) 대신 실제 DataSource를 쓰려면 Replace.NONE
// @AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserMapperTest {

    @Autowired
    private UserMapper userMapper;

    @Test
    @DisplayName("ID로 조회")
    void findById() {
        User user = userMapper.findById(1L);
        assertThat(user).isNotNull();
        assertThat(user.getUsername()).isEqualTo("alice");
    }
}
```

> `@MybatisTest`는 `SqlSessionFactory`, `SqlSessionTemplate`, Mapper 인터페이스, 임베디드 DB(H2/HSQL/Derby 중 클래스패스에 있는 것)를 자동 구성합니다. `@Service`/`@Controller`는 로딩하지 않습니다.

### 슬라이스 테스트에서 SQL 스키마·초기 데이터 로딩

```java
import org.springframework.test.context.jdbc.Sql;

@MybatisTest
@Sql(scripts = {"/schema-test.sql", "/data-test.sql"})
class UserMapperTest {
    // ...
}
```

또는 `src/test/resources/schema.sql`, `data.sql`을 두면 Spring Boot가 자동 로딩합니다.

---

## MockMvc 단정 API 치트시트

```java
mockMvc.perform(get("/path"))
    // 상태
    .andExpect(status().isOk())               // 200
    .andExpect(status().isCreated())          // 201
    .andExpect(status().isNoContent())        // 204
    .andExpect(status().isBadRequest())       // 400
    .andExpect(status().isNotFound())         // 404
    .andExpect(status().is4xxClientError())

    // 헤더
    .andExpect(header().string("Content-Type", "application/json"))
    .andExpect(header().exists("Location"))

    // 콘텐츠
    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
    .andExpect(content().json("{\"id\":1}"))
    .andExpect(content().string(containsString("alice")))

    // JSONPath
    .andExpect(jsonPath("$.id").value(1L))
    .andExpect(jsonPath("$.name").value("alice"))
    .andExpect(jsonPath("$.tags").isArray())
    .andExpect(jsonPath("$.tags", hasSize(3)))
    .andExpect(jsonPath("$.tags[0]").value("admin"))
    .andExpect(jsonPath("$.email").doesNotExist())

    // 결과 출력·캡처
    .andDo(print())
    .andReturn();
```

---

## AssertJ

`spring-boot-starter-test`에 포함되어 있으며 Hamcrest보다 가독성이 좋습니다.

```java
import static org.assertj.core.api.Assertions.*;

// 기본
assertThat(result).isEqualTo(expected);
assertThat(result).isNotNull();
assertThat(result).isIn("a", "b", "c");

// 문자열
assertThat(name).startsWith("A").endsWith("e").hasSize(5);
assertThat(name).containsIgnoringCase("ALICE");

// 컬렉션
assertThat(users)
    .hasSize(3)
    .extracting(User::getUsername)
    .containsExactly("alice", "bob", "carol");

assertThat(users)
    .filteredOn(u -> u.getAge() > 20)
    .hasSize(2);

// Optional
assertThat(optionalUser).isPresent().get().hasFieldOrPropertyWithValue("id", 1L);

// 예외
assertThatThrownBy(() -> service.deleteUser(999L))
    .isInstanceOf(UserNotFoundException.class)
    .hasMessageContaining("999")
    .hasNoCause();

// 특정 예외 타입 전용
assertThatExceptionOfType(IllegalArgumentException.class)
    .isThrownBy(() -> service.register(null))
    .withMessageContaining("username");

// 예외가 발생하지 않음을 확인
assertThatNoException().isThrownBy(() -> service.ping());
```

---

## 테스트 프로파일 & H2

### @ActiveProfiles

```java
@SpringBootTest
@ActiveProfiles("test")
class OrderIntegrationTest { }
```

### src/test/resources/application-test.yml

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=Oracle  # 또는 MODE=MySQL
    driver-class-name: org.h2.Driver
    username: sa
    password:

mybatis:
  mapper-locations: classpath:mapper/**/*.xml
  configuration:
    map-underscore-to-camel-case: true

logging:
  level:
    org.springframework.jdbc: DEBUG
    com.example.mapper: TRACE
```

> 주의: H2의 `MODE=Oracle` 또는 `MODE=MySQL`은 방언 호환성을 일부만 제공합니다. 복잡한 Oracle/MySQL 전용 SQL(계층 쿼리, `CONNECT BY`, MySQL 특화 함수 등)이 있다면 Testcontainers로 실제 DB 기반 테스트를 수행해야 합니다.

---

## Testcontainers 통합

실제 Oracle/MySQL 컨테이너에서 통합 테스트를 수행한다. Docker 필요.

### BOM으로 버전 관리 (권장)

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>testcontainers-bom</artifactId>
            <version>1.20.4</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### MySQL 예시

```java
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest
@Testcontainers
class UserIntegrationTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void dataSourceProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }

    @Autowired
    private UserMapper userMapper;

    @Test
    void insertAndFind() {
        userMapper.insert(new User(null, "alice", "alice@example.com"));
        assertThat(userMapper.findByUsername("alice")).isNotNull();
    }
}
```

### Oracle 예시 (oracle-free 모듈)

```java
import org.testcontainers.oracle.OracleContainer;

@SpringBootTest
@Testcontainers
class UserOracleIntegrationTest {

    @Container
    static OracleContainer oracle = new OracleContainer(
            "gvenzl/oracle-free:23-slim-faststart")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", oracle::getJdbcUrl);
        registry.add("spring.datasource.username", oracle::getUsername);
        registry.add("spring.datasource.password", oracle::getPassword);
    }
}
```

> 주의: `oracle-free` 모듈은 2023년 추가되었습니다. 구버전 Oracle XE가 필요하다면 `org.testcontainers:oracle-xe` 모듈을 사용합니다. 이미지 태그는 Oracle의 [공식 gvenzl 이미지](https://hub.docker.com/r/gvenzl/oracle-free)에서 확인해 최신을 사용하세요.

### @Container 필드 범위

| 필드 수식자 | 라이프사이클 |
|-----------|-------------|
| `static`  | 클래스 내 모든 테스트가 **하나의 컨테이너**를 공유 (권장: 느린 DB 시작 시간 분산) |
| (인스턴스) | 테스트 메서드마다 컨테이너 재시작 (비용 큼, 격리 필요할 때만) |

---

## E2E 통합 — TestRestTemplate / WebTestClient

실제 서블릿 컨테이너를 띄우고 HTTP 클라이언트로 호출한다.

### TestRestTemplate

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UserApiE2ETest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void getUser_returnsOk() {
        ResponseEntity<UserResponse> response =
            restTemplate.getForEntity("/users/1", UserResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getUsername()).isEqualTo("alice");
    }

    @Test
    void post4xx_returnsErrorBodyWithoutException() {
        // TestRestTemplate은 4xx/5xx에도 예외를 던지지 않음
        ResponseEntity<String> response =
            restTemplate.postForEntity("/users", "invalid", String.class);
        assertThat(response.getStatusCode().is4xxClientError()).isTrue();
    }
}
```

### WebTestClient (Spring Boot 2.4+, WebFlux·서블릿 모두 가능)

```java
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
class UserApiWebFluxTest {

    @Autowired
    private WebTestClient client;

    @Test
    void getUser() {
        client.get().uri("/users/1")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.id").isEqualTo(1)
            .jsonPath("$.username").isEqualTo("alice");
    }
}
```

---

## 언제 어떤 테스트를 쓰는가

| 상황 | 테스트 유형 | 이유 |
|-----|----------|------|
| 순수 비즈니스 로직(조건 분기, 계산) | 단위 테스트 (Mockito) | 컨텍스트 로딩 없이 수 ms 안에 수백 개 실행 |
| Controller의 HTTP 라우팅·JSON 직렬화·검증 | `@WebMvcTest` + MockMvc | Controller/필터만 로딩, service는 mock |
| MyBatis Mapper의 SQL 동작 | `@MybatisTest` + H2 또는 Testcontainers | DB 왕복만 검증, 나머지 계층 제외 |
| service-repository-db 일관성 | `@SpringBootTest` + Testcontainers | 실제 DB 방언까지 검증 |
| 외부 시스템이 개입된 end-to-end 시나리오 | `@SpringBootTest(RANDOM_PORT)` + TestRestTemplate | 실제 HTTP 호출로 서블릿 스택까지 통과 |

---

## 흔한 실수 패턴

1. **슬라이스 테스트에 `@SpringBootTest` 남용** — 전체 컨텍스트가 뜨면서 테스트가 수초씩 걸린다. 계층별 슬라이스 우선.
2. **`@MockBean`을 Spring Boot 3.4+에서 계속 사용** — deprecated이므로 `@MockitoBean`으로 마이그레이션.
3. **`@BeforeAll`을 non-static으로 선언** — JUnit 5 기본 라이프사이클에서는 static이어야 한다. (또는 `@TestInstance(Lifecycle.PER_CLASS)` 사용.)
4. **`when(...).thenReturn(...)`을 Mockito의 strict 모드에서 불필요하게 선언** — `@ExtendWith(MockitoExtension.class)`는 기본 strict이라 사용하지 않는 stub은 `UnnecessaryStubbingException`을 던진다. 조건부 stub은 `lenient().when(...)`.
5. **H2 `MODE=Oracle`만 믿고 프로덕션에 올림** — 방언 호환성이 완전하지 않다. 핵심 쿼리는 Testcontainers로 실제 DB 대상 테스트 필요.
6. **MockMvc 테스트에서 Jackson 직렬화 차이 무시** — `jsonPath("$.createdAt").value("...")` 비교 시 timezone/포맷 달라 실패. `ObjectMapper`를 주입받아 역직렬화 후 AssertJ로 비교하는 편이 안전.
7. **`@Container` 필드를 인스턴스 필드로 둬서 매 테스트마다 DB 재시작** — 대부분의 경우 `static`으로 선언하면 충분히 격리되면서 10배 이상 빠르다.
8. **테스트에서 실제 프로덕션 DB에 접속** — `@ActiveProfiles("test")` 누락. CI에서 사고로 이어질 수 있음.

---

## 참고 링크

- JUnit 5 User Guide: https://junit.org/junit5/docs/current/user-guide/
- Spring Boot Testing: https://docs.spring.io/spring-boot/reference/testing/
- MyBatis Spring Boot Test: https://mybatis.org/spring-boot-starter/mybatis-spring-boot-test-autoconfigure/
- Testcontainers Java: https://java.testcontainers.org/
- AssertJ Core: https://assertj.github.io/doc/
- Mockito: https://site.mockito.org/
