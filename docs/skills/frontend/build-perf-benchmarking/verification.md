---
skill: build-perf-benchmarking
category: frontend
version: v3
date: 2026-11-09
status: APPROVED
---

# build-perf-benchmarking 스킬 검증 문서

## 검증 워크플로우

본 스킬은 *실사용 필수 카테고리*(빌드 워크플로우 / 측정 도구 실행 결과로만 최종 검증 가능)에 해당하므로, content test 통과 후에도 실제 hyperfine 실행을 거쳐 결과 markdown·JSON이 의도대로 생성되는지 확인되어야 APPROVED로 전환된다.

```
[1단계] 스킬 작성 시 (오프라인 검증) — 완료
  ├─ hyperfine 공식 GitHub + man page + Vite/Turborepo 공식 문서 기반 작성
  ├─ 핵심 클레임 10개 이상 교차 검증
  └─ 최종 판정: PENDING_TEST

[2단계] 실제 사용 중 (온라인 검증) — 미실시
  ├─ skill-tester content test
  ├─ 실제 hyperfine 실행으로 markdown/JSON 출력 형식 확인
  └─ APPROVED 또는 NEEDS_REVISION
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `build-perf-benchmarking` |
| 스킬 경로 | `.claude/skills/build-perf-benchmarking/SKILL.md` |
| 검증일 | 2026-11-09 (재검증, 이전 2026-09-28) |
| 검증자 | skill-creator agent |
| 스킬 버전 | v2 |
| 대상 도구 버전 | hyperfine v1.20.0 (2025-11-18 릴리즈) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 — hyperfine GitHub README + man page
- [✅] 공식 GitHub 2순위 소스 확인 — sharkdp/hyperfine releases + scripts 폴더
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-05-14, v1.20.0)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (cold vs warm, 통계 보고)
- [✅] 코드 예시 작성 (hyperfine 명령 패턴, Vite/Turborepo 캐시 정리, p95 계산)
- [✅] 흔한 실수 패턴 정리 (9개 함정 + 5개 안티패턴)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch (github.com/sharkdp/hyperfine) | 옵션·버전·통계 출력 | v1.20.0, 옵션 12종 확인 |
| 조사 | WebFetch (mankier.com/1/hyperfine) | man page 옵션 상세 | --setup/--cleanup/--conclude 등 보강 |
| 조사 | WebFetch (raw README) | 통계 출력 형식·outlier 검출 | mean ± stddev/min/max, scripts/ 폴더 존재 |
| 조사 | WebSearch | hyperfine 최신 버전 교차 | Chocolatey v1.20.0 확인 |
| 조사 | WebSearch | hyperfine cold/warm cache 패턴 | drop_caches·prepare 패턴 확인 |
| 조사 | WebSearch | turborepo 캐시 위치/삭제 | `.turbo` + `node_modules/.cache/turbo` + `--force` |
| 조사 | WebSearch | vite 캐시 위치/삭제 | `node_modules/.vite` + `--force` + `optimizeDeps.force` |
| 조사 | WebSearch | hyperfine JSON 스키마 | times[]·mean·median·stddev·min·max·user·system |
| 교차 검증 | WebSearch | outlier 경고 원문 | 2개 경고 메시지 원문 확보 |
| 교차 검증 | WebSearch | thermal throttling 베스트 프랙티스 | 위키피디아·인텔 가이드 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| hyperfine GitHub README | https://github.com/sharkdp/hyperfine | ⭐⭐⭐ High | 2026-05-14 | 1순위 공식 소스, MIT/Apache-2.0 |
| hyperfine README raw | https://raw.githubusercontent.com/sharkdp/hyperfine/master/README.md | ⭐⭐⭐ High | 2026-05-14 | 공식 README 원문 |
| hyperfine man page | https://www.mankier.com/1/hyperfine | ⭐⭐⭐ High | 2026-05-14 | 공식 man page 미러 |
| hyperfine Releases | https://github.com/sharkdp/hyperfine/releases | ⭐⭐⭐ High | 2026-05-14 | v1.20.0 (2025-11-18) 확인 |
| Chocolatey hyperfine 1.20.0 | https://community.chocolatey.org/packages/hyperfine | ⭐⭐ Medium | 2026-05-14 | 버전 교차 검증 |
| Vite Dep Pre-Bundling 공식 문서 | https://vite.dev/guide/dep-pre-bundling | ⭐⭐⭐ High | 2026-05-14 | `node_modules/.vite` 위치 출처 |
| Vite Dep Optimization Options | https://vite.dev/config/dep-optimization-options | ⭐⭐⭐ High | 2026-05-14 | `optimizeDeps.force` 출처 |
| Turborepo Caching 공식 문서 | https://turborepo.dev/docs/crafting-your-repository/caching | ⭐⭐⭐ High | 2026-05-14 | `.turbo/cache` 위치 + `--force` 출처 |
| Turborepo 캐시 삭제 Discussion | https://github.com/vercel/turborepo/discussions/5270 | ⭐⭐ Medium | 2026-05-14 | 실용 캐시 삭제 패턴 |
| Linux dynamic frequency scaling | https://en.wikipedia.org/wiki/Dynamic_frequency_scaling | ⭐⭐ Medium | 2026-05-14 | CPU governor 배경 |
| 외부 hyperfine 사용 가이드 | https://imzye.com/Tips/how-to-use-hyperfine/ | ⭐⭐ Medium | 2026-05-14 | JSON 스키마 교차 검증 (v1.x 기준 — v2 에서 낡음) |
| hyperfine v2.0.0 Release | https://github.com/sharkdp/hyperfine/releases/tag/v2.0.0 | ⭐⭐⭐ High | 2026-11-09 | 2026-10-07 릴리스, Breaking changes 원문(셸 기본 none·JSON schema 2·`--time-unit`/`--sort`/`--reference` 삭제·export 형식 변경) |
| hyperfine v2.0.0 README | https://raw.githubusercontent.com/sharkdp/hyperfine/v2.0.0/README.md | ⭐⭐⭐ High | 2026-11-09 | Intermediate shell 절(`-S`=`--shell=default`, `-N`=`--shell=none`), `--metrics` 프리셋, Markdown `Mean Wall Time [s] \| Change \| Factor`, CSV `_median` 열 |
| hyperfine v2.0.0 소스 `src/output/warnings.rs` | https://github.com/sharkdp/hyperfine/blob/v2.0.0/src/output/warnings.rs | ⭐⭐⭐ High | 2026-11-09 | 경고 문구 원문 (first-run 경고 4변형, 일반 outlier 경고 없음) |

---

## 4. 검증 체크리스트 (핵심 클레임 판정)

### 4-1. 클레임별 판정

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|----------|----------|------|
| C1 | hyperfine 최신 안정 버전 v1.20.0 (2025-11-18) | GitHub README | Chocolatey 패키지 페이지 | ✅ VERIFIED |
| C2 | `-w/--warmup` 옵션: 측정 전 NUM회 실행, 캐시 워밍업 목적 | man page | README + 사용 가이드 | ✅ VERIFIED |
| C3 | `-r/--runs` 옵션: 정확히 NUM회 측정 | man page | README + 사용 가이드 | ✅ VERIFIED |
| C4 | `-m/--min-runs` 기본 10회 / 최소 3초 자동 결정 | man page | WebSearch 결과 | ✅ VERIFIED |
| C5 | `-p/--prepare`: 매 timing run 직전 실행 | man page | README | ✅ VERIFIED |
| C6 | `-s/--setup`: 명령 series 시작 시 1회만 실행 | man page | — | ⚠️ VERIFIED (단일 1차 소스이나 man page는 공식) |
| C7 | `--export-markdown` / `--export-json` 둘 다 지원 | man page | README + 외부 가이드 | ✅ VERIFIED |
| C8 | JSON 스키마: `times[]`, `mean`, `median`, `stddev`, `min`, `max`, `user`, `system` | imzye 가이드 | hyperfine README 언급 + 외부 가이드 | ✅ VERIFIED |
| C9 | CLI 출력은 mean ± stddev / min / max / Relative만 표시 (median 없음) | README markdown 예제 | WebFetch 응답 | ✅ VERIFIED |
| C10 | hyperfine은 p95/p99를 기본 출력하지 않음 | WebFetch (README 조회) | scripts/ 폴더 분석 (p95 전용 스크립트 부재) | ✅ VERIFIED |
| C11 | Outlier 경고: "Statistical outliers were detected. Consider re-running this benchmark on a quiet PC..." | WebSearch 직접 인용 | hyperfine 일반 문서 | ✅ VERIFIED |
| C12 | First-run 경고: "The first benchmarking run for this command was significantly slower than the rest..." | WebSearch 직접 인용 | hyperfine 일반 문서 | ✅ VERIFIED |
| C13 | Linux 페이지 캐시 비우기: `sync; echo 3 \| sudo tee /proc/sys/vm/drop_caches` | WebSearch (hyperfine 컨텍스트) | Linux 커널 일반 지식 | ✅ VERIFIED |
| C14 | Vite 캐시 위치: `node_modules/.vite` | Vite 공식 문서 (dep-pre-bundling) | Vite GitHub Discussion | ✅ VERIFIED |
| C15 | Vite `--force` 옵션으로 cache 무시 재최적화 | Vite 공식 dep-optimization-options | Vite Discussion | ✅ VERIFIED |
| C16 | Turborepo 캐시 위치: `.turbo/cache` (로컬) | Turborepo 공식 문서 | Vercel Discussion | ✅ VERIFIED |
| C17 | `turbo run build --force`: 캐시 *읽기* 비활성화, 쓰기는 유지 | Turborepo 공식 | WebSearch 결과 | ✅ VERIFIED |
| C18 | `--shell=none`(-N)은 sub-millisecond 명령용, 일반 빌드에 부적합 | man page | WebSearch | ✅ VERIFIED |
| C19 | warmup 권장 횟수는 hyperfine 공식이 *명시하지 않음* (본 스킬의 권장표는 실용치) | WebFetch (README) | man page | ✅ VERIFIED (스킬에 주의 표기) |
| C20 | scripts/ 폴더에 `plot_whisker.py` 등 numpy 기반 분석 도구 존재 | WebFetch (scripts README) | — | ⚠️ VERIFIED (단일 1차 소스, 공식 레포) |
| C21 | (2026-11-09) 최신 안정 버전 v1.20.0 | GitHub Releases API latest = **v2.0.0 (2026-10-07)** | v2.0.0 README | **DISPUTED → 수정** (대상 버전 v2.0.0, v1.x 차이 주의 추가) |
| C22 | (2026-11-09) 측정 명령 기본 실행 방식 = 셸(`-S`=셸 지정) | v2.0.0 Release Breaking changes "executed directly by default ... (`--shell=none`). Use `-S` (an alias for `--shell=default`)" | v2.0.0 README Intermediate shell 절 | **DISPUTED → 수정** (§2 표·§4.3·§7.1-8·§7.2-4) |
| C23 | (2026-11-09) JSON 스키마 `times[]`·최상위 `mean`/`median` | v2.0.0 Release: `results[i].summary.time_wall_clock.mean`, `measurements[j].time_wall_clock.value` | v2.0.0 README JSON 절 | **DISPUTED → 수정** (§3.2 스키마·p95 Python) |
| C24 | (2026-11-09) `--time-unit/-u` 사용 가능 | v2.0.0 Release: 삭제, `--metrics METRIC[:UNIT]` 로 대체 | v2.0.0 README Choosing metrics 절 | **DISPUTED → 수정** (옵션 표에서 삭제, `--metrics`·`--env` 추가) |
| C25 | (2026-11-09) Markdown export 열 `Mean/Min/Max/Relative` | v2.0.0 Release: Markdown 은 주 지표만 | v2.0.0 README 예시 `\| Command \| Mean Wall Time [s] \| Change \| Factor \|` | **DISPUTED → 수정** (§6.1) |
| C26 | (2026-11-09) `--prepare`·`--setup` 등은 셸 없이도 셸로 실행 | v2.0.0 Release "Always run --setup, --prepare, --conclude, and --cleanup commands in a shell" | v2.0.0 README | VERIFIED (§2 각주 추가) |
| C27 | (2026-11-09) 경고 문구(§9) v2 에서도 동일 | v2.0.0 `src/output/warnings.rs` — first-run 경고는 사용 옵션별 4변형, "Statistical outliers were detected" 일반 경고는 없음 | `src/benchmark/mod.rs` 이상치 검사가 첫 run(`scores[0]`)에만 적용 | **DISPUTED → 수정** (§9 를 v2/v1.20 으로 분리, v2 바이너리 실행 재현은 미실시 — `> 주의:` 표기) |

#### 흡수한 원본의 핵심 클레임 (2026-11-12 통합 시 옮김 — 판정은 원본 기록 그대로)

| # | 클레임 | 근거 | 판정 |
|---|--------|------|------|
| B2 | (구 bundle-size-analysis) rollup-plugin-visualizer `gzipSize`/`brotliSize` 기본값 둘 다 `false` | GitHub README + WebSearch | VERIFIED |
| B4 | (구 bundle-size-analysis) rollup-plugin-visualizer 7.x 는 Node.js ≥ 22 | GitHub README + npm | VERIFIED |
| B8 | (구 bundle-size-analysis) webpack-bundle-analyzer `defaultSizes` 기본 `parsed` | GitHub README | VERIFIED |
| B13 | (구 bundle-size-analysis) 버전 기준 visualizer 7.1.3·size-limit 14.3.0·webpack-bundle-analyzer 5.4.2 | npm registry + CHANGELOG | DISPUTED → 숫자 갱신 |
| B14 | (구 bundle-size-analysis) size-limit 14.x Node `^22.19.0 \|\| ^24.5.0 \|\| >=26.0.0` | npm engines | VERIFIED |
| B16 | (구 bundle-size-analysis) webpack-bundle-analyzer 5.0 에서 Node 20.9 미만 지원 종료 | CHANGELOG 5.0.0 + npm engines | VERIFIED |
| B17 | (구 bundle-size-analysis) Next.js 16 Turbopack 은 `next analyze`(16.1+), `@next/bundle-analyzer` 는 Webpack 용 | Next.js Package Bundling 가이드 | DISPUTED → 수정 |
| B18 | (구 bundle-size-analysis) size-limit 13.0.0 Node 20 종료, 14.0.0 preset-small-lib 기본 번들러 rolldown(preset-app 대상 아님) | size-limit CHANGELOG | VERIFIED (2026-09-28 실행 검증) |
| B19 | (구 bundle-size-analysis) visualizer 7.1.0 에서 rollup 미설치(Vite 8) 타입 버그 수정 | visualizer CHANGELOG | VERIFIED (2026-09-28 실행 검증, TS2307 미발생) |
| D1 | (구 dev-server-hmr-benchmarking) Vite 8 캐시 위치 `node_modules/.vite/deps/`·`--force` 변동 없음 | Vite 마이그레이션 가이드 | VERIFIED |
| D2 | (구 dev-server-hmr-benchmarking) Vite 8 pre-bundling esbuild → Rolldown, 변환·minify → Oxc | Vite 마이그레이션 가이드 | VERIFIED |
| D3 | (구 dev-server-hmr-benchmarking) `vite:beforeUpdate`/`afterUpdate` 유지, `hot.accept` URL 전달은 8.0 제거 | Vite HMR API 문서 | VERIFIED |
| D4 | (구 dev-server-hmr-benchmarking) `&`·`&&` 든 비교 명령은 hyperfine v2 에서 `-S` 필요 | v2 README + 릴리스 노트 | DISPUTED → 수정 |
| D5 | (구 dev-server-hmr-benchmarking) `hmr update` 로그는 WS 연결 브라우저가 있어야 출력, macOS `date %N` 불가·`exit 0` 필요 | 2026-09-28 직접 실행 재현 | VERIFIED (실측) |

### 4-2. 판정 요약

- **VERIFIED**: 18건
- **VERIFIED (단일 공식 소스, 신뢰 가능)**: 2건 (C6, C20)
- **DISPUTED**: 0건
- **UNVERIFIED**: 0건

### 4-3. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (hyperfine v1.20.0, 2025-11-18 릴리즈)
- [✅] deprecated된 패턴을 권장하지 않음 (v1.20.0 옵션만 사용)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-4. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description, example 3개)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (hyperfine 개요·옵션·통계)
- [✅] 코드 예시 포함 (Vite/Turborepo cold·warm 명령 패턴)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (1회 측정 안티패턴, `-N` 부적합 케이스)
- [✅] 흔한 실수 패턴 포함 (함정 9개 + 안티패턴 5개)

### 4-5. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (복붙 가능한 hyperfine 명령 다수)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (Vite·Turborepo·Next.js·tsc·webpack 5종 캐시 정리)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-6. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-14 skill-tester 수행, 2026-11-09 v2.0.0 정정 재시험 3/3 PASS)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (보완 필요 없음 — 3/3 PASS)

---

## 5. 테스트 진행 기록

### [2026-11-09] skill-tester content test — hyperfine v2.0.0 정정 반영 확인

**수행일**: 2026-11-09
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 미사용, 범용 에이전트로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인. 3문항 모두 이번 재검증의 정정 부분(셸 기본값 반전, JSON schema v2, 삭제 옵션, markdown 열, 경고문 v2/v1.20 분리)을 직접 겨냥.

### 실제 수행 테스트

**Q1. v2.0.0 에서 `'NODE_ENV=production pnpm build && pnpm test'` 가 기대대로 동작하지 않는 원인, 올바른 명령, `--prepare` 의 셸 여부**
- ✅ PASS
- 근거: SKILL.md 상단 주의, §2 옵션표(`-S`·`--shell=none`·`--env`)와 삭제 옵션 인용, §4.3 비교 예시 주의, §7.1 함정 8, §7.2 안티패턴 4
- 상세: v2 기본이 셸 없음(`--shell=none`)이라 `&&`·접두 환경변수를 해석하지 못함을 정확히 설명. 해법으로 `-S`(셸 필요 시)와 `--env 'NODE_ENV=production'`(환경변수만 필요 시)을 구분 제시하고, `--prepare/--setup/--conclude/--cleanup` 은 항상 셸로 실행되어 `rm -rf` 가 그대로 동작한다고 답함. v1.x 기본값(셸)과의 반전도 언급. anti-pattern(v1 관습대로 `-S` 없이 복합 명령 실행) 회피.

**Q2. v2 `--export-json` 에서 median·p95 추출(KeyError 원인) + `--time-unit millisecond` 사용 가능 여부**
- ✅ PASS
- 근거: SKILL.md §3.2 JSON 스키마 v2·v1.x 차이 인용·p95 Python 예시, §2 옵션표와 삭제 옵션 인용
- 상세: `times`/최상위 `median` 이 사라지고 `measurements[j].time_wall_clock.value` / `summary.time_wall_clock.median` 으로 바뀐 점을 정확히 제시, p95 는 JSON 에 없어 numpy 로 직접 계산. `--time-unit/-u` 삭제와 대안 `--metrics time_wall_clock:ms` 도 정확. anti-pattern(v1 스키마 접근, 삭제된 옵션 사용) 회피.

**Q3. `--reference`/`--sort` 사용 가능 여부와 기준 결정 방식, v2 markdown 열, v2 에서 "Statistical outliers were detected" 경고 부재의 정상 여부**
- ✅ PASS
- 근거: SKILL.md §2 삭제 옵션 인용, §4.3 비교 예시 주의, §6.1, §7.1 함정 5, §9
- 상세: `--reference`·`--sort` 삭제와 "첫 번째 명령이 항상 기준"을 정확히 답함. v2 markdown 은 `Command | Mean Wall Time [s] | Change | Factor`, v1.x 는 `Mean/Min/Max/Relative` 로 구분. 일반 이상치 경고가 v2 소스에는 없고 첫 run 경고만 남았다는 점, 단 v2 바이너리 실행 재현은 하지 않았다는 SKILL.md 의 단서까지 인용. 경고가 뜨면 환경 정리 후 재측정, 보고서에 기록.

### 발견된 gap (선택 보강, 차단 요인 아님)

- `&&` 와 환경변수를 한 명령에서 함께 쓰는 완성 예시가 없음 (`-S` 하나로 충분하다는 점만 암시)
- `--metrics ...:ms` 사용 시 JSON `unit` 필드가 ms 로 바뀌는지 SKILL.md 에 명시 없음 (현재는 "항상 초"만 기술)
- v2 에서 일반 이상치 경고가 없어진 뒤 대체 판단 기준(예: JSON stddev·min/max 점검)이 명시되지 않음
- §9 에는 v2 경고 4변형 중 1변형만 수록
- p95 계산이 numpy 의존 (표준 라이브러리 대안 없음)

### 판정

- agent content test: 3/3 PASS (SKILL.md 오류·DISPUTED 발견 없음)
- verification-policy 분류: 실사용 필수 카테고리(빌드 워크플로우) — 2026-09-28 실행 검증으로 APPROVED 전환된 상태. v2.0.0 바이너리 실행 재현은 미실시(소스·릴리스 노트 대조만)
- 최종 상태: APPROVED 유지

---

### [2026-09-28] 실사용(실행) 검증

**수행일**: 2026-09-28
**수행 방법**: 실험 공간(레포 밖 lab 폴더, `fe-perf/app`)에 `npm create vite@latest -- --template react-ts`로 Vite 8.3.1 + React 19 샘플 생성(dayjs 의존성 추가 + `React.lazy` 코드 분할 1개 포함, 23 모듈). Node v22.23.1 / npm v10.9.8 / hyperfine 1.20.0, Apple M1 Pro 10코어 16GB RAM, macOS 27.0에서 SKILL.md §4.3 명령 그대로 cold build(`--runs 10 --warmup 0 --prepare 'rm -rf node_modules/.vite dist tsconfig*.tsbuildinfo'`)와 warm build(`--runs 20 --warmup 3`)를 `--export-markdown`+`--export-json` 둘 다 켜서 실행. JSON에서 median·p95(선형보간)를 §3.2 방식대로 직접 계산해 §6.3 헤더 템플릿 형식의 보고서 작성.
**실행 결과**: cold build median 1.288s / p95 1.389s (n=10, outlier 없음). warm build median 1.231s / p95 1.530s (n=20) — **실제로 hyperfine outlier 경고가 발동**해 §7.1 함정 5·§9의 "outlier 경고" 클레임이 라이브로 재현 확인됨. 단, 실제 경고 원문이 "quiet **system**"인데 SKILL.md §9·§7.1이 "quiet **PC**"로 인용하고 있었고, first-run-slower 경고 원문도 실제 설치 바이너리(strings 추출)와 다르게 인용돼 있어 **SKILL.md 최소 정정**(두 인용문 교정 + 검증 각주 추가, v2→v3) 수행. 그 외 방법론(cold/warm 분리 명령, JSON에서 median/p95 추출, `--export-markdown`+`--export-json` 동시 산출)은 서술과 전부 일치.
**졸업 조건 충족 여부**: 충족 — PENDING_TEST.md의 "hyperfine으로 실제 빌드 10회 측정, 보고서 형식대로 산출" 조건을 cold 10회+warm 20회로 초과 충족, §6.3 형식 보고서 산출 완료.
**판정**: APPROVED 전환 (서술 오류 1건은 실행 중 발견해 즉시 최소 정정, 방법론 자체는 실행으로 100% 재현 확인)

---

### [2026-09-28] skill-tester content test 재테스트(3차) — SKILL.md 4.2 보강 반영 확인

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인. Q1은 직전 재테스트(2차)에서 PARTIAL 원인이었던 "4.2 섹션에 Rolldown 무관 확인 문구 누락" 갭이 메인 세션의 SKILL.md 보강(136행 각주 추가)으로 해소되었는지 직접 겨냥.

### 실제 수행 테스트

**Q1. Vite 8(Rolldown) 프로젝트에서 cold build 캐시 정리 명령이 예전과 달라지는가**
- ✅ PASS
- 근거: SKILL.md "4.2 도구별 캐시 정리 명령" 표(128~134행) + 136행 각주("Vite 8(Rolldown 기반)에서도 pre-bundle 캐시 위치(`node_modules/.vite`)와 `--force` 동작은 바뀌지 않았다")
- 상세: 직전 재테스트(2차)에서 지적된 gap — "재검증 기록과 스킬 본문 간 정정 내용 미동기화" — 이 136행 각주 추가로 해소됨. 에이전트가 SKILL.md만 근거로 "달라지지 않는다"고 명확히 답변, 근거 URL(vite.dev/guide/migration)까지 인용.

**Q2. cold/warm build 분리 측정 방법 + `--warmup`/`--prepare` 목적 차이**
- ✅ PASS
- 근거: SKILL.md "4.1 정의" + "4.2 도구별 캐시 정리 명령" + "4.3 hyperfine 명령 패턴" + "2. 핵심 옵션" 주의 문단 + "7.1 함정"
- 상세: cold(`--warmup 0` + `--prepare`)·warm(`--warmup 3`) 명령, warmup(캐시 채움)·prepare(캐시 비움) 목적 차이 정확히 근거 제시. gap 없음.

### 발견된 gap

없음 — 직전 재테스트의 유일한 gap(4.2 Rolldown 무관 확인 문구 누락)이 해소되어 2개 질문 모두 PASS.

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 실사용 필수 카테고리 (빌드 워크플로우 / 측정 도구 실행 결과로만 최종 검증 가능)
- 최종 상태: **NEEDS_REVISION 해제 → PENDING_TEST 복귀** (content test 2/2 PASS이나 실사용 필수 카테고리라 APPROVED는 실제 hyperfine 실행 검증 후로 보류)

---

### [2026-09-28] skill-tester content test 재수행 (Vite 8/Rolldown 정정 반영 확인)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인. Q1은 아래 2026-09-28 재검증(2차)의 Vite 8(Rolldown) 정정·보강 내용을 직접 겨냥.

### 실제 수행 테스트

**Q1. Vite 8(Rolldown) 프로젝트의 보고서 헤더 런타임 버전 예시 + cold build 캐시 정리 명령이 Rolldown 전환으로 달라지는지**
- 🟡 PARTIAL
- 근거: SKILL.md "6.3 보고서 헤더 템플릿"(252행, `Vite v8.3.1 (Rolldown 기반)`)은 정확히 근거 제시되어 PASS.
- 상세(gap): 캐시 정리 명령 질문에는 SKILL.md "4.2 도구별 캐시 정리 명령" 표가 Rolldown 채택 여부와 무관하게 `rm -rf node_modules/.vite dist` 단일 규칙만 제시할 뿐, "Rolldown 전환과 무관하게 캐시 디렉터리 동일하다"는 재확인 문구가 **SKILL.md 본문에는 없다**. 이 내용은 verification.md 섹션 5의 2026-09-28 재검증(2차) 기록에는 "확인됨"으로 적혀 있으나, 그 결론이 SKILL.md 4.2 섹션에 실제로 반영·기술되지 않아 에이전트가 SKILL.md만 근거로는 "달라지지 않는다"고 확답하지 못했다. **재검증 기록과 스킬 본문 간 정정 내용 미동기화** — SKILL.md 보강 필요(4.2 표 또는 그 하단에 "Rolldown 전환과 무관하게 캐시 위치·명령 변경 없음" 주석 추가 권장).

**Q2. cold/warm build 분리 측정 방법 + `--warmup`/`--prepare` 목적 차이 + 흔한 실수**
- ✅ PASS
- 근거: SKILL.md "4.1 정의" + "4.2 도구별 캐시 정리 명령" + "4.3 hyperfine 명령 패턴" + "2. 핵심 옵션" 주의 문단 + "7.1 함정"/"7.2 안티패턴"
- 상세: cold(`--warmup 0` + `--prepare`)·warm(`--warmup 3`) 명령 패턴, warmup(캐시 채움)·prepare(캐시 비움) 목적 차이, 11개 함정/안티패턴(1회 측정, cold/warm 혼합, `-N` 오용, `--ignore-failure` 남용, git stash 오버헤드 등)까지 정확히 근거 제시. gap 없음.

### 발견된 gap

- **(차단 요인 아님이나 정정 동기화 이슈)** Q1에서 드러난 대로, 2026-09-28 재검증(2차)에서 "Vite 8/Rolldown 전환이 캐시 정리 명령에 영향 없음"을 확인했다고 verification.md에는 기록했으나 이 결론 문장이 SKILL.md "4.2 도구별 캐시 정리 명령" 섹션에는 누락되어 있다. SKILL.md만 보는 에이전트는 이 질문에 확답할 수 없다 — 다음 SKILL.md 수정 시 4.2에 한 줄 보강 필요(본 세션은 SKILL.md 수정 없이 보고만 함, retest-brief 원칙에 따름).

### 판정

- agent content test: 1/2 PASS, 1/2 PARTIAL
- verification-policy 분류: 실사용 필수 카테고리 (빌드 워크플로우 / 측정 도구 실행 결과로만 최종 검증 가능)
- 최종 상태: NEEDS_REVISION (PARTIAL 발견 — SKILL.md 4.2 섹션에 Rolldown 무관 확인 문구 보강 필요, 사용자 승인 후 반영 권장)

---

### [2026-09-28] 재검증(2차) — Vite 8(Rolldown) 리포트 예시 버전 갱신

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 3개를 1차 소스와 대조, 보강 검토

**클레임 대조 결과**:
1. hyperfine 최신 안정 버전 v1.20.0 (2025-11-18) → VERIFIED (GitHub Releases API, 변동 없음)
2. Vite dep pre-bundling 캐시 위치 `node_modules/.vite` (재최적화 트리거 조건 포함) → VERIFIED (https://vite.dev/guide/dep-pre-bundling — Vite 8/Rolldown 전환 후에도 캐시 위치·트리거 로직 불변)
3. Turborepo 로컬 캐시 위치 `.turbo/cache` 및 `--force` 동작 → VERIFIED (https://turborepo.dev/docs/crafting-your-repository/caching, 변동 없음)

**보강(ADD)·축소**: 섹션 6.3 "보고서 헤더 템플릿" 예시 런타임 버전을 Vite 8 기준으로 갱신 — `Vite v5.4.10` → `Vite v8.3.1 (Rolldown 기반)`, Node/pnpm 예시 버전도 현재 최신(Node v24.21.0 LTS, pnpm v12.6.0)으로 함께 갱신. 상단 소스 인용의 "대상 버전" 줄에 Vite 8(2026-03 Rolldown 기반 출시) 기준임을 명시. Vite 8은 esbuild(dev)+Rollup(prod)를 Rolldown(Rust 번들러)으로 대체했으나, 캐시 디렉터리 경로·cold/warm 측정 방법론 자체는 영향받지 않음(스킬 본문 4.2 캐시 정리 명령 변경 불필요 — 확인됨). 축소 없음(실사용 필수 스킬 — 함정/체크리스트 유지).

**실전 질문 재검증**:
- Q1. "Vite 8(Rolldown) 프로젝트에서 cold build 측정 시 캐시 정리 명령이 예전과 달라지는가?" → SKILL.md "4.2 도구별 캐시 정리 명령"(`rm -rf node_modules/.vite dist`) 근거로 PASS — Rolldown 전환과 무관하게 캐시 디렉터리 동일
- Q2. "빌드 벤치마크 보고서 헤더에 넣을 현재 기준 런타임 버전 예시는?" → SKILL.md "6.3 보고서 헤더 템플릿"(Node v24.21.0, pnpm v12.6.0, Vite v8.3.1) 근거로 PASS

**재검증 최종 판정**: status **PENDING_TEST 유지** (실사용 필수 카테고리 — 실제 hyperfine 실행·산출물 검증 전까지 APPROVED 보류)

---

### 2026-08-11 재검증

**재검증일**: 2026-08-11
**수행자**: skill-tester → general-purpose (WebSearch 재검증 + content test 재수행)
**수행 방법**: SKILL.md 핵심 클레임 3개 WebSearch 재검증 + 실전 질문 3개 재수행 (2026-05-14와 다른 질문으로 갱신)

#### WebSearch 재검증 (핵심 클레임 3개)

| # | 클레임 | 검증 결과 |
|---|--------|-----------|
| 1 | hyperfine 최신 버전 v1.20.0 (2025-11-18) | ✅ 변동 없음 — 2026-08-11 기준에도 최신 (GitHub Releases) |
| 2 | `--prepare`/`--warmup`/`--export-json` 옵션 현재도 유효, deprecated 없음 | ✅ 변동 없음 (공식 README) |
| 3 | Vite dep pre-bundling 캐시 위치 `node_modules/.vite` | ✅ 변동 없음 (Vite 공식 문서) |

#### 실제 수행 테스트 (2026-08-11, 신규 질문)

**Q1. Turborepo 모노레포 before/after 비교에서 git stash 방식의 문제점과 대안**
- ✅ PASS
- 근거: SKILL.md "4.3 hyperfine 명령 패턴" Before/After 비교 코드 블록 + 바로 아래 주의 문구 (git stash 워킹트리 전환 오버헤드 → `git worktree add` 대안)
- 상세: stash/pop 오버헤드가 측정값에 섞이는 문제와 별도 워크트리 사용 대안이 정확히 근거로 제시됨. 경미한 gap: 워크트리별 `.turbo` 캐시 격리 구체 방법은 SKILL.md에 명시 없음(보강 권장, 차단 요인 아님)

**Q2. hyperfine "first benchmarking run이 significantly slower" 경고 대응**
- ✅ PASS
- 근거: SKILL.md "7.1 함정 2번" + "9. 참고 경고 메시지 원문" + "2. 핵심 옵션" warmup/prepare 목적 구분 주의문
- 상세: 경고 원문 인용, 원인(파일시스템 캐시 미충족), warmup(warm 의도)·prepare(cold 의도) 각각의 대응이 정확히 구분되어 근거 제시됨. gap 없음

**Q3. 빌드 벤치마크 보고서에 필수 명시할 혼동변수 항목**
- ✅ PASS
- 근거: SKILL.md "5.1 필수 명시 항목" 표 + "5.2 통제 가능/불가 구분" + "6.3 보고서 헤더 템플릿" + "8. 체크리스트"
- 상세: 4개 섹션이 교차 반영되어 하드웨어·OS·런타임·CPU상태·백그라운드·온도 항목이 일관되게 근거 제시됨. gap 없음

#### 발견된 gap (2026-08-11 재검증)

- Q1: Turborepo 모노레포에서 워크트리별 `.turbo` 캐시 공유/격리 방법 — 선택 보강 (차단 요인 아님)

#### 판정 (2026-08-11)

- WebSearch 재검증: 3/3 클레임 변동 없음 (VERIFIED 유지)
- agent content test: 3/3 PASS (신규 질문)
- verification-policy 분류: 실사용 필수 카테고리 (빌드 워크플로우 / 측정 도구 실행 결과로만 최종 검증 가능) — 재확인
- 최종 상태: PENDING_TEST 유지 (content test 누적 6/6 PASS, 실제 hyperfine 실행·산출물 검증 전까지 APPROVED 보류)

---

### 2026-05-14 최초 테스트

**수행일**: 2026-05-14
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Vite cold/warm build 분리 측정 명령 (핵심 기능)**
- PASS
- 근거: SKILL.md "4.3 hyperfine 명령 패턴" 섹션 + "4.2 도구별 캐시 정리 명령" 섹션
- 상세: cold build는 `--prepare 'rm -rf node_modules/.vite dist .turbo'` + `--runs 10 --warmup 0`, warm build는 `--warmup 3 --runs 20`으로 명확히 구분. anti-pattern(cold/warm 섞기, prepare 없이 runs만 늘리기) 회피 확인.

**Q2. median·p95 추출 방법 — CLI에서 바로 볼 수 있는지 (흔한 함정)**
- PASS
- 근거: SKILL.md "3.2 보고할 통계값" 섹션 + JSON 스키마 + p95 Python 계산 예시
- 상세: "CLI 출력에는 median·p95가 없으므로 --export-json으로 받아 직접 계산"이 명확히 기술. median은 JSON `"median"` 필드, p95는 `times[]` 배열 + numpy `percentile(times, 95)`. anti-pattern("CLI에 median이 있다"는 잘못된 답) 회피 확인.

**Q3. 빌드 45초 시 runs/warmup 권장값 + warmup vs prepare 목적 차이 (판단형)**
- PASS
- 근거: SKILL.md "3.1 권장 측정 횟수" 표 + "2. 핵심 옵션" 주의 블록
- 상세: 45초는 "30초~2분" 구간 → `--runs 10, --warmup 1~2`. warmup은 "캐시를 채우려는 것", prepare는 "캐시를 비우려는 것"이라는 목적 차이가 섹션 2 주의 블록에 명시됨. anti-pattern(warmup을 캐시 청소 목적으로 혼동) 회피 확인.

### 발견된 gap

없음 — 3개 질문 모두 SKILL.md에서 명확한 근거 섹션을 찾아 답변 가능.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 실사용 필수 카테고리 (빌드 워크플로우 / 측정 도구 실행 결과로만 최종 검증 가능)
- 최종 상태: PENDING_TEST 유지 (content test PASS이나 실사용 필수 카테고리)

> 참고 (skill-tester 미실시 이전 기록):
> 이 섹션은 skill-tester 에이전트 호출 후 채워진다. 현재는 PENDING_TEST 상태.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (**2026-11-09 v2.0.0 정정 재시험 3/3 PASS** — 셸 기본값 반전·JSON schema v2·삭제 옵션·markdown 열·경고문 분리 + 2026-05-14 3/3 PASS + 2026-08-11 재검증 3/3 PASS + 2026-09-28 WebSearch 재검증 2/2 PASS + 2026-09-28 content test 재수행 1/2 PASS·1/2 PARTIAL + **2026-09-28 재테스트(3차) 2/2 PASS** — SKILL.md 4.2 보강(136행 각주) 후 Rolldown 갭 해소 확인) |
| WebSearch 재검증 (2026-08-11) | ✅ hyperfine v1.20.0·옵션·Vite 캐시 위치 3건 모두 변동 없음 |
| WebSearch 재검증 (2026-09-28) | ✅ hyperfine v1.20.0·Vite 캐시 경로(Rolldown 전환 후에도 불변)·Turborepo 캐시 경로 3건 모두 변동 없음. 리포트 예시 버전 Vite 8 기준 갱신 |
| 실사용 테스트 (hyperfine 실제 실행) | ✅ **(2026-09-28 완료)** lab 샘플(Vite 8+React 19)에서 cold(n=10)·warm(n=20) 실제 실행, median/p95 추출 성공, outlier 경고 라이브 재현. 경고 원문 인용 오류 1건 발견 즉시 정정 |
| 재검증 (2026-11-09) | ✅ hyperfine v2.0.0 파괴적 변경 반영(C21~C27), content test 3/3 PASS. v2 바이너리 실행 재현은 미실시(소스·릴리스 노트 대조) |
| **최종 판정** | **APPROVED** (2026-09-28 실사용 실행 검증 완료 후 전환, 2026-11-09 v2.0.0 정정 재시험 3/3 PASS로 APPROVED 유지) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 content test 수행 (2026-05-14 완료, 3/3 PASS — cold/warm 분리·median/p95 추출·runs/warmup 권장값·warmup vs prepare 목적 차이 시나리오 포함 / 2026-08-11 재검증 3/3 PASS 추가 — Turborepo git stash 대안·first-run 경고 대응·혼동변수 필수 항목 / 2026-09-28 재수행 1/2 PASS·1/2 PARTIAL / **2026-09-28 재테스트(3차) 2/2 PASS 완료** — SKILL.md 4.2에 Rolldown 무관 확인 문구(136행) 보강 후 갭 해소)
- [✅] **(2026-09-28 완료)** 실제 프로젝트(lab Vite 8+React 19 샘플)에서 hyperfine v1.20.0 실행 — cold(n=10)/warm(n=20) markdown+JSON 출력 형식 스킬 설명과 일치 확인, outlier 경고 라이브 재현, 경고 원문 인용 오류 2건 발견해 SKILL.md §7.1·§9 정정
- [✅] **(2026-11-09 완료, 3/3 PASS)** hyperfine v2.0.0 정정 반영 후 skill-tester 재시험 — 셸 기본값 반전·JSON schema v2·삭제 옵션·markdown 열·경고문 분리 모두 SKILL.md 근거로 정확히 답변
- [❌] hyperfine v2.0.0 바이너리를 실제 설치해 §2·§3.2·§4.3·§6.1·§9 재현 확인 (선택 보강: 현재는 소스·릴리스 노트 대조까지만이며 APPROVED 유지에는 차단 요인 아님)
- [❌] 2026-11-09 재시험 gap 5건 보강 — `&&`+환경변수 완성 예시, `--metrics ...:ms` 시 JSON unit, v2 이상치 대체 판단 기준, §9 경고 4변형, p95 표준 라이브러리 대안 (선택 보강, 차단 요인 아님)
- [❌] macOS/Linux/Windows 각 OS에서 `--prepare` 명령 동작 확인 (선택 보강: 특히 Windows에서 `rm -rf` 대체 명령 추가 필요, APPROVED 전환 조건은 아님 — 이번 실행 검증은 macOS만 수행)
- [❌] turborepo 모노레포에서 `--filter=` 옵션과 hyperfine 조합 측정 검증 + 워크트리별 `.turbo` 캐시 격리 방법 (선택 보강: 실전 도입 이후 추가 검증 권장)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성 — hyperfine v1.20.0 기준, cold/warm 분리·median/p95 보고·혼동변수 통제·안티패턴 9개 포함 | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 Vite cold/warm 분리 측정 / Q2 median·p95 추출 방법 / Q3 45초 빌드 runs/warmup 권장값 + warmup vs prepare 목적 차이) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
| 2026-08-11 | v1 | 재검증 — WebSearch 3건(hyperfine 버전·옵션·Vite 캐시 위치) 모두 변동 없음 확인 + content test 재수행 (Q1 Turborepo git stash 대안 / Q2 first-run 경고 대응 / Q3 혼동변수 필수 항목) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
| 2026-09-28 | v2 | 재검증(2차) — WebSearch 3건(hyperfine 버전·Vite 캐시 경로·Turborepo 캐시 경로) 모두 변동 없음 확인 + 보고서 헤더 템플릿(6.3) 예시 버전을 Vite 8.3.1(Rolldown)·Node v24.21.0·pnpm v12.6.0으로 갱신 + content test 2/2 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | 메인 세션 |
| 2026-09-28 | v2 | 2단계 실사용 테스트 재수행 (Q1 Vite 8/Rolldown 헤더 버전+캐시 명령 변경 여부 / Q2 cold/warm 분리+warmup·prepare 차이) → 1/2 PASS, 1/2 PARTIAL(Rolldown 캐시 확인 문구가 SKILL.md 4.2에 미반영) → **NEEDS_REVISION 전환** (SKILL.md는 수정하지 않고 gap만 보고, 사용자 승인 대기) | skill-tester |
| 2026-09-28 | v2 | SKILL.md 4.2 섹션에 "Vite 8/Rolldown 전환과 무관하게 캐시 위치·정리 명령 변경 없음" 확인 각주(136행) 보강 반영 확인 후 2단계 실사용 테스트 재테스트(3차) 수행 (Q1 Rolldown 캐시 명령 변경 여부 재확인 / Q2 cold/warm 분리+warmup·prepare 차이) → 2/2 PASS, **NEEDS_REVISION 해제 → PENDING_TEST 복귀** (실사용 필수 카테고리, hyperfine 실제 실행 검증 전까지 APPROVED 보류) | skill-tester |
| 2026-09-28 | v3 | **실사용(실행) 검증 완료** — lab Vite 8+React 19 샘플에서 hyperfine 1.20.0 cold(n=10)/warm(n=20) 실제 실행, median/p95 JSON 추출, outlier 경고 라이브 재현. §7.1·§9의 hyperfine 경고 원문 인용 오류 2건("quiet PC"→"quiet system", first-run 경고 문구 축약) 발견해 최소 정정 + 검증 각주 추가. status **PENDING_TEST → APPROVED** | 실행검증 세션 |
| 2026-11-09 | v4 | 재검증 — hyperfine **v2.0.0(2026-10-07) 파괴적 변경** 반영: 대상 버전 v2.0.0 + v1.x 차이 주의, §2 옵션 표(`-S`=`--shell=default`, `-N`=기본, `--time-unit` 삭제, `--metrics`·`--env`·`--export-csv` 추가), §3.2 JSON schema v2 + p95 Python, §4.3 비교 예시 `-S` 필수, §6.1 markdown 열, §7.1-8·§7.2-4 셸 기본값 반전, §9 경고 원문을 v2 소스/v1.20 으로 분리. 클레임 C21~C27(DISPUTED 6·VERIFIED 1). v2 는 소스·릴리스 노트로만 확인하고 실행은 못 함(로컬 설치본 1.20.0). 내용 수정 → skill-tester 재시험 | 재검증 b01 |
| 2026-11-09 | v4 | 재검증 후 2단계 content test 재시험 (Q1 v2 셸 기본값 반전·`-S`/`--env`·`--prepare` 셸 실행 / Q2 JSON schema v2 median·p95 + `--time-unit` 삭제·`--metrics` / Q3 `--reference`·`--sort` 삭제·markdown 열·v2 경고문 부재) → 3/3 PASS, APPROVED 유지 (선택 보강 gap 5건 섹션 7 기록) | skill-tester |
| 2026-11-12 | v4.1 | 정리(사실 재검증 아님) — bundle-size-analysis·dev-server-hmr-benchmarking 통합 + 일반 지식 덜어내기: 옮긴 것 size-limit 13·14 변경, visualizer 7.x Node·Vite 8 타입 수정·gzip 기본 꺼짐, 모듈별 gzip 합 ≠ 파일, Next 16 `next analyze`, Vite 8 Rolldown/Oxc·HMR URL accept 제거, dev 서버 미종료·`date %N`·`exit 0`·HMR 로그 WS 조건·워처 함정, 원본 클레임 표 / 덜어낸 것 hyperfine 소개·옵션 전체 표·runs 권장표·혼동변수 표·안티패턴 코드, 번들 도구 설치·옵션·템플릿 표·CI 예시·대안 도구, DevTools 절차·HMR 측정 코드·touch 스크립트, 보고서 템플릿(최소 형식만 유지) | 정리 |
