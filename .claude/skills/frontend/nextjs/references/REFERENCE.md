### unstable_cache (레거시 — v16에서 대체됨)

> **주의:** 공식 문서가 "이 API는 Next.js 16에서 `use cache`로 **대체됐다**"고 명시한다.
> 신규 코드에는 쓰지 말고, 기존 코드는 Cache Components + `use cache`로 마이그레이션한다.
> (제거되지는 않아 당장 동작은 한다.)

```tsx
import { unstable_cache } from 'next/cache'

const getCachedPosts = unstable_cache(
  async (userId: string) => db.post.findMany({ where: { userId } }),
  ['user-posts'],              // 캐시 키
  { revalidate: 3600, tags: ['posts'] }
)
```

### 타입 헬퍼 — `PageProps` / `LayoutProps` / `RouteContext` (v15.5+)

`npx next typegen`으로 라우트별 전역 타입 헬퍼가 생성된다. 수동 `Promise<{...}>` 선언보다 안전하다.

```tsx
// app/blog/[slug]/page.tsx
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params      // slug 타입이 라우트에서 추론됨
  const query = await props.searchParams
  return <h1>{slug}</h1>
}
```

### Next.js 15 방식 (middleware.ts — deprecated in v16)

```tsx
// middleware.ts (루트) — Next.js 15까지
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*']
}
```

## Next.js 15 → 16 주요 변경사항

> 소스: https://nextjs.org/blog/next-16 | https://nextjs.org/docs/app/guides/upgrading/version-16

### 런타임·환경 요구사항

| 항목 | 이전 (15) | 이후 (16) |
|------|-----------|-----------|
| Node.js 최소 버전 | 18.18.0 | **20.9.0** (Node 18 미지원) |
| TypeScript 최소 버전 | — | **5.1.0** |
| 브라우저 | — | Chrome/Edge/Firefox **111+**, Safari **16.4+** |
| 기본 번들러 | Webpack (prod) / Turbopack (dev) | **Turbopack (dev + build 모두 기본)** |

### Breaking Changes 요약

| 영역 | 변경 |
|------|------|
| **동기 Request API** | v15의 임시 동기 호환이 **완전 제거**. `cookies`·`headers`·`draftMode`·`params`·`searchParams`는 **await 필수** |
| **middleware.ts** | deprecated → **`proxy.ts`** (함수명·설정 플래그도 `proxy`로) |
| **`generateSitemaps`** | `sitemap()`이 받는 `id`가 **`Promise<string>`** 으로 변경 |
| **OG·아이콘 이미지** | `opengraph-image`·`twitter-image`·`icon`·`apple-icon`의 `params`·`id`가 **Promise**로 변경 (`generateImageMetadata`의 `params`는 동기 유지) |
| **`revalidateTag`** | 2번째 인자(`cacheLife` 프로필) **필수**. 1-인자는 deprecated → TS 에러 |
| **PPR** | `experimental.ppr` / `experimental_ppr` 세그먼트 설정 **제거** → `cacheComponents: true` |
| **`experimental.dynamicIO` / `experimental.useCache`** | **제거** → `cacheComponents` |
| **`unstable_rootParams`** | **제거** → `next/root-params` |
| **병렬 라우트** | 모든 slot에 **`default.js` 필수**. 없으면 빌드 실패 |
| **AMP** | **완전 제거** (`next/amp`, `useAmp`, `amp` 설정) |
| **`next lint`** | **제거**. ESLint/Biome 직접 사용, `next build`는 더 이상 lint하지 않음 |
| **`serverRuntimeConfig`/`publicRuntimeConfig`** | **제거** → 환경변수(`NEXT_PUBLIC_`, 런타임 값은 `connection()` 후 읽기) |
| **ESLint** | `@next/eslint-plugin-next` 기본이 **Flat Config** |
| **`scroll-behavior`** | Next.js가 더 이상 자동으로 override 하지 않음 → 원 동작을 원하면 `<html data-scroll-behavior="smooth">` |
| **`next build` 출력** | `size`·`First Load JS` 지표 **제거** (RSC 환경에서 부정확) — Lighthouse 등으로 측정 |
| **dev/build 동시 실행** | 출력 디렉토리 분리(`next dev` → `.next/dev`). 같은 프로젝트에서 동시 실행 가능, lockfile로 중복 인스턴스 차단 |
| **`next/legacy/image`** | deprecated → `next/image` |
| **`images.domains`** | deprecated → `images.remotePatterns` |

### `next/image` 기본값 변경 (v16)

| 옵션 | 이전 | 이후 (16) |
|------|------|-----------|
| `images.minimumCacheTTL` | 60초 | **4시간(14400초)** |
| `images.imageSizes` | `[16, 32, ...]` | **16 제거** |
| `images.qualities` | 전체 허용 | **`[75]`만** (다른 값은 가장 가까운 값으로 보정) |
| `images.maximumRedirects` | 무제한 | **3** |
| 로컬 IP 최적화 | 허용 | **차단** (`dangerouslyAllowLocalIP`로만 해제, SSRF 위험) |
| 쿼리스트링 로컬 이미지 | 허용 | `images.localPatterns.search` 설정 필요 (열거 공격 방지) |

### Turbopack 완전 안정화 (기본값)

```bash
# Next.js 16에서 Turbopack이 dev/build 모두 기본값 — --turbopack 플래그 불필요
next dev    # Turbopack으로 실행
next build  # Turbopack으로 빌드

# Webpack으로 되돌리려면
next build --webpack
```

**커스텀 Webpack 설정이 있는 경우 — `next build`가 실패한다** (오설정 방지 목적):
```javascript
// next.config.js
const nextConfig = {
  webpack: (config) => { /* 커스텀 설정 */ return config }
}
// → next build --turbopack (webpack 설정 무시) 또는 next build --webpack (Webpack 유지)
```

설정 위치도 이동했다: `experimental.turbopack` → **최상위 `turbopack`**.

```ts
const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: { fs: { browser: './empty.ts' } },
  },
}
```

> **주의:** Turbopack은 Sass의 레거시 틸드(`~`) prefix import를 지원하지 않는다.
> `@import '~bootstrap/...'` → `@import 'bootstrap/...'`.

### React 19.2 / React Compiler

- App Router가 React 19.2 기반 (View Transitions, `useEffectEvent`, `Activity`).
- `reactCompiler` 옵션이 **experimental → stable**로 승격. 단 **기본값은 off** (빌드 성능 데이터 수집 중).
- Babel 경유이므로 켜면 dev·build 컴파일 시간이 늘어난다 (→ 16.3의 Rust 포트 참조).

## Next.js 16 마이너 릴리즈 요약

### v16.1 (2025-12-18)

- **Turbopack File System Caching for `next dev` — stable, 기본 on**. 컴파일 산출물을 디스크에 저장해 재시작 시 컴파일 ~5~14× 단축
- Bundle Analyzer (experimental): `next experimental-analyze`
- `next dev --inspect` (Node 디버거 연결)
- `serverExternalPackages`가 **전이 의존성**까지 처리
- 새 `next upgrade` 커맨드, 설치 용량 ~20MB 감소

### v16.2

- **AGENTS.md**: 루트에 생성되어 AI 에이전트가 코드 작성 전 `node_modules/next/dist/docs/`의 번들된 문서를 먼저 읽도록 안내
- **Next.js DevTools MCP**: 개발 환경 진단·에러 설명·수정 제안. 자동 시작되지 않으며 MCP 클라이언트에 수동 등록 필요
  ```json
  { "mcpServers": { "next-devtools": { "command": "npx", "args": ["-y", "next-devtools-mcp@latest"] } } }
  ```
- `adapterPath`(Build Adapters)가 최상위 stable 옵션으로 승격
- 성능: dev 서버 시작 ~400% 빠름, 렌더링 ~50% 빠름(RSC payload 역직렬화 개선), Server Fast Refresh 도입

## Next.js 16.3 주요 변경사항 (2026-08-03, 현재 최신)

> 소스: https://nextjs.org/blog/next-16-3
> **Breaking change 없음** — 애플리케이션 코드 변경 없이 업그레이드하면 성능 이득을 얻는다.

### 코드 변경 없이 얻는 개선

| 항목 | 수치 | 비고 |
|------|------|------|
| dev 서버 메모리 | **최대 90% 감소** | disk caching(16.1 도입) + **memory eviction**, 둘 다 기본 on |
| `next build` | 최대 **5.5× 빠름** (반복 빌드) | FileSystem Cache가 `next build`까지 확장, 기본 on |
| SSR 처리량 | **+22% 요청/초** | App Router 렌더링 레이어를 web streams → **native Node.js streams**로 교체 |
| 타입 체크 | TypeScript 7(네이티브 포트) 사용 가능 | `pnpm add -D typescript@^7` — `useTypeScriptCli` 설정 |
| prefetch 요청 수 | 감소 | 일정 크기 이하 prefetch를 묶어서 전송(`prefetchInlining`) |

관련 설정: `turbopackMemoryEviction`, `turbopackFileSystemCache`, `prefetchInlining`.

### 신규 API

**`catchError` — 커스텀 에러 바운더리** (`next/error`)

기존 React 에러 바운더리는 `notFound()`·`redirect()` 호출을 가로채는 문제가 있었고, 클라이언트 상태만 리셋할 수 있었다. `catchError`는 이를 방해하지 않으며 **실패한 Server Component를 재요청하는 `retry()`** 를 제공한다.

```tsx
'use client'
import { catchError, type ErrorInfo } from 'next/error'

function ErrorFallback(props: { title: string }, { error, retry }: ErrorInfo) {
  return (
    <div>
      <h2>{props.title}</h2>
      <p>{error.message}</p>
      <button onClick={() => retry()}>다시 시도</button>
    </div>
  )
}

export default catchError(ErrorFallback)
```

**Root Params — `next/root-params`**

루트 레이아웃 위에 정의된 `[lang]` 같은 파라미터를 prop drilling 없이 **모든 Server Component에서** 읽는다. `use cache` 스코프 안에서도 동작한다.

```tsx
// app/[lang]/posts/[slug]/page.tsx
import { lang } from 'next/root-params'

export default async function PostPage(props: PageProps<'/[lang]/posts/[slug]'>) {
  const { slug } = await props.params
  const language = await lang()
  return <article>{language} / {slug}</article>
}
```

> **주의:** 현재 **Server Component만** 지원한다. Route Handler·Server Action 지원은 향후 릴리즈 예정.
> v16에서 제거된 `unstable_rootParams`의 정식 후속 API다.

**glob imports — `import.meta.glob`**

Turbopack이 Vite 호환 `import.meta.glob`을 지원한다. 로컬 파일을 읽는 Server Component에 HMR이 적용된다.

```tsx
const posts = import.meta.glob('./posts/*.md', { eager: true })
// .md는 next.config.js에 loader 등록 필요
```

### Instant Navigations (opt-in)

SPA 수준의 탐색 반응성을 서버 주도 모델을 유지한 채 제공한다. **두 플래그로 활성화**한다.

```ts
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
}
```

| 기능 | 내용 |
|------|------|
| **Instant Insights** | DevTools가 즉시 렌더되지 않는 탐색을 자동 검출 + 수정 프롬프트 제공 |
| **Partial Prefetching** | 라우트 UI 어디서든 재사용 가능한 loading shell을 추출. `<Link prefetch={true}>`가 필요한 만큼만 prefetch |
| **개선된 ISR** | `generateStaticParams`로 프리렌더하지 않은 URL도 첫 방문자에게 즉시 loading shell을 주고, 백그라운드에서 완성본으로 업그레이드 |
| **Navigation Inspector** | 탐색을 shell 상태에서 일시정지해 실제 로딩 상태를 육안 확인 |
| **`instant()` 테스트 헬퍼** | `@next/playwright` — 탐색 시 즉시 보여야 할 콘텐츠를 회귀 테스트로 고정 |

> 공식 문서는 이 동작들이 **향후 메이저 버전에서 기본값**이 될 예정이라고 명시한다.

### AI 에이전트 문서 (v16.3에서 방식 변경)

`next dev`가 실행될 때마다 **버전이 일치하는 `AGENTS.md` 블록을 직접 쓰고 유지**한다. 이 블록은 `node_modules/next/dist/docs/`의 번들 문서를 가리킨다.

> **주의:** 이 변경으로 Vercel이 "현재 문서를 앱에 주입"할 목적으로 제공하던 **기존 Skills는 폐지(retired)** 됐다.
> `AGENTS.md` 블록은 `next dev`가 재생성하므로, diff에서 지우면 미커밋 변경으로 다시 생긴다 — 작업과 함께 커밋하는 편이 트리가 깨끗하다.

### 실험적 기능 (v16.3)

```ts
const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    turbopackRustReactCompiler: true,  // React Compiler의 Rust 포트 (Babel 우회)
    useOffline: true,                  // 네트워크 끊김 시 throw 대신 pending 유지 + 복구 시 재시도
  },
}
```

- **Rust React Compiler**: Turbopack 내부에서 직접 실행. 대형 앱 기준 `next dev` → ready 시간 cold 34%·warm 46% 단축 (Babel을 완전히 걷어낸 경우 기준)
- **Network resilience**: `useOffline` 훅(`next/offline`)으로 오프라인 상태 표시 가능

## 흔한 실수 패턴

```tsx
// ❌ Server Component에서 useState 사용
async function ServerPage() {
  const [count, setCount] = useState(0) // 에러: Hook 사용 불가
}

// ❌ Client Component에서 직접 DB 접근
'use client'
async function ClientPage() {
  const data = await db.user.findMany() // 위험: 클라이언트에 DB 로직 노출
}

// ❌ 캐시 설정 없이 지속 캐싱을 기대
const data = await fetch('/api/static-config') // 캐싱은 opt-in — cache: 'force-cache' 명시 필요

// ❌ Next.js 15+에서 동기 params (16에서는 호환 계층도 제거됨)
function Page({ params }: { params: { id: string } }) {
  const id = params.id // ⚠️ Promise를 await 없이 접근
}

// ❌ Next.js 16에서 middleware.ts 계속 사용
// → proxy.ts로 마이그레이션 필요 (codemod 제공). Edge 런타임이 꼭 필요할 때만 middleware 유지

// ❌ Next.js 16 + 커스텀 Webpack 설정 시 그냥 next build
// → 빌드가 실패한다. next build --webpack 또는 --turbopack 명시 필요

// ❌ Next.js 16에서 revalidateTag를 1-인자로 호출
revalidateTag('posts')            // TS 에러 — cacheLife 프로필 인자 필수
revalidateTag('posts', 'max')     // ✅ / 즉시 반영이 필요하면 Server Action에서 updateTag('posts')

// ❌ 'use cache'를 쓰면서 experimental.dynamicIO 플래그 설정
// → v16에서 제거됨. cacheComponents: true 사용

// ❌ 병렬 라우트 slot에 default.js 없이 배포
// → v16에서 빌드 실패. notFound() 또는 null 반환 default.tsx를 만든다

// ❌ 'use cache' 함수 안에서 cookies()/headers() 직접 호출
async function getData() {
  'use cache'
  const token = (await cookies()).get('t')  // ⚠️ 미지원 — 바깥에서 읽어 인자로 전달
}
```
