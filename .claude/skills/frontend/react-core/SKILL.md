---
name: react-core
description: React 18/19 핵심 패턴, 렌더링 최적화, 마이그레이션 가이드
---

# React 핵심 패턴 (18 / 19)

> 소스: https://react.dev/blog/2024/12/05/react-19 | https://react.dev/blog/2022/03/29/react-v18
> 검증일: 2026-03-27

---

## React 18 vs 19 핵심 차이

| 기능 | React 18 | React 19 |
|------|----------|----------|
| 폼 처리 | 직접 상태 관리 | Actions + useActionState |
| 낙관적 업데이트 | 수동 구현 | useOptimistic |
| ref 전달 | forwardRef 필수 | ref를 prop으로 직접 전달 |
| Promise 사용 | 불가 | use(promise) |
| 자동 메모이제이션 | 수동 (useMemo/useCallback) | React Compiler |
| 자동 배칭 | Promise/setTimeout 포함 (React 17: 이벤트 핸들러만) | 동일 |

---

## React 18 핵심 패턴

### Concurrent Features

```tsx
// useTransition: 비긴급 UI 업데이트를 후순위로 처리
const [isPending, startTransition] = useTransition()

function handleSearch(query: string) {
  setSearchQuery(query) // 즉시 반영 (긴급)
  startTransition(() => {
    setResults(filter(data, query)) // 후순위 처리
  })
}

// useDeferredValue: 느린 컴포넌트 렌더링 지연
const deferredQuery = useDeferredValue(searchQuery)
// → deferredQuery로 무거운 리스트 렌더링, searchQuery로 입력값 즉시 표시
```

**언제 사용:**
- `useTransition`: 버튼 클릭 → 목록 필터링처럼 트리거가 명확할 때
- `useDeferredValue`: 외부 값(prop, state)을 받아 지연할 때

### Automatic Batching

```tsx
// React 18: Promise/setTimeout 안에서도 배칭됨
setTimeout(() => {
  setCount(c => c + 1)
  setFlag(f => !f)
  // 리렌더링 1번만 발생 (React 17에서는 2번)
})
```

---

## React 19 핵심 패턴

### Actions (비동기 작업 통합)

```tsx
// useActionState: 폼 액션 + 상태 통합
function UpdateProfile() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: State, formData: FormData) => {
      const result = await updateProfile(formData)
      if (!result.ok) return { error: result.error }
      return { success: true }
    },
    { error: null, success: false }
  )

  return (
    <form action={formAction}>
      <input name="name" />
      <button disabled={isPending}>
        {isPending ? '저장 중...' : '저장'}
      </button>
      {state.error && <p>{state.error}</p>}
    </form>
  )
}
```

### useOptimistic (낙관적 업데이트)

```tsx
function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  )

  async function handleAdd(formData: FormData) {
    const text = formData.get('text') as string
    addOptimistic({ id: 'temp', text, done: false }) // 즉시 UI 반영
    await addTodo(text) // 서버 요청
    // 실패 시 자동으로 원래 todos로 롤백
  }

  return (
    <form action={handleAdd}>
      {optimisticTodos.map(todo => <li key={todo.id}>{todo.text}</li>)}
    </form>
  )
}
```

### ref as prop (forwardRef 제거)

```tsx
// ❌ React 18: forwardRef 필요
const Input = forwardRef<HTMLInputElement, Props>((props, ref) => (
  <input ref={ref} {...props} />
))

// ✅ React 19: ref를 prop으로 직접 전달
function Input({ ref, ...props }: Props & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />
}
```

### use() Hook

```tsx
// Suspense 경계 안에서 Promise 언래핑
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise) // Suspense가 로딩 상태 처리
  return <div>{user.name}</div>
}

// 조건부 Context 읽기 (다른 Hook과 달리 조건문 안에서 사용 가능)
function Button({ showUser }: { showUser: boolean }) {
  if (showUser) {
    const user = use(UserContext) // ✅ 조건문 안에서 허용
  }
}
```

---

## Server Component vs Client Component

### 결정 기준

| 조건 | Server Component | Client Component |
|------|-----------------|------------------|
| DB/파일시스템 접근 | ✅ | ❌ |
| 브라우저 API 사용 | ❌ | ✅ |
| 이벤트 핸들러 | ❌ | ✅ |
| useState/useEffect | ❌ | ✅ |
| 민감 정보(API 키) | ✅ | ❌ |
| 실시간 인터랙션 | ❌ | ✅ |

### 패턴: Client 경계 최소화

```tsx
// ✅ 서버에서 데이터 페칭, 클라이언트는 인터랙션만
// ServerComponent.tsx (Server)
async function Page() {
  const data = await fetchFromDB() // 서버에서만 실행
  return <InteractiveList items={data} /> // Client Component에 data 전달
}

// InteractiveList.tsx (Client)
'use client'
function InteractiveList({ items }: { items: Item[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  // ...
}
```

---

## 렌더링 최적화

### React Compiler (v1.0 안정화, 2025.10)

```tsx
// Next.js에서 활성화
// next.config.js
const nextConfig = {
  experimental: { reactCompiler: true }
}
```

**React Compiler 활성화 시:** useMemo, useCallback, memo 대부분 불필요.
**React Compiler 미사용 시:** 아래 기준으로 수동 최적화.

### memo / useMemo / useCallback 사용 기준

```tsx
// memo: props가 자주 바뀌지 않는 복잡한 컴포넌트
const ExpensiveList = memo(function ExpensiveList({ items }: Props) {
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
})

// useMemo: 비용이 큰 계산 (기준: 1ms 이상)
const sortedItems = useMemo(
  () => items.slice().sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)

// useCallback: 자식에게 콜백을 props로 전달할 때
const handleDelete = useCallback((id: string) => {
  setItems(prev => prev.filter(i => i.id !== id))
}, []) // setItems는 stable하므로 의존성 없음
```

**❌ 과도한 최적화 패턴:**
```tsx
// useMemo가 필요 없는 경우
const value = useMemo(() => count * 2, [count]) // 단순 계산은 그냥 해도 됨
const name = useMemo(() => `${first} ${last}`, [first, last]) // 문자열 연결은 불필요
```

---

## React 18→19 마이그레이션 주요 변경

| 변경 항목 | 이전 (18) | 이후 (19) |
|-----------|-----------|-----------|
| ReactDOM.render | 사용 가능 | ❌ 제거됨 |
| ReactDOM.hydrate | 사용 가능 | ❌ 제거됨 |
| defaultProps (함수) | 사용 가능 | ⚠️ 경고 |
| string ref | 사용 가능 | ❌ 제거됨 |
| propTypes | 사용 가능 | ⚠️ 경고 |

```tsx
// ❌ React 18
ReactDOM.render(<App />, document.getElementById('root'))

// ✅ React 19
createRoot(document.getElementById('root')!).render(<App />)
```
