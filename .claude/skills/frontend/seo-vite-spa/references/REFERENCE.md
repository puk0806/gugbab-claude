## 6. 빌드 타임 프리렌더 (SSG) — 가장 효과 큰 SEO 강화

react-helmet-async / @unhead/react만으로는 1차 크롤링 시점에 빈 HTML만 보인다. **Googlebot이 아닌 크롤러나 LLM 봇은 2차 렌더 자체를 수행하지 않으므로 SEO 누락이 발생한다.** 빌드 타임 프리렌더로 정적 HTML을 미리 생성하면 이 문제를 해결할 수 있다.

### 6-1. Vike (구 vite-plugin-ssr) — 권장

Vike는 vite-plugin-ssr이 리브랜드된 이름으로, 공식 URL은 `vike.dev`다. SPA / SSR / SSG / HTML-only 4가지 렌더 모드를 페이지 단위로 선택할 수 있다.

```bash
npm i -D vike
```

```js
// pages/+config.js  (또는 +config.ts)
export default {
  prerender: true,  // 전체 페이지 SSG
}
```

페이지별로 오버라이드 가능:

```js
// pages/admin/+config.js
export default {
  prerender: false,  // 관리자 페이지는 SPA로 유지
  ssr: false,
}
```

빌드:

```bash
vike build
```

`dist/client/`에 모든 라우트의 정적 HTML이 생성되고, 별도 Node 서버 없이 CDN·정적 호스팅(S3, Vercel, Netlify, Cloudflare Pages 등)에 그대로 올릴 수 있다.

**적합한 상황:**
- 콘텐츠가 빌드 시점에 결정되는 페이지 (마케팅, 블로그, 문서, 제품 카탈로그)
- 실시간성보다 인덱싱 신선도가 덜 중요한 페이지

**부적합한 상황:**
- 페이지별 콘텐츠가 매 요청마다 다름 (개인화 피드, 실시간 대시보드)
- 페이지 수가 매우 많고 빌드 시간이 비현실적

> 참고: 구 `vite-plugin-ssr` 패키지는 v0.4.142가 마지막 dual-published 버전이며, 그 이후로는 `vike` 패키지로만 배포된다. 마이그레이션 시 import 경로만 바꾸면 되는 경우가 대부분이다.

### 6-2. vite-prerender-plugin — 가벼운 대안

이미 일반 Vite + React SPA로 운영 중이고 Vike만큼의 구조 변경 없이 핵심 라우트만 프리렌더하고 싶다면 `vite-prerender-plugin`(preactjs 조직 유지)을 사용할 수 있다.

```bash
npm i -D vite-prerender-plugin
```

빌드 시 지정한 라우트에 대해 headless 브라우저로 페이지를 실행하고, 그 결과 HTML을 정적 파일로 저장한다.

> 주의: `vite-plugin-prerender`(Rudeus3Greyrat 저장소)는 최근 1년 이상 npm publish 활동이 없어 사실상 미유지보수 상태다. 신규 채택 시 활성 상태인 `vite-prerender-plugin`(preactjs 조직)을 선택할 것.

> 주의: `react-snap`(stereobooster)은 한때 표준처럼 쓰였지만 2019년 이후 신규 커밋이 끊긴 상태다. 신규 프로젝트에는 권장하지 않는다.

---

## 7. OpenGraph 이미지

### 정적 이미지

가장 단순한 방법은 OG 이미지를 디자인 도구로 만들어 `public/og/`에 두는 것이다. 라우트별로 다른 이미지가 필요하면 미리 파일로 만들어두고 메타 태그에서 경로만 다르게 지정한다.

### 빌드 타임 동적 생성 — satori

라우트가 많고 텍스트만 다른 OG 이미지를 자동 생성하려면 Vercel의 `satori`(JSX/HTML+CSS → SVG 변환)와 `@resvg/resvg-js`(SVG → PNG 변환)을 빌드 스크립트에서 사용할 수 있다.

```bash
npm i -D satori @resvg/resvg-js
```

```ts
// scripts/generate-og.ts
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import fs from 'node:fs/promises'

async function generate(title: string, slug: string) {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          width: '1200px',
          height: '630px',
          background: '#0f172a',
          color: 'white',
          fontSize: 64,
          padding: 64,
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
          data: await fs.readFile('./assets/pretendard.ttf'),
          weight: 700,
          style: 'normal',
        },
      ],
    }
  )

  const png = new Resvg(svg).render().asPng()
  await fs.writeFile(`./public/og/${slug}.png`, png)
}
```

> 주의: satori는 순수 JSX만 받는다. `useState`, `useEffect`, `dangerouslySetInnerHTML` 등은 지원하지 않는다. 컴포넌트는 props만 받는 형태로 작성할 것.

---

## 8. CRA 레거시에서 즉시 가능한 조치

CRA 마이그레이션이 단기간에 불가능한 경우에 한해, **현 상태에서 손해를 줄이는** 최소 조치:

1. `public/index.html`에 사이트 전역 메타·OG를 정적으로 박는다 (1절 참조).
2. `react-helmet-async` v3로 라우트별 메타·OG·JSON-LD를 동적 갱신한다 (2·4절).
3. `public/sitemap.xml`, `public/robots.txt`를 정적 파일로 작성한다 (5절).
4. 핵심 마케팅·랜딩 페이지만 별도 정적 HTML(예: 별도 Vite 프로젝트의 SSG 산출물)로 분리해 동일 도메인 다른 경로로 호스팅하는 하이브리드 전략을 검토한다.

CRA 자체에서 프리렌더(예: react-snap)는 도구가 dormant 상태라 신규 도입 위험이 크다. **장기 해결책은 Vite + Vike로의 마이그레이션**이며, React 팀 공식 권장 경로도 같다.

---

## 흔한 실수 패턴

| 실수 | 결과 | 해결 |
|------|------|------|
| `<HelmetProvider>` 누락 | Helmet이 head에 반영 안 됨 | main.tsx에서 최상위로 감싸기 |
| `JSON.stringify` 결과를 그대로 script에 박음 | XSS·`</script>` 컨텍스트 탈출 | `<` → `<` 이스케이프 |
| meta `property` vs `name` 혼동 | OG 메타가 페이스북·카카오에서 안 잡힘 | OG는 `property="og:*"`, 일반 SEO는 `name="description"` |
| canonical URL을 상대경로로 지정 | 검색엔진이 다른 도메인으로 인덱싱 | 항상 절대 URL (`https://...`) |
| public/index.html에 메타 없이 helmet만 의존 | LLM·비-Googlebot 크롤러는 빈 셸만 봄 | index.html에 사이트 전역 메타 필수 |
| sitemap.xml 라우트와 실제 라우트 불일치 | 404 인덱싱 → 크롤 예산 낭비 | 빌드 시 자동 생성 또는 라우트 정의 단일화 |
| react-snap·vite-plugin-prerender(Rudeus3Greyrat) 신규 채택 | 보안 패치·React 19 대응 없음 | Vike 또는 vite-prerender-plugin 사용 |
| Helmet 내부에서 `useState` 비동기 업데이트로 메타 갱신 시도 | 1차 렌더에 메타가 비어 있고, hydration 후 갱신 | 데이터를 미리 fetch한 후 메타와 함께 렌더 |

---

## 언제 이 스킬이 부족한가

다음 상황에서는 SPA + 이 스킬의 조치만으로는 불충분하다. 프레임워크 전환을 검토해야 한다.

- 검색 트래픽이 비즈니스 핵심이고 신선도가 중요한 콘텐츠 (뉴스, 가격 정보, 재고 등)
- LLM·AI 크롤러 가시성이 중요한 콘텐츠 (지식 베이스, 문서, 공개 API 레퍼런스)
- 페이지 수가 매우 많아 빌드 타임 프리렌더가 비현실적
- 사용자별·세션별로 콘텐츠가 다르지만 동시에 SEO도 필요한 경우 → SSR 필수

이때는 Next.js 또는 Vike(SSR 모드), React Router framework mode 등을 검토하는 것이 정도다.
