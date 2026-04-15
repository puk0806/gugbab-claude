---
skill: testing
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | testing |
| 스킬 경로 | `.claude/skills/frontend/testing/SKILL.md` |
| 최초 작성일 | 2026-04-01 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | Jest 최신, Vitest 최신, @testing-library/react v13+ |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | setupFilesAfterEnv, renderHook import, vi.mocked, vi.mock 동적 import, RTL 쿼리 우선순위, userEvent.setup 6개 | 5/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Jest 공식 설정 문서 | https://jestjs.io/docs/configuration | ⭐⭐⭐ High |
| Testing Library About Queries | https://testing-library.com/docs/queries/about/ | ⭐⭐⭐ High |
| Vitest Mock API | https://vitest.dev/api/mock | ⭐⭐⭐ High |

---

## 활용 테스트 발견 사항 (수정 완료)

| 항목 | 내용 |
|------|------|
| setupFilesAfterFramework 오타 | `setupFilesAfterFramework` → `setupFilesAfterEnv` 수정. 잘못된 키는 Jest가 무시하므로 setup 파일이 실행되지 않는 심각한 오류 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외 (@testing-library/react-hooks → @testing-library/react 내장 반영)
- [✅] 버전 명시
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)

---

## 최종 판정

**APPROVED** — 활용 테스트 5/6 PASS. `setupFilesAfterEnv` 오타 수정 완료.
