---
name: project-structure
description: Rust + Axum 백엔드 레이어드 아키텍처 - 4계층 구조, 모듈 시스템, 책임 분리, DI 조립 패턴
---

# Rust + Axum 레이어드 아키텍처

> 소스: https://docs.rs/axum/latest/axum/ | https://doc.rust-lang.org/reference/items/modules.html | https://github.com/tokio-rs/axum/tree/main/examples
> 검증일: 2026-04-06

> 주의: axum 0.8.x 기준입니다. 프로젝트 규모와 팀 컨벤션에 따라 구조를 조정하세요. 아래는 중규모 이상 프로젝트에 적합한 구조입니다.

---

## 4계층 아키텍처 개요

```
요청 → routes → handlers → services → repositories → DB
                    ↕            ↕
                   DTO      Domain Entity
```

| 계층 | 책임 | 의존 방향 |
|------|------|-----------|
| **routes** | URL 경로와 핸들러 매핑, 미들웨어 부착 | handlers |
| **handlers** | HTTP 요청 파싱(추출자), 응답 변환, 에러 매핑 | services |
| **services** | 비즈니스 로직, 트랜잭션 조율, 도메인 규칙 적용 | repositories |
| **repositories** | 데이터 접근(DB 쿼리), SQL 캡슐화 | 없음 (최하위) |

**핵심 원칙:** 상위 계층만 하위 계층을 호출한다. 역방향 의존 금지.

---

## 디렉토리 트리

```
src/
├── main.rs                    # 앱 조립 및 서버 실행
├── lib.rs                     # (선택) 라이브러리 크레이트 루트
├── config.rs                  # 환경변수, 설정 로드
├── error.rs                   # 공통 에러 타입 (AppError)
│
├── routes/
│   ├── mod.rs                 # 라우터 병합, 공통 미들웨어
│   ├── user_routes.rs
│   └── post_routes.rs
│
├── handlers/
│   ├── mod.rs
│   ├── user_handler.rs
│   └── post_handler.rs
│
├── services/
│   ├── mod.rs
│   ├── user_service.rs
│   └── post_service.rs
│
├── repositories/
│   ├── mod.rs
│   ├── user_repository.rs
│   └── post_repository.rs
│
├── models/
│   ├── mod.rs
│   ├── user.rs                # Domain entity
│   └── post.rs
│
└── dto/
    ├── mod.rs
    ├── user_dto.rs            # 요청/응답 DTO
    └── post_dto.rs
```

> 주의: 소규모 프로젝트에서는 routes + handlers를 하나로 합치거나, models + dto를 하나의 모듈로 관리해도 무방합니다.

---

## Rust 모듈 시스템

### mod.rs 방식 vs 파일명 방식

Rust는 두 가지 모듈 선언 방식을 지원합니다.

```
# 방식 1: mod.rs (전통적, 이 스킬에서 사용)
src/handlers/mod.rs          # pub mod user_handler;
src/handlers/user_handler.rs

# 방식 2: 파일명 (Rust 2018+)
src/handlers.rs              # pub mod user_handler;
src/handlers/user_handler.rs
```

> 소스: https://doc.rust-lang.org/reference/items/modules.html#module-source-filenames

두 방식은 기능적으로 동일합니다. 프로젝트 내에서 하나만 일관되게 사용하세요.

### mod.rs 작성 패턴

```rust
// src/handlers/mod.rs
pub mod user_handler;
pub mod post_handler;
```

```rust
// src/main.rs
mod config;
mod error;
mod routes;
mod handlers;
mod services;
mod repositories;
mod models;
mod dto;
```

### pub 가시성 규칙

| 키워드 | 범위 |
|--------|------|
| `pub` | 외부 크레이트 포함 모든 곳 |
| `pub(crate)` | 같은 크레이트 내에서만 |
| `pub(super)` | 부모 모듈까지만 |
| (없음) | 같은 모듈 내에서만 |

**권장:** 계층 간 인터페이스는 `pub`, 내부 구현 함수는 `pub(crate)` 또는 비공개.

---

## 각 계층 구현

### 1. Domain Entity (models)

DB 테이블과 1:1 대응하는 핵심 데이터 구조체.

```rust
// src/models/user.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: i64,
    pub username: String,
    pub email: String,
    pub created_at: chrono::NaiveDateTime,
}
```

### 2. DTO (Data Transfer Object)

HTTP 요청/응답 전용 구조체. Domain entity와 분리하여 API 계약을 독립적으로 관리.

```rust
// src/dto/user_dto.rs
use serde::{Deserialize, Serialize};

/// 생성 요청
#[derive(Debug, Deserialize)]
pub struct CreateUserRequest {
    pub username: String,
    pub email: String,
}

/// 응답
#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: i64,
    pub username: String,
    pub email: String,
}

/// Domain -> DTO 변환
impl From<crate::models::user::User> for UserResponse {
    fn from(user: crate::models::user::User) -> Self {
        Self {
            id: user.id,
            username: user.username,
            email: user.email,
        }
    }
}
```

**Entity vs DTO 분리 이유:**
- Entity: DB 스키마 변경에만 영향받음
- DTO: API 버전별로 다른 필드 노출 가능
- 민감 필드(password_hash 등)가 응답에 노출되는 실수 방지

### 3. Repository 계층

```rust
// src/repositories/user_repository.rs
use sqlx::PgPool;
use crate::models::user::User;

#[derive(Clone)]
pub struct UserRepository {
    pool: PgPool,
}

impl UserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn find_by_id(&self, id: i64) -> Result<Option<User>, sqlx::Error> {
        sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn create(&self, username: &str, email: &str) -> Result<User, sqlx::Error> {
        sqlx::query_as::<_, User>(
            "INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *"
        )
        .bind(username)
        .bind(email)
        .fetch_one(&self.pool)
        .await
    }
}
```

**Repository 원칙:**
- SQL/DB 로직만 포함, 비즈니스 판단 금지
- 반환 타입은 Domain Entity
- DB 에러는 그대로 상위로 전파 (`sqlx::Error`)

### 4. Service 계층

```rust
// src/services/user_service.rs
use crate::repositories::user_repository::UserRepository;
use crate::models::user::User;
use crate::error::AppError;

#[derive(Clone)]
pub struct UserService {
    user_repo: UserRepository,
}

impl UserService {
    pub fn new(user_repo: UserRepository) -> Self {
        Self { user_repo }
    }

    pub async fn get_user(&self, id: i64) -> Result<User, AppError> {
        self.user_repo
            .find_by_id(id)
            .await?
            .ok_or(AppError::NotFound(format!("User {id} not found")))
    }

    pub async fn create_user(
        &self,
        username: String,
        email: String,
    ) -> Result<User, AppError> {
        // 비즈니스 규칙 검증
        if username.len() < 3 {
            return Err(AppError::BadRequest(
                "Username must be at least 3 characters".into(),
            ));
        }
        self.user_repo.create(&username, &email).await.map_err(Into::into)
    }
}
```

**Service 원칙:**
- 비즈니스 로직, 유효성 검증, 트랜잭션 조율 담당
- HTTP 개념(StatusCode, Header 등) 사용 금지
- Repository를 조합하여 복합 로직 구현

### 5. Handler 계층

```rust
// src/handlers/user_handler.rs
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use crate::dto::user_dto::{CreateUserRequest, UserResponse};
use crate::error::AppError;
use crate::services::user_service::UserService;

pub async fn get_user(
    State(service): State<UserService>,
    Path(id): Path<i64>,
) -> Result<Json<UserResponse>, AppError> {
    let user = service.get_user(id).await?;
    Ok(Json(UserResponse::from(user)))
}

pub async fn create_user(
    State(service): State<UserService>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<UserResponse>), AppError> {
    let user = service.create_user(payload.username, payload.email).await?;
    Ok((StatusCode::CREATED, Json(UserResponse::from(user))))
}
```

**Handler 원칙:**
- 추출자로 요청 파싱, DTO로 응답 변환
- 비즈니스 로직은 Service에 위임
- `Result<T, AppError>` 패턴으로 에러 처리 통일

### 6. Routes 계층

```rust
// src/routes/user_routes.rs
use axum::{routing::{get, post}, Router};
use crate::handlers::user_handler;
use crate::services::user_service::UserService;

pub fn router() -> Router<UserService> {
    Router::new()
        .route("/users", post(user_handler::create_user))
        .route("/users/{id}", get(user_handler::get_user))
}
```

```rust
// src/routes/mod.rs
pub mod user_routes;
pub mod post_routes;

use axum::Router;
use crate::services::user_service::UserService;

pub fn create_router() -> Router<UserService> {
    Router::new()
        .nest("/api/v1", user_routes::router())
}
```

---

## 공통 에러 타입

```rust
// src/error.rs
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde_json::json;

#[derive(Debug)]
pub enum AppError {
    NotFound(String),
    BadRequest(String),
    Internal(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            AppError::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
        };
        (status, Json(json!({ "error": message }))).into_response()
    }
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        AppError::Internal(err.to_string())
    }
}
```

---

## main.rs - 전체 조립

```rust
// src/main.rs
mod config;
mod dto;
mod error;
mod handlers;
mod models;
mod repositories;
mod routes;
mod services;

use repositories::user_repository::UserRepository;
use services::user_service::UserService;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    // 1. 설정 로드
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt::init();

    // 2. 인프라 초기화
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    let pool = sqlx::PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to database");

    // 3. Repository 생성
    let user_repo = UserRepository::new(pool.clone());

    // 4. Service 생성 (Repository 주입)
    let user_service = UserService::new(user_repo);

    // 5. Router 조립 (Service를 State로 주입)
    let app = routes::create_router()
        .with_state(user_service);

    // 6. 서버 실행
    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::info!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}
```

**조립 순서:** 설정 -> 인프라(DB) -> Repository -> Service -> Router -> 서버

---

## 복수 서비스 State 패턴

서비스가 여러 개일 때는 AppState 구조체로 묶습니다.

```rust
#[derive(Clone)]
pub struct AppState {
    pub user_service: UserService,
    pub post_service: PostService,
}

// Handler에서 사용
pub async fn get_user(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<UserResponse>, AppError> {
    let user = state.user_service.get_user(id).await?;
    Ok(Json(UserResponse::from(user)))
}

// main.rs
let state = AppState {
    user_service: UserService::new(user_repo),
    post_service: PostService::new(post_repo),
};

let app = routes::create_router().with_state(state);
```

---

## Trait 기반 DI (테스트 용이성)

> 주의: 소규모 프로젝트에서는 구체 타입 직접 주입으로 충분합니다. Trait 추상화는 단위 테스트에서 Mock이 필요할 때 도입하세요.

```rust
// Repository trait 정의
#[async_trait::async_trait]
pub trait UserRepo: Send + Sync + Clone {
    async fn find_by_id(&self, id: i64) -> Result<Option<User>, sqlx::Error>;
}

// Service에서 제네릭으로 수용
#[derive(Clone)]
pub struct UserService<R: UserRepo> {
    repo: R,
}

impl<R: UserRepo> UserService<R> {
    pub fn new(repo: R) -> Self {
        Self { repo }
    }
}
```

---

## 계층별 금지 사항 요약

| 계층 | 금지 사항 |
|------|-----------|
| routes | 비즈니스 로직, DB 접근 |
| handlers | SQL, 직접 DB 호출, 복잡한 비즈니스 판단 |
| services | HTTP 개념(StatusCode, Header), SQL 직접 작성 |
| repositories | 비즈니스 규칙, HTTP 개념, 다른 Repository 직접 호출 |
