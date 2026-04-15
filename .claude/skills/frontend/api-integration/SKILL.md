---
name: api-integration
description: fetch/axios API 연동 패턴, 에러 핸들링, 로딩 상태 관리, TanStack Query 연동
---

# API Integration 패턴

> 소스: https://tanstack.com/query/latest/docs | https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
> 검증일: 2026-04-01

---

## API 클라이언트 캡슐화

API 호출 로직을 컴포넌트에서 분리하여 캡슐화한다.

```ts
// lib/api/client.ts — 공통 설정 캡슐화
class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.defaultHeaders = { 'Content-Type': 'application/json' }
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: { ...this.defaultHeaders, ...options?.headers },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new ApiError(response.status, error.message)
    }

    return response.json()
  }

  get<T>(path: string, options?: RequestInit) {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  post<T>(path: string, body: unknown, options?: RequestInit) {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  put<T>(path: string, body: unknown, options?: RequestInit) {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  delete<T>(path: string, options?: RequestInit) {
    return this.request<T>(path, { ...options, method: 'DELETE' })
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL ?? '')
```

---

## 도메인별 API 함수 분리

```ts
// lib/api/users.ts — 도메인 단위로 분리
import { apiClient } from './client'
import type { User, CreateUserInput } from '@/types'

export const usersApi = {
  getAll: () => apiClient.get<User[]>('/users'),
  getById: (id: string) => apiClient.get<User>(`/users/${id}`),
  create: (input: CreateUserInput) => apiClient.post<User>('/users', input),
  update: (id: string, input: Partial<CreateUserInput>) =>
    apiClient.put<User>(`/users/${id}`, input),
  delete: (id: string) => apiClient.delete<void>(`/users/${id}`),
}
```

---

## TanStack Query 연동 (권장)

```ts
// lib/queries/users.ts — 쿼리 키 + 쿼리 함수 캡슐화
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/lib/api/users'

// queryOptions로 타입 안전한 쿼리 정의
export const userQueries = {
  all: () => queryOptions({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  }),
  detail: (id: string) => queryOptions({
    queryKey: ['users', id],
    queryFn: () => usersApi.getById(id),
    staleTime: 5 * 60 * 1000, // 5분
  }),
}

// Mutation 훅
export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

```tsx
// 컴포넌트에서 사용
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { userQueries, useCreateUser } from '@/lib/queries/users'

// Suspense 사용 시
function UserList() {
  const { data: users } = useSuspenseQuery(userQueries.all())
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}

// 에러/로딩 직접 처리 시
function UserDetail({ id }: { id: string }) {
  const { data: user, isLoading, error } = useQuery(userQueries.detail(id))

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  return <div>{user.name}</div>
}
```

---

## 에러 핸들링 패턴

```tsx
// components/ErrorBoundary.tsx — Suspense와 함께 사용
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

function ApiErrorFallback({ error, resetErrorBoundary }: {
  error: Error
  resetErrorBoundary: () => void
}) {
  const isNotFound = error instanceof ApiError && error.status === 404
  const isUnauthorized = error instanceof ApiError && error.status === 401

  if (isUnauthorized) return <LoginPrompt />
  if (isNotFound) return <NotFound />

  return (
    <div>
      <p>오류가 발생했습니다: {error.message}</p>
      <button onClick={resetErrorBoundary}>다시 시도</button>
    </div>
  )
}

// 사용
function UsersPage() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={ApiErrorFallback}>
          <Suspense fallback={<Spinner />}>
            <UserList />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

---

## 낙관적 업데이트

```ts
export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: usersApi.delete,
    onMutate: async (deletedId) => {
      // 진행 중인 리페치 취소
      await queryClient.cancelQueries({ queryKey: ['users'] })

      // 이전 상태 스냅샷
      const previousUsers = queryClient.getQueryData<User[]>(['users'])

      // 즉시 UI 업데이트
      queryClient.setQueryData<User[]>(['users'], old =>
        old?.filter(u => u.id !== deletedId) ?? []
      )

      return { previousUsers } // context로 전달
    },
    onError: (_, __, context) => {
      // 실패 시 롤백
      queryClient.setQueryData(['users'], context?.previousUsers)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

---

## Next.js Server Component에서 직접 페칭

```tsx
// app/users/page.tsx — 서버에서 직접 페칭 (TanStack Query 불필요)
async function UsersPage() {
  const users = await usersApi.getAll()
  return <UserList users={users} />
}

// fetch 직접 사용 시 (Server Component — 절대 URL 필요)
// Next.js 15+: 기본값 no-store. 캐싱은 명시 필요
const res = await fetch('https://api.example.com/users', {
  next: { revalidate: 60 },  // 60초마다 재검증 (ISR)
})
const users = await res.json()

const res2 = await fetch('https://api.example.com/users', {
  cache: 'no-store',  // 항상 최신 (Next.js 15+ 기본값)
})
const dynamic = await res2.json()
```
