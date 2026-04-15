---
skill: api-integration
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | api-integration |
| 스킬 경로 | `.claude/skills/frontend/api-integration/SKILL.md` |
| 최초 작성일 | 2026-04-01 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | TanStack Query v5, Next.js 15 |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | API 클라이언트 설계, TanStack Query 연동, 에러 핸들링, 낙관적 업데이트, Server Component 페칭, 캐시 전략 6개 | 5/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| TanStack Query v5 공식 | https://tanstack.com/query/latest/docs | ⭐⭐⭐ High |
| Next.js fetch 문서 | https://nextjs.org/docs/app/api-reference/functions/fetch | ⭐⭐⭐ High |

---

## 활용 테스트 발견 사항 (수정 완료)

| 항목 | 내용 |
|------|------|
| Server Component 예시 오류 | 상대 URL 사용 + `.json()` 누락 → 절대 URL로 수정, `.json()` 추가, Next.js 15 기본값(`no-store`) 주석 추가 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외 (TanStack Query v5 onSuccess/onError 제거 반영)
- [✅] 버전 명시 (TanStack Query v5, Next.js 15)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)

---

## 최종 판정

**APPROVED** — 활용 테스트 5/6 PASS. Server Component fetch 절대 URL + `.json()` + Next.js 15 캐시 기본값 주석 수정 완료.
