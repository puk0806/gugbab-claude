---
name: reqwest
description: Rust reqwest HTTP 클라이언트 핵심 패턴 — GET/POST, JSON, 헤더, 스트리밍, 에러 처리, Client 재사용
---

# reqwest HTTP 클라이언트

> 소스: https://docs.rs/reqwest/latest/reqwest/ | https://github.com/seanmonstar/reqwest
> 검증일: 2026-04-06

> 주의: reqwest 0.12.x 기준 작성. 0.11.x 이하는 hyper 0.14 기반으로 일부 API 차이 있음.

---

## Cargo.toml 의존성

```toml
[dependencies]
reqwest = { version = "0.12", features = ["json", "stream"] }
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

- `json` feature: `.json()` 메서드 활성화 (serde 연동)
- `stream` feature: `bytes_stream()` 메서드 활성화 (스트리밍 응답)

---

## Client 생성과 재사용

`Client`는 내부에 커넥션 풀을 유지한다. 요청마다 새로 만들지 않고 재사용해야 한다.

```rust
use reqwest::Client;

// 기본 Client — 대부분의 경우 충분
let client = Client::new();

// ClientBuilder — 타임아웃, 기본 헤더, 프록시 등 설정 시
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};
use std::time::Duration;

let mut headers = HeaderMap::new();
headers.insert(AUTHORIZATION, HeaderValue::from_str("Bearer sk-xxx")?);

let client = Client::builder()
    .default_headers(headers)        // 모든 요청에 적용
    .timeout(Duration::from_secs(30)) // 요청별 타임아웃
    .connect_timeout(Duration::from_secs(10))
    .pool_max_idle_per_host(10)      // 호스트별 유휴 커넥션 수
    .build()?;
```

**Client::new vs ClientBuilder:**
- `Client::new()`: 기본 설정, 빠른 프로토타이핑
- `Client::builder()`: 타임아웃, 기본 헤더, TLS 설정 등 커스터마이징 필요 시

---

## GET 요청

```rust
// 단순 텍스트 응답
let body = client.get("https://httpbin.org/get")
    .send()
    .await?
    .text()
    .await?;

// JSON 역직렬화
#[derive(serde::Deserialize)]
struct ApiResponse {
    origin: String,
    url: String,
}

let resp: ApiResponse = client.get("https://httpbin.org/get")
    .send()
    .await?
    .json()
    .await?;
```

---

## POST 요청 (JSON)

```rust
#[derive(serde::Serialize)]
struct CreateRequest {
    model: String,
    max_tokens: u32,
    messages: Vec<Message>,
}

#[derive(serde::Serialize)]
struct Message {
    role: String,
    content: String,
}

let request_body = CreateRequest {
    model: "claude-sonnet-4-6".into(),
    max_tokens: 1024,
    messages: vec![Message {
        role: "user".into(),
        content: "Hello".into(),
    }],
};

let response = client.post("https://api.anthropic.com/v1/messages")
    .header("x-api-key", api_key)
    .header("anthropic-version", "2023-06-01")
    .json(&request_body)  // Content-Type: application/json 자동 설정
    .send()
    .await?;
```

`.json(&body)` 호출 시 `Content-Type: application/json` 헤더가 자동으로 설정된다.

---

## 헤더 설정

```rust
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};

// 방법 1: 요청별 개별 헤더
let resp = client.post(url)
    .header(AUTHORIZATION, format!("Bearer {}", token))
    .header(CONTENT_TYPE, "application/json")
    .header("x-api-key", api_key)        // 커스텀 헤더는 문자열 사용
    .send()
    .await?;

// 방법 2: HeaderMap 일괄 설정
let mut headers = HeaderMap::new();
headers.insert(AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {}", token))?);
headers.insert("x-api-key", HeaderValue::from_str(api_key)?);

let resp = client.post(url)
    .headers(headers)
    .send()
    .await?;
```

---

## 스트리밍 응답 처리 (SSE / bytes_stream)

Claude API의 Server-Sent Events 스트리밍 응답 처리 패턴.

```rust
use futures_util::StreamExt;

let response = client.post("https://api.anthropic.com/v1/messages")
    .header("x-api-key", api_key)
    .header("anthropic-version", "2023-06-01")
    .json(&serde_json::json!({
        "model": "claude-sonnet-4-6",
        "max_tokens": 1024,
        "stream": true,
        "messages": [{"role": "user", "content": "Hello"}]
    }))
    .send()
    .await?;

// stream feature 필요
let mut stream = response.bytes_stream();

while let Some(chunk) = stream.next().await {
    let chunk = chunk?;
    let text = String::from_utf8_lossy(&chunk);

    // SSE 파싱: "data: " 접두사 처리
    for line in text.lines() {
        if let Some(data) = line.strip_prefix("data: ") {
            if data == "[DONE]" {
                break;
            }
            // JSON 파싱
            let event: serde_json::Value = serde_json::from_str(data)?;
            // 이벤트 처리...
        }
    }
}
```

> 주의: SSE 청크가 이벤트 경계와 정확히 일치하지 않을 수 있다. 프로덕션에서는 버퍼링 로직 또는 `eventsource-stream` 같은 SSE 파서 크레이트 사용을 권장한다.

**futures-util 의존성 필요:**

```toml
futures-util = "0.3"
```

---

## 에러 처리

```rust
use reqwest::StatusCode;

#[derive(Debug)]
enum ApiError {
    Network(reqwest::Error),
    Status { code: StatusCode, body: String },
    Parse(serde_json::Error),
}

impl From<reqwest::Error> for ApiError {
    fn from(e: reqwest::Error) -> Self {
        ApiError::Network(e)
    }
}

async fn call_api(client: &Client, url: &str) -> Result<String, ApiError> {
    let response = client.get(url).send().await?;

    // 상태 코드 확인
    let status = response.status();
    if !status.is_success() {
        let body = response.text().await.unwrap_or_default();
        return Err(ApiError::Status { code: status, body });
    }

    Ok(response.text().await?)
}

// error_for_status() — 4xx/5xx를 reqwest::Error로 변환
let resp = client.get(url)
    .send()
    .await?
    .error_for_status()?;  // 4xx/5xx면 Err 반환
```

**reqwest::Error 주요 판별 메서드:**
- `is_timeout()` — 타임아웃 발생 여부
- `is_connect()` — 연결 실패 여부
- `is_status()` — HTTP 상태 코드 에러 여부
- `status()` — `Option<StatusCode>` 반환

---

## Claude API 호출 전체 예제

```rust
use reqwest::{Client, header::{HeaderMap, HeaderValue}};
use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Serialize)]
struct MessagesRequest {
    model: String,
    max_tokens: u32,
    messages: Vec<Message>,
}

#[derive(Serialize, Deserialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct MessagesResponse {
    id: String,
    content: Vec<ContentBlock>,
    model: String,
    stop_reason: Option<String>,
}

#[derive(Deserialize)]
struct ContentBlock {
    #[serde(rename = "type")]
    block_type: String,
    text: Option<String>,
}

fn build_client(api_key: &str) -> reqwest::Result<Client> {
    let mut headers = HeaderMap::new();
    headers.insert("x-api-key", HeaderValue::from_str(api_key).unwrap());
    headers.insert("anthropic-version", HeaderValue::from_static("2023-06-01"));

    Client::builder()
        .default_headers(headers)
        .timeout(Duration::from_secs(60))
        .build()
}

async fn send_message(
    client: &Client,
    model: &str,
    user_message: &str,
) -> Result<String, Box<dyn std::error::Error>> {
    let body = MessagesRequest {
        model: model.into(),
        max_tokens: 1024,
        messages: vec![Message {
            role: "user".into(),
            content: user_message.into(),
        }],
    };

    let resp: MessagesResponse = client
        .post("https://api.anthropic.com/v1/messages")
        .json(&body)
        .send()
        .await?
        .error_for_status()?
        .json()
        .await?;

    Ok(resp.content.into_iter()
        .filter_map(|b| b.text)
        .collect::<Vec<_>>()
        .join(""))
}
```

---

## 재시도 패턴

reqwest 자체에는 재시도 기능이 없다. 직접 구현하거나 `reqwest-middleware` + `reqwest-retry` 크레이트 사용.

> 주의: reqwest 0.12.23(2025-08-08 릴리즈)부터 `reqwest::retry` 모듈과 `ClientBuilder::retries(policy)` 메서드가 내장됨. 단, 기본 내장 retry는 HTTP/2 REFUSED_STREAM 등 프로토콜 레벨 NACK 재시도 용도이며, 커스텀 정책이 필요한 경우 reqwest-middleware + reqwest-retry 조합이 더 유연함.

```rust
// 수동 재시도 (지수 백오프)
use std::time::Duration;
use tokio::time::sleep;

async fn retry_request(
    client: &Client,
    url: &str,
    max_retries: u32,
) -> reqwest::Result<reqwest::Response> {
    let mut last_err = None;

    for attempt in 0..max_retries {
        match client.get(url).send().await {
            Ok(resp) if resp.status().is_server_error() => {
                last_err = Some(resp.error_for_status().unwrap_err());
            }
            Ok(resp) => return Ok(resp),
            Err(e) if e.is_timeout() || e.is_connect() => {
                last_err = Some(e);
            }
            Err(e) => return Err(e),  // 재시도 불가한 에러
        }

        let delay = Duration::from_millis(100 * 2u64.pow(attempt));
        sleep(delay).await;
    }

    Err(last_err.unwrap())
}
```

> 주의: `reqwest-middleware` 0.4.x / `reqwest-retry` 0.7.x 기준. 버전 호환성 확인 필요.
