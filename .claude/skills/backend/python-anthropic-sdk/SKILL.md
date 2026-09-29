---
name: python-anthropic-sdk
description: >
  Anthropic Python SDK(`anthropic` 패키지) — Python 백엔드에서 Claude API를 호출하는
  방법. 동기/비동기 클라이언트, Messages API, 스트리밍, 프롬프트 캐싱(5m/1h),
  도구 사용, 비전 입력, 에러 핸들링·재시도, 토큰 카운팅, AWS Bedrock / GCP Vertex
  변형까지 다룬다.
  <example>사용자: "FastAPI에서 Claude API를 비동기로 호출하면서 스트리밍하고 싶다"</example>
  <example>사용자: "긴 시스템 프롬프트를 캐시해서 비용을 줄이고 싶다"</example>
  <example>사용자: "Claude API 응답을 도구 호출로 받아 JSON 형태로 처리하고 싶다"</example>
---

# Python Anthropic SDK — Claude API 통합 가이드 (Python 백엔드)

> 소스:
> - 공식 문서 (Python SDK): https://platform.claude.com/docs/en/api/sdks/python
> - 공식 GitHub: https://github.com/anthropics/anthropic-sdk-python
> - 프롬프트 캐싱: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
> - 스트리밍: https://platform.claude.com/docs/en/build-with-claude/streaming
> - 비전 입력: https://platform.claude.com/docs/en/build-with-claude/vision
> - 적응형 사고(adaptive thinking): https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking
> - effort 파라미터: https://platform.claude.com/docs/en/build-with-claude/effort
> - 모델 마이그레이션: https://platform.claude.com/docs/en/about-claude/models/migration-guide
> - SDK v1.0 마이그레이션: https://github.com/anthropics/anthropic-sdk-python/blob/main/MIGRATION.md
> 검증일: 2026-09-28 (최초 2026-05-15)
> SDK 기준 버전: `anthropic` v1.8.0 (PyPI latest, 2026-09-28 확인 — 2026-08-20 v1.0.0 메이저 업그레이드), **Python 3.10+ 요구** (v1.0.0부터 3.9 지원 종료 — 3.9 환경은 `anthropic>=0.125,<1` 구버전 핀 필요)
> 모델 기준 (2026-09-25 현행화): Claude Opus 5.5(`claude-opus-5-5`) 기본 권장 / Fable 5.1(`claude-fable-5-1`) / Sonnet 5(`claude-sonnet-5`) / Haiku 4.5(`claude-haiku-4-5`)
> 구세대(서비스 중): Opus 5(`claude-opus-5`)·Fable 5(`claude-fable-5`)·Opus 4.8/4.7/4.6·Sonnet 4.6

---

## 짝 스킬 (Companion Skills, 설치된 경우 참조)

- `backend/python-fastapi` — Python 백엔드 프레임워크
- `backend/python-async-asyncio` — 비동기 동작 (AsyncAnthropic 사용 시 필수 이해)
- `frontend/claude-api-streaming-frontend` — 프론트엔드에서 SSE 스트림 수신 측

이 스킬은 **Python 백엔드 측** 통합만 다룬다. 프론트엔드 측 SSE 처리는 짝 스킬을 참조한다.

---

## 1. 설치

```bash
# 기본
pip install anthropic

# uv 사용 시
uv add anthropic

# 플랫폼 통합 extras
pip install "anthropic[bedrock]"   # AWS Bedrock
pip install "anthropic[vertex]"    # GCP Vertex AI
pip install "anthropic[aws]"       # Claude Platform on AWS
pip install "anthropic[aiohttp]"   # 비동기 성능 개선 (aiohttp 백엔드)
```

**Python 요구 버전:** 3.10 이상 (v1.0.0부터 — 이전 3.9+에서 상향).

설치 후 버전 확인:

```python
import anthropic
print(anthropic.__version__)
```

### 1.1 v0.x → v1.x 마이그레이션 (2026-08-20 v1.0.0, 브레이킹 체인지)

> 주의: 기존 v0.x 코드를 유지보수 중이면 아래 체크리스트를 먼저 확인한다. Python 3.9 환경은 SDK를 올리기 전에 런타임부터 3.10+로 올려야 한다(그전까지는 `anthropic>=0.125,<1` 핀 유지).

| 변경 | Before (v0.x) | After (v1.x) |
|------|---------------|--------------|
| **HTTP 레이어** | `httpx` | **`httpx2`**(Pydantic 팀이 유지보수하는 fork). 반환 객체는 동일 속성을 갖는 httpx2 타입 — `isinstance`/타입 힌트만 `httpx2`로 교체 필요 |
| Python 최소 버전 | 3.9+ | **3.10+** |
| Text Completions API | `client.completions.create()`, `HUMAN_PROMPT`/`AI_PROMPT` | **제거됨** — `client.messages.create()` + 문자열 프롬프트 사용 |
| 샘플링 파라미터(구형 모델용) | `messages.create(..., temperature=0.2)` | 메서드 시그니처에서 **제거** — `extra_body={"temperature": 0.2}`로 전달 |
| `output_format` (구조화 출력) | `client.beta.messages.create(..., output_format={...})` | `output_config={"format": {...}}` (또는 `messages.parse(..., output_format=Model)` 헬퍼) |
| 비동기 raw response | `await client.x.with_raw_response.create(...)` 후 `.parse()`는 **동기** | `.parse()`/`.text()`/`.read()` 모두 **`await` 필요** (async 클라이언트) |
| `AnthropicBedrock` region | 미지정 시 `us-east-1` 암묵 사용 | **`aws_region` 명시 필수** (또는 `AWS_REGION` 환경변수) — 미지정 시 에러 |
| 커스텀 헤더 | 대소문자 다른 키 = 둘 다 전송 | **대소문자 구분 없음** — 나중 키가 앞 키를 덮어씀 |

> httpx2로 넘어가는 가장 간단한 경로: 앱 진입점 최상단에서 `import httpx2; httpx2.alias_httpx()` 한 줄로 기존 `import httpx` 코드를 그대로 유지할 수 있다(공식 MIGRATION.md 권장). `httpx.Timeout` 등 SDK에 값으로 넘기는 객체를 직접 구성하는 코드는 섹션 9.3(REFERENCE.md) 참조 — `httpx2` 기준으로 갱신 필요.
> 소스: https://github.com/anthropics/anthropic-sdk-python/blob/main/MIGRATION.md , https://github.com/anthropics/anthropic-sdk-python/releases/tag/v1.0.0

---

## 2. 클라이언트 생성

### 2.1 동기 클라이언트 (`Anthropic`)

```python
import os
from anthropic import Anthropic

client = Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY"),  # 기본값이므로 생략 가능
)
```

### 2.2 비동기 클라이언트 (`AsyncAnthropic`)

→ references/REFERENCE.md §15 (비동기 클라이언트 생성 예제)

### 2.3 환경변수 관리 (보안 필수)

- API 키를 **코드에 하드코딩하지 않는다.** `ANTHROPIC_API_KEY` 환경변수에 둔다.
- 로컬 개발은 `.env` + `python-dotenv` 권장 (`.env` 는 `.gitignore`에 추가).
- 컨테이너/서버 배포는 시크릿 매니저(AWS Secrets Manager, GCP Secret Manager, Kubernetes Secrets) 사용.
- 로그에 API 키가 찍히지 않도록 검토. `Authorization` 헤더는 SDK가 자동 처리하므로 직접 다루지 않는다.

```python
# .env
# ANTHROPIC_API_KEY=sk-ant-...

from dotenv import load_dotenv
load_dotenv()

from anthropic import Anthropic
client = Anthropic()  # 환경변수 자동 로드
```

---

## 3. Messages API — 기본 호출

```python
message = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, Claude"},
    ],
)

print(message.content)         # 응답 콘텐츠 블록 리스트
print(message.usage)           # Usage(input_tokens=..., output_tokens=...)
print(message._request_id)     # 디버깅용 request-id (공개 속성)
```

**주요 파라미터:**

| 파라미터 | 필수 | 설명 |
|----------|:----:|------|
| `model` | ✅ | 모델 ID (다음 섹션 참조) |
| `max_tokens` | ✅ | 생성할 최대 출력 토큰 |
| `messages` | ✅ | `{"role": "user"|"assistant", "content": ...}` 배열 |
| `system` | | 시스템 프롬프트(문자열 또는 텍스트 블록 배열) |
| `thinking` | | `{"type": "adaptive"}` — Opus 5.5·Opus 5는 **기본 ON**(생략 시 adaptive). Opus 5.5는 끌 수 없음 |
| `output_config` | | `{"effort": "low"\|"medium"\|"high"\|"xhigh"\|"max"}` — 사고 깊이·토큰 사용량 조절. 기본값 Opus 5.5 = `medium`, Opus 5 = `high` |
| `tools` | | 도구 정의 배열 (섹션 6) |
| `stream` | | `True` 시 SSE 스트림 반환 |

> **주의 — 5 계열(Opus 5.5·Opus 5·Sonnet 5·Fable 5.1·Fable 5)과 Opus 4.7/4.8에서 제거된 파라미터:**
> - `temperature` / `top_p` / `top_k` → **400 에러**. 제거하고 프롬프팅으로 출력 성향을 유도한다.
> - `thinking: {"type": "enabled", "budget_tokens": N}` → **400 에러**. `{"type": "adaptive"}` + `output_config.effort`로 대체한다.
> - 마지막 assistant 턴 prefill → **400 에러**. `output_config.format`(structured outputs) 또는 시스템 프롬프트로 대체한다.
>
> **Opus 5.5 고유 규약 (2026-09-25 기본 권장 모델):**
> - 사고를 **끌 수 없다** — `thinking: {"type": "disabled"}`와 `budget_tokens`는 effort 수준과 무관하게 **400 에러**. `thinking`은 생략하거나 `{"type": "adaptive"}`만 쓰고, 비용·지연은 `output_config.effort`(`low` 등)로만 줄인다.
> - effort **기본값이 `medium`**(Opus 5는 `high`)이므로, Opus 5에서 옮겨온 경로는 effort를 명시한다.
> - 강제 `tool_choice`(`{"type": "any"}`·`{"type": "tool", ...}`) → **400 에러**. `auto` + 도구의 `strict: true` 또는 structured outputs(`output_config.format` / `messages.parse`)로 대체한다(섹션 6.3). Fable 5.1도 동일.
> - thinking 블록은 생성 모델·대화에 묶인다(preserved thinking) — 이전 턴을 편집하지 말고 append-only로 이어 붙인다.
> - 컴퓨터 사용 도구는 `computer_toolset_20260801`만 허용(`computer_20251124`는 400).
> - `max_tokens`는 *사고 + 응답 텍스트* 합산 상한이므로 여유를 둔다.
> - `thinking.display` 기본값은 `"omitted"`(사고 텍스트가 빈 문자열). 사용자에게 추론 요약을 보여주려면 `{"type": "adaptive", "display": "summarized"}`를 명시한다.
>
> **Opus 5(구세대, 서비스 중) 규약 — 레거시 대응용:**
> - 사고가 **기본 ON**(파라미터 생략 시 adaptive), effort 기본 `high`.
> - `thinking: {"type": "disabled"}`는 effort `high` 이하에서만 허용된다. `xhigh`/`max`와 함께 쓰면 **400 에러**. 강제 `tool_choice`는 허용된다.

```python
# 5 계열 권장 형태 — 샘플링 파라미터 없이 thinking + effort로 제어
message = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=16000,
    thinking={"type": "adaptive", "display": "summarized"},
    output_config={"effort": "high"},  # Opus 5.5 기본값은 medium — 필요 수준을 명시
    messages=[{"role": "user", "content": "단계적으로 분석해줘"}],
)
```

---

## 4. 스트리밍

스트리밍은 두 가지 방식이 있다. 거의 대부분은 **스트리밍 헬퍼(`messages.stream()`)** 가 권장된다.

### 4.1 스트리밍 헬퍼 (권장) — sync

```python
from anthropic import Anthropic

client = Anthropic()

with client.messages.stream(
    model="claude-opus-5-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Say hello there!"}],
) as stream:
    for text in stream.text_stream:        # 텍스트 델타만 순차 전달
        print(text, end="", flush=True)
    print()

    final = stream.get_final_message()     # 누적된 최종 Message 객체
    print(final.to_json())
```

### 4.2 스트리밍 헬퍼 — async

```python
import asyncio
from anthropic import AsyncAnthropic

client = AsyncAnthropic()

async def main() -> None:
    async with client.messages.stream(
        model="claude-opus-5-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Say hello there!"}],
    ) as stream:
        async for text in stream.text_stream:
            print(text, end="", flush=True)

        final = await stream.get_final_message()
        print(final.to_json())

asyncio.run(main())
```

### 4.3 원시 이벤트 스트림 — `stream=True`

메모리를 더 적게 쓰고 누적 객체를 만들지 않는다. 직접 이벤트 타입을 처리해야 한다.

→ references/REFERENCE.md §16 (원시 이벤트 스트림 예제)

### 4.4 이벤트 종류 (Server-Sent Events)

→ references/REFERENCE.md §17 (SSE 이벤트 타입 표)

> 주의: 직접 `stream=True`를 처리할 때 `content_block_delta`의 `delta.type`이 `text_delta`인지 `input_json_delta`(tool use)인지 분기해야 한다. 헬퍼를 쓰면 SDK가 자동 처리한다.

### 4.5 FastAPI에서 스트리밍 응답 전달 (짝 스킬)

→ references/REFERENCE.md §18 (FastAPI 스트리밍 통합 예제)

> 프론트엔드 측 EventSource/Fetch 스트림 처리는 `frontend/claude-api-streaming-frontend` 스킬(설치된 경우)을 참조한다.

---

## 5. 프롬프트 캐싱 (Prompt Caching)

긴 시스템 프롬프트, 문서, 도구 정의를 캐싱해 비용·지연을 절감한다.

### 5.1 기본 사용

```python
response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "당신은 법률 문서 분석 전문가입니다.",
        },
        {
            "type": "text",
            "text": "여기 50페이지 계약서 전문: ...",
            "cache_control": {"type": "ephemeral"},   # 5분 TTL (기본)
        },
    ],
    messages=[
        {"role": "user", "content": "핵심 조항을 정리해줘"},
    ],
)

print(response.usage)
# Usage(
#   input_tokens=50,                       # 캐시 이후 새 토큰
#   cache_creation_input_tokens=5120,      # 새로 캐시에 쓴 토큰 (25% 가산)
#   cache_read_input_tokens=100000,        # 캐시에서 읽은 토큰 (10% 가격)
#   output_tokens=503,
# )
```

### 5.2 TTL — 5분(기본) vs 1시간

```python
# 5분 (기본)
"cache_control": {"type": "ephemeral"}

# 1시간 (장기 캐시)
"cache_control": {"type": "ephemeral", "ttl": "1h"}
```

| TTL | 캐시 쓰기 비용 | 사용 시점 |
|-----|---------------|-----------|
| `5m` (기본) | 베이스 입력의 +25% | 빈번한 재호출 (몇 분 내) |
| `1h` | 베이스 입력의 ×2 | 5분 초과 ~ 1시간 이내 재호출, 지연 민감 워크로드 |

캐시 읽기는 두 TTL 모두 **베이스 가격의 10%**.

### 5.3 배치 위치 — `tools` → `system` → `messages` 순으로 무효화 전파

캐시 키는 cache_control 블록 **이전의 모든 콘텐츠**를 포함한다. 따라서:

- 변하지 않는 블록 뒤에 배치 (마지막 안정 블록)
- 변하는 값(타임스탬프, 사용자 ID 등) 뒤에는 캐시 브레이크 두지 않기

```python
# 잘못된 예 — 타임스탬프가 매번 바뀌어 캐시 항상 미스
system=[
    {"type": "text", "text": "정적 지시문..."},
    {
        "type": "text",
        "text": f"현재 시각: {datetime.now()}",
        "cache_control": {"type": "ephemeral"},   # ❌
    },
]

# 올바른 예 — 정적 블록 뒤에 캐시
system=[
    {"type": "text", "text": "정적 지시문...", "cache_control": {"type": "ephemeral"}},
    {"type": "text", "text": f"현재 시각: {datetime.now()}"},  # 캐시 후행, 변동 허용
]
```

### 5.4 최소 캐시 토큰

> 주의: 최소 토큰 미만이면 캐시가 적용되지 않고 **에러 없이 일반 요청으로 처리**된다. `cache_creation_input_tokens`와 `cache_read_input_tokens`가 모두 0이면 캐싱이 일어나지 않은 것.

| 모델 | 최소 캐시 토큰 |
|------|---------------|
| **Claude Fable 5.1, Fable 5, Opus 5.5, Opus 5** | **512** |
| Claude Opus 4.8, Sonnet 5, Sonnet 4.6 / 4.5 | 1,024 |
| Claude Opus 4.7 | 2,048 |
| Claude Opus 4.6 / 4.5 | 4,096 |
| Claude Haiku 4.5 | 4,096 |

> 검증(2026-09-28): Claude Opus 5.5(`claude-opus-5-5`)의 최소 캐시 토큰은 공식 프롬프트 캐싱 문서(Cache limitations 섹션)에 **512**로 명시되어 있다 — Fable 5.1·Opus 5·Fable 5와 동일 티어. Opus 4.8(1,024)에서 Opus 5.5로 옮기면 임계값이 절반이 된다.

> 주의: 최소 캐시 토큰은 세대 순으로 단조 감소하지 않는다. Opus 5.5·Opus 5는 512로 가장 낮지만
> Opus 4.8은 1,024, Opus 4.7은 2,048, Opus 4.6은 4,096이다. 모델을 바꾸면 캐시 임계값도
> 다시 확인해야 한다. Opus 4.8 → Opus 5.5로 옮기면 임계값이 절반(1,024 → 512)이 되므로,
> 기존에 "너무 짧아서 캐시 안 된다"고 판단했던 프롬프트가 코드 변경 없이 캐시될 수 있다.

### 5.5 TTL 혼합 규칙

같은 요청에 5m와 1h를 섞을 수 있지만, **1h가 5m 앞에 와야 한다**.

---

## 6. 도구 사용 (Tool Use)

### 6.1 명시적 도구 정의

→ references/REFERENCE.md §19 (명시적 도구 정의 + tool_use 루프 예제)

### 6.2 `@beta_tool` 데코레이터 (간편)

> 주의: 베타 기능. 시그니처가 변할 수 있으므로 SDK 버전 핀 권장.

```python
import json
from anthropic import Anthropic, beta_tool

client = Anthropic()

@beta_tool
def get_weather(location: str) -> str:
    """도시의 현재 날씨를 반환합니다.

    Args:
        location: 도시명, 예: Seoul
    Returns:
        JSON 문자열 (location, temperature, condition).
    """
    return json.dumps({"location": location, "temperature": "20°C", "condition": "Clear"})

runner = client.beta.messages.tool_runner(
    model="claude-opus-5-5",
    max_tokens=1024,
    tools=[get_weather],
    messages=[{"role": "user", "content": "서울 날씨?"}],
)

for message in runner:
    print(message)
```

### 6.3 구조화된 JSON 출력 강제

JSON만 받으면 되는 경우 **structured outputs**(`messages.parse` + Pydantic)가 권장 경로다.

> 주의: Opus 5.5·Fable 5.1은 강제 `tool_choice`(`{"type": "tool", ...}`·`{"type": "any"}`)를 **400으로 거부**한다.
> 과거의 "단일 도구 + `tool_choice` 강제" 패턴은 Opus 5 이하 레거시 모델에서만 동작한다.

```python
from pydantic import BaseModel

class ContactInfo(BaseModel):
    name: str
    email: str

response = client.messages.parse(
    model="claude-opus-5-5",
    max_tokens=16000,          # 사고 토큰 포함 상한 — 여유 있게
    output_format=ContactInfo,
    messages=[{"role": "user", "content": "홍길동, hong@example.com 에서 이름과 이메일을 추출해줘"}],
)

contact = response.parsed_output   # 검증된 ContactInfo 인스턴스
print(contact.name, contact.email)  # 홍길동 hong@example.com
```

도구 호출 형태를 유지해야 하면 `tool_choice={"type": "auto"}`(기본값) + 도구 정의에 `"strict": True`
(스키마에 `"additionalProperties": False` 필수)를 두고, 프롬프트에서 해당 도구 사용을 지시한다.
`stop_reason`이 `"tool_use"`가 아닐 수 있으므로 응답에 `tool_use` 블록이 없는 경우도 처리한다.

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
