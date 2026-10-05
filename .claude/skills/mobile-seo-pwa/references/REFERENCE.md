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
