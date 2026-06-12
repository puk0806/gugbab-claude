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
