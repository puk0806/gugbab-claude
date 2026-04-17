---
name: sse-streaming
description: Rust Axum SSE 스트리밍 구현 — Sse 응답, Event 구성, tokio-stream 활용, Claude API 스트리밍 변환, EventSource 연동
---

# Axum SSE 스트리밍 구현

> 소스: https://docs.rs/axum/latest/axum/response/sse/index.html | https://docs.rs/tokio-stream/latest/tokio_stream/ | https://developer.mozilla.org/en-US/docs/Web/API/EventSource
> 검증일: 2026-04-06

> 주의: Axum 0.8.x 기준으로 작성. 0.7 이하에서는 `axum::response::sse` 모듈 경로 및 일부 API가 다를 수 있다.

---

## 의존성 설정

```toml
# Cargo.toml
[dependencies]
axum = "0.8"
tokio = { version = "1", features = ["full"] }
tokio-stream = "0.1"
futures = "0.3"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

---

## 1. Sse 응답 타입 기본 구조

`axum::response::sse::Sse`는 `IntoResponse`를 구현하는 SSE 응답 래퍼다. `Stream<Item = Result<Event, E>>`를 받아 SSE 프로토콜로 변환한다.

```rust
use axum::response::sse::{Event, Sse};
use futures::stream::Stream;
use std::convert::Infallible;

async fn sse_handler() -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let stream = tokio_stream::iter(vec![
        Ok(Event::default().data("hello")),
        Ok(Event::default().data("world")),
    ]);

    Sse::new(stream)
}
```

**핵심:** `Sse::new(stream)`에 전달하는 스트림의 `Item`은 `Result<Event, E>`여야 한다. `E`가 에러 없는 스트림이면 `Infallible`을 사용한다.

---

## 2. Event 구조체

`Event`는 SSE 프로토콜의 단일 이벤트를 나타낸다. 빌더 패턴으로 구성한다.

```rust
use axum::response::sse::Event;

// 기본 데이터 전송
Event::default().data("plain text message")

// 이벤트 타입 지정 — 프론트엔드에서 addEventListener로 수신
Event::default()
    .event("chat_message")
    .data("hello from server")

// id 설정 — 클라이언트 재연결 시 Last-Event-ID 헤더로 전송됨
Event::default()
    .id("msg-001")
    .data("tracked message")

// JSON 데이터 전송
let payload = serde_json::json!({ "role": "assistant", "content": "Hi" });
Event::default()
    .event("message")
    .data(payload.to_string())

// 재연결 간격 설정 (밀리초)
Event::default()
    .retry(std::time::Duration::from_secs(5))
    .data("retry configured")

// 주석 — keep-alive용으로 활용
Event::default().comment("keep-alive")
```

| 메서드 | SSE 필드 | 용도 |
|--------|----------|------|
| `.data(str)` | `data:` | 이벤트 페이로드 |
| `.event(str)` | `event:` | 이벤트 타입명 (기본: `message`) |
| `.id(str)` | `id:` | 이벤트 ID (재연결 추적) |
| `.retry(Duration)` | `retry:` | 재연결 대기 시간 |
| `.comment(str)` | `:` | 주석 (keep-alive 등) |

---

## 3. tokio-stream 활용 패턴

### 3-1. 채널 기반 스트림 (mpsc → ReceiverStream)

비동기 작업에서 이벤트를 push할 때 가장 일반적인 패턴이다.

```rust
use axum::response::sse::{Event, Sse};
use tokio_stream::wrappers::ReceiverStream;
use tokio::sync::mpsc;
use std::convert::Infallible;

async fn sse_handler() -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let (tx, rx) = mpsc::channel::<Result<Event, Infallible>>(100);

    tokio::spawn(async move {
        for i in 0..10 {
            let event = Event::default()
                .event("counter")
                .data(format!("{}", i));

            if tx.send(Ok(event)).await.is_err() {
                break; // 클라이언트 연결 종료
            }
            tokio::time::sleep(std::time::Duration::from_secs(1)).await;
        }
    });

    Sse::new(ReceiverStream::new(rx))
}
```

### 3-2. stream! 매크로 (async-stream 크레이트)

간결한 스트림 생성이 필요할 때 사용한다.

```rust
use async_stream::stream;
use axum::response::sse::{Event, Sse};
use std::convert::Infallible;

async fn sse_handler() -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let s = stream! {
        for i in 0..10 {
            yield Ok(Event::default().data(format!("count: {}", i)));
            tokio::time::sleep(std::time::Duration::from_secs(1)).await;
        }
    };

    Sse::new(s)
}
```

> 주의: `async-stream`은 별도 크레이트(`async-stream = "0.3"`)가 필요하다. Axum 공식 예제는 `stream!` 매크로 대신 `futures_util::stream::repeat_with()`를 사용한다. `stream!`은 커뮤니티에서 널리 사용되는 패턴이지만 공식 예제 포함 여부와는 무관하다.

### 3-3. Keep-Alive 설정

연결 유지를 위해 주기적으로 주석 이벤트를 보낸다.

```rust
use axum::response::sse::KeepAlive;

Sse::new(stream).keep_alive(
    KeepAlive::new()
        .interval(std::time::Duration::from_secs(15))
        .text("keep-alive")
)
```

---

## 4. 라우터 등록

```rust
use axum::{routing::get, Router};

let app = Router::new()
    .route("/events", get(sse_handler));
```

SSE는 GET 요청으로 처리한다. POST 본문이 필요한 경우(예: Claude API 호출 파라미터 전달) 별도 엔드포인트로 세션을 생성하고, SSE 연결에서 세션 ID를 쿼리로 전달하는 패턴을 사용한다.

---

## 5. Claude API 스트리밍 응답을 SSE로 변환

Claude Messages API의 `stream: true` 응답을 서버에서 수신하여 프론트엔드로 중계하는 패턴이다.

```rust
use axum::{
    extract::Json,
    response::sse::{Event, Sse},
};
use futures::stream::Stream;
use reqwest::Client;
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;
use std::convert::Infallible;

#[derive(serde::Deserialize)]
struct ChatRequest {
    message: String,
}

async fn chat_stream(
    Json(req): Json<ChatRequest>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let (tx, rx) = mpsc::channel::<Result<Event, Infallible>>(100);

    tokio::spawn(async move {
        let client = Client::new();
        let api_key = std::env::var("ANTHROPIC_API_KEY")
            .expect("ANTHROPIC_API_KEY not set");

        // Claude Messages API 스트리밍 요청
        let response = client
            .post("https://api.anthropic.com/v1/messages")
            .header("x-api-key", &api_key)
            .header("anthropic-version", "2023-06-01")
            .header("content-type", "application/json")
            .json(&serde_json::json!({
                "model": "claude-sonnet-4-6",
                "max_tokens": 1024,
                "stream": true,
                "messages": [{"role": "user", "content": req.message}]
            }))
            .send()
            .await;

        let Ok(resp) = response else {
            let _ = tx.send(Ok(
                Event::default().event("error").data("API request failed")
            )).await;
            return;
        };

        // 바이트 스트림을 SSE 라인으로 파싱
        let mut stream = resp.bytes_stream();
        let mut buffer = String::new();

        use futures::StreamExt;
        while let Some(chunk) = stream.next().await {
            let Ok(bytes) = chunk else { break };
            buffer.push_str(&String::from_utf8_lossy(&bytes));

            // Claude SSE 응답은 "data: {...}\n\n" 형식
            while let Some(pos) = buffer.find("\n\n") {
                let line = buffer[..pos].to_string();
                buffer = buffer[pos + 2..].to_string();

                let Some(data) = line.strip_prefix("data: ") else {
                    continue;
                };

                // event: message_stop 이면 종료
                if data.contains("\"type\":\"message_stop\"") {
                    let _ = tx.send(Ok(
                        Event::default().event("done").data("[DONE]")
                    )).await;
                    return;
                }

                // content_block_delta에서 텍스트 추출
                if data.contains("\"type\":\"content_block_delta\"") {
                    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(data) {
                        if let Some(text) = parsed["delta"]["text"].as_str() {
                            let _ = tx.send(Ok(
                                Event::default().event("text_delta").data(text)
                            )).await;
                        }
                    }
                }
            }
        }
    });

    Sse::new(ReceiverStream::new(rx))
        .keep_alive(
            axum::response::sse::KeepAlive::new()
                .interval(std::time::Duration::from_secs(15))
        )
}
```

> 주의: Claude API 스트리밍 응답의 전체 이벤트 타입은 `message_start`, `content_block_start`, `content_block_delta`, `content_block_stop`, `message_delta`, `message_stop`, `ping`, `error`이며, extended thinking 사용 시 `thinking_delta`, `signature_delta`가 추가됩니다. API 버전에 따라 변경될 수 있으므로 최신 사양은 https://docs.anthropic.com/en/api/messages-streaming 참조.

---

## 6. CORS 설정

브라우저 EventSource가 다른 오리진의 SSE에 연결하려면 CORS 설정이 필요하다.

```rust
use tower_http::cors::{CorsLayer, Any};

let cors = CorsLayer::new()
    .allow_origin(Any)
    .allow_methods(Any)
    .allow_headers(Any);

let app = Router::new()
    .route("/events", get(sse_handler))
    .layer(cors);
```

> 주의: 프로덕션에서는 `Any` 대신 허용할 오리진을 명시적으로 지정한다.

---

## 7. 프론트엔드 EventSource 연동

### 7-1. 기본 EventSource (GET 전용)

```typescript
const source = new EventSource("/events");

// 기본 message 이벤트
source.onmessage = (e: MessageEvent) => {
  console.log("data:", e.data);
};

// 커스텀 이벤트 타입 수신 (.event()로 지정한 이름)
source.addEventListener("text_delta", (e: MessageEvent) => {
  console.log("delta:", e.data);
});

source.addEventListener("done", () => {
  source.close();
});

// 에러 핸들링
source.onerror = (e) => {
  console.error("SSE error:", e);
  source.close();
};
```

### 7-2. POST 요청이 필요한 경우 (fetch + ReadableStream)

EventSource는 GET만 지원한다. POST 본문이 필요하면 fetch의 ReadableStream을 파싱한다.

```typescript
async function streamChat(message: string, onDelta: (text: string) => void) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE 프로토콜 파싱: "event: ...\ndata: ...\n\n"
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const lines = part.split("\n");
      let eventType = "message";
      let data = "";

      for (const line of lines) {
        if (line.startsWith("event: ")) eventType = line.slice(7);
        if (line.startsWith("data: ")) data = line.slice(6);
      }

      if (eventType === "text_delta") {
        onDelta(data);
      } else if (eventType === "done") {
        return;
      }
    }
  }
}

// 사용 예
streamChat("Hello Claude", (text) => {
  process.stdout.write(text); // 또는 DOM에 append
});
```

### 7-3. React 훅 패턴

```typescript
import { useState, useCallback } from "react";

function useSSEChat() {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const send = useCallback(async (message: string) => {
    setContent("");
    setIsStreaming(true);

    await streamChat(message, (delta) => {
      setContent((prev) => prev + delta);
    });

    setIsStreaming(false);
  }, []);

  return { content, isStreaming, send };
}
```

---

## 8. 에러 핸들링 패턴

```rust
use axum::response::sse::Event;

// 에러를 SSE 이벤트로 변환
fn error_event(msg: &str) -> Event {
    Event::default()
        .event("error")
        .data(serde_json::json!({ "message": msg }).to_string())
}

// 스트림 내에서 에러 발생 시
if let Err(e) = some_operation().await {
    let _ = tx.send(Ok(error_event(&e.to_string()))).await;
    return;
}
```

---

## 핵심 요약

| 항목 | 선택 |
|------|------|
| 응답 타입 | `Sse<impl Stream<Item = Result<Event, Infallible>>>` |
| 스트림 생성 | mpsc + `ReceiverStream` (비동기 push) 또는 `async_stream::stream!` (간결) |
| Keep-Alive | `Sse::new(s).keep_alive(KeepAlive::new().interval(...))` |
| 프론트 GET | `EventSource` API |
| 프론트 POST | `fetch` + `ReadableStream` 파싱 |
| 에러 전달 | `event: error` 커스텀 이벤트 타입으로 전송 |
