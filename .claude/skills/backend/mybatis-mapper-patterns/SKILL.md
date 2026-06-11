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

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
