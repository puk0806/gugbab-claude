## 5. useMutation + 낙관적 업데이트 전체 흐름

### 5-1. 콜백 시그니처 (v5.89.0+ 주의)

```typescript
useMutation({
  mutationFn,
  onMutate:   (variables, context) => { /* 반환값 = onMutateResult */ },
  onSuccess:  (data, variables, onMutateResult, context) => {},
  onError:    (error, variables, onMutateResult, context) => {},
  onSettled:  (data, error, variables, onMutateResult, context) => {},
})
```

> **주의:** v5.89.0에서 콜백 시그니처가 확장됐다. `onMutate`가 반환한 롤백용 값은 이제 **`onMutateResult`(3번째 인자)** 라는 이름이며,
> 마지막 `context`는 `client`·`meta`를 담은 **MutationFunctionContext**다(과거 문서의 `context`와 이름이 겹치니 혼동 주의).
> 3번째 위치가 여전히 onMutate 반환값이라 기존 3-인자 코드는 동작하지만, **네이밍은 새 규약을 따른다.**
> 5.89.0 미만을 쓰는 프로젝트라면 `(err, variables, context)` 3-인자 형태가 맞다.

### 5-2. 캐시 롤백 방식 (여러 화면이 같은 데이터를 보여줄 때)

```typescript
export function useUpdateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTodo,

    // 1) 낙관적 반영 + 스냅샷
    onMutate: async (newTodo) => {
      // 진행 중인 refetch가 낙관값을 덮어쓰지 않도록 먼저 취소
      await queryClient.cancelQueries({ queryKey: todoKeys.detail(newTodo.id) })

      const previous = queryClient.getQueryData(todoKeys.detail(newTodo.id))

      // 반드시 불변 갱신
      queryClient.setQueryData(todoKeys.detail(newTodo.id), (old) => ({ ...old, ...newTodo }))

      return { previous }        // → onMutateResult
    },

    // 2) 실패 시 스냅샷으로 롤백
    onError: (_err, newTodo, onMutateResult) => {
      queryClient.setQueryData(todoKeys.detail(newTodo.id), onMutateResult?.previous)
    },

    // 3) 성공/실패 무관하게 서버 진실로 재동기화
    onSettled: (_data, _err, newTodo) => {
      queryClient.invalidateQueries({ queryKey: todoKeys.detail(newTodo.id) })
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() })
    },
  })
}
```

체크포인트:
- `cancelQueries` 없이 낙관적 업데이트를 하면, 뮤테이션 직전에 시작된 refetch 응답이 낙관값을 되돌려 **깜빡임/되감김**이 생긴다.
- 롤백 스냅샷은 반드시 `onMutate` 안에서 `getQueryData`로 뜬다(외부 변수 캡처 금지 — 동시 뮤테이션에서 꼬인다).
- `setQueryData`는 **불변 갱신**이어야 한다. `old.push(...)` 금지.
- 최종 정합성은 `onSettled`의 invalidate가 책임진다. 낙관값이 서버 결과와 달라도 여기서 수렴한다.

### 5-3. UI 변수 방식 (한 곳에만 보이면 이게 더 간단하다)

캐시를 건드리지 않고 `mutation.variables` + `isPending`으로 임시 항목을 그리는 방법. 롤백 코드가 필요 없다.

```typescript
const addTodo = useMutation({
  mutationFn: createTodo,
  onSettled: () => queryClient.invalidateQueries({ queryKey: todoKeys.lists() }),
})

{addTodo.isPending && <TodoRow todo={addTodo.variables} style={{ opacity: 0.5 }} />}
{addTodo.isError && <RetryRow onRetry={() => addTodo.mutate(addTodo.variables)} />}
```

> 선택 기준: **한 화면에서만 반영되면 variables 방식**, **여러 화면·목록이 같은 데이터를 동시에 보여주면 캐시 방식**.
> 다른 컴포넌트에서 진행 상태를 읽어야 하면 `mutationKey` + `useMutationState`를 쓴다.

### 5-4. mutate vs mutateAsync

- 기본은 `mutate` — 에러가 unhandled rejection이 되지 않는다.
- `mutateAsync`는 Promise를 반환하지만 **직접 try/catch 하지 않으면 unhandled rejection**이다. 순차 실행이 꼭 필요할 때만 쓴다.
- 같은 리소스에 대한 뮤테이션 직렬화가 필요하면 `scope: { id: 'todo' }`를 쓴다.
- 훅 레벨 콜백이 먼저, `mutate(vars, { onSuccess })`의 콜백이 나중에 실행된다.

---

## 11. 흔한 실수

### ❌ useEffect로 수동 fetch 후 setState

```typescript
// ❌ 중복 요청·경쟁 조건·캐시 없음·취소 없음·에러/로딩 수동 관리
useEffect(() => {
  let alive = true
  setLoading(true)
  fetch(`/api/todos/${id}`).then(r => r.json()).then(d => alive && setTodo(d))
  return () => { alive = false }
}, [id])

// ✅
const { data, isPending, isError } = useQuery(todoDetailQuery(id))
```
StrictMode 이중 실행, 응답 순서 역전(늦게 온 옛 응답이 최신 값을 덮어씀), 화면 복귀 시 갱신 없음 — 전부 Query가 해결하는 문제다.

### ❌ queryKey에 불안정한 값 넣기

```typescript
// ❌ 렌더마다 값이 달라지는 것 → 매 렌더 새 캐시 엔트리 + 무한 요청
useQuery({ queryKey: ['todos', new Date()], queryFn: fetchTodos })
useQuery({ queryKey: ['todos', () => filterFn], queryFn: fetchTodos })  // 함수는 직렬화 불가

// ✅ 안정적인 원시값 / 직렬화 가능한 객체만
useQuery({ queryKey: ['todos', { status, page }], queryFn: () => fetchTodos({ status, page }) })
```
> 정정: **인라인 객체 리터럴 자체는 문제가 아니다.** 키는 결정적으로 해싱되며 프로퍼티 순서도 무관하다.
> 진짜 문제는 ① 렌더마다 **내용이 달라지는 값**(`new Date()`, `Math.random()`, 매번 순서가 바뀌는 배열),
> ② **직렬화 불가능한 값**(함수, 클래스 인스턴스, `Map`/`Set`),
> ③ 반대로 **queryFn이 쓰는 변수를 키에서 누락**해 필터를 바꿔도 캐시가 그대로인 경우다.

### ❌ 서버 데이터를 전역 상태 라이브러리에 복사

```typescript
// ❌ Query로 받아서 Zustand/Redux에 다시 저장 → 진실의 원천 2개, 동기화 지옥
const { data } = useQuery(todoListQuery(f))
useEffect(() => { setTodos(data) }, [data])

// ✅ 캐시가 곧 스토어다. 필요한 컴포넌트에서 같은 키로 useQuery를 다시 호출한다(중복 요청 안 남)
const { data } = useQuery(todoListQuery(f))

// ✅ 파생값이 필요하면 select
const doneCount = useQuery({ ...todoListQuery(f), select: (d) => d.filter(t => t.done).length })

// ✅ 전역 스토어에는 "선택된 id" 같은 클라이언트 상태만 둔다 (→ frontend/state-management)
```

### ❌ 기타

| 실수 | 결과 | 수정 |
|------|------|------|
| `staleTime`은 두고 `gcTime`만 늘림 | 요청 수 그대로 | `staleTime`을 올린다 |
| `enabled` 없이 id가 undefined인 채 호출 | `/api/todos/undefined` 요청 | `enabled: !!id` 또는 `skipToken` |
| queryFn에서 `res.ok` 확인 안 함 | 404 응답이 "성공"으로 캐시됨 | 상태 확인 후 throw |
| `onMutate`에서 `cancelQueries` 생략 | 낙관값 되감김 | 스냅샷 전에 `cancelQueries` |
| 뮤테이션 후 `setQueryData`만 하고 invalidate 없음 | 서버 파생 필드(updatedAt 등) 불일치 | `onSettled`에서 invalidate |
| 인증 401에도 3회 재시도 | 로그인 지연·서버 부하 | `retry: (n, e) => e.status >= 500 && n < 2` |
| 모듈 최상위 `new QueryClient()` (SSR) | 요청 간 캐시 공유 = 데이터 유출 | `getQueryClient()` 분기 |
| `useSuspenseQuery`에 `enabled` 사용 | 지원 안 됨 | `useQuery`로 전환 |
