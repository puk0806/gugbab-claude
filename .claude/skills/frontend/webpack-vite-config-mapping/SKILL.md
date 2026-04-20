---
name: webpack-vite-config-mapping
description: Webpack/Craco 설정을 Vite로 1:1 매핑하는 패턴. cacheGroups→manualChunks, Babel 플러그인, Webpack 플러그인 대응표, topLevelAwait, HTTPS 개발 서버
---

# Webpack/Craco → Vite 설정 매핑

> 소스: https://vitejs.dev/config/ | https://vitejs.dev/guide/api-plugin | https://craco.js.org/docs/configuration/webpack/
> 검증일: 2026-04-20

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

## 1. cacheGroups → manualChunks

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

### Vite manualChunks 대응 (vite.config.ts)

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 객체 형식: 패키지명 → 청크명
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

### 함수형 manualChunks (패키지 자동 분할)

```typescript
// 패키지별 자동 청크 분할 (node_modules 내 패키지명으로 청크 생성)
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          // 패키지명 추출: /node_modules/패키지명/...
          const pkg = id.split('/node_modules/').pop()?.split('/')[0] ?? ''

          // 특정 패키지 그룹화
          if (['react', 'react-dom', 'react-router-dom'].includes(pkg)) {
            return 'common-react-dom'
          }
          if (pkg.startsWith('@sentry')) {
            return 'vendors-sentry'
          }
          if (pkg === 'swiper') {
            return 'common-swiper'
          }

          // 내부 API 클라이언트 (예: lf-members-api-client)
          if (pkg.startsWith('lf-') && pkg.endsWith('-api-client')) {
            return pkg  // 패키지명 그대로 청크명
          }
        },
      },
    },
  },
})
```

> **주의:** `manualChunks` 객체 형식에서 존재하지 않는 패키지명을 넣으면 빌드 에러. 실제 설치된 패키지명으로 정확히 작성.

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

```typescript
// vite.config.ts (After) — terser esbuild 옵션으로 대체
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

---

## 3. Webpack 플러그인 → Vite 대응표

| Webpack 플러그인 | Vite 대응 |
|----------------|----------|
| `webpack-retry-chunk-load-plugin` | `vite:preloadError` 이벤트 리스너 (아래 참조) |
| `HtmlWebpackPlugin` | Vite 내장 (index.html 자동 처리) |
| `MiniCssExtractPlugin` | Vite 내장 (CSS 자동 추출) |
| `CopyWebpackPlugin` | Vite 내장 (`publicDir`) 또는 `vite-plugin-static-copy` |
| `DefinePlugin` | `define` 옵션 또는 `import.meta.env` |
| `BabelWebpackPlugin` | `@vitejs/plugin-react` (babel 옵션 포함) |

### 청크 로드 실패 재시도 (webpack-retry-chunk-load-plugin 대체)

```typescript
// vite-plugin-retry-chunk.ts — 커스텀 인라인 플러그인
function retryChunkPlugin(): Plugin {
  return {
    name: 'retry-chunk-load',
    transformIndexHtml(html) {
      // index.html에 재시도 스크립트 주입
      return html.replace(
        '</head>',
        `<script>
          window.__viteChunkRetryCount = 0;
          window.addEventListener('vite:preloadError', (event) => {
            if (window.__viteChunkRetryCount < 3) {
              window.__viteChunkRetryCount++;
              window.location.reload();
            }
          });
        </script></head>`
      )
    },
  }
}

// vite.config.ts에서 사용
export default defineConfig({
  plugins: [react(), retryChunkPlugin()],
})
```

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

```typescript
// vite.config.ts — vite-tsconfig-paths 플러그인으로 자동 해석
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // resolve.alias 별도 설정 불필요
})
```

```bash
npm install -D vite-tsconfig-paths
```

---

## 흔한 실수 패턴

### 1. cacheGroups priority → manualChunks 우선순위 무시

```typescript
// ❌ Vite manualChunks에는 priority 개념 없음
// 함수형에서 먼저 return하는 조건이 우선 적용됨
manualChunks(id) {
  if (id.includes('@sentry')) return 'vendors-sentry'  // 먼저 체크
  if (id.includes('node_modules')) return 'vendor'     // 나중에 체크
}
```

### 2. webpack.configure 전체를 그대로 복사

```typescript
// ❌ webpack API를 Vite에서 그대로 사용 불가
webpackConfig.optimization.splitChunks = { ... }

// ✅ rollupOptions.output.manualChunks로 재작성 필요
```

### 3. process.env 잔존

```typescript
// ❌ Vite에서 process.env는 undefined (Node 환경 아님)
const isDev = process.env.NODE_ENV === 'development'

// ✅
const isDev = import.meta.env.DEV  // Vite 내장 불리언
```
