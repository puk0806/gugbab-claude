---
name: characterization-testing
description: 레거시 현행 동작 고정(특성화·승인·골든 마스터·스냅샷) 테스트의 버전 기준과 함정 - ApprovalTests.Java 31.0.0(JDK 문구 미확인·JsonApprovals Gson vs Jackson·NAMES.withParameters·PackageSettings·CI 리포터 명시), Spring Boot 3.4+ @MockitoBean·H2 방언 오염, Jest --ci vs Vitest CI 환경변수·printBasicPrototype 정정·toMatchFileSnapshot await·러너 전환 시 재생성, 좁은 스크러버, 골든 파일 마스킹·헤더 화이트리스트, 레포 3계층 규칙·현행 버그 결정 절차
---

# 특성화 테스트 (Characterization Testing)

> 소스: https://michaelfeathers.silvrback.com/characterization-testing (Michael Feathers, 2016-08-08)
> 소스: https://en.wikipedia.org/wiki/Characterization_test
> 소스: https://approvaltests.com/
> 소스: https://github.com/approvals/ApprovalTests.Java (README, `approvaltests/docs/` — GettingStarted·Scrubbers·Configuration·reference/Options·how_to/ParameterizedTest·how_to/ConsistentTimeZones)
> 소스: https://central.sonatype.com/artifact/com.approvaltests/approvaltests (최신 31.0.0 확인)
> 소스: https://jestjs.io/docs/snapshot-testing (Jest 30.5 문서) · https://jestjs.io/docs/cli · https://jestjs.io/docs/jest-object
> 소스: https://vitest.dev/guide/snapshot (Vitest 5.1 문서) · https://vitest.dev/api/expect · https://vitest.dev/api/vi
> 소스: https://jestjs.io/docs/configuration#snapshotformat-object (Jest 30.5, `printBasicPrototype` 기본값)
> 소스: https://github.com/opendiffy/diffy (API 수준 신·구 비교 도구, 참고)
> 소스: https://understandlegacycode.com/approval-tests (Nicolas Carlo, 4순위 참고)
> 검증일: 2026-11-09

---

## 이 스킬의 범위

| 질문 | 담당 |
|------|------|
| 특성화 테스트가 **스펙 추출에서 어떤 역할**인가(규칙 ID ↔ 테스트 ID, 현행 버그 메모 칸) | `spec-extraction-method` 2절·7-4 |
| 작성 시 **버전·도구별 함정**과 레포 규칙 연결 | **이 스킬** |
| Jest/Vitest 설정, RTL 컴포넌트 테스트 일반 | `testing` |
| 마이그레이션 전후 동등성 테스트 묶음 생성 | `migration-parity-tester` 에이전트 |

> 기본 사용법(Feathers 절차 — 일부러 틀린 기대값→실제 값 붙여넣기→이름 짓기, `Approvals.verify`·`toMatchSnapshot`·property matcher 예제, fake timer·시드 주입)은 공식 문서·일반 지식 수준이라 싣지 않는다.

---

## 1. ApprovalTests.Java

- 좌표 `com.approvaltests:approvaltests:31.0.0`(test 스코프, 2026-11-09 Maven Central 최신 재확인). JUnit 3·4·5·TestNG 지원, 런타임 예외만 던진다("no checked exceptions").

> 주의: README는 "JDK 1.8+"라고 적고 있으나 이 문구가 31.x 기준으로 갱신된 것인지는 확인하지 못했다. 오래된 JDK(8·11) 레거시에 넣을 때는 해당 버전의 릴리즈 노트·바이트코드 타깃을 먼저 확인하고, 안 맞으면 호환되는 이전 메이저로 고정한다.

- 파일: `Class.method.received.txt` → 사람이 **읽고** `.approved.txt`로. `*.approved.*`는 커밋, `*.received.*`는 `.gitignore`. 결과가 같으면 received는 삭제된다.
- 주요 API: `verify`, `verifyAll(header, collection)`, `JsonApprovals.verifyAsJson`, `CombinationApprovals.verifyAllCombinations(fn, a[], b[])`(입력 모든 조합을 `[입력] => 결과`로 한 파일 — 경계·이상값 표 고정에 유효, 동적 SQL `<if>`·`<choose>` 분기 누락도 결과 파일에서 보인다).

> 주의: `JsonApprovals`는 Gson 기반이다. Jackson으로 직렬화하려면 `JsonJacksonApprovals`(Jackson 3은 `JsonJackson3Approvals`) 계열을 쓴다. 해당 JSON 라이브러리가 테스트 클래스패스에 있는지 확인한다(검색 요약 기준, 클래스별 의존성 범위는 원문 미확인).

> 주의: 예외가 조합 결과에 기록된다는 서술은 커뮤니티 예시 기반이다. 버전에 따라 출력 형식이 다를 수 있으니 첫 received 파일을 눈으로 확인한다.

- JUnit 5 `@ParameterizedTest`는 파라미터마다 파일을 분리: `Approvals.verify(x, Approvals.NAMES.withParameters(country))` → `...formatsAddress.KR.approved.txt`. 대안은 `@Test` + `verifyAll()`/조합 승인 한 파일.
- `Options`: `forFile().withExtension(".json")`, `forFile().withAdditionalInformation(..)`, `withReporter`/`addReporter`(`MultiReporter`·`FirstWorkingReporter`), `withScrubber`, `inline(expected)`.
- 리포터 범위: 메서드 `Options` > 클래스·메서드 `@UseReporter(...)` > 패키지 **`PackageSettings`** 클래스 정적 필드(`UseReporter = new QuietReporter()`, `UseApprovalSubdirectory = "approvals"`).

> 주의: CI 환경 자동 감지 여부와 개별 리포터 클래스의 전체 목록은 원문에서 확인하지 못했다. CI는 명시적으로 리포터를 지정한다(QuietReporter 류).

- 타임존: `try (WithTimeZone tz = new WithTimeZone("UTC")) { ... }`. 스크러버: `Scrubbers.scrubAll(Scrubbers::scrubGuid, DateScrubber.getScrubberFor("2026-01-01T00:00:00"), new RegExScrubber(...))`.

### Spring Boot에서 무엇을 고정하나

- 컨트롤러: MockMvc 결과를 **상태 코드 + 주요 헤더 + 본문** 한 문자열로 verify(본문만이면 상태·헤더 변화 누락). `@MockBean`은 **Spring Boot 3.4+에서 `@MockitoBean`**. 서비스를 목으로 바꾸면 컨트롤러 계층만 고정된다 — 엔드투엔드는 `@SpringBootTest` + 실제(컨테이너) DB + 시드.
- 매퍼: 고정 시드(`@Sql`, 날짜·ID 하드코딩) 후 결과 목록을 `verifyAsJson`. `ORDER BY` 없는 SQL은 테스트에서 정렬.
- **H2 같은 대체 DB로 매퍼를 고정하면 방언 차이가 결과에 섞인다**(날짜 함수·NULL 정렬·문자열 비교) → 운영과 같은 엔진(Oracle·MySQL 컨테이너).

---

## 2. Jest·Vitest 스냅샷 — 버전별 동작

| 도구 | 갱신 | CI 동작 |
|------|------|------|
| Jest(30.x 문서) | `jest -u` / `--updateSnapshot`(`-t`로 범위 축소), watch 대화형 | **`--ci` 지정 시** 새 스냅샷을 저장하지 않고 실패 — 없으면 CI에서 누락 스냅샷이 조용히 새로 써짐 |
| Vitest | `vitest -u` / `--update`, watch에서 `u` | `process.env.CI`가 truthy면 **기본으로 쓰지 않으며** 불일치·누락·obsolete 스냅샷이 실패 |

- Vitest `toMatchFileSnapshot(path)`(원하는 확장자로 별도 파일)은 비동기 — **반드시 `await expect(...)`**.
- Vitest와 Jest 스냅샷 파일은 헤더(`Vitest Snapshot v1`)·커스텀 메시지 구분자(`>` vs `:`)가 다르고, **Jest 29 미만**에서 옮겨 오면 `printBasicPrototype` 기본값도 다르다(Vitest는 false, Jest는 29.0.0 전까지 true — Jest 29+·30은 Vitest와 같은 false). 그래서 **러너를 바꾸면 스냅샷을 다시 만들어야** 한다(전환 커밋에서 내용 동일성 확인 후 재생성).

> 2026-11-09 정정: 이전 판은 `printBasicPrototype`을 Jest↔Vitest의 일반적 차이로 적었으나, Jest 30.5 설정 문서의 `snapshotFormat` 기본값은 `{escapeString: false, printBasicPrototype: false}`이고 Vitest 문서도 "Jest 29.0.0 미만이 true"라고 적는다. Jest 28 이하 스냅샷을 Vitest로 옮길 때만 해당하는 차이다.

- Vitest는 fake timer 없이도 `Date`만 모킹 가능(`vi.setSystemTime`).
- `-u` 갱신 원칙: diff를 한 건씩 읽고 설명 못 하면 갱신하지 않는다, 범위를 좁힌다, 스냅샷 diff를 코드 리뷰에 포함(Jest 문서: "Commit snapshots and review them as part of your regular code review process"). 특성화 스냅샷이 바뀌었다 = **현행 동작이 바뀐 것** → 스펙 문서 규칙·현행 버그 메모도 갱신.

---

## 3. 비결정성·골든 마스터 함정

- **원인 고정(Clock·시드 주입) 먼저, 고칠 수 없는 레거시에서만 출력 스크럽.** 스크러버를 넓게(모든 숫자·날짜 치환) 걸면 금액·수량 회귀까지 가려진다 — 변동 필드에만 좁게.
- 거대한 단일 스냅샷(페이지 전체 HTML·DB 덤프)은 아무도 diff를 못 읽어 결국 무조건 승인된다 → 규칙·API·화면 영역 단위로 쪼갠다.
- API 골든 마스터(다른 스택 이관): 고정 시드 구 시스템에 요청 녹화 → 양쪽 같은 정규화 → 신 시스템 재생 diff → 회귀 / 의도된 변경 / 현행 버그 수정 / 노이즈로 분류.
- **골든 파일은 레포에 커밋되므로 저장 전에 마스킹**: 인증 헤더·쿠키·세션 ID·토큰 제거, 이름·전화·주민번호·계좌·주소는 형식 유지 가짜값. 운영 녹화보다 합성 시드 + 재현 요청 우선. 헤더는 **화이트리스트**로 저장(블랙리스트는 새 민감 헤더를 놓친다).
- 노이즈 판별: 같은 요청을 구 시스템에 두 번 → 달라지는 필드가 노이즈. Diffy(primary·secondary·candidate 3-인스턴스 비교)가 이를 프록시로 자동화. 브라우저 수준은 Playwright HAR.

> 주의: Diffy는 원래 Twitter가 공개한 도구로 현재 opendiffy 조직에서 관리된다. 최근 릴리즈·유지 상태는 확인하지 못했으므로 도입 전 저장소 활동을 직접 확인한다. 같은 발상은 직접 구현(구 시스템 2회 녹화 diff)으로도 충분하다.

---

## 4. 레포 테스트 3계층 규칙과의 관계 — 특성화로 끝내지 않는다

특성화 테스트는 **"현행 고정"** 이다. 레포 규칙(`.claude/rules/adversarial-testing.md`)은 정상·악성·경계 3계층을 모두 요구하며 특성화 테스트가 이를 대신하지 않는다.

| 계층 | 특성화 테스트로 하는 일 | 별도로 반드시 추가 |
|------|------|------|
| 정상 | 대표 입력의 현행 출력 고정 | — |
| 이상·경계 | null·빈 값·음수·최대값·초장문을 **조합 승인에 포함**해 현행 반응 기록 | 신 시스템이 깨지지 않는지(예외 누수·500) 명시적 단언 |
| 악성 | 레거시가 인젝션·권한 우회에 어떻게 반응하는지 **기록만** | 신 시스템은 **차단을 단언**(401/403·바인딩·이스케이프). 레거시가 뚫려 있어도 그 동작을 동등성 기준으로 삼지 않는다 |

- 골든 마스터 요청 목록에 권한 없는 사용자·타인 리소스 ID·잘못된 파라미터·초과 길이 요청을 포함한다.
- 고정 값을 그대로 돌려주는 가짜 구현으로 특성화 테스트를 통과시키지 않는다(`fake-impl-guard` 원칙).

## 5. 현행 버그도 고정된다 — 메모하고 사람이 결정

1. 이상한 동작을 발견해도 **테스트에서 고치지 않고** 실제 값을 고정한다.
2. 표시: `// CURRENT-BUG? 음수 수량에 할인 0 반환 — 규칙 BR-ORD-07, 결정 대기`
3. 스펙 문서 비즈니스 규칙의 `현행 버그 메모` 칸에 테스트 ID와 함께 기록(`spec-extraction-method` 7-4).
4. 업무 담당자가 **버그 호환 유지 / 수정** 결정 → 유지: 동등성 테스트 유지 / 수정: 특성화 테스트는 구 시스템 기준으로 남기고 신 시스템에 의도된 동작 테스트를 새로 쓰며 그 케이스를 "의도된 차이"로 명시 제외. 보안 결함 응답은 결정 전까지 신 시스템을 차단 쪽으로 구현.
5. 결정 없이 approved 파일·스냅샷을 "올바른 값"으로 몰래 고치지 않는다.
