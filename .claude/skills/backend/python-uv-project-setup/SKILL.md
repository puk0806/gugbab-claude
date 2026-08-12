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

> 소스: https://docs.astral.sh/uv/ , https://github.com/astral-sh/uv/releases ,
> https://docs.astral.sh/uv/concepts/projects/init/ , https://docs.astral.sh/uv/guides/integration/github/ ,
> https://docs.astral.sh/uv/guides/integration/docker/ , https://github.com/astral-sh/setup-uv/releases
> 검증일: 2026-08-12
> 검증 버전: uv 0.12.3 (2026-08-07 릴리즈) / astral-sh/setup-uv v9.0.0 / 베이스 이미지 `python:3.12-slim-trixie`

---

## 1. uv 소개

**uv**는 Astral이 Rust로 작성한 Python 패키지·프로젝트 매니저로, pip 대비 **10–100배 빠르다** (공식 벤치마크 기준).

| 항목 | 내용 |
|------|------|
| 제작사 | Astral (ruff·ty 제작사) |
| 언어 | Rust (코드베이스 98.1% Rust) |
| 최신 버전 | 0.12.3 (2026-08-07) |
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

> **⚠️ 0.12.0 breaking change (2026-07-28):** `uv init`은 이제 **패키지형(packaged) 프로젝트를 기본 생성**한다.
> `[build-system]`에 `uv_build` 백엔드를 선언하고, 소스를 `src/<project_name>/`에 배치하며,
> `[project.scripts]` 진입점을 추가한다. 0.11 이하의 비패키지형 레이아웃(`main.py` 평면 구조)을 원하면
> **`--no-package`를 명시**해야 한다.

**생성되는 파일 (0.12.0+ 기본 = `--app` + 패키지형):**
- `pyproject.toml` — 프로젝트 메타데이터·의존성 + `[build-system]`(`uv_build`) + `[project.scripts]`
- `.python-version` — 기본 Python 버전 핀
- `README.md`
- `src/my_project/__init__.py` — 소스 모듈 (구 `main.py` 자리)

**생성되는 파일 (`uv init --no-package` = 0.11 이하의 기본 동작):**
- `pyproject.toml` — `[build-system]` **없음**
- `.python-version`
- `README.md`
- `main.py` — 평면 진입점 샘플

### 기존 디렉토리에서 초기화

```bash
cd existing-project
uv init                  # 현재 디렉토리에 패키지형 프로젝트 생성 (0.12.0+ 기본)
uv init --app            # 애플리케이션 구조 (기본값) — [project.scripts] 진입점 포함
uv init --lib            # 라이브러리 구조 — src/ 레이아웃 + py.typed, 진입점 없음
uv init --no-package     # 빌드 시스템 없이 main.py 평면 구조 (구 기본 동작)
uv init --bare           # pyproject.toml만 생성 — .python-version·README·VCS 초기화 모두 생략
uv init --build-backend hatchling   # 대체 빌드 백엔드 (--package를 함축)
```

> `--lib`는 0.12 이전에도 `src/` 레이아웃이었다. 0.12에서 바뀐 것은 **`--app`(기본값)이 패키지형이 된 것**이다.

### 0.11 → 0.12 마이그레이션 노트

| 항목 | 0.11 이하 | 0.12.0+ | 대응 |
|------|-----------|---------|------|
| `uv init` 기본 레이아웃 | 비패키지형, `main.py` | 패키지형, `src/<name>/` + `uv_build` | 구 동작 필요 시 `--no-package` |
| 기존 프로젝트 | 영향 없음 | 영향 없음 | 이미 생성된 `pyproject.toml`은 자동 변경되지 않음 |
| CI 스크립트 | `python main.py` 가정 | `main.py` 미생성 가능 | `uv run <script-name>` 또는 `--no-package`로 고정 |
| 소스 배포 형식 | `.tar.bz2`/`.tar.xz` 허용 | **`.tar.gz`만 허용** | 사설 인덱스의 sdist 형식 확인 |
| pre-release 해석 | `if-necessary-or-explicit` | `if-necessary` (안정판 우선) | 프리릴리즈 필요 시 명시적 허용 설정 |
| `--require-hashes` | 요구사항 파일 지시자 미강제 | **강제**, MD5-only 해시 거부 | 해시 갱신 필요 |

> **주의:** 위 breaking change는 *새 프로젝트 생성·해석 동작*에 대한 것이다. `uv add`·`uv sync`·`uv run`·`uv lock`·
> `uv python install`의 기본 동작은 0.12에서도 그대로 유지된다.

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
        uses: astral-sh/setup-uv@c771a70e6277c0a99b617c7a806ffedaca235ff9 # v9.0.0
        with:
          version: "0.12.3"           # uv 버전 핀 권장
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

> **⚠️ setup-uv 태그 정책 (v8.0.0부터):** 공급망 공격 방지를 위해 **이동 태그(moving tag) 발행이 중단**됐다.
> `@v8`·`@v8.0` 같은 축약 메이저·마이너 태그는 더 이상 resolve되지 않으므로 **풀버전 태그(`@v9.0.0`)
> 또는 커밋 해시**를 써야 한다. 공식 uv 문서 예시는 위처럼 **커밋 해시 + `# v9.0.0` 주석** 방식을 권장한다.
> 과거 예시에서 흔히 보이는 `astral-sh/setup-uv@v3`는 다수 메이저 뒤처진 구식 표기다.

### Docker (multi-stage)

```dockerfile
# syntax=docker/dockerfile:1.7
FROM ghcr.io/astral-sh/uv:0.12.3 AS uv

FROM python:3.12-slim-trixie AS builder
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

FROM python:3.12-slim-trixie
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

#### 이미지 태그 선택

| 태그 계열 | 예시 | 용도 |
|-----------|------|------|
| distroless (uv 바이너리만) | `ghcr.io/astral-sh/uv:0.12.3` | 위 예시처럼 `COPY --from`으로 uv만 꺼내 쓸 때 |
| Python 동봉 | `ghcr.io/astral-sh/uv:python3.12-trixie-slim`, `ghcr.io/astral-sh/uv:python3.12-alpine` | uv + Python이 함께 필요한 단일 스테이지 빌드 |
| 베이스 이미지 | `python:3.12-slim-trixie` | uv를 `COPY --from`으로 주입할 때의 런타임 베이스 |

> **태그 핀 고정 (공식 권장):** `:latest` 대신 `:{major}.{minor}.{patch}`(예: `0.12.3`)로 핀한다.
> 재현 가능한 빌드가 필요하면 태그는 다른 커밋 SHA로 **이동될 수 있으므로** SHA256 다이제스트까지 핀하는 것이
> 공식 문서의 최상위 권장이다:
> ```dockerfile
> COPY --from=ghcr.io/astral-sh/uv@sha256:<digest> /uv /uvx /bin/
> ```
>
> **⚠️ Debian 코드네임 드리프트:** 공식 예시 베이스가 `bookworm` 계열에서 **`trixie` 계열로 이동**했다.
> `python:3.12-slim`(코드네임 미지정)은 상위 이미지 갱신 시 배포판이 바뀔 수 있으므로,
> 위처럼 코드네임을 명시한 태그(`slim-trixie`)를 쓰는 편이 안전하다.

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

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
