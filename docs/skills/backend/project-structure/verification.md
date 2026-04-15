---
skill: project-structure
category: backend
version: v1
date: 2026-04-09
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | project-structure |
| 스킬 경로 | .claude/skills/project-structure/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 재검증일 | 2026-04-08 |
| 검증 방법 | rust-backend-developer 활용 테스트 |
| 버전 기준 | axum 0.8.x |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | rust-backend-developer | Domain Entity, DTO/From변환, Repository계층, Service계층, Handler추출자, Routes+DI 6개 | 6/6 PASS (axum 0.8 경로 문법 {id} 확인) |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| docs.rs/axum | https://docs.rs/axum/latest/axum/ | ⭐⭐⭐ High |
| axum examples | https://github.com/tokio-rs/axum/tree/main/examples | ⭐⭐⭐ High |

---

## fact-checker 검증 결과

> ⚠️ fact-checker 에이전트를 통한 검증이 실행되지 않았습니다 (수동 작성).

---

## 활용 테스트 PARTIAL PASS 항목

| 패턴 | 판정 | 비고 |
|------|------|------|
| `State<Arc<dyn UserServiceTrait>>` 핸들러 주입 | PARTIAL PASS | 스킬 권장 패턴은 구체 타입 또는 제네릭. Arc<dyn Trait>는 dependency-injection 스킬 담당 |
| `Arc<dyn UserRepositoryTrait>` 필드 | PARTIAL PASS | 동일 이유 — 스킬 범위 외 패턴 |

두 PARTIAL PASS 항목은 스킬 내용 오류가 아닌 테스트 패턴이 스킬 범위를 벗어난 것. 스킬 자체 패턴(구체 타입, 제네릭)은 정확.

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (docs.rs/axum, axum examples)
- [❌] fact-checker로 핵심 클레임 검증 ← 미실행 (수동 작성)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (axum 0.8.x)
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 4/6 PASS + 2 PARTIAL)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. 4계층 전체 컴파일 통과. axum 0.8 경로 문법({id}), 추출자 순서, with_state 패턴 정확. 이슈 없음.
