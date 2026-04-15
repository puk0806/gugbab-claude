---
skill: typescript
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | typescript |
| 스킬 경로 | `.claude/skills/frontend/typescript/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | TypeScript 5.x / @types/react 18+ |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | tsconfig/moduleResolution, 타입 vs 인터페이스, 유틸리티 타입, React 타입 패턴, 타입 가드, as const/satisfies 6개 | 6/6 PASS (수정 사항 없음) |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| TypeScript 핸드북 | https://www.typescriptlang.org/docs/handbook | ⭐⭐⭐ High |
| tsconfig 레퍼런스 | https://www.typescriptlang.org/tsconfig | ⭐⭐⭐ High |
| React TypeScript 가이드 | https://react.dev/learn/typescript | ⭐⭐⭐ High |

---

## 활용 테스트 발견 사항

| 항목 | 내용 |
|------|------|
| React.FC children 자동 포함 주석 | 이전 세션 사전 수정: "@types/react 18 이후 children 자동 포함 제거됨" 명시 |
| moduleResolution node 설명 | 이전 세션 사전 수정: "deprecated, 신규 프로젝트 사용 비권장" 추가 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (typescriptlang.org)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (TypeScript 5.x, @types/react 18+)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 6/6 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. 모든 패턴 정확. 이전 세션에서 사전 수정된 React.FC 주석 및 moduleResolution node 설명 포함.
