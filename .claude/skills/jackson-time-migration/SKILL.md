---
name: jackson-time-migration
description: Jackson + 자바 시간 API — SB 2.5(Jackson 2.12)+Joda-Time 레거시 설정, spring.jackson 시간 직렬화 설정 함정, Spring Boot 4.x Jackson 3(tools.jackson·java.time 내장·기본값 변경) 대응표, Joda→java.time 병존 마이그레이션(Period 함정·경계 어댑터), MyBatis·Oracle 시간 타입 매핑, 흔한 실수
---

# Jackson + 자바 시간 API 마이그레이션

> 소스: https://github.com/FasterXML/jackson-modules-java8 | https://github.com/FasterXML/jackson-datatype-joda | https://github.com/JodaOrg/joda-time | https://blog.joda.org/2014/11/converting-from-joda-time-to-javatime.html | https://docs.spring.io/spring-boot/appendix/application-properties/index.html
> 검증일: 2026-11-06

> 주의: 이 문서는 Spring Boot 2.5 (Jackson 2.12.x 번들) + Joda-Time 2.10.10 레거시 환경 → Spring Boot 2.7/3.x (Jackson 2.13 ~ 2.21, 3.5.x = 2.21.x) + java.time 모던 환경으로의 전환을 전제로 합니다. Jackson 2 계열 최신은 2.22.4(2026-10), Joda-Time 최신은 2.15.1입니다. `JavaTimeModule` 등록·`spring.jackson.*` 프로퍼티·타입 매핑 표는 2.12 ~ 2.22에서 동일합니다.
>
> 주의(2026-11-06 재검증): **Spring Boot 4.x는 기본 JSON 라이브러리가 Jackson 3**입니다(4.0 = 3.0.x, 4.1 = 3.1.x, Jackson 3 최신 3.2.4). 패키지·그룹이 `tools.jackson`으로 바뀌고(`jackson-annotations`만 `com.fasterxml.jackson.annotation` 유지), java.time 지원이 databind에 내장되며, `WRITE_DATES_AS_TIMESTAMPS` 기본값이 false로 바뀌었습니다. Boot 4 대상이면 3-6절을 먼저 보세요.

---

## 2. 레거시 환경: Spring Boot 2.5 + Joda-Time 2.10.10

### 2-1. 의존성

```xml
<!-- pom.xml -->
<dependencies>
    <!-- Joda-Time 본체 -->
    <dependency>
        <groupId>joda-time</groupId>
        <artifactId>joda-time</artifactId>
        <version>2.10.10</version>
    </dependency>

    <!-- Jackson ↔ Joda 연동 모듈 -->
    <dependency>
        <groupId>com.fasterxml.jackson.datatype</groupId>
        <artifactId>jackson-datatype-joda</artifactId>
        <!-- Spring Boot 2.5의 Jackson 버전(2.12.x)에 맞춤 -->
    </dependency>
</dependencies>
```

Spring Boot 2.5는 Jackson 2.12.x를 번들하므로 `jackson-datatype-joda` 버전을 직접 지정하지 않고 `spring-boot-dependencies`의 BOM을 따르는 편이 안전합니다.

### 2-2. JodaModule 등록

**Spring Boot의 기본 ObjectMapper를 사용한다면** `spring-boot-starter-json`이 클래스패스의 Jackson 모듈을 자동 탐지하므로 `jackson-datatype-joda`를 의존성에 추가하는 것만으로 자동 등록됩니다.

**커스텀 ObjectMapper를 쓸 때는 명시 등록:**

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.joda.JodaModule;

ObjectMapper mapper = new ObjectMapper()
    .registerModule(new JodaModule())
    .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);   // ISO-8601 문자열로
```

또는 빌더 스타일(Jackson 2.10+에서도 가능. Jackson 3에서는 이 방식만 쓰며, 모듈은 `tools.jackson.datatype:jackson-datatype-joda`의 `tools.jackson.datatype.joda.JodaModule`):
```java
ObjectMapper mapper = JsonMapper.builder()
    .addModule(new JodaModule())
    .build();
```

> 주의: `@JsonFormat(pattern=...)`은 Joda 모듈에서도 동작하지만, 타임존 정보가 누락된 패턴을 쓰면 왕복 시 정보 손실이 발생합니다. 가능하면 ISO-8601 기본 포맷 유지.

---

## 3. 모던 환경: Spring Boot + java.time (JSR-310)

Spring Boot 2.2+ 이후는 `spring-boot-starter-json`에 `jackson-datatype-jsr310`이 포함되어 있으며, 자동 설정이 `JavaTimeModule`을 기본 `ObjectMapper`에 등록합니다.

> 주의: 예전 `JSR310Module` 클래스는 deprecated 입니다. 반드시 `JavaTimeModule`을 사용하세요. 신규 Jackson 3.x에서는 `jsr310` 기능이 코어로 통합되었습니다.

### 3-4. application.yml 전역 설정

```yaml
spring:
  jackson:
    serialization:
      write-dates-as-timestamps: false     # ISO-8601 문자열로 직렬화
      write-dates-with-zone-id: false      # 존 ID 출력 억제
    time-zone: Asia/Seoul                  # Jackson 기본 타임존
    date-format: "yyyy-MM-dd'T'HH:mm:ssXXX"  # java.util.Date에만 적용. java.time에는 @JsonFormat 사용
```

**핵심:** `spring.jackson.serialization.write-dates-as-timestamps: false`가 없으면 숫자 epoch로 직렬화됩니다. 팀 표준으로 설정 파일에 박아두세요.

> 주의: `spring.jackson.date-format` 프로퍼티는 `java.util.Date`에만 적용되고, `java.time.*` 타입에는 영향을 주지 않습니다. `java.time` 타입의 포맷을 제어하려면 `@JsonFormat` 또는 커스텀 Serializer를 사용하세요.

> 주의: `spring.jackson.time-zone`은 Jackson이 `Date`, `Calendar` 같은 레거시 타입을 직렬화할 때의 표시 타임존입니다. `OffsetDateTime`/`ZonedDateTime`은 자체 오프셋/존을 그대로 직렬화하므로 이 설정의 영향을 덜 받습니다.

### 3-6. Spring Boot 4.x (Jackson 3)

> 소스: https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide · https://github.com/FasterXML/jackson/blob/main/jackson3/MIGRATING_TO_JACKSON_3.md

| 항목 | Boot 2.x~3.x (Jackson 2) | Boot 4.x (Jackson 3) |
|------|--------------------------|----------------------|
| 패키지·그룹 | `com.fasterxml.jackson.*` | `tools.jackson.*` (어노테이션 `@JsonFormat` 등은 `com.fasterxml.jackson.annotation` 그대로) |
| java.time 모듈 | `jackson-datatype-jsr310` + `JavaTimeModule` | databind에 내장 — `JavaTimeModule` 등록 불필요 |
| 날짜 직렬화 기본값 | `WRITE_DATES_AS_TIMESTAMPS` = true (epoch 숫자) | `DateTimeFeature.WRITE_DATES_AS_TIMESTAMPS` = **false** (ISO-8601 문자열) |
| yml 키 | `spring.jackson.serialization.write-dates-as-timestamps` | `spring.jackson.datatype.datetime.write-dates-as-timestamps` (`SerializationFeature`에서 빠져 `DateTimeFeature`로 이동) |
| 커스터마이저 | `Jackson2ObjectMapperBuilderCustomizer` | `JsonMapperBuilderCustomizer` (`customize(JsonMapper.Builder)`) |
| 매퍼 빈 교체 | `ObjectMapper` 빈 정의 → 자동 설정 대체 | `ObjectMapper` 빈으로는 대체 안 됨 → `JsonMapper` 빈 정의 |
| 모듈 탐지 | 잘 알려진 모듈만 | 클래스패스 모듈 전부 (`spring.jackson.find-and-add-modules=false`로 3.x 동작) |

```java
// Boot 4 — Joda 병존 단계 (tools.jackson.datatype:jackson-datatype-joda 3.x 의존성)
@Bean
public JsonMapperBuilderCustomizer jodaCustomizer() {
    return builder -> builder.addModule(new tools.jackson.datatype.joda.JodaModule());
}
```

- Boot 3에서 올라올 때 `spring.jackson.serialization.write-dates-as-timestamps: false`는 위 키로 옮기거나, 기본값이 이미 false이므로 지운다.
- 당장 Jackson 3로 못 옮기면: `spring.jackson.use-jackson2-defaults=true`(Jackson 3 매퍼 기본값을 Boot 3.x에 가깝게) 또는 deprecated 임시 모듈 `spring-boot-jackson2` + `spring.jackson2.*` 프로퍼티.

---

## 6. Joda-Time → java.time 전환 함정

> 주의: `joda.getZone().getID()` 결과는 대부분 `java.time.ZoneId`에 호환되지만, 오래된 타임존 별칭(deprecated alias)은 다를 수 있습니다. `ZoneId.of(..., ZoneId.SHORT_IDS)` 또는 별도 매핑 테이블을 고려하세요.

### Period 의미 차이 (함정)

| 라이브러리 | `Period`가 표현하는 것 |
|-----------|----------------------|
| Joda-Time | 연·월·주·일·시·분·초·밀리초 모두 |
| java.time | **연·월·일만** (시간 단위는 `Duration`) |

Joda의 시간 단위 Period를 그대로 `java.time.Period`로 바꾸면 시/분/초 정보가 유실됩니다. 시간 단위는 `java.time.Duration`으로 분리해야 합니다.

---

## 7. 마이그레이션 절차 (점진적)

대규모 코드베이스를 한 번에 교체하면 리스크가 크므로 **단계별 병존 전략**을 권장합니다.

### 단계 1: 의존성 병존

```xml
<dependencies>
    <!-- 기존 Joda 유지 -->
    <dependency>
        <groupId>joda-time</groupId>
        <artifactId>joda-time</artifactId>
        <version>2.10.10</version>
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.datatype</groupId>
        <artifactId>jackson-datatype-joda</artifactId>
    </dependency>

    <!-- java.time 모듈 추가 -->
    <dependency>
        <groupId>com.fasterxml.jackson.datatype</groupId>
        <artifactId>jackson-datatype-jsr310</artifactId>
    </dependency>
</dependencies>
```

**두 모듈을 같은 ObjectMapper에 등록:**

```java
// Boot 2.x~3.x 기준. Boot 4(Jackson 3)는 3-6절 JsonMapperBuilderCustomizer 사용
@Configuration
public class JacksonConfig {
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer customizer() {
        return builder -> builder
            .modulesToInstall(new JodaModule(), new JavaTimeModule())
            .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}
```

이 시점에 신규 코드는 `java.time`, 기존 코드는 Joda로 작성 가능한 상태가 됩니다.

### 단계 3: 경계 어댑터

전환 완료 전까지 Joda ↔ java.time 변환 어댑터를 유틸리티로 유지:

```java
public final class TimeAdapters {
    public static java.time.OffsetDateTime toOffsetDateTime(org.joda.time.DateTime joda) {
        if (joda == null) return null;
        return java.time.OffsetDateTime.ofInstant(
            java.time.Instant.ofEpochMilli(joda.getMillis()),
            java.time.ZoneId.of(joda.getZone().getID())
        );
    }
    public static org.joda.time.DateTime toJoda(java.time.OffsetDateTime modern) {
        if (modern == null) return null;
        return new org.joda.time.DateTime(
            modern.toInstant().toEpochMilli(),
            org.joda.time.DateTimeZone.forID(modern.getOffset().getId())
        );
    }
}
```

---

> 상세 레퍼런스 (MyBatis·Oracle 시간 타입 매핑·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
