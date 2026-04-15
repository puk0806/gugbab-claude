---
name: jwt-auth
description: Rust JWT 인증 패턴 - jsonwebtoken 크레이트 + Axum 미들웨어 기반 토큰 생성/검증/인증 처리
---

# JWT 인증 패턴 (jsonwebtoken + Axum)

> 소스: https://docs.rs/jsonwebtoken/latest/jsonwebtoken/ | https://github.com/Keats/jsonwebtoken
> 소스: https://docs.rs/axum/latest/axum/middleware/
> 검증일: 2026-04-07

> 주의: 이 문서는 jsonwebtoken 9.x / axum 0.8.x 기준으로 작성되었습니다. 버전 변경 시 API 시그니처와 기본값이 달라질 수 있으므로 공식 docs.rs를 반드시 확인하세요.

> 주의: jsonwebtoken 9.x는 내부적으로 `time ^0.3`에 의존합니다. Rust 1.84 이하 환경에서는 `time` 최신 버전이 빌드되지 않을 수 있습니다. 이 경우 `Cargo.toml`에 `time = "=0.3.36"`을 명시하거나 Rust를 1.85+로 업그레이드하세요.

---

## 의존성 설정

```toml
# Cargo.toml
[dependencies]
axum = "0.8"
axum-extra = { version = "0.10", features = ["typed-header"] }
jsonwebtoken = "9"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
chrono = { version = "0.4", features = ["serde"] }
tokio = { version = "1", features = ["full"] }
tower-http = { version = "0.6", features = ["cors"] }
dotenvy = "0.15"
```

---

## Claims 구조체 정의

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,        // subject (사용자 ID 등)
    pub exp: usize,         // 만료 시간 (UNIX timestamp)
    pub iat: usize,         // 발급 시간
    pub role: String,       // 커스텀 필드 예시
}
```

- `exp`는 UNIX timestamp (초 단위). `chrono::Utc::now().timestamp() as usize` 사용
- `sub`, `exp`는 JWT 표준 클레임. 커스텀 필드를 자유롭게 추가 가능

---

## 토큰 생성 (encode)

```rust
use jsonwebtoken::{encode, EncodingKey, Header, Algorithm};
use chrono::Utc;

pub fn create_token(user_id: &str, role: &str, secret: &[u8]) -> Result<String, jsonwebtoken::errors::Error> {
    let now = Utc::now().timestamp() as usize;
    let claims = Claims {
        sub: user_id.to_string(),
        exp: now + 3600, // 1시간 후 만료
        iat: now,
        role: role.to_string(),
    };

    // HS256 (대칭키)
    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret))
}
```

**Header::default()는 HS256을 사용합니다.**

### RS256 (비대칭키) 사용 시

```rust
use jsonwebtoken::{encode, EncodingKey, Header, Algorithm};

pub fn create_token_rsa(claims: &Claims, private_key_pem: &[u8]) -> Result<String, jsonwebtoken::errors::Error> {
    let header = Header::new(Algorithm::RS256);
    encode(&header, claims, &EncodingKey::from_rsa_pem(private_key_pem)?)
}
```

- `EncodingKey::from_rsa_pem()` — PEM 형식 RSA 개인키
- `EncodingKey::from_secret()` — 바이트 슬라이스 (HS256/HS384/HS512)

---

## 토큰 검증 (decode)

```rust
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm, TokenData};

pub fn verify_token(token: &str, secret: &[u8]) -> Result<TokenData<Claims>, jsonwebtoken::errors::Error> {
    let validation = Validation::new(Algorithm::HS256);
    // validate_exp: 기본 true — 만료된 토큰 자동 거부
    // validate_nbf: 기본 false
    // leeway: 기본 60초 — exp/nbf 판정 시 허용 오차

    decode::<Claims>(token, &DecodingKey::from_secret(secret), &validation)
}
```

### Validation 커스터마이징

```rust
let mut validation = Validation::new(Algorithm::HS256);
validation.leeway = 0;                          // 허용 오차 제거
validation.validate_exp = true;                 // 만료 검증 (기본 true)
validation.validate_nbf = true;                 // nbf 검증 활성화
validation.set_issuer(&["my-app"]);             // iss 검증
validation.set_audience(&["my-audience"]);       // aud 검증
```

> 주의: `required_spec_claims`의 기본값은 jsonwebtoken 버전에 따라 다를 수 있습니다. 9.x에서는 기본적으로 `exp`가 포함됩니다. 정확한 기본값은 해당 버전의 docs.rs를 확인하세요.

### RS256 검증

```rust
pub fn verify_token_rsa(token: &str, public_key_pem: &[u8]) -> Result<TokenData<Claims>, jsonwebtoken::errors::Error> {
    let validation = Validation::new(Algorithm::RS256);
    decode::<Claims>(token, &DecodingKey::from_rsa_pem(public_key_pem)?, &validation)
}
```

---

## 에러 처리

```rust
use jsonwebtoken::errors::ErrorKind;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Json};

pub enum AuthError {
    TokenExpired,
    InvalidToken,
    InvalidSignature,
    MissingToken,
}

impl IntoResponse for AuthError {
    fn into_response(self) -> axum::response::Response {
        let (status, message) = match self {
            AuthError::TokenExpired => (StatusCode::UNAUTHORIZED, "Token expired"),
            AuthError::InvalidToken => (StatusCode::UNAUTHORIZED, "Invalid token"),
            AuthError::InvalidSignature => (StatusCode::UNAUTHORIZED, "Invalid signature"),
            AuthError::MissingToken => (StatusCode::UNAUTHORIZED, "Missing authorization token"),
        };
        (status, Json(serde_json::json!({ "error": message }))).into_response()
    }
}

// jsonwebtoken 에러를 AuthError로 변환
impl From<jsonwebtoken::errors::Error> for AuthError {
    fn from(err: jsonwebtoken::errors::Error) -> Self {
        match err.kind() {
            ErrorKind::ExpiredSignature => AuthError::TokenExpired,
            ErrorKind::InvalidSignature => AuthError::InvalidSignature,
            ErrorKind::InvalidToken => AuthError::InvalidToken,
            ErrorKind::InvalidAlgorithm => AuthError::InvalidToken,
            ErrorKind::InvalidIssuer => AuthError::InvalidToken,
            ErrorKind::InvalidAudience => AuthError::InvalidToken,
            _ => AuthError::InvalidToken,
        }
    }
}
```

주요 `ErrorKind` 변형:
- `ExpiredSignature` — 토큰 만료
- `InvalidSignature` — 서명 불일치
- `InvalidToken` — 토큰 형식 오류
- `InvalidAlgorithm` — 알고리즘 불일치
- `InvalidIssuer` / `InvalidAudience` / `InvalidSubject` — 클레임 불일치
- `ImmatureSignature` — nbf 이전 사용 시도

---

## Axum 미들웨어로 인증 처리

### 방법 1: from_fn 미들웨어 (권장)

```rust
use axum::{
    extract::Request,
    http::header::AUTHORIZATION,
    middleware::Next,
    response::Response,
    Extension,
};

pub async fn auth_middleware(
    mut req: Request,
    next: Next,
) -> Result<Response, AuthError> {
    // Authorization 헤더에서 Bearer 토큰 추출
    let token = req
        .headers()
        .get(AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or(AuthError::MissingToken)?;

    // 환경변수에서 SECRET 로드
    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");

    // 토큰 검증
    let token_data = verify_token(token, secret.as_bytes())?;

    // Claims를 Extension으로 주입 — 핸들러에서 꺼내 쓸 수 있음
    req.extensions_mut().insert(token_data.claims);

    Ok(next.run(req).await)
}
```

### 방법 2: from_fn_with_state (State에 시크릿 포함)

```rust
use axum::extract::State;

#[derive(Clone)]
pub struct AppState {
    pub jwt_secret: String,
}

pub async fn auth_middleware_with_state(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, AuthError> {
    let token = req
        .headers()
        .get(AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or(AuthError::MissingToken)?;

    let token_data = verify_token(token, state.jwt_secret.as_bytes())?;
    req.extensions_mut().insert(token_data.claims);

    Ok(next.run(req).await)
}
```

---

## 라우터에 미들웨어 적용

```rust
use axum::{routing::get, Router, middleware};

fn create_router(state: AppState) -> Router {
    let protected = Router::new()
        .route("/profile", get(profile_handler))
        .route("/settings", get(settings_handler))
        .layer(middleware::from_fn_with_state(state.clone(), auth_middleware_with_state));

    let public = Router::new()
        .route("/login", axum::routing::post(login_handler))
        .route("/health", get(health_handler));

    Router::new()
        .merge(protected)
        .merge(public)
        .with_state(state)
}
```

**핵심:** `.layer()` 는 해당 Router에만 적용됩니다. 인증이 필요한 라우트와 공개 라우트를 분리하여 merge합니다.

---

## 핸들러에서 Claims 꺼내기

```rust
use axum::Extension;

async fn profile_handler(
    Extension(claims): Extension<Claims>,
) -> impl IntoResponse {
    Json(serde_json::json!({
        "user_id": claims.sub,
        "role": claims.role,
    }))
}
```

- 미들웨어에서 `req.extensions_mut().insert(claims)` 로 주입한 값을 `Extension<Claims>`로 추출
- Claims 타입에 `Clone` derive 필요

---

## Refresh Token 패턴 기초

```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RefreshClaims {
    pub sub: String,
    pub exp: usize,
    pub iat: usize,
    pub token_type: String, // "refresh"
}

pub fn create_refresh_token(user_id: &str, secret: &[u8]) -> Result<String, jsonwebtoken::errors::Error> {
    let now = Utc::now().timestamp() as usize;
    let claims = RefreshClaims {
        sub: user_id.to_string(),
        exp: now + 60 * 60 * 24 * 7, // 7일
        iat: now,
        token_type: "refresh".to_string(),
    };
    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret))
}
```

### 토큰 갱신 핸들러

```rust
async fn refresh_handler(
    State(state): State<AppState>,
    Json(body): Json<RefreshRequest>,
) -> Result<Json<TokenResponse>, AuthError> {
    // 1. Refresh Token 검증
    let token_data = decode::<RefreshClaims>(
        &body.refresh_token,
        &DecodingKey::from_secret(state.jwt_secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    )?;

    // 2. token_type이 "refresh"인지 확인
    if token_data.claims.token_type != "refresh" {
        return Err(AuthError::InvalidToken);
    }

    // 3. 새 Access Token 발급
    let access_token = create_token(&token_data.claims.sub, "user", state.jwt_secret.as_bytes())?;

    Ok(Json(TokenResponse { access_token }))
}
```

**Refresh Token 보안 고려사항:**
- Access Token: 짧은 만료 (15분~1시간)
- Refresh Token: 긴 만료 (7일~30일)
- Refresh Token은 DB에 저장하여 개별 무효화 가능하게 구현
- 토큰 갱신 시 이전 Refresh Token 무효화 (Rotation)

---

## 환경변수로 SECRET 관리

```rust
// .env 파일
// JWT_SECRET=your-256-bit-secret-key-here
// JWT_REFRESH_SECRET=another-secret-for-refresh-tokens (선택)

use dotenvy::dotenv;
use std::env;

fn load_jwt_config() -> (String, String) {
    dotenv().ok();
    let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let refresh_secret = env::var("JWT_REFRESH_SECRET").unwrap_or_else(|_| secret.clone());
    (secret, refresh_secret)
}
```

- `.env` 파일을 `.gitignore`에 반드시 추가
- HS256 시크릿은 최소 256비트(32바이트) 이상 권장
- 프로덕션에서는 환경변수 또는 시크릿 매니저 사용

---

## 전체 구조 요약

```
src/
├── main.rs                 # 서버 실행, 라우터 구성
├── auth/
│   ├── mod.rs
│   ├── jwt.rs              # encode/decode, Claims 정의
│   ├── middleware.rs        # auth_middleware
│   └── error.rs            # AuthError, IntoResponse 구현
├── handlers/
│   ├── mod.rs
│   ├── auth_handler.rs     # login, refresh
│   └── protected.rs        # 인증 필요 핸들러
└── state.rs                # AppState 정의
```
