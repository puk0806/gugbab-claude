---
name: python-jupyter-notebook
description: >
  Jupyter Notebook + JupyterLab 4.x — 데이터 탐색·학위논문 분석·실험 환경.
  설치(uv) / 매직 명령 / 셀 타입 / .ipynb 포맷 / 버전 관리(jupytext·nbstripout) /
  원격 실행(JupyterHub·Colab·Kaggle·VS Code) / RISE 슬라이드 / 학술 워크플로우 / 흔한 함정.
  <example>사용자: "JupyterLab과 Notebook 7 중 뭘 써야 해?"</example>
  <example>사용자: "꿈 일기 데이터를 jupyter에서 탐색하고 통계 분석하려면?"</example>
  <example>사용자: "ipynb를 git으로 관리할 때 diff가 지저분한데 어떻게?"</example>
---

# Python Jupyter Notebook / JupyterLab

> 소스:
> - https://jupyter.org/ , https://jupyterlab.readthedocs.io/en/stable/
> - https://jupyter-notebook.readthedocs.io/en/latest/
> - https://ipython.readthedocs.io/en/stable/interactive/magics.html
> - https://nbformat.readthedocs.io/en/latest/format_description.html
> - https://nbconvert.readthedocs.io/en/latest/
> - https://jupytext.readthedocs.io/en/latest/
> - https://github.com/kynan/nbstripout
> - https://github.com/jupyterlab-contrib/rise
>
> 검증일: 2026-05-15
> 검증 버전: JupyterLab 4.5.7 (2026-04-29) · Notebook 7.5.6 (2026-04-30) · nbformat 4.5 · jupytext 1.x · nbstripout 0.9.1 · jupyterlab-rise 0.43.1

---

## 1. JupyterLab vs Jupyter Notebook 7 — 무엇을 쓸까

Jupyter Notebook 6 (Classic)은 유지 보수 모드(보안 패치만)이며, **Notebook 7부터는 JupyterLab 컴포넌트 위에 재구축**되었다. 즉 *둘 다 JupyterLab 코드베이스를 공유*하고 UX만 다르다.

| 항목 | JupyterLab 4.x | Notebook 7.x |
|------|----------------|--------------|
| 최신 버전 (2026-05-15) | **4.5.7** (2026-04-29) | **7.5.6** (2026-04-30) |
| 기반 | JupyterLab 코어 | JupyterLab 컴포넌트 (Notebook 7부터) |
| UI | 멀티 패널(IDE형) — 파일 탐색기·터미널·CSV·노트북 동시 열기 | 단일 문서 중심 (Classic UX) — 노트북 1개 = 탭 1개 |
| 확장 생태계 | 성숙 — 디버거·Git·LSP 등 다수 | JupyterLab 확장 대부분 호환되나 *JupyterLab 우선 테스트* |
| 적합한 경우 | 복잡한 데이터 분석, 다중 파일 워크플로우, 디버깅 | 빠른 프로토타이핑, 강의 자료, 단일 노트북 발표 |
| 메모리 사용 | 더 큼 | 가벼움 |

**둘은 함께 깔린다.** `pip install jupyterlab notebook` 후 한쪽이 실행 중이면 다른 쪽 UX도 자동 enable되어, URL의 `/lab` ↔ `/tree` 만 바꿔서 전환 가능하다.

**학위논문 분석 권장:** *JupyterLab 4.x* (변수 인스펙터·디버거·터미널·CSV 뷰어 통합이 학술 작업에 유리). 발표용 슬라이드 변환에만 RISE 사용.

---

## 2. 설치 — uv 기반

이 프로젝트는 `python-uv-project-setup` 스킬을 따라 **uv**로 패키지를 관리한다.

```bash
# 새 프로젝트 시작
uv init thesis-analysis
cd thesis-analysis

# JupyterLab + 분석 의존성 추가
uv add jupyterlab pandas numpy matplotlib seaborn

# 실행 — uv가 가상환경 자동 활성화
uv run jupyter lab          # JupyterLab UI
uv run jupyter notebook     # Notebook 7 UI (notebook 패키지 추가 시)

# 특정 IP·포트로 실행 (예: 원격 접속)
uv run jupyter lab --ip=0.0.0.0 --port=8888 --no-browser
```

**커널 등록 (uv 가상환경을 Jupyter에 등록):**

```bash
uv add ipykernel
uv run python -m ipykernel install --user --name=thesis-analysis \
  --display-name "Python (thesis-analysis)"
```

> 짝 스킬: `backend/python-uv-project-setup`, `backend/python-pandas-fundamentals`, `backend/python-data-visualization`

---

## 3. 매직 명령 (IPython Magics)

**라인 매직 `%`** = 한 줄에 적용 / **셀 매직 `%%`** = 셀 전체에 적용 / **`!`** = 쉘 명령 한 줄.

### 자주 쓰는 라인 매직

| 명령 | 용도 | 예시 |
|------|------|------|
| `%matplotlib` | matplotlib 백엔드 설정 | `%matplotlib inline` (정적) / `%matplotlib widget` (인터랙티브) |
| `%timeit` | 짧은 코드 벤치마크 (다회 반복 평균) | `%timeit sum(range(1000))` |
| `%run` | .py 스크립트를 노트북 네임스페이스에서 실행 | `%run analysis.py` |
| `%who` / `%whos` | 현재 정의된 변수 목록 (타입 포함) | `%whos` |
| `%load` | 파일·URL을 현재 셀로 불러오기 | `%load utils.py` |
| `%env` | 환경 변수 조회·설정 | `%env LANG=ko_KR.UTF-8` |
| `%pip` | pip 설치 (현재 커널 환경에) | `%pip install scipy` |
| `%load_ext` | IPython 확장 로드 | `%load_ext autoreload` |

### 자주 쓰는 셀 매직

| 명령 | 용도 | 예시 |
|------|------|------|
| `%%time` | 셀 전체 1회 실행 시간 (CPU + wall) | `%%time` |
| `%%timeit` | 셀 전체 다회 벤치마크 | `%%timeit -n 100 -r 5` |
| `%%bash` / `%%sh` | 셀을 bash·sh 스크립트로 실행 | `%%bash` 후 `ls -la` |
| `%%writefile` | 셀 내용을 파일로 저장 (`-a` 추가) | `%%writefile config.yaml` |
| `%%html` | 셀을 HTML로 렌더링 | `%%html` |
| `%%capture` | 셀의 출력을 변수에 캡처 | `%%capture out` |

### 쉘 명령 `!`

```python
!pwd                    # 현재 디렉터리
!pip list | grep pandas # 파이프도 가능
files = !ls *.csv       # 결과를 파이썬 변수로 (SList)
print(files)
```

> **주의:** `!cd foo`는 *서브쉘에서만 작동*하고 노트북 작업 디렉터리를 바꾸지 못한다. 작업 디렉터리 변경은 `%cd foo` (자동매직) 또는 `os.chdir("foo")` 사용.

---

## 4. 셀 타입

| 타입 | 용도 | 단축키 (선택 후) |
|------|------|------------------|
| **code** | 커널에서 실행될 코드 | `Y` |
| **markdown** | 설명·수식(LaTeX `$...$`)·이미지 | `M` |
| **raw** | nbconvert에 *그대로* 전달 (LaTeX 본문에 직접 박는 용도) | `R` |

**Markdown 셀 활용 (학위논문 분석에서 핵심):**

```markdown
## 3.2 꿈 일기 데이터 — 빈도 분석

다음 분석은 N=120 응답자의 7일치 꿈 일기에서 **akrasia 관련 어휘**의
출현 빈도를 측정한다. 통계량은 $\chi^2$ 검정으로 검증한다.

$$\chi^2 = \sum \frac{(O_i - E_i)^2}{E_i}$$
```

코드 → 결과 → 마크다운 해석을 *교차로* 배치하면 그대로 보고서가 된다.

---

## 5. `.ipynb` 파일 포맷 (nbformat 4.5)

`.ipynb`는 **JSON** 문서다. 최상위 4개 키:

```json
{
  "metadata": { "kernelspec": { "name": "python3" }, "language_info": { ... } },
  "nbformat": 4,
  "nbformat_minor": 5,
  "cells": [
    {
      "cell_type": "markdown",
      "id": "intro-cell",
      "metadata": {},
      "source": "# 제목"
    },
    {
      "cell_type": "code",
      "id": "code-cell-1",
      "execution_count": 1,
      "metadata": {},
      "source": "print('Hello')",
      "outputs": [
        { "output_type": "stream", "name": "stdout", "text": "Hello\n" }
      ]
    }
  ]
}
```

**4.5 핵심 변경**: 모든 셀에 `id` 필드 필수 (1–64자, `[a-zA-Z0-9-_]+`). 셀 재배치·삭제 시 안정적 식별이 가능해져 협업·diff 품질이 좋아졌다.

**프로그래매틱 접근:**

```python
import nbformat
nb = nbformat.read("analysis.ipynb", as_version=4)
for cell in nb.cells:
    if cell.cell_type == "code":
        print(cell.source[:50])
```

---

## 6. 버전 관리 — `.ipynb`를 Git에서 깔끔하게

`.ipynb`는 JSON + base64 인코딩된 이미지 출력이 섞여 있어 *raw diff가 사람이 못 읽는 수준*이다. 해결책 3종:

### 6-1. `nbstripout` — 커밋 시 출력 자동 제거

`.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/kynan/nbstripout
    rev: 0.9.1
    hooks:
      - id: nbstripout
```

```bash
uv add --dev pre-commit nbstripout
uv run pre-commit install
# 이후 git commit 시 .ipynb의 출력 영역이 자동으로 비워져 커밋된다
```

**효과:** 코드·마크다운 *입력만* 추적, 출력 변경으로 인한 노이즈 제거.

### 6-2. `jupytext` — `.py` 또는 `.md`로 페어링

ipynb와 동일 내용을 텍스트 형식으로 *동시에* 유지. 텍스트 파일만 git에 올리거나, 둘 다 올리되 diff는 텍스트 쪽으로 본다.

```bash
uv add --dev jupytext

# 단일 노트북을 ipynb + py:percent 페어로 설정
uv run jupytext --set-formats ipynb,py:percent analysis.ipynb

# 한쪽을 변경한 후 동기화
uv run jupytext --sync analysis.ipynb
```

**프로젝트 전역 설정 — `jupytext.toml`:**

```toml
formats = "ipynb,py:percent"
```

**페어 동작:** 노트북 저장 시 두 파일 모두 갱신. 입력은 *더 최근에 수정된 쪽*에서 읽고, 출력은 `.ipynb`에서 읽는다.

**대표 텍스트 포맷:**

| 포맷 | 확장자 | 적합한 경우 |
|------|--------|------------|
| `py:percent` | `.py` | `# %%` 셀 구분 — VS Code·PyCharm 호환 |
| `py:light` | `.py` | 셀 구분 최소화 — 일반 파이썬에 가깝게 |
| `md` | `.md` | 마크다운 문서로 — 가독성·블로그용 |
| `md:myst` | `.md` | MyST Markdown — Sphinx 문서화 통합 |

### 6-3. `jupyter nbconvert` — 산출물 익스포트

```bash
uv run jupyter nbconvert analysis.ipynb --to markdown          # 보고서용
uv run jupyter nbconvert analysis.ipynb --to html              # 웹 공유용
uv run jupyter nbconvert analysis.ipynb --to pdf               # 제출용 (TeX 필요)
uv run jupyter nbconvert analysis.ipynb --to slides            # Reveal.js 슬라이드
uv run jupyter nbconvert analysis.ipynb --to script            # .py로
```

> **주의:** `--to pdf`는 XeLaTeX 또는 `--to webpdf`(Chromium headless + playwright)이 필요하다. WebPDF가 한글 폰트 처리에 더 안정적이다.

**조합 권장:** `nbstripout`(필수) + `jupytext`(diff가 진짜 필요할 때) + `nbconvert`(최종 산출물 익스포트).

---

## 7. JupyterLab 확장

### 설치 방식 (JupyterLab 4 기준)

JupyterLab 4부터는 *prebuilt extension*(파이썬 패키지)을 권장한다. 빌드 단계 불필요.

```bash
uv add jupyterlab-rise jupyterlab-git
# 또는
uv run pip install @lckr/jupyterlab_variableinspector
```

### 학술 분석에 유용한 확장

| 확장 | 설치 | 용도 |
|------|------|------|
| **Variable Inspector** | `pip install lckr-jupyterlab-variableinspector` | 변수·DataFrame을 사이드 패널에 실시간 표시 |
| **jupyterlab-git** | `pip install jupyterlab-git` | UI에서 git 커밋·diff |
| **jupyterlab-lsp** | `pip install jupyterlab-lsp python-lsp-server` | 자동완성·정의로 이동·타입 힌트 |
| **jupyterlab-rise** | `pip install jupyterlab-rise` | 슬라이드 발표 (10절) |
| **jupyterlab-spellchecker** | `pip install jupyterlab-spellchecker` | 마크다운 셀 맞춤법 |

설치된 확장 목록:

```bash
uv run jupyter labextension list
uv run jupyter server extension list
```

---

## 8. 원격 실행 환경

| 환경 | 특징 | 적합한 경우 |
|------|------|-------------|
| **JupyterHub** | 멀티유저 서버 — 기관·연구실 운영 | 공용 서버에 다인이 각자 환경 |
| **Google Colab** | 무료 GPU/TPU·Drive 통합·Gemini AI 통합 (2026) | 빠른 실험, GPU 필요 시 |
| **Kaggle Notebooks** | 무료 GPU·공개 데이터셋 다수·대회용 | 공개 데이터 EDA, 모델 경진 |
| **VS Code Jupyter** | 로컬 IDE 안에서 `.ipynb` 직접 편집 | 코드 편집 환경 통합 선호 |
| **JupyterLab Desktop** | 일렉트론 기반 데스크탑 앱 | 브라우저 없이 로컬 분석 |

**Colab vs Kaggle 비교 요점:**
- Colab은 *내 데이터·내 GDrive*와 작업할 때 유리
- Kaggle은 *공개 데이터셋·대회 출품*에 유리
- 둘 다 세션·런타임 제한 있음 (학위논문 본 분석은 로컬 권장)

**VS Code Jupyter 주의:** `.ipynb`를 직접 열 수 있고 매직 명령도 지원하지만, JupyterLab 일부 확장(Variable Inspector 등)은 VS Code 자체 기능으로 대체된다.

---

## 9. 보안 — 외부 호스팅 시 주의

Jupyter Server에 접근 = **임의 코드 실행 권한**. 외부에 노출시킬 때 반드시 인증 활성화.

### 기본 token 인증

서버 시작 시 자동 생성된 토큰이 터미널에 출력된다:

```
http://localhost:8888/?token=abcdef1234567890...
```

이 URL을 그대로 브라우저에 붙여넣으면 로그인된다.

### 비밀번호 인증으로 변경

```bash
uv run jupyter server password
# 비밀번호 입력 → ~/.jupyter/jupyter_server_config.json에 해시 저장
# 비밀번호 설정 시 token 인증은 기본 비활성화됨
```

### 원격 접근 권장 설정

```bash
uv run jupyter lab \
  --ip=0.0.0.0 \
  --port=8888 \
  --no-browser \
  --ServerApp.allow_origin='https://my-domain.com'
```

> **금지 패턴:**
> - `c.ServerApp.token = ""` + `c.ServerApp.password = ""` (둘 다 빈 문자열) — 인증 없이 공개 노출. 학습 환경이라도 절대 금지.
> - `--allow-root`로 루트 권한 실행 — 컨테이너 외에는 일반 사용자로 실행.
> - SSH 터널 없이 공인 IP 직접 노출 — 최소한 HTTPS + reverse proxy(nginx) + 방화벽 조합 사용.

### 노트북 신뢰(trust) 모델

타인이 보낸 `.ipynb`는 *untrusted* 상태로 열린다 → HTML·JavaScript 출력이 새니타이즈된다. 본인이 작성·실행한 셀의 출력만 자동 신뢰. 필요 시 `jupyter trust analysis.ipynb`로 명시 신뢰.

---

## 10. RISE — 슬라이드 발표 (학위논문 발표용)

`.ipynb`를 *Reveal.js 슬라이드*로 곧장 발표. 코드 셀을 *라이브로* 실행하면서 발표 가능 → 학위논문 결과 시연에 유용.

### 설치

```bash
uv add jupyterlab-rise
# 또는: uv run pip install jupyterlab-rise
```

> JupyterLab 4.1.2+ / Notebook 7 호환. 클래식 Notebook 6용 RISE(damianavila/RISE)는 *별개 프로젝트*이며 JupyterLab 4에는 안 맞다.

### 슬라이드 타입 설정

JupyterLab의 *Property Inspector* 패널(우측 톱니바퀴) → 셀별로 Slide Type 선택:

| 타입 | 의미 |
|------|------|
| **Slide** | 새로운 가로 슬라이드 |
| **Sub-Slide** | 세로로 이어지는 보조 슬라이드 |
| **Fragment** | 같은 슬라이드 안에서 순차 등장 |
| **Skip** | 발표에서 숨김 |
| **Notes** | 발표자 노트 (관객엔 보이지 않음) |

### 발표 모드 진입

- 단축키: **Cmd/Ctrl + R** (Mac은 Option + R)
- 또는 노트북 툴바의 RISE 버튼

### 학위논문 발표 패턴

```
[Slide]      문제 정의 (akrasia vs akolasia)
  [Fragment] 정의 1
  [Fragment] 정의 2
[Slide]      방법론
  [Sub-Slide] 데이터 출처
  [Sub-Slide] 분석 코드 (라이브 실행)
[Slide]      결과 — matplotlib 그래프 라이브 렌더
[Slide]      결론
  [Notes]    심사위원 예상 질문 대비 메모
```

---

## 11. 학술 분석 워크플로우 — 데이터 로드 → 탐색 → 분석 → 보고서

학위논문 데이터 분석 노트북의 권장 구조:

```python
# === Cell 1: 마크다운 — 표지·요약 ===
# # 꿈 일기 데이터 분석 — akrasia 어휘 빈도 (2026-05-15)
# 분석 목적·가설·데이터 출처 1단락

# === Cell 2: 마크다운 — 환경·재현성 ===
# ## 0. 환경
# - Python 3.12 · JupyterLab 4.5.7 · pandas 2.x
# - 시드: random_state=42

# === Cell 3: 코드 — 임포트 ===
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

%matplotlib inline
%load_ext autoreload
%autoreload 2

SEED = 42
DATA_DIR = Path("./data")

# === Cell 4: 마크다운 — 데이터 로드 ===
# ## 1. 데이터 로드

# === Cell 5: 코드 — 로드 ===
df = pd.read_csv(DATA_DIR / "dream_diaries.csv")
df.info()

# === Cell 6: 마크다운 — 탐색 ===
# ## 2. 탐색적 분석 (EDA)

# === Cell 7: 코드 — 기술 통계 ===
df.describe()

# === Cell 8: 코드 — 분포 시각화 ===
fig, ax = plt.subplots(figsize=(8, 4))
sns.histplot(df["akrasia_word_count"], ax=ax)
ax.set_title("꿈 일기 — akrasia 관련 어휘 빈도 분포")
plt.tight_layout()

# === Cell 9: 마크다운 — 추론 분석 ===
# ## 3. 가설 검정
# H0: 두 집단의 빈도 분포는 동일하다.

# === Cell 10: 코드 — 검정 ===
from scipy.stats import mannwhitneyu
g1 = df.query("group == 'A'")["akrasia_word_count"]
g2 = df.query("group == 'B'")["akrasia_word_count"]
stat, p = mannwhitneyu(g1, g2, alternative="two-sided")
print(f"U = {stat:.3f}, p = {p:.4f}")

# === Cell 11: 마크다운 — 해석·결론 ===
# ## 4. 결론
# (검정 결과를 본문 서술로 정리. nbconvert --to markdown 시 그대로 보고서 본문이 됨)
```

**산출:**

```bash
# 보고서 본문(.md)으로 익스포트 — 학위논문 부록에 첨부
uv run jupyter nbconvert analysis.ipynb --to markdown --output report.md

# 슬라이드(.html) — 심사 발표용
uv run jupyter nbconvert analysis.ipynb --to slides --post serve
```

---

## 12. 흔한 함정 — 노트북 특유의 문제

### 12-1. 셀 실행 순서 의존성 (Hidden State)

셀을 *위에서 아래로* 순서대로 실행하지 않으면 코드와 실제 변수 상태가 어긋난다. 결과적으로 **노트북을 다시 열어 처음부터 실행하면 결과가 달라진다.**

**방어 습관:**

1. *분석이 끝나면 반드시 **Kernel → Restart Kernel and Run All Cells*** 로 처음부터 재현 확인.
2. 변수명을 *전역*에 남기지 말고 함수에 캡슐화.
3. 셀의 입력·출력만으로 의미가 전달되도록 작성 (외부 변수 의존 최소화).

### 12-2. 메모리 누적

큰 DataFrame을 셀마다 새로 만들면 GC가 따라가지 못해 RAM이 폭증. 특히 matplotlib figure 객체가 누적된다.

**대처:**

```python
import gc
del large_df            # 명시적 해제
gc.collect()

plt.close("all")        # 모든 matplotlib figure 닫기
```

### 12-3. Git diff 곤란

`.ipynb`의 raw diff는 사람이 못 읽는다 → **6장**의 `nbstripout` + `jupytext` 조합 적용.

### 12-4. 자동 저장과 동시 편집

JupyterLab의 자동저장 + 외부 에디터(VS Code 등)에서 같은 `.ipynb`를 동시 편집하면 충돌. jupytext 페어링 시는 *반드시 자동저장 끄고 reload* 습관.

### 12-5. `%pip install` vs `!pip install`

`!pip install` 은 *시스템 파이썬*에 설치될 수 있어 현재 커널과 다른 환경이 된다. **`%pip install`** (또는 `%conda install`)은 *현재 커널 환경*에 설치되도록 IPython이 보정한다. **항상 `%pip` 사용 권장.**

### 12-6. 출력의 trust 문제

타인 노트북을 열면 HTML·JS 출력이 새니타이즈되어 인터랙티브 위젯이 안 보일 수 있다. 검토 후 `jupyter trust foo.ipynb` 또는 메뉴 *File → Trust Notebook*.

### 12-7. 한글 폰트 깨짐 (matplotlib)

```python
import matplotlib.pyplot as plt
plt.rcParams["font.family"] = "AppleGothic"   # macOS
# plt.rcParams["font.family"] = "Malgun Gothic"  # Windows
plt.rcParams["axes.unicode_minus"] = False     # 마이너스 부호 깨짐 방지
```

> 자세한 시각화 설정은 짝 스킬 `backend/python-data-visualization` 참조.

---

## 13. 예시 — 학위논문 통계 분석 시나리오

**시나리오:** "akrasia vs akolasia 차이"를 도덕교육 평가 데이터로 검증.

### 디렉터리 구조

```
thesis-analysis/
├── pyproject.toml          # uv 관리
├── jupytext.toml           # ipynb ↔ py:percent 페어
├── .pre-commit-config.yaml # nbstripout
├── data/
│   └── moral_eval_2026.csv
├── notebooks/
│   ├── 01_eda.ipynb        # 탐색
│   ├── 01_eda.py           # jupytext 페어
│   ├── 02_hypothesis.ipynb # 가설 검정
│   └── 03_report.ipynb     # 최종 보고용
└── reports/
    ├── eda.md              # nbconvert 산출물
    └── hypothesis.md
```

### 한 줄 명령으로 전체 산출물 생성

```bash
# 모든 노트북 → md 보고서로 일괄 변환
for nb in notebooks/*.ipynb; do
  uv run jupyter nbconvert "$nb" --to markdown --output-dir reports/
done

# 학위논문 발표용 슬라이드
uv run jupyter nbconvert notebooks/03_report.ipynb --to slides --post serve
```

### Git 워크플로우

```bash
git add notebooks/01_eda.py    # py 파일 위주로 커밋 (diff가 깔끔)
git add notebooks/01_eda.ipynb # ipynb도 함께 (nbstripout가 출력 제거)
git commit -m "[thesis] Add: EDA — 도덕 평가 빈도 분석"
```

---

## 참고 — 짝 스킬

- `backend/python-uv-project-setup` — uv 기반 프로젝트 셋업
- `backend/python-basics` — 파이썬 기초 문법
- `backend/python-pandas-fundamentals` — DataFrame 조작
- `backend/python-data-visualization` — matplotlib·seaborn 시각화 (한글 폰트 포함)
- `backend/python-korean-nlp-konlpy` — 한국어 텍스트 분석 (꿈 일기·면담 전사 등)
