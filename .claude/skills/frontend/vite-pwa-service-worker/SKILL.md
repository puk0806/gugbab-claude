---
name: vite-pwa-service-worker
description: Vite 환경에서 PWA/Service Worker 설정 — vite-plugin-pwa, generateSW/injectManifest 전략, 기존 커스텀 SW 마이그레이션, Workbox 런타임 캐싱
---

# Vite PWA / Service Worker

> 소스: https://vite-pwa-org.netlify.app/guide/ | https://vite-pwa-org.netlify.app/workbox/ | https://github.com/vite-pwa/vite-plugin-pwa
> 검증일: 2026-04-20

---

## 전략 선택

```
기존 service-worker.js 있음? ──→ YES ──→ injectManifest 전략
                               ↓
                               NO ──→ generateSW 전략 (자동 생성)
```

| 전략 | 설명 | 적합한 경우 |
|------|------|------------|
| `generateSW` | Workbox가 SW 자동 생성 | SW 커스터마이징 불필요 |
| `injectManifest` | 기존 SW에 precache manifest 주입 | 커스텀 SW 로직 유지 |

---

## 설치

```bash
npm install -D vite-plugin-pwa workbox-precaching workbox-routing workbox-strategies
```

---

## 1. generateSW 전략 (기본)

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',  // SW 업데이트 자동 적용
      strategies: 'generateSW',   // 기본값, 생략 가능
      workbox: {
        // 사전 캐시 파일 패턴
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // 런타임 캐싱 규칙
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },

      // Web App Manifest
      manifest: {
        name: 'LFMall',
        short_name: 'LFMall',
        theme_color: '#ffffff',
        icons: [
          { src: 'favicon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'favicon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
```

---

## 2. injectManifest 전략 (기존 커스텀 SW 유지)

기존 `public/service-worker.js`를 Vite 환경으로 마이그레이션할 때 사용.

### vite.config.ts

```typescript
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',           // 커스텀 SW 소스 위치
      filename: 'sw.ts',       // 커스텀 SW 파일명
      injectRegister: 'auto',  // SW 등록 자동화
    }),
  ],
})
```

### 커스텀 서비스 워커 (src/sw.ts)

```typescript
// src/sw.ts — Workbox + 기존 커스텀 로직 통합
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope

// Workbox가 self.__WB_MANIFEST에 precache 목록 자동 주입
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// 기존 커스텀 SW 로직 유지 가능
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({ cacheName: 'images' })
)

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({ cacheName: 'api-responses' })
)

// 기존 push 알림, background sync 등 커스텀 로직
self.addEventListener('push', (event) => {
  // 기존 push 핸들러 그대로 유지
})
```

> **주의:** `self.__WB_MANIFEST`를 사용하지 않으면 빌드 에러 발생. precaching이 필요 없으면 `injectManifest: { injectionPoint: undefined }` 설정.

### `self.__WB_MANIFEST` 없이 사용하는 경우

```typescript
// vite.config.ts
VitePWA({
  strategies: 'injectManifest',
  injectManifest: {
    injectionPoint: undefined,  // precache manifest 주입 비활성화
  },
})
```

---

## 3. 기존 public/service-worker.js 마이그레이션 절차

```
Before (CRA):
public/
  service-worker.js    ← 그대로 public/에 배치, CRA가 복사

After (Vite + injectManifest):
src/
  sw.ts                ← Workbox import + 기존 로직 이전
public/
  (service-worker.js 삭제)
```

**마이그레이션 체크리스트:**
1. `public/service-worker.js` 내용을 `src/sw.ts`로 이전
2. Workbox import 추가 (`precacheAndRoute`, `registerRoute` 등)
3. `self.__WB_MANIFEST` 추가
4. `swConfig.js`의 SW 등록 코드 제거 (vite-plugin-pwa가 자동 처리)
5. `public/service-worker.js` 삭제

---

## 4. SW 업데이트 처리

```typescript
// src/main.tsx — SW 업데이트 알림 UI
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // 새 버전 배포 시 사용자에게 업데이트 알림
    if (confirm('새 버전이 있습니다. 업데이트할까요?')) {
      updateSW(true)  // true: 즉시 업데이트 적용
    }
  },
  onOfflineReady() {
    console.log('오프라인 사용 준비 완료')
  },
})
```

```typescript
// tsconfig.json — virtual 모듈 타입 추가
{
  "compilerOptions": {
    "types": ["vite/client", "vite-plugin-pwa/client"]
  }
}
```

---

## 5. 개발 환경 SW 테스트

```typescript
// vite.config.ts
VitePWA({
  devOptions: {
    enabled: true,         // 개발 서버에서 SW 활성화 (기본 false)
    type: 'module',        // ES 모듈 SW
  },
})
```

> **주의:** 개발 환경 SW 활성화는 캐시 문제로 디버깅이 어려울 수 있음. 프로덕션 빌드(`vite preview`)에서 테스트 권장.

---

## 6. Workbox 캐싱 전략 선택 기준

| 전략 | 동작 | 적합한 리소스 |
|------|------|--------------|
| `CacheFirst` | 캐시 → 네트워크 | 이미지, 폰트, 정적 자산 |
| `NetworkFirst` | 네트워크 → 캐시(실패 시) | API 응답, 자주 변경되는 데이터 |
| `StaleWhileRevalidate` | 캐시 즉시 + 백그라운드 갱신 | JS/CSS 번들, 세미 동적 데이터 |
| `NetworkOnly` | 네트워크만 | POST 요청, 결제 API |
| `CacheOnly` | 캐시만 | 완전 오프라인 전용 |

---

## 흔한 실수 패턴

### 1. self.__WB_MANIFEST 누락

```typescript
// ❌ injectManifest에서 self.__WB_MANIFEST 없으면 빌드 에러
// "Unable to find a place to inject the manifest"
export default {}

// ✅
precacheAndRoute(self.__WB_MANIFEST)
```

### 2. public/에 SW 파일 남겨두기

```
// ❌ public/service-worker.js가 남으면 Vite가 복사해서 충돌
public/
  service-worker.js  ← 삭제 필요

// ✅
src/
  sw.ts              ← 단일 소스
```

### 3. registerType 미설정으로 SW 업데이트 안 됨

```typescript
// ❌ 기본값은 prompt — 사용자 확인 없이 자동 업데이트 안 됨
VitePWA({})

// ✅ 자동 업데이트
VitePWA({ registerType: 'autoUpdate' })
// 또는 명시적 업데이트 UI
VitePWA({ registerType: 'prompt' })
// → onNeedRefresh 콜백에서 확인 후 updateSW(true) 호출
```

### 4. manifest.json과 plugin manifest 중복

```typescript
// ❌ public/manifest.json과 plugin manifest 옵션 동시 사용 시 충돌
VitePWA({
  manifest: { name: '...' }  // plugin이 manifest 생성
})
// + public/manifest.json 도 존재 → 중복

// ✅ 하나만 사용
// plugin manifest 사용 시 public/manifest.json 삭제
// 기존 manifest.json 유지 시 plugin manifest 옵션 제거
```
