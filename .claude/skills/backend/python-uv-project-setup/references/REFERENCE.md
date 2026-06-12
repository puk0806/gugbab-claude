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
