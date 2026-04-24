# Java 코딩 규칙

Java + Spring Boot 백엔드 코드 작성 시 준수해야 할 규칙.
백엔드 스킬·에이전트 작업 시 참조한다.

**지원 범위:**
- **레거시**: Java 11 + Spring Boot 2.5 + WAR/Tomcat 9 + MyBatis 3.5 + `javax.*`
- **모던**: Java 21 LTS + Spring Boot 3.4 + Jar/Native + `jakarta.*`

각 항목은 레거시·모던 모두 적용되며, 버전별 차이가 있으면 **(레거시)**/**(모던)** 라벨로 구분한다.

---

## 에러 처리

- `throw new RuntimeException("...")` 금지 → 도메인 커스텀 예외 정의 필수
- 예외 계층은 `BusinessException` 최상위 + 하위 `XxxNotFoundException`, `XxxInvalidException` 등
- 글로벌 예외 처리: `@ControllerAdvice` + `@ExceptionHandler`
- 모든 API 에러 응답은 공통 `ErrorResponse` 타입 (code, message, traceId)
- 로깅 시 `log.error("{} failed", target, e)` — 스택트레이스 함께 출력
- `e.printStackTrace()` 사용 금지

```java
// 금지
catch (Exception e) {
    e.printStackTrace();
    throw new RuntimeException(e);
}

// 권장
catch (IOException e) {
    log.error("파일 읽기 실패: {}", path, e);
    throw new FileReadException("파일을 읽을 수 없습니다", e);
}
```

## Null 처리

- 반환값에 `null` 금지 → `Optional<T>` 사용 (단, 필드·메서드 인자에는 Optional 금지)
- `@NonNull`, `@Nullable` (Spring 또는 Lombok) 어노테이션으로 의도 명시
- `Objects.requireNonNull()` 활용, 검증은 가능하면 생성자에서
- null 허용이 의미 있는 JPA/MyBatis 엔티티 필드는 Wrapper 타입 사용 (`Integer`, `Long`)

## 타입 설계

- **DTO/Value Object** — 불변 객체 선호
  - **(레거시)** Lombok `@Value` 또는 `@Getter + @Builder + @RequiredArgsConstructor`
  - **(모던)** Java 21 `record` 기본, 검증 로직은 compact constructor에
- **엔티티** (MyBatis 결과 매핑 대상) — 기본 생성자 필요
  - Lombok `@Getter @Setter @NoArgsConstructor` 조합
- **`equals`/`hashCode`**: Lombok `@EqualsAndHashCode` 또는 (모던) record 자동
- 원시 타입 비교: `==` / 객체 비교: `equals()` — 혼용 금지
- 컬렉션 반환은 `List<T>` 우선, `null` 대신 `Collections.emptyList()`

## Spring Boot 버전별 차이

### 레거시 (Spring Boot 2.5, Java 11)

- 패키지: `javax.servlet.*`, `javax.persistence.*`
- Security: `WebSecurityConfigurerAdapter` 상속
- Swagger: Springfox `@EnableSwagger2`, `@Api`, `@ApiOperation`
- 분산 추적: Spring Cloud Sleuth
- 설정: `application.yml` + `@ConfigurationProperties` (prefix)
- 테스트: `@SpringBootTest`, `@MockBean`, JUnit 5

### 모던 (Spring Boot 3.4, Java 21)

- 패키지: `jakarta.servlet.*`, `jakarta.persistence.*`
- Security: `SecurityFilterChain` Bean 방식 (상속 금지)
- Swagger: Springdoc OpenAPI 2.x (`@Tag`, `@Operation`)
- 분산 추적: Micrometer Tracing (Sleuth 대체)
- Observability: Micrometer + Actuator 통합
- Virtual Threads: `spring.threads.virtual.enabled=true`
- Native Image: GraalVM 지원

## MyBatis

- **Mapper 인터페이스 + XML 매퍼** 권장 (어노테이션은 간단 쿼리만)
- `@Mapper` 어노테이션 또는 `@MapperScan("com.xxx.mapper")`
- 동적 SQL은 반드시 XML (`<if>`, `<choose>`, `<foreach>`)
- 복잡한 매핑은 `<resultMap>` 정의, 재사용
- 커스텀 타입은 `TypeHandler` 구현 (enum, JSON 필드 등)
- Mapper 메서드에 `@Param` 명시 (다중 파라미터일 때 필수)

```java
// 권장
@Mapper
public interface UserMapper {
    User findById(@Param("id") Long id);
    List<User> findByFilter(@Param("filter") UserFilter filter);
}
```

## 멀티 데이터소스 (Oracle + MySQL)

- 각 DataSource별 `SqlSessionFactory` + `PlatformTransactionManager` 분리
- Mapper 패키지 기준으로 스캔 분리: `@MapperScan(basePackages = "com.xxx.oracle.mapper", sqlSessionFactoryRef = "oracleSqlSessionFactory")`
- `@Transactional("oracleTransactionManager")` — Bean 이름 명시 필수
- Primary DataSource 1개 지정 (`@Primary`) — 대개 주력 DB

## 트랜잭션

- `@Transactional`은 Service 레이어에만
- readOnly 명시: 조회는 `@Transactional(readOnly = true)`
- 트랜잭션 전파: 기본 `REQUIRED`, 독립 트랜잭션은 `REQUIRES_NEW`
- Checked Exception 롤백: `rollbackFor = Exception.class` 명시 (기본은 RuntimeException만 롤백)

## 비동기

- `@Async` + 커스텀 `ThreadPoolTaskExecutor` 빈 정의 (기본 `SimpleAsyncTaskExecutor` 사용 금지)
- `CompletableFuture` 체인 활용
- **(모던)** Virtual Threads (`spring.threads.virtual.enabled=true`)로 대부분 `@Async` 대체 가능
- WebFlux `WebClient`는 sync 앱에서도 외부 API 호출에 사용 가능 (블로킹 주의)

## Lombok 사용 규칙

- 허용: `@Getter`, `@Setter`, `@Builder`, `@RequiredArgsConstructor`, `@NoArgsConstructor`, `@Slf4j`, `@ToString`, `@EqualsAndHashCode`, `@Value`
- 주의: `@Data` — 불변 엔티티에 부적합 (Setter 자동 생성). 사용 전 필드 특성 재검토
- 금지: `@SneakyThrows` — 예외 숨김, 디버깅 어려움
- JPA 엔티티: `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` — 순환 참조 방지

## 로깅

- `@Slf4j` (Lombok) 사용, 파라미터는 `{}` 플레이스홀더 + 가변 인자
- 레벨 구분: DEBUG(개발) / INFO(요청·응답) / WARN(복구 가능 이슈) / ERROR(복구 불가)
- `MDC.put("traceId", ...)` — 요청 단위 식별자 주입
- **(레거시)** Sleuth가 자동 traceId 주입 → MDC 수동 주입 불필요
- **(모던)** Micrometer Tracing이 자동 주입

## 아키텍처

- 레이어: `Controller → Service → Mapper(MyBatis) / Repository(JPA)`
- 의존 방향 역전 금지 (Service가 Controller 호출 불가)
- `AppConfig` / `@Configuration` 클래스에만 Bean 정의
- DTO는 레이어 간 이동 시 **반드시 변환** (Entity를 Controller에 노출 금지)
- 변환기: MapStruct (성능 우선) 또는 ModelMapper (편의 우선)

```java
// 금지 - Controller에 비즈니스 로직
@PostMapping("/users")
public User create(@RequestBody UserRequest req) {
    User u = new User();
    u.setEmail(req.getEmail());
    return userMapper.insert(u); // SQL 직접 호출 금지
}

// 권장
@PostMapping("/users")
public UserResponse create(@Valid @RequestBody UserRequest req) {
    return userService.create(req);
}
```

## 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 클래스·인터페이스 | PascalCase | `UserService`, `UserMapper` |
| 메서드·변수 | camelCase | `findById`, `userCount` |
| 상수 | UPPER_SNAKE_CASE | `MAX_CONNECTIONS` |
| 패키지 | lowercase | `com.company.project.user` |
| 테스트 클래스 | `{Target}Test` | `UserServiceTest` |
| Mapper 인터페이스 | `{Domain}Mapper` | `UserMapper` |
| DTO | 의도 명시 접미사 | `UserRequest`, `UserResponse`, `UserDto` |
| 예외 | `Xxx + Exception` | `UserNotFoundException` |
| 설정 빈 | `XxxConfig` / `XxxProperties` | `DatabaseConfig` |

## 빌드·포맷

- Gradle: `./gradlew build`, `./gradlew test`
- 포맷터: Spotless + google-java-format 또는 Checkstyle
- 정적 분석: SpotBugs, SonarLint 권장
- 라인 길이 120자 이내
- `build.gradle` 의존성은 `implementation` 기본 (`compile` deprecated)
- 순환 의존성 검사: ArchUnit 또는 Sonar 규칙

## 금지 패턴

**공통:**
- `System.out.println` → SLF4J 사용
- `Throwable` catch → 구체 예외 지정
- `String` 연결로 SQL 생성 → PreparedStatement 또는 MyBatis
- `public` 필드 → `private` + getter/setter 또는 record
- 원시 타입과 객체 타입 혼용 비교 (`long` vs `Long`)
- 빈 catch 블록

**레거시(Java 11) 한정:**
- `Stream.peek()` — 디버깅 외 사용 금지

**모던(Java 21) 한정:**
- Joda-Time 신규 사용 → `java.time` API
- `Optional` 필드/매개변수 → 반환 타입으로만

**Spring Boot 3 전환 시:**
- `javax.*` import → `jakarta.*`
- `WebSecurityConfigurerAdapter` → `SecurityFilterChain` Bean
- Springfox → Springdoc OpenAPI
- Sleuth → Micrometer Tracing
