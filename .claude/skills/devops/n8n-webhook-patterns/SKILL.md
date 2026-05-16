---
name: n8n-webhook-patterns
description: n8n Webhook 노드로 외부 트리거·HTTP API 엔드포인트 구축. Test/Production URL, 응답 모드, 인증, CORS, HMAC 서명 검증, 비동기 처리, 파일 업로드, 외부 서비스 연동 패턴.
---

# n8n Webhook 패턴 — 외부 트리거·HTTP API 엔드포인트

> 소스: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
> 소스: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/
> 소스: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/common-issues/
> 소스: https://docs.n8n.io/integrations/builtin/credentials/webhook/
> 검증일: 2026-05-15

짝 스킬:
- `devops/n8n-self-hosting` — 셀프 호스팅 환경에서 `WEBHOOK_URL`·CORS 환경변수 설정
- `devops/n8n-workflow-design` — 트리거→처리→응답 워크플로우 설계 원칙
- `devops/n8n-error-handling` — Error Trigger·재시도·실패 알림

---

## 1. Webhook 노드 기본 — Test URL vs Production URL

모든 Webhook 노드는 두 가지 완전히 다른 URL을 발급한다.

| 항목 | Test URL | Production URL |
|------|----------|----------------|
| 경로 | `/webhook-test/{path}` | `/webhook/{path}` |
| 등록 시점 | 에디터에서 "Listen for Test Event" 버튼 클릭 시 | 워크플로우 Active 상태일 때 |
| 동작 | 한 번만 동작 후 만료 | 상시 동작 |
| 결과 표시 | 에디터 캔버스에 즉시 표시 | Executions 탭에서 확인 |
| 용도 | 개발·디버깅 | 운영 |

**중요 함정:**
- Test URL은 "Listen" 후 한 번 호출되면 만료된다. 다시 호출하려면 Listen 버튼을 또 눌러야 한다.
- Production URL은 워크플로우가 **Active 토글 ON**이어야만 응답한다. Inactive 상태면 404.
- 한 path + method 조합은 워크플로우 하나에만 등록 가능 (`Only one webhook per path and method`).

---

## 2. HTTP Method

지원 메서드: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`.

**복수 메서드 처리:**
- 한 Webhook 노드는 기본적으로 단일 메서드만 받는다.
- 여러 메서드를 받으려면 동일 path로 메서드별 Webhook 노드를 각각 만들거나, 노드 옵션에서 메서드 배열 설정(버전 따라 지원).
- 라우팅은 후속 Switch 노드에서 `{{ $json.method }}` 또는 노드 분기로 처리.

---

## 3. 응답 모드 (Respond)

| 모드 | 응답 시점 | 사용 시점 |
|------|----------|----------|
| **Immediately** | Webhook 노드 실행 즉시 200 OK 반환 | 비동기 처리·긴 워크플로우 (응답 대기 불필요) |
| **When Last Node Finishes** | 마지막 노드 출력 자동 반환 | 단순 요청-응답 (계산 결과 즉시 반환) |
| **Using 'Respond to Webhook' Node** | `Respond to Webhook` 노드 도달 시점 | 커스텀 헤더·상태 코드·바디 필요한 API |

### `When Last Node Finishes` — Response Data 옵션

- **All Entries** — 마지막 노드 모든 항목을 배열로 반환
- **First Entry JSON** — 첫 항목의 JSON을 객체로 반환
- **First Entry Binary** — 첫 항목의 바이너리를 파일로 반환

### `Respond to Webhook` 노드 — Respond With 옵션

- `JSON` — JSON 객체 반환 (가장 흔함)
- `Text` — text/plain 반환
- `Binary File` — 파일 다운로드 응답
- `Redirect` — 302 리다이렉트 (`Location` 헤더)
- `No Data` — 본문 없이 상태 코드만
- `All Incoming Items` — 입력 그대로 반환
- `First Incoming Item` — 첫 항목만

응답 코드·헤더는 `Respond to Webhook` 노드의 옵션에서 설정 (`200`, `201`, `202`, `400`, `401`, `422`, `500` 등).

---

## 4. 쿼리·body·헤더 추출

n8n은 들어온 요청을 다음 구조로 첫 노드 출력에 담는다.

| 표현식 | 내용 |
|--------|------|
| `{{ $json.body }}` | POST/PUT body 전체 (JSON 또는 form-data) |
| `{{ $json.body.field }}` | body 내 특정 필드 |
| `{{ $json.query }}` | URL 쿼리스트링 객체 |
| `{{ $json.query.foo }}` | 특정 쿼리 파라미터 |
| `{{ $json.headers }}` | 모든 헤더 (소문자 키) |
| `{{ $json.headers['x-api-key'] }}` | 특정 헤더 (브라켓 표기 권장) |
| `{{ $json.params.id }}` | 경로 변수 (`:id` 표기 사용 시) |
| `{{ $json.webhookUrl }}` | 호출된 URL 자체 |
| `{{ $json.executionMode }}` | `test` 또는 `production` |

> 주의: 헤더는 모두 소문자로 정규화된다 (`X-API-Key` → `x-api-key`).

---

## 5. 인증 (Webhook Credentials)

n8n Webhook 노드 내장 인증:

| 방식 | 동작 |
|------|------|
| **None** | 인증 없음 (개발용 또는 외부 서명 검증 사용 시) |
| **Basic Auth** | `Authorization: Basic base64(user:pass)` 헤더 검증 |
| **Header Auth** | 임의 헤더명·값으로 1:1 매칭 (예: `X-API-Key: secret`) |
| **JWT Auth** | `Authorization: Bearer <token>` — Passphrase 또는 PEM Key로 서명 검증, 만료·issuer 클레임 확인 가능 |

**중요 한계:**
- HMAC 서명 검증은 내장되어 있지 않다 — Code 노드로 직접 구현해야 한다 (섹션 10 참조).
- Basic Auth는 Base64 인코딩일 뿐 암호화가 아니므로 반드시 HTTPS와 함께 사용한다.

```javascript
// Header Auth + 추가 시크릿 검증 (Code 노드)
const expected = $env.WEBHOOK_SECRET;
const received = $input.first().json.headers['x-secret-token'];
if (received !== expected) {
  throw new Error('Unauthorized');
}
return $input.all();
```

---

## 6. CORS — 브라우저에서 직접 호출

n8n Webhook은 브라우저에서 직접 호출할 때 CORS preflight (`OPTIONS`)를 처리해야 한다.

### 환경변수 설정 (셀프 호스팅)

```bash
WEBHOOK_CORS_ALLOWED_ORIGINS=https://app.example.com,https://staging.example.com
WEBHOOK_CORS_ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
WEBHOOK_CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-API-Key
N8N_CORS_ALLOW_ORIGIN=https://app.example.com
```

- 와일드카드(`*`)는 개발 환경에서만, 운영은 명시적 origin만 허용.
- Wait 노드 + Respond to Webhook 조합에서 CORS preflight가 실패하는 알려진 버그가 있으므로 reverse proxy에서 OPTIONS를 직접 응답하는 것도 한 방법.

### Respond to Webhook 노드에서 헤더 추가

```
Response Headers:
  Access-Control-Allow-Origin: https://app.example.com
  Access-Control-Allow-Credentials: true
```

> 주의: 노드 헤더는 200 응답에만 붙는다. OPTIONS preflight 자체는 환경변수 또는 reverse proxy에서 처리해야 한다.

---

## 7. Rate Limiting — reverse proxy에서

n8n 자체에는 rate limit 기능이 없다. nginx 또는 Caddy 앞단에서 처리한다.

### nginx 예시

```nginx
limit_req_zone $binary_remote_addr zone=webhook_zone:10m rate=10r/s;

location /webhook/ {
    limit_req zone=webhook_zone burst=20 nodelay;
    limit_req_status 429;
    proxy_pass http://n8n:5678;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### Caddy 예시

```caddy
n8n.example.com {
    @webhook path /webhook/*
    rate_limit @webhook {
        zone webhook_zone
        events 10
        window 1s
    }
    reverse_proxy n8n:5678
}
```

### 추가 환경변수

```bash
N8N_PROXY_HOPS=1  # reverse proxy 한 단 뒤에 있을 때
WEBHOOK_URL=https://n8n.example.com/  # 외부 노출 URL 강제
```

---

## 8. 비동기 처리 — 즉시 응답 + 백그라운드 실행

긴 처리(LLM 호출, 외부 API 다중 호출 등)는 즉시 200을 돌려주고 백그라운드에서 실행한다.

### 패턴 A: Respond → On Received

- Webhook 노드 `Respond: Immediately` 설정
- 캘러는 즉시 200을 받음
- 워크플로우는 백그라운드에서 계속 실행
- 결과는 별도 채널(DB·webhook callback·Slack 알림)로 전달

### 패턴 B: Respond → Last Node + Queue Mode

- n8n Queue Mode (`EXECUTIONS_MODE=queue`) 활성화 시 webhook 실행이 worker로 분산
- HTTP 연결은 즉시 200, 워크플로우는 비동기 처리
- 고용량 트래픽 환경에서 권장

### 패턴 C: Correlation ID + Polling

```
1. Webhook 수신 → correlation_id 생성 → DB 저장 → 즉시 응답
   { "id": "abc-123", "status": "processing" }
2. 워크플로우는 백그라운드에서 처리 → 결과를 DB에 저장
3. 클라이언트는 GET /webhook/status/abc-123 로 폴링
```

---

## 9. 파일 업로드 — Binary Data · multipart

`multipart/form-data` 요청 처리:

1. Webhook 노드 옵션 → **Binary Data** 토글 ON
2. **Binary Property** 필드는 비워두면 모든 파일을 자동 매핑 (다중 파일 시 권장)
3. **Raw Body** 옵션은 **OFF**로 둔다 (raw body와 binary 처리는 양립 불가)
4. 후속 노드에서 `$binary.{fieldName}` 또는 `$input.item.binary`로 접근

### curl 테스트 예시

```bash
curl -X POST https://n8n.example.com/webhook/upload \
  -F "file=@./image.png" \
  -F "title=My Photo"
```

수신 시:
- `$json.body.title` — `"My Photo"`
- `$binary.file` — 바이너리 파일 객체 (mimeType, fileName, data)

> 주의: HMAC 서명 검증이 필요한 multipart 업로드는 까다롭다. raw body가 필요한데 multipart는 raw body를 끄는 게 권장되기 때문 — 이 경우 reverse proxy에서 서명 검증을 먼저 처리하는 것이 안전하다.

---

## 10. Webhook 보안 — secret · signature · IP

### Secret Token (Header Auth + 추가 검증)

```javascript
// Code 노드 (Webhook 직후)
const token = $input.first().json.headers['x-webhook-secret'];
if (token !== $env.WEBHOOK_SECRET) {
  // Respond to Webhook 노드로 401 반환
  return [{ json: { error: 'Unauthorized' }, statusCode: 401 }];
}
return $input.all();
```

### HMAC-SHA256 서명 검증 (Stripe·GitHub 스타일)

```javascript
// Code 노드 — Raw Body 옵션 ON 필수
const crypto = require('crypto');
const rawBody = $input.first().json.rawBody;  // Raw Body ON일 때 사용 가능
const signature = $input.first().json.headers['x-hub-signature-256'];
const secret = $env.GITHUB_WEBHOOK_SECRET;

const expected = 'sha256=' + crypto
  .createHmac('sha256', secret)
  .update(rawBody)
  .digest('hex');

// 타이밍 공격 방지 비교
const valid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expected)
);

if (!valid) throw new Error('Invalid signature');
return $input.all();
```

### IP 화이트리스트

Webhook 노드 옵션 → **IP(s) Whitelist**에 CIDR 또는 IP 목록 입력 (콤마 구분).

```
192.30.252.0/22, 185.199.108.0/22, 140.82.112.0/20
```

- 외부 서비스가 안정적인 IP 대역을 공개하는 경우(GitHub, Stripe 등)에 효과적.
- 챗봇·일반 사용자 대상 webhook에는 부적합.

---

## 11. 외부 서비스 연결 — 서명 검증 헤더

| 서비스 | 서명 헤더 | 알고리즘 | 비고 |
|--------|----------|----------|------|
| **Stripe** | `Stripe-Signature` | HMAC-SHA256 | `t=...,v1=...` 포맷 파싱 필요, 5분 이내 timestamp |
| **GitHub** | `X-Hub-Signature-256` | HMAC-SHA256 | `sha256=...` 접두사 |
| **Slack** | `X-Slack-Signature` + `X-Slack-Request-Timestamp` | HMAC-SHA256 | `v0:{ts}:{body}` 서명, 5분 이내 timestamp |
| **Telegram** | `X-Telegram-Bot-Api-Secret-Token` | 단순 시크릿 토큰 비교 | webhook 등록 시 `secret_token` 설정 |
| **GitLab** | `X-Gitlab-Token` | 단순 시크릿 토큰 비교 | HMAC 아님 |

Stripe·GitHub·Slack은 반드시 **Raw Body 옵션 ON** + Code 노드로 검증한다.

---

## 12. 예시: 꿈 입력 webhook → 안전 분류 → 해몽 → 저장

```
1. Webhook (POST /dream-interpret)
   - Authentication: Header Auth (X-API-Key)
   - Respond: Using 'Respond to Webhook' Node

2. Code 노드 (입력 검증)
   - $json.body.dreamText 길이·금칙어 체크
   - 위반 시 throw → Error Trigger 분기

3. OpenAI 노드 (안전 분류)
   - 자해·폭력·민감 주제 분류

4. IF 노드
   - 분류 결과 "safe" → 해몽 분기
   - 분류 결과 "unsafe" → 안내 메시지 분기

5. OpenAI 노드 (해몽 생성)
   - 프롬프트: "{{ $json.body.dreamText }}를 해몽해줘"

6. Postgres / Supabase 노드 (저장)
   - INSERT INTO dreams (user_id, text, interpretation, created_at)

7. Respond to Webhook
   - Respond With: JSON
   - Body: { "id": "{{ $json.id }}", "interpretation": "{{ $json.interpretation }}" }
   - Response Code: 200
   - Headers: Access-Control-Allow-Origin: https://app.example.com
```

비동기 변형: Step 1의 Respond를 `Immediately`로 두고, 처리 결과를 별도 채널(DB row + 클라이언트 polling 또는 push 알림)로 전달.

---

## 13. 흔한 함정

| 함정 | 증상 | 해결 |
|------|------|------|
| Test URL 만료 | 한 번 호출 후 404·"Webhook not registered" | 에디터에서 "Listen for Test Event" 재클릭 |
| Production URL 404 | Active 토글이 꺼져 있음 | 워크플로우 우상단 Active 토글 ON |
| `WEBHOOK_URL` 누락 (reverse proxy) | webhook URL에 `:5678` 포트 노출 | `WEBHOOK_URL=https://n8n.example.com/` 설정 |
| 도메인 변경 후 외부 서비스 깨짐 | Stripe·GitHub 등에 등록된 URL이 옛 도메인 | 외부 서비스 대시보드에서 webhook URL 모두 갱신 |
| CORS preflight 실패 | 브라우저 콘솔 `No Access-Control-Allow-Origin` | `WEBHOOK_CORS_ALLOWED_ORIGINS` 환경변수 설정 또는 reverse proxy에서 OPTIONS 응답 |
| Last Node Finishes인데 빈 응답 | 마지막 노드가 binary만 출력 | First Entry JSON 또는 Respond to Webhook 노드 사용 |
| `Respond: Immediately`인데 Respond to Webhook 무동작 | 모드 충돌 — Immediately 시 후속 Respond 노드는 무시됨 | 모드를 `Using 'Respond to Webhook' Node`로 변경 |
| HMAC 서명 검증 실패 | n8n이 body를 파싱하면서 raw bytes가 변형됨 | Webhook 노드 **Raw Body 옵션 ON**, `$json.rawBody` 사용 |
| multipart에서 파일명 손실 | Binary Property 필드를 채워서 단일 매핑됨 | Binary Property를 비워둠 (다중 파일 자동 매핑) |
| 한 path에 두 워크플로우 | "Webhook path already registered" 에러 | path 또는 method 분리, 또는 한 워크플로우로 통합 후 Switch |
| Queue Mode에서 Respond 깨짐 | Last Node Finishes 모드가 worker에서 응답을 못 돌려줌 | `Respond: Immediately` 또는 webhook을 별도 worker에 고정 |
