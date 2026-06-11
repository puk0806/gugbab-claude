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
