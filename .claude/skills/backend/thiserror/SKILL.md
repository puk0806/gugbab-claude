---
name: thiserror
description: Rust thiserror 크레이트 기반 에러 처리 패턴 - derive(Error), 메시지 포매팅, from 변환, Axum 연동
---

# thiserror 에러 처리 패턴

> 소스: https://docs.rs/thiserror/latest/thiserror/ | https://github.com/dtolnay/thiserror
> 검증일: 2026-04-06

> 주의: 이 문서는 thiserror 2.x 기준으로 작성되었습니다. 2.0.0 출시 시 MSRV는 1.61이었으나 이후 지속적으로 상향되어 2026년 4월 기준 1.71입니다. 1.x에서 2.x로 업그레이드 시 일부 동작 차이가 있으므로 공식 CHANGELOG를 확인하세요.

---

## 프로젝트 설정

```toml
# Cargo.toml
[dependencies]
thiserror = "2"
```

---

## 기본 패턴: #[derive(Error)]

`#[derive(Error)]`는 `std::error::Error` 트레이트를 자동 구현한다. `Display`도 `#[error("...")]` 어트리뷰트로 함께 생성된다.

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("not found: {0}")]
    NotFound(String),

    #[error("unauthorized")]
    Unauthorized,

    #[error("internal server error")]
    Internal,
}
```

**핵심 규칙:**
- `Debug`는 직접 derive 해야 함 (thiserror가 자동 추가하지 않음)
- `#[error("...")]`는 모든 variant에 필수 (없으면 컴파일 에러)

---

## 메시지 포매팅

`#[error("...")]` 내부에서 `Display` 포맷 문법을 사용한다.

```rust
#[derive(Debug, Error)]
pub enum ValidationError {
    // 위치 기반 참조
    #[error("invalid field: {0}")]
    InvalidField(String),

    // 이름 기반 참조 (named struct variant)
    #[error("field `{field}` must be between {min} and {max}")]
    OutOfRange {
        field: String,
        min: i64,
        max: i64,
    },

    // source()의 Display 출력 포함
    #[error("database error: {source}")]
    Database {
        #[source]
        source: sqlx::Error,
    },

    // 메서드 호출 가능
    #[error("error at line {}: {}", .line, .message)]
    Parse { line: usize, message: String },
}
```

**포매팅 규칙:**
- `{0}`, `{1}` -- 튜플 variant 필드 인덱스
- `{field_name}` -- named struct variant 필드명
- `.field` 문법으로 named field 접근 (fmt 인자 위치에서)
- `{field:?}` -- Debug 포맷 사용 가능

---

## #[from] 자동 변환

`#[from]`은 `From<T>` 트레이트를 자동 구현하여 `?` 연산자로 에러를 변환한다.

```rust
#[derive(Debug, Error)]
pub enum AppError {
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),

    #[error("json error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),
}

// 사용: ? 연산자로 자동 변환
fn read_config() -> Result<Config, AppError> {
    let data = std::fs::read_to_string("config.json")?; // io::Error -> AppError::Io
    let config = serde_json::from_str(&data)?;           // serde_json::Error -> AppError::Json
    Ok(config)
}
```

**#[from] 규칙:**
- 하나의 에러 타입에 대해 `#[from]`은 한 번만 사용 가능
- `#[from]`은 `#[source]`를 암묵적으로 포함 (별도 `#[source]` 불필요)
- 같은 소스 타입을 여러 variant에서 쓰려면 수동 `From` 구현 필요

---

## #[source] 에러 체이닝

`#[source]`는 `Error::source()` 메서드를 구현하여 에러 원인 체이닝을 지원한다.

```rust
#[derive(Debug, Error)]
pub enum ServiceError {
    // #[source]만 사용 -- From 구현 없이 source() 체이닝만
    #[error("failed to fetch user")]
    FetchUser {
        #[source]
        source: DatabaseError,
    },

    // 필드명이 `source`이면 자동으로 #[source] 적용
    #[error("connection failed")]
    Connection {
        source: std::io::Error, // 필드명이 source -> 자동 인식
    },
}
```

---

## transparent 위임

`#[error(transparent)]`는 Display와 source()를 내부 에러에 위임한다.

```rust
#[derive(Debug, Error)]
pub enum AppError {
    #[error(transparent)]
    Unexpected(#[from] anyhow::Error),

    #[error("not found: {0}")]
    NotFound(String),
}
```

---

## Axum IntoResponse 구현 패턴

thiserror로 정의한 에러를 Axum 핸들러에서 HTTP 응답으로 변환하는 패턴.

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

    #[error("unauthorized")]
    Unauthorized,

    #[error("validation error: {0}")]
    Validation(String),

    #[error("internal error: {0}")]
    Internal(#[from] anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match &self {
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, self.to_string()),
            AppError::Validation(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::Internal(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "internal server error".to_string(), // 내부 에러 메시지 노출 방지
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

// 핸들러에서 사용
async fn get_user(Path(id): Path<i64>) -> Result<Json<User>, AppError> {
    let user = db::find_user(id)
        .await
        .map_err(|e| AppError::Internal(e.into()))?
        .ok_or_else(|| AppError::NotFound(format!("user {id}")))?;

    Ok(Json(user))
}
```

**패턴 핵심:**
- `IntoResponse` 구현으로 `Result<T, AppError>`를 핸들러 반환 타입으로 사용
- Internal 에러는 클라이언트에 상세 메시지를 노출하지 않음
- 로깅이 필요하면 `into_response` 내부에서 `tracing::error!` 호출

---

## 실전 AppError enum 전체 예시

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    // 인증/인가
    #[error("unauthorized")]
    Unauthorized,

    #[error("forbidden: {0}")]
    Forbidden(String),

    // 리소스
    #[error("{resource} not found: {id}")]
    NotFound { resource: &'static str, id: String },

    #[error("{resource} already exists: {id}")]
    Conflict { resource: &'static str, id: String },

    // 입력 검증
    #[error("validation error: {0}")]
    Validation(String),

    // 외부 서비스
    #[error("database error")]
    Database(#[from] sqlx::Error),

    #[error("redis error")]
    Redis(#[from] redis::RedisError),

    #[error("http client error")]
    HttpClient(#[from] reqwest::Error),

    // 직렬화
    #[error("json error")]
    Json(#[from] serde_json::Error),

    // 포괄적 내부 에러
    #[error(transparent)]
    Unexpected(#[from] anyhow::Error),
}

// 편의 메서드
impl AppError {
    pub fn not_found(resource: &'static str, id: impl Into<String>) -> Self {
        Self::NotFound { resource, id: id.into() }
    }

    pub fn conflict(resource: &'static str, id: impl Into<String>) -> Self {
        Self::Conflict { resource, id: id.into() }
    }
}
```

사용 예시:

```rust
async fn create_user(Json(input): Json<CreateUser>) -> Result<Json<User>, AppError> {
    if input.email.is_empty() {
        return Err(AppError::Validation("email is required".into()));
    }

    let exists = db::user_exists(&input.email).await?; // sqlx::Error -> AppError::Database
    if exists {
        return Err(AppError::conflict("user", &input.email));
    }

    let user = db::create_user(input).await?;
    Ok(Json(user))
}
```

---

## thiserror vs anyhow 선택 기준

| 기준 | thiserror | anyhow |
|------|-----------|--------|
| 용도 | 라이브러리, 에러 타입 정의 | 애플리케이션, 에러 전파 |
| 에러 타입 | 구체적인 enum/struct | 단일 `anyhow::Error` 타입 |
| 패턴 매칭 | 가능 (variant별 분기) | 불편 (downcast 필요) |
| 컨텍스트 추가 | 직접 필드로 포함 | `.context("...")` 체이닝 |
| 적합한 곳 | 공개 API, 에러 분기 처리 필요 시 | 내부 로직, 빠른 프로토타이핑 |

**실전 조합 패턴:**

```rust
// thiserror로 공개 에러 타입 정의
#[derive(Debug, Error)]
pub enum AppError {
    #[error("specific known error")]
    Known,

    // anyhow로 예상치 못한 에러를 포괄적으로 수집
    #[error(transparent)]
    Unexpected(#[from] anyhow::Error),
}
```

**선택 규칙:**
- 호출자가 에러 종류에 따라 다르게 처리해야 하면 -> `thiserror`
- 에러를 위로 전파만 하고 최종 로깅/응답만 하면 -> `anyhow`
- 대부분의 Axum 서버 프로젝트 -> `thiserror` + `anyhow` 조합
