---
name: component-design
description: 캡슐화 중심 컴포넌트 설계, Compound Component, Headless 패턴, 컴포넌트 API 설계 원칙
---

# 컴포넌트 설계 — 캡슐화 중심

> 소스: https://react.dev/learn/thinking-in-react | https://www.patterns.dev/
> 검증일: 2026-04-01

---

## 캡슐화 원칙

**캡슐화 = 내부 구현을 숨기고, 외부에는 명확한 인터페이스만 노출**

```tsx
// ❌ 캡슐화 위반 — 내부 상태가 밖으로 새어나옴
function BadDropdown() {
  const [isOpen, setIsOpen] = useState(false) // 외부에서 직접 건드릴 수 있음
  return <div className={isOpen ? 'open' : ''}>...</div>
}
// 외부에서: <BadDropdown /> + 직접 DOM 조작

// ✅ 캡슐화 — 내부 상태는 숨기고 콜백으로만 소통
function Dropdown({ onSelect }: { onSelect: (value: string) => void }) {
  const [isOpen, setIsOpen] = useState(false) // 외부에서 알 필요 없음
  // isOpen은 Dropdown의 비밀
  return (...)
}
```

### 캡슐화 체크리스트

| 항목 | 기준 |
|------|------|
| 내부 상태 | 외부에 노출하지 않는다 |
| 스타일 | CSS Modules로 스코프 제한 |
| 자식 접근 | ref 직접 접근 대신 callback prop |
| 이벤트 | DOM 이벤트 직접 노출 대신 의미있는 콜백 (`onChange`, `onSelect`) |
| 데이터 | 내부 가공 데이터는 숨기고 결과만 노출 |

---

## 컴포넌트 API 설계 원칙

### 1. Props는 최소로, 의미는 명확하게

```tsx
// ❌ 너무 많은 props — 내부 구현이 밖으로 새어나옴
<Modal
  isVisible={true}
  animationDuration={300}
  overlayOpacity={0.5}
  closeOnEscKey={true}
  closeOnOverlayClick={true}
  zIndex={1000}
/>

// ✅ 의미 중심 API — 구현 세부사항은 내부에서 처리
<Modal open onClose={handleClose}>
  <Modal.Header>제목</Modal.Header>
  <Modal.Body>내용</Modal.Body>
</Modal>
```

### 2. 제어/비제어 컴포넌트 구분

```tsx
// 비제어 (Uncontrolled) — 상태를 내부에서 관리
function Accordion({ defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (...)
}

// 제어 (Controlled) — 상태를 외부에서 주입
function Accordion({ open, onToggle }) {
  return (...)
}

// ✅ 둘 다 지원 (권장)
function Accordion({ open: controlledOpen, defaultOpen = false, onToggle }) {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isOpen = isControlled ? controlledOpen : internalOpen

  function handleToggle() {
    if (!isControlled) setInternalOpen(prev => !prev)
    onToggle?.(!isOpen)
  }

  return (...)
}
```

---

## Compound Component 패턴

관련 컴포넌트를 하나의 네임스페이스로 묶어 응집도를 높이고 결합도를 낮춤.

```tsx
// Select/index.tsx
import { createContext, useContext, useState } from 'react'

interface SelectContextValue {
  value: string
  onChange: (v: string) => void
  isOpen: boolean
  toggle: () => void
}

const SelectContext = createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const ctx = useContext(SelectContext)
  if (!ctx) throw new Error('Select 컴포넌트 내부에서만 사용 가능')
  return ctx
}

// Root
function Select({ value, onChange, children }: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <SelectContext.Provider value={{ value, onChange, isOpen, toggle: () => setIsOpen(p => !p) }}>
      <div className={styles.select}>{children}</div>
    </SelectContext.Provider>
  )
}

// Trigger
function Trigger({ children }: { children: React.ReactNode }) {
  const { value, toggle } = useSelectContext()
  return (
    <button onClick={toggle} aria-haspopup="listbox">
      {children ?? value}
    </button>
  )
}

// Options
function Options({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSelectContext()
  if (!isOpen) return null
  return <ul role="listbox">{children}</ul>
}

// Option
function Option({ value, children }: { value: string; children: React.ReactNode }) {
  const { onChange, value: selected } = useSelectContext()
  return (
    <li
      role="option"
      aria-selected={selected === value}
      onClick={() => onChange(value)}
    >
      {children}
    </li>
  )
}

// 네임스페이스로 묶기
Select.Trigger = Trigger
Select.Options = Options
Select.Option = Option

export { Select }
```

```tsx
// 사용 — 유연하고 읽기 쉬움
<Select value={selected} onChange={setSelected}>
  <Select.Trigger />
  <Select.Options>
    <Select.Option value="apple">사과</Select.Option>
    <Select.Option value="banana">바나나</Select.Option>
  </Select.Options>
</Select>
```

---

## Headless 패턴 — 로직과 UI 완전 분리

```tsx
// useToggle.ts — 순수 로직, UI 없음
function useToggle(defaultValue = false) {
  const [isOn, setIsOn] = useState(defaultValue)
  return {
    isOn,
    toggle: () => setIsOn(p => !p),
    on: () => setIsOn(true),
    off: () => setIsOn(false),
  }
}

// 다양한 UI에 동일한 로직 재사용
function Switch({ label }: { label: string }) {
  const { isOn, toggle } = useToggle()
  return <button role="switch" aria-checked={isOn} onClick={toggle}>{label}</button>
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const { isOn: isOpen, toggle } = useToggle()
  return (
    <div>
      <button onClick={toggle}>{title}</button>
      {isOpen && <div>{children}</div>}
    </div>
  )
}
```

---

## 폴더 구조 — 컴포넌트 단위 캡슐화

```
components/
└── Select/
    ├── index.ts          ← 공개 인터페이스만 export
    ├── Select.tsx        ← Root 컴포넌트
    ├── Select.module.scss
    ├── Select.test.tsx
    └── useSelect.ts      ← 내부 훅 (외부 노출 안 함)
```

```ts
// Select/index.ts — 외부에서 접근 가능한 것만 명시
export { Select } from './Select'
export type { SelectProps } from './Select'
// useSelect는 export하지 않음 — 내부 구현
```

---

## ❌ 흔한 캡슐화 위반

```tsx
// ❌ ref를 통한 명령형 제어 남용
const modalRef = useRef()
modalRef.current.open()   // 내부 메서드 직접 호출

// ✅ 상태로 제어
const [isOpen, setIsOpen] = useState(false)
<Modal open={isOpen} onClose={() => setIsOpen(false)} />

// ❌ 스타일 외부에서 직접 덮어쓰기
<Button className="my-custom-button" style={{ color: 'red' }} />

// ✅ variant prop으로 제한된 커스터마이징
<Button variant="danger" />
```
