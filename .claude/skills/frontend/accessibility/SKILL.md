---
name: accessibility
description: ARIA 패턴, 시맨틱 HTML, 키보드 네비게이션, a11y 테스트 방법
---

# Accessibility (a11y)

> 소스: https://www.w3.org/WAI/ARIA/apg/ | https://developer.mozilla.org/en-US/docs/Web/Accessibility
> 검증일: 2026-04-01

---

## 시맨틱 HTML 우선

```tsx
// ❌ div 남용
<div onClick={handleSubmit} className="button">저장</div>
<div className="nav">
  <div onClick={() => navigate('/')}>홈</div>
</div>

// ✅ 시맨틱 요소 사용 — 접근성 기본 제공
<button type="button" onClick={handleSubmit}>저장</button>
<nav>
  <a href="/">홈</a>
</nav>
```

**시맨틱 요소 우선순위:**
- 클릭 → `<button>` (페이지 이동 없는 액션)
- 이동 → `<a href>` (URL 변경, 새 탭 등)
- 폼 → `<form>`, `<input>`, `<label>`
- 구조 → `<header>`, `<main>`, `<nav>`, `<footer>`, `<section>`, `<article>`

---

## ARIA 사용 원칙

**ARIA는 시맨틱 HTML로 해결 안 될 때만 사용한다.**

```tsx
// ❌ 불필요한 ARIA (button은 이미 role="button")
<button role="button" aria-label="저장 버튼">저장</button>

// ✅ 아이콘 버튼 — 텍스트 없을 때 aria-label 필요
<button aria-label="닫기">
  <CloseIcon aria-hidden="true" />
</button>

// ✅ 커스텀 컴포넌트에 역할 부여
<div
  role="switch"
  aria-checked={isOn}
  tabIndex={0}
  onKeyDown={e => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle() }
  }}
  onClick={toggle}
>
```

---

## 자주 쓰는 ARIA 패턴

### 모달 / 다이얼로그

```tsx
function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // 포커스 트랩
  useEffect(() => {
    if (open) {
      dialogRef.current?.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={dialogRef}
      tabIndex={-1}
    >
      <h2 id="modal-title">{title}</h2>
      {children}
      <button onClick={onClose} aria-label="모달 닫기">✕</button>
    </div>
  )
}
```

### 토스트 / 알림

```tsx
// 스크린 리더에 동적 메시지 알림
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      // role="alert"은 암묵적으로 aria-live="assertive" 포함
      // success는 role="status" (암묵적 aria-live="polite")
      role={type === 'error' ? 'alert' : 'status'}
      aria-atomic="true"
    >
      {message}
    </div>
  )
}
```

### 로딩 상태

```tsx
function LoadingButton({ isLoading, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      aria-busy={isLoading}
      aria-label={isLoading ? '처리 중...' : undefined}
      disabled={isLoading}
    >
      {isLoading ? <Spinner aria-hidden="true" /> : children}
    </button>
  )
}
```

### 아코디언

```tsx
function Accordion({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentId = useId()

  return (
    <div>
      <button
        onClick={() => setIsOpen(p => !p)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        {title}
      </button>
      <div
        id={contentId}
        role="region"
        aria-labelledby={/* button id */}
        hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  )
}
```

---

## 키보드 네비게이션

```tsx
// 커스텀 드롭다운 — 방향키 네비게이션
function Menu({ items }: { items: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, items.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
        break
      case 'Home':
        setActiveIndex(0)
        break
      case 'End':
        setActiveIndex(items.length - 1)
        break
      case 'Escape':
        onClose()
        break
    }
  }

  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={item}
          role="menuitem"
          tabIndex={index === activeIndex ? 0 : -1}
          // menuitem에 aria-selected 없음 — 포커스로 활성 항목 표시
        >
          {item}
        </li>
      ))}
    </ul>
  )
}
```

---

## 시각적으로만 숨기기 (스크린 리더는 읽음)

```scss
// visually-hidden mixin — display:none은 스크린 리더도 안 읽음
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

```tsx
// 아이콘 버튼에 텍스트 설명 추가
<button>
  <SearchIcon aria-hidden="true" />
  <span className="sr-only">검색</span>
</button>
```

---

## a11y 테스트

```bash
pnpm add -D @axe-core/react axe-core
```

```tsx
// jest.setup.ts / vitest.setup.ts
import { configureAxe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)

// 테스트에서
import { axe } from 'jest-axe'

it('접근성 위반이 없다', async () => {
  const { container } = render(<Modal open title="테스트" onClose={() => {}} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```
