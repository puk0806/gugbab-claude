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

→ references/REFERENCE.md §3 (로직/연출 분리 원칙, 78장 DOM 전부 움직이지 않는 프록시 셔플 패턴, FLIP 재배치)

---

## 4. 카드 선택 인터랙션 — 부채꼴 펼침

→ references/REFERENCE.md §4 (부채꼴 배치 수식, Pointer Events 터치·드래그 제스처, 여러 장 선택 상태)

---

## 5. 스프레드 배치

→ references/REFERENCE.md §5 (1장/3장/켈틱크로스 10장 레이아웃, 모바일 컨테이너 쿼리 대응, 포지션 라벨 마크업)

---

## 6. 접근성

→ references/REFERENCE.md §6 (`prefers-reduced-motion` 플립 대체 렌더, 키보드·스크린리더 카드 선택, 라이브 영역 결과 안내)

---

## 7. 카드 이미지 에셋

→ references/REFERENCE.md §7 (규모 산정, 프리로드·디코드 타이밍, lazy 로딩 조건, 포맷·전달, RWS 저작권)

---

## 8. 흔한 실수 정리

→ references/REFERENCE.md §8 (19항목 실수/결과/해결 표)

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
