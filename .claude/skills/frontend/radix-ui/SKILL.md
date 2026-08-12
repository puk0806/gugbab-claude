---
name: radix-ui
description: Radix UI Primitives 헤드리스 컴포넌트 — asChild/Slot, Compound Component, Controlled/Uncontrolled, data-attribute + SCSS 스타일링, 접근성 내장
---

# Radix UI Primitives

> 소스: https://www.radix-ui.com/primitives/docs/overview/introduction
> 소스: https://www.radix-ui.com/primitives/docs/overview/releases
> 검증일: 2026-08-11

> 통합 패키지 `radix-ui` **v1.6.7** 기준 (2026-07-24 릴리즈, npm registry `latest` 확인).
> v1.4.x → v1.6.x 사이에 **파괴적 변경 없음** — asChild/Slot, Compound Component, Controlled/Uncontrolled,
> data-attribute 스타일링 패턴은 모두 그대로 유효하다. 추가된 기능은 아래 "1.5~1.6 신규 사항" 참조.

---

## 설치 및 의존성

```bash
# 통합 패키지 (권장)
npm install radix-ui

# 기존 개별 패키지 (마이그레이션 권장)
# npm install @radix-ui/react-dialog @radix-ui/react-select ...
```

```json
// package.json
{
  "dependencies": {
    "radix-ui": "^1.6.0",
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  }
}
```

> Radix가 선언한 peerDependencies 범위는 `^16.8 || ^17.0 || ^18.0 || ^19.0`이다 (npm registry 확인).
> 신규 프로젝트는 React 18/19 기준으로 잡으면 된다.

### 개별 패키지에서 통합 패키지로 마이그레이션

```tsx
// Before (개별 패키지)
import * as Dialog from '@radix-ui/react-dialog'
import * as Select from '@radix-ui/react-select'

// After (통합 패키지)
import { Dialog, Select } from 'radix-ui'
```

### 개별 primitive 서브패스 임포트 (v1.6.3+)

루트 엔트리 외에 primitive별 서브패스 엔트리가 추가됐다. 번들러 트리셰이킹이 약한 환경에서 유용하다.

```tsx
// 루트 엔트리 (기본)
import { Accordion, Dialog } from 'radix-ui'

// primitive별 서브패스 (v1.6.3+)
import { Accordion } from 'radix-ui/accordion'
import * as Accordion from 'radix-ui/accordion'
```

> v1.6.3에서 컴포넌트 파트에 `/* @__PURE__ */` 주석과 named render 함수가 적용되어
> 루트 임포트도 트리셰이킹이 개선됐다. 서브패스는 그 위의 추가 보험 성격이다.

---

## asChild / Slot 패턴

Radix의 핵심 합성(composition) 메커니즘. `asChild` prop을 사용하면 Radix가 기본 DOM 요소를 렌더링하지 않고, 자식 요소에 props를 merge한다.

### 동작 원리

1. `asChild={false}` (기본값): Radix가 내부 DOM 요소(예: `<button>`)를 렌더링
2. `asChild={true}`: 자식 요소를 그대로 렌더링하되, Radix의 props(이벤트 핸들러, aria 속성, data 속성)를 자식에 merge

내부적으로 Slot 유틸리티가 이를 처리한다. Slot은 자식의 props와 Radix의 props를 얕게 merge하고, 이벤트 핸들러는 체이닝한다.

직접 `asChild`를 지원하는 자체 컴포넌트를 만들 때는 통합 패키지의 Slot을 쓴다. **통합 패키지에서는 네임스페이스 형태(`Slot.Root`)로 사용한다.**

```tsx
import { Slot } from 'radix-ui'

function Button({ asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  return <Comp {...props} />
}

// 아이콘 등 고정 자식과 함께 쓸 때 — Slottable로 "합성될 자식"을 지정
function IconButton({ asChild, leftIcon, children, ...props }: IconButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp {...props}>
      {leftIcon}
      <Slot.Slottable>{children}</Slot.Slottable>
    </Comp>
  )
}
```

> `Slot.Slottable`은 v1.5.0부터 render prop 형태의 `child`도 지원한다 —
> 합성 대상 요소를 추가 마크업으로 감싸면서 Slot이 props·ref는 그대로 merge하게 할 수 있다.

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

## 프리뷰(unstable) primitive

일부 신규 primitive는 API가 아직 고정되지 않아 `unstable_` 접두사로 export된다.
**프로덕션 도입 시 마이너 업데이트에서 API가 바뀔 수 있음을 감안한다.**

```tsx
// 일회용 비밀번호(OTP) 입력 — 문자당 input 분리 패턴
import { unstable_OneTimePasswordField as OneTimePasswordField } from 'radix-ui'

<OneTimePasswordField.Root>
  <OneTimePasswordField.Input />
  <OneTimePasswordField.Input />
  <OneTimePasswordField.Input />
  <OneTimePasswordField.Input />
  <OneTimePasswordField.Input />
  <OneTimePasswordField.Input />
  {/* 폼 데이터에 단일 값으로 제출되는 hidden input */}
  <OneTimePasswordField.HiddenInput />
</OneTimePasswordField.Root>
```

```tsx
// 비밀번호 표시/숨김 토글이 통합된 입력 필드
import { unstable_PasswordToggleField as PasswordToggleField } from 'radix-ui'

<PasswordToggleField.Root>
  <PasswordToggleField.Input />
  <PasswordToggleField.Toggle>
    <PasswordToggleField.Icon visible={<EyeOpenIcon />} hidden={<EyeClosedIcon />} />
  </PasswordToggleField.Toggle>
</PasswordToggleField.Root>
```

> OneTimePasswordField는 키보드 내비게이션·붙여넣기 처리·비밀번호 관리자 자동완성·완성 시 자동 제출까지 내장한다.
> PasswordToggleField는 토글 시 포커스 복귀와 폼 제출 후 자동 숨김 처리를 내장한다.

### 폼 컨트롤 내부 합성 파트 노출 (v1.5.0+)

폼 제출용 hidden(bubble) input을 직접 배치·생략할 수 있도록 내부 파트가 `unstable_` 접두사로 공개됐다.
기본 동작은 그대로이므로 **필요할 때만** 재합성한다.

| 컴포넌트 | 노출된 파트 |
|----------|------------|
| Checkbox | `unstable_Provider`, `unstable_Trigger`, `unstable_BubbleInput` |
| Switch | `unstable_Provider`, `unstable_Trigger`, `unstable_BubbleInput` |
| Select | `unstable_Provider`, `unstable_BubbleInput` |
| RadioGroup | `unstable_ItemProvider`, `unstable_ItemTrigger`, `unstable_ItemBubbleInput` |
| Slider | `unstable_ThumbProvider`, `unstable_ThumbTrigger`, `unstable_BubbleInput` |

```tsx
import { Switch } from 'radix-ui'

<Switch.unstable_Provider>
  <Switch.unstable_Trigger>
    <Switch.Thumb />
  </Switch.unstable_Trigger>
  {/* 폼 제출이 필요 없으면 생략 가능 */}
  <Switch.unstable_BubbleInput />
</Switch.unstable_Provider>
```

---

## v1.4 → v1.6 변경 요약

파괴적 변경은 없다. 아래는 추가·개선 사항이다.

| 버전 | 날짜 | 주요 변경 |
|------|------|-----------|
| 1.5.0 | 2026-06-06 | ContextMenu에 controlled `open` prop 지원 / 폼 컨트롤 `unstable_` 합성 파트 공개 / `Slot.Slottable` 중첩 render prop / Select presence 기반 exit 애니메이션 / SubContent에 `align` prop (DropdownMenu·ContextMenu·Menubar) / Toast.Provider `announcerContainer` prop / Popper anchor에 `data-side`·`data-align` 노출 |
| 1.6.0 | 2026-06-15 | React 19 관련 안정화 (Slot ref 콜백 무한 리렌더, Presence "Maximum update depth" 등) |
| 1.6.2 | 2026-07-06 | Form 파트 단독 렌더 시 런타임 에러 수정 / 폼 reset 시 값 동기화 (RadioGroup·Slider·Select·Switch) / React 19.2 관련 핸들러 수정 |
| 1.6.3~1.6.7 | 2026-07-20~24 | primitive별 서브패스 엔트리 추가 / `@__PURE__` 기반 트리셰이킹 개선 / dev 전용 경고를 프로덕션 번들에서 제거 / Dialog ARIA 참조 수정 |

**컴포넌트 API 관점의 조치 필요 사항: 없음.** 기존 v1.4.x 코드는 그대로 동작한다.

> 주의: ContextMenu의 controlled `open`은 공식 문서상 **상태 읽기·프로그래밍적 닫기 용도**로만 권장된다.
> 메뉴 위치가 사용자 포인터 위치에 의존하므로 프로그래밍적 열기는 권장되지 않는다.

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
