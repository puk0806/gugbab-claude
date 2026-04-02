---
name: animation
description: Framer Motion 핵심 패턴, CSS transition/keyframe, 성능 고려 사항
---

# Animation — Framer Motion + CSS

> 소스: https://motion.dev/docs | https://developer.mozilla.org/en-US/docs/Web/CSS/animation
> 검증일: 2026-04-01

---

## CSS vs Framer Motion 선택 기준

| | CSS transition/keyframe | Framer Motion |
|---|---|---|
| 단순 hover/focus 효과 | ✅ | 과함 |
| 마운트/언마운트 애니메이션 | 어려움 | ✅ |
| 드래그 & 제스처 | ❌ | ✅ |
| 스크롤 기반 애니메이션 | 가능 | ✅ |
| 성능 | GPU 가속 가능 | GPU 가속 + JS |
| 번들 크기 | 0 | ~50KB |

**원칙: 간단한 건 CSS, 복잡한 상태 전환/인터랙션은 Framer Motion.**

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

// ❌ 피해야 할 transition (레이아웃 재계산 유발)
transition: width 300ms, height 300ms, margin 300ms;

// ✅ transform으로 대체
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

## Framer Motion 핵심 패턴

```bash
pnpm add framer-motion
# Framer Motion v11+: motion 패키지로도 설치 가능
pnpm add motion
```

### 기본 animate

```tsx
import { motion } from 'framer-motion'

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
import { AnimatePresence, motion } from 'framer-motion'

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

### variants — 재사용 가능한 애니메이션 정의

```tsx
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,  // 자식 0.05초 간격으로 순차 등장
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

### useAnimate — 명령형 애니메이션 (조건부 로직)

```tsx
import { useAnimate } from 'framer-motion'

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

### 드래그

```tsx
function DraggableCard() {
  return (
    <motion.div
      drag
      dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
      dragElastic={0.2}          // 경계 벗어날 때 탄성
      whileDrag={{ scale: 1.05 }} // 드래그 중 크기
      onDragEnd={(_, info) => {
        console.log('velocity:', info.velocity)
      }}
    >
      드래그하세요
    </motion.div>
  )
}
```

---

## 성능 원칙

```tsx
// ✅ GPU 가속 속성만 사용 (layout 재계산 없음)
animate={{ opacity: 0, transform: 'scale(0.9)' }}

// ❌ layout 재계산 유발 속성
animate={{ width: 0, height: 0, margin: 0 }}

// layout prop — 크기/위치 변화 시 자동으로 부드럽게 처리
<motion.div layout>
  {isExpanded && <Detail />}
</motion.div>

// LayoutGroup — 여러 컴포넌트 간 layout 애니메이션 동기화
import { LayoutGroup } from 'framer-motion'
<LayoutGroup>
  <TabList />
  <TabContent />
</LayoutGroup>
```

---

## prefers-reduced-motion 대응

```tsx
import { useReducedMotion } from 'framer-motion'

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
```
