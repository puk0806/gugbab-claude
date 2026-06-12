## 12. 자동완성 설치

Typer는 기본적으로 두 옵션을 자동 제공한다:

```bash
$ mycli --install-completion       # bash/zsh/fish/PowerShell 자동 감지하여 설치
$ mycli --show-completion          # 현재 셸용 완성 스크립트 출력
```

설치 후 셸을 재시작하면 `Tab` 자동완성이 활성화된다. Shellingham이 현재 셸을 자동 감지한다.

> 참고: 직접 패키지로 설치된 CLI(`pip install`·`uv sync` 후 entry point로 노출됨)에서 가장 잘 동작한다.

---

## 13. 패키징 — `pyproject.toml` entry point

`uv init --package`로 시작한 프로젝트라면:

```toml
# pyproject.toml
[project]
name = "mycli"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = ["typer>=0.25.0"]

[project.scripts]
mycli = "mycli.main:app"
```

```python
# src/mycli/main.py
import typer
app = typer.Typer()

@app.command()
def hello(name: str):
    print(f"Hello {name}")
```

```bash
$ uv sync
$ mycli hello World        # 직접 실행 가능
$ uv build                 # dist/mycli-0.1.0-py3-none-any.whl 생성
```

`[project.scripts]`의 형식은 `명령어이름 = "패키지.모듈:호출가능객체"`다. `app`은 `typer.Typer()` 인스턴스이며 callable이다.

---

## 14. 테스트 — `CliRunner`

Typer는 Click의 `CliRunner`를 래핑한 `typer.testing.CliRunner`를 제공한다.

```python
# tests/test_cli.py
from typer.testing import CliRunner
from mycli.main import app

runner = CliRunner()

def test_hello():
    result = runner.invoke(app, ["hello", "Camila"])
    assert result.exit_code == 0
    assert "Hello Camila" in result.stdout

def test_missing_argument():
    result = runner.invoke(app, ["hello"])
    assert result.exit_code != 0
    assert "Missing argument" in result.output

def test_prompt():
    # input으로 stdin 시뮬레이션 (\n = Enter)
    result = runner.invoke(app, ["login"], input="alice\nsecret\nsecret\n")
    assert result.exit_code == 0
```

| 속성 | 의미 |
|------|------|
| `result.exit_code` | 종료 코드 (성공=0) |
| `result.stdout` | 표준 출력 |
| `result.output` | stdout + stderr 합쳐진 출력 |
| `result.exception` | 발생한 예외 (있을 시) |

> 짝 스킬 `backend/python-pytest` 참조 — pytest 기반 테스트 구조.

---

## 15. Click과의 차이·마이그레이션

| 항목 | Click | Typer |
|------|-------|-------|
| 파라미터 정의 | `@click.option`·`@click.argument` 데코레이터 | Python 타입 힌트 + `Annotated` |
| 타입 변환 | `type=int` 명시 | `int` 타입 힌트로 자동 |
| 도움말 | docstring 또는 `help=` | 동일 + 타입 힌트 자동 정보 |
| 자동완성 | 별도 설치 스크립트 | `--install-completion` 내장 |
| 에러 표시 | 기본 트레이스백 | Rich 기반 컬러 트레이스백 |
| 서브커맨드 | `@cli.group()` + `@group.command()` | `typer.Typer()` + `app.add_typer()` |

**마이그레이션 패턴:**

```python
# Click
@click.command()
@click.argument("name")
@click.option("--count", default=1, type=int)
def hello(name, count):
    for _ in range(count):
        click.echo(f"Hello {name}")

# Typer 변환
from typing import Annotated
import typer

app = typer.Typer()

@app.command()
def hello(
    name: str,
    count: Annotated[int, typer.Option()] = 1,
):
    for _ in range(count):
        typer.echo(f"Hello {name}")
```

Typer 내부에서 Click을 사용하므로, Click 기능이 필요하면 `typer.Context`(=`click.Context`)를 통해 접근할 수 있다.

---

## 16. 흔한 함정 (Pitfalls)

### 함정 1 — `Optional[str]` 인자 default 처리

```python
# 잘못된 예 — None을 명시적 기본값으로 줘야 함
def f(name: Optional[str]): ...

# 올바른 예
from typing import Annotated, Optional
def f(name: Annotated[Optional[str], typer.Option()] = None): ...
```

### 함정 2 — 가변 기본값 (list·dict)

```python
# 잘못된 예 — 한 번만 초기화되어 호출 간 공유됨
def f(tags: Annotated[list[str], typer.Option()] = ["a", "b"]): ...

# 올바른 예 — default_factory 사용
def f(tags: Annotated[list[str], typer.Option(default_factory=lambda: ["a", "b"])]): ...
```

### 함정 3 — `app.add_typer()` 시 `name=` 누락

Typer 0.14부터 자동 명명이 제거되어 반드시 명시해야 한다.

```python
# 잘못된 예 — 0.14+ 에러
app.add_typer(users.app)

# 올바른 예
app.add_typer(users.app, name="users")
```

### 함정 4 — 콜백 옵션을 커맨드 뒤에 두기

```bash
# 잘못 — 콜백 옵션은 커맨드 뒤에 둘 수 없음
$ mycli hello --verbose

# 올바름
$ mycli --verbose hello
```

### 함정 5 — 레거시 default 스타일에서 함수 직접 호출 시 오류

```python
def hello(name: str = typer.Argument(...)):
    print(f"Hi {name}")

# 잘못 — typer.Argument 객체가 그대로 들어옴
hello("Camila")  # TypeError
```

→ `Annotated` 스타일을 사용하면 함수로도 정상 호출 가능.

### 함정 6 — Rich 트레이스백에 로컬 변수 노출

`pretty_exceptions_show_locals=True` 옵션은 디버깅에 좋지만 비밀번호·API 키 노출 위험이 있다. **프로덕션은 `False`** 또는 환경변수 `TYPER_STANDARD_TRACEBACK=1` 사용.

---

## 17. 언제 사용 / 사용하지 않을지

**Typer가 적합한 경우:**
- 타입 힌트 기반의 깔끔한 CLI 코드를 원할 때
- 자동완성·자동 도움말·컬러 출력이 필요한 사용자용 CLI
- 서브커맨드 트리가 있는 도구(`git`·`docker` 류)
- 내부 도구·운영 스크립트의 정식 CLI화

**Typer를 권장하지 않는 경우:**
- 단순 일회성 스크립트 (`argparse`로 충분)
- Click 플러그인 생태계를 깊게 활용하는 기존 프로젝트 (Click 직접 사용이 자연스러움)
- Python 3.9 이하 지원이 필요한 환경 (Typer 0.21+ 부터 3.9 미지원, 0.24+ 부터 3.10+ 필수)

---

## 18. 참조

- 공식 문서: https://typer.tiangolo.com/
- GitHub: https://github.com/fastapi/typer
- PyPI: https://pypi.org/project/typer/
- 짝 스킬: `backend/python-uv-project-setup` (프로젝트 셋업), `backend/python-basics` (Python 기초)
