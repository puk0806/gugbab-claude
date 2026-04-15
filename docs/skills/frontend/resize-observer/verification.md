---
skill: resize-observer
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | resize-observer |
| 스킬 경로 | `.claude/skills/frontend/resize-observer/SKILL.md` |
| 최초 작성일 | 2026-04-06 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | ResizeObserver API (W3C, Safari 15.4+) |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | contentBoxSize 접근, contentRect 레거시 여부, box 옵션, React cleanup, 초기 콜백, Safari 지원 6개 | 6/6 PASS |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| MDN ResizeObserver | https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver | ⭐⭐⭐ High |
| WebKit Blog Safari 15.4 | https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/ | ⭐⭐⭐ High |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외 (contentRect 레거시 명시)
- [✅] 버전 명시 (contentBoxSize Safari 15.4+)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 6/6 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. 수정 불필요.
