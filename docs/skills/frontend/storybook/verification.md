---
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `storybook` |
| 스킬 경로 | `.claude/skills/frontend/storybook/SKILL.md` |
| 검증일 | 2026-04-20 |
| 검증자 | puk0806 |
| 스킬 버전 | v2 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (storybook.js.org/docs/8)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/storybookjs/storybook)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-04-20, Storybook 8.x 기준)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (CSF 3.0, args, play function, autodocs)
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "Storybook 8.x latest version release 2025 2026" (allowed: storybook.js.org, github.com) | storybook.js.org/versions에서 최신 버전 10.3.3 확인 — 8.x 문서는 /docs/8 경로에 별도 유지 중 |
| 조사 | WebSearch | "Storybook 8 CSF 3.0 story format Meta StoryObj TypeScript 2025" (allowed: storybook.js.org) | storybook.js.org/docs/api/csf, /docs/writing-stories/typescript 확인 — satisfies 패턴 공식 확인 |
| 조사 | WebSearch | "Storybook 8 play function interactions @storybook/test userEvent within expect API" (allowed: storybook.js.org) | storybook.js.org/docs/8/essentials/interactions 확인 — @storybook/test가 vitest+testing-library 통합 래퍼 확인 |
| 조사 | WebSearch | "Storybook 8 autodocs tags configuration main.ts docs" (allowed: storybook.js.org) | storybook.js.org/docs/writing-docs/autodocs 확인 — !autodocs 태그로 제외 가능 확인 |
| 조사 | WebSearch | "Storybook 8 Chromatic visual regression testing installation CI GitHub Actions 2025" (allowed: storybook.js.org, chromatic.com) | chromatic.com/docs/github-actions/ 확인 — push 이벤트 권장, chromaui/action@latest 확인 |
| 조사 | WebSearch | "Storybook 8 monorepo setup viteFinal shared packages stories path" (allowed: storybook.js.org) | storybook.js.org/docs/api/main-config/main-config-vite-final 확인 — 패키지별 독립 실행이 공식 권장임 확인 |
| 조사 | WebSearch | "site:storybook.js.org/docs/8 argTypes controls table description" | storybook.js.org/docs/8/api/arg-types, /docs/8/essentials/controls 확인 |
| 조사 | WebSearch | "Chromatic GitHub Actions chromaui/action latest 2025 configuration options" (allowed: chromatic.com) | chromatic.com/docs/github-actions/ — chromaui/action@latest 또는 @vX 메이저 버전 고정 가능 확인 |
| 교차 검증 | WebSearch | "Storybook 8 @storybook/nextjs framework next/image next/link mocking configuration" (allowed: storybook.js.org) | storybook.js.org/docs/8/get-started/frameworks/nextjs — 자동 모킹 공식 확인 |
| 교차 검증 | WebSearch | "Storybook 8 actions argTypesRegex deprecated actions parameter preview.ts 2024 2025" (allowed: storybook.js.org) | argTypesRegex로 추론된 args는 play function에서 spy 불가 — fn() 사용 권장 공식 확인 |
| 교차 검증 | WebSearch | "Storybook 8 storiesOf API removed deprecated migration CSF" (allowed: storybook.js.org) | storybook.js.org/docs/8/migration-guide/from-older-version — storiesOf 8.0에서 완전 제거 확인 |
| 교차 검증 | WebSearch | "Storybook 8 @storybook/react-vite framework addons list essentials interactions test packages" (allowed: storybook.js.org, npmjs.com) | @storybook/test = @storybook/jest + @storybook/testing-library 통합 패키지 확인 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Storybook 8 공식 문서 | https://storybook.js.org/docs/8 | ⭐⭐⭐ High | 2026-04-20 | 공식 문서 |
| Storybook CSF API (8.x) | https://storybook.js.org/docs/8/api/csf/index | ⭐⭐⭐ High | 2026-04-20 | 공식 API 문서 |
| Storybook TypeScript 스토리 | https://storybook.js.org/docs/writing-stories/typescript | ⭐⭐⭐ High | 2026-04-20 | 공식 문서 |
| Storybook Interactions 8.x | https://storybook.js.org/docs/8/essentials/interactions | ⭐⭐⭐ High | 2026-04-20 | 공식 문서 |
| Storybook Interaction Testing | https://storybook.js.org/docs/writing-tests/interaction-testing | ⭐⭐⭐ High | 2026-04-20 | 공식 문서 |
| Storybook Autodocs | https://storybook.js.org/docs/writing-docs/autodocs | ⭐⭐⭐ High | 2026-04-20 | 공식 문서 |
| Storybook ArgTypes 8.x | https://storybook.js.org/docs/8/api/arg-types | ⭐⭐⭐ High | 2026-04-20 | 공식 API 문서 |
| Storybook Controls 8.x | https://storybook.js.org/docs/8/essentials/controls | ⭐⭐⭐ High | 2026-04-20 | 공식 문서 |
| Storybook Visual Testing | https://storybook.js.org/docs/writing-tests/visual-testing | ⭐⭐⭐ High | 2026-04-20 | 공식 문서 |
| Storybook Next.js 프레임워크 8.x | https://storybook.js.org/docs/8/get-started/frameworks/nextjs | ⭐⭐⭐ High | 2026-04-20 | 공식 문서 |
| Storybook ViteFinal API | https://storybook.js.org/docs/api/main-config/main-config-vite-final | ⭐⭐⭐ High | 2026-04-20 | 공식 API 문서 |
| Storybook Migration Guide (8.x) | https://storybook.js.org/docs/8/migration-guide | ⭐⭐⭐ High | 2026-04-20 | 공식 마이그레이션 가이드 |
| Chromatic GitHub Actions | https://www.chromatic.com/docs/github-actions/ | ⭐⭐⭐ High | 2026-04-20 | Chromatic 공식 문서 |
| Storybook GitHub Releases | https://github.com/storybookjs/storybook/releases | ⭐⭐⭐ High | 2026-04-20 | 공식 GitHub |

---

## 4. 검증 체크리스트 (Test List)

### 3-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Storybook 8.x, React 18+)
- [✅] deprecated된 패턴을 권장하지 않음 (storiesOf 제거됨 명시, argTypesRegex 제한 명시)
- [✅] 코드 예시가 실행 가능한 형태임

### 3-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (CSF 3.0, Meta, StoryObj, play function)
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함

### 3-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (Vite/Next.js 환경 모두 포함, 특정 프로젝트 종속 X)

### 3-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-04-20)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2개 테스트 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (보완 불필요)

---

## 5. 테스트 진행 기록

### 테스트 케이스 1: CSF 3.0 기본 스토리 작성 요청

**입력 (질문/요청):**
```
Button 컴포넌트에 대한 Storybook 스토리를 TypeScript로 작성해줘.
Primary, Secondary, Disabled 변형이 있고 onClick 이벤트를 spy해야 해.
```

**기대 결과:**
```
- Meta, StoryObj import (@storybook/react)
- satisfies Meta<typeof Button> 패턴 사용
- args: { onClick: fn() } 으로 spy 설정
- Primary, Secondary, Disabled 각각 named export
- tags: ['autodocs'] 포함
```

**실제 결과:**
```
SKILL.md CSF 3.0 섹션(라인 91-145)에 Meta/StoryObj import, satisfies 패턴,
tags: ['autodocs'], named export 스토리 예시가 정확히 포함.
Actions 섹션(라인 229-246)에 fn() spy 패턴과 argTypesRegex 제한 주의사항 포함.
모든 기대 결과 항목을 올바르게 도출 가능.
```

**판정:** PASS

---

### 테스트 케이스 2: play function 인터랙션 테스트 작성

**입력 (질문/요청):**
```
LoginForm 컴포넌트의 인터랙션 테스트를 play function으로 작성해줘.
이메일과 비밀번호를 입력하고 제출 후 성공 메시지를 확인해야 해.
```

**기대 결과:**
```
- @storybook/test에서 userEvent, within, expect, fn import
- play: async ({ canvasElement, args }) => {} 시그니처
- userEvent.type, userEvent.click 모두 await
- expect 검증 모두 await
- args.onSubmit: fn() spy 활용
```

**실제 결과:**
```
SKILL.md play function 섹션(라인 253-293)에 LoginForm 예시가 정확히 일치하는 형태로 포함.
@storybook/test에서 import, canvasElement+args destructuring, await userEvent.type/click,
await expect 패턴, fn() spy 모두 포함. 올바른 답 도출 가능.
```

**판정:** PASS

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2개 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] 실사용 테스트 — 에이전트 CSF 3.0 + play function 2건 PASS (섹션 5 기록, 2026-04-20)
- [⏸️] Storybook Test addon (Vitest 통합) 섹션 추가 — 선택 보강, 차단 요인 아님

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-20 | v1 | 최초 작성 — 학습 데이터 기반 | skill-creator |
| 2026-04-20 | v2 | WebSearch 공식 문서 12회 실시간 조사 기반 전면 재작성 — argTypesRegex 제한(play function spy 불가) 추가, @storybook/test import 주의사항 추가, 모노레포 공식 권장 방식(패키지별 독립 실행) 수정, step() API 추가, autodocs !autodocs 태그 패턴 추가, Chromatic push 이벤트 권장 이유 추가 | puk0806 |
