---
skill: sqlx
category: backend
version: v1
date: 2026-04-09
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | sqlx |
| 스킬 경로 | .claude/skills/sqlx/SKILL.md |
| 최초 작성일 | 2026-04-07 |
| 재검증일 | 2026-04-09 |
| 검증 방법 | 수동 작성(초기) + rust-backend-developer 활용 테스트 |
| 버전 기준 | sqlx 0.8.x |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | rust-backend-developer | Pool, query_as/FromRow, INSERT/execute, 트랜잭션, AppState+Pool, 에러처리 6개 | 5/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| 공식 문서 | https://docs.rs/sqlx/latest/sqlx/ | ⭐⭐⭐ High |
| GitHub | https://github.com/launchbadge/sqlx | ⭐⭐⭐ High |

---

## 활용 테스트 발견 사항 (수정 완료)

| 항목 | 내용 |
|------|------|
| Cargo.toml에 `anyhow` / `thiserror` 누락 | AppError::Unexpected(#[from] anyhow::Error) 사용 시 필요 → SKILL.md Cargo.toml에 추가 완료 |
| `lastval()` 사용 위험성 | 동일 세션에서 다른 시퀀스 사용 시 잘못된 값 반환 가능 → 주의 문구 추가 완료 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (docs.rs/sqlx, github.com/launchbadge/sqlx)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (sqlx 0.8.x)
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 수정 후 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 완료. Cargo.toml anyhow/thiserror 누락 수정, lastval() 위험성 주의 문구 추가.
