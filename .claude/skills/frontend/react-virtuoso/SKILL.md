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

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
