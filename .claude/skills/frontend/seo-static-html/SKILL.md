---
name: seo-static-html
description: 프레임워크 비종속 순수 HTML/정적 사이트 생성기(Astro·11ty·Hugo) 환경에서 적용 가능한 SEO 표준(메타태그·OpenGraph·canonical·sitemap·robots.txt)을 정리한 스킬
---

# Static HTML SEO 표준

> 소스:
> - Google Search Central: https://developers.google.com/search/docs/crawling-indexing/special-tags
> - Google Robots Meta Tag: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
> - Google Robots.txt Intro: https://developers.google.com/search/docs/crawling-indexing/robots/intro
> - Google Canonical: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
> - Sitemaps.org Protocol 0.9: https://www.sitemaps.org/protocol.html
> - RFC 9309 (Robots Exclusion Protocol): https://datatracker.ietf.org/doc/rfc9309/
> - OpenGraph Protocol: https://ogp.me/
> - X(Twitter) Cards Markup: https://developer.x.com/en/docs/x-for-websites/cards/overview/markup
> - Lighthouse SEO: https://developer.chrome.com/docs/lighthouse
>
> 검증일: 2026-06-01

이 스킬은 React 프레임워크(Next.js·Vite SPA)와 무관하게 **HTML 자체 표준과 정적 호스팅 환경**에 집중한다. CMS 사이트, 블로그, 랜딩 페이지, 문서 사이트, Astro/11ty/Hugo 빌드 산출물이 주 사용처다.

다음 주제는 별도 스킬에서 다룬다:
- 다국어 SEO(`hreflang`) → `i18n-seo`
- JSON-LD 구조화 데이터 → `schema-org-patterns`
- AI 크롤러(GPTBot·ClaudeBot 등) → `geo-ai-discoverability`

---

## 1. HTML head 표준 메타태그

### 필수 5종

모든 페이지의 `<head>` 시작부에 다음 5개를 둔다. 순서도 중요하다 (`charset` → `viewport` → `title` → `description` → `canonical`).

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>페이지별 고유 타이틀 — 사이트명</title>
  <meta name="description" content="페이지 내용을 50~160자 사이로 요약. 페이지마다 달라야 한다.">
  <link rel="canonical" href="https://example.com/products/123">
</head>
```

| 태그 | 권장 길이 / 값 | 비고 |
|------|-----------------|------|
| `<title>` | 50~60자 (픽셀 기준 ~600px) | 페이지마다 고유. `사이트명` 접미는 일관된 구분자 사용 |
| `meta description` | 50~160자 | Google이 검색 스니펫 재작성하는 경우 많지만 여전히 필수 |
| `meta viewport` | `width=device-width, initial-scale=1` | 모바일 친화 신호. 누락 시 Lighthouse SEO 감점 |
| `meta charset` | `utf-8` | `<head>` 첫 1024바이트 내 |
| `link rel="canonical"` | 자기참조 절대 URL | https/www/trailing slash 정규화 형태 |

> 주의: `meta name="keywords"`는 Google이 무시한다. 작성 자체가 SEO에 해가 되지는 않지만 시간 낭비.

### 검색엔진 제어 — robots 메타태그

`<meta name="robots" content="...">`로 페이지 단위 크롤링/인덱싱을 제어한다. 모든 크롤러 대상은 `robots`, Google 한정은 `googlebot`, Bing 한정은 `bingbot`.

```html
<!-- 인덱싱 차단 -->
<meta name="robots" content="noindex, nofollow">

<!-- 인덱싱하되 스니펫·이미지 미리보기 제한 -->
<meta name="robots" content="index, follow, max-snippet:160, max-image-preview:large">

<!-- 특정 날짜 이후 인덱싱 중단 (이벤트·할인 페이지 등) -->
<meta name="robots" content="unavailable_after: 2026-12-31T23:59:59+09:00">
```

| 디렉티브 | 의미 |
|----------|------|
| `index` / `noindex` | 검색 결과 노출 허용/차단 |
| `follow` / `nofollow` | 페이지 내 링크 추적 허용/차단 |
| `all` | 제한 없음 (기본값, 명시 효과 없음) |
| `none` | `noindex, nofollow`와 동일 |
| `noarchive` | 검색 결과에 캐시 링크 노출 안 함 |
| `nosnippet` | 텍스트 스니펫·동영상 미리보기 노출 안 함 |
| `max-snippet:[N]` | 스니펫 최대 N자. `0`=스니펫 없음, `-1`=Google 자율 |
| `max-image-preview:[설정]` | `none` / `standard` / `large` |
| `max-video-preview:[N]` | 영상 미리보기 N초. `0`=정지 이미지만, `-1`=무제한 |
| `notranslate` | 검색 결과 번역 제안 차단 |
| `noimageindex` | 페이지 이미지 인덱싱 차단 |
| `indexifembedded` | iframe으로 임베드된 경우만 인덱싱 허용 (noindex와 함께) |

> 주의: 충돌하는 규칙은 **더 제한적인 쪽이 적용된다**. 예: `max-snippet:50`과 `nosnippet`이 같이 있으면 `nosnippet` 적용.
> 주의: `unavailable_after`·`max-*`·`notranslate`·`noimageindex`는 **Google 전용**이다. Bing·Yandex는 지원하지 않으므로 다른 크롤러에는 별도 처리 필요.

---

## 2. OpenGraph + Twitter Card

소셜 미디어(Facebook·LinkedIn·Slack·Discord·X) 공유 시 미리보기 카드 렌더링을 결정한다. 검색 순위에 직접 영향은 없지만 클릭율(CTR)에 결정적이다.

### OpenGraph 필수 4종 + 권장 3종

ogp.me 스펙 기준 필수 속성: `og:title`, `og:type`, `og:image`, `og:url`. 권장 속성: `og:description`, `og:site_name`, `og:locale`.

```html
<!-- 필수 4종 -->
<meta property="og:title" content="페이지 타이틀">
<meta property="og:type" content="website"><!-- article, profile, video.movie 등 -->
<meta property="og:image" content="https://example.com/og-image.png">
<meta property="og:url" content="https://example.com/products/123">

<!-- 권장 3종 -->
<meta property="og:description" content="페이지 요약 (description과 같거나 더 풍부하게)">
<meta property="og:site_name" content="사이트명">
<meta property="og:locale" content="ko_KR">

<!-- og:image 구조화 속성 (선택, 권장) -->
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="이미지에 대한 짧은 설명">
```

| 속성 | 권장 값 |
|------|---------|
| `og:image` 크기 | **1200 × 630 px** (1.91:1, Facebook·LinkedIn·X 모두 호환) |
| `og:image` 안전 영역 | 중앙 1080×600 내에 텍스트·얼굴 배치 |
| `og:image` 형식 | PNG·JPG. 5MB 이하 권장 |
| `og:locale` 형식 | `언어_지역` (예: `ko_KR`, `en_US`) |
| `og:type` 기본 | `website`. 블로그 글은 `article` |

> 주의: OpenGraph는 `name`이 아니라 **`property`** 속성을 사용한다. 다른 메타태그 패턴과 다르다.

### Twitter Card (X)

`twitter:card` 값으로 카드 종류를 정한다. 가장 흔한 두 가지:

```html
<!-- summary_large_image: 큰 이미지 카드 (블로그·기사·랜딩에 적합) -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@사이트계정">
<meta name="twitter:creator" content="@작성자계정">
<meta name="twitter:title" content="페이지 타이틀">
<meta name="twitter:description" content="페이지 요약">
<meta name="twitter:image" content="https://example.com/og-image.png">
<meta name="twitter:image:alt" content="이미지 설명">
```

| 카드 종류 | 용도 | 이미지 크기 |
|-----------|------|--------------|
| `summary` | 작은 정사각 썸네일 | 최소 144×144, 1:1 |
| `summary_large_image` | 큰 가로 이미지 | 2:1 비율 (1200×600 또는 1200×675), 최소 300×157 |
| `app` | 앱 다운로드 카드 | iTunes / Google Play 메타데이터 필요 |
| `player` | 동영상·오디오 플레이어 카드 | 별도 player URL 필요 |

> 주의: Twitter Card는 **`name` 속성**을 사용한다 (OpenGraph는 `property`). Twitter 파서는 `property`로 작성된 것도 폴백으로 인식하지만 스펙상 `name`이 올바르다.
> 주의: `twitter:image`가 없으면 X는 `og:image`로 폴백한다. 별도 트위터용 이미지가 없으면 OG 이미지만 두어도 된다.
> 주의: 페이지당 `twitter:card`는 1개만 유효하다. 여러 개 있으면 마지막 값이 우선.

---

## 3. Canonical URL과 중복 콘텐츠 정규화

### 자기참조 canonical 원칙

모든 인덱싱 대상 페이지는 자기 자신을 가리키는 절대 URL `<link rel="canonical">`을 둔다. Google John Mueller 권장: "어느 URL을 인덱싱하길 원하는지 명확히 한다".

```html
<!-- https://example.com/products/123?utm_source=twitter 페이지의 head -->
<link rel="canonical" href="https://example.com/products/123">
```

### 정규화 대상

다음 변형들은 같은 콘텐츠인 경우 1개로 통일해 canonical로 가리킨다:

| 변형 | 정규화 예시 |
|------|--------------|
| `http://` ↔ `https://` | 항상 `https://` |
| `www.` ↔ non-www | 한쪽 선택 후 다른 쪽은 301 리다이렉트 |
| 트레일링 슬래시 | `/about/` 또는 `/about` 중 일관 선택 |
| 추적 파라미터 (`?utm_*`) | 파라미터 제거된 URL을 canonical로 |
| 대소문자 | 모두 소문자로 통일 |
| 인덱스 파일 | `/about/index.html` → `/about/` |

### canonical 작성 규칙

| 규칙 | 내용 |
|------|------|
| 절대 URL 사용 | `<link rel="canonical" href="https://...">`. 상대 경로 금지 |
| `<head>` 내부 | `<body>`에 있으면 무시됨 |
| 페이지당 1개만 | 여러 개 있으면 Google이 임의 선택 |
| 인덱싱 가능한 URL 가리키기 | `noindex`·`robots.txt` 차단·404 URL 가리키지 말 것 |
| sitemap·HTTP 헤더와 일치 | 다른 소스에서 다른 URL 가리키면 신호 모순 |

> 주의: Google은 canonical을 **강한 힌트(strong hint)로 받아들이지만 절대 지시가 아니다**. 다른 신호(내부 링크 패턴, sitemap, HTTPS 우선 등)와 충돌하면 다른 URL을 canonical로 선택할 수 있다.

### canonical vs hreflang

다국어 사이트에서 `hreflang`은 언어별 대체 페이지를 가리킨다. 각 언어 페이지는 **자기 자신을 canonical**로 두고, `hreflang`으로 다른 언어 페이지를 가리킨다.

```html
<!-- /ko/about 페이지 -->
<link rel="canonical" href="https://example.com/ko/about">
<link rel="alternate" hreflang="ko" href="https://example.com/ko/about">
<link rel="alternate" hreflang="en" href="https://example.com/en/about">
<link rel="alternate" hreflang="x-default" href="https://example.com/en/about">
```

> 자세한 hreflang 규칙은 `i18n-seo` 스킬 참조.

---

## 4. sitemap.xml 표준

sitemaps.org 0.9 프로토콜 기준. Google·Bing·Yandex 모두 준수한다.

### 기본 구조

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-06-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/products/123</loc>
    <lastmod>2026-05-20</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

| 태그 | 필수 여부 | 값 |
|------|:---------:|-----|
| `<urlset>` | 필수 | 네임스페이스 포함 루트 요소 |
| `<url>` | 필수 | URL 1건당 1개 |
| `<loc>` | 필수 | 2,048자 이하 절대 URL |
| `<lastmod>` | 선택 | W3C Datetime (`YYYY-MM-DD` 또는 ISO 8601 풀 형식) |
| `<changefreq>` | 선택 | `always` `hourly` `daily` `weekly` `monthly` `yearly` `never` — **힌트일 뿐** |
| `<priority>` | 선택 | `0.0`~`1.0` (기본 `0.5`) — Google은 사실상 무시 |

> 주의: Google은 `<changefreq>`·`<priority>`를 사실상 무시한다 (공식 입장). `<lastmod>`만 신호로 사용한다. 빈 lastmod보다 잘못된 lastmod가 더 해롭다.

### 크기·개수 제한

| 제한 | 값 |
|------|-----|
| 단일 sitemap URL 수 | **50,000개** |
| 단일 sitemap 파일 크기 (압축 해제 기준) | **50MB** (52,428,800 bytes) |
| sitemap index가 참조 가능한 sitemap 수 | 50,000개 |
| sitemap index 크기 | 50MB |

> 제한 초과 시 **sitemap index** 사용. gzip 압축은 권장(`.xml.gz`)되지만 압축 해제 후 50MB 이하여야 한다.

### sitemap index

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-posts.xml</loc>
    <lastmod>2026-06-01</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-products.xml</loc>
    <lastmod>2026-06-01</lastmod>
  </sitemap>
</sitemapindex>
```

### 이미지 sitemap 확장 (Google)

이미지를 검색 결과에 노출시키려면 `image:image` 태그를 추가한다. 별도 sitemap이 아니라 **기존 sitemap에 추가**한다.

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://example.com/photos</loc>
    <image:image>
      <image:loc>https://example.com/photos/sunset.jpg</image:loc>
    </image:image>
    <image:image>
      <image:loc>https://example.com/photos/beach.jpg</image:loc>
    </image:image>
  </url>
</urlset>
```

| 제한 | 값 |
|------|-----|
| URL당 `<image:image>` 최대 수 | **1,000개** |

> 주의: 2022-08-06부로 `image:caption`·`image:geo_location`·`image:title`·`image:license` 태그는 deprecated되어 인덱싱에 영향을 미치지 않는다. `image:loc`만 사용한다.

### 비디오 sitemap 확장

`video:player_loc` 또는 `video:content_loc` 중 **하나 이상 필수**다. 자세한 스키마는 `https://www.google.com/schemas/sitemap-video/1.1` 참조.

---

## 5. robots.txt 표준 (RFC 9309)

robots.txt는 2022년 9월 RFC 9309로 IETF 표준화되었다. 저자: M. Koster·G. Illyes·H. Zeller·L. Sassman (Google).

### 기본 문법

```
# 모든 크롤러에 적용
User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /admin/public/

# 특정 크롤러에만 적용
User-agent: Googlebot
Disallow: /draft/

# sitemap 위치 명시 (절대 URL, 어디에 와도 됨)
Sitemap: https://example.com/sitemap.xml
```

| 디렉티브 | 의미 |
|----------|------|
| `User-agent` | 다음 규칙들이 적용될 크롤러. `*`는 모든 크롤러 |
| `Disallow` | 크롤링 차단 경로. 빈 값은 "차단 없음" |
| `Allow` | 차단 경로 안에서 예외적으로 허용 |
| `Sitemap` | sitemap URL. 절대 URL 사용, 위치 자유 |

### 흔한 실수 — noindex와 Disallow 동시 사용

**핵심 원칙: robots.txt로 차단하면 크롤러가 noindex 메타태그를 볼 수 없다.**

잘못된 패턴:
```
# robots.txt
User-agent: *
Disallow: /secret/
```
```html
<!-- /secret/page.html의 head -->
<meta name="robots" content="noindex">
```

이 경우 Google은 `/secret/page.html`을 크롤링하지 못해 `noindex` 지시를 보지 못한다. 외부 링크로 URL이 발견되면 **본문 없이 URL만 인덱싱**될 수 있다 ("Indexed, though blocked by robots.txt" 경고).

올바른 패턴 — 인덱싱을 막으려면 둘 중 하나:

| 목표 | 방법 |
|------|------|
| URL이 검색에 나오지 않게 | `noindex` 메타태그 또는 `X-Robots-Tag: noindex` HTTP 헤더만 사용 (robots.txt로 차단 안 함) |
| 서버 부하·크롤 예산 절약 | robots.txt로 차단 (검색 결과 노출은 별개 문제) |
| 완전 비공개 | 비밀번호 보호 또는 페이지 제거 |

> 주의: robots.txt 내부의 `Noindex:` 디렉티브는 **Google이 지원하지 않는다**. 메타태그·HTTP 헤더로만 noindex 지정 가능.

### 잘 알려진 위치

robots.txt는 사이트 루트(`https://example.com/robots.txt`)에만 둔다. 서브디렉토리(`/blog/robots.txt`)는 크롤러가 읽지 않는다.

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
