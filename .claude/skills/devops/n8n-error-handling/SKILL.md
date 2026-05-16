---
name: n8n-error-handling
description: >
  n8n 워크플로우의 에러 처리·재시도·알림 패턴 가이드. 노드 에러 모드, Error Trigger
  워크플로우, Retry On Fail, HTTP 429/5xx 대응, Dead Letter Queue, 타임아웃,
  알림 라우팅까지 프로덕션 운영에 필요한 패턴 정리.
---

# n8n Error Handling (에러 처리 패턴)

> 소스:
> - https://docs.n8n.io/flow-logic/error-handling/
> - https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/
> - https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.stopanderror/
> - https://docs.n8n.io/integrations/builtin/rate-limits/
> - https://docs.n8n.io/hosting/configuration/configuration-examples/execution-timeout/
> - https://docs.n8n.io/workflows/settings/
> 검증일: 2026-05-15
> 짝 스킬: `devops/n8n-workflow-design` (워크플로우 설계 기본), `devops/n8n-self-hosting` (셀프 호스팅 환경 변수·확장)

---

## 1. 노드 에러 모드 (On Error)

각 노드의 **Settings → On Error** 에서 에러 발생 시 동작을 지정한다.

| 모드 | 동작 |
|------|------|
| `Stop Workflow` (기본) | 노드 실패 → 전체 워크플로우 실패, Error Workflow 트리거 |
| `Continue (using error output)` | 에러 정보를 별도 `error` 출력 분기로 보냄. 정상은 그대로 흐름 |
| `Continue (regular output)` | 에러 발생 시 빈 출력으로 계속 진행 (에러 정보 손실) |

**선택 가이드:**
- 실패가 워크플로우 자체를 중단해야 한다 → `Stop Workflow`
- 실패한 item만 분리해서 별도 처리하고 싶다 → `Continue (using error output)`
- 실패해도 무시하고 다음 노드로 흘려보내고 싶다 → `Continue (regular output)` (권장 안함, 디버깅 어려움)

```
[HTTP Request] ──success──> [Process]
       │
       └──error──> [Log Failure] → [Slack Alert]
```

> 주의: `Continue (using error output)` 사용 시 error 분기에 *반드시* 후속 노드를 연결한다. 후속 노드가 없으면 일부 버전에서 의도치 않은 동작이 보고된 사례가 있다.

---

## 2. Error Workflow (전역 에러 핸들러)

### 2.1 설정 절차

1. **새 워크플로우 생성** → 첫 노드로 `Error Trigger` 추가
2. 워크플로우 이름을 `Error Handler` 등으로 지정
3. **본 워크플로우의 Settings → Error Workflow** 에서 위 워크플로우 선택
4. Error Workflow 자체는 **비활성(deactivated) 상태로 둔다** — 자동 호출되므로 활성화 불필요

### 2.2 Error Trigger가 받는 데이터 구조

```json
{
  "execution": {
    "id": "231",
    "url": "https://n8n.example.com/execution/231",
    "retryOf": "34",
    "error": {
      "message": "...",
      "stack": "..."
    },
    "lastNodeExecuted": "HTTP Request"
  },
  "workflow": {
    "id": "1",
    "name": "Dream Interpretation Pipeline"
  }
}
```

- `execution.id` / `execution.url` — 데이터베이스에 실행 기록이 저장되어야 채워짐 (n8n Settings에서 `Save successful/failed executions` 활성화 필요)
- `execution.retryOf` — 재시도 실행인 경우에만 존재

### 2.3 중요 제약

- **수동 실행에서는 Error Trigger가 동작하지 않는다.** Production(자동) 실행에서만 트리거된다.
- 워크플로우가 *Error Trigger 노드를 자기 자신에 포함*하면, 별도 Error Workflow를 지정하지 않아도 자기 자신이 Error Workflow로 동작한다.

---

## 3. Retry On Fail (노드 재시도)

각 노드의 **Settings → Retry On Fail** 활성화 후 다음 옵션 설정.

| 옵션 | 범위 | 기본값 | 의미 |
|------|------|--------|------|
| `Max Tries` | 1~5 | 3 | 최대 시도 횟수 (UI 한계 5) |
| `Wait Between Tries (ms)` | 0~5000 | 1000 | 재시도 사이 대기 시간 (UI 한계 5000ms) |

> 주의: `Max Tries`는 UI 입력 한계가 5, `Wait Between Tries`는 5000ms로 제한된다. 더 긴 대기·더 많은 재시도가 필요하면 **Wait 노드 + Loop 패턴**으로 외부에서 구현한다.

### 3.1 ⚠️ 함정: `On Error: Continue` + Retry 조합

```
Retry On Fail = ON
On Error      = Continue (using error output)
```

이 조합에서는 `Max Tries`·`Wait Between Tries` 설정이 **무시될 수 있다** (issue #10763 참조). Retry가 의도대로 동작하려면 `On Error = Stop Workflow`로 둬야 한다.

---

## 4. Try/Catch 패턴 (Error Output Branch)

n8n에는 별도 try/catch 구문이 없다. 대신 노드의 **에러 출력 분기**를 IF 노드와 조합한다.

```
[HTTP Request: On Error = Continue (using error output)]
       │
       ├─[success output]─> [Parse JSON] ─> [Save to DB]
       │
       └─[error output]───> [IF: status code == 429]
                                 ├─true──> [Wait 60s] ─> [Retry node]
                                 └─false─> [Log + Slack Alert]
```

핵심:
- 에러 분기에서 받은 item은 `json.error`·`json.code` 등 에러 정보를 포함
- IF 노드로 에러 종류 분기 → 복구 가능한 에러는 재처리, 치명적 에러는 알림

---

## 5. HTTP Request 에러 처리

### 5.1 `Always Output Data`

옵션을 켜면 응답이 비어있어도 노드가 출력을 생성한다. *에러를 발생시키지 않는 것이 아니라*, 빈 응답일 때 후속 노드가 죽지 않도록 한다.

### 5.2 `Never Error`

`Response: Never Error` 옵션을 켜면 **모든 HTTP status code를 success로 처리**한다 (2xx 외 응답도 포함). status code 기반 분기를 직접 작성할 때 유용하다.

```
[HTTP Request: Never Error = ON, Response = Include status code]
       │
       v
[IF: $json.statusCode >= 500] ──true──> [Retry path]
                                └─false─> [Normal flow]
```

### 5.3 `Include Response Headers and Status`

응답 본문 외에 헤더·상태 코드를 함께 출력한다. 429 응답의 `Retry-After` 헤더 추출에 필수.

---

## 6. 알림 (Slack / Discord / Email / Telegram)

Error Workflow 내부에서 알림 노드를 호출한다.

### 6.1 Slack 알림 (권장 메시지 구조)

```
[Error Trigger]
      │
      v
[Slack: Send Message]
  channel: #ops-alerts
  text:
    *Workflow Failed* {{ $json.workflow.name }}
    Node: {{ $json.execution.lastNodeExecuted }}
    Error: {{ $json.execution.error.message }}
    Execution: {{ $json.execution.url }}
```

### 6.2 다중 채널 + AI 분석 (선택)

```
[Error Trigger]
      │
      ├─> [Postgres: 에러 로그 적재]
      ├─> [Slack: 즉시 알림]
      ├─> [Discord: 백업 알림]
      └─> [Anthropic Claude: 원인 분석] ─> [Slack thread reply]
```

### 6.3 ⚠️ 알림 스팸 방지

- **에러 그룹화**: 같은 워크플로우·같은 노드에서 N분 내 중복 에러는 1회만 알림 (Redis 또는 Postgres `last_alerted_at` 컬럼 활용)
- **레벨 분리**: WARN(`Continue using error output`로 일부 실패) vs CRITICAL(`Stop Workflow`)
- **시간대 라우팅**: 업무 시간 외에는 Slack 대신 PagerDuty 등 호출 채널 사용

---

## 7. 실패 데이터 로깅

실패 item을 별도 저장해 나중에 재처리할 수 있게 한다.

### 7.1 Postgres 로깅

```sql
CREATE TABLE workflow_failures (
  id           BIGSERIAL PRIMARY KEY,
  workflow_id  TEXT,
  workflow_name TEXT,
  execution_id TEXT,
  failed_at    TIMESTAMPTZ DEFAULT now(),
  node_name    TEXT,
  error_message TEXT,
  payload      JSONB,
  retry_count  INT DEFAULT 0,
  status       TEXT DEFAULT 'pending'  -- pending | retrying | resolved | dead
);
```

Error Workflow에서 `Postgres: Insert` 노드로 위 테이블에 기록.

### 7.2 Google Sheets 로깅 (소규모)

DB가 없을 때는 Google Sheets `Append Row` 노드로 실패 로그를 적재. 단순 모니터링 용도로 충분하다.

---

## 8. Dead Letter Queue (DLQ) 패턴

### 8.1 구조

```
[메인 워크플로우]
   │
   ├─> 정상 처리
   │
   └─> 실패 → [DLQ 테이블 INSERT (status=pending)]

[재처리 워크플로우] (Schedule Trigger: 5분마다)
   │
   v
[Postgres: SELECT * FROM dlq WHERE status='pending' AND retry_count < 5]
   │
   v
[원래 처리 로직 재실행]
   ├─success─> [UPDATE status='resolved']
   └─error───> [UPDATE retry_count++, status='retrying']
                  │
                  └─ retry_count >= 5 → [UPDATE status='dead'] + [Slack 수동 검토 요청]
```

### 8.2 DLQ 원칙

- **원본 페이로드 보존**: 재처리하려면 원래 input 데이터가 필요. `payload JSONB`에 통째로 저장
- **최대 재시도 횟수 cap**: 5회 등 상한 설정, 초과 시 `dead` 상태로 격리
- **재처리는 별도 워크플로우**: 메인 워크플로우와 분리해야 메인이 DLQ 처리 부하로 막히지 않음
- **idempotency**: 재처리 시 중복 처리되지 않도록 비즈니스 로직에 idempotency key 확보

---

## 9. 타임아웃

### 9.1 노드 레벨

HTTP Request 노드의 `Options → Timeout` (밀리초). 기본 300000ms(5분). 외부 API 응답이 느리면 직접 조정.

### 9.2 워크플로우 레벨

**Workflow Settings → Timeout Workflow** 활성화 → `Timeout After` 에 시·분·초 지정. 지정 시간 초과 시 워크플로우가 취소된다.

### 9.3 인스턴스 레벨 (셀프 호스팅)

| 환경 변수 | 기본값 | 의미 |
|-----------|--------|------|
| `EXECUTIONS_TIMEOUT` | `-1` (비활성) | 모든 워크플로우 기본 타임아웃 (초) |
| `EXECUTIONS_TIMEOUT_MAX` | `3600` | 워크플로우 개별 설정의 상한 (초) |

워크플로우가 메인 프로세스에서 실행되면 soft timeout(현재 노드 완료 후 중단), 별도 프로세스면 soft timeout 후 1/5 시간 대기 → kill.

---

## 10. 워크플로우 모니터링

### 10.1 Execution History

n8n UI의 **Executions** 탭에서 실패한 실행을 필터링. `Save failed production executions` 설정이 켜져 있어야 기록됨.

### 10.2 정기 헬스 체크 워크플로우

```
[Schedule Trigger: 1시간마다]
   │
   v
[n8n API: GET /executions?status=error&limit=100]
   │
   v
[Code: 최근 1시간 에러 수 집계]
   │
   v
[IF: error_count > threshold] ──true──> [Slack 경보]
```

n8n REST API (`GET /executions`)로 직접 조회 가능. API 키 발급 후 사용.

---

## 11. 외부 서비스 장애 대응

### 11.1 Exponential Backoff (지수 백오프)

n8n 내장 Retry On Fail은 고정 간격(최대 5000ms)이므로 진짜 exponential backoff은 직접 구현한다.

```
[HTTP Request: On Error = Continue (using error output)]
       │
       └─error─> [Code: 다음 대기 시간 계산]
                  return [{ json: {
                    wait_ms: Math.min(60000, 1000 * Math.pow(2, $json.attempt || 0)),
                    attempt: ($json.attempt || 0) + 1,
                    original: $json.original
                  }}]
                  │
                  v
                [Wait: $json.wait_ms ms]
                  │
                  v
                [IF: attempt < 5] ──true──> [HTTP Request 재시도 (Loop back)]
                                  └─false─> [DLQ insert + Alert]
```

**핵심:**
- `wait = min(cap, base * 2^attempt)` 공식 (cap으로 무한 증가 방지)
- jitter 추가 권장: `wait += Math.random() * 1000`
- **`Retry-After` 헤더가 응답에 있으면 그것을 우선 사용** (서버가 자기 capacity를 가장 잘 안다)

### 11.2 Circuit Breaker 패턴

연속 실패가 임계치를 넘으면 해당 서비스 호출을 일정 시간 차단한다.

```
[Redis: GET circuit:claude-api]
   │
   v
[IF: state == 'open']
   ├─true──> [DLQ insert (서비스 장애 대기)]
   └─false─> [HTTP Request]
              ├─success─> [Redis: SET circuit:claude-api state=closed, failures=0]
              └─error───> [Redis: INCR circuit:claude-api:failures]
                          [IF: failures >= 5] ──> [Redis: SET state=open EX 300]
```

n8n 자체는 Circuit Breaker 노드가 없으므로 Redis·Postgres로 상태를 관리한다.

---

## 12. 예시: 꿈 해몽 워크플로우의 Claude API 에러 처리

### 시나리오
- 사용자 입력 → Claude API 호출 → 결과 저장
- Claude API는 429(rate limit), 5xx(서버 오류), 529(overloaded) 등 다양한 에러 발생

### 워크플로우 설계

```
[Webhook: 사용자 입력]
       │
       v
[HTTP Request: Claude API]
  - Never Error = ON
  - Include Response Headers and Status = ON
  - Timeout = 60000ms
  - On Error = Continue (using error output)
       │
       ├─[성공 분기]─> [Parse Claude Response] ─> [Postgres: 결과 저장] ─> [Webhook Response]
       │
       └─[에러 분기]─> [IF: statusCode]
                          │
                          ├─429──> [Code: Retry-After 헤더 추출]
                          │         │
                          │         v
                          │       [Wait: $json.retry_after_ms]
                          │         │
                          │         v
                          │       [Loop: 최대 3회 재시도]
                          │
                          ├─5xx──> [Exponential backoff: 1s→2s→4s, 최대 3회]
                          │          │
                          │          └─모두 실패─> [폴백: 캐시된 유사 해몽 응답]
                          │
                          ├─529──> [DLQ insert + 사용자에게 "잠시 후 다시" 응답]
                          │
                          └─else─> [Error Workflow 트리거 (Stop And Error 노드)]
                                    │
                                    v
                          [Slack #ops-alerts: 알 수 없는 Claude API 에러]
```

**핵심 설계 결정:**
- **타임아웃 60초** — Claude API의 긴 응답 시간 고려
- **429는 Retry-After 헤더 우선** — Anthropic이 권장하는 backoff 시간 준수
- **5xx는 클라이언트 측 exponential backoff** — 서버가 회복 시간을 제공하지 않을 때
- **529(overloaded)는 DLQ로 이동** — 즉시 재시도해도 실패 확률 높음, 배치로 나중에 재처리
- **사용자에게는 빠른 응답** — 백그라운드 재처리가 길어지면 사용자는 캐시된 응답 또는 안내 메시지로 즉시 대응

---

## 13. 흔한 함정

### 13.1 Error Workflow 무한 루프
- **증상**: Error Workflow 자체에서 에러 → 자신의 Error Workflow 호출 → 무한 반복
- **방지**: Error Workflow에는 *별도 Error Workflow를 지정하지 않는다*. Error Workflow 내부의 노드는 모두 `On Error = Continue (regular output)`로 두거나, 외부 알림 노드만 사용

### 13.2 Retry On Fail의 UI 한계 인지 부족
- `Max Tries`는 UI에서 5까지만 입력 가능, `Wait Between Tries`도 5000ms 한계
- 그 이상 필요하면 외부 Loop + Wait 노드로 구현해야 한다 (내장 retry로 해결 안됨)

### 13.3 `On Error: Continue` + Retry 조합의 함정
- 위 두 옵션을 동시에 켜면 Retry 설정이 무시될 수 있다 (issue #10763)
- Retry가 *실제로* 동작해야 한다면 `On Error = Stop Workflow` 유지

### 13.4 알림 스팸
- **증상**: 외부 서비스 장애 시 분당 수십 건 알림 발송
- **방지**:
  - 에러 그룹화 (같은 에러 N분 내 1회)
  - Slack thread로 후속 에러 합치기
  - Circuit Breaker로 같은 에러 반복 호출 자체를 차단

### 13.5 수동 실행에서 Error Trigger 테스트 시도
- Error Workflow는 *자동 실행*에서만 트리거된다. 수동(Manual) 실행에서는 동작 안함
- **테스트 방법**: Production에서 Active 상태로 두고 Stop And Error 노드로 강제 실패 유발 → Error Workflow 실행 확인

### 13.6 `Continue using error output`인데 에러 분기 미연결
- 에러 분기에 후속 노드를 안 두면 일부 버전에서 의도치 않은 동작
- 최소한 `[NoOp]` 노드나 로그 노드라도 연결

### 13.7 execution.url이 빈 값
- **원인**: `Save failed production executions` 설정 OFF → DB에 실행 기록이 없어 URL 생성 불가
- **해결**: Workflow Settings에서 `Save failed production executions = Yes`로 활성화

### 13.8 타임아웃 무시 보고
- `EXECUTIONS_TIMEOUT` 설정에도 워크플로우가 계속 실행되는 버그가 일부 버전(v1.x)에서 보고됨 (issue #11596)
- 노드 레벨 타임아웃도 함께 설정해 이중 방어

---

## 관련 스킬

- `devops/n8n-workflow-design` — 워크플로우 구조·노드 조합·트리거 기본 (선행 학습 권장)
- `devops/n8n-self-hosting` — `EXECUTIONS_TIMEOUT` 등 환경 변수 설정, queue mode 운영
