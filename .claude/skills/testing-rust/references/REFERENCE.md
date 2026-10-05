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
