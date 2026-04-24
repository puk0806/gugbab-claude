---
name: jackson-time-migration
description: Jackson + 자바 시간 API 통합 — Joda-Time(레거시)에서 java.time(JSR-310)으로의 마이그레이션, Spring Boot Jackson 시간 직렬화 설정, LocalDateTime/OffsetDateTime/ZonedDateTime/Instant 선택 기준, 타임존 처리, MyBatis 연동
---

# Jackson + 자바 시간 API 마이그레이션

> 소스: https://github.com/FasterXML/jackson-modules-java8 | https://github.com/FasterXML/jackson-datatype-joda | https://github.com/JodaOrg/joda-time | https://blog.joda.org/2014/11/converting-from-joda-time-to-javatime.html | https://docs.spring.io/spring-boot/appendix/application-properties/index.html
> 검증일: 2026-04-22

> 주의: 이 문서는 Spring Boot 2.5 (Jackson 2.12.x 번들) + Joda-Time 2.10.10 레거시 환경 → Spring Boot 2.7/3.x (Jackson 2.13+ / 2.17+) + java.time 모던 환경으로의 전환을 전제로 합니다. 핵심 API는 Jackson 2.5 이후 안정적이므로 2.12 ~ 2.21 범위에서 동일하게 동작합니다.

---

## 1. 왜 Joda-Time에서 java.time으로 가야 하는가

Joda-Time은 Java 7 이전 표준 날짜/시간 API의 결함을 보완하기 위해 나온 사실상의 표준이었지만, **Java SE 8부터 JSR-310 (`java.time`) 이 JDK에 정식 편입**되면서 역할을 마쳤습니다.

**Joda-Time 프로젝트 공식 입장 (joda-time/README):**
- "Joda-time is no longer in active development except to keep timezone data up to date."
- "From Java SE 8 onwards, users are asked to migrate to `java.time` (JSR-310) — a core part of the JDK which replaces this project."

**참고:** JSR-310 사양 자체가 Joda-Time 저자인 Stephen Colebourne이 이끌었고, 설계 개선(불변성 강화, 엄격한 null 처리, 캘린더 시스템 명확화)이 반영되었습니다.

**모던 Java에서 Joda-Time을 권장하지 않는 이유:**

| 항목 | Joda-Time | java.time |
|------|-----------|-----------|
| 표준 위치 | 외부 라이브러리 | JDK 내장 (표준) |
| 유지보수 | 타임존 데이터만 업데이트 | JDK와 함께 지속 |
| API 일관성 | 설계 시기별 편차 | JSR-310에서 재설계 |
| null 처리 | 관대함 | 엄격함 |
| 불변성 | 일부 가변 객체 존재 | 전면 불변 |
| 커뮤니티/문서 | 유지보수 모드 | 활발 (공식 튜토리얼) |

**결론: 신규 코드는 무조건 `java.time`. 레거시 코드는 점진적 전환.**

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

또는 Jackson 3 권장 스타일:
```java
ObjectMapper mapper = JsonMapper.builder()
    .addModule(new JodaModule())
    .build();
```

### 2-3. 직렬화 포맷 예시

```java
public class Event {
    private org.joda.time.DateTime  startAt;     // 시간대 포함
    private org.joda.time.LocalDate eventDate;   // 날짜만
    private org.joda.time.LocalTime eventTime;   // 시간만
    // getters/setters
}
```

`WRITE_DATES_AS_TIMESTAMPS`를 disable한 상태 기준 JSON:

```json
{
  "startAt":   "2026-04-22T10:30:00.000+09:00",
  "eventDate": "2026-04-22",
  "eventTime": "10:30:00.000"
}
```

### 2-4. 개별 필드 포맷 지정

```java
import com.fasterxml.jackson.annotation.JsonFormat;

public class Event {
    @JsonFormat(shape = JsonFormat.Shape.STRING,
                pattern = "yyyy-MM-dd HH:mm:ss",
                timezone = "Asia/Seoul")
    private DateTime startAt;
}
```

> 주의: `@JsonFormat(pattern=...)`은 Joda 모듈에서도 동작하지만, 타임존 정보가 누락된 패턴을 쓰면 왕복 시 정보 손실이 발생합니다. 가능하면 ISO-8601 기본 포맷 유지.

---

## 3. 모던 환경: Spring Boot + java.time (JSR-310)

### 3-1. 의존성 (Spring Boot 자동 포함)

```xml
<!-- spring-boot-starter-json 또는 spring-boot-starter-web을 쓰면 자동 포함 -->
<dependency>
    <groupId>com.fasterxml.jackson.datatype</groupId>
    <artifactId>jackson-datatype-jsr310</artifactId>
</dependency>
```

Spring Boot 2.2+ 이후는 `spring-boot-starter-json`에 `jackson-datatype-jsr310`이 포함되어 있으며, 자동 설정이 `JavaTimeModule`을 기본 `ObjectMapper`에 등록합니다.

### 3-2. 기본 ObjectMapper 사용 시 (권장)

**추가 설정 없이** `LocalDateTime`, `OffsetDateTime`, `ZonedDateTime`, `Instant` 등이 모두 직렬화/역직렬화됩니다.

```java
public class EventDto {
    private java.time.OffsetDateTime startAt;
    private java.time.LocalDate      eventDate;
    private java.time.LocalTime      eventTime;
    private java.time.Instant        createdAt;
}
```

### 3-3. 커스텀 ObjectMapper 사용 시

커스텀 빈을 등록하면 자동 설정이 꺼지므로 직접 모듈을 등록해야 합니다.

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Bean
public ObjectMapper objectMapper() {
    return new ObjectMapper()
        .registerModule(new JavaTimeModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
}
```

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

### 3-5. 개별 필드 포맷 지정

```java
import com.fasterxml.jackson.annotation.JsonFormat;

public class EventDto {
    @JsonFormat(shape = JsonFormat.Shape.STRING,
                pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    private OffsetDateTime startAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate eventDate;
}
```

패턴 기호:
- `XXX` — ISO-8601 오프셋 (`+09:00`)
- `X` — `+09` (시간 단위)
- `Z` — RFC 822 (`+0900`)
- `VV` — 존 ID (`Asia/Seoul`)

---

## 4. LocalDateTime vs OffsetDateTime vs ZonedDateTime vs Instant

| 타입 | 정보 | 대표 용도 |
|------|------|-----------|
| `LocalDateTime` | 날짜 + 시간 (타임존 없음) | 사용자가 입력한 "2026-04-22 10:30" 같은 벽시계 시간 |
| `Instant` | UTC 기준 epoch 시각 (타임존/오프셋 없음) | 로그 타임스탬프, 이벤트 발생 시각 |
| `OffsetDateTime` | 날짜 + 시간 + UTC 오프셋 (`+09:00`) | DB 저장·API 전송의 **표준 권장** |
| `ZonedDateTime` | 날짜 + 시간 + 존 ID (`Asia/Seoul`) + DST 규칙 | 사용자에게 보여줄 때, 미래 시각 예약 |

### 선택 결정 트리

```
서버가 "지금 이 순간"을 기록하고 싶다
  → Instant

UI 또는 리포트용 "연/월/일 시:분"이 필요하고 타임존이 무의미하다
  → LocalDateTime (주의: DB에 저장하거나 API로 내보낼 때는 타임존 의미가 사라짐)

DB에 타임존 확정된 시각을 저장하거나, API로 시각을 주고받는다
  → OffsetDateTime  (권장 — 왕복 시 동일 시점 보장)

미래 시각을 특정 지역 기준으로 예약 (DST 전환 반영 필요)
예: "서울 시간 2026-10-25 02:30에 실행"
  → ZonedDateTime
```

### 주요 주의사항

| 타입 | 함정 |
|------|------|
| `LocalDateTime` | 타임존 정보가 없어 서버 간/DB 간 전송 시 "어느 지역 기준인가" 합의 필수. 멀티 리전 환경에서 버그 원인 |
| `Instant` | 사람이 읽기 어려움 (epoch ms). API 응답에는 `OffsetDateTime` 권장 |
| `OffsetDateTime` | 오프셋은 고정값 — DST 규칙을 반영하지 못함 |
| `ZonedDateTime` | 존 ID의 DB 저장 형식이 벤더마다 다름. `timestamptz`는 오프셋만 보존 |

---

## 5. 타임존 처리 원칙 — "UTC 저장 + 렌더링 시점 변환"

### 표준 흐름

```
[사용자 입력 / 이벤트 발생]
       ↓
[서비스 레이어: OffsetDateTime 또는 Instant로 변환]
       ↓
[DB: UTC 기준 저장 (timestamptz)]
       ↓
[API 응답: OffsetDateTime ISO-8601 문자열로 직렬화]
       ↓
[클라이언트: 사용자 로케일 기준 렌더링]
```

**원칙:**
1. **서버 기본 타임존에 의존하지 말 것** — `ZoneId.systemDefault()`는 배포 환경마다 다르다
2. **DB 컬럼은 UTC 기준** — PostgreSQL `timestamptz`, MySQL `TIMESTAMP`(내부 UTC)
3. **API 전송은 ISO-8601 + 오프셋 포함** — 수신 측이 독립적으로 해석 가능
4. **변환은 렌더링 시점** — 비즈니스 로직은 Instant/OffsetDateTime으로 처리

### JVM 기본 타임존 UTC 고정 (권장)

```bash
# 배포 환경
java -Duser.timezone=UTC -jar app.jar
```

또는 Spring Boot 초기화 시:

```java
@PostConstruct
public void init() {
    TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
}
```

### Jackson 타임존 설정

```yaml
spring:
  jackson:
    time-zone: UTC    # 또는 Asia/Seoul — 팀 규칙으로 고정
```

> 주의: `spring.jackson.time-zone`은 Jackson이 `Date`, `Calendar` 같은 레거시 타입을 직렬화할 때의 표시 타임존입니다. `OffsetDateTime`/`ZonedDateTime`은 자체 오프셋/존을 그대로 직렬화하므로 이 설정의 영향을 덜 받습니다.

---

## 6. Joda-Time → java.time 타입 매핑 표

| Joda-Time | java.time 대응 | 비고 |
|-----------|----------------|------|
| `org.joda.time.DateTime` | `java.time.ZonedDateTime` 또는 `java.time.OffsetDateTime` | DB/API에서 주고받는 용도면 `OffsetDateTime` 권장 |
| `org.joda.time.LocalDate` | `java.time.LocalDate` | 이름 동일, 패키지만 다름 |
| `org.joda.time.LocalTime` | `java.time.LocalTime` | 이름 동일 |
| `org.joda.time.LocalDateTime` | `java.time.LocalDateTime` | 이름 동일 |
| `org.joda.time.Instant` | `java.time.Instant` | 이름 동일 |
| `org.joda.time.Duration` | `java.time.Duration` | 이름 동일 |
| `org.joda.time.Period` | `java.time.Period` | 이름 동일. 단, Joda는 시/분/초 포함, java.time은 연/월/일만 |
| `org.joda.time.DateTimeZone` | `java.time.ZoneId` | `DateTimeZone.forID("Asia/Seoul")` → `ZoneId.of("Asia/Seoul")` |
| `org.joda.time.format.DateTimeFormatter` | `java.time.format.DateTimeFormatter` | API 이름 유사하나 시그니처 다름 |
| `org.joda.time.Interval` | 직접 대응 없음 | `Instant` 두 개 + `Duration`으로 표현 |
| `org.joda.time.MutableDateTime` | 없음 (불변성만 지원) | 값 재할당으로 대체 |

### 자주 쓰이는 변환 코드

```java
// Joda DateTime → java.time ZonedDateTime
org.joda.time.DateTime joda = ...;
java.time.ZonedDateTime modern = java.time.ZonedDateTime.ofInstant(
    java.time.Instant.ofEpochMilli(joda.getMillis()),
    java.time.ZoneId.of(joda.getZone().getID())
);

// Joda DateTime → java.time OffsetDateTime (DB/API 전송용)
java.time.OffsetDateTime modern2 = java.time.OffsetDateTime.ofInstant(
    java.time.Instant.ofEpochMilli(joda.getMillis()),
    java.time.ZoneId.of(joda.getZone().getID())
);

// java.time Instant → Joda DateTime (역방향, 과도기용)
java.time.Instant instant = ...;
org.joda.time.DateTime joda2 = new org.joda.time.DateTime(instant.toEpochMilli());
```

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

### 단계 0: 준비

- 현재 코드 Joda 사용처 전수 조사 (`grep -r "org.joda.time"`)
- Jackson 설정 스냅샷 (`spring.jackson.*`) 기록
- 기존 JSON 응답 포맷 샘플 저장 (회귀 테스트 기준)

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

### 단계 2: 도메인별 점진 전환

- 경계 계층(Controller DTO, DB Entity)부터 전환
- 전환 단위: 도메인 모듈 또는 테이블 단위 (하루 안에 완료 가능한 크기)
- 전환 시 기존 JSON 포맷과 새 포맷을 **통합 테스트로 비교**

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

### 단계 4: Joda 제거

- `grep -r "org.joda.time"` 0건 확인
- `joda-time`, `jackson-datatype-joda` 의존성 제거
- JodaModule 등록 제거
- 회귀 테스트 전체 실행 (API 응답 포맷, DB 왕복, 타임존 테스트)

### 검증 포인트 (단계마다)

- [ ] JSON 응답의 시간 필드 포맷이 기존과 동일한가
- [ ] DB에 저장된 시각이 기존과 동일한 시점을 가리키는가
- [ ] DST 전환 시점을 포함한 테스트 케이스 통과
- [ ] 클라이언트 코드가 새 포맷을 파싱할 수 있는가

---

## 8. MyBatis TypeHandler

### java.time 기본 지원 (MyBatis 3.4.5+)

MyBatis는 **3.4.5부터 JSR-310을 기본 지원**합니다. Java 8+ 환경에서 클래스패스에 `java.time`이 존재하면 다음 TypeHandler가 자동 등록됩니다:

| Java 타입 | TypeHandler |
|-----------|-------------|
| `java.time.LocalDate` | `LocalDateTypeHandler` |
| `java.time.LocalTime` | `LocalTimeTypeHandler` |
| `java.time.LocalDateTime` | `LocalDateTimeTypeHandler` |
| `java.time.OffsetDateTime` | `OffsetDateTimeTypeHandler` |
| `java.time.ZonedDateTime` | `ZonedDateTimeTypeHandler` |
| `java.time.Instant` | `InstantTypeHandler` |
| `java.time.OffsetTime` | `OffsetTimeTypeHandler` |
| `java.time.Year`, `Month`, `YearMonth` | 각각 내장 TypeHandler |

MyBatis 3.5.x(=현재 널리 쓰이는 계열)도 물론 모두 지원합니다. **별도 의존성 없이** 바로 사용 가능합니다.

```java
@Mapper
public interface EventMapper {
    Event findById(@Param("id") Long id);

    // XML 쪽에서 created_at TIMESTAMP → OffsetDateTime 자동 매핑
}
```

```xml
<resultMap id="EventResultMap" type="com.example.domain.Event">
    <id     property="id"        column="id"/>
    <result property="startAt"   column="start_at"/>      <!-- OffsetDateTime -->
    <result property="createdAt" column="created_at"/>    <!-- Instant -->
</resultMap>
```

### Joda-Time은 기본 지원 없음

MyBatis는 Joda-Time용 TypeHandler를 기본 제공하지 않습니다. 과거 레거시 프로젝트는 다음 중 하나를 사용했습니다:

- 수동으로 Joda TypeHandler 작성 (`BaseTypeHandler<DateTime>` 확장)
- 서드파티 라이브러리 (예: `jneat/mybatis-types`) — 유지보수 상태 확인 필요

**결론:** java.time으로 전환하면 MyBatis TypeHandler 관리 부담이 사라집니다.

### Oracle DATE/TIMESTAMP 주의

Oracle의 `DATE`는 시간 정보를 포함하고, `TIMESTAMP WITH TIME ZONE`은 오프셋을 보존합니다. 매핑 권장:

| Oracle 컬럼 | Java 타입 권장 |
|------------|---------------|
| `DATE` | `LocalDateTime` (시간 포함) 또는 `LocalDate` (날짜만 쓸 때) |
| `TIMESTAMP` | `LocalDateTime` |
| `TIMESTAMP WITH TIME ZONE` | `OffsetDateTime` |
| `TIMESTAMP WITH LOCAL TIME ZONE` | `Instant` (DB가 UTC 기준 저장) |

---

## 9. 자주 하는 실수

| 실수 | 왜 문제인가 | 수정 |
|------|-------------|------|
| `LocalDateTime`을 DB/API에 쓰면서 타임존 암묵 | 서버 간/클라이언트 간 해석이 달라 시각 오차 발생 | `OffsetDateTime` 또는 UTC `Instant` 사용 |
| `new Date()`와 `java.time`을 혼용 | 직렬화 규칙·타임존 처리가 이중화되어 버그 유발 | 전 코드베이스를 `java.time`으로 통일 |
| `spring.jackson.date-format`으로 `java.time` 포맷 시도 | 이 속성은 `java.util.Date`에만 적용 | `@JsonFormat` 또는 `spring.jackson.serialization.write-dates-as-timestamps: false` |
| `@DateTimeFormat`만 붙이고 JSON 바디를 받음 | `@DateTimeFormat`은 MVC 바인딩(쿼리/폼)용, JSON 바디는 Jackson이 처리 | JSON 바디는 `@JsonFormat` + 기본 ISO-8601 사용 |
| 커스텀 `ObjectMapper` 빈 등록 후 `JavaTimeModule` 누락 | 자동 설정이 꺼져 `InvalidDefinitionException: Java 8 date/time type not supported` | `registerModule(new JavaTimeModule())` 명시 |
| `WRITE_DATES_AS_TIMESTAMPS` 미설정 | 날짜가 epoch ms 숫자로 출력 → 클라이언트가 파싱 못함 | disable 또는 yml 설정 |
| 구 `JSR310Module` 사용 | deprecated, `JavaTimeModule`로 대체됨 | `JavaTimeModule` 사용 |
| 서버 기본 타임존(`ZoneId.systemDefault()`)에 의존 | 배포 환경별 타임존 차이로 버그 | JVM 옵션 `-Duser.timezone=UTC` 또는 명시적 `ZoneId` 사용 |
| Joda `Period`(시·분 포함)를 `java.time.Period`로 직변환 | `java.time.Period`는 연·월·일만 — 시간 정보 유실 | 시간 단위는 `java.time.Duration`으로 분리 |
| `@JsonFormat`에 타임존 정보 없는 패턴 (`yyyy-MM-dd HH:mm:ss`) | 역직렬화 시 오프셋 추정이 필요해짐 | ISO-8601 오프셋 포함 (`yyyy-MM-dd'T'HH:mm:ssXXX`) |
| Spring Boot 2.5.0 + 커스텀 `ObjectMapper` | 보고된 이슈(spring-boot#26859): `Instant` 직렬화 실패 사례 | `JavaTimeModule` 명시 등록 또는 2.5.1+로 업그레이드 |

---

## 10. 빠른 체크리스트

**신규 프로젝트:**
- [ ] `jackson-datatype-jsr310` 의존성 포함 (Spring Boot 자동 포함)
- [ ] `spring.jackson.serialization.write-dates-as-timestamps: false`
- [ ] DTO 필드는 `OffsetDateTime`/`Instant`/`LocalDate` 사용
- [ ] `new Date()`, `Calendar`, `SimpleDateFormat` 사용 금지
- [ ] JVM 타임존 UTC 고정

**마이그레이션 프로젝트:**
- [ ] 의존성 병존 단계에서 `JodaModule` + `JavaTimeModule` 둘 다 등록
- [ ] 도메인 단위로 점진 전환, 단계마다 회귀 테스트
- [ ] 경계 어댑터(`TimeAdapters`) 유틸 작성
- [ ] 전환 완료 후 `joda-time` / `jackson-datatype-joda` 의존성 제거
- [ ] DST 전환 시점 테스트 케이스 포함
