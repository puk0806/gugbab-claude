---
name: 2026-05-14
description: "2026-05-14 추가한 frontend 스킬 5종 + validation 에이전트 2종(build-perf-benchmarker + perf-report-writer)의 생성·검증 이력. 측정 실행은 benchmarker → 보고서 작성은 report-writer 순으로 호출. 5개 스킬 중 4개는 실사용 필수 카테고리(PENDING_TEST 유지), 1개(web-vitals-rum-comparison)는 content test PASS로 APPROVED 전환"
metadata: 
  node_type: memory
  type: project
  originSessionId: fad2d3a7-7551-4503-a516-6a3524b02835
---

## 신규 산출물 7종

### 스킬 5종 (모두 frontend, creation-workflow.md 5단계 풀세트)

| 스킬 | 카테고리 분류 | status | 핵심 |
|------|--------------|--------|------|
| `frontend/build-perf-benchmarking` | 실사용 필수 | PENDING_TEST | hyperfine 1.20.0 빌드 시간 벤치마킹 — `--warmup`/`--prepare`/`--runs`/`--export-markdown`/`--export-json`, cold(`rm -rf node_modules/.vite`·`.turbo/cache` `--force`) vs warm, median + p95 JSON 후처리, `--prepare` vs `--warmup` 정반대 의미 주의 (20 클레임 전수 VERIFIED) |
| `frontend/bundle-size-analysis` | 실사용 필수 | PENDING_TEST | raw/gzip/brotli 청크 비교 — rollup-plugin-visualizer 7.0.1(`gzipSize`/`brotliSize` 기본 false·7+종 템플릿) + vite-bundle-visualizer 1.2.1 + webpack-bundle-analyzer(stat/parsed/gzip 3종) + size-limit 12.1.0 + andresz1/size-limit-action@v1 (12 클레임 전수 VERIFIED) |
| `frontend/dev-server-hmr-benchmarking` | 실사용 필수 | PENDING_TEST | dev cold start + HMR 지연 — Vite `import.meta.hot.on(*)` 8종 이벤트 + `performance.now()` latency, webpack `stats.timings: true`, Chrome DevTools Performance Capture settings, WSL2/macOS FSEvents 128 워처 함정 (9 클레임 전수 VERIFIED) |
| `frontend/lighthouse-ci-setup` | 실사용 필수 | PENDING_TEST | LHCI + CWV 회귀 감지 — `@lhci/cli@0.15.1` collect/assert/upload, CWV(LCP 2.5s·INP 200ms·CLS 0.1, 2024-03 FID→INP), 가중치 TBT 30/LCP 25/CLS 25/FCP 10/SI 10, treosh/lighthouse-ci-action@v12.6.2, temporary-public-storage 공개성 주의 (15 클레임 전수 VERIFIED) |
| `frontend/web-vitals-rum-comparison` | 경계선 → 본문 PASS | **APPROVED** | RUM 실사용자 CWV — `web-vitals` v5 onLCP/onINP/onCLS + visibilitychange, Sentry `browserTracingIntegration({enableInp})` + Discover `p75(measurements.inp)` + release, Datadog `@datadog/browser-rum` v7.1.0 + `@view.largest_contentful_paint` + RUM Explorer `@version:(A OR B)` Group by `@version` Measure p75 (13 클레임 전수 VERIFIED, 실 RUM 데이터 검증은 사용자 운영 환경) |

### 에이전트 2종 (모두 validation 카테고리, sonnet 모델)

| 에이전트 | 도구 | 역할 |
|---------|------|------|
| `validation/build-perf-benchmarker` | Bash + Read + Write | 측정 실행 전담. 4분기(빌드/번들/dev·HMR/Lighthouse) 참조 스킬별 분기. 산출물 `./bench-results/{YYYY-MM-DD}/{kind}/` `summary.md`+`raw.json`+`cmd.txt`. p95 JSON 후처리. 해석·서사는 perf-report-writer에 위임 (maxTurns 20) |
| `validation/perf-report-writer` | Read + Write + WebSearch | 측정 결과 → 이해관계자용 보고서. 7섹션 표준(Executive Summary·환경·측정 결과 median/p95/mean/stddev/IQR/CI95%/Δ/판정·혼동변수·통계적 해석·결론/권고·다음 단계). Bash 미부여로 측정 재실행 구조적 차단. raw.json 미포함 값 작성 금지 (maxTurns 15) |

### 협업 패턴

```
사용자 발화 ("Vite 빌드 시간 측정하고 보고서까지")
  ↓
build-perf-benchmarker (측정 실행 → ./bench-results/{date}/{kind}/)
  ↓ (산출물 경로 전달)
perf-report-writer (측정 결과 검증 → report.md 작성)
```

## 5단계 워크플로우 적용

각 스킬 모두:
1. ✅ 공식 문서 조사 (WebSearch + WebFetch)
2. ✅ 교차 검증 (2개 이상 독립 소스)
3. ✅ SKILL.md 작성 (소스 URL + 검증일 + DISPUTED 주의)
4. ✅ verification.md 작성 (사용 소스·교차 검증 결과·버전·검증일·최종 판정)
5. ✅ skill-tester 2단계 테스트 (content test 3/3 PASS, pending-test-guard 통과)

## 검증 통계 (총계)

- 핵심 클레임: 69건 교차 검증 (build 20 + bundle 12 + dev-hmr 9 + lighthouse 15 + rum 13)
- VERIFIED 69 / DISPUTED 0 / UNVERIFIED 0
- skill-tester content test: 15건 PASS (3 × 5 스킬), FAIL 0
- 4개 스킬 status PENDING_TEST (실사용 필수), 1개 APPROVED

## 핵심 외부 소스 (1순위 공식 문서)

- hyperfine: github.com/sharkdp/hyperfine
- Vite HMR API: vite.dev/guide/api-hmr
- rollup-plugin-visualizer: github.com/btd/rollup-plugin-visualizer
- webpack-bundle-analyzer: github.com/webpack-contrib/webpack-bundle-analyzer
- size-limit: github.com/ai/size-limit
- Lighthouse CI: github.com/GoogleChrome/lighthouse-ci
- Core Web Vitals: web.dev/vitals
- Sentry RUM: docs.sentry.io/product/insights/web-vitals/
- Datadog RUM: docs.datadoghq.com/real_user_monitoring/browser/
- web-vitals npm: github.com/GoogleChrome/web-vitals

## 다음 단계 (사용자 영역)

- 4개 PENDING_TEST 스킬은 실 프로젝트(lfos-ui Next.js 모노레포 / lf-ui CRA 등)에 적용 후 산출물 검증되면 APPROVED 전환
- build-perf-benchmarker + perf-report-writer는 첫 호출 시 실 측정 시나리오로 검증
