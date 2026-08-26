---
skill: ecommerce-seo
category: frontend
version: v2
date: 2026-08-26
status: APPROVED
---

# ecommerce-seo 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `ecommerce-seo` |
| 스킬 경로 | `.claude/skills/frontend/ecommerce-seo/SKILL.md` |
| 검증일 | 2026-08-26 (갱신) / 2026-06-04 (최초) |
| 검증자 | skill-creator |
| 스킬 버전 | v2 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Google Search Central, schema.org)
- [✅] 공식 GitHub / 공식 블로그 2순위 소스 확인 (Google Search Central Blog)
- [✅] 최신 가이드 기준 내용 확인 (2026-06-04)
- [✅] 상품/카테고리/검색/페이지네이션/필터 패턴 정리
- [✅] Product Schema(JSON-LD) 예시 작성 (Offer, AggregateRating, availability)
- [✅] 흔한 실수 패턴 정리 (10개 케이스)
- [✅] SKILL.md 파일 작성

### v2 갱신 작업 (2026-08-26)

- [✅] `offers.shippingDetails`(OfferShippingDetails) required/recommended 속성 공식 확인
- [✅] `offers.hasMerchantReturnPolicy`(MerchantReturnPolicy) required/recommended 속성 공식 확인
- [✅] `applicableCountry` vs `returnPolicyCountry` required 여부 확정 (3rd-party 보도와 교차 대조)
- [✅] "2025-03 반품 정책 필수화" 주장의 공식 근거 탐색 → 미확인 처리
- [✅] Merchant Center 피드 ↔ 랜딩페이지 구조화 데이터 불일치의 현재 제재 지위 공식 확인
- [✅] 분리 모바일 호스트(m./www.) Product canonical·alternate 공식 가이드 확인
- [✅] Organization ↔ Product `@id` `@graph` 참조 예시 추가 (`frontend/schema-org-patterns` 연결)
- [✅] SKILL.md Edit 반영 + 검증일 2026-08-26 갱신 (갱신 사유 병기)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "Google rel=prev/next deprecated", "schema.org ItemAvailability", "Google Merchant priceValidUntil", "Google faceted navigation best practices", "internal search noindex" | 공식 문서 5건 + 보조 문서 다수 수집 |
| 조사 | WebFetch | developers.google.com Product structured data, faceted navigation 가이드 페이지 | 권장 처리(robots.txt / canonical / fragment / 404) 확인 |
| 교차 검증 | WebSearch | 5개 핵심 클레임을 2개 이상 독립 소스로 대조 | VERIFIED 5 / DISPUTED 0 / UNVERIFIED 0 |
| 갱신 조사 (2026-08-26) | WebFetch | Search Central: product / merchant-listing(+`#offer-shipping-details-properties` 앵커) / return-policy / shipping-policy / mobile-first indexing best practices | Offer 레벨 shipping·return required·recommended 속성표, 조직 레벨 required 옵션(applicableCountry+returnPolicyCategory 또는 merchantReturnLink), m-dot canonical·alternate 가이드 확보 |
| 갱신 조사 (2026-08-26) | WebFetch | Merchant Center Help: 구조화 데이터 설정(7331077) / 자동 항목 업데이트(12157888) / 가격 불일치 해결(9773429) / 계정 가이드라인(12756116) | 불일치 제재 = item-level 비승인 + 계정 경고, 자동 업데이트 대상 4속성(price·sale price·availability·condition) 확인 |
| 갱신 교차 검증 (2026-08-26) | WebSearch + WebFetch | `returnPolicyCountry` required 여부, OfferShippingDetails required 속성, Merchant Center 불일치 제재, 2025-03 반품 정책 정책 변경 | VERIFIED 5 / DISPUTED 1 / UNVERIFIED 1 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Google Search Central — Faceted Navigation | https://developers.google.com/search/docs/crawling-indexing/crawling-managing-faceted-navigation | ⭐⭐⭐ High | 2026-06-04 | 공식 |
| Google Search Central — Product Structured Data | https://developers.google.com/search/docs/appearance/structured-data/product | ⭐⭐⭐ High | 2026-06-04 | 공식 |
| Google Search Central — Merchant Listing Structured Data | https://developers.google.com/search/docs/appearance/structured-data/merchant-listing | ⭐⭐⭐ High | 2026-06-04 | 공식 |
| Google Search Central — Block Indexing (noindex) | https://developers.google.com/search/docs/crawling-indexing/block-indexing | ⭐⭐⭐ High | 2026-06-04 | 공식 |
| Google Search Central Blog — Crawling December: Faceted navigation | https://developers.google.com/search/blog/2024/12/crawling-december-faceted-nav | ⭐⭐⭐ High | 2026-06-04 | 공식 블로그 |
| Google Search Central Blog — Merchant Listings report | https://developers.google.com/search/blog/2022/09/merchant-listings | ⭐⭐⭐ High | 2026-06-04 | 공식 블로그 |
| schema.org — ItemAvailability | https://schema.org/ItemAvailability | ⭐⭐⭐ High | 2026-06-04 | 표준 |
| schema.org — Product | https://schema.org/Product | ⭐⭐⭐ High | 2026-06-04 | 표준 |
| Ahrefs — rel=prev/next 변경 사례 | https://ahrefs.com/blog/rel-prev-next-pagination/ | ⭐⭐ Medium | 2026-06-04 | 보조 자료 |
| OuterBox — rel=prev/next 변경 정리 | https://www.outerboxdesign.com/articles/seo/google-stopped-supporting-relprev-next/ | ⭐⭐ Medium | 2026-06-04 | 보조 자료 |

### v2 갱신 시 추가 소스 (2026-08-26)

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Google Search Central — Merchant Return Policy (MerchantReturnPolicy) | https://developers.google.com/search/docs/appearance/structured-data/return-policy | ⭐⭐⭐ High | 2026-08-26 | 공식. required/recommended 속성표 + 조직 레벨 JSON-LD 예제 |
| Google Search Central — Merchant Shipping Policy (ShippingService) | https://developers.google.com/search/docs/appearance/structured-data/shipping-policy | ⭐⭐⭐ High | 2026-08-26 | 공식. 조직 레벨 배송 정책, offer 레벨은 부분집합임을 명시 |
| Google Search Central — Merchant Listing (offer-shipping-details / merchant-return-policy 속성 섹션) | https://developers.google.com/search/docs/appearance/structured-data/merchant-listing#offer-shipping-details-properties | ⭐⭐⭐ High | 2026-08-26 | 공식. Offer 레벨 required/recommended 확정 근거 |
| Google Search Central — Mobile-first Indexing Best Practices | https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing | ⭐⭐⭐ High | 2026-08-26 | 공식. 분리 URL canonical/alternate + 구조화 데이터 동일 적용 |
| Google Merchant Center Help — Set up structured data | https://support.google.com/merchants/answer/7331077 | ⭐⭐⭐ High | 2026-08-26 | 공식. "구조화 데이터는 사용자에게 보이는 값과 일치해야 함" |
| Google Merchant Center Help — Automatic item updates | https://support.google.com/merchants/answer/12157888 | ⭐⭐⭐ High | 2026-08-26 | 공식. 자동 보정 대상 4속성, 비활성 시 item-level 비승인 |
| Google Merchant Center Help — Inaccurate price (feed↔landing page) | https://support.google.com/merchants/answer/9773429 | ⭐⭐⭐ High | 2026-08-26 | 공식. 비승인+계정 경고, 구조화 데이터와 정렬 요구 |
| Google Merchant Center Help — 계정 승인 유지 가이드라인 | https://support.google.com/merchants/answer/12756116 | ⭐⭐⭐ High | 2026-08-26 | 공식. 반품·환불 정책 명시 요구(상시 요구사항) |
| Google Merchant Center Help — 지원되는 구조화 데이터 속성 | https://support.google.com/merchants/answer/6386198 | ⭐⭐⭐ High | 2026-08-26 | 공식. shipping/return 속성 2차 대조용 |
| Search Engine Journal — 반품 정책 구조화 데이터 변경 보도 (2025-03-14) | https://www.searchenginejournal.com/google-updates-structured-data-requirements-for-return-policies/542080/ | ⭐⭐ Medium | 2026-08-26 | DISPUTED 판정 대상 (returnPolicyCountry required 주장) |
| PPC Land / Search Engine Roundtable — 동일 사안 보도 | https://ppc.land/google-updates-return-policy-structured-data-requirements-for-merchant-listings/ · https://www.seroundtable.com/google-merchant-center-returnpolicycountry-39066.html | ⭐⭐ Medium | 2026-08-26 | DISPUTED 판정 대상 (동일 주장 반복) |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전/기준일 명시 (검증일 2026-08-26 갱신, 갱신 사유 병기)
- [✅] deprecated 패턴(rel=prev/next, 페이지 2~N noindex) 권장하지 않음
- [✅] JSON-LD 예시가 그대로 적용 가능한 형태
- [✅] DISPUTED 클레임(#9) 정정 후 `> 주의:` 표기 반영
- [✅] UNVERIFIED 클레임(#10) `> 주의: 미검증` 표기 반영
- [✅] 과장 서술(Merchant Center 불일치 → 광고 차단) 공식 근거 기준으로 정정 (#11)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description, example)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (상품/카테고리/검색/페이지네이션/필터/재고)
- [✅] 코드 예시 포함 (Product Schema, BreadcrumbList, robots 메타)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (재고·단종 매트릭스)
- [✅] 흔한 실수 패턴 포함 (10개)
- [✅] 관련 스킬 상호 참조 명시 (`frontend/mobile-seo-pwa`, `frontend/schema-org-patterns`)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. 핵심 클레임 교차 검증 결과

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|----------|----------|------|
| 1 | Google은 2019-03 rel=prev/next 미사용 공식 발표 | Google Search Central Blog | Ahrefs, OuterBox, Yoast | VERIFIED |
| 2 | schema.org availability 값에 InStock/OutOfStock/PreOrder/BackOrder/Discontinued/SoldOut/LimitedAvailability 포함 | schema.org/ItemAvailability | Schema App, Squin | VERIFIED |
| 3 | priceValidUntil는 가격 유효 만료일을 YYYY-MM-DD로 표기, 만료 시 Merchant 가격 정보 무효 처리 가능 | Google Search Central Merchant Listing 가이드 | FeedArmy 등 | VERIFIED |
| 4 | 내부 검색 결과 페이지는 noindex 권장 | Google Search Central (block-indexing) | Lumar, Inflow | VERIFIED |
| 5 | Faceted navigation은 robots.txt Disallow 또는 URL fragment(#) 사용, 빈 결과 404, 표준 `&` 구분자 권장 | Google Search Central (faceted navigation 가이드) | Search Engine Land, Lumar | VERIFIED |

#### v2 갱신 클레임 (2026-08-26)

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|----------|----------|------|
| 6 | `offers.shippingDetails`는 Offer의 **recommended** 속성이며, 사용 시 `shippingRate`(MonetaryAmount)·`shippingDestination`(DefinedRegion.addressCountry)이 required, `deliveryTime`(handlingTime·transitTime, QuantitativeValue + `unitCode: "DAY"`)은 recommended | Search Central — merchant listing `#offer-shipping-details-properties` | Merchant Center Help 지원 속성표(6386198) | VERIFIED |
| 7 | `offers.hasMerchantReturnPolicy` 사용 시 required는 `applicableCountry` + `returnPolicyCategory`(enum 3종: MerchantReturnFiniteReturnWindow / MerchantReturnNotPermitted / MerchantReturnUnlimitedWindow), FiniteReturnWindow면 `merchantReturnDays` 추가 required. `returnMethod`(ReturnByMail/ReturnInStore/ReturnAtKiosk)·`returnFees`(FreeReturn/ReturnShippingFees/ReturnFeesCustomerResponsibility)·`returnShippingFeesAmount`는 recommended | Search Central — merchant listing 반품 속성 섹션 | Search Central — return-policy 문서, Merchant Center Help 6386198 | VERIFIED |
| 8 | required는 `applicableCountry`이고 `returnPolicyCountry`는 **recommended**이며 조직(Organization) 레벨 마크업 속성이다. Offer 레벨 반품 속성은 조직 레벨의 부분집합으로 `returnPolicyCountry`를 포함하지 않는다 | Search Central — return-policy 속성표(Required: applicableCountry, returnPolicyCategory, merchantReturnLink) | Search Central — merchant listing 반품 속성 섹션 | VERIFIED |
| 9 | (3rd-party 주장) "2025-03-14 변경으로 `returnPolicyCountry`가 required가 됐다" | SEJ / PPC Land / Search Engine Roundtable (2025-03-14) | Search Central 공식 속성표 — recommended로 표기 | **DISPUTED** → SKILL.md에 "예제 JSON-LD에 추가된 것이며 required 목록은 applicableCountry + returnPolicyCategory(또는 merchantReturnLink) 유지"로 정정 + `> 주의:` 표기 |
| 10 | "2025-03 정책 변경으로 모든 판매자에게 반품 정책 제공이 필수화됐다" | — (공식 발표 미확인) | Merchant Center 가이드라인(12756116)은 상시 요구사항으로만 기술 | **UNVERIFIED** → SKILL.md에 `> 주의: 미검증` 표기, 확인 가능한 상시 요구사항만 서술 |
| 11 | Merchant Center 피드 ↔ 랜딩페이지 불일치의 제재는 **item-level 비승인 + 계정 경고**이며, 랜딩페이지 구조화 데이터는 승인의 필수 조건이 아니라 자동 항목 업데이트(price·sale price·availability·condition)의 입력이다. 자동 업데이트를 끄거나 추출 실패 시 item-level 비승인 | Merchant Center Help 12157888 + 9773429 | Merchant Center Help 7331077 | VERIFIED (기존 서술 "Merchant 정책 위반으로 광고 차단 가능"은 과장 → 정정) |
| 12 | 분리 URL(m-dot) 구성에서 모바일 페이지는 대응 데스크톱 URL로 `rel="canonical"`, 데스크톱은 `rel="alternate" media=...`로 1:1 양방향 주석. 구조화 데이터는 양쪽 동일하게 두되 마크업 내 URL은 각 호스트 URL로 맞춘다 | Search Central — Mobile-first Indexing Best Practices | Search Central — Separate URLs (mobile-sites) 가이드 | VERIFIED |

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-04)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-06-04)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 → 3/3 PASS, 보완 불필요
- [✅] v2 갱신분(§2 shippingDetails·hasMerchantReturnPolicy, §7 Merchant Center 지위, §8 분리 모바일 호스트) 재테스트 (2026-08-26) → 3/3 PASS, 보완 불필요

---

## 5. 테스트 진행 기록

**수행일**: 2026-08-26
**수행자**: skill-tester → general-purpose
**수행 방법**: v2 갱신(§2 `offers.shippingDetails`·`offers.hasMerchantReturnPolicy`, §7 Merchant Center 지위 정정, §8 분리 모바일 호스트) 이후 SKILL.md Read 기반 재테스트. 갱신분을 직접 겨냥한 실전 질문 3개 답변, 근거 줄 번호 및 anti-pattern(구 통설) 회피 확인. domain-specific 에이전트 미등록으로 general-purpose 사용(대체 사실 명시).

### 실제 수행 테스트 (v2 갱신분 재테스트)

**Q1. Product JSON-LD 반품 정책(`hasMerchantReturnPolicy`)의 required 속성은 `applicableCountry`인가 `returnPolicyCountry`인가?**
- ✅ PASS
- 근거: SKILL.md "offers.hasMerchantReturnPolicy (MerchantReturnPolicy)" 섹션(176~196줄), 특히 "`applicableCountry` vs `returnPolicyCountry`" 소섹션(189~192줄)
- 상세: required는 `applicableCountry`(+`returnPolicyCategory`, finite면 `merchantReturnDays`)이고 `returnPolicyCountry`는 recommended이며 Offer 레벨이 아닌 Organization 레벨 전용이라는 점을 정확히 답변. 194줄의 "2025-03 3rd-party 오보 정정" 주의문까지 인용해 anti-pattern(`returnPolicyCountry` required 오해)을 회피함. 갭: `merchantReturnLink` 대체 조합 구체 사용법은 이 섹션에 없음(경미, 차단 아님).

**Q2. Merchant Center 피드-페이지 가격 불일치 시 "광고 계정 즉시 정지"가 맞는가?**
- ✅ PASS
- 근거: SKILL.md §7 "Merchant Center 피드 ↔ 페이지 구조화 데이터 불일치의 현재 지위"(369~384줄)
- 상세: "즉시 계정 정지"는 틀렸다고 정확히 반박하고, 실제 제재는 "상품 단위 비승인 + 계정 경고"이며 automatic item updates(price·sale price·availability·condition)가 완충 장치로 먼저 작동한다는 점을 381줄 인용으로 답변. 과장된 구 통설(anti-pattern) 회피 확인.

**Q3. m./www. 분리 모바일 호스트에서 Product JSON-LD의 `offers.url`은 어느 호스트를 써야 하는가?**
- ✅ PASS
- 근거: SKILL.md §8 "분리 모바일 호스트(m. / www.)" 섹션(403~406줄)
- 상세: `offers.url`은 자기 호스트(m. 페이지면 m. URL)를 쓰고, `rel="canonical"`은 반대로 www. 쪽 URL을 가리킨다는 점을 표로 명확히 구분해 답변 — canonical과 offers.url 방향 혼동(가장 흔한 함정)을 정확히 피함. 갭: www. 쪽 offers.url이 www. URL이어야 한다는 대칭 서술이 문면에 명시적이지 않고 유추 수준(경미).

### 발견된 gap (SKILL.md 보강 권장, 비차단)

- `merchantReturnLink` 대체 required 조합의 구체 사용법·예시가 176~196줄 섹션에 없음 (194줄에 언급만 있음)
- §8에 `offers.url`이 www. 페이지에서도 www. 자기 호스트를 써야 한다는 대칭 서술을 명시하면 §10 체크리스트와 함께 더 명확해짐

### 판정 (v2 갱신분 재테스트)

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리·패턴 정리형 → content test PASS로 충분 (status 유지)
- 최종 상태: APPROVED 유지 (v1 승인 상태 변경 없음, v2 갱신분도 content test 통과 확인)

---

### 참고: v1 최초 테스트 기록 (완료됨, 2026-06-04)

**수행일**: 2026-06-04
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 일시 품절 상품 페이지 처리 — 삭제·noindex·유지 중 올바른 방법?**
- PASS
- 근거: SKILL.md "재고·단종 처리" 표 (섹션 1) + 주의 블록 + 섹션 7 재고·가격 실시간 변동 표
- 상세: "페이지 유지 + Schema `availability: OutOfStock` + 재입고 알림 폼 + 대체 상품 링크" 명시. "noindex 처리하면 재입고 시 색인 회복까지 수 주가 걸린다" 경고문 존재. anti-pattern(404/noindex) 회피 근거 충분.

**Q2. 카테고리 페이지 2~N의 canonical + robots 설정, rel=prev/next 취급은?**
- PASS
- 근거: SKILL.md 섹션 4 "페이지네이션 (rel=prev/next 지원 중단)" — 현재 권장 패턴 표 + 주의 문장
- 상세: self-referencing canonical + index,follow 유지 명시. "1페이지로 canonical 통일 → 2~N 색인 누락", "페이지 2~N noindex는 잘못된 관행" 모두 기재. rel=prev/next 2019-03 공식 미사용 발표 + Bing 예외 구분까지 포함.

**Q3. 필터 URL 수만 개 생성 시 Google 공식 권장 처리 방법은?**
- PASS
- 근거: SKILL.md 섹션 5 "Faceted Navigation (필터링)" — robots.txt 예시, noindex,follow, URL fragment, 추가 베스트 프랙티스 표
- 상세: 색인 불필요 → robots.txt Disallow, 내부 링크 가치 유지 필요 → noindex,follow, URL fragment(#) 대안, 빈 결과 HTTP 404, 표준 `&` 구분자, SEO 가치 있는 조합 → 별도 랜딩 페이지까지 모두 커버됨.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md에서 근거 섹션이 명확히 존재하고 anti-pattern 회피 가이드도 포함됨.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리·패턴 정리형 → content test PASS = APPROVED 전환 가능
- 최종 상태: APPROVED

---

### 참고: 기존 예정 케이스 (완료됨)

위 Q1~Q3이 기존 예정 케이스 1~3에 각각 대응. 모두 PASS로 완료됨.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-06-04, 3/3 PASS · v2 갱신분 재테스트 2026-08-26, 3/3 PASS) |
| **최종 판정** | **APPROVED** (v2 갱신 후에도 유지) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 2~3개 실전 질문 수행 후 섹션 5·6 갱신 (2026-06-04 완료, 3/3 PASS / 2026-08-26 v2 갱신분 재테스트 완료, 3/3 PASS)
- [❌] 실제 이커머스 프로젝트 적용 시 Schema Validator(Rich Results Test) 통과 여부 확인 — 차단 요인 아님, 선택 보강 (실제 프로젝트 도입 이후 수행)
- [❌] 한국 시장 특화(네이버 쇼핑·카카오 쇼핑 피드 연동) 추가 검토 (별도 naver-seo-specifics 스킬과 분리) — 차단 요인 아님, 선택 보강
- [❌] `returnPolicyCountry`의 지위는 Google 문서 개정 빈도가 높은 영역 — 다음 freshness 감사 시 required 승격 여부 재확인 필요 (현재 recommended)
- [❌] 조직(Organization) 레벨 배송 정책의 `ShippingService`/`shippingConditions`/`ServicePeriod` 구조는 이 스킬 범위 밖으로 두고 요약만 기재 — 필요 시 `frontend/schema-org-patterns`에 분리 반영 검토
- [❌] 분리 모바일 호스트(m./www.) CSR SPA에서 canonical·구조화 데이터 병행 렌더링은 실제 배포 후 Search Console·Rich Results Test로 확인 필요 — 차단 요인 아님, 선택 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-04 | v1 | 최초 작성 — Product Schema·페이지네이션·faceted navigation·재고 처리 포함 | skill-creator |
| 2026-06-04 | v1 | 2단계 실사용 테스트 수행 (Q1 일시 품절 페이지 처리 / Q2 페이지네이션 canonical + rel=prev/next / Q3 Faceted navigation URL 폭발 처리) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-08-26 | v2 | freshness 감사 OUTDATED 항목 갱신 — §2에 `offers.shippingDetails`(OfferShippingDetails)·`offers.hasMerchantReturnPolicy`(MerchantReturnPolicy) 예시·필드표 추가 및 `applicableCountry`(required) vs `returnPolicyCountry`(recommended) 확정, §7 Merchant Center 피드↔랜딩페이지 불일치 지위를 공식 근거(item-level 비승인 + 계정 경고, 자동 항목 업데이트 4속성)로 정정, §8에 분리 모바일 호스트 canonical·alternate 및 `frontend/mobile-seo-pwa` 참조 추가, Organization↔Product `@id` `@graph` 예시 추가(`frontend/schema-org-patterns` 연결), 체크리스트 2줄 보강. 클레임 판정 VERIFIED 5 / DISPUTED 1 / UNVERIFIED 1 | skill-creator |
| 2026-08-26 | v2 | v2 갱신분 2단계 실사용 재테스트 (Q1 hasMerchantReturnPolicy required 속성 `applicableCountry` vs `returnPolicyCountry` / Q2 Merchant Center 피드-페이지 불일치 실제 제재 수준 / Q3 분리 모바일 호스트 `offers.url` vs canonical 방향) → 3/3 PASS, APPROVED 유지 | skill-tester |
