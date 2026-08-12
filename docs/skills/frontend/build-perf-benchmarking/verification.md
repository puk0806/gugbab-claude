---
skill: build-perf-benchmarking
category: frontend
version: v1
date: 2026-05-14
status: PENDING_TEST
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
| 스킬 경로 | `.claude/skills/frontend/build-perf-benchmarking/SKILL.md` |
| 검증일 | 2026-05-14 |
| 검증자 | skill-creator agent |
| 스킬 버전 | v1 |
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
| 외부 hyperfine 사용 가이드 | https://imzye.com/Tips/how-to-use-hyperfine/ | ⭐⭐ Medium | 2026-05-14 | JSON 스키마 교차 검증 |

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

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-14 skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (보완 필요 없음 — 3/3 PASS)

---

## 5. 테스트 진행 기록

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
| 에이전트 활용 테스트 | ✅ (2026-05-14 3/3 PASS + 2026-08-11 재검증 3/3 PASS, 누적 6/6 PASS) |
| WebSearch 재검증 (2026-08-11) | ✅ hyperfine v1.20.0·옵션·Vite 캐시 위치 3건 모두 변동 없음 |
| 실사용 테스트 (hyperfine 실제 실행) | ❌ (실사용 필수 카테고리 — 측정 도구 출력 검증 필요) |
| **최종 판정** | **PENDING_TEST** (content test 누적 6/6 PASS, 실사용 검증 후 APPROVED 전환 예정) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 content test 수행 (2026-05-14 완료, 3/3 PASS — cold/warm 분리·median/p95 추출·runs/warmup 권장값·warmup vs prepare 목적 차이 시나리오 포함 / 2026-08-11 재검증 3/3 PASS 추가 — Turborepo git stash 대안·first-run 경고 대응·혼동변수 필수 항목)
- [❌] 실제 프로젝트에서 hyperfine v1.20.0 실행해 markdown/JSON 출력 형식이 스킬 설명과 일치하는지 확인 (차단 요인: 실사용 필수 카테고리 조건 미충족 — 실제 실행 전까지 PENDING_TEST 유지)
- [❌] macOS/Linux/Windows 각 OS에서 `--prepare` 명령 동작 확인 (선택 보강: 특히 Windows에서 `rm -rf` 대체 명령 추가 필요, APPROVED 전환 조건은 아님)
- [❌] turborepo 모노레포에서 `--filter=` 옵션과 hyperfine 조합 측정 검증 + 워크트리별 `.turbo` 캐시 격리 방법 (선택 보강: 실전 도입 이후 추가 검증 권장)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성 — hyperfine v1.20.0 기준, cold/warm 분리·median/p95 보고·혼동변수 통제·안티패턴 9개 포함 | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 Vite cold/warm 분리 측정 / Q2 median·p95 추출 방법 / Q3 45초 빌드 runs/warmup 권장값 + warmup vs prepare 목적 차이) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
| 2026-08-11 | v1 | 재검증 — WebSearch 3건(hyperfine 버전·옵션·Vite 캐시 위치) 모두 변동 없음 확인 + content test 재수행 (Q1 Turborepo git stash 대안 / Q2 first-run 경고 대응 / Q3 혼동변수 필수 항목) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
