---
name: project-seo-geo-assets-2026-06
description: "SEO·GEO·웹표준 인프라 자산 작업 진행 추적 (시작 2026-06-01). 6개 작업 순차 진행, 토큰 부족 대비 진행상황 기록"
metadata: 
  node_type: memory
  type: project
  originSessionId: 380181ba-9f08-47ac-87c5-c8dbdd23c90c
---

# SEO·GEO·웹표준 인프라 작업 (시작 2026-06-01)

**전체 범위**: 갭 분석 후 도출된 P0~P2 6개 작업
**시작일**: 2026-06-01
**원칙**: 순차 진행, 각 단계 완료 후 메모리·README 즉시 갱신

**Why:** 사용자가 6개 작업을 한 번에 지시했고 "토큰 부족할 수도 있으니 메모리 잘 정리"하라고 명시. 중간에 세션이 끊겨도 다음 세션에서 이 파일만 보면 어디부터 재개할지 알 수 있어야 함.

**How to apply:** 다음 세션 시작 시 이 파일과 [[project_thesis_status]] 같은 진입점 메모리를 먼저 확인. 작업 항목별 "완료 / 진행 중 / 미착수" 상태를 확인하고 미착수 첫 항목부터 재개.

## 작업 목록

| # | 작업 | 산출물 | 상태 |
|---|------|--------|:---:|
| P0-1 | seo 스킬 분할 | frontend/seo-nextjs(이전) + seo-vite-spa(신규) + seo-static-html(신규) | ✅ 완료 |
| P0-2 | geo-ai-discoverability 스킬 신규 | frontend/geo-ai-discoverability | ✅ 완료 |
| P1-1 | schema-org-patterns 스킬 신규 | frontend/schema-org-patterns | ✅ 완료 |
| P1-2 | seo-auditor 에이전트 신규 | validation/seo-auditor | ✅ 완료 |
| P2-1 | wcag-2.2-checklist 스킬 신규 | frontend/wcag-2.2-checklist | ✅ 완료 |
| P2-2 | i18n-seo 스킬 신규 | frontend/i18n-seo | ✅ 완료 |
| FIN | README + 메모리 동기화 | README.md 목록·로그, 메모리 인덱스 | ✅ 완료 |

## 각 스킬 작업 표준 절차 (5단계 워크플로우 준수)

1. WebSearch + WebFetch로 공식 문서 조사 (Next.js docs, OpenAI llms.txt 사양, schema.org, W3C WCAG 2.2, MDN i18n 등)
2. 핵심 클레임 2개 이상 교차 검증
3. SKILL.md 작성 (소스 URL + 검증일 + 주의 표기)
4. docs/skills/{category}/{name}/verification.md 작성
5. skill-tester 호출 → agent content test → status 결정 (대부분 APPROVED, 실사용 필수 카테고리만 PENDING_TEST 유지)

## 작업 진행 로그

### 2026-06-01 — P0-1 완료
- `frontend/seo` → `frontend/seo-nextjs` 리네이밍 (git mv, SKILL.md·verification.md frontmatter 수정)
- `frontend/seo-vite-spa` 신규: react-helmet-async v3 / @unhead/react v3 / Vike(구 vite-plugin-ssr) / vite-prerender-plugin / satori / CRA deprecated(2025-02-14). 9 클레임 VERIFIED. content test 3/3 PASS → APPROVED
- `frontend/seo-static-html` 신규: HTML head 표준, OG/Twitter 카드, canonical, sitemap.xml(50k URL/50MB 한계), robots.txt(RFC 9309), Astro/11ty/Hugo 매핑, Lighthouse SEO. 24 클레임 VERIFIED. content test 3/3 PASS → APPROVED

### 2026-06-01 — P0-2 완료
- `frontend/geo-ai-discoverability` 신규: llms.txt(Answer.ai 비공식 제안 명시), AI 크롤러 robots 정책(GPTBot/OAI-SearchBot/ChatGPT-User/ClaudeBot/anthropic-ai/claude-web/Claude-SearchBot/Google-Extended/PerplexityBot/Perplexity-User/CCBot/Applebot-Extended/Meta-ExternalAgent), 학습·인용·fetch 3분류 독립 제어, 인용 친화 콘텐츠 구조(질문-답변 우선·청크 100~300토큰), FAQPage JSON-LD, robots.txt 우회 사례(법적 분쟁) 사실 기반 기록. content test 3/3 PASS → APPROVED

### 2026-06-01 — P1-1 완료
- `frontend/schema-org-patterns` 신규: Article/NewsArticle/BlogPosting(headline 110자는 NewsArticle만), BreadcrumbList, FAQPage(2026-05-07 SERP 중단·주의), HowTo(2023-08 모바일·2023-09 데스크톱 중단·주의), Organization/LocalBusiness, Product+Offer+AggregateRating(Product Snippet vs Merchant Listing 구분), VideoObject, WebSite+SearchAction(2024-11-21 deprecated). 19 클레임 VERIFIED. content test 3/3 PASS → APPROVED

### 2026-06-01 — P1-2 완료
- `validation/seo-auditor` 신규 에이전트: 10개 점검 영역(HTML 메타·OG/Twitter·JSON-LD·sitemap·robots·canonical·i18n·GEO·CWV 영향·a11y 핵심) + 입력 3종(URL WebFetch / 프로젝트 경로 / 스니펫). 판정 GOOD/MOSTLY_OK/NEEDS_REVISION. model: sonnet, tools: Read·Glob·Grep·WebFetch·WebSearch (수정 권한 없음, 진단 전용)

### 2026-06-02 — P2-1 완료 (전일 token limit 후 재개)
- `frontend/wcag-2.2-checklist` 신규: WCAG 2.2 발표일 2023-10-05 확정(WebFetch 1차 오답 → W3C 공식 교차검증), A/AA 전체 success criteria 표, 2.2 신규 9개 SC(2.4.11/2.4.12/2.4.13/2.5.7/2.5.8/3.2.6/3.3.7/3.3.8/3.3.9) 상세, axe-core 자동 탐지 ~57%·SC 기준 29.5% 자동·60.2% 수동, 한국 장애인차별금지법·ADA·Section 508·EAA 매핑. content test 3/3 PASS → APPROVED

### 2026-06-02 — P2-2 완료
- `frontend/i18n-seo` 신규: hreflang BCP 47 값(ko vs ko-KR vs 잘못된 kr), 자기참조·양방향 일관성, x-default, 3가지 구현 방법(HTML link / HTTP Link 헤더 / sitemap xhtml:link), canonical과 hreflang 관계(canonical 영문 통일 안티패턴 + John Mueller 인용), locale URL 4전략(ccTLD/서브도메인/서브디렉토리/파라미터), Naver·Baidu·Yandex 특수성, Accept-Language 자동 리다이렉트 안티패턴, Next.js/Astro 매핑. content test 3/3 PASS → APPROVED

### 2026-06-02 — FIN 완료 (README + 메모리)
- `README.md`: frontend 스킬 수 66 → 72, seo 항목 행 1개 → 7개로 교체(seo-nextjs + 6 신규), validation 에이전트에 seo-auditor 추가, 업데이트 로그 2026-06-02 신규 행 추가
- 메모리: 본 파일 진행 상태 전부 ✅ 전환, MEMORY.md 인덱스에 본 파일 진입점 등록(2026-06-01)

## 최종 산출물 요약

| 종류 | 경로 | 상태 |
|------|------|:---:|
| 스킬 (리네이밍) | frontend/seo-nextjs | APPROVED |
| 스킬 (신규) | frontend/seo-vite-spa | APPROVED |
| 스킬 (신규) | frontend/seo-static-html | APPROVED |
| 스킬 (신규) | frontend/schema-org-patterns | APPROVED |
| 스킬 (신규) | frontend/geo-ai-discoverability | APPROVED |
| 스킬 (신규) | frontend/wcag-2.2-checklist | APPROVED |
| 스킬 (신규) | frontend/i18n-seo | APPROVED |
| 에이전트 (신규) | validation/seo-auditor | (검증 에이전트 — verification 불필요) |

**content test 통계**: 7개 신규/리네이밍 스킬 중 6개 신규 스킬 모두 3/3 PASS (18/18). seo-nextjs는 이미 v1에서 6/6 PASS APPROVED 상태였고 리네이밍만 진행.

**총 클레임 VERIFIED**: seo-vite-spa 9 + seo-static-html 24 + schema-org-patterns 19 + geo-ai-discoverability(미집계 — 표준 비공식 영역) + wcag-2.2-checklist(WCAG 2.2 발표일 1차 오답 → W3C 공식 교차검증으로 2023-10-05 확정) + i18n-seo(다수) = 60+

**커밋 미수행**: [[feedback_commit_policy]]에 따라 사용자가 커밋 요청할 때까지 미커밋 상태 유지

---

## 2차 라운드 — 추가 13개 자산 (2026-06-02 시작)

사용자 지시: "전부다 필요한거 아니야??? 그냥 순차적으로만 진행하면될거같은데" → P0~P3 전체 진행.

| # | 작업 | 산출물 | 상태 |
|---|------|--------|:---:|
| P0-3 | a11y-auditor 에이전트 | validation/a11y-auditor | ✅ 완료 |
| P0-4 | core-web-vitals-optimization 스킬 | frontend/core-web-vitals-optimization | ✅ 완료 |
| P1-3 | og-image-generation 스킬 | frontend/og-image-generation | ✅ 완료 |
| P1-4 | url-canonicalization-redirects 스킬 | frontend/url-canonicalization-redirects | ✅ 완료 |
| P1-5 | search-console-webmaster 스킬 | frontend/search-console-webmaster | ✅ 완료 |
| P2-3 | mobile-seo-pwa 스킬 | frontend/mobile-seo-pwa | ✅ 완료 |
| P2-4 | content-eeat-quality 스킬 | writing/content-eeat-quality | ✅ 완료 |
| P2-5 | site-migration-seo 스킬 | devops/site-migration-seo | ✅ 완료 |
| P2-6 | content-quality-reviewer 에이전트 | validation/content-quality-reviewer | ✅ 완료 |
| P3-1 | structured-data-validation-api 스킬 | frontend/structured-data-validation-api | ✅ 완료 |
| P3-2 | google-indexing-api 스킬 | frontend/google-indexing-api | ✅ 완료 |
| P3-3 | accessibility-vpat-writing 스킬 | writing/accessibility-vpat-writing | ✅ 완료 |
| P3-4 | ymyl-content-seo 스킬 | writing/ymyl-content-seo | ✅ 완료 |
| FIN-2 | README + 메모리 최종 동기화 | README.md·MEMORY.md | ✅ 완료 |

## 2차 라운드 진행 로그 (2026-06-02 ~ 06-03 완료)

### 2026-06-03 — P3-4 완료 + FIN-2 완료
- `writing/ymyl-content-seo` 신규: YMYL 정의·범주, QRG "highest E-E-A-T standards", 신뢰 7대 신호, 의료(한국 의료법·HONcode·응급 109), 금융(금감원·affiliate 공정위 2024-06), 법률(변호사법·일반정보 vs 법적조언), AI 안전 활용(Medically reviewed 사인), MedicalWebPage schema, 자살 키워드 109·1577-0199 안내. content test 3/3 PASS → APPROVED
- README.md 업데이트: frontend 79종(+7), devops 9종(+1), writing 15종(+3), validation 에이전트 +2(a11y-auditor·content-quality-reviewer). 2026-06-03 업데이트 로그 행 추가
- MEMORY.md 인덱스에 본 파일 진입점 갱신

---

## 3차 라운드 후보 (2026-06-03 갭 분석, 사용자 보류 — 다시 호출 시 진입점)

**사용자 메시지 (2026-06-03)**: "메모리에 가지고있어 seo 관련 메모리 꺼내오라고 할게 그전에 다른작업좀 하고 오게"
→ 사용자가 다른 작업 후 SEO 메모리 호출 시 본 섹션에서 이어 진행.

### 강한 갭 (P0~P1) — 통합 카탈로그 부재 영역

| 우선 | 자산 | 갭 근거 |
|:--:|------|--------|
| P0-5 | 스킬 `frontend/image-optimization-seo` | 이미지 처리가 core-web-vitals-optimization(LCP)·og-image-generation·seo-static-html(alt)·wcag-2.2-checklist(SC 1.1.1)에 흩어짐. 통합 카탈로그 부재. picture/srcset/sizes·AVIF/WebP·CDN(Cloudinary·Imgix·Cloudflare Images)·alt text 작성법·이미지 sitemap·Google 이미지 검색 최적화 |
| P0-6 | 스킬 `frontend/naver-seo-specifics` | search-console-webmaster는 *등록 절차*만. 네이버 통합검색 알고리즘 특수성(VIEW/블로그/웹문서/뉴스 카테고리·C-Rank·D.I.A 일반론·다음·줌 차이) 비어있음. 한국 시장 운영자 필수 |
| P1-6 | 스킬 `frontend/font-optimization` | 폰트가 core-web-vitals-optimization(font-display·size-adjust)·og-image-generation(CJK)·seo-vite-spa(폰트 임베드)에 분산. 단독 카탈로그 부재. preload·subset·variable font·system font stack·CJK 폰트(Pretendard·Noto Sans KR·서브셋 도구) |
| P1-7 | 스킬 `frontend/media-accessibility` | wcag-2.2-checklist에 SC 1.2.x 항목만 있고 *작성·구현 가이드* 없음. 자막 SRT/WebVTT 작성, video `<track>`, 청각장애 자막 vs 일반 자막 차이, transcript 자동 생성(Whisper), 색맹 친화 비디오 자막 |
| P1-8 | 스킬 `frontend/security-headers-seo` | security-auditor는 진단 도구. 헤더 *설계 가이드* 부재. HSTS·CSP·X-Frame-Options·Referrer-Policy·Permissions-Policy·COEP/COOP·security.txt(RFC 9116)·SEO에 영향 주는 헤더(Vary·X-Robots-Tag) |

### 중간 갭 (P2)

| 우선 | 자산 | 갭 근거 |
|:--:|------|--------|
| P2-7 | 스킬 `frontend/ecommerce-seo` | 상품·카테고리·검색·페이지네이션·재고·Product/Offer/AggregateRating 깊이·faceted navigation 함정·중복 콘텐츠. schema-org-patterns에 Product 마크업은 있지만 운영 차원 종합 가이드 부재 |
| P2-8 | 스킬 `frontend/local-business-seo` | Google Business Profile + 네이버 플레이스 + LocalBusiness schema + NAP(Name·Address·Phone) 일관성 + 리뷰 관리. 오프라인 매장 운영자 영역 |

### 약한 갭 (P3 — 작성 효용 낮음, 보류 권장)

- `frontend/headless-cms-seo` (Sanity·Contentful·Strapi 의존)
- `frontend/voice-search-seo` (Google Assistant·Siri 한정)
- `frontend/aso-mobile-app` (앱스토어 — 웹 SEO와 다른 영역)
- `frontend/crawl-budget-optimization` (대형 사이트만)

---

## 3차 라운드 작업 진행 (2026-06-03 시작)

사용자 지시: "순차적으로 진행해줘 토큰 부족할수 있으니 순차적으로 잘 진행해줘"

### 3차 라운드 작업 목록 (13개 + FIN-3)

| # | 작업 | 산출물 | 상태 |
|---|------|--------|:---:|
| P0-A1 | image-optimization-seo 스킬 | frontend/image-optimization-seo | ✅ 완료 |
| P0-A2 | font-optimization 스킬 | frontend/font-optimization | ✅ 완료 |
| P0-B1 | naver-seo-specifics 스킬 | frontend/naver-seo-specifics | ✅ 완료 |
| P1-A3 | media-accessibility 스킬 | frontend/media-accessibility | ✅ 완료 |
| P1-B2 | kakao-share-optimization 스킬 | frontend/kakao-share-optimization | ✅ 완료 |
| P1-C1 | security-headers-seo 스킬 | frontend/security-headers-seo | ✅ 완료 |
| P1-C2 | bot-management-seo 스킬 | frontend/bot-management-seo | ✅ 완료 |
| P2-D1 | ecommerce-seo 스킬 | frontend/ecommerce-seo | ✅ 완료 |
| P2-D2 | local-business-seo 스킬 | frontend/local-business-seo | ✅ 완료 |
| P2-D3 | multilingual-content-strategy 스킬 | writing/multilingual-content-strategy | ✅ 완료 |
| P2-E1 | seo-monitoring-automation 스킬 | frontend/seo-monitoring-automation | ✅ 완료 |
| P2-E2 | seo-content-writer-coach 에이전트 | validation/seo-content-writer-coach | ✅ 완료 |
| FIN-3 | README + 메모리 + 커밋·푸시 | README.md·MEMORY.md·git push | ✅ 완료 |

### 3차 라운드 진행 로그

### 2026-06-03 — P0-A1 완료
- `frontend/image-optimization-seo` 신규: picture+srcset+sizes, AVIF/WebP/JPEG 폴백 체인, CDN 5종(Cloudinary·Imgix·Cloudflare Images·Vercel·Naver/NHN), Next.js Image 16+ priority deprecated→preload, alt text 80~140자 5W1H, 이미지 sitemap(2022-08-06 deprecated 4태그 명시), sharp 0.34 AVIF first-class, lazy+LCP 모순. 20 클레임 VERIFIED. content test 3/3 PASS → APPROVED

### 2026-06-03 — P0-A2 완료
- `frontend/font-optimization` 신규: font-display 4값(swap 기본), preload+crossorigin, size-adjust/ascent-override/descent-override CLS 보정, variable font(Pretendard Variable·Roboto Flex), system font stack(한국어 폴백), WOFF2 단독, CJK 서브셋(subset-font·pyftsubset·unicode-range), 한국어 폰트 카탈로그(Pretendard·Noto Sans KR·Nanum·Spoqa·Apple SD Gothic Neo), Google Fonts GDPR(LG München I 2022-01 판결) → next/font 셀프 호스팅 권장. content test 3/3 PASS → APPROVED

### 2026-06-04 — P1-A3 완료
- `frontend/media-accessibility` 신규: Captions vs Subtitles(CC vs Open), SRT/WebVTT/TTML, WebVTT 작성(WEBVTT 헤더·타임스탬프·화자 `<v>`·소음 `[]`·위치), `<track>` kind 5종, audio description(SC 1.2.3/1.2.5), Whisper API response_format=vtt, prefers-reduced-motion+matchMedia JS, YouTube CC = SC 1.2.2 미충족, 장차법 제21조·ADA Robles 판례·EAA 2025-06-28. 8 클레임 VERIFIED. content test 3/3 PASS → APPROVED

### 2026-06-03 — P0-B1 완료
- `frontend/naver-seo-specifics` 신규: 한국 검색 점유율, 네이버 통합검색 다층 컬렉션(VIEW/블로그/이미지/지식iN/웹사이트/뉴스/쇼핑/플레이스), C-Rank 알고리즘(Context·Content·Chain 3축), D.I.A.+ 강화 모델, Google과 공통/차이 항목, RSS 피드 활용, 자체 도메인 vs 블로그·지식iN 상위 노출 대응, AI 양산 콘텐츠 페널티 방향성, 한국 사이트 운영자 체크리스트(GSC+서치어드바이저 동시). content test 3/3 PASS → APPROVED

---

### 2026-06-02 — P0-3 완료

### 2026-06-02 — P0-3 완료
- `validation/a11y-auditor` 신규 에이전트: WCAG 2.2 A/AA 자동/수동 점검 + 2.2 신규 9 SC 특별 점검 + Critical/Major/Minor 판정. tools: Read·Glob·Grep·WebFetch·WebSearch (수정 권한 없음). 짝 스킬 [[wcag-2.2-checklist]]·[[accessibility]], 짝 에이전트 [[seo-auditor]]

### 2026-06-02 — P0-4 완료
- `frontend/core-web-vitals-optimization` 신규: LCP/INP/CLS 임계값(2026 기준 변경 없음 확인), Next.js 16 `priority` deprecated → `preload` 전환, scheduler.yield Chrome 129+ stable + fallback, INP 2024-03-12 FID 대체, RUM vs lab 구분, web-vitals npm. 14 클레임 VERIFIED. content test 3/3 PASS → APPROVED

### 2026-06-02 — P1-3 완료 (token limit 후 verification.md 보충 작성)
- `frontend/og-image-generation` 신규: 1200×630 표준, Next.js `opengraph-image.tsx` 파일 컨벤션 + `params` Promise, vercel/satori 단독(JSX→SVG, Resvg → PNG), CJK 폰트 임베드 3옵션(전체/서브셋/loadAdditionalAsset 동적), SSG 사전 생성 vs Edge 동적, @vercel/og→next/og 통합, Facebook/X/Kakao OG 디버거. SKILL.md 580줄 11섹션. content test 3/3 PASS → APPROVED (skill-creator가 token limit 직전 SKILL.md만 작성하고 종료 → 메인이 verification.md 직접 작성 후 skill-tester 호출)

