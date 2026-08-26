---
name: ecommerce-seo
description: >
  이커머스(쇼핑몰) SEO 전문 가이드. 상품·카테고리·검색·페이지네이션·재고·faceted navigation 처리 패턴.
  Product Schema(JSON-LD), Merchant listings, 필터 URL 중복 콘텐츠, 재고 변경 대응을 포함한다.
  <example>사용자: "이커머스 상품 페이지 SEO 어떻게 잡지?"</example>
  <example>사용자: "필터/색상/사이즈 조합으로 URL이 수만 개 생기는데 어떻게 처리?"</example>
  <example>사용자: "재고 없는 상품 페이지를 삭제해야 하나?"</example>
---

# 이커머스 SEO 스킬

> 소스:
> - Google Search Central — Faceted Navigation: https://developers.google.com/search/docs/crawling-indexing/crawling-managing-faceted-navigation
> - Google Search Central — Product Structured Data: https://developers.google.com/search/docs/appearance/structured-data/product
> - Google Search Central — Merchant Listing Structured Data: https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
> - Google Search Central — Merchant Return Policy (MerchantReturnPolicy): https://developers.google.com/search/docs/appearance/structured-data/return-policy
> - Google Search Central — Merchant Shipping Policy (ShippingService): https://developers.google.com/search/docs/appearance/structured-data/shipping-policy
> - Google Search Central — Mobile-first Indexing Best Practices (separate URLs): https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing
> - Google Merchant Center Help — Set up structured data for Merchant Center: https://support.google.com/merchants/answer/7331077
> - Google Merchant Center Help — Automatic item updates: https://support.google.com/merchants/answer/12157888
> - Google Merchant Center Help — Inaccurate price (feed ↔ 랜딩페이지 불일치): https://support.google.com/merchants/answer/9773429
> - Google Search Central Blog — rel=prev/next 미사용 발표 (2019-03-21): https://twitter.com/googlewmc (Webmaster Trends Analyst 발표)
> - schema.org — ItemAvailability: https://schema.org/ItemAvailability
> - schema.org — Product: https://schema.org/Product
> - Google Search Central — Block Indexing with noindex: https://developers.google.com/search/docs/crawling-indexing/block-indexing
> 검증일: 2026-08-26 (갱신 — §2에 `offers.shippingDetails`·`offers.hasMerchantReturnPolicy` 추가, §7 Merchant Center 피드↔페이지 불일치 지위 정정, §8 분리 모바일 호스트 canonical 추가, Organization↔Product `@graph` 참조 예시 추가. 최초 작성 2026-06-04)

---

## 1. 상품 페이지 최적화

| 요소 | 권장 패턴 |
|------|-----------|
| `<title>` | `{상품명} - {브랜드} | {사이트명}` (전체 60자 이내) |
| meta description | 핵심 스펙·혜택·CTA 포함, 150~160자 |
| H1 | 상품명 1개만. 페이지 내 H1 중복 금지 |
| 이미지 alt | 상품명 + 색상/사이즈/모델명. 복수 이미지마다 고유 alt |
| Open Graph | `og:title`, `og:image`, `og:price:amount`, `og:price:currency` |

### 재고·단종 처리 (가장 흔한 실수 영역)

| 상황 | 권장 처리 |
|------|-----------|
| 일시 품절 (재입고 예정) | 페이지 유지 + Schema `availability: OutOfStock` + 재입고 알림 폼 + 대체 상품 링크 |
| 영구 단종 (대체 상품 있음) | 대체 상품 URL로 **301 리다이렉트** |
| 영구 단종 (대체 없음) | 카테고리 페이지로 301, 또는 페이지 유지 + `availability: Discontinued` |
| 단순 삭제 (404) | 외부 백링크·내부 링크 자산 손실 → 비권장 |

> 주의: 품절 페이지를 noindex 처리하면 재입고 시 색인 회복까지 수 주가 걸린다. `availability` 만 업데이트해 색인 유지하는 편이 안전하다.

### 가격 변경

- Schema `priceValidUntil` 날짜를 정기적으로 갱신한다. 만료일이 지나면 Google Merchant Center가 가격 정보를 무효로 처리할 수 있다.
- OG 태그(`og:price:amount`)는 외부 SNS에 캐시되므로 가격 변경 후 페이스북 Sharing Debugger 등으로 캐시 초기화한다.
- 페이지 내 가격 텍스트는 서버 렌더링으로 출력 (CSR로 가격만 나중에 그리면 크롤러가 빈 가격을 색인할 수 있음).

---

## 2. Product Schema (JSON-LD)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "에어맥스 270 블랙",
  "image": [
    "https://example.com/img/270-black-1.jpg",
    "https://example.com/img/270-black-2.jpg"
  ],
  "description": "쿠셔닝이 강화된 데일리 운동화",
  "sku": "AM270-BLK-270",
  "brand": { "@type": "Brand", "name": "Nike" },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/product/airmax-270-black",
    "priceCurrency": "KRW",
    "price": 159000,
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "priceValidUntil": "2026-12-31",
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": 3000,
        "currency": "KRW"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "KR"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": 0,
          "maxValue": 1,
          "unitCode": "DAY"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 1,
          "maxValue": 3,
          "unitCode": "DAY"
        }
      }
    },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "KR",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 7,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/ReturnShippingFees",
      "returnShippingFeesAmount": {
        "@type": "MonetaryAmount",
        "value": 3000,
        "currency": "KRW"
      }
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.5,
    "reviewCount": 128
  }
}
</script>
```

### availability 값 (schema.org 공식)

| 값 | 의미 | 사용 시점 |
|----|------|-----------|
| `InStock` | 재고 있음 | 일반 판매 중 |
| `OutOfStock` | 재고 없음 | 일시 품절 |
| `PreOrder` | 사전 주문 | 출시 전 예약 |
| `BackOrder` | 예약 주문 (생산 후 발송) | 제조 대기 |
| `Discontinued` | 단종 | 영구 판매 종료 |
| `SoldOut` | 매진 | 한정 수량 종료 |
| `LimitedAvailability` | 한정 수량 | 잔여 수량 적음 |

> 주의: 값은 case-sensitive. `https://schema.org/InStock` 형식 전체 URL로 작성한다.

### aggregateRating 사용 규칙

- **실제 리뷰가 존재해야 한다.** 리뷰 없는 상태에서 `aggregateRating`만 삽입하면 Google 스팸 정책 위반 (구조화 데이터 수동 조치 가능).
- 개별 `Review` 객체와 `aggregateRating`은 함께 사용 가능.
- 리뷰가 0개이거나 평점이 없으면 `aggregateRating` 자체를 출력하지 않는다.

### priceValidUntil

- 미래 날짜 (YYYY-MM-DD 형식) 권장. 만료일 이후에는 Google이 리치 결과에서 가격을 제외할 수 있다.
- 세일·할인 종료일을 명시하는 용도. 정상가는 보통 1년 후 날짜로 설정.

### offers.shippingDetails (OfferShippingDetails)

`shippingDetails` 자체는 `Offer`의 **recommended** 속성이다. 단, **넣기로 했다면** 아래 required 속성을 반드시 채워야 한다 (merchant listing 리치 결과의 배송비 표시 조건).

| 속성 | 타입 | 지위 | 값 규칙 |
|------|------|------|---------|
| `shippingRate` | `MonetaryAmount` (`value`, `currency`) | Required | 배송비. 무료면 `value: 0` |
| `shippingDestination` | `DefinedRegion` (`addressCountry`, 선택 `addressRegion`) | Required | `addressCountry`는 ISO 3166-1 alpha-2 (`"KR"`) |
| `deliveryTime` | `ShippingDeliveryTime` | Recommended | 아래 `handlingTime`·`transitTime`을 담는 컨테이너 |
| `deliveryTime.handlingTime` | `QuantitativeValue` (`minValue`·`maxValue`·`unitCode: "DAY"`) | Recommended | 주문 후 출고까지 영업일 |
| `deliveryTime.transitTime` | `QuantitativeValue` (동일) | Recommended | 출고 후 도착까지 영업일 |
| `shippingLabel` / `shippingOrigin` / `shippingSettingsLink` / `doesNotShip` | — | Recommended | 다중 배송 정책·미배송 지역 표기용 |

- 배송 정책이 상품별로 다르지 않다면, Google은 **`Organization` 마크업의 전역 배송 정책**(`ShippingService` + `shippingConditions`)이나 Merchant Center 설정으로 제공하는 쪽을 권장한다. Offer 레벨 속성은 조직 레벨 속성의 **부분집합**이다.
- `shippingDetails`는 배열로 여러 개 넣어 지역·요금제별로 나눌 수 있다.

> 주의: Search Central의 merchant listing 문서는 `shippingRate`·`shippingDestination` 둘 다 required로 표기하지만, Merchant Center의 "지원되는 구조화 데이터 속성" 표는 `shippingDestination.addressCountry`만 required로 표기한다. 두 표기가 어긋나므로 **둘 다 채우는 것이 안전**하다.

### offers.hasMerchantReturnPolicy (MerchantReturnPolicy)

`hasMerchantReturnPolicy`도 `Offer`의 **recommended** 속성이며, 넣으면 아래 required 속성이 따라온다.

| 속성 | 지위 | 값 규칙 |
|------|------|---------|
| `applicableCountry` | **Required** | 반품 정책이 적용되는(= 상품이 판매·반송 출발하는) 국가. ISO 3166-1 alpha-2. 배열 허용 |
| `returnPolicyCategory` | **Required** | `https://schema.org/MerchantReturnFiniteReturnWindow` / `MerchantReturnNotPermitted` / `MerchantReturnUnlimitedWindow` |
| `merchantReturnDays` | FiniteReturnWindow일 때 Required | 반품 가능 일수 (숫자) |
| `returnMethod` | Recommended | `ReturnByMail` / `ReturnInStore` / `ReturnAtKiosk` |
| `returnFees` | Recommended | `FreeReturn` / `ReturnShippingFees` / `ReturnFeesCustomerResponsibility` |
| `returnShippingFeesAmount` | `returnFees`가 `ReturnShippingFees`일 때만 | `MonetaryAmount` |

**`applicableCountry` vs `returnPolicyCountry`**

- **required는 `applicableCountry`다.** `returnPolicyCountry`(상품을 실제로 반송해 보내는 국가)는 **recommended**이며, 조직(Organization) 레벨 반품 정책 마크업에서 지원된다.
- Offer 레벨에서 Google이 지원하는 반품 속성은 조직 레벨의 **부분집합**이며, 여기에는 `returnPolicyCountry`가 포함되지 않는다. 판매국과 반송 도착국이 다른 크로스보더 판매라면 조직 레벨 마크업에 `returnPolicyCountry`를 추가한다.

> 주의: 2025-03 시점 다수의 3rd-party 기사가 "`returnPolicyCountry`가 required가 됐다"고 보도했으나, 실제 문서 변경은 **Google이 예제 JSON-LD에 `returnPolicyCountry`를 추가한 것**이고 required 목록은 `applicableCountry` + `returnPolicyCategory`(또는 `merchantReturnLink`)로 유지되고 있다. 현행 공식 문서 기준으로 작성할 것.

> 주의: 미검증 — "2025-03부터 모든 판매자에게 반품 정책 제공이 필수화됐다"는 취지의 **공식 발표는 확인되지 않았다**. 확인 가능한 것은 Merchant Center 가이드라인의 상시 요구사항("반품 정책 정보를 상품 데이터에 추가하고 웹사이트에서 쉽게 찾을 수 있게 할 것. 반품·환불을 제공하지 않더라도 그 사실을 명시할 것")뿐이다.

### Organization ↔ Product `@id` 참조 (`@graph`)

전역 정책(반품·배송)은 `Organization`/`OnlineStore`에 한 번 정의하고, 상품 페이지에서는 `@id`로 참조해 중복을 없앤다. (패턴 상세 → `frontend/schema-org-patterns`)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "OnlineStore",
      "@id": "https://example.com/#org",
      "name": "예시 스토어",
      "url": "https://example.com",
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "KR",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7
      }
    },
    {
      "@type": "Product",
      "@id": "https://example.com/product/airmax-270-black#product",
      "name": "에어맥스 270 블랙",
      "offers": {
        "@type": "Offer",
        "url": "https://example.com/product/airmax-270-black",
        "priceCurrency": "KRW",
        "price": 159000,
        "availability": "https://schema.org/InStock",
        "seller": { "@id": "https://example.com/#org" }
      }
    }
  ]
}
```

---

## 3. 카테고리 페이지

- **H1**: 카테고리 키워드 포함 (예: "여성 운동화", "런닝화 추천")
- **카테고리 설명 텍스트 400단어 이상** 권장. 상품 그리드만 있으면 thin content로 평가될 수 있다.
- **BreadcrumbList Schema** 필수:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://example.com" },
    { "@type": "ListItem", "position": 2, "name": "신발", "item": "https://example.com/shoes" },
    { "@type": "ListItem", "position": 3, "name": "운동화", "item": "https://example.com/shoes/sneakers" }
  ]
}
```

### 정렬 옵션 처리

`?sort=popular`, `?sort=price-asc` 등 정렬 URL은 동일 상품 목록의 순서만 다르므로:

- 모든 정렬 변종에서 canonical → 기본 정렬 URL (보통 `?sort=popular` 또는 파라미터 없는 URL)
- 정렬 변종 자체는 robots.txt 차단 또는 noindex 권장

---

## 4. 페이지네이션 (rel=prev/next 지원 중단)

Google은 **2019년 3월** `rel="prev"` / `rel="next"`를 인덱싱 신호로 사용하지 않는다고 공식 발표했다. 실제로는 그 이전부터 미사용 상태였다.

### 현재 권장 패턴

| 페이지 | canonical | robots |
|--------|-----------|--------|
| `/category/shoes` (1페이지) | self (`/category/shoes`) | index, follow |
| `/category/shoes?page=2` | self (`/category/shoes?page=2`) | index, follow |
| `/category/shoes?page=N` | self | index, follow |

- 각 페이지는 self-referencing canonical 유지. 1페이지로 canonical 통일하면 2~N의 상품이 색인 누락.
- 2페이지 이후에 `noindex`를 거는 것은 잘못된 관행 — 상품 색인 자체가 막힌다.
- `rel="prev/next"`는 SEO 효과가 없지만 W3C 표준·접근성 목적으로 두어도 무방. Bing은 여전히 힌트로 사용.

### 무한 스크롤

- 페이지네이션 URL을 병행 제공 (예: 스크롤 시 `pushState`로 `?page=2` 갱신).
- 크롤러가 JS 없이도 페이지 2~N에 접근 가능해야 한다.

### View All 페이지

- 단일 페이지에 전체 상품을 로딩해도 성능 문제가 없으면, 페이지네이션 URL들의 canonical을 View All로 지정 가능 (Google 가이드).

---

## 5. Faceted Navigation (필터링) — 가장 중요한 영역

문제: `/shoes?color=red&size=270&brand=nike` 같은 필터 조합이 수천~수만 URL을 생성. 크롤링 예산 낭비 + 중복 콘텐츠 + 색인 비대화.

### Google 공식 권장 (Search Central)

**색인이 불필요한 경우 (대부분):**

```
# robots.txt 예시
User-agent: *
Disallow: /*?*color=
Disallow: /*?*size=
Disallow: /*?*brand=
```

- robots.txt 차단이 **가장 효과적**. 크롤링 예산을 보호한다.
- 단, robots.txt로 차단된 URL은 PageRank가 흐르지 않는다. SEO 가치 있는 필터 조합은 별도 처리.

**색인은 막되 내부 링크 가치는 유지하고 싶을 때:**

```html
<meta name="robots" content="noindex, follow">
```

- 크롤링은 허용 → 내부 링크 PageRank 흐름 유지.
- 단, 크롤링 예산은 소모된다.

**URL Fragment 사용 (대안):**

- `#color=red` 같은 fragment는 Google이 크롤링·색인하지 않는다.
- 필터 URL 폭발 자체를 방지하지만, 공유·북마크 시 필터 상태 유지가 필요하면 적합.

### Google이 제시한 추가 베스트 프랙티스

| 항목 | 권장 |
|------|------|
| 파라미터 구분자 | 표준 `&` 사용. `,`·`;`·`[]` 같은 비표준 구분자 금지 |
| 필터 순서 | URL 경로로 인코딩 시 항상 동일한 순서 유지 (`/products/fish/green/tiny`) |
| 빈 결과 | 결과 없는 필터 조합은 **HTTP 404** 반환 (리다이렉트 금지) |
| 중복 필터 | `?color=red&color=red` 같은 중복 발생하지 않게 |

### SEO 가치 있는 필터 조합

"나이키 운동화 270mm" 같이 검색 수요가 있는 필터 조합은 별도 랜딩 페이지로 만들어 색인 허용:

- URL: `/shoes/nike/270` (쿼리 파라미터 대신 path)
- 고유 H1, 고유 description
- self-referencing canonical
- 필터 UI에서도 해당 조합 선택 시 이 URL로 이동

---

## 6. 내부 검색 결과 페이지

- `/search?q=나이키`, `/search?q=운동화` 같은 내부 검색 결과는 **기본적으로 noindex** 권장 (Google 공식).
- 이유: 검색 쿼리는 무한히 생성 가능 → 색인 비대화 + 카테고리 페이지와의 키워드 경쟁.

```html
<meta name="robots" content="noindex, follow">
```

- `noindex, follow`로 설정해 검색 결과 페이지에서 상품 페이지로의 링크 가치는 유지.
- 단, 트래픽이 높은 자체 검색 키워드(예: 매주 1,000건 검색)는 별도 랜딩 페이지로 전환 고려.

---

## 7. 재고·가격 실시간 변동 대응

| 변동 항목 | Schema 업데이트 | 추가 작업 |
|-----------|----------------|-----------|
| 가격 변경 | `offers.price`, `priceValidUntil` | OG 캐시 초기화 (Facebook Sharing Debugger 등) |
| 재고 소진 | `availability: OutOfStock` | 재입고 알림 폼 노출, 대체 상품 링크 |
| 재입고 | `availability: InStock` | 페이지 그대로 유지 (URL 변경 금지) |
| 단종 | `availability: Discontinued` 또는 301 | 대체 상품으로 301 권장 |

- 동적 가격은 서버 렌더링 + Schema에 즉시 반영. CSR로 가격만 나중에 그리지 말 것.

### Merchant Center 피드 ↔ 페이지 구조화 데이터 불일치의 현재 지위

3rd-party 요약이 아니라 Merchant Center 공식 도움말 기준으로 정리하면 다음과 같다.

| 항목 | 공식 내용 |
|------|-----------|
| 구조화 데이터 자체 | Search의 리치 결과와 달리, Merchant Center에서는 **랜딩페이지 구조화 데이터가 승인의 필수 조건은 아니다**. 구조화 데이터가 없거나 불완전하면 Google이 "advanced data extractors"로 페이지에서 값을 추출한다 |
| 자동 항목 업데이트(automatic item updates) | 랜딩페이지에서 읽은 값으로 **`price`·`sale price`·`availability`·`condition`** 을 자동 보정한다. 이 4개가 자동 업데이트 대상 |
| 자동 업데이트를 끄면 | "상품이 item-level 비승인 대상이 된다". 추출기가 가격·재고·상태를 판별하지 못하는 경우에도 동일하게 item-level 비승인 |
| 피드 ↔ 랜딩페이지 불일치 | 가격 불일치 시 **상품 비승인 + 계정 경고**로 이어지며, 재심사에는 대기 기간이 있다. 공식 해결 가이드가 "가격·재고 속성을 랜딩페이지의 구조화 데이터(JSON-LD/Microdata)와 일치시키라"고 명시 |
| 자동 업데이트가 커버하지 않는 것 | 제목·설명·GTIN·배송 속성 등은 자동 보정 대상이 아니므로 피드에서 직접 맞춰야 한다 |

정리: **"불일치 = 즉시 광고 계정 정지"가 아니라, 상품 단위 비승인 + 계정 경고**가 기본 제재이며, 자동 항목 업데이트가 완충 장치로 동작한다. 자동 업데이트를 신뢰하지 말고 피드·페이지·구조화 데이터 세 곳의 `price`/`availability`를 동일 소스에서 렌더링하는 것이 정답이다.

> 주의: 구조화 데이터의 값은 "사용자에게 실제로 보이는 값"과 같아야 한다. 할인가가 노출 중이면 구조화 데이터에도 할인가를 넣는다. 회원 등급·지역에 따라 가격이 달라지는 랜딩페이지는 Merchant Center가 매칭에 실패한다.

---

## 8. 사이트 구조 · URL 패턴

```
/                                       (홈)
├── /category/{대분류}                   예: /category/shoes
│   └── /category/{대분류}/{소분류}      예: /category/shoes/sneakers
│       └── /product/{슬러그}            예: /product/airmax-270-black
└── /search?q={쿼리}                     (noindex)
```

### 슬러그 규칙

- 영문 소문자 + 하이픈: `airmax-270-black`
- 한글 슬러그 (`/product/에어맥스-270`)는 URL 인코딩(`%EC%97%90...`)으로 변환되어 가독성·복사 시 문제. 영문 권장.
- 슬러그에 상품 ID 포함 시 검색 키워드 우선 (예: `airmax-270-black-a1234` 보다 `airmax-270-black`).

### 분리 모바일 호스트(m. / www.)

- **`m.` 상품 페이지의 canonical은 대응하는 `www.` Product URL을 가리켜야 하고**, `www.` 쪽에는 `<link rel="alternate" media="only screen and (max-width: 640px)" href="https://m.example.com/...">`를 넣어 1:1 양방향 주석을 유지한다 (Google mobile-first indexing 가이드). 상세 → `frontend/mobile-seo-pwa`
- 구조화 데이터는 두 호스트에 **동일하게** 넣되, 구조화 데이터 안의 URL은 각 호스트 URL로 맞춘다 (모바일 마크업의 `offers.url`은 `m.` URL).

### URL 변경 금지

- 상품 URL이 바뀌면 외부 백링크·소셜 공유 모두 끊긴다. 부득이할 경우 **반드시 301 영구 리다이렉트**.
- 카테고리 이름 변경 시에도 동일.

---

## 9. 이커머스 특화 흔한 실수

| 실수 | 영향 | 해결 |
|------|------|------|
| 공급업체 제공 동일 상품 설명 그대로 사용 | Duplicate Content, 색인 누락 | 자체 설명 작성, 사용 후기·스펙 표 추가 |
| 단종 상품 404 처리 | 백링크·내부 링크 자산 손실 | 301 리다이렉트 또는 페이지 유지 + `Discontinued` |
| 카테고리 페이지에 텍스트 없이 상품 그리드만 | Thin content 평가 | H1 + 400단어 이상 카테고리 설명 |
| 필터 URL을 robots.txt로 막지 않음 | 크롤링 예산 낭비, 색인 비대화 | robots.txt Disallow 또는 noindex |
| 리뷰 없이 `aggregateRating` Schema 삽입 | 구조화 데이터 수동 조치 (스팸 정책 위반) | 리뷰 있을 때만 출력 |
| 페이지 2~N에 noindex | 상품 색인 누락 | self-referencing canonical 유지, noindex 제거 |
| OG 가격 변경 후 캐시 미초기화 | SNS 공유 시 옛 가격 표시 | Facebook Sharing Debugger로 캐시 초기화 |
| 가격을 CSR로 늦게 렌더링 | 크롤러가 빈 가격 색인 | 서버 렌더링 필수 |
| 상품 URL 임의 변경 | 외부 백링크 손실 | 변경 시 반드시 301 |
| 한글 슬러그 사용 | URL 인코딩 문제, 복사·공유 불편 | 영문 슬러그 |

---

## 10. 점검 체크리스트

- [ ] 상품 페이지: title 60자 이내, description 150~160자, H1 1개
- [ ] Product Schema JSON-LD에 `name`, `image`, `offers.price`, `priceCurrency`, `availability` 포함
- [ ] merchant listing 대상이면 `offers.shippingDetails`(`shippingRate`+`shippingDestination`)와 `offers.hasMerchantReturnPolicy`(`applicableCountry`+`returnPolicyCategory`, finite면 `merchantReturnDays`) 포함
- [ ] 분리 모바일 호스트: `m.` 상품 페이지 canonical → `www.` Product URL, `www.`에 `rel="alternate" media=...`
- [ ] `aggregateRating`은 실제 리뷰가 있을 때만 출력
- [ ] 카테고리 페이지: H1 + 400단어 이상 설명 + BreadcrumbList
- [ ] 페이지네이션: 모든 페이지 self-referencing canonical, noindex 없음
- [ ] 필터 URL: 색인 불필요한 조합은 robots.txt 차단
- [ ] 내부 검색: `noindex, follow`
- [ ] 품절·단종: 페이지 유지 또는 301, 404 처리 지양
- [ ] 슬러그: 영문 소문자 + 하이픈
- [ ] OG 가격 변경 시 캐시 초기화
