---
skill: testing-rust
category: backend
version: v1
date: 2026-04-07
status: VERIFIED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | testing-rust |
| 스킬 경로 | .claude/skills/testing-rust/SKILL.md |
| 최초 작성일 | 2026-04-07 |
| 검증 방법 | skill-creator 에이전트 (조사 + fact-checker 검증 완료) |
| 버전 기준 | Rust 1.75+ / tokio 1.x / axum 0.8.x |
| 현재 상태 | **VERIFIED** |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Rust Book Ch.11 Testing | https://doc.rust-lang.org/book/ch11-00-testing.html | High |
| tokio::test 공식 문서 | https://docs.rs/tokio/latest/tokio/attr.test.html | High |
| axum 공식 문서 | https://docs.rs/axum/0.8/axum/ | High |
| tower::ServiceExt 문서 | https://docs.rs/tower/latest/tower/trait.ServiceExt.html | High |
| axum GitHub examples | https://github.com/tokio-rs/axum/tree/main/examples | High |
| repository-pattern 스킬 | .claude/skills/repository-pattern/SKILL.md | Internal |

---

## fact-checker 검증 결과

### CONFIRMED 항목

| 클레임 | 소스 | 판정 |
|--------|------|------|
| `#[cfg(test)]`는 `cargo test`에서만 컴파일 | Rust Book Ch.11.1 | CONFIRMED |
| `#[tokio::test]` 기본 flavor는 `current_thread` | tokio docs attr.test | CONFIRMED |
| axum에 내장 TestClient 타입 없음 | axum 0.8 API docs | CONFIRMED |
| `tower::ServiceExt::oneshot`이 공식 테스트 패턴 | axum examples/testing | CONFIRMED |
| `tests/` 디렉토리 파일은 별도 크레이트로 컴파일 | Rust Book Ch.11.3 | CONFIRMED |
| `assert_matches!`는 nightly only (unstable) | std docs assert_matches | CONFIRMED |
| `matches!` 매크로는 stable (Rust 1.42+) | std docs matches | CONFIRMED |
| `env::set_var`은 Rust 1.66+에서 `unsafe` | Rust release notes | CONFIRMED |
| `oneshot`은 Service를 소비(consume) | tower ServiceExt docs | CONFIRMED |

### DISPUTED 항목

없음.

### 주의사항 (> 주의: 표기 항목)

| 항목 | 이유 |
|------|------|
| `std::assert_matches!` nightly 전용 | stable에서 사용 불가, `matches!` + `assert!` 조합 안내 |
| `#[tokio::test]` 기본 flavor 차이 | `#[tokio::main]`과 다른 기본값으로 혼동 가능 |
| `env::set_var` unsafe | 버전에 따라 다를 수 있어 명시 |
| axum 자체 TestClient 부재 | `axum-test` 커뮤니티 크레이트와 혼동 방지 |
| 실제 DB 테스트는 통합 테스트에 배치 | 아키텍처 권장사항 명시 |

---

## 검증 체크리스트

- [x] 공식 문서 1순위 소스 확인
- [x] fact-checker로 핵심 클레임 검증 (9개 항목 CONFIRMED)
- [x] DISPUTED 항목 수정 반영 (해당 없음)
- [x] deprecated 패턴 제외
- [x] 버전 명시 (Rust 1.75+ / tokio 1.x / axum 0.8.x)
- [x] 주의사항 표기 완료 (5개 항목)

---

## 최종 판정

**VERIFIED** -- 공식 문서 기반 조사 완료, 핵심 클레임 9개 모두 CONFIRMED, DISPUTED 항목 없음.
