## 7. Nginx 패턴 (Origin 직접 노출 시)

```nginx
# /etc/nginx/sites-available/example.com

# 1) http → https 전체 통합
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;
    return 301 https://example.com$request_uri;
}

# 2) www → non-www (https 레이어)
server {
    listen 443 ssl http2;
    server_name www.example.com;
    return 301 https://example.com$request_uri;
}

# 3) canonical 호스트
server {
    listen 443 ssl http2;
    server_name example.com;

    # 중복 슬래시 정규화 (//foo → /foo)
    merge_slashes on;

    # 트레일링 슬래시 제거 (선택)
    rewrite ^/(.*)/$ /$1 permanent;

    # 대문자 path → 소문자 (선택, perl_set 사용 시)
    # 정적 자산 외에는 보통 앱에서 처리

    location / {
        proxy_pass http://app_upstream;
    }
}
```

### Nginx에서 `if` 사용 금지

호스트 분기를 `if ($host = www.example.com)` 같은 형태로 짜는 글이 흔하지만, Nginx 공식 가이드는 **"If is Evil"** 로 *server block 분리*를 권장한다.

> 출처: https://nginx.com/resources/wiki/start/topics/depth/ifisevil/
> 권장: 호스트별로 별도 `server { ... }` 블록을 만들어 `return 301`만 두는 방식.

위 예시처럼 정규 호스트는 `server { ... return 301 ... }` 한 줄짜리 블록으로 분리한다.

---

## 8. 트래킹 파라미터(utm, fbclid 등) 처리

```
사용자가 광고 클릭 →  https://example.com/post?utm_source=twitter&utm_campaign=spring
                            ↓
                    (redirect 하지 *않음*)
                            ↓
                    HTML 응답 + canonical 메타에 파라미터 *없는* URL 지정
                            ↓
                    Google: canonical 따라 https://example.com/post 색인
                    Analytics: utm_* 파라미터 그대로 캡처
```

### 핵심 원칙

- **사용자를 redirect하지 않는다.** 트래킹 파라미터를 살려야 분석 도구가 출처를 캡처한다.
- **canonical 메타에서 파라미터를 제거한다.** Google이 *파라미터 없는 URL* 을 색인한다.
- **sitemap.xml에도 파라미터 없는 URL만 등록한다.**
- **robots.txt로 차단하지 않는다.** 차단하면 canonical 신호 자체가 안 읽힌다.

### Next.js 구현 예

```ts
// app/post/[slug]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  // 어떤 쿼리가 붙어 들어와도 canonical은 파라미터 없는 URL
  return {
    alternates: {
      canonical: `https://example.com/post/${slug}`,
    },
  };
}
```

### 일반적인 트래킹 파라미터 목록

| 파라미터 | 출처 |
|----------|------|
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` | Google Analytics 표준 |
| `gclid` | Google Ads (auto-tagging) |
| `fbclid` | Meta(Facebook) Ads |
| `msclkid` | Microsoft Ads |
| `mc_eid`, `mc_cid` | Mailchimp |
| `_ga`, `_gl` | Google Analytics cross-domain |

> Google은 이들 트래킹 파라미터를 *자동으로 인식하여 무시*한다 (canonical 무관). 하지만 명시적으로 canonical을 박는 편이 안전하다.

---

## 9. 정규화 레이어 선택 — 어디서 처리하나

같은 정규화는 여러 레이어에서 가능하지만, **사용자에게 가까운 레이어일수록 좋다**.

```
[브라우저]
   ↓ (요청)
[CDN/Edge] ← ★ 가장 권장: Vercel/Netlify/Cloudflare 룰
   ↓ (CDN을 통과해야만 다음으로)
[Origin/Nginx] ← 자체 인프라일 때
   ↓
[앱 (Next.js middleware)] ← 동적 비즈니스 로직 필요할 때
   ↓
[클라이언트 JS / meta refresh] ← ✗ 금지에 가까움
```

### 레이어 선택 기준

| 정규화 종류 | 권장 레이어 |
|-------------|------------|
| http→https | CDN/Edge (대부분 자동) |
| www↔non-www | CDN/Edge (도메인 설정) |
| 트레일링 슬래시 | 프레임워크 옵션 또는 CDN |
| 대소문자 | 앱 middleware 또는 Nginx |
| 트래킹 파라미터 | canonical 메타 (redirect 하지 않음) |
| path 변경 (구 URL → 신 URL) | 프레임워크 config (`redirects()`) |
| 사용자 인증·국가·쿠키 분기 | 앱 middleware |

---

## 10. 흔한 실수 패턴

### 10-1. 영구 이전에 302 사용

```
❌ /old → 302 → /new   (SEO 신호가 안 넘어감)
✅ /old → 301 → /new
```

302는 임시 이전이라 Google이 기존 URL의 ranking signal을 *유지*한다. 영구 이전은 반드시 **301** (또는 메서드 보존이 필요하면 308).

### 10-2. redirect chain 3단 이상

```
❌ http://www.example.com/About/
    → 301 → https://www.example.com/About/    (http→https)
    → 301 → https://example.com/About/         (www→non-www)
    → 301 → https://example.com/about          (대소문자+슬래시)
    (3 hops)

✅ http://www.example.com/About/
    → 301 → https://example.com/about          (1 hop)
```

Google John Mueller 권장: **5 hops 미만**, 이상적으로는 **1 hop**.
Googlebot은 한 크롤 시도 당 5 hops까지만 따라간다. 그 이상이면 최종 URL이 색인되지 않을 수 있다.

### 10-3. JavaScript / meta refresh redirect

```html
<!-- ❌ 둘 다 약한 신호 -->
<meta http-equiv="refresh" content="0; url=/new-page">
<script>window.location.href = '/new-page';</script>

<!-- ✅ HTTP redirect (서버/CDN에서) -->
```

Googlebot은 따라가긴 하지만 *약한 신호*다. SEO 정규화 목적이면 반드시 HTTP redirect를 사용한다.
MDN 가이드: HTTP redirect → JavaScript → meta refresh 순으로 우선순위가 결정되므로 혼용 시 디버깅이 어렵다.

### 10-4. canonical을 다른 콘텐츠로 가리키기

```html
<!-- /ko/about 페이지에서 -->
❌ <link rel="canonical" href="https://example.com/en/about" />
✅ <link rel="canonical" href="https://example.com/ko/about" />
   <link rel="alternate" hreflang="en" href="https://example.com/en/about" />
   <link rel="alternate" hreflang="ko" href="https://example.com/ko/about" />
```

다국어/지역 변형은 canonical이 아니라 `hreflang`으로 표시한다.

### 10-5. canonical과 redirect 충돌

```
❌ /old → 301 → /new
   /new 의 canonical = /old
   (모순 — Google은 신호 신뢰도를 낮춤)

✅ /old → 301 → /new
   /new 의 canonical = /new (자기참조)
```

### 10-6. robots.txt로 정규화 시도

```
❌ User-agent: *
   Disallow: /about/   # 슬래시 있는 URL 차단해서 슬래시 없는 쪽 색인 유도

✅ /about/ → 301 → /about   (redirect로 정규화)
   /about canonical = /about
```

Google이 공식 비권장: "robots.txt를 canonical 목적으로 사용하지 마라." 차단되면 canonical 자체를 읽지 못해 신호 전달이 안 된다.

### 10-7. http→https 후 www 처리 누락 → 2단 redirect

```
❌ http://www.example.com/foo
    → 301 → https://www.example.com/foo
    → 301 → https://example.com/foo

✅ http://www.example.com/foo
    → 301 → https://example.com/foo   (직행)
```

CDN/Nginx 룰을 *최종 형태로 한 번에* 보내도록 작성한다.

### 10-8. sitemap에 비정규 URL 포함

```
❌ sitemap.xml 에 /about/, /about, http://example.com/about 가 모두 들어있음
✅ sitemap.xml 에는 canonical URL만 포함 (정규화 후 형태)
```

sitemap의 URL과 canonical 메타가 불일치하면 Google이 어느 것이 정답인지 헷갈린다.

---

## 11. 자가 진단 체크리스트 (운영용)

배포 후 즉시 확인:

- [ ] http://example.com → https://example.com 단일 301 (1 hop)
- [ ] http://www.example.com → https://example.com 단일 301 (1 hop)
- [ ] https://www.example.com → https://example.com 단일 301 (1 hop)
- [ ] https://example.com/About → https://example.com/about 301
- [ ] 트레일링 슬래시 정책 한쪽으로 통일 + 반대 형태 301
- [ ] `/index.html` → `/` 301
- [ ] 모든 페이지의 canonical 메타가 자기참조
- [ ] canonical URL이 sitemap.xml 형태와 일치
- [ ] robots.txt가 canonical URL을 차단하지 않음
- [ ] utm/fbclid 등 쿼리 파라미터로 들어와도 canonical은 파라미터 없는 URL
- [ ] redirect chain 어디에도 3 hops 이상 없음
- [ ] 페이지네이션 페이지(`/blog?page=2`)도 자기참조 canonical (rel=prev/next 사용 안 함)

---

## 12. 참고 자료

- Google Search Central — Consolidate duplicate URLs: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google Search Central — What is URL Canonicalization: https://developers.google.com/search/docs/crawling-indexing/canonicalization
- MDN — HTTP Redirections: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections
- Next.js — trailingSlash: https://nextjs.org/docs/app/api-reference/config/next-config-js/trailingSlash
- Next.js — Middleware: https://nextjs.org/docs/app/api-reference/file-conventions/middleware
- Next.js — generateMetadata: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Vercel — Configuration Redirects: https://vercel.com/docs/routing/redirects/configuration-redirects
- Netlify — Redirect options: https://docs.netlify.com/manage/routing/redirects/redirect-options/
- Cloudflare Pages — Redirects: https://developers.cloudflare.com/pages/configuration/redirects/
- Nginx — If is Evil: https://nginx.com/resources/wiki/start/topics/depth/ifisevil/
- Search Engine Journal — Mueller on redirect chains (<5 hops): https://www.searchenginejournal.com/googles-john-mueller-recommends-less-than-5-hops-per-redirect-chain/344664/
- Yoast — Google deprecated rel=prev/next: https://yoast.com/google-doesnt-use-rel-prev-next-for-pagination/
