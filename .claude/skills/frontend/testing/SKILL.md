---
name: testing
description: Jest/Vitest + React Testing Library 핵심 패턴, 캡슐화 기반 컴포넌트 테스트 전략
---

# Testing — Jest/Vitest + React Testing Library

> 소스: https://testing-library.com/docs/react-testing-library/intro | https://vitest.dev/guide/ | https://vitest.dev/guide/migration/
> 검증일: 2026-09-28 (최초 2026-04-01 · 08-26 freshness 재검증 · 09-28 재검증: Vitest 5.0 메이저 출시(2026-09-03) 반영 — 아래 "주의 (Vitest 5.0+)" 참고. RTL 16.3 기준 나머지 패턴 VERIFIED)

---

## Jest vs Vitest 선택 기준

| | Jest | Vitest |
|---|---|---|
| **적합한 환경** | CRA, Next.js (기본 설정) | Vite, 모노레포 |
| **설정 복잡도** | Next.js에서 jest.config + babel/swc 설정 필요 | vite.config에 통합, 설정 최소 |
| **실행 속도** | 보통 | 빠름 (Vite HMR 활용) |
| **API 호환성** | - | Jest API 100% 호환 (`vi` = `jest`) |

**결론:** Vite 기반이면 Vitest, Next.js면 Jest (또는 Next.js 공식 jest 설정 사용).

---

## 설정

### Jest + Next.js

```bash
pnpm add -D jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
```

```js
// jest.config.js
const nextJest = require('next/jest')
const createJestConfig = nextJest({ dir: './' })

module.exports = createJestConfig({
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
})
```

```ts
// jest.setup.ts
import '@testing-library/jest-dom'
```

### Vitest + React

```bash
pnpm add -D vitest @vitest/ui jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
# Vitest 5.0+: vite가 direct dependency에서 peer dependency로 전환됨.
# 이미 Vite 프로젝트(vite.config.ts 보유)라면 영향 없음 — vite가 이미 devDependencies에 있으므로 그대로 사용.
# Vitest만 단독 설치하는 경우(Vite 프로젝트가 아님) yarn은 vite를 명시적으로 함께 설치해야 함: yarn add -D vite vitest
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    clearMocks: true, // Vitest 5.0+ 기본값(명시 안 해도 true) — 아래 "주의 (Vitest 5.0+)" 참고
  },
})
```

```ts
// vitest.setup.ts
import '@testing-library/jest-dom'
```

> **주의 (Vitest 5.0+, 2026-09-03 출시 · 메이저):** Node.js **22.12.0+**, Vite **6.4.0+** 필수. 핵심 브레이킹 체인지 3가지 —
> 1. **`clearMocks` 기본값이 `true`로 변경.** 매 테스트 전 `vi.clearAllMocks()`가 자동 호출되어 mock의 호출 이력(`toHaveBeenCalledTimes` 등)이 초기화됨(구현은 유지). v4 방식(수동 초기화)이 필요하면 `clearMocks: false` 명시.
> 2. **`vi.mock`/`vi.unmock`/`vi.hoisted`를 파일 최상단이 아닌 함수·블록 내부에서 호출하면 경고 대신 에러로 throw.** 이 문서의 `vi.mock(...)` 예시처럼 파일 최상단에 두면 영향 없음.
> 3. **`await` 없는 비동기 assertion(`resolves`/`rejects`/`toMatchFileSnapshot`)이 경고 대신 테스트 실패로 처리됨.** `test.sequential`/`describe.sequential`은 제거되어 `concurrent: false`로 대체.
> 출처: https://vitest.dev/guide/migration/ · https://vitest.dev/blog/vitest-5.html

---

## 핵심 원칙: 구현이 아닌 동작을 테스트

```tsx
// ❌ 구현 테스트 — 내부 상태를 직접 확인
expect(component.state.isOpen).toBe(true)
expect(wrapper.find('.dropdown-menu')).toHaveLength(1)

// ✅ 동작 테스트 — 사용자가 보는 것을 확인
expect(screen.getByRole('listbox')).toBeVisible()
expect(screen.getByText('옵션 1')).toBeInTheDocument()
```

---

## 컴포넌트 테스트 패턴

### 기본 구조

```tsx
// Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('텍스트를 렌더링한다', () => {
    render(<Button>저장</Button>)
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
  })

  it('클릭 시 onClick이 호출된다', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn() // Jest: jest.fn()

    render(<Button onClick={onClick}>저장</Button>)
    await user.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabled 상태에서 클릭이 무시된다', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button disabled onClick={onClick}>저장</Button>)
    await user.click(screen.getByRole('button'))

    expect(onClick).not.toHaveBeenCalled()
  })
})
```

### 캡슐화된 컴포넌트 테스트 — 내부 노출 없이 검증

```tsx
// Dropdown.test.tsx — 내부 구현(isOpen state 등)은 테스트하지 않음
describe('Dropdown', () => {
  it('트리거 클릭 시 옵션 목록이 열린다', async () => {
    const user = userEvent.setup()
    render(<Dropdown options={['사과', '배', '포도']} />)

    // 초기에는 닫혀 있음
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    // 트리거 클릭
    await user.click(screen.getByRole('button'))

    // 옵션 목록이 보임 — 내부 상태가 아닌 DOM으로 검증
    expect(screen.getByRole('listbox')).toBeVisible()
    expect(screen.getByText('사과')).toBeInTheDocument()
  })

  it('옵션 선택 시 onChange가 선택값과 함께 호출된다', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Dropdown options={['사과', '배']} onChange={onChange} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('사과'))

    expect(onChange).toHaveBeenCalledWith('사과')
  })
})
```

---

## 커스텀 훅 테스트

```tsx
// useCounter.test.ts
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('초기값으로 시작한다', () => {
    const { result } = renderHook(() => useCounter(10))
    expect(result.current.count).toBe(10)
  })

  it('increment 호출 시 1 증가한다', () => {
    const { result } = renderHook(() => useCounter(0))

    act(() => { result.current.increment() })

    expect(result.current.count).toBe(1)
  })
})
```

---

## 비동기 테스트

```tsx
// UserProfile.test.tsx
import { render, screen, waitFor } from '@testing-library/react'

// API 모킹 (Vitest)
vi.mock('../api/users', () => ({
  fetchUser: vi.fn().mockResolvedValue({ name: '홍길동', email: 'hong@test.com' }),
}))

describe('UserProfile', () => {
  it('사용자 정보를 불러와서 표시한다', async () => {
    render(<UserProfile userId="1" />)

    // 로딩 상태 확인
    expect(screen.getByText('로딩 중...')).toBeInTheDocument()

    // 데이터 로드 완료 대기
    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument()
    })

    expect(screen.getByText('hong@test.com')).toBeInTheDocument()
  })

  it('API 실패 시 에러 메시지를 표시한다', async () => {
    const { fetchUser } = await import('../api/users')
    vi.mocked(fetchUser).mockRejectedValueOnce(new Error('Network Error'))

    render(<UserProfile userId="1" />)

    await waitFor(() => {
      expect(screen.getByText('불러오기 실패')).toBeInTheDocument()
    })
  })
})
```

---

## 쿼리 우선순위 (RTL 권장 순서)

| 우선순위 | 쿼리 | 사용 시점 |
|---------|------|----------|
| 1 | `getByRole` | 접근성 역할 (button, heading, listbox 등) |
| 2 | `getByLabelText` | 폼 필드 (label과 연결된 input) |
| 3 | `getByPlaceholderText` | placeholder가 있는 input |
| 4 | `getByText` | 텍스트 콘텐츠 |
| 5 | `getByDisplayValue` | 현재 값이 있는 input/select |
| 6 | `getByAltText` | img alt 텍스트 |
| 7 | `getByTitle` | title 속성 |
| 8 | `getByTestId` | `data-testid` (최후 수단) |

---

## 테스트 파일 배치

```
components/
└── Button/
    ├── Button.tsx
    ├── Button.module.scss
    └── Button.test.tsx   ← 컴포넌트 옆에 배치 (colocated)
```

**`__tests__/` 폴더 분리보다 컴포넌트 옆에 두는 것을 권장.** 파일 이동 시 테스트도 함께 이동됨.
