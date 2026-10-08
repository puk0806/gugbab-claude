---
name: ibatis-to-mybatis-migration
description: iBATIS 2(sqlMap)를 MyBatis 3(mapper)로 옮기는 경로 가이드 — 공식 변환 도구 ibatis2mybatis(XSLT+텍스트 치환, Ant/Maven) 실행·한계, sqlMapConfig/sqlMap/동적 태그/procedure/cacheModel/groupBy 문법 대응표, SqlMapClient(Template)→SqlSessionTemplate·Mapper 인터페이스·TypeHandler 전환, iBATIS 2와 MyBatis 3 공존 점진 전환(트랜잭션 매니저 공유), Spring Boot별 mybatis-spring-boot-starter 대응, 변환 후 SQL·결과 동등성 검증과 흔한 실수(isNotEmpty 의미 차이·OGNL 비교식·null jdbcType·$ 인젝션)
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
> 검증일: 2026-10-08

> 주의: 이 스킬은 **경로(path) 스킬**이다. 목적지인 MyBatis 3 매퍼 작성법(Mapper 인터페이스·XML·`<if>`/`<where>`/`<foreach>` 세부·resultMap·페이징·Spring Boot 설정)은
> `backend/mybatis-mapper-patterns` 스킬이 담당한다. 이 문서는 "iBATIS 2의 무엇이 MyBatis 3의 무엇이 되는가, 어떤 순서로, 무엇이 자동 변환에서 새는가"만 다룬다.

> 기준 버전 (2026-10-08 확인): iBATIS 2 유지보수판 `org.mybatis:mybatis2` 2.8.1(2026-07) · `org.mybatis:mybatis-2-spring` 1.4.2(2026-07) ·
> MyBatis 3.5.19 · `mybatis-spring-boot-starter` 2.3.2 / 3.0.5 / 4.0.1 / 4.1.0 · 변환 도구 `ibatis2mybatis` 1.0.0-SNAPSHOT(정식 릴리스 없음, master 소스 기준)

---

## 0. 언제 쓰나 / 언제 안 쓰나

| 상황 | 이 스킬 |
|------|---------|
| `<sqlMap>`·`#value#`·`<isNotNull>`·`SqlMapClientTemplate`이 남은 코드를 MyBatis 3로 옮김 | ✅ |
| iBATIS 2를 유지한 채 Spring 4+ / Spring Boot로만 올리고 싶음 | ✅ (7절 `mybatis-2-spring` 경로) |
| 이미 MyBatis 3인 매퍼의 동적 SQL·resultMap 작성법 | ❌ → `mybatis-mapper-patterns` |
| Spring Boot 2 → 3 업그레이드 자체 | ❌ → `spring-boot-2-to-3-migration` (이 스킬은 그 중 "iBATIS 잔재 제거" 단계에 끼워 쓴다) |

**권장 순서 요약**
1. 기준 동작 고정: 옮길 statement별로 "입력 → 실행 SQL·바인딩 값 → 결과"를 기록하는 특성화 테스트를 먼저 만든다 (9절)
2. 공존 구성: iBATIS 2와 MyBatis 3를 **같은 DataSource·같은 트랜잭션 매니저** 위에 동시에 띄운다 (7절)
3. sqlMap 파일 단위로 변환 도구 실행 → 콘솔 보고 항목·의미 차이 수동 보정 (2~5절)
4. Java 호출부를 파일 단위로 `SqlMapClientTemplate` → Mapper 인터페이스로 전환 (6절)
5. 특성화 테스트 통과 확인 후 해당 sqlMap 삭제 → 반복 → 마지막에 iBATIS 의존성 제거

---

## 1. 공식 변환 도구 ibatis2mybatis

### 1-1. 무엇을 하는 도구인가

- MyBatis 조직이 관리하는 레포(`mybatis/ibatis2mybatis`, Apache 2.0). README 원문: *"The tool is designed around an xslt transformation and some text replacements packaged in an ant task and tries to deliver a good starting point before the more complex work begins."*
- 제작자(Peter Köhler) 스스로 *"this initial version is by no means perfect yet"*라고 적었다 — **출발점 생성기**이지 완성 변환기가 아니다.
- 변환 못 한 요소는 **콘솔에 보고**하고(`Sorry, I can't migrate ...`), 일부는 결과 파일에 XML 주석으로 남긴다.

### 1-2. 실행 절차

```bash
git clone https://github.com/mybatis/ibatis2mybatis.git
cd ibatis2mybatis
# 1) 옮길 iBATIS 2 sqlMap XML을 source/ 에 복사 (최상위에 평평하게 — 아래 주의 참고)
cp /path/to/legacy/sqlmap/*.xml source/
# 2-a) Ant가 있으면
ant            # 기본 타깃 migrateToMyBatis3
# 2-b) Ant 없이 Maven으로 (maven-antrun-plugin이 build.xml을 호출, prepare-package 단계)
./mvnw clean install
# 3) 결과: destination/*.xml  + 콘솔의 "Sorry, I can`t migrate" 목록을 반드시 저장
./mvnw clean install 2>&1 | tee migrate-report.txt
```

`build.xml`이 실제로 하는 일 (원문 확인):

| 순서 | 동작 | 결과/주의 |
|------|------|-----------|
| 1 | `destination/*.xml` 삭제 | **매 실행마다 이전 결과가 지워진다** — 수동 보정본을 destination에 두지 말 것 |
| 2 | `source/*.xml`에 `migrate.xslt` 적용 | `includes="*.xml"` — **하위 폴더는 처리하지 않음**. 폴더 구조가 있으면 평탄화해서 넣고 결과를 다시 배치 |
| 3 | `:NUMERIC#`·`:TIMESTAMP#`·`:VARCHAR#`·`:BLOB#` → `,jdbcType=...#` | 그 외 타입(`:CLOB#`·`:DATE#`·`:INTEGER#` 등)은 build.xml에 replace 줄을 **직접 추가**해야 함 |
| 4 | `$prop$` → `${prop}` (정규식) | 인젝션 위험 그대로 이전됨 (10절) |
| 5 | `#prop#` → `#{prop}` (정규식, 2글자 이상) | 1글자 프로퍼티명(`#a#`)은 정규식 `{2,}` 조건상 변환되지 않음 → 수동 확인 |
| 6 | `xyz[]` → `item` | `<iterate>` 안의 `#list[]#` 류를 `foreach item="item"`에 맞춤 |
| 7 | MyBatis 3 DTD로 `xmlvalidate` (`failonerror="yes"`) | 남은 iBATIS 전용 요소가 있으면 **빌드 실패** → 실패 메시지가 곧 수동 작업 목록 |

> 주의: 도구는 sqlMap(매퍼)과 sqlMapConfig(설정) 템플릿을 모두 갖고 있지만, Spring 환경에서는 설정 파일 대신 Spring/Boot 설정으로 옮기는 경우가 대부분이다. 설정 변환 결과는 참고용으로만 쓴다.

### 1-3. 도구가 변환하지 못하거나 의미를 바꾸는 것 (migrate.xslt 원문 기준)

| iBATIS 2 요소 | 도구 동작 | 해야 할 일 |
|---------------|-----------|------------|
| `<result nullValue=...>` / `columnIndex` / `notNullColumn` | 콘솔 보고, 속성 버림 | `nullValue`는 SQL `NVL/COALESCE` 또는 TypeHandler로 재현 |
| `<statement>` · `<cacheModel>` · sqlMap 안 `<typeAlias>` · `<isPropertyAvailable>` · `<isNotPropertyAvailable>` · `<isParameterPresent>` · `<isNotParameterPresent>` · config `<properties>` | 주석+콘솔 보고 후 **내용 누락** | 2절 대응표대로 수동 작성 (cacheModel→`<cache>`, typeAlias→config `<typeAliases>` 또는 Boot `type-aliases-package`) |
| `<dynamic prepend="WHERE">` / `"SET"` (대소문자 정확히 `WHERE`/`where`/`SET`/`set`) | `<where>` / `<set>` | 자동 |
| 그 외 `<dynamic>` (prepend 없음, `AND`, `,` 등) | 변환되지 않음 — XSLT의 해당 분기는 MyBatis에 없는 `<dynamic>` 요소를 내보내고, `dynamic`은 "변환 불가" 목록에도 들어 있어 주석+콘솔 보고로 끝날 수도 있다 | `<trim prefix=... prefixOverrides=...>`로 수동 변환 (3절) |
| `<result resultMap="...">` | **항상 `<collection>`**으로 변환 | 1:1(has-one)이면 `<association>`으로 고쳐야 함 (위키: 중첩 resultMap은 `<association>`) |
| `<result select="...">` | `<association select=...>` | 1:N이면 `<collection>`으로 |
| `<procedure>` | `<update statementType="CALLABLE">` | 결과를 받는 프로시저는 `<select statementType="CALLABLE">`로 바꾸는 것을 검토 (2-4절) |
| `<resultMap groupBy="id">` | `groupBy` 무시 | `<id>` 요소 지정 + 자식은 `<collection>` (2-3절) |
| `<isEqual compareValue="...">` 등 비교 태그 | `compareValue`가 숫자로 읽히면 따옴표 없이, 아니면 `"..."`로 감싼 OGNL | 프로퍼티 타입과 맞는지 확인 (5절) |

---

## 2. 문법 대응표 (공식 위키 + migrate.xslt)

### 2-1. 설정 파일

| iBATIS 2 | MyBatis 3 |
|----------|-----------|
| `<!DOCTYPE sqlMapConfig ...>` | `<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN" "http://mybatis.org/dtd/mybatis-3-config.dtd">` |
| `<sqlMapConfig>` | `<configuration>` |
| `<settings x="y" foo="bar"/>` (속성) | `<settings><setting name="x" value="y"/>...</settings>` (자식 요소) |
| `useStatementNamespaces="true"` | 삭제 — **네임스페이스는 필수** |
| sqlMap 파일 안의 `<typeAlias>` | `<configuration><typeAliases><typeAlias .../></typeAliases>` 로 이동 |
| `<transactionManager type="JDBC" commitRequired="false"><dataSource .../></transactionManager>` | `<environments default="env"><environment id="env"><transactionManager type="JDBC">...</transactionManager><dataSource .../></environment></environments>` |
| `<sqlMap resource="..."/>` 나열 | `<mappers><mapper resource="..."/></mappers>` |
| 커스텀 `com.ibatis...DataSourceFactory#initialize(Map)` | `org.apache.ibatis.datasource.DataSourceFactory#setProperties(Properties)` |

### 2-2. 매퍼 파일 · 파라미터

| iBATIS 2 | MyBatis 3 |
|----------|-----------|
| `<!DOCTYPE sqlMap ...>` / `<sqlMap namespace="Product">` | `<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">` / `<mapper namespace="...">` |
| `parameterClass` | `parameterType` |
| `resultClass` | `resultType` |
| `class` (resultMap·parameterMap) | `type` |
| `#value#` · `#prop#` | `#{value}` · `#{prop}` |
| `#prop:VARCHAR#` (인라인 jdbcType) | `#{prop,jdbcType=VARCHAR}` |
| `$prop$` | `${prop}` |
| `jdbcType="ORACLECURSOR"` | `jdbcType="CURSOR"` |
| `jdbcType="NUMBER"` | `jdbcType="NUMERIC"` |
| `<selectKey type="pre">` / `type="post"` · `resultClass` | `<selectKey order="BEFORE">` / `order="AFTER"` · `resultType` |
| `<parameterMap>` | 그대로 사용 가능하나 **deprecated** — 인라인 `#{prop,mode=OUT,jdbcType=...}` 권장 |

> Mapper 인터페이스로 바인딩하려면 namespace를 짧은 이름(`Product`)에서 **인터페이스 FQCN**으로 바꿔야 한다(getting-started: namespace가 인터페이스 정규 이름과 일치해야 인터페이스 바인딩 가능). 짧은 statement id가 여러 매퍼에서 겹치면 "ambiguous" 오류가 난다.

### 2-3. resultMap

```xml
<!-- iBATIS 2 -->
<resultMap id="productRM" class="product" groupBy="id">
  <result property="id" column="product_id"/>
  <result property="name" column="product_name"/>
  <result property="subProducts" resultMap="Products.subProductsRM"/>   <!-- 1:N -->
  <result property="client" resultMap="Client.clientRM"/>               <!-- 1:1 -->
</resultMap>

<!-- MyBatis 3 -->
<resultMap id="productRM" type="product">
  <id     property="id"   column="product_id"/>                          <!-- groupBy 대신 <id> -->
  <result property="name" column="product_name"/>
  <collection  property="subProducts" resultMap="Products.subProductsRM"/>
  <association property="client"      resultMap="Client.clientRM"/>
</resultMap>
```

- `columnIndex` 속성은 MyBatis 3에 없다.
- `groupBy`는 제거되고 `<collection>`으로 대체된다. 부모 행 묶음 기준을 MyBatis가 알 수 있도록 `<id>`를 반드시 지정한다(세부는 `mybatis-mapper-patterns` resultMap 절).

### 2-4. 프로시저 · 캐시

```xml
<!-- iBATIS 2 -->
<procedure id="getValues" parameterMap="getValuesPM">{ ? = call pkg.get_values(?) }</procedure>
<cacheModel id="productCache" type="LRU">
  <flushInterval hours="24"/>
  <flushOnExecute statement="Product.update"/>
</cacheModel>

<!-- MyBatis 3 -->
<select id="getValues" parameterMap="getValuesPM" statementType="CALLABLE">{ ? = call pkg.get_values(?) }</select>
<cache flushInterval="86400000" eviction="LRU"/>          <!-- 시간 → 밀리초, LRU는 기본값이라 생략 가능 -->
```

- 위키: `<procedure>`는 없어졌고 `<select>`·`<insert>`·`<update>` + `statementType="CALLABLE"`을 쓴다. 값을 돌려받는 insert 프로시저를 `<select>`로 쓸 때는 `useCache="false"`·`flushCache="true"`를 주고 커밋을 강제해야 한다.
- 변환 도구는 `<procedure>`를 일률적으로 `<update statementType="CALLABLE">`로 만든다 — OUT 커서로 목록을 받는 프로시저는 `<select>`로 바꾸고, `jdbcType=CURSOR` OUT 파라미터에는 `resultMap` 지정이 필요하다(sqlmap-xml 문서).
- 캐시: `<flushOnExecute>`는 statement의 `flushCache` 속성으로 대체되고, `<cache>`가 선언된 매퍼에서는 모든 select가 기본으로 캐시를 쓴다. `<cache>` 기본값은 eviction LRU · size 1024 · readOnly false · flushInterval 없음.

---

## 3. 동적 SQL 대응

| iBATIS 2 | MyBatis 3 (`test`는 OGNL) | 도구 변환식 |
|----------|---------------------------|-------------|
| `<isNull property="p">` | `<if test="p == null">` | 동일 |
| `<isNotNull property="p">` | `<if test="p != null">` | 동일 (`a.b`면 `a != null and a.b != null`) |
| `<isEmpty property="p">` | `<if test="p == null or p == ''">` (컬렉션이면 `p == null or p.isEmpty()`) | 문자열식만 생성 |
| `<isNotEmpty property="p">` | 문자열: `<if test="p != null and p != ''">` / 컬렉션: `<if test="p != null and !p.isEmpty()">` / 숫자: `<if test="p != null">` | `p != null and p != ''` **고정** → 5절 의미 차이 |
| `<isEqual property="p" compareValue="Y">` | `<if test='p == "Y"'>` | 숫자 아니면 `"Y"`로 감쌈 |
| `<isNotEqual>` · `<isGreaterThan>` · `<isLessThan>` · `<isLessEqual>` | `!=` · `>` · `<` · `<=` (XML 안에서는 `&lt;` 또는 `lt`/`lte`) | 동일 |
| `compareProperty="q"` | `test="p == q"` | 동일 |
| `<dynamic prepend="WHERE">` + 자식 `prepend="AND"` | `<where>` + 자식 본문 앞 `AND` | 자식 prepend를 본문 텍스트로 넣음 → `<where>`가 선두 AND/OR 제거 |
| `<dynamic prepend="SET">` | `<set>` | 동일 |
| 그 외 `<dynamic prepend="X" open="(" close=")">` | `<trim prefix="X (" suffix=")" prefixOverrides="AND |OR ">` | **수동** |
| `<iterate property="ids" open="(" close=")" conjunction=",">#ids[]#</iterate>` | `<foreach collection="ids" item="item" open="(" separator="," close=")">#{item}</foreach>` | `conjunction`→`separator`, `xyz[]`→`item` |
| `<isPropertyAvailable>` · `<isParameterPresent>` | 직접 대응 태그 없음 → `_parameter` 등으로 OGNL 작성 | **수동** |

```xml
<!-- iBATIS 2 -->
<select id="search" parameterClass="map" resultClass="product">
  SELECT * FROM product
  <dynamic prepend="WHERE">
    <isNotEmpty prepend="AND" property="name">name LIKE #name#</isNotEmpty>
    <isEqual    prepend="AND" property="status" compareValue="Y">status = 'Y'</isEqual>
    <iterate    prepend="AND" property="ids" open="id IN (" close=")" conjunction=",">#ids[]#</iterate>
  </dynamic>
</select>

<!-- MyBatis 3 -->
<select id="search" parameterType="map" resultType="product">
  SELECT * FROM product
  <where>
    <if test="name != null and name != ''">AND name LIKE #{name}</if>
    <if test='status == "Y"'>AND status = 'Y'</if>
    <if test="ids != null and !ids.isEmpty()">
      AND id IN <foreach collection="ids" item="item" open="(" separator="," close=")">#{item}</foreach>
    </if>
  </where>
</select>
```

- iBATIS `<dynamic>`은 "참이 된 첫 자식의 prepend"를 제거한다. MyBatis `<where>`는 결과가 비면 WHERE를 넣지 않고 **선두 `AND `/`OR `만** 제거한다(`<trim prefix="WHERE" prefixOverrides="AND |OR ">`와 동등). 자식 prepend가 `,` 등이면 `<trim prefixOverrides=",">`를 쓴다.
- 변환 도구는 `<iterate>`의 prepend를 `<foreach>` **바깥 텍스트**로 꺼내 놓는다(`migrate.xslt`의 iterate 템플릿). 그래서 빈 리스트가 들어오면 foreach는 아무것도 출력하지 않아도 바깥의 `AND` 같은 조각이 남아 SQL 문법 오류가 날 수 있다 → 위 예처럼 `<if>`로 감싼다.

> 주의: 빈 컬렉션일 때 iBATIS `<iterate>`가 prepend까지 생략하는지는 소스 수준 확인을 하지 않았다(미검증). 결론("변환 결과는 `<if>`로 감싸라")은 어느 쪽이든 안전하며, 9절 특성화 테스트의 "빈 리스트" 입력으로 확인한다.
- 파라미터 자체가 List/배열이면(`property` 없는 iterate) MyBatis는 이를 Map으로 감싸 `collection`·`list`(List일 때)·`array`(배열일 때) 키로 노출한다 → `collection="list"` 또는 `collection="array"`로 지정. 3.5.5+에서 `useActualParamName`이 켜져 있으면 실제 파라미터 이름도 쓸 수 있다.

---

## 4. 설정·문법 외 구조 차이

| 항목 | iBATIS 2 | MyBatis 3 |
|------|----------|-----------|
| null 파라미터(jdbcType 미지정) | `ParameterMap`이 드라이버를 보고 `Types.NULL` 등으로 `setNull` | 설정 `jdbcTypeForNull` 기본값 **`OTHER`** → Oracle 드라이버는 `Invalid column type: 1111` |
| 결과 컬럼 null | `nullValue`로 대체값 지정 가능 | `nullValue` 없음. `callSettersOnNulls` 기본 false |
| 캐시 | `cacheModel` + `cacheModelsEnabled` | `<cache>` + 전역 `cacheEnabled`(기본 true) |

Oracle을 쓰는 프로젝트는 전환 첫 단계에서 아래 중 하나를 정한다.

```yaml
# Spring Boot
mybatis:
  configuration:
    jdbc-type-for-null: NULL     # 전역 — iBATIS의 null 동작에 가깝게
```
또는 null이 올 수 있는 파라미터마다 `#{prop,jdbcType=VARCHAR}`처럼 명시한다.

---

## 5. 의미가 바뀌는 지점 — 자동 변환 후 반드시 손볼 것

### 5-1. `isNotEmpty` / `isEmpty` — 숫자 0과 컬렉션

iBATIS 2 `IsEmptyTagHandler` 원문:
```java
if (value instanceof Collection) return ((Collection) value).isEmpty();
if (value != null && value.getClass().isArray()) return Array.getLength(value) == 0;
return value == null || String.valueOf(value).isEmpty();
```
- iBATIS: 숫자 `0`은 `"0"`이므로 **비어 있지 않음** → 조건 포함. 컬렉션은 크기로 판정.
- 변환 결과 `p != null and p != ''`: OGNL에서 숫자 0과 `''` 비교가 같다고 평가되어 **`0`이면 조건이 빠진다**(MyBatis 커뮤니티에서 반복 보고되는 함정). 컬렉션도 크기를 보지 않는다.
- 처방: 숫자 타입 프로퍼티는 `p != null`만, 컬렉션은 `p != null and !p.isEmpty()`(또는 `p.size() > 0`), 문자열만 `p != null and p != ''`.

> 주의: "OGNL에서 0 == '' 가 참" 동작은 OGNL 공식 언어 가이드에 명시 문장이 아니라 MyBatis 사용자 사례 다수로 확인한 것이다. 특성화 테스트로 실제 동작을 확인한다.

### 5-2. 비교식 — 문자열/숫자/한 글자

- OGNL 언어 가이드: 작은따옴표 안 **한 글자는 Character 리터럴**, 두 글자 이상·큰따옴표는 String. 그래서 손으로 `test="flag == 'Y'"`라고 쓰면 String과 Character 비교가 되어 의도대로 동작하지 않거나 `NumberFormatException`이 난다 → `test='flag == "Y"'` 또는 `test="flag == 'Y'.toString()"`.
- 변환 도구는 `compareValue`가 숫자로 읽히면 따옴표 없이 넣는다(`status == 1`). iBATIS는 `compareValue`를 **프로퍼티 타입으로 변환해** 비교했지만(`ConditionalTagHandler.compareValues`), OGNL은 숫자 리터럴과 비교할 때 문자열을 숫자로 바꾸려 하므로 프로퍼티가 `"A"` 같은 문자열이면 예외가 난다. 문자열 컬럼 코드값이면 `test='status == "1"'`로 고친다.

### 5-3. `#` vs `$`

`$prop$` → `${prop}`은 그대로 문자열 치환이다. MyBatis 문서: 사용자 입력을 수정 없이 `${}`에 넣으면 SQL 인젝션 위험 → 사용자 입력은 막거나 직접 이스케이프·검사하라. 변환 후 `grep -n '\${' destination/*.xml`로 전수 확인하고, 정렬 컬럼명처럼 불가피한 곳만 **화이트리스트 검증** 후 남긴다.

---

## 6. Java 쪽 전환

### 6-1. API 대응

| iBATIS 2 (`SqlMapClient` / `SqlMapExecutor`) | MyBatis 3 (`SqlSession` / Mapper) | 차이 |
|---------------------------------------------|-----------------------------------|------|
| `SqlMapClient` · `SqlMapClientBuilder` | `SqlSessionFactory` · `SqlSessionFactoryBuilder` | 위키: SqlMapClient는 더 이상 없음 |
| Spring `SqlMapClientTemplate` · `SqlMapClientDaoSupport` | `SqlSessionTemplate` · `SqlSessionDaoSupport` → 최종적으로 **Mapper 인터페이스 주입** | SqlSessionTemplate은 스레드 안전, Spring `DataAccessException`으로 예외 변환 |
| `queryForObject(id, param)` | `selectOne(id, param)` / `mapper.find(param)` | MyBatis selectOne은 2건 이상이면 예외 |
| `queryForList(id, param)` | `selectList(id, param)` | |
| `queryForList(id, param, skip, max)` | `selectList(id, param, new RowBounds(skip, max))` | RowBounds는 드라이버에 따라 효율 차이 — SQL 페이징 권장(`mybatis-mapper-patterns`) |
| `queryForMap(id, param, keyProp)` | `selectMap(id, param, mapKey)` | |
| `queryWithRowHandler(id, param, RowHandler)` | `select(id, param, ResultHandler)` | |
| `insert(id, param)` → **Object(생성 키)** | `insert(id, param)` → **int(영향 행 수)**, 키는 `selectKey`/`useGeneratedKeys`로 파라미터 객체 프로퍼티에 채워짐 | 반환값을 키로 쓰던 호출부는 반드시 수정 |
| `update`/`delete` → int | `update`/`delete` → int | |
| `startBatch()` / `executeBatch()` | `ExecutorType.BATCH` 세션 + `flushStatements()` → `List<BatchResult>` | |
| `TypeHandlerCallback` (`setParameter(ParameterSetter, Object)` / `getResult(ResultGetter)` / `valueOf(String)`) | `TypeHandler<T>` — 보통 `BaseTypeHandler<T>` 상속 (`setNonNullParameter` / `getNullableResult` ×3) | 메서드 시그니처가 다름 — 로직만 옮긴다 |

```java
// before — iBATIS 2 + Spring orm.ibatis
public class ProductDao extends SqlMapClientDaoSupport {
  public List<Product> search(Map<String, Object> cond) {
    return getSqlMapClientTemplate().queryForList("Product.search", cond);
  }
}

// after — MyBatis 3 Mapper 인터페이스 (XML namespace = 이 인터페이스 FQCN, id = 메서드명)
@Mapper
public interface ProductMapper {
  List<Product> search(Map<String, Object> cond);
}
```

### 6-2. Spring 버전 제약

- Spring의 `org.springframework.orm.ibatis`(`SqlMapClientTemplate`·`SqlMapClientFactoryBean` 등)는 **3.2에서 deprecated, 4.0에서 제거**됐다.
- Spring 4+ 위에서 iBATIS 2를 계속 돌리려면 MyBatis 조직의 `org.mybatis:mybatis-2-spring`(Spring ORM 3.2.x 코드 복사본, 패키지명 `org.springframework.orm.ibatis` 유지)을 쓴다. README 기준: 1.3.0 = Java 11·Spring 5~7, **1.4.0+ = Java 17·Spring 6+**.
- iBATIS 본체는 `org.mybatis:mybatis2` — 2.7.x 이하 javax, **2.8.x 이상 Jakarta·javax 모두 지원**. Spring Boot 3(Jakarta)에서 공존하려면 2.8.x + mybatis-2-spring 1.4.x 조합.

---

## 7. 점진 전환 — iBATIS 2와 MyBatis 3 공존

공식 `ibatis-2` README: *"Users are advised to upgrade to myBatis 3. Both mybatis (ibatis) 2 and mybatis 3 can be used together."* (패키지가 `com.ibatis.*` vs `org.apache.ibatis.*`로 분리돼 있어 클래스 충돌이 없다.)

### 7-1. 같은 DataSource · 같은 트랜잭션 매니저

- MyBatis-Spring: *"The DataSource specified for the transaction manager **must** be the same one that is used to create the SqlSessionFactoryBean or transaction management will not work."*
- iBATIS 쪽 `SqlMapClientFactoryBean`은 기본으로 DataSource를 `TransactionAwareDataSourceProxy`로 감싸 Spring 관리 트랜잭션에 참여하고, `DataSourceTransactionManager`·`JtaTransactionManager`와 함께 쓰도록 설계됐다.
- 따라서 **하나의 DataSource 빈 + 그 DataSource 기반 트랜잭션 매니저 하나**를 두면, 한 `@Transactional` 메서드 안에서 iBATIS DAO와 MyBatis Mapper를 섞어 호출해도 같은 커넥션·같은 커밋/롤백 경계를 공유한다.

```java
@Configuration
public class LegacyIbatisConfig {
  // iBATIS 2 — mybatis2 + mybatis-2-spring
  @Bean
  public SqlMapClientFactoryBean sqlMapClient(DataSource dataSource) {   // Boot가 만든 같은 DataSource
    SqlMapClientFactoryBean f = new SqlMapClientFactoryBean();
    f.setConfigLocation(new ClassPathResource("sqlmap/sql-map-config.xml"));
    f.setDataSource(dataSource);
    return f;
  }
  @Bean
  public SqlMapClientTemplate sqlMapClientTemplate(SqlMapClient sqlMapClient) {
    return new SqlMapClientTemplate(sqlMapClient);
  }
}
// MyBatis 3 — mybatis-spring-boot-starter가 같은 DataSource로 SqlSessionFactory·SqlSessionTemplate을 자동 생성
// application.yml: mybatis.mapper-locations=classpath:mapper/**/*.xml
```

주의할 점:
- **DataSource가 2개 이상**(멀티 DB)이면 iBATIS·MyBatis 각각이 어느 DataSource·어느 트랜잭션 매니저를 쓰는지 짝을 맞춘다 → `spring-multi-datasource-oracle-mysql` 스킬.
- 트랜잭션 매니저를 iBATIS 전용으로 따로 만들면(`DataSource`를 별도 생성 등) 같은 서비스 메서드 안에서 **한쪽만 롤백**되는 사고가 난다.
- Spring 관리 SqlSession/Mapper에서 `commit()`/`rollback()`을 직접 부르면 `UnsupportedOperationException` — iBATIS DAO에서 수동 트랜잭션을 쓰던 코드는 `@Transactional`/`TransactionTemplate`으로 바꾼다.
- 두 쪽 캐시(`cacheModel` vs `<cache>`)는 서로를 모른다 → 공존 기간에는 같은 테이블을 갱신하는 statement가 양쪽에 있으면 캐시를 끄거나 flush 설정을 맞춘다.

### 7-2. 옮기는 순서

1. 의존성 그래프가 얕은 sqlMap부터(다른 sqlMap의 resultMap·`<include>`를 참조하지 않는 파일) — `Products.subProductsRM`처럼 **namespace 간 참조**가 있으면 참조 대상부터 옮기거나 함께 옮긴다.
2. sqlMap 1개 = 커밋 1개: 변환 XML 추가 → Mapper 인터페이스 추가 → 해당 DAO 호출부 전환 → 특성화 테스트 통과 → iBATIS sqlMap·`<sqlMap resource>` 등록 삭제.
3. 조회 전용 statement를 먼저, 쓰기·프로시저·배치를 나중에.
4. 마지막 sqlMap이 빠지면 `mybatis2`·`mybatis-2-spring` 의존성과 설정 클래스를 제거.

---

## 8. Spring Boot 버전별 mybatis-spring-boot-starter

| Starter | MyBatis-Spring | Spring Boot | Java | 비고 |
|---------|----------------|-------------|------|------|
| 4.1.x (master) | 4.1 | 4.1 | 17+ | GitHub README·4.1.0 릴리스(2026-07) 기준 |
| 4.0.x | 4.0 | 4.0 | 17+ | |
| 3.0.x | 3.0 | 3.2 – 3.5 | 17+ | 최신 3.0.5 |
| 2.3.x | 2.1 | 2.7 | 8+ | 최신 2.3.2 |
| 2.2 (EOL) | 2.0.6+ | 2.5 – 2.7 | 8+ | |
| 2.1 (EOL) | 2.0.6+ | 2.1 – 2.4 | 8+ | |

> 주의: mybatis.org 문서 사이트 표는 4.0까지만 싣고 있고, 4.1 행은 GitHub README(`master : ... MyBatis-Spring 4.1 ... Spring Boot 4.1`)와 릴리스 태그로 확인했다(2026-10-08).

- Spring Boot 2.5~2.6 레거시라면 2.2.x(EOL) 또는 Boot 2.7로 올린 뒤 2.3.x. 의존성 선언·`application.yml` 설정은 `mybatis-mapper-patterns` "의존성 설정" 절을 따른다.
- 스타터는 기존 `DataSource`를 감지해 `SqlSessionFactory`·`SqlSessionTemplate`을 만들고 `@Mapper`를 스캔한다 → 7절 공존 구성에서 iBATIS 쪽에도 **같은 DataSource 빈**을 주입하면 된다.

---

## 9. 변환 후 검증 — 같은 입력, 같은 SQL, 같은 결과

자동 변환은 "XML이 DTD를 통과한다"까지만 보장한다. 의미 동등성은 테스트로 확인한다.
특성화 테스트 작성법 자체는 `characterization-testing` 스킬(설치된 경우)을 따른다.

1. **기준 수집 (전환 전)**: statement마다 대표 입력 세트를 만든다 — 정상값, `null`, 빈 문자열, 숫자 `0`, 빈 리스트, 원소 1개 리스트, 한 글자 코드값(`"Y"`), 특수문자·`'`가 든 문자열, 최대 길이.
2. iBATIS로 실행해 **결과(행 수·컬럼값·정렬)**와 **실행 SQL·바인딩 값**을 스냅숏으로 저장 (JDBC 로깅 프록시나 드라이버 로그 활용).
3. 같은 입력으로 MyBatis Mapper를 실행해 비교. SQL 문자열은 공백 정규화 후 비교하고, 결과는 정렬 키를 고정해 비교한다.
4. 쓰기 statement는 롤백되는 트랜잭션 안에서 실행 후 테이블 상태(영향 행 수·생성 키)를 비교한다.
5. 반드시 넣을 적대적 입력: `${}`가 남은 곳에 `' OR '1'='1`·`; DROP` 류 페이로드 → 화이트리스트에서 거부되는지, `#{}` 자리는 리터럴로 바인딩되는지.

| 깨지기 쉬운 지점 | 확인 입력 |
|-----------------|-----------|
| `isNotEmpty` 변환 | 숫자 `0`, 빈 리스트 |
| `isEqual` 변환 | 한 글자 코드값, 숫자처럼 보이는 문자열 코드(`"01"`) |
| `<dynamic>`/`<iterate>` prepend | 모든 조건 false, 첫 조건만 false, 빈 리스트 |
| null 파라미터 (Oracle) | jdbcType 없는 파라미터에 `null` |
| `insert` 반환값 | 생성 키를 쓰던 호출부 |
| `groupBy` → `<collection>` | 자식 0건·여러 건 부모, `<id>` 누락 시 행 중복 |

---

## 10. 흔한 실수

| 실수 | 결과 | 처방 |
|------|------|------|
| 도구 결과를 검토 없이 커밋 | `<dynamic>` 잔존으로 기동 실패, 또는 조용한 조건 누락 | 콘솔 "Sorry, I can't migrate" 목록 0건 + 특성화 테스트 통과를 완료 기준으로 |
| `destination/`에서 직접 수정 | 다음 실행 때 삭제됨 | 결과를 프로젝트로 복사한 뒤 수정 |
| 하위 폴더째 `source/`에 넣음 | 변환 안 됨(최상위 `*.xml`만 처리) | 평탄화 후 실행, 파일명 충돌 확인 |
| `isNotEmpty` → `!= ''`를 숫자·컬렉션에 그대로 | `0`·빈 리스트 판정이 iBATIS와 달라짐 | 타입별로 5-1절 식 사용 |
| `test="flag == 'Y'"` | Character 비교 → 오동작/NumberFormatException | `test='flag == "Y"'` |
| `${}` 그대로 유지 | SQL 인젝션 | `#{}`로, 불가피하면 화이트리스트 |
| Oracle에서 `jdbcTypeForNull` 기본값 유지 | `Invalid column type: 1111` | `jdbc-type-for-null: NULL` 또는 jdbcType 명시 |
| `<result resultMap>`→`<collection>`을 1:1에도 둠 | 단일 객체 프로퍼티에 List 매핑 오류 | `<association>`으로 |
| `insert()` 반환값을 생성 키로 사용 | MyBatis는 영향 행 수 반환 | `keyProperty`로 채워진 파라미터 객체에서 읽기 |
| iBATIS용 트랜잭션 매니저·DataSource를 따로 생성 | 공존 기간 부분 롤백 | DataSource·트랜잭션 매니저 1세트 공유 |
| namespace를 짧은 이름 그대로 두고 Mapper 인터페이스 사용 | 바인딩 실패 / ambiguous | namespace = 인터페이스 FQCN |
| `cacheModel` 누락을 모르고 지나감 | 성능 저하 또는 반대로 의도치 않은 캐시 | 원본 cacheModel 목록과 `<cache>`·`useCache`·`flushCache` 대조 |
