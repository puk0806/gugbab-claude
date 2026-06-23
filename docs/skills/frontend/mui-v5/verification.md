---
skill: mui-v9
category: frontend
version: v2
date: 2026-06-19
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `mui-v9` (구: mui-v5) |
| 스킬 경로 | `.claude/skills/frontend/mui-v5/SKILL.md` |
| 검증일 | 2026-06-19 |
| 검증자 | Claude (Sonnet 4.6) |
| 스킬 버전 | v2 (MUI v5 → v9 전면 재작성) |

---

## 1. 작업 목록

- [✅] MUI v6~v9 출시 이력 및 Breaking Changes 조사 (WebSearch + WebFetch)
- [✅] v9 공식 설치 및 API 교차 검증 (mui.com 공식 문서)
- [✅] slots/slotProps, Grid size prop, System props 제거 등 핵심 변경 검증
- [✅] CSS Variables + colorSchemes + applyStyles() 패턴 검증
- [✅] v5→v9 마이그레이션 Breaking Changes 표 작성
- [✅] SKILL.md v2 재작성 완료

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | MUI v9 출시일, 버전 체계 | v9.1.1 최신, v8 스킵 확인 |
| 조사 | WebFetch | mui.com/material-ui/migration/upgrade-to-v9/ | slots/slotProps, Grid API, System props 제거 확인 |
| 조사 | WebFetch | mui.com/blog/introducing-material-ui-v9/ | v9 주요 변경점 확인 |
| 조사 | WebFetch | mui.com/material-ui/customization/css-theme-variables/ | cssVariables 옵션, colorSchemes 검증 |
| 교차검증 | WebSearch | npm @mui/material versions | v9.1.1 안정 버전 확인 |
| 재작성 | Write | SKILL.md | v5→v9 전면 재작성 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 비고 |
|--------|-----|--------|------|
| MUI Getting Started | https://mui.com/material-ui/getting-started/ | ⭐⭐⭐ High | 설치, ThemeProvider |
| MUI v9 Upgrade Guide | https://mui.com/material-ui/migration/upgrade-to-v9/ | ⭐⭐⭐ High | Breaking Changes |
| MUI v9 Blog | https://mui.com/blog/introducing-material-ui-v9/ | ⭐⭐⭐ High | v9 주요 변경점 |
| MUI CSS Theme Variables | https://mui.com/material-ui/customization/css-theme-variables/usage/ | ⭐⭐⭐ High | cssVariables, colorSchemes |
| MUI Grid Component | https://mui.com/material-ui/react-grid/ | ⭐⭐⭐ High | v9 Grid API (size prop) |
| MUI Dark Mode | https://mui.com/material-ui/customization/dark-mode/ | ⭐⭐⭐ High | applyStyles(), colorSchemes |
| npm @mui/material | https://www.npmjs.com/package/@mui/material | ⭐⭐⭐ High | 버전 확인 (v9.1.1) |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] 패키지명 변경 없음 (`@mui/material`) — VERIFIED
- [✅] v9에서 System props 직접 사용 제거 확인 (Box mt={2} → sx 필수) — VERIFIED
- [✅] Grid `size` prop, `size={{ xs:12, sm:6 }}` 반응형 — VERIFIED
- [✅] `direction="column"` 미지원, Stack으로 대체 — VERIFIED
- [✅] `slots`/`slotProps` 통일 (componentsProps 제거) — VERIFIED
- [✅] `theme.applyStyles('dark', {...})` 패턴 — VERIFIED
- [✅] `cssVariables: true` + `colorSchemes` 정식 옵션 — VERIFIED
- [✅] `InitColorSchemeScript` SSR 깜빡임 방지 — VERIFIED
- [✅] `disableEscapeKeyDown` 제거 → onClose reason 처리 — VERIFIED
- [✅] CSS 복합 클래스 변경 (`.MuiButton-textPrimary` → 다중 선택자) — VERIFIED
- [✅] v8은 존재하지 않음 (v7 → v9, MUI X 번호 맞춤) — VERIFIED

### 4-2. 구조 완전성

- [✅] YAML frontmatter (name, description)
- [✅] 소스 URL + 검증일 명시
- [✅] 설치 → 기본설정 → 스타일링 → 테마 → 오버라이드 → TypeScript → 레이아웃 순서
- [✅] v5→v9 Breaking Changes 요약 표
- [✅] slots/slotProps 마이그레이션 예시

### 4-3. 실용성

- [✅] CSS Variables 패턴과 기본 패턴 둘 다 제공 (선택지 제공)
- [✅] v5 구 방식 / v9 신 방식 대조 코드 예시
- [✅] Grid v5→v9 마이그레이션 표

### 4-4. 에이전트 활용 테스트

- [✅] 3개 실전 질문 PASS (섹션 5 참조)

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-19
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변

Q1. "MUI v9에서 Grid 반응형 레이아웃 (xs:12, sm:6, md:4) 작성하는 방법은?" — PASS (SKILL.md 섹션 7 Grid: `size={{ xs: 12, sm: 6, md: 4 }}` 패턴 정확 제시)

Q2. "다크 모드 지원하는 MUI 테마를 CSS Variables 방식으로 설정하고 싶어. InitColorSchemeScript는 왜 필요해?" — PASS (SKILL.md 섹션 1 CSS Variables + colorSchemes + InitColorSchemeScript SSR 깜빡임 방지 설명 정확)

Q3. "v5에서 `<TextField InputProps={{ startAdornment: <SearchIcon /> }} InputLabelProps={{ shrink: true }} />`처럼 쓰던 코드를 v9로 변환하면?" — PASS (SKILL.md 섹션 6 slots/slotProps: `slotProps={{ input: {startAdornment:...}, inputLabel: {shrink:true} }}` 정확 제시)

agent content test: 3/3 PASS

---

## 6. 검증 결과 요약

| 클레임 | 판정 | 소스 |
|--------|------|------|
| `@mui/material` 패키지명 변경 없음 | VERIFIED | npm + 공식 문서 |
| v9에서 System props 제거 | VERIFIED | 마이그레이션 가이드 |
| Grid `size` prop (xs/sm 개별 prop 제거) | VERIFIED | 공식 Grid 문서 |
| slots/slotProps 통일 (v7~v9) | VERIFIED | 마이그레이션 가이드 |
| `theme.applyStyles('dark', {...})` | VERIFIED | 다크 모드 가이드 |
| `cssVariables: true` + `colorSchemes` | VERIFIED | CSS Theme Variables 문서 |
| v8 미존재 (v7→v9 점프) | VERIFIED | npm 버전 목록 + 블로그 |
| 최신 안정 버전 v9.1.1 | VERIFIED | npm |

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (3/3 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] v5→v9 전면 재작성 완료 (2026-06-19)
- [⏸️] Next.js App Router + Emotion SSR 패턴 업데이트 검토 (v9에서 `ThemeProvider` 직접 사용 시 Emotion cache 설정 변경 여부 확인 권장)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-20 | v1 | 최초 작성 — MUI v5 기준 핵심 패턴 | skill-creator |
| 2026-06-19 | v2 | MUI v9 기준 전면 재작성 — System props 제거, Grid size prop, slots/slotProps, cssVariables+colorSchemes, applyStyles, v5→v9 Breaking Changes 표 추가. 검증일 갱신. | Claude (Sonnet 4.6) |
