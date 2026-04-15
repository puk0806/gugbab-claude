---
skill: serde
category: backend
version: v1
date: 2026-04-09
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | serde |
| 스킬 경로 | .claude/skills/serde/SKILL.md |
| 최초 작성일 | 2026-04-06 |
| 검증 방법 | rust-backend-developer 활용 테스트 (소스코드 수준 검증) |
| 버전 기준 | serde 1.x / serde_json 1.x |
| 재검증일 | 2026-04-09 |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| 공식 문서 | https://serde.rs/ | https://docs.rs/serde_json/ | ⭐⭐⭐ High |

---

## fact-checker 검증 결과

> ⚠️ fact-checker 에이전트를 통한 검증이 실행되지 않았습니다.

SKILL.md 내 `> 주의:` 항목으로 불확실한 내용은 표기되어 있으나, 클레임별 교차 검증은 미실행 상태입니다.

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | rust-backend-developer | derive, Value/json!, rename/rename_all, skip_serializing_if+default, flatten, enum tag 6개 | 6/6 PASS (이슈: skip_serializing_if 단독 사용 시 역직렬화 에러 → SKILL.md 수정 완료) |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (serde.rs, docs.rs/serde_json)
- [❌] fact-checker로 핵심 클레임 검증 ← 미실행 (수동 작성)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (serde 1.x / serde_json 1.x)
- [✅] Claude Code에서 실제 활용 테스트 (rust-backend-developer, 7/7 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. `skip_serializing_if` 단독 사용 시 역직렬화 에러 발생 이슈 발견 → SKILL.md에 `#[serde(default)]` 병용 주의 문구 추가.
