---
skill: tokio
category: backend
version: v1
date: 2026-04-06
status: UNVERIFIED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | tokio |
| 스킬 경로 | .claude/skills/tokio/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 검증 방법 | 수동 작성 (skill-creator 에이전트 미사용) |
| 버전 기준 | tokio 1.x (최신 안정) |
| 현재 상태 | **UNVERIFIED** — fact-checker 미실행, 재검증 필요 |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| tokio 공식 사이트 | https://tokio.rs/ | ⭐⭐⭐ High |
| docs.rs/tokio | https://docs.rs/tokio/latest/tokio/ | ⭐⭐⭐ High |

---

## fact-checker 검증 결과

> ⚠️ fact-checker 에이전트를 통한 검증이 실행되지 않았습니다.

| 클레임 | 판정 | 비고 |
|--------|------|------|
| `#[tokio::main]`은 `macros` + `rt-multi-thread` feature 필요 | 미검증 | SKILL.md에 주의로 표기됨 |
| `.await` 포함 시 `tokio::sync::Mutex` 사용 | 미검증 | 공식 문서 권장 사항 |
| `spawn_blocking`은 별도 스레드 풀에서 실행 | 미검증 | - |

---

## 검증 체크리스트

- [x] 공식 문서 1순위 소스 확인 (tokio.rs, docs.rs)
- [ ] fact-checker로 핵심 클레임 검증 ← **미실행**
- [ ] DISPUTED 항목 수정 반영 ← **미실행**
- [x] deprecated 패턴 제외
- [x] 버전 명시

---

## 최종 판정

**UNVERIFIED** — 공식 문서 소스를 사용했으나 skill-creator 에이전트 파이프라인(fact-checker)을 거치지 않음. 재검증 필요.
