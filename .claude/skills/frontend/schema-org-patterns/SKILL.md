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

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
