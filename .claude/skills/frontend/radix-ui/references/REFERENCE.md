## 접근성 내장 동작

Radix의 가장 큰 가치. 직접 구현하면 누락하기 쉬운 WAI-ARIA 패턴을 자동으로 처리한다.

### 자동 처리 항목

| 기능 | 설명 |
|------|------|
| ARIA 역할 | `role="dialog"`, `role="listbox"`, `role="tab"` 등 자동 부여 |
| ARIA 관계 | `aria-labelledby`, `aria-describedby`, `aria-controls` 자동 연결 |
| ARIA 상태 | `aria-expanded`, `aria-selected`, `aria-checked` 자동 갱신 |
| 포커스 트랩 | Dialog, AlertDialog 열리면 내부에 포커스 가둠 |
| 포커스 복원 | Dialog 닫히면 트리거 요소로 포커스 복원 |
| Esc 키 | Dialog, Popover, DropdownMenu 등 Esc로 닫기 |
| 화살표 키 | Select, DropdownMenu, Tabs에서 방향키로 항목 이동 |
| Home/End | 메뉴/리스트에서 첫/마지막 항목으로 이동 |
| 타입어헤드 | Select, DropdownMenu에서 문자 입력으로 항목 검색 |
| 외부 클릭 | Popover, DropdownMenu 외부 클릭 시 닫기 |

### 접근성 필수 패턴

```tsx
// ✅ Dialog — Title 필수 (aria-labelledby 자동 생성)
<Dialog.Content>
  <Dialog.Title>제목은 필수</Dialog.Title>
  {/* Title을 시각적으로 숨기고 싶으면 */}
  {/* <VisuallyHidden asChild><Dialog.Title>숨겨진 제목</Dialog.Title></VisuallyHidden> */}
</Dialog.Content>

// ❌ Title 없으면 접근성 경고 발생
<Dialog.Content>
  <p>제목 없는 Dialog</p>  {/* 스크린 리더가 무엇인지 알 수 없음 */}
</Dialog.Content>
```

---

## Headless로 사용하는 방법

Radix Primitives는 스타일을 전혀 포함하지 않는다. 기본 렌더링된 DOM에 CSS Modules + SCSS로 스타일을 입힌다.

### SCSS 기반 Headless 사용 패턴

```tsx
// components/Dialog/Dialog.tsx
import { Dialog as RadixDialog } from 'radix-ui'
import styles from './Dialog.module.scss'

interface DialogProps {
  trigger: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Dialog({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={styles.overlay} />
        <RadixDialog.Content className={styles.content}>
          <RadixDialog.Title className={styles.title}>
            {title}
          </RadixDialog.Title>
          {description && (
            <RadixDialog.Description className={styles.description}>
              {description}
            </RadixDialog.Description>
          )}
          {children}
          <RadixDialog.Close className={styles.close} aria-label="닫기">
            &times;
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
```

```scss
// components/Dialog/Dialog.module.scss
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);

  &[data-state='open'] {
    animation: fadeIn 200ms ease;
  }

  &[data-state='closed'] {
    animation: fadeOut 200ms ease;
  }
}

.content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  max-width: 480px;
  width: 90vw;

  &[data-state='open'] {
    animation: contentShow 200ms ease;
  }

  &:focus {
    outline: none;
  }
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
}

.description {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px;
}

.close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;

  &:hover {
    background: #f0f0f0;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes contentShow {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
```

---

## 언제 Radix를 쓰고 언제 직접 구현할지

### Radix를 사용해야 하는 경우

| 경우 | 이유 |
|------|------|
| Dialog, Modal | 포커스 트랩, 포커스 복원, Esc 닫기, aria-* 자동 처리가 복잡 |
| Select, Combobox | 키보드 네비게이션, 타입어헤드, 스크롤 처리가 까다로움 |
| DropdownMenu, ContextMenu | 중첩 메뉴, 방향키 이동, 포커스 관리 |
| Tooltip | 지연 시간, 그룹 전환, 포지셔닝, 접근성 처리 |
| Tabs | 방향키 이동, 포커스 관리, ARIA 탭 패턴 |
| Accordion | 애니메이션 높이 계산, 키보드 접근성 |
| Popover | 포지셔닝, 외부 클릭 감지, 포커스 관리 |

### 직접 구현해도 되는 경우

| 경우 | 이유 |
|------|------|
| Button, Input | 기본 HTML 요소로 충분. Radix가 불필요한 추상화 |
| Card, Badge | 순수 레이아웃/표현 컴포넌트. 상호작용 없음 |
| 단순 Toggle | `useState` + `<button>` 조합이면 충분 |
| 프로젝트 고유 인터랙션 | Radix 패턴에 맞지 않는 커스텀 동작 |
| 성능 크리티컬 렌더링 | 리스트 아이템 수천 개 등 극단적 최적화 필요 시 |

### 판단 기준 요약

```
접근성 패턴이 복잡한가? (포커스 트랩, 키보드 네비게이션, ARIA 상태 관리)
  → YES: Radix 사용
  → NO: 직접 구현

상호작용 상태가 있는가? (open/closed, checked/unchecked)
  → YES + 접근성 중요: Radix 사용
  → YES + 단순: 직접 구현 가능
  → NO (순수 표현): 직접 구현
```

---

## 흔한 실수 패턴

### 1. asChild 자식에 Fragment 사용

```tsx
// ❌ Fragment는 DOM 요소가 아니므로 props merge 불가
<Dialog.Trigger asChild>
  <>
    <Icon />
    <span>열기</span>
  </>
</Dialog.Trigger>

// ✅ 단일 요소로 감싸기
<Dialog.Trigger asChild>
  <button>
    <Icon />
    <span>열기</span>
  </button>
</Dialog.Trigger>
```

### 2. Portal 내부에서 CSS 상속 끊김

```tsx
// ❌ Portal은 document.body에 렌더링되므로 부모 CSS 변수/폰트가 상속 안 됨
<div className="theme-dark">
  <Dialog.Root>
    <Dialog.Portal>
      {/* 이 안에서는 theme-dark의 CSS 변수가 적용 안 됨 */}
      <Dialog.Content className={styles.content}>...</Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</div>

// ✅ Portal의 container prop으로 렌더링 위치 지정
const themeRef = useRef<HTMLDivElement>(null)

<div className="theme-dark" ref={themeRef}>
  <Dialog.Root>
    <Dialog.Portal container={themeRef.current}>
      <Dialog.Content className={styles.content}>...</Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</div>

// ✅ 또는 body에 테마 CSS 변수를 전역으로 적용
```

### 3. Dialog.Title 누락

```tsx
// ❌ Title 없으면 접근성 경고 — 스크린 리더에서 Dialog 용도를 알 수 없음
<Dialog.Content>
  <h2>내가 만든 제목</h2>  {/* aria-labelledby 연결 안 됨 */}
</Dialog.Content>

// ✅ Dialog.Title 사용 (시각적으로 숨겨도 됨)
<Dialog.Content>
  <Dialog.Title>접근 가능한 제목</Dialog.Title>
</Dialog.Content>
```

### 4. Controlled 모드에서 onOpenChange 누락

```tsx
// ❌ open만 전달하고 onOpenChange 없으면 닫을 수 없음
<Dialog.Root open={isOpen}>...</Dialog.Root>

// ✅ 반드시 쌍으로 전달
<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>...</Dialog.Root>
```

### 5. 애니메이션 시 data-state 미활용

```scss
// ❌ CSS class toggle로 애니메이션 — Radix 상태와 불일치 가능
.content.open { opacity: 1; }
.content.closed { opacity: 0; }

// ✅ data-state로 직접 연결 — 항상 Radix 상태와 동기화
.content {
  &[data-state='open'] { opacity: 1; }
  &[data-state='closed'] { opacity: 0; }
}
```

### 6. Tooltip.Provider 중복 또는 누락

```tsx
// ❌ Provider 없으면 Tooltip이 동작하지 않음
<Tooltip.Root>...</Tooltip.Root>

// ❌ Tooltip마다 Provider를 감싸면 delayDuration 그룹 전환이 안 됨
<Tooltip.Provider><Tooltip.Root>...</Tooltip.Root></Tooltip.Provider>
<Tooltip.Provider><Tooltip.Root>...</Tooltip.Root></Tooltip.Provider>

// ✅ 앱 루트에 한 번만 감싸기
<Tooltip.Provider delayDuration={200}>
  <App />
</Tooltip.Provider>
```

### 7. Select.Item에 빈 value 사용

```tsx
// ❌ 빈 문자열 value는 placeholder와 충돌
<Select.Item value="">선택 없음</Select.Item>

// ✅ 명시적 value 사용
<Select.Item value="none">선택 없음</Select.Item>
```
