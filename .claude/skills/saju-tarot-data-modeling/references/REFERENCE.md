## 4. 타로 세션 모델

### 4.1 마스터 데이터: Deck / SpreadDefinition

```typescript
interface Deck {
  id: string
  code: string               // 'rws' — &unique
  name: string               // 'Rider–Waite–Smith'
  system: 'rws' | 'thoth' | 'marseille' | 'custom'
  cardCount: number          // RWS = 78 (메이저 22 + 마이너 56)
  supportsReversal: boolean
  assetLicense?: string      // 이미지 자산 라이선스 메모
}

interface SpreadPosition {
  index: number              // 0-based
  key: string                // 'present' | 'obstacle' | ...
  label: string              // '현재 상황'
  hint?: string              // 해석 프롬프트에 넣을 위치 설명
}

interface SpreadDefinition {
  id: string
  code: SpreadCode
  version: number            // ★ [code+version] 유니크
  name: string
  positions: SpreadPosition[]
  createdAt: string
}

type SpreadCode = 'one-card' | 'three-card' | 'celtic-cross' | 'custom'
```

**왜 스프레드를 데이터로 두고 버전까지 붙이나**: 켈틱크로스는 10장 배열이지만 중간 위치(과거/미래/위/아래)의 의미는 해설 전통마다 다르게 서술된다. 위치 의미를 코드 상수로 박으면 나중에 문구 한 줄만 고쳐도 **과거 세션의 해석 근거가 소급 변경**된다. `positions`를 데이터로 두고 세션에 `spreadVersion`을 스냅샷하면 과거 리딩이 그대로 재현된다.

1장·3장 스프레드도 같은 구조로 표현되므로, 스프레드 종류가 늘어도 세션 스키마는 바뀌지 않는다.

### 4.2 TarotSession

```typescript
interface DrawnCard {
  position: number           // SpreadPosition.index
  cardKey: string            // 'major-01' | 'cups-07' — 덱 무관 안정 키
  reversed: boolean          // 정/역방향 (인라인 값 — 인덱스 아님)
}

interface TarotSession {
  id: string
  subjectId: string
  deckId: string
  spreadCode: SpreadCode
  spreadVersion: number      // ★ 스냅샷
  question?: string          // 사용자 질문 원문 (민감할 수 있음 — 섹션 10)
  draws: DrawnCard[]         // 인라인 배열
  cardKeys: string[]         // ★ draws에서 파생 — *multi-entry 인덱스용
  shuffleSeed?: string       // 재현 가능한 셔플용 시드
  drawMode: 'random' | 'manual'   // 실물 카드 수동 입력 지원
  createdAt: string
  updatedAt: string
  feedback?: SessionFeedback
  deletedAt?: string
}

interface SessionFeedback {
  rating?: 1 | 2 | 3 | 4 | 5
  accuracyVote?: 'hit' | 'miss' | 'unsure'
  note?: string
  ratedAt: string
}
```

| 결정 | 이유 |
|------|------|
| `draws`를 **별도 테이블로 빼지 않고 인라인** | 카드는 항상 세션 단위로 통째 조회된다. 조인 비용·트랜잭션 복잡도만 늘고 얻는 게 없다 |
| 대신 `cardKeys: string[]` **파생 필드** | "컵 7이 나온 리딩 모두" 같은 통계는 `*cardKeys` multi-entry 인덱스로 해결. 인라인 객체 배열의 속성은 인덱싱할 수 없기 때문 |
| `reversed`는 인덱싱하지 않음 | boolean은 IndexedDB 키가 아니다(섹션 7). 정/역 통계가 필요하면 `cardKeys`에 `'cups-07:r'` 형태 접미사를 붙인 파생 키를 함께 넣는다 |
| `drawMode` | 앱이 뽑아준 카드와 사용자가 실물로 뽑아 입력한 카드는 신뢰도·분석 의미가 다르다 |
| `shuffleSeed` | "같은 리딩 다시 보기"·QA 재현·이상 동작 검증용. 시드가 없으면 랜덤 결과를 사후 검증할 수 없다 |
| `feedback` 인라인 | 세션당 최대 1개, 항상 함께 조회 |

> RWS 덱(1909년 초판, 메이저 22 + 마이너 56 = 78장)의 원화는 미국 등에서 퍼블릭 도메인으로 분류되지만 **개별 출판사의 리마스터판은 별도 권리**가 붙을 수 있다. 어떤 자산을 쓰는지 `Deck.assetLicense`에 남겨 두면 나중에 자산 교체 판단이 쉽다.

---

## 5. 손금 세션 모델 — 원본 저장 최소화

```typescript
type RetentionMode = 'none' | 'local-only' | 'expires'

interface PalmSession {
  id: string
  subjectId: string
  hand: 'left' | 'right'

  // 원본 사진 — 기본은 저장하지 않는다
  retentionMode: RetentionMode
  imageBlob?: Blob           // retentionMode !== 'none' 일 때만
  imageMeta?: {
    width: number
    height: number
    byteSize: number
    capturedAt: string
    hash?: string            // 중복 업로드 감지용 (원본 없이도 남길 수 있음)
  }
  expiresAt?: string         // retentionMode === 'expires' — 인덱싱해 배치 삭제

  vision: VisionResult
  createdAt: string
  deletedAt?: string
}

interface VisionResult {
  provider: string           // 'anthropic' | 'openai' | 'on-device'
  model: string              // 재현성 추적
  promptVersion: string
  lines: PalmLineFinding[]   // 구조화 결과
  rawText?: string           // 원문(길면 저장 생략 가능)
  confidence?: number
  analyzedAt: string
}

interface PalmLineFinding {
  line: 'heart' | 'head' | 'life' | 'fate' | 'sun' | 'marriage' | 'other'
  description: string
  strength?: 'weak' | 'normal' | 'strong'
}
```

**원본 저장을 기본값으로 두지 않는 이유**

1. **법적 위험**: 개인정보 보호법 시행령 제18조는 "개인의 신체적·생리적·행동적 특징에 관한 정보로서 **특정 개인을 알아볼 목적으로** 일정한 기술적 수단을 통해 생성한 정보"(생체인식정보)를 민감정보로 규정한다. 손금 사진을 운세 목적으로만 쓰면 이 정의에 곧바로 들어맞지는 않지만, 손바닥 이미지는 지문·장문 등 식별 가능한 특징을 함께 담을 수 있어 **분쟁 시 방어가 어렵다**. 저장하지 않으면 이 논쟁 자체가 사라진다.
2. **용량**: 12MP 사진 1장이 3~5MB다. IndexedDB 할당량은 오리진·사용자별로 달라지고 `navigator.storage.estimate()`가 주는 `usage`/`quota`도 압축·중복제거·보안상 난독화 때문에 **근사치**다. 사진 수십 장이면 축출(eviction) 위험 구간에 들어간다.
3. **가치 대비**: 분석 결과 텍스트만 있으면 UI는 전부 그릴 수 있다. 원본은 "다시 분석하기"에만 필요하다.

**권장 기본 정책**

```
촬영 → 메모리에서 Vision 분석 → VisionResult 저장 → Blob 폐기(retentionMode: 'none')
사용자가 "사진도 보관" 선택 시에만 → 'local-only' (동기화 제외)
"30일 후 자동 삭제" 선택 시 → 'expires' + expiresAt 인덱스로 배치 정리
```

```typescript
// 만료 정리 — 앱 시작 시 1회
export async function purgeExpiredPalmImages(now = new Date().toISOString()) {
  await db.palmSessions
    .where('expiresAt').below(now)
    .modify((s) => {
      delete s.imageBlob
      s.retentionMode = 'none'
      s.expiresAt = undefined     // 재스캔 대상에서 제외
    })
}
```

> `expiresAt`이 `undefined`인 레코드는 유효 키가 아니므로 인덱스에 들어가지 않고, 위 쿼리 대상에서 자연스럽게 빠진다. 이 성질을 **의도적으로** 이용한 설계다.
> Blob은 IndexedDB에 값으로 저장할 수는 있지만 **인덱싱 대상이 아니다**. 큰 바이너리를 인덱스에 넣으려는 시도는 하지 않는다.

---

## 6. Reading — 해석 결과 공통 테이블

사주·타로·손금 모두 "해석 문장"을 만들어낸다. 세 테이블에 각각 `interpretation` 필드를 두는 대신 다형(polymorphic) 테이블 하나로 모은다.

```typescript
type ReadingTarget = 'saju' | 'tarot' | 'palm' | 'daily'

interface Reading {
  id: string
  targetType: ReadingTarget
  targetId: string           // SajuChart.id | TarotSession.id | ...
  subjectId: string

  source: 'llm' | 'rule' | 'user'
  content: string            // 해석 본문(Markdown)

  // 재현성·비용 추적 (source === 'llm')
  model?: string             // 'claude-opus-5-5'
  promptVersion?: string
  inputSnapshotHash?: string // 해석 시점의 원국/카드 스냅샷 해시
  tokenUsage?: { input: number; output: number }

  disclaimerVersion?: string // 표시한 면책 고지 버전
  pinned?: 0 | 1
  createdAt: string
  deletedAt?: string
}
```

| 결정 | 이유 |
|------|------|
| 다형 테이블 1개 | "내 모든 해석 최신순" 화면이 조인 없이 나온다. 세 테이블 union은 IndexedDB에서 특히 비싸다 |
| `[targetType+targetId]` 복합 인덱스 | 다형 참조는 이 복합 인덱스가 있어야 실용적이다 |
| `inputSnapshotHash` | 원국이 재계산되어 바뀌면 과거 해석이 **다른 원국을 근거로 한 문장**이 된다. 해시 불일치 시 UI에서 "이 해석은 이전 계산 기준입니다" 배지를 띄운다 |
| `model`·`promptVersion` | 품질 회귀 추적, 비용 분석, 재생성 판단 근거 |
| `disclaimerVersion` | 고지 문구가 바뀐 뒤에도 "그때 무엇을 고지했는지"가 남는다 |

> 다형 참조의 대가: DB 레벨 외래키 무결성이 없다. 대상 삭제 시 `Reading`을 함께 지우는 것은 **애플리케이션 트랜잭션 책임**이다.

---

## 7. Dexie 스키마

```typescript
// db.ts
import Dexie, { Table } from 'dexie'

export class FortuneDB extends Dexie {
  subjects!: Table<Subject, string>
  birthInputs!: Table<BirthInput, string>
  sajuCharts!: Table<SajuChart, string>
  tarotSessions!: Table<TarotSession, string>
  palmSessions!: Table<PalmSession, string>
  readings!: Table<Reading, string>
  dailyFortunes!: Table<DailyFortune, string>
  decks!: Table<Deck, string>
  spreads!: Table<SpreadDefinition, string>
  settings!: Table<{ key: string; value: unknown }, string>

  constructor() {
    super('FortuneDB')

    this.version(1).stores({
      // PK는 문자열 UUID (++id 아님 — 섹션 9)
      subjects:      'id, kind, isSelf, updatedAt, [kind+updatedAt], syncScope',
      birthInputs:   'id, subjectId, updatedAt',
      sajuCharts:    'id, subjectId, stale, [subjectId+rulesetId], computedAt',
      tarotSessions: 'id, subjectId, spreadCode, createdAt, *cardKeys, [subjectId+createdAt]',
      palmSessions:  'id, subjectId, createdAt, expiresAt, [subjectId+createdAt]',
      readings:      'id, subjectId, targetId, source, createdAt, [targetType+targetId], [subjectId+createdAt]',
      dailyFortunes: 'id, &[subjectId+date+kind], expiresAt, subjectId',
      decks:         'id, &code',
      spreads:       'id, &[code+version], code',
      settings:      'key',
    })
  }
}

export const db = new FortuneDB()
```

> Dexie 스키마 문법: `++` 자동 증가 PK, `&` 유니크, `*` multi-entry, `[a+b]` 복합(인덱스 또는 PK), 일반 이름은 보통 인덱스. **인덱싱할 속성만** 적으면 되고 나머지 필드는 선언하지 않아도 저장된다. `&[a+b]` 처럼 유니크와 복합을 함께 쓸 수 있다.
>
> `sajuCharts.[subjectId+rulesetId]`가 동작하려면 `rulesetId`가 **최상위 필드**여야 한다(섹션 3.2에서 `engine.rulesetId`를 최상위에 복제해 둔 이유). 중첩 keyPath(`[subjectId+engine.rulesetId]`)를 쓰는 방법도 있으나 **프로젝트에서 하나로 통일**하고 혼용하지 않는다.

### 인덱스 선택 근거

| 인덱스 | 용도 |
|--------|------|
| `subjects.[kind+updatedAt]` | "가족 목록 최근 수정순" |
| `sajuCharts.[subjectId+rulesetId]` | 룰셋별 캐시 조회(섹션 3.3) |
| `sajuCharts.stale` | 마이그레이션 후 재계산 대상 스캔 (`0`/`1` 정수) |
| `tarotSessions.*cardKeys` | "이 카드가 나온 리딩" 통계 — multi-entry, `.distinct()` 필수 |
| `tarotSessions.[subjectId+createdAt]` | 대상별 타임라인 |
| `palmSessions.expiresAt` | 만료 사진 배치 정리 |
| `readings.[targetType+targetId]` | 다형 참조 역방향 조회 |
| `dailyFortunes.&[subjectId+date+kind]` | **유니크 복합** — 같은 날 같은 종류 중복 생성 차단 |
| `spreads.&[code+version]` | 스프레드 정의 버전 유일성 |

### 반드시 피할 것 — boolean 인덱스

IndexedDB의 유효 키 타입은 **string, number, Date, binary(ArrayBuffer/TypedArray), array**뿐이다. **boolean·null·undefined·일반 객체는 키가 될 수 없다.** 그리고 인덱스의 계산된 키가 유효하지 않으면 `add()`/`put()`이 실패하는 게 아니라 **그 인덱스 항목만 조용히 생략된다**(레코드 자체는 저장된다).

```typescript
// ❌ 레코드는 저장되지만 인덱스에서 통째로 빠진다 — 에러 없이 조회 0건
interface Bad { isSelf: boolean }
subjects: 'id, isSelf, [isSelf+updatedAt]'

// ✅ 0 | 1 정수 플래그
interface Good { isSelf: 0 | 1 }
subjects: 'id, isSelf, [isSelf+updatedAt]'
```

복합 인덱스 `[boolean + something]`도 마찬가지다. 배열(복합) 키의 구성 요소 중 하나라도 유효하지 않으면 **키 전체가 무효**가 되어 항목이 만들어지지 않는다. 이 실패는 **런타임 에러 없이** 나타나므로 "필터 결과가 왜 항상 0건이지?"로 며칠을 태우기 쉽다.

> 그래서 본 스킬의 모든 플래그 필드(`isSelf`, `stale`, `pinned`)는 `0 | 1` 타입이다. UI 경계에서만 boolean으로 변환한다.

---

## 8. 마이그레이션 패턴

### 8.1 계산 엔진 변경 → 전량 stale 표시

```typescript
this.version(2).stores({
  // 변경 없는 테이블도 전부 다시 적는다 (누락 = 삭제로 간주)
  subjects:      'id, kind, isSelf, updatedAt, [kind+updatedAt], syncScope',
  birthInputs:   'id, subjectId, updatedAt',
  sajuCharts:    'id, subjectId, stale, [subjectId+rulesetId], computedAt',
  tarotSessions: 'id, subjectId, spreadCode, createdAt, *cardKeys, [subjectId+createdAt]',
  palmSessions:  'id, subjectId, createdAt, expiresAt, [subjectId+createdAt]',
  readings:      'id, subjectId, targetId, source, createdAt, [targetType+targetId], [subjectId+createdAt]',
  dailyFortunes: 'id, &[subjectId+date+kind], expiresAt, subjectId',
  decks:         'id, &code',
  spreads:       'id, &[code+version], code',
  settings:      'key',
}).upgrade((trans) =>
  trans.table('sajuCharts').toCollection().modify((c) => {
    c.stale = 1        // ★ 여기서 재계산하지 않는다 — 조회 시 지연 계산
  })
)
```

**업그레이드 훅에서 재계산하지 않는 이유**: `upgrade()`는 DB 오픈을 막는 경로다. 여기서 수천 건을 계산하면 앱 첫 화면이 그만큼 늦어지고, 도중에 실패하면 트랜잭션이 통째로 롤백된다. 플래그만 찍고 나가는 것이 안전하다.

### 8.2 프라이버시 회귀 마이그레이션 — 사진 원본 제거

정책이 "사진 저장"에서 "사진 미저장"으로 바뀌었을 때, **기존 데이터도 정리**해야 정책이 실제로 적용된다.

```typescript
this.version(3).stores({ /* ... 전체 테이블 재기술 ... */ })
  .upgrade((trans) =>
    trans.table('palmSessions').toCollection().modify((s) => {
      if (s.imageBlob) {
        s.imageMeta = { ...(s.imageMeta ?? {}), byteSize: s.imageBlob.size }
        delete s.imageBlob
      }
      s.retentionMode = 'none'
    })
  )
```

### 8.3 필드 승격 — 인라인 → 인덱싱 가능한 파생 필드

`draws[].cardKey`를 통계용으로 쓰려고 `cardKeys` 배열을 도입하는 경우.

```typescript
this.version(4).stores({
  tarotSessions: 'id, subjectId, spreadCode, createdAt, *cardKeys, [subjectId+createdAt]',
  /* ... 나머지 테이블 전체 ... */
}).upgrade((trans) =>
  trans.table('tarotSessions').toCollection().modify((s) => {
    s.cardKeys = (s.draws ?? []).map((d: DrawnCard) => d.cardKey)
  })
)
```

> **주의**: `upgrade()` 콜백 안에서는 **인자로 받은 `trans`의 테이블만** 사용한다. 새 트랜잭션을 열거나 `db.table(...)`을 직접 호출하면 업그레이드 트랜잭션이 중단된다.
> 각 `version(N).stores()`는 그 버전의 **전체 스키마**다. 한 버전에서 빼먹은 테이블은 삭제로 해석되므로 매 버전 전체를 나열한다.

---

## 9. 서버 동기화 대비 구조

로컬 전용으로 시작하더라도 아래 4가지는 **처음부터** 넣어 두는 편이 싸다.

### 9.1 PK를 문자열 UUID로

```typescript
// ❌ 나중에 서버 동기화 시 기기 간 ID 충돌
subjects: '++id, ...'

// ✅ 처음부터 전역 유일
const id = crypto.randomUUID()
subjects: 'id, ...'
```

Dexie Cloud를 쓸 계획이라면 동기화 대상 테이블의 PK를 `@id`(서버가 보장하는 전역 유일 ID)로 선언한다. 자동 증가 정수 PK에서 출발했다면 전 테이블 ID 재발급 + 모든 외래키 재작성이라는 대형 마이그레이션을 치러야 한다.

```typescript
// Dexie Cloud 사용 시
subjects: '@id, kind, updatedAt, [kind+updatedAt]',
```

### 9.2 동기화 메타 + tombstone

```typescript
interface SyncMeta {
  updatedAt: string          // LWW 비교 기준 (ISO 8601, 항상 UTC)
  deviceId?: string          // 동일 시각 tie-break
  syncedAt?: string          // 마지막 성공 동기화
  deletedAt?: string         // ★ 하드 삭제 금지 — 삭제도 동기화 대상
}
```

하드 삭제하면 다른 기기에서 "없어진 레코드"와 "아직 못 받은 레코드"를 구분할 수 없어 **삭제한 것이 부활**한다. 모든 삭제는 `deletedAt` 설정 + 조회 시 필터로 처리하고, 충분히 오래된 tombstone만 주기적으로 물리 삭제한다.

### 9.3 충돌 해결 — LWW로 충분한가

| 데이터 | 전략 | 이유 |
|--------|------|------|
| `BirthInput`, `Subject` | LWW (updatedAt 최신 승) | 거의 수정되지 않고 단일 사용자 편집 |
| `TarotSession`, `PalmSession` | **불변(append-only)** | 이미 뽑힌 카드는 바뀌지 않는다. 충돌 자체가 없다 |
| `Reading` | append-only + `pinned`만 LWW | 해석은 추가되지 개정되지 않는다 |
| `DailyFortune` | 동기화 제외(로컬 캐시) | 재생성 가능한 파생 데이터를 굳이 전송하지 않는다 |

**설계 요령**: 모델을 최대한 **append-only**로 만들면 CRDT가 필요 없어진다. 운세 도메인은 본질적으로 "시점 기록"이라 이 성질이 잘 맞는다.

### 9.4 syncScope로 전송 대상 분리

```typescript
const uploadable = await db.subjects
  .where('syncScope').equals('syncable')
  .toArray()
```

타인 Subject·손금 이미지·질문 원문처럼 **기본 비전송** 대상은 필드로 못 박아 두어야 나중에 실수로 업로드되지 않는다. "동기화하지 않기로 했다"는 코드 주석이 아니라 데이터에 남아야 한다.

---

## 10. 개인정보·암호화 전략

### 10.1 무엇이 민감한가

| 데이터 | 민감도 | 근거 |
|--------|:---:|------|
| 생년월일시 + 성별 + 이름 | 높음 | 그 자체로 개인 식별성이 높고, 타인의 것이면 제3자 정보다 |
| 타로 질문 원문 | 매우 높음 | "이혼해야 할까", "이 병이 나을까" — 건강·성생활·신념 등 **민감정보**에 직결되는 서술이 흔하다 |
| 손금 사진 | 높음 | 생체 특징 논란(섹션 5) |
| 해석 결과 | 중간 | 질문·원국이 역추론될 수 있다 |
| 일일 운세 캐시 | 낮음 | 재생성 가능한 파생값 |

### 10.2 로컬 우선 + 선택적 암호화

**IndexedDB는 평문 저장이다.** 동기화를 하지 않아도 공유 PC·브라우저 확장·디스크 접근 경로가 남는다. 앱 성격에 맞춰 아래 3단계 중에서 고른다.

| 단계 | 방식 | 적합 |
|------|------|------|
| 1. 평문 | 기본 | 개인 기기 전용·질문 텍스트 미저장 앱 |
| 2. 필드 선택 암호화 | `dexie-encrypted` 등 미들웨어 | 질문·해석·생년월일시만 보호 |
| 3. 전체 암호화 + 사용자 비밀번호 | WebCrypto 직접 구현 | 타인 사주·손금까지 다루는 앱 |

**`dexie-encrypted`의 결정적 제약**: **인덱스는 암호화할 수 없다.** 암호화하면 `where()`가 불가능해지기 때문이다. 설정은 테이블별로 `NON_INDEXED_FIELDS`(인덱스 제외 전부 암호화), `UNENCRYPTED_LIST`(지정 필드만 평문), `ENCRYPT_LIST`(지정 필드만 암호화) 중에서 고른다. 기본 암호 구현은 TweetNaCl이며(WebCrypto는 동기 API가 없어 IndexedDB 트랜잭션과 궁합이 나쁘다는 것이 공식 설명), 커스텀 암복호 함수를 주입할 수도 있다.

> 도입 전 최신 릴리스·유지보수 상태를 확인한다. 요구가 단순하면 직접 구현(암호문 `Uint8Array` 필드 저장)이 통제하기 쉽다.
>
> **버전·유지보수 상태(2026-09-28 확인)**: npm 안정 태그는 `2.0.0`(2020-11 배포, ~5년 경과)에 머물러 있지만, GitHub(`dexie/dexie-encrypted`)는 archived 상태가 아니며 `4.2.0-beta.2`(2026-03 배포, Dexie 3.x/4.x 공통 지원)까지 베타 채널로 유지보수가 이어지고 있다(2026-03 최종 push, open issues 2건). 즉 **npm 최신 안정판(2.0.0)은 Dexie 3.x 세대 기준이라 Dexie 4.x 프로젝트에서 쓰려면 베타 태그(`4.2.0-beta.x`)를 명시적으로 설치**하거나 직접 구현을 검토해야 한다. 근거: `https://registry.npmjs.org/dexie-encrypted`(npm registry), `https://github.com/dexie/dexie-encrypted`(GitHub API).

### 10.3 그래서 인덱스 설계가 곧 프라이버시 설계다

암호화하는 순간 **인덱스에 남은 필드만 평문**이 된다. 본 스킬의 스키마가 `birthDate`·`question`·`content`를 **하나도 인덱싱하지 않은** 것은 우연이 아니다.

```typescript
// ❌ 암호화해도 생년월일이 인덱스에 평문으로 남는다
birthInputs: 'id, subjectId, birthDate, gender'

// ✅ 식별자·시각만 인덱싱. 나머지 필터는 메모리에서
birthInputs: 'id, subjectId, updatedAt'
```

날짜 범위 검색이 꼭 필요하면 원본 대신 **거칠게 만든 파생 키**(예: 출생 연도만, 또는 앱 키로 만든 HMAC 버킷)를 인덱싱한다.

### 10.4 키 관리

```typescript
// 사용자 비밀번호 → 키 파생 (키 자체를 저장하지 않는 가장 단순한 안전판)
async function deriveKey(password: string, salt: Uint8Array) {
  const base = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 310_000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,                       // extractable: false
    ['encrypt', 'decrypt'],
  )
}
```

- `salt`는 `settings` 테이블에 평문 보관해도 된다(비밀이 아니다). **비밀번호와 파생 키는 저장하지 않는다.**
- 비밀번호 없이 "기기 고정 키"를 쓰려면 `extractable: false`인 `CryptoKey`를 IndexedDB에 저장하는 방식이 있다. `CryptoKey`는 structured clone 대상이라 저장·복원이 가능하고, 복원해도 비추출 속성이 유지되어 스크립트가 원문 키를 읽을 수 없다.
  > **주의**: 브라우저·키 종류에 따라 저장 시 `DataCloneError`가 보고된 이력이 있다(Firefox 버그 트래커). 도입 시 대상 브라우저에서 **실제 저장·복원 왕복 테스트**를 하고, 실패하면 비밀번호 파생 방식으로 폴백하라.
- 어느 방식이든 **키를 잃으면 데이터도 잃는다.** 복구 문구(recovery phrase) 또는 평문 export 백업 경로를 반드시 함께 설계한다.

### 10.5 서버 전송 시 최소화

```
필요한 것만 보낸다:
  LLM 해석 요청 → 원국(간지 8글자)·질문 텍스트만.
  이름·생년월일 원본·성별 실명은 보내지 않는다.
  → 프롬프트 조립 시 Subject.displayName을 '의뢰인'으로 치환
```

`Reading.promptVersion`에 이 치환 정책 버전을 함께 기록해 두면 "어느 시점부터 실명이 안 나갔는지" 감사할 수 있다.

---

## 11. 일일 운세 캐시

```typescript
interface DailyFortune {
  id: string
  subjectId: string
  date: string               // 'YYYY-MM-DD' — ★ KST 기준 고정
  kind: 'daily' | 'weekly' | 'monthly' | 'yearly'
  content: string
  source: 'llm' | 'rule'
  engineVersion?: string
  model?: string
  generatedAt: string
  expiresAt: string          // 정리용
}
```

| 결정 | 이유 |
|------|------|
| `&[subjectId+date+kind]` 유니크 | 같은 날 중복 생성·중복 과금 방지. DB가 강제하므로 앱 레이어 실수를 막는다 |
| 날짜 경계는 **KST 고정** | 기기 타임존을 따르면 해외에서 "오늘 운세"가 두 번 바뀐다. 한국 운세 도메인은 KST 자정이 자연스러운 경계다 |
| `expiresAt` 인덱스 | 앱 시작 시 만료분 일괄 삭제. 캐시는 무한 누적되면 안 된다 |
| 동기화 제외 | 언제든 재생성 가능한 파생 데이터 |

```typescript
export async function getDailyFortune(subjectId: string, kstDate: string) {
  const cached = await db.dailyFortunes
    .where('[subjectId+date+kind]')
    .equals([subjectId, kstDate, 'daily'])
    .first()
  if (cached) return cached

  const generated = await generateDaily(subjectId, kstDate)
  try {
    await db.dailyFortunes.add(generated)
  } catch {
    // 동시 호출로 유니크 위반(ConstraintError) → 먼저 만들어진 것을 쓴다
    return db.dailyFortunes
      .where('[subjectId+date+kind]')
      .equals([subjectId, kstDate, 'daily'])
      .first()
  }
  return generated
}
```

---

## 12. 흔한 실수

| 실수 | 결과 | 대신 |
|------|------|------|
| 계산 결과만 저장하고 `BirthInput` 폐기 | 엔진 수정 시 복구 불가 | 입력은 영구 보존, 결과는 캐시 |
| `engineVersion` 없이 원국 저장 | 앱 업데이트 후 낡은 값이 조용히 표시됨 | `EngineStamp` + 지연 재계산 |
| `boolean` 필드를 인덱싱 | **에러 없이** 인덱스에서 누락 → 조회 0건 | `0`/`1` 정수 플래그 |
| 출생 시각을 `Date`로 저장 | 표준시·서머타임 이력에 따라 시주가 흔들림 | 벽시계 문자열 + IANA tz ID |
| "시각 모름"을 `00:00`으로 대체 | 자시로 계산되어 **틀린 시주**가 확정됨 | `timeAccuracy: 'unknown'` + `hour: null` |
| 타로 위치 의미를 코드 상수로 | 문구 수정이 과거 리딩에 소급 적용 | `SpreadDefinition` + `spreadVersion` 스냅샷 |
| 손금 원본 사진 무조건 보관 | 용량·법적 위험, 축출 대상 | 기본 `retentionMode: 'none'` |
| 가족 사주를 본인과 같은 취급 | 타인 정보가 동의 없이 서버로 | `Subject.kind` + `syncScope` + 동의 필드 |
| 하드 삭제 | 동기화 시 삭제 레코드 부활 | `deletedAt` tombstone |
| `++id` 정수 PK로 시작 후 동기화 추가 | 기기 간 ID 충돌, 전면 마이그레이션 | 처음부터 UUID(또는 Dexie Cloud `@id`) |
| `upgrade()` 안에서 전량 재계산 | DB 오픈 지연·롤백 위험 | 플래그만 찍고 조회 시 계산 |
| 질문 텍스트를 인덱싱 | 암호화해도 평문 노출 | 인덱스는 식별자·시각만 |
