---
name: sqlx
description: Rust sqlx 비동기 SQL 툴킷 - Pool 연결, query 매크로, 트랜잭션, 마이그레이션, Axum 연동, 에러 처리
---

# sqlx 비동기 SQL 툴킷 핵심 패턴

> 소스: https://docs.rs/sqlx/latest/sqlx/ | https://github.com/launchbadge/sqlx
> 검증일: 2026-06-20

> 주의: 이 문서는 sqlx 0.8.x 기준으로 작성되었습니다. 0.9.0이 2026-05-21 릴리즈되어 있으며 Breaking Change가 다수 있으므로 공식 CHANGELOG를 반드시 확인하세요. 신규 프로젝트는 0.9 도입을 검토하되 마이그레이션 노트를 참조하세요.

> **sqlx 0.9로의 마이그레이션 시 주요 Breaking Change (0.8 → 0.9):**
> - `query*()` 계열 함수의 `&str` 파라미터가 `SqlSafeStr` 트레이트로 변경 — 기존 동적 쿼리 문자열 전달 시 `AssertSqlSafe(..)` 래핑 필요
> - `Arguments` 트레이트에서 lifetime 파라미터 제거
> - MySQL: 텍스트 컬럼 타입 추론이 `Vec<u8>` → `String`으로 변경, `SET NAMES` 동작 변경
> - PostgreSQL: `PgConnectOptions::options()`에 전달한 값이 자동 escape됨 — 수동 escape 제거 필요
> - `sqlx.toml` 설정 파일 신규 지원 (선택적)

---

## 프로젝트 설정

```toml
# Cargo.toml
# sqlx 0.8.x (현재 문서 기준) — 0.9가 2026-05-21 릴리즈됨, 마이그레이션 주의사항 참조
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

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
