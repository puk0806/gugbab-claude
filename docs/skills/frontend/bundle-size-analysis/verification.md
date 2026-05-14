---
skill: bundle-size-analysis
category: frontend
version: v1
date: 2026-05-14
status: PENDING_TEST
---

# bundle-size-analysis — 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `bundle-size-analysis` |
| 스킬 경로 | `.claude/skills/frontend/bundle-size-analysis/SKILL.md` |
| 검증일 | 2026-05-14 |
| 검증자 | skill-creator (Claude Opus 4.7) |
| 스킬 버전 | v1 |
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
| 에이전트 활용 테스트 | ✅ (2026-05-14 skill-tester 수행, 3/3 PASS) |
| **최종 판정** | **PENDING_TEST 유지** (실사용 필수 카테고리 — content test 3/3 PASS, 실 프로젝트 적용 후 APPROVED 전환) |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-14 완료, 3/3 PASS)
- [❌] 실제 Vite 프로젝트에서 `vite-bundle-visualizer` 실행 → 산출 stats.html 확인 — 차단 요인 아님, 선택 보강 (실사용 필수 카테고리이므로 실 프로젝트 도입 시 자연히 검증됨)
- [❌] 실제 size-limit + GitHub Action을 PR에서 fail/pass 시켜봐서 PR 코멘트 형식 검증 — 차단 요인 아님, 선택 보강 (도입 후 CI 실행으로 검증)
- [❌] webpack-bundle-analyzer `defaultSizes: 'brotli'` 옵션이 모든 webpack 5.x 환경에서 동작하는지 확인 (zstd는 최근 추가 — 환경별 호환성 주의 필요) — 차단 요인 아님, 선택 보강

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성 (4개 공식 소스 기반, 12개 클레임 VERIFIED) | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 rollup-plugin-visualizer gzip·brotli 옵션 활성화 / Q2 webpack-bundle-analyzer stat·parsed·gzip 의미 및 CI 임계치 기준 / Q3 size-limit GitHub Actions CI 설정) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
