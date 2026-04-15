---
skill: component-design
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | component-design |
| 스킬 경로 | `.claude/skills/frontend/component-design/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | React 18/19 |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | 컴포넌트 분리 기준, Compound Component, Controlled/Uncontrolled, 합성 패턴, Render Props, 재사용성 6개 | 5/6 PASS |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| React 공식 문서 | https://react.dev/learn/thinking-in-react | ⭐⭐⭐ High |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (React 18/19)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 5/6 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 5/6 PASS. Render Props 패턴 미포함(의도적 스코프 제외), 핵심 패턴 모두 정확.
