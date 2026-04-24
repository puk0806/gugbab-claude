---
name: mybatis-mapper-patterns
description: MyBatis Mapper 작성 패턴 - 인터페이스·XML 매퍼, 어노테이션, 동적 SQL, resultMap, TypeHandler, Oracle/MySQL 특화, 페이징, N+1 방지, Spring Boot 통합
---

# MyBatis Mapper 작성 패턴

> 소스: https://mybatis.org/mybatis-3/ | https://github.com/mybatis/spring-boot-starter | https://github.com/mybatis/mybatis-3/wiki/FAQ
> 검증일: 2026-04-22

> 주의: 이 문서는 MyBatis 3.5.x (3.5.16 ~ 3.5.19) 기준이며, Spring Boot 2.5 / 3.x 양쪽 통합을 다룹니다. MyBatis 3.5.4 이후 3.5.19까지 Mapper API는 안정적입니다.

---

## 의존성 설정

### Spring Boot 3.x (3.2 ~ 3.5) + Java 17+

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>3.0.5</version>
</dependency>
```

- `3.0.x` 브랜치: MyBatis 3.5, MyBatis-Spring 3.0, Java 17+, Spring Boot 3.2 ~ 3.5 지원
- 최신 `3.0.5` (2024-07-12)는 MyBatis 3.5.19 + MyBatis-Spring 3.0.5 포함

### Spring Boot 2.5 ~ 2.7 + Java 8+

```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.3.2</version>
</dependency>
```

- `2.3.x` 브랜치: MyBatis 3.5, MyBatis-Spring 2.1, Java 8+, Spring Boot 2.7 공식 지원
- 2.3.2 (2023-11-25)가 2.3.x 마지막 릴리스로 명시
- Spring Boot 2.5에서는 `2.2.x` 계열(마지막 2.2.2)을 우선 고려. 2.3.x도 대부분 동작하지만 공식 지원 매트릭스상 2.7 기준

> 주의: Spring Boot 4.x는 `4.0.x` 계열을 사용합니다(MyBatis-Spring 4.0 + Java 17+).

### application.yml 기본 설정

```yaml
mybatis:
  mapper-locations: classpath:mapper/**/*.xml
  type-aliases-package: com.example.domain
  type-handlers-package: com.example.typehandler
  configuration:
    map-underscore-to-camel-case: true      # user_name ↔ userName 자동 매핑
    default-fetch-size: 100
    default-statement-timeout: 30
    jdbc-type-for-null: NULL                # Oracle은 OTHER 권장
```

---

## 권장 아키텍처: Mapper 인터페이스 + XML 매퍼

```
src/main/java/com/example/mapper/UserMapper.java          ← 인터페이스 (메서드 시그니처)
src/main/resources/mapper/UserMapper.xml                  ← XML (SQL 정의)
```

두 파일을 짝지어 작성한다. 복잡한 SQL·동적 SQL은 XML로, 단순 CRUD는 어노테이션으로 선택할 수 있다.

### Mapper 인터페이스

```java
package com.example.mapper;

import com.example.domain.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {
    User findById(@Param("id") Long id);
    List<User> findByCondition(@Param("cond") UserSearchCond cond);
    int insert(User user);
    int update(User user);
    int deleteById(@Param("id") Long id);
}
```

### XML 매퍼

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.UserMapper">

    <resultMap id="UserResultMap" type="com.example.domain.User">
        <id     property="id"        column="id"/>
        <result property="username"  column="username"/>
        <result property="email"     column="email"/>
        <result property="createdAt" column="created_at"/>
    </resultMap>

    <select id="findById" resultMap="UserResultMap">
        SELECT id, username, email, created_at
          FROM users
         WHERE id = #{id}
    </select>
</mapper>
```

- `namespace`는 반드시 인터페이스 FQCN과 일치
- `<select id="...">`는 인터페이스 메서드명과 동일
- XML 경로는 `application.yml`의 `mybatis.mapper-locations` 패턴과 일치해야 로드된다

---

## `@Mapper` vs `@MapperScan`

| 방식 | 위치 | 사용 시점 |
|------|------|-----------|
| `@Mapper` | 각 Mapper 인터페이스 | 매퍼 수가 적거나 개별 어노테이션이 선호될 때 |
| `@MapperScan` | `@SpringBootApplication` 클래스 | 매퍼 수가 많고 패키지 단위 일괄 등록이 필요할 때 |

### `@Mapper` 개별 지정

```java
@Mapper
public interface UserMapper { ... }
```

`mybatis-spring-boot-starter`는 기본적으로 `@Mapper`가 붙은 인터페이스를 자동 스캔해 빈으로 등록한다.

### `@MapperScan` 일괄 등록

```java
@SpringBootApplication
@MapperScan(basePackages = "com.example.mapper")
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

- `@MapperScan`을 사용하면 해당 패키지의 모든 인터페이스가 Mapper로 등록된다
- `@Mapper` 어노테이션 없이도 스캔 대상이 되므로 보일러플레이트 감소
- 둘을 동시에 써도 되지만 중복 등록을 피하려면 하나로 통일하는 편이 낫다

---

## 어노테이션 방식 (간단 쿼리)

단순 CRUD에는 XML 없이 어노테이션으로 직접 SQL을 작성할 수 있다.

```java
@Mapper
public interface UserMapper {

    @Select("SELECT id, username, email FROM users WHERE id = #{id}")
    User findById(@Param("id") Long id);

    @Insert("INSERT INTO users (username, email) VALUES (#{username}, #{email})")
    int insert(User user);

    @Update("UPDATE users SET email = #{email} WHERE id = #{id}")
    int updateEmail(@Param("id") Long id, @Param("email") String email);

    @Delete("DELETE FROM users WHERE id = #{id}")
    int deleteById(@Param("id") Long id);
}
```

### `@Param` 사용 규칙

- 파라미터가 **2개 이상**이면 `@Param`으로 이름을 부여해야 `#{name}`으로 참조 가능
- 파라미터가 **1개**여도 객체 필드를 명시적으로 식별하고 싶으면 `@Param` 권장
- 객체 하나를 받으면 필드명을 바로 `#{fieldName}`으로 참조 가능 (예: `User user` → `#{username}`)

### 언제 XML을 쓰고 언제 어노테이션을 쓰나

| 상황 | 권장 |
|------|------|
| 단순 SELECT/INSERT/UPDATE/DELETE | 어노테이션 |
| 동적 SQL (`<if>`, `<foreach>` 등) | XML |
| 복잡한 `resultMap`, 연관 매핑 | XML |
| SQL이 길거나 여러 줄 포맷 필요 | XML |

어노테이션에서도 `@SelectProvider` 등으로 동적 SQL 가능하지만 XML이 훨씬 명확하다.

---

## 동적 SQL

MyBatis는 OGNL 기반 표현식으로 동적 SQL 요소를 제공한다.

### `<if>` — 조건부 조각

```xml
<select id="findByCondition" resultMap="UserResultMap">
    SELECT id, username, email
      FROM users
     WHERE 1 = 1
    <if test="cond.username != null and cond.username != ''">
        AND username LIKE CONCAT('%', #{cond.username}, '%')
    </if>
    <if test="cond.email != null">
        AND email = #{cond.email}
    </if>
</select>
```

> 주의: XML 내 비교 연산자(`<`, `>`, `<=`, `>=`)는 XML 파서가 태그로 오인할 수 있어 반드시 **엔티티(`&lt;`, `&gt;`)** 또는 **CDATA(`<![CDATA[ ... ]]>`)**로 감싸야 한다. 예: `AND age &gt;= #{ageMin}` 또는 `<![CDATA[ AND age >= #{ageMin} ]]>`. 숫자 범위 조회에서 자주 놓치는 지점.

### `<where>` — AND/OR 자동 정리

`<where>`는 내부에 내용이 있을 때만 `WHERE`를 추가하고, 앞에 붙은 `AND`/`OR`를 자동으로 제거한다.

```xml
<select id="findByCondition" resultMap="UserResultMap">
    SELECT id, username, email FROM users
    <where>
        <if test="cond.username != null">
            AND username LIKE CONCAT('%', #{cond.username}, '%')
        </if>
        <if test="cond.email != null">
            AND email = #{cond.email}
        </if>
    </where>
</select>
```

### `<choose> / <when> / <otherwise>` — switch 역할

```xml
<select id="findUser" resultMap="UserResultMap">
    SELECT * FROM users
    <where>
        <choose>
            <when test="id != null">
                AND id = #{id}
            </when>
            <when test="email != null">
                AND email = #{email}
            </when>
            <otherwise>
                AND status = 'ACTIVE'
            </otherwise>
        </choose>
    </where>
</select>
```

### `<set>` — UPDATE SET 절 자동 정리

```xml
<update id="update">
    UPDATE users
    <set>
        <if test="username != null">username = #{username},</if>
        <if test="email != null">email = #{email},</if>
        updated_at = CURRENT_TIMESTAMP
    </set>
    WHERE id = #{id}
</update>
```

`<set>`은 마지막 쉼표를 자동으로 제거한다.

### `<foreach>` — 컬렉션 반복

```xml
<!-- IN 절 -->
<select id="findByIds" resultMap="UserResultMap">
    SELECT * FROM users
     WHERE id IN
    <foreach item="id" collection="ids" open="(" separator="," close=")">
        #{id}
    </foreach>
</select>

<!-- 벌크 INSERT -->
<insert id="insertAll">
    INSERT INTO users (username, email) VALUES
    <foreach item="u" collection="list" separator=",">
        (#{u.username}, #{u.email})
    </foreach>
</insert>
```

- `collection` 속성:
  - List 인자 1개 → `list`
  - Array 인자 1개 → `array`
  - 복수 파라미터 → `@Param("ids")`로 이름 지정 후 `collection="ids"`

### `<trim>` — 커스텀 접두/접미 제어

`<where>`, `<set>`은 `<trim>`의 특수 사례다. 더 세밀한 제어가 필요하면 `<trim>` 직접 사용.

```xml
<trim prefix="WHERE" prefixOverrides="AND |OR ">
    <if test="username != null">AND username = #{username}</if>
    <if test="email != null">OR email = #{email}</if>
</trim>
```

---

## resultMap — 고급 결과 매핑

### 기본 resultMap

```xml
<resultMap id="UserResultMap" type="com.example.domain.User">
    <id     property="id"         column="user_id"/>
    <result property="username"   column="user_name"/>
    <result property="createdAt"  column="created_at"/>
</resultMap>
```

- `<id>`: PK에 사용, 캐시·중첩 매핑 시 식별자로 쓰임
- `<result>`: 일반 컬럼 매핑
- `map-underscore-to-camel-case: true` 설정 시 `user_name` ↔ `userName` 자동 변환되어 명시적 매핑 생략 가능

### `<association>` — has-one (1:1, N:1)

한 유저가 한 부서에 속하는 경우.

#### Nested Results (권장, 조인 1번)

```xml
<resultMap id="UserWithDept" type="com.example.domain.User">
    <id     property="id"       column="u_id"/>
    <result property="username" column="u_name"/>
    <association property="department" javaType="com.example.domain.Department">
        <id     property="id"   column="d_id"/>
        <result property="name" column="d_name"/>
    </association>
</resultMap>

<select id="findUserWithDept" resultMap="UserWithDept">
    SELECT u.id AS u_id, u.username AS u_name,
           d.id AS d_id, d.name AS d_name
      FROM users u
      LEFT JOIN departments d ON d.id = u.dept_id
     WHERE u.id = #{id}
</select>
```

#### Nested Select (N+1 주의)

```xml
<resultMap id="UserWithDept" type="com.example.domain.User">
    <id     property="id"       column="id"/>
    <result property="username" column="username"/>
    <association property="department"
                 column="dept_id"
                 javaType="com.example.domain.Department"
                 select="com.example.mapper.DepartmentMapper.findById"
                 fetchType="lazy"/>
</resultMap>
```

- `fetchType="lazy"`: 프록시로 실제 접근 시점에 로드
- `fetchType="eager"`: 즉시 로드 (N+1 위험)

### `<collection>` — has-many (1:N)

한 부서가 여러 유저를 가지는 경우.

```xml
<resultMap id="DeptWithUsers" type="com.example.domain.Department">
    <id     property="id"   column="d_id"/>
    <result property="name" column="d_name"/>
    <collection property="users" ofType="com.example.domain.User">
        <id     property="id"       column="u_id"/>
        <result property="username" column="u_name"/>
    </collection>
</resultMap>

<select id="findDeptWithUsers" resultMap="DeptWithUsers">
    SELECT d.id AS d_id, d.name AS d_name,
           u.id AS u_id, u.username AS u_name
      FROM departments d
      LEFT JOIN users u ON u.dept_id = d.id
     WHERE d.id = #{id}
</select>
```

---

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
