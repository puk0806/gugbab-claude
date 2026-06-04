---
skill: ecommerce-seo
category: frontend
version: v1
date: 2026-06-04
status: APPROVED
---

# ecommerce-seo 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `ecommerce-seo` |
| 스킬 경로 | `.claude/skills/frontend/ecommerce-seo/SKILL.md` |
| 검증일 | 2026-06-04 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Google Search Central, schema.org)
- [✅] 공식 GitHub / 공식 블로그 2순위 소스 확인 (Google Search Central Blog)
- [✅] 최신 가이드 기준 내용 확인 (2026-06-04)
- [✅] 상품/카테고리/검색/페이지네이션/필터 패턴 정리
- [✅] Product Schema(JSON-LD) 예시 작성 (Offer, AggregateRating, availability)
- [✅] 흔한 실수 패턴 정리 (10개 케이스)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "Google rel=prev/next deprecated", "schema.org ItemAvailability", "Google Merchant priceValidUntil", "Google faceted navigation best practices", "internal search noindex" | 공식 문서 5건 + 보조 문서 다수 수집 |
| 조사 | WebFetch | developers.google.com Product structured data, faceted navigation 가이드 페이지 | 권장 처리(robots.txt / canonical / fragment / 404) 확인 |
| 교차 검증 | WebSearch | 5개 핵심 클레임을 2개 이상 독립 소스로 대조 | VERIFIED 5 / DISPUTED 0 / UNVERIFIED 0 |

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

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전/기준일 명시 (검증일 2026-06-04)
- [✅] deprecated 패턴(rel=prev/next, 페이지 2~N noindex) 권장하지 않음
- [✅] JSON-LD 예시가 그대로 적용 가능한 형태

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description, example)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (상품/카테고리/검색/페이지네이션/필터/재고)
- [✅] 코드 예시 포함 (Product Schema, BreadcrumbList, robots 메타)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (재고·단종 매트릭스)
- [✅] 흔한 실수 패턴 포함 (10개)

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

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-04)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-06-04)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 → 3/3 PASS, 보완 불필요

---

## 5. 테스트 진행 기록

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
| 에이전트 활용 테스트 | ✅ (2026-06-04, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 2~3개 실전 질문 수행 후 섹션 5·6 갱신 (2026-06-04 완료, 3/3 PASS)
- [❌] 실제 이커머스 프로젝트 적용 시 Schema Validator(Rich Results Test) 통과 여부 확인 — 차단 요인 아님, 선택 보강 (실제 프로젝트 도입 이후 수행)
- [❌] 한국 시장 특화(네이버 쇼핑·카카오 쇼핑 피드 연동) 추가 검토 (별도 naver-seo-specifics 스킬과 분리) — 차단 요인 아님, 선택 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-04 | v1 | 최초 작성 — Product Schema·페이지네이션·faceted navigation·재고 처리 포함 | skill-creator |
| 2026-06-04 | v1 | 2단계 실사용 테스트 수행 (Q1 일시 품절 페이지 처리 / Q2 페이지네이션 canonical + rel=prev/next / Q3 Faceted navigation URL 폭발 처리) → 3/3 PASS, APPROVED 전환 | skill-tester |
