---
name: testing
description: Jest/Vitest + React Testing Library 설정과 최신 브레이킹 체인지(Vitest 5.0, jest-dom 7.0) — Vitest 전용 jest-dom 진입점 포함
---

# Testing — Jest/Vitest + React Testing Library

> 소스: https://testing-library.com/docs/react-testing-library/intro | https://vitest.dev/guide/ | https://vitest.dev/guide/migration/
> 검증일: 2026-11-09 (최초 2026-04-01 · 08-26 · 09-28 재검증: Vitest 5.0 반영 · 11-09 재검증: Vitest 5.1.0 / Jest 30.5 / RTL 16.3.3 / jest-dom 7.0.1 기준 — jest-dom 7 브레이킹·Vitest 전용 import 반영)

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
// vitest.setup.ts — Vitest는 전용 진입점을 쓴다(jest-dom README "With Vitest")
import '@testing-library/jest-dom/vitest'
```

> TypeScript에서 matcher 타입이 안 잡히면 `tsconfig.json`의 `compilerOptions.types`에 `"vitest/globals"`, `"@testing-library/jest-dom"`을 넣고 `include`에 setup 파일을 포함한다.

> **주의 (`@testing-library/jest-dom` 7.0, 2026-07-20 · 메이저):** `@testing-library/dom`이 **필수 peer dependency**가 되었고(위 설치 명령처럼 함께 설치) **Node.js 22+** 가 필요하다. 신규 matcher `toContainAnyBy*`·`toContainOneBy*` 추가. Jest 쪽 setup(`import '@testing-library/jest-dom'`)은 그대로다.
> 출처: https://github.com/testing-library/jest-dom/releases · https://github.com/testing-library/jest-dom#with-vitest

> **주의 (Vitest 5.0+, 2026-09-03 출시 · 메이저):** Node.js **22.12.0+**, Vite **6.4.0+** 필수. 핵심 브레이킹 체인지 3가지 —
> 1. **`clearMocks` 기본값이 `true`로 변경.** 매 테스트 전 `vi.clearAllMocks()`가 자동 호출되어 mock의 호출 이력(`toHaveBeenCalledTimes` 등)이 초기화됨(구현은 유지). v4 방식(수동 초기화)이 필요하면 `clearMocks: false` 명시.
> 2. **`vi.mock`/`vi.unmock`/`vi.hoisted`를 파일 최상단이 아닌 함수·블록 내부에서 호출하면 경고 대신 에러로 throw.** 파일 최상단에 두면 영향 없음.
> 3. **`await` 없는 비동기 assertion(`resolves`/`rejects`/`toMatchFileSnapshot`)이 경고 대신 테스트 실패로 처리됨.** `test.sequential`/`describe.sequential`은 제거되어 `concurrent: false`로 대체.
> 출처: https://vitest.dev/guide/migration/ · https://vitest.dev/blog/vitest-5.html
