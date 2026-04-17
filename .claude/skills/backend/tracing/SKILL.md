---
name: tracing
description: Rust tracing + tracing-subscriber 구조화 로깅 - 초기화, EnvFilter, 매크로, #[instrument], Span, Axum 연동
---

# tracing 구조화 로깅 가이드

> 소스: https://docs.rs/tracing/latest/tracing/ | https://docs.rs/tracing-subscriber/latest/tracing_subscriber/
> 검증일: 2026-04-06

> 주의: tracing 0.1.x / tracing-subscriber 0.3.x 기준. tracing 0.2는 미출시 상태이며, 향후 API 변경 가능성이 있으므로 실제 프로젝트의 Cargo.lock 버전을 확인할 것.

---

## Cargo.toml 의존성

```toml
[dependencies]
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter", "json"] }
```

주요 feature flag (tracing-subscriber):

| Feature | 설명 |
|---------|------|
| `env-filter` | `EnvFilter` (RUST_LOG 환경변수 파싱) |
| `json` | JSON 형식 로그 출력 (`fmt::format::Json`) |
| `fmt` | 포맷팅 레이어 (기본 활성화) |
| `registry` | `Registry` subscriber (기본 활성화) |

---

## 초기화 패턴

### 간단한 초기화

```rust
use tracing_subscriber::EnvFilter;

tracing_subscriber::fmt()
    .with_env_filter(EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info")))
    .init();
```

### Registry 기반 레이어 조합 (권장)

`tracing_subscriber::registry()`는 여러 `Layer`를 `.with()`로 조합할 수 있는 `Subscriber` 구현체다.

```rust
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

tracing_subscriber::registry()
    .with(EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info,my_crate=debug")))
    .with(tracing_subscriber::fmt::layer())
    .init();
```

- `SubscriberExt` 트레이트: `registry()`에 `.with()` 메서드 제공
- `SubscriberInitExt` 트레이트: `.init()` / `.try_init()` 메서드 제공
- `.init()`은 글로벌 subscriber를 설정하며, 프로세스당 1회만 호출 가능

### JSON 로그 출력

```rust
tracing_subscriber::registry()
    .with(EnvFilter::new("info"))
    .with(tracing_subscriber::fmt::layer().json())
    .init();
```

---

## EnvFilter (RUST_LOG 환경변수)

`EnvFilter`는 `RUST_LOG` 환경변수를 파싱하여 로그 레벨을 제어한다.

```bash
# 전역 info, 특정 크레이트만 debug
RUST_LOG=info,my_crate=debug cargo run

# 특정 모듈의 특정 타깃
RUST_LOG=my_crate::api=trace cargo run

# 스팬 필드 기반 필터링
RUST_LOG="info,[my_span]=debug" cargo run
```

디렉티브 문법:

| 패턴 | 의미 |
|------|------|
| `info` | 전역 INFO 이상 |
| `my_crate=debug` | `my_crate` 크레이트만 DEBUG 이상 |
| `my_crate::module=trace` | 특정 모듈만 TRACE 이상 |
| `tower_http=debug` | tower-http 내부 로그 활성화 |

코드에서 직접 설정:

```rust
// 기본값 fallback 패턴
let filter = EnvFilter::try_from_default_env()
    .unwrap_or_else(|_| EnvFilter::new("info,tower_http=debug"));
```

---

## 이벤트 매크로 (info!, warn!, error!, debug!, trace!)

### 기본 사용법

```rust
use tracing::{info, warn, error, debug, trace};

info!("서버 시작");
warn!("설정 파일 없음, 기본값 사용");
error!("데이터베이스 연결 실패");
```

### 구조화 필드

매크로의 첫 번째 인자들로 `key = value` 형태의 구조화 필드를 전달한다. 메시지 문자열은 마지막에 위치한다.

```rust
// key = value 형태
info!(port = 3000, host = "0.0.0.0", "서버 시작");

// 변수명과 필드명이 같으면 축약 가능
let port = 3000;
info!(port, "서버 시작");  // port = 3000

// % 접두사: Display 트레이트로 기록
// ? 접두사: Debug 트레이트로 기록
info!(user = %user_id, details = ?request, "요청 수신");

// 빈 필드 (나중에 스팬에서 채울 때)
info!(result = tracing::field::Empty, "처리 시작");
```

### 메시지 포맷팅

```rust
let user = "alice";
info!("사용자 {} 로그인", user);           // 포맷 문자열
info!(user, "로그인 처리 완료");            // 구조화 필드 + 메시지
info!(user, action = "login", "완료");     // 복수 필드 + 메시지
```

---

## #[instrument] 매크로

함수 진입/종료 시 자동으로 스팬을 생성한다. `tracing` 크레이트에 포함되어 있다.

### 기본 사용법

```rust
use tracing::instrument;

#[instrument]
async fn handle_request(user_id: u64, action: String) {
    // 자동으로 span 생성: handle_request{user_id=123, action="create"}
    info!("요청 처리 중");
}
```

함수의 모든 인자가 기본적으로 스팬 필드로 기록된다.

### skip 옵션

민감한 정보나 Display/Debug를 구현하지 않은 인자를 제외한다.

```rust
#[instrument(skip(db, password))]
async fn create_user(
    db: &DatabasePool,
    username: String,
    password: String,
) -> Result<User, Error> {
    // span: create_user{username="alice"}
    // db, password는 기록되지 않음
    todo!()
}
```

`skip_all`: 모든 인자를 제외한다.

```rust
#[instrument(skip_all)]
async fn internal_process(data: LargeStruct) {
    todo!()
}
```

### fields 옵션

추가 필드를 정의하거나 인자 필드를 재정의한다.

```rust
#[instrument(skip(req), fields(method = %req.method(), uri = %req.uri()))]
async fn handle(req: Request) -> Response {
    // span: handle{method=GET, uri=/api/users}
    todo!()
}
```

`Empty` 필드를 선언하고 함수 내에서 나중에 채울 수 있다:

```rust
#[instrument(fields(result))]
async fn compute(input: u64) -> u64 {
    let output = input * 2;
    tracing::Span::current().record("result", output);
    output
}
```

### 기타 옵션

```rust
#[instrument(
    name = "custom_span_name",  // 스팬 이름 지정 (기본: 함수명)
    level = "debug",            // 스팬 레벨 (기본: INFO)
    target = "my_crate::api",   // 로그 타깃 지정
    err,                        // Result::Err 시 자동으로 error 이벤트 기록
    ret,                        // 반환값을 자동 기록
)]
async fn my_function() -> Result<String, Error> {
    todo!()
}
```

- `err`: 함수가 `Result`를 반환할 때, `Err` 케이스를 ERROR 레벨로 기록
- `err(level = "warn")`: err 기록 레벨 변경
- `ret`: 반환값을 DEBUG 레벨로 기록
- `ret(level = "info")`: ret 기록 레벨 변경

---

## Span (스팬) 개념과 사용법

스팬은 작업의 시작과 끝을 나타내는 구간이다. 이벤트(`info!` 등)는 특정 시점의 기록이고, 스팬은 기간(duration)을 나타낸다. 스팬은 중첩되어 트리 구조를 형성한다.

### 스팬 생성 매크로

```rust
use tracing::{info_span, debug_span, warn_span, span, Level};

let span = info_span!("request", method = "GET", path = "/api");
let span = debug_span!("db_query", table = "users");
let span = span!(Level::INFO, "custom_span", key = "value");
```

### 스팬 진입

```rust
// 방법 1: .enter() - 동기 코드 전용. Drop 시 자동 종료.
let span = info_span!("sync_work");
let _guard = span.enter();  // _guard가 drop될 때까지 이 스팬 안
do_sync_work();
// _guard drop -> 스팬 종료

// 방법 2: .in_scope() - 클로저 범위 동안 스팬 활성화
let result = info_span!("compute").in_scope(|| {
    expensive_computation()
});
```

> 주의: `.enter()`는 async 함수 내에서 사용하면 안 된다. `.enter()`가 반환하는 드롭 가드는 스코프를 벗어날 때 드롭되어야 스팬이 종료되는데, async에서 `.await`를 만나면 스코프를 양보하면서도 드롭 가드가 드롭되지 않는다. 결과적으로 스팬이 종료되지 않은 상태로 다른 태스크가 실행된다. 멀티스레드 런타임에서는 재개 시 다른 스레드에서 실행되는 추가 문제도 있다. async 코드에서는 `#[instrument]` 또는 `.instrument()` 메서드를 사용한다.

### async 코드에서 스팬

```rust
use tracing::Instrument;

async fn parent_task() {
    let span = info_span!("child_task", task_id = 42);

    // .instrument()로 Future에 스팬을 부착
    some_async_work()
        .instrument(span)
        .await;
}
```

### 스팬 필드 나중에 기록

```rust
let span = info_span!("process", result = tracing::field::Empty);
let _guard = span.enter();

let value = compute();
span.record("result", value);
```

---

## Axum TraceLayer 연동

`tower-http`의 `TraceLayer`를 사용하여 Axum 요청/응답을 자동 추적한다.

```toml
[dependencies]
axum = "0.8"
tower-http = { version = "0.6", features = ["trace"] }
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
```

### 기본 설정

```rust
use axum::{routing::get, Router};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| EnvFilter::new("info,tower_http=debug")))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let app = Router::new()
        .route("/", get(root))
        .layer(TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::info!("서버 시작: 0.0.0.0:3000");
    axum::serve(listener, app).await.unwrap();
}

async fn root() -> &'static str {
    tracing::info!("루트 핸들러 호출");
    "Hello, World!"
}
```

### TraceLayer 커스터마이징

```rust
use tower_http::trace::{TraceLayer, DefaultMakeSpan, DefaultOnResponse};
use tracing::Level;

let trace_layer = TraceLayer::new_for_http()
    .make_span_with(DefaultMakeSpan::new().level(Level::INFO))
    .on_response(DefaultOnResponse::new().level(Level::INFO));

// 주의: axum::serve() 없이 단독 사용 시 Router 타입 추론 실패 가능. 타입 명시 권장.
let app: Router = Router::new()
    .route("/", get(root))
    .layer(trace_layer);
```

### 핸들러에서 #[instrument] 사용

```rust
use axum::extract::Path;
use tracing::instrument;

#[instrument(skip_all, fields(user_id))]
async fn get_user(Path(user_id): Path<u64>) -> String {
    tracing::Span::current().record("user_id", user_id);
    tracing::info!("사용자 조회");
    format!("User {}", user_id)
}
```

---

## 실전 초기화 템플릿

```rust
use tracing_subscriber::{
    layer::SubscriberExt,
    util::SubscriberInitExt,
    EnvFilter,
};

pub fn init_tracing() {
    let env_filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| {
        EnvFilter::new(
            "info,my_app=debug,tower_http=debug,sqlx=warn"
        )
    });

    tracing_subscriber::registry()
        .with(env_filter)
        .with(tracing_subscriber::fmt::layer()
            .with_target(true)      // 로그 타깃 표시
            .with_thread_ids(false) // 스레드 ID 숨김
            .with_file(true)        // 파일명 표시
            .with_line_number(true) // 라인 번호 표시
        )
        .init();
}
```
