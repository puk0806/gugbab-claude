---
name: e2e-testing
description: Playwright E2E 테스트 — 설치, 설정, 로케이터, POM, 네트워크 모킹, 인증, 비주얼 회귀, CI, 디버깅 전략
---

# E2E Testing — Playwright

> 소스: https://playwright.dev/docs/intro | https://playwright.dev/docs/best-practices
> 검증일: 2026-04-20
> 대상 버전: Playwright v1.59.1 (최신 안정)

---

## 언제 사용하는가

- 사용자 흐름(로그인 -> 결제 -> 확인)을 브라우저 레벨에서 검증할 때
- 크로스 브라우저(Chromium, Firefox, WebKit) 호환성을 확인할 때
- API 응답을 모킹하여 프론트엔드만 격리 테스트할 때
- 비주얼 회귀를 자동으로 탐지할 때

## 언제 사용하지 않는가

- 유닛 테스트 수준의 함수/유틸리티 검증 -> Vitest/Jest 사용
- 컴포넌트 단위 렌더링 테스트 -> React Testing Library 사용
- API 엔드포인트 단독 테스트 -> Supertest 또는 API 테스트 도구 사용

---

## 1. 설치 및 초기 설정

```bash
# 신규 프로젝트 초기화 (권장)
npm init playwright@latest

# 기존 프로젝트에 추가
npm install -D @playwright/test
npx playwright install --with-deps
```

초기화 시 생성되는 파일:
- `playwright.config.ts` — 테스트 설정
- `tests/example.spec.ts` — 예시 테스트
- `tests-examples/` — 추가 예제
- `.github/workflows/playwright.yml` — CI 워크플로 (선택)

---

## 2. playwright.config.ts 설정

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,     // CI에서 test.only 방지
  retries: process.env.CI ? 2 : 0,  // CI에서만 재시도
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html'],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',        // 실패 시 트레이스 수집
    screenshot: 'only-on-failure',
  },

  projects: [
    // 인증 셋업 프로젝트
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
    // 모바일 뷰포트
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
  ],

  // 개발 서버 자동 실행
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

### Next.js 프로젝트

```typescript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
},
```

### Vite 프로젝트

```typescript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:5173',
  reuseExistingServer: !process.env.CI,
},
```

---

## 3. 테스트 작성 패턴

```typescript
import { test, expect } from '@playwright/test';

test.describe('로그인 플로우', () => {
  test('유효한 자격 증명으로 로그인 성공', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('이메일').fill('user@example.com');
    await page.getByLabel('비밀번호').fill('password123');
    await page.getByRole('button', { name: '로그인' }).click();

    // Web-first assertion — 조건 충족까지 자동 재시도 (기본 5초)
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible();
  });

  test('잘못된 비밀번호로 에러 표시', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('이메일').fill('user@example.com');
    await page.getByLabel('비밀번호').fill('wrong');
    await page.getByRole('button', { name: '로그인' }).click();

    await expect(page.getByText('이메일 또는 비밀번호가 올바르지 않습니다')).toBeVisible();
  });
});
```

### Soft Assertions

여러 검증을 한 번에 수집하여 모든 실패를 한꺼번에 확인:

```typescript
test('프로필 페이지 요소 확인', async ({ page }) => {
  await page.goto('/profile');

  // 실패해도 테스트를 중단하지 않음
  await expect.soft(page.getByText('이름')).toBeVisible();
  await expect.soft(page.getByText('이메일')).toBeVisible();
  await expect.soft(page.getByText('가입일')).toBeVisible();
});
```

---

## 4. 로케이터 전략

### 우선순위 (공식 권장)

| 순위 | 로케이터 | 용도 |
|------|----------|------|
| 1 | `getByRole` | ARIA 역할 기반 (접근성과 일치, 가장 견고) |
| 2 | `getByLabel` | 폼 필드 (label과 연결된 input) |
| 3 | `getByPlaceholder` | placeholder가 유일한 식별자일 때 |
| 4 | `getByText` | 텍스트 콘텐츠로 식별 |
| 5 | `getByTestId` | 시맨틱 식별이 불가능할 때 (`data-testid`) |

### 체이닝과 필터링

```typescript
// 특정 리스트 아이템 내의 버튼 클릭
await page
  .getByRole('listitem')
  .filter({ hasText: '상품 A' })
  .getByRole('button', { name: '삭제' })
  .click();
```

### 피해야 할 로케이터

```typescript
// 나쁨 — CSS 선택자 (구현 종속, 리팩터링에 깨짐)
page.locator('.btn-primary.login-btn');

// 나쁨 — XPath (가독성 저하, 유지보수 어려움)
page.locator('//button[@class="submit"]');

// 좋음 — 사용자가 보는 것과 동일
page.getByRole('button', { name: '로그인' });
```

---

## 5. 페이지 오브젝트 모델 (POM)

```typescript
// e2e/pages/LoginPage.ts
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('이메일');
    this.passwordInput = page.getByLabel('비밀번호');
    this.submitButton = page.getByRole('button', { name: '로그인' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

```typescript
// e2e/tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('로그인 성공', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  await expect(page).toHaveURL('/dashboard');
});
```

### Fixture로 POM 주입 (권장)

```typescript
// e2e/fixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from '@playwright/test';
```

```typescript
// e2e/tests/login.spec.ts
import { test, expect } from '../fixtures';

test('로그인 성공', async ({ loginPage, page }) => {
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 6. 네트워크 인터셉트 (Mock API)

### 기본 API 모킹

```typescript
test('상품 목록 표시', async ({ page }) => {
  // API 응답을 가로채서 목 데이터 반환
  await page.route('**/api/products', async (route) => {
    await route.fulfill({
      status: 200,
      json: [
        { id: 1, name: '상품 A', price: 10000 },
        { id: 2, name: '상품 B', price: 20000 },
      ],
    });
  });

  await page.goto('/products');
  await expect(page.getByText('상품 A')).toBeVisible();
  await expect(page.getByText('상품 B')).toBeVisible();
});
```

### 실제 응답 수정

```typescript
test('가격에 할인 적용', async ({ page }) => {
  await page.route('**/api/products', async (route) => {
    const response = await route.fetch();
    const json = await response.json();

    // 가격에 50% 할인 적용
    const discounted = json.map((p: any) => ({
      ...p,
      price: p.price * 0.5,
    }));

    await route.fulfill({ response, json: discounted });
  });

  await page.goto('/products');
});
```

### HAR 파일 녹화/재생

```typescript
// 1단계: HAR 녹화 (update: true)
test('API 응답 녹화', async ({ page }) => {
  await page.routeFromHAR('e2e/fixtures/products.har', {
    url: '**/api/products',
    update: true,  // 실제 API 호출하여 HAR 파일 생성
  });
  await page.goto('/products');
});

// 2단계: HAR 재생 (update 제거)
test('녹화된 API로 테스트', async ({ page }) => {
  await page.routeFromHAR('e2e/fixtures/products.har', {
    url: '**/api/products',
    // update 없음 -> HAR 파일에서 응답 서빙
  });
  await page.goto('/products');
  await expect(page.getByText('상품 A')).toBeVisible();
});
```

---

## 7. 인증 상태 관리 (storageState)

### auth.setup.ts (셋업 프로젝트)

```typescript
// e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('인증 상태 저장', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('이메일').fill('test@example.com');
  await page.getByLabel('비밀번호').fill('password123');
  await page.getByRole('button', { name: '로그인' }).click();

  await expect(page).toHaveURL('/dashboard');

  // 쿠키 + localStorage + IndexedDB 저장
  await page.context().storageState({ path: authFile });
});
```

### playwright.config.ts에 연결

```typescript
projects: [
  {
    name: 'setup',
    testMatch: /.*\.setup\.ts/,
  },
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'playwright/.auth/user.json',
    },
    dependencies: ['setup'],
  },
],
```

### .gitignore에 추가 필수

```
playwright/.auth/
```

> 주의: storageState 파일에는 쿠키와 인증 토큰이 포함됩니다. 절대 Git에 커밋하지 마세요.

### 다중 역할 인증

```typescript
// e2e/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('admin 인증', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('이메일').fill('admin@example.com');
  await page.getByLabel('비밀번호').fill('admin-pass');
  await page.getByRole('button', { name: '로그인' }).click();
  await page.context().storageState({ path: 'playwright/.auth/admin.json' });
});

setup('user 인증', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('이메일').fill('user@example.com');
  await page.getByLabel('비밀번호').fill('user-pass');
  await page.getByRole('button', { name: '로그인' }).click();
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```

---

## 8. 비주얼 회귀 테스트

### 기본 스크린샷 비교

```typescript
test('홈 페이지 비주얼 확인', async ({ page }) => {
  await page.goto('/');

  // 첫 실행 시 기준 스크린샷 생성, 이후 비교
  await expect(page).toHaveScreenshot('home.png');
});

// 특정 요소만 비교
test('헤더 비주얼 확인', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('banner')).toHaveScreenshot('header.png');
});
```

### 비교 임계값 설정

```typescript
await expect(page).toHaveScreenshot('home.png', {
  maxDiffPixels: 100,        // 허용할 최대 다른 픽셀 수
  maxDiffPixelRatio: 0.01,   // 전체 대비 허용 비율 (1%)
  threshold: 0.2,            // 색상 차이 허용치 (0=엄격, 1=느슨)
});
```

### 동적 요소 숨기기

```typescript
await expect(page).toHaveScreenshot('dashboard.png', {
  // 동적 요소를 숨기는 CSS (Shadow DOM 내부에도 적용)
  stylePath: 'e2e/screenshot-styles.css',
});
```

```css
/* e2e/screenshot-styles.css */
[data-testid="current-time"],
[data-testid="ad-banner"] {
  visibility: hidden;
}
```

### 기준 스크린샷 갱신

```bash
npx playwright test --update-snapshots
```

> 주의: 브라우저/OS마다 렌더링이 다르므로 각 환경별 스크린샷이 별도로 저장됩니다. CI 환경(Linux)과 로컬(macOS)의 기준이 다를 수 있습니다.

---

## 9. CI 환경 — GitHub Actions

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: lts/*

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test

      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### 샤딩으로 병렬 실행

```yaml
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: blob-report-${{ matrix.shardIndex }}
          path: blob-report/
          retention-days: 1
```

---

## 10. 병렬 실행 및 샤딩

### 워커 설정

```typescript
// playwright.config.ts
export default defineConfig({
  // 기본값: 논리 CPU 코어의 절반
  workers: process.env.CI ? 2 : undefined,
  fullyParallel: true,  // 파일 내 테스트도 병렬 실행
});
```

### 파일 내 병렬 설정

```typescript
test.describe.configure({ mode: 'parallel' });

test('테스트 A', async ({ page }) => { /* ... */ });
test('테스트 B', async ({ page }) => { /* ... */ });
```

### 샤딩 (CLI)

```bash
# 4개 샤드 중 1번 실행
npx playwright test --shard=1/4

# fullyParallel: true -> 테스트 단위 분배 (권장)
# fullyParallel: false -> 파일 단위 분배
```

> 주의: `fullyParallel: true`일 때 개별 테스트 단위로 샤드에 분배됩니다. `false`면 파일 단위이므로 파일 크기를 균등하게 유지해야 합니다.

---

## 11. 디버깅

### UI Mode (로컬 개발 시 권장)

```bash
npx playwright test --ui
```

- 모든 테스트를 사이드바에서 탐색/실행
- 각 액션의 DOM 스냅샷을 타임라인으로 탐색
- Watch 모드로 파일 변경 시 자동 재실행

### Trace Viewer

```bash
# 트레이스 수집
npx playwright test --trace on

# 트레이스 파일 열기
npx playwright show-trace trace.zip
```

설정에서 자동 수집:

```typescript
use: {
  trace: 'on-first-retry',   // 첫 재시도 시만 (권장)
  // trace: 'on',             // 항상 수집 (디버깅 시)
  // trace: 'retain-on-failure', // 실패 시만 보존
},
```

Trace Viewer 기능:
- 타임라인에서 각 액션별 DOM 스냅샷 확인
- 네트워크 요청/응답 상세 확인
- 콘솔 로그 확인
- 로케이터 피커로 올바른 로케이터 탐색
- DevTools로 HTML/CSS 검사

### 단일 테스트 디버깅

```bash
# 특정 파일만 실행
npx playwright test login.spec.ts

# 특정 테스트만 실행 (-g 플래그)
npx playwright test -g "로그인 성공"

# 디버그 모드 (Inspector 열림, 단계별 실행)
npx playwright test --debug
```

---

## 12. 폴더 구조 권장

```
e2e/
├── fixtures.ts              # 커스텀 fixture 정의
├── auth.setup.ts            # 인증 셋업
├── pages/                   # Page Object Models
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   └── ProductPage.ts
├── fixtures/                # HAR 파일, 목 데이터
│   └── products.har
├── tests/                   # 테스트 파일
│   ├── auth/
│   │   └── login.spec.ts
│   ├── products/
│   │   └── product-list.spec.ts
│   └── checkout/
│       └── checkout-flow.spec.ts
└── screenshot-styles.css    # 비주얼 테스트용 스타일
playwright.config.ts
playwright/
└── .auth/                   # storageState (gitignore)
```

---

## 흔한 실수

| 실수 | 올바른 방법 |
|------|------------|
| `page.locator('.btn')` CSS 선택자 남용 | `page.getByRole('button', { name: '...' })` |
| `await page.waitForTimeout(3000)` 하드코딩 대기 | Web-first assertion 사용 (`toBeVisible`, `toHaveText`) |
| `expect(await el.isVisible()).toBe(true)` 수동 검증 | `await expect(el).toBeVisible()` 자동 재시도 |
| 테스트 간 상태 공유/의존 | 각 테스트는 독립적으로 실행 (test isolation) |
| storageState 파일을 Git에 커밋 | `.gitignore`에 `playwright/.auth/` 추가 |
| `test.only` CI에 남기기 | `forbidOnly: !!process.env.CI` 설정 |
| 외부 서비스(결제 API 등) 직접 호출 | `page.route`로 모킹하여 격리 |
| 스크린샷 비교 시 동적 요소 무시 안 함 | `stylePath`로 동적 요소 숨기기 |
