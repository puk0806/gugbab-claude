---
name: seo-nextjs
description: Next.js 16 App Router SEO — Metadata API, canonical/hreflang, OpenGraph, JSON-LD, sitemap/robots
---

# SEO — Next.js 16 App Router

> 소스:
> - generateMetadata: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
> - JSON-LD 가이드: https://nextjs.org/docs/app/guides/json-ld
> - sitemap.xml: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
> - robots.txt: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
> - v15 → v16 업그레이드 가이드: https://nextjs.org/docs/app/guides/upgrading/version-16
> - 캐싱(Cache Components): https://nextjs.org/docs/app/getting-started/caching
>
> 검증일: 2026-08-11
> 검증 대상 버전: **Next.js 16.3.0** (2026-08-03 릴리즈, 현재 최신 stable)

> 이 스킬은 **SEO 메타/구조화 데이터** 범위만 다룬다. App Router 일반(데이터 페칭·캐싱 모델·proxy 등)은
> `frontend/nextjs`, URL 정규화·리다이렉트는 `frontend/url-canonicalization-redirects` 스킬을 참조한다.

---

## 0. Next.js 15 → 16에서 SEO에 영향 있는 변경

| 항목 | 15 | 16 |
|------|----|----|
| `params` / `searchParams` | Promise (동기 접근 임시 허용) | Promise, **동기 호환 완전 제거** |
| `generateSitemaps`의 `id` | `number` 동기 전달 | **`Promise<string>`** — `await` 필수 (v16.0.0) |
| `opengraph-image` / `twitter-image` / `icon` / `apple-icon` | `params`·`id` 동기 | **`params`·`id`가 Promise** (`generateImageMetadata`의 `params`는 동기 유지) |
| `robots.ts` | 표준 필드만 | **`other` 필드 추가** — 비표준 per-agent 디렉티브 (v16.3.0) |
| 캐싱 | 암묵적 4계층 | `cacheComponents: true` 시 `generateMetadata`도 캐싱 규칙 적용 (아래 §7) |
| AMP | 지원 | **완전 제거** — `next/amp`·`useAmp`·`amp` 설정 삭제 |

---

## 1. Metadata API

### 정적 metadata

```ts
// app/page.tsx 또는 app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '서비스명',
  description: '서비스 설명',
}
```

> `metadata` 객체와 `generateMetadata` 함수는 **Server Component에서만** 지원되며,
> 같은 라우트 세그먼트에서 **둘을 동시에 export할 수 없다**.
> 클라이언트 인터랙션이 필요하면 `page.tsx`는 Server Component로 두고 하위 파일로 분리한다.

### 동적 generateMetadata

`params`와 `searchParams`는 비동기다. 반드시 `await`한다.

```ts
// app/products/[id]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params  // await 필수
  const product = await fetch(`/api/products/${id}`).then(r => r.json())

  // 부모 메타데이터를 교체하지 않고 확장
  const previousImages = (await parent).openGraph?.images || []

  return {
    title: product.name,
    description: product.description,
    openGraph: { images: ['/og/product.png', ...previousImages] },
  }
}
```

**타입 헬퍼 (권장)** — `npx next typegen`으로 생성되는 `PageProps<'/route'>` / `LayoutProps<'/route'>`를 첫 인자에 쓰면 라우트에서 파라미터 타입이 추론된다.

```ts
export async function generateMetadata(
  props: PageProps<'/products/[id]'>
): Promise<Metadata> {
  const { id } = await props.params
  // ...
}
```

> `searchParams`는 **`page.js` 세그먼트에서만** 사용 가능하다 (layout 불가).
> `generateMetadata` 내부의 `fetch`는 `generateStaticParams`·layout·page와 **자동 memoize**된다 — 중복 호출을 걱정하지 않아도 된다.
> `fetch`를 못 쓰는 경우 React `cache()`로 감싼다.

### 타이틀 템플릿

```ts
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | 서비스명',
    default: '서비스명',   // template을 쓰면 default는 필수
  },
}

// app/about/page.tsx
export const metadata: Metadata = {
  title: 'About',  // 결과: "About | 서비스명"
}
```

- `title.template`은 **자식 세그먼트에만** 적용된다. 같은 세그먼트의 `page.js` 타이틀에는 적용되지 않는다.
- 부모 template을 무시하려면 `title: { absolute: 'About' }`.
- `page.js`에 정의한 `title.template`은 아무 효과가 없다 (페이지는 항상 종단 세그먼트).

### 병합 규칙 — 얕은 병합(shallow merge)

메타데이터는 root → page 순으로 평가되고 **얕게 병합**된다. `openGraph`·`robots`처럼 중첩 필드는 하위가 정의하면 **상위 필드 전체가 통째로 교체**된다.

```ts
// app/layout.tsx
export const metadata = { openGraph: { title: 'Acme', description: 'Acme is a...' } }

// app/blog/page.tsx
export const metadata = { openGraph: { title: 'Blog' } }
// 결과: og:title=Blog 만 남고 og:description은 사라진다
```

공통 필드는 별도 변수로 뽑아 spread 한다.

```ts
// app/shared-metadata.ts
export const openGraphImage = { images: ['https://example.com/og.png'] }

// app/about/page.tsx
export const metadata = { openGraph: { ...openGraphImage, title: 'About' } }
```

---

## 2. metadataBase — 상대 경로 허용

URL 계열 필드(`canonical`, `alternates.languages`, `openGraph.images` 등)에 절대 URL 대신 상대 경로를 쓰려면 root layout에 `metadataBase`를 설정한다.

```ts
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  alternates: {
    canonical: '/',
    languages: { 'en-US': '/en-US', 'ko-KR': '/ko-KR' },
  },
  openGraph: { images: '/og-image.png' },
}
```

```html
<link rel="canonical" href="https://example.com" />
<link rel="alternate" hreflang="en-US" href="https://example.com/en-US" />
<meta property="og:image" content="https://example.com/og-image.png" />
```

> **주의:** `metadataBase` 없이 상대 경로를 쓰면 **빌드 에러**가 난다.
> URL 합성은 디렉토리 traversal 의미론이 아니라 *개발자 의도* 우선이다 — `/payments`·`./payments`·`../payments`가 모두 `https://example.com/payments`로 해석된다. 필드에 절대 URL을 주면 `metadataBase`는 무시된다.

---

## 3. canonical / hreflang / alternates

```ts
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://example.com/blog/post-1',
    languages: {
      'en-US': 'https://example.com/en-US/blog/post-1',
      'ko-KR': 'https://example.com/ko-KR/blog/post-1',
    },
    media: { 'only screen and (max-width: 600px)': 'https://example.com/mobile' },
    types: { 'application/rss+xml': 'https://example.com/rss' },
  },
}
```

- 모든 페이지에 **자기참조 canonical**을 기본으로 둔다 (페이지네이션 포함).
- canonical은 절대 URL 또는 `metadataBase` + 상대 경로로 작성하고, `trailingSlash` 정책과 형태를 일치시킨다.
- 다국어 라우트(`app/[lang]/...`)에서 언어값이 필요하면 v16.3의 `next/root-params`로 prop drilling 없이 읽을 수 있다.

> 상세 정규화 규칙(301/308 선택, www/슬래시 통일, 트래킹 파라미터 처리)은
> `frontend/url-canonicalization-redirects` 스킬을 참조한다.

---

## 4. OpenGraph / Twitter Card

```ts
export const metadata: Metadata = {
  openGraph: {
    title: '서비스명',
    description: '서비스 설명',
    url: 'https://example.com',
    siteName: '서비스명',
    images: [
      {
        url: 'https://example.com/og.png',  // metadataBase 없으면 절대 URL 필수
        width: 1200,
        height: 630,
        alt: 'OG 이미지',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '서비스명',
    description: '서비스 설명',
    images: ['https://example.com/og.png'],
  },
}
```

`type: 'article'`이면 기사 전용 필드를 추가할 수 있다.

```ts
openGraph: {
  type: 'article',
  publishedTime: '2026-08-11T00:00:00.000Z',
  authors: ['홍길동'],
}
```

> 하위 세그먼트가 `openGraph`를 정의하면 상위의 OG 필드는 **전부** 대체된다(§1 병합 규칙). 페이지별로 명시 설정이 안전하다.
> Twitter 스펙은 X 외 다른 플랫폼도 참조하므로 함께 채우는 편이 좋다.

### 파일 기반 OG 이미지 — v16에서 params/id가 Promise

`opengraph-image.tsx` 같은 파일 컨벤션은 config export와 실제 파일을 동기화할 필요가 없어 더 안전하다. 다만 **v16에서 시그니처가 바뀌었다**.

```tsx
// app/shop/[slug]/opengraph-image.tsx
export async function generateImageMetadata({ params }) {
  const { slug } = params          // generateImageMetadata의 params는 동기 유지
  return [{ id: '1' }, { id: '2' }]
}

export default async function Image({ params, id }) {
  const { slug } = await params    // Next.js 16: params가 Promise
  const imageId = await id         // Next.js 16: id도 Promise<string>
  // ...
}
```

---

## 5. JSON-LD 구조화 데이터

Next.js 공식 권장은 `layout.js` / `page.js`에서 **네이티브 `<script>` 태그로 렌더**하는 방식이다. Metadata API 필드가 아니다.

```tsx
// app/products/[id]/page.tsx
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await fetch(`/api/products/${id}`).then(r => r.json())

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'KRW',
    },
  }

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          // XSS 방지: JSON.stringify는 악성 문자열을 sanitize하지 않는다.
          // < 를 유니코드로 치환하거나 serialize-javascript 같은 대안을 쓴다.
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <ProductDetail product={product} />
    </section>
  )
}
```

> **`next/script`를 쓰지 않는다.** `next/script`는 JS 로딩/실행 최적화용이고, JSON-LD는 실행 코드가 아닌 구조화 데이터이므로 네이티브 `<script>`가 올바른 선택이다 (공식 문서 명시).

**타입 안전성**: `schema-dts` 커뮤니티 패키지로 타이핑할 수 있다.

```tsx
import type { Product, WithContext } from 'schema-dts'

const jsonLd: WithContext<Product> = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Next.js Sticker',
}
```

**검증**: Google [Rich Results Test](https://search.google.com/test/rich-results) 또는 [Schema Markup Validator](https://validator.schema.org/).

---

## 6. sitemap.ts

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://example.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
```

반환 타입:

```ts
type Sitemap = Array<{
  url: string
  lastModified?: string | Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternates?: { languages?: Languages<string> }
}>
```

> `sitemap.js`는 **기본적으로 캐시되는 특수 Route Handler**다. Request-time API나 dynamic 설정을 쓰면 캐시되지 않는다.

### 다국어 사이트맵

```ts
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://example.com/about',
      lastModified: new Date(),
      alternates: {
        languages: { ko: 'https://example.com/ko/about', en: 'https://example.com/en/about' },
      },
    },
  ]
}
```

### 이미지 / 비디오 사이트맵

```ts
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://example.com',
      lastModified: '2026-08-11',
      images: ['https://example.com/image.jpg'],
      videos: [
        {
          title: 'example',
          thumbnail_loc: 'https://example.com/thumb.jpg',
          description: '설명',
        },
      ],
    },
  ]
}
```

### 분할 — generateSitemaps (⚠️ v16에서 시그니처 변경)

Google 한도는 사이트맵당 **50,000 URL**이다. 초과하면 분할한다.

```ts
// app/product/sitemap.ts
import type { MetadataRoute } from 'next'

export async function generateSitemaps() {
  const total = await getProductCount()
  return Array.from({ length: Math.ceil(total / 50000) }, (_, i) => ({ id: i }))
}

// Next.js 16: id가 Promise<string> — await 후 Number 변환 필요
export default async function sitemap(props: {
  id: Promise<string>
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id
  const start = Number(id) * 50000
  const products = await getProducts({ offset: start, limit: 50000 })
  return products.map(p => ({ url: `https://example.com/products/${p.id}` }))
}
```

> **주의 (v16 breaking change):** Next.js 15의 `sitemap({ id }: { id: number })` 형태는 더 이상 동작하지 않는다.
> `id`는 `Promise<string>`이므로 `await` 후 `Number()`로 변환해야 곱셈 연산이 정상 동작한다.
> 생성 결과는 `/product/sitemap/1.xml` 형태로 서빙된다.

라우트 세그먼트별로 `app/sitemap.xml`, `app/products/sitemap.xml`처럼 **중첩 배치**하는 방식도 가능하다.

---

## 7. robots.ts

```ts
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/private/', '/admin/'],
      },
    ],
    sitemap: 'https://example.com/sitemap.xml',
  }
}
```

`rules`는 **단일 객체 또는 배열** 둘 다 가능하다. 봇별로 다르게 주려면 배열을 쓴다.

```ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: 'Googlebot', allow: ['/'], disallow: '/private/' },
      { userAgent: ['Applebot', 'Bingbot'], disallow: ['/'] },
    ],
    sitemap: 'https://example.com/sitemap.xml',
  }
}
```

반환 타입:

```ts
type Robots = {
  rules:
    | { userAgent?: string | string[]; allow?: string | string[]; disallow?: string | string[]
        crawlDelay?: number; other?: Record<string, string | number | Array<string | number>> }
    | Array<{ userAgent: string | string[]; allow?: string | string[]; disallow?: string | string[]
        crawlDelay?: number; other?: Record<string, string | number | Array<string | number>> }>
  sitemap?: string | string[]
  host?: string
}
```

### 비표준 디렉티브 — `other` (v16.3.0 신규)

Robots Exclusion Standard에 없는 디렉티브(Seznam `Request-Rate`, Yandex `Clean-param` 등)를 rule의 `other` 필드로 내보낸다. 키의 대소문자가 보존되고, 배열 값은 항목당 한 줄씩 해당 User-Agent 블록에 출력된다.

```ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'SeznamBot', allow: '/', other: { 'Request-Rate': '10/1m' } },
    ],
  }
}
```

> **주의:** `other` 값은 **검증 없이 그대로 출력**된다. 디렉티브 이름·문법은 대상 검색엔진 문서를 직접 확인해야 한다.

---

## 8. 크롤러 관련 렌더링 동작 (SEO 필수 이해)

### Streaming metadata

Next.js는 `generateMetadata` 완료를 기다리지 않고 초기 UI를 먼저 보낸다. 메타데이터가 나중에 resolve되면 태그가 `<body>`에 append된다.

- **JS를 실행하고 DOM 전체를 보는 봇(Googlebot 등)** → 정상 해석됨을 Vercel이 검증
- **HTML-limited 봇(`facebookexternalhit` 등, JS 미실행)** → 메타데이터가 렌더를 **블로킹**하고 결과가 `<head>`에 들어간다. Next.js가 User-Agent로 자동 감지한다

봇 목록을 조정하거나 streaming을 완전히 끄려면:

```ts
// next.config.ts
const config: NextConfig = {
  htmlLimitedBots: /.*/,   // 모든 UA를 HTML-limited로 취급 = streaming metadata 비활성
}
```

> **주의:** `htmlLimitedBots` 확장은 응답 시간을 늘린다. 기본값으로 충분한 경우가 대부분이며, 고급 기능으로 다뤄야 한다.
> streaming metadata는 TTFB를 줄이고 LCP 개선에 기여한다.

### Cache Components 사용 시 (`cacheComponents: true`)

`generateMetadata`도 다른 컴포넌트와 동일한 캐싱 규칙을 따른다.

- 런타임 데이터(`cookies()`, `headers()`, `params`, `searchParams`)를 읽거나 uncached fetch를 하면 요청 시점으로 미뤄진다
- 페이지의 나머지가 완전히 prerender 가능한데 메타데이터만 런타임이면 **에러가 발생**한다 — 의도를 명시해야 한다

```ts
// 런타임 데이터가 아니라 외부 데이터에만 의존하는 경우 → use cache
export async function generateMetadata() {
  'use cache'
  const { title, description } = await db.query('site-metadata')
  return { title, description }
}
```

### 봇·크롤러의 static shell

Cache Components에서 브라우저는 static shell을 즉시 받지만, **봇은 shell을 건너뛰고 요청 시점에 전체를 동적 렌더**한 뒤 완성된 HTML을 받는다.

> **주의:** shell이 *빌드 타임에만 존재하는 데이터*에 의존하면, 사람에게는 정상인 페이지가 크롤러에게는 렌더 실패할 수 있다. shell이 의존하는 데이터는 **요청 시점에도 접근 가능**해야 한다.

---

## 9. 흔한 실수 패턴

```ts
// ❌ metadataBase 없이 상대 경로 사용 → 빌드 에러
export const metadata = { openGraph: { images: '/og.png' } }

// ❌ 하위 페이지에서 openGraph 일부만 정의 → 상위 OG 필드 전부 소실
// → 공통 필드를 변수로 뽑아 spread 한다

// ❌ Client Component에서 metadata / generateMetadata export
'use client'
export const metadata = { title: 'X' }   // Server Component 전용

// ❌ 같은 세그먼트에서 metadata와 generateMetadata 동시 export → 에러

// ❌ Next.js 16에서 generateSitemaps의 id를 동기 number로 취급
export default async function sitemap({ id }: { id: number }) {
  const start = id * 50000   // ⚠️ id는 Promise<string> — NaN이 된다
}

// ❌ JSON-LD를 JSON.stringify 그대로 삽입 (XSS)
__html: JSON.stringify(jsonLd)              // < 이스케이프 누락
__html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')  // ✅

// ❌ JSON-LD를 next/script로 삽입 → 네이티브 <script> 사용

// ❌ page.js가 아닌 layout.js에서 searchParams 접근 → 지원되지 않음

// ❌ themeColor / colorScheme / viewport를 metadata에 지정
// → Next.js 14부터 deprecated. generateViewport / viewport export 사용
```
