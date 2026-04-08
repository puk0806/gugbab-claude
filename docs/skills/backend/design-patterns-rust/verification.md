---
skill: design-patterns-rust
category: backend
version: v1
date: 2026-04-08
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | design-patterns-rust |
| 스킬 경로 | .claude/skills/design-patterns-rust/SKILL.md |
| 최초 작성일 | 2026-04-07 |
| 재검증일 | 2026-04-08 |
| 검증 방법 | fact-checker 에이전트 + rust-backend-developer 활용 테스트 |
| 버전 기준 | Rust 1.75+ stable / derive_builder 0.20.x |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 조사 | web-searcher | rust-unofficial/patterns, Rust Book, tokio::sync, derive_builder | 패턴별 공식 레포 + docs.rs 소스 수집 |
| 검증 | fact-checker | 8개 클레임 (Builder·Newtype·TypeState·Strategy·Observer·RAII·ExtensionTrait) | VERIFIED 7, DISPUTED 1 |
| 활용 테스트 | rust-backend-developer | 8개 패턴 코드 작성 요청 | 전항목 PASS, error 0 |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Rust Design Patterns (비공식 공식 레포) | https://rust-unofficial.github.io/patterns/ | ⭐⭐⭐ High |
| The Rust Book | https://doc.rust-lang.org/book/ | ⭐⭐⭐ High |
| tokio::sync 공식 문서 | https://docs.rs/tokio/latest/tokio/sync/ | ⭐⭐⭐ High |
| derive_builder 공식 문서 | https://docs.rs/derive_builder/latest/derive_builder/ | ⭐⭐⭐ High |
| Rust RFC 0445 (Extension Trait) | https://rust-lang.github.io/rfcs/0445-extension-trait-conventions.html | ⭐⭐⭐ High |

---

## fact-checker 검증 결과

| 클레임 | 판정 | 비고 |
|--------|------|------|
| consuming self Builder가 가장 일반적 | DISPUTED → 수정됨 | consuming + non-consuming 둘 다 관용적. derive_builder 기본값은 &mut self. SKILL.md 수정 완료 |
| derive_builder 0.20.x `#[builder(default)]` 지원 | VERIFIED | 최신 0.20.2 docs.rs 확인 |
| `impl Deref` 구현 시 inner 타입 메서드 자동 접근 | VERIFIED | deref coercion 메커니즘 Rust Book 확인 |
| PhantomData<S>로 zero-cost 컴파일 타임 상태 전이 | VERIFIED | ZST, 런타임 오버헤드 없음 확인 |
| Box<dyn Trait>=런타임 다형성, impl Trait=컴파일 타임 단형화 | VERIFIED | Rust By Example 확인 |
| tokio::sync::broadcast로 다중 소비자 전달 | VERIFIED | tokio 공식 문서 multi-producer/multi-consumer 명시 |
| drop(value)로 명시적 조기 해제 | VERIFIED | std::mem::drop (프리루드 포함) — Drop 트레이트 메서드 직접 호출과 다름 |
| Extension Trait으로 orphan rule 우회 | VERIFIED | RFC 0445 + Rust Book 확인 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (rust-unofficial/patterns, Rust Book)
- [✅] web-searcher로 조사 실행
- [✅] fact-checker로 핵심 클레임 검증 (8개)
- [✅] DISPUTED 항목 수정 반영 (Builder 설명 → SKILL.md 수정 완료)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (Rust 1.75+, derive_builder 0.20.x)
- [✅] 불확실 항목 `> 주의:` 표기
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 8/8 PASS, error 0)

---

## 최종 판정

**APPROVED** — fact-checker 검증 완료 (DISPUTED 1건 수정 반영) + rust-backend-developer 활용 테스트 8개 패턴 전항목 PASS (error 0).
