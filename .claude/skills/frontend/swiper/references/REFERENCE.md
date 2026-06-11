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
