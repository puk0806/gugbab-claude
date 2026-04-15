---
name: nextjs
description: Next.js 15/16 App Router 핵심 패턴, 데이터 페칭, 캐싱 전략, Next.js 16 Breaking Changes
---

# Next.js App Router 패턴 (v15/16)

> 소스: https://nextjs.org/docs/app | https://nextjs.org/blog/next-16 | https://nextjs.org/docs/app/guides/upgrading/version-16
> 검증일: 2026-03-27

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
// 주의: Next.js 14까지는 force-cache가 기본값이었으나, Next.js 15+에서는 no-store가 기본값
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache' // Next.js 15+: 정적 캐싱을 원하면 명시 필수
})

// 동적 (매 요청마다 페칭)
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

### 온디맨드 재검증

```tsx
// Server Action / Route Handler에서 사용
import { revalidateTag, revalidatePath } from 'next/cache'

async function updatePost(id: string) {
  await db.post.update({ where: { id }, data: { ... } })
  revalidateTag('posts')           // 태그 기반
  revalidatePath('/posts')         // 경로 기반
  revalidatePath('/posts/[id]', 'page') // 동적 라우트
}
```

### unstable_cache (DB 쿼리 캐싱)

```tsx
import { unstable_cache } from 'next/cache'

const getCachedPosts = unstable_cache(
  async (userId: string) => {
    return await db.post.findMany({ where: { userId } })
  },
  ['user-posts'],              // 캐시 키
  {
    revalidate: 3600,
    tags: ['posts']
  }
)

// 사용
const posts = await getCachedPosts(userId)
```

### 'use cache' 디렉티브 (Next.js 16 권장, unstable_cache 대체)

`next.config.ts`에 `experimental.dynamicIO: true` 설정 필요.

```tsx
// DB 쿼리 캐싱 — unstable_cache보다 간결
async function getCachedPosts(userId: string) {
  'use cache'
  return await db.post.findMany({ where: { userId } })
}

// cacheTag / cacheLife로 세밀한 제어
import { cacheTag, cacheLife } from 'next/cache'

async function getPost(id: string) {
  'use cache'
  cacheTag('posts', `post-${id}`)
  cacheLife('hours') // 1시간 TTL
  return await db.post.findUnique({ where: { id } })
}
```

---

## Next.js 15 주요 변경사항

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

---

## 캐싱 4계층 구조

```
요청 → Request Memoization  (렌더링 사이클 내 중복 제거)
      → Data Cache           (fetch 결과, 영구 캐시)
      → Full Route Cache     (정적 라우트 HTML/RSC)
      → Router Cache         (클라이언트 탐색 캐시)
```

| 캐시 계층 | 저장 위치 | 지속 기간 | 무효화 방법 |
|-----------|-----------|-----------|------------|
| Request Memo | 서버 메모리 | 요청 1회 | 자동 |
| Data Cache | 서버 파일시스템 | 영구 | revalidateTag/Path |
| Full Route | 서버 파일시스템 | 영구 (정적) | 재배포/revalidate |
| Router Cache | 브라우저 메모리 | 세션 | router.refresh() |

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

> **주의:** `proxy.ts`는 Node.js 런타임 전용으로 **Edge 런타임을 지원하지 않는다**. Edge 런타임이 필요한 경우 deprecated된 `middleware.ts`를 유지해야 한다.

**middleware.ts → proxy.ts 마이그레이션 (codemod 사용 가능):**
```bash
npx @next/codemod@latest upgrade
```

---

## Next.js 16 주요 변경사항

> 소스: https://nextjs.org/blog/next-16 | https://nextjs.org/docs/app/guides/upgrading/version-16

### Breaking Changes 요약

| 항목 | 이전 (15) | 이후 (16) |
|------|-----------|-----------|
| Node.js 최소 버전 | 18.18.0 | **20.9.0** |
| 기본 번들러 | Webpack (prod) / Turbopack (dev) | **Turbopack (dev + prod 모두 기본)** |
| middleware.ts | 지원 | ⚠️ deprecated → proxy.ts로 교체 |
| async params/searchParams | 필수 (v15에서 도입) | 동일 유지 |

### Turbopack 완전 안정화 (기본값)

```bash
# Next.js 16에서 Turbopack이 dev/build 모두 기본값
next dev    # Turbopack으로 실행
next build  # Turbopack으로 빌드

# Webpack으로 되돌리려면
next build --webpack
```

**커스텀 Webpack 설정이 있는 경우:**
```javascript
// next.config.js — Webpack 설정이 있으면 build 시 --webpack 필요
const nextConfig = {
  webpack: (config) => {
    // 커스텀 설정...
    return config
  }
}
// → next build --webpack 으로 실행해야 함
```

### AGENTS.md 자동 생성 (AI 에이전트 지원) — v16.2

Next.js **16.2** `create-next-app`에서 도입. 루트에 `AGENTS.md` 파일이 자동 생성되어 Claude Code 등 AI 에이전트가 코드 작성 전 `node_modules/next/dist/docs/`의 번들된 Next.js 문서를 먼저 읽도록 안내합니다.

### Next.js DevTools MCP — v16.2

AI 에이전트가 개발 환경 진단, 에러 설명, 수정 제안을 수행할 수 있는 MCP 서버. **자동 시작되지 않으며** MCP 클라이언트 설정 파일에 수동 등록이 필요합니다.

```json
{ "mcpServers": { "next-devtools": { "command": "npx", "args": ["-y", "next-devtools-mcp@latest"] } } }
```

### 성능 개선 (v16.2, 2026-03-18)

- dev 서버 시작 **~400% 빠름**
- 렌더링 **~50% 빠름** (RSC payload 역직렬화 개선)
- Server Fast Refresh (서버사이드 HMR) 도입

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

// ❌ 캐시 설정 없이 동적 데이터 페칭
const data = await fetch('/api/static-config') // cache: 'force-cache' 명시 필요

// ❌ Next.js 15+에서 동기 params
function Page({ params }: { params: { id: string } }) {
  const id = params.id // ⚠️ Promise를 await 없이 접근
}

// ❌ Next.js 16에서 middleware.ts 계속 사용
// → proxy.ts로 마이그레이션 필요 (codemod 제공)

// ❌ Next.js 16 + 커스텀 Webpack 설정 시 그냥 next build
// → next build --webpack 으로 명시 필요
```
