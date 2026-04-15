---
skill: mutation-observer
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | mutation-observer |
| 스킬 경로 | `.claude/skills/frontend/mutation-observer/SKILL.md` |
| 최초 작성일 | 2026-04-02 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | MutationObserver API (DOM Living Standard) |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | 자식 노드 감지, 속성 변경 감지, 필터링, React 훅 연동, 메모리 해제, takeRecords 6개 | 5/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| MDN MutationObserver | https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver | ⭐⭐⭐ High |
| DOM Living Standard | https://dom.spec.whatwg.org/#interface-mutationobserver | ⭐⭐⭐ High |

---

## 활용 테스트 발견 사항 (수정 완료)

| 항목 | 내용 |
|------|------|
| React useEffect 연동 패턴 누락 | `useMutationObserver` 훅 패턴 추가 (useEffect + disconnect 정리) |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인 (MDN + DOM Living Standard)
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (DOM Living Standard)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)

---

## 최종 판정

**APPROVED** — 활용 테스트 5/6 PASS. React useEffect 연동 훅 패턴(`useMutationObserver`) 추가 완료.
