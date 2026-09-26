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
> **SEO 관점의 상세**는 `frontend/seo-nextjs` 스킬(설치된 경우)을 참조한다.

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
