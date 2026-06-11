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
