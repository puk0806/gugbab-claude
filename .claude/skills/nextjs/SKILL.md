---
name: nextjs
description: Next.js 16.x 최신 변경점 — 16.4.5 이상 보안 권고, 15→16 Breaking Changes(proxy.ts·async Request API·revalidateTag 2인자·cacheComponents), Cache Components 모델 함정, 16.1~16.4 신규 API(catchError·next/root-params·ensureStatic·navigation())
---

# Next.js App Router 패턴 (v16.x)

> 소스:
> - App Router 문서: https://nextjs.org/docs/app
> - Next.js 16 릴리즈: https://nextjs.org/blog/next-16
> - Next.js 16.1 릴리즈: https://nextjs.org/blog/next-16-1
> - Next.js 16.2 릴리즈: https://nextjs.org/blog/next-16-2
> - Next.js 16.3 릴리즈: https://nextjs.org/blog/next-16-3
> - Next.js 16.4 릴리즈: https://nextjs.org/blog/next-16-4
> - v15 → v16 업그레이드 가이드: https://nextjs.org/docs/app/guides/upgrading/version-16
> - 캐싱(Cache Components): https://nextjs.org/docs/app/getting-started/caching
> - fetch API 레퍼런스: https://nextjs.org/docs/app/api-reference/functions/fetch
> - 보안 권고: https://github.com/vercel/next.js/security/advisories
>
> 검증일: 2026-11-09 (재검증: 16.4 릴리즈·보안 권고 반영. 최초 2026-08-11, 직전 2026-09-28)
> 검증 대상 버전: **Next.js 16.4.5** (2026-11-03 릴리즈 — 현재 최신 stable. 16.4.0은 2026-10-06 정식 출시. 15.x 백포트 최신은 15.5.29)
>
> **주의(2026-11-09 확인, GitHub 공식 advisory 원문 대조) — 반드시 16.4.5 이상(15.x는 15.5.29 이상)으로 사용한다.** 16.3.6 이후에도 권고가 계속 나왔다:
> - **2026-10-14 (16.4.1 / 15.5.28 패치)** — Critical 2건: GHSA-673q-mjm6-r5xr(`use cache` 함수가 typed array를 반환할 때 미인증 RCE, 16.0.0~16.4.0), GHSA-2464-fhr4-w9xw(SVG 파일 사용 시 이미지 최적화 API 미인증 RCE, 10.0.0~15.5.27·16.x~16.4.0). High 1건: GHSA-p3m5-59mp-jv5r(Server Actions DoS)
> - **2026-11-03 (16.4.5 / 15.5.29 패치)** — Moderate 7건: `use cache`/root params 간 캐시 누출·오염(GHSA-vc7v-qv4w-wrv8·GHSA-mfr8-8qww-v76h·GHSA-rhh4-g77r-r9qj·GHSA-vvgp-ww4w-46vf), Edge 런타임 HttpOnly 쿠키 노출(GHSA-f3mh-rxg3-f5g2), 이미지 최적화 SVG 거부 우회(GHSA-7qx7-33qx-rqx2), self-hosted 응답 주입(GHSA-pc58-hwjq-p385)
> - 2026-09-30 (16.3.8): 이미지 최적화 SSRF(High) 등 — 위 버전 이상이면 모두 포함
>
> 아래는 직전(2026-09-28) 기록 — 16.3.0~16.3.5 사이 **치명적(Critical) 보안 취약점** 3건(그중 1건만 Windows 호스팅에 한정):
> - **GHSA-p293-qw3h-jr36 — Windows 호스팅 서버 한정** 경로 순회(Path Traversal) → 미인증 RCE. "Windows 파일시스템을 사용하는 서버에 호스팅된 경우"로 명시된 취약점이며 다른 OS는 영향 없음. (13.4.0~15.5.23, 16.0.0~16.3.2 영향 → 15.5.24 / 16.3.3에서 패치)
> - **GHSA-2xp9-vwfh-vxw4 — 플랫폼 무관** AVIF 이미지 최적화 RCE. `sharp`가 쓰는 `libheif` 라이브러리 결함이 원인이라 **호스팅 OS와 무관하게** 영향받는다. (10.0.0~15.5.23, 16.0.0~16.3.2 영향 → 15.5.24 / 16.3.3에서 패치)
> - **GHSA-vcvr-r3jv-pc5j — 플랫폼 무관** `next/og` `ImageResponse`(Node.js 런타임 한정, Edge 구현은 영향 없음) RCE — Satori 의존성의 SVG 이스케이프 결함으로 공격자 제어 값이 SVG content/속성/style에 들어가면 발동. (16.2.0~16.3.5 영향 → 16.3.6에서 패치)
>
> Cache Components·proxy.ts의 동작·API 서술 자체는 16.3.0~16.4.5 사이에 바뀌지 않았다. **16.4는 Breaking change 없이** Cache Components를 "모든 앱에 권장"으로 격상하고(`create-next-app` 신규 앱 기본 활성, Next.js 17에서 기본값 예정) `ensureStatic`·`navigation()`·`prefetch()` 같은 API를 추가했다 → 6절.

---

## 이 스킬의 범위

v16 보안 기준 버전, 15→16 Breaking Changes, Cache Components 모델의 함정, 16.1~16.4 신규 API만 다룬다.

> 기본 사용법(파일 컨벤션·Server/Client Component 구분·Route Handler·Server Action·메타데이터·Suspense 스트리밍)은 공식 문서 수준이라 싣지 않는다.

---

## 1. 15 → 16 Breaking Changes

### 런타임·환경 요구사항

| 항목 | 이전 (15) | 이후 (16) |
|------|-----------|-----------|
| Node.js 최소 버전 | 18.18.0 | **20.9.0** (Node 18 미지원) |
| TypeScript 최소 버전 | — | **5.1.0** |
| 브라우저 | — | Chrome/Edge/Firefox **111+**, Safari **16.4+** |
| 기본 번들러 | Webpack (prod) / Turbopack (dev) | **Turbopack (dev + build 모두 기본)** |

### 변경 요약

| 영역 | 변경 |
|------|------|
| **동기 Request API** | v15의 임시 동기 호환이 **완전 제거**. `cookies`·`headers`·`draftMode`·`params`·`searchParams`는 **await 필수**. codemod: `npx @next/codemod@canary next-async-request-api .` |
| **middleware.ts** | deprecated → **`proxy.ts`** (함수명·설정 플래그도 `proxy`로, 2절) |
| **`generateSitemaps`** | `sitemap()`이 받는 `id`가 **`Promise<string>`** 으로 변경 |
| **OG·아이콘 이미지** | `opengraph-image`·`twitter-image`·`icon`·`apple-icon`의 `params`·`id`가 **Promise**로 변경 (`generateImageMetadata`의 `params`는 동기 유지) |
| **`revalidateTag`** | 2번째 인자(`cacheLife` 프로필) **필수**. 1-인자는 deprecated → TS 에러 (3절) |
| **PPR** | `experimental.ppr` / `experimental_ppr` 세그먼트 설정 **제거** → `cacheComponents: true` |
| **`experimental.dynamicIO` / `experimental.useCache`** | **제거** → `cacheComponents` |
| **`unstable_rootParams`** | **제거** → `next/root-params` |
| **병렬 라우트** | 모든 slot에 **`default.js` 필수**. 없으면 빌드 실패 (`notFound()` 또는 `null` 반환 default.tsx) |
| **AMP** | **완전 제거** (`next/amp`, `useAmp`, `amp` 설정) |
| **`next lint`** | **제거**. ESLint/Biome 직접 사용, `next build`는 더 이상 lint하지 않음 |
| **`serverRuntimeConfig`/`publicRuntimeConfig`** | **제거** → 환경변수(`NEXT_PUBLIC_`, 런타임 값은 `connection()` 후 읽기) |
| **ESLint** | `@next/eslint-plugin-next` 기본이 **Flat Config** |
| **`scroll-behavior`** | Next.js가 더 이상 자동으로 override 하지 않음 → 원 동작을 원하면 `<html data-scroll-behavior="smooth">` |
| **`next build` 출력** | `size`·`First Load JS` 지표 **제거** (RSC 환경에서 부정확) — Lighthouse 등으로 측정 |
| **dev/build 동시 실행** | 출력 디렉토리 분리(`next dev` → `.next/dev`). 같은 프로젝트에서 동시 실행 가능, lockfile로 중복 인스턴스 차단 |
| **`next/legacy/image`** | deprecated → `next/image` |
| **`images.domains`** | deprecated → `images.remotePatterns` |

타입 헬퍼(v15.5+): `npx next typegen`이 `PageProps<'/blog/[slug]'>`·`LayoutProps`·`RouteContext` 전역 타입을 생성한다 — 수동 `Promise<{...}>` 선언보다 안전하다.

### `next/image` 기본값 변경 (v16)

| 옵션 | 이전 | 이후 (16) |
|------|------|-----------|
| `images.minimumCacheTTL` | 60초 | **4시간(14400초)** |
| `images.imageSizes` | `[16, 32, ...]` | **16 제거** |
| `images.qualities` | 전체 허용 | **`[75]`만** (다른 값은 가장 가까운 값으로 보정) |
| `images.maximumRedirects` | 무제한 | **3** |
| 로컬 IP 최적화 | 허용 | **차단** (`dangerouslyAllowLocalIP`로만 해제, SSRF 위험) |
| 쿼리스트링 로컬 이미지 | 허용 | `images.localPatterns.search` 설정 필요 (열거 공격 방지) |

### Turbopack 기본값

- `next dev`·`next build` 모두 Turbopack — `--turbopack` 플래그 불필요. Webpack으로 되돌리려면 `next build --webpack`.
- **커스텀 `webpack` 설정이 있으면 그냥 `next build`는 실패한다** (오설정 방지) → `--webpack`(유지) 또는 `--turbopack`(webpack 설정 무시)을 명시.
- 설정 위치 이동: `experimental.turbopack` → **최상위 `turbopack`**.

> **주의:** Turbopack은 Sass의 레거시 틸드(`~`) prefix import를 지원하지 않는다.
> `@import '~bootstrap/...'` → `@import 'bootstrap/...'`.

### React 19.2 / React Compiler

- App Router가 React 19.2 기반 (View Transitions, `useEffectEvent`, `Activity`).
- `reactCompiler` 옵션이 **experimental → stable**로 승격. 단 **기본값은 off** (빌드 성능 데이터 수집 중). Babel 경유이므로 켜면 dev·build 컴파일 시간이 늘어난다 (→ 16.3 Rust 포트).

---

## 2. middleware.ts → proxy.ts

- 파일 `proxy.ts`, export 함수명 `proxy`. 본문·`config.matcher`는 middleware와 같은 형태.
- 설정 플래그 리네이밍: `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`.
- codemod가 파일명·함수명·플래그를 함께 처리: `npx @next/codemod@canary upgrade latest`

> **주의:** `proxy.ts`의 런타임은 `nodejs`로 **고정이며 설정할 수 없다**. Edge 런타임이 필요하면 deprecated된 `middleware.ts`를 유지해야 한다 (공식 문서: "We will follow up on a minor release with further edge runtime instructions").

---

## 3. 재검증·캐시 API (v16)

| API | 도입/변경 | 용도 |
|-----|-----------|------|
| `revalidateTag(tag, profile)` | v16에서 2번째 인자 **필수** | stale-while-revalidate. 블로그·카탈로그처럼 갱신 지연이 허용되는 콘텐츠. 웹훅(Route Handler)처럼 `updateTag`를 못 쓰는 곳에서 즉시 만료가 필요하면 `revalidateTag(tag, { expire: 0 })` |
| `updateTag(tag)` | v16 신규, **Server Action 전용** | read-your-writes. 만료 + 같은 요청 내 즉시 갱신 → 사용자가 자기 변경을 바로 봄 |
| `refresh()` | v16 신규, Server Action 전용 | 클라이언트 라우터만 새로고침 (예: 헤더의 알림 카운트) |
| `cacheTag` / `cacheLife` | v16에서 stable (`unstable_` 접두사 제거) | `'use cache'` 함수 안에서 태그·수명 지정 |

```tsx
revalidateTag('posts')            // ❌ TS 에러 — cacheLife 프로필 인자 필수
revalidateTag('posts', 'max')     // ✅ / 즉시 반영이 필요하면 Server Action에서 updateTag('posts')
```

fetch 기본값(15+): 캐싱은 opt-in("auto no cache"). 지속 캐싱이 필요하면 `cache: 'force-cache'`를 명시한다 — 정적 prerender 라우트면 빌드 때 1회, Request-time API가 감지되면 매 요청, dev에서는 매 요청 페칭.

### `'use cache'` — `cacheComponents: true` 필요

> **주의:** Next.js 15에서 쓰던 `experimental.dynamicIO` / `experimental.useCache` 플래그는 **v16에서 제거**됐다.
> 최상위 `cacheComponents: true`로 대체한다. 단순 rename이 아니라, `<Suspense>` 밖의 uncached 데이터에서
> 빌드 에러가 발생할 수 있는 **모델 전환**이다 (→ `/docs/app/guides/migrating-to-cache-components`).

**`use cache` 변형 (v16.3 기준)**

| 디렉티브 | 저장 위치 | 용도 |
|----------|-----------|------|
| `'use cache'` | 프리렌더 HTML + 인스턴스 인메모리 | 모든 사용자에게 동일한 결과 |
| `'use cache: private'` | 브라우저(클라이언트)만 | `cookies()`·`headers()`·`searchParams`를 직접 읽는 함수에 수명 부여 |
| `'use cache: remote'` | 공유 cache handler(내구성) | 인스턴스 간 공유 필요, 히트율이 높을 때만 이득 |

> **주의:** `use cache` 스코프 안에서 `cookies()`·`headers()` 같은 uncached 소스에 직접 접근할 수 없다.
> 바깥에서 값을 뽑아 **인자로 전달**하면 그 값이 캐시 키의 일부가 된다.

> **주의:** `unstable_cache` — 공식 문서가 "이 API는 Next.js 16에서 `use cache`로 **대체됐다**"고 명시한다.
> 신규 코드에는 쓰지 말고, 기존 코드는 Cache Components + `use cache`로 마이그레이션한다.
> (제거되지는 않아 당장 동작은 한다.)

---

## 4. 캐싱 모델 — 두 갈래 (v16)

어느 쪽인지 먼저 확정하고 답해야 한다.

| 모델 | 활성 조건 | 공식 문서 |
|------|-----------|-----------|
| **Cache Components** (권장 — 16.4부터 "모든 앱에 권장", 신규 `create-next-app` 기본, 17에서 기본값 예정. 16.4 블로그는 `partialPrefetching: true`까지 모델의 일부로 봄) | `cacheComponents: true` | `/docs/app/getting-started/caching` |
| **이전 모델** (4계층: Request Memoization·Data Cache·Full Route Cache·Router Cache) | 플래그 없음 (기본) | `/docs/app/guides/caching-without-cache-components` |

Cache Components 모델에서 모델이 자주 틀리는 점:

- 암묵적 4계층 대신 **명시적 `use cache`** 하나로 통일된다. 프리렌더가 static shell을 만들고 `use cache` 결과·`<Suspense>` fallback·예측 가능한 값이 shell에 들어간다.
- 캐시 결과는 **RSC payload**로 직렬화되어 ① 프리렌더 HTML ② 서버 공유 스토어 ③ 브라우저 세 곳에 저장된다.
- 이 프리렌더 방식이 곧 **PPR(Partial Prerendering)** 이며, Cache Components에서는 기본 동작이다.
- `cookies()` 읽기가 **라우트 전체를 동적으로 만들지 않는다** — Suspense 경계 안쪽만 요청 시 렌더된다.
- 모든 캐시는 **배포 단위로 스코프**된다 (캐시 키에 build id 포함). 새 배포 = 캐시 초기화.

> **주의 (SSR·SEO):** 봇·크롤러는 User-Agent로 감지되어 shell을 재사용하지 않고 **요청 시 전체 동적 렌더**된다.
> shell이 빌드 타임에만 존재하는 데이터에 의존하면, 사람에게는 뜨는 페이지가 크롤러에게는 실패할 수 있다.

---

## 5. 16.1 ~ 16.3 신규 사항

### v16.1 (2025-12-18)

- **Turbopack File System Caching for `next dev` — stable, 기본 on** (재시작 시 컴파일 ~5~14× 단축)
- Bundle Analyzer (experimental): `next experimental-analyze` / `next dev --inspect`
- `serverExternalPackages`가 **전이 의존성**까지 처리, 새 `next upgrade` 커맨드

### v16.2

- **Next.js DevTools MCP**: 자동 시작되지 않으며 MCP 클라이언트에 수동 등록 필요 (`npx -y next-devtools-mcp@latest`)
- `adapterPath`(Build Adapters)가 최상위 stable 옵션으로 승격

### v16.3 (2026-08-03, Breaking change 없음)

> **주의(2026-09-28 확인, GitHub 공식 advisory 원문 대조) — 16.3.6 이상 사용 필수.** 16.3.0~16.3.5 사이에 치명적(Critical) 미인증 RCE 취약점 3건이 있었다 (상단 주의 문단 참조). 16.3.x 패치들은 보안 수정 외에 `use cache` 프리렌더 신호 유지 버그, `headers()` 라이브 뷰 복원, 캐시 태그 무효화 로직 정교화 등 버그 수정 위주이며 이 절의 API·동작 서술(캐시 모델, `catchError`, `next/root-params`, Instant Navigations 등)에는 영향 없다.

- 코드 변경 없이: dev 메모리 최대 90% 감소(memory eviction), `next build` 반복 빌드 최대 5.5×(FileSystem Cache 확장), SSR +22% 요청/초(native Node.js streams), TypeScript 7 사용 가능(`useTypeScriptCli`), prefetch 묶음 전송(`prefetchInlining`). 관련 설정: `turbopackMemoryEviction`, `turbopackFileSystemCache`, `prefetchInlining`.
- **`catchError`** (`next/error`, `'use client'`): `catchError(Fallback)`로 에러 바운더리를 만든다. Fallback 시그니처는 `(props, { error, retry }: ErrorInfo)`. 기존 React 에러 바운더리와 달리 `notFound()`·`redirect()`를 가로채지 않고, `retry()`가 실패한 Server Component를 재요청한다.
- **`next/root-params`**: `import { lang } from 'next/root-params'` → `await lang()`. 루트 레이아웃 위 `[lang]` 같은 파라미터를 prop drilling 없이 읽고 `use cache` 안에서도 동작한다.

  > **주의:** 현재 **Server Component만** 지원한다. Route Handler·Server Action 지원은 향후 릴리즈 예정.
  > v16에서 제거된 `unstable_rootParams`의 정식 후속 API다.

- **`import.meta.glob`**: Turbopack이 Vite 호환 glob import를 지원 (`.md`는 next.config.js에 loader 등록 필요).
- **Instant Navigations (opt-in)**: `cacheComponents: true` + `partialPrefetching: true` 두 플래그. Instant Insights(DevTools 검출)·Partial Prefetching(loading shell 추출)·개선된 ISR(미프리렌더 URL도 첫 방문에 shell 즉시)·Navigation Inspector·`@next/playwright`의 `instant()` 테스트 헬퍼. 공식 문서는 향후 메이저 버전에서 기본값이 될 예정이라고 명시.
- **AGENTS.md**: `next dev`가 실행될 때마다 버전이 일치하는 `AGENTS.md` 블록을 직접 쓰고 유지한다(`node_modules/next/dist/docs/` 번들 문서를 가리킴).

  > **주의:** 이 변경으로 Vercel이 "현재 문서를 앱에 주입"할 목적으로 제공하던 **기존 Skills는 폐지(retired)** 됐다. (16.4에서는 문서 주입용이 아닌 **마이그레이션용 Skills** — Cache Components·Partial Prefetching 도입, `next-bundle-optimizer` — 가 새로 제공된다. 6절)
  > `AGENTS.md` 블록은 `next dev`가 재생성하므로, diff에서 지우면 미커밋 변경으로 다시 생긴다 — 작업과 함께 커밋하는 편이 트리가 깨끗하다.

- 실험적: `experimental.turbopackRustReactCompiler`(React Compiler Rust 포트, `reactCompiler: true`와 함께 — Babel을 완전히 걷어낸 대형 앱 기준 `next dev` ready cold 34%·warm 46% 단축), `experimental.useOffline`(네트워크 끊김 시 throw 대신 pending 유지 + 복구 시 재시도, `next/offline`의 `useOffline` 훅).

---

## 6. 16.4 (2026-10-06, Breaking change 없음)

> 보안상 **16.4.5 이상** 사용 (상단 주의 참조 — 16.4.0에는 Critical RCE 2건, 16.4.1에서 패치).

- Cache Components를 **모든 Next.js 앱에 권장**. `create-next-app` 신규 앱은 **기본 활성**, **Next.js 17에서 기본값**이 될 예정. 블로그는 `cacheComponents: true` + `partialPrefetching: true`를 묶어 "Cache Components 모델"로 부른다.
- **`ensureStatic`** (page·layout route segment config, layout에 두면 하위 전체): 동적 컴포넌트가 섞이면 **빌드 실패**.

| 값 | 보장 범위 |
|----|-----------|
| `'navigation'` (가장 엄격) | 이 라우트로의 탐색이 요청 시 렌더되지 않음 |
| `'prefetch'` | 명시적 prefetch(`<Link prefetch>`)가 정적 콘텐츠만 가져옴 |
| `'shell'` | 라우트가 처음 발견될 때 정적 콘텐츠만 가져옴 |

- **`navigation()` / `prefetch()`** (`next/cache`): 컴포넌트 안에서 `await navigation()` → prefetch 때는 렌더하지 않고 실제 탐색 때 렌더. `await prefetch()` → shell에서 제외하고 명시적 prefetch 때만 렌더.
- 에이전트 도구: `npx next@canary upgrade --agent=latest`, `experimental.agentUpgrade`(`'security'` 기본 — 설치 버전에 영향 있는 취약점 업그레이드만 알림 / `'latest'` / `false`), `experimental.agentFeedback: true`(리포트 초안, 사용자 검토 후 전송, Telemetry 필요, CI에서는 동작 안 함).
- 모든 앱: Turbopack 디스크 캐시 20~25% 축소(Zstandard), lazy server HMR, 라우트 간 공유 runtime chunk, CSS Module 클래스명 단축·export mangling, **React 19.3** 탑재(View Transitions·Fragment Refs stable, `browser()` API).

| 실험 플래그 (`experimental.*`) | 내용 |
|---------------------------|------|
| `turbopackRustReactCompiler` | (16.3 도입) fast check로 최적화 불필요 파일 건너뜀, 메모리 30%·컴파일 15% 감소 |
| `turbopackGc` | 메모리·디스크 캐시의 사용 안 하는 컴파일 결과 정리 |
| `turbopackLazyDynamicImports` | 클라이언트 `import()`를 브라우저가 요청할 때만 컴파일 (일부 `next/dynamic`은 여전히 eager) |
| `turbopackPluginRuntimeStrategy: 'workerThreads'` | Babel·PostCSS·webpack loader를 worker thread로 (Node.js 24.13.1+에서는 버그로 child process 폴백) |
| `turbopackAdditionalRoots` | 프로젝트 루트 밖 symlink 의존성(pnpm/Bun global virtual store 등) 추적 |

---

## 7. 흔한 실수 (v16 기준)

| 실수 | 바른 처리 |
|------|----------|
| 캐시 설정 없이 fetch 지속 캐싱 기대 | 캐싱은 opt-in — `cache: 'force-cache'` 명시 |
| 동기 `params`/`cookies()` 접근 | 16에서 호환 계층 제거 — `await` |
| 16에서 middleware.ts 계속 사용 | proxy.ts(codemod). Edge 런타임이 꼭 필요할 때만 유지 |
| 커스텀 Webpack 설정 + 그냥 `next build` | 빌드 실패 — `--webpack` 또는 `--turbopack` 명시 |
| `revalidateTag('posts')` 1-인자 | `revalidateTag('posts', 'max')` 또는 Server Action에서 `updateTag` |
| `experimental.dynamicIO` 플래그로 `'use cache'` | v16에서 제거 — `cacheComponents: true` |
| 병렬 라우트 slot에 default.js 없음 | v16 빌드 실패 |
| `'use cache'` 함수 안에서 `cookies()`/`headers()` | 미지원 — 바깥에서 읽어 인자로 전달 |
| 16.4.5 미만 버전 유지 | 상단 보안 권고 — 16.4.5 / 15.5.29 이상 |
