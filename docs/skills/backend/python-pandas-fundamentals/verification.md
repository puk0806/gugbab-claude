---
skill: python-pandas-fundamentals
category: backend
version: v1
date: 2026-05-15
status: APPROVED
---

# python-pandas-fundamentals 검증 기록

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `python-pandas-fundamentals` |
| 스킬 경로 | `.claude/skills/backend/python-pandas-fundamentals/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 대상 라이브러리 버전 | pandas 2.2.x (LTS) / 2.3.3 stable, 3.0 변경점 별도 표기 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (pandas.pydata.org/docs)
- [✅] 공식 GitHub 2순위 소스 확인 (pandas-dev/pandas)
- [✅] 최신 버전 기준 내용 확인 (2026-05-15 기준 pandas 2.3.3 / 3.0.0 출시 확인)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (13개 섹션)
- [✅] 코드 예시 작성 (꿈 일기 분석 예시 포함)
- [✅] 흔한 실수 패턴 정리 (체인 인덱싱·inplace·dtype 추론 등 6개)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 1 | WebSearch | "pandas 2.x latest version 2026 pyarrow backend copy-on-write" | pandas 2.3.3 stable + 3.0.0(2026-01-21) 출시 확인, CoW 기본화 |
| 조사 2 | WebSearch | "pandas 2.0 release notes PyArrow dtype_backend changes from 1.x" | dtype_backend='pyarrow' 추가, NumPy 기반 변경 |
| 조사 3 | WebFetch | https://pandas.pydata.org/docs/whatsnew/v2.0.0.html | v2.0 breaking changes 8개 추출 (datetime 해상도, Index dtype, value_counts naming 등) |
| 조사 4 | WebFetch | https://pandas.pydata.org/docs/user_guide/copy_on_write.html | CoW 활성화·체인 할당 금지·read-only NumPy 동작 정리 |
| 조사 5 | WebSearch | "pandas groupby agg pivot_table crosstab official documentation 2.x" | groupby/pivot_table/crosstab 공식 API 확인 |
| 조사 6 | WebSearch | "pandas indexing loc iloc at iat boolean indexing official 2.x" | .loc/.iloc/.at/.iat 정의·boolean indexing 확인 |
| 조사 7 | WebSearch | "pandas merge join concat official documentation how parameter examples" | merge how 파라미터·join 인덱스 기반·concat axis 확인 |
| 조사 8 | WebSearch | "pandas resample rolling datetime official 2.x time series" | resample 'ME'/'h' alias 변경(2.2+) 확인 |
| 조사 9 | WebSearch | "pandas string accessor str methods category dtype memory optimization" | .str accessor·category dtype 최적화 패턴 확인 |
| 조사 10 | WebSearch | "pandas missing data isna fillna dropna NaN handling official 2.x" | isna/dropna/fillna 표준 패턴 확인 |
| 조사 11 | WebSearch | "pandas DataFrame plot matplotlib backend visualization 2.x" | DataFrame.plot()·plotting.backend 옵션 확인 |
| 교차 검증 | WebSearch | 6개 핵심 클레임, 독립 소스 2개 이상 | VERIFIED 6 / DISPUTED 0 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| pandas What's new v2.0.0 | https://pandas.pydata.org/docs/whatsnew/v2.0.0.html | ⭐⭐⭐ High | 2026-05-15 | 공식 릴리스 노트 |
| pandas Copy-on-Write 가이드 | https://pandas.pydata.org/docs/user_guide/copy_on_write.html | ⭐⭐⭐ High | 2026-05-15 | 공식 user guide |
| pandas Indexing 가이드 | https://pandas.pydata.org/docs/user_guide/indexing.html | ⭐⭐⭐ High | 2026-05-15 | 공식 user guide |
| pandas Merging 가이드 | https://pandas.pydata.org/docs/user_guide/merging.html | ⭐⭐⭐ High | 2026-05-15 | 공식 user guide |
| pandas Time series 가이드 | https://pandas.pydata.org/docs/user_guide/timeseries.html | ⭐⭐⭐ High | 2026-05-15 | 공식 user guide |
| pandas Text data 가이드 | https://pandas.pydata.org/docs/user_guide/text.html | ⭐⭐⭐ High | 2026-05-15 | 공식 user guide |
| pandas Categorical data | https://pandas.pydata.org/docs/user_guide/categorical.html | ⭐⭐⭐ High | 2026-05-15 | 공식 user guide |
| pandas Reshaping (pivot) | https://pandas.pydata.org/docs/user_guide/reshaping.html | ⭐⭐⭐ High | 2026-05-15 | 공식 user guide |
| pandas Visualization | https://pandas.pydata.org/docs/user_guide/visualization.html | ⭐⭐⭐ High | 2026-05-15 | 공식 user guide |
| pandas What's new v2.2.0 | https://pandas.pydata.org/docs/whatsnew/v2.2.0.html | ⭐⭐⭐ High | 2026-05-15 | freq alias 변경(ME, h) 확인 |
| pandas What's new v3.0.0 | https://pandas.pydata.org/docs/whatsnew/v3.0.0.html | ⭐⭐⭐ High | 2026-05-15 | 3.0 변경점 참조용 (본문 별도 표기) |
| PDEP-10 PyArrow dependency | https://pandas.pydata.org/pdeps/0010-required-pyarrow-dependency.html | ⭐⭐⭐ High | 2026-05-15 | PyArrow 정책 |

---

## 4. 검증 체크리스트 (교차 검증 결과)

### 4-1. 핵심 클레임 판정

| 클레임 | 소스 1 | 소스 2 | 판정 |
|--------|--------|--------|------|
| pandas 2.0부터 `dtype_backend='pyarrow'` 인자가 read_csv/read_excel/read_json/read_parquet에 추가됨 | What's new v2.0.0 | PDEP-10 | VERIFIED |
| Copy-on-Write는 pandas 2.x에서 opt-in (`mode.copy_on_write=True`), pandas 3.0에서 default·강제 | CoW 가이드 | What's new v3.0.0 | VERIFIED |
| pandas 2.0부터 datetime64는 s/ms/us/ns 4종 해상도 지원 (이전엔 ns 고정) | What's new v2.0.0 | DatetimeIndex.as_unit 문서 | VERIFIED |
| pandas 2.2부터 freq alias `'M'`→`'ME'`, `'H'`→`'h'` 등 일부 deprecated | What's new v2.2.0 | resample 문서 | VERIFIED |
| `.loc`은 라벨, `.iloc`은 정수 위치, `.at`/`.iat`은 스칼라 전용 빠른 접근 | Indexing 가이드 | DataFrame.iloc API 문서 | VERIFIED |
| `DataFrame.plot()`은 matplotlib 기본 백엔드, `pd.options.plotting.backend`로 변경 가능 | Visualization 가이드 | DataFrame.plot API 문서 | VERIFIED |

### 4-2. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (pandas 2.2.x / 2.3.3, 3.0 차이 별도 표기)
- [✅] deprecated된 패턴을 권장하지 않음 (`'M'` 대신 `'ME'`, `inplace=True` 대안 제시)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-3. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (`> 소스:`, `> 검증일:` 형식)
- [✅] 핵심 개념 설명 포함 (Series/DataFrame, PyArrow backend, CoW)
- [✅] 코드 예시 포함 (각 섹션 + 통합 예시)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (짝 스킬 안내)
- [✅] 흔한 실수 패턴 포함 (6개)

### 4-4. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (꿈 일기 분석)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-5. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-05-15)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-05-15)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — gap 없음, 보완 불필요

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (도메인 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. `.loc` vs `.iloc` 차이 — slice 양 끝 포함 여부까지 정확히 설명할 수 있는가**
- PASS
- 근거: SKILL.md "3. 인덱싱 / 선택" 섹션 (129-147행)
- 상세: `.loc` = 라벨 기반·slice 양 끝 포함, `.iloc` = 정수 위치(0-based)·slice 양 끝 미포함 명확히 구분. boolean indexing, 다중 컬럼 선택 예시도 제시됨. 체인 인덱싱 금지 주의사항 별도 명시.

**Q2. 체인 인덱싱 함정 — CoW 환경에서 `df[df['a']>0]['b'] = 99`가 왜 안 되는가, 어떻게 고치는가**
- PASS
- 근거: SKILL.md "1.3 Copy-on-Write (CoW)" 섹션 (71-98행) + "12.1 체인 인덱싱" 섹션 (393-401행)
- 상세: 두 섹션이 상호 보완적으로 문제 원인(ChainedAssignmentError)과 해결법(`df.loc[df['a'] > 0, 'b'] = 99`) 모두 명시. CoW ON/OFF 동작 차이도 예시 코드로 설명됨. anti-pattern(`df['a'][df['a'] > 1] = 0`)과 권장 패턴 분리 기술.

**Q3. groupby + agg Named aggregation 패턴 + 한국어 CSV를 Excel에서 열 때 깨짐 없이 저장하는 방법**
- PASS
- 근거: SKILL.md "4.1 groupby + agg" 섹션 (153-172행) + "2.2 쓰기" 섹션 (114-124행)
- 상세: Named aggregation(`avg_intensity=('intensity', 'mean')`) 패턴 명시, `group_keys=False` 변경 주의사항도 포함. `encoding='utf-8-sig'`(BOM 포함) 이유와 함께 명확히 기재됨.

### 발견된 gap

없음 — 3개 질문 모두 SKILL.md 내 명확한 근거 섹션 존재, anti-pattern 회피 확인됨.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 — 실사용 필수 카테고리 해당 없음
- 최종 상태: APPROVED

---

> 아래는 최초 작성 시 예정 케이스 (참고용 보존)

### 예정 테스트 케이스 (참고)

**케이스 1: CSV → 월별 빈도 집계**
- 질문: "한글 메모가 포함된 CSV 파일을 pandas로 읽어 월별 발생 빈도를 구하려면? PyArrow 백엔드로 최적화하고 싶다."
- 기대 경로: `pd.read_csv(..., dtype_backend='pyarrow', encoding='utf-8')` → `df['date'] = pd.to_datetime(df['date'])` → `df.groupby(df['date'].dt.to_period('M')).size()`

**케이스 2: 카테고리·교차표**
- 질문: "DataFrame에서 emotion과 month 두 카테고리의 빈도 교차표를 만들고 행/열 소계도 함께 보고 싶다."
- 기대 경로: `pd.crosstab(df['emotion'], df['month'], margins=True)`

**케이스 3: CoW 환경에서 SettingWithCopyWarning 회피**
- 질문: "pandas 2.2 + CoW=True 환경에서 `df[df['x']>0]['y'] = 1`이 안 먹힌다. 어떻게 고쳐야 하나?"
- 기대 경로: 체인 인덱싱 회피 + `df.loc[df['x']>0, 'y'] = 1`로 변경

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-15, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

**판정 근거:**
- 공식 문서 기반 작성 + 6개 핵심 클레임 모두 VERIFIED → 내용은 신뢰 가능
- skill-tester agent content test 3/3 PASS (Q1 .loc/.iloc / Q2 체인 인덱싱·CoW / Q3 groupby+agg+utf-8-sig)
- 카테고리 분류: 라이브러리 사용법 스킬 — 실사용 필수 카테고리 해당 없음 → APPROVED 전환 가능

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS)
- [❌] 학위논문 분석 실데이터로 통합 예시 검증 (실사용 후 추가) — 차단 요인 아님, 선택 보강 항목
- [❌] pandas 3.0 본격 사용 시 별도 마이그레이션 가이드 스킬 검토 — 차단 요인 아님, 향후 독립 스킬 작성 권장
- [❌] PyArrow 백엔드 전환 시 NumPy 의존 코드 호환성 사례 추가 — 차단 요인 아님, 선택 보강 항목

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성 — pandas 2.2.x/2.3.3 기준 13개 섹션, 6개 클레임 교차 검증 VERIFIED | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 .loc vs .iloc slice 규칙 / Q2 체인 인덱싱 CoW 함정 / Q3 groupby+agg Named aggregation+utf-8-sig) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
