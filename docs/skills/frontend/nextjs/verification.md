---
skill: nextjs
category: frontend
version: v8
date: 2026-09-28
status: APPROVED
---

# nextjs 스킬 검증 문서

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 공식 문서 기반으로 내용 작성
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST

[2단계] 실제 사용 중 (온라인 검증)
  ├─ frontend-architect 에이전트 테스트 수행
  └─ 테스트 PASS → APPROVED
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | nextjs |
| 스킬 경로 | `.claude/skills/nextjs/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 검증일 | 2026-09-28 (최초 2026-03-27, 직전 재검증 2026-08-11) |
| 재검증일 | **2026-09-28** (직전 2026-08-11) |
| 검증 방법 | 공식 문서 교차 검증 (nextjs.org 블로그 + docs + 독립 3rd-party 보도) / 2026-09-28: npm registry + GitHub 공식 릴리스 노트 |
| 버전 기준 | **Next.js 16.3.6** (2026-09-22 릴리즈, 16.3.0의 패치. 16.4.0은 아직 canary) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인
- [✅] 최신 버전 기준 내용 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성
- [✅] Claude Code 에이전트에서 실제 활용 테스트

---

## 2. 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | App Router 구조, 데이터 페칭, Server Actions, 렌더링 전략, 메타데이터 API, Route Handlers 6개 | 4/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Next.js App Router 문서 | https://nextjs.org/docs/app | ⭐⭐⭐ High |
| Next.js 15 블로그 | https://nextjs.org/blog/next-15 | ⭐⭐⭐ High |
| Next.js 16 블로그 | https://nextjs.org/blog/next-16 | ⭐⭐⭐ High |
| Next.js 16.1 블로그 | https://nextjs.org/blog/next-16-1 | ⭐⭐⭐ High |
| Next.js 16.3 블로그 | https://nextjs.org/blog/next-16-3 | ⭐⭐⭐ High |
| v15 → v16 업그레이드 가이드 | https://nextjs.org/docs/app/guides/upgrading/version-16 | ⭐⭐⭐ High |
| 캐싱(Cache Components) 문서 | https://nextjs.org/docs/app/getting-started/caching | ⭐⭐⭐ High |
| fetch API 레퍼런스 | https://nextjs.org/docs/app/api-reference/functions/fetch | ⭐⭐⭐ High |
| unstable_cache 레퍼런스 | https://nextjs.org/docs/app/api-reference/functions/unstable_cache | ⭐⭐⭐ High |
| GitHub 릴리즈 (버전 존재 확인) | https://github.com/vercel/next.js/releases | ⭐⭐⭐ High |
| 독립 보도 — heise online | https://www.heise.de/en/news/Next-js-16-3-reduces-memory-consumption-by-up-to-90-percent-11399735.html | ⭐⭐ Medium |
| 독립 보도 — The Register | https://www.theregister.com/devops/2026/08/04/nextjs-163-aims-to-reduce-dreaded-fatal-error-messages/5283036 | ⭐⭐ Medium |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 공식 문서 1순위 소스 확인 (nextjs.org/docs)
- [✅] deprecated 패턴 제외 (middleware.ts → proxy.ts 구분 명시)
- [✅] 버전 명시 (Next.js 15/16)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)
- [✅] 2026-09-28 재검증(2차) 보강분(16.3.6 보안 패치·revalidateTag 2-인자) content test 재수행 — 2/2 PASS
- [✅] 2026-09-28 선택 보강분(GHSA 3건 Windows 한정 vs 플랫폼 무관 구분) content test 재수행 — 2/2 PASS

---

## 5. 테스트 진행 기록

### [2026-09-28] 재테스트(skill-tester) — GHSA 3건 플랫폼 구분(Windows 한정 vs 플랫폼 무관) 반영 확인

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (domain-specific 프론트엔드 에이전트 미설치로 대체)
**수행 방법**: SKILL.md Read 후 실전 질문 2개 답변, 근거 섹션 인용 확인. 직전 선택 보강(GHSA-p293-qw3h-jr36 Windows 한정 / GHSA-2xp9-vwfh-vxw4·GHSA-vcvr-r3jv-pc5j 플랫폼 무관 구분)을 두 질문 모두 직접 겨냥.

**Q1. Windows 호스팅 서버, next/og·AVIF 미사용 조건에서 16.3.2에 머물러도 안전한가?**
- ✅ PASS
- 근거: SKILL.md 상단 주의 블록의 GHSA-p293-qw3h-jr36 항목("Windows 호스팅 서버 한정" 경로 순회 RCE)
- 상세: "Windows 경로 순회 취약점은 사용 기능과 무관하게 호스팅 OS만으로 영향받는 서버 자체의 취약점"이라고 정확히 지적, next/og·AVIF 미사용이 다른 2건(GHSA-2xp9·GHSA-vcvr)에는 해당 없음을 논리적으로 구분하면서도 GHSA-p293은 회피되지 않는다고 결론. 최소 버전(16.3.3)과 권장 버전(16.3.6)을 구분해 제시. Windows 한정 취약점을 플랫폼 무관 취약점과 혼동하는 anti-pattern 없음.

**Q2. Linux 호스팅 + next/og를 Edge 런타임 전용으로만 사용 + AVIF 미사용 조건에서 16.3.5에 머물러도 3건의 GHSA로부터 안전한가?**
- ✅ PASS
- 근거: SKILL.md 상단 주의 블록 3개 GHSA 항목 전체(Windows 한정/플랫폼 무관 AVIF/Node.js 런타임 한정 next/og)
- 상세: 3개 CVE를 조건별로 정확히 대조 — GHSA-p293(Windows 한정, Linux라 해당 없음) / GHSA-2xp9(플랫폼 무관이지만 AVIF 기능 미사용이라 코드 경로 미실행) / GHSA-vcvr(Node.js 런타임 한정, Edge 전용이라 해당 없음) — 이 조건에서는 3건 모두 발동 경로에 해당하지 않는다고 결론. 동시에 SKILL.md가 조건부 예외 없이 "반드시 16.3.6 이상"이라고 무조건 권장한다는 점도 정확히 짚어, 조건부 안전 판단과 SKILL.md의 원칙적 권고를 혼동하지 않음(위험한 "완전히 안전하다"는 단정 anti-pattern 회피).

### 발견된 gap (경미, 선택 보강)

- GHSA-2xp9-vwfh-vxw4 항목에 "AVIF 기능을 사용하지 않으면 영향 없음"이라는 명시적 조건부 문구가 없어, Q2 답변자가 원인 서술(`sharp`/`libheif`)로부터 간접 추론해야 했음 — 결론에는 영향 없음.
- SKILL.md가 조건부 예외 없이 "반드시 16.3.6 이상"을 권장하는 이유(예: 기본값으로 AVIF 최적화가 켜질 수 있는 경우 등)에 대한 명시적 근거 문장 부재 — 차단 요인 아님.

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (프레임워크 사용법 스킬 — content test로 충분)
- 최종 상태: APPROVED (PENDING_TEST → APPROVED 전환)

---

### [2026-09-28] 선택 보강 반영 — Windows 한정 RCE vs 플랫폼 무관 RCE 구분

- 반영 내용: SKILL.md 상단 주의 블록과 REFERENCE.md "Next.js 16.3 주요 변경사항" 주의 문구를 3개 GHSA ID별로 명시적으로 구분 — GHSA-p293-qw3h-jr36(Windows 호스팅 한정 경로 순회 RCE), GHSA-2xp9-vwfh-vxw4(플랫폼 무관 AVIF/`libheif` RCE), GHSA-vcvr-r3jv-pc5j(플랫폼 무관, Node.js 런타임 한정 `next/og` ImageResponse RCE, Edge 구현 미영향). 각 취약점의 영향 버전대·패치 버전도 함께 명시
- 근거: GitHub 공식 Security Advisory 원문 WebFetch로 확인
  - https://github.com/advisories/GHSA-p293-qw3h-jr36 — "when the server is hosted on machines using a Windows filesystem" (Windows 한정), 13.4.0~15.5.23·16.0.0~16.3.2 영향 → 15.5.24/16.3.3 패치
  - https://github.com/advisories/GHSA-2xp9-vwfh-vxw4 — libheif(sharp 의존성) 결함으로 "platform-agnostic", 10.0.0~15.5.23·16.0.0~16.3.2 영향 → 15.5.24/16.3.3 패치
  - https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j — "Node.js `ImageResponse` implementation... Edge `ImageResponse` implementation... are not affected"(플랫폼 무관, Node.js 런타임 한정), 16.2.0~16.3.5 영향 → 16.3.6 패치
- status 영향: 사실(취약점별 플랫폼 범위·영향 버전) 추가이므로 PENDING_TEST 전환 — 메인의 skill-tester 재테스트 필요

### [2026-09-28] 재테스트 (skill-tester) — 16.3.6 보안 패치 필수 + revalidateTag 2-인자 필수 반영 확인

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (domain-specific 프론트엔드 에이전트 미설치로 대체)
**수행 방법**: SKILL.md Read 후 실전 질문 2개 답변, 근거 섹션 인용 확인. 질문 1개는 2026-09-28 재검증(2차)에서 보강된 "16.3.6 이상 필수" Critical RCE 보안 주의를 직접 겨냥.

**Q1. Linux 서버·AVIF 미사용·next/og ImageResponse 미사용 조건에서 Next.js 16.3.0을 업그레이드 없이 계속 운영해도 안전한가?**
- ✅ PASS
- 근거: SKILL.md 상단 "주의(2026-09-28 확인) — 반드시 16.3.6 이상으로 사용한다." 블록
- 상세: 질문자가 제시한 회피 조건(Linux·AVIF 미사용·ImageResponse 미사용)에 대해 SKILL.md가 "위 조건이면 16.3.0도 안전하다"는 예외 문구를 전혀 제공하지 않는다는 점을 정확히 지적하고, SKILL.md의 무조건적 명령형 문구("반드시 16.3.6 이상")를 근거로 "안전하다고 답할 근거가 없다 → 업그레이드 권고"로 결론. 정정(3건의 Critical RCE, 16.3.6 필수)이 답변에 정확히 반영됨. 위험한 조건부 안전 답변(anti-pattern)으로 흐르지 않음.
- gap: Windows 한정 RCE(①)와 플랫폼 무관 RCE(②·③)를 SKILL.md가 구분해 서술하지 않아, 에이전트가 이를 판단하는 데 다소 어려움을 겪음 — SKILL.md 자체의 사소한 모호성이나 결론(업그레이드 권고)에는 영향 없음.

**Q2. Next.js 15→16 마이그레이션 중 `revalidateTag('posts')`(1-인자)에서 TypeScript 에러 발생 — 원인과 수정법**
- ✅ PASS
- 근거: SKILL.md "온디맨드 재검증 (Next.js 16 — 시그니처 변경 주의)" 절 + API 표
- 상세: v16에서 2번째 인자(cacheLife 프로필) 필수로 바뀐 것이 원인임을 정확히 지적, `revalidateTag('posts', 'max')` 수정 코드 제시, 대안으로 `updateTag`(read-your-writes)까지 정확히 안내.

**발견된 gap**: ① Windows/플랫폼 무관 RCE 구분 서술 부재(경미) ② revalidateTag의 cacheLife 프로필 전체 목록 미기재 — 둘 다 차단 요인 아님, 선택 보강 후보.

**판정**: agent content test 2/2 PASS. 16.3.6 보안 패치 필수 정정 및 revalidateTag 시그니처 변경이 답변에 정확히 반영됨.

---

### 테스트 케이스 1: frontend-architect 에이전트 활용 테스트

**테스트 방법:** frontend-architect 에이전트에게 nextjs 관련 설계 질문 및 코드 리뷰 요청

**발견 및 수정 사항:**
- fetch 기본 캐싱 정책 오류: `cache: 'force-cache'`를 기본값으로 표기 → Next.js 15+에서는 `no-store`가 기본값. 주석 수정 완료
- 메타데이터 API 누락: `metadata` export / `generateMetadata` 함수 섹션 완전 누락 → 섹션 추가 완료
- unstable_cache 대체 API 미언급: Next.js 16 `'use cache'` 디렉티브 섹션 추가 완료
- useActionState Server Action 시그니처: `createPost` 함수에 `prevState` 첫 번째 파라미터 누락 → 수정 완료

**판정:** ✅ PASS

---

### 테스트 케이스 2: 2026-08-11 버전 재검증 (16.2 → 16.3)

**수행일**: 2026-08-11
**수행 방법**: 공식 소스 3계열(nextjs.org 블로그 / nextjs.org docs / 독립 3rd-party 보도)로 핵심 클레임 교차 검증

**교차 검증 결과 — 클레임 판정표**

| # | 클레임 | 판정 | 근거 |
|---|--------|:----:|------|
| 1 | 현재 최신 stable은 **16.3.0**, 2026-08-03 릴리즈 | **VERIFIED** | 블로그 `publishedAt: August 3rd 2026` + docs frontmatter `version: 16.3.0` + npm 버전 목록 + heise/The Register 보도 (4개 독립 확인) |
| 2 | 16.3에서 dev 메모리 **최대 90% 감소** (disk caching + memory eviction, 둘 다 기본 on) | **VERIFIED** | 공식 블로그 벤치(vercel.com 21.5GB→2GB) + heise "reduces memory consumption by up to 90 percent" |
| 3 | 16.3에서 SSR 처리량 **+22%** (web streams → native Node.js streams) | **VERIFIED** | 공식 블로그 + PR vercel/next.js#94311 링크 |
| 4 | 16.3에서 FileSystem Cache가 `next build`까지 확장, 기본 on (최대 5.5× 빠른 반복 빌드) | **VERIFIED** | 공식 블로그 + 업그레이드 가이드 "enabled by default for both `next dev` and `next build`" |
| 5 | `'use cache'`가 **`experimental.dynamicIO: true`** 를 요구 (기존 SKILL 서술) | **DISPUTED → 수정** | 업그레이드 가이드: `experimental.dynamicIO`·`experimental.useCache`는 **v16에서 제거**. 최상위 `cacheComponents: true`로 대체. SKILL 수정 완료 |
| 6 | Next.js 15+ fetch 기본값이 **`no-store`** (기존 SKILL 주석) | **DISPUTED → 수정** | fetch 레퍼런스: 기본값은 **`auto no cache`** — 정적 프리렌더 라우트면 build 시 1회, Request-time API 감지 시 매 요청. "Caching is opt-in". SKILL 서술 정밀화 |
| 7 | `unstable_cache`는 v16에서 `use cache`로 대체됨 | **VERIFIED** | 공식 레퍼런스 상단 Note: "This API has been replaced by `use cache` in Next.js 16" |
| 8 | `revalidateTag`가 v16에서 **2번째 인자(cacheLife 프로필) 필수**, 1-인자는 deprecated(TS 에러) | **VERIFIED** | 업그레이드 가이드 Caching APIs 절 |
| 9 | v16 신규 `updateTag`(Server Action 전용, read-your-writes) / `refresh`(클라이언트 라우터 갱신) | **VERIFIED** | 업그레이드 가이드 + 각 API 레퍼런스 링크 |
| 10 | `cacheLife`·`cacheTag`가 v16에서 stable (unstable_ 접두사 제거) | **VERIFIED** | 업그레이드 가이드 Caching APIs 절 |
| 11 | Node.js 최소 20.9.0 / TypeScript 최소 5.1.0 / Chrome·Edge·FF 111+·Safari 16.4+ | **VERIFIED** | 업그레이드 가이드 "Node.js runtime and browser support" 표 (TS·브라우저 요구사항은 기존 SKILL에 누락 → 추가) |
| 12 | Turbopack이 dev/build 기본. 커스텀 webpack 설정 시 `next build`가 **실패** | **VERIFIED** | 업그레이드 가이드 "the build will **fail** to prevent misconfiguration issues" (기존 SKILL은 "--webpack 필요"로만 서술 → 실패한다는 사실 보강) |
| 13 | `experimental.turbopack` → 최상위 `turbopack` 이동 | **VERIFIED** | 업그레이드 가이드 "Turbopack configuration location" |
| 14 | `proxy.ts` 런타임은 nodejs 고정·설정 불가, Edge 필요 시 middleware 유지 | **VERIFIED** | 업그레이드 가이드 "The `proxy` runtime is `nodejs`, and it cannot be configured" |
| 15 | `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize` 리네이밍 | **VERIFIED** | 업그레이드 가이드 (기존 SKILL 누락 → 추가) |
| 16 | v16 제거/deprecated: AMP, `next lint`, `serverRuntimeConfig`/`publicRuntimeConfig`, `unstable_rootParams`, `experimental_ppr`, `next/legacy/image`, `images.domains` | **VERIFIED** | 업그레이드 가이드 "Removals" + 각 절 (기존 SKILL 전면 누락 → 추가) |
| 17 | v16 `next/image` 기본값 변경 (minimumCacheTTL 60s→4h, imageSizes 16 제거, qualities `[75]`, maximumRedirects 3, 로컬 IP 차단) | **VERIFIED** | 업그레이드 가이드 `next/image` changes 절 |
| 18 | v16 병렬 라우트 slot에 `default.js` 필수, 없으면 빌드 실패 | **VERIFIED** | 업그레이드 가이드 |
| 19 | v16 `next build` 출력에서 `size`·`First Load JS` 제거 | **VERIFIED** | 업그레이드 가이드 Performance Improvements 절 |
| 20 | 16.3 신규 API: `catchError`(next/error), `next/root-params`, `import.meta.glob` | **VERIFIED** | 16.3 블로그 각 절 (root params는 Server Component만 지원 — 블로그 명시) |
| 21 | Instant Navigations는 **opt-in** (`cacheComponents` + `partialPrefetching`), 향후 메이저에서 기본값 예정 | **VERIFIED** | 16.3 블로그 |
| 22 | 16.3에서 AGENTS.md를 `next dev`가 직접 쓰고 유지, 기존 Skills는 retired | **VERIFIED** | 16.3 블로그 "we're retiring our earlier Skills" + 업그레이드 가이드 "This block is written and re-added by `next dev`" (기존 SKILL의 "create-next-app에서 생성" 서술 → 갱신) |
| 23 | 캐싱 4계층 모델이 v16에서 여전히 유일한 모델인가 | **DISPUTED → 수정** | 캐싱 문서가 Cache Components 모델을 기본 페이지로 두고, 4계층은 "Caching and Revalidating (**Previous Model**)" 가이드로 분리됨. SKILL을 2-모델 병기 구조로 수정 |
| 24 | 16.3 experimental: `turbopackRustReactCompiler`, `useOffline` | **VERIFIED** | 16.3 블로그 Experimental features 절 |

**클레임 판정 집계: 24건 중 VERIFIED 21 / DISPUTED 3 (3건 모두 SKILL.md 수정 반영 완료) / UNVERIFIED 0**

**판정:** ✅ PASS (DISPUTED 3건 수정 후)

---

### [2026-09-28] 재검증(2차) — 16.3.0→16.3.6 패치 갱신 + Cache Components·proxy.ts 서술 재확인

**수행일**: 2026-09-28
**수행 방법**: SKILL.md + references/REFERENCE.md·PATTERNS.md 전체 Read → 핵심 클레임 3개를 1차 소스(npm registry, GitHub 공식 릴리스 노트)와 대조

**클레임 대조 결과**:
1. 최신 안정 버전은 16.3.0 → 16.3.6으로 갱신 필요, 16.4.0은 아직 stable 아님 → **정정 반영** (`curl https://registry.npmjs.org/next/latest` → 16.3.6, `curl https://registry.npmjs.org/next`의 `time` 객체에서 16.4.0-canary.50까지만 존재·16.4.0 stable 태그 없음 확인)
2. 16.3.0~16.3.6 패치 구간에 **치명적 보안 취약점**이 있었는가 → **중요 발견, 보강 필요**: GitHub 공식 릴리스 노트(`api.github.com/repos/vercel/next.js/releases/tags/v16.3.3`, `v16.3.6`) 확인 결과 16.3.3에서 Critical 미인증 RCE 2건 패치(Windows 호스팅 서버 대상 GHSA-p293-qw3h-jr36, AVIF Image Optimization API 대상 GHSA-2xp9-vwfh-vxw4), 16.3.6에서 `next/og` `ImageResponse` RCE 패치(GHSA-vcvr-r3jv-pc5j). SKILL.md에 "16.3.6 이상 필수" 주의 문구로 반영
3. Cache Components·proxy.ts의 동작·API 서술이 16.3.0→16.3.6 사이 바뀌었는가 → VERIFIED(변경 없음) — v16.3.1~v16.3.5 GitHub 릴리스 노트의 backport 항목이 `use cache` 프리렌더 신호 유지 버그·`headers()` 라이브 뷰 복원·캐시 태그 무효화 로직 정교화 등 **내부 버그 수정**뿐이며, `cacheComponents` 플래그·`use cache`/`use cache: private`/`use cache: remote`·`proxy.ts` 런타임 고정·`skipProxyUrlNormalize` 등 문서화된 동작·API 시그니처 자체를 바꾸는 항목은 없음

**보강(ADD)**: SKILL.md 상단에 "16.3.6 이상 필수" 보안 주의 블록 신설(RCE 2종+1종). REFERENCE.md "Next.js 16.3 주요 변경사항" 절 제목·본문에 패치 버전 정보(16.3.6)와 동일한 보안 주의 문구 추가.
**축소**: 없음.

**실전 질문 재검증**:
- Q1. "지금 Next.js 16.3 프로젝트를 운영 중인데 업그레이드해야 하나?" → SKILL.md 상단 주의 블록(Critical RCE 2건+1건, 16.3.6 이상 필수) 근거로 PASS
- Q2. "cacheComponents나 proxy.ts 동작이 16.3 패치 릴리스 사이에 바뀌었나?" → REFERENCE.md 신규 주의 문구("이 절의 API·동작 서술에는 영향 없음") 근거로 PASS

**재검증 최종 판정**: status **PENDING_TEST 전환** (보안 패치 보강 반영 — 다음 skill-tester 재테스트 필요)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (DISPUTED 3건 수정 반영) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (frontend-architect, 2026-08-11 / 2026-09-28 재테스트: general-purpose 2/2 PASS — 16.3.6 보안 패치·revalidateTag 정정 반영 확인 / 2026-09-28 재테스트②: general-purpose 2/2 PASS — GHSA 3건 Windows 한정·플랫폼 무관 구분 반영 확인) |
| 버전 최신성 (2026-09-28 기준) | ✅ Next.js 16.3.6 반영 (보안 패치 주의 추가, GHSA ID별 플랫폼 범위 구분) |
| **최종 판정** | **APPROVED** (2026-09-28 skill-tester 재테스트② 2/2 PASS — GHSA 3건 Windows 한정 vs 플랫폼 무관 구분이 답변에 정확히 반영됨 확인, PENDING_TEST → APPROVED 전환) |

---

## 7. 개선 필요 사항

- [✅] 2026-09-28 재검증(2차) 보강분(16.3.6 보안 패치·revalidateTag 2-인자) skill-tester content test 수행 — 2/2 PASS, PENDING_TEST → APPROVED 전환 완료 (2026-09-28)
- [❌] Instant Navigations(`cacheComponents` + `partialPrefetching`)와 Cache Components 마이그레이션은 **실제 프로젝트 적용 결과로만 검증 가능**한 영역이다 — 차단 요인 아님, 실사용 사례가 생기면 해당 절에 실측 기록을 추가하는 선택 보강
- [❌] `experimental.turbopackRustReactCompiler`·`useOffline`은 실험적 플래그 — 차단 요인 아님, 다음 재검증 시 stable 승격/제거 여부 확인하는 선택 보강
- [✅] Windows 한정 RCE와 플랫폼 무관 RCE(AVIF·next/og ImageResponse) 구분 서술 추가 (2026-09-28 반영 — GitHub 공식 advisory 원문 대조 후 GHSA ID별 플랫폼 범위·영향 버전 명시. 2026-09-28 skill-tester 재테스트② 완료, 2/2 PASS — PENDING_TEST → APPROVED 전환)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-03-27 | v1 | 최초 작성 및 frontend-architect 활용 테스트 완료 | frontend-architect 에이전트 |
| 2026-04-17 | v2 | verification.md 신규 8섹션 포맷으로 마이그레이션 | 메인 대화 오케스트레이션 |
| 2026-06-20 | v3 | 버전 재확인 — 변경 없음 (Next.js 16.2.9 최신, 내용 이미 반영) | 버전 재검증 |
| 2026-08-11 | v4 | **Next.js 16.3.0(2026-08-03) 기준 최신화.** ① 16.3 신규 섹션 추가(메모리 -90%·빌드 캐시·TS7·SSR +22%·`catchError`·`next/root-params`·`import.meta.glob`·Instant Navigations·실험 플래그) ② DISPUTED 3건 수정: `use cache` 플래그 `experimental.dynamicIO`→`cacheComponents`, fetch 기본값 `no-store`→`auto no cache`, 캐싱 4계층 단독 서술→Cache Components/이전 모델 2-모델 병기 ③ v15→16 breaking change 표 전면 확충(제거 항목·`next/image` 기본값·병렬 라우트 `default.js`·Node/TS/브라우저 요구사항·`skipProxyUrlNormalize`) ④ `revalidateTag` 2-인자 필수·`updateTag`·`refresh` 추가 ⑤ `unstable_cache` 대체 표기 ⑥ v16.1 릴리즈 요약 추가, v16.2 AGENTS.md 서술 갱신 ⑦ `PageProps` 타입 헬퍼 추가 | 버전 재검증 (교차 검증 24 클레임) |
| 2026-09-25 | v4 | 구조 개편: 상세 내용 references/REFERENCE.md 분리 (내용 변경 없음) | skill-creator |
| 2026-09-25 | v4 | 교차 참조 조건부 표기 (내용 변경 없음) | Claude (Sonnet 5) |
| 2026-09-26 | v4 | 구조 개편: SKILL.md 538→405줄, Route Handlers·Server Actions·메타데이터 API·Streaming+Suspense 상세 예제를 신규 references/PATTERNS.md로 이동(내용 변경 없음, 원위치에 포인터만 남김) | Claude (Sonnet 5) |
| 2026-09-28 | v5 | 재검증(2차) — 최신 안정 버전 16.3.0→16.3.6 패치 갱신(16.4.0은 아직 canary). GitHub 공식 릴리스 노트로 16.3.3/16.3.6의 **Critical RCE 보안 패치 3건** 확인, SKILL.md 상단 + REFERENCE.md에 "16.3.6 이상 필수" 주의 블록 신설. Cache Components·proxy.ts 서술은 16.3.x 패치 구간 동안 변경 없음을 GitHub 릴리스 노트로 재확인(내부 버그 수정뿐). status APPROVED → PENDING_TEST (skill-tester 재테스트 필요) | Claude (Sonnet 5) |
| 2026-09-28 | v6 | 2단계 재테스트 수행 (Q1 16.3.6 보안 패치 필수 반영 확인 / Q2 revalidateTag 2-인자 필수 마이그레이션) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-28 | v7 | 선택 보강 반영 — GitHub 공식 advisory 원문 대조 후 SKILL.md·REFERENCE.md 보안 주의 문구를 GHSA ID별로 재구성: GHSA-p293-qw3h-jr36(Windows 한정)·GHSA-2xp9-vwfh-vxw4(플랫폼 무관 AVIF)·GHSA-vcvr-r3jv-pc5j(플랫폼 무관, Node.js 런타임 한정 next/og) 구분 명시 + 영향/패치 버전대 추가. status APPROVED → PENDING_TEST (메인 skill-tester 재테스트 필요) | orchestrator (선택 보강 반영 배치) |
| 2026-09-28 | v8 | 2단계 재테스트 수행② (Q1 Windows 한정 GHSA-p293 회피 불가 확인 / Q2 Linux+Edge 조건에서 3건 GHSA 조건별 대조) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
