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
