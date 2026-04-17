---
name: tower-http
description: tower-http 미들웨어 라이브러리 (CorsLayer, TraceLayer, CompressionLayer) 및 Axum 연동
---

# tower-http 미들웨어 가이드

> 소스: https://docs.rs/tower-http | https://github.com/tower-rs/tower-http
> 검증일: 2026-04-06

> 주의: tower-http는 0.x 버전으로 minor 버전 간 Breaking Change가 발생할 수 있다. 프로젝트의 Cargo.lock에서 실제 사용 버전을 반드시 확인할 것. 아래 내용은 0.6.x 기준이며, 0.5.x 이하에서는 일부 API가 다를 수 있다.

---

## Cargo.toml 의존성 설정

tower-http는 feature flag 기반으로 필요한 미들웨어만 선택적으로 활성화한다.

```toml
[dependencies]
tower-http = { version = "0.6", features = ["cors", "trace", "compression-full", "timeout", "limit"] }
```

주요 feature flag:

| Feature | 포함 미들웨어 |
|---------|-------------|
| `cors` | CorsLayer |
| `trace` | TraceLayer |
| `compression-full` | CompressionLayer (gzip, br, deflate, zstd 전부) |
| `compression-gzip` | gzip만 |
| `compression-br` | brotli만 |
| `fs` | ServeDir, ServeFile |
| `timeout` | TimeoutLayer |
| `limit` | RequestBodyLimitLayer |
| `full` | 모든 미들웨어 |

---

## CorsLayer

Cross-Origin Resource Sharing 헤더를 응답에 추가한다.

```rust
use tower_http::cors::{CorsLayer, Any};
use http::Method;

// 모든 origin 허용 (개발용) — credentials는 허용하지 않음
// credentials까지 허용하려면 CorsLayer::very_permissive() 사용
let cors = CorsLayer::permissive();

// 프로덕션 권장: 명시적 설정
let cors = CorsLayer::new()
    .allow_origin(["https://example.com".parse().unwrap()])
    .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
    .allow_headers(Any)
    .max_age(Duration::from_secs(3600));
```

### 주요 메서드

| 메서드 | 설명 | 타입 |
|--------|------|------|
| `allow_origin()` | 허용할 origin | `impl Into<AllowOrigin>` |
| `allow_methods()` | 허용할 HTTP 메서드 | `impl Into<AllowMethods>` |
| `allow_headers()` | 허용할 요청 헤더 | `impl Into<AllowHeaders>` |
| `expose_headers()` | 브라우저에 노출할 응답 헤더 | `impl Into<ExposeHeaders>` |
| `max_age()` | preflight 캐시 시간 | `Duration` |
| `allow_credentials()` | 쿠키/인증 포함 여부 | `bool` |

### allow_origin 패턴

```rust
use tower_http::cors::{AllowOrigin, Any};

// 모든 origin
.allow_origin(Any)

// 단일 origin
.allow_origin(["https://example.com".parse().unwrap()])

// 여러 origin
.allow_origin([
    "https://example.com".parse().unwrap(),
    "https://app.example.com".parse().unwrap(),
])

// 동적 판단 (클로저)
.allow_origin(AllowOrigin::predicate(|origin, _req_parts| {
    origin.as_bytes().ends_with(b".example.com")
}))
```

> 주의: `allow_credentials(true)`와 `allow_origin(Any)`는 동시에 사용할 수 없다. CORS 스펙상 credentials 모드에서는 와일드카드 origin이 금지된다.

---

## TraceLayer

요청/응답 로깅을 위한 미들웨어. `tracing` 크레이트와 연동된다.

```rust
use tower_http::trace::TraceLayer;
use tracing::Level;

// 기본 사용 (HTTP 레벨 로깅)
let trace = TraceLayer::new_for_http();
```

### 커스텀 로깅

```rust
use tower_http::trace::{TraceLayer, DefaultOnRequest, DefaultOnResponse};
use tracing::Level;

let trace = TraceLayer::new_for_http()
    .on_request(DefaultOnRequest::new().level(Level::INFO))
    .on_response(
        DefaultOnResponse::new()
            .level(Level::INFO)
            .latency_unit(tower_http::LatencyUnit::Micros),
    );
```

### 콜백 커스터마이징

```rust
use tower_http::trace::TraceLayer;
use tracing::Span;
use http::Request;

let trace = TraceLayer::new_for_http()
    .make_span_with(|request: &Request<_>| {
        tracing::info_span!(
            "http_request",
            method = %request.method(),
            uri = %request.uri(),
        )
    })
    .on_request(|_request: &Request<_>, _span: &Span| {
        tracing::info!("request started");
    })
    .on_response(|response: &http::Response<_>, latency: std::time::Duration, _span: &Span| {
        tracing::info!(status = %response.status(), latency = ?latency, "response sent");
    });
```

### tracing 초기화 (필수)

TraceLayer는 `tracing` 크레이트에 의존한다. subscriber를 초기화해야 로그가 출력된다.

```rust
// Cargo.toml
// tracing-subscriber = { version = "0.3", features = ["env-filter"] }

tracing_subscriber::fmt()
    .with_env_filter("tower_http=debug,info")
    .init();
```

---

## CompressionLayer

응답 본문을 자동으로 압축한다. `Accept-Encoding` 헤더를 기반으로 알고리즘을 선택한다.

```rust
use tower_http::compression::CompressionLayer;

// 모든 지원 알고리즘 활성화
let compression = CompressionLayer::new();

// 특정 알고리즘만
let compression = CompressionLayer::new()
    .gzip(true)
    .br(true)
    .deflate(false)
    .zstd(false);
```

### 알고리즘 우선순위

클라이언트 `Accept-Encoding`의 quality 값(q=)이 높은 알고리즘을 우선 선택한다. quality 값이 동일할 때는 서버 내부 순서(deflate < gzip < brotli < zstd)가 타이브레이커로 작동한다.

> 주의: `Accept-Encoding: gzip;q=1.0, br;q=0.9`처럼 클라이언트가 명시한 경우 quality 값이 높은 gzip이 선택된다. "zstd > brotli > gzip > deflate" 우선순위는 quality 값이 동일한 경우에만 적용된다.

### 주의사항

- 이미 압축된 응답(이미지, 동영상 등)에는 불필요하다. `CompressionLayer`는 `Content-Type`을 보고 자동 스킵하지 않으므로 필요 시 조건부 적용을 고려한다.
- SSE(Server-Sent Events) 스트림에서는 버퍼링 문제가 발생할 수 있다.

---

## Axum 연동 (.layer())

Axum은 tower의 `Layer` 트레이트를 기반으로 미들웨어를 적용한다. `Router::layer()` 메서드로 연결한다.

```rust
use axum::{Router, routing::get};
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tower_http::compression::CompressionLayer;

async fn handler() -> &'static str {
    "Hello, World!"
}

let app = Router::new()
    .route("/", get(handler))
    .layer(CompressionLayer::new())
    .layer(CorsLayer::permissive())
    .layer(TraceLayer::new_for_http());
```

### .layer() 실행 순서

> 주의: `.layer()` 호출 순서와 실제 미들웨어 실행 순서는 **역순**이다. 마지막에 추가한 레이어가 가장 먼저 실행된다.

위 코드의 실행 순서:

```
요청 → TraceLayer → CorsLayer → CompressionLayer → handler
응답 → CompressionLayer → CorsLayer → TraceLayer
```

따라서 TraceLayer를 가장 바깥(마지막 `.layer()`)에 배치해야 전체 요청/응답 사이클을 추적할 수 있다.

---

## 여러 미들웨어 체이닝

### 방법 1: .layer() 체이닝 (권장)

```rust
let app = Router::new()
    .route("/api/users", get(list_users).post(create_user))
    .route("/api/health", get(health_check))
    .layer(CompressionLayer::new())
    .layer(CorsLayer::permissive())
    .layer(TraceLayer::new_for_http());
```

### 방법 2: tower::ServiceBuilder

`ServiceBuilder`를 사용하면 선언 순서대로(위에서 아래로) 실행된다. `.layer()` 체이닝의 역순 혼란을 피할 수 있다.

```rust
use tower::ServiceBuilder;

let app = Router::new()
    .route("/", get(handler))
    .layer(
        ServiceBuilder::new()
            .layer(TraceLayer::new_for_http())     // 1번째 실행
            .layer(CorsLayer::permissive())        // 2번째 실행
            .layer(CompressionLayer::new()),        // 3번째 실행
    );
```

### 방법 3: 라우트 그룹별 미들웨어

```rust
let api_routes = Router::new()
    .route("/users", get(list_users))
    .route("/posts", get(list_posts))
    .layer(CorsLayer::permissive());  // API 라우트에만 CORS 적용

let admin_routes = Router::new()
    .route("/dashboard", get(dashboard));
    // CORS 없음

let app = Router::new()
    .nest("/api", api_routes)
    .nest("/admin", admin_routes)
    .layer(TraceLayer::new_for_http());  // 모든 라우트에 트레이싱 적용
```

---

## 실전 구성 예시

```rust
use axum::{Router, routing::get};
use tower_http::{
    cors::{CorsLayer, Any},
    trace::{TraceLayer, DefaultOnResponse},
    compression::CompressionLayer,
    timeout::TimeoutLayer,
    limit::RequestBodyLimitLayer,
};
use http::Method;
use std::time::Duration;
use tracing::Level;

pub fn create_app() -> Router {
    let cors = CorsLayer::new()
        .allow_origin(["https://myapp.com".parse().unwrap()])
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(Any)
        .max_age(Duration::from_secs(3600));

    let trace = TraceLayer::new_for_http()
        .on_response(DefaultOnResponse::new().level(Level::INFO));

    Router::new()
        .route("/health", get(|| async { "ok" }))
        .nest("/api", api_routes())
        .layer(CompressionLayer::new())
        .layer(RequestBodyLimitLayer::new(1024 * 1024 * 10))  // 10MB
        // 주의: with_status_code는 tower-http 0.6.7+에서 도입. Cargo.toml "0.6"으로 지정하면 자동 해결됨
        .layer(TimeoutLayer::with_status_code(
            http::StatusCode::REQUEST_TIMEOUT,
            Duration::from_secs(30),
        ))
        .layer(cors)
        .layer(trace)
}
```

---

## 자주 하는 실수

| 실수 | 증상 | 해결 |
|------|------|------|
| feature flag 누락 | 컴파일 에러 (`unresolved import`) | `Cargo.toml`에 필요한 feature 추가 |
| `.layer()` 순서 착각 | 로그에 CORS 에러 전 요청이 안 보임 | TraceLayer를 마지막 `.layer()`로 배치 |
| `Any` origin + credentials | 브라우저 CORS 에러 | 명시적 origin 목록 사용 |
| tracing subscriber 미초기화 | TraceLayer 추가해도 로그 없음 | `tracing_subscriber::fmt().init()` 호출 |
| CompressionLayer + SSE | 이벤트가 버퍼링됨 | SSE 라우트에는 compression 미적용 |
