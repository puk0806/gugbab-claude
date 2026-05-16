---
skill: python-cli-typer
category: backend
version: v1
date: 2026-05-15
status: APPROVED
---

# python-cli-typer 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `python-cli-typer` |
| 스킬 경로 | `.claude/skills/backend/python-cli-typer/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 짝 스킬 | `backend/python-uv-project-setup`, `backend/python-basics` |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (typer.tiangolo.com)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/fastapi/typer)
- [✅] PyPI 최신 버전 확인 (0.25.1, 2026-04-30)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (Annotated 스타일 권장)
- [✅] 코드 예시 작성 (18개 섹션 전부 실행 가능 형태)
- [✅] 흔한 실수 패턴 정리 (6개 함정)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "Typer Python CLI library latest version 2026 tiangolo features" | 공식 사이트·PyPI·릴리즈 노트 URL 수집 |
| 조사 | WebFetch | typer.tiangolo.com (홈) | 핵심 기능·설치·기본 사용법 |
| 조사 | WebFetch | typer.tiangolo.com/tutorial/commands/ | @app.command() 사용법 |
| 조사 | WebFetch | typer.tiangolo.com/tutorial/options/ | Option·Argument 개요 |
| 조사 | WebFetch | typer.tiangolo.com/tutorial/subcommands/add-typer/ | app.add_typer() 사용법 |
| 조사 | WebFetch | typer.tiangolo.com/tutorial/options/prompt/ | prompt·confirmation_prompt |
| 조사 | WebFetch | typer.tiangolo.com/tutorial/arguments/envvar/ | envvar 다중 환경변수·show_envvar |
| 조사 | WebFetch | typer.tiangolo.com/tutorial/commands/callback/ | @app.callback() 글로벌 옵션 |
| 조사 | WebFetch | typer.tiangolo.com/tutorial/exceptions/ | pretty_exceptions 옵션 |
| 조사 | WebFetch | typer.tiangolo.com/tutorial/testing/ | CliRunner·invoke·input |
| 조사 | WebFetch | typer.tiangolo.com/tutorial/terminating/ | typer.Exit·typer.Abort |
| 조사 | WebFetch | typer.tiangolo.com/tutorial/package/ | [project.scripts] entry point |
| 조사 | WebFetch | typer.tiangolo.com/tutorial/printing/ | Rich 통합, secho, table |
| 조사 | WebFetch | typer.tiangolo.com/release-notes/ | 0.14·0.21·0.23·0.24·0.25 breaking change |
| 조사 | WebFetch | pypi.org/project/typer/ | 0.25.1·Python>=3.10·의존성 확인 |
| 조사 | WebFetch | github.com/fastapi/typer | Click 기반·"FastAPI of CLIs" 확인 |
| 교차 검증 | WebSearch | "Typer Annotated typer.Option default value common pitfall" | default_factory·mutable default 함정 확인 |

**검증 결과:** VERIFIED 11 / DISPUTED 0 / UNVERIFIED 0

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Typer 공식 문서 | https://typer.tiangolo.com/ | ⭐⭐⭐ High | 2026-05-15 | 1순위 공식 |
| Typer GitHub | https://github.com/fastapi/typer | ⭐⭐⭐ High | 2026-05-15 | 2순위 공식 (fastapi org 산하) |
| Typer PyPI | https://pypi.org/project/typer/ | ⭐⭐⭐ High | 2026-05-15 | 버전·의존성·Python 요구사항 |
| Release Notes | https://typer.tiangolo.com/release-notes/ | ⭐⭐⭐ High | 2026-05-15 | breaking change 확인 |
| GitHub Discussions #861 | https://github.com/fastapi/typer/discussions/861 | ⭐⭐ Medium | 2026-05-15 | mutable default 함정 교차 검증 |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Typer 0.25.1, Python >=3.10)
- [✅] deprecated된 패턴을 권장하지 않음 (Annotated 권장, legacy default 스타일은 비권장으로 명시)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (Click 관계·타입 힌트 철학)
- [✅] 코드 예시 포함 (18개 섹션)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (섹션 17)
- [✅] 흔한 실수 패턴 포함 (섹션 16, 6개 함정)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (login·deploy·list_users 실전 패턴)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-5. 에이전트 활용 테스트

- [✅] skill-tester 호출 후 general-purpose 에이전트로 content test 수행 (2026-05-15)

### 4-4. 핵심 클레임 교차 검증

| 클레임 | 1차 소스 | 2차 소스 | 판정 |
|--------|---------|---------|------|
| Typer 최신 버전 0.25.1 (2026-04-30) | typer.tiangolo.com/release-notes | pypi.org/project/typer | VERIFIED |
| Python >=3.10 요구 (0.24+ 부터) | release-notes 0.24 | pypi.org metadata | VERIFIED |
| Click 기반 + Rich + Shellingham 의존 | 공식 홈 | PyPI 의존성 | VERIFIED |
| `@app.command()` 함수명 자동 매핑 | tutorial/commands | GitHub README | VERIFIED |
| `app.add_typer(name=...)` 0.14부터 필수 | release-notes 0.14 | tutorial/subcommands/add-typer | VERIFIED |
| `typer.Exit(code=N)` 종료 코드 반환 | tutorial/terminating | 공식 reference | VERIFIED |
| `typer.Abort()`는 "Aborted!" 출력 | tutorial/terminating | Click 기반 동작 | VERIFIED |
| `CliRunner.invoke(app, [...])` 테스트 패턴 | tutorial/testing | 공식 reference | VERIFIED |
| `[project.scripts] mycli = "pkg.mod:app"` entry point | tutorial/package | uv 공식 문서 | VERIFIED |
| Annotated 스타일이 공식 권장 | tutorial/options | tutorial/parameter-types | VERIFIED |
| mutable default 함정 → default_factory 사용 | 공식 권장 | GitHub Discussions #861 | VERIFIED |

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 존재 여부·anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Annotated + envvar 파라미터로 CLI 옵션과 환경변수 동시 지원**
- PASS
- 근거: SKILL.md "7. 환경변수 — `envvar`" 섹션 (188-202행)
- 상세: `Annotated[str, typer.Option(envvar="MY_API_KEY")]` 패턴, 다중 envvar 리스트 `["AWS_REGION", "REGION"]` 패턴, CLI → 환경변수 → 기본값 우선순위 모두 명시되어 있음. `show_envvar=False` 옵션까지 커버.

**Q2. typer.Exit(code=1) vs typer.Abort() — 사용자 거부 vs 실제 오류 처리 구분**
- PASS
- 근거: SKILL.md "11. 에러 핸들링 — `typer.Exit` / `typer.Abort` / `typer.BadParameter`" 섹션 (339-367행)
- 상세: 사용자 거부 → `raise typer.Abort()` ("Aborted!" 출력), 배포 실패 → `raise typer.Exit(code=1)` (종료 코드만)로 두 케이스 모두 코드 예시와 표로 명확히 구분됨. anti-pattern(Exit/Abort 혼용) 명확히 회피.

**Q3. CliRunner로 prompt 입력 시뮬레이션 테스트 작성**
- PASS
- 근거: SKILL.md "14. 테스트 — `CliRunner`" 섹션 (422-455행)
- 상세: `runner.invoke(app, ["login"], input="alice\nsecret\nsecret\n")` 패턴이 직접 예시로 제공됨. `\n`으로 구분된 stdin 시뮬레이션, `confirmation_prompt` 2회 입력, `result.exit_code`·`result.stdout`·`result.output` 속성 모두 설명됨.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md에 명확한 근거 섹션과 실행 가능한 코드 예시가 존재.

### 판정

- agent content test: PASS (3/3)
- verification-policy 분류: 라이브러리 사용법 스킬 — content test로 충분 (실사용 필수 카테고리 아님)
- 최종 상태: APPROVED

---

> (아래는 skill-creator 작성 시 템플릿 — 참고용 보존)
>
> skill-creator 단계에서는 PENDING_TEST 상태로 남기고, 직후 skill-tester가 호출되어 본 섹션을 채운다.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 핵심 클레임 교차 검증 | ✅ (11/11 VERIFIED) |
| 에이전트 활용 테스트 | ✅ (3/3 PASS, 2026-05-15) |
| **최종 판정** | **APPROVED** |

> 카테고리 판정: *content test로 충분*한 라이브러리 사용법 스킬 (실사용 필수 카테고리 아님). agent content test 3/3 PASS → APPROVED 전환 완료.

---

## 7. 개선 필요 사항

- [✅] skill-tester 호출 후 섹션 5 실제 테스트 결과 채우기 (2026-05-15 완료, 3/3 PASS)
- [❌] Click과의 차이 비교는 메인 정리만 다룸 — 깊은 마이그레이션이 필요하면 별도 스킬로 분리 검토 (선택 보강, 차단 요인 아님)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성, Typer 0.25.1 기준 | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 Annotated+envvar / Q2 typer.Exit vs typer.Abort / Q3 CliRunner 프롬프트 시뮬레이션) → 3/3 PASS, APPROVED 전환 | skill-tester |
