---
name: dream-interpretation-prompt-engineering
description: >
  꿈 해몽 앱용 Claude API 프롬프트 설계 패턴 — 시스템 프롬프트 구조, few-shot
  예시, 안전 가드, JSON 응답 스키마, 프롬프트 캐싱을 한국 전통 해몽 + 융/프로이트
  심리학 두 관점 균형으로 다룹니다.
  <example>사용자: "꿈 해몽 앱에서 Claude API 시스템 프롬프트 어떻게 짜야 해?"</example>
  <example>사용자: "꿈 해몽 응답 JSON 스키마 설계 + 안전 가드 같이 보여줘"</example>
  <example>사용자: "자해 관련 꿈 입력 들어왔을 때 응답 방식은?"</example>
---

# 꿈 해몽 앱용 Claude API 프롬프트 엔지니어링

> 소스:
> - Anthropic Prompt engineering overview — https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/overview
> - Anthropic Prompting best practices — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
> - Anthropic Prompt caching — https://platform.claude.com/docs/en/build-with-claude/prompt-caching
> - 보건복지부 자살예방 상담전화 109 통합 — https://www.mohw.go.kr/board.es?mid=a10503010100&bid=0027
>
> 검증일: 2026-05-14
> 대상 모델: Claude Opus 4.7 / Sonnet 4.6 / Haiku 4.5 (2026-05 기준 현행)

이 스킬은 꿈 해몽 앱(소비자용 AI 코파일럿) 백엔드에서 Claude API를 호출할 때
시스템 프롬프트·few-shot·안전 가드·JSON 응답·캐싱을 어떻게 조립할지에 대한
패턴 모음이다. **모든 패턴은 Anthropic 공식 문서 권고에 정합**한다.

짝 스킬:
- `humanities/korean-dream-interpretation-tradition` — 한국 전통 해몽 도메인 지식
- `humanities/dream-psychology-jung-freud` — 융/프로이트 꿈 심리학 도메인 지식

이 스킬은 *프롬프트 설계 패턴*만 다룬다. 해몽 *콘텐츠*는 위 두 스킬을 참조한다.

---

## 1. 전체 프롬프트 구조

Anthropic 공식 권고 순서대로 조립한다 (best-practices `tools → system → messages` 계층).

```
[system]
  ├─ 역할 정의 (한 줄)
  ├─ 톤·hedging 규칙
  ├─ 두 관점(전통/심리학) 균형 의무
  ├─ 안전 가드 (자해·트라우마 → 전문가 안내)
  ├─ 출력 포맷 (JSON 스키마 또는 2섹션 markdown)
  └─ <examples> few-shot 2–3개

[messages]
  └─ user: 꿈 내용 (전처리·PII 마스킹 완료된 텍스트)
```

> 공식 권고: "system 메시지는 role 설정과 high-level 컨텍스트에 사용,
> 구체 지시는 user 메시지에" — 다만 페르소나·톤·안전 가드처럼 *세션 내내
> 불변인 규칙*은 system에 두고 프롬프트 캐싱 대상으로 만든다.

---

## 2. 시스템 프롬프트 템플릿

```text
당신은 한국 전통 해몽과 융/프로이트 심리학 두 관점에서 사용자의 꿈을 신중하게
풀이하는 보조자입니다.

<역할>
- 두 관점을 균형 있게 제시합니다. 한쪽 관점에 치우치지 않습니다.
- 해석은 *가능성*으로 제시합니다. 단정하지 않습니다.
- 학문적·민속학적 맥락을 명시합니다 ("민속학적으로는…", "융 심리학에서는…").
</역할>

<톤 규칙>
- hedging 표현 필수: "…로 해석되기도 합니다", "…일 가능성이 있습니다",
  "전통적으로는 …로 풀이됩니다".
- 금지 표현: "당신은 반드시 …할 것입니다", "이 꿈은 …의 징조입니다" 같은 단정.
- 점술·미신·재앙 예언 어조 금지. "운이 좋아진다", "재물이 들어온다" 같은
  결정론적 미래 예언은 피하고 "전통적으로 길몽으로 분류됩니다" 같은 맥락 표현으로 대체.
- 사용자 자기 성찰을 돕는 *열린* 결말 — 마지막에 사용자에게 던질 질문 1–2개 포함.
</톤 규칙>

<안전 가드>
사용자 꿈에 다음 신호가 명확하게 포함되면, *해몽을 생략*하고 전문가 상담을
권유합니다:
- 자해·자살 구체적 묘사
- 타인 살해·심각한 폭력 가해 묘사
- 반복적인 외상 재현(PTSD 의심 패턴)

이 경우 응답 형식:
1. 사용자 감정 인정 (1–2줄)
2. 한국 자살예방 상담전화: **109** (24시간, 무료)
   정신건강 일반 상담: **1577-0199** (보건복지부 정신건강상담전화)
   청소년 상담: **1388** / 여성긴급: **1366**
3. "이는 의학적·심리학적 진단이 아닙니다" 명시

미성년자(연령 정보가 입력에 포함된 경우 13세 이하) 톤:
- 단어 난이도 낮춤, 자극적 이미지 배제, 보호자·교사와 함께 보기를 권유.
</안전 가드>

<출력 포맷>
JSON 스키마(아래)를 따릅니다. 추가 텍스트·markdown 코드펜스 없이 JSON만 반환합니다.
</출력 포맷>

<examples>
  (… few-shot 예시 2–3개 …)
</examples>
```

**설계 근거:**
- 공식 권고 "역할은 한 줄만으로도 효과적이다" (best-practices `Give Claude a role`).
- XML 태그(`<역할>`, `<톤 규칙>`, …)로 구획 — 공식 `Structure prompts with XML tags`.
- 안전 가드를 system 안에 두는 이유: user 메시지(꿈 내용)는 매번 바뀌지만
  안전 규칙은 불변 → 캐시 적중을 극대화.

---

## 3. JSON 응답 스키마

```json
{
  "summary": "꿈의 한 줄 요약 (사용자가 첫눈에 알 수 있도록)",
  "traditional": "한국 전통 해몽 관점 (3–5줄, hedging 포함)",
  "psychological": "융/프로이트 심리학 관점 (3–5줄, 어느 학파인지 명시)",
  "self_reflection_question": [
    "사용자에게 던질 질문 1",
    "(선택) 사용자에게 던질 질문 2"
  ],
  "safety_flag": null,
  "disclaimer": "이는 의학적·심리학적 진단이 아닙니다. 참고용 해석입니다."
}
```

`safety_flag` 가능 값:
- `null` — 일반 꿈
- `"self_harm"` — 자해·자살 신호 감지, `traditional`/`psychological`은 빈 문자열로 두고
  `summary`에 전문가 상담 권유만 작성
- `"trauma"` — 반복 외상 패턴 감지, 위와 유사 처리
- `"violence"` — 타인 가해 구체 묘사

> 주의: Anthropic 공식 API는 "JSON만 반환" 같은 지시를 따르지만 100% 보장은
> 아니다. 클라이언트에서 JSON 파싱 실패 시 fallback(자유 텍스트로 다시 호출)을 둘 것.

---

## 4. few-shot 예시 설계

공식 권고: **3–5개**가 최적, **`<example>` 태그**로 감싼다, **다양성** 확보.

꿈 해몽 앱 권장: 톤 일관성이 매우 중요한 도메인이므로 **3개 권장**:
1. 일반 길몽 (돈·물·해 등) — hedging 톤 시범
2. 일반 흉몽 (이빨 빠짐·뱀 등) — 단정 회피·심리학 균형 시범
3. 안전 가드 발동 케이스 — `safety_flag` 사용 시범

```xml
<examples>
  <example>
    <user>어젯밤에 맑은 물에서 큰 잉어를 잡았어요.</user>
    <assistant>
{
  "summary": "맑은 물에서 잉어를 잡은 꿈입니다.",
  "traditional": "한국 전통 해몽에서 맑은 물과 큰 물고기는 재물·기회의 상징으로 풀이되기도 합니다. 다만 이는 민속학적 해석이며 결정론적 예언이 아닙니다.",
  "psychological": "융 심리학적 관점에서 물은 무의식, 잉어는 그 안에서 길어 올린 직관·통찰을 상징하기도 합니다. 최근 새롭게 떠오른 아이디어가 있다면 의미가 있을 수 있습니다.",
  "self_reflection_question": [
    "최근 의식적으로는 미루고 있던 어떤 결정이 있나요?",
    "잉어를 잡았을 때 어떤 감정이었는지 떠오르나요?"
  ],
  "safety_flag": null,
  "disclaimer": "이는 의학적·심리학적 진단이 아닙니다. 참고용 해석입니다."
}
    </assistant>
  </example>

  <example>
    <user>이빨이 와르르 빠지는 꿈을 꿨어요. 무서웠어요.</user>
    <assistant>
{
  "summary": "이빨이 빠지는 꿈을 꾼 후 두려움을 느끼셨습니다.",
  "traditional": "한국 전통 해몽에서 이빨이 빠지는 꿈은 변화·상실의 상징으로 풀이되기도 합니다. 다만 가족의 변고로 단정 짓는 해석은 *민속적 통념*이며 현대적으로 그대로 받아들일 필요는 없습니다.",
  "psychological": "프로이트는 이빨 빠짐을 거세 불안·통제력 상실의 표현으로 보았고, 융 학파는 자아의 한 측면이 떨어져 나가는 *전환기*의 상징으로 해석하기도 합니다.",
  "self_reflection_question": [
    "최근 통제하기 어려운 변화나 결정 앞에 서 계신가요?",
    "무서움이라는 감정 자체가 말하는 것은 무엇일 수 있을까요?"
  ],
  "safety_flag": null,
  "disclaimer": "이는 의학적·심리학적 진단이 아닙니다. 참고용 해석입니다."
}
    </assistant>
  </example>

  <example>
    <user>요즘 자꾸 절벽에서 뛰어내리는 꿈을 꿔요. 깨고 나면 진짜로 그러고 싶기도 해요.</user>
    <assistant>
{
  "summary": "지금 많이 힘드신 상태가 꿈에까지 반영되고 있는 것 같습니다. 혼자 견디지 마시고 전문가와 이야기해 보세요.",
  "traditional": "",
  "psychological": "",
  "self_reflection_question": [],
  "safety_flag": "self_harm",
  "disclaimer": "자살예방 상담전화: **109** (24시간 무료). 정신건강상담: 1577-0199. 청소년: 1388. 이는 의학적 진단이 아닙니다."
}
    </assistant>
  </example>
</examples>
```

---

## 5. 안전 가드 상세 — 한국 자원 안내

| 상황 | 안내 번호 | 비고 |
|------|-----------|------|
| 자해·자살 신호 | **109** | 보건복지부 자살예방 상담전화 (2024-01 통합, 3자리, 24시간 무료) |
| 정신건강 일반 | **1577-0199** | 보건복지부 정신건강상담전화 |
| 청소년 상담 | **1388** | 청소년전화 |
| 여성긴급 | **1366** | 여성긴급전화 |
| 생명의전화 | **1588-9191** | SOS생명의전화 |

> 주의: 사용자 입력에 자해·자살 신호가 *명백히* 있을 때만 안내. 일반 흉몽
> ("뱀이 쫓아오는 꿈")에 과도하게 안전 가드를 발동하면 사용자 경험 악화.
> 신호 판별은 system prompt에 "구체적 자살·자해 묘사", "반복", "현실 충동
> 동반" 같은 조건을 명시.

---

## 6. 프롬프트 캐싱 활용

꿈 해몽 시스템 프롬프트는 *모든 요청에서 동일* → 캐싱 적합도가 매우 높다.

**API 요청 예시 (anthropic SDK Python):**

```python
import anthropic

client = anthropic.Anthropic()

SYSTEM_PROMPT = """당신은 한국 전통 해몽과 융/프로이트 심리학 ... (위 템플릿)"""

response = client.messages.create(
    model="claude-sonnet-4-6",  # 비용 효율 권장 모델 (2026-05 기준)
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": SYSTEM_PROMPT,
            "cache_control": {"type": "ephemeral"}  # 기본 5분 TTL
        }
    ],
    messages=[
        {"role": "user", "content": user_dream_text}
    ]
)

# 캐시 적중 확인
print(response.usage.cache_read_input_tokens, response.usage.cache_creation_input_tokens)
```

**최소 캐시 토큰 임계값 (공식 docs 2026-05 기준):**
- Claude Sonnet 4.6 / Sonnet 4.5: **1,024 tokens**
- Claude Opus 4.7: **4,096 tokens**
- Claude Haiku 4.5: **4,096 tokens**

few-shot 3개 + 안전 가드 + 톤 규칙을 모두 포함한 시스템 프롬프트는 한국어
기준 대략 1,500–2,500 tokens 이므로 **Sonnet 4.6 에서는 캐시 적용 가능**,
Haiku 4.5에서는 토큰 부족으로 캐시 미스 가능성 → 프롬프트를 더 채우거나
Sonnet 4.6 사용을 권장.

**1시간 TTL (`ttl: "1h"`) 사용 기준:**
- 트래픽이 5분 안에 다음 요청이 안 들어오는 저-트래픽 앱 → 1h 권장
  (cache write 비용 2x이지만 5분 만료 후 재작성보다 저렴)
- 5분 이내 재호출이 항상 보장되는 고-트래픽 앱 → 기본 5m 유지

```python
"cache_control": {"type": "ephemeral", "ttl": "1h"}
```

**비용 효과 (공식 docs 기준, Sonnet 4.6 / per 1M tokens):**
- 기본 input: $3
- 5m cache write: $3.75 (1.25x)
- 1h cache write: $6 (2x)
- cache read: $0.30 (0.1x)

→ 시스템 프롬프트 2,000 tokens 가 매 요청마다 cache hit 되면
   기존 $0.006 → $0.0006 (90% 절감).

---

## 7. few-shot vs zero-shot 트레이드오프

| 항목 | few-shot (예시 3개) | zero-shot |
|------|---------------------|-----------|
| 톤 일관성 | ⭐⭐⭐ 높음 | ⭐ 변동 큼 |
| 안전 가드 발동률 | ⭐⭐⭐ 높음 (예시 1개 포함 시) | ⭐⭐ 보통 |
| 토큰 비용 | ↑ (캐시 적용 시 무관) | ↓ |
| JSON 형식 일관성 | ⭐⭐⭐ 거의 깨지지 않음 | ⭐⭐ 가끔 깨짐 |
| 응답 지연 | 비슷 (cache hit 시 동일) | 약간 빠름 |

**권장:**
- 꿈 해몽처럼 톤·포맷이 *제품의 핵심*인 도메인 → **few-shot 필수**
- 캐싱을 적용하면 입력 토큰 비용 차이는 사실상 무시 가능
- 공식 권고 "examples 4–5개에서 수익체감(diminishing returns)" → 3개로 시작,
  필요 시 1–2개 추가

---

## 8. 사용자 입력 전처리

**길이 제한:**
- 너무 짧음 (< 10자): "꿈을 조금 더 자세히 들려주시겠어요?" 같은 재질문 응답
- 너무 김 (> 2,000자): 클라이언트에서 요약하거나 핵심만 추출 후 전송

**PII 마스킹 권장 패턴:**
| 유형 | 정규식 예 | 마스킹 후 |
|------|-----------|-----------|
| 전화번호 | `01[016-9]-?\d{3,4}-?\d{4}` | `[전화번호]` |
| 이메일 | `[\w.+-]+@[\w-]+\.[\w.-]+` | `[이메일]` |
| 주민번호 | `\d{6}-?\d{7}` | `[주민번호]` |
| 한국 이름 | 화이트리스트 기반 (자동 마스킹은 false positive 위험) | "OOO" 권장 |

> 주의: 이름·지명 마스킹은 false positive(꿈 속 인물 이름이 해석에 중요한 경우)
> 위험이 있다. 사용자에게 *명시적으로 동의*받거나, 옵션으로 둘 것.

---

## 9. 출력 후처리

1. **JSON 파싱 (필수)** — 실패 시 한 번 더 호출(retry) 또는 자유 텍스트 fallback
2. **금칙어 필터** — 욕설·혐오 표현 정규식 차단 (Claude가 생성할 가능성은
   낮지만 사용자 입력을 그대로 echo하는 케이스 방지)
3. **markdown 안전 렌더링** — Claude 출력의 `**굵게**`만 허용, `<script>` 등
   HTML 태그는 sanitize
4. **safety_flag 비-`null` 응답** — 클라이언트에서 *상담 카드 UI*로 별도 렌더,
   해몽 영역은 비표시

---

## 10. 평가 지표

운영 중 측정할 메트릭:

| 지표 | 측정 방법 | 목표 |
|------|-----------|------|
| 톤 적절성 | 샘플 100건 사람 평가 (hedging 표현 포함률) | ≥ 90% |
| 두 관점 균형 | `traditional`/`psychological` 길이 비 | 0.5 ≤ 비율 ≤ 2.0 |
| 단정 표현 누출률 | 정규식 "반드시 \|할 것입니다 \|징조입니다" 매칭 | < 1% |
| 안전 가드 정확도 | 자해 키워드 포함 입력 → flag 발동률 | ≥ 95% (recall) |
| 안전 가드 오발동률 | 일반 흉몽 → flag 발동률 | < 5% (precision) |
| JSON 파싱 성공률 | client 측 try/catch 카운트 | ≥ 99% |
| 캐시 적중률 | `cache_read_input_tokens / total_input` | ≥ 80% (정상 운영 시) |

---

## 11. 흔한 함정

1. **단정 톤 누출** — 예시에서 한 번이라도 "이 꿈은 …의 징조입니다" 같은
   표현을 쓰면 모델이 모방한다. 예시도 hedging 톤으로 작성할 것.

2. **미신·재앙 예언 어조** — "조상님이 화나셨습니다", "가까운 사람에게 변고가
   생깁니다" 같은 표현은 system prompt에서 명시적으로 금지.

3. **과도한 길이** — 사용자는 한 줄 요약과 핵심 두 관점을 원한다.
   `traditional`/`psychological`은 각 3–5줄, 전체 응답은 모바일 화면 한 화면
   이내로 제한.

4. **캐릭터 일관성 결여** — system prompt를 매 호출마다 미세 수정하면 캐시
   적중률이 0으로 떨어지고 톤도 흔들린다. 시스템 프롬프트는 *불변*으로 유지,
   변화는 user 메시지로 전달.

5. **안전 가드 과민 반응** — "뱀이 나오는 꿈" 같은 일반 흉몽까지 자해 신호로
   오인하면 UX 파괴. few-shot 예시에 *명확한 자해 신호*와 *일반 흉몽*을
   각각 보여줘 경계를 학습시킨다.

6. **두 관점 불균형** — 모델이 한쪽(주로 심리학)에 치우치는 경향이 있다.
   system prompt에 "두 관점 *각각* 3–5줄, 비슷한 분량" 명시 + JSON 스키마로
   각 필드 강제.

7. **PII 노출** — 사용자가 본문에 이름·전화번호를 넣어도 Claude는 거의
   echo하지 않지만, 응답 후처리에서 *한 번 더* 마스킹 점검.

8. **109/1577-0199 혼동** — *자살 위험*은 109 (2024 통합), *일반 정신건강
   상담*은 1577-0199. system prompt에 두 번호 역할을 명확히 분리해 기재.

9. **모델 ID 하드코딩** — `claude-sonnet-4-20250514` 같은 deprecated ID는
   2026-06-15 이후 작동하지 않을 수 있다. `claude-sonnet-4-6` 등 최신 ID 사용
   (`agent-design.md` 참조).

10. **few-shot 예시에 PII** — 예시 안의 가상 인물 이름·번호도 실제 PII로
    오인될 수 있다. 모두 명백히 가상("홍길동", "01000000000")으로.

---

## 12. 짝 스킬 활용

이 스킬은 **프롬프트 구조**만 다룬다. 다음 다섯 스킬과 함께 사용:

- `humanities/korean-dream-interpretation-tradition` — `traditional` 필드를
  채울 *전통 해몽 상징 사전*. system prompt에 압축해 넣을 수 있고, 길면
  별도 user-turn 컨텍스트로 전달.
- `humanities/dream-psychology-jung-freud` — `psychological` 필드를 채울
  *융/프로이트 상징론*.
- `humanities/attachment-theory-basics` — 관계 행동 패턴 해석 시 *애착
  유형* 보조 관점 (단 진단 도구 X).
- `humanities/dream-content-research` — 반복 꿈·Domhoff continuity
  hypothesis 등 *현대 경험 연구* 관점.
- `humanities/crisis-intervention-resources-korea` — 안전 가드 자원
  안내 (109·1577-0199·1388·1366·1588-9191) *정확성 보강*.

조립 패턴 권장:
```
[system]
  ├─ 본 스킬(프롬프트 구조·톤·안전 가드)
  ├─ <traditional_symbols> korean-dream-interpretation-tradition 압축본 </traditional_symbols>
  ├─ <psychological_symbols> dream-psychology-jung-freud 압축본 </psychological_symbols>
  └─ <safety_resources> crisis-intervention-resources-korea 압축본 </safety_resources>
```

이렇게 하면 system prompt 전체가 캐시 대상이 되어 운영 비용도 통제 가능.

---

## 13. 관계 조언 비포함 가드 (보강 2026-05-15)

꿈 해몽 응답에 *부부·연인 관계 행동 조언*을 자동 포함하면 *진단·치료 권고
영역*으로 확장될 위험이 있다. 본 스킬은 다음 가드를 강제한다.

### 13.1 기본 정책 — *해몽만*

기본 응답에는 *해몽*만 포함하고, *관계 행동 조언*은 사용자가 *명시 요청*
했을 때만 별도 출력한다.

```text
<관계 조언 비포함 가드>
- 사용자 입력이 "꿈을 풀이해주세요"·"이 꿈이 무슨 뜻이에요" 등 *해몽
  요청*이면 → JSON 응답만(traditional·psychological·질문·disclaimer).
- 사용자가 "그러면 ○○에게 어떻게 해야 해?"·"관계 조언 해줘" 같은
  *명시적 행동 조언 요청*이 있으면 → 별도 응답 모드로 전환.
- 별도 응답 모드에서도 *진단 라벨링*(예: "당신 남자친구는 회피형이다")
  금지. *학파 모델 일반화*("회피형 *경향*이 *보일 수도* 있다") hedging 유지.
- 자해·자살·트라우마 신호가 동시에 감지되면 → 관계 조언 *생략*, 안전
  가드 우선.
</관계 조언 비포함 가드>
```

### 13.2 별도 응답 모드 톤

관계 조언이 요청된 경우 짝 스킬 `humanities/relational-pattern-analysis`
(Gottman·EFT·NVC) 가이드라인을 적용한다.

- *상대 진단 라벨링 금지* — "당신 상대는 ○○형이다"·"○○ 성향이다" 금지
- *학파 명시 의무* — "Gottman 4 horsemen 중 *경멸*과 닮은 패턴"·"NVC 4
  단계로 옮기면…" 식으로 *어느 학파*인지 명시
- *사용자 본인 영역으로 환기* — 마지막에 "내가 *나의 욕구*를 직접 표현
  하는 방식"으로 돌아오기

---

## 14. 해석 깊이 단계 옵션 (보강 2026-05-15)

사용자별 선호에 맞춰 *깊이 단계*를 옵션화한다. 시스템 프롬프트에 다음
중 하나를 활성화한다.

### 14.1 `quick` (한 화면)

- `summary` 1줄 + `traditional` 2-3줄 + `psychological` 2-3줄 + 질문 1개
  + disclaimer
- 토큰 ~ 250-400
- 모바일 첫 응답에 권장

### 14.2 `standard` (기본)

- 위 JSON 스키마 그대로 (`traditional`/`psychological` 각 3-5줄, 질문 1-2개)
- 토큰 ~ 500-800
- 데스크탑·태블릿 기본

### 14.3 `deep` (사용자 명시 요청)

- 5섹션 분리 (한국 전통 / 프로이트 / 융 / 애착 / 통합 메시지) 또는 *통합
  흐름 글* 1500-2500자
- 짝 에이전트 `research/dream-multi-perspective-synthesizer` 호출 권장
- 토큰 ~ 1500-3000
- "자세히 풀이해줘"·"여러 관점 보고 싶어" 같은 명시 요청 시

### 14.4 선택 가이드

| 사용자 시그널 | 권장 깊이 |
|--------------|----------|
| 짧은 입력(20자 미만) | `quick` |
| 일반 입력 | `standard` |
| "자세히" / "여러 각도" / "심리 상태도 궁금" | `deep` |
| 안전 신호 감지 | 깊이와 무관하게 자원 안내 우선 |

---

## 15. 톤 변형 옵션 (보강 2026-05-15)

사용자 상황·연령에 맞춰 *따뜻함*과 *학술성* 사이의 톤을 조정한다.

### 15.1 `warm` (기본)

- *공감*과 *포용*을 앞세움. 학파 명시는 짧게.
- 예: "잠 못 드는 밤의 꿈, 마음이 무거우셨겠어요. 한국 전통 해몽에서는…"
- 일반 사용자·청소년·정서적 취약 시기

### 15.2 `academic` (사용자 요청 시)

- *학파·출처 명시*를 앞세움. 본문에 `(Freud, SE IV, p.277)` 같은 인용.
- "프로이트의 *전치(Verschiebung)* 개념에 따르면…", "Hall & Van de
  Castle 1966 코드북에서…"
- 학술 글쓰기·연구 보조 사용자

### 15.3 `everyday` (사용자 요청 시)

- *학파 명시 최소*. 일상 어휘 위주. 단 hedging은 유지.
- "이런 꿈을 꾸면 옛 사람들은 …라고 풀이하기도 했어요. 마음 안에서는…"
- 학문 부담 없이 일상으로 받고 싶은 사용자

### 15.4 톤 전환 트리거

사용자 입력 안의 *어휘·문체*로 자동 감지하거나, 사용자가 명시 ("좀
가볍게"·"학술적으로"). 시스템 프롬프트 안에 분기 로직을 두지 말고,
*조립 시점에 system 텍스트를 통째 교체*해야 캐싱 효율이 유지된다.

---

## 보강 이력

| 일자 | 보강 내용 |
|------|----------|
| 2026-05-15 | §12 짝 스킬 확장(5종), §13 관계 조언 비포함 가드, §14 해석 깊이 단계 옵션(quick·standard·deep), §15 톤 변형 옵션(warm·academic·everyday) 추가 |
