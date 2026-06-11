## 6. Product + Offer + AggregateRating + Review

### 두 가지 유형: Product Snippet vs Merchant Listing

| 항목 | Product Snippet | Merchant Listing |
|------|-----------------|------------------|
| 대상 페이지 | 상품 정보·리뷰 (구매 불가) | 직접 구매 가능 |
| SERP 표시 | 검색 결과 + 이미지 검색 | + Google Shopping, YouTube 무료 쇼핑 리스팅 |
| 가격 표시 | 제한적 | 완전 표시 |
| 추가 필드 | 리뷰 중심 (장단점 등) | 사이즈·배송·반품 정책 |

> 가격·재고를 SERP에 노출하려면 Merchant Listing 자격을 갖춰야 한다. "사용자가 페이지에서 직접 구매 가능"이 핵심 기준이다.

소스:
- https://developers.google.com/search/docs/appearance/structured-data/product-snippet
- https://developers.google.com/search/docs/appearance/structured-data/merchant-listing

### Product 필드

- **권장 (사실상 필수)**: `name`, `image`
- **Offer 필수**: `price`, `priceCurrency`, `availability`

### Offer.availability 값

schema.org URL 형태로 작성:

| 값 | 의미 |
|----|------|
| `https://schema.org/InStock` | 재고 있음 |
| `https://schema.org/OutOfStock` | 품절 |
| `https://schema.org/PreOrder` | 사전 주문 |
| `https://schema.org/BackOrder` | 입고 대기 |
| `https://schema.org/Discontinued` | 단종 |
| `https://schema.org/SoldOut` | 매진 |
| `https://schema.org/LimitedAvailability` | 한정 |

### priceCurrency

- ISO 4217 3글자 코드 (`KRW`, `USD`, `EUR`, `JPY`)
- `price`는 숫자 또는 숫자 문자열 (`"39.99"`), **통화 기호·콤마 금지**

### JSON-LD 예시 (Product + Offer + AggregateRating + Review)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Executive Anvil",
  "image": [
    "https://example.com/photos/1x1/anvil.jpg",
    "https://example.com/photos/4x3/anvil.jpg",
    "https://example.com/photos/16x9/anvil.jpg"
  ],
  "description": "Sleeker than ACME's Classic Anvil...",
  "sku": "0446310786",
  "brand": {
    "@type": "Brand",
    "name": "ACME"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/anvil",
    "priceCurrency": "KRW",
    "price": 119990,
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.4",
    "reviewCount": "89"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "홍길동"
      },
      "reviewBody": "튼튼하고 디자인이 깔끔합니다."
    }
  ]
}
```

### 흔한 실수

- `price`에 통화 기호 포함 (`"₩39,990"`) → 숫자만 (`39990`)
- `priceCurrency`에 통화 기호 (`"$"`) → ISO 4217 코드 (`"USD"`)
- `availability`에 자연어 (`"in stock"`) → schema.org URL (`"https://schema.org/InStock"`)
- 리뷰가 페이지에 표시되지 않는데 JSON-LD에만 존재 → Google 가이드 위반 (제재 위험)
- 구매 불가 페이지에 가격 표시 후 Merchant Listing 자격 미충족 → Product Snippet으로 표시되며 가격 미노출

---

## 7. VideoObject

### 필드

- **필수**: `name`, `thumbnailUrl`, `uploadDate`
- **권장**: `description`, `duration`, `contentUrl`, `embedUrl`

### duration 형식

ISO 8601 duration: `PT[시간]H[분]M[초]S`

| 길이 | 형식 |
|------|------|
| 1분 54초 | `PT1M54S` |
| 30분 5초 | `PT30M5S` |
| 1시간 23분 45초 | `PT1H23M45S` |

### thumbnailUrl 요구사항

- 영상의 고유한 썸네일 이미지 URL
- 크롤링 가능
- 권장 해상도: 60×30 이상, 가능하면 1280×720 이상

### JSON-LD 예시

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "자율주행 자전거 소개",
  "description": "자율주행 자전거가 어떻게 작동하는지 설명합니다.",
  "thumbnailUrl": [
    "https://example.com/photos/1x1/photo.jpg",
    "https://example.com/photos/16x9/photo.jpg"
  ],
  "uploadDate": "2026-03-15T08:00:00+09:00",
  "duration": "PT1M54S",
  "contentUrl": "https://example.com/video/123.mp4",
  "embedUrl": "https://example.com/embed/123"
}
```

### 흔한 실수

- `duration`을 "1분 54초" 자연어로 → ISO 8601 (`PT1M54S`)
- `uploadDate`를 날짜만 (`"2026-03-15"`) → 시간·타임존 포함이 더 정확
- `thumbnailUrl` 누락 → 필수 필드

---

## 8. WebSite (사이트 식별)

> **주의 (2026-06-01 기준)**: Sitelinks Search Box는 2024년 11월 21일자로 Google이 글로벌 deprecation했다. `WebSite` + `potentialAction: SearchAction` 마크업은 Google SERP에서 검색창을 더 이상 생성하지 않는다.
>
> **그러나** `WebSite` 자체는 여전히 Google이 지원하며, 사이트 이름·SiteNavigationElement·검색 결과의 사이트 식별에 사용된다. `WebSite` 마크업은 계속 권장된다.
>
> 소스: https://developers.google.com/search/blog/2024/10/sitelinks-search-box

### 필드

- **권장**: `name`, `url`, `alternateName`

### JSON-LD 예시 (현재 권장)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Example Site",
  "alternateName": "ES",
  "url": "https://example.com"
}
```

### SearchAction (참고용 — Google SERP 효과 없음)

남겨둬도 에러는 발생하지 않으며 다른 검색 엔진·LLM이 활용할 가능성은 있다. 신규 추가는 권장하지 않는다.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://example.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

---

## 통합 패턴 — Next.js App Router

페이지·레이아웃에서 JSON-LD를 주입할 때:

```tsx
// app/articles/[slug]/page.tsx
import type { Article } from '@/types';

function articleJsonLd(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    image: article.images,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: [{ "@type": "Person", name: article.authorName }],
    publisher: {
      "@type": "Organization",
      name: "Example",
      logo: {
        "@type": "ImageObject",
        url: "https://example.com/logo.png",
      },
    },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  const jsonLd = articleJsonLd(article);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <article>{/* 본문 */}</article>
    </>
  );
}
```

여러 타입을 한 페이지에 넣을 때는 `@graph`로 묶거나 개별 `<script>` 태그 여러 개로 주입한다.

---

## Google Rich Results 지원 현황 요약 (2026-06-01 기준)

| 타입 | Google SERP 지원 | 비고 |
|------|:---:|------|
| Article / NewsArticle / BlogPosting | 지원 | 핵심 권장 |
| BreadcrumbList | 지원 | 핵심 권장 |
| FAQPage | **종료** | 2026-05-07부터 표시 중단, 2026-06 검사 도구 제거 |
| HowTo | **종료** | 2023-08/09 모든 표면 제거 |
| Organization | 지원 | logo, sitelinks 등 |
| LocalBusiness | 지원 | 지도·로컬 검색 |
| Product | 지원 | snippet/merchant listing 구분 |
| VideoObject | 지원 | 동영상 검색 |
| WebSite | 부분 | SearchAction 종료(2024-11), 사이트 이름은 유지 |

> 주의: "종료된" 타입(FAQPage, HowTo)도 schema.org 스펙으로는 유효하다. 사이트에 남겨둬도 Search Console에 에러가 발생하지 않는다. 다만 신규 페이지에 Google SERP 향상 목적으로만 추가할 거라면 가치가 없다.

---

## 검증 워크플로우

1. JSON-LD 작성 후 https://search.google.com/test/rich-results 에 URL 또는 코드 붙여넣기
2. "유효한 항목"으로 표시되는지 확인
3. Schema.org Validator https://validator.schema.org 에서 스펙 준수 추가 확인
4. 프로덕션 배포 후 Search Console > 향상 (Enhancements) 보고서에서 사이트 전체 인덱싱 결과 확인
