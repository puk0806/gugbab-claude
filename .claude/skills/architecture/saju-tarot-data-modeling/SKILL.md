---
name: saju-tarot-data-modeling
user-invocable: false
description: 운세 앱(사주·타로·손금)의 로컬 우선 데이터 모델 설계 스킬. 출생 입력(양/음력·윤달·시각 불명·성별)과 계산 결과(사주 원국·십성·대운·오행 분포)의 분리, 계산 로직 버전 필드로 파생 캐시 무효화, 타로 세션(덱·스프레드 정의 버전·정역방향·셔플 시드)·손금 세션(원본 사진 최소 저장·Vision 결과)·일일 운세 캐시 모델링, 조회 대상(Subject) 분리로 본인/타인(가족·친구) 개인정보 취급 플래그, Dexie 4.x 스키마(`&[a+b]` 복합 유니크·`*multi-entry`·boolean 인덱스 금지)와 `.upgrade()` 마이그레이션, 서버 동기화 대비 UUID/`@id` PK·tombstone·LWW, 생년월일시 암호화(dexie-encrypted 인덱스 한계·WebCrypto 키 보관) 전략. 짝 스킬 `frontend/indexeddb-dexie`는 Dexie 사용법 자체를, `humanities/palmistry-limitations`는 손 사진 개인정보 취급의 콘텐츠 측 근거를 다룬다.
---

# saju-tarot-data-modeling — 운세 앱(사주·타로·손금) 데이터 모델링

> 소스:
> - Dexie 공식 — https://dexie.org/
> - Dexie Version.stores() — https://dexie.org/docs/Version/Version.stores()
> - Dexie IndexSpec — https://dexie.org/docs/IndexSpec
> - Dexie Indexable Type — https://dexie.org/docs/Indexable-Type
> - Dexie Version.upgrade() — https://dexie.org/docs/Version/Version.upgrade()
> - dexie-encrypted — https://dexie.org/docs/libs/dexie-encrypted
> - Dexie Cloud — https://dexie.org/cloud/
> - MDN IndexedDB Basic Terminology — https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology
> - MDN StorageManager.estimate() — https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate
> - W3C IndexedDB issue #76 (boolean 키) — https://github.com/w3c/IndexedDB/issues/76
> - 개인정보 보호법 / 시행령 제18조(민감정보의 범위) — https://www.law.go.kr/LSW/lsInfoP.do?lsId=011357
> - 한국천문연구원 음양력·특일(24절기) 정보 OpenAPI — https://astro.kasi.re.kr/information/pageView/31 , https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15012690
> - 사주팔자 / 대운 (한국어 위키백과) — https://ko.wikipedia.org/wiki/사주팔자 , https://ko.wikipedia.org/wiki/대운_(사주팔자)
> - Rider–Waite Tarot (Wikipedia) — https://en.wikipedia.org/wiki/Rider–Waite_Tarot
>
> 검증일: 2026-09-10
> 대상 버전: Dexie 4.4.5 (2026-09 기준 최신 안정, v5 없음)

> **짝 스킬 안내**
> - `frontend/indexeddb-dexie` — Dexie API 사용법 자체(스키마 문법·쿼리·트랜잭션·`useLiveQuery`)
> - `architecture/dream-journal-data-modeling` — 같은 계열의 로컬 우선 도메인 모델링(꿈 일기). 공통 패턴은 중복 설명하지 않는다
> - `meta/fortune-interpretation-prompt-engineering` — 운세 *콘텐츠* 톤("재미로 보는" 한 줄 고지·hedging). 본 스킬의 `disclaimerVersion`·동의 필드는 그 고지 문구 버전을 데이터로 고정하기 위한 것이다

---

## 언제 사용하나

- 사주·타로·손금 중 **둘 이상**을 한 앱에서 다루며 데이터 모델을 처음 설계할 때
- 계산 결과(원국·대운)를 **저장할지 매번 재계산할지** 결정해야 할 때
- 본인 외 **가족·친구 사주**를 등록·조회하는 기능이 있어 타인 개인정보 취급이 걸릴 때
- 로컬(IndexedDB) 우선으로 시작하되 **나중에 서버 동기화**를 붙일 여지를 남겨야 할 때
- LLM 해석 결과를 저장하면서 **재현성·비용·캐시 무효화**를 관리해야 할 때

## 언제 사용하지 않나

- 서버에서 전부 계산·저장하고 클라이언트는 표시만 하는 **서버 우선** 앱 → 로컬 스키마 설계 자체가 불필요(단, 섹션 3·9의 버전 필드·동의 모델은 서버에서도 유효)
- 타로 **1종만** 있는 단순 앱 → 세션 테이블 1개면 충분. 본 스킬의 Subject 분리는 과설계
- 사주 **계산 알고리즘 구현** 자체가 목적 → 본 스킬은 계산 결과를 *담는 그릇*만 다룬다. 절기·만세력 데이터는 한국천문연구원(KASI) 음양력/24절기 OpenAPI 또는 KASI 데이터 기반 라이브러리를 사용하고, 그 선택은 별도 조사 대상이다

---

## 1. 엔티티 지도

```
Subject (조회 대상: 나 / 가족 / 친구)
  ├─ BirthInput      (출생 입력 — 원본, 절대 폐기 금지)
  ├─ SajuChart       (원국 — 파생 캐시, engineVersion 종속)
  ├─ TarotSession    (뽑기 1회)
  ├─ PalmSession     (손금 분석 1회)
  └─ DailyFortune    (일일 운세 캐시, [subjectId+date+kind] 유니크)

Reading (해석 결과 — 사주·타로·손금 공통, 다형 참조)
Deck / SpreadDefinition (타로 마스터 데이터, 버전 보관)
```

**핵심 분리 원칙 3가지**

| 원칙 | 내용 | 위반 시 |
|------|------|---------|
| 입력 ≠ 파생 | 사용자가 넣은 값(BirthInput)과 계산기가 만든 값(SajuChart)을 같은 레코드에 섞지 않는다 | 계산 엔진 수정 시 원본을 잃어 재계산 불가 |
| 대상 ≠ 계정 | 앱 사용자(UserProfile)와 사주를 보는 대상(Subject)을 분리한다 | 가족 사주 추가 시 스키마 파열, 타인 정보 취급 플래그를 걸 자리가 없음 |
| 해석 ≠ 결과 | 결정론적 계산(원국·뽑힌 카드)과 비결정론적 해석(LLM 문장)을 분리한다 | 모델 교체 시 계산 결과까지 날아감, 재현성 추적 불가 |

---

## 2. Subject — 조회 대상과 타인 정보 플래그

```typescript
type PersonKind = 'self' | 'family' | 'friend' | 'other'

interface Subject {
  id: string                 // UUID (섹션 9 참조: ++id 대신 문자열 PK)
  kind: PersonKind
  displayName: string        // 별칭 권장 ('엄마', 'K') — 실명 강제하지 않는다
  relation?: string          // 자유 입력 ('직장 동료')
  isSelf: 0 | 1              // ★ boolean 아님 (섹션 7)
  thirdPartyConsent?: ThirdPartyConsent   // kind !== 'self'일 때만
  syncScope: 'local-only' | 'syncable'    // 기본값: 타인 = 'local-only'
  createdAt: string          // ISO 8601 문자열
  updatedAt: string
  deletedAt?: string         // tombstone (하드 삭제 대신)
}

interface ThirdPartyConsent {
  acknowledgedAt: string     // "본인 동의를 받았음"을 사용자가 확인한 시각
  method: 'verbal' | 'written' | 'unknown'
  allowServerUpload: boolean // 서버 전송 허용 여부 — 기본 false
  note?: string
}
```

**왜 타인 정보를 따로 표시하나**

- 가족·친구의 생년월일시는 **그 사람의 개인정보**다. 사용자가 순수 개인 용도로 자기 기기에만 두는 것과, 앱 사업자의 서버로 올라가 사업자가 처리자가 되는 것은 법적 성격이 다르다. 후자는 정보주체 동의 등 별도 처리 근거가 필요하다.
- 그래서 `syncScope`를 **필드로 강제**하고, 타인 Subject는 기본 `local-only`로 만든다. 업로드는 `thirdPartyConsent.allowServerUpload === true`인 경우에만.
- 대상이 만 14세 미만 아동이면 법정대리인 동의 요건(개인정보 보호법 제22조의2)이 별도로 걸린다. `BirthInput`으로 나이를 계산할 수 있으므로, 아동 판정은 *저장 시점*이 아니라 *업로드 시점*에 재평가한다.

> **주의**: 위 법 해석은 설계 시 고려해야 할 위험 신호를 표시하기 위한 것이지 법률 자문이 아니다. 실제 서비스 출시 전 개인정보 처리방침·동의 UI는 전문가 검토를 받는다. 손 사진 개인정보 취급의 콘텐츠 측 근거는 `humanities/palmistry-limitations` §6 참조.

**UserProfile은 별도**

```typescript
interface UserProfile {
  id: string
  selfSubjectId?: string     // 본인 Subject로의 포인터
  locale: string             // 'ko-KR'
  timeZone: string           // 'Asia/Seoul'
  encryptionEnabled: boolean
  disclaimerVersion: string  // 동의한 면책 고지 버전
  createdAt: string
}
```

Subject와 UserProfile을 합치면 "친구 사주를 보다가 앱 설정이 바뀌는" 모델이 된다. 항상 1:N(계정 1 : 대상 N)으로 둔다.

---

## 3. 사주 원국 — 입력과 계산 결과 분리

### 3.1 BirthInput (원본 입력)

```typescript
interface BirthInput {
  id: string
  subjectId: string

  calendar: 'solar' | 'lunar'       // 양력 / 음력
  isLeapMonth?: boolean             // 음력 윤달 여부 (calendar === 'lunar')
  birthDate: string                 // 'YYYY-MM-DD' — Date 객체 아님 (아래 참조)
  birthTime?: string                // 'HH:mm' — 시각 불명이면 undefined
  timeAccuracy: TimeAccuracy
  gender: 'male' | 'female' | 'unspecified'

  birthPlace?: {                    // 진태양시 보정용 (선택)
    label?: string                  // '서울'
    longitude?: number
    latitude?: number
  }
  timeZone: string                  // 'Asia/Seoul' — IANA ID

  createdAt: string
  updatedAt: string
}

type TimeAccuracy =
  | 'exact'       // 출생증명서 등 정확
  | 'approx'      // "저녁쯤" 수준
  | 'unknown'     // 모름 → 시주 생략(삼주)
```

**설계 결정 표**

| 결정 | 이유 |
|------|------|
| `birthDate`/`birthTime`을 **문자열**로 저장 (Date 객체 X) | `Date`는 UTC 순간(instant)으로 직렬화된다. 한국 표준시는 역사적으로 동경 127.5도(UTC+08:30)와 135도(UTC+09:00)를 오갔고 서머타임 시행 구간(1988년 서울 올림픽 전후 UTC+10:00 등)도 있어, "벽시계 1953-06-01 23:10"을 Date로 바꾸면 *라이브러리·런타임의 tz 해석*에 결과가 좌우된다. 원본은 **사용자가 본 벽시계 값 그대로** 보존하고 UTC 변환은 파생값으로 둔다 |
| 문자열이라 인덱스 손해 없음 | IndexedDB 키로 string은 유효하고 `'YYYY-MM-DD'`는 사전순 = 시간순이다 |
| `timeAccuracy`를 별도 필드로 | `birthTime === undefined` 하나로는 "모름"과 "아직 입력 안 함"이 구분되지 않는다. 시각 불명은 시주(時柱)를 세우지 못하는 *도메인 사건*이므로 명시 표현이 필요 |
| `timeZone`을 항상 저장 | 해외 출생 대응 + 계산기가 과거 표준시 이력을 적용할 근거 |
| `calendar`/`isLeapMonth` 보존 | 음력 → 양력 변환은 KASI 기준으로도 라이브러리마다 경계 케이스가 갈린다. 변환 결과만 저장하면 나중에 검증·정정이 불가능 |

> **주의(부분 미검증)**: 한국 표준시의 정확한 변경 시행 일시(1954-03-21 UTC+08:30 전환, 1961년 UTC+09:00 복귀)와 1988년 이전 서머타임 구간 전체는 자료마다 서술이 갈린다. 앱에서 이를 하드코딩하지 말고 **IANA tz 데이터(`Asia/Seoul`)를 쓰는 라이브러리에 위임**하고, 적용된 규칙 버전을 `SajuChart.engine`에 기록하라.

### 3.2 SajuChart (계산 결과 = 파생 캐시)

```typescript
type HeavenlyStem = '갑'|'을'|'병'|'정'|'무'|'기'|'경'|'신'|'임'|'계'
type EarthlyBranch = '자'|'축'|'인'|'묘'|'진'|'사'|'오'|'미'|'신'|'유'|'술'|'해'
type FiveElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water'

type TenGod =
  | '비견' | '겁재' | '식신' | '상관' | '편재'
  | '정재' | '편관' | '정관' | '편인' | '정인'

interface Pillar {
  stem: HeavenlyStem
  branch: EarthlyBranch
  stemTenGod?: TenGod        // 일간 기준 — 일주 천간 자신은 제외
  branchTenGods?: TenGod[]   // 지장간 기준(유파에 따라 개수 상이)
}

interface DaeunEntry {
  index: number              // 0부터
  startAge: number           // 대운수 기준 시작 나이
  startAt: string            // 'YYYY-MM-DD' (환산된 시작 시점)
  pillar: Pillar
}

interface SajuChart {
  id: string
  subjectId: string
  birthInputId: string       // ★ 어떤 입력으로 계산했는지

  pillars: {
    year: Pillar
    month: Pillar
    day: Pillar               // 일간 = day.stem (십성 기준점)
    hour: Pillar | null       // timeAccuracy === 'unknown' → null
  }
  elementCounts: Record<FiveElement, number>   // 오행 분포
  daeun: {
    direction: 'forward' | 'reverse'           // 순행 / 역행
    startAge: number                           // 대운수
    entries: DaeunEntry[]
  }

  rulesetId: RulesetId       // ★ 복합 인덱스용 최상위 복제 필드
  engine: EngineStamp        // ★ 섹션 3.3
  computedAt: string
  stale: 0 | 1               // 엔진/룰셋 불일치 감지 시 1
}
```

- **십성(十星)**은 일간(일주의 천간)을 기준으로 다른 간지와의 관계를 10가지로 분류한 것이다. 즉 `day.stem`이 바뀌면 나머지 전부가 바뀌는 **파생값**이므로 절대 수기로 편집 가능한 필드로 두지 않는다.
- **대운 방향**은 연간(年干)의 음양과 성별 조합으로 갈린다(통설: 양간 남자·음간 여자 순행, 그 반대는 역행). **대운수**는 출생일에서 인접 절입일까지의 일수를 3으로 나눠 산출하며, 대운은 10년 주기다.
- **월주**는 달력 월이 아니라 **절기(12절)** 기준으로 바뀌고, 연주도 입춘을 경계로 바뀐다. 즉 원국 계산은 절기 데이터(KASI 24절기)에 종속된다 — 데이터 소스 자체가 버전 관리 대상이다.
- **시주**는 자시(子時) 처리 방식(야자시/조자시 등)에서 유파가 갈린다. 같은 입력이 **다른 결과**를 내는 것이 정상이므로, 결과에는 반드시 어떤 규칙으로 계산했는지가 붙어야 한다.

### 3.3 저장 vs 재계산 — 트레이드오프와 결론

| 전략 | 장점 | 단점 |
|------|------|------|
| **A. 매번 재계산** (저장 안 함) | 낡은 값이 원천적으로 없음, 저장 용량 최소, 엔진 수정이 즉시 반영 | 목록·통계 화면에서 N건 일괄 계산 비용, 절기 데이터 로딩 필요(오프라인 취약), LLM 해석이 참조한 원국을 사후 재현 못 함 |
| **B. 결과 저장** (캐시) | 조회 빠름, 오프라인 강함, 해석과 원국의 1:1 대응 보존 | **엔진·룰셋이 바뀌면 저장값이 낡는다** |
| **C. B + 버전 스탬프** ✅ 권장 | B의 이점 + 불일치 자동 감지·지연 재계산 | 필드·마이그레이션 코드가 늘어남 |

```typescript
interface EngineStamp {
  engineVersion: string          // 계산 로직 버전 — semver 권장 '2.1.0'
  rulesetId: RulesetId           // 유파/옵션 조합
  solarTermDataVersion: string   // 절기 데이터 스냅샷 버전 'kasi-2026.03'
  tzDataVersion?: string         // 'tzdata-2026a'
}

type RulesetId =
  | 'kr-standard'        // 표준시 기준, 진태양시 미보정
  | 'kr-true-solar'      // 경도 기반 진태양시 보정
  | 'kr-early-late-zi'   // 야자시/조자시 분리 적용
```

**무효화는 "쓰기 시 일괄 갱신"이 아니라 "읽기 시 지연 재계산"으로 한다.**

```typescript
const CURRENT: EngineStamp = {
  engineVersion: '2.1.0',
  rulesetId: 'kr-standard',
  solarTermDataVersion: 'kasi-2026.03',
}

function isStale(chart: SajuChart, cur = CURRENT): boolean {
  return (
    chart.engine.engineVersion !== cur.engineVersion ||
    chart.engine.rulesetId !== cur.rulesetId ||
    chart.engine.solarTermDataVersion !== cur.solarTermDataVersion
  )
}

export async function getChart(subjectId: string): Promise<SajuChart> {
  const chart = await db.sajuCharts
    .where('[subjectId+rulesetId]')
    .equals([subjectId, CURRENT.rulesetId])
    .first()

  if (chart && !isStale(chart)) return chart

  const input = await db.birthInputs.where('subjectId').equals(subjectId).first()
  if (!input) throw new Error('BirthInput not found')

  const fresh = computeSaju(input, CURRENT)   // 순수 함수
  await db.sajuCharts.put({ ...fresh, id: chart?.id ?? crypto.randomUUID() })
  return fresh
}
```

- 앱 시작 시 전체 재계산(eager)은 **하지 않는다**. 수천 건이면 시작이 느려지고, 사용자가 다시 열지 않을 대상까지 계산한다.
- 대신 마이그레이션에서 `stale = 1`만 찍고(섹션 8), 실제 계산은 조회 시점에 한다.
- **`engineVersion`은 계산 결과가 달라질 때만 올린다.** 포매팅·주석 변경으로 올리면 전량 무효화가 발생한다.
- 룰셋별로 결과를 **함께 보관**할 수 있게 `[subjectId+rulesetId]`를 키로 잡았다. 사용자가 "야자시 적용"으로 토글해도 이전 결과가 남아 비교가 가능하다.

> **주의**: `computeSaju`는 반드시 **순수 함수**여야 한다(같은 입력 + 같은 스탬프 → 같은 출력). `new Date()`·로케일·기기 타임존을 함수 내부에서 읽으면 캐시 검증이 성립하지 않는다.

---

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
  model?: string             // 'claude-opus-5'
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