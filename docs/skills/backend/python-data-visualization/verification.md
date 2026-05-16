---
skill: python-data-visualization
category: backend
version: v1
date: 2026-05-15
status: APPROVED
---

# python-data-visualization 검증 문서

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증) — 완료
  ├─ matplotlib/seaborn/plotly 공식 문서 기반 작성
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST  ← 지금 바로 쓸 수 있음. 내용은 신뢰 가능.

[2단계] skill-tester 호출 — 메인 세션에서 수행 예정
```

### 판정 상태 의미

| 상태 | 의미 | 사용 가능 여부 |
|------|------|--------------|
| `PENDING_TEST` | 내용 검증 완료, CLI 테스트 미실시 | ✅ 사용 가능 |
| `APPROVED` | 모든 검증 완료 | ✅ 사용 가능 |
| `NEEDS_REVISION` | 테스트에서 오류 발견, 수정 필요 | ⚠️ 주의해서 사용 |

> 본 스킬은 **content test 가능 카테고리(경계선)** 입니다. 라이브러리 사용법 + 함정 회피 패턴이 주가 되므로 답변 정확성으로 검증 가능합니다. 단, "matplotlib 저장 출력이 실제 PDF로 잘 나오는가" 같은 실행 산출물 검증이 의미 있는 항목도 일부 포함되어 있어 *완전한 content-only*는 아닙니다. 메인 세션의 skill-tester 판정에 따릅니다.

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `python-data-visualization` |
| 스킬 경로 | `.claude/skills/backend/python-data-visualization/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator (Claude) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (matplotlib.org, seaborn.pydata.org, plotly.com/python)
- [✅] 공식 GitHub 2순위 소스 확인 (matplotlib/matplotlib, plotly/plotly.py)
- [✅] 최신 버전 기준 내용 확인 (2026-05-15): matplotlib 3.10.x, seaborn 0.13.2, plotly 6.7.0
- [✅] 라이브러리 선택 가이드 정리 (정적 vs 인터랙티브, 논문 vs 웹)
- [✅] 한국어 폰트 설정 패턴 정리 (rcParams + font_manager.addfont)
- [✅] 색맹 친화 팔레트 정리 (viridis, cividis, ColorBrewer, tableau-colorblind10)
- [✅] pandas 통합 패턴 정리 (df.plot, seaborn data=, plotly express)
- [✅] 통계 시각화 함수 정리 (distplot deprecation 포함)
- [✅] 학술 출판 품질 가이드 (DPI, figsize, 형식, 글꼴 크기)
- [✅] Jupyter 통합 (%matplotlib inline/widget, ipympl)
- [✅] 흔한 함정 정리 (한글 깨짐, unicode_minus, 메모리 누수, tight_layout)
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | matplotlib 3.x latest + Korean font NanumGothic | 3.10.9 stable 확인, rcParams 패턴 확인 |
| 조사 | WebSearch | seaborn 0.13 distplot deprecated displot histplot | 0.13.2 안정, distplot v0.14 제거 예정 확인 |
| 조사 | WebSearch | plotly python 5.x latest 2026 dash | plotly 6.7.0(2026-04-09)이 실제 최신임 확인 |
| 조사 | WebSearch | matplotlib font_manager.addfont 사용법 | addfont(path) + rcParams 패턴 확인 |
| 조사 | WebSearch | matplotlib savefig dpi 300 bbox_inches tight | 300 DPI + bbox_inches="tight" 베스트 프랙티스 확인 |
| 조사 | WebSearch | matplotlib memory leak plt.close | plt.close(fig) 명시 호출, "all" 옵션 확인 |
| 조사 | WebSearch | jupyter %matplotlib inline widget ipympl 2026 | ipympl 패키지로 widget 백엔드 활성화 확인 |
| 조사 | WebSearch | seaborn heatmap boxplot jointplot data DataFrame | data=df + 컬럼명 문자열 패턴 확인 |
| 조사 | WebSearch | matplotlib viridis colorblind ColorBrewer set_palette | viridis/cividis 색맹 친화, tableau-colorblind10 스타일 확인 |
| 조사 | WebSearch | plotly 6.0 breaking changes 5.x migration | titlefont→title.font, Notebook 7+ 필수 확인 |
| 조사 | WebFetch | https://pypi.org/project/plotly/ | plotly 6.7.0 (2026-04-09) 최신 확인 |
| 조사 | WebFetch | https://pypi.org/project/seaborn/ | seaborn 0.13.2 (2024-01-25) 최신 확인 |
| 교차 검증 | WebSearch + WebFetch | 11개 클레임, 독립 소스 ≥2개 | VERIFIED 10 / DISPUTED 1 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| matplotlib 공식 | https://matplotlib.org/stable/index.html | ⭐⭐⭐ High | 2026-05-15 | 공식 문서 |
| matplotlib Fonts 가이드 | https://matplotlib.org/stable/users/explain/text/fonts.html | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| matplotlib font_manager API | https://matplotlib.org/stable/api/font_manager_api.html | ⭐⭐⭐ High | 2026-05-15 | 공식 (403 fetch 실패, 검색 결과로 보완) |
| matplotlib savefig API | https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.savefig.html | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| matplotlib Colormap reference | https://matplotlib.org/stable/gallery/color/colormap_reference.html | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| matplotlib pyplot.close | https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.close.html | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| matplotlib GitHub Releases | https://github.com/matplotlib/matplotlib/releases | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| seaborn 공식 | https://seaborn.pydata.org/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| seaborn distplot deprecation 가이드 | https://gist.github.com/mwaskom/de44147ed2974457ad6372750bbe5751 | ⭐⭐⭐ High | 2026-05-15 | seaborn 저자(mwaskom) Gist |
| seaborn heatmap | https://seaborn.pydata.org/generated/seaborn.heatmap.html | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| seaborn jointplot | https://seaborn.pydata.org/generated/seaborn.jointplot.html | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| seaborn PyPI | https://pypi.org/project/seaborn/ | ⭐⭐⭐ High | 2026-05-15 | 0.13.2 최신 확인 |
| plotly Python 공식 | https://plotly.com/python/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| plotly Interactive HTML export | https://plotly.com/python/interactive-html-export/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| plotly v6 migration 가이드 | https://plotly.com/python/v6-migration/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| plotly CHANGELOG | https://github.com/plotly/plotly.py/blob/main/CHANGELOG.md | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| plotly PyPI | https://pypi.org/project/plotly/ | ⭐⭐⭐ High | 2026-05-15 | 6.7.0 최신 확인 |
| Dash 공식 | https://dash.plotly.com/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| ipympl (matplotlib widget) | https://matplotlib.org/ipympl/ | ⭐⭐⭐ High | 2026-05-15 | 공식 |
| ColorBrewer | https://colorbrewer2.org/ | ⭐⭐⭐ High | 2026-05-15 | 색상 표준 |

---

## 4. 검증 체크리스트

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보 명시 (matplotlib 3.10.x / seaborn 0.13.2 / plotly 6.7.0)
- [✅] deprecated된 패턴(distplot, titlefont 등)을 권장하지 않음 — 대체 표 제공
- [✅] 코드 예시가 실행 가능한 형태

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description + 4 example)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함 (Figure/Axes 구조, axes-level vs figure-level)
- [✅] 코드 예시 포함 (12개 섹션 다수 스니펫)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (§0, §2)
- [✅] 흔한 실수 패턴 포함 (§11 — 8개 함정)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (§12 빠른 시작 템플릿 복붙 가능)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. 클레임별 교차 검증 결과

| # | 클레임 | 판정 | 근거 |
|---|--------|------|------|
| 1 | matplotlib 최신 안정은 3.10.x이다 | VERIFIED | PyPI + GitHub Releases 일치 |
| 2 | seaborn 최신 안정은 0.13.2 (2024-01-25)이다 | VERIFIED | PyPI 페이지 직접 확인 |
| 3 | plotly Python 최신 안정은 6.7.0 (2026-04-09)이다 | DISPUTED→수정반영 | 사용자 요청은 "5.x"였으나 실제 최신은 6.7.0. SKILL.md §1에 주의문구 포함, §6.5에 5→6 마이그레이션 포인트 추가 |
| 4 | seaborn `distplot`은 deprecated이며 v0.14에서 제거 예정 | VERIFIED | 공식 distplot 페이지 + 저자 Gist 일치 |
| 5 | `histplot`/`displot`이 `distplot` 대체 | VERIFIED | 저자 Gist 명시 |
| 6 | `plt.rcParams["axes.unicode_minus"] = False`로 한글 폰트의 마이너스 깨짐 방지 | VERIFIED | 복수 한국어 기술 블로그 + 공식 rcParams 문서 일치 |
| 7 | `font_manager.fontManager.addfont(path)`로 시스템 설치 없이 폰트 추가 가능 | VERIFIED | 공식 font_manager API + 복수 가이드 일치 |
| 8 | viridis는 색맹 친화 + 흑백 인쇄에도 perceptually uniform | VERIFIED | matplotlib 공식 colormap 페이지 + bids.github.io/colormap 일치 |
| 9 | `plt.close(fig)` 미호출 시 figure 누적으로 메모리 누수 | VERIFIED | matplotlib pyplot.close 공식 + 복수 issue/dev 글 일치 |
| 10 | plotly 6.x는 Jupyter Notebook 7+ 필수 | VERIFIED | CHANGELOG + v6 migration 가이드 일치 |
| 11 | `%matplotlib widget`는 ipympl 패키지 필요 | VERIFIED | ipympl 공식 + PyPI 일치 |

**판정 요약:** VERIFIED 10 / DISPUTED 1 (사용자 요청 버전 불일치 → SKILL.md에 정정 반영) / UNVERIFIED 0

---

## 5. 테스트 진행 기록

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 미등록으로 대체)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 도커/서버 환경에서 OS 설치 없이 .ttf 파일로 한국어 폰트 등록 + unicode_minus 처리**
- PASS
- 근거: SKILL.md "§4.2 폰트 파일을 직접 등록 (font_manager.addfont)" 섹션
- 상세: `font_manager.fontManager.addfont(font_path)` 패턴, `plt.rcParams["axes.unicode_minus"] = False` 필수, 서버·도커 환경 명시, `addfont()` 매 프로세스 호출 주의사항 — 모두 SKILL.md에 명확히 기술됨

**Q2. 학술지 논문 PDF 그림 vs 블로그 HTML 인터랙티브 용도별 라이브러리 선택 기준**
- PASS
- 근거: SKILL.md "§2.1 의사결정 트리" + "§2.2 사용 사례별 권장" 표
- 상세: 논문 PDF → matplotlib(1순위)/seaborn(2순위)/plotly "사용하지 않음"(래스터 변환 필요·폰트 매칭 어려움), 블로그·웹 HTML → plotly(1순위)/matplotlib "사용하지 않음"(정적) — 양방향 anti-pattern 모두 SKILL.md에 명시됨

**Q3. plotly 5.x → 6.x 마이그레이션 (titlefont 속성 변경, 삭제된 trace, Jupyter 호환성)**
- PASS
- 근거: SKILL.md "§6.5 plotly 5.x → 6.x 마이그레이션 포인트" 표 + "§11.6 plotly 6.x로 올렸더니 차트가 안 보임"
- 상세: `layout.titlefont` → `layout.title.font`, `pointcloud`/`heatmapgl` trace 삭제, Notebook 7+ 필수, `mapbox-*` deprecated → `map_*` 전환 — 모두 SKILL.md에 명시됨

### 발견된 gap (있으면)

없음. 3/3 PASS, 보강 권장 항목 없음.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 (content test만으로 APPROVED 전환 가능)
- 최종 상태: APPROVED

---

> (참고용 원본 템플릿 — skill-tester 수행 전 예정 기록)
> skill-tester 에이전트가 메인 세션에서 호출하여 작성합니다.
> (skill-tester 미수행 — 메인 세션에서 호출 후 채워질 예정)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-05-15 수행, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [x] skill-tester 호출 후 실전 질문 결과 반영 (§5) (2026-05-15 완료, 3/3 PASS)
- [ ] 짝 스킬 `backend/python-pandas-fundamentals`, `backend/python-jupyter-notebook`이 생성되면 SKILL.md 짝 스킬 표시에서 "현재 레포에 미존재할 수 있음" 문구 제거
- [ ] mapbox→map_* 마이그레이션(plotly 6.x deprecated)이 정식 제거되면 §6.5 표 업데이트

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성. matplotlib 3.10.x + seaborn 0.13.2 + plotly 6.7.0 기준. 사용자 요청 "plotly 5.x"는 실제 최신(6.x)로 정정 반영 | skill-creator (Claude) |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 도커환경 한국어폰트 addfont / Q2 matplotlib·seaborn·plotly 선택기준 / Q3 plotly 5→6 마이그레이션) → 3/3 PASS, APPROVED 전환 | skill-tester |
