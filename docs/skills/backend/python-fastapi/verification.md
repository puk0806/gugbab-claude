---
skill: python-fastapi
category: backend
version: v1
date: 2026-05-15
status: PENDING_TEST
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
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 대상 버전 | FastAPI 0.115+ (테스트 시점 최신 0.136.x), Pydantic 2.x, Starlette 0.4x~1.0 |

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

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15, 3/3 PASS)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-05-15)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음, 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (python-backend-developer 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Annotated Depends 패턴 — 클래스 의존성 타입 별칭 + yield DB 세션 조합**
- PASS
- 근거: SKILL.md "5. 의존성 주입 (Depends)" 섹션 5.2·5.3
- 상세: `PaginationDep = Annotated[Pagination, Depends(Pagination)]` 패턴과 `DBDep = Annotated[AsyncSession, Depends(get_db)]` 패턴 모두 코드 예시로 존재. `try/finally` 없는 yield → 세션 누수 경고 명시됨. `Query(default=0)` 금지 주의사항도 섹션 3.2에 존재.

**Q2. async def 안 boto3(sync) 호출 문제 + 올바른 처리 3가지**
- PASS
- 근거: SKILL.md "6. async vs sync 핸들러 — 핵심 원칙" 섹션
- 상세: `async def` 안 동기 블로킹 절대 금지 명시, 권장 3가지(async 라이브러리 교체 / `def` 선언 시 스레드풀 40 실행 / `run_in_threadpool`) 코드 예시로 존재. boto3 sync가 스레드풀 대상으로 섹션 6 테이블에 명시됨.

**Q3. SSE nginx 버퍼링 문제 원인·해결 + CORS 와일드카드 함정**
- PASS
- 근거: SKILL.md "10. SSE 스트리밍" 섹션 + "7.1 CORS" 섹션 + "16. 흔한 함정 모음"
- 상세: nginx `proxy_buffering on` 원인과 `X-Accel-Buffering: no` 헤더 해결책 모두 존재. `allow_origins=["*"]` + `allow_credentials=True` 브라우저 거부 경고와 CORSMiddleware 최상단 등록 필수 경고 모두 섹션 7.1·섹션 16에 존재.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md에서 정확한 근거와 anti-pattern 경고를 찾을 수 있었음.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: "실사용 필수 스킬" (실 API 빌드/요청 결과 검증 필요)
- 최종 상태: PENDING_TEST 유지 (content test PASS, 실 프로젝트 검증 후 APPROVED 전환)

---

> 아래는 초기 작성 시 템플릿 (참고용 보존)
> 본 스킬은 실사용 필수 카테고리이므로 skill-tester content test와 실 프로젝트 검증을 모두 수행 후 APPROVED 전환.
> content test: 2026-05-15 완료 (3/3 PASS)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-15, 3/3 PASS) |
| 실 프로젝트 검증 | ❌ (실행 전 — 실사용 필수 카테고리, 실 API 서버 검증 후 APPROVED) |
| **최종 판정** | **PENDING_TEST** (content test PASS, 실 프로젝트 검증 대기) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 content test 수행 후 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS)
- [❌] 실 FastAPI 프로젝트(예: Claude/Whisper 프록시 백엔드)에서 본 스킬 기반 코드 동작 확인 — APPROVED 전환을 위한 차단 요인. 실 API 서버 구동 후 수행 필요.
- [❌] uvicorn 0.29+, gunicorn 22+ 실제 빌드 검증 — 차단 요인. 배포 시 확인 필요.
- [❌] SSE 스트리밍이 nginx 리버스 프록시 환경에서 정상 동작하는지 확인 — 차단 요인. 실 nginx 환경 배포 후 확인 필요.

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 (FastAPI 0.115+ / Pydantic 2.x 기준) | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 Annotated Depends 패턴 / Q2 async vs sync 핸들러 / Q3 SSE X-Accel-Buffering + CORS 와일드카드) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
