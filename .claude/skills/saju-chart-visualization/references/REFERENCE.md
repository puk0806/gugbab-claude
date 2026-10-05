## 4. 원국 표 — 4주 8자 그리드

### 4-1. 데이터 모델

```ts
export type Pillar = {
  kind: 'year' | 'month' | 'day' | 'hour';
  stem:   { han: '甲'|'乙'|'丙'|'丁'|'戊'|'己'|'庚'|'辛'|'壬'|'癸'; kor: string; element: Element };
  branch: { han: string; kor: string; element: Element; hiddenStems: string[] };
};

export type Natal = {
  pillars: Pillar[];          // 길이 4 (시주 미상이면 3)
  hourUnknown: boolean;       // 출생시 모름
  dayMasterIndex: number;     // 일간 위치(보통 pillars[2].stem)
};
```

> **`hourUnknown`을 반드시 모델에 넣는다.** 출생 시각을 모르는 사용자는 흔하다. 시주 칸을 임의 값으로 채우면 없는 정보를 지어내는 것이다.
> 빈 칸 + "시주 미상" 라벨로 렌더하고, 오행 분포 집계에서도 **분모를 8이 아니라 6으로** 낮춘다.

### 4-2. 시맨틱 — `<table>`을 쓴다

원국은 *열=네 기둥, 행=천간/지지*인 2차원 데이터다. `div` 격자로 만들면 스크린리더 사용자가 "이 글자가 어느 기둥의 무엇인지"를 잃는다.

```tsx
export function NatalChart({ natal }: { natal: Natal }) {
  const order: Pillar['kind'][] = ['hour', 'day', 'month', 'year']; // 전통 표기: 시-일-월-년 (우→좌)
  return (
    <table className="natal">
      <caption className="sr-only">
        사주 원국표. 시주·일주·월주·연주 네 기둥의 천간과 지지 여덟 글자.
        {natal.hourUnknown && ' 출생 시각을 몰라 시주는 비어 있습니다.'}
      </caption>
      <thead>
        <tr>
          <th scope="col"><span aria-hidden="true">時</span><span className="sr-only">시주</span></th>
          <th scope="col"><span aria-hidden="true">日</span><span className="sr-only">일주</span></th>
          <th scope="col"><span aria-hidden="true">月</span><span className="sr-only">월주</span></th>
          <th scope="col"><span aria-hidden="true">年</span><span className="sr-only">연주</span></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row" className="sr-only">천간</th>
          {order.map((k) => <GlyphCell key={k} slot="stem" pillar={find(natal, k)} isDayMaster={k === 'day'} />)}
        </tr>
        <tr>
          <th scope="row" className="sr-only">지지</th>
          {order.map((k) => <GlyphCell key={k} slot="branch" pillar={find(natal, k)} />)}
        </tr>
      </tbody>
    </table>
  );
}
```

> 주의: 전통 표기는 **시-일-월-년(우측이 연주)** 순서지만, 앱 사용자에게는 **연-월-일-시(좌→우)**가 직관적일 수 있다.
> 어느 쪽을 택하든 `<caption>`과 열 머리글에 순서를 명시하고, **앱 안에서 순서를 섞지 않는다**(원국 표와 대운 표의 방향이 다르면 즉시 오독된다).

### 4-3. 한자 + 한글 병기

세 가지 선택지. **`<ruby>`를 기본으로 하되, 한자를 완전히 대체하지 않는다.**

```tsx
function GlyphCell({ slot, pillar, isDayMaster }: {
  slot: 'stem' | 'branch'; pillar?: Pillar; isDayMaster?: boolean;
}) {
  if (!pillar) return <td className="glyph glyph--empty"><span className="sr-only">미상</span>—</td>;
  const g = slot === 'stem' ? pillar.stem : pillar.branch;
  return (
    <td
      className={`glyph glyph--${g.element}`}
      data-element={g.element}
      aria-current={isDayMaster ? 'true' : undefined}
    >
      <ruby>
        {g.han}
        <rp>(</rp><rt>{g.kor}</rt><rp>)</rp>
      </ruby>
      {/* 색 외의 오행 표시 — SC 1.4.1 */}
      <span className="glyph__element-tag">{ELEMENT_LABEL[g.element]}</span>
      {isDayMaster && <span className="sr-only">일간</span>}
    </td>
  );
}

const ELEMENT_LABEL: Record<Element, string> = {
  wood: '목', fire: '화', earth: '토', metal: '금', water: '수',
};
```

| 방식 | 장점 | 단점 |
|------|------|------|
| `<ruby>` 루비 | 한자 위 작은 한글, 공간 절약, 시맨틱 | `rt` 폰트가 작아 모바일에서 12px 미만이 되기 쉬움 → 최소 크기 보장 필요 |
| 한자 위/아래 별도 `<span>` | 크기 제어 자유 | 마크업 늘어남, 읽기 순서 직접 관리 |
| 한글만 표기 | 가독성 최고 | 한자 병기가 제품 정체성인 경우 손실 |

> 주의: `<ruby>`의 `rt`를 `font-size: 0.4em`처럼 줄이면 실제 12px 아래로 떨어질 수 있다.
> `rt { font-size: max(0.4em, 11px); }` 처럼 하한을 두고, 확대(200%)에서 깨지지 않는지 확인한다.

### 4-4. 모바일 우선 레이아웃

세로 화면에서 4열은 좁다. **글자 크기를 줄이는 대신 컨테이너 폭에 반응**시킨다.

```css
.natal {
  width: 100%;
  table-layout: fixed;          /* 4열 균등 — 글자 폭 차이로 열이 흔들리지 않게 */
  border-collapse: separate;
  border-spacing: clamp(4px, 1.5vw, 12px);
}

.glyph {
  aspect-ratio: 3 / 4;          /* 정사각에 가까운 칸 — 한자 세로 여백 확보 */
  display: grid;
  place-content: center;
  gap: 2px;
  border-radius: 12px;
  /* 한자 본체: 뷰포트가 아니라 '칸 폭'에 비례시키려면 container query 사용 */
  font-size: clamp(1.5rem, 9vw, 2.75rem);
  line-height: 1.1;
}

/* 칸 기준 반응형(권장) */
.natal { container-type: inline-size; }
@container (min-width: 360px) {
  .glyph { font-size: 2.75rem; }
}

.glyph__element-tag {
  font-size: max(0.32em, 11px);
  opacity: 0.85;
}
```

체크리스트:
- [ ] 폭 320px에서 4열이 가로 스크롤 없이 들어가는가
- [ ] 텍스트 200% 확대에서 칸이 겹치지 않는가 (WCAG 1.4.4)
- [ ] 터치 대상이 있는 칸(탭하면 상세)은 최소 24×24 CSS 픽셀 이상인가 (WCAG 2.2 SC 2.5.8)
- [ ] `hourUnknown`일 때 시주 칸이 "—"와 함께 `sr-only` "미상"을 노출하는가

---

## 6. 오행 분포 차트 — 레이더 vs 바

### 6-1. 선택 기준

| 상황 | 권장 | 이유 |
|------|------|------|
| **개수를 정확히 비교**해야 함 | **가로 바 차트** | 길이 비교는 각도·면적 비교보다 정확하다 |
| 전체 균형/편중의 **인상**을 보여줌 | 레이더 | 5축은 레이더가 읽히는 최소 개수 |
| 값이 **0인 오행이 있음** | **바** | 레이더는 0축에서 다각형이 원점으로 꺾여 "결핍"을 과장한다 |
| 두 사주(본인/상대) 비교 | 레이더(2겹까지) | 3겹 이상은 판독 불가 |
| 지장간 포함/미포함 **두 집계를 나란히** | 바(그룹 바) | 레이더 2겹보다 명확 |

> **기본값은 가로 바 차트를 권장한다.** 레이더는 "예뻐서" 선택되는 경우가 많지만, 사주 앱에서 레이더의 면적은
> 사용자에게 *"내 기운의 크기"*로 오독되기 쉽다. 레이더를 쓸 거면 6-3의 가드를 전부 적용한다.

### 6-2. 집계 함수 — 분모를 명시한다

```ts
export type ElementTally = { element: Element; label: string; count: number };

export function tallySurfaceEight(natal: Natal): { data: ElementTally[]; total: number } {
  const counts: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  for (const p of natal.pillars) {
    counts[p.stem.element] += 1;
    counts[p.branch.element] += 1;   // 본기 기준 — 지장간 미포함
  }
  const total = natal.pillars.length * 2;   // 시주 미상이면 6
  return {
    data: ELEMENTS.map((e) => ({ element: e, label: ELEMENT_LABEL[e], count: counts[e] })),
    total,
  };
}
```

> 주의: `total`을 8로 하드코딩하지 않는다. `hourUnknown`이면 6이다. 축 최대값과 퍼센트 표기가 전부 여기에 묶인다.

### 6-3. 레이더 차트 (Recharts 3.x)

```tsx
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer,
} from 'recharts';

export function ElementRadar({ data, total }: { data: ElementTally[]; total: number }) {
  const hasZero = data.some((d) => d.count === 0);
  if (hasZero) return <ElementBar data={data} total={total} />;   // 0축이면 바로 폴백

  return (
    <figure>
      <ResponsiveContainer width="100%" aspect={1}>
        {/* accessibilityLayer는 3.x에서 기본 true — 키보드/스크린리더 지원 */}
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid />
          {/* 축 라벨에 이름과 값을 함께 — 색만으로 구분하지 않는다 */}
          <PolarAngleAxis dataKey="label" tickFormatter={(l) => l} />
          {/* 도메인을 total로 고정: 자동 스케일이면 2개도 '꽉 찬' 것처럼 보인다 */}
          <PolarRadiusAxis domain={[0, total]} allowDecimals={false} tickCount={total + 1} />
          <Radar dataKey="count" stroke="var(--chart-accent-fg)" fill="var(--chart-accent-surface)" fillOpacity={0.55} />
          <Tooltip formatter={(v: number) => `${v}자 / ${total}자`} />
        </RadarChart>
      </ResponsiveContainer>
      <figcaption>
        <ElementTallyCaption scope="surface8" />
      </figcaption>
      <ElementTallyTable data={data} total={total} />
    </figure>
  );
}
```

**레이더 가드 4종:**

1. **축 도메인을 `[0, total]`로 고정** — Recharts 기본 자동 스케일은 최대값을 바깥 링에 붙이므로, 2개짜리 오행이 "꽉 찼다"로 보인다.
2. **0값이 하나라도 있으면 바 차트로 폴백** — 다각형이 원점으로 함몰되며 결핍이 과장된다.
3. **축 순서를 고정한다** — `木→火→土→金→水`(상생 순) 같은 고정 순서를 쓰고 데이터 순으로 재정렬하지 않는다. 순서가 바뀌면 도형 모양이 바뀌어 다른 사주처럼 보인다.
4. **면적에 의미를 부여하는 문구 금지** — "기운의 크기", "총량" 같은 표현을 쓰지 않는다. 레이더 면적은 값의 제곱에 가깝게 커진다.

### 6-4. 가로 바 차트 (기본 권장)

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';

const ELEMENT_FILL: Record<Element, string> = {
  wood: 'var(--el-wood-fg)', fire: 'var(--el-fire-fg)', earth: 'var(--el-earth-fg)',
  metal: 'var(--el-metal-fg)', water: 'var(--el-water-fg)',
};

export function ElementBar({ data, total }: { data: ElementTally[]; total: number }) {
  return (
    <figure>
      <ResponsiveContainer width="100%" aspect={1.6}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          {/* 3.x: CartesianGrid는 대응 축의 id와 맞춰야 한다 */}
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, total]} allowDecimals={false} tickCount={total + 1} />
          <YAxis type="category" dataKey="label" width={48} />
          <Tooltip formatter={(v: number) => `${v}자 / ${total}자`} />
          <Bar dataKey="count" isAnimationActive="auto" radius={[0, 6, 6, 0]}>
            {data.map((d) => <Cell key={d.element} fill={ELEMENT_FILL[d.element]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <figcaption><ElementTallyCaption scope="surface8" /></figcaption>
      <ElementTallyTable data={data} total={total} />
    </figure>
  );
}
```

- `isAnimationActive="auto"`(3.x 기본값)는 SSR에서 애니메이션을 끄고 **`prefers-reduced-motion`을 자동 존중**한다. `true`로 명시하면 사용자 설정을 무시하게 되므로 강제하지 않는다.
- `<ElementTallyTable>`은 동일 데이터를 `<table>`로 제공하는 텍스트 대안이다. SC 1.4.11의 예외 조항(정보가 접근 가능한 다른 형태로 제공됨)과 스크린리더 양쪽에 대응한다.

---

## 7. 대운 타임라인 — 10년 단위 가로 스크롤

### 7-1. 데이터 모델

```ts
export type DaeunPeriod = {
  index: number;        // 0부터
  startAge: number;     // 대운수 + 10 * index
  endAge: number;       // startAge + 9
  startYear: number;
  stem:   { han: string; kor: string; element: Element };
  branch: { han: string; kor: string; element: Element };
};

export type DaeunTimeline = {
  periods: DaeunPeriod[];
  direction: 'forward' | 'reverse';   // 순행/역행
  currentIndex: number | null;        // 현재 나이가 속한 구간
};
```

> 대운은 **10년 주기**이며 시작 나이(대운수)는 개인마다 다르다. 순행/역행은 연간의 음양과 성별로 결정된다.
> UI는 `direction`을 **표시만** 하고 재계산하지 않는다. (출처: 위키백과 대운(사주팔자))

### 7-2. 마크업 — 순서 있는 목록 + 가로 스크롤

```tsx
export function DaeunTimeline({ timeline }: { timeline: DaeunTimeline }) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (timeline.currentIndex == null) return;
    const el = listRef.current?.querySelector<HTMLElement>('[data-current="true"]');
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }, [timeline.currentIndex]);

  return (
    <section aria-labelledby="daeun-heading">
      <h2 id="daeun-heading">대운 (10년 주기)</h2>
      <p className="sr-only">
        {timeline.direction === 'forward' ? '순행' : '역행'} 대운 {timeline.periods.length}개.
        좌우 화살표 키로 이동할 수 있습니다.
      </p>
      <ol
        ref={listRef}
        className="daeun"
        tabIndex={0}                  /* 스크롤 컨테이너를 키보드로 조작 가능하게 (WCAG 2.1.1) */
        role="list"                   /* list-style:none 이 목록 시맨틱을 제거하는 WebKit 이슈 방어 */
        aria-label="대운 목록"
      >
        {timeline.periods.map((p) => {
          const isCurrent = p.index === timeline.currentIndex;
          return (
            <li
              key={p.index}
              className="daeun__item"
              data-current={isCurrent || undefined}
              aria-current={isCurrent ? 'true' : undefined}
            >
              <span className="daeun__age">{p.startAge}–{p.endAge}세</span>
              <span className={`daeun__glyph glyph--${p.stem.element}`}>
                <ruby>{p.stem.han}<rp>(</rp><rt>{p.stem.kor}</rt><rp>)</rp></ruby>
              </span>
              <span className={`daeun__glyph glyph--${p.branch.element}`}>
                <ruby>{p.branch.han}<rp>(</rp><rt>{p.branch.kor}</rt><rp>)</rp></ruby>
              </span>
              <span className="daeun__year">{p.startYear}년~</span>
              {/* 색·테두리 외의 텍스트 표식 — SC 1.4.1 */}
              {isCurrent && <span className="daeun__badge">현재</span>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
```

### 7-3. 스크롤·스냅 CSS

```css
.daeun {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;     /* mandatory 아님 — 아래 주의 참조 */
  scroll-padding-inline: 16px;       /* 스냅 시 좌우 여백 확보 */
  padding-block: 8px;
  list-style: none;
  margin: 0;
}

.daeun__item {
  flex: 0 0 auto;
  inline-size: clamp(72px, 22vw, 96px);
  scroll-snap-align: center;
  display: grid;
  justify-items: center;
  gap: 2px;
  padding: 8px 4px;
  border: 1px solid transparent;
  border-radius: 12px;
}

.daeun__item[data-current] {
  border-color: currentColor;
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
  font-weight: 700;
}

.daeun:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  .daeun { scroll-behavior: auto; }
}
```

> 주의: `scroll-snap-type: x mandatory`는 **쓰지 않는다.** MDN은 *"자식 요소의 콘텐츠가 부모 컨테이너를 넘칠 경우 mandatory를 절대 쓰지 말라 — 사용자가 넘친 콘텐츠를 볼 수 없게 된다"*고 경고한다.
> 대운 카드에 한자가 확대(200%)되거나 긴 라벨이 들어가면 정확히 이 상황이 된다. `proximity`가 안전하다.

### 7-4. 타임라인 접근성 체크리스트

- [ ] 스크롤 컨테이너에 `tabIndex={0}` — 키보드만 쓰는 사용자가 화살표 키로 스크롤 가능한가
- [ ] 현재 대운에 `aria-current="true"` + **텍스트 배지**("현재")가 있는가 (색·테두리만으로 표시 금지, SC 1.4.1)
- [ ] 초기 자동 스크롤이 `prefers-reduced-motion`에서 `behavior:'auto'`로 떨어지는가
- [ ] 자동 스크롤이 **페이지 전체 스크롤을 훔치지 않는가** (`block: 'nearest'` 필수 — 없으면 페이지가 타임라인으로 점프한다)
- [ ] `list-style: none`을 준 목록에 `role="list"`를 명시했는가
- [ ] 좁은 화면에서 세로 목록으로 전환하는 옵션이 있는가(가로 스크롤은 저시력·스위치 사용자에게 부담)
- [ ] **미래 대운 구간을 길흉 색으로 칠하지 않았는가** (2절 가드)

---

## 8. 한자 폰트 — 고정 문자셋 CJK 서브셋

### 8-1. 사주 앱의 결정적 이점: 한자가 유한하다

일반 CJK 사이트는 어떤 한자가 나올지 몰라 `unicode-range` 슬라이싱이 필요하다. 그러나 **사주 원국·대운에 쓰이는 한자는 사실상 고정된 소수 집합**이다.

```
천간(10):  甲 乙 丙 丁 戊 己 庚 辛 壬 癸
지지(12):  子 丑 寅 卯 辰 巳 午 未 申 酉 戌 亥
오행(5):   木 火 土 金 水
기둥(4):   年 月 日 時
음양(2):   陰 陽
```

→ 약 **30여 자**. 여기에 십성·신살 표기를 쓰면 수십 자가 더해지는 정도다.
CJK 서브셋 일반론(`frontend/font-optimization` 8·10·11절)을 그대로 적용하는 대신, **`--text` 방식의 빌드 타임 서브셋**이 압도적으로 효율적이다.

### 8-2. 빌드 타임 서브셋

```bash
# fonttools (pyftsubset) — 한자 전용 폰트를 30여 자로 축소
pyftsubset NotoSerifKR-SemiBold.otf \
  --text="甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥木火土金水年月日時陰陽" \
  --output-file=./public/fonts/saju-han.subset.woff2 \
  --flavor=woff2 \
  --layout-features='' \
  --no-hinting
```

```js
// subset-font (Node) — 문자 목록을 코드에서 단일 소스로 관리
import subsetFont from 'subset-font';
import fs from 'node:fs/promises';

const SAJU_HAN = [
  ...'甲乙丙丁戊己庚辛壬癸',
  ...'子丑寅卯辰巳午未申酉戌亥',
  ...'木火土金水年月日時陰陽',
].join('');

const src = await fs.readFile('./fonts/NotoSerifKR-SemiBold.otf');
const out = await subsetFont(src, SAJU_HAN, { targetFormat: 'woff2' });
await fs.writeFile('./public/fonts/saju-han.subset.woff2', out);
```

> **문자 목록을 앱 코드와 같은 상수에서 뽑는다.** 십성·신살을 추가했는데 서브셋을 갱신하지 않으면 그 글자만 폴백 폰트로 렌더되어
> 굵기·너비가 튄다(원국 표에서 즉시 눈에 띈다). 서브셋 스크립트가 `STEM_ELEMENT`/`BRANCH_ELEMENT` 키를 그대로 읽게 만드는 것이 안전하다.

### 8-3. `@font-face` 분리 — 한자 폰트를 한글 본문 폰트와 섞지 않는다

```css
/* 본문(한글·라틴): 기존 Pretendard 등 그대로 */

/* 원국 한자 전용 — 사용된 글자가 없으면 브라우저가 다운로드조차 하지 않는다 */
@font-face {
  font-family: 'SajuHan';
  src: url('/fonts/saju-han.subset.woff2') format('woff2');
  font-weight: 600;
  font-display: swap;              /* 원국은 LCP 요소가 되기 쉬움 */
  /* CJK 통합 한자 영역으로 좁혀 다른 텍스트에 끼어들지 않게 한다 */
  unicode-range: U+4E00-9FFF;
}

.glyph ruby, .daeun__glyph ruby {
  font-family: 'SajuHan', 'Noto Serif KR', serif;
}
.glyph rt, .daeun__glyph rt {
  font-family: inherit;            /* 루비(한글)는 본문 폰트 */
}
```

- `unicode-range`는 **선언된 범위의 문자가 페이지에 하나도 없으면 폰트를 내려받지 않는다**(MDN). 원국 화면에서만 로드되므로 다른 라우트에 비용이 없다.
- 한자 획이 많아 **작은 크기에서 뭉개진다.** 원국 본체는 최소 24px 이상을 확보하고, 세리프(명조) 계열이 획 구분에 유리하다.
- `font-display: swap`은 폴백 → 웹폰트 전환 시 글자 폭 변화(CLS)를 만든다. 원국 칸을 `aspect-ratio`로 고정해 두면 레이아웃 이동이 칸 안에 갇힌다.

> 주의: Google Fonts가 CJK를 수백 개 조각으로 나눠 제공한다는 *슬라이싱 전략의 세부 수치*(조각 수·조각당 글자 수)는 공식 문서로 교차 검증하지 못했다.
> 본 절은 그 수치에 의존하지 않는다 — 고정 문자셋 서브셋만으로 충분하기 때문이다.

---

## 10. 흔한 실수

| # | 실수 | 왜 문제인가 | 대신 |
|---|------|-------------|------|
| 1 | 원국을 `div` 격자로 렌더 | 스크린리더가 "어느 기둥의 무엇"인지 잃음 | `<table>` + `scope` + `<caption>` |
| 2 | 오행 개수를 "강함/약함"으로 라벨 | 지장간·월령·득령/득지/득세를 무시한 단정. 학파별로 갈리는 영역 | 집계 기준을 밝히고 길흉 단정 금지 (2절) |
| 3 | 레이더 축을 자동 스케일 | 2개짜리 오행이 "꽉 찬" 것으로 보임 | `domain={[0, total]}` 고정 |
| 4 | 0값이 있는데 레이더 사용 | 다각형 함몰 → 결핍 과장 | 바 차트로 폴백 |
| 5 | `total`을 8로 하드코딩 | 시주 미상(6자) 사주에서 퍼센트가 전부 틀림 | `pillars.length * 2` |
| 6 | 시주 미상인데 칸을 채움 | 없는 정보를 지어냄 | 빈 칸 + "미상" 라벨 + 분모 조정 |
| 7 | 전통 오방정색 hex를 그대로 사용 | 백은 라이트에서, 흑은 다크에서 소실. 황은 대비 미달 | `fg`/`surface` 토큰 분리 + 색상 계열 재매핑 (5절) |
| 8 | 오행을 색으로만 구분 | SC 1.4.1(Level A) 위반 | 한자·한글·오행 태그를 항상 동반 |
| 9 | `scroll-snap-type: x mandatory` | 카드가 넘칠 때 콘텐츠 접근 불가 (MDN 경고) | `x proximity` |
| 10 | `scrollIntoView()`에 `block` 미지정 | 페이지 전체가 타임라인으로 점프 | `{ block: 'nearest', inline: 'center' }` |
| 11 | 초기 스크롤을 항상 `behavior:'smooth'` | 전정 장애 사용자에게 유해 | `prefers-reduced-motion` 분기 |
| 12 | `isAnimationActive={true}` 명시 | 3.x 기본값 `'auto'`의 reduced-motion 존중을 무력화 | 그냥 두거나 `"auto"` |
| 13 | 한자 폰트를 무서브셋 로드 | Noto CJK 원본은 수 MB — LCP 파괴 | 30여 자 `--text` 서브셋 (8절) |
| 14 | 서브셋 문자 목록을 손으로 관리 | 십성·신살 추가 시 그 글자만 폴백 폰트로 튐 | 앱 상수에서 문자셋 생성 |
| 15 | 원국은 시-일-월-년, 대운은 년→시 방향 | 같은 앱 안에서 방향이 뒤집혀 즉시 오독 | 앱 전체 한 방향으로 고정 + `<caption>` 명시 |
| 16 | 미래 대운을 길흉 색으로 칠함 | 검증 불가한 예측을 시각적 확실성으로 포장 | 구간 표시만, 해석은 텍스트로 분리 |
| 17 | Recharts 2.x 예제를 그대로 복붙 | `ref.current.current`·`activeIndex` 제거 등 3.x 파괴적 변경 | 공식 3.0 migration guide 확인 |
| 18 | 다크모드를 `filter: invert()`로 구현 | 한자 획 뭉개짐 + 오행 색 의미 반전 | 토큰 재정의 (`light-dark()`) |
