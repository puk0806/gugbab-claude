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
