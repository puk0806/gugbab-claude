## 사용 예시

<Canvas of={ButtonStories.Primary} />

## Props

<Controls />

## 모든 변형

<ArgTypes of={ButtonStories} />
```

---

## 6. TypeScript 타입 패턴

### 기본 패턴 (권장)

```typescript
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  component: MyComponent,
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;
```

### 제네릭 컴포넌트

```typescript
import type { Meta, StoryObj } from '@storybook/react';
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

// 글로벌 (.storybook/preview.ts)
import type { Preview } from '@storybook/react';
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
};
```

---

## 8. 모노레포 환경 설정

Storybook은 **패키지별로 독립 실행**하는 것이 공식 권장 방식이다. 모노레포 루트에서 하나의 Storybook을 실행하는 것은 권장하지 않는다.

### 공유 패키지 스토리 포함 (앱 레벨에서 통합 시)

`.storybook/main.ts`:

```typescript
import path from 'path';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(ts|tsx)',
    // 공유 패키지의 스토리도 포함
    '../../packages/ui/src/**/*.stories.@(ts|tsx)',
  ],
  // Vite 설정 커스터마이징 (모노레포 경로 해석)
  viteFinal: async (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@packages/ui': path.resolve(__dirname, '../../packages/ui/src'),
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

## 9. Chromatic 시각적 회귀 테스트

### 설치

```bash
npm install -D chromatic
# 또는 Storybook 공식 Visual Tests 애드온
npm install -D @chromatic-com/storybook
```

### 실행

```bash
npx chromatic --project-token=<PROJECT_TOKEN>

# 변경된 스토리만 스냅샷 (TurboSnap)
npx chromatic --only-changed --project-token=<PROJECT_TOKEN>
```

### CI 연동 (GitHub Actions)

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
          node-version: '20'
      - run: npm ci
      - uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

> 주의: `pull_request` 이벤트 대신 `push`를 사용해야 Chromatic 베이스라인이 유실되지 않는다.

---

## 10. 흔한 실수와 해결

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
// 제거됨 (Storybook 8.x)
storiesOf('Button', module)
  .add('Primary', () => <Button variant="primary" />);

// CSF 3.0으로 전환
const meta = { component: Button } satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary' },
};

// 자동 마이그레이션 도구
// npx storybook@latest migrate storiesof-to-csf --glob="**/*.stories.tsx" --parser=tsx
// npx storybook@latest migrate csf-2-to-3 --glob="**/*.stories.tsx" --parser=tsx
```

### autodocs가 생성되지 않을 때

```typescript
// main.ts에서 docs.autodocs 설정 확인
docs: {
  autodocs: 'tag', // 'tag' 모드면 tags: ['autodocs'] 필수
}

// 컴포넌트에 tags 추가
const meta = {
  component: Button,
  tags: ['autodocs'], // 이 태그가 없으면 autodocs 미생성
} satisfies Meta<typeof Button>;
```

### play function에서 비동기 요소 대기

```typescript
export const AsyncContent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 나쁜 예: 즉시 검증하면 비동기 렌더링 전 실패
    // await expect(canvas.getByText('Loaded')).toBeInTheDocument();

    // 좋은 예: waitFor로 대기
    await waitFor(() =>
      expect(canvas.getByText('Loaded')).toBeInTheDocument()
    );
  },
};
```

### @storybook/test 올바른 import

```typescript
// 나쁜 예: 원본 패키지에서 직접 import
import { userEvent } from '@testing-library/user-event';
import { expect } from 'vitest';

// 좋은 예: @storybook/test 래퍼에서 import (인터랙션 패널 정상 동작)
import { userEvent, expect, within, fn } from '@storybook/test';
```

---

## 11. 언제 사용 / 언제 사용하지 않을 것

### 사용해야 할 때

- 공유 UI 컴포넌트 라이브러리 문서화
- 디자이너와 개발자 간 컴포넌트 스펙 공유
- 컴포넌트 단위 시각적 회귀 테스트 (Chromatic)
- 복잡한 인터랙션 시나리오 검증 (폼, 모달, 드롭다운)
- 디자인 시스템 카탈로그 구축

### 사용하지 않을 때

- 페이지 수준 통합 테스트 → Playwright/Cypress 사용
- API 호출 테스트 → MSW + Vitest/Jest 사용
- 비즈니스 로직 단위 테스트 → Vitest/Jest 단독 사용
- 컴포넌트가 극소수인 소규모 프로젝트 → 오버헤드 대비 효과 낮음
