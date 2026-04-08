---
name: tokio
description: Rust 비동기 런타임 Tokio 핵심 패턴 및 API 가이드
---

# Tokio - Rust 비동기 런타임

> 소스: https://tokio.rs/ , https://docs.rs/tokio/latest/tokio/
> 검증일: 2026-04-06

---

## 버전 기준

Tokio 1.x (LTS). Cargo.toml에서 features 명시 필수:

```toml
[dependencies]
tokio = { version = "1", features = ["full"] }
```

`"full"` = `macros`, `rt-multi-thread`, `io-util`, `net`, `time`, `sync`, `fs`, `signal` 등 전체 feature 활성화.
필요한 feature만 선택 가능: `["rt", "macros", "time"]` 등.

---

## #[tokio::main] 진입점

`async fn main()`을 런타임 위에서 실행하는 매크로.

```rust
#[tokio::main]
async fn main() {
    println!("Hello from Tokio!");
}
```

**멀티스레드 런타임** (기본값):

```rust
#[tokio::main(flavor = "multi_thread", worker_threads = 4)]
async fn main() { /* ... */ }
```

**싱글스레드 런타임** (경량 환경용):

```rust
#[tokio::main(flavor = "current_thread")]
async fn main() { /* ... */ }
```

> 주의: `#[tokio::main]`은 `macros` + `rt` feature가 필수다. 기본 flavor(multi-thread) 사용 시에는 `rt-multi-thread`도 추가로 필요하다. `flavor = "current_thread"` 지정 시에는 `rt-multi-thread` 없이도 동작한다.

**매크로 없이 수동 구성:**

```rust
fn main() {
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async {
        println!("manual runtime");
    });
}
```

---

## async/await 기본 패턴

Rust의 Future는 **lazy** - `.await`하거나 `spawn`해야 실행된다.

```rust
async fn fetch_data() -> String {
    // 비동기 작업
    "data".to_string()
}

#[tokio::main]
async fn main() {
    let result = fetch_data().await;
    println!("{}", result);
}
```

**여러 Future 동시 실행:**

```rust
use tokio::join;

async fn task_a() -> u32 { 1 }
async fn task_b() -> u32 { 2 }

#[tokio::main]
async fn main() {
    // 두 태스크를 동시에 실행하고 모두 완료될 때까지 대기
    let (a, b) = tokio::join!(task_a(), task_b());
    println!("{} {}", a, b); // 1 2
}
```

**먼저 완료되는 Future 선택:**

```rust
use tokio::select;

#[tokio::main]
async fn main() {
    tokio::select! {
        val = task_a() => println!("a: {}", val),
        val = task_b() => println!("b: {}", val),
    }
    // 먼저 완료된 브랜치만 실행, 나머지는 drop
}
```

---

## tokio::spawn - 태스크 생성

독립 태스크를 런타임에 스케줄링. `JoinHandle`을 반환한다.

```rust
#[tokio::main]
async fn main() {
    let handle = tokio::spawn(async {
        // 독립 태스크
        42
    });

    let result = handle.await.unwrap(); // JoinHandle<T> -> Result<T, JoinError>
    println!("{}", result); // 42
}
```

**핵심 제약:**

- `spawn`에 전달하는 Future는 `Send + 'static` 이어야 한다.
- 로컬 참조를 캡처하려면 `move` 클로저 또는 `Arc` 사용.

```rust
let data = String::from("hello");
tokio::spawn(async move {
    println!("{}", data); // data 소유권 이동
});
```

**태스크 취소:** `JoinHandle::abort()` 호출 시 태스크가 다음 `.await` 지점에서 취소된다.

```rust
let handle = tokio::spawn(async { /* ... */ });
handle.abort();
// handle.await -> Err(JoinError::Cancelled)
```

---

## tokio::sync - 동기화 프리미티브

### Mutex

비동기 코드에서 안전한 뮤텍스. `.lock().await`로 잠금 획득.

```rust
use std::sync::Arc;
use tokio::sync::Mutex;

#[tokio::main]
async fn main() {
    let data = Arc::new(Mutex::new(0));

    let data_clone = data.clone();
    let handle = tokio::spawn(async move {
        let mut lock = data_clone.lock().await;
        *lock += 1;
    });

    handle.await.unwrap();
    println!("{}", *data.lock().await); // 1
}
```

> 주의: 잠금 구간이 짧고 `.await`를 포함하지 않는다면 `std::sync::Mutex`가 더 효율적이다. `tokio::sync::Mutex`는 잠금 구간에서 `.await`가 필요할 때 사용한다.

### RwLock

읽기 다수 / 쓰기 단독 접근.

```rust
use tokio::sync::RwLock;

let lock = RwLock::new(5);

// 읽기 (동시 여러 개 가능)
let r = lock.read().await;
println!("{}", *r);
drop(r);

// 쓰기 (단독)
let mut w = lock.write().await;
*w += 1;
```

### Channel

**mpsc** (multi-producer, single-consumer):

```rust
use tokio::sync::mpsc;

let (tx, mut rx) = mpsc::channel::<String>(32); // 버퍼 크기 32

tokio::spawn(async move {
    tx.send("hello".to_string()).await.unwrap();
});

while let Some(msg) = rx.recv().await {
    println!("{}", msg);
}
```

**oneshot** (일회성 응답):

```rust
use tokio::sync::oneshot;

let (tx, rx) = oneshot::channel::<u32>();

tokio::spawn(async move {
    tx.send(42).unwrap();
});

let value = rx.await.unwrap(); // 42
```

**broadcast** (multi-producer, multi-consumer):

```rust
use tokio::sync::broadcast;

let (tx, mut rx1) = broadcast::channel::<String>(16);
let mut rx2 = tx.subscribe();

tx.send("msg".to_string()).unwrap();
// rx1, rx2 모두 "msg" 수신
```

**watch** (최신 값 관찰):

```rust
use tokio::sync::watch;

let (tx, mut rx) = watch::channel("initial");

tx.send("updated").unwrap();
println!("{}", *rx.borrow_and_update()); // "updated"
```

---

## tokio::fs - 비동기 파일 I/O

> 주의: 내부적으로 블로킹 I/O를 별도 스레드 풀(`spawn_blocking`)에서 실행한다. `fs` feature 필요.

```rust
use tokio::fs;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    // 파일 쓰기
    fs::write("hello.txt", b"Hello, Tokio!").await?;

    // 파일 읽기
    let contents = fs::read_to_string("hello.txt").await?;
    println!("{}", contents);

    // 파일 삭제
    fs::remove_file("hello.txt").await?;

    Ok(())
}
```

**스트림 읽기/쓰기 (AsyncReadExt, AsyncWriteExt):**

```rust
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

let mut file = File::create("output.txt").await?;
file.write_all(b"line 1\n").await?;
file.flush().await?;

let mut file = File::open("output.txt").await?;
let mut contents = String::new();
file.read_to_string(&mut contents).await?;
```

**디렉토리 조작:**

```rust
fs::create_dir_all("path/to/dir").await?;
let mut entries = fs::read_dir(".").await?;
while let Some(entry) = entries.next_entry().await? {
    println!("{}", entry.file_name().to_string_lossy());
}
```

---

## tokio::time - 타임아웃 및 지연

### sleep

```rust
use tokio::time::{sleep, Duration};

sleep(Duration::from_secs(1)).await;
println!("1초 경과");
```

### timeout

Future에 시간 제한을 건다. 초과 시 `Err(Elapsed)` 반환.

```rust
use tokio::time::{timeout, Duration};

match timeout(Duration::from_secs(5), some_async_fn()).await {
    Ok(result) => println!("완료: {:?}", result),
    Err(_) => println!("타임아웃 초과"),
}
```

### interval

주기적 실행.

```rust
use tokio::time::{interval, Duration};

let mut interval = interval(Duration::from_millis(500));

loop {
    interval.tick().await;
    println!("500ms마다 실행");
}
```

> 주의: `interval`의 첫 `tick()`은 즉시 완료된다. 지연 후 시작하려면 `interval_at`을 사용한다.

```rust
use tokio::time::{interval_at, Instant, Duration};

let start = Instant::now() + Duration::from_secs(1);
let mut interval = interval_at(start, Duration::from_millis(500));
```

---

## 자주 하는 실수

| 실수 | 해결 |
|------|------|
| `spawn`에 `Send`가 아닌 값 전달 | `Arc`로 감싸거나 `spawn_local` 사용 |
| `tokio::sync::Mutex` 잠금 구간에서 `.await` 없이 사용 | `std::sync::Mutex`로 교체 (성능 향상) |
| `block_on` 안에서 `block_on` 호출 | 런타임 중첩 불가 - 구조 재설계 필요 |
| `#[tokio::test]` 미사용 | 비동기 테스트에는 `#[tokio::test]` 매크로 필요 |
| feature flag 누락 | 컴파일 에러 시 `Cargo.toml` features 확인 |
