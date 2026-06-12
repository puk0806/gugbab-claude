---
name: image-optimization-seo
description: >
  이미지 SEO와 성능 최적화를 통합한 카탈로그. 반응형 이미지(picture/srcset/sizes),
  차세대 포맷(AVIF/WebP/JPEG XL) 폴백 체인, 이미지 CDN 비교, Next.js Image 컴포넌트,
  Google 이미지 SEO·image sitemap, alt text(a11y+SEO 교차), CLS/LCP 영향,
  GEO/AI 검색 대응까지 콘텐츠·제품·히어로 이미지 관점에서 정리.
---

# Image Optimization & SEO

> 소스: [MDN Responsive Images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images), [Google Search Central — Image SEO](https://developers.google.com/search/docs/appearance/google-images), [Google — Image Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps), [Next.js Image (16.x)](https://nextjs.org/docs/app/api-reference/components/image), [web.dev — Browser-level lazy loading](https://web.dev/articles/browser-level-image-lazy-loading), [web.dev — Fetch Priority](https://web.dev/articles/fetch-priority), [sharp 0.34](https://sharp.pixelplumbing.com/)
> 검증일: 2026-06-03
> 범위: 콘텐츠 이미지 / 제품 이미지 / 히어로 이미지 (OG/소셜 이미지는 [[og-image-generation]], LCP 최적화 심화는 [[core-web-vitals-optimization]]에 위임)

---

## 0. 사용 결정 가이드

| 상황 | 적용 섹션 |
|------|-----------|
| `<img>` 한 장을 어떻게 마크업해야 할지 | §1 반응형 이미지 / §7 alt text |
| AVIF·WebP 폴백을 어떻게 짜야 할지 | §1 picture / §2 포맷 폴백 체인 |
| 어떤 CDN을 골라야 할지 | §3 이미지 CDN 비교 |
| Next.js 프로젝트인데 `priority`가 deprecated? | §4 Next.js Image |
| Google 이미지 검색 노출이 안 됨 | §5 이미지 SEO / §6 sitemap |
| 스크린리더·SEO 둘 다 만족하는 alt 작성법 | §7 alt text |
| LCP 이미지가 늦게 뜸 | §8 lazy/eager + §10 CWV |
| ChatGPT·Claude가 내 이미지를 못 봄 | §11 GEO/AI |
| 빌드 시 자동 최적화 파이프라인 | §9 sharp 빌드 스크립트 |

---

## 1. 반응형 이미지 표준 — picture / srcset / sizes

세 가지 도구는 **각각 다른 문제**를 푼다. 혼동이 가장 흔한 실수.

| 도구 | 푸는 문제 | 사용 신호 |
|------|-----------|-----------|
| `srcset` + `sizes` (w 디스크립터) | 같은 이미지, 뷰포트별 다른 *크기* | 본문 콘텐츠 이미지 |
| `srcset` (x 디스크립터) | 같은 크기 표시, 디스플레이 *해상도* 차이 | 아이콘·로고 |
| `<picture>` + `<source media>` | 뷰포트별 *다른 크롭* (art direction) | 히어로 (모바일은 인물 클로즈업, 데스크탑은 풀샷) |
| `<picture>` + `<source type>` | 같은 이미지의 *포맷 폴백* | AVIF → WebP → JPEG |

### 1-1. resolution switching (w 디스크립터)

```html
<img
  srcset="
    /img/product-480.jpg 480w,
    /img/product-800.jpg 800w,
    /img/product-1200.jpg 1200w,
    /img/product-1920.jpg 1920w"
  sizes="(max-width: 600px) 100vw,
         (max-width: 1200px) 50vw,
         33vw"
  src="/img/product-800.jpg"
  alt="2026년형 무선 헤드폰 — 매트 블랙 컬러, 측면 각도"
  width="800"
  height="800"
  loading="lazy"
  decoding="async" />
```

- `sizes`는 **이미지가 실제 렌더링될 폭**을 CSS 미디어 쿼리로 기술. 브라우저는 이 정보로 `srcset`에서 가장 적합한 후보를 고른다.
- `sizes` 없으면 브라우저는 *뷰포트 전체 폭*으로 가정 → 과도하게 큰 이미지를 가져옴.
- `width`/`height` 속성은 CSS로 폭이 바뀌어도 **반드시 명시** (§10 CLS).

### 1-2. art direction + 포맷 폴백 (picture)

```html
<picture>
  <!-- 모바일: 인물 클로즈업 -->
  <source
    media="(max-width: 799px)"
    type="image/avif"
    srcset="/img/hero-mobile-480.avif 480w, /img/hero-mobile-720.avif 720w"
    sizes="100vw" />
  <source
    media="(max-width: 799px)"
    type="image/webp"
    srcset="/img/hero-mobile-480.webp 480w, /img/hero-mobile-720.webp 720w"
    sizes="100vw" />

  <!-- 데스크탑: 풀샷 -->
  <source
    media="(min-width: 800px)"
    type="image/avif"
    srcset="/img/hero-desktop-1200.avif 1200w, /img/hero-desktop-1920.avif 1920w"
    sizes="100vw" />
  <source
    media="(min-width: 800px)"
    type="image/webp"
    srcset="/img/hero-desktop-1200.webp 1200w, /img/hero-desktop-1920.webp 1920w"
    sizes="100vw" />

  <!-- 최종 fallback (필수) -->
  <img
    src="/img/hero-desktop-1200.jpg"
    srcset="/img/hero-mobile-720.jpg 720w, /img/hero-desktop-1920.jpg 1920w"
    sizes="100vw"
    alt="2026 봄 컬렉션 런웨이 — 모델이 흰색 코트를 입고 워킹 중"
    width="1920"
    height="1080"
    fetchpriority="high"
    decoding="async" />
</picture>
```

규칙:
- `<source>` 순서대로 평가 → 첫 매치가 채택. **AVIF를 항상 위**에.
- `<img>` fallback은 **필수**. 빠뜨리면 `<picture>` 전체가 깨진다.
- `<picture>` 내부에서 `<source media>`와 `<img sizes>`를 *동시에* 쓰지 말 것 (MDN 경고).

---

## 2. 차세대 포맷 — 2026 폴백 체인

### 2-1. 브라우저 지원 현황 (2026-06 기준)

| 포맷 | 전역 지원 | 핵심 장점 | 단점 |
|------|-----------|-----------|------|
| **JPEG** | 100% | 범용 호환 | 알파 없음, 사진 비효율 |
| **PNG** | 100% | 무손실, 알파 | 사진에 부적합 (큰 용량) |
| **WebP** | 약 97% | JPEG 대비 25~35%↓, 알파·애니메이션 | iOS 14 이하 미지원 |
| **AVIF** | 약 95% | JPEG 대비 ~50%↓, WebP 대비 20%↓, HDR | 인코딩 5~7배 느림 |
| **JPEG XL (.jxl)** | 약 14~15% (Safari 17+ 안정 / Chrome 145 플래그) | 점진 디코딩·HDR·무손실 | 웹 단독 사용 불가 — 폴백 필수 |

> 주의: 위 수치는 caniuse 2026 초~중반 기준 추정이다. 프로젝트 시작 시 [caniuse.com](https://caniuse.com/avif)에서 타겟 브라우저 매트릭스로 재확인할 것.

### 2-2. 권장 폴백 체인

```
사진·히어로:   AVIF → WebP → JPEG
일러스트·UI:   AVIF → WebP → PNG (알파 필요 시)
아이콘·로고:   SVG (벡터 우선)
애니메이션:    WebP 애니 → MP4/WebM (GIF 금지)
```

JPEG XL은 **2026년 시점 웹 단독 서빙 불가**. archival·점진 도입 워크플로우에서만 검토.

### 2-3. 품질 권장값

| 포맷 | 사진 | UI/스크린샷 |
|------|------|-------------|
| JPEG | 80~85 | 90 |
| WebP | 75~85 | 85~90 |
| AVIF | 50~65 | 60~75 |
| PNG | (무손실) | — |

AVIF는 동일 시각 품질에서 quality 값이 더 낮다 (WebP 80 ≈ AVIF 55~60).

---

## 3. 이미지 CDN 비교

### 3-1. 글로벌 5종

| CDN | 변환 신호 | 강점 | 약점 |
|-----|-----------|------|------|
| **Cloudinary** | URL 세그먼트 `w_800,h_600,c_fill,g_face,q_auto,f_auto` | AI 변환 (배경 제거·스마트 크롭), 풍부한 SDK | 트래픽 단가 높음 |
| **Imgix** | 쿼리스트링 `?w=800&h=600&fit=crop&auto=format,compress&q=80` | 스토리지 분리(S3/GCS 연결), 빠른 응답 | 자체 스토리지 없음 |
| **Cloudflare Images** | 대시보드 사전 정의 variant (`/cdn-cgi/image/{variant}/...`) | 단가 매우 저렴, Workers 통합 | 변환 자유도 낮음 |
| **Vercel Image Optimization** | `next/image` 자동 또는 `/_vercel/image?url=...&w=800&q=75` | Next.js 통합 자동 | Vercel 외부 의존 시 비용 |
| **ImageKit** | URL `tr:w-800,h-600,c-maintain_ratio` | 합리적 가격, 가벼운 변환 | 고급 AI 변환 제한 |

### 3-2. 한국 시장 옵션

| CDN | 특징 |
|-----|------|
| **NAVER Cloud — Image Optimizer** | Object Storage 버킷 연동, resize·crop·watermark·sharpen 지원, CDN+Cloud Log Analytics 통합 |
| **NHN Cloud — Image** | 구 TOAST 클라우드. 변환 API + CDN 일체형 |

선택 기준:
- **Next.js + Vercel 호스팅** → Vercel Image Optimization (옵션 0)
- **자체 인프라 + 저렴 우선** → Cloudflare Images
- **고급 변환·AI 필요** → Cloudinary 또는 Imgix
- **국내 트래픽 + 데이터 주권** → NAVER Cloud / NHN Cloud

> 주의: 단가는 자주 바뀐다. 도입 직전 공식 가격표를 다시 확인할 것.

---

## 4. Next.js Image 컴포넌트 (16.x 기준)

### 4-1. 기본 사용

```tsx
import Image from 'next/image'

export default function ProductCard() {
  return (
    <Image
      src="/img/product.jpg"
      alt="2026년형 무선 헤드폰 — 매트 블랙"
      width={800}
      height={800}
      sizes="(max-width: 768px) 100vw, 33vw"
      quality={80}
    />
  )
}
```

자동으로 처리되는 것:
- `srcset` 자동 생성 (deviceSizes·imageSizes 설정값 기반)
- `<img>` 의 `loading="lazy"` 기본 적용 (아래 §4-3 예외 주의)
- `decoding="async"` 자동 적용
- WebP/AVIF 자동 변환 (`images.formats` 설정에 따라)
- `width`/`height` 기반 aspect-ratio 자동 적용 → CLS 방지

### 4-2. Next.js 16 — `priority` deprecated → `preload`

Next.js 16부터 **`priority` prop이 deprecated**다. 의도를 명확히 하기 위해 `preload`로 분리되었다.

```tsx
// Next.js 15 이전 (deprecated)
<Image src="/hero.jpg" alt="..." priority />

// Next.js 16+ (권장)
<Image src="/hero.jpg" alt="..." preload />
```

`preload`는 `<head>`에 `<link rel="preload" as="image">`를 주입한다. **LCP 이미지에만 사용**해야 한다 (라우트당 1개 권장).

대부분의 above-the-fold 이미지에는 `preload` 대신:

```tsx
<Image src="/hero.jpg" alt="..." loading="eager" fetchPriority="high" />
```

| 상황 | 권장 prop |
|------|-----------|
| 라우트의 단일 LCP 이미지 + `<head>` 사전 발견 필요 | `preload` |
| Above-the-fold이지만 뷰포트별로 LCP 후보가 다름 | `loading="eager"` |
| 우선순위만 올리고 싶음 (DOM에 이미 있음) | `fetchPriority="high"` |
| Below-the-fold | (기본값 — lazy) |

### 4-3. 주요 props

| Prop | 의미 |
|------|------|
| `fill` | 부모 요소를 채움. 부모에 `position: relative` 필요 |
| `sizes` | `fill` 또는 responsive에서 반드시 명시 |
| `placeholder` | `"blur"` + `blurDataURL` 또는 `"empty"` |
| `quality` | 1~100 (기본 75). AVIF는 60 권장 |
| `unoptimized` | CDN 최적화 우회 (외부 이미 변환된 이미지) |
| `loader` | 커스텀 CDN 로더 (Cloudinary·Imgix 등 연동 시) |

### 4-4. next.config 설정

```ts
// next.config.ts
export default {
  images: {
    formats: ['image/avif', 'image/webp'], // 우선순위 순서
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.example.com', pathname: '/img/**' },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일
  },
}
```

---

## 5. 이미지 SEO — Google Search Central 기준

### 5-1. 파일명

- **`my-new-black-kitten.jpg`** ✅ — Google 공식 가이드 권장 예시
- **`IMG00023.JPG`** ❌

규칙:
- 단어 사이 하이픈(`-`) 사용, 언더스코어(`_`) 회피
- 영문 lowercase, 키워드 자연 포함 (3~5 단어)
- 다국어 사이트는 파일명도 번역 (URL 인코딩 규칙 준수)

### 5-2. 컨텍스트 신호 (Google이 보는 것)

Google 공식 문서 인용:
> "Google extracts information about the subject matter of the image from the content of the page, including captions and image titles."

신호 우선순위 (Google이 사용하는 순):
1. **alt text** (가장 중요)
2. **이미지 주변 텍스트** (앞뒤 단락·캡션·`<figcaption>`)
3. **파일명**
4. **페이지 제목·H1**
5. **structured data** (ImageObject·Product 등의 `image` 필드)
6. **컴퓨터 비전 알고리즘** (이미지 픽셀 분석)

### 5-3. Structured Data와의 결합

이미지를 풍부한 검색 결과(rich result badge) 후보로 만들려면 해당 콘텐츠 타입의 schema.org `image` 필드에 절대 URL을 넣는다. (자세한 schema 패턴은 [[schema-org-patterns]] 위임.)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "2026 무선 헤드폰",
  "image": [
    "https://example.com/img/headphone-1x1.jpg",
    "https://example.com/img/headphone-4x3.jpg",
    "https://example.com/img/headphone-16x9.jpg"
  ]
}
</script>
```

### 5-4. 지원 포맷

Google Search가 인덱싱하는 포맷: BMP, GIF, JPEG, PNG, WebP, SVG, **AVIF**. 확장자가 실제 파일 형식과 일치해야 한다.

---

## 6. 이미지 Sitemap

### 6-1. 현재 유효한 태그 (2026)

> **중요 변경:** Google은 2022-05 spring cleaning에서 `<image:caption>`, `<image:title>`, `<image:geo_location>`, `<image:license>` 를 **deprecated**시켰다. 2022-08-06 이후 Google 색인에 영향 없음. 신규 sitemap에는 넣지 않는다 (Bing·Yandex는 일부 유지).

현재 Google이 처리하는 태그:
- `<image:image>` — 이미지 한 장의 컨테이너
- `<image:loc>` — 이미지 URL (필수)

### 6-2. XML 예시

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://example.com/products/wireless-headphone</loc>
    <image:image>
      <image:loc>https://cdn.example.com/img/headphone-1x1.jpg</image:loc>
    </image:image>
    <image:image>
      <image:loc>https://cdn.example.com/img/headphone-4x3.jpg</image:loc>
    </image:image>
    <image:image>
      <image:loc>https://cdn.example.com/img/headphone-detail.jpg</image:loc>
    </image:image>
  </url>
  <url>
    <loc>https://example.com/blog/sleep-quality-2026</loc>
    <image:image>
      <image:loc>https://cdn.example.com/img/blog/sleep-hero.jpg</image:loc>
    </image:image>
  </url>
</urlset>
```

규칙:
- 하나의 `<url>` 안에 최대 **1,000개** `<image:image>` 허용
- 이미지 URL은 *다른 도메인*도 가능 (Search Console에서 양쪽 도메인 verified 시)
- robots.txt가 이미지 경로 크롤링을 막지 않아야 함
- **JavaScript로 동적 삽입되는 이미지**는 Google이 못 찾을 수 있으므로 sitemap에 명시 권장

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
