---
name: storybook
description: Storybook 8.x 컴포넌트 문서화 — CSF 3.0, args/argTypes/controls, play function 인터랙션 테스트, autodocs, TypeScript 타입 패턴, Vite/Next.js 설정, Chromatic 연동
---

# Storybook 8.x 컴포넌트 문서화

> 소스: https://storybook.js.org/docs/8
> 검증일: 2026-04-20

---

## 1. 설치 및 초기 설정

### 신규 프로젝트 (권장)

```bash
npx storybook@latest init
```

`storybook@latest init`은 프레임워크(React, Next.js, Vue 등)를 자동 감지하여 적합한 패키지를 설치하고 `.storybook/main.ts`, `.storybook/preview.ts`, 예제 스토리 파일을 생성한다. Storybook 8.x는 Vite를 기본 빌더로 사용하며 React 18+ 필수다.

### Vite 프로젝트 수동 설정

```bash
npm install -D @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions @storybook/test
```

> 주의: `@storybook/react-vite`에 `@storybook/react`가 이미 포함되어 있으므로 별도로 설치하지 않아도 된다.

`.storybook/main.ts`:

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag', // tags: ['autodocs'] 붙은 스토리만 자동 문서화
  },
};

export default config;
```

### Next.js 프로젝트

```bash
npx storybook@latest init
```

`@storybook/nextjs` 프레임워크가 자동 감지된다. `next/image`, `next/link`, `next/router`를 자동 모킹하므로 별도 설정 없이 동작한다.

```typescript
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
};

export default config;
```

> `@storybook/nextjs` router 기본값: `pathname: '/'`, `query: {}`. `parameters`로 오버라이드 가능.

---

## 2. CSF 3.0 스토리 작성

Storybook 8.x는 CSF 3.0(Component Story Format)을 기본 포맷으로 사용한다. `storiesOf` API는 Storybook 8.0에서 제거되었다.

### 기본 구조

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

// Meta: 컴포넌트 수준 설정
const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'], // 자동 문서 페이지 생성
  parameters: {
    layout: 'centered', // 'centered' | 'fullscreen' | 'padded'
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
      description: '버튼 스타일 변형',
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    onClick: {
      action: 'clicked', // Actions 패널에 이벤트 로깅
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 각 스토리는 named export
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Large: Story = {
  args: {
    ...Primary.args,
    size: 'lg',
  },
};
```

### 핵심 규칙

- `export default`: Meta 객체 (컴포넌트 수준 설정)
- `export const {Name}`: 개별 스토리
- `satisfies Meta<typeof Component>`: 타입 안전성 보장 (TypeScript satisfies 연산자 활용)
- `type Story = StoryObj<typeof meta>`: meta에서 args 타입 자동 추론

---

## 3. Args, ArgTypes, Controls

### Args

스토리의 props 초기값을 선언한다. Meta에서 설정한 공통 args는 모든 스토리에 적용된다.

```typescript
const meta = {
  component: Button,
  args: {
    variant: 'primary', // 모든 스토리의 기본값
  },
} satisfies Meta<typeof Button>;

export const Default: Story = {
  args: {
    label: 'Click me',
    disabled: false,
    // variant는 meta.args에서 상속
  },
};
```

### ArgTypes — Control 타입

| control 타입 | 용도 | 예시 |
|-------------|------|------|
| `'text'` | 문자열 입력 | label, placeholder |
| `'number'` | 숫자 입력 | count, max |
| `'boolean'` | 토글 스위치 | disabled, loading |
| `'select'` | 드롭다운 선택 | variant, size |
| `'radio'` | 라디오 버튼 | size, theme |
| `'color'` | 색상 선택 | backgroundColor |
| `'date'` | 날짜 선택 | createdAt |
| `'object'` | JSON 편집 | style, config |
| `'range'` | 슬라이더 | opacity, fontSize |
| `false` | 컨트롤 숨김 | children, className |

```typescript
argTypes: {
  // 컨트롤 숨김
  className: { control: false },
  // 범위 제한
  count: {
    control: { type: 'range', min: 0, max: 100, step: 5 },
  },
  // 테이블 설명 추가
  variant: {
    control: 'select',
    options: ['primary', 'secondary'],
    description: '버튼 변형',
    table: {
      type: { summary: 'string' },
      defaultValue: { summary: 'primary' },
    },
  },
},
```

### TypeScript에서 자동 추론

TypeScript props가 있으면 argTypes가 자동 추론된다. 추가 커스터마이징만 수동으로 작성한다.

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary';  // → 자동으로 select 컨트롤
  disabled?: boolean;                 // → 자동으로 boolean 컨트롤
  onClick?: () => void;              // → 자동으로 action 타입
}
```

### Actions 설정

```typescript
// 방법 1: argTypes에서 action 명시
argTypes: {
  onClick: { action: 'clicked' },
},

// 방법 2: fn() 사용 (play function에서 spy 가능 — 권장)
import { fn } from '@storybook/test';

const meta = {
  component: Button,
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;
```

> 주의: `argTypesRegex`로 자동 추론된 args는 play function 내에서 spy로 사용할 수 없다. play function과 함께 사용할 때는 `fn()` 유틸을 직접 사용해야 한다.

---

## 4. Play Function (인터랙션 테스트)

`@storybook/test` 패키지는 Vitest + Testing Library의 Storybook 래퍼를 제공한다. 원본 패키지가 아닌 `@storybook/test`에서 import해야 인터랙션 패널에 정상 로깅된다.

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { LoginForm } from './LoginForm';

const meta = {
  component: LoginForm,
  args: {
    onSubmit: fn(), // 모킹된 함수 (spy 가능)
  },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FilledForm: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 사용자 입력 시뮬레이션 — 항상 await
    await userEvent.type(
      canvas.getByLabelText('Email'),
      'user@example.com'
    );
    await userEvent.type(
      canvas.getByLabelText('Password'),
      'password123'
    );

    // 버튼 클릭
    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));

    // 검증 — 항상 await
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    await expect(
      canvas.getByText('Successfully submitted')
    ).toBeInTheDocument();
  },
};
```

### play function 핵심 API

```typescript
import { expect, fn, userEvent, within, waitFor, step } from '@storybook/test';

// within: canvasElement 내부에서 쿼리
const canvas = within(canvasElement);

// userEvent: 사용자 이벤트 (모두 await 필수)
await userEvent.click(element);
await userEvent.type(input, 'text');
await userEvent.clear(input);
await userEvent.selectOptions(select, 'value');
await userEvent.hover(element);
await userEvent.keyboard('{Enter}');

// fn(): Vitest spy 함수
const mockFn = fn();

// expect: jest-dom 포함 (모두 await 권장)
await expect(element).toBeInTheDocument();
await expect(element).toHaveTextContent('text');
await expect(mockFn).toHaveBeenCalledWith(args);

// waitFor: 비동기 대기
await waitFor(() => expect(element).toBeVisible());

// step: 인터랙션 패널 그룹핑
await step('로그인 폼 입력', async () => {
  await userEvent.type(canvas.getByLabelText('Email'), 'user@example.com');
});
```

### 스토리 간 합성 (compose)

```typescript
export const LoggedIn: Story = {
  play: async (context) => {
    // 다른 스토리의 play 먼저 실행
    await FilledForm.play!(context);

    const canvas = within(context.canvasElement);
    await expect(canvas.getByText('Welcome')).toBeInTheDocument();
  },
};
```

---

## 5. Autodocs (자동 문서화)

### 활성화 방법

**방법 1: 컴포넌트별 태그 (권장)**

```typescript
const meta = {
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;
```

**방법 2: 전체 활성화**

`.storybook/main.ts`:

```typescript
const config: StorybookConfig = {
  docs: {
    autodocs: true, // 모든 스토리에 자동 문서 생성
  },
};
```

`autodocs: 'tag'` (기본값)이면 `tags: ['autodocs']`가 있는 컴포넌트만 문서 페이지가 생성된다. 특정 스토리를 autodocs에서 제외하려면 `tags: ['!autodocs']`를 사용한다.

### JSDoc 주석 연동

컴포넌트·props의 JSDoc이 autodocs 페이지에 반영된다.

```typescript
/**
 * 기본 버튼 컴포넌트
 *
 * 폼 제출, 다이얼로그 트리거, 액션 실행에 사용합니다.
 */
export function Button({
  /** 버튼 스타일 변형 */
  variant = 'primary',
  /** 버튼 크기 */
  size = 'md',
  /** 비활성 상태 */
  disabled = false,
  children,
}: ButtonProps) {
  // ...
}
```

### MDX 문서 커스터마이징

`Button.mdx`:

```mdx
import { Meta, Canvas, Controls, ArgTypes } from '@storybook/blocks';
import * as ButtonStories from './Button.stories';

<Meta of={ButtonStories} />

# Button

기본 버튼 컴포넌트입니다.

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
