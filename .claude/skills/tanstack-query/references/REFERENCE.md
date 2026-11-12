## 5. useMutation + 낙관적 업데이트 전체 흐름

### 5-1. 콜백 시그니처 (v5.89.0+)

→ SKILL.md 5절(`onMutateResult`·MutationFunctionContext)을 본다.

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

> queryKey 불안정 값·서버 데이터를 전역 스토어에 복사하지 말 것 등 기본 원칙은 SKILL.md 2절 참조.

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
