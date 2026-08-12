---
name: swiper
description: Swiper 14.x 슬라이더/캐러셀 — React 컴포넌트 + Swiper Element, 핵심 모듈, 반응형, 성능 최적화, Next.js SSR 패턴
---

# Swiper 14.x 슬라이더/캐러셀

> 소스: https://swiperjs.com/react, https://swiperjs.com/swiper-api, https://swiperjs.com/element, https://swiperjs.com/blog/swiper-v14, https://swiperjs.com/blog/swiper-v12, https://swiperjs.com/changelog
> 검증일: 2026-08-11
> 버전: Swiper 14.1.0 (2026-08-06 릴리즈) 기준 — v14.0.0은 2026-06-26 릴리즈. v13은 건너뛰고 v12 → v14로 이동

---

## 설치

```bash
npm install swiper
# 레거시 브라우저 지원이 필요해 v12에 머물러야 하는 경우:
npm install swiper@12
```

### 브라우저 baseline (v14 breaking change)

v14는 최근 약 2년의 에버그린 브라우저로 지원 범위를 상향했습니다. 레거시 DOM 호환 헬퍼와 baseline 이하 기능 감지 코드가 제거되었습니다.

| 브라우저 | 최소 버전 |
|----------|-----------|
| Chrome / Edge | 110+ |
| Safari (iOS 포함) | 16.4+ |
| Firefox | 110+ |

> 지원 대상이 이 범위 밖이면 **v14로 올리지 말고 v12에 머무릅니다.**

> 주의: v14 릴리즈 노트의 "Node.js >= 20.19.0" 요구는 **로컬 툴체인·빌드 환경 기준**입니다(이전 engines 값은 >= 4.7.0). 브라우저 런타임 동작과는 무관합니다.

---

## 방식 선택 기준: React 컴포넌트 vs Swiper Element

| 기준 | `swiper/react` | Swiper Element (Web Component) |
|------|---------------|-------------------------------|
| React 친화성 | 높음 — JSX props로 바로 설정 | 낮음 — `Object.assign` + `initialize()` |
| TypeScript | 자연스러운 타입 추론 (v14에서 타입 정확도 향상) | 별도 JSX 타입 선언 필요 |
| 공식 권장 | React 프로젝트에 적합 | 프레임워크 독립 프로젝트에 적합 |
| SSR | `'use client'` 추가로 해결 | 동일 |
| React 19 지원 | 지원 | 지원 |

> Swiper Element가 한때 "미래 권장 방식"으로 소개되었으나, **v14 기준 `swiper/react`는 계속 유지·제공**됩니다(v14.1.0 공식 문서의 React 페이지·타입 문서 활성 유지). React 프로젝트에서는 `swiper/react` 사용을 권장합니다.

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

> v12부터 `.scss` / `.less` 소스가 제거되어 **CSS 경로만 존재**합니다. `swiper/scss`, `swiper/less` import는 v12+에서 동작하지 않으므로 전부 `swiper/css*`로 교체합니다.

### TypeScript 타입 패턴

```tsx
// SwiperRef: Swiper 컴포넌트의 ref 타입 (HTMLElement 확장)
// SwiperClass: Swiper 인스턴스 타입 (onSwiper 콜백에서 받는 객체)
import { Swiper, SwiperSlide } from 'swiper/react';
import type { SwiperRef, SwiperClass, SwiperProps } from 'swiper/react';
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

> v14는 타입 선언을 런타임 소스에서 직접 생성(tsc)하도록 바꿔 타입이 구현과 어긋날 여지를 없앴습니다. 대신 **기존에 `any` 캐스팅으로 Swiper 내부에 접근하던 코드에서 새 타입 에러가 드러날 수 있습니다.** 컴파일 타임 문제일 뿐 런타임 동작 변화는 없습니다.

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

### 부분 노출 슬라이드 정렬 — snapToSlideEdge

```tsx
// v12.1.0 추가 — 임의 위치가 아니라 항상 슬라이드 경계에 스냅
// slidesPerView가 소수(1.2 등)이거나 'auto'일 때만 적용
// loop / centeredSlides 모드에서는 무시됨
<Swiper
  slidesPerView={1.2}
  spaceBetween={16}
  snapToSlideEdge
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

### 기본 네비게이션 화살표 아이콘 (v12+ SVG)

```tsx
// v12부터 화살표는 아이콘 폰트(::after)가 아니라 인라인 SVG로 삽입됩니다.
// addIcons(기본 true)를 false로 두면 Swiper가 SVG를 넣지 않으므로
// 버튼 내부 마크업을 직접 채워 넣을 수 있습니다.
<Swiper
  modules={[Navigation]}
  navigation={{ addIcons: false }}
>
```

```css
/* 색상·크기·위치는 CSS 커스텀 프로퍼티로 조정 */
.swiper {
  --swiper-navigation-size: 44px;
  --swiper-navigation-top-offset: 50%;
  --swiper-navigation-sides-offset: 10px;
  --swiper-navigation-color: var(--swiper-theme-color);
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

> 단순 설정은 kebab-case 속성으로도 지정 가능합니다 (`slides-per-view="3"`, `grid-rows="3"`). breakpoints처럼 중첩 객체가 필요하면 위의 `init="false"` + `Object.assign` + `initialize()` 패턴을 사용합니다. 초기화된 인스턴스는 컨테이너 엘리먼트의 `swiper` 프로퍼티로 접근합니다.

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

> 주의: Swiper Element에서 이벤트 이름은 소문자 + `swiper` 접두사입니다 (`slideChange` → `swiperslidechange`). 이벤트 데이터는 `event.detail`로 전달되며, 접두사는 `events-prefix` 속성(`eventsPrefix` 파라미터)으로 변경합니다.

---

## 마이그레이션 노트 (v11 → v14)

v13은 릴리즈되지 않았습니다(v12 → v14). 코드 변경이 실제로 필요한 지점은 **대부분 v12 단계**에 몰려 있고, v14는 브라우저·툴체인 baseline과 타입 엄격도만 달라집니다.

| 버전 | 릴리즈 | 코드 영향 |
|------|--------|-----------|
| 12.0.0 | 2025-09-11 | **SCSS/LESS 소스 제거(CSS-only)**, 네비게이션 아이콘 폰트 → 인라인 SVG, virtual `slidesPerViewAutoSlideSize` 추가 |
| 12.1.0 | 2026-01-28 | `snapToSlideEdge` 추가, 키보드 이동 speed 지정 지원 |
| 14.0.0 | 2026-06-26 | TypeScript 전면 재작성, 브라우저 baseline 상향, `ssr-window` 의존성 제거(런타임 의존성 0), 번들 2~4% 축소 |
| 14.1.0 | 2026-08-06 | 버그 수정 (모듈 기본값 처리, 뷰포트 기준 오프셋, breakpoints 타입 보존) |

### 체크리스트

1. **SCSS/LESS import 교체 (v12)** — `import 'swiper/scss'` → `import 'swiper/css'`. `swiper/scss/navigation` 등 모듈 경로도 `swiper/css/navigation`으로.
2. **SCSS 변수 기반 테마 → CSS 커스텀 프로퍼티 (v12)** — `--swiper-theme-color`, `--swiper-navigation-*` 등으로 오버라이드.
3. **네비게이션 화살표 스타일 재확인 (v12)** — 아이콘이 SVG로 바뀌었으므로 `.swiper-button-next::after { font-size: ... }` 같은 폰트 기반 커스텀은 더 이상 동작하지 않습니다. `--swiper-navigation-size`로 크기를 조정하거나 `navigation={{ addIcons: false }}`로 끄고 직접 마크업을 넣습니다.
4. **브라우저 지원 범위 확인 (v14)** — Chrome/Edge 110+, Safari 16.4+, Firefox 110+ 밖이면 v12 유지.
5. **타입 체크 재실행 (v14)** — `any`로 Swiper 내부에 접근하던 코드에서 새 타입 에러가 나올 수 있습니다.
6. **loop 옵션 확인 (v11부터)** — `loopedSlides`는 v11에서 제거됨. `loopAdditionalSlides`를 사용합니다.

> v12 → v14 업그레이드 자체는 **옵션·기본값·이벤트·페이로드·메서드 시그니처·모듈 import가 모두 그대로**이므로 코드 변경이 필요 없습니다.

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
