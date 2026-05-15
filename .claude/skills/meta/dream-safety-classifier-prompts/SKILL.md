---
name: dream-safety-classifier-prompts
description: >
  꿈 해몽 앱용 *전용 안전 분류기* 프롬프트 패턴 — 자해·자살·트라우마·폭력
  신호를 해몽 모델과 분리된 별도 Claude 호출로 분류해 이중 안전망을 구축한다.
  Anthropic content moderation 공식 가이드(risk-level + JSON 출력 + 카테고리
  정의 + few-shot) 기반.
  <example>사용자: "해몽 모델 안전 가드만으로 부족한 이유랑 분리 분류기 설계 보여줘"</example>
  <example>사용자: "self-harm 분류기 프롬프트 템플릿이랑 JSON 스키마 짜줘"</example>
  <example>사용자: "일반 흉몽이랑 진짜 자해 신호 어떻게 분류 기준 분리해?"</example>
---

# 꿈 텍스트 안전 분류기 — 분리형 프롬프트 패턴

> 소스:
> - Anthropic Content moderation use case guide — https://platform.claude.com/docs/en/about-claude/use-case-guides/content-moderation
> - Anthropic Building moderation filter (cookbook) — https://github.com/anthropics/anthropic-cookbook/blob/main/misc/building_moderation_filter.ipynb
> - Anthropic Increase output consistency — https://platform.claude.com/docs/en/docs/test-and-evaluate/strengthen-guardrails/increase-consistency
> - Anthropic Prompt caching — https://platform.claude.com/docs/en/build-with-claude/prompt-caching
> - Anthropic Building safeguards for Claude — https://www.anthropic.com/news/building-safeguards-for-claude
> - Anthropic Protecting the wellbeing of our users — https://www.anthropic.com/news/protecting-well-being-of-users
>
> 검증일: 2026-05-15
> 대상 모델: Claude Haiku 4.5 (분류기 권장) / Sonnet 4.6 (정확도 우선)

이 스킬은 짝 스킬 `meta/dream-interpretation-prompt-engineering`(해몽 *생성*
모델) 옆에 **두 번째 Claude 호출**로 배치되는 **안전 신호 분류기**의 프롬프트를
설계한다. 두 모델을 의도적으로 분리하는 이유는 §1에서, 분류기 구조는 §2~§8에서
다룬다.

짝 자료:
- `meta/dream-interpretation-prompt-engineering` — 해몽 생성 프롬프트
- (외부) 한국 위기 자원 안내 — `humanities/crisis-intervention-resources-korea`
  (별도 스킬 또는 본문 §5의 표를 참조)
- (외부) `validation/dream-safety-classifier` — 같은 프롬프트로 동작하는 검증
  에이전트 (스킬은 *패턴*, 에이전트는 *호출 주체*)

---

## 1. 왜 분리하는가 — 분리 동기

해몽 모델 안에 안전 가드를 두는 짝 스킬(`dream-interpretation-prompt-engineering`)이
이미 존재한다. 그럼에도 안전 분류기를 별도로 두는 이유:

| 차원 | 통합형(해몽 모델 내부 가드) | 분리형(별도 분류기 호출) |
|------|-----------------------------|--------------------------|
| 1차 목표 | 자연스럽고 균형 잡힌 해석 *생성* | 자해 신호 *정확 분류* |
| 평가 지표 | 톤 적절성, 두 관점 균형, 길이 | precision / recall, F1 |
| 모델 부담 | 생성 + 분류 동시 → 분류 신뢰도 부차적 | 분류 단독 → 최적화 가능 |
| 캐싱 효율 | 해몽 시스템 프롬프트 1개 캐시 | 분류기 짧은 프롬프트 1개 + 해몽 프롬프트 1개 (2개 캐시) |
| 모델 선택 | 해석 품질이 핵심 → Sonnet 4.6+ | 분류만 하면 됨 → Haiku 4.5로 비용↓·속도↑ |
| 장애 격리 | 한 호출 실패 = 둘 다 실패 | 분류기 실패 시 보수적(unsafe 가정)으로 fallback 가능 |
| 이중 안전망 | 1차 방어선만 존재 | 1차(분류기) + 2차(해몽 모델 내 가드) = 이중망 |

> Anthropic 공식 권고(content moderation 가이드)는 안전·정책 결정을 *별도 분류
> 호출*로 분리하는 것을 명시적으로 다룬다. "Content moderation is a
> classification problem"(공식 문서)이며, 분류는 생성과 *다른 평가 방법*과
> *다른 모델 크기*가 적합하다.

**운영 흐름:**

```
[사용자 꿈 입력]
       │
       ▼
[1단계: 안전 분류기]  ← 이 스킬이 다루는 부분
  ├─ safe  → [2단계: 해몽 모델] → 사용자에게 해석 반환
  └─ unsafe → [2단계 생략] → 위기 자원 카드 UI 반환
```

해몽 모델 내부 가드(`dream-interpretation-prompt-engineering` §2 안전 가드)는
*2차 방어선*으로 남겨두어, 분류기가 놓친 신호를 한 번 더 잡는다.

---

## 2. 분류 카테고리 정의

Anthropic content moderation 가이드(§"Define topics and provide examples")는
카테고리를 *정의(definition)*와 함께 제시할 것을 권한다. 분류기 프롬프트에
다음 사전을 그대로 포함한다.

| 카테고리 | 정의 | 한국 자원 매핑 |
|----------|------|----------------|
| `null` (safe) | 어떤 안전 위협 신호도 없는 일반적 꿈. 흉몽이라도 자해·자살 의도와 무관한 상징(뱀·죽음·이빨 빠짐 등)은 여기에 속한다. | 해몽 모델로 진행 |
| `self_harm` | 자해·자살에 대한 *구체적 묘사·의도·계획·반복 충동*. 단순히 "죽는 꿈"이 아니라, *현실 충동* 또는 *수단 묘사*가 있을 때. | 109 (자살예방), 1577-0199 |
| `trauma` | 같은 외상적 사건(폭행·사고·전쟁·재난 등)이 *반복*적으로 재현되는 PTSD 의심 패턴. 사용자가 "또"·"반복"·"매일"·"매주" 같은 빈도 표현을 동반. | 1577-0199 (정신건강), 정신건강의학과 권유 |
| `violence_toward_others` | 사용자 본인이 *타인을 가해*하는 구체적 묘사 — 살해·심각한 폭력. 피해자가 되는 꿈은 여기에 속하지 않음. | 정신건강의학과 권유 (분류 후 즉시 차단 대신 *해석 생략 + 자원 안내*) |
| `severe_distress` | 자살 신호는 명백하지 않지만 *심각한 정서 고통*("못 견디겠다", "사라지고 싶다") 표현. 회색 영역이며 자원 안내가 도움이 됨. | 109 또는 1577-0199 권유 |

**False positive 회피 기준 (분류기 프롬프트에 명시):**
- 일반 흉몽(뱀, 죽는 꿈, 절벽에서 떨어짐, 이빨 빠짐 등)은 *상징적 죽음*이므로
  `null`로 분류한다.
- "죽었다"·"죽는다"가 단순 사건 서술이면 `null`. *주체*가 본인이고 *수단*이
  구체적이면 `self_harm`.
- 영화·게임·소설 기반 폭력 묘사는 `null` 가능 — 사용자가 명시적으로 그 맥락을
  표시했을 때.

**False negative 회피 기준 (recall 우선):**
- 명시적 자살 단서("뛰어내리고 싶다", "사라지고 싶다", "그러고 싶기도 해요")는
  confidence가 낮아도 *반드시* `self_harm` 또는 `severe_distress`로.
- 분류기가 애매할 때는 *unsafe 쪽으로* 분류한다. 해몽 한 번 못 받는 것보다
  위기 자원 한 번 더 보는 것이 안전.

---

## 3. 분류기 시스템 프롬프트 템플릿

```text
당신은 한국어 꿈 텍스트의 *안전 신호 분류기*입니다. 해석·해몽을 하지 않습니다.
오직 카테고리를 판정하고 JSON으로 반환합니다.

<역할>
- 입력: 사용자가 작성한 꿈 텍스트 한 편
- 출력: 아래 JSON 스키마를 따르는 JSON 객체 하나 (다른 텍스트·코드펜스 금지)
- 판단: 5개 카테고리 중 정확히 하나(category 필드)와 신뢰도(confidence)를 반환
</역할>

<카테고리>
- null: 안전 위협 신호 없는 일반적 꿈. 흉몽·상징적 죽음·일반적 폭력 이미지는 여기에 속한다.
- self_harm: 자해·자살의 *구체적 묘사 또는 현실 충동*. 단순한 죽는 꿈은 제외.
- trauma: 동일 외상 사건이 *반복적으로 재현*되는 PTSD 의심 패턴. "또", "매일", "매주", "자꾸" 같은 빈도 표현 동반.
- violence_toward_others: 사용자 본인이 *타인을 가해*하는 구체적 묘사 (살해·심각한 폭력). 피해자가 되는 꿈은 null.
- severe_distress: 자살 신호는 명백하지 않지만 심각한 정서 고통("못 견디겠다", "사라지고 싶다", "지친다 너무") 표현.
</카테고리>

<판정 규칙>
- *명시적 자살·자해 단서*(현실 충동·구체적 수단·반복 의도)는 confidence가 낮아도 반드시 self_harm 또는 severe_distress로 분류한다. **Recall 우선.**
- 일반 흉몽(뱀, 죽는 꿈, 절벽에서 떨어짐, 이빨 빠짐 등 상징적 죽음)은 null. **False positive 회피.**
- 회색 영역에서는 *unsafe 쪽*으로 분류한다.
- signals 필드에 *판정 근거가 된 사용자 문장*을 그대로 인용한다. 인용 없이 추측 금지.
</판정 규칙>

<출력 스키마>
{
  "category": "null" | "self_harm" | "trauma" | "violence_toward_others" | "severe_distress",
  "confidence": 0.0~1.0 사이의 실수,
  "signals": ["감지한 사용자 원문 인용 1", "인용 2"],
  "rationale": "분류 근거 한 줄"
}
</출력 스키마>

<examples>
  (… §4 few-shot 5개 …)
</examples>
```

**설계 근거 (공식 가이드 매핑):**
- 카테고리에 *정의 동봉* → content moderation "Define topics and provide examples"
- JSON only, 코드펜스 금지 → "Specify the desired output format"
- `<category>`, `<rationale>` XML 구획 → "Structure prompts with XML tags"
- few-shot으로 경계 학습 → "Constrain with examples"
- temperature=0 + max_tokens 작게(150~250) → "Use 0 temperature for increased consistency"

---

## 4. few-shot 예시 (5개 권장)

분류기는 *경계*가 핵심이므로 각 카테고리당 1개씩 + 일반 흉몽 false-positive
방지용 1개 = **5개**가 권장이다. (공식 cookbook은 4~5개에서 수익체감 명시.)

```xml
<examples>

  <example>
    <user>맑은 물에서 큰 잉어를 잡았어요.</user>
    <assistant>{"category":"null","confidence":0.98,"signals":[],"rationale":"길몽 상징, 안전 신호 없음."}</assistant>
  </example>

  <example>
    <user>이빨이 와르르 빠지고 뱀이 쫓아오는 꿈을 꿨어요. 너무 무서웠어요.</user>
    <assistant>{"category":"null","confidence":0.93,"signals":["이빨이 와르르 빠지고","뱀이 쫓아오는"],"rationale":"일반 흉몽의 전형적 상징. 현실 충동·자해 단서 없음."}</assistant>
  </example>

  <example>
    <user>요즘 자꾸 절벽에서 뛰어내리는 꿈을 꿔요. 깨고 나면 진짜로 그러고 싶기도 해요.</user>
    <assistant>{"category":"self_harm","confidence":0.95,"signals":["자꾸 절벽에서 뛰어내리는 꿈","진짜로 그러고 싶기도 해요"],"rationale":"반복 + 현실 충동 동반 — 명시적 자살 신호."}</assistant>
  </example>

  <example>
    <user>2년 전에 교통사고를 당했는데 그때 장면이 매주 두세 번씩 거의 그대로 꿈에 나와요.</user>
    <assistant>{"category":"trauma","confidence":0.9,"signals":["2년 전 교통사고","매주 두세 번씩 거의 그대로"],"rationale":"동일 외상 사건의 반복 재현 — PTSD 의심 패턴."}</assistant>
  </example>

  <example>
    <user>요즘 너무 지쳐서 그냥 조용히 사라지고 싶다는 생각이 들어요. 어젯밤엔 그런 꿈도 꿨고요.</user>
    <assistant>{"category":"severe_distress","confidence":0.85,"signals":["너무 지쳐서","조용히 사라지고 싶다는 생각"],"rationale":"명시적 자살 수단 묘사는 없으나 심각한 정서 고통과 소실 욕구 — 보수적으로 severe_distress."}</assistant>
  </example>

</examples>
```

> 주의: 예시 안의 가상 사례여도 *현실에서 발생 가능한 표현*을 사용해야 한다.
> 동시에 PII(실명·연락처·주소)는 들어가지 않게 한다.

---

## 5. JSON 응답 스키마

분류기가 반환할 단일 JSON 객체:

```json
{
  "category": "null",
  "confidence": 0.98,
  "signals": [],
  "rationale": "안전 신호 없음."
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `category` | string | 5개 enum 중 하나 |
| `confidence` | number (0.0~1.0) | 분류 신뢰도. 회색 영역에서는 0.5~0.7 범위로 반환됨 |
| `signals` | string[] | 판정 근거가 된 *사용자 원문 인용*. null 카테고리는 빈 배열 |
| `rationale` | string | 분류 근거 한 줄 (운영 로그·디버깅용) |

**클라이언트 분기 로직 (권장):**

```python
def gate(classification: dict) -> str:
    cat = classification["category"]
    conf = classification["confidence"]

    # binary 처리 금지 — confidence 활용
    if cat == "null" and conf >= 0.7:
        return "PROCEED_TO_INTERPRETATION"
    if cat == "null" and conf < 0.7:
        return "PROCEED_BUT_FLAG_FOR_REVIEW"  # 회색 → 진행하되 로깅
    if cat in ("self_harm", "severe_distress"):
        return "SHOW_CRISIS_RESOURCES"  # 109 / 1577-0199 카드
    if cat == "trauma":
        return "SHOW_MENTAL_HEALTH_RESOURCES"  # 1577-0199 / 정신과 권유
    if cat == "violence_toward_others":
        return "SHOW_INTERPRETATION_DECLINED_WITH_RESOURCES"  # 해석 생략 + 자원
    return "SHOW_CRISIS_RESOURCES"  # 알 수 없는 카테고리는 보수적
```

---

## 6. 한국 위기 자원 매핑

| 카테고리 | 우선 안내 자원 | 비고 |
|----------|----------------|------|
| `self_harm` | **109** (자살예방 상담전화, 24시간 무료, 2024-01 통합) | 보건복지부 |
| `severe_distress` | **109** 또는 **1577-0199** (정신건강상담) | 신뢰도 0.85↑면 109, 그 미만이면 1577-0199 |
| `trauma` | **1577-0199** + 정신건강의학과 권유 | PTSD는 의료 영역 |
| `violence_toward_others` | **1577-0199** + 정신건강의학과 권유 | 분류기는 해석만 차단, 신고·차단은 별도 정책 |
| 청소년 추정 | **1388** 추가 안내 | 사용자 연령 정보 있을 때 |

분류기는 *카테고리만 반환*하고, 자원 안내 문구 생성은 클라이언트(또는 별도
호출)에서 수행한다. 분류기에 자원 문구를 섞으면 *순수 분류 평가가 어려워진다*.

---

## 7. 평가 지표 — Recall 우선

분류기는 *분류 문제*이므로 표준 분류 지표를 쓴다. 안전 도메인에서는 **Recall**이
**Precision**보다 우선한다.

| 지표 | 정의 | 목표 |
|------|------|------|
| Recall (self_harm) | 실제 자해 신호 중 분류기가 잡은 비율 | ≥ 99% (놓치면 안 됨) |
| Precision (전체 unsafe) | unsafe로 분류한 것 중 실제 unsafe 비율 | ≥ 85% (일반 흉몽 false positive 통제) |
| False positive rate (일반 흉몽) | 흉몽 입력 중 unsafe로 잘못 분류한 비율 | < 5% (UX 보호) |
| F1 (per category) | precision/recall 조화 평균 | per-category 트래킹 |
| Latency (p95) | 분류기 호출 응답 시간 | < 800ms (해몽 호출 전 단계) |

**Recall vs Precision 트레이드오프 가이드:**

```
recall ↑ ─────────────────────────────────────────────→ precision ↑
"unsafe 쪽으로 보수적"     "확실할 때만 unsafe"
False positive 多          False negative 多
일반 흉몽도 차단됨         자해 신호 놓침
→ UX ↓                    → 안전 사고 ↑

권장 위치: recall 강하게 끌어올린 후, false-positive 회피용 few-shot 추가로
          precision 끌어올림. binary가 아니라 두 지표 *동시* 최적화.
```

**평가 절차 (공식 권고 매핑):**
1. 골든셋 200~500건 구축 — 카테고리별 균등 + 경계 케이스 30% 포함
2. 분류기 호출 → confusion matrix 산출
3. 카테고리별 precision/recall 계산
4. false negative(특히 self_harm 누락)는 *개별 분석* — 각 케이스에 대해
   프롬프트·few-shot 보강
5. 골든셋 외부에서 매주 *프로덕션 샘플* 100건 사람 평가 — drift 감지

> 공식 권고: "Continuously evaluate and improve. Regularly assess performance
> using precision and recall tracking." (content moderation guide).

---

## 8. 운영 패턴 — 호출 순서와 비용

```python
import anthropic, json

client = anthropic.Anthropic()

SAFETY_CLASSIFIER_SYSTEM = """...§3 템플릿 전체..."""

DREAM_INTERPRETER_SYSTEM = """...짝 스킬의 해몽 시스템 프롬프트..."""

def handle_dream(user_dream: str) -> dict:
    # 1단계: 분류기 (Haiku 4.5, 빠르고 저렴)
    safety = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=200,
        temperature=0,
        system=[{
            "type": "text",
            "text": SAFETY_CLASSIFIER_SYSTEM,
            "cache_control": {"type": "ephemeral"},
        }],
        messages=[{"role": "user", "content": user_dream}],
    )
    classification = json.loads(safety.content[0].text)

    # 분기
    if classification["category"] != "null":
        return {
            "mode": "crisis_resources",
            "category": classification["category"],
            "signals": classification["signals"],
        }

    # 회색 영역: null인데 confidence < 0.7 → 로깅하고 진행
    if classification["confidence"] < 0.7:
        log_for_review(user_dream, classification)

    # 2단계: 해몽 모델 (Sonnet 4.6, 해석 품질 우선)
    interpretation = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=[{
            "type": "text",
            "text": DREAM_INTERPRETER_SYSTEM,
            "cache_control": {"type": "ephemeral"},
        }],
        messages=[{"role": "user", "content": user_dream}],
    )
    return {
        "mode": "interpretation",
        "result": json.loads(interpretation.content[0].text),
    }
```

**비용 분석 (per dream, 2026-05 공식 가격 기준):**

| 호출 | 모델 | 입력 토큰 | 출력 토큰 | 단가 | 회당 비용 |
|------|------|-----------|-----------|------|-----------|
| 분류기 | Haiku 4.5 | ~700 (캐시 hit 시 ~50) | ~80 | $1.00 / $5.00 per MTok | ~$0.0005 |
| 해몽 | Sonnet 4.6 | ~2,000 (캐시 hit 시 ~100) | ~800 | $3.00 / $15.00 per MTok | ~$0.013 |

분류기는 해몽 비용의 **~4%** 수준 — 이중 안전망의 비용 부담은 무시 가능.

> 주의: Haiku 4.5의 prompt cache 최소는 **4,096 tokens**이다. §3 분류기 시스템
> 프롬프트는 한국어 기준 ~700~900 tokens 이므로 **단독으로는 캐시 미적용**.
> few-shot을 더 늘려 4,096 tokens 이상으로 키우거나, Sonnet 4.6(최소 1,024
> tokens)로 분류기를 운영하면 캐시 가능. 트래픽이 매우 많지 않으면 캐시 없이도
> 회당 $0.0005 수준이므로 Haiku 4.5 권장.

---

## 9. Prompt Caching 전략

| 모델 | 캐시 최소 토큰 | 분류기 적용 가능성 |
|------|---------------|----------------|
| Claude Haiku 4.5 | 4,096 | few-shot 7~10개로 확장하면 가능 |
| Claude Sonnet 4.6 | 1,024 | 기본 템플릿(§3)으로 적용 가능 |
| Claude Opus 4.7 | 4,096 | (분류기에 Opus는 과잉) |

**선택 가이드:**
- 트래픽 < 1,000 req/day → 캐시 무시, Haiku 4.5 단순 호출
- 트래픽 ≥ 1,000 req/day → Sonnet 4.6 + cache (회당 입력 비용 90% 절감)
- 분류기 시스템 프롬프트는 *불변*으로 유지 — 매 호출마다 동일해야 캐시 적중

---

## 10. 흔한 함정

1. **분류기를 해몽 모델 안에 통합** — 두 작업의 평가 지표가 달라 *둘 다*
   품질이 떨어진다. 분류는 분류대로 precision/recall 평가, 생성은 생성대로
   톤·균형 평가. 분리가 정답.

2. **일반 흉몽 false positive** — 뱀·이빨 빠짐·죽는 꿈 같은 *상징적* 죽음을
   `self_harm`으로 분류하면 사용자 경험이 파괴된다. few-shot에 *명시적*으로
   "일반 흉몽 → null" 예시를 1개 이상 포함.

3. **명시 자살 신호 false negative** — "사라지고 싶다", "그러고 싶기도 해요"
   같은 표현을 *완곡어*라는 이유로 `null` 처리하면 안전 사고. 판정 규칙에
   "**Recall 우선**, 회색 영역은 unsafe 쪽으로" 명시.

4. **confidence 무시한 binary 사용** — `category == "null"`만 보고 진행/차단
   결정하면 *회색 영역*(confidence 0.5~0.7)을 잡지 못한다. 두 차원(category +
   confidence)을 모두 분기 조건에 사용.

5. **JSON 파싱 실패 무시** — Claude가 JSON 외 텍스트를 섞을 가능성은 낮지만
   0이 아니다. `try/except json.JSONDecodeError` + retry 1회 + fallback
   (unsafe로 처리)을 둘 것. 분류기 fallback은 *보수적 unsafe*가 정답.

6. **분류기 프롬프트에 자원 안내문 혼합** — "self_harm이면 109 안내 문구
   생성"을 분류기에 시키면, *분류 평가가 어려워지고*, *문구 품질도 떨어진다*.
   분류기는 카테고리만, 자원 문구는 클라이언트(또는 별도 호출)에서.

7. **카테고리 정의 누락** — 카테고리 이름만 나열하고 정의를 빼면 모델이 자기
   해석을 만든다. 공식 가이드 권고대로 *정의 동봉* 필수 (§2).

8. **temperature > 0** — 분류기는 *일관성*이 핵심. `temperature=0` 고정.
   해몽 모델(생성)은 약간의 다양성을 위해 0.3~0.5도 허용되지만 분류기는 0.

9. **모델 ID 하드코딩** — `claude-haiku-4-20240307` 같은 구 모델 ID는
   deprecated. 현행은 `claude-haiku-4-5-20251001` (cookbook 사용) 또는
   별칭 `claude-haiku-4-5`. `agent-design.md` 참조.

10. **분류기 호출 실패 시 fail-open** — 네트워크 오류로 분류기 호출이 실패했을
    때 *해몽 모델로 그냥 진행*하면 1차 안전망이 무력화된다. fail-closed로:
    분류기 실패 → "잠시 후 다시 시도해 주세요" 또는 보수적 unsafe 처리.

---

## 11. 짝 스킬과의 분리 원칙 재확인

| 책임 | 이 스킬 (분류기) | `dream-interpretation-prompt-engineering` (해몽) |
|------|------------------|------------------------------------------------|
| 입력 위험도 판정 | ✅ 1차 방어 | ❌ (분류기 통과 후 호출됨) |
| 해석 *생성* | ❌ 안 함 | ✅ |
| 해석 안전 가드 | ❌ | ✅ 2차 방어 (분류기가 놓친 신호 잡기) |
| 한국 자원 문구 | ❌ (카테고리만 반환) | ✅ (자원 카드 UI는 클라이언트 또는 해몽 응답 안에) |
| 평가 지표 | precision / recall / F1 | 톤 / 균형 / hedging |
| 권장 모델 | Haiku 4.5 (또는 캐시 적용 Sonnet 4.6) | Sonnet 4.6 |

이 분리는 *중복*이 아니라 *이중 안전망*이다. 분류기가 자해 신호를 놓쳐도,
해몽 모델 내부 가드가 한 번 더 잡는다. 반대로 해몽 모델 내부 가드가 비활성화
되거나 변형되더라도, 분류기가 1차에서 막는다.
