---
name: tarot-card-deck-ui
description: 타로 카드 덱 UI — CSS 3D 플립·셔플 연출, 스프레드 배치(1/3/켈틱크로스), 부채꼴 펼침 선택 인터랙션, 편향 없는 셔플(Fisher-Yates + crypto), 접근성, 카드 이미지 에셋 전략
user-invocable: false
---

# 타로 카드 덱 UI

> 소스: https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style
> 소스(CSS·DOM): https://developer.mozilla.org/en-US/docs/Web/CSS/backface-visibility · https://developer.mozilla.org/en-US/docs/Web/CSS/will-change · https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action · https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events · https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
> 소스(랜덤성): https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues · https://v8.dev/blog/math-random · https://github.com/lodash/lodash/issues/4743
> 소스(이미지): https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img · https://web.dev/articles/preload-responsive-images
> 소스(접근성): https://www.w3.org/WAI/ARIA/apg/patterns/listbox/ · https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
> 소스(애니메이션 라이브러리): https://motion.dev/docs/react-accessibility · https://motion.dev/docs/react-motion-config
> 검증일: 2026-09-10
> 버전 기준: motion 13.2.0 (2026-09-02 릴리즈, npm `latest`)

---

## 관련 스킬 (먼저 확인)

| 목적 | 스킬 |
|------|------|
| motion 13.x API·CSS 애니메이션 일반론 | `frontend/animation` |
| 부채꼴/캐러셀을 라이브러리로 처리할 때 | `frontend/swiper` |
| 카드 이미지 포맷·srcset·CDN 최적화 | `frontend/image-optimization-seo` |
| 카드 의미·상징·역사(콘텐츠 도메인) | `humanities/tarot-history-symbolism` |

**역할 분담 원칙**

- 이 스킬은 **카드 덱의 시각·인터랙션 레이어**만 다룬다. 카드 의미·해석 문구·스프레드 포지션의 *해석*은 `humanities/tarot-history-symbolism` 소관이다.
- 애니메이션 라이브러리 선택·설치·마이그레이션은 `frontend/animation`을 따른다. 이 스킬은 그 위에서 **타로 특유의 패턴**(플립·셔플·부채꼴·스프레드)만 얹는다.
- **부채꼴 펼침(fan)에 Swiper를 쓰지 않는다.** Swiper는 1차원 트랙 슬라이더이고 부채꼴은 `transform-origin` 기반 방사 배치라 모델이 다르다. 다만 "펼쳐진 카드를 가로 스크롤로 훑기"처럼 **트랙형 UI가 필요할 때만** `frontend/swiper`의 `slidesPerView: 'auto'` + `FreeMode` 패턴을 쓴다.

---

## 언제 사용 / 언제 사용하지 않을지

| 사용 | 사용하지 않음 |
|------|--------------|
| 카드를 뽑아 뒤집는 UI (타로·오라클·트레이딩 카드) | 단순 이미지 갤러리 → `frontend/swiper` |
| 결과가 "무작위 추출"이어야 하는 UI | 순서가 고정된 온보딩 카드 |
| 카드 위치가 의미를 갖는 배치(스프레드) | 그리드 나열만 필요한 목록 |
| 뒤집기 전까지 결과를 숨겨야 하는 UI | 결과가 처음부터 노출돼도 되는 UI |

---

## 1. 셔플과 랜덤성 — 가장 먼저 정확하게

### 1-1. `Array.prototype.sort` 셔플은 금지

```ts
// ❌ 절대 금지 — 균등 분포가 아니고, 비교 함수가 비일관적이라 엔진별 결과가 다르다
const shuffled = deck.sort(() => Math.random() - 0.5)
```

비교 함수는 "일관된 순서 관계"를 반환해야 하는데 매번 다른 값을 반환하므로 정렬 알고리즘의 전제가 깨진다. 결과 분포가 특정 순열로 크게 치우친다.

### 1-2. Fisher-Yates(Durstenfeld) — 정답 알고리즘

```ts
export function shuffle<T>(input: readonly T[]): T[] {
  const a = input.slice()
  for (let i = a.length - 1; i > 0; i--) {
    // 핵심: j 범위는 [0, i] — 즉 배타 상한이 i + 1 이어야 한다
    const j = randomIntBelow(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
```

> **흔한 버그:** `randomIntBelow(i)` 로 쓰면 `j !== i`가 강제되어 **Sattolo 알고리즘**이 된다.
> 결과가 항상 "단일 순환 순열"이라 어떤 카드도 원래 자리에 남지 못한다 — 균등 셔플이 아니다.

### 1-3. `Math.random()`의 한계 — 78장 덱에서 실제 문제가 된다

- V8은 `Math.random()`에 **xorshift128+** 를 쓴다. 내부 상태는 **128비트**다. (V8 공식 블로그)
- 반환값은 배정밀도 부동소수점이라 0~1 구간에서 표현 가능한 값은 `2^52`가지다.
- Fisher-Yates가 *모든* 순열에 도달하려면 PRNG 상태 공간이 `n!` 이상이어야 한다. 128비트 상태로는 **약 34개 원소**까지만 전체 순열 도달이 보장된다.
- 타로 풀 덱은 78장 → `78!`은 대략 `10^115`. `2^128 ≈ 3.4 × 10^38`이므로 **도달 불가능한 순열이 압도적 다수**다.

> **주의: 이것이 곧 "체감 편향"을 뜻하지는 않는다.** 사용자가 한 번 뽑는 3장의 분포는 실용상 균등에 가깝다.
> 문제가 되는 지점은 ① 결과에 **금전적 가치**가 있거나(유료 리딩·경품) ② **재현/예측 공격**이 성립하는 경우다.
> `Math.random()`은 **암호학적으로 안전하지 않다**고 V8이 명시하며, 시드 상태를 복원해 다음 출력을 예측하는 공개 기법이 존재한다.

### 1-4. `crypto.getRandomValues()` + 거부 샘플링

```ts
/**
 * [0, max) 범위의 균등 분포 정수.
 * 나머지 연산(modulo)만 쓰면 2^32가 max로 나누어떨어지지 않을 때 낮은 값이 더 자주 나온다.
 * 상위 잔여 구간을 버리는 거부 샘플링(rejection sampling)으로 편향을 제거한다.
 */
export function randomIntBelow(max: number): number {
  if (!Number.isInteger(max) || max <= 0 || max > 0x1_0000_0000) {
    throw new RangeError('max는 1 이상 2^32 이하의 정수여야 합니다')
  }
  const limit = 0x1_0000_0000 - (0x1_0000_0000 % max) // 채택 상한
  const buf = new Uint32Array(1)
  let v: number
  do {
    crypto.getRandomValues(buf)
    v = buf[0]
  } while (v >= limit)
  return v % max
}
```

- `crypto.getRandomValues()`는 **암호학적으로 강한** 난수를 TypedArray에 in-place로 채운다.
- 받는 배열은 정수 TypedArray만 가능하다 (`Uint8Array`~`BigUint64Array`). `Float32Array`/`Float64Array`는 거부된다.
- **호출당 최대 65,536바이트**. 초과 시 `QuotaExceededError`.
- `Crypto` 인터페이스 중 **유일하게 비보안 컨텍스트(non-secure context)에서도 동작**한다. Web Worker에서도 쓸 수 있다.
- 브라우저에는 Node의 `crypto.randomInt()` 같은 정수 헬퍼가 **없다**. 위처럼 직접 만든다.

**78회 호출이 부담되면 한 번에 뽑아 소진한다** (65,536바이트 한도 안에서):

```ts
function createRandomIntPool(count: number) {
  const pool = new Uint32Array(count)
  crypto.getRandomValues(pool) // count <= 16384 (65536 / 4)
  let cursor = 0
  return (max: number): number => {
    const limit = 0x1_0000_0000 - (0x1_0000_0000 % max)
    for (;;) {
      if (cursor >= pool.length) {
        crypto.getRandomValues(pool) // 소진 시 재충전
        cursor = 0
      }
      const v = pool[cursor++]
      if (v < limit) return v % max
    }
  }
}
```

### 1-5. 정/역방향(reversal) 결정

```ts
export interface DrawnCard {
  readonly cardId: string
  readonly isReversed: boolean
  readonly positionIndex: number
}

// 5:5 기본
const isReversed = randomIntBelow(2) === 1

// 역방향 비율을 조정하려면 (예: 30%)
const isReversedWeighted = randomIntBelow(100) < 30
```

> **주의:** 역방향 사용 여부는 **덱·전통마다 다르다.** RWS 원전(`The Pictorial Key to the Tarot`)은 역방향 의미를 함께 싣지만,
> 역방향을 쓰지 않는 리딩 전통도 널리 쓰인다. UI에서 **설정으로 끌 수 있게** 만들고,
> 실제 의미 문구는 `humanities/tarot-history-symbolism`을 따른다.

### 1-6. 랜덤 실행 위치 — React에서 가장 자주 터지는 버그

```tsx
// ❌ 렌더 중 난수 생성 — StrictMode 이중 렌더·리렌더마다 카드가 바뀐다
function ReadingBad() {
  const cards = shuffle(DECK).slice(0, 3) // 매 렌더마다 재실행
  return <Spread cards={cards} />
}

// ✅ 이벤트 핸들러에서 1회 실행 후 상태에 고정
function Reading() {
  const [draw, setDraw] = useState<DrawnCard[] | null>(null)

  const handleDraw = () => {
    const picked = shuffle(DECK).slice(0, 3)
    setDraw(
      picked.map((card, i) => ({
        cardId: card.id,
        isReversed: randomIntBelow(2) === 1,
        positionIndex: i,
      })),
    )
  }

  return draw ? <Spread draw={draw} /> : <button onClick={handleDraw}>뽑기</button>
}
```

**추가 규칙**

- SSR에서 뽑지 않는다. 서버·클라이언트 난수가 달라 hydration mismatch가 난다. 뽑기는 **클라이언트 이벤트** 또는 **서버 API 응답**으로만.
- 결과 공유·재현이 필요하면 **시드가 아니라 뽑힌 결과(`DrawnCard[]`)를 저장**한다. `crypto.getRandomValues()`는 시드를 받지 않으므로 재현 불가능하다.
- 결과에 금전적 가치가 있으면 **서버에서 뽑고 결과만 내려준다.** 클라이언트 셔플은 콘솔에서 얼마든지 바꿀 수 있다.

---

## 2. 카드 플립 — CSS 3D transform

### 2-1. 기본 구조

```html
<div class="scene">
  <button class="card" type="button" aria-pressed="false">
    <span class="card__face card__face--back">
      <img src="/tarot/back.avif" alt="" width="350" height="600" />
    </span>
    <span class="card__face card__face--front">
      <img src="/tarot/cups-03.avif" alt="컵 3" width="350" height="600" />
    </span>
  </button>
</div>
```

```css
.scene {
  /* perspective는 회전하는 요소(.card)의 조상에 둔다. 값이 작을수록 원근이 과장된다 */
  perspective: 1000px;
}

.card {
  position: relative;
  width: var(--card-w, 180px);
  /* 덱마다 다르므로 실제 에셋 비율로 교체할 것 */
  aspect-ratio: var(--card-ratio, 5 / 8);

  transform-style: preserve-3d;             /* 자식 face를 같은 3D 공간에 유지 */
  transform: rotateY(0deg);
  transition: transform 600ms cubic-bezier(0.2, 0.7, 0.3, 1);

  padding: 0;
  border: 0;
  background: none;
}

.card[aria-pressed='true'] {
  transform: rotateY(180deg);
}

.card__face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;   /* 뒤돌아선 면을 숨긴다. 2D transform에는 효과 없음 */

  /* ⚠️ overflow/border-radius 클리핑은 반드시 .card가 아니라 face에 둔다 (2-2 참조) */
  overflow: hidden;
  border-radius: 12px;
}

.card__face--front {
  transform: rotateY(180deg);
}

.card__face img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

- `backface-visibility` 초깃값은 `visible`이며 **상속되지 않는다.** 각 face에 직접 지정하거나 `backface-visibility: inherit`로 내려준다.
- `backface-visibility`는 **3D transform에서만 의미가 있다.** 2D transform에는 원근이 없어 아무 효과가 없다.
- `backface-visibility`·`transform-style` 모두 **Baseline 널리 사용 가능** 상태다. 현행 브라우저에서 `-webkit-` 접두사는 불필요하다 (Safari 11 이하에서만 필요했음).

### 2-2. 최대 함정 — `preserve-3d`가 조용히 `flat`으로 강제되는 조건

명세상 아래 "그룹핑 속성"이 걸린 요소는 `transform-style: preserve-3d`를 지정해도 **used value가 `flat`으로 강제**된다. 그러면 앞면이 뒤집혀 보이거나 두 면이 겹쳐 보이는 증상이 난다.

| 속성 | 강제 조건 |
|------|-----------|
| `overflow` | `visible`·`clip` 이외의 값 |
| `opacity` | `1` 미만 |
| `filter` | `none` 이외 |
| `clip` | `auto` 이외 |
| `clip-path` | `none` 이외 |
| `isolation` | 계산값이 `isolate` |
| `mask-image` / `mask-border-source` | `none` 이외 |
| `mix-blend-mode` | `normal` 이외 |
| `contain` | `paint`(및 paint containment를 유발하는 조합, `content-visibility: hidden` 포함) |

**실무 체크리스트**

- 모서리 둥글리기(`overflow: hidden` + `border-radius`)를 `.card`에 걸지 않는다 → **face로 내린다.**
- 카드 페이드인을 `.card`의 `opacity`로 하지 않는다 → **`.scene` 래퍼에 건다.**
- 그림자를 `filter: drop-shadow()`로 주지 않는다 → **`box-shadow`를 face에 준다.**
- 대량 카드 성능 최적화로 `content-visibility: auto` / `contain: paint`를 카드에 붙이지 않는다 → **`.scene` 조상에 붙인다.**

### 2-3. 성능 — GPU 가속과 `will-change` 남용

- 애니메이션 대상은 **`transform`과 `opacity`만** 쓴다. `width`/`height`/`top`/`left`는 레이아웃 재계산을 유발한다.
- `will-change`는 **최후의 수단**이다. MDN은 다음을 명시한다.
  - 브라우저는 이미 최적화를 시도한다. **과용하면 오히려 페이지가 느려진다.**
  - 스타일시트에 상시로 박아두면 브라우저가 최적화를 훨씬 오래 유지해 **메모리를 과소비**한다.
  - **스크립트로 켜고 끄는 것이 권장 관행**이다.
  - **예상되는 성능 문제를 선제적으로 막으려고 쓰지 않는다** — 이미 존재하는 문제 해결용이다.

```ts
// 애니메이션 직전 켜고, 끝나면 끈다
function hintAndRelease(card: HTMLElement) {
  card.style.willChange = 'transform'
  card.addEventListener(
    'transitionend',
    () => { card.style.willChange = 'auto' },
    { once: true },
  )
}
```

> **타로 앱의 구체적 위험:** 78장 전부에 `will-change: transform`을 걸면 78개의 합성 레이어가 만들어져
> 모바일에서 메모리 압박·스크롤 저하가 발생한다. **동시에 애니메이션 중인 카드에만** 붙인다.

### 2-4. motion으로 플립할 때

```tsx
import { motion } from 'motion/react'

<motion.div
  className="card"
  animate={{ rotateY: isFaceUp ? 180 : 0 }}
  transition={{ duration: 0.6, ease: [0.2, 0.7, 0.3, 1] }}
  style={{ transformStyle: 'preserve-3d' }}
/>
```

`motion` 컴포넌트는 `transform` 값을 하드웨어 가속 경로로 처리하며 `will-change`를 스스로 관리하므로, 위 수동 토글을 중복으로 넣지 않는다. (motion API 상세 → `frontend/animation`)

---

## 3. 셔플 연출

### 3-1. 원칙 — 로직과 연출을 분리한다

```ts
// 1) 순서는 즉시 확정 (동기)
const shuffled = shuffle(deck)

// 2) 연출은 고정 길이로 별도 재생 (결과에 영향 없음)
await playShuffleAnimation({ durationMs: 1200 })

// 3) 연출 종료 후 확정된 순서로 렌더
setDeckOrder(shuffled)
```

**애니메이션이 순서의 출처가 되어선 안 된다.** 애니메이션 도중 이탈·탭 전환(`visibilitychange`)·reduced-motion으로 연출이 스킵돼도 결과는 동일해야 한다.

### 3-2. 78장 DOM을 전부 움직이지 않는다

리플/오버핸드 셔플을 78개 노드로 구현하면 레이어가 폭발한다. 실무 패턴:

| 패턴 | 방법 | 비용 |
|------|------|------|
| **프록시 셔플** (권장) | 정적 카드 스택 이미지 위에 **프록시 카드 8~12장**만 얹어 움직인다 | 낮음 |
| **덱 전체 흔들기** | 스택 컨테이너 1개에 `rotate`/`translate` 키프레임 | 최저 |
| **개별 카드 이동** | 78장 전부 이동 — 데스크톱 한정, 모바일 비권장 | 높음 |

```css
/* 오버핸드 셔플 느낌 — 프록시 카드 1장 */
@keyframes riffle {
  0%   { transform: translate3d(0, 0, 0) rotate(0deg); }
  35%  { transform: translate3d(-38%, -8%, 0) rotate(-7deg); }
  70%  { transform: translate3d(24%, 4%, 0) rotate(5deg); }
  100% { transform: translate3d(0, 0, 0) rotate(0deg); }
}

.shuffle-proxy {
  animation: riffle 520ms cubic-bezier(0.4, 0, 0.2, 1) 3;
  /* 프록시마다 시작을 어긋내 층이 흩어지는 느낌을 만든다 */
  animation-delay: calc(var(--i) * 42ms);
}

@media (prefers-reduced-motion: reduce) {
  .shuffle-proxy { animation: none; }
}
```

### 3-3. 위치 재배치는 FLIP으로

셔플 후 카드가 다른 좌표로 이동한다면 `top`/`left` 전환 대신 FLIP(First-Last-Invert-Play)을 쓴다. motion을 쓰면 `layout` prop이 같은 일을 해준다.

```tsx
<motion.div layout transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
```

---

## 4. 카드 선택 인터랙션 — 부채꼴 펼침

### 4-1. 부채꼴 배치 수식

```tsx
interface FanConfig {
  count: number
  /** 부채꼴 전체 각도(도). 모바일 세로는 좁게, 데스크톱은 넓게 */
  spreadDeg: number
}

function fanStyle(index: number, { count, spreadDeg }: FanConfig): React.CSSProperties {
  const step = count > 1 ? spreadDeg / (count - 1) : 0
  const angle = -spreadDeg / 2 + step * index
  return {
    transform: `rotate(${angle}deg)`,
    // 회전축을 카드 아래쪽 바깥에 두면 카드가 원호를 따라 늘어선다
    transformOrigin: '50% 165%',
    zIndex: index, // 오른쪽 카드가 위로 쌓인다
  }
}
```

```css
.fan {
  position: relative;
  /* 회전으로 카드가 부모 밖으로 나가므로 높이를 넉넉히 확보한다 */
  height: calc(var(--card-h) * 1.35);
}

.fan__card {
  position: absolute;
  left: 50%;
  bottom: 0;
  margin-left: calc(var(--card-w) / -2);
  transition: transform 180ms ease-out;
}

/* 호버/포커스 시 살짝 튀어나오게 */
.fan__card:hover,
.fan__card:focus-visible {
  transform: rotate(var(--angle)) translateY(-18px);
}
```

> **히트 영역은 별도 처리가 필요 없다.** 카드가 겹치는 구간은 항상 `z-index`가 큰(=나중 인덱스) 카드가 위에 있고,
> 겹치지 않는 노출 구간만 해당 카드가 받는다. 즉 **눈에 보이는 부분을 누르면 그 카드가 선택**되는 것이 기본 동작이다.
> 별도의 히트 스트립 오버레이를 만들면 오히려 어긋난다.

### 4-2. 터치·드래그 제스처 (Pointer Events)

```tsx
function useCardDrag(onPick: (index: number) => void) {
  const start = useRef<{ x: number; y: number } | null>(null)

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    // 포인터가 요소 밖으로 나가도 이벤트를 계속 받는다.
    // DOM에서 요소를 옮기는 경우 이동 '이후'에 호출해야 추적이 끊기지 않는다.
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { x: e.clientX, y: e.clientY }
  }

  const onPointerUp = (e: React.PointerEvent<HTMLElement>, index: number) => {
    const s = start.current
    start.current = null
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (dy < -60) onPick(index)                       // 위로 끌어올려 뽑기
    else if (Math.hypot(dx, dy) < 8) onPick(index)    // 이동이 거의 없으면 탭
    // 캡처는 pointerup/pointercancel 후 자동 해제된다
  }

  // 브라우저가 팬/줌으로 가로채면 pointercancel이 오고 드래그가 끊긴다 → 상태 초기화
  const onPointerCancel = () => { start.current = null }

  return { onPointerDown, onPointerUp, onPointerCancel }
}
```

```css
.fan__card {
  /* 브라우저의 팬 처리를 막아야 pointermove를 우리가 받는다.
     세로 스크롤을 유지하고 싶으면 pan-y, 완전 커스텀이면 none */
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}
```

- `pointerdown`/`pointermove`/`pointerup`/`pointercancel` 하나로 마우스·터치·펜을 통합 처리한다. `pointerType`으로 기기별 분기 가능.
- **`touch-action`을 지정하지 않으면** 브라우저가 팬 제스처를 가로채고 `pointercancel`을 던져 드래그가 끊긴다.
- **`touch-action: none`은 접근성 위험이 있다.** 브라우저 확대(핀치 줌)를 막아 저시력 사용자가 확대할 수 없게 된다. 부채꼴 **카드 자체에만** 좁게 걸고, 페이지·컨테이너에는 걸지 않는다. 세로 스크롤이 필요한 레이아웃이면 `touch-action: pan-y`를 우선 검토한다.
- **`setPointerCapture`가 없으면** 빠르게 끌 때 포인터가 카드 밖으로 나가는 순간 이벤트가 끊긴다.
- 탭과 드래그를 구분할 때는 **이동 거리 임계값**(약 8px)을 쓴다. `click` 이벤트에만 의존하면 드래그 후에도 클릭이 발생한다.
- 포인터 캡처 중에는 `pointerover`/`pointerenter`/`pointerleave`/`pointerout`이 발생하지 않는다. 호버 스타일을 이 이벤트에 의존해 만들지 않는다.

### 4-3. 여러 장 선택 상태

```ts
interface PickState {
  /** 이미 뽑힌 덱 인덱스 (중복 방지) */
  readonly picked: readonly number[]
  readonly required: number
}

function pick(state: PickState, index: number): PickState {
  if (state.picked.includes(index)) return state          // 같은 카드 재선택 무시
  if (state.picked.length >= state.required) return state // 정원 초과 무시
  return { ...state, picked: [...state.picked, index] }
}
```

정원이 찰 때까지 남은 장수를 라이브 영역으로 안내한다(§6-3 참조).

---

## 5. 스프레드 배치

### 5-1. 1장 (원 카드)

```css
.spread--one {
  display: grid;
  place-items: center;
  min-height: 60svh; /* iOS 주소창 변화에 흔들리지 않도록 svh 사용 */
}
```

### 5-2. 3장 (과거 – 현재 – 미래)

```css
.spread--three {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(8px, 3vw, 24px);
  justify-items: center;
}

.spread--three .card {
  /* 모바일 세로에서도 3열을 유지하되 카드 폭을 축소한다.
     세로 스택으로 바꾸면 "왼→오 시간 흐름"이라는 배치의 의미가 사라진다 */
  width: min(28vw, 180px);
}
```

> **주의: 3장 과거-현재-미래 배열은 원전(Waite `The Pictorial Key to the Tarot`, 1910년 발행·1911년 표기)에서 확인되지 않는다.**
> 현대에 널리 통용되는 관용 배열이다. 라벨 문구·의미 확정은 `humanities/tarot-history-symbolism`을 따른다.
> UI 관점에서 중요한 건 **왼→오 순서가 시간 흐름을 표현한다**는 점이므로 세로 스택 전환을 피하는 것이다.

### 5-3. 켈틱 크로스 (10장)

Waite `The Pictorial Key to the Tarot`의 "An Ancient Celtic Method of Divination"에서 대중화된 배열이다. 십자(1–6)와 지팡이(7–10)로 나뉜다.

| # | Waite 원문 표현 | 배치 위치 |
|---|-----------------|-----------|
| 1 | What covers him | 중앙 |
| 2 | What crosses him | 중앙에 **90° 회전해 겹침** |
| 3 | What crowns him | 위 |
| 4 | What is beneath him | 아래 |
| 5 | What is behind him | 왼쪽 |
| 6 | What is before him | 오른쪽 |
| 7 | Himself | 지팡이 맨 아래 |
| 8 | His house | 지팡이 아래에서 둘째 |
| 9 | His hopes and fears | 지팡이 아래에서 셋째 |
| 10 | What will come | 지팡이 맨 위 |

> **주의: 포지션의 *의미* 해석은 전통마다 갈린다.** 특히 3·5·9번에서 차이가 크고,
> Eden Gray 계열은 시계방향(아래=기반 → 왼쪽=과거 → 위 → 오른쪽=미래) 순서를 쓴다.
> **레이아웃 기하는 위 표가 공통**이지만, 라벨 문구는 앱이 채택한 전통을 `humanities/tarot-history-symbolism`에서 확정한 뒤 넣는다.

```css
.spread--celtic {
  display: grid;
  grid-template-areas:
    '.  p3  .   p10'
    'p5 p1  p6  p9'
    '.  p4  .   p8'
    '.  .   .   p7';
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(6px, 2vw, 20px);
  justify-items: center;
  align-items: center;
}

.pos-1  { grid-area: p1; }
.pos-3  { grid-area: p3; }
.pos-4  { grid-area: p4; }
.pos-5  { grid-area: p5; }
.pos-6  { grid-area: p6; }
.pos-7  { grid-area: p7; }
.pos-8  { grid-area: p8; }
.pos-9  { grid-area: p9; }
.pos-10 { grid-area: p10; }

/* 2번 카드는 1번 위에 90° 회전해 겹친다 */
.pos-2 {
  grid-area: p1;
  transform: rotate(90deg);
  z-index: 1;
}
```

**모바일 세로 대응 — 4열은 유지하지 않는다**

컨테이너 폭이 좁아지면 카드가 판독 불가능해진다. `scale()`로 통째 축소하면 라벨 텍스트까지 작아져 접근성이 나빠진다. **십자와 지팡이를 상하로 분리**한다.

```css
/* 뷰포트가 아니라 컨테이너 기준으로 전환한다 — 모달·사이드패널 안에서도 올바르게 동작 */
.spread-wrap {
  container-type: inline-size;
  container-name: spread;
}

@container spread (max-width: 520px) {
  .spread--celtic {
    grid-template-areas:
      '.  p3  . '
      'p5 p1  p6'
      '.  p4  . '
      'p7 p8  p9'
      '.  p10 . ';
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 5-4. 포지션 라벨 마크업

```tsx
<figure className="pos-1">
  <TarotCard card={draw[0]} />
  <figcaption>
    <span className="pos-num" aria-hidden="true">1</span>
    현재 상황
  </figcaption>
</figure>
```

- 라벨은 **장식이 아니라 콘텐츠**다. `::after { content: '현재 상황' }`으로 넣으면 번역·검색·스크린리더에서 취약해진다.
- 카드의 접근 가능한 이름에 **포지션을 포함**시킨다: `"1번 자리 현재 상황: 컵 3, 역방향"`.

---

## 6. 접근성

### 6-1. `prefers-reduced-motion` — 플립은 특별 취급이 필요하다

`reduce`는 "모션을 **제거·감소·대체**한 인터페이스를 선호한다"는 뜻이다. MDN은 **전면 제거가 아니라 더 부드러운 대체**를 예시로 든다(스케일 애니메이션 → 오퍼시티 디졸브). 기본값은 `no-preference`다.

```css
@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
  .shuffle-proxy { animation: none; }
}
```

**핵심 함정 — 회전을 끄면 카드가 영원히 뒷면으로 남는다.**

플립은 `rotateY(180deg)`로 *앞뒷면을 교체*한다. 모션만 끄면 최종 상태 자체가 사라져 결과를 볼 수 없게 된다. 반드시 **다른 표현으로 대체**한다.

```tsx
import { useReducedMotion } from 'motion/react'

function TarotCard({ card, isFaceUp }: { card: DrawnCard; isFaceUp: boolean }) {
  const shouldReduceMotion = useReducedMotion() // boolean, 설정 변경 시 자동 리렌더

  if (shouldReduceMotion) {
    // 3D 회전 대신 면 교체 결과 자체를 즉시 렌더한다 (필요하면 opacity 크로스페이드)
    return (
      <div className="card card--flat">
        {isFaceUp ? <CardFront card={card} /> : <CardBack />}
      </div>
    )
  }
  return <Flip3DCard card={card} isFaceUp={isFaceUp} />
}
```

```tsx
// 앱 전역 설정 — 기본값은 "never"이므로 명시하지 않으면 motion은 사용자 설정을 무시한다
import { MotionConfig } from 'motion/react'

<MotionConfig reducedMotion="user">
  <App />
</MotionConfig>
```

| `reducedMotion` 값 | 동작 |
|---|---|
| `"user"` | 기기 설정을 따른다 (**권장**) |
| `"always"` | 항상 감소 — 테스트용 |
| `"never"` | 설정 무시 — **기본값** |

> **주의:** `reducedMotion="user"`가 켜지면 motion은 **transform·layout 애니메이션을 비활성화**하고
> `opacity`·`backgroundColor` 같은 값은 그대로 애니메이션한다. 즉 `rotateY` 플립은 자동으로 멈춘다.
> 따라서 위처럼 `useReducedMotion`으로 **대체 렌더 경로를 직접 제공**해야 결과가 보인다.

### 6-2. 키보드·스크린리더로 카드 선택

**78장을 각각 `<button>`으로 만들면 탭 스톱이 78개**가 되어 키보드 사용자에게 사실상 사용 불가다. 단일 탭 스톱 + 화살표 이동으로 만든다.

```tsx
function CardFan({ cards, picked, required, onPick }: CardFanProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = cards.length - 1
    switch (e.key) {
      case 'ArrowRight': setActiveIndex((i) => Math.min(i + 1, last)); break
      case 'ArrowLeft':  setActiveIndex((i) => Math.max(i - 1, 0)); break
      case 'Home':       setActiveIndex(0); break
      case 'End':        setActiveIndex(last); break
      case 'Enter':
      case ' ':          onPick(activeIndex); break
      default: return
    }
    e.preventDefault() // Space 스크롤·화살표 스크롤 차단
  }

  return (
    <div
      className="fan"
      role="listbox"
      aria-multiselectable={required > 1}
      aria-label={`카드 ${cards.length}장 중 ${required}장을 고르세요`}
      onKeyDown={onKeyDown}
    >
      {cards.map((_, i) => (
        <div
          key={i}
          role="option"
          aria-selected={picked.includes(i)}
          // roving tabindex — 활성 항목만 0, 나머지는 -1
          tabIndex={i === activeIndex ? 0 : -1}
          ref={i === activeIndex ? focusActiveRef : undefined}
          className="fan__card"
          style={fanStyle(i, { count: cards.length, spreadDeg: 160 })}
          onClick={() => onPick(i)}
        >
          {/* 뒷면 카드의 접근 가능한 이름에 카드 정체를 노출하지 않는다 */}
          <span className="sr-only">{i + 1}번째 카드 (뒷면)</span>
          <img src="/tarot/back.avif" alt="" width="350" height="600" />
        </div>
      ))}
    </div>
  )
}
```

- **roving tabindex**: 활성 항목만 `tabIndex=0`, 나머지 `-1`. APG는 `aria-activedescendant` 방식도 제시하지만, **roving tabindex를 쓰면 브라우저가 새로 포커스된 요소를 자동으로 스크롤해 보여준다** — 78장 부채꼴에서 결정적인 이점이다.
- **뒷면 카드의 접근 이름에 카드 정체를 넣지 않는다.** `alt="컵 3"`을 뒷면에 붙이면 스크린리더 사용자에게만 결과가 미리 노출되어 경험이 깨진다. 뒷면 이미지는 `alt=""`(장식), 이름은 `"12번째 카드 (뒷면)"`.
- 화살표 키 처리 시 `preventDefault()`로 페이지 스크롤을 막는다.
- 단일 선택(1장 뽑기)이면 `role="radiogroup"` + `role="radio"`도 유효하다. 다만 라디오는 **화살표 이동만으로 선택이 확정**되는 패턴이라, 카드 뽑기처럼 되돌릴 수 없는 확정 동작에는 listbox + `Enter`/`Space` 확정 방식이 더 안전하다.

### 6-3. 결과 안내 (라이브 영역)

```tsx
<p aria-live="polite" className="sr-only">
  {status}
</p>
```

```ts
// 뽑을 때: 남은 장수 안내
setStatus(`${picked.length}장 선택됨. ${required - picked.length}장 더 고르세요.`)

// 뒤집을 때: 플립 애니메이션 '완료 후' 결과 안내
setStatus(`${positionLabel}: ${cardName}, ${isReversed ? '역방향' : '정방향'}`)
```

- 애니메이션 시작 시점이 아니라 **완료 시점**에 안내한다. 시각 사용자보다 먼저 결과가 읽히면 안 된다.
- `aria-live="assertive"`는 쓰지 않는다. 진행 중인 안내를 끊어 혼란을 준다.
- 역방향 카드는 **시각적으로 180° 뒤집혀 있다**는 사실 자체가 정보다. 이미지 회전만으로는 스크린리더에 전달되지 않으므로 반드시 텍스트로 명시한다.
- 역방향 표현은 이미지 요소에 `transform: rotate(180deg)`로 준다. 텍스트 라벨까지 뒤집히지 않게 **카드 이미지에만** 적용한다.

### 6-4. 기타

- 뒤집기 토글 버튼에는 `aria-pressed`를 쓴다. `aria-expanded`는 의미가 다르다.
- 자동 재생되는 셔플 루프에는 정지 수단을 제공한다(WCAG 2.2.2 — 5초 이상 자동으로 움직이는 콘텐츠).
- 카드 이미지에만 의존해 정/역방향을 구분하게 두지 않는다 — 텍스트 배지를 함께 제공한다(WCAG 1.4.1).
- 애니메이션 대응은 WCAG 2.3.3(인터랙션의 애니메이션) 준수 목적과 직결된다.

---

## 7. 카드 이미지 에셋

### 7-1. 규모 산정

풀 덱은 **앞면 78장 + 뒷면 1장**이다. 앞면 전부를 초기 로드하면 수십 MB가 된다.

| 에셋 | 로딩 전략 |
|------|-----------|
| 뒷면 1장 | **즉시·최우선.** `loading="eager"` + `fetchpriority="high"` + `rel="preload"` |
| 뽑힌 카드 앞면 | 뽑기 확정 직후 **선제 프리로드** (플립 시작 전) |
| 나머지 앞면 | `loading="lazy"` (카드 도감·목록 화면) |

### 7-2. 뒷면 프리로드

```html
<link
  rel="preload"
  as="image"
  imagesrcset="/tarot/back-350.avif 350w, /tarot/back-700.avif 700w"
  imagesizes="180px"
  fetchpriority="high"
/>
```

- `imagesrcset`/`imagesizes`는 `rel="preload"` + `as="image"`인 `<link>`에서만 동작한다.
- 미지원 브라우저가 쓸모없는 이미지를 받지 않도록 `href`는 **생략**한다.
- 프리로드된 이미지의 기본 우선순위는 낮으므로 `fetchpriority="high"`를 **명시**해야 의도대로 앞당겨진다.
- 반응형 프리로드는 뷰포트가 확정된 뒤에야 유효하므로 **HTTP 헤더 프리로드·103 Early Hints로는 쓸 수 없다.**

### 7-3. 앞면 — 플립 전에 디코딩까지 끝낸다

플립 중간에 이미지가 도착하면 앞면이 빈 채로 돌아가거나 팝인이 보인다. **뽑기 확정 시점에 로드+디코드를 끝내고 플립을 시작**한다.

```ts
async function preloadCardImage(src: string): Promise<void> {
  const img = new Image()
  img.src = src
  try {
    // 디코딩까지 완료해 첫 페인트에서 끊기지 않게 한다
    await img.decode()
  } catch {
    // 디코드 실패해도 플립은 진행 — 폴백 렌더로 처리
  }
}

async function revealCard(card: DrawnCard) {
  await preloadCardImage(cardImageSrc(card.cardId))
  setFaceUp(true) // 이 시점부터 플립 시작
}
```

- 프리로드가 느릴 수 있으므로 **타임아웃 + 스켈레톤**을 둔다. 무한 대기 금지.
- 다음 포지션 카드까지 함께 프리로드하면 연속 뒤집기가 매끄럽다(3장 스프레드에서 유효).

### 7-4. lazy 로딩 시 필수 조건

- **`width`/`height`를 반드시 지정**한다. 지정하지 않으면 로드 전 크기가 0이라 뷰포트와 교차하지 않고 **영원히 로드되지 않을 수 있다.** CLS도 함께 발생한다.
- `loading="lazy"`는 **JavaScript가 켜져 있어야 동작**한다(안티 트래킹 조치).
- 지연 로드 이미지는 `load` 이벤트 계산에 포함되지 않는다. 뷰포트 안에 있어도 `window.onload` 시점에 아직 안 떠 있을 수 있으므로, 초기화 로직을 `load`에 의존시키지 않는다.
- **접힘 위 카드에는 `lazy`를 쓰지 않는다.** 첫 화면의 덱 스택·뒷면은 `eager`.
- 대량 목록에서 디코딩 지터가 보이면 `decoding="async"`를 함께 쓴다.

### 7-5. 포맷·전달

- AVIF/WebP를 우선하고 `<picture>`로 폴백을 둔다. 상세는 `frontend/image-optimization-seo`.
- 78장을 스프라이트 시트 하나로 묶는 방식은 **권장하지 않는다.** 총 용량이 항상 전부 다운로드되고, 반응형 해상도 분기가 불가능하며, 카드 하나만 필요한 리딩 화면에서 낭비가 크다.

### 7-6. 저작권 — 반드시 확인

> **주의: 아래는 일반 정보이며 법률 자문이 아니다. 상용 배포 전 반드시 변호사 검토를 받는다.**

- **Rider-Waite-Smith(RWS) 원본 아트워크**: Pamela Colman Smith(1878–1951) 그림, A. E. Waite(1857–1942) 텍스트. 1909년 12월 William Rider & Son 발행.
  - **미국**: 원본 아트워크는 퍼블릭 도메인으로 널리 인정된다(2024년 미국 저작권청 Copyright Claims Board 분쟁에서 양측 모두 "Smith의 원본 아트워크는 퍼블릭 도메인"임을 인정).
  - **영국**: Smith 사망(1951년) 기준 사후 70년이 경과해 2020년대 초에 만료되었다는 것이 통설이다. 다만 기산점을 Waite 사망(1942년)으로 볼지 Smith 사망으로 볼지에 대한 이견이 있다.
  - **관할별로 다르다.** 서비스 대상 국가 기준으로 개별 확인한다.
- **U.S. Games Systems의 1971년판은 별개다.** 이 회사는 원본 이미지 자체의 소유권은 주장하지 않지만 **디자인의 다른 요소**에 대한 권리를 주장한다. 1971년판 스캔본을 그대로 쓰지 않는다.
- **퍼블릭 도메인 원본에 가한 "보정·리컬러"에 새 저작권이 붙는지는 다툼이 있다.** 실질적인 창작적 추가가 있어야 하고, 보호는 그 변경분에만 미친다. 출처 불명의 "HD 리마스터" 스캔본을 쓰지 않는다.
- **안전한 선택지**
  1. 초기 발행본 스캔을 출처가 명확한 곳(위키미디어 커먼즈 등)에서 확보하고 라이선스 표기를 보존한다.
  2. 자체 일러스트를 제작한다 (앱 브랜딩에도 유리).
  3. 상용 라이선스 덱을 정식 계약해 사용한다.
- 카드 **이름·의미 텍스트**는 이미지와 별개 저작물이다. 현대 해설서 문장을 그대로 옮기지 않는다. 원전 인용 범위는 `humanities/tarot-history-symbolism`에서 확정한다.

---

## 8. 흔한 실수 정리

| 실수 | 결과 | 해결 |
|------|------|------|
| `deck.sort(() => Math.random() - 0.5)` | 분포 편향, 엔진별 결과 상이 | Fisher-Yates |
| `randomIntBelow(i)` (상한 오프바이원) | Sattolo 알고리즘 — 모든 카드가 자리 이동 | `randomIntBelow(i + 1)` |
| `crypto.getRandomValues()[0] % 78` | 나머지 편향 | 거부 샘플링 |
| 렌더 함수에서 셔플 실행 | 리렌더마다 카드 변경, StrictMode 이중 실행 | 이벤트 핸들러 + `useState` 고정 |
| SSR에서 카드 뽑기 | hydration mismatch | 클라이언트 또는 서버 API |
| `.card`에 `overflow: hidden` | `preserve-3d` → `flat` 강제, 뒷면 비침 | face에 클리핑 |
| `.card`에 `opacity < 1` / `filter` | 동일 증상 | `.scene` 래퍼에 적용 |
| 78장 전부에 `will-change` | 레이어 폭발·메모리 과소비 | 애니메이션 중인 카드만, 종료 후 해제 |
| `touch-action` 미지정 + Pointer Events | 브라우저 팬이 가로채 `pointercancel` | 카드에 `touch-action: none`(또는 `pan-y`) |
| 페이지 전체에 `touch-action: none` | 핀치 줌 차단 — 저시력 접근성 위반 | 카드 요소에만 좁게 적용 |
| `setPointerCapture` 미사용 | 빠른 드래그 시 추적 끊김 | `pointerdown`에서 캡처 |
| 카드 78장 각각 `<button>` | 탭 스톱 78개 | listbox + roving tabindex |
| 뒷면 `alt`에 카드 이름 | 스크린리더 사용자에게 결과 사전 노출 | `alt=""` + `"N번째 카드 (뒷면)"` |
| reduced-motion에서 `transition: none`만 | 플립이 멈춰 앞면을 볼 수 없음 | 대체 렌더 경로(즉시 면 교체·크로스페이드) |
| `MotionConfig` 미설정 | 기본값 `"never"` — 사용자 설정 무시 | `reducedMotion="user"` |
| lazy 이미지에 `width`/`height` 없음 | 로드 안 됨 + CLS | 명시적 크기 |
| 플립 시작 후 앞면 로드 | 회전 도중 빈 카드·팝인 | `img.decode()` 완료 후 플립 |
| 켈틱크로스를 모바일에서 `scale()` 축소 | 라벨 판독 불가 | 십자/지팡이 분리 그리드 |
| 역방향을 이미지 회전으로만 표현 | 스크린리더에 미전달 | 텍스트 배지 + 라이브 영역 |
