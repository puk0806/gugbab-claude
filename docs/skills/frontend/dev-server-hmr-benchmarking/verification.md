---
skill: dev-server-hmr-benchmarking
category: frontend
version: v3
date: 2026-09-28
status: APPROVED
---

# dev-server-hmr-benchmarking 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `dev-server-hmr-benchmarking` |
| 스킬 경로 | `.claude/skills/frontend/dev-server-hmr-benchmarking/SKILL.md` |
| 검증일 | 2026-09-28 (재검증, 이전 2026-05-14) |
| 검증자 | skill-creator |
| 스킬 버전 | v2 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (Vite·Webpack·Chrome DevTools·hyperfine)
- [✅] 공식 GitHub 2순위 소스 확인 (sharkdp/hyperfine, paulmillr/chokidar)
- [✅] 최신 버전 기준 내용 확인 (Vite 7.x / Webpack 5 + webpack-dev-server v5 / Chrome 129+, 2026-05-14)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (hyperfine --prepare, Vite HMR API, DevTools Performance)
- [✅] 코드 예시 작성 (bench-cold.sh, touch-file.mjs, import.meta.hot.on 핸들러)
- [✅] 흔한 실수 패턴 정리 (워처 차이, 폴링 영향, 통계 처리)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch | vite.dev/guide/api-hmr | HMR API 9개 이벤트 + 메서드 시그니처 수집 |
| 조사 | WebFetch | vite.dev/guide/features | esbuild pre-bundling, ESM, on-demand transform 확인 |
| 조사 | WebFetch | webpack.js.org/configuration/dev-server | hot/liveReload/client.overlay, stats.timings 옵션 확인 |
| 조사 | WebFetch | developer.chrome.com/docs/devtools/performance/reference | Capture settings, Main/Network/Frames track, Record and reload 확인 |
| 조사 | WebFetch | github.com/sharkdp/hyperfine | --prepare/--warmup/--runs/--export-markdown 옵션 확인 |
| 교차 검증 | WebSearch | webpack-dev-server v4/v5 HMR default | v4+ HMR 기본 활성화 VERIFIED |
| 교차 검증 | WebSearch | vite --force, node_modules/.vite/deps | 캐시 위치·--force 동작 VERIFIED |
| 교차 검증 | WebSearch | macOS fsevents, WSL inotify, chokidar polling | 워처 차이·WSL2 함정 VERIFIED |
| 교차 검증 | WebSearch | vite:beforeUpdate/vite:afterUpdate timestamp | payload.updates[i].timestamp 필드 VERIFIED |

**판정 통계:** VERIFIED 9 / DISPUTED 0 / UNVERIFIED 0

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Vite HMR API 공식 문서 | https://vite.dev/guide/api-hmr | ⭐⭐⭐ High | 2026-05-14 | 공식 문서 1순위 |
| Vite Features 공식 문서 | https://vite.dev/guide/features | ⭐⭐⭐ High | 2026-05-14 | 공식 문서 1순위 |
| Vite Dep Pre-Bundling | https://vite.dev/guide/dep-pre-bundling | ⭐⭐⭐ High | 2026-05-14 | 공식 문서 1순위 |
| Webpack DevServer | https://webpack.js.org/configuration/dev-server/ | ⭐⭐⭐ High | 2026-05-14 | 공식 문서 1순위 |
| Chrome DevTools Performance reference | https://developer.chrome.com/docs/devtools/performance/reference | ⭐⭐⭐ High | 2026-05-14 | 공식 문서 1순위 |
| hyperfine GitHub | https://github.com/sharkdp/hyperfine | ⭐⭐⭐ High | 2026-05-14 | 공식 레포 (sharkdp, Stars 20k+) |
| chokidar GitHub | https://github.com/paulmillr/chokidar | ⭐⭐⭐ High | 2026-05-14 | 공식 레포 (Stars 11k+) |
| vitejs/vite Issue #6379 | https://github.com/vitejs/vite/issues/6379 | ⭐⭐ Medium | 2026-05-14 | 공식 레포 이슈, vite:afterUpdate 구현 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Vite 7.x, Webpack 5 + dev-server v5, Chrome 129+)
- [✅] deprecated된 패턴을 권장하지 않음 (Webpack v3 시절 HotModuleReplacementPlugin 수동 등록 등 미언급)
- [✅] 코드 예시가 실행 가능한 형태임 (bench-cold.sh, touch-file.mjs, import.meta.hot 핸들러)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (2026-05-14)
- [✅] 핵심 개념 설명 포함 (cold/warm start, HMR latency, full reload latency 정의)
- [✅] 코드 예시 포함 (hyperfine, bash 스크립트, TS HMR 핸들러, JS 자동 touch)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함 (워처 차이, 캐시, 백그라운드 프로세스, 측정 자체 영향)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (보고 템플릿까지 포함)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 없음, Vite·Webpack·Rsbuild·Next 공통)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-14)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-05-14)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — 3/3 PASS, 보완 불필요
- [✅] **(2026-09-28 추가)** skill-tester → general-purpose 실제 에이전트 호출로 2차 재검증분(Vite 8/Rolldown ADD 블록) content test 수행 — 2/2 PASS

---

## 5. 테스트 진행 기록

### [2026-09-28] 실사용(실행) 검증

**수행일**: 2026-09-28
**수행 방법**: 레포 밖 lab 폴더(`fe-perf/app`, Vite 8.3.1+React 19, Node v22.23.1, hyperfine 1.20.0, Apple M1 Pro/macOS 27.0)에서 §2.1~2.2 방식대로 cold start(`hyperfine --runs 10 --warmup 0 --prepare 'rm -rf node_modules/.vite' './scripts/bench-cold.sh'`)와 warm start(`--warmup 2`, prepare 없음)를 측정. §3.1은 SKILL.md 예시 코드(`hmr-bench.ts`)를 그대로 `main.tsx`에 연결해 Chrome(claude-in-chrome 도구로 실제 페이지 로드)에서 콘솔 로그로 확인. §3.2는 vite를 자식 프로세스로 띄우고 App.tsx를 20회 자동 수정하며 저장 시각↔`hmr update` 로그 도달 시각 차이를 측정하는 자체 스크립트(`bench-hmr-log.mjs`)로 자동화.
**실행 결과**: cold start median 436.5ms(n=10)/warm start median 384.6ms(n=10) — cold>warm 방향성 일치. §3.1 HMR API는 Chrome 콘솔에 `[HMR] beforeUpdate`/`[HMR] update latency: 13.5ms` 그대로 출력되어 코드 예시 정확성 확인. §3.2는 브라우저 미연결 상태에서 두 차례(8회/30회 파일 수정) 시도 모두 `hmr update` 로그가 **0줄**로 나왔으나, Chrome으로 페이지를 연 직후 즉시 로그가 찍혀 20/20 측정 성공(median 87ms) — **"브라우저(WS) 클라이언트 연결 필수"라는 미기재 전제조건 발견**. 추가로 §2.2 `bench-cold.sh` 예시가 (1) macOS(BSD date)에서 `date +%s%3N` 산술 에러로 즉시 실패, (2) `exit 0` 누락으로 hyperfine이 `--ignore-failure` 없이는 첫 실행에서 에러 처리하는 버그 2건 발견 — 총 3건 모두 SKILL.md에 최소 정정(§2.2 스크립트 python3 기반 `now_ms()`+`exit 0`, §3.2 전제조건 주의 블록 및 로그 포맷 완화 표현) 후 재실행으로 확인 완료.
**졸업 조건 충족 여부**: 충족 — PENDING_TEST.md의 "dev 서버 cold start·HMR 지연 측정" 조건을 cold/warm start(hyperfine)+HMR latency 2가지 방법(§3.1 API 실브라우저 확인, §3.2 로그파싱 자동화 20회) 모두로 충족.
**판정**: APPROVED 전환 — 실행 중 발견된 서술 오류 3건(스크립트 macOS 비호환 2건 + 로그파싱 전제조건 누락 1건) 모두 최소 정정 완료, 정정 후 방법론 전부 일치 확인.

---

### [2026-09-28] skill-tester 실제 에이전트 content test (2차 재검증분 겨냥)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (2건, Agent 도구로 실제 서브에이전트 호출)
**수행 방법**: 아래 "재검증(2차)" 블록에서 main session이 셀프 검증한 Q1·Q2와 별도로, general-purpose 에이전트에게 "SKILL.md만 근거로 답하라"고 위임해 2026-09-28 정정분(Vite 8/Rolldown ADD 주의 블록)을 직접 겨냥한 질문 2개를 재수행

**Q1. Vite 8(Rolldown)로 업그레이드한 프로젝트에서 cold start 측정 스크립트(hyperfine --prepare + bench-cold.sh)를 수정 없이 그대로 써도 되는가?**
- ✅ PASS
- 근거: SKILL.md 상단 "주의 (ADD, Vite 8/Rolldown 확인 결과)" 블록
- 상세: 캐시 경로(`node_modules/.vite/deps/`)·`--force` 동작이 8.x에서도 유지된다는 근거로 "수정 불필요"를 정확히 도출. `import.meta.hot.accept(url)` 제거가 본 스킬 예시(`hot.on(...)`만 사용)에는 영향 없다는 점까지 정확히 구분

**Q2. import.meta.hot.accept에 URL을 직접 넘기는 기존 코드가 Vite 8에서 문제되는지, 이 스킬의 HMR 측정 예시는 영향받는지?**
- ✅ PASS
- 근거: SKILL.md 22행 "주의" 블록 + "3.1 Vite HMR API로 정밀 측정" 섹션(121-141행) 코드
- 상세: URL 직접 전달 방식이 8.0에서 제거되어 팀 코드는 영향받지만, 스킬의 `hmr-bench.ts` 예시는 `.on(...)` 이벤트 구독만 사용해 영향 없음을 코드 대조로 정확히 구분. 경미한 gap: id 기반 신규 시그니처 마이그레이션 예시 코드는 SKILL.md에 없음(선택 보강)

**판정**: 2/2 PASS, 정정분(ADD 블록)이 실제 실전 질문에서 올바른 답을 도출시킴을 확인. 기존 방법론(섹션 2·3)과 신규 ADD 문구 사이 모순 없음.

---

### [2026-09-28] 재검증(2차) — Vite 8(Rolldown) dev 서버 동작 변화 확인

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 공식 마이그레이션 가이드(WebFetch) + WebSearch로 핵심 클레임 3개 대조, ADD 항목(Vite 8 dev 서버 동작 변화) 반영

**클레임 대조 결과**:
1. Vite 8 dep pre-bundling 캐시 위치 `node_modules/.vite/deps/` 및 `--force` 동작 → VERIFIED, 변동 없음 (공식 마이그레이션 가이드 https://vite.dev/guide/migration 에 캐시 위치·`--force` 관련 breaking change 언급 없음, dep-pre-bundling 공식 문서와도 일치)
2. Vite 8은 dep pre-bundling 엔진을 esbuild → Rolldown, JS 변환/minify를 esbuild → Oxc로 교체 → VERIFIED (공식 마이그레이션 가이드 WebFetch 확인: "Rolldown is now used for dependency optimization instead of esbuild", "Oxc is now used for JavaScript transformation/minification instead of esbuild")
3. `vite:beforeUpdate`/`vite:afterUpdate` HMR 클라이언트 이벤트 8.x에서도 유지 → VERIFIED (공식 HMR API 문서, breaking change 목록에 미포함). 단 `import.meta.hot.accept`에 **URL을 직접 넘기는 방식은 8.0에서 제거**(id로 대체) → 본 스킬 예시는 `hot.on(...)`만 사용해 직접 영향 없음(DISPUTED 아님, 참고 사항으로 반영)

**보강(ADD)**: 상단 소스 블록에 Vite 8/Rolldown 확인 결과 주의문 추가 — (1) dev 서버 cold start/HMR 지연에 대한 공식 수치 변화 없음(서드파티 블로그의 구체적 ms 수치 주장은 공식 문서 미확인으로 반영 보류), (2) 캐시 위치·HMR 이벤트 API는 8.x에서도 그대로 유지되어 본 스킬 방법론 수정 불필요, (3) `import.meta.hot.accept(url)` 제거 사실을 참고로 명시. 섹션 7 보고 템플릿의 "Vite 8.x" 표기는 이미 반영되어 있음을 확인(2026-08-11 지적 항목 해결 확인, 아래 개선 필요 사항 갱신).

**실전 질문 재검증**:
- Q1. "Vite 8(Rolldown)로 마이그레이션한 프로젝트에서 이 스킬의 cold start 측정 스크립트(`bench-cold.sh`, `--prepare 'rm -rf node_modules/.vite'`)를 그대로 써도 되는가?" → SKILL.md 상단 ADD 주의 블록 근거로 PASS — 캐시 경로·`--force` 동작 불변 확인, 수정 없이 적용 가능
- Q2. "Vite 8에서 dev 서버가 체감상 빨라졌다는 블로그 글이 있는데 이 수치를 보고서에 인용해도 되나?" → SKILL.md ADD 주의 블록 근거로 PASS — 공식 문서 미확인 수치는 인용하지 말고 섹션 2·3 방법론으로 직접 측정할 것을 안내

**재검증 최종 판정**: status **PENDING_TEST 유지** (실사용 필수 카테고리 — 실제 dev 서버 측정 검증 전까지 APPROVED 보류)

---

### 2026-08-11 재검증

**재검증일**: 2026-08-11
**수행자**: skill-tester → general-purpose (WebSearch 재검증 + content test 재수행)
**수행 방법**: SKILL.md 핵심 클레임 3개 WebSearch 재검증 + 실전 질문 3개 재수행 (2026-05-14와 다른 질문으로 갱신)

#### WebSearch 재검증 (핵심 클레임 3개)

| # | 클레임 | 검증 결과 |
|---|--------|-----------|
| 1 | Vite HMR API `vite:beforeUpdate`/`vite:afterUpdate` 이벤트 유효성 | ✅ 변동 없음 — 공식 문서(vite.dev/guide/api-hmr)에 여전히 지원 이벤트로 명시 |
| 2 | Chrome DevTools Performance 패널 Record and reload / Capture settings(Network·CPU throttling) | ✅ 변동 없음 — 이름·위치 동일, CPU 캘리브레이션 기능 추가 확인 |
| 3 | 대상 도구 버전 (Vite) 최신성 | ⚠️ **메이저 버전 변경 발견** — 2026-03-12 **Vite 8** 정식 출시(Rolldown 기반 Rust 번들러로 아키텍처 개편, 최신 패치 8.2.1). SKILL.md 본문은 HMR API·hyperfine 측정 방법론 자체를 다루며 Vite 버전에 종속된 API 변경은 없어 방법론은 여전히 유효. 다만 "7. 보고 템플릿" 예시 표(줄 303)의 "Vite 7.x"는 예시 데이터일 뿐이라 실사용에 영향 없음 |

#### 실제 수행 테스트 (2026-08-11, 신규 질문)

**Q1. Docker + macOS 호스트 마운트 환경에서 HMR 미반응 원인·대응**
- ✅ PASS
- 근거: SKILL.md "6.1 파일 시스템 워처 차이" 표 — "Docker 컨테이너 + macOS/Windows 마운트" 행 (FSEvents·ReadDirectoryChanges 미전달) + "폴링 켜면 지연 증가" 주의문
- 상세: 원인(호스트 워처 이벤트가 컨테이너에 전달 안 됨)과 대응(`CHOKIDAR_USEPOLLING=true`/`WATCHPACK_POLLING=true`) 모두 정확히 근거 제시. 경미한 gap: 워처 라이브러리-도구 대응관계, vite.config 레벨 폴링 설정 코드 예시 부재 (선택 보강)

**Q2. "ready in" 시점과 "첫 페이지 인터랙티브 시점"을 별도 지표로 보고해야 하는 이유**
- ✅ PASS
- 근거: SKILL.md "6.4 첫 페이지 요청까지 포함 여부" 섹션 — `dev_ready_ms`/`first_paint_ms`/`tti_ms` 3분리 지표 정의
- 상세: SPA entry 모듈 transform이 cold일 때 첫 요청이 수백ms~수초 추가 소요되는 이유가 명확히 근거 제시됨. 경미한 gap: `first_paint_ms`/`tti_ms` 자동 추출 스크립트 연계는 수동 DevTools 절차만 제공 (선택 보강)

**Q3. HMR 30회 측정 시 median을 1차 지표로 삼는 이유**
- ✅ PASS
- 근거: SKILL.md "6.6 측정 횟수와 통계" 섹션 + "6.3 백그라운드 프로세스·전원 상태" (outlier 유발 요인) + "7. 보고 템플릿" (median 표제 일관 사용)
- 상세: median이 outlier(전원 모드 변동·Spotlight 인덱싱 등)에 강하다는 근거가 교차 섹션에서 확인됨. 경미한 gap: "median이 mean보다 이상치에 강한 통계적 원리" 자체는 명시적으로 서술되지 않고 추론 필요 (선택 보강)

#### 발견된 gap (2026-08-11 재검증)

- Vite 8(Rolldown) 출시로 "7. 보고 템플릿" 예시의 "Vite 7.x" 표기가 최신 메이저와 어긋남 — 예시 데이터일 뿐이라 방법론에는 영향 없음, 표기 갱신은 선택 보강
- 워처 라이브러리-도구 대응관계, DevTools 자동 추출 연계, median 통계적 원리 서술 — 선택 보강 3건

#### 판정 (2026-08-11)

- WebSearch 재검증: 3/3 클레임 확인, 1건 메이저 버전 변경(Vite 8) 발견 — 방법론 자체는 영향 없음
- agent content test: 3/3 PASS (신규 질문)
- verification-policy 분류: 워크플로우 스킬 (실사용 필수 카테고리) — 재확인
- 최종 상태: PENDING_TEST 유지 (content test 누적 6/6 PASS, 실제 dev 서버 측정 검증 전까지 APPROVED 보류)

---

### 2026-05-14 최초 테스트

**수행일**: 2026-05-14
**수행자**: skill-tester → general-purpose (frontend-developer 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Vite import.meta.hot 이벤트로 HMR update latency 측정 + 서버 감지 시간 분리 방법**
- PASS
- 근거: SKILL.md "3.1 Vite HMR API로 정밀 측정 (권장)" 섹션 (line 115-145)
- 상세: `vite:beforeUpdate`/`vite:afterUpdate` 이벤트 + `performance.now()` 시간차로 client-side latency 계산. 서버 감지 시간 분리는 `Date.now() - payload.updates[0].timestamp` 공식으로 SKILL.md에 명시됨. `vite:hmr-update` 등 잘못된 이벤트명 사용 anti-pattern 피할 수 있음.

**Q2. Webpack stats.timings 활성화 설정 방법 + WSL2에서 HMR 미동작 시 최우선 점검 사항**
- PASS
- 근거: SKILL.md "3.2 dev 서버 로그 파싱" 섹션 (line 151-164) + "6.1 파일 시스템 워처 차이" 섹션 (line 252-262)
- 상세: `webpack.config.js`의 `stats: { timings: true, builtAt: true }` 설정과 CLI `--stats verbose` 모두 근거 있음. WSL2 + `/mnt/c/...` 케이스는 inotify가 NTFS 이벤트를 못 받는 것이 원인이므로 ext4 홈 디렉터리로 이동이 올바른 해결책. Docker 폴링 설정(`CHOKIDAR_USEPOLLING=true`)과 혼동하는 anti-pattern 피할 수 있음.

**Q3. hyperfine cold start 10회 측정 명령 구조 + 단일 측정값 금지 이유 및 권장 통계 지표**
- PASS
- 근거: SKILL.md "2.1 기본 패턴" 섹션 (line 42-56) + "6.6 측정 횟수와 통계" 섹션 (line 288-292)
- 상세: `--runs 10 --warmup 0 --prepare 'rm -rf node_modules/.vite'` 패턴 명시. 중앙값을 1차 지표로 사용하고 표준편차/IQR로 노이즈 평가하는 원칙 기록됨. `--warmup 1` 이상 사용, `--runs 3` 미달, 평균값을 1차 지표 사용하는 anti-pattern 모두 피할 수 있음.

### 발견된 gap

없음 — 3개 질문 모두 SKILL.md 내에서 명확한 근거 섹션 확인됨.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 워크플로우 스킬 (실사용 필수 카테고리) — content test PASS 후에도 PENDING_TEST 유지
- 최종 상태: PENDING_TEST (실제 dev server 측정 후 APPROVED 전환 가능)

---

> (참고 — skill-creator 원본 메모) skill-tester 호출은 메인 세션에서 별도 수행 예정이었음. 위 기록이 해당 수행 결과임.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 3/3 PASS (2026-05-14) + 3/3 PASS (2026-08-11 재검증) + 2/2 PASS (2026-09-28 재검증 셀프) + 2/2 PASS (2026-09-28 skill-tester→general-purpose 실제 에이전트), 누적 10/10 PASS |
| WebSearch 재검증 (2026-08-11) | ⚠️ HMR API·DevTools 패널 변동 없음, Vite 8(Rolldown) 메이저 출시 확인(방법론 영향 없음) |
| WebSearch·WebFetch 재검증 (2026-09-28) | ✅ 공식 마이그레이션 가이드 확인 — 캐시 위치·`--force`·HMR 이벤트 API 8.x에서도 유지, dep pre-bundling만 esbuild→Rolldown 교체(방법론 영향 없음). 서드파티 블로그의 HMR 수치 주장은 공식 미확인으로 미반영 |
| 실사용 테스트 (실제 dev 서버 측정) | ✅ **(2026-09-28 완료)** lab 샘플에서 cold/warm start hyperfine 측정 + §3.1 HMR API(Chrome 실브라우저) + §3.2 로그파싱(20회 자동화) 모두 실행, 서술 오류 3건 발견·정정 |
| **최종 판정** | **APPROVED** (2026-09-28 실사용 실행 검증 완료 — macOS 스크립트 버그 2건·로그파싱 전제조건 누락 1건 최소 정정 후 전환) |

> 해당 스킬은 **실사용 필수 카테고리**(워크플로우 스킬 — 실제 측정 실행 결과 검증 필요)에 해당. content test PASS 후에도 PENDING_TEST 유지 가능.

---

## 7. 개선 필요 사항

- [✅] skill-tester로 2~3개 실전 질문 수행 (2026-05-14 완료, 3/3 PASS) — Q1 import.meta.hot latency / Q2 stats.timings+WSL2 / Q3 hyperfine 명령 구조+통계 (2026-08-11 재검증 3/3 PASS 추가 — Docker+macOS 마운트 HMR 미반응 / ready 시점 vs 인터랙티브 시점 분리 / median 1차 지표 근거)
- [✅] **(2026-09-28 완료)** 실제 측정 — Vite 8.3.1 "ready in" 정규식(`ready\ in`)이 그대로 매칭 확인(cold/warm 각 10회 전부 성공)
- [✅] **(2026-09-28 확인)** "7. 보고 템플릿" 예시 표는 이미 "Vite 8.x"로 표기되어 있음을 확인 (2026-08-11 지적 항목 해결됨)
- [✅] **(2026-09-28 완료)** Vite 8(Rolldown) dev 서버 동작 변화 여부를 공식 마이그레이션 가이드로 확인해 상단 소스 블록에 주의문 추가 — 캐시 위치·HMR 이벤트 API 불변, dep pre-bundling 엔진만 교체(방법론 영향 없음)
- [✅] **(2026-09-28 완료)** 실제 dev 서버 cold/warm start(hyperfine) + HMR latency(§3.1 API 실브라우저, §3.2 로그파싱 자동화) 실행 검증 — §2.2 스크립트 macOS 비호환 버그 2건(`date +%s%3N`, `exit 0` 누락) + §3.2 "브라우저 클라이언트 연결 필수" 전제조건 누락 1건 발견, 전부 최소 정정

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성 (Vite 7.x / Webpack 5 + dev-server v5 / Chrome 129+ 기준) | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 import.meta.hot latency / Q2 stats.timings+WSL2 / Q3 hyperfine 명령+통계) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
| 2026-08-11 | v1 | 재검증 — WebSearch 3건 중 Vite 8(Rolldown) 메이저 출시 발견(방법론 영향 없음) + content test 재수행 (Q1 Docker+macOS 마운트 HMR 미반응 / Q2 ready vs 인터랙티브 시점 분리 / Q3 median 1차 지표 근거) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
| 2026-09-28 | v2 | 재검증(2차) — 공식 마이그레이션 가이드로 Vite 8(Rolldown) dev 서버 동작 변화 확인(캐시 위치·HMR 이벤트 API 불변, dep pre-bundling 엔진만 교체) + 상단 소스 블록에 주의문 추가 + content test 2/2 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | 메인 세션 |
| 2026-09-28 | v2 | skill-tester 실사용 재테스트 — general-purpose 에이전트로 2차 재검증분(Vite 8/Rolldown ADD 블록, hot.accept URL 제거) 겨냥 질문 2개 재수행 → 2/2 PASS, 누적 10/10 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
| 2026-09-28 | v3 | **실사용(실행) 검증 완료** — lab Vite 8+React 19 샘플에서 cold/warm start(hyperfine) + HMR API(Chrome 실브라우저) + 로그파싱(20회 자동화) 실행. §2.2 bench-cold.sh macOS 비호환 버그 2건(GNU-only `date +%3N`, `exit 0` 누락) + §3.2 "브라우저 클라이언트 연결 필수" 전제조건 누락 발견해 최소 정정. status **PENDING_TEST → APPROVED** | 실행검증 세션 |
