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

> 원국 표(4주 8자 그리드) 구현 상세 → references/REFERENCE.md §4

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

> 오행 분포 차트(레이더·바)·대운 타임라인·한자 폰트 서브셋 상세 → references/REFERENCE.md §6~§8

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

> 흔한 실수 18항 상세 → references/REFERENCE.md §10

---

## 11. 구현 순서 (권장)

1. **데이터 계약 먼저** — `Natal`·`DaeunTimeline` 타입 확정, `hourUnknown` 포함
2. **색 토큰** — `fg`/`surface` 분리, 라이트·다크 양쪽 대비 검사 통과
3. **폰트 서브셋** — 문자셋 상수 → 빌드 스크립트 → `@font-face`
4. **원국 표** — `<table>` 시맨틱 → 루비 병기 → 반응형
5. **오행 분포** — 바 차트부터. 레이더는 가드 4종 붙인 뒤 추가
6. **대운 타임라인** — 목록 시맨틱 → 스크롤/스냅 → 현재 위치 → reduced-motion
7. **가드 검수** — 2절 3가지 오독 + 10절 18항 체크

---

> 상세 레퍼런스 (원국 표·오행 분포 차트·대운 타임라인·한자 폰트 서브셋·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
