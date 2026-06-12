---
name: dream-statistics-visualization
description: >
  꿈 일기 누적 통계를 시각화하는 React 차트 5종(월별 빈도·감정 분포·상징 워드클라우드·반복 꿈 타임라인·감정-상징 히트맵) 설계 가이드.
  Recharts·visx·Chart.js 선택 기준, Dexie 쿼리→차트 데이터 변환, 반응형·다크 테마·색맹 친화(Viridis/ColorBrewer) 팔레트,
  SVG 차트 접근성(role="img"·<title>·<desc>·테이블 대안 텍스트), 작은 표본(N<5) 단정 금지 등 흔한 함정을 정리한다.
  <example>사용자: "꿈 일기 월별 빈도를 Recharts LineChart로 그리고 싶어요"</example>
  <example>사용자: "감정-상징 상관 히트맵을 visx로 어떻게 만들죠?"</example>
  <example>사용자: "차트 색상을 색맹 사용자도 구분할 수 있게 하려면?"</example>
---

# Dream Statistics Visualization (꿈 일기 누적 통계 시각화)

> 소스:
> - Recharts 공식 API: https://recharts.org/en-US/api
> - Recharts npm: https://www.npmjs.com/package/recharts
> - visx 공식 문서: https://airbnb.io/visx/docs (리다이렉트: https://visx.airbnb.tech/)
> - visx GitHub: https://github.com/airbnb/visx
> - @visx/wordcloud npm: https://www.npmjs.com/package/@visx/wordcloud
> - @visx/heatmap npm: https://www.npmjs.com/package/@visx/heatmap
> - ColorBrewer: https://colorbrewer2.org/
> - Viridis (sjmgarnier): https://sjmgarnier.github.io/viridis/
> - W3C SVG Accessibility — ARIA roles for charts: https://www.w3.org/wiki/SVG_Accessibility/ARIA_roles_for_charts
> - WCAG 2.1 — Text Alternatives (1.1.1): https://www.w3.org/WAI/WCAG21/Understanding/non-text-content
>
> 검증일: 2026-05-15
>
> 짝 스킬:
> - `frontend/dream-symbol-tagging` — 상징 태그 입력값 → 워드클라우드 데이터 소스
> - `frontend/emotion-tagging-input` — 감정 태그 입력값 → 감정 분포·히트맵 데이터 소스
> - `frontend/dream-recurrence-detection` — 반복 꿈 그룹 → 타임라인 차트 데이터 소스
> - `architecture/dream-journal-data-modeling` — Dexie 스키마·쿼리 결과 → 차트 데이터 변환 시작점
>   (현재 레포에 미존재할 수 있음. 데이터 모델 합의 후 본 스킬과 함께 사용)

---

## 0. 이 스킬이 다루는 범위

| 다룬다 | 다루지 않는다 |
|--------|---------------|
| Recharts/visx 라이브러리 선택 기준 | 통계학적 유의성 검정(t-test·χ²) — 별도 도메인 |
| 5종 차트 설계 패턴과 코드 골격 | 머신러닝 기반 꿈 해석 |
| Dexie 쿼리 결과 → 차트 데이터 group/count 변환 | 서버 사이드 집계(BigQuery 등) |
| 반응형·다크 테마·접근성·색맹 친화 | 인쇄용 PDF 리포트 export |
| 작은 표본·문맥 누락 등 흔한 함정 | 실시간 스트리밍 차트 |

---

## 1. 라이브러리 선택 기준

### 1-1. 3개 후보 비교

| 라이브러리 | 강점 | 약점 | 적합 케이스 |
|-----------|------|------|-------------|
| **Recharts** | React 친화 선언형 API, ResponsiveContainer 내장, 학습 비용 낮음 | 커스텀 자유도가 visx보다 낮음. 한 차트에 다층 시각화 어려움 | 월별 LineChart·감정 PieChart 같은 표준 차트 |
| **visx (Airbnb)** | D3 + React 조합. 저수준 primitive 제공. 워드클라우드·히트맵·sankey 등 고급 차트 | 직접 조립 필요(컴포넌트 수 많음). SSR·tree-shaking 학습 필요 | 워드클라우드·히트맵·custom 타임라인 |
| **Chart.js** | 캔버스 기반(대량 데이터 성능 우수), 범용 | 비React 라이브러리. React wrapper(react-chartjs-2) 필요. 접근성 텍스트 대안 직접 구성 필요 | 1만+ 데이터 포인트, 캔버스 성능이 SVG보다 명확히 유리할 때 |

> 주의: 사용자가 "Recharts 2.x"로 명시했더라도 **2026-05 기준 stable은 Recharts 3.8.x**이며 React 19 네이티브 지원은 3.x에 있다. 신규 프로젝트는 3.x를 권장한다. 2.x는 React 19와 함께 쓰려면 `2.13.0-alpha.2` 이상 + `react-is` override 필요.
> (출처: https://github.com/recharts/recharts/issues/4558, https://www.npmjs.com/package/recharts)

### 1-2. 본 프로젝트 선택 가이드

- **월별 빈도·감정 분포** → Recharts (LineChart, PieChart) — 표준 차트, 빠른 구현
- **워드클라우드·히트맵·custom 타임라인** → visx — 표준 라이브러리에 없는 시각화
- **꿈 일기 누적 데이터(~수천 건)** 규모에서는 SVG로 충분. 캔버스(Chart.js)는 1만 건 이상 누적되거나 부드러운 60fps 인터랙션이 필요할 때만 도입.

---

## 2. 5종 차트 설계

모든 차트는 *Dexie 쿼리 결과 → 변환 함수(`toChartData`) → 차트 컴포넌트*의 3단 구조를 따른다.

### 2-1. 월별 꿈 빈도 — Recharts `LineChart`

**입력 형태:**
```ts
type MonthlyCount = { month: string; count: number }; // e.g. "2026-04", 12
```

**변환 (Dexie 쿼리 → 월별 카운트):**
```ts
import dayjs from 'dayjs';
import { db } from '@/db'; // Dexie 인스턴스 (data-modeling 스킬 산출물)

async function getMonthlyCounts(from: Date, to: Date): Promise<MonthlyCount[]> {
  const dreams = await db.dreams
    .where('createdAt').between(from.getTime(), to.getTime())
    .toArray();
  const map = new Map<string, number>();
  for (const d of dreams) {
    const key = dayjs(d.createdAt).format('YYYY-MM');
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  // 빈 월도 0으로 채워야 라인이 끊기지 않는다
  return fillMissingMonths(from, to, map);
}
```

**차트:**
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function MonthlyDreamChart({ data }: { data: MonthlyCount[] }) {
  if (data.length === 0) return <EmptyState reason="no-data" />;
  return (
    <div role="img" aria-label={`월별 꿈 빈도 추이. 총 ${data.length}개월 데이터.`}>
      <ResponsiveContainer width="100%" aspect={2}>
        <LineChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="var(--chart-line)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      <FallbackTable data={data} />
    </div>
  );
}
```

> 주의: `ResponsiveContainer`는 부모가 명시적 높이를 가져야 한다. `aspect` prop을 쓰면 높이가 `width / aspect`로 자동 계산되어 안정적이다.

### 2-2. 감정 분포 — Recharts `PieChart` (또는 도넛)

```tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS_CB_SAFE = ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02'];
// ColorBrewer Dark2 — 색맹 친화 카테고리컬 6색

export function EmotionDistribution({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <EmptyState reason="no-data" />;
  return (
    <div role="img" aria-label={describeDistribution(data, total)}>
      <ResponsiveContainer width="100%" aspect={1}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="40%" outerRadius="70%" label>
            {data.map((_, i) => <Cell key={i} fill={COLORS_CB_SAFE[i % COLORS_CB_SAFE.length]} />)}
          </Pie>
          <Tooltip /><Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

> 주의: 도넛/파이는 카테고리 6개 이하일 때만 사용. 7개 이상이면 가로 막대 차트로 전환한다(인지 부담).

### 2-3. 상징 워드클라우드 — `@visx/wordcloud`

사용자 명세는 "`react-wordcloud` / `@visx/wordcloud`"였으나, **`react-wordcloud`(chrisrzhou)는 1.2.7로 약 6년간 미릴리즈 상태**다(2026-05 기준). 신규 프로젝트는 **`@visx/wordcloud`** 또는 활성 포크 **`@cp949/react-wordcloud`**(React 18/19 지원)를 권장한다.

```tsx
import { Wordcloud } from '@visx/wordcloud';
import { Text } from '@visx/text';
import { scaleLog } from '@visx/scale';

type WordDatum = { text: string; value: number };

export function DreamSymbolCloud({
  words, width, height,
}: { words: WordDatum[]; width: number; height: number }) {
  if (words.length < 5) return <EmptyState reason="small-sample" hint="상징 5개 이상이 누적되면 워드클라우드가 표시됩니다." />;

  const fontScale = scaleLog({
    domain: [Math.min(...words.map(w => w.value)), Math.max(...words.map(w => w.value))],
    range: [12, 56],
  });
  const fontSizeSetter = (d: WordDatum) => fontScale(d.value);
  const fixedValueGenerator = () => 0.5; // 결정론적 배치(스냅샷 테스트 용이)

  return (
    <div role="img" aria-label={`자주 등장한 상징 ${words.length}개의 워드클라우드. 상위: ${words.slice(0, 3).map(w => w.text).join(', ')}.`}>
      <Wordcloud
        words={words}
        width={width}
        height={height}
        fontSize={fontSizeSetter}
        font="Pretendard, sans-serif"
        padding={2}
        spiral="archimedean"
        rotate={0}
        random={fixedValueGenerator}
      >
        {(cloudWords) =>
          cloudWords.map((w, i) => (
            <Text
              key={w.text}
              fill={COLORS_CB_SAFE[i % COLORS_CB_SAFE.length]}
              textAnchor="middle"
              transform={`translate(${w.x}, ${w.y})`}
              fontSize={w.size}
              fontFamily={w.font}
            >
              {w.text}
            </Text>
          ))
        }
      </Wordcloud>
      <FallbackTable data={words} />
    </div>
  );
}
```

> 주의: 워드클라우드는 *시각적 인상*에 강하나 정확한 비교에 약하다. *반드시 동일 데이터의 막대 차트 또는 표를 함께 제공*해야 접근성·정확성 모두 만족한다.

### 2-4. 반복 꿈 타임라인 — visx 기반 custom

표준 라이브러리에 "반복 그룹 타임라인" 차트는 없다. visx의 `scaleTime`·`Group`·`Circle`을 조합한다.

```tsx
import { Group } from '@visx/group';
import { scaleTime, scaleBand } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';

type RecurrentGroup = { id: string; label: string; occurrences: Date[] };

export function RecurrenceTimeline({
  groups, width, height,
}: { groups: RecurrentGroup[]; width: number; height: number }) {
  if (groups.length === 0) return <EmptyState reason="no-recurrence" hint="반복 꿈 감지(dream-recurrence-detection)는 최소 3회 이상 등장한 패턴부터 표시합니다." />;

  const margin = { top: 16, right: 16, bottom: 32, left: 120 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const allDates = groups.flatMap(g => g.occurrences);
  const xScale = scaleTime({
    domain: [new Date(Math.min(...allDates.map(d => d.getTime()))), new Date(Math.max(...allDates.map(d => d.getTime())))],
    range: [0, xMax],
  });
  const yScale = scaleBand({ domain: groups.map(g => g.label), range: [0, yMax], padding: 0.3 });

  return (
    <svg width={width} height={height} role="img" aria-label={`반복 꿈 타임라인. ${groups.length}개 그룹.`}>
      <Group left={margin.left} top={margin.top}>
        {groups.map((g) => (
          <Group key={g.id} top={yScale(g.label) ?? 0}>
            {g.occurrences.map((d, i) => (
              <circle key={i} cx={xScale(d)} cy={yScale.bandwidth() / 2} r={5} fill="var(--chart-accent)" />
            ))}
          </Group>
        ))}
        <AxisBottom top={yMax} scale={xScale} />
        <AxisLeft scale={yScale} />
      </Group>
    </svg>
  );
}
```

### 2-5. 감정-상징 상관 히트맵 — `@visx/heatmap`

```tsx
import { HeatmapRect } from '@visx/heatmap';
import { scaleLinear } from '@visx/scale';

// 데이터 형태: [{ bin: 감정인덱스, bins: [{ count: n, bin: 상징인덱스 }, ...] }]
type HeatmapBin = { bin: number; bins: { count: number; bin: number }[] };

export function EmotionSymbolHeatmap({
  data, width, height, emotions, symbols,
}: { data: HeatmapBin[]; width: number; height: number; emotions: string[]; symbols: string[] }) {
  if (data.length === 0 || data.every(d => d.bins.every(b => b.count === 0))) {
    return <EmptyState reason="no-correlation" />;
  }

  const xMax = width;
  const yMax = height;
  const maxCount = Math.max(...data.flatMap(d => d.bins.map(b => b.count)));

  const xScale = scaleLinear({ domain: [0, data.length], range: [0, xMax] });
  const yScale = scaleLinear({ domain: [0, data[0].bins.length], range: [0, yMax] });
  // Viridis 계열 — perceptually uniform, 색맹·B&W 인쇄 안전
  const colorScale = scaleLinear<string>({ domain: [0, maxCount], range: ['#440154', '#fde725'] });
  const opacityScale = scaleLinear<number>({ domain: [0, maxCount], range: [0.2, 1] });

  return (
    <svg width={width} height={height} role="img" aria-label="감정과 상징의 동시 출현 빈도 히트맵">
      <HeatmapRect
        data={data}
        xScale={(d) => xScale(d) ?? 0}
        yScale={(d) => yScale(d) ?? 0}
        colorScale={colorScale}
        opacityScale={opacityScale}
        binWidth={xMax / data.length}
        binHeight={yMax / data[0].bins.length}
        gap={2}
      >
        {(heatmap) =>
          heatmap.map((heatmapBins) =>
            heatmapBins.map((bin) => (
              <rect
                key={`${bin.row}-${bin.column}`}
                width={bin.width}
                height={bin.height}
                x={bin.x}
                y={bin.y}
                fill={bin.color}
                fillOpacity={bin.opacity}
              >
                <title>{`${emotions[bin.row]} × ${symbols[bin.column]}: ${bin.count}회`}</title>
              </rect>
            ))
          )
        }
      </HeatmapRect>
    </svg>
  );
}
```

> 주의: 작은 표본(전체 꿈 N<20)에서 히트맵은 *우연한 동시 출현*을 강한 상관처럼 보이게 한다. *최소 표본 임계*와 *문맥 캡션*을 함께 표시한다.

---

## 3. 데이터 변환 — Dexie → 차트 데이터

### 3-1. 공통 헬퍼

```ts
export function groupBy<T, K extends string>(items: T[], keyFn: (x: T) => K): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const k = keyFn(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export function countBy<T, K extends string>(items: T[], keyFn: (x: T) => K): Array<{ name: K; value: number }> {
  const map = new Map<K, number>();
  for (const it of items) map.set(keyFn(it), (map.get(keyFn(it)) ?? 0) + 1);
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}
```

### 3-2. Dexie 멀티-필드 카운트 (감정 × 상징)

```ts
async function buildEmotionSymbolMatrix(): Promise<HeatmapBin[]> {
  const dreams = await db.dreams.toArray();
  const emotions = ['joy', 'fear', 'sadness', 'anger', 'surprise', 'disgust'];
  const symbols  = await db.symbols.toArray(); // 상위 N개 상징만

  return emotions.map((emo, i) => ({
    bin: i,
    bins: symbols.map((sym, j) => ({
      bin: j,
      count: dreams.filter(d => d.emotions?.includes(emo) && d.symbols?.includes(sym.key)).length,
    })),
  }));
}
```

> 주의: `db.dreams.toArray()`가 수천 건을 메모리에 올린다. 데이터가 커지면 `where().count()`나 `each()` 스트리밍으로 전환한다. (Dexie 쿼리 패턴은 `dream-journal-data-modeling` 스킬 참조.)

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
