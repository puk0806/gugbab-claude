---
skill: bundle-size-analysis
category: frontend
version: v2
date: 2026-09-28
status: APPROVED
---

# bundle-size-analysis — 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `bundle-size-analysis` |
| 스킬 경로 | `.claude/skills/bundle-size-analysis/SKILL.md` |
| 검증일 | 2026-09-28 (재검증, 이전 2026-05-14) |
| 검증자 | skill-creator (Claude Opus 4.7) |
| 스킬 버전 | v2 |
| 카테고리 분류 | **실사용 필수 스킬** — 실제 visualizer 산출물·CI 결과로 검증 필요 → `PENDING_TEST` 유지 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (GitHub README 4종)
- [✅] 공식 GitHub 2순위 소스 확인 (btd/rollup-plugin-visualizer, KusStar/vite-bundle-visualizer, webpack-contrib/webpack-bundle-analyzer, ai/size-limit)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-05-14)
  - rollup-plugin-visualizer 7.0.1 (2026-03-03)
  - vite-bundle-visualizer 1.2.1
  - size-limit 12.1.0 (2026-04-13)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (raw/gzip/brotli 구분, 비교 보고 형식)
- [✅] 코드 예시 작성 (Vite/Webpack 설정, size-limit GitHub Action)
- [✅] 흔한 실수 패턴 정리 (7개 함정)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebFetch | 4개 공식 GitHub README (rollup-plugin-visualizer, vite-bundle-visualizer, webpack-bundle-analyzer, size-limit) | 옵션·기본값·CLI 플래그·최신 버전 수집 |
| 교차 검증 | WebSearch | 4개 검색 — 버전·옵션·CI 통합·CLI 플래그 | VERIFIED 12 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| rollup-plugin-visualizer GitHub | https://github.com/btd/rollup-plugin-visualizer | ⭐⭐⭐ High | 2026-05-14 | 공식 레포 (Vite 생태계 표준) |
| vite-bundle-visualizer GitHub | https://github.com/KusStar/vite-bundle-visualizer | ⭐⭐⭐ High | 2026-05-14 | 공식 CLI 레포 |
| webpack-bundle-analyzer GitHub | https://github.com/webpack-contrib/webpack-bundle-analyzer | ⭐⭐⭐ High | 2026-05-14 | webpack-contrib 공식 |
| size-limit GitHub | https://github.com/ai/size-limit | ⭐⭐⭐ High | 2026-05-14 | 공식 레포 (Andrey Sitnik) |
| rollup-plugin-visualizer npm | https://www.npmjs.com/package/rollup-plugin-visualizer | ⭐⭐⭐ High | 2026-05-14 | 버전 7.0.1 확인 |
| jsdocs.io 패키지 페이지 | https://www.jsdocs.io/package/rollup-plugin-visualizer | ⭐⭐ Medium | 2026-05-14 | 옵션 시그니처 교차 확인 |
| size-limit GitHub Action 문서 | https://github.com/marketplace/actions | ⭐⭐⭐ High | 2026-05-14 | andresz1/size-limit-action 사용법 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (rollup-plugin-visualizer 7.0.1, vite-bundle-visualizer 1.2.1, size-limit 12.1.0)
- [✅] deprecated된 패턴을 권장하지 않음 (bundlesize는 "비유지보수에 가까움"으로 명시)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (raw/gzip/brotli, 3가지 size types)
- [✅] 코드 예시 포함 (Vite/Webpack 설정, size-limit 설정, GitHub Action)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (CLI vs 플러그인 선택 표)
- [✅] 흔한 실수 패턴 포함 (7개 함정)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-14 skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음 — 보완 불필요)

---

## 4-A. 교차 검증된 클레임 (12건)

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|----------|----------|------|
| 1 | rollup-plugin-visualizer 최신 안정 버전 7.0.1 (2026-03-03) | GitHub README | npm 페이지·jsdocs.io | VERIFIED |
| 2 | `gzipSize` / `brotliSize` 옵션 기본값 둘 다 `false` | GitHub README | WebSearch (옵션 시그니처) | VERIFIED |
| 3 | 지원 템플릿: sunburst/treemap/treemap-3d/network/flamegraph/raw-data/list/markdown | GitHub README | WebFetch 본문 | VERIFIED |
| 4 | rollup-plugin-visualizer 7.x는 Node.js ≥ 22 필요 | GitHub README | npm 페이지 | VERIFIED |
| 5 | vite-bundle-visualizer 최신 1.2.1, CLI는 rollup-plugin-visualizer 기반 | GitHub README | npm 페이지 | VERIFIED |
| 6 | vite-bundle-visualizer 템플릿 5종: treemap/sunburst/network/raw-data/list | GitHub README | WebSearch 결과 | VERIFIED |
| 7 | webpack-bundle-analyzer 3 size types: stat / parsed / gzip | GitHub README | WebSearch 결과 본문 | VERIFIED |
| 8 | `defaultSizes` 기본값 `parsed`, 옵션 `stat`/`parsed`/`gzip`/`brotli`/`zstd` | GitHub README | WebSearch CLI 옵션 | VERIFIED |
| 9 | `analyzerMode` 옵션 `server`/`static`/`json`/`disabled` | GitHub README | WebFetch 본문 | VERIFIED |
| 10 | size-limit 최신 12.1.0 (2026-04-13), brotli 기본 압축 | GitHub README | WebFetch 본문 | VERIFIED |
| 11 | size-limit limit 단위: 바이트(`"10 kB"`) + 실행 시간(`"500 ms"`) | GitHub README | WebFetch 본문 | VERIFIED |
| 12 | `andresz1/size-limit-action@v1` GitHub Action 표준 통합 | GitHub README | WebSearch 결과 | VERIFIED |

DISPUTED·UNVERIFIED 항목 없음.

---

## 5. 테스트 진행 기록

### [2026-09-28] 실사용(실행) 검증

**수행일**: 2026-09-28
**수행 방법**: 레포 밖 lab 폴더(`fe-perf/app`, Vite 8.3.1+React 19+dayjs+lazy chunk 1개, Node v22.23.1)에 `rollup-plugin-visualizer@7.1.1`·`size-limit@14.1.0`·`@size-limit/preset-app@14.1.0`을 로컬 설치(npm registry 최신과 정확히 일치). `vite.config.ts`에 `visualizer({ gzipSize: true, brotliSize: true, template: 'treemap' })` 추가 후 빌드, `package.json`에 size-limit 3개 entry(정상 2개 + 의도적 초과 1개) 등록 후 `npx size-limit` 실행.
**실행 결과**: (1) `node_modules/rollup`이 없고 `rolldown`만 있는 실제 Vite 8 환경에서 `tsc -b`가 TS2307 없이 통과 — §2-4 ADD 클레임("7.1.0+ 은 rollup 미설치 환경에서도 타입 안전") 확인. (2) `dist/stats.html`(178KB)에 `gzipLength`/`brotliLength` 필드 존재, 반대로 옵션 미설정 시 `raw-data` 출력에서 두 필드가 0으로 나와 "기본값 false" 클레임 확인. (3) `npx size-limit` 출력이 "brotlied" 라벨 사용(§6-2 기본 브로틀리 확인), 시간 단위 지표("Loading time on slow 3G", "Running time on Snapdragon 410")까지 출력, 의도적으로 1KB 한도를 건 항목에서 `Package size limit has exceeded by 58.67 kB` 메시지 + **exit code 1**로 CI-fail 동작 확인. (4) `node_modules/size-limit`·`rollup-plugin-visualizer`의 `package.json` `engines.node` 필드가 SKILL.md 상단 Node 버전 요건과 정확히 일치.
**졸업 조건 충족 여부**: 충족 — PENDING_TEST.md의 "visualizer·size-limit 실행 후 리포트 산출" 조건을 rollup-plugin-visualizer(treemap HTML)+size-limit(CLI 리포트+exit code) 둘 다로 충족. (webpack-bundle-analyzer·vite-bundle-visualizer는 이번 실행 범위 밖 — 스킬이 다루는 3개 도구 중 그래프 섹션 1의 raw/gzip/brotli 정의를 관통하는 rollup-plugin-visualizer+size-limit 조합으로 검증)
**판정**: APPROVED 전환 — 서술과 실행 결과 전부 일치, SKILL.md 수정 불필요.

---

### [2026-09-28] skill-tester content test 재수행 (size-limit 14.x·rollup-plugin-visualizer 7.1.x 정정 반영 확인)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인. 두 질문 모두 아래 2026-09-28 재검증(2차)에서 정정·보강된 내용을 직접 겨냥.

### 실제 수행 테스트

**Q1. Vite 8 프로젝트에서 rollup-plugin-visualizer 붙였을 때 TS2307 타입 에러 원인·해결**
- ✅ PASS
- 근거: SKILL.md "2-4. 환경 요구사항" ADD 주의 블록(113행)
- 상세: "Vite 8은 rolldown을 쓰고 rollup을 설치하지 않아 7.1.0 미만 버전의 타입 선언이 깨진다"는 원인과 "`rollup-plugin-visualizer@^7.1.0` 이상 설치" 해결책을 정확히 인용. 정정된 내용(7.0.1→7.1.1)이 답변에 정확히 반영됨, 구버전 잔존 정보 없음.

**Q2. size-limit 14.x 업그레이드 시 기존 preset-app 설정 파손 여부 + Node 버전 요건**
- ✅ PASS
- 근거: SKILL.md "6-2. 핵심 동작" ADD 주의 블록(293행) + 상단 소스 인용(16행)
- 상세: "14.0.0의 breaking change는 preset-small-lib 대상이라 preset-app 설정은 안전"과 Node 요건 `^22.19.0 || ^24.5.0 || >=26.0.0`을 정확히 인용. 정정된 내용(13.0.3→14.1.0)이 답변에 정확히 반영됨.

### 발견된 gap

- 없음(차단 요인 기준). Q1·Q2 모두 SKILL.md 본문 내 명확한 근거로 완전히 답변됨.

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 실사용 필수 카테고리 (visualizer 산출물·CI 결과로만 최종 검증 가능)
- 최종 상태: PENDING_TEST 유지 (content test 누적 10/10 PASS, 실 프로젝트 적용 후 APPROVED 전환)

---

### [2026-09-28] 재검증(2차) — size-limit 13→14 메이저 + rollup-plugin-visualizer 7.1.x (Vite 8 타입 수정)

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 3개를 1차 소스(npm registry·GitHub CHANGELOG/Releases API)와 대조, ADD 항목 반영

**클레임 대조 결과**:
1. size-limit 최신 버전 → 13.0.3(2026-08-11 기록) 대비 **14.1.0(2026-09-27)로 메이저 2단계 진행** — DISPUTED(정정): npm registry `size-limit@latest` 확인. GitHub Releases로 13.1.0~14.1.0 변경 이력 전수 확인: 13.1.0 rolldown/rolldown-why 플러그인 추가, **14.0.0 breaking change**(`@size-limit/preset-small-lib` 기본 번들러 rolldown 전환, Node 지원 범위 통일, 의존성 제거), 14.0.1 rolldown 플러그인 크기 버그 수정, 14.1.0 `--ignore-missing` 인자 추가. 본 스킬이 쓰는 `@size-limit/preset-app` 설정 문법·CI Action 사용법은 breaking change 대상 아님(안전).
2. rollup-plugin-visualizer 최신 버전 → 7.0.1 대비 **7.1.1로 갱신** — DISPUTED(정정): npm registry 확인. 공식 CHANGELOG.md(GitHub raw) 확인 결과 **7.1.0에서 중요 버그 수정**: 배포된 타입 선언이 `rollup` 패키지를 직접 import해 `rolldown`만 설치된 환경(스킬에 `rollup` 없이 `vite`/`rolldown`만 있는 경우)에서 타입이 `any`로 깨지거나 `TS2307` 에러 발생 — **"Vite 8을 쓰는 모든 사용자가 영향받았다"**(Vite 8은 내부적으로 rolldown 사용, `rollup` 미설치)고 CHANGELOG에 명시. 7.1.0 이상에서 수정됨.
3. vite-bundle-visualizer 최신 버전 1.2.1 → VERIFIED, 변동 없음 (npm registry)

**보강(ADD)**:
- 상단 소스 인용 버전 기준을 rollup-plugin-visualizer 7.1.1 / size-limit 14.1.0으로 갱신, 14.x Node 요건(`^22.19.0 || ^24.5.0 || >=26.0.0`) 명시
- 섹션 2-4에 "Vite 8 사용자 필수" 주의 블록 추가 — rollup-plugin-visualizer 7.1.0 미만이면 Vite 8(rolldown 기반) 프로젝트에서 타입 에러 발생, 7.1.0 이상 필수
- 섹션 6-2에 size-limit 13→14 breaking change 요약 추가 — preset-app 사용자는 영향 없음을 명시, Node 버전 요건 갱신 안내

**실전 질문 재검증**:
- Q1. "Vite 8 프로젝트에서 rollup-plugin-visualizer 타입 에러(TS2307)가 나는 이유는?" → SKILL.md "2-4. 환경 요구사항" ADD 주의 블록 근거로 PASS — rollup 미설치+타입이 rollup import 하드코딩된 7.0.x 문제, 7.1.0 이상으로 해결
- Q2. "size-limit을 14.x로 올렸는데 기존 preset-app 설정이 깨지나?" → SKILL.md "6-2 핵심 동작" ADD 주의 블록 근거로 PASS — 14.0.0 breaking change는 preset-small-lib 대상이라 preset-app 설정 문법은 안전, 단 Node 버전 요건 확인 필요

**재검증 최종 판정**: status **PENDING_TEST 유지** (실사용 필수 카테고리 — visualizer 산출물·CI 결과 실사용 검증 전까지 APPROVED 보류)

---

### 2026-08-11 재검증

**재검증일**: 2026-08-11
**수행자**: skill-tester → general-purpose (WebSearch 재검증 + content test 재수행)
**수행 방법**: SKILL.md 핵심 클레임 3개(패키지 최신 버전) WebSearch 재검증 + 실전 질문 3개 재수행 (2026-05-14와 다른 질문으로 갱신)

#### WebSearch 재검증 (핵심 클레임 3개)

| # | 클레임 | 검증 결과 |
|---|--------|-----------|
| 1 | rollup-plugin-visualizer 7.0.1 (2026-03-03) | ✅ 변동 없음 — 2026-08-11 기준에도 최신 (npm registry) |
| 2 | vite-bundle-visualizer 1.2.1 | ✅ 변동 없음 (npm registry) |
| 3 | size-limit 12.1.0 (2026-04-13) | ⚠️ **버전 드리프트 발견** — 2026-07-30에 **13.0.3**으로 메이저 업 (13.0.0에서 Node.js 20 지원 종료, `tinyglobby`/`jiti` 의존성 제거가 breaking change). SKILL.md 섹션 6의 설정 문법(`size-limit` 배열, `limit` 단위, brotli 기본 압축)은 breaking change 목록에 포함되지 않아 내용 자체는 여전히 유효하나, 버전 표기(frontmatter 및 소스 표)는 outdated |

#### 실제 수행 테스트 (2026-08-11, 신규 질문)

**Q1. Next.js 프로젝트 번들 크기 분석 패키지·설정**
- ✅ PASS
- 근거: SKILL.md "4-4. CRA / Next.js 통합" 섹션 — `@next/bundle-analyzer` 설치 + `withBundleAnalyzer` 래핑 + `ANALYZE=true npm run build`
- 상세: 핵심 명령·절차 근거 충분. 경미한 gap: `next.config.js` 전체 코드 스니펫 미포함, App Router 대응 여부 미언급 (보강 권장, 차단 요인 아님)

**Q2. 저사양 기기 JS parse/execute 시간 확인 시 봐야 할 지표**
- ✅ PASS
- 근거: SKILL.md "1-2. 언제 어떤 지표를 보나" 표 — "JS parse / execute 시간 → raw (parsed)" 행 + "브라우저는 압축 해제 후 raw 크기를 파싱한다" 설명
- 상세: 정답(raw/parsed) 근거 명확. 경미한 gap: "raw (=stat/parsed)"(1-1)와 "stat≠parsed"(4-3, defaultSizes 기본값 'parsed')가 용어상 약간 혼용됨 — SKILL.md 내 표현 일관성 이슈 (차단 요인 아님, 보강 권장)

**Q3. 동일 모듈 중복 설치(duplicate dependency) 진단·해결**
- ✅ PASS
- 근거: SKILL.md "7-3. duplicate dependency" 섹션 — `npm ls react` 진단, `npm dedupe` 자동 정리, Vite `resolve.dedupe` 강제 단일화
- 상세: 진단·해결 근거 충분. 경미한 gap: `lodash`/`lodash-es`처럼 이름이 다른 중복 패키지는 `npm dedupe`로 해결 안 되는데 후속 조치 미언급, Webpack 프로젝트의 동등 해결책(`resolve.alias`) 부재 (보강 권장, 차단 요인 아님)

#### 발견된 gap (2026-08-11 재검증)

- **버전 드리프트**: size-limit 12.1.0 → 13.0.3 (SKILL.md 갱신 필요, 사용자 승인 후 진행 — breaking change는 Node 20 지원 종료뿐이라 설정 문법 자체는 안전)
- raw/stat/parsed 용어 일관성 (선택 보강)
- Next.js App Router 코드 스니펫, lodash-es 중복 해결·Webpack resolve.alias 언급 (선택 보강)

#### 판정 (2026-08-11)

- WebSearch 재검증: 3/3 클레임 확인, 1건 버전 드리프트 발견 (size-limit — SKILL.md 미수정 상태로 보고, 사용자 승인 대기)
- agent content test: 3/3 PASS (신규 질문)
- verification-policy 분류: 실사용 필수 카테고리 (visualizer 산출물·CI 결과로만 최종 검증 가능) — 재확인
- 최종 상태: PENDING_TEST 유지 (content test 누적 6/6 PASS, 실사용 검증 전까지 APPROVED 보류 + size-limit 버전 갱신 별도 후속 필요)

---

### 2026-05-14 최초 테스트

**수행일**: 2026-05-14
**수행자**: skill-tester → frontend-developer (에이전트 존재 확인 후 SKILL.md 직접 대조 검증)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. rollup-plugin-visualizer에서 gzip·brotli 크기를 함께 표시하려면?**
- PASS
- 근거: SKILL.md "2-1. 설치 & 기본 설정" 섹션 — `gzipSize: true`, `brotliSize: true` 옵션 코드 블록 및 "★ 기본 false" 주의사항 명시
- 상세: 기본값이 둘 다 false라는 함정과 명시적으로 켜야 한다는 안내가 모두 포함됨. anti-pattern(기본값 착각으로 옵션 생략) 회피 근거 충분

**Q2. webpack-bundle-analyzer의 stat / parsed / gzip 세 size의 의미와 CI 임계치 기준 선택은?**
- PASS
- 근거: SKILL.md "1-3. webpack-bundle-analyzer의 3가지 size 차이" 섹션 및 "7-5. gzip 합산을 전체 파일 gzip으로 착각" 섹션
- 상세: stat(minify 전), parsed(minify 후), gzip(모듈별 개별 압축)의 정의와 "모듈별 개별 압축이므로 합산 ≠ 실제 파일 gzip" 주의사항 모두 포함. CI 임계치는 파일 단위 gzip/brotli인 size-limit이 더 정확하다는 근거도 있음

**Q3. size-limit + GitHub Actions로 brotli 200 KB 초과 시 PR CI fail 설정은?**
- PASS
- 근거: SKILL.md "6-1. 설치 & 기본 설정", "6-2. 핵심 동작", "6-3. GitHub Actions 통합" 섹션
- 상세: 설치 명령(`npm install -D size-limit @size-limit/preset-app`), package.json `size-limit` 배열 설정, `andresz1/size-limit-action@v1` YAML 코드 모두 포함. brotli가 기본 압축이라는 점도 명시됨

### 발견된 gap

- 없음. 세 질문 모두 SKILL.md 해당 섹션에서 완전한 답변 근거가 확인됨

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: **실사용 필수 스킬** — 실제 visualizer 산출물·CI 통합 결과로 검증 필요
- 최종 상태: PENDING_TEST 유지 (content test PASS이더라도 실사용 필수 카테고리이므로 실 프로젝트 적용 후 APPROVED 전환)

---

### 테스트 케이스 1 (원본 예정 템플릿 — 참고용 보존)

**입력 (질문/요청):**
```
Vite 6 + React 프로젝트에서 청크별 gzip / brotli 크기를 한 번에 보고 싶다. config를 더럽히지 않는 방법은?
```

**기대 결과:**
- `vite-bundle-visualizer` CLI 사용 권장
- 명령: `npx vite-bundle-visualizer -t treemap`
- gzip/brotli는 내부 rollup-plugin-visualizer 옵션을 따르며 CLI에서는 기본 표시되는 점 주의 안내
- raw vs gzip vs brotli 의미 구분 (섹션 1)

### 테스트 케이스 2: (예정)

**입력:**
```
PR마다 브로틀리 크기 200 KB 초과 시 자동 차단하고 싶다. 설정 방법은?
```

**기대 결과:**
- `size-limit` + `@size-limit/preset-app` 설치
- package.json `size-limit` 필드에 `path`/`limit` 정의 (brotli 기본)
- `.github/workflows/size.yml`에 `andresz1/size-limit-action@v1` 사용
- SKILL.md 섹션 6 인용

### 테스트 케이스 3: (예정)

**입력:**
```
번들 변경 전후를 PR 설명에 어떻게 정리하나? 표 양식이 있나?
```

**기대 결과:**
- SKILL.md 섹션 5의 markdown 표 양식 인용
- Before/After/Δ를 gzip·brotli 둘 다 표기
- 초기 로드 vs lazy 분리, 합계·% 표기, 측정 조건 footnote 5원칙 안내

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (12/12 VERIFIED) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-14 3/3 PASS + 2026-08-11 재검증 3/3 PASS + 2026-09-28 WebSearch 재검증 2/2 PASS + **2026-09-28 skill-tester content test 재수행 2/2 PASS**, 누적 10/10 PASS) |
| WebSearch 재검증 (2026-08-11) | ⚠️ rollup-plugin-visualizer·vite-bundle-visualizer 변동 없음, size-limit 12.1.0→13.0.3 버전 드리프트 발견 |
| WebSearch 재검증 (2026-09-28) | ⚠️ size-limit 13.0.3→14.1.0 메이저 2단계 진행(반영 완료), rollup-plugin-visualizer 7.0.1→7.1.1 갱신(Vite 8 타입 버그 수정 포함, 반영 완료), vite-bundle-visualizer 1.2.1 변동 없음 |
| 실사용 테스트 (실제 visualizer·size-limit 실행) | ✅ **(2026-09-28 완료)** lab 샘플(Vite 8+React 19)에서 rollup-plugin-visualizer 7.1.1 TS2307 미발생 확인, gzip/brotli 기본 false 확인, size-limit 14.1.0 exit code 1(한도 초과) 확인 |
| **최종 판정** | **APPROVED** (2026-09-28 실사용 실행 검증 완료 — 전 클레임 일치, 수정 불필요) |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-14 완료, 3/3 PASS / 2026-08-11 재검증 3/3 PASS 추가 — Next.js 분석 패키지·raw/parsed 지표 선택·duplicate dependency 진단 / **2026-09-28 재수행 완료, 2/2 PASS** — Vite 8 TS2307 원인·해결, size-limit 14.x preset-app 영향 없음 확인)
- [✅] **(2026-09-28 완료)** 실제 Vite 8 프로젝트에서 `rollup-plugin-visualizer` 실행 → `dist/stats.html` 산출 확인, gzip/brotli 필드 존재+기본값 false 확인
- [✅] **(2026-09-28 완료)** 실제 `size-limit` 실행 → 의도적 초과 항목으로 exit code 1(fail) 재현, brotli 압축 라벨 확인 (GitHub Action 자체는 로컬 환경 특성상 미실행 — CLI 레벨 fail 동작으로 대체 검증, PENDING_TEST.md 졸업 조건은 "실행 후 리포트 산출"이라 충족)
- [❌] `vite-bundle-visualizer` CLI 단독 실행, webpack-bundle-analyzer `defaultSizes: 'brotli'`/`zstd` 호환성 확인 — 이번 실행 범위 밖 (선택 보강, 차단 요인 아님 — 스킬의 핵심 클레임은 rollup-plugin-visualizer+size-limit로 이미 검증됨)
- [✅] **(2026-09-28 완료)** size-limit 버전 표기를 13.0.3 → 14.1.0으로 갱신 + 14.0.0 breaking change(preset-small-lib rolldown 전환, Node 요건 협소화) 안내 추가. rollup-plugin-visualizer 7.0.1 → 7.1.1 갱신 + Vite 8(rolldown) 사용자 필수 타입 수정(7.1.0) 안내 추가

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성 (4개 공식 소스 기반, 12개 클레임 VERIFIED) | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 rollup-plugin-visualizer gzip·brotli 옵션 활성화 / Q2 webpack-bundle-analyzer stat·parsed·gzip 의미 및 CI 임계치 기준 / Q3 size-limit GitHub Actions CI 설정) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
| 2026-08-11 | v1 | 재검증 — WebSearch 3건 중 size-limit 12.1.0→13.0.3 버전 드리프트 발견(설정 문법은 영향 없음) + content test 재수행 (Q1 Next.js 분석 패키지 / Q2 raw/parsed 지표 선택 / Q3 duplicate dependency 진단) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리 + 버전 갱신 후속 필요) | skill-tester |
| 2026-09-28 | v2 | 재검증(2차) — size-limit 13.0.3→14.1.0 메이저 갱신 반영(preset-app은 breaking change 대상 아님 확인) + rollup-plugin-visualizer 7.0.1→7.1.1 갱신 반영(Vite 8/rolldown 사용자 필수 타입 버그 수정 7.1.0 안내 추가) + content test 2/2 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | 메인 세션 |
| 2026-09-28 | v2 | 2단계 실사용 테스트 재수행 (Q1 Vite 8 TS2307 원인·해결 / Q2 size-limit 14.x preset-app 파손 여부+Node 요건) → 2/2 PASS, PENDING_TEST 유지 (실사용 필수 카테고리 — 정정 내용이 답변에 정확히 반영됨 확인) | skill-tester |
| 2026-09-28 | v2 | **실사용(실행) 검증 완료** — lab Vite 8+React 19 샘플에서 rollup-plugin-visualizer 7.1.1(TS2307 미발생, gzip/brotli 기본 false) + size-limit 14.1.0(브로틀리 압축, 한도 초과 시 exit code 1) 실제 실행, 전 클레임 일치. status **PENDING_TEST → APPROVED** | 실행검증 세션 |
