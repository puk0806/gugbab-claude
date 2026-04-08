---
skill: tokio
category: backend
version: v1
date: 2026-04-08
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | tokio |
| 스킬 경로 | .claude/skills/tokio/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 재검증일 | 2026-04-07 |
| 검증 방법 | fact-checker 에이전트 (재검증) |
| 버전 기준 | tokio 1.x (최신 안정) |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 검증 | fact-checker | 핵심 클레임 7개 | VERIFIED 6, DISPUTED 1 |
| 활용 테스트 | rust-backend-developer | spawn, mpsc, interval_at, Mutex 패턴 코드 작성 요청 | 전항목 스킬 내용과 일치, 오류 없음 |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| tokio 공식 사이트 | https://tokio.rs/ | ⭐⭐⭐ High |
| docs.rs/tokio | https://docs.rs/tokio/latest/tokio/ | ⭐⭐⭐ High |

---

## fact-checker 검증 결과

| 클레임 | 판정 | 비고 |
|--------|------|------|
| `#[tokio::main]`에 `macros` + `rt-multi-thread`(또는 `rt`) feature 필요 | DISPUTED → 수정됨 | `rt`는 항상 필수. `rt-multi-thread`는 multi-thread flavor 사용 시 추가 필요. OR 관계 아님 |
| 짧은 구간엔 `std::sync::Mutex`, `.await` 필요 시 `tokio::sync::Mutex` | VERIFIED | - |
| `tokio::fs`는 `spawn_blocking` 사용, `fs` feature 필요 | VERIFIED | 향후 io_uring으로 변경 가능성 있음 |
| `interval` 첫 `tick()`은 즉시 완료, 지연 시작은 `interval_at` | VERIFIED | - |
| `tokio::spawn`은 `JoinHandle` 반환, drop 시 detach | VERIFIED | 취소하려면 `abort()` 명시 호출 필요 |
| `tokio::sync::mpsc`는 다중 생산자 단일 소비자 | VERIFIED | - |
| `tokio::sync::broadcast`는 다중 생산자 다중 소비자 | VERIFIED | - |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (tokio.rs, docs.rs)
- [✅] fact-checker로 핵심 클레임 검증 (7개)
- [✅] DISPUTED 항목 수정 반영 (클레임 1 → SKILL.md 수정 완료)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 전항목 PASS)

---

## 최종 판정

**APPROVED** — fact-checker 검증 + rust-backend-developer 활용 테스트 모두 완료.
