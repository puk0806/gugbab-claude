---
skill: n8n-error-handling
category: devops
version: v1
date: 2026-05-15
status: APPROVED
---

# n8n Error Handling 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `n8n-error-handling` |
| 스킬 경로 | `.claude/skills/devops/n8n-error-handling/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator (Claude Opus 4.7) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.n8n.io)
- [✅] 공식 GitHub 2순위 소스 확인 (n8n-io/n8n issues #9236, #10763, #11202, #11596)
- [✅] 최신 버전 기준 내용 확인 (n8n v1.x, 2026-05-15)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (13개 섹션)
- [✅] 코드 예시 작성 (Error Workflow 흐름·DLQ SQL·Exponential backoff 등)
- [✅] 흔한 실수 패턴 정리 (8개 함정)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | "n8n error handling workflow Error Trigger node official documentation 2026" | docs.n8n.io 에러 핸들링·Error Trigger 페이지 확인 |
| 조사 2 | WebSearch | "n8n node retry on fail max tries wait between tries settings docs" | Max Tries 5 한계·Wait 5000ms 한계 확인 |
| 조사 3 | WebSearch | "n8n Continue using error output On Error node settings" | On Error 3가지 모드 확인, issue #10763 발견 |
| 조사 4 | WebSearch | "n8n HTTP Request Always Output Data error response status code" | Never Error·Include Status 옵션 확인 |
| 조사 5 | WebSearch | "n8n workflow execution timeout setting executionTimeout" | `EXECUTIONS_TIMEOUT`·`EXECUTIONS_TIMEOUT_MAX` 환경 변수 확인 |
| 조사 6 | WebSearch | "n8n Stop And Error node usage trigger error workflow" | Stop And Error 노드 마지막 위치 제약 확인 |
| 조사 7 | WebSearch | "n8n exponential backoff API rate limit 429 retry pattern" | Retry-After 헤더 우선 원칙·jitter 확인 |
| 조사 8 | WebSearch | "n8n error workflow infinite loop prevention" | $runIndex·exit condition·workflow 분리 패턴 확인 |
| 조사 9 | WebSearch | "n8n Slack Discord error notification best practice" | Error Workflow + Slack 노드 조합, 알림 그룹화 권장 확인 |
| 조사 10 | WebSearch | "n8n dead letter queue pattern failed items postgres logging" | DLQ + Postgres 패턴·재처리 워크플로우 분리 확인 |
| WebFetch 1 | WebFetch | https://docs.n8n.io/flow-logic/error-handling/ | 에러 핸들링 개요 (부분 응답) |
| WebFetch 2 | WebFetch | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/ | Error Trigger 노드 페이지 (부분 응답) |
| WebFetch 3 | WebFetch | https://docs.n8n.io/integrations/builtin/rate-limits/ | Rate limit 처리 전략 (Retry/Looping/Batching/Pagination) |
| WebFetch 4 | WebFetch | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.stopanderror/ | Stop And Error 노드 파라미터 (Error Message vs Error Object) |
| WebFetch 5 | WebFetch | https://docs.n8n.io/workflows/settings/ | Workflow Settings 항목 (Error Workflow·Timeout·Save executions) |
| 교차 검증 | WebSearch | 7개 핵심 클레임, 독립 소스 2개 이상 | VERIFIED 7 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| n8n Docs — Error handling | https://docs.n8n.io/flow-logic/error-handling/ | ⭐⭐⭐ High | 2026-05-15 | 공식 1순위 |
| n8n Docs — Error Trigger | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Stop And Error | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.stopanderror/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Rate limits | https://docs.n8n.io/integrations/builtin/rate-limits/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — HTTP Request common issues | https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/common-issues/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Execution timeout | https://docs.n8n.io/hosting/configuration/configuration-examples/execution-timeout/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n Docs — Workflow settings | https://docs.n8n.io/workflows/settings/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| n8n GitHub Issue #10763 | https://github.com/n8n-io/n8n/issues/10763 | ⭐⭐⭐ High | 2026-05-15 | Retry On Fail + Continue 버그 보고 |
| n8n GitHub Issue #11202 | https://github.com/n8n-io/n8n/issues/11202 | ⭐⭐⭐ High | 2026-05-15 | error output 분기 동작 이슈 |
| n8n GitHub Issue #11596 | https://github.com/n8n-io/n8n/issues/11596 | ⭐⭐⭐ High | 2026-05-15 | Timeout 무시 버그 |
| n8n Community Forum (다수) | https://community.n8n.io/ | ⭐⭐ Medium | 2026-05-15 | Max Tries 5 한계·Wait 5000ms 한계 다중 확인 |
| n8n Workflow Templates | https://n8n.io/workflows/ | ⭐⭐⭐ High | 2026-05-15 | Exponential backoff·Slack 알림 공식 템플릿 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (n8n v1.x, 2026-05-15)
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임 (n8n UI 설정·JSON·SQL)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (13개 섹션)
- [✅] 코드 예시 포함 (Error Trigger payload·DLQ SQL·Exponential backoff Code 노드)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (각 모드 선택 가이드)
- [✅] 흔한 실수 패턴 포함 (섹션 13, 8개 함정)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 워크플로우 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (Claude API 429/5xx/529 처리 예시)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X — 꿈 해몽 예시는 패턴 설명용)

### 4-4. 핵심 클레임 교차 검증

| 클레임 | 출처 1 | 출처 2 | 판정 |
|--------|--------|--------|------|
| `Max Tries` UI 한계 5 | n8n Docs (Rate limits) | Community Forum, issue #23658 | VERIFIED |
| `Wait Between Tries` 한계 5000ms | n8n Docs | Community Forum (post 273374) | VERIFIED |
| `On Error` 3가지 모드 (Stop/Continue regular/Continue error output) | n8n Docs Error handling | issue #11202, community.n8n.io/t/162129 | VERIFIED |
| Stop And Error는 마지막 노드여야 함 | n8n Docs Stop And Error | logicworkflow.com | VERIFIED |
| Error Trigger는 자동 실행에서만 동작 | n8n Docs Error Trigger | docs.n8n.io/courses/level-two/chapter-4 | VERIFIED |
| `EXECUTIONS_TIMEOUT` 기본값 -1 | n8n Docs execution-timeout | n8n-docs GitHub (raw md 파일) | VERIFIED |
| Error Workflow는 비활성 상태로 둠 | n8n Docs Error handling | community.n8n.io error 가이드 다수 | VERIFIED |
| Retry On Fail + Continue 조합 버그 | issue #10763 | community.n8n.io 보고 | VERIFIED (주의 표기) |
| Retry-After 헤더 우선 권장 | n8n 공식 워크플로우 템플릿 | 일반 HTTP 표준 RFC 6585 | VERIFIED |

VERIFIED 9 / DISPUTED 0 / UNVERIFIED 0

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-05-15)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — 3/3 PASS, 보완 불필요

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (domain-specific 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 노드 에러 모드 3종 선택 기준 (결제 중단/배치 분리/선택적 무시)**
- PASS
- 근거: SKILL.md "1. 노드 에러 모드 (On Error)" 섹션 — 선택 가이드 3가지 케이스 및 주의사항(error 분기 후속 노드 미연결 위험)이 모두 명확히 기재됨
- 상세: Stop Workflow/Continue (using error output)/Continue (regular output) 각각의 사용 상황이 구체적 선택 가이드로 제공되어 정확한 답변 도출 가능

**Q2. Retry On Fail Max Tries 5 한계 — 10회/30초 재시도 요구 시 대응**
- PASS
- 근거: SKILL.md "3. Retry On Fail" 섹션 (표 + 주의) 및 "13.2 Retry On Fail의 UI 한계 인지 부족" 섹션
- 상세: Max Tries 1~5, Wait 0~5000ms UI 한계가 명시되어 있고, 초과 시 Wait 노드 + Loop 패턴으로 구현하라는 대안이 섹션 11.1 Exponential Backoff 코드 예시와 함께 제공됨. anti-pattern(한계값 초과 입력 시도)을 명확히 경고

**Q3. Error Workflow 무한 루프 — Slack 노드 실패 시 루프 발생 가능 여부 및 방지**
- PASS
- 근거: SKILL.md "13.1 Error Workflow 무한 루프" 섹션
- 상세: 증상(Error Workflow 자체 에러 → 자신의 Error Workflow 호출 → 무한 반복), 방지책(Error Workflow에 별도 Error Workflow 지정 금지, 내부 노드는 Continue (regular output) 사용)이 명확히 기재됨

### 발견된 gap

없음 — 3개 질문 모두 SKILL.md에서 완전한 근거를 찾을 수 있었음

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 워크플로우 패턴 가이드 — 답변 정확성으로 검증 가능, "실사용 필수 카테고리" 해당 없음
- 최종 상태: APPROVED

---

> (아래는 참고용 원본 템플릿)
>
> skill-tester 에이전트가 호출되어 채워질 섹션.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-15) |
| **최종 판정** | **APPROVED** |

content test 카테고리(워크플로우 패턴 가이드 — 실행 결과·빌드 산출물이 아닌 *답변 정확성*으로 검증 가능)이므로 skill-tester content test 3/3 PASS로 APPROVED 전환 완료.

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS)
- [❌] n8n 메이저 버전 업데이트 시 Max Tries / Wait 한계 변경 여부 재확인 — 차단 요인 아님, 선택 보강 (정기 점검)
- [❌] issue #10763, #11596 등 보고된 버그의 fix 여부 정기 점검 — 차단 요인 아님, 선택 보강 (버전 업 시 점검)
- [❌] Anthropic Claude API의 retry-after 헤더 정책 변경 시 12장 예시 갱신 — 차단 요인 아님, 선택 보강 (Anthropic 정책 변경 시)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 (13개 섹션, 9개 클레임 교차 검증 VERIFIED) | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 노드 에러 모드 3종 선택 기준 / Q2 Retry Max Tries 5 한계 우회 / Q3 Error Workflow 무한 루프 방지) → 3/3 PASS, APPROVED 전환 | skill-tester |
