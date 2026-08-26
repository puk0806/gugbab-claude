---
name: mui-v5
description: MUI v5 (Material UI 5.x) 레거시 프로젝트 전용 패턴 — Emotion 11 기반 styled()/sx, createTheme + ThemeProvider, TypeScript 테마 확장, v5 Grid(item/xs) 및 Unstable_Grid2, components/componentsProps, palette.mode 다크모드(CSS variables는 실험 단계), @mui/styles(JSS) 함정, v6/v7/v9 업그레이드 경로
---

# MUI v5 (Material UI 5.x) — 레거시 전용

> 소스: https://v5.mui.com/material-ui/getting-started/
>       https://mui.com/material-ui/getting-started/support/ (지원 버전 표)
>       https://v5.mui.com/material-ui/react-grid/ , https://v5.mui.com/material-ui/react-grid2/
>       https://v5.mui.com/material-ui/experimental-api/css-theme-variables/usage/
>       https://v5.mui.com/system/styles/basics/ (@mui/styles 레거시)
>       https://v5.mui.com/system/getting-started/usage/ (성능 트레이드오프)
>       https://github.com/mui/material-ui/releases/tag/v5.18.0
> 검증일: 2026-08-26

> **이 스킬은 v5.x에 고정된 레거시 프로젝트 전용이다.** 최신 버전(v9)으로 신규 개발하거나 업그레이드를 진행 중이라면
> [`frontend/mui-v9`](../mui-v9/SKILL.md) 스킬을 사용한다. v9의 `size` prop Grid, `slots`/`slotProps`,
> `cssVariables: true`, `theme.applyStyles()`는 **v5에 존재하지 않는다** — 두 스킬을 섞어 쓰면 컴파일조차 되지 않는 코드가 나온다.

---

## 0. 버전 기준과 지원 상태 (먼저 확인)

| 항목 | 값 |
|------|-----|
| v5 최초 릴리스 | 2021-09-16 |
| **v5 최종 릴리스** | **5.18.0 (2025-07-08)** — npm dist-tag `latest-v5` |
| 공식 지원 상태 | **❌ 지원 종료** (보안 패치·리그레션 수정 대상 아님) |
| 현재 LTS | v7.x (보안 이슈·리그레션만 지원) |
| 현재 stable | v9.x |
| 스타일 엔진 | Emotion 11 (`@emotion/react` ^11.5.0, `@emotion/styled` ^11.3.0) |
| React peer (5.18.0) | `^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0` |
| React peer (5.10.x 등 초기 마이너) | `^17.0.0 \|\| ^18.0.0` (React 19 미지원) |

> 주의: MUI 공식 지원 정책은 "현재 메이저 + 직전 메이저"만 보안 업데이트를 보장한다. **v5는 이미 그 범위 밖이다.**
> 새 취약점이 나와도 v5 패치는 나오지 않으므로, 레거시 유지 중이라도 업그레이드 계획(섹션 10)을 병행해야 한다.

> 주의: MUI System 섹션의 일부 지원 문서 페이지에는 "v5 = Stable major"라는 **오래된 표기**가 남아 있다.
> 기준은 Material UI 지원 페이지의 `Supported versions` 표다(v9 ✅ / v7 ⚠️ LTS / v6 ❌ / v5 ❌).

### 마이너 버전 확인이 먼저다

v5는 5.0 → 5.18까지 **마이너 사이에서도 API가 추가**되었다. 아래 기능은 v5 전 구간에서 쓸 수 있는 게 아니다.

| 기능 | 최소 v5 마이너 |
|------|---------------|
| `Unstable_Grid2` (Grid v2) | **5.9.0** |
| `theme.components.*.variants`의 함수형 `props` | 5.15.2 |
| React 19 호환 | 백포트 완료(공식 이슈 #44413, 2024-12-17 종료) — 이후 마이너 계열 |
| CSS layers (`@mui/system`, `@mui/material-nextjs`) | **5.18.0** |

```bash
npm ls @mui/material @mui/system @emotion/react @emotion/styled
```

---

## 1. 설치 · 기본 설정

```bash
# v5 계열 고정 설치
npm install @mui/material@^5 @emotion/react@^11 @emotion/styled@^11
npm install @mui/icons-material@^5      # 아이콘 (버전 라인 일치 필수)
npm install @mui/lab@^5                 # lab (v5는 5.0.0-alpha.x 태그)
```

> 주의: `@mui/material`·`@mui/system`·`@mui/icons-material`·`@mui/lab`·`@mui/material-nextjs`는 **같은 메이저 라인**으로 맞춘다.
> v6 이상 패키지가 하나라도 섞이면 테마 컨텍스트가 갈라져 스타일이 적용되지 않는다.

```tsx
// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: '"Pretendard", "Roboto", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
  },
  spacing: 8,
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
});

export default theme;
```

```tsx
// src/App.tsx
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes />
    </ThemeProvider>
  );
}
```

---

## 2. 스타일링 방법 선택 기준

| 방법 | 사용 시점 | v5에서의 상태 |
|------|-----------|---------------|
| `styled()` (`@mui/material/styles`) | 재사용 컴포넌트, 리스트 아이템처럼 다량 렌더되는 요소 | ✅ 권장 |
| `sx` prop | 1회성·조건부·프로토타이핑 | ✅ 권장하되 남용 주의(섹션 9) |
| `theme.components` | 전역 기본 스타일·기본 props | ✅ 권장 |
| `@mui/styles` (`makeStyles`/`withStyles`) | — | ❌ deprecated, React 18 비호환(섹션 8) |

### sx prop

```tsx
import Box from '@mui/material/Box';

<Box
  sx={{
    p: 2,                                  // theme.spacing(2)
    mt: 3,
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    width: { xs: '100%', md: '50%' },       // 반응형
    display: { xs: 'none', sm: 'block' },
    '&:hover': { opacity: 0.8 },
    '& .MuiButton-root': { fontWeight: 700 },
    // theme 콜백
    borderTop: (theme) => `1px solid ${theme.palette.divider}`,
  }}
/>
```

v5에서는 **System props 직접 지정도 여전히 동작한다**(`<Box mt={2} color="primary.main" />`).
다만 v9에서 제거되었으므로 업그레이드를 염두에 둔다면 지금부터 `sx`로 통일한다.

```tsx
// v5에서는 둘 다 동작 — 아래 형태만 쓰는 것이 상위 버전 안전
<Box mt={2} />              // v5 OK / v9 제거
<Box sx={{ mt: 2 }} />      // v5·v9 모두 OK
```

### styled()

```tsx
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

const PrimaryButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5, 3),
}));

// 커스텀 prop이 DOM으로 새는 것 방지
const StyledCard = styled('div', {
  shouldForwardProp: (prop) => prop !== 'rounded',
})<{ rounded?: boolean }>(({ theme, rounded }) => ({
  backgroundColor: theme.palette.background.paper,
  // v5 다크 모드 분기 — theme.applyStyles()는 v6+에만 존재
  ...(theme.palette.mode === 'dark' && {
    backgroundColor: theme.palette.grey[900],
  }),
  ...(rounded && { borderRadius: theme.spacing(3) }),
}));
```

> 주의: `theme.applyStyles('dark', {...})`는 **v6부터** 추가된 API다. v5에서 호출하면 `theme.applyStyles is not a function`으로 죽는다.
> v5의 다크 분기는 `theme.palette.mode === 'dark'` 조건부 스프레드가 정석이다.

---

## 3. 테마 확장과 TypeScript 타입 보강

### 단계적 확장 (앞 단계 값 참조)

```tsx
let theme = createTheme({
  palette: { primary: { main: '#0052cc' } },
});
theme = createTheme(theme, {
  palette: { info: { main: theme.palette.primary.main } },
});
```

### module augmentation (`declare module`)

```ts
// src/theme.d.ts  (tsconfig의 include 범위 안에 있어야 한다)
import { Theme, ThemeOptions } from '@mui/material/styles';
import { CSSProperties } from 'react';

declare module '@mui/material/styles' {
  // 1) 테마 루트에 커스텀 노드 추가
  interface Theme {
    status: { danger: string };
  }
  interface ThemeOptions {
    status?: { danger?: string };
  }

  // 2) palette 커스텀 색상
  interface Palette {
    brand: Palette['primary'];
  }
  interface PaletteOptions {
    brand?: PaletteOptions['primary'];
  }

  // 3) typography 커스텀 variant
  interface TypographyVariants {
    caption2: CSSProperties;
  }
  interface TypographyVariantsOptions {
    caption2?: CSSProperties;
  }
}

// 4) 컴포넌트 prop 허용값 확장
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    caption2: true;
  }
}
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    dashed: true;
  }
  interface ButtonPropsColorOverrides {
    brand: true;
  }
}
```

> 주의: `theme.vars`는 v5에서도 **CSS variables 전용 예약 필드**다. 커스텀 노드 이름으로 `vars`를 쓰면 안 된다(공식 문서 명시).

### `@mui/styles`를 아직 쓰는 프로젝트의 TS 오류

`Property 'palette' does not exist on type 'DefaultTheme'` 오류가 나면:

```ts
import { Theme } from '@mui/material/styles';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}
```

근본 해결은 `@mui/styles` 제거다(섹션 8).

---

## 4. 컴포넌트 커스터마이징

### 4-1. theme.components — 전역 오버라이드

```tsx
const theme = createTheme({
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true,
        variant: 'contained',
      },
      styleOverrides: {
        // 콜백에서 ownerState로 props 기반 분기
        root: ({ ownerState, theme }) => ({
          borderRadius: 8,
          textTransform: 'none',
          ...(ownerState.size === 'large' && { padding: theme.spacing(1.5, 4) }),
          ...(theme.palette.mode === 'dark' && { boxShadow: 'none' }),
        }),
      },
      // 새 variant 정의 — v5에서는 컴포넌트 키 바로 아래 배열
      variants: [
        {
          props: { variant: 'dashed' },
          style: { border: '2px dashed currentColor' },
        },
        {
          props: { variant: 'dashed', color: 'secondary' },
          style: { borderColor: '#dc004e' },
        },
      ],
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
    },
  },
});
```

> 주의: v5의 `variants`는 **컴포넌트 키 직속 배열**이다. v6+에서 등장한 "`styleOverrides.root` 콜백 안의 `variants`" 형태는 v5에서 동작하지 않는다.
> `props`를 함수(`props: (props) => !props.disabled`)로 쓰는 문법은 **5.15.2 이상**에서만 지원된다. 순서상 뒤에 온 variant가 이긴다.

### 4-2. `components` / `componentsProps` — v5의 슬롯 API

v5의 슬롯 커스터마이징 명칭은 `components`(엘리먼트 교체) / `componentsProps`(슬롯에 props 전달)다.

```tsx
// v5
<Autocomplete
  components={{ PaperComponent: CustomPaper }}
  componentsProps={{ paper: { elevation: 4 } }}
/>

<Tooltip
  componentsProps={{ tooltip: { sx: { fontSize: 14 } } }}
/>
```

**개별 대문자 prop**도 v5에서는 여전히 정상 API다.

```tsx
<TextField
  InputProps={{ startAdornment: <SearchIcon /> }}
  inputProps={{ maxLength: 50 }}          // 실제 <input> 속성
  InputLabelProps={{ shrink: true }}
  FormHelperTextProps={{ sx: { mt: 1 } }}
/>
<Dialog PaperProps={{ elevation: 0 }} BackdropComponent={CustomBackdrop} />
```

> 주의: v5 후기 마이너에서 **Base UI 파생 컴포넌트(Modal/Dialog/Popper/Autocomplete 등)에는 `slots`/`slotProps`가 이미 추가**되어 있다.
> v5 공식 API 문서에도 "`componentsProps`는 `slotProps`의 alias이며 `slots` 사용을 권장한다",
> "`BackdropComponent`는 `slots.backdrop`으로 대체하라(다음 메이저에서 제거)" 같은 deprecation 안내가 붙어 있다.
> 반면 `TextField`처럼 **v5 문서 기준 `slots`/`slotProps`가 없는 컴포넌트도 있다.**
> → **"v5 = components/componentsProps, v7+ = slots/slotProps"는 큰 그림일 뿐**이고 컴포넌트별·마이너별 편차가 있으니,
> 작성 전 `https://v5.mui.com/material-ui/api/<component>/`에서 해당 컴포넌트의 prop 목록을 확인한다.
> `slots`/`slotProps`가 지원되는 컴포넌트라면 그쪽을 쓰는 편이 업그레이드에 유리하다.

| 목적 | v5 | v7 이후 (참고: `frontend/mui-v9`) |
|------|----|----|
| 슬롯 컴포넌트 교체 | `components={{ ... }}` / `XxxComponent` | `slots={{ ... }}` |
| 슬롯 props 전달 | `componentsProps={{ ... }}` / `XxxProps` | `slotProps={{ ... }}` |
| TextField 입력부 | `InputProps` | `slotProps.input` |
| TextField DOM input | `inputProps` | `slotProps.htmlInput` |
| Dialog Paper | `PaperProps` | `slotProps.paper` |

---

## 5. Grid — v5는 `item` + `xs` 방식

### 5-1. v5 기본 Grid (`@mui/material/Grid`)

```tsx
import Grid from '@mui/material/Grid';

<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>A</Grid>
  <Grid item xs={12} sm={6} md={4}>B</Grid>
  <Grid item xs={12} sm={12} md={4}>C</Grid>
</Grid>

// 자동 레이아웃 / 콘텐츠 너비
<Grid container spacing={2}>
  <Grid item xs>남는 공간 균등 분배</Grid>
  <Grid item xs="auto">콘텐츠 너비</Grid>
</Grid>

// 행·열 간격 분리, 열 수 변경
<Grid container columns={16} rowSpacing={1} columnSpacing={{ xs: 1, md: 3 }}>
  <Grid item xs={8}>8/16</Grid>
</Grid>
```

핵심 규칙:
- `container`와 `item`은 **독립적인 boolean**이며 중첩 그리드에서는 한 요소에 둘 다 붙는다(`<Grid item xs={6} container>`).
- 브레이크포인트 값은 **더 넓은 브레이크포인트로 상속**된다(`xs={12} md={6}` → lg·xl도 6).
- v5 기본 Grid에는 **`offset` prop이 없다**(Grid v2에서 추가됨).
- `direction="column" | "column-reverse"` 컨테이너에서는 **`xs`~`xl` prop이 지원되지 않는다** — 세로 배치는 `Stack`을 쓴다.

```tsx
// ❌ v5에서 의도대로 동작하지 않음
<Grid container direction="column">
  <Grid item xs={6}>…</Grid>
</Grid>

// ✅
<Stack spacing={2}>…</Stack>
```

### 5-2. Grid v2 (`Unstable_Grid2`) — v5.9.0+ 실험적

```tsx
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2

<Grid container spacing={2}>
  <Grid xs={12} md={6}>item prop 불필요</Grid>
  <Grid xs={12} md={6} mdOffset={2}>offset 지원</Grid>
</Grid>
```

- `item` prop 제거, CSS 변수 기반 재구현, **offset 지원**(`xsOffset`/`mdOffset` … 형태), 중첩 그리드 제약 해소.
- 공식 문서 표현: "브레이킹 체인지이므로 다음 메이저에서 안정화하기 전에 피드백을 받기 위해 `Unstable_Grid2`로 도입했다."
- v5 구간에서는 **`Unstable_` 접두어가 유지**된다. 안정화는 v6(`Grid2`), v7부터는 이것이 `Grid`가 된다.
- 기존 화면 전체를 Grid2로 바꾸는 것은 v6 업그레이드와 함께 하는 편이 낫다. v5에서는 offset이 꼭 필요한 화면에 국소 도입한다.

### 5-3. 버전별 Grid API 대비표 (혼동 방지 — 가장 중요)

| 목적 | **v5 `Grid`** | **v5 `Unstable_Grid2`** | v6 `Grid2` | v7 / v9 `Grid` |
|------|---------------|--------------------------|-----------|----------------|
| import | `@mui/material/Grid` | `@mui/material/Unstable_Grid2` | `@mui/material/Grid2` | `@mui/material/Grid` |
| 자식 표시 | `item` 필요 | 불필요 | 불필요 | 불필요 |
| 너비 지정 | `xs={12} md={6}` | `xs={12} md={6}` | `size={{ xs: 12, md: 6 }}` | `size={{ xs: 12, md: 6 }}` |
| offset | 없음 | `mdOffset={2}` | `offset={{ md: 2 }}` | `offset={{ md: 2 }}` |
| 구 Grid의 행방 | — | — | `Grid`(그대로 유지) | **`GridLegacy`로 이름 변경** |

> 주의: 검색으로 나오는 최신 MUI 예제(`<Grid size={{ xs: 12 }}>`)를 **v5에 그대로 붙이면 레이아웃이 깨지거나 타입 에러가 난다.**
> v5에서는 반드시 `item` + `xs`/`sm`/`md` 형태로 작성한다. `size` prop 방식은 [`frontend/mui-v9`](../mui-v9/SKILL.md) 스킬의 범위다.

---

## 6. 다크 모드 / 테마 전환

### 6-1. v5 정식 방식 — `palette.mode` + Context

```tsx
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';

const ColorModeContext = React.createContext({ toggle: () => {} });

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = React.useState<'light' | 'dark'>(prefersDark ? 'dark' : 'light');

  const colorMode = React.useMemo(
    () => ({ toggle: () => setMode((p) => (p === 'light' ? 'dark' : 'light')) }),
    [],
  );

  // mode가 바뀔 때만 테마 재생성 — useMemo 없으면 렌더마다 전체 스타일 재계산
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark'
            ? { background: { default: '#121212', paper: '#1e1e1e' } }
            : {}),
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
```

컴포넌트 내부 분기는 `theme.palette.mode`로 한다.

```tsx
<Card sx={(theme) => ({
  bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : '#fff',
})} />
```

### 6-2. CSS variables는 v5에서 **실험 단계**

> 주의: v5에는 v9의 `createTheme({ cssVariables: true, colorSchemes: { light, dark } })`가 **없다.**
> v5에서 CSS 변수 기반 테마를 쓰려면 `experimental_`/`Experimental_` 접두어가 붙은 실험 API를 써야 하고,
> 이 테마는 **전용 Provider 하위에서만 동작**한다(일반 `ThemeProvider`와 섞으면 `TypeError`).

```tsx
import {
  experimental_extendTheme as extendTheme,
  Experimental_CssVarsProvider as CssVarsProvider,
  useColorScheme,
} from '@mui/material/styles';

const theme = extendTheme({
  colorSchemes: {
    light: { palette: { primary: { main: '#1976d2' } } },
    dark: { palette: { primary: { main: '#90caf9' } } },
  },
});

function ModeToggle() {
  const { mode, setMode } = useColorScheme();  // CssVarsProvider 하위에서만 유효
  return <button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>{mode}</button>;
}

<CssVarsProvider theme={theme} defaultMode="system">
  <CssBaseline />
  <App />
</CssVarsProvider>
```

- `colorSchemes`는 **`extendTheme` 전용 키**다. `createTheme`에 넣으면 v5에서는 그냥 무시된다.
- TypeScript 타이핑도 기본 활성화가 아니라 **module augmentation을 직접 해줘야 한다**(공식 문서 명시).
- SSR 깜빡임 방지 스크립트는 v5 구간에서 명칭이 바뀌었다: 초기에는 `getInitColorSchemeScript()` **함수**,
  후기 마이너(5.18.0 소스 확인)에는 `@mui/material/InitColorSchemeScript` **컴포넌트**가 존재하고 함수 쪽은 deprecated 처리되어 있다.
  → **설치된 마이너에서 실제로 export되는 쪽**을 확인하고 쓴다. `defaultMode`는 Provider와 동일한 값을 넘겨야 깜빡임이 사라진다.
- 실험 API이므로 신규 대규모 도입은 권장하지 않는다. 다크모드가 핵심 요구사항이면 6-1 방식으로 두고, CSS 변수는 업그레이드(v6+) 시점에 도입한다.

---

## 7. Emotion — SSR · 캐시 · 스타일 주입 순서

### 7-1. 주입 순서 문제 (스타일이 안 먹는 가장 흔한 원인)

```tsx
import { StyledEngineProvider } from '@mui/material/styles';

// MUI가 만든 <style>을 <head> 앞쪽에 넣어, 일반 CSS/Tailwind가 이기게 한다
<StyledEngineProvider injectFirst>
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
</StyledEngineProvider>
```

직접 Emotion 캐시를 만드는 경우 동일 효과는 `prepend: true`로 얻는다.

```ts
import createCache from '@emotion/cache';

export const muiCache = createCache({ key: 'css', prepend: true });
```

### 7-2. 서버 렌더링 (커스텀 SSR)

```tsx
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';

// 요청마다 새 캐시 — 전역 재사용 시 요청 간 스타일이 섞인다
const cache = createCache({ key: 'css' });
const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache);

const html = ReactDOMServer.renderToString(
  <CacheProvider value={cache}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </CacheProvider>,
);

const styleTags = constructStyleTagsFromChunks(extractCriticalToChunks(html));
// styleTags를 HTML <head>에 삽입. 클라이언트도 동일한 key의 캐시를 써야 hydration 불일치가 없다.
```

### 7-3. Next.js

```bash
npm install @mui/material-nextjs@^5 @emotion/cache
```

```tsx
// app/layout.tsx (App Router)
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AppRouterCacheProvider options={{ key: 'css', enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```

- `AppRouterCacheProvider`는 Next.js가 청크를 스트리밍할 때 서버에서 생성된 CSS를 수집하는 역할이다. `<body>` 바로 아래에서 전체를 감싼다.
- `enableCssLayer: true` → MUI 스타일이 `@layer mui`로 감싸져 CSS Modules·Tailwind가 항상 우선한다.
- **CSS layers 지원은 5.18.0에서 v7로부터 백포트**되었다(`@mui/system`, `@mui/material-nextjs`). 그 이전 마이너에서는 사용할 수 없다.
- Pages Router는 `_document.tsx` + `_app.tsx`에 `createEmotionCache()`를 배선하는 기존 방식이다.

---

## 8. React 18/19 호환과 `@mui/styles` 함정

### `@mui/styles`(JSS)는 유지 대상이 아니라 제거 대상

v5 공식 문서 표기 그대로다:
- "`@mui/styles`는 MUI Core v5 릴리스(2021년 말)와 함께 **deprecated**되었다."
- "**`React.StrictMode`나 React 18과 호환되지 않으며, 앞으로도 업데이트되지 않는다.**"
- "대신 `@mui/system`을 사용하라. 새 앱에서 `@mui/styles`를 쓰면 해결 불가능한 의존성 문제를 겪게 된다."

```tsx
// ❌ v4 잔재 — React 18 concurrent 렌더/StrictMode에서 스타일 유실·중복 주입
import { makeStyles } from '@mui/styles';
const useStyles = makeStyles((theme) => ({ root: { padding: theme.spacing(2) } }));
function Card() {
  const classes = useStyles();
  return <div className={classes.root} />;
}

// ✅ styled()로 이전
const Root = styled('div')(({ theme }) => ({ padding: theme.spacing(2) }));
function Card() {
  return <Root />;
}

// ✅ 1회성이면 sx
<Box sx={{ p: 2 }} />
```

증상 체크: React 18 `createRoot` 전환 후 **StrictMode에서만 스타일이 사라지거나 두 번 주입**되면 `@mui/styles` 잔존을 먼저 의심한다.
`makeStyles`가 `@mui/material/styles`에서도 export되지만, 이는 `@mui/styles`로 위임되는 레거시 경로이므로 동일하게 취급한다.

### React 19

- v5 최종(5.18.0)의 peer는 React 17/18/19를 모두 허용한다 — React 19 호환은 v6에서 v5로 **백포트**되었다(공식 이슈 #44413, 2024-12-17 종료).
- **초기 v5 마이너(예: 5.10.x)의 peer는 `^17 || ^18`뿐**이다. React 19로 올리려면 v5 최신 마이너(5.18.0)까지는 올려야 하며, 그마저도 지원 종료 버전임을 감안해야 한다.
- v6 이상에서 React 18 이하를 쓸 때는 `react-is` 버전 정렬이 필요하다 — 업그레이드 체크리스트에 넣는다.

```json
// package.json (v6+ & React 18 조합)
"overrides": { "react-is": "^18.3.1" }
```

---

## 9. 성능 주의점

공식 벤치마크(MUI System 문서의 Performance tradeoffs, 상대 비교 기준):

| 렌더 대상 | 소요 |
|-----------|------|
| 순수 `<div>` | 100ms (기준) |
| `styled()` 컴포넌트 | 181ms |
| `<Box sx={{…}}>` | 296ms |

즉 **`sx`는 `styled()`보다 대략 1.6배, 순수 DOM 대비 약 3배 비싸다**(측정 환경에 따라 달라지는 상대 지표). 대부분의 화면에서는 문제되지 않지만 아래 상황에는 규칙이 필요하다.

- **리스트/테이블처럼 같은 요소가 수백 개 렌더되는 곳** → 각 아이템에 `sx`를 붙이지 말고, `styled()` 컴포넌트를 쓰거나 **부모 하나에만 `sx`를 두고 자식 선택자로 처리**한다(공식 권장: "단일 스타일 주입 지점").

```tsx
// ❌ 1000개 행마다 sx 객체 생성 + 스타일 직렬화
{rows.map((r) => <Box key={r.id} sx={{ p: 1, borderBottom: '1px solid #eee' }}>{r.name}</Box>)}

// ✅ A. styled 컴포넌트 재사용 (클래스 1개 공유)
const Row = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));
{rows.map((r) => <Row key={r.id}>{r.name}</Row>)}

// ✅ B. 부모 1곳에만 sx (단일 주입 지점)
<Box sx={{ '& > .row': { p: 1, borderBottom: '1px solid #eee' } }}>
  {rows.map((r) => <div key={r.id} className="row">{r.name}</div>)}
</Box>
```

- **매 프레임 바뀌는 값**(드래그 위치, 컬러 피커 프리뷰)은 `sx`에 넣지 말고 **인라인 CSS 변수**로 넘긴다. 값이 바뀔 때마다 새 `<style>` 규칙이 삽입되는 것을 막는다.

```tsx
<Box style={{ '--x': `${x}px` } as React.CSSProperties} sx={{ transform: 'translateX(var(--x))' }} />
```

- `sx`의 번들 비용은 **약 15kB gzip 고정**이다(속성 수를 늘려도 증가하지 않음). 반대로 `styled()`는 사용량에 비례해 늘어난다 → "전역 소수 + 지역 다수" 조합이 유리하다.
- `createTheme()`를 **컴포넌트 본문에서 매 렌더 호출하지 않는다.** 모듈 최상단 상수 또는 `useMemo([mode])`.
- 정적인 `sx` 객체를 렌더 함수 안에서 매번 새로 만들지 말고 컴포넌트 밖 상수로 뺀다.

---

## 10. v5 → 상위 버전 업그레이드 경로

v5는 지원 종료 상태다. 최종 목표는 v9([`frontend/mui-v9`](../mui-v9/SKILL.md))이며, **v5 → v6 → v7 → v9 순서**로 올린다(v8은 존재하지 않는다).

### 10-1. 단계별로 깨지는 것

| 단계 | 주요 breaking change |
|------|----------------------|
| **v5 → v6** | IE11 지원 제거 / TypeScript 최소 4.7 / `Unstable_Grid2` → `Grid2` 안정화 + `xs={12} xsOffset={2}` → `size={{ xs: 12 }} offset={{ xs: 2 }}` / `Grid2`의 `disableEqualOverflow` 제거 / `CssVarsProvider`·`extendTheme` 실험 접두어 제거(정식화) / `theme.palette.mode` 분기 → `theme.applyStyles()` / `ListItem`의 `button`·`selected` 등 제거 → `ListItemButton` / React 18 이하 사용 시 `react-is` 정렬 필요 / MUI 패키지 일괄 6.x 정렬(MUI X는 별도 버저닝이라 함께 올리지 않음) |
| **v6 → v7** | 기존 `Grid` → **`GridLegacy`로 개명**, `Grid2` → **`Grid`** (`.MuiGrid2-root` → `.MuiGrid-root`) / 슬롯 패턴 전면 표준화(`components`/`componentsProps` 계열 정리) / package `exports` 제한 — `@mui/material/styles/createTheme` 같은 2단계 이상 deep import 금지, `import { createTheme } from '@mui/material/styles'`로 변경 / modern 번들 alias 제거 |
| **v7 → v9** | System props 직접 사용 제거(`<Box mt={2}>` → `sx`) / Grid `direction="column"` 미지원 / `GridLegacy` 완전 제거 / `slots`·`slotProps`로 완전 통일 / `cssVariables: true` 정식 옵션 / `disableEscapeKeyDown` 제거 / CSS 복합 클래스명 변경 / `@mui/styles` 완전 제거 — 상세는 [`frontend/mui-v9`](../mui-v9/SKILL.md) 섹션 10 |

### 10-2. `@mui/codemod`

```bash
# 실행 형식: npx @mui/codemod@latest <transform> <path>
# 반드시 커밋된 상태에서 돌리고 diff를 검토한다

# (v4 잔재가 남아 있다면 먼저) v4 → v5 일괄
npx @mui/codemod@latest v5.0.0/preset-safe ./src

# v5 → v6
npx @mui/codemod@latest v6.0.0/grid-v2-props ./src        # xs/xsOffset → size/offset
npx @mui/codemod@latest v6.0.0/list-item-button-prop ./src
npx @mui/codemod@latest v6.0.0/styled ./src               # palette.mode 분기 → applyStyles
npx @mui/codemod@latest v6.0.0/sx-prop ./src
npx @mui/codemod@latest v6.0.0/theme-v6 ./src/theme.ts

# v6 → v7
npx @mui/codemod@latest v7.0.0/grid-props ./src           # Grid → GridLegacy / Grid2 → Grid

# 각 단계에서 다음 메이저 준비 (deprecated API 선정리)
npx @mui/codemod@latest deprecations/all ./src
```

**권장 순서:** ① v5 최신 마이너(5.18.0)로 올려 빌드·회귀 확인 → ② `deprecations/all`로 사전 정리 → ③ 메이저를 1단계씩 올리며 해당 codemod 적용 → ④ 각 단계마다 `@mui/material`·`@mui/system`·`@mui/icons-material`·`@mui/lab`·`@mui/material-nextjs` 버전 라인 동시 정렬 → ⑤ 시각 회귀(스냅샷) 확인.
`preset-safe`는 v5.0.0 네임스페이스에만 제공되므로 v6/v7 단계는 개별 transform을 나열해 실행한다.

---

## 11. 흔한 실수 패턴

| ❌ 실수 | 왜 문제인가 | ✅ v5 정답 |
|---------|-------------|-----------|
| `<Grid size={{ xs: 12 }}>` | `size`는 v6+ `Grid2`/v7+ `Grid` API. v5에는 없음 | `<Grid item xs={12}>` |
| v5 기본 `Grid`에 `offset` 사용 | v5 기본 Grid에 offset 없음 | `Unstable_Grid2`의 `mdOffset` 또는 `ml: 'auto'` |
| `direction="column"` 컨테이너에서 `xs={6}` | v5에서 미지원(너비 제어 prop) | `<Stack spacing={2}>` |
| `theme.applyStyles('dark', {...})` | v6+ API — v5에는 없음(런타임 에러) | `theme.palette.mode === 'dark' && {...}` |
| `createTheme({ cssVariables: true, colorSchemes })` | v5 `createTheme`에 없는 옵션 — 조용히 무시됨 | `experimental_extendTheme` + `Experimental_CssVarsProvider` |
| `slotProps={{ input: … }}`를 v5 `TextField`에 사용 | v5 TextField에는 slots API 없음 | `InputProps` / `inputProps` / `InputLabelProps` |
| `makeStyles`/`withStyles` 신규 사용 | deprecated + React 18·StrictMode 비호환 | `styled()` 또는 `sx` |
| `styleOverrides.root` 안에 `variants` 배열 | v5는 컴포넌트 키 직속 `variants`만 인식 | `MuiButton: { variants: [...] }` |
| 컴포넌트 본문에서 `createTheme()` 호출 | 렌더마다 전체 테마·스타일 재계산 | 모듈 상수 또는 `useMemo([mode])` |
| 리스트 각 행에 `sx` 부착 | 행 수만큼 스타일 직렬화 비용(공식 벤치마크 기준 최대 약 3배) | `styled()` 컴포넌트 또는 부모 1곳 자식 선택자 |
| MUI 스타일이 커스텀 CSS를 이김 | Emotion 주입 순서 문제 | `<StyledEngineProvider injectFirst>` / `createCache({ prepend: true })` / 5.18.0+ `enableCssLayer` |
| SSR에서 전역 Emotion 캐시 재사용 | 요청 간 스타일 오염·hydration 불일치 | 요청마다 `createCache()` 새로 생성 |
| `@mui/material@5`에 `@mui/icons-material@6` 혼용 | 테마 컨텍스트 분리·타입 충돌 | 모든 MUI 패키지 메이저 라인 일치 |
| 커스텀 테마 노드 이름을 `vars`로 지정 | `theme.vars`는 CSS 변수 전용 예약 필드 | 다른 이름 사용(`custom`, `status` 등) |
| v5 유지 = 안전하다고 판단 | v5는 보안 패치 대상이 아님(EOL) | 유지하되 업그레이드 계획 병행(섹션 10) |

---

> 최신 버전(v9) 기준 패턴 → [`frontend/mui-v9`](../mui-v9/SKILL.md)
> 이 스킬은 **v5.x 고정 레거시**에만 적용한다.
