---
name: font-optimization
description: 웹폰트 로딩 전략·CLS 감소·CJK(한국어) 서브셋·variable font·next/font 등 폰트 최적화 통합 카탈로그. font-display, size-adjust, preload, system font stack, Pretendard·Noto Sans KR 비교까지 한곳에 정리.
---

# 폰트 최적화 (Font Optimization)

> 소스:
> - web.dev — Best practices for fonts: https://web.dev/articles/font-best-practices
> - web.dev — CSS size-adjust: https://web.dev/articles/css-size-adjust
> - web.dev — Optimize web fonts (Learn Performance): https://web.dev/learn/performance/optimize-web-fonts
> - web.dev — Preload web fonts: https://web.dev/articles/codelab-preload-web-fonts
> - MDN — `@font-face/font-display`: https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display
> - MDN — Variable fonts guide: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fonts/Variable_fonts_guide
> - Next.js — Font Optimization (App Router): https://nextjs.org/docs/app/getting-started/fonts
> - Pretendard GitHub: https://github.com/orioncactus/pretendard
> - Noto CJK GitHub: https://github.com/notofonts/noto-cjk
> - Google Fonts — Noto Sans Korean: https://fonts.google.com/noto/specimen/Noto+Sans+KR
> 검증일: 2026-06-03

CLS·LCP에 직결되는 *폰트 로딩 동작*과 한국어(CJK) 환경 특수 사항을 분리해 정리한 카탈로그. LCP·CLS 자체 지표는 [[core-web-vitals-optimization]]에 위임한다.

---

## 1. FOIT vs FOUT — 트레이드오프 이해

웹폰트가 도착하기 전에 브라우저가 텍스트를 어떻게 표시할지는 두 선택지로 환원된다.

| 약자 | 풀네임 | 동작 | 주요 부작용 |
|------|--------|------|-------------|
| **FOIT** | Flash of Invisible Text | 폰트 로드 전까지 텍스트를 *투명하게* 렌더 | 초기 콘텐츠 인지 지연 (LCP 악화 가능) |
| **FOUT** | Flash of Unstyled Text | 폰트 로드 전 *fallback 폰트*로 즉시 렌더 후 교체 | 교체 시 메트릭 차이로 레이아웃 점프 (CLS 악화 가능) |

선택 기준:

- **콘텐츠 우선·접근성** → FOUT (`font-display: swap`이 가장 안전한 기본값)
- **브랜드 시각 일관성 최우선** → FOIT (`font-display: block`, 짧은 차단)
- **둘 다 싫음** → `font-display: optional` + `size-adjust`로 fallback 메트릭 매칭하여 *교체 자체를 거의 안 보이게* 만든다 (가장 권장되는 모던 패턴)

---

## 2. `font-display` 값 4종 비교

| 값 | block period | swap period | 사용 권장 |
|----|--------------|-------------|-----------|
| `block` | 짧음 (보통 3s) | 무한 | 브랜드 폰트 등 시각 필수, 차단 감수 |
| `swap` | 극히 짧음 (~100ms) | 무한 | 일반 본문·헤딩의 *안전한 기본값* |
| `fallback` | 극히 짧음 | 짧음 (~3s) | 폰트가 늦으면 *영원히 fallback*으로 확정 |
| `optional` | 극히 짧음 | 없음 (~100ms 안에 도착해야만 사용) | CLS 0 추구, 폰트는 *선택사항* |

> 주의: `auto`는 브라우저가 결정하며 대개 `block`처럼 동작한다. 명시 누락은 사실상 `block` → FOIT 유발이라 *항상 명시*한다.

```css
@font-face {
  font-family: "Pretendard";
  src: url("/fonts/PretendardVariable.woff2") format("woff2-variations");
  font-weight: 45 920;
  font-style: normal;
  font-display: swap; /* 본문 → swap, 데코 → optional, 브랜드 → block */
}
```

### 어떤 값을 언제 쓰나

- **본문·헤딩 (대부분의 경우)** → `swap` + `size-adjust`로 CLS 보정
- **로고·브랜드 타이틀** → `block` (1초 정도 안 보이는 것보단 잘못된 폰트로 보이는 게 더 큰 손실)
- **아이콘 폰트, 장식 폰트** → `optional` (못 받으면 그냥 fallback 유지)
- **2순위 폰트** (서브 영역) → `fallback`

---

## 3. `size-adjust` + 메트릭 오버라이드 — CLS 보정의 핵심

FOUT(`swap`/`optional`)에서 fallback 폰트와 웹폰트의 글리프 박스가 다르면 교체 순간 행 높이·줄 수가 바뀌어 *CLS*가 발생한다. 이걸 0에 가깝게 만드는 4개 디스크립터:

| 디스크립터 | 의미 | 단위 |
|------------|------|------|
| `size-adjust` | 글리프 전체 폭·높이를 비율 스케일 | % (기본 100%) |
| `ascent-override` | baseline 위 높이 강제 | % of em |
| `descent-override` | baseline 아래 깊이 강제 | % of em |
| `line-gap-override` | 줄 간격 강제 | % of em |

브라우저 지원: Chromium 87+, Firefox 89+, Safari 17+ (현재 모든 evergreen 브라우저).

### 패턴 — Pretendard에 맞춘 fallback "Pretendard-fallback"

웹폰트가 도착하기 전까지는 시스템 폰트를 *Pretendard 메트릭에 맞게 보정*해서 렌더한다.

```css
/* 1) 실제 웹폰트 */
@font-face {
  font-family: "Pretendard";
  src: url("/fonts/PretendardVariable.woff2") format("woff2-variations");
  font-weight: 45 920;
  font-display: swap;
}

/* 2) 메트릭 오버라이드된 fallback (시스템 폰트를 Pretendard처럼 보이게) */
@font-face {
  font-family: "Pretendard-fallback";
  src: local("Apple SD Gothic Neo"), local("Malgun Gothic");
  size-adjust: 99.5%;       /* 측정값으로 교체 */
  ascent-override: 92%;
  descent-override: 23%;
  line-gap-override: 0%;
}

body {
  font-family: "Pretendard", "Pretendard-fallback", system-ui, sans-serif;
}
```

> 주의: 위 수치는 *예시*다. 실제 값은 Pretendard와 사용 fallback의 메트릭을 측정해서 계산해야 한다. 자동 계산 도구: [Fontaine](https://github.com/unjs/fontaine), [Capsize](https://seek-oss.github.io/capsize/), Next.js의 `adjustFontFallback`(기본 true).

---

## 4. `preload` — *진짜 critical 폰트만*

```html
<link
  rel="preload"
  href="/fonts/PretendardVariable.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

체크포인트:

- `as="font"` + `type="font/woff2"` — 우선순위 결정용
- **`crossorigin` 필수** — 누락 시 브라우저가 preload를 *무시*하거나 *이중 다운로드*함 (폰트는 항상 CORS로 fetch되기 때문). 셀프 호스팅이라도 반드시 붙인다.
- preload 대상은 *LCP 영역에 보이는 1~2개 폰트*만. 모든 weight·style preload는 다른 critical 자원 대역폭을 잡아먹어 *역효과*다.

> 주의: `next/font`는 subsets 옵션의 첫 subset에 한해 preload `<link>`를 *자동* 주입한다. 직접 `<link rel="preload">`를 추가하면 중복된다.

---

## 5. Variable Font — 가변 축으로 weight·width·slant 통합

기존: Regular(.woff2), Medium(.woff2), Bold(.woff2), Italic(.woff2) → 파일 4개 (~200KB)
가변: VariableFont.woff2 1개로 weight 100~900 + italic 축 모두 지원 (~150KB)

```css
@font-face {
  font-family: "Pretendard";
  src: url("/fonts/PretendardVariable.woff2") format("woff2-variations");
  font-weight: 100 900;   /* 범위 지정 */
  font-style: normal;
  font-display: swap;
}

h1 { font-weight: 800; }
p { font-weight: 400; }
.semibold { font-weight: 600; }
/* 가변 축 그대로 사용 가능 — 별도 폰트 import 불필요 */
```

지원 브라우저: Chrome 66+, Edge 17+, Firefox 62+, Safari 11+, Opera 53+ (모든 evergreen).

권장 가변 폰트:
- **Inter** — 영문 UI 표준 (variable)
- **Roboto Flex** — Google, weight/width/optical-size 등 다축
- **Pretendard Variable** — 한국어, weight 45–920 가변
- **Noto Sans KR** — CJK, 정적 9-weight + 가변 둘 다 제공

---

## 6. System Font Stack — 다운로드 0개 전략

폰트를 *아예 다운로드하지 않는다*. 모든 OS에 내장된 시스템 폰트로 즉시 렌더 → LCP·CLS 모두 0 영향.

```css
:root {
  --font-system: -apple-system, BlinkMacSystemFont,
                 "Apple SD Gothic Neo",         /* macOS·iOS 한글 */
                 "Segoe UI",                    /* Windows 영문 */
                 "Malgun Gothic", "맑은 고딕",   /* Windows 한글 */
                 Roboto,                        /* Android */
                 "Noto Sans CJK KR",            /* Linux 한글 */
                 sans-serif;
}

body { font-family: var(--font-system); }
```

- 디자인 시스템 강제력은 떨어지지만 (OS마다 글자가 다름) 성능 절대값은 *어떤 웹폰트 최적화보다 빠르다*.
- 관리자 페이지, 사내 도구, 빠른 프로토타입에 적합.
- 브랜드가 중요한 마케팅 페이지에는 부적합 (Pretendard 같은 디자인 시스템 폰트로 갈 것).

---

## 7. WOFF2 단독 — 폴백 포맷 불필요

```css
/* 권장 — WOFF2 단독 */
@font-face {
  font-family: "Pretendard";
  src: url("/fonts/Pretendard-Regular.woff2") format("woff2");
  font-display: swap;
}

/* 비권장 — 레거시 폴백 */
@font-face {
  font-family: "Pretendard";
  src: url("/fonts/Pretendard-Regular.woff2") format("woff2"),
       url("/fonts/Pretendard-Regular.woff") format("woff"),  /* 불필요 */
       url("/fonts/Pretendard-Regular.ttf") format("truetype"); /* 불필요 */
  font-display: swap;
}
```

- WOFF2: WOFF1 대비 약 30% 추가 압축. IE 외 모든 모던 브라우저 지원 (Chrome 36+, Firefox 39+, Safari 12+, Edge 14+).
- IE11을 지원하지 않는다면 WOFF2 단독으로 충분하다 (web.dev 공식 권장).

---

## 8. CJK 폰트 (한국어) — 파일 크기와 서브셋

영문은 글리프 ~200–300자라 한 파일이 보통 20–50KB 수준. 한국어는 *완성형 11,172자 + 한자 + 자모 결합* 때문에 무압축 시 5–15MB까지 폭증한다.

| 폰트 | 무서브셋 크기 (woff2) | 비고 |
|------|------------------------|------|
| Noto Sans CJK KR (Regular) | ~4 MB | 모든 한자 포함 |
| Pretendard (Regular) | ~1.2 MB | 완성형 한글 + 라틴 (한자 제외) |
| Pretendard Variable | ~1.6 MB | 가변 1파일로 9 weight 대체 |

→ **서브셋팅 없이 그대로 import는 사실상 LCP 폭사**. 다음 둘 중 하나는 반드시 적용한다:

1. `unicode-range`로 다중 `@font-face` 분할 (브라우저가 *사용된 글리프 범위만* 다운로드)
2. `pyftsubset`·`subset-font` 등 빌드 타임 서브셋 생성

---

## 9. 한국어 폰트 카탈로그

| 폰트 | 라이선스 | 가변 | 무게 | 특징 |
|------|----------|------|------|------|
| **Pretendard** | SIL OFL 1.1 | ✅ Pretendard Variable | 9 weight (Thin~Black) | San Francisco·Inter 메트릭 호환, 디자인 시스템 친화. 길형진 제작 |
| **Noto Sans KR** | SIL OFL 1.1 | ✅ Variable 있음 | 9 weight | Google·Adobe·구글 CJK 통합 프로젝트. 한자 완전 지원 |
| **Spoqa Han Sans Neo** | SIL OFL 1.1 | ❌ | 5 weight | 스포카 제작, 본고딕 기반 커스텀 |
| **Nanum Gothic / Square Neo** | SIL OFL 1.1 | ❌ | 4 weight | 네이버 제작, 가독성 검증 다수 |
| **Apple SD Gothic Neo** | Apple 시스템 (배포 불가) | ❌ | Thin~Heavy | macOS/iOS 시스템 폰트, `local()`로만 사용 |
| **Malgun Gothic / 맑은 고딕** | Microsoft 시스템 (배포 불가) | ❌ | Regular/Bold | Windows 시스템 폰트, `local()`로만 |

선택 가이드:

- **디자인 시스템·SaaS UI** → Pretendard Variable (가변 1파일, 라틴 호환성 우수)
- **국문 본문·블로그·뉴스** → Noto Sans KR (한자 필요 시)
- **시스템 폰트 폴백** → Apple SD Gothic Neo + Malgun Gothic + Noto Sans CJK KR

---

## 10. `unicode-range`로 다중 `@font-face` 분할

브라우저는 *페이지에 실제로 사용된 코드포인트가 속한 `@font-face`만* 다운로드한다. Google Fonts CSS가 내부적으로 사용하는 방식.

```css
/* 한글 완성형 (U+AC00-D7A3) */
@font-face {
  font-family: "Pretendard";
  src: url("/fonts/pretendard-korean.woff2") format("woff2");
  unicode-range: U+AC00-D7A3, U+1100-11FF, U+3130-318F;
  font-display: swap;
}

/* 라틴 (영문·숫자·기호) */
@font-face {
  font-family: "Pretendard";
  src: url("/fonts/pretendard-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153;
  font-display: swap;
}

/* 한자 (선택적, 크기 크므로 분리) */
@font-face {
  font-family: "Pretendard";
  src: url("/fonts/pretendard-hanja.woff2") format("woff2");
  unicode-range: U+4E00-9FFF;
  font-display: swap;
}
```

영문만 있는 페이지(예: 영문 랜딩) → 한국어/한자 파일은 다운로드되지 *않는다*.

---

## 11. 빌드 타임 서브셋 도구

### `subset-font` (npm, Node)

```js
// scripts/subset-pretendard.mjs
import fs from "node:fs/promises";
import subsetFont from "subset-font";

const input = await fs.readFile("./fonts/Pretendard-Regular.otf");

// 페이지에서 실제로 쓰이는 문자열만 추출
const text = await fs.readFile("./build/used-chars.txt", "utf8");

const subset = await subsetFont(input, text, { targetFormat: "woff2" });
await fs.writeFile("./public/fonts/Pretendard-Regular.subset.woff2", subset);
```

### `pyftsubset` (Python, fonttools)

```bash
pip install fonttools brotli   # brotli는 woff2 출력에 필수

pyftsubset Pretendard-Regular.otf \
  --output-file=Pretendard-Regular.subset.woff2 \
  --flavor=woff2 \
  --unicodes="U+0000-00FF,U+AC00-D7A3,U+1100-11FF,U+3130-318F" \
  --layout-features='*'
```

### `glyphhanger` (사이트 크롤링 기반)

```bash
npx glyphhanger https://example.com --subset=./fonts/*.ttf --formats=woff2
```

실제 사이트에서 쓰인 글리프만 자동 추출 → 가장 정확한 서브셋.

> 참고: Google Fonts CDN은 `&text=...` 파라미터로 *런타임* 서브셋도 가능 (예: `?family=Noto+Sans+KR&text=홍길동`). 단, GDPR 이슈로 셀프 호스팅이 권장된다 (다음 섹션).

---

## 12. Google Fonts CDN vs Self-host

2022년 1월 Landgericht München I(독일 뮌헨 지방법원)는 *Google Fonts CDN 직접 임베드가 GDPR 위반*이라 판결했다. 이유: 사용자의 IP가 Google에 전달됨.

| 방식 | GDPR | 성능 | 캐시 |
|------|------|------|------|
| Google Fonts CDN `<link href="fonts.googleapis.com">` | ⚠️ 위반 가능 (EU 대상) | DNS·TLS 추가 RTT | 도메인 분리 캐시 |
| Self-host (CDN 우회) | ✅ 안전 | 동일 origin → preconnect 불필요 | 일반 HTTP 캐시 |

권장: 어떤 경우든 *셀프 호스팅*. Next.js의 `next/font/google`은 빌드 시 자동으로 폰트 파일을 다운받아 정적 자산으로 서빙하므로 *runtime에 Google로 요청 자체가 안 나간다*.

---

## 13. `next/font` 패턴 (Next.js 13+)

`next/font`는 빌드 시 폰트를 다운로드·서브셋·자기 호스팅·preload·`adjustFontFallback`(메트릭 매칭)까지 *전부 자동* 처리한다.

### Google Font

```tsx
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: "variable",            // 가변 폰트가 기본 (생략 가능)
  display: "swap",
  variable: "--font-inter",      // CSS 변수로 노출 → Tailwind에서 사용
});

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### Local Font (Pretendard Variable 예시)

```tsx
// app/layout.tsx
import localFont from "next/font/local";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",              // 가변 weight 범위
  variable: "--font-pretendard",
  preload: true,
});

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

```css
/* globals.css */
:root {
  --font-sans: var(--font-pretendard), -apple-system, "Apple SD Gothic Neo",
               "Malgun Gothic", sans-serif;
}
body { font-family: var(--font-sans); }
```

`next/font`가 자동으로 처리하는 것:

- 빌드 타임에 폰트 파일을 `_next/static/media/`로 복사 (런타임 외부 요청 0)
- 첫 subset에 한해 `<link rel="preload">` 자동 주입
- `adjustFontFallback: true`(기본) 시 `size-adjust`·`ascent-override` 등을 *자동 계산*해 fallback 메트릭 매칭 → CLS 0 유도

---

## 14. Core Web Vitals 영향

| 지표 | 폰트가 영향 주는 경로 | 대응 |
|------|------------------------|------|
| **LCP** | LCP 요소가 텍스트면, 폰트 도착 전 텍스트가 안 보이거나 fallback으로 그려짐 | `swap`/`optional` + preload critical font + 작은 파일 (서브셋) |
| **CLS** | 폰트 교체 시점에 행 높이·줄 수가 바뀌면 점프 발생 | `size-adjust` + `ascent/descent-override`로 fallback 메트릭을 웹폰트와 일치 |
| **INP** | 폰트 다운로드가 메인 스레드를 점유하면 인터랙션 반응 지연 | 폰트 파일 분할(unicode-range), `font-display: optional` |

지표 자체 측정·예산은 [[core-web-vitals-optimization]] 카탈로그 참조.

---

## 15. 흔한 실수 패턴

| 실수 | 영향 | 올바른 처리 |
|------|------|-------------|
| `font-display` 미지정 → 기본 `block`처럼 동작 | FOIT → LCP·접근성 악화 | 명시적 `swap` (본문) / `optional` (장식) |
| `preload`에 `crossorigin` 누락 | 폰트 이중 다운로드 또는 preload 무시 | `crossorigin` 필수 (셀프 호스팅이라도) |
| 가변 폰트인데 weight별로 따로 `@font-face` 선언 | 가변 폰트의 의미 상실 | 단일 `@font-face` + `font-weight: 100 900` 범위 |
| Google Fonts CDN을 `<link href="fonts.googleapis.com">`로 직접 임베드 | GDPR 위반 위험(EU) + DNS·TLS RTT | 셀프 호스팅 (next/font 또는 수동 다운로드) |
| CJK 폰트를 서브셋 없이 통째로 import | 4MB+ 다운로드 → LCP 폭사 | `unicode-range` 분할 + 빌드 타임 서브셋 |
| 모든 weight(100~900) import | 사용 안 하는 weight까지 다운로드 | 실제 쓰는 2~3개 weight만 또는 variable font 1파일 |
| 시스템 폰트 폴백에 한국어 폰트 누락 (`'Helvetica', sans-serif`로 끝) | 한글이 OS 기본 폰트(굴림 등)로 렌더 | `Apple SD Gothic Neo`·`Malgun Gothic`·`Noto Sans CJK KR` 명시 |
| `optional` 사용했는데 fallback 메트릭 매칭 안 함 | 폰트가 *영원히 적용 안 됨* (100ms 내 미도착 시) → 디자인 깨짐 | `size-adjust`로 fallback을 웹폰트처럼 보이게 |
| 모든 폰트를 preload | critical 자원 대역폭 잡아먹음 → LCP 악화 | LCP 영역의 critical 1~2개만 |
| Variable font인데 `format("woff2")`만 명시 | 일부 브라우저에서 가변 인식 실패 가능 | `format("woff2-variations")` 사용 (또는 둘 다 OK) |

---

## 16. 권장 기본 세팅 (Next.js + Pretendard Variable, 한국어 우선)

```tsx
// app/layout.tsx
import localFont from "next/font/local";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
  preload: true,
  adjustFontFallback: "Arial",   // fallback 메트릭 자동 매칭
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>{children}</body>
    </html>
  );
}
```

```css
/* app/globals.css */
:root {
  --font-sans:
    var(--font-pretendard),
    -apple-system, BlinkMacSystemFont,
    "Apple SD Gothic Neo",
    "Segoe UI", "Malgun Gothic", "맑은 고딕",
    Roboto, "Noto Sans CJK KR",
    sans-serif;
}

html, body { font-family: var(--font-sans); }
```

이 구성으로 얻는 것:
- WOFF2 가변 단일 파일 (~1.6MB이지만 한 번 받으면 모든 weight 커버)
- `display: swap` + 자동 메트릭 매칭으로 CLS ≈ 0
- 자동 셀프 호스팅으로 GDPR·LCP 둘 다 안전
- 한국어·영문 시스템 폴백 완비

---

## 관련 스킬

- [[core-web-vitals-optimization]] — LCP·CLS·INP 지표·측정·예산
- [[seo-vite-spa]] — Vite/CRA에서 폰트 임베드 패턴
- [[og-image-generation]] — 서버 렌더링 시 CJK 폰트 임베드
