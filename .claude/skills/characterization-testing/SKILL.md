---
name: characterization-testing
description: 레거시의 현행 동작을 고정하는 특성화(characterization)·승인(approval)·골든 마스터·스냅샷 테스트 작성법 - Feathers 절차, ApprovalTests.Java(Maven 좌표·Approvals.verify·received/approved·Reporter·Scrubber·조합 승인)와 JUnit 5·Spring Boot(MockMvc·매퍼 SQL 결과) 고정, Jest·Vitest 스냅샷(toMatchSnapshot·인라인·-u 갱신 함정·CI 동작), 시간·난수·UUID·정렬 비결정성 제어, API 응답 녹화·비교 골든 마스터(민감 정보 마스킹), 악성·경계 테스트와의 관계, 현행 버그 처리, 흔한 실수
---

# 특성화 테스트 (Characterization Testing)

> 소스: https://michaelfeathers.silvrback.com/characterization-testing (Michael Feathers, 2016-08-08)
> 소스: https://en.wikipedia.org/wiki/Characterization_test
> 소스: https://approvaltests.com/
> 소스: https://github.com/approvals/ApprovalTests.Java (README, `approvaltests/docs/` — GettingStarted·Scrubbers·Configuration·reference/Options·how_to/ParameterizedTest·how_to/ConsistentTimeZones)
> 소스: https://central.sonatype.com/artifact/com.approvaltests/approvaltests (최신 31.0.0 확인)
> 소스: https://jestjs.io/docs/snapshot-testing (Jest 30.5 문서) · https://jestjs.io/docs/cli · https://jestjs.io/docs/jest-object
> 소스: https://vitest.dev/guide/snapshot · https://vitest.dev/api/expect · https://vitest.dev/api/vi
> 소스: https://github.com/opendiffy/diffy (API 수준 신·구 비교 도구, 참고)
> 소스: https://understandlegacycode.com/approval-tests (Nicolas Carlo, 4순위 참고)
> 검증일: 2026-10-08

---

## 0. 범위와 다른 스킬과의 경계

| 질문 | 담당 (이 스킬 외에는 설치된 경우) |
|------|------|
| 특성화 테스트가 **스펙 추출에서 어떤 역할**인가(규칙 ID ↔ 테스트 ID 연결, 현행 버그 메모 칸) | `spec-extraction-method` 2절·7-4 |
| 특성화·승인·스냅샷 테스트를 **실제로 어떻게 작성**하나 | **이 스킬** |
| JUnit 5 기본 문법, Mockito, `@WebMvcTest`·`@MybatisTest`·Testcontainers 설정 | `testing-junit5-spring-boot` |
| Jest/Vitest 설정, RTL 컴포넌트 테스트 일반 | `testing` |
| Playwright 시각 회귀(`toHaveScreenshot`), HAR 녹화·재생 | `e2e-testing` |
| 마이그레이션 전후 동등성 테스트 묶음 생성 | `migration-parity-tester` 에이전트(설치된 경우) |

개념 정의(Feathers 인용, 승인 테스트·골든 마스터의 의미, 현행 버그 원칙)는 `spec-extraction-method` 2절에 있으므로 여기서는 반복하지 않고 **작성 절차·코드·함정**만 다룬다.

---

## 1. 절차 — 실제 출력을 단언으로 옮긴다

Feathers(2016)의 절차를 실행 단위로 옮기면:

| # | 할 일 | 산출 |
|---|------|------|
| 1 | 테스트 하네스에서 대상 코드를 **호출할 수 있게** 의존성을 끊는다(가장 어려운 단계 — Feathers도 이 점을 강조) | 실행되는 빈 테스트 |
| 2 | 이름 없는 테스트(`x`)에 **일부러 틀린 기대값**(null·빈 문자열)을 단언 | 실패하는 테스트 |
| 3 | 실행 → 실패 메시지의 **실제 값**을 확인 | 실제 출력 |
| 4 | 실제 값을 기대값으로 붙여넣는다 | 통과하는 테스트 |
| 5 | 발견한 동작을 설명하는 **이름으로 변경** (`x` → `discountIsZeroWhenQuantityIsNegative`) | 의미 있는 테스트 |
| 6 | 다른 입력(경계값·null·이상값)으로 2~5 반복 | 입력 공간 커버 |

출력이 크거나 많으면 2~4를 사람이 손으로 하지 않고 **승인 도구**(ApprovalTests, 스냅샷)가 "실제 출력을 파일로 저장 → 사람이 승인 → 다음부터 비교"로 자동화한다.

```java
// 1~4단계 수작업 예 (JUnit 5)
@Test
void x() {
    PriceCalculator calc = new PriceCalculator();
    assertEquals(null, calc.discount(-3, 10_000));   // 2) 일부러 틀린 기대값
}
// 실행 결과: expected: <null> but was: <0>
// 4~5) 실제 값을 넣고 이름을 바꾼다
@Test
void discountIsZeroWhenQuantityIsNegative() {          // 현행 동작 기록. "옳다"는 뜻이 아니다
    assertEquals(0, new PriceCalculator().discount(-3, 10_000));
}
```

**언제 쓰나:** 테스트 없는 레거시를 리팩터링·이관하기 전 / 스펙 문서의 비즈니스 규칙에 "실행 증거"를 붙일 때 / 신·구 시스템 동등성 비교의 기준값이 필요할 때.
**쓰지 않을 때:** 동작을 새로 정의하는 기능 개발(TDD로 의도된 동작을 단언) / 출력이 본질적으로 매번 다른데 정규화할 수 없는 경우(그 부분은 속성 단언으로).

---

## 2. Java — ApprovalTests.Java

### 2-1. 의존성

```xml
<dependency>
    <groupId>com.approvaltests</groupId>
    <artifactId>approvaltests</artifactId>
    <version>31.0.0</version>   <!-- 2026-10-08 Maven Central 최신 -->
    <scope>test</scope>
</dependency>
```

```groovy
testImplementation 'com.approvaltests:approvaltests:31.0.0'
```

README: JUnit 3·4·5와 TestNG를 지원하고, API는 런타임 예외만 던진다("no checked exceptions").

> 주의: README는 "JDK 1.8+"라고 적고 있으나 이 문구가 31.x 기준으로 갱신된 것인지는 확인하지 못했다. 오래된 JDK(8·11) 레거시에 넣을 때는 해당 버전의 릴리즈 노트·바이트코드 타깃을 먼저 확인하고, 안 맞으면 호환되는 이전 메이저로 고정한다.

### 2-2. 기본 흐름 — received / approved

```java
import org.approvaltests.Approvals;
import org.junit.jupiter.api.Test;

class InvoiceFormatterTest {
    @Test
    void formatsInvoice() {
        Invoice invoice = InvoiceFixtures.sample();          // 고정된 입력
        Approvals.verify(new InvoiceFormatter().format(invoice));
    }
}
```

| 단계 | 일어나는 일 |
|------|------|
| 첫 실행 | `InvoiceFormatterTest.formatsInvoice.received.txt` 생성, approved 파일이 없으니 실패 + Reporter 실행(diff 도구 등) |
| 승인 | 사람이 received 내용을 **읽고** 맞으면 `.approved.txt`로 이름 변경(또는 diff 도구에서 전체 수용, 리포터가 클립보드에 넣은 move 명령 실행) |
| 이후 실행 | 결과가 approved와 같으면 통과하고 received 파일은 삭제. 다르면 received를 다시 만들고 실패 |
| 커밋 | `*.approved.*`는 **소스 관리에 커밋**, `*.received.*`는 `.gitignore` |

```gitignore
*.received.*
```

### 2-3. 자주 쓰는 verify 계열

| API | 용도 |
|------|------|
| `Approvals.verify(Object)` | `toString()` 결과 고정 |
| `Approvals.verifyAll(header, collection)` | 목록을 한 줄씩 |
| `JsonApprovals.verifyAsJson(obj)` | 쓸 만한 `toString()`이 없는 객체를 JSON으로 → `.approved.json` |
| `CombinationApprovals.verifyAllCombinations(fn, a[], b[])` | 입력 배열의 **모든 조합**을 한 파일에 `[입력] => 결과`로 고정 |

```java
// 조합 승인 — 경계값·이상값을 표처럼 한 번에 고정 (레거시 계산 로직에 특히 유효)
Integer[] quantities = {-1, 0, 1, 99, 100, Integer.MAX_VALUE};
String[] grades      = {"VIP", "NORMAL", "", null};
CombinationApprovals.verifyAllCombinations(
        (q, g) -> new PriceCalculator().discount(q, g), quantities, grades);
// 결과 파일 예: [-1, VIP] => 0
//              [0, NORMAL] => 0 ...   예외가 나면 예외 내용이 결과로 기록된다
```

> 주의: `JsonApprovals`는 Gson 기반이다. Jackson으로 직렬화하려면 `JsonJacksonApprovals`(Jackson 3은 `JsonJackson3Approvals`) 계열을 쓴다. 해당 JSON 라이브러리가 테스트 클래스패스에 있는지 확인한다(검색 요약 기준, 클래스별 의존성 범위는 원문 미확인).

> 주의: 예외가 조합 결과에 기록된다는 서술은 커뮤니티 예시 기반이다. 버전에 따라 출력 형식이 다를 수 있으니 첫 received 파일을 눈으로 확인한다.

### 2-4. JUnit 5 파라미터화 테스트

파라미터마다 approved 파일이 분리돼야 한다:

```java
@ParameterizedTest
@ValueSource(strings = {"KR", "US"})
void formatsAddress(String country) {
    Approvals.verify(new AddressFormatter().format(fixture(country)),
            Approvals.NAMES.withParameters(country));
}
// → AddressFormatterTest.formatsAddress.KR.approved.txt / ...US.approved.txt
```

공식 문서는 대안으로 `@Test` + `verifyAll()`(또는 조합 승인) 한 파일 방식도 제시한다.

### 2-5. Options — 파일 확장자·리포터·스크러버

```java
Approvals.verify(json, new Options()
        .forFile().withExtension(".json")          // approved/received 확장자 변경
        .withReporter(new QuietReporter())         // diff 도구를 띄우지 않음
        .withScrubber(ScrubberFixtures.STANDARD)); // 3절 비결정성 정규화
```

| Options 메서드 | 의미 |
|------|------|
| `forFile().withExtension(".json")` | approved·received 파일 확장자 |
| `forFile().withAdditionalInformation(..)` | 파일 이름에 추가 구분자 |
| `withReporter(r)` / `addReporter(r)` | 실패 시 리포터 지정 / `MultiReporter`로 추가 |
| `withScrubber(s)` | 비교 전 출력 정규화 |
| `inline(expected)` | 기대값을 테스트 소스에 직접 |

**리포터 범위 지정:** 메서드 `Options` > 클래스·메서드 `@UseReporter(...)` > 패키지 `PackageSettings` 클래스의 정적 필드.

```java
// src/test/java/com/example/PackageSettings.java — 패키지 전체 기본값
public class PackageSettings {
    public static ApprovalFailureReporter UseReporter = new QuietReporter();
    public static String UseApprovalSubdirectory = "approvals";   // approved 파일을 하위 폴더로
}
```

CI에서는 diff 도구 실행이 무의미하므로 QuietReporter 류를 쓴다. 조합 리포터로 `MultiReporter`(모두 실행)와 `FirstWorkingReporter`(되는 것 하나)가 있다.

> 주의: CI 환경 자동 감지 여부와 개별 리포터 클래스의 전체 목록은 원문에서 확인하지 못했다. CI는 명시적으로 리포터를 지정한다.

### 2-6. Spring Boot에서 고정하기

설정(`@WebMvcTest`·`@SpringBootTest`·`@MybatisTest`·Testcontainers)은 `testing-junit5-spring-boot`(설치된 경우)를 따르고, 여기서는 **무엇을 어떤 형태로 고정하나**만 다룬다.

| 대상 | 고정 방법 | 핵심 |
|------|------|------|
| 컨트롤러 | MockMvc로 요청 → **상태 코드 + 주요 헤더 + 본문**을 한 문자열로 만들어 verify | 응답 본문만 고정하면 상태·헤더 변화를 놓친다 |
| 서비스 | 의존(외부 API·시계·난수)을 고정한 뒤 반환 객체를 `verifyAsJson` | 1절 1단계(의존성 끊기)가 대부분의 일 |
| 매퍼(SQL 결과) | **테스트 DB에 고정 시드** 적재 → 매퍼 호출 결과 목록을 verify | `ORDER BY` 없는 SQL은 순서가 비결정 → 3절 |

```java
@WebMvcTest(OrderController.class)
class OrderControllerCharacterizationTest {
    @Autowired MockMvc mockMvc;
    @MockBean OrderService orderService;   // Spring Boot 3.4+는 @MockitoBean (testing-junit5-spring-boot 참조)

    @Test
    void listOrdersResponse() throws Exception {
        given(orderService.findOrders(any())).willReturn(OrderFixtures.threeOrders());

        MvcResult r = mockMvc.perform(get("/api/orders").param("status", "PAID"))
                .andReturn();
        String snapshot = "status: " + r.getResponse().getStatus() + "\n"
                + "content-type: " + r.getResponse().getContentType() + "\n\n"
                + r.getResponse().getContentAsString(StandardCharsets.UTF_8);

        Approvals.verify(snapshot, new Options().withScrubber(ScrubberFixtures.STANDARD));
    }
}
```

```java
@MybatisTest   // 또는 @SpringBootTest + Testcontainers. 실제 DB 방언(Oracle·MySQL)의 결과를 고정하려면 실제 DB 컨테이너
@Sql("/characterization/orders-seed.sql")    // 고정 시드: 날짜·ID를 하드코딩한 INSERT
class OrderMapperCharacterizationTest {
    @Autowired OrderMapper orderMapper;

    @Test
    void searchOrdersSql() {
        List<OrderRow> rows = orderMapper.search(new OrderSearch("PAID", null));
        rows.sort(Comparator.comparing(OrderRow::getOrderId));   // SQL에 ORDER BY가 없으면 테스트에서 정렬
        JsonApprovals.verifyAsJson(rows);
    }
}
```

- 컨트롤러 테스트에서 서비스를 목으로 바꾸면 **컨트롤러 계층만** 고정된다. 엔드투엔드 현행 동작을 고정하려면 `@SpringBootTest` + 실제(컨테이너) DB + 시드를 쓴다.
- H2 같은 대체 DB로 매퍼를 고정하면 **방언 차이가 결과에 섞인다**(날짜 함수·NULL 정렬·문자열 비교). 레거시 SQL 고정은 운영과 같은 DB 엔진을 쓴다.
- 동적 SQL(`<if>`·`<choose>`)은 분기마다 입력 조합을 만들고 조합 승인으로 묶으면 분기 누락이 결과 파일에서 보인다.

---

## 3. JS/TS — Jest·Vitest 스냅샷

### 3-1. 기본

```ts
// Jest·Vitest 공통
test('legacy price table for VIP', () => {
  expect(buildPriceTable(fixture.vip)).toMatchSnapshot();          // __snapshots__/*.snap
});

test('error message when quantity is negative', () => {
  expect(() => order(-1)).toThrowErrorMatchingInlineSnapshot();     // 첫 실행 시 소스에 값이 채워짐
});

// Vitest 전용: 원하는 확장자로 별도 파일 — 비동기이므로 반드시 await
test('report html', async () => {
  await expect(renderReport(fixture)).toMatchFileSnapshot('./__golden__/report.html');
});
```

| 도구 | 새 스냅샷 기록 | 갱신 | CI 동작 |
|------|------|------|------|
| Jest(30.x 문서) | 첫 실행 시 자동 저장 | `jest -u` / `--updateSnapshot`(`--testNamePattern`과 함께 범위 축소 가능), watch 모드 대화형 | `--ci` 지정 시 새 스냅샷을 **저장하지 않고 실패** |
| Vitest | 첫 실행 시 자동 저장 | `vitest -u` / `--update`, watch 모드에서 `u` | `process.env.CI`가 truthy면 **기본으로 쓰지 않으며** 불일치·누락·obsolete 스냅샷이 실패 |

Vitest와 Jest 스냅샷 파일은 헤더(`Vitest Snapshot v1`)·`printBasicPrototype` 기본값(Vitest는 false)·커스텀 메시지 구분자(`>` vs `:`)가 달라 **러너를 바꾸면 스냅샷을 다시 만들어야** 한다.

### 3-2. 동적 값 — property matcher

```ts
expect(createUser('kim')).toMatchSnapshot({
  id: expect.any(Number),
  createdAt: expect.any(Date),
});
// 스냅샷: { "createdAt": Any<Date>, "id": Any<Number>, "name": "kim" }
```

### 3-3. `-u` 갱신 절차 (무분별한 갱신 금지)

1. 실패한 스냅샷 diff를 **한 건씩 읽는다**. "왜 바뀌었나"를 설명할 수 없으면 갱신하지 않는다.
2. 의도한 변경이면 범위를 좁혀 갱신: `jest -u -t "price table"` / `vitest -u src/price`.
3. 스냅샷 파일 diff를 **코드 리뷰 대상**으로 커밋한다(Jest 문서: "Commit snapshots and review them as part of your regular code review process").
4. 특성화 목적의 스냅샷이 바뀌었다면 = **현행 동작이 바뀐 것**. 스펙 문서의 해당 규칙·현행 버그 메모를 같이 갱신한다.

전체 `-u`를 습관적으로 실행하면 회귀가 "승인"되어 테스트가 아무것도 지키지 못한다.

---

## 4. 비결정성 제어 — 같은 입력이면 같은 출력

| 원인 | Java | JS/TS |
|------|------|------|
| 현재 시각 | `Clock`을 주입받게 하고 테스트에서 `Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC)`. 주입 불가면 스크러버 | `jest.useFakeTimers(); jest.setSystemTime(new Date('2026-01-01'))` / `vi.useFakeTimers(); vi.setSystemTime(...)` (Vitest는 fake timer 없이도 `Date`만 모킹) |
| 타임존 | `try (WithTimeZone tz = new WithTimeZone("UTC")) { ... }` (ApprovalTests) | `TZ=UTC` 환경변수로 테스트 실행 |
| 난수 | `new Random(42)` 시드 주입 | `vi.spyOn(Math, 'random').mockReturnValue(0.5)` / `jest.spyOn(...)` |
| UUID·시퀀스 | 생성기 주입, 아니면 `Scrubbers::scrubGuid`(순번 치환) | property matcher `expect.any(String)` 또는 직렬화 전 치환 |
| 정렬 순서 | `ORDER BY` 없는 SQL·`HashMap`·`HashSet` → 테스트에서 정렬 후 고정 | 객체 키 순서·`Set` → 정렬 후 고정 |
| 로케일·포맷 | `Locale.setDefault` 고정 | `Intl` 로케일 명시 |
| 부동소수 | 고정 자릿수로 포맷 후 비교 | `toFixed` |

**스크러버(ApprovalTests)** — "문자열을 받아 문자열을 돌려주는 함수". 비교 전에 변동 값을 자리표시자로 바꾼다.

```java
public final class ScrubberFixtures {
    public static final Scrubber STANDARD = Scrubbers.scrubAll(
            Scrubbers::scrubGuid,                                          // GUID → 순번 자리표시
            DateScrubber.getScrubberFor("2026-01-01T00:00:00"),            // 이 형식의 날짜 패턴 치환
            new RegExScrubber("\"traceId\":\"[^\"]+\"", "\"traceId\":\"[scrubbed]\""));
}
```

**원칙:** 먼저 **원인을 고정**(Clock·시드 주입)하고, 고칠 수 없는 레거시 코드에서만 **출력을 스크럽**한다. 스크러버를 넓게 걸면(예: 모든 숫자 치환) 실제 회귀까지 가려진다 — 변동 필드에만 좁게.

---

## 5. API 수준 골든 마스터 — 기존 응답을 녹화해 새 시스템과 비교

화면·API를 다른 스택으로 옮길 때 코드 단위 테스트를 공유할 수 없으므로 **HTTP 경계**에서 비교한다.

### 5-1. 절차

1. **요청 목록 수집**: 스펙 문서의 API 명세 행 × 대표 입력(정상·경계·이상). 운영 로그에서 추출할 경우 개인정보 제거 후 사용.
2. **녹화(구 시스템)**: 고정 시드 DB의 구 시스템에 요청을 보내 `요청 → 응답(상태·필요 헤더·본문)` 쌍을 파일로 저장 = 골든 마스터. 사람이 샘플을 검토해 승인.
3. **정규화**: 양쪽 응답에 같은 정규화 적용(4절 시각·ID·정렬 + 필드명/포맷 차이 매핑 규칙).
4. **재생(신 시스템)**: 같은 시드의 신 시스템에 같은 요청 → 정규화 후 골든 파일과 diff.
5. **차이 분류**: 회귀 / 의도된 변경(사람 결정 기록) / 현행 버그 수정(7절) / 노이즈.

```text
golden/
├── orders-list.PAID.request.json      # method, path, query, body (민감 값 제거)
├── orders-list.PAID.response.json     # status, headers(화이트리스트), body(마스킹·정규화 후)
└── normalize.rules.json               # 무시·치환 규칙: 경로별 traceId, 생성일시, 페이징 토큰 등
```

### 5-2. 민감 정보 마스킹

- 골든 파일은 레포에 커밋되므로 **저장 전에** 마스킹한다: 인증 헤더·쿠키·세션 ID·토큰 제거, 이름·전화·주민번호·계좌·주소는 형식 유지 가짜값으로 치환.
- 운영 트래픽 녹화보다 **합성 시드 데이터 + 재현 요청**을 우선한다. 운영 데이터를 써야 하면 보관 위치·기간을 정한다.
- 헤더는 **화이트리스트**(Content-Type 등 비교에 필요한 것만)로 저장한다. 블랙리스트는 새 민감 헤더를 놓친다.

### 5-3. 노이즈 판별 — 구 시스템을 두 번

같은 요청을 구 시스템에 두 번 보내 달라지는 필드 = 비결정 노이즈. Diffy(primary·secondary·candidate 3-인스턴스 비교)가 이 발상을 프록시로 자동화한 도구다: primary·secondary(둘 다 기존 코드)가 서로 다른 비율과 primary·candidate(신 코드)가 다른 비율을 비교해 노이즈와 회귀를 구분한다.

> 주의: Diffy는 원래 Twitter가 공개한 도구로 현재 opendiffy 조직에서 관리된다. 최근 릴리즈·유지 상태는 확인하지 못했으므로 도입 전 저장소 활동을 직접 확인한다. 같은 발상은 직접 구현(구 시스템 2회 녹화 diff)으로도 충분하다.

브라우저 수준 녹화·재생은 Playwright HAR(`e2e-testing` — 설치된 경우) 참고.

---

## 6. 레포 테스트 3계층 규칙과의 관계 — 특성화로 끝내지 않는다

특성화 테스트는 **"현행 고정"** 이다. 레포 규칙(`.claude/rules/adversarial-testing.md`, dev 템플릿 설치 시)은 정상·악성·경계 3계층을 모두 요구하며, 특성화 테스트가 이를 대신하지 않는다.

| 계층 | 특성화 테스트로 하는 일 | 별도로 반드시 추가 |
|------|------|------|
| 정상 | 대표 입력의 현행 출력 고정 | — |
| 이상·경계 | null·빈 값·음수·최대값·초장문을 **조합 승인에 포함**해 현행 반응 기록 | 신 시스템이 깨지지 않는지(예외 누수·500) 명시적 단언 |
| 악성 | 레거시가 인젝션·권한 우회에 어떻게 반응하는지 **기록만** | 신 시스템은 **차단을 단언**하는 테스트(401/403·바인딩·이스케이프). 레거시가 뚫려 있어도 그 동작을 동등성 기준으로 삼지 않는다 |

- 골든 마스터의 요청 목록에 **정상 요청만** 넣지 않는다: 권한 없는 사용자·타인 리소스 ID·잘못된 파라미터·초과 길이 요청을 포함해 구 시스템 반응을 기록한다.
- 구 시스템에 보안 결함이 있으면 그 응답은 "동등해야 할 기준"이 아니라 **수정 대상**으로 분류한다(7절 사람 결정, 결정 전까지 신 시스템은 차단 쪽으로 구현).
- 고정 값을 그대로 돌려주는 가짜 구현으로 특성화 테스트를 통과시키지 않는다(레포 `fake-impl-guard` 원칙과 동일).

---

## 7. 현행 버그도 고정된다 — 메모하고 사람이 결정

1. 특성화 중 이상해 보이는 동작을 발견해도 **테스트에서 고치지 않는다.** 실제 값을 그대로 고정한다.
2. 테스트 이름·주석에 표시: `// CURRENT-BUG? 음수 수량에 할인 0 반환 — 규칙 BR-ORD-07, 결정 대기`
3. 스펙 문서 비즈니스 규칙의 `현행 버그 메모` 칸에 테스트 ID와 함께 기록(`spec-extraction-method` 7-4).
4. 업무 담당자가 **버그 호환 유지 / 수정** 결정 → 결정 기록 후:
   - 유지: 신 시스템도 같은 값을 내도록 동등성 테스트 유지
   - 수정: 특성화 테스트는 구 시스템 기준으로 남기고, 신 시스템에는 **의도된 동작 테스트**를 새로 쓰며 동등성 비교 대상에서 그 케이스를 "의도된 차이"로 명시 제외
5. 결정 없이 approved 파일·스냅샷을 "올바른 값"으로 몰래 고치지 않는다.

---

## 8. 흔한 실수

| 실수 | 왜 문제인가 | 올바른 접근 |
|------|------|------|
| `jest -u`·received 일괄 승인을 습관적으로 실행 | 회귀가 그대로 승인됨 | diff를 한 건씩 읽고 범위 좁혀 갱신, 스냅샷 diff 리뷰 |
| approved 파일을 읽지 않고 승인 | 처음부터 틀린 값(예외 스택·빈 목록)이 기준이 됨 | 첫 received는 반드시 사람이 검토 |
| 시각·UUID·정렬 미고정으로 가끔 실패(flaky) | 팀이 테스트를 불신하고 끔 | 원인 고정(Clock·시드) → 불가하면 좁은 스크러버 |
| 스크러버를 넓게(모든 숫자·날짜 치환) | 금액·수량 회귀까지 가려짐 | 변동 필드에만 패턴을 좁게 |
| 거대한 단일 스냅샷(페이지 전체 HTML·전체 DB 덤프) | diff를 아무도 못 읽어 결국 무조건 승인 | 규칙·API·화면 영역 단위로 쪼갬 |
| H2로 Oracle/MySQL SQL 결과 고정 | 방언 차이가 결과에 섞임 | 운영과 같은 엔진(컨테이너) + 고정 시드 |
| 응답 본문만 고정 | 상태 코드·헤더·에러 포맷 변화 누락 | 상태+필수 헤더+본문을 함께 |
| 골든 파일에 토큰·개인정보 저장 | 레포로 유출 | 저장 전 마스킹, 헤더 화이트리스트, 합성 데이터 우선 |
| 특성화 테스트를 정답 검증으로 착각해 버그를 고침 | 업무가 의존하던 동작이 사라짐 | 메모 → 사람 결정(7절) |
| 정상 입력만 고정하고 끝냄 | 경계·악성 경로의 현행 반응과 신 시스템 방어가 비어 있음 | 조합 승인에 경계값 포함 + 악성 차단 테스트 별도(6절) |
| `*.received.*` 커밋 / approved 미커밋 | CI가 매번 실패하거나 기준이 사라짐 | received는 gitignore, approved는 커밋 |
| Jest↔Vitest 전환 후 기존 `.snap` 재사용 | 헤더·직렬화 차이로 전부 실패 → 일괄 갱신 유혹 | 전환 커밋에서 내용 동일성 확인 후 재생성 |
| 러너를 CI에서 `--ci` 없이 실행(Jest) | 누락된 스냅샷이 CI에서 조용히 새로 써짐 | Jest는 `--ci`, Vitest는 `CI` 환경변수 확인 |
