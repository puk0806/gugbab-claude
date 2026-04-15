---
skill: monorepo-turborepo
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | monorepo-turborepo |
| 스킬 경로 | `.claude/skills/frontend/monorepo-turborepo/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | Turborepo 2.x, pnpm 최신 |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | 폴더 구조, turbo.json tasks, workspace:*, exports, Remote Caching, pnpm-workspace 6개 | 6/6 PASS |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Turborepo 공식 문서 | https://turborepo.dev/repo/docs | ⭐⭐⭐ High |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외 (v1 pipeline → v2 tasks 반영 확인)
- [✅] 버전 명시 (Turborepo 2.x)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 6/6 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. Turborepo 2.x tasks 키, workspace:* 프로토콜, exports 필드 모두 정확.
