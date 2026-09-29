---
name: e2e-testing
description: Playwright E2E 테스트 — 설치, 설정, 로케이터, POM, 네트워크 모킹, 인증, 비주얼 회귀, CI, 디버깅 전략
---

# E2E Testing — Playwright

> 소스: https://playwright.dev/docs/intro | https://playwright.dev/docs/best-practices
> 검증일: 2026-09-28 (최초 2026-04-20 · 08-26 freshness 재검증 · 09-28 재검증: 로케이터 우선순위·`page.route`·`defineConfig`·fixture 확장 전부 현행. "적대적 E2E 시나리오" 절(§7) 신설)
> 대상 버전: Playwright v1.63.x (최신 안정, 2026-09 기준 — v1.63부터 Ubuntu 20.04 미지원)

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

## 7. 적대적 E2E 시나리오 (보안·이상 경로)

레포 규칙(`.claude/rules/adversarial-testing.md`)의 E2E 계층 — 정상 흐름(happy path)만 통과하는 E2E 스위트는 이 레포 기준 미완성이다. 인증·인가, 입력 인젝션, 비즈니스 로직 오남용 표면이 있으면 아래처럼 방어 테스트를 반드시 포함한다. Playwright는 `storageState` 조작과 `request` 컨텍스트(API 직접 호출)로 이런 시나리오를 재현할 수 있다.

### 비로그인 상태로 보호 페이지·API 접근 → 로그인 리다이렉트/401

```typescript
test.describe('인증 없이 보호 리소스 접근', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // 인증 상태 완전 제거

  test('비로그인 유저는 대시보드 접근 시 로그인 페이지로 리다이렉트된다', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
  });

  test('보호 API를 토큰 없이 직접 호출하면 401을 반환한다', async ({ request }) => {
    const response = await request.get('/api/orders/me');
    expect(response.status()).toBe(401);
  });
});
```

### IDOR — 다른 유저 리소스 접근 시도 → 403

```typescript
// e2e/tests/idor.spec.ts
import { test, expect } from '../fixtures';

test.describe('IDOR — 다른 유저 주문 조회', () => {
  test.use({ storageState: 'playwright/.auth/user.json' }); // 일반 유저(A)로 로그인된 상태

  test('유저 A가 유저 B 소유 주문 ID로 API를 직접 호출하면 403', async ({ request }) => {
    const otherUsersOrderId = 'order-belongs-to-user-b';
    const response = await request.get(`/api/orders/${otherUsersOrderId}`);
    expect(response.status()).toBe(403);
  });

  test('URL의 orderId를 타 유저 값으로 조작해도 화면에서 접근이 거부된다', async ({ page }) => {
    await page.goto('/orders/order-belongs-to-user-b');
    await expect(page.getByText('접근 권한이 없습니다')).toBeVisible();
    await expect(page.getByText('결제 금액')).not.toBeVisible(); // 타인 데이터 미노출 확인
  });
});
```

### 단계 건너뛰기 — 결제 없이 완료 페이지 직접 접근

```typescript
test('결제 단계를 건너뛰고 완료 페이지 URL로 직접 이동하면 결제 페이지로 되돌아간다', async ({ page }) => {
  // 주문서 작성까지만 진행 — 결제(POST /api/payments)는 호출하지 않음
  await page.goto('/checkout/step-1');
  await page.getByLabel('배송지').fill('서울시 강남구');
  await page.getByRole('button', { name: '다음' }).click();

  // 결제를 건너뛰고 완료 페이지 URL을 직접 입력
  await page.goto('/checkout/complete?orderId=temp-order-id');

  // 서버가 결제 완료 상태를 재검증 → 완료 화면 대신 결제 페이지로 리다이렉트
  await expect(page).toHaveURL(/\/checkout\/payment/);
  await expect(page.getByText('결제가 완료되지 않았습니다')).toBeVisible();
});
```

### XSS 입력 — 스크립트 페이로드 이스케이프 확인

```typescript
test('닉네임 입력에 <script> 페이로드를 넣어도 실행되지 않고 텍스트로 렌더링된다', async ({ page }) => {
  const xssPayload = '<script>window.__xss = true;</script><img src=x onerror="window.__xss2=true">';

  await page.goto('/profile/edit');
  await page.getByLabel('닉네임').fill(xssPayload);
  await page.getByRole('button', { name: '저장' }).click();

  // 페이로드가 텍스트로 이스케이프되어 화면에 그대로 보임 (실행되지 않음)
  await expect(page.getByText(xssPayload, { exact: false })).toBeVisible();

  // 스크립트가 실제로 실행되지 않았는지 전역 오염 여부로 확인
  const executed = await page.evaluate(() => (window as any).__xss || (window as any).__xss2);
  expect(executed).toBeFalsy();
});
```

> 위 4가지는 `.claude/rules/adversarial-testing.md`의 "인증·인가"·"입력 인젝션"·"비즈니스 로직 오남용" 체크리스트에 대응한다. `storageState: { cookies: [], origins: [] }`는 Playwright 공식 `StorageState` 타입(빈 배열)으로 인증 상태를 완전히 제거하는 표준 패턴이다.

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
