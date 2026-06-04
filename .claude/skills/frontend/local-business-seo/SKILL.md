---
name: local-business-seo
description: >
  오프라인 매장·지역 사업체 SEO 가이드. Google Business Profile·네이버 플레이스·LocalBusiness Schema·NAP 일관성·리뷰 관리.
  <example>사용자: "오프라인 카페 LocalBusiness Schema 어떻게 작성해?"</example>
  <example>사용자: "Google Business Profile과 네이버 플레이스 둘 다 등록해야 해?"</example>
  <example>사용자: "지점이 여러 개인데 SEO 어떻게 구성해?"</example>
---

# 로컬 비즈니스 SEO (Local Business SEO)

> 소스:
> - schema.org LocalBusiness — https://schema.org/LocalBusiness
> - schema.org OpeningHoursSpecification — https://schema.org/OpeningHoursSpecification
> - Google Search Central: Local Business structured data — https://developers.google.com/search/docs/appearance/structured-data/local-business
> - Google Business Profile Help — https://support.google.com/business/answer/7249669
> - Google Search Central Blog (2019): Making Review Rich Results more helpful — https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful
> - Naver Business — https://business.naver.com
>
> 검증일: 2026-06-04

오프라인 매장·지역 서비스업이 Google·네이버·카카오 지역 검색에서 노출되기 위한 통합 가이드. 한국 시장 특성(네이버 점유율·영수증 리뷰·국제 전화번호 형식)을 반영한다.

---

## 1. NAP 일관성 (Name·Address·Phone)

**NAP**: 사업체 이름·주소·전화번호 세 가지 정보를 모든 채널에서 **완전히 동일한 표기**로 통일하는 원칙. 로컬 SEO의 가장 기본적인 신호다.

### 불일치 사례

| 항목 | 잘못된 예 (불일치) |
|------|--------------------|
| 사업체 이름 | `㈜ABC` vs `ABC 주식회사` vs `(주)ABC` |
| 전화번호 | `02-1234-5678` vs `0212345678` vs `+82-2-1234-5678` |
| 주소 표기 | `강남대로 123` vs `강남구 강남대로 123, 4층` |

### 동기화해야 할 위치

- 웹사이트 footer·About·Contact 페이지
- Google Business Profile (GBP)
- 네이버 플레이스 (스마트플레이스)
- 카카오맵 장소 정보
- 디렉토리 사이트 (다음 지도, 식신, 망고플레이트 등)
- 소셜 미디어 프로필 (Instagram·Facebook 사업체 정보)

### 한국 특화 권장

- 웹사이트 사용자 표기는 국내 형식 `02-1234-5678` 유지
- **LocalBusiness Schema의 `telephone` 필드는 국제 형식 `+82-2-1234-5678` 사용** (Google 가이드라인: "include the country code and area code")
- 사업자등록증 상호와 웹사이트 표기 일치 (정관상 명칭이 `㈜`이면 GBP·플레이스에서도 `㈜`로 통일)

---

## 2. LocalBusiness Schema (JSON-LD)

Google이 권장하는 구조화 데이터 형식은 **JSON-LD**이며, `<script type="application/ld+json">` 태그로 삽입한다. `head` 또는 `body` 어디에 두어도 무방하다.

### 필수 속성 (Google 공식)

| 속성 | 설명 |
|------|------|
| `name` | 사업체 이름 (텍스트) |
| `address` | `PostalAddress` 객체 (전체 주소) |

### 권장 속성

| 속성 | 설명 |
|------|------|
| `telephone` | 국가 코드 + 지역 코드 포함 (`+82-2-...`) |
| `geo` | 위·경도 (`GeoCoordinates`, **소수점 5자리 이상** 권장) |
| `url` | 사업체 공식 URL |
| `openingHoursSpecification` | 영업시간 |
| `priceRange` | 가격대 (예: `₩₩`, `$$`, `$10-20`) — 100자 미만 |
| `image` | 사업체 대표 이미지 URL |

### 기본 예시 (카페)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  "name": "한국 카페",
  "image": "https://example.com/cafe.jpg",
  "url": "https://example.com",
  "telephone": "+82-2-1234-5678",
  "priceRange": "₩₩",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "강남대로 123",
    "addressLocality": "강남구",
    "addressRegion": "서울특별시",
    "postalCode": "06000",
    "addressCountry": "KR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 37.50130,
    "longitude": 127.02700
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "22:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday", "Sunday"],
      "opens": "10:00",
      "closes": "23:00"
    }
  ]
}
</script>
```

### 세부 유형 선택 (Subtype)

Google은 **가장 구체적인 subtype 사용**을 명시적으로 권장한다 (LocalBusiness 그대로 사용 비권장).

| 업종 | 권장 `@type` |
|------|--------------|
| 음식점 | `Restaurant` (FoodEstablishment 하위) |
| 카페 | `CafeOrCoffeeShop` |
| 병원·의원 | `Hospital`, `Dentist`, `MedicalClinic` |
| 법무·세무 | `LegalService`, `AccountingService` |
| 미용·스파 | `BeautySalon`, `DaySpa`, `HairSalon` |
| 일반 상점 | `Store`, `ClothingStore`, `BookStore` |
| 기술 서비스 | `Electrician`, `Plumber`, `Locksmith` |
| 헬스장 | `HealthClub`, `SportsClub` |
| 약국 | `Pharmacy` |
| 금융 서비스 | `FinancialService`, `BankOrCreditUnion` |

schema.org 기준 LocalBusiness는 35개 이상의 specialized subtype을 갖는다.

### openingHoursSpecification 형식

- 시간 형식: **24시간 표기 `HH:MM` 또는 `HH:MM:SS`**
- `dayOfWeek`: schema.org의 `DayOfWeek` 값 (`Monday`, `Tuesday`, ..., `Sunday`) — 배열로 묶어 동일 시간대를 그룹화 가능
- **자정을 넘는 영업** (예: 23:00 ~ 02:00): 단일 `OpeningHoursSpecification`으로 작성. `closes`가 `opens`보다 작으면 다음 날까지 이어지는 것으로 해석됨
- **24시간 영업**: `opens: "00:00"`, `closes: "23:59"`

### priceRange 표기

| 표기 | 의미 |
|------|------|
| `₩` / `$` | 저가 |
| `₩₩` / `$$` | 중간 |
| `₩₩₩` / `$$$` | 고가 |
| `$10-20` | 구체 금액 범위 (100자 미만) |

> 주의: schema.org 표준에는 통화 기호 규정이 없다. Google·schema.org 공식 예시는 `$` 기호를 사용한다. 한국 통화 표기 `₩`을 사용해도 무방하나, 일관성을 위해 한 사이트 내에서 통일한다.

---

## 3. Google Business Profile (GBP)

### 카테고리 제한 (공식)

- **기본 카테고리(Primary)**: 1개
- **추가 카테고리(Additional)**: 최대 9개
- **총 10개**까지 선택 가능

> 권장: 모든 슬롯을 채우지 말 것. 가장 구체적인 기본 카테고리 1개 + 정말 관련 있는 추가 카테고리 2~3개. 무관한 카테고리 채워 넣기(category stuffing)는 Google 품질 검토에서 정지 사유가 된다.

### 사진 (최소 권장량)

- 커버 사진·로고: 필수
- 외부 / 내부 / 제품 / 팀: 각 카테고리별 최소 1장씩, **총 5장 이상**

### Google Posts

- 이벤트·신메뉴·할인 등을 직접 게시 가능
- 주 1~2회 업데이트 권장

### Q&A·예약·리뷰 응답

- Q&A: 자주 묻는 질문은 사업주가 사전에 등록 가능
- 예약 링크: Reserve with Google·외부 예약 시스템 연동 가능
- **모든 리뷰에 응답** — 부정 리뷰도 정중하게 응답. 응답률은 사용자 신뢰와 직결됨

### 한국 사업체 특이사항

- 한국 주소는 Google Maps 표기 시 한국어 + 영어 병기를 권장 (해외 사용자 접근성)
- 일부 카테고리(예: `Korean Restaurant`, `BBQ Restaurant`)는 한국 특화

---

## 4. 네이버 플레이스 (스마트플레이스)

### 개요

- **네이버 플레이스**: 네이버 지도·통합검색 "장소" 탭에 노출되는 사업체 정보
- **스마트플레이스**(SmartPlace): 사업주가 직접 사업체 정보를 등록·관리하는 도구
- 등록 진입점: **`business.naver.com`** → 스마트플레이스 메뉴
- 한국 검색 시장에서 네이버 점유율이 높아, 국내 오프라인 사업체는 **GBP보다 네이버 플레이스 우선도가 높을 수 있다**

### 등록 시 필요한 정보

- 사업자등록증 (한국 법인·개인사업자 등록 번호)
- 업종 카테고리
- 영업시간·휴무일
- 대표 사진·메뉴·가격표
- 결제 수단 (네이버페이 연동 가능)

### 정기 업데이트 항목

- 영업시간·임시 휴무 (명절·휴가)
- 신메뉴·가격 변동
- 사진 (최신 인테리어·신메뉴)
- 이벤트·할인 (네이버 톡톡 알림 가능)

### 네이버 예약·주문 연동

- 음식점·카페·미용실 등은 **네이버 예약** 직접 연동 가능
- 네이버 주문 (배달·포장)도 일부 업종 지원

### 영수증 리뷰

- **영수증 리뷰**: 네이버 사용자가 실제 매장 영수증을 인증한 후 작성하는 리뷰
- 인증 방식 (두 가지):
  1. **영수증 카메라 촬영**: 매장명·결제일시·금액이 인식되어 자동 매장 매칭
  2. **네이버페이 결제 자동 인증**: 결제 내역 기반 자동 인증
- 별점 + 구체적 메뉴·서비스 후기 조합이 신뢰도 높음
- 위조·허위 리뷰 차단에 유리한 구조

### 외국 사업체 주의

- 한국 사업자등록증 없이 스마트플레이스 등록·광고 계정 생성에 제약이 있음
- 외국 법인은 한국 지사·현지 에이전시 협력이 일반적

---

## 5. 카카오맵 등록

- **카카오맵**: 카카오의 지도·로컬 검색 서비스 (카카오 로컬 API 기반)
- 사업주가 장소 정보를 신청·수정하면 카카오 운영팀이 검토 후 반영
- 정확한 사업체명·주소·영업시간·연락처·카테고리 입력
- 매장 외관·내부·대표 메뉴 사진 업로드로 신뢰도 향상
- 카카오톡 공유 시 장소 미리보기 카드에 정보가 자동 반영됨
- 리뷰: 사용자가 직접 작성. 사장 응답 기능 제공

---

## 6. 다중 지점 (Multi-Location) SEO

체인·프랜차이즈처럼 지점이 여러 개일 때 권장 구조.

### 페이지 구조

```
/locations              ← 지점 목록 페이지 (전체 지점 링크)
/locations/gangnam      ← 강남점 (독립 페이지)
/locations/hongdae      ← 홍대점 (독립 페이지)
/locations/busan-seomyeon ← 부산 서면점
```

### 지점별 페이지 필수 요소

- **고유한 콘텐츠** (중복 콘텐츠 방지) — 지점 설명·교통·주차·인근 정보·지점장 인사말·지점 한정 메뉴 등
- 지점별 **LocalBusiness Schema 별도 삽입** (각 지점의 주소·전화·영업시간 반영)
- 지점별 사진 (외관·내부)
- 해당 지점 영업시간·휴무
- 해당 지점 GBP·네이버 플레이스 링크

### 본사·지점 관계 표현

- 본사 페이지: `Organization` 또는 상위 `LocalBusiness` Schema
- 지점 페이지: 각 지점별 `LocalBusiness` Schema에 `parentOrganization` 또는 `branchOf` 속성으로 본사 연결 가능

> 주의: hreflang은 다국어·다지역(국가 단위) 처리에 사용한다. 국내 다중 지점은 hreflang이 아니라 **지점별 고유 URL + 독립 LocalBusiness Schema**로 해결한다.

---

## 7. 리뷰 Schema — 자체 사이트 사용 시 제약

> 주의 (중요): Google은 **2019년 9월**부터 LocalBusiness·Organization (및 그 subtypes)에 대해 **자체 사이트 내 self-serving 리뷰**의 별점 리치 결과 표시를 중단했다.
> 출처: [Google Search Central Blog (2019-09-16)](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful)

### Self-serving 리뷰의 정의

사업체 A에 대한 리뷰가 **사업체 A 자신의 웹사이트**에 마크업되어 있는 경우 (직접 작성이든, 3rd-party 위젯 embed든). 사용자 이익에 반한다는 이유로 별점 리치 결과 비표시.

### 결과

- 카페 A 웹사이트에 카페 A에 대한 `aggregateRating` + `review`를 LocalBusiness Schema로 작성해도 → **검색 결과에 별점이 나타나지 않는다**
- Google Rich Results Test에서 valid 판정이 나도 SERP에는 미반영

### 대안

- **사업체 자체가 아니라 사업체가 판매하는 제품·서비스에 대한 리뷰**는 별점 표시 가능 (`Product`, `Service` Schema 등)
- 외부 리뷰 사이트가 다른 사업체에 대한 리뷰를 모은 경우는 그대로 사용 가능

### 정책 위반 패턴

- 별점만 표시하려고 `aggregateRating`만 작성하고 실제 `review` 객체는 없는 경우 → 정책 위반
- 직원·관계자가 작성한 가짜 리뷰 → 정책 위반
- 외부에서 가져온 리뷰를 자기 사이트에 마크업 → 출처 표기 없으면 신뢰도 의심

### 권장

- 별점 노출 목적이라면 **Google Business Profile 리뷰**·**네이버 영수증 리뷰**에 집중 (별점이 자연스럽게 SERP·지도에 표시됨)
- 자체 사이트 LocalBusiness Schema에는 `review`/`aggregateRating` 생략 또는 제품·서비스 단위로 이동

---

## 8. 흔한 실수

| 실수 | 영향 |
|------|------|
| 웹사이트 footer NAP과 GBP·네이버 플레이스 불일치 | 로컬 SEO 신호 약화·검색엔진 신뢰도 감소 |
| `telephone`을 국내 형식(`02-1234-5678`)으로만 표기 | Google 권장은 국가 코드 포함 (`+82-2-1234-5678`) |
| `@type: "LocalBusiness"` 그대로 사용 | Google은 가장 구체적인 subtype 권장 |
| 지점 페이지 콘텐츠 복붙 (동일 텍스트) | 중복 콘텐츠 — 검색 순위 하락 |
| 지점별 Schema 없이 본사 Schema만 작성 | 지점 정보가 로컬 검색에 매칭 안 됨 |
| 자체 사이트에 자기 사업체 `aggregateRating` 작성 후 별점 노출 기대 | 2019년 정책 이후 SERP 별점 미표시 |
| `aggregateRating`만 작성하고 `review` 없이 별점 시도 | Google 정책 위반 |
| GBP 카테고리 10개 슬롯 다 채우기 | category stuffing — 품질 검토에서 정지 사유 가능 |
| GBP·플레이스 영업시간 불일치 | 사용자 혼란·예약 취소·신뢰도 하락 |
| 부정 리뷰 무응답 | 리뷰 응답률 신호 약화·잠재 고객 이탈 |
| 영업시간 변경 후 채널 일괄 업데이트 누락 | NAP 일관성 깨짐 |
| 네이버 플레이스 미등록 (한국 사업체인데 GBP만 등록) | 국내 검색 트래픽 손실 |

---

## 9. 점검 체크리스트

### 신규 사업체 등록 시

- [ ] 사업자등록증 정보 기준으로 NAP 통일
- [ ] Google Business Profile 등록·인증 (기본 카테고리 + 추가 2~3개)
- [ ] 네이버 스마트플레이스 등록 (`business.naver.com`)
- [ ] 카카오맵 장소 등록
- [ ] 웹사이트 footer·Contact·About에 NAP 표기 통일
- [ ] LocalBusiness Schema 삽입 (가장 구체적인 subtype)
- [ ] Google Rich Results Test로 Schema 검증
- [ ] 대표 사진 5장 이상 (각 채널 동일 사진 사용 가능)
- [ ] 영업시간·휴무 정책 모든 채널 동기화

### 다중 지점 운영 시

- [ ] 지점별 고유 URL (`/locations/{name}`)
- [ ] 지점별 고유 콘텐츠 (중복 방지)
- [ ] 지점별 LocalBusiness Schema 별도 삽입
- [ ] 지점별 GBP·네이버 플레이스 등록
- [ ] 본사·지점 관계 명시 (`parentOrganization` 등)

### 운영 단계

- [ ] 영업시간 변경 시 5개 채널 동시 업데이트 (웹사이트·GBP·네이버·카카오·Schema)
- [ ] 모든 리뷰에 응답 (긍정·부정 모두)
- [ ] Google Posts 주 1~2회 업데이트
- [ ] 네이버 플레이스 사진·메뉴 분기별 점검
- [ ] LocalBusiness Schema는 자체 사이트 별점 노출이 아닌 정보 구조화 목적으로 유지
