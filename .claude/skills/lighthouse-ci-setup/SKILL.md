---
name: lighthouse-ci-setup
description: >
  Lighthouse CI(@lhci/cli) 최신 버전 기준 — 0.16.0 브레이킹 체인지(Lighthouse 13 audit ID 대체·Node 22.19+ 필수),
  treosh/lighthouse-ci-action v12 내장 lhci(^0.15.1)와의 차이, 0.16 직접 설치 GitHub Actions 예시.
  <example>사용자: "lhci 0.16으로 올렸더니 Node 20 러너에서 실패해"</example>
  <example>사용자: "treosh action으로 돌리면 Lighthouse 13 기준으로 측정돼?"</example>
  <example>사용자: "0.16 업그레이드 후 커스텀 assertion 결과가 비어 있어"</example>
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
> 검증일: 2026-11-09 (최초 2026-05-14) — @lhci/cli **0.16.0**(2026-11-02, Lighthouse 13.6.0 탑재·Node 22.19+ 필수)로 갱신, treosh action v12.6.2(내장 lhci는 아직 ^0.15.1)·Core Web Vitals 임계치(LCP 2.5s/INP 200ms/CLS 0.1) 변동 없음
> 기준 버전: `@lhci/cli@0.16.0` (2026-11-02 릴리즈, 내장 Lighthouse 13.6.0), `treosh/lighthouse-ci-action@v12` (최신 12.6.2 — 내장 `@lhci/cli ^0.15.1`, Lighthouse 12 계열)
> Node.js: **22.19 이상 필수** (`@lhci/cli@0.16.0` package.json `engines.node: ">=22.19.0"`, 공식 getting-started 예시 `node-version: 22.x`)
>
> **주의 (0.16.0 브레이킹 체인지):** ① 내장 Lighthouse가 13.6.0으로 올라가며, Lighthouse 13에서 *구 진단 audit 다수가 insight audit로 대체·제거*됐다(예: `layout-shifts`→`cls-culprits-insight`, `render-blocking-resources`→`render-blocking-insight`, `uses-long-cache-ttl`·`first-meaningful-paint` 등 제거). 구 audit ID로 쓴 커스텀 assertion은 결과가 없어 무의미해지므로 0.16 업그레이드 시 assertion ID를 점검한다. 성능 점수 계산 방식(메트릭 가중치)은 바뀌지 않았다 ② 최소 Node 22. Node 18/20 러너에서 0.16을 쓰면 설치·실행이 실패하므로 0.15.x에 고정하거나 Node를 올린다.

---

## 1. Lighthouse CI 개요 — collect / assert / upload

설치:

```bash
npm install --save-dev @lhci/cli@0.16.x
# 또는 글로벌
npm install -g @lhci/cli@0.16.x
# Node 22 미만 환경이면 0.15.x 유지 (0.16은 Node >=22.19 필수)
```

---

## 4. Assertions — baseline 임계치 설정

### 4-1. preset 선택

| Preset | 의미 |
|--------|------|
| `lighthouse:all` | 모든 audit이 만점 (1.0) 요구 — 사실상 통과 불가, 비추천 |
| `lighthouse:recommended` | 성능 외 audit은 만점 요구(error), 흔들리는 성능 메트릭은 점수 90 미만이면 경고(warn) — 현실적 baseline. **카테고리 점수 assertion은 들어 있지 않으므로** 4-2처럼 직접 추가한다 |
| `lighthouse:no-pwa` | recommended에서 PWA audit 제외 |

---

## 5. GitHub Actions 통합

### 5-1. treosh/lighthouse-ci-action 사용 (커뮤니티 표준, v12 기준)

> **주의:** treosh action 12.6.2는 자체 의존성으로 `@lhci/cli ^0.15.1`(Lighthouse 12 계열)을 쓴다. Lighthouse 13 기준으로 측정하려면 5-2처럼 `@lhci/cli@0.16.x`를 직접 설치해 `lhci autorun`을 실행한다. action이 0.16을 반영했는지는 action 릴리즈 노트로 확인한다.

### 5-2. 공식 quick-start 방식 (action 미사용)

```yaml
jobs:
  lhci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }   # 0.16은 Node >=22.19 필수 (공식 예시: 22.x)
      - run: npm ci
      - run: npm run build
      - run: npm install -g @lhci/cli@0.16.x
      - run: lhci autorun
```

---

## 8. 체크리스트

스킬 적용 시 확인 사항:

- [ ] `@lhci/cli@0.16.x` 설치 (Node 22.19+). Node 22 미만이면 `0.15.x`
- [ ] 커스텀 assertion에 Lighthouse 13에서 제거된 구 audit ID가 없는지 확인
