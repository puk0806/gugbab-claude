---
skill: web-vitals-rum-comparison
category: frontend
version: v1
date: 2026-05-14
status: APPROVED
---

# web-vitals-rum-comparison 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `web-vitals-rum-comparison` |
| 스킬 경로 | `.claude/skills/frontend/web-vitals-rum-comparison/SKILL.md` |
| 검증일 | 2026-05-14 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (web.dev, Sentry docs, Datadog docs)
- [✅] 공식 GitHub 2순위 소스 확인 (GoogleChrome/web-vitals, DataDog/browser-sdk)
- [✅] 최신 버전 기준 내용 확인 (2026-05-14)
  - `web-vitals` v5
  - `@sentry/browser` 8.x
  - `@datadog/browser-rum` v7.1.0
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (release/version 태깅, p75 비교)
- [✅] 코드 예시 작성 (web-vitals/Sentry/Datadog 초기화, Discover/Explorer 쿼리)
- [✅] 흔한 실수 패턴 정리 (8개 함정: 트래픽 분포·표본 크기·INP 시점·bfcache·background tab·privacy·샘플링 곱셈·release 누락)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebFetch | github.com/GoogleChrome/web-vitals | v5, onLCP/onINP/onCLS API, attribution build 확인 |
| 조사 2 | WebFetch | web.dev/articles/inp | INP 정의, p75 한계값 (200/500ms) 확인 |
| 조사 3 | WebFetch | web.dev/vitals/ | LCP/INP/CLS 한계값 공식 확인 |
| 조사 4 | WebFetch | docs.sentry.io/.../automatic-instrumentation/ | browserTracingIntegration 코드, enableInp 옵션 |
| 조사 5 | WebFetch | docs.sentry.io/product/insights/web-vitals/ | LCP/CLS/FCP/TTFB/INP 5종, Performance Score |
| 조사 6 | WebFetch | docs.datadoghq.com/.../browser/setup/client/ | datadogRum.init 코드, 옵션 |
| 조사 7 | WebFetch | docs.datadoghq.com/.../monitoring_page_performance/ | view event 필드명, SDK 버전 의존성 |
| 조사 8 | WebFetch | datadoghq.com/blog/core-web-vitals-monitoring | p75 대시보드, Synthetic 병행 |
| 검증 1 | WebSearch | INP CWV March 12 2024 announcement | 2024-03-12 공식 승격일 확정 |
| 검증 2 | WebSearch | Sentry release JavaScript SDK | release 옵션, window.SENTRY_RELEASE.id 확인 |
| 검증 3 | WebSearch | Datadog RUM Explorer query syntax p75 | `@view.largest_contentful_paint` 쿼리·이스케이프 규칙 확인 |
| 검증 4 | WebSearch | @datadog/browser-rum init code 2026 | v7.1.0 (2026-03-16) 최신 버전 확정 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| web.dev — Core Web Vitals | https://web.dev/vitals/ | ⭐⭐⭐ High | 2026-05-14 | Google 공식 |
| web.dev — INP article | https://web.dev/articles/inp | ⭐⭐⭐ High | 2026-05-14 | Google 공식 |
| web.dev — INP CWV blog | https://web.dev/blog/inp-cwv-march-12 | ⭐⭐⭐ High | 2026-05-14 | INP 승격 공지 |
| GoogleChrome/web-vitals | https://github.com/GoogleChrome/web-vitals | ⭐⭐⭐ High | 2026-05-14 | 공식 라이브러리 README |
| Sentry — Browser Tracing | https://docs.sentry.io/platforms/javascript/tracing/instrumentation/automatic-instrumentation/ | ⭐⭐⭐ High | 2026-05-14 | 공식 |
| Sentry — Web Vitals Insights | https://docs.sentry.io/product/insights/web-vitals/ | ⭐⭐⭐ High | 2026-05-14 | 공식 |
| Sentry — Releases | https://docs.sentry.io/platforms/javascript/configuration/releases/ | ⭐⭐⭐ High | 2026-05-14 | 공식 |
| Datadog — RUM Browser Setup | https://docs.datadoghq.com/real_user_monitoring/application_monitoring/browser/setup/client/ | ⭐⭐⭐ High | 2026-05-14 | 공식 |
| Datadog — Monitoring Page Performance | https://docs.datadoghq.com/real_user_monitoring/application_monitoring/browser/monitoring_page_performance/ | ⭐⭐⭐ High | 2026-05-14 | 공식 |
| Datadog — RUM Explorer Search Syntax | https://docs.datadoghq.com/real_user_monitoring/explorer/search_syntax/ | ⭐⭐⭐ High | 2026-05-14 | 공식 |
| Datadog Blog — CWV Monitoring | https://www.datadoghq.com/blog/core-web-vitals-monitoring-datadog-rum-synthetics/ | ⭐⭐ Medium | 2026-05-14 | 공식 블로그 |

---

## 4. 검증 체크리스트

### 4-1. 핵심 클레임 교차 검증 결과

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|---------|---------|:----:|
| 1 | INP는 2024-03-12 CWV로 승격, FID 대체 | web.dev/blog/inp-cwv-march-12 | Google Search Central Blog 2023-05 + 일반 검색 다수 | VERIFIED |
| 2 | LCP p75 Good ≤ 2.5s | web.dev/vitals/ | Datadog blog (target <2.5s p75) | VERIFIED |
| 3 | INP p75 Good ≤ 200ms | web.dev/articles/inp | web.dev/vitals/ | VERIFIED |
| 4 | CLS p75 Good ≤ 0.1 | web.dev/vitals/ | Datadog blog | VERIFIED |
| 5 | `web-vitals` v5의 onLCP/onINP/onCLS API | GitHub README | 공식 npm 페이지 | VERIFIED |
| 6 | Sentry `browserTracingIntegration({enableInp})` SDK 8.x+ 기본 true | Sentry docs (automatic-instrumentation) | Sentry insights/web-vitals 페이지에서 INP 지원 명시 | VERIFIED |
| 7 | Sentry `release` 옵션 + `window.SENTRY_RELEASE.id` | Sentry releases docs | sentry-cli 공식 가이드 | VERIFIED |
| 8 | Datadog `datadogRum.init({applicationId, clientToken, site, version, ...})` v7.1.0 | docs.datadoghq.com/.../setup/client/ | npmjs.com/@datadog/browser-rum (v7.1.0 2026-03-16) | VERIFIED |
| 9 | Datadog view event 필드 `@view.largest_contentful_paint` 등 | docs.datadoghq.com/.../monitoring_page_performance/ | Datadog Explorer search syntax docs | VERIFIED |
| 10 | Datadog INP 메트릭은 SDK v5.1.0+ | docs.datadoghq.com/.../monitoring_page_performance/ | 단일 소스 (Datadog 공식 명시) | VERIFIED |
| 11 | Datadog는 백그라운드 페이지의 INP/LCP 수집 안 함 | docs.datadoghq.com/.../monitoring_page_performance/ | 단일 소스 (Datadog 공식 명시) | VERIFIED |
| 12 | RUM Explorer 특수문자 이스케이프(`>`, `<`, `:` 등) | docs.datadoghq.com/.../explorer/search_syntax/ | 단일 소스 (Datadog 공식) | VERIFIED |
| 13 | INP는 입력 지연 + 처리 시간 + 표시 지연 전구간 측정 | web.dev/articles/inp | 검색 결과 다수(seroundtable, glowmetrics 등) | VERIFIED |

**최종**: VERIFIED 13 / DISPUTED 0 / UNVERIFIED 0

### 4-2. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (web-vitals v5, Sentry 8.x, Datadog v7.1.0)
- [✅] deprecated된 패턴을 권장하지 않음 (FID 미사용, INP 기준)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-3. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description with <example>)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (RUM vs Lab, CWV 정의·한계값)
- [✅] 코드 예시 포함 (web-vitals/Sentry/Datadog 초기화 + Discover/Explorer 쿼리)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (섹션 8)
- [✅] 흔한 실수 패턴 포함 (섹션 7, 8개 항목)

### 4-4. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (init 코드 그대로 사용 가능)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (배포 워크플로 + 알람 식)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X — Sentry/Datadog 양쪽 커버)

### 4-5. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-14 skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음 — 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-14
**수행자**: skill-tester → general-purpose (frontend-developer 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. React SPA에서 `web-vitals` onINP 콜백이 언제 호출되는가? SPA에서 INP 누락 상황과 대처는?**
- PASS
- 근거: SKILL.md "언제 콜백이 호출되나 (중요)" 섹션 (섹션 3, line 110~116) + "7-3. INP 측정 시점 — SPA에서 누락 위험" 섹션
- 상세: `onINP`는 페이지 hidden 전환 시 확정됨. SPA에서 라우트만 바꾸고 페이지를 떠나지 않으면 INP 미보고 위험. 직접 수집 시 `reportAllChanges: true` 옵션 + visibilitychange 리스너 필수. 근거가 명확히 존재하며 "콜백 등록만 하면 충분"이라는 anti-pattern을 피함.

**Q2. Sentry Discover에서 v1.2.0·v1.2.1 INP p75 비교 방법 + `enableInp` 설정 필요 여부 + release 누락 시 결과는?**
- PASS
- 근거: SKILL.md "4-1. 초기화" 섹션 (enableInp 기본 true) + "4-3. 배포 전후 비교 — Insights / Discover" 섹션 + "7-7. tracesSampleRate × interactionsSampleRate 곱셈" + "7-8. Release 누락 → 'Unknown' 묶임"
- 상세: `release:[v1.2.0, v1.2.1]` 쿼리 + Y축 `p75(measurements.inp)` 패턴, SDK 8.x에서 enableInp 기본 true로 별도 설정 불필요, release 누락 시 "Unknown"으로 뭉쳐 비교 불가. 모든 근거 SKILL.md에 존재.

**Q3. Datadog RUM Explorer version별 LCP p75 비교 쿼리 작성 + INP 최소 SDK 버전 + 저녁 배포 후 p75 악화를 회귀로 단정할 수 없는 이유는?**
- PASS
- 근거: SKILL.md "5-2. view 이벤트 필드" + "5-3. 배포 전후 비교 — RUM Explorer 쿼리" + "5-1. 초기화" (v5.1.0 INP 지원) + "7-1. 트래픽 분포 차이 (가장 자주 놓침)"
- 상세: `@type:view @version:(1.2.0 OR 1.2.1)` + Group by `@version` + Measure p75(`@view.largest_contentful_paint`). INP는 SDK v5.1.0+ 필요. 저녁 배포 → 모바일 비중 증가로 같은 코드에서도 p75 악화 가능 — device·country facet 분리 필수. 근거 모두 SKILL.md에 존재.

### 발견된 gap

없음 — SKILL.md가 3개 질문 모두에 충분한 근거를 제공함.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: "해당 없음" (RUM 패턴·쿼리 작성법 — content test로 APPROVED 가능)
- 실 RUM 데이터 검증: 사용자 운영 환경에서만 가능 (Sentry/Datadog 대시보드 실제 데이터 확인은 본 테스트 범위 외)
- 최종 상태: **APPROVED**

---

> 아래는 skill-creator가 남긴 예정 템플릿 (참고용 보존)

### 테스트 케이스 1 (참고용 — 위 Q2로 실제 수행됨)

**입력 (예정):** "Sentry RUM에서 v1.2.0과 v1.2.1의 INP p75를 어떻게 비교해?"

**기대 결과 (예정):** Sentry.init의 release 옵션 + Discover/Insights 쿼리 패턴 (`release:[v1.2.0, v1.2.1]` + `p75(measurements.inp)`) 제시

---

### 테스트 케이스 2 (참고용 — 위 Q3로 실제 수행됨)

**입력 (예정):** "Datadog RUM Explorer에서 version별 LCP p75 쿼리를 짜줘"

**기대 결과 (예정):** `@type:view @version:(1.2.0 OR 1.2.1)` 필터 + Group by `@version` + Measure p75(`@view.largest_contentful_paint`) 식 제시

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-14 skill-tester 수행, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

> RUM 패턴·쿼리 작성법은 content test로 검증 완료. 실 RUM 대시보드 데이터(Sentry/Datadog 운영 환경에서의 실제 p75 수치 확인)는 사용자 운영 환경에서만 가능하며, 이는 SKILL.md 사용 범위가 아닌 사용자 운영 영역임.

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 및 섹션 5·6 업데이트 (2026-05-14 완료, 3/3 PASS)
- [❌] Sentry Discover 쿼리에서 사용 가능한 정확한 `measurements.*` 키 목록을 SDK 8.x 기준 공식 표로 추가 검증 필요 (Sentry docs에 분산돼 있음) — 차단 요인 아님, 선택 보강
- [❌] Datadog RUM Monitor 알람 쿼리 syntax (`p75:@view.largest_contentful_paint{...}`) 정확성 — 별도 Datadog Monitors 문서 교차 검증 권장 — 차단 요인 아님, 선택 보강
- [❌] `interactionsSampleRate`가 Sentry 8.x에서 여전히 곱셈 방식인지 9.x 출시 시 재확인 — 차단 요인 아님, 버전 업 시 재확인 과제

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-14 | v1 | 최초 작성 (web-vitals v5 + Sentry 8.x + Datadog v7.1.0 기준) | skill-creator |
| 2026-05-14 | v1 | 2단계 실사용 테스트 수행 (Q1 onINP 콜백 시점·SPA 누락 / Q2 Sentry INP p75 Discover 비교 / Q3 Datadog LCP p75 쿼리·트래픽 분포 함정) → 3/3 PASS, APPROVED 전환 | skill-tester |
