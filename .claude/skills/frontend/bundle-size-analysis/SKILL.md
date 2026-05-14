---
name: bundle-size-analysis
description: 프론트엔드 번들 크기 측정·시각화·비교 방법론 — raw/gzip/brotli 차이, rollup-plugin-visualizer · vite-bundle-visualizer · webpack-bundle-analyzer 사용법, size-limit CI 임계치, 청크별 변경 전후 보고서 작성
---

# 프론트엔드 번들 크기 분석 (Bundle Size Analysis)

> 소스:
> - rollup-plugin-visualizer: https://github.com/btd/rollup-plugin-visualizer
> - vite-bundle-visualizer: https://github.com/KusStar/vite-bundle-visualizer
> - webpack-bundle-analyzer: https://github.com/webpack-contrib/webpack-bundle-analyzer
> - size-limit: https://github.com/ai/size-limit
>
> 검증일: 2026-05-14
> 버전 기준: rollup-plugin-visualizer 7.0.1 (2026-03-03) / vite-bundle-visualizer 1.2.1 / size-limit 12.1.0 (2026-04-13)

이 스킬은 **측정·비교 방법론**을 다룬다. 분할 *전략*은 `vite-advanced-splitting` 스킬을 참조한다.

---

## 1. raw / gzip / brotli — 무엇을, 언제 봐야 하나

번들 크기는 *하나*의 숫자가 아니다. 측정 시점에 따라 의미가 완전히 다르므로 **상황에 맞는 지표**를 봐야 한다.

### 1-1. 세 가지 지표의 정의

| 지표 | 의미 | 측정 방법 |
|------|------|-----------|
| **raw (=stat / parsed)** | 압축 *전* 디스크 상 바이트 수 | minify 직후 파일 크기. webpack-bundle-analyzer에서는 `stat`(원본) / `parsed`(minify 후) 구분 |
| **gzip** | gzip 압축 후 전송 크기 | minified 산출물을 gzip으로 다시 압축 |
| **brotli** | brotli 압축 후 전송 크기 | minified 산출물을 brotli로 다시 압축. 일반적으로 gzip 대비 15~20% 작음 |

### 1-2. 언제 어떤 지표를 보나

| 관심사 | 봐야 할 지표 | 이유 |
|--------|--------------|------|
| **실제 사용자 다운로드 시간** | brotli (대부분 CDN 기본) → 없으면 gzip | 모든 모던 CDN(Cloudflare, Vercel, Netlify)이 brotli 자동 전송 |
| **JS parse / execute 시간** | raw (parsed) | 브라우저는 압축 해제 후 *raw* 크기를 파싱한다. 모바일 저사양 기기에서는 parse 시간이 다운로드보다 길 수 있다 |
| **트리쉐이킹 효과 측정** | stat vs parsed 비교 | stat이 크고 parsed가 작으면 minifier가 잘 제거한 것 |
| **CI 회귀 검출 임계치** | brotli | 실 사용자 영향과 가장 직결 |

> **주의:** 단순히 "번들이 1MB"라고 보고하면 모호하다. *어떤 지표인지* 항상 명시한다. 예: `vendor.js — 850 KB (raw) / 280 KB (gzip) / 240 KB (brotli)`.

### 1-3. webpack-bundle-analyzer의 3가지 size 차이

webpack-bundle-analyzer는 *동일 모듈*에 대해 세 값을 모두 보여준다:

- **Stat**: webpack stats 객체의 원본 source 크기 (minify 전, 트리쉐이킹 전)
- **Parsed**: 실제 산출 번들 파일에서 해당 모듈이 차지하는 크기 (minify 후)
- **Gzip / Brotli**: parsed 산출물을 *모듈별로 개별* gzip/brotli 압축한 크기

> **주의:** 모듈별 개별 압축이므로 *합산이 실제 파일 gzip 크기와 1:1 일치하지 않는다*. 전체 파일 단위 압축이 인접 모듈끼리 사전을 공유해 더 작아지기 때문이다. 회귀 임계치는 *전체 파일*의 gzip/brotli로 잡는다.

---

## 2. rollup-plugin-visualizer (Vite / Rollup 내장 플러그인)

Vite·Rollup 빌드에 플러그인으로 끼워 매 빌드마다 자동 리포트를 생성하는 방식.

### 2-1. 설치 & 기본 설정

```bash
npm install -D rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      template: 'treemap',  // 기본값
      gzipSize: true,        // ★ 기본 false — 반드시 켜야 gzip 표시
      brotliSize: true,      // ★ 기본 false — 반드시 켜야 brotli 표시
      open: false,           // CI에서는 false, 로컬은 true 권장
    }),
  ],
})
```

> **주의:** `gzipSize`·`brotliSize` 기본값은 둘 다 `false`다. 켜지 않으면 raw 크기만 표시되어 *실 전송 크기를 못 본다*. 항상 켠다.

### 2-2. 주요 옵션

| 옵션 | 기본값 | 용도 |
|------|--------|------|
| `filename` | `stats.{ext}` (template에 따라 결정) | 출력 파일 경로 |
| `template` | `'treemap'` | `sunburst` / `treemap` / `treemap-3d` / `network` / `flamegraph` / `raw-data` (JSON) / `list` (YAML) |
| `gzipSize` | `false` | gzip 크기 계산 포함 |
| `brotliSize` | `false` | brotli 크기 계산 포함 |
| `sourcemap` | `false` | sourcemap을 사용해 *원본 소스* 기준 크기 계산 (정확하나 느림) |
| `open` | `false` | 빌드 후 브라우저 자동 열기 |
| `projectRoot` | `process.cwd()` | 모듈 경로 표시 시 잘라낼 prefix |

### 2-3. 시각화 형식 선택

| 템플릿 | 보기 좋은 상황 |
|--------|--------------|
| `treemap` (기본) | 청크별 모듈 크기 *비율*을 한눈에. 가장 자주 사용 |
| `sunburst` | 디렉토리 계층 구조 강조. `node_modules/@org/pkg/...` 깊이가 중요할 때 |
| `network` | "왜 이 모듈이 포함됐는가?" — import 그래프 추적용 |
| `raw-data` | JSON 출력 → 자체 스크립트로 후처리·diff 가능 |
| `flamegraph` | 트리쉐이킹 분석. 상단 = 진입점, 하단 = 깊은 의존성 |

### 2-4. 환경 요구사항

> **주의:** rollup-plugin-visualizer 7.x는 **Node.js ≥ 22**를 요구한다. 더 낮은 Node 버전을 쓰는 프로젝트는 6.x 계열로 핀 고정한다.

---

## 3. vite-bundle-visualizer (CLI, config 수정 없이)

`vite.config.ts`를 *건드리지 않고* 일회성 분석을 할 때 쓰는 CLI. 내부적으로 rollup-plugin-visualizer를 사용한다.

### 3-1. 기본 사용

```bash
# 프로젝트 루트에서 한 줄로 실행 — stats.html 생성 후 브라우저 자동 오픈
npx vite-bundle-visualizer

# 출력 경로 지정 + 브라우저 안 열기 (CI 용도)
npx vite-bundle-visualizer -o analysis/bundle.html --open false

# JSON 데이터로 추출 (diff·자동 비교용)
npx vite-bundle-visualizer -t raw-data -o stats.json

# sunburst + sourcemap 기반 정확한 크기
npx vite-bundle-visualizer -t sunburst --sourcemap
```

### 3-2. CLI 플래그

| 플래그 | 단축 | 기본값 | 용도 |
|--------|------|--------|------|
| `--template` | `-t` | `treemap` | `treemap` / `sunburst` / `network` / `raw-data` / `list` |
| `--output` | `-o` | `stats.html` | 출력 파일 경로 (`.html` 또는 `.json`) |
| `--open` | — | `true` | 빌드 후 브라우저 자동 오픈 |
| `--config` | `-c` | (Vite 기본 탐색) | 커스텀 Vite config 파일 지정 |
| `--entry` / `--input` | `-i` | `index.html` | 진입점 파일 |
| `--sourcemap` | — | (off) | sourcemap 기반 정확 측정 |
| `--mode` | `-m` | `production` | Vite mode |

### 3-3. 언제 CLI vs 플러그인

| 상황 | 선택 |
|------|------|
| 빌드마다 자동 리포트가 필요 (PR 첨부 등) | 플러그인 (`rollup-plugin-visualizer`) |
| 일회성 조사, config를 더럽히기 싫음 | CLI (`vite-bundle-visualizer`) |
| `npm scripts`로 `analyze` 만들 때 | 두 방식 모두 가능. CLI가 더 가볍다 |

---

## 4. webpack-bundle-analyzer (Webpack / CRA / Next.js 등)

Webpack 빌드에 플러그인으로 끼워 interactive treemap을 띄운다.

### 4-1. 설치 & 플러그인 설정

```bash
npm install -D webpack-bundle-analyzer
```

```js
// webpack.config.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  // ...
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',      // 'server' | 'static' | 'json' | 'disabled'
      reportFilename: 'report.html',
      openAnalyzer: false,         // CI에서는 false
      generateStatsFile: true,     // stats.json 함께 생성 → CI에서 후처리 가능
      defaultSizes: 'gzip',        // 'stat' | 'parsed' | 'gzip' | 'brotli' | 'zstd' (기본 'parsed')
    }),
  ],
}
```

### 4-2. analyzerMode 선택

| 값 | 동작 | 용도 |
|----|------|------|
| `server` (기본) | 빌드 후 HTTP 서버 띄우고 브라우저 오픈 | 로컬 개발 |
| `static` | 정적 HTML 파일 생성 | CI·PR 첨부 |
| `json` | JSON 데이터만 생성 | 자체 diff 스크립트 |
| `disabled` | 분석 안 함 (stats.json만 생성하고 싶을 때) | `generateStatsFile: true`와 조합 |

### 4-3. defaultSizes — 기본 표시 지표

`-s, --default-sizes <type>` CLI 옵션·플러그인 옵션으로 treemap에서 *처음* 보여줄 크기 지표를 정한다. 기본은 `parsed`(=minified raw). 회귀 추적 용도면 `gzip` 또는 `brotli`로 바꿔둔다.

### 4-4. CRA / Next.js 통합

```bash
# CRA: 빌드 후 stats.json을 보고 분석
npm run build -- --stats
npx webpack-bundle-analyzer build/bundle-stats.json

# Next.js: 공식 @next/bundle-analyzer 사용 (내부적으로 webpack-bundle-analyzer)
npm install -D @next/bundle-analyzer
# next.config.js에서 withBundleAnalyzer 래핑 후 ANALYZE=true npm run build
```

---

## 5. 청크별 변경 전후 비교 보고서 형식

분할 전략을 바꾸거나 의존성을 추가/제거했을 때 *변경 전후*를 비교하는 markdown 표.

### 5-1. 표준 형식

```markdown
## 번들 크기 변화 — {변경 요약}

| 청크 | Before (gzip) | After (gzip) | Δ | Before (brotli) | After (brotli) | Δ |
|------|---------------|--------------|---|------------------|----------------|---|
| `react-vendor` | 45.2 KB | 45.3 KB | +0.1 KB | 38.9 KB | 39.0 KB | +0.1 KB |
| `chart-vendor` | 180.5 KB | 0 KB | **-180.5 KB** | 155.2 KB | 0 KB | **-155.2 KB** |
| `chart-vendor.lazy` | 0 KB | 178.1 KB | +178.1 KB (lazy) | 0 KB | 152.8 KB | +152.8 KB (lazy) |
| `app` | 320.8 KB | 142.1 KB | **-178.7 KB** | 275.4 KB | 122.6 KB | **-152.8 KB** |
| **초기 로드 합계** | **546.5 KB** | **187.4 KB** | **-359.1 KB (-65.7%)** | **469.5 KB** | **161.6 KB** | **-307.9 KB (-65.6%)** |

### 측정 조건
- Vite 6.x production build, brotli 압축
- 측정 도구: `vite-bundle-visualizer -t raw-data` → JSON 파싱
- 측정일: 2026-05-14
```

### 5-2. 보고서 작성 원칙

1. **단일 지표만 쓰지 않는다** — gzip·brotli 둘 다 표기 (CDN 따라 다름)
2. **초기 로드 vs lazy 분리** — lazy chunk 증가는 초기 로드와 별개
3. **합계와 % 명시** — 절대값만으로는 영향 가늠 어려움
4. **측정 조건 footnote** — 빌드 mode, 측정 도구, 측정일
5. **node_modules 단일 청크 피하기** — `vendor.js` 하나에 합치면 청크별 분석 자체가 불가능 (`vite-advanced-splitting` 스킬 참조)

---

## 6. CI 임계치 — size-limit

PR마다 자동으로 번들 크기를 체크하고 초과 시 CI fail시키는 *performance budget* 도구.

### 6-1. 설치 & 기본 설정

```bash
npm install -D size-limit @size-limit/preset-app
```

```json
// package.json
{
  "scripts": {
    "size": "size-limit"
  },
  "size-limit": [
    {
      "name": "Initial load",
      "path": "dist/assets/index-*.js",
      "limit": "200 KB"
    },
    {
      "name": "React vendor",
      "path": "dist/assets/react-vendor-*.js",
      "limit": "50 KB"
    },
    {
      "name": "App entry — execution time",
      "path": "dist/assets/index-*.js",
      "limit": "300 ms",
      "running": true
    }
  ]
}
```

### 6-2. 핵심 동작

- **기본 압축: brotli** — `gzip: true`로 gzip으로 전환, `brotli: false`로 비압축 측정도 가능
- **limit 단위 2종**:
  - 바이트 단위 (`"200 KB"`, `"1 MB"`) — 파일 크기
  - 시간 단위 (`"300 ms"`, `"1 s"`) — 헤드리스 브라우저로 실 실행 시간 측정 (preset-app 필요)
- **glob 지원** — `dist/assets/index-*.js`처럼 해시 들어간 파일 매칭
- **`--why` 플래그** — 한도 초과 시 Statoscope로 원인 분석

### 6-3. GitHub Actions 통합

```yaml
# .github/workflows/size.yml
name: size
on: [pull_request]
jobs:
  size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

> 이 액션은 PR 코멘트로 변경 전후 크기를 자동 표기하고, limit 초과 시 PR 체크를 fail시킨다.

### 6-4. 대안 도구

| 도구 | 특징 |
|------|------|
| `size-limit` | brotli 기본, 실행 시간까지 측정 (preset-app), CI 통합 강력 |
| `bundlesize` | 단순 gzip 크기만 체크. 비유지보수 상태에 가까움 |
| `preactjs/compressed-size-action` | size-limit 없이 PR 코멘트만 — 임계치 강제 안 함 |
| `bundlewatch` | bundlesize 대체. config 유연 |

신규 프로젝트는 **size-limit + GitHub Action** 조합이 표준이다.

---

## 7. 흔한 함정

### 7-1. node_modules 단일 청크화

```typescript
// 안티패턴 — 모든 vendor를 한 청크로
manualChunks: {
  vendor: ['react', 'react-dom', 'lodash', '@mui/material', 'chart.js', ...],
}
```

**문제:**
- 작은 의존성 하나 추가해도 전체 vendor 캐시 무효화
- 청크별 크기 분석이 *불가능* — visualizer가 "vendor.js: 1.2 MB"만 표시
- 초기 로드와 lazy 분리 불가

**대안:** 패키지명 기반 자동 분할 (`vite-advanced-splitting` 스킬 참조)

### 7-2. sourcemap 포함 측정 오류

`dist/` 폴더 통째로 측정하면 `.map` 파일까지 합산해 크기가 *부풀어 보인다*.

```bash
# 잘못된 측정
du -sh dist/   # → 8.5 MB (sourcemap 포함)

# 올바른 측정 — .js / .css만
find dist -name '*.js' -o -name '*.css' | xargs du -c | tail -1
# → 1.2 MB
```

`size-limit`은 자동으로 `.map` 제외하므로 안전. visualizer 도구도 sourcemap 자체는 측정 대상에서 제외하나, `sourcemap: true` 옵션을 켰을 때만 *번들 안의 원본 소스 위치*를 추적한다 (sourcemap 파일 크기를 더하는 것이 아님).

### 7-3. duplicate dependency

`react`가 두 버전 들어가거나, `lodash`와 `lodash-es`가 동시 존재하는 경우. visualizer treemap에서 *같은 이름의 모듈이 여러 청크에 나타나면* duplicate 의심.

**진단:**
```bash
npm ls react        # 두 줄 이상 나오면 duplicate
npm dedupe          # 자동 정리 시도
```

Vite의 경우 `resolve.dedupe` 설정으로 강제 단일화:
```typescript
export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})
```

### 7-4. dev build로 분석

```bash
# 잘못된 분석 — dev 빌드는 minify·트리쉐이킹 없음
npx vite-bundle-visualizer -m development

# 올바른 — production (기본값)
npx vite-bundle-visualizer  # -m production 자동
```

dev 빌드 크기는 production의 3~10배 — 절대값을 보고 놀라지 않는다.

### 7-5. gzip 합산을 전체 파일 gzip으로 착각

webpack-bundle-analyzer의 gzip 컬럼은 *모듈별 개별 gzip*. 청크별 합산해도 실제 *파일* gzip 크기와 다르다 (앞의 1-3 참조). CI 임계치는 *파일 단위* gzip/brotli를 잡아주는 size-limit이 더 정확하다.

### 7-6. 한 번의 측정으로 결론 내기

번들러 캐시·CDN 캐시 영향으로 측정값이 빌드마다 ±수 KB 흔들린다. 의미 있는 변화는 **여러 빌드의 평균** 또는 **고정 빌드 환경(같은 lockfile, 같은 Node 버전)** 에서만 신뢰 가능. CI에서 size-limit이 안정적인 이유다.

### 7-7. raw 크기만 보고 안심하기

"800 KB → 600 KB로 줄었네!"가 raw 기준이면 *실 사용자 영향은 미미*할 수 있다. gzip/brotli 기준으로는 250 KB → 230 KB일 수 있음. **항상 brotli 기준으로도 환산해서 보고**한다.

---

## 8. 권장 워크플로우

1. **초기 도입**: `rollup-plugin-visualizer` 또는 `webpack-bundle-analyzer`를 `npm run analyze` 스크립트로 등록
2. **현황 파악**: treemap 한 번 띄워 *상위 5개* 큰 모듈 확인 → 정말 필요한지 검토
3. **분할 결정**: `vite-advanced-splitting` 스킬 참조해 manualChunks 설계
4. **변경 전후 비교**: 섹션 5의 markdown 표 형식으로 PR 설명에 첨부
5. **CI 임계치 도입**: `size-limit` + GitHub Action으로 회귀 자동 차단
6. **주기적 재검토**: 의존성 메이저 업그레이드 후 visualizer 재실행 → duplicate / 신규 비대화 확인
