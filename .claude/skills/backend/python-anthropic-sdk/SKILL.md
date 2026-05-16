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
> 검증일: 2026-05-15
> SDK 기준 버전: `anthropic` v0.102.0 (2026-05-13 릴리스), Python 3.9+ 요구

---

## 짝 스킬 (Companion Skills)

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

**Python 요구 버전:** 3.9 이상.

설치 후 버전 확인:

```python
import anthropic
print(anthropic.__version__)
```

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

```python
import os
import asyncio
from anthropic import AsyncAnthropic

client = AsyncAnthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY"),
)

async def main() -> None:
    message = await client.messages.create(
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello, Claude"}],
        model="claude-opus-4-7",
    )
    print(message.content)

asyncio.run(main())
```

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
    model="claude-opus-4-7",
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
| `temperature` | | 0.0~1.0, 기본 1.0 |
| `tools` | | 도구 정의 배열 (섹션 6) |
| `stream` | | `True` 시 SSE 스트림 반환 |

---

## 4. 스트리밍

스트리밍은 두 가지 방식이 있다. 거의 대부분은 **스트리밍 헬퍼(`messages.stream()`)** 가 권장된다.

### 4.1 스트리밍 헬퍼 (권장) — sync

```python
from anthropic import Anthropic

client = Anthropic()

with client.messages.stream(
    model="claude-opus-4-7",
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
        model="claude-opus-4-7",
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

```python
stream = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
    stream=True,
)

for event in stream:
    # event.type: "message_start" | "content_block_start" | "content_block_delta"
    #           | "content_block_stop" | "message_delta" | "message_stop" | "ping"
    print(event.type)
```

### 4.4 이벤트 종류 (Server-Sent Events)

| 이벤트 | 의미 |
|--------|------|
| `message_start` | 응답 시작, 빈 Message 객체 포함 |
| `content_block_start` | 콘텐츠 블록 시작 (text / tool_use 등) |
| `content_block_delta` | 블록 내 증분 (`text_delta`, `input_json_delta`) |
| `content_block_stop` | 콘텐츠 블록 종료 |
| `message_delta` | top-level 메시지 변경 (stop_reason, usage 등) |
| `message_stop` | 응답 종료 |
| `ping` | 연결 유지 신호 |

> 주의: 직접 `stream=True`를 처리할 때 `content_block_delta`의 `delta.type`이 `text_delta`인지 `input_json_delta`(tool use)인지 분기해야 한다. 헬퍼를 쓰면 SDK가 자동 처리한다.

### 4.5 FastAPI에서 스트리밍 응답 전달 (짝 스킬)

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from anthropic import AsyncAnthropic

app = FastAPI()
client = AsyncAnthropic()

@app.post("/chat")
async def chat(prompt: str):
    async def event_generator():
        async with client.messages.stream(
            model="claude-opus-4-7",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        ) as stream:
            async for text in stream.text_stream:
                yield f"data: {text}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

> 프론트엔드 측 EventSource/Fetch 스트림 처리는 `frontend/claude-api-streaming-frontend` 스킬을 참조한다.

---

## 5. 프롬프트 캐싱 (Prompt Caching)

긴 시스템 프롬프트, 문서, 도구 정의를 캐싱해 비용·지연을 절감한다.

### 5.1 기본 사용

```python
response = client.messages.create(
    model="claude-opus-4-7",
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
| Claude Opus 4.7 / 4.6 / 4.5 | 4,096 |
| Claude Sonnet 4.6 / 4.5, Opus 4.1 | 1,024 |
| Claude Haiku 4.5 | 4,096 |
| Claude Haiku 3.5 | 2,048 |

### 5.5 TTL 혼합 규칙

같은 요청에 5m와 1h를 섞을 수 있지만, **1h가 5m 앞에 와야 한다**.

---

## 6. 도구 사용 (Tool Use)

### 6.1 명시적 도구 정의

```python
tools = [
    {
        "name": "get_weather",
        "description": "주어진 도시의 현재 날씨를 조회합니다.",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "도시명 (예: Seoul)",
                },
            },
            "required": ["location"],
        },
    }
]

response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "서울 날씨 알려줘"}],
)

# tool_use 응답 처리 루프
while response.stop_reason == "tool_use":
    tool_use = next(b for b in response.content if b.type == "tool_use")
    result = handle_tool(tool_use.name, tool_use.input)  # 사용자 정의

    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        tools=tools,
        messages=[
            {"role": "user", "content": "서울 날씨 알려줘"},
            {"role": "assistant", "content": response.content},
            {
                "role": "user",
                "content": [
                    {
                        "type": "tool_result",
                        "tool_use_id": tool_use.id,
                        "content": result,
                    }
                ],
            },
        ],
    )
```

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
    model="claude-opus-4-7",
    max_tokens=1024,
    tools=[get_weather],
    messages=[{"role": "user", "content": "서울 날씨?"}],
)

for message in runner:
    print(message)
```

### 6.3 구조화된 JSON 출력 강제

도구를 단일로 지정하고 `tool_choice`로 강제 호출하면 JSON 응답을 강제할 수 있다.

```python
tools = [{
    "name": "extract_info",
    "description": "텍스트에서 이름과 이메일을 추출",
    "input_schema": {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "email": {"type": "string"},
        },
        "required": ["name", "email"],
    },
}]

response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=512,
    tools=tools,
    tool_choice={"type": "tool", "name": "extract_info"},
    messages=[{"role": "user", "content": "홍길동, hong@example.com"}],
)

tool_use = next(b for b in response.content if b.type == "tool_use")
print(tool_use.input)   # {"name": "홍길동", "email": "hong@example.com"}
```

---

## 7. 비전 입력 (Vision)

지원 미디어 타입: `image/jpeg`, `image/png`, `image/gif`, `image/webp`.

### 7.1 Base64 인코딩 이미지

```python
import base64, httpx

image_url = "https://example.com/sample.jpg"
image_data = base64.standard_b64encode(httpx.get(image_url).content).decode("utf-8")

message = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": image_data,
                },
            },
            {"type": "text", "text": "이 이미지를 설명해줘"},
        ],
    }],
)
```

### 7.2 URL 직접 참조

```python
message = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "url",
                    "url": "https://example.com/sample.jpg",
                },
            },
            {"type": "text", "text": "이 이미지를 설명해줘"},
        ],
    }],
)
```

---

## 8. 모델 선택

| 모델 ID | 용도 | 비용·속도 |
|---------|------|-----------|
| `claude-opus-4-7` | 최고난도 추론·분석, 오케스트레이션 | 가장 비쌈, 가장 느림 |
| `claude-sonnet-4-6` | 코드 생성, 일반 추론, 검증 | 중간 — 대부분의 워크로드 기본 선택 |
| `claude-haiku-4-5` | 단순 포맷 변환, 분류, 짧은 요약 | 가장 저렴, 가장 빠름 |

> 참고: 구형 모델 ID(`claude-sonnet-4-20250514`, `claude-opus-4-20250514` 등)는 deprecated 예정. 신규 코드는 위 최신 ID를 사용.

---

## 9. 에러 핸들링 및 재시도

### 9.1 에러 계층

```python
import anthropic
from anthropic import Anthropic

client = Anthropic()

try:
    message = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello"}],
    )
except anthropic.APIConnectionError as e:
    # 네트워크 도달 불가
    print("서버 연결 실패:", e.__cause__)
except anthropic.RateLimitError as e:
    # 429 — 백오프 권장
    print("Rate limit:", e)
except anthropic.APIStatusError as e:
    # 그 외 4xx/5xx
    print(e.status_code, e.response)
```

| 상태 코드 | 예외 타입 |
|-----------|-----------|
| 400 | `BadRequestError` |
| 401 | `AuthenticationError` |
| 403 | `PermissionDeniedError` |
| 404 | `NotFoundError` |
| 409 | `ConflictError` |
| 422 | `UnprocessableEntityError` |
| 429 | `RateLimitError` |
| ≥500 | `InternalServerError` |
| N/A (네트워크) | `APIConnectionError` |
| 타임아웃 | `APITimeoutError` |

모두 `anthropic.APIError`의 서브클래스다.

### 9.2 자동 재시도

기본적으로 SDK는 **연결 오류·408·409·429·5xx**를 2회 자동 재시도(짧은 지수 백오프).

```python
# 클라이언트 전체 설정
client = Anthropic(max_retries=5)   # 기본 2

# 요청별 오버라이드
client.with_options(max_retries=0).messages.create(...)
```

### 9.3 타임아웃

기본 타임아웃은 10분. 짧게 조정하거나 세분화 가능:

```python
import httpx
from anthropic import Anthropic

client = Anthropic(timeout=20.0)   # 20초

client = Anthropic(
    timeout=httpx.Timeout(60.0, read=5.0, write=10.0, connect=2.0)
)
```

> 주의: 비스트리밍에서 `max_tokens`가 커서 약 10분 초과가 예상되면 SDK가 `ValueError`를 던진다. 긴 응답은 **반드시 스트리밍 사용**.

---

## 10. 토큰 카운팅

### 10.1 응답의 실제 사용량

```python
message = client.messages.create(...)
print(message.usage)
# Usage(input_tokens=25, output_tokens=13,
#       cache_creation_input_tokens=..., cache_read_input_tokens=...)
```

### 10.2 사전 카운팅 (`count_tokens`)

요청 전 토큰 수를 미리 확인.

```python
count = client.messages.count_tokens(
    model="claude-opus-4-7",
    messages=[{"role": "user", "content": "Hello, world"}],
)
print(count.input_tokens)   # 10
```

> 주의: `count_tokens`는 SDK 베타 영역 노출 가능. 정확한 시그니처는 설치된 SDK 버전의 `helpers.md` / `api.md`를 확인한다.

---

## 11. AWS Bedrock / GCP Vertex 변형

### 11.1 AWS Bedrock — `AnthropicBedrock`

```bash
pip install "anthropic[bedrock]"
```

```python
from anthropic import AnthropicBedrock

client = AnthropicBedrock(
    aws_region="us-east-1",
    # aws_profile / aws_access_key / aws_secret_key / aws_session_token 선택 지정
)

message = client.messages.create(
    model="anthropic.claude-3-5-sonnet-20241022-v2:0",   # Bedrock 모델 ID 규약
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}],
)
```

> 주의: Bedrock에서는 **모델 ID가 다르다** (`anthropic.{model}-{date}-v{n}:{revision}`). 공식 Bedrock 모델 카탈로그를 확인.
> 신규 프로젝트는 `AnthropicBedrockMantle` 사용 권장 (공식 문서). 레거시 InvokeModel 경로는 `AnthropicBedrock`.

### 11.2 GCP Vertex — `AnthropicVertex`

```bash
pip install "anthropic[vertex]"
```

```python
from anthropic import AnthropicVertex

client = AnthropicVertex(
    project_id="my-gcp-project",   # 미지정 시 환경변수/ADC에서 추론
    region="us-east5",
)

message = client.messages.create(
    model="claude-3-5-sonnet-v2@20241022",   # Vertex 모델 ID 규약
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}],
)
```

`google-auth`로 ADC(Application Default Credentials)를 자동 사용한다.

### 11.3 공통 사항

- API 키 대신 클라우드 IAM 자격 증명 사용 → API 키 노출 위험 감소
- 모델 ID 형식이 Anthropic 직접 API와 다름
- 일부 베타 기능(`beta_tool`, 신규 caching 옵션)은 클라우드 변형에서 지연 적용될 수 있음 → 공식 문서로 가용성 확인

---

## 12. 흔한 함정 (Anti-patterns)

| 함정 | 해결 |
|------|------|
| **API 키를 코드/Git에 노출** | `.env` + `.gitignore`, 시크릿 매니저. SDK는 `ANTHROPIC_API_KEY` 환경변수 자동 로드 |
| **sync 컨텍스트에서 `AsyncAnthropic` 호출** | FastAPI 핸들러처럼 async 환경에서만 `AsyncAnthropic` 사용. 동기 라이브러리/스크립트는 `Anthropic` |
| **`Anthropic()`을 매 요청마다 새로 생성** | 클라이언트는 앱 전체에서 **한 번만 생성**해 재사용. 매번 생성하면 connection pool 낭비 |
| **스트리밍 이벤트 누락 처리** | `stream=True` 직접 처리 시 모든 `event.type` 분기 필요. 가능하면 `messages.stream()` 헬퍼 사용 |
| **캐시 TTL 1시간 = 절대 만료 없음 오해** | `1h`는 *최대* TTL. 5분 미접근 시 갱신 안 되면 만료될 수 있고, 캐시 미스 시 신규 캐시 비용 발생 |
| **변하는 값 뒤에 `cache_control` 배치** | 타임스탬프·사용자 ID 뒤 캐시 브레이크는 매 요청 무효. 정적 블록 뒤에 배치 |
| **최소 캐시 토큰 미만에서 캐싱 시도** | 에러 없이 무시되므로 `cache_creation_input_tokens`/`cache_read_input_tokens` 확인 필수 |
| **`max_tokens` 크게 두고 비스트리밍** | SDK가 `ValueError` 던짐. 긴 응답은 반드시 스트리밍 |
| **에러 처리 없이 운영** | 최소한 `RateLimitError`, `APIConnectionError`, `APITimeoutError`는 분기. 429는 백오프 |
| **Bedrock/Vertex 모델 ID에 직접 API ID 사용** | 플랫폼별 모델 ID 규약 다름. 공식 카탈로그 참조 |
| **로그에 `messages` 전체 출력** | PII·민감 정보 노출. 요청 단위는 `message._request_id`만 로깅 권장 |

---

## 13. 언제 사용 / 사용하지 않을지

**사용 권장:**
- Python 백엔드(FastAPI/Django/Flask)에서 Claude API 통합
- 비동기 워크로드에서 다수의 LLM 호출 병렬화
- 긴 문서 분석·다회 호출에서 비용 최적화 (프롬프트 캐싱)
- 도구 호출로 외부 시스템과 연동

**사용하지 않을 경우:**
- 단순한 단일 호출 스크립트 — `httpx`로 직접 호출도 충분
- Node.js 백엔드 — `@anthropic-ai/sdk`(TS/JS SDK) 사용
- 매우 짧은 응답 + 매우 낮은 빈도 — 캐싱·스트리밍 이점 없음

---

## 14. 핵심 체크리스트

- [ ] `ANTHROPIC_API_KEY`는 환경변수/시크릿 매니저로만 관리한다
- [ ] async 환경이면 `AsyncAnthropic`을 쓰고, 클라이언트는 앱 전체에서 재사용한다
- [ ] 긴 응답은 `messages.stream()` 헬퍼로 스트리밍한다
- [ ] 반복되는 긴 시스템/문서는 `cache_control: {"type": "ephemeral"}` 캐싱한다
- [ ] `cache_control`은 *변하지 않는 마지막 블록* 뒤에 배치한다
- [ ] 모델 최소 캐시 토큰을 충족하는지 확인한다
- [ ] `RateLimitError`/`APIConnectionError`/`APITimeoutError` 분기 처리한다
- [ ] 모델 ID는 `claude-opus-4-7` / `claude-sonnet-4-6` / `claude-haiku-4-5` 최신 ID를 사용한다
- [ ] Bedrock/Vertex는 플랫폼별 모델 ID 규약을 확인한다
