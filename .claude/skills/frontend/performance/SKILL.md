---
name: performance
description: React 19 + React Compiler 기준 성능 최적화 — 코드 스플리팅, 가상화, 번들 최적화
---

# Performance — React 19 성능 최적화

> 소스: https://react.dev/learn/react-compiler | https://react.dev/reference/react/lazy | https://tanstack.com/virtual/latest/docs/introduction
> 검증일: 2026-04-01

---

## React Compiler와 수동 메모이제이션

### React Compiler가 자동 처리하는 것 (수동 작성 불필요)

React Compiler v1.0(2025년 10월 안정 출시)은 빌드 타임에 자동 메모이제이션을 적용한다.

```tsx
// ❌ React 19 + Compiler 환경에서 불필요
const value = useMemo(() => compute(a, b), [a, b])
const handler = useCallback(() => doSomething(x), [x])
const MemoComp = memo(MyComponent)

// ✅ 그냥 작성하면 Compiler가 자동 처리
const value = compute(a, b)
const handler = () => doSomething(x)
function MyComponent() { ... }
```

### 여전히 수동 최적화가 필요한 케이스

| 케이스 | 이유 |
|--------|------|
| Rules of React 위반 코드 | Compiler가 감지하면 해당 컴포넌트 최적화 건너뜀 |
| `useEffect` 의존성 정밀 제어 | 의존성 안정화가 필요한 경우 `useMemo`로 직접 처리 |
| `'use no memo'` opt-out 구간 | 의도적으로 Compiler 제외한 코드 |

```tsx
// Compiler opt-out이 필요한 경우
function SpecialComponent() {
  'use no memo'
  // 이 컴포넌트는 수동 최적화
}
```

> **React Compiler는 메모이제이션(리렌더링 방지)만 담당한다. 코드 스플리팅·가상화·번들 최적화는 별개 영역이다.**

---

## 코드 스플리팅 (React.lazy + Suspense)

```tsx
import { lazy, Suspense } from 'react'

const HeavyChart = lazy(() => import('./HeavyChart'))

function Dashboard() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <HeavyChart />
    </Suspense>
  )
}
```

### Next.js에서의 코드 스플리팅

```tsx
import dynamic from 'next/dynamic'

// SSR 비활성화 (클라이언트 전용 컴포넌트)
const Chart = dynamic(() => import('./Chart'), { ssr: false })

// 로딩 상태 포함
const Modal = dynamic(() => import('./Modal'), {
  loading: () => <p>로딩 중...</p>,
})
```

---

## 가상화 (TanStack Virtual v3)

수천 개의 리스트/테이블 렌더링 시 DOM 노드 수를 줄이는 기법. React Compiler와 무관하게 필요하다.

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

function VirtualList({ items }: { items: string[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // 아이템 예상 높이(px)
  })

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  )
}
```

**라이브러리 선택 기준:**

| | TanStack Virtual v3 | react-window |
|---|---|---|
| 가변 높이 아이템 | 네이티브 지원 | 제한적 |
| 유지보수 활성도 | 활발 | 소극적 |
| 커스텀 레이아웃 | 높음 (헤드리스) | 낮음 |
| **신규 프로젝트 권장** | **✅** | 단순 고정 리스트만 |

---

## 이미지 최적화 (Next.js)

```tsx
import Image from 'next/image'

// ✅ next/image — 자동 WebP 변환, lazy loading, 크기 최적화
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // LCP 이미지에만 사용
/>
```

---

## 성능 측정

```tsx
// React DevTools Profiler API
import { Profiler } from 'react'

function onRender(
  id: string,              // Profiler id prop
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,  // 커밋에 소요된 렌더링 시간 (ms)
  baseDuration: number,    // 메모이제이션 없이 렌더링 시 예상 시간
  startTime: number,       // 렌더링 시작 타임스탬프
  commitTime: number       // 커밋 타임스탬프
) {
  console.log({ id, phase, actualDuration })
}

<Profiler id="Dashboard" onRender={onRender}>
  <Dashboard />
</Profiler>
```
