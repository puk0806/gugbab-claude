---
skill: design-patterns
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | design-patterns |
| 스킬 경로 | `.claude/skills/frontend/design-patterns/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | React 18/19 |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | Container/Presentational, HOC, Factory(선택) 3개 (나머지 3개는 스킬 스코프 외) | 3/3 PASS |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| React 공식 문서 | https://react.dev | ⭐⭐⭐ High |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (React 18/19)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 3/3 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 3/3 PASS. Container/Presentational, HOC 패턴 모두 정확.
