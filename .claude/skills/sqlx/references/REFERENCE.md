## Axum과 AppState로 Pool 공유

### AppState 패턴

```rust
use axum::{
    extract::State,
    routing::{get, post},
    Json, Router,
};
use sqlx::PgPool;
use tokio::net::TcpListener;

#[derive(Clone)]
struct AppState {
    db: PgPool,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = sqlx::PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to database");

    // 마이그레이션 실행 (개발 환경)
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    let state = AppState { db: pool };

    let app = Router::new()
        .route("/users", get(list_users).post(create_user))
        .route("/users/{id}", get(get_user))
        .with_state(state);

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

### 핸들러에서 Pool 사용

```rust
use axum::extract::Path;

async fn list_users(
    State(state): State<AppState>,
) -> Result<Json<Vec<User>>, AppError> {
    let users = sqlx::query_as!(User, "SELECT id, name, email FROM users")
        .fetch_all(&state.db)
        .await?;

    Ok(Json(users))
}

async fn get_user(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<User>, AppError> {
    let user = sqlx::query_as!(
        User,
        "SELECT id, name, email FROM users WHERE id = $1",
        id
    )
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::NotFound(format!("user {id}")))?;

    Ok(Json(user))
}

async fn create_user(
    State(state): State<AppState>,
    Json(input): Json<CreateUserInput>,
) -> Result<(StatusCode, Json<User>), AppError> {
    let user = sqlx::query_as!(
        User,
        "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email",
        input.name,
        input.email
    )
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(user)))
}
```

> 주의: `PgPool`은 내부적으로 `Arc`로 감싸져 있으므로 `Clone`이 저렴합니다. `Arc<PgPool>`로 이중 래핑할 필요가 없습니다.

---

## 에러 처리 (sqlx::Error + thiserror 연동)

### sqlx::Error 주요 variant

| variant | 발생 상황 |
|---------|-----------|
| `RowNotFound` | `fetch_one()`에서 행이 없을 때 |
| `Database(DatabaseError)` | DB 레벨 에러 (제약 조건 위반 등) |
| `PoolTimedOut` | 커넥션 풀 타임아웃 |
| `Configuration(...)` | 연결 문자열 파싱 실패 |
| `ColumnNotFound(...)` | 존재하지 않는 컬럼 접근 |

### thiserror 연동 패턴

```rust
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("not found: {0}")]
    NotFound(String),

    #[error("conflict: {0}")]
    Conflict(String),

    #[error("validation error: {0}")]
    Validation(String),

    #[error("database error")]
    Database(#[from] sqlx::Error),

    #[error(transparent)]
    Unexpected(#[from] anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match &self {
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            AppError::Conflict(msg) => (StatusCode::CONFLICT, msg.clone()),
            AppError::Validation(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::Database(e) => {
                // DB 에러 상세 내용은 로그에만 기록
                tracing::error!("Database error: {:?}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "database error".to_string(),
                )
            }
            AppError::Unexpected(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "internal server error".to_string(),
            ),
        };

        let body = json!({
            "error": {
                "status": status.as_u16(),
                "message": message,
            }
        });

        (status, Json(body)).into_response()
    }
}
```

### DB 제약 조건 에러 분기

```rust
use sqlx::error::DatabaseError;

impl AppError {
    /// sqlx::Error에서 unique violation을 감지하여 Conflict로 변환
    pub fn from_db_error(err: sqlx::Error, resource: &str) -> Self {
        match &err {
            sqlx::Error::Database(db_err) => {
                // PostgreSQL unique_violation 코드: 23505
                if db_err.code().as_deref() == Some("23505") {
                    return AppError::Conflict(format!("{resource} already exists"));
                }
                AppError::Database(err)
            }
            _ => AppError::Database(err),
        }
    }
}

// 사용 예시
async fn create_user(
    State(state): State<AppState>,
    Json(input): Json<CreateUserInput>,
) -> Result<Json<User>, AppError> {
    let user = sqlx::query_as!(
        User,
        "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email",
        input.name,
        input.email
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| AppError::from_db_error(e, "user"))?;

    Ok(Json(user))
}
```

---

## Repository 패턴과 함께 사용

```rust
pub struct UserRepository {
    pool: PgPool,
}

impl UserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn find_by_id(&self, id: i64) -> Result<Option<User>, sqlx::Error> {
        sqlx::query_as!(
            User,
            "SELECT id, name, email FROM users WHERE id = $1",
            id
        )
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn create(&self, name: &str, email: &str) -> Result<User, sqlx::Error> {
        sqlx::query_as!(
            User,
            "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email",
            name,
            email
        )
        .fetch_one(&self.pool)
        .await
    }

    /// 트랜잭션을 외부에서 주입받는 패턴
    pub async fn create_in_tx(
        tx: &mut Transaction<'_, Postgres>,
        name: &str,
        email: &str,
    ) -> Result<User, sqlx::Error> {
        sqlx::query_as!(
            User,
            "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email",
            name,
            email
        )
        .fetch_one(&mut **tx)
        .await
    }
}
```

---

## 자주 하는 실수

| 실수 | 올바른 방법 |
|------|-------------|
| `Arc<PgPool>` 이중 래핑 | `PgPool`은 이미 내부에 `Arc` 포함. 그대로 `Clone` |
| `fetch_one()` 남용 | 행이 없을 수 있으면 `fetch_optional()` 사용 |
| 트랜잭션에서 `&tx` 전달 | `&mut *tx` (또는 함수 인자로 받을 때 `&mut **tx`) |
| `query!` 매크로에서 `?` placeholder | PostgreSQL은 `$1`, MySQL은 `?` |
| CI에서 `query!` 컴파일 실패 | `cargo sqlx prepare` 후 `.sqlx/` 커밋, `SQLX_OFFLINE=true` 설정 |
