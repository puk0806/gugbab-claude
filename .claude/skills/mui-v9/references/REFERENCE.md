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

---

## 11. CSS Variables + colorSchemes 예제

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

---

## 12. 다크 모드 토글 훅 예제

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

## 13. styled() 컴포넌트 예제

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

## 14. 커스텀 테마 예제 모음 — palette/typography/breakpoints/단계적 확장

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

## 15. theme.components 글로벌 오버라이드 예제

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
