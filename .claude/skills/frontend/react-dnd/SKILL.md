---
name: react-dnd
description: react-dnd 드래그 앤 드롭 — DndProvider, useDrag/useDrop 훅, TypeScript 타입, 리스트 순서 변경, 커스텀 프리뷰, 중첩 드롭, SSR 주의사항
---

# react-dnd 드래그 앤 드롭

> 소스: https://react-dnd.github.io/react-dnd/docs/overview
> 소스: https://github.com/react-dnd/react-dnd
> 검증일: 2026-04-20

---

## 설치 및 기본 설정

```bash
npm install react-dnd react-dnd-html5-backend
# 터치 지원이 필요하면:
npm install react-dnd-touch-backend
```

### DndProvider 설정

```tsx
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <MyDragDropContent />
    </DndProvider>
  );
}
```

- DndProvider는 앱 루트에 한 번만 감싼다
- 중첩 DndProvider는 에러를 발생시킨다
- backend prop에 HTML5Backend 또는 TouchBackend를 전달한다

---

## 드래그 아이템 타입 정의 (TypeScript)

```tsx
// 아이템 타입 상수 정의
const ItemTypes = {
  CARD: 'card',
  COLUMN: 'column',
} as const;

// 드래그 아이템 인터페이스
interface DragItem {
  type: string;
  id: string;
  index: number;
}
```

---

## useDrag 훅

```tsx
import { useDrag } from 'react-dnd';

function DraggableCard({ id, text, index }: CardProps) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        // 드롭 완료 후 처리
      }
    },
  }), [id, index]);

  return (
    <div ref={dragRef} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {text}
    </div>
  );
}
```

### useDrag spec 주요 옵션

| 옵션 | 타입 | 설명 |
|------|------|------|
| `type` | `string` | 필수. 드래그 아이템 유형 식별자 |
| `item` | `object \| () => object` | 드래그 데이터. 함수면 드래그 시작 시 호출 |
| `collect` | `(monitor) => object` | monitor 상태를 컴포넌트 props로 매핑 |
| `end` | `(item, monitor) => void` | 드래그 종료 콜백 |
| `canDrag` | `(monitor) => boolean` | 드래그 가능 여부 제어 |
| `isDragging` | `(monitor) => boolean` | 커스텀 isDragging 판별 로직 |

### useDrag 반환값

```tsx
const [collectedProps, dragRef, previewRef] = useDrag(spec, deps);
// collectedProps: collect 함수 반환값
// dragRef: 드래그 소스 엘리먼트에 연결
// previewRef: 드래그 미리보기 엘리먼트에 연결 (선택)
```

---

## useDrop 훅

```tsx
import { useDrop } from 'react-dnd';

function DropZone({ onDrop }: DropZoneProps) {
  const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item: DragItem) => {
      onDrop(item.id);
      return { name: 'DropZone' }; // end()의 getDropResult()로 전달
    },
    canDrop: (item: DragItem) => {
      return item.id !== 'locked';
    },
    hover: (item: DragItem, monitor) => {
      // 드래그 아이템이 위에 있을 때 반복 호출
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [onDrop]);

  return (
    <div
      ref={dropRef}
      style={{
        backgroundColor: isOver && canDrop ? '#e0ffe0' : '#fff',
        border: canDrop ? '2px dashed green' : '2px dashed gray',
      }}
    >
      Drop here
    </div>
  );
}
```

### useDrop spec 주요 옵션

| 옵션 | 타입 | 설명 |
|------|------|------|
| `accept` | `string \| string[]` | 필수. 수락할 아이템 타입 |
| `drop` | `(item, monitor) => object \| void` | 드롭 시 호출. 반환값은 getDropResult() |
| `hover` | `(item, monitor) => void` | 아이템이 위에 있을 때 반복 호출 |
| `canDrop` | `(item, monitor) => boolean` | 드롭 수락 여부 |
| `collect` | `(monitor) => object` | monitor 상태 수집 |

### 수락/거부 로직

```tsx
// 여러 타입 수락
accept: [ItemTypes.CARD, ItemTypes.COLUMN],

// 조건부 드롭 거부
canDrop: (item: DragItem, monitor) => {
  // 특정 조건에서만 드롭 허용
  return item.id !== currentId && !isLocked;
},
```

---

## 리스트 아이템 순서 변경 패턴

```tsx
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

interface SortableItemProps {
  id: string;
  index: number;
  text: string;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}

function SortableItem({ id, index, text, moveItem }: SortableItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [id, index]);

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: ItemTypes.CARD,
    hover: (item: DragItem, monitor) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      // 마우스 위치 기반 절반 판별
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // 위에서 아래로: 절반 이상 넘어야 이동
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      // 아래에서 위로: 절반 이상 넘어야 이동
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex; // mutation으로 성능 최적화
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [index, moveItem]);

  // drag와 drop ref 합성
  dragRef(dropRef(ref));

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.4 : 1 }}>
      {text}
    </div>
  );
}
```

### moveItem 구현 (부모 컴포넌트)

```tsx
import { useCallback, useState } from 'react';

function SortableList() {
  const [items, setItems] = useState([
    { id: '1', text: 'Item 1' },
    { id: '2', text: 'Item 2' },
    { id: '3', text: 'Item 3' },
  ]);

  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setItems((prevItems) => {
      const next = [...prevItems];
      const [removed] = next.splice(dragIndex, 1);
      next.splice(hoverIndex, 0, removed);
      return next;
    });
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      {items.map((item, index) => (
        <SortableItem
          key={item.id}
          id={item.id}
          index={index}
          text={item.text}
          moveItem={moveItem}
        />
      ))}
    </DndProvider>
  );
}
```

---

## 드래그 미리보기(Preview) 커스터마이징

### 방법 1: previewRef 사용

```tsx
const [{ isDragging }, dragRef, previewRef] = useDrag(() => ({
  type: ItemTypes.CARD,
  item: { id },
  collect: (monitor) => ({ isDragging: monitor.isDragging() }),
}));

return (
  <>
    {/* 이 엘리먼트가 드래그 프리뷰로 표시 */}
    <div ref={previewRef}>
      <CustomPreview />
    </div>
    {/* 이 엘리먼트를 잡아서 드래그 */}
    <div ref={dragRef}>Drag Handle</div>
  </>
);
```

### 방법 2: useDragLayer로 완전 커스텀 프리뷰

```tsx
import { useDragLayer } from 'react-dnd';

function CustomDragLayer() {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!isDragging || !currentOffset) return null;

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        left: 0,
        top: 0,
        transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
        zIndex: 9999,
      }}
    >
      <div style={{ background: 'white', padding: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        Dragging: {item?.id}
      </div>
    </div>
  );
}
```

useDragLayer 사용 시 HTML5Backend 기본 프리뷰를 숨기려면:

```tsx
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useEffect } from 'react';

const [, dragRef, previewRef] = useDrag(() => ({
  type: ItemTypes.CARD,
  item: { id },
}));

useEffect(() => {
  previewRef(getEmptyImage(), { captureDraggingState: true });
}, [previewRef]);
```

---

## 중첩 드롭 영역 처리

```tsx
function OuterDropZone() {
  const [{ isOver, isOverCurrent }, dropRef] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item, monitor) => {
      // didDrop()으로 자식이 이미 처리했는지 확인
      if (monitor.didDrop()) {
        return; // 자식 드롭 영역이 이미 처리함
      }
      console.log('Outer zone handled the drop');
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),          // 자손 포함
      isOverCurrent: monitor.isOver({ shallow: true }), // 직접 위에만
    }),
  }));

  return (
    <div ref={dropRef}>
      <InnerDropZone />
    </div>
  );
}
```

- `monitor.didDrop()`: 자식 드롭 영역에서 이미 drop이 처리되었는지 확인
- `monitor.isOver({ shallow: true })`: 직접 위에 있을 때만 true (자손 제외)
- 드롭 이벤트는 가장 안쪽 → 바깥쪽 순서로 버블링

---

## TouchBackend 설정

```tsx
import { TouchBackend } from 'react-dnd-touch-backend';

// 기본 사용
<DndProvider backend={TouchBackend}>
  <App />
</DndProvider>

// 옵션 설정
<DndProvider backend={TouchBackend} options={{
  enableMouseEvents: true,       // 마우스 이벤트도 함께 처리
  delayTouchStart: 200,          // 터치 시작 딜레이 (ms)
  enableTouchEvents: true,
}}>
  <App />
</DndProvider>
```

> 주의: HTML5Backend와 TouchBackend는 동시에 사용할 수 없다. 디바이스에 따라 하나를 선택해야 한다.

### 반응형 백엔드 선택

```tsx
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

const backend = isTouchDevice() ? TouchBackend : HTML5Backend;

<DndProvider backend={backend}>
  <App />
</DndProvider>
```

---

## Next.js / SSR 환경 주의사항

HTML5Backend는 브라우저 `window` 객체를 참조하므로 서버 사이드에서 에러가 발생한다.

### 해결 방법: 동적 임포트

```tsx
// components/DndWrapper.tsx
'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { ReactNode } from 'react';

export function DndWrapper({ children }: { children: ReactNode }) {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  );
}

// page.tsx (Next.js App Router)
import dynamic from 'next/dynamic';

const DndWrapper = dynamic(
  () => import('@/components/DndWrapper').then((mod) => mod.DndWrapper),
  { ssr: false }
);

export default function Page() {
  return (
    <DndWrapper>
      <MyDragDropContent />
    </DndWrapper>
  );
}
```

> 주의: `'use client'` 디렉티브만으로는 부족하다. DndProvider가 모듈 임포트 단계에서 window를 참조하므로 `dynamic({ ssr: false })`로 완전히 클라이언트 전용으로 만들어야 한다.

---

## react-dnd vs @dnd-kit 선택 기준

| 기준 | react-dnd | @dnd-kit |
|------|-----------|----------|
| 번들 크기 | ~40KB (gzip) | ~20KB (gzip) |
| 접근성 (a11y) | 수동 구현 필요 | ARIA 내장, 키보드/스크린리더 지원 |
| 터치 지원 | 별도 백엔드 필요 | 내장 센서 |
| 리스트 정렬 | 직접 구현 | @dnd-kit/sortable 제공 |
| 복잡한 드래그 시나리오 | 강력한 모니터 시스템 | 센서 + 수정자 조합 |
| 유지보수 상태 | 업데이트 빈도 낮음 | 활발한 유지보수 |
| React 18/19 호환 | 호환 | 호환 |
| 학습 곡선 | 높음 (flux 아키텍처) | 보통 |

### 선택 가이드

- **@dnd-kit 선택**: 새 프로젝트, 접근성 중요, 리스트 정렬 위주, 터치 지원 필요
- **react-dnd 선택**: 기존 프로젝트 유지보수, 파일 드롭 (네이티브 드래그), 복잡한 다중 타입 드래그앤드롭, HTML5 네이티브 드래그 이벤트 활용

> 주의: @dnd-kit 번들 크기와 react-dnd 번들 크기 비교는 사용 패키지 조합에 따라 달라질 수 있다. 정확한 수치는 bundlephobia 등으로 직접 확인할 것.

---

## 흔한 실수

### 1. deps 배열 누락

```tsx
// 잘못: deps 누락 시 spec이 최초 값으로 고정
const [, dragRef] = useDrag(() => ({
  type: ItemTypes.CARD,
  item: { id, index },
}));

// 올바르: 변경되는 값을 deps에 포함
const [, dragRef] = useDrag(() => ({
  type: ItemTypes.CARD,
  item: { id, index },
}), [id, index]);
```

### 2. ref 합성 실패

```tsx
// 잘못: 두 ref를 별도로 연결하면 하나만 적용
<div ref={dragRef}>
  <div ref={dropRef}>...</div>
</div>

// 올바르: ref 합성
const ref = useRef<HTMLDivElement>(null);
dragRef(dropRef(ref));
<div ref={ref}>...</div>
```

### 3. DndProvider 중첩

```tsx
// 잘못: 컴포넌트마다 DndProvider 감싸기
function Card() {
  return (
    <DndProvider backend={HTML5Backend}> {/* 에러 발생 */}
      <DraggableContent />
    </DndProvider>
  );
}

// 올바르: 앱 루트에 한 번만
function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Card />
    </DndProvider>
  );
}
```

### 4. hover에서 무한 리렌더링

```tsx
// 주의: hover에서 상태를 직접 업데이트하면 성능 저하
hover: (item, monitor) => {
  // index mutation으로 불필요한 재호출 방지
  moveItem(item.index, hoverIndex);
  item.index = hoverIndex; // 이 mutation이 없으면 무한 호출
},
```

---

## 버전 정보

- react-dnd: 16.0.1 (최신 안정 버전)
- react-dnd-html5-backend: 16.0.1
- react-dnd-touch-backend: 16.0.1
- React 18/19 호환

> 주의: react-dnd의 업데이트 빈도가 낮아진 상태이다. 새 프로젝트에서는 @dnd-kit도 함께 검토할 것을 권장한다.
