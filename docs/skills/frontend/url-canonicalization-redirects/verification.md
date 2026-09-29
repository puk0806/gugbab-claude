---
skill: url-canonicalization-redirects
category: frontend
version: v1.3
date: 2026-09-28
status: APPROVED
---

# url-canonicalization-redirects 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `url-canonicalization-redirects` |
| 스킬 경로 | `.claude/skills/frontend/url-canonicalization-redirects/SKILL.md` |
| 검증일 | 2026-09-28 (최초 2026-06-02) |
| 검증자 | skill-creator |
| 스킬 버전 | v1.2 |

---

## 1. 작업 목록 (Task List)

- [✅] Google Search Central 공식 문서 확인 (consolidate-duplicate-urls, canonicalization)
- [✅] MDN HTTP Redirections 공식 가이드 확인 (301/302/303/307/308)
- [✅] Next.js 공식 trailingSlash / middleware / generateMetadata 문서 확인 (16.x 기준)
- [✅] Vercel Configuration Redirects 공식 문서 확인
- [✅] Netlify Redirect options 공식 문서 확인
- [✅] Cloudflare Pages Redirects 공식 문서 확인
- [✅] Nginx 공식 "If is Evil" 가이드 확인
- [✅] John Mueller redirect chain 권장(<5 hops) 교차 확인 (Search Engine Journal)
- [✅] rel=prev/next deprecated 사실 교차 확인 (Yoast, Ahrefs, Google 공식 발표)
- [✅] 트래킹 파라미터(utm/fbclid/gclid) 처리 베스트 프랙티스 확인
- [✅] 7대 정규화 축 / 결정 트리 / 호스팅별 비교 / 흔한 실수 패턴 작성
- [✅] SKILL.md 파일 작성 (450행 내외)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8섹션 구조 확인 |
| 중복 확인 | Glob | `.claude/skills/**/url-canonicalization-redirects/SKILL.md` | 없음, 신규 생성 |
| 조사 1 | WebSearch | "Google Search Central consolidate duplicate URLs canonical" | 10건, 1순위 공식 URL 확보 |
| 조사 2 | WebSearch | "MDN HTTP redirections 301 302 307 308 method preservation" | 10건, MDN 공식 URL 확보 |
| 조사 3 | WebSearch | "Next.js 15 trailingSlash redirects middleware canonical metadata alternates" | 8건, Next.js 공식 URL 다수 |
| 조사 4 | WebSearch | "Vercel vercel.json redirects rewrites configuration documentation" | 9건, Vercel 공식 URL |
| 조사 5 | WebSearch | "Netlify _redirects file syntax 301 trailing slash documentation" | 9건, Netlify 공식 + 한계 명시(슬래시 추가/제거 불가) |
| 조사 6 | WebSearch | "Nginx 301 redirect http to https trailing slash if is evil best practice" | 3건, "If is Evil" 원칙 확인 |
| 조사 7 | WebSearch | "Astro build.format trailing slash configuration default" | 9건, build.format 기본 'directory' 확인 |
| 조사 8 | WebSearch | "Google John Mueller redirect vs canonical strong signal precedence" | 10건, Mueller 입장 다수 일치 |
| 조사 9 | WebSearch | "Cloudflare Pages _redirects file syntax 301 wildcard" | 10건, status 코드/한도 명시 |
| 조사 10 | WebSearch | "Google tracking parameters utm fbclid canonical URL parameter handling" | 8건, canonical로 처리 권장 일치 |
| 조사 11 | WebSearch | "redirect chain SEO crawl budget Google John Mueller maximum hops" | 9건, "<5 hops" 권장 일치 |
| 조사 12 | WebSearch | "rel=prev next deprecated Google pagination canonical self-reference" | 9건, 2019년 deprecated 일치 |
| 본문 조사 | WebFetch | developers.google.com/search/.../consolidate-duplicate-urls | 신호 강도 redirect>canonical>sitemap 확인 |
| 본문 조사 | WebFetch | developer.mozilla.org/.../HTTP/Guides/Redirections | 301-308 비교표 + meta refresh/JS 경고 확인 |
| 본문 조사 | WebFetch | nextjs.org/docs/app/api-reference/config/next-config-js/trailingSlash | Next.js 16.x trailingSlash 동작 + .well-known 예외 확인 |
| 본문 조사 | WebFetch | vercel.com/docs/routing/redirects/configuration-redirects | permanent:true→308, 한도 2048개, .well-known 예외 확인 |
| 본문 조사 | WebFetch | docs.netlify.com/.../redirect-options/ | 슬래시 추가/제거 불가 한계 + ! 강제 redirect 문법 확인 |
| 본문 조사 | WebFetch | developers.cloudflare.com/pages/configuration/redirects/ | 한도 2000+100, 도메인 정규화 미지원, status 301/302/303/307/308 확인 |
| 교차 검증 | WebSearch | 핵심 클레임 12건 × 2~3 소스 | VERIFIED 11 / DISPUTED 1 / UNVERIFIED 0 |
| 작성 | Write | SKILL.md (12개 섹션, 약 450행) | 파일 생성 완료 |
| 작성 | Write | verification.md | 본 파일 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Google Search Central — Consolidate duplicate URLs | https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls | ⭐⭐⭐ High | 2026-06-02 | 공식 문서, 정규화 신호 강도 출처 |
| Google Search Central — URL Canonicalization | https://developers.google.com/search/docs/crawling-indexing/canonicalization | ⭐⭐⭐ High | 2026-06-02 | 공식 문서 |
| MDN — HTTP Redirections | https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections | ⭐⭐⭐ High | 2026-06-02 | 공식 표준 |
| Next.js — trailingSlash | https://nextjs.org/docs/app/api-reference/config/next-config-js/trailingSlash | ⭐⭐⭐ High | 2026-06-02 | Next.js 16.2.7 lastUpdated 2026-06-01 |
| Next.js — Middleware | https://nextjs.org/docs/app/api-reference/file-conventions/middleware | ⭐⭐⭐ High | 2026-06-02 | 공식 문서 |
| Next.js — generateMetadata | https://nextjs.org/docs/app/api-reference/functions/generate-metadata | ⭐⭐⭐ High | 2026-06-02 | 공식 문서 |
| Vercel — Configuration Redirects | https://vercel.com/docs/routing/redirects/configuration-redirects | ⭐⭐⭐ High | 2026-06-02 | lastUpdated 2026-03-05 |
| Netlify — Redirect options | https://docs.netlify.com/manage/routing/redirects/redirect-options/ | ⭐⭐⭐ High | 2026-06-02 | 공식 문서 |
| Cloudflare Pages — Redirects | https://developers.cloudflare.com/pages/configuration/redirects/ | ⭐⭐⭐ High | 2026-06-02 | 공식 문서 |
| Nginx — If is Evil | https://nginx.com/resources/wiki/start/topics/depth/ifisevil/ | ⭐⭐⭐ High | 2026-06-02 | Nginx 공식 위키 |
| Search Engine Journal — Mueller "<5 hops" | https://www.searchenginejournal.com/googles-john-mueller-recommends-less-than-5-hops-per-redirect-chain/344664/ | ⭐⭐ Medium | 2026-06-02 | Mueller 발언 인용 |
| Yoast — rel=prev/next deprecated | https://yoast.com/google-doesnt-use-rel-prev-next-for-pagination/ | ⭐⭐ Medium | 2026-06-02 | Google 공식 발표 보도 |
| Ahrefs — rel=prev/next pagination | https://ahrefs.com/blog/rel-prev-next-pagination/ | ⭐⭐ Medium | 2026-06-02 | 교차 검증 소스 |
| Astro Docs — Configuration Reference (build.format) | https://docs.astro.build/en/reference/configuration-reference/ | ⭐⭐⭐ High | 2026-06-02 | Astro 공식 문서 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보 명시 (Next.js 16.x, Astro 5.x, 2026-06-02 기준)
- [✅] deprecated된 패턴(`rel=prev/next`, meta refresh, JS redirect for SEO)을 권장하지 않음 — 흔한 실수 섹션에서 명시
- [✅] 코드 예시(Next.js middleware, vercel.json, _redirects, Nginx)가 실행 가능한 형태

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description, 예시 3개)
- [✅] 소스 URL과 검증일 명시 (헤더 + 섹션 12)
- [✅] 핵심 개념(7대 정규화 축, 신호 강도, status code 차이) 설명 포함
- [✅] 코드 예시 7개 이상 (Next.js config, middleware, metadata, vercel.json, Netlify, Cloudflare, Nginx)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (결정 트리, 레이어 선택 기준)
- [✅] 흔한 실수 패턴 8개 포함 (섹션 10)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움되는 수준 (config/코드 직접 복사 가능)
- [✅] 지나치게 이론적이지 않고 실용 예시 포함 (호스팅별 한계까지 명시)
- [✅] 범용적 — 특정 프로젝트 종속 없음

### 4-4. 교차 검증 결과

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | Google 정규화 신호 강도: redirect > canonical > sitemap | VERIFIED | Google 공식 (consolidate-duplicate-urls), Mueller 인용 다수 |
| 2 | 301: GET은 안전, 비-GET은 메서드 변경 가능 / 308: 메서드 보존 | VERIFIED | MDN 공식 + RFC 9110 인용 |
| 3 | 302 vs 307: 메서드 보존 여부 차이 | VERIFIED | MDN 공식 |
| 4 | 303: POST→GET 변환 (Post/Redirect/Get 패턴) | VERIFIED | MDN 공식 |
| 5 | redirect chain 권장 <5 hops (이상적 1 hop) | VERIFIED | Mueller 발언 SEJ 인용, 다수 소스 일치 |
| 6 | Google이 한 크롤당 5 hops까지만 따라감 | VERIFIED | SEJ + 보충 소스들 일치 |
| 7 | Next.js 기본 trailingSlash=false, /about/ → /about | VERIFIED | Next.js 16.2.7 공식 문서 직접 확인 |
| 8 | Next.js trailingSlash redirect는 308 사용 | VERIFIED | Next.js 공식 + 메서드 보존 의도 일관 |
| 9 | Next.js `.well-known/` 와 확장자 파일은 슬래시 예외 | VERIFIED | Next.js 공식 명시 |
| 10 | Astro build.format 기본 'directory' (슬래시 유) | VERIFIED | Astro 공식 문서 |
| 11 | Vercel permanent:true → 308 / permanent:false → 307 | VERIFIED | Vercel 공식 명시 |
| 12 | Vercel /.well-known 정규화 대상 제외 | VERIFIED | Vercel 공식 명시 |
| 13 | Netlify _redirects 기본 status 301, ! 접미사로 강제 | VERIFIED | Netlify 공식 |
| 14 | Netlify는 트레일링 슬래시 자체를 redirect로 추가/제거 불가 | VERIFIED | Netlify 공식 명시 (한계 항목) |
| 15 | Cloudflare Pages _redirects 기본 status 302, 한도 2000+100 | VERIFIED | Cloudflare 공식 |
| 16 | Cloudflare Pages _redirects는 도메인 정규화/쿼리 조건 미지원 | VERIFIED | Cloudflare 공식 명시 |
| 17 | Nginx 호스트 분기는 if보다 server block 분리 권장 ("If is Evil") | VERIFIED | Nginx 공식 위키 |
| 18 | rel=prev/next 2019년 Google 인덱싱 신호 사용 중단 | VERIFIED | Google 공식 발표 + Yoast/Ahrefs 인용 |
| 19 | 페이지네이션 페이지는 자기참조 canonical 사용 | VERIFIED | Google + Yoast 일치 |
| 20 | utm/fbclid는 사용자 redirect 하지 않고 canonical에서 제거 | VERIFIED | Google + 다수 SEO 가이드 일치 |
| 21 | meta refresh / JS redirect는 SEO 정규화에 약한 신호 | VERIFIED | MDN 경고 + Google 권장 사항 |
| 22 | canonical과 redirect 신호 충돌 시 신뢰도 저하 | VERIFIED | Mueller 명시 |
| 23 | Next.js 14/15 metadata.alternates.canonical에서 슬래시 normalize 이슈 | DISPUTED | next.js Discussion #65323에서 보고됨. 절대 URL + trailingSlash 일치 표기로 회피 가능. SKILL.md에 `> 주의:` 표기 |

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-02, skill-tester → general-purpose 대체 / **2026-09-28 재테스트**, Vercel·Netlify 정적 프리렌더 트레일링 슬래시 보강분 겨냥 2문항)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답 시 스킬 내용 보완 (Q2 PARTIAL → 보강 권장 항목 기록 / 2026-09-28 재테스트는 2/2 PASS로 보완 불필요)

---

## 5. 테스트 진행 기록

### [2026-09-28] skill-tester 재테스트 — 정적 프리렌더 트레일링 슬래시 보강분(Vercel/Netlify/Cloudflare Pages) 확인

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션 존재 여부 확인. 직전 orchestrator 배치가 반영한 "정적 프리렌더 페이지 트레일링 슬래시 제어" 보강분(섹션 6-1 Vercel `trailingSlash`, 6-2 Netlify Pretty URLs)을 직접 겨냥.

### 실제 수행 테스트

**Q1. Vite SPA를 정적 빌드해 Vercel에 배포, `/about`·`/about/` 둘 다 200으로 서빙됨 — 슬래시 없는 쪽으로 강제 통일하려면 vercel.json에 무엇을 추가하고 어떤 상태 코드가 나오는가**
- ✅ PASS
- 근거: SKILL.md "6-1. Vercel (`vercel.json`)" 331~346행 표
- 상세: `trailingSlash: false` 설정 시 `/about/` → `/about`으로 **308** redirect됨을 정확히 답변. 346행의 "정적(SSG) 산출물도 이 설정이 적용된다"까지 근거로 제시해 Vite SPA(서버 정규화 없음)에 적용 가능함을 정확히 판단. 344행의 미지정 시 "비권장" 경고까지 인용해 현재 겪는 증상(둘 다 200)과 정확히 매칭. 경미 gap: `redirects` 배열(path별, 326행)과 `trailingSlash` 최상위 옵션(사이트 전체, 331행)의 관계가 명시적으로 설명되어 있지 않음(선택 보강, 차단 요인 아님).

**Q2. Netlify Pretty URLs(자동 forward)를 `_redirects` 규칙으로 끌 수 있는가**
- ✅ PASS
- 근거: SKILL.md "6-2. Netlify (`_redirects`)" 367행 주의문 + "6-4. 호스팅 비교표" 397행
- 상세: `_redirects`/`netlify.toml`로는 끌 수 없고 반드시 **대시보드 Project configuration → Developer settings → Post processing → Pretty URLs** 토글에서 조정해야 한다는 것, CDN edge가 redirect 규칙보다 먼저 URL을 정규화한다는 근거까지 정확히 인용. gap 없음.

### 발견된 gap

- 선택 보강(차단 요인 아님): Vercel `vercel.json`의 path별 `redirects` 배열과 사이트 전체 `trailingSlash` 옵션의 관계를 좀 더 명시적으로 구분 설명하면 좋음.

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: content test로 충분한 카테고리 (URL 정규화 베스트 프랙티스 가이드 — 실행 결과·빌드 산출물이 아니라 답변 정확성으로 검증 가능)
- 최종 상태: **PENDING_TEST → APPROVED** (정적 프리렌더 트레일링 슬래시 보강분 재테스트 2/2 PASS)

---

### [2026-09-28] 선택 보강 반영 — 정적 프리렌더 페이지 트레일링 슬래시(Vercel/Netlify/Cloudflare Pages)

- 반영 내용:
  - SKILL.md "6-1. Vercel" 절에 `vercel.json`의 `trailingSlash`(boolean) 설정 추가 — `false`(슬래시 있는 경로 → 308로 제거)/`true`(슬래시 없는 경로 → 308로 추가, 단 확장자 있는 경로는 제외)/미지정(redirect 없음, Vercel이 비권장) 3가지 값과 정확한 동작 표로 정리
  - "6-2. Netlify" 절에 Pretty URLs(기본 활성화) 상세 — `/about`→`/about/` forward, `/about.html`→`/about/` rewrite, 끄려면 `_redirects`가 아니라 대시보드 Post processing 토글에서만 가능, CDN edge가 redirect 규칙 적용 전에 정규화한다는 근거 추가
  - "6-3. Cloudflare Pages" 절에 "사이트 전체 자동 정규화 옵션이 없다 — `_redirects`에 라우트별로 직접 작성, 대량이면 Bulk Redirects/Transform Rules" 문단 추가
  - "6-4. 호스팅 비교표"를 위 3건에 맞춰 정확한 메커니즘으로 갱신(기존 "프로젝트 도메인 설정"/"수동" 같은 모호한 표현 → 구체적 설정 방법)
- 근거: 각 공식 문서 WebFetch로 확인
  - Vercel: https://vercel.com/docs/project-configuration/vercel-json#trailingslash — "When `trailingSlash: false`... 308... `/about/` will redirect to `/about`", "When `trailingSlash: true`... `/about` will redirect to `/about/`... paths with a file extension will not redirect", "When `trailingSlash: undefined`... not recommended because it could lead to search engines indexing two different pages with duplicate content"
  - Netlify: https://docs.netlify.com/manage/routing/redirects/redirect-options/ — "You cannot use a redirect rule to add or remove a trailing slash", "When Pretty URLs are enabled, Netlify forwards paths like `/about` to `/about/`... and rewrites paths like `/about.html` to `/about/`", "Our CDN edge nodes do URL normalization before the redirect rules kick in"
  - Cloudflare Pages: https://developers.cloudflare.com/pages/configuration/redirects/ — 문서에 사이트 전체 자동 슬래시 정규화 기능 언급 없음, `_redirects` 예시(`/trailing /trailing/ 301` 형태)로 라우트별 수동 작성만 제시됨. 대량 케이스는 기존 SKILL.md에 이미 있던 Bulk Redirects/Transform Rules 안내와 연결
- status 영향: 새 사실(설정 방법·정확한 동작) 추가이므로 PENDING_TEST 전환 — 메인의 skill-tester 재테스트 필요

### [2026-09-28] skill-tester content test 재테스트 — Astro 7.x SSR trailingSlash 상태코드 ADD 반영 확인

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션 존재 여부 확인. Q1은 2026-09-28 재검증(2차)에서 신설된 "Astro trailingSlash — SSR redirect 상태 코드" 표(섹션 4)를 직접 겨냥.

### 실제 수행 테스트

**Q1. Astro 7.x SSR 배포에서 `trailingSlash: 'never'` 설정 시 `/about/` 요청에 308이 오는 게 맞는가 + 정적 프리렌더 페이지에도 적용되는가**
- ✅ PASS
- 근거: SKILL.md "4. 트레일링 슬래시 — Astro trailingSlash — SSR redirect 상태 코드" 표(189~199행)
- 상세: `'never'` → 308이 표에 정확히 명시되어 정상 동작으로 답변. 정적 프리렌더 페이지는 "호스팅 플랫폼이 처리하며 이 설정을 따르지 않을 수 있다"는 199행 주의문까지 근거로 제시해 SSR과 정적 배포를 구분함. 경미 gap: 어떤 호스팅이 구체적으로 어떻게 override하는지는 SKILL.md에 없음(선택 보강, 차단 요인 아님 — Astro 어댑터별 세부는 스킬 범위 밖).

**Q2. www→non-www + 대소문자 통일을 next.config.js의 redirects()로 처리 가능한가**
- ✅ PASS
- 근거: SKILL.md "5-2. 동적 호스트 정규화 (middleware)" 238행("`redirects()`는 path 기반이라 호스트 정규화에는 적합하지 않다. middleware에서 처리한다") + 251~260행 코드(www 제거 + 소문자화 로직)
- 상세: redirects()로는 불가하고 middleware.ts에서 처리해야 한다는 것과 실제 코드(www 제거·소문자 변환 두 로직 모두)가 정확히 근거로 제시됨. gap 없음.

### 발견된 gap

- 선택 보강(차단 요인 아님): 정적 프리렌더 페이지에서 호스팅 플랫폼별로 트레일링 슬래시를 구체적으로 어떻게 override하는지(예: Vercel/Netlify 각각의 실제 동작) 세부 명시 없음.

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: content test로 충분한 카테고리 (URL 정규화 베스트 프랙티스 가이드)
- 최종 상태: **PENDING_TEST → APPROVED 복귀** (Astro 7.x 정정 + SSR trailingSlash ADD 반영 후 재테스트 2/2 PASS)

---

**수행일**: 2026-06-02
**수행자**: skill-tester → general-purpose (세션 내 직접 검증)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Next.js 사이트에서 http+www / http+non-www / https+www를 모두 https+non-www로 통일하려면?**
- 결과: PASS
- 근거: SKILL.md "5-2. 동적 호스트 정규화 (middleware)" 섹션 — `next.config.js`의 `redirects()`는 path 기반이라 호스트 정규화 불가, middleware에서 `host.startsWith('www.')` 감지 후 `url.host` 교체 코드 예시 존재. 섹션 4에서 `trailingSlash: false` 설정으로 슬래시 제거. 섹션 9 레이어 선택 기준에서 http→https는 CDN/Edge(Vercel이 자동 처리), www→non-www도 CDN/Edge 우선 명시. 섹션 5-2 주의1에서 Vercel CDN 앞단 https 처리 주의사항까지 포함.
- anti-pattern 회피 확인: `if` 블록 사용 금지(섹션 7 Nginx 패턴 적용), 다단 hop 금지(섹션 10-7), 단순 `next.config.js redirects()` 오용 금지(5-2 명시) — 모두 SKILL.md에 경고 포함

**Q2. Vercel에 호스팅하는 Vite SPA에서 트레일링 슬래시 강제 제거하려면?**
- 결과: PARTIAL
- 근거: SKILL.md "4. 트레일링 슬래시" 표 — Vite SPA는 "호스팅 레이어에 위임", Vercel/Netlify/Nginx 설정 명시. "6-1. Vercel (vercel.json)" 섹션에 path별 redirect 구조 예시 있음.
- gap 발견: vercel.json에서 트레일링 슬래시 *일괄* 제거를 위한 와일드카드 패턴(`/(*)/` → `/$1` 형태)이 SKILL.md에 명시되어 있지 않음. path별 개별 redirect 예시만 존재. 섹션 6-4 호스팅 비교표의 Vercel "슬래시 자동 정규화" 항목이 "프로젝트 도메인 설정"으로만 설명되어 실제 구현 경로 불명확.

**Q3. 기존 사이트가 redirect chain이 4단인데 SEO에 어떤 영향이고 어떻게 줄이나?**
- 결과: PASS
- 근거: SKILL.md "0. TL;DR" — "1 hop이 이상, 최대 5 hops 미만 (Google John Mueller)". "10-2. redirect chain 3단 이상" — 4단 chain 예시와 1 hop으로 합치는 방법 코드 포함. "10-7" — Nginx에서 최종 형태로 한 번에 보내는 예시. 섹션 0에서 "Googlebot은 한 크롤 시도 당 5 hops까지만 따라간다. 그 이상이면 최종 URL이 색인되지 않을 수 있다" 명시.
- 4단 chain은 5 hops 미만이라 기술적으로 Googlebot이 따라가나, SKILL.md가 "이상적으로 1 hop"으로 해결책까지 제시.

### 발견된 gap

- **섹션 6-1 (Vercel vercel.json)**: 트레일링 슬래시 일괄 제거용 와일드카드 redirect 패턴 예시 누락. `{ "source": "/:path+/", "destination": "/:path+", "permanent": true }` 형태의 범용 예시 추가 권장.

### 판정

- agent content test: 2 PASS / 1 PARTIAL / 0 FAIL
- verification-policy 분류: content test로 충분한 카테고리 (URL 정규화 베스트 프랙티스 가이드)
- 최종 상태: APPROVED (핵심 기능 2/3 PASS, PARTIAL은 보강 권장 수준으로 차단 요인 아님)

### 참고 — 테스트 케이스 원안 (skill-creator 예정분)

**예상 Q1**: "www → non-www + http → https + 트레일링 슬래시 제거를 Next.js에서 한 번에 처리하려면?"
**기대 답변 경로**: SKILL.md 섹션 5-2 (middleware 예제) + 섹션 4 (trailingSlash 옵션) + 섹션 10-2 (chain 최소화).

**예상 Q2**: "utm/fbclid 파라미터로 들어온 사용자 URL이 sitemap과 다른 형태로 색인되고 있다."
**기대 답변 경로**: SKILL.md 섹션 8 (사용자 redirect 금지 + canonical에서 제거) + 섹션 11 체크리스트.

**예상 Q3**: "Vite SPA를 Cloudflare Pages에 올리는데 www → non-www redirect가 안 된다."
**기대 답변 경로**: SKILL.md 섹션 6-3 (Cloudflare Pages _redirects는 도메인 정규화 미지원, Rules 사용해야 함).

---

### [2026-09-28] 재검증(2차) — Astro 5.x→7.x 버전 표기 정정 + SSR trailingSlash 상태코드 ADD

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 4개를 1차 소스(Astro 공식 문서, Next.js 공식 문서, npm registry)와 대조, 보강 검토

**클레임 대조 결과**:
1. Astro 최신 메이저 버전이 5.x라는 표기 → **DISPUTED(정정)** — 2026-03-10 Astro 6.0 정식 출시, 이후 7.x까지 승급(npm `astro@latest` = 7.3.5, https://astro.build/blog/astro-6/, https://registry.npmjs.org/astro/latest)
2. Astro `build.format` 기본값 `'directory'`(슬래시 유) — **VERIFIED**, 6.x/7.x에서도 불변 (https://docs.astro.build/en/reference/configuration-reference/)
3. Astro `trailingSlash: 'never'` 옵션이 유효한 설정값인가 — **VERIFIED**, `'ignore'`(기본)/`'always'`/`'never'` 3값 체계 불변, SSR 위반 시 `'always'`→301, `'never'`→308 redirect (동일 공식 문서, 기존 SKILL.md에 미기재된 세부 사항)
4. Next.js 최신 버전이 16.x 계열인가(15.x 아님) — **VERIFIED**, npm `next@latest` = 16.3.6 (https://registry.npmjs.org/next/latest), trailingSlash 기본 동작(`/about/`→`/about`) 문서상 불변 확인 (2026-09-07 갱신 문서)

**보강(ADD)·축소**: 섹션 4에 "Astro trailingSlash — SSR redirect 상태 코드" 표 신설 — `'ignore'`/`'always'`(301)/`'never'`(308) 3값과 "정적 프리렌더 페이지는 호스팅 플랫폼이 슬래시를 처리하며 이 설정을 따르지 않을 수 있다"는 Astro 공식 주의사항 추가. 헤더 검증 대상 버전을 Astro 7.x로 정정. 축소 없음.

**실전 질문 재검증**:
- Q1. "Astro 6/7에서 SSR로 배포한 사이트가 `/about/`으로 들어온 요청에 308을 내려주는 이유는?" → SKILL.md "5. Next.js... Astro trailingSlash — SSR redirect 상태 코드" 표 근거로 PASS (`trailingSlash: 'never'` 설정 시 SSR이 308 자동 redirect)
- Q2. "Astro 정적 빌드(SSG)에서 트레일링 슬래시가 설정과 다르게 나온다" → 표 하단 "주의" 문구(호스팅 플랫폼이 정적 프리렌더 슬래시를 처리) 근거로 PASS

**재검증 최종 판정**: status **PENDING_TEST 전환** (버전 표기 정정 + 신규 ADD 발생 — 메인의 skill-tester 재테스트 대상)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 교차 검증 | ✅ (VERIFIED 22 / DISPUTED 1 / UNVERIFIED 0, 2026-09-28 재검증 4건 추가: VERIFIED 3 / DISPUTED-정정 1) |
| 에이전트 활용 테스트 | ✅ (2026-06-02, Q1 PASS / Q2 PARTIAL / Q3 PASS, 2/3 PASS + 2026-09-28 Astro 7.x 재테스트 2/2 PASS + **2026-09-28 정적 프리렌더 보강분 재테스트 2/2 PASS** — Vercel `trailingSlash`·Netlify Pretty URLs 확인) |
| **최종 판정** | **APPROVED** (2026-09-28 선택 보강 — Vercel/Netlify/Cloudflare Pages 정적 프리렌더 트레일링 슬래시 제어 방법 반영분에 대해 skill-tester 재테스트 2/2 PASS 완료) |

---

## 7. 개선 필요 사항

- [✅] skill-tester 호출 후 verification.md 섹션 5/6/7/8 업데이트 (2026-06-02 완료, 2/3 PASS → APPROVED / **2026-09-28 Astro 7.x ADD분 재테스트 완료, 2/2 PASS → APPROVED 복귀**)
- [✅] Vercel vercel.json 트레일링 슬래시 일괄 제거 와일드카드 패턴 누락 확인 (2026-06-02 Q2 PARTIAL에서 발견, 섹션 6-1 보강 권장 — 차단 요인 아닌 선택 보강)
- [❌] Next.js metadata.alternates.canonical 슬래시 normalize 이슈가 Next.js 16.x에서 수정되었는지 후속 확인 (Discussion #65323 트래킹) — 선택 보강, APPROVED 상태에 차단 요인 아님
- [❌] Apache `.htaccess` 예시는 작성 범위에서 제외함. 레거시 환경 사용자가 늘면 추가 섹션 검토 — 선택 보강
- [✅] (2026-09-28 반영) 정적 프리렌더 페이지의 트레일링 슬래시를 호스팅 플랫폼별로 구체적으로 어떻게 override하는지 세부 명시 — Vercel `trailingSlash` boolean(공식 문서 3값 표), Netlify Pretty URLs(대시보드 토글, `_redirects` 불가), Cloudflare Pages(자동 정규화 없음, 라우트별 수동/Bulk Redirects) 반영. **2026-09-28 skill-tester 재테스트 완료(2/2 PASS) → PENDING_TEST에서 APPROVED로 전환**

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-02 | v1 | 최초 작성. Google Search Central + MDN + Next.js 16.x + Vercel/Netlify/Cloudflare Pages + Nginx 공식 문서 기반. 7대 정규화 축, 301-308 결정 트리, 호스팅별 패턴 7종, 흔한 실수 8종 정리. 교차 검증 23 클레임 (VERIFIED 22 / DISPUTED 1). | skill-creator |
| 2026-06-02 | v1 | 2단계 실사용 테스트 수행 (Q1 Next.js 호스트+슬래시 정규화 / Q2 Vercel Vite SPA 슬래시 제거 / Q3 redirect chain 4단 SEO 영향) → 2/3 PASS 1 PARTIAL, APPROVED 전환. 섹션 5·6·7·8 동기화. | skill-tester |
| 2026-08-26 | v1.1 | freshness 재검증(85일 경과) — 신호 강도·rel=prev/next 폐기·308·Next.js 16 trailingSlash VERIFIED. **갭 발견**: 분리 모바일 호스트(m-dot) 정규화가 7대 축에 없음 → TL;DR 결정 트리에 행 추가(UA 리다이렉트 금지·양방향 교차 지정), 상세 코드는 `mobile-seo-pwa` 1-4절로 위임(Google mobile-first indexing 공식 문서 원문 확인) | freshness-auditor + orchestrator |
| 2026-09-28 | v1.2 | 재검증(2차, 33일 경과) — Astro 최신 버전 표기가 5.x로 정체된 것을 발견해 7.x로 정정(2026-03 Astro 6 출시 → 이후 7.x, npm 확인). Next.js 16.3.6/trailingSlash 기본 동작 VERIFIED 유지. **ADD**: 섹션 4에 Astro `trailingSlash`(`'ignore'`/`'always'`/`'never'`) SSR redirect 상태코드(301/308) 표 신설, 정적 프리렌더 예외 주의사항 추가. status APPROVED → PENDING_TEST 전환 | orchestrator (2차 재검증 배치) |
| 2026-09-28 | v1.2 | 2단계 실사용 테스트 재테스트 수행 (Q1 Astro 7.x SSR trailingSlash 'never' 308 동작+정적 프리렌더 예외 / Q2 www→non-www+대소문자 통일이 redirects()로 가능한지) → 2/2 PASS, **PENDING_TEST → APPROVED 복귀** | skill-tester |
| 2026-09-28 | v1.3 | 선택 보강 반영 — 각 공식 문서(Vercel vercel.json#trailingslash, Netlify redirect-options, Cloudflare Pages redirects) 확인 후 정적 프리렌더 페이지 트레일링 슬래시 제어 방법을 6-1·6-2·6-3·6-4에 구체화(Vercel boolean 3값 표, Netlify Pretty URLs 상세, Cloudflare Pages 수동/Bulk Redirects). status APPROVED → PENDING_TEST (메인 skill-tester 재테스트 필요) | orchestrator (선택 보강 반영 배치) |
| 2026-09-28 | v1.3 | 2단계 실사용 재테스트 수행 (Q1 Vercel `trailingSlash` 정적 프리렌더 강제 통일 / Q2 Netlify Pretty URLs `_redirects`로 끌 수 있는지) → 2/2 PASS, **PENDING_TEST → APPROVED** 전환. 섹션 5·6·7·8 동기화 | skill-tester |
