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
