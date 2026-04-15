---
skill: dependency-injection
category: backend
version: v1
date: 2026-04-09
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | dependency-injection |
| 스킬 경로 | .claude/skills/dependency-injection/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 재검증일 | 2026-04-08 |
| 검증 방법 | rust-backend-developer 활용 테스트 |
| 버전 기준 | Rust 1.75+ / axum 0.8.x / async-trait 0.1.x |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | rust-backend-developer | async fn in trait, Pin<Box<dyn Future>>, Arc<dyn> AppState, 제네릭, State핸들러, mockall 6개 | 6/6 PASS (async_fn_in_trait 경고는 스킬에 이미 명시됨) |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Rust Book - trait objects | https://doc.rust-lang.org/book/ch17-02-trait-objects.html | ⭐⭐⭐ High |
| Rust Blog - async fn in traits | https://blog.rust-lang.org/2023/12/21/async-fn-rpit-in-traits.html | ⭐⭐⭐ High |
| docs.rs/axum State | https://docs.rs/axum/latest/axum/extract/struct.State.html | ⭐⭐⭐ High |

---

## fact-checker 검증 결과

> ⚠️ fact-checker 에이전트를 통한 검증이 실행되지 않았습니다 (수동 작성).

---

## 활용 테스트 추가 확인

스킬의 "dyn Trait 제약" 주의사항이 실제 컴파일러 에러(E0038)로 재현됨 — 내용 정확 확인.
- 네이티브 async fn in trait + `Arc<dyn>` → E0038 에러 (스킬 명시)
- 해결책: `#[async_trait]` 사용 or 제네릭으로 전환 (스킬 내용 정확)

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [❌] fact-checker로 핵심 클레임 검증 ← 미실행 (수동 작성)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (Rust 1.75+ / axum 0.8.x)
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 6/6 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. async_fn_in_trait Send 경고, dyn Trait E0038 에러 모두 스킬에 정확히 명시됨. 이슈 없음.
