---
name: og-image-generation
description: >
  OpenGraph 이미지(소셜 미리보기용)를 동적으로 생성하는 패턴 카탈로그.
  표준 1200×630 사양, Next.js ImageResponse 파일 컨벤션, vercel/satori 단독 사용,
  한국어 폰트(Noto Sans KR / Pretendard) 임베드, 빌드 시 사전 생성 vs 런타임 생성,
  카카오톡·X·페이스북 미리보기 검증까지 다룬다.
---

# OG 이미지 동적 생성

> 소스:
> - https://ogp.me/ (OpenGraph Protocol)
> - https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image (Next.js 16.2.7)
> - https://nextjs.org/docs/app/api-reference/functions/image-response (Next.js 16.2.7)
> - https://github.com/vercel/satori (v0.27.0, 2026-04-30)
> - https://developer.x.com/en/docs/x-for-websites/cards/overview/summary-card-with-large-image
> - https://developers.facebook.com/docs/sharing/webmasters/images
>
> 검증일: 2026-06-02
> 대상 버전: Next.js 16.x · satori 0.27.0 · @vercel/og(현 `next/og`)

OpenGraph 이미지는 링크가 공유될 때 카카오톡·Slack·X·페이스북·LinkedIn에서 표시되는 미리보기 카드의 핵심 비주얼이다. 정적 PNG 1장을 두는 방식도 가능하지만 글 제목·태그·작성자 같은 가변 정보를 담으려면 *동적 생성*이 표준이다.

---

## 1. 사양 — 무조건 1200×630부터

| 항목 | 권장 값 | 출처 |
|------|---------|------|
| 크기 | **1200 × 630 px** (1.91:1) | Facebook 권장 — `og:image` |
| X(Twitter) summary_large_image | 1200 × 628 또는 1200 × 630 모두 작동 | X Developer docs |
| 최소 크기 | 600 × 315 px | Facebook |
| 파일 크기 | **8 MB 이하** (Facebook), **5 MB 이하** (X/Twitter) | Next.js 빌드는 초과 시 실패 |
| 권장 파일 크기 | 300 KB 이하 (크롤러 타임아웃 회피) | 실무 권장치 |
| MIME | `image/png` · `image/jpeg` · `image/webp` | GIF는 첫 프레임만 표시 |
| URL | **반드시 절대 URL** (`https://...`) — 상대 URL 무시됨 | OGP 스펙 |

**메타 태그 필수 4종 + 접근성 1종:**

```html
<meta property="og:image" content="https://example.com/og/post-123.png" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="포스트 제목 — 작성자 이름" />
```

OGP 스펙은 "`og:image`를 명시하면 `og:image:alt`도 명시해야 한다"고 규정한다. 접근성·SEO 모두를 위해 누락 금지.

**X(Twitter) 카드 별도 태그:**

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://example.com/og/post-123.png" />
<meta name="twitter:image:alt" content="..." />
```

> 주의: X는 공식적으로 1200×628 (1.91:1)을 선호하지만, 실무에서는 1200×630 단일 이미지로 OG·X 모두 커버하는 것이 가장 단순하다. 양 플랫폼 모두 중앙 1080×600 안전 영역(safe zone) 안에 핵심 텍스트/얼굴을 배치하라.

---

## 2. Next.js App Router — `opengraph-image.tsx` 파일 컨벤션

App Router에서는 라우트 세그먼트에 `opengraph-image.tsx`(또는 `.js`/`.ts`)를 두면 빌드 시 자동으로 OG 메타 태그가 head에 주입된다.

### 정적 라우트 — 기본 형태

```tsx
// app/opengraph-image.tsx
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// 메타데이터 (alt / size / contentType 모두 export 필수가 아니지만 권장)
export const alt = '국밥집 — 매일 아침 끓이는 진짜 사골'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  // process.cwd()는 Next.js 프로젝트 루트
  const pretendard = await readFile(
    join(process.cwd(), 'assets/fonts/Pretendard-Bold.ttf')
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          color: 'white',
          padding: '80px',
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, marginBottom: 24 }}>
          국밥집
        </div>
        <div style={{ fontSize: 36, opacity: 0.85 }}>
          매일 아침 끓이는 진짜 사골
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Pretendard',
          data: pretendard,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  )
}
```

생성되는 `<head>`:

```html
<meta property="og:image" content="<generated>" />
<meta property="og:image:alt" content="국밥집 — 매일 아침 끓이는 진짜 사골" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

### 동적 라우트 — `params` Promise

```tsx
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const alt = 'Blog post'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  // Next.js 16부터 params는 Promise
  const { slug } = await params
  const post = await fetch(`https://api.example.com/posts/${slug}`).then((r) =>
    r.json()
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'white',
          padding: 80,
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, color: '#111' }}>
          {post.title}
        </div>
        <div style={{ fontSize: 28, color: '#666', marginTop: 'auto' }}>
          {post.author} · {post.date}
        </div>
      </div>
    ),
    { ...size }
  )
}
```

> 주의: Next.js 16부터 `params`는 `Promise<{ slug: string }>` 타입이다 (v15까지는 동기 객체). 마이그레이션 시 `await params` 추가 필요.

### `twitter-image.tsx` — 별도 파일이지만 거의 동일

`app/twitter-image.tsx`를 만들면 `twitter:image` 메타가 자동 주입된다. 동일한 디자인을 양쪽에 쓰려면 공용 함수로 분리:

```tsx
// app/_lib/og-image.tsx
import { ImageResponse } from 'next/og'
export async function renderOgImage(title: string) {
  return new ImageResponse(/* ... */, { width: 1200, height: 630 })
}

// app/opengraph-image.tsx
export { renderOgImage as default } from './_lib/og-image'

// app/twitter-image.tsx
export { renderOgImage as default } from './_lib/og-image'
```

### 런타임 선택 — 기본은 Node.js

| 런타임 | 장점 | 단점 |
|--------|------|------|
| Node.js (기본) | 파일 시스템 접근 → 로컬 폰트/이미지 `readFile` 사용 가능 | 콜드 스타트가 Edge보다 느림 |
| Edge (`export const runtime = 'edge'`) | 글로벌 분산, 빠른 콜드 스타트 | `fs` 불가 → 폰트는 `fetch`로 가져와야 함 |

기본값은 Node.js이며, 한국어 폰트를 로컬에서 임베드하는 패턴이라면 Node.js가 자연스럽다. Edge로 전환하면 폰트도 `fetch(new URL('./font.ttf', import.meta.url))`로 가져와야 한다.

### 정적 최적화 — 자동

`opengraph-image.tsx`는 *Request-time API*(`headers()`, `cookies()`, `searchParams`)나 캐시되지 않은 `fetch`를 사용하지 않으면 **빌드 시 정적 PNG로 사전 생성**되어 캐시된다. 동적 라우트(`[slug]`)는 `generateStaticParams`가 반환한 슬러그에 한해 빌드 시 생성된다.

---

## 3. vercel/satori 단독 사용 — Next.js가 아닌 환경

`@vercel/og`(Next.js의 `next/og`)는 내부적으로 다음 3단을 조합한다:

```
JSX → satori → SVG → resvg-js → PNG
```

Next.js가 아닌 환경(Vite·Astro·SvelteKit·순수 Node 스크립트)에서는 직접 조합한다.

### 설치

```bash
npm i satori @resvg/resvg-js
```

> 주의: `@resvg/resvg-js`는 네이티브 바이너리 의존성이 있다. Cloudflare Workers·Vercel Edge 같은 WASM 전용 환경에서는 `@resvg/resvg-wasm`을 사용한다.

### 기본 사용 — SVG → PNG

```ts
// scripts/generate-og.ts
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'node:fs'

async function generateOg(title: string, outPath: string) {
  // 1. 폰트 로드 (TTF/OTF/WOFF만 지원, WOFF2 X)
  const fontData = readFileSync('./assets/Pretendard-Bold.ttf')

  // 2. JSX → SVG
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: 'white',
          fontSize: 72,
          fontWeight: 700,
        },
        children: title,
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Pretendard',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  )

  // 3. SVG → PNG
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  const png = resvg.render().asPng()

  writeFileSync(outPath, png)
}

await generateOg('국밥집 — 매일 아침 끓이는 진짜 사골', './public/og/home.png')
```

JSX 문법을 쓰고 싶으면 `tsx` 또는 Vite로 트랜스파일 후 실행, 또는 `satori-html` 패키지를 사용해 HTML 문자열을 satori 입력 객체로 변환한다.

### 지원 CSS — flexbox 중심

| 지원 | 미지원 |
|------|--------|
| flexbox 전체 (flexDirection, gap, alignItems, justifyContent...) | **CSS Grid** (`display: grid`) |
| position: relative, absolute | `z-index` |
| background, backgroundImage(그라디언트·url) | `calc()` |
| border, borderRadius, boxShadow | 3D transform |
| transform 2D, transformOrigin | `cursor` |
| color, fontSize, fontWeight, lineHeight, letterSpacing | `<style>` 태그, 외부 CSS |
| textAlign, textDecoration, textShadow | `dangerouslySetInnerHTML` |
| backgroundImage with linear-gradient | RTL 언어 |
| lineClamp | `useState`/`useEffect` 등 React 훅 |

레이아웃 짤 때 본능적으로 `display: grid`를 쓰지 마라. **모든 컨테이너는 `display: 'flex'`로 시작한다** — 컨테이너 자식이 2개 이상이면 satori는 명시적 `display: flex`를 요구한다(없으면 워닝).

---

## 4. 한국어 폰트 임베드 — 가장 흔하게 실패하는 지점

OG 이미지에 한국어 텍스트를 박으면 폰트가 없을 때 □(tofu)로 표시된다. satori/ImageResponse는 *명시적으로 ArrayBuffer로 전달된 폰트만* 사용한다.

### 옵션 A: Pretendard / Noto Sans KR 전체 폰트 임베드 (간단·무거움)

```tsx
// app/opengraph-image.tsx
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const pretendardRegular = await readFile(
    join(process.cwd(), 'assets/fonts/Pretendard-Regular.ttf')
  )
  const pretendardBold = await readFile(
    join(process.cwd(), 'assets/fonts/Pretendard-Bold.ttf')
  )

  return new ImageResponse(
    (
      <div style={{ /* ... */ fontFamily: 'Pretendard' }}>
        <div style={{ fontWeight: 700 }}>매일 아침 끓이는 사골</div>
        <div style={{ fontWeight: 400 }}>국밥집의 진심을 전합니다</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Pretendard', data: pretendardRegular, weight: 400, style: 'normal' },
        { name: 'Pretendard', data: pretendardBold,    weight: 700, style: 'normal' },
      ],
    }
  )
}
```

> 주의: Pretendard Variable(`Pretendard-Variable.ttf`)는 satori가 가변 폰트의 weight 축을 완전히 해석하지 못할 수 있다. **각 weight별 정적 폰트 파일**을 분리해 등록하는 것이 안전하다.

### 옵션 B: 폰트 서브셋 — 번들 크기 감축

Pretendard Bold 전체는 ~2MB. Next.js `ImageResponse`는 **최대 번들 500KB** 제한이 있어 weight 2~3종을 다 넣으면 한도를 넘는다. 해결책은 *서브셋*:

```bash
# Python pyftsubset (fonttools)로 한글 완성형 11,172자만 추출
pyftsubset Pretendard-Bold.ttf \
  --unicodes=U+AC00-D7A3,U+0020-007E,U+3131-318F \
  --output-file=Pretendard-Bold-KR.ttf
```

| 범위 | 의미 |
|------|------|
| `U+AC00-D7A3` | 한글 완성형 음절 11,172자 |
| `U+0020-007E` | ASCII 기본 |
| `U+3131-318F` | 한글 자모 (ㄱ, ㄴ, ...) |

서브셋 후 보통 200~400KB로 축소된다.

### 옵션 C: 동적 폰트 로딩 — `loadAdditionalAsset`

satori의 `loadAdditionalAsset` 콜백은 텍스트 세그먼트별로 폰트가 없으면 호출된다. CJK·이모지 등을 동적으로 로드하는 데 쓴다.

```ts
// satori 단독 사용
const svg = await satori(jsx, {
  width: 1200,
  height: 630,
  fonts: [{ name: 'Inter', data: interData, weight: 400, style: 'normal' }],
  loadAdditionalAsset: async (code, segment) => {
    if (code === 'emoji') {
      // 이모지 SVG 반환 (예: twemoji)
      return `data:image/svg+xml;base64,${await fetchEmojiBase64(segment)}`
    }
    // code === 'ko' / 'ja' / 'zh' 등 언어 코드
    if (code === 'ko-KR' || code === 'ko') {
      const fontData = await fetchKoreanFont() // ArrayBuffer 반환
      return {
        name: 'NotoSansKR',
        data: fontData,
        weight: 400,
        style: 'normal',
      }
    }
    return [] // 처리할 수 없으면 빈 배열
  },
})
```

> 주의: `loadAdditionalAsset`은 satori 직접 사용 시 옵션이다. Next.js `ImageResponse`는 이 콜백을 직접 노출하지 않으므로 옵션 A/B를 쓰거나, fonts 배열에 모든 weight를 한 번에 등록한다.

---

## 5. 빌드 시 사전 생성 vs 요청 시 동적 생성

### 5-1. SSG 사전 생성 (Vite/Astro/순수 정적 사이트)

빌드 스크립트로 모든 슬러그에 대해 PNG를 생성해 `public/og/`에 떨군다.

```ts
// scripts/build-og.ts — Vite 빌드 hook 또는 prebuild 스크립트
import { glob } from 'glob'
import { readFileSync, mkdirSync } from 'node:fs'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { join } from 'node:path'
import { writeFileSync } from 'node:fs'

const fontData = readFileSync('./assets/Pretendard-Bold-KR.ttf')
mkdirSync('./public/og', { recursive: true })

// 모든 마크다운 포스트에서 frontmatter 추출
const posts = await loadAllPosts() // [{ slug, title, author, date }]

for (const post of posts) {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: { /* ... */ display: 'flex', fontFamily: 'Pretendard' },
        children: [
          { type: 'h1', props: { style: { fontSize: 64 }, children: post.title } },
          { type: 'p',  props: { style: { fontSize: 24 }, children: post.author } },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Pretendard', data: fontData, weight: 700, style: 'normal' }],
    }
  )
  const png = new Resvg(svg).render().asPng()
  writeFileSync(`./public/og/${post.slug}.png`, png)
}
```

`package.json`:

```json
{
  "scripts": {
    "prebuild": "tsx scripts/build-og.ts",
    "build": "vite build"
  }
}
```

HTML 측에서는 절대 URL로 참조:

```html
<meta property="og:image" content="https://example.com/og/post-123.png" />
```

### 5-2. 요청 시 동적 생성 (Next.js / Edge Functions)

Next.js의 `opengraph-image.tsx`는 정적 라우트는 빌드 시 사전 생성, 동적 라우트는 첫 요청 시 생성 후 캐시된다. 추가 캐시 헤더를 주려면 `ImageResponse` options에 headers를 넣는다:

```tsx
return new ImageResponse(/* ... */, {
  ...size,
  headers: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
})
```

> 주의: `immutable`은 콘텐츠가 절대 바뀌지 않을 때만 쓴다. 글 제목이 바뀔 수 있다면 URL에 콘텐츠 해시(`/og/post-123-<hash>.png`)를 박고, 글 수정 시 해시가 바뀌게 만든다.

---

## 6. 캐시 전략

| 시나리오 | Cache-Control |
|----------|---------------|
| 정적 사이트 + 콘텐츠 해시 URL (예: `/og/post-<hash>.png`) | `public, max-age=31536000, immutable` |
| 정적 사이트 + 슬러그 URL (변경 가능) | `public, max-age=3600, s-maxage=86400` |
| Next.js `opengraph-image` 자동 캐시 (기본) | Next.js가 알아서 처리 |
| 외부 OG 생성 API (예: `og.example.com/?title=...`) | `public, max-age=86400` + CDN |

크롤러(Facebook, X)는 한번 가져온 OG 이미지를 길게 캐시한다. 디자인이 바뀌면 *URL을 바꿔야* 미리보기가 갱신된다 — 같은 URL로 이미지만 교체하면 며칠~몇 주간 옛 이미지가 표시될 수 있다.

크롤러 캐시 강제 갱신:
- Facebook: [Sharing Debugger](https://developers.facebook.com/tools/debug/) → "Scrape Again"
- X(Twitter): Card Validator는 deprecated. 새 트윗을 올려 자동 fetch 유도
- 카카오: [카카오 디벨로퍼스 도구](https://developers.kakao.com/tool/clear/og) → "캐시 초기화"

---

## 7. `@vercel/og` vs `next/og` — import 경로

| Next.js 버전 | import 경로 | 비고 |
|--------------|-------------|------|
| 13.0~13.2 | `import { ImageResponse } from '@vercel/og'` | 별도 패키지 설치 |
| 13.3 | `import { ImageResponse } from 'next/server'` | 통합 진행 중 |
| **14.0+** | **`import { ImageResponse } from 'next/og'`** | 현재 공식 경로 |

Next.js 14+ 프로젝트는 `next/og`만 쓰면 되고 `@vercel/og`를 별도 설치할 필요 없다. 옛 코드를 마이그레이션할 때는 단순 import 경로 변경으로 끝난다(API 호환).

Next.js가 아닌 프로젝트(Vite·SvelteKit 등)는 `satori + @resvg/resvg-js`를 직접 조합한다. `@vercel/og`를 단독으로 쓰는 경우는 거의 없다(Vercel Edge Functions 외에는 이점이 적음).

---

## 8. 외부 OG 생성 서비스 — 대안

직접 구현이 부담스러우면 외부 서비스로 대체할 수 있다:

| 서비스 | 특징 | 트레이드오프 |
|--------|------|--------------|
| Cloudinary | 이미지 변환 + 텍스트 오버레이 URL 파라미터 | 무료 한도 후 유료, URL 복잡 |
| Bannerbear | 템플릿 기반 + API | 월 정액제 |
| og.dev / vercel/og-playground | 디자인 → URL 발급 | 외부 의존성 |

직접 구현은 (a) 디자인 자유도 (b) CDN/캐시 비용 통제 (c) 외부 의존성 제거가 가치 있을 때 선택한다. 단순 텍스트 카드 한 종류라면 외부 서비스가 합리적이다.

---

## 9. 흔한 실수 패턴

| 실수 | 증상 | 해결 |
|------|------|------|
| `og:image`에 상대 URL (`/og.png`) | 미리보기 안 뜸 | **반드시 절대 URL** (`https://...`) |
| 1200×630 외 비율(예: 800×600) | 카카오톡/Slack에서 잘림·여백 | 1.91:1 비율 고수 |
| 한국어 폰트 미임베드 | 한글이 □(tofu)로 표시 | Pretendard/Noto Sans KR ArrayBuffer 등록 |
| satori에서 `display: grid` 사용 | 빈 영역 또는 렌더링 실패 | flexbox로 재구성 |
| 자식 2개 이상인데 `display: flex` 누락 | satori 워닝 + 레이아웃 깨짐 | 컨테이너에 명시적 `display: 'flex'` |
| Pretendard Variable 폰트만 등록 | weight 적용 안 됨 | weight별 정적 폰트 파일 분리 |
| `og:image:alt` 누락 | 접근성 경고 + SEO 감점 | 반드시 함께 출력 |
| 파일 크기 8MB 초과 | Facebook 무시, Next.js 빌드 실패 | PNG 압축(pngquant) 또는 WebP |
| 같은 URL로 이미지만 교체 | 크롤러 캐시로 옛 이미지 표시 | URL에 콘텐츠 해시 박기 |
| Edge runtime + `readFile` | 빌드 에러 | Node.js runtime 사용 또는 `fetch(new URL(...))` |
| WOFF2 폰트 사용 | satori 파싱 실패 | TTF/OTF/WOFF만 사용 |
| Next.js 16+ `params` 동기 접근 | 런타임 에러 | `await params` 사용 |
| `ImageResponse` 번들 500KB 초과 | 빌드/런타임 에러 | 폰트 서브셋 + 이미지 외부화 |

---

## 10. 검증 도구

OG 이미지를 배포 전·후 반드시 검증한다:

| 도구 | URL | 용도 |
|------|-----|------|
| Facebook Sharing Debugger | https://developers.facebook.com/tools/debug/ | 페이스북 미리보기 + 크롤러 캐시 갱신 |
| opengraph.xyz | https://www.opengraph.xyz/ | Facebook/X/LinkedIn/Slack 통합 미리보기 |
| 카카오 디벨로퍼스 캐시 초기화 | https://developers.kakao.com/tool/clear/og | 카카오톡 미리보기 캐시 갱신 |
| LinkedIn Post Inspector | https://www.linkedin.com/post-inspector/ | LinkedIn 미리보기 |
| Slack Unfurl Preview | (별도 도구 없음) | 비공개 채널에 링크 붙여 직접 확인 |

> 주의: X(Twitter) Card Validator는 2022년 이후 *deprecated*되었다. X는 카드를 직접 검증할 공식 도구를 제공하지 않으며, 실제 트윗을 올려 확인해야 한다.

검증 순서:
1. opengraph.xyz에서 메타 태그 정상 출력 확인
2. Facebook Debugger에서 "Scrape Again" → 1200×630 PNG 표시 확인
3. 카카오톡 본인 대화방에 링크 붙여 모바일 미리보기 확인 (한국 서비스 필수)
4. Slack DM/채널에 붙여 unfurl 확인

---

## 11. 언제 동적 생성 / 언제 정적 PNG / 언제 외부 서비스

| 상황 | 권장 |
|------|------|
| 페이지 1개만 있는 단순 사이트 | 정적 PNG 1장 (`public/og.png`) + `<meta>`만 박기 |
| 글 수 < 100, 디자인 자주 변경 | SSG 사전 생성 (Vite/Astro 빌드 스크립트) |
| 글 수 > 100, 동적 생성 필요 | Next.js `opengraph-image.tsx` (자동 캐시) |
| 디자인 자유도 낮아도 됨 | Cloudinary/Bannerbear 외부 서비스 |
| 매번 다른 콘텐츠 (예: 사용자 프로필 카드) | Edge Function + 캐시 헤더 |

**기본 추천**: Next.js 프로젝트라면 `opengraph-image.tsx` 파일 컨벤션, 그 외에는 `satori + @resvg/resvg-js` 빌드 스크립트로 SSG.
