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
