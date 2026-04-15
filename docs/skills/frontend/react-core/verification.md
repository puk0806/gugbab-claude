---
skill: react-core
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | react-core |
| 스킬 경로 | `.claude/skills/frontend/react-core/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | 이전 세션 5/6 PASS + 수동 수정 |
| 버전 기준 | React 18 / React 19 |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | React 18/19 비교표, Concurrent Features, Automatic Batching, Actions, useOptimistic, ref as prop 6개 | 5/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| React 19 릴리즈 블로그 | https://react.dev/blog/2024/12/05/react-19 | ⭐⭐⭐ High |
| React v18 릴리즈 블로그 | https://react.dev/blog/2022/03/29/react-v18 | ⭐⭐⭐ High |

---

## 활용 테스트 발견 사항 (수정 완료)

| 항목 | 내용 |
|------|------|
| React 18 vs 19 자동 배칭 행 오류 | "React 18: 이벤트 핸들러만, React 19: Promise/setTimeout 포함"으로 잘못 기술 → React 18에서 이미 Promise/setTimeout 배칭 도입됨. "React 18: Promise/setTimeout 포함 (React 17: 이벤트 핸들러만), React 19: 동일"으로 수정 완료 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (react.dev)
- [✅] deprecated 패턴 제외 (ReactDOM.render 등)
- [✅] 버전 명시 (React 18 / React 19)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)

---

## 최종 판정

**APPROVED** — 활용 테스트 완료. 자동 배칭 React 18 vs 19 비교표 오류 수정 (React 18에서 Promise/setTimeout 배칭이 이미 도입됨).
