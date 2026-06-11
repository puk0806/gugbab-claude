## 7. 색상 팔레트 (색맹 친화)

전체 인구의 약 8%(남성)·0.5%(여성)가 색각 이상이 있습니다. **카테고리 구분이 색에만 의존하면 안 됩니다.**

### 7.1 권장 컬러맵

| 컬러맵 | 종류 | 색맹 친화 | 흑백 인쇄 친화 | 비고 |
|--------|------|:---:|:---:|------|
| **viridis** | sequential | ✅ | ✅ | matplotlib 2.0+ 기본 |
| **cividis** | sequential | ✅✅ | ✅ | viridis보다 색각 이상자에 더 안전 |
| **inferno** / **magma** / **plasma** | sequential | ✅ | ✅ | viridis 친구들 |
| **coolwarm** | diverging | ✅ | ⚠️ | 중심값 있는 데이터(상관 등) |
| **RdBu_r** (ColorBrewer) | diverging | ✅ | ⚠️ | 동일 용도 |
| jet | ❌ | ❌ | ❌ | **사용 금지** (지각적 비균일) |
| rainbow / hsv | ❌ | ❌ | ❌ | **사용 금지** |

### 7.2 적용

```python
# matplotlib
ax.imshow(matrix, cmap="viridis")

# seaborn — cmap (heatmap) / palette (범주)
sns.heatmap(corr, cmap="coolwarm", center=0)
sns.boxplot(data=df, x="cat", y="val", palette="colorblind")    # seaborn 내장 색맹 친화 팔레트

# matplotlib 색맹 친화 스타일 시트
plt.style.use("tableau-colorblind10")
```

### 7.3 색 외 채널 보강

색맹 친화 팔레트를 써도 색 외에 **마커 모양·라인 스타일·패턴**을 함께 변화시키면 더 안전합니다.

```python
sns.scatterplot(data=df, x="x", y="y", hue="cat", style="cat", palette="colorblind")
# → 색 + 마커 모양 둘 다 다름
```

ColorBrewer 팔레트: https://colorbrewer2.org/ 에서 "colorblind safe" 체크박스로 필터링 가능.

---

## 8. pandas 통합

### 8.1 `df.plot()` (matplotlib 기반)

pandas DataFrame·Series에 내장된 단축 API:

```python
df.plot(kind="line", x="date", y=["a", "b"])
df.plot(kind="bar", stacked=True)
df["score"].plot(kind="hist", bins=30)
df.plot(kind="scatter", x="height", y="weight")
df.plot(kind="box")
```

**언제 쓰나:** EDA 단계의 한 줄 시각화. 출판용은 matplotlib 객체 직접 조작이 더 유연합니다.

### 8.2 seaborn `data=df`

위 §5.1 참조. 컬럼명만 문자열로 넘기는 패턴이 가장 깔끔합니다.

### 8.3 plotly.express `df`

```python
px.scatter(df, x="x", y="y", color="cat", facet_col="group")
px.bar(df, x="cat", y="val", color="sub", barmode="group")
px.line(df, x="date", y="value", color="series")
```

plotly 6.x는 Narwhals 통합으로 **pandas뿐 아니라 Polars·PyArrow DataFrame도 native 지원**합니다.

---

## 9. 학술 출판 품질

### 9.1 figure 크기·DPI

| 출력 매체 | 권장 figsize (inch) | DPI | 형식 |
|----------|--------------------|-----|------|
| 학술지 본문 1단 그림 | (3.5, 2.5) ~ (4, 3) | 300+ | PDF/SVG (벡터) |
| 학술지 2단 그림 | (7, 4) ~ (8, 5) | 300+ | PDF/SVG |
| 슬라이드 | (10, 6) | 150~200 | PNG |
| 블로그·웹 | (8, 5) | 100~150 | PNG/WebP |
| 포스터(대형 출력) | 큰 figsize 그대로 | 600 | PDF/SVG |

```python
fig, ax = plt.subplots(figsize=(4, 3))
# ... 플롯 ...
fig.tight_layout()                        # 라벨 잘림 방지
fig.savefig("fig1.pdf", bbox_inches="tight")
fig.savefig("fig1.png", dpi=300, bbox_inches="tight")
```

### 9.2 형식별 선택

| 형식 | 유형 | 사용처 |
|------|------|--------|
| **PDF** | 벡터 | 학술지 제출 1순위. 임의 확대에도 깨끗 |
| **SVG** | 벡터 | 웹·후처리(Illustrator·Inkscape) |
| **PNG** | 래스터 | 슬라이드·블로그. `dpi=300+` 명시 |
| **TIFF** | 래스터(무손실) | 일부 학술지(Nature·Science 등) 요구 |
| EPS | 벡터(레거시) | 일부 LaTeX 워크플로 — 신규는 PDF 권장 |

### 9.3 글꼴·라벨

- **글꼴 크기 ≥ 8pt** (인쇄 후 가독성)
- 본문 글꼴과 figure 글꼴 통일 (`font.family = "serif"` + `font.serif = ["Times New Roman"]` 등)
- 한글 논문이면 §4의 NanumGothic 적용
- `axes.unicode_minus = False`로 마이너스 부호 깨짐 방지

```python
plt.rcParams.update({
    "font.family": "NanumGothic",
    "font.size": 10,
    "axes.titlesize": 11,
    "axes.labelsize": 10,
    "xtick.labelsize": 9,
    "ytick.labelsize": 9,
    "legend.fontsize": 9,
    "axes.unicode_minus": False,
    "figure.dpi": 100,           # 화면 미리보기
    "savefig.dpi": 300,          # 저장 시
    "savefig.bbox": "tight",
})
```

### 9.4 격자·범례

- 격자(grid)는 옅게: `ax.grid(True, alpha=0.3, linestyle="--")`
- 범례 위치 자동: `ax.legend(loc="best")` 또는 외부: `bbox_to_anchor=(1.02, 1), loc="upper left"`
- `tight_layout()` 또는 `constrained_layout=True`로 라벨 잘림 방지

---

## 10. Jupyter 통합

### 10.1 매직 명령

```python
%matplotlib inline      # 정적 PNG 인라인 (기본)
%matplotlib widget      # 인터랙티브 (ipympl 필요: pip install ipympl)
%matplotlib notebook    # 레거시 (Notebook 6 이하) — Notebook 7+에서는 widget 사용
```

| 매직 | 결과 | 의존성 |
|------|------|--------|
| `%matplotlib inline` | 정적 PNG, 셀 출력에 박힘 | 없음 (기본) |
| `%matplotlib widget` | 마우스 zoom/pan, toolbar, 콜백 | `ipympl` 패키지 |

```bash
pip install ipympl
```

JupyterLab에서는 확장 활성화도 필요할 수 있습니다 (JupyterLab 3+/4+ 자동).

### 10.2 plotly Jupyter 사용

```python
import plotly.express as px
fig = px.scatter(df, x="x", y="y")
fig.show()              # JupyterLab/Notebook 7+에서 인라인 인터랙티브 표시
```

plotly 6.x는 **Jupyter Notebook 7+ 필수**입니다. classic Notebook 6 이하는 5.x 고정 또는 업그레이드 권장.

### 10.3 seaborn Jupyter 사용

seaborn은 별도 매직 불필요. matplotlib 백엔드를 그대로 사용:

```python
import seaborn as sns
sns.set_theme(style="whitegrid", palette="colorblind")
sns.scatterplot(data=df, x="x", y="y", hue="cat")
```

---

## 11. 흔한 함정과 해결

### 11.1 한글 깨짐 (□□□)

**증상:** 라벨·제목에 한글이 `□□□` 또는 `tofu`로 표시.

**원인:** 기본 DejaVu Sans 폰트에 한글 글리프 없음.

**해결:** §4 참조. 즉시 코드:

```python
plt.rcParams["font.family"] = "NanumGothic"     # 또는 OS별 폰트
plt.rcParams["axes.unicode_minus"] = False
```

### 11.2 마이너스 부호가 깨짐 (−1 → ┐1)

**원인:** 한글 폰트에 유니코드 마이너스(U+2212) 글리프 누락.

**해결:**

```python
plt.rcParams["axes.unicode_minus"] = False
```

### 11.3 figure 누적 / 메모리 누수

**증상:** 루프에서 `plt.subplots()`를 반복하면 메모리가 계속 늘어남.

**원인:** pyplot이 figure 참조를 유지. `plt.close()` 호출 없이 새로 만들면 누적.

**해결:**

```python
for item in items:
    fig, ax = plt.subplots()
    ax.plot(...)
    fig.savefig(f"out_{item}.png")
    plt.close(fig)        # 명시적 해제

# 또는 한 번에
plt.close("all")
```

> 추가: GUI 백엔드(`Qt5Agg` 등) 사용 중에는 `plt.close()`만으로 일부 자원이 안 풀리는 알려진 버그가 있습니다. 일괄 처리 스크립트는 `matplotlib.use("Agg")`로 백엔드 전환 후 실행하세요.

### 11.4 `tight_layout` 경고 / 라벨 잘림

**증상:** `UserWarning: Tight layout not applied` 또는 X축 라벨이 잘려 저장됨.

**해결 옵션:**

```python
fig.tight_layout()                        # 기본
# 또는
plt.subplots(constrained_layout=True)     # 더 견고
# 저장 시
fig.savefig("out.png", bbox_inches="tight")
```

### 11.5 seaborn `distplot` deprecation 경고

**증상:** `DeprecationWarning: distplot is a deprecated function and will be removed in seaborn v0.14.0`

**해결:** §5.2 표 참조. `histplot` 또는 `displot`로 교체.

### 11.6 plotly 6.x로 올렸더니 차트가 안 보임

**원인 후보:**
- Jupyter Notebook 6 이하 사용 중 → Notebook 7+ 업그레이드
- `layout.titlefont` 등 deprecated 속성 사용 → `layout.title.font`로 교체
- `pointcloud`/`heatmapgl` trace 사용 → 일반 trace로 교체

마이그레이션 가이드: https://plotly.com/python/v6-migration/

### 11.7 색맹 친화 팔레트 강제

```python
# matplotlib 전역
plt.style.use("tableau-colorblind10")

# seaborn 전역
sns.set_palette("colorblind")
sns.set_theme(palette="colorblind")
```

### 11.8 잘못된 컬러맵 (jet/rainbow) 사용

**증상:** "예쁘다"는 이유로 `cmap="jet"` 사용 — 데이터 왜곡 가능 (지각적 비균일).

**해결:** `viridis`/`cividis`/`coolwarm`(diverging) 중 데이터 종류에 맞게.

---

## 12. 빠른 시작 템플릿 (복붙용)

### 12.1 한국어 + 학술 출판 품질 기본 설정

```python
import matplotlib.pyplot as plt
import seaborn as sns

plt.rcParams.update({
    "font.family": "NanumGothic",
    "font.size": 10,
    "axes.unicode_minus": False,
    "figure.dpi": 100,
    "savefig.dpi": 300,
    "savefig.bbox": "tight",
})
sns.set_theme(style="whitegrid", palette="colorblind", font="NanumGothic")
```

### 12.2 단일 figure 저장

```python
fig, ax = plt.subplots(figsize=(5, 3.5))
ax.plot(df["date"], df["value"], label="시리즈 1")
ax.set_xlabel("날짜")
ax.set_ylabel("값")
ax.set_title("월별 추이")
ax.legend()
fig.savefig("trend.pdf")   # 벡터
fig.savefig("trend.png", dpi=300)
plt.close(fig)
```

### 12.3 인터랙티브 HTML 저장

```python
import plotly.express as px
fig = px.scatter(df, x="x", y="y", color="category",
                 hover_data=["name"], title="산점도")
fig.write_html("scatter.html", include_plotlyjs="cdn")
```

---

## 13. 체크리스트 (PR 리뷰용)

- [ ] 한글 폰트 설정 + `axes.unicode_minus = False`
- [ ] figure 객체를 명시적으로 받고 (`fig, ax = plt.subplots()`) 저장 후 `plt.close(fig)` 호출
- [ ] 저장은 출력 매체에 맞는 형식(논문 PDF/SVG, 웹 PNG)
- [ ] DPI ≥ 300 (래스터일 때)
- [ ] 색맹 친화 팔레트(viridis/cividis/coolwarm/tableau-colorblind10/seaborn `colorblind`)
- [ ] jet/rainbow 컬러맵 미사용
- [ ] `distplot` 미사용 (→ `histplot`/`displot`)
- [ ] plotly 6.x 사용 시 deprecated 속성(`titlefont` 등) 없음
- [ ] Jupyter 환경이면 `%matplotlib widget` 의존 시 `ipympl` 설치 명시
- [ ] `tight_layout()` 또는 `constrained_layout=True` 적용
