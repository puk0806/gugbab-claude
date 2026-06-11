---
name: seo-vite-spa
description: Vite / CRA 기반 React SPA의 SEO — react-helmet-async, @unhead/react, Vike 프리렌더, sitemap, JSON-LD
---

# SEO — Vite / CRA SPA (Client-Side Rendering)

> 소스:
> - react-helmet-async: https://github.com/staylor/react-helmet-async
> - @unhead/react: https://unhead.unjs.io/docs/react/head/guides/get-started/installation
> - Vike: https://vike.dev/pre-rendering, https://vike.dev/render-modes
> - CRA deprecation: https://react.dev/blog/2025/02/14/sunsetting-create-react-app
> - Googlebot JS rendering: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
>
> 검증일: 2026-06-01

---

## 전제와 한계

이 스킬은 **이미 Vite 또는 CRA(레거시)로 운영 중인 React SPA에서 SEO를 어떻게 끌어올릴지**를 다룬다. 새 프로젝트라면 React 팀은 Next.js 또는 React Router + Vite를 권장하며, SEO가 중요한 신규 프로젝트는 SSR/SSG 가능한 프레임워크에서 출발하는 것이 가장 안전하다.

**클라이언트 렌더링의 본질적 한계:**

- Googlebot은 JavaScript를 실행하지만, HTML 크롤링(1차)과 JS 렌더링(2차)이 분리된 **two-wave** 방식이다. 2차 렌더는 큐에 들어가 수 시간 ~ 수 일 지연될 수 있다.
- Bing·Naver·DuckDuckGo 등 Googlebot 이외 크롤러는 JS 렌더링 능력이 더 제한적이거나 아예 없는 경우가 있다.
- LLM 기반 크롤러(GPTBot, Claude-Web 등)는 대체로 정적 HTML만 읽는다. SPA의 초기 빈 셸만 본다.

**결론:** SPA에서 SEO를 본격적으로 보장하려면 결국 **빌드 타임 프리렌더(SSG)** 또는 **SSR**이 필요하다. react-helmet-async/unhead만으로는 1차 크롤링에 잡히지 않는다.

> 주의: CRA(Create React App)는 2025-02-14 React 팀이 공식 deprecated 처리했다. 유지보수 모드로만 동작하며 신규 앱에는 사용하지 말 것. 기존 CRA 앱은 Vite + React Router 또는 Next.js로의 마이그레이션이 권장된다.

---

## 단계별 SEO 강화 경로

| 단계 | 조치 | 효과 | 적합한 상황 |
|------|------|------|-------------|
| 0 | `public/index.html`에 정적 메타 태그 | 1차 크롤링 시 기본 메타 노출 | 모든 환경 (즉시 가능) |
| 1 | react-helmet-async 또는 @unhead/react로 라우트별 동적 메타 | Googlebot 2차 렌더 시 라우트 메타 반영 | 모든 SPA |
| 2 | `public/sitemap.xml`, `public/robots.txt` 추가 | 크롤링 우선순위·발견율 향상 | 모든 SPA |
| 3 | vite-plugin-sitemap 등으로 sitemap 자동 생성 | 라우트 변경 시 sitemap 동기화 | 라우트가 많거나 자주 변경되는 사이트 |
| 4 | Vike 또는 vite-prerender-plugin으로 빌드 타임 프리렌더(SSG) | 1차 크롤링에 완전한 HTML 제공 | 콘텐츠가 정적·반정적인 페이지 (랜딩, 블로그, 문서) |
| 5 | Vike 또는 별도 Node 서버로 SSR | 1차 크롤링 + 실시간 콘텐츠 | 콘텐츠가 자주 바뀌고 인덱싱 신선도가 중요한 경우 |

---

## 1. public/index.html — 정적 메타 (모든 환경의 출발점)

Vite는 `index.html`이 프로젝트 루트, CRA는 `public/index.html`에 있다. 라우트와 무관한 사이트 전역 메타는 정적으로 박는다.

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>서비스명</title>
    <meta name="description" content="서비스 기본 설명" />

    <!-- OpenGraph 기본값 -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="서비스명" />
    <meta property="og:description" content="서비스 기본 설명" />
    <meta property="og:image" content="https://example.com/og-default.png" />
    <meta property="og:url" content="https://example.com" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />

    <link rel="canonical" href="https://example.com" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

크롤러가 JS 실행 전에 보는 1차 HTML이므로 여기에 박힌 값은 어떤 환경에서도 최소한의 SEO·OG 미리보기를 보장한다.

---

## 2. 라우트별 동적 메타 — react-helmet-async (현 시점 권장)

`react-helmet-async`는 v3.0.0(2026-03 출시)부터 React 19를 공식 지원한다. React 19에서는 `<Helmet>`이 실제 DOM 요소를 렌더링하고 React가 자동으로 `<head>`로 호이스팅한다. React 16~18에서는 기존 방식(태그 수집·중복 제거 후 DOM 조작)을 유지한다.

### 설치 및 Provider

```bash
npm i react-helmet-async@^3
```

```tsx
// src/main.tsx
import { HelmetProvider } from 'react-helmet-async'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
)
```

### 페이지 컴포넌트에서 사용

```tsx
// src/pages/ProductPage.tsx
import { Helmet } from 'react-helmet-async'

interface ProductPageProps {
  product: { id: string; name: string; description: string; image: string }
}

export default function ProductPage({ product }: ProductPageProps) {
  const url = `https://example.com/products/${product.id}`

  return (
    <>
      <Helmet>
        <title>{product.name} | 서비스명</title>
        <meta name="description" content={product.description} />
        <link rel="canonical" href={url} />

        <meta property="og:type" content="product" />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image} />
        <meta property="og:url" content={url} />
      </Helmet>

      {/* 페이지 본문 */}
    </>
  )
}
```

> 참고: 2024년~2026년 초까지 react-helmet-async는 한동안 무유지보수 상태였다가 v3에서 다시 활성화됐다. 장기적 대안으로는 @unhead/react가 있다 (다음 절 참조).

---

## 3. 대안: @unhead/react (React 19 기반 신규 프로젝트 권장)

`@unhead/react`는 unjs(Nuxt 팀이 만든 범용 패키지군)의 head 매니저로, Vue·React·Solid·Svelte·Angular를 동일한 API로 지원한다. v3(2026-04 기준 stable)부터 React에 1급 지원이 들어갔고 react-helmet 마이그레이션 가이드와 호환 export(`@unhead/react/helmet`)를 제공한다.

### 설치 및 Provider

```bash
npm i @unhead/react
```

```tsx
// src/main.tsx
import { createHead, UnheadProvider } from '@unhead/react/client'
import { createRoot } from 'react-dom/client'
import App from './App'

const head = createHead()

createRoot(document.getElementById('root')!).render(
  <UnheadProvider head={head}>
    <App />
  </UnheadProvider>
)
```

### useHead — 함수형

```tsx
import { useHead } from '@unhead/react'

export default function AboutPage() {
  useHead({
    title: '소개 | 서비스명',
    meta: [
      { name: 'description', content: '서비스 소개 페이지' },
      { property: 'og:title', content: '소개' },
    ],
    link: [{ rel: 'canonical', href: 'https://example.com/about' }],
  })

  return <main>소개</main>
}
```

### useSeoMeta — XSS 안전 + 타입 안전

`useSeoMeta`는 평면 객체로 메타 태그를 정의하며, 공식 문서가 권장하는 XSS 안전 API다. `name` vs `property` 같은 흔한 실수를 컴파일 타임에 잡는다.

```tsx
import { useSeoMeta } from '@unhead/react'

export default function ProductPage({ product }) {
  useSeoMeta({
    title: `${product.name} | 서비스명`,
    description: product.description,
    ogType: 'product',
    ogTitle: product.name,
    ogDescription: product.description,
    ogImage: product.image,
    twitterCard: 'summary_large_image',
  })

  return <main>{/* ... */}</main>
}
```

### react-helmet-async vs @unhead/react 선택 기준

| 기준 | react-helmet-async v3 | @unhead/react v3 |
|------|----------------------|-------------------|
| 안정성 | 오래된 표준, 다수 프로젝트 채택 | 신규지만 unjs/Nuxt가 백업 |
| React 19 지원 | v3.0.0부터 공식 | v3부터 1급 지원 |
| TypeScript 타입 안전 | 보통 | 강함 (useSeoMeta로 컴파일 타임 검증) |
| 마이그레이션 비용 | 기존 react-helmet 코드 거의 그대로 | helmet 호환 export 제공 |
| 번들 사이즈 | 작음 | 약 11% 더 작다고 공식 발표 (v3 기준) |
| 추천 상황 | 기존 react-helmet 사용 중인 레거시 코드 | 신규 SPA, 타입 안전이 중요한 팀 |

신규 프로젝트라면 `@unhead/react`, 기존 코드 유지가 우선이면 `react-helmet-async`.

---

## 4. JSON-LD 구조화 데이터

검색엔진이 콘텐츠 의미를 이해하도록 `<script type="application/ld+json">`을 head에 삽입한다. **반드시 `<` 문자를 `<`로 이스케이프**해 XSS를 차단한다.

### 공통 헬퍼

```ts
// src/lib/jsonLd.ts
/**
 * JSON-LD 직렬화 시 XSS 방지.
 * `<` → `<`로 치환해 브라우저가 `</script>`를 만나도 컨텍스트 종료되지 않도록.
 */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
```

### react-helmet-async와 함께

```tsx
import { Helmet } from 'react-helmet-async'
import { serializeJsonLd } from '@/lib/jsonLd'

export default function ProductPage({ product }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'KRW',
    },
  }

  return (
    <Helmet>
      <script type="application/ld+json">{serializeJsonLd(jsonLd)}</script>
    </Helmet>
  )
}
```

### @unhead/react와 함께

```tsx
import { useHead } from '@unhead/react'
import { serializeJsonLd } from '@/lib/jsonLd'

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: serializeJsonLd(jsonLd),
    },
  ],
})
```

> 주의: `dangerouslySetInnerHTML`로 JSON.stringify 결과를 그대로 박지 말 것. `</script>`가 포함된 사용자 입력이 있으면 컨텍스트가 깨진다.

---

## 5. sitemap.xml / robots.txt

### 정적 — public/ 폴더

Vite와 CRA 모두 `public/` 디렉터리(Vite는 프로젝트 루트의 `public/`)의 파일은 그대로 빌드 산출물로 복사된다.

```
public/
├── robots.txt
└── sitemap.xml
```

```txt
# public/robots.txt
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://example.com/sitemap.xml
```

```xml
<!-- public/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap-0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-06-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### 자동 생성 — vite-plugin-sitemap

라우트가 많거나 자주 추가되면 빌드 시 자동 생성이 안전하다.

```bash
npm i -D vite-plugin-sitemap
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: 'https://example.com',
      dynamicRoutes: [
        '/',
        '/about',
        '/products/sample-1',
        '/products/sample-2',
      ],
      exclude: ['/admin', '/admin/*'],
      generateRobotsTxt: true,
    }),
  ],
})
```

빌드 후 `dist/sitemap.xml`과 `dist/robots.txt`가 생성된다.

> 주의: SPA 라우트는 빌드 도구가 자동으로 알 수 없으므로 `dynamicRoutes`에 직접 나열하거나, React Router 설정에서 추출하는 빌드 스크립트를 별도로 작성해야 한다.

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
