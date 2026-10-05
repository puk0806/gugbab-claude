## async fn in traits (Rust 1.75+) — Trait 기반 DI 보강

> 2026-09-26: 구 `backend/dependency-injection`·`backend/repository-pattern` 스킬 삭제 시 버전성 내용만 이관.
> 소스: https://blog.rust-lang.org/2023/12/21/async-fn-rpit-in-traits.html | https://github.com/rust-lang/impl-trait-utils | https://doc.rust-lang.org/reference/items/traits.html#dyn-compatibility | https://docs.rs/trait-variant/latest/trait_variant/
> 검증일: 2026-09-26

Rust 1.75.0 (2023-12-28 안정화)부터 trait에서 `async fn`을 직접 사용할 수 있다.

```rust
// Rust 1.75+ : #[async_trait] 없이 동작
pub trait UserRepository: Send + Sync {
    async fn find_by_id(&self, id: i64) -> Result<Option<User>, AppError>;
}
```

> 주의: Rust 1.75의 네이티브 async fn in trait은 반환 Future가 자동으로 `Send`를 보장하지 않습니다. tokio 멀티스레드 런타임에서 `dyn UserRepository`를 사용하려면 `Send` 바운드가 필요한데, 네이티브 방식으로는 이를 표현하기 어렵습니다. **제네릭 파라미터 `<R: UserRepository>`로 사용하면 문제가 없습니다.**

### dyn Trait에서의 제약

`async fn in trait`은 각 구현체마다 다른 Future 타입을 반환하므로, `dyn Trait`으로 직접 사용할 수 없다.

| 필요 | 방법 |
|------|------|
| 제네릭 `<R: Repo>` + 멀티스레드 `tokio::spawn` (Send 필요) | `trait-variant` — `#[trait_variant::make(SendUserRepository: Send)]`로 Send 변형 trait 생성 |
| `Arc<dyn Repo>` (trait object) | `#[async_trait::async_trait]` (SKILL.md "Trait 기반 DI" 예시) 또는 수동 `Pin<Box<dyn Future<Output = ...> + Send + '_>>` 반환 |
| 둘 다 불필요 | 네이티브 `async fn` + 제네릭 (권장) |

```rust
// 수동 Box<dyn Future> 반환 (dyn 호환 필요 시)
pub trait UserRepository: Send + Sync {
    fn find_by_id(&self, id: i64) -> Pin<Box<dyn Future<Output = Result<Option<User>, AppError>> + Send + '_>>;
}
```

> 주의: 원 스킬(dependency-injection·repository-pattern)은 `trait-variant`를 `dyn` 해결책으로 제시했으나, `trait_variant::make`가 만드는 변형도 `impl Future + Send`를 반환하므로 dyn-compatible이 아니다(Send 바운드 표현 전용). 이관 시 표로 정정 (2026-09-26 확인: Rust Reference "dyn compatibility" — dispatchable 메서드는 `async fn`·반환 위치 `impl Trait` 불가 / docs.rs trait_variant — 생성 변형은 `-> impl Future<Output = _> + Send`).

> 주의: `trait-variant` 크레이트는 Rust 공식 팀(rust-lang 조직)에서 관리하지만, 아직 1.0 미만 버전입니다. API 변경 가능성이 있습니다.
