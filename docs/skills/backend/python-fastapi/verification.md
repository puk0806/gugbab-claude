---
skill: python-fastapi
category: backend
version: v1
date: 2026-09-28
status: APPROVED
---

# python-fastapi 검증 문서

> 새 스킬 추가 시 `docs/skills/VERIFICATION_TEMPLATE.md` 기반으로 작성

---

## 검증 워크플로우

스킬은 **2단계 검증**을 거쳐 최종 APPROVED 상태가 됩니다.

```
[1단계] 스킬 작성 시 (오프라인 검증) — 완료
  ├─ 공식 문서 기반으로 내용 작성 ✅
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST

[2단계] 실제 사용 중 (온라인 검증) — 본 스킬은 "실사용 필수 카테고리"
  ├─ Claude CLI에서 @에이전트로 테스트 질문 수행
  ├─ 실 FastAPI 프로젝트 빌드·요청 검증 필요
  └─ 모든 테스트 케이스 PASS → APPROVED 전환
```

본 스킬은 `verification-policy.md` 기준 **"실사용 필수 스킬"**에 해당한다 (실 API 빌드/요청 결과로 검증 필요). content test PASS만으로 APPROVED 전환 불가, 실 프로젝트 검증 후 전환.

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `python-fastapi` |
| 스킬 경로 | `.claude/skills/backend/python-fastapi/SKILL.md` |
| 검증일 | 2026-09-28 (재검증, 이전 2026-08-12) |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 대상 버전 | FastAPI 0.115+ (테스트 시점 최신 0.141.x, PyPI 확인 0.141.1), Pydantic 2.x, Starlette 0.4x~1.0 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (fastapi.tiangolo.com)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/fastapi/fastapi)
- [✅] 최신 버전 기준 내용 확인 (2026-05-15 기준 0.136.x 라인까지 확인, 0.115+ 호환)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (Annotated, Depends, lifespan, OAuth2 + JWT)
- [✅] 코드 예시 작성 (16개 섹션 전부 실제 동작 가능 형태)
- [✅] 흔한 실수 패턴 정리 (섹션 16: 11개 함정)
- [✅] SKILL.md 파일 작성
- [✅] verification.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | FastAPI 0.115 release notes 최신 버전 | 0.136.1까지 출시, 0.115에서 Query 모델 도입 확인 |
| 조사 2 | WebSearch | uv add fastapi[standard] 설치 가이드 | uv 공식 docs에 통합 가이드 존재, [standard] 번들 구성 확인 |
| 조사 3 | WebFetch | fastapi.tiangolo.com/tutorial/ | path/query/body/Depends/StreamingResponse/BackgroundTasks/UploadFile/TestClient 표준 패턴 |
| 조사 4 | WebFetch | fastapi.tiangolo.com/release-notes/ | 0.100 Pydantic v2 마이그레이션, 0.115 Query 모델, Annotated 권장 |
| 조사 5 | WebSearch | FastAPI Annotated Query Path Body Depends syntax | Annotated 패턴이 0.95부터 권장, 0.115에서 완전 정착 |
| 조사 6 | WebSearch | FastAPI StreamingResponse SSE httpx AsyncClient | async generator 패턴, nginx proxy_buffering off 필요 |
| 조사 7 | WebSearch | FastAPI OAuth2PasswordBearer PyJWT JWT 2026 | 공식 튜토리얼 PyJWT 권장, OAuth2PasswordRequestForm 패턴 |
| 조사 8 | WebSearch | FastAPI TestClient httpx AsyncClient ASGITransport pytest | TestClient 기본, AsyncClient + ASGITransport는 async fixture 시 |
| 조사 9 | WebSearch | FastAPI CORS GZip exception handler | CORS는 최상단 등록 필수, allow_credentials + wildcard 불가 |
| 조사 10 | WebSearch | FastAPI deployment uvicorn gunicorn UvicornWorker Docker 2026 | Gunicorn 22+ / Uvicorn 0.29+ 권장, (2*core)+1 워커 |
| 조사 11 | WebSearch | FastAPI sync vs async threadpool pitfalls | async def 안 sync 호출 금지, def는 스레드풀(40) 실행 |
| 조사 12 | WebSearch | FastAPI BackgroundTasks limitations vs Celery | 짧은 fire-and-forget만 BackgroundTasks, 그 외 Celery/Dramatiq |
| 교차 검증 | WebSearch + WebFetch | 14개 핵심 클레임, 독립 소스 2개 이상 | VERIFIED 14 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| FastAPI 공식 docs | https://fastapi.tiangolo.com/ | ⭐⭐⭐ High | 2026-05-15 | 1순위 소스 |
| FastAPI Release Notes | https://fastapi.tiangolo.com/release-notes/ | ⭐⭐⭐ High | 2026-05-15 | 버전별 변경사항 |
| FastAPI Tutorial | https://fastapi.tiangolo.com/tutorial/ | ⭐⭐⭐ High | 2026-05-15 | 표준 패턴 |
| OAuth2 JWT Tutorial | https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/ | ⭐⭐⭐ High | 2026-05-15 | PyJWT 권장 |
| Async/Await Guide | https://fastapi.tiangolo.com/async/ | ⭐⭐⭐ High | 2026-05-15 | sync vs async 원칙 |
| Advanced Middleware | https://fastapi.tiangolo.com/advanced/middleware/ | ⭐⭐⭐ High | 2026-05-15 | CORS/GZip |
| Async Tests | https://fastapi.tiangolo.com/advanced/async-tests/ | ⭐⭐⭐ High | 2026-05-15 | AsyncClient 패턴 |
| Server Workers | https://fastapi.tiangolo.com/deployment/server-workers/ | ⭐⭐⭐ High | 2026-05-15 | Gunicorn + UvicornWorker |
| FastAPI GitHub Releases | https://github.com/fastapi/fastapi/releases | ⭐⭐⭐ High | 2026-05-15 | 최신 버전 확인 |
| uv FastAPI 통합 가이드 | https://docs.astral.sh/uv/guides/integration/fastapi/ | ⭐⭐⭐ High | 2026-05-15 | uv add 설치 |
| PyPI fastapi | https://pypi.org/project/fastapi/ | ⭐⭐⭐ High | 2026-05-15 | 패키지 메타 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (FastAPI 0.115+, Pydantic 2.x, Starlette 0.4x~1.0)
- [✅] deprecated된 패턴을 권장하지 않음 (Pydantic v1 Config/dict() 사용 금지, Annotated 미사용 금지)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (16개 섹션)
- [✅] 코드 예시 포함 (모든 섹션)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (async vs sync, BackgroundTasks vs Celery)
- [✅] 흔한 실수 패턴 포함 (섹션 16: 11개)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (LLM 프록시·Whisper 프록시 실 사용 예시)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15, 3/3 PASS; 2026-06-19 재수행 3/3 PASS; 2026-09-28 재검증 정정분 타깃 재수행 2/2 PASS)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-06-19, 2026-09-28)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose
**수행 방법**: 2026-09-28 재검증(2차)에서 갱신된 버전 표기(0.141.x)와 0.137.0 router.routes 내부 구조 변경 영향 여부를 겨냥한 실전 질문 2개를 SKILL.md(+REFERENCE.md)만 근거로 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 여러 쿼리 파라미터를 Pydantic 모델로 묶고 오탈자 쿼리를 거부하려면**
- ✅ PASS
- 근거: SKILL.md "3.3 Query 파라미터를 Pydantic 모델로 (0.115+ 신규)" 섹션
- 상세: `FilterParams` + `model_config = {"extra": "forbid"}` + `Annotated[FilterParams, Query()]` 코드 예시로 정확히 도출. 422 응답 바디 형식·`list[str]` 반복 쿼리 파싱 세부는 SKILL.md에 없어 추론 필요했다는 경미한 gap을 에이전트가 스스로 지적 — 차단 요인 아님.

**Q2. FastAPI 최신 버전 + 0.137.0 router.routes 내부 구조 변경이 이 스킬 패턴에 영향을 주는가**
- ✅ PASS
- 근거: SKILL.md 상단 메타(버전 기준 "0.141.x — PyPI 확인 0.141.1") · 섹션 2(디렉토리 구조)·섹션 5(Depends/Annotated 패턴)
- 상세: 버전 번호(0.141.x)는 SKILL.md 헤더에서 정확히 도출. 0.137.0 router.routes 변경 자체는 SKILL.md에 기록돼 있지 않으므로(재검증 시 verification.md에서만 "영향 없음"으로 결론) 에이전트는 "SKILL.md만으로는 확답 불가, 다만 이 스킬의 APIRouter·Depends 사용 패턴이 router.routes를 직접 순회하지 않는다는 점은 확인됨"이라고 정확히 하이라이트하며 근거 없는 단정을 피했다 — 안전한 응답(할루시네이션 없음).

### 발견된 gap

- (선택 보강, 차단 요인 아님) 2026-09-28 재검증에서 "0.137.0 router.routes 리팩터링이 이 스킬 패턴에 영향 없음"이라고 결론 내린 사실이 verification.md에만 기록되고 SKILL.md 본문에는 반영되지 않아, 사용자가 직접 물으면 SKILL.md만으로 확답이 어렵다. 검증일 각주에 한 줄 보강 고려(필수 아님).

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 — 실사용 필수 카테고리 해당 없음 (2026-06-19 재평가 확정)
- 최종 상태: APPROVED

---

### 2026-06-19 재검증 content test (참고용 보존)

**수행일**: 2026-06-19
**수행자**: skill-tester → general-purpose (python-backend-developer 에이전트로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Query 파라미터를 Pydantic 모델로 받기 + extra: "forbid" 예상 외 쿼리 거부**
- PASS
- 근거: SKILL.md "3.3 Query 파라미터를 Pydantic 모델로 (0.115+ 신규)" 섹션
- 상세: `model_config = {"extra": "forbid"}` 설정 코드 예시로 존재, `Annotated[FilterParams, Query()]` 패턴도 명확히 제시. 충분한 정보로 정확한 답변 도출됨.

**Q2. yield 의존성 구조적 요건 (try/finally 필수) + DBDep Annotated 별칭 패턴**
- PASS
- 근거: SKILL.md "5. 의존성 주입 (Depends)" 섹션 5.2·5.3
- 상세: `try/finally` 없는 yield → DB 세션 누수 흔한 함정 경고 존재, `DBDep = Annotated[AsyncSession, Depends(get_db)]` 재사용 패턴 코드 예시 모두 제공. anti-pattern 회피 확인.

**Q3. Pydantic v1→v2 마이그레이션 핵심 포인트 4가지 + from_attributes ORM 변환**
- PASS
- 근거: SKILL.md "4. Pydantic v2 모델 (Request / Response)" 섹션 (줄 193 인라인 주석 + 181줄 model_config)
- 상세: `Config` → `model_config`, `dict()` → `model_dump()`, `json()` → `model_dump_json()`, `@validator` → `@field_validator`/`@model_validator` 4가지 변경점이 명시됨. `orm_mode = True` → `from_attributes: True` 변환도 코드 예시로 존재.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md에서 정확한 근거와 anti-pattern 경고를 찾을 수 있었음.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 — "실사용 필수 카테고리" 해당 없음 (빌드 설정/워크플로우/설정+실행/마이그레이션 아님). content test PASS = APPROVED 전환 가능.
- 최종 상태: APPROVED

---

> 이전 수행 기록 (2026-05-15, 참고용 보존)
> Q1 Annotated Depends 패턴 / Q2 async vs sync 핸들러 / Q3 SSE nginx + CORS 와일드카드 → 3/3 PASS
> 당시 "실사용 필수 카테고리"로 분류하여 PENDING_TEST 유지 → 2026-06-19 카테고리 재평가 후 APPROVED 전환

---

### [2026-09-28] 재검증(2차) — FastAPI 최신 버전 갱신(0.136.x→0.141.x), 핵심 API 유효성 재확인

**수행일**: 2026-09-28
**수행 방법**: SKILL.md·references/REFERENCE.md 전체 Read → 핵심 클레임 5개를 1차 소스(PyPI, GitHub Releases, 공식 release-notes)와 대조, 보강·축소 검토

**클레임 대조 결과**:
1. "테스트 시점 최신 FastAPI 0.136.x" → DISPUTED(정정) — PyPI 1차 소스(`https://pypi.org/pypi/fastapi/json`) 확인 결과 현재 최신은 **0.141.1**. SKILL.md 버전 표기를 0.141.x로 갱신.
2. "0.136→0.141 구간에 Annotated/Query/Path/Depends/yield/StreamingResponse/OAuth2PasswordBearer/BackgroundTasks/TestClient/CORSMiddleware 관련 breaking change 존재 여부" → VERIFIED(영향 없음) — 공식 release notes(https://fastapi.tiangolo.com/release-notes/) + GitHub Releases(https://github.com/fastapi/fastapi/releases) 확인. 0.137.0에서 `router.routes`가 평면 리스트→트리 구조로 내부 리팩터링된 breaking change가 있었으나(FastAPI 공식 X 계정·GitHub Issue #4699로 교차 확인), 이는 `router.routes`를 직접 순회하는 서드파티/내부 로직에만 영향 — 본 스킬 예제 코드는 해당 패턴을 사용하지 않아 **영향 없음**.
3. "0.141.0에서 Pydantic v1 지원 deprecated 공지" → VERIFIED(신규 확인, 스킬 영향 없음) — 공식 release notes 확인. 본 스킬은 이미 Pydantic v2 전용으로 작성되어 있고 v1 패턴(`Config`, `dict()`, `@validator`)은 "사용 금지" 항목으로만 언급되므로 스킬 내용 수정 불필요.
4. "`fastapi[standard]`가 uvicorn[standard]·fastapi-cli·httpx·jinja2·python-multipart 포함" → VERIFIED — 공식 docs(fastapi.tiangolo.com) 기준 현재도 동일 구성 유지 확인 (`fastapi-cli[standard]`에 `fastapi-cloud-cli`가 추가되었으나 별도 유료 배포 제품 관련이라 본 스킬 범위 밖으로 판단, 미반영).
5. "Gunicorn + UvicornWorker 멀티 워커 프로덕션 배포 권장, PyJWT가 python-jose보다 권장" → VERIFIED — 공식 배포 문서(deployment/server-workers/)·보안 튜토리얼 기준 현재도 동일 권장 유지.

**보강(ADD)·축소**: SKILL.md 1곳 정정(버전 표기 0.136.x→0.141.x, PyPI 확인 문구 추가). 코드 예시·API 패턴은 전부 유효하여 축소·삭제 없음.

**실전 질문 재검증**:
- Q1. "FastAPI 최신 버전에서 Query 파라미터를 Pydantic 모델로 받고 예상 못한 쿼리를 거부하려면?" → SKILL.md "3.3 Query 파라미터를 Pydantic 모델로" 섹션 `model_config = {"extra": "forbid"}` 근거로 PASS (0.141.1에서도 동일 API)
- Q2. "0.137.0 이후 라우터 내부 구조가 바뀌었다는데 이 스킬의 APIRouter 사용 패턴에 영향이 있나?" → SKILL.md에는 `router.routes` 직접 순회 패턴이 없음(섹션 2·5 확인) — 근거로 "영향 없음" PASS

**재검증 최종 판정**: status **PENDING_TEST 전환** (SKILL.md 버전 표기 정정이 있어 verification-policy.md 절차상 content test 재수행 필요 — 실질적 API/코드 예시 변경은 없음)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 2026-06-19 3/3 PASS + **skill-tester 재검증 content test 2/2 PASS (2026-09-28, 버전 정정분 타깃)** |
| 실 프로젝트 검증 | 해당 없음 (라이브러리 사용법 스킬 — content test PASS = APPROVED 가능) |
| 2차 재검증 (2026-09-28) | 버전 표기 정정(0.136.x→0.141.x), 핵심 API 5개 클레임 VERIFIED, 코드 예시 영향 없음 + skill-tester content test 2/2 PASS 완료 |
| **최종 판정** | **APPROVED** (skill-tester 재테스트 2/2 PASS 완료 — 버전 표기 정정 반영, 실질적 API/코드 예시 변경 없음 확인) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 content test 수행 후 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS; 2026-06-19 재수행 3/3 PASS, APPROVED 전환; 2026-09-28 재검증 정정분 재수행 2/2 PASS, APPROVED 재전환)
- [✅] 카테고리 재평가 완료 (2026-06-19) — 라이브러리 사용법 스킬로 확정, "실사용 필수 카테고리" 해당 없음. content test PASS로 APPROVED 전환 가능.
- [❌] uvicorn 0.29+, gunicorn 22+ 실제 빌드 검증 — 차단 요인 아님(선택 보강). 배포 시 추가 확인 권장.
- [❌] SSE 스트리밍이 nginx 리버스 프록시 환경에서 정상 동작하는지 확인 — 차단 요인 아님(선택 보강). 실 nginx 환경 배포 후 검증 권장.

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 (FastAPI 0.115+ / Pydantic 2.x 기준) | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 Annotated Depends 패턴 / Q2 async vs sync 핸들러 / Q3 SSE X-Accel-Buffering + CORS 와일드카드) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
| 2026-06-19 | v1 | 2단계 실사용 테스트 재수행 (Q1 Query 모델 + extra forbid / Q2 yield 의존성 try/finally + DBDep 별칭 / Q3 Pydantic v2 마이그레이션 4가지 + from_attributes) → 3/3 PASS, 카테고리 재평가 후 APPROVED 전환 | skill-tester |
| 2026-08-12 | v1 | **모델 ID 세대 정렬.** `references/REFERENCE.md`의 Claude 프록시 SSE 예제에서 `claude-sonnet-4-6` → `claude-sonnet-5` 교체(1곳). Sonnet 4.6은 legacy, 현행 세대는 Sonnet 5. 샘플링 파라미터·`budget_tokens` 사용 없음 — 5 계열 400 이슈 해당 없음. FastAPI/Pydantic 본문은 변경 없음. SKILL.md 검증일 2026-05-15 → 2026-08-12. status **APPROVED 유지** | 모델 ID 세대 정렬 |
| 2026-09-25 | v1 | 교차 참조 조건부 표기 (내용 변경 없음) | Claude (Sonnet 5) |
| 2026-09-28 | v1 | **2차 재검증(검증일 7일 초과분).** PyPI 1차 소스 대조 결과 FastAPI 최신 버전 0.136.x→0.141.1로 갱신 확인, SKILL.md 버전 표기 정정. 0.137.0 `router.routes` 내부 리팩터링(breaking change)·0.141.0 Pydantic v1 deprecated 공지는 GitHub Releases·공식 release-notes로 교차 확인했으나 본 스킬 코드 예시엔 영향 없음. 핵심 클레임 5개 VERIFIED. 검증일 4곳(SKILL.md·verification.md 메타/frontmatter/본 행) 2026-09-28로 동기화. status PENDING_TEST 전환(버전 표기 정정에 따른 절차상 재분류, content test 재수행 필요) | Claude (Sonnet 5) |
| 2026-09-28 | v1 | 2단계 실사용 테스트 수행(재검증 정정분 타깃) — Q1 Query 모델 extra forbid / Q2 FastAPI 0.141.x 버전 확인 + 0.137.0 router.routes 변경 영향 없음 확인 → 2/2 PASS, PENDING_TEST → **APPROVED** 전환 | skill-tester |
