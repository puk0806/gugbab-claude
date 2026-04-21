---
name: react-virtuoso
description: react-virtuoso 가상 스크롤 — Virtuoso/VirtuosoGrid/TableVirtuoso/GroupedVirtuoso 컴포넌트, 동적 높이, 무한 스크롤, 프로그래매틱 스크롤, TypeScript 제네릭
---

# react-virtuoso 가상 스크롤

> 소스: https://virtuoso.dev/react-virtuoso/
> 소스: https://github.com/petyosi/react-virtuoso
> 소스: https://virtuoso.dev/react-virtuoso/api-reference/virtuoso/
> 검증일: 2026-04-20
> 버전 기준: react-virtuoso 4.18.5

---

## 1. react-virtuoso 개요

react-virtuoso는 동적 높이 아이템을 자동 측정하는 가상 스크롤 라이브러리다. 별도의 아이템 높이 지정 없이 ResizeObserver로 DOM에서 실제 크기를 측정하므로 가변 높이 콘텐츠에 강하다.

### 핵심 특징

| 특징 | 설명 |
|------|------|
| 자동 높이 측정 | 아이템 렌더링 후 ResizeObserver로 실제 크기 측정, itemSize prop 불필요 |
| 5가지 컴포넌트 | Virtuoso, VirtuosoGrid, TableVirtuoso, GroupedVirtuoso, GroupedTableVirtuoso |
| 무한 스크롤 내장 | endReached 콜백으로 추가 데이터 로드 |
| SSR 지원 | initialItemCount로 서버 사이드 렌더링 대응 |
| TypeScript 제네릭 | 아이템 타입을 제네릭으로 전달 가능 (96.6% TypeScript 코드베이스) |

**설치**

```bash
npm install react-virtuoso
```

---

## 2. 컴포넌트 선택 기준

| 컴포넌트 | 사용 시점 |
|----------|----------|
| `Virtuoso` | 단일 열 리스트, 가변 높이 아이템 |
| `VirtuosoGrid` | 그리드 레이아웃 (CSS Grid/Flexbox), 동일 크기 아이템 |
| `TableVirtuoso` | HTML `<table>` 기반 테이블, thead 고정 필요 시 |
| `GroupedVirtuoso` | 그룹 헤더가 상단에 고정(sticky)되는 리스트 |
| `GroupedTableVirtuoso` | 그룹 헤더 + 테이블 구조가 모두 필요할 때 |

> 주의: VirtuosoGrid는 동일 크기 아이템만 지원한다. 가변 높이 그리드가 필요하면 별도 패키지 `@virtuoso.dev/masonry`를 사용한다.

---

## 3. 기본 리스트 가상화

```tsx
import { Virtuoso } from 'react-virtuoso';

interface User {
  id: number;
  name: string;
}

function UserList({ users }: { users: User[] }) {
  return (
    <Virtuoso
      style={{ height: '600px' }}
      data={users}
      itemContent={(index, user) => (
        <div className="user-item">
          {user.name}
        </div>
      )}
    />
  );
}
```

### 필수 설정

- **높이 지정**: 부모 컨테이너 또는 Virtuoso의 `style`에 height 필수. 높이 없으면 아이템이 모두 렌더링됨
- **data prop**: 배열 데이터를 전달. 또는 `totalCount` + `itemContent`로 인덱스 기반 렌더링

### data prop vs totalCount

```tsx
// 방법 1: data prop (권장 — 타입 안전)
<Virtuoso
  data={items}
  itemContent={(index, item) => <div>{item.name}</div>}
/>

// 방법 2: totalCount (데이터를 외부에서 관리할 때)
<Virtuoso
  totalCount={items.length}
  itemContent={(index) => <div>{items[index].name}</div>}
/>
```

---

## 4. 동적 높이 아이템 처리

react-virtuoso는 **아이템 높이를 자동 측정**한다. ResizeObserver를 사용해 각 아이템의 실제 DOM 크기를 추적하므로, 이미지 로딩이나 텍스트 확장으로 높이가 변해도 자동 대응된다.

```tsx
// 별도 설정 불필요 — 아이템 높이가 제각각이어도 자동 처리
<Virtuoso
  data={messages}
  itemContent={(index, message) => (
    <div className="message">
      <p>{message.text}</p>
      {message.image && <img src={message.image} alt="" />}
    </div>
  )}
/>
```

### 성능 힌트: fixedItemHeight

모든 아이템의 높이가 동일하다면 `fixedItemHeight`로 측정을 건너뛸 수 있다.

```tsx
<Virtuoso
  data={items}
  fixedItemHeight={48}
  itemContent={(index, item) => <div style={{ height: 48 }}>{item.name}</div>}
/>
```

### defaultItemHeight — 초기 프로브 렌더링 스킵

기본적으로 첫 번째 아이템을 렌더링해 기본 높이를 측정한다. 이 "probe" 렌더링을 건너뛰려면 `defaultItemHeight`를 설정한다.

```tsx
<Virtuoso
  data={items}
  defaultItemHeight={56}
  itemContent={(index, item) => <ItemRow item={item} />}
/>
```

### heightEstimates — 아이템별 높이 추정값 (v4.16.0+)

아이템별 높이를 미리 알고 있을 때 초기 스크롤바 정확도를 높인다. 실제 측정값으로 점차 대체된다.

```tsx
<Virtuoso
  totalCount={100}
  heightEstimates={[40, 200, 60, 2000, 40 /* 모든 아이템 수만큼 */]}
  itemContent={(index) => <Item index={index} />}
/>
```

---

## 5. 무한 스크롤 (endReached)

```tsx
function InfiniteList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const newItems = await fetchItems(items.length, 20);
    setItems((prev) => [...prev, ...newItems]);
    setLoading(false);
  }, [items.length, loading]);

  return (
    <Virtuoso
      style={{ height: '100vh' }}
      data={items}
      endReached={loadMore}
      overscan={200}
      itemContent={(index, item) => <ItemRow item={item} />}
      components={{
        Footer: () => loading ? <div>Loading...</div> : null,
      }}
    />
  );
}
```

### TanStack Query 연동

```tsx
function InfiniteQueryList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['items'],
    queryFn: ({ pageParam = 0 }) => fetchItems(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Virtuoso
      style={{ height: '100vh' }}
      data={allItems}
      endReached={() => {
        if (hasNextPage) fetchNextPage();
      }}
      itemContent={(index, item) => <ItemRow item={item} />}
      components={{
        Footer: () =>
          isFetchingNextPage ? <div>Loading more...</div> : null,
      }}
    />
  );
}
```

---

## 6. 고정 컴포넌트 (Header, Footer, Sticky)

### Header / Footer

```tsx
<Virtuoso
  data={items}
  components={{
    Header: () => <div className="list-header">Items List</div>,
    Footer: () => <div className="list-footer">End of list</div>,
  }}
  itemContent={(index, item) => <ItemRow item={item} />}
/>
```

### 커스텀 스크롤 컨테이너 / 아이템 래퍼

```tsx
<Virtuoso
  data={items}
  components={{
    List: React.forwardRef(({ style, children, ...props }, ref) => (
      <div ref={ref} style={style} {...props} className="custom-list">
        {children}
      </div>
    )),
    Item: ({ children, ...props }) => (
      <div {...props} className="custom-item">
        {children}
      </div>
    ),
  }}
  itemContent={(index, item) => <span>{item.name}</span>}
/>
```

> 주의: components의 List는 반드시 `React.forwardRef`로 감싸야 한다. ref가 전달되지 않으면 스크롤이 동작하지 않는다.

---

## 7. 프로그래매틱 스크롤

### initialTopMostItemIndex — 초기 위치

```tsx
// 마지막 아이템부터 표시 (채팅 UI)
<Virtuoso
  data={messages}
  initialTopMostItemIndex={messages.length - 1}
  itemContent={(index, msg) => <Message msg={msg} />}
/>
```

### scrollToIndex — 특정 위치로 이동

```tsx
function ScrollableList({ items }: { items: Item[] }) {
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const scrollToTop = () => {
    virtuosoRef.current?.scrollToIndex({
      index: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    virtuosoRef.current?.scrollToIndex({
      index: items.length - 1,
      behavior: 'smooth',
      align: 'end',
    });
  };

  return (
    <>
      <button onClick={scrollToTop}>Top</button>
      <button onClick={scrollToBottom}>Bottom</button>
      <Virtuoso
        ref={virtuosoRef}
        data={items}
        itemContent={(index, item) => <ItemRow item={item} />}
      />
    </>
  );
}
```

### scrollToIndex align 옵션

| 값 | 동작 |
|----|------|
| `'start'` | 아이템을 뷰포트 상단에 정렬 |
| `'center'` | 뷰포트 중앙에 정렬 |
| `'end'` | 뷰포트 하단에 정렬 |

### followOutput — 채팅 자동 스크롤

```tsx
<Virtuoso
  data={messages}
  followOutput="smooth"
  initialTopMostItemIndex={messages.length - 1}
  itemContent={(index, msg) => <Message msg={msg} />}
/>
```

`followOutput`이 `true` 또는 `'smooth'`이면 데이터 추가 시 자동으로 최하단 스크롤된다.

---

## 8. GroupedVirtuoso — 그룹 헤더 고정

```tsx
import { GroupedVirtuoso } from 'react-virtuoso';

interface GroupedData {
  groups: string[];
  groupCounts: number[];
  items: Item[];
}

function GroupedList({ data }: { data: GroupedData }) {
  return (
    <GroupedVirtuoso
      style={{ height: '600px' }}
      groupCounts={data.groupCounts}
      groupContent={(index) => (
        <div className="group-header">
          {data.groups[index]}
        </div>
      )}
      itemContent={(index) => (
        <div className="group-item">
          {data.items[index].name}
        </div>
      )}
    />
  );
}
```

### 핵심 props

| prop | 설명 |
|------|------|
| `groupCounts` | 각 그룹의 아이템 수 배열. `[3, 5, 2]` → 3개 그룹 |
| `groupContent` | 그룹 헤더 렌더링 함수 |
| `itemContent` | 플랫 인덱스 기반 아이템 렌더링 함수 |

그룹 헤더는 기본적으로 sticky 위치를 가진다. CSS로 `position: sticky; top: 0;`이 자동 적용됨.

### v4.15.0+ 고정 크기 그룹 지원

`fixedItemHeight`를 GroupedVirtuoso에서도 사용할 수 있다. 그룹 헤더와 아이템 크기가 일정하면 성능이 향상된다.

---

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
