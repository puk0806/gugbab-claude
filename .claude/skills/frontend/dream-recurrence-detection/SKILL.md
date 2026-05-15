---
name: dream-recurrence-detection
description: >
  사용자 꿈 일지에서 반복 패턴(recurrent pattern)을 자동 감지하는 3단 알고리즘 — 태그 카운팅, 임베딩 cosine 유사도, LLM 분류 — 설계 가이드. 빈도·정서·시점 윈도우 기준, Dexie multiEntry index 쿼리, 임베딩 저장, hedging 알림 UX, 개인정보 처리까지 다룬다.
---

# Dream Recurrence Detection

> 소스: 학술 — Zadra (1996) *Trauma and Dreams* ch.17 (Harvard UP) https://www.degruyter.com/document/doi/10.4159/9780674270534-019/html / Zadra & Pihl (1997) *Psychotherapy and Psychosomatics* 66, 50-55 / Domhoff (2003) *The Scientific Study of Dreams* (APA) https://dreams.ucsc.edu/TSSOD/The_Scientific_Study_of_Dreams_2003.pdf · 기술 — OpenAI Embeddings https://developers.openai.com/api/docs/guides/embeddings / Dexie MultiEntry Index https://dexie.org/docs/MultiEntry-Index
> 검증일: 2026-05-15
> 짝 스킬: `frontend/dream-symbol-tagging`, `architecture/dream-journal-data-modeling`, `humanities/dream-content-research`

---

## 0. 이 스킬이 다루는 범위

| 다룬다 | 다루지 않는다 |
|--------|---------------|
| 같은 사용자의 *반복 패턴* 감지 알고리즘 3종 | 꿈 *의미* 해석 (→ humanities) |
| 빈도·정서·시점 윈도우 기준 정의 | 태그 추출 자체 (→ dream-symbol-tagging) |
| Dexie multiEntry index 쿼리 패턴 | DB 스키마 전반 (→ dream-journal-data-modeling) |
| 임베딩 저장 형식·외부 API 동의 UX | 임상 진단·정신과 평가 |
| hedging 톤 알림 UX | 약물·치료 권고 |

---

## 1. 반복 꿈(recurrent dream) 정의

### 1-1. 학술 정의

Zadra (1996)의 정의를 따른다:

> "Recurrent dreams are typically defined as a class of dreams that reoccur over time **while maintaining not only the same theme, but the same content**."

핵심 요건:
- **테마(theme)만 같으면 부족** — 같은 *내용(content)*까지 재현되어야 *진짜* recurrent
- 단순 *유사 주제(themetic similarity)*는 "recurrent theme"으로 구분해서 표기

### 1-2. 빈도 기준

학술 연구는 **단일 절대 기준**을 제시하지 않는다. 본 스킬은 다음 *조작적 정의(operational definition)*를 권장한다:

| 기준 | 권장 값 | 근거 |
|------|---------|------|
| 빈도 | 4주 윈도우 내 3회 이상 | 단기 반복은 *현재 stressor* 신호로 해석 |
| 시점 분산 | 같은 주에 몰리면 *동일 트리거 1회* 가능성 | 최소 2개 이상의 서로 다른 주에 분포 권장 |
| 정서 일치 | 같은 상징이라도 *정서*가 같아야 진짜 반복 | Domhoff 2003 continuity hypothesis |

> 주의: 위 빈도 값(4주/3회)은 학술 표준이 아닌 *본 스킬의 권장 조작 기준*이다. 실제 사용 시 사용자 표본 수에 맞춰 조정한다.

### 1-3. 유병률 (참고)

> Recurrent dreams occur in **60-75% of adults**, more often in women than men (Zadra, 1996).

알림 문구에 *희소성·이상 신호*로 단정하지 않도록 주의. 다수가 경험하는 정상 현상.

---

## 2. 감지 알고리즘 3종

세 알고리즘은 *대체*가 아닌 *보완* 관계다. 비용·정확도·프라이버시 트레이드오프에 따라 조합한다.

### 2-1. 태그 기반 카운팅 (1차 필터)

**전제:** `dream-symbol-tagging` 스킬로 각 꿈에 `tags: string[]`이 부여되어 있다.

**알고리즘:**
1. Dexie multiEntry index 정의: 스키마 문자열에 `*tags`
2. 윈도우 기간 내 dreams 쿼리 후 태그별 카운트
3. 임계치(예: 3회) 초과 태그를 *후보 반복 상징*으로 추출

```ts
// schema
db.version(1).stores({
  dreams: 'id, &date, *tags, *moods' // *tags = multiEntry index
});

// 4주 윈도우 내 특정 태그 카운트
const since = dayjs().subtract(4, 'week').toISOString();
const count = await db.dreams
  .where('tags').equals('water')
  .and(d => d.date >= since)
  .distinct() // multiEntry는 distinct 권장 (공식 가이드)
  .count();
```

**한계:**
- 동음이의 태그(예: 'water' = 익사 vs. 평온한 호수) 구분 불가
- 정서 정보 누락 → 2-3 단계로 보완

### 2-2. 임베딩 cosine 유사도 (2차 정교화)

**용도:** 같은 태그라도 *서사 구조·정서*가 유사한지 확인.

**모델 선택:** OpenAI `text-embedding-3-small`
- 차원: 기본 1536 (dimensions 파라미터로 축소 가능)
- 정규화: OpenAI 임베딩은 length 1로 정규화되어 있어 cosine = dot product
- 가격: 저비용 (대량 임베딩에 적합)

**알고리즘:**
1. 각 꿈 텍스트(내용 + 정서 라벨)를 임베딩 → Dexie에 `Float32Array` ArrayBuffer로 저장
2. 후보 태그를 공유하는 꿈 쌍의 cosine similarity 계산
3. 임계치 초과 쌍을 *진짜 반복*으로 판정

```ts
// 코사인 유사도 (정규화된 벡터 → dot product)
function cosineSim(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // 이미 정규화됨
}
```

**임계치 권장:**

| 용도 | 권장 임계치 | 근거 |
|------|------------|------|
| 엄격(같은 시나리오) | 0.75 ~ 0.82 | paraphrase 분류 연구의 보편 범위 |
| 완화(같은 테마) | 0.60 ~ 0.70 | 일반 semantic similarity 하한 |

> 주의: text-embedding-3-small은 이전 ada-002 대비 *낮은 cosine 값*을 산출하는 경향이 보고된다(OpenAI 커뮤니티). 임계치를 *경험적으로* 보정해야 하며, 본 권장값은 출발점이다.

**한계:**
- 표본 < 5개에서는 임계치 튜닝 불가능 → 1차 필터(2-1)로 후퇴
- 너무 낮은 임계치는 false positive 폭증 (모든 꿈이 "반복"으로 분류)

### 2-3. LLM 분류 (3차 해석)

**용도:** 1·2단계로 후보가 추려졌을 때, 정서·서사·상징의 *질적 일치*를 LLM에 판정 요청.

**프롬프트 패턴:**

```
다음은 같은 사용자의 최근 N개 꿈입니다.
[꿈 1] 날짜: ..., 내용: ..., 정서: ..., 태그: ...
[꿈 2] ...

이 꿈들 사이에서 다음을 식별하세요:
1. 반복되는 상징·시나리오 (있다면 명시)
2. 정서적 일관성 (같은 상징이라도 정서가 다르면 *진짜 반복 아님*으로 표기)
3. 확신도 (낮음/중간/높음) — 표본이 작으면 항상 *낮음*

판정만 출력. 의미 해석·진단은 출력 금지.
```

**한계:**
- 외부 API 호출 → *민감 정보 전송* 발생 → 사용자 동의 필수 (§4)
- LLM 환각 위험 → "확신도" 출력 강제로 hedging

---

## 3. 사용자 알림 UX

### 3-1. 알림 문구 원칙

| 원칙 | 예시 |
|------|------|
| **사실 보고 우선** | "최근 3주간 '물' 상징이 4번 나타났습니다" |
| **hedging 톤 의무** | "이는 우연일 수도, 무의식의 반복 신호일 수도 있다는 해석이 있습니다" |
| **진단 단정 금지** | ❌ "당신은 트라우마가 있습니다" |
| **표본 한계 고지** | "꿈 기록이 N개로 작아 패턴 신뢰도가 제한적입니다" |
| **사용자 주도** | "이 패턴을 *내가* 어떻게 느끼는지 메모해보세요" |

### 3-2. 학술적 근거 표기

알림 본문 또는 "왜 이런 알림이 보이나요?" 도움말에 다음을 노출:

```
참고:
- 반복 꿈은 성인의 60-75%가 경험하는 흔한 현상입니다 (Zadra 1996).
- 꿈 내용은 깨어있는 삶의 관심사와 연속성을 보인다는 견해가 있습니다 (continuity hypothesis, Domhoff 2003).
- 단, 이는 진단이 아니며 해석은 여러 학파에 따라 다릅니다.
```

### 3-3. 알림 빈도 제한

- 같은 상징에 대해 7일 내 1회만 알림
- 사용자가 "그만 보기" 선택 시 해당 상징 알림 영구 중단

---

## 4. 개인정보·동의

꿈 내용은 **민감 정보**로 취급한다.

### 4-1. 저장 원칙

| 데이터 | 저장 위치 |
|--------|----------|
| 꿈 원문·태그·정서 | 로컬 우선 (IndexedDB) |
| 임베딩 벡터 | 로컬 (Dexie ArrayBuffer) — 외부 벡터 DB 사용 시 사용자 동의 필수 |
| LLM 호출 프롬프트 | 사용자 동의 + 호출 직전 명시적 알림 |

### 4-2. 동의 UX

외부 API(임베딩 또는 LLM) 사용 전 다음을 *별도 화면*으로 고지:

```
이 기능은 당신의 꿈 내용을 [OpenAI / Anthropic] 서버로 전송합니다.
- 전송 데이터: 꿈 텍스트 (식별 정보 제외)
- 보관 정책: [공급자 정책 링크]
- 거부 가능: 거부해도 태그 기반 반복 감지는 사용 가능합니다.
```

체크박스 default OFF, 사용자 명시 동의 후 활성화.

---

## 5. Dexie 쿼리 패턴 (실무 코드)

### 5-1. 스키마 정의 (multiEntry)

```ts
import Dexie, { Table } from 'dexie';

interface Dream {
  id?: number;
  date: string; // ISO
  content: string;
  tags: string[];     // *tags — multiEntry
  moods: string[];    // *moods — multiEntry
  embedding?: ArrayBuffer; // Float32Array 직렬화
}

class DreamDB extends Dexie {
  dreams!: Table<Dream, number>;
  constructor() {
    super('dreams');
    this.version(1).stores({
      dreams: '++id, &date, *tags, *moods'
    });
  }
}
```

### 5-2. 윈도우 기반 상징 카운트

```ts
async function countSymbolInWindow(
  db: DreamDB,
  symbol: string,
  weeks: number
): Promise<number> {
  const since = dayjs().subtract(weeks, 'week').toISOString();
  return db.dreams
    .where('tags').equals(symbol)
    .filter(d => d.date >= since)
    .distinct() // multiEntry 공식 권장
    .count();
}
```

### 5-3. 후보 상징 추출 (전체 태그 빈도)

```ts
async function topRecurrentSymbols(
  db: DreamDB,
  weeks: number,
  minCount: number
): Promise<Array<{ symbol: string; count: number }>> {
  const since = dayjs().subtract(weeks, 'week').toISOString();
  const recent = await db.dreams.where('date').aboveOrEqual(since).toArray();

  const freq = new Map<string, number>();
  for (const d of recent) {
    for (const t of d.tags) freq.set(t, (freq.get(t) ?? 0) + 1);
  }

  return [...freq.entries()]
    .filter(([, c]) => c >= minCount)
    .map(([symbol, count]) => ({ symbol, count }))
    .sort((a, b) => b.count - a.count);
}
```

### 5-4. 임베딩 저장 (ArrayBuffer)

```ts
// Float32Array → ArrayBuffer
function packEmbedding(vec: number[]): ArrayBuffer {
  return new Float32Array(vec).buffer;
}

// ArrayBuffer → Float32Array
function unpackEmbedding(buf: ArrayBuffer): Float32Array {
  return new Float32Array(buf);
}
```

> 주의: IndexedDB는 ArrayBuffer를 structured clone으로 직렬화하므로 그대로 저장 가능. 단, 1536차원 × Float32(4byte) = 약 6KB/꿈 → 1만 개 누적 시 60MB. 사용량 모니터링 필요.

---

## 6. 흔한 함정

| 함정 | 결과 | 대응 |
|------|------|------|
| 작은 표본(N < 5)에서 패턴 단정 | false positive·과잉 해석 | UI에서 "표본이 작아 신뢰도 제한적" 명시, 임계치 충족해도 알림 자제 |
| 태그 매칭만 보고 정서 차이 무시 | "같은 물"인데 익사·평온 정반대 → 동일 반복으로 오판 | 2-2 또는 2-3으로 정서 일치까지 확인 |
| 임베딩 임계치 너무 낮음 | 모든 꿈이 "반복"으로 분류 | 0.6 이하 사용 자제. 사용자 데이터로 보정 |
| 반복 꿈을 *심각 신호*로 단정 | 사용자 불안 유발, 진단 오인 | hedging 톤 의무, "60-75%가 경험하는 흔한 현상" 학술 근거 노출 |
| 꿈 텍스트 그대로 외부 API 전송 (동의 누락) | 개인정보 침해 | 별도 동의 화면, 기본 OFF |
| 임베딩을 외부 벡터 DB에 *동의 없이* 업로드 | 임베딩에서 원문 일부 복원 가능성 보고됨 | 로컬 저장 원칙, 외부 사용 시 명시 동의 |
| LLM 출력을 *의미 해석*으로 사용 | 환각·진단 단정 위험 | 프롬프트에서 *판정만* 요청, 해석은 humanities 스킬로 분리 |

---

## 7. 짝 스킬과의 분담

| 스킬 | 책임 |
|------|------|
| `frontend/dream-symbol-tagging` | 꿈 텍스트 → tags/moods 추출 |
| **`frontend/dream-recurrence-detection` (이 스킬)** | tags/moods/임베딩 → 반복 패턴 감지 |
| `architecture/dream-journal-data-modeling` | DB 스키마·인덱스 설계 전반 |
| `humanities/dream-content-research` | 감지된 패턴의 학술적 해석 (continuity hypothesis 등) |

이 스킬은 *감지*까지만 책임진다. *의미·진단·치료* 영역은 humanities 또는 임상 전문가 영역.

---

## 8. 체크리스트 (구현 시 자가 점검)

- [ ] multiEntry index에 `distinct()` 적용했는가
- [ ] 윈도우 기간·최소 카운트가 *설정 가능*한가 (하드코딩 금지)
- [ ] 같은 상징 알림이 7일 내 1회로 제한되는가
- [ ] 외부 API 호출 전 사용자 동의 화면을 거치는가
- [ ] 알림 문구에 hedging 표현이 있는가 ("…일 수도 있습니다")
- [ ] 표본 < 5일 때 알림을 *자제*하거나 신뢰도 한계를 명시하는가
- [ ] 학술 근거(Zadra 1996, Domhoff 2003)가 도움말에서 접근 가능한가
- [ ] 임베딩 ArrayBuffer 크기가 사용량 모니터링에 포함되는가
