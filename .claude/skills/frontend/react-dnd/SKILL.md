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

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
