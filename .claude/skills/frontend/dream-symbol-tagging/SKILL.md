---
name: dream-symbol-tagging
description: >
  꿈 텍스트(자유 서술 한국어 문장)에서 주요 상징을 자동 추출·태깅하는 하이브리드 전략 가이드.
  룰 기반 사전 매칭과 LLM·임베딩 기반 의미 매칭을 결합해 결정론적 속도와 문맥 인지 정확성을
  동시에 확보한다. 한국어 형태소 처리 한계와 LLM JSON 출력 안정화 패턴을 함께 다룬다.
  <example>사용자: "꿈 일기 텍스트에서 '뱀'·'추락' 같은 상징을 자동으로 뽑아 태그로 붙이고 싶어요"</example>
  <example>사용자: "OpenAI 임베딩으로 사용자 꿈 문장과 상징 사전을 의미 유사도로 매칭하려면?"</example>
  <example>사용자: "Claude API로 꿈 상징 추출 JSON 받을 때 출력이 깨지면 어떻게 fallback 해야 하나요?"</example>
---

# Dream Symbol Tagging (꿈 상징 자동 추출·태깅)

> 소스:
> - OpenAI Embeddings Guide: https://platform.openai.com/docs/guides/embeddings
> - OpenAI text-embedding-3-small Model: https://platform.openai.com/docs/models/text-embedding-3-small
> - Anthropic Structured Outputs: https://platform.claude.com/docs/en/build-with-claude/structured-outputs
> - Anthropic Cookbook (Tool Use JSON 추출): https://github.com/anthropics/anthropic-cookbook/blob/main/tool_use/extracting_structured_json.ipynb
> - KoNLPy 공식: https://konlpy.org/en/latest/morph/
> - mecab-ko (Eunjeon Project): https://bitbucket.org/eunjeon/mecab-ko/
> 검증일: 2026-05-15

---

## 1. 언제 사용 / 언제 사용하지 않는가

| 사용 | 비사용 |
|------|--------|
| 한국어 꿈 일기에서 상징 키워드 자동 태깅 | 꿈 *해석* 의미를 LLM이 단정해 제공하는 챗봇 (윤리·신뢰성 문제) |
| 사전 + LLM·임베딩 하이브리드로 정확도·비용 균형 | 사용자 입력에 의료·정신과 진단을 결합하는 경우 |
| 태그를 `dream-journal-data-modeling` 스킬의 `tags[]` 필드에 저장 | 상징 사전 없이 LLM 단독으로 100% 자유 분류 (재현성 낮음) |

> 짝 스킬:
> - `architecture/dream-journal-data-modeling` — `tags[]` 멀티엔트리 인덱스 저장 구조
> - `humanities/korean-dream-interpretation-tradition` — 상징 카테고리·문화 맥락 근거

---

## 2. 하이브리드 전략 개요

```
┌────────────────────────────────────────────────────────────────┐
│ 입력: "어젯밤에 큰 뱀이 나를 쫓아왔다. 도망치다 절벽에서 떨어졌다." │
└────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                                       ▼
[1] 룰 기반 사전 매칭                  [2] LLM·임베딩 매칭
  - mecab-ko 형태소 분석                 - text-embedding-3-small
  - 사전 키워드/synonym 사전 비교          코사인 유사도 top-K
  - 결정론·빠름·비용 0                   - Claude tool_use로 JSON 강제
        │                                       │
        └───────────────────┬───────────────────┘
                            ▼
              [3] 병합·정규화 (중복 제거)
                            ▼
              tags: [{id, category, score, source}]
```

**전략 선택 기준:**

| 시나리오 | 권장 조합 |
|----------|-----------|
| MVP·오프라인·비용 0 | 룰 단독 (사전 + mecab-ko) |
| 정확도 우선·예산 있음 | 룰(1차 후보) + LLM(정제·정규화) |
| 의미 기반 추천·검색 결합 | 룰 + 임베딩 코사인 유사도 |

---

## 3. 상징 카테고리 분류 체계

| 카테고리 | 예시 ID | 키워드 |
|----------|---------|--------|
| `natural` | water, fire, mountain, sea, sun, moon, sky | 물·불·산·바다·태양·달·하늘 |
| `animal` | snake, dragon, pig, tiger, bird, dog, cat | 뱀·용·돼지·호랑이·새·개·고양이 |
| `person` | family, friend, stranger, deceased | 가족·친구·낯선이·고인 |
| `action` | death, pregnancy, exam, marriage, money, travel | 죽음·임신·시험·결혼·돈·여행 |
| `sensation` | falling, flying, escape, chase | 추락·날기·도망·쫓김 |
| `object` | mirror, teeth, hair, door, key | 거울·이빨·머리카락·문·열쇠 |

> 카테고리 근거는 `humanities/korean-dream-interpretation-tradition` 스킬을 참조. 본 스킬은 *추출·태깅* 기술에 한정한다.

---

## 4. 사전 데이터 구조

```json
{
  "id": "snake",
  "category": "animal",
  "ko": ["뱀", "구렁이", "독사"],
  "synonyms": ["서린", "도사림", "또아리"],
  "embedding": null,
  "valenceHint": "ambivalent"
}
```

| 필드 | 설명 |
|------|------|
| `id` | 정규 식별자 (영문 snake_case) |
| `category` | 위 6개 카테고리 중 하나 |
| `ko` | 한국어 표제어 배열 (룰 매칭 1차 키) |
| `synonyms` | 표현·합성어·관용어 |
| `embedding` | 미리 계산해 둔 벡터 (1536차원). 캐시 |
| `valenceHint` | `positive` / `negative` / `ambivalent` — 해석 단정 금지, 힌트일 뿐 |

> 주의: `valenceHint`는 해석 가이드가 아니라 *전통 문화 맥락의 통계적 경향*임을 UI에 명시해야 한다.

---

## 5. 룰 기반 매칭 + 한국어 형태소 처리

### 5-1. 왜 형태소 분석이 필요한가

한국어는 교착어이므로 어간에 조사·어미가 결합된다. 단순 `String.includes("뱀")`만으로는 *"뱀이"·"뱀에게"·"뱀과"* 를 분리 못 하고, 어휘 경계 오판이 발생한다.

| 입력 | 단순 매칭 | mecab-ko 형태소 분석 |
|------|-----------|-----------------------|
| "뱀이 도망갔다" | "뱀" 매칭 ✅ | `뱀(NNG)` + `이(JKS)` ✅ |
| "선뱀선글라스" | "뱀" 오매칭 ❌ | `선뱀선글라스(NNG)` 단일 명사 → 매칭 안 됨 ✅ |
| "구렁이가 또아리를 틀었다" | "뱀" 미매칭 ❌ | `구렁이` → synonym 사전 매핑 ✅ |

### 5-2. 추천 도구

| 도구 | 특징 | 권장 상황 |
|------|------|-----------|
| **mecab-ko** | 가장 빠름 (KoNLPy 기준 100K자 0.28초), 정확도 우수 | 서버 환경·대량 처리 |
| **Okt** (KoNLPy) | 설치 쉬움, 적당한 속도(1.49초 로딩) | 파이썬 백엔드 프로토타입 |
| **Komoran** | Java 기반, 사용자 사전 추가 용이 | 도메인 어휘(꿈 상징) 확장 시 |

> 주의: 브라우저(클라이언트 사이드)에는 mecab-ko WebAssembly 빌드가 있으나 사전(`mecab-ko-dic`) 용량이 수십 MB라 PWA 로드 비용이 크다. 서버 API로 분리하거나 가벼운 키워드 매칭으로 대체를 검토한다.

### 5-3. 매칭 흐름 (의사 코드)

```ts
import type { SymbolDict } from "./types";

export async function ruleMatch(
  text: string,
  dict: SymbolDict[],
  tokenizer: (s: string) => Promise<string[]>
): Promise<MatchedSymbol[]> {
  const tokens = await tokenizer(text);   // mecab-ko에서 명사·동사 어간만 뽑아온다
  const tokenSet = new Set(tokens);

  const hits: MatchedSymbol[] = [];
  for (const entry of dict) {
    const allKeys = [...entry.ko, ...entry.synonyms];
    if (allKeys.some((k) => tokenSet.has(k))) {
      hits.push({ id: entry.id, category: entry.category, score: 1.0, source: "rule" });
    }
  }
  return hits;
}
```

---

## 6. LLM 기반 추출 (Claude API)

### 6-1. tool_use로 JSON 강제

Anthropic 권장 패턴은 `tool_choice`로 특정 도구 호출을 강제하는 방식이다. 이 방법은 `input_schema`에 맞는 JSON을 디코더 단계에서 보장한다.

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const symbolExtractTool = {
  name: "extract_dream_symbols",
  description: "꿈 텍스트에서 상징을 추출해 표준 카테고리로 반환한다",
  input_schema: {
    type: "object",
    properties: {
      symbols: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "사전의 정규 ID. 사전에 없으면 'unknown' 접두사" },
            surface: { type: "string", description: "본문에서 실제로 사용된 표현" },
            category: {
              type: "string",
              enum: ["natural", "animal", "person", "action", "sensation", "object"]
            },
            confidence: { type: "number", minimum: 0, maximum: 1 }
          },
          required: ["id", "surface", "category", "confidence"]
        }
      }
    },
    required: ["symbols"]
  }
} as const;

const res = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  tools: [symbolExtractTool],
  tool_choice: { type: "tool", name: "extract_dream_symbols" },
  messages: [
    {
      role: "user",
      content: `다음 꿈 텍스트에서 상징을 추출하세요. 해석은 하지 말고 표면 표현과 카테고리만 분류합니다.\n\n${dreamText}`
    }
  ]
});

// tool_use 블록에서 JSON 꺼내기
const toolBlock = res.content.find((c) => c.type === "tool_use");
if (toolBlock?.type !== "tool_use") throw new Error("tool_use 블록 없음");
const { symbols } = toolBlock.input as { symbols: ExtractedSymbol[] };
```

### 6-2. Structured Outputs (2025-11-13 베타)

신규 API에서는 `output_format`으로도 JSON Schema 강제가 가능하다.

```http
POST /v1/messages
anthropic-beta: structured-outputs-2025-11-13
```

> 주의: Structured Outputs는 베타 헤더가 필요하고 지원 모델이 한정적이다(Claude Opus 4.5+/Sonnet 4.5+/Haiku 4.5). 베타 헤더 미사용 환경에서는 위 `tool_use` 패턴을 사용한다.

### 6-3. JSON 깨짐 fallback

LLM이 schema 위반 응답을 내놓을 가능성은 0이 아니다 (특히 베타 미사용 시).

```ts
function safeParseSymbols(raw: unknown): ExtractedSymbol[] {
  // 1) tool_use 정상 케이스
  if (Array.isArray((raw as any)?.symbols)) {
    return (raw as { symbols: ExtractedSymbol[] }).symbols.filter(isValidSymbol);
  }
  // 2) text 블록에 JSON이 포함된 케이스 — 정규식으로 추출
  if (typeof raw === "string") {
    const match = raw.match(/\{[\s\S]*"symbols"[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        return parsed.symbols?.filter(isValidSymbol) ?? [];
      } catch {
        /* fall through */
      }
    }
  }
  // 3) 최종 fallback — 룰 기반 결과만 사용
  return [];
}
```

---

## 7. 임베딩 기반 의미 유사도

### 7-1. text-embedding-3-small 핵심 스펙

| 항목 | 값 |
|------|-----|
| 기본 차원 | 1536 |
| 축소 가능 차원 | 256 이상 (Matryoshka, `dimensions` 파라미터) |
| 가격 | $0.00002 / 1K 토큰 |
| 정규화 | L2 정규화됨 → 코사인 = 내적(dot product) |
| 권장 거리 측정 | 코사인 유사도 |

### 7-2. 사전 임베딩 사전 계산

```ts
import OpenAI from "openai";
const openai = new OpenAI();

async function precomputeDictEmbeddings(dict: SymbolDict[]): Promise<SymbolDict[]> {
  const inputs = dict.map((d) => [d.id, ...d.ko, ...d.synonyms].join(", "));
  const { data } = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: inputs
  });
  return dict.map((d, i) => ({ ...d, embedding: data[i].embedding }));
}
```

> 사전 임베딩은 한 번 계산해 두고 IndexedDB·Postgres pgvector 등에 캐시한다. 사전이 변경되지 않는 한 재호출 불필요.

### 7-3. 사용자 텍스트와 매칭

```ts
function cosine(a: number[], b: number[]): number {
  // 정규화된 임베딩이므로 dot product = cosine
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

async function embeddingMatch(
  text: string,
  dict: SymbolDict[],
  threshold = 0.45,
  topK = 5
): Promise<MatchedSymbol[]> {
  const { data } = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });
  const userVec = data[0].embedding;

  return dict
    .map((d) => ({ id: d.id, category: d.category, score: cosine(userVec, d.embedding!), source: "embedding" as const }))
    .filter((m) => m.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
```

> 주의: 임계값 0.45는 도메인별 튜닝이 필요한 값이며, 짧은 표현(상징)과 긴 서술(꿈 전체)을 비교하면 점수가 낮아질 수 있다. 꿈 텍스트를 **문장 단위로 쪼개 각각 임베딩**한 뒤 max-pooling하는 방식이 더 안정적이다.

---

## 8. 병합·정규화

세 소스(rule / llm / embedding)의 결과를 합치고 중복 제거:

```ts
function mergeMatches(matches: MatchedSymbol[]): MatchedSymbol[] {
  const byId = new Map<string, MatchedSymbol>();
  for (const m of matches) {
    const prev = byId.get(m.id);
    if (!prev || m.score > prev.score) byId.set(m.id, m);
  }
  return [...byId.values()].sort((a, b) => b.score - a.score);
}
```

**source 우선순위(동률일 때):** `rule` > `llm` > `embedding`
이유: 룰 매칭은 사전 ID와 1:1 대응되어 거짓 양성이 거의 없다. LLM/임베딩은 의미 추론이라 동음이의어 위험이 있다.

---

## 9. 저장 — `tags[]` 멀티엔트리 인덱스

`architecture/dream-journal-data-modeling` 스킬의 데이터 모델과 정합되도록 다음 형태로 저장한다:

```ts
interface DreamEntry {
  id: string;
  text: string;
  tags: string[];               // ["snake", "falling", "chase"] — multi-entry 인덱스 키
  tagDetails: MatchedSymbol[];  // 점수·source 보존 (감사·재현용)
  createdAt: number;
}
```

IndexedDB(Dexie 등)에서는 `&id, *tags, createdAt` 처럼 `*tags`를 multi-entry 인덱스로 선언해 태그별 조회·필터를 O(log n)으로 처리한다.

---

## 10. 흔한 함정 (Anti-Patterns)

### 10-1. 룰만 쓰면 문맥 정서 놓침

```
"뱀이 도망갔다"    → snake 태그 (긍정·해방 뉘앙스)
"뱀에게 쫓겼다"    → snake 태그 (부정·위협 뉘앙스)
```
사전 ID는 동일하지만 정서가 정반대다. LLM·임베딩 단계에서 `valence` 필드를 별도로 추출하거나, 동사·태격 조사를 함께 태깅해 정서 신호로 활용한다.

### 10-2. LLM JSON 깨짐 무대응

`JSON.parse` 단독 호출 후 try/catch 없이 진행하면 한 번의 schema 위반으로 전체 파이프라인이 멈춘다. 위 §6-3 fallback을 *반드시* 구현한다.

### 10-3. 한국어 형태소 분석 누락

`text.includes("뱀")` 같은 단순 매칭은:
- 합성어(예: "강뱀돌이") 오매칭
- 어미 결합 표현 누락 ("뱀이었다" → "뱀"으로 자르지 못함)

mecab-ko 또는 KoNLPy `Mecab/Okt`로 명사 추출 후 매칭한다.

### 10-4. 다중 의미 상징 단정 해석

"물"은 무의식·정화·재물 운 등 전통 해석이 여러 갈래다. 본 스킬은 *태깅*에 한정하고, 해석은 `humanities/korean-dream-interpretation-tradition`의 *맥락 카드*로 사용자에게 *복수 해석*을 제시하도록 한다. 단일 해석을 LLM이 단정하게 출력하지 않도록 프롬프트로 통제한다.

### 10-5. 임베딩 차원 무절제 축소

`dimensions: 256`으로 줄이면 비용·저장이 적어지지만 짧은 텍스트(상징 표제어)에서는 변별력이 크게 떨어진다. 사전이 100개 이하라면 기본 1536을 유지하고, 1만 개 이상으로 늘릴 때 측정 후 축소를 고려한다.

### 10-6. 클라이언트에 OpenAI/Anthropic 키 노출

PWA 클라이언트에서 직접 API 키를 사용하면 키가 유출된다. 반드시 백엔드 프록시(Edge Function·서버리스)를 두고 사용량 제한·rate limit을 건다.

---

## 11. 한국어 처리 한계

- **mecab-ko 사전(`mecab-ko-dic`) 미수록 신조어** — 꿈 일기의 의성어·은어·방언 누락 가능. Komoran 사용자 사전으로 보강하거나 LLM 단계가 보정한다.
- **WebAssembly 빌드 용량** — 브라우저 환경은 사전 로딩(수십 MB)이 비싸다. 서버 측 API 호출이 현실적이다.
- **자모 분해·결합** — "ㄱ ㅓ ㅂ ㅏ ㅂ" 같은 분리 입력은 사용자 입력 정규화(NFC) 후 처리한다.
- **존댓말·반말 형태소 차이** — 동일 동사의 활용형이 다르므로 어간(`VV` 태그)만 추출해 비교한다.

---

## 12. 통합 파이프라인 예시

```ts
export async function tagDreamEntry(text: string): Promise<DreamEntry["tagDetails"]> {
  // 1차: 룰 기반 (빠르고 비용 0)
  const ruleHits = await ruleMatch(text, dict, mecabTokenize);

  // 2차: LLM 정제 (룰 후보가 적거나 confidence 낮으면)
  const llmHits = ruleHits.length < 2 ? await llmExtract(text) : [];

  // 3차: 임베딩 보강 (선택, 추천 시스템 결합 시)
  const embedHits = await embeddingMatch(text, dict, 0.5, 3);

  // 병합 + source 우선순위 정렬
  return mergeMatches([...ruleHits, ...llmHits, ...embedHits]);
}
```

---

## 13. 체크리스트

- [ ] 상징 사전을 ID·카테고리·동의어 구조로 정의했는가
- [ ] mecab-ko 또는 KoNLPy로 한국어 형태소 처리를 거치는가
- [ ] Claude API 호출 시 `tool_choice`로 JSON을 강제하는가
- [ ] JSON 파싱 실패 시 fallback(룰 결과만 사용)이 동작하는가
- [ ] 임베딩 사전은 사전 계산·캐시되는가
- [ ] 사용자 텍스트가 길다면 문장 단위로 분할 임베딩 후 max-pooling 하는가
- [ ] `tags[]`는 multi-entry 인덱스로 저장되는가
- [ ] LLM이 *해석*이 아닌 *추출*만 수행하도록 프롬프트가 제한되는가
- [ ] API 키는 백엔드 프록시 뒤에 있는가
