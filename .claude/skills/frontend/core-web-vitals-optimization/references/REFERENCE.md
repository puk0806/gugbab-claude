## 5. 공통 안티패턴

| 안티패턴 | 왜 나쁜가 | 대안 |
|----------|-----------|------|
| LCP 이미지에 `loading="lazy"` | LCP를 직접 악화 — 늦게 발견됨 | `loading="eager"` + `fetchpriority="high"` |
| 모든 이미지에 `fetchpriority="high"` | "우선순위" 의미 상실, 오히려 LCP 400~1200ms 지연 | LCP 1장만 high. 나머지는 기본값 |
| 큰 base64 이미지 inline | HTML/CSS 폭증 → TTFB·LCP 동시 악화 | 외부 파일 + CDN |
| JS로 폰트 동적 로드 | 폰트 swap이 늦어져 CLS 트리거 | `<link rel="preload" as="font">` + `font-display: swap` |
| Lighthouse 점수만 보기 | 단일 시뮬레이션 = 실제 사용자 대표 X | CrUX(field data) 우선, Lighthouse는 회귀 감지 보조 |
| `priority` (Next.js 16+) | deprecated | `preload` prop |
| `width: 100%`만 있고 `height` 없음 | reflow → CLS | `aspect-ratio` 추가 |
| 외부 광고 슬롯에 reserved space 없음 | 광고 로드 시 큰 shift | `min-height` 또는 `aspect-ratio` |

---

## 6. 프레임워크별 빠른 가이드

### 6.1 Next.js (App Router, 16+)

```tsx
import Image from 'next/image';
import { Pretendard } from 'next/font/local';

const pretendard = Pretendard({
  src: './Pretendard.woff2',
  display: 'swap',
  preload: true,
});

export default function Page() {
  return (
    <main className={pretendard.className}>
      <Image
        src="/hero.avif"
        width={1200}
        height={675}
        preload                  // Next.js 16+
        fetchPriority="high"
        alt="hero"
      />
    </main>
  );
}
```

- `next/font`: 자동 self-host + CLS 0 (메트릭 자동 매칭)
- `next/image`: 자동 srcset/sizes + AVIF/WebP 변환
- `loading.tsx`: Suspense fallback 자리 예약
- Server Components 기본 = JS 번들 축소 → INP 개선

### 6.2 Vite + React

```tsx
// 수동으로 fetchpriority + srcset
<img
  src="/hero.avif"
  srcSet="/hero-800.avif 800w, /hero-1600.avif 1600w"
  sizes="100vw"
  width={1200}
  height={675}
  loading="eager"
  fetchPriority="high"
  alt="hero"
/>
```

- 이미지 최적화 플러그인: `vite-plugin-image-optimizer` (sharp 기반)
- 폰트: 직접 `@font-face` + preload
- 코드 스플리팅: `React.lazy` + Suspense

### 6.3 Astro

```astro
---
import { Image } from 'astro:assets';
import hero from '../assets/hero.jpg';
---
<Image src={hero} alt="hero" loading="eager" />
```

- `astro:assets`: 자동 priority hint + 최적화
- island 아키텍처 = JS 최소 → INP 자연스럽게 Good

---

## 7. 측정·관찰 (다른 스킬에 위임)

이 스킬은 *진단·처방*에 집중. 측정은 아래 스킬에 위임한다.

| 작업 | 스킬 |
|------|------|
| 빌드 시 lab 측정 (Lighthouse CI) | `lighthouse-ci-setup` |
| 실사용자 RUM 수집 | `web-vitals-rum-comparison` |
| 빌드 성능 회귀 감지 | `build-perf-benchmarker` |

**최소 RUM 셋업 (web-vitals npm):**

```typescript
import { onLCP, onINP, onCLS } from 'web-vitals';

function send(metric) {
  const body = JSON.stringify(metric);
  // sendBeacon 우선, fallback fetch keepalive
  (navigator.sendBeacon && navigator.sendBeacon('/rum', body)) ||
    fetch('/rum', { body, method: 'POST', keepalive: true });
}

onLCP(send);
onINP(send);
onCLS(send);
```

> attribution build (`web-vitals/attribution`)를 쓰면 *어떤 요소가 LCP인지*, *어떤 이벤트가 INP 원인인지*까지 알 수 있어 디버깅이 훨씬 빠르다.

---

## 8. 개선 우선순위 결정 트리

```
1. CrUX 확인 → 세 지표 중 가장 빨간 것부터
2. 같은 지표여도 모바일/데스크톱 분리해서 보기 (보통 모바일이 더 나쁨)
3. 통상 영향력: LCP > CLS > INP (체감 기준)
   단, 인터랙션 많은 SPA·대시보드는 INP가 최우선
4. "한 번 수정으로 여러 지표" 패턴 우선:
   - 이미지 치수 + AVIF + fetchpriority → LCP + CLS 동시 개선
   - 외부 스크립트 Partytown → INP + LCP 동시 개선 (TBT 감소)
   - Critical CSS inline → LCP + CLS 동시 개선
5. 수정 후 반드시 CrUX 28일 추이로 재확인. Lab만 보면 안 됨.
```

---

## 9. 체크리스트 — PR 머지 전 확인

- [ ] LCP 이미지 1장에만 `fetchpriority="high"` + `loading="eager"`
- [ ] 모든 `<img>`에 `width`/`height` 또는 `aspect-ratio`
- [ ] 외부 광고/embed 슬롯에 `min-height` 또는 `aspect-ratio`
- [ ] 폰트 `font-display: swap` + `size-adjust` 메트릭 매칭
- [ ] 애니메이션은 `transform`/`opacity`만
- [ ] 외부 스크립트 `async`/`defer` 또는 Partytown
- [ ] 무거운 React state 업데이트는 `startTransition`/`useDeferredValue`
- [ ] long task는 `scheduler.yield`/`setTimeout(0)`로 분할
- [ ] Next.js 16+는 `preload` prop (legacy `priority` 제거)
- [ ] CrUX 28일 추이 확인 (Lighthouse 점수만 보지 않기)
