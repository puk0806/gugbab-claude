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
