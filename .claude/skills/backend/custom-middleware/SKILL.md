---
name: custom-middleware
description: Axum Tower 커스텀 미들웨어 작성 패턴 - from_fn, from_fn_with_state, 요청/응답 가로채기, 실전 예시
---

# Axum 커스텀 미들웨어 작성 패턴

> 소스: https://docs.rs/axum/0.8.1/axum/middleware/index.html | https://docs.rs/axum/0.8.1/axum/middleware/fn.from_fn.html | https://docs.rs/axum/0.8.1/axum/middleware/fn.from_fn_with_state.html
> 검증일: 2026-04-06

> 주의: axum 0.8.x 기준. 0.6 이하에서는 `Next<B>` 제네릭 파라미터가 필요했으나, 0.7부터 `Next`는 제네릭 없이 사용한다.
> (DISPUTED 수정: 변경 기점이 0.8이 아닌 0.7임. axum 0.7 공식 발표 및 Discussion #2488에서 확인)

> 주의: 미들웨어 함수의 `Request` 타입은 반드시 `axum::extract::Request`를 사용해야 한다. `axum::http::Request`는 제네릭(`Request<T>`)이므로 그대로 쓰면 컴파일 에러가 발생한다.

---

## tower-http vs 커스텀 미들웨어 선택 기준

| 상황 | 선택 |
|------|------|
| CORS, 압축, 트레이싱, 타임아웃 등 범용 기능 | tower-http 기성 미들웨어 |
| 비즈니스 로직이 포함된 인증/인가 | 커스텀 미들웨어 (`from_fn`) |
| 앱 State 접근이 필요한 미들웨어 | `from_fn_with_state` |
| 복잡한 상태 머신, 커넥션 풀링 등 | Tower `Service` 트레이트 직접 구현 |

대부분의 경우 `from_fn`으로 충분하다. `Service` 트레이트 직접 구현은 거의 필요하지 않다.

---

## middleware::from_fn (가장 간단)

`async fn`을 미들웨어로 변환한다. 함수 시그니처: `Request`와 `Next`를 받고 `impl IntoResponse`를 반환.

```rust
use axum::{
    extract::Request,
    middleware::{self, Next},
    response::Response,
    Router,
    routing::get,
};

async fn my_middleware(
    request: Request,
    next: Next,
) -> Response {
    // 요청 전 처리
    let response = next.run(request).await;
    // 응답 후 처리
    response
}

let app = Router::new()
    .route("/", get(handler))
    .layer(middleware::from_fn(my_middleware));
```

### Next 호출 규칙

- `next.run(request)`은 반드시 **한 번만** 호출한다.
- 호출하지 않으면 요청이 핸들러에 도달하지 않는다 (요청 차단 패턴).
- `Next`는 `Clone`이 아니므로 복수 호출은 컴파일 에러가 된다.

---

## from_fn_with_state (State 접근)

미들웨어 함수에서 앱 State에 접근해야 할 때 사용한다.

```rust
use axum::{
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::Response,
};

#[derive(Clone)]
struct AppState {
    api_keys: Vec<String>,
}

async fn api_key_middleware(
    State(state): State<AppState>,
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let key = request
        .headers()
        .get("x-api-key")
        .and_then(|v| v.to_str().ok());

    match key {
        Some(k) if state.api_keys.contains(&k.to_string()) => {
            Ok(next.run(request).await)
        }
        _ => Err(StatusCode::UNAUTHORIZED),
    }
}

let state = AppState {
    api_keys: vec!["secret-key-1".into()],
};

let app = Router::new()
    .route("/api/data", get(data_handler))
    .route_layer(middleware::from_fn_with_state(
        state.clone(),
        api_key_middleware,
    ))
    .with_state(state);
```

### 함수 시그니처 순서

State 추출자는 반드시 `Request`, `Next`보다 **앞**에 와야 한다.

```rust
// 올바른 순서
async fn mw(
    State(state): State<AppState>,  // 1. State (선택)
    request: Request,                // 2. Request (필수)
    next: Next,                      // 3. Next (필수)
) -> Response { ... }
```

State 외에 다른 추출자도 `Request` 앞에 배치할 수 있다.

```rust
async fn mw(
    State(state): State<AppState>,
    headers: HeaderMap,  // 추가 추출자
    request: Request,
    next: Next,
) -> Response { ... }
```

---

## 요청 가로채기 패턴

이 섹션의 예시들은 아래 공통 import를 전제한다.

```rust
use axum::{
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::Response,
};
```

### 요청 헤더 읽기

```rust
async fn log_request(
    request: Request,
    next: Next,
) -> Response {
    let method = request.method().clone();
    let uri = request.uri().clone();
    let user_agent = request
        .headers()
        .get("user-agent")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown")
        .to_string();

    tracing::info!(%method, %uri, %user_agent, "incoming request");

    next.run(request).await
}
```

### 요청 본문 읽기 후 재구성

본문을 읽으면 소비되므로, 읽은 후 새 `Request`로 재구성해야 한다.

```rust
use axum::body::Body;
use axum::extract::Request;
use http_body_util::BodyExt;

async fn log_body(
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let (parts, body) = request.into_parts();

    // 본문을 bytes로 수집
    let bytes = body
        .collect()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .to_bytes();

    tracing::info!(body = %String::from_utf8_lossy(&bytes), "request body");

    // 새 Request로 재구성 (axum::extract::Request = http::Request<Body>의 타입 alias)
    let request = Request::from_parts(parts, Body::from(bytes));

    Ok(next.run(request).await)
}
```

> 주의: 요청 본문을 메모리에 전부 로드하므로 대용량 업로드에는 부적합하다. `RequestBodyLimitLayer`와 함께 사용을 권장한다.

### 요청 차단 (Early Return)

`next.run()`을 호출하지 않으면 요청이 핸들러에 도달하지 않는다.

```rust
async fn reject_if_missing_header(
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    if request.headers().get("x-required-header").is_none() {
        return Err(StatusCode::BAD_REQUEST);
    }
    Ok(next.run(request).await)
}
```

---

## 응답 가로채기 패턴

이 섹션의 예시들도 `axum::extract::Request`, `middleware::Next`, `response::Response` import를 전제한다.

### 응답 헤더 추가

```rust
async fn add_response_header(
    request: Request,
    next: Next,
) -> Response {
    let mut response = next.run(request).await;
    response.headers_mut().insert(
        "x-request-id",
        uuid::Uuid::new_v4().to_string().parse().unwrap(),
    );
    response
}
```

### 응답 상태 코드 기반 로깅

```rust
async fn log_response(
    request: Request,
    next: Next,
) -> Response {
    let method = request.method().clone();
    let uri = request.uri().clone();
    let start = std::time::Instant::now();

    let response = next.run(request).await;

    let latency = start.elapsed();
    let status = response.status();

    if status.is_server_error() {
        tracing::error!(%method, %uri, %status, ?latency, "server error");
    } else {
        tracing::info!(%method, %uri, %status, ?latency, "response");
    }

    response
}
```

---

## 실전 예시: 요청 로깅 미들웨어

요청/응답 양쪽을 모두 로깅하는 통합 미들웨어.

```rust
use axum::{
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::Response,
};
use std::time::Instant;

async fn request_logging_middleware(
    request: Request,
    next: Next,
) -> Response {
    let method = request.method().clone();
    let uri = request.uri().clone();
    let start = Instant::now();

    tracing::info!(%method, %uri, "-> request");

    let response = next.run(request).await;

    let latency = start.elapsed();
    let status = response.status();

    tracing::info!(%method, %uri, %status, latency_ms = %latency.as_millis(), "<- response");

    response
}
```

적용:

```rust
let app = Router::new()
    .route("/api/users", get(list_users))
    .layer(middleware::from_fn(request_logging_middleware));
```

---

## 실전 예시: API 키 검증 미들웨어

DB나 설정에서 API 키를 검증하는 패턴.

```rust
use axum::{
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

#[derive(Clone)]
struct AppState {
    valid_api_keys: Vec<String>,
}

async fn validate_api_key(
    State(state): State<AppState>,
    request: Request,
    next: Next,
) -> Result<Response, Response> {
    let api_key = request
        .headers()
        .get("x-api-key")
        .and_then(|v| v.to_str().ok());

    match api_key {
        Some(key) if state.valid_api_keys.contains(&key.to_string()) => {
            Ok(next.run(request).await)
        }
        Some(_) => Err((
            StatusCode::FORBIDDEN,
            Json(json!({"error": "Invalid API key"})),
        ).into_response()),
        None => Err((
            StatusCode::UNAUTHORIZED,
            Json(json!({"error": "Missing x-api-key header"})),
        ).into_response()),
    }
}
```

적용:

```rust
let state = AppState {
    valid_api_keys: vec!["key-abc-123".into(), "key-def-456".into()],
};

let app = Router::new()
    .route("/api/data", get(data_handler))
    .route_layer(middleware::from_fn_with_state(
        state.clone(),
        validate_api_key,
    ))
    .route("/health", get(health_handler))  // 미들웨어 미적용
    .with_state(state);
```

> `route_layer`를 사용하면 그 위에 선언된 라우트에만 미들웨어가 적용된다. `/health`는 미들웨어를 통과하지 않는다.

---

## 미들웨어에 Request Extensions 전달

미들웨어에서 추출한 데이터를 핸들러에 전달할 때 `request.extensions_mut()`를 사용한다.

```rust
use axum::{
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::Response,
};

#[derive(Clone)]
struct CurrentUser {
    id: u64,
    name: String,
}

async fn auth_middleware(
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let token = request
        .headers()
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let user = verify_token(token)
        .await
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    // Extensions에 삽입
    request.extensions_mut().insert(user);

    Ok(next.run(request).await)
}

// 핸들러에서 Extension으로 추출
use axum::Extension;

async fn protected_handler(
    Extension(user): Extension<CurrentUser>,
) -> String {
    format!("Hello, {}", user.name)
}
```

---

## layer() vs route_layer() 적용 범위

```rust
let app = Router::new()
    .route("/protected", get(protected_handler))
    .route("/public", get(public_handler))
    .route_layer(middleware::from_fn(auth_mw))   // /protected, /public에 적용
    .route("/health", get(health_handler));       // auth_mw 미적용
```

| 메서드 | 적용 범위 | 매칭 안 된 요청 |
|--------|-----------|----------------|
| `.layer()` | 모든 요청 (fallback 포함) | 미들웨어 통과 |
| `.route_layer()` | 매칭된 라우트만 | 미들웨어 통과하지 않음 |

인증 미들웨어는 `.route_layer()`를 사용해야 404 응답이 인증 에러로 바뀌는 문제를 방지할 수 있다.

---

## 미들웨어 적용 순서

`.layer()` 호출 순서와 실행 순서는 역순이다.

```rust
let app = Router::new()
    .route("/", get(handler))
    .layer(middleware::from_fn(mw_a))   // 2번째 실행
    .layer(middleware::from_fn(mw_b));  // 1번째 실행

// 요청 흐름: mw_b -> mw_a -> handler -> mw_a -> mw_b
```

직관적 순서를 원하면 `tower::ServiceBuilder`를 사용한다:

```rust
use tower::ServiceBuilder;

let app = Router::new()
    .route("/", get(handler))
    .layer(
        ServiceBuilder::new()
            .layer(middleware::from_fn(mw_a))   // 1번째 실행
            .layer(middleware::from_fn(mw_b)),  // 2번째 실행
    );
```
