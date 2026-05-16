---
name: n8n-workflow-design
description: >
  n8n 워크플로우 설계 패턴 — 노드 구조, 데이터 흐름, 재사용,
  표현식, 디버깅, 모범 사례. n8n.io의 노코드·로우코드 자동화 플랫폼에서
  유지보수 가능한 워크플로우를 짜는 방법을 정리한다.
---

# n8n 워크플로우 설계 (Workflow Design Patterns)

> 소스: https://docs.n8n.io/ (공식 문서)
> - Nodes: https://docs.n8n.io/workflows/components/nodes/
> - Data Structure: https://docs.n8n.io/data/data-structure/
> - Expressions: https://docs.n8n.io/data/expressions/
> - Code node: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/
> - Looping: https://docs.n8n.io/flow-logic/looping/
> - Error handling: https://docs.n8n.io/flow-logic/error-handling/
> - Schedule Trigger: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/
> - Webhook node: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
> - Execute Sub-workflow: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflow/
>
> 검증일: 2026-05-15
> 짝 스킬: `devops/n8n-self-hosting`, `devops/n8n-llm-integration`, `devops/n8n-webhook-patterns`, `devops/n8n-error-handling`

---

## 1. 핵심 개념

| 개념 | 정의 |
|------|------|
| **Workflow** | 노드들을 연결해 자동화 절차를 표현한 단위. 활성화 시 트리거에 의해 실행된다. |
| **Node** | 워크플로우의 기본 빌딩 블록. 데이터를 시작·가져오기·변환·전송한다. |
| **Connection** | 노드 사이의 연결선. 데이터 흐름과 실행 순서를 정의한다. |
| **Execution** | 워크플로우 1회 실행 단위. 입력 데이터가 노드를 차례로 통과하는 과정. |
| **Item** | 노드 사이를 흐르는 JSON 객체 단위. n8n에서 노드는 항상 **item 배열**을 입출력한다. |

> 핵심 원칙: n8n에서 노드 간에 흐르는 데이터는 **항상 JSON 객체의 배열**이다. 단일 객체로 보이는 경우도 길이 1인 배열이다.

---

## 2. 노드 카테고리

| 카테고리 | 역할 | 예시 |
|----------|------|------|
| **Triggers** | 워크플로우 시작점 | Manual Trigger, Schedule Trigger, Webhook |
| **Actions** | 외부 서비스 작업 (앱별 통합) | Gmail, Slack, Notion, HTTP Request |
| **Core Nodes** | 로직·변환·반복·에러 등 핵심 유틸리티 | IF, Switch, Merge, Code, Set, Loop Over Items |
| **Cluster Nodes** | AI/ML 컴포넌트 (root + sub-nodes) | AI Agent, Vector Store, Embeddings |

---

## 3. 트리거 노드

| 트리거 | 사용 시점 |
|--------|-----------|
| **Manual Trigger** | 개발·디버깅용. 캔버스 "Execute Workflow" 버튼으로 시작 |
| **Schedule Trigger** | 주기적 실행. Cron 표현식 또는 간격 모드 지원 |
| **Webhook** | 외부 HTTP 요청으로 시작. 테스트 URL과 프로덕션 URL이 분리되어 있다 |
| **App-specific Trigger** | 앱별 이벤트 (Gmail 새 메일, Slack 메시지 등) |

### Schedule Trigger — Cron 형식

```
(Minute) (Hour) (DayOfMonth) (Month) (DayOfWeek)
```

| 표현식 | 의미 |
|--------|------|
| `0 9 * * 1` | 매주 월요일 오전 9:00 |
| `*/15 * * * *` | 15분마다 |
| `0 0 1 * *` | 매월 1일 00:00 |

> 주의: Schedule Trigger는 워크플로우가 **저장 + 활성화(Active)** 되어야 동작한다. Workflow timezone이 미설정이면 인스턴스 timezone을 사용한다.

### Webhook 사용 순서

1. Webhook 노드 추가 → HTTP Method·Path 지정
2. **Test URL** 복사 → 외부에서 호출 → 캔버스에서 데이터 확인
3. 워크플로우 활성화 → **Production URL**로 자동 전환
4. 응답은 기본 즉시 응답 또는 "Respond to Webhook" 노드로 커스터마이즈

---

## 4. 데이터 흐름 — Item 배열

### 입출력 구조

모든 노드는 다음 형태의 배열을 주고받는다:

```js
[
  { json: { id: 1, name: "Alice" } },
  { json: { id: 2, name: "Bob" } }
]
```

- `json` 필드: 일반 데이터
- `binary` 필드: 파일·이미지 등 바이너리 데이터
- `pairedItem` 필드: 어떤 입력 item에서 파생됐는지 추적

### 자동 반복 처리

대부분의 노드는 **item 배열을 자동으로 반복 처리**한다. HTTP Request 노드에 10개 item이 들어오면 10번 호출이 일어난다 (별도 Loop 노드 없이).

### 데이터 참조

| 표현식 | 의미 |
|--------|------|
| `$json` | 현재 노드의 현재 item JSON 데이터 (가장 자주 사용) |
| `$json.fieldName` | 현재 item의 특정 필드 |
| `$input.item.json` | `$json`과 동일 (명시적 형태) |
| `$input.all()` | Code 노드에서 모든 입력 item 배열 |
| `$('NodeName').item.json` | **신규 권장 문법** — 특정 노드의 현재 item |
| `$node["NodeName"].json` | **레거시 문법** — 특정 노드 첫 item (여전히 동작) |
| `$('NodeName').all()` | 특정 노드의 모든 item 배열 |

> 권장: 신규 워크플로우는 `$('NodeName')` 문법을 사용한다. `$node[...]`는 호환을 위해 남아있지만 신규 문법이 item 페어링을 더 정확히 다룬다.

---

## 5. 변환 노드

### Edit Fields (Set) 노드

- 기존 노드명 "Set"의 새 표기 (동일 노드)
- 새 필드 추가·기존 필드 덮어쓰기에 사용
- 코드 없이 UI로 매핑 가능
- 단순 변환은 항상 Code보다 Edit Fields를 우선 선택

### Code 노드

JavaScript(Node.js) 또는 Python(Pyodide, 1.0+)으로 임의 변환을 작성.

> 역사: **Code 노드는 0.198.0 버전부터 Function·Function Item 노드를 대체**한다. 신규 워크플로우에서 Function 노드를 사용하지 않는다.

#### 실행 모드 2가지

| 모드 | 동작 | 반환 형식 |
|------|------|-----------|
| **Run Once for All Items** (기본) | 코드 1회 실행 | `return [{ json: {...} }, { json: {...} }]` (배열) |
| **Run Once for Each Item** | item마다 1회 실행 | `return { json: {...} }` (단일 객체) |

#### 예시 — Run Once for All Items

```javascript
const items = $input.all();
const upper = items.map(it => ({
  json: { ...it.json, name: it.json.name.toUpperCase() }
}));
return upper;
```

#### 예시 — Run Once for Each Item

```javascript
return {
  json: {
    ...$json,
    fullName: `${$json.firstName} ${$json.lastName}`
  }
};
```

> 흔한 함정: 반환 형식이 모드별로 다르다. All Items 모드인데 단일 객체를 반환하면 데이터 손실, Each Item 모드인데 배열을 반환하면 nested 구조가 된다.

---

## 6. 조건 분기

| 노드 | 출력 수 | 사용 시점 |
|------|---------|-----------|
| **IF** | 2개 (true / false) | 조건 1개로 두 갈래 분기 |
| **Switch** | 4개+ (규칙 수만큼) | 다중 라우팅 (예: status가 A/B/C일 때 각각 다른 경로) |
| **Merge** | 1개 | 분기됐던 흐름을 하나로 합치기 |

### Merge 모드

| 모드 | 동작 |
|------|------|
| **Append** | 두 입력 item을 순서대로 이어붙임 |
| **Combine** (Position/SQL/Field 등) | 위치·키 기준 병합 |
| **Choose Branch** | 한쪽 입력만 선택 |

### IF + Merge 함정

> 주의: IF 노드 뒤에 Merge를 두면 **양쪽 분기가 모두 실행되는 부작용**이 발생할 수 있다. Merge가 다른 분기를 트리거해 데이터 흐름이 예상과 달라질 수 있으니, "Choose Branch" 모드를 쓰거나 IF/Merge 대신 Switch + 후처리 통합을 고려한다.

---

## 7. 반복 (Looping)

### 자동 반복 vs 명시적 반복

- 대부분의 노드는 item 배열을 **자동으로 반복** 처리한다 (별도 Loop 노드 불필요)
- **Loop Over Items (Split in Batches)** 노드는 다음 경우에만 사용:
  - API rate limit 회피 (배치 크기 제한)
  - 페이지네이션 (다음 페이지를 동적으로 결정)
  - item 처리 제한이 있는 노드와 조합
  - Execute Workflow를 "Run Once for All Items"로 호출하는 sub-workflow 안에서 반복

### Loop Over Items 설정

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| **Batch Size** | 1 | 한 번에 처리할 item 수. 1이면 1개씩 |

루프 종료 출력(`done`)과 루프 본문 출력(`loop`) 두 갈래로 분기되며, 루프 본문 끝을 Loop 노드로 다시 연결하면 자동으로 반복된다.

```
[Input items] → [Loop Over Items] → [HTTP Request] → 다시 [Loop]
                       ↓ done
                  [후처리]
```

---

## 8. 외부 통합 — HTTP Request

### 기본 설정

| 옵션 | 설명 |
|------|------|
| **Method** | GET / POST / PUT / PATCH / DELETE |
| **URL** | 표현식 사용 가능 (`https://api.example.com/users/{{ $json.id }}`) |
| **Authentication** | None / Predefined Credential / Generic Credential |
| **Send Headers/Query/Body** | 각각 켜고 키·값 입력 |

### OAuth2 사용 흐름

1. Credentials 메뉴 → 새 Credential 생성 → "OAuth2 API" 선택
2. Authorization URL, Token URL, Client ID/Secret 입력
3. "Connect my account" → 브라우저 인증 → 토큰 발급
4. HTTP Request 노드의 Authentication에서 해당 Credential 선택
5. 만료 시 자동 갱신

> 권장: 정적 API Key보다 OAuth2 우선. 토큰이 자동 갱신되고 장기 비밀이 노출되지 않는다.

---

## 9. 데이터 변환 패턴

### 평탄화 (Flatten)

중첩된 JSON을 평탄화할 때:

- **단순 케이스**: Edit Fields에서 `{{ $json.user.address.city }}`로 끌어 새 필드 추가
- **복잡 케이스**: Code 노드 + `Object.assign`/`flat()` 사용

### 매핑 (Mapping)

```javascript
// Run Once for All Items
return $input.all().map(it => ({
  json: {
    userId: it.json.id,
    fullName: `${it.json.first_name} ${it.json.last_name}`,
    isActive: it.json.status === 'active'
  }
}));
```

### 필터 (Filter)

- **Filter 노드**: 코드 없이 조건으로 item을 통과/제거
- **Code 노드**: `$input.all().filter(it => it.json.score > 80)`

---

## 10. 워크플로우 재사용 — Sub-workflow

### Execute Workflow 노드

다른 워크플로우를 함수처럼 호출.

```
[메인 워크플로우]
  └→ [Execute Workflow: "send-notification"]
       └→ 내부에서 Slack/Email 처리
       └→ 결과를 메인으로 반환
```

#### 호출 모드

| 모드 | 동작 |
|------|------|
| **Run Once for All Items** | 입력 item 배열 전체를 한 번에 sub-workflow에 전달 |
| **Run Once for Each Item** | item마다 sub-workflow를 별도 실행 |

> 주의: "Run Once for All Items" 모드 안에서 item별 반복이 필요하다면 sub-workflow 내부에서 Loop Over Items를 명시적으로 사용한다.

### Sub-workflow 측 설정

sub-workflow는 트리거로 **"Execute Workflow Trigger"** (또는 "Execute Sub-workflow Trigger")를 사용해야 호출 가능하다.

---

## 11. 변수·환경 — Credentials와 Variables

| 종류 | 용도 | 접근 방법 |
|------|------|-----------|
| **Credentials** | API 키·OAuth 토큰 등 비밀 | 노드의 Authentication 드롭다운에서 선택 (값 자체는 노출 안 됨) |
| **Variables** | 비밀 아닌 환경 값 (URL, 플래그 등). Enterprise/Self-hosted | `{{ $vars.MY_VAR }}` |
| **Environment Variables** | n8n 인스턴스 환경변수 | `{{ $env.VAR_NAME }}` (self-hosted 한정) |

> **흔한 함정**: Credentials를 노드 필드(예: HTTP Headers)에 직접 박지 않는다. 워크플로우 export 시 평문으로 노출되고 팀 공유 시 사고가 난다. 항상 Credentials Manager에 등록한다.

---

## 12. 표현식 (Expressions)

### 기본 문법

```
{{ <JavaScript-like expression> }}
```

- 이중 중괄호 안에 JavaScript 표현식 작성
- 노드의 거의 모든 텍스트 필드에서 사용 가능
- 실행 시점에 평가되어 문자열로 치환

### 자주 쓰는 표현식

```text
{{ $json.email }}                          현재 item의 email
{{ $json.tags[0] }}                        배열 첫 요소
{{ $json.tags.length }}                    배열 길이
{{ $json.tags.join(', ') }}                배열 → 문자열
{{ $json.price * 1.1 }}                    산술 연산
{{ $('Get User').item.json.name }}         이전 노드 데이터
{{ $now.toISO() }}                         현재 시각 (Luxon DateTime)
{{ $workflow.id }}                         워크플로우 ID
```

### 변환 헬퍼 (Luxon, lodash 일부 등 내장)

- 날짜: `$now`, `$today`, `DateTime.fromISO(...)`
- 문자열: `.toUpperCase()`, `.split(',')`, `.replaceAll(...)`
- 객체: spread `{ ...$json, extra: 1 }`

---

## 13. 디버깅

### Execution Log

- 실행 후 캔버스 좌측 "Executions" 패널에서 모든 실행 기록 확인
- 각 노드의 입력·출력 데이터를 단계별로 확인 가능
- 실패한 실행은 빨간색으로 표시되고 에러 메시지 포함

### Step-by-Step 디버깅

1. 트리거에서 시작해 노드를 하나씩 추가하며 "Execute Node" 실행
2. 각 노드 출력 패널(JSON/Table/Binary)에서 데이터 검증
3. 표현식은 노드 파라미터의 "Expressions" 토글로 미리보기 가능

### Pin Data (개발용)

특정 노드의 출력을 고정해두면 트리거를 매번 다시 호출하지 않아도 하위 노드 개발이 가능하다.

---

## 14. 에러 처리

### 노드 레벨 — Continue On Fail

각 노드 Settings의 **"Continue On Fail"**(또는 신버전 "On Error" → "Continue") 옵션을 켜면 노드 실패가 워크플로우 전체를 중단시키지 않고 빈 결과/에러 객체로 다음 노드로 흐른다.

### 워크플로우 레벨 — Error Workflow

1. 별도 워크플로우를 만들고 **Error Trigger** 노드로 시작
2. 메인 워크플로우 Settings → "Error Workflow"에 해당 워크플로우 지정
3. 메인이 실패하면 Error Workflow가 자동 실행되어 Slack 알림·로그 기록 등을 수행

### 의도적 실패 — Stop And Error 노드

비즈니스 조건 위반 시 명시적으로 워크플로우를 중단시킨다.

---

## 15. 모범 사례

| 원칙 | 이유 |
|------|------|
| **작은 워크플로우 + 조립** | 큰 워크플로우는 디버깅·재사용이 어렵다. Execute Workflow로 함수처럼 조립 |
| **명확한 노드 이름** | 기본 이름("HTTP Request1") 대신 "Fetch User Profile" 같은 의미 있는 이름 |
| **Sticky Note 활용** | "왜" 이렇게 짰는지 캔버스에 메모. "무엇"보다 "왜"를 적는다 |
| **에러 처리 분리** | 메인 흐름과 에러 처리를 Error Workflow로 분리. 메인이 단순해진다 |
| **Credentials 분리** | 항상 Credentials Manager 사용. 노드 필드에 평문 박지 않기 |
| **Code 노드 최소화** | Edit Fields/IF/Switch로 가능하면 코드 없이 처리 |
| **워크플로우 활성화 후 테스트** | Schedule/Webhook은 Active 상태에서만 동작 |
| **버전 관리** | Workflow → "Download" JSON export로 Git 관리 가능 |

---

## 16. 흔한 함정

### 1. Item 배열 vs 단일 객체 혼동

```javascript
// 잘못 — Run Once for All Items 모드인데 단일 객체 반환
return { json: { result: "ok" } };

// 옳음
return [{ json: { result: "ok" } }];
```

### 2. 복잡한 Code 노드

수십 줄의 Code 노드는 유지보수 지옥이 된다. 다음 순서로 검토:

1. Edit Fields로 가능한가?
2. IF/Switch로 가능한가?
3. HTTP Request + Code 조합으로 외부 함수 호출 가능한가?
4. 그래도 안 되면 짧은 Code 노드 (10~20줄 이내)

### 3. Credentials를 노드에 직접 박기

```text
잘못 — HTTP Headers
  Authorization: Bearer sk-abc123...

옳음 — Credentials Manager에 "OpenAI API" 등록 후 Authentication에서 선택
```

### 4. IF + Merge 부작용

IF의 한쪽 분기만 실행될 거라고 가정하지 않는다. Merge는 다른 분기를 트리거해 양쪽이 모두 실행될 수 있다. Switch + 명시적 통합을 우선 검토.

### 5. Schedule Trigger 비활성 상태

저장만 하고 활성화(Active 토글)를 안 켜면 동작하지 않는다. 활성화 + Webhook은 production URL로 전환되는 점도 잊지 않는다.

### 6. 자동 반복 무시하고 Loop 남용

대부분의 노드가 item 배열을 자동 반복한다. Loop Over Items는 **batch 제어·rate limit·페이지네이션**이 필요할 때만 사용. 단순 반복에 Loop를 끼우면 의미 없이 복잡해진다.

### 7. Function 노드 신규 사용

Function·Function Item 노드는 0.198.0부터 deprecated. 신규 워크플로우는 Code 노드만 사용한다.

---

## 참고 — 짝 스킬

| 스킬 | 다루는 범위 |
|------|-------------|
| `devops/n8n-self-hosting` | Docker/Compose, 환경변수, 데이터 영속화, 업그레이드 |
| `devops/n8n-llm-integration` | AI Agent, Vector Store, LangChain 클러스터 노드 |
| `devops/n8n-webhook-patterns` | Webhook 보안, 응답 패턴, 동기/비동기 처리 |
| `devops/n8n-error-handling` | Error Trigger·재시도·알림·관측 가능성 패턴 |
