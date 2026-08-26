---
skill: mui-v5
category: frontend
version: v1
date: 2026-08-26
status: APPROVED
---

# mui-v5 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `mui-v5` |
| 스킬 경로 | `.claude/skills/frontend/mui-v5/SKILL.md` |
| 검증일 | 2026-08-26 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 기준 버전 | `@mui/material` 5.x 라인 (최종 릴리스 5.18.0 / 2025-07-08), Emotion 11, React 17~19 |
| 작성 배경 | 레거시 React SPA에서 사용 중인 MUI v5.10 계열 대응. 레포에 v9 스킬만 있어 상위 버전 API(size prop Grid, slots/slotProps, cssVariables)가 오답으로 유도되는 문제 해소 |

---

## 1. 작업 목록 (Task List)

- [✅] 검증 템플릿 확인 (`docs/skills/VERIFICATION_TEMPLATE.md` — 8개 섹션 구조 확보)
- [✅] 중복 스킬 확인 (`.claude/skills/frontend/mui-v*/SKILL.md` → `mui-v9`만 존재, `mui-v5` 신규)
- [✅] 기존 `frontend/mui-v9` SKILL.md Read → 서술 범위 분리·상호 참조 지점 결정
- [✅] 공식 문서 1순위 소스 확인 (v5 전용 문서 사이트 `v5.mui.com` + 현행 `mui.com` 지원/마이그레이션 페이지)
- [✅] 공식 GitHub 2순위 소스 확인 (릴리스 API, v5.18.0/v5.10.0 태그 소스, 지원 정책 원문 md, 코드모드 README, 이슈 #44413)
- [✅] v5 최종 마이너 버전·지원 상태(EOL) 확정 (npm dist-tags + 공식 지원 표)
- [✅] 핵심 패턴 정리 (Emotion styled/sx/theme.components, createTheme, TS module augmentation)
- [✅] v5 Grid(item·xs) / `Unstable_Grid2` / v6·v7·v9 대비표 작성
- [✅] 다크모드 — v5 정식(`palette.mode`) vs 실험적 CSS variables 구분 서술
- [✅] 성능 주의점 정리 (공식 벤치마크 수치 + 회피 패턴)
- [✅] React 18/19 호환 및 `@mui/styles`(JSS) 함정 정리
- [✅] v5 → v6 → v7 → v9 업그레이드 경로 + `@mui/codemod` 명령 정리
- [✅] 흔한 실수 패턴 표 작성 (15종)
- [✅] SKILL.md 파일 작성
- [✅] verification.md 작성
- [❌] skill-tester 2단계 테스트 (본 작업 범위 밖 — 오케스트레이터가 별도 수행)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md`, `docs/skills/frontend/tanstack-query/verification.md` | 8개 섹션 구조·작성 관례 확보 |
| 중복 확인 | Glob | `.claude/skills/frontend/mui-v*/SKILL.md` | `mui-v9`만 존재 → 신규 생성 확정 |
| 범위 분리 | Read | `.claude/skills/frontend/mui-v9/SKILL.md` | v9 = size prop Grid·slots/slotProps·cssVariables·applyStyles 담당 → v5 스킬은 v5 고유 API 중심으로 작성하고 업그레이드 상세는 v9로 포인터 연결 |
| 조사 | WebSearch | "MUI v5 latest version 5.18 support status", "MUI v5 support policy EOL", "material-ui v5.18.0 CSS layers backport", "Unstable_Grid2 introduced version", "Material UI supported versions table LTS" | 5회 검색 — 검색 결과만으로는 최신 상태 확인 불가(오래된 결과 다수) → 전 항목 공식 원문 페치로 재확인 |
| 조사 | WebFetch | `mui.com/versions`, `mui.com/material-ui/getting-started/support/`, `registry.npmjs.org/@mui/material`(dist-tags), `@mui/material/5.18.0`·`5.10.0`(peerDeps), `api.github.com` 릴리스 v5.18.0·v5.16.14, 이슈 #44413 | v5 최종 5.18.0(2025-07-08), dist-tag `latest-v5`, 지원 종료 상태, peer 변화(React 19 백포트) 확인 |
| 조사 | WebFetch | v5 문서 8종: react-grid, react-grid2, theme-components, theming, dark-mode, experimental-api/css-theme-variables(usage·customization), system/styles/basics, system/getting-started/usage, the-sx-prop, guides/server-rendering, guides/next-js-app-router, guides/composition, migration/troubleshooting, api/modal, api/text-field | v5 고유 API·제약·성능 수치·SSR 배선·TS 보강 원문 확보 |
| 조사 | WebFetch | GitHub raw: `v5.18.0` styles/index.js·CssVarsProvider.tsx·InitColorSchemeScript.tsx, `v5.10.0` styles/index.js, master `support.md`, master `mui-codemod/README.md`, blog `build-layouts-faster-with-grid-v2.md` | export 명칭·마이너별 가용성·코드모드 목록을 소스 레벨로 확인 |
| 조사 | WebFetch | `mui.com/material-ui/migration/upgrade-to-v6/`, `upgrade-to-v7/` | 단계별 breaking change·codemod 명령 확보 |
| 교차 검증 | WebSearch + WebFetch | 15개 클레임, 각 2개 이상 독립 소스 대조 | VERIFIED 12 / DISPUTED 2 / UNVERIFIED 1 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Material UI 지원 정책 (Supported versions 표) | https://mui.com/material-ui/getting-started/support/ | ⭐⭐⭐ High | 2026-08-26 | v9 ✅ / v7 ⚠️ LTS / v6 ❌ / v5 ❌ |
| 동 문서 GitHub 원문 (master) | https://raw.githubusercontent.com/mui/material-ui/master/docs/data/material/getting-started/support/support.md | ⭐⭐⭐ High | 2026-08-26 | 지원 표 verbatim 재확인 |
| npm registry — dist-tags | https://registry.npmjs.org/@mui/material | ⭐⭐⭐ High | 2026-08-26 | `latest-v5: 5.18.0`, `latest-v6: 6.5.0`, `latest-v7: 7.3.11`, `latest: 9.3.1` |
| npm registry — 5.18.0 메타 | https://registry.npmjs.org/@mui/material/5.18.0 | ⭐⭐⭐ High | 2026-08-26 | peer: react ^17\|\|^18\|\|^19, @emotion/react ^11.5.0, @emotion/styled ^11.3.0 |
| npm registry — 5.10.0 메타 | https://registry.npmjs.org/@mui/material/5.10.0 | ⭐⭐⭐ High | 2026-08-26 | peer: react ^17\|\|^18 (React 19 없음), @mui/base 5.0.0-alpha.92 |
| GitHub Release API — v5.18.0 | https://api.github.com/repos/mui/material-ui/releases/tags/v5.18.0 | ⭐⭐⭐ High | 2026-08-26 | published_at 2025-07-08, CSS layers v7→v5 백포트 |
| GitHub Issue #44413 | https://api.github.com/repos/mui/material-ui/issues/44413 | ⭐⭐⭐ High | 2026-08-26 | "[v5] Support React 19 in Material UI v5" — closed 2024-12-17 |
| v5 문서 — Grid | https://v5.mui.com/material-ui/react-grid/ | ⭐⭐⭐ High | 2026-08-26 | container/item, xs~xl, 상속 규칙, direction=column 제약 |
| v5 문서 — Grid v2 | https://v5.mui.com/material-ui/react-grid2/ | ⭐⭐⭐ High | 2026-08-26 | `@mui/material/Unstable_Grid2`, unstable 경고, xsOffset |
| MUI 블로그 — Grid v2 도입 (GitHub 원문) | https://raw.githubusercontent.com/mui/material-ui/master/docs/pages/blog/build-layouts-faster-with-grid-v2.md | ⭐⭐⭐ High | 2026-08-26 | "shipped with Material UI v5.9.0" |
| v5 문서 — theme components | https://v5.mui.com/material-ui/customization/theme-components/ | ⭐⭐⭐ High | 2026-08-26 | defaultProps/styleOverrides(ownerState)/variants 배열, 함수형 props 5.15.2+ |
| v5 문서 — theming (TypeScript) | https://v5.mui.com/material-ui/customization/theming/ | ⭐⭐⭐ High | 2026-08-26 | `declare module '@mui/material/styles'`, createTheme 중첩, `theme.vars` 예약 |
| v5 문서 — dark mode | https://v5.mui.com/material-ui/customization/dark-mode/ | ⭐⭐⭐ High | 2026-08-26 | palette.mode + useMediaQuery + useMemo 컨텍스트 토글, applyStyles 언급 없음 |
| v5 문서 — CSS theme variables (usage/customization) | https://v5.mui.com/material-ui/experimental-api/css-theme-variables/usage/ | ⭐⭐⭐ High | 2026-08-26 | experimental_extendTheme / Experimental_CssVarsProvider / colorSchemes / TS 수동 보강 |
| v5 소스 — styles/index.js (v5.18.0) | https://raw.githubusercontent.com/mui/material-ui/v5.18.0/packages/mui-material/src/styles/index.js | ⭐⭐⭐ High | 2026-08-26 | `experimental_extendTheme` export 확인, `applyStyles` 없음 |
| v5 소스 — CssVarsProvider.tsx (v5.18.0) | https://raw.githubusercontent.com/mui/material-ui/v5.18.0/packages/mui-material/src/styles/CssVarsProvider.tsx | ⭐⭐⭐ High | 2026-08-26 | `Experimental_CssVarsProvider`, `useColorScheme`, `getInitColorSchemeScript`(deprecated) |
| v5 소스 — InitColorSchemeScript (v5.18.0) | https://raw.githubusercontent.com/mui/material-ui/v5.18.0/packages/mui-material/src/InitColorSchemeScript/InitColorSchemeScript.tsx | ⭐⭐⭐ High | 2026-08-26 | 후기 마이너에 컴포넌트 형태 존재 확인 |
| v5 소스 — styles/index.js (v5.10.0) | https://raw.githubusercontent.com/mui/material-ui/v5.10.0/packages/mui-material/src/styles/index.js | ⭐⭐⭐ High | 2026-08-26 | 5.10.0에도 experimental_extendTheme·makeStyles 위임 export 존재 |
| v5 문서 — @mui/styles basics | https://v5.mui.com/system/styles/basics/ | ⭐⭐⭐ High | 2026-08-26 | deprecated, "not compatible with React.StrictMode or React 18" |
| v5 문서 — 성능 트레이드오프 | https://v5.mui.com/system/getting-started/usage/ | ⭐⭐⭐ High | 2026-08-26 | div 100 / styled 181 / Box+sx 296, 번들 ~15kB 고정 |
| v5 문서 — sx prop | https://v5.mui.com/system/getting-started/the-sx-prop/ | ⭐⭐⭐ High | 2026-08-26 | theme 콜백·배열·반응형, 동적 값은 CSS 변수 권장 |
| v5 문서 — SSR 가이드 | https://v5.mui.com/material-ui/guides/server-rendering/ | ⭐⭐⭐ High | 2026-08-26 | createCache·CacheProvider·createEmotionServer·요청별 캐시 |
| v5 문서 — Next.js App Router | https://v5.mui.com/material-ui/guides/next-js-app-router/ | ⭐⭐⭐ High | 2026-08-26 | `@mui/material-nextjs@^5`, AppRouterCacheProvider, enableCssLayer |
| v5 문서 — 마이그레이션 트러블슈팅 | https://v5.mui.com/material-ui/migration/troubleshooting/ | ⭐⭐⭐ High | 2026-08-26 | `declare module '@mui/styles/defaultTheme'` 해법 |
| v5 API — Modal | https://v5.mui.com/material-ui/api/modal/ | ⭐⭐⭐ High | 2026-08-26 | components/componentsProps + slots/slotProps 병존, alias·deprecation 안내 |
| v5 API — TextField | https://v5.mui.com/material-ui/api/text-field/ | ⭐⭐⭐ High | 2026-08-26 | InputProps/inputProps/InputLabelProps만, slots 없음 |
| 마이그레이션 — Upgrade to v6 | https://mui.com/material-ui/migration/upgrade-to-v6/ | ⭐⭐⭐ High | 2026-08-26 | Grid2 안정화·size/offset·applyStyles·react-is override·codemod |
| 마이그레이션 — Upgrade to v7 | https://mui.com/material-ui/migration/upgrade-to-v7/ | ⭐⭐⭐ High | 2026-08-26 | Grid→GridLegacy, Grid2→Grid, deep import 제한, codemod |
| @mui/codemod README (master 원문) | https://raw.githubusercontent.com/mui/material-ui/master/packages/mui-codemod/README.md | ⭐⭐⭐ High | 2026-08-26 | 네임스페이스 목록, `deprecations/all`, `v5.0.0/preset-safe` |
| MUI System 지원 페이지 | https://mui.com/system/getting-started/support/ | ⭐⭐ Medium | 2026-08-26 | v5를 "Stable major"로 표기한 **오래된 내용** — DISPUTED 처리(4-5 #2) |
| 레포 내 기존 스킬 | `.claude/skills/frontend/mui-v9/SKILL.md` | ⭐⭐⭐ High | 2026-08-26 | 서술 범위 분리 기준 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 2건은 공식 원문 기준으로 서술 수정 반영)
- [✅] 버전 정보가 명시되어 있음 (v5 최종 5.18.0 / 2025-07-08, Emotion 11, React peer 범위, 기능별 최소 마이너 표)
- [✅] deprecated된 패턴을 권장하지 않음 (`@mui/styles`는 제거 대상으로만 서술, 실험 API는 신규 대규모 도입 비권장 명시)
- [✅] 코드 예시가 실행 가능한 형태임 (TSX/TS, import 경로 포함)
- [✅] 상위 버전 전용 API를 v5 코드로 제시하지 않음 (`size` prop, `slots/slotProps`, `cssVariables`, `applyStyles` 모두 "v5에 없음"으로 명시)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (`> 소스:` 7개 URL, `> 검증일: 2026-08-26`)
- [✅] 핵심 개념 설명 포함 (Emotion 엔진, 스타일링 3방식 선택 기준, 테마 구조)
- [✅] 코드 예시 포함 (전 11개 섹션)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (스킬 서두 v5 고정 레거시 전용 명시, sx vs styled 선택 기준, 실험 API 도입 판단 기준)
- [✅] 흔한 실수 패턴 포함 (표 15종 + 섹션별 `> 주의:` 블록)
- [✅] 기존 `frontend/mui-v9` 스킬과 상호 참조 (서두·Grid 대비표·업그레이드 섹션·문서 말미 4곳에서 포인터)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (Grid 대비표, 리스트 sx 회피 코드, codemod 명령 나열)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X — 레거시 React SPA 일반에 적용)
- [✅] 마이너 버전 편차를 확인하는 방법 제공 (`npm ls`, 기능별 최소 마이너 표, API 문서 확인 안내)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] skill-tester 호출을 통한 2단계 테스트 (2026-08-26 수행 — general-purpose 에이전트 4회, 4/4 PASS)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (전 답변이 SKILL.md 근거 섹션·줄 번호를 정확히 인용)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (DISPUTED/에러 0건 — 보완 불필요, 경미한 gap 2건만 섹션 7에 기록)

### 4-5. 교차 검증 판정표

| # | 클레임 | 소스 1 | 소스 2 | 판정 |
|---|--------|--------|--------|------|
| 1 | v5 최종 릴리스는 **5.18.0**이며 2025-07-08 배포, npm dist-tag는 `latest-v5` | npm registry dist-tags (`latest-v5: 5.18.0`) | GitHub Release API `v5.18.0` published_at 2025-07-08 | **VERIFIED** |
| 2 | v5는 **공식 지원 종료(❌)** 상태이며 LTS는 v7, 현행 stable은 v9. 지원 보장 범위는 "현재 메이저 + 직전 메이저" | mui.com Material UI 지원 페이지 Supported versions 표 | GitHub master `support.md` 원문 (동일 표 verbatim) | **DISPUTED → 수정 반영** (4-6 참조) |
| 3 | v5 `Grid`는 `container`/`item` + `xs`~`xl` prop 방식이며 `offset`이 없고, `direction="column"`에서는 브레이크포인트 prop 미지원 | v5 문서 react-grid | v5 문서 react-grid2(구 Grid의 한계로 offset 부재·item prop 언급) | **VERIFIED** |
| 4 | Grid v2는 v5에서 `@mui/material/Unstable_Grid2`로 import하는 **실험적(unstable)** 컴포넌트이며 **v5.9.0**부터 제공, offset은 `xsOffset`/`mdOffset` 형태 | v5 문서 react-grid2 ("introduced it as `Unstable_Grid2`… before making it stable in the next major") | MUI 공식 블로그 원문 ("shipped with Material UI v5.9.0") | **VERIFIED** |
| 5 | v6에서 Grid2 안정화(`size`/`offset` prop 전환), v7에서 구 `Grid` → `GridLegacy`, `Grid2` → `Grid`로 개명 | 공식 Upgrade to v6 (codemod `v6.0.0/grid-v2-props`) | 공식 Upgrade to v7 (codemod `v7.0.0/grid-props`, `.MuiGrid2-root`→`.MuiGrid-root`) | **VERIFIED** |
| 6 | v5의 슬롯 API 명칭은 `components`/`componentsProps`이나, **Base UI 파생 컴포넌트에는 `slots`/`slotProps`도 이미 존재**하고 `componentsProps`는 `slotProps`의 alias | v5 Modal API (components/componentsProps + slots/slotProps 병존, alias·deprecation 문구) | v5 TextField API (slots 없음, InputProps 계열만) — 컴포넌트별 편차 확인 | **DISPUTED → 수정 반영** (4-6 참조) |
| 7 | v5 `TextField`는 `InputProps`/`inputProps`/`InputLabelProps`/`FormHelperTextProps`/`SelectProps`를 쓰며 slots API가 없다 | v5 TextField API 문서 | `frontend/mui-v9` 스킬의 v5→v9 대비표(구 방식으로 동일 prop 명시) | **VERIFIED** |
| 8 | v5의 CSS 변수 테마는 **실험 단계**이며 `experimental_extendTheme` + `Experimental_CssVarsProvider` + `useColorScheme` 조합, `colorSchemes`는 extendTheme 전용 | v5 experimental-api 문서(usage·customization) | v5.18.0 소스 `styles/index.js`·`CssVarsProvider.tsx` export 명칭 | **VERIFIED** |
| 9 | v5에는 `theme.applyStyles()`가 없고 다크 분기는 `theme.palette.mode === 'dark'` | v5 dark-mode 문서(applyStyles 언급 없음, palette.mode 방식만) | 공식 Upgrade to v6("`theme.applyStyles()` replaces `theme.palette.mode` checks", codemod 제공) | **VERIFIED** |
| 10 | SSR 깜빡임 방지 API 명칭이 v5 구간 내에서 변경됨: `getInitColorSchemeScript()`(deprecated) → `InitColorSchemeScript` 컴포넌트(5.18.0에 존재) | v5.18.0 `CssVarsProvider.tsx` (getInitColorSchemeScript deprecated, "Use `InitColorSchemeScript` instead") | v5.18.0 `InitColorSchemeScript/InitColorSchemeScript.tsx` 파일 존재 확인 | **VERIFIED (도입 마이너는 미확정 — #15 참조)** |
| 11 | `@mui/styles`(JSS)는 v5에서 deprecated이며 **React 18·StrictMode와 호환되지 않고 앞으로도 업데이트되지 않는다** | v5 문서 system/styles/basics 원문 인용 | 공식 이슈 #32142 "[@mui/styles] v5 is not compatible with React 18" | **VERIFIED** |
| 12 | `@mui/styles` 사용 시 TS 오류 해법은 `declare module '@mui/styles/defaultTheme'` 보강 | v5 마이그레이션 트러블슈팅 문서 | v5 theming 문서의 module augmentation 패턴(동일 방식 계열) | **VERIFIED** |
| 13 | React 19 지원은 v6에서 v5로 백포트되어 5.18.0 peer가 `^17 \|\| ^18 \|\| ^19`이며, 초기 마이너(5.10.0)는 `^17 \|\| ^18`뿐 | npm 5.18.0 / 5.10.0 peerDependencies 대조 | GitHub 이슈 #44413 (closed 2024-12-17, v6→v5 백포트 트래킹) | **VERIFIED** |
| 14 | `sx` 성능 비용: 순수 div 100ms / styled 181ms / Box+sx 296ms, 번들은 약 15kB gzip 고정, 리스트는 단일 주입 지점 권장 | v5 문서 system/getting-started/usage (Performance tradeoffs) | v5 문서 the-sx-prop (동 섹션으로 링크 + 동적 값은 인라인 CSS 변수 권장) | **VERIFIED (동일 문서군 · 측정 환경 의존 지표로 표기)** |
| 15 | `slots`/`slotProps`가 v5의 **어느 마이너에서 어떤 컴포넌트에 도입되었는지**의 정확한 목록 | v5 API 문서(최종 마이너 기준 상태만 표기) | 마이너별 변경 이력 추적 불가 | **UNVERIFIED → SKILL.md에서 "설치 마이너의 API 문서 확인" 지침으로 대체** |

### 4-6. DISPUTED 처리 내역

**#2 — v5 지원 상태**
- 상충: MUI System 섹션 지원 페이지(`mui.com/system/getting-started/support/`)에는 "MUI System v5 = ✅ Stable major (Continuous support), v4 = LTS"라는 **v5 시절 문구가 그대로 남아** 있다. 이를 근거로 "v5는 계속 지원된다"고 서술하면 오답이 된다.
- 확정: Material UI 지원 페이지의 `Supported versions` 표(v9 ✅ 2026-04-08 / v7 ⚠️ LTS 2025-03-26 / v6 ❌ / v5 ❌ 2021-09-16)와 GitHub master `support.md` 원문이 일치. **v5는 보안 패치 대상이 아니다.**
- 조치: SKILL.md 섹션 0에 지원 상태를 ❌로 명시하고, "System 문서의 오래된 표기에 속지 말 것" 주의 블록을 추가. 흔한 실수 표에도 "v5 유지 = 안전하다고 판단" 항목 추가.

**#6 — "v5에는 slots/slotProps가 없다"는 통념**
- 상충: 널리 퍼진 요약은 "v5 = components/componentsProps, v6+ = slots/slotProps"지만, v5 Modal API 문서는 `slots`/`slotProps`를 **정식 prop으로 게시**하고 `componentsProps`를 "`slotProps`의 alias"로, `BackdropComponent`/`BackdropProps`를 "`slots.backdrop`/`slotProps.backdrop`으로 대체하라(다음 메이저에서 제거)"로 안내한다. 반면 TextField에는 slots API가 없다.
- 조치: SKILL.md 섹션 4-2를 "큰 그림은 components/componentsProps지만 컴포넌트·마이너별 편차가 있다"로 정정하고, 작성 전 해당 컴포넌트의 v5 API 문서를 확인하라는 지침과 v5↔v7+ 대응표를 함께 제공. 지원되는 컴포넌트라면 `slots`/`slotProps` 사용이 업그레이드에 유리하다는 판단 기준도 명시.

**#15 UNVERIFIED 처리**
- v5 마이너별 slots 도입 시점은 공식 문서가 "최종 상태"만 보여주어 확인 불가. 추정 서술을 넣지 않고, SKILL.md에서는 (a) 기능별 최소 마이너 표에는 확인된 항목만 기재, (b) slots 여부는 설치 버전의 API 문서로 확인하도록 안내하는 방식으로 대체했다.

---

## 5. 테스트 진행 기록

**수행일**: 2026-08-26
**수행자**: skill-tester → general-purpose (4회, 병렬 실행)
**수행 방법**: SKILL.md Read 후 실전 질문 4개 답변, 근거 섹션·줄 번호 인용 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. MUI 5.10에서 반응형 2열 Grid 작성 — `size` prop을 쓰면 안 되는 이유와 v5 올바른 문법**
- ✅ PASS
- 근거: SKILL.md 섹션 5-1 "v5 기본 Grid", 섹션 5-3 "버전별 Grid API 대비표"(405~416줄), 섹션 11 흔한 실수 표 1행(724줄)
- 상세: `size` prop은 v6+ `Grid2`/v7+ `Grid` 전용 API이며 v5에는 없다는 점, v5 정답은 `<Grid item xs={12} md={6}>` 형태라는 점을 정확히 근거 인용과 함께 답변. `Unstable_Grid2`(5.9.0+, 실험적)도 참고로 언급하되 기본 Grid를 더 안전한 선택으로 제시 — SKILL.md 취지와 일치.

**Q2. v5에서 다크모드 전환 — `colorSchemes`를 쓸 수 있는지, 정식 방법은 무엇인지**
- ✅ PASS
- 근거: SKILL.md 섹션 6-2 "CSS variables는 v5에서 실험 단계"(475·504줄), 섹션 6-1 "v5 정식 방식 — palette.mode + Context"(420~471줄)
- 상세: `colorSchemes`는 `extendTheme` 전용 키이며 `createTheme`에 넣으면 조용히 무시된다는 점, v5 "정식" 다크모드 구현은 `palette.mode` + Context + `useMemo` 패턴이라는 점을 코드와 함께 정확히 답변. `theme.applyStyles`가 v6+ 전용이라 v5에서 쓰면 안 된다는 점도 부가 근거로 정확히 인용.

**Q3. `@mui/styles`(makeStyles)를 React 18 프로젝트에서 계속 써도 되는지**
- ✅ PASS
- 근거: SKILL.md 섹션 8 "React 18/19 호환과 `@mui/styles` 함정"(593~633줄), 섹션 2 스타일링 방법 선택 표(112~117줄), 섹션 11 흔한 실수 표(730줄)
- 상세: deprecated·React 18/StrictMode 비호환이라는 공식 인용, "StrictMode에서만 스타일이 사라지거나 두 번 주입"되는 구체적 증상, `@mui/material/styles`에서 export되는 `makeStyles`도 동일하게 레거시 취급해야 한다는 우회 차단 포인트까지 정확히 답변. `styled()`/`sx` 대체 코드 제시.

**Q4. v5의 지원 상태(EOL 여부)와 업그레이드 시 첫 번째로 깨지는 것**
- ✅ PASS
- 근거: SKILL.md 섹션 0 버전 기준과 지원 상태 표(25~40줄), 섹션 10-1 "단계별로 깨지는 것"(688줄), 섹션 10-2 codemod 목록(702~706줄)
- 상세: v5가 공식 지원 종료(EOL) 상태이며 v6도 이미 EOL이라는 점(Supported versions 표 인용), v5→v6 breaking change 8개 항목(IE11 제거, TS 4.7, Grid2 안정화, CssVarsProvider 정식화, applyStyles, ListItemButton, react-is 정렬, 패키지 버전 정렬)을 정확히 나열.

### 발견된 gap (경미 — SKILL.md 즉시 수정 불필요)

- Q3: `@mui/styles` → `@mui/system` 전환에 특화된 `@mui/codemod` transform 이름이 섹션 10-2에 명시적으로 나열되어 있지 않음 (v5.0.0/preset-safe 포함 여부 불명확). 실무 마이그레이션 시 참고 자료로 보강 여지 있음.
- Q4: 섹션 10-1의 v5→v6 breaking change 표가 슬래시(`/`)로 나열된 단일 셀 밀집 서술이라, "어떤 게 컴파일 타임 즉시 에러이고 어떤 게 런타임/시각적 문제인지" 우선순위 구분이 없음. 답변 자체에는 지장 없었음(질문이 "표를 근거로 나열"이었으므로).

### 판정

- agent content test: 4/4 PASS (DISPUTED/에러 0건)
- verification-policy 분류: 라이브러리 사용법(레거시 버전 고정) — 실사용 필수 카테고리(마이그레이션 가이드/빌드 설정/워크플로우) 아님, content test PASS만으로 APPROVED 전환 가능
- 최종 상태: APPROVED

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (15개 클레임 중 VERIFIED 12, DISPUTED 2는 공식 원문 기준으로 수정 반영, UNVERIFIED 1은 확인 지침으로 대체) |
| 구조 완전성 | ✅ (frontmatter·소스 URL·검증일·버전 기준·주의 표기·흔한 실수 표 15종) |
| 실용성 | ✅ (전 섹션 실행 가능한 예시, 마이너 편차 확인 방법 제공, 프로젝트 비종속) |
| 기존 스킬과의 중복 | ✅ 분리 완료 (mui-v9 = 최신 API·v5→v9 breaking change 상세 / mui-v5 = v5 고유 API·EOL·업그레이드 진입점, v5 → v9 단방향 포인터 4곳) |
| 에이전트 활용 테스트 | ✅ 2026-08-26 수행 — general-purpose 4/4 PASS (섹션 5 참조) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-08-26 완료, 4/4 PASS — general-purpose 에이전트, 상세는 섹션 5)
- [❌] `frontend/mui-v9` SKILL.md에 **역참조 추가 권장** — v9 스킬 서두 또는 섹션 10(v5→v9 breaking changes)에 "v5.x 고정 레거시라면 `frontend/mui-v5` 참조" 한 줄. 차단 요인 아님(선택 보강) — 본 작업 지시 범위 밖이라 v9 파일은 손대지 않았다.
- [❌] slots/slotProps의 v5 마이너별 도입 시점(#15 UNVERIFIED) — 필요 시 v5 릴리스 노트를 마이너 단위로 훑어 보강. 차단 요인 아님(선택 보강) — Q1~Q4 어느 답변에도 영향 없었다.
- [❌] Grid v2(`Unstable_Grid2`) 실제 적용 사례가 생기면 중첩 그리드·offset 실사용 예시 보강. 차단 요인 아님(선택 보강).
- [❌] v5는 EOL이므로, 프로젝트가 v6 이상으로 올라가면 이 스킬의 적용 범위를 재확인하고 `mui-v9`로 전환 안내 필요. 차단 요인 아님(운영 시점 후속 조치).
- [❌] `@mui/lab`은 v5에서 `5.0.0-alpha.x` 프리릴리스 라인으로만 배포되는데, 개별 alpha 버전 간 API 차이는 검증 범위에 포함하지 않음. 차단 요인 아님(선택 보강).
- [❌] `@mui/styles` → `@mui/system` 전환 전용 codemod transform 명칭 명시 보강 (Q3 테스트에서 발견된 경미한 gap, 섹션 5 "발견된 gap" 참조). 차단 요인 아님(선택 보강).
- [❌] 섹션 10-1 v5→v6 breaking change 표에 "컴파일 타임 즉시 에러 vs 런타임/시각적 문제" 우선순위 구분 추가 (Q4 테스트에서 발견된 경미한 gap). 차단 요인 아님(선택 보강).

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-08-26 | v1 | 최초 작성 — v5 공식 문서·GitHub 소스/릴리스 API·npm registry 기반 30여 회 페치 및 5회 검색, 15개 클레임 교차 검증(DISPUTED 2건 수정 반영, UNVERIFIED 1건 지침 대체). skill-tester 미수행으로 PENDING_TEST | skill-creator |
| 2026-08-26 | v1 | 2단계 실사용 테스트 수행 (Q1 반응형 2열 Grid `size` prop 오용 방지 / Q2 다크모드 `colorSchemes` 오용 방지 + 정식 방법 / Q3 `@mui/styles` React 18 비호환 / Q4 EOL 상태 + v5→v6 breaking change) → 4/4 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
