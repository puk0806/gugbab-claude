---
name: url-canonicalization-redirects
description: >
  URL 정규화·중복 제거·리다이렉트 규칙을 프레임워크/인프라 레이어별로 통일하는 가이드.
  http→https, www/non-www, 트레일링 슬래시, 대소문자, 쿼리 파라미터, 트래킹 파라미터, 디폴트 파일명까지 7대 정규화 축을 일관되게 처리한다.
  Next.js / Vite SPA / Vercel / Netlify / Cloudflare Pages / Nginx / Apache 패턴을 다룬다.
  <example>사용자: "www → non-www + http → https + 트레일링 슬래시 제거를 Next.js에서 한 번에 처리하려면?"</example>
  <example>사용자: "utm_source, fbclid 같은 트래킹 파라미터가 sitemap.xml과 다른 URL로 색인되고 있는데 어떻게 정리하나?"</example>
  <example>사용자: "Vite SPA 정적 빌드인데 호스팅이 Netlify야. 슬래시 통일 어떻게 해?"</example>
---

# URL 정규화·리다이렉트 가이드

> 소스:
> - Google Search Central — Consolidate duplicate URLs: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
> - MDN — HTTP Redirections: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections
> - Next.js — trailingSlash / Middleware / Metadata: https://nextjs.org/docs
> - Vercel — Configuration Redirects: https://vercel.com/docs/routing/redirects/configuration-redirects
> - Netlify — Redirect options: https://docs.netlify.com/manage/routing/redirects/redirect-options/
> - Cloudflare Pages — Redirects: https://developers.cloudflare.com/pages/configuration/redirects/
> - Nginx 공식 — "If is evil": https://nginx.com/resources/wiki/start/topics/depth/ifisevil/
>
> 검증일: 2026-06-02
> 검증 대상 버전: Next.js 16.x, Astro 5.x, Vercel/Netlify/Cloudflare Pages 2026-06 시점 문서

---

## 0. TL;DR — 결정 트리

| 결정 | 권장 |
|------|------|
| 정규화 레이어 | **CDN/Edge > Origin(Nginx) > 앱(Next.js middleware) > 클라이언트(금지)** — 사용자에게 빨리 도착할수록 좋다 |
| 영구 이전 신호 | **301** (GET 위주) / **308** (POST 등 메서드 보존 필요) |
| 임시 이전 신호 | **302** / **307** (메서드 보존 필요 시) |
| 정규화 신호 우선순위 | **redirect (강) > rel=canonical (강·hint) > sitemap (약)** — Google 공식 |
| redirect chain | **1 hop이 이상**, 최대 **5 hops 미만** (Google John Mueller) |
| 트래킹 파라미터(utm/fbclid) | 사용자에게 *redirect 하지 말 것*. canonical로 파라미터 없는 URL을 명시 |
| 트레일링 슬래시 | 슬래시 유/무 어느 쪽이든 무방. **일관성**이 본질. 다른 형태는 301로 통일 |

---

## 1. URL 정규화 7대 축

같은 콘텐츠가 여러 URL로 도달 가능하면 SEO 신호가 분산되고 색인 예산이 낭비된다.
다음 7개 축을 모두 한 방향으로 통일해야 한다.

| 축 | 두 형태 | 결정 원칙 |
|----|---------|-----------|
| 1. 프로토콜 | `http://` vs `https://` | **무조건 https** (Google이 자동 선호) |
| 2. 호스트 | `www.example.com` vs `example.com` | 어느 쪽이든 무방, **일관성** |
| 3. 트레일링 슬래시 | `/about` vs `/about/` | 어느 쪽이든 무방, **일관성** |
| 4. 대소문자 | `/About` vs `/about` | 소문자 권장 (대부분 OS는 case-sensitive) |
| 5. 파라미터 순서 | `?a=1&b=2` vs `?b=2&a=1` | 알파벳순 정렬 또는 무시 |
| 6. 트래킹 파라미터 | `?utm_source=x` 등 | canonical에서 *제거*, 사용자 URL은 *유지* |
| 7. 디폴트 파일명 | `/index.html` vs `/` | `/index.html` → `/` 로 301 |

> 출처: Google Search Central — Consolidate duplicate URLs

### 자가 진단 체크리스트

다음 8개 URL이 *모두 같은 최종 URL*에 도달하는지 curl로 확인하라:

```bash
# 모두 https://example.com/about 로 단일 301 도달해야 정상
curl -I http://example.com/about
curl -I http://www.example.com/about
curl -I https://www.example.com/about
curl -I https://example.com/about/
curl -I https://example.com/About
curl -I https://example.com/about?utm_source=twitter
curl -I https://example.com/about/index.html
curl -I https://example.com//about    # 중복 슬래시
```

각각이 `Location:` 헤더로 *직접* 최종 URL을 가리켜야 한다 (중간 hop 없이).

---

## 2. HTTP 상태 코드 — 301 vs 302 vs 307 vs 308

| 코드 | 이름 | 영구/임시 | 메서드 보존 | 사용 케이스 |
|------|------|:--------:|:-----------:|------------|
| **301** | Moved Permanently | 영구 | ❌ (POST→GET 가능) | 사이트 재구성, 도메인 이전, www/슬래시 정규화 (GET) |
| **302** | Found | 임시 | ❌ (POST→GET 가능) | A/B 테스트, 점검 페이지 |
| **303** | See Other | 임시 | ❌ (모두 GET 변환) | POST 처리 후 결과 페이지 표시 (Post/Redirect/Get 패턴) |
| **307** | Temporary Redirect | 임시 | ✅ | API 임시 이전, 메서드 보존 필요 시 |
| **308** | Permanent Redirect | 영구 | ✅ | API 영구 이전, POST/PUT 영구 이전 |

> 출처: MDN — HTTP Redirections (https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections)

### 결정 트리

```
이 redirect는 영구적인가?
├─ 예 (영구)
│   └─ POST/PUT/DELETE 등 비-GET 메서드도 처리해야 하나?
│       ├─ 예 → 308
│       └─ 아니오 (GET만) → 301
└─ 아니오 (임시)
    └─ POST/PUT/DELETE 등 비-GET 메서드도 처리해야 하나?
        ├─ 예 → 307
        └─ 아니오 (GET만) → 302
```

> **주의**: 일반 웹페이지(HTML) 정규화는 GET 위주이므로 **301**이면 충분하다. API 엔드포인트 이전이라면 308을 고려한다.

---

## 3. canonical 태그 vs redirect — 신호 강도

Google이 인식하는 정규화 신호 강도 순서 (공식):

```
1. redirect (강한 신호)         ← 가능한 한 이것을 우선
2. rel="canonical" (강한 신호, hint)
3. sitemap.xml 포함 (약한 신호)
```

> 출처: Google Search Central — "redirects (strong), rel=canonical (strong), sitemap (weak)"

### 충돌 시 동작

신호들이 일치하지 않으면 Google이 자기 판단으로 canonical을 *선택*한다.

```
나쁜 예 (충돌):
/old → 301 → /new
/new 의 canonical = /old   ← 모순. 신호 약화

좋은 예:
/old → 301 → /new
/new 의 canonical = /new   ← 자기참조. 일관성
```

### canonical 운영 규칙

- 모든 페이지는 **자기참조 canonical**을 기본으로 한다 (페이지네이션 포함)
- 절대 URL 사용 (`https://example.com/...`)
- HTTPS, 선호 호스트, 트레일링 슬래시 정책에 *일치*해야 함
- JavaScript로 canonical 변경 금지 — HTML 소스에 박는다
- robots.txt로 정규화 시도 금지 (Google이 비권장 명시)

### 페이지네이션

```html
<!-- /blog?page=2 -->
<link rel="canonical" href="https://example.com/blog?page=2" />
<!-- rel=prev/next는 사용하지 않는다 (Google이 2019년 deprecated 공식 발표) -->
```

> Google이 2019년 3월 `rel=prev/next`를 인덱싱 신호로 사용 중단 발표.
> 페이지네이션 페이지는 자기참조 canonical을 사용한다.

---

## 4. 트레일링 슬래시 — 슬래시 유 vs 무

SEO에는 어느 쪽도 무방하다. **일관성**이 본질이고, *반대편 형태는 301로 정규화*해야 한다.

| 프레임워크 | 기본 정책 | 변경 방법 |
|------------|-----------|-----------|
| **Next.js** | 슬래시 **무** (`/about/` → `/about`) | `next.config.js` 에서 `trailingSlash: true` |
| **Astro** | 슬래시 **유** (`build.format: 'directory'` 기본) | `trailingSlash: 'never'` + `build.format: 'file'` |
| **Vite SPA** | 호스팅 레이어에 위임 | Vercel/Netlify/Nginx 설정 |
| **Nuxt** | 슬래시 **무** | `routeRules`로 조정 |

### Next.js trailingSlash 동작 상세

```js
// next.config.js — 기본 (슬래시 없음)
module.exports = {
  // trailingSlash: false  // 기본
};
// /about/ → 308 → /about

// next.config.js — 슬래시 있음
module.exports = {
  trailingSlash: true,
};
// /about → 308 → /about/
```

> Next.js는 내부 정규화 redirect로 **308**을 사용한다 (메서드 보존).
> 예외: 확장자 있는 정적 파일(`/file.txt`), `.well-known/` 경로는 슬래시가 추가되지 않는다.

미들웨어에서 커스텀 슬래시 처리를 하려면 `skipTrailingSlashRedirect`로 Next.js의 자동 정규화를 끄고 직접 처리한다.

---

## 5. Next.js 정규화 패턴

### 5-1. 정적 redirect (`next.config.js`)

가장 단순한 케이스. 빌드 타임에 결정되는 redirect.

```js
// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  trailingSlash: false,

  async redirects() {
    return [
      // 도메인 내 path 정규화
      {
        source: '/old-blog/:slug',
        destination: '/news/:slug',
        permanent: true,           // → 308
      },
      {
        source: '/About',
        destination: '/about',
        permanent: true,
      },
    ];
  },
};
```

> `permanent: true` → 308, `permanent: false` → 307.
> 일반 SEO 정규화는 `permanent: true` 사용.

### 5-2. 동적 호스트 정규화 (middleware)

`next.config.js` 의 `redirects()`는 *path* 기반이라 호스트 정규화(www/non-www, http/https)에는 적합하지 않다. **middleware**에서 처리한다.

```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const CANONICAL_HOST = 'example.com';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') ?? '';

  // 1) www → non-www
  if (host.startsWith('www.')) {
    url.host = host.replace(/^www\./, '');
    return NextResponse.redirect(url, 308);
  }

  // 2) 대문자 path → 소문자
  if (url.pathname !== url.pathname.toLowerCase()) {
    url.pathname = url.pathname.toLowerCase();
    return NextResponse.redirect(url, 308);
  }

  // 3) 트래킹 파라미터는 redirect하지 않고 그대로 둔다
  //    canonical 메타에서 제거하는 방식 (섹션 8 참조)

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 정적 파일과 _next 내부 경로 제외
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

> **주의 1**: Vercel 등 CDN 앞단에서 `https` 종단이 이미 처리되므로 middleware에서 `http→https`는 보통 처리하지 않는다. *Origin 서버를 직접 노출하는 경우*에만 필요하다.
>
> **주의 2**: middleware는 모든 요청에 실행되어 비용이 든다. CDN 레이어에서 처리 가능하면 그쪽이 우선이다.

### 5-3. canonical 메타 (App Router)

```ts
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  return {
    alternates: {
      canonical: `https://example.com/blog/${slug}`,
    },
  };
}
```

> **주의 (DISPUTED)**: Next.js 14/15에서 `metadata.alternates.canonical`을 *문자열*로 지정하면 trailing slash 정책이 사용자 의도와 다르게 normalize되는 이슈 보고가 있다 (next.js Discussion #65323). 절대 URL을 직접 박고, `trailingSlash` 옵션과 일치하는 형태로 작성하면 안전하다.

---

## 6. Vite SPA + 호스팅 레이어

Vite 자체에는 서버 정규화가 없다. 정적 빌드 결과를 어디에 올리느냐에 따라 정규화 위치가 달라진다.

### 6-1. Vercel (`vercel.json`)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    },
    {
      "source": "/old-blog/:slug",
      "destination": "/news/:slug",
      "permanent": true
    }
  ]
}
```

> Vercel은 `permanent: true` → **308**, `permanent: false` → **307** (Vercel 공식).
> www/non-www 정규화는 Vercel 대시보드 Domains 설정에서 한쪽을 primary로 지정 → 자동 308.
> `/.well-known` 경로는 정규화 대상에서 제외된다 (Vercel 문서 명시).
> redirects 배열 한계: 2,048개 / source·destination 문자열 4,096자.

### 6-2. Netlify (`_redirects`)

`public/_redirects` (Vite 기준) 또는 빌드 출력 루트에 파일을 둔다.

```
# _redirects
# 형식: <from>  <to>  [status_code]  [options]

# 도메인 정규화 (강제 — ! 접미사로 매칭 파일보다 우선)
http://example.com/*    https://example.com/:splat   301!
http://www.example.com/* https://example.com/:splat  301!
https://www.example.com/* https://example.com/:splat 301!

# path 정규화
/old-blog/*    /news/:splat   301
/About         /about         301
```

> **주의 (Netlify 한정)**: `_redirects` 만으로 *트레일링 슬래시 추가/제거* 는 불가능하다 (Netlify 공식 명시).
> Netlify가 내부적으로 "Pretty URLs"로 자동 정규화하므로 슬래시 유무는 Netlify 동작에 맡기는 방식이 안전하다.

### 6-3. Cloudflare Pages (`_redirects`)

```
# _redirects
# 지원 status: 301, 302, 303, 307, 308 (기본 302)

/old-blog/*   /news/:splat   301
/about/       /about         301
```

> **주의 (Cloudflare Pages 한정)**: 도메인 레벨 정규화(www, http→https), 쿼리 파라미터 기반 정규화, 국가/언어 조건은 `_redirects` 에서 *지원되지 않는다*. 이 경우 Cloudflare **Bulk Redirects** 또는 **Single Redirects** Rules를 사용해야 한다.
> 한도: static 2,000개 + dynamic 100개 = 총 2,100개. 줄당 1,000자.

### 6-4. 호스팅 비교표

| 호스팅 | 슬래시 자동 정규화 | 도메인 정규화 | 한도 |
|--------|:--:|:--:|----|
| Vercel | 프로젝트 도메인 설정 | 대시보드 primary | 2,048 redirects |
| Netlify | 자동 (Pretty URLs) | `_redirects` 또는 사이트 설정 | 무제한 (실용상) |
| Cloudflare Pages | 수동 | Pages 외 Rules 필요 | 2,100 합계 |

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
