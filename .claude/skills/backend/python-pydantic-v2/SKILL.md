---
name: python-pydantic-v2
description: >
  Pydantic v2 데이터 검증·직렬화 라이브러리 사용법.
  Rust 기반 pydantic-core, BaseModel·Field·field_validator·model_validator,
  TypeAdapter, pydantic-settings 분리, v1→v2 마이그레이션 가이드.
  FastAPI와의 표준 통합 패턴 포함.
---

# Pydantic v2

> 소스: https://docs.pydantic.dev/latest/ (공식 문서)
> 소스: https://github.com/pydantic/pydantic
> 소스: https://github.com/pydantic/bump-pydantic
> 소스: https://pypi.org/project/pydantic/
> 검증일: 2026-05-15
> 대상 버전: Pydantic 2.13.4 (2026-05-06 릴리즈), pydantic-settings 2.14.1
> 짝 스킬: `backend/python-fastapi`, `backend/python-basics` (해당 스킬이 추후 생성될 경우 함께 참조)

---

## 1. v2 핵심 차이 (v1 대비)

Pydantic v2는 검증 코어를 **Rust 기반 `pydantic-core`**로 재작성하여 v1 대비 **5~50배** 빠른 검증·직렬화 성능을 제공한다. 동시에 다수의 API가 재명명·재설계되었다.

| 항목 | v1 | v2 |
|------|----|----|
| 직렬화 (dict) | `model.dict()` | `model.model_dump()` |
| 직렬화 (JSON 문자열) | `model.json()` | `model.model_dump_json()` |
| 스키마 생성 | `Model.schema()` / `schema_json()` | `Model.model_json_schema()` |
| 필드 검증자 | `@validator('x')` | `@field_validator('x')` |
| 모델 검증자 | `@root_validator` | `@model_validator(mode=...)` |
| 설정 | 내부 `class Config:` | `model_config = ConfigDict(...)` |
| ORM 매핑 | `Config.orm_mode = True` | `model_config = ConfigDict(from_attributes=True)` |
| ORM 변환 | `Model.from_orm(obj)` | `Model.model_validate(obj)` (with `from_attributes=True`) |
| 인스턴스 검증 | `parse_obj`, `parse_raw` | `model_validate`, `model_validate_json` |
| 비-모델 검증 | `parse_obj_as(T, data)` | `TypeAdapter(T).validate_python(data)` |
| Settings | `pydantic.BaseSettings` | `pydantic_settings.BaseSettings` (별도 패키지) |
| Field 정규식 | `Field(regex=...)` | `Field(pattern=...)` |
| List 길이 | `Field(min_items=, max_items=)` | `Field(min_length=, max_length=)` |
| 인자 검증 데코 | `@validate_arguments` | `@validate_call` |
| `each_item=True` | 지원 | 제거됨 — `Annotated`로 대체 |

> 주의: v1 API(`dict()`, `json()`, `@validator` 등)은 v2에서 **deprecated**이며 v3 이전에는 동작하나 `DeprecationWarning`이 발생한다. 신규 코드는 v2 API만 사용한다.

---

## 2. BaseModel — 필드 정의

```python
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    age: int | None = None  # 옵셔널, 기본값 None
    is_active: bool = True

# 검증
user = User(id=1, name="Alice", age="30")  # age는 문자열 → int로 강제 변환
# user.age == 30
```

핵심 규칙:
- 타입 힌트가 곧 검증 스펙. 별도 선언 불필요.
- 필드 순서: **필수 필드 → 옵셔널 필드**. 옵셔널 다음에 필수 필드를 두면 오류.
- 기본값이 있는 필드는 자동으로 옵셔널 취급.

### 모델 인스턴스 생성 — 4가지 경로

| 메서드 | 입력 | 용도 |
|--------|------|------|
| `Model(**data)` | 키워드 인자 | 일반 생성 |
| `Model.model_validate(data)` | dict 또는 객체 | 외부 데이터 검증 (v1 `parse_obj` 대체) |
| `Model.model_validate_json(json_str)` | JSON 문자열 | JSON 직접 검증 (v1 `parse_raw` 대체) |
| `Model.model_construct(**data)` | 키워드 인자 | **검증 생략** — 신뢰된 내부 데이터에만 사용 |

---

## 3. Field — 필드 메타데이터·제약

```python
from pydantic import BaseModel, Field
from uuid import uuid4

class Product(BaseModel):
    id: str = Field(default_factory=lambda: uuid4().hex)
    name: str = Field(min_length=1, max_length=100)
    price: float = Field(gt=0, le=1_000_000)
    sku: str = Field(pattern=r"^[A-Z]{3}-\d{4}$")
    tags: list[str] = Field(default_factory=list, min_length=0, max_length=10)
    description: str | None = Field(default=None, description="상품 설명")
```

| 파라미터 | 용도 |
|----------|------|
| `default` | 기본값 (필드 위치 또는 첫 인자) |
| `default_factory` | 호출 시점에 기본값 생성 (mutable 기본값에 필수) |
| `gt`, `ge`, `lt`, `le` | 숫자 제약 (greater/less than, equal) |
| `min_length`, `max_length` | 문자열·리스트 길이 (v1의 `min_items`/`max_items` 대체) |
| `pattern` | 정규식 (v1의 `regex` 대체) |
| `alias` | 입력 시 사용할 다른 이름 |
| `description` | JSON 스키마에 포함되는 설명 |
| `examples` | JSON 스키마 예시 값 |
| `frozen` | 인스턴스 생성 후 변경 금지 |
| `exclude` | `model_dump()`에서 기본 제외 |

> 주의: `default`와 `default_factory`는 **상호 배타적**이다. 둘 다 지정하면 오류.

> 주의: mutable 기본값(`list`, `dict`, `set`)은 반드시 `default_factory=list` 형태로. `Field(default=[])`는 인스턴스 간 리스트 공유로 이어진다.

---

## 4. Annotated 타입 — 권장 패턴

`typing.Annotated`를 사용하면 타입과 제약이 한 자리에 묶여 가독성이 좋다. v2에서 권장하는 스타일.

```python
from typing import Annotated
from pydantic import BaseModel, Field

PositiveInt = Annotated[int, Field(gt=0)]
ShortStr = Annotated[str, Field(min_length=1, max_length=50)]

class Order(BaseModel):
    quantity: PositiveInt
    note: ShortStr
    items: Annotated[list[str], Field(min_length=1)]  # 최소 1개 항목
```

> 주의: `default_factory`와 `alias`는 정적 타입 체커가 인식하지 못하므로, 이 두 옵션은 `Annotated` 안이 아니라 **할당식**(`field: T = Field(default_factory=...)`)으로 둔다.

---

## 5. 검증자 — `@field_validator`

필드 단위 검증. **모든 모드에서 `@classmethod` 필수.**

```python
from pydantic import BaseModel, field_validator

class User(BaseModel):
    email: str
    age: int
    tags: list[str]

    @field_validator('email', mode='after')
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator('age', mode='after')
    @classmethod
    def check_age(cls, v: int) -> int:
        if v < 0 or v > 150:
            raise ValueError('age must be between 0 and 150')
        return v

    @field_validator('tags', mode='before')
    @classmethod
    def ensure_list(cls, v) -> list:
        if isinstance(v, str):
            return [v]
        return v
```

| `mode` | 시점 | 용도 |
|--------|------|------|
| `'after'` (기본) | Pydantic 내부 파싱 **후** | 타입이 이미 확정된 값 검증 |
| `'before'` | 내부 파싱 **전** | 원본 입력을 변환 (예: 문자열 → 리스트) |
| `'plain'` | 내부 파싱 대체 | 검증을 즉시 종료 |
| `'wrap'` | 내부 파싱을 핸들러로 감쌈 | 가장 유연, 예외 복구 가능 |

> 주의: 검증자는 **반드시 검증된 값을 반환**해야 한다. 반환을 빠뜨리면 필드값이 `None`이 된다.

---

## 6. 검증자 — `@model_validator`

여러 필드를 함께 검증하거나, 인스턴스화 전후로 데이터를 가공.

```python
from typing import Any, Self
from pydantic import BaseModel, model_validator

class SignupForm(BaseModel):
    password: str
    password_confirm: str

    @model_validator(mode='before')
    @classmethod
    def strip_spaces(cls, data: Any) -> Any:
        if isinstance(data, dict):
            for k, v in data.items():
                if isinstance(v, str):
                    data[k] = v.strip()
        return data

    @model_validator(mode='after')
    def check_passwords_match(self) -> Self:
        if self.password != self.password_confirm:
            raise ValueError('passwords do not match')
        return self
```

| `mode` | 시그니처 | `@classmethod` |
|--------|---------|:---:|
| `'before'` | `(cls, data: Any) -> Any` — dict 또는 raw 입력 처리 | 필수 |
| `'after'` | `(self) -> Self` — 인스턴스 메서드, 검증된 self 반환 | **불필요** |
| `'wrap'` | `(cls, data: Any, handler) -> Self` | 필수 |

> 주의: `mode='after'`는 **인스턴스 메서드**이므로 `self`를 받고 `@classmethod`를 붙이지 않는다. 흔한 실수.

---

## 7. 직렬화 — `model_dump` / `model_dump_json`

```python
user = User(id=1, name="Alice", email="a@b.com", age=30)

# Python dict 변환 (v1 dict() 대체)
user.model_dump()
# {'id': 1, 'name': 'Alice', 'email': 'a@b.com', 'age': 30, ...}

# JSON 문자열 변환 (v1 json() 대체)
user.model_dump_json()
# '{"id":1,"name":"Alice","email":"a@b.com","age":30}'  ← v2는 공백 없는 컴팩트 출력

# 선택적 옵션
user.model_dump(include={'id', 'name'})       # 특정 필드만
user.model_dump(exclude={'email'})            # 특정 필드 제외
user.model_dump(exclude_none=True)            # None 필드 제외
user.model_dump(exclude_unset=True)           # 명시되지 않은 필드 제외
user.model_dump(by_alias=True)                # alias 이름으로 출력
user.model_dump(mode='json')                  # JSON-호환 타입으로 직렬화 (datetime → str 등)
```

> 주의: `model_dump_json()`은 v2부터 공백 없는 압축 JSON을 반환한다. v1의 공백 포함 출력과 다르므로, 문자열 비교 테스트가 깨질 수 있다.

---

## 8. JSON 스키마 — `model_json_schema`

```python
schema = User.model_json_schema()
# {
#   "type": "object",
#   "properties": {...},
#   "required": [...],
#   ...
# }
```

v2는 기본적으로 **JSON Schema Draft 2020-12** + OpenAPI 확장을 생성한다. FastAPI는 이 스키마를 자동으로 Swagger UI에 노출한다.

---

## 9. Settings 관리 — `pydantic-settings` (별도 패키지)

v2부터 `BaseSettings`는 `pydantic` 본체에서 분리되어 **`pydantic-settings`** 패키지로 이동했다.

```bash
pip install pydantic-settings
```

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "MyApp"
    database_url: str
    debug: bool = False
    items_per_page: int = 50

    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        env_prefix='APP_',
        case_sensitive=False,
        extra='ignore',
    )

settings = Settings()
# .env 또는 환경 변수에서 자동 로드 (예: APP_DATABASE_URL)
```

| `SettingsConfigDict` 옵션 | 용도 |
|---------------------------|------|
| `env_file` | dotenv 파일 경로 |
| `env_prefix` | 환경 변수 접두사 (예: `APP_`) |
| `env_nested_delimiter` | 중첩 모델 구분자 (예: `'__'` → `DB__HOST`) |
| `case_sensitive` | 대소문자 구분 |
| `extra` | `'ignore'`/`'allow'`/`'forbid'` |

> 주의: v1 코드의 `from pydantic import BaseSettings`는 v2에서 **ImportError**다. 반드시 `from pydantic_settings import BaseSettings`로 변경한다.

---

## 10. `TypeAdapter` — BaseModel 없이 임의 타입 검증

dataclass, TypedDict, 원시 타입, 컬렉션 등 BaseModel이 아닌 타입에 검증·직렬화를 적용.

```python
from typing import TypedDict
from pydantic import TypeAdapter

class UserDict(TypedDict):
    name: str
    id: int

ta = TypeAdapter(list[UserDict])

# Python 객체 검증
users = ta.validate_python([{'name': 'Fred', 'id': '3'}])
# [{'name': 'Fred', 'id': 3}]  ← id가 문자열에서 int로 강제 변환

# JSON 문자열 검증
users = ta.validate_json('[{"name":"Fred","id":3}]')

# 직렬화·스키마
ta.dump_python(users)
ta.dump_json(users)
ta.json_schema()
```

용도:
- 함수 인자나 외부 API 응답을 **즉석에서 검증** (BaseModel 정의 비용 회피)
- 리스트·딕셔너리 같은 컬렉션 일괄 검증
- v1의 `parse_obj_as`, `schema_of` 대체

---

## 11. `model_config` — 모델 설정 (v1 `class Config` 대체)

```python
from pydantic import BaseModel, ConfigDict

class User(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,       # v1 orm_mode 대체 (ORM 객체 → 모델)
        populate_by_name=True,      # alias와 원본 이름 모두 허용 (v1 allow_population_by_field_name)
        extra='forbid',             # 추가 필드 금지 (기본 'ignore')
        frozen=False,               # 인스턴스 불변
        str_strip_whitespace=True,  # 모든 str 필드 자동 strip
        validate_assignment=True,   # 속성 재할당 시도 시에도 검증
        use_enum_values=True,       # Enum 직렬화 시 .value 사용
    )

    id: int
    name: str
```

> 주의: 내부 `class Config:` 정의는 deprecated. `model_config = ConfigDict(...)` 딕셔너리 형태로만 사용한다.

---

## 12. FastAPI와 통합 패턴

FastAPI는 Pydantic v2를 1차 시민으로 지원한다. 요청 본문·응답 모델 모두 BaseModel로 정의.

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()

class CreateUserRequest(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    email: str = Field(pattern=r"^[^@]+@[^@]+\.[^@]+$")
    age: int = Field(gt=0, lt=150)

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    model_config = ConfigDict(from_attributes=True)  # ORM 객체 직변환

@app.post("/users", response_model=UserResponse, status_code=201)
async def create_user(payload: CreateUserRequest) -> UserResponse:
    # payload는 이미 검증된 인스턴스 (실패 시 FastAPI가 422 자동 반환)
    user_orm = await user_service.create(payload)
    return user_orm  # response_model이 자동으로 UserResponse로 변환
```

핵심 패턴:
- **요청 모델·응답 모델 분리** — 클라이언트가 보내는 필드와 서버가 반환하는 필드가 다르다.
- `response_model`을 명시 → 응답 필드가 제한·검증되어 정보 누출 방지.
- ORM 객체 → 응답 모델 변환은 `from_attributes=True` 1줄로 끝남.
- 검증 실패는 FastAPI가 자동으로 **422 Unprocessable Entity** 반환.

---

## 13. v1 → v2 마이그레이션 — `bump-pydantic`

```bash
pip install bump-pydantic

# 변경사항 미리보기
bump-pydantic --diff path/to/project

# 실제 적용
bump-pydantic path/to/project
```

자동 변환 규칙(BP001~BP010):

| 규칙 | 변환 내용 |
|------|-----------|
| BP001 | `Optional[T]` / `Union[T, None]` / `Any` 필드에 `= None` 기본값 추가 |
| BP002 | `class Config:` → `model_config = ConfigDict(...)` |
| BP003 | `Field` 파라미터 명 갱신 (`regex` → `pattern`, `min_items` → `min_length` 등) |
| BP004 | import 경로 변경 (`BaseSettings` → `pydantic_settings`) |
| BP005 | `GenericModel` → `BaseModel` (v2는 BaseModel 자체가 제네릭 지원) |
| BP006 | `__root__` → `RootModel` |
| BP007 | `@validator` → `@field_validator` |
| BP008 | `conint`, `constr` 등 → `Annotated` 버전 |
| BP009 | 커스텀 타입 프로토콜 함수에 TODO 주석 |
| BP010 | 타입 주석 없는 필드 처리 |

> 주의: `bump-pydantic`은 **공통 패턴만 자동 변환**한다. `root_validator` → `model_validator` 같은 시그니처 변경, validator 본문의 `values` 인자 사용처 등은 **수동 검토** 필요.

---

## 14. 흔한 함정 (Pitfalls)

### 14.1 v1/v2 API 혼용

```python
# 금지 — v1 API
user.dict()
user.json()
User.parse_obj(data)
User.schema()

# 권장 — v2 API
user.model_dump()
user.model_dump_json()
User.model_validate(data)
User.model_json_schema()
```

### 14.2 `class Config:` 잔존

```python
# 금지
class User(BaseModel):
    name: str
    class Config:
        orm_mode = True

# 권장
class User(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
```

### 14.3 `@model_validator(mode='after')`에 `@classmethod`를 붙임

```python
# 금지 — after는 인스턴스 메서드
@model_validator(mode='after')
@classmethod  # ← 오류
def check(cls, v):
    ...

# 권장
@model_validator(mode='after')
def check(self) -> Self:
    ...
    return self
```

### 14.4 `@field_validator`에 `@classmethod` 누락

```python
# 금지 — field_validator는 모든 모드에서 @classmethod 필수
@field_validator('name')
def check(cls, v):  # ← TypeError
    ...

# 권장
@field_validator('name')
@classmethod
def check(cls, v: str) -> str:
    ...
    return v
```

### 14.5 검증자에서 반환을 빠뜨림

```python
# 금지 — 반환 누락 시 필드가 None
@field_validator('name')
@classmethod
def normalize(cls, v: str) -> str:
    v.strip().lower()  # ← 반환 안 함

# 권장
@field_validator('name')
@classmethod
def normalize(cls, v: str) -> str:
    return v.strip().lower()
```

### 14.6 `BaseSettings`를 `pydantic`에서 import

```python
# 금지 — v2에서 ImportError
from pydantic import BaseSettings

# 권장
from pydantic_settings import BaseSettings, SettingsConfigDict
```

### 14.7 Mutable 기본값을 `default=`로 지정

```python
# 금지 — 인스턴스 간 리스트 공유 위험
tags: list[str] = Field(default=[])

# 권장
tags: list[str] = Field(default_factory=list)
```

### 14.8 `Field(regex=...)` 잔존

```python
# 금지 — v2에서 제거
sku: str = Field(regex=r"^[A-Z]{3}-\d{4}$")

# 권장
sku: str = Field(pattern=r"^[A-Z]{3}-\d{4}$")
```

---

## 15. 언제 사용 / 사용하지 않을지

**사용:**
- FastAPI 요청·응답 모델
- 외부 API 응답 검증
- 환경 변수·설정 로딩 (`pydantic-settings`)
- 데이터 파이프라인의 입력 스키마 검증
- 임의 타입 검증 (TypeAdapter)

**사용하지 않을 것:**
- 핫 패스에서 같은 객체를 수천 번 변환하는 경우 → 검증 비용 발생. 한 번만 검증하고 신뢰 영역에서는 raw dict나 dataclass 사용.
- 단순 내부 데이터 전달용 컨테이너 → `dataclass` 또는 `NamedTuple`로 충분.
- 100% 신뢰된 내부 데이터로 인스턴스 생성 시 → `model_construct()`로 검증 우회 가능.

---

## 16. 참조 문서

- 공식 문서: https://docs.pydantic.dev/latest/
- 마이그레이션 가이드: https://docs.pydantic.dev/latest/migration/
- pydantic-settings: https://docs.pydantic.dev/latest/concepts/pydantic_settings/
- TypeAdapter: https://docs.pydantic.dev/latest/concepts/type_adapter/
- bump-pydantic: https://github.com/pydantic/bump-pydantic
- 짝 스킬: `backend/python-fastapi` (FastAPI 통합), `backend/python-basics` (Python 기본 패턴)
