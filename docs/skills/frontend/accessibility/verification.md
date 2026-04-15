---
skill: accessibility
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | accessibility |
| 스킬 경로 | `.claude/skills/frontend/accessibility/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | WCAG 2.1, WAI-ARIA 1.2 |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | ARIA 역할, 키보드 탐색, 포커스 관리, 색상 대비, 라이브 리전, 이미지 대체 텍스트 6개 | 3/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| WAI-ARIA Authoring Practices | https://www.w3.org/WAI/ARIA/apg/ | ⭐⭐⭐ High |
| MDN ARIA 문서 | https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA | ⭐⭐⭐ High |

---

## 활용 테스트 발견 사항 (수정 완료)

| 항목 | 내용 |
|------|------|
| Switch Space 키 누락 | Switch 컴포넌트에서 Enter만 처리 → Space + Enter 모두 처리하도록 수정, `e.preventDefault()` 추가 |
| Toast role/aria-live 중복 | `role="alert"` + `aria-live` 동시 사용 → `role` 단독 사용으로 수정 (`role="alert"` = assertive, `role="status"` = polite) |
| menuitem aria-selected 오류 | `aria-selected`는 menuitem에 사용 불가 → 제거, 포커스로 활성 항목 표시 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (WAI-ARIA APG)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (WCAG 2.1, WAI-ARIA 1.2)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)

---

## 최종 판정

**APPROVED** — 활용 테스트 완료. 3개 이슈 수정: Switch Space 키, Toast role/aria-live 중복, menuitem aria-selected 제거.
