---
name: seo
description: Next.js 15 App Router SEO — Metadata API, OpenGraph, JSON-LD, sitemap/robots
---

# SEO — Next.js 15 App Router

> 소스: https://nextjs.org/docs/app/api-reference/functions/generate-metadata | https://nextjs.org/docs/app/guides/json-ld | https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
> 검증일: 2026-04-01

---

## Metadata API

### 정적 metadata

```ts
// app/page.tsx 또는 app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '서비스명',
  description: '서비스 설명',
}
```

### 동적 generateMetadata

Next.js 15에서 `params`와 `searchParams`가 비동기로 변경됐다. 반드시 `await`해야 한다.

```ts
// app/products/[id]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next'

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params  // Next.js 15: await 필수
  const product = await fetch(`/api/products/${id}`).then(r => r.json())

  return {
    title: product.name,
    description: product.description,
  }
}
```

### 타이틀 템플릿

```ts
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | 서비스명',
    default: '서비스명',
  },
}

// app/about/page.tsx
export const metadata: Metadata = {
  title: 'About',  // 결과: "About | 서비스명"
}
```

---

## OpenGraph / Twitter Card

```ts
export const metadata: Metadata = {
  openGraph: {
    title: '서비스명',
    description: '서비스 설명',
    url: 'https://example.com',
    siteName: '서비스명',
    images: [
      {
        url: 'https://example.com/og.png',
        width: 1200,
        height: 630,
        alt: 'OG 이미지',
      },
    ],
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

> 하위 세그먼트가 상위 세그먼트의 OG 필드를 덮어쓴다. 페이지별로 명시적으로 설정하는 것이 안전하다.

---

## JSON-LD 구조화 데이터

Next.js 공식 가이드는 `<script>` 태그로 삽입하는 방식을 권장한다. Metadata API 필드가 아니다.

```tsx
// app/products/[id]/page.tsx
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await fetch(`/api/products/${id}`).then(r => r.json())

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'KRW',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          // XSS 방지: < 이스케이프 필수
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <ProductDetail product={product} />
    </>
  )
}
```

---

## sitemap.ts

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

대규모 사이트는 `generateSitemaps()`로 분할:

```ts
export async function generateSitemaps() {
  const total = await getProductCount()
  return Array.from({ length: Math.ceil(total / 50000) }, (_, i) => ({ id: i }))
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts({ offset: id * 50000, limit: 50000 })
  return products.map(p => ({ url: `https://example.com/products/${p.id}` }))
}
```

---

## robots.ts

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
