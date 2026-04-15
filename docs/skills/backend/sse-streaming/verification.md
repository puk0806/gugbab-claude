---
skill: sse-streaming
category: backend
version: v1
date: 2026-04-09
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | sse-streaming |
| 스킬 경로 | .claude/skills/sse-streaming/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 재검증일 | 2026-04-08 |
| 검증 방법 | rust-backend-developer 활용 테스트 |
| 버전 기준 | axum 0.8.8 / tokio-stream 0.1.18 |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | rust-backend-developer | Sse::new, Event 빌더, mpsc+ReceiverStream+KeepAlive, 라우터등록, Claude API 스트리밍, CORS 6개 | 6/6 PASS (reqwest 0.12 getrandom 환경 주의 명시) |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| docs.rs/axum SSE | https://docs.rs/axum/latest/axum/response/sse/index.html | ⭐⭐⭐ High |
| docs.rs/tokio-stream | https://docs.rs/tokio-stream/latest/tokio_stream/ | ⭐⭐⭐ High |

---

## fact-checker 검증 결과

> ⚠️ fact-checker 에이전트를 통한 검증이 실행되지 않았습니다 (수동 작성).

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (docs.rs/axum, docs.rs/tokio-stream)
- [❌] fact-checker로 핵심 클레임 검증 ← 미실행 (수동 작성)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (axum 0.8.x / tokio-stream 0.1.x)
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 6/6 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. axum SSE API 정확. reqwest 0.12 최신 버전은 Rust 1.85+ 필요(getrandom 0.4.x) — SKILL.md 코드 오류 아님.
