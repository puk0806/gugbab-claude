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
| Claude Opus 5.5 | **512** (2026-09-28 공식 표 등재 확인 — Opus 5와 동일) |
| Claude Sonnet 5 (및 Opus 4.8 / Sonnet 4.6 / Sonnet 4.5) | **1,024** |
| Claude Opus 4.7 | **2,048** |
| Claude Opus 4.6 / 4.5, Claude Haiku 4.5 | **4,096** |

> 임계값은 세대순으로 단조롭지 않다 — Opus 5가 512로 가장 낮고, Haiku 4.5·
> Opus 4.6이 4,096으로 가장 높다. 임계 미달이면 **에러 없이 조용히 캐시가
> 무시**되므로 `usage` 필드로 반드시 확인한다.

**비용 배수 (공식):** 5분 캐시 쓰기 1.25x / 1시간 캐시 쓰기 2x / 캐시 읽기 0.1x.
> 단, **Claude Opus 5.5는 캐시 읽기 0.05x**(표준 0.1x보다 우대, 아래 표) — 2026-09-28 공식 가격표(platform.claude.com/docs/en/about-claude/pricing) 확인.

| 모델 | 기본 input | 5m write | 1h write | cache read |
|------|-----------|----------|----------|-----------|
| Claude Sonnet 5 | $2 / MTok | $2.50 | $4 | $0.20 |
| Claude Opus 5.5 | $4 / MTok | $5 | $8 | $0.20 (0.05x 배수 — 표준 0.1x보다 우대) |
| Claude Opus 5 (구세대) | $5 / MTok | $6.25 | $10 | $0.50 |

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

9. **모델 ID 하드코딩** — 예제·설정에는 현행 별칭 ID(`claude-opus-5-5`,
   `claude-sonnet-5`, `claude-haiku-4-5`)를 쓴다. `claude-opus-5`·`claude-opus-4-8`·
   `claude-sonnet-4-6`은 아직 호출되는 legacy지만 신규 코드에는 쓰지 않는다(2026-09-25 기준).
   Opus 5.5로 올릴 때는 강제 `tool_choice`·thinking disabled가 400이므로 Structured Outputs 경로를 유지한다.

10. **불안 조장 후 유료 전환** — "액운이 있으니 부적 결제" 같은 흐름은 재미를
    공포로 바꾸는 설계이자 Apple 2.3.1(오해를 부르는 마케팅) 리스크다. 유료 상품은
    *더 깊은 해석*으로 팔고 *공포*로 팔지 않는다.

11. **AI 고지 누락** — Anthropic Usage Policy는 외부 노출 AI 에이전트가 사람이 아닌
    AI임을 이용자에게 분명히 알리도록 요구한다. 온보딩·결과 화면에 고지를 둔다.
