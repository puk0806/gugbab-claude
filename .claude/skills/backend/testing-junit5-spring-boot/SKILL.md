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

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
