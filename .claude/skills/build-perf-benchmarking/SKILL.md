---
name: build-perf-benchmarking
description: >
  프론트엔드 빌드 시간·번들 크기·dev 서버(cold start·HMR) 측정 시 모델이 놓치기 쉬운 최신 변경점과 실측 함정.
  hyperfine 2.0.0 파괴적 변경(셸 기본 없음·JSON 스키마 v2·삭제 옵션), warmup/prepare 차이, 도구별 캐시 위치,
  size-limit 13·14 Node 요건 변경, rollup-plugin-visualizer 7.x(Vite 8 타입 수정·gzip 기본 꺼짐), 모듈별 gzip 합 ≠ 파일 gzip,
  Next.js 16 Turbopack 분석기, Vite 8 Rolldown 사전 번들링, dev 서버 측정 미종료·HMR 로그 조건 함정, 지표 명시 규칙과 최소 보고 형식.
  <example>사용자: "vite 빌드 최적화 PR 전후 빌드 시간을 어떻게 비교해야 정확한가?"</example>
  <example>사용자: "hyperfine으로 turborepo cold build 측정하려는데 warmup은 몇 번?"</example>
  <example>사용자: "이번 PR로 vendor 청크가 얼마나 커졌는지 비교해줘"</example>
---

# 빌드·번들·dev 서버 성능 측정 — 최신 변경점·실측 함정

> 소스:
> - hyperfine 공식 GitHub: https://github.com/sharkdp/hyperfine
> - hyperfine man page: https://www.mankier.com/1/hyperfine
> - Vite 캐시 가이드: https://vite.dev/guide/dep-pre-bundling
> - Turborepo 캐싱 가이드: https://turborepo.dev/docs/crafting-your-repository/caching
>
> - hyperfine v2.0.0 릴리스 노트: https://github.com/sharkdp/hyperfine/releases/tag/v2.0.0
> - 번들 크기: https://github.com/btd/rollup-plugin-visualizer · https://github.com/KusStar/vite-bundle-visualizer · https://github.com/webpack/webpack-bundle-analyzer · https://github.com/ai/size-limit · https://nextjs.org/docs/app/guides/package-bundling (구 bundle-size-analysis, 검증일 2026-11-09)
> - dev 서버: https://vite.dev/guide/api-hmr · https://vite.dev/guide/features · https://vite.dev/guide/migration · https://webpack.js.org/configuration/dev-server/ · https://developer.chrome.com/docs/devtools/performance/reference · https://github.com/paulmillr/chokidar (구 dev-server-hmr-benchmarking, 검증일 2026-11-09)
>
> 검증일: 2026-11-09 (최초 2026-05-14, 직전 2026-09-28)
> 대상 버전: **hyperfine v2.0.0** (2026-10-07 릴리즈), 리포트 예시는 Vite v8.3.1(2026-03 Rolldown 기반 출시) 기준
> 번들 도구 버전 기준(구 bundle-size-analysis): rollup-plugin-visualizer 7.1.3 (2026-11-08) / vite-bundle-visualizer 1.2.1 / size-limit 14.3.0 (2026-10-22) / webpack-bundle-analyzer 5.4.2

---

## 1. 지표 명시 규칙 — 숫자 하나로 보고하지 않는다

- **빌드 시간**: 1회 `time pnpm build`는 캐시·CPU 상태로 ±30% 흔들린다. 다회 측정 후 **median + p95**(mean 은 outlier 에 민감). 최소 5회 미만은 통계적 의미가 약하다.
- **cold / warm 를 한 표에 섞지 않는다** — 별도 측정·별도 표.
- **번들 크기**: 항상 어떤 지표인지 붙인다 — `vendor.js — 850 KB (raw) / 280 KB (gzip) / 240 KB (brotli)`. 전송은 brotli(없으면 gzip), JS parse 비용은 raw(parsed). 초기 로드와 lazy 청크를 분리한다.
- **dev 서버**: `dev_ready_ms`(“ready in” 로그) ≠ `first_paint_ms` ≠ `tti_ms` — 첫 요청 entry transform 이 cold 면 수백 ms~수 초 더 걸리므로 따로 보고. HMR 은 client-side(모듈 교체)와 server-detect(저장→감지)를 분리.
- before/after 는 같은 머신·같은 세션. 측정 조건(머신·OS·Node·도구 버전·cold/warm·runs/warmup·전원·백그라운드)을 적지 않은 결과는 비교 불가.

## 2. hyperfine v2.0.0 파괴적 변경

> 주의: **v2.0.0 에 파괴적 변경이 있다.** ① 측정 명령을 기본으로 셸 없이 직접 실행(`--shell=none`) ② `--export-json` 스키마 v2 ③ `--time-unit/-u`·`--sort`·`--reference` 삭제 ④ Markdown·CSV export 열 변경. v1.x(예: 1.20.0)를 쓰고 있다면 아래 예시의 `-S`·JSON 경로·export 열이 다르다 — `hyperfine --version` 으로 먼저 확인한다.

- `&&`·`>`·`&`·`$VAR`·`NODE_ENV=production pnpm build`·`*`·`~` 가 들어간 명령은 **`-S`(= `--shell=default`) 또는 `--shell zsh` 필수** — 빠뜨리면 hyperfine 이 셸 선택을 요구하며 멈춘다. 환경 변수만 필요하면 v2 신규 `--env 'K=V'`. (v1.x 는 반대로 기본이 셸이었다.)
- `--setup/--prepare/--conclude/--cleanup` 은 `--shell=none` 이어도 **항상 셸로 실행** — `rm -rf ...` 정리 명령은 그대로.
- 삭제: `--time-unit` → `--metrics time_wall_clock:ms`, `--sort`, `--reference`/`--reference-name` → **첫 번째 명령이 항상 기준**. 신규 `--metrics M[:UNIT],…`(기본 = 경과 시간 + 최대 메모리, 프리셋 `default`/`time`/`all`).
- JSON v2: `results[i].mean` → `results[i].summary.time_wall_clock.{mean,stddev,median,min,max}`, `times` → `measurements[j].time_wall_clock.value`. 시간은 초, 메모리는 바이트. run 1회면 `stddev` 는 `null`. CSV 는 `time_wall_clock_median` 같은 `_mean/_stddev/_median/_min/_max` 열.
- p95/p99 는 기본 출력이 없다(공식 p95 스크립트도 없음) → `measurements` 로 직접 계산:

```python
r = json.load(open("result.json"))["results"][0]
times = [m["time_wall_clock"]["value"] for m in r["measurements"]]
print(r["summary"]["time_wall_clock"]["median"], np.percentile(times, 95))
```

- markdown export 는 `| Command | Mean Wall Time [s] | Change | Factor |`(주 지표 하나) — v1.x 의 `Mean/Min/Max/Relative` 형식이 아니다. median·p95 는 빠지므로 JSON 에서 뽑아 확장 표를 붙인다.
- 경고: v2.0.0 소스(`src/output/warnings.rs`)에는 **첫 run 이상치 경고 하나만** 남았다 — v1.x 의 "Statistical outliers were detected ..." 일반 경고는 없다(소스로 확인, v2 바이너리 실행으로는 재현하지 않음). 경고가 안 떠도 stddev 급증은 직접 확인한다.

## 3. warmup vs prepare — 의미가 정반대

> 주의: `--prepare`와 `--warmup`은 목적이 다르다. **warmup은 캐시를 채우려는 것**(warm build 측정 전 준비), **prepare는 캐시를 비우려는 것**(cold build 측정 전 매번 청소)이다. 혼동하면 측정값 의미가 정반대가 된다.

- `hyperfine 'pnpm build'`(warmup 0 + prepare 없음)는 첫 run 만 cold, 나머지 warm — 의미 불명. `--runs 30`만 늘려도 두 번째부터 turbo 캐시 hit.
- `--ignore-failure` 는 "10회 즉시 실패한 평균"을 숨긴다.
- warmup 횟수의 보편 권장값은 공식 문서에 없다(실용치: 빌드 < 5초면 3~5, 2분 이상이면 1 또는 생략).

| 도구 | cold 캐시 삭제 | 비고 |
|------|------------------|------|
| Vite | `rm -rf node_modules/.vite dist` | 대안 `vite --force`. lockfile·patches·`vite.config`·NODE_ENV 변경 시 자동 재번들 |
| Turborepo | `rm -rf .turbo node_modules/.cache/turbo dist` | `--force` 는 캐시 읽기만 끄고 쓰기는 유지 |
| Next.js | `rm -rf .next` (dev 는 `.next/cache/`) | |
| tsc | `rm -f tsconfig.tsbuildinfo` | |
| Webpack | `rm -rf node_modules/.cache/webpack` | |
| Rsbuild/Rspack | `rm -rf node_modules/.cache/.rsbuild` | |

> Vite 8(Rolldown 기반)에서도 pre-bundle 캐시 위치(`node_modules/.vite`)와 `--force` 동작은 바뀌지 않았다 — 위 Vite 행을 그대로 쓴다(2026-09-28 공식 마이그레이션 가이드 https://vite.dev/guide/migration 대조, 바뀐 것은 dep pre-bundling 엔진 esbuild→Rolldown뿐). JS 변환·minify 는 esbuild → Oxc. 공식 가이드에 dev cold start·HMR 수치 변화는 명시돼 있지 않다 — 서드파티 블로그 수치("200ms→20ms" 등)는 > 주의: 미검증, 직접 측정해 보고한다.

- `drop_caches`(페이지 캐시 비우기)는 Linux 전용·sudo 필요. macOS·Windows 는 일반 사용자가 못 비운다 → 새 CI 머신·`docker --rm`.
- `git stash && pnpm build && git stash pop` 비교는 워킹트리 전환 오버헤드가 섞인다 → `git worktree add`로 분리.

## 4. 번들 크기 측정 함정

> **주의:** 모듈별 개별 압축이므로 *합산이 실제 파일 gzip 크기와 1:1 일치하지 않는다*. 전체 파일 단위 압축이 인접 모듈끼리 사전을 공유해 더 작아지기 때문이다. 회귀 임계치는 *전체 파일*의 gzip/brotli로 잡는다.

- webpack-bundle-analyzer 의 Stat(minify·트리쉐이킹 전) / Parsed(산출물 내 크기) / Gzip·Brotli(모듈별 개별 압축) — 위 이유로 Gzip 열 합산 금지. `defaultSizes` 기본은 `parsed`. 5.0 부터 Node 20.9 미만 지원 종료.

> **주의:** `gzipSize`·`brotliSize` 기본값은 둘 다 `false`다. 켜지 않으면 raw 크기만 표시되어 *실 전송 크기를 못 본다*. 항상 켠다. (rollup-plugin-visualizer)

> **주의:** rollup-plugin-visualizer 7.x는 **Node.js ≥ 22**를 요구한다. 더 낮은 Node 버전을 쓰는 프로젝트는 6.x 계열로 핀 고정한다.
>
> **주의 (Vite 8 사용자 필수):** 7.1.0 이전 버전은 배포된 타입 선언이 `rollup` 패키지를 직접 import하도록 되어 있어, `rollup`을 설치하지 않고 `rolldown`만 있는 프로젝트에서 타입이 `any`로 조용히 깨지거나(`skipLibCheck` 켠 경우) `TS2307`(모듈 찾을 수 없음) 에러가 났다. **Vite 8은 내부적으로 rolldown을 쓰고 `rollup`을 아예 설치하지 않으므로 Vite 8 프로젝트는 전원 영향받았다.** 7.1.0(2026-09)에서 수정됐다 — Vite 8 + TypeScript 조합이면 반드시 `rollup-plugin-visualizer@^7.1.0` 이상을 쓴다.

> 주의: size-limit 13.0.0에서 Node 20 지원이 종료됐고, 14.0.0(2026-09-15)에서 `@size-limit/preset-small-lib`가 기본 번들러를 `rolldown`으로 전환했다(`@size-limit/preset-app`은 대상 아님). 14.x는 Node 버전 요건이 `^22.19.0 || ^24.5.0 || >=26.0.0`으로 더 좁아졌다(구 22.x 전체 허용 아님 — 22.19 미만이면 CI 러너 업그레이드 필요). `size-limit` 설정 배열 문법·limit 단위·brotli 기본 압축은 12.x부터 변경 없이 그대로 유효하다. 14.1 `--ignore-missing`, 14.2 플러그인 타입, 14.3 주석 가능한 `.jsonc` 설정. 13.1.0부터 `rolldown`/`rolldown-why` 플러그인(preset-app 사용자에겐 선택).

- size-limit 은 **기본 brotli**, `.map` 자동 제외, 해시 파일 glob 매칭, 시간 limit(`"300 ms"` + `running: true`)은 preset-app 필요.
- `du -sh dist/` 는 sourcemap(`.map`)까지 합산해 부풀려진다 → `.js`/`.css`만.
- dev 빌드(`-m development`)로 분석하지 않는다 — minify·트리쉐이킹이 없어 3~10배.
- `manualChunks`로 node_modules 를 단일 `vendor`로 묶으면 청크별 분석 자체가 불가 + 작은 의존성 추가에도 캐시 전체 무효화.
- treemap 에 같은 모듈이 여러 청크에 보이면 duplicate 의심 → `npm ls react`, Vite `resolve.dedupe`.

> 주의 (2026-11-09): Next.js 16 은 기본 번들러가 Turbopack 이다. `@next/bundle-analyzer` 는 **Webpack 용** 플러그인이므로 Turbopack 빌드에는 `next analyze`(16.1+, `--output` 시 `.next/diagnostics/analyze` 저장)를 쓴다. 16.4+ 는 `next analyze export`.

## 5. dev 서버 cold start·HMR 측정 함정

> 주의: 단순히 `vite` 프로세스가 종료될 때까지 측정하면 dev 서버가 계속 떠 있어 측정이 종료되지 않는다. `sleep N && kill %1`로 강제 종료하거나, "Server ready" 로그가 찍힐 때까지만 대기하는 래퍼 스크립트를 만든다.

- 래퍼 스크립트 실측 함정(2026-09-28, macOS + hyperfine 1.20.0 실행): `date +%s%3N`은 **GNU date 전용** — macOS(BSD date)는 `%N`을 몰라 `1790556416163N` 이 되어 `$((END - START))` 가 `value too great for base` 로 실패 → `python3 -c 'import time; print(int(time.time()*1000))'`. 또 `pkill`로 vite 를 끊은 뒤 `exit 0` 이 없으면 SIGTERM 종료 코드(143)가 그대로 나가 hyperfine 이 첫 실행에서 실패 처리한다.
- `kill %1`·`&` 가 든 측정 명령은 v2 에서 `-S` 필수(§2). `./bench-cold.sh` 처럼 스크립트를 직접 실행하면 영향 없음.
- **Vite `hmr update ...` stdout 로그는 WebSocket 으로 연결된 브라우저 탭이 최소 1개 있어야만 찍힌다**(2026-09-28 직접 재현: 미연결 2회 모두 0줄, 탭 연결 후 즉시 출력). 브라우저 없이 CLI 만으로 HMR 을 자동 측정하는 시도는 동작하지 않는다. 이 방식의 값(서버 감지+로그 출력, 실측 20회 median 87ms)은 클라이언트 모듈 교체 시간과 다른 지표다.
- 정밀 측정은 `import.meta.hot.on('vite:beforeUpdate'|'vite:afterUpdate')` 시간차(client-side), 서버 구간은 `Date.now() - payload.updates[0].timestamp`. 두 이벤트·캐시 위치·`--force`는 Vite 8 에서도 유지. 단 **`import.meta.hot.accept`에 URL 을 넘기는 방식은 8.0 에서 제거** — id 를 넘긴다.
- 파일 워처: WSL2 의 `/mnt/c/...` 는 inotify 가 NTFS 이벤트를 못 받는다 → 프로젝트를 WSL2 홈(ext4)으로. Docker + macOS/Windows 마운트는 이벤트가 전달 안 됨 → `CHOKIDAR_USEPOLLING=true`/`WATCHPACK_POLLING=true`, 단 폴링 interval 만큼 HMR 이 늘어나므로 on/off 분리 보고. Linux `fs.inotify.max_user_watches` 가 낮으면 누락.
- DevTools Performance 녹화 중엔 페이지가 5~10% 느려진다 → hyperfine 자동 벤치와 별도 세션. 횟수는 cold 최소 10회, HMR 30회.
- 노트북 전원 모드 변동(±30%), Spotlight·Time Machine(fsevents 큐 밀림), thermal throttling(후반 run outlier) — 전원 연결·5분 idle·백그라운드 종료를 보고서에 명시.

## 6. 최소 보고 형식

```markdown
- 측정일 / 머신(CPU·RAM·OS) / Node·pnpm·Vite·도구 버전 / hyperfine v2.0.0
- 유형: cold(--prepare 로 .vite·dist 매번 삭제) | warm(--warmup N) · runs N
- 백그라운드·전원 통제, 이상치 경고·stddev 급증 구간

| Command | Median [s] | p95 [s] | Stddev | Runs |      ← 빌드/dev (JSON summary·measurements)
| 청크 | Before (gzip) | After (gzip) | Δ | Before (brotli) | After (brotli) | Δ |   ← 번들, 초기 로드 합계·% 행 별도, lazy 표기
```

`--export-markdown` + `--export-json`(또는 visualizer `raw-data`) 원본을 함께 남긴다.
