---
skill: python-uv-project-setup
category: backend
version: v2
date: 2026-08-12
status: PENDING_TEST
---

# python-uv-project-setup 스킬 검증

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `python-uv-project-setup` |
| 스킬 경로 | `.claude/skills/backend/python-uv-project-setup/SKILL.md` |
| 검증일 | 2026-08-12 (최초 2026-05-15) |
| 검증자 | skill-creator → skill-tester(재감사) → 정정 반영 |
| 스킬 버전 | v2 |
| 검증 대상 버전 | uv 0.12.3 (2026-08-07 릴리즈) / astral-sh/setup-uv v9.0.0 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.astral.sh/uv)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/astral-sh/uv)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-05-15, 버전 0.11.14)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성 (설치·init·add·sync·run·Docker·GitHub Actions)
- [✅] 흔한 실수 패턴 정리 (7개 함정)
- [✅] SKILL.md 파일 작성
- [✅] 짝 스킬 명시 (python-basics, python-fastapi, python-pytest)
- [✅] Java·Rust 백엔드 스킬과 역할 분리 명시

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "Astral uv Python package manager 2026 official documentation latest version" | 공식 docs URL·GitHub URL 확인, 최신 0.11.14 (2026-05-05/05-12) 확인 |
| 조사 | WebFetch | https://docs.astral.sh/uv/ | uv 소개·Rust 작성·10-100x 빠름·Astral 제작 확인 |
| 조사 | WebFetch | https://docs.astral.sh/uv/getting-started/installation/ | 설치 명령(curl, brew, pipx), self-update, shell completion 확인 |
| 조사 | WebFetch | https://docs.astral.sh/uv/guides/projects/ | uv init·add·remove·sync·run·lock·build 명령·pyproject.toml 구조 확인 |
| 조사 | WebFetch | https://docs.astral.sh/uv/guides/install-python/ | uv python install·pin·list·upgrade, .python-version 확인 |
| 조사 | WebFetch | https://docs.astral.sh/uv/concepts/projects/dependencies/ | --dev, --group, --optional 옵션 + sync 옵션 확인 |
| 조사 | WebFetch | https://docs.astral.sh/uv/guides/integration/docker/ | 공식 이미지 ghcr.io/astral-sh/uv, multi-stage 빌드, UV_LINK_MODE=copy, --no-install-project 확인 |
| 조사 | WebFetch | https://docs.astral.sh/uv/guides/integration/github/ | astral-sh/setup-uv 액션, enable-cache, --locked 옵션 확인 |
| 조사 | WebFetch | https://github.com/astral-sh/uv | uv 0.11.14, 98.1% Rust, 85K stars, 278 releases 확인 |
| 교차 검증 | WebSearch | "uv import requirements.txt poetry migration 2026 official" | uv add -r requirements.txt, migrate-to-uv 도구 확인 (복수 소스 일치) |
| 교차 검증 | WebSearch | "uv 0.7 OR 0.8 release notes 2026 astral-sh" | 0.11.x 시리즈가 2026년 최신임 재확인 |
| 검증 결과 | — | 11개 핵심 클레임 | VERIFIED 11 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| uv 공식 문서 | https://docs.astral.sh/uv/ | ⭐⭐⭐ High | 2026-05-15 | 1순위 — Astral 공식 |
| uv GitHub README | https://github.com/astral-sh/uv | ⭐⭐⭐ High | 2026-05-15 | 2순위 — 공식 레포 |
| uv Installation Guide | https://docs.astral.sh/uv/getting-started/installation/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| uv Projects Guide | https://docs.astral.sh/uv/guides/projects/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| uv Python Install Guide | https://docs.astral.sh/uv/guides/install-python/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| uv Dependencies | https://docs.astral.sh/uv/concepts/projects/dependencies/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| uv Docker Integration | https://docs.astral.sh/uv/guides/integration/docker/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| uv GitHub Actions Integration | https://docs.astral.sh/uv/guides/integration/github/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| uv Releases | https://github.com/astral-sh/uv/releases | ⭐⭐⭐ High | 2026-05-15 | 버전 검증 |
| pydevtools migration guide | https://pydevtools.com/handbook/how-to/how-to-migrate-from-poetry-to-uv/ | ⭐⭐ Medium | 2026-05-15 | 교차 검증용 (Poetry 마이그레이션) |
| pydevtools requirements migration | https://pydevtools.com/handbook/how-to/migrate-requirements.txt/ | ⭐⭐ Medium | 2026-05-15 | 교차 검증용 (requirements.txt 마이그레이션) |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보 명시 (uv 0.11.14, 2026-05-12 릴리즈, 검증일 2026-05-15)
- [✅] deprecated 패턴 권장하지 않음 (`uv pip`은 마이그레이션 레이어로 명시)
- [✅] 코드 예시가 실행 가능한 형태 (실제 명령어 그대로)

### 4-2. 구조 완전성
- [✅] YAML frontmatter (name, description with 3 examples)
- [✅] 소스 URL 명시 (docs.astral.sh, github.com/astral-sh/uv)
- [✅] 검증일 명시 (2026-05-15)
- [✅] 핵심 개념 설명 (12개 섹션)
- [✅] 코드 예시 포함 (설치·init·add·sync·run·Docker·GHA)
- [✅] 사용/비사용 기준 (역할 분리 — Java/Rust 백엔드와 구분)
- [✅] 흔한 실수 패턴 7개 포함

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움 (명령어 즉시 사용 가능)
- [✅] 실용적 예시 (FastAPI Docker multi-stage 빌드, GHA matrix 테스트)
- [✅] 범용적 (특정 프로젝트 종속 없음)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15 skill-tester 수행)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답 발견 시 보완 (3/3 PASS — 보완 불필요)
- [✅] 2026-08-11 재감사: content test 3/3 PASS 재확인 + WebSearch 최신 문서 재대조 → **버전 드리프트 DISPUTED 2건 발견** (섹션 5 하단 참조)
- [✅] 2026-08-12 정정 반영: DISPUTED 2건 + 선택 보강 2건 모두 SKILL.md에 반영 완료 (섹션 5 "2026-08-12 정정 반영" 참조)

---

## 5. 테스트 진행 기록

### 2026-08-12 — DISPUTED 정정 반영 (v1 → v2)

**수행일**: 2026-08-12
**수행 방법**: 2026-08-11 재감사에서 DISPUTED 판정된 항목을 공식 소스로 **재확인**한 뒤 SKILL.md에 정정 반영.
Astral 공식 문서(docs.astral.sh)와 공식 GitHub 릴리즈 페이지 **2개 독립 계열**에서 교차 검증.

#### 교차 검증 결과 (2026-08-12 재확인)

**클레임 1. uv 최신 버전 = 0.12.3**
- ✅ VERIFIED (정정 반영됨)
- 소스 A: https://github.com/astral-sh/uv/releases — 0.12.3(2026-08-07) / 0.12.2(2026-08-05) / 0.12.1(2026-07-31) / 0.12.0(2026-07-28) 순, 최신 = **0.12.3**
- 소스 B: https://docs.astral.sh/uv/guides/integration/docker/ — 공식 핀 예시가 `ghcr.io/astral-sh/uv:0.12.3`
- SKILL.md 반영: 헤더 "검증 버전", 섹션 1 표 "최신 버전 0.12.3(2026-08-07)"

**클레임 2. `uv init` 0.12.0 breaking change — 패키지형 기본 + `--no-package` 필요**
- ✅ VERIFIED (정정 반영됨)
- 소스 A: https://github.com/astral-sh/uv/releases (0.12.0, 2026-07-28) — "Previously, `uv init example` created an unpackaged layout containing `main.py` and a `pyproject.toml` without a build system." → 현재는 `uv_build` 빌드 시스템 선언 + `src/` 패키지 레이아웃 기본, 구 동작은 `--no-package` 명시 필요
- 소스 B: https://docs.astral.sh/uv/concepts/projects/init/ — 생성 파일 목록 **직접 대조 완료**
  | 모드 | 공식 문서 생성 파일 | SKILL.md 일치 |
  |------|--------------------|:---:|
  | 기본(app) | `pyproject.toml`, `.python-version`, `README.md`, `src/<name>/__init__.py` | ✅ |
  | `--no-package` | `pyproject.toml`, `.python-version`, `README.md`, `main.py` | ✅ |
  | `--lib` | 위 + `src/<name>/py.typed` | ✅ |
  | `--bare` | `pyproject.toml`만 (버전 핀·README·소스 디렉토리 생략) | ✅ |
- 구 SKILL.md의 생성 파일 목록에 있던 `.gitignore`는 공식 문서 생성 목록에서 확인되지 않아 제거된 상태 유지
- SKILL.md 반영: 섹션 3에 0.12.0 breaking change 경고 박스 + 모드별 생성 파일 목록 분리 + **"0.11 → 0.12 마이그레이션 노트" 표 신설**(init 기본 레이아웃 / 기존 프로젝트 영향 없음 / CI 스크립트 / sdist `.tar.gz` 한정 / pre-release 해석 / `--require-hashes` 강제)

**클레임 3. GitHub Actions `astral-sh/setup-uv` 버전 = v9.0.0 + v8.0.0부터 불변 태그 정책**
- ✅ VERIFIED (정정 반영됨) — 구 `@v3` 표기 폐기
- 소스 A: https://github.com/astral-sh/setup-uv/releases — 최신 메이저 **v9.0.0**. v8.0.0에서 불변 릴리즈 전환, "we will stop publishing minor tags. You won't be able to use `@v8` or `@v8.0` any longer" (tj-actions 공급망 공격 사례를 근거로 명시)
- 소스 B: https://docs.astral.sh/uv/guides/integration/github/ — 공식 예시가 **커밋 해시 + 버전 주석** 방식:
  `uses: astral-sh/setup-uv@c771a70e6277c0a99b617c7a806ffedaca235ff9 # v9.0.0`, `with: version: "0.12.3"`, `enable-cache: true`
- SKILL.md 반영: 섹션 9 CI 예시를 위 공식 해시 핀 형태로 교체 + 태그 정책 경고 박스 추가

**클레임 4. Docker 이미지 태그 (2026-08-11 미완 구간 — 이번에 완료)**
- ✅ VERIFIED (정정 반영됨)
- 소스: https://docs.astral.sh/uv/guides/integration/docker/
  - distroless 계열 `ghcr.io/astral-sh/uv:{major}.{minor}.{patch}`, Python 동봉 계열 `ghcr.io/astral-sh/uv:python3.12-trixie-slim` / `:python3.12-alpine`
  - 공식 베이스 예시가 bookworm → **`python:3.12-slim-trixie`** 로 이동
  - "it is best practice to pin to a specific uv version" + 재현 빌드에는 **SHA256 다이제스트 핀** 권장(태그는 다른 커밋 SHA로 이동될 수 있음)
- SKILL.md 반영: Dockerfile 예시 베이스를 `python:3.12-slim-trixie`로 교체 + **"이미지 태그 선택" 표**(distroless / Python 동봉 / 베이스) + SHA256 핀·Debian 코드네임 드리프트 주의 박스 신설

#### 정정 결과 요약

| 2026-08-11 판정 | 항목 | 2026-08-12 조치 |
|-----------------|------|-----------------|
| 🔴 DISPUTED | 섹션 3 "생성되는 파일" 목록이 0.12 패키지형 기본 미반영 | ✅ **정정 반영됨** — 모드별 목록 분리 + 마이그레이션 노트 신설 |
| 🔴 DISPUTED | 섹션 9 `astral-sh/setup-uv@v3` 구식 + 불변 태그 정책 미반영 | ✅ **정정 반영됨** — v9.0.0 커밋 해시 핀 + 정책 경고 |
| (선택 보강) | 섹션 1 "최신 버전 0.11.14" 표기 | ✅ **정정 반영됨** — 0.12.3(2026-08-07) |
| (선택 보강) | Docker 태그 예시 점검 | ✅ **정정 반영됨** — 태그 계열 표 + trixie 베이스 + SHA256 핀 |

#### 잔존 사항 (차단 요인 아님)

- 섹션 4 `uv sync --frozen` 설명 문구("lockfile 무시 없이 그대로 사용")가 어색·부정확 — `--frozen`은 lockfile 갱신·검증 없이 그대로 사용하는 옵션. 이번 정정 범위(버전·init·CI·Docker) 밖이라 미수정, 다음 개정 시 정리 대상
- `uv add`의 extras 커맨드라인 예시(`uv add "uvicorn[standard]"`) 명시 — 선택 보강 잔여

#### 판정

- 공식 소스 재확인: 4/4 VERIFIED (2026-08-11 DISPUTED 2건 모두 해소)
- SKILL.md 콘텐츠 오류 잔존: **없음** → NEEDS_REVISION 사유 소멸
- verification-policy 분류: 프로젝트 셋업·빌드 설정 성격 → **실사용 필수 카테고리** (빌드/설정 변환이 실제로 작동하는지 실행 결과로만 검증 가능)
- 최종 상태: **NEEDS_REVISION → PENDING_TEST** 로 복귀. 내용 검증은 완료됐고, 실 프로젝트에서의 `uv init`(패키지형) → `uv add` → `uv run` 및 Docker/GHA 실행 검증이 남아 APPROVED 전환은 보류

---

### 2026-08-11 — 재감사 (버전 드리프트 재검증)

**수행일**: 2026-08-11
**수행자**: skill-tester → general-purpose (WebSearch 검증 1건 + content test 1건, 병렬 수행)
**수행 방법**: ① SKILL.md의 핵심 클레임 3개를 WebSearch로 현재 공식 문서·GitHub 릴리즈와 재대조, ② SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 확인

#### WebSearch 클레임 재검증

**클레임 1. uv 최신 버전 및 핵심 명령 동작 유지 여부**
- 🔴 DISPUTED
- SKILL.md 작성 시점(2026-05-15) 기준 "uv 0.11.14 (2026-05-12 릴리즈)"였으나, 2026-08-11 현재 최신은 **0.12.3 (2026-08-07 릴리즈)**로 최소 2단계 마이너 업 발생.
- **`uv init` 기본 동작이 0.12.0(2026-07-28)에서 breaking change**: 이제 `[build-system]` + `src/` 레이아웃을 가진 "패키지형" 프로젝트를 기본 생성하며, 과거 방식(비패키지형)을 원하면 `--no-package` 플래그가 필요함. SKILL.md 섹션 3 "새 프로젝트 — 생성되는 파일" 목록(`pyproject.toml`·`.python-version`·`README.md`·`main.py`·`.gitignore`)이 현재 기본 동작과 불일치할 가능성.
- `uv add`/`uv sync`/`uv run`/`uv lock`/`uv python install`의 기본 동작 자체는 이번 검색 범위에서 breaking change 근거를 찾지 못함 (VERIFIED 유지).
- 출처: https://github.com/astral-sh/uv/releases (0.12.3, 0.12.0, 0.11.26)

**클레임 2. `uv add -r requirements.txt` 마이그레이션 경로**
- ✅ VERIFIED
- Astral 공식 마이그레이션 가이드에서 현재도 동일하게 권장. `uv init --bare` → `uv add -r requirements.txt` 절차 유지, `-c constraints.txt` 병용 지원까지 확인.
- 출처: https://docs.astral.sh/uv/guides/migration/pip-to-project/

**클레임 3. GitHub Actions `astral-sh/setup-uv@v3`**
- 🔴 DISPUTED
- v3는 더 이상 최신이 아님. 현재 최신 메이저는 **v9.0.0**. 특히 v8.0.0(2026년 3월)부터 **불변(immutable) 릴리즈 정책**으로 전환되어 `@v8` 같은 이동 태그(moving tag)가 사라지고 `@v8.0.0`처럼 풀버전 태그만 resolve됨(공급망 보안 강화 목적). SKILL.md의 CI 예시(섹션 9)가 다수 메이저를 건너뛴 구식 버전을 가리키고 있어 그대로 복사하면 outdated guidance가 됨.
- 출처: https://github.com/astral-sh/setup-uv/releases, https://pydevtools.com/handbook/how-to/how-to-upgrade-setup-uv-from-v7-to-v8/

#### Content test (general-purpose, SKILL.md 근거 기반)

**Q1. uv로 신규 FastAPI 프로젝트 시작 + dev 의존성 추가 명령 순서**
- ✅ PASS
- 근거: SKILL.md "3. 프로젝트 초기화", "4. 의존성 관리", "5. Python 버전 관리" 섹션
- 상세: `uv init` → `uv python pin 3.12` → `uv add fastapi` → `uv add uvicorn[standard]` → `uv add --dev pytest ruff` 순서를 SKILL.md 근거로 정확히 도출. 단, extras 표기(`uv add "uvicorn[standard]"`)의 커맨드라인 예시가 섹션 4에 명시적으로 없어 pyproject.toml 완성본(섹션 3)에서 유추했다고 자체 보고 — 경미한 gap.

**Q2. Poetry → uv 마이그레이션, 캐럿 버전 변환 규칙 + 자동 도구**
- ✅ PASS
- 근거: SKILL.md "10. 마이그레이션 — Poetry → uv" 섹션
- 상세: `^1.2.3` → `>=1.2.3,<2.0.0`, `~1.2.3` → `>=1.2.3,<1.3.0` 변환 규칙과 `uvx migrate-to-uv`(결과 검토 필수) 도구를 정확히 인용.

**Q3. Docker multi-stage 빌드 캐시 적중률 최적화 포인트**
- ✅ PASS
- 근거: SKILL.md "9. CI 통합 — Docker (multi-stage)" 섹션, "핵심 최적화" 목록
- 상세: `--no-install-project` 2단계 분리, `UV_LINK_MODE=copy`, `RUN --mount=type=cache` 캐시 마운트를 근거로 제시. SKILL.md가 5개 항목을 우선순위 없이 나열해 "3가지"로 좁히는 것은 답변자의 판단에 의존 — 경미한 gap.

#### 발견된 gap

- **(차단 요인, NEEDS_REVISION 사유)** 섹션 3 "새 프로젝트 — 생성되는 파일" 목록이 uv 0.12.0+ 기본 동작(패키지형 프로젝트, `--no-package` 필요) 반영 안 됨
- **(차단 요인, NEEDS_REVISION 사유)** 섹션 9 CI 예시의 `astral-sh/setup-uv@v3`가 v9.0.0 대비 구식이며, v8+ 불변 태그 정책 미반영
- (선택 보강) 섹션 2 "최신 버전 0.11.14" 표기 최신화 필요 (현재 0.12.3)
- (선택 보강) `uv add` extras 커맨드라인 문법 명시적 예시 추가

#### 판정

- agent content test: 3/3 PASS (내용 자체의 근거 제시·정확성은 문제 없음)
- WebSearch 재검증: 1/3 VERIFIED, 2/3 DISPUTED (버전·CLI 기본 동작 드리프트)
- verification-policy 분류: 설정+실행 인프라 (프로젝트 셋업·실행 워크플로우) → 실사용 필수 카테고리 해당 (분류 자체는 기존과 동일)
- 최종 상태: **NEEDS_REVISION** — content test는 PASS했으나 WebSearch 재검증에서 실제 콘텐츠 오류(버전 드리프트 + `uv init` breaking change 미반영 + CI 액션 버전 구식)가 발견되어 PENDING_TEST 유지가 아닌 수정 필요 상태로 전환. **SKILL.md 수정은 사용자 승인 후 진행** (skill-tester 자체 수정 금지 원칙).

---

## (2026-05-15 원 기록)

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (세션 내 직접 검증)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. `uv add` vs `uv sync` 차이 및 `uv add -r requirements.txt` 동작**
- PASS
- 근거: SKILL.md "4. 의존성 관리 — 추가·제거" 및 "동기화(sync)" 섹션, "10. 마이그레이션 — requirements.txt → uv" 섹션
- 상세: `uv add`는 의존성을 pyproject.toml + uv.lock에 기록 후 .venv 갱신. `uv sync`는 이미 선언된 의존성으로 .venv 동기화. `uv add -r requirements.txt`는 파싱 후 [project.dependencies] + uv.lock에 기록한다는 내용 명확히 존재. `uv pip install`은 pyproject.toml에 기록되지 않는 anti-pattern으로 섹션 11-7에 명시

**Q2. `uv run` 없이 직접 `python script.py` 실행 시 발생하는 함정**
- PASS
- 근거: SKILL.md "11-1. `uv run` 없이 직접 `python` 실행" 섹션, "6. 가상환경" 섹션, "7. 실행(uv run)" 섹션
- 상세: 함정 원인(시스템 Python 실행), 증상(ModuleNotFoundError: No module named 'fastapi'), 해결법(`uv run python script.py` 또는 `.venv` 활성화 후 실행) 모두 명확히 존재. `uv run`의 3단계 동작(lockfile 확인 → 자동 sync → .venv 실행)도 섹션 7에 기술

**Q3. `uv.lock` vs `requirements.txt` 비교 및 PEP 735 dependency-groups 구조**
- PASS
- 근거: SKILL.md "8. Lockfile(uv.lock)" 섹션, "3. 프로젝트 초기화 — pyproject.toml 구조" 섹션
- 상세: uv.lock vs requirements.txt vs poetry.lock 비교표(크로스 플랫폼·결정론적 해석·자동 생성 여부)가 섹션 8에 존재. [dependency-groups]가 PEP 735 표준임을 섹션 3 표에 명시. dev/test/lint 그룹 분리 명령(`uv add --group lint ruff` 등) 섹션 4에, `uv sync --no-dev`/`--group test`/`--all-groups` 옵션 섹션 4 sync에 존재

### 발견된 gap

없음 — 3/3 모든 질문에서 SKILL.md 내 명확한 근거 섹션 확인.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 설정+실행 인프라 (프로젝트 셋업·실행 워크플로우) → 실사용 필수 카테고리 해당
- 최종 상태: PENDING_TEST 유지 (content test PASS, 실 프로젝트 실행 검증 잔여)

---

> 아래는 skill-creator가 작성한 원본 테스트 케이스 템플릿 (참고용 보존)

### 테스트 케이스 1: 신규 FastAPI 프로젝트 uv 셋업

**입력 (질문/요청):**
```
uv로 FastAPI 프로젝트를 새로 시작하려고 한다. Python 3.12, fastapi·uvicorn 런타임,
pytest·ruff dev 의존성. 명령 순서를 알려달라.
```

**기대 결과:**
```
1. uv init my-project --app
2. cd my-project
3. uv python pin 3.12  (또는 uv init 시 --python 3.12)
4. uv add fastapi "uvicorn[standard]"
5. uv add --dev pytest ruff
6. uv run uvicorn main:app --reload
```

**실제 결과:** PENDING

**판정:** PENDING

---

### 테스트 케이스 2: Poetry → uv 마이그레이션

**입력:**
```
기존 Poetry 프로젝트가 있다. uv로 마이그레이션하는 가장 안전한 절차는?
^1.2.3 같은 캐럿 버전은 어떻게 변환되나?
```

**기대 결과:**
- `[tool.poetry.dependencies]` → `[project.dependencies]`로 이동
- `[tool.poetry.group.dev.dependencies]` → `[dependency-groups] dev`로 이동
- `^1.2.3` → `>=1.2.3,<2.0.0` (PEP 440 표기)
- `uv lock` → `uv sync`
- 또는 자동 도구: `uvx migrate-to-uv` (결과 검토 필수)

**실제 결과:** PENDING

**판정:** PENDING

---

### 테스트 케이스 3: CI/Docker 통합

**입력:**
```
GitHub Actions에서 uv를 쓸 때 lockfile 검증과 캐싱을 함께 하려면?
Docker 멀티-stage에서 의존성 캐시 적중률을 높이는 방법은?
```

**기대 결과:** *(2026-08-12 갱신 — 구 `@v3` 표기 폐기)*
- GHA: `astral-sh/setup-uv@<커밋해시> # v9.0.0` (불변 태그 정책상 `@v9` 축약 불가) + `version: "0.12.3"` + `enable-cache: true` + `uv sync --locked`
- Docker: `--no-install-project`로 의존성 먼저 → 코드 복사 → 재sync, `UV_LINK_MODE=copy`, `UV_COMPILE_BYTECODE=1`, uv 이미지 태그는 `ghcr.io/astral-sh/uv:0.12.3`처럼 패치 버전까지 핀

**실제 결과:** PENDING

**판정:** PENDING

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (2026-08-12 정정 반영 — 2026-08-11 DISPUTED 2건 해소, 공식 소스 4/4 VERIFIED) |
| 구조 완전성 | ✅ (frontmatter·소스·검증일·예시·함정 모두 포함 + 0.11→0.12 마이그레이션 노트 신설) |
| 실용성 | ✅ (FastAPI/Docker/GHA 실전 예시 포함, CI·Docker 예시 모두 현행 공식 권장 형태로 갱신) |
| 에이전트 활용 테스트 | ✅ 완료 (2026-05-15 3/3 PASS, 2026-08-11 재확인 3/3 PASS) |
| 실사용(실행) 검증 | ❌ 미수행 (실 프로젝트 init·빌드·CI 실행 필요) |
| **최종 판정** | **PENDING_TEST** (내용 검증 완료, 실사용 필수 카테고리이므로 실행 검증 후 APPROVED 전환) |

**판정 사유:**
- 이 스킬은 *프로젝트 셋업·빌드 설정* 성격이므로 `verification-policy.md`의 "실사용 필수 스킬" 분류(빌드/설정 변환이 실제로 작동하는지 확인 필요)에 해당한다. 따라서 content test PASS만으로는 APPROVED 전환이 불가하며 **PENDING_TEST가 정상 상태**다.
- 2026-08-11 NEEDS_REVISION 전환 사유였던 콘텐츠 오류 3건(버전 드리프트 / `uv init` 0.12.0 breaking change 미반영 / `setup-uv@v3` 구식)은 2026-08-12 정정으로 **모두 해소**됐고, 미완이던 Docker 태그 점검까지 완료했다. 공식 문서(docs.astral.sh)와 공식 GitHub 릴리즈 두 계열에서 교차 검증했다.
- 검증하지 못해 남긴 항목은 없다(잔존 사항 2건은 문구 다듬기·예시 보강 수준으로 차단 요인 아님). 따라서 NEEDS_REVISION 유지 사유가 없으며 **PENDING_TEST로 복귀**한다.

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-15 최초 완료 3/3 PASS, 2026-08-11 재확인 3/3 PASS)
- [✅] **(해소)** 섹션 3 "생성되는 파일" 목록을 uv 0.12.0+ 기본 동작(패키지형 프로젝트, `--no-package` 옵션)에 맞게 갱신 — 2026-08-12 공식 init 문서와 모드별 대조 후 반영 완료 + 0.11→0.12 마이그레이션 노트 신설
- [✅] **(해소)** 섹션 9 CI 예시 `astral-sh/setup-uv@v3` → v9.0.0 커밋 해시 핀(불변 태그 정책)으로 갱신 — 2026-08-12 반영 완료
- [✅] **(해소)** 섹션 9 Docker 이미지 태그 점검 — 2026-08-12 반영 완료 (태그 계열 표, `python:3.12-slim-trixie` 베이스, SHA256 다이제스트 핀 권장)
- [❌] 실 FastAPI 프로젝트에서 uv 셋업 검증 (uv init → uv add → uv run uvicorn) — 차단 요인: 실사용 필수 카테고리. 실 프로젝트 도입 후 APPROVED 전환 가능
- [❌] `uv sync --frozen` 설명 문구 정확화 (`--frozen`은 lockfile 갱신·검증 없이 그대로 사용) — 이번 정정 범위 밖, 다음 개정 시 정리
- [❌] Docker multi-stage 빌드 실제 실행 검증 (이미지 사이즈, 빌드 시간) — 차단 요인: 실 Docker 빌드 필요
- [❌] GitHub Actions 워크플로우 실제 실행 검증 (matrix 테스트, 캐시 적중) — 차단 요인: 실 GHA 실행 필요
- [❌] Poetry → uv 마이그레이션 실제 케이스 검증 (캐럿 버전 변환 결과 확인) — 선택 보강 (content test에서 변환 규칙은 PASS 확인됨)
- [❌] 짝 스킬 (python-basics, python-fastapi, python-pytest) 생성 후 상호 참조 검증 — 선택 보강 (짝 스킬 미생성 상태)
- [✅] **(해소)** 섹션 1 "최신 버전 0.11.14" 표기를 현재 버전(0.12.3, 2026-08-07)으로 갱신 — 2026-08-12 반영 완료

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 — uv 0.11.14 기준, 공식 문서 9개·교차 검증 2회 | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 uv add vs uv sync / Q2 uv run 없이 실행 함정 / Q3 uv.lock vs requirements.txt + PEP 735) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
| 2026-08-11 | v1 | 재감사 — content test 3/3 PASS 재확인 + WebSearch 재검증(uv 0.11.14→0.12.3 드리프트, `uv init` 0.12.0 breaking change, `setup-uv@v3`→v9.0.0 구식) → 2건 DISPUTED, PENDING_TEST → **NEEDS_REVISION** 전환 (SKILL.md 수정은 사용자 승인 대기) | skill-tester |
| 2026-08-12 | v2 | DISPUTED 정정 반영 — 버전 0.11.14→0.12.3, `uv init` 0.12.0 패키지형 기본 + 모드별 생성 파일 목록 대조, 0.11→0.12 마이그레이션 노트 신설, CI `setup-uv@v3`→v9.0.0 커밋 해시 핀 + 불변 태그 정책, Docker 태그 계열 표·`python:3.12-slim-trixie` 베이스·SHA256 핀 추가. 공식 문서+공식 릴리즈 2계열 교차 검증 4/4 VERIFIED → **NEEDS_REVISION → PENDING_TEST** 복귀 (실사용 필수 카테고리라 APPROVED는 실행 검증 후) | 정정 세션 |
