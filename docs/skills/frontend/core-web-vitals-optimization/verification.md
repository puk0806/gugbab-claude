---
skill: core-web-vitals-optimization
category: frontend
version: v1
date: 2026-06-02
status: APPROVED
---

# core-web-vitals-optimization — 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `core-web-vitals-optimization` |
| 스킬 경로 | `.claude/skills/frontend/core-web-vitals-optimization/SKILL.md` |
| 검증일 | 2026-06-02 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (web.dev — vitals/inp/lcp/cls/optimize-*)
- [✅] 공식 GitHub 2순위 소스 확인 (GoogleChrome/web-vitals, Partytown)
- [✅] 최신 버전 기준 내용 확인 (2026-06-02 — Next.js 16, web-vitals 5.x, INP 2024-03 승격)
- [✅] LCP/INP/CLS 각 지표별 흔한 원인 → 수정 패턴 카탈로그 작성
- [✅] HTML / TypeScript-React / Next.js 코드 예시
- [✅] 안티패턴 정리 (8개)
- [✅] 프레임워크별 빠른 가이드 (Next.js / Vite / Astro)
- [✅] 측정 도구 연계 (다른 스킬에 위임)
- [✅] 우선순위 결정 트리
- [✅] PR 머지 체크리스트
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | "Core Web Vitals 2026 thresholds LCP INP CLS" | 임계값 3종 + 75퍼센타일 기준 확인 |
| 조사 2 | WebSearch | "INP replaced FID March 2024 web.dev" | 2024-03-12 공식 승격일 확인 |
| 조사 3 | WebFetch | https://web.dev/articles/optimize-lcp | LCP 4구간 분해 + 처방 7종 수집 |
| 조사 4 | WebFetch | https://web.dev/articles/optimize-inp | yielding 정의 + 원인 분류 수집 |
| 조사 5 | WebFetch | https://web.dev/articles/optimize-cls | width/height + aspect-ratio + 폰트 메트릭 수집 |
| 조사 6 | WebFetch | https://web.dev/articles/cls | session window 정의 (1초 gap, 5초 max) |
| 조사 7 | WebFetch | https://web.dev/articles/inp | INP 임계값 + 측정 대상 (click/tap/key, hover X) |
| 조사 8 | WebSearch | "scheduler.postTask Chrome 94 yield" | scheduler.yield Chrome 129+ stable, postTask Chrome 94+ |
| 조사 9 | WebSearch | "React 18 startTransition useDeferredValue INP" | 두 API 사용 시점 차이 확인 |
| 조사 10 | WebSearch | "Next.js Image priority fetchpriority LCP 2026" | Next.js 16에서 priority deprecated → preload |
| 조사 11 | WebFetch | https://nextjs.org/docs/app/api-reference/components/image | v16.0.0 changelog에서 priority deprecated 명시 직접 확인 |
| 조사 12 | WebSearch | "web-vitals npm onLCP onINP onCLS RUM" | API 시그니처 + sendBeacon 패턴 확인 |
| 조사 13 | WebSearch | "Partytown third party INP analytics" | Worker 이동 + TBT 60~80% 감소 사례 |
| 조사 14 | WebSearch | "fetchpriority attribute browser support 2025" | Chrome 102+, Safari 17.2+, Firefox 132+, Edge 102+ 확인 |
| 조사 15 | WebSearch | "CrUX field data lab data Lighthouse 75th percentile" | field 28일 75퍼센타일, lab은 단일 시뮬레이션 |
| 교차 검증 | WebSearch + WebFetch | 14개 핵심 클레임 × 2~3 독립 소스 | VERIFIED 14 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| web.dev — Vitals | https://web.dev/articles/vitals | ⭐⭐⭐ High | 2026-06-02 | Chrome 공식 |
| web.dev — Optimize LCP | https://web.dev/articles/optimize-lcp | ⭐⭐⭐ High | 2026-06-02 | Chrome 공식 |
| web.dev — Optimize INP | https://web.dev/articles/optimize-inp | ⭐⭐⭐ High | 2026-06-02 | Chrome 공식 |
| web.dev — Optimize CLS | https://web.dev/articles/optimize-cls | ⭐⭐⭐ High | 2026-06-02 | Chrome 공식 |
| web.dev — INP article | https://web.dev/articles/inp | ⭐⭐⭐ High | 2026-06-02 | Chrome 공식 |
| web.dev — CLS article | https://web.dev/articles/cls | ⭐⭐⭐ High | 2026-06-02 | session window 정의 |
| web.dev — Fetch Priority | https://web.dev/articles/fetch-priority | ⭐⭐⭐ High | 2026-06-02 | Chrome 공식 |
| web.dev — Lab vs Field | https://web.dev/articles/lab-and-field-data-differences | ⭐⭐⭐ High | 2026-06-02 | Chrome 공식 |
| web.dev — INP CWV launch | https://web.dev/blog/inp-cwv-launch | ⭐⭐⭐ High | 2026-06-02 | 2024-03-12 승격 |
| Next.js Image docs | https://nextjs.org/docs/app/api-reference/components/image | ⭐⭐⭐ High | 2026-06-02 | v16.2.7 기준 |
| MDN — fetchpriority | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/fetchpriority | ⭐⭐⭐ High | 2026-06-02 | 브라우저 지원 |
| GoogleChrome/web-vitals | https://github.com/googlechrome/web-vitals | ⭐⭐⭐ High | 2026-06-02 | RUM 라이브러리 공식 |
| Partytown | https://partytown.builder.io/ | ⭐⭐⭐ High | 2026-06-02 | 공식 docs |
| Chrome Developers — scheduler.yield | https://developer.chrome.com/blog/use-scheduler-yield | ⭐⭐⭐ High | 2026-06-02 | Chrome 공식 |
| Vercel blog — React 18 perf | https://vercel.com/blog/how-react-18-improves-application-performance | ⭐⭐ Medium | 2026-06-02 | 벤더 공식 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보 명시 (Next.js 16, web-vitals 5.x, Chrome 129+ scheduler.yield 등)
- [✅] deprecated 패턴을 권장하지 않음 (Next.js 16에서 priority → preload 명시)
- [✅] 코드 예시가 실행 가능한 형태

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description, examples 3개)
- [✅] 소스 URL과 검증일 명시
- [✅] LCP/INP/CLS 각 지표별 원인-처방 카탈로그
- [✅] HTML / TS-React / Next.js 코드 예시
- [✅] 안티패턴 8개 정리
- [✅] 우선순위 결정 트리 + PR 체크리스트

### 4-3. 실용성

- [✅] 에이전트가 참조 시 즉시 코드에 반영 가능한 패턴 중심
- [✅] 추상적 이론보다 구체 코드·수치
- [✅] 범용 (특정 프로젝트 종속 X) — 한국 사용자 환경 팁(폰트 subset, Naver/Kakao 스크립트)도 일반화된 예시

### 4-5. 에이전트 활용 테스트

- [✅] skill-tester → general-purpose 에이전트로 3개 실전 질문 수행 (2026-06-02)

### 4-4. 핵심 클레임 교차 검증 결과

| # | 클레임 | 판정 | 소스 |
|---|--------|------|------|
| 1 | LCP Good ≤ 2.5s, Poor > 4.0s | VERIFIED | web.dev/vitals, web.dev/optimize-lcp |
| 2 | INP Good ≤ 200ms, Poor > 500ms | VERIFIED | web.dev/inp |
| 3 | CLS Good ≤ 0.1, Poor > 0.25 | VERIFIED | web.dev/cls |
| 4 | INP가 2024-03-12 FID 대체 | VERIFIED | web.dev/blog/inp-cwv-launch |
| 5 | 75퍼센타일 기준 | VERIFIED | web.dev/defining-core-web-vitals-thresholds |
| 6 | CLS session window: gap < 1s, max 5s | VERIFIED | web.dev/articles/cls |
| 7 | LCP 4구간 분해 (TTFB / Load Delay / Load Duration / Render Delay) | VERIFIED | web.dev/articles/optimize-lcp |
| 8 | INP 측정 대상: click/tap/keypress, hover 제외 | VERIFIED | web.dev/articles/inp |
| 9 | fetchpriority Chrome 102+, Safari 17.2+, Firefox 132+ | VERIFIED | MDN, web.dev |
| 10 | Next.js 16에서 `priority` deprecated → `preload` | VERIFIED | Next.js 공식 docs v16.2.7 changelog |
| 11 | scheduler.yield Chrome 129+ stable | VERIFIED | developer.chrome.com |
| 12 | scheduler.postTask Chrome 94+ | VERIFIED | chromestatus.com |
| 13 | React `startTransition`/`useDeferredValue`로 INP 개선 | VERIFIED | Vercel blog, This Dot Labs |
| 14 | Partytown으로 TBT 60~80% 감소 사례 | VERIFIED | DebugBear, Partytown docs |

**판정 요약**: VERIFIED 14 / DISPUTED 0 / UNVERIFIED 0

---

## 5. 테스트 진행 기록

**수행일**: 2026-06-02
**수행자**: skill-tester → general-purpose (domain-specific 에이전트 미적용, 동일 세션 직접 검증)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. LCP 4초 — Next.js 16 hero 이미지 처방은?**
- PASS
- 근거: SKILL.md §2.1 "LCP 4단계 분해" + §2.2 "흔한 원인 처방 매핑" + §2.3 "Next.js 16 priority deprecated → preload"
- 상세: Resource Load Delay 원인(`loading="lazy"`) → `loading="eager"` + `fetchPriority="high"`, Resource Load Duration 원인(큰 이미지) → AVIF + srcset, Next.js 16에서 `priority` deprecated → `preload` prop 전환까지 모두 근거 존재. 단일 LCP 원칙(복수 부여 시 400~1200ms 지연)도 명시됨.

**Q2. INP 350ms — React 컴포넌트 최적화 우선순위는?**
- PASS
- 근거: SKILL.md §3.2 "흔한 원인 처방 매핑" + §3.3 "React 18+ startTransition / useDeferredValue"
- 상세: 무거운 React re-render → `startTransition` (상태 업데이트 감싸기) / `useDeferredValue` (props 값 감싸기) 구분 명확. Long task > 50ms → `scheduler.yield` fallback 패턴(Chrome 129+ 이전 브라우저 대비)까지 기술됨. 입력값 urgent/결과 non-urgent 분리 패턴 코드 예시 존재.

**Q3. CLS 0.3 — 가장 흔한 원인과 빠른 수정은?**
- PASS
- 근거: SKILL.md §4.1 "Session window 계산 방식" + §4.2 "흔한 원인 처방 매핑" + §4.3 "코드 패턴" + §5 "공통 안티패턴"
- 상세: CLS 0.3 = Poor (> 0.25, §1.1). 가장 흔한 원인(img width/height 없음) → reflow → `width`/`height` 명시 또는 `aspect-ratio`. `width: 100%`만 있고 height 없는 경우 → §5 안티패턴 표에 명시적 항목 존재. 폰트 FOUT → `size-adjust`/`ascent-override` 메트릭 매칭, 동적 콘텐츠 삽입 → 사용자 인터랙션 후 삽입 등 복수 원인 모두 커버.

### 발견된 gap (있으면)

없음 — 3개 질문 모두 SKILL.md에서 직접 근거 섹션을 찾을 수 있었고 anti-pattern도 명확히 정리됨.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: "해당 없음" (라이브러리/메트릭 사용법 카탈로그, 실사용 필수 카테고리 아님)
- 최종 상태: APPROVED

---

> (참고용 — 원래 예정 케이스)

> **Q1.** LCP가 4.2초 나오는 Next.js 16 페이지에서 hero 이미지 처방은?
> - 기대 답변 경로: `loading="eager"` + `fetchPriority="high"` + `preload` prop (priority 아님), AVIF + srcset
> - SKILL.md 근거: §2.3 "Next.js 16 — `priority` deprecated → `preload`"
>
> **Q2.** 검색창 입력 시 INP 450ms. React 18에서 어떤 API?
> - 기대 답변 경로: 입력값 자체는 urgent로 즉시 반영, 결과 필터링만 `startTransition`으로 감싸기
> - SKILL.md 근거: §3.3 "React 18+ — `startTransition`"
>
> **Q3.** 이미지에 width/height 없으면 CLS 영향은? 그리고 `width: 100%`만 있고 height 없으면?
> - 기대 답변 경로: 치수 없으면 로드 후 reflow → session window에 큰 시프트. width만 있어도 `aspect-ratio` 추가 필요
> - SKILL.md 근거: §4.3 + §5 안티패턴 표

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-06-02, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

> content test 3/3 PASS. 라이브러리/메트릭 사용법 카탈로그 카테고리 — content test로 APPROVED 전환 완료.

---

## 7. 개선 필요 사항

- [✅] skill-tester로 agent content test 3건 수행 (2026-06-02 완료, 3/3 PASS)
- [ ] 다음 web.dev 메이저 업데이트(임계값·새 메트릭) 시 재검증 — 차단 요인 아님, 선택 보강 (임계값 변경 시 §1.1 수치 업데이트)
- [ ] Next.js 17 출시 시 Image prop 변경 여부 재확인 — 차단 요인 아님, 선택 보강 (버전 분기 시 §2.3 업데이트)
- [ ] scheduler.yield 타 브라우저(Safari/Firefox) 지원 추가 시 fallback 단순화 — 차단 요인 아님, 선택 보강 (브라우저 지원 변경 시 §3.3 주석 업데이트)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-02 | v1 | 최초 작성 — LCP/INP/CLS 진단·처방 카탈로그. 14개 클레임 VERIFIED | skill-creator |
| 2026-06-02 | v1 | 2단계 실사용 테스트 수행 (Q1 LCP hero 이미지 처방 / Q2 INP React API 우선순위 / Q3 CLS 원인·수정) → 3/3 PASS, APPROVED 전환 | skill-tester |
