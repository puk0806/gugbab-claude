---
name: design-patterns
description: React 기반 프론트엔드 디자인 패턴 — Compound Component, Custom Hook, 외부 스토어 구독, API 캡슐화
---

# Design Patterns — React 프론트엔드 패턴

> 소스: https://react.dev/reference/react/createContext | https://react.dev/learn/reusing-logic-with-custom-hooks | https://react.dev/reference/react/useSyncExternalStore
> 검증일: 2026-04-01
> 주의: GoF 패턴 명칭(Facade, Strategy 등)은 React 공식 문서에 등장하지 않음. 기술 구현은 유효하나 명칭은 커뮤니티 관습이다.

---

## Compound Component 패턴

관련 컴포넌트들이 암묵적 상태를 공유하는 패턴. `createContext` + `useContext`로 구현한다.

```tsx
import { createContext, useContext, useState } from 'react'

// React 19: <Context value={...}> 직접 사용 가능 (.Provider 불필요)
const AccordionContext = createContext<{
  openId: string | null
  toggle: (id: string) => void
} | null>(null)

function Accordion({ children }: { children: React.ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const toggle = (id: string) => setOpenId(prev => prev === id ? null : id)

  return (
    <AccordionContext value={{ openId, toggle }}>
      <div>{children}</div>
    </AccordionContext>
  )
}

function AccordionItem({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const ctx = useContext(AccordionContext)
  if (!ctx) throw new Error('AccordionItem은 Accordion 내부에서 사용해야 합니다')

  return (
    <div>
      <button onClick={() => ctx.toggle(id)}>{title}</button>
      {ctx.openId === id && <div>{children}</div>}
    </div>
  )
}

// 사용
<Accordion>
  <AccordionItem id="1" title="항목 1">내용 1</AccordionItem>
  <AccordionItem id="2" title="항목 2">내용 2</AccordionItem>
</Accordion>
```

---

## Custom Hook (Render Props 대체)

React 공식 문서는 로직 재사용에 Custom Hook을 권장한다. Render Props 패턴은 deprecated 표기는 없으나 Custom Hook으로 대체하는 것이 현대 React의 방향이다.

```tsx
// ❌ Render Props — 중첩이 깊어지고 타입 추론이 불편함
function MouseTracker({ render }: { render: (pos: { x: number; y: number }) => React.ReactNode }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  return <div onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}>{render(pos)}</div>
}

// ✅ Custom Hook — 로직과 UI 분리, 조합 자유로움
function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])
  return pos
}

function Component() {
  const pos = useMousePosition()
  return <p>{pos.x}, {pos.y}</p>
}
```

---

## 외부 스토어 구독 (Observer 패턴)

React 공식 문서는 외부 스토어 구독의 표준 방법으로 `useSyncExternalStore`를 명시한다. Zustand는 내부적으로 이 Hook을 사용한다.

```tsx
import { useSyncExternalStore } from 'react'

// 직접 구현 (라이브러리 없이)
function createStore<T>(initialState: T) {
  let state = initialState
  const listeners = new Set<() => void>()

  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    setState: (newState: T) => {
      state = newState
      listeners.forEach(l => l())
    },
  }
}

const store = createStore({ count: 0 })

function Counter() {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot)
  return (
    <button onClick={() => store.setState({ count: state.count + 1 })}>
      {state.count}
    </button>
  )
}
```

**Zustand를 쓰면** 위 패턴이 자동 적용된다:

```tsx
import { create } from 'zustand'

const useStore = create<{ count: number; increment: () => void }>(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
}))
```

---

## API 클라이언트 캡슐화 (Facade)

컴포넌트가 HTTP 세부사항을 알지 못하도록 API 레이어를 분리한다. "Facade 패턴"은 React 공식 문서 명칭이 아니지만 실질적으로 Next.js가 권장하는 방식이다.

```tsx
// lib/api/user.ts — API 클라이언트 캡슐화
export const userApi = {
  getUser: async (id: string): Promise<User> => {
    const res = await fetch(`/api/users/${id}`)
    if (!res.ok) throw new Error('사용자 조회 실패')
    return res.json()
  },
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('사용자 수정 실패')
    return res.json()
  },
}

// 컴포넌트는 API 세부사항을 모름
const { data } = useQuery({
  queryKey: ['user', id],
  queryFn: () => userApi.getUser(id),
})
```

---

## 전략 주입 (Strategy)

함수 props로 동작을 교체 가능하게 만드는 패턴. React props 문서의 기본 방식이다.

```tsx
interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  sortFn?: (a: T, b: T, key: keyof T) => number  // 정렬 전략 주입
  renderEmpty?: () => React.ReactNode            // 빈 상태 렌더 전략 주입
}

function Table<T>({ data, columns, sortFn, renderEmpty }: TableProps<T>) {
  const sorted = sortFn
    ? [...data].sort((a, b) => sortFn(a, b, columns[0].key))
    : data

  if (sorted.length === 0) {
    return renderEmpty ? renderEmpty() : <p>데이터 없음</p>
  }

  return (
    <table>
      {sorted.map((row, i) => (
        <tr key={i}>
          {columns.map(col => <td key={String(col.key)}>{String(row[col.key])}</td>)}
        </tr>
      ))}
    </table>
  )
}
```
