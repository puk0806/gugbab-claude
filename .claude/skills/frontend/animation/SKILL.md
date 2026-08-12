---
name: animation
description: motion 13.x (구 framer-motion) 핵심 패턴, CSS transition/keyframe, 성능 최적화, React 18/19 + Next.js App Router 대응
---

# Animation — motion 13.x + CSS

> 소스: https://motion.dev/docs | https://motion.dev/docs/react-upgrade-guide | https://motion.dev/changelog
> 소스: https://developer.mozilla.org/en-US/docs/Web/CSS/animation
> 검증일: 2026-08-11

> **motion v13.1.0** 기준 (2026-08-10 릴리즈, npm registry `latest` 확인. v13.0.0은 2026-08-05).
> React API에서 v12 → v13 파괴적 변경은 **CSS-in-JS 사용자에게만 해당하는 1건**뿐이다 (아래 "motion 13 업그레이드" 참조).
> 그 외 `motion` 컴포넌트·`AnimatePresence`·variants·훅 API는 v12와 동일하다.

---

## CSS vs motion 선택 기준

| | CSS transition/keyframe | motion |
|---|---|---|
| 단순 hover/focus 효과 | 적합 | 과함 |
| 마운트/언마운트 애니메이션 | 어려움 | 적합 |
| 드래그 & 제스처 | 불가 | 적합 |
| 스크롤 기반 애니메이션 | 가능 (scroll-timeline) | 적합 (useScroll) |
| 레이아웃 애니메이션 | 불가 | 적합 (layout prop) |
| 성능 | GPU 가속 가능 | GPU 가속 + JS |
| 번들 크기 | 0 | motion 컴포넌트 ~34kb / LazyMotion+m 사용 시 초기 ~4.6kb |

> 주의: 번들 크기는 버전별로 변동됨. 정확한 수치는 bundlephobia 또는 빌드 분석으로 확인 권장.

**원칙: 간단한 건 CSS, 복잡한 상태 전환/인터랙션/레이아웃 애니메이션은 motion.**

---

## CSS 애니메이션

### transition — 상태 변화 시 부드러운 전환

```scss
.button {
  background: var(--color-primary);
  transform: scale(1);
  // 성능을 위해 transform/opacity만 사용 (layout 재계산 없음)
  transition: transform 150ms ease, opacity 150ms ease;

  &:hover { transform: scale(1.05); }
  &:active { transform: scale(0.97); }
  &:disabled { opacity: 0.5; }
}

// 피해야 할 transition (레이아웃 재계산 유발)
transition: width 300ms, height 300ms, margin 300ms;

// transform으로 대체
transform: scaleX(1.2); // width 변화 효과
```

### keyframe — 반복/복잡한 애니메이션

```scss
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.modal {
  animation: fadeIn 200ms ease forwards;
}

.spinner {
  animation: spin 800ms linear infinite;
}

// prefers-reduced-motion 대응 (접근성)
@media (prefers-reduced-motion: reduce) {
  .modal, .spinner {
    animation: none;
  }
}
```

---

## motion 패키지 설치 및 마이그레이션

### 설치

```bash
# motion 13.x (신규 프로젝트)
pnpm add motion
```

> 요구 React 버전: 공식 설치 문서 기준 **React 18.2 이상**.
> npm에 선언된 peerDependencies는 `^18.0.0 || ^19.0.0`이며 optional로 표기된다(바닐라 JS 사용 대비).

### framer-motion에서 마이그레이션

```bash
# 1. motion 패키지 설치
pnpm add motion

# 2. framer-motion 제거
pnpm remove framer-motion

# 3. import 경로 일괄 변경
# "framer-motion" -> "motion/react"
```

**마이그레이션 체크리스트:**
- `import { motion } from "framer-motion"` → `import { motion } from "motion/react"`
- `import { AnimatePresence } from "framer-motion"` → `import { AnimatePresence } from "motion/react"`
- `motion('button')` 함수 호출 방식 → `motion.create('button')` 사용 (motion 11+)
- 나머지 API(animate, variants, transition 등)는 동일하게 유지
- motion 12·13: React에서 파괴적 변경 사실상 없음 (13의 CSS-in-JS 항목 제외). 기존 motion 11 코드 그대로 동작

> `framer-motion`은 여전히 `motion`과 **동일한 버전 번호로 함께 배포되는 별칭 패키지**다
> (2026-08-11 기준 양쪽 모두 13.1.0. `motion`이 내부적으로 `framer-motion`을 의존한다).
> 즉 당장 깨지지는 않지만 신규 프로젝트는 `motion`을 설치한다 — 공식 문서는 `framer-motion`을
> deprecated alias로 안내하며, 문서·예제는 모두 `motion/react` 기준이다.
> 주의: npm registry의 `deprecated` 플래그 자체는 걸려 있지 않아 `npm install` 시 경고는 나오지 않는다.

### motion 13 업그레이드 (v12 → v13)

**파괴적 변경 1건 — `@emotion/is-prop-valid` 자동 사용 제거.**

motion 12까지는 `@emotion/is-prop-valid`가 optional peer dependency로 설치돼 있으면
motion이 이를 자동 감지해 "DOM에 넘기면 안 되는 props"를 걸러냈다.
motion 13은 이 자동 주입을 제거하고 **명시적 주입 방식**으로 바꿨다.

**영향 대상: Styled Components / Emotion 등 CSS-in-JS와 motion을 함께 쓰는 프로젝트만.**
증상은 "이전에는 필터링되던 스타일 전용 props가 DOM에 그대로 렌더링됨"이다.
CSS Module / SCSS / Tailwind만 쓴다면 **조치 불필요**.

```tsx
// 해결책 1 — MotionConfig로 명시적 주입 (기존 동작 그대로 복원)
import isPropValid from '@emotion/is-prop-valid'
import { MotionConfig } from 'motion/react'

<MotionConfig isValidProp={isPropValid}>
  <App />
</MotionConfig>
```

```tsx
// 해결책 2 — 합성 순서를 뒤집어 스타일링 라이브러리가 DOM prop 전달을 통제하게 함
// (motion 컴포넌트를 styled로 감싸는 대신, styled 컴포넌트를 motion.create로 감쌈)
const StyledBox = styled.div`...`
const MotionBox = motion.create(StyledBox)
```

> Styled Components 6를 쓴다면 transient props(`$prop`) 또는 `shouldForwardProp` 설정으로도 해결된다.
> 그 외 v13에는 React API 파괴적 변경이 없다 (공식 React 업그레이드 가이드 기준).

---

## 핵심 컴포넌트 & 패턴

### 기본 animate

```tsx
import { motion } from 'motion/react'

// 마운트 시 애니메이션
function Card() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      내용
    </motion.div>
  )
}
```

### AnimatePresence — 언마운트 애니메이션

```tsx
import { AnimatePresence, motion } from 'motion/react'

function Modal({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**AnimatePresence mode:**
- `"sync"` (기본) — 진입/퇴장 동시 실행
- `"wait"` — 퇴장 완료 후 진입 (페이지 전환에 적합)
- `"popLayout"` — 퇴장 요소를 position: absolute로 빼내고 진입 즉시 시작

```tsx
<AnimatePresence mode="wait">
  <motion.div key={currentPage}>
    {/* 페이지 전환: 이전 페이지 exit 완료 후 다음 페이지 진입 */}
  </motion.div>
</AnimatePresence>
```

### variants — 재사용 가능한 애니메이션 정의

```tsx
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 자식 0.05초 간격으로 순차 등장
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

function List({ items }: { items: string[] }) {
  return (
    <motion.ul variants={listVariants} initial="hidden" animate="visible">
      {items.map(item => (
        <motion.li key={item} variants={itemVariants}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  )
}
```

### motion.create() — 커스텀 컴포넌트 래핑

```tsx
import { motion } from 'motion/react'

// 서드파티 또는 자체 컴포넌트를 motion 컴포넌트로 변환
const MotionButton = motion.create('button')
// 또는 커스텀 컴포넌트 (ref를 전달받을 수 있어야 함)
const MotionCard = motion.create(Card)

function Example() {
  return (
    <MotionCard
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      내용
    </MotionCard>
  )
}
```

> 주의: `motion.create()`는 motion 11+에서 도입. 이전 `motion('button')` 방식을 대체.
> 래핑 대상 컴포넌트는 ref를 전달받을 수 있어야 함 (React 18: forwardRef / React 19: ref를 일반 prop으로 직접 전달 가능).
> motion props를 래핑 컴포넌트에 전달하려면 `motion.create(Component, { forwardMotionProps: true })`.

---

## 핵심 Hooks

### useAnimate — 명령형 애니메이션 (권장)

```tsx
import { useAnimate } from 'motion/react'

function ShakeOnError({ hasError }: { hasError: boolean }) {
  const [scope, animate] = useAnimate()

  useEffect(() => {
    if (hasError) {
      animate(scope.current, { x: [0, -10, 10, -10, 0] }, { duration: 0.4 })
    }
  }, [hasError])

  return <div ref={scope}>입력 필드</div>
}
```

> 주의: `useAnimation` / `useAnimationControls`는 레거시 API. `useAnimate`로 대체 권장.
> `useAnimate`는 motion 컴포넌트뿐 아니라 일반 HTML/SVG 엘리먼트에도 동작하며 시퀀싱·재생 제어가 가능.

### useScroll — 스크롤 기반 애니메이션

```tsx
import { motion, useScroll, useTransform } from 'motion/react'

function ParallaxHero() {
  const { scrollYProgress } = useScroll()

  // 스크롤 0~50%를 opacity 1~0, y 0~-50으로 변환
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50])

  return (
    <motion.div style={{ opacity, y }}>
      히어로 섹션
    </motion.div>
  )
}

// 특정 요소 기준 스크롤 추적
function ProgressBar() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'], // 요소가 뷰포트에 진입~퇴장
  })

  return (
    <div ref={ref}>
      <motion.div style={{ scaleX: scrollYProgress }} />
    </div>
  )
}
```

> 주의: motion 12.37.0에서 "start"/"end" 오프셋의 하드웨어 가속이 지원됨.

### useTransform — MotionValue 변환

```tsx
import { useMotionValue, useTransform, motion } from 'motion/react'

function Slider() {
  const x = useMotionValue(0)

  // x: -200~200 -> opacity: 0~1~0 / background: 빨강~초록
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0])
  const background = useTransform(x, [-200, 0, 200], ['#ff0000', '#ffffff', '#00ff00'])

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      style={{ x, opacity, background }}
    />
  )
}
```

### useSpring — 스프링 기반 모션 값

```tsx
import { useSpring, useMotionValue, motion } from 'motion/react'

function SmoothFollow() {
  const x = useMotionValue(0)
  // skipInitialAnimation: true → 컴포넌트 마운트 시 초기값에서 스프링 애니메이션 건너뜀 (motion 12.36+)
  const smoothX = useSpring(x, { stiffness: 300, damping: 30, skipInitialAnimation: true })

  return <motion.div style={{ x: smoothX }} />
}
```

### useInView — 뷰포트 진입 감지

```tsx
import { useInView } from 'motion/react'
import { useRef } from 'react'

function FadeInSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      스크롤하면 나타남
    </motion.div>
  )
}
```

> 주의: `useInView`는 약 0.6kb의 경량 훅. `whileInView` prop으로도 동일 효과 가능.

---

## 최근 버전 변경 요약 (v12.40 → v13.1)

| 버전 | 날짜 | 내용 |
|------|------|------|
| 12.41.0 | 2026-06-23 | `animateView`(View Transition API 래퍼)가 Early Access·alpha에서 **메인 라이브러리로 승격** (바닐라 JS API) |
| 12.42.0 | 2026-06-24 | `animateView` 레이어가 DOM 계층에 맞춰 자동 그룹화, auto-crop이 종횡비 유지 |
| 12.43.0 | 2026-07-27 | `backgroundColor`와 SVG 엘리먼트에 **하드웨어 가속 추가** |
| 13.0.0 | 2026-08-05 | `@emotion/is-prop-valid` 자동 사용 제거(위 업그레이드 절 참조). SVG 하드웨어 가속 종료 시 최종 스타일 적용 수정, `AnimatePresence` `propagate` 관련 수정 |
| 13.1.0 | 2026-08-10 | 현재 최신 안정 버전 |

### animateView / AnimateView — 페이지·뷰 전환

브라우저 네이티브 View Transition API를 감싼 API다. **바닐라 JS의 `animateView`는 메인 패키지에 포함**되어 있다.

```ts
import { animateView } from 'motion'

animateView((view) => {
  view.add('.card')            // 선택자에 view-transition-name 자동 부여·제거
  view.new({ opacity: [0, 1] }) // 새 레이어에 적용할 값
  view.old({ opacity: [1, 0] }) // 이전 레이어에 적용할 값
})
```

> **주의 — React용 `AnimateView` 컴포넌트는 아직 실험적이다.**
> 현재 Motion+ Early Access 전용(`motion-plus/animate-view`)이며, React의 `ViewTransition` 컴포넌트에
> 의존하므로 **React canary 이상 + motion 12.34.0 이상**을 요구한다.
> 정식 릴리즈 시 메인 `motion` 패키지로 이동 예정. **프로덕션 React 앱에는 아직 도입하지 않는다** —
> 페이지 전환은 위의 `AnimatePresence mode="wait"` 패턴을 계속 사용한다.

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
