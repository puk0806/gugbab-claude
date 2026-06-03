---
name: mobile-seo-pwa
description: >
  모바일 SEO 특수 사항(Mobile-First Indexing, viewport meta, dynamic viewport, iOS safe-area, 인터스티셜 페널티)과 Web App Manifest의 SEO 기여를 한 곳에 정리. seo-static-html 같은 기본 SEO 스킬에서 다루지 않는 모바일·PWA 전용 영역.
  <example>사용자: "모바일에서 iPhone notch 영역까지 콘텐츠가 차게 만들면서 SEO·접근성 안 깨려면?"</example>
  <example>사용자: "PWA에 manifest.webmanifest 추가했는데 iOS에서 아이콘이 깨져요. apple-touch-icon도 따로 박아야 하나요?"</example>
  <example>사용자: "AMP 페이지 만들어둔 거 2026년에도 유지해야 하나요?"</example>
---

# Mobile SEO + PWA Manifest

> 소스:
> - Google Search Central — Mobile-First Indexing: https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing
> - Google Search Central — Intrusive Interstitials: https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials
> - MDN — Viewport meta tag: https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag
> - MDN — env() CSS function: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env
> - W3C — Web Application Manifest: https://www.w3.org/TR/appmanifest/ (Working Draft 2026-05-07)
> - Apple — Configuring Web Applications: https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
> - Chrome for Developers — Viewport Resize Behavior: https://developer.chrome.com/blog/viewport-resize-behavior
> - caniuse — Viewport unit variants: https://caniuse.com/viewport-unit-variants
> 검증일: 2026-06-02
> 범위: 한국 사용자 환경(iPhone Safari + Android Chrome + Samsung Internet) 우선

---

## 0. 이 스킬이 다루는 범위

`seo-static-html` 등 일반 SEO 스킬은 **데스크톱·일반 케이스**를 다룬다. 이 스킬은 그 위에 얹는 **모바일 전용 + PWA 보강** 레이어다.

| 다루는 것 | 다루지 않는 것 (다른 스킬) |
|-----------|---------------------------|
| Mobile-First Indexing 콘텐츠 패리티 | title/description/canonical 등 일반 메타 |
| viewport meta + dvh/svh/lvh | a11y 전반 (`a11y-*` 스킬) |
| iOS safe-area + apple-touch-icon | 다국어 hreflang (`seo-i18n-*`) |
| Web App Manifest의 SEO 기여 | Core Web Vitals 최적화 (`cwv-*`) |
| 모바일 인터스티셜 페널티 | Service Worker 구현 세부 (`pwa-service-worker`) |
| AMP의 현재 입지 (deprecated 관점) | |

---

## 1. Mobile-First Indexing — 2026년 기준 사실

### 1-1. 완료 시점

- **2024-07-05**: Googlebot이 100% 사이트를 mobile 크롤러로 전환 완료
- **2026 현재**: 모바일 버전이 인덱싱·랭킹의 **유일한 기준**. 데스크톱 전용 콘텐츠는 인덱싱되지 않는다고 봐도 무방
- 출처: Google Search Central 공식 문서

### 1-2. 권장 사이트 구조

| 구조 | Google 권장도 |
|------|--------------|
| **반응형 (responsive)** | ⭐ 강력 권장. "구현·유지가 가장 쉬움" — 공식 문구 |
| 동적 서빙 (Dynamic Serving) | 허용. `Vary: User-Agent` 필수 |
| **M-dot 분리** (`m.example.com`) | 비권장. canonical/alternate 양방향 링크 필수, 운영 복잡 |

### 1-3. 콘텐츠 패리티 (Content Parity) — 가장 흔한 함정

> **모바일에서 빼는 콘텐츠는 인덱싱에서 빠진다.**

체크리스트:

- [ ] 모바일·데스크톱 **본문 텍스트가 동일**한가 (단순 축약 OK, 통째로 제거 NO)
- [ ] 모바일에서 `display: none`·접기로 숨긴 콘텐츠도 **DOM에는 존재**하는가 (Google은 hidden 콘텐츠도 인덱싱하지만 가중치는 낮음)
- [ ] `title`·`meta description`이 모바일·데스크톱 동일한가
- [ ] 구조화 데이터(`application/ld+json`)가 모바일 버전에도 포함되어 있는가
- [ ] 이미지·alt·헤딩이 모바일 버전에도 존재하는가
- [ ] `robots.txt`로 모바일 리소스(JS/CSS) 차단하지 않았는가

> 주의: "Read more" 접기·아코디언으로 숨겨도 인덱싱은 되지만, **lazy-load with intersection observer**로 DOM에 늦게 들어오는 콘텐츠는 Googlebot이 못 볼 수 있다. SSR/prerender로 초기 HTML에 포함시켜라.

---

## 2. viewport meta — 모바일 SEO·a11y의 기본

### 2-1. 베이스 라인 (반드시 이것부터)

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

이게 빠지면 모바일에서 데스크톱 너비로 렌더링 → 모바일 친화 점수 0점.

### 2-2. 주요 옵션

| 옵션 | 값 | 용도 |
|------|---|------|
| `width` | `device-width` | 기기 너비 사용. 거의 항상 이것 |
| `initial-scale` | `1` | 100% 줌으로 시작 |
| `viewport-fit` | `cover` | iOS notch 영역까지 화면 채움 (3절 참조) |
| `interactive-widget` | `resizes-visual` (기본) / `resizes-content` / `overlays-content` | 키보드 표시 시 viewport 동작 (Chrome 108+, Firefox 132+) |
| `maximum-scale` | — | **건드리지 마라** (a11y 위반) |
| `user-scalable` | — | **건드리지 마라** (a11y 위반) |

### 2-3. 절대 하면 안 되는 것

```html
<!-- ❌ WCAG 1.4.4 (Resize Text) 위반 -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

- 저시력 사용자가 핀치줌으로 확대해서 읽는 것을 막음
- WCAG는 텍스트가 **최소 200%까지 확대 가능**해야 함을 요구
- Google "모바일 친화" 평가에서 감점
- iOS 10+은 이 설정을 **이미 무시**함 (있어봤자 a11y 점수만 깎임)
- 출처: Deque axe rule `meta-viewport`, W3C ACT Rule `b4f0c3`

### 2-4. 가상 키보드 동작 제어 (Chrome 108+)

폼 페이지에서 키보드가 떴을 때 레이아웃이 흐트러지는 문제를 제어:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, interactive-widget=resizes-content">
```

| 값 | 동작 |
|----|------|
| `resizes-visual` (기본) | Visual viewport만 줄어듦. Layout viewport는 그대로 |
| `resizes-content` | Layout viewport까지 줄어듦. `100vh`도 키보드 위 영역으로 줄어듦 |
| `overlays-content` | 둘 다 안 줄어듦. 키보드가 콘텐츠 위에 덮음 |

> 주의: iOS Safari는 이 옵션 미지원 (WebKit). iOS는 항상 기본 동작.

---

## 3. iOS Notch / Safe Area — viewport-fit + env()

### 3-1. 문제

iPhone X 이후 기기는 상단 notch / 하단 home indicator가 있다. 기본 상태에서 Safari는 콘텐츠를 안전 영역 안에만 렌더링해서, 상하에 흰 띠가 생긴다.

### 3-2. 해결 (2단계)

**Step 1: viewport-fit=cover로 화면 전체 사용 선언**

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

**Step 2: safe-area-inset-* env()로 콘텐츠 보호**

```css
/* 상단 헤더가 notch에 안 가리게 */
.app-header {
  padding-top: env(safe-area-inset-top);
}

/* 하단 탭바가 home indicator에 안 가리게 */
.tab-bar {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 가로 모드에서 좌우도 보호 */
.app-content {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* fallback (notch 없는 기기는 0 반환) */
.app-header {
  padding-top: max(env(safe-area-inset-top), 16px);
}
```

### 3-3. 안 했을 때 vs 했을 때

| 시나리오 | 결과 |
|----------|------|
| viewport-fit 안 함 | notch 위쪽이 흰 띠. PWA 같은 몰입감 없음 |
| viewport-fit=cover만 함 | 콘텐츠가 notch에 가림 |
| viewport-fit=cover + safe-area-inset | ✅ 화면 전체 사용 + 콘텐츠 보호 |

> 참고: `env(safe-area-inset-*)`는 notch 없는 기기에선 `0`을 반환하므로 모든 기기에 안전하게 적용 가능.

---

## 4. Dynamic Viewport (dvh / svh / lvh) — `100vh` 문제

### 4-1. `100vh`의 함정

모바일 Safari/Chrome은 스크롤 시 주소창이 사라진다. 그런데 `100vh`는 **주소창이 사라진 상태**(largest viewport)를 기준으로 계산되어, 초기 로드 시점에 화면 하단이 잘린다.

### 4-2. 2026년 표준 단위

| 단위 | 의미 | 사용처 |
|------|------|--------|
| `100svh` | Small Viewport Height (UI 모두 보이는 가장 작은 상태) | "절대 안 잘리는" 시작 화면 |
| `100lvh` | Large Viewport Height (UI 다 숨은 가장 큰 상태) | 전체 영역 사용 (스크롤 시) |
| `100dvh` | Dynamic Viewport Height (UI 상태에 따라 동적) | 모달·풀스크린 (가장 흔히 사용) |

### 4-3. 브라우저 지원 (2026-06 기준)

- Chrome 108+, Firefox 101+, Safari 15.4+, Edge 108+
- **2025-06부터 Baseline Widely Available 등급**
- 글로벌 사용자 약 95%가 지원 브라우저 사용
- 출처: caniuse.com/viewport-unit-variants

### 4-4. 패턴

```css
/* 풀스크린 히어로 — dvh 권장 */
.hero {
  min-height: 100dvh;
}

/* 구형 브라우저 fallback */
.hero {
  min-height: 100vh; /* fallback */
  min-height: 100dvh;
}

/* 모달 — 절대 잘리면 안 됨 → svh */
.modal {
  height: 100svh;
}
```

> 주의: `dvh`는 스크롤 시 값이 계속 변하므로 **레이아웃 jank**가 발생할 수 있다. 트랜지션이 필요한 요소에는 `svh` 또는 `lvh`를 쓰고 padding으로 보정하는 편이 부드럽다.

---

## 5. Web App Manifest — 필수·권장 필드

### 5-1. 스펙 현황 (W3C Working Draft 2026-05-07 기준)

> 주의: 스펙상 **모든 필드는 optional**이다. "필수"라는 표현은 *PWA로 동작하기 위한 사실상의 필수*를 의미한다. (출처: W3C 직접 확인)

### 5-2. PWA로 동작·설치되려면 필요한 필드

```json
{
  "name": "꿈해몽 - AI Dream Interpreter",
  "short_name": "꿈해몽",
  "description": "AI 기반 꿈 해몽 서비스",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#5b21b6",
  "lang": "ko-KR",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

| 필드 | 역할 | 빠지면 |
|------|------|--------|
| `name` | 설치 후 표시 이름 (전체) | 설치 프롬프트가 안 뜸 |
| `short_name` | 홈 화면 아이콘 아래 표시 (12자 이내 권장) | name 전체 노출 |
| `start_url` | 설치 후 실행 시 열리는 URL | 현재 URL 사용 (분석 추적 불가) |
| `display` | `standalone` / `fullscreen` / `minimal-ui` / `browser` | browser (PWA처럼 안 보임) |
| `icons` | 192px·512px **둘 다 필수 사실상** | 설치 안 됨 |
| `theme_color` | 상태바·탭 색상 | 기본값 |
| `background_color` | 스플래시 화면 배경 | 흰색 |

### 5-3. `display` 값 선택

| 값 | 사용처 | 주의 |
|----|--------|------|
| `standalone` | ⭐ 일반 PWA. 주소창 없음, 상태바는 있음 | 기본 권장 |
| `minimal-ui` | 뒤로/새로고침 정도만 보임 | Chrome Android만 잘 지원 |
| `fullscreen` | 게임·미디어 플레이어 | 시스템 UI까지 숨김. 일반 앱은 **사용자 혼란** → 비권장 |
| `browser` | manifest 있지만 일반 탭으로 열기 | PWA 효과 없음 |

### 5-4. SEO 관점에서 manifest의 의미

- manifest 자체가 **랭킹 신호는 아님**
- 그러나 PWA 자격을 갖추면 Chrome의 "Add to Home Screen" 프롬프트가 자동 노출 → 재방문률·체류 시간 증가 → 간접 SEO 효과
- Google Search Console에서 "설치 가능한 웹앱"으로 인지됨

### 5-5. HTML에 연결

```html
<link rel="manifest" href="/manifest.webmanifest">
```

> `.webmanifest` 확장자 권장 (MIME `application/manifest+json`). `.json`도 동작하지만 일부 서버 설정에서 MIME 충돌 우려.

---

## 6. iOS Safari 전용 메타 — manifest 보완용

iOS Safari는 Web App Manifest를 **부분 지원**한다 (2018년 이후). manifest의 `display: standalone`·`icons` 일부는 우선 적용되지만, 다음 항목은 **여전히 Apple 전용 메타로 박아야 한다**.

### 6-1. apple-touch-icon (가장 중요)

```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

- **180×180 PNG 1개로 충분** (iPhone Retina 3x 기준)
- 투명 배경 금지 — 검은 사각형이 됨
- 모서리 둥글기는 iOS가 자동 적용 (사각 PNG로 제작)
- 없으면 홈 화면 추가 시 페이지 스크린샷이 아이콘으로 들어감

### 6-2. 스플래시·UI 메타

```html
<!-- 주소창 없는 standalone 모드 (iOS 16.4+에서는 manifest display: standalone로 대체 가능) -->
<meta name="apple-mobile-web-app-capable" content="yes">

<!-- 상태바 색상: default / black / black-translucent -->
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

<!-- 홈 화면 아이콘 라벨 (manifest short_name 있으면 자동) -->
<meta name="apple-mobile-web-app-title" content="꿈해몽">
```

### 6-3. iOS 17.4+ EU 제약 (2024-03부터)

> 주의: 2024-03 Apple은 DMA 컴플라이언스를 이유로 EU 지역에서 PWA 기능 일부를 제한. EU 사용자는 홈 화면에 추가해도 일반 Safari 탭으로 열리고 푸시 알림 미지원. EU 외 지역은 영향 없음. 한국 서비스라면 영향 없음.

### 6-4. 필수 메타 세트 (한국 서비스 기준)

```html
<head>
  <!-- 1. viewport -->
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

  <!-- 2. manifest (Android Chrome + iOS 부분) -->
  <link rel="manifest" href="/manifest.webmanifest">

  <!-- 3. iOS 전용 보강 -->
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

  <!-- 4. 일반 favicon -->
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">

  <!-- 5. theme color (브라우저 UI 색상, manifest와 같이) -->
  <meta name="theme-color" content="#5b21b6">
</head>
```

---

## 7. AMP — 2026년 현재 입지

### 7-1. 사실 (출처: Google + 업계 데이터)

- **2021-06**: Google Page Experience Update → Top Stories 캐러셀에서 AMP 요구 제거
- **2021 동시기**: 검색 결과에서 AMP 뱃지(번개 아이콘) 제거
- **2024 이후**: 주요 퍼블리셔(WaPo, CNBC, Vox Media 등) 다수가 AMP 이탈
- **2026 현재**: AMP는 **랭킹 신호 아님**. Core Web Vitals on standard HTML이 대체

### 7-2. 액션

| 상황 | 권장 |
|------|------|
| 신규 사이트 | ❌ AMP 도입하지 마라. 이득 없음 |
| 기존 AMP 운영 중 | 유지는 가능하지만 신규 페이지에는 적용하지 마라. 점진 deprecate 검토 |
| Web Stories (AMP 기반) | 이건 별개 포맷. Google이 Stories는 일부 영역에서 여전히 활용 |

> 주의: AMP 페이지를 통째로 삭제할 때는 `amphtml` link rel 제거 + AMP URL → canonical URL 301 리다이렉트로 인덱싱 보존.

---

## 8. 모바일 인터스티셜 페널티

### 8-1. 패널티 대상 (Google 공식 문서)

- 페이지 진입 직후·탐색 중에 **본문을 가리는 전체 화면 다이얼로그**
- 상당 부분을 차지하는 인라인 인터스티셜
- 본문을 가리지 않더라도 **콘텐츠 접근 자체를 막는** 동의 페이지로의 리다이렉트

### 8-2. 예외 (페널티 없음)

| 예외 | 예시 |
|------|------|
| 법적 의무 | 쿠키 동의 (GDPR/CCPA), 연령 확인 (성인 콘텐츠) |
| 로그인 다이얼로그 | **공개되지 않은 콘텐츠**에 한해 — 페이월·구독자 콘텐츠 |
| 작은 배너 | 화면의 작은 일부만 차지하는 배너 (앱 설치 유도 등) |

### 8-3. 권장 배너 크기

> 업계 베스트 프랙티스: 모바일 viewport의 **15-25% 이내**. Google 공식 수치는 아니지만 안전 마진.

### 8-4. 흔한 위반 사례

- 진입 직후 풀스크린 "앱 다운로드" 모달 → **위반**
- 이메일 구독 풀스크린 모달 → **위반**
- 쿠키 동의 풀스크린 → 예외 (단, "동의" 외에 콘텐츠를 볼 수 없게 막으면 위반)
- 작은 하단 배너 형태의 앱 설치 유도 → ✅ OK

---

## 9. Smart App Banner / 앱 설치 유도

### 9-1. iOS Safari (네이티브 지원)

```html
<meta name="apple-itunes-app" content="app-id=123456789, app-argument=https://example.com/dream/abc">
```

- `app-id`: App Store ID (필수)
- `app-argument`: 앱이 설치되어 있을 때 딥링크로 전달할 URL (옵션)
- Safari가 자동으로 상단에 작은 배너 표시 → 인터스티셜 페널티 대상 아님

### 9-2. Android Chrome

Apple 같은 네이티브 배너는 **없다**. 대신 Web App Manifest로 우회:

```json
{
  "prefer_related_applications": true,
  "related_applications": [
    {
      "platform": "play",
      "url": "https://play.google.com/store/apps/details?id=com.example.app",
      "id": "com.example.app"
    }
  ]
}
```

- `prefer_related_applications: true`로 두면 PWA 설치 프롬프트 대신 Play Store 앱 설치 유도
- PWA·앱 동시 운영 시 결정 필요 (PWA 우선이면 `false`)

### 9-3. 안티패턴

- 진입 직후 풀스크린 "앱 다운로드" 모달 → 인터스티셜 위반
- 닫기 버튼 숨김 → UX·SEO 둘 다 손해

---

## 10. PWA · Service Worker와 SEO

### 10-1. Googlebot의 동작

- Googlebot은 **Service Worker를 등록·실행하지 않는다**
- 그러므로 SW의 fetch 인터셉트 결과가 아니라 **원본 서버 응답 HTML**을 인덱싱
- → SPA에서 SW가 app shell만 반환하도록 했어도 SEO 영향 없음 (단, 원본 HTML이 비어있으면 인덱싱도 빔)

### 10-2. 렌더링 전략별 SEO 위험도

| 전략 | SEO | 비고 |
|------|-----|------|
| SSR (Next.js·Nuxt·Astro) | ⭐ 최선 | 초기 HTML 완성 → Googlebot 1회 크롤로 끝 |
| SSG / Prerender | ⭐ 매우 좋음 | 정적이라 안정적, 동적 콘텐츠는 ISR로 |
| CSR (React SPA 단독) | ⚠️ 위험 | Googlebot 2차 렌더링 큐에 들어가서 지연되거나 누락 |
| Dynamic Rendering | △ | Googlebot에만 prerender 결과 제공. Google 자체는 **권장 안 함** (cloaking 위험) |

### 10-3. PWA + SEO 조합 권장

- Next.js / Nuxt / Astro 등 **SSR + manifest + SW** 조합이 표준
- SW 캐싱은 **사용자 재방문 성능**에 도움 → CWV 개선 → 간접 SEO 효과
- `start_url`에 `?source=pwa` 등 분석 파라미터를 박아 PWA 유입 추적

---

## 11. 모바일 SEO 평가 도구 (2026)

| 도구 | 상태 |
|------|------|
| Google Mobile-Friendly Test | ❌ **2023-12-04 deprecated**. URL 사라짐 |
| Google Search Console Mobile Usability 리포트 | ❌ **2023-12-04 deprecated** |
| Google Search Console URL Inspection | ✅ 현재 대안. 모바일 렌더링 결과 확인 |
| Lighthouse (Chrome DevTools) | ✅ Mobile preset로 점수·CWV 확인 |
| PageSpeed Insights | ✅ 모바일·데스크톱 별도 점수 |
| Rich Results Test | ✅ 구조화 데이터 + 모바일 렌더링 확인 |

> 권장 워크플로우: **Lighthouse Mobile preset → CWV 통과 → GSC URL Inspection으로 인덱싱 확인**

---

## 12. 흔한 실수 패턴 (Anti-patterns)

| 실수 | 영향 | 수정 |
|------|------|------|
| viewport에 `user-scalable=no` | a11y 위반, 모바일 친화 감점 | 제거 |
| viewport에 `maximum-scale=1.0` | 동일 | 제거 |
| 모바일에서 본문 일부 `display:none` | 인덱싱 누락 | 모바일·데스크톱 콘텐츠 패리티 |
| iOS notch 미대응 | 콘텐츠 가림, UX 나쁨 | viewport-fit=cover + safe-area-inset |
| manifest에 icons만 있고 apple-touch-icon 없음 | iOS 홈 화면 아이콘 깨짐 | 180×180 PNG 추가 |
| `display: fullscreen` | 시스템 UI까지 숨겨 사용자 혼란 | `standalone` 사용 |
| `100vh`만 사용 | 모바일에서 하단 잘림 | `dvh`/`svh` 추가 |
| AMP 신규 도입 | 효과 없음, 유지보수 부담 | 표준 HTML + CWV |
| 진입 직후 풀스크린 앱 설치 모달 | 인터스티셜 페널티 | 작은 배너 또는 `apple-itunes-app` 메타 |
| Service Worker가 모든 요청 가로채서 app shell만 반환 | CSR 사이트면 SEO 누락 | SSR로 원본 HTML 보장 |
| `start_url`에 분석 파라미터 없음 | PWA 유입 추적 불가 | `?source=pwa` 등 |
| AMP 페이지 단순 삭제 | 인덱싱 손실 | `amphtml` link 제거 + canonical로 301 |

---

## 13. 빠른 체크리스트 (배포 전)

### 13-1. HTML head 필수

- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
- [ ] `<link rel="manifest" href="/manifest.webmanifest">`
- [ ] `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">`
- [ ] `<meta name="apple-mobile-web-app-capable" content="yes">`
- [ ] `<meta name="theme-color" content="#...">`
- [ ] `user-scalable=no` / `maximum-scale` 없음

### 13-2. manifest.webmanifest

- [ ] `name`, `short_name`, `start_url`, `display`, `icons` 모두 존재
- [ ] icons에 192×192 + 512×512 + maskable 512 포함
- [ ] `display: standalone` (또는 `minimal-ui`)
- [ ] `theme_color`, `background_color` 명시
- [ ] `lang` 명시 (한국 서비스: `"ko-KR"`)

### 13-3. CSS

- [ ] 풀스크린 영역에 `100vh` 단독 사용 없음 (dvh/svh 사용)
- [ ] 헤더·푸터에 `env(safe-area-inset-*)` padding 적용
- [ ] Tailwind 사용 시 `pt-[env(safe-area-inset-top)]` 또는 `safe-area` 플러그인

### 13-4. SEO 검증

- [ ] Lighthouse Mobile 점수 90+ (Performance / Accessibility / SEO / PWA)
- [ ] GSC URL Inspection에서 모바일 렌더링 결과 확인
- [ ] 모바일·데스크톱 콘텐츠 패리티 (텍스트·이미지·구조화 데이터)
- [ ] 진입 직후 풀스크린 인터스티셜 없음
- [ ] AMP에 의존하지 않음

---

## 14. 한국 사용자 환경 특이사항

| 환경 | 비고 |
|------|------|
| iPhone Safari | 한국 점유율 약 30%. notch 대응 필수 |
| Android Chrome | 점유율 약 60%. PWA 설치 프롬프트 기본 동작 |
| Samsung Internet | 점유율 약 8-10%. **Chromium 기반이지만 PWA 동작 일부 다름** — Samsung 측 자체 manifest 확장 필드(`samsung_app_id`) 존재하나 의존하지 마라 |
| 네이버 인앱 브라우저 | 모바일 검색 유입의 상당수. PWA 설치 불가, manifest 무시. **콘텐츠는 정상 렌더링되어야 함** |
| 카카오톡 인앱 브라우저 | 공유 링크 유입. JavaScript 일부 제한. 핵심 콘텐츠는 SSR 필수 |

> 주의: 네이버·카카오 인앱 브라우저에서 PWA·SW 동작은 기대하지 마라. 폴백으로 외부 브라우저로 열기 유도 가능 (`window.open` + UA 분기).
