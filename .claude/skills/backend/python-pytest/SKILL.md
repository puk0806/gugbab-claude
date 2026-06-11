---
name: python-pytest
description: >
  pytest 8.x 기반 Python 테스트 작성 가이드. fixture·parametrize·marker·async·FastAPI TestClient·mock·coverage·CI 통합까지.
  <example>사용자: "pytest fixture scope를 어떻게 정해야 해?"</example>
  <example>사용자: "FastAPI 의존성을 테스트에서 오버라이드 하는 방법은?"</example>
  <example>사용자: "async 함수를 pytest로 테스트하려면?"</example>
---

# pytest 8.x — Python 표준 테스트 프레임워크

> 소스:
> - https://docs.pytest.org/en/stable/ (공식 문서)
> - https://docs.pytest.org/en/stable/changelog.html (8.x 변경 이력)
> - https://pytest-asyncio.readthedocs.io/en/stable/ (pytest-asyncio 1.x)
> - https://github.com/pytest-dev/pytest-mock (pytest-mock)
> - https://github.com/pytest-dev/pytest-cov (pytest-cov)
> - https://fastapi.tiangolo.com/advanced/testing-dependencies/ (FastAPI dependency override)
>
> 검증일: 2026-05-15
> 대상 버전: **pytest 8.4.x** (현재 8.x 라인 최신 안정). pytest 9.0은 2026-04 출시되었으나 본 스킬은 사용자 요청 범위인 8.x를 기준으로 작성.
> 짝 스킬: `backend/python-fastapi`, `backend/python-uv-project-setup`

---

## 1. 설치 및 기본 구조

### 1-1. 설치 (uv 또는 pip)

```bash
# uv (권장) — backend/python-uv-project-setup 스킬 참조
uv add --dev "pytest>=8.4,<9" pytest-asyncio pytest-mock pytest-cov pytest-xdist

# pip
pip install "pytest>=8.4,<9" pytest-asyncio pytest-mock pytest-cov pytest-xdist
```

### 1-2. 권장 디렉터리 구조

```
project/
├── src/
│   └── myapp/
│       ├── __init__.py
│       └── users.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py         # 공통 fixture 정의
│   ├── unit/
│   │   └── test_users.py
│   └── integration/
│       └── test_api.py
└── pyproject.toml
```

- 테스트 파일: `test_*.py` 또는 `*_test.py`
- 테스트 함수: `test_` 접두사
- 테스트 클래스: `Test` 접두사 + `__init__` 정의 금지

### 1-3. pyproject.toml 설정 (권장)

```toml
[tool.pytest.ini_options]
minversion = "8.0"
testpaths = ["tests"]
addopts = [
    "-ra",                     # 실패/스킵 요약
    "--strict-markers",        # 미등록 marker 사용 시 에러
    "--strict-config",
    "--import-mode=importlib", # 권장 import 모드 (네임스페이스 충돌 방지)
]
asyncio_mode = "auto"          # pytest-asyncio: 모든 async 테스트 자동 인식
markers = [
    "slow: 느린 테스트 (CI에서만 실행)",
    "integration: 외부 의존성 필요",
]
```

> 주의: `--import-mode=importlib`는 pytest 6+에서 도입되었고 src-layout 프로젝트에서 권장된다. 기본값(`prepend`)은 sys.path를 변형해 임포트 경로 문제를 일으킬 수 있다.

---

## 2. assert 문 — pytest의 introspection

pytest는 표준 `assert`만 사용하면 충분하다. 실패 시 좌·우 값을 자동으로 풀어 보여준다.

```python
def test_addition():
    result = 2 + 3
    assert result == 5
    assert result > 0
    assert isinstance(result, int)

def test_dict_match():
    user = {"name": "Alice", "age": 30}
    assert user["name"] == "Alice"
    # 실패 시: assert 'Alice' == 'Bob' 와 함께 dict 전체를 출력해줌

def test_exception():
    import pytest
    with pytest.raises(ValueError, match="must be positive"):
        raise ValueError("value must be positive")

def test_approx_float():
    import pytest
    assert 0.1 + 0.2 == pytest.approx(0.3)
```

- **`unittest.TestCase` 상속 금지** — pytest는 순수 함수 + assert 사용이 표준
- `assert a == b` 한 줄로 풍부한 diff를 얻을 수 있음 → 별도 헬퍼 메서드 불필요

---

## 3. fixture — 의존성 주입

### 3-1. 기본 사용

```python
import pytest

@pytest.fixture
def sample_user():
    return {"id": 1, "name": "Alice"}

def test_user_name(sample_user):
    assert sample_user["name"] == "Alice"
```

### 3-2. yield 패턴 (setup + teardown)

```python
@pytest.fixture
def db_connection():
    conn = create_connection()      # setup
    yield conn                      # 테스트에 값 전달
    conn.close()                    # teardown (예외가 나도 실행됨)
```

### 3-3. scope — 생성 빈도 제어

| scope | 생성 시점 | 사용 시기 |
|-------|-----------|-----------|
| `function` (기본) | 테스트 함수마다 | 변경 가능한 상태 |
| `class` | 테스트 클래스마다 | 클래스 내 공유 |
| `module` | 테스트 파일마다 | 파일 내 공유 |
| `package` | 패키지마다 | 드물게 사용 |
| `session` | 테스트 실행 전체에 1회 | 비싸고 불변인 인프라 (DB 컨테이너 등) |

```python
@pytest.fixture(scope="session")
def database_url():
    container = start_postgres_container()
    yield container.url
    container.stop()

@pytest.fixture(scope="function")
def db_session(database_url):  # function이 session에 의존 가능
    session = Session(database_url)
    yield session
    session.rollback()
```

> 주의: scope 의존 방향은 **좁은 scope → 넓은 scope만 허용**. session-scope fixture가 function-scope fixture에 의존하면 에러.

### 3-4. conftest.py — 공유 fixture

`tests/conftest.py`에 정의된 fixture는 해당 디렉터리 하위 모든 테스트에서 자동 사용 가능 (import 불필요).

```python
# tests/conftest.py
import pytest

@pytest.fixture
def app_config():
    return {"env": "test", "debug": True}
```

---

## 4. parametrize — 데이터 주도 테스트

```python
import pytest

@pytest.mark.parametrize(
    "input_value, expected",
    [
        (1, 1),
        (2, 4),
        (3, 9),
        (-2, 4),
    ],
)
def test_square(input_value, expected):
    assert input_value ** 2 == expected
```

### 4-1. 개별 케이스에 marker 적용

```python
@pytest.mark.parametrize(
    "value, expected",
    [
        (1, 2),
        pytest.param(2, 4, marks=pytest.mark.skip(reason="버그 #123")),
        pytest.param(3, 6, marks=pytest.mark.xfail(reason="기대 실패")),
    ],
)
def test_double(value, expected):
    assert value * 2 == expected
```

### 4-2. id 지정 (테스트 이름 가독성)

```python
@pytest.mark.parametrize(
    "email, is_valid",
    [
        ("a@b.com", True),
        ("invalid", False),
        ("", False),
    ],
    ids=["valid_email", "missing_at", "empty_string"],
)
def test_email(email, is_valid):
    ...
```

### 4-3. fixture parametrize (모든 의존 테스트에 적용)

```python
@pytest.fixture(params=["sqlite", "postgres"])
def db_backend(request):
    return request.param
```

---

## 5. 마커 — 테스트 분류·스킵

### 5-1. 내장 marker

```python
import pytest

@pytest.mark.skip(reason="WIP")
def test_not_ready(): ...

@pytest.mark.skipif(sys.version_info < (3, 11), reason="Python 3.11+ 필요")
def test_new_feature(): ...

@pytest.mark.xfail(reason="알려진 버그 #123", strict=False)
def test_known_bug():
    assert False
```

- `xfail(strict=True)`: 통과하면 오히려 실패 처리 → "버그 회귀 감지"

### 5-2. 커스텀 marker

```python
@pytest.mark.slow
def test_heavy_computation():
    ...

@pytest.mark.integration
def test_external_api():
    ...
```

`pyproject.toml`에 등록 필수 (`--strict-markers` 사용 시):

```toml
[tool.pytest.ini_options]
markers = [
    "slow: 느린 테스트",
    "integration: 외부 의존성 필요",
]
```

실행 시 필터링:

```bash
pytest -m "not slow"           # 느린 테스트 제외
pytest -m "slow and integration"
```

---

## 6. async 테스트 — pytest-asyncio

### 6-1. 설정

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"   # 권장: 모든 async def 자동 인식
```

- `auto` 모드: `@pytest.mark.asyncio` 데코레이터 생략 가능, `@pytest.fixture`로 async fixture 정의 가능
- `strict` 모드 (기본): `@pytest.mark.asyncio` 명시 + async fixture는 `@pytest_asyncio.fixture` 사용

### 6-2. 사용 예 (auto 모드)

```python
import pytest
import httpx

@pytest.fixture
async def async_client():
    async with httpx.AsyncClient() as client:
        yield client

async def test_external_api(async_client):
    response = await async_client.get("https://api.example.com/health")
    assert response.status_code == 200
```

### 6-3. strict 모드 사용 시

```python
import pytest
import pytest_asyncio

@pytest_asyncio.fixture
async def async_client():
    ...

@pytest.mark.asyncio
async def test_external_api(async_client):
    ...
```

> 주의: pytest 8.4부터 async 테스트에 적절한 플러그인이 없으면 **경고가 아닌 실패**로 처리된다. pytest-asyncio 또는 anyio 플러그인을 반드시 설치할 것.

> 주의: pytest-asyncio 1.x부터 strict 모드에서 일반 `@pytest.fixture`를 async fixture에 사용하면 에러. async fixture는 반드시 `@pytest_asyncio.fixture` 또는 auto 모드를 사용.

---

## 7. FastAPI 테스트 — TestClient + 의존성 오버라이드

> 짝 스킬 `backend/python-fastapi`에서 정의한 앱·의존성을 가정.

### 7-1. 동기 테스트 (TestClient)

```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from myapp.main import app
from myapp.deps import get_db

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def override_db():
    def fake_db():
        return FakeSession()
    app.dependency_overrides[get_db] = fake_db
    yield
    app.dependency_overrides.clear()

def test_get_user(client, override_db):
    response = client.get("/users/1")
    assert response.status_code == 200
    assert response.json()["id"] == 1
```

### 7-2. 비동기 테스트 (httpx.AsyncClient + ASGITransport)

큰 테스트 스위트나 async 로직을 직접 awaiting 해야 할 때 권장.

```python
import pytest
import httpx
from httpx import ASGITransport
from myapp.main import app

@pytest.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

async def test_async_endpoint(async_client):
    response = await async_client.get("/users/1")
    assert response.status_code == 200
```

> 주의: TestClient는 동기 인터페이스이며 내부에서 이벤트 루프를 자체 관리한다. async 테스트 내부에서 TestClient를 호출하면 이벤트 루프 충돌이 발생할 수 있으므로 async 컨텍스트에서는 `httpx.AsyncClient + ASGITransport`를 사용한다.

### 7-3. 의존성 오버라이드 fixture 패턴

```python
@pytest.fixture
def app_with_overrides():
    def fake_current_user():
        return User(id=1, email="test@example.com")

    app.dependency_overrides[get_current_user] = fake_current_user
    yield app
    app.dependency_overrides.clear()
```

- 테스트 종료 시 반드시 `dependency_overrides.clear()` — 그렇지 않으면 다른 테스트에 누수

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
