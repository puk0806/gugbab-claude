# data-analyst

> 제품의 이벤트 택소노미 설계, 퍼널 분석 설계, A/B 테스트 계획, KPI 대시보드 스키마 정의, 분석용 SQL 쿼리 작성을 수행하는 데이터 분석 설계 에이전트

| 항목 | 내용 |
|------|------|
| 파일 | `.claude/agents/research/data-analyst.md` |
| 모델 | Sonnet |
| 도구 | Read, Write, Glob, Grep, WebSearch, WebFetch |
| 호출 | 사용자 직접 호출 또는 오케스트레이터가 데이터 분석 설계 필요 시 호출 |

## 역할

실제 데이터 접근은 제한적이지만, 분석 설계와 SQL 쿼리 작성에 집중하는 에이전트입니다. 다음 5가지 산출물을 생성합니다:

1. **이벤트 택소노미** — 이벤트명, 속성, 트리거 시점 정의
2. **퍼널 분석 설계** — 단계, 이탈 포인트, 측정 방법
3. **A/B 테스트 계획서** — 가설, 변수, 표본 크기, 성공 기준
4. **KPI 대시보드 스키마** — 지표, 차원, 시각화 타입
5. **SQL 쿼리** — 분석용 쿼리

## 방법론 근거

에이전트에 내장된 분석 방법론은 다음 업계 표준 소스에서 검증되었습니다.

### 이벤트 택소노미

- **Object-Action 네이밍**: Amplitude, Mixpanel, Segment 3사 공통 권장 형식
- **과거 시제 사용**: `page_viewed`, `button_clicked` (업계 표준)
- **snake_case**: Mixpanel 공식 문서 권장, 데이터 웨어하우스 호환성 확보
- **Outcome-driven 설계**: 비즈니스 결과와 연결되는 이벤트만 추적 (Amplitude 권장)

> 소스: [Amplitude Event Taxonomy](https://amplitude.com/explore/data/event-taxonomy), [Mixpanel Events Docs](https://docs.mixpanel.com/docs/data-structure/events-and-properties), [Avo Naming Conventions](https://www.avo.app/docs/data-design/best-practices/naming-conventions)

### 퍼널 분석

- **5-7단계 제한**: 단계가 많을수록 분석 복잡도 증가, 집중된 다수 퍼널이 효과적
- **시간 차원(Conversion Window)**: 정확한 전환 측정에 필수 요소
- **표준화된 지표 정의**: 조직 전체 일관성 확보

> 소스: [data36 Funnel Analysis](https://data36.com/funnel-analysis/), [Amplitude Funnel Analysis Guide](https://amplitude.com/blog/funnel-analysis-in-five-industries)

### A/B 테스트

- **Power Analysis 기반 표본 크기**: α=0.05, 1-β=0.80 업계 표준 설정
- **MDE(최소 감지 효과)**: 표본 크기에 결정적 영향을 미치는 핵심 파라미터
- **가드레일 지표**: 실험이 다른 지표를 악화시키지 않는지 모니터링

> 소스: [Optimizely Sample Size Calculator](https://www.optimizely.com/sample-size-calculator/), [AB Tasty Sample Size Best Practices](https://www.abtasty.com/blog/sample-size-calculation/), [Evan Miller A/B Tools](https://www.evanmiller.org/ab-testing/sample-size.html)

### KPI 대시보드

- **5-10개 지표 제한**: actionable한 지표만 포함 (Tableau, Statsig 권장)
- **좌상단 고영향 배치**: 시선 흐름 기반 레이아웃
- **비교 기준 필수 포함**: 벤치마크, 전 기간, 목표치 대비

> 소스: [Tableau KPI Dashboard](https://www.tableau.com/kpi/what-is-kpi-dashboard), [Statsig KPI Dashboard Design](https://www.statsig.com/perspectives/kpi-dashboard-design-tips-metrics), [DataCamp Dashboard Design](https://www.datacamp.com/tutorial/dashboard-design-tutorial)

## 사용 예시

```
사용자: "이커머스 서비스의 이벤트 택소노미 설계해줘"
→ 핵심 이벤트 목록, 속성 정의, 이벤트 흐름도 출력

사용자: "회원가입 퍼널 분석 설계해줘"
→ 퍼널 단계, 이탈 포인트, 세그먼트, Conversion Window 출력

사용자: "결제 버튼 색상 A/B 테스트 계획 짜줘"
→ 가설, 변수, 표본 크기, 성공 기준, 리스크 출력
```

## 검증일

2026-04-20
