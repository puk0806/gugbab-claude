---
name: python-pandas-fundamentals
description: >
  pandas 2.x 데이터 분석 핵심 (DataFrame·Series·PyArrow 백엔드·copy-on-write·groupby·merge·시계열·문자열).
  학위논문 자료 정리, 꿈 일기 통계, 설문 응답 집계 등 표 형식 데이터 분석 전반에 적용.
  짝 스킬: `backend/python-data-visualization` (matplotlib·seaborn), `backend/python-jupyter-notebook`
  (대화형 분석 환경).
---

# pandas 2.x Fundamentals

> 소스: pandas 공식 문서 (https://pandas.pydata.org/docs/)
> 검증일: 2026-05-15
> 대상 버전: pandas 2.2.x (LTS 시리즈), 2.3.3 stable 기준. pandas 3.0(2026-01-21 출시)에서 CoW 강제·string dtype 기본화 → 본문 별도 표기.

**주요 참조 페이지:**
- What's new v2.0.0: https://pandas.pydata.org/docs/whatsnew/v2.0.0.html
- Copy-on-Write 가이드: https://pandas.pydata.org/docs/user_guide/copy_on_write.html
- Indexing: https://pandas.pydata.org/docs/user_guide/indexing.html
- Merging: https://pandas.pydata.org/docs/user_guide/merging.html
- Time series: https://pandas.pydata.org/docs/user_guide/timeseries.html
- Text data: https://pandas.pydata.org/docs/user_guide/text.html
- Categorical data: https://pandas.pydata.org/docs/user_guide/categorical.html
- Reshaping (pivot/crosstab): https://pandas.pydata.org/docs/user_guide/reshaping.html
- Visualization: https://pandas.pydata.org/docs/user_guide/visualization.html

---

## 1. 핵심 개념

### 1.1 Series / DataFrame

| 객체 | 정의 | 특징 |
|------|------|------|
| `Series` | 1차원 라벨링된 배열 | 단일 dtype, 인덱스 보유 |
| `DataFrame` | 2차원 표 (행·열) | 컬럼별 dtype 가능, 행/열 인덱스 보유 |

```python
import pandas as pd
import numpy as np

s = pd.Series([1, 2, 3], index=['a', 'b', 'c'], name='count')

df = pd.DataFrame({
    'date': pd.to_datetime(['2026-05-01', '2026-05-02']),
    'emotion': ['joy', 'fear'],
    'intensity': [3, 5],
})
```

### 1.2 PyArrow 백엔드 (`dtype_backend='pyarrow'`)

pandas 2.0+에서 모든 I/O 함수에 `dtype_backend` 인자가 추가되어 PyArrow-backed 컬럼 생성 가능.

| 장점 | 비고 |
|------|------|
| 문자열 메모리·연산 5~10배 빠름 | `str` accessor가 PyArrow compute로 가속 |
| nullable dtype 일관 처리 | `int64[pyarrow]`는 NA 값을 자연스럽게 지원 |
| Parquet·Arrow IPC 무변환 교환 | zero-copy 가능 |

```python
df = pd.read_csv('dream.csv', dtype_backend='pyarrow')
df.dtypes
# date           timestamp[ns][pyarrow]
# emotion        string[pyarrow]
# intensity      int64[pyarrow]
```

> 주의: `pyarrow>=7.0.0`이 설치돼 있어야 함. pandas 3.0에서는 string이 기본으로 PyArrow-backed가 된다.

### 1.3 Copy-on-Write (CoW)

pandas 2.x에서는 **opt-in**, pandas 3.0에서는 **default**·**강제**.

```python
pd.options.mode.copy_on_write = True   # 2.x에서 명시적으로 켜기
```

CoW가 켜진 상태에서의 핵심 변화:

```python
# CoW ON
df = pd.DataFrame({'a': [1, 2, 3]})
subset = df['a']
subset.iloc[0] = 999
# CoW OFF(과거): df도 999로 변경됨
# CoW ON: df은 그대로 [1, 2, 3], subset만 [999, 2, 3]
```

체인 할당은 `ChainedAssignmentError` 발생:

```python
# 금지 (3.0에서 에러)
df['a'][df['a'] > 1] = 0

# 권장 — loc 사용
df.loc[df['a'] > 1, 'a'] = 0
```

---

## 2. 데이터 입출력

### 2.1 읽기

```python
pd.read_csv('file.csv', dtype_backend='pyarrow')          # CSV
pd.read_excel('file.xlsx', sheet_name=0)                  # Excel (openpyxl/xlrd 필요)
pd.read_json('file.json', orient='records')               # JSON
pd.read_parquet('file.parquet')                           # Parquet (pyarrow/fastparquet 필요)
pd.read_sql('SELECT * FROM users', conn)                  # SQL
```

### 2.2 쓰기

```python
df.to_csv('out.csv', index=False, encoding='utf-8-sig')   # 한국어 엑셀 호환은 utf-8-sig
df.to_excel('out.xlsx', sheet_name='dreams', index=False)
df.to_parquet('out.parquet', compression='snappy')        # 대용량은 parquet 권장
df.to_json('out.json', orient='records', force_ascii=False)
```

> 주의: 한국어 CSV를 Excel에서 열 때 깨짐 방지를 위해 `encoding='utf-8-sig'`(BOM 포함) 사용. UTF-8 그대로 쓰면 Excel 한국어판이 깨뜨릴 수 있음.

---

## 3. 인덱싱 / 선택

| 접근자 | 기준 | 용도 |
|--------|------|------|
| `.loc[row, col]` | **라벨** | 라벨 기반 행/열 선택, slice는 양 끝 포함 |
| `.iloc[row, col]` | **정수 위치** | 0-based 위치, slice는 양 끝 미포함 |
| `.at[row, col]` | 라벨 (스칼라 전용) | 단일 셀 빠른 접근 |
| `.iat[row, col]` | 정수 위치 (스칼라 전용) | 단일 셀 빠른 접근 |

```python
df.loc[0, 'emotion']           # 라벨 0행, 'emotion' 열
df.loc[df['intensity'] >= 4]   # boolean indexing
df.loc[:, ['date', 'emotion']] # 모든 행, 두 컬럼

df.iloc[0, 1]                  # 첫 행, 두 번째 열 (위치 기반)
df.iloc[:3, :]                 # 처음 3행

df.at[0, 'emotion']            # 단일 스칼라 (빠름)
```

> 주의: `df['a'][0]` 형태의 **체인 인덱싱**은 CoW에서 작동하지 않거나 에러. 항상 `.loc[0, 'a']`로 쓴다.

---

## 4. 집계 (`groupby` / `agg` / `pivot_table` / `crosstab`)

### 4.1 groupby + agg

```python
# 단일 집계
df.groupby('emotion')['intensity'].mean()

# 여러 집계 — 컬럼별 다른 함수
df.groupby('emotion').agg({
    'intensity': ['mean', 'std', 'count'],
    'date': 'min',
})

# Named aggregation (pandas 0.25+, 권장)
df.groupby('emotion').agg(
    avg_intensity=('intensity', 'mean'),
    n=('intensity', 'count'),
)
```

> 주의: pandas 2.0부터 `groupby(...)`의 `group_keys` 기본값이 `False`로 변경 (apply 시 그룹 키 중복 제거).

### 4.2 pivot_table

```python
# 행: 월, 열: emotion, 값: intensity 평균
df['month'] = df['date'].dt.to_period('M')
df.pivot_table(
    index='month',
    columns='emotion',
    values='intensity',
    aggfunc='mean',
    fill_value=0,
    margins=True,        # All 행/열 추가
)
```

### 4.3 crosstab

빈도 교차표 — 두 카테고리의 동시 등장 횟수.

```python
pd.crosstab(df['emotion'], df['month'], margins=True)
# emotion × month 행렬, 각 셀은 빈도수
```

---

## 5. 결합 (`merge` / `join` / `concat`)

### 5.1 merge — SQL 조인

```python
pd.merge(left, right, on='user_id', how='inner')
pd.merge(left, right, left_on='uid', right_on='user_id', how='left')

# how: 'left' | 'right' | 'inner' | 'outer' | 'cross'
# indicator=True 추가 시 '_merge' 컬럼이 left_only/right_only/both 표시
```

### 5.2 join — 인덱스 기반

```python
left.join(right, how='left')                     # 인덱스 vs 인덱스
left.join(right.set_index('key'), on='key')      # 컬럼 vs 인덱스
```

### 5.3 concat — 단순 연결

```python
pd.concat([df1, df2], axis=0, ignore_index=True)   # 위아래
pd.concat([df1, df2], axis=1)                       # 좌우
pd.concat([df1, df2], keys=['a', 'b'])              # MultiIndex로 출처 보존
```

---

## 6. 결측값 처리

| 메서드 | 용도 |
|--------|------|
| `df.isna()` / `df.isnull()` | NaN 여부 boolean DataFrame |
| `df.notna()` | 비-NaN boolean |
| `df.dropna(axis=0, how='any')` | NaN 포함 행/열 제거 |
| `df.fillna(0)` | 단일 값으로 채움 |
| `df.fillna(method='ffill')` | 앞 값으로 채움 (시계열에 유용) |
| `df.ffill()` / `df.bfill()` | 전/후방 fill (메서드 명시 API) |

```python
df.fillna({'intensity': 0, 'emotion': 'unknown'})  # 컬럼별 다른 값
df.dropna(subset=['intensity'])                    # 특정 컬럼만 검사
```

> 주의: PyArrow-backed 컬럼에서는 `NaN`이 아니라 `pd.NA`가 결측 표현. `isna()`는 둘 다 잡지만, 비교 연산자(`==`)는 다르게 동작할 수 있음.

---

## 7. 시계열 (datetime / resample / rolling)

### 7.1 datetime 변환

```python
df['date'] = pd.to_datetime(df['date'], format='ISO8601')   # 권장
# format='mixed' — 혼합 포맷 (느리지만 유연)

df['date'].dt.year
df['date'].dt.to_period('M')
df['date'].dt.tz_localize('Asia/Seoul')
df['date'].dt.tz_convert('UTC')
```

> 주의: pandas 2.0+에서는 `datetime64[s|ms|us|ns]` 다양한 해상도 지원. 이전엔 무조건 `ns`로 강제 변환됐음.

### 7.2 resample — 주기 변환

```python
df = df.set_index('date')
df.resample('D').sum()      # 일 단위
df.resample('W').mean()     # 주 단위
df.resample('ME').count()   # 월말 (Month End, 2.2+ 권장)
df.resample('h').mean()     # 시간 단위 (lowercase, 2.2+)
```

> 주의: pandas 2.2에서 `'M'` (월), `'H'` (시간) 등 일부 대문자 alias가 **deprecated**, `'ME'`/`'h'` 등으로 변경.

### 7.3 rolling — 이동 윈도우

```python
df['ma7'] = df['intensity'].rolling(window=7).mean()
df['ma7_min2'] = df['intensity'].rolling(window=7, min_periods=2).mean()

# 시간 기반 윈도우 (인덱스가 DatetimeIndex일 때)
df['intensity'].rolling('7D').mean()
```

---

## 8. 문자열 처리 (`.str` accessor)

```python
df['emotion'].str.lower()
df['emotion'].str.contains('joy', na=False)
df['emotion'].str.replace('joy', '기쁨')
df['emotion'].str.startswith('f')
df['emotion'].str.len()
df['memo'].str.split(',', expand=True)              # 여러 컬럼으로 분리
df['emotion'].str.extract(r'^(?P<cat>\w+)')         # 정규식 그룹 추출
```

**한국어 텍스트:**

```python
df['memo'].str.contains('악몽')                      # 한글 부분 일치
df['memo'].str.findall(r'[가-힣]+')                  # 한글만 추출
df['memo'].str.normalize('NFC')                      # 유니코드 정규화 (조합형/완성형)
```

> 주의: 한국어 형태소 분석·토큰화가 필요하면 짝 스킬 `backend/python-korean-nlp-konlpy`로 처리. `.str` accessor는 단순 패턴 매칭만 담당.

---

## 9. 카테고리형 / 메모리 최적화

### 9.1 `astype('category')`

문자열 컬럼 중 카디널리티가 낮을 때 (반복이 많을 때) 메모리·속도 큰 절감.

```python
df['emotion'] = df['emotion'].astype('category')

df['emotion'].cat.categories         # 카테고리 목록
df['emotion'].cat.codes              # 정수 인코딩
df['emotion'].cat.add_categories(['surprise'])
df['emotion'].cat.set_categories(['joy', 'fear', 'sadness'], ordered=True)
```

### 9.2 메모리 점검

```python
df.memory_usage(deep=True)           # 컬럼별 바이트 (deep=True로 object 정확히 측정)
df.info(memory_usage='deep')
```

**최적화 패턴:**

| 원본 dtype | 권장 dtype | 메모리 절감 |
|-----------|------------|-------------|
| `object` (문자열, 반복 많음) | `category` 또는 `string[pyarrow]` | 5~50배 |
| `int64` (작은 정수) | `int8`/`int16`/`int32` | 2~8배 |
| `float64` (정밀도 불필요) | `float32` | 2배 |

---

## 10. 시각화 통합 (`.plot()`)

pandas의 `DataFrame.plot()` / `Series.plot()`은 **matplotlib**을 기본 백엔드로 사용.

```python
import matplotlib.pyplot as plt

df['intensity'].plot(kind='line')
df.plot(x='date', y='intensity', kind='line', figsize=(10, 4))
df['emotion'].value_counts().plot(kind='bar')
df.plot(kind='scatter', x='date', y='intensity')
df['intensity'].plot(kind='hist', bins=20)
df.plot(kind='box')

plt.show()
```

다른 백엔드 (plotly 등) 사용:

```python
pd.options.plotting.backend = 'plotly'   # 세션 전체
df.plot(backend='matplotlib', kind='line')  # 호출별
```

> 짝 스킬: 본격적인 그래프 커스터마이징·통계 차트는 `backend/python-data-visualization`(matplotlib·seaborn) 참고.
> 노트북에서 인라인 출력은 `backend/python-jupyter-notebook` 참고.

---

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
