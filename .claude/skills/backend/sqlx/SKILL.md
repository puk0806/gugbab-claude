---
name: sqlx
description: Rust sqlx 비동기 SQL 툴킷 - Pool 연결, query 매크로, 트랜잭션, 마이그레이션, Axum 연동, 에러 처리
---

# sqlx 비동기 SQL 툴킷 핵심 패턴

> 소스: https://docs.rs/sqlx/latest/sqlx/ | https://github.com/launchbadge/sqlx
> 검증일: 2026-04-07

> 주의: 이 문서는 sqlx 0.8.x 기준으로 작성되었습니다. 0.7에서 0.8로의 마이그레이션 시 Breaking Change가 있으므로 공식 CHANGELOG를 반드시 확인하세요.

---

## 프로젝트 설정

```toml
# Cargo.toml
[dependencies]
sqlx = { version = "0.8", features = ["runtime-tokio", "tls-rustls", "postgres", "chrono", "uuid", "migrate"] }
tokio = { version = "1", features = ["full"] }
dotenvy = "0.15"
anyhow = "1"
thiserror = "2"
```

**feature 선택 기준:**

| feature | 설명 |
|---------|------|
| `runtime-tokio` | tokio 런타임 사용 (필수 선택: `runtime-tokio` 또는 `runtime-async-std`) |
| `tls-rustls` | TLS 연결 (대안: `tls-native-tls`) |
| `postgres` / `mysql` / `sqlite` | 데이터베이스 드라이버 (복수 선택 가능) |
| `chrono` | `chrono::NaiveDateTime` 등 타입 지원 |
| `uuid` | `uuid::Uuid` 타입 지원 |
| `migrate` | 마이그레이션 매크로 `migrate!()` 사용 |

> 주의: `runtime-*`과 `tls-*` feature는 각각 정확히 하나만 선택해야 합니다. sqlx 0.8부터 복수 선택 시 컴파일 에러 대신 런타임 패닉이 발생합니다. tls feature를 복수 선택하면 `tls-native-tls`가 우선 적용됩니다.

---

## DATABASE_URL 환경변수 설정

```bash
# .env 파일
DATABASE_URL=postgres://user:password@localhost:5432/mydb
```

```rust
// main.rs에서 .env 로드
dotenvy::dotenv().ok();
let database_url = std::env::var("DATABASE_URL")
    .expect("DATABASE_URL must be set");
```

**연결 문자열 형식:**

| DB | 형식 |
|----|------|
| PostgreSQL | `postgres://user:pass@host:5432/dbname` |
| MySQL | `mysql://user:pass@host:3306/dbname` |
| SQLite | `sqlite://path/to/db.sqlite` 또는 `sqlite::memory:` |

---

## Pool 연결 설정

### PgPool (PostgreSQL)

```rust
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;

let pool = PgPoolOptions::new()
    .max_connections(5)
    .acquire_timeout(std::time::Duration::from_secs(3))
    .connect(&database_url)
    .await
    .expect("Failed to create pool");
```

### MySqlPool / SqlitePool

```rust
use sqlx::mysql::MySqlPoolOptions;
use sqlx::sqlite::SqlitePoolOptions;

// MySQL
let mysql_pool = MySqlPoolOptions::new()
    .max_connections(5)
    .connect(&database_url)
    .await?;

// SQLite
let sqlite_pool = SqlitePoolOptions::new()
    .max_connections(5)
    .connect("sqlite://data.db")
    .await?;
```

### 범용 Pool::connect

```rust
// feature에 따라 자동으로 적절한 드라이버 선택
let pool = sqlx::Pool::<sqlx::Postgres>::connect(&database_url).await?;
```

**Pool 주요 옵션:**

| 메서드 | 기본값 | 설명 |
|--------|--------|------|
| `max_connections()` | 10 | 최대 연결 수 |
| `min_connections()` | 0 | 최소 유지 연결 수 |
| `acquire_timeout()` | 30초 | 연결 획득 타임아웃 |
| `idle_timeout()` | 10분 | 유휴 연결 제거 시간 |
| `max_lifetime()` | 30분 | 연결 최대 수명 |

---

## query! 매크로 (컴파일 타임 검증)

`query!` 매크로는 **컴파일 타임**에 SQL 문법과 타입을 검증한다. `DATABASE_URL` 환경변수가 설정되어 있어야 한다.

### 기본 쿼리

```rust
// SELECT - 익명 레코드 반환
let rows = sqlx::query!("SELECT id, name, email FROM users WHERE active = $1", true)
    .fetch_all(&pool)
    .await?;

for row in rows {
    println!("id: {}, name: {}", row.id, row.name);
}
```

### query_as! 매크로 (구조체 매핑)

```rust
#[derive(Debug)]
struct User {
    id: i64,
    name: String,
    email: String,
}

let user = sqlx::query_as!(
    User,
    "SELECT id, name, email FROM users WHERE id = $1",
    user_id
)
.fetch_one(&pool)
.await?;
```

### INSERT / UPDATE / DELETE

```rust
// INSERT - returning
let user = sqlx::query_as!(
    User,
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email",
    name,
    email
)
.fetch_one(&pool)
.await?;

// UPDATE
let result = sqlx::query!(
    "UPDATE users SET name = $1 WHERE id = $2",
    new_name,
    user_id
)
.execute(&pool)
.await?;

println!("rows affected: {}", result.rows_affected());

// DELETE
sqlx::query!("DELETE FROM users WHERE id = $1", user_id)
    .execute(&pool)
    .await?;
```

### fetch 메서드 선택

| 메서드 | 반환 | 용도 |
|--------|------|------|
| `fetch_one()` | 단일 행 (없으면 에러) | 반드시 1행 존재할 때 |
| `fetch_optional()` | `Option<Row>` | 0 또는 1행 |
| `fetch_all()` | `Vec<Row>` | 모든 행을 메모리에 |
| `fetch()` | `Stream<Row>` | 대량 데이터 스트리밍 |
| `execute()` | `PgQueryResult` | INSERT/UPDATE/DELETE |

### 런타임 쿼리 (query 함수, 매크로 아님)

컴파일 타임 검증 없이 동적 SQL을 실행할 때:

```rust
use sqlx::{Row, FromRow};

// query() 함수 - 매크로가 아닌 런타임 버전
let row = sqlx::query("SELECT id, name FROM users WHERE id = $1")
    .bind(user_id)
    .fetch_one(&pool)
    .await?;

let name: String = row.get("name");

// query_as() 함수 - FromRow derive 필요
#[derive(Debug, FromRow)]
struct User {
    id: i64,
    name: String,
}

let user = sqlx::query_as::<_, User>("SELECT id, name FROM users WHERE id = $1")
    .bind(user_id)
    .fetch_one(&pool)
    .await?;
```

> 주의: `query!` 매크로는 컴파일 시 DB 연결이 필요합니다. CI 환경에서는 `sqlx prepare`로 오프라인 모드를 사용하세요.

---

## 오프라인 모드 (sqlx prepare)

CI/CD 환경에서 DB 연결 없이 컴파일하려면:

```bash
# 개발 환경에서 쿼리 메타데이터 저장
cargo sqlx prepare

# .sqlx/ 디렉토리가 생성됨 -> git에 커밋
# CI에서는 SQLX_OFFLINE=true 환경변수 설정
```

```toml
# Cargo.toml - offline feature 추가 불필요 (0.8부터 기본 지원)
```

```bash
# CI 환경변수
SQLX_OFFLINE=true cargo build
```

---

## 트랜잭션 처리

### 기본 트랜잭션

```rust
let mut tx = pool.begin().await?;

sqlx::query!("INSERT INTO users (name, email) VALUES ($1, $2)", name, email)
    .execute(&mut *tx)
    .await?;

// 주의: lastval()은 현재 세션의 마지막 시퀀스 값을 반환한다.
// 동일 세션에서 다른 시퀀스가 먼저 사용되면 잘못된 ID를 반환할 수 있다.
// RETURNING id로 명시적으로 받아서 전달하는 방식이 더 안전하다.
sqlx::query!("INSERT INTO profiles (user_id, bio) VALUES (lastval(), $1)", bio)
    .execute(&mut *tx)
    .await?;

tx.commit().await?;
```

**핵심 규칙:**
- `tx.commit().await?` 호출하지 않으면 `Transaction` drop 시 **자동 rollback**
- 트랜잭션 내에서 `&mut *tx`로 역참조하여 executor로 전달

### 명시적 rollback

```rust
let mut tx = pool.begin().await?;

match do_something(&mut tx).await {
    Ok(_) => tx.commit().await?,
    Err(e) => {
        tx.rollback().await?;
        return Err(e);
    }
}
```

### 함수로 트랜잭션 전달

```rust
use sqlx::{PgPool, Transaction, Postgres};

async fn create_user_with_profile(
    tx: &mut Transaction<'_, Postgres>,
    name: &str,
    bio: &str,
) -> Result<i64, sqlx::Error> {
    let user = sqlx::query_scalar!(
        "INSERT INTO users (name) VALUES ($1) RETURNING id",
        name
    )
    .fetch_one(&mut **tx)
    .await?;

    sqlx::query!(
        "INSERT INTO profiles (user_id, bio) VALUES ($1, $2)",
        user,
        bio
    )
    .execute(&mut **tx)
    .await?;

    Ok(user)
}

// 호출부
let mut tx = pool.begin().await?;
let user_id = create_user_with_profile(&mut tx, "Alice", "Hello").await?;
tx.commit().await?;
```

---

## 마이그레이션 (sqlx migrate)

### sqlx-cli 설치

```bash
# 전체 DB 드라이버 포함
cargo install sqlx-cli

# PostgreSQL만
cargo install sqlx-cli --no-default-features --features rustls,postgres
```

### 마이그레이션 워크플로우

```bash
# 1. 마이그레이션 디렉토리 생성
sqlx database create          # DATABASE_URL 기반으로 DB 생성

# 2. 마이그레이션 파일 생성
sqlx migrate add create_users
# -> migrations/20240101000000_create_users.sql 생성됨

# 3. SQL 작성
# migrations/20240101000000_create_users.sql
```

```sql
-- migrations/20240101000000_create_users.sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

```bash
# 4. 마이그레이션 실행
sqlx migrate run

# 5. 되돌리기 (reversible 마이그레이션인 경우)
sqlx migrate revert
```

### Reversible 마이그레이션

```bash
# reversible 마이그레이션 생성 (-r 플래그)
sqlx migrate add -r create_users
# -> migrations/20240101000000_create_users.up.sql
# -> migrations/20240101000000_create_users.down.sql
```

### 코드 내 마이그레이션 실행

```rust
// 앱 시작 시 자동 마이그레이션 (개발 환경 권장)
sqlx::migrate!("./migrations")
    .run(&pool)
    .await?;
```

> 주의: `migrate!()` 매크로 사용 시 `migrate` feature가 활성화되어 있어야 합니다. 프로덕션 환경에서는 CLI로 마이그레이션을 실행하는 것이 안전합니다.

---

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
