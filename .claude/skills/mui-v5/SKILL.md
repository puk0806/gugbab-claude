---
name: mui-v5
description: MUI v5(Material UI 5.x, 최종 5.18.0·EOL) 레거시에 v6/v7/v9 API 를 섞지 않기 위한 함정 모음 — Grid item+xs(size·offset·Grid2 없음, Unstable_Grid2 는 5.9.0+), theme.applyStyles·cssVariables·colorSchemes 없음(palette.mode 분기·experimental_extendTheme), variants 위치, components/componentsProps vs slots 편차, @mui/styles 금지, 마이너별 기능 시점(5.15.2·5.18.0 CSS layers·React 19 peer), 패키지 메이저 일치, sx 성능, v5→v6→v7→v9 codemod 경로
---

# MUI v5 (Material UI 5.x) — 레거시 전용

> 소스: https://v5.mui.com/material-ui/getting-started/
>       https://mui.com/material-ui/getting-started/support/ (지원 버전 표)
>       https://v5.mui.com/material-ui/react-grid/ , https://v5.mui.com/material-ui/react-grid2/
>       https://v5.mui.com/material-ui/experimental-api/css-theme-variables/usage/
>       https://v5.mui.com/system/styles/basics/ (@mui/styles 레거시)
>       https://v5.mui.com/system/getting-started/usage/ (성능 트레이드오프)
>       https://github.com/mui/material-ui/releases/tag/v5.18.0
> 검증일: 2026-11-09 (재검증, 이전 2026-09-26 · 최초 검증 2026-08-26 — v5 최종판 5.18.0·EOL 상태·v7 LTS·v9 stable·5.18.0 React peer 전부 변동 없음 재확인)

> **이 스킬은 v5.x에 고정된 레거시 프로젝트 전용이다.** 최신 버전(v9)으로 신규 개발하거나 업그레이드를 진행 중이라면
> [`frontend/mui-v9`](../mui-v9/SKILL.md) 스킬을 사용한다. v9의 `size` prop Grid, `slots`/`slotProps`,
> `cssVariables: true`, `theme.applyStyles()`는 **v5에 존재하지 않는다** — 두 스킬을 섞어 쓰면 컴파일조차 되지 않는 코드가 나온다.

## 이 스킬의 범위

createTheme·ThemeProvider·sx·styled·module augmentation·Emotion SSR 같은 기본 사용법은 공식 문서 수준이라 싣지 않는다. 여기엔 **모델이 최신 MUI 문법을 v5에 섞는 실수를 막는 경고**만 둔다.

---

## 1. 버전·지원 상태

| 항목 | 값 |
|------|-----|
| **v5 최종 릴리스** | **5.18.0 (2025-07-08)** — npm dist-tag `latest-v5` |
| 공식 지원 상태 | **❌ 지원 종료** (보안 패치·리그레션 수정 대상 아님). 현재 LTS v7.x, stable v9.x |
| 스타일 엔진 | Emotion 11 (`@emotion/react` ^11.5.0, `@emotion/styled` ^11.3.0) |
| React peer (5.18.0) | `^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0` |
| React peer (5.10.x 등 초기 마이너) | `^17.0.0 \|\| ^18.0.0` (React 19 미지원) |

> 주의: MUI 공식 지원 정책은 "현재 메이저 + 직전 메이저"만 보안 업데이트를 보장한다. **v5는 이미 그 범위 밖이다.**
> 새 취약점이 나와도 v5 패치는 나오지 않으므로, 레거시 유지 중이라도 업그레이드 계획(섹션 5)을 병행해야 한다.

> 주의: MUI System 섹션의 일부 지원 문서 페이지에는 "v5 = Stable major"라는 **오래된 표기**가 남아 있다.
> 기준은 Material UI 지원 페이지의 `Supported versions` 표다(v9 ✅ / v7 ⚠️ LTS / v6 ❌ / v5 ❌).

**마이너 확인이 먼저다** (`npm ls @mui/material @mui/system @emotion/react`): `Unstable_Grid2` **5.9.0+** · variants 함수형 `props` **5.15.2+** · CSS layers(`enableCssLayer`, v7에서 백포트) **5.18.0+** · React 19는 최신 마이너(5.18.0)부터(공식 이슈 #44413 백포트).

> 주의: `@mui/material`·`@mui/system`·`@mui/icons-material`·`@mui/lab`·`@mui/material-nextjs`는 **같은 메이저 라인**으로 맞춘다.
> v6 이상 패키지가 하나라도 섞이면 테마 컨텍스트가 갈라져 스타일이 적용되지 않는다. (`@mui/lab` v5는 5.0.0-alpha.x 태그)

---

## 2. 최신 문법 → v5 정답 대응표

| ❌ 최신 버릇(v6/v7/v9) | 왜 v5에서 틀리나 | ✅ v5 정답 |
|------------------------|------------------|-----------|
| `<Grid size={{ xs: 12, md: 6 }}>` | `size`는 v6+ `Grid2`/v7+ `Grid` API | `<Grid item xs={12} md={6}>` (`container`·`item`은 독립 boolean) |
| `<Grid offset={{ md: 2 }}>` | v5 기본 Grid에 offset 없음 | `Unstable_Grid2`의 `mdOffset={2}` 또는 `ml: 'auto'` |
| `import Grid from '@mui/material/Grid2'` / `GridLegacy` | v6·v7 명칭 | 기본 `@mui/material/Grid`, v2는 `@mui/material/Unstable_Grid2`(`item` 불필요, `xs`·`xsOffset`) |
| `direction="column"` 컨테이너에서 `xs={6}` | v5에서 미지원 | `<Stack spacing={2}>` |
| `theme.applyStyles('dark', {...})` | **v6부터** 추가 — `theme.applyStyles is not a function` | `...(theme.palette.mode === 'dark' && {...})` |
| `createTheme({ cssVariables: true, colorSchemes })` | v5 `createTheme`에 없는 옵션 — **조용히 무시됨** | `experimental_extendTheme` + `Experimental_CssVarsProvider` (아래 주의) |
| `styleOverrides.root` 콜백 안의 `variants` | v6+ 형태 | `MuiButton: { variants: [...] }` 컴포넌트 키 **직속** 배열 (함수형 `props`는 5.15.2+, 뒤 variant가 이김) |
| `TextField slotProps={{ input, htmlInput }}` | v5 TextField에는 slots API 없음 | `InputProps` / `inputProps` / `InputLabelProps` / `FormHelperTextProps` |
| `Dialog slotProps.paper` | v7+ 표준 | `PaperProps` (단, 아래 편차 주의) |
| `makeStyles`/`withStyles` | `@mui/styles` deprecated + **React 18·StrictMode 비호환** | `styled()` 또는 `sx` |
| `<Box mt={2}>` (System props) | v5에선 **동작**하지만 v9에서 제거 | 업그레이드 대비 `sx={{ mt: 2 }}`로 통일 |

> 주의: v5 후기 마이너에서 **Base UI 파생 컴포넌트(Modal/Dialog/Popper/Autocomplete 등)에는 `slots`/`slotProps`가 이미 추가**되어 있다.
> v5 공식 API 문서에도 "`componentsProps`는 `slotProps`의 alias이며 `slots` 사용을 권장한다",
> "`BackdropComponent`는 `slots.backdrop`으로 대체하라(다음 메이저에서 제거)" 같은 deprecation 안내가 붙어 있다.
> 반면 `TextField`처럼 **v5 문서 기준 `slots`/`slotProps`가 없는 컴포넌트도 있다.**
> → **"v5 = components/componentsProps, v7+ = slots/slotProps"는 큰 그림일 뿐**이고 컴포넌트별·마이너별 편차가 있으니,
> 작성 전 `https://v5.mui.com/material-ui/api/<component>/`에서 해당 컴포넌트의 prop 목록을 확인한다.
> `slots`/`slotProps`가 지원되는 컴포넌트라면 그쪽을 쓰는 편이 업그레이드에 유리하다.

> 주의: v5에는 v9의 `createTheme({ cssVariables: true, colorSchemes: { light, dark } })`가 **없다.**
> v5에서 CSS 변수 기반 테마를 쓰려면 `experimental_`/`Experimental_` 접두어가 붙은 실험 API를 써야 하고,
> 이 테마는 **전용 Provider 하위에서만 동작**한다(일반 `ThemeProvider`와 섞으면 `TypeError`).
> TypeScript 타이핑도 module augmentation을 직접 해줘야 하며, SSR 깜빡임 방지는 초기 마이너 `getInitColorSchemeScript()` **함수** → 후기(5.18.0) `@mui/material/InitColorSchemeScript` **컴포넌트**(함수는 deprecated) — 설치된 마이너에서 export되는 쪽을 쓴다. 실험 API이므로 대규모 도입보다 `palette.mode` 방식을 유지한다.

> 주의: `theme.vars`는 v5에서도 **CSS variables 전용 예약 필드**다. 커스텀 노드 이름으로 `vars`를 쓰면 안 된다(공식 문서 명시).

---

## 3. `@mui/styles` 잔재

- v5 공식 문서: "`@mui/styles`는 v5 릴리스와 함께 **deprecated**", "**`React.StrictMode`나 React 18과 호환되지 않으며, 앞으로도 업데이트되지 않는다.**"
- 증상: React 18 `createRoot` 전환 후 **StrictMode에서만 스타일이 사라지거나 두 번 주입** → `@mui/styles` 잔존을 먼저 의심. `@mui/material/styles`의 `makeStyles`도 `@mui/styles`로 위임되는 레거시 경로라 동일 취급.
- `Property 'palette' does not exist on type 'DefaultTheme'` → `declare module '@mui/styles/defaultTheme' { interface DefaultTheme extends Theme {} }` 임시 처방, 근본은 제거.

---

## 4. 성능·주입 순서

- 공식 벤치마크(상대 지표): `<div>` 100ms / `styled()` 181ms / `<Box sx>` 296ms — **리스트·테이블 수백 행에 각각 `sx`를 붙이지 말고** `styled()` 재사용 또는 부모 1곳 `sx` + 자식 선택자. 매 프레임 바뀌는 값은 인라인 CSS 변수(`style={{ '--x': ... }}`)로.
- `createTheme()`를 컴포넌트 본문에서 매 렌더 호출 금지 — 모듈 상수 또는 `useMemo([mode])`.
- MUI 스타일이 커스텀 CSS/Tailwind를 이기면: `<StyledEngineProvider injectFirst>` / `createCache({ key: 'css', prepend: true })` / **5.18.0+** `AppRouterCacheProvider options={{ enableCssLayer: true }}`(`@mui/material-nextjs@^5`).
- SSR은 **요청마다 `createCache()` 새로** — 전역 재사용 시 요청 간 스타일 오염·hydration 불일치.

---

## 5. 업그레이드 경로 — v5 → v6 → v7 → v9 (v8 없음)

| 단계 | 주요 breaking change |
|------|----------------------|
| **v5 → v6** | IE11 지원 제거 / TypeScript 최소 4.7 / `Unstable_Grid2` → `Grid2` 안정화 + `xs={12} xsOffset={2}` → `size={{ xs: 12 }} offset={{ xs: 2 }}` / `Grid2`의 `disableEqualOverflow` 제거 / `CssVarsProvider`·`extendTheme` 실험 접두어 제거(정식화) / `theme.palette.mode` 분기 → `theme.applyStyles()` / `ListItem`의 `button`·`selected` 등 제거 → `ListItemButton` / React 18 이하 사용 시 `react-is` 정렬 필요(`"overrides": { "react-is": "^18.3.1" }`) / MUI 패키지 일괄 6.x 정렬(MUI X는 별도 버저닝이라 함께 올리지 않음) |
| **v6 → v7** | 기존 `Grid` → **`GridLegacy`로 개명**, `Grid2` → **`Grid`** (`.MuiGrid2-root` → `.MuiGrid-root`) / 슬롯 패턴 전면 표준화(`components`/`componentsProps` 계열 정리) / package `exports` 제한 — `@mui/material/styles/createTheme` 같은 2단계 이상 deep import 금지, `import { createTheme } from '@mui/material/styles'`로 변경 / modern 번들 alias 제거 |
| **v7 → v9** | System props 직접 사용 제거(`<Box mt={2}>` → `sx`) / Grid `direction="column"` 미지원 / `GridLegacy` 완전 제거 / `slots`·`slotProps`로 완전 통일 / `cssVariables: true` 정식 옵션 / `disableEscapeKeyDown` 제거 / CSS 복합 클래스명 변경 / `@mui/styles` 완전 제거 — 상세는 [`frontend/mui-v9`](../mui-v9/SKILL.md) 섹션 10 |

codemod(`npx @mui/codemod@latest <transform> <path>`, 커밋된 상태에서 실행 후 diff 검토): v6 `v6.0.0/grid-v2-props`·`list-item-button-prop`·`styled`·`sx-prop`·`theme-v6` / v7 `v7.0.0/grid-props` / 각 단계 전 `deprecations/all`. `preset-safe`는 v5.0.0 네임스페이스에만 있다. 권장 순서: ① 5.18.0까지 올려 회귀 확인 → ② `deprecations/all` → ③ 메이저 1단계씩 + codemod → ④ 모든 MUI 패키지 라인 동시 정렬 → ⑤ 시각 회귀 확인.
