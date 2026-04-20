---
name: vite-advanced-splitting
description: Vite 고급 코드 스플리팅 — manualChunks 함수형, 모바일/데스크톱 분리 빌드(mode), Gulp 빌드 훅 → Vite 플러그인 전환, vite:preloadError 재시도 처리
---

# Vite 고급 코드 스플리팅 & 빌드 자동화

> 소스: https://vitejs.dev/config/build-options | https://vitejs.dev/guide/api-plugin | https://vitejs.dev/guide/build
> 검증일: 2026-04-20

---

## 1. manualChunks 전략

### 기본 형식 비교

```typescript
// 객체 형식 — 명시적, 소규모 청크 분할에 적합
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'ui-vendor': ['@mui/material'],
}

// 함수 형식 — 동적 조건 처리, 대규모 분할에 적합
manualChunks(id: string) {
  if (id.includes('node_modules')) { ... }
}
```

### 패키지명 기반 자동 분할

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          // node_modules에서 패키지명 추출
          // 예: /path/to/node_modules/@sentry/react/dist/index.js → @sentry/react
          const parts = id.split('/node_modules/')
          const rawPkg = parts[parts.length - 1]

          // scoped 패키지 처리 (@org/pkg)
          const pkg = rawPkg.startsWith('@')
            ? rawPkg.split('/').slice(0, 2).join('/')
            : rawPkg.split('/')[0]

          // 그룹별 청크 분류
          if (['react', 'react-dom', 'react-router-dom'].includes(pkg)) {
            return 'common-react-dom'
          }
          if (pkg === 'swiper') return 'common-swiper'
          if (pkg.startsWith('@sentry')) return 'vendors-sentry'
          if (pkg.startsWith('@mui') || pkg === '@emotion/react' || pkg === '@emotion/styled') {
            return 'vendors-mui'
          }
          if (pkg.startsWith('@datadog')) return 'vendors-datadog'

          // API 클라이언트 패키지 개별 청크
          if (pkg.startsWith('lf-') && pkg.endsWith('-api-client')) {
            return pkg
          }

          // 나머지 node_modules → 공통 vendor
          return 'vendor'
        },
      },
    },
  },
})
```

### React.lazy + Suspense와 함께 사용

```typescript
// ❌ manualChunks와 React.lazy 조합 시 주의
// 잘못된 manualChunks가 lazy chunk 경계를 깨뜨릴 수 있음

// ✅ 라우트 기반 lazy split은 manualChunks와 별개로 동작
const ProductPage = lazy(() => import('./pages/ProductPage'))

// manualChunks는 node_modules만 타겟으로, 앱 코드는 건드리지 않는 게 안전
manualChunks(id) {
  if (id.includes('node_modules')) { ... }
  // 앱 코드 분기는 return 없이 통과 (Vite가 자동 처리)
}
```

---

## 2. 모바일 / 데스크톱 분리 빌드

### 환경 변수 + mode 방식

```bash
# package.json scripts
"build:mobile": "cross-env VITE_DEVICE_TYPE=1 vite build --mode mobile",
"build:desktop": "cross-env VITE_DEVICE_TYPE=2 vite build --mode desktop",
"dev:mobile": "cross-env VITE_DEVICE_TYPE=1 vite --mode mobile",
"dev:desktop": "cross-env VITE_DEVICE_TYPE=2 vite --mode desktop",
```

```
# .env.mobile
VITE_DEVICE_TYPE=1
VITE_ENTRY=src/mobile/index.tsx

# .env.desktop
VITE_DEVICE_TYPE=2
VITE_ENTRY=src/desktop/index.tsx
```

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const isMobile = env.VITE_DEVICE_TYPE === '1'

  return {
    plugins: [react()],
    build: {
      outDir: isMobile ? 'build/mobile' : 'build/desktop',
      rollupOptions: {
        input: isMobile ? 'src/mobile/index.html' : 'src/desktop/index.html',
      },
    },
    define: {
      __IS_MOBILE__: isMobile,
    },
  }
})
```

### 분리 entry (index.html이 루트 1개인 경우)

```typescript
// 단일 index.html + 조건부 entry 처리
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const deviceType = env.VITE_DEVICE_TYPE ?? '1'

  return {
    // index.html의 <script src>를 모드에 맞게 변경하는 플러그인
    plugins: [
      react(),
      {
        name: 'device-entry',
        transformIndexHtml(html) {
          return html.replace(
            '/src/index.tsx',
            deviceType === '2' ? '/src/desktop/index.tsx' : '/src/mobile/index.tsx'
          )
        },
      },
    ],
  }
})
```

---

## 3. Gulp 빌드 스크립트 → Vite 플러그인 전환

Gulp의 `pre/postbuild` 태스크(version.json 생성, 빌드 타입 파일 생성)를 Vite 플러그인 훅으로 대체한다.

### Gulp 태스크 원본

```javascript
// gulpfile.js (Before)
gulp.task('touchVersion', () => {
  const version = `${format(new Date(), 'yyyyMMdd')}@${gitRev}`
  fs.writeFileSync('src/version.json', JSON.stringify({ version }))
})

gulp.task('touchBuildType', () => {
  const type = process.env.DEVICE_TYPE === '1' ? 'mobile' : 'desktop'
  fs.writeFileSync(`build/${type}.json`, JSON.stringify({ type }))
})
```

### Vite 플러그인으로 대체

```typescript
// plugins/build-meta.ts
import type { Plugin } from 'vite'
import { execSync } from 'child_process'
import fs from 'fs'

export function buildMetaPlugin(deviceType: string): Plugin {
  return {
    name: 'build-meta',

    // buildStart: 빌드 시작 시 (prebuild 대체)
    buildStart() {
      const gitRev = execSync('git rev-parse --short HEAD').toString().trim()
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const version = `${date}@${gitRev}`
      fs.writeFileSync('src/version.json', JSON.stringify({ version }))
      console.log(`[build-meta] version: ${version}`)
    },

    // closeBundle: 빌드 완료 후 (postbuild 대체)
    closeBundle() {
      const type = deviceType === '1' ? 'mobile' : 'desktop'
      const outDir = 'build'
      fs.writeFileSync(`${outDir}/${type}.json`, JSON.stringify({ type }))
      // version.json을 build/로 복사
      fs.copyFileSync('src/version.json', `${outDir}/version.json`)
      console.log(`[build-meta] build type: ${type}`)
    },
  }
}
```

```typescript
// vite.config.ts에서 사용
import { buildMetaPlugin } from './plugins/build-meta'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      buildMetaPlugin(env.VITE_DEVICE_TYPE ?? '1'),
    ],
  }
})
```

### Vite 플러그인 훅 실행 순서

```
build 명령 실행
  │
  ├─ config()          설정 해석 (초기화)
  ├─ buildStart()      빌드 시작 ← prebuild 태스크
  ├─ transform()       파일 변환
  ├─ generateBundle()  번들 생성
  ├─ writeBundle()     파일 쓰기
  └─ closeBundle()     빌드 완료 ← postbuild 태스크
```

---

## 4. 청크 로드 실패 재시도 (vite:preloadError)

webpack의 `webpack-retry-chunk-load-plugin` 대체 패턴.

### index.html 직접 주입 플러그인

```typescript
// plugins/retry-chunk.ts
import type { Plugin } from 'vite'

export function retryChunkPlugin(maxRetries = 3): Plugin {
  return {
    name: 'retry-chunk-load',
    apply: 'build',  // 빌드 시에만 적용
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const script = `
<script>
  (function() {
    var retryCount = 0;
    var MAX_RETRIES = ${maxRetries};
    window.addEventListener('vite:preloadError', function(event) {
      event.preventDefault();
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        var url = new URL(window.location.href);
        url.searchParams.set('_retry', retryCount);
        window.location.href = url.toString();
      }
    });
  })();
</script>`
        return html.replace('</head>', `${script}\n</head>`)
      },
    },
  }
}
```

### 앱 코드에서 직접 처리 (플러그인 없이)

```typescript
// src/main.tsx
window.addEventListener('vite:preloadError', (event) => {
  // 청크 로드 실패 시 페이지 새로고침 (새 배포 후 구 청크 404 상황)
  window.location.reload()
})
```

---

## 5. 빌드 출력 최적화

```typescript
export default defineConfig({
  build: {
    // 청크 크기 경고 임계값 (기본 500KB)
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // 청크 파일명 패턴
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',

        manualChunks: { /* ... */ },
      },
    },

    // 소스맵 (프로덕션에서 Sentry 연동 시 필요)
    sourcemap: process.env.GENERATE_SOURCEMAP === 'true',
  },
})
```

---

## 흔한 실수 패턴

### 1. manualChunks에서 앱 코드까지 지정

```typescript
// ❌ 앱 내부 파일을 manualChunks로 강제 분할하면 circular dependency 위험
manualChunks(id) {
  if (id.includes('src/pages')) return 'pages'  // 위험
}

// ✅ React.lazy로 라우트 기반 분할 사용
const ProductPage = lazy(() => import('./pages/ProductPage'))
```

### 2. loadEnv 미사용으로 .env.{mode} 파일 못 읽음

```typescript
// ❌ defineConfig 함수형 미사용 시 env 파일 못 읽음
export default defineConfig({
  build: { outDir: process.env.OUT_DIR }  // undefined
})

// ✅
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return { build: { outDir: env.OUT_DIR } }
})
```

### 3. closeBundle vs writeBundle 혼동

```typescript
// writeBundle: 각 청크 파일이 쓰여진 직후 (병렬 실행)
// closeBundle: 모든 번들 작업 완료 후 (순차 실행)

// ✅ postbuild 태스크 (파일 읽기/복사)는 closeBundle에서
closeBundle() {
  // build/ 디렉토리에 파일이 모두 존재하는 시점
  fs.copyFileSync('src/version.json', 'build/version.json')
}
```
