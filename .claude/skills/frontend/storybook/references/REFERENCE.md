## 사용 예시

<Canvas of={ButtonStories.Primary} />

## Props

<Controls />

## 모든 변형

<ArgTypes of={ButtonStories} />
```

---

## 6. TypeScript 타입 패턴

> 타입은 **프레임워크 패키지**에서 import한다 (`@storybook/react-vite`, `@storybook/nextjs-vite` 등). 렌더러 패키지(`@storybook/react`) import는 8.x 패턴이다.

### 기본 패턴 (권장)

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: MyComponent,
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;
```

### 제네릭 컴포넌트

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite';
import { List } from './List';

// 제네릭은 구체적 타입으로 바인딩
const meta = {
  component: List<string>,
  args: {
    items: ['Apple', 'Banana', 'Cherry'],
    renderItem: (item: string) => <span>{item}</span>,
  },
} satisfies Meta<typeof List<string>>;

export default meta;
type Story = StoryObj<typeof meta>;
```

### Decorator 타입

```typescript
const meta = {
  component: ThemeButton,
  decorators: [
    (Story) => (
      <ThemeProvider theme="dark">
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof ThemeButton>;
```

### render 함수

```typescript
export const WithCustomRender: Story = {
  args: { label: 'Hello' },
  render: (args) => (
    <div style={{ padding: '20px' }}>
      <Button {...args} />
    </div>
  ),
};
```

### 포터블 스토리 (Vitest·Jest에서 스토리 재사용)

```typescript
import { composeStories, setProjectAnnotations } from '@storybook/react-vite';
import * as stories from './Button.stories';

const { Primary } = composeStories(stories);
```

---

## 7. Decorators와 Parameters

### Decorators (래퍼)

```typescript
// 스토리 레벨
export const Dark: Story = {
  decorators: [
    (Story) => (
      <div className="dark-theme">
        <Story />
      </div>
    ),
  ],
};

// 글로벌 (.storybook/preview.tsx)
import type { Preview } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const preview: Preview = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default preview;
```

### Parameters (설정)

viewport·backgrounds는 v9부터 코어 내장이므로 애드온 설치 없이 parameters로 바로 쓴다.

```typescript
// 스토리 레벨
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    backgrounds: {
      default: 'dark',
    },
  },
};

// 글로벌 (.storybook/preview.ts)
const preview: Preview = {
  parameters: {
    layout: 'centered', // 'centered' | 'fullscreen' | 'padded'
  },
  // v10: 프로젝트 어노테이션의 globals → initialGlobals 로 이름 변경
  initialGlobals: {
    theme: 'light',
  },
};
```

---

## 8. 모노레포 환경 설정

Storybook은 **패키지별로 독립 실행**하는 것이 공식 권장 방식이다. 모노레포 루트에서 하나의 Storybook을 실행하는 것은 권장하지 않는다.

### 공유 패키지 스토리 포함 (앱 레벨에서 통합 시)

`.storybook/main.ts` — v10은 ESM이므로 `__dirname`을 직접 정의해야 한다.

```typescript
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(ts|tsx)',
    // 공유 패키지의 스토리도 포함
    '../../packages/ui/src/**/*.stories.@(ts|tsx)',
  ],
  framework: '@storybook/react-vite',
  // Vite 설정 커스터마이징 (모노레포 경로 해석)
  viteFinal: async (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@packages/ui': resolve(__dirname, '../../packages/ui/src'),
        },
      },
    };
  },
};

export default config;
```

### Turborepo 연동

`turbo.json`:

```json
{
  "tasks": {
    "storybook": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "build-storybook": {
      "outputs": ["storybook-static/**"],
      "dependsOn": ["^build"]
    }
  }
}
```

---

## 9. 시각 회귀 테스트 연동

시각 회귀는 별도 스킬에서 깊게 다룬다:

- **자체 호스팅(외부 SaaS 없이)** — `@storybook/test-runner` + Playwright `toHaveScreenshot`, baseline 운영 정책 → `frontend/storybook-visual-testing` 스킬
- **SaaS(Chromatic)** — 아래 최소 셋업만 참고

```bash
npm install -D chromatic
# 또는 Storybook Visual Tests 애드온
npm install -D @chromatic-com/storybook
```

```bash
npx chromatic --project-token=<PROJECT_TOKEN>

# 변경된 스토리만 스냅샷 (TurboSnap)
npx chromatic --only-changed --project-token=<PROJECT_TOKEN>
```

CI 연동 시 Node는 Storybook 10 요구사항(20.19+ / 22.12+)을 만족해야 한다.

```yaml
name: Chromatic
on: push

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # 전체 히스토리 필요 (diff 비교)
      - uses: actions/setup-node@v4
        with:
          node-version: '22.12'   # Storybook 10 최소 호환
      - run: npm ci
      - uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

> 주의: `pull_request` 이벤트 대신 `push`를 사용해야 Chromatic 베이스라인이 유실되지 않는다.

---

## 10. 흔한 실수와 해결

### v8 시절 import를 그대로 쓴 경우 (v10에서 가장 흔함)

```typescript
// 나쁜 예 — Storybook 8.x 경로 (v10에서 모듈 해석 실패)
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, expect, within, fn } from '@storybook/test';
import { Meta as MetaBlock, Canvas } from '@storybook/blocks';

// 좋은 예 — Storybook 10 경로
import type { Meta, StoryObj } from '@storybook/react-vite';   // 프레임워크 패키지
import { userEvent, expect, within, fn } from 'storybook/test'; // 코어 서브패스
import { Meta as MetaBlock, Canvas } from '@storybook/addon-docs/blocks';
```

`main.ts`의 `addons`에 `@storybook/addon-essentials` / `@storybook/addon-interactions`가 남아 있으면 제거한다 — v9에서 삭제되어 코어에 흡수됐다.

### main.ts를 CommonJS로 둔 경우

```typescript
// 나쁜 예 — v10은 ESM만 허용
const config = { /* ... */ };
module.exports = config;

// 좋은 예
const config: StorybookConfig = { /* ... */ };
export default config;
```

`__dirname` / `__filename` / `require`도 ESM에서는 없으므로 `import.meta.url` 기반으로 직접 만든다.

### args vs render 혼동

```typescript
// 나쁜 예: args와 render를 동시에 쓰면서 args를 무시
export const Bad: Story = {
  args: { label: 'Hello' },
  render: () => <Button label="Hardcoded" />, // args가 무시됨
};

// 좋은 예: render에서 args를 전달
export const Good: Story = {
  args: { label: 'Hello' },
  render: (args) => <Button {...args} />,
};
```

### storiesOf 마이그레이션

```typescript
// 제거됨 (Storybook 8.0에서 완전 삭제)
storiesOf('Button', module)
  .add('Primary', () => <Button variant="primary" />);

// CSF 3으로 전환
const meta = { component: Button } satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary' },
};
```

버전 업그레이드는 automigration이 포함된 공식 명령으로 수행한다:

```bash
npx storybook@latest upgrade
npx storybook doctor
```

### autodocs가 생성되지 않을 때

```typescript
// 나쁜 예 — v9에서 제거된 설정. main.ts에 남아 있으면 무시되거나 에러
docs: { autodocs: 'tag' }

// 좋은 예 1 — 컴포넌트에 태그 부여
const meta = {
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

// 좋은 예 2 — preview.ts에서 전역 활성화
const preview: Preview = { tags: ['autodocs'] };
```

`@storybook/addon-docs`가 `main.ts`의 `addons`에 등록되어 있는지도 확인한다.

### play function에서 비동기 요소 대기

```typescript
export const AsyncContent: Story = {
  play: async ({ canvas }) => {
    // 나쁜 예: 즉시 검증하면 비동기 렌더링 전 실패
    // await expect(canvas.getByText('Loaded')).toBeInTheDocument();

    // 좋은 예 1: find* 쿼리 (자체적으로 재시도)
    await expect(await canvas.findByText('Loaded')).toBeInTheDocument();

    // 좋은 예 2: waitFor로 대기
    await waitFor(() => expect(canvas.getByText('Loaded')).toBeInTheDocument());
  },
};
```

### 테스트 유틸을 원본 패키지에서 import

```typescript
// 나쁜 예: 원본 패키지에서 직접 import (인터랙션 패널 로깅 안 됨)
import { userEvent } from '@testing-library/user-event';
import { expect } from 'vitest';

// 좋은 예: storybook/test 래퍼에서 import
import { userEvent, expect, within, fn } from 'storybook/test';
```

### action으로 선언한 인자를 play에서 spy하려는 경우

```typescript
// 나쁜 예 — action은 로깅 전용, spy 검증 불가
argTypes: { onSubmit: { action: 'submitted' } },

// 좋은 예 — fn()을 args에 직접 할당
import { fn } from 'storybook/test';
const meta = { component: Form, args: { onSubmit: fn() } } satisfies Meta<typeof Form>;
```

---

## 11. 언제 사용 / 언제 사용하지 않을 것

### 사용해야 할 때

- 공유 UI 컴포넌트 라이브러리 문서화
- 디자이너와 개발자 간 컴포넌트 스펙 공유
- 컴포넌트 단위 시각적 회귀 테스트 (`frontend/storybook-visual-testing` 또는 Chromatic)
- 복잡한 인터랙션 시나리오 검증 (폼, 모달, 드롭다운)
- 디자인 시스템 카탈로그 구축

### 사용하지 않을 때

- 페이지 수준 통합 테스트 → Playwright/Cypress 사용
- API 호출 테스트 → MSW + Vitest/Jest 사용
- 비즈니스 로직 단위 테스트 → Vitest/Jest 단독 사용
- 컴포넌트가 극소수인 소규모 프로젝트 → 오버헤드 대비 효과 낮음
- Node 20.19 미만 환경에서 업그레이드 불가한 레거시 프로젝트 → Storybook 8.x 유지 후 Node 먼저 올린다
