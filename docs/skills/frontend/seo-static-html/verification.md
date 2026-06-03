---
skill: seo-static-html
category: frontend
version: v1
date: 2026-06-01
status: APPROVED
---

# seo-static-html 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `seo-static-html` |
| 스킬 경로 | `.claude/skills/frontend/seo-static-html/SKILL.md` |
| 검증일 | 2026-06-01 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Google Search Central, sitemaps.org, ogp.me, IETF RFC 9309)
- [✅] 공식 GitHub 2순위 소스 확인 (withastro/astro 통합 패키지)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-06-01)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (메타태그 5종, OG 4종, Twitter Card, canonical, sitemap, robots.txt)
- [✅] 코드 예시 작성 (HTML, XML, Astro/11ty/Hugo 설정)
- [✅] 흔한 실수 패턴 정리 (13건 표)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | Google robots meta tag, noindex, max-snippet, max-image-preview | Google Search Central 공식 문서 + Conductor/Ahrefs 보조 |
| 조사 2 | WebSearch | sitemaps.org 0.9 spec, 50,000 URL / 50MB 한계 | sitemaps.org 공식 + Google sitemap docs |
| 조사 3 | WebSearch | RFC 9309 IETF robots exclusion protocol | datatracker.ietf.org/doc/rfc9309 공식 |
| 조사 4 | WebSearch | OpenGraph og:image 1200x630, ogp.me 스펙 | ogp.me + 보조 자료 |
| 조사 5 | WebSearch | Twitter Card summary_large_image, name vs property | developer.x.com 공식 + 비교 분석 |
| 조사 6 | WebSearch | Google canonical URL self-referencing 2026 권장 | Google Search Central + John Mueller 인용 |
| 조사 7 | WebSearch | robots.txt noindex disallow 충돌 공식 입장 | Google Search Central 공식 문서 |
| 조사 8 | WebFetch | sitemaps.org/protocol.html 원문 | XML 태그 스펙, 제한값, gzip 압축 추출 |
| 조사 9 | WebSearch + WebFetch | Astro @astrojs/sitemap 공식 문서 | docs.astro.build/integrations-guide/sitemap |
| 조사 10 | WebSearch | Hugo 빌트인 sitemap 설정 | gohugo.io/configuration/sitemap 공식 |
| 조사 11 | WebSearch | Lighthouse SEO 8개 audit 항목 | developer.chrome.com Lighthouse 공식 + Unlighthouse |
| 조사 12 | WebFetch | developers.google.com/search/docs/crawling-indexing/special-tags 원문 | Google 인식 메타태그 전체 목록 |
| 조사 13 | WebSearch | 11ty eleventy-plugin-sitemap 공식 | quasibit/eleventy-plugin-sitemap (npm + GitHub) |
| 조사 14 | WebSearch | 이미지/비디오 sitemap 확장, 2022 deprecation | Google Image Sitemap docs + 2022-08-06 deprecation |
| 조사 15 | WebFetch | Google robots meta tag 전체 디렉티브 목록 | indexifembedded까지 전체 12종 디렉티브 추출 |
| 교차 검증 | WebSearch | sitemap 50,000/50MB 한계 다중 소스 확인 | 5개 이상 독립 소스에서 일치 확인 |
| 교차 검증 | WebSearch | Twitter Card name 속성 사용 표준 | developer.x.com + Drupal/11ty 이슈 트래커 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Google Search Central — Special tags | https://developers.google.com/search/docs/crawling-indexing/special-tags | ⭐⭐⭐ High | 2026-06-01 | Google 공식, 2026-03-24 업데이트 |
| Google Search Central — Robots meta tag | https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag | ⭐⭐⭐ High | 2026-06-01 | Google 공식 |
| Google Search Central — Robots.txt | https://developers.google.com/search/docs/crawling-indexing/robots/intro | ⭐⭐⭐ High | 2026-06-01 | Google 공식 |
| Google Search Central — Canonical | https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls | ⭐⭐⭐ High | 2026-06-01 | Google 공식 |
| Google Search Central — Image sitemaps | https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps | ⭐⭐⭐ High | 2026-06-01 | Google 공식 |
| Google Search Central — Video sitemaps | https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps | ⭐⭐⭐ High | 2026-06-01 | Google 공식 |
| Sitemaps.org Protocol 0.9 | https://www.sitemaps.org/protocol.html | ⭐⭐⭐ High | 2026-06-01 | 표준 사양 원문 |
| IETF RFC 9309 (Robots Exclusion Protocol) | https://datatracker.ietf.org/doc/rfc9309/ | ⭐⭐⭐ High | 2026-06-01 | 2022-09 IETF 표준화 문서 |
| Open Graph Protocol | https://ogp.me/ | ⭐⭐⭐ High | 2026-06-01 | OG 공식 스펙 (2010~) |
| X (Twitter) Cards Markup | https://developer.x.com/en/docs/x-for-websites/cards/overview/markup | ⭐⭐⭐ High | 2026-06-01 | X 공식 개발자 문서 |
| X (Twitter) summary_large_image | https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/summary-card-with-large-image | ⭐⭐⭐ High | 2026-06-01 | X 공식 |
| Chrome Developers — Lighthouse | https://developer.chrome.com/docs/lighthouse | ⭐⭐⭐ High | 2026-06-01 | Lighthouse 공식 |
| Astro Sitemap Integration | https://docs.astro.build/en/guides/integrations-guide/sitemap/ | ⭐⭐⭐ High | 2026-06-01 | Astro 공식 통합 |
| Hugo Sitemap Configuration | https://gohugo.io/configuration/sitemap/ | ⭐⭐⭐ High | 2026-06-01 | Hugo 공식 |
| Hugo Sitemap Templates | https://gohugo.io/templates/sitemap/ | ⭐⭐⭐ High | 2026-06-01 | Hugo 공식 |
| Eleventy Sitemap Plugin (quasibit) | https://github.com/quasibit/eleventy-plugin-sitemap | ⭐⭐ Medium | 2026-06-01 | 커뮤니티 표준 플러그인 |
| MDN — X-Robots-Tag | https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Robots-Tag | ⭐⭐⭐ High | 2026-06-01 | MDN 공식 |
| Unlighthouse — Lighthouse SEO | https://unlighthouse.dev/learn-lighthouse/seo | ⭐⭐ Medium | 2026-06-01 | 8개 SEO audit 항목 상세 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Sitemap 0.9, RFC 9309, OG 1.0 등)
- [✅] deprecated된 패턴을 권장하지 않음 (2022-08-06 이미지 sitemap deprecated 태그 제외, `meta keywords` 제외 명시)
- [✅] 코드 예시가 실행 가능한 형태임 (HTML/XML/JS/TOML 문법 검증 가능)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (head 영역에 9개 URL + 2026-06-01)
- [✅] 핵심 개념 설명 포함 (9개 섹션: 메타태그/OG/canonical/sitemap/robots.txt/SSG/Lighthouse/실수/체크리스트)
- [✅] 코드 예시 포함 (HTML, XML, Astro/11ty/Hugo 설정)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (도입부 + i18n/JSON-LD/AI 크롤러 분리 명시)
- [✅] 흔한 실수 패턴 포함 (섹션 8, 13건 표)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (체크리스트, 비교 표, 실제 코드)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 없음, 프레임워크 중립)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-01, skill-tester → general-purpose)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음)

---

## 4.5. 교차 검증 클레임 판정

| # | 클레임 | 소스 1 | 소스 2 | 판정 |
|---|--------|--------|--------|------|
| 1 | sitemap 단일 파일 50,000 URL / 50MB 한계 | sitemaps.org/protocol.html | Google Search Central sitemap docs | VERIFIED |
| 2 | RFC 9309는 2022-09 IETF 표준화 | datatracker.ietf.org/doc/rfc9309 | searchengineworld RFC 9309 분석 | VERIFIED |
| 3 | og:image 1200x630 권장 | ogp.me 보조 + 환경 분석 | 다수 가이드 일치 | VERIFIED |
| 4 | OpenGraph 필수 4종 = og:title, og:type, og:image, og:url | ogp.me | dev.to OG canonical reference | VERIFIED |
| 5 | Twitter Card는 `name` 속성, OG는 `property` 속성 | developer.x.com markup | Drupal #2746031, 11ty issue #1155 | VERIFIED |
| 6 | summary_large_image 비율 2:1 (1200×600) 또는 1200×675(16:9) | developer.twitter.com summary_large_image | moda.app 2026 가이드 | VERIFIED |
| 7 | robots.txt Disallow + meta noindex 동시 사용은 noindex 무력화 | Google Search Central block-indexing | Google Search Central robots/intro | VERIFIED |
| 8 | robots.txt 내 `Noindex:` 디렉티브는 Google 미지원 | Google Search Central robots/intro | seroundtable / lumar | VERIFIED |
| 9 | max-image-preview 값 = none / standard / large | Google robots-meta-tag 공식 | Conductor 가이드 | VERIFIED |
| 10 | max-snippet 0 = 스니펫 없음, -1 = Google 자율 | Google robots-meta-tag 공식 | wordtracker 가이드 | VERIFIED |
| 11 | max-snippet, max-image-preview, max-video-preview, notranslate, noimageindex는 Google 전용 | Google 공식 | seranking 가이드 | VERIFIED |
| 12 | 충돌하는 robots 규칙은 더 제한적인 쪽 적용 | Google 공식 | Ahrefs 분석 | VERIFIED |
| 13 | 자기참조 canonical 권장 (Google John Mueller) | Google Search Central | Yoast / Conductor 인용 | VERIFIED |
| 14 | canonical은 강한 힌트(strong hint)이며 절대 지시 아님 | Google Search Central | searchengineland 2026 | VERIFIED |
| 15 | sitemap changefreq/priority는 Google이 사실상 무시, lastmod만 사용 | Google search docs | sitemaps.org "hint" 명시 | VERIFIED |
| 16 | URL당 image:image 최대 1,000개 | Google Image Sitemaps 공식 | google.com/schemas xsd | VERIFIED |
| 17 | 2022-08-06부로 image:caption, image:geo_location, image:title, image:license, video:category, video:gallery_loc, video:price, video:tvshow deprecated | Google blog "spring cleaning" 2022 | Google sitemap docs 갱신본 | VERIFIED |
| 18 | @astrojs/sitemap entryLimit 기본값 45000 | docs.astro.build sitemap | npm @astrojs/sitemap | VERIFIED |
| 19 | Hugo 내장 sitemap이 0.9 protocol 준수 | gohugo.io/templates/sitemap | gohugo.io/configuration/sitemap | VERIFIED |
| 20 | Hugo sitemap default priority=-1, changeFreq='' = 출력 안 함 | gohugo.io/configuration/sitemap 공식 | codingnconcepts.com | VERIFIED |
| 21 | Lighthouse SEO 8개 audit 항목 | Unlighthouse 가이드 | Google search blog 2018 출시 | VERIFIED |
| 22 | sitemap loc URL 2,048자 이하 | sitemaps.org/protocol.html | 다수 소스 일치 | VERIFIED |
| 23 | gzip 압축 해제 후에도 50MB 이하여야 함 | sitemaps.org/protocol.html | Google search docs | VERIFIED |
| 24 | indexifembedded 디렉티브 존재 (noindex와 함께 사용) | Google robots-meta-tag 공식 | 보조 가이드 | VERIFIED |

**판정 결과: 24 VERIFIED / 0 DISPUTED / 0 UNVERIFIED**

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-01
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. noindex와 robots.txt Disallow 동시 사용 시 검색 노출이 차단 안 되는 이유**
- PASS
- 근거: SKILL.md 섹션 5 "흔한 실수 — noindex와 Disallow 동시 사용" (라인 330~355)
- 상세: 핵심 원칙("robots.txt로 차단하면 크롤러가 noindex 메타태그를 볼 수 없다"), 잘못된 패턴 코드, "Indexed, though blocked by robots.txt" 경고, 올바른 패턴 표 모두 근거 섹션에 존재. 섹션 8 흔한 실수 표(라인 471)에도 중복 명시됨.

**Q2. OG 이미지와 Twitter Card 메타태그 속성 차이 (property vs name)**
- PASS
- 근거: SKILL.md 섹션 2 "OpenGraph 필수 4종 + 권장 3종" (라인 97~127) + "Twitter Card" (라인 129~153)
- 상세: og:image = `property` 속성 / twitter:image = `name` 속성 구분, 1200×630 권장 크기, og:image 폴백 동작, summary_large_image 2:1 비율 모두 명시. 섹션 8 흔한 실수(라인 474)에서 `property` 사용 anti-pattern도 확인.

**Q3. URL 200,000개 사이트의 sitemap 구조**
- PASS
- 근거: SKILL.md 섹션 4 "크기·개수 제한" (라인 244~253) + "sitemap index" (라인 255~269)
- 상세: 50,000 URL / 50MB 한계, sitemap index XML 코드 예시(`<sitemapindex>`), gzip 압축 해제 후 50MB 이하 조건 모두 근거 있음. Astro 섹션(라인 387)에 자동 분할 언급 포함.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md에서 충분한 근거를 찾을 수 있었다.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (라이브러리 사용법·웹표준 정리형 — content test PASS = APPROVED 가능)
- 최종 상태: APPROVED

---

*(아래는 생성 시 작성된 향후 테스트 권장 케이스 참고용 보존)*

### 테스트 케이스 참고 (보존)

#### 테스트 케이스 1: noindex와 robots.txt 충돌

**기대 결과:**
SKILL.md 섹션 5 "흔한 실수 — noindex와 Disallow 동시 사용" 내용을 인용해야 한다.
- robots.txt가 차단하면 크롤러가 noindex 메타태그를 못 본다는 핵심 원리 설명
- 올바른 패턴: robots.txt 차단 해제 + noindex 메타태그 유지 권장
- "Indexed, though blocked by robots.txt" Search Console 경고 언급

#### 테스트 케이스 2: og:image 사양과 Twitter Card 차이

**기대 결과:**
SKILL.md 섹션 2 내용을 인용해야 한다.
- og:image는 `property` 속성, twitter:image는 `name` 속성
- 권장 크기 1200×630 (1.91:1) — Facebook/LinkedIn/X 모두 호환
- twitter:image 없으면 og:image로 폴백 (별도로 둘 필요 없음)
- twitter:card는 summary_large_image 권장

#### 테스트 케이스 3: 50,000 URL 초과 사이트의 sitemap 구조

**기대 결과:**
SKILL.md 섹션 4 "크기·개수 제한" + "sitemap index" 인용해야 한다.
- 단일 sitemap 50,000 URL / 50MB 제한
- sitemap index 사용 (sitemap-index.xml이 sitemap-0.xml, sitemap-1.xml, ... 참조)
- gzip 압축 권장하되 압축 해제 후 50MB 이하여야 함

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (24/24 클레임 VERIFIED) |
| 구조 완전성 | ✅ (모든 필수 항목 포함, 9개 섹션) |
| 실용성 | ✅ (실제 코드 예시 + 흔한 실수 13건 + 발행 전 체크리스트) |
| 에이전트 활용 테스트 | ✅ (3/3 PASS, 2026-06-01, skill-tester → general-purpose) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester 호출로 content test 수행 (2026-06-01 완료, 3/3 PASS)
- [❌] AMP·schema.org 구조화 데이터 작성은 별도 `schema-org-patterns` 스킬에서 다룰 예정 (차단 요인 아님, 선택 보강)
- [❌] hreflang 다국어 SEO 상세는 별도 `i18n-seo` 스킬에서 다룰 예정 (차단 요인 아님, 선택 보강)
- [❌] AI 크롤러(GPTBot/ClaudeBot 등) 제어는 별도 `geo-ai-discoverability` 스킬에서 다룰 예정 (차단 요인 아님, 선택 보강)
- [❌] Bing Webmaster Tools 고유 메타태그(`msvalidate.01` 등)는 본 스킬 범위 외 (차단 요인 아님, 선택 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-01 | v1 | 최초 작성. 공식 문서 9개 + 보조 8개 소스에서 24개 클레임 교차 검증 완료. PENDING_TEST 상태로 저장 (skill-tester 호출은 사용자 지시로 보류) | skill-creator |
| 2026-06-01 | v1 | 2단계 실사용 테스트 수행 (Q1 noindex+Disallow 충돌 / Q2 OG+TwitterCard property vs name / Q3 50,000 URL 초과 sitemap) → 3/3 PASS, APPROVED 전환 | skill-tester |
