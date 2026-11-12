---
name: ibatis-to-mybatis-migration
description: iBATIS 2(sqlMap) → MyBatis 3 전환에서 모델이 모르는 지점 — 변환 도구 ibatis2mybatis(build.xml 동작·하위 폴더 미처리·destination 삭제·변환 못 하는 요소), sqlMapConfig/sqlMap/동적 태그/procedure/cacheModel/groupBy 대응표, 의미가 바뀌는 곳(isNotEmpty 숫자 0·컬렉션, OGNL 한 글자 Character 비교, jdbcTypeForNull OTHER → Oracle 1111, insert 반환값, $ 인젝션), SqlMapClient → SqlSession API 대응, Spring 4 orm.ibatis 제거·mybatis-2-spring/mybatis2 2.8.x, 같은 DataSource·트랜잭션 매니저 공존, 스타터 버전표, 동등성 검증 입력
---

# iBATIS 2 → MyBatis 3 마이그레이션 가이드

> 소스:
> - https://github.com/mybatis/ibatis2mybatis (README·`build.xml`·`migrate.xslt` 원문)
> - https://github.com/mybatis/ibatis2mybatis/wiki (iBATIS 2 → MyBatis 3 마이그레이션 위키)
> - https://mybatis.org/ibatis2mybatis/
> - https://github.com/mybatis/ibatis-2 (README, `IsEmptyTagHandler`·`ConditionalTagHandler`·`SqlMapExecutor`·`ParameterMap` 소스)
> - https://github.com/mybatis/ibatis-spring (Spring 4+에서 iBATIS 2를 쓰기 위한 `mybatis-2-spring`)
> - https://mybatis.org/mybatis-3/dynamic-sql.html · https://mybatis.org/mybatis-3/sqlmap-xml.html · https://mybatis.org/mybatis-3/java-api.html · https://mybatis.org/mybatis-3/configuration.html · https://mybatis.org/mybatis-3/getting-started.html
> - https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/ · https://github.com/mybatis/spring-boot-starter
> - https://mybatis.org/spring/transactions.html · https://mybatis.org/spring/sqlsession.html
> - https://docs.spring.io/spring-framework/docs/3.2.x/javadoc-api/org/springframework/orm/ibatis/SqlMapClientTemplate.html
>
> 검증일: 2026-11-06

> 기준 버전 (2026-11-06 확인): iBATIS 2 유지보수판 `org.mybatis:mybatis2` 2.8.1(2026-07) · `org.mybatis:mybatis-2-spring` 1.4.2(2026-07) ·
> MyBatis 3.5.19 · `mybatis-spring-boot-starter` 2.3.2 / 3.0.5 / 4.0.1 / 4.1.0(모두 MyBatis 3.5.x 사용) · 변환 도구 `ibatis2mybatis` GitHub 릴리스 태그 1.3.1(2026-07, 안정 지점 표시용 — Maven Central 배포 없음, 레포를 clone 해서 실행하며 pom 버전은 1.0.0-SNAPSHOT)
>
> 주의: MyBatis **3.6.0**(2026-10-23)이 나왔다 — Java 11+ 필요, TypeHandler를 `Class` 대신 `java.lang.reflect.Type` 기준으로 해석하도록 바뀌는 등 변경이 많다. 스타터 4.1.0까지는 3.5.19를 쓰므로 이 문서는 3.5.19 기준이며, 3.6.0으로 올릴 때는 공식 릴리스 노트를 따로 확인한다(`jdbcTypeForNull` 기본 `OTHER`는 3.6.0 소스에서도 같음).

---

## 이 스킬의 범위

iBATIS 2의 무엇이 MyBatis 3의 무엇이 되는지, 자동 변환에서 무엇이 새는지만 다룬다. MyBatis 3 매퍼 작성법(동적 SQL·resultMap·페이징·Boot 설정) 같은 기본 사용법은 공식 문서 수준이라 싣지 않는다 → `mybatis-mapper-patterns`. Boot 업그레이드 자체는 `spring-boot-2-to-3-migration`, 특성화 테스트 작성법은 `characterization-testing`.

권장 순서: ① statement별 "입력 → SQL·바인딩 → 결과" 특성화 테스트 ② iBATIS 2와 MyBatis 3를 **같은 DataSource·같은 트랜잭션 매니저**로 공존(6절) ③ sqlMap 파일 단위 변환·보정 ④ 호출부를 Mapper 인터페이스로 ⑤ 테스트 통과 후 sqlMap 삭제 반복 → 마지막에 iBATIS 의존성 제거.

---

## 1. 공식 변환 도구 ibatis2mybatis

- XSLT + 텍스트 치환을 Ant 태스크로 묶은 **출발점 생성기**(제작자: *"this initial version is by no means perfect yet"*). 변환 못 한 요소는 콘솔에 `Sorry, I can't migrate ...`로 보고, 일부는 XML 주석으로 남긴다.
- 실행: `git clone` → 옮길 sqlMap을 `source/`에 복사 → `ant`(기본 타깃 `migrateToMyBatis3`) 또는 `./mvnw clean install`(maven-antrun-plugin, prepare-package) → `destination/*.xml`. 콘솔 출력을 `tee`로 저장.

`build.xml`이 실제로 하는 일:

| 순서 | 동작 | 결과/주의 |
|------|------|-----------|
| 1 | `destination/*.xml` 삭제 | **매 실행마다 이전 결과가 지워진다** — 수동 보정본을 destination에 두지 말 것 |
| 2 | `source/*.xml`에 `migrate.xslt` 적용 | `includes="*.xml"` — **하위 폴더는 처리하지 않음**. 평탄화해서 넣고 결과를 다시 배치 |
| 3 | `:NUMERIC#`·`:TIMESTAMP#`·`:VARCHAR#`·`:BLOB#` → `,jdbcType=...#` | 그 외 타입(`:CLOB#`·`:DATE#`·`:INTEGER#` 등)은 build.xml에 replace 줄을 **직접 추가** |
| 4 | `$prop$` → `${prop}` | 인젝션 위험 그대로 이전됨 (4-3절) |
| 5 | `#prop#` → `#{prop}` (정규식, 2글자 이상) | 1글자 프로퍼티명(`#a#`)은 변환되지 않음 → 수동 확인 |
| 6 | `xyz[]` → `item` | `<iterate>` 안의 `#list[]#` 류를 `foreach item="item"`에 맞춤 |
| 7 | MyBatis 3 DTD로 `xmlvalidate` (`failonerror="yes"`) | 남은 iBATIS 전용 요소가 있으면 **빌드 실패** → 실패 메시지가 곧 수동 작업 목록 |

> 주의: 도구는 sqlMap(매퍼)과 sqlMapConfig(설정) 템플릿을 모두 갖고 있지만, Spring 환경에서는 설정 파일 대신 Spring/Boot 설정으로 옮기는 경우가 대부분이다. 설정 변환 결과는 참고용으로만 쓴다.

### 도구가 변환하지 못하거나 의미를 바꾸는 것 (migrate.xslt 원문 기준)

| iBATIS 2 요소 | 도구 동작 | 해야 할 일 |
|---------------|-----------|------------|
| `<result nullValue=...>` / `columnIndex` / `notNullColumn` | 콘솔 보고, 속성 버림 | `nullValue`는 SQL `NVL/COALESCE` 또는 TypeHandler로 재현 |
| `<statement>` · `<cacheModel>` · sqlMap 안 `<typeAlias>` · `<isPropertyAvailable>` · `<isNotPropertyAvailable>` · `<isParameterPresent>` · `<isNotParameterPresent>` · config `<properties>` | 주석+콘솔 보고 후 **내용 누락** | 수동 작성 (cacheModel→`<cache>`, typeAlias→config `<typeAliases>` 또는 Boot `type-aliases-package`) |
| `<dynamic prepend="WHERE">` / `"SET"` (대소문자 정확히 `WHERE`/`where`/`SET`/`set`) | `<where>` / `<set>` | 자동 |
| 그 외 `<dynamic>` (prepend 없음, `AND`, `,` 등) | 변환되지 않음 — XSLT의 해당 분기는 MyBatis에 없는 `<dynamic>` 요소를 내보내고, `dynamic`은 "변환 불가" 목록에도 들어 있어 주석+콘솔 보고로 끝날 수도 있다 | `<trim prefix=... prefixOverrides=...>`로 수동 변환 |
| `<result resultMap="...">` | **항상 `<collection>`**으로 변환 | 1:1(has-one)이면 `<association>`으로 |
| `<result select="...">` | `<association select=...>` | 1:N이면 `<collection>`으로 |
| `<procedure>` | `<update statementType="CALLABLE">` | 결과를 받는 프로시저는 `<select statementType="CALLABLE">` 검토 |
| `<resultMap groupBy="id">` | `groupBy` 무시 | `<id>` 요소 지정 + 자식은 `<collection>` |
| `<isEqual compareValue="...">` 등 비교 태그 | `compareValue`가 숫자로 읽히면 따옴표 없이, 아니면 `"..."`로 감싼 OGNL | 프로퍼티 타입과 맞는지 확인 (4-2절) |
| `<iterate prepend="AND">` | prepend를 `<foreach>` **바깥 텍스트**로 꺼냄 | 빈 리스트면 `AND`만 남아 문법 오류 가능 → `<if test="ids != null and !ids.isEmpty()">`로 감싼다 |

> 주의: 빈 컬렉션일 때 iBATIS `<iterate>`가 prepend까지 생략하는지는 소스 수준 확인을 하지 않았다(미검증). 결론("변환 결과는 `<if>`로 감싸라")은 어느 쪽이든 안전하며, 7절 특성화 테스트의 "빈 리스트" 입력으로 확인한다.

---

## 2. 문법 대응표

### 설정·매퍼·파라미터

| iBATIS 2 | MyBatis 3 |
|----------|-----------|
| `<sqlMapConfig>` / `<settings x="y"/>`(속성) | `<configuration>` / `<settings><setting name="x" value="y"/></settings>` |
| `useStatementNamespaces="true"` | 삭제 — **네임스페이스는 필수** |
| sqlMap 파일 안의 `<typeAlias>` | config `<typeAliases>`로 이동 |
| `<transactionManager type="JDBC" commitRequired="false"><dataSource/></transactionManager>` | `<environments><environment><transactionManager/><dataSource/></environment></environments>` |
| 커스텀 `com.ibatis...DataSourceFactory#initialize(Map)` | `org.apache.ibatis.datasource.DataSourceFactory#setProperties(Properties)` |
| `<sqlMap namespace="Product">` | `<mapper namespace="...">` |
| `parameterClass` / `resultClass` / `class`(resultMap·parameterMap) | `parameterType` / `resultType` / `type` |
| `#value#` · `#prop:VARCHAR#` · `$prop$` | `#{value}` · `#{prop,jdbcType=VARCHAR}` · `${prop}` |
| `jdbcType="ORACLECURSOR"` / `"NUMBER"` | `"CURSOR"` / `"NUMERIC"` |
| `<selectKey type="pre">`/`"post"` | `<selectKey order="BEFORE">`/`"AFTER"` |
| `<parameterMap>` | 사용 가능하나 **deprecated** — 인라인 `#{prop,mode=OUT,jdbcType=...}` 권장 |
| `columnIndex` | 없음 |

> Mapper 인터페이스로 바인딩하려면 namespace를 짧은 이름(`Product`)에서 **인터페이스 FQCN**으로 바꿔야 한다. 짧은 statement id가 여러 매퍼에서 겹치면 "ambiguous" 오류가 난다. namespace 간 resultMap 참조(`Products.subProductsRM`)가 있으면 참조 대상부터 옮긴다.

### 프로시저·캐시

- `<procedure>`는 없어졌고 `<select>`·`<insert>`·`<update>` + `statementType="CALLABLE"`. 값을 돌려받는 insert 프로시저를 `<select>`로 쓸 때는 `useCache="false"`·`flushCache="true"`를 주고 커밋을 강제해야 한다. OUT 커서(`jdbcType=CURSOR`) 파라미터에는 `resultMap` 지정 필요.
- `<cacheModel><flushInterval hours="24"/>` → `<cache flushInterval="86400000"/>`(**시간 → 밀리초**). `<flushOnExecute>`는 statement의 `flushCache` 속성으로 대체. `<cache>`가 선언된 매퍼에서는 **모든 select가 기본으로 캐시를 쓴다**. `<cache>` 기본값 eviction LRU · size 1024 · readOnly false · flushInterval 없음.

### 동적 SQL

| iBATIS 2 | MyBatis 3 (`test`는 OGNL) | 도구 변환식 |
|----------|---------------------------|-------------|
| `<isNull>` / `<isNotNull property="p">` | `p == null` / `p != null` | 동일 (`a.b`면 `a != null and a.b != null`) |
| `<isEmpty property="p">` | `p == null or p == ''` (컬렉션이면 `p == null or p.isEmpty()`) | 문자열식만 생성 |
| `<isNotEmpty property="p">` | 문자열 `p != null and p != ''` / 컬렉션 `p != null and !p.isEmpty()` / 숫자 `p != null` | `p != null and p != ''` **고정** → 4-1절 |
| `<isEqual compareValue="Y">` | `<if test='p == "Y"'>` | 숫자 아니면 `"Y"`로 감쌈 |
| `<isNotEqual>`·`<isGreaterThan>`·`<isLessThan>`·`<isLessEqual>`, `compareProperty="q"` | `!=`·`>`·`<`·`<=`(XML에선 `&lt;`/`lt`), `p == q` | 동일 |
| `<iterate conjunction=",">#ids[]#` | `<foreach collection="ids" item="item" separator=",">#{item}` | `conjunction`→`separator` |
| 그 외 `<dynamic prepend="X" open="(" close=")">` | `<trim prefix="X (" suffix=")" prefixOverrides="AND |OR ">` | **수동** |
| `<isPropertyAvailable>`·`<isParameterPresent>` | 대응 태그 없음 → `_parameter` 등으로 OGNL | **수동** |

- iBATIS `<dynamic>`은 "참이 된 첫 자식의 prepend"를 제거한다. MyBatis `<where>`는 **선두 `AND `/`OR `만** 제거 — 자식 prepend가 `,` 등이면 `<trim prefixOverrides=",">`.
- 파라미터 자체가 List/배열이면(`property` 없는 iterate) MyBatis는 Map으로 감싸 `collection`·`list`·`array` 키로 노출 → `collection="list"`/`"array"`. 3.5.5+에서 `useActualParamName`이 켜져 있으면 실제 파라미터 이름도 쓸 수 있다.

---

## 3. 구조 차이 — null·캐시

| 항목 | iBATIS 2 | MyBatis 3 |
|------|----------|-----------|
| null 파라미터(jdbcType 미지정) | `ParameterMap`이 드라이버를 보고 `Types.NULL` 등으로 `setNull` | 설정 `jdbcTypeForNull` 기본값 **`OTHER`** → Oracle 드라이버는 `Invalid column type: 1111` |
| 결과 컬럼 null | `nullValue`로 대체값 | `nullValue` 없음. `callSettersOnNulls` 기본 false |
| 캐시 | `cacheModel` + `cacheModelsEnabled` | `<cache>` + 전역 `cacheEnabled`(기본 true) |

Oracle 프로젝트는 첫 단계에서 `mybatis.configuration.jdbc-type-for-null: NULL`(전역) 또는 null 가능 파라미터마다 `#{prop,jdbcType=VARCHAR}` 명시 중 하나를 정한다.

---

## 4. 의미가 바뀌는 지점 — 자동 변환 후 반드시 손볼 것

### 4-1. `isNotEmpty` / `isEmpty` — 숫자 0과 컬렉션

iBATIS 2 `IsEmptyTagHandler` 원문:
```java
if (value instanceof Collection) return ((Collection) value).isEmpty();
if (value != null && value.getClass().isArray()) return Array.getLength(value) == 0;
return value == null || String.valueOf(value).isEmpty();
```
- iBATIS: 숫자 `0`은 `"0"`이므로 **비어 있지 않음** → 조건 포함. 컬렉션은 크기로 판정.
- 변환 결과 `p != null and p != ''`: OGNL에서 숫자 0과 `''` 비교가 같다고 평가되어 **`0`이면 조건이 빠진다**. 컬렉션도 크기를 보지 않는다.
- 처방: 숫자는 `p != null`만, 컬렉션은 `p != null and !p.isEmpty()`, 문자열만 `p != null and p != ''`.

> 주의: "OGNL에서 0 == '' 가 참" 동작은 OGNL 공식 언어 가이드에 명시 문장이 아니라 MyBatis 사용자 사례 다수로 확인한 것이다. 특성화 테스트로 실제 동작을 확인한다.

### 4-2. 비교식 — 문자열/숫자/한 글자

- OGNL: 작은따옴표 안 **한 글자는 Character 리터럴**. 손으로 `test="flag == 'Y'"`라고 쓰면 String과 Character 비교가 되어 오동작하거나 `NumberFormatException` → `test='flag == "Y"'` 또는 `test="flag == 'Y'.toString()"`.
- 도구는 `compareValue`가 숫자로 읽히면 따옴표 없이 넣는다(`status == 1`). iBATIS는 `compareValue`를 **프로퍼티 타입으로 변환해** 비교했지만(`ConditionalTagHandler.compareValues`), OGNL은 문자열을 숫자로 바꾸려 하므로 프로퍼티가 `"A"` 같은 문자열이면 예외 → 문자열 코드값이면 `test='status == "1"'`.

### 4-3. `#` vs `$`

`${prop}`은 문자열 치환 그대로다(SQL 인젝션 위험). 변환 후 `grep -n '\${' destination/*.xml`로 전수 확인하고, 정렬 컬럼명처럼 불가피한 곳만 **화이트리스트 검증** 후 남긴다.

---

## 5. Java 쪽 전환

| iBATIS 2 (`SqlMapClient` / `SqlMapExecutor`) | MyBatis 3 (`SqlSession` / Mapper) | 차이 |
|---------------------------------------------|-----------------------------------|------|
| `SqlMapClient` · `SqlMapClientBuilder` | `SqlSessionFactory` · `SqlSessionFactoryBuilder` | |
| Spring `SqlMapClientTemplate` · `SqlMapClientDaoSupport` | `SqlSessionTemplate` · `SqlSessionDaoSupport` → 최종적으로 **Mapper 인터페이스 주입** | |
| `queryForObject(id, param)` | `selectOne` | MyBatis selectOne은 2건 이상이면 예외 |
| `queryForList(id, param, skip, max)` | `selectList(id, param, new RowBounds(skip, max))` | RowBounds는 드라이버 따라 비효율 — SQL 페이징 권장 |
| `queryForMap(id, param, keyProp)` · `queryWithRowHandler` | `selectMap(id, param, mapKey)` · `select(id, param, ResultHandler)` | |
| `insert(id, param)` → **Object(생성 키)** | `insert(id, param)` → **int(영향 행 수)**, 키는 `selectKey`/`useGeneratedKeys`로 파라미터 객체 프로퍼티에 채워짐 | 반환값을 키로 쓰던 호출부는 반드시 수정 |
| `startBatch()` / `executeBatch()` | `ExecutorType.BATCH` 세션 + `flushStatements()` → `List<BatchResult>` | |
| `TypeHandlerCallback` (`setParameter(ParameterSetter, Object)` / `getResult(ResultGetter)` / `valueOf(String)`) | `TypeHandler<T>` — 보통 `BaseTypeHandler<T>` (`setNonNullParameter` / `getNullableResult` ×3) | 시그니처가 다름 — 로직만 옮긴다 |

### Spring 버전 제약

- Spring `org.springframework.orm.ibatis`(`SqlMapClientTemplate`·`SqlMapClientFactoryBean`)는 **3.2에서 deprecated, 4.0에서 제거**됐다.
- Spring 4+ 위에서 iBATIS 2를 돌리려면 `org.mybatis:mybatis-2-spring`(Spring ORM 3.2.x 코드 복사본, 패키지명 `org.springframework.orm.ibatis` 유지). 1.3.0 = Java 11·Spring 5~7, **1.4.0+ = Java 17·Spring 6+**.
- iBATIS 본체 `org.mybatis:mybatis2` — 2.7.x 이하 javax, **2.8.x 이상 Jakarta·javax 모두 지원**. Spring Boot 3(Jakarta)에서 공존하려면 2.8.x + mybatis-2-spring 1.4.x.

---

## 6. 공존 — 같은 DataSource · 같은 트랜잭션 매니저

공식 `ibatis-2` README: *"Both mybatis (ibatis) 2 and mybatis 3 can be used together."* (`com.ibatis.*` vs `org.apache.ibatis.*`라 클래스 충돌 없음.)

- MyBatis-Spring: *"The DataSource specified for the transaction manager **must** be the same one that is used to create the SqlSessionFactoryBean or transaction management will not work."*
- iBATIS `SqlMapClientFactoryBean`은 기본으로 DataSource를 `TransactionAwareDataSourceProxy`로 감싸 Spring 트랜잭션에 참여한다 → **DataSource 빈 하나 + 트랜잭션 매니저 하나**면 한 `@Transactional` 안에서 iBATIS DAO와 Mapper가 같은 커넥션·커밋 경계를 공유한다. 스타터는 기존 `DataSource`를 감지해 `SqlSessionFactory`를 만들므로 iBATIS 쪽에도 **같은 DataSource 빈**을 주입하면 된다.
- iBATIS 전용 트랜잭션 매니저·DataSource를 따로 만들면 **한쪽만 롤백**되는 사고가 난다. 멀티 DB면 짝을 맞춘다 → `spring-multi-datasource-oracle-mysql`.
- Spring 관리 SqlSession/Mapper에서 `commit()`/`rollback()` 직접 호출은 `UnsupportedOperationException` → `@Transactional`/`TransactionTemplate`.
- `cacheModel`과 `<cache>`는 서로를 모른다 → 같은 테이블을 갱신하는 statement가 양쪽에 있으면 캐시를 끄거나 flush를 맞춘다.
- 옮기는 순서: 참조가 얕은 sqlMap부터, sqlMap 1개 = 커밋 1개, 조회 먼저·쓰기·프로시저·배치 나중.

### mybatis-spring-boot-starter 대응

| Starter | MyBatis-Spring | Spring Boot | Java | 비고 |
|---------|----------------|-------------|------|------|
| 4.1.x (master) | 4.1 | 4.1 | 17+ | GitHub README·4.1.0 릴리스(2026-07) 기준 |
| 4.0.x | 4.0 | 4.0 | 17+ | |
| 3.0.x | 3.0 | 3.2 – 3.5 | 17+ | 최신 3.0.5 |
| 2.3.x | 2.1 | 2.7 | 8+ | 최신 2.3.2 |
| 2.2 (EOL) | 2.0.6+ | 2.5 – 2.7 | 8+ | |
| 2.1 (EOL) | 2.0.6+ | 2.1 – 2.4 | 8+ | |

> 주의: mybatis.org 문서 사이트 표는 4.0까지만 싣고 있고, 4.1 행은 GitHub README(`master : ... MyBatis-Spring 4.1 ... Spring Boot 4.1`)와 릴리스 태그로 확인했다(2026-10-08).

Spring Boot 2.5~2.6 레거시라면 2.2.x(EOL) 또는 Boot 2.7로 올린 뒤 2.3.x.

---

## 7. 변환 후 동등성 검증 — 깨지기 쉬운 입력

자동 변환은 "XML이 DTD를 통과한다"까지만 보장한다. iBATIS 실행 결과·실행 SQL·바인딩 값을 스냅숏으로 고정하고 같은 입력으로 Mapper를 비교한다(쓰기는 롤백 트랜잭션 안에서 영향 행 수·생성 키 비교).

| 깨지기 쉬운 지점 | 확인 입력 |
|-----------------|-----------|
| `isNotEmpty` 변환 | 숫자 `0`, 빈 리스트 |
| `isEqual` 변환 | 한 글자 코드값, 숫자처럼 보이는 문자열 코드(`"01"`) |
| `<dynamic>`/`<iterate>` prepend | 모든 조건 false, 첫 조건만 false, 빈 리스트 |
| null 파라미터 (Oracle) | jdbcType 없는 파라미터에 `null` |
| `insert` 반환값 | 생성 키를 쓰던 호출부 |
| `groupBy` → `<collection>` | 자식 0건·여러 건 부모, `<id>` 누락 시 행 중복 |
| `${}` 잔존 | `' OR '1'='1`·`; DROP` 류 페이로드 → 화이트리스트에서 거부되는지 |

완료 기준: 콘솔 "Sorry, I can't migrate" 목록 0건 + 특성화 테스트 통과 + 원본 cacheModel 목록과 `<cache>`·`useCache`·`flushCache` 대조.
