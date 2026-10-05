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
> 검증일: 2026-09-28 (최초 2026-09-10)
> 대상 버전: Dexie 4.4.6 (2026-09-28 기준 최신 안정 — 09-10 시점 4.4.5, patch 릴리스로 스키마 문법·API 변경 없음. v5 없음)

> **짝 스킬 안내 (설치된 경우 참조)**
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

> 상세 레퍼런스 (타로·손금 세션 모델, Reading 공통 테이블, Dexie 스키마, 마이그레이션 패턴, 서버 동기화 대비 구조, 개인정보·암호화 전략, 일일 운세 캐시, 흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
