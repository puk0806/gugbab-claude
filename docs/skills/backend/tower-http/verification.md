---
skill: tower-http
category: backend
version: v1
date: 2026-04-09
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | tower-http |
| 스킬 경로 | .claude/skills/tower-http/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 재검증일 | 2026-04-08 |
| 검증 방법 | rust-backend-developer 활용 테스트 |
| 버전 기준 | tower-http 0.6.x |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | rust-backend-developer | CorsLayer(permissive/명시), allow_origin 패턴, TraceLayer 기본/커스텀, CompressionLayer, ServiceBuilder 스택 6개 | 6/6 PASS (TimeoutLayer::with_status_code 0.6.7+ 주의 문구 추가) |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| 공식 문서 | https://docs.rs/tower-http | ⭐⭐⭐ High |
| GitHub | https://github.com/tower-rs/tower-http | ⭐⭐⭐ High |

---

## 활용 테스트 발견 사항 (DISPUTED → 수정 완료)

| 항목 | 내용 |
|------|------|
| `TimeoutLayer::new` deprecated | tower-http 0.6.x에서 deprecated. `with_status_code(StatusCode, Duration)` 으로 수정 완료 |
| Cargo.toml feature 누락 | `timeout`, `limit` feature 예시에 추가 완료 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (docs.rs/tower-http)
- [❌] fact-checker로 핵심 클레임 검증 ← 미실행 (수동 작성)
- [✅] deprecated 패턴 수정 반영 (TimeoutLayer::new → with_status_code)
- [✅] 버전 명시 (tower-http 0.6.x)
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 6/6 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. 컴파일 검증 완료. `TimeoutLayer::with_status_code`는 0.6.7+ 전용임을 SKILL.md에 주의 문구 추가.
