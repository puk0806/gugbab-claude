---
skill: bundling-compiler
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | bundling-compiler |
| 스킬 경로 | `.claude/skills/frontend/bundling-compiler/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | Vite 5-8, Next.js 15/16, React Compiler 1.x |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | Vite 설정, Next.js 빌드, React Compiler, 번들 분석, 환경변수, Tree shaking 6개 | 3/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Next.js reactCompiler 설정 | https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler | ⭐⭐⭐ High |
| @vitejs/plugin-react v6 릴리즈 | https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-react@6.0.0 | ⭐⭐⭐ High |

---

## 활용 테스트 발견 사항 (수정 완료)

| 항목 | 내용 |
|------|------|
| reactCompiler 위치 오류 | `experimental.reactCompiler` → Next.js 15+ top-level `reactCompiler: true` 수정 완료 |
| Vite React Compiler 버전 구분 누락 | @vitejs/plugin-react v5 (babel 옵션) vs v6 (@rolldown/plugin-babel) 분기 추가 완료 |
| turbopack 설정 오류 | `experimental: { turbopack: true }` → CLI 플래그 + top-level 커스터마이징 객체로 수정 완료 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (Vite 5-8, Next.js 15/16)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)

---

## 최종 판정

**APPROVED** — 활용 테스트 완료. 3개 이슈 수정: reactCompiler top-level, Vite v5/v6 버전 구분, turbopack 설정 방식.
