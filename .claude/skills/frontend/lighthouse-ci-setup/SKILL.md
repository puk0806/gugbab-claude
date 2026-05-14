---
name: lighthouse-ci-setup
description: >
  Lighthouse CI(@lhci/cli)로 PR마다 성능 회귀를 자동 감지하는 설정 스킬.
  collect / assert / upload 3단계 구조, lighthouserc 설정, GitHub Actions 통합, Core Web Vitals 임계치 정의를 포함한다.
  <example>사용자: "PR마다 LCP·CLS 회귀를 잡고 싶어"</example>
  <example>사용자: "lighthouserc.json에서 performance 카테고리 0.9 미만이면 빌드 실패시키려면?"</example>
  <example>사용자: "lighthouse CI 점수가 매번 흔들리는데 어떻게 안정화하지?"</example>
---

# Lighthouse CI 설정과 Core Web Vitals 회귀 감지

> 소스:
> - Lighthouse CI 공식 레포: https://github.com/GoogleChrome/lighthouse-ci
> - Getting Started: https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md
> - Configuration: https://googlechrome.github.io/lighthouse-ci/docs/configuration.html
> - treosh/lighthouse-ci-action: https://github.com/treosh/lighthouse-ci-action
> - Core Web Vitals: https://web.dev/articles/vitals
> - TBT 임계치(Chrome for Developers): https://developer.chrome.com/docs/lighthouse/performance/lighthouse-total-blocking-time
>
> 검증일: 2026-05-14
> 기준 버전: `@lhci/cli@0.15.1` (2025-06-26 릴리즈), `treosh/lighthouse-ci-action@v12`
> Node.js: 18 이상 권장 (공식 quick-start에서 `node-version: 18` 사용)

---

## 1. Lighthouse CI 개요 — collect / assert / upload

Lighthouse CI(LHCI)는 4개 하위 명령으로 구성된다.

| 명령 | 역할 |
|------|------|
| `lhci collect` | Lighthouse를 N회 실행해 결과(LHR)를 `.lighthouseci/`에 저장 |
| `lhci assert` | 저장된 결과를 임계치와 비교, 실패 시 non-zero exit |
| `lhci upload` | 결과를 storage 또는 LHCI Server로 업로드 |
| `lhci autorun` | 위 3단계를 sensible defaults로 한 번에 실행 |

CI에서 가장 흔히 쓰는 형태는 `lhci autorun` 단일 호출이며, 동작은 `lighthouserc.json` 또는 `lighthouserc.js`로 제어한다.

설치:

```bash
npm install --save-dev @lhci/cli@0.15.x
# 또는 글로벌
npm install -g @lhci/cli@0.15.x
```

---

## 2. `lighthouserc.json` 기본 구조

레포 루트에 다음 파일을 둔다.

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/"],
      "numberOfRuns": 3,
      "startServerCommand": "npm run start"
    },
    "assert": {
      "preset": "lighthouse:recommended"
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### collect 옵션

| 옵션 | 설명 |
|------|------|
| `url` | 감사할 URL 배열. `staticDistDir`와 함께 쓰면 포트가 로컬 서버 포트로 자동 치환됨 |
| `numberOfRuns` | URL당 반복 실행 횟수. **기본 3회.** "natural page variability" 완화를 위함 |
| `startServerCommand` | LHCI가 collect 전에 실행할 서버 기동 셸 명령 |
| `staticDistDir` | 빌드 산출물(정적 파일) 디렉토리. 내장 서버가 자동 기동 |
| `settings.preset` | `"mobile"` (기본) 또는 `"desktop"` — 디바이스 에뮬레이션 |
| `settings.throttlingMethod` | `"devtools"` (실제 throttle) 또는 시뮬레이션 |
| `settings.chromeFlags` | `"--disable-gpu --no-sandbox"` 등 CI 환경 플래그 |

### Next.js / SPA 예시

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/login",
        "http://localhost:3000/dashboard"
      ],
      "numberOfRuns": 3,
      "startServerCommand": "npm run build && npm run start",
      "settings": {
        "preset": "desktop",
        "chromeFlags": "--no-sandbox"
      }
    }
  }
}
```

### 정적 빌드(예: Vite, CRA build/) 예시

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "url": ["/index.html", "/about"],
      "numberOfRuns": 3
    }
  }
}
```

---

## 3. 측정 지표와 Core Web Vitals 관계

### 3-1. Core Web Vitals (필드 메트릭 — 실제 사용자 데이터 기준)

2026-05 기준 web.dev 공식 정의:

| 메트릭 | 측정 대상 | Good | Needs Improvement |
|--------|-----------|:---:|:---:|
| **LCP** (Largest Contentful Paint) | 로딩 — 뷰포트 내 가장 큰 콘텐츠 표시 시각 | ≤ **2.5s** | > 2.5s |
| **INP** (Interaction to Next Paint) | 인터랙티비티 — FID 대체 (2024-03) | ≤ **200ms** | > 200ms |
| **CLS** (Cumulative Layout Shift) | 시각적 안정성 — 누적 레이아웃 이동 | ≤ **0.1** | > 0.1 |

> 평가 기준: 모바일/데스크탑 분리, **75th percentile** 페이지 로드.

### 3-2. Lighthouse 랩 메트릭 (LHCI가 직접 측정)

Lighthouse는 *실험실 환경*에서 다음 6개 지표를 측정하며, 이 중 LCP/CLS는 Core Web Vitals와 직접 일치하고 나머지는 *지원·진단용*이다.

| 메트릭 | 의미 | Good (모바일 기준) | Lighthouse 가중치 |
|--------|------|:---:|:---:|
| **FCP** First Contentful Paint | 첫 콘텐츠 렌더 — 사용자가 "뭔가 그려졌다" 인지 | ≤ 1.8s | **10%** |
| **LCP** Largest Contentful Paint | 가장 큰 콘텐츠 렌더 (CWV와 동일) | ≤ 2.5s | **25%** |
| **TBT** Total Blocking Time | FCP~TTI 사이 메인 스레드 차단 시간 (50ms 초과분 합) — INP의 *랩 프록시* | ≤ 200ms | **30%** |
| **CLS** Cumulative Layout Shift | 누적 레이아웃 이동 (CWV와 동일) | ≤ 0.1 | **25%** |
| **Speed Index** | 페이지 콘텐츠 시각적 표시 속도 | ≤ 3.4s | **10%** |
| **TTI** Time to Interactive | 메인 스레드가 *연속적으로* 안정될 때까지 시간 | — | 가중치 0 (Lighthouse 10부터 점수 제외) |

> **주의:** TTI는 Lighthouse 10부터 가중치에서 제외됐다 (점수에는 반영 안 됨). 그러나 audit ID `interactive`로 여전히 측정·assertion 가능하다.

> **주의:** Lighthouse 점수 가중치(TBT 30%·LCP 25%·CLS 25%·FCP 10%·SI 10%)는 web.dev/DebugBear 기준이며 Lighthouse 메이저 버전 업데이트 시 변경될 수 있다. 최신값은 [공식 Scoring Calculator](https://googlechrome.github.io/lighthouse/scorecalc/)로 확인.

### 3-3. 관계 요약

```
Core Web Vitals (현장 메트릭, RUM)        Lighthouse 랩 메트릭 (LHCI)
─────────────────────────────────         ──────────────────────────
LCP   ───────────────────────────────►   LCP        (동일)
INP   ─── 랩 프록시 ─────────────────►   TBT        (TBT가 낮으면 INP도 양호 경향)
CLS   ───────────────────────────────►   CLS        (동일)
                                          FCP        (LCP 진단용)
                                          Speed Index (시각적 완료 속도)
                                          TTI        (참고)
```

LHCI는 랩 환경 측정이므로 CWV와 정확히 일치하지 않지만, *회귀를 PR 단계에서 잡는* 용도로 충분하다. 실제 사용자 CWV는 CrUX/RUM으로 별도 모니터링한다.

---

## 4. Assertions — baseline 임계치 설정

### 4-1. preset 선택

```json
{ "ci": { "assert": { "preset": "lighthouse:recommended" } } }
```

| Preset | 의미 |
|--------|------|
| `lighthouse:all` | 모든 audit이 만점 (1.0) 요구 — 사실상 통과 불가, 비추천 |
| `lighthouse:recommended` | 카테고리 점수 0.9 미만이면 경고 — 현실적 baseline |
| `lighthouse:no-pwa` | recommended에서 PWA audit 제외 |

대부분 `lighthouse:recommended` + 프로젝트별 override 패턴을 쓴다.

### 4-2. 카테고리 점수 assertion

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }]
      }
    }
  }
}
```

레벨:
- `"off"` — 검사 안 함
- `"warn"` — stderr 출력만, exit code는 0 (CI 통과)
- `"error"` — stderr 출력 + non-zero exit (CI 실패)

### 4-3. 메트릭별 임계치 (실전 baseline 예시)

```json
{
  "ci": {
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],

        "first-contentful-paint":   ["error", { "maxNumericValue": 2000, "aggregationMethod": "optimistic" }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500, "aggregationMethod": "optimistic" }],
        "total-blocking-time":      ["error", { "maxNumericValue": 300,  "aggregationMethod": "pessimistic" }],
        "cumulative-layout-shift":  ["error", { "maxNumericValue": 0.1,  "aggregationMethod": "optimistic" }],
        "speed-index":              ["warn",  { "maxNumericValue": 3000, "aggregationMethod": "median" }],
        "interactive":              ["warn",  { "maxNumericValue": 5000, "aggregationMethod": "optimistic" }]
      }
    }
  }
}
```

### 4-4. aggregationMethod 선택

`numberOfRuns: 3` 같은 다회 실행에서 어떤 값을 채택할지 정의:

| 값 | 의미 | 권장 사용처 |
|----|------|-------------|
| `"median"` | 중앙값 | 일반 메트릭 기본값 |
| `"optimistic"` | 가장 통과하기 쉬운 값 (가장 낮은 시간/높은 점수) | FCP/LCP 같은 *상한*을 너그럽게 보고 싶을 때 |
| `"pessimistic"` | 가장 통과하기 어려운 값 (가장 높은 시간/낮은 점수) | TBT 같은 *variance 큰* 메트릭의 worst-case 보호 |
| `"median-run"` | 메디안 run의 전체 값 (메트릭별 분리 X) | 일관된 시나리오 비교 |

기본 동작은 `{ aggregationMethod: "optimistic", minScore: 1 }`이다.

---

## 5. GitHub Actions 통합

### 5-1. treosh/lighthouse-ci-action 사용 (커뮤니티 표준, v12 기준)

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on:
  pull_request:
    branches: [main]

jobs:
  lhci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npm run build

      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v12
        with:
          configPath: ./lighthouserc.json
          uploadArtifacts: true
          temporaryPublicStorage: true
```

action 입력 옵션:

| 입력 | 용도 |
|------|------|
| `urls` | 줄바꿈으로 구분된 URL 목록 (configPath 없이 단독 사용 가능) |
| `configPath` | `lighthouserc.json/js` 경로 (전체 제어) |
| `budgetPath` | 성능 budget JSON 경로 |
| `runs` | URL당 실행 횟수 (기본 1 — action 측 기본값) |
| `uploadArtifacts` | 결과를 GitHub Actions artifact로 저장 (기본 false) |
| `temporaryPublicStorage` | Google Cloud 임시 storage 업로드 (기본 false) |
| `serverBaseUrl` / `serverToken` | private LHCI Server 연동 |

> **주의:** action의 `runs` 기본값은 1이지만, "single run에 대한 assertion은 flaky하다"고 README가 명시한다. configPath로 `numberOfRuns: 3` 이상을 권장한다.

### 5-2. 공식 quick-start 방식 (action 미사용)

```yaml
jobs:
  lhci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - run: npm install -g @lhci/cli@0.15.x
      - run: lhci autorun
```

### 5-3. PR baseline 회귀 감지

`treosh/lighthouse-ci-action`은 별도 baseline 비교 기능을 제공하지 않는다. baseline 회귀 감지는 두 방식 중 선택한다.

1. **LHCI Server 사용** — `upload.target: "lhci"` + base 브랜치 빌드 결과와 자동 비교 (Bitbucket/GitHub status check 통합)
2. **assertions 임계치 사용** — `maxNumericValue`/`minScore`를 baseline 수치로 박아두고 PR마다 검증 (가장 간단)

회귀를 *수치 비교*가 아닌 *임계치 위반*으로 잡는 방식이 가장 운영 부담이 적다.

---

## 6. 결과 업로드 — temporary-public-storage vs LHCI Server

```json
{
  "ci": {
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

| target | 특성 | 추천 사용처 |
|--------|------|-------------|
| `"temporary-public-storage"` | Google Cloud 임시 storage, **수일 후 자동 삭제, 공개 URL** | 초기 도입·POC·OSS 프로젝트 |
| `"lhci"` | LHCI Server 인스턴스에 영구 저장, base 브랜치 비교 가능 | 팀 운영, baseline 추적 필요 |
| `"filesystem"` | 로컬 파일만 출력 | CI에서 artifact로 따로 보관 |

### LHCI Server 사용 시

```json
{
  "ci": {
    "upload": {
      "target": "lhci",
      "serverBaseUrl": "https://lhci.example.com",
      "token": "build-token-from-wizard"
    }
  }
}
```

`lhci wizard new-project`로 server에 프로젝트 생성 후 받는 token을 GitHub Secrets로 주입한다.

> **주의:** `temporary-public-storage`로 올린 결과는 *공개 URL*로 노출된다. 비공개 사이트 audit 결과는 LHCI Server 또는 `filesystem` + private artifact로 처리한다.

---

## 7. 흔한 함정

### 7-1. variance 큰 메트릭은 numberOfRuns 3+ 필수

TBT/LCP는 CI 머신 부하·네트워크 jitter에 민감하다. `numberOfRuns: 1`로 assert하면 *false positive*가 빈발한다.

```json
{ "collect": { "numberOfRuns": 3 } }   // 최소
{ "collect": { "numberOfRuns": 5 } }   // 안정성 우선
```

`aggregationMethod: "median"` 또는 `"pessimistic"`(TBT)과 조합한다.

### 7-2. CI 머신 사양 차이

GitHub Actions의 `ubuntu-latest` runner는 사양이 일정하지 않고 측정값이 ±10~20% 흔들린다.

- assertion 임계치는 *현재 best run 기준이 아니라 평균보다 약간 여유 있게* 설정
- 절대값 비교보다 *카테고리 점수* assertion이 더 안정적
- 가능하면 self-hosted runner 또는 *전용 perf 환경*에서 측정

### 7-3. 네트워크 throttling

기본 preset은 *모바일 3G simulated throttling*이다. CI 환경에 따라 실제 네트워크 latency가 추가로 끼면 결과가 더 나빠진다.

```json
{
  "collect": {
    "settings": {
      "throttlingMethod": "simulate",     // Chrome 내부 시뮬레이션 (재현성 ↑)
      "throttling": {
        "rttMs": 150,
        "throughputKbps": 1638.4,
        "cpuSlowdownMultiplier": 4
      }
    }
  }
}
```

`"devtools"` (실제 적용)는 머신마다 결과가 달라질 수 있어 CI에서는 `"simulate"`가 더 재현 가능하다.

### 7-4. 모바일/데스크탑 분리

모바일과 데스크탑은 임계치가 완전히 다르다. 한 lighthouserc에 섞지 말고 **별도 파일** 또는 **별도 job**으로 분리한다.

```yaml
jobs:
  lhci-mobile:
    steps:
      - uses: treosh/lighthouse-ci-action@v12
        with:
          configPath: ./lighthouserc.mobile.json
  lhci-desktop:
    steps:
      - uses: treosh/lighthouse-ci-action@v12
        with:
          configPath: ./lighthouserc.desktop.json
```

### 7-5. startServerCommand가 종료되지 않는 문제

`startServerCommand`는 LHCI가 *백그라운드*로 띄우고 collect 후 SIGTERM으로 종료한다. 다음 명령은 LHCI가 종료를 인식 못해 hang 한다:

- `npm run dev` (변경 감지 watcher 무한 실행) — `next start`/`vite preview` 같은 *production 서버* 사용
- 포어그라운드 셸을 점유하는 명령 — `&` 백그라운드화 금지 (LHCI가 stdout으로 ready 감지)

`startServerReadyPattern`(정규식)으로 ready 신호를 명시할 수도 있다.

```json
{
  "collect": {
    "startServerCommand": "npm run start",
    "startServerReadyPattern": "started server on"
  }
}
```

### 7-6. PR 머지 전에만 실패시키기

`assert`에서 `"error"`로 설정한 항목이 main 브랜치에서 실패하면 deploy 파이프라인이 막힌다. PR 단계에서만 차단하려면:

```yaml
on:
  pull_request:        # PR에서만 실행
    branches: [main]
# push: main 에는 등록하지 않음 → main 머지 후 회귀가 있어도 deploy는 진행
```

또는 main 브랜치에서는 `"warn"`으로 다운그레이드하는 별도 config를 둔다.

---

## 8. 체크리스트

스킬 적용 시 확인 사항:

- [ ] `@lhci/cli@0.15.x` 또는 그 이상 설치
- [ ] `lighthouserc.json`에 `numberOfRuns >= 3`
- [ ] `assert.preset: "lighthouse:recommended"` + 카테고리/메트릭 override
- [ ] TBT는 `aggregationMethod: "pessimistic"`
- [ ] 모바일/데스크탑 config 분리
- [ ] CI에서 `startServerCommand`가 production 서버 사용 (dev 서버 X)
- [ ] PR trigger만 사용 (main push 차단은 별도 정책)
- [ ] 결과 업로드 — POC면 `temporary-public-storage`, 팀 운영이면 LHCI Server
