---
name: nextjs
description: Next.js 16.x App Router 핵심 패턴, 데이터 페칭, Cache Components 캐싱 전략, 15→16 Breaking Changes
---

# Next.js App Router 패턴 (v16.x)

> 소스:
> - App Router 문서: https://nextjs.org/docs/app
> - Next.js 16 릴리즈: https://nextjs.org/blog/next-16
> - Next.js 16.1 릴리즈: https://nextjs.org/blog/next-16-1
> - Next.js 16.2 릴리즈: https://nextjs.org/blog/next-16-2
> - Next.js 16.3 릴리즈: https://nextjs.org/blog/next-16-3
> - v15 → v16 업그레이드 가이드: https://nextjs.org/docs/app/guides/upgrading/version-16
> - 캐싱(Cache Components): https://nextjs.org/docs/app/getting-started/caching
> - fetch API 레퍼런스: https://nextjs.org/docs/app/api-reference/functions/fetch
>
> 검증일: 2026-08-11
> 검증 대상 버전: **Next.js 16.3.0** (2026-08-03 릴리즈, 현재 최신 stable)

---

## App Router 파일 컨벤션

```
app/
├── layout.tsx          # 공유 레이아웃 (children 감싸기)
├── page.tsx            # 라우트 UI
├── loading.tsx         # 자동 Suspense 래핑 (로딩 UI)
├── error.tsx           # 에러 바운더리 ('use client' 필수)
├── not-found.tsx       # notFound() 호출 시 표시
├── route.ts            # API Route Handler
├── template.tsx        # 탐색 시마다 새 인스턴스 (layout과 차이)
└── (group)/            # URL에 영향 없는 폴더 그룹핑
    └── dashboard/
        └── page.tsx    # /dashboard 라우트
```

---

## Server vs Client Component

### 결정 기준

```
서버 컴포넌트 (기본값):
✅ DB/API 직접 접근
✅ 민감 정보(API 키, 토큰)
✅ 대용량 의존성 (번들 크기 ↓)
✅ SEO 필요 콘텐츠

클라이언트 컴포넌트 ('use client'):
✅ useState, useEffect, useReducer
✅ 이벤트 핸들러 (onClick, onChange 등)
✅ 브라우저 API (localStorage, window 등)
✅ 실시간 인터랙션
```

### 경계 최소화 패턴

```tsx
// ✅ 서버에서 데이터 페칭, 클라이언트는 인터랙션만
// app/posts/page.tsx (Server)
async function PostsPage() {
  const posts = await db.post.findMany() // 서버에서만
  return <PostList posts={posts} />      // Client Component로 전달
}

// components/PostList.tsx (Client)
'use client'
function PostList({ posts }: { posts: Post[] }) {
  const [filter, setFilter] = useState('all')
  // ...
}
```

---

## 데이터 페칭 패턴

### fetch + 캐싱 전략

```tsx
// 정적 (빌드 시 1회 페칭, CDN 캐시)
// Next.js 15+ 기본값은 'auto no cache' — 캐싱은 opt-in이다.
//   · 라우트가 정적 prerender 되면 next build 때 1회만 페칭
//   · 라우트에 Request-time API(cookies/headers/searchParams 등)가 감지되면 매 요청 페칭
//   · dev 서버에서는 매 요청 페칭
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache' // Next.js 15+: 지속 캐싱을 원하면 명시 필수
})

// 동적 (라우트 정적 여부와 무관하게 매 요청마다 페칭)
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store'
})

// ISR (주기적 재검증)
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 } // 1시간마다 갱신
})

// 태그 기반 재검증
const data = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] }
})
```

### 온디맨드 재검증 (Next.js 16 — 시그니처 변경 주의)

```tsx
// Server Action / Route Handler에서 사용
import { revalidateTag, revalidatePath, updateTag, refresh } from 'next/cache'

async function updatePost(id: string) {
  await db.post.update({ where: { id }, data: { ... } })

  // ⚠️ Next.js 16: revalidateTag는 두 번째 인자로 cacheLife 프로필이 필수다.
  //    1-인자 형태는 deprecated이며 TypeScript 에러가 발생한다.
  revalidateTag('posts', 'max')    // stale-while-revalidate — 약간의 지연 허용
  revalidatePath('/posts')         // 경로 기반
  revalidatePath('/posts/[id]', 'page') // 동적 라우트
}
```

| API | 도입/변경 | 용도 |
|-----|-----------|------|
| `revalidateTag(tag, profile)` | v16에서 2번째 인자 **필수** | stale-while-revalidate. 블로그·카탈로그처럼 갱신 지연이 허용되는 콘텐츠 |
| `updateTag(tag)` | v16 신규, **Server Action 전용** | read-your-writes. 만료 + 같은 요청 내 즉시 갱신 → 사용자가 자기 변경을 바로 봄 |
| `refresh()` | v16 신규, Server Action 전용 | 클라이언트 라우터만 새로고침 (예: 헤더의 알림 카운트) |

```tsx
'use server'
import { updateTag } from 'next/cache'

export async function updateProfile(userId: string, profile: Profile) {
  await db.users.update(userId, profile)
  updateTag(`user-${userId}`)   // 즉시 반영 — 폼·설정 저장에 적합
}
```

### 'use cache' 디렉티브 (Next.js 16 권장 — unstable_cache 대체)

`next.config.ts`에 **`cacheComponents: true`** 설정 필요.

> **주의:** Next.js 15에서 쓰던 `experimental.dynamicIO` / `experimental.useCache` 플래그는 **v16에서 제거**됐다.
> 최상위 `cacheComponents: true`로 대체한다. 단순 rename이 아니라, `<Suspense>` 밖의 uncached 데이터에서
> 빌드 에러가 발생할 수 있는 **모델 전환**이다 (→ `/docs/app/guides/migrating-to-cache-components`).

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
}

export default nextConfig
```

```tsx
// DB 쿼리 캐싱 (data-level)
async function getCachedPosts(userId: string) {
  'use cache'
  return await db.post.findMany({ where: { userId } })
}

// cacheTag / cacheLife로 세밀한 제어 — v16에서 stable (unstable_ 접두사 제거)
import { cacheTag, cacheLife } from 'next/cache'

async function getPost(id: string) {
  'use cache'
  cacheTag('posts', `post-${id}`)
  cacheLife('hours') // 1시간 프로필
  return await db.post.findUnique({ where: { id } })
}

// 컴포넌트/페이지 전체 캐싱 (UI-level)
export default async function Page() {
  'use cache'
  cacheLife('hours')
  const users = await db.query('SELECT * FROM users')
  return <UserList users={users} />
}
```

**`use cache` 변형 (v16.3 기준)**

| 디렉티브 | 저장 위치 | 용도 |
|----------|-----------|------|
| `'use cache'` | 프리렌더 HTML + 인스턴스 인메모리 | 모든 사용자에게 동일한 결과 |
| `'use cache: private'` | 브라우저(클라이언트)만 | `cookies()`·`headers()`·`searchParams`를 직접 읽는 함수에 수명 부여 |
| `'use cache: remote'` | 공유 cache handler(내구성) | 인스턴스 간 공유 필요, 히트율이 높을 때만 이득 |

> **주의:** `use cache` 스코프 안에서 `cookies()`·`headers()` 같은 uncached 소스에 직접 접근할 수 없다.
> 바깥에서 값을 뽑아 **인자로 전달**하면 그 값이 캐시 키의 일부가 된다.

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

---

## Request API 비동기화 (v15 도입 → v16 필수)

### async params/searchParams (Breaking Change)

```tsx
// ❌ Next.js 14
function Page({ params }: { params: { id: string } }) {
  const { id } = params // 동기 접근
}

// ✅ Next.js 15+
async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params // 반드시 await
}

// searchParams도 동일
async function Page({
  searchParams
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const { query } = await searchParams
}
```

> **Next.js 16**: v15에 있던 **동기 접근 임시 호환이 완전히 제거**됐다. `cookies()`·`headers()`·`draftMode()`·
> `params`·`searchParams` 모두 await 없이는 동작하지 않는다.
> 마이그레이션 codemod: `npx @next/codemod@canary next-async-request-api .`

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

---

## 캐싱 모델 — 두 갈래 (v16)

Next.js 16에는 캐싱 모델이 **두 개** 공존한다. 어느 쪽인지 먼저 확정하고 답해야 한다.

| 모델 | 활성 조건 | 공식 문서 |
|------|-----------|-----------|
| **Cache Components** (권장) | `cacheComponents: true` | `/docs/app/getting-started/caching` |
| **이전 모델** (4계층) | 플래그 없음 (기본) | `/docs/app/guides/caching-without-cache-components` |

### 이전 모델 — 캐싱 4계층 (`cacheComponents` 미사용 시)

```
요청 → Request Memoization  (렌더링 사이클 내 중복 제거)
      → Data Cache           (fetch 결과, 지속 캐시)
      → Full Route Cache     (정적 라우트 HTML/RSC)
      → Router Cache         (클라이언트 탐색 캐시)
```

| 캐시 계층 | 저장 위치 | 지속 기간 | 무효화 방법 |
|-----------|-----------|-----------|------------|
| Request Memo | 서버 메모리 | 요청 1회 | 자동 |
| Data Cache | 서버 파일시스템 | 지속 | revalidateTag/Path |
| Full Route | 서버 파일시스템 | 지속 (정적) | 재배포/revalidate |
| Router Cache | 브라우저 메모리 | 세션 | router.refresh() |

### Cache Components 모델 (`cacheComponents: true`)

암묵적 4계층 대신 **명시적 `use cache`** 하나로 통일된다.

```
빌드/프리렌더 → static shell 생성
  ├─ 'use cache' 결과      → static shell에 포함 (수명은 cacheLife가 결정)
  ├─ <Suspense> fallback   → shell에 포함, 본문은 요청 시 streaming
  └─ 예측 가능한 값(모듈 import·순수 계산) → 자동으로 shell에 포함
```

- 캐시 결과는 **RSC payload**로 직렬화되어 ① 프리렌더 HTML ② 서버 공유 스토어 ③ 브라우저 세 곳에 저장된다.
- 이 프리렌더 방식이 곧 **PPR(Partial Prerendering)** 이며, Cache Components에서는 기본 동작이다.
- `cookies()` 읽기가 **라우트 전체를 동적으로 만들지 않는다** — Suspense 경계 안쪽만 요청 시 렌더된다.
- 모든 캐시는 **배포 단위로 스코프**된다 (캐시 키에 build id 포함). 새 배포 = 캐시 초기화.

> **주의 (SSR·SEO):** 봇·크롤러는 User-Agent로 감지되어 shell을 재사용하지 않고 **요청 시 전체 동적 렌더**된다.
> shell이 빌드 타임에만 존재하는 데이터에 의존하면, 사람에게는 뜨는 페이지가 크롤러에게는 실패할 수 있다.

---

## Route Handlers (API)

```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  const posts = await db.post.findMany({
    where: query ? { title: { contains: query } } : {}
  })

  return NextResponse.json(posts)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const post = await db.post.create({ data: body })
  return NextResponse.json(post, { status: 201 })
}

// 동적 라우트: app/api/posts/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const post = await db.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}
```

---

## Server Actions

```tsx
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1)
})

export async function createPost(prevState: unknown, formData: FormData) {
  const result = schema.safeParse({
    title: formData.get('title'),
    content: formData.get('content')
  })

  if (!result.success) {
    return { error: result.error.flatten() }
  }

  await db.post.create({ data: result.data })
  revalidatePath('/posts')
  return { success: true }
}

// 컴포넌트에서 사용
'use client'
function PostForm() {
  const [state, formAction, isPending] = useActionState(createPost, null)

  return (
    <form action={formAction}>
      <input name="title" />
      <textarea name="content" />
      <button disabled={isPending}>작성</button>
      {state?.error && <p>에러 발생</p>}
    </form>
  )
}
```

---

## 메타데이터 API

> 여기서는 프레임워크 관점의 기본형만 다룬다. OpenGraph·JSON-LD·sitemap·robots·canonical 등
> **SEO 관점의 상세**는 `frontend/seo-nextjs` 스킬을 참조한다.

### 정적 메타데이터

```tsx
// app/about/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: '소개 페이지',
  openGraph: {
    title: 'About',
    description: '소개 페이지',
    images: ['/og-image.png'],
  },
}
```

### 동적 메타데이터

```tsx
// app/posts/[id]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const post = await fetch(`https://api.example.com/posts/${id}`).then(r => r.json())
  return {
    title: post.title,
    description: post.excerpt,
  }
}
```

---

## Streaming + Suspense

```tsx
// loading.tsx: 자동으로 Suspense 래핑됨
export default function Loading() {
  return <Skeleton />
}

// 세분화된 Streaming: 느린 컴포넌트만 suspense 처리
async function Page() {
  return (
    <main>
      <Header />       {/* 즉시 표시 */}
      <Suspense fallback={<CommentSkeleton />}>
        <Comments />   {/* 준비되면 streaming */}
      </Suspense>
    </main>
  )
}
```

---

## Middleware (Next.js 15) → proxy.ts (Next.js 16)

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

### Next.js 16 방식 (proxy.ts — Node.js 런타임)

```tsx
// proxy.ts (루트) — Next.js 16+
// middleware.ts는 deprecated, proxy.ts로 대체
// Node.js 런타임에서 실행
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
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

> **주의:** `proxy.ts`의 런타임은 `nodejs`로 **고정이며 설정할 수 없다**. Edge 런타임이 필요하면 deprecated된 `middleware.ts`를 유지해야 한다 (공식 문서: "We will follow up on a minor release with further edge runtime instructions").

**설정 플래그 이름도 함께 바뀐다** — `middleware`가 들어간 옵션은 `proxy`로 리네이밍됐다.

```ts
// next.config.ts
const nextConfig: NextConfig = {
  // skipMiddlewareUrlNormalize → skipProxyUrlNormalize
  skipProxyUrlNormalize: true,
}
```

**middleware.ts → proxy.ts 마이그레이션 (codemod가 파일명·함수명·플래그를 함께 처리):**
```bash
npx @next/codemod@canary upgrade latest
```

---

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

---

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

---

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

---

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
