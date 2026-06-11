---
name: python-fastapi
description: >
  FastAPI 0.115+ 기반 비동기 REST API 백엔드 작성 표준 — Pydantic v2 모델·Annotated 의존성 주입·SSE 스트리밍·JWT 인증·OpenAPI 문서·배포 패턴.
  LLM 프록시(Claude/Whisper 등) 백엔드, 파일 업로드, 백그라운드 작업, 실 프로덕션 배포에 활용한다.
---

# python-fastapi

> 소스: https://fastapi.tiangolo.com/ (공식 docs), https://github.com/fastapi/fastapi/releases
> 버전 기준: FastAPI 0.115+ (테스트 시점 최신: 0.136.x), Pydantic 2.x, Starlette 0.4x~1.0
> 검증일: 2026-05-15

---

## 짝 스킬

| 스킬 | 역할 |
|------|------|
| `backend/python-pydantic-v2` | 요청/응답 모델·Field·validator 상세 |
| `backend/python-async-asyncio` | asyncio 이벤트 루프·gather·timeout |
| `backend/python-uv-project-setup` | uv 프로젝트 초기화·의존성 관리 |
| `backend/python-anthropic-sdk` | Anthropic SDK 통합 (SSE 프록시) |
| `frontend/whisper-api-integration` | 클라이언트 측 Whisper 호출 — 본 스킬은 백엔드 프록시 측 |

---

## 1. 설치 (uv 기준)

`fastapi[standard]`는 uvicorn[standard], fastapi-cli, httpx, jinja2, python-multipart, python-dotenv 등을 포함한 권장 번들이다.

```bash
# 새 프로젝트
uv init my-api
cd my-api

# FastAPI 표준 번들 추가
uv add "fastapi[standard]"

# 추가 의존성 (필요 시)
uv add httpx pyjwt[crypto] python-jose passlib[bcrypt]

# 개발 서버 실행 (자동 reload)
uv run fastapi dev app/main.py

# 프로덕션 실행
uv run fastapi run app/main.py
```

> `fastapi[standard]`는 `uvicorn[standard]` + `fastapi-cli`를 포함하므로 별도 설치 불필요. `--extra standard` 방식도 동일.

---

## 2. 최소 앱 구조

```python
# app/main.py
from fastapi import FastAPI

app = FastAPI(
    title="My API",
    version="1.0.0",
    description="LLM proxy backend",
)

@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
```

권장 디렉토리 구조:

```
my-api/
├── app/
│   ├── main.py          # FastAPI 앱 인스턴스
│   ├── deps.py          # 공통 의존성 (DB, 인증)
│   ├── routers/         # APIRouter 별 분리
│   │   ├── chat.py
│   │   └── users.py
│   ├── models/          # Pydantic 모델 (request/response)
│   ├── services/        # 비즈니스 로직
│   └── core/
│       ├── config.py    # 설정 (pydantic-settings)
│       └── security.py  # JWT, 해싱
├── tests/
└── pyproject.toml
```

---

## 3. 경로 동작 (Path Operations)

### 3.1 기본 패턴

```python
from fastapi import FastAPI, status

app = FastAPI()

@app.get("/items/{item_id}", status_code=status.HTTP_200_OK)
async def read_item(item_id: int) -> dict:
    return {"item_id": item_id}

@app.post("/items/", status_code=status.HTTP_201_CREATED)
async def create_item(item: ItemCreate) -> ItemResponse:
    ...

@app.put("/items/{item_id}")
async def update_item(item_id: int, item: ItemUpdate) -> ItemResponse:
    ...

@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: int) -> None:
    ...
```

### 3.2 Path / Query 파라미터 (Annotated 권장)

FastAPI 0.95부터 `Annotated` 방식이 권장 표준이며 0.115에서도 동일하다. 기존 `q: str = Query(None)` 방식은 작동하지만 새 코드에선 `Annotated` 사용.

```python
from typing import Annotated
from fastapi import Path, Query

@app.get("/items/{item_id}")
async def read_item(
    item_id: Annotated[int, Path(ge=1, title="Item ID")],
    q: Annotated[str | None, Query(max_length=50, alias="search")] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
):
    return {"item_id": item_id, "q": q, "skip": skip, "limit": limit}
```

> 주의: `Annotated` 사용 시 기본값은 `=`로 지정한다. `Query(default=0)` 형태 금지.

### 3.3 Query 파라미터를 Pydantic 모델로 (0.115+ 신규)

```python
from pydantic import BaseModel, Field

class FilterParams(BaseModel):
    model_config = {"extra": "forbid"}  # 예상 못 한 쿼리 거부

    skip: int = Field(0, ge=0)
    limit: int = Field(10, ge=1, le=100)
    tags: list[str] = []

@app.get("/items/")
async def list_items(filters: Annotated[FilterParams, Query()]):
    return filters
```

---

## 4. Pydantic v2 모델 (Request / Response)

```python
from pydantic import BaseModel, Field, model_validator
from typing import Self

class ItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price: float = Field(gt=0)
    description: str | None = Field(None, max_length=500)
    tags: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def check_name_not_in_description(self) -> Self:
        if self.description and self.name in self.description:
            raise ValueError("description must not contain name")
        return self

class ItemResponse(BaseModel):
    id: int
    name: str
    price: float
    description: str | None = None

    model_config = {"from_attributes": True}  # ORM 객체 → 모델 자동 변환
```

핸들러에서:

```python
@app.post("/items/", response_model=ItemResponse, status_code=201)
async def create_item(item: ItemCreate) -> ItemResponse:
    saved = await service.save(item)
    return saved  # ORM 객체 → ItemResponse 자동 변환 (from_attributes)
```

> Pydantic v1 → v2 변경: `Config` → `model_config`, `dict()` → `model_dump()`, `json()` → `model_dump_json()`, `@validator` → `@field_validator`/`@model_validator`.

---

## 5. 의존성 주입 (Depends)

### 5.1 기본

```python
from typing import Annotated
from fastapi import Depends

async def common_pagination(skip: int = 0, limit: int = 10) -> dict:
    return {"skip": skip, "limit": limit}

@app.get("/items/")
async def list_items(
    pagination: Annotated[dict, Depends(common_pagination)],
):
    return pagination
```

### 5.2 클래스 의존성 + 재사용 타입 별칭

```python
class Pagination:
    def __init__(self, skip: int = 0, limit: int = 10):
        self.skip = skip
        self.limit = limit

PaginationDep = Annotated[Pagination, Depends(Pagination)]

@app.get("/items/")
async def list_items(p: PaginationDep):
    return {"skip": p.skip, "limit": p.limit}
```

### 5.3 yield 의존성 (리소스 정리)

DB 세션·HTTP 클라이언트 등 finally가 필요한 리소스에 사용. `yield` 이후 코드는 응답 반환 직후 실행.

```python
async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        await db.close()

DBDep = Annotated[AsyncSession, Depends(get_db)]

@app.get("/users/{user_id}")
async def get_user(user_id: int, db: DBDep):
    return await db.get(User, user_id)
```

> 흔한 함정: `get_db()`에서 `try/finally` 없이 `yield` → DB 세션 누수. 반드시 `finally`에서 close.

---

## 6. async vs sync 핸들러 — 핵심 원칙

| 선언 | 실행 방식 | 사용 시점 |
|------|-----------|-----------|
| `async def` | 이벤트 루프에서 직접 실행 | 비동기 라이브러리(httpx, asyncpg, motor, aioredis 등)만 사용할 때 |
| `def` | 스레드풀(기본 40)에서 실행 | 동기 라이브러리(requests, psycopg2-sync, boto3 sync) 사용 시 |

**절대 금지**: `async def` 안에서 동기 블로킹 호출(`requests.get`, `time.sleep`, sync DB 드라이버). 이벤트 루프 전체가 멈춘다.

```python
# 금지
@app.get("/bad")
async def bad():
    return requests.get("https://api.example.com").json()  # 이벤트 루프 차단

# 권장 1: async 라이브러리 사용
import httpx

@app.get("/good-async")
async def good_async():
    async with httpx.AsyncClient() as client:
        r = await client.get("https://api.example.com")
        return r.json()

# 권장 2: 동기 라이브러리만 있다면 def로 선언
@app.get("/good-sync")
def good_sync():
    return requests.get("https://api.example.com").json()  # 스레드풀에서 실행

# 권장 3: async 핸들러 내부에서 일부 sync 호출이 필요하면
from starlette.concurrency import run_in_threadpool

@app.get("/mixed")
async def mixed():
    data = await run_in_threadpool(blocking_call)
    return data
```

### httpx.AsyncClient는 app 단위 재사용

매 요청마다 `AsyncClient()` 생성 시 커넥션 풀 손실. lifespan에서 생성 후 의존성으로 주입.

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http = httpx.AsyncClient(timeout=30.0)
    yield
    await app.state.http.aclose()

app = FastAPI(lifespan=lifespan)

async def get_http(request: Request) -> httpx.AsyncClient:
    return request.app.state.http

HttpDep = Annotated[httpx.AsyncClient, Depends(get_http)]
```

---

## 7. 미들웨어

### 7.1 CORS — 항상 가장 먼저 추가

다른 미들웨어가 에러를 던지면 CORS 헤더가 빠져 브라우저가 실제 에러 대신 CORS 에러를 표시한다. CORSMiddleware를 최상단에 등록한다.

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],  # 와일드카드 + credentials 동시 불가
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

> 흔한 함정: `allow_origins=["*"]` + `allow_credentials=True`. 브라우저가 거부한다. 명시적 origin 또는 정규식 사용.

### 7.2 GZip — Accept-Encoding이 gzip일 때만 압축

```python
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=5)
```

### 7.3 커스텀 미들웨어 (request_id, 처리 시간)

```python
import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware

class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
        start = time.perf_counter()
        response = await call_next(request)
        response.headers["x-request-id"] = request_id
        response.headers["x-process-time"] = f"{(time.perf_counter() - start):.4f}"
        return response

app.add_middleware(RequestContextMiddleware)
```

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
