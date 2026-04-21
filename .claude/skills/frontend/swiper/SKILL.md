---
name: swiper
description: Swiper 11.x 슬라이더/캐러셀 — React 컴포넌트 + Swiper Element, 핵심 모듈, 반응형, 성능 최적화, Next.js SSR 패턴
---

# Swiper 11.x 슬라이더/캐러셀

> 소스: https://swiperjs.com/react, https://swiperjs.com/swiper-api, https://swiperjs.com/element, https://swiperjs.com/migration-guide-v11
> 검증일: 2026-04-20
> 버전: Swiper 11.x (최신 안정 11.2.6 기준 — 2025-03-19 릴리즈) / Swiper 12.1.3도 swiper/react 지원 유지

---

## 설치

```bash
npm install swiper
# Swiper 11 고정이 필요한 경우:
npm install swiper@11
```

---

## 방식 선택 기준: React 컴포넌트 vs Swiper Element

| 기준 | `swiper/react` | Swiper Element (Web Component) |
|------|---------------|-------------------------------|
| React 친화성 | 높음 — JSX props로 바로 설정 | 낮음 — `Object.assign` + `initialize()` |
| TypeScript | 자연스러운 타입 추론 | 별도 JSX 타입 선언 필요 |
| 공식 권장 | React 프로젝트에 적합 | 프레임워크 독립 프로젝트에 적합 |
| SSR | `'use client'` 추가로 해결 | 동일 |
| React 19 지원 | 지원 | 지원 |

> 주의: Swiper Element가 "미래 권장 방식"으로 소개되었으나, Swiper 12.x 기준 `swiper/react`는 계속 유지·제공됩니다. React 프로젝트에서는 `swiper/react` 사용을 권장합니다.

---

## 방식 1: React 컴포넌트 (swiper/react)

### 기본 설정

```tsx
'use client'; // Next.js App Router 필수

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// 핵심 CSS + 사용하는 모듈별 CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function HeroSlider() {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={20}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      loop
    >
      <SwiperSlide>
        <img src="/slide1.jpg" alt="Slide 1" />
      </SwiperSlide>
      <SwiperSlide>
        <img src="/slide2.jpg" alt="Slide 2" />
      </SwiperSlide>
    </Swiper>
  );
}
```

### 핵심 모듈 import

```tsx
import {
  Navigation,       // 좌우 화살표
  Pagination,       // 페이지 도트
  Autoplay,         // 자동 재생
  EffectFade,       // 페이드 효과
  EffectCoverflow,  // 커버플로우 효과
  Thumbs,           // 썸네일 연동
  FreeMode,         // 자유 스크롤
  Virtual,          // 가상 슬라이드 (대량 슬라이드)
  Keyboard,         // 키보드 제어
  Mousewheel,       // 마우스휠 제어
  A11y,             // 접근성
} from 'swiper/modules';

// 사용하는 모듈의 CSS만 import (bundle 대신 개별 import로 번들 최적화)
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-coverflow';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

// 또는 모든 모듈 CSS 한 번에 (간편하지만 번들 크기 증가)
// import 'swiper/css/bundle';
```

### TypeScript 타입 패턴

```tsx
// SwiperRef: Swiper 컴포넌트의 ref 타입 (HTMLElement 확장)
// SwiperClass: Swiper 인스턴스 타입 (onSwiper 콜백에서 받는 객체)
import { Swiper, SwiperSlide } from 'swiper/react';
import type { SwiperRef, SwiperClass } from 'swiper/react';
import type { SwiperOptions } from 'swiper/types';

// 패턴 1: ref로 DOM 노드를 통해 인스턴스 접근
const swiperRef = useRef<SwiperRef>(null);
// swiperRef.current?.swiper.slideNext()

// 패턴 2: onSwiper 콜백으로 인스턴스 직접 보관 (권장)
const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);

<Swiper
  ref={swiperRef}
  onSwiper={setSwiperInstance}
>
  {/* ... */}
</Swiper>

// 외부에서 메서드 호출
swiperInstance?.slideNext();
swiperInstance?.slideTo(2);
swiperInstance?.autoplay.start();
swiperInstance?.autoplay.stop();

// SwiperOptions로 옵션 객체 타입 지정
const swiperOptions: SwiperOptions = {
  slidesPerView: 3,
  spaceBetween: 20,
  loop: true,
};
```

### 이벤트 핸들링

```tsx
// 모든 Swiper 이벤트는 on{EventName} 형식의 prop으로 전달
<Swiper
  onSwiper={(swiper) => setSwiperInstance(swiper)}
  onSlideChange={(swiper) => {
    console.log('active index:', swiper.activeIndex);
  }}
  onSlideChangeTransitionEnd={(swiper) => {
    // 트랜지션 완료 후 처리
  }}
  onReachEnd={() => {
    // 마지막 슬라이드 도달 — 추가 데이터 로드 등
  }}
  onTouchStart={(swiper, event) => {
    // 터치/마우스 드래그 시작
  }}
  onTouchEnd={(swiper, event) => {
    // 터치/마우스 드래그 종료
  }}
  onProgress={(swiper, progress) => {
    // progress: 0(처음) ~ 1(끝)
  }}
>
```

### useSwiper / useSwiperSlide 훅

```tsx
import { useSwiper, useSwiperSlide } from 'swiper/react';

// Swiper 내부 컴포넌트에서 인스턴스 접근
function SlideNavButton() {
  const swiper = useSwiper();
  return <button onClick={() => swiper.slideNext()}>Next</button>;
}

// 슬라이드 상태 접근
function SlideContent() {
  const slideData = useSwiperSlide();
  // slideData.isActive, slideData.isPrev, slideData.isNext, slideData.isVisible
  return <div className={slideData.isActive ? 'active' : ''}>...</div>;
}
```

### 반응형 breakpoints

```tsx
// breakpoints의 key는 뷰포트 너비(px) 이상일 때 적용 (min-width 방식)
<Swiper
  slidesPerView={1}
  spaceBetween={10}
  breakpoints={{
    640: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    768: {
      slidesPerView: 3,
      spaceBetween: 30,
    },
    1024: {
      slidesPerView: 4,
      spaceBetween: 40,
    },
  }}
>
```

### 커스텀 네비게이션

```tsx
import { useRef, useState } from 'react';
import type { SwiperClass } from 'swiper/react';

function CustomNavSlider() {
  const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  return (
    <div className="slider-wrapper">
      <Swiper
        onSwiper={setSwiperInstance}
        onSlideChange={(swiper) => {
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
      >
        <SwiperSlide>Slide 1</SwiperSlide>
        <SwiperSlide>Slide 2</SwiperSlide>
        <SwiperSlide>Slide 3</SwiperSlide>
      </Swiper>

      <button
        onClick={() => swiperInstance?.slidePrev()}
        disabled={isBeginning}
        aria-label="이전 슬라이드"
      >
        Prev
      </button>
      <button
        onClick={() => swiperInstance?.slideNext()}
        disabled={isEnd}
        aria-label="다음 슬라이드"
      >
        Next
      </button>
    </div>
  );
}
```

### 커스텀 페이지네이션

```tsx
// renderBullet: HTML 문자열을 반환하는 함수
<Swiper
  modules={[Pagination]}
  pagination={{
    clickable: true,
    renderBullet: (index, className) => {
      return `<span class="${className}" aria-label="${index + 1}번 슬라이드">${index + 1}</span>`;
    },
  }}
>
```

### Thumbs (썸네일 갤러리)

```tsx
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Thumbs } from 'swiper/modules';
import type { SwiperClass } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';

function GallerySlider() {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);

  return (
    <>
      {/* 메인 슬라이더 */}
      <Swiper
        modules={[FreeMode, Thumbs]}
        // destroyed 체크 필수 — React StrictMode에서 이중 마운트 시 이전 인스턴스 무효화
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        spaceBetween={10}
      >
        <SwiperSlide><img src="/img1.jpg" alt="" /></SwiperSlide>
        <SwiperSlide><img src="/img2.jpg" alt="" /></SwiperSlide>
        <SwiperSlide><img src="/img3.jpg" alt="" /></SwiperSlide>
      </Swiper>

      {/* 썸네일 슬라이더 */}
      <Swiper
        onSwiper={setThumbsSwiper}
        modules={[FreeMode, Thumbs]}
        spaceBetween={10}
        slidesPerView={4}
        freeMode
        watchSlidesProgress
      >
        <SwiperSlide><img src="/img1-thumb.jpg" alt="" /></SwiperSlide>
        <SwiperSlide><img src="/img2-thumb.jpg" alt="" /></SwiperSlide>
        <SwiperSlide><img src="/img3-thumb.jpg" alt="" /></SwiperSlide>
      </Swiper>
    </>
  );
}
```

### EffectFade / EffectCoverflow

```tsx
// Fade 효과 — slidesPerView는 반드시 1이어야 함
<Swiper
  modules={[EffectFade, Navigation]}
  effect="fade"
  fadeEffect={{ crossFade: true }}
  navigation
>

// Coverflow 효과
<Swiper
  modules={[EffectCoverflow, Pagination]}
  effect="coverflow"
  coverflowEffect={{
    rotate: 50,
    stretch: 0,
    depth: 100,
    modifier: 1,
    slideShadows: true,
  }}
  pagination
  centeredSlides
>
```

---

## 방식 2: Swiper Element (Web Component)

> 프레임워크 독립적 Web Component 방식. React 프로젝트에서는 JSX 타입 선언이 별도로 필요합니다.

### 기본 설정 (React)

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { register } from 'swiper/element/bundle';

// 앱 진입점에서 한 번만 호출
register();

function ElementSlider() {
  const swiperRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const swiperEl = swiperRef.current;
    if (!swiperEl) return;

    const params = {
      slidesPerView: 1,
      navigation: true,
      pagination: { clickable: true },
      breakpoints: {
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
    };

    Object.assign(swiperEl, params);
    (swiperEl as any).initialize();
  }, []);

  return (
    <swiper-container ref={swiperRef} init="false">
      <swiper-slide>Slide 1</swiper-slide>
      <swiper-slide>Slide 2</swiper-slide>
      <swiper-slide>Slide 3</swiper-slide>
    </swiper-container>
  );
}
```

### TypeScript 타입 선언 (Swiper Element)

```tsx
// types/swiper-element.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'swiper-container': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        init?: boolean | string;
        navigation?: boolean | string;
        pagination?: boolean | string;
        'slides-per-view'?: number | string;
        'space-between'?: number | string;
        loop?: boolean | string;
      },
      HTMLElement
    >;
    'swiper-slide': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
  }
}
```

> 주의: Swiper Element에서 이벤트는 `swiper` 접두사가 붙습니다 (예: `swiperslidechange`). `eventsPrefix` 파라미터로 변경 가능합니다.

---

## 성능 최적화

### Lazy Loading (이미지)

```tsx
// Swiper 9+에서 lazy 모듈 제거 — 네이티브 loading="lazy" 또는 Next.js Image 사용
<Swiper modules={[Navigation]} navigation>
  <SwiperSlide>
    {/* 방법 1: 네이티브 lazy loading */}
    <img src="/large-image.jpg" loading="lazy" alt="" />
  </SwiperSlide>
  <SwiperSlide>
    {/* 방법 2: Next.js Image (권장 — 자동 최적화) */}
    <Image src="/large-image.jpg" alt="" width={800} height={600} />
  </SwiperSlide>
</Swiper>
```

> 주의: Swiper 9 이전의 `Lazy` 모듈 + `data-src` 패턴은 완전히 제거되었습니다. `swiper-lazy-preloader` 클래스만 남아 있으며, 실제 lazy 로딩은 브라우저 네이티브 기능에 위임합니다.

### Virtual Slides (대량 슬라이드)

```tsx
import { Virtual } from 'swiper/modules';

function VirtualSlider({ items }: { items: string[] }) {
  return (
    <Swiper
      modules={[Virtual]}
      virtual
      slidesPerView={3}
      spaceBetween={10}
    >
      {items.map((item, index) => (
        // virtualIndex prop 필수 — 누락 시 슬라이드 순서 꼬임
        <SwiperSlide key={item} virtualIndex={index}>
          {item}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
```

> Virtual Slides는 수백 개 이상의 슬라이드에서 DOM 노드 수를 줄여 성능을 개선합니다.

### 불필요한 리렌더 방지

```tsx
// 객체 props는 useMemo로 안정화하여 Swiper 재초기화 방지
const breakpoints = useMemo(() => ({
  640: { slidesPerView: 2 },
  1024: { slidesPerView: 3 },
}), []);

const autoplayConfig = useMemo(() => ({
  delay: 3000,
  disableOnInteraction: false,
}), []);

<Swiper breakpoints={breakpoints} autoplay={autoplayConfig}>
```

---

## Next.js App Router SSR 이슈 해결

### 기본: 'use client' 추가

```tsx
// components/HeroSlider.tsx
'use client'; // 파일 최상단에 위치 (import 전)

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function HeroSlider() {
  return (
    <Swiper modules={[Navigation]} navigation>
      <SwiperSlide>Slide 1</SwiperSlide>
    </Swiper>
  );
}
```

### Hydration Mismatch 발생 시: dynamic import + ssr: false

```tsx
// page.tsx (Server Component)
import dynamic from 'next/dynamic';

const HeroSlider = dynamic(() => import('@/components/HeroSlider'), {
  ssr: false,
  loading: () => <div className="slider-skeleton" style={{ height: 400 }} />,
});

export default function Page() {
  return <HeroSlider />;
}
```

> 주의: `ssr: false`는 SEO·LCP에 영향을 줍니다. hydration mismatch가 실제로 발생할 때만 사용하세요. `'use client'`만으로 대부분 해결됩니다.

> 주의: App Router에서 `dynamic(..., { ssr: false })`는 Server Component 내부에서 직접 사용 불가 — Client Component 내부에서만 유효합니다.

### CSS import (Next.js)

```tsx
// Next.js 13.1+ — 'use client' 컴포넌트 내에서 직접 CSS import 가능
// next.config.js 별도 설정 불필요

// 전역 적용이 필요한 경우 app/layout.tsx에서 import
// import 'swiper/css'; // 가능하지만 모든 페이지에 번들됨
```

---

## 자주 사용하는 설정 조합

### 히어로 배너 (풀스크린 + 자동 재생 + 페이드)

```tsx
<Swiper
  modules={[Autoplay, EffectFade, Pagination]}
  effect="fade"
  fadeEffect={{ crossFade: true }}
  autoplay={{ delay: 5000, disableOnInteraction: false }}
  pagination={{ clickable: true }}
  loop
  className="hero-swiper"
>
```

### 상품 캐러셀 (반응형 + 네비게이션)

```tsx
<Swiper
  modules={[Navigation]}
  navigation
  spaceBetween={16}
  slidesPerView={1.2}
  breakpoints={{
    640: { slidesPerView: 2.2 },
    1024: { slidesPerView: 4, spaceBetween: 24 },
  }}
>
```

### 카드 슬라이더 (FreeMode + Mousewheel)

```tsx
<Swiper
  modules={[FreeMode, Mousewheel]}
  freeMode
  mousewheel={{ forceToAxis: true }}
  slidesPerView="auto"
  spaceBetween={12}
>
  <SwiperSlide style={{ width: '280px' }}>Card 1</SwiperSlide>
  <SwiperSlide style={{ width: '280px' }}>Card 2</SwiperSlide>
</Swiper>
```

---

## CSS 커스터마이징

### SCSS로 Swiper 스타일 오버라이드

```scss
// _swiper-custom.scss
.swiper {
  width: 100%;
  height: 100%;
}

// 네비게이션 버튼 커스텀
.swiper-button-next,
.swiper-button-prev {
  color: var(--color-primary);
  width: 44px;
  height: 44px;

  &::after {
    font-size: 20px;
  }
}

// 페이지네이션 도트 커스텀
.swiper-pagination-bullet {
  width: 10px;
  height: 10px;
  background: var(--color-gray-300);
  opacity: 1;

  &-active {
    background: var(--color-primary);
    width: 24px;
    border-radius: 5px;
  }
}

// 슬라이드 높이 자동 맞춤
.swiper-slide {
  height: auto;
}
```

---

## 흔한 실수

### 1. modules prop 누락

```tsx
// 잘못됨 — navigation이 동작하지 않음
<Swiper navigation>

// 올바름 — 사용하는 모듈을 modules 배열에 명시
<Swiper modules={[Navigation]} navigation>
```

### 2. CSS import 누락

```tsx
// 잘못됨 — 레이아웃 깨짐
import { Swiper, SwiperSlide } from 'swiper/react';

// 올바름 — 최소 swiper/css 필수
import 'swiper/css';
```

### 3. loop + 슬라이드 수 부족

```tsx
// Swiper 11+: loop 사용 시 slidesPerView보다 슬라이드가 충분히 많아야 함
// (예: slidesPerView=3이면 최소 4개 이상 권장)
// 슬라이드 수가 적을 때는 조건부 loop

<Swiper loop={items.length > slidesPerView}>

// loopedSlides는 Swiper 11에서 제거됨
// 대신 loopAdditionalSlides 사용
<Swiper loop loopAdditionalSlides={2}>
```

### 4. Thumbs swiper destroyed 체크 누락

```tsx
// 잘못됨 — React StrictMode에서 에러 발생 가능
thumbs={{ swiper: thumbsSwiper }}

// 올바름 — destroyed 상태 체크 필수
thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
```

### 5. Virtual Slides에서 virtualIndex 누락

```tsx
// 잘못됨 — 슬라이드 순서 꼬임
<SwiperSlide key={index}>{item}</SwiperSlide>

// 올바름
<SwiperSlide key={item.id} virtualIndex={index}>{item}</SwiperSlide>
```

### 6. 동적 슬라이드 업데이트 시 key 관리

```tsx
// 데이터 변경 시 Swiper를 완전히 재초기화하려면 key prop 활용
<Swiper key={categoryId} modules={[Navigation]} navigation>
  {filteredItems.map((item) => (
    <SwiperSlide key={item.id}>{item.name}</SwiperSlide>
  ))}
</Swiper>
```

### 7. EffectFade에서 slidesPerView > 1

```tsx
// 잘못됨 — 페이드 효과는 한 번에 하나의 슬라이드만 지원
<Swiper effect="fade" slidesPerView={2}>

// 올바름 — 페이드 효과 사용 시 slidesPerView=1 고정
<Swiper effect="fade" slidesPerView={1}>
```

---

## 언제 사용 / 언제 사용하지 않을지

### 사용이 적합한 경우

- 히어로 배너, 프로모션 슬라이더
- 상품/카드 캐러셀 (반응형 breakpoints 필요)
- 이미지 갤러리 + 썸네일
- 모바일 앱 스타일 터치 스와이프 인터랙션
- 트랜지션 효과(페이드, 커버플로우)가 필요한 슬라이더

### 다른 선택지를 고려할 경우

- 단순 가로 스크롤 → CSS `overflow-x: auto` + `scroll-snap` 으로 충분
- 수천 개 이상 항목의 가상 스크롤 목록 → TanStack Virtual
- 풀페이지 스크롤 → CSS `scroll-snap` (fullPage.js는 과잉)
- 탭/아코디언 → Radix UI Tabs
