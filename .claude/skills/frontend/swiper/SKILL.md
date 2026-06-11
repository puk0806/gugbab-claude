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

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
