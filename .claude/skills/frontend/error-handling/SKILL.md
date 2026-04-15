---
name: error-handling
description: React 19 Error Boundary, Suspense 조합, TanStack Query 에러 처리, 에러 유형별 전략
---

# Error Handling — React 19 에러 처리 패턴

> 소스: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary | https://react.dev/reference/react-dom/client/createRoot | https://github.com/bvaughn/react-error-boundary
> 검증일: 2026-04-01

---

## 에러 유형별 처리 전략

| 에러 유형 | 발생 위치 | 처리 방법 | Error Boundary |
|-----------|-----------|-----------|:--------------:|
| **렌더 에러** | 컴포넌트 렌더링 중 | Error Boundary | 필수 |
| **API 에러** | 데이터 페칭 | TanStack Query `error` 상태 or `throwOnError` | 선택 |
| **폼 에러** | 이벤트 핸들러, 제출 | `useState`, `useActionState` | 불필요 |

> Error Boundary는 이벤트 핸들러, 비동기 코드, SSR 에러를 잡지 못한다.

---

## Error Boundary

React 19에서도 Error Boundary는 **클래스 컴포넌트로만 직접 작성 가능**. 실제로는 `react-error-boundary` 라이브러리를 사용한다 (React 19 공식 지원: `peerDependencies: "^18.0.0 || ^19.0.0"`).

```tsx
import { ErrorBoundary } from 'react-error-boundary'

function App() {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div>
          <p>오류: {error.message}</p>
          <button onClick={resetErrorBoundary}>다시 시도</button>
        </div>
      )}
      onError={(error, info) => {
        console.error(error, info.componentStack)
      }}
    >
      <Page />
    </ErrorBoundary>
  )
}
```

### Suspense + Error Boundary 조합

```tsx
<ErrorBoundary fallback={<p>에러가 발생했습니다</p>}>
  <Suspense fallback={<p>로딩 중...</p>}>
    <AsyncComponent />
  </Suspense>
</ErrorBoundary>
```

중첩 구조 (Progressive Loading):

```tsx
<ErrorBoundary fallback={<PageError />}>
  <Suspense fallback={<PageSkeleton />}>
    <ErrorBoundary fallback={<SectionError />}>
      <Suspense fallback={<SectionSkeleton />}>
        <Section />
      </Suspense>
    </ErrorBoundary>
  </Suspense>
</ErrorBoundary>
```

---

## React 19 루트 레벨 에러 콜백

React 19에서 `createRoot`에 에러 콜백이 추가됐다. 컴포넌트 레벨이 아닌 전역 에러 모니터링용이다.

```tsx
import { createRoot } from 'react-dom/client'

const root = createRoot(container, {
  onCaughtError: (error, errorInfo) => {
    // Error Boundary가 잡은 에러
    reportToSentry(error, errorInfo.componentStack)
  },
  onUncaughtError: (error, errorInfo) => {
    // Error Boundary 없이 throw된 에러
    reportToSentry(error, errorInfo.componentStack)
  },
  onRecoverableError: (error, errorInfo) => {
    // React가 자동 복구 가능한 에러 (hydration 불일치 등)
    console.warn(error, errorInfo.componentStack)
  },
})
```

---

## TanStack Query 에러 처리

```tsx
const { data, error, isError } = useQuery({
  queryKey: ['user', id],
  queryFn: fetchUser,
})

// 인라인 처리
if (isError) return <p>에러: {error.message}</p>
```

### Error Boundary 연동

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

function App() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary }) => (
            <div>
              <p>데이터 로드 실패</p>
              <button onClick={resetErrorBoundary}>재시도</button>
            </div>
          )}
        >
          <DataComponent />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

### throwOnError 옵션

```tsx
useQuery({
  queryKey: ['critical'],
  queryFn: fetchCriticalData,
  // 치명적 에러만 Error Boundary로 위임
  throwOnError: (error) => error.status >= 500,
})
```

> `onError` 콜백은 TanStack Query v5에서 **제거됐다**. 에러 로깅은 `QueryCache`의 `onError`를 사용한다.

```tsx
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => reportToSentry(error),
  }),
})
```

---

## 폼 에러 (React 19 useActionState)

```tsx
import { useActionState } from 'react'

async function submitAction(prevState: any, formData: FormData) {
  const result = await submitForm(formData)
  if (!result.ok) {
    return { error: result.message }
  }
  return { error: null }
}

function Form() {
  const [state, action, isPending] = useActionState(submitAction, { error: null })

  return (
    <form action={action}>
      {state.error && <p>{state.error}</p>}
      <button disabled={isPending}>제출</button>
    </form>
  )
}
```
