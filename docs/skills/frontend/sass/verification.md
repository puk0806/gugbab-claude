---
skill: sass
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | sass |
| 스킬 경로 | `.claude/skills/frontend/sass/SKILL.md` |
| 최초 작성일 | 2026-04-01 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | Dart Sass 최신 (1.80+) |

---

## 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | BEM 중첩, map 함수, rem 나눗셈, @forward/@use, CRA URL, visually-hidden 6개 | 2/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Sass 공식 문서 | https://sass-lang.com/documentation/ | ⭐⭐⭐ High |
| Sass Breaking Change: Slash as Division | https://sass-lang.com/documentation/breaking-changes/slash-div/ | ⭐⭐⭐ High |
| Sass Breaking Change: @import and global built-ins | https://sass-lang.com/documentation/breaking-changes/import/ | ⭐⭐⭐ High |

---

## 활용 테스트 발견 사항 (수정 완료)

| 항목 | 내용 |
|------|------|
| 글로벌 map 함수 deprecated | `map-has-key()`, `map-get()` → `@use 'sass:map'` + `map.has-key()`, `map.get()` 수정 (Dart Sass 1.80+ deprecated, 3.0에서 제거 예정) |
| `/` 나눗셈 deprecated | `#{$px / 16}rem` → `@use 'sass:math'` + `math.div($px, 16) * 1rem` 수정 (Dart Sass 1.33+ deprecated) |
| CRA deprecated URL | `create-react-app.dev` → `nextjs.org/docs/.../styling/sass` 교체 (CRA 2025년 공식 sunsetting) |
| `clip` deprecated | `clip: rect(0, 0, 0, 0)` → `clip-path: inset(50%)` 수정 (visually-hidden 현대 표준) |

---

## 검증 체크리스트

- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외 (글로벌 map 함수, / 나눗셈, @import, clip 속성 모두 반영)
- [✅] 버전 명시 (Dart Sass 1.80+)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)

---

## 최종 판정

**APPROVED** — 활용 테스트 완료. 4개 이슈 수정: sass:map 모듈, math.div(), CRA URL, clip-path.
