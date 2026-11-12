---
name: n8n-error-handling
description: >
  n8n 2.x 에러 처리의 실측 값·함정 — Retry On Fail 범위(Max Tries 2~5·기본 3, Wait 0~5000ms·기본 1000), On Error 3모드 정확한 동작, Continue+Retry 조합 무시(#10763), Error Workflow는 Publish 불필요·수동 실행 미동작·무한 루프, 2.0 Save/Publish 모델, 3.0 Always Output Data 변경, EXECUTIONS_TIMEOUT 기본값.
disable-model-invocation: true
---

# n8n Error Handling (에러 처리 패턴)

> 소스:
> - https://docs.n8n.io/build/flow-logic/handle-errors-gracefully.md (구 https://docs.n8n.io/flow-logic/error-handling/ — 2026-09 n8n 문서 사이트 개편으로 경로 변경)
> - https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/
> - https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.stopanderror/
> - https://docs.n8n.io/integrations/builtin/rate-limits/
> - https://docs.n8n.io/hosting/configuration/configuration-examples/execution-timeout/
> - https://docs.n8n.io/workflows/settings/
> - https://github.com/n8n-io/n8n/blob/master/packages/frontend/editor-ui/src/features/ndv/shared/ndv.utils.ts (Retry On Fail 범위·기본값)
> - https://docs.n8n.io/changelog/v30-breaking-changes.md
> 검증일: 2026-11-09 (최초 작성 2026-05-15, 재검증 2026-09-28 · 2026-11-09 — 기준 stable n8n 2.46.6, 3.0 은 early access)
>
> 짝 스킬: `n8n-self-hosting` (셀프 호스팅 환경 변수·확장)

> 주의 (2026-09-28 검증 기록): n8n이 1.x에서 **2.x로 메이저 버전이 올라갔다**(최신 릴리즈 `n8n@2.40.7`, 2026-09-25 기준 — GitHub Releases API로 확인). 공식 문서 사이트도 URL 구조가 개편되었다(`/flow-logic/...` → `/build/flow-logic/...`). 당시 직접 재대조하지 못했던 Retry On Fail UI 한계치·On Error 3모드 세부 동작은 2026-11-09 n8n 소스로 대조해 해소했다(Max Tries 최소값만 1→2 정정).
>
> 주의 (2026-09-28 형제 스킬 정합 보완): 워크플로우 "활성화(Active 토글)" 모델이 2.0부터 **Save(자동 초안 저장)/Publish(게시) 분리 모델**로 바뀌었다 — "n8n will enable the following: ... Events from connected apps will trigger this workflow" (https://docs.n8n.io/build/understand-workflows/save-and-publish-workflows.md, https://docs.n8n.io/changelog/v20-breaking-changes.md "Saving and publishing workflows").

---

## 이 스킬의 범위

n8n 2.x 기준 UI 한계값, 모드별 정확한 동작, 버전 변경점, 실측·이슈로 확인된 함정만 싣는다.
> 기본 사용법(Error Trigger 연결, 알림 노드, 지수 백오프·DLQ·Circuit Breaker 같은 일반 재시도 설계)은 공식 문서·일반 지식 수준이라 싣지 않는다.

---

## 1. On Error 3모드 (노드 Settings → On Error)

| 모드 | 동작 |
|------|------|
| `Stop Workflow` (기본) | 노드 실패 → 전체 워크플로우 실패, Error Workflow 트리거 |
| `Continue (using error output)` | 에러 정보를 별도 `error` 출력 분기로 보냄. 정상은 그대로 흐름 |
| `Continue` (내부 값 `continueRegularOutput`, 구 표기 "Continue (regular output)") | 에러 메시지를 **일반 출력의 item 으로** 실어 다음 노드로 계속 진행 — 성공·실패 item 이 한 출력에 섞인다 (UI 설명 "Pass error message as item in regular output", 2026-11-09 소스 확인). 후속 노드가 `json.error`를 직접 걸러야 해 권장 안 함 |

> 주의: `Continue (using error output)` 사용 시 error 분기에 *반드시* 후속 노드를 연결한다(최소 `NoOp`·로그 노드). 후속 노드가 없으면 일부 버전에서 의도치 않은 동작이 보고된 사례가 있다.

---

## 2. Retry On Fail — UI 한계값

| 옵션 | 범위 | 기본값 |
|------|------|--------|
| `Max Tries` | 2~5 | 3 (UI 최소 2·최대 5 — 2026-11-09 n8n 소스 `ndv.utils.ts` 확인) |
| `Wait Between Tries (ms)` | 0~5000 | 1000 |

> 주의: `Max Tries`는 UI 입력 한계가 5, `Wait Between Tries`는 5000ms로 제한된다. 더 긴 대기·더 많은 재시도·진짜 exponential backoff(내장은 고정 간격)가 필요하면 **Wait 노드 + Loop 패턴**으로 외부에서 구현한다. 429는 `Include Response Headers and Status`로 `Retry-After`를 받아 우선 사용.

### ⚠️ `On Error: Continue` + Retry 조합

`Retry On Fail = ON` + `On Error = Continue (using error output)`에서는 `Max Tries`·`Wait Between Tries` 설정이 **무시될 수 있다** (issue #10763). Retry가 실제로 동작해야 하면 `On Error = Stop Workflow`.

---

## 3. Error Workflow — 잘못 알기 쉬운 점

- 대상 워크플로우 **Settings → Error Workflow**에서 `Error Trigger`로 시작하는 워크플로우를 지정.
- Error Workflow 자체는 **게시(Publish)하지 않아도 된다** — 다른 워크플로우의 에러 발생 시 내부적으로 호출되므로 Publish 불필요 (n8n 2.x — 구버전의 "비활성 상태로 둔다"와 동일 취지. 공식 가이드도 Error Trigger 워크플로우 생성 시 "Select Save"만 안내).
- **수동 실행에서는 Error Trigger가 동작하지 않는다.** 테스트는 대상 워크플로우를 **Publish**한 상태(구버전은 Active)에서 Stop And Error 노드로 강제 실패.
- 워크플로우가 Error Trigger 노드를 자기 자신에 포함하면 별도 지정 없이 자기 자신이 Error Workflow로 동작한다.
- **무한 루프**: Error Workflow에 다시 Error Workflow를 지정하지 않는다. 내부 노드는 `On Error = Continue`로 두거나 외부 알림 노드만.
- Error Trigger 데이터: `execution.{id, url, retryOf, error.{message, stack}, lastNodeExecuted}`, `workflow.{id, name}`. `execution.id`/`url`은 `Save failed production executions`가 켜져 있어야 채워지고(꺼져 있으면 빈 값), `retryOf`는 재시도 실행일 때만 존재.

---

## 4. HTTP Request 옵션 동작

- `Always Output Data`: 에러를 막는 게 아니라 빈 응답일 때도 출력을 만들어 후속 노드가 죽지 않게 한다.

> 주의 (n8n 3.0, early access): 출력이 여러 개인 노드(IF·Switch)에서 Always Output Data 를 켜면, 3.0 부터는 **모든 출력이 비었을 때만** 빈 item 1개를 낸다(2.x 는 빈 출력마다 빈 item → 실행되면 안 되는 분기가 돌았음). 이 동작에 기대는 에러 분기가 있으면 업그레이드 전 **Settings → Migration Report** 로 확인한다.

- `Response: Never Error`: **모든 HTTP status code를 success로 처리** → `$json.statusCode`로 직접 분기.
- 노드 `Options → Timeout` 기본 300000ms(5분).

---

## 5. 타임아웃

- 워크플로우: **Workflow Settings → Timeout Workflow** → `Timeout After`.
- 인스턴스(셀프 호스팅):

| 환경 변수 | 기본값 | 의미 |
|-----------|--------|------|
| `EXECUTIONS_TIMEOUT` | `-1` (비활성) | 모든 워크플로우 기본 타임아웃 (초) |
| `EXECUTIONS_TIMEOUT_MAX` | `3600` | 워크플로우 개별 설정의 상한 (초) |

- 메인 프로세스 실행이면 soft timeout(현재 노드 완료 후 중단), 별도 프로세스면 soft timeout 후 1/5 시간 대기 → kill.
- `EXECUTIONS_TIMEOUT` 설정에도 워크플로우가 계속 실행되는 버그가 일부 버전(v1.x)에서 보고됨(issue #11596) → 노드 레벨 타임아웃도 함께 설정.
- 실패 실행은 `Save failed production executions`가 켜져 있어야 Executions 탭·REST API(`GET /executions?status=error`)에 남는다.

---

## 6. Claude API 호출 시 상태 코드별 처리 (참고)

- 429 → `Retry-After` 헤더 우선, 5xx → 클라이언트 측 backoff, **529(overloaded) → 즉시 재시도보다 DLQ로 미뤄 배치 재처리**, 그 외 → Stop And Error로 Error Workflow 트리거. 긴 응답을 고려해 노드 타임아웃 60초 정도.
