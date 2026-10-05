## 6. 정적 사이트 생성기별 SEO 패턴

### Astro — @astrojs/sitemap (공식)

설치 및 설정:
```bash
npx astro add sitemap
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',  // 필수
  integrations: [sitemap({
    filter: (page) => !page.includes('/draft/'),
    customPages: ['https://example.com/external-page'],
    entryLimit: 45000,  // 기본값 45000
  })],
});
```

빌드 결과: `dist/sitemap-index.xml` + `dist/sitemap-0.xml`. 50,000 URL 한계에 가까울 경우 자동으로 분할된다.

메타태그·OG는 레이아웃 컴포넌트에서 props로 받아 head에 출력하는 패턴 권장.

### 11ty (Eleventy) — @quasibit/eleventy-plugin-sitemap

```bash
npm install --save-dev @quasibit/eleventy-plugin-sitemap
```

```js
// .eleventy.js
const sitemap = require('@quasibit/eleventy-plugin-sitemap');

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(sitemap, {
    sitemap: { hostname: 'https://example.com' },
  });
};
```

```liquid
---
permalink: /sitemap.xml
layout: null
eleventyExcludeFromCollections: true
---
{% sitemap collections.all %}
```

페이지별 frontmatter로 `changefreq`·`priority` 지정 가능.

### Hugo — 내장 sitemap

별도 플러그인 불필요. Hugo가 sitemap.xml을 자동 생성한다 (sitemap.org 0.9 준수).

```toml
# hugo.toml
[sitemap]
  changefreq = ''  # 빈 값 = 출력 안 함
  filename = 'sitemap.xml'
  priority = -1     # -1 = 출력 안 함
  disable = false
```

다국어 사이트는 언어별 sitemap + 루트 sitemap index가 자동 생성된다. 페이지별 frontmatter `sitemap.changefreq`·`sitemap.priority`로 개별 지정.

| SSG | sitemap 방식 | 추가 패키지 | 자동 분할 |
|-----|-------------|-------------|:---------:|
| Astro | 공식 통합 | `@astrojs/sitemap` | ✅ (50k 자동) |
| 11ty | 커뮤니티 플러그인 | `@quasibit/eleventy-plugin-sitemap` | ❌ (직접 분할) |
| Hugo | 내장 | 없음 | ❌ (직접 분할) |

---

## 7. Lighthouse SEO 카테고리 매핑

Lighthouse SEO 감사는 8개 기본 체크를 수행한다.

| Lighthouse 항목 | 충족 조건 |
|-----------------|------------|
| `viewport` 메타태그 | `<meta name="viewport" content="width=device-width, ...">` |
| 문서 타이틀 | `<title>` 비어있지 않음 |
| meta description | `<meta name="description" content="...">` 비어있지 않음 |
| HTTP 상태 코드 | 200 (4xx·5xx 페이지는 색인 제외 의도가 아니면 감점) |
| 링크 텍스트 | "click here", "여기" 같은 일반 텍스트 대신 의미있는 anchor text |
| 크롤링 가능 링크 | `<a href>`로 작성 (JS 핸들러만으로는 감점) |
| robots.txt 유효성 | 문법 오류 없음 |
| hreflang 유효성 | 코드가 ISO 639-1·3166-1 형식 |

이미지 alt 텍스트는 SEO 카테고리가 아닌 **Accessibility 카테고리**에서 검사하지만, 검색 이미지 노출에는 필수다.

---

## 8. 흔한 실수 패턴

| 실수 | 결과 | 올바른 패턴 |
|------|------|--------------|
| canonical을 다른 페이지로 잘못 가리킴 | 자기 페이지 인덱싱 누락 | 자기참조 canonical을 기본으로 |
| sitemap에 robots.txt가 차단한 URL 포함 | 신호 모순으로 Search Console 경고 | sitemap에 인덱싱 가능한 URL만 포함 |
| viewport meta 누락 | 모바일 친화성 감점 → 모바일 검색 순위 하락 | 모든 페이지에 viewport 포함 |
| 모든 페이지가 동일한 title/description | 중복 메타 경고 | 페이지별 고유 작성 |
| http와 https 둘 다 인덱싱 가능 | 중복 콘텐츠 | https로 301 리다이렉트 |
| www와 non-www 둘 다 인덱싱 가능 | 중복 콘텐츠 | 한쪽 선택 후 301 리다이렉트 |
| `Disallow: /` + `<meta noindex>` 동시 사용 | noindex가 적용 안 됨 (크롤러가 메타태그를 못 봄) | noindex만 사용하거나 robots.txt만 사용 |
| `og:image`가 상대 경로 또는 https가 아닌 http | 소셜 미디어에서 이미지 미표시 | 절대 https URL 사용 |
| `og:image` 크기가 너무 작거나 비율 안 맞음 | Twitter는 summary로 폴백, Facebook은 크롭 | 1200×630, 5MB 이하 |
| Twitter Card에 `property` 속성 사용 | 비표준이지만 폴백 작동. 검증 도구 경고 | `name` 속성 사용 |
| sitemap에 잘못된 `lastmod` (자동 빌드 날짜) | 모든 페이지가 매일 변경된 것처럼 보임 → Google이 신뢰 떨어뜨림 | 실제 콘텐츠 수정일만 기록 |
| `meta keywords` 작성 | Google 무시. 시간 낭비 | 작성하지 않음 |
| 페이지당 canonical 여러 개 | Google이 임의 선택 | 1개만 |
| canonical이 `<body>`에 있음 | 무시됨 | `<head>` 내부에 배치 |

---

## 9. 체크리스트

새 페이지 발행 전 확인:

```
[ ] <html lang="ko"> 언어 속성
[ ] <meta charset="utf-8"> head 첫 1024바이트 이내
[ ] <meta name="viewport" content="width=device-width, initial-scale=1">
[ ] <title> 50~60자, 페이지별 고유
[ ] <meta name="description"> 50~160자, 페이지별 고유
[ ] <link rel="canonical"> 자기참조 절대 URL
[ ] og:title / og:type / og:image / og:url (4종 필수)
[ ] og:image 1200x630, 절대 https URL
[ ] twitter:card (name 속성)
[ ] meta robots (필요 시. 기본은 작성 안 해도 됨 = index, follow)
[ ] 이미지에 alt 텍스트
[ ] sitemap.xml에 포함되었는가
[ ] robots.txt가 이 URL을 차단하지 않는가
[ ] Lighthouse SEO 90+ 점수
```
