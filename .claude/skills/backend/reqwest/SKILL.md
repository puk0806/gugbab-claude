---
name: reqwest
description: Rust reqwest HTTP 클라이언트 핵심 패턴 — GET/POST, JSON, 헤더, 스트리밍, 에러 처리, Client 재사용
---

# reqwest HTTP 클라이언트

> 소스: https://docs.rs/reqwest/latest/reqwest/ | https://github.com/seanmonstar/reqwest | https://crates.io/crates/reqwest
> 검증일: 2026-09-28 (최초 2026-04-06)

> 이 문서는 reqwest 0.13.x(2025-12-30 첫 stable 릴리즈, crates.io 최신 0.13.5 — 2026-09-08 릴리즈, 소스 확인) 기준으로 작성되었습니다. 아래 예제 코드는 0.12.x·0.13.x 양쪽에서 동일하게 동작합니다(`json`/`stream` feature명, `.json()`/`.header()`/`.bytes_stream()`/`error_for_status()`/`is_timeout()` 등 API 변경 없음, `reqwest-0.13.0` 소스 직접 확인).

> **0.12 → 0.13 실제 Breaking Change (CHANGELOG.md·소스 코드 직접 확인, 2026-09-28):**
> - `rustls`가 `native-tls` 대신 기본 TLS 백엔드로 변경, crypto provider 기본값도 aws-lc로 변경(기존 ring). 다른 provider는 `rustls-no-provider` 사용
> - `rustls-tls` feature가 `rustls`로 rename. rustls roots feature 제거 — 기본으로 `rustls-platform-verifier` 사용(커스텀 루트는 `tls_certs_only(your_roots)`)
> - `native-tls`가 기본으로 ALPN 포함(비활성화는 `native-tls-no-alpn`)
> - `query`·`form`이 기본 비활성 opt-in feature로 변경(이전엔 항상 포함) — `.query()`/`.form()` 사용 시 `features = [..., "query", "form"]` 추가 필요
> - 오래 deprecated였던 메서드·feature 제거(예: `trust-dns` — 이미 `hickory-dns`로 rename됐던 것의 최종 제거)
> - 다수 TLS 메서드가 발견성 개선을 위해 rename(예: `use_rustls_tls()` 대신 `tls_backend_rustls()` 권장) — 구 이름은 soft-deprecated로 계속 동작
> - MSRV는 0.12.x·0.13.0 모두 1.64.0으로 **변경 없음** (Cargo.toml `rust-version` 직접 확인 — 과거 "1.85로 상향" 기재는 오류였음, 정정)
> - `ClientBuilder::dns_resolver2()`는 0.12.23에서 임시 추가됐다가 0.13.0에서 제거됨. 원래의 `dns_resolver()`는 0.13.0에도 그대로 존재 — "dns_resolver가 dns_resolver2로 교체"는 과거 기재 오류였음, 정정
> - 0.11.x 이하(hyper 0.14 기반) 대비로는 API 변경 폭이 더 크다(구버전 마이그레이션 시 공식 CHANGELOG 확인 권장)

---

## Cargo.toml 의존성

```toml
# reqwest 0.13.x 기준 (crates.io 최신 0.13.5, 2026-09-08). 0.12.x도 동일 feature명·API로 계속 사용 가능
[dependencies]
reqwest = { version = "0.13", features = ["json", "stream"] }
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
    model: "claude-sonnet-5".into(),
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
        "model": "claude-sonnet-5",
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

> 주의: reqwest 0.12.23(2025-08-12 릴리즈, 소스 확인)부터 `reqwest::retry` 모듈과 `ClientBuilder::retry(policy)` 메서드(0.13.0 소스에서도 동일 시그니처 확인)가 내장됨. 단, 기본 내장 retry는 HTTP/2 REFUSED_STREAM 등 프로토콜 레벨 NACK 재시도 용도이며, 커스텀 정책이 필요한 경우 reqwest-middleware + reqwest-retry 조합이 더 유연함.

### `ClientBuilder::retry(policy)` — 내장 재시도 정책 설정

`policy` 인자의 타입은 `reqwest::retry::Builder`다(docs.rs 0.13.5 시그니처: `pub fn retry(self, policy: Builder) -> ClientBuilder`). `reqwest::retry::for_host(host)`가 이 `Builder`를 바로 반환하므로 별도 변환 없이 체이닝해서 `.retry()`에 전달한다.

```rust
use reqwest::{Client, retry};

// 특정 호스트로 범위를 좁힌 재시도 정책 (retry::for_host()가 Builder를 반환)
let client = Client::builder()
    .retry(
        retry::for_host("api.anthropic.com")
            .max_retries_per_request(3)          // 요청당 최대 재시도 횟수
            .classify_fn(|req_rep| {
                // 재시도 가능 여부를 직접 판별 (기본은 프로토콜 NACK만 재시도)
                match req_rep.status() {
                    Some(status) if status.is_server_error() => req_rep.retryable(),
                    _ => req_rep.success(),
                }
            }),
    )
    .build()?;

// 특정 문자열/클로저 외의 범위가 필요하면 Builder::scoped() 사용
// let policy = retry::Builder::scoped(my_scope).max_retries_per_request(3);
```

- `retry::Builder::no_budget()` / `.max_extra_load(pct)`: 기본 20% 여유 재시도 예산(budget)을 끄거나 조정.
- `retry::Builder::classify(impl Classify)` / `.classify_fn(F)`: 어떤 응답을 재시도할지 커스텀 로직으로 판별(`req_rep.retryable()` / `req_rep.success()` 반환).
- 커스텀 정책이 이 내장 API로 부족하면(예: 지수 백오프 지연 자체 제어) `reqwest-middleware` + `reqwest-retry` 조합을 사용한다.

---

## DNS 리졸버 커스터마이징 — `ClientBuilder::dns_resolver()`

```rust
use reqwest::dns::{Resolve, Resolving, Name};
use reqwest::Client;
use std::sync::Arc;

// reqwest::dns::Resolve 트레이트 구현 (Send + Sync 필수, &self — 가변 참조 불필요)
struct MyResolver;

impl Resolve for MyResolver {
    fn resolve(&self, name: Name) -> Resolving {
        Box::pin(async move {
            // 커스텀 DNS 조회 로직 — Iterator<Item = SocketAddr>를 boxed future로 반환
            todo!("{name} 조회 후 SocketAddr 이터레이터 반환")
        })
    }
}

let client = Client::builder()
    .dns_resolver(Arc::new(MyResolver))  // Arc<R: Resolve + 'static> 가 IntoResolve 구현
    .build()?;
```

`dns_resolver<R>(self, resolver: R) -> ClientBuilder where R: IntoResolve`(docs.rs 0.13.5) — `IntoResolve`는 `Resolve + 'static`을 구현하는 타입과 `Arc<dyn Resolve>`에 대해 구현되어 있으므로, 커스텀 리졸버는 `Resolve`만 구현하면 된다. 특정 이름에 대한 개별 override(`resolve()`/`resolve_to_addrs()`)는 이 리졸버 위에 추가로 적용된다.

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

> 주의: crates.io 최신 기준 `reqwest-middleware` 0.5.x(0.5.2가 reqwest 0.13.1 의존 확인) / `reqwest-retry` 0.9.x (2026-09-28 확인). reqwest 0.12.x 프로젝트는 `reqwest-middleware` 0.4.x대 사용.
