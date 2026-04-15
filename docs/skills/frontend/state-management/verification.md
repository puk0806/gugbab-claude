---
skill: state-management
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | state-management |
| 스킬 경로 | `.claude/skills/frontend/state-management/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | Zustand v5, TanStack Query v5 |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | 상태 선택 기준, Zustand, TanStack Query, Context, Jotai, 의사결정 기준 6개 | 5/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Zustand useShallow 레퍼런스 | https://zustand.docs.pmnd.rs/reference/hooks/use-shallow | ⭐⭐⭐ High |
| TanStack Query v5 마이그레이션 | https://tanstack.com/query/v5/docs/framework/react/guides/migrating-to-v5 | ⭐⭐⭐ High |

---

## 활용 테스트 발견 사항 (수정 완료)

| 항목 | 내용 |
|------|------|
| useShallow import 경로 오류 | `'zustand/shallow'` → `'zustand/react/shallow'` (Zustand v5 공식). 3곳 모두 수정 완료 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외 (cacheTime→gcTime, onSuccess/onError in useQuery 제거 반영)
- [✅] 버전 명시 (Zustand v5, TanStack Query v5)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)

---

## 최종 판정

**APPROVED** — 활용 테스트 5/6 PASS. useShallow import 경로 `'zustand/react/shallow'`로 수정 완료.
