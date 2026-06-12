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
