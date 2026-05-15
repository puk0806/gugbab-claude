---
name: claude-api-streaming-frontend
description: >
  Claude Messages API 스트리밍 응답을 React 프론트에서 받는 패턴. SSE 이벤트 처리,
  ReadableStream 파싱, useState throttle, AbortController 중단, 백엔드 프록시 권장,
  프롬프트 캐싱, 에러 재시도까지 포함.
---

# Claude API Streaming — Frontend Pattern

> 소스: https://platform.claude.com/docs/en/api/messages-streaming · https://platform.claude.com/docs/en/api/messages · https://platform.claude.com/docs/en/build-with-claude/prompt-caching · https://platform.claude.com/docs/en/api/errors · https://github.com/anthropics/anthropic-sdk-typescript · https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
> 검증일: 2026-05-14
> 버전 기준: Messages API `anthropic-version: 2023-06-01`, TypeScript SDK `@anthropic-ai/sdk` v0.96.0, MDN SSE 표준
> 짝 스킬: `frontend/chat-ui-pattern` (메시지 리스트·virtuoso·스크롤 동작) / `meta/dream-interpretation-prompt-engineering` (system 프롬프트 설계)

---

## 언제 사용하나

- 채팅 UI에서 응답을 토큰 단위로 점진 렌더해야 할 때
- 긴 출력(요약·분석·코드 생성)에서 HTTP 타임아웃을 피하고 싶을 때 (`max_tokens` 큰 요청)
- 사용자가 응답을 중간에 끊을 수 있어야 할 때

## 언제 쓰지 말까

- 단발성 짧은 응답(분류, 단일 단어 출력) — `stream: false` 단순 호출이 더 단순
- 응답 전체가 도착해야만 후처리 가능한 경우(전체 JSON 파싱 필요) — SDK `finalMessage()` 사용

---

## 1. 핵심 원칙 — 백엔드 프록시 권장

> **결론: 프로덕션에서는 반드시 백엔드 프록시. 클라이언트에서 API 키 직접 사용 금지.**

| 방식 | 보안 | 용도 |
|------|------|------|
| 클라이언트 직접 호출 (`dangerouslyAllowBrowser: true`) | ❌ API 키 노출 | 로컬 프로토타입 한정 |
| 백엔드 프록시 (Next.js Route / Axum / Express / Spring) | ✅ 키 서버 보관 | 프로덕션 표준 |

> 주의: Anthropic SDK는 브라우저 사용 시 `dangerouslyAllowBrowser: true` 옵션을 명시해야 동작한다. 이름 그대로 *위험* 신호다. 키가 번들에 박혀 배포되거나 DevTools로 노출된다. 키 탈취 시 다크웹 reverse-proxy로 재판매되는 사례가 보고되어 있다 (OWASP API Top 10 2026).

---

## 2. SSE 응답 구조

```
event: message_start
data: {"type":"message_start","message":{...}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: ping
data: {"type":"ping"}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello"}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"!"}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":15}}

event: message_stop
data: {"type":"message_stop"}
```

**포맷 규칙 (MDN SSE 표준):**
- 각 줄은 `field: value\n`
- 한 메시지는 빈 줄(`\n\n`)로 종료
- 데이터 줄은 `data: ` 접두사
- `: ` 시작 라인은 주석 (keep-alive)

### 이벤트 흐름

1. `message_start` — 빈 `content`를 가진 Message 객체 1회
2. content block 단위 (각 인덱스마다):
   - `content_block_start` 1회
   - `content_block_delta` N회
   - `content_block_stop` 1회
3. `message_delta` 1회 이상 — `stop_reason`, `usage`(누적)
4. `message_stop` 1회 (종료 신호)
5. `ping` 이벤트는 어디서든 끼어들 수 있음
6. `error` 이벤트는 200 응답 *이후*에도 발생 가능 — 별도 처리 필요

### Delta 타입

| `delta.type` | 발생 조건 | 누적 방법 |
|--------------|-----------|-----------|
| `text_delta` | 일반 텍스트 응답 | `delta.text` 문자열 연결 |
| `input_json_delta` | tool_use 입력 | `delta.partial_json` 연결 후 `content_block_stop`에서 `JSON.parse` |
| `thinking_delta` | extended thinking | `delta.thinking` 연결 |
| `signature_delta` | thinking 종료 직전 | `delta.signature` 1회 (무결성 검증용) |

> 주의: `message_delta.usage`의 토큰 카운트는 *누적값*이지 증분이 아니다.

---

## 3. 프론트 패턴 A — 백엔드 프록시 + fetch ReadableStream

권장 패턴. 백엔드가 Anthropic으로 스트림을 받아 SSE를 그대로 클라이언트로 forward한다.

### 3-1. React 훅 (fetch + getReader)

```tsx
// hooks/useClaudeStream.ts
import { useCallback, useRef, useState } from 'react';

interface UseClaudeStreamResult {
  text: string;
  isStreaming: boolean;
  error: Error | null;
  send: (prompt: string) => Promise<void>;
  abort: () => void;
}

export function useClaudeStream(): UseClaudeStreamResult {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const send = useCallback(async (prompt: string) => {
    // 이전 요청 정리
    abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setText('');
    setError(null);
    setIsStreaming(true);

    try {
      const res = await fetch('/api/claude/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      if (!res.body) {
        throw new Error('No response body');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // throttle: 매 토큰마다 setState하면 React 18에서도 비용이 큼
      let pending = '';
      let rafId: number | null = null;
      const flush = () => {
        rafId = null;
        if (pending) {
          setText((prev) => prev + pending);
          pending = '';
        }
      };
      const schedule = (chunk: string) => {
        pending += chunk;
        if (rafId === null) {
          rafId = requestAnimationFrame(flush);
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE 메시지 단위(\n\n)로 분리
        let sepIdx: number;
        while ((sepIdx = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, sepIdx);
          buffer = buffer.slice(sepIdx + 2);

          // event:/data: 라인 파싱
          const dataLines = rawEvent
            .split('\n')
            .filter((l) => l.startsWith('data: '))
            .map((l) => l.slice(6));
          if (dataLines.length === 0) continue;

          const dataStr = dataLines.join('\n');
          let json: unknown;
          try {
            json = JSON.parse(dataStr);
          } catch {
            continue;
          }

          const evt = json as {
            type: string;
            delta?: { type?: string; text?: string };
            error?: { type: string; message: string };
          };

          if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
            schedule(evt.delta.text ?? '');
          } else if (evt.type === 'error') {
            throw new Error(evt.error?.message ?? 'stream error');
          } else if (evt.type === 'message_stop') {
            // 정상 종료
          }
        }
      }

      // 잔여 flush
      if (rafId !== null) cancelAnimationFrame(rafId);
      flush();
    } catch (e) {
      if ((e as Error).name === 'AbortError') {
        // 사용자 중단은 에러로 노출하지 않음
      } else {
        setError(e as Error);
      }
    } finally {
      setIsStreaming(false);
      controllerRef.current = null;
    }
  }, [abort]);

  return { text, isStreaming, error, send, abort };
}
```

### 3-2. 컴포넌트에서 unmount cleanup

```tsx
// components/ChatBox.tsx
import { useEffect } from 'react';
import { useClaudeStream } from '@/hooks/useClaudeStream';

export function ChatBox() {
  const { text, isStreaming, error, send, abort } = useClaudeStream();

  useEffect(() => {
    // unmount 시 진행 중 스트림 중단 (메모리 누수·React state warning 방지)
    return () => abort();
  }, [abort]);

  return (
    <div>
      <pre>{text}</pre>
      {isStreaming ? (
        <button onClick={abort}>중단</button>
      ) : (
        <button onClick={() => send('한국 도덕교육에서 절제의 의미는?')}>전송</button>
      )}
      {error && <p>에러: {error.message}</p>}
    </div>
  );
}
```

---

## 4. 백엔드 프록시 변형

### 4-1. Next.js 15 Route Handler (Edge runtime)

```ts
// app/api/claude/stream/route.ts
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'edge';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const upstream = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: '당신은 도덕교육 전문가입니다. ...',
        cache_control: { type: 'ephemeral' }, // 5분 캐시
      },
    ],
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  // SDK가 반환하는 AsyncIterable<MessageStreamEvent>를 SSE로 직렬화
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of upstream) {
          const payload = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        }
        controller.close();
      } catch (err) {
        const errPayload = `event: error\ndata: ${JSON.stringify({
          type: 'error',
          error: { type: 'api_error', message: (err as Error).message },
        })}\n\n`;
        controller.enqueue(encoder.encode(errPayload));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no', // nginx 버퍼링 차단
    },
  });
}
```

### 4-2. Rust (Axum) — SSE 응답

```rust
use axum::response::sse::{Event, Sse};
use futures::stream::Stream;
// reqwest로 Anthropic /v1/messages 호출 후 응답 body를 줄 단위로 파싱
// SDK 미사용 시: header에 anthropic-version, x-api-key, content-type 필수
// 반환 타입: Sse<impl Stream<Item = Result<Event, Infallible>>>
```

### 4-3. Spring Boot WebFlux — SseEmitter / Flux

`Flux<ServerSentEvent<String>>` 반환 또는 `SseEmitter` 사용. 핵심은 동일하게 Anthropic 응답을 그대로 forward.

> 주의: 어떤 백엔드든 응답 헤더에 `Content-Type: text/event-stream` 과 `Cache-Control: no-cache` 를 반드시 설정한다. 프록시·CDN의 응답 버퍼링도 차단해야 한다 (Cloudflare·nginx).

---

## 5. 프론트 패턴 B — Anthropic SDK 직접 (브라우저, 비권장)

빠른 프로토타입 한정. **프로덕션 금지.**

```tsx
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY, // 빌드 산출물에 박힘 — 위험
  dangerouslyAllowBrowser: true,
});

const stream = client.messages.stream({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello' }],
});

stream.on('text', (chunk) => {
  // chunk 단위로 누적
});
stream.on('error', (err) => console.error(err));

// 중단
stream.controller.abort();
```

SDK 이벤트 메서드:
- `.on('text', cb)` — text_delta 자동 누적된 청크
- `.on('message', cb)` — 최종 Message
- `.on('error', cb)` — 에러
- `await stream.finalMessage()` — 최종 누적 Message 반환

---

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
