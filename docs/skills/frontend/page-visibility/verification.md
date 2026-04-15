---
skill: page-visibility
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | page-visibility |
| 스킬 경로 | `.claude/skills/frontend/page-visibility/SKILL.md` |
| 최초 작성일 | 2026-04-06 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | Page Visibility API (W3C Living Standard) |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | visibilityState 값, document 등록, document.hidden, 폴링 패턴, stale 갱신, beforeunload 비교 6개 | 6/6 PASS |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| MDN Page Visibility API | https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API | ⭐⭐⭐ High |
| W3C Page Visibility Living Standard | https://w3c.github.io/page-visibility/ | ⭐⭐⭐ High |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외 ("prerender" 상태 제거 반영)
- [✅] 버전 명시 (W3C Living Standard)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 6/6 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. 수정 불필요.
