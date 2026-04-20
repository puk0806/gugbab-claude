---
name: cra-to-vite-migration
description: Create React App(CRA)에서 Vite로 마이그레이션하는 단계별 절차. 환경 변수·index.html·SVG·Jest→Vitest·tsconfig 변경 패턴 포함
---

# CRA → Vite 마이그레이션

> 소스: https://vitejs.dev/guide/ | https://react.dev/blog/2025/02/14/sunsetting-create-react-app | https://vitest.dev/config/
> 검증일: 2026-04-20

> **배경:** CRA(Create React App)는 2025년 2월 공식 deprecated. 신규 프로젝트는 Vite, 기존 프로젝트는 이 가이드로 전환한다.

---

## 전체 순서 요약

```
1. 패키지 교체 (react-scripts 제거, vite 설치)
2. index.html 이동 (public/ → 루트)
3. vite.config.ts 생성
4. package.json scripts 수정
5. 환경 변수 전환 (REACT_APP_ → VITE_)
6. SVG import 수정 (vite-plugin-svgr)
7. tsconfig 업데이트
8. Jest → Vitest 전환
9. 빌드·실행 검증
```

---

## 1단계: 패키지 교체

```bash
# 제거
npm uninstall react-scripts

# 설치
npm install -D vite @vitejs/plugin-react-swc
# 또는 Babel 기반이면: @vitejs/plugin-react
```

> **주의:** `@vitejs/plugin-react-swc`는 SWC로 트랜스파일해 더 빠름. Babel 플러그인(styled-components 등)이 있으면 `@vitejs/plugin-react` 유지.

---

## 2단계: index.html 이동

```
Before (CRA):
public/
  index.html   ← %PUBLIC_URL% 사용

After (Vite):
index.html     ← 루트에 위치, %PUBLIC_URL% 제거
```

```html
<!-- Before (CRA) -->
<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
<div id="root"></div>

<!-- After (Vite) -->
<link rel="icon" href="/favicon.ico" />
<div id="root"></div>
<!-- body 닫기 전 추가 (CRA는 자동 주입, Vite는 명시 필요) -->
<script type="module" src="/src/main.tsx"></script>
```

---

## 3단계: vite.config.ts 생성

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    // CRA의 setupProxy.js → server.proxy로 이전
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build', // CRA 기본값 유지하려면 'build', Vite 기본은 'dist'
    sourcemap: true,
  },
})
```

### path alias + vite-tsconfig-paths (선택)

tsconfig의 `paths`를 Vite에서 자동 인식하려면:

```bash
npm install -D vite-tsconfig-paths
```

```typescript
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // resolve.alias 없어도 tsconfig paths 자동 반영
})
```

---

## 4단계: package.json scripts 수정

```json
{
  "scripts": {
    "start": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  }
}
```

---

## 5단계: 환경 변수 전환

### .env 파일 수정

```bash
# Before (CRA)
REACT_APP_API_URL=https://api.example.com
REACT_APP_FEATURE_FLAG=true

# After (Vite)
VITE_API_URL=https://api.example.com
VITE_FEATURE_FLAG=true
```

### 코드 수정

```typescript
// Before (CRA)
const apiUrl = process.env.REACT_APP_API_URL
const flag = process.env.REACT_APP_FEATURE_FLAG === 'true'

// After (Vite)
const apiUrl = import.meta.env.VITE_API_URL
const flag = import.meta.env.VITE_FEATURE_FLAG === 'true'
```

### 내장 환경 변수 대응

| CRA | Vite |
|-----|------|
| `process.env.NODE_ENV` | `import.meta.env.MODE` |
| `process.env.PUBLIC_URL` | `import.meta.env.BASE_URL` |
| `process.env.REACT_APP_*` | `import.meta.env.VITE_*` |

> **주의:** `VITE_` 접두사 없는 변수는 클라이언트에 노출되지 않음. 의도적으로 숨기는 서버 전용 값은 접두사 없이 유지.

---

## 6단계: SVG import 수정

```bash
npm install -D vite-plugin-svgr
```

```typescript
// vite.config.ts
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), svgr()],
})
```

```typescript
// src/vite-env.d.ts (또는 vite-plugin-svgr/client 추가)
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
```

```tsx
// Before (CRA — @svgr/webpack 내장)
import { ReactComponent as Logo } from './logo.svg'

// After (Vite + vite-plugin-svgr v4)
import Logo from './logo.svg?react'

// 사용은 동일
function App() {
  return <Logo className="logo" />
}
```

> **주의:** `?react` 쿼리가 없으면 URL 문자열로 import됨. 모든 SVG 컴포넌트 import에 `?react` 추가 필수.

---

## 7단계: tsconfig 업데이트

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "types": ["vite/client"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

**CRA tsconfig에서 주요 변경점:**

| 항목 | CRA 기본값 | Vite 권장값 |
|------|-----------|------------|
| `moduleResolution` | `node` | `bundler` |
| `types` | `["react-scripts"]` | `["vite/client"]` |
| `noEmit` | 없음 | `true` |
| `allowImportingTsExtensions` | 없음 | `true` |

---

## 8단계: Jest → Vitest 전환

```bash
# Jest 제거
npm uninstall jest jest-environment-jsdom babel-jest @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript

# Vitest 설치
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/jest-dom
```

### vite.config.ts에 test 블록 추가

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,              // describe/it/expect 전역 사용
    environment: 'jsdom',       // 브라우저 DOM 시뮬레이션
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
})
```

### setupTests.ts — 수정 불필요

```typescript
// src/setupTests.ts (CRA와 동일하게 유지)
import '@testing-library/jest-dom'
```

### jest.config.js 삭제

Vitest는 vite.config.ts의 `test` 블록으로 통합. `jest.config.js` 삭제.

### 코드 변경 (vi = jest API 호환)

```typescript
// Before (Jest)
import { jest } from '@jest/globals'
jest.fn()
jest.mock('./module')
jest.spyOn(obj, 'method')

// After (Vitest — API 동일, 네이밍만 변경)
import { vi } from 'vitest'
vi.fn()
vi.mock('./module')
vi.spyOn(obj, 'method')
```

---

## 흔한 실수 패턴

### 1. %PUBLIC_URL% 제거 누락

```html
<!-- ❌ Vite에서 %PUBLIC_URL%은 빈 문자열로 처리되지 않음 -->
<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />

<!-- ✅ 절대 경로로 수정 -->
<link rel="icon" href="/favicon.ico" />
```

### 2. process.env 잔존

```typescript
// ❌ Vite에서 process.env.REACT_APP_* undefined 반환
const url = process.env.REACT_APP_API_URL

// ✅
const url = import.meta.env.VITE_API_URL
```

### 3. SVG ?react 쿼리 누락

```tsx
// ❌ 문자열 URL이 반환됨 (컴포넌트 아님)
import Logo from './logo.svg'
return <Logo />  // 런타임 에러

// ✅
import Logo from './logo.svg?react'
```

### 4. script 태그 미추가

```html
<!-- ❌ CRA는 자동 주입, Vite는 직접 명시 필요 -->
<body>
  <div id="root"></div>
  <!-- 여기에 script 없으면 앱이 로드 안 됨 -->
</body>

<!-- ✅ -->
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

### 5. VITE_ 없는 변수 클라이언트 노출 불가

```bash
# ❌ 아래 변수는 import.meta.env에서 undefined
SECRET_KEY=abc123

# ✅ 클라이언트에서 접근하려면 VITE_ 접두사 필수
VITE_SECRET_KEY=abc123
# (단, 진짜 시크릿 값은 VITE_ 붙이면 브라우저에 노출됨 — 주의)
```

### 6. jest.config.js와 vitest test 블록 중복 존재

```typescript
// ❌ jest.config.js 남겨두면 충돌 가능
// ✅ jest.config.js 삭제 + vite.config.ts test 블록 단일화
```

### 7. @types/jest 잔존

```bash
# ❌ @types/jest가 남으면 jest/vitest 타입 충돌
npm uninstall @types/jest

# ✅ vitest globals 타입은 tsconfig에 추가
# "types": ["vite/client", "vitest/globals"]
```
