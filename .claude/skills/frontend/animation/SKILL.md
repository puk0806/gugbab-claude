---
name: animation
description: motion 12.x (구 framer-motion) 핵심 패턴, CSS transition/keyframe, 성능 최적화, React 18/19 + Next.js App Router 대응
---

# Animation — motion 12.x + CSS

> 소스: https://motion.dev/docs | https://developer.mozilla.org/en-US/docs/Web/CSS/animation
> 검증일: 2026-04-20

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
# motion 12.x (신규 프로젝트)
pnpm add motion
```

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
- motion 12: React에서 파괴적 변경 없음. 기존 motion 11 코드 그대로 동작

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

## 드래그 & 제스처

```tsx
function DraggableCard() {
  return (
    <motion.div
      drag
      dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
      dragElastic={0.2}            // 경계 벗어날 때 탄성
      dragSnapToOrigin             // boolean 또는 "x" | "y" (motion 12.36+ 축별 지정)
      whileDrag={{ scale: 1.05 }}  // 드래그 중 스타일
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onDragEnd={(_, info) => {
        // info.velocity, info.offset, info.point 활용
        if (Math.abs(info.offset.x) > 100) {
          // 스와이프 처리
        }
      }}
    >
      드래그하세요
    </motion.div>
  )
}
```

> 주의: motion 12 제스처 콜백 변경 — inView, hover, press 이벤트 콜백에 전달되는 인수가 변경됨.
> `whileTap`이 있는 요소는 자동으로 `tabindex="0"`을 받아 키보드 접근성이 향상됨.

---

## 레이아웃 애니메이션

```tsx
import { motion, LayoutGroup } from 'motion/react'

// layout prop — 크기/위치 변화를 자동으로 부드럽게 처리 (FLIP 기법)
function ExpandableCard({ isExpanded }: { isExpanded: boolean }) {
  return (
    <motion.div layout transition={{ layout: { duration: 0.3, type: 'spring' } }}>
      <motion.h2 layout="position">제목</motion.h2>
      {isExpanded && <motion.p layout>상세 내용...</motion.p>}
    </motion.div>
  )
}

// LayoutGroup — 여러 컴포넌트 간 레이아웃 동기화
function TabLayout() {
  return (
    <LayoutGroup>
      <TabList />
      <TabContent />
    </LayoutGroup>
  )
}
```

**layout prop 옵션 (motion 12.36+ 포함):**
- `layout` — 크기 + 위치 모두 애니메이션
- `layout="position"` — 위치만 (크기 변화 무시)
- `layout="size"` — 크기만 (위치 변화 무시)
- `layout="preserve-aspect"` — 가로세로 비율 보존
- `layout="x"` — X축 레이아웃 애니메이션만 (motion 12.36+ 추가)
- `layout="y"` — Y축 레이아웃 애니메이션만 (motion 12.36+ 추가)

---

## LazyMotion — 번들 최적화

```tsx
import { LazyMotion, domAnimation, m } from 'motion/react'

// domAnimation: 핵심 기능 (animate, exit, variants, whileHover, whileTap 등)
// domMax: 전체 기능 (drag, layout, useScroll 등 포함)

function App() {
  return (
    <LazyMotion features={domAnimation}>
      {/* motion.div 대신 m.div 사용 (tree-shaking 최적화) */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        내용
      </m.div>
    </LazyMotion>
  )
}

// 비동기 로딩으로 초기 번들에서 제거
const loadFeatures = () =>
  import('motion/react').then(mod => mod.domMax)

function App() {
  return (
    <LazyMotion features={loadFeatures} strict>
      <m.div animate={{ opacity: 1 }} />
    </LazyMotion>
  )
}
```

**domAnimation vs domMax:**

| 기능 | domAnimation | domMax |
|------|:---:|:---:|
| animate / initial / exit | O | O |
| variants / transition | O | O |
| whileHover / whileTap / whileFocus | O | O |
| whileInView | O | O |
| drag / whileDrag | X | O |
| layout / LayoutGroup | X | O |
| useScroll / useTransform | X | O |

> 주의: domAnimation과 domMax의 정확한 번들 크기는 버전마다 달라짐. LazyMotion 사용 시 초기 렌더 ~4.6kb, features 비동기 로드 후 추가 크기 발생.

---

## Next.js App Router 사용 패턴

```tsx
// motion 컴포넌트는 클라이언트 전용 — "use client" 필수
'use client'

import { motion, AnimatePresence } from 'motion/react'

// Server Component에서 Client Component로 분리
// layout.tsx (Server) -> AnimatedLayout.tsx (Client)

// 페이지 전환 애니메이션
// template.tsx: 매 라우트 이동마다 새 인스턴스 생성 → 페이지 전환 애니메이션에 적합
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={/* pathname 등 고유 키 */undefined}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

### motion/react-client — Server Component에서 사용

```tsx
// Server Component에서 "use client" 없이 motion 컴포넌트를 사용하려면
// motion/react-client 임포트 사용 (SSR 최적화, JS 전송량 절감)
import { motion } from 'motion/react-client'

// 주의: 완전한 클라이언트 기능이 필요하면 여전히 "use client" + "motion/react" 사용 권장
```

---

## 성능 원칙

```tsx
// GPU 가속 속성만 사용 (layout 재계산 없음)
animate={{ opacity: 0, scale: 0.9 }}  // transform/opacity → GPU 가속

// 레이아웃 재계산 유발 — 피할 것
animate={{ width: 0, height: 0, margin: 0 }}

// 크기/위치 변화가 필요하면 layout prop 사용 (FLIP 기법 자동 적용)
<motion.div layout>
  {isExpanded && <Detail />}
</motion.div>
```

**성능 체크리스트:**
1. `transform`과 `opacity`만 직접 animate — GPU 가속
2. 크기/위치 변화 → `layout` prop 사용 (FLIP 기법 자동 적용)
3. 많은 요소 동시 애니메이션 → `LazyMotion` + `m` 컴포넌트
4. `useMotionValue` 사용 → React 리렌더링 없이 값 변경
5. `will-change` 자동 관리 — 수동 설정 불필요

---

## prefers-reduced-motion 대응

```tsx
import { useReducedMotion, MotionConfig } from 'motion/react'

// 컴포넌트 단위: useReducedMotion
function AnimatedCard() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
    >
      내용
    </motion.div>
  )
}

// 앱 전체 단위: MotionConfig reducedMotion
function App() {
  return (
    <MotionConfig reducedMotion="user"> {/* OS 설정 따름 */}
      <AppContent />
    </MotionConfig>
  )
}
```

---

## 흔한 실수

```tsx
// 1. framer-motion import 사용 (마이그레이션 필요)
import { motion } from 'framer-motion'      // 사용 금지
import { motion } from 'motion/react'       // motion 12.x

// 2. AnimatePresence에 key 누락
<AnimatePresence>
  {show && <motion.div>내용</motion.div>}            // key 없음 — exit 동작 안 함
  {show && <motion.div key="item">내용</motion.div>} // key 필수
</AnimatePresence>

// 3. Server Component에서 motion 사용
// motion은 클라이언트 전용 — "use client" 없으면 에러
'use client' // 반드시 추가
// 또는 import from 'motion/react-client' (Server Component용)

// 4. LazyMotion에서 motion.div 사용 (tree-shaking 무효화)
<LazyMotion features={domAnimation}>
  <motion.div /> // 전체 번들 포함됨
  <m.div />      // 올바름 — 필요한 기능만 포함
</LazyMotion>

// 5. motion() 함수 호출 방식 (deprecated)
const MotionButton = motion('button')          // motion 11 이전
const MotionButton = motion.create('button')   // motion 11+

// 6. useAnimation/useAnimationControls 사용 (레거시)
const controls = useAnimation()               // 레거시 — 동작은 하지만 권장 안 함
const [scope, animate] = useAnimate()         // 현행 권장 방식

// 7. layout prop 없이 크기/위치 animate (성능 저하)
animate={{ width: '100%' }}                   // layout 재계산 발생
// layout prop 사용
<motion.div layout />                          // FLIP으로 자동 처리
```
