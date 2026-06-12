---
name: core-web-vitals-optimization
description: >
  LCP / INP / CLS 각 지표별 흔한 원인과 수정 패턴 카탈로그.
  측정·해석 도구가 발견한 문제를 실제 코드 수준에서 진단·처방한다.
  <example>사용자: "LCP가 4.2초 나오는데 어디부터 봐야 해?"</example>
  <example>사용자: "INP 450ms 걸리는데 React 18 어떤 API 써야 해?"</example>
  <example>사용자: "이미지 width/height 없으면 CLS 얼마나 영향 줘?"</example>
---

# Core Web Vitals 최적화 — 지표별 진단·처방 카탈로그

> 소스:
> - [web.dev — Core Web Vitals](https://web.dev/articles/vitals)
> - [web.dev — Optimize LCP](https://web.dev/articles/optimize-lcp)
> - [web.dev — Optimize INP](https://web.dev/articles/optimize-inp)
> - [web.dev — Optimize CLS](https://web.dev/articles/optimize-cls)
> - [web.dev — INP](https://web.dev/articles/inp)
> - [web.dev — Fetch Priority](https://web.dev/articles/fetch-priority)
> - [web.dev — Lab vs Field](https://web.dev/articles/lab-and-field-data-differences)
> - [Next.js Image](https://nextjs.org/docs/app/api-reference/components/image)
> - [web-vitals npm](https://github.com/GoogleChrome/web-vitals)
> - [Partytown](https://partytown.builder.io/)
>
> 검증일: 2026-06-02

---

## 1. Core Web Vitals 2026 현황

### 1.1 세 지표와 임계값

| 지표 | 측정 대상 | Good | Needs Improvement | Poor |
|------|-----------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | 로딩 속도 — 가장 큰 콘텐츠 요소 렌더 시점 | ≤ 2.5s | 2.5–4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | 상호작용 응답성 — 클릭/탭/키 입력 후 다음 프레임까지 | ≤ 200ms | 200–500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | 시각적 안정성 — 가장 큰 session window의 누적 시프트 | ≤ 0.10 | 0.10–0.25 | > 0.25 |

- 임계값 기준: 페이지 로드의 **75퍼센타일** (모바일·데스크톱 분리 평가)
- "Good" 판정 조건: LCP·INP·CLS 세 지표 *모두* 75퍼센타일에서 Good

### 1.2 INP는 FID를 대체함 (2024-03-12)

- **2024-03-12**: INP가 FID를 공식 대체하고 Core Web Vital로 승격
- FID는 첫 입력의 *delay*만 측정. INP는 페이지 라이프 동안 *모든* 상호작용의 input delay + processing + presentation delay까지 포함
- 신규 코드에서 FID 관련 API/메트릭 신규 도입 금지

### 1.3 Field data vs Lab data — 절대 혼동 금지

| 종류 | 출처 | 본질 | 활용 |
|------|------|------|------|
| **Field data** | CrUX (Chrome User Experience Report) — 실제 사용자 28일 데이터 | 실제 사용자 75퍼센타일 — Google이 검색 순위에 반영하는 값 | **이것이 본 점수** |
| **Lab data** | Lighthouse — 단일 시뮬레이션 환경 | 디버깅·CI 회귀 감지용 | 보조 지표 |

> **주의:** Lighthouse 점수 90+여도 CrUX가 Poor일 수 있다. 실제 사용자가 시뮬레이션보다 느린 기기·네트워크를 쓰기 때문. **우선순위 결정은 CrUX부터.**

---

## 2. LCP — 흔한 원인과 수정 패턴

### 2.1 LCP 4단계 분해

LCP 시간은 다음 4구간의 합. 어디서 새는지 파악 후 처방.

| 구간 | 비중 (보통) | 의미 |
|------|------------|------|
| TTFB (Time to First Byte) | ~40% | 서버 응답 + 리다이렉트 + DNS |
| Resource Load Delay | < 10% | LCP 리소스가 발견되기까지 |
| Resource Load Duration | ~40% | LCP 리소스 다운로드 시간 |
| Element Render Delay | < 10% | 다운로드 완료 후 렌더링까지 |

### 2.2 흔한 원인 → 처방 매핑

| 원인 | 증상 | 처방 |
|------|------|------|
| LCP 이미지에 `loading="lazy"` | Resource Load Delay 폭증 | `loading="eager"` + `fetchpriority="high"` |
| LCP 이미지가 JS로 동적 삽입 | 브라우저가 preload scanner로 못 잡음 | `<link rel="preload" as="image">` 또는 SSR로 HTML에 박기 |
| 큰 이미지 (수 MB) | Resource Load Duration 폭증 | AVIF/WebP + `srcset`/`sizes` + 이미지 CDN |
| Render-blocking CSS | Element Render Delay 폭증 | Critical CSS inline + 비주요 CSS `media`/`onload` defer |
| 웹폰트 FOIT | LCP가 텍스트일 때 폰트 로드 대기 | `font-display: swap` + `preload` + subset |
| 느린 TTFB | TTFB 자체가 1초+ | CDN, 서버 사이드 캐시, edge runtime |
| SPA에서 LCP 요소가 hydration 후 등장 | Render Delay 폭증 | SSR/SSG 또는 LCP 요소만 critical path로 |

### 2.3 코드 패턴

**HTML — LCP 이미지 명시:**

```html
<!-- 안티패턴: LCP에 lazy -->
<img src="/hero.jpg" loading="lazy" alt="..." />

<!-- 권장: LCP는 eager + fetchpriority high + 명시 치수 -->
<img
  src="/hero.avif"
  srcset="/hero-800.avif 800w, /hero-1600.avif 1600w"
  sizes="(max-width: 768px) 100vw, 1200px"
  width="1200"
  height="675"
  loading="eager"
  fetchpriority="high"
  alt="..."
/>
```

> `fetchpriority` 브라우저 지원: Chrome 102+, Edge 102+, Safari 17.2+, Firefox 132+. 2026년 기준 안전하게 production 사용 가능.

**HTML — late-discovered LCP는 preload:**

```html
<head>
  <!-- CSS background image나 JS-injected img처럼 preload scanner가 못 잡는 경우 -->
  <link
    rel="preload"
    as="image"
    href="/hero.avif"
    imagesrcset="/hero-800.avif 800w, /hero-1600.avif 1600w"
    imagesizes="(max-width: 768px) 100vw, 1200px"
    fetchpriority="high"
  />
</head>
```

**Next.js 16 — `priority` deprecated → `preload`:**

```tsx
// Next.js 15 이하 (legacy)
<Image src="/hero.jpg" width={1200} height={675} priority alt="..." />

// Next.js 16+ — priority deprecated, preload 사용
<Image
  src="/hero.jpg"
  width={1200}
  height={675}
  preload                       // ← 단일 LCP 이미지에만
  fetchPriority="high"
  alt="..."
/>
```

> **주의:** Next.js 16에서 `priority` prop은 deprecated. `preload` prop으로 대체됨. `priority`는 당분간 동작하지만 신규 코드는 `preload` 사용.

> **단일 LCP 원칙:** 한 페이지에 `preload`/`priority`/`fetchpriority="high"`는 **단 1개**의 이미지에만 부여. 여러 개에 부여하면 우선순위 의미가 사라져 LCP가 오히려 악화된다 (벤치마크상 400~1200ms 지연).

**CSS — Critical CSS inline + 비주요 defer:**

```html
<head>
  <style>/* above-the-fold 최소 CSS 인라인 */</style>
  <link
    rel="stylesheet"
    href="/full.css"
    media="print"
    onload="this.media='all'"
  />
</head>
```

**폰트 — swap + preload + subset:**

```html
<link
  rel="preload"
  as="font"
  href="/fonts/Pretendard-subset.woff2"
  type="font/woff2"
  crossorigin
/>
<style>
  @font-face {
    font-family: 'Pretendard';
    src: url('/fonts/Pretendard-subset.woff2') format('woff2');
    font-display: swap;          /* FOIT 방지 */
  }
</style>
```

> 한국 사용자 환경 팁: 한글 폰트는 unicode-range로 자주 쓰는 KS X 1001 기본 한자·한글 범위만 subset하면 파일이 100KB대로 줄어 LCP가 텍스트인 페이지에서 큰 효과.

---

## 3. INP — 흔한 원인과 수정 패턴

### 3.1 INP가 측정하는 것 / 안 하는 것

| 측정함 | 측정 안 함 |
|--------|-----------|
| click (마우스) | hover |
| tap (터치) | scroll |
| keydown / keyup (물리·온스크린 키보드) | zoom |

INP는 input delay + processing + presentation delay 세 구간의 합. 그중 *가장 느린* 상호작용이 페이지 INP가 된다.

### 3.2 흔한 원인 → 처방 매핑

| 원인 | 증상 | 처방 |
|------|------|------|
| Long task (> 50ms) | Processing 구간 폭증 | yielding (`scheduler.yield`, `setTimeout(fn,0)`) |
| 무거운 React re-render | 큰 state 업데이트가 동기 렌더 트리거 | `startTransition`, `useDeferredValue` |
| 이벤트 핸들러 내부 동기 계산 | 핸들러 자체가 100ms+ | Web Worker로 이동 |
| 외부 스크립트 (analytics, ad) | 메인 스레드 점유 | `async`/`defer` + Partytown |
| Layout thrashing | DOM read·write 인터리브 | read 모음 → write 모음 분리 |
| 거대 DOM | Presentation delay (스타일·레이아웃 계산) | virtualization (react-virtuoso 등) |

### 3.3 코드 패턴

**TypeScript — long task 쪼개기 (`scheduler.yield`):**

```typescript
// 안티패턴: 1000개 아이템 동기 처리
function processAll(items: Item[]) {
  for (const item of items) heavyWork(item);  // 메인 스레드 500ms 점유
}

// 권장: scheduler.yield로 양보 (Chrome 129+ 안정화, fallback 포함)
async function processAll(items: Item[]) {
  for (const item of items) {
    heavyWork(item);
    if ('scheduler' in window && 'yield' in (window as any).scheduler) {
      await (window as any).scheduler.yield();
    } else {
      // fallback — setTimeout으로 task queue 끝으로
      await new Promise((r) => setTimeout(r, 0));
    }
  }
}
```

> **주의:** `scheduler.yield()`는 Chrome 129부터 stable. 다른 브라우저는 미지원이므로 항상 fallback 패턴 필수. `scheduler.postTask()`는 Chrome 94+ 지원.

**React 18+ — `startTransition`:**

```tsx
import { startTransition, useState } from 'react';

function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Item[]>([]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);                                  // urgent: 입력값 즉시 반영
    startTransition(() => {
      setResults(expensiveFilter(value));             // non-urgent: 결과 리스트
    });
  }

  return <input value={query} onChange={onChange} />;
}
```

> **언제:** state 업데이트가 *무거운 리렌더*를 트리거할 때. 입력 응답성을 위해 결과 렌더만 deferred.

**React 18+ — `useDeferredValue`:**

```tsx
import { useDeferredValue, useState } from 'react';

function ProductList({ filter }: { filter: string }) {
  const deferred = useDeferredValue(filter);
  // deferred는 filter 변경이 끝난 뒤에야 새 값으로 평가됨
  const items = useMemo(() => slowFilter(deferred), [deferred]);
  return <List items={items} />;
}
```

> `startTransition`은 *상태 업데이트*를 감싸고, `useDeferredValue`는 *값*을 감싼다. props로 받은 값을 deferred화할 때 유용.

**Web Worker — 무거운 계산 분리:**

```typescript
// worker.ts
self.onmessage = (e: MessageEvent<number[]>) => {
  const result = heavyAggregation(e.data);
  self.postMessage(result);
};

// 컴포넌트
const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
worker.postMessage(largeArray);
worker.onmessage = (e) => setResult(e.data);
```

**외부 스크립트 — Partytown으로 worker 이동:**

```html
<!-- 안티패턴: GTM이 메인 스레드 점유 -->
<script src="https://www.googletagmanager.com/gtm.js?id=..." async></script>

<!-- 권장: Partytown으로 web worker 이동 -->
<script type="text/partytown" src="https://www.googletagmanager.com/gtm.js?id=..."></script>
```

> **한국 사용자 환경 팁:** Naver Wcs, Kakao Pixel, Google Tag Manager, Meta Pixel 같은 외부 스크립트는 INP의 단일 최대 원인. Partytown 적용 시 TBT 60~80% 감소 사례 다수. 단 `document.write()` 쓰는 스크립트(일부 광고 SDK)는 비호환.

**이벤트 핸들러 — debounce/throttle:**

```typescript
// 입력마다 검색 요청 → 메인 스레드 점유
function onInput(e) { search(e.target.value); }

// 권장: debounce
import { debounce } from 'es-toolkit';
const debouncedSearch = debounce((v: string) => search(v), 200);
function onInput(e) { debouncedSearch(e.target.value); }
```

---

## 4. CLS — 흔한 원인과 수정 패턴

### 4.1 Session window 계산 방식

CLS = 페이지 라이프 동안 발생한 모든 *session window* 중 가장 큰 것의 합.

- **Session window 정의**: 연속된 layout shift들의 그룹
- **연속 조건**: shift 간 간격 < 1초, 윈도우 총 길이 ≤ 5초
- 모든 시프트의 합산이 아니라 *가장 나쁜 1초 묶음*만 카운트. 따라서 *시각적으로 거슬리는 burst*를 잡는 게 핵심.

### 4.2 흔한 원인 → 처방 매핑

| 원인 | 증상 | 처방 |
|------|------|------|
| `<img>` width/height 없음 | 이미지 로드 시 reflow | `width`/`height` 속성 명시 또는 `aspect-ratio` CSS |
| 광고/embed iframe 사이즈 미고정 | 외부 로드 시 reflow | `min-height` / `aspect-ratio`로 자리 예약 |
| 웹폰트 FOUT/FOIT | 폰트 swap 시 글자 폭 변화 | `size-adjust`, `ascent-override`로 메트릭 매칭 |
| 동적 콘텐츠 삽입 (배너, 알림) | 콘텐츠 위에 삽입되어 밀어냄 | 사용자 인터랙션 후에만 삽입, 또는 viewport 하단 배치 |
| top/left 애니메이션 | layout 트리거 | `transform`/`opacity`만 사용 (composite-only) |
| 늦은 CSS 적용 | 스타일 적용 시 reflow | Critical CSS inline |

### 4.3 코드 패턴

**HTML — 이미지 치수 명시:**

```html
<!-- 안티패턴: width/height 없음 → 로드 후 reflow -->
<img src="/photo.jpg" alt="..." />

<!-- 권장: 치수 명시 → 브라우저가 aspect-ratio로 자리 예약 -->
<img src="/photo.jpg" width="800" height="600" alt="..." />
```

> `width="800" height="600"` 같은 *내재 치수*만 박아도 브라우저가 `aspect-ratio: 800 / 600`을 자동 계산. CSS로 `width: 100%`해도 비율은 유지.

**CSS — `aspect-ratio`로 자리 예약:**

```css
.video-embed {
  aspect-ratio: 16 / 9;
  width: 100%;
}

.ad-slot {
  min-height: 250px;     /* 광고 로드 전 자리 예약 */
  width: 300px;
}
```

**CSS — 폰트 메트릭 매칭으로 swap CLS 제거:**

```css
@font-face {
  font-family: 'Pretendard';
  src: url('/fonts/Pretendard.woff2') format('woff2');
  font-display: swap;
  size-adjust: 100%;            /* 글자 크기 보정 */
  ascent-override: 90%;         /* baseline 보정 */
  descent-override: 20%;
}

body {
  font-family: 'Pretendard', system-ui, sans-serif;
}
```

> `size-adjust`/`ascent-override`/`descent-override`는 fallback 폰트와 web 폰트의 *메트릭*을 강제로 일치시켜 swap 시 reflow를 0에 가깝게 만든다.

**CSS — 애니메이션은 composite-only로:**

```css
/* 안티패턴: top 변경 → layout 매번 재계산 */
.modal { transition: top 0.3s; }
.modal.open { top: 50%; }

/* 권장: transform → composite layer만 */
.modal { transition: transform 0.3s; transform: translateY(100%); }
.modal.open { transform: translateY(0); }
```

> 안전한 composite-only 속성: `transform`, `opacity`, `filter` (일부). `width`/`height`/`top`/`left`/`margin` 등은 layout 트리거.

**React/Next.js — skeleton으로 자리 예약:**

```tsx
// Next.js loading.tsx — 동적 콘텐츠 자리 예약
export default function Loading() {
  return (
    <div style={{ aspectRatio: '16/9', minHeight: 400 }}>
      <SkeletonHero />
    </div>
  );
}
```

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
