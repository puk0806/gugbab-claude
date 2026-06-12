## 7. alt text — a11y + SEO 교차 가이드

### 7-1. 4가지 상황별 작성법

| 이미지 유형 | alt 작성법 |
|-------------|-----------|
| **장식 이미지** (배경·구분선 등) | `alt=""` (빈 문자열) — 스크린리더 건너뜀 |
| **정보 이미지** (콘텐츠·제품) | 5W1H 중심 묘사, 키워드 자연 포함, 80~140자 권장 |
| **기능 이미지** (버튼·링크 아이콘) | *동작* 설명 (예: `alt="장바구니에 담기"`) |
| **차트·그래프** | 짧은 alt + 본문 또는 `<figcaption>`에 데이터 상세 |

### 7-2. 좋은 alt vs 나쁜 alt

| 나쁨 | 좋음 |
|------|------|
| `alt="puppy"` | `alt="흰색 카펫 위에서 빨간 공을 물고 있는 6주령 달마시안 강아지"` |
| `alt="image of a headphone"` | `alt="2026년형 무선 헤드폰 — 매트 블랙, 우측 측면 각도, 노이즈 캔슬링 버튼이 보임"` |
| `alt="신발 신발 운동화 러닝화 가벼운 신발 2026"` (키워드 스터핑) | `alt="2026 봄 신상 러닝화 — 라이트그레이, 옆면 메쉬 통기 패널 강조"` |
| `alt="버튼"` | `alt="다음 페이지로 이동"` |

### 7-3. 절대 금지 패턴

Google 공식 가이드 인용:
> "Filling alt attributes with keywords (also known as keyword stuffing) results in a negative user experience and may cause your site to be seen as spam."

추가 금지:
- `alt="image of ..."` / `alt="picture of ..."` / `alt="사진..."` — 스크린리더가 이미 "image" 안내. 중복.
- 파일명 그대로 (`alt="IMG_2034.jpg"`)
- 빈 의미 단어 (`alt="여기에 이미지"`)

### 7-4. WCAG 2.2 교차 참조

- 1.1.1 Non-text Content (Level A) — 모든 비텍스트 콘텐츠에 텍스트 대안
- 1.4.5 Images of Text (Level AA) — 이미지 안에 텍스트를 박지 말 것 (확대·번역 불가, AI도 못 읽음)
- 자세한 WCAG 항목별 체크리스트는 [[wcag-2.2-checklist]] 참조

---

## 8. lazy loading — 언제 쓰고 언제 *쓰지 말 것인지*

### 8-1. 기본 규칙

```html
<!-- below-the-fold: 명시적 lazy -->
<img src="/img/article-3.jpg" alt="..." loading="lazy" decoding="async"
     width="800" height="450" />

<!-- LCP 이미지: 절대 lazy 금지 -->
<img src="/img/hero.jpg" alt="..." fetchpriority="high" decoding="async"
     width="1920" height="1080" />
```

### 8-2. LCP 이미지에 `loading="lazy"` 금지

web.dev 공식 권고:
> "Don't lazy load your LCP image."

이유:
- `loading="lazy"`는 이미지가 뷰포트 근처에 올 때까지 **요청을 지연**한다
- LCP 이미지는 첫 페인트에 가장 큰 요소 → 지연 시 LCP 지표 직격
- `loading="lazy" + fetchpriority="high"` 조합은 **모순** (지연하면서 높은 우선순위로 가져와라?). 둘 다 쓰지 말 것.

### 8-3. 무엇을 쓸 것인가

| 위치 | loading | fetchpriority | decoding |
|------|---------|---------------|----------|
| LCP 후보 (above-the-fold 단일 큰 이미지) | (생략 = eager) | `high` | `async` |
| Above-the-fold 보조 이미지 | (생략) | (생략) | `async` |
| Below-the-fold | `lazy` | (생략) | `async` |
| 매우 중요한 below-the-fold | `lazy` | (생략. high 금지) | `async` |

`IntersectionObserver` 폴백 라이브러리는 **불필요**하다 — `loading="lazy"`는 모든 모던 브라우저(Chrome 77+, Safari 15.4+, Firefox 75+)에서 지원된다.

---

## 9. 빌드 시 자동 최적화 — sharp 스크립트

`sharp` 0.34 기준. 원본 1장 → AVIF/WebP/JPEG 3종 × 4 크기 = 12개 생성.

```js
// scripts/optimize-images.mjs
import sharp from 'sharp'
import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'src/assets/originals'
const OUT = 'public/img'
const WIDTHS = [480, 800, 1200, 1920]

const FORMATS = [
  { ext: 'avif', options: { quality: 60, effort: 4 } },
  { ext: 'webp', options: { quality: 80, effort: 6 } },
  { ext: 'jpg',  options: { quality: 82, mozjpeg: true, progressive: true } },
]

async function processOne(file) {
  const name = path.parse(file).name
  const input = path.join(SRC, file)

  for (const w of WIDTHS) {
    for (const fmt of FORMATS) {
      const out = path.join(OUT, `${name}-${w}.${fmt.ext}`)
      await sharp(input)
        .resize({ width: w, withoutEnlargement: true })
        .toFormat(fmt.ext === 'jpg' ? 'jpeg' : fmt.ext, fmt.options)
        .toFile(out)
      console.log(`✓ ${out}`)
    }
  }
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const files = (await readdir(SRC)).filter(f => /\.(jpg|jpeg|png|tiff)$/i.test(f))
  for (const f of files) await processOne(f)
}

main().catch(e => { console.error(e); process.exit(1) })
```

실행: `node scripts/optimize-images.mjs`

주의:
- AVIF는 인코딩이 5~7배 느림 → 빌드 시간 길어진다. `effort: 4`로 균형.
- `withoutEnlargement: true` — 원본보다 크게 확대하지 않도록 차단.
- PNG의 알파가 필요하면 JPEG 대신 WebP/AVIF 폴백 유지.

대안:
- Vite — `vite-plugin-imagemin`, `vite-imagetools` (빌드 타임 변환)
- Next.js — `next/image`가 런타임에 자동 처리 (별도 스크립트 불필요)

---

## 10. CWV 영향 — CLS와 LCP

### 10-1. CLS 방지 — width/height는 *필수*

```html
<!-- 잘못 -->
<img src="/img/banner.jpg" alt="..." />

<!-- 올바름 -->
<img src="/img/banner.jpg" alt="..." width="1200" height="400" />
```

- 모던 브라우저는 `width`/`height` 속성으로부터 **aspect-ratio CSS를 자동 적용**한다 → 이미지 로딩 전에 공간을 예약 → CLS 0
- 반응형이라 `width: 100%`로 CSS 변경해도 aspect-ratio는 유지
- CSS `aspect-ratio` 속성으로도 보강 가능 (`aspect-ratio: 16 / 9`)

### 10-2. LCP 최적화 핵심

```html
<link rel="preload" as="image"
      href="/img/hero-1200.jpg"
      imagesrcset="/img/hero-720.jpg 720w, /img/hero-1200.jpg 1200w, /img/hero-1920.jpg 1920w"
      imagesizes="100vw"
      fetchpriority="high" />
```

체크리스트 (요약):
- [ ] LCP 이미지는 `<head>`에서 발견 가능한가 (HTML 직접 또는 `<link rel="preload">`)
- [ ] `fetchpriority="high"` 적용
- [ ] `loading="lazy"` *없음*
- [ ] WebP/AVIF로 서빙
- [ ] `srcset`이 잘못 설정되어 큰 이미지를 불필요하게 가져오지 않는가
- [ ] CDN edge에서 캐시되는가

자세한 LCP 진단·예산·RUM 측정은 [[core-web-vitals-optimization]] 참조.

---

## 11. GEO / AI 검색 대응

ChatGPT·Claude·Perplexity·Google AI Overviews 같은 멀티모달 AI는 이미지를 다르게 *읽는다*.

### 11-1. AI가 보는 신호

1. **alt text** — AI 어시스턴트가 직접 소비. 단일 최고 우선 신호.
2. **`<figcaption>` 캡션** — alt와 중복하지 말고 *보완 정보* (출처·확장 설명).
3. **이미지 주변 본문 텍스트** — 컨텍스트 강화
4. **structured data** — `ImageObject`, `Product.image`
5. **이미지 픽셀** — GPT-4o·Gemini 같은 vision 모델은 실제 픽셀을 분석. 저대비·과압축은 환각·드롭 유발.

### 11-2. 권장 패턴

```html
<figure>
  <img src="/img/sleep-stages-chart.jpg"
       alt="수면 단계 차트 — REM·N1·N2·N3 비율을 8시간 수면 기준으로 표시. REM 25%, N3 22%, N2 45%, N1 8%."
       width="800" height="600"
       loading="lazy" decoding="async" />
  <figcaption>
    출처: 2026년 국내 수면 패턴 조사 (n=1,247). 데이터 다운로드:
    <a href="/data/sleep-2026.csv">CSV</a>
  </figcaption>
</figure>
```

핵심:
- 차트·인포그래픽은 본문에도 **데이터를 텍스트로 동시 제공** (AI vision은 종종 숫자를 잘못 읽음)
- 이미지 내부에 **텍스트를 박지 말 것** — AI도 사람도 못 읽음 (WCAG 1.4.5 위반)
- 짧은 alt + 긴 `<figcaption>` 조합이 a11y·SEO·AI 모두 만족

---

## 12. 흔한 실수 패턴

| # | 안티 패턴 | 영향 | 수정 |
|---|-----------|------|------|
| 1 | LCP 이미지에 `loading="lazy"` | LCP 1~3초 악화 | lazy 제거, `fetchpriority="high"` 추가 |
| 2 | `width`/`height` 속성 누락 | CLS 0.1+ | 명시 또는 CSS `aspect-ratio` |
| 3 | alt에 키워드 스터핑 | SEO 페널티 위험 | 자연 묘사로 재작성 |
| 4 | 장식 이미지에 의미 있는 alt | 스크린리더 노이즈 | `alt=""` |
| 5 | `fetchpriority="high"` 남발 (전체 이미지) | 우선순위 의미 상실 → LCP 악화 | 라우트당 1개만 |
| 6 | `srcset` 없이 1920px 단일 이미지 | 모바일 데이터 낭비 | srcset+sizes 도입 |
| 7 | 사진을 PNG로 저장 | 파일 크기 5~10배 | JPEG/WebP/AVIF |
| 8 | 애니메이션을 GIF로 | 5~50배 큰 용량 | WebP 애니 또는 MP4/WebM |
| 9 | 이미지 sitemap 누락 (특히 JS 동적 삽입) | Google 색인 누락 | sitemap에 `<image:image>` 명시 |
| 10 | 이미지 안에 텍스트 박기 | 확대·번역·AI 분석 불가 | HTML 텍스트로 분리, 배경만 이미지 |
| 11 | `loading="lazy"` + `fetchpriority="high"` 조합 | 자기모순 — 우선순위 무력화 | 하나만 선택 |
| 12 | `<picture>` 안에서 `<img>` fallback 누락 | 일부 브라우저 깨짐 | fallback `<img>` 필수 |
| 13 | `alt="image of ..."` / `alt="사진..."` | 스크린리더 중복 안내 | 바로 묘사 시작 |
| 14 | `<source media>`와 `<img sizes>` 동시 사용 | 의도와 다르게 동작 | art direction이면 picture만, resolution switching이면 img+srcset만 |
| 15 | deprecated `image:caption`·`image:title` sitemap 태그 사용 | Google 무시 (오류는 아님) | 제거. 캡션은 HTML `<figcaption>`으로 |
| 16 | Next.js 16에서 `priority` 계속 사용 | deprecated 경고 | `preload` 또는 `loading="eager"` + `fetchPriority="high"` |
| 17 | Below-the-fold 이미지를 `loading="eager"` | 초기 네트워크 경합 | lazy로 |
| 18 | 다른 도메인 CDN 이미지를 sitemap에 넣지 않음 | 색인 누락 가능 | 양쪽 도메인 Search Console verified 후 sitemap 등록 |

---

## 13. 빠른 점검 체크리스트

새 이미지 추가 시 확인:

- [ ] 파일명이 의미 있는 키워드 형태인가 (`product-name-color.jpg`)
- [ ] alt text가 5W1H 중심으로 80~140자 작성되었는가
- [ ] alt에 "image of"·"사진" 같은 중복 단어가 없는가
- [ ] `width`/`height` 속성이 있는가 (CLS 0)
- [ ] LCP 이미지인가? → `loading="lazy"` 금지, `fetchpriority="high"`
- [ ] LCP 아닌가? → `loading="lazy"` + `decoding="async"`
- [ ] `srcset` + `sizes`로 반응형 처리되었는가
- [ ] AVIF/WebP 폴백이 `<picture>` 또는 CDN으로 제공되는가
- [ ] 이미지 sitemap에 등록되었는가 (특히 JS 삽입 이미지)
- [ ] 이미지 내부에 텍스트가 박혀있지 않은가
- [ ] `<figcaption>` 또는 주변 본문에 컨텍스트가 충분한가
- [ ] Next.js 16+면 `priority` 대신 `preload`/`fetchPriority` 사용했는가

---

## 14. 관련 스킬

| 주제 | 스킬 |
|------|------|
| OG/소셜 이미지 (동적 생성·크기·검증) | [[og-image-generation]] |
| LCP·CWV 심화 진단 | [[core-web-vitals-optimization]] |
| schema.org ImageObject·Product.image | [[schema-org-patterns]] |
| WCAG 1.1.1·1.4.5 a11y 체크 | [[wcag-2.2-checklist]] |
| Next.js 통합 SEO | [[seo-nextjs]] |
| 정적 HTML SEO | [[seo-static-html]] |
| GEO / AI 검색 가시성 | [[geo-ai-discoverability]] |
