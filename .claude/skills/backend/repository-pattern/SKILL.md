---
name: repository-pattern
description: Rust Repository 패턴 — async trait 기반 DB 추상화, Service-Repository 의존성 역전, In-Memory Mock, 에러 변환, Hexagonal Architecture
---

# Rust Repository 패턴 (DB 추상화 레이어)

> 소스: https://doc.rust-lang.org/reference/items/traits.html | https://doc.rust-lang.org/std/error/trait.Error.html | https://docs.rs/thiserror/latest/thiserror/ | https://docs.rs/tokio/latest/tokio/
> 검증일: 2026-04-06

> 주의: 이 문서는 아키텍처 패턴 가이드이며, 특정 크레이트의 API 문서가 아닙니다. Rust 1.75+ 네이티브 async fn in trait, thiserror 2.x 기준으로 작성되었습니다.

---

## Hexagonal Architecture에서의 위치

```
                  ┌─────────────────────────────────┐
  Inbound         │         Application Core         │         Outbound
  Adapters        │                                   │         Adapters
                  │  ┌───────────┐   ┌────────────┐  │
  ┌──────────┐    │  │  Service  │──▶│ Repository │  │    ┌──────────────┐
  │  Axum    │───▶│  │  (impl)   │   │  (trait)   │◀─│────│ PostgresRepo │
  │  Handler │    │  └───────────┘   └────────────┘  │    └──────────────┘
  └──────────┘    │                                   │    ┌──────────────┐
                  │  ┌───────────┐   ┌────────────┐  │    │ InMemoryRepo │
                  │  │  Domain   │   │   Domain   │  │    │   (테스트용)   │
                  │  │  Entity   │   │   Error    │  │    └──────────────┘
                  │  └───────────┘   └────────────┘  │
                  └─────────────────────────────────┘
```

**핵심 원칙:**
- Repository trait은 **도메인 계층(Core)**에 속한다
- 구체적 DB 구현(PostgresRepo)은 **Outbound Adapter**에 속한다
- Service는 Repository **trait에만 의존**한다 (의존성 역전)
- Domain Entity와 DB Row는 **별도 타입**으로 분리한다

---

## 프로젝트 구조

```
src/
├── domain/
│   ├── mod.rs
│   ├── entity.rs          # Domain Entity (비즈니스 객체)
│   └── error.rs           # Domain Error (thiserror)
├── port/
│   ├── mod.rs
│   └── repository.rs      # Repository trait 정의
├── service/
│   ├── mod.rs
│   └── user_service.rs    # Service 구현 (trait에만 의존)
├── adapter/
│   ├── mod.rs
│   ├── postgres_repo.rs   # PostgreSQL 구현
│   └── db_model.rs        # DB Row 구조체
└── main.rs
```

---

## Domain Entity 정의

도메인 엔티티는 DB 스키마와 무관한 순수 비즈니스 객체다.

```rust
// domain/entity.rs

#[derive(Debug, Clone)]
pub struct User {
    pub id: UserId,
    pub email: String,
    pub name: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct UserId(pub i64);

#[derive(Debug, Clone)]
pub struct CreateUser {
    pub email: String,
    pub name: String,
}
```

**규칙:**
- `Serialize`/`Deserialize`는 도메인 엔티티에 붙이지 않는다 (필요하면 DTO로 분리)
- DB 컬럼과 1:1 매핑하지 않는다 (DB 스키마 변경이 도메인에 전파되지 않도록)
- 불변식(invariant)은 엔티티 메서드로 보장한다

---

## Domain Error 정의 (thiserror)

```rust
// domain/error.rs

use thiserror::Error;

#[derive(Debug, Error)]
pub enum DomainError {
    #[error("not found: {resource} with id {id}")]
    NotFound {
        resource: &'static str,
        id: String,
    },

    #[error("already exists: {resource} with {field} = {value}")]
    Conflict {
        resource: &'static str,
        field: &'static str,
        value: String,
    },

    #[error("validation error: {0}")]
    Validation(String),

    #[error("infrastructure error: {0}")]
    Infrastructure(String),
}

impl DomainError {
    pub fn not_found(resource: &'static str, id: impl Into<String>) -> Self {
        Self::NotFound { resource, id: id.into() }
    }

    pub fn conflict(resource: &'static str, field: &'static str, value: impl Into<String>) -> Self {
        Self::Conflict { resource, field, value: value.into() }
    }
}
```

**핵심:** DomainError는 `sqlx::Error`, `redis::RedisError` 등 인프라 에러에 대한 `#[from]`을 직접 갖지 않는다. 인프라 에러는 Adapter 계층에서 DomainError로 **명시적으로 변환**한다.

---

## Repository Trait 설계

Rust 1.75+에서는 별도 크레이트 없이 trait에 `async fn`을 직접 정의할 수 있다.

```rust
// port/repository.rs

use crate::domain::entity::{CreateUser, User, UserId};
use crate::domain::error::DomainError;

pub trait UserRepository: Send + Sync {
    async fn find_by_id(&self, id: &UserId) -> Result<Option<User>, DomainError>;
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, DomainError>;
    async fn find_all(&self, limit: i64, offset: i64) -> Result<Vec<User>, DomainError>;
    async fn create(&self, input: &CreateUser) -> Result<User, DomainError>;
    async fn update(&self, user: &User) -> Result<User, DomainError>;
    async fn delete(&self, id: &UserId) -> Result<(), DomainError>;
}
```

> 주의: Rust 1.75의 네이티브 async fn in trait은 반환 Future가 자동으로 `Send`를 보장하지 않습니다. tokio 멀티스레드 런타임에서 `dyn UserRepository`를 사용하려면 `Send` 바운드가 필요한데, 네이티브 방식으로는 이를 표현하기 어렵습니다. **제네릭 파라미터 `<R: UserRepository>`로 사용하면 문제가 없습니다.** trait object(`dyn`)가 필요한 경우 아래 대안을 참고하세요.

### dyn-safe한 Repository trait이 필요한 경우

trait object로 사용해야 할 때는 `trait_variant` 크레이트(Rust 공식 팀 제공)를 활용한다.

```toml
[dependencies]
trait-variant = "0.1"
```

```rust
#[trait_variant::make(SendUserRepository: Send)]
pub trait UserRepository {
    async fn find_by_id(&self, id: &UserId) -> Result<Option<User>, DomainError>;
    async fn create(&self, input: &CreateUser) -> Result<User, DomainError>;
    // ...
}

// Send 바운드가 필요한 곳에서는 SendUserRepository를 사용
async fn some_function(repo: &dyn SendUserRepository) {
    // ...
}
```

> 주의: `trait_variant`는 Rust 공식 팀(rust-lang)이 관리하는 크레이트입니다(https://github.com/rust-lang/impl-trait-utils). 단, 아직 0.1.x이므로 API 변경 가능성이 있습니다.

---

## Service 계층 (trait에만 의존)

```rust
// service/user_service.rs

use crate::domain::entity::{CreateUser, User, UserId};
use crate::domain::error::DomainError;
use crate::port::repository::UserRepository;

pub struct UserService<R: UserRepository> {
    repo: R,
}

impl<R: UserRepository> UserService<R> {
    pub fn new(repo: R) -> Self {
        Self { repo }
    }

    pub async fn get_user(&self, id: UserId) -> Result<User, DomainError> {
        self.repo
            .find_by_id(&id)
            .await?
            .ok_or_else(|| DomainError::not_found("user", id.0.to_string()))
    }

    pub async fn create_user(&self, input: CreateUser) -> Result<User, DomainError> {
        // 비즈니스 규칙: 이메일 중복 검사
        if let Some(_existing) = self.repo.find_by_email(&input.email).await? {
            return Err(DomainError::conflict("user", "email", &input.email));
        }

        self.repo.create(&input).await
    }

    pub async fn list_users(&self, limit: i64, offset: i64) -> Result<Vec<User>, DomainError> {
        self.repo.find_all(limit, offset).await
    }

    pub async fn delete_user(&self, id: UserId) -> Result<(), DomainError> {
        // 존재 여부 확인 후 삭제
        let _ = self.get_user(id.clone()).await?;
        self.repo.delete(&id).await
    }
}
```

**핵심:** Service는 `UserRepository` trait의 제네릭 파라미터 `R`에만 의존한다. `sqlx::PgPool`, `redis::Client` 등 구체 타입을 알지 못한다.

---

## DB Row 구조체 (Adapter 계층)

```rust
// adapter/db_model.rs

use sqlx::FromRow;
use crate::domain::entity::{User, UserId};

#[derive(Debug, FromRow)]
pub struct UserRow {
    pub id: i64,
    pub email: String,
    pub name: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,  // DB 전용 컬럼
    pub deleted_at: Option<chrono::DateTime<chrono::Utc>>,  // soft delete
}

// DB Row -> Domain Entity 변환
impl From<UserRow> for User {
    fn from(row: UserRow) -> Self {
        User {
            id: UserId(row.id),
            email: row.email,
            name: row.name,
            created_at: row.created_at,
        }
    }
}
```

**DB Row vs Domain Entity 분리 이유:**
- DB에만 존재하는 컬럼(`updated_at`, `deleted_at`) 격리
- ORM 어노테이션(`#[sqlx(rename)]`)이 도메인을 오염하지 않음
- DB 스키마 마이그레이션이 도메인 계층에 영향을 주지 않음

---

## PostgreSQL Repository 구현 (Adapter)

```rust
// adapter/postgres_repo.rs

use sqlx::PgPool;
use crate::domain::entity::{CreateUser, User, UserId};
use crate::domain::error::DomainError;
use crate::port::repository::UserRepository;
use super::db_model::UserRow;

pub struct PostgresUserRepository {
    pool: PgPool,
}

impl PostgresUserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

impl UserRepository for PostgresUserRepository {
    async fn find_by_id(&self, id: &UserId) -> Result<Option<User>, DomainError> {
        sqlx::query_as::<_, UserRow>(
            "SELECT id, email, name, created_at, updated_at, deleted_at
             FROM users WHERE id = $1 AND deleted_at IS NULL"
        )
        .bind(id.0)
        .fetch_optional(&self.pool)
        .await
        .map(|opt| opt.map(User::from))
        .map_err(|e| DomainError::Infrastructure(e.to_string()))
    }

    async fn find_by_email(&self, email: &str) -> Result<Option<User>, DomainError> {
        sqlx::query_as::<_, UserRow>(
            "SELECT id, email, name, created_at, updated_at, deleted_at
             FROM users WHERE email = $1 AND deleted_at IS NULL"
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await
        .map(|opt| opt.map(User::from))
        .map_err(|e| DomainError::Infrastructure(e.to_string()))
    }

    async fn find_all(&self, limit: i64, offset: i64) -> Result<Vec<User>, DomainError> {
        sqlx::query_as::<_, UserRow>(
            "SELECT id, email, name, created_at, updated_at, deleted_at
             FROM users WHERE deleted_at IS NULL
             ORDER BY id LIMIT $1 OFFSET $2"
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await
        .map(|rows| rows.into_iter().map(User::from).collect())
        .map_err(|e| DomainError::Infrastructure(e.to_string()))
    }

    async fn create(&self, input: &CreateUser) -> Result<User, DomainError> {
        sqlx::query_as::<_, UserRow>(
            "INSERT INTO users (email, name) VALUES ($1, $2)
             RETURNING id, email, name, created_at, updated_at, deleted_at"
        )
        .bind(&input.email)
        .bind(&input.name)
        .fetch_one(&self.pool)
        .await
        .map(User::from)
        .map_err(|e| match &e {
            sqlx::Error::Database(db_err) if db_err.is_unique_violation() => {
                DomainError::conflict("user", "email", &input.email)
            }
            _ => DomainError::Infrastructure(e.to_string()),
        })
    }

    async fn update(&self, user: &User) -> Result<User, DomainError> {
        sqlx::query_as::<_, UserRow>(
            "UPDATE users SET email = $1, name = $2, updated_at = NOW()
             WHERE id = $3 AND deleted_at IS NULL
             RETURNING id, email, name, created_at, updated_at, deleted_at"
        )
        .bind(&user.email)
        .bind(&user.name)
        .bind(user.id.0)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::Infrastructure(e.to_string()))?
        .map(User::from)
        .ok_or_else(|| DomainError::not_found("user", user.id.0.to_string()))
    }

    async fn delete(&self, id: &UserId) -> Result<(), DomainError> {
        let result = sqlx::query(
            "UPDATE users SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL"
        )
        .bind(id.0)
        .execute(&self.pool)
        .await
        .map_err(|e| DomainError::Infrastructure(e.to_string()))?;

        if result.rows_affected() == 0 {
            return Err(DomainError::not_found("user", id.0.to_string()));
        }
        Ok(())
    }
}
```

---

## DB 에러 -> 도메인 에러 변환 패턴

```rust
// 방법 1: map_err 인라인 (단순한 경우)
.map_err(|e| DomainError::Infrastructure(e.to_string()))

// 방법 2: 전용 변환 함수 (반복되는 경우)
fn to_domain_error(e: sqlx::Error) -> DomainError {
    match &e {
        sqlx::Error::RowNotFound => DomainError::NotFound {
            resource: "record",
            id: "unknown".to_string(),
        },
        sqlx::Error::Database(db_err) if db_err.is_unique_violation() => {
            DomainError::Conflict {
                resource: "record",
                field: "unknown",
                value: db_err.message().to_string(),
            }
        }
        _ => DomainError::Infrastructure(e.to_string()),
    }
}

// 방법 3: From trait 구현 (Adapter 모듈 내부 전용 에러 타입)
// DomainError에 직접 From<sqlx::Error>를 구현하면 도메인이 sqlx에 의존하게 되므로,
// Adapter 내부 에러 타입을 거쳐 변환하는 것이 깔끔하다.

#[derive(Debug, thiserror::Error)]
enum RepoError {
    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),
}

impl From<RepoError> for DomainError {
    fn from(e: RepoError) -> Self {
        match e {
            RepoError::Database(sqlx_err) => to_domain_error(sqlx_err),
        }
    }
}
```

**변환 원칙:**
- DomainError에 `#[from] sqlx::Error`를 **넣지 않는다** (도메인이 인프라에 의존하게 됨)
- Adapter에서 `map_err`로 **명시적으로** 변환한다
- DB 고유 에러(unique violation 등)를 의미 있는 도메인 에러로 매핑한다

---

## In-Memory Repository (테스트용 Mock)

```rust
// tests/mock_repo.rs 또는 adapter/in_memory_repo.rs

use std::collections::HashMap;
use std::sync::atomic::{AtomicI64, Ordering};
use tokio::sync::RwLock;

use crate::domain::entity::{CreateUser, User, UserId};
use crate::domain::error::DomainError;
use crate::port::repository::UserRepository;

pub struct InMemoryUserRepository {
    store: RwLock<HashMap<i64, User>>,
    next_id: AtomicI64,
}

impl InMemoryUserRepository {
    pub fn new() -> Self {
        Self {
            store: RwLock::new(HashMap::new()),
            next_id: AtomicI64::new(1),
        }
    }
}

impl UserRepository for InMemoryUserRepository {
    async fn find_by_id(&self, id: &UserId) -> Result<Option<User>, DomainError> {
        let store = self.store.read().await;
        Ok(store.get(&id.0).cloned())
    }

    async fn find_by_email(&self, email: &str) -> Result<Option<User>, DomainError> {
        let store = self.store.read().await;
        Ok(store.values().find(|u| u.email == email).cloned())
    }

    async fn find_all(&self, limit: i64, offset: i64) -> Result<Vec<User>, DomainError> {
        let store = self.store.read().await;
        let users: Vec<User> = store
            .values()
            .cloned()
            .skip(offset as usize)
            .take(limit as usize)
            .collect();
        Ok(users)
    }

    async fn create(&self, input: &CreateUser) -> Result<User, DomainError> {
        // 이메일 중복 검사
        if self.find_by_email(&input.email).await?.is_some() {
            return Err(DomainError::conflict("user", "email", &input.email));
        }

        let id = self.next_id.fetch_add(1, Ordering::SeqCst);
        let user = User {
            id: UserId(id),
            email: input.email.clone(),
            name: input.name.clone(),
            created_at: chrono::Utc::now(),
        };

        let mut store = self.store.write().await;
        store.insert(id, user.clone());
        Ok(user)
    }

    async fn update(&self, user: &User) -> Result<User, DomainError> {
        let mut store = self.store.write().await;
        if !store.contains_key(&user.id.0) {
            return Err(DomainError::not_found("user", user.id.0.to_string()));
        }
        store.insert(user.id.0, user.clone());
        Ok(user.clone())
    }

    async fn delete(&self, id: &UserId) -> Result<(), DomainError> {
        let mut store = self.store.write().await;
        store
            .remove(&id.0)
            .map(|_| ())
            .ok_or_else(|| DomainError::not_found("user", id.0.to_string()))
    }
}
```

---

## Service 단위 테스트 (In-Memory Mock 활용)

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::entity::CreateUser;

    fn setup() -> UserService<InMemoryUserRepository> {
        UserService::new(InMemoryUserRepository::new())
    }

    #[tokio::test]
    async fn create_and_get_user() {
        let service = setup();

        let input = CreateUser {
            email: "test@example.com".to_string(),
            name: "Test User".to_string(),
        };

        let created = service.create_user(input).await.unwrap();
        assert_eq!(created.email, "test@example.com");

        let found = service.get_user(created.id.clone()).await.unwrap();
        assert_eq!(found.id, created.id);
    }

    #[tokio::test]
    async fn duplicate_email_returns_conflict() {
        let service = setup();

        let input = CreateUser {
            email: "dup@example.com".to_string(),
            name: "User 1".to_string(),
        };

        service.create_user(input.clone()).await.unwrap();

        let result = service.create_user(CreateUser {
            email: "dup@example.com".to_string(),
            name: "User 2".to_string(),
        }).await;

        assert!(matches!(result, Err(DomainError::Conflict { .. })));
    }

    #[tokio::test]
    async fn get_nonexistent_user_returns_not_found() {
        let service = setup();

        let result = service.get_user(UserId(999)).await;
        assert!(matches!(result, Err(DomainError::NotFound { .. })));
    }
}
```

---

## Axum 핸들러에서 조립

```rust
use axum::{extract::State, Router, routing::get};
use std::sync::Arc;

// AppState에서 Service를 구체 타입으로 보유
type UserSvc = UserService<PostgresUserRepository>;

#[derive(Clone)]
struct AppState {
    user_service: Arc<UserSvc>,
}

async fn get_user_handler(
    State(state): State<AppState>,
    axum::extract::Path(id): axum::extract::Path<i64>,
) -> Result<axum::Json<UserResponse>, AppError> {
    let user = state.user_service.get_user(UserId(id)).await?;
    Ok(axum::Json(UserResponse::from(user)))
}

// DomainError -> AppError (HTTP 에러) 변환
impl From<DomainError> for AppError {
    fn from(e: DomainError) -> Self {
        match e {
            DomainError::NotFound { .. } => AppError::NotFound(e.to_string()),
            DomainError::Conflict { .. } => AppError::Conflict(e.to_string()),
            DomainError::Validation(msg) => AppError::BadRequest(msg),
            DomainError::Infrastructure(_) => AppError::Internal,
        }
    }
}

// 조립
fn create_router(pool: sqlx::PgPool) -> Router {
    let repo = PostgresUserRepository::new(pool);
    let service = UserService::new(repo);
    let state = AppState {
        user_service: Arc::new(service),
    };

    Router::new()
        .route("/users/{id}", get(get_user_handler))
        .with_state(state)
}
```

---

## 에러 변환 흐름 요약

```
sqlx::Error
  ↓  (Adapter: map_err)
DomainError
  ↓  (Handler: From impl)
AppError (IntoResponse)
  ↓
HTTP Response
```

각 계층의 에러는 **자기 계층에서만 정의**하고, 계층 경계에서 **명시적으로 변환**한다.

---

## 설계 결정 체크리스트

| 질문 | 권장 |
|------|------|
| Repository trait에 `async fn` 사용? | Rust 1.75+ 네이티브 사용 (제네릭 파라미터 방식) |
| `dyn Repository`가 필요한가? | 대부분 제네릭으로 충분. 필요 시 `trait_variant` 사용 |
| Domain Entity에 `sqlx::FromRow`? | 붙이지 않는다. DB Row 별도 타입 사용 |
| DomainError에 `#[from] sqlx::Error`? | 넣지 않는다. Adapter에서 명시적 변환 |
| Service에서 `PgPool` 직접 참조? | 하지 않는다. Repository trait만 참조 |
| 테스트에서 DB 연결? | InMemoryRepository로 Service 로직만 단위 테스트 |
