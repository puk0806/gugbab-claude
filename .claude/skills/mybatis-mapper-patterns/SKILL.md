---
name: mybatis-mapper-patterns
description: MyBatis Mapper 패턴 - 3.6.0(2026-10) 변경·스타터 2.x~4.x 버전 매트릭스, Spring Boot 2.5~4.x 의존성·application.yml, 동적 SQL 함정·foreach, resultMap(association·collection), TypeHandler, Oracle/MySQL 특화(selectKey·jdbcType·페이징), 흔한 실수
---

# MyBatis Mapper 작성 패턴

> 소스: https://mybatis.org/mybatis-3/ | https://github.com/mybatis/spring-boot-starter | https://github.com/mybatis/mybatis-3/wiki/FAQ
> 검증일: 2026-11-09 (최초 2026-04-22, 이전 재검증 2026-09-26)

> 주의: 이 문서는 MyBatis 3.5.x (3.5.16 ~ 3.5.19) 기준이며, Spring Boot 2.5 / 3.x / 4.x 통합을 다룹니다. MyBatis 3.5.4 이후 3.5.19까지 Mapper API는 안정적입니다.
>
> 주의(2026-11-09 재검증): `mybatis-spring-boot-starter` 4.0.x(Spring Boot 4.0, 최신 4.0.1)·4.1.x(Spring Boot 4.1, 4.1.0 = 2026-07-16)가 릴리스되어 있고, **모든 현행 스타터(3.0.5·4.0.1·4.1.0)는 MyBatis 3.5.19를 번들**합니다. Mapper 인터페이스·XML·동적 SQL·resultMap 등 본 문서의 핵심 패턴은 4.x에서도 그대로 유효합니다. 2.3.x(Spring Boot 2.7용)는 여전히 2.3.2가 마지막 릴리스입니다.
>
> 주의(2026-11-09 재검증): **MyBatis 3.6.0이 2026-10-23에 릴리스**되었습니다 — **Java 11+ 필수**(Java 8 지원 종료), TypeHandler 해석이 `Class` → `java.lang.reflect.Type` 기반으로 바뀌었고, `<choose>` 안의 알 수 없는 요소는 예외를 던집니다. 릴리스 노트에 "파라미터 메타데이터로 TypeHandler를 해석하는 동작"에 따른 **버그 보고가 여럿 있고 3.6.1에서 끄는 수정이 예정**이라고 명시되어 있으므로, 운영 프로젝트는 3.6.1 이전에는 스타터 번들 버전(3.5.19)을 유지하는 편이 안전합니다. 본 문서의 예제 문법은 3.6.0에서도 그대로 쓰입니다.

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
- 최신 `3.0.5` (2025-07-11)는 MyBatis 3.5.19 + MyBatis-Spring 3.0.5 포함

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

> 주의: Spring Boot 4.0은 `4.0.x` 계열(최신 4.0.1, MyBatis-Spring 4.0), Spring Boot 4.1은 `4.1.x` 계열(4.1.0, MyBatis-Spring 4.1)을 사용합니다 — 둘 다 Java 17+.

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

## 동적 SQL

> 주의: XML 내 비교 연산자(`<`, `>`, `<=`, `>=`)는 XML 파서가 태그로 오인할 수 있어 반드시 **엔티티(`&lt;`, `&gt;`)** 또는 **CDATA(`<![CDATA[ ... ]]>`)**로 감싸야 한다. 예: `AND age &gt;= #{ageMin}` 또는 `<![CDATA[ AND age >= #{ageMin} ]]>`. 숫자 범위 조회에서 자주 놓치는 지점.

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

> 상세 레퍼런스 (TypeHandler·Oracle/MySQL 특화·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
