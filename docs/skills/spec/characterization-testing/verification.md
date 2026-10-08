---
skill: characterization-testing
category: spec
version: v1
date: 2026-10-08
status: APPROVED
---

# characterization-testing 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `characterization-testing` |
| 스킬 경로 | `.claude/skills/characterization-testing/SKILL.md` |
| 검증일 | 2026-10-08 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Feathers 블로그, approvaltests.com, Jest 문서 30.5, Vitest 문서)
- [✅] 공식 GitHub 2순위 소스 확인 (approvals/ApprovalTests.Java README·docs, Maven Central, opendiffy/diffy)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-10-08 — ApprovalTests.Java 31.0.0, Jest 30.5 문서, Vitest 현행 문서)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (Feathers 절차, received/approved 흐름, Options·Reporter·Scrubber, 조합 승인, 스냅샷 갱신 절차, 비결정성 제어, API 골든 마스터, 3계층 규칙 관계, 현행 버그 처리)
- [✅] 코드 예시 작성 (가상 도메인 예시만 — 특정 회사 코드 없음)
- [✅] 흔한 실수 패턴 정리 (8절 13항목)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿·중복 확인 | Read / Bash(grep) | VERIFICATION_TEMPLATE.md, `spec-extraction-method` SKILL.md 2절, `testing-junit5-spring-boot`·`testing`·`e2e-testing` 목차 | 동명 스킬 없음. 개념 정의는 spec-extraction-method 2절로 위임, JUnit/MockMvc/Testcontainers 설정은 testing-junit5-spring-boot, Jest/Vitest 설정은 testing, HAR·시각 회귀는 e2e-testing으로 위임 |
| 조사 | WebFetch | michaelfeathers.silvrback.com/characterization-testing, github.com/approvals/ApprovalTests.Java, raw docs(Scrubbers·Configuration·reference/Options·reference/Reporters·tutorials/GettingStarted·how_to/ParameterizedTest·how_to/ConsistentTimeZones), central.sonatype.com, jestjs.io/docs/snapshot-testing·cli·jest-object, vitest.dev/guide/snapshot·api/expect·api/vi, github.com/opendiffy/diffy, understandlegacycode.com/approval-tests, en.wikipedia.org/wiki/Characterization_test | 15개 페이지 수집 |
| 교차 검증 | WebSearch | Maven Central 최신 버전, @UseReporter·QuietReporter·verifyAsJson, JsonApprovals 의존성, CombinationApprovals 예시, golden master 명칭, Diffy 동작 | 20개 클레임, 독립 소스 2개 이상 대조 |
| 판정 | — | 20개 클레임 | VERIFIED 15 / DISPUTED 1 / UNVERIFIED 4 (UNVERIFIED는 `> 주의:` 표기 유지) |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Feathers, Characterization Testing | https://michaelfeathers.silvrback.com/characterization-testing | ⭐⭐⭐ High | 2016-08-08 | 저자 공식 블로그 |
| Wikipedia, Characterization test | https://en.wikipedia.org/wiki/Characterization_test | ⭐⭐ Medium | 확인 2026-10-08 | 교차 검증(Feathers 용어, Golden Master 동의어, "정확성을 의미하지 않음") |
| ApprovalTests 공식 | https://approvaltests.com/ | ⭐⭐⭐ High | 확인 2026-10-08 | 공식 사이트 |
| ApprovalTests.Java GitHub README·docs | https://github.com/approvals/ApprovalTests.Java | ⭐⭐⭐ High | 확인 2026-10-08 | 좌표·JUnit 지원·received/approved·Options·Scrubber·PackageSettings·WithTimeZone·NAMES.withParameters |
| Maven Central (Sonatype) | https://central.sonatype.com/artifact/com.approvaltests/approvaltests | ⭐⭐⭐ High | 확인 2026-10-08 | 최신 31.0.0 ("약 3개월 전" 게시) |
| Codeartify, CombinationsApproval | https://codeartify.substack.com/p/combinations-approval | ⭐⭐ Medium | 확인 2026-10-08 | 조합 승인 예시(검색 요약) |
| Jest Snapshot Testing (30.5) | https://jestjs.io/docs/snapshot-testing | ⭐⭐⭐ High | 확인 2026-10-08 | 공식 문서 |
| Jest CLI | https://jestjs.io/docs/cli | ⭐⭐⭐ High | 확인 2026-10-08 | `--ci`·`--updateSnapshot` |
| Jest Object | https://jestjs.io/docs/jest-object | ⭐⭐⭐ High | 확인 2026-10-08 | useFakeTimers·setSystemTime |
| Vitest Snapshot 가이드 | https://vitest.dev/guide/snapshot | ⭐⭐⭐ High | 확인 2026-10-08 | CI 동작·Jest 차이 |
| Vitest expect API | https://vitest.dev/api/expect | ⭐⭐⭐ High | 확인 2026-10-08 | toMatchFileSnapshot await 필수 |
| Vitest vi API | https://vitest.dev/api/vi | ⭐⭐⭐ High | 확인 2026-10-08 | setSystemTime는 fake timer 없이 Date만 모킹 |
| opendiffy/diffy | https://github.com/opendiffy/diffy | ⭐⭐ Medium | 확인 2026-10-08 | primary/secondary/candidate. 유지 상태 미확인 |
| InfoQ, Twitter Diffy | https://www.infoq.com/news/2015/09/twitter-diffy | ⭐⭐ Medium | 2015-09 | Diffy 교차 확인(검색 요약) |
| Understand Legacy Code — Approval Tests | https://understandlegacycode.com/approval-tests | ⭐⭐ Medium | 확인 2026-10-08 | Nicolas Carlo, 4순위 참고(명칭 혼용) |

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 핵심 클레임 교차 검증 결과

| # | 클레임 | 소스 | 판정 |
|---|------|------|------|
| 1 | Feathers 절차: 임시 이름·틀린 기대값 → 실행 → 실제 값 삽입 → 의미 있는 이름 | Feathers 블로그, Wikipedia | VERIFIED |
| 2 | 의존성 끊기가 가장 어려운 단계 | Feathers 블로그 | VERIFIED (단일 1순위 원문 인용) |
| 3 | Maven 좌표 `com.approvaltests:approvaltests`, 최신 31.0.0 | GitHub README, Maven Central, WebSearch | VERIFIED |
| 4 | JUnit 3·4·5·TestNG 지원, 런타임 예외만 | GitHub README | VERIFIED |
| 5 | 최소 JDK 1.8+ (31.x 기준) | README 문구만, 릴리즈 노트 미확인 | UNVERIFIED → `> 주의:` |
| 6 | `ClassName.methodName.received.txt` → `.approved.txt` 승인, 일치 시 received 삭제 | GettingStarted, README | VERIFIED |
| 7 | `JsonApprovals.verifyAsJson` → `.approved.json`, Gson 기반 / Jackson 계열 별도 클래스 | GettingStarted, WebSearch 2건 | DISPUTED(의존성 포함 범위 소스 간 불명확) → `> 주의:` 표기 |
| 8 | `CombinationApprovals.verifyAllCombinations(fn, a[], b[])` 및 `[입력] => 결과` 형식 | Codeartify, WebSearch 요약 | VERIFIED (형식) / 예외 기록은 UNVERIFIED → `> 주의:` |
| 9 | `Approvals.NAMES.withParameters(p)` 로 파라미터별 파일 | how_to/ParameterizedTest | VERIFIED |
| 10 | Options: `forFile().withExtension`, `withReporter`/`addReporter`(MultiReporter), `withScrubber`, `inline` | reference/Options, WebSearch | VERIFIED |
| 11 | `PackageSettings` 정적 필드 `UseReporter`·`UseApprovalSubdirectory`, `@UseReporter` | Configuration.md, WebSearch | VERIFIED |
| 12 | `MultiReporter`·`FirstWorkingReporter`, `QuietReporter` | reference/Reporters, WebSearch | VERIFIED |
| 13 | CI 자동 감지·리포터 전체 목록 | 원문 미확인 | UNVERIFIED → `> 주의:` |
| 14 | Scrubber: `Scrubbers::scrubGuid`, `Scrubbers.scrubAll`, `DateScrubber.getScrubberFor`, `RegExScrubber`, "string→string 함수" | Scrubbers.md | VERIFIED |
| 15 | `WithTimeZone` try-with-resources | how_to/ConsistentTimeZones | VERIFIED |
| 16 | Jest: `toMatchSnapshot`·인라인, `-u`/`--updateSnapshot`(+`--testNamePattern`), property matcher, "스냅샷 커밋·리뷰" | Jest snapshot 문서, CLI 문서 | VERIFIED |
| 17 | Jest `--ci`는 새 스냅샷 저장 대신 실패 | Jest CLI 문서 | VERIFIED |
| 18 | Vitest: CI에서 기본으로 스냅샷 미기록·불일치/누락/obsolete 실패, `toMatchFileSnapshot` await 필수, Jest와 헤더·printBasicPrototype·구분자 차이 | Vitest 가이드, expect API | VERIFIED |
| 19 | fake timers: `jest.setSystemTime`(modern만), `vi.setSystemTime`는 fake timer 없으면 Date만 모킹 | Jest Object, Vitest vi API | VERIFIED |
| 20 | Diffy primary/secondary/candidate 노이즈 판별, 현 유지 상태 | opendiffy README, InfoQ, WebSearch | VERIFIED(동작) / 유지 상태 UNVERIFIED → `> 주의:` |

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (ApprovalTests.Java 31.0.0, Jest 30.5 문서, Spring Boot 3.4+ `@MockitoBean` 언급)
- [✅] deprecated된 패턴을 권장하지 않음 (`@MockBean`은 3.4+ 대체 안내)
- [✅] 코드 예시가 실행 가능한 형태임 (가상 클래스 의존 — 패턴 예시)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (개념 정의는 spec-extraction-method 2절 참조로 중복 회피)
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (1절)
- [✅] 흔한 실수 패턴 포함 (8절)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-10-08, 3문항)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (해당 없음 — 오답 없음)

---

## 5. 테스트 진행 기록

**수행일**: 2026-10-08
**수행자**: skill-tester → general-purpose (도메인 에이전트 대신 general-purpose 사용)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 레거시 주문 목록 API 현행 응답을 ApprovalTests로 고정, 생성일시·traceId 처리, approved/received git 처리**
- ✅ PASS
- 근거: SKILL.md 2-2·2-5·2-6·4·8절
- 상세: 상태+헤더+본문 문자열 구성, Clock 고정 우선 후 좁은 스크러버(DateScrubber·RegExScrubber), approved 커밋/received gitignore 모두 정확. anti-pattern(본문만 고정, 넓은 스크러버) 회피.

**Q2. Jest 스냅샷 대량 파손 시 `-u` 일괄 갱신 여부, CI 누락 스냅샷 방지, Vitest 전환 시 .snap 재사용**
- ✅ PASS
- 근거: SKILL.md 3-1·3-3·8절
- 상세: 일괄 `-u` 금지·범위 좁혀 갱신, Jest `--ci`, Vitest `CI` 환경변수, 러너 전환 시 .snap 재생성 모두 일치.

**Q3. 구 API가 타인 주문 ID에 200 반환 시 동등성 기준 여부, 매퍼 SQL 고정에 H2 사용 여부**
- ✅ PASS
- 근거: SKILL.md 6·7·2-6·8절
- 상세: 레거시 결함은 동등성 기준 아님·수정 대상, 신 시스템은 401/403 차단 단언, "현행 버그 메모" 기록, H2 불가·운영 동일 엔진+고정 시드 정확.

### 발견된 gap (있으면)

- 선택 보강(차단 아님): Scrubber import 경로, DateScrubber의 오프셋/밀리초 포맷 처리, 보안 결함 에스컬레이션 안내, 골든 마스터 "의도된 차이" 표기 예시, Jest↔Vitest 스냅샷 내용 동일성 확인 방법.

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 해당 없음 — 테스트 작성법·판단 기준 정리 스킬로 사용 시점의 답변 정확성으로 검증 가능(실행 결과·빌드 산출물로만 검증되는 빌드 설정/마이그레이션/워크플로우 카테고리 아님)
- 최종 상태: APPROVED

(이하 기존 후보 질문 — 참고용 보존)
- Spring Boot 레거시 주문 조회 API의 현행 응답을 ApprovalTests로 고정하려면? 응답에 생성일시·traceId가 섞여 있을 때는?
- Jest 스냅샷이 대량으로 깨졌다. 바로 `-u` 해도 되나? CI에서는 어떻게 막나?
- 구 시스템 API가 타인 주문 ID 요청에도 200을 돌려준다. 골든 마스터 동등성 기준으로 삼아야 하나?

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-10-08, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 agent content test 수행하고 섹션 5·6 업데이트 (2026-10-08 완료, 3/3 PASS)
- [❌] ApprovalTests.Java 31.x 최소 JDK 버전 릴리즈 노트로 확인 (2절 주의 해소) — 선택 보강, APPROVED 차단 요인 아님
- [❌] `JsonApprovals`(Gson)·`JsonJacksonApprovals` 의존성 범위(optional 여부) pom 직접 확인 — 선택 보강, 차단 아님
- [❌] 조합 승인에서 예외 출력 형식 실제 실행으로 확인 — 선택 보강, 차단 아님
- [❌] ApprovalTests CI 감지·리포터 전체 목록 원문 확인 — 선택 보강, 차단 아님
- [❌] opendiffy/diffy 최근 릴리즈·유지 상태 확인 — 선택 보강, 차단 아님

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-10-08 | v1 | 최초 작성 | skill-creator |
| 2026-10-08 | v1 | 2단계 실사용 테스트 수행 (Q1 ApprovalTests 주문 API 고정·스크러버 / Q2 Jest `-u`·`--ci`·Vitest 전환 / Q3 레거시 보안 결함 동등성·H2 사용) → 3/3 PASS, APPROVED 전환 (실사용 필수 카테고리 아님) | skill-tester |
| 2026-10-08 | v1.1 | 설치 검수 반영 — spec-extraction 템플릿 단독 설치본에 없는 스킬(`testing-junit5-spring-boot`·`e2e-testing` 등) 참조에 "(설치된 경우)" 조건 표기(0절 담당 표 머리글·2-6·HAR 문장). 내용 클레임 변경 없음 | Claude |
