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
