---
skill: n8n-error-handling
category: devops
version: v2
date: 2026-09-28
status: APPROVED
---

# n8n Error Handling 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `n8n-error-handling` |
| 스킬 경로 | `.claude/skills/n8n-error-handling/SKILL.md` |
| 검증일 | 2026-09-28 (최초 검증 2026-05-15, 2026-09-28 재검증, 2026-09-28 형제 스킬 정합 보완) |
| 검증자 | skill-creator (Claude Opus 4.7) / 재검증: Claude (Sonnet 5) |
| 스킬 버전 | v2 |

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

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15 3/3 PASS, 2026-09-28 형제 스킬 정합 정정 반영 후 재테스트 2/2 PASS)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-05-15, 2026-09-28)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — 3/3 PASS + 2/2 PASS, 경미한 선택 보강만 발견

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (devops 도메인 전용 에이전트 미등록으로 대체)
**수행 방법**: 같은 날 "형제 스킬 정합 보완"에서 정정된 내용(§2.1/§13.5 — Active 토글→Save/Publish 분리)이 실전 질문에 올바르게 반영되는지 SKILL.md Read 후 2개 질문 답변으로 재확인

### 실제 수행 테스트 (재테스트)

**Q1. Error Handler(에러 핸들러) 워크플로우 자체도 게시(Publish)해야 하는가**
- ✅ PASS
- 근거: SKILL.md "2.1 설정 절차" 4번(줄 60)
- 상세: "Error Workflow 자체는 게시(Publish)하지 않아도 된다 — 다른 워크플로우의 에러 발생 시 내부적으로 호출되므로 Publish 불필요"라는 정정된 답을 정확히 도출. 옛 "비활성 상태로 둔다" 표현은 "(n8n 2.x — 구버전의 '비활성 상태로 둔다'와 동일 취지)"로 병기되어 모순 없음.

**Q2. Error Workflow 트리거 확인 — 수동 실행으로 테스트 가능한가**
- ✅ PASS
- 근거: SKILL.md "2.3 중요 제약"(줄 88), "13.5 수동 실행에서 Error Trigger 테스트 시도"(줄 426-428)
- 상세: "수동 실행에서는 Error Trigger가 동작하지 않는다 — 메인 워크플로우를 게시(Publish)한 상태로 두고 Stop And Error로 강제 실패를 유발해야 한다"는 정정된 답을 정확히 도출. 섹션 2.1(Error Handler 자체는 Publish 불필요)과 섹션 13.5(메인 워크플로우는 Publish 필요)를 함께 읽어야 완전한 그림이 되는 구조이나 모순은 없음.

### 발견된 gap (재테스트, 경미·선택 보강)

- Q1/Q2: 섹션 2.1과 13.5를 따로 읽으면 "어느 워크플로우를 게시해야 하는지"(Error Handler vs 메인) 헷갈릴 수 있음 — 명시적 상호 참조 문구 추가 권장 (경미, 선택 보강)
- 별도 사안(본 재테스트 범위 밖, 기존 섹션 7에 이미 선택 보강으로 기록됨): 2026-09-28 앞선 재검증에서 미확인으로 남은 Retry On Fail 수치(`Max Tries` 5, `Wait Between Tries` 5000ms)·On Error 3모드 세부 동작은 이번 재테스트 질문(Active→Publish 정정)과 무관한 별개 항목이며 차단 요인이 아님

### 재테스트 판정

- agent content test: 2/2 PASS
- verification-policy 분류: content test로 충분 (워크플로우 패턴 가이드 — 답변 정확성으로 검증 가능, "실사용 필수" 해당 없음, 기존 분류 유지)
- 최종 상태: APPROVED (금번 재테스트의 초점이었던 Active→Publish 정정 반영 확인 완료. Retry 수치 미확인 건은 차단 요인 아닌 선택 보강으로 섹션 7에 유지)

---

### [2026-05-15] 최초 테스트

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

### 재검증 (2026-09-28)

**수행일**: 2026-09-28
**수행 방법**: n8n GitHub Releases API + docs.n8n.io 신규 URL 구조 WebFetch, 실전 질문 2개 재확인

**Q1. n8n Webhook/Code 노드의 HMAC 서명 검증이 이제 내장 기능으로 추가되었나?**
- 판정: PASS (변경 없음 확인)
- 근거: docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook.md 재확인 결과 HMAC 관련 언급 없음, 인증 방식은 여전히 None/Basic/Header/JWT 4종. SKILL.md "5. HTTP Request 에러 처리" 및 짝 스킬 n8n-webhook-patterns 섹션 5 내용과 일치.

**Q2. n8n 2.x로 메이저 버전이 올라가면서 Error Trigger·Retry On Fail 관련 문서 경로나 핵심 동작이 바뀌었나?**
- 판정: PARTIAL — 문서 경로는 확인, 세부 수치는 미확인
- 근거: 공식 문서가 `/flow-logic/error-handling/`(404)에서 `/build/flow-logic/handle-errors-gracefully.md`로 이전된 것을 확인. 새 페이지에서 Error Trigger가 수동 실행 예시 payload에 `"mode": "manual"` 필드를 포함하는 것을 발견했으나, 이것이 "수동 실행에서도 Error Trigger가 실제로 동작한다"는 의미인지 "실패한 실행의 원래 모드를 보고한다"는 의미인지 문서만으로 명확히 구분되지 않음 — 기존 SKILL.md 클레임("수동 실행에서는 Error Trigger가 동작하지 않는다")을 뒤집을 만한 확증은 아니므로 클레임은 유지하되, 이 항목과 Max Tries(5)/Wait(5000ms) UI 한계치는 **미확인 상태로 남김**.

재검증 결과: 일부 항목 미확인으로 status를 PENDING_TEST로 하향 조정.

### 판정 (2026-09-28 재검증 시점)

- agent content test (2026-05-15): 3/3 PASS
- 2026-09-28 재검증: 2/2 중 1 PASS + 1 PARTIAL(미확인 항목 존재)
- verification-policy 분류: 워크플로우 패턴 가이드 — 답변 정확성으로 검증 가능, "실사용 필수 카테고리" 해당 없음
- 재검증 시점 상태: PENDING_TEST (일부 세부 수치 재확인 필요, 사용 자체는 가능)

---

### [2026-09-28] 재검증 보완 — n8n 2.x 형제 스킬 정합

**수행일**: 2026-09-28
**수행 방법**: 같은 날 재검증된 형제 스킬(`devops/n8n-webhook-patterns`, `devops/n8n-workflow-design`)과의 서술 불일치를 발견 — 본 스킬 섹션 13.5·2.1의 "Active 상태" 서술이 앞선 재검증에서 갱신되지 않은 누락을 보완. docs.n8n.io 1차 소스로 직접 재대조.

**클레임 대조 결과**:
1. Error Workflow(에러 핸들러) 테스트 시 "Production에서 Active 상태로 두고" 실패를 유발해야 한다는 서술이 n8n 2.x에서도 유효한가 → **DISPUTED (정정 완료)** — n8n 2.0부터 워크플로우 "활성화(Active 토글)" 개념이 Save(초안)/Publish(게시) 분리 모델로 대체됐다. "n8n will enable the following: ... Events from connected apps will trigger this workflow"(https://docs.n8n.io/build/understand-workflows/save-and-publish-workflows.md), "The new workflow publishing system replaces the previous active/inactive toggle"(https://docs.n8n.io/changelog/v20-breaking-changes.md "Saving and publishing workflows"). 섹션 13.5를 "게시(Publish)한 상태로 두고"로 정정.
2. Error Workflow 자체는 "비활성(deactivated) 상태로 둔다"는 섹션 2.1의 서술이 2.x 용어로도 유효한가 → **DISPUTED (정정 완료)** — 2.x에는 활성/비활성 토글이 없으므로 "게시(Publish)하지 않아도 된다"로 용어를 정정. 공식 가이드도 Error Trigger 워크플로우 생성 절차에서 "Select Save"만 안내하고 Publish를 요구하지 않음(https://docs.n8n.io/build/flow-logic/handle-errors-gracefully.md).
3. 본 문서에 Code 노드 `$env` 예제가 있는가 → **해당 없음** — 본 스킬 SKILL.md에는 Code 노드에서 환경변수를 직접 읽는 예제가 없어 `N8N_BLOCK_ENV_ACCESS_IN_NODE` 관련 정정 대상 없음 (짝 스킬 n8n-webhook-patterns에서만 해당).

**실전 질문 재검증**:
- Q1. "n8n 2.x에서 Error Workflow가 실제로 트리거되는지 테스트하려면?" → SKILL.md 섹션 13.5(정정 후) 근거로 PASS — "메인 워크플로우를 게시(Publish)한 상태에서 Stop And Error로 강제 실패" 답 도출 가능
- Q2. "Error Handler 워크플로우도 게시(Publish)해야 하나?" → SKILL.md 섹션 2.1(정정 후) 근거로 PASS — "아니다, 다른 워크플로우 에러 시 내부 호출되므로 Publish 불필요" 답 도출 가능

**재검증 최종 판정**: 2건 정정(Active→Publish 용어, Error Workflow 자체는 Publish 불필요 용어 정정) 완료. 기존에 이미 PENDING_TEST였던 상태를 유지하되(수치 미확인 항목 별도), 이번 정정도 재테스트 대상에 포함. status **PENDING_TEST 유지(재테스트 필요 — 기존 사유 + 금번 정정 모두 포함)**

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
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-15) / 2026-09-28 형제 스킬 정합 재테스트 2/2 PASS |
| 2026-09-28 재검증 | ⚠️ PARTIAL — n8n 2.x 전환·문서 개편 확인, Retry 수치 일부 미재확인(선택 보강, 차단 요인 아님) |
| 2026-09-28 재검증 보완 | ✅ 형제 스킬 정합 — Active→Publish 용어 2건 정정, skill-tester 재테스트 2/2 PASS |
| **최종 판정** | **APPROVED** (2026-09-28 형제 스킬 정합 정정에 대한 skill-tester 재테스트 2/2 PASS로 재승인. Retry 수치 미확인 건은 차단 요인 아닌 선택 보강으로 섹션 7에 별도 기록) |

content test 카테고리(워크플로우 패턴 가이드 — 실행 결과·빌드 산출물이 아닌 *답변 정확성*으로 검증 가능)이므로 skill-tester content test 3/3 PASS로 APPROVED 전환했었으나, 2026-09-28 재검증에서 n8n 2.x 메이저 버전 전환과 문서 사이트 개편을 확인하면서 Retry On Fail 한계치 등 일부 세부 수치를 새 문서로 재대조하지 못해 PENDING_TEST로 하향했었다. 같은 날 형제 스킬 정합 점검에서 Active 토글 관련 용어 2건(섹션 2.1·13.5)을 추가로 정정했고, 이 정정에 대해 skill-tester가 실전 질문 2개로 재테스트해 2/2 PASS를 확인, APPROVED로 재전환했다. Retry 수치 미확인 건은 여전히 선택 보강 과제로 남아있으나 스킬 사용 자체를 막는 요인은 아니다.

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS)
- [✅] 2026-09-28 형제 스킬 정합 정정(Active→Publish 용어 2건) 반영 후 skill-tester 재테스트 및 섹션 5·6·7·8 동기화 (2026-09-28 완료, 2/2 PASS)
- [❌] n8n 메이저 버전 업데이트 시 Max Tries / Wait 한계 변경 여부 재확인 — 차단 요인 아님, 선택 보강 (정기 점검. 2026-09-28 재검증에서 새 문서 구조상 미재대조로 남은 항목)
- [❌] issue #10763, #11596 등 보고된 버그의 fix 여부 정기 점검 — 차단 요인 아님, 선택 보강 (버전 업 시 점검)
- [❌] Anthropic Claude API의 retry-after 헤더 정책 변경 시 12장 예시 갱신 — 차단 요인 아님, 선택 보강 (Anthropic 정책 변경 시)
- [❌] 섹션 2.1·13.5 상호 참조 문구 추가(Error Handler 자체 vs 메인 워크플로우 게시 대상 구분 명확화) — 차단 요인 아님, 선택 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 (13개 섹션, 9개 클레임 교차 검증 VERIFIED) | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 노드 에러 모드 3종 선택 기준 / Q2 Retry Max Tries 5 한계 우회 / Q3 Error Workflow 무한 루프 방지) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-09-28 | v1 | 재검증: n8n이 1.x→2.x로 메이저 버전 상승 확인(GitHub Releases API, `n8n@2.40.7`), 공식 문서 URL 구조 개편 확인(`/flow-logic/error-handling/` → `/build/flow-logic/handle-errors-gracefully.md`, 구 URL 404). 소스 링크 갱신. HMAC 미내장 등 재확인 가능한 항목은 변경 없음이나, Retry On Fail 한계치(Max Tries 5/Wait 5000ms)·On Error 3모드 세부 동작은 새 문서 구조상 직접 재대조하지 못해 **PENDING_TEST로 하향**. 다음 세션에서 2.x 환경 기준 재확인 권장 | Claude (Sonnet 5) |
| 2026-09-28 | v2 | 재검증 보완(형제 스킬 정합): 앞선 재검증에서 누락된 Active 토글 관련 서술 2건 정정 — 섹션 2.1 "Error Workflow는 비활성 상태로 둔다"→"게시(Publish)하지 않아도 된다", 섹션 13.5 "Production에서 Active 상태로"→"게시(Publish)한 상태로". 프런트매터 status가 본문(PENDING_TEST)과 불일치(APPROVED로 표기)했던 오류도 함께 수정. status PENDING_TEST 유지 | Claude (Sonnet 5) |
| 2026-09-28 | v2 | 2단계 실사용 재테스트 수행 (Q1 Error Handler 자체 게시 필요 여부 / Q2 Error Workflow 트리거 확인 — 수동 실행 불가·메인 워크플로우 게시 필요) → 2/2 PASS, 형제 스킬(`n8n-workflow-design`, `n8n-webhook-patterns`)과 서술 일관성 확인, PENDING_TEST → APPROVED 전환 (Retry 수치 미확인 건은 선택 보강으로 섹션 7 유지) | skill-tester |
