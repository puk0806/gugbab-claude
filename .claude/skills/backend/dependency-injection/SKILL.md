---
name: dependency-injection
description: Rust Trait 기반 의존성 주입 패턴 - DI 원리, Arc<dyn Trait> vs 제네릭, AppState 구성, Axum 핸들러 주입, Mock 테스트
---

# Rust 의존성 주입(Dependency Injection) 패턴

> 소스: https://doc.rust-lang.org/book/ch17-02-trait-objects.html | https://doc.rust-lang.org/reference/items/traits.html | https://docs.rs/axum/latest/axum/extract/struct.State.html | https://blog.rust-lang.org/2023/12/21/async-fn-rpit-in-traits.html
> 검증일: 2026-04-06

> 주의: Axum 코드는 0.8.x 기준입니다. async fn in traits는 Rust 1.75+ 기준이며, dyn Trait에서는 여전히 제약이 있습니다.

---

## 핵심 원리: Trait으로 구체 타입 숨기기

DI의 본질은 "구현이 아닌 인터페이스에 의존"하는 것이다. Rust에서는 trait이 인터페이스 역할을 한다.

```rust
// 1. 인터페이스(trait) 정의
pub trait UserRepository: Send + Sync {
    async fn find_by_id(&self, id: i64) -> Result<Option<User>, AppError>;
    async fn create(&self, input: CreateUser) -> Result<User, AppError>;
}

// 2. 구현체 (프로덕션)
pub struct PgUserRepository {
    pool: sqlx::PgPool,
}

impl UserRepository for PgUserRepository {
    async fn find_by_id(&self, id: i64) -> Result<Option<User>, AppError> {
        sqlx::query_as!(User, "SELECT * FROM users WHERE id = $1", id)
            .fetch_optional(&self.pool)
            .await
            .map_err(AppError::from)
    }

    async fn create(&self, input: CreateUser) -> Result<User, AppError> {
        sqlx::query_as!(User, "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
            input.name, input.email)
            .fetch_one(&self.pool)
            .await
            .map_err(AppError::from)
    }
}
```

**핵심**: 비즈니스 로직은 `UserRepository` trait에만 의존하고, `PgUserRepository`를 직접 참조하지 않는다.

---

## async fn in traits (Rust 1.75+)

Rust 1.75.0 (2023-12-28 안정화)부터 trait에서 `async fn`을 직접 사용할 수 있다.

```rust
// Rust 1.75+ : #[async_trait] 없이 동작
pub trait UserRepository: Send + Sync {
    async fn find_by_id(&self, id: i64) -> Result<Option<User>, AppError>;
}
```

### dyn Trait에서의 제약

`async fn in trait`은 각 구현체마다 다른 Future 타입을 반환하므로, `dyn Trait`으로 직접 사용할 수 없다. 이를 해결하는 방법:

```rust
// 방법 1: trait-variant 크레이트 (Rust 공식 팀 제공)
// Cargo.toml: trait-variant = "0.1"
#[trait_variant::make(UserRepository: Send)]
pub trait LocalUserRepository {
    async fn find_by_id(&self, id: i64) -> Result<Option<User>, AppError>;
}

// 방법 2: 수동 Box<dyn Future> 반환 (dyn 호환 필요 시)
pub trait UserRepository: Send + Sync {
    fn find_by_id(&self, id: i64) -> Pin<Box<dyn Future<Output = Result<Option<User>, AppError>> + Send + '_>>;
}

// 방법 3: 제네릭으로 사용하면 dyn 제약 자체가 없음 (권장)
```

> 주의: `trait-variant` 크레이트는 Rust 공식 팀(rust-lang 조직)에서 관리하지만, 아직 1.0 미만 버전입니다. API 변경 가능성이 있습니다.

---

## Arc<dyn Trait> vs 제네릭 (Generic) 트레이드오프

### 방법 A: 동적 디스패치 -- Arc<dyn Trait>

```rust
pub struct AppState {
    pub user_repo: Arc<dyn UserRepository>,
    pub post_repo: Arc<dyn PostRepository>,
}
```

| 장점 | 단점 |
|------|------|
| 구조체 정의가 간결 | vtable 간접 호출 비용 (대부분 무시 가능) |
| 런타임에 구현체 교체 가능 | dyn 호환 trait 제약 (object safety) |
| 컴파일 시간 짧음 | async fn 사용 시 추가 처리 필요 |

### 방법 B: 정적 디스패치 -- 제네릭

```rust
pub struct AppState<R: UserRepository, P: PostRepository> {
    pub user_repo: R,
    pub post_repo: P,
}
```

| 장점 | 단점 |
|------|------|
| 제로 비용 추상화 (인라이닝) | 제네릭 파라미터 전파 (타입 복잡도 증가) |
| async fn in trait 그대로 사용 | 컴파일 시간 증가 (단형성화) |
| dyn 호환 제약 없음 | 구현체를 런타임에 교체 불가 |

### 실무 판단 기준

```
의존성 2-3개 이하, 런타임 교체 불필요 → 제네릭
의존성 다수, 플러그인 구조, dyn 필요    → Arc<dyn Trait>
웹 서버 AppState (가장 일반적)         → Arc<dyn Trait> 권장
  - 핸들러당 vtable 오버헤드는 네트워크 I/O 대비 무시할 수준
  - 타입 파라미터 전파 없이 깔끔한 코드 유지
```

---

## AppState 구성 패턴

### 기본 구조

```rust
use std::sync::Arc;
use sqlx::PgPool;
use reqwest::Client;

#[derive(Clone)]
pub struct AppConfig {
    pub jwt_secret: String,
    pub external_api_url: String,
}

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,                          // sqlx pool은 내부적으로 Arc
    pub http_client: Client,                 // reqwest Client도 내부 Arc
    pub config: Arc<AppConfig>,
    pub user_repo: Arc<dyn UserRepository>,
    pub post_repo: Arc<dyn PostRepository>,
}
```

### 빌더 패턴으로 조립

```rust
impl AppState {
    pub fn new(pool: PgPool, config: AppConfig) -> Self {
        let config = Arc::new(config);
        let http_client = Client::new();

        Self {
            db: pool.clone(),
            http_client: http_client.clone(),
            config: config.clone(),
            user_repo: Arc::new(PgUserRepository { pool: pool.clone() }),
            post_repo: Arc::new(PgPostRepository { pool, http_client, config }),
        }
    }
}
```

**주의사항:**
- `PgPool`과 `reqwest::Client`는 내부적으로 `Arc`를 사용하므로 `clone()`이 저렴하다 (포인터 복사).
- `AppState` 자체도 `Clone`이어야 Axum `State`로 사용 가능하다.

---

## Axum State<AppState>로 핸들러에 주입

### 라우터에 상태 등록

```rust
use axum::{Router, routing::get};

#[tokio::main]
async fn main() {
    let pool = sqlx::PgPool::connect("postgres://...").await.unwrap();
    let config = AppConfig { /* ... */ };
    let state = AppState::new(pool, config);

    let app = Router::new()
        .route("/users/{id}", get(get_user))
        .route("/users", post(create_user))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

> 주의: axum 0.8부터 경로 파라미터 문법이 `:id`에서 `{id}`로 변경되었습니다.

### 핸들러에서 추출

```rust
use axum::extract::{State, Path};
use axum::Json;

async fn get_user(
    State(state): State<AppState>,
    Path(id): Path<i64>,
) -> Result<Json<User>, AppError> {
    let user = state.user_repo
        .find_by_id(id)
        .await?
        .ok_or(AppError::NotFound)?;

    Ok(Json(user))
}

async fn create_user(
    State(state): State<AppState>,
    Json(input): Json<CreateUser>,
) -> Result<Json<User>, AppError> {
    let user = state.user_repo.create(input).await?;
    Ok(Json(user))
}
```

### 중첩 라우터 상태 공유

```rust
fn user_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_user))
        .route("/{id}", get(get_user))
}

fn post_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_posts).post(create_post))
}

let app = Router::new()
    .nest("/users", user_routes())
    .nest("/posts", post_routes())
    .with_state(state);
```

---

## 테스트용 Mock 구현체 교체 패턴

### Mock 구현체 직접 작성

```rust
#[cfg(test)]
mod tests {
    use super::*;

    // Mock 구현체
    struct MockUserRepository {
        users: Vec<User>,
    }

    impl MockUserRepository {
        fn with_users(users: Vec<User>) -> Self {
            Self { users }
        }
    }

    impl UserRepository for MockUserRepository {
        async fn find_by_id(&self, id: i64) -> Result<Option<User>, AppError> {
            Ok(self.users.iter().find(|u| u.id == id).cloned())
        }

        async fn create(&self, input: CreateUser) -> Result<User, AppError> {
            Ok(User {
                id: 1,
                name: input.name,
                email: input.email,
            })
        }
    }

    #[tokio::test]
    async fn test_find_user() {
        let user = User { id: 1, name: "Alice".into(), email: "a@b.com".into() };
        let repo = MockUserRepository::with_users(vec![user.clone()]);

        let result = repo.find_by_id(1).await.unwrap();
        assert_eq!(result, Some(user));
    }
}
```

### Mock을 AppState에 주입하여 통합 테스트

```rust
#[cfg(test)]
mod integration_tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt; // oneshot 사용

    fn test_state() -> AppState {
        let user = User { id: 1, name: "Alice".into(), email: "a@b.com".into() };
        AppState {
            db: /* test pool 또는 미사용 */,
            http_client: Client::new(),
            config: Arc::new(AppConfig { /* test config */ }),
            user_repo: Arc::new(MockUserRepository::with_users(vec![user])),
            post_repo: Arc::new(MockPostRepository::default()),
        }
    }

    #[tokio::test]
    async fn test_get_user_handler() {
        let app = Router::new()
            .route("/users/{id}", get(get_user))
            .with_state(test_state());

        let req = Request::builder()
            .uri("/users/1")
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(req).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }
}
```

### mockall 크레이트 활용 (자동 Mock 생성)

```rust
// Cargo.toml
// [dev-dependencies]
// mockall = "0.13"

use mockall::automock;

#[automock]
pub trait UserRepository: Send + Sync {
    async fn find_by_id(&self, id: i64) -> Result<Option<User>, AppError>;
    async fn create(&self, input: CreateUser) -> Result<User, AppError>;
}

#[tokio::test]
async fn test_with_mockall() {
    let mut mock = MockUserRepository::new();
    mock.expect_find_by_id()
        .with(eq(1))
        .times(1)
        .returning(|_| Ok(Some(User { id: 1, name: "Alice".into(), email: "a@b.com".into() })));

    let result = mock.find_by_id(1).await.unwrap();
    assert!(result.is_some());
}
```

> 주의: mockall 0.13+는 async fn in traits를 지원하지만, 복잡한 trait 구조에서 컴파일 에러가 발생할 수 있습니다. 단순 trait에서는 문제 없이 동작합니다.

---

## 계층 구조 정리

```
main.rs          → AppState 조립, 라우터 구성
├── config.rs    → AppConfig (환경 변수 로드)
├── state.rs     → AppState 정의 + new()
├── domain/
│   └── user.rs  → User, CreateUser 타입
├── repo/
│   ├── traits.rs    → trait UserRepository
│   └── postgres.rs  → PgUserRepository (impl)
├── handler/
│   └── user.rs  → get_user, create_user (State 추출)
└── error.rs     → AppError (IntoResponse 구현)
```

**의존 방향:**
```
handler → trait (repo/traits.rs) ← impl (repo/postgres.rs)
              ↑
         state.rs (Arc<dyn Trait>으로 연결)
```

핸들러는 구체 구현체를 알지 못하고, trait만 참조한다. 구현체 교체는 `state.rs`의 조립 지점에서만 발생한다.
