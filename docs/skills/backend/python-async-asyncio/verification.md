---
skill: python-async-asyncio
category: backend
version: v1
date: 2026-05-15
status: APPROVED
---

# python-async-asyncio 검증 문서

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증) — 완료
  ├─ docs.python.org · PEP 492 · PEP 525 · python-httpx.org 기반 작성
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST → skill-tester 2단계 테스트 대기

[2단계] 실제 사용 중 (온라인 검증) — skill-tester 호출 예정
```

판정 상태 의미: `PENDING_TEST` = 내용 검증 완료, content test 미실시(사용 가능).

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `python-async-asyncio` |
| 스킬 경로 | `.claude/skills/backend/python-async-asyncio/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 대상 버전 | Python 3.11 / 3.12 (3.11+ 권장) |
| 짝 스킬 | `backend/python-fastapi`, `backend/python-anthropic-sdk` |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.python.org asyncio-task, asyncio-sync)
- [✅] PEP(원저) 2순위 소스 확인 (PEP 492, PEP 525)
- [✅] 라이브러리 공식 문서 확인 (python-httpx.org/async)
- [✅] 최신 버전 기준 내용 확인 (Python 3.12 기준, 3.11/3.13/3.14 변경 포함)
- [✅] 핵심 패턴·베스트 프랙티스 정리 (12개 섹션)
- [✅] 코드 예시 작성 (실행 가능 형태)
- [✅] 흔한 실수 패턴 정리 (6개 함정)
- [✅] SKILL.md 파일 작성
- [✅] verification.md 파일 작성
- [✅] skill-tester로 content test 수행 (2026-05-15 완료, 4/4 PASS)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 확보 |
| 중복 확인 | Glob | `.claude/skills/backend/python-async-asyncio/**`, `python-*` | 중복 없음, 짝 스킬도 아직 미생성 |
| 조사 | WebSearch | "Python asyncio official documentation 3.12 async await coroutines" | docs.python.org 3.12·3.14, Real Python 등 |
| 조사 | WebSearch | "Python 3.11 asyncio.timeout() vs wait_for difference" | PEP·discuss.python.org·bug tracker 확보 |
| 조사 | WebFetch | docs.python.org/3/library/asyncio-task.html | API 시그니처·버전 추가 정보 정확 추출 |
| 조사 | WebSearch | "asyncio.to_thread vs loop.run_in_executor 3.9" | 차이점·use case 확보 |
| 조사 | WebSearch | "httpx AsyncClient async usage example timeout official" | python-httpx.org 공식 페이지 확인 |
| 조사 | WebFetch | python-httpx.org/async/ | AsyncClient 정확한 사용 패턴·스트리밍 확보 |
| 조사 | WebSearch | "asyncio Semaphore Queue concurrent control official" | docs.python.org asyncio-sync 확인 |
| 조사 | WebSearch | "Python 3.12 asyncio improvements eager task factory" | whatsnew/3.12·Meta engineering 블로그 확보 |
| 교차 검증 | WebSearch | `__aenter__`/`__aexit__` PEP 492 | 공식 PEP 확인, 문법 제약 검증 |
| 교차 검증 | WebSearch | `__aiter__`/`__anext__` PEP 525 | 공식 PEP 확인, 사용 예시 검증 |

총 클레임 검증: VERIFIED 13 / DISPUTED 0 / UNVERIFIED 0

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Python Docs — Coroutines and Tasks | https://docs.python.org/3/library/asyncio-task.html | ⭐⭐⭐ High | 2026-05-15 | 1순위 공식 |
| Python Docs — Synchronization Primitives | https://docs.python.org/3/library/asyncio-sync.html | ⭐⭐⭐ High | 2026-05-15 | Semaphore/Queue/Lock |
| Python Docs — Event Loop | https://docs.python.org/3/library/asyncio-eventloop.html | ⭐⭐⭐ High | 2026-05-15 | run_in_executor |
| Python Docs — Developing with asyncio | https://docs.python.org/3/library/asyncio-dev.html | ⭐⭐⭐ High | 2026-05-15 | 흔한 함정 근거 |
| What's New in Python 3.12 | https://docs.python.org/3/whatsnew/3.12.html | ⭐⭐⭐ High | 2026-05-15 | 성능 개선·eager task factory |
| PEP 492 — async/await | https://peps.python.org/pep-0492/ | ⭐⭐⭐ High | 2026-05-15 | async with·async for 문법 정의 |
| PEP 525 — Asynchronous Generators | https://peps.python.org/pep-0525/ | ⭐⭐⭐ High | 2026-05-15 | async generator 정의 |
| HTTPX — Async Support | https://www.python-httpx.org/async/ | ⭐⭐⭐ High | 2026-05-15 | AsyncClient 공식 사용법 |
| HTTPX — Timeouts | https://www.python-httpx.org/advanced/timeouts/ | ⭐⭐⭐ High | 2026-05-15 | 5초 기본·세분화 타임아웃 |
| Meta — Python 3.12 features | https://engineering.fb.com/2023/10/05/developer-tools/python-312-meta-new-features/ | ⭐⭐ Medium | 2026-05-15 | 성능 수치 보조 출처 |
| discuss.python.org — timeout context manager | https://discuss.python.org/t/improve-asyncio-timeout-context-manager-documentation/32659 | ⭐⭐ Medium | 2026-05-15 | timeout vs wait_for 보조 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음 (모든 API 시그니처 docs.python.org 대조)
- [✅] 버전 정보가 명시되어 있음 (Python 3.9/3.11/3.12/3.13/3.14 변경점 표기)
- [✅] deprecated된 패턴을 권장하지 않음 (`asyncio.coroutine` 데코레이터·`loop=` 인자 미사용)
- [✅] 코드 예시가 실행 가능한 형태임 (import·실행 진입점 포함)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description, example 3개)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (코루틴/이벤트 루프/Task/취소)
- [✅] 코드 예시 포함 (12개 섹션, 30+ 스니펫)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (gather vs TaskGroup vs create_task 비교 표 등)
- [✅] 흔한 실수 패턴 포함 (6개 함정)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (FastAPI/LLM 적용 표 포함)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (외부 API 동시 호출·rate limit·sync 폴백 등 실 use case)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X — 짝 스킬 링크만 명시)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15 완료)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (보완 불필요 — 전 항목 PASS)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (domain-specific python 에이전트 미존재로 대체)
**수행 방법**: SKILL.md Read 후 4개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. time.sleep vs asyncio.sleep — async 함수 내 blocking call 함정**
- PASS
- 근거: SKILL.md "10. 흔한 함정" > "함정 1: blocking call을 async 함수에서 그대로 부르기" 섹션 + "1. async/await 기본" 핵심 규칙
- 상세: `time.sleep(1)` 금지 이유(이벤트 루프 싱글 스레드 점유), `await asyncio.sleep(1)` 권장, 부득이한 경우 `asyncio.to_thread()` 폴백 — 모두 코드 예시와 함께 존재

**Q2. asyncio.to_thread vs loop.run_in_executor 선택 기준 (CPU 바운드 포함)**
- PASS
- 근거: SKILL.md "3. 동기 함수를 비동기에서 호출 — to_thread / run_in_executor" 섹션 "선택 기준" 표
- 상세: I/O blocking = `to_thread()`, CPU 바운드 = `ProcessPoolExecutor + run_in_executor()`, GIL 미우회 주의사항 모두 명시

**Q3. asyncio.timeout(3.11+) vs wait_for — 버전 분기 및 예외 클래스 차이**
- PASS
- 근거: SKILL.md "6. 타임아웃 — asyncio.timeout() vs asyncio.wait_for()" 섹션
- 상세: 3.11+ 권장 이유(여러 await 블록 묶기, Task 미생성 성능), `when()`/`reschedule()` 동적 조정, 3.10 이하 `asyncio.TimeoutError` / 3.11+ 표준 `TimeoutError` 통합 주의사항 모두 존재

**Q4. CancelledError 재전파 — TaskGroup과의 연동**
- PASS
- 근거: SKILL.md "7. Task 취소 — task.cancel() / CancelledError" 섹션 + "10. 흔한 함정" > "함정 6: CancelledError 삼키기"
- 상세: CancelledError가 BaseException 하위(3.8+)라 `except Exception`에 잡히지 않는 설계 이유, `pass`로 삼키면 TaskGroup·timeout 깨짐, `raise` 재전파 필수 패턴 코드 예시 포함

### 발견된 gap

없음 — 4개 질문 모두 SKILL.md 내 해당 섹션·코드 예시가 충분히 존재했으며 anti-pattern도 명확히 구분됨.

### 판정

- agent content test: 4/4 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 (content test로 APPROVED 전환 가능)
- 최종 상태: APPROVED

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-15, 4/4 PASS) |
| **최종 판정** | **APPROVED** |

> content test 가능 카테고리 (`verification-policy.md`의 "라이브러리 사용법 스킬"). skill-tester 통과 시 APPROVED 전환 가능.

---

## 7. 개선 필요 사항

- [✅] skill-tester 메인 호출 후 섹션 5·6 업데이트 (2026-05-15 완료, 4/4 PASS)
- [❌] 짝 스킬(`python-fastapi`, `python-anthropic-sdk`) 생성 후 상호 참조 보강 (차단 요인 아님 — 선택 보강. 짝 스킬 생성 시 이 항목 ✅ 전환)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 — Python 3.12 기준, asyncio·httpx·PEP 492/525 통합 | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 time.sleep vs asyncio.sleep / Q2 to_thread vs run_in_executor / Q3 timeout vs wait_for 버전 분기 / Q4 CancelledError 재전파) → 4/4 PASS, APPROVED 전환 | skill-tester |
