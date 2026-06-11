## 11. v1 → v2 주요 변경

| 항목 | v1.x | v2.x |
|------|------|------|
| PyArrow 백엔드 | 없음 | `dtype_backend='pyarrow'` 추가 |
| datetime 해상도 | `ns` 고정 | `s`/`ms`/`us`/`ns` 선택 가능 |
| Index numeric dtype | int64/float64 강제 | int8~int64, float32/64 보존 |
| `value_counts()` name | `dtype: int64` (Name 없음) | `Name: count, dtype: int64` |
| Timezone 기본 | `pytz.UTC` | `datetime.timezone.utc` |
| `groupby(...group_keys)` | `True` | `False` (apply 시 키 중복 제거) |
| `get_dummies()` dtype | `uint8` | `bool` |
| CoW | 없음 | opt-in (`mode.copy_on_write=True`) |

> v3.0(2026-01)부터 CoW가 default 강제, NumPy-backed object string이 PyArrow string으로 자동 변환. v2.x 코드를 그대로 v3로 올리면 SettingWithCopy 관련 버그가 표면화될 수 있음.

---

## 12. 흔한 함정

### 12.1 체인 인덱싱 (Chained Indexing)

```python
# 금지 — SettingWithCopyWarning 또는 CoW에서 무시
df[df['a'] > 0]['b'] = 99

# 권장
df.loc[df['a'] > 0, 'b'] = 99
```

### 12.2 inplace=True의 함정

```python
# CoW에서 작동 안 함
df['a'].replace(1, 5, inplace=True)

# 권장 — 재할당
df['a'] = df['a'].replace(1, 5)
# 또는 DataFrame 단위 replace
df = df.replace({'a': {1: 5}})
```

### 12.3 dtype 추론 오류

```python
# CSV의 빈 셀은 NaN → 컬럼 dtype이 float64로 추론될 수 있음
df = pd.read_csv('file.csv')
df['id'].dtype   # float64 (의도: int)

# 해결 1 — nullable Int (Int64 대문자)
df = pd.read_csv('file.csv', dtype={'id': 'Int64'})

# 해결 2 — PyArrow 백엔드
df = pd.read_csv('file.csv', dtype_backend='pyarrow')
```

### 12.4 `==` vs `.equals()`

```python
df1 == df2          # 원소별 비교 (NaN==NaN → False!)
df1.equals(df2)     # 전체 같은지 (NaN==NaN → True로 취급)
```

### 12.5 `apply`의 성능 함정

```python
# 느림 (행마다 Python 함수 호출)
df['x'].apply(lambda v: v * 2)

# 빠름 (vectorized)
df['x'] * 2
```

### 12.6 SettingWithCopyWarning (v2.x에서도 발생)

```python
sub = df[df['a'] > 0]
sub['b'] = 1   # SettingWithCopyWarning
# 해결: sub = df[df['a'] > 0].copy()
```

---

## 13. 예시: 꿈 일기 CSV 분석

```python
import pandas as pd

pd.options.mode.copy_on_write = True

# 1. 로드 (PyArrow 백엔드)
df = pd.read_csv(
    'dream_diary.csv',
    dtype_backend='pyarrow',
    parse_dates=['date'],
    encoding='utf-8',
)
# 컬럼: date, emotion, intensity, memo

# 2. 결측 정리
df = df.dropna(subset=['date', 'emotion'])
df['intensity'] = df['intensity'].fillna(df['intensity'].median())

# 3. 카테고리화
df['emotion'] = df['emotion'].astype('category')

# 4. 월별 빈도
df['month'] = df['date'].dt.to_period('M')
monthly_count = df.groupby('month').size()

# 5. 월별·감정별 평균 강도
pivot = df.pivot_table(
    index='month',
    columns='emotion',
    values='intensity',
    aggfunc='mean',
    fill_value=0,
    observed=True,
)

# 6. 감정 분포 (전체)
emotion_dist = df['emotion'].value_counts(normalize=True)

# 7. 한국어 키워드 빈도
nightmare_count = df['memo'].str.contains('악몽', na=False).sum()

# 8. 7일 이동평균
df = df.set_index('date').sort_index()
df['intensity_ma7'] = df['intensity'].rolling('7D').mean()

# 9. 결과 저장
pivot.to_csv('monthly_emotion_intensity.csv', encoding='utf-8-sig')
df.to_parquet('dream_diary_processed.parquet')

# 10. 빠른 시각화
import matplotlib.pyplot as plt
df['intensity_ma7'].plot(figsize=(12, 4), title='Dream Intensity (7-day MA)')
plt.tight_layout()
plt.savefig('intensity_trend.png', dpi=150)
```

---

## 짝 스킬

| 짝 스킬 | 역할 |
|---------|------|
| `backend/python-data-visualization` | matplotlib·seaborn 본격 시각화 |
| `backend/python-jupyter-notebook` | 노트북 환경, 인터랙티브 분석 |
| `backend/python-korean-nlp-konlpy` | 한국어 형태소 분석 (memo 컬럼 토큰화 시) |
| `backend/python-uv-project-setup` | `uv add pandas pyarrow` 의존성 관리 |
