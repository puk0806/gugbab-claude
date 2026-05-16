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

## 8. 에러 처리

### 8.1 HTTPException

```python
from fastapi import HTTPException, status

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    item = await repo.find(item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "ITEM_NOT_FOUND", "id": item_id},
            headers={"X-Error-Code": "ITEM_NOT_FOUND"},
        )
    return item
```

### 8.2 도메인 예외 + 글로벌 핸들러

```python
class DomainError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code

@app.exception_handler(DomainError)
async def domain_error_handler(request, exc: DomainError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.code, "message": exc.message},
    )

# 검증 에러 커스텀
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_handler(request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"code": "VALIDATION_ERROR", "errors": exc.errors()},
    )
```

---

## 9. JWT 인증 — OAuth2PasswordBearer + PyJWT

PyJWT는 현재 권장되는 활발히 유지보수되는 JWT 라이브러리다.

```python
# core/security.py
from datetime import datetime, timedelta, timezone
import jwt
from passlib.context import CryptContext

SECRET_KEY = "..."  # 환경변수에서 로드
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(sub: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return jwt.encode({"sub": sub, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
```

```python
# deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    creds_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        username: str | None = payload.get("sub")
        if username is None:
            raise creds_exc
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise creds_exc

    user = await user_repo.find_by_username(username)
    if user is None:
        raise creds_exc
    return user

CurrentUser = Annotated[User, Depends(get_current_user)]
```

```python
# routers/auth.py
from fastapi.security import OAuth2PasswordRequestForm

@router.post("/auth/token")
async def login(form: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = await authenticate(form.username, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="Wrong username or password")
    token = create_access_token(sub=user.username)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/users/me")
async def me(user: CurrentUser):
    return user
```

---

## 10. SSE 스트리밍 (Claude API 프록시 예시)

`StreamingResponse`는 async generator를 받아 청크 단위로 전송한다. SSE는 `text/event-stream` MIME과 `data: ...\n\n` 형식을 사용.

```python
from fastapi.responses import StreamingResponse

@app.post("/chat/stream")
async def chat_stream(req: ChatRequest, http: HttpDep):
    async def event_generator():
        async with http.stream(
            "POST",
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": settings.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-6",
                "messages": req.messages,
                "max_tokens": 1024,
                "stream": True,
            },
            timeout=60.0,
        ) as upstream:
            async for line in upstream.aiter_lines():
                if line:
                    yield f"{line}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # nginx 버퍼링 비활성
        },
    )
```

> 흔한 함정: nginx 등 리버스 프록시가 `proxy_buffering on`이면 스트림이 한 번에 전송된다. nginx 설정에 `proxy_buffering off;` 추가 필요. FastAPI 측에서는 `X-Accel-Buffering: no` 헤더로 힌트 제공.

> 흔한 함정: `async with httpx.AsyncClient() as client` 블록 내부에서 yield 후 블록을 벗어나면 응답이 잘린다. 위 예시처럼 app 단위 client + `client.stream(...)` 사용.

---

## 11. 파일 업로드 (Whisper 프록시 예시)

```python
from fastapi import File, UploadFile, Form

@app.post("/transcribe")
async def transcribe(
    audio: Annotated[UploadFile, File(description="오디오 파일")],
    language: Annotated[str, Form()] = "ko",
    http: HttpDep = ...,
):
    if audio.content_type not in {"audio/mpeg", "audio/wav", "audio/webm", "audio/mp4"}:
        raise HTTPException(415, "Unsupported audio type")

    if audio.size and audio.size > 25 * 1024 * 1024:  # 25 MB
        raise HTTPException(413, "File too large")

    # OpenAI Whisper API로 프록시
    files = {"file": (audio.filename, await audio.read(), audio.content_type)}
    data = {"model": "whisper-1", "language": language}

    r = await http.post(
        "https://api.openai.com/v1/audio/transcriptions",
        headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
        files=files,
        data=data,
        timeout=120.0,
    )
    r.raise_for_status()
    return r.json()
```

`UploadFile`은 SpooledTemporaryFile 기반이라 큰 파일도 메모리 폭발 없이 처리한다. 대용량은 `await audio.read()` 대신 청크로 읽는다(`while chunk := await audio.read(64 * 1024): ...`).

---

## 12. 백그라운드 작업 (BackgroundTasks)

응답 반환 후 같은 프로세스에서 실행되는 가벼운 fire-and-forget 작업용.

```python
from fastapi import BackgroundTasks

def send_welcome_email(email: str):
    # 이메일 발송 (sync 함수도 OK — FastAPI가 스레드풀에서 실행)
    ...

@app.post("/signup")
async def signup(req: SignupRequest, bg: BackgroundTasks):
    user = await user_service.create(req)
    bg.add_task(send_welcome_email, user.email)
    return {"id": user.id}
```

**BackgroundTasks 한계 — 다음 경우 Celery / Dramatiq / arq 사용:**
- 작업이 수초 이상 (CPU 집약/장시간 I/O) → API 응답 처리 능력 저하
- 서버 재시작/크래시 시 작업 손실 허용 불가 → 영속화 필요
- 재시도·결과 추적·우선순위·스케줄링 필요
- 별도 프로세스/머신에서 워커 실행 필요

---

## 13. OpenAPI 자동 문서

FastAPI는 자동으로 다음을 제공한다:

| URL | 내용 |
|-----|------|
| `/docs` | Swagger UI |
| `/redoc` | ReDoc |
| `/openapi.json` | OpenAPI 3.1 스펙 |

문서 강화:

```python
app = FastAPI(
    title="LLM Proxy API",
    version="1.0.0",
    description="Claude/Whisper proxy backend",
    contact={"name": "Team", "email": "team@example.com"},
    license_info={"name": "MIT"},
    servers=[{"url": "https://api.example.com"}],
    openapi_tags=[
        {"name": "chat", "description": "LLM chat endpoints"},
        {"name": "auth", "description": "Authentication"},
    ],
)

@app.get("/items/{id}", tags=["items"], summary="Get item by ID", response_description="Item detail")
async def get_item(id: int):
    """
    상세 마크다운 설명을 docstring에 작성하면 Swagger에 표시된다.

    - **id**: 1 이상의 정수
    """
    ...
```

프로덕션에서 문서 비활성화:

```python
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
```

---

## 14. 테스트

### 14.1 TestClient (sync, 가장 간단)

```python
# tests/test_items.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}

def test_create_item():
    r = client.post("/items/", json={"name": "foo", "price": 1.5})
    assert r.status_code == 201
    assert r.json()["name"] == "foo"
```

> TestClient는 내부적으로 httpx 기반이며 async 핸들러도 잘 동작한다. 대부분의 테스트는 TestClient로 충분하다.

### 14.2 AsyncClient + ASGITransport (async fixture가 필요할 때)

테스트 코드 자체에서 async 라이브러리(asyncpg, motor 등)를 사용해야 하면 `httpx.AsyncClient` + `ASGITransport` 조합 사용.

```python
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as c:
        yield c

@pytest.mark.anyio
async def test_async(client: AsyncClient):
    r = await client.get("/health")
    assert r.status_code == 200
```

> Lifespan 이벤트(startup/shutdown)는 AsyncClient 자체로는 트리거되지 않는다. 필요 시 `asgi-lifespan` 패키지의 `LifespanManager` 사용.

### 14.3 의존성 오버라이드

```python
async def fake_get_current_user():
    return User(id=1, username="test")

app.dependency_overrides[get_current_user] = fake_get_current_user

# 테스트 종료 시 cleanup
app.dependency_overrides.clear()
```

---

## 15. 배포

### 15.1 단일 워커 (개발 / 소규모)

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1
```

### 15.2 멀티 워커 (프로덕션)

FastAPI 공식 권장: Gunicorn + UvicornWorker. Gunicorn이 프로세스 관리(워커 재시작·로드 밸런싱), Uvicorn이 ASGI 처리.

```bash
uv add gunicorn

uv run gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 60 \
    --graceful-timeout 30 \
    --access-logfile - \
    --error-logfile -
```

권장 워커 수: `(2 × CPU 코어) + 1`. I/O 바운드(LLM 프록시 등)는 더 많아도 무방.

### 15.3 Docker (multi-stage 빌드)

```dockerfile
# Dockerfile
FROM python:3.13-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

FROM python:3.13-slim
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY app/ ./app/
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000
CMD ["gunicorn", "app.main:app", \
     "-w", "4", \
     "-k", "uvicorn.workers.UvicornWorker", \
     "-b", "0.0.0.0:8000"]
```

```bash
docker build -t my-api .
docker run -p 8000:8000 --env-file .env my-api
```

---

## 16. 흔한 함정 모음

| 함정 | 결과 | 해결 |
|------|------|------|
| `async def` 안에서 `requests.get()`·sync DB | 이벤트 루프 차단, 동시성 0 | httpx/asyncpg 등 async 라이브러리 사용 또는 핸들러를 `def`로 |
| `httpx.AsyncClient()`를 요청마다 새로 생성 | 커넥션 풀 손실, 성능 저하 | lifespan에서 1개 생성 후 공유 |
| DB 세션 `yield` 후 close 누락 | 커넥션 풀 고갈 | `try/finally`로 close 보장 |
| CORS `allow_origins=["*"]` + `allow_credentials=True` | 브라우저 거부 | 명시적 origin 리스트 |
| CORSMiddleware를 마지막에 추가 | 에러 응답에서 CORS 헤더 누락 | 최상단(가장 먼저)에 등록 |
| `BackgroundTasks`로 분 단위 작업 실행 | API 응답 처리 능력 저하·재시작 시 손실 | Celery/Dramatiq/arq |
| SSE 응답이 한 번에 도착 | nginx 등의 버퍼링 | `proxy_buffering off` + `X-Accel-Buffering: no` |
| Pydantic v1 패턴(`Config`, `dict()`) | DeprecationWarning · 호환성 문제 | `model_config`, `model_dump()` 사용 |
| `Annotated` 없이 `q: str = Query(None)` | 작동은 하지만 비권장 | `q: Annotated[str | None, Query()] = None` |
| `app.dependency_overrides`를 테스트 후 clear 안 함 | 다른 테스트에 영향 | `clear()` 또는 fixture로 teardown |
| 프로덕션에서 `/docs` 노출 | 내부 API 구조 유출 | `docs_url=None` 또는 인증 게이팅 |

---

## 참고 링크

- 공식 docs: https://fastapi.tiangolo.com/
- Release notes: https://fastapi.tiangolo.com/release-notes/
- 공식 GitHub: https://github.com/fastapi/fastapi
- uv 통합 가이드: https://docs.astral.sh/uv/guides/integration/fastapi/
- OAuth2 + JWT 튜토리얼: https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
- Async 가이드: https://fastapi.tiangolo.com/async/
- 배포 (Server Workers): https://fastapi.tiangolo.com/deployment/server-workers/
- Advanced Middleware: https://fastapi.tiangolo.com/advanced/middleware/
- Async Tests: https://fastapi.tiangolo.com/advanced/async-tests/
