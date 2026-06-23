---
name: mui-v9
description: MUI v9 (Material UI) 핵심 패턴 — ThemeProvider + CSS Variables, colorSchemes 다크모드, sx prop, styled(), slots/slotProps, Grid v9 (size prop), TypeScript 테마 확장, v5→v9 마이그레이션 포인트
---

# MUI v9 (Material UI)

> 소스: https://mui.com/material-ui/getting-started/
>       https://mui.com/blog/introducing-material-ui-v9/
>       https://mui.com/material-ui/migration/upgrade-to-v9/
> 검증일: 2026-06-19

> 참고: v5 → v6 → v7 → v9 순서로 출시됨 (v8은 존재하지 않음 — MUI X와 버전 번호를 맞추기 위한 의도적 스킵).

---

## 1. 설치 및 기본 설정

### 설치

```bash
# 핵심 패키지 (패키지명 변경 없음)
npm install @mui/material @emotion/react @emotion/styled

# 아이콘 (선택)
npm install @mui/icons-material

# DatePicker 등 (별도 패키지)
npm install @mui/x-date-pickers
```

> 주의: `@mui/styles` (JSS 기반 makeStyles/withStyles)는 v9에서 완전 제거됨. `sx` prop 또는 `styled()`를 사용한다.

### 기본 ThemeProvider (CSS Variables 미사용)

```tsx
// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: '"Pretendard", "Roboto", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
  },
  spacing: 8,
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
});

export default theme;
```

```tsx
// src/App.tsx
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
```

### CSS Variables + colorSchemes (v9 권장 패턴)

다크 모드가 필요한 경우 `cssVariables: true` + `colorSchemes`를 사용한다. SSR 깜빡임 없이 라이트/다크를 전환할 수 있다.

```tsx
import { createTheme, ThemeProvider } from '@mui/material/styles';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: { primary: { main: '#1976d2' } },
    },
    dark: {
      palette: { primary: { main: '#90caf9' } },
    },
  },
});

// Next.js App Router: layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <InitColorSchemeScript />  {/* SSR 깜빡임 방지 */}
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 다크 모드 토글 훅

```tsx
import { useColorScheme } from '@mui/material/styles';

function ModeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
      현재: {mode}
    </button>
  );
}
```

---

## 2. 스타일링 방법 선택 기준

| 방법 | 사용 시점 |
|------|----------|
| `sx` prop | 1회성·조건부 스타일, 빠른 프로토타이핑 |
| `styled()` | 재사용 컴포넌트, 복잡한 스타일 |
| `theme.components` | 글로벌 기본 스타일 오버라이드 |

### sx prop

모든 MUI 컴포넌트에서 사용 가능. theme-aware 단축 속성 지원.

```tsx
import { Box } from '@mui/material';

<Box
  sx={{
    p: 2,                          // padding: theme.spacing(2)
    mt: 3,                         // marginTop: theme.spacing(3)
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    width: { xs: '100%', md: '50%' },   // 반응형
    display: { xs: 'none', sm: 'block' },
    '&:hover': { opacity: 0.8 },   // pseudo-class
    '& .MuiButton-root': { fontWeight: 700 },  // 자식 선택자
  }}
/>
```

**CSS Variables 테마 참조 (cssVariables: true 사용 시):**

```tsx
// theme.vars 사용 — SSR/다크모드 안전
<Box sx={{ color: (theme) => theme.vars.palette.primary.main }} />
```

**다크 모드 조건부 스타일 (v9 권장):**

```tsx
<Card
  sx={[
    { backgroundColor: 'background.paper' },
    (theme) => theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[900],
    }),
  ]}
/>
```

> 주의: v9에서 `<Box mt={2}>` 같은 **System props 직접 사용은 제거**되었다. 반드시 `sx={{ mt: 2 }}`로 작성해야 한다. 영향 컴포넌트: `Box`, `Typography`, `Grid`, `Stack`, `Link`, `DialogContentText`.

```tsx
// ❌ v9에서 오류
<Box mt={2} color="primary.main" />
<Typography color="primary" />

// ✅ v9 정답
<Box sx={{ mt: 2, color: 'primary.main' }} />
<Typography sx={{ color: 'primary.main' }} />
```

### styled() 컴포넌트

```tsx
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

// 기본
const PrimaryButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5, 3),
}));

// 다크 모드 대응 (applyStyles)
const ThemedCard = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  ...theme.applyStyles('dark', {
    backgroundColor: theme.palette.grey[900],
  }),
}));

// 조건부 스타일 (variant prop)
const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'rounded',
})<{ rounded?: boolean }>(({ theme, rounded }) => ({
  ...(rounded && { borderRadius: theme.spacing(3) }),
}));
```

---

## 3. 커스텀 테마

### palette 확장

```tsx
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    // 커스텀 색상
    custom: {
      highlight: '#f5f5f5',
    },
  },
});
```

### typography 커스터마이징

```tsx
const theme = createTheme({
  typography: {
    fontFamily: '"Pretendard", "Roboto", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    // 커스텀 variant
    caption2: { fontSize: '0.625rem', color: 'text.secondary' },
  },
});
```

### breakpoints & spacing

```tsx
const theme = createTheme({
  spacing: 8,  // theme.spacing(1) = '8px'
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
});

// 사용
theme.spacing(2)        // '16px'
theme.breakpoints.up('md')  // '@media (min-width: 900px)'
```

### 단계적 테마 확장 (의존 관계)

```tsx
let theme = createTheme({
  palette: { primary: { main: '#0052cc' } },
});
theme = createTheme(theme, {
  palette: {
    info: { main: theme.palette.primary.main },
  },
});
```

---

## 4. 컴포넌트 글로벌 오버라이드 (theme.components)

```tsx
const theme = createTheme({
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true,
        variant: 'contained',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          textTransform: 'none',
          // 다크 모드 대응
          ...theme.applyStyles('dark', {
            boxShadow: 'none',
          }),
          // variants API (v6+)
          variants: [
            {
              props: { variant: 'dashed' },
              style: { border: '2px dashed currentColor' },
            },
          ],
        }),
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
    },
  },
});
```

---

## 5. TypeScript 테마 타입 확장 (Module Augmentation)

```tsx
// src/theme.d.ts
import { PaletteOptions, Palette } from '@mui/material/styles';

declare module '@mui/material/styles' {
  // 팔레트 커스텀 색상
  interface Palette {
    custom: { highlight: string };
  }
  interface PaletteOptions {
    custom?: { highlight?: string };
  }

  // typography 커스텀 variant
  interface TypographyVariants {
    caption2: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    caption2?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    caption2: true;
  }
}
```

---

## 6. slots / slotProps (v9 필수 패턴)

v7부터 `components`/`componentsProps`가 제거되고 `slots`/`slotProps`로 완전히 통일되었다.

```tsx
// ❌ v5 구 방식 (v9에서 오류)
<TextField
  InputProps={{ startAdornment: <SearchIcon /> }}
  inputProps={{ maxLength: 50 }}
  InputLabelProps={{ shrink: true }}
/>
<Dialog BackdropComponent={CustomBackdrop} PaperProps={{ elevation: 0 }} />

// ✅ v9 방식
<TextField
  slotProps={{
    input: { startAdornment: <SearchIcon /> },
    htmlInput: { maxLength: 50 },
    inputLabel: { shrink: true },
  }}
/>
<Dialog
  slots={{ backdrop: CustomBackdrop }}
  slotProps={{ paper: { elevation: 0 } }}
/>
```

**Autocomplete:**

```tsx
// ❌ v5
<Autocomplete
  ChipProps={{ color: 'primary' }}
  ListboxComponent={VirtualList}
  PaperComponent={CustomPaper}
/>

// ✅ v9
<Autocomplete
  slotProps={{ chip: { color: 'primary' } }}
  slots={{ listbox: VirtualList, paper: CustomPaper }}
/>
```

---

## 7. 반응형 레이아웃

### Grid (v9)

v9의 Grid는 `size` prop을 사용한다. `xs`/`sm`/`md` 같은 개별 prop은 제거됨. `direction="column"` 지원 중단 → `Stack` 사용.

```tsx
import Grid from '@mui/material/Grid';

// 기본
<Grid container spacing={2}>
  <Grid size={8}>왼쪽 (8/12)</Grid>
  <Grid size={4}>오른쪽 (4/12)</Grid>
</Grid>

// 반응형
<Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>반응형</Grid>
  <Grid size="auto">콘텐츠 너비</Grid>
  <Grid size="grow">나머지 채움</Grid>
</Grid>

// offset
<Grid container>
  <Grid size={8} offset={2}>가운데 정렬</Grid>
  <Grid size={4} offset={{ md: 'auto' }}>오른쪽 정렬</Grid>
</Grid>

// 열 수 변경 (기본 12)
<Grid container columns={16}>
  <Grid size={8}>8/16열</Grid>
</Grid>
```

**v5 → v9 Grid 마이그레이션:**

| v5 (구) | v9 (현재) |
|---------|----------|
| `<Grid item xs={6}>` | `<Grid size={6}>` |
| `<Grid item xs={12} sm={6}>` | `<Grid size={{ xs: 12, sm: 6 }}>` |
| `<Grid container direction="column">` | `<Stack>` |
| `<Grid2>` (v5/v6 실험적) | `<Grid>` (동일 컴포넌트, import 경로 변경) |

### Box

```tsx
import { Box } from '@mui/material';

<Box
  component="section"
  sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
>
  콘텐츠
</Box>
```

### Stack

```tsx
import { Stack, Divider } from '@mui/material';

// 수직 (기본)
<Stack spacing={2}>
  <Item>1</Item>
  <Item>2</Item>
</Stack>

// 수평 + 반응형
<Stack
  direction={{ xs: 'column', sm: 'row' }}
  spacing={{ xs: 1, sm: 2 }}
  divider={<Divider orientation="vertical" flexItem />}
>
  <Item>A</Item>
  <Item>B</Item>
</Stack>
```

---

## 8. Dialog / Modal — disableEscapeKeyDown 제거 (v9)

```tsx
// ❌ v5 (v9에서 오류)
<Dialog disableEscapeKeyDown onClose={handleClose} />

// ✅ v9 — reason으로 처리
<Dialog
  onClose={(event, reason) => {
    if (reason === 'escapeKeyDown') return;  // ESC 무시
    handleClose();
  }}
/>
```

---

## 9. CSS 클래스 변경 (v9)

복합 클래스가 다중 선택자 조합으로 변경됨.

```css
/* v5 구 방식 */
.MuiAlert-standardSuccess { }
.MuiButton-textPrimary { }

/* v9 방식 */
.MuiAlert-standard.MuiAlert-colorSuccess { }
.MuiButton-text.MuiButton-colorPrimary { }
```

---

## 10. v5 → v9 주요 Breaking Changes 요약

| 항목 | v5 | v9 |
|------|----|----|
| System props | `<Box mt={2}>` 가능 | **제거** — `sx={{ mt: 2 }}` 필수 |
| Grid API | `xs`/`sm` prop on `item` | `size` prop (반응형도 `size={{ xs:12 }}`) |
| Grid direction column | `<Grid direction="column">` | **미지원** — `<Stack>` |
| slots/slotProps | `InputProps`, `PaperProps` 등 분산 | `slotProps` 통일 |
| 다크모드 | `palette.mode === 'dark'` 조건부 | `theme.applyStyles('dark', {})` |
| CSS Variables | 실험적 (`CssVarsProvider`) | `cssVariables: true` 정식 옵션 |
| `disableEscapeKeyDown` | Dialog prop 지원 | **제거** — `onClose` reason 처리 |
| `GridLegacy` | 없음 (v6에서 deprecated) | **완전 제거** |
| 아이콘 이름 | `InfoOutline` 등 23개 | **삭제** — `InfoOutlined`로 통일 |
| CSS 복합 클래스 | `.MuiButton-textPrimary` | `.MuiButton-text.MuiButton-colorPrimary` |
| `@mui/styles` (JSS) | deprecated | **완전 제거** |

---

> 상세 레퍼런스 → [`references/REFERENCE.md`](references/REFERENCE.md)
