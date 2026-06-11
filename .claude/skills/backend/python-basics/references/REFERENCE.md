## 8. 표준 라이브러리 핵심

### 8-1. `pathlib` (os.path 대신)

```python
from pathlib import Path

base = Path.home() / "dreams"
base.mkdir(parents=True, exist_ok=True)

target = base / "2026-05-15.md"
target.write_text("어젯밤 꿈 내용...", encoding="utf-8")
content = target.read_text(encoding="utf-8")

for md in base.rglob("*.md"):       # 재귀 탐색
    print(md.stem, md.stat().st_size)

target.parent      # → 부모 Path
target.suffix      # → '.md'
target.exists()    # → True
```

| 작업 | pathlib | os/os.path |
|------|---------|-----------|
| 경로 결합 | `p / "a" / "b"` | `os.path.join(p, "a", "b")` |
| 부모 디렉터리 | `p.parent` | `os.path.dirname(p)` |
| 파일명 | `p.name` | `os.path.basename(p)` |
| 존재 확인 | `p.exists()` | `os.path.exists(p)` |
| 읽기 | `p.read_text()` | `open(p).read()` |

### 8-2. `enum`

```python
from enum import Enum, auto, StrEnum   # StrEnum: 3.11+

class Color(Enum):
    RED = auto()
    GREEN = auto()

class Role(StrEnum):                   # 값이 곧 문자열
    ADMIN = "admin"
    USER = "user"

print(Role.ADMIN == "admin")           # True (StrEnum)
```

### 8-3. `functools`

```python
from functools import cache, lru_cache, partial, cached_property

# cache = lru_cache(maxsize=None). 더 가볍고 빠르다.
@cache
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)

# lru_cache — 크기 제한이 필요할 때
@lru_cache(maxsize=128)
def lookup(key: str) -> dict: ...

# partial — 인자 일부 고정
add = lambda x, y: x + y
inc = partial(add, 1)     # inc(5) == 6

# cached_property — 인스턴스별 1회 계산
class Report:
    @cached_property
    def heavy(self) -> int:
        return sum(range(10_000_000))
```

> 주의: `lru_cache`/`cache`를 인스턴스 메서드에 직접 붙이면 `self` 때문에 인스턴스가 GC되지 못한다. 메서드 캐싱은 `cached_property`나 인스턴스 외부 캐시를 사용한다.
> 3.12+에서 `partial`은 클래스로 구현되어 서브클래싱·introspection이 가능하다.

### 8-4. 컨텍스트 매니저

```python
# 클래스 기반
class Tx:
    def __enter__(self):
        self.conn = open_conn(); return self.conn
    def __exit__(self, exc_type, exc, tb):
        self.conn.close()
        return False                # True면 예외 삼킴

with Tx() as conn: ...

# contextlib.contextmanager — 함수 기반
from contextlib import contextmanager

@contextmanager
def timer(label: str):
    import time
    t0 = time.perf_counter()
    try:
        yield                       # __enter__ ↔ __exit__ 경계
    finally:
        print(f"{label}: {time.perf_counter() - t0:.3f}s")

with timer("query"):
    run_query()
```

---

## 9. 흔한 함정 — 반드시 피한다

### 9-1. mutable default argument

```python
# 함정 — 호출마다 같은 list가 공유됨
def add(item, bucket=[]):
    bucket.append(item)
    return bucket

# 올바른 패턴
def add(item, bucket: list | None = None) -> list:
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket
```

> 이유: 기본값은 함수 정의 시점에 1회만 평가된다.

### 9-2. closure late binding

```python
# 함정 — 모두 4 출력
funcs = [lambda: i for i in range(5)]
print([f() for f in funcs])           # [4, 4, 4, 4, 4]

# 해결 — 기본 인자로 바인딩
funcs = [lambda i=i: i for i in range(5)]
print([f() for f in funcs])           # [0, 1, 2, 3, 4]
```

> 이유: 클로저는 변수 자체를 참조하므로 호출 시점의 값을 본다.

### 9-3. `is` vs `==`

```python
a = [1, 2]; b = [1, 2]
a == b      # True  — 값 비교
a is b      # False — 동일 객체 여부

# is는 None/True/False/싱글톤에만
if value is None: ...
```

> 작은 정수·짧은 문자열은 internning 때문에 `is`가 우연히 True가 될 수 있다. 의도하지 말 것.

### 9-4. shallow copy vs deep copy

```python
import copy

original = [[1, 2], [3, 4]]
shallow = copy.copy(original)         # 또는 list(original)
deep    = copy.deepcopy(original)

shallow[0].append(99)
# original[0]도 [1, 2, 99] → 내부 list가 공유됨

# deep은 재귀적으로 복사하므로 영향 없음
```

---

## 10. 꿈 일기 예시 — dataclass + pathlib

```python
from __future__ import annotations
from dataclasses import dataclass, field, asdict
from datetime import date
from pathlib import Path
import json

@dataclass(slots=True)
class DreamEntry:
    dreamed_on: date
    title: str
    body: str
    tags: list[str] = field(default_factory=list)

    def filename(self) -> str:
        return f"{self.dreamed_on.isoformat()}-{self.title.replace(' ', '_')}.json"


class DreamJournal:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)

    def save(self, entry: DreamEntry) -> Path:
        target = self.root / entry.filename()
        payload = asdict(entry) | {"dreamed_on": entry.dreamed_on.isoformat()}
        target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        return target

    def load_all(self) -> list[DreamEntry]:
        entries = []
        for fp in sorted(self.root.glob("*.json")):
            data = json.loads(fp.read_text(encoding="utf-8"))
            data["dreamed_on"] = date.fromisoformat(data["dreamed_on"])
            entries.append(DreamEntry(**data))
        return entries


# 사용
journal = DreamJournal(Path.home() / "dreams")
entry = DreamEntry(
    dreamed_on=date.today(),
    title="lucid flight",
    body="구름 위를 날았다",
    tags=["lucid", "flying"],
)
saved_to = journal.save(entry)
print(f"saved → {saved_to}")
```

> 위 예시는 학습용 골격이다. 실무에서 JSON 직렬화 검증·필드 제약이 필요하면 `backend/python-pydantic-v2` 스킬로 교체한다.

---

## 11. 학습 자료

| 종류 | 자료 | 우선순위 |
|------|------|----------|
| 공식 튜토리얼 | https://docs.python.org/3/tutorial/ | 1순위 — 전체 입문 |
| 공식 표준 라이브러리 | https://docs.python.org/3/library/ | 1순위 — API 레퍼런스 |
| What's New | https://docs.python.org/3/whatsnew/ | 버전별 변경점 추적 |
| 서적 | *Fluent Python* 2nd Edition (Luciano Ramalho, O'Reilly, 2022) | 중급 도약용 |
| 사이트 | Real Python (https://realpython.com/) | 주제별 심화 |

> Fluent Python 2판은 Python 3.10 기준으로 작성되었다. 3.12 PEP 695 신문법은 공식 문서로 보완한다.

---

## 12. 짝 스킬 안내

| 짝 스킬 | 언제 |
|---------|------|
| `backend/python-uv-project-setup` | `pyproject.toml`·가상환경·의존성 관리(uv) |
| `backend/python-pydantic-v2` | API/설정에서 런타임 검증·직렬화가 필요할 때 (Pydantic v2 모델) |

---

## 13. 빠른 참고 — 체크리스트

- [ ] 타입 힌트는 항상 작성한다 (`int | None` · `Self` · `Protocol`)
- [ ] 3.12+ 프로젝트면 PEP 695 새 문법 우선 사용
- [ ] 값 객체는 `@dataclass(frozen=True, slots=True)`
- [ ] 파일·경로는 `pathlib.Path` (`os.path` 지양)
- [ ] 기본값에 mutable 객체 직접 쓰지 않기 → `field(default_factory=...)` 또는 `None` 가드
- [ ] 클로저에서 루프 변수 캡처 시 기본 인자 트릭 사용
- [ ] `is`는 `None`·`True`·`False`·싱글톤에만
- [ ] 중첩 mutable 복사는 `copy.deepcopy`
- [ ] 예외는 도메인 예외 정의 후 `raise ... from e`로 체이닝
- [ ] 메서드에 `@lru_cache`/`@cache` 직접 부착 금지
