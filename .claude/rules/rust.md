# Rust 코딩 규칙

이 파일은 Rust + Axum 백엔드 코드 작성 시 준수해야 할 규칙입니다.
백엔드 스킬·에이전트 작업 시 참조한다.

---

## 에러 처리

- `unwrap()` / `expect()` 는 테스트 코드에서만 허용
  - 프로덕션 코드에서 `unwrap()`이 필요하다면 설계를 재고한다
- `thiserror` 기반 도메인 에러 타입 정의 필수
- Axum 핸들러 반환 타입: `Result<impl IntoResponse, AppError>`
- `?` 연산자로 에러 전파, 레이어 경계에서만 `map_err` 변환

```rust
// 금지
let val = some_option.unwrap();

// 권장
let val = some_option.ok_or(AppError::NotFound("resource"))?;
```

## 타입 설계

- Newtype 패턴으로 원시 타입 래핑 — `UserId(i64)`, `Email(String)`
- `Clone` 은 필요할 때만 derive — 불필요한 복사 방지
- 공개 API 타입에는 `serde::Serialize` / `Deserialize` derive
- Builder 패턴은 필드가 5개 이상이거나 선택적 필드가 많을 때 사용

## 비동기

- 모든 비동기 작업은 `tokio` 런타임 사용
- `spawn` 은 독립 작업에만 사용, 결과가 필요하면 `JoinHandle` await
- `async` 클로저가 필요하면 `async move { }` 명시
- DB 쿼리는 `sqlx::Pool`을 `Arc<Pool>` 로 공유, 핸들러마다 생성 금지

## 아키텍처

- 레이어: `handler → service → repository`
- 의존성 방향: handler는 service만, service는 repository만 참조
- `AppState`는 `Arc` 로 감싼 공유 상태만 포함
- 비즈니스 로직은 handler에 두지 않고 service에 위치

```rust
// 금지 — handler에 비즈니스 로직
async fn create_user(State(db): State<Pool<Postgres>>, ...) { /* SQL 직접 실행 */ }

// 권장 — service에 위임
async fn create_user(State(state): State<AppState>, Json(req): Json<CreateUserReq>) {
    state.user_service.create(req).await?;
}
```

## 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 타입·트레이트 | PascalCase | `UserRepository` |
| 함수·변수 | snake_case | `find_by_id` |
| 상수 | UPPER_SNAKE_CASE | `MAX_CONNECTIONS` |
| 모듈 파일 | snake_case | `user_service.rs` |
| 에러 enum | PascalCase + Error suffix | `AppError`, `DatabaseError` |

## Clippy / 포맷

- `cargo clippy -- -D warnings` 경고 0개 유지
- `cargo fmt` 후 커밋
- 사용하지 않는 import `#[allow(unused_imports)]` 금지 — 삭제한다
- 라인 길이 100자 이내 (`rustfmt.toml: max_width = 100`)

## 금지 패턴

- `clone()` 남용 — Arc/Rc 공유 또는 참조로 대체 검토
- `std::sync::Mutex` in async context — `tokio::sync::Mutex` 사용
- blocking 작업(파일 I/O, 긴 계산)을 async 함수에서 직접 실행 — `spawn_blocking` 사용
- `unsafe` 블록 — 외부 FFI 필요 시 별도 검토 후 주석 필수
