---
name: mui-v5
description: MUI v5 + Emotion 핵심 패턴 — ThemeProvider, sx prop, styled(), 컴포넌트 오버라이드, TypeScript 테마 확장, 반응형 레이아웃, 성능 최적화, Next.js App Router 통합
---

# MUI v5 + Emotion

> 소스: https://mui.com/material-ui/getting-started/
> 검증일: 2026-04-20

---

## 1. 설치 및 기본 설정

### 설치

```bash
# 핵심 패키지
npm install @mui/material @emotion/react @emotion/styled

# 아이콘 (선택)
npm install @mui/icons-material

# DatePicker 등 (별도 패키지)
npm install @mui/x-date-pickers
```

> 주의: @mui/styles (JSS 기반 makeStyles/withStyles)는 MUI v5에서 deprecated. Emotion 기반 sx prop 또는 styled()를 사용한다.

### ThemeProvider 설정

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
  spacing: 8, // 기본 단위 (px). theme.spacing(2) === '16px'
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
      <CssBaseline /> {/* CSS 리셋 + 테마 기반 기본 스타일 */}
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
```

---

## 2. 스타일링 방법 선택 기준

| 방법 | 사용 시점 | 성능 |
|------|----------|------|
| `sx` prop | 1회성·조건부 스타일, 빠른 프로토타이핑 | 런타임 (적당) |
| `styled()` | 재사용 컴포넌트, 복잡한 스타일 | 런타임 (최적화됨) |
| `theme.components` | 글로벌 기본 스타일 오버라이드 | 테마 레벨 |

> 주의: makeStyles (@mui/styles)는 JSS 기반이며 MUI v5에서 레거시. 신규 코드에서는 사용하지 않는다.

### sx prop

모든 MUI 컴포넌트에서 사용 가능. theme-aware 단축 속성 지원.

```tsx
import { Box, Typography } from '@mui/material';

<Box
  sx={{
    // 테마 spacing 참조
    p: 2,           // padding: theme.spacing(2) = '16px'
    mt: 3,          // marginTop: theme.spacing(3) = '24px'

    // 테마 palette 참조
    bgcolor: 'primary.main',
    color: 'primary.contrastText',

    // 반응형
    width: { xs: '100%', md: '50%' },
    display: { xs: 'none', sm: 'block' },

    // 중첩 셀렉터
    '& .MuiTypography-root': { fontWeight: 'bold' },

    // 콜백으로 theme 직접 접근
    border: (theme) => `1px solid ${theme.palette.divider}`,
  }}
>
  <Typography variant="h6">제목</Typography>
</Box>
```

**sx 단축 속성 정리:**

| 단축 | CSS 속성 |
|------|----------|
| `p`, `px`, `py`, `pt`, `pr`, `pb`, `pl` | padding 계열 |
| `m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml` | margin 계열 |
| `bgcolor` | backgroundColor |
| `color` | color (palette 경로 가능) |
| `width`, `height`, `minWidth`, `maxWidth` | 크기 |
| `display`, `overflow`, `textOverflow` | 디스플레이 |
| `flexGrow`, `flexShrink`, `flexDirection` | Flex |
| `gap` | gap |
| `gridColumn`, `gridRow` | Grid |
| `borderRadius` | borderRadius |
| `boxShadow` | boxShadow (theme.shadows 인덱스 가능) |
| `zIndex` | zIndex |

### styled() 컴포넌트

```tsx
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

// MUI 컴포넌트 확장
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  padding: theme.spacing(1, 3),

  // 반응형
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

// HTML 엘리먼트 기반
const Wrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
}));

// 커스텀 props 전달 (shouldForwardProp으로 DOM 전달 방지)
interface CardProps {
  elevated?: boolean;
}

const Card = styled('div', {
  shouldForwardProp: (prop) => prop !== 'elevated',
})<CardProps>(({ theme, elevated }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: elevated ? theme.shadows[4] : theme.shadows[1],
  transition: theme.transitions.create('box-shadow'),
}));

// 사용
<Card elevated>높은 그림자</Card>
<Card>낮은 그림자</Card>
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
    // 커스텀 색상 추가
    neutral: {
      main: '#64748B',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});
```

### typography 커스터마이징

```tsx
const theme = createTheme({
  typography: {
    fontFamily: '"Pretendard Variable", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    button: { textTransform: 'none' }, // 버튼 대문자 변환 비활성화
  },
});
```

### breakpoints & spacing

```tsx
const theme = createTheme({
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
  spacing: 8, // theme.spacing(1) = '8px', theme.spacing(2) = '16px'
});

// breakpoint 사용법
theme.breakpoints.up('sm')    // @media (min-width: 600px)
theme.breakpoints.down('md')  // @media (max-width: 899.95px)
theme.breakpoints.between('sm', 'lg') // @media (min-width: 600px) and (max-width: 1199.95px)
theme.breakpoints.only('md')  // @media (min-width: 900px) and (max-width: 1199.95px)
```

---

## 4. 컴포넌트 글로벌 오버라이드 (theme.components)

```tsx
const theme = createTheme({
  components: {
    MuiButton: {
      // 기본 props
      defaultProps: {
        disableElevation: true,
        disableRipple: false,
        variant: 'contained',
      },
      // 스타일 오버라이드
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.spacing(1),
          textTransform: 'none',
          fontWeight: 600,
        }),
        sizeSmall: {
          padding: '4px 12px',
          fontSize: '0.8125rem',
        },
        containedPrimary: ({ theme }) => ({
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        }),
      },
      // 커스텀 variants 추가
      variants: [
        {
          props: { variant: 'dashed' },
          style: {
            border: '2px dashed',
            backgroundColor: 'transparent',
          },
        },
        {
          props: { variant: 'dashed', color: 'primary' },
          style: ({ theme }) => ({
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
          }),
        },
      ],
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.spacing(1.5),
          boxShadow: theme.shadows[2],
        }),
      },
    },
  },
});
```

---

## 5. TypeScript 테마 타입 확장 (Module Augmentation)

```tsx
// src/types/mui.d.ts (또는 theme.d.ts)

import '@mui/material/styles';

// palette에 커스텀 색상 추가
declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
  }
}

// Button에 커스텀 variant 추가
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    dashed: true;
  }
}

// Typography에 커스텀 variant 추가
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    label: true;
  }
}

// breakpoints 커스텀 추가
declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    xxl: true; // 커스텀 추가
  }
}
```

> 주의: tsconfig.json의 `include`에 타입 선언 파일 경로가 포함되어야 한다.

---

## 6. 반응형 레이아웃

### Grid2 (Grid v2)

> 소스: https://mui.com/material-ui/react-grid2/

```tsx
import Grid from '@mui/material/Grid2';

// 기본 사용
<Grid container spacing={2}>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Card />
  </Grid>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Card />
  </Grid>
  <Grid size={{ xs: 12, sm: 12, md: 4 }}>
    <Card />
  </Grid>
</Grid>

// offset
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 8 }} offset={{ md: 2 }}>
    <CenteredContent />
  </Grid>
</Grid>
```

> 주의: Grid v1 (import Grid from '@mui/material/Grid')과 Grid v2 (import Grid from '@mui/material/Grid2')는 API가 다르다. v2에서는 `item` prop이 제거되고 `size` prop으로 반응형 크기를 지정한다. MUI v5.15+에서 안정 API.

### Box

```tsx
import { Box } from '@mui/material';

<Box
  sx={{
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: 2,
    p: 3,
  }}
>
  <Box sx={{ flex: 1 }}>사이드바</Box>
  <Box sx={{ flex: 3 }}>메인 콘텐츠</Box>
</Box>
```

### Stack

```tsx
import { Stack, Divider } from '@mui/material';

// 수직 스택 (기본)
<Stack spacing={2}>
  <Item>1</Item>
  <Item>2</Item>
</Stack>

// 수평 스택 + 반응형
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

## 7. 핵심 컴포넌트 패턴

### Dialog

```tsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmDialog({ open, title, children, onConfirm, onClose }: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">취소</Button>
        <Button onClick={onConfirm} variant="contained">확인</Button>
      </DialogActions>
    </Dialog>
  );
}
```

### Table

```tsx
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TablePagination
} from '@mui/material';

function DataTable<T extends { id: string | number }>({
  columns,
  rows,
}: {
  columns: { id: string; label: string; align?: 'left' | 'right' | 'center' }[];
  rows: T[];
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  return (
    <Paper>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align ?? 'left'}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.id} hover>
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align ?? 'left'}>
                      {(row as Record<string, unknown>)[col.id] as React.ReactNode}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="행 수"
      />
    </Paper>
  );
}
```

### Autocomplete

```tsx
import { Autocomplete, TextField, Chip } from '@mui/material';

interface Option {
  id: number;
  label: string;
  group?: string;
}

// 단일 선택
<Autocomplete
  options={options}
  getOptionLabel={(option) => option.label}
  isOptionEqualToValue={(option, value) => option.id === value.id}
  renderInput={(params) => <TextField {...params} label="선택" />}
  onChange={(_, value) => setValue(value)}
/>

// 다중 선택
<Autocomplete
  multiple
  options={options}
  getOptionLabel={(option) => option.label}
  renderTags={(value, getTagProps) =>
    value.map((option, index) => (
      <Chip label={option.label} size="small" {...getTagProps({ index })} key={option.id} />
    ))
  }
  renderInput={(params) => <TextField {...params} label="다중 선택" />}
/>

// 그룹핑
<Autocomplete
  options={options.sort((a, b) => (a.group ?? '').localeCompare(b.group ?? ''))}
  groupBy={(option) => option.group ?? ''}
  getOptionLabel={(option) => option.label}
  renderInput={(params) => <TextField {...params} label="그룹 선택" />}
/>
```

### DatePicker (@mui/x-date-pickers)

```tsx
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';

// Provider (최상위 1회)
<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
  <App />
</LocalizationProvider>

// 사용
function DateField() {
  const [value, setValue] = useState<Dayjs | null>(null);

  return (
    <DatePicker
      label="날짜 선택"
      value={value}
      onChange={(newValue) => setValue(newValue)}
      format="YYYY.MM.DD"
      slotProps={{
        textField: { size: 'small', fullWidth: true },
      }}
    />
  );
}
```

---

## 8. 성능 최적화

### Emotion Cache (SSR / 스타일 순서 제어)

```tsx
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

// prepend: true로 MUI 스타일을 head 상단에 삽입 → 커스텀 CSS가 우선권 가짐
const cache = createCache({
  key: 'mui',
  prepend: true,
});

function App() {
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </CacheProvider>
  );
}
```

### 번들 크기 최적화

```tsx
// 권장: path import (트리 쉐이킹 보장)
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// 비권장: named import (번들러 설정에 따라 트리 쉐이킹 실패 가능)
// import { Button, Typography } from '@mui/material';
```

> 주의: 최신 번들러(Vite, webpack 5+)에서는 named import도 트리 쉐이킹이 잘 동작하지만, path import가 더 안전하다.

### 불필요한 리렌더 방지

```tsx
// sx 객체를 컴포넌트 밖에 선언 → 매 렌더마다 새 객체 생성 방지
const cardSx = {
  p: 2,
  borderRadius: 1,
  boxShadow: 1,
} as const;

function Card({ children }: { children: React.ReactNode }) {
  return <Box sx={cardSx}>{children}</Box>;
}

// theme 콜백 사용 시 useMemo 불필요 (MUI 내부에서 처리)
```

---

## 9. Next.js App Router 통합

### Emotion + ThemeProvider 설정

```tsx
// src/lib/ThemeRegistry.tsx
'use client';

import { useState } from 'react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = useState(() => {
    const c = createCache({ key: 'mui' });
    c.compat = true;
    return c;
  });

  useServerInsertedHTML(() => {
    const names = Object.keys(cache.inserted);
    if (names.length === 0) return null;

    let styles = '';
    for (const name of names) {
      if (cache.inserted[name] !== true) {
        styles += cache.inserted[name] as string;
      }
    }

    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
```

```tsx
// src/app/layout.tsx
import ThemeRegistry from '@/lib/ThemeRegistry';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
```

> 주의: MUI 컴포넌트는 클라이언트 컴포넌트이므로, MUI를 사용하는 컴포넌트에는 'use client'가 필요하다. 서버 컴포넌트에서는 MUI 컴포넌트를 직접 사용할 수 없다.

---

## 10. 흔한 실수

| 실수 | 올바른 방법 |
|------|-----------|
| makeStyles 사용 | sx prop 또는 styled() 사용 |
| sx 객체를 렌더 함수 안에서 매번 생성 | 컴포넌트 밖에 상수로 선언 |
| Grid v1의 `item` prop을 Grid v2에서 사용 | Grid v2에서는 `size` prop 사용 |
| `styled()` 커스텀 prop이 DOM에 전달됨 | `shouldForwardProp`으로 필터링 |
| TypeScript에서 커스텀 palette 색상 에러 | Module augmentation으로 타입 확장 |
| Next.js App Router에서 ThemeProvider가 서버 컴포넌트에 있음 | 'use client' + ThemeRegistry 패턴 |
| Button `variant="text"` 인데 색상이 안 보임 | `color` prop 확인 (기본 primary) |
| `@mui/material`과 `@mui/system` 버전 불일치 | 모든 @mui/* 패키지 버전 통일 |
