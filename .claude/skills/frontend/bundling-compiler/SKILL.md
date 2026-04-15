---
name: bundling-compiler
description: tsup/Vite/Turbopack 번들러 선택 기준, React Compiler, Tree Shaking, 코드 스플리팅 패턴
---

# 번들링 & 컴파일러 패턴

> 소스: https://tsup.egoist.dev | https://vitejs.dev | https://nextjs.org/docs | https://react.dev/learn/react-compiler
> 검증일: 2026-03-27

---

## 번들러 선택 기준

```
프로젝트 타입?
├─ 라이브러리 (npm 배포용)
│  └─ 단순 TS/JS → tsup (추천)
│
└─ 애플리케이션
   ├─ Next.js → Turbopack (내장, 기본값)
   └─ SPA/기타 → Vite
```

| 도구 | 용도 | Dev 속도 | 설정 복잡도 |
|------|------|---------|------------|
| tsup | 라이브러리 빌드 | - | ⭐ 매우 간단 |
| Vite | SPA 앱 | ⭐⭐⭐ 빠름 | ⭐⭐ |
| Turbopack | Next.js 앱 | ⭐⭐⭐⭐ 매우 빠름 | ⭐⭐ (내장) |

---

## tsup (라이브러리 빌드)

### 기본 설정

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],    // ESM + CommonJS 동시 빌드
  dts: true,                  // TypeScript 선언 파일 생성
  clean: true,                // 빌드 전 dist/ 정리
  sourcemap: true,
  splitting: false,           // 라이브러리는 대개 false
  treeshake: true,
})
```

### 다중 Entry 패턴

```typescript
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    utils: 'src/utils/index.ts',
    types: 'src/types/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.cjs' }
  },
})
```

### package.json exports 설정

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "sideEffects": false
}
```

---

## Vite (SPA 앱 빌드)

### 기본 설정

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
  }
})
```

### 라이브러리 모드

```typescript
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MyLibrary',
      formats: ['es', 'cjs'],
      fileName: (format) => `my-library.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],  // peer deps 제외
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM' }
      }
    }
  }
})
```

---

## Turbopack (Next.js 내장)

### 활성화 방법

```javascript
// next.config.js - Next.js 16+에서는 기본값
/** @type {import('next').NextConfig} */
const nextConfig = {}

export default nextConfig

// Next.js 15: CLI 플래그로 활성화 (next dev --turbopack)
// Next.js 16+: 기본값. 커스터마이징만 turbopack 키 사용
const nextConfig = {
  turbopack: {
    // resolveAlias, rules 등 커스터마이징 시에만 설정
  },
}
```

### Webpack vs Turbopack

| 항목 | Webpack | Turbopack |
|------|---------|-----------|
| 언어 | JavaScript | Rust |
| Dev 시작 | 느림 | 매우 빠름 |
| HMR | 느림 | 거의 즉각 |
| 플러그인 호환 | 전체 | 제한적 (재구현 필요) |
| 프로덕션 빌드 | 안정 | 15.3에서 alpha, 안정화 시점 미확정 |

**Turbopack 제약:** 일부 Webpack 플러그인 미지원 → 대안 확인 필요

---

## React Compiler (자동 메모이제이션)

> v1.0 안정화: 2025년 10월 | 출처: https://react.dev/learn/react-compiler

### 활성화

```javascript
// Next.js 15+ (reactCompiler는 top-level 옵션, experimental 아님)
const nextConfig = {
  reactCompiler: true,
}

// Vite (@vitejs/plugin-react v5 이하)
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
})

// Vite 8+ (@vitejs/plugin-react v6 — babel 옵션 제거됨, @rolldown/plugin-babel 사용)
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
export default defineConfig({
  plugins: [react(), babel(reactCompilerPreset())],
})
```

### React Compiler 활성화 시 변경되는 것

```tsx
// ❌ React Compiler 없이: 수동 최적화 필요
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)
const handleClick = useCallback(() => onSelect(id), [onSelect, id])
const MemoizedComponent = memo(MyComponent)

// ✅ React Compiler 활성화 시: 자동 처리됨 (수동 최적화 제거 가능)
const sortedItems = items.sort((a, b) => a.name.localeCompare(b.name))
const handleClick = () => onSelect(id)
// memo 제거 가능
```

### React Compiler 제약사항

```tsx
// ❌ Rules of React 위반 시 컴파일러가 해당 컴포넌트 최적화 건너뜀
function BadComponent() {
  // 조건부 Hook 호출 (규칙 위반)
  if (someCondition) {
    const [state, setState] = useState(0)  // ❌
  }
}

// ✅ 올바른 패턴 (컴파일러가 최적화 가능)
function GoodComponent({ condition }: { condition: boolean }) {
  const [state, setState] = useState(0)
  return condition ? <div>{state}</div> : null
}
```

---

## Vanilla Extract (빌드타임 CSS)

### Next.js 설정

```javascript
// next.config.js
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin'

const withVanillaExtract = createVanillaExtractPlugin()

export default withVanillaExtract({
  // 다른 Next.js 설정
})
```

### 사용 패턴

```typescript
// styles.css.ts
import { style, styleVariants } from '@vanilla-extract/css'

export const base = style({
  display: 'flex',
  padding: '12px',
})

export const variants = styleVariants({
  primary: { backgroundColor: 'blue', color: 'white' },
  secondary: { backgroundColor: 'gray', color: 'black' },
})
```

```tsx
// 컴포넌트에서 사용
import { base, variants } from './styles.css'

function Button({ variant = 'primary' }: { variant: keyof typeof variants }) {
  return <button className={`${base} ${variants[variant]}`}>Click</button>
}
```

**특징:** 빌드 타임에 static CSS 생성 → 런타임 오버헤드 없음

> **주의:** `@vanilla-extract/css`의 webpack 플러그인은 현재 Turbopack에서 **미지원**. Turbopack 기반 Next.js 환경에서는 사용 불가.

---

## Tree Shaking

### 핵심 원칙

```json
// package.json: 부수 효과 없음을 번들러에 알림
{
  "sideEffects": false
}

// CSS가 있는 경우
{
  "sideEffects": ["**/*.css", "./src/polyfills.ts"]
}
```

### ESM vs CJS

```typescript
// ✅ ESM: Tree Shaking 가능
export function add(a: number, b: number) { return a + b }
export function subtract(a: number, b: number) { return a - b }

// 사용 측에서 add만 import → subtract는 번들에서 제거됨
import { add } from '@myorg/utils'

// ❌ CJS: Tree Shaking 불가
module.exports = { add, subtract }
// → 전체가 번들에 포함됨
```

### 배럴(Barrel) 파일 주의

```typescript
// ❌ 배럴 파일이 tree shaking을 방해하는 경우
// index.ts
export * from './heavy-module'  // side effect가 있으면 전체 포함

// ✅ named export 명시
export { HeavyComponent } from './heavy-module'
// 또는 직접 경로로 import
import { HeavyComponent } from '@myorg/ui/heavy-module'
```

---

## 코드 스플리팅

### React lazy + Suspense

```tsx
import { lazy, Suspense } from 'react'

// 라우트 기반 스플리팅
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  )
}
```

### Next.js dynamic

```tsx
import dynamic from 'next/dynamic'

// SSR 비활성화 (브라우저 전용 컴포넌트)
const Chart = dynamic(() => import('../components/Chart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
})

// 조건부 로드
const PDFViewer = dynamic(() => import('../components/PDFViewer'))
```

### 스플리팅 전략

```
라우트 단위 스플리팅:  필수 (페이지별 독립 청크)
컴포넌트 단위 스플리팅: 선택적 (무거운 컴포넌트만)
라이브러리 단위 스플리팅: 자동 (번들러가 처리)

❌ 피해야 할 것: 너무 잘게 쪼개기 (HTTP 요청 오버헤드)
✅ 기준: 30KB 이상인 컴포넌트 또는 특정 조건에서만 사용하는 컴포넌트
```
