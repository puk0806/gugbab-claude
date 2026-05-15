---
name: dream-journal-data-modeling
description: 꿈 일기 PWA를 위한 데이터 모델 설계 스킬. Dream·Interpretation·Symbol·Tag 엔티티 정의, Dexie 스키마(`++id`·`&unique`·`*multi-entry`·`[a+b] compound`), `.upgrade()` 마이그레이션, 최근 N일·태그·키워드 쿼리 패턴(IndexedDB 한계 → Fuse.js/MiniSearch 결합), Blob 첨부와 외부 스토리지 비교, 통계 모델(빈도·월별·감정 분포), 백엔드 동기화(LWW·CRDT) 선택, 꿈 내용 *민감 정보* 처리(libsodium 권장), export/import JSON dump. 짝 스킬 `frontend/indexeddb-dexie`는 Dexie 사용법 자체를 다루고, 본 스킬은 꿈 일기 도메인 데이터 모델 설계 결정을 다룬다.
---

# dream-journal-data-modeling — 꿈 일기 앱 데이터 모델링

> 소스:
> - Dexie 공식 — https://dexie.org/
> - Dexie Indexable Type — https://dexie.org/docs/Indexable-Type
> - Dexie MultiEntry Index — https://dexie.org/docs/MultiEntry-Index
> - Dexie Version.upgrade() — https://dexie.org/docs/Version/Version.upgrade()
> - MDN IndexedDB Basic Terminology — https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology
> - MDN StorageManager.persist() — https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist
> - Fuse.js — https://fusejs.io/
> - MiniSearch — https://lucaong.github.io/minisearch/
>
> 검증일: 2026-05-14

> **짝 스킬 안내**: `frontend/indexeddb-dexie`는 Dexie API 사용법 자체(스키마·쿼리·트랜잭션·`useLiveQuery`)를 다룬다. 본 스킬은 꿈 일기 *도메인* 데이터 모델 설계 결정(엔티티 분할·인덱스 선택·동기화 전략·민감 정보 처리)을 다룬다. 함께 참조하면 좋다.

---

## 언제 사용하나

- 꿈 일기/드림 저널 PWA 또는 로컬 우선(local-first) 앱을 *처음부터* 설계할 때
- 기존 꿈 일기 앱에 *해몽·상징 사전·통계·동기화* 기능을 추가할 때
- 꿈 내용을 어디까지 *로컬*로 두고 어디부터 *클라우드*로 보낼지 결정할 때
- 단순 메모/일기 앱에서 *꿈 도메인 특화* 모델(꿈꾼 날짜 vs 작성 날짜, 다중 해몽, 상징 분류)로 확장할 때

## 언제 사용하지 않나

- 단순 텍스트 메모 1종만 저장 → LocalStorage 또는 단일 테이블이면 충분
- *실시간 협업* 핵심(공동 꿈 분석 등) → 본 스킬의 LWW 권고로는 부족. Yjs·Automerge 같은 본격 CRDT 사용
- *서버 우선* 설계(꿈 내용 즉시 LLM 분석 후 폐기) → 로컬 우선 모델 불필요

---

## 1. 엔티티 정의

꿈 일기 앱의 도메인 모델은 4개 엔티티로 구성한다. **꿈 내용은 민감 정보**(섹션 8 참조)임을 전제로 모델을 설계한다.

### 1.1 Dream (꿈)

```typescript
interface Dream {
  id?: number           // ++id auto-increment
  title: string         // 짧은 제목 ("뱀이 나온 꿈")
  content: string       // 본문 (Markdown 또는 plain text)
  dreamedAt: Date       // ★ 꿈을 꾼 날짜 (≠ 작성 시각)
  createdAt: Date       // 작성 시각
  updatedAt: Date       // 마지막 수정 시각
  mood?: Mood           // 꿈 *안에서* 느낀 감정 (작성 시점 감정 X)
  tags: string[]        // ['물', '뱀', '도망']  — multi-entry 인덱싱
  imageBlobs?: Blob[]   // 첨부 이미지(작은 양만, 섹션 5 참조)
  audioBlob?: Blob      // 음성 메모(있다면 별도 store 권장)
  archived: boolean     // 보관(숨김) 여부
  // 동기화 메타(선택): 섹션 7
  syncVersion?: number
  lastSyncedAt?: Date
}

type Mood =
  | 'joy' | 'fear' | 'sadness' | 'anger' | 'surprise'
  | 'disgust' | 'neutral' | 'mixed'
```

**핵심 설계 결정**:

| 결정 | 이유 |
|------|------|
| `dreamedAt`과 `createdAt` 분리 | 꿈은 보통 *다음 날 아침* 기록. "어젯밤 꿈"을 검색하려면 꿈꾼 날 기준 인덱스가 필요 |
| `mood`는 꿈 *안*의 감정 | 작성 시점 기분과 구분. 통계용 |
| `tags: string[]` (별도 테이블 외래키 X) | multi-entry 인덱스로 충분. 빈도 통계는 `Tag` 테이블 보조용 |
| `archived` 필드 | 삭제 대신 보관. `[archived+dreamedAt]` 복합 인덱스로 활성 꿈만 정렬 |

> **주의 (민감 정보)**: `content`는 평문으로 IndexedDB에 저장하면 *디스크에 평문 노출*된다. 동기화 안 하더라도 공유 PC·확장 프로그램 접근 위험이 있으므로 사용자 설정으로 *애플리케이션 레벨 암호화* 옵션을 제공하라 (섹션 8).

### 1.2 Interpretation (해몽)

같은 꿈에 *여러 해몽*이 붙을 수 있다. 1:N.

```typescript
interface Interpretation {
  id?: number
  dreamId: number               // FK to Dream.id
  source: InterpretationSource  // 출처
  content: string               // 해몽 본문
  prompt?: string               // LLM source일 때 입력 프롬프트
  model?: string                // LLM source일 때 모델명("claude-sonnet-4-7" 등)
  createdAt: Date
  pinned?: boolean              // 사용자가 고정한 해몽
}

type InterpretationSource =
  | 'traditional'   // 전통 해몽(예: 한국 전통 꿈 해석)
  | 'jung-freud'    // 융/프로이트 심리학 기반
  | 'llm'           // 생성 AI
  | 'user'          // 사용자 직접 작성
```

**왜 별도 테이블인가**:

- 같은 꿈에 *여러 출처* 해몽을 동시 보관(전통 + LLM + 사용자 메모)
- 해몽만 삭제·재생성 가능
- LLM 호출 비용·재현성 추적(`prompt`, `model`) 필요

### 1.3 Symbol (꿈 상징) — *선택적* 사전

상징 사전을 자체 데이터로 운영할 때만 추가. 외부 API만 호출한다면 생략 가능.

```typescript
interface Symbol {
  id?: number
  name: string                  // '물', '뱀', '집' — &unique
  category: SymbolCategory
  meaningTraditional?: string   // 전통 해석
  meaningPsychological?: string // 심리학적 해석(융·프로이트)
  relatedSymbolIds?: number[]   // 연관 상징
}

type SymbolCategory =
  | 'nature'    // 자연(물·불·바람)
  | 'animal'    // 동물(뱀·새·개)
  | 'person'    // 인물(어머니·낯선이)
  | 'action'    // 행위(도망·날기·떨어짐)
  | 'object'    // 사물(집·차·열쇠)
  | 'place'     // 장소(학교·바다)
  | 'other'
```

### 1.4 Tag (태그) — 빈도 통계 보조

```typescript
interface Tag {
  id?: number
  name: string    // &unique
  color?: string  // UI 색상
  count: number   // 사용 빈도 (트랜잭션으로 동기 갱신)
}
```

**왜 별도 테이블인가**:

- `Dream.tags: string[]`만으로는 *빈도 집계*가 O(N) 스캔 필요
- `Tag.count`를 미리 유지하면 워드클라우드·자동완성 O(1) 접근
- 단점: Dream CRUD 시 트랜잭션으로 `count` 동기화 부담 → 섹션 6 참조

---

## 2. Dexie 스키마

```typescript
// db.ts
import Dexie, { Table } from 'dexie'

export class DreamJournalDB extends Dexie {
  dreams!: Table<Dream, number>
  interpretations!: Table<Interpretation, number>
  symbols!: Table<Symbol, number>
  tags!: Table<Tag, number>

  constructor() {
    super('DreamJournalDB')
    this.version(1).stores({
      // Dream: dreamedAt(범위), tags(multi-entry), [archived+dreamedAt](복합)
      dreams: '++id, dreamedAt, createdAt, *tags, [archived+dreamedAt], mood',

      // Interpretation: dreamId(FK), source(필터), createdAt(정렬)
      interpretations: '++id, dreamId, source, createdAt, [dreamId+source]',

      // Symbol: name(unique), category(필터)
      symbols: '++id, &name, category',

      // Tag: name(unique), count(정렬)
      tags: '++id, &name, count',
    })
  }
}

export const db = new DreamJournalDB()
```

### 인덱스 선택 근거

| 인덱스 | 용도 | 비고 |
|--------|------|------|
| `dreams.dreamedAt` | "최근 30일 꿈" 범위 쿼리 | `where('dreamedAt').above(...)` |
| `dreams.*tags` | 태그별 필터 | multi-entry, `.distinct()` 권장 |
| `dreams.[archived+dreamedAt]` | "보관 안 한 꿈만 날짜순" | `archived=false`만 효율 정렬 |
| `dreams.mood` | 감정별 통계 | `where('mood').equals('fear')` |
| `interpretations.dreamId` | 꿈 1개의 모든 해몽 조회 | |
| `interpretations.[dreamId+source]` | "이 꿈의 LLM 해몽" 효율 조회 | |
| `symbols.&name` | 상징 이름 중복 방지 + 사전 조회 | unique |
| `tags.&name` | 태그 이름 중복 방지 | unique |
| `tags.count` | "많이 쓰인 태그 TOP 20" 정렬 | `orderBy('count').reverse()` |

> **인덱스 가능 타입 (Dexie 공식)**: `number`, `Date`, `string`, `ArrayBuffer`, `TypedArray`, 이들의 배열. **boolean·Blob·Object·null은 인덱싱 불가**.
> 그래서 `archived: boolean`은 *값*은 boolean이라도 *인덱스 키*로 쓰려면 `0/1`로 저장하거나 복합 인덱스에서 우회한다. 위 스키마의 `[archived+dreamedAt]`은 boolean을 키 일부로 쓰지만 *복합 키 안에서는* 정렬 가능한 타입으로 변환되어 인덱싱된다 — 동작은 하나, 정밀한 경우 `archivedFlag: 0 | 1`로 명시 전환하는 편이 안전하다.
> 소스: https://dexie.org/docs/Indexable-Type

---

## 3. 마이그레이션 패턴

Dexie의 `db.version(N).upgrade()`로 *데이터 변환*을 수행한다.

### 3.1 기본 패턴: 필드 추가 + 기본값 부여

```typescript
// version 1
this.version(1).stores({
  dreams: '++id, dreamedAt, createdAt, *tags',
})

// version 2 — archived 필드 추가, 복합 인덱스 추가
this.version(2).stores({
  dreams: '++id, dreamedAt, createdAt, *tags, [archived+dreamedAt], mood',
}).upgrade((trans) => {
  return trans.table('dreams').toCollection().modify((dream) => {
    if (dream.archived === undefined) dream.archived = false
    if (dream.mood === undefined) dream.mood = 'neutral'
  })
})
```

### 3.2 엔티티 분리: 인라인 → 별도 테이블

초기에 `Dream.interpretation: string` 단일 필드로 시작했다가 `Interpretation` 테이블로 분리하는 흔한 케이스.

```typescript
this.version(3).stores({
  dreams: '++id, dreamedAt, createdAt, *tags, [archived+dreamedAt], mood',
  interpretations: '++id, dreamId, source, createdAt',
}).upgrade(async (trans) => {
  const dreams = trans.table('dreams')
  const interpretations = trans.table('interpretations')

  await dreams.toCollection().modify(async (dream, ref) => {
    if (dream.interpretation && typeof dream.interpretation === 'string') {
      await interpretations.add({
        dreamId: dream.id,
        source: 'user',
        content: dream.interpretation,
        createdAt: dream.createdAt ?? new Date(),
      })
      delete dream.interpretation
    }
  })
})
```

> **주의**: `modify()` 콜백 안에서 *외부 await*은 가능하지만 *다른 transaction*을 새로 열면 abort된다. 같은 `trans`의 다른 테이블에는 접근 가능.
> 소스: https://dexie.org/docs/Version/Version.upgrade()

### 3.3 모든 버전에 모든 테이블 명시 권장

`.stores()`는 *그 버전에서의 전체 정의*다. 한 버전에서 누락하면 *삭제*로 간주된다. 가능하면 매 버전 모든 테이블을 적어 안전성을 확보한다.

---

## 4. 쿼리 패턴

### 4.1 최근 N일 꿈

```typescript
// 최근 30일
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

const recent = await db.dreams
  .where('dreamedAt')
  .above(thirtyDaysAgo)
  .reverse()    // 최신 우선
  .sortBy('dreamedAt')
```

### 4.2 보관 안 한 꿈만 날짜순

```typescript
// [archived+dreamedAt] 복합 인덱스 활용
const active = await db.dreams
  .where('[archived+dreamedAt]')
  .between(
    [false, Dexie.minKey],
    [false, Dexie.maxKey],
    true,
    true
  )
  .reverse()
  .toArray()
```

> `Dexie.minKey` / `Dexie.maxKey`는 *모든 키 범위*를 의미한다. 복합 인덱스 부분 매치에 사용.
> 소스: https://dexie.org/docs/Indexable-Type

### 4.3 태그별 꿈 (multi-entry)

```typescript
// '물' 태그가 붙은 모든 꿈
const water = await db.dreams
  .where('tags')
  .equals('물')
  .distinct()     // ★ multi-entry 쿼리는 distinct() 권장
  .toArray()

// 여러 태그 OR
const dreamy = await db.dreams
  .where('tags')
  .anyOf(['물', '뱀', '도망'])
  .distinct()
  .toArray()
```

> **distinct() 권장 이유**: multi-entry 인덱스에 같은 record가 *여러 키*로 들어가 있으면 결과에 중복으로 나올 수 있다.
> 소스: https://dexie.org/docs/MultiEntry-Index, https://dexie.org/docs/Collection/Collection.distinct().html

### 4.4 키워드 검색 — IndexedDB 한계 + 외부 검색 결합

IndexedDB는 *전문 검색(full-text search)을 지원하지 않는다*. `where('content').startsWith('...')` 는 prefix 검색만 가능하다. 단어 단위·오타 허용 검색이 필요하면 다음 라이브러리를 결합한다.

**옵션 A: Fuse.js** — 퍼지 검색, zero deps, ~6.5KB gzip

```typescript
import Fuse from 'fuse.js'

const dreams = await db.dreams.toArray()
const fuse = new Fuse(dreams, {
  keys: ['title', 'content', 'tags'],
  threshold: 0.3,    // 0 = 완전 일치, 1 = 매우 느슨
  includeScore: true,
})

const results = fuse.search('뱀') // {item, score}[]
```

**옵션 B: MiniSearch** — 인메모리 풀텍스트 엔진, 한국어도 token 분할 가능

```typescript
import MiniSearch from 'minisearch'

const mini = new MiniSearch({
  fields: ['title', 'content', 'tags'],
  storeFields: ['id', 'title'],
  searchOptions: { boost: { title: 2 }, fuzzy: 0.2 },
})

const dreams = await db.dreams.toArray()
mini.addAll(dreams)

const results = mini.search('뱀 도망')
```

**비교**:

| 항목 | Fuse.js | MiniSearch |
|------|---------|-----------|
| 알고리즘 | Bitap (퍼지) | 역색인(Inverted Index) + 퍼지 옵션 |
| 인덱스 빌드 | 메모리 즉시 | 메모리, addAll로 빌드 |
| 적합 규모 | 수백~수천 문서 | 수천~수만 문서 (역색인이라 더 효율) |
| 한국어 | token 분할 약함 (음절 단위 매칭 의존) | tokenizer 커스터마이즈 가능 |
| 결과 점수 | score (0=완전일치, 1=불일치) | relevance score |

> **권장**: 꿈 수가 수백 개 이하인 일반 사용자는 Fuse.js, 수천 개 이상 또는 한국어 형태소 분석 결합이 필요하면 MiniSearch + 커스텀 tokenizer.

**인덱스 영속화**: 매 검색마다 `dreams.toArray()` + 빌드는 비효율. *앱 초기화 시 1회* 빌드하고 in-memory 캐시 유지. Dream CRUD 후 `mini.add/remove/replace`로 incremental 갱신.

### 4.5 감정 분포 통계

```typescript
const allDreams = await db.dreams.toArray()
const moodCount = allDreams.reduce<Record<string, number>>((acc, d) => {
  acc[d.mood ?? 'neutral'] = (acc[d.mood ?? 'neutral'] ?? 0) + 1
  return acc
}, {})
// → { fear: 12, joy: 8, neutral: 30, ... }
```

대규모일 경우 별도 통계 테이블에 미리 집계하는 *materialized view* 패턴 고려.

---

## 5. 이미지·오디오 첨부

### 5.1 Blob 직접 저장 vs Cache API vs 외부 스토리지

IndexedDB는 *값으로* Blob/File을 저장할 수 있다 (인덱스 키로는 불가).

| 방식 | 장점 | 단점 | 적합 |
|------|------|------|------|
| **IndexedDB Blob 필드** | DB와 함께 원자적 트랜잭션, 백업 단일화 | 큰 Blob은 쿼리·복사 시 메모리 부담, 동기화 페이로드 폭발 | 작은 이미지(<500KB), 음성 메모 5초 |
| **별도 IndexedDB store** | 메타 테이블과 분리, 필요 시만 fetch | 코드 분기 늘어남 | 중간 크기 첨부, 동기화 시 별도 처리 |
| **Cache API** | Service Worker가 HTTP 응답처럼 캐시, 큰 파일 적합 | URL 키 관리, 트랜잭션 X | 미디어 파일 다수 |
| **OPFS(Origin Private File System)** | 진짜 파일 시스템 API, 대용량 효율 | 비교적 신규(Safari 15.2+), Dexie와 별도 관리 | 큰 미디어, 동영상 |
| **외부 스토리지** (S3 등) | 디바이스 용량 절약, 공유 용이 | 네트워크 의존, 비용, 민감 정보 노출 위험 | 동기화 활성화 시 |

> **권장 규칙**: 단일 첨부 ≤ 1MB까지는 IndexedDB 직접. 그 이상은 별도 store 또는 Cache API. 동기화하려면 외부 스토리지 + presigned URL 패턴.
> 소스: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology

### 5.2 별도 테이블 패턴

```typescript
interface DreamAttachment {
  id?: number
  dreamId: number
  type: 'image' | 'audio'
  blob: Blob
  filename: string
  size: number      // bytes
  createdAt: Date
}

this.version(N).stores({
  // ...
  attachments: '++id, dreamId, type, [dreamId+type]',
})
```

리스트 화면에서는 `Dream` 메타만 읽고, 상세 화면 진입 시에만 `attachments.where('dreamId').equals(id).toArray()`로 로딩 → 메모리 효율.

### 5.3 용량 폭발 방지

```typescript
// 첨부 추가 전 quota 체크
const { usage = 0, quota = 0 } = await navigator.storage.estimate()
if (usage / quota > 0.8) {
  alert('저장 공간이 80% 이상 찼습니다. 보관함을 정리해 주세요.')
}

// 이미지는 사전 압축
async function compressImage(file: File, maxWidth = 1280): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / bitmap.width)
  const canvas = new OffscreenCanvas(bitmap.width * scale, bitmap.height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return await canvas.convertToBlob({ type: 'image/webp', quality: 0.85 })
}
```

`navigator.storage.persist()`로 *eviction 방지*(섹션 9 export와 함께 사용):

```typescript
if (navigator.storage?.persist) {
  const granted = await navigator.storage.persist()
  console.log('persistent:', granted)
}
```

> **저장공간 정책 (MDN)**: 일반 origin은 디바이스 전체 디스크의 최대 60%까지 IndexedDB·Cache API 사용 가능. 공간 부족 시 LRU로 *non-persistent* 데이터 우선 삭제. `persist()` 승인된 origin은 후순위에 보호.
> 소스: https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist

---

## 6. 통계 모델

### 6.1 태그 빈도 (Tag.count 동기 갱신)

```typescript
async function addDreamWithTags(dream: Omit<Dream, 'id'>) {
  await db.transaction('rw', db.dreams, db.tags, async () => {
    const id = await db.dreams.add(dream as Dream)
    for (const name of dream.tags) {
      const existing = await db.tags.where('name').equals(name).first()
      if (existing) {
        await db.tags.update(existing.id!, { count: existing.count + 1 })
      } else {
        await db.tags.add({ name, count: 1 })
      }
    }
    return id
  })
}
```

> **주의**: 같은 transaction 안에서만 안전. transaction 콜백 안에서 *외부 await*(fetch 등) 호출은 abort 유발.

### 6.2 월별 꿈 수

```typescript
const allDreams = await db.dreams.toArray()
const byMonth = allDreams.reduce<Record<string, number>>((acc, d) => {
  const key = `${d.dreamedAt.getFullYear()}-${d.dreamedAt.getMonth() + 1}`
  acc[key] = (acc[key] ?? 0) + 1
  return acc
}, {})
```

### 6.3 워드클라우드용 빈도 TOP N

```typescript
const top20Tags = await db.tags
  .orderBy('count')
  .reverse()
  .limit(20)
  .toArray()
```

---

## 7. 백엔드 동기화 (선택)

**기본 결정**: 꿈 일기는 *로컬 우선*이 자연스럽다. 동기화는 사용자가 *명시 옵트인*했을 때만 적용한다.

### 7.1 충돌 해결 전략 비교

| 전략 | 설명 | 적합 케이스 | 단점 |
|------|------|-----------|------|
| **Last-Write-Wins (LWW)** | 더 최신 `updatedAt`(또는 논리적 시계)이 이김 | 1인 사용자 다중 디바이스, 동시 편집 거의 없음 | 시계 드리프트 시 데이터 손실 가능 |
| **CRDT** (Yjs, Automerge) | 수학적으로 충돌 없이 병합 보장 | 공동 작성, 텍스트 동시 편집 | 페이로드·복잡도 큼 |
| **사용자 수동 해결** | 충돌 시 두 버전 모두 보존, 사용자가 선택 | 드물게 충돌 + 데이터 가치 높음 | UX 부담 |

**권장 (꿈 일기 1인 사용 기본)**: LWW + *논리적 시계*(`syncVersion: number`) 사용. Wall clock 대신 단조 증가 카운터로 시계 드리프트 회피.

```typescript
interface Dream {
  // ...
  updatedAt: Date
  syncVersion: number    // 매 수정마다 ++
  lastSyncedAt?: Date
  deleted?: boolean      // tombstone (실제 삭제 X, 동기화 후 cleanup)
}
```

> **주의 (CRDT)**: 텍스트 *동시 편집*이 핵심이면 LWW로는 부족. Yjs/Automerge 도입 검토.
> 소스: https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type

### 7.2 sync 흐름

```
1. 로컬 변경 → syncVersion++ + updatedAt = now
2. 백그라운드 동기화 큐 → 서버에 PUT
3. 서버는 자기 syncVersion과 비교
   - 로컬 ver > 서버 ver: 수락
   - 로컬 ver = 서버 ver: 멱등(no-op)
   - 로컬 ver < 서버 ver: 충돌 → LWW 정책 따라 처리
4. pull: 서버 변경분 fetch → 로컬 적용
```

### 7.3 동기화 시 *암호화* (필수 권장)

꿈 내용을 서버로 보낼 때는 **클라이언트 사이드 E2E 암호화**가 권장된다. 서버는 ciphertext만 보고, 키는 사용자만 보유.

```typescript
// libsodium-wrappers 예시 (개념)
import sodium from 'libsodium-wrappers'

await sodium.ready
const key = sodium.crypto_secretbox_keygen() // 사용자 비밀번호에서 derive 권장 (Argon2)
const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
const ciphertext = sodium.crypto_secretbox_easy(dream.content, nonce, key)
// 서버에는 { ciphertext, nonce } 전송. key는 절대 전송 금지.
```

> **소스**: libsodium.js — https://github.com/jedisct1/libsodium.js
> Signal·WhatsApp·Tor에서 사용되는 검증된 라이브러리.

---

## 8. 개인정보 처리 — 꿈 내용은 *민감 정보*

꿈 일기는 사용자의 *심리 상태·트라우마·욕망*이 노출되는 매우 민감한 텍스트다. GDPR 기준 "특별 카테고리 개인정보"에 준해 다룬다.

### 8.1 기본 원칙

| 원칙 | 구현 |
|------|------|
| **로컬 저장 우선** | 동기화 옵션은 *기본 OFF*. 사용자가 명시 활성화해야 함 |
| **암호화 옵션** | 앱 잠금(PIN/지문) + IndexedDB 저장 시 application-level AES/ChaCha20 암호화 옵션 제공 |
| **export 시 경고** | JSON dump 다운로드 전 "이 파일에는 꿈 내용이 포함됩니다" 경고 |
| **공유 PC 대비** | 자동 로그아웃, 일정 시간 후 자동 잠금 |
| **LLM 호출 시 경고** | "이 꿈을 외부 LLM에 보내시겠습니까?" 명시 확인. 익명화 옵션 (이름·장소 mask) |
| **삭제 = 진짜 삭제** | tombstone만 두지 말고 일정 기간 후 ciphertext도 wipe |

### 8.2 IndexedDB 평문 저장 위험

> IndexedDB는 기본적으로 *디스크에 평문* 저장된다. 같은 디바이스의 다른 사용자·악성 확장·디스크 포렌식에서 읽힐 수 있다. 민감도 높은 앱은 *애플리케이션 레벨 암호화*를 추가해야 한다.
> 소스: https://rxdb.info/encryption.html

```typescript
// 저장 전 암호화
async function saveDream(plain: Dream, userKey: Uint8Array) {
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
  const encrypted = sodium.crypto_secretbox_easy(plain.content, nonce, userKey)
  await db.dreams.add({
    ...plain,
    content: '',         // 평문 비움
    encryptedContent: encrypted,
    nonce,
  })
}
```

> **트레이드오프**: 암호화하면 *전문 검색 불가*(Fuse.js·MiniSearch에 평문이 메모리에 떠야 함). 사용자 잠금 해제 세션 동안만 메모리에 복호화, 잠금 시 검색 인덱스도 wipe.

### 8.3 사용자 키 관리

- 비밀번호 → Argon2id로 derive (PBKDF2도 가능하나 약함)
- 키 자체는 디바이스 keychain(Web Crypto API `crypto.subtle` non-extractable key)에 저장
- 비밀번호 분실 시 *복구 불가*함을 사용자에게 명시(데이터 가치 vs 사용성)

---

## 9. 데이터 마이그레이션 — Export/Import

디바이스 변경·백업·이주를 위한 JSON dump 패턴.

### 9.1 Export

```typescript
async function exportAll(): Promise<Blob> {
  const dump = {
    schemaVersion: 3,
    exportedAt: new Date().toISOString(),
    dreams: await db.dreams.toArray(),
    interpretations: await db.interpretations.toArray(),
    tags: await db.tags.toArray(),
    symbols: await db.symbols.toArray(),
  }
  const json = JSON.stringify(dump, (key, value) => {
    if (value instanceof Blob) {
      // Blob은 별도 export — base64로 인라인 또는 별도 zip
      return { __blob: true, /* base64 */ }
    }
    return value
  }, 2)
  return new Blob([json], { type: 'application/json' })
}

// 사용자에게 다운로드 제공
const blob = await exportAll()
const url = URL.createObjectURL(blob)
// <a href={url} download="dream-journal-2026-05-14.json">다운로드</a>
```

### 9.2 Import

```typescript
async function importAll(file: File, mode: 'merge' | 'replace') {
  const text = await file.text()
  const dump = JSON.parse(text)

  // 스키마 버전 호환성 검사
  if (dump.schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error('이 백업은 더 새로운 버전입니다. 앱을 업데이트해 주세요.')
  }

  await db.transaction('rw', db.dreams, db.interpretations, db.tags, db.symbols, async () => {
    if (mode === 'replace') {
      await Promise.all([
        db.dreams.clear(),
        db.interpretations.clear(),
        db.tags.clear(),
        db.symbols.clear(),
      ])
    }
    // bulkPut: id 충돌 시 덮어쓰기 (merge 시 주의)
    await db.dreams.bulkPut(dump.dreams)
    await db.interpretations.bulkPut(dump.interpretations)
    await db.tags.bulkPut(dump.tags)
    await db.symbols.bulkPut(dump.symbols)
  })
}
```

### 9.3 큰 첨부 처리

JSON 안에 base64 Blob을 인라인하면 *파일 크기 4/3 팽창*. 이미지 많은 경우 **zip(JSON 메타 + Blob 파일들)** 컨테이너 권장 (jszip 사용).

---

## 10. 흔한 함정

| 함정 | 증상 | 해결 |
|------|------|------|
| **multi-entry index를 잘못 활용** | `where('tags').equals('물').toArray()` 결과에 같은 dream 여러 번 등장 | `.distinct()` 추가 |
| **`dreamedAt` 인덱스 없이 최신순 정렬** | 전체 scan, 느려짐 | `dreamedAt`을 인덱스에 명시 |
| **Blob을 직접 인덱싱 시도** | "Failed to execute 'add' on 'IDBObjectStore'" 에러 | Blob은 *값*으로만 저장, 인덱스 키 불가 (Indexable-Type 문서 참고) |
| **Tag.count를 비-트랜잭션으로 갱신** | race condition으로 count 어긋남 | `db.transaction('rw', ...)` 안에서 갱신 |
| **검색 인덱스(Fuse/MiniSearch) 영속화 없이 매 검색마다 재빌드** | 수천 꿈에서 검색 지연 | 앱 부팅 시 1회 빌드 후 incremental 갱신 |
| **꿈 내용을 평문 그대로 LLM API 호출** | 사용자 동의 없는 민감 정보 외부 송출 | 명시 동의 + 익명화 옵션 |
| **시계 드리프트 무시한 LWW** | 디바이스 시간이 과거면 변경이 묵살됨 | 논리적 시계(`syncVersion`) 사용 |
| **암호화 활성화하면서 검색은 평문 의존** | 잠금 상태에서 검색 결과에 평문 노출 | 잠금 시 검색 인덱스도 wipe |
| **`.stores()`에서 일부 테이블 누락** | 누락 테이블 데이터 *삭제됨* | 매 버전에 모든 테이블 명시 |
| **export 파일에 키도 함께 백업** | 백업 유출 시 즉시 복호화 가능 | 키는 별도 채널(사용자가 직접 보관) |

---

## 참고

- Dexie 공식: https://dexie.org/
- Dexie Indexable Type: https://dexie.org/docs/Indexable-Type
- Dexie MultiEntry Index: https://dexie.org/docs/MultiEntry-Index
- Dexie Version.upgrade(): https://dexie.org/docs/Version/Version.upgrade()
- Dexie StorageManager: https://dexie.org/docs/StorageManager
- MDN IndexedDB Basic Terminology: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology
- MDN StorageManager.persist(): https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist
- Fuse.js: https://fusejs.io/
- MiniSearch: https://lucaong.github.io/minisearch/
- libsodium.js: https://github.com/jedisct1/libsodium.js
- CRDT (Wikipedia): https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type
- 짝 스킬: `frontend/indexeddb-dexie` (Dexie 사용법 자체)
