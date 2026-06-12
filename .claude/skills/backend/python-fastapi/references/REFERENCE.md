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
