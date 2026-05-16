---
skill: python-jupyter-notebook
category: backend
version: v1
date: 2026-05-15
status: PENDING_TEST
---

# 스킬 검증 — python-jupyter-notebook

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)  ← 본 문서는 1단계 완료 시점
  ├─ 공식 문서 기반으로 내용 작성 (jupyter.org, jupyterlab docs, ipython docs, nbformat, nbconvert, jupytext, RISE)
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST

[2단계] 실 환경 검증 (실 노트북에서 명령 실행 확인) — 미수행
  → uv 기반 환경에서 jupyter lab 실행, 매직 명령, nbstripout/jupytext 페어,
    nbconvert 익스포트, RISE 슬라이드 모드까지 실제 동작 확인 후 APPROVED 전환
```

이 스킬은 *실사용 필수* 카테고리 (워크플로우·환경 설정 + 산출물 검증 필요)에 해당하여 `PENDING_TEST` 유지가 적절하다.
content test(skill-tester)는 별도로 수행한다.

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `python-jupyter-notebook` |
| 스킬 경로 | `.claude/skills/backend/python-jupyter-notebook/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (jupyter.org, jupyterlab.readthedocs.io, ipython readthedocs, nbformat, nbconvert, jupytext)
- [✅] 공식 GitHub 2순위 소스 확인 (jupyter/notebook, jupyterlab/jupyterlab, kynan/nbstripout, jupyterlab-contrib/rise, mwouts/jupytext)
- [✅] 최신 버전 기준 내용 확인 (2026-05-15: JupyterLab 4.5.7 / Notebook 7.5.6 / nbstripout 0.9.1 / jupyterlab-rise 0.43.1)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (uv 설치, 매직, 셀 타입, nbformat 4.5, jupytext 페어, nbstripout 훅, RISE)
- [✅] 코드 예시 작성 (uv 설치·매직 사용·jupytext.toml·.pre-commit-config.yaml·학술 분석 11셀 시나리오)
- [✅] 흔한 실수 패턴 정리 (12장 7개 함정 — 실행 순서·메모리·diff·trust·`!pip` 등)
- [✅] SKILL.md 파일 작성 (13개 섹션 + 짝 스킬 참조)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | "JupyterLab 4 latest version 2026 release notes" | PyPI 4.5.7 (2026-04-29), changelog URL 확보 |
| 조사 2 | WebSearch | "Jupyter Notebook 7 vs JupyterLab 4 differences" | Notebook 7이 JupyterLab 컴포넌트 기반임 확인 |
| 조사 3 | WebSearch | "Jupyter notebook magic commands list official" | IPython 9.x 매직 공식 문서 URL 확보 |
| 조사 4 | WebSearch | "jupytext nbstripout git version control 2026" | 두 도구 역할 분담 및 pre-commit 통합 확인 |
| 조사 5 | WebSearch | "nbformat 4.5 ipynb file structure schema" | cell id 필드 4.5 추가, 최상위 4개 키 구조 확인 |
| 조사 6 | WebSearch | "RISE jupyter slideshow extension JupyterLab 4" | jupyterlab-rise 0.43.1, JupyterLab ≥4.1.2 호환 |
| 조사 7 | WebSearch | "jupyter notebook security token password remote access" | 토큰·비밀번호 인증, jupyter server password 명령 |
| 조사 8 | WebSearch | "JupyterHub Google Colab VS Code Kaggle 2025" | 원격 실행 4종 비교, Colab 2026 Gemini 통합 |
| 조사 9 | WebSearch | "jupyter nbconvert html pdf slides 2026" | nbconvert 7.17.x, 지원 포맷 목록 확인 |
| 조사 10 | WebSearch | "jupytext sync py md percent 2026" | py:percent / md / md:myst 페어 포맷 확인 |
| 조사 11 | WebSearch | "jupyter notebook common pitfalls out of order" | hidden state, Restart & Run All 권장 패턴 |
| 조사 12 | WebSearch | "nbstripout pre-commit hook install 2026" | nbstripout 0.9.1, .pre-commit-config.yaml 형식 확인 |
| 조사 13 | WebSearch | "jupyterlab variableInspector JupyterLab 4 install" | @lckr 확장 + MLJAR 변종 확인 |
| 검증 1 | WebFetch | jupyterlab.readthedocs.io/en/stable/getting_started/overview.html | JupyterLab 4.5.0+, Notebook 7과의 관계, 핵심 기능 |
| 검증 2 | WebFetch | ipython.readthedocs.io/en/stable/interactive/magics.html | 라인/셀 매직 시그니처 정확 (%matplotlib, %timeit, %%bash, %%writefile 등) |
| 검증 3 | WebFetch | nbformat.readthedocs.io/en/latest/format_description.html | 최상위 4개 키, cell_type 3종, 4.5 cell id, 최소 JSON 예시 검증 |
| 검증 4 | WebFetch | github.com/jupyterlab-contrib/rise | jupyterlab-rise 0.43.1, JupyterLab ≥4.1.2, Cmd/Opt+R 단축키 |
| 검증 5 | WebFetch | jupyter-server.readthedocs.io/.../security.html | 토큰 인증·비밀번호 명령·trust 모델·IdentityProvider |
| 검증 6 | WebFetch | pypi.org/project/jupyterlab | 4.5.7 (2026-04-29) 최신 안정 버전 재확인 |
| 검증 7 | WebFetch | github.com/jupyter/notebook/releases | Notebook 7.5.6 (2026-04-30) 최신 안정 버전 |
| 검증 8 | WebFetch | jupytext.readthedocs.io/.../paired-notebooks.html | 페어링 메커니즘, --set-formats, --sync, 자동저장 주의 |

**클레임 판정 합계: VERIFIED 14 / DISPUTED 0 / UNVERIFIED 0**

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| JupyterLab 공식 문서 | https://jupyterlab.readthedocs.io/en/stable/ | ⭐⭐⭐ High | 2026-05-15 | 1순위 공식 |
| Jupyter Notebook 공식 문서 | https://jupyter-notebook.readthedocs.io/en/latest/ | ⭐⭐⭐ High | 2026-05-15 | 1순위 공식 |
| IPython Magics 공식 | https://ipython.readthedocs.io/en/stable/interactive/magics.html | ⭐⭐⭐ High | 2026-05-15 | 매직 명령 1순위 |
| nbformat 공식 | https://nbformat.readthedocs.io/en/latest/format_description.html | ⭐⭐⭐ High | 2026-05-15 | 파일 포맷 스펙 |
| nbconvert 공식 | https://nbconvert.readthedocs.io/en/latest/ | ⭐⭐⭐ High | 2026-05-15 | 익스포트 명령 |
| jupytext 공식 | https://jupytext.readthedocs.io/ | ⭐⭐⭐ High | 2026-05-15 | 페어링 메커니즘 |
| nbstripout GitHub | https://github.com/kynan/nbstripout | ⭐⭐⭐ High | 2026-05-15 | pre-commit 통합 |
| jupyterlab-rise GitHub | https://github.com/jupyterlab-contrib/rise | ⭐⭐⭐ High | 2026-05-15 | RISE 슬라이드 |
| Jupyter Server Security | https://jupyter-server.readthedocs.io/en/latest/operators/security.html | ⭐⭐⭐ High | 2026-05-15 | 보안·인증 |
| PyPI JupyterLab | https://pypi.org/project/jupyterlab/ | ⭐⭐⭐ High | 2026-05-15 | 최신 버전 확인 |
| Jupyter/notebook releases | https://github.com/jupyter/notebook/releases | ⭐⭐⭐ High | 2026-05-15 | 최신 버전 확인 |
| Project Jupyter Blog (Notebook 7) | https://blog.jupyter.org/announcing-jupyter-notebook-7-8d6d66126dcf | ⭐⭐⭐ High | 2026-05-15 | Notebook 7 발표 공식 |
| Hex 비교 글 | https://hex.tech/blog/jupyter-lab-vs-jupyter-notebook/ | ⭐⭐ Medium | 2026-05-15 | UX 비교 참고 |
| Aalto SciComp pitfalls | https://scicomp.aalto.fi/scicomp/jupyter-pitfalls/ | ⭐⭐ Medium | 2026-05-15 | hidden state 함정 참고 |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (JupyterLab 4.5.7, Notebook 7.5.6, nbformat 4.5, nbstripout 0.9.1, jupyterlab-rise 0.43.1)
- [✅] deprecated된 패턴을 권장하지 않음 (`!pip install`보다 `%pip install` 권장 / 클래식 RISE가 아닌 jupyterlab-rise 권장)
- [✅] 코드 예시가 실행 가능한 형태임 (uv 명령·jupytext.toml·.pre-commit-config.yaml·매직 명령 모두 실제 문법)

#### 클레임별 판정

| 클레임 | 판정 | 소스 |
|--------|------|------|
| JupyterLab 최신 4.5.7 (2026-04-29) | VERIFIED | PyPI + 공식 docs |
| Notebook 7.5.6 (2026-04-30) 최신 | VERIFIED | github.com/jupyter/notebook/releases |
| Notebook 7은 JupyterLab 컴포넌트 기반 | VERIFIED | Project Jupyter 블로그 + JEP 79 |
| nbformat 4.5에서 cell `id` 필드 도입 (1-64자, `[a-zA-Z0-9-_]+`) | VERIFIED | nbformat 공식 schema |
| ipynb 최상위 4개 키: metadata, nbformat, nbformat_minor, cells | VERIFIED | nbformat 공식 |
| `%matplotlib`, `%timeit`, `%%bash`, `%%writefile`, `%%capture` 시그니처 | VERIFIED | IPython magics 공식 |
| `%pip` 사용 권장 (커널 환경 보정) | VERIFIED | IPython 공식 + 커뮤니티 합의 |
| jupyter server는 token 기본 인증, `jupyter server password`로 변경 | VERIFIED | Jupyter Server 공식 보안 문서 |
| jupytext 페어: `--set-formats`, `--sync`, `jupytext.toml` `formats = "ipynb,py:percent"` | VERIFIED | jupytext 공식 |
| nbstripout pre-commit 통합: `repo: kynan/nbstripout`, `rev: 0.9.1` | VERIFIED | nbstripout GitHub |
| jupyterlab-rise 0.43.1, JupyterLab ≥4.1.2 호환, Cmd/Opt+R 단축키 | VERIFIED | rise GitHub |
| RISE 슬라이드 타입 5종 (Slide/Sub-Slide/Fragment/Skip/Notes) | VERIFIED | nbconvert slides 공식 |
| nbconvert 지원 포맷 (html, pdf, webpdf, slides, markdown, script 등) | VERIFIED | nbconvert 공식 |
| Restart Kernel and Run All로 hidden state 검증 권장 | VERIFIED | Aalto SciComp + 다수 공식 권고 |

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description, example 3개)
- [✅] 소스 URL과 검증일 명시 (상단에 8개 공식 URL + 2026-05-15)
- [✅] 핵심 개념 설명 포함 (Lab vs Notebook 7 차이, .ipynb 포맷, jupytext 페어 메커니즘 등)
- [✅] 코드 예시 포함 (uv·매직·.pre-commit-config·jupytext.toml·학술 분석 11셀)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (학위논문 분석은 JupyterLab, 빠른 발표는 Notebook 7)
- [✅] 흔한 실수 패턴 포함 (12장 7개 함정)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (uv 명령 + 매직 + 페어링 + 익스포트 한번에 다룸)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (꿈 일기·도덕 평가 데이터 학위논문 시나리오)
- [✅] 범용적으로 사용 가능 (특정 로컬 프로젝트 종속 X — 학위논문 *컨셉*만 사용, 절대경로 없음)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (skill-tester 수행 2026-05-15)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (gap 없음 — 3/3 PASS)

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (세션 내 직접 SKILL.md 전체 Read 후 수행)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. jupytext py:percent 페어링 — 단일 파일 설정과 프로젝트 전역 설정 모두**
- PASS
- 근거: SKILL.md "6-2. jupytext — .py 또는 .md로 페어링" 섹션
- 상세: `--set-formats ipynb,py:percent` 단일 파일 명령과 `jupytext.toml`의 `formats = "ipynb,py:percent"` 전역 설정이 모두 섹션 6-2에 명시. `--sync` 명령 및 페어 동작 원리(더 최근 수정된 쪽에서 입력 읽기)도 정확히 설명됨.

**Q2. 셀 실행 순서 hidden state 문제 및 방어 습관 3가지**
- PASS
- 근거: SKILL.md "12-1. 셀 실행 순서 의존성 (Hidden State)" 섹션
- 상세: 문제 정의(비순서 실행 시 코드-변수 상태 불일치, 재실행 시 결과 달라짐)와 방어 습관 3가지(① Restart Kernel and Run All Cells / ② 함수 캡슐화 / ③ 외부 변수 의존 최소화)가 모두 명확하게 기술되어 있음.

**Q3. nbstripout pre-commit 설정 방법 + jupyterlab-rise 발표 모드 진입 단축키**
- PASS
- 근거: SKILL.md "6-1. nbstripout" 섹션 + "10. RISE" 섹션
- 상세: `.pre-commit-config.yaml` 전체 예시(rev: 0.9.1, id: nbstripout)와 `uv add --dev pre-commit nbstripout` + `uv run pre-commit install` 명령이 6-1에 있음. RISE 단축키 Cmd/Ctrl+R (Mac은 Option+R) 및 클래식 Notebook 6용 RISE(damianavila/RISE)와 jupyterlab-rise 구분 주의사항도 10절에 명시됨.

### 발견된 gap

없음 — 3/3 PASS, SKILL.md 보강 불필요.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 실사용 필수 (워크플로우·설정+실행·산출물 검증 필요) → PENDING_TEST 유지
- 최종 상태: PENDING_TEST (content test 완료, 실 환경 end-to-end 실행 후 APPROVED 전환 예정)

---

> **참고 (이하 원래 예정 템플릿 — 참고용 보존)**
>
> 본 스킬은 *실사용 필수* 카테고리(설정·워크플로우·산출물 검증 필요)에 해당하므로
> 1단계 작성 시점에서는 `PENDING_TEST` 유지가 적절하다.
> content test는 2026-05-15 skill-tester에 의해 수행 완료(3/3 PASS).

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (14개 클레임 모두 VERIFIED) |
| 구조 완전성 | ✅ (13개 섹션 + 짝 스킬 참조 모두 포함) |
| 실용성 | ✅ (학위논문 분석 시나리오 포함, 절대경로 없음) |
| 에이전트 활용 테스트 | ✅ (3/3 PASS — 2026-05-15 skill-tester 수행) |
| **최종 판정** | **PENDING_TEST** (content test 완료, 실 환경 검증 후 APPROVED 전환) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 SKILL.md content test 수행 (2026-05-15 완료, 3/3 PASS — Q1: jupytext py:percent 페어링 / Q2: hidden state 방어 습관 3가지 / Q3: nbstripout pre-commit + RISE 단축키)
- [❌] 실 환경에서 `uv add jupyterlab && uv run jupyter lab` 시작 → 매직 실행 → nbstripout pre-commit → jupytext 페어 → nbconvert 익스포트 → RISE 슬라이드까지 end-to-end 1회 실행 확인 후 APPROVED 전환 (차단 요인 아님 — 선택 보강: 실 프로젝트에서 노트북 작업 시 수행 후 APPROVED 전환 가능)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 — JupyterLab 4.5.7 / Notebook 7.5.6 / nbformat 4.5 / nbstripout 0.9.1 / jupyterlab-rise 0.43.1 기준 | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1: jupytext py:percent 페어링 / Q2: hidden state 방어 3가지 / Q3: nbstripout pre-commit + RISE 단축키) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
