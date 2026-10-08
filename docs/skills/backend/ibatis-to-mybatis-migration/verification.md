---
skill: ibatis-to-mybatis-migration
category: backend
version: v1
date: 2026-10-08
status: PENDING_TEST
---

# ibatis-to-mybatis-migration 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `ibatis-to-mybatis-migration` |
| 스킬 경로 | `.claude/skills/ibatis-to-mybatis-migration/SKILL.md` |
| 검증일 | 2026-10-08 |
| 검증자 | skill-creator 절차 수행 에이전트 (Claude) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (mybatis.org: dynamic-sql·sqlmap-xml·java-api·configuration·getting-started, spring-boot-starter autoconfigure, mybatis-spring transactions·sqlsession)
- [✅] 공식 GitHub 2순위 소스 확인 (mybatis/ibatis2mybatis README·wiki·build.xml·migrate.xslt·pom.xml, mybatis/ibatis-2 README·소스, mybatis/ibatis-spring README, mybatis/spring-boot-starter README·릴리스)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-10-08 — mybatis2 2.8.1, mybatis-2-spring 1.4.2, MyBatis 3.5.19, starter 2.3.2/3.0.5/4.0.1/4.1.0)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (도구 절차, 문법 대응표, Java API 대응, 공존 전환, 검증)
- [✅] 코드 예시 작성 (일반 예시만 — product/ids 등)
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch | github.com/mybatis/ibatis2mybatis, /wiki, mybatis.org/ibatis2mybatis/, github.com/mybatis/ibatis-2, mybatis.org/mybatis-3/{dynamic-sql,sqlmap-xml,java-api,configuration,getting-started}.html, mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/, mybatis.org/spring/{transactions,sqlsession}.html, mybatis.org/ibatis-spring SqlMapClientFactoryBean javadoc, Spring 3.2 SqlMapClientTemplate javadoc, OGNL language guide | 공식 소스 14개 수집. 도구는 XSLT+Ant 치환, 하위 폴더 미처리, procedure를 `<update CALLABLE>`로 변환, isNotEmpty를 `!= ''`로 고정 변환하는 점 발견 |
| 조사 | Bash(curl, 읽기 전용) | raw.githubusercontent.com 의 wiki Home.md·README·build.xml·migrate.xslt·pom.xml, ibatis-2 `IsEmptyTagHandler`·`ConditionalTagHandler`·`SqlMapExecutor`·`ParameterMap`·`TypeHandlerCallback` 소스, GitHub API(릴리스·레포 메타) | 원문 직접 대조. iBATIS isEmpty는 숫자 0을 비어있지 않음으로, 컬렉션은 크기로 판정함을 소스로 확인 |
| 교차 검증 | WebSearch | Spring 4.0 orm.ibatis 제거, OGNL 한 글자 char 리터럴, OGNL Integer 0 != '' 함정, Oracle Invalid column type 1111, foreach collection/list/array 키 | 26개 클레임 — VERIFIED 22 / DISPUTED 2 / UNVERIFIED 2 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| ibatis2mybatis 레포 (README·build.xml·migrate.xslt·pom.xml) | https://github.com/mybatis/ibatis2mybatis | ⭐⭐⭐ High | 2026-10-08 (pushed 2026-10-01) | MyBatis 공식 조직, Stars 110 — 공식 조직이라 Stars 기준 예외 |
| ibatis2mybatis 위키 | https://github.com/mybatis/ibatis2mybatis/wiki | ⭐⭐⭐ High | 2026-10-08 | 위키 스스로 "probably not 100% complete" 명시 |
| ibatis2mybatis 사이트 | https://mybatis.org/ibatis2mybatis/ | ⭐⭐⭐ High | 2026-10-08 | 1.0.0-SNAPSHOT, 2025-09-11 게시 |
| iBATIS 2 유지보수 레포 | https://github.com/mybatis/ibatis-2 | ⭐⭐⭐ High | 2026-10-08 (2.8.1 = 2026-07-01) | "Both ... can be used together", javax/Jakarta 지원 구분 |
| ibatis-spring (mybatis-2-spring) | https://github.com/mybatis/ibatis-spring | ⭐⭐⭐ High | 2026-10-08 (1.4.2 = 2026-07-08) | Spring ORM 3.2.x 복사본 |
| SqlMapClientFactoryBean javadoc | https://mybatis.org/ibatis-spring/apidocs/org/springframework/orm/ibatis/SqlMapClientFactoryBean.html | ⭐⭐⭐ High | 2026-10-08 | TransactionAwareDataSourceProxy·DataSourceTransactionManager |
| Spring 3.2 SqlMapClientTemplate javadoc | https://docs.spring.io/spring-framework/docs/3.2.x/javadoc-api/org/springframework/orm/ibatis/SqlMapClientTemplate.html | ⭐⭐⭐ High | 2026-10-08 | deprecated as of 3.2 |
| MyBatis 3 Dynamic SQL | https://mybatis.org/mybatis-3/dynamic-sql.html | ⭐⭐⭐ High | 2026-10-08 | where/trim/foreach/OGNL |
| MyBatis 3 Mapper XML | https://mybatis.org/mybatis-3/sqlmap-xml.html | ⭐⭐⭐ High | 2026-10-08 | `${}` 인젝션 경고, cache 기본값, statementType |
| MyBatis 3 Java API | https://mybatis.org/mybatis-3/java-api.html | ⭐⭐⭐ High | 2026-10-08 | selectOne/insert 반환값/RowBounds/flushStatements |
| MyBatis 3 Configuration | https://mybatis.org/mybatis-3/configuration.html | ⭐⭐⭐ High | 2026-10-08 | jdbcTypeForNull=OTHER, BaseTypeHandler |
| MyBatis 3 Getting Started | https://mybatis.org/mybatis-3/getting-started.html | ⭐⭐⭐ High | 2026-10-08 | namespace 필수·인터페이스 FQCN 일치 |
| MyBatis-Spring-Boot autoconfigure | https://mybatis.org/spring-boot-starter/mybatis-spring-boot-autoconfigure/ | ⭐⭐⭐ High | 2026-10-08 | 호환표(4.0까지) |
| spring-boot-starter README·릴리스 | https://github.com/mybatis/spring-boot-starter | ⭐⭐⭐ High | 2026-10-08 | master = Boot 4.1, 4.1.0 릴리스 2026-07-16 |
| MyBatis-Spring Transactions / SqlSession | https://mybatis.org/spring/transactions.html · https://mybatis.org/spring/sqlsession.html | ⭐⭐⭐ High | 2026-10-08 | 같은 DataSource 필수, SqlSessionTemplate |
| OGNL Language Guide | https://commons.apache.org/dormant/commons-ognl/language-guide.html | ⭐⭐⭐ High | 2026-10-08 | 문자/문자열 리터럴 구분 |
| MyBatis ParamNameResolver xref | https://mybatis.org/mybatis-3/xref/org/apache/ibatis/reflection/ParamNameResolver.html | ⭐⭐⭐ High | 2026-10-08 | collection/list/array 키 (검색 결과로 확인) |
| 커뮤니티 글 (OGNL 'Y' char, Integer 0 != '', Oracle 1111) | cloud.tencent.com, cnblogs, juejin, jira.camunda.com 등 | ⭐ Low~⭐⭐ Medium | 2026-10-08 | 공식 소스 보조용 — 함정 사례 확인에만 사용 |

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 교차 검증 클레임 판정

| # | 클레임 | 소스 | 판정 |
|---|--------|------|------|
| 1 | ibatis2mybatis는 XSLT + 텍스트 치환을 Ant 태스크로 묶은 도구 | README, mybatis.org/ibatis2mybatis, pom.xml description | VERIFIED |
| 2 | source 폴더에 sqlMap을 넣고 ant 실행 또는 `mvn clean install`(antrun) → destination 출력, 변환 못 한 것은 콘솔 보고 | README, build.xml, pom.xml | VERIFIED |
| 3 | 제작자 스스로 "by no means perfect yet", "good starting point" | README, wiki | VERIFIED |
| 4 | build.xml은 매 실행 시 destination/*.xml 삭제, `includes="*.xml"`(하위 폴더 미처리), 인라인 jdbcType 4종만 치환, 마지막에 MyBatis DTD 검증(failonerror) | build.xml 원문 | VERIFIED |
| 5 | sqlMapConfig→configuration, sqlMap→mapper, parameterClass→parameterType, resultClass→resultType, class→type | wiki, migrate.xslt | VERIFIED |
| 6 | `#value#`→`#{value}`, `$value$`→`${value}` | wiki(# 만), build.xml 정규식(# 와 $ 모두) | VERIFIED |
| 7 | jdbcType ORACLECURSOR→CURSOR, NUMBER→NUMERIC | wiki (WebFetch 요약 + raw Home.md) | VERIFIED |
| 8 | isNotNull/isEqual 등 → `<if test>` (OGNL) | wiki, migrate.xslt, dynamic-sql 문서(OGNL) | VERIFIED |
| 9 | `<dynamic prepend="WHERE"/"SET">` → `<where>`/`<set>`, 그 외는 미변환 | migrate.xslt | VERIFIED |
| 10 | iterate → foreach (conjunction→separator, item="item", `xyz[]`→item) | migrate.xslt, build.xml | VERIFIED |
| 11 | procedure → `<select statementType="CALLABLE">` | 위키는 select/insert/update 중 선택, 도구는 `<update statementType="CALLABLE">` 생성 | DISPUTED → SKILL.md에 "위키 기준 select/insert/update, 도구는 update 생성, 결과 받는 건 select로" 로 수정 기재 |
| 12 | cacheModel → `<cache>`, flushInterval 밀리초, LRU 기본, flushOnExecute→flushCache | wiki, sqlmap-xml 문서 | VERIFIED |
| 13 | groupBy 제거 → `<collection>`, 중첩 resultMap은 `<association>` | wiki, migrate.xslt(도구는 resultMap 참조를 항상 collection으로) | VERIFIED |
| 14 | SqlMapClient → SqlSessionFactory, TypeHandlerCallback → TypeHandler, DataSourceFactory initialize(Map)→setProperties(Properties) | wiki, ibatis-2 소스, configuration 문서 | VERIFIED |
| 15 | Spring orm.ibatis(SqlMapClientTemplate 등) 3.2 deprecated, 4.0 제거 | Spring 3.2 javadoc, WebSearch(CAMEL-7467, mybatis ibatis-spring clirr) | VERIFIED |
| 16 | mybatis-2-spring = Spring 3.2.x 코드 복사본, 1.3.0 Java 11·Spring 5~7, 1.4.0 Java 17·Spring 6+ | ibatis-spring README, 릴리스 태그 | VERIFIED |
| 17 | iBATIS 2와 MyBatis 3 동시 사용 가능, mybatis2 2.8.x Jakarta/javax | ibatis-2 README, GitHub 레포 description | VERIFIED |
| 18 | 트랜잭션 매니저 DataSource는 SqlSessionFactoryBean과 같아야 함 | mybatis-spring transactions 문서 | VERIFIED |
| 19 | SqlMapClientFactoryBean 기본 TransactionAwareDataSourceProxy, DataSourceTransactionManager/JTA 사용 | ibatis-spring javadoc | VERIFIED |
| 20 | starter 호환표 (2.1~4.0) | autoconfigure 문서 | VERIFIED |
| 21 | starter 4.1 = Boot 4.1 | 문서 사이트 표에는 없음 / GitHub README master 행·4.1.0 릴리스에는 있음 | DISPUTED → 표에 포함하되 `> 주의:`로 출처 차이 명시 |
| 22 | queryForObject/queryForList → selectOne/selectList, iBATIS insert는 Object(키) 반환 vs MyBatis insert는 영향 행 수 | ibatis-2 SqlMapExecutor 소스, java-api 문서 | VERIFIED |
| 23 | iBATIS isEmpty: 컬렉션 크기·배열 길이·`String.valueOf(v).isEmpty()`로 판정(숫자 0은 비어있지 않음) | ibatis-2 IsEmptyTagHandler 소스, migrate.xslt(`!= ''` 고정 변환) | VERIFIED |
| 24 | OGNL에서 Integer 0과 `''` 비교 시 같다고 평가 → `p != ''` 조건 탈락 | 커뮤니티 다수 사례만, OGNL 공식 문서에 명시 문장 없음 | UNVERIFIED → SKILL.md에 `> 주의:` 표기, 특성화 테스트로 확인하도록 안내 |
| 25 | OGNL 작은따옴표 한 글자 = Character 리터럴 → `'Y'` 비교 함정 | OGNL language guide, 커뮤니티 사례 | VERIFIED |
| 26 | 빈 컬렉션일 때 iBATIS iterate가 prepend까지 생략하는지 | 소스 미확인 | UNVERIFIED → SKILL.md에 `> 주의: ... 미검증` 표기 (권고 내용은 어느 경우든 안전) |

추가 확인(보조): MyBatis `jdbcTypeForNull` 기본값 OTHER(공식) + Oracle `Invalid column type: 1111`(커뮤니티 다수), iBATIS null 처리 `Types.NULL`(ParameterMap 소스), namespace = 인터페이스 FQCN(getting-started), foreach 단일 List 파라미터 `collection`/`list`/`array` 키(ParamNameResolver) — 모두 VERIFIED로 보고 본문에 반영.

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 2건 수정 반영)
- [✅] 버전 정보가 명시되어 있음 (mybatis2 2.8.1, mybatis-2-spring 1.4.2, MyBatis 3.5.19, starter 버전표)
- [✅] deprecated된 패턴을 권장하지 않음 (`<parameterMap>`은 deprecated로 표기, SqlMapClientTemplate은 공존 기간 한정)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (0절)
- [✅] 흔한 실수 패턴 포함 (10절)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X — 일반 예시만 사용)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-10-08, general-purpose 대체 사용)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (FAIL 없음, 보완 불필요 — 선택 보강만 섹션 5 gap에 기록)

---

## 5. 테스트 진행 기록

**수행일**: 2026-10-08
**수행자**: skill-tester → general-purpose (domain 에이전트 대신 general-purpose로 대체 사용)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 변환된 isNotEmpty(Integer 0, 빈 List)가 iBATIS와 결과가 달라지는 이유·수정·검증**
- ✅ PASS
- 근거: SKILL.md 3절 대응표, 5-1절(IsEmptyTagHandler 원문), 9절, 10절
- 상세: 숫자는 `p != null`, 컬렉션은 `p != null and !p.isEmpty()`, 문자열만 `!= ''` 처방을 정확히 제시. "OGNL 0=='' 은 커뮤니티 사례 기반(주의 표기)"도 그대로 전달. anti-pattern(`!= ''` 일괄 유지) 회피.

**Q2. 하위 폴더 있는 Oracle 프로젝트의 도구 실행·완료 기준·`Invalid column type: 1111`·`${}` 처리**
- ✅ PASS
- 근거: SKILL.md 1-2절(build.xml 동작 표), 4절, 5-3절, 9절, 10절
- 상세: 하위 폴더 평탄화, destination 매 실행 삭제, 콘솔 "Sorry" 0건+특성화 테스트 완료 기준, `jdbc-type-for-null: NULL` 또는 jdbcType 명시, `${}` grep 전수 확인+화이트리스트를 모두 정확히 인용.

**Q3. Boot 3.x에서 iBATIS+MyBatis 공존 — 트랜잭션·의존성·전환 순서·insert 반환값**
- ✅ PASS
- 근거: SKILL.md 7-1절, 6-1절(줄 286), 6-2절, 7-2절, 8절, 10절
- 상세: 같은 DataSource·트랜잭션 매니저 1세트, mybatis2 2.8.x + mybatis-2-spring 1.4.x, starter 3.0.x, 조회→쓰기 순서·sqlMap 1개=커밋 1개, insert 반환 Object→int 및 keyProperty 패턴을 모두 SKILL.md 근거로 답변. anti-pattern(별도 트랜잭션 매니저, `com.ibatis` Spring 4+ 순정 사용) 회피.

### 발견된 gap (있으면)

모두 차단 요인 아님, 선택 보강:
- insert 생성 키 호출부 before/after 코드와 `selectKey`/`useGeneratedKeys` XML 예시 부재 (6-1절 한 줄 서술뿐)
- `${}` 화이트리스트 구현 예시, 하위 폴더 평탄화 후 재배치 방법 부재
- `jdbcTypeForNull` 순수 MyBatis XML 설정 형태 미기재 (Boot yml만)
- Boot 3.0/3.1 등 starter 3.0.x 호환 범위 밖 마이너 판단 불가

### 판정

- agent content test: PASS (3/3 PASS)
- verification-policy 분류: 마이그레이션 가이드 (실사용 필수)
- 최종 상태: PENDING_TEST 유지 (실제 sqlMap 변환·특성화 테스트 실행 전까지 APPROVED 불가)

(아래 원 템플릿 안내는 참고용으로 보존) skill-tester가 SKILL.md 기반 실전 질문 2~3개를 수행한 뒤 이 섹션과 섹션 6을 갱신한다.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-10-08, 3/3 PASS) |
| **최종 판정** | **PENDING_TEST** (content test 통과, 마이그레이션 가이드라 실사용 확인 전까지 유지) |

> 분류 메모: 마이그레이션 가이드 스킬이므로 verification-policy.md의 "실사용 필수 스킬"에 해당할 수 있다. content test PASS 후에도 실제 변환 도구 실행·특성화 테스트 결과로 확인하기 전까지 PENDING_TEST 유지가 기본이다.

---

## 7. 개선 필요 사항

- [✅] skill-tester로 2단계 content test 수행 및 섹션 5·6 갱신 (2026-10-08 완료, 3/3 PASS)
- [❌] 실제 sqlMap 샘플로 ibatis2mybatis 도구를 실행해 콘솔 보고 형식·DTD 검증 실패 메시지·`<dynamic>` 비WHERE 분기 실제 출력 확인 (클레임 9 보강) — APPROVED 전환의 차단 요인(실사용 필수 카테고리)
- [❌] OGNL `0 != ''` 동작을 MyBatis 3.5.19에서 실측해 UNVERIFIED(#24) 해소
- [❌] 빈 컬렉션에서 iBATIS `<iterate>` prepend 동작을 `IterateTagHandler` 소스로 확인해 UNVERIFIED(#26) 해소
- [❌] `characterization-testing` 스킬이 레포에 추가되면 9절 참조 문구에서 "(설치된 경우)" 표현 재검토

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-10-08 | v1 | 최초 작성 (공식 도구·위키·소스 대조, 클레임 26개 교차 검증) | skill-creator 절차 수행 에이전트 (Claude) |
| 2026-10-08 | v1 | 2단계 실사용 테스트 수행 (Q1 isNotEmpty 0/빈 리스트 의미 차이 / Q2 도구 실행·Oracle null·`${}` / Q3 Boot 3 공존 전환·insert 반환값) → 3/3 PASS, PENDING_TEST 유지(마이그레이션 가이드 = 실사용 필수) | skill-tester |
