---
name: web-vitals-rum-comparison
description: >
  RUM(Real User Monitoring)으로 실사용자 Core Web Vitals(LCP·INP·CLS)를 수집하고
  Sentry·Datadog에서 배포(release) 전후 p75를 비교하는 패턴을 정리한 스킬.
  Lab data와 RUM의 차이, INP 측정 시점·SPA hidden state·표본 분포 함정까지 포함.
  <example>사용자: "배포 후 LCP가 나빠졌는지 어떻게 비교하지?"</example>
  <example>사용자: "Sentry RUM에서 v1.2.0과 v1.2.1의 INP p75 차이를 보고 싶어"</example>
  <example>사용자: "Datadog RUM Explorer에서 release별 Core Web Vitals 쿼리 어떻게 짜?"</example>
---

# Web Vitals RUM Comparison — 배포 전후 실사용자 성능 비교

> 소스:
> - https://web.dev/vitals/
> - https://web.dev/articles/inp
> - https://web.dev/blog/inp-cwv-march-12
> - https://github.com/GoogleChrome/web-vitals
> - https://docs.sentry.io/platforms/javascript/tracing/instrumentation/automatic-instrumentation/
> - https://docs.sentry.io/product/insights/web-vitals/
> - https://docs.sentry.io/platforms/javascript/configuration/releases/
> - https://docs.datadoghq.com/real_user_monitoring/application_monitoring/browser/setup/client/
> - https://docs.datadoghq.com/real_user_monitoring/application_monitoring/browser/monitoring_page_performance/
> - https://docs.datadoghq.com/real_user_monitoring/explorer/search_syntax/
>
> 검증일: 2026-05-14
> 기준 버전: `web-vitals` v5 · `@sentry/browser` 8.x · `@datadog/browser-rum` v7.1.0

---

## 0. 한 줄 요약

배포 직후 "체감 성능 회귀"를 잡으려면 Lab data(Lighthouse)가 아니라 **RUM의 p75를 release 태그로 비교**해야 한다. 트래픽 분포 차이·표본 크기·INP 측정 시점을 고려하지 않으면 잘못된 결론으로 귀결된다.

---

## 1. RUM vs Lab data — 무엇이 다른가

| 항목 | Lab data (Lighthouse, Synthetic) | RUM (Real User Monitoring) |
|------|---------------------------------|---------------------------|
| 측정 환경 | 통제된 단일 환경 (CPU·네트워크 throttle 고정) | 실제 사용자 디바이스·네트워크·지역 |
| 측정값 | 단일 run의 단일 수치 | 다수 세션의 **분포** (p50·p75·p95) |
| 회귀 탐지 | 빌드 시 PR-level 게이팅 | 배포 후 24~72h 트래픽 분포로 판정 |
| INP 측정 가능성 | 시뮬레이션만 (실제 상호작용 X) | 실제 클릭·키 입력 기반 |
| 적합한 용도 | 개발·CI 단계 회귀 방지 | 프로덕션 배포 후 사용자 영향 측정 |

> 결론: **둘 다 필요**. Lab은 PR 머지 전 가드레일, RUM은 실사용자 검증.

---

## 2. Core Web Vitals 한계값 (2026-05 기준)

p75(75th percentile) 기준이 공식 측정 단위다. 모바일·데스크톱을 분리해 본다.

| 메트릭 | 정의 | Good | Needs Improvement | Poor |
|--------|------|:----:|:-----------------:|:----:|
| **LCP** (Largest Contentful Paint) | 가장 큰 콘텐츠 요소 렌더링 시각 — 로딩 | ≤ 2.5s | 2.5–4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | 모든 상호작용 중 가장 긴 latency — 반응성 | ≤ 200ms | 200–500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | 예상 못한 레이아웃 이동 누적 — 시각 안정성 | ≤ 0.1 | 0.1–0.25 | > 0.25 |

### INP는 FID를 언제 대체했나

**2024년 3월 12일**부로 INP가 Core Web Vital로 승격되고 FID는 deprecated 처리됐다. Google Search Console에서는 같은 날 FID가 제거됐고, PageSpeed Insights·CrUX는 6개월 유예. INP는 FID와 달리 **첫 입력만이 아니라 전체 세션의 모든 상호작용**을 측정하며, input delay + processing time + presentation delay 전구간을 본다.

---

## 3. `web-vitals` 라이브러리 — RUM 데이터 직접 수집

Sentry·Datadog SDK가 자동 수집하지만, 커스텀 백엔드로 보내거나 attribution을 직접 분석할 때 사용한다.

### 기본 사용

```ts
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

// 메트릭이 "최종 확정"되는 시점에만 콜백 호출
onCLS(sendToAnalytics);
onINP(sendToAnalytics);
onLCP(sendToAnalytics);

function sendToAnalytics(metric: Metric) {
  // navigator.sendBeacon 권장 — 페이지 unload 시점에도 전송 보장
  const body = JSON.stringify({
    name: metric.name,       // 'LCP' | 'INP' | 'CLS' | ...
    value: metric.value,
    rating: metric.rating,   // 'good' | 'needs-improvement' | 'poor'
    delta: metric.delta,
    id: metric.id,           // 세션-페이지 단위 고유 ID
    navigationType: metric.navigationType,
  });
  navigator.sendBeacon('/api/rum', body);
}
```

### Attribution Build — 원인 추적

표준 빌드보다 약 1.5KB 크지만, **어떤 DOM 요소가 LCP/CLS/INP를 유발했는지** 식별 가능.

```ts
import { onLCP } from 'web-vitals/attribution';

onLCP((metric) => {
  console.log(metric.attribution.element);     // LCP 요소
  console.log(metric.attribution.url);         // 이미지 URL인 경우
  console.log(metric.attribution.timeToFirstByte);
  console.log(metric.attribution.resourceLoadDelay);
});
```

### 언제 콜백이 호출되나 (중요)

- `onLCP` — 페이지 hidden 전환 시 또는 첫 사용자 입력 시점에 확정
- `onINP` — 페이지 hidden 전환 시 확정 (페이지 라이프사이클 끝까지 기다림)
- `onCLS` — 페이지 hidden 전환 시 확정

따라서 **SPA에서 라우트 전환만 하고 페이지를 떠나지 않으면 INP가 보고되지 않을 수 있다.** Sentry·Datadog는 이를 SDK 레벨에서 처리하지만, 직접 수집 시 `reportAllChanges: true` 옵션을 검토한다.

---

## 4. Sentry RUM 설정 및 비교

### 4-1. 초기화 (`@sentry/browser` 8.x+)

```ts
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: process.env.npm_package_version,  // 또는 빌드 시 주입한 git SHA
  environment: 'production',
  integrations: [
    Sentry.browserTracingIntegration({
      // SDK 8.x부터 기본 true. 명시적으로 끄지 않으면 INP 수집됨
      enableInp: true,
    }),
  ],
  tracesSampleRate: 0.1,            // 트랜잭션 10% 샘플링
  // 상호작용(INP)은 trace 위에 추가 곱
  // 예: 0.5 * 0.1 = 5% 상호작용 캡처
  tracePropagationTargets: ['localhost', /^https:\/\/api\.example\.com/],
});
```

자동 수집되는 Web Vitals: **LCP, CLS, FCP, TTFB, INP**. `browserTracingIntegration`이 페이지 로드·네비게이션·HTTP·long task를 자동 계측한다.

### 4-2. release 값 일관성 (배포 비교의 핵심)

비교의 전제는 **빌드 시점에 release 값을 주입하고, 같은 값을 Sentry CLI/source map 업로드에도 사용하는 것**이다. 브라우저는 다음 우선순위로 release를 읽는다:

1. `Sentry.init({ release })` 인자
2. `window.SENTRY_RELEASE.id` (빌드 도구가 주입)

CI에서 sentry-cli로 release를 등록한다:

```bash
sentry-cli releases new "$VERSION"
sentry-cli releases set-commits "$VERSION" --auto
sentry-cli releases finalize "$VERSION"
```

### 4-3. 배포 전후 비교 — Insights / Discover

**Performance > Web Vitals 페이지**에 프로젝트별 p75 LCP·INP·CLS·FCP·TTFB가 노출된다. 각 메트릭은 0–100 점수(log-normal 분포)로 환산돼 Performance Score로 합산.

**Discover/Insights 쿼리 패턴** — 두 release를 사이드 바이 사이드 비교:

```
event.type:transaction
release:[v1.2.0, v1.2.1]
```

Y축: `p75(measurements.lcp)`, `p75(measurements.inp)`, `p75(measurements.cls)`
X축: `release` 또는 `timestamp`

> 주의: Discover에서 사용 가능한 measurements 키는 SDK 버전에 따라 다르다. 8.x 기준 `measurements.lcp`, `measurements.cls`, `measurements.inp`, `measurements.fcp`, `measurements.ttfb` 가 표준이다.

---

## 5. Datadog RUM 설정 및 비교

### 5-1. 초기화 (`@datadog/browser-rum` v7.x)

```ts
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: process.env.DD_APPLICATION_ID!,
  clientToken: process.env.DD_CLIENT_TOKEN!,
  site: 'datadoghq.com',          // 또는 datadoghq.eu, ap1.datadoghq.com 등
  service: 'web-frontend',
  env: 'production',
  version: process.env.APP_VERSION,   // ★ 배포 비교의 키
  sessionSampleRate: 100,          // 100% 세션 수집
  sessionReplaySampleRate: 20,
  trackResources: true,
  trackLongTasks: true,
  trackUserInteractions: true,     // INP·click 자동 수집
  defaultPrivacyLevel: 'mask-user-input',
});
```

> 주의 (버전 의존): INP 메트릭은 `@datadog/browser-rum` **v5.1.0** 이상에서 지원. LCP subparts는 v6.32.0+, INP subparts는 v6.33.0+. v2.2.0+ 부터 Core Web Vitals 자체는 수집된다.

### 5-2. view 이벤트 필드 (RUM Explorer 쿼리 키)

Core Web Vitals는 RUM **view event**에 다음 필드로 저장된다:

| 메트릭 | view 필드 (속성 경로) | 타겟 요소 셀렉터 |
|--------|--------------------|----------------|
| LCP | `@view.largest_contentful_paint` | `@view.largest_contentful_paint_target_selector` |
| INP | `@view.interaction_to_next_paint` | `@view.interaction_to_next_paint_target_selector` |
| CLS | `@view.cumulative_layout_shift` | `@view.cumulative_layout_shift_target_selector` |

### 5-3. 배포 전후 비교 — RUM Explorer 쿼리

기본 검색 문법: `@속성:값` 형태.

```
# v1.2.0의 LCP 분포
@type:view @version:1.2.0

# v1.2.0과 v1.2.1만 비교 (in 연산자)
@type:view @version:(1.2.0 OR 1.2.1)

# LCP가 2.5s 초과한 페이지뷰만 (ms 단위)
@type:view @view.largest_contentful_paint:>2500

# INP 200ms 초과 + v1.2.1만
@type:view @version:1.2.1 @view.interaction_to_next_paint:>200
```

집계: Explorer에서 *Group by `@version`* + *Measure p75(`@view.largest_contentful_paint`)* 로 release별 p75 사이드 바이 사이드.

> 주의: 특수문자(`?`, `>`, `<`, `:`, `=`, `"`, `~`, `/`, `\`)가 포함된 값은 따옴표 또는 `\` 이스케이프. 예: `@version:"1.2.0-rc.1"`.

### 5-4. Web App Performance Dashboard

OOTB 대시보드가 LCP·INP·CLS의 p75를 Google 한계값과 함께 표시한다. region·device·browser로 필터 가능. 별도 설정 없이 RUM SDK 초기화만 하면 동작.

---

## 6. 배포 전후 비교 패턴 (실전)

### 6-1. 표준 워크플로

1. **Pre-deploy baseline 확보** — 배포 직전 24~72시간 p75 값을 기록
2. **Canary/점진 배포** — 5% → 25% → 100% 식. 각 단계 1~2시간 관찰
3. **Post-deploy 측정 윈도우** — 배포 후 최소 24h (트래픽 분포 안정화)
4. **비교 메트릭**:
   - p75 LCP·INP·CLS (Google 표준)
   - p95도 함께 — 꼬리 위험 탐지
   - "poor" 비율의 변동 — 25% → 28%면 회귀 의심
5. **Statistical significance** — 표본이 작으면(< 1,000 세션) p75 변동이 노이즈일 수 있다

### 6-2. release 태그 명명 규칙 (Sentry·Datadog 공통)

- semver + 빌드 SHA: `1.2.0+abc1234` (Sentry)
- semver만: `1.2.0` (Datadog `version`)
- 절대 피할 것: `latest`, `current`, 빈 문자열 — 두 release가 하나로 뭉쳐 비교 불가

### 6-3. 알람 (드리프트 자동 탐지)

- **Sentry**: Performance Alert → "p75 LCP > 2.5s for 1h" + release 단위 조건
- **Datadog**: RUM Monitor → `p75:@view.largest_contentful_paint{env:production,version:LATEST}` > 2500

---

## 7. 흔한 함정

### 7-1. 트래픽 분포 차이 (가장 자주 놓침)

배포 시점의 **시간대·디바이스·지역 mix**가 다르면 p75가 흔들린다. 예:
- 오전 배포 → 데스크톱 비중 ↑ → LCP p75 좋아 보임
- 저녁 배포 → 모바일 비중 ↑ → 같은 코드인데 p75 나빠 보임

**대처**: device·country를 facet으로 분리해서 동일 조건끼리 비교. Datadog는 `@device.type`, Sentry는 `device.family`.

### 7-2. 표본 크기 부족

세션 500개 미만이면 p75는 신뢰 구간이 넓다. 사이트 트래픽이 작으면 7일 평균으로 비교한다.

### 7-3. INP 측정 시점 — SPA에서 누락 위험

INP는 **페이지 hidden 전환 시점**에 확정된다. SPA에서 라우트만 바꾸고 페이지를 떠나지 않는 사용자는 INP가 보고되지 않는다.
- Sentry는 `browserTracingIntegration`이 SPA navigation을 자동 인식
- Datadog는 view를 자동 분리하므로 view 단위로 INP 계산
- 직접 `web-vitals`로 수집 시 visibilitychange 리스너 필수

### 7-4. SPA hidden state — bfcache 복원

`bfcache`로 복원된 페이지는 LCP·CLS가 다시 0부터 시작한다. `web-vitals` v3+는 자동 처리하지만, 직접 백엔드로 보낼 때는 `navigationType: 'back-forward-cache'`를 분리해서 본다.

### 7-5. Background tab

백그라운드에서 열린 페이지(새 탭 cmd+click)는 LCP·INP가 신뢰성 없다. Datadog는 백그라운드 페이지의 LCP·INP를 수집하지 않는다고 명시.

### 7-6. Privacy 모드 / Ad Blocker

브라우저 추적 방지·uBlock 사용자는 RUM payload가 차단된다. RUM 수치는 항상 **차단당하지 않는 사용자 분포**라는 점을 인지.

### 7-7. tracesSampleRate × interactionsSampleRate 곱셈

Sentry에서 두 옵션을 모두 0.1로 설정하면 INP 실제 캡처율은 **1%**(0.1 × 0.1). 트래픽 작은 사이트에서 INP 데이터가 너무 적으면 `interactionsSampleRate: 1.0`으로 올린다.

### 7-8. Release 누락 → "Unknown" 묶임

`Sentry.init`에 `release`를 주지 않거나 Datadog에 `version`을 비우면 모든 트래픽이 한 묶음으로 들어가 비교 불가. CI에서 빌드 단계에 환경변수 주입 필수.

---

## 8. 언제 이 스킬을 쓰면 안 되는가

- **개발 단계 단일 측정** — Lighthouse·DevTools가 충분
- **백엔드 latency 비교** — APM(트랜잭션)이지 RUM이 아님
- **표본이 극히 작은 내부 도구** — 통계적 유의성 확보 불가, 사용자 인터뷰가 효율적

---

## 9. 체크리스트

배포 전후 비교를 시작하기 전 확인할 항목:

- [ ] `web-vitals` 라이브러리 또는 Sentry/Datadog SDK 둘 중 하나 설치
- [ ] release/version 환경변수가 CI에서 정확히 주입되는가
- [ ] SDK가 device·country·browser facet을 자동 수집하는가
- [ ] 배포 후 최소 24h 측정 윈도우를 확보했는가
- [ ] p75와 p95를 모두 보는가
- [ ] poor 비율 변동을 모니터링하는가
- [ ] 알람이 release 단위로 작동하는가
