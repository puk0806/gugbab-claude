---
name: radix-ui
description: Radix UI Primitives 헤드리스 컴포넌트 — asChild/Slot, Compound Component, Controlled/Uncontrolled, data-attribute + SCSS 스타일링, 접근성 내장
---

# Radix UI Primitives

> 소스: https://www.radix-ui.com/primitives/docs/overview/introduction
> 검증일: 2026-04-17

> 주의: 통합 패키지 radix-ui v1.4.x 기준. 정확한 마이너 버전은 npm registry에서 확인 필요.

---

## 설치 및 의존성

```bash
# 통합 패키지 (v1.4.x 이후 권장)
npm install radix-ui

# 기존 개별 패키지 (마이그레이션 권장)
# npm install @radix-ui/react-dialog @radix-ui/react-select ...
```

```json
// package.json
{
  "dependencies": {
    "radix-ui": "^1.4.0",
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  }
}
```

### 개별 패키지에서 통합 패키지로 마이그레이션

```tsx
// Before (개별 패키지)
import * as Dialog from '@radix-ui/react-dialog'
import * as Select from '@radix-ui/react-select'

// After (통합 패키지)
import { Dialog, Select } from 'radix-ui'
```

---

## asChild / Slot 패턴

Radix의 핵심 합성(composition) 메커니즘. `asChild` prop을 사용하면 Radix가 기본 DOM 요소를 렌더링하지 않고, 자식 요소에 props를 merge한다.

### 동작 원리

1. `asChild={false}` (기본값): Radix가 내부 DOM 요소(예: `<button>`)를 렌더링
2. `asChild={true}`: 자식 요소를 그대로 렌더링하되, Radix의 props(이벤트 핸들러, aria 속성, data 속성)를 자식에 merge

내부적으로 `@radix-ui/react-slot`의 `Slot` 컴포넌트가 이를 처리한다. Slot은 자식의 props와 Radix의 props를 얕게 merge하고, 이벤트 핸들러는 체이닝한다.

```tsx
import { Dialog } from 'radix-ui'

// 기본 — Radix가 <button>을 렌더링
<Dialog.Trigger>열기</Dialog.Trigger>
// 출력: <button data-state="closed">열기</button>

// asChild — 자식 요소에 props를 merge
<Dialog.Trigger asChild>
  <a href="#">열기 링크</a>
</Dialog.Trigger>
// 출력: <a href="#" data-state="closed" role="button">열기 링크</a>
```

### asChild 사용 규칙

```tsx
// asChild 자식은 반드시 단일 React 요소여야 한다
// ✅ 올바름
<Dialog.Trigger asChild>
  <button className={styles.trigger}>열기</button>
</Dialog.Trigger>

// ❌ Fragment나 여러 자식 불가
<Dialog.Trigger asChild>
  <>
    <span>아이콘</span>
    <span>텍스트</span>
  </>
</Dialog.Trigger>

// ✅ 커스텀 컴포넌트 사용 시 — forwardRef 필수 (React 18)
// React 19에서는 ref가 일반 prop이므로 forwardRef 불필요
const CustomButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <button ref={ref} {...props} />
)

<Dialog.Trigger asChild>
  <CustomButton>열기</CustomButton>
</Dialog.Trigger>
```

---

## Compound Component API

Radix는 모든 컴포넌트를 dot notation Compound Component로 제공한다. 각 서브 컴포넌트가 명확한 역할을 갖는다.

### Dialog 예시

```tsx
import { Dialog } from 'radix-ui'

function ConfirmDialog() {
  return (
    <Dialog.Root>
      {/* Trigger: 클릭하면 Dialog 열림 */}
      <Dialog.Trigger asChild>
        <button>삭제</button>
      </Dialog.Trigger>

      {/* Portal: document.body에 렌더링 */}
      <Dialog.Portal>
        {/* Overlay: 배경 오버레이 */}
        <Dialog.Overlay className={styles.overlay} />

        {/* Content: 실제 Dialog 내용 */}
        <Dialog.Content className={styles.content}>
          {/* Title: 접근성을 위한 제목 (필수) */}
          <Dialog.Title>정말 삭제하시겠습니까?</Dialog.Title>

          {/* Description: 접근성을 위한 설명 (선택) */}
          <Dialog.Description>
            이 작업은 되돌릴 수 없습니다.
          </Dialog.Description>

          <div className={styles.actions}>
            {/* Close: 클릭하면 Dialog 닫힘 */}
            <Dialog.Close asChild>
              <button>취소</button>
            </Dialog.Close>
            <button onClick={handleDelete}>삭제</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### Select 예시

```tsx
import { Select } from 'radix-ui'

function FruitSelect() {
  return (
    <Select.Root>
      <Select.Trigger className={styles.trigger}>
        <Select.Value placeholder="과일 선택" />
        <Select.Icon />
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className={styles.content}>
          <Select.Viewport>
            <Select.Group>
              <Select.Label>과일</Select.Label>
              <Select.Item value="apple" className={styles.item}>
                <Select.ItemIndicator>✓</Select.ItemIndicator>
                <Select.ItemText>사과</Select.ItemText>
              </Select.Item>
              <Select.Item value="banana" className={styles.item}>
                <Select.ItemIndicator>✓</Select.ItemIndicator>
                <Select.ItemText>바나나</Select.ItemText>
              </Select.Item>
            </Select.Group>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
```

### Tooltip 예시

```tsx
import { Tooltip } from 'radix-ui'

function IconWithTooltip() {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button className={styles.iconButton}>?</button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className={styles.tooltip} sideOffset={5}>
            도움말 내용
            <Tooltip.Arrow className={styles.arrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
```

> Tooltip.Provider는 앱 루트에 한 번 감싸면 하위 모든 Tooltip에 적용된다.

---

## Controlled / Uncontrolled 모드

모든 상태를 가진 Radix 컴포넌트는 두 모드를 지원한다.

### Uncontrolled (기본)

```tsx
// 내부에서 상태 관리 — defaultOpen으로 초기값만 설정
<Dialog.Root defaultOpen={false}>
  ...
</Dialog.Root>

<Select.Root defaultValue="apple">
  ...
</Select.Root>

<Accordion.Root type="single" defaultValue="item-1">
  ...
</Accordion.Root>
```

### Controlled

```tsx
// 외부에서 상태 관리 — open/onOpenChange 패턴
function ControlledDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button>열기</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content className={styles.content}>
          <p>현재 상태: {open ? '열림' : '닫힘'}</p>
          <Dialog.Close asChild>
            <button>닫기</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### 컴포넌트별 Controlled Props

| 컴포넌트 | Controlled | Uncontrolled | onChange 콜백 |
|----------|-----------|-------------|--------------|
| Dialog | `open` | `defaultOpen` | `onOpenChange` |
| Select | `value` | `defaultValue` | `onValueChange` |
| Accordion | `value` | `defaultValue` | `onValueChange` |
| Tabs | `value` | `defaultValue` | `onValueChange` |
| Popover | `open` | `defaultOpen` | `onOpenChange` |
| Collapsible | `open` | `defaultOpen` | `onOpenChange` |
| DropdownMenu | `open` | `defaultOpen` | `onOpenChange` |
| Checkbox | `checked` | `defaultChecked` | `onCheckedChange` |
| Switch | `checked` | `defaultChecked` | `onCheckedChange` |

---

## data-attribute 기반 스타일링 (SCSS)

Radix는 컴포넌트 상태에 따라 data attribute를 자동으로 부여한다. CSS/SCSS에서 이를 선택자로 사용하면 JS 상태와 스타일을 자연스럽게 연결할 수 있다.

### 주요 data-attribute 목록

| attribute | 값 | 사용 컴포넌트 |
|-----------|-----|--------------|
| `data-state` | `"open"` / `"closed"` | Dialog, Popover, Collapsible, DropdownMenu |
| `data-state` | `"checked"` / `"unchecked"` | Checkbox, Switch |
| `data-state` | `"active"` / `"inactive"` | Tabs.Trigger |
| `data-state` | `"on"` / `"off"` | Toggle |
| `data-disabled` | (존재 여부) | 비활성화된 컴포넌트 |
| `data-orientation` | `"vertical"` / `"horizontal"` | Accordion, Tabs, Separator |
| `data-highlighted` | (존재 여부) | 키보드/마우스로 포커스된 메뉴 아이템 |
| `data-side` | `"top"` / `"right"` / `"bottom"` / `"left"` | 팝오버/툴팁 위치 |
| `data-align` | `"start"` / `"center"` / `"end"` | 팝오버/툴팁 정렬 |

### SCSS 선택자 예시

```scss
// Dialog
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 200ms ease;

  &[data-state='open'] {
    opacity: 1;
  }
}

.content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.95);
  opacity: 0;
  transition: transform 200ms ease, opacity 200ms ease;

  &[data-state='open'] {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }

  &[data-state='closed'] {
    transform: translate(-50%, -50%) scale(0.95);
    opacity: 0;
  }
}
```

```scss
// Accordion
.accordionTrigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  cursor: pointer;

  .chevron {
    transition: transform 200ms ease;
  }

  &[data-state='open'] {
    .chevron {
      transform: rotate(180deg);
    }
  }

  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.accordionContent {
  overflow: hidden;

  &[data-state='open'] {
    animation: slideDown 200ms ease;
  }

  &[data-state='closed'] {
    animation: slideUp 200ms ease;
  }
}

@keyframes slideDown {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes slideUp {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}
```

```scss
// Select
.selectTrigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;

  &[data-state='open'] {
    border-color: #0066ff;
    box-shadow: 0 0 0 2px rgba(0, 102, 255, 0.2);
  }

  &[data-placeholder] {
    color: #999;
  }
}

.selectItem {
  padding: 8px 12px;
  cursor: pointer;

  &[data-highlighted] {
    background: #f0f0f0;
    outline: none;
  }

  &[data-state='checked'] {
    font-weight: 600;
  }

  &[data-disabled] {
    opacity: 0.5;
    pointer-events: none;
  }
}
```

```scss
// Tabs
.tabsTrigger {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: color 150ms, border-color 150ms;

  &[data-state='active'] {
    color: #0066ff;
    border-bottom-color: #0066ff;
  }

  &[data-orientation='vertical'] {
    border-bottom: none;
    border-right: 2px solid transparent;

    &[data-state='active'] {
      border-right-color: #0066ff;
    }
  }
}
```

```scss
// Checkbox / Switch
.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 4px;
  transition: background 150ms, border-color 150ms;

  &[data-state='checked'] {
    background: #0066ff;
    border-color: #0066ff;
  }

  &[data-state='indeterminate'] {
    background: #999;
    border-color: #999;
  }
}
```

### CSS 변수 (Radix 자동 제공)

Radix는 일부 컴포넌트에 CSS 변수를 자동으로 주입한다.

| 변수 | 컴포넌트 | 용도 |
|------|---------|------|
| `--radix-accordion-content-height` | Accordion.Content | 콘텐츠 높이 애니메이션 |
| `--radix-accordion-content-width` | Accordion.Content | 콘텐츠 너비 애니메이션 |
| `--radix-collapsible-content-height` | Collapsible.Content | 접기/펼치기 높이 |
| `--radix-collapsible-content-width` | Collapsible.Content | 접기/펼치기 너비 |
| `--radix-select-trigger-width` | Select.Content | 트리거 너비 맞춤 |
| `--radix-popper-available-height` | Popover, Tooltip 등 | 사용 가능한 높이 |
| `--radix-popper-available-width` | Popover, Tooltip 등 | 사용 가능한 너비 |

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
