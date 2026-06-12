---
name: rsbuild
description: Rsbuild — Rspack 기반 고수준 웹 애플리케이션 빌드 툴. zero-config React/Vue/Svelte 세팅, CRA/webpack 마이그레이션, Module Federation, Vite/tsup/Next.js와의 선택 기준 포함
---

# Rsbuild 빌드 툴

> 소스: https://rsbuild.rs | https://github.com/web-infra-dev/rsbuild | https://rslib.rs
> 검증일: 2026-04-23

---

## Rsbuild란

Rsbuild는 ByteDance **web-infra-dev** 팀이 만든 **Rspack 기반 고수준 웹 애플리케이션 빌드 툴**이다. Rspack(Rust로 작성된 webpack 호환 번들러)을 저수준 엔진으로 쓰고, 그 위에 React/Vue/Svelte 등 프레임워크 플러그인, SCSS/PostCSS, HTML 템플릿, devServer, 이미지 최적화 같은 웹 앱 빌드에 필요한 기능을 **zero-config**로 묶어둔 배터리-포함형 툴이다.

- **Rspack** = webpack 대체 번들러 (로우 레벨, loader/plugin 직접 구성)
- **Rsbuild** = Rspack을 쓰는 "Vite 같은 프리셋" (하이 레벨, 기본값 내장)

> **중요:** Rsbuild는 **애플리케이션 빌드 전용**이다. 라이브러리/패키지 빌드는 같은 팀의 **Rslib**을 쓴다 (아래 "라이브러리 빌드" 섹션 참조).

---

## 버전 정보

| 항목 | 값 |
|------|-----|
| 최신 메이저 | **Rsbuild 2.x** (v2.0.0 릴리즈: 2025-04-22) |
| 마지막 1.x | v1.7.5 (2025-03-30) — 유지보수 브랜치 |
| 지원 프레임워크 공식 템플릿 | React, Vue, Svelte, Solid, Preact, Lit, Vanilla |
| 엔진 | Rspack (Rust 기반, webpack 호환) |

> 주의: 프로젝트마다 최신 patch 버전은 `npm view @rsbuild/core version`으로 재확인한다.

---

## 언제 Rsbuild를 선택하는가 (의사결정 표)

```
무엇을 만드나?
├── Next.js 앱  → Next.js (Turbopack/webpack 내장) — Rsbuild 불필요
├── SPA (React/Vue/Svelte)
│   ├── 기존 webpack/CRA 프로젝트를 "설정 유지하며" 빠르게 이전 → Rsbuild ✅
│   ├── 신규 프로젝트, Vite 생태계 선호 → Vite
│   └── Module Federation / 마이크로프론트엔드 핵심 요구 → Rsbuild ✅
└── npm 라이브러리 / 모노레포 공유 패키지 → tsup 또는 Rslib (Rsbuild 아님)
```

| 기준 | Rsbuild | Vite | webpack | tsup |
|------|---------|------|---------|------|
| 대상 | 웹 앱 | 웹 앱 | 웹 앱 | 라이브러리 |
| 엔진 | Rspack (Rust) | esbuild + Rollup | JS | esbuild |
| Dev 서버 엔진 | Rspack (번들) | esbuild (네이티브 ESM) | webpack-dev-server | 해당 없음 |
| Prod 빌드 엔진 | Rspack | Rollup | webpack | esbuild |
| Dev ≈ Prod 일관성 | ✅ (동일 엔진) | ⚠️ (엔진 다름) | ✅ | 해당 없음 |
| webpack 플러그인 호환 | ✅ (대부분) | ❌ | ✅ | ❌ |
| Module Federation | ✅ 공식 지원 | 비공식 플러그인 | ✅ (원조) | ❌ |
| Zero-config | ✅ | ✅ | ❌ | ✅ |
| CRA 마이그레이션 가이드 | ✅ 공식 | ✅ 공식 | - | - |

### 구체적 선택 가이드

- **Rsbuild 선택**: webpack 설정이 많은 기존 프로젝트를 큰 고치지 않고 Rust 속도로 업그레이드, Module Federation 쓰는 마이크로프론트엔드, Dev와 Prod 빌드 차이(esbuild vs Rollup) 때문에 Vite에서 불안함을 겪은 경우
- **Vite 선택**: 신규 SPA, 풍부한 Vite 플러그인 생태계 활용, esbuild 기반 초기 기동 속도 최우선
- **Next.js 선택**: SSR/SSG/RSC 필요
- **tsup / Rslib 선택**: npm 배포 라이브러리, 모노레포 내부 공유 패키지

---

## 설치 및 프로젝트 생성

### 신규 프로젝트 (scaffold)

```bash
npm create rsbuild@latest
# 또는
pnpm create rsbuild@latest
```

대화형으로 템플릿 선택: `react`, `vue`, `svelte`, `solid`, `preact`, `lit`, `vanilla` + `-ts` variant.

비대화형:
```bash
npx -y create-rsbuild@latest my-app --template react-ts
```

### 기존 프로젝트에 추가

```bash
npm add -D @rsbuild/core @rsbuild/plugin-react
```

---

## 기본 설정 (`rsbuild.config.ts`)

```typescript
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/main.tsx',
    },
  },
  output: {
    distPath: {
      root: 'dist',
    },
  },
  server: {
    port: 3000,
  },
});
```

### 최상위 필드

| 필드 | 용도 |
|------|------|
| `plugins` | Rsbuild 플러그인 배열 |
| `source` | 엔트리, alias, 환경변수 define, 포함/제외 규칙 |
| `output` | 산출물 경로, minify, sourcemap, target 환경 |
| `html` | HTML 템플릿, meta, favicon |
| `server` | devServer host/port/proxy/https |
| `dev` | HMR, lazy compilation, live reload |
| `resolve` | alias, extensions, mainFields |
| `tools` | Rspack/PostCSS/SWC escape hatch |
| `performance` | chunk 분리, prefetch/preload, console 제거 |
| `moduleFederation` | MF v1.5 내장 옵션 (v2.0은 별도 플러그인) |
| `security` | nonce, SRI |

### package.json scripts

```json
{
  "scripts": {
    "dev": "rsbuild dev",
    "build": "rsbuild build",
    "preview": "rsbuild preview"
  }
}
```

---

## React 프로젝트 세팅

### 1. React 플러그인

```bash
npm add -D @rsbuild/plugin-react
```

```typescript
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
});
```

`@rsbuild/plugin-react`는 기본적으로 **automatic JSX runtime**을 쓰므로 파일 상단의 `import React from 'react'`는 필요 없다.

### 2. SVG → React 컴포넌트 (SVGR)

```bash
npm add -D @rsbuild/plugin-svgr
```

```typescript
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginSvgr({ mixedImport: true }),
  ],
});
```

```tsx
// mixedImport: true 일 때
import LogoUrl, { ReactComponent as Logo } from './logo.svg';
```

### 3. TypeScript 타입 체크 (빌드 타임 별도 프로세스)

```bash
npm add -D @rsbuild/plugin-type-check
```

```typescript
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';

export default defineConfig({
  plugins: [pluginReact(), pluginTypeCheck()],
});
```

> Rsbuild는 SWC로 트랜스파일하므로 **타입 검사를 수행하지 않는다**. `plugin-type-check`가 별도 프로세스로 `tsc --noEmit`을 돌린다.

---

## SCSS / 환경 변수 / 경로 alias

### SCSS

```bash
npm add -D @rsbuild/plugin-sass
```

```typescript
import { pluginSass } from '@rsbuild/plugin-sass';

export default defineConfig({
  plugins: [pluginReact(), pluginSass()],
});
```

Less가 필요하면 `@rsbuild/plugin-less`, Stylus는 `@rsbuild/plugin-stylus`.

### 환경 변수

`.env` 파일의 `PUBLIC_` 접두사가 기본적으로 클라이언트에 주입된다 (CRA의 `REACT_APP_`, Vite의 `VITE_`와 동일 개념).

```bash
# .env
PUBLIC_API_URL=https://api.example.com
```

```typescript
// 사용
console.log(import.meta.env.PUBLIC_API_URL);
// 또는 Rsbuild는 process.env.PUBLIC_API_URL도 지원
```

CRA의 `REACT_APP_` 접두사를 그대로 살리려면:

```typescript
import { defineConfig, loadEnv } from '@rsbuild/core';

const { publicVars, rawPublicVars } = loadEnv({ prefixes: ['REACT_APP_'] });

export default defineConfig({
  source: {
    define: {
      ...publicVars,
      'process.env': JSON.stringify(rawPublicVars),
    },
  },
});
```

### 경로 alias

```typescript
import { defineConfig } from '@rsbuild/core';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
    },
  },
});
```

`tsconfig.json`도 동기화:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

---

## CRA → Rsbuild 마이그레이션 요점

공식 가이드: https://rsbuild.rs/guide/migration/cra

### 순서

```
1. react-scripts 제거, @rsbuild/core + @rsbuild/plugin-react 설치
2. package.json scripts 교체
3. rsbuild.config.ts 생성
4. index.html 템플릿 %PUBLIC_URL% → <%= assetPrefix %>
5. 환경변수 REACT_APP_ 호환 처리
6. SVG import → @rsbuild/plugin-svgr
7. 출력 디렉토리 build → dist (또는 설정으로 build 유지)
8. Jest는 Rsbuild가 대체하지 않음 → Vitest 또는 Jest 별도 유지
```

### 1. 패키지 교체

```bash
npm remove react-scripts
npm add -D @rsbuild/core @rsbuild/plugin-react
```

### 2. scripts

```json
{
  "scripts": {
    "start": "rsbuild dev",
    "build": "rsbuild build",
    "preview": "rsbuild preview"
  }
}
```

### 3. HTML 템플릿

```html
<!-- Before (CRA, public/index.html) -->
<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />

<!-- After (Rsbuild) -->
<link rel="icon" href="<%= assetPrefix %>/favicon.ico" />
```

```typescript
export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: './public/index.html',
  },
});
```

### 4. 환경 변수

CRA 스타일 `REACT_APP_` 유지:

```typescript
import { defineConfig, loadEnv } from '@rsbuild/core';
const { publicVars, rawPublicVars } = loadEnv({ prefixes: ['REACT_APP_'] });

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    define: {
      ...publicVars,
      'process.env': JSON.stringify(rawPublicVars),
    },
  },
});
```

### 5. 출력 디렉토리

CRA 기본 `build/`를 유지하려면:

```typescript
export default defineConfig({
  output: {
    distPath: { root: 'build' },
  },
});
```

### 6. 테스트

Rsbuild는 테스트 러너를 포함하지 않는다. Jest는 그대로 유지하거나 Vitest로 전환한다.

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
