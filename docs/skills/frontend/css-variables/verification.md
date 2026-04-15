---
skill: css-variables
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | css-variables |
| 스킬 경로 | `.claude/skills/css-variables/SKILL.md` |
| 최초 작성일 | 2026-04-06 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | CSS Custom Properties (W3C Level 1) |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | 중첩 폴백, 미디어 쿼리 사용 불가, getPropertyValue 공백, invalid 값 처리, @property 애니메이션, calc 나눗셈 6개 | 6/6 PASS → SKILL.md 보완 후 APPROVED |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| MDN CSS Custom Properties | https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties | ⭐⭐⭐ High |
| W3C CSS Variables Level 1 | https://www.w3.org/TR/css-variables-1/ | ⭐⭐⭐ High |

---

## 활용 테스트 발견 사항 (수정 완료)

| 항목 | 내용 |
|------|------|
| getPropertyValue 선행 공백 누락 | JS 연동 코드에 `.trim()` 추가. CSS 선언 값 앞 공백이 반환값에 포함되어 실무에서 버그 유발 가능 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (MDN + W3C)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (CSS Custom Properties W3C Level 1)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 6/6 PASS)

---

## 최종 판정

**APPROVED** — 활용 테스트 6/6 PASS. getPropertyValue `.trim()` 추가 완료.
