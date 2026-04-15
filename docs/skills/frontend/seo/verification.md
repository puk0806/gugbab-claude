---
skill: seo
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | seo |
| 스킬 경로 | `.claude/skills/frontend/seo/SKILL.md` |
| 최초 작성일 | 2026-04-01 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | Next.js 15 App Router |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | generateMetadata params Promise, ResolvingMetadata, JSON-LD script 삽입, XSS 방지, generateSitemaps 50000, MetadataRoute 타입 6개 | 6/6 PASS |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Next.js generateMetadata | https://nextjs.org/docs/app/api-reference/functions/generate-metadata | ⭐⭐⭐ High |
| Next.js JSON-LD 가이드 | https://nextjs.org/docs/app/guides/json-ld | ⭐⭐⭐ High |
| Next.js generateSitemaps | https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps | ⭐⭐⭐ High |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외 (Next.js 15 params Promise 반영)
- [✅] 버전 명시 (Next.js 15)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 6/6 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. 수정 불필요.
