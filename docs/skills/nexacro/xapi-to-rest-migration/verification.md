---
skill: xapi-to-rest-migration
category: nexacro
version: v1
date: 2026-10-08
status: PENDING_TEST
---

# xapi-to-rest-migration 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `xapi-to-rest-migration` |
| 스킬 경로 | `.claude/skills/xapi-to-rest-migration/SKILL.md` |
| 검증일 | 2026-10-08 |
| 검증자 | skill-creator 절차(Claude) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (투비소프트 넥사크로 17/N/14 문서, Spring Framework 레퍼런스, RFC 9457, JSON:API, MyBatis, Jakarta Persistence, Apache POI)
- [✅] 공식 GitHub 2순위 소스 확인 (Apache POI 커밋 68478c8 — SXSSF close 시 임시 파일 삭제)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-10-08 — Spring Framework 6.x 레퍼런스, POI 5.5.1 릴리스 기준 changes)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (DTO 매핑, ProblemDetail, 배치 저장, 낙관적 잠금, 공존, SXSSF, 서버 검증)
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성
- [✅] 기존 스킬(`spring-boot-2-to-3-migration`, `global-exception-validation`, `mybatis-mapper-patterns`, `nexacro-xapi-server`)과 범위 중복 확인 → 참조로 안내

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch | docs.tobesoft.com 17 X-API 가이드(d82e8b8cd262cb1a), N V24 서버 가이드(638d458b567ddda9), N 이전판(e11221d55800ca9f), 14 관리자 가이드(ea2d0a940547e4a5), N getting started(225bff549bb2aad9) | 17 패키지·jar·ErrorCode 예제, Jakarta jar 1.0.11 vs 1.0.12 불일치, OrgRow·ErrorCode 부호 규칙 확인. 행 타입 Java 메서드명은 공개 문서에서 미발견 |
| 조사 | WebFetch | Spring Error Responses, @Transactional, RFC 9457, JSON:API atomic, POI how-to, MyBatis Java API, Jakarta @Version | ProblemDetail·RFC 9457·원자성 MUST·롤백 규칙·SXSSF 윈도/임시 파일·영향 행 수 반환·@Version 타입 확인 |
| 교차 검증 | WebSearch + WebFetch | `spring.mvc.problemdetails.enabled` 기본값, Spring 6.1 메서드 검증, 컨테이너 원소 `@Valid`, POI SXSSF dispose/close(5.3.0 변경), Jakarta X-API 버전, X-API 행 타입 메서드명, 낙관적 잠금 예외 | 17개 클레임, 독립 소스 2개 이상 | VERIFIED 12 / DISPUTED 2 / UNVERIFIED 3 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| 넥사크로 17 Getting Started — X-API 서비스 작성 | https://docs.tobesoft.com/getting_started_nexacro_17_ko/d82e8b8cd262cb1a | ⭐⭐⭐ High | 2026-10-08 확인 | 벤더 공식 |
| 넥사크로 N V24 Server Setup Guide — X-API 설치 | https://docs.tobesoft.com/server_setup_guide_nexacro_n_v24_en/638d458b567ddda9 | ⭐⭐⭐ High | 2026-10-08 확인 | Jakarta "1.0.11 and later" |
| 넥사크로 N Server Setup Guide(이전판) | https://docs.tobesoft.com/server_setup_guide_nexacro_n_en/e11221d55800ca9f | ⭐⭐⭐ High | 2026-10-08 확인 | Jakarta "1.0.12 and later" (불일치) |
| 넥사크로 14 Admin Guide — Dataset XML | https://docs.tobesoft.com/admin_guide_nexacro_14_en_kr/ea2d0a940547e4a5 | ⭐⭐⭐ High | 2026-10-08 확인 | 행 타입·OrgRow·ErrorCode 부호 |
| 넥사크로 N Getting Started — X-API | https://docs.tobesoft.com/getting_started_nexacro_n_en/225bff549bb2aad9 | ⭐⭐⭐ High | 2026-10-08 확인 | 행 타입 메서드 미수록 확인용 |
| Spring Framework — Error Responses | https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html | ⭐⭐⭐ High | 2026-10-08 확인 | 공식 레퍼런스 |
| Spring Framework — Using @Transactional | https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html | ⭐⭐⭐ High | 2026-10-08 확인 | 공식 레퍼런스 |
| Spring Framework — MVC Validation | https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html | ⭐⭐⭐ High | 2026-10-08 확인 | 6.1 내장 메서드 검증 |
| Spring Boot issue #32634 (problemdetails 속성) | https://github.com/spring-projects/spring-boot/issues/32634 | ⭐⭐⭐ High | 2026-10-08 확인 | 기본값 false 근거 |
| Spring Framework javadoc — JpaOptimisticLockingFailureException | https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/orm/jpa/JpaOptimisticLockingFailureException.html | ⭐⭐⭐ High | 2026-10-08 확인 | ObjectOptimisticLockingFailureException 하위 |
| RFC 9457 | https://www.rfc-editor.org/rfc/rfc9457.html | ⭐⭐⭐ High | 2023-07 발행 | RFC 7807 대체 |
| JSON:API Atomic Operations | https://jsonapi.org/ext/atomic/ | ⭐⭐⭐ High | 2026-10-08 확인 | 공개 표준 확장 |
| MyBatis 3 Java API | https://mybatis.org/mybatis-3/java-api.html | ⭐⭐⭐ High | 2026-10-08 확인 | 영향 행 수 반환 |
| Jakarta Persistence 3.1 @Version | https://jakarta.ee/specifications/persistence/3.1/apidocs/jakarta.persistence/jakarta/persistence/version | ⭐⭐⭐ High | 2026-10-08 확인 | 스펙 javadoc |
| Jakarta EE Tutorial — Bean Validation Advanced | https://jakarta.ee/learn/docs/jakartaee-tutorial/current/beanvalidation/bean-validation-advanced/bean-validation-advanced.html | ⭐⭐⭐ High | 2026-10-08 확인 | `List<@Valid T>` |
| Apache POI — Spreadsheet How-To (SXSSF) | https://poi.apache.org/components/spreadsheet/how-to.html | ⭐⭐⭐ High | 2026-10-08 확인 | dispose 필수 서술 |
| Apache POI — History of Changes | https://poi.apache.org/changes.html | ⭐⭐⭐ High | 2026-10-08 확인 | 5.3.0(2024-07-02) Bug 68183 |
| Apache POI commit 68478c8 | https://Apache.googlesource.com/poi/+/68478c8b8c75d3a7fe2497e4105a396286ed73d5 | ⭐⭐⭐ High | 2024-05-17 | close 시 임시 파일 삭제 |
| Apache POI SXSSFWorkbook javadoc | https://poi.apache.org/apidocs/dev/org/apache/poi/xssf/streaming/SXSSFWorkbook.html | ⭐⭐⭐ High | 2026-10-08 확인 | dispose/close 설명 |

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 클레임별 교차 검증 결과

| # | 클레임 | 소스 | 판정 |
|---|--------|------|------|
| 1 | 넥사크로 17 X-API 패키지 `com.nexacro17.xapi.*`, jar `nexacro17-xapi-1.0.jar` + `commons-logging` + `nexacro17_server_license.xml` | 17 가이드 + `nexacro-xapi-server` 스킬(독립 조사) | VERIFIED |
| 2 | 응답 `VariableList`의 `ErrorCode`/`ErrorMsg`, 음수 = 실패 | 14 관리자 가이드 + 17 예제(`-1` on catch) | VERIFIED |
| 3 | update 행은 `OrgRow`로 수정 전 원래값을 함께 보냄 | 14 관리자 가이드 + `nexacro-xapi-server` 스킬 | VERIFIED |
| 4 | Jakarta EE용 X-API jar(`nexacro-xapi-java-jakarta_x.x.x.jar`) 제공 시작 버전 | V24 가이드 "1.0.11" vs N 이전판 "1.0.12" | DISPUTED → 두 표기 병기 + `> 주의:` |
| 5 | 넥사크로 17 라이선스로 N 계열 Jakarta X-API 사용 가능 여부 | 공개 문서에 없음 | UNVERIFIED → `> 주의: 미확인` + 대안 계획 제시 |
| 6 | X-API Java 행 타입/삭제 행/원래값 메서드명 | 17·N 공개 문서 미수록 | UNVERIFIED → 스킬에서 제외, `nexacro-xapi-server`로 위임 + `> 주의:` |
| 7 | Spring Framework 6은 RFC 9457 지원 (`ProblemDetail`, `ErrorResponse`, `ErrorResponseException`, `ResponseEntityExceptionHandler`), `application/problem+json`, `properties` 최상위 전개 | Spring 레퍼런스 + 다수 2차 자료 | VERIFIED |
| 8 | `spring.mvc.problemdetails.enabled` 기본 false, 켜면 `ResponseEntityExceptionHandler` 자동 구성 | Spring 레퍼런스 + Spring Boot issue #32634 | VERIFIED |
| 9 | RFC 9457은 RFC 7807 대체, 필드 type(기본 about:blank)/title/status/detail/instance | RFC 9457 본문 + Spring 레퍼런스 | VERIFIED |
| 10 | JSON:API Atomic: 원자성 MUST, 순서대로 수행 MUST, op add/update/remove, ext 미디어 타입 | jsonapi.org/ext/atomic + 검색 결과 | VERIFIED |
| 11 | Spring 공식 "그리드 일괄 저장" REST 패턴은 없음 | 부재 증명 불가 | UNVERIFIED → "설계 제안" `> 주의:` 표기 |
| 12 | `@Transactional` 기본 롤백 RuntimeException/Error, checked 미롤백, self-invocation 미적용, 가시성 규칙(6.0 변경) | Spring 레퍼런스 + 다수 2차 자료 | VERIFIED |
| 13 | MyBatis insert/update/delete 반환값 = 영향 행 수 | MyBatis Java API + 검색 결과 | VERIFIED |
| 14 | JPA `@Version` 지원 타입·엔티티당 1개, Spring 예외 `ObjectOptimisticLockingFailureException`/`JpaOptimisticLockingFailureException` | Jakarta Persistence javadoc + Spring javadoc | VERIFIED |
| 15 | SXSSF 슬라이딩 윈도 기본 100, 내보낸 행 접근 불가, 병합 영역·하이퍼링크·코멘트는 메모리, `setCompressTempFiles` | POI how-to + SXSSFWorkbook javadoc | VERIFIED |
| 16 | SXSSF 임시 파일은 반드시 `dispose()`로 정리해야 함 | how-to("must ... clean up explicitly") vs changes 5.3.0("removes temp files when closed") + 커밋 68478c8 | DISPUTED → 5.3.0+ close 자동 삭제 병기, 코드는 dispose+close 모두 호출 |
| 17 | Spring 6.1 내장 메서드 검증(`MethodArgumentNotValidException` vs `HandlerMethodValidationException`, 클래스 `@Validated` 제거), 컨테이너 원소 `List<@Valid T>` | Spring MVC Validation 레퍼런스 + Jakarta Tutorial | VERIFIED |

집계: VERIFIED 12 / DISPUTED 2 / UNVERIFIED 3

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (불일치 2건은 `> 주의:`로 병기)
- [✅] 버전 정보가 명시되어 있음 (넥사크로 17 / N V24, Spring Framework 6.0·6.1, Spring Boot 3, POI 5.3.0)
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임 (서비스·매퍼 시그니처는 예시 도메인 기준)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 회사 코드·URL 없음, 일반 주문 도메인 예시)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-10-08, 3문항)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (해당 없음 — FAIL 0건, 선택 보강 gap만 기록)

---

## 5. 테스트 진행 기록

**수행일**: 2026-10-08
**수행자**: skill-tester → general-purpose (도메인 에이전트 대신 general-purpose 사용)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 편집 그리드(insert/update/delete 혼합) 저장 X-API 컨트롤러를 REST로 — 엔드포인트·DTO·트랜잭션·순서·배열 검증, 행별 PUT/DELETE 금지 이유**
- ✅ PASS
- 근거: SKILL.md "2. 매핑 규칙", "3. 행 상태 일괄 저장", "9. 흔한 실수"
- 상세: `POST /batch` + `created/updated/deleted` record, `List<@Valid T>` + `@NotNull @Size(max)`, `@Transactional` 한 트랜잭션, 삭제→수정→추가 순서(레거시 순서 우선), 행별 호출 시 부분 반영으로 "한 번에 저장" 깨짐을 모두 정확히 도출. anti-pattern(행별 호출, List 직접 @RequestBody) 회피. 원자성·순서 이유 중 JSON:API 연결은 에이전트 추론으로 표시됨.

**Q2. OrgRow 동시 수정 보호·catch(Throwable) 삼킴·checked 예외 롤백·self-invocation, 스키마 변경 불가 시**
- ✅ PASS
- 근거: SKILL.md "4. 낙관적 잠금", "2-4 ProblemDetail", "3-3 @Transactional 함정", "9. 흔한 실수"
- 상세: version 조건부 UPDATE + 영향 행 수 != 1 → RuntimeException 전체 롤백 → 409 ProblemDetail(`conflicts`), checked 예외는 `rollbackFor` 또는 감싸기, catch 삼킴 금지(advice에서만 변환), self-invocation 회피, 스키마 변경 불가 시 원래값/`updated_at` 비교 + NULL-safe 비교, 마지막 저장 우선은 문서화된 의도적 결정으로 제시. anti-pattern 회피.

**Q3. 점진 전환기 X-API/REST 공존, Boot 3 Jakarta X-API jar 사용 가능성, xeni → SXSSF 대체**
- ✅ PASS
- 근거: SKILL.md "5. 전환기 공존", "7. 엑셀(xeni) 대체", "9. 흔한 실수"
- 상세: 서비스 계층 하나 + 어댑터/REST 컨트롤러 분리·동일 DTO, 어댑터 경로 `@Validated` 필요, javax jar는 Boot 3 비호환, Jakarta jar 1.0.11 vs 1.0.12 불일치와 17 라이선스 미확인을 단정 없이 `> 주의:` 그대로 전달하고 대안 ①②를 제시. SXSSF는 `dispose()`+`close()` 병행(5.3.0+ close 자동 삭제 병기), 권한·행수 상한·수식 인젝션 정확히 인용. DISPUTED/UNVERIFIED를 사실처럼 단정하지 않음.

### 발견된 gap (선택 보강, 차단 요인 아님)

- 원래값 비교의 NULL-safe SQL 예시(Oracle 빈 문자열=NULL 포함)와 `rollbackFor` 코드 예시가 없음
- 동일 ID가 `updated`/`deleted`에 중복되거나 배치 내 중복될 때의 검증 규칙, 부모-자식 FK 시 처리 순서 미기술
- 수식 인젝션 구체 구현 코드, export 행수 초과 시 응답 상태, X-API(세션)/REST(JWT) 인증 방식 병행 처리 미기술
- 409가 동시 수정 충돌과 업무 규칙 위반 양쪽에 쓰일 수 있음("팀 규칙으로 고정"만 안내)

### 판정

- agent content test: PASS (3/3 PASS)
- verification-policy 분류: 마이그레이션 가이드 / 설정+실행 성격 (실사용 필수 스킬)
- 최종 상태: PENDING_TEST 유지 (content test는 통과했으나 실제 마이그레이션 프로젝트 적용 결과가 확인되기 전까지 APPROVED 불가)

### (참고) 기존 예정 템플릿

skill-tester 수행 대기. (위 기록으로 대체됨)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (DISPUTED 2건 주의 표기) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-10-08, 3/3 PASS, 선택 보강 gap만 존재) |
| **최종 판정** | **PENDING_TEST** (마이그레이션 가이드 = 실사용 필수 카테고리, 실프로젝트 적용 전까지 유지) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 2단계 content test 수행 후 섹션 5·6 갱신 (2026-10-08 완료, 3/3 PASS)
- [❌] 넥사크로 17 라이선스로 N 계열 Jakarta X-API 사용 가능 여부 벤더(투비소프트) 확인 시 SKILL.md §5 주의 표기 갱신 (선택 보강 — 차단 요인 아님)
- [❌] Jakarta X-API 시작 버전(1.0.11 vs 1.0.12) 실제 배포 파일로 확인되면 SKILL.md §5 갱신 (선택 보강 — 차단 요인 아님)
- [❌] 실제 마이그레이션 프로젝트에서 배치 엔드포인트·어댑터 공존 패턴 적용 결과 기록 (설계 제안 부분) — **APPROVED 전환의 차단 요인** (실사용 필수 카테고리)
- [❌] 섹션 5 "발견된 gap"(NULL-safe SQL, rollbackFor 예시, 배치 내 ID 중복 규칙 등) SKILL.md 반영 검토 (선택 보강 — 차단 요인 아님)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-10-08 | v1 | 최초 작성 | skill-creator 절차(Claude) |
| 2026-10-08 | v1 | 2단계 실사용 테스트 수행 (Q1 편집 그리드 일괄 저장 배치 설계 / Q2 낙관적 잠금·롤백 함정 / Q3 X-API·REST 공존·Jakarta jar·SXSSF 엑셀) → 3/3 PASS, 마이그레이션 가이드 카테고리로 PENDING_TEST 유지 | skill-tester |
| 2026-10-08 | v1.1 | 설치 검수 반영 — Rust(Axum)용 `multipart-upload` 스킬을 가리키던 엑셀 업로드 안내(§7)를 Java 기준 본문으로 교체(`spring.servlet.multipart.max-file-size`·`max-request-size` 상한, `.xlsx` 화이트리스트 + ZIP 시그니처 확인, 행 수·셀 길이 상한, Bean Validation·권한·트랜잭션). §8 체크리스트의 `legacy-spec-extractor` 참조에 spec-extraction 템플릿 조건 표기 | Claude |
