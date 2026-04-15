---
skill: nextjs
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | nextjs |
| 스킬 경로 | `.claude/skills/frontend/nextjs/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | Next.js 15/16 App Router |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | App Router 구조, 데이터 페칭, Server Actions, 렌더링 전략, 메타데이터 API, Route Handlers 6개 | 4/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Next.js App Router 문서 | https://nextjs.org/docs/app | ⭐⭐⭐ High |
| Next.js 15 블로그 | https://nextjs.org/blog/next-15 | ⭐⭐⭐ High |
| Next.js 16 블로그 | https://nextjs.org/blog/next-16 | ⭐⭐⭐ High |

---

## 활용 테스트 발견 사항 (수정 완료)

| 항목 | 내용 |
|------|------|
| fetch 기본 캐싱 정책 오류 | `cache: 'force-cache'`를 기본값으로 표기 → Next.js 15+에서는 `no-store`가 기본값. 주석 수정 완료 |
| 메타데이터 API 누락 | `metadata` export / `generateMetadata` 함수 섹션 완전 누락 → 섹션 추가 완료 |
| unstable_cache 대체 API 미언급 | Next.js 16 `'use cache'` 디렉티브 섹션 추가 완료 |
| useActionState Server Action 시그니처 | `createPost` 함수에 `prevState` 첫 번째 파라미터 누락 → 수정 완료 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (nextjs.org/docs)
- [✅] deprecated 패턴 제외 (middleware.ts → proxy.ts 구분 명시)
- [✅] 버전 명시 (Next.js 15/16)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)

---

## 최종 판정

**APPROVED** — 활용 테스트 완료. 4개 이슈 수정: fetch 기본 캐싱 정책(Next.js 15+), 메타데이터 API 섹션 추가, `'use cache'` 디렉티브 추가, useActionState prevState 파라미터 추가.
