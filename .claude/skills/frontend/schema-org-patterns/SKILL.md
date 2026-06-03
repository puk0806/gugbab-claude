---
name: schema-org-patterns
description: >
  자주 쓰는 schema.org 타입 8종(Article·Breadcrumb·FAQPage·HowTo·Organization·LocalBusiness·Product·VideoObject·WebSite)의 JSON-LD 카탈로그.
  프레임워크 비종속. 각 타입별 필수 필드·권장 필드·Google Rich Results 조건·예시·흔한 실수 정리.
---

# schema.org JSON-LD 패턴 카탈로그

> 소스:
> - schema.org 공식: https://schema.org
> - Google Search Central: https://developers.google.com/search/docs/appearance/structured-data
> - Sitelinks Search Box deprecation: https://developers.google.com/search/blog/2024/10/sitelinks-search-box
> - HowTo/FAQ 변경: https://developers.google.com/search/blog/2023/08/howto-faq-changes
>
> 검증일: 2026-06-01

---

## 공통 원칙

### 1) @context와 @type

- `@context`는 항상 `"https://schema.org"` (HTTPS, 단수)
- `@type`은 schema.org에 정의된 정확한 타입명 (대소문자 구분)
- 한 페이지에 여러 타입을 넣을 때는 `@graph` 배열 또는 개별 `<script>` 태그 사용

### 2) XSS 방지 — `<` 이스케이프 필수

JSON-LD를 `<script>`에 주입할 때 본문 데이터에 `</script>`가 포함되면 페이지가 깨진다. 반드시 이스케이프한다.

```jsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
  }}
/>
```

순수 HTML에서도 같은 원칙. 빌드 시점에 직렬화한다면 마찬가지로 `<` → `<` 치환.

### 3) 날짜 형식

- 모든 날짜·시간은 ISO 8601 (`2026-06-01T10:30:00+09:00`)
- 기간(Duration)은 ISO 8601 duration (`PT1M30S` = 1분 30초)
- 통화는 ISO 4217 (`KRW`, `USD`, `EUR`)

### 4) 검증 도구

| 도구 | URL | 용도 |
|------|-----|------|
| Google Rich Results Test | https://search.google.com/test/rich-results | Google이 인식 가능한지 확인 |
| Schema.org Validator | https://validator.schema.org | schema.org 스펙 준수 확인 |

> 주의: Rich Results Test에 잡히지 않아도 schema.org 스펙으로는 유효할 수 있다. Validator로 이중 확인 권장.

### 5) @id로 노드 참조 (중첩 중복 제거)

같은 Organization을 여러 곳에서 참조할 때 `@id`로 한 번 정의하고 나머지는 `{ "@id": "..." }`로 참조한다.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#org",
      "name": "Example Inc",
      "url": "https://example.com"
    },
    {
      "@type": "Article",
      "headline": "...",
      "publisher": { "@id": "https://example.com/#org" }
    }
  ]
}
```

---

## 1. Article / NewsArticle / BlogPosting

### 언제 사용?

| 타입 | 용도 |
|------|------|
| `Article` | 일반 기사·문서·튜토리얼 |
| `NewsArticle` | 뉴스 기사 (Top stories·Google News 대상) |
| `BlogPosting` | 블로그 글 |

세 타입 모두 동일한 필드를 받는다. 사이트 성격에 맞는 가장 구체적인 타입을 선택한다.

### 필드

- **필수**: 없음 (Google 권장 필드 중심으로 작성)
- **권장**: `headline`, `image`, `datePublished`, `dateModified`, `author`, `publisher`

### headline 길이

- `Article` / `BlogPosting`: 2023년 1월 Google이 110자 제한 가이드를 제거. 다만 "긴 제목은 일부 기기에서 잘릴 수 있다"고 권고.
- `NewsArticle`: **110자 제한이 여전히 유효**. 초과 시 structured data 검증 실패.

> 주의: NewsArticle headline 110자 초과 금지. Article은 제한 없음.

### image 요구사항

- 최소 50,000 픽셀 (예: 224×224 이상)
- 권장 비율: 16:9, 4:3, 1:1 모두 제공
- 크롤링·인덱싱 가능한 URL

### JSON-LD 예시

```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Title of a News Article",
  "image": [
    "https://example.com/photos/1x1/photo.jpg",
    "https://example.com/photos/4x3/photo.jpg",
    "https://example.com/photos/16x9/photo.jpg"
  ],
  "datePublished": "2026-06-01T08:00:00+09:00",
  "dateModified": "2026-06-01T09:20:00+09:00",
  "author": [{
    "@type": "Person",
    "name": "홍길동",
    "url": "https://example.com/profile/honggildong"
  }],
  "publisher": {
    "@type": "Organization",
    "name": "Example Publisher",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  }
}
```

### JSX 통합 예시

```jsx
function ArticleJsonLd({ article }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    image: article.images,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: [{ "@type": "Person", name: article.authorName }],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  );
}
```

### 흔한 실수

- `datePublished`만 넣고 `dateModified` 누락 → 수정 이력 추적 안 됨
- `author`를 문자열로 작성 → 반드시 `Person` 또는 `Organization` 객체
- NewsArticle headline 110자 초과
- `image`를 단일 URL로만 제공 (가능하면 여러 비율 배열로)

---

## 2. BreadcrumbList

### 언제 사용?

페이지가 사이트 계층 구조에서 어느 위치에 있는지 표시. 검색 결과에 URL 대신 경로가 표시됨.

### 필드

- **필수**: `itemListElement` (ListItem 배열)
- **ListItem 필수**: `position`, `name`, `item` (마지막 항목은 `item` 생략 가능 — 현재 페이지)

### position 규칙

- **1부터 시작** (0이 아님)
- 순차적으로 증가 (1, 2, 3 …)
- 첫 항목이 최상위, 마지막 항목이 현재 페이지

### JSON-LD 예시

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Books",
      "item": "https://example.com/books"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Science Fiction",
      "item": "https://example.com/books/sciencefiction"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Award Winners"
    }
  ]
}
```

### 흔한 실수

- `position`을 0부터 시작 → 1부터 시작이 맞음
- 마지막 항목에 `item` URL을 넣고 그게 다른 페이지를 가리킴 → 마지막은 생략하거나 현재 페이지 URL
- 빵 부스러기가 화면에 보이지 않는데 JSON-LD만 추가 → Google 가이드 위반 (시각적 표시 권장)

---

## 3. FAQPage

> **주의 (2026-06-01 기준)**: Google은 2026년 5월 7일자로 FAQ rich results 표시를 중단했다. 2026년 6월 중 Rich Results Test 지원, 8월 중 Search Console API 지원이 제거된다. 그 이전(2023년 8월부터)에도 정부·의료 등 공인 사이트에만 표시되도록 제한되어 있었다.
>
> 그럼에도 schema.org `FAQPage` 자체는 여전히 **유효한 표준**이며, 다음 용도로 의미가 있다:
> - 일반 정부·의료 사이트 등 일부 도메인에서 잔존 가능성
> - 다른 검색 엔진·LLM 학습·접근성 도구가 활용
> - 사이트 내 자체 검색·구조 파악
>
> 신규 페이지에 Google SERP 향상 목적으로만 추가할 거라면 비용 대비 효과가 거의 없다.
>
> 소스: https://developers.google.com/search/blog/2023/08/howto-faq-changes

### 필드

- **필수**: `mainEntity` (Question 배열)
- **Question 필수**: `name` (질문 텍스트), `acceptedAnswer` (Answer 객체)
- **Answer 필수**: `text` (답변 텍스트)

### JSON-LD 예시

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "환불 정책은 어떻게 되나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "구매 후 14일 이내 미사용 상태에서 환불 가능합니다."
      }
    },
    {
      "@type": "Question",
      "name": "배송은 얼마나 걸리나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "주문 후 영업일 기준 2~3일 이내 배송됩니다."
      }
    }
  ]
}
```

### 흔한 실수

- 같은 질문이 화면에 보이지 않는데 JSON-LD에만 존재 → Google 가이드 위반
- `acceptedAnswer.text`에 HTML 태그를 그대로 넣고 이스케이프 안 함

---

## 4. HowTo

> **주의 (2026-06-01 기준)**: Google은 HowTo rich results를 2023년 8월(모바일)·9월(데스크톱)에 완전 제거했다. 현재 어떤 SERP 표면에도 표시되지 않는다.
>
> schema.org `HowTo`는 여전히 유효 스펙이며 LLM·접근성 도구·다른 검색 엔진이 활용할 수 있다. 단 Google SERP 노출 목적이면 추가 가치가 없다.
>
> 소스: https://developers.google.com/search/blog/2023/08/howto-faq-changes

### 필드

- **필수**: `name`, `step` (HowToStep 배열)
- **권장**: `image`, `totalTime` (ISO 8601 duration), `estimatedCost`, `supply`, `tool`

### JSON-LD 예시

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "리눅스에서 환경변수 설정하기",
  "totalTime": "PT5M",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "쉘 설정 파일 열기",
      "text": "터미널에서 nano ~/.bashrc 또는 nano ~/.zshrc 명령으로 설정 파일을 엽니다.",
      "url": "https://example.com/guide#step1"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "환경변수 추가",
      "text": "파일 끝에 export MY_VAR=value 형식으로 변수를 추가합니다."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "변경사항 적용",
      "text": "source ~/.bashrc 명령으로 변경사항을 적용합니다."
    }
  ]
}
```

### 흔한 실수

- `step`을 문자열 배열로 작성 → 반드시 `HowToStep` 객체
- `totalTime`을 "5 minutes" 같은 자연어로 → ISO 8601 duration (`PT5M`)

---

## 5. Organization / LocalBusiness

### Organization 필드

- **필수**: 없음 (권장 필드 중심)
- **권장**: `name`, `url`, `logo`, `sameAs`, `contactPoint`, `address`

### logo 요구사항

- 최소 112×112 픽셀
- 크롤링·인덱싱 가능한 URL

### Organization JSON-LD 예시

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Example Corporation",
  "url": "https://www.example.com",
  "logo": "https://www.example.com/logo.png",
  "sameAs": [
    "https://twitter.com/example",
    "https://www.linkedin.com/company/example",
    "https://www.facebook.com/example"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+82-2-1234-5678",
    "contactType": "customer service",
    "areaServed": "KR",
    "availableLanguage": ["Korean", "English"]
  }
}
```

### LocalBusiness 필드

LocalBusiness는 Organization의 하위 타입. 매장 정보가 있는 사이트에 사용.

- **필수**: `name`, `address` (PostalAddress)
- **권장**: `telephone`, `url`, `openingHoursSpecification`, `geo`, `priceRange`, `aggregateRating`

### LocalBusiness 하위 타입

상황에 맞는 가장 구체적인 타입 선택:

| 타입 | 용도 |
|------|------|
| `Restaurant` | 음식점 |
| `Store` | 일반 매장 |
| `Hotel` / `LodgingBusiness` | 숙박 |
| `MedicalClinic` | 의료기관 |
| `ProfessionalService` | 전문 서비스 |

### LocalBusiness JSON-LD 예시

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Dave's Steak House",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "서울 강남구 테헤란로 123",
    "addressLocality": "서울",
    "addressRegion": "서울특별시",
    "postalCode": "06234",
    "addressCountry": "KR"
  },
  "telephone": "+82-2-1234-5678",
  "url": "https://example.com",
  "priceRange": "$$",
  "servesCuisine": ["Steak", "American"],
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 37.50123,
    "longitude": 127.04567
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "11:00",
      "closes": "22:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday", "Sunday"],
      "opens": "12:00",
      "closes": "23:00"
    }
  ]
}
```

### openingHoursSpecification 특수 케이스

- 24시간 영업: `opens: "00:00"`, `closes: "23:59"`
- 휴무일: `opens: "00:00"`, `closes: "00:00"`

### geo 좌표 정밀도

- `latitude` / `longitude`는 소수점 5자리 이상 권장
- 부정확하면 지도 표시 위치가 어긋남

### 흔한 실수

- 두 개 이상 매장이 있는데 `Organization` 하나만 쓰고 매장 정보 누락 → 매장별 `LocalBusiness` 노드 분리
- `address`를 문자열로 → 반드시 `PostalAddress` 객체
- 시간을 "오전 11시" 자연어로 → 24시간제 `"11:00"` 문자열

---

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
