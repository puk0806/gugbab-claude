---
skill: performance
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | performance |
| 스킬 경로 | `.claude/skills/frontend/performance/SKILL.md` |
| 최초 작성일 | 2026-04-01 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | React 19, React Compiler v1.0, TanStack Virtual v3, Next.js 15 |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | React Compiler 출시일, use-no-memo, TanStack Virtual API, next/dynamic ssr:false, Profiler onRender, 수동 최적화 케이스 6개 | 5/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| React Compiler v1.0 블로그 | https://react.dev/blog/2025/10/07/react-compiler-1 | ⭐⭐⭐ High |
| React Profiler 공식 | https://react.dev/reference/react/Profiler | ⭐⭐⭐ High |
| TanStack Virtual 공식 | https://tanstack.com/virtual/latest/docs | ⭐⭐⭐ High |

---

## 활용 테스트 발견 사항 (수정 완료)

| 항목 | 내용 |
|------|------|
| Profiler onRender 파라미터 누락 | 3개만 표기 → 6개 전체 파라미터(id, phase, actualDuration, baseDuration, startTime, commitTime) 타입 포함 수정 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (React Compiler v1.0, TanStack Virtual v3)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)

---

## 최종 판정

**APPROVED** — 활용 테스트 5/6 PASS. Profiler onRender 6개 파라미터 시그니처 수정 완료.
