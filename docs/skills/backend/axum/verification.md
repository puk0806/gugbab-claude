---
skill: axum
category: backend
version: v1
date: 2026-04-07
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | axum |
| 스킬 경로 | .claude/skills/axum/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 재검증일 | 2026-04-08 |
| 검증 방법 | fact-checker 에이전트 (재검증) + rust-backend-developer 활용 테스트 |
| 버전 기준 | axum 0.8.x (0.8.8 실제 resolve 확인) |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 검증 | fact-checker | 핵심 클레임 7개 | VERIFIED 5, DISPUTED 2 |
| 활용 테스트 | rust-backend-developer | 6개 패턴 코드 작성 요청 (서버실행, 라우팅, State, Json, 에러핸들링, 미들웨어) | 전항목 PASS, error 0 / warning 0 |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| docs.rs/axum | https://docs.rs/axum/latest/axum/ | ⭐⭐⭐ High |
| tokio-rs/axum GitHub | https://github.com/tokio-rs/axum | ⭐⭐⭐ High |
| Tokio 공식 블로그 (0.6~0.8 발표) | https://tokio.rs/blog/ | ⭐⭐⭐ High |

---

## fact-checker 검증 결과

| 클레임 | 판정 | 비고 |
|--------|------|------|
| axum 0.7부터 `axum::Server` 제거, `axum::serve` 사용 | DISPUTED → 수정됨 | hyper 1.0 의존 소멸이 정확한 표현. SKILL.md 수정 완료 |
| axum 0.8부터 경로 파라미터 `{id}` 문법 변경 | VERIFIED | - |
| `TypedHeader`는 axum-extra + `headers` feature | DISPUTED → 수정됨 | feature명은 `typed-header`. SKILL.md 수정 완료 |
| Extension 런타임 에러, State 0.6 도입 권장 | VERIFIED | - |
| `Router::new().route()` 기본 라우팅 패턴 | VERIFIED | - |
| 핸들러 반환 타입 `IntoResponse` | VERIFIED | - |
| `Json<T>` 추출자 + 응답 양방향 사용 | VERIFIED | 추출자 사용 시 Content-Type: application/json 필요 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (docs.rs, tokio.rs 블로그)
- [✅] fact-checker로 핵심 클레임 검증 (7개)
- [✅] DISPUTED 항목 수정 반영 (2건 → SKILL.md 수정 완료)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (axum 0.8.x)
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 6개 패턴 전항목 PASS)

---

## 최종 판정

**APPROVED** — fact-checker 검증 완료 (DISPUTED 2건 수정 반영) + rust-backend-developer 활용 테스트 6개 패턴 전항목 PASS (error 0 / warning 0).
