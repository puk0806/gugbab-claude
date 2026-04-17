---
name: cargo-workspace
description: Rust Cargo Workspace 멀티 크레이트 구조 설계 및 의존성 관리 가이드
---

# Cargo Workspace - 멀티 크레이트 프로젝트 구조

> 소스: https://doc.rust-lang.org/cargo/reference/workspaces.html
> 소스: https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html#specifying-path-dependencies
> 검증일: 2026-04-06

---

## Workspace란

하나의 `Cargo.lock`과 하나의 `target/` 디렉토리를 공유하는 크레이트 모음. 크레이트 간 일관된 의존성 버전을 보장하고 빌드 캐시를 공유한다.

---

## 루트 Cargo.toml 설정

워크스페이스 루트에는 `[workspace]` 섹션을 선언한다. 루트가 직접 크레이트(라이브러리/바이너리)가 아닌 **가상 워크스페이스(virtual workspace)** 형태를 권장한다.

```toml
# /Cargo.toml (워크스페이스 루트)
[workspace]
resolver = "2"
members = [
    "crates/api",
    "crates/app-core",
    "crates/domain",
]

[workspace.dependencies]
serde = { version = "1", features = ["derive"] }
tokio = { version = "1", features = ["full"] }
anyhow = "1"
```

- `members`: 워크스페이스에 포함할 크레이트 경로 목록. 글로브 패턴 사용 가능 (`"crates/*"`)
- `exclude`: 글로브 패턴 사용 시 특정 경로를 제외할 때 사용

> 주의: 가상 워크스페이스(루트에 `[package]` 없음)에서 바이너리 크레이트가 여럿이면 `cargo run`이 루트에서 동작하지 않는다. `-p` 플래그로 크레이트를 지정해야 한다. (바이너리가 1개이면 `-p` 없이도 실행 가능)

---

## 3계층 크레이트 구조 예시

```
project-root/
├── Cargo.toml          # [workspace] 정의
├── Cargo.lock          # 전체 workspace 공유
├── crates/
│   ├── api/            # binary crate — HTTP 서버, CLI 진입점
│   │   ├── Cargo.toml
│   │   └── src/
│   │       └── main.rs
│   ├── core/           # library crate — 비즈니스 로직
│   │   ├── Cargo.toml
│   │   └── src/
│   │       └── lib.rs
│   └── domain/         # library crate — 공유 타입, 도메인 모델
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs
└── target/             # 전체 workspace 공유
```

**의존성 방향:** `api` → `core` → `domain`. 역방향 의존 금지(순환 의존 불가).

---

## 각 크레이트 Cargo.toml

### crates/domain/Cargo.toml

```toml
[package]
name = "domain"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { workspace = true }
```

### crates/app-core/Cargo.toml

```toml
[package]
name = "app-core"
version = "0.1.0"
edition = "2021"

[dependencies]
domain = { path = "../domain" }
serde = { workspace = true }
anyhow = { workspace = true }
```

### crates/api/Cargo.toml

```toml
[package]
name = "api"
version = "0.1.0"
edition = "2021"

[dependencies]
core = { path = "../core" }
domain = { path = "../domain" }
tokio = { workspace = true }
serde = { workspace = true }
anyhow = { workspace = true }
```

---

## workspace.dependencies — 공유 의존성 관리

> 소스: https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html#inheriting-a-dependency-from-a-workspace

Cargo 1.64부터 안정화. 루트 `[workspace.dependencies]`에 버전을 한 번만 선언하고, 각 크레이트에서 `workspace = true`로 상속받는다.

```toml
# 워크스페이스 루트
[workspace.dependencies]
serde = { version = "1", features = ["derive"] }

# 개별 크레이트
[dependencies]
serde = { workspace = true }
```

**features 추가:** 개별 크레이트에서 워크스페이스 의존성에 features를 추가할 수 있다.

```toml
# 워크스페이스 루트
[workspace.dependencies]
tokio = { version = "1" }

# 개별 크레이트 — 워크스페이스 버전을 상속하면서 features만 추가
[dependencies]
tokio = { workspace = true, features = ["full"] }
```

**제약:** `workspace = true`를 사용할 때 `version`을 함께 지정하면 경고(unused manifest key)와 함께 무시된다. 버전은 워크스페이스 루트에서만 관리한다.

> 주의: `workspace = true` + `version` 동시 지정은 에러가 아니라 경고로 처리되어 `version` 값이 무시된다. 실수 방지를 위해 `version` 키는 제거하는 것이 권장된다. (WebSearch 교차 검증 확인, 2026-04-17)

---

## 크레이트 간 의존성 선언

같은 워크스페이스 내 크레이트는 `path`로 참조한다.

```toml
[dependencies]
domain = { path = "../domain" }
```

워크스페이스 내부 크레이트도 `[workspace.dependencies]`에 등록하여 관리할 수 있다.

```toml
# 워크스페이스 루트
[workspace.dependencies]
domain = { path = "crates/domain" }
app-core = { path = "crates/app-core" }

# crates/api/Cargo.toml
[dependencies]
domain = { workspace = true }
core = { workspace = true }
```

---

## Resolver 설정

> 소스: https://doc.rust-lang.org/cargo/reference/resolver.html

| Resolver | 기본 적용 | 동작 |
|----------|-----------|------|
| v1 | edition 2015/2018 | features가 전체 워크스페이스에서 통합(unify)됨 |
| v2 | edition 2021 | dev-dependencies의 features가 일반 빌드에 영향 안 줌. 타겟별 features 분리 |
| v3 | edition 2024 | v2와 동일 동작 + `[lints]` 테이블 지원 등 |

**가상 워크스페이스에서는 `resolver`를 명시적으로 지정해야 한다.** 가상 워크스페이스는 `[package]`가 없어 edition을 추론할 수 없기 때문이다.

```toml
[workspace]
resolver = "2"
members = ["crates/*"]
```

> 주의: Resolver v3는 Rust 1.84 (edition 2024)부터 사용 가능. edition 2024 미만에서 `resolver = "3"`을 지정하면 에러가 발생한다.

---

## 빌드 명령어

```bash
# 전체 워크스페이스 빌드
cargo build

# 특정 크레이트만 빌드
cargo build -p api
cargo build -p domain

# 특정 크레이트 실행 (binary crate)
cargo run -p api

# 특정 크레이트 테스트
cargo test -p core

# 전체 워크스페이스 테스트
cargo test --workspace

# 특정 크레이트 문서 생성
cargo doc -p domain --open
```

`-p` (또는 `--package`)는 `[package] name` 값을 기준으로 한다. 디렉토리 이름이 아니라 `Cargo.toml`의 `name` 필드.

---

## Workspace vs 단순 모듈 — 판단 기준

| 기준 | Workspace | 단순 모듈 (`mod`) |
|------|-----------|-------------------|
| 독립 배포 | 크레이트별 개별 배포 필요 | 단일 바이너리/라이브러리로 충분 |
| 컴파일 단위 | 크레이트 단위 병렬 컴파일 이점 | 모듈은 같은 크레이트 내 순차 컴파일 |
| 의존성 격리 | 크레이트별 다른 의존성 가능 | 모든 모듈이 같은 의존성 공유 |
| 코드 규모 | 10,000줄 이상 또는 명확한 경계 존재 | 소규모, 경계가 모호 |
| 팀 구조 | 여러 팀이 독립적으로 작업 | 한 팀이 전체 관리 |
| visibility 제어 | `pub` API만 외부 노출, 내부 구현 완전 은닉 | `pub(crate)` 등으로 제어 가능하나 경계가 약함 |

**권장 시점:**
- 처음에는 모듈로 시작한다
- 명확한 계층 분리가 필요하거나 컴파일 시간이 문제될 때 워크스페이스로 전환
- 라이브러리를 crates.io에 개별 배포해야 하면 반드시 워크스페이스

---

## workspace.package — 메타데이터 공유

```toml
# 워크스페이스 루트
[workspace.package]
version = "0.1.0"
edition = "2021"
license = "MIT"
authors = ["Your Name <you@example.com>"]
repository = "https://github.com/you/project"

# 개별 크레이트
[package]
name = "api"
version.workspace = true
edition.workspace = true
license.workspace = true
authors.workspace = true
repository.workspace = true
```

---

## 자주 하는 실수

| 실수 | 해결 |
|------|------|
| 순환 의존성 | Cargo는 크레이트 간 순환 의존을 허용하지 않음. 공통 타입을 별도 크레이트(domain)로 분리 |
| `workspace = true` + `version` 동시 지정 | `version`은 경고(unused manifest key)와 함께 무시됨. `workspace = true` 사용 시 version 제거 권장. 버전은 루트에서만 관리 |
| 가상 워크스페이스에서 `cargo run` | `-p` 플래그로 바이너리 크레이트 지정 필수 |
| 글로브 패턴 사용 시 새 크레이트 미인식 | `cargo metadata`로 확인. 글로브 범위 내 경로인지 점검 |
| `resolver` 미지정 (가상 워크스페이스) | 경고 발생. `resolver = "2"` 명시 권장 |
