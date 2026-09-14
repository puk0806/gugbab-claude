---
name: saju-chart-visualization
user-invocable: false
description: >
  사주(명리) 앱의 시각화 3종 — 원국 표(4주 8자 그리드)·오행 분포 차트(레이더/바)·대운 타임라인(10년 단위 가로 스크롤) —
  을 React로 구현하는 설계 가이드. 오방정색(목청·화적·토황·금백·수흑) 기반 색 토큰을 WCAG 대비 기준으로 재조정하는 법,
  "오행 개수 = 우열"로 오독시키지 않는 표현 가드, 천간·지지 한자 고정 문자셋 CJK 서브셋, 다크모드,
  SVG 직접 그리기 vs 차트 라이브러리 트레이드오프를 정리한다.
  <example>사용자: "사주 원국 8글자를 모바일에서 어떻게 배치하죠?"</example>
  <example>사용자: "오행 개수를 레이더 차트로 그려도 되나요? 바 차트가 나을까요?"</example>
  <example>사용자: "대운 10년 단위 타임라인에서 현재 대운을 어떻게 표시하죠?"</example>
  <example>사용자: "천간·지지 한자 때문에 폰트가 너무 큰데 서브셋 어떻게 하죠?"</example>
---

# 사주 차트 시각화 (Saju Chart Visualization)

> 소스:
> - Recharts 공식 API — RadarChart: https://recharts.github.io/en-US/api/RadarChart/
> - Recharts 공식 API — Radar: https://recharts.github.io/en-US/api/Radar/
> - Recharts Animation 가이드: https://recharts.github.io/en-US/guide/animations/
> - Recharts 3.0 migration guide (공식 Wiki): https://github.com/recharts/recharts/wiki/3.0-migration-guide
> - Recharts npm 레지스트리: https://registry.npmjs.org/recharts/latest
> - visx GitHub releases: https://github.com/airbnb/visx/releases
> - W3C WCAG 2.2 Understanding SC 1.4.1 Use of Color: https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
> - W3C WCAG 2.2 Understanding SC 1.4.11 Non-text Contrast: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
> - MDN `unicode-range`: https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range
> - MDN CSS Scroll Snap — Basic concepts: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_snap/Basic_concepts
> - MDN `light-dark()`: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark
> - 위키백과 오방색: https://ko.wikipedia.org/wiki/오방색
> - 위키백과 사주명리학: https://ko.wikipedia.org/wiki/사주명리학
> - 위키백과 대운(사주팔자): https://ko.wikipedia.org/wiki/대운_(사주팔자)
>
> 버전 기준: Recharts **3.10.1**, visx **4.0.0**, React 19, WCAG 2.2
> 검증일: 2026-09-10
>
> 짝 스킬:
> - `frontend/font-optimization` — CJK 서브셋·`font-display`·`unicode-range` 원본 카탈로그. 본 스킬 7절은 그 위에 *사주 전용 고정 문자셋*만 얹는다
> - `frontend/dream-statistics-visualization` — 같은 레포의 차트 스킬. **라이브러리 선택(Recharts=표준 차트 / visx=비표준 시각화)을 본 스킬도 그대로 따른다**
> - `frontend/wcag-2.2-checklist` — 접근성 판정 기준 원본
> - `frontend/design-token-scss` — 색 토큰 정의 위치

---

## 0. 이 스킬이 다루는 범위

| 다룬다 | 다루지 않는다 |
|--------|---------------|
| 원국 표(4주 8자) 렌더링 구조·시맨틱 | 만세력 계산(절기·진태양시·야자시/조자시 처리) |
| 오행 분포 차트 선택 기준과 오독 방지 표현 | 용신·격국 판정 로직 |
| 대운 타임라인 UI(가로 스크롤·현재 위치) | 대운수 계산 알고리즘 |
| 오방정색 기반 색 토큰의 접근성 재조정 | 운세 문구 생성·LLM 해석 |
| 천간·지지 한자 고정 문자셋 서브셋 | 세운·월운·일진 캘린더 |
| 다크모드·SVG vs 라이브러리 트레이드오프 | 결제·구독 UI |

> **계산은 이 스킬의 책임이 아니다.** 원국·대운 데이터는 이미 계산된 결과가 props로 들어온다고 가정한다.
> 만세력 계산은 학파별로 기준이 갈리는 영역이며(위키백과 사주명리학: *"사주 네기둥의 명식을 뽑을때… 학문마다 그 기준에 차이가 있으며"*), UI 레이어에서 임의로 보정하면 안 된다.

---

## 1. 도메인 최소 사전 — 렌더링에 필요한 만큼만

| 용어 | 의미 | UI 영향 |
|------|------|---------|
| 사주(四柱) | 연·월·일·시 **네 기둥** | 열 4개 |
| 팔자(八字) | 각 기둥의 천간 1자 + 지지 1자 = **여덟 글자** | 4열 × 2행 = 8칸 |
| 천간(天干) | 甲乙丙丁戊己庚辛壬癸 (**10자**) | 상단 행 |
| 지지(地支) | 子丑寅卯辰巳午未申酉戌亥 (**12자**) | 하단 행 |
| 지장간(支藏干) | 각 지지 안에 숨은 천간 2~3개(여기·중기·정기) | **표면 8자에는 안 보임** — 분포 차트 캡션의 핵심 |
| 일간(日干) | 일주의 천간 = 사주 주체 | 강조 표시 대상 |
| 대운(大運) | **10년 주기**로 바뀌는 운. 시작 나이(대운수)는 개인마다 다름 | 타임라인 |

(출처: 위키백과 사주명리학 / 대운(사주팔자))

### 1-1. 오행 배속 (본기 기준)

```ts
export const ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'] as const;
export type Element = (typeof ELEMENTS)[number];

export const STEM_ELEMENT: Record<string, Element> = {
  甲: 'wood', 乙: 'wood', 丙: 'fire', 丁: 'fire', 戊: 'earth',
  己: 'earth', 庚: 'metal', 辛: 'metal', 壬: 'water', 癸: 'water',
};

// 지지의 오행은 지장간의 '정기(본기)' 기준 배속이다.
export const BRANCH_ELEMENT: Record<string, Element> = {
  寅: 'wood', 卯: 'wood', 巳: 'fire', 午: 'fire',
  辰: 'earth', 戌: 'earth', 丑: 'earth', 未: 'earth',
  申: 'metal', 酉: 'metal', 亥: 'water', 子: 'water',
};
```

> 주의: 위 지지 배속은 **본기(정기) 한 개만 취한 단순화**다. 辰·戌·丑·未(土)는 지장간에 木·火·金·水를 함께 품는다.
> 따라서 이 표로 만든 분포는 *"표면 여덟 글자의 본기 집계"*이지 *사주 전체 오행 세력*이 아니다. 7절·5절의 캡션 가드가 필요한 이유다.

---

## 2. 단정 금지 가드 — 시각화가 만드는 3가지 오독

사주 UI는 숫자·면적·색으로 **없는 확실성을 만들어낸다.** 아래 3가지는 코드 리뷰 체크 항목으로 취급한다.

| 오독 | 발생 지점 | 차단 방법 |
|------|-----------|-----------|
| **"개수가 많으면 강하다/좋다"** | 오행 분포 바·레이더 | 캡션에 집계 기준 명시 + "많고 적음이 길흉을 뜻하지 않는다" 고정 문구 |
| **"0개 = 결핍/불행"** | 레이더의 찌그러진 다각형 | `0`을 "없음"이 아니라 **"표면 여덟 글자에는 드러나지 않음"**으로 라벨링. 지장간 언급 |
| **"차트가 계산해준 운명"** | 대운 타임라인의 미래 구간 | 해석 텍스트와 **시각 요소를 분리**. 타임라인은 *구간 표시*만, 길흉 색칠 금지 |

**왜 필요한가 (명리학 내부 논점):**
표면 여덟 글자의 오행 개수만 세는 방식은 명리학 내부에서도 강약 판정 근거로 불충분하다고 다뤄진다. 지지에는 지장간이 숨어 있고, 태어난 달의 기운(**월령**)을 일간에 대비하는 **왕상휴수사(旺相休囚死)**, 그리고 득령·득지·득세를 함께 봐야 한다는 서술이 통용된다.
게다가 위키백과 사주명리학은 이 학문에 대해 *"과학적, 통계적 근거가 있지 않으며 증명할 수 없기 때문에 이를 사실이라고 믿는 것은 조심해야 한다"*고 명시한다.

> 주의: 강약 판정 방법론은 **학파별로 견해가 갈리는 영역**이다. 이 스킬은 특정 유파의 판정 규칙을 채택하지 않으며,
> UI는 *집계 방식이 무엇인지 밝히는 것*까지만 책임진다. 어떤 유파의 규칙을 쓸지는 제품 결정 사항이다.

**고정 캡션 스니펫 (분포 차트에 항상 동봉):**

```tsx
export function ElementTallyCaption({ scope }: { scope: 'surface8' | 'withHiddenStems' }) {
  return (
    <p className="chart-caption">
      {scope === 'surface8'
        ? '겉으로 드러난 여덟 글자만 본기 기준으로 센 결과입니다. 지지 속 지장간은 포함되지 않았습니다.'
        : '여덟 글자와 지지 속 지장간을 함께 센 결과입니다.'}
      {' '}개수의 많고 적음이 곧 좋고 나쁨을 뜻하지는 않습니다.
    </p>
  );
}
```

---

## 3. 라이브러리 선택 — 레포 정합 + SVG 직접 그리기 트레이드오프

### 3-1. 레포 기존 결론 승계

같은 레포의 `frontend/dream-statistics-visualization`이 세운 기준을 그대로 따른다.

> **표준 차트(라인·바·파이·레이더) → Recharts / 표준형이 없는 시각화(워드클라우드·히트맵·커스텀 타임라인) → visx**

| 라이브러리 | 검증된 최신 버전 | React peer | 본 스킬에서의 역할 |
|-----------|-----------------|-----------|-------------------|
| **Recharts** | **3.10.1** | `^16.8 \|\| ^17 \|\| ^18 \|\| ^19` | 오행 분포(Radar / Bar) |
| **visx** | **4.0.0** (2026-06-11) | React 18 또는 19 | 12운성 원반 등 *각도 배치가 필요한* 비표준 도형 |
| 없음 (HTML/CSS) | — | — | **원국 표, 대운 타임라인** |

### 3-2. 세 화면별 결정

| 화면 | 권장 구현 | 이유 |
|------|-----------|------|
| **원국 표(4주 8자)** | HTML `<table>` + CSS Grid | 행·열 머리글이 있는 **진짜 표 데이터**다. SVG로 그리면 텍스트 선택·스크린리더 표 탐색·폰트 서브셋 이점을 전부 잃는다 |
| **오행 분포** | Recharts `RadarChart` / `BarChart` | 축·툴팁·`accessibilityLayer`를 공짜로 얻는다 |
| **대운 타임라인** | HTML `<ol>` + CSS 가로 스크롤 | 스크롤·스냅·포커스 이동·`aria-current`가 DOM에서 훨씬 싸다. SVG면 키보드 탐색을 처음부터 직접 구현해야 한다 |
| 원형 지지 배치·12운성 원반 | SVG 직접 또는 visx `Group`+`scaleBand` | 표준 차트형이 없다 |

### 3-3. SVG 직접 그리기 vs 라이브러리

| 축 | 라이브러리(Recharts/visx) | SVG 직접 |
|----|--------------------------|----------|
| 축·눈금·툴팁 | 내장 | 전부 직접 |
| 접근성 | Recharts 3.x는 `accessibilityLayer` **기본 on**(키보드·스크린리더) | `role="img"` + `<title>`/`<desc>` + 표 대안을 직접 작성 |
| 번들 비용 | 차트 1~2개만 쓸 거면 과함 | 0 |
| 디자인 자유도 | 레이아웃이 라이브러리 관습에 묶임 | 완전 자유 |
| 애니메이션 | `isAnimationActive` 기본 `'auto'` → `prefers-reduced-motion` 자동 존중 | 직접 미디어쿼리 처리 |

> 판정 기준: **축과 눈금이 있으면 라이브러리, 없으면 SVG/DOM.** 원국 표와 대운 타임라인은 축이 없으므로 라이브러리를 쓰지 않는다.

> 주의: Recharts 3.x는 2.x에서 몇 가지 파괴적 변경이 있다 — `ResponsiveContainer`의 `ref.current.current` 제거, `activeIndex` prop 제거,
> z-index가 **JSX 렌더 순서**로 결정(SVG 한계), `CartesianGrid`의 `xAxisId`/`yAxisId` 명시 요구, 다중 Y축이 `yAxisId` 알파벳 순 렌더.
> 2.x 예제를 복붙하기 전에 공식 3.0 migration guide를 확인한다.

---

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

## 5. 오행 색상 시스템 — 전통색에서 접근 가능한 토큰으로

### 5-1. 전통 오방정색 (앵커)

| 오행 | 정색 | 방위 | 웹 기본 연상 |
|------|------|------|-------------|
| 목(木) | 청(靑) | 동 | 파랑 또는 초록 |
| 화(火) | 적(赤) | 남 | 빨강 |
| 토(土) | 황(黃) | 중앙 | 노랑 |
| 금(金) | 백(白) | 서 | 흰색 |
| 수(水) | 흑(黑) | 북 | 검정 |

(출처: 위키백과 오방색 — 오방정색 및 방위 대응)

> 주의: 靑은 고전 한자에서 **파랑~초록을 아우르는 색**이다. 위키백과 오방색은 청을 "파랑"으로 적지만, 실제 사주 앱은 木을 초록으로 그리는 관행도 넓다.
> 둘 중 **하나를 골라 앱 전체에 일관 적용**하고, 범례에 "목(木)"이라는 글자 라벨을 반드시 함께 둔다(색만으로 구분 금지).

### 5-2. 전통색을 그대로 쓰면 깨지는 지점

| 문제 | 원인 | 결과 |
|------|------|------|
| 금(白) | 흰 배경과 동일 | 라이트 모드에서 **완전히 안 보임** |
| 수(黑) | 어두운 배경과 동일 | 다크 모드에서 **완전히 안 보임** |
| 토(黃) | 순수 노랑은 흰 배경 대비가 매우 낮음 | 텍스트로 쓰면 4.5:1 미달 |

즉 **백·흑·황은 "명도"로 정의된 색이라 배경 명도와 충돌한다.** 해결은 *명도가 아니라 색상 계열로 재매핑*하는 것이다.

- 금(白) → **차가운 은회색 계열**(금속 광택의 은유 유지)
- 수(黑) → 라이트 모드는 **청흑(charcoal-blue)**, 다크 모드는 **밝은 청색**
- 토(黃) → **깊은 앰버/황토**(어둡게 눌러 텍스트 가능 명도로)

### 5-3. 토큰 구조 — 전경색과 면색을 분리

한 색을 텍스트와 도형에 동시에 쓰려 하면 반드시 어느 한쪽 기준을 못 맞춘다. **`fg`(텍스트/아이콘)와 `surface`(칸 배경·차트 면)를 나눈다.**

| 용도 | 필요한 대비 | 근거 |
|------|-------------|------|
| 오행 색 **텍스트**(한자·라벨) | 배경 대비 **4.5:1** (큰 글씨는 3:1) | WCAG 2.2 SC 1.4.3 |
| 차트 **도형·선·칸 테두리** | 인접색 대비 **3:1** (Level AA) | WCAG 2.2 SC 1.4.11 — 차트의 선·색 면은 "graphical object"에 해당 |

```css
:root {
  color-scheme: light dark;   /* light-dark() 사용의 전제 (MDN) */

  /* 전경(텍스트·아이콘) — 페이지 배경 대비 4.5:1 목표 */
  --el-wood-fg:  light-dark(#14663A, #5BD08A);
  --el-fire-fg:  light-dark(#B3261E, #FF9C93);
  --el-earth-fg: light-dark(#7A5A00, #E3B341);
  --el-metal-fg: light-dark(#4F5866, #C9D1D9);
  --el-water-fg: light-dark(#1F3A5F, #8AB4F8);

  /* 면(칸 배경·차트 fill) — 페이지 배경 대비 3:1 목표 */
  --el-wood-surface:  light-dark(#D7F0E1, #17402C);
  --el-fire-surface:  light-dark(#FBDDDA, #4A1F1B);
  --el-earth-surface: light-dark(#F7E7BF, #40330F);
  --el-metal-surface: light-dark(#E4E8EE, #2A303A);
  --el-water-surface: light-dark(#DCE7F7, #17263D);
}

.glyph--wood  { color: var(--el-wood-fg);  background: var(--el-wood-surface); }
.glyph--fire  { color: var(--el-fire-fg);  background: var(--el-fire-surface); }
.glyph--earth { color: var(--el-earth-fg); background: var(--el-earth-surface); }
.glyph--metal { color: var(--el-metal-fg); background: var(--el-metal-surface); }
.glyph--water { color: var(--el-water-fg); background: var(--el-water-surface); }
```

> 주의: 위 hex 값은 **전통색을 접근성 범위로 옮긴 출발점 예시**이며, 대비비를 검증한 확정값이 아니다.
> 제품 배경색이 순백/순흑이 아닌 경우 값이 달라진다. **실제 배경 토큰과 짝지어 대비 검사(자동화 권장)를 통과시킨 뒤 확정한다.**

### 5-4. 색만으로 구분하지 않기 (SC 1.4.1, Level A)

사주 UI에는 다행히 **한자 자체가 텍스트 라벨**로 존재한다. 이를 적극 활용한다.

- 원국 칸: 한자 + 한글 + `목/화/토/금/수` 태그 → 색이 안 보여도 오행 식별 가능
- 분포 차트: 축 라벨에 `목(木) 2` 처럼 **이름과 값을 같이** 쓴다
- 대운 타임라인: 현재 대운을 색만으로 표시하지 않고 테두리 + "현재" 텍스트 + `aria-current`

`light-dark()`는 Baseline 2024 기능이고 `:root { color-scheme: light dark; }`가 전제다. 구형 브라우저 지원 범위가 넓다면 `@media (prefers-color-scheme: dark)`로 토큰을 재정의하는 폴백을 함께 둔다.

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

## 9. 다크모드

| 요소 | 라이트 | 다크 | 함정 |
|------|--------|------|------|
| 수(水) | 청흑 계열 | **밝은 청색** | 전통 흑을 그대로 쓰면 다크 배경에서 소실 |
| 금(金) | 은회색 | 밝은 회색 | 전통 백을 라이트에서 쓰면 소실 |
| 토(土) | 어두운 앰버 | 밝은 앰버 | 순수 노랑은 양쪽 다 위험 |
| 차트 그리드/축 | 연한 회색 | **더 낮은 대비의 회색** | 다크에서 흰 그리드를 그대로 쓰면 데이터보다 그리드가 튄다 |
| 칸 배경(`surface`) | 밝은 틴트 | **어두운 틴트**(밝기 반전이 아니라 재정의) | `filter: invert()`로 다크모드를 만들면 한자 획이 뭉개지고 색 의미가 뒤집힌다 |

```css
:root { color-scheme: light dark; }

/* light-dark() 미지원 브라우저 폴백 */
@supports not (color: light-dark(#000, #fff)) {
  :root {
    --el-water-fg: #1F3A5F;
  }
  @media (prefers-color-scheme: dark) {
    :root { --el-water-fg: #8AB4F8; }
  }
}
```

- Recharts에는 색을 하드코딩하지 말고 **CSS 변수를 `stroke`/`fill`에 넘긴다**(`fill="var(--el-fire-fg)"`). 테마 전환 시 리렌더 없이 따라간다.
- 다크모드 전환 후 **대비 검사를 다시 돌린다.** 라이트에서 통과한 토큰이 다크에서 실패하는 일이 흔하다.
- 사용자가 OS 설정과 다른 테마를 고를 수 있게 했다면, `color-scheme`을 `:root`가 아니라 테마 클래스에도 반영해야 폼 컨트롤·스크롤바가 따라온다.

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

---

## 11. 구현 순서 (권장)

1. **데이터 계약 먼저** — `Natal`·`DaeunTimeline` 타입 확정, `hourUnknown` 포함
2. **색 토큰** — `fg`/`surface` 분리, 라이트·다크 양쪽 대비 검사 통과
3. **폰트 서브셋** — 문자셋 상수 → 빌드 스크립트 → `@font-face`
4. **원국 표** — `<table>` 시맨틱 → 루비 병기 → 반응형
5. **오행 분포** — 바 차트부터. 레이더는 가드 4종 붙인 뒤 추가
6. **대운 타임라인** — 목록 시맨틱 → 스크롤/스냅 → 현재 위치 → reduced-motion
7. **가드 검수** — 2절 3가지 오독 + 10절 18항 체크
