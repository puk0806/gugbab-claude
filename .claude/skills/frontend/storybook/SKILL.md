---
name: storybook
description: Storybook 10 컴포넌트 문서화 — ESM-only 설정, CSF 3 스토리, args/argTypes/controls, play function 인터랙션 테스트, autodocs 태그, TypeScript 타입 패턴, Vite/Next.js 프레임워크 설정, v8→v10 마이그레이션
---

# Storybook 10 컴포넌트 문서화

> 소스: https://storybook.js.org/docs | https://storybook.js.org/docs/releases/migration-guide | https://github.com/storybookjs/storybook/blob/next/MIGRATION.md
> 검증일: 2026-08-11
> 대상 버전: Storybook 10.5.x (2026-08-11 기준 최신 안정 10.5.7) · React ≥ 16.8 · Vite ≥ 5

시각 회귀(스크린샷) 테스트 셋업은 이 스킬 범위가 아니다 → `frontend/storybook-visual-testing` 스킬 참조.
이 스킬은 **설치·스토리 작성·컨트롤·인터랙션·문서화** 기본기를 다룬다.

---

## 0. v8 → v10 마이그레이션 노트 (먼저 읽기)

Storybook 9와 10에서 **패키지 구조가 크게 바뀌었다.** 8.x 시절 코드를 그대로 쓰면 대부분 import부터 깨진다.

### 필수 요구사항 변화

| 항목 | Storybook 8.x | Storybook 10 |
|------|---------------|--------------|
| Node.js | 18+ | **20.19+ 또는 22.12+** |
| 패키지 형식 | CJS + ESM 듀얼 | **ESM only** |
| `.storybook/main.*` | CJS·ESM 모두 가능 | **유효한 ESM 필수** |
| Vite | 4+ | **5+** (Vite 4 지원 중단) |
| TypeScript | 4.x | **4.9+** |
| 패키지 매니저 | 제한 없음 | npm 10+ / pnpm 9+ / yarn 4+ |
| Next.js | 13+ | **14.1+** |

> 주의: Node 요구 버전은 소스 간 표기가 갈린다. 공식 마이그레이션 가이드는 **20.19+ / 22.12+**, Storybook 10 릴리즈 블로그는 "20.16+, 22.19+, 24+", 설치 문서는 "Node 20+"로 적혀 있다. `require(esm)`가 플래그 없이 켜지는 실제 Node 버전이 20.19.0 / 22.12.0이므로 **마이그레이션 가이드 기준(20.19+ / 22.12+)을 따르는 것이 안전**하다. CI 이미지도 이 기준으로 고정한다.

### 패키지 이동 대응표 (가장 자주 걸리는 항목)

| Storybook 8.x | Storybook 10 | 비고 |
|---------------|--------------|------|
| `@storybook/test` | `storybook/test` | 스코프 제거, 코어 서브패스 |
| `@storybook/addon-actions` | `storybook/actions` | 코어 통합 |
| `@storybook/addon-viewport` | `storybook/viewport` | 코어 통합 |
| `@storybook/addon-highlight` | `storybook/highlight` | 코어 통합 |
| `@storybook/preview-api` | `storybook/preview-api` | 코어 통합 |
| `@storybook/manager-api` | `storybook/manager-api` | 코어 통합 |
| `@storybook/theming` | `storybook/theming` | 코어 통합 |
| `@storybook/blocks` | `@storybook/addon-docs/blocks` | MDX Doc Block |
| `@storybook/types` | `storybook/internal/types` | 내부용 표시 |
| `@storybook/experimental-addon-test` | `@storybook/addon-vitest` | 이름 변경 |
| `@storybook/react` (타입 import) | `@storybook/react-vite` 등 **프레임워크 패키지** | 렌더러 → 프레임워크 |

### 제거된 애드온·API

- **`@storybook/addon-essentials` 제거** — controls·actions·backgrounds·viewport·toolbars·measure·outline·highlight가 **코어에 내장**됐다. `addons` 배열에서 삭제하면 된다.
- **`@storybook/addon-interactions` 제거** — 인터랙션 패널도 코어 내장.
- **`@storybook/addon-storysource`, `@storybook/addon-mdx-gfm` 제거.**
- **`docs.autodocs` 설정 옵션 제거** — autodocs는 오직 `tags`로만 제어한다.
- **`storyStoreV7` 피처 플래그 제거** (기본 동작).
- **빌트인 태그 `dev-only` / `docs-only` / `test-only` 제거** → `dev` / `autodocs` / `test` 조합으로 대체.
- **프로젝트 어노테이션 `globals` → `initialGlobals` 로 이름 변경.**
- Preact·Vue 3·Web Components의 **Webpack 5 빌더 지원 중단** (Vite로 이전).

### 업그레이드 실행

```bash
npx storybook@latest upgrade   # 자동 마이그레이션(automigration) 포함
npx storybook doctor           # 중복 의존성·비호환 애드온·버전 불일치 점검
```

> 자동 마이그레이션이 대부분을 처리하지만 **전부는 아니다.** 업그레이드 후 `main.ts`가 ESM인지, import 경로가 위 표대로인지 직접 확인한다.

---

## 1. 설치 및 초기 설정

### 신규 프로젝트 (권장)

```bash
npm create storybook@latest
```

프레임워크(React, Next.js, Vue 등)를 자동 감지해 적합한 패키지를 설치하고 `.storybook/main.ts`, `.storybook/preview.ts`, 예제 스토리를 생성한다. 설치 시 **Recommended**(개발 + 문서 + 테스트 + 접근성) / **Minimal**(개발만) 중 선택한다.

> `npx storybook@latest init`도 여전히 동작하지만, 현재 공식 문서가 안내하는 명령은 `npm create storybook@latest`다.

### Vite 프로젝트 수동 설정

```bash
npm install -D @storybook/react-vite @storybook/addon-docs
```

> 주의: `@storybook/react-vite`에 렌더러가 포함되어 있으므로 `@storybook/react`를 따로 설치하지 않는다.
> 주의: **`@storybook/addon-essentials` / `@storybook/addon-interactions`는 설치하지 않는다** — v9에서 제거되어 코어에 내장됐다. 남아 있으면 시작 시 에러가 난다.

`.storybook/main.ts` — **ESM이어야 한다**:

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-docs',   // autodocs·MDX 문서화
    '@storybook/addon-a11y',   // 접근성 검사 (선택)
  ],
  framework: '@storybook/react-vite',  // 문자열 축약형 가능
};

export default config;
```

ESM 전환 시 주의점:

```typescript
// 금지 — CommonJS
// module.exports = config;
// const path = require('path');
// path.join(__dirname, '...')

// 권장 — ESM
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url)); // 직접 정의해야 함
```

- 상대 경로 import는 **확장자를 명시**해야 한다 (`./helpers.js`).
- 로컬 애드온 참조는 상대 경로 대신 `import.meta.resolve()`로 완전 해석한다.
- `tsconfig.json`의 `moduleResolution`은 `types` 조건을 지원하는 값(`"bundler"` 또는 `"node16"`)이어야 한다.

### Next.js 프로젝트

```bash
npm create storybook@latest
```

Storybook 10은 **`@storybook/nextjs-vite`를 권장**한다(더 빠르고 테스트 기능 지원이 낫다). 커스텀 Webpack·Babel 설정이 있어 Vite와 호환되지 않는 경우에만 Webpack 기반 `@storybook/nextjs`를 쓴다. 최소 Next.js 14.1.

```typescript
import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: '@storybook/nextjs-vite',
};

export default config;
```

`next/image`, `next/router`, `next/navigation`, `next/head`, `next/font`가 자동 모킹된다. 라우터 값은 `nextjs` 파라미터 네임스페이스로 오버라이드한다(얕은 병합).

```typescript
export const OnProductPage: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,                      // App Router 사용 시
      navigation: { pathname: '/products/1' }, // App Router
      // router: { pathname: '/products/[id]', query: { id: '1' } }, // Pages Router
    },
  },
};
```

---

## 2. CSF 3 스토리 작성

Storybook 10은 CSF 3(Component Story Format)을 기본 포맷으로 사용한다. `storiesOf` API는 Storybook 8.0에서 이미 제거됐다.

> 타입은 **프레임워크 패키지**에서 import한다 (`@storybook/react-vite`, `@storybook/nextjs-vite` 등). 공식 문서는 `@storybook/your-framework` 플레이스홀더로 표기한다. 8.x 시절의 렌더러 패키지(`@storybook/react`) import는 v9부터 프레임워크 패키지로 옮기는 것이 공식 방향이다.

### 기본 구조

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite';
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

Controls는 **코어에 내장**되어 있다. 별도 애드온 설치가 필요 없다.

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
// 방법 1: argTypes에서 action 명시 (로깅만 필요할 때)
argTypes: {
  onClick: { action: 'clicked' },
},

// 방법 2: fn() 사용 (play function에서 spy 가능 — 권장)
import { fn } from 'storybook/test';   // ← v10: '@storybook/test' 아님

const meta = {
  component: Button,
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;
```

> 주의: `action`으로만 선언된 args는 play function 내에서 spy로 검증할 수 없다. 인터랙션 테스트를 붙일 인자는 반드시 `fn()`을 직접 할당한다. `fn()`으로 할당한 args는 Storybook이 자동으로 spy 처리해 Actions 패널에도 함께 표시된다.

---

## 4. Play Function (인터랙션 테스트)

`storybook/test` 모듈이 Vitest + Testing Library 래퍼를 제공한다. 원본 패키지(`vitest`, `@testing-library/*`)가 아닌 이 모듈에서 import해야 인터랙션 패널에 정상 로깅된다.

**v10 권장 시그니처**: play 컨텍스트에서 `canvas`와 `userEvent`를 바로 구조분해한다. `within(canvasElement)` 보일러플레이트가 더 이상 필요 없다.

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
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
  play: async ({ canvas, userEvent, args }) => {
    // 사용자 입력 시뮬레이션 — 항상 await
    await userEvent.type(canvas.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(canvas.getByLabelText('Password'), 'password123');

    // 버튼 클릭
    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));

    // 검증 — 항상 await
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText('Successfully submitted')).toBeInTheDocument();
  },
};
```

### play function 핵심 API

```typescript
import { expect, fn, userEvent, within, waitFor, screen, spyOn } from 'storybook/test';

// 컨텍스트에서 바로 받기 (권장)
play: async ({ canvas, userEvent, args, step, canvasElement }) => { /* ... */ }

// canvas: 스토리 루트에 스코프된 Testing Library 쿼리
canvas.getByRole('button');
await canvas.findByText('Loaded');

// screen: 캔버스 밖(포털·다이얼로그 등)까지 쿼리해야 할 때
await expect(screen.getByRole('dialog')).toBeInTheDocument();

// userEvent: 사용자 이벤트 (모두 await 필수)
await userEvent.click(element);
await userEvent.type(input, 'text');
await userEvent.clear(input);
await userEvent.selectOptions(select, 'value');
await userEvent.hover(element);
await userEvent.keyboard('{Enter}');

// fn(): Vitest mock 함수 / spyOn(): 기존 메서드 감시
const mockFn = fn();

// expect: jest-dom matcher 포함 (모두 await 권장)
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

> 레거시 호환: `within`은 여전히 `storybook/test`에서 export되므로 `within(canvasElement)` 패턴도 동작한다. 신규 코드에는 `canvas`를 쓴다.

### 스토리 간 합성 (compose)

```typescript
export const LoggedIn: Story = {
  play: async (context) => {
    // 다른 스토리의 play 먼저 실행
    await FilledForm.play!(context);

    await expect(context.canvas.getByText('Welcome')).toBeInTheDocument();
  },
};
```

### CLI·CI에서 인터랙션 테스트 실행

Vite 기반 프로젝트는 **Vitest 애드온**이 공식 경로다.

```bash
npx storybook add @storybook/addon-vitest
```

```typescript
// vitest.config.ts
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

export default defineConfig({
  plugins: [storybookTest({ configDir: '.storybook' })],
});
```

- 요구사항: Vitest ≥ 3, Vite 기반 프레임워크(`react-vite`, `nextjs-vite`, `vue3-vite` 등), Playwright Chromium(브라우저 모드)
- Vitest 애드온을 쓸 수 없는 환경(Webpack 빌더 등)에서는 `@storybook/test-runner`로 CI 실행한다

---

## 5. Autodocs (자동 문서화)

`@storybook/addon-docs`를 `main.ts`의 `addons`에 등록해야 동작한다.

### 활성화 방법 — 태그 전용

> **v9에서 `docs.autodocs` 설정 옵션이 제거됐다.** `autodocs: 'tag'` / `autodocs: true`는 더 이상 유효하지 않다. 오직 `tags`로만 제어한다.

**방법 1: 컴포넌트별 태그 (권장)**

```typescript
const meta = {
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;
```

**방법 2: 프로젝트 전역 활성화** — `.storybook/preview.ts`:

```typescript
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  tags: ['autodocs'], // 모든 컴포넌트에 문서 페이지 생성
};

export default preview;
```

전역 활성화 후 특정 컴포넌트·스토리를 제외하려면 `tags: ['!autodocs']`를 사용한다.

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

> Doc Block import 경로가 v10에서 바뀌었다: `@storybook/blocks` → **`@storybook/addon-docs/blocks`**

`Button.mdx`:

```mdx
import { Meta, Canvas, Controls, ArgTypes } from '@storybook/addon-docs/blocks';
import * as ButtonStories from './Button.stories';

<Meta of={ButtonStories} />

# Button

기본 버튼 컴포넌트입니다.

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
