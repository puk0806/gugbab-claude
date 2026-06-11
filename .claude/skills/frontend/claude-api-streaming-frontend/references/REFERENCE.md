## 6. 프롬프트 캐싱 — 비용 절감

긴 system 프롬프트(역할 정의, 가이드라인, 예시 문서)는 캐싱한다.

```ts
await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  system: [
    {
      type: 'text',
      text: '당신은 한국 중학교 도덕 교사입니다. (긴 가이드라인 ...)',
      cache_control: { type: 'ephemeral' }, // TTL 기본 5분
      // TTL 1시간 옵션: cache_control: { type: 'ephemeral', ttl: '1h' }
    },
  ],
  messages: [{ role: 'user', content: '오늘 수업 주제는?' }],
  stream: true,
});
```

**가격 (base input 대비):**
- 캐시 write 5m: 1.25×
- 캐시 write 1h: 2×
- 캐시 hit/refresh: 0.1×
- output: 변동 없음

**최소 캐시 크기 (이하면 캐시 안 됨, 에러 없이 silently 무시):**
- 4,096 tokens — Opus 4.7 / 4.6 / 4.5 / Haiku 4.5
- 1,024 tokens — Sonnet 4.6 / 4.5 / Opus 4.1
- 2,048 tokens — Haiku 3.5

**캐시 hit 모니터링:**
```ts
// usage 응답 필드
console.log(response.usage.cache_read_input_tokens);
console.log(response.usage.cache_creation_input_tokens);
console.log(response.usage.input_tokens);
```

> 주의: 캐시 위계는 `tools → system → messages` 순. 앞 레벨이 1바이트라도 바뀌면 뒤 레벨까지 모두 무효화된다. timestamp·요청별 데이터를 캐시 블록에 넣지 않는다.

---

## 7. 에러 처리

| HTTP | 에러 타입 | 처리 |
|------|-----------|------|
| 400 | `invalid_request_error` | 요청 수정. 재시도 금지 |
| 401 | `authentication_error` | API 키 확인. 재시도 금지 |
| 403 | `permission_error` | 권한 확인 |
| 413 | `request_too_large` | Messages API는 최대 32MB |
| 429 | `rate_limit_error` | exponential backoff 재시도 (`Retry-After` 헤더 존중) |
| 500 | `api_error` | backoff 재시도 |
| 504 | `timeout_error` | 스트리밍 사용 또는 backoff |
| 529 | `overloaded_error` | backoff 재시도 (트래픽 폭주) |

### 스트리밍 중 에러 (200 이후)

200으로 응답이 시작된 뒤에도 `event: error` SSE 이벤트로 에러가 올 수 있다 (예: 도중 overloaded).

```sse
event: error
data: {"type":"error","error":{"type":"overloaded_error","message":"Overloaded"}}
```

→ 프론트는 이 이벤트를 받으면 부분 누적 텍스트를 보존한 채 사용자에게 알리고, 필요하면 partial 응답을 보존하여 재시도 시 continuation 프롬프트로 활용한다.

### Backoff 재시도 예시 (지수 + jitter)

```ts
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number } = {},
): Promise<T> {
  const max = options.maxAttempts ?? 4;
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (e) {
      attempt++;
      const status = (e as { status?: number }).status;
      const retryable = status === 429 || status === 500 || status === 529 || status === 504;
      if (!retryable || attempt >= max) throw e;
      const base = 2 ** attempt * 1000;
      const jitter = Math.random() * 500;
      await new Promise((r) => setTimeout(r, base + jitter));
    }
  }
}
```

---

## 8. 흔한 함정

### 8-1. SSE 파싱 누락
- `data: ` 6글자 접두사를 제거 안 하고 `JSON.parse` → SyntaxError
- 메시지 구분자가 `\n` 단일이라고 가정 → 중간이 잘려 누적됨. **반드시 `\n\n`** 으로 분리한다
- TextDecoder `{ stream: true }` 미지정 → multi-byte 문자(한글) 경계에서 깨짐

### 8-2. React 매 토큰 setState
- 토큰마다 `setText((p) => p + chunk)` → 초당 수십~수백 번 리렌더 → 긴 응답에서 입력 지연
- **해결:** `requestAnimationFrame` flush 또는 lodash throttle(16~33ms) 사용 (위 예시 참조)
- React 18 automatic batching은 *마이크로태스크 경계* 내에서만 작동. fetch chunk loop는 매 `await` 마다 분리되므로 batching 효과 제한적

### 8-3. AbortController 미정리
- 컴포넌트 unmount 후에도 reader가 계속 read → "Can't perform a React state update on an unmounted component"
- **해결:** `useEffect` cleanup에서 `controller.abort()` 호출

### 8-4. CORS (클라이언트 직접 호출 시)
- `api.anthropic.com`은 CORS 헤더를 통제하지 않음. 브라우저에서 직접 fetch 시 차단됨
- **해결:** 백엔드 프록시 또는 SDK의 `dangerouslyAllowBrowser: true` (그래도 키 노출 위험)

### 8-5. nginx/Cloudflare 버퍼링
- 백엔드에서 SSE를 보내도 nginx 기본 설정이 응답을 버퍼링해서 끝까지 모았다가 한 번에 전송 → 스트리밍 효과 사라짐
- **해결:** 응답 헤더에 `X-Accel-Buffering: no`, nginx `proxy_buffering off;`

### 8-6. message_delta.usage를 증분으로 오해
- `output_tokens`는 *누적값*. 매번 덮어쓰기로 사용한다 (합산 X)

### 8-7. tool_use input_json_delta 즉시 파싱
- `partial_json`은 *불완전한* JSON 문자열 (예: `{"location":`). 도중에 `JSON.parse` 하면 SyntaxError
- **해결:** `content_block_stop`까지 누적 후 한 번에 파싱

### 8-8. 에러 이벤트 무시
- SSE 흐름 중 `event: error`를 처리 안 하면 사용자가 "응답이 멈췄다"고 인지하지만 원인 추적 불가
- **해결:** 위 코드처럼 `evt.type === 'error'` 명시 처리

---

## 9. 짝 스킬과의 연계

- `frontend/chat-ui-pattern` — 메시지 리스트 렌더링·자동 스크롤·virtuoso는 이쪽 스킬에서 다룬다. 본 스킬은 *데이터 흐름*에만 집중
- `meta/dream-interpretation-prompt-engineering` — system 프롬프트 설계(역할·예시·제약). 캐시 가능한 큰 system 블록은 거기서 설계 후 본 스킬의 캐싱 패턴에 투입

---

## 10. 모델 선택 가이드

| 모델 ID (2026 frontier) | 용도 |
|--------------------------|------|
| `claude-opus-4-7` | 장기 에이전트·복잡한 코딩 추론 |
| `claude-sonnet-4-6` | 채팅 일반·속도+지능 균형 (기본 권장) |
| `claude-haiku-4-5` | 빠른 응답·간단 분류 |

> 주의: 모델 ID는 시기마다 갱신된다. 작업 전 공식 문서 `/docs/en/api/models` 확인 필수.
