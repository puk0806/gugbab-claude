---
name: python-uv-project-setup
description: >
  Astral uv를 사용한 Python 프로젝트 셋업 — pip/poetry/pyenv를 대체하는 Rust 기반 차세대 패키지 매니저.
  프로젝트 초기화·의존성 관리·Python 버전 관리·가상환경·lockfile·CI 통합까지 통합 워크플로우.
  <example>사용자: "FastAPI 프로젝트를 uv로 초기화해줘"</example>
  <example>사용자: "poetry 프로젝트를 uv로 마이그레이션하려면?"</example>
  <example>사용자: "uv run과 직접 python 실행 차이가 뭐야?"</example>
---

# Python uv Project Setup

> 소스: https://docs.astral.sh/uv/ , https://github.com/astral-sh/uv
> 검증일: 2026-05-15
> 검증 버전: uv 0.11.14 (2026-05-12 릴리즈)

---

## 1. uv 소개

**uv**는 Astral이 Rust로 작성한 Python 패키지·프로젝트 매니저로, pip 대비 **10–100배 빠르다** (공식 벤치마크 기준).

| 항목 | 내용 |
|------|------|
| 제작사 | Astral (ruff·ty 제작사) |
| 언어 | Rust (코드베이스 98.1% Rust) |
| 최신 버전 | 0.11.14 (2026-05-12) |
| 대체 대상 | `pip`, `pip-tools`, `pipx`, `poetry`, `pyenv`, `virtualenv`, `twine` |
| 라이선스 | MIT or Apache-2.0 |

**uv가 통합하는 것:**
- 패키지 설치 / 의존성 해석 (pip + pip-tools 대체)
- 가상환경 관리 (virtualenv 대체)
- Python 인터프리터 설치·관리 (pyenv 대체)
- 프로젝트·lockfile 관리 (poetry 대체)
- 도구 실행 (pipx 대체)
- 패키지 빌드·게시 (twine 대체)

> **역할 분리:** 이 스킬은 *Python 전용 도구* 다룬다. Java 백엔드(Gradle/Maven), Rust 백엔드(Cargo)는 각자 패키지 매니저를 사용한다. 짝 스킬: `backend/python-basics`, `backend/python-fastapi`, `backend/python-pytest`.

---

## 2. 설치

### macOS / Linux

```bash
# 권장 — 독립형 인스톨러 (Rust나 Python 사전 설치 불필요)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 또는 Homebrew
brew install uv
```

### Windows

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 기타 방법

```bash
pipx install uv          # pipx
pip install uv           # pip (글로벌이 아닌 격리된 환경 권장)
```

### 업데이트

```bash
uv self update           # 독립형 인스톨러로 설치한 경우만 사용 가능
```

> **주의:** Homebrew·pip·pipx로 설치한 경우 `uv self update` 대신 해당 패키지 매니저로 업데이트한다.

### Shell completion

```bash
# zsh
uv generate-shell-completion zsh > ~/.zfunc/_uv

# bash
echo 'eval "$(uv generate-shell-completion bash)"' >> ~/.bashrc
```

---

## 3. 프로젝트 초기화

### 새 프로젝트

```bash
uv init my-project
cd my-project
```

**생성되는 파일:**
- `pyproject.toml` — 프로젝트 메타데이터·의존성
- `.python-version` — 기본 Python 버전 핀
- `README.md`
- `main.py` — 진입점 샘플
- `.gitignore`

### 기존 디렉토리에서 초기화

```bash
cd existing-project
uv init                  # 현재 디렉토리에 pyproject.toml 생성
uv init --bare           # main.py·README 생략, 최소 구성
uv init --lib            # 라이브러리 구조 (src/ 레이아웃)
uv init --app            # 애플리케이션 구조 (기본값)
```

### pyproject.toml 구조

```toml
[project]
name = "my-project"
version = "0.1.0"
description = "..."
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.32.0",
]

[dependency-groups]
dev = [
    "pytest>=8.0.0",
    "ruff>=0.7.0",
]

[tool.uv]
# uv 전용 설정 (선택)
# 예: default-groups = ["dev"]
```

| 섹션 | 역할 |
|------|------|
| `[project]` | PEP 621 표준 — 다른 도구와 호환되는 메타데이터 |
| `[dependency-groups]` | PEP 735 표준 — dev/test/lint 등 그룹별 의존성 |
| `[tool.uv]` | uv 전용 설정 (resolution, index, workspace 등) |

---

## 4. 의존성 관리

### 추가·제거

```bash
# 런타임 의존성
uv add fastapi
uv add 'requests==2.31.0'
uv add 'pydantic>=2.5,<3.0'

# Git 의존성
uv add git+https://github.com/psf/requests

# 개발 의존성 (dev 그룹)
uv add --dev pytest ruff mypy

# 다른 그룹 (예: lint, test, docs)
uv add --group lint ruff
uv add --group test pytest httpx
uv add --group docs sphinx

# Optional dependencies (라이브러리 게시용)
uv add httpx --optional network

# 제거
uv remove fastapi
uv remove --dev pytest
```

### 동기화 (sync)

```bash
uv sync                  # pyproject.toml + uv.lock 기준 .venv 동기화
uv sync --locked         # lockfile 변경 없이만 동기화 (CI 권장)
uv sync --frozen         # lockfile 무시 없이 그대로 사용
uv sync --all-groups     # 모든 의존성 그룹 포함
uv sync --no-dev         # dev 그룹 제외
uv sync --group test     # test 그룹 포함
```

### Lockfile 관리

```bash
uv lock                  # pyproject.toml에서 uv.lock 재생성
uv lock --upgrade        # 모든 패키지 최신화
uv lock --upgrade-package requests   # 특정 패키지만 최신화
```

> **`uv.lock`은 크로스 플랫폼 lockfile이며 직접 편집 금지** — uv가 관리한다. 반드시 버전 관리에 포함한다 (`requirements.txt` / `poetry.lock` 대체).

---

## 5. Python 버전 관리

```bash
# 설치
uv python install              # 프로젝트가 요구하는 버전 자동 설치
uv python install 3.12
uv python install 3.11 3.12 3.13   # 여러 버전
uv python install pypy@3.10    # PyPy 등 대체 구현

# 조회
uv python list                 # 설치된 버전 + 다운로드 가능한 버전

# 프로젝트별 핀
uv python pin 3.12             # .python-version 파일 생성·업데이트

# 업그레이드
uv python upgrade 3.12         # 패치 버전 업그레이드
```

**자동 다운로드:** uv는 `.python-version` 또는 `requires-python`에 명시된 Python이 시스템에 없으면 자동으로 다운로드한다 (Astral의 python-build-standalone 배포판 사용).

---

## 6. 가상환경

uv는 프로젝트 루트에 `.venv`를 **자동 생성·관리**한다. 별도로 활성화할 필요 없이 `uv run` 사용을 권장한다.

```bash
# 명시적으로 .venv 생성 (필요 시)
uv venv
uv venv --python 3.12
uv venv my-env                # 다른 이름

# 활성화 (선택 — uv run 사용 시 불필요)
source .venv/bin/activate     # macOS/Linux
.venv\Scripts\activate        # Windows
```

> **권장:** 활성화 없이 `uv run` 사용. 활성화는 IDE 인터프리터 설정이나 옛 도구 호환용으로만.

---

## 7. 실행 (uv run)

```bash
uv run python script.py           # 프로젝트 .venv로 실행
uv run pytest                     # 의존성에 설치된 도구 실행
uv run -- ruff check .            # -- 이후는 인자로 전달
uv run --with httpx python -c "import httpx; print(httpx.__version__)"
                                  # 일회성 의존성 추가
```

**`uv run`의 동작:**
1. lockfile이 `pyproject.toml`과 일치하는지 확인
2. 불일치하면 자동 sync
3. `.venv` 컨텍스트에서 명령 실행

> **`uv run`은 매번 lockfile 검증·동기화를 수행하므로** 일반 `python script.py`보다 안전하다. CI·로컬 모두 `uv run` 사용을 권장한다.

---

## 8. Lockfile (uv.lock)

| 비교 항목 | `uv.lock` | `poetry.lock` | `requirements.txt` |
|-----------|-----------|---------------|---------------------|
| 형식 | TOML (human-readable) | TOML | plain text |
| 크로스 플랫폼 | ✅ (모든 OS·아키텍처 해석 포함) | 부분 | ❌ |
| 결정론적 해석 | ✅ | ✅ | 직접 작성 시 ❌ |
| 자동 생성 | uv 명령 시 | poetry 명령 시 | pip freeze 수동 |
| 버전 관리 포함 | ✅ 필수 | ✅ 필수 | 선택 |

**`uv.lock`은 반드시 커밋한다.** 재현 가능한 빌드의 근간이다.

---

## 9. CI 통합

### GitHub Actions

```yaml
name: CI

on: [push, pull_request]

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
        with:
          version: "0.11.14"          # 핀 권장
          enable-cache: true          # ~/.cache/uv 자동 캐싱
          python-version: ${{ matrix.python-version }}
      - name: Install dependencies
        run: uv sync --locked --all-extras --dev
      - name: Run tests
        run: uv run pytest
      - name: Lint
        run: uv run ruff check .
```

> **`--locked`** 옵션은 lockfile이 최신이 아니면 빌드 실패시킨다. CI에서 반드시 사용한다.

### Docker (multi-stage)

```dockerfile
# syntax=docker/dockerfile:1.7
FROM ghcr.io/astral-sh/uv:0.11.14 AS uv

FROM python:3.12-slim AS builder
COPY --from=uv /uv /uvx /bin/

ENV UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1 \
    UV_NO_DEV=1

WORKDIR /app

# 1단계: 의존성만 먼저 설치 (캐시 레이어 최적화)
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-install-project --no-dev

# 2단계: 프로젝트 코드 복사 + 설치
COPY . .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev

FROM python:3.12-slim
COPY --from=builder /app /app
ENV PATH="/app/.venv/bin:$PATH"
WORKDIR /app

CMD ["python", "-m", "my_project"]
```

**핵심 최적화:**
- `UV_LINK_MODE=copy` — Docker 레이어 캐싱 호환
- `UV_COMPILE_BYTECODE=1` — `.pyc` 미리 컴파일로 시작 시간 단축
- `--no-install-project` — 의존성만 먼저 설치하여 캐시 적중률 향상
- `--no-dev` — 프로덕션 이미지에서 dev 그룹 제외
- `.dockerignore`에 `.venv` 포함

---

## 10. 마이그레이션

### requirements.txt → uv

```bash
uv init --bare                          # 최소 pyproject.toml 생성
uv add -r requirements.txt              # 모든 의존성 import → [project.dependencies] 작성 + uv.lock 생성
uv add --dev -r requirements-dev.txt    # dev 의존성 분리되어 있다면
```

`uv add -r`은 requirements.txt를 파싱하여 정확한 버전을 해석한 뒤 `pyproject.toml`과 `uv.lock`에 기록한다.

### Poetry → uv

**옵션 A: 수동 변환**
```bash
# 1) pyproject.toml의 [tool.poetry.dependencies] → [project.dependencies]로 옮김
# 2) [tool.poetry.group.dev.dependencies] → [dependency-groups] dev로 옮김
# 3) lock 생성
uv lock
uv sync
```

**옵션 B: 자동 변환 도구**
```bash
uvx migrate-to-uv          # 커뮤니티 도구. 결과는 반드시 검토
```

> **주의:** Poetry의 캐럿 버전(`^1.2.3`)·틸드(`~1.2.3`)는 PEP 440 표기로 변환 필요. `^1.2.3` → `>=1.2.3,<2.0.0`, `~1.2.3` → `>=1.2.3,<1.3.0`.

### pip 호환 인터페이스 (점진적 도입)

```bash
uv pip install requests             # pip와 동일한 인터페이스
uv pip install -r requirements.txt
uv pip compile requirements.in -o requirements.txt    # pip-tools 대체
uv pip sync requirements.txt
```

> `uv pip`은 *마이그레이션 중간 단계*용이다. 새 프로젝트는 처음부터 `uv add` / `uv sync`를 사용한다.

---

## 11. 흔한 함정

### 11-1. `uv run` 없이 직접 `python` 실행

```bash
# ❌ 함정 — 시스템 Python이 실행되어 의존성 못 찾음
python script.py
# ModuleNotFoundError: No module named 'fastapi'

# ✅ 권장
uv run python script.py
# 또는 .venv 활성화 후
source .venv/bin/activate && python script.py
```

### 11-2. `uv sync` 누락

`pyproject.toml`을 직접 편집했는데 `uv sync`나 `uv run` 없이 실행 → 환경이 stale 상태.

```bash
# ❌ pyproject.toml 직접 편집 후
python -c "import new_lib"   # 설치 안 되어 있음

# ✅ uv add 사용 (자동 sync)
uv add new_lib

# ✅ 또는 편집 후 명시적 sync
uv sync
```

### 11-3. 시스템 Python과 혼동

`which python` / `where python`이 시스템 Python을 가리키면 `.venv`가 활성화되지 않은 것이다.

```bash
# 확인
uv run which python
# /path/to/project/.venv/bin/python   ← 정상

which python
# /usr/bin/python                     ← .venv 미활성화 (uv run 사용 필요)
```

### 11-4. `uv.lock`을 .gitignore에 추가

```gitignore
# ❌ 절대 추가하지 말 것
uv.lock

# ✅ .venv는 무시
.venv/
__pycache__/
```

`uv.lock`은 재현 가능한 빌드의 핵심이다. 반드시 커밋한다.

### 11-5. CI에서 `--locked` 누락

```yaml
# ❌ lockfile 갱신을 무시하고 통과 — 의도치 않은 버전 변경
- run: uv sync

# ✅ lockfile이 stale이면 실패
- run: uv sync --locked
```

### 11-6. 글로벌 도구를 프로젝트 의존성으로 추가

```bash
# ❌ 모든 프로젝트에서 쓰는 도구를 프로젝트 의존성에 넣음
uv add --dev black isort

# ✅ 글로벌 도구는 uv tool로 설치 (pipx 대체)
uv tool install black
uv tool install ruff
uvx black .              # 일회성 실행 (uv tool run의 단축형)
```

### 11-7. `uv pip install`을 새 프로젝트 기본으로 사용

`uv pip`은 **마이그레이션 호환 레이어**다. 새 프로젝트는 `uv add` / `uv sync`로 lockfile 워크플로우를 사용한다.

```bash
# ❌ 새 프로젝트에서 pip 스타일 유지
uv pip install fastapi   # pyproject.toml에 기록 안 됨

# ✅ 새 프로젝트 워크플로우
uv add fastapi           # pyproject.toml + uv.lock 모두 갱신
```

---

## 12. 자주 쓰는 명령 요약

| 명령 | 용도 |
|------|------|
| `uv init` | 프로젝트 초기화 |
| `uv add <pkg>` | 의존성 추가 |
| `uv add --dev <pkg>` | dev 그룹에 추가 |
| `uv remove <pkg>` | 의존성 제거 |
| `uv sync` | `.venv`를 lockfile에 맞춰 동기화 |
| `uv sync --locked` | lockfile 검증 (CI용) |
| `uv lock` | lockfile 재생성 |
| `uv lock --upgrade` | 모든 패키지 최신화 |
| `uv run <cmd>` | `.venv` 컨텍스트에서 실행 |
| `uvx <tool>` | `uv tool run`의 단축형 (일회성 도구 실행) |
| `uv tool install <tool>` | 글로벌 도구 설치 (pipx 대체) |
| `uv python install <ver>` | Python 인터프리터 설치 |
| `uv python pin <ver>` | `.python-version` 작성 |
| `uv build` | sdist/wheel 빌드 |
| `uv publish` | PyPI 게시 |
| `uv cache clean` | 캐시 비우기 |
| `uv cache prune --ci` | CI용 캐시 정리 |

---

## 짝 스킬

- `backend/python-basics` — Python 언어 기본기 (선언, 타입 힌트, 모듈)
- `backend/python-fastapi` — FastAPI 웹 프레임워크
- `backend/python-pytest` — pytest 기반 테스트

`uv`는 이들 스킬의 *프로젝트 셋업·실행 인프라*를 담당한다. 코드 작성·테스트 작성은 각 짝 스킬을 참조한다.
