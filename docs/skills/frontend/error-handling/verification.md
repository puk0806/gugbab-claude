---
skill: error-handling
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | error-handling |
| 스킬 경로 | `.claude/skills/frontend/error-handling/SKILL.md` |
| 최초 작성일 | 2026-04-01 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | React 19, TanStack Query v5, react-error-boundary 최신 |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | Error Boundary 클래스 전용, fallbackRender API, createRoot 에러 콜백, TanStack Query v5 onError, throwOnError, useActionState 6개 | 6/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| React 19 공식 블로그 | https://react.dev/blog/2024/12/05/react-19 | ⭐⭐⭐ High |
| createRoot 공식 문서 | https://react.dev/reference/react-dom/client/createRoot | ⭐⭐⭐ High |
| TanStack Query v5 마이그레이션 | https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5 | ⭐⭐⭐ High |

---

## 활용 테스트 발견 사항 (수정 완료)

| 항목 | 내용 |
|------|------|
| onRecoverableError 시그니처 누락 | `(error)` → `(error, errorInfo)` 수정. 다른 두 콜백과 동일하게 errorInfo.componentStack 접근 가능 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외 (useFormState → useActionState, useErrorBoundary → throwOnError 반영)
- [✅] 버전 명시 (React 19, TanStack Query v5)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. onRecoverableError 시그니처 `(error, errorInfo)` 수정 완료.
