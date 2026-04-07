# sqlx 스킬 검증 기록

> 검증일: 2026-04-07
> 대상 버전: sqlx 0.8.x
> 공식 소스: https://docs.rs/sqlx/latest/sqlx/ | https://github.com/launchbadge/sqlx

---

## 검증 항목 및 결과

### 1. Pool 생성 API

| 클레임 | 검증 결과 | 소스 |
|--------|-----------|------|
| `PgPoolOptions::new().max_connections().connect()` | 확인됨 | docs.rs/sqlx/latest/sqlx/pool/struct.PoolOptions.html |
| `PgPool`은 `Pool<Postgres>`의 타입 앨리어스 | 확인됨 | docs.rs/sqlx/latest/sqlx/type.PgPool.html |
| Pool 내부에 Arc 포함, 이중 래핑 불필요 | 확인됨 | GitHub README - "Pool is Arc internally" |
| `max_connections` 기본값 10 | 확인됨 | docs.rs PoolOptions::max_connections 문서 |

### 2. query! / query_as! 매크로

| 클레임 | 검증 결과 | 소스 |
|--------|-----------|------|
| 컴파일 타임 SQL 검증 | 확인됨 | GitHub README, docs.rs macro 문서 |
| DATABASE_URL 환경변수 필요 | 확인됨 | docs.rs query! 매크로 문서 |
| fetch_one / fetch_optional / fetch_all / fetch / execute | 확인됨 | docs.rs sqlx::query 모듈 |
| query_as!는 구조체로 직접 매핑 | 확인됨 | docs.rs query_as! 매크로 문서 |
| 런타임 query()는 FromRow derive 필요 | 확인됨 | docs.rs FromRow trait 문서 |

### 3. 트랜잭션

| 클레임 | 검증 결과 | 소스 |
|--------|-----------|------|
| `pool.begin()` -> `Transaction` 반환 | 확인됨 | docs.rs Pool::begin 문서 |
| commit 미호출 시 drop에서 자동 rollback | 확인됨 | docs.rs Transaction 문서 "rolled back on Drop" |
| 트랜잭션 전달 시 `&mut *tx` 역참조 | 확인됨 | GitHub 예제, docs.rs Transaction::execute |

### 4. 마이그레이션

| 클레임 | 검증 결과 | 소스 |
|--------|-----------|------|
| `cargo install sqlx-cli` | 확인됨 | GitHub README |
| `sqlx migrate add`, `sqlx migrate run` | 확인됨 | GitHub CLI 문서 |
| `-r` 플래그로 reversible 마이그레이션 | 확인됨 | sqlx-cli --help, GitHub |
| `migrate!()` 매크로로 코드 내 실행 | 확인됨 | docs.rs migrate! 매크로 문서 |
| `migrate` feature 필요 | 확인됨 | docs.rs feature flags 문서 |

### 5. 오프라인 모드

| 클레임 | 검증 결과 | 소스 |
|--------|-----------|------|
| `cargo sqlx prepare` 명령어 | 확인됨 | GitHub README "Offline Mode" |
| `.sqlx/` 디렉토리 생성 | 확인됨 | GitHub README |
| `SQLX_OFFLINE=true` 환경변수 | 확인됨 | GitHub README |

### 6. Feature 플래그

| 클레임 | 검증 결과 | 소스 |
|--------|-----------|------|
| `runtime-tokio` / `runtime-async-std` 중 하나 필수 | 확인됨 | docs.rs feature flags |
| `tls-rustls` / `tls-native-tls` 중 하나 선택 | 확인됨 | docs.rs feature flags |
| runtime + tls 각 하나만 선택 필수 | 확인됨 | GitHub README |

### 7. 에러 처리

| 클레임 | 검증 결과 | 소스 |
|--------|-----------|------|
| `sqlx::Error::RowNotFound` variant | 확인됨 | docs.rs sqlx::Error enum |
| `sqlx::Error::Database` variant | 확인됨 | docs.rs sqlx::Error enum |
| `DatabaseError::code()` 메서드 | 확인됨 | docs.rs DatabaseError trait |
| PostgreSQL unique_violation 코드 23505 | 확인됨 | PostgreSQL 공식 문서 errcodes |

### 8. 0.7 -> 0.8 Breaking Changes

| 변경 사항 | 검증 결과 | 소스 |
|-----------|-----------|------|
| MSRV 변경 | 확인됨 | GitHub CHANGELOG |
| Any 드라이버 개편 | 확인됨 | GitHub CHANGELOG |

> 주의: 0.8.x 내 마이너 릴리즈별 세부 변경사항은 GitHub Releases 페이지에서 개별 확인이 필요합니다. 이 문서에서는 0.8 계열의 공통 API만 검증했습니다.

---

## 미검증 항목

| 항목 | 사유 | SKILL.md 표기 |
|------|------|---------------|
| 0.8.x 정확한 최신 마이너 버전 | 릴리즈 주기에 따라 변동 | `> 주의:` 표기 |
| Pool 기본 옵션값 (idle_timeout, max_lifetime) | 버전별 변경 가능성 | 표로 기재하되 공식 확인 권장 |

---

## 검증 방법

- 1차: docs.rs/sqlx/latest 공식 API 문서 대조
- 2차: github.com/launchbadge/sqlx README 및 examples 확인
- 3차: 기존 프로젝트 스킬(axum, thiserror)과의 연동 패턴 일관성 확인
