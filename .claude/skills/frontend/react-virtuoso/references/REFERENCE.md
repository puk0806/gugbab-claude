## 9. TableVirtuoso — 테이블 가상화

```tsx
import { TableVirtuoso } from 'react-virtuoso';

function VirtualTable({ users }: { users: User[] }) {
  return (
    <TableVirtuoso
      style={{ height: '500px' }}
      data={users}
      fixedHeaderContent={() => (
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
        </tr>
      )}
      itemContent={(index, user) => (
        <>
          <td>{user.name}</td>
          <td>{user.email}</td>
          <td>{user.role}</td>
        </>
      )}
    />
  );
}
```

TableVirtuoso는 실제 `<table>`, `<thead>`, `<tbody>` 태그를 사용하므로 접근성과 시맨틱이 유지된다.

---

## 10. VirtuosoGrid — 그리드 레이아웃

```tsx
import { VirtuosoGrid } from 'react-virtuoso';

function ImageGrid({ images }: { images: ImageItem[] }) {
  return (
    <VirtuosoGrid
      style={{ height: '600px' }}
      totalCount={images.length}
      overscan={200}
      listClassName="grid-list"
      itemClassName="grid-item"
      itemContent={(index) => (
        <img src={images[index].url} alt={images[index].alt} />
      )}
    />
  );
}
```

```scss
.grid-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.grid-item {
  width: calc(25% - 6px); // 4열 그리드
}
```

> 주의: VirtuosoGrid는 동적 높이를 지원하지 않는다. 모든 아이템이 동일한 크기여야 한다. 가변 높이 그리드(Masonry 레이아웃)가 필요하면 `@virtuoso.dev/masonry` 패키지를 사용한다.

---

## 11. TypeScript 제네릭 활용

```tsx
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

interface Product {
  id: string;
  name: string;
  price: number;
}

// data prop에 Product[]를 전달하면 itemContent에서 자동 타입 추론
function ProductList({ products }: { products: Product[] }) {
  const ref = useRef<VirtuosoHandle>(null);

  return (
    <Virtuoso
      ref={ref}
      data={products}
      itemContent={(index, product) => (
        // product는 Product 타입으로 자동 추론
        <div>
          <span>{product.name}</span>
          <span>{product.price.toLocaleString()}원</span>
        </div>
      )}
    />
  );
}
```

### 주요 타입

```tsx
import type {
  VirtuosoHandle,
  VirtuosoProps,
  GroupedVirtuosoHandle,
  GroupedVirtuosoProps,
  TableVirtuosoHandle,
  TableVirtuosoProps,
  VirtuosoGridHandle,
  VirtuosoGridProps,
  ListRange,
  ScrollSeekPlaceholderProps,
} from 'react-virtuoso';
```

---

## 12. 성능 최적화 (10만+ 행)

### overscan 조정

```tsx
// 기본값보다 높게 설정하면 스크롤 시 빈 공간이 줄어듦
<Virtuoso overscan={200} data={items} itemContent={...} />
```

### minOverscanItemCount — 최소 렌더링 아이템 수 (v4.17.0+)

픽셀 기반 overscan이 부족한 경우(매우 큰 아이템, 접을 수 있는 아이템 등) 뷰포트 밖에 최소 N개 아이템을 유지한다.

```tsx
<Virtuoso
  data={items}
  minOverscanItemCount={5}   // 위아래 각 5개 이상 렌더링 유지
  itemContent={(index, item) => <TallItem item={item} />}
/>

// 위아래 개별 설정도 가능
<Virtuoso
  minOverscanItemCount={{ top: 3, bottom: 8 }}
  data={items}
  itemContent={...}
/>
```

### scrollSeekConfiguration — 빠른 스크롤 시 플레이스홀더

```tsx
<Virtuoso
  data={largeData}
  scrollSeekConfiguration={{
    enter: (velocity) => Math.abs(velocity) > 500,
    exit: (velocity) => Math.abs(velocity) < 30,
  }}
  components={{
    ScrollSeekPlaceholder: ({ height }) => (
      <div style={{ height, background: '#f0f0f0' }} />
    ),
  }}
  itemContent={(index, item) => <HeavyComponent item={item} />}
/>
```

빠르게 스크롤할 때 실제 아이템 대신 가벼운 플레이스홀더를 렌더링하여 성능을 확보한다.

### increaseViewportBy

```tsx
// 뷰포트 밖에 추가로 렌더링할 픽셀 (overscan과 유사하나 양방향 세밀 제어)
<Virtuoso
  increaseViewportBy={{ top: 200, bottom: 400 }}
  data={items}
  itemContent={...}
/>
```

### 아이템 컴포넌트 메모이제이션

```tsx
const MemoizedItem = React.memo(({ item }: { item: Item }) => (
  <div className="item">{item.name}</div>
));

<Virtuoso
  data={items}
  itemContent={(index, item) => <MemoizedItem item={item} />}
/>
```

> 주의: React Compiler를 사용 중이라면 수동 React.memo는 불필요하다. Compiler가 자동으로 메모이제이션을 처리한다.

---

## 13. 라이브러리 선택 기준: react-virtuoso vs 대안

| 기준 | react-virtuoso | @tanstack/react-virtual | react-window |
|------|---------------|------------------------|--------------|
| 동적 높이 | 자동 측정 (설정 불필요) | 수동 측정 필요 (measureElement) | 미지원 (VariableSizeList 수동 설정) |
| 테이블 지원 | TableVirtuoso 내장 | 직접 구현 | 미지원 |
| 그룹 헤더 | GroupedVirtuoso 내장 | 직접 구현 | 미지원 |
| 무한 스크롤 | endReached 내장 | 직접 구현 | react-window-infinite-loader |
| API 복잡도 | 선언적, 간단 | Headless (유연하지만 코드 많음) | 간단하지만 기능 제한적 |
| 유지보수 | 활발 (4.18.5, 2026-04) | 활발 | 활발 (v2 개발 중, React 19 지원 추가) |

### 선택 가이드

- **react-virtuoso**: 동적 높이가 많거나, 테이블/그룹 헤더/무한 스크롤 등 풍부한 기능이 필요할 때. 선언적 API를 선호할 때
- **@tanstack/react-virtual**: 번들 크기가 중요하거나, 완전한 커스텀 제어가 필요할 때. Headless 접근 선호 시
- **react-window**: 1.8.11 버전으로 React 19 지원 추가됨. v2 개발 중. 레거시 프로젝트 유지보수에 사용 가능

> 주의: 이전에 react-window가 "유지보수 중단" 상태로 알려졌으나, 2024년 12월 React 19 지원 추가 및 v2 개발이 진행 중임을 확인. 신규 프로젝트에서도 사용 가능하나, react-virtuoso가 더 풍부한 기능을 제공한다.

---

## 14. 흔한 실수

### 높이 미지정

```tsx
// 잘못 — 높이 없으면 모든 아이템 렌더링 (가상화 무효)
<Virtuoso data={items} itemContent={...} />

// 올바름 — 반드시 높이 지정
<Virtuoso style={{ height: '100vh' }} data={items} itemContent={...} />

// 또는 부모 CSS로 지정
// .scroll-container { height: 100vh; }
<div className="scroll-container">
  <Virtuoso data={items} itemContent={...} />
</div>
```

### components.List에 forwardRef 누락

```tsx
// 잘못
components={{
  List: ({ children, ...props }) => <ul {...props}>{children}</ul>
}}

// 올바름
components={{
  List: React.forwardRef(({ children, ...props }, ref) => (
    <ul ref={ref} {...props}>{children}</ul>
  ))
}}
```

### endReached 중복 호출

```tsx
// 잘못 — loading 체크 없이 매번 호출
endReached={() => fetchMore()}

// 올바름 — 로딩 중이거나 더 이상 데이터 없으면 무시
endReached={() => {
  if (!loading && hasMore) fetchMore();
}}
```

### VirtuosoGrid에서 동적 높이 기대

```tsx
// 잘못 — VirtuosoGrid는 고정 크기만 지원
<VirtuosoGrid
  totalCount={100}
  itemContent={(i) => <div style={{ height: Math.random() * 200 }}>...</div>}
/>

// 올바름 — 모든 아이템 동일 크기
<VirtuosoGrid
  totalCount={100}
  itemContent={(i) => <div style={{ height: 200 }}>...</div>}
/>
```

### LogLevel 리버스 맵핑 사용 (v4.18.2 Breaking Change)

```tsx
// 잘못 — v4.18.2부터 enum 리버스 맵핑 불가
const level = LogLevel[0]; // undefined

// 올바름 — named export는 그대로 동작
import { LogLevel } from 'react-virtuoso';
LogLevel.DEBUG; // 정상 동작
```

---

## 15. window 스크롤 모드

별도의 스크롤 컨테이너 없이 브라우저 window 자체를 스크롤 영역으로 사용할 때:

```tsx
<Virtuoso
  useWindowScroll
  data={items}
  itemContent={(index, item) => <ItemRow item={item} />}
/>
```

`useWindowScroll`을 사용하면 `style={{ height }}` 지정이 불필요하다.
