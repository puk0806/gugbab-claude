---
name: python-cli-typer
description: >
  Typer를 사용한 Python CLI 개발 — FastAPI 제작자(tiangolo)의 차세대 CLI 라이브러리.
  Python 타입 힌트 기반 자동 파싱, 서브커맨드, Rich 통합, 자동완성, 환경변수, 패키징, 테스팅까지 전 영역 커버.
  <example>사용자: "Click 대신 Typer로 CLI를 만들고 싶어"</example>
  <example>사용자: "Typer 서브커맨드 그룹 구성법 알려줘"</example>
  <example>사용자: "Optional[str] 인자가 동작 안 해, default 처리법이 뭐야?"</example>
---

# Python CLI: Typer

> 소스: https://typer.tiangolo.com/ , https://github.com/fastapi/typer , https://pypi.org/project/typer/
> 검증일: 2026-05-15
> 검증 버전: Typer 0.25.1 (2026-04-30 릴리즈)
> 짝 스킬: `backend/python-uv-project-setup`, `backend/python-basics`

---

## 1. Typer 소개

**Typer**는 FastAPI를 만든 Sebastián Ramírez(tiangolo)가 개발한 Python CLI 라이브러리로, "FastAPI of CLIs"로 불린다.

| 항목 | 내용 |
|------|------|
| 제작자 | Sebastián Ramírez (tiangolo) |
| 최신 버전 | 0.25.1 (2026-04-30) |
| 기반 | Click (내부 의존), Rich (출력), Shellingham (셸 감지) |
| Python 지원 | >=3.10 (3.10 ~ 3.14) |
| 라이선스 | MIT |
| 핵심 철학 | Python 타입 힌트만으로 CLI 자동 생성 |

**Click과의 관계:** Typer는 Click을 내부 엔진으로 사용한다. 즉 Click의 모든 기능을 사용할 수 있으면서 타입 힌트 기반의 더 간결한 API를 제공한다.

---

## 2. 설치 (uv 권장)

```bash
# uv 프로젝트에서
uv add typer

# pip
pip install typer
```

Typer 0.12+ 부터는 Rich가 기본 의존성에 포함되어 별도 설치가 불필요하다 (이전에는 `typer[all]` 필요했으나 deprecated).

> 짝 스킬 `backend/python-uv-project-setup` 참조 — uv 기반 프로젝트 초기화·의존성 관리.

---

## 3. 기본 CLI — `typer.run` (단일 함수)

가장 간단한 형태. 함수 하나만 CLI로 만들 때.

```python
# main.py
import typer

def main(name: str, count: int = 1):
    for _ in range(count):
        print(f"Hello {name}")

if __name__ == "__main__":
    typer.run(main)
```

```bash
$ python main.py Camila --count 3
Hello Camila
Hello Camila
Hello Camila
```

타입 힌트가 자동으로 `--help`와 인자 검증을 생성한다.

---

## 4. `typer.Typer()` 앱 — `@app.command()`

복수 커맨드를 가지려면 `typer.Typer()` 인스턴스를 만든다.

```python
import typer

app = typer.Typer()

@app.command()
def create(name: str):
    print(f"Creating user: {name}")

@app.command()
def delete(name: str):
    print(f"Deleting user: {name}")

if __name__ == "__main__":
    app()
```

```bash
$ python main.py create Hiro
$ python main.py delete Hiro
```

함수명이 자동으로 커맨드명이 되며, 선언 순서대로 `--help`에 표시된다.

`typer.Typer(no_args_is_help=True)`로 설정하면 인자 없이 실행 시 도움말이 자동 출력된다.

---

## 5. 인자(Argument) vs 옵션(Option)

**핵심 규칙:** Python 함수의 기본값 유무가 그대로 매핑된다.

| Python 시그니처 | CLI 형태 |
|----------------|---------|
| `def f(name: str)` | positional argument (필수) |
| `def f(name: str = "World")` | positional argument (기본값 있음) |
| `def f(name: str, count: int = 1)` | `count`는 `--count` 옵션 (기본값) |

**명시적으로 제어하려면** `typer.Argument()` / `typer.Option()` 사용.

### 권장 — `Annotated` 스타일 (Typer 0.9+, 공식 권장)

```python
from typing import Annotated
import typer

app = typer.Typer()

@app.command()
def greet(
    name: Annotated[str, typer.Argument(help="대상 이름")],
    greeting: Annotated[str, typer.Option("--greeting", "-g", help="인사말")] = "Hello",
    count: Annotated[int, typer.Option(min=1, max=10)] = 1,
):
    for _ in range(count):
        print(f"{greeting} {name}")
```

> 권장: 항상 `Annotated` 스타일을 사용한다. 기본값은 함수 매개변수 기본값으로 분리한다.

### 비권장 — 레거시 스타일 (default 자리에 typer.Option)

```python
# 가능하지만 권장되지 않음
def greet(
    name: str = typer.Argument(...),
    greeting: str = typer.Option("Hello", "--greeting", "-g"),
):
    ...
```

이 스타일은 함수를 다른 코드에서 직접 호출할 때 typer.Option 객체가 인자로 들어와 문제가 발생한다.

---

## 6. 프롬프트(prompt) — 사용자 입력 받기

옵션이 누락되었을 때 사용자에게 입력을 요청한다.

```python
from typing import Annotated
import typer

@app.command()
def login(
    username: Annotated[str, typer.Option(prompt=True)],
    password: Annotated[str, typer.Option(prompt=True, hide_input=True, confirmation_prompt=True)],
):
    print(f"Logging in as {username}")
```

| 파라미터 | 효과 |
|----------|------|
| `prompt=True` | 누락 시 입력 요청 |
| `prompt="Please enter your name"` | 커스텀 프롬프트 메시지 |
| `confirmation_prompt=True` | 동일 값 두 번 입력 강제 (삭제·중요 작업) |
| `hide_input=True` | 입력 마스킹 (비밀번호) |

---

## 7. 환경변수 — `envvar`

CLI 인자가 없으면 환경변수에서 자동으로 값을 읽는다.

```python
from typing import Annotated
import typer

@app.command()
def deploy(
    api_key: Annotated[str, typer.Option(envvar="MY_API_KEY")],
    region: Annotated[str, typer.Argument(envvar=["AWS_REGION", "REGION"])] = "us-east-1",
):
    print(f"Deploying to {region} with key {api_key[:4]}...")
```

**해석 우선순위:** CLI 인자 → 환경변수 → 기본값.

`show_envvar=False`로 도움말에서 환경변수 표시를 숨길 수 있다.

---

## 8. 서브커맨드 — `app.add_typer()`

`git remote add ...` 같은 계층적 커맨드 구조.

```python
# users.py
import typer
app = typer.Typer()

@app.command()
def create(name: str):
    print(f"Creating user: {name}")

@app.command()
def delete(name: str):
    print(f"Deleting user: {name}")
```

```python
# items.py
import typer
app = typer.Typer()

@app.command("create")
def create_item(name: str):
    print(f"Creating item: {name}")
```

```python
# main.py
import typer
import users, items

app = typer.Typer()
app.add_typer(users.app, name="users")
app.add_typer(items.app, name="items")

if __name__ == "__main__":
    app()
```

```bash
$ python main.py users create Camila
$ python main.py items create Wand
```

> 주의: Typer 0.14부터 `name=` 미지정 시 자동 명명 기능이 제거되었다. **반드시 `name=` 명시**.

---

## 9. 콜백(callback) — 글로벌 옵션·Pre-hook

`@app.callback()`은 모든 커맨드 실행 전에 호출되어 전역 상태·옵션을 처리한다.

```python
from typing import Annotated
import typer

app = typer.Typer()
state = {"verbose": False}

@app.callback()
def main(
    verbose: Annotated[bool, typer.Option("--verbose", "-v")] = False,
):
    """My CLI tool — global options here."""
    if verbose:
        print("Verbose mode enabled")
        state["verbose"] = True

@app.command()
def hello(name: str):
    if state["verbose"]:
        print(f"[debug] greeting {name}")
    print(f"Hello {name}")
```

```bash
$ python main.py --verbose hello Camila
```

**중요:** 콜백 옵션은 *커맨드 이름보다 앞에* 와야 한다 (`python main.py --verbose hello` ✅ / `python main.py hello --verbose` ❌).

`@app.callback(invoke_without_command=True)`로 설정하면 커맨드 없이 실행할 때도 콜백이 동작한다.

---

## 10. Rich 통합 — 컬러·테이블·진행률

Typer는 Rich를 기본 의존성으로 포함한다.

### `typer.echo` / `typer.secho`

```python
import typer

typer.echo("기본 출력")
typer.secho("성공!", fg=typer.colors.GREEN, bold=True)
typer.secho("경고", fg=typer.colors.YELLOW, bg=typer.colors.BLACK)
typer.secho("에러", fg=typer.colors.RED, err=True)
```

### Rich `print`·`Table`·`Progress`

```python
from rich import print as rprint
from rich.console import Console
from rich.table import Table
from rich.progress import track
import time

console = Console()

@app.command()
def list_users():
    table = Table("ID", "Name", "Role")
    table.add_row("1", "Camila", "Admin")
    table.add_row("2", "Hiro", "User")
    console.print(table)

@app.command()
def process():
    for _ in track(range(100), description="Processing..."):
        time.sleep(0.01)
    rprint("[bold green]완료![/bold green]")
```

> 설계 원칙: **Typer는 CLI 구조**(인자·옵션·검증), **Rich는 출력**(컬러·테이블·진행률)을 담당한다.

---

## 11. 에러 핸들링 — `typer.Exit` / `typer.Abort` / `typer.BadParameter`

```python
import typer

@app.command()
def deploy(env: str):
    if env not in ("dev", "staging", "prod"):
        raise typer.BadParameter(f"잘못된 환경: {env}")

    if env == "prod":
        confirm = typer.confirm("프로덕션 배포 진행할까요?")
        if not confirm:
            raise typer.Abort()  # "Aborted!" 메시지 출력 후 종료

    try:
        do_deploy(env)
    except Exception as e:
        typer.secho(f"배포 실패: {e}", fg=typer.colors.RED, err=True)
        raise typer.Exit(code=1)  # 종료 코드 1로 종료

    typer.secho("배포 성공", fg=typer.colors.GREEN)
    raise typer.Exit()  # 종료 코드 0 (생략 가능)
```

| 예외 | 용도 | 메시지 |
|------|------|--------|
| `typer.Exit(code=N)` | 명시적 종료 (성공/실패 모두) | 없음 |
| `typer.Abort()` | 의도적 중단 (사용자 거부 등) | "Aborted!" 출력 |
| `typer.BadParameter(msg)` | 검증 실패 → usage 에러 형태로 표시 | 자동 포맷 |

---

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
