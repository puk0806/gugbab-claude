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
