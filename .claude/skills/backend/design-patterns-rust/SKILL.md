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

## Command 패턴 -- Enum 기반 커맨드

Rust에서는 enum + 패턴 매칭으로 Command 패턴을 자연스럽게 구현한다.

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum UserCommand {
    Create { name: String, email: String },
    UpdateEmail { user_id: i64, new_email: String },
    Deactivate { user_id: i64 },
    ChangeRole { user_id: i64, role: Role },
}

#[derive(Debug, Serialize, Deserialize)]
pub enum CommandResult {
    Success { message: String },
    Error { code: String, message: String },
}

pub struct CommandHandler {
    user_repo: Arc<dyn UserRepository>,
}

impl CommandHandler {
    pub async fn execute(&self, cmd: UserCommand) -> CommandResult {
        match cmd {
            UserCommand::Create { name, email } => {
                match self.user_repo.create(CreateUser { name, email }).await {
                    Ok(user) => CommandResult::Success {
                        message: format!("User {} created", user.id),
                    },
                    Err(e) => CommandResult::Error {
                        code: "CREATE_FAILED".into(),
                        message: e.to_string(),
                    },
                }
            }
            UserCommand::UpdateEmail { user_id, new_email } => {
                // ...
                todo!()
            }
            UserCommand::Deactivate { user_id } => {
                // ...
                todo!()
            }
            UserCommand::ChangeRole { user_id, role } => {
                // ...
                todo!()
            }
        }
    }
}
```

**enum Command의 장점:**
- 모든 커맨드가 한 곳에 나열됨 (exhaustive match 강제)
- serde로 직렬화/역직렬화 가능 (메시지 큐, 이벤트 소싱에 적합)
- 새 커맨드 추가 시 match에서 컴파일 에러 발생 (누락 방지)

### 실행 취소(Undo) 지원

```rust
pub trait UndoableCommand {
    fn execute(&mut self) -> Result<(), AppError>;
    fn undo(&mut self) -> Result<(), AppError>;
}

pub struct CommandHistory {
    executed: Vec<Box<dyn UndoableCommand>>,
}

impl CommandHistory {
    pub fn execute(&mut self, mut cmd: Box<dyn UndoableCommand>) -> Result<(), AppError> {
        cmd.execute()?;
        self.executed.push(cmd);
        Ok(())
    }

    pub fn undo_last(&mut self) -> Result<(), AppError> {
        if let Some(mut cmd) = self.executed.pop() {
            cmd.undo()?;
        }
        Ok(())
    }
}
```

---

## Observer 패턴 -- tokio::sync 채널 활용

Rust에서 Observer 패턴은 tokio의 비동기 채널로 구현한다.

### broadcast -- 다대다 이벤트 브로드캐스트

```rust
use tokio::sync::broadcast;

#[derive(Clone, Debug)]
pub enum AppEvent {
    UserCreated { user_id: i64 },
    OrderPlaced { order_id: i64, amount: f64 },
    SystemAlert { message: String },
}

pub struct EventBus {
    sender: broadcast::Sender<AppEvent>,
}

impl EventBus {
    pub fn new(capacity: usize) -> Self {
        let (sender, _) = broadcast::channel(capacity);
        Self { sender }
    }

    pub fn publish(&self, event: AppEvent) {
        // 수신자가 없어도 에러를 무시
        let _ = self.sender.send(event);
    }

    pub fn subscribe(&self) -> broadcast::Receiver<AppEvent> {
        self.sender.subscribe()
    }
}

// 구독자 태스크
async fn notification_listener(mut rx: broadcast::Receiver<AppEvent>) {
    while let Ok(event) = rx.recv().await {
        match event {
            AppEvent::UserCreated { user_id } => {
                println!("Send welcome email to user {user_id}");
            }
            _ => {}
        }
    }
}

// 사용
let bus = EventBus::new(100);
let rx = bus.subscribe();
tokio::spawn(notification_listener(rx));

bus.publish(AppEvent::UserCreated { user_id: 42 });
```

**broadcast 특성:**
- multi-producer, multi-consumer
- 메시지는 `Clone` 필수
- 수신자가 느리면 `RecvError::Lagged(n)` -- n개 메시지 누락
- capacity 초과 시 가장 오래된 메시지부터 제거

### watch -- 최신 상태 공유

```rust
use tokio::sync::watch;

#[derive(Clone, Debug)]
pub struct AppConfig {
    pub max_connections: usize,
    pub feature_flags: Vec<String>,
}

// 설정 변경 감시
let (tx, rx) = watch::channel(AppConfig {
    max_connections: 100,
    feature_flags: vec![],
});

// 구독자: 최신 값만 관심
async fn config_watcher(mut rx: watch::Receiver<AppConfig>) {
    while rx.changed().await.is_ok() {
        let config = rx.borrow();
        println!("Config updated: max_connections={}", config.max_connections);
    }
}

// 발행자: 설정 업데이트
tx.send(AppConfig {
    max_connections: 200,
    feature_flags: vec!["new_feature".into()],
}).unwrap();
```

**watch 특성:**
- single-producer, multi-consumer
- 항상 최신 값 하나만 보관 (중간 값 건너뛸 수 있음)
- 설정 핫리로드, 상태 공유에 적합

**채널 선택 기준:**
```
모든 이벤트를 모든 구독자에게 전달   → broadcast
최신 상태만 공유                     → watch
일대일 작업 큐                      → mpsc
일회성 결과 전달                    → oneshot
```

---

## RAII 패턴 -- Drop trait 활용 자원 관리

Resource Acquisition Is Initialization. 자원 획득은 객체 생성 시, 해제는 Drop에서 자동으로.

### 기본 Drop 구현

```rust
pub struct TempFile {
    path: std::path::PathBuf,
}

impl TempFile {
    pub fn new(path: impl Into<std::path::PathBuf>) -> std::io::Result<Self> {
        let path = path.into();
        std::fs::File::create(&path)?;
        Ok(Self { path })
    }

    pub fn path(&self) -> &std::path::Path {
        &self.path
    }
}

impl Drop for TempFile {
    fn drop(&mut self) {
        // 스코프 종료 시 자동으로 파일 삭제
        let _ = std::fs::remove_file(&self.path);
    }
}

// 사용: 스코프 벗어나면 자동 정리
{
    let tmp = TempFile::new("/tmp/work.txt").unwrap();
    // ... 파일 사용
} // 여기서 Drop::drop 자동 호출 → 파일 삭제
```

### Guard 패턴 (잠금 해제, 타이머 등)

```rust
pub struct Timer {
    label: String,
    start: std::time::Instant,
}

impl Timer {
    pub fn start(label: impl Into<String>) -> Self {
        Self {
            label: label.into(),
            start: std::time::Instant::now(),
        }
    }
}

impl Drop for Timer {
    fn drop(&mut self) {
        let elapsed = self.start.elapsed();
        tracing::info!("{}: {:?}", self.label, elapsed);
    }
}

// 사용
async fn handle_request() {
    let _timer = Timer::start("handle_request");
    // ... 처리 로직
} // 함수 종료 시 자동으로 경과 시간 출력
```

### MutexGuard (표준 라이브러리 RAII)

```rust
use std::sync::Mutex;

let data = Mutex::new(vec![1, 2, 3]);

{
    let mut guard = data.lock().unwrap(); // 잠금 획득
    guard.push(4);
} // guard가 drop되면서 자동으로 잠금 해제
```

**RAII 핵심 원칙:**
- 자원 획득 = 생성자(`new`), 자원 해제 = `Drop::drop`
- `drop()` 안에서 panic하지 말 것 (double panic 위험)
- 언더스코어 바인딩 `let _ = guard;`는 즉시 drop됨에 주의. `let _guard = guard;`로 스코프 끝까지 유지
- `ManuallyDrop<T>`로 자동 drop을 방지할 수 있음 (unsafe 필요)

---

## Extension Trait 패턴 -- 외부 타입 기능 확장

외부 크레이트 타입에 메서드를 추가하되 orphan rule을 우회하는 패턴.

```rust
// 외부 타입(String)에 메서드를 추가
pub trait StringExt {
    fn truncate_with_ellipsis(&self, max_len: usize) -> String;
    fn is_valid_email(&self) -> bool;
}

impl StringExt for str {
    fn truncate_with_ellipsis(&self, max_len: usize) -> String {
        if self.len() <= max_len {
            self.to_string()
        } else {
            format!("{}...", &self[..max_len.saturating_sub(3)])
        }
    }

    fn is_valid_email(&self) -> bool {
        self.contains('@') && self.contains('.')
    }
}

// 사용: trait을 import하면 메서드 사용 가능
use crate::StringExt;
let title = "Very long title that needs truncation".truncate_with_ellipsis(20);
```

### 실전: Iterator 확장

```rust
pub trait IteratorExt: Iterator {
    fn intersperse_with<F>(self, separator: F) -> IntersperseWith<Self, F>
    where
        Self: Sized,
        F: FnMut() -> Self::Item;
}

// itertools 크레이트가 이 패턴의 대표적 사례
// use itertools::Itertools;
// vec.iter().interleave(other.iter())
```

### Axum에서의 Extension Trait 활용

```rust
use axum::response::{IntoResponse, Response};

// Result에 편의 메서드 추가
pub trait ResultExt<T> {
    fn or_not_found(self) -> Result<T, AppError>;
    fn or_internal(self, msg: &str) -> Result<T, AppError>;
}

impl<T, E: std::fmt::Display> ResultExt<T> for Result<T, E> {
    fn or_not_found(self) -> Result<T, AppError> {
        self.map_err(|_| AppError::NotFound)
    }

    fn or_internal(self, msg: &str) -> Result<T, AppError> {
        self.map_err(|e| AppError::Internal(format!("{msg}: {e}")))
    }
}

// 핸들러에서 사용
async fn get_user(Path(id): Path<i64>) -> Result<Json<User>, AppError> {
    let user = repo.find_by_id(id).await.or_not_found()?;
    Ok(Json(user))
}
```

**Extension Trait 규칙:**
- trait 이름에 `Ext` 접미사를 붙이는 것이 관례 (`StringExt`, `IteratorExt`)
- 메서드를 사용하려면 trait을 반드시 import해야 함 (`use crate::StringExt;`)
- 표준 라이브러리 타입에 대한 확장은 prelude 모듈에 모아서 `use crate::prelude::*;`로 일괄 import

---

## 패턴 선택 가이드

```
구조체 생성이 복잡하다              → Builder
원시 타입에 의미를 부여하고 싶다     → Newtype
상태 전이를 컴파일 타임에 강제하고 싶다 → Type State
알고리즘을 런타임에 교체하고 싶다    → Strategy (dyn Trait)
요청/명령을 데이터로 다루고 싶다     → Command (enum)
이벤트를 여러 구독자에게 전달하고 싶다 → Observer (broadcast/watch)
자원 해제를 자동화하고 싶다         → RAII (Drop)
외부 타입에 메서드를 추가하고 싶다   → Extension Trait
```
