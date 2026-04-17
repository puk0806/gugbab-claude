---
name: dotenvy
description: Rust 환경변수 관리 - dotenvy(.env 로드) + envy(타입 안전 매핑) 조합 패턴
---

# dotenvy + envy 환경변수 관리

> 소스: https://docs.rs/dotenvy/ | https://docs.rs/envy/ | https://github.com/allan2/dotenvy | https://github.com/softprops/envy
> 검증일: 2026-04-06

> 주의: dotenvy는 0.15.x, envy는 0.4.x 기준으로 작성되었습니다. dotenvy는 기존 `dotenv` 크레이트의 유지 보수 포크입니다.

---

## Cargo.toml 설정

```toml
[dependencies]
dotenvy = "0.15"
envy = "0.4"
serde = { version = "1", features = ["derive"] }
```

---

## .env 파일 예시

```env
# .env
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxx
SERVER_HOST=0.0.0.0
SERVER_PORT=3000
LOG_LEVEL=info
MAX_CONNECTIONS=100
ENABLE_DEBUG=false
```

> 주의: `.env` 파일은 `.gitignore`에 반드시 추가한다. API 키 등 민감 정보가 포함되므로 버전 관리에 절대 포함하지 않는다.

---

## dotenvy::dotenv() - .env 파일 로드

```rust
use dotenvy::dotenv;

fn main() {
    // .env 파일을 로드하여 환경변수로 설정
    // 현재 디렉토리부터 상위로 탐색하며 .env 파일을 찾는다
    dotenv().ok(); // .env 없어도 패닉하지 않음

    // 개별 환경변수 읽기
    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
}
```

### dotenv() vs dotenv_override()

| 함수 | 동작 |
|------|------|
| `dotenv()` | 이미 설정된 환경변수는 유지 (덮어쓰지 않음) |
| `dotenv_override()` | .env 값으로 기존 환경변수를 덮어씀 |

### 커스텀 파일명

```rust
use dotenvy::from_filename;

// .env.production 등 다른 파일 로드
from_filename(".env.production").ok();
```

---

## envy::from_env - 타입 안전 매핑

환경변수를 serde `Deserialize` 구조체에 자동 매핑한다. 환경변수 이름(대문자+언더스코어)을 필드명(소문자+언더스코어)으로 자동 변환한다.

```rust
use serde::Deserialize;

#[derive(Deserialize, Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub claude_api_key: String,
    pub server_host: String,
    pub server_port: u16,
    pub log_level: String,
    pub max_connections: u32,
    pub enable_debug: bool,
}

fn load_config() -> Config {
    dotenvy::dotenv().ok();
    envy::from_env::<Config>().expect("Failed to parse environment variables")
}
```

**매핑 규칙:** `DATABASE_URL` 환경변수 -> `database_url` 필드로 자동 매핑된다.

---

## #[serde(default)] 기본값 설정

```rust
use serde::Deserialize;

#[derive(Deserialize, Debug, Clone)]
pub struct Config {
    pub database_url: String,       // 필수 - 없으면 에러

    #[serde(default = "default_host")]
    pub server_host: String,        // 기본값: "127.0.0.1"

    #[serde(default = "default_port")]
    pub server_port: u16,           // 기본값: 3000

    #[serde(default)]
    pub enable_debug: bool,         // 기본값: false (bool의 Default)

    #[serde(default)]
    pub log_level: Option<String>,  // Option 필드는 None이 기본값
}

fn default_host() -> String {
    "127.0.0.1".to_string()
}

fn default_port() -> u16 {
    3000
}
```

### 기본값 패턴 정리

| 방식 | 설명 |
|------|------|
| `#[serde(default)]` | 타입의 `Default` trait 구현값 사용 |
| `#[serde(default = "함수명")]` | 지정한 함수의 반환값 사용 |
| `Option<T>` | 환경변수 미설정 시 `None` |

---

## envy::prefixed - 접두사 기반 필터링

```rust
use serde::Deserialize;

#[derive(Deserialize, Debug, Clone)]
pub struct DbConfig {
    pub url: String,        // DB_URL 에서 매핑
    pub max_connections: u32, // DB_MAX_CONNECTIONS 에서 매핑
}

fn load_db_config() -> DbConfig {
    dotenvy::dotenv().ok();
    envy::prefixed("DB_")
        .from_env::<DbConfig>()
        .expect("Failed to parse DB config")
}
```

```env
# .env
DB_URL=postgres://localhost/mydb
DB_MAX_CONNECTIONS=50
```

---

## Axum State에 Config 주입 패턴

```rust
use axum::{Router, routing::get, extract::State};
use serde::Deserialize;
use std::sync::Arc;
use tokio::net::TcpListener;

#[derive(Deserialize, Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub claude_api_key: String,
    #[serde(default = "default_port")]
    pub server_port: u16,
}

fn default_port() -> u16 { 3000 }

// Arc로 감싸서 State에 주입
type AppState = Arc<Config>;

async fn health_handler(State(config): State<AppState>) -> String {
    format!("Server running on port {}", config.server_port)
}

async fn api_handler(State(config): State<AppState>) -> String {
    // config.claude_api_key 등 활용
    "ok".to_string()
}

#[tokio::main]
async fn main() {
    // 1. .env 로드 + Config 파싱
    dotenvy::dotenv().ok();
    let config = envy::from_env::<Config>().expect("Failed to load config");
    let port = config.server_port;
    let state = Arc::new(config);

    // 2. Router에 State 주입
    let app = Router::new()
        .route("/health", get(health_handler))
        .route("/api", get(api_handler))
        .with_state(state);

    // 3. 서버 실행
    let addr = format!("0.0.0.0:{}", port);
    let listener = TcpListener::bind(&addr).await.unwrap();
    println!("Listening on {}", addr);
    axum::serve(listener, app).await.unwrap();
}
```

### Config 모듈 분리 패턴

실제 프로젝트에서는 Config를 별도 모듈로 분리한다.

```rust
// src/config.rs
use serde::Deserialize;

#[derive(Deserialize, Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub claude_api_key: String,

    #[serde(default = "default_host")]
    pub server_host: String,

    #[serde(default = "default_port")]
    pub server_port: u16,
}

fn default_host() -> String { "0.0.0.0".to_string() }
fn default_port() -> u16 { 3000 }

impl Config {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();
        envy::from_env::<Self>().expect("Failed to load config from environment")
    }
}
```

```rust
// src/main.rs
mod config;

use config::Config;
use std::sync::Arc;

#[tokio::main]
async fn main() {
    let config = Config::from_env();
    let state = Arc::new(config);
    // ... Router 구성
}
```

---

## 에러 핸들링

```rust
fn load_config() -> Result<Config, Box<dyn std::error::Error>> {
    // dotenvy 에러: .env 파일 없음 등
    if let Err(e) = dotenvy::dotenv() {
        eprintln!("Warning: .env file not found: {}", e);
        // .env 없이도 시스템 환경변수로 동작 가능하므로 에러가 아닐 수 있음
    }

    // envy 에러: 필수 환경변수 누락, 타입 변환 실패 등
    let config = envy::from_env::<Config>()
        .map_err(|e| format!("Environment variable error: {}", e))?;

    Ok(config)
}
```

envy에서 자주 발생하는 에러:

| 상황 | 에러 메시지 예시 |
|------|-----------------|
| 필수 필드 누락 | `missing value for field 'database_url'` |
| 타입 변환 실패 | `invalid type: string "abc", expected u16` for `server_port` |
| bool 변환 | `"true"`, `"false"`, `"1"`, `"0"` 지원 |

---

## 테스트에서 환경변수 설정

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn test_config_parsing() {
        // 테스트용 환경변수 설정
        env::set_var("DATABASE_URL", "postgres://test");
        env::set_var("CLAUDE_API_KEY", "test-key");
        env::set_var("SERVER_PORT", "8080");

        let config = envy::from_env::<Config>().unwrap();
        assert_eq!(config.server_port, 8080);

        // 정리
        env::remove_var("DATABASE_URL");
        env::remove_var("CLAUDE_API_KEY");
        env::remove_var("SERVER_PORT");
    }
}
```

> 주의: `env::set_var`는 Rust Edition 2024(rustc 1.85.0, 2025-02-20 stable)부터 `unsafe`로 변경되었습니다. Edition 2024 프로젝트에서는 `unsafe` 블록으로 감싸거나 `temp_env` 등의 크레이트 사용을 고려하세요.
