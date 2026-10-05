## 4. 반응형 (Responsive)

### 4-1. Recharts — `ResponsiveContainer`

```tsx
<ResponsiveContainer width="100%" aspect={2} debounce={50}>
  <LineChart data={data}>...</LineChart>
</ResponsiveContainer>
```

검증된 props (공식 API):
- `width`: `"100%"` 등 백분율 문자열 또는 픽셀 숫자 (default `"100%"`)
- `height`: 동일 형식 (default `"100%"`)
- `aspect`: 너비/높이 비율. 지정 시 높이 = width / aspect
- `debounce`: 리사이즈 핸들러 debounce ms (default 0)

부모가 명시적 높이를 가져야 한다. 그렇지 않으면 차트가 0px 높이로 렌더링된다.

### 4-2. visx — `useParentSize` 또는 `useResizeObserver`

visx는 ResponsiveContainer가 없다. `@visx/responsive`의 `ParentSize`/`withParentSize`를 사용한다.

```tsx
import { ParentSize } from '@visx/responsive';

<ParentSize>
  {({ width, height }) => <DreamSymbolCloud words={words} width={width} height={height} />}
</ParentSize>
```

---

## 5. 접근성 (Accessibility)

### 5-1. SVG 차트 ARIA 패턴 (W3C 권장)

```html
<svg role="img" aria-labelledby="chart-title chart-desc">
  <title id="chart-title">월별 꿈 빈도</title>
  <desc id="chart-desc">2026년 1월 5건에서 4월 18건으로 증가 추세.</desc>
  ...
</svg>
```

WCAG 2.0/2.1 Level A 요구사항:
- SVG에 `role="img"` 명시 → 스크린리더가 그래픽으로 인식
- `<title>` 짧은 라벨, `<desc>` 상세 설명. `aria-labelledby`로 둘 다 참조 가능
- 또는 컨테이너 `<div>`에 `role="img"` + `aria-label`로 단일 라벨 부여 (간단 케이스)

### 5-2. 테이블 대안 텍스트 (필수)

차트 옆에 `<details>`로 접힌 표를 함께 제공한다. 스크린리더 사용자·인쇄·데이터 검증 모두에 유용하다.

```tsx
function FallbackTable({ data }: { data: { name?: string; month?: string; value?: number; count?: number }[] }) {
  return (
    <details>
      <summary>표로 보기</summary>
      <table>
        <thead><tr><th>항목</th><th>값</th></tr></thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td>{d.name ?? d.month}</td>
              <td>{d.value ?? d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
```

### 5-3. 키보드 네비게이션

- 인터랙티브 요소(툴팁 토글, 범례 클릭 등)는 `tabIndex={0}` + `onKeyDown`(Enter/Space) 처리
- Recharts `Legend`는 기본적으로 키보드 포커스 가능. visx 직접 조립 차트는 직접 처리 필요
- 포커스 outline 제거 금지 — `:focus-visible` 스타일을 명시적으로 유지

---

## 6. 색맹 친화 팔레트

### 6-1. 카테고리컬 (Pie·Bar 등)

**ColorBrewer Dark2 / Set2** (6색 이내) — Wong 팔레트도 권장.

```ts
export const COLORS_CB_SAFE = ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02'];
```

> 주의: ColorBrewer에서 "color blind safe" 필터를 켜면 카테고리컬 팔레트는 최대 4색까지만 검증된다. 5색 이상 필요하면 Wong 팔레트(`#000000 #E69F00 #56B4E9 #009E73 #F0E442 #0072B2 #D55E00 #CC79A7`) 사용을 검토한다.

### 6-2. 시퀀셜·연속값 (Heatmap·Choropleth)

**Viridis** 계열 — 색맹·흑백 인쇄 모두 perceptually uniform.

```ts
export const VIRIDIS_2STOP = ['#440154', '#fde725']; // 보라 → 노랑
export const VIRIDIS_5STOP = ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725'];
```

`d3-scale-chromatic`의 `interpolateViridis`/`interpolateCividis`/`interpolatePlasma`를 그대로 사용해도 좋다.

---

## 7. 다크/라이트 테마

CSS 변수로 차트 색을 추상화한다. 라이브러리 색 prop에 직접 hex를 박지 말 것.

```css
:root {
  --chart-line: #1b9e77;
  --chart-accent: #d95f02;
  --chart-bg: #ffffff;
  --chart-text: #111111;
  --chart-grid: #e5e5e5;
}
:root[data-theme='dark'] {
  --chart-line: #5ec962;
  --chart-accent: #fde725;
  --chart-bg: #0f1115;
  --chart-text: #f5f5f5;
  --chart-grid: #2a2d35;
}
```

Recharts에서는 `stroke="var(--chart-line)"` 같이 그대로 쓸 수 있다. visx도 `fill`/`stroke`에 동일 적용.

다크 테마에서는 채도를 약간 낮추고(`#fde725` → `#e6cc20`), 대비비 4.5:1 이상을 유지한다(WCAG SC 1.4.11 Non-text Contrast).

---

## 8. 빈 상태 UI (Empty State)

```tsx
type EmptyReason = 'no-data' | 'small-sample' | 'no-recurrence' | 'no-correlation' | 'date-range-empty';

function EmptyState({ reason, hint }: { reason: EmptyReason; hint?: string }) {
  const messages: Record<EmptyReason, string> = {
    'no-data':           '아직 표시할 데이터가 없습니다. 꿈을 몇 개 더 기록해보세요.',
    'small-sample':      '표본이 부족합니다 (5개 이상 필요).',
    'no-recurrence':     '아직 반복 패턴이 감지되지 않았습니다.',
    'no-correlation':    '의미 있는 동시 출현이 아직 없습니다.',
    'date-range-empty':  '선택한 기간에 데이터가 없습니다.',
  };
  return (
    <div role="status" aria-live="polite" className="empty-state">
      <p>{messages[reason]}</p>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
```

> 주의: 0건일 때 "0"을 큰 숫자로 보여주면 *데이터 부재*인지 *실제 0회 측정*인지 혼동된다. 항상 데이터 부재는 별도 메시지로 구분한다.

---

## 9. 짝 스킬 데이터 흐름

```
┌─ frontend/emotion-tagging-input ─┐    ┌─ frontend/dream-symbol-tagging ─┐
│  사용자 감정 태그 입력            │    │  자유 텍스트 → 상징 태그 추출    │
└────────────┬─────────────────────┘    └──────────────┬──────────────────┘
             │                                          │
             ▼                                          ▼
       ┌──────────────────────────────────────────────────────┐
       │  architecture/dream-journal-data-modeling             │
       │  Dexie 스키마: dreams { id, createdAt, emotions[],    │
       │                         symbols[], text } + indexes   │
       └─────────────────────────────┬────────────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              ▼                      ▼                      ▼
   frontend/dream-recurrence-      [이 스킬]         (다른 통계 스킬)
   detection (반복 그룹)            5종 차트
              │                      │
              └──────────┬───────────┘
                         ▼
                  반복 꿈 타임라인 차트
```

- `emotion-tagging-input` 산출 `emotions[]` → 2-2 PieChart, 2-5 Heatmap 행
- `dream-symbol-tagging` 산출 `symbols[]` → 2-3 Wordcloud, 2-5 Heatmap 열
- `dream-recurrence-detection` 산출 `RecurrentGroup[]` → 2-4 Timeline
- `dream-journal-data-modeling` Dexie 스키마 → 모든 차트의 데이터 소스

---

## 10. 흔한 함정

| 함정 | 증상 | 해결 |
|------|------|------|
| **캔버스 vs SVG 혼용** | Recharts(SVG) + Chart.js(Canvas) 섞으면 테마/툴팁 동작이 달라짐 | 한 프로젝트에서 한 라이브러리 일관 사용 |
| **작은 표본 단정** | N=3에서 "공포 꿈이 70%" 같은 결론 표시 | N<5는 *경고 캡션* 또는 차트 자체 숨김 |
| **문맥 없는 차트** | "4월 18건"이 *증가*인지 *평년 수준*인지 알 수 없음 | 전체 평균선, 이전 기간 비교, 기간 라벨 함께 |
| **무지개·HSL 회전 팔레트** | 색맹 사용자에게 인접 카테고리 구분 불가 | Viridis(연속) · Dark2/Wong(범주형) 사용 |
| **ResponsiveContainer 높이 0** | 차트가 안 보임 | 부모에 명시 height 또는 `aspect` prop 지정 |
| **워드클라우드 단독 사용** | 정확한 비교 불가, 스크린리더 접근 불가 | 동일 데이터 표·막대 차트 병행 제공 |
| **react-wordcloud 사용** | 6년 미릴리즈, React 19 비호환 | `@visx/wordcloud` 또는 `@cp949/react-wordcloud` |
| **PieChart 7+ 카테고리** | 인접 슬라이스 면적 비교 불가 | 가로 막대 차트로 전환 |
| **히트맵 우연 상관** | 작은 표본에서 1~2회 동시 출현이 강한 색으로 표시 | 최소 임계(예: 3회 이상)에서만 색칠, 미만은 회색 |
| **다크 테마 채도 과다** | 노랑·흰색이 눈부심 | 다크 모드 전용 톤다운 팔레트 분리 |
| **Recharts 버전 혼동** | "2.x로 충분"이라 추정 후 React 19 환경에서 미렌더링 | 3.8.x stable 우선, 2.x는 alpha+override 필요 |

---

## 11. 의사결정 체크리스트

1. **데이터 누적량은?** 수천 건 이하 → SVG(Recharts/visx). 1만+ → 캔버스 검토.
2. **차트가 표준형(Line·Pie·Bar)인가?** Yes → Recharts. No(워드클라우드·히트맵·custom) → visx.
3. **색이 몇 카테고리?** ≤6 → ColorBrewer Dark2. >6 → Wong 또는 막대 차트 전환.
4. **연속값 시각화인가?** Yes → Viridis/Cividis.
5. **표본 N이 임계 미만?** Yes → 차트 숨기고 빈 상태 메시지.
6. **스크린리더 사용자가 정확한 값을 볼 수 있나?** No → `<FallbackTable>` 또는 `<desc>` 추가.
7. **다크 테마에서 대비비 4.5:1?** No → 다크 전용 톤 분리.
