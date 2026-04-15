---
skill: code-convention
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | code-convention |
| 스킬 경로 | `.claude/skills/frontend/code-convention/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | ESLint 9, Biome 최신, Husky v9 |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | 도구 선택 기준, ESLint flat config, Prettier 연동, Husky 설정, 모노레포 공유 설정, Biome 전환 6개 | 4/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| ESLint Flat Config 공식 | https://eslint.org/docs/latest/use/configure/configuration-files | ⭐⭐⭐ High |
| eslint-config-prettier | https://github.com/prettier/eslint-config-prettier | ⭐⭐⭐ High |

---

## 활용 테스트 발견 사항 (수정 완료)

| 항목 | 내용 |
|------|------|
| eslint-config-prettier import 경로 오류 | `'eslint-config-prettier'` → `'eslint-config-prettier/flat'` (flat config용 서브패스) 수정 완료 |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외 (ESLint 9 flat config 반영)
- [✅] 버전 명시 (ESLint 9, Husky v9)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)

---

## 최종 판정

**APPROVED** — 활용 테스트 완료. eslint-config-prettier flat config 서브패스(`/flat`) 수정 완료.
