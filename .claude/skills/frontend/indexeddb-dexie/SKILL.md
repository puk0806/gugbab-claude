---
name: indexeddb-dexie
description: Dexie.js 4.x 기반 IndexedDB 사용 패턴. db.version().stores() 스키마 정의, 인덱스 표기법(++id·복합 [a+b]·*tags multi-entry), .upgrade() 마이그레이션, 트랜잭션, where()·orderBy()·limit() 쿼리, dexie-react-hooks의 useLiveQuery, IndexedDB 차단 환경(시크릿 모드/Storage 권한 거부) 감지 + 폴백, PWA 오프라인 영속화
---

# indexeddb-dexie — Dexie 4.x로 IndexedDB 다루기

> 소스: Dexie.js 공식 문서 — https://dexie.org/
> 검증일: 2026-05-07

> Dexie 버전: 4.4.x (2026-05 기준 안정. dexie-react-hooks 4.2.0)
> 제공: Minimalistic IndexedDB Wrapper. 표준 IDB API 위에 약 5KB(gzip) 추상화.

## 언제 사용하나

- PWA·오프라인 우선 앱에서 *대용량 클라이언트 데이터* 영속 저장 (LocalStorage 5~10MB 제한 초과)
- React 컴포넌트가 *DB 변경에 자동 반응*해야 (useLiveQuery)
- 네이티브 IndexedDB API의 *콜백 지옥·문법 부담*을 피하고 싶음
- 트랜잭션·복합 인덱스·자동 마이그레이션을 *async/await*으로

## 언제 사용하지 않나

- 데이터가 *작고*(< 5MB) 단순 → LocalStorage / sessionStorage 충분
- *서버 동기화 필요*하고 충돌 처리 핵심 → Dexie Cloud(별도 유료) 또는 PouchDB·RxDB 검토
- *암호화* 본질적 요구 → IndexedDB는 평문 저장 (필요 시 application-level encryption)

## 설치

```bash
pnpm add dexie dexie-react-hooks
# 또는
npm install dexie dexie-react-hooks
```

## 기본 스키마 정의

```typescript
// db.ts
import Dexie, { Table } from 'dexie'

export interface Card {
  id?: number       // ++id 자동 증가
  level: number
  nextDue: Date
  text: string
  tags?: string[]
}

export interface ReviewLog {
  id?: number
  cardId: number
  rating: number
  reviewedAt: Date
}

export class AppDatabase extends Dexie {
  cards!: Table<Card, number>
  reviewLogs!: Table<ReviewLog, number>

  constructor() {
    super('AppDatabase')
    this.version(1).stores({
      cards: '++id, level, nextDue, [level+nextDue], *tags',
      reviewLogs: '++id, cardId, reviewedAt',
    })
  }
}

export const db = new AppDatabase()
```

### 인덱스 표기법

| 표기 | 의미 |
|------|------|
| `++id` | auto-increment primary key |
| `&email` | unique index |
| `name` | 단일 인덱스 |
| `[level+nextDue]` | 복합(compound) 인덱스 — `where('[level+nextDue]')`로 쿼리 |
| `*tags` | multi-entry 인덱스 (배열 내 각 값 인덱싱) |
| `&[a+b]` | unique 복합 인덱스 |

복합 인덱스는 *왼쪽 우선* 정렬: `[level+nextDue]`는 level로 1차 정렬, 같은 level 안에서 nextDue 정렬.

## 마이그레이션 (.upgrade)

스키마 변경 시 *version 번호를 증가*하고 `.upgrade()`에 데이터 변환 로직.

```typescript
this.version(1).stores({
  cards: '++id, level, nextDue',
})

this.version(2).stores({
  cards: '++id, level, nextDue, [level+nextDue], *tags', // 복합 인덱스 + multi-entry 추가
}).upgrade((trans) => {
  // 기존 데이터에 tags 필드 default 부여
  return trans.table('cards').toCollection().modify((card) => {
    if (!card.tags) card.tags = []
  })
})

// version 3에서 reviewLogs 추가
this.version(3).stores({
  cards: '++id, level, nextDue, [level+nextDue], *tags',
  reviewLogs: '++id, cardId, reviewedAt',
})
```

**주의**: `.stores()` 호출은 *전체 스키마 재선언*이 아니라 *해당 버전에서의 정의*다. 이전 버전과 다른 부분만 적으면 *제거*로 간주된다. 가능하면 모든 테이블을 매 버전에 다 적는 것이 안전.

## 기본 CRUD

```typescript
// Create
const id = await db.cards.add({
  level: 1,
  nextDue: new Date(),
  text: 'apple',
  tags: ['fruit', 'beginner'],
})

// Read
const card = await db.cards.get(id)
const allCards = await db.cards.toArray()
const dueCards = await db.cards.where('nextDue').belowOrEqual(new Date()).toArray()

// Update
await db.cards.update(id, { level: 2 })

// Delete
await db.cards.delete(id)

// Bulk
await db.cards.bulkAdd([{ ... }, { ... }])
```

## 쿼리 패턴

### 1. where + 비교 연산자

```typescript
// 단일 인덱스
const due = await db.cards.where('nextDue').belowOrEqual(now).toArray()
const easy = await db.cards.where('level').above(5).toArray()
const range = await db.cards.where('level').between(2, 5, true, true).toArray()
//                                                          ^^ inclusive low, ^^ inclusive high
```

### 2. 복합 인덱스 쿼리

```typescript
// [level+nextDue] 복합 인덱스로 "level=1이면서 nextDue ≤ now" 효율 쿼리
const dueLevel1 = await db.cards
  .where('[level+nextDue]')
  .between([1, new Date(0)], [1, now], true, true)
  .toArray()

// 또는 equals (정확 매치)
const exact = await db.cards
  .where('[level+nextDue]')
  .equals([1, specificDate])
  .toArray()
```

### 3. orderBy + limit

```typescript
const top10 = await db.cards
  .orderBy('nextDue')
  .limit(10)
  .toArray()

// 역순
const newestReviews = await db.reviewLogs
  .orderBy('reviewedAt')
  .reverse()
  .limit(20)
  .toArray()
```

### 4. multi-entry (*tags) 쿼리

```typescript
// tags 배열에 'beginner'가 포함된 모든 카드
const beginners = await db.cards.where('tags').equals('beginner').toArray()

// 두 태그 중 하나 이상
const fruitOrBeginner = await db.cards
  .where('tags')
  .anyOf(['fruit', 'beginner'])
  .toArray()
```

### 5. 필터 + 인덱스 결합

```typescript
// 인덱스로 1차 좁힌 후 .filter()로 2차 필터 (인덱스 없는 필드 검색)
const longTextDue = await db.cards
  .where('nextDue')
  .belowOrEqual(now)
  .filter((c) => c.text.length > 10)
  .toArray()
```

## 트랜잭션

여러 테이블에 걸친 *원자적 작업*은 transaction으로 묶는다.

```typescript
await db.transaction('rw', db.cards, db.reviewLogs, async () => {
  const card = await db.cards.get(cardId)
  await db.cards.update(cardId, { level: card.level + 1 })
  await db.reviewLogs.add({
    cardId,
    rating: 4,
    reviewedAt: new Date(),
  })
})
//   'rw' = read-write
//   'r'  = read-only (더 빠름)
```

**모드**: `'r'`(읽기), `'rw'`(읽기·쓰기), `'rw!'`(다른 트랜잭션 대기 안 함, 위험).

**중첩 금지**: transaction 콜백 안에서 *외부 await*(다른 transaction·setTimeout 등) 호출하면 자동 abort. 콜백 내 모든 await은 *db 작업*이어야 함.

## React 통합 — useLiveQuery

```typescript
// CardList.tsx
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'

function CardList() {
  // 의존성 배열로 변경 감지
  const dueCards = useLiveQuery(
    () => db.cards
      .where('nextDue')
      .belowOrEqual(new Date())
      .toArray(),
    [] // 의존성 배열
  )

  // 로딩 상태 (최초 렌더 시 undefined)
  if (dueCards === undefined) return <div>Loading...</div>

  return (
    <ul>
      {dueCards.map((c) => <li key={c.id}>{c.text}</li>)}
    </ul>
  )
}
```

**자동 반응**:
- 다른 컴포넌트가 `db.cards.add()`를 호출하면 useLiveQuery는 자동으로 다시 실행 → 컴포넌트 re-render
- *다른 탭·worker*에서의 변경도 감지 (binary range tree 알고리즘으로 효율 갱신)

### 의존성 변수 사용

```typescript
function FilteredCards({ minLevel }: { minLevel: number }) {
  const cards = useLiveQuery(
    () => db.cards.where('level').aboveOrEqual(minLevel).toArray(),
    [minLevel] // minLevel 변경 시 재쿼리
  )
  // ...
}
```

## IndexedDB 차단 환경 감지 + 폴백

다음 환경에서 IndexedDB는 *불가용*:

1. 시크릿/사생활 모드 (Firefox·Safari는 메모리 only로 제한, 일부 브라우저는 완전 차단)
2. 사용자가 사이트 *Storage 권한* 거부
3. 디스크 공간 부족
4. 브라우저 확장이 IndexedDB 차단

```typescript
async function isIndexedDBAvailable(): Promise<boolean> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return false

  try {
    // 실제로 작은 DB 열어 보기
    const test = new Dexie('__idb_test__')
    test.version(1).stores({ test: 'id' })
    await test.open()
    await test.delete()
    return true
  } catch (err) {
    return false
  }
}

// 폴백 — 메모리 스토리지
class MemoryStorage<T> {
  private map = new Map<number, T>()
  private nextId = 1

  async add(item: T): Promise<number> {
    const id = this.nextId++
    this.map.set(id, item)
    return id
  }
  async get(id: number) {
    return this.map.get(id)
  }
  async toArray() {
    return Array.from(this.map.values())
  }
}

// 앱 초기화
const dbAvailable = await isIndexedDBAvailable()
const cardStorage = dbAvailable ? db.cards : new MemoryStorage<Card>()
// 단, 인터페이스가 다르므로 thin wrapper 필요할 수 있음
```

또는 사용자에게 *상태 안내*:

```tsx
function StorageWarning({ available }: { available: boolean }) {
  if (available) return null
  return (
    <div role="alert">
      현재 환경에서 영구 저장이 불가능합니다.
      시크릿 모드·저장공간 부족·브라우저 확장 차단 등을 확인해 주세요.
      입력하신 데이터는 페이지를 새로고침하면 사라집니다.
    </div>
  )
}
```

## PWA 오프라인 영속화

IndexedDB는 *오프라인에서도 작동*하지만, 다음 조건이 필요하다:

1. **HTTPS** (또는 localhost) — Service Worker 요건과 동일
2. **Persistent Storage 요청** — 사용자가 *브라우저 저장공간 정리*에서 자동 삭제되지 않게:

```typescript
async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const granted = await navigator.storage.persist()
    console.log(granted ? 'Storage will not be cleared automatically' : 'Storage may be cleared')
    return granted
  }
  return false
}

// 앱 첫 진입 또는 사용자 액션 후 호출
await requestPersistentStorage()
```

3. **Storage 사용량 모니터링**:

```typescript
async function getStorageEstimate() {
  if (navigator.storage && navigator.storage.estimate) {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate()
    return { usage, quota, percent: quota ? (usage / quota) * 100 : 0 }
  }
  return null
}
```

## 흔한 실수

| 실수 | 결과 |
|------|------|
| `.stores()`에서 일부 테이블 누락 | 누락 테이블이 *삭제*됨. 모든 버전에 모든 테이블 명시 |
| version 증가 시 `.upgrade()` 누락 | 기존 데이터의 새 필드가 undefined로 남음 |
| 복합 인덱스 표기를 *문자열* `'level,nextDue'`로 작성 | 단일 인덱스 두 개로 해석됨. `'[level+nextDue]'` 정확 표기 필수 |
| transaction 콜백 안에서 fetch / setTimeout / 다른 transaction 호출 | 자동 abort. 콜백 내 await은 db 작업만 |
| useLiveQuery 의존성 배열 누락 | 변수 변경에도 재쿼리 안 됨 |
| 시크릿 모드 등 IndexedDB 차단 환경에서 graceful 처리 안 함 | 첫 add() 호출에서 throw, 앱 크래시 |
| db 인스턴스를 매 컴포넌트에서 `new` | 동일 DB가 여러 connection 열림. *singleton* 패턴 권장 |
| 큰 Blob을 *직접* IndexedDB에 저장 | 성능 저하. Dexie 4.4+의 Blob Offloading 또는 별도 저장소 검토 |
| Date 객체 대신 timestamp(number)만 저장 | 인덱스 정렬은 동일하게 작동하나 사용 시 매번 변환 필요. Date 타입 권장 |

## TypeScript 타입 활용

```typescript
import Dexie, { Table } from 'dexie'

interface Card {
  id?: number  // optional — auto-increment
  level: number
  nextDue: Date
  text: string
}

class AppDatabase extends Dexie {
  cards!: Table<Card, number>
  // Table<RowType, PrimaryKeyType>

  constructor() {
    super('AppDatabase')
    this.version(1).stores({
      cards: '++id, level, nextDue',
    })
  }
}

const db = new AppDatabase()

// 타입 안전 쿼리
const cards: Card[] = await db.cards.where('level').equals(1).toArray()
```

## 호환성 / 버전 매트릭스

| 환경 | Dexie 4.x | dexie-react-hooks 4.x |
|------|-----------|----------------------|
| Chrome 60+ / Edge 79+ | ✅ | ✅ |
| Firefox 60+ | ✅ | ✅ |
| Safari 13.1+ | ✅ | ✅ |
| iOS Safari 13.4+ | ✅ | ✅ (PWA 권장) |
| Node.js (테스트) | fake-indexeddb 필요 | React 환경 외 비권장 |

## 참고

- Dexie 공식 문서: https://dexie.org/
- Dexie GitHub: https://github.com/dexie/Dexie.js
- useLiveQuery 문서: https://dexie.org/docs/dexie-react-hooks/useLiveQuery()
- Compound Index 문서: https://dexie.org/docs/Compound-Index
- React 튜토리얼: https://dexie.org/docs/Tutorial/React
- npm dexie: https://www.npmjs.com/package/dexie (4.4.x)
- npm dexie-react-hooks: https://www.npmjs.com/package/dexie-react-hooks (4.2.0)
