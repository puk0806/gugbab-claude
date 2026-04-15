---
name: multipart-upload
description: Axum Multipart 파일 업로드 처리 — 필드 구분, 바이트 읽기, 파일 타입별 처리, 크기 제한, 에러 처리
---

# Axum Multipart 파일 업로드

> 소스: https://docs.rs/axum/latest/axum/extract/struct.Multipart.html
> 소스: https://docs.rs/axum/latest/axum/extract/struct.DefaultBodyLimit.html
> 검증일: 2026-04-06

> 주의: axum 0.8.x 기준입니다. `Multipart`는 기본 feature가 아니므로 `Cargo.toml`에 반드시 명시해야 합니다.

```toml
axum = { version = "0.8", features = ["multipart"] }
```

---

## 1. 기본 Multipart 추출

`axum::extract::Multipart`는 `multipart/form-data` 요청 바디를 파싱하는 extractor이다.

```rust
use axum::{
    extract::Multipart,
    routing::post,
    Router,
};

async fn upload(mut multipart: Multipart) {
    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap_or("unknown").to_string();
        let data = field.bytes().await.unwrap();
        println!("Field `{}`: {} bytes", name, data.len());
    }
}

let app = Router::new().route("/upload", post(upload));
```

**핵심 규칙:**
- `Multipart`는 `mut`으로 받아야 한다 (내부 상태가 변경됨)
- `next_field()`는 `Option<Field>`를 반환 — `None`이면 모든 필드 소진
- 각 `Field`는 한 번만 소비 가능 (bytes/text/chunk 중 하나만 호출)

---

## 2. 파일 필드 vs 텍스트 필드 구분

`Field` 구조체의 메서드로 필드 종류를 판별한다.

| 메서드 | 반환 타입 | 설명 |
|--------|-----------|------|
| `name()` | `Option<&str>` | 폼 필드 이름 (`<input name="...">`) |
| `file_name()` | `Option<&str>` | 파일명 (파일 필드에만 존재) |
| `content_type()` | `Option<&str>` | MIME 타입 (파일 필드에만 존재) |
| `text()` | `Result<String, Error>` | 필드를 문자열로 소비 |
| `bytes()` | `Result<Bytes, Error>` | 필드를 바이트로 소비 |
| `chunk()` | `Result<Option<Bytes>, Error>` | 스트리밍 방식으로 청크 단위 읽기 |

```rust
async fn upload(mut multipart: Multipart) {
    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap_or("unknown").to_string();

        if let Some(file_name) = field.file_name() {
            // 파일 필드
            let file_name = file_name.to_string();
            let content_type = field.content_type()
                .unwrap_or("application/octet-stream")
                .to_string();
            let data = field.bytes().await.unwrap();
            println!("File: {} ({}, {} bytes)", file_name, content_type, data.len());
        } else {
            // 텍스트 필드
            let value = field.text().await.unwrap();
            println!("Text field `{}`: {}", name, value);
        }
    }
}
```

**판별 기준:** `file_name()`이 `Some`이면 파일, `None`이면 텍스트 필드이다.

---

## 3. 파일 바이트 읽기 — 한 번에 vs 스트리밍

### 한 번에 읽기 (작은 파일)

```rust
let data: Bytes = field.bytes().await?;
```

### 스트리밍 읽기 (대용량 파일)

메모리를 절약하려면 `chunk()`로 청크 단위 처리한다.

```rust
use tokio::io::AsyncWriteExt;
use tokio::fs::File;

async fn stream_to_file(field: &mut axum::extract::multipart::Field<'_>, path: &str) -> Result<u64, std::io::Error> {
    let mut file = File::create(path).await?;
    let mut total: u64 = 0;

    while let Some(chunk) = field.chunk().await.map_err(|e| {
        std::io::Error::new(std::io::ErrorKind::Other, e)
    })? {
        file.write_all(&chunk).await?;
        total += chunk.len() as u64;
    }

    file.flush().await?;
    Ok(total)
}
```

> 주의: `chunk()` 기반 스트리밍은 `Field`의 `&mut` 참조가 필요합니다. 소유권 이동 후에는 사용할 수 없습니다.

---

## 4. PDF / txt / Word 파일 처리 패턴

MIME 타입 또는 확장자로 파일 종류를 구분한다.

| 파일 타입 | Content-Type | 확장자 |
|-----------|-------------|--------|
| PDF | `application/pdf` | `.pdf` |
| Plain Text | `text/plain` | `.txt` |
| Word (docx) | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `.docx` |
| Word (doc) | `application/msword` | `.doc` |

```rust
use std::path::Path;

async fn handle_upload(mut multipart: Multipart) -> Result<String, (StatusCode, String)> {
    while let Some(field) = multipart.next_field().await
        .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?
    {
        let Some(file_name) = field.file_name().map(|s| s.to_string()) else {
            continue; // 텍스트 필드는 건너뜀
        };

        let content_type = field.content_type()
            .unwrap_or("application/octet-stream")
            .to_string();

        // MIME 타입 기반 허용 목록
        let allowed = [
            "application/pdf",
            "text/plain",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
        ];

        if !allowed.contains(&content_type.as_str()) {
            return Err((
                StatusCode::UNSUPPORTED_MEDIA_TYPE,
                format!("Unsupported file type: {}", content_type),
            ));
        }

        // 확장자 이중 검증 (클라이언트가 Content-Type을 위조할 수 있음)
        let ext = Path::new(&file_name)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("");
        let allowed_ext = ["pdf", "txt", "docx", "doc"];
        if !allowed_ext.contains(&ext) {
            return Err((
                StatusCode::UNSUPPORTED_MEDIA_TYPE,
                format!("Unsupported extension: .{}", ext),
            ));
        }

        let data = field.bytes().await
            .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

        // 파일 저장 또는 처리
        let save_path = format!("./uploads/{}", file_name);
        tokio::fs::write(&save_path, &data).await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }

    Ok("Upload complete".to_string())
}
```

> 주의: Content-Type은 클라이언트가 임의로 설정할 수 있으므로, 확장자 검증과 매직 바이트 검증을 병행하는 것을 권장합니다.

---

## 5. 파일 크기 제한

### DefaultBodyLimit (Axum 내장)

Axum은 기본적으로 요청 바디 크기를 **2MB**로 제한한다.

```rust
use axum::extract::DefaultBodyLimit;

// 라우터 전체에 적용
let app = Router::new()
    .route("/upload", post(upload))
    .layer(DefaultBodyLimit::max(10 * 1024 * 1024)); // 10MB

// 특정 라우트에만 적용
let app = Router::new()
    .route("/upload", post(upload))
    .route_layer(DefaultBodyLimit::max(50 * 1024 * 1024)); // 50MB

// 제한 해제 (권장하지 않음)
let app = Router::new()
    .route("/upload", post(upload))
    .layer(DefaultBodyLimit::disable());
```

### Tower RequestBodyLimitLayer (대안)

```rust
use tower_http::limit::RequestBodyLimitLayer;

let app = Router::new()
    .route("/upload", post(upload))
    .layer(RequestBodyLimitLayer::new(10 * 1024 * 1024));
```

**DefaultBodyLimit vs RequestBodyLimitLayer:**
- `DefaultBodyLimit`는 Axum 내장으로 `Multipart`, `Json`, `Bytes` 등 모든 extractor에 적용
- `RequestBodyLimitLayer`는 Tower 미들웨어로 `http_body_util::Limited`를 사용
- 둘 다 적용 시 `DefaultBodyLimit`가 우선

### 핸들러 내 수동 검증

```rust
async fn upload(mut multipart: Multipart) -> Result<String, (StatusCode, String)> {
    const MAX_FILE_SIZE: usize = 10 * 1024 * 1024; // 10MB

    while let Some(field) = multipart.next_field().await
        .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?
    {
        let data = field.bytes().await
            .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

        if data.len() > MAX_FILE_SIZE {
            return Err((
                StatusCode::PAYLOAD_TOO_LARGE,
                "File exceeds 10MB limit".to_string(),
            ));
        }
    }
    Ok("OK".to_string())
}
```

---

## 6. 에러 처리

### MultipartError 주요 원인

> 주의: `MultipartError`는 `multer::Error`를 래핑한 단일 구조체로 공개 variant가 없다.
> 에러는 `.to_string()`으로 메시지 처리하거나, extractor 레벨은 `MultipartRejection`으로 구분한다.

| 상황 | 처리 방법 |
|------|-----------|
| Content-Type이 multipart가 아님 | `MultipartRejection::InvalidBoundary` (extractor 레벨) |
| 바디 크기 초과 | 연결 종료 또는 `.to_string()`으로 확인 |
| 필드 읽기 실패 | `.map_err(\|e\| e.to_string())` |
| 불완전한 multipart 데이터 | `.to_string()`으로 에러 메시지 처리 |

### 구조화된 에러 핸들링

```rust
use axum::{
    extract::Multipart,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;

enum UploadError {
    MultipartError(String),
    FileTooLarge { max: usize, actual: usize },
    UnsupportedType(String),
    IoError(std::io::Error),
}

impl IntoResponse for UploadError {
    fn into_response(self) -> axum::response::Response {
        let (status, message) = match self {
            Self::MultipartError(msg) => (StatusCode::BAD_REQUEST, msg),
            Self::FileTooLarge { max, actual } => (
                StatusCode::PAYLOAD_TOO_LARGE,
                format!("File size {}B exceeds limit {}B", actual, max),
            ),
            Self::UnsupportedType(t) => (
                StatusCode::UNSUPPORTED_MEDIA_TYPE,
                format!("Unsupported: {}", t),
            ),
            Self::IoError(e) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("IO error: {}", e),
            ),
        };
        (status, Json(json!({ "error": message }))).into_response()
    }
}

async fn upload(mut multipart: Multipart) -> Result<Json<serde_json::Value>, UploadError> {
    let mut files: Vec<String> = vec![];

    while let Some(field) = multipart.next_field().await
        .map_err(|e| UploadError::MultipartError(e.to_string()))?
    {
        let file_name = match field.file_name() {
            Some(name) => name.to_string(),
            None => continue,
        };

        let data = field.bytes().await
            .map_err(|e| UploadError::MultipartError(e.to_string()))?;

        if data.len() > 10 * 1024 * 1024 {
            return Err(UploadError::FileTooLarge {
                max: 10 * 1024 * 1024,
                actual: data.len(),
            });
        }

        tokio::fs::write(format!("./uploads/{}", file_name), &data)
            .await
            .map_err(UploadError::IoError)?;

        files.push(file_name);
    }

    Ok(Json(json!({ "uploaded": files })))
}
```

---

## 7. 종합 예제 — 완전한 파일 업로드 서버

```rust
use axum::{
    extract::{DefaultBodyLimit, Multipart},
    http::StatusCode,
    response::Json,
    routing::post,
    Router,
};
use serde_json::{json, Value};
use std::path::Path;
use tokio::net::TcpListener;

const MAX_BODY_SIZE: usize = 50 * 1024 * 1024; // 50MB
const UPLOAD_DIR: &str = "./uploads";

#[tokio::main]
async fn main() {
    tokio::fs::create_dir_all(UPLOAD_DIR).await.unwrap();

    let app = Router::new()
        .route("/upload", post(handle_upload))
        .layer(DefaultBodyLimit::max(MAX_BODY_SIZE));

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn handle_upload(
    mut multipart: Multipart,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let allowed_ext = ["pdf", "txt", "docx", "doc"];
    let mut results = vec![];

    while let Some(field) = multipart.next_field().await
        .map_err(|e| (StatusCode::BAD_REQUEST, Json(json!({"error": e.to_string()}))))?
    {
        let file_name = match field.file_name() {
            Some(name) => name.to_string(),
            None => continue, // 텍스트 필드 스킵
        };

        let ext = Path::new(&file_name)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("");

        if !allowed_ext.contains(&ext) {
            return Err((
                StatusCode::UNSUPPORTED_MEDIA_TYPE,
                Json(json!({"error": format!("Unsupported: .{}", ext)})),
            ));
        }

        let data = field.bytes().await
            .map_err(|e| (StatusCode::BAD_REQUEST, Json(json!({"error": e.to_string()}))))?;

        let path = format!("{}/{}", UPLOAD_DIR, file_name);
        tokio::fs::write(&path, &data).await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;

        results.push(json!({
            "name": file_name,
            "size": data.len(),
        }));
    }

    Ok(Json(json!({ "uploaded": results })))
}
```

---

## 빠른 참조

| 항목 | 값 |
|------|-----|
| Extractor | `axum::extract::Multipart` |
| 기본 바디 크기 제한 | 2MB |
| 크기 제한 변경 | `DefaultBodyLimit::max(bytes)` |
| 파일 판별 | `field.file_name().is_some()` |
| 한 번에 읽기 | `field.bytes().await` |
| 스트리밍 읽기 | `field.chunk().await` (반복) |
| 필수 의존성 | `axum`, `tokio` (full feature) |
