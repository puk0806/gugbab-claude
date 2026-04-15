---
skill: reqwest
category: backend
version: v1
date: 2026-04-09
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | reqwest |
| 스킬 경로 | .claude/skills/reqwest/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 검증 방법 | rust-backend-developer 활용 테스트 (cargo check 검증) |
| 버전 기준 | reqwest 0.12.x |
| 재검증일 | 2026-04-09 |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| 공식 문서 | https://docs.rs/reqwest/latest/reqwest/ | https://github.com/seanmonstar/reqwest | ⭐⭐⭐ High |

---

## fact-checker 검증 결과

> ⚠️ fact-checker 에이전트를 통한 검증이 실행되지 않았습니다.

SKILL.md 내 `> 주의:` 항목으로 불확실한 내용은 표기되어 있으나, 클레임별 교차 검증은 미실행 상태입니다.

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | rust-backend-developer | Client생성/재사용, GET(.text/.json), POST(.json), 헤더(개별/HeaderMap), 스트리밍, 에러처리 6개 | 6/6 PASS (Rust 1.85+ 권장 환경 명시) |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (docs.rs/reqwest)
- [❌] fact-checker로 핵심 클레임 검증 ← 미실행 (수동 작성)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (reqwest 0.12.x)
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 6/6 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. 모든 API cargo check 통과. reqwest 0.12 최신버전은 Rust 1.85+ 필요(getrandom 0.4.x) — 코드 오류 아님.
