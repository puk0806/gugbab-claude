---
skill: cargo-workspace
category: backend
version: v1
date: 2026-04-09
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | cargo-workspace |
| 스킬 경로 | .claude/skills/cargo-workspace/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 재검증일 | 2026-04-08 |
| 검증 방법 | rust-backend-developer 활용 테스트 |
| 버전 기준 | Cargo 최신 안정 (Rust 1.75+ / Cargo 1.64+) |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | rust-backend-developer | 가상워크스페이스, workspace.dependencies, path참조, 내부크레이트등록, features override, workspace.package 6개 | 6/6 PASS (core 크레이트명 충돌→app-core 수정, cargo run 설명 수정, workspace+version 경고 명시) |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Cargo 공식 문서 | https://doc.rust-lang.org/cargo/reference/workspaces.html | ⭐⭐⭐ High |

---

## fact-checker 검증 결과

> ⚠️ fact-checker 에이전트를 통한 검증이 실행되지 않았습니다 (수동 작성).

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (doc.rust-lang.org/cargo)
- [❌] fact-checker로 핵심 클레임 검증 ← 미실행 (수동 작성)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (Cargo 1.64+)
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 6/6 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. 3개 이슈 수정: `core` 예제 크레이트명 충돌(`app-core`로 변경), `cargo run` 설명 정확화, `workspace+version` 경고/에러 구분.
