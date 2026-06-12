---
name: design-patterns-rust
description: Rust 디자인 패턴 8종 - Builder, Newtype, Type State, Strategy, Command, Observer, RAII, Extension Trait
---

# Rust 디자인 패턴

> 소스: https://rust-unofficial.github.io/patterns/ | https://doc.rust-lang.org/book/ | https://docs.rs/tokio/latest/tokio/sync/ | https://docs.rs/derive_builder/latest/derive_builder/
> 검증일: 2026-04-07

> 주의: 코드 예제는 Rust 1.75+ stable 기준입니다. derive_builder 버전은 0.20.x 기준이며, API가 변경될 수 있습니다.

---

## Builder 패턴 -- 복잡한 구조체 생성

구조체 필드가 많거나 선택적 필드가 있을 때 가독성 높은 생성 인터페이스를 제공한다.

### 수동 Builder

```rust
pub struct Request {
    url: String,
    method: String,
    headers: Vec<(String, String)>,
    body: Option<String>,
}

pub struct RequestBuilder {
    url: String,
    method: String,
    headers: Vec<(String, String)>,
    body: Option<String>,
}

impl RequestBuilder {
    pub fn new(url: impl Into<String>) -> Self {
        Self {
            url: url.into(),
            method: "GET".to_string(),
            headers: Vec::new(),
            body: None,
        }
    }

    pub fn method(mut self, method: impl Into<String>) -> Self {
        self.method = method.into();
        self
    }

    pub fn header(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.headers.push((key.into(), value.into()));
        self
    }

    pub fn body(mut self, body: impl Into<String>) -> Self {
        self.body = Some(body.into());
        self
    }

    pub fn build(self) -> Request {
        Request {
            url: self.url,
            method: self.method,
            headers: self.headers,
            body: self.body,
        }
    }
}

// 사용
let req = RequestBuilder::new("https://api.example.com")
    .method("POST")
    .header("Content-Type", "application/json")
    .body(r#"{"key": "value"}"#)
    .build();
```

**핵심 규칙:**
- `self`를 소비하는 방식(consuming)과 `&mut self` 방식(non-consuming) 모두 관용적으로 사용된다
  - consuming: one-liner 체이닝에 적합 (`Builder::new().a().b().build()`)
  - non-consuming: 다단계 구성·조건부 설정에 적합, `derive_builder`의 기본 방식

> 주의: consuming self 방식이 "더 일반적"이라고 단정할 수 없다. 대형 크레이트(reqwest, hyper)는 `&mut self` 방식을 선호한다.

- 필수 파라미터는 `new()`에, 선택 파라미터는 메서드 체이닝으로
- `build()`에서 유효성 검사 후 `Result<T, E>` 반환 가능

### derive_builder 크레이트

```rust
// Cargo.toml: derive_builder = "0.20"
use derive_builder::Builder;

#[derive(Builder, Debug)]
#[builder(setter(into))]
pub struct ServerConfig {
    host: String,
    port: u16,
    #[builder(default = "4")]
    max_connections: usize,
    #[builder(default)]
    tls_enabled: bool,
    #[builder(setter(strip_option), default)]
    cert_path: Option<String>,
}

// 사용
let config = ServerConfigBuilder::default()
    .host("0.0.0.0")
    .port(8080)
    .max_connections(16)
    .cert_path("/path/to/cert.pem")
    .build()
    .unwrap(); // Result<ServerConfig, ServerConfigBuilderError>
```

**derive_builder 주요 속성:**
- `#[builder(setter(into))]`: setter에 `impl Into<T>` 적용
- `#[builder(default)]`: `Default::default()` 사용
- `#[builder(default = "expr")]`: 커스텀 기본값
- `#[builder(setter(strip_option))]`: `Option<T>` 필드에 `T`만 받기
- `build()`는 항상 `Result`를 반환 (필수 필드 누락 시 에러)

---

## Newtype 패턴 -- 타입 안전성 강화

기본 타입을 감싸서 의미를 부여하고, 잘못된 타입 대입을 컴파일 타임에 방지한다.

```rust
// 문제: user_id와 post_id 모두 i64라 실수로 바꿔 넣을 수 있음
// fn get_post(user_id: i64, post_id: i64) -> Post

// Newtype으로 해결
pub struct UserId(pub i64);
pub struct PostId(pub i64);

fn get_post(user_id: UserId, post_id: PostId) -> Post {
    // user_id.0, post_id.0 으로 내부 값 접근
    todo!()
}

// 컴파일 에러: UserId와 PostId를 바꿔 넣으면 타입 불일치
// get_post(PostId(1), UserId(2)); // ERROR
```

### Deref로 내부 타입 메서드 노출

```rust
use std::ops::Deref;

pub struct Email(String);

impl Email {
    pub fn new(value: impl Into<String>) -> Result<Self, &'static str> {
        let s = value.into();
        if s.contains('@') {
            Ok(Self(s))
        } else {
            Err("invalid email")
        }
    }
}

impl Deref for Email {
    type Target = str;
    fn deref(&self) -> &str {
        &self.0
    }
}

// email.len(), email.contains("@") 등 &str 메서드 직접 사용 가능
```

### 외부 타입 Wrapping (orphan rule 우회)

```rust
// 외부 크레이트의 타입에 외부 trait을 직접 구현할 수 없음 (orphan rule)
// Newtype으로 감싸면 내 타입이 되므로 구현 가능
pub struct AppVec(pub Vec<String>);

impl std::fmt::Display for AppVec {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}
```

### serde 연동

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UserId(pub i64);

// JSON에서 i64로 자동 직렬화/역직렬화
// {"user_id": 42} → UserId(42)
```

---

## Type State 패턴 -- 컴파일 타임 상태 검증

제네릭 타입 파라미터로 상태를 표현하여, 잘못된 상태 전이를 컴파일 타임에 차단한다.

```rust
use std::marker::PhantomData;

// 상태를 나타내는 마커 타입 (ZST: Zero-Sized Type)
pub struct Draft;
pub struct Published;

pub struct Article<State> {
    title: String,
    content: String,
    _state: PhantomData<State>,
}

// Draft 상태에서만 가능한 메서드
impl Article<Draft> {
    pub fn new(title: impl Into<String>) -> Self {
        Self {
            title: title.into(),
            content: String::new(),
            _state: PhantomData,
        }
    }

    pub fn set_content(mut self, content: impl Into<String>) -> Self {
        self.content = content.into();
        self
    }

    // 상태 전이: Draft → Published
    pub fn publish(self) -> Article<Published> {
        Article {
            title: self.title,
            content: self.content,
            _state: PhantomData,
        }
    }
}

// Published 상태에서만 가능한 메서드
impl Article<Published> {
    pub fn title(&self) -> &str {
        &self.title
    }

    pub fn content(&self) -> &str {
        &self.content
    }
}

// 사용
let article = Article::<Draft>::new("Hello")
    .set_content("World")
    .publish(); // Draft → Published

// article.set_content("change"); // 컴파일 에러: Published에는 set_content 없음
println!("{}", article.title());
```

**PhantomData 역할:**
- 실제 메모리를 차지하지 않음 (ZST)
- 컴파일러에게 "이 구조체는 State 타입과 관련있다"고 알림
- 제네릭 파라미터가 필드에서 사용되지 않을 때 필수

---

## Strategy 패턴 -- Trait으로 행동 추상화

trait을 인터페이스로 사용해 런타임에 알고리즘을 교체한다.

### 동적 디스패치 (dyn Trait)

```rust
pub trait Compressor: Send + Sync {
    fn compress(&self, data: &[u8]) -> Vec<u8>;
    fn name(&self) -> &str;
}

pub struct GzipCompressor;
pub struct ZstdCompressor;

impl Compressor for GzipCompressor {
    fn compress(&self, data: &[u8]) -> Vec<u8> {
        // gzip 압축 로직
        todo!()
    }
    fn name(&self) -> &str { "gzip" }
}

impl Compressor for ZstdCompressor {
    fn compress(&self, data: &[u8]) -> Vec<u8> {
        // zstd 압축 로직
        todo!()
    }
    fn name(&self) -> &str { "zstd" }
}

pub struct FileProcessor {
    compressor: Box<dyn Compressor>,
}

impl FileProcessor {
    pub fn new(compressor: Box<dyn Compressor>) -> Self {
        Self { compressor }
    }

    pub fn process(&self, data: &[u8]) -> Vec<u8> {
        println!("Using {} compressor", self.compressor.name());
        self.compressor.compress(data)
    }
}

// 런타임에 전략 선택
let processor = match format {
    "gzip" => FileProcessor::new(Box::new(GzipCompressor)),
    "zstd" => FileProcessor::new(Box::new(ZstdCompressor)),
    _ => panic!("unknown format"),
};
```

### 정적 디스패치 (제네릭)

```rust
pub struct FileProcessor<C: Compressor> {
    compressor: C,
}

impl<C: Compressor> FileProcessor<C> {
    pub fn new(compressor: C) -> Self {
        Self { compressor }
    }

    pub fn process(&self, data: &[u8]) -> Vec<u8> {
        self.compressor.compress(data)
    }
}

// 컴파일 타임에 전략 결정 -- 인라이닝 가능, 제로 비용
let processor = FileProcessor::new(GzipCompressor);
```

**판단 기준:**
- 런타임에 전략을 바꿔야 함 → `Box<dyn Trait>` (동적)
- 컴파일 타임에 결정, 성능 중요 → 제네릭 (정적)
- 웹 서버 AppState에서 여러 전략 보관 → `Arc<dyn Trait>` (공유 + 동적)

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
