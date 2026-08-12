---
skill: nextjs
category: frontend
version: v4
date: 2026-08-11
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
| 스킬 경로 | `.claude/skills/frontend/nextjs/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 재검증일 | **2026-08-11** |
| 검증 방법 | 공식 문서 교차 검증 (nextjs.org 블로그 + docs + 독립 3rd-party 보도) |
| 버전 기준 | **Next.js 16.3.0** (2026-08-03 릴리즈, 현재 최신 stable) |

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

---

## 5. 테스트 진행 기록

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

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (DISPUTED 3건 수정 반영) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (frontend-architect) |
| 버전 최신성 (2026-08-11 기준) | ✅ Next.js 16.3.0 반영 |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- Instant Navigations(`cacheComponents` + `partialPrefetching`)와 Cache Components 마이그레이션은 **실제 프로젝트 적용 결과로만 검증 가능**한 영역이다. 실사용 사례가 생기면 해당 절에 실측 기록을 추가한다.
- `experimental.turbopackRustReactCompiler`·`useOffline`은 실험적 플래그이므로 다음 재검증 시 stable 승격/제거 여부를 우선 확인한다.

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-03-27 | v1 | 최초 작성 및 frontend-architect 활용 테스트 완료 | frontend-architect 에이전트 |
| 2026-04-17 | v2 | verification.md 신규 8섹션 포맷으로 마이그레이션 | 메인 대화 오케스트레이션 |
| 2026-06-20 | v3 | 버전 재확인 — 변경 없음 (Next.js 16.2.9 최신, 내용 이미 반영) | 버전 재검증 |
| 2026-08-11 | v4 | **Next.js 16.3.0(2026-08-03) 기준 최신화.** ① 16.3 신규 섹션 추가(메모리 -90%·빌드 캐시·TS7·SSR +22%·`catchError`·`next/root-params`·`import.meta.glob`·Instant Navigations·실험 플래그) ② DISPUTED 3건 수정: `use cache` 플래그 `experimental.dynamicIO`→`cacheComponents`, fetch 기본값 `no-store`→`auto no cache`, 캐싱 4계층 단독 서술→Cache Components/이전 모델 2-모델 병기 ③ v15→16 breaking change 표 전면 확충(제거 항목·`next/image` 기본값·병렬 라우트 `default.js`·Node/TS/브라우저 요구사항·`skipProxyUrlNormalize`) ④ `revalidateTag` 2-인자 필수·`updateTag`·`refresh` 추가 ⑤ `unstable_cache` 대체 표기 ⑥ v16.1 릴리즈 요약 추가, v16.2 AGENTS.md 서술 갱신 ⑦ `PageProps` 타입 헬퍼 추가 | 버전 재검증 (교차 검증 24 클레임) |
