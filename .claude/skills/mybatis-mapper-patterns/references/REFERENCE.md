## N+1 방지

N+1 문제는 부모 N건 조회 후 각 부모의 자식을 개별 SELECT로 조회하여 총 N+1번 쿼리가 실행되는 상황이다.

| 해결 방법 | 설명 |
|-----------|------|
| **Nested Results + JOIN** | 1번의 JOIN 쿼리로 모든 데이터 로드 — 가장 확실한 해결책 |
| **Nested Select + `fetchType="lazy"`** | 접근 시점 로드. 목록 화면에서 실제 접근이 드물 때 유효 |
| **Batch Loading** | `mybatis.configuration.default-executor-type=BATCH` + 수동 페치 |

### Nested Results가 항상 더 나은가

- 부모-자식 건수가 적고 화면에서 모두 필요 → Nested Results (JOIN)
- 자식 데이터가 크고 일부만 접근 → Nested Select + lazy
- Nested Select + eager는 N+1 그대로 발생하므로 피할 것

> 주의: MyBatis의 lazy 로딩은 프록시 기반이므로 엔티티 클래스가 `final`이 아니어야 하고, Spring의 `OpenSessionInView` 같은 세션 생존 구간이 필요하다.

---

## TypeHandler — 커스텀 타입 변환

Java 타입 ↔ JDBC 타입 변환 로직. enum 커스텀 처리, JSON 컬럼 매핑, 암호화 컬럼 등에 사용.

### 기본 enum 처리 (내장)

MyBatis는 기본으로 `EnumTypeHandler`를 제공한다:
- `EnumTypeHandler`: enum의 `name()`을 VARCHAR로 저장 (기본값)
- `EnumOrdinalTypeHandler`: enum의 ordinal을 INTEGER로 저장

```yaml
mybatis:
  configuration:
    default-enum-type-handler: org.apache.ibatis.type.EnumOrdinalTypeHandler
```

### 커스텀 enum TypeHandler (코드값 매핑)

DB 컬럼이 `"Y"`/`"N"` 같은 코드값을 쓸 때:

```java
public enum YnFlag {
    Y("Y"), N("N");
    private final String code;
    YnFlag(String code) { this.code = code; }
    public String getCode() { return code; }
    public static YnFlag fromCode(String code) {
        for (YnFlag v : values()) if (v.code.equals(code)) return v;
        throw new IllegalArgumentException("Unknown code: " + code);
    }
}

@MappedTypes(YnFlag.class)
@MappedJdbcTypes(JdbcType.VARCHAR)
public class YnFlagTypeHandler extends BaseTypeHandler<YnFlag> {
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, YnFlag p, JdbcType jdbcType) throws SQLException {
        ps.setString(i, p.getCode());
    }
    @Override
    public YnFlag getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String code = rs.getString(columnName);
        return code == null ? null : YnFlag.fromCode(code);
    }
    @Override
    public YnFlag getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String code = rs.getString(columnIndex);
        return code == null ? null : YnFlag.fromCode(code);
    }
    @Override
    public YnFlag getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String code = cs.getString(columnIndex);
        return code == null ? null : YnFlag.fromCode(code);
    }
}
```

### JSON 컬럼 TypeHandler

```java
@MappedTypes({Map.class})
public class JsonMapTypeHandler extends BaseTypeHandler<Map<String, Object>> {
    private static final ObjectMapper OM = new ObjectMapper();

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Map<String, Object> p, JdbcType t) throws SQLException {
        try { ps.setString(i, OM.writeValueAsString(p)); }
        catch (Exception e) { throw new SQLException(e); }
    }

    @Override
    public Map<String, Object> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String json = rs.getString(columnName);
        if (json == null) return null;
        try { return OM.readValue(json, new TypeReference<Map<String, Object>>(){}); }
        catch (Exception e) { throw new SQLException(e); }
    }
    // getNullableResult(int), getNullableResult(CallableStatement) 동일 패턴
}
```

### 등록 방법

1. **자동 스캔 (Spring Boot)**: `mybatis.type-handlers-package: com.example.typehandler`로 패키지 지정
2. **수동 등록**: `@Bean ConfigurationCustomizer` 활용

```java
@Bean
public ConfigurationCustomizer typeHandlerCustomizer() {
    return configuration -> configuration.getTypeHandlerRegistry()
            .register(YnFlag.class, YnFlagTypeHandler.class);
}
```

3. **SQL 파라미터에 명시**: `#{flag,typeHandler=com.example.typehandler.YnFlagTypeHandler}`

### Jasypt 등 암호화 컬럼

Jasypt 같은 라이브러리를 쓸 때는 `BaseTypeHandler<String>`에서 `set*`에 암호화, `get*`에 복호화를 호출한다. Jasypt의 MyBatis 연동 모듈(`jasypt-mybatis`)이 제공하는 TypeHandler를 그대로 쓰는 편이 안전하다.

> 주의: Jasypt 관련 구체적 클래스명/모듈 구성은 프로젝트에서 사용 중인 Jasypt 버전 문서를 확인하세요.

---

## Oracle 특화

### 시퀀스 + selectKey (XML)

```xml
<insert id="insert" parameterType="com.example.domain.User">
    <selectKey keyProperty="id" resultType="long" order="BEFORE">
        SELECT user_seq.NEXTVAL FROM DUAL
    </selectKey>
    INSERT INTO users (id, username, email)
    VALUES (#{id}, #{username}, #{email})
</insert>
```

- `order="BEFORE"`: INSERT 전에 시퀀스 호출
- 오라클은 AUTO_INCREMENT가 없으므로 시퀀스 + BEFORE selectKey가 표준 패턴

### 어노테이션 방식

```java
@Insert("INSERT INTO users (id, username, email) VALUES (#{id}, #{username}, #{email})")
@SelectKey(
    keyProperty = "id",
    before = true,
    resultType = Long.class,
    statement = "SELECT user_seq.NEXTVAL FROM DUAL"
)
int insert(User user);
```

### null 파라미터의 jdbcType 명시

오라클 JDBC 드라이버는 null을 `VARCHAR`로 바인딩할 때 에러를 낸다. null 가능 파라미터에는 `jdbcType` 명시:

```xml
UPDATE users
   SET nickname = #{nickname,jdbcType=VARCHAR}
 WHERE id = #{id,jdbcType=NUMERIC}
```

또는 전역 설정:

```yaml
mybatis:
  configuration:
    jdbc-type-for-null: NULL   # Oracle: VARCHAR → NULL 또는 OTHER
```

### 페이징 (Oracle 12c+)

```xml
<select id="listPaged" resultMap="UserResultMap">
    SELECT id, username, email
      FROM users
     ORDER BY id DESC
    OFFSET #{offset} ROWS FETCH NEXT #{size} ROWS ONLY
</select>
```

Oracle 12c 이전에는 ROWNUM 중첩 서브쿼리를 사용:

```xml
SELECT * FROM (
    SELECT a.*, ROWNUM rnum FROM (
        SELECT * FROM users ORDER BY id DESC
    ) a WHERE ROWNUM <= #{end}
) WHERE rnum > #{start}
```

---

## MySQL 특화

### AUTO_INCREMENT PK 반환

```xml
<insert id="insert" useGeneratedKeys="true" keyProperty="id">
    INSERT INTO users (username, email)
    VALUES (#{username}, #{email})
</insert>
```

- `useGeneratedKeys="true"`: JDBC의 `getGeneratedKeys()`로 키 회수
- `keyProperty="id"`: 회수된 키를 파라미터 객체의 `id` 필드에 채움

### 어노테이션 방식

```java
@Insert("INSERT INTO users (username, email) VALUES (#{username}, #{email})")
@Options(useGeneratedKeys = true, keyProperty = "id")
int insert(User user);
```

### 페이징 (LIMIT/OFFSET)

```xml
<select id="listPaged" resultMap="UserResultMap">
    SELECT id, username, email
      FROM users
     ORDER BY id DESC
     LIMIT #{size} OFFSET #{offset}
</select>
```

> 주의: OFFSET이 클 경우 성능이 급격히 저하된다. 대용량은 cursor/keyset 페이지네이션 (WHERE id < lastSeenId)을 고려.

---

## SQL 인젝션 방지

### `#{}` vs `${}`

| 문법 | 동작 | 안전성 |
|------|------|:------:|
| `#{name}` | PreparedStatement 파라미터 바인딩 (`?`) | ✅ 안전 |
| `${name}` | 문자열 치환 (SQL에 직접 삽입) | ❌ SQL 인젝션 위험 |

**원칙:** 가능한 모든 파라미터는 `#{}`를 사용한다.

### `${}`의 정당한 사용처

- 테이블/컬럼 이름 동적 지정 (PreparedStatement로 표현 불가)
- ORDER BY 컬럼 지정 (정적 화이트리스트 검증 필수)
- 동적 힌트 (`/*+ INDEX(...) */`)

### 안전한 `${}` 사용 예 (화이트리스트)

```java
// 서비스 레이어에서 검증
private static final Set<String> ALLOWED = Set.of("id", "username", "created_at");

public List<User> list(String sortColumn) {
    if (!ALLOWED.contains(sortColumn)) {
        throw new IllegalArgumentException("invalid sort: " + sortColumn);
    }
    return userMapper.listSorted(sortColumn);
}
```

```xml
<select id="listSorted" resultMap="UserResultMap">
    SELECT id, username, email FROM users ORDER BY ${sortColumn}
</select>
```

> 사용자 입력을 검증 없이 `${}`로 꽂는 것은 절대 금지.

---

## Spring Boot 통합 요약

### 완전한 설정 예 (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/app?serverTimezone=Asia/Seoul
    username: app
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10

mybatis:
  mapper-locations: classpath:mapper/**/*.xml
  type-aliases-package: com.example.domain
  type-handlers-package: com.example.typehandler
  configuration:
    map-underscore-to-camel-case: true
    default-fetch-size: 100
    default-statement-timeout: 30
    cache-enabled: true
    lazy-loading-enabled: true
    aggressive-lazy-loading: false
```

### 트랜잭션

```java
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;

    @Transactional
    public Long create(CreateUserReq req) {
        User user = User.of(req.getUsername(), req.getEmail());
        userMapper.insert(user);       // AUTO_INCREMENT 또는 selectKey로 id 채워짐
        return user.getId();
    }

    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userMapper.findById(id);
    }
}
```

Spring의 `@Transactional`이 그대로 적용된다. MyBatis 세션은 Spring이 관리한다.

### SQL 로깅

```yaml
logging:
  level:
    com.example.mapper: DEBUG      # 해당 매퍼의 SQL + 파라미터 출력
```

매퍼 네임스페이스(FQCN) 레벨을 `DEBUG`로 두면 실행 SQL과 바인딩 값이 찍힌다.

---

## 자주 하는 실수

| 실수 | 수정 |
|------|------|
| `namespace`가 인터페이스 FQCN과 불일치 | FQCN을 정확히 맞춘다 |
| 파라미터 2개 이상에 `@Param` 누락 | 모두 `@Param`으로 이름 지정 |
| 사용자 입력을 `${}`로 바인딩 | `#{}` 사용, `${}`는 화이트리스트 검증 후만 |
| Oracle에서 null 컬럼 업데이트 시 에러 | `#{col,jdbcType=VARCHAR}` 또는 `jdbc-type-for-null: NULL` 설정 |
| `useGeneratedKeys`를 Oracle에서 사용 | Oracle은 `selectKey` + `order="BEFORE"` + 시퀀스 |
| `<collection>` + nested select + eager | JOIN 기반 nested results 또는 lazy로 전환 |
| `<foreach>`에 `collection="list"` 대신 파라미터명 사용 | `@Param`으로 명시한 이름 또는 `list`/`array` |
| `mapper.xml`이 클래스패스에 없음 | `mapper-locations` 패턴과 리소스 경로 확인 |
| lazy 로딩 엔티티를 `final`로 선언 | 프록시 생성 불가 → non-final 유지 |
| `@Transactional` 없이 여러 매퍼 호출 | 원자성 보장 안 됨 — 서비스 레이어에 `@Transactional` 적용 |
