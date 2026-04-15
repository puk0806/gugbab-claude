---
skill: tracing
category: backend
version: v1
date: 2026-04-09
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | tracing |
| 스킬 경로 | .claude/skills/tracing/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 검증 방법 | 수동 작성 (skill-creator 에이전트 미사용) |
| 버전 기준 | tracing 0.1.x / tracing-subscriber 0.3.x |
| 재검증일 | 2026-04-08 |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| 공식 문서 | https://docs.rs/tracing/latest/tracing/ | https://docs.rs/tracing-subscriber/latest/tracing_subscriber/ | ⭐⭐⭐ High |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | rust-backend-developer | fmt초기화, Registry레이어, 이벤트매크로, #[instrument], Span/async연동, TraceLayer 6개 | 6/6 PASS (Router::new() 단독 타입추론 주의 → SKILL.md 주석 추가) |

---

## fact-checker 검증 결과

> ⚠️ fact-checker 에이전트를 통한 검증이 실행되지 않았습니다 (수동 작성).

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (docs.rs/tracing, docs.rs/tracing-subscriber)
- [❌] fact-checker로 핵심 클레임 검증 ← 미실행 (수동 작성)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (tracing 0.1.x / tracing-subscriber 0.3.x)
- [✅] async 내 span.enter() 위험 경고 SKILL.md에 명시
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 6/6 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. `Router::new()` 단독 사용 시 타입 추론 실패 가능성을 SKILL.md에 주석 추가. 이슈 없음.
