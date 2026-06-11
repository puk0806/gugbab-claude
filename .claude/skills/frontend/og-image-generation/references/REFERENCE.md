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
