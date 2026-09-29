---
skill: python-async-asyncio
category: backend
version: v1
date: 2026-09-28
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
| 검증일 | 2026-09-28 (재검증, 이전 2026-09-26 · 최초 2026-05-15) |
| 검증자 | skill-creator → 2026-09-26 재검증 → 2026-09-28 선택 보강: 메인 오케스트레이션 (Claude Sonnet 5) |
| 스킬 버전 | v1 |
| 대상 버전 | Python 3.11 / 3.12 (3.11+ 권장), 3.13/3.14 GA 반영 |
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

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15 완료, 2026-09-28 재테스트 3회 수행 — 3차는 "선택 보강 반영"분 대상)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — 2026-09-28 1차 재테스트에서 발견된 broken cross-reference(15행↔11절)는 메인이 15행 문구를 정정("3.13/3.14 API 변경점은 11절, free-threaded·CPU 바운드는 3절 주의")했고, 2026-09-28 2차 재테스트로 참조가 실제로 해소됨을 확인(§5 참조)

---

## 5. 테스트 진행 기록

### 2단계 3차 재테스트 (2026-09-28) — 선택 보강 반영분(§11 3.13/3.14 분리, §3 PEP 703/779 구분) 검증

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (2개 병렬 호출)
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션·anti-pattern 회피 확인. 직전 "[2026-09-28] 선택 보강 반영"(바로 아래 블록)에서 추가된 11절 3.13/3.14 소제목 분리 내용과 3절 free-threading PEP 703/779 구분 서술을 직접 겨냥한 질문 구성

**Q1. Python 3.13에서 asyncio.Queue를 명시적으로 종료(shutdown)하려면? TaskGroup 안에서 외부 취소와 내부 취소가 동시에 겹치는 상황이 3.13에서 어떻게 개선됐나?**
- ✅ PASS
- 근거: SKILL.md 11절 "3.13 (2024-10 GA)" 소제목(466~468행) — `asyncio.Queue.shutdown()`/`QueueShutDown`, `TaskGroup` 취소 처리 개선(`cancel()` 호출 보장, `cancelling()` 카운트 보존)
- 상세: 두 항목 모두 정확한 근거 인용과 함께 답변됨. 다만 테스트 에이전트가 "5절(195~218행) 큐 예제 코드는 여전히 구버전 `None` sentinel 패턴만 있고 3.13 `Queue.shutdown()`을 반영한 코드 예시가 없다"는 gap을 스스로 지적함 — 서술(11절)과 실습 코드(5절) 간 정합성 미비, 차단 요인은 아님(선택 보강)

**Q2. CPU 바운드 작업의 GIL 문제 — free-threaded 빌드로 해결되는가? Python 3.13과 3.14의 free-threading 지원 수준 차이는?**
- ✅ PASS
- 근거: SKILL.md "3. 동기 함수를 비동기에서 호출" 섹션 131행(PEP 703/PEP 779 구분 서술)
- 상세: 3.13(PEP 703, 실험적, `python3.13t`/`--disable-gil`, 단일 스레드 성능 저하 큼) vs 3.14(PEP 779, 공식 지원, 공식 배포 바이너리, 성능 저하 ~5~10%), free-threaded 빌드에서 미지원 C 확장 임포트 시 GIL 자동 재활성화까지 정확히 인용

### 발견된 gap (2026-09-28 3차 재테스트)

- **[선택 보강, 비차단]** 5절(195~218행) `asyncio.Queue` 생산자/소비자 예제가 `None` sentinel 종료 패턴만 다루고, 11절에서 신설 사실로 소개한 3.13 `Queue.shutdown()`/`QueueShutDown`을 실제 코드로 보여주지 않음 — 서술은 정확하나 실습 코드 예시가 최신화되지 않은 gap. 차단 요인 아님(신설 API 존재·동작 자체는 11절에 정확히 기술됨)

### 판정 (2026-09-28 3차 재테스트)

- agent content test: 2/2 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 (content test로 APPROVED 전환 가능)
- 최종 상태: PENDING_TEST → APPROVED (선택 보강 반영분이 실전 질문에 정확히 반영됨을 확인, 잔여 지적은 선택 보강)

---

### [2026-09-28] 선택 보강 반영

**무엇을**: 2차 재테스트(§5 하단)에서 발견된 "선택 보강" gap 2건 중 1건 반영.
- 11절 제목을 "Python 3.12+ 개선 사항" → "Python 3.12+ 개선 사항 (3.13·3.14 포함)"으로 조정해 상단 15행 안내("3.13/3.14의 asyncio API 변경점은 11절")와 어감 일치.
- 11절을 3.13/3.14 소제목으로 분리하고 분량 보강: 3.13 — `as_completed()` async iterator화, `task.uncancel()` 취소 카운트 0 리셋(기존 서술 유지·근거 보강), `asyncio.Queue.shutdown()`/`QueueShutDown` 신설, `TaskGroup` 외부·내부 취소 충돌 처리 개선, `create_task()` 계열 `**kwargs` 전달. 3.14 — `loop.create_task(..., eager_start=None, **kwargs)`가 3.14부터 모든 kwargs를 전달하고 `eager_start`가 eager task factory와 실제 연동되도록 변경된 공식 문서 문구("Changed in version 3.14") 인용, `asyncio.capture_call_graph()`/`print_call_graph()` + CLI `python -m asyncio ps/pstree` 인트로스펙션 도구 추가.
- 3절 GIL 주의문에 free-threading(PEP 703/779) 서술 보강: 3.13 실험적 지원(`python3.13t`, `--disable-gil`, 기본 비활성, 단일 스레드 성능 저하 큼) vs 3.14 PEP 779 공식 지원(공식 배포 바이너리, 단일 스레드 성능 저하 ~5~10%로 축소), free-threaded 빌드에서 미지원 C 확장 임포트 시 GIL 자동 재활성화.
- 짝 스킬(python-fastapi, python-anthropic-sdk)이 이미 생성되어 있음을 확인 — 섹션 7의 "짝 스킬 생성 후 상호 참조 보강" 항목도 함께 해소(SKILL.md 16행에 이미 명시된 링크로 충분, 추가 수정 불요).

**근거**:
- https://docs.python.org/3/whatsnew/3.13.html — asyncio 섹션(`as_completed` iterator화, `Queue.shutdown`/`QueueShutDown`, `TaskGroup` 취소 개선, `create_task` `**kwargs`), free-threading(PEP 703) 실험적 지원 섹션
- https://docs.python.org/3/whatsnew/3.14.html — asyncio 섹션(`create_task` 임의 kwargs 전달 gh-128307, `capture_call_graph`/`print_call_graph`/CLI `ps`·`pstree`), free-threading(PEP 779) 공식 지원 섹션
- https://docs.python.org/3/library/asyncio-eventloop.html — `loop.create_task(coro, *, name=None, context=None, eager_start=None, **kwargs)` 시그니처 및 "Changed in version 3.14: All kwargs are now passed on. The eager_start parameter works with eager task factories." 원문 확인

### 2단계 2차 재테스트 (2026-09-28) — cross-reference 정정 검증

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (2개 병렬 호출)
**수행 방법**: SKILL.md Read 후 실전 질문 2개 답변. 1차 재테스트(같은 날)에서 발견된 15행↔11절 broken cross-reference를 메인이 "3.13/3.14의 asyncio API 변경점은 11절, free-threaded 빌드와 CPU 바운드 처리는 3절 주의 참조"로 정정한 뒤, 그 참조가 실제로 해소됐는지 재확인

**Q1. 상단 15행이 안내하는 "11절 = 3.13/3.14 API 변경점", "3절 주의 = free-threaded·CPU 바운드"가 실제 본문과 일치하는가?**
- ✅ PASS
- 근거: 15행(대상 버전 안내) ↔ 11절(458-465행, "Python 3.12+ 개선 사항") ↔ 3절 131행("GIL을 우회하지 않는다... free-threaded Python 빌드를 사용")
- 상세: 11절 462-463행에 "3.13: as_completed() async iterator화, task.uncancel()" / "3.14: create_task(eager_start=True) 지원"이 실제로 존재해 15행의 "11절=API 변경점" 안내와 일치. 3절 131행의 free-threaded·GIL 주의 문구도 15행의 "3절 주의" 안내와 정확히 일치. 이전 재테스트에서 지적된 "예고된 내용이 해당 절에 아예 없음"(broken cross-reference)은 해소됨. 다만 테스트 에이전트는 11절 제목이 "Python 3.12+ 개선 사항"이라 15행 안내(3.13/3.14 전용처럼 읽힘)와 미묘한 어감 차이가 있고, 3.13/3.14 항목·free-threaded 설명이 각 1~2줄로 짧다는 점을 선택 보강 사항으로 지적 — 참조 자체의 정합성(내용 존재 여부)은 확인됨

**Q2. 외부 API 5개 동시 호출 중 하나 실패 시 나머지 자동 취소 — gather vs TaskGroup, CancelledError 처리 후 필수 조치**
- ✅ PASS
- 근거: "2. 동시 실행" 섹션 "언제 무엇을 쓰나" + "7. Task 취소" 핵심 규칙 + "10. 흔한 함정" 함정 6 + "12." 요약표
- 상세: "일부 실패 시 나머지 자동 취소 → TaskGroup(3.11+)" 정확히 답변, CancelledError는 정리 작업 후 반드시 `raise`로 재전파해야 한다는 규칙과 코드 예시까지 정확히 근거 제시

### 발견된 gap (2026-09-28 2차 재테스트)

- **[선택 보강, 비차단]** 11절 제목("Python 3.12+ 개선 사항")과 15행 안내 문구("3.13/3.14의 asyncio API 변경점은 11절") 사이에 어감 차이가 있고, 3.13/3.14 항목·3절의 free-threaded 설명이 각 1~2줄로 짧음 — 내용은 존재하고 정확하나 분량이 얇음. 11절 제목을 "Python 3.12+ 개선 사항 (3.13·3.14 포함)"으로 조정하거나 3.13/3.14 항목을 소제목으로 분리하면 가독성 향상 가능. broken cross-reference(내용 자체 부재)는 아니므로 차단 요인 아님

### 판정 (2026-09-28 2차 재테스트)

- agent content test: 2/2 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 (content test로 APPROVED 전환 가능한 카테고리)
- 최종 상태: NEEDS_REVISION → APPROVED (broken cross-reference가 실제로 해소됨을 확인, 잔여 지적은 선택 보강)

---

### 2단계 1차 재테스트 (2026-09-28)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (2개 병렬 호출)
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션·anti-pattern 회피 확인. 2026-09-26 재검증에서 정정된 부분(3.13/3.14 GA 사실 반영)을 겨냥한 질문 포함

**Q1. "Python 3.14 free-threaded 빌드에서 'to_thread/run_in_executor는 GIL을 우회하지 않는다'는 조언이 여전히 유효한가? 스킬 내용이 3.14에서도 유효한가?"**
- 🟡 PARTIAL
- 근거: "3. 동기 함수를 비동기에서 호출" 섹션 131행(GIL 우회 안 함 + free-threaded 대안 언급) / 상단 "대상 버전" 15행("3.14의 free-threaded 공식 지원·asyncio 스레드 안전성 강화는 11절 참조")
- 상세: GIL 관련 핵심 조언 자체는 정확히 답변됨(표준 빌드에서는 여전히 유효, free-threaded 빌드가 대안이라는 서술도 일관). 그러나 **15행이 "11절 참조"라고 전방 참조하는 "3.14 free-threaded 공식 지원·asyncio 스레드 안전성 강화" 내용이 실제 11절 본문(458-465행)에는 없음** — 11절은 eager task factory·`as_completed()`·`task.uncancel()`·`create_task(eager_start=True)`만 다룸. 테스트 에이전트가 이 불일치를 스스로 발견해 보고함(broken cross-reference).

**Q2. "TaskGroup 안에서 CancelledError를 잡아서 정리만 하고 넘어가려면? FastAPI 핸들러에서 asyncio.run() 호출 가능한가?"**
- ✅ PASS
- 근거: "7. Task 취소" 섹션(277-282행) + "함정 6"(437-454행) + "1. async/await 기본" 주의(45행) + "함정 5"(425-435행)
- 상세: CancelledError 재전파 필수 원칙, asyncio.run() FastAPI 핸들러 내 호출 금지 모두 정확히 근거와 함께 답변됨.

### 발견된 gap (2026-09-28)

- **[SKILL.md 보강 필요]** 상단 "대상 버전" 15행이 "3.14의 free-threaded 공식 지원·asyncio 스레드 안전성 강화는 11절 참조"라고 안내하지만, 11절("Python 3.12+ 개선 사항") 본문에는 해당 내용이 실제로 없음 — 이행되지 않은 전방 참조(broken cross-reference). 11절에 3.14 free-threaded/스레드 안전성 관련 문장을 추가하거나, 15행의 "11절 참조" 문구를 제거해야 함.

### 판정 (2026-09-28)

- agent content test: 1 PASS / 1 PARTIAL (2/2 중 1건 gap)
- verification-policy 분류: 라이브러리 사용법 스킬 (content test로 APPROVED 전환 가능한 카테고리이나, 이번 회차는 PARTIAL 발생으로 미전환)
- 최종 상태: NEEDS_REVISION (SKILL.md는 이번 세션에서 수정하지 않음 — 스킬-tester 원칙 4: FAIL/PARTIAL 시 사용자 보고 후 승인 하에 수정)

---

### 재검증 (2026-09-26)

**수행일**: 2026-09-26
**수행자**: 메인 대화 오케스트레이션 (Claude Sonnet 5) — verification-policy.md 재검증 절차
**수행 방법**: SKILL.md 전체 Read → WebSearch로 핵심 클레임 재대조 → 실전 질문 2개 자체 답변

**재검증한 핵심 클레임**
- Python 3.14 릴리스일 2025-10-07 — 신규 확인, SKILL.md 대상 버전 표기에 반영 (VERIFIED, python.org 공식)
- Python 3.14부터 asyncio가 free-threaded Python을 공식 지원(스레드 안전성 강화), `python -m asyncio ps/pstree` CLI 추가 — 신규 확인이나 본 SKILL.md 11절 "3.14: create_task(eager_start=True) 지원" 서술과 상충 없음, 추가 보강 여지는 있으나 기존 서술은 오류 아님 (VERIFIED)
- `asyncio.timeout()`/`TaskGroup`(3.11+) API 시그니처 — 재확인, 변동 없음 (VERIFIED)

**Q1. "지금(2026-09) 최신 Python에서 이 스킬 내용이 여전히 유효한가?"**
- PASS
- 근거: SKILL.md 상단 "대상 버전" 표기 — 3.13/3.14 GA 사실을 반영했고, 본문 API(TaskGroup·timeout·to_thread 등)는 3.11+ 전체에서 동일하게 유효함을 명시.

**Q2. "Python 3.14의 free-threaded 지원이 이 스킬의 GIL 관련 설명과 충돌하나?"**
- PASS
- 근거: SKILL.md "3. 동기 함수를 비동기에서 호출" 절의 "GIL을 우회하지 않는다... free-threaded Python 빌드를 사용" 문구가 이미 free-threaded 대안을 정확히 언급하고 있어 3.14 공식 지원과 상충하지 않음.

**판정**: 대상 버전 표기에 3.13/3.14 GA 사실 추가 → 내용 변경 있음 → status `PENDING_TEST`로 되돌림.

---

### 최초 테스트 (2026-05-15)

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
| 에이전트 활용 테스트 | ✅ (2026-05-15, 4/4 PASS) + ✅ (2026-09-26 재검증, 2/2 PASS — 3.13/3.14 GA 반영 확인) + ⚠️ (2026-09-28 1차 재테스트, 1 PASS/1 PARTIAL — broken cross-reference 발견) + ✅ (2026-09-28 2차 재테스트, 2/2 PASS — cross-reference 정정 확인) + ✅ (2026-09-28 3차 재테스트, 2/2 PASS — 선택 보강 반영분 §11 3.13/3.14 분리·§3 PEP 703/779 구분 확인) |
| **최종 판정** | **APPROVED** (2026-09-28 3차 재테스트로 선택 보강 반영분 content test 통과. 잔여 gap은 5절 예제 코드 미최신화, 선택 보강·비차단) |

> content test 가능 카테고리 (`verification-policy.md`의 "라이브러리 사용법 스킬"). skill-tester 통과 시 APPROVED 전환 가능.

---

## 7. 개선 필요 사항

- [✅] skill-tester 메인 호출 후 섹션 5·6 업데이트 (2026-05-15 완료, 4/4 PASS; 2026-09-28 1차 재테스트 1 PASS/1 PARTIAL; 2026-09-28 2차 재테스트 2/2 PASS로 해소)
- [✅] **(구 차단 요인, 해소됨)** 상단 15행 "3.14의 free-threaded 공식 지원·asyncio 스레드 안전성 강화는 11절 참조" 전방 참조가 11절 본문에 실제로 없던 문제 — 메인이 15행을 "3.13/3.14의 asyncio API 변경점은 11절, free-threaded 빌드와 CPU 바운드 처리는 3절 주의 참조"로 정정, 2026-09-28 2차 재테스트로 11절·3절에 실제 해당 내용이 있음을 확인
- [✅] (2026-09-28 반영) 11절 제목·3.13/3.14 항목 분량 보강 — 제목을 "Python 3.12+ 개선 사항 (3.13·3.14 포함)"으로 조정, 3.13/3.14를 소제목으로 분리해 각각 공식 문서 신규 항목(Queue.shutdown, TaskGroup 취소 개선, capture_call_graph/pstree 등) 추가, 3절 free-threading 서술도 PEP 703/779 구분해 보강 (근거: §5 "[2026-09-28] 선택 보강 반영")
- [✅] (2026-09-28 확인) 짝 스킬(`python-fastapi`, `python-anthropic-sdk`) 이미 생성 완료 — SKILL.md 16행 상호 참조로 충분, 추가 수정 불필요
- [✅] (2026-09-28 3차 재테스트 완료, 2/2 PASS) 선택 보강 반영분(11절 3.13/3.14 소제목 분리, 3절 PEP 703/779 구분) content test 수행 → §5 "2단계 3차 재테스트" 참조
- [❌] **(선택 보강, 비차단)** 5절 `asyncio.Queue` 생산자/소비자 예제에 3.13 `Queue.shutdown()`/`QueueShutDown` 코드 예시 미반영 — 서술(11절)과 실습 코드(5절) 간 정합성 gap. 차단 요인 아님, 향후 보강 시 반영 권장

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 — Python 3.12 기준, asyncio·httpx·PEP 492/525 통합 | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 time.sleep vs asyncio.sleep / Q2 to_thread vs run_in_executor / Q3 timeout vs wait_for 버전 분기 / Q4 CancelledError 재전파) → 4/4 PASS, APPROVED 전환 | skill-tester |
| 2026-09-26 | v1 | 재검증 — Python 3.13/3.14 GA 사실을 대상 버전에 반영(본문 API 서술은 변동 없음) → PENDING_TEST | 메인 오케스트레이션 (Claude Sonnet 5) |
| 2026-09-28 | v1 | 2단계 1차 재테스트 수행 (Q1 3.14 free-threaded+GIL / Q2 CancelledError 재전파+asyncio.run 금지) → 1 PASS/1 PARTIAL(15행-11절 broken cross-reference 발견) → NEEDS_REVISION (SKILL.md 미수정, 보고만) | skill-tester |
| 2026-09-28 | v1 | 메인이 상단 15행을 "3.13/3.14 API 변경점은 11절, free-threaded·CPU 바운드는 3절 주의"로 정정 | 메인 오케스트레이션 |
| 2026-09-28 | v1 | 2단계 2차 재테스트 수행 (Q1 15행↔11절/3절 참조 정합 확인 / Q2 TaskGroup·CancelledError 재전파) → 2/2 PASS, broken cross-reference 해소 확인 → NEEDS_REVISION → APPROVED 전환 | skill-tester |
| 2026-09-28 | v1 | **선택 보강 반영** — 2차 재테스트에서 발견된 선택 보강 항목(11절 제목·분량) 반영. 11절 제목에 "(3.13·3.14 포함)" 추가, 3.13/3.14를 소제목으로 분리해 공식 What's New 원문 기준 항목 보강(Queue.shutdown/QueueShutDown, TaskGroup 취소 개선, create_task `**kwargs`, capture_call_graph/print_call_graph, `python -m asyncio ps/pstree`, `loop.create_task(..., eager_start=None)` 3.14 변경 원문), 3절 free-threading 서술을 PEP 703(3.13 실험적)·PEP 779(3.14 공식 지원) 구분해 보강. 내용 추가로 status APPROVED → **PENDING_TEST**(메인이 skill-tester 재테스트 필요) | 메인 오케스트레이션 (Claude Sonnet 5) |
| 2026-09-28 | v1 | 2단계 3차 재테스트 수행 (Q1 Queue.shutdown()·TaskGroup 취소 개선 / Q2 free-threading PEP 703 vs 779) → 2/2 PASS, 선택 보강 반영분 content test 통과 → PENDING_TEST → **APPROVED** 전환 | skill-tester |
