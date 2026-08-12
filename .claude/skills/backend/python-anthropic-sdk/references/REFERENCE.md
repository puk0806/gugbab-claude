## 7. 비전 입력 (Vision)

지원 미디어 타입: `image/jpeg`, `image/png`, `image/gif`, `image/webp`.

### 7.1 Base64 인코딩 이미지

```python
import base64, httpx

image_url = "https://example.com/sample.jpg"
image_data = base64.standard_b64encode(httpx.get(image_url).content).decode("utf-8")

message = client.messages.create(
    model="claude-opus-5",
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
    model="claude-opus-5",
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

| 모델 ID | 용도 | 컨텍스트 / 최대 출력 | 단가 (입력/출력, per MTok) |
|---------|------|---------------------|---------------------------|
| `claude-fable-5` | 최상위 티어 — 최고난도 추론, 장기 에이전트 | 1M / 128K | $10 / $50 |
| **`claude-opus-5`** | **기본 권장** — 복잡한 에이전트 코딩·분석·오케스트레이션 | 1M / 128K | $5 / $25 |
| `claude-sonnet-5` | 코드 생성, 일반 추론, 검증 — 속도·지능 균형 | 1M / 128K | $3 / $15 (2026-08-31까지 인트로 $2 / $10) |
| `claude-haiku-4-5` | 단순 포맷 변환, 분류, 짧은 요약 | 200K / 64K | $1 / $5 |

> 참고: 구형 모델 ID(`claude-sonnet-4-20250514`, `claude-opus-4-20250514`)는 2026-06-15에
> **retired** 되어 더 이상 호출되지 않는다. `claude-opus-4-1-20250805`도 2026-08-05
> retired(대체: `claude-opus-5`). 신규 코드는 위 별칭 ID를 사용한다.
> `claude-opus-4-8` / `claude-sonnet-4-6` / `claude-opus-4-7`은 아직 서비스되지만 **구세대**다 —
> 신규 코드는 5 계열을 쓰고, 기존 코드는 마이그레이션 가이드를 따라 옮긴다.
> Haiku 4.5는 **여전히 현행**이므로 교체하지 않는다.
> 모델 선택 기준은 `.claude/rules/agent-design.md`를 따른다.

---

## 9. 에러 핸들링 및 재시도

### 9.1 에러 계층

```python
import anthropic
from anthropic import Anthropic

client = Anthropic()

try:
    message = client.messages.create(
        model="claude-opus-5",
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
    model="claude-opus-5",
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
    model="anthropic.claude-opus-5",   # Bedrock 모델 ID 규약 — `anthropic.` 접두사
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}],
)
```

> 주의: Bedrock에서는 **모델 ID에 `anthropic.` 접두사가 붙는다** (현행 세대는 `anthropic.claude-opus-5` 형태,
> 구세대 스냅샷은 `anthropic.{model}-{date}-v{n}:{revision}` 규약). 공식 Bedrock 모델 카탈로그를 확인.
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
    model="claude-opus-5",   # Vertex 현행 세대는 접두사 없는 기본 ID 그대로 사용
    # (구세대 날짜 스냅샷만 `claude-opus-4-5@20251101` 형태의 @ 버전 구분자를 쓴다)
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
- [ ] 모델 ID는 `claude-opus-5` / `claude-sonnet-5` / `claude-haiku-4-5` 현행 ID를 사용한다
- [ ] `temperature` / `top_p` / `top_k` / `budget_tokens`를 5 계열 요청에 넣지 않는다 (400 에러)
- [ ] 사고 깊이는 `thinking: {"type": "adaptive"}` + `output_config.effort`로 제어한다
- [ ] Opus 5는 사고가 기본 ON이므로 `max_tokens`에 사고 토큰 여유를 둔다
- [ ] Bedrock/Vertex는 플랫폼별 모델 ID 규약을 확인한다
