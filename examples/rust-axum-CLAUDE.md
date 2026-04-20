# CLAUDE.md — Rust + Axum 백엔드 프로젝트

<!-- 이 파일을 프로젝트 루트에 CLAUDE.md로 복사해서 사용하세요 -->

## 기술 스택

- Rust (stable)
- Axum (웹 프레임워크)
- SQLx + PostgreSQL (데이터베이스)
- Tokio (비동기 런타임)
- serde / serde_json (직렬화)
- thiserror (에러 타입)
- tracing (로깅)
- jsonwebtoken (JWT 인증)

## 개발 명령어

```bash
cargo build           # 빌드
cargo run             # 실행
cargo test            # 테스트
cargo check           # 빌드 없이 타입 체크
cargo clippy          # 린트 (경고 0개 유지)
cargo fmt             # 포맷
sqlx migrate run      # DB 마이그레이션 실행
```

## 레이어드 아키텍처

```
src/
├── main.rs           ← 진입점, AppState 조립
├── config.rs         ← 환경변수 로드 (dotenvy + envy)
├── error.rs          ← AppError (thiserror)
├── routes/           ← 라우터 등록
├── handlers/         ← HTTP 핸들러 (얇게 유지)
├── services/         ← 비즈니스 로직
├── repositories/     ← DB 접근 (sqlx)
└── models/           ← 도메인 타입, DTO
```

의존 방향: `handler → service → repository`
핸들러에 SQL 쿼리 금지, 서비스에 HTTP 응답 타입 금지.

## 에러 처리 규칙

- 모든 에러: `AppError` enum (thiserror derive)
- 핸들러 반환: `Result<impl IntoResponse, AppError>`
- `unwrap()` / `expect()` 프로덕션 코드 금지
- `?` 연산자로 전파, 레이어 경계에서 `map_err` 변환

```rust
// AppError 예시
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Not found: {0}")]
    NotFound(&'static str),
    #[error("Database error")]
    Database(#[from] sqlx::Error),
}
```

## 코딩 규칙

- `cargo clippy -- -D warnings` 경고 0개
- `cargo fmt` 후 커밋
- `Clone` 은 필요할 때만 derive
- blocking 작업: `tokio::task::spawn_blocking`
- DB Pool: `Arc<Pool<Postgres>>` 로 AppState에서 공유

## 테스트 기준

- 단위 테스트: service 로직 (In-Memory mock repository)
- 통합 테스트: `axum::serve` + `sqlx::test` 트랜잭션 롤백
- 커버리지 목표: service 레이어 80% 이상

## 에이전트 활용

| 작업 | 에이전트 |
|------|----------|
| 핸들러·서비스·라우터 구현 | `rust-backend-developer` |
| 아키텍처·크레이트 구조 설계 | `rust-backend-architect` |
| 컴파일·cargo 에러 | `build-error-resolver` |
| DDD 도메인 모델 설계 | `business-domain-analyst` |
