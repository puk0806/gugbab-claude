---
name: serde
description: Rust serde + serde_json 직렬화/역직렬화 핵심 패턴
---

# Serde + serde_json

> 소스: https://serde.rs/ , https://docs.rs/serde_json/
> 검증일: 2026-04-06

---

## Cargo.toml 설정

```toml
[dependencies]
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

`features = ["derive"]`를 반드시 활성화해야 `#[derive(Serialize, Deserialize)]`를 사용할 수 있다.

---

## Serialize / Deserialize derive 매크로

```rust
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
struct User {
    name: String,
    age: u32,
    email: String,
}
```

- `Serialize`: Rust 구조체 -> 직렬화 포맷 (JSON, TOML 등)
- `Deserialize`: 직렬화 포맷 -> Rust 구조체
- derive 매크로는 모든 필드가 각각 `Serialize`/`Deserialize`를 구현해야 동작한다.
- 표준 라이브러리 타입(`String`, `Vec<T>`, `HashMap<K,V>`, `Option<T>` 등)은 이미 구현되어 있다.

---

## serde_json::to_string / from_str

### 직렬화 (Rust -> JSON)

```rust
let user = User { name: "Alice".into(), age: 30, email: "alice@example.com".into() };

// 일반 JSON 문자열
let json = serde_json::to_string(&user)?;
// {"name":"Alice","age":30,"email":"alice@example.com"}

// 보기 좋게 포맷팅
let pretty = serde_json::to_string_pretty(&user)?;
```

### 역직렬화 (JSON -> Rust)

```rust
let json = r#"{"name":"Alice","age":30,"email":"alice@example.com"}"#;
let user: User = serde_json::from_str(json)?;
```

### 바이트 슬라이스

```rust
// &[u8] -> T
let user: User = serde_json::from_slice(bytes)?;

// T -> Vec<u8>
let bytes = serde_json::to_vec(&user)?;
```

### Reader/Writer (IO 스트림)

```rust
// Read trait -> T
let user: User = serde_json::from_reader(reader)?;

// T -> Write trait
serde_json::to_writer(writer, &user)?;
serde_json::to_writer_pretty(writer, &user)?;
```

**반환 타입:** 모든 함수는 `serde_json::Result<T>`를 반환한다. `?` 연산자 또는 `unwrap()`으로 처리.

---

## serde_json::Value (동적 JSON)

구조체 없이 임의의 JSON을 다룰 때 사용한다.

```rust
use serde_json::Value;

let data: Value = serde_json::from_str(r#"{"name":"Alice","age":30}"#)?;

// 인덱스 접근 (존재하지 않으면 Value::Null 반환)
println!("{}", data["name"]);    // "Alice"
println!("{}", data["age"]);     // 30
println!("{}", data["missing"]); // null
```

### json! 매크로

```rust
use serde_json::json;

let value = json!({
    "name": "Alice",
    "age": 30,
    "tags": ["rust", "serde"],
    "address": {
        "city": "Seoul"
    }
});
```

### Value 변형(variant)

```rust
enum Value {
    Null,
    Bool(bool),
    Number(Number),
    String(String),
    Array(Vec<Value>),
    Object(Map<String, Value>),
}
```

### Value에서 Rust 타입으로 변환

```rust
// as_ 메서드 (Option 반환)
data["name"].as_str();   // Option<&str>
data["age"].as_u64();    // Option<u64>
data["age"].as_i64();    // Option<i64>
data["age"].as_f64();    // Option<f64>
data["flag"].as_bool();  // Option<bool>
data["arr"].as_array();  // Option<&Vec<Value>>
data["obj"].as_object(); // Option<&Map<String, Value>>

// Value -> 구조체 (serde_json::from_value)
let user: User = serde_json::from_value(value)?;

// 구조체 -> Value (serde_json::to_value)
let value = serde_json::to_value(&user)?;
```

---

## 필드 이름 변환

### rename (개별 필드)

```rust
#[derive(Serialize, Deserialize)]
struct User {
    #[serde(rename = "userName")]
    user_name: String,

    // 직렬화/역직렬화 각각 다른 이름
    #[serde(rename(serialize = "output_name", deserialize = "input_name"))]
    name: String,
}
```

### rename_all (전체 필드 일괄 변환)

```rust
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ApiResponse {
    user_name: String,     // JSON: "userName"
    created_at: String,    // JSON: "createdAt"
}
```

**지원되는 rename_all 규칙:**

| 값 | 입력 `user_name` -> 출력 |
|----|--------------------------|
| `"camelCase"` | `userName` |
| `"PascalCase"` | `UserName` |
| `"snake_case"` | `user_name` |
| `"SCREAMING_SNAKE_CASE"` | `USER_NAME` |
| `"kebab-case"` | `user-name` |
| `"SCREAMING-KEBAB-CASE"` | `USER-NAME` |
| `"lowercase"` | `username` |
| `"UPPERCASE"` | `USERNAME` |

---

## 선택적 필드

### skip_serializing_if

조건에 따라 직렬화에서 필드를 제외한다.

```rust
#[derive(Serialize, Deserialize)]
struct Config {
    name: String,

    // None이면 JSON 출력에서 제외
    #[serde(skip_serializing_if = "Option::is_none")]
    description: Option<String>,

    // 빈 Vec이면 제외 + 역직렬화 시 필드 없어도 허용
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    tags: Vec<String>,

    // 커스텀 함수 사용 + 역직렬화 시 필드 없어도 허용
    #[serde(default, skip_serializing_if = "is_zero")]
    count: u32,
}

fn is_zero(v: &u32) -> bool {
    *v == 0
}

// 주의: skip_serializing_if는 직렬화에만 영향을 준다.
// Option<T> 필드는 Serde가 특수 처리하여 #[serde(default)] 없이도 누락 시 자동으로 None으로 처리된다.
// Option<T> 외 타입(String, u32, Vec<T> 등)에서 필드 누락을 허용하려면 #[serde(default)]를 반드시 함께 써야 한다.
```

### default (역직렬화 시 기본값)

JSON에 필드가 없을 때 기본값을 사용한다.

```rust
#[derive(Serialize, Deserialize)]
struct Config {
    name: String,

    // 필드 없으면 Default::default() 사용 (u32는 0)
    #[serde(default)]
    retry_count: u32,

    // 커스텀 기본값 함수
    #[serde(default = "default_timeout")]
    timeout: u64,
}

fn default_timeout() -> u64 {
    30
}
```

### skip / skip_serializing / skip_deserializing

```rust
#[derive(Serialize, Deserialize)]
struct Internal {
    pub name: String,

    #[serde(skip)]                  // 직렬화, 역직렬화 모두 제외
    cache: Vec<u8>,

    #[serde(skip_serializing)]      // 직렬화만 제외
    password: String,

    #[serde(skip_deserializing)]    // 역직렬화만 제외
    computed: String,
}
```

`skip`, `skip_deserializing` 사용 시 해당 필드는 `Default` trait 구현이 필요하다.

---

## 중첩 구조체 직렬화

```rust
#[derive(Serialize, Deserialize, Debug)]
struct Address {
    city: String,
    zip: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct Company {
    name: String,
    address: Address,
}

#[derive(Serialize, Deserialize, Debug)]
struct Employee {
    name: String,
    company: Company,
    skills: Vec<String>,
}
```

```json
{
  "name": "Alice",
  "company": {
    "name": "Acme",
    "address": {
      "city": "Seoul",
      "zip": "06000"
    }
  },
  "skills": ["rust", "typescript"]
}
```

### flatten (중첩 펼치기)

```rust
#[derive(Serialize, Deserialize)]
struct Pagination {
    page: u32,
    per_page: u32,
}

#[derive(Serialize, Deserialize)]
struct UserQuery {
    name: String,

    #[serde(flatten)]
    pagination: Pagination,
}
// JSON: {"name":"Alice","page":1,"per_page":20}
// (pagination 키 없이 필드가 상위에 펼쳐짐)
```

### flatten + 나머지 필드 캡처

```rust
use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
struct Known {
    name: String,
    age: u32,

    #[serde(flatten)]
    extra: HashMap<String, serde_json::Value>,
}
// 정의되지 않은 필드가 extra에 자동 수집됨
```

---

## 자주 쓰는 컨테이너 속성 요약

| 속성 | 위치 | 용도 |
|------|------|------|
| `rename_all` | 구조체/열거형 | 전체 필드명 규칙 변환 |
| `deny_unknown_fields` | 구조체 | 정의되지 않은 필드가 있으면 에러 |
| `tag` | 열거형 | 태그 기반 직렬화 (`"type": "variant"`) |
| `untagged` | 열거형 | 태그 없이 내용만으로 variant 판별 |
| `content` | 열거형 | `tag`와 함께 사용. 데이터를 별도 키에 |
| `default` | 구조체 | 모든 필드에 Default 적용 |

---

## Enum 직렬화 표현

```rust
#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
enum Message {
    Text { body: String },
    Image { url: String, width: u32 },
}
// {"type":"Text","body":"hello"}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
enum Event {
    Click { x: i32, y: i32 },
    KeyPress(char),
}
// {"type":"Click","data":{"x":10,"y":20}}

#[derive(Serialize, Deserialize)]
#[serde(untagged)]
enum StringOrInt {
    Str(String),
    Int(i64),
}
// "hello" 또는 42 (태그 없이 값으로 판별)
```

> 주의: `untagged` enum은 variant 순서대로 역직렬화를 시도하므로, 먼저 매치되는 variant가 선택된다. 순서에 주의할 것.
