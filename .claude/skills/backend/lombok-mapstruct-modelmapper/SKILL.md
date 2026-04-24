---
name: lombok-mapstruct-modelmapper
description: Lombok + MapStruct + ModelMapper 통합 가이드 - Spring Boot에서 DTO 변환과 보일러플레이트 제거 패턴
---

# Lombok + MapStruct + ModelMapper (Spring Boot 2.5 / 3.x)

> 소스: https://projectlombok.org/features/ | https://mapstruct.org/documentation/stable/reference/html/ | https://modelmapper.org/getting-started/
> 검증일: 2026-04-22

> 주의: 본 문서는 Lombok 1.18.44, MapStruct 1.6.3, ModelMapper 3.2.x 기준. Spring Boot 2.5+ / 3.x 양쪽에서 동일하게 적용 가능하나, Spring Boot 3.x는 Java 17 이상이 필요하다.

---

## 언제 무엇을 쓰는가

| 상황 | 선택 |
|------|------|
| 컴파일타임 안전성·대용량 트래픽·성능 우선 | **MapStruct** |
| 빠른 프로토타입·단순 1:1 매핑·러닝커브 최소화 | **ModelMapper** |
| 보일러플레이트(getter/setter/builder) 제거 | **Lombok** (DTO·설정 빈) |
| 불변 VO / Record | Java Record 또는 Lombok `@Value` |
| JPA 엔티티 | Lombok은 **제한적 사용** (`@Data` 금지, `@EqualsAndHashCode` 주의) |

팀 내에서는 MapStruct / ModelMapper 중 **하나를 주력으로 통일**한다. 두 라이브러리를 혼재시키면 동일한 DTO가 서로 다른 방식으로 매핑되어 유지보수가 어려워진다.

---

## Lombok

### 핵심 어노테이션

| 어노테이션 | 생성되는 것 |
|-----------|-------------|
| `@Getter` / `@Setter` | 모든 필드의 getter/setter |
| `@NoArgsConstructor` | 인자 없는 생성자 |
| `@AllArgsConstructor` | 모든 필드 인자 생성자 |
| `@RequiredArgsConstructor` | `final` 또는 `@NonNull` 필드만 인자로 받는 생성자 |
| `@Builder` | Builder 패턴 (내부 빌더 클래스 + 정적 `builder()` 메서드) |
| `@ToString` | `toString()` |
| `@EqualsAndHashCode` | `equals()` / `hashCode()` |
| `@Data` | `@Getter` + `@Setter` + `@ToString` + `@EqualsAndHashCode` + `@RequiredArgsConstructor` |
| `@Value` | **불변 버전 `@Data`** — 모든 필드 `private final`, 클래스 `final`, setter 없음 |
| `@Slf4j` | SLF4J `Logger log` 필드 자동 생성 |

### 기본 사용 — DTO

```java
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String email;
}

// 사용
UserDto dto = UserDto.builder()
    .id(1L)
    .username("alice")
    .email("a@example.com")
    .build();
```

### 불변 DTO — `@Value`

```java
import lombok.Value;
import lombok.Builder;

@Value
@Builder
public class UserDto {
    Long id;        // 자동으로 private final
    String username;
    String email;
}
// 클래스가 final이 되고 setter가 없으므로 값 객체로 안전
```

> `@Value`는 다음을 합친 것과 같다:
> `final @ToString @EqualsAndHashCode @AllArgsConstructor @FieldDefaults(makeFinal=true, level=PRIVATE) @Getter`

### 생성자 주입 — `@RequiredArgsConstructor`

```java
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    // Lombok이 모든 final 필드를 인자로 받는 생성자 자동 생성
    // Spring이 이 생성자로 주입 수행
}
```

### 로거 — `@Slf4j`

```java
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class OrderService {
    public void process(Long orderId) {
        log.info("Processing order {}", orderId);
    }
}
```

### Lombok — 주의·함정

**1. `@Data`를 JPA 엔티티에 사용 금지**

- `@Data`는 `@Setter`를 포함 → 불변성이 중요한 엔티티·VO에 부적합
- `@Data`가 생성하는 `equals()`/`hashCode()`는 모든 필드를 사용 → JPA 엔티티에서 다음 문제 발생:
  - Lazy 연관관계 필드에 접근 시 의도치 않은 프록시 초기화
  - DB 생성 ID가 persist 전후로 바뀌어 `HashSet` 내 엔티티 동일성 깨짐
  - 양방향 연관관계에서 `equals` 재귀 호출
- 엔티티에는 필요한 어노테이션만 개별 부여한다. (`@Getter` + `@NoArgsConstructor(access = AccessLevel.PROTECTED)` 권장)

**2. `@EqualsAndHashCode(callSuper=...)` 명시**

- 상속받은 클래스에서 `@EqualsAndHashCode`를 쓰면 Lombok은 기본값(`skip`)으로 동작하며 경고를 출력한다.
- 부모 필드도 동등성에 포함하려면 `@EqualsAndHashCode(callSuper = true)`로 **명시**한다.

```java
@Getter
@EqualsAndHashCode(callSuper = true)  // 또는 false 명시
public class AdminUser extends User { ... }
```

**3. `@SneakyThrows` 사용 금지**

- 체크 예외를 컴파일러 체크 없이 삼켜버려 호출자가 예외를 예상할 수 없게 한다.
- 에러 처리 설계를 망친다. 일반적인 서비스 코드에서는 사용하지 않는다.

### Lombok — 빌드 설정

**Gradle (Spring Boot 2.5 / 3.x 공통)**
```gradle
dependencies {
    compileOnly       'org.projectlombok:lombok:1.18.44'
    annotationProcessor 'org.projectlombok:lombok:1.18.44'

    // 테스트 코드에도 필요할 때
    testCompileOnly     'org.projectlombok:lombok:1.18.44'
    testAnnotationProcessor 'org.projectlombok:lombok:1.18.44'
}
```

- `compileOnly` + `annotationProcessor` **양쪽 모두 필수**.
- IDE: IntelliJ는 Lombok 플러그인 기본 내장, **Settings → Build Tools → Compiler → Annotation Processors → Enable annotation processing** 체크 필요.
- Eclipse는 `lombok.jar`를 IDE 설치 디렉터리에 주입해야 한다 (`java -jar lombok.jar`).

---

## MapStruct

컴파일타임 코드 생성 방식. annotation processor가 인터페이스 구현체를 `target/generated-sources`에 생성한다.

### 기본 Mapper

```java
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = "username", target = "name")
    UserDto toDto(User user);

    @Mapping(source = "name", target = "username")
    User toEntity(UserDto dto);

    List<UserDto> toDtoList(List<User> users);   // 컬렉션은 선언만 해도 자동 변환
}
```

- `componentModel = "spring"` → Spring Bean으로 등록되어 `@Autowired` / 생성자 주입 가능.
- 필드명이 같으면 `@Mapping` 없이 자동 매핑.
- 다른 mapper 인터페이스를 `@Mapper(uses = OtherMapper.class)`로 위임 가능.

### Spring 주입

```java
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserDto findById(Long id) {
        return userMapper.toDto(
            userRepository.findById(id).orElseThrow()
        );
    }
}
```

### 중첩 매핑 (dot notation)

```java
@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(source = "customer.name", target = "customerName")
    @Mapping(source = "customer.address.city", target = "customerCity")
    OrderDto toDto(Order order);
}
```

### 업데이트 매핑 — `@MappingTarget`

기존 엔티티 필드를 DTO 값으로 덮어쓸 때 사용. 반환 타입은 `void` 또는 target 타입.

```java
@Mapping(target = "id", ignore = true)          // ID는 변경 금지
@Mapping(target = "createdAt", ignore = true)
void updateEntity(UserUpdateDto dto, @MappingTarget User user);
```

```java
User user = userRepository.findById(id).orElseThrow();
userMapper.updateEntity(dto, user);   // user 필드가 in-place로 수정됨
```

### `qualifiedByName` — 이름 기반 커스텀 변환

```java
@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = "patients", target = "numPatients", qualifiedByName = "countPatients")
    DoctorDto toDto(Doctor doctor);

    @Named("countPatients")
    default int countPatients(List<Patient> patients) {
        return patients == null ? 0 : patients.size();
    }
}
```

### `expression` — 인라인 Java 코드 (주의해서 사용)

```java
@Mapping(target = "fullName",
         expression = "java(user.getFirstName() + \" \" + user.getLastName())")
UserDto toDto(User user);
```

> `expression`과 `qualifiedByName`은 동시 사용 불가. 복잡한 로직은 `qualifiedByName` 쪽이 리팩토링·테스트에 유리하다.

### `@AfterMapping` — 후처리 훅

```java
@Mapper(componentModel = "spring")
public abstract class UserMapper {

    public abstract UserDto toDto(User user);

    @AfterMapping
    protected void afterToDto(User source, @MappingTarget UserDto target) {
        target.setDisplayName(source.getFirstName() + " " + source.getLastName());
    }
}
```

`@BeforeMapping`도 동일한 방식으로 쓸 수 있다. `@AfterMapping`은 mapping 메서드의 **마지막 문장으로 호출**된다.

### Record 매핑 (Java 17+, MapStruct 1.5+)

```java
public record UserDto(Long id, String name, int age) {}

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);      // Record 대상 매핑은 생성자를 통해 이루어짐
    User toEntity(UserDto dto);
}
```

> 주의: Record의 접근자는 `name()` 형태 (JavaBean `getName()` 아님). MapStruct 1.5+는 이를 자동 인식한다.
> Record는 불변이므로 `@MappingTarget` 업데이트 매핑의 target으로는 사용할 수 없다.

### MapStruct — 빌드 설정 (Lombok과 함께)

**Gradle (Groovy DSL — `build.gradle`)**
```gradle
ext {
    lombokVersion            = '1.18.44'
    mapstructVersion         = '1.6.3'
    lombokMapstructBinding   = '0.2.0'
}

dependencies {
    implementation        "org.mapstruct:mapstruct:${mapstructVersion}"

    compileOnly           "org.projectlombok:lombok:${lombokVersion}"

    // 순서가 매우 중요: mapstruct → lombok → binding
    annotationProcessor   "org.mapstruct:mapstruct-processor:${mapstructVersion}"
    annotationProcessor   "org.projectlombok:lombok:${lombokVersion}"
    annotationProcessor   "org.projectlombok:lombok-mapstruct-binding:${lombokMapstructBinding}"
}
```

**Gradle (Kotlin DSL — `build.gradle.kts`)**
```kotlin
val lombokVersion = "1.18.44"
val mapstructVersion = "1.6.3"
val lombokMapstructBinding = "0.2.0"

dependencies {
    implementation("org.mapstruct:mapstruct:$mapstructVersion")

    compileOnly("org.projectlombok:lombok:$lombokVersion")

    // 순서가 매우 중요: mapstruct → lombok → binding
    annotationProcessor("org.mapstruct:mapstruct-processor:$mapstructVersion")
    annotationProcessor("org.projectlombok:lombok:$lombokVersion")
    annotationProcessor("org.projectlombok:lombok-mapstruct-binding:$lombokMapstructBinding")
}
```

**`lombok-mapstruct-binding`이 필요한 이유**

- Lombok **1.18.16+** 부터 MapStruct 바인딩이 본체에서 분리됨.
- 이 바인딩이 없으면 MapStruct가 Lombok 처리 전에 클래스를 분석하여 `Unmapped target properties: ...` 에러 발생.
- `lombok-mapstruct-binding`은 MapStruct가 Lombok 처리 완료를 기다리게 만든다.

**Maven**
```xml
<properties>
    <lombok.version>1.18.44</lombok.version>
    <mapstruct.version>1.6.3</mapstruct.version>
    <lombok-mapstruct-binding.version>0.2.0</lombok-mapstruct-binding.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct</artifactId>
        <version>${mapstruct.version}</version>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>${lombok.version}</version>
        <scope>provided</scope>
    </dependency>
</dependencies>

<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <configuration>
                <annotationProcessorPaths>
                    <path>
                        <groupId>org.mapstruct</groupId>
                        <artifactId>mapstruct-processor</artifactId>
                        <version>${mapstruct.version}</version>
                    </path>
                    <path>
                        <groupId>org.projectlombok</groupId>
                        <artifactId>lombok</artifactId>
                        <version>${lombok.version}</version>
                    </path>
                    <path>
                        <groupId>org.projectlombok</groupId>
                        <artifactId>lombok-mapstruct-binding</artifactId>
                        <version>${lombok-mapstruct-binding.version}</version>
                    </path>
                </annotationProcessorPaths>
            </configuration>
        </plugin>
    </plugins>
</build>
```

---

## ModelMapper

런타임 리플렉션 기반. 별도 인터페이스 없이 `ModelMapper` 인스턴스 하나로 모든 타입 간 매핑을 수행한다.

### Bean 설정

```java
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper mapper = new ModelMapper();
        mapper.getConfiguration()
              .setMatchingStrategy(MatchingStrategies.STRICT);
        return mapper;
    }
}
```

### Matching Strategy

| 전략 | 동작 | 권장 상황 |
|------|------|-----------|
| `STANDARD` (기본값) | 소스 토큰이 대상 토큰에 지능적 매칭. 모든 대상 프로퍼티는 매칭되어야 하고 모든 소스 프로퍼티명 토큰은 최소 1개 매칭 필요 | 일반적인 경우 |
| `LOOSE` | 계층의 마지막 대상 프로퍼티만 매칭되면 OK. 필드명 규칙이 매우 다른 경우 | 이종 모델 매핑 |
| `STRICT` | 토큰이 정확히 일치할 때만 매칭. 모호함·실수 완전 방지 | **운영 권장** — 예기치 않은 자동 매핑 방지 |

### 기본 사용

```java
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public UserDto findById(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        return modelMapper.map(user, UserDto.class);
    }

    public List<UserDto> findAll() {
        return userRepository.findAll().stream()
                .map(u -> modelMapper.map(u, UserDto.class))
                .toList();
    }
}
```

### 커스텀 매핑 — `TypeMap` + `addMappings`

```java
@Bean
public ModelMapper modelMapper() {
    ModelMapper mapper = new ModelMapper();
    mapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);

    mapper.typeMap(User.class, UserDto.class)
          .addMappings(m -> {
              m.map(User::getUsername, UserDto::setName);
              m.map(src -> src.getProfile().getNickname(), UserDto::setNickname);
          });

    return mapper;
}
```

### ModelMapper — 주의·함정

- 런타임 리플렉션이므로 필드명 오탈자·타입 불일치를 컴파일 시점에 잡지 못한다.
- 기본 `STANDARD`는 의도치 않은 매핑을 만들 수 있어 운영 환경에서는 `STRICT` 권장.
- `@Entity`에서 Lazy 연관관계 필드를 건드리면 의도치 않게 초기화될 수 있다 — DTO로 변환할 때만 사용한다.

### ModelMapper — 빌드 설정

```gradle
dependencies {
    implementation 'org.modelmapper:modelmapper:3.2.4'
}
```

> 주의: ModelMapper는 annotation processor가 **필요 없다**. Lombok과 충돌 없이 동작한다.

---

## 성능 비교

Baeldung JMH 벤치마크 (ops/ms — 숫자가 클수록 빠름):

| 라이브러리 | Simple 시나리오 | Real-life 시나리오 |
|-----------|----------------:|-------------------:|
| MapStruct | ~403,526 | ~7,634 |
| ModelMapper | ~838 | ~16 |

> MapStruct가 ModelMapper 대비 **수백 배 빠르다**. 컴파일타임 코드 생성 vs 런타임 리플렉션의 차이.
> 주의: 수치는 하드웨어·JVM 버전·매핑 복잡도에 따라 달라진다. 절대값이 아닌 **상대 비교**로 이해할 것.

---

## 선택 가이드

| 요구 | 추천 |
|------|------|
| 대용량 트래픽, 수천 건/초 DTO 변환 | MapStruct |
| 컴파일타임 타입 안전성, IDE 리팩토링 지원 | MapStruct |
| 복잡한 조건부 매핑, `@AfterMapping` 훅 필요 | MapStruct |
| 프로토타이핑·사이드 프로젝트, 빠른 구축 | ModelMapper |
| 매핑 대상 필드명이 대부분 일치, 예외 케이스 소수 | 둘 다 가능 (팀 컨벤션 우선) |
| Java Record DTO | MapStruct 1.5+ 또는 수동 매핑 |

**혼용 프로젝트:** 레거시 코드에 이미 ModelMapper가 있고 신규 기능에 MapStruct를 도입하는 경우, 신규 모듈만 MapStruct로 전환하고 전체 마이그레이션 계획을 별도로 수립한다. 같은 DTO를 두 라이브러리로 매핑하지 않는다.

---

## 버전 호환성 (2026-04-22 기준)

| 조합 | Spring Boot 2.5.x | Spring Boot 3.x |
|------|-------------------|-----------------|
| Lombok | 1.18.44 | 1.18.44 |
| MapStruct | 1.6.3 | 1.6.3 |
| lombok-mapstruct-binding | 0.2.0 | 0.2.0 |
| ModelMapper | 3.2.4+ | 3.2.4+ |
| Java | 8 / 11 / 17 | 17 / 21 |

> 주의: Spring Boot 3.x는 Java 17 이상, Jakarta EE 9+ (`jakarta.*` 패키지)가 필수다. Spring Boot 2.5.x는 `javax.*` 유지.
> Record 매핑을 쓰려면 Java 16+ (MapStruct 1.5+) 필요.

---

## 실수 패턴 체크리스트

- [ ] Gradle `annotationProcessor` 순서: `mapstruct-processor` → `lombok` → `lombok-mapstruct-binding` 순으로 선언했는가
- [ ] `compileOnly` + `annotationProcessor` 두 줄 **모두** 선언했는가 (한쪽만 선언 시 런타임/컴파일타임 중 한쪽 깨짐)
- [ ] JPA 엔티티에 `@Data`를 붙이지 않았는가
- [ ] 상속 클래스에서 `@EqualsAndHashCode(callSuper = ...)`를 명시했는가
- [ ] MapStruct Mapper 인터페이스에 `componentModel = "spring"`을 지정했는가
- [ ] ModelMapper 설정에서 `MatchingStrategies.STRICT`를 적용했는가 (운영 환경)
- [ ] 팀 내에서 MapStruct / ModelMapper 중 하나로 컨벤션이 통일되어 있는가

---

## 공식 참고

- Lombok Features: https://projectlombok.org/features/
- MapStruct Reference Guide: https://mapstruct.org/documentation/stable/reference/html/
- MapStruct FAQ (Lombok 통합): https://mapstruct.org/faq/
- ModelMapper Getting Started: https://modelmapper.org/getting-started/
- ModelMapper Configuration: https://modelmapper.org/user-manual/configuration/
- Baeldung: Using MapStruct With Lombok — https://www.baeldung.com/java-mapstruct-lombok
- Baeldung: Performance of Java Mapping Frameworks — https://www.baeldung.com/java-performance-mapping-frameworks
