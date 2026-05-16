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

## 8. mock — unittest.mock + pytest-mock

### 8-1. mocker fixture (pytest-mock)

`unittest.mock.patch`의 컨텍스트 매니저/데코레이터 보일러플레이트를 제거해주는 fixture. 테스트 종료 시 자동 원복된다.

```python
def test_send_email(mocker):
    # 외부 SMTP 호출을 mock으로 대체
    mock_smtp = mocker.patch("myapp.email.smtplib.SMTP")
    mock_smtp.return_value.sendmail.return_value = {}

    from myapp.email import send_welcome
    send_welcome("user@example.com")

    mock_smtp.return_value.sendmail.assert_called_once()
```

### 8-2. spy — 실제 호출은 하되 호출 기록만 검증

```python
def test_called_with(mocker):
    spy = mocker.spy(MyService, "calculate")
    MyService().run()
    spy.assert_called_with(42)
```

### 8-3. unittest.mock 직접 사용 (mocker 없이)

```python
from unittest.mock import patch, MagicMock

def test_direct_mock():
    with patch("myapp.email.smtplib.SMTP") as mock_smtp:
        mock_smtp.return_value.sendmail.return_value = {}
        ...
```

> 권장: pytest 환경에서는 `mocker` fixture가 더 깔끔하고 자동 cleanup이 보장된다.

---

## 9. 커버리지 — pytest-cov

```bash
# 기본 실행
pytest --cov=src/myapp --cov-report=term-missing

# HTML 리포트
pytest --cov=src/myapp --cov-report=html

# 최소 커버리지 기준
pytest --cov=src/myapp --cov-fail-under=80
```

### 9-1. pyproject.toml 설정

```toml
[tool.coverage.run]
source = ["src/myapp"]
branch = true
omit = ["*/tests/*", "*/__init__.py"]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "raise NotImplementedError",
    "if TYPE_CHECKING:",
]
show_missing = true
skip_covered = false
```

---

## 10. 주요 플러그인 정리

| 플러그인 | 용도 | 핵심 사용법 |
|----------|------|-------------|
| `pytest-asyncio` | async 테스트 지원 | `asyncio_mode = "auto"` |
| `pytest-mock` | mocker fixture | `mocker.patch(...)` |
| `pytest-cov` | 커버리지 측정 | `--cov=src/pkg` |
| `pytest-xdist` | 병렬 실행 | `pytest -n auto` |
| `pytest-env` | 환경 변수 주입 | `pyproject.toml`에 `env = [...]` |
| `pytest-httpx` | httpx 모킹 | `httpx_mock` fixture |

---

## 11. CI 통합 — GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.11", "3.12", "3.13"]

    steps:
      - uses: actions/checkout@v4

      - name: Install uv
        uses: astral-sh/setup-uv@v3

      - name: Set up Python ${{ matrix.python-version }}
        run: uv python install ${{ matrix.python-version }}

      - name: Install dependencies
        run: uv sync --all-extras --dev

      - name: Run pytest (parallel + coverage)
        run: |
          uv run pytest -n auto \
            --cov=src \
            --cov-report=xml \
            --cov-report=term-missing \
            -m "not slow"

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage.xml
```

- `-n auto`: pytest-xdist로 CPU 코어 수만큼 병렬 실행
- `-m "not slow"`: 느린 테스트는 별도 잡으로 분리 가능

---

## 12. 흔한 함정

### 12-1. fixture scope 오해

```python
# ❌ session fixture가 function fixture에 의존 — 에러
@pytest.fixture(scope="session")
def heavy_resource(temp_file):  # temp_file은 function scope
    ...

# ✅ 좁은 → 넓은 scope 의존만 허용
@pytest.fixture(scope="function")
def temp_file(heavy_resource):  # session scope 사용 OK
    ...
```

### 12-2. async fixture 누락

```python
# ❌ strict 모드에서 일반 @pytest.fixture로 async 정의
@pytest.fixture
async def async_client():  # pytest-asyncio 1.x strict 모드에서 에러
    ...

# ✅ auto 모드 + @pytest.fixture 또는 strict 모드 + @pytest_asyncio.fixture
import pytest_asyncio

@pytest_asyncio.fixture
async def async_client():
    ...
```

### 12-3. import 경로 문제

src-layout(`src/myapp/`)에서 테스트가 `myapp`을 못 찾는 경우:

```toml
# pyproject.toml
[tool.pytest.ini_options]
pythonpath = ["src"]
# 또는
addopts = ["--import-mode=importlib"]
```

또한 `tests/__init__.py`를 두면 디렉터리가 패키지로 인식되어 import 충돌이 줄어든다.

### 12-4. dependency_overrides 누수

```python
# ❌ teardown 누락
def test_a(client):
    app.dependency_overrides[get_db] = fake_db
    ...  # 다른 테스트에 영향

# ✅ fixture로 자동 cleanup
@pytest.fixture
def override_db():
    app.dependency_overrides[get_db] = fake_db
    yield
    app.dependency_overrides.clear()
```

### 12-5. 테스트가 None이 아닌 값을 반환 (pytest 8.4+)

```python
# ❌ pytest 8.4부터 실패 처리 (이전엔 경고)
def test_returns_value():
    return some_value  # 반환 금지

# ✅ assert로 검증
def test_returns_value():
    assert some_value is not None
```

### 12-6. mock 대상 경로 오해

```python
# ❌ 정의된 모듈을 패치
mocker.patch("myapp.email.smtplib.SMTP")  # myapp.email에서 import한 SMTP만 적용

# ✅ 사용되는 위치를 패치 (import 위치)
# from smtplib import SMTP 가 myapp.email 안에 있다면 위 경로가 맞음
# 직접 smtplib.SMTP 호출이면 mocker.patch("smtplib.SMTP")
```

규칙: **"사용되는 곳"의 namespace를 패치한다** (정의된 곳이 아니라).

### 12-7. parametrize에서 mutable 기본값 공유

```python
# ❌ list 객체를 여러 케이스가 공유
@pytest.mark.parametrize("items", [[1, 2], [1, 2]])
def test_mutates(items):
    items.append(3)  # 다음 테스트로 누수 가능

# ✅ 각 케이스에서 새로 생성하거나, fixture 사용
```

---

## 언제 사용 / 언제 사용하지 않을지

| 상황 | 권장 |
|------|------|
| Python 단위·통합 테스트 전반 | pytest |
| Django 프로젝트 | pytest + pytest-django |
| FastAPI 비동기 API | pytest + pytest-asyncio + httpx.AsyncClient |
| 매우 단순한 1회성 스크립트 검증 | 표준 `unittest`로 충분할 수 있음 |
| 브라우저 E2E | Playwright/Selenium 등 별도 도구 (pytest와 결합은 가능) |

---

## 참고 짝 스킬

- **`backend/python-fastapi`** — FastAPI 앱·의존성·라우터 구조
- **`backend/python-uv-project-setup`** — uv로 pytest 의존성 설치·실행
