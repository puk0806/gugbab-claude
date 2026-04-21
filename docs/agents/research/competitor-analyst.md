# competitor-analyst 에이전트 검증 문서

## 기본 정보

| 항목 | 내용 |
|------|------|
| 에이전트 | competitor-analyst |
| 카테고리 | research |
| 모델 | sonnet (claude-sonnet-4-6) |
| 검증일 | 2026-04-20 |
| 최종 판정 | PENDING_TEST |

## 사용된 분석 프레임워크 및 검증

### 1. 경쟁 분석 프레임워크 (Competitive Analysis Framework)

**클레임**: 5-10개 경쟁사 선정, 직접/간접 경쟁사 구분, 5개 필수 분석 영역(제품, 마케팅, 비즈니스 모델, 운영, 재무) 포함

| 소스 | 신뢰도 | 판정 |
|------|--------|------|
| [Asana - Competitive Analysis Guide 2026](https://asana.com/resources/competitive-analysis-example) | High | VERIFIED |
| [Monday.com - Competitive Analysis Guide 2026](https://monday.com/blog/marketing/competitive-analysis/) | High | VERIFIED |
| [AlphaSense - Competitor Analysis Framework](https://www.alpha-sense.com/blog/product/competitor-analysis-framework/) | High | VERIFIED |
| [PM Prompt - Competitive Analysis for PMs 2025](https://pmprompt.com/blog/competitive-analysis-framework) | Medium | VERIFIED |

**판정: VERIFIED** - 다수의 신뢰할 수 있는 소스에서 일관된 프레임워크 확인.

### 2. SWOT 분석 (SWOT Analysis)

**클레임**: 내부(Strengths, Weaknesses) / 외부(Opportunities, Threats) 구분, 데이터 기반 접근, 경쟁사 대비 상대적 평가

| 소스 | 신뢰도 | 판정 |
|------|--------|------|
| [Pepperdine Business School - SWOT Best Practices](https://bschool.pepperdine.edu/personal-growth/article/best-practices-for-successful-swot-analysis.htm) | High | VERIFIED |
| [KU Community Tool Box - SWOT Analysis](https://ctb.ku.edu/en/table-of-contents/assessment/assessing-community-needs-and-resources/swot-analysis/main) | High | VERIFIED |
| [ClearPoint Strategy - SWOT Guide 2026](https://www.clearpointstrategy.com/blog/swot-analysis-examples) | High | VERIFIED |
| [SM Insight - SWOT How To](https://strategicmanagementinsight.com/tools/swot-analysis-how-to-do-it/) | Medium | VERIFIED |

**판정: VERIFIED** - 학술 및 실무 소스 모두에서 방법론 확인. 핵심 원칙(구체성, 상대적 평가, 데이터 기반)도 일관되게 권장됨.

### 3. 기능 비교표 (Feature Matrix)

**클레임**: 카테고리별 기능 분류, 행(기능) x 열(경쟁사) 구조, 12-15개 기능 기준, 강점→약점 순 배치

| 소스 | 신뢰도 | 판정 |
|------|--------|------|
| [ProductSide - Feature Comparison Chart](https://productside.com/free-competitive-matrix-feature-comparison-chart/) | High | VERIFIED |
| [Crayon - Competitive Matrix Guide](https://www.crayon.co/blog/competitive-matrix-examples) | High | VERIFIED |
| [HubSpot - Competitive Matrix Guide](https://blog.hubspot.com/marketing/competitive-matrix) | High | VERIFIED |
| [Compttr - Feature Comparison Matrix Guide](https://compttr.com/en/blog/feature-comparison-matrix-guide) | Medium | VERIFIED |

**판정: VERIFIED** - 업계 표준 형식. 카테고리별 분류와 강점→약점 순 배치는 ProductSide, Crayon에서 명시적으로 권장.

### 4. 시장 포지셔닝 맵 (Perceptual Map)

**클레임**: 2축 기반 시장 위치 시각화, 고객 관점 속성 선택, 경쟁사 및 자사 위치 표시

| 소스 | 신뢰도 | 판정 |
|------|--------|------|
| [Harvard Business School - Perceptual Mapping](https://online.hbs.edu/blog/post/perceptual-map) | High | VERIFIED |
| [Atlassian - Perceptual Mapping Guide](https://www.atlassian.com/work-management/project-management/perceptual-mapping) | High | VERIFIED |
| [SurveyMonkey - Perceptual Maps](https://www.surveymonkey.com/market-research/resources/perceptual-maps-to-differentiate-your-brand/) | High | VERIFIED |

**판정: VERIFIED** - Harvard Business School에서 방법론 검증. 2축 구조와 고객 관점 속성 선택이 표준으로 확인됨.

### 5. Porter's Five Forces

**클레임**: 에이전트 보고서 참조 프레임워크로 포함. 5개 경쟁 요인 (신규 진입자 위협, 공급자 교섭력, 구매자 교섭력, 대체재 위협, 기존 경쟁)

| 소스 | 신뢰도 | 판정 |
|------|--------|------|
| [Harvard Business School - The Five Forces](https://www.isc.hbs.edu/strategy/business-strategy/Pages/the-five-forces.aspx) | High | VERIFIED |
| [Wikipedia - Porter's Five Forces](https://en.wikipedia.org/wiki/Porter's_five_forces_analysis) | Medium | VERIFIED |

**판정: VERIFIED** - Michael Porter 본인이 재직 중인 Harvard ISC에서 원본 프레임워크 확인.

## 검증 요약

| 프레임워크 | 판정 | 소스 수 |
|------------|------|---------|
| 경쟁 분석 프레임워크 | VERIFIED | 4 |
| SWOT 분석 | VERIFIED | 4 |
| 기능 비교표 | VERIFIED | 4 |
| 시장 포지셔닝 맵 | VERIFIED | 3 |
| Porter's Five Forces | VERIFIED | 2 |

## 최종 판정

**PENDING_TEST** - 모든 프레임워크가 공식/학술 소스에서 검증됨. 실사용 테스트 후 APPROVED로 전환 예정.
