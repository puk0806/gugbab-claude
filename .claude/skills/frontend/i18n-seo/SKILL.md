---
name: i18n-seo
description: >
  다국어·다지역 사이트의 SEO 가이드. hreflang(BCP 47), 다국어 sitemap, locale URL 전략(ccTLD/서브도메인/서브디렉토리),
  canonical과의 관계, 중복 콘텐츠 회피, 국가별 검색엔진(Baidu/Yandex/Naver) 고려사항을 정리한다.
  프레임워크 비종속이며 Next.js·Astro 매핑은 짧게 포함.
  <example>사용자: "ko-KR과 ko 중 뭐가 맞아? 한국어 사이트 hreflang"</example>
  <example>사용자: "다국어 sitemap.xml을 어떻게 만들지? Google이 권장하는 방식은?"</example>
  <example>사용자: "Next.js app router에서 hreflang 어떻게 박아?"</example>
---

# 다국어·다지역 사이트 SEO (i18n SEO)

> 소스: Google Search Central (specialty/international/*), W3C RFC 5646 (BCP 47), Yandex Webmaster Docs, Next.js 16.2 / @astrojs/sitemap 공식 문서
> 검증일: 2026-06-02
> 적용 범위: 다국어(언어만 다름) + 다지역(언어×국가) 모두

---

## 1. hreflang 기초

`hreflang`은 "같은 콘텐츠의 언어·지역별 대체 버전"을 검색엔진에 알리는 신호다. 우선순위가 아니라 **동등한 대체 관계**다.

### 1-1. 값 형식 — BCP 47

```
language[-script][-region]
```

- **language**: ISO 639-1 (2글자 소문자) — `ko`, `en`, `zh`, `ja`, `de`
- **script** (선택): ISO 15924 (4글자, 첫 글자만 대문자) — `Hans`(간체), `Hant`(번체)
- **region** (선택): ISO 3166-1 Alpha 2 (2글자 대문자) — `KR`, `US`, `GB`, `TW`

**유효한 예:**

| hreflang 값 | 의미 |
|---|---|
| `ko` | 한국어 (지역 무관) |
| `ko-KR` | 한국어 + 대한민국 |
| `en-US` | 영어 + 미국 |
| `en-GB` | 영어 + 영국 |
| `zh-Hans` | 간체 중국어 (지역 무관) |
| `zh-Hant-TW` | 번체 중국어 + 대만 |
| `x-default` | 매칭 실패 시 폴백 |

**무효한 예 (가장 흔한 한국어 사이트 실수):**

| 잘못된 값 | 이유 |
|---|---|
| `kr` | `kr`은 ISO 639-1 언어 코드에 없음. 한국어는 `ko` |
| `KR` | `KR`은 국가 코드. hreflang 첫 자리는 언어 |
| `ko-KP` | `KP`는 북한. 대한민국은 `KR` |
| `ko_KR` | 구분자는 `-` (언더스코어 아님) |
| `kr-KR` | 언어·국가 모두 잘못 |

> 주의: hreflang `ko` 와 `ko-KR`은 **같지 않다**. `ko`는 "한국어 화자 전체"를 가리키고 `ko-KR`은 "대한민국 거주 한국어 화자"를 가리킨다. 운영하는 사이트가 국가별로 분리되어 있지 않으면 `ko`만으로 충분하다.

### 1-2. 핵심 규칙 3가지

1. **자기참조 필수** — 각 페이지는 자기 자신을 포함해 모든 대체 버전을 나열한다.
2. **양방향(reciprocal) 일관성** — 페이지 A가 B를 가리키면 B도 A를 가리켜야 한다. 어긋나면 Google이 해당 hreflang 묶음을 무시할 수 있다.
3. **완전 URL** — `//example.com/...`이 아니라 `https://example.com/...`처럼 절대 URL.

---

## 2. x-default

언어·지역 매칭이 실패했을 때 보여줄 **폴백 페이지**를 지정한다. 언어 선택기 페이지·기본 영문판 등이 대상이다.

```html
<link rel="alternate" hreflang="x-default" href="https://example.com/" />
```

**언제 쓰나:**
- 글로벌 진입 페이지가 언어 선택기일 때 → 그 페이지를 `x-default`로
- 사용자의 브라우저 언어가 사이트에 없는 언어일 때 폴백할 페이지가 있을 때

**x-default를 빠뜨리면:** Google이 매칭되지 않는 사용자에게 어떤 버전을 보여줄지 추측하게 된다. 권장은 명시.

---

## 3. 구현 방법 3가지

Google 관점에서 셋은 **동등**하다. 셋을 동시에 쓰지 말고 **하나만 일관되게** 쓴다.

### 3-1. HTML `<link>` 태그 (가장 일반적)

각 페이지의 `<head>`에 모든 대체 버전을 나열한다.

```html
<!-- https://example.com/ko/page (한국어판) -->
<link rel="alternate" hreflang="ko"        href="https://example.com/ko/page" />
<link rel="alternate" hreflang="en"        href="https://example.com/en/page" />
<link rel="alternate" hreflang="ja"        href="https://example.com/ja/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en/page" />

<!-- 자기참조 canonical -->
<link rel="canonical" href="https://example.com/ko/page" />
```

장점: 가장 직관적, 디버깅 쉬움
단점: 페이지마다 모든 locale을 박아야 함. locale 수×페이지 수 = 태그 폭발

### 3-2. HTTP `Link` 헤더 (HTML 아닌 콘텐츠용)

PDF·이미지 등 HTML이 아닌 콘텐츠에 hreflang을 다는 유일한 방법.

```
Link: <https://example.com/ko/doc.pdf>; rel="alternate"; hreflang="ko",
      <https://example.com/en/doc.pdf>; rel="alternate"; hreflang="en"
```

### 3-3. sitemap.xml `xhtml:link` (대규모 사이트 권장)

페이지 수가 많을 때 가장 관리하기 쉽다. 페이지 HTML을 건드리지 않고 sitemap만 갱신하면 된다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://example.com/ko/page</loc>
    <xhtml:link rel="alternate" hreflang="ko"        href="https://example.com/ko/page"/>
    <xhtml:link rel="alternate" hreflang="en"        href="https://example.com/en/page"/>
    <xhtml:link rel="alternate" hreflang="ja"        href="https://example.com/ja/page"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en/page"/>
  </url>
  <url>
    <loc>https://example.com/en/page</loc>
    <xhtml:link rel="alternate" hreflang="ko"        href="https://example.com/ko/page"/>
    <xhtml:link rel="alternate" hreflang="en"        href="https://example.com/en/page"/>
    <xhtml:link rel="alternate" hreflang="ja"        href="https://example.com/ja/page"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en/page"/>
  </url>
</url>
```

각 `<url>` 블록은 **자신의 모든 대체 버전을 다 나열**해야 한다 (자기참조 포함).

> 주의: Yandex는 sitemap 방식 hreflang을 더 이상 지원하지 않는다. Yandex가 중요 시장이면 HTML link 방식을 병행한다.

---

## 4. canonical과 hreflang의 관계

가장 흔히 헷갈리는 부분이다. **둘은 다른 일을 한다.**

| 태그 | 역할 |
|---|---|
| `canonical` | 중복 페이지 중 "정본"을 가리킴. 같은 언어 내 정규화 용도 |
| `hreflang` | 다른 언어·지역 대체 버전을 가리킴. 우선순위가 아니라 동등 관계 |

### 4-1. 올바른 패턴: locale별 자기참조 canonical

```html
<!-- https://example.com/ko/page -->
<link rel="canonical"  href="https://example.com/ko/page" />
<link rel="alternate"  hreflang="ko" href="https://example.com/ko/page" />
<link rel="alternate"  hreflang="en" href="https://example.com/en/page" />

<!-- https://example.com/en/page -->
<link rel="canonical"  href="https://example.com/en/page" />
<link rel="alternate"  hreflang="ko" href="https://example.com/ko/page" />
<link rel="alternate"  hreflang="en" href="https://example.com/en/page" />
```

### 4-2. 안티패턴: canonical을 영문판으로 통일

```html
<!-- 한국어판인데 canonical을 영문판으로 박음 -->
<!-- https://example.com/ko/page -->
<link rel="canonical" href="https://example.com/en/page" />  <!-- ❌ -->
```

**문제:** Google이 한국어판을 영문판으로 합쳐버려 한국어판이 검색 결과에 안 나온다. hreflang도 무시된다. John Mueller(Google) 공식 입장: "canonical이 다른 곳을 가리키면 Google은 그것을 따르고 hreflang을 무시한다".

### 4-3. noindex 페이지와 hreflang

`noindex`가 걸린 페이지에 hreflang을 거는 것은 모순이다. hreflang은 "이 페이지의 대체 버전이 있다"는 신호인데 noindex는 "색인하지 마"라는 신호다. Google이 해당 묶음을 무시할 가능성이 높다. **noindex 페이지에는 hreflang을 걸지 않는다.**

---

## 5. locale URL 전략 — 4가지 옵션

Google이 권장하는 옵션은 없다. 사이트 규모·인프라·지역 신호 강도에 따라 선택한다.

### 5-1. ccTLD (국가 도메인)

```
example.kr / example.com / example.de
```

| 장점 | 단점 |
|---|---|
| 지역 신호 가장 강함 | 도메인 비용·인프라 비용 큼 |
| 분리 명확 | 도메인 권위(authority) 분산 |
| 사용자 신뢰 높음 | 한 국가 = 한 도메인 (다지역 어려움) |

**언제 쓰나:** 국가별로 별도 법인·콘텐츠·결제·법적 책임이 다른 글로벌 브랜드.

### 5-2. 서브도메인

```
ko.example.com / en.example.com / de.example.com
```

| 장점 | 단점 |
|---|---|
| 설정 쉬움 | 지역 신호 약함 (`de`가 언어인지 지역인지 모호) |
| 서버 위치 분리 가능 | Google이 별도 사이트로 볼 수 있음 |

**언제 쓰나:** 인프라를 지역별로 분리해야 하지만 ccTLD까진 안 가는 경우.

### 5-3. 서브디렉토리 (가장 일반적)

```
example.com/ko/ / example.com/en/ / example.com/de/
```

| 장점 | 단점 |
|---|---|
| 단일 도메인 권위 활용 | 한 서버 위치 |
| 설정·유지보수 쉬움 | 사이트 분리가 어려움 |

**언제 쓰나:** 대부분의 경우. 특히 SEO 권위를 단일 도메인에 집중시키고 싶을 때.

### 5-4. URL 파라미터 (권장 안 함)

```
example.com/page?lang=ko
```

Google이 명시적으로 **권장하지 않는다**. 인덱싱·분할이 어렵고 사용자 경험도 나쁘다.

### 5-5. Search Console "International Targeting" 도구는 폐지됨

이전에는 Search Console에서 "이 사이트는 한국 대상"이라고 명시할 수 있었다. **이 기능은 2022-09-22에 폐지**되었다. 현재는 **hreflang에만 의존**한다. 이전에 그 기능을 쓰던 사이트는 hreflang 마크업을 제대로 했는지 다시 점검해야 한다.

---

## 6. 다국어 sitemap 전략

### 6-1. 단일 sitemap + xhtml:link (Google 권장, 중소 규모)

3-3 절의 예시처럼 한 sitemap 안에 모든 locale URL을 넣고 각 URL에 `xhtml:link`로 대체 버전을 나열한다.

### 6-2. locale별 sitemap 분리 + sitemap index (대규모)

페이지 수가 수만 개 이상이면 locale별로 sitemap을 나누고 sitemap index로 묶는다.

```xml
<!-- sitemap-index.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-ko.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-en.xml</loc>
  </sitemap>
</sitemapindex>
```

각 sitemap-{locale}.xml 내부 URL은 자기 locale + 대체 locale을 모두 `xhtml:link`로 나열한다 (자기참조 포함).

---

## 7. 흔한 실수 패턴 (한국어 사이트 우선)

| 실수 | 증상 | 수정 |
|---|---|---|
| `hreflang="kr"` | `kr`은 언어 코드 아님 → Google이 무시 | `ko` 또는 `ko-KR` |
| `hreflang="ko"` + `ko-KR` 혼용 | 같은 페이지 다른 묶음 처리 | 사이트 전체에서 한 가지로 통일 |
| 자기참조 누락 | "양방향 일관성 위반" Search Console 경고 | 모든 페이지에 자기 자신 포함 |
| canonical을 영문판으로 통일 | 비영문판 인덱싱 안 됨 | locale별 자기참조 canonical |
| x-default 누락 | 매칭 실패 사용자에게 임의 페이지 노출 | 글로벌 진입·언어 선택기 페이지 지정 |
| noindex 페이지에 hreflang | Google이 묶음 전체 무시 | noindex 페이지에는 hreflang 안 검 |
| sitemap·HTML link 동시 사용 | 관리 어려움, 충돌 위험 | 셋 중 하나만 일관되게 |
| Accept-Language 자동 리다이렉트 | Googlebot이 한 locale만 봄 → 다른 locale 인덱싱 안 됨 | 자동 리다이렉트 금지, "다른 언어 사용 가능" 배너로 |

---

## 8. 자동 리다이렉트 안티패턴

서버에서 `Accept-Language` 헤더를 보고 자동 리다이렉트하는 패턴은 **권장하지 않는다**.

**이유:**
- Googlebot은 `Accept-Language` 헤더를 설정하지 않는다. 자동 리다이렉트되면 Googlebot은 한 locale만 보게 된다.
- 사용자가 의도적으로 다른 언어를 보려고 해도 강제로 자기 언어로 끌려간다.

**Google 권장 대안:**
1. 모든 사용자에게 같은 URL을 그대로 보여주고
2. 헤더에 "다른 언어로 보기" 배너를 띄우거나
3. 언어 선택 UI를 항상 노출

---

## 9. 국가별 검색엔진 특수성

### 9-1. 중국 — Baidu

- **hreflang 미지원**. 간체 페이지 head에 hreflang을 박으면 오히려 비중국 페이지를 가리키게 되어 인덱싱 혼란을 야기할 수 있다.
- **별도 sitemap 제출 권장** — Baidu Webmaster Tools(`ziyuan.baidu.com`)에 직접 제출.
- **ICP 등록 필요** — 중국 본토 호스팅·정상 인덱싱을 원하면 ICP 라이선스 발급이 사실상 필수.
- 권장: 간체 페이지는 Baidu 전용으로 운영하고 Google용 hreflang은 다른 locale 페이지에서만 박는다.

### 9-2. 러시아 — Yandex

- **hreflang HTML link 방식 지원**. **sitemap 방식은 지원 안 함** (Yandex 공식).
- Yandex.Webmaster에서 별도 지역 타겟팅 설정 가능.
- ISO 639-1 + ISO 3166-1 Alpha 2 형식 그대로 사용 (또는 러시아 내 지역은 ISO 3166-2:RU).
- 권장: Google용 sitemap hreflang을 쓰더라도 Yandex가 중요하면 HTML link도 같이 박는다.

### 9-3. 한국 — Naver

- sitemap·robots.txt **표준 따름** (Google과 거의 동일 XML 형식).
- Naver Search Advisor(`searchadvisor.naver.com`)에 별도 사이트 등록·sitemap 제출 권장.
- 사이트당 sitemap 1개만 제출 가능 (sitemap index도 1개로 카운트).
- hreflang 지원은 Google만큼 명확히 문서화되지 않음 — 한국어 페이지가 주요 타깃이면 콘텐츠 자체의 한국어 품질이 더 중요하다.

---

## 10. Next.js 매핑 (App Router)

`generateMetadata` 또는 정적 `metadata`에서 `alternates.languages`로 hreflang을 생성한다.

```tsx
// app/[lang]/layout.tsx
import type { Metadata } from 'next';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    metadataBase: new URL('https://example.com'),
    alternates: {
      canonical: `/${lang}`,
      languages: {
        ko: '/ko',
        en: '/en',
        ja: '/ja',
        'x-default': '/en',
      },
    },
  };
}
```

출력 HTML:

```html
<link rel="canonical" href="https://example.com/ko" />
<link rel="alternate" hreflang="ko"        href="https://example.com/ko" />
<link rel="alternate" hreflang="en"        href="https://example.com/en" />
<link rel="alternate" hreflang="ja"        href="https://example.com/ja" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en" />
```

> 주의: `metadataBase` 없이 상대 경로를 쓰면 빌드 에러가 난다. 루트 layout에 한 번 설정한다.

자세한 Next.js 메타데이터 패턴은 [[seo-nextjs]] 스킬 참조.

---

## 11. Astro 매핑

`@astrojs/sitemap` 통합의 `i18n` 옵션으로 sitemap에 자동 `xhtml:link`를 생성한다.

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          ko: 'ko-KR',
          ja: 'ja-JP',
        },
      },
    }),
  ],
});
```

키(`en`, `ko`)는 URL 경로 prefix(`/en/`, `/ko/`)이고 값(`en-US`, `ko-KR`)은 hreflang 값이다. 빌드 시 sitemap의 각 `<url>`에 형제 locale 변형이 자동 추가된다.

---

## 12. hreflang 검증 도구

| 도구 | 용도 |
|---|---|
| Google Search Console | "Pages" / Coverage 보고서에서 hreflang 관련 인덱싱 문제 확인. International Targeting 보고서는 폐지됨 |
| hreflang.org Tester | 단일 URL 또는 sitemap 검증, 양방향 일관성 자동 점검 |
| Merkle hreflang Testing Tool (`technicalseo.com/tools/hreflang/`) | 무료, sitemap·URL 모두 지원 |
| Ahrefs / Semrush Site Audit | 사이트 전체 크롤 + hreflang 오류 일괄 검출 |
| Sitebulb / Screaming Frog | 데스크탑 크롤러, 자기참조·반대방향 누락 자동 탐지 |

**가장 간단한 자가 점검 (curl):**

```bash
# 한국어판 페이지에서 hreflang link 태그 확인
curl -s https://example.com/ko/page | grep -i 'rel="alternate"'

# 반대 방향(영문판)에서도 자기참조 + 한국어판 가리키는지 확인
curl -s https://example.com/en/page | grep -i 'rel="alternate"'
```

---

## 13. 체크리스트

새 다국어 사이트를 띄우기 전 이 순서로 점검한다:

- [ ] hreflang 값이 모두 BCP 47 형식인가 (`ko-KR` ✅ / `kr` ❌)
- [ ] 사이트 전체에서 `ko` 또는 `ko-KR` 중 하나로 통일했는가
- [ ] 모든 페이지가 자기 자신을 포함해 모든 locale을 나열하는가
- [ ] A→B를 선언하면 B→A도 선언되는가 (양방향 일관성)
- [ ] x-default 페이지가 지정되어 있는가
- [ ] 각 locale의 canonical이 자기 자신을 가리키는가 (영문판으로 통일 ❌)
- [ ] noindex 페이지에 hreflang이 걸려 있지 않은가
- [ ] HTML link / HTTP Header / sitemap 중 하나만 일관되게 사용 중인가
- [ ] Accept-Language 기반 자동 리다이렉트를 쓰지 않는가
- [ ] Baidu/Yandex/Naver가 중요 시장이라면 각 webmaster tool 별도 등록했는가
- [ ] 검증 도구(hreflang.org 등)로 양방향 일관성 점검했는가

---

## 14. 참고 소스

- Google Search Central — Localized Versions of your Pages: https://developers.google.com/search/docs/specialty/international/localized-versions
- Google Search Central — Managing Multi-Regional and Multilingual Sites: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- Google Search Console Help — International Targeting deprecated: https://support.google.com/webmasters/answer/12474899
- W3C / IETF RFC 5646 — Tags for Identifying Languages (BCP 47): https://datatracker.ietf.org/doc/html/rfc5646
- Yandex Webmaster — Indexing localized pages: https://yandex.com/support/webmaster/en/yandex-indexing/locale-pages
- Next.js — generateMetadata: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- @astrojs/sitemap — i18n option: https://docs.astro.build/en/guides/integrations-guide/sitemap/
- Naver Search Advisor: https://searchadvisor.naver.com/
