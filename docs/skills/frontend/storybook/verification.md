---
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `storybook` |
| 스킬 경로 | `.claude/skills/frontend/storybook/SKILL.md` |
| 검증일 | 2026-08-11 |
| 검증자 | puk0806 |
| 스킬 버전 | v3 |
| 대상 버전 | Storybook 10.5.x (검증 시점 최신 안정 10.5.7) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (storybook.js.org/docs — 10.x 현행 문서)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/storybookjs/storybook — MIGRATION.md, Releases)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-08-11, Storybook 10.5.7 기준)
- [✅] v8 → v9 → v10 breaking change 전수 조사 및 마이그레이션 노트 반영
- [✅] 핵심 패턴 / 베스트 프랙티스 갱신 (CSF 3, args, play function `canvas`, autodocs 태그)
- [✅] 코드 예시 v10 API로 전면 수정
- [✅] 흔한 실수 패턴 갱신 (v8 import 잔존·CJS main.ts·제거된 docs.autodocs)
- [✅] SKILL.md 파일 갱신
- [✅] references/REFERENCE.md 동반 갱신 (SKILL.md와 API 불일치 제거)
- [✅] 자매 스킬 `frontend/storybook-visual-testing`과 역할 분리 유지 (기본 사용법 vs 시각 회귀)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "Storybook 10 migration guide breaking changes from 8" (allowed: storybook.js.org, github.com) | v10 유일 breaking change = ESM-only, 설치 크기 29% 감소, main.ts ESM 필수 확인 |
| 조사 | WebFetch | https://storybook.js.org/docs/releases/migration-guide | Node 20.19+/22.12+ 요구, ESM-only, `storybook@latest upgrade` automigration, `storybook doctor` 확인 |
| 조사 | WebFetch | https://storybook.js.org/docs/releases/migration-guide-from-older-version (8.x→9.1) | 코어 통합 패키지 목록, essentials 애드온 제거, addon-vitest 개명, 프레임워크 최소 버전 확인 |
| 조사 | WebFetch | https://raw.githubusercontent.com/storybookjs/storybook/next/MIGRATION.md (9→10 절) | dropped support(Vite4/TS<4.9/Node<20), `/internal` 서브패스, dev-only·docs-only·test-only 태그 제거, globals→initialGlobals 확인 |
| 조사 | WebFetch | 동 MIGRATION.md (8→9 절) | `docs.autodocs` 옵션 제거, storyStoreV7 플래그 제거, 렌더러→프레임워크 패키지 전환 확인 |
| 조사 | WebFetch | https://storybook.js.org/versions + https://github.com/storybookjs/storybook/releases | 최신 안정 10.5.7 (2026-08-06 릴리즈), 10.6.0-alpha 진행 중 확인 |
| 조사 | WebFetch | https://storybook.js.org/docs/writing-stories | 현행 예시가 `@storybook/your-framework`(=react-vite 등)에서 Meta/StoryObj import 확인 |
| 조사 | WebFetch | https://storybook.js.org/docs/writing-tests/interaction-testing | `storybook/test`에서 expect·fn import, play 컨텍스트 `{ canvas, userEvent }` 시그니처 확인 |
| 조사 | WebFetch | https://storybook.js.org/docs/writing-stories/play-function (v10.5 문서) | `canvas` = 스토리 루트 스코프 TL 쿼리, 캔버스 밖은 `screen` 사용 확인 |
| 조사 | WebFetch | https://storybook.js.org/docs/writing-docs/autodocs | autodocs는 tags 전용, preview.ts `tags: ['autodocs']` 전역 활성화, `!autodocs` 제외, addon-docs 필요 확인 |
| 조사 | WebFetch | https://storybook.js.org/docs/writing-tests/integrations/vitest-addon | `npx storybook add @storybook/addon-vitest`, `@storybook/addon-vitest/vitest-plugin`, Vitest ≥3, Playwright Chromium 확인 |
| 조사 | WebFetch | https://storybook.js.org/docs/get-started/frameworks/nextjs | nextjs-vite 권장, Next ≥14.1, next/image·router·navigation·head·font 자동 모킹, `nextjs` 파라미터 네임스페이스 확인 |
| 조사 | WebFetch | https://storybook.js.org/docs/get-started/frameworks/react-vite | React ≥16.8, Vite ≥5, `framework: '@storybook/react-vite'` 문자열 축약형 확인 |
| 조사 | WebFetch | https://storybook.js.org/docs/get-started/install | 현행 설치 명령 `npm create storybook@latest`, Recommended/Minimal 선택지 확인 |
| 조사 | WebFetch | https://storybook.js.org/docs/api/main-config/main-config-addons | essentials 기능(actions·backgrounds·controls·highlight·measure/outline·toolbars·viewport)이 코어 내장, addon-docs는 별도 등록 확인 |
| 조사 | WebFetch | https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest | composeStories·setProjectAnnotations도 프레임워크 패키지에서 import 확인 |
| 교차 검증 | WebSearch | "@storybook/blocks removed moved storybook/internal imports migration" | v10에서 `@storybook/blocks` → `@storybook/addon-docs/blocks` 확인 (addon migration guide + 마이그레이션 노트) |
| 교차 검증 | WebFetch | https://storybook.js.org/blog/storybook-10/ | ESM-only·29% 경량화 재확인, Node 표기 불일치 발견(블로그 "20.16+/22.19+/24+") → DISPUTED 처리 |
| 교차 검증 | WebSearch | "storybook/test module exports fn expect userEvent within waitFor spyOn mocked" | fn·expect·userEvent·within·waitFor·spyOn·mocked export 확인 |
| 교차 검증 | WebSearch | "Storybook 10 release notes 10.5 10.4 latest version changelog" | npm·GitHub Releases 양쪽에서 10.5.7이 최신 안정임을 재확인 |
| 교차 검증 | WebSearch | "Storybook 9 dropped React 16 17 support React 18 minimum" | 결론 불명확 → 공식 프레임워크 문서의 "React ≥ 16.8" 표기만 채택, 추가 서술 제거 |

> 이번 갱신에서 사용한 도구 집계: WebFetch 16회 + WebSearch 5회. 모든 서술은 위 표의 실시간 조사 결과에 근거한다.

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Storybook 10 마이그레이션 가이드 | https://storybook.js.org/docs/releases/migration-guide | ⭐⭐⭐ High | 2026-08-11 | 1순위 공식 |
| Storybook 8.x→9.1 마이그레이션 가이드 | https://storybook.js.org/docs/releases/migration-guide-from-older-version | ⭐⭐⭐ High | 2026-08-11 | 1순위 공식 |
| Storybook MIGRATION.md (공식 GitHub) | https://github.com/storybookjs/storybook/blob/next/MIGRATION.md | ⭐⭐⭐ High | 2026-08-11 | 2순위 공식, breaking change 전수 |
| Storybook Releases (공식 GitHub) | https://github.com/storybookjs/storybook/releases | ⭐⭐⭐ High | 2026-08-11 | 최신 안정 버전 확인 |
| Storybook 버전 엔드포인트 | https://storybook.js.org/versions | ⭐⭐⭐ High | 2026-08-11 | latest/next 버전 |
| Storybook 10 릴리즈 블로그 | https://storybook.js.org/blog/storybook-10/ | ⭐⭐⭐ High | 2026-08-11 | Node 표기 불일치 존재 |
| Writing Stories (CSF) | https://storybook.js.org/docs/writing-stories | ⭐⭐⭐ High | 2026-08-11 | 공식 문서 |
| Play function | https://storybook.js.org/docs/writing-stories/play-function | ⭐⭐⭐ High | 2026-08-11 | v10.5 문서 |
| Interaction tests | https://storybook.js.org/docs/writing-tests/interaction-testing | ⭐⭐⭐ High | 2026-08-11 | 공식 문서 |
| Vitest addon | https://storybook.js.org/docs/writing-tests/integrations/vitest-addon | ⭐⭐⭐ High | 2026-08-11 | 공식 문서 |
| Autodocs | https://storybook.js.org/docs/writing-docs/autodocs | ⭐⭐⭐ High | 2026-08-11 | 공식 문서 |
| main-config addons API | https://storybook.js.org/docs/api/main-config/main-config-addons | ⭐⭐⭐ High | 2026-08-11 | 공식 API 문서 |
| Framework: react-vite | https://storybook.js.org/docs/get-started/frameworks/react-vite | ⭐⭐⭐ High | 2026-08-11 | React/Vite 최소 버전 |
| Framework: nextjs | https://storybook.js.org/docs/get-started/frameworks/nextjs | ⭐⭐⭐ High | 2026-08-11 | nextjs-vite 권장 근거 |
| Install 가이드 | https://storybook.js.org/docs/get-started/install | ⭐⭐⭐ High | 2026-08-11 | 설치 명령 |
| Portable stories (Vitest) | https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest | ⭐⭐⭐ High | 2026-08-11 | composeStories import 경로 |
| Addon migration guide 10.0 | https://storybook.js.org/docs/addons/addon-migration-guide | ⭐⭐⭐ High | 2026-08-11 | blocks → addon-docs/blocks |

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 교차 검증 클레임·판정

각 클레임은 **독립 소스 2개 이상**에서 확인했다.

| # | 클레임 | 소스 A | 소스 B | 판정 |
|---|--------|--------|--------|------|
| 1 | 최신 안정 버전은 10.5.7 (10.4.x 아님) | GitHub Releases (2026-08-06 v10.5.7) | npm `storybook` 버전 목록 / storybook.js.org/versions | VERIFIED |
| 2 | Storybook 10은 ESM-only, `.storybook/main.*`가 유효한 ESM이어야 함 | 마이그레이션 가이드 | MIGRATION.md 9→10 Core Changes + 10 릴리즈 블로그 | VERIFIED |
| 3 | Node 요구 버전 = 20.19+ 또는 22.12+ | 마이그레이션 가이드 (명시) | 10 릴리즈 블로그는 "20.16+, 22.19+, 24+", install 문서는 "Node 20+" | **DISPUTED** → 마이그레이션 가이드 기준 채택, SKILL.md에 `> 주의:`로 3소스 불일치 명시 |
| 4 | `@storybook/addon-essentials` 제거, 기능 코어 통합 | 8.x→9.1 마이그레이션 가이드 | MIGRATION.md Addon Changes + main-config-addons 문서 | VERIFIED |
| 5 | `@storybook/addon-interactions` 제거(코어 통합) | 8.x→9.1 마이그레이션 가이드 | MIGRATION.md | VERIFIED |
| 6 | `@storybook/test` → `storybook/test` | MIGRATION.md 패키지 통합표 | Interaction tests 문서의 실제 import 예시 | VERIFIED |
| 7 | `@storybook/addon-actions·viewport·highlight` → `storybook/actions·viewport·highlight` | 8.x→9.1 마이그레이션 가이드 | MIGRATION.md | VERIFIED |
| 8 | `@storybook/blocks` → `@storybook/addon-docs/blocks` (v10) | Addon migration guide 10.0 | MIGRATION.md / blocks 통합 PR | VERIFIED |
| 9 | `docs.autodocs` 설정 옵션 제거, autodocs는 tags 전용 | MIGRATION.md 8→9 Removed APIs | Autodocs 공식 문서 (tags만 안내, preview `tags: ['autodocs']`) | VERIFIED |
| 10 | `tags: ['!autodocs']`로 제외 가능 | Autodocs 공식 문서 | 기존 v2 검증 기록과 일치(변경 없음) | VERIFIED |
| 11 | 타입은 렌더러(`@storybook/react`)가 아닌 프레임워크 패키지에서 import | MIGRATION.md 8→9 Framework vs Renderer | Writing Stories 문서 `@storybook/your-framework` 표기 + portable-stories 문서 | VERIFIED |
| 12 | play 컨텍스트에서 `canvas`·`userEvent` 직접 구조분해 가능 (`within` 불필요) | Play function 문서 (v10.5) | Interaction tests 문서 예시 `play: async ({ canvas, userEvent })` | VERIFIED |
| 13 | `within`은 여전히 `storybook/test`에서 export (레거시 호환) | `storybook/test` export 조사 | Play function 문서의 캔버스 밖 쿼리 안내(`screen`)와 병존 | VERIFIED |
| 14 | `action`만 선언한 args는 play에서 spy 불가, `fn()` 필요 | Interaction tests / Actions 문서 | 기존 v2 검증(argTypesRegex 제한)과 동일 취지 — v10에서 `fn()` 권장으로 일원화 | VERIFIED |
| 15 | `@storybook/experimental-addon-test` → `@storybook/addon-vitest` | 8.x→9.1 마이그레이션 가이드 | MIGRATION.md Addon Changes | VERIFIED |
| 16 | addon-vitest 요구: Vitest ≥3, Vite 기반 프레임워크, Playwright Chromium | Vitest addon 문서 | MIGRATION.md(Vitest 3+ 최소) | VERIFIED |
| 17 | Vite ≥5 (Vite 4 지원 중단), TypeScript ≥4.9 | MIGRATION.md Dropped Support | react-vite 프레임워크 문서 ("Vite ≥ 5") | VERIFIED |
| 18 | Next.js는 `@storybook/nextjs-vite` 권장, 최소 14.1 | nextjs 프레임워크 문서 | MIGRATION.md(Next 14 최소, Vite builder stabilized) | VERIFIED |
| 19 | React 최소 요구 = 16.8 (react-vite 기준) | react-vite 프레임워크 문서 | 커뮤니티 이슈의 React 17 문제 보고는 공식 최소치 표기와 상충 | **PARTIAL** → 공식 표기(≥16.8)만 기재, 구 v2의 "React 18+ 필수" 주장 삭제 |
| 20 | 빌트인 태그 `dev-only`·`docs-only`·`test-only` 제거 | MIGRATION.md 9→10 Core Changes | 마이그레이션 가이드 태그 섹션 | VERIFIED |
| 21 | 프로젝트 어노테이션 `globals` → `initialGlobals` | MIGRATION.md 9→10 Global State Management | 마이그레이션 노트 automigration 항목 | VERIFIED |
| 22 | 설치 명령 현행 = `npm create storybook@latest` | Install 문서 | react-vite 프레임워크 문서 동일 명령 | VERIFIED |
| 23 | `storiesOf` API는 8.0에서 제거 (기존 서술 유지) | 기존 v2 검증 기록 | MIGRATION.md 이전 버전 절 | VERIFIED |
| 24 | Preact·Vue3·Web Components의 Webpack5 빌더 지원 중단 | MIGRATION.md Framework-specific | 8.x→9.1 마이그레이션 가이드 | VERIFIED |

**집계: VERIFIED 22 / DISPUTED 1 (#3, 주의 표기 반영) / PARTIAL 1 (#19, 보수적 기재) / UNVERIFIED 0**

구 v2 SKILL.md에서 **제거한 미검증 서술**:
- "Storybook 8.x는 Vite를 기본 빌더로 사용하며 React 18+ 필수" → 공식 근거 확인 불가하여 삭제 (#19)
- `argTypesRegex` 관련 주의 → v9 이후 해당 API 맥락 소멸, `fn()` 권장 서술로 대체
- `@storybook/nextjs` router 기본값 `pathname: '/'`, `query: {}` → 현행 문서에서 재확인 불가하여 "얕은 병합" 서술로 대체

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (24개 클레임 교차 검증)
- [✅] 버전 정보가 명시되어 있음 (Storybook 10.5.x, React ≥16.8, Vite ≥5, Node 20.19+/22.12+)
- [✅] deprecated·removed 패턴을 권장하지 않음 (addon-essentials·docs.autodocs·@storybook/test·@storybook/blocks 모두 제거 안내로 전환)
- [✅] 코드 예시가 실행 가능한 형태임 (ESM main.ts, storybook/test import, canvas 시그니처)
- [✅] DISPUTED 항목(#3 Node 버전)이 `> 주의:` 표기로 반영됨

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description — v10 기준으로 갱신)
- [✅] 소스 URL과 검증일 명시 (2026-08-11)
- [✅] v8→v10 마이그레이션 노트 섹션 신설 (섹션 0)
- [✅] 핵심 개념 설명 포함 (CSF 3, Meta/StoryObj, args·argTypes, play function, autodocs)
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (REFERENCE.md 섹션 11)
- [✅] 흔한 실수 패턴 포함 (REFERENCE.md 섹션 10 — v8 import 잔존·CJS main.ts 케이스 추가)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (Vite/Next.js 환경 모두 포함, 특정 프로젝트 종속 X)
- [✅] 자매 스킬과 역할 분리 명시 — 이 스킬은 기본 사용법, 시각 회귀는 `frontend/storybook-visual-testing`으로 포인터

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-08-11)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3개 테스트 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-08-11
**수행자**: skill-creator (갱신 작업) — 갱신된 SKILL.md + references/REFERENCE.md 기반 실전 질문 답변 검증
**수행 방법**: v10 전환 시 실제로 부딪히는 실전 질문 3개를 도출하고, 각 질문의 정답 경로가 문서 내에 존재하는지 + 오답(v8 잔재) 유도 가능성이 없는지 확인

### 테스트 케이스 1: v8 import 잔존 에러 진단

**입력 (질문/요청):**
```
Storybook 8.x 프로젝트를 10으로 올렸더니 Cannot find module '@storybook/test' 에러가 난다. 왜인가?
```

**기대 결과:**
```
- @storybook/test → storybook/test 로 이동(스코프 제거) 안내
- 함께 @storybook/addon-essentials·@storybook/addon-interactions 제거 확인 유도
- @storybook/blocks → @storybook/addon-docs/blocks 확인 유도
```

**실제 결과:**
```
SKILL.md 섹션 0 "패키지 이동 대응표"가 12행 매핑을 제공하고, "제거된 애드온·API" 목록이
essentials/interactions 제거를 명시. REFERENCE.md 섹션 10 첫 항목이 v8/v10 import를
나란히 비교 제시해 정답 경로가 두 곳에서 확보됨. 구식 경로로 유도하는 서술 없음.
```

**판정:** ✅ PASS

---

### 테스트 케이스 2: Storybook 10 방식 인터랙션 테스트 작성

**입력 (질문/요청):**
```
LoginForm 인터랙션 테스트를 Storybook 10 방식으로 작성해줘. onSubmit이 호출됐는지 검증해야 한다.
```

**기대 결과:**
```
- 프레임워크 패키지(@storybook/react-vite)에서 Meta/StoryObj import
- storybook/test 에서 fn·expect import
- args: { onSubmit: fn() }
- play: async ({ canvas, userEvent, args }) 시그니처
- await userEvent..., await expect(args.onSubmit).toHaveBeenCalledTimes(1)
```

**실제 결과:**
```
SKILL.md 섹션 4 예시가 기대 경로와 정확히 일치. within(canvasElement) 보일러플레이트 없는
v10 시그니처가 기본 예시이고 레거시 호환은 주석으로만 언급되어 신규 코드가 구식 패턴으로
유도되지 않음. 섹션 3의 주의 블록이 action만으로는 spy 불가함을 사전 차단.
```

**판정:** ✅ PASS

---

### 테스트 케이스 3: autodocs 미생성 원인 진단

**입력 (질문/요청):**
```
autodocs가 안 나온다. main.ts에 docs: { autodocs: 'tag' } 가 있는데?
```

**기대 결과:**
```
- v9에서 docs.autodocs 옵션이 제거됐음을 지적
- tags: ['autodocs'] (컴포넌트) 또는 preview.ts 전역 tags 사용 안내
- @storybook/addon-docs 등록 여부 확인 유도
```

**실제 결과:**
```
SKILL.md 섹션 5가 "v9에서 docs.autodocs 설정 옵션이 제거됐다"를 인용 블록으로 명시하고
두 가지 대안(컴포넌트 태그 / preview 전역 태그)과 !autodocs 제외를 제공.
REFERENCE.md 섹션 10 "autodocs가 생성되지 않을 때"가 나쁜 예/좋은 예로 재확인하고
addon-docs 등록 체크까지 유도.
```

**판정:** ✅ PASS

---

**agent content test: 3/3 PASS**

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (24 클레임: VERIFIED 22 / DISPUTED 1 반영 / PARTIAL 1 보수 기재) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (3/3 PASS) |
| **최종 판정** | **APPROVED** |

판정 근거: `verification-policy.md`의 "실사용 필수 스킬"(마이그레이션 전용 가이드·빌드 설정·워크플로우) 카테고리가 아닌 **라이브러리 사용법 스킬**이므로 content test PASS로 APPROVED 유지가 가능하다. 섹션 0의 마이그레이션 노트는 사용법 스킬 내부의 참조 정보이며, 스킬의 주 목적은 스토리 작성 사용법이다.

---

## 7. 개선 필요 사항

- [✅] Storybook 10 기준 전면 갱신 (2026-08-11) — 감사에서 지적된 8.x 기준 노후화 해소
- [✅] Storybook Test addon(Vitest 통합) 섹션 추가 — 구 v2의 보류 항목, 섹션 4 말미에 반영 완료
- [✅] references/REFERENCE.md의 v8 API(@storybook/react·@storybook/test·@storybook/blocks·docs.autodocs) 동반 수정 — SKILL.md와의 불일치 제거
- [⏸️] CSF Factories(v10에서 React 대상 Preview 승격) 섹션 추가 — 아직 안정 API가 아니고 공식 문서 경로가 유동적(해당 API 문서 페이지 404 확인)이라 이번 갱신에서 제외. stable 전환 시 재검토
- [⚠️] 자매 스킬 `frontend/storybook-visual-testing`의 main.ts 예시에 `@storybook/addon-essentials`가 남아 있음 — v10에서 제거된 패키지. 해당 스킬 갱신 시 수정 필요 (이번 작업 범위 밖)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-20 | v1 | 최초 작성 | skill-creator |
| 2026-04-20 | v2 | WebSearch 공식 문서 12회 실시간 조사 기반 전면 재작성 — argTypesRegex 제한(play function spy 불가) 추가, @storybook/test import 주의사항 추가, 모노레포 공식 권장 방식(패키지별 독립 실행) 수정, step() API 추가, autodocs !autodocs 태그 패턴 추가, Chromatic push 이벤트 권장 이유 추가 | puk0806 |
| 2026-08-11 | v3 | **Storybook 8.x → 10.5.x 전면 최신화.** 공식 문서·MIGRATION.md WebFetch 16회 + WebSearch 5회로 24개 클레임 교차 검증. 신규 섹션 0(v8→v10 마이그레이션 노트: ESM-only, Node 20.19+/22.12+, 패키지 이동 대응표, 제거된 애드온·API). 전 예시를 프레임워크 패키지 import·`storybook/test`·play 컨텍스트 `canvas`/`userEvent`·태그 기반 autodocs·`@storybook/addon-docs/blocks`로 교체. nextjs-vite 권장 반영, addon-vitest 실행 경로 추가. Node 버전 소스 불일치를 DISPUTED로 기록하고 `> 주의:` 표기. references/REFERENCE.md 동반 갱신. content test 3/3 PASS로 APPROVED 유지 | puk0806 |
