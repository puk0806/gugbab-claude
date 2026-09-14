---
name: fortune-interpretation-prompt-engineering
user-invocable: false
description: >
  캐주얼 운세 앱(사주·타로·손금)용 Claude API 프롬프트 설계 패턴 — XML 구획 시스템
  프롬프트, 모드별 변형, few-shot, "문화적 상징 해석은 허용 / 결정론적 단정은 회피"
  hedging 톤, Structured Outputs JSON 스키마, 프롬프트 캐싱을 다룬다.
  <example>사용자: "사주 앱 Claude 시스템 프롬프트 어떻게 짜야 해?"</example>
  <example>사용자: "타로 해석 JSON 스키마랑 few-shot 예시 같이 보여줘"</example>
  <example>사용자: "세 모드(사주·타로·손금) 프롬프트를 캐시 잘 먹게 쌓는 방법은?"</example>
---

# 운세 앱(사주·타로·손금)용 Claude API 프롬프트 엔지니어링

> 소스:
> - Anthropic Prompting best practices — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
> - Anthropic Prompt caching — https://platform.claude.com/docs/en/build-with-claude/prompt-caching
> - Anthropic Structured outputs — https://platform.claude.com/docs/en/build-with-claude/structured-outputs
> - Anthropic Models overview — https://platform.claude.com/docs/en/about-claude/models/overview
> - Anthropic Usage Policy (AI 고지 요건) — https://www.anthropic.com/aup
> - Apple App Review Guidelines (4.3(b) fortune telling) — https://developer.apple.com/app-store/review/guidelines/
> - 사주(四柱) — 한국민족문화대백과사전 — https://encykorea.aks.ac.kr/Article/E0025957
> - korean-lunar-calendar (PyPI, 기능 범위 확인) — https://pypi.org/project/korean-lunar-calendar/
> - 한국천문연구원 음양력 정보 OpenAPI — https://www.data.go.kr/data/15012679/openapi.do
> - Major Arcana / 78장 구조 — https://en.wikipedia.org/wiki/Major_Arcana
>
> 검증일: 2026-09-10 (2026-09-11 캐주얼 앱 방향으로 안전 계열 섹션 축소)
> 대상 모델: Claude Opus 5 / Sonnet 5 / Haiku 4.5 (2026-09-10 현행 세대)

이 스킬은 **재미로 보는 캐주얼 운세 앱** 백엔드에서 Claude API를 호출할 때
시스템 프롬프트·모드별 변형·few-shot·톤·JSON 응답·캐싱을 어떻게 조립할지에
대한 패턴 모음이다. **모든 프롬프트 패턴은 Anthropic 공식 문서 권고에 정합**한다.

짝 스킬(같은 운세 앱 자산군):
- `backend/korean-lunar-calendar-manseryeok` — 만세력·절기 계산 로직 (사주 원국 산출)
- `humanities/korean-saju-tradition` · `humanities/tarot-history-symbolism` — 사주·타로 전통 어휘와 귀속 서술의 근거
- `humanities/palmistry-limitations` — 손금 어휘와 엔터테인먼트 프레이밍

이 스킬은 *프롬프트 설계 패턴*만 다룬다. **사주 원국 계산은 이 스킬의 범위가
아니며, LLM이 아니라 백엔드 계산 로직의 책임이다**(§5-1).

---

## 1. 꿈 해몽 프롬프트와 무엇이 다른가 — 톤 룰의 교체

`meta/dream-interpretation-prompt-engineering`(꿈 해몽)은 **"점술적 어조 자체 금지"**
가 하드 룰이다. 해몽은 심리적 자기 성찰 도구로 포지셔닝되기 때문이다.

운세 앱은 다르다. **사주·타로·손금은 점술 그 자체가 제품**이므로 "점술 어조 금지"를
그대로 이식하면 제품이 성립하지 않는다. 대신 경계선을 *단정 여부*로 옮긴다.

| 축 | 권장 (제품의 본질) | 회피 (재미를 불안으로 바꾸는 표현) |
|----|-------------------|--------------------------|
| 전통 상징 풀이 | "전통 명리학에서는 이 배치를 …로 풀이합니다" | "당신의 올해 재물운은 …입니다" (1인칭 단정) |
| 시제·양상 | 조건·가능성 — "…로 읽을 수 있습니다" | 결정론적 미래 단정 — "…하게 됩니다", "반드시 …합니다" |
| 마무리 | 자기 성찰 질문 — "무엇을 우선하고 싶으신가요?" | 실행 지시 — "…하세요", "…는 피하십시오" |
| 흉한 상징 | "전환·재검토의 이미지로 읽혀 왔습니다" | "액운이 닥칩니다", "큰 사고가 있습니다" |

**한 줄 규칙 (system prompt에 그대로 넣는다):**

> 문화적 상징 해석·전통 풀이는 허용한다. 결정론적 미래 단정과 실행 지시는 피하고,
> 재미로 보는 콘텐츠임을 잊지 않는다.

투자·의료·법률처럼 중대한 실행 판단을 묻는 질문에는 **상징 풀이만 제공하고 판단은
사용자에게 돌려준다** — 이 앱은 그 영역을 다루는 제품이 아니다.

> 주의: Apple 4.3(b)는 fortune telling 앱을 "이미 잘 확립된 카테고리"로 분류해
> **의미 있게 차별화되지 않은 신규 앱 등록을 거부**한다고 명시한다. 프롬프트
> 품질(톤·개인화·구조화 출력)이 심사 통과의 실질적 차별점이 되므로 이 스킬의
> 패턴은 제품 승인 리스크와 직결된다.

---

## 2. 전체 프롬프트 구조

Anthropic 공식 권고(역할은 system, XML 태그로 구획, `<examples>`로 few-shot) 순서대로
조립한다. 3모드(사주·타로·손금)는 **공통 코어 + 모드 블록** 2단 구조로 쌓는다.

```
[system]
  ├─ 블록 A: 공통 코어 (모든 모드 공유, 캐시 breakpoint #1)
  │   ├─ 역할 정의 (한 줄)
  │   ├─ 톤 규칙 (§1 한 줄 규칙 + hedging 문법)
  │   ├─ 귀속(attribution) 의무
  │   └─ 출력 포맷 규칙
  └─ 블록 B: 모드별 지침 (saju | tarot | palmistry, 캐시 breakpoint #2)
      ├─ 입력 구조 설명 (원국 / 카드 배열 / 이미지)
      ├─ 모드 고유 주의 사항
      └─ <examples> few-shot 2–3개 (해당 모드 톤)

[messages]
  └─ user: 구조화 입력 JSON + (선택) 사용자 질문 텍스트
```

**왜 2단으로 나누는가:** 캐시 breakpoint는 요청당 최대 4개이고, 캐시는
*breakpoint까지의 접두사*에 걸린다. 공통 코어를 첫 블록으로 고정하면 세 모드가
같은 접두사를 공유해 캐시 재사용률이 올라가고, 톤 규칙이 한 곳에만 존재해
모드 간 톤 드리프트도 사라진다(§8).

---

## 3. 톤 규칙 — hedging 문법과 귀속

### 3-1. 권장/회피 어미 사전 (system prompt에 그대로 포함)

| 구분 | 표현 |
|------|------|
| **권장 (풀이 서술)** | "…로 풀이됩니다", "…로 해석되어 왔습니다", "…라는 관점이 있습니다", "…로 읽을 수 있습니다", "…와 연결지어 설명하는 전통이 있습니다" |
| **권장 (질문형 마무리)** | "…를 돌아보게 하는 질문으로 읽을 수 있습니다", "지금 어떤 선택 앞에 계신가요?" |
| **회피 (단정)** | "…할 것입니다", "…하게 됩니다", "반드시", "틀림없이", "…의 징조입니다" |
| **회피 (실행 지시)** | "…하세요", "…해야 합니다", "…는 피하십시오" |

### 3-2. 귀속(attribution) 의무

해석 주체를 **항상 전통·학파에 귀속**시킨다. 모델이 1인칭 예언자로 말하지 않는다.

- ✅ "전통 명리학에서는 이 배치를 …로 풀이합니다"
- ✅ "라이더-웨이트 계열 해석에서는 이 카드를 …로 읽습니다"
- ❌ "당신의 사주는 …입니다" / "제가 보기에 당신은 …할 운입니다"

귀속 표현은 단정 톤을 문법 차원에서 차단하는 가장 효과적인 장치다. 평가 지표로도
측정한다(§11 "귀속 표현 포함률").

---

## 4. 공통 코어 시스템 프롬프트 템플릿 (블록 A)

```text
당신은 한국 전통 운세 문화(사주 명리·타로·손금)의 상징 체계를 바탕으로 사용자의
질문을 재미있고 따뜻하게 풀이하는 이야기꾼입니다.

<역할>
- 해석은 *전통의 풀이*로 제시하고, 반드시 그 전통에 귀속시켜 서술합니다.
- 해석은 *가능성·관점*으로 제시합니다. 미래를 단정하지 않습니다.
- 사용자가 스스로 생각할 여지를 남깁니다.
- 이 콘텐츠는 재미로 보는 것임을 전제로 합니다.
</역할>

<톤 규칙>
- 핵심: 문화적 상징 해석·전통 풀이는 허용. 결정론적 미래 단정과 실행 지시는 회피.
- 권장 어미: "…로 풀이됩니다", "…로 해석되어 왔습니다", "…라는 관점이 있습니다",
  "…로 읽을 수 있습니다".
- 회피 어미: "…할 것입니다", "…하게 됩니다", "반드시", "틀림없이",
  "…의 징조입니다", "…하세요".
- 귀속 필수: "전통 명리학에서는…", "라이더-웨이트 계열 해석에서는…",
  "전통 수상학에서는…". "당신의 사주는 …입니다" 같은 1인칭 단정 금지.
- 흉한 상징은 전환·재검토의 이미지로 풀고 불안을 조장하지 않습니다.
- 투자·의료·법률처럼 중대한 실행 판단을 묻는 질문에는 상징 풀이만 제공하고
  판단은 사용자에게 돌려줍니다.
- 마무리는 열린 결말: 사용자에게 던지는 자기 성찰 질문 1–2개를 포함합니다.
</톤 규칙>

<출력 포맷>
지정된 JSON 스키마를 따릅니다. 추가 텍스트·markdown 코드펜스 없이 JSON만
반환합니다. disclaimer 필드는 항상 고정 문구로 채웁니다.
</출력 포맷>
```

**설계 근거:**
- "역할은 한 문장만으로도 동작을 유의미하게 바꾼다" — 공식 *Give Claude a role*.
- `<역할>`·`<톤 규칙>` 등 XML 구획 — 공식 *Structure prompts with XML tags*
  ("지시·컨텍스트·예시·가변 입력이 섞일 때 태그가 오해석을 줄인다").
- 톤 규칙을 system에 두는 이유: user 메시지(원국·카드·질문)는 매번 바뀌지만
  톤 규칙은 불변 → 캐시 적중 극대화(§8).

---

## 5. 모드별 변형 포인트 (블록 B)

### 5-1. 사주 — 계산은 LLM이 아니라 백엔드가 한다

**하드 룰: LLM에 생년월일만 주고 원국(사주 8자)을 뽑게 하지 않는다.**

사주 원국은 달력 산술이 아니라 **절기력(節氣曆)** 기반이다:
- **연주(年柱)**는 양력 1월 1일도 음력 설도 아닌 **입춘(立春)** 시각을 경계로 바뀐다.
- **월주(月柱)**는 24절기 중 12개의 **절(節)** 절입일을 경계로 바뀐다
  (입춘→인월, 경칩→묘월 …). 즉 음력 월·양력 월과 모두 다르다.
- 2월 3일생이라도 그 해 입춘이 2월 4일이면 전년도 축월(丑月)로 계산된다.
  이 경계를 틀리면 월주가 통째로 바뀌어 해석 전체가 무의미해진다.

LLM은 이 경계 계산을 **틀려도 자신 있게 답한다**(조용한 오류). 그래서 원국은
백엔드 만세력 로직(`backend/korean-lunar-calendar-manseryeok`)이 계산하고, LLM에는
**계산 결과를 구조화 입력으로 주입**한다.

> 주의: `korean-lunar-calendar` 계열 라이브러리(Python/JS/Go)는 **음↔양 변환과
> 간지(GapJa) 문자열만** 제공하며 **24절기는 지원하지 않는다**(PyPI 문서 기준,
> 지원 범위 음력 1000-01-01 ~ 2050-11-18). 이 라이브러리의 간지는 *음력 날짜 기준*
> 이므로 **사주 사주(四柱)와 동일하지 않다**. 절기 데이터는 한국천문연구원(KASI)
> 음양력 OpenAPI 등 별도 소스가 필요하다.

**user 메시지 구조화 입력 예:**

```json
{
  "mode": "saju",
  "pillars": {
    "year":  { "stem": "경", "branch": "오" },
    "month": { "stem": "무", "branch": "인" },
    "day":   { "stem": "갑", "branch": "자" },
    "hour":  { "stem": "병", "branch": "인" }
  },
  "day_master": "갑",
  "five_elements": { "목": 2, "화": 2, "토": 2, "금": 1, "수": 1 },
  "calculation_basis": {
    "solar_birth": "1990-02-05T04:20:00+09:00",
    "ipchun_boundary_applied": true,
    "month_pillar_rule": "절입일(節) 기준",
    "hour_pillar_time_basis": "표준시(KST) 기준, 진태양시 미보정"
  },
  "question_topic": "career"
}
```

모드 블록에 반드시 넣을 지시:

```text
<사주 모드>
- pillars 값은 이미 확정된 계산 결과입니다. 재계산하거나 수정하지 않습니다.
- 입력에 없는 정보(대운·세운 등)를 임의로 만들어내지 않습니다. 없으면 없다고 씁니다.
- calculation_basis의 기준(입춘·절입일·시간 기준)을 응답 말미에 한 줄로 밝힙니다.
- 수명·사망 시점은 재미로 다룰 소재가 아니므로 어떤 형태로도 예측하지 않습니다.
</사주 모드>
```

> 주의: **시주(時柱)의 진태양시 보정·야자시(夜子時) 처리 관행은 유파마다 다르다.**
> 어느 쪽이 옳다고 모델이 판단하게 두지 말고, 앱 정책으로 하나를 고정한 뒤
> `calculation_basis`에 그 기준을 명시해 응답에 노출한다.

### 5-2. 타로 — 카드 추첨도 LLM 밖에서

타로 덱은 **78장 = 메이저 아르카나 22장(0~21) + 마이너 아르카나 56장(완드·컵·
소드·펜타클 4수트)** 구조다.

**하드 룰: 카드 추첨을 LLM에 시키지 않는다.** LLM 샘플링은 균등 무작위가 아니고
(유명 카드 편향), 재현·감사도 불가능하다. 백엔드에서 CSPRNG로 뽑고 정/역방향까지
확정해 입력으로 넘긴다.

```json
{
  "mode": "tarot",
  "spread": "three_card_past_present_future",
  "cards": [
    { "position": "past",    "name": "The Tower",    "arcana": "major", "reversed": false },
    { "position": "present", "name": "Six of Cups",  "arcana": "minor", "suit": "cups", "reversed": true },
    { "position": "future",  "name": "The Star",     "arcana": "major", "reversed": false }
  ],
  "question_topic": "relationship"
}
```

```text
<타로 모드>
- cards 배열은 이미 뽑힌 결과입니다. 카드를 추가·교체·재추첨하지 않습니다.
- 각 카드는 spread의 position 의미와 결합해 해석합니다.
- reversed(역방향)는 "나쁜 결과"가 아니라 해당 상징의 내향·지연·재검토 국면으로
  읽습니다. 공포를 조장하지 않습니다.
- 카드 3장을 각각 2–3줄, 마지막에 전체를 잇는 한 단락으로 마무리합니다.
</타로 모드>
```

> 주의: 라이더-웨이트-스미스 덱은 1909년 초판이지만 **현행 유통본 아트워크·텍스트에
> 별도 저작권 등록(U.S. Games Systems)이 존재**한다. 카드 *이름과 전통적 의미*를
> 텍스트로 다루는 것과 *이미지를 앱에 탑재*하는 것은 법적 성격이 다르므로, 이미지
> 사용은 반드시 법무 확인을 거친다.

### 5-3. 손금 — 이미지 입력, 판독 정직성이 핵심

손금은 vision 입력(손바닥 사진)을 쓴다. 흐린 사진을 그럴듯하게 읽어내는 척하는
것이 가장 흔한 품질 문제다.

```text
<손금 모드>
- 이미지에서 판독 가능한 선만 언급합니다. 흐릿하거나 잘려서 판독이 어려우면
  "이 사진에서는 판독이 어렵습니다"라고 정직하게 밝히고 재촬영을 안내합니다.
- 선 명칭은 전통 수상학 용어(생명선·감정선·두뇌선·운명선)로만 사용합니다.
- 생명선은 "활력의 상징"처럼 문화적 진술로만 다루고, 수명·질환을 시사하는
  표현은 재미의 범위를 벗어나므로 쓰지 않습니다.
- 손 이외의 피사체(얼굴·신분증·타인)가 함께 찍혔다면 그 내용을 서술하지 않습니다.
</손금 모드>
```

전처리 권장: 이미지 EXIF(GPS·기기 정보) 제거, 손 영역 크롭, 저해상도·과노출 이미지는
API 호출 전 클라이언트에서 반려.

---

## 6. JSON 응답 스키마 + Structured Outputs

### 6-1. 스키마

```json
{
  "mode": "saju",
  "summary": "한 줄 요약 (사용자가 첫눈에 알 수 있도록)",
  "tradition_reading": "전통 풀이 (3–5줄, 귀속 표현 + hedging 필수)",
  "reflection": "자기 성찰 관점 (3–5줄, 단정 없이 질문을 여는 서술)",
  "self_reflection_question": ["사용자에게 던질 질문 1", "질문 2 (선택)"],
  "disclaimer": "재미로 보는 운세입니다. 전통 문화 해석을 바탕으로 한 참고용 콘텐츠이며 검증된 예측이 아닙니다."
}
```

| 필드 | 값 | 의미 |
|------|-----|------|
| `summary` | 문자열 | 결과 카드 상단 한 줄. 공유 카드에도 그대로 쓰이므로 단정·흉 서술 없이 |
| `tradition_reading` / `reflection` | 문자열 | 전통 귀속 풀이 / 열린 결말의 성찰 서술 |
| `disclaimer` | 고정 문구 | 항상 채운다. 모델이 창작하지 않도록 few-shot 전부에 동일 문구를 넣는다 |

### 6-2. Structured Outputs로 스키마 강제

`output_config.format`으로 JSON 스키마를 강제하는 것이 현행 권장 방식이다.

```python
import anthropic

client = anthropic.Anthropic()

FORTUNE_SCHEMA = {
    "type": "object",
    "properties": {
        "mode": {"type": "string", "enum": ["saju", "tarot", "palmistry"]},
        "summary": {"type": "string"},
        "tradition_reading": {"type": "string"},
        "reflection": {"type": "string"},
        "self_reflection_question": {"type": "array", "items": {"type": "string"}},
        "disclaimer": {"type": "string"},
    },
    "required": [
        "mode", "summary", "tradition_reading", "reflection",
        "self_reflection_question", "disclaimer",
    ],
    "additionalProperties": False,
}

response = client.messages.create(
    model="claude-sonnet-5",
    max_tokens=1024,
    system=[
        {"type": "text", "text": CORE_PROMPT,
         "cache_control": {"type": "ephemeral"}},          # 블록 A (공통 코어)
        {"type": "text", "text": MODE_PROMPTS["saju"],     # 블록 B (모드별 지침 + <examples> few-shot)
         "cache_control": {"type": "ephemeral"}},
    ],
    output_config={"format": {"type": "json_schema", "schema": FORTUNE_SCHEMA}},
    messages=[{"role": "user", "content": user_payload_json}],
)
```

**스키마 작성 시 공식 제약(위반 시 400):**
- `additionalProperties`는 객체마다 `false`여야 한다.
- `minLength`/`maxLength`, `minimum`/`maximum` 같은 길이·수치 제약은 **미지원** →
  "3–5줄" 같은 분량 제약은 스키마가 아니라 **프롬프트로** 건다.
- 재귀 스키마, 외부 `$ref`(URL), enum 안의 복합 타입 미지원.
- `enum`은 문자열·숫자·불리언·null만 가능.

**캐싱과의 상호작용 (중요):**
- Structured Outputs는 내부 시스템 프롬프트를 추가해 입력 토큰이 약간 늘어난다.
- **`output_config.format`을 바꾸면 해당 스레드의 프롬프트 캐시가 무효화된다.**
  → 모드별로 스키마를 다르게 두면 캐시가 파편화되므로, **`mode` enum을 가진
  단일 공통 스키마**를 쓰는 것이 유리하다.
- 컴파일된 grammar는 마지막 사용 시점부터 24시간 캐시된다(첫 요청만 약간 느림).

> 주의: **assistant 프리필로 JSON을 강제하던 옛 패턴은 쓰지 않는다.** Claude 4.6
> 세대부터 마지막 assistant 턴 프리필이 지원 중단되어 **400 에러**가 난다.
> 프리필 대신 Structured Outputs(또는 도구 호출)로 이관한다.

---

## 7. few-shot 예시 설계

공식 권고: **3–5개**가 최적, `<example>`(복수는 `<examples>`) 태그로 감싸고,
서로 다른 상황을 담아 다양성을 확보한다.

운세 앱 권장 구성 — **모드 블록마다 2–3개**:
1. **일반 풀이** — 귀속 + hedging 톤 시범
2. **흉한 상징** — 타워·죽음·역방향 등을 전환·재검토로 푸는 시범
3. **실행 판단을 묻는 질문** — 상징 풀이만 하고 판단은 사용자에게 돌려주는 시범

```xml
<examples>
  <example>
    <user>{"mode":"tarot","spread":"three_card_past_present_future","cards":[{"position":"past","name":"The Tower","arcana":"major","reversed":false},{"position":"present","name":"Six of Cups","arcana":"minor","suit":"cups","reversed":true},{"position":"future","name":"The Star","arcana":"major","reversed":false}],"question_topic":"self"}</user>
    <assistant>
{
  "mode": "tarot",
  "summary": "무너짐 이후의 회복을 이야기하는 배열입니다.",
  "tradition_reading": "라이더-웨이트 계열 해석에서 타워는 기존 구조가 무너지는 국면으로 읽힙니다. 역방향의 컵 6은 과거를 향한 그리움이 잠시 안으로 접히는 상태로 풀이되기도 합니다. 스타는 회복과 방향 찾기를 상징하는 카드로 해석되어 왔습니다.",
  "reflection": "무너진 다음에 무엇을 다시 세울지 고르는 시기로 읽을 수 있습니다. 지나간 시간을 자주 떠올리는 마음이 지금의 선택을 붙잡고 있는지 살펴볼 만합니다.",
  "self_reflection_question": [
    "지금 다시 세우고 싶은 것은 무엇인가요?",
    "과거의 어떤 장면이 자주 떠오르시나요?"
  ],
  "disclaimer": "재미로 보는 운세입니다. 전통 문화 해석을 바탕으로 한 참고용 콘텐츠이며 검증된 예측이 아닙니다."
}
    </assistant>
  </example>

  <example>
    <user>{"mode":"saju","pillars":{"year":{"stem":"경","branch":"오"},"month":{"stem":"무","branch":"인"},"day":{"stem":"갑","branch":"자"},"hour":{"stem":"병","branch":"인"}},"day_master":"갑","question_topic":"financial","user_question":"올해 주식에 크게 투자해도 될까요?"}</user>
    <assistant>
{
  "mode": "saju",
  "summary": "재물을 다루는 자리에 관한 질문이네요. 풀이는 참고로, 결정은 본인의 것으로 남겨둘게요.",
  "tradition_reading": "전통 명리학에서는 일간을 기준으로 재성(財星)에 해당하는 자리를 재물을 다루는 영역으로 풀이합니다. 이 배치에서는 활동과 확장을 상징하는 기운이 함께 놓인 것으로 해석되기도 합니다. 다만 이는 전통적 상징 체계의 설명이며, 특정 시점의 손익을 가리키는 것으로 읽지는 않습니다.",
  "reflection": "결정을 서두르게 만드는 마음이 어디에서 오는지 살펴볼 만한 시기로 읽을 수 있습니다. 실제 투자 판단은 이 풀이가 대신할 수 없는 영역이니 스스로 감당할 범위를 정해 보시면 좋겠습니다.",
  "self_reflection_question": [
    "이 결정을 지금 내려야 한다고 느끼게 만드는 것은 무엇인가요?",
    "감당할 수 있는 범위를 스스로 정해 두셨나요?"
  ],
  "disclaimer": "재미로 보는 운세입니다. 전통 문화 해석을 바탕으로 한 참고용 콘텐츠이며 검증된 예측이 아닙니다."
}
    </assistant>
  </example>
</examples>
```

> 예시 전부를 귀속 + hedging으로 작성한다. 단정 톤이 한 줄이라도 섞이면 모델은
> 그 톤을 그대로 모방한다(§12-5).

---

## 8. 프롬프트 캐싱

운세 앱 시스템 프롬프트(공통 코어 + 모드 블록 + few-shot)는 요청마다 동일 →
캐싱 적합도가 매우 높다.

**최소 캐시 토큰 (공식 문서, 2026-09-10 기준):**

| 모델 | 최소 토큰 |
|------|----------|
| Claude Opus 5 (및 Fable 5.1 / Mythos 5.1 / Fable 5 / Mythos 5) | **512** |
| Claude Sonnet 5 (및 Opus 4.8 / Sonnet 4.6 / Sonnet 4.5) | **1,024** |
| Claude Opus 4.7 | **2,048** |
| Claude Opus 4.6 / 4.5, Claude Haiku 4.5 | **4,096** |

> 임계값은 세대순으로 단조롭지 않다 — Opus 5가 512로 가장 낮고, Haiku 4.5·
> Opus 4.6이 4,096으로 가장 높다. 임계 미달이면 **에러 없이 조용히 캐시가
> 무시**되므로 `usage` 필드로 반드시 확인한다.

**비용 배수 (공식):** 5분 캐시 쓰기 1.25x / 1시간 캐시 쓰기 2x / 캐시 읽기 0.1x.

| 모델 | 기본 input | 5m write | 1h write | cache read |
|------|-----------|----------|----------|-----------|
| Claude Sonnet 5 | $2 / MTok | $2.50 | $4 | $0.20 |
| Claude Opus 5 | $5 / MTok | $6.25 | $10 | $0.50 |

**적중 확인:**

```python
u = response.usage
print(u.cache_creation_input_tokens, u.cache_read_input_tokens, u.input_tokens)
# 총 입력 = cache_read + cache_creation + input_tokens
```

**운세 앱 캐시 전략:**
- breakpoint는 요청당 최대 **4개**. 여기서는 2개(공통 코어 / 모드 블록)면 충분하다.
- 세 모드가 **같은 코어 접두사**를 공유하므로 코어 캐시는 모드와 무관하게 재사용된다.
- 저트래픽(5분 내 재요청이 보장되지 않음) → `{"type": "ephemeral", "ttl": "1h"}`.
  쓰기 비용 2x지만 5분마다 재작성하는 것보다 싸다. 고트래픽이면 기본 5분 유지.
- breakpoint는 **요청마다 바뀌지 않는 내용** 위에만 둔다. "오늘 날짜", "사용자
  닉네임" 같은 가변 값을 코어에 섞으면 적중률이 0으로 떨어진다.
- 캐시 읽기는 이전 20개 블록 위치까지 조회(lookback)한다.

한국어 기준 코어(역할+톤+출력) 약 600–1,000 tokens, 모드 블록(지침+few-shot 2–3개)
약 1,000–1,800 tokens → **Sonnet 5(1,024)는 코어 단독으로는 미달할 수 있으므로
코어+모드 누적 지점(breakpoint #2)에서 적중을 확인**한다. Haiku 4.5(4,096)는
누적으로도 미달하기 쉬워 해석 모델로는 Sonnet 5 이상을 권장한다.

---

## 9. 사용자 입력 전처리

**모드별 필수 검증:**

| 모드 | 검증 항목 |
|------|-----------|
| 사주 | 생년월일시 유효성, 시각 미상 여부(시주 생략 플래그), 원국 계산 성공 여부 |
| 타로 | 카드 개수 = spread 정의와 일치, 중복 카드 없음, `reversed` 불리언 존재 |
| 손금 | 이미지 해상도·손 영역 검출, EXIF 제거, 파일 크기 상한 |

**개인정보 최소화:**
- **생년월일시는 그 자체로 민감한 개인정보**다(재식별 가능). 로그에 평문 저장하지
  말고, 저장이 필요하면 해시 또는 분리 보관한다.
- 자유 질문 텍스트에는 이름·연락처가 섞여 들어온다. 전화번호(`01[016-9]-?\d{3,4}-?\d{4}`),
  이메일(`[\w.+-]+@[\w-]+\.[\w.-]+`), 주민번호(`\d{6}-?\d{7}`)는 마스킹 후 전송.
- 손금 이미지는 손 이외 영역을 크롭해 전송(얼굴·주변인 노출 방지). 원본은 해석 후 즉시 폐기가 기본값.

**길이 제한:** 자유 질문 10자 미만이면 재질문 유도, 1,000자 초과면 클라이언트에서
핵심만 추출.

---

## 10. 출력 후처리

1. **스키마 검증** — Structured Outputs를 써도 클라이언트에서 한 번 더 검증한다
   (필드 존재·enum 값 확인). 실패 시 1회 재시도.
2. **단정 표현 스캔** — `반드시|틀림없이|할 것입니다|하게 됩니다|징조입니다` 정규식
   매칭 시 로깅(누출률 지표, §11). 심각하면 재생성.
3. **`disclaimer` 고정 문구 대조** — 모델이 변형했으면 서버가 정본으로 덮어쓴다.
4. **마크다운 안전 렌더링** — `**굵게**`만 허용, HTML 태그는 sanitize.

---

## 11. 평가 지표

| 지표 | 측정 방법 | 목표 |
|------|-----------|------|
| 귀속 표현 포함률 | "전통 …에서는/…계열 해석에서는" 매칭 | ≥ 95% |
| 단정 표현 누출률 | §10-2 정규식 매칭 | < 1% |
| 원국 재현성(사주) | 동일 입력 반복 → `pillars` 동일 | **100%** (깨지면 모델이 계산에 개입 중) |
| 스키마 유효율 | 클라이언트 검증 통과율 | ≥ 99.5% |
| 캐시 적중률 | `cache_read_input_tokens / 총 입력` | ≥ 80% |

---

## 12. 흔한 함정

1. **사주 계산을 LLM에 위임** — 입춘·절입일 경계를 틀려도 모델은 자신 있게 답한다.
   원국은 백엔드 만세력 로직이 계산해 구조화 입력으로 주입한다(§5-1).

2. **음력 간지 = 사주 사주(四柱) 혼동** — `korean-lunar-calendar` 계열이 주는 간지는
   *음력 날짜 기준*이며 절기(節)를 반영하지 않는다. 월주 계산에 그대로 쓰면 틀린다.

3. **타로 카드 추첨을 LLM에 위임** — 분포 편향, 재현 불가, 감사 불가. CSPRNG로
   백엔드에서 뽑는다(§5-2).

4. **꿈 해몽 톤 룰을 그대로 이식** — "점술 어조 자체 금지"를 붙이면 모델이 전통
   풀이까지 거부해 제품이 성립하지 않는다. 경계는 *점술 여부*가 아니라
   *단정 여부*다(§1).

5. **few-shot에 단정 톤 한 줄이라도 섞임** — 모델은 예시 톤을 그대로 모방한다.
   예시 전부 귀속 + hedging으로 작성한다.

6. **모드별로 시스템 프롬프트를 통째로 다르게 작성** — 캐시가 3벌로 파편화되고
   톤 규칙이 모드마다 미묘하게 갈라진다. 공통 코어 + 모드 블록 2단으로 쌓는다(§2).

7. **`output_config.format`을 자주 바꿈** — 스키마 변경은 프롬프트 캐시를 무효화한다.
   `mode` enum을 가진 단일 공통 스키마로 고정한다(§6-2).

8. **assistant 프리필로 JSON 강제** — Claude 4.6 세대 이후 프리필은 **400 에러**다.
   Structured Outputs 또는 도구 호출로 이관한다.

9. **모델 ID 하드코딩** — 예제·설정에는 현행 별칭 ID(`claude-opus-5`,
   `claude-sonnet-5`, `claude-haiku-4-5`)를 쓴다. `claude-opus-4-8`·
   `claude-sonnet-4-6`은 아직 호출되는 legacy지만 신규 코드에는 쓰지 않는다.

10. **불안 조장 후 유료 전환** — "액운이 있으니 부적 결제" 같은 흐름은 재미를
    공포로 바꾸는 설계이자 Apple 2.3.1(오해를 부르는 마케팅) 리스크다. 유료 상품은
    *더 깊은 해석*으로 팔고 *공포*로 팔지 않는다.

11. **AI 고지 누락** — Anthropic Usage Policy는 외부 노출 AI 에이전트가 사람이 아닌
    AI임을 이용자에게 분명히 알리도록 요구한다. 온보딩·결과 화면에 고지를 둔다.
