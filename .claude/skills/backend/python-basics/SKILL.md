---
name: python-basics
description: >
  Python 3.12+ 핵심 문법·자료구조·표준 라이브러리 학습 및 실무 진입용 스킬.
  타입 힌트, dataclass, pathlib, functools, contextlib, 그리고 흔한 함정까지 다룬다.
  <example>사용자: "Python 3.12에서 제네릭 클래스 어떻게 정의해?"</example>
  <example>사용자: "dataclass에 frozen이랑 slots 같이 쓰면 뭐가 좋아?"</example>
  <example>사용자: "Python 함수 인자에서 / 랑 * 가 뭐야?"</example>
---

# Python 3.12+ 기초

> 소스: https://docs.python.org/3/whatsnew/3.12.html · https://docs.python.org/3/library/typing.html · https://docs.python.org/3/library/dataclasses.html · https://docs.python.org/3/library/pathlib.html · https://docs.python.org/3/library/functools.html · https://docs.python.org/3/library/contextlib.html · https://peps.python.org/pep-0695/ · https://peps.python.org/pep-0570/
> 검증일: 2026-05-15
> 짝 스킬: `backend/python-uv-project-setup` (프로젝트/의존성 관리) · `backend/python-pydantic-v2` (런타임 검증 + 직렬화)

---

## 0. 적용 범위

- 학습용·실무 진입용 핵심만 정리. Python 3.12 정식 기준이며 3.13의 새 기능은 별도 표기.
- 런타임 데이터 검증·직렬화가 필요하면 → `backend/python-pydantic-v2`
- `pyproject.toml`·가상환경·의존성 관리는 → `backend/python-uv-project-setup`

---

## 1. Python 3.12 신기능 핵심

### 1-1. PEP 695 — 타입 매개변수 새 문법 (3.12+)

`TypeVar`/`Generic` import 없이 대괄호로 직접 선언한다.

```python
# 3.12+ (권장)
def first[T](items: list[T]) -> T:
    return items[0]

class Stack[T]:
    def __init__(self) -> None:
        self._items: list[T] = []
    def push(self, item: T) -> None:
        self._items.append(item)
    def pop(self) -> T:
        return self._items.pop()

# 타입 별칭 — type 문 (3.12+)
type Vector = list[float]
type Matrix[T] = list[list[T]]
type HashableSeq[T: Hashable] = Sequence[T]   # 경계(bound)
```

```python
# 3.11 이하 (구문법, 호환 가능)
from typing import TypeVar, Generic
T = TypeVar("T")

class Stack(Generic[T]):
    ...
```

> 주의: PEP 695로 선언된 타입 매개변수는 클래스/함수에 자동 스코프되며, 변성(variance)은 사용 패턴에서 자동 추론된다.

### 1-2. PEP 701 — f-string 제약 해제

```python
songs = ["Eden", "Alkaline"]

# 3.12부터 모두 가능
f"playlist: {", ".join(songs)}"            # 같은 따옴표 재사용
f"items: {"\n".join(songs)}"               # 백슬래시 허용
f"""multi: {
    ", ".join([s.upper() for s in songs])  # 멀티라인 + 주석 가능
}"""
```

### 1-3. `typing.override` 데코레이터 (PEP 698)

```python
from typing import override

class Base:
    def greet(self) -> str: return "hi"

class Child(Base):
    @override                       # 잘못된 메서드명이면 타입 체커가 경고
    def greet(self) -> str: return "hello"
```

### 1-4. match 문 (3.10 도입 · 3.12에서도 사용)

```python
def handle(point) -> str:
    match point:
        case (0, 0):
            return "origin"
        case (0, y):
            return f"y={y}"
        case (x, 0):
            return f"x={x}"
        case (x, y) if x == y:                # 가드 절
            return "diagonal"
        case {"kind": "circle", "r": r}:      # dict 패턴
            return f"circle r={r}"
        case _:
            return "other"
```

---

## 2. 타입 힌트 (typing)

### 2-1. 자주 쓰는 타입

```python
from typing import Self, Protocol, Literal, Final, TypedDict
from collections.abc import Iterable, Mapping, Callable, Sequence

# 3.10+ Union은 | 사용 (typing.Union 대신)
def parse(value: int | str | None) -> str:
    return "" if value is None else str(value)

# Literal — 특정 값만 허용
def set_mode(mode: Literal["read", "write", "append"]) -> None: ...

# Self — 3.11+, 같은 클래스 반환
class Builder:
    def add(self, x: int) -> Self:
        self._items.append(x)
        return self

# Final — 재할당 금지 (정적 검사 수준)
MAX_RETRY: Final = 3
```

### 2-2. Protocol — 구조적 부분타이핑 (덕 타이핑의 정적 버전)

```python
from typing import Protocol

class SupportsLen(Protocol):
    def __len__(self) -> int: ...

def first_or_default[T](container: SupportsLen, default: T) -> T:
    return default if len(container) == 0 else default
```

> Protocol은 명시적 상속 없이 "같은 메서드를 가졌다"는 사실만으로 타입이 일치한다.

### 2-3. Generic — 3.12 새 문법 vs 구 문법

```python
# 3.12+
class Repo[T]:
    def get(self, id: int) -> T | None: ...

# 3.11 이하
from typing import Generic, TypeVar
T = TypeVar("T")
class Repo(Generic[T]):
    def get(self, id: int) -> T | None: ...
```

---

## 3. 자료구조

### 3-1. 컴프리헨션

```python
# list
squares = [x * x for x in range(10) if x % 2 == 0]

# dict — 키 중복 시 마지막 값 유지
inverted = {v: k for k, v in mapping.items()}

# set — 중복 제거 + 유일성
unique_lengths = {len(name) for name in names}

# generator — lazy, 메모리 효율적
total = sum(x * x for x in range(1_000_000))    # 괄호로 둘러싸면 generator
```

### 3-2. tuple vs list

```python
# tuple — 불변, 작고 빠르며 hashable (dict key 가능)
point: tuple[float, float] = (1.0, 2.0)

# NamedTuple — 필드명 + 불변
from typing import NamedTuple
class Point(NamedTuple):
    x: float
    y: float
```

> 주의: 단일 요소 tuple은 `(1,)`로 콤마 필수. `(1)`은 그냥 정수다.

### 3-3. dict — 3.7+부터 삽입 순서 보존

```python
# 안전한 키 접근
value = mapping.get("key", default_value)        # KeyError 회피
value = mapping.setdefault("key", [])             # 없으면 기본값 삽입 후 반환

# 합치기 (3.9+)
merged = dict_a | dict_b                          # 우측 우선
dict_a |= dict_b                                  # in-place
```

---

## 4. 함수

### 4-1. 매개변수 종류 (PEP 570)

```python
def fn(pos_only, /, normal, *, kw_only):
    """
    pos_only — 위치로만 전달 (이름으로 못 부름)
    normal   — 위치 OR 이름 모두 가능
    kw_only  — 이름으로만 전달
    """

fn(1, 2, kw_only=3)        # OK
fn(1, normal=2, kw_only=3) # OK
fn(pos_only=1, ...)        # 에러
```

### 4-2. `*args` / `**kwargs`

```python
def wrap(*args: int, **kwargs: str) -> None:
    print(args)      # tuple
    print(kwargs)    # dict

wrap(1, 2, name="kim", role="admin")
```

### 4-3. 기본값 함정 → 5장 참조

---

## 5. 클래스 — `@dataclass`

### 5-1. 기본

```python
from dataclasses import dataclass, field

@dataclass
class User:
    name: str
    age: int = 0
    tags: list[str] = field(default_factory=list)   # mutable은 default_factory
```

자동 생성: `__init__`, `__repr__`, `__eq__`.

### 5-2. `frozen=True` + `slots=True`

```python
@dataclass(frozen=True, slots=True)
class Point:
    x: float
    y: float

p = Point(1.0, 2.0)
# p.x = 3.0  → dataclasses.FrozenInstanceError
hash(p)      # frozen이면 hashable, set/dict 키로 사용 가능
```

| 옵션 | 효과 |
|------|------|
| `frozen=True` | 필드 재할당 금지 → 불변·hashable |
| `slots=True` | `__slots__` 자동 생성 → 메모리 절약 + 속성 접근 빠름 (3.10+) |
| `kw_only=True` | 모든 필드 키워드 전용 |
| `eq=False` | `__eq__` 생성 안 함 |
| `order=True` | `<`, `<=`, `>`, `>=` 생성 |

### 5-3. `__post_init__` — 파생 필드 계산

```python
@dataclass
class Rectangle:
    width: float
    height: float
    area: float = field(init=False)

    def __post_init__(self) -> None:
        self.area = self.width * self.height
```

> frozen=True에서 `__post_init__`로 필드를 채우려면 `object.__setattr__(self, "area", ...)`를 써야 한다.

### 5-4. `InitVar` — `__init__`에만 쓰고 저장 안 함

```python
from dataclasses import InitVar

@dataclass
class User:
    name: str
    raw_password: InitVar[str]
    password_hash: str = field(init=False)

    def __post_init__(self, raw_password: str) -> None:
        self.password_hash = hash_it(raw_password)
```

### 5-5. 일반 클래스에서 `__slots__`

```python
class Vector:
    __slots__ = ("x", "y")
    def __init__(self, x: float, y: float) -> None:
        self.x = x; self.y = y
# vector.z = 0   → AttributeError
```

---

## 6. 모듈·패키지

```
mypkg/
  __init__.py
  models.py
  services/
    __init__.py
    auth.py
```

```python
# 절대 import — 권장
from mypkg.services.auth import login
from mypkg.models import User

# 상대 import — 같은 패키지 내부에서만
from .auth import login            # services/__init__.py 또는 형제 모듈
from ..models import User          # 상위 패키지

# __init__.py에서 공개 API 정의
__all__ = ["User", "login"]
```

> 주의: 스크립트 직접 실행(`python file.py`)에서는 상대 import가 동작하지 않는다. 모듈 실행은 `python -m mypkg.services.auth`.

---

## 7. 예외 처리

### 7-1. 기본 패턴

```python
try:
    data = path.read_text()
except FileNotFoundError as e:
    log.warning("missing: %s", e.filename)
    return None
except OSError:
    raise                          # 그대로 전파
else:
    log.info("loaded")             # try 본문 성공 시
finally:
    cleanup()                      # 성공·실패 모두 실행
```

### 7-2. 예외 체이닝 (`raise ... from ...`)

```python
try:
    parse(payload)
except ValueError as e:
    raise DomainError("invalid payload") from e   # __cause__ 보존

# 원인을 숨기고 싶을 때
raise DomainError(...) from None
```

### 7-3. 사용자 정의 예외

```python
class AppError(Exception): ...
class NotFoundError(AppError): ...
class ValidationError(AppError): ...
```

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
