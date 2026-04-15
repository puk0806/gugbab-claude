---
name: testing-rust
description: Rust 테스트 패턴 — 단위 테스트, 통합 테스트, #[tokio::test] 비동기 테스트, Axum 핸들러 테스트(tower::ServiceExt), In-Memory Mock, 환경 격리
---

# Rust 테스트 패턴

> 소스: https://doc.rust-lang.org/book/ch11-00-testing.html | https://docs.rs/tokio/latest/tokio/attr.test.html | https://docs.rs/axum/0.8/axum/ | https://docs.rs/tower/latest/tower/trait.ServiceExt.html
> 검증일: 2026-04-07

> 주의: Rust 1.75+ / tokio 1.x / axum 0.8.x 기준으로 작성되었습니다.

---

## 단위 테스트 (#[cfg(test)] 모듈)

같은 파일 내에 `#[cfg(test)]` 모듈을 만들어 비공개 함수까지 테스트할 수 있다. `cargo test`에서만 컴파일된다.

```rust
// src/domain/entity.rs

pub struct UserId(pub i64);

impl UserId {
    pub fn is_valid(&self) -> bool {
        self.0 > 0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn valid_user_id() {
        assert!(UserId(1).is_valid());
    }

    #[test]
    fn invalid_user_id() {
        assert!(!UserId(0).is_valid());
        assert!(!UserId(-1).is_valid());
    }
}
```

**핵심 규칙:**
- `#[cfg(test)]`는 `cargo test` 시에만 해당 모듈을 컴파일한다
- `use super::*;`로 부모 모듈의 비공개 항목에 접근 가능
- 테스트 함수에 `#[test]` 어트리뷰트 필수

---

## 표준 assert 매크로

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn assert_examples() {
        // 불리언 검사
        assert!(true);
        assert!(1 + 1 == 2);

        // 동등성 검사 (Debug trait 필요)
        assert_eq!(4, 2 + 2);
        assert_ne!(3, 2 + 2);

        // 커스텀 메시지
        let result = 42;
        assert_eq!(result, 42, "expected 42 but got {result}");

        // 패턴 매칭 (stable Rust에서 사용 가능)
        let value: Result<i32, String> = Ok(42);
        assert!(matches!(value, Ok(42)));

        let err: Result<i32, String> = Err("fail".to_string());
        assert!(matches!(err, Err(ref msg) if msg.contains("fail")));
    }
}
```

> 주의: `std::assert_matches::assert_matches!`는 nightly 전용(`#![feature(assert_matches)]`)입니다. stable Rust에서는 `matches!` 매크로와 `assert!`를 조합하세요.

---

## #[should_panic] 테스트

함수가 panic하는지 검증한다.

```rust
#[cfg(test)]
mod tests {
    #[test]
    #[should_panic]
    fn panics_on_invalid_input() {
        divide(10, 0);
    }

    #[test]
    #[should_panic(expected = "division by zero")]
    fn panics_with_message() {
        divide(10, 0);
    }
}
```

---

## Result 반환 테스트

`?` 연산자를 사용하려면 `Result`를 반환한다.

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn result_test() -> Result<(), String> {
        let value: i32 = "42".parse().map_err(|e| format!("{e}"))?;
        assert_eq!(value, 42);
        Ok(())
    }
}
```

---

## 비동기 테스트 (#[tokio::test])

`#[tokio::test]`는 비동기 테스트 함수를 위한 tokio 매크로다. 내부적으로 tokio 런타임을 생성한다.

```rust
#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn async_test() {
        let result = some_async_fn().await;
        assert_eq!(result, 42);
    }
}
```

**런타임 flavor 설정:**

```rust
// current_thread (기본값) — 단일 스레드, 대부분의 단위 테스트에 적합
#[tokio::test]
async fn default_single_thread() { /* ... */ }

// multi_thread — 멀티스레드 런타임이 필요한 경우
#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn multi_thread_test() { /* ... */ }
```

> 주의: `#[tokio::test]`의 기본 flavor는 `current_thread`입니다. `#[tokio::main]`의 기본값인 `multi_thread`와 다릅니다.

**필요 feature:** `macros`와 `rt` (또는 `"full"`)

```toml
[dev-dependencies]
tokio = { version = "1", features = ["macros", "rt"] }
```

---

## In-Memory Mock (repository-pattern 연동)

Service 계층의 비즈니스 로직을 DB 없이 테스트한다. Repository trait의 In-Memory 구현을 주입한다.

> 관련 스킬: repository-pattern 스킬의 InMemoryUserRepository 참조

```rust
// tests/mock_repo.rs 또는 src 내부 테스트 모듈

use std::collections::HashMap;
use std::sync::atomic::{AtomicI64, Ordering};
use tokio::sync::RwLock;

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

    /// 테스트 셋업용: 초기 데이터를 미리 넣는 헬퍼
    pub async fn with_seed(users: Vec<User>) -> Self {
        let repo = Self::new();
        let mut store = repo.store.write().await;
        for user in users {
            let id = repo.next_id.fetch_add(1, Ordering::SeqCst);
            store.insert(id, user);
        }
        repo
    }
}

impl UserRepository for InMemoryUserRepository {
    async fn find_by_id(&self, id: &UserId) -> Result<Option<User>, DomainError> {
        let store = self.store.read().await;
        Ok(store.get(&id.0).cloned())
    }

    async fn create(&self, input: &CreateUser) -> Result<User, DomainError> {
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

    // ... 나머지 메서드 구현
}
```

### Service 단위 테스트

```rust
#[cfg(test)]
mod tests {
    use super::*;

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

        service.create_user(CreateUser {
            email: "dup@example.com".to_string(),
            name: "User 1".to_string(),
        }).await.unwrap();

        let result = service.create_user(CreateUser {
            email: "dup@example.com".to_string(),
            name: "User 2".to_string(),
        }).await;

        assert!(matches!(result, Err(DomainError::Conflict { .. })));
    }

    #[tokio::test]
    async fn get_nonexistent_returns_not_found() {
        let service = setup();
        let result = service.get_user(UserId(999)).await;
        assert!(matches!(result, Err(DomainError::NotFound { .. })));
    }
}
```

---

## Axum 핸들러 테스트 (tower::ServiceExt)

axum의 `Router`는 `tower::Service`를 구현한다. `tower::ServiceExt::oneshot`으로 HTTP 요청을 직접 보내 테스트할 수 있다.

> 주의: axum은 자체 TestClient를 제공하지 않습니다. 공식 테스트 패턴은 `tower::ServiceExt::oneshot`입니다.

### 의존성

```toml
[dev-dependencies]
tokio = { version = "1", features = ["macros", "rt"] }
tower = { version = "0.5", features = ["util"] }
http-body-util = "0.1"          # body 읽기 유틸
hyper = "1"
```

### 기본 패턴

```rust
#[cfg(test)]
mod tests {
    use axum::{
        body::Body,
        http::{Request, StatusCode},
        Router,
    };
    use http_body_util::BodyExt;  // .collect() 메서드
    use tower::ServiceExt;        // .oneshot() 메서드

    // 테스트용 Router 생성 (AppState에 InMemory 주입)
    fn test_app() -> Router {
        let repo = InMemoryUserRepository::new();
        let service = UserService::new(repo);
        let state = AppState {
            user_service: Arc::new(service),
        };

        create_router_with_state(state)
    }

    #[tokio::test]
    async fn test_get_user_not_found() {
        let app = test_app();

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/users/999")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn test_create_user() {
        let app = test_app();

        let response = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/users")
                    .header("content-type", "application/json")
                    .body(Body::from(
                        serde_json::to_string(&serde_json::json!({
                            "email": "test@example.com",
                            "name": "Test User"
                        })).unwrap(),
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::CREATED);

        // 응답 본문 읽기
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let user: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(user["email"], "test@example.com");
    }
}
```

### oneshot의 제약: 여러 요청 보내기

`oneshot`은 `Service`를 소비(consume)한다. 여러 요청을 보내려면 매번 Router를 생성하거나 `.into_service()`를 사용한다.

```rust
#[tokio::test]
async fn test_multiple_requests() {
    let app = test_app();

    // Router를 Service로 변환하면 clone 가능
    let mut app = app.into_service();

    // 첫 번째 요청
    let req1 = Request::builder()
        .method("POST")
        .uri("/users")
        .header("content-type", "application/json")
        .body(Body::from(r#"{"email":"a@b.com","name":"A"}"#))
        .unwrap();
    let res1 = ServiceExt::<Request<Body>>::ready(&mut app)
        .await
        .unwrap()
        .call(req1)
        .await
        .unwrap();
    assert_eq!(res1.status(), StatusCode::CREATED);

    // 두 번째 요청 (같은 서비스 인스턴스)
    let req2 = Request::builder()
        .uri("/users/1")
        .body(Body::empty())
        .unwrap();
    let res2 = ServiceExt::<Request<Body>>::ready(&mut app)
        .await
        .unwrap()
        .call(req2)
        .await
        .unwrap();
    assert_eq!(res2.status(), StatusCode::OK);
}
```

---

## 통합 테스트 디렉토리 구조 (tests/)

`tests/` 디렉토리의 각 파일은 별도 크레이트로 컴파일된다. 크레이트의 공개 API만 테스트 가능하다.

```
my-crate/
├── src/
│   ├── lib.rs
│   └── ...
├── tests/
│   ├── common/
│   │   └── mod.rs        # 테스트 헬퍼 (별도 테스트로 실행되지 않음)
│   ├── api_test.rs        # 통합 테스트 파일 (독립 크레이트)
│   └── user_flow_test.rs  # 통합 테스트 파일 (독립 크레이트)
└── Cargo.toml
```

### 공유 헬퍼 모듈

`tests/common/mod.rs`에 공통 셋업 코드를 둔다. 서브디렉토리의 `mod.rs`는 별도 테스트 파일로 인식되지 않는다.

```rust
// tests/common/mod.rs
use my_crate::{AppState, create_router};

pub fn test_app() -> axum::Router {
    let repo = my_crate::InMemoryUserRepository::new();
    let service = my_crate::UserService::new(repo);
    let state = AppState {
        user_service: std::sync::Arc::new(service),
    };
    create_router(state)
}

pub async fn read_body(response: axum::http::Response<axum::body::Body>) -> Vec<u8> {
    use http_body_util::BodyExt;
    response.into_body().collect().await.unwrap().to_bytes().to_vec()
}
```

```rust
// tests/api_test.rs
mod common;

use axum::{body::Body, http::{Request, StatusCode}};
use tower::ServiceExt;

#[tokio::test]
async fn full_user_flow() {
    let app = common::test_app();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/users")
                .header("content-type", "application/json")
                .body(Body::from(r#"{"email":"int@test.com","name":"Integration"}"#))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::CREATED);
}
```

---

## 환경 격리

### 테스트용 환경변수

```rust
#[cfg(test)]
mod tests {
    use std::env;

    #[test]
    fn test_with_env() {
        // 테스트 전 설정
        unsafe { env::set_var("DATABASE_URL", "postgres://test:test@localhost/test_db"); }

        let url = env::var("DATABASE_URL").unwrap();
        assert!(url.contains("test_db"));

        // 테스트 후 정리
        unsafe { env::remove_var("DATABASE_URL"); }
    }
}
```

> 주의: Rust 1.66+에서 `env::set_var`은 `unsafe`입니다(멀티스레드 환경에서의 안전성 문제). 테스트 간 환경변수 격리가 필요하면 `#[serial_test::serial]` 크레이트 사용을 권장합니다.

### 테스트 실행 순서 제어

테스트는 기본적으로 **병렬** 실행된다. 공유 자원(DB, 환경변수 등)을 사용하는 테스트는 순차 실행해야 한다.

```bash
# 단일 스레드로 실행 (모든 테스트 순차)
cargo test -- --test-threads=1

# 특정 테스트만 실행
cargo test test_name

# 특정 모듈의 테스트
cargo test domain::tests

# 통합 테스트만 실행
cargo test --test api_test

# 무시된 테스트 실행
cargo test -- --ignored
```

### 테스트용 DB 격리 패턴

```rust
// 테스트마다 고유한 DB 스키마 사용
async fn setup_test_db() -> sqlx::PgPool {
    let db_url = env::var("TEST_DATABASE_URL")
        .unwrap_or_else(|_| "postgres://test:test@localhost/test_db".to_string());

    let pool = sqlx::PgPool::connect(&db_url).await.unwrap();

    // 테스트용 스키마 생성 (격리)
    let schema = format!("test_{}", uuid::Uuid::new_v4().to_string().replace('-', ""));
    sqlx::query(&format!("CREATE SCHEMA {schema}"))
        .execute(&pool)
        .await
        .unwrap();
    sqlx::query(&format!("SET search_path TO {schema}"))
        .execute(&pool)
        .await
        .unwrap();

    // 마이그레이션 실행
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .unwrap();

    pool
}
```

> 주의: 실제 DB를 사용하는 테스트는 통합 테스트(`tests/` 디렉토리)에 배치하고, 단위 테스트에서는 InMemoryRepository를 사용하는 것이 공식 권장 패턴입니다.

---

## 테스트 헬퍼 매크로

반복되는 테스트 패턴을 매크로로 추출할 수 있다.

```rust
#[cfg(test)]
macro_rules! assert_err {
    ($expr:expr, $pattern:pat) => {
        match $expr {
            Err($pattern) => {}
            Err(other) => panic!("expected {} but got {:?}", stringify!($pattern), other),
            Ok(val) => panic!("expected Err({}) but got Ok({:?})", stringify!($pattern), val),
        }
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn not_found_error() {
        let service = setup();
        let result = service.get_user(UserId(999)).await;
        assert_err!(result, DomainError::NotFound { .. });
    }
}
```

---

## #[ignore] 테스트

느린 테스트나 외부 의존성이 필요한 테스트는 `#[ignore]`로 표시한다.

```rust
#[test]
#[ignore = "requires running database"]
fn slow_db_test() {
    // ...
}
```

```bash
# 무시된 테스트만 실행
cargo test -- --ignored

# 무시된 테스트 포함 전체 실행
cargo test -- --include-ignored
```

---

## 테스트 구성 체크리스트

| 계층 | 테스트 위치 | 방식 | Mock |
|------|------------|------|------|
| Domain (Entity, ValueObject) | `#[cfg(test)]` 인라인 | `#[test]` 동기 | 불필요 |
| Service (비즈니스 로직) | `#[cfg(test)]` 인라인 | `#[tokio::test]` | InMemoryRepository |
| Handler (HTTP 요청/응답) | `#[cfg(test)]` 또는 `tests/` | `#[tokio::test]` + `oneshot` | InMemoryRepository |
| 통합 (전체 플로우) | `tests/` 디렉토리 | `#[tokio::test]` + `oneshot` | InMemory 또는 테스트 DB |

---

## Cargo.toml dev-dependencies 요약

```toml
[dev-dependencies]
tokio = { version = "1", features = ["macros", "rt"] }
tower = { version = "0.5", features = ["util"] }
http-body-util = "0.1"
serde_json = "1"
```
