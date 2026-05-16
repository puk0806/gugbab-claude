---
skill: python-pytest
category: backend
version: v1
date: 2026-05-15
status: APPROVED
---

# python-pytest 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `python-pytest` |
| 스킬 경로 | `.claude/skills/backend/python-pytest/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 대상 버전 | pytest 8.4.x (8.x 라인 최신 안정) |
| 짝 스킬 | `backend/python-fastapi`, `backend/python-uv-project-setup` |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.pytest.org)
- [✅] 공식 GitHub 2순위 소스 확인 (pytest-dev/pytest, pytest-dev/pytest-asyncio, pytest-dev/pytest-mock, pytest-dev/pytest-cov)
- [✅] 최신 버전 기준 내용 확인 (pytest 8.4.x — 8.x 라인 최신 안정, 2025-09-04 기준)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (12개 섹션)
- [✅] 코드 예시 작성 (설치, fixture, parametrize, marker, async, FastAPI, mock, coverage, CI)
- [✅] 흔한 실수 패턴 정리 (7개)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | "pytest 8.x latest version 2026 official documentation features" | docs.pytest.org changelog · pypi · 8.0/8.2 release announcements 확보 |
| 조사 2 | WebSearch | "pytest-asyncio FastAPI TestClient fixture dependency override 2026" | FastAPI 공식 testing-dependencies 가이드 + pytest-asyncio mode 자료 확보 |
| 조사 3 | WebFetch | https://docs.pytest.org/en/stable/changelog.html | 8.0~8.4 버전별 주요 변경 사항 (8.4.0 async 플러그인 강제, non-None 반환 실패 등) 수집 |
| 조사 4 | WebSearch | "pytest fixture scope yield session module class function 2026" | 공식 fixture 가이드 + scope 의존 규칙 확인 |
| 조사 5 | WebSearch | "pytest-asyncio 0.24 0.25 mode auto strict async fixture" | strict/auto 모드 차이, async fixture 처리 규칙 확인 |
| 조사 6 | WebFetch | https://pytest-asyncio.readthedocs.io/en/stable/concepts.html | loop_scope, mode 개념 추가 확인 |
| 조사 7 | WebSearch | "pytest-mock mocker fixture pytest-cov coverage GitHub Actions 2026" | mocker 자동 cleanup, pytest-cov + GHA 통합 패턴 확인 |
| 조사 8 | WebSearch | "pytest parametrize marker skip xfail slow custom marker 2026" | pytest.param + marks, --strict-markers, 커스텀 marker 등록 확인 |
| 교차 검증 | WebSearch + WebFetch | 핵심 클레임 6개, 독립 소스 2~3개씩 | VERIFIED 6 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| pytest 공식 문서 | https://docs.pytest.org/en/stable/ | ⭐⭐⭐ High | 2026-05-15 | 1순위 공식 |
| pytest changelog | https://docs.pytest.org/en/stable/changelog.html | ⭐⭐⭐ High | 2026-05-15 | 8.x 버전별 변경 |
| pytest 8.0 release | https://docs.pytest.org/en/stable/announce/release-8.0.0.html | ⭐⭐⭐ High | 2026-05-15 | 공식 릴리즈 노트 |
| pytest fixture how-to | https://docs.pytest.org/en/stable/how-to/fixtures.html | ⭐⭐⭐ High | 2026-05-15 | scope·yield 공식 |
| pytest skip/xfail | https://docs.pytest.org/en/stable/how-to/skipping.html | ⭐⭐⭐ High | 2026-05-15 | marker 공식 |
| pytest parametrize | https://docs.pytest.org/en/stable/how-to/parametrize.html | ⭐⭐⭐ High | 2026-05-15 | parametrize 공식 |
| pytest-asyncio 공식 | https://pytest-asyncio.readthedocs.io/en/stable/concepts.html | ⭐⭐⭐ High | 2026-05-15 | strict/auto 모드 |
| pytest-mock GitHub | https://github.com/pytest-dev/pytest-mock | ⭐⭐⭐ High | 2026-05-15 | 공식 GitHub |
| pytest-cov GitHub | https://github.com/pytest-dev/pytest-cov | ⭐⭐⭐ High | 2026-05-15 | 공식 GitHub |
| FastAPI testing-dependencies | https://fastapi.tiangolo.com/advanced/testing-dependencies/ | ⭐⭐⭐ High | 2026-05-15 | FastAPI 공식 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (pytest 8.4.x)
- [✅] deprecated된 패턴을 권장하지 않음 (`pytest.warns` 권장, async 플러그인 필수 명시)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description, examples 3개)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (assert, fixture, parametrize, marker, async, mock, coverage)
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함 (7개)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)
- [✅] 짝 스킬 (python-fastapi, python-uv-project-setup) 명시로 통합 워크플로우 형성

### 4-4. 교차 검증한 핵심 클레임

| # | 클레임 | 판정 | 소스 |
|---|--------|------|------|
| 1 | pytest 8.x 라인 최신 안정은 8.4.x (2025-09-04 8.4.2) | VERIFIED | docs.pytest.org changelog + PyPI |
| 2 | pytest 8.4부터 async 테스트는 적절한 플러그인 없으면 *실패*로 처리됨 | VERIFIED | pytest 8.4.0 release notes + changelog |
| 3 | 테스트 함수가 None이 아닌 값을 반환하면 실패 (8.4+) | VERIFIED | pytest changelog (이전엔 경고였음) |
| 4 | pytest-asyncio strict 모드: `@pytest_asyncio.fixture` 필수 / auto 모드: 일반 `@pytest.fixture` 사용 가능 | VERIFIED | pytest-asyncio 공식 concepts.html |
| 5 | fixture scope 의존 방향: 좁은 → 넓은만 허용 | VERIFIED | pytest 공식 fixture how-to |
| 6 | FastAPI `app.dependency_overrides`로 의존성 오버라이드 후 `clear()` 필수 | VERIFIED | FastAPI 공식 testing-dependencies |

### 4-5. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15 skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (4/4 PASS — 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 4개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. fixture scope 4종(function/class/module/session) 차이 및 의존 방향 규칙**
- PASS
- 근거: SKILL.md "3-3. scope — 생성 빈도 제어" 섹션 (표 + 코드 예시)
- 상세: scope별 생성 시점·사용 시기 표, session→function 의존 에러 주의 코드, `database_url`(session) + `db_session`(function) 패턴 모두 명확히 기재. anti-pattern(넓은 → 좁은 의존) 회피 확인.

**Q2. parametrize 데이터 주도 테스트 — 개별 케이스 marker(skip/xfail) 적용**
- PASS
- 근거: SKILL.md "4. parametrize — 데이터 주도 테스트" + "4-1. 개별 케이스에 marker 적용" 섹션
- 상세: `pytest.param(value, marks=pytest.mark.skip(reason="..."))` / `pytest.mark.xfail` 코드 예시 존재. ids 지정(4-2), fixture params(4-3)까지 포함. gap 없음.

**Q3. pytest-asyncio auto 모드 vs strict 모드 차이 및 async fixture 처리 규칙**
- PASS
- 근거: SKILL.md "6-1. 설정" + "6-2. 사용 예 (auto 모드)" + "6-3. strict 모드 사용 시" + "12-2. async fixture 누락" 섹션
- 상세: auto 모드(@pytest.fixture 사용 가능, @pytest.mark.asyncio 생략 가능) vs strict 모드(@pytest_asyncio.fixture 필수, @pytest.mark.asyncio 명시 필수) 차이 명확. pytest 8.4 플러그인 없으면 실패(경고 아님) 주의 사항도 포함. anti-pattern 회피 확인.

**Q4. FastAPI TestClient dependency_overrides 패턴 및 테스트 간 누수 방지**
- PASS
- 근거: SKILL.md "7-1. 동기 테스트 (TestClient)" + "7-3. 의존성 오버라이드 fixture 패턴" + "12-4. dependency_overrides 누수" 섹션
- 상세: `app.dependency_overrides[get_db] = fake_db` + yield fixture + `app.dependency_overrides.clear()` 패턴 코드 예시 존재. 12-4에서 teardown 누락 anti-pattern 명시. gap 없음.

### 발견된 gap

없음 — 4개 질문 모두 SKILL.md에서 명확한 근거 섹션 및 코드 예시 확인.

### 판정

- agent content test: 4/4 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 — 실사용 필수 카테고리 해당 없음
- 최종 상태: APPROVED

---

> 아래는 skill-tester 호출 전 참고용 템플릿 (보존)

> skill-tester 에이전트가 SKILL.md를 Read한 뒤 실전 질문으로 답변 정확성을 검증한다.
> content test 카테고리: **실사용 검증 불필요** (라이브러리 사용법 스킬 — `verification-policy.md` 정의)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ 4/4 PASS (2026-05-15) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester 2단계 실사용 테스트 수행 (2026-05-15 완료, 4/4 PASS)
- [✅] 테스트 결과 PASS 시 status → APPROVED 전환 (2026-05-15 완료)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 — pytest 8.4.x 기준, 12개 섹션 + 7개 함정 | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 fixture scope 4종 / Q2 parametrize 개별 marker / Q3 asyncio auto-strict 모드 / Q4 dependency_overrides 누수 방지) → 4/4 PASS, APPROVED 전환 | skill-tester |
