---
name: dev-server-hmr-benchmarking
description: >
  Vite·Webpack·Rsbuild 등 dev 서버의 cold start와 HMR(Hot Module Replacement)
  지연을 정량적으로 측정하는 방법론. hyperfine·Chrome DevTools Performance·
  Vite HMR API(import.meta.hot)를 활용한 자동·수동 측정 절차와 측정 함정 정리.
---

# Dev 서버 Cold Start · HMR 벤치마킹

> 소스:
> - Vite HMR API: https://vite.dev/guide/api-hmr
> - Vite Features: https://vite.dev/guide/features
> - Vite Dep Pre-Bundling: https://vite.dev/guide/dep-pre-bundling
> - Webpack DevServer: https://webpack.js.org/configuration/dev-server/
> - Chrome DevTools Performance reference: https://developer.chrome.com/docs/devtools/performance/reference
> - hyperfine: https://github.com/sharkdp/hyperfine
> - chokidar: https://github.com/paulmillr/chokidar
>
> 검증일: 2026-09-28 (최초 2026-05-14)
>
> **주의 (ADD, Vite 8/Rolldown 확인 결과):** Vite 8(2026-03 출시)은 dep pre-bundling 엔진을 esbuild → Rolldown(Rust)으로, JS 변환·minify를 esbuild → Oxc로 교체했다. 그러나 공식 마이그레이션 가이드(https://vite.dev/guide/migration)에는 dev 서버 cold start 시간·HMR 지연의 구체적 수치 변화가 명시돼 있지 않으며, 캐시 디렉터리(`node_modules/.vite/deps/`)·`--force` 옵션 동작·`vite:beforeUpdate`/`vite:afterUpdate` HMR 클라이언트 이벤트는 8.x에서도 그대로 유지된다(공식 문서 기준 확인). 따라서 본 스킬의 측정 방법론(섹션 2·3)은 Vite 8 프로젝트에도 수정 없이 적용 가능하다. 다만 `import.meta.hot.accept`에 **URL을 직접 넘기는 방식은 8.0에서 제거**됐고 id를 넘겨야 하므로(본 스킬 예시는 `hot.on(...)`만 사용해 영향 없음), 이 패턴을 확장해 쓰는 경우 주의한다. > 주의: dev 서버 체감 속도·HMR 지연 수치(예: "200ms→20ms") 를 주장하는 일부 서드파티 블로그 글이 있으나 공식 문서로 확인되지 않아 본 스킬에는 반영하지 않았다 — 실측은 반드시 섹션 2·3 방법론으로 직접 측정해 보고한다.

---

## 1. 측정 대상 정의

dev 서버 성능은 두 축으로 나눠 측정한다. 한쪽만 좋은 도구도 있으므로 반드시 분리한다.

| 지표 | 정의 | 단위 |
|------|------|------|
| **Cold start** | `node_modules/.vite` 등 캐시가 비어 있는 상태에서 dev 서버 명령 실행 → 첫 페이지가 인터랙티브해질 때까지 | ms |
| **Warm start** | 캐시가 존재하는 상태에서 dev 서버 명령 실행 → 첫 페이지가 인터랙티브해질 때까지 | ms |
| **HMR update latency** | 소스 파일 저장 → 브라우저 모듈 교체 완료까지 | ms |
| **Full reload latency** | HMR 경계를 못 넘어 전체 새로고침이 발생하는 변경의 반영 시간 | ms |

---

## 2. Cold start 측정 — hyperfine

`hyperfine`은 명령어 단위 통계 벤치마크 도구다. `--prepare`로 매 실행 전 캐시를 정리하면 cold start를 안정적으로 잴 수 있다.

### 2.1 기본 패턴

```bash
hyperfine \
  --runs 10 \
  --warmup 0 \
  --prepare 'rm -rf node_modules/.vite' \
  --shell zsh \
  'pnpm vite --port 5173 & sleep 5 && kill %1'
```

- `--prepare`: 각 측정 전에 실행되어 캐시 디렉터리(`node_modules/.vite`)를 비운다.
- `--warmup 0`: cold start 측정이므로 워밍업 실행을 0회로 둔다.
- `--runs 10`: 기본 최소 10회. 분산이 크면 늘린다.

> 주의: 단순히 `vite` 프로세스가 종료될 때까지 측정하면 dev 서버가 계속 떠 있어 측정이 종료되지 않는다. 위 예시처럼 `sleep N && kill %1`로 강제 종료하거나, "Server ready" 로그가 찍힐 때까지만 대기하는 래퍼 스크립트를 만든다.

### 2.2 정확한 "ready" 시점만 측정하는 래퍼 스크립트

`vite`/`webpack serve` 모두 "ready" 라인을 stdout에 출력한다. 이 시점까지만 측정한다.

```bash
#!/usr/bin/env bash
# bench-cold.sh (macOS/Linux 겸용 — 아래 "검증" 주의 참고)
set -uo pipefail

now_ms() { python3 -c 'import time; print(int(time.time()*1000))'; }

START=$(now_ms)

# Vite ready 라인 매칭 후 종료
pnpm vite --port 5173 2>&1 | while IFS= read -r line; do
  echo "$line"
  if [[ "$line" =~ ready\ in ]]; then
    END=$(now_ms)
    echo "COLD_START_MS=$((END - START))"
    pkill -P $$ -f "vite" || true
    break
  fi
done
exit 0
```

hyperfine과 결합:

```bash
hyperfine --runs 10 --prepare 'rm -rf node_modules/.vite' \
  --export-markdown cold-start.md \
  './bench-cold.sh'
```

> 검증 (2026-09-28, macOS 27.0 + hyperfine 1.20.0 실제 실행): 원래 예시의 `date +%s%3N`은 **GNU date 전용**이다. macOS(BSD date)는 `%N`을 인식하지 못해 리터럴 `N`이 그대로 붙어(`1790556416163N`) `$((END - START))` 산술 연산이 `value too great for base` 에러로 즉시 실패한다 — 위 코드는 `python3` 기반 `now_ms()`로 대체해 macOS/Linux 모두에서 동작하도록 정정했다. 또한 원래 예시에는 `exit 0`이 없어서, `pkill`로 vite를 강제 종료한 뒤 파이프의 마지막 종료 코드가 그대로 스크립트 종료 코드가 되어(SIGTERM → 143) `set -e`/`hyperfine` 양쪽에서 "실패"로 처리된다 — hyperfine 기본 동작상 **`--ignore-failure` 없이 위 명령을 그대로 실행하면 첫 실행에서 즉시 에러 처리**된다. `exit 0`을 추가해 "정상적으로 ready 감지 후 의도적으로 종료"와 "빌드 자체 실패"를 구분되게 했다.

### 2.3 도구별 캐시 위치

| 도구 | 캐시 디렉터리 | --force 옵션 |
|------|---------------|--------------|
| Vite | `node_modules/.vite/deps/` | `vite --force` |
| Webpack (filesystem cache) | `node_modules/.cache/webpack/` | 해당 디렉터리 삭제 |
| Rsbuild/Rspack | `node_modules/.cache/.rsbuild/` | 해당 디렉터리 삭제 |
| Next.js | `.next/cache/` | `.next/` 전체 삭제 |

> 검증: Vite는 lockfile·patches·`vite.config.js`·NODE_ENV가 바뀌면 자동으로 재번들링하므로 `--force`나 직접 삭제 둘 다 cold 상태를 보장한다.

### 2.4 비교 벤치마크

```bash
hyperfine --runs 5 --prepare 'rm -rf node_modules/.vite node_modules/.cache' \
  --export-markdown compare.md \
  'pnpm vite --port 5173 & sleep 8 && kill %1' \
  'pnpm webpack serve --port 5174 & sleep 30 && kill %1'
```

---

## 3. HMR update latency 측정

세 가지 방법이 있다. 정확도와 자동화 가능성에 따라 선택한다.

### 3.1 Vite HMR API로 정밀 측정 (권장)

`import.meta.hot.on('vite:beforeUpdate' | 'vite:afterUpdate')` 이벤트의 시간차로 측정한다. 두 이벤트 모두 클라이언트에서 모듈 교체 직전·직후에 발화된다.

```ts
// src/hmr-bench.ts
if (import.meta.hot) {
  let beforeTime = 0;

  import.meta.hot.on('vite:beforeUpdate', (payload) => {
    beforeTime = performance.now();
    // payload.updates: { type, path, acceptedPath, timestamp }[]
    console.log('[HMR] beforeUpdate', payload.updates);
  });

  import.meta.hot.on('vite:afterUpdate', (payload) => {
    const elapsed = performance.now() - beforeTime;
    console.log(`[HMR] update latency: ${elapsed.toFixed(1)}ms`, payload.updates);
  });

  import.meta.hot.on('vite:error', (err) => {
    console.error('[HMR] error', err);
  });
}
```

- `vite:beforeUpdate`: 업데이트 적용 직전
- `vite:afterUpdate`: 업데이트 적용 직후
- `payload.updates[i].timestamp`: 서버가 변경을 감지한 시각(ms)

> 주의: 위 측정 값은 *클라이언트 측 모듈 교체 시간*이다. 파일 저장 → 서버 감지 시간은 `Date.now() - payload.updates[0].timestamp`로 별도 계산하면 서버 + 네트워크 구간 지연을 분리할 수 있다.

### 3.2 dev 서버 로그 파싱

Vite는 HMR 업데이트마다 `hmr update /path/to/file.tsx` 형태 로그를 stdout에 찍는다(모듈 수에 따라 `(x+y modules)` 접미사가 붙는 경우도 있음). 로그 라인 사이 시간차로 대략적인 throughput을 잴 수 있다.

> **주의 (검증, 2026-09-28 실제 실행 확인 — 차단급 전제조건)**: 이 로그는 **WebSocket으로 연결된 클라이언트(브라우저 탭)가 최소 1개 있어야만** 찍힌다. dev 서버만 띄우고 아무 브라우저도 페이지를 열지 않은 상태에서 소스 파일을 저장하면, 파일 워처는 변경을 감지해도 stdout에 `hmr update` 로그가 **전혀 출력되지 않는다**(직접 재현: 브라우저 미연결 상태 2회 시도 모두 로그 0줄, Chrome으로 페이지를 연 직후 동일 파일 수정 시 즉시 `hmr update /src/App.tsx` 로그 출력 확인). 따라서 이 방법을 완전 자동화(CLI만으로, 브라우저 없이)하려는 시도는 **동작하지 않는다** — 최소한 헤드리스든 아니든 브라우저 탭 1개를 열어 WS 핸드셰이크를 성사시킨 뒤 파일을 수정해야 한다. 이 조건을 충족하면 "파일 저장 시각"과 "로그 라인이 stdout에 도달한 시각"의 차이로 지연을 측정할 수 있으며(자체 실행 20회 측정: median 87ms, 12~116ms 범위), §3.1의 클라이언트 측 모듈 교체 시간과는 다른 지표(서버 감지+로그 출력까지)임에 유의한다.

Webpack/Rsbuild는 `stats.timings: true`로 빌드 시간을 stdout에 노출한다.

```js
// webpack.config.js
module.exports = {
  stats: {
    timings: true,
    builtAt: true,
    preset: 'minimal',
  },
};
```

CLI는 `webpack serve --stats verbose` 또는 `--stats normal`.

### 3.3 수동 stopwatch (가장 단순, 정확도 낮음)

자동화가 어려운 환경(IDE 통합, Webview 등)에서는 다음을 측정한다.

- 저장 단축키 누르는 시각 → 브라우저 UI에 변경이 반영된 시각
- Chrome DevTools Performance 패널 녹화 동시 실행으로 보정

---

## 4. Chrome DevTools Performance 패널 활용

브라우저 측 리소스 처리·JS 실행·렌더링까지 포함한 종단 측정.

### 4.1 측정 절차

1. `F12` → **Performance** 탭 열기.
2. **Capture settings** 아이콘 → 다음 설정:
   - **Network throttling**: No throttling (벤치마크는 환경 고정)
   - **CPU throttling**: No throttling 또는 측정 시나리오에 맞춰 4x slowdown
   - **Screenshots**: 체크 (변경 반영 시점을 시각적으로 확인)
   - **Memory**: 메모리 누수 검증 시에만 체크
3. **Record** 버튼 클릭 (cold start는 **Record and reload** 사용).
4. HMR 시나리오는 측정 중 IDE에서 소스 파일 저장.
5. 변경이 브라우저에 반영되면 Stop.

### 4.2 분석 트랙

| 트랙 | 측정 항목 |
|------|-----------|
| **Main** | HMR 페이로드 수신 후 모듈 평가·React 리렌더링 등 메인 스레드 작업 |
| **Network** | `/@vite/client` WebSocket, 변경된 모듈 fetch 시간 |
| **Frames** | 렌더링 프레임 누락(Dropped) 여부 |
| **Interactions** | 사용자 상호작용 + INP 경고 |

분석 탭:
- **Bottom-up**: 누적 시간이 가장 큰 활동 파악
- **Call tree**: 호출 트리로 병목 함수 추적
- **Event log**: 시간 순서로 모듈 교체 순서 확인

### 4.3 trace 저장·공유

`Save trace` 버튼으로 `.json`을 내려받아 팀과 공유하거나 회귀 비교에 사용한다.

---

## 5. 통합 시나리오 — Vite 프로젝트 cold start + HMR 동시 측정

```bash
# 1. Cold start 10회 측정
hyperfine --runs 10 \
  --prepare 'rm -rf node_modules/.vite' \
  --export-markdown bench/cold-start.md \
  './scripts/bench-cold.sh'

# 2. dev 서버 띄우고 HMR API 시드 컴포넌트 활성화
pnpm vite

# 3. 다른 터미널에서 파일 N회 자동 수정
node scripts/touch-file.mjs --target src/App.tsx --runs 20 --interval 1500

# 4. 브라우저 콘솔의 [HMR] update latency 로그 평균·표준편차 집계
```

`touch-file.mjs` 예시:

```js
// scripts/touch-file.mjs
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';

const target = path.resolve(process.argv[3]);
const runs = Number(process.argv[5] ?? 10);
const interval = Number(process.argv[7] ?? 1000);

for (let i = 0; i < runs; i++) {
  const content = fs.readFileSync(target, 'utf8');
  fs.writeFileSync(target, content + `\n// touch ${Date.now()}\n`);
  await wait(interval);
}
```

---

## 6. 측정 시 흔한 함정

### 6.1 파일 시스템 워처 차이

| 환경 | 워처 구현 | 주의점 |
|------|-----------|--------|
| macOS | FSEvents (`fsevents`) | 디렉터리 단위 이벤트. 128 워처 제한 케이스 존재 |
| Linux | inotify | `fs.inotify.max_user_watches`가 낮으면 누락 |
| Windows native | ReadDirectoryChangesW | 일반 케이스 OK |
| WSL2 + `/mnt/c/...` | inotify가 NTFS 이벤트 못 받음 | **WSL2 홈 디렉터리(ext4)로 프로젝트 이동 필수** |
| Docker 컨테이너 + macOS/Windows 마운트 | FSEvents·ReadDirectoryChanges가 컨테이너 안에 안 전달됨 | `CHOKIDAR_USEPOLLING=true` 또는 `WATCHPACK_POLLING=true` |

> 주의: 폴링을 켜면 HMR 지연이 polling interval만큼 늘어난다(`usePolling: true, interval: 100` 기본). 벤치마크는 폴링 on/off를 분리 보고한다.

### 6.2 캐시·node_modules 영향

- `node_modules/.vite/deps` 잔존 시 cold이 아닌 warm 측정이 된다 → `--prepare`로 매번 삭제.
- pnpm/yarn berry는 `.pnpm/`·`.yarn/cache/` 자체는 dev 서버 cold에 영향이 적지만, 첫 install 직후 측정은 OS page cache 효과로 더 빠르다 → 측정 전 `--warmup 1` 또는 충분히 idle 후 측정.

### 6.3 백그라운드 프로세스·전원 상태

- 노트북: 전원 모드 변동(저전력 ↔ 고성능)으로 ±30% 분산 → 측정 중 전원 연결 + 성능 모드 고정.
- macOS: Spotlight 인덱싱·Time Machine 백업이 동시 진행되면 fsevents 큐가 밀린다.
- 다른 dev 서버·테스트 러너 종료 후 측정.

### 6.4 첫 페이지 요청까지 포함 여부

"ready in" 로그 시점과 "첫 페이지 인터랙티브 시점"은 다르다. SPA에서 entry 모듈 transform이 cold일 때 첫 요청에 수백 ms~수 초가 더 걸린다. 둘을 별도 지표로 보고한다:

- `dev_ready_ms`: 서버가 listen 시작한 시점까지
- `first_paint_ms`: Chrome Performance "First Contentful Paint"까지
- `tti_ms`: Time to Interactive

### 6.5 측정 자체가 측정 대상을 흔든다

- DevTools Performance 녹화 중에는 페이지가 5~10% 느려진다 → 자동화 벤치(`hyperfine`)와 DevTools 녹화는 별도 세션에서 진행.
- `--inspect` flag·source map 옵션 변동도 cold start에 영향 → 측정 vite.config는 고정해 두고 변동 변수만 바꿔서 비교.

### 6.6 측정 횟수와 통계

- 최소 10회 (cold) / 30회 (HMR)
- hyperfine은 평균·중앙값·표준편차·min/max를 모두 출력한다. **중앙값**을 1차 지표로 보고하고 표준편차/IQR로 노이즈 평가.
- 단일 측정값은 보고하지 않는다.

---

## 7. 보고 템플릿

```md
## Cold start (n=10, median)

| 도구 | median (ms) | stdev (ms) | min | max |
|------|------|------|------|------|
| Vite 8.x | 820 | 45 | 760 | 910 |
| Webpack 5.x | 24,300 | 1,800 | 22,100 | 27,500 |

조건: macOS 14, M2 Pro, Node 22.x, 캐시 매 실행 전 삭제, 전원 연결.

## HMR update latency (n=30, median)

| 시나리오 | client-side (ms) | server-detect (ms) |
|----------|------|------|
| Vite + React SFC props 변경 | 32 | 8 |
| Webpack + React-Refresh | 480 | 120 |
```

---

## 언제 사용 / 사용하지 않을지

**사용:**
- 빌드 도구 마이그레이션(예: Webpack → Vite) 전후 정량 비교
- 모노레포 패키지 추가 후 dev 환경 회귀 감시
- CI에서 dev 서버 cold start 회귀 검출

**사용하지 않음:**
- 단순한 체감 비교(눈으로 봐도 명확한 경우) — 측정 셋업 비용 대비 이득 없음
- 프로덕션 빌드 시간 측정 — 별도 도구(빌드 stats, esbuild meta) 사용

---

## 핵심 정리

| 단계 | 도구 | 출력 |
|------|------|------|
| Cold start | `hyperfine --prepare 'rm -rf node_modules/.vite'` | ms (n회 중앙값) |
| HMR latency (정밀) | Vite `import.meta.hot.on('vite:beforeUpdate'\|'vite:afterUpdate')` | ms (client-side) |
| HMR latency (대략) | dev 서버 stdout (`hmr update`, `stats.timings`) | ms |
| 종단 분석 | Chrome DevTools Performance (Record and reload, Main/Network/Frames track) | trace.json |
| 환경 변수 통제 | 워처(FSEvents/inotify/polling), 캐시 위치, 전원 모드 | 측정 메타데이터 |
