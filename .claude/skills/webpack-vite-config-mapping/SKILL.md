---
name: webpack-vite-config-mapping
description: Webpack/Craco 설정을 Vite로 1:1 매핑하는 패턴. cacheGroups→manualChunks, Babel 플러그인, Webpack 플러그인 대응표, topLevelAwait, HTTPS 개발 서버
---

# Webpack/Craco → Vite 설정 매핑

> 소스: https://vitejs.dev/config/ | https://vitejs.dev/guide/api-plugin | https://craco.js.org/docs/configuration/webpack/ | https://vite.dev/guide/migration
> 검증일: 2026-09-28 (최초 작성 2026-04-20 · 08-11 Vite 8 대응 주의사항 추가 · 09-28 재검증: Vite 8.3.1 확인, 아래 매핑을 주 경로/레거시로 재정리. 상세 `codeSplitting.groups`·청크 재시도 전체 예시는 중복을 피해 `vite-advanced-splitting` 스킬로 일원화 · 09-28 실행 검증: lab 샘플 빌드로 1·2·5·6·7절 전 항목 확인, 7절에 Vite 8 네이티브 `resolve.tsconfigPaths` 옵션 보강)

> **주의 (Vite 8+):** Vite 8부터 Rolldown이 기본 번들러로 전환되며 `build.rollupOptions`는 `build.rolldownOptions`로 개명(`rollupOptions`는 deprecated alias로 하위호환 유지, 당장 깨지지 않음). `output.manualChunks` **객체 형식은 더 이상 지원되지 않음**(함수 형식은 deprecated로 계속 동작). 아래 1절의 매핑은 **Vite 8+ 주 경로**(`rolldownOptions.output.codeSplitting.groups`)를 우선 제시하고, 아직 Vite 6/7(Rollup 기반)이면 레거시 `manualChunks` 매핑을 쓴다. `codeSplitting.groups`의 필드(`name`/`test`/`priority` 등)와 함수형 패키지 자동 분할 전체 예시는 → [`vite-advanced-splitting` 스킬 1절](../vite-advanced-splitting/SKILL.md) 참조. 출처: https://vite.dev/guide/migration

> **배경:** Craco는 CRA의 webpack 설정을 커스터마이징하는 래퍼. CRA deprecated(2025-02)와 함께 Craco도 maintenance-only 상태. 이 스킬은 craco.config.js의 각 설정을 vite.config.ts로 1:1 매핑한다.

---

## craco.config.js → vite.config.ts 전체 구조 대응

```
craco.config.js                     vite.config.ts
─────────────────────────────────────────────────────
webpack.configure                 → build.rollupOptions
webpack.plugins                   → plugins[]
babel.plugins                     → (별도 처리, 아래 참조)
devServer.proxy                   → server.proxy
devServer.port / host / https     → server.port / host / https
```

---

## 1. cacheGroups → codeSplitting.groups(Vite 8+ 주 경로) / manualChunks(레거시)

### Webpack cacheGroups (craco.config.js)

```javascript
// craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          'common-react': {
            name: 'common-react',
            test: /[\\/]node_modules[\\/](react-hook-form|react-scroll)[\\/]/,
            priority: 20,
          },
          'common-swiper': {
            name: 'common-swiper',
            test: /[\\/]node_modules[\\/]swiper[\\/]/,
            priority: 20,
          },
          'vendors-sentry': {
            name: 'vendors-sentry',
            test: /[\\/]node_modules[\\/]@sentry[\\/]/,
            priority: 20,
          },
        },
      }
      return webpackConfig
    },
  },
}
```

### Vite 8+ 주 경로 — `codeSplitting.groups` 대응 (vite.config.ts)

```typescript
// vite.config.ts (Vite 8+)
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'common-react-dom', test: /node_modules[\\/](react|react-dom)[\\/]/, priority: 20 },
            { name: 'common-react', test: /node_modules[\\/](react-hook-form|react-scroll|react-helmet-async)[\\/]/, priority: 20 },
            { name: 'common-swiper', test: /node_modules[\\/]swiper[\\/]/, priority: 20 },
            { name: 'vendors-sentry', test: /node_modules[\\/]@sentry[\\/]/, priority: 20 },
          ],
        },
      },
    },
  },
})
```

> craco `cacheGroups`의 `test` 정규식은 `codeSplitting.groups`의 `test`로 거의 그대로 이식 가능(webpack `test: /[\\/]node_modules[\\/]swiper[\\/]/` → Vite `test: /node_modules[\\/]swiper[\\/]/`, 앞의 `[\\/]`만 제거). `priority`는 두 시스템 모두 숫자가 클수록 먼저 평가. `groups` 필드 전체 설명(minSize 등)과 패키지 자동 분할(함수형 동치) 전체 예시는 → [`vite-advanced-splitting` 스킬 1절](../vite-advanced-splitting/SKILL.md) 참조.

### 레거시 (Vite 6/7) — `manualChunks` 대응

```typescript
// vite.config.ts (Vite 6/7)
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 객체 형식: 패키지명 → 청크명 (Vite 8+ 미지원)
        manualChunks: {
          'common-react': ['react-hook-form', 'react-scroll', 'react-helmet-async'],
          'common-swiper': ['swiper'],
          'vendors-sentry': ['@sentry/react', '@sentry/tracing'],
          'common-react-dom': ['react', 'react-dom'],
        },
      },
    },
  },
})
```

> **주의:** `manualChunks` 객체 형식에서 존재하지 않는 패키지명을 넣으면 빌드 에러. 실제 설치된 패키지명으로 정확히 작성.
>
> **주의 (Vite 8+):** 위 객체 형식은 Vite 8+에서 **미지원**. 함수형 패키지 자동 분할 예시(deprecated로 계속 동작)와 Vite 8+ `codeSplitting.groups` 전체 필드 설명은 → [`vite-advanced-splitting` 스킬 1절](../vite-advanced-splitting/SKILL.md) 참조.

---

## 2. Babel 플러그인 → Vite 대응

### console 제거 (transform-remove-console)

```javascript
// craco.config.js (Before)
module.exports = {
  babel: {
    plugins: [
      isProd && ['transform-remove-console', { exclude: ['error'] }],
    ].filter(Boolean),
  },
}
```

### Vite 8+ 주 경로 — Rolldown/Oxc 미니파이어 옵션

```typescript
// vite.config.ts (Vite 8+) — Oxc minify.compress 옵션으로 대체 (추가 패키지 불필요)
export default defineConfig(({ mode }) => ({
  build: {
    rolldownOptions: {
      output: {
        minify: {
          compress: {
            dropConsole: mode === 'production', // console.* 전부 제거 (console.error 포함)
          },
        },
      },
    },
  },
}))
```

> **주의:** `dropConsole: true`는 `console.error`도 함께 제거됨. `console.error`만 유지하는 세부 옵션(terser `pure_funcs` 동치)이 Oxc `compress`에 별도로 있는지는 이번 재검증 범위에서 확인하지 못함 — `> 주의: 미검증`. 특정 메서드만 유지해야 하면 Rolldown/Oxc 공식 옵션 문서(https://rolldown.rs/reference/)를 직접 확인할 것.

### 레거시 (Vite 6/7) — esbuild/terser 옵션

```typescript
// vite.config.ts (Vite 6/7)
export default defineConfig(({ mode }) => ({
  build: {
    // esbuild로 console 제거 (추가 패키지 불필요)
    esbuildOptions: {
      drop: mode === 'production' ? ['console'] : [],
      // console.error는 유지하려면:
      // pure: ['console.log', 'console.warn', 'console.debug'],
    },
    // 또는 minify: 'terser' 사용 시
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        pure_funcs: mode === 'production' ? [] : [],
      },
    },
  },
}))
```

> **주의:** esbuild `drop: ['console']`은 `console.error`도 제거. 특정 메서드만 유지하려면 `pure` 옵션 사용.
>
> **주의 (Vite 8+):** 위 방식은 Vite 8+에서 위치가 이동됨 — 위 "Vite 8+ 주 경로"의 `build.rolldownOptions.output.minify.compress.dropConsole`을 사용할 것. `esbuildOptions.drop`은 Vite 6/7 기준.

---

## 3. Webpack 플러그인 → Vite 대응표

| Webpack 플러그인 | Vite 대응 |
|----------------|----------|
| `webpack-retry-chunk-load-plugin` | `vite:preloadError` 이벤트 리스너 (→ `vite-advanced-splitting` 스킬 4절 전체 예시) |
| `HtmlWebpackPlugin` | Vite 내장 (index.html 자동 처리) |
| `MiniCssExtractPlugin` | Vite 내장 (CSS 자동 추출) |
| `CopyWebpackPlugin` | Vite 내장 (`publicDir`) 또는 `vite-plugin-static-copy` |
| `DefinePlugin` | `define` 옵션 또는 `import.meta.env` |
| `BabelWebpackPlugin` | `@vitejs/plugin-react` (babel 옵션 포함) |

### 청크 로드 실패 재시도 (webpack-retry-chunk-load-plugin 대체)

`vite:preloadError` 이벤트로 청크 로드 실패를 감지·재시도하는 전체 코드(플러그인 인라인 주입 패턴 + 앱 코드 직접 처리 패턴 두 가지)는 → [`vite-advanced-splitting` 스킬 4절](../vite-advanced-splitting/SKILL.md)에 있다. 이 이벤트는 브라우저 런타임 이벤트라 Vite 8+ Rolldown 전환과 무관하게 동일하게 동작한다.

---

## 4. topLevelAwait

```javascript
// craco.config.js (Before)
webpackConfig.experiments = { topLevelAwait: true }
```

```typescript
// vite.config.ts (After) — Vite는 기본 지원, 별도 설정 불필요
// ESM 기반이므로 top-level await 자동 동작
```

---

## 5. 개발 서버 설정

```javascript
// craco.config.js (Before)
module.exports = {
  devServer: {
    https: true,
    host: 'dev-local.example.co.kr',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
}
```

```typescript
// vite.config.ts (After)
import fs from 'fs'

export default defineConfig({
  server: {
    https: {
      // 자체 서명 인증서 사용 시
      key: fs.readFileSync('./certs/key.pem'),
      cert: fs.readFileSync('./certs/cert.pem'),
    },
    host: 'dev-local.example.co.kr',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

> **주의:** `HTTPS=true`는 CRA 전용 환경 변수. Vite에서는 `server.https` 객체로 명시.

---

## 6. 환경 변수 define (DefinePlugin 대체)

```javascript
// craco.config.js (Before) — DefinePlugin으로 전역 상수 주입
webpackConfig.plugins.push(
  new webpack.DefinePlugin({
    'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
  })
)
```

```typescript
// vite.config.ts (After)
export default defineConfig({
  define: {
    // import.meta.env.VITE_BUILD_TIME 으로 접근
    // 또는 .env 파일에 VITE_BUILD_TIME=... 설정
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
})
```

---

## 7. path alias (baseUrl: "src")

```json
// tsconfig.json CRA 방식
{
  "compilerOptions": {
    "baseUrl": "src"
  }
}
// → import Button from "components/Button" (src/components/Button)
```

### Vite 8+ 주 경로 — `resolve.tsconfigPaths` 네이티브 옵션(플러그인 불필요)

```typescript
// vite.config.ts (Vite 8+) — 별도 패키지 설치 없이 네이티브로 해석
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true }, // 기본값 false
})
```

> Vite 8.0부터 `resolve.tsconfigPaths` 옵션이 내장되어 `vite-tsconfig-paths` 플러그인 없이도 `tsconfig.json`의 `baseUrl`/`paths`를 그대로 해석한다(공식 블로그 https://vite.dev/blog/announcing-vite8 확인, 2026-09-28 실행 검증: lab 샘플에서 플러그인 제거 후 `resolve.tsconfigPaths: true`만으로 `baseUrl: "src"` alias import가 빌드 성공). 약간의 성능 비용이 있어 기본값은 `false`.

### 레거시 (Vite 6/7) — `vite-tsconfig-paths` 플러그인

```typescript
// vite.config.ts (Vite 6/7) — vite-tsconfig-paths 플러그인으로 자동 해석
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // resolve.alias 별도 설정 불필요
})
```

```bash
npm install -D vite-tsconfig-paths
```

> **주의 (Vite 8+):** 플러그인 방식은 Vite 8+에서도 계속 동작하지만(2026-09-28 실행 검증으로 확인), Vite 8+ 신규 프로젝트는 위 네이티브 `resolve.tsconfigPaths` 옵션을 우선 사용할 것 — 추가 의존성이 없고 별도 안내 메시지("Vite now supports tsconfig paths resolution natively...")도 뜨지 않는다.

---

## 흔한 실수 패턴

### 1. cacheGroups priority → manualChunks 우선순위 무시 (레거시, Vite 6/7 한정)

```typescript
// ❌ 레거시 함수형 manualChunks에는 priority 개념 없음
// 함수형에서 먼저 return하는 조건이 우선 적용됨
manualChunks(id) {
  if (id.includes('@sentry')) return 'vendors-sentry'  // 먼저 체크
  if (id.includes('node_modules')) return 'vendor'     // 나중에 체크
}
```

> Vite 8+ `codeSplitting.groups`는 `priority` 필드가 실제로 존재해 cacheGroups처럼 숫자로 우선순위를 지정할 수 있다(1절 참조) — 이 함정은 레거시 `manualChunks` 경로에서만 해당.

### 2. webpack.configure 전체를 그대로 복사

```typescript
// ❌ webpack API를 Vite에서 그대로 사용 불가
webpackConfig.optimization.splitChunks = { ... }

// ✅ rolldownOptions.output.codeSplitting(Vite 8+) 또는 rollupOptions.output.manualChunks(레거시)로 재작성 필요
```

### 3. process.env 잔존

```typescript
// ❌ Vite에서 process.env는 undefined (Node 환경 아님)
const isDev = process.env.NODE_ENV === 'development'

// ✅
const isDev = import.meta.env.DEV  // Vite 내장 불리언
```
