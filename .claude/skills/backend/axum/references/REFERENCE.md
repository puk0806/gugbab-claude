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
