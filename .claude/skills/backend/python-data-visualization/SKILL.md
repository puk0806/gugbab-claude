---
name: python-data-visualization
description: >
  Python 시각화 3종(matplotlib·seaborn·plotly) 비교·활용 가이드.
  정적 출판용 vs 인터랙티브 웹용 선택 기준, 한국어 폰트(NanumGothic·맑은 고딕) rcParams·font_manager 등록,
  색맹 친화 팔레트(Viridis·Cividis·ColorBrewer), pandas DataFrame 통합, 통계 시각화 패턴,
  학술 출판 품질(DPI·tight_layout·SVG/PDF), Jupyter 백엔드(inline vs widget), figure 메모리 누수 등 흔한 함정을 정리한다.
  <example>사용자: "matplotlib에서 한글이 깨져요. 어떻게 해결하죠?"</example>
  <example>사용자: "seaborn으로 상관 히트맵을 그리는데 색맹 친화 팔레트를 쓰고 싶어요"</example>
  <example>사용자: "plotly 차트를 HTML로 저장해서 블로그에 임베드하려면?"</example>
  <example>사용자: "논문에 넣을 그림을 300 DPI로 저장하고 싶은데 라벨이 잘려요"</example>
---

# Python Data Visualization (matplotlib · seaborn · plotly)

> 소스:
> - matplotlib 공식: https://matplotlib.org/stable/index.html
> - matplotlib Fonts 가이드: https://matplotlib.org/stable/users/explain/text/fonts.html
> - matplotlib font_manager API: https://matplotlib.org/stable/api/font_manager_api.html
> - matplotlib savefig API: https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.savefig.html
> - matplotlib Colormap reference: https://matplotlib.org/stable/gallery/color/colormap_reference.html
> - matplotlib pyplot.close: https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.close.html
> - seaborn 공식: https://seaborn.pydata.org/
> - seaborn distplot deprecation 가이드: https://gist.github.com/mwaskom/de44147ed2974457ad6372750bbe5751
> - seaborn heatmap: https://seaborn.pydata.org/generated/seaborn.heatmap.html
> - seaborn jointplot: https://seaborn.pydata.org/generated/seaborn.jointplot.html
> - plotly Python 공식: https://plotly.com/python/
> - plotly Interactive HTML export: https://plotly.com/python/interactive-html-export/
> - plotly v6 migration: https://plotly.com/python/v6-migration/
> - Dash 공식: https://dash.plotly.com/
> - ipympl (jupyter widget backend): https://matplotlib.org/ipympl/
> - ColorBrewer: https://colorbrewer2.org/
>
> 검증일: 2026-05-15
>
> 짝 스킬:
> - `backend/python-pandas-fundamentals` — DataFrame 생성·정제, seaborn `data=df` 통합의 데이터 소스
>   (현재 레포에 미존재할 수 있음. 데이터 모델 합의 후 본 스킬과 함께 사용)
> - `backend/python-jupyter-notebook` — `%matplotlib inline`/`widget` 매직·셀 출력 표시 기준
>   (현재 레포에 미존재할 수 있음)
> - `frontend/dream-statistics-visualization` — 동일 데이터를 React/JS 측에서 Recharts·visx로 그리는 짝 스킬

---

## 0. 이 스킬이 다루는 범위

| 다룬다 | 다루지 않는다 |
|--------|---------------|
| matplotlib 3.10 / seaborn 0.13.2 / plotly 6.x 기본 사용법 | bokeh·altair·holoviews 등 다른 시각화 라이브러리 |
| 라이브러리별 선택 가이드 (정적 vs 인터랙티브, 논문용 vs 웹용) | 지도 시각화(folium, geopandas) — 별도 스킬 영역 |
| 한국어 폰트 설정·색맹 친화 팔레트·DPI·저장 형식 | 3D 시각화 고급 기법(mplot3d 회전 인터랙션 등) |
| pandas DataFrame 통합, 통계 시각화 기본 패턴 | 통계 분석 자체(statsmodels·scipy.stats 추론) |
| Jupyter 백엔드 inline vs widget, 메모리 누수 회피 | 대시보드 풀스택 구축(Dash 라우팅·콜백 심화) |

---

## 1. 버전 기준 (2026-05-15 시점 최신 안정)

| 라이브러리 | 최신 안정 버전 | 주요 변화 |
|-----------|---------------|----------|
| matplotlib | 3.10.x (2024-12 3.10.0 출시 이후 패치 진행) | 3.9 이후 Python 3.10+ 요구 |
| seaborn | 0.13.2 (2024-01-25 출시, 이후 신규 minor 없음) | `distplot` deprecated → `histplot`/`displot`로 대체. v0.14에서 제거 예정 |
| plotly | 6.x (현재 6.7.0, 2026-04-09 출시) | 5.x 대비 breaking change 있음 — 본문 §3 참조 |
| Dash | 3.x (plotly 6.x와 함께 배포) | Jupyter Notebook 7+ 요구 |
| ipympl | matplotlib widget 백엔드 패키지 — `%matplotlib widget` 사용 시 필요 |

> 주의: 사용자 요청에는 "plotly 5.x"가 명시되어 있었으나, 실제 plotly Python 최신 안정은 6.x입니다. 신규 작성 코드는 6.x 기준으로 작성하고, 5.x 레거시 코드를 만났을 때는 §3에서 마이그레이션 포인트를 확인하세요.

---

## 2. 라이브러리 선택 가이드 (가장 중요)

세 라이브러리 모두 "데이터 시각화"가 목적이지만, 강점이 명확히 다릅니다. **무엇을 만들지 먼저 정하고 라이브러리를 고르세요.**

### 2.1 의사결정 트리

```
시각화 목적은?
├─ 정적 이미지(논문·보고서 PNG/PDF/SVG)
│   ├─ 최대 세밀 제어 필요 (figure·axes·tick·patch 직접 조작)
│   │   → matplotlib
│   └─ 통계 그래프(분포·상관·범주 비교)를 빠르게
│       → seaborn (내부적으로 matplotlib 사용)
└─ 인터랙티브(웹 페이지·블로그·대시보드)
    ├─ HTML 한 파일 export (zoom·hover·legend 토글)
    │   → plotly.express / plotly.graph_objects
    └─ 콜백·UI 컴포넌트 결합한 풀 대시보드
        → Dash (plotly + Flask 기반 프레임워크)
```

### 2.2 사용 사례별 권장

| 사용 사례 | 1순위 | 2순위 | 사용하지 않음 |
|----------|-------|-------|---------------|
| 학위논문·학술지 그림 (PDF/SVG) | matplotlib | seaborn | plotly (래스터 변환 필요·폰트 매칭 어려움) |
| EDA 빠른 통계 그림 (분포·box·heatmap) | seaborn | matplotlib | — |
| 블로그·웹 페이지 임베드 | plotly | — | matplotlib (정적) |
| Jupyter 실시간 탐색 | matplotlib widget / plotly | seaborn | — |
| 다변량 인터랙티브 대시보드 | Dash | plotly | matplotlib |

### 2.3 함께 쓰기

seaborn은 내부에서 matplotlib을 호출하므로 **함께 사용이 정상**입니다. seaborn으로 그린 뒤 matplotlib API로 세부 조정하는 패턴이 가장 일반적입니다.

```python
import seaborn as sns
import matplotlib.pyplot as plt

ax = sns.boxplot(data=df, x="category", y="value")
ax.set_xlabel("범주")        # matplotlib API
ax.set_title("범주별 분포")
plt.tight_layout()
plt.savefig("fig.pdf")
```

---

## 3. matplotlib 3.x 기본 구조

### 3.1 Figure · Axes · Subplot

matplotlib의 객체 계층:

```
Figure (전체 캔버스, plt.figure())
└─ Axes (개별 플롯 영역, fig.add_subplot() / plt.subplots())
   ├─ XAxis / YAxis (축)
   ├─ Line2D / Patch / Text (그래픽 요소)
   └─ Legend
```

**권장 패턴 — `plt.subplots()`로 명시적 객체 받기:**

```python
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(x, y, label="series1")
ax.set_xlabel("x")
ax.set_ylabel("y")
ax.legend()
fig.tight_layout()
fig.savefig("out.png", dpi=300)
plt.close(fig)
```

**여러 subplot:**

```python
fig, axes = plt.subplots(nrows=2, ncols=2, figsize=(10, 8))
axes[0, 0].plot(x, y1)
axes[0, 1].scatter(x, y2)
axes[1, 0].hist(values)
axes[1, 1].bar(categories, counts)
fig.tight_layout()
```

### 3.2 pyplot 스타일 vs OO 스타일

| 스타일 | 예시 | 권장 시점 |
|--------|------|----------|
| pyplot(상태 기반) | `plt.plot(...); plt.xlabel(...)` | 인터랙티브 REPL·작은 스크립트 |
| 객체지향(OO) | `fig, ax = plt.subplots(); ax.plot(...)` | 프로덕션 코드·재사용 함수 |

**스크립트·라이브러리 코드는 OO 스타일을 권장합니다.** 어떤 figure에 그리는지 명시적이며, 함수로 추출하기 쉽습니다.

---

## 4. 한국어 폰트 설정 (가장 흔한 함정)

기본 DejaVu Sans 폰트는 한글 글리프가 없어 `□□□`로 깨집니다. 두 가지 접근:

### 4.1 시스템 폰트 사용 (rcParams)

폰트가 OS에 설치되어 있다면 가장 간단:

```python
import matplotlib.pyplot as plt

plt.rcParams["font.family"] = "NanumGothic"   # 또는 "Malgun Gothic"(Windows), "AppleGothic"(macOS)
plt.rcParams["axes.unicode_minus"] = False    # 한글 폰트는 유니코드 마이너스 부호 누락 → 깨짐 방지
plt.rcParams["font.size"] = 12
```

OS별 일반적인 폰트 이름:

| OS | 권장 폰트 이름 |
|----|---------------|
| Windows | `"Malgun Gothic"` |
| macOS | `"AppleGothic"` 또는 `"Apple SD Gothic Neo"` |
| Linux (Nanum 설치 후) | `"NanumGothic"` |

설치 여부 확인:

```bash
# Linux/macOS
fc-list :lang=ko

# Python에서
python -c "from matplotlib import font_manager; print([f.name for f in font_manager.fontManager.ttflist if 'Nanum' in f.name or 'Gothic' in f.name])"
```

### 4.2 폰트 파일을 직접 등록 (font_manager.addfont)

OS 설치 없이 `.ttf` 파일만 있을 때 (서버·도커 환경):

```python
from matplotlib import font_manager
import matplotlib.pyplot as plt

# 폰트 파일 경로 추가
font_path = "./fonts/NanumGothic.ttf"
font_manager.fontManager.addfont(font_path)

# rcParams에 폰트 이름 지정 (파일 안에 정의된 family name)
plt.rcParams["font.family"] = "NanumGothic"
plt.rcParams["axes.unicode_minus"] = False
```

여러 파일을 한 번에:

```python
from matplotlib import font_manager

font_dirs = ["./fonts/"]
for font_file in font_manager.findSystemFonts(fontpaths=font_dirs):
    font_manager.fontManager.addfont(font_file)
```

> 주의: `addfont()`는 매 프로세스마다 호출해야 합니다. 영구 설치하려면 OS 폰트 디렉터리에 복사한 뒤 `font_manager`의 캐시(`~/.cache/matplotlib/`)를 삭제하세요.

### 4.3 특정 텍스트에만 다른 폰트

전역 설정 없이 라벨 하나만:

```python
from matplotlib import font_manager
font_prop = font_manager.FontProperties(fname="./fonts/NanumGothic.ttf", size=14)
ax.set_xlabel("한글 라벨", fontproperties=font_prop)
```

---

## 5. seaborn 0.13 통계 시각화

seaborn은 matplotlib 위에 통계 그래프 단축 API를 얹은 라이브러리입니다. **pandas DataFrame과 통합이 핵심**입니다.

### 5.1 DataFrame 기반 호출 패턴

```python
import seaborn as sns
import pandas as pd

df = pd.DataFrame({...})

# 기본 패턴: data=df + x/y는 컬럼명 문자열
sns.boxplot(data=df, x="category", y="value", hue="group")
sns.scatterplot(data=df, x="height", y="weight", hue="sex")
sns.heatmap(df.corr(numeric_only=True), annot=True, cmap="viridis")
```

### 5.2 분포 (distplot은 deprecated)

**`distplot()`은 seaborn 0.11에서 deprecated, v0.14에서 제거 예정**입니다. 대체:

| 옛 코드 | 새 코드 | 비고 |
|---------|---------|------|
| `sns.distplot(x)` | `sns.histplot(x)` | 히스토그램만 |
| `sns.distplot(x, kde=True)` | `sns.histplot(x, kde=True)` | KDE 곡선 겹치기 |
| `sns.distplot(x)` (faceting 포함) | `sns.displot(data=df, x="col", kind="hist")` | figure-level, FacetGrid 지원 |

| 함수 | 레벨 | 용도 |
|------|------|------|
| `sns.histplot()` | axes-level | 히스토그램 (옵션으로 KDE/rug) |
| `sns.kdeplot()` | axes-level | KDE 곡선 |
| `sns.ecdfplot()` | axes-level | 누적분포 |
| `sns.displot()` | figure-level | `kind="hist"/"kde"/"ecdf"`로 faceting 가능 |

### 5.3 자주 쓰는 통계 그림

```python
# 분포
sns.histplot(data=df, x="score", kde=True, bins=30)

# 박스플롯 (범주별 분포 비교)
sns.boxplot(data=df, x="grade", y="score")

# 상관 히트맵
corr = df.select_dtypes(include="number").corr()
sns.heatmap(corr, annot=True, fmt=".2f", cmap="viridis", center=0)

# 산점도 + 주변 분포 (jointplot은 figure-level)
sns.jointplot(data=df, x="height", y="weight", kind="reg", hue="sex")

# 시계열 (line + 신뢰구간)
sns.lineplot(data=df, x="date", y="value", hue="category", errorbar="ci")
```

### 5.4 axes-level vs figure-level

| 함수 종류 | 반환 | 예시 | 특징 |
|-----------|------|------|------|
| axes-level | `Axes` 객체 | `histplot`, `boxplot`, `heatmap` | 기존 figure에 그림. `ax=` 인자로 위치 지정 가능 |
| figure-level | `FacetGrid`/`JointGrid` 등 | `displot`, `catplot`, `relplot`, `jointplot` | 자체 figure 생성. `col=`/`row=`로 자동 faceting |

저장·세부 조정은 figure-level이 다르므로 주의:

```python
g = sns.displot(data=df, x="score", col="grade", kind="hist")
g.figure.savefig("out.png", dpi=300)   # g.fig는 g.figure로 통일됨 (0.13+)
```

---

## 6. plotly 6.x 인터랙티브 시각화

plotly는 **JavaScript Plotly.js 위의 Python 래퍼**입니다. 결과물은 HTML 한 파일로 export할 수 있고, 자동으로 zoom·hover·legend 토글·panning이 작동합니다.

### 6.1 plotly.express (고수준) vs graph_objects (저수준)

```python
# plotly.express — DataFrame 한 줄로 그림
import plotly.express as px

fig = px.scatter(df, x="height", y="weight", color="sex",
                 hover_data=["name"], title="키-몸무게")
fig.show()
fig.write_html("scatter.html")        # 자체 완결 HTML 파일

# graph_objects — 세부 제어
import plotly.graph_objects as go

fig = go.Figure()
fig.add_trace(go.Scatter(x=x, y=y, mode="lines+markers", name="A"))
fig.add_trace(go.Bar(x=x2, y=y2, name="B"))
fig.update_layout(title="혼합 차트", xaxis_title="x", yaxis_title="y")
fig.write_html("mixed.html")
```

### 6.2 HTML export

```python
fig.write_html("plot.html")                   # 기본: 완결 HTML (Plotly.js 포함 ~3MB)
fig.write_html("plot.html", include_plotlyjs="cdn")   # CDN 로드 (파일 ~10KB)
fig.write_html("plot.html", full_html=False)          # <div>만 — 다른 HTML에 임베드
```

### 6.3 정적 이미지로 저장 (kaleido 필요)

```bash
pip install -U kaleido
```

```python
fig.write_image("plot.png", width=800, height=600, scale=3)   # scale=3 → 고해상도
fig.write_image("plot.pdf")                                    # 벡터 (논문용)
fig.write_image("plot.svg")
```

> 주의: plotly 6.0부터 `write_image` 내부 구현이 변경되어 일부 PDF 출력 디테일이 5.x와 다를 수 있습니다. 학위논문·학술지 그림은 가능한 한 matplotlib을 사용하세요.

### 6.4 Dash 연동

Dash는 plotly figure를 콜백으로 갱신하는 웹 프레임워크입니다.

```python
from dash import Dash, dcc, html, Input, Output
import plotly.express as px

app = Dash(__name__)
app.layout = html.Div([
    dcc.Dropdown(id="cat", options=[{"label": c, "value": c} for c in df["category"].unique()]),
    dcc.Graph(id="chart"),
])

@app.callback(Output("chart", "figure"), Input("cat", "value"))
def update(cat):
    sub = df if cat is None else df[df["category"] == cat]
    return px.scatter(sub, x="x", y="y")

if __name__ == "__main__":
    app.run(debug=True)
```

### 6.5 plotly 5.x → 6.x 마이그레이션 포인트

| 5.x | 6.x | 비고 |
|-----|-----|------|
| `layout.titlefont` | `layout.title.font` | 속성 평탄화 제거 |
| `layout.titleposition` | `layout.title.position` | 동일 |
| `pointcloud`, `heatmapgl` trace | 삭제됨 | 일반 `scatter`/`heatmap`으로 대체 |
| Jupyter Notebook 6 이하 지원 | Notebook 7+ 필수 | classic Notebook 사용자는 5.x 고정 또는 업그레이드 |
| `mapbox-*` trace | deprecated (제거 예정) | `map_*`(MapLibre 기반)으로 마이그레이션 권장 |

자세한 내용: https://plotly.com/python/v6-migration/

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
