---
skill: python-basics
category: backend
version: v1
date: 2026-05-15
status: APPROVED
---

# python-basics 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `python-basics` |
| 스킬 경로 | `.claude/skills/backend/python-basics/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 짝 스킬 | `backend/python-uv-project-setup` · `backend/python-pydantic-v2` |
| 카테고리 분류 | content test로 충분 (학습 자료 / 라이브러리 사용법) — `verification-policy.md` 기준 *실사용 필수 스킬 아님* |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.python.org Python 3.12 What's New, dataclasses, pathlib, typing, functools, contextlib)
- [✅] PEP 695 / PEP 570 / PEP 698 / PEP 701 원문 확인
- [✅] 최신 버전 기준 내용 확인 (Python 3.12 정식 + 3.13 신기능은 별도 표기)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (타입 힌트, dataclass, pathlib, functools, contextlib)
- [✅] 코드 예시 작성 (각 섹션 + 꿈 일기 통합 예시)
- [✅] 흔한 실수 패턴 정리 (mutable default, closure late binding, is vs ==, shallow vs deep copy)
- [✅] SKILL.md 파일 작성
- [✅] 짝 스킬 명시 (`python-uv-project-setup`, `python-pydantic-v2`)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | "Python 3.12 release notes PEP 695" | 공식 What's New + PEP 695 본문 확보 |
| 조사 2 | WebSearch | "Python 3.13 what's new release notes 2024" | 공식 What's New 3.13 + 릴리스 노트 확보 |
| 조사 3 | WebFetch | https://docs.python.org/3/whatsnew/3.12.html | PEP 695/701/698 코드 예시 추출 |
| 조사 4 | WebFetch | https://peps.python.org/pep-0695/ | 타입 매개변수 새 문법 비교 |
| 조사 5 | WebFetch | https://docs.python.org/3/library/dataclasses.html | @dataclass 파라미터, __post_init__, InitVar, KW_ONLY 등 |
| 조사 6 | WebFetch | https://docs.python.org/3/library/pathlib.html | Path 기본 연산, os.path 비교 |
| 조사 7 | WebSearch | "Python functools cache lru_cache partial 3.12" | partial이 3.12부터 class 구현, cache == lru_cache(None) 확인 |
| 조사 8 | WebSearch | "Python contextlib contextmanager decorator" | 제너레이터 기반 컨텍스트 매니저 패턴 |
| 조사 9 | WebSearch | "Python mutable default argument closure variable binding pitfalls" | 두 함정 + 해결법 확인 |
| 조사 10 | WebSearch | "Python positional only keyword only PEP 570" | `/` 와 `*` 의미·도입 버전 확인 |
| 조사 11 | WebSearch | "Fluent Python Luciano Ramalho 2nd edition" | 2022-05-10 O'Reilly, 1012쪽, 3.10 기준 확인 |
| 조사 12 | WebSearch | "Python match statement structural pattern matching 3.10 3.12" | PEP 634, 가드 절·dict/시퀀스 패턴 확인 |
| 교차 검증 | WebSearch + WebFetch | 11개 클레임, 독립 소스 2개 이상 | VERIFIED 11 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Python 3.12 What's New | https://docs.python.org/3/whatsnew/3.12.html | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 (1순위) |
| Python 3.13 What's New | https://docs.python.org/3/whatsnew/3.13.html | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| PEP 695 — Type Parameter Syntax | https://peps.python.org/pep-0695/ | ⭐⭐⭐ High | 2026-05-15 | 공식 PEP |
| PEP 570 — Positional-Only Parameters | https://peps.python.org/pep-0570/ | ⭐⭐⭐ High | 2026-05-15 | 공식 PEP |
| typing 표준 라이브러리 | https://docs.python.org/3/library/typing.html | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| dataclasses 표준 라이브러리 | https://docs.python.org/3/library/dataclasses.html | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| pathlib 표준 라이브러리 | https://docs.python.org/3/library/pathlib.html | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| functools 표준 라이브러리 | https://docs.python.org/3/library/functools.html | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| contextlib 표준 라이브러리 | https://docs.python.org/3/library/contextlib.html | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| Real Python (Protocol/typing) | https://realpython.com/python-protocol/ · https://realpython.com/python312-typing/ | ⭐⭐ Medium | 2026-05-15 | 2차 검증용 |
| Hitchhiker's Guide Gotchas | https://docs.python-guide.org/writing/gotchas/ | ⭐⭐ Medium | 2026-05-15 | mutable default·closure 함정 교차 검증 |
| O'Reilly Fluent Python 2nd Ed. | https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/ | ⭐⭐⭐ High | 2026-05-15 | 출판 정보 검증 (2022-05-10) |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Python 3.12 정식, 3.10/3.11/3.13 도입 기능은 라벨링)
- [✅] deprecated된 패턴을 권장하지 않음 (구 `TypeVar`/`Generic`은 호환용으로만 표기)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description + example 3개)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (12개 섹션)
- [✅] 코드 예시 포함 (섹션별 최소 1개 + 통합 꿈 일기 예시)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (짝 스킬 명시 + 적용 범위 0번 섹션)
- [✅] 흔한 실수 패턴 포함 (9장 4가지)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X, 꿈 일기 예시는 학습용 골격)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-05-15)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — 3/3 PASS, 보완 불필요

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (domain-specific 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. PEP 695 타입 매개변수 새 문법 + Self 타입 반환**
- 판정: PASS
- 근거: SKILL.md "1-1. PEP 695 — 타입 매개변수 새 문법 (3.12+)" 섹션 (`class Stack[T]:` 예시), "2-1. 자주 쓰는 타입" 섹션 (`Self` import + `Builder.add -> Self` 예시)
- 상세: `TypeVar`/`Generic` import 불필요 명시, 3.12+ 새 문법 "(권장)" 라벨, 구 문법은 호환용으로만 표기. `Self`는 `typing`에서 import하는 예시 포함. anti-pattern(3.12+에서 구 문법 권장) 없음.

**Q2. `frozen=True` + `slots=True` 조합 효과 + `__post_init__` 파생 필드 주의점**
- 판정: PASS
- 근거: SKILL.md "5-2. frozen=True + slots=True" 섹션 (효과 표 + 코드 예시), "5-3. __post_init__ — 파생 필드 계산" 섹션
- 상세: `frozen=True` → 불변·hashable, `slots=True` → 메모리 절약+속성 접근 빠름(3.10+) 표 완전 포함. 핵심 함정(`frozen=True` 상태에서 `self.area = ...` 직접 대입은 FrozenInstanceError → `object.__setattr__(self, "area", ...)` 사용 필요)이 `> 주의:` 블록으로 명시됨.

**Q3. mutable default argument 함정 — 함수와 dataclass 두 케이스**
- 판정: PASS
- 근거: SKILL.md "9-1. mutable default argument" 섹션 (함수 케이스 + None 가드 패턴), "5-1. 기본" 섹션 (`field(default_factory=list)` 패턴), 섹션 13 체크리스트
- 상세: 함수의 `bucket=[]` 함정과 None 가드 수정법 코드 예시 완전 포함. dataclass의 `tags: list[str] = field(default_factory=list)` 올바른 패턴 포함. "기본값은 함수 정의 시점에 1회만 평가된다" 이유 설명 포함.

### 발견된 gap

없음 — 3/3 PASS, SKILL.md 보강 불필요.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (학습 자료 / 라이브러리 사용법 — 실사용 필수 카테고리 아님)
- 최종 상태: APPROVED

---

> (아래는 기존 템플릿 참고용으로 보존)
> skill-tester 에이전트가 채우는 섹션. 메인 에이전트는 본 SKILL.md 작성 직후 skill-tester를 호출한다.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (3/3 PASS, 2026-05-15) |
| **최종 판정** | **APPROVED** |

> content test로 충분한 카테고리(학습 자료)이며 skill-tester agent content test 3/3 PASS 달성 → APPROVED 전환 완료 (`verification-policy.md` "실사용 검증이 필요 없는 스킬" 조항).

---

## 7. 개선 필요 사항

- [✅] skill-tester 호출 결과에 따라 본 verification.md 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS)
- [ ] Python 3.13 새 기능(JIT, free-threaded, TypeIs 등) 활용이 필요한 시점이 오면 별도 스킬 또는 본 스킬 v2로 보강 — **차단 요인 아님, 선택적 보강 과제**

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 — Python 3.12+ 기초 12개 섹션 + 꿈 일기 통합 예시 | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 PEP 695 타입 매개변수+Self / Q2 frozen+slots+__post_init__ / Q3 mutable default arg 함수·dataclass) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
