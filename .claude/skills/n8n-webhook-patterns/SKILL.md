---
name: n8n-webhook-patterns
description: n8n 2.x Webhook 노드의 최신 변경점·함정 — 2.0 Publish 해야 Production URL 동작, Respond 4모드(Streaming 포함)·16MB·HTML iframe 래핑, 인증에 n8n User Auth(OAuth2) 추가, Only Run If(v2.28)는 보안 검사용 아님, CORS는 노드 옵션 Allowed Origins(환경변수 없음), IP(s) Allowlist 403·CIDR, HMAC 미내장·Raw Body, Code 노드 $env 기본 차단
disable-model-invocation: true
---

# n8n Webhook 패턴 — 외부 트리거·HTTP API 엔드포인트

> 소스: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
> 소스: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/
> 소스: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/common-issues/
> 소스: https://docs.n8n.io/integrations/builtin/credentials/webhook/
> 검증일: 2026-11-09 (최초 작성 2026-05-15, 재검증 2026-09-28 · 2026-11-09 — 기준 stable n8n 2.46.6, 3.0 은 early access)
>
> 2026-11-09 검증 기록: Webhook 노드 문서(.md) 재대조 — Test/Production URL·Respond 4모드(Immediately / When Last Node Finishes / Using 'Respond to Webhook' Node / Streaming)·**최대 페이로드 16MB**·HTML `<iframe>` 래핑(1.103.0+)·HMAC 미내장 그대로. 바뀐 점: 인증 방식에 **n8n User Auth (OAuth2)** 추가, **Only Run If** 요청 필터 옵션(v2.28) 추가, IP 옵션 이름 **IP(s) Allowlist** 로 변경. **CORS 정정** — 이전 판의 `WEBHOOK_CORS_*`·`N8N_CORS_ALLOW_ORIGIN` 환경변수는 공식 문서·소스에 없어 삭제하고, 노드 옵션 **Allowed Origins (CORS)**(기본 `*`)로 교체. `WEBHOOK_URL` 예시는 `N8N_WEBHOOK_URL` 로 통일.

> 주의 (2026-09-28 — 이력 각주, 인증 방식·최신 버전은 위 2026-11-09 문단이 현행): n8n이 1.x에서 **2.x로 메이저 버전이 올라갔다**(당시 최신 릴리즈 `n8n@2.40.7`). n8n 1.103.0부터 HTML 응답을 `<iframe>`으로 자동 래핑하는 보안 메커니즘과 AI Agent용 스트리밍 응답 기능이 추가됐다.
>
> 주의 (2026-09-28 형제 스킬 정합 보완):
> ① **워크플로우 "활성화(Active 토글)" 모델이 n8n 2.0부터 Save(자동 초안 저장)/Publish(게시 — 라이브 반영) 분리 모델로 바뀌었다.** Production URL은 워크플로우를 **게시(Publish)** 해야만 동작한다 — "n8n will enable the following: Webhook and form triggers will use their production URLs" (https://docs.n8n.io/build/understand-workflows/save-and-publish-workflows.md, https://docs.n8n.io/changelog/v20-breaking-changes.md "Saving and publishing workflows").
> ② **Code 노드는 n8n 2.0부터 task runner 격리 실행이 기본**이며, `N8N_BLOCK_ENV_ACCESS_IN_NODE` 기본값이 `false`→**`true`로 변경**되어 Code 노드 내부의 `$env`/`process.env` 접근이 기본 차단된다 — "The default value for `N8N_BLOCK_ENV_ACCESS_IN_NODE` is now set to `true`. ... For sensitive data, use credentials or other secure methods instead of environment variables." (https://docs.n8n.io/changelog/v20-breaking-changes.md "Block environment variable access from Code Node by default"). 이 제한은 **Code 노드 안**에서의 접근에 적용되며, 필요 시 인스턴스 환경변수로 `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`를 명시하면 되지만 시크릿은 가급적 **Credentials**로 관리하는 것이 공식 권장이다. 아래 Code 노드 서명 검증에서 `$env`를 쓰려면 이 플래그 조정 또는 Credentials 전환이 필요하다.

짝 스킬:
- `n8n-self-hosting` — 셀프 호스팅 환경에서 `N8N_WEBHOOK_URL`(구 `WEBHOOK_URL`)·`N8N_PROXY_HOPS` 설정
- `n8n-error-handling` — Error Trigger·재시도·실패 알림

---

## 이 스킬의 범위

Webhook 노드의 n8n 2.x 동작·옵션 변경, 정정된 사실(CORS), 실측 함정만 싣는다.
> 기본 사용법(HTTP method, `$json.body/query/headers` 추출, Respond to Webhook 옵션 목록, nginx/Caddy rate limit, 비동기 응답·폴링 패턴, Stripe·GitHub 서명 포맷 일반)은 공식 문서·일반 지식 수준이라 싣지 않는다.

---

## 1. URL·응답 모드

| 항목 | Test URL | Production URL |
|------|----------|----------------|
| 경로 | `/webhook-test/{path}` | `/webhook/{path}` |
| 등록 | 에디터 "Listen for Test Event" 클릭 시 — **한 번 호출되면 만료** | 워크플로우가 **게시(Publish)**된 상태 (n8n 2.x — 구버전 Active 토글). 미게시(Draft)면 404 |

- 한 path + method 조합은 워크플로우 하나에만 등록 가능("Webhook path already registered").
- Respond 4모드: **Immediately** / **When Last Node Finishes** / **Using 'Respond to Webhook' Node** / **Streaming**(AI Agent용). 최대 페이로드 **16MB**. 1.103.0+는 HTML 응답을 `<iframe>`으로 자동 래핑.
- 헤더는 모두 소문자로 정규화(`X-API-Key` → `$json.headers['x-api-key']`).

---

## 2. 인증·필터

| 방식 | 동작 |
|------|------|
| None / Basic / Header / JWT Auth | JWT는 Passphrase 또는 PEM Key로 서명 검증, 만료·issuer 클레임 확인 가능. Basic은 HTTPS 필수 |
| **n8n User Auth (OAuth2)** | (2.x 후반 추가) **이 n8n 인스턴스에 로그인한 사용자만** 호출 가능. 옵션 **OAuth2 Client** — Auto-Detect(기본: 브라우저는 로그인 페이지로, 그 외는 bearer 토큰 요구) / Bearer Token Only / Browser (Virtual Client). v2.34 부터 "Require Workflow Execute Permission" 토글(기본 ON — 호출자에게 workflow:execute 권한도 요구). 외부 서비스 콜백용이 아니라 사내 사용자용 |

**요청 필터 — `Only Run If` 옵션 (v2.28+):** 들어온 요청(`$json` = `{ body, headers, params, query }`)에 대한 표현식이 `true` 일 때만 실행. 불일치 요청은 **실행 기록 없이 200** 응답. IP Allowlist·인증 검사 뒤에 평가되고 Test/Production URL 모두 적용. **표현식 평가가 실패하면 경고만 남기고 통과시키므로 보안 검사(서명·시크릿 검증) 용도로 쓰지 말 것** — 무의미한 이벤트 걸러내기(노이즈 감소) 용도.

**IP(s) Allowlist**(구 표기 "IP(s) Whitelist"): CIDR 또는 IP 목록(콤마 구분). 목록 밖 IP 는 **403**, 비워 두면 모두 허용. CIDR 표기는 노드 소스(`Webhook/utils.ts` `getAllowList`)에서 지원 확인(2026-11-09). 리버스 프록시 뒤라면 `N8N_PROXY_HOPS`가 맞아야 실제 클라이언트 IP를 본다.

- n8n 자체에는 **rate limit 기능이 없다** → reverse proxy에서.

---

## 3. HMAC 서명 — 내장 안 됨

- HMAC 서명 검증은 **내장되어 있지 않다** — Code 노드로 직접 구현(`crypto.createHmac` + `crypto.timingSafeEqual`).
- Webhook 노드 **Raw Body 옵션 ON** + `$json.rawBody` 사용 — 파싱된 body로 계산하면 raw bytes가 변형돼 실패. Stripe·GitHub·Slack은 반드시 Raw Body.
- Telegram(`X-Telegram-Bot-Api-Secret-Token`)·GitLab(`X-Gitlab-Token`)은 HMAC이 아니라 단순 시크릿 토큰 비교.

> 주의: HMAC 서명 검증이 필요한 multipart 업로드는 까다롭다. raw body가 필요한데 multipart는 raw body를 끄는 게 권장되기 때문 — 이 경우 reverse proxy에서 서명 검증을 먼저 처리하는 것이 안전하다.

- multipart 파일 업로드: **Binary Data** ON, **Binary Property는 비워 둠**(다중 파일 자동 매핑 — 채우면 단일 매핑돼 파일 손실), **Raw Body OFF**(binary 처리와 양립 불가).

---

## 4. CORS — 노드 옵션으로만

Webhook 노드 옵션 → **Allowed Origins (CORS)** 에 허용할 origin 을 콤마로 입력한다. **기본값은 `*`(모든 origin 허용)** — 운영은 명시적 origin 만.

> 주의 (2026-11-09 정정): 이전 판에 있던 `WEBHOOK_CORS_ALLOWED_ORIGINS`·`WEBHOOK_CORS_ALLOWED_METHODS`·`WEBHOOK_CORS_ALLOWED_HEADERS`·`N8N_CORS_ALLOW_ORIGIN` 환경변수는 **공식 환경변수 문서와 n8n 소스 어디에도 없다**(비공식 블로그 출처였음) — 설정해도 효과가 없으니 쓰지 말 것. 웹훅 CORS 는 노드별 옵션으로 정한다.

> 주의: Respond to Webhook 노드 헤더는 실제 응답에만 붙는다. preflight(`OPTIONS`) 는 Webhook 노드의 Allowed Origins (CORS) 옵션이 처리하며, Wait 노드 + Respond to Webhook 조합에서 preflight가 실패하는 알려진 버그가 있으므로 그 경우는 reverse proxy 에서 OPTIONS 를 응답한다.

---

## 5. 흔한 함정

| 함정 | 증상 | 해결 |
|------|------|------|
| Test URL 만료 | 한 번 호출 후 404·"Webhook not registered" | "Listen for Test Event" 재클릭 |
| Production URL 404 | 미게시(Draft) | 우상단 **Publish** (n8n 2.x) |
| `N8N_WEBHOOK_URL` 누락 (reverse proxy) | webhook URL에 `:5678` 포트 노출 | `N8N_WEBHOOK_URL=https://n8n.example.com/` (구 `WEBHOOK_URL` 은 2.35.0 부터 deprecated alias) |
| 도메인 변경 후 외부 서비스 깨짐 | 등록된 URL이 옛 도메인 | 외부 서비스 대시보드에서 모두 갱신 |
| `WEBHOOK_CORS_*` 환경변수로 CORS 설정 | 효과 없음 | 노드 옵션 Allowed Origins (CORS) |
| Last Node Finishes인데 빈 응답 | 마지막 노드가 binary만 출력 | First Entry JSON 또는 Respond to Webhook 노드 |
| `Respond: Immediately`인데 Respond to Webhook 무동작 | Immediately 시 후속 Respond 노드는 무시 | `Using 'Respond to Webhook' Node` |
| HMAC 서명 검증 실패 | body 파싱으로 raw bytes 변형 | Raw Body ON, `$json.rawBody` |
| Code 노드 `$env` 시크릿 | 2.x에서 기본 차단 | Credentials 또는 `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` |
| Only Run If로 서명 검사 | 표현식 실패 시 통과 | Code 노드 검증 |
| Queue Mode에서 Respond 깨짐 | Last Node Finishes 모드가 worker에서 응답 못 돌려줌 | `Respond: Immediately` 또는 webhook을 별도 worker에 고정 |
