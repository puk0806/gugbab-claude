---
name: axum
description: Rust Axum 웹 프레임워크 핵심 패턴 - 라우팅, 상태 공유, 추출자, 에러 핸들링, 미들웨어
---

# Axum 웹 프레임워크 핵심 패턴

> 소스: https://docs.rs/axum/latest/axum/ | https://github.com/tokio-rs/axum
> 검증일: 2026-04-06

> 주의: 이 문서는 axum 0.8.x 기준으로 작성되었습니다. 0.7에서 0.8로의 마이그레이션 시 Breaking Change가 있으므로 공식 changelog를 반드시 확인하세요.

---

## 프로젝트 설정

```toml
# Cargo.toml
[dependencies]
axum = "0.8"
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tower = "0.5"
tower-http = { version = "0.6", features = ["cors", "trace"] }
```

---

## 서버 실행

```rust
use axum::Router;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    let app = Router::new();

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

> 주의: axum 0.7부터 `axum::Server`를 사용할 수 없습니다 (hyper 1.0 의존으로 소멸). `tokio::net::TcpListener` + `axum::serve`를 사용합니다.

---

## 라우팅 (Router, 핸들러)

### 기본 라우팅

```rust
use axum::{
    routing::{get, post, put, delete},
    Router,
};

let app = Router::new()
    .route("/", get(root_handler))
    .route("/users", get(list_users).post(create_user))
    .route("/users/{id}", get(get_user).put(update_user).delete(delete_user));
```

> 주의: axum 0.8부터 경로 파라미터 문법이 `:id`에서 `{id}`로 변경되었습니다.

### 핸들러 함수

핸들러는 추출자를 인자로 받고 `IntoResponse`를 반환하는 async 함수입니다.

```rust
use axum::response::IntoResponse;
use axum::http::StatusCode;

// 단순 문자열 반환
async fn root_handler() -> &'static str {
    "Hello, World!"
}

// StatusCode + 본문
async fn not_found() -> (StatusCode, &'static str) {
    (StatusCode::NOT_FOUND, "Not Found")
}

// impl IntoResponse
async fn health_check() -> impl IntoResponse {
    (StatusCode::OK, "OK")
}
```

### 라우터 중첩 (nest)

```rust
let api_routes = Router::new()
    .route("/users", get(list_users))
    .route("/posts", get(list_posts));

let app = Router::new()
    .nest("/api/v1", api_routes);
// /api/v1/users, /api/v1/posts 로 접근
```

### Fallback

```rust
let app = Router::new()
    .route("/", get(root_handler))
    .fallback(fallback_handler);

async fn fallback_handler() -> (StatusCode, &'static str) {
    (StatusCode::NOT_FOUND, "Route not found")
}
```

---

## 요청 추출자 (Extractors)

추출자는 핸들러 함수의 인자로 사용됩니다. 마지막 인자만 요청 본문을 소비할 수 있습니다.

### Path - 경로 파라미터

```rust
use axum::extract::Path;

// 단일 파라미터
async fn get_user(Path(id): Path<u64>) -> String {
    format!("User: {id}")
}

// 복수 파라미터
async fn get_post(Path((user_id, post_id)): Path<(u64, u64)>) -> String {
    format!("User {user_id}, Post {post_id}")
}

// 구조체로 역직렬화
#[derive(Deserialize)]
struct PostParams {
    user_id: u64,
    post_id: u64,
}

async fn get_post_v2(Path(params): Path<PostParams>) -> String {
    format!("User {}, Post {}", params.user_id, params.post_id)
}
```

### Query - 쿼리 파라미터

```rust
use axum::extract::Query;
use serde::Deserialize;

#[derive(Deserialize)]
struct Pagination {
    page: Option<u32>,
    per_page: Option<u32>,
}

async fn list_users(Query(pagination): Query<Pagination>) -> String {
    let page = pagination.page.unwrap_or(1);
    let per_page = pagination.per_page.unwrap_or(20);
    format!("Page {page}, per_page {per_page}")
}
```

### Json - JSON 요청/응답

```rust
use axum::Json;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct CreateUser {
    username: String,
    email: String,
}

#[derive(Serialize)]
struct User {
    id: u64,
    username: String,
}

async fn create_user(Json(payload): Json<CreateUser>) -> (StatusCode, Json<User>) {
    let user = User {
        id: 1,
        username: payload.username,
    };
    (StatusCode::CREATED, Json(user))
}
```

### Headers

```rust
use axum::http::HeaderMap;
use axum_extra::TypedHeader;
use axum_extra::headers::Authorization;
use axum_extra::headers::authorization::Bearer;

// HeaderMap으로 직접 접근
async fn with_headers(headers: HeaderMap) -> String {
    let user_agent = headers
        .get("user-agent")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown");
    format!("User-Agent: {user_agent}")
}

// TypedHeader (axum-extra 필요)
async fn with_auth(
    TypedHeader(auth): TypedHeader<Authorization<Bearer>>,
) -> String {
    format!("Token: {}", auth.token())
}
```

> 주의: `TypedHeader`는 `axum-extra` 크레이트에 있으며, `typed-header` feature를 활성화해야 합니다. (`axum-extra = { version = "0.9", features = ["typed-header"] }`)

### 추출자 순서 규칙

```rust
// 본문을 소비하는 추출자(Json, String, Bytes)는 반드시 마지막 인자
async fn handler(
    Path(id): Path<u64>,           // 본문 비소비 - 순서 자유
    Query(params): Query<Params>,  // 본문 비소비 - 순서 자유
    headers: HeaderMap,            // 본문 비소비 - 순서 자유
    Json(body): Json<CreateUser>,  // 본문 소비 - 반드시 마지막
) -> impl IntoResponse {
    // ...
}
```

---

## 상태 공유 (State)

### State 추출자

```rust
use axum::extract::State;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Clone)]
struct AppState {
    db_pool: sqlx::PgPool,
    // 또는 가변 상태가 필요한 경우:
    counter: Arc<RwLock<u64>>,
}

async fn handler(State(state): State<AppState>) -> String {
    let count = state.counter.read().await;
    format!("Count: {count}")
}

#[tokio::main]
async fn main() {
    let state = AppState {
        db_pool: /* ... */,
        counter: Arc::new(RwLock::new(0)),
    };

    let app = Router::new()
        .route("/", get(handler))
        .with_state(state);

    // ...
}
```

### State는 Clone 필수

`State`에 전달하는 타입은 `Clone`을 구현해야 합니다. 큰 데이터는 `Arc`로 감싸세요.

```rust
// 방법 1: 구조체 전체를 Arc로 감싸기
type SharedState = Arc<InnerState>;

struct InnerState {
    db_pool: sqlx::PgPool,
}

let state = Arc::new(InnerState { /* ... */ });
let app = Router::new()
    .route("/", get(handler))
    .with_state(state);
```

### Extension (레거시 방식)

```rust
use axum::Extension;

// State 대신 Extension으로도 공유 가능 (0.6 이전 방식)
// State 추출자를 사용하는 것이 공식 권장됨
let app = Router::new()
    .route("/", get(handler))
    .layer(Extension(shared_data));

async fn handler(Extension(data): Extension<SharedData>) -> String {
    // ...
}
```

> 주의: Extension은 컴파일 타임에 타입 검사가 되지 않아 런타임 에러 가능성이 있습니다. axum 0.6부터 State 추출자가 도입되었으며 공식적으로 State 사용이 권장됩니다.

---

## 에러 핸들링

### IntoResponse 기반 에러

```rust
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};

enum AppError {
    NotFound,
    Internal(String),
    BadRequest(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::NotFound => (StatusCode::NOT_FOUND, "Not Found".to_string()),
            AppError::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
        };
        (status, message).into_response()
    }
}

async fn get_user(Path(id): Path<u64>) -> Result<Json<User>, AppError> {
    let user = find_user(id).ok_or(AppError::NotFound)?;
    Ok(Json(user))
}
```

### anyhow 연동 패턴

```rust
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};

struct AppError(anyhow::Error);

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Something went wrong: {}", self.0),
        )
            .into_response()
    }
}

// anyhow::Error -> AppError 자동 변환
impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}

// 핸들러에서 ? 연산자 자유롭게 사용 가능
async fn handler() -> Result<String, AppError> {
    let data = std::fs::read_to_string("file.txt")?;
    Ok(data)
}
```

### 추출자 에러 커스터마이징

```rust
use axum::extract::rejection::JsonRejection;

// Json 추출 실패 시 커스텀 에러 반환
async fn create_user(
    payload: Result<Json<CreateUser>, JsonRejection>,
) -> Result<Json<User>, AppError> {
    let Json(payload) = payload.map_err(|e| AppError::BadRequest(e.to_string()))?;
    // ...
}
```

---

## 미들웨어

### tower-http 미들웨어

```rust
use tower_http::cors::{CorsLayer, Any};
use tower_http::trace::TraceLayer;
use std::time::Duration;

let app = Router::new()
    .route("/", get(handler))
    .layer(TraceLayer::new_for_http())
    .layer(
        CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(Any)
            .allow_headers(Any)
            .max_age(Duration::from_secs(3600)),
    );
```

### axum::middleware::from_fn

```rust
use axum::extract::Request;
use axum::middleware::{self, Next};
use axum::response::Response;

async fn auth_middleware(
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_header = request
        .headers()
        .get("authorization")
        .and_then(|v| v.to_str().ok());

    match auth_header {
        Some(token) if token_is_valid(token) => {
            Ok(next.run(request).await)
        }
        _ => Err(StatusCode::UNAUTHORIZED),
    }
}

let app = Router::new()
    .route("/protected", get(protected_handler))
    .route_layer(middleware::from_fn(auth_middleware));
```

### 미들웨어에서 State 접근

```rust
use axum::extract::State;

async fn auth_middleware(
    State(state): State<AppState>,
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    // state 사용 가능
    Ok(next.run(request).await)
}

let app = Router::new()
    .route("/", get(handler))
    .route_layer(middleware::from_fn_with_state(
        app_state.clone(),
        auth_middleware,
    ))
    .with_state(app_state);
```

### layer vs route_layer

| 메서드 | 적용 범위 |
|--------|-----------|
| `.layer()` | 모든 요청 (fallback 포함) |
| `.route_layer()` | 매칭된 라우트에만 적용 |

---

## 자주 쓰는 패턴

### Graceful Shutdown

```rust
#[tokio::main]
async fn main() {
    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
}

async fn shutdown_signal() {
    tokio::signal::ctrl_c()
        .await
        .expect("failed to install CTRL+C signal handler");
}
```

### 라우터 병합 (merge)

```rust
let user_routes = Router::new()
    .route("/users", get(list_users).post(create_user));

let post_routes = Router::new()
    .route("/posts", get(list_posts));

let app = Router::new()
    .merge(user_routes)
    .merge(post_routes);
```

### 정적 파일 서빙

```rust
use tower_http::services::ServeDir;

let app = Router::new()
    .route("/api", get(api_handler))
    .nest_service("/static", ServeDir::new("assets"));
```
