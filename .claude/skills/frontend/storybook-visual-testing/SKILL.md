---
name: storybook-visual-testing
description: Storybook 10 + @storybook/test-runner + Playwright toHaveScreenshot로 자체 호스팅(외부 SaaS 의존 없는) 시각 회귀 테스트 셋업 — preVisit/postVisit 훅, axe a11y 자동 검증, baseline 운영 정책, 모노레포 멀티 Storybook
---

# Storybook Visual Testing — 자체 호스팅 시각 회귀

> 소스: https://storybook.js.org/docs/releases/migration-guide | https://github.com/storybookjs/test-runner | https://playwright.dev/docs/test-snapshots
> 검증일: 2026-04-29
> 대상 버전: Storybook 10.3.x · @storybook/test-runner 0.x · Playwright v1.59.x

---

## 언제 사용하는가

- Storybook으로 문서화된 컴포넌트들을 **외부 SaaS(Chromatic·Percy) 없이** 자체 CI에서 시각 회귀로 잠그고 싶을 때
- 디자인 시스템·UI 라이브러리에서 컴포넌트 단위 픽셀 회귀를 PR마다 검증할 때
- 보안·비용 이슈로 스크린샷을 외부 서비스에 업로드할 수 없을 때
- 모노레포에서 여러 Storybook(예: MUI 기반 / Radix 기반)을 동시에 시각 검증할 때

## 언제 사용하지 않는가

- 페이지 단위 사용자 흐름 검증 → `frontend/e2e-testing` 스킬 (Playwright E2E)
- Storybook 8.x 기본 설치·CSF 작성 → `frontend/storybook` 스킬
- 크로스 브라우저 픽셀 회귀가 핵심 가치인 대규모 디자인 시스템 → Chromatic 같은 SaaS가 운영 비용 대비 효율적
- CI 인프라(셀프호스팅 러너 또는 Docker 이미지) 없이 macOS/Windows 로컬에서 baseline을 만들어 운영 → 픽셀 차이로 깨짐

---

## 1. Storybook 10 핵심 변화

자체 호스팅 시각 회귀 셋업은 Storybook 10 기준으로 작성한다. 9.x 이하와는 ESM 요구사항·Node 버전이 다르다.

### Node.js 요구사항 (강제)

| 항목 | 요구 버전 |
|------|-----------|
| Node.js | **20.19+ 또는 22.12+** |
| 이유 | `require(esm)` 기본 지원 (플래그 없이) |

> 주의: 공식 마이그레이션 가이드 기준 **20.19+ 또는 22.12+**다. 일부 블로그·커뮤니티 글에서 "20.16+ / 22.19+"로 적힌 경우가 있는데, Storybook 공식 docs(`storybook.js.org/docs/releases/migration-guide`) 기준은 20.19+/22.12+가 정확하다. CI 이미지(Docker, GitHub Actions)도 이 버전 이상으로 강제해야 한다.

```yaml
# .github/workflows/visual-test.yml
- uses: actions/setup-node@v4
  with:
    node-version: '22.12'   # Storybook 10 호환 최소
```

### ESM-only 패키징

Storybook 10부터 패키지가 ESM 전용으로 배포된다. 결과:

- `.storybook/main.{js,ts}`, `preview.{js,ts}`는 **유효한 ESM이어야 한다** (CommonJS `module.exports = {}` 사용 금지, `export default {}` 사용)
- 프로젝트 `package.json`에 `"type": "module"`이 없는 CommonJS 프로젝트라도 `.storybook/main.ts` 자체는 ESM 문법을 사용
- 설치 크기 약 29% 감소, dist 코드 비-minify로 디버깅 용이

```typescript
// .storybook/main.ts (Storybook 10 — ESM)
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|mdx)'],
  framework: '@storybook/react-vite',
  addons: ['@storybook/addon-essentials'],
};

export default config;
```

### Storybook 9 → 10 차이 요약

| 항목 | Storybook 9 | Storybook 10 |
|------|-------------|--------------|
| Node 요구 | 18+ / 20+ | **20.19+ / 22.12+** |
| 패키지 형식 | CJS + ESM 듀얼 | **ESM only** |
| main/preview | CJS·ESM 모두 가능 | **ESM 필수** |
| a11y addon | 별도 설치 가능 | 내장 a11y 지원 |
| 자동 마이그레이션 | — | `npx storybook@latest upgrade` |

> 주의: Storybook 10.3에는 `MCP` for React, Vite 8 / Next.js 16.2 지원 등이 추가됐지만 시각 테스트 셋업에는 직접 영향 없음.

---

## 2. @storybook/test-runner 설치·설정

`@storybook/test-runner`는 **Jest를 러너로, Playwright를 브라우저 자동화 엔진으로** 쓰는 도구다. 각 `*.stories.tsx` 파일을 spec으로 변환해 헤드리스 브라우저에서 실행한다.

> 주의: Vite 기반 Storybook의 경우 공식 문서가 **Vitest addon** 사용을 권장하기 시작했다. 하지만 Playwright 기반 시각 회귀(픽셀 비교) 워크플로는 여전히 `@storybook/test-runner` + Playwright의 `toHaveScreenshot`이 가장 표준적이다. 본 스킬은 이 조합을 다룬다.

### 설치

```bash
npm install -D @storybook/test-runner @playwright/test
npx playwright install --with-deps chromium   # Linux baseline 일관성을 위해 chromium만 강제
```

### package.json 스크립트

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "test-storybook": "test-storybook",
    "test-storybook:ci": "concurrently -k -s first -n SB,TEST \"npm:storybook -- --ci\" \"wait-on tcp:6006 && test-storybook --url http://127.0.0.1:6006\"",
    "test-storybook:static": "concurrently -k -s first -n SB,TEST \"npx http-server storybook-static --port 6006 --silent\" \"wait-on tcp:6006 && test-storybook --url http://127.0.0.1:6006\""
  }
}
```

| 스크립트 | 용도 |
|---------|------|
| `test-storybook` | 로컬 `storybook dev` 실행 중에 사용 |
| `test-storybook:ci` | dev 서버를 직접 띄워 함께 실행 (개발용) |
| `test-storybook:static` | **CI 권장** — `build-storybook` 후 정적 서빙으로 가장 빠르고 결정적 |

### test-runner.ts 설정 (`.storybook/test-runner.ts`)

```typescript
import type { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  // 1. 모든 테스트 시작 전 1회 실행
  async setup() {
    // jest matcher 확장, env 설정 등
  },

  // 2. 각 스토리 렌더링 직전 (Playwright Page 접근)
  async preVisit(page, context) {
    // page.setViewportSize(), 폰트 로딩 대기 등
  },

  // 3. 각 스토리 렌더링 직후 (검증·스크린샷)
  async postVisit(page, context) {
    // page.screenshot(), a11y 검사 등
  },
};

export default config;
```

> 주의: `preRender` / `postRender` 훅은 **deprecated**다. 신규 코드는 `preVisit` / `postVisit`만 사용한다.

훅 시그니처:

```typescript
// page: Playwright Page 객체 (전체 API 사용 가능)
// context: { id: string; title: string; name: string }
async preVisit(page: Page, context: { id; title; name }): Promise<void>
async postVisit(page: Page, context: { id; title; name }): Promise<void>
```

---

## 3. axe-playwright로 a11y 자동 검증

`postVisit`에 axe를 끼워 넣으면 **모든 스토리 렌더링 직후 자동으로 접근성 검사**가 돌아간다. 시각 회귀와 같은 파이프라인에서 a11y까지 한 번에 잡을 수 있다.

```bash
npm install -D axe-playwright
```

```typescript
// .storybook/test-runner.ts
import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { injectAxe, checkA11y, configureAxe } from 'axe-playwright';

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);

    // 스토리 parameters에서 a11y.disable: true면 스킵
    if (storyContext.parameters?.a11y?.disable) return;

    await configureAxe(page, {
      rules: storyContext.parameters?.a11y?.config?.rules,
    });

    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: storyContext.parameters?.a11y?.options,
    });
  },
};

export default config;
```

> Storybook 9 이상은 a11y 지원이 내장되어 있지만, **CI 파이프라인에서 a11y를 빌드 게이팅으로 강제**하려면 여전히 `axe-playwright` + `postVisit` 조합이 가장 명시적이다.

---

## 4. Playwright toHaveScreenshot로 베이스라인 캡처

Storybook은 `iframe.html?id={story-id}&viewMode=story`로 단일 스토리를 격리 렌더링한다. 이 페이지를 Playwright로 찍어 baseline 비교한다.

### 패턴 A: test-runner의 postVisit에서 직접 스크린샷

```typescript
// .storybook/test-runner.ts
import type { TestRunnerConfig } from '@storybook/test-runner';
import { waitForPageReady } from '@storybook/test-runner';
import { expect } from '@playwright/test';

const config: TestRunnerConfig = {
  async postVisit(page, context) {
    // 폰트·이미지·애니메이션 안정화
    await waitForPageReady(page);

    // Storybook root 영역만 캡처 (사이드바·툴바 제외)
    const root = page.locator('#storybook-root');

    await expect(root).toHaveScreenshot(`${context.id}.png`, {
      animations: 'disabled',          // CSS 애니메이션 비활성
      maxDiffPixelRatio: 0.01,         // 1% 픽셀 변동까지 허용
    });
  },
};

export default config;
```

### 패턴 B: 별도 Playwright 프로젝트에서 iframe.html 직접 방문

복잡한 시나리오(다중 뷰포트, 다중 테마)는 Playwright 테스트 파일로 빼는 게 깔끔하다.

```typescript
// e2e/visual/components.spec.ts
import { test, expect } from '@playwright/test';
import storyIndex from '../../storybook-static/index.json';

const stories = Object.values(storyIndex.entries).filter(
  (e: any) => e.type === 'story'
);

for (const story of stories) {
  test(`visual: ${story.title} - ${story.name}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      `${story.id}.png`,
      { animations: 'disabled' }
    );
  });
}
```

### toHaveScreenshot 핵심 옵션

| 옵션 | 의미 | 권장값 |
|------|------|--------|
| `animations` | `'disabled'` 시 CSS 애니메이션·트랜지션 정지 | `'disabled'` |
| `mask` | Locator 배열, 해당 영역을 핑크색으로 덮음 (시간/광고 등 동적 영역) | 동적 영역만 |
| `stylePath` | 스크린샷용 CSS 주입(Shadow DOM 관통) | 동적 요소 숨김 |
| `threshold` | YIQ 색공간 차이 허용치(0=엄격, 1=느슨) | 0.2 (기본) |
| `maxDiffPixels` | 절대 허용 픽셀 수 | 작은 컴포넌트 100~500 |
| `maxDiffPixelRatio` | 전체 대비 허용 비율(0~1) | 0.01 (1%) |
| `fullPage` | 페이지 전체 캡처 | 컴포넌트 범위면 false |
| `clip` | 캡처할 직사각형 영역 | 일부만 비교할 때 |

> `maxDiffPixels`와 `maxDiffPixelRatio`는 함께 쓰면 **둘 중 하나만 만족해도 통과**한다(OR). 보수적으로 가려면 한쪽만 사용.

### 풀페이지 vs 컴포넌트 영역

```typescript
// 컴포넌트 영역만 (권장 — 외곽 변동 영향 차단)
await expect(page.locator('#storybook-root')).toHaveScreenshot();

// 페이지 전체 (Storybook iframe 자체이므로 거의 동일하지만 스크롤 영역 포함)
await expect(page).toHaveScreenshot({ fullPage: true });
```

### 동적 영역 마스킹

```typescript
await expect(page.locator('#storybook-root')).toHaveScreenshot('card.png', {
  mask: [
    page.getByTestId('current-time'),
    page.getByTestId('user-avatar-id'),  // 랜덤 시드 기반
  ],
});
```

또는 `stylePath`로 CSS 주입:

```css
/* e2e/visual/screenshot.css */
[data-testid="current-time"],
[data-testid="ad-slot"] {
  visibility: hidden !important;
}

/* 깜빡이는 커서·스피너 정지 */
*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
}
```

---

## 5. Baseline 운영 정책

### 환경 일관성 — 가장 중요

Playwright는 baseline 파일명에 플랫폼이 자동 포함된다: `card-chromium-darwin.png`, `card-chromium-linux.png`. **다른 OS에서 만든 baseline은 호환되지 않는다.** 폰트 렌더링·서브픽셀 위치·안티앨리어싱이 OS별로 미묘하게 달라 1px 차이로 깨진다.

**규칙:**

1. **Baseline 생성·검증은 동일 환경에서**
   - 권장: GitHub Actions Linux 러너 또는 Playwright 공식 Docker 이미지
   - macOS 개발자 로컬에서 만든 PNG를 git에 commit하지 않는다
2. **Docker 이미지 강제 (선택지)**
   ```bash
   # 로컬에서 CI와 동일한 Linux baseline 생성
   docker run --rm -v $(pwd):/work -w /work \
     mcr.microsoft.com/playwright:v1.59.1-jammy \
     npx playwright test --update-snapshots
   ```
3. **Chromium만 사용** — Firefox/WebKit은 픽셀이 또 달라 baseline 3배가 됨. 컴포넌트 시각 회귀는 chromium 단일 채널로 충분

### Baseline 갱신 워크플로

```bash
# 의도된 UI 변경 후 baseline 갱신
npx playwright test --update-snapshots

# test-runner로 돌릴 경우
test-storybook -- --update-snapshots
```

**PR 룰:** baseline `.png` 변경은 **반드시 같은 PR에 코드 변경과 함께 commit**. 리뷰어가 코드 diff와 시각 diff를 함께 본다.

### Threshold 권장값

| 상황 | 권장 설정 |
|------|-----------|
| 디자인 시스템 컴포넌트 (엄격) | `maxDiffPixelRatio: 0.001` (0.1%) |
| 일반 UI 컴포넌트 | `maxDiffPixelRatio: 0.01` (1%) |
| 폰트·아이콘 변동이 잦음 | `maxDiffPixels: 500` + `threshold: 0.3` |
| Linux Docker 환경 동일 | 0~minimal threshold (가장 엄격) |

전역 설정은 `playwright.config.ts`:

```typescript
export default defineConfig({
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    },
  },
});
```

---

## 6. 모노레포 멀티 Storybook 구성

`apps/storybook-mui`, `apps/storybook-radix`처럼 Storybook 인스턴스가 여러 개일 때.

### 디렉터리 구조 예시

```
apps/
├── storybook-mui/
│   ├── .storybook/
│   │   ├── main.ts
│   │   └── test-runner.ts
│   ├── stories/
│   └── package.json
└── storybook-radix/
    ├── .storybook/
    │   ├── main.ts
    │   └── test-runner.ts
    ├── stories/
    └── package.json
e2e/
└── visual/
    ├── playwright.config.ts
    └── snapshots/
        ├── mui/
        └── radix/
```

### Turborepo로 병렬 실행

`turbo.json`:

```json
{
  "tasks": {
    "build-storybook": {
      "outputs": ["storybook-static/**"]
    },
    "test-storybook:visual": {
      "dependsOn": ["build-storybook"],
      "outputs": ["**/__snapshots__/**"],
      "inputs": ["**/*.stories.@(ts|tsx)", ".storybook/**"]
    }
  }
}
```

```bash
# 모든 Storybook을 병렬로 빌드 → 시각 회귀 실행
turbo run test-storybook:visual
```

### 포트·URL 분리

각 Storybook을 다른 포트에 띄워 동시에 검증:

```bash
# apps/storybook-mui/package.json
"test-storybook:static": "... http-server storybook-static --port 6006 ..."

# apps/storybook-radix/package.json
"test-storybook:static": "... http-server storybook-static --port 6007 ..."
```

### Snapshot 충돌 회피

각 Storybook 인스턴스마다 baseline 디렉터리를 **명시적으로 분리**한다:

```typescript
// apps/storybook-mui/.storybook/test-runner.ts
const config: TestRunnerConfig = {
  async postVisit(page, context) {
    await expect(page.locator('#storybook-root'))
      .toHaveScreenshot([`mui`, `${context.id}.png`]);  // mui/ 하위로 저장
  },
};
```

---

## 7. Anti-pattern (Baseline 흔들림 회피)

### 폰트 로딩 미대기

```typescript
// 나쁜 예 — 폰트가 fallback으로 잠깐 노출되는 순간 캡처될 수 있음
await page.goto('/iframe.html?id=button--primary');
await expect(page.locator('#storybook-root')).toHaveScreenshot();

// 좋은 예 — networkidle + waitForPageReady
await page.goto('/iframe.html?id=button--primary');
await page.waitForLoadState('networkidle');
await page.evaluate(() => document.fonts.ready);
await expect(page.locator('#storybook-root')).toHaveScreenshot();
```

### 애니메이션·트랜지션 미차단

```typescript
// 나쁜 예 — hover 트랜지션 중간에 캡처되면 매번 깨짐
await expect(locator).toHaveScreenshot();

// 좋은 예 — animations: 'disabled' 명시
await expect(locator).toHaveScreenshot({ animations: 'disabled' });
```

### 랜덤 데이터·현재 시각

```typescript
// 나쁜 예 — Date.now()를 컴포넌트가 그대로 표시
export const Story = { args: { createdAt: new Date() } };

// 좋은 예 — 고정값
export const Story = { args: { createdAt: new Date('2024-01-01T00:00:00Z') } };
```

랜덤 ID, `Math.random()`, `crypto.randomUUID()`도 동일하게 시드 고정 또는 mask 처리.

### OS 혼합 baseline

```bash
# 나쁜 예 — macOS 로컬에서 baseline 생성 후 CI(Linux)에서 비교
npm test -- --update-snapshots   # macOS
git add e2e/__snapshots__/
git push                          # CI에서 1px씩 깨짐

# 좋은 예 — Docker 또는 CI 러너에서 생성
docker run ... mcr.microsoft.com/playwright:v1.59.1-jammy ... --update-snapshots
```

### 너무 느슨한 threshold

```typescript
// 나쁜 예 — 회귀 탐지 못함
await expect(locator).toHaveScreenshot({ maxDiffPixelRatio: 0.5 });  // 50% 변동 허용?

// 좋은 예 — 1% 이내로 잡고, 폰트 영향 큰 컴포넌트만 별도 완화
await expect(locator).toHaveScreenshot({ maxDiffPixelRatio: 0.01 });
```

### viewport 변동

```typescript
// 나쁜 예 — Playwright 기본 viewport(1280x720)에 의존
// 좋은 예 — 명시적 고정
test.use({ viewport: { width: 1024, height: 768 } });
```

---

## 8. 외부 SaaS(Chromatic·Percy) vs 자체 호스팅 비교

### 비교 표

| 항목 | Chromatic | Percy | 자체 호스팅 (본 스킬) |
|------|-----------|-------|----------------------|
| 비용 | 무료 5,000 snapshot/월, 이후 $149/월부터 | 무료 5,000 snapshot/월, 병렬 추가비 | CI 분 비용만 |
| 크로스 브라우저 | Chrome, Firefox, Safari, Edge 자동 | Chrome, Firefox, Safari, Edge 자동 | Chromium 단일 권장 (직접 추가 가능하나 픽셀 관리 부담) |
| 외부 데이터 송신 | 스크린샷이 외부 서버에 저장됨 | 스크린샷이 외부 서버에 저장됨 | **저장소 내부에만 저장** |
| Diff UI | 풍부한 웹 리뷰 UI | 풍부한 웹 리뷰 UI | Playwright HTML 리포트 (기본) |
| TurboSnap (변경 스토리만) | 지원 | 부분 지원 | 직접 구현 필요 |
| 환경 일관성 | 자동 보장 | 자동 보장 | Docker/CI 러너로 직접 강제 |
| 셋업 난이도 | 낮음 (`npx chromatic`) | 낮음 | 중간 (이 스킬 내용 전부) |

### 자체 호스팅을 선택하는 이유

1. **보안·컴플라이언스** — 사내 미공개 UI, 금융·의료 컴포넌트를 외부 SaaS에 업로드 불가
2. **비용** — 컴포넌트 수가 많고 PR 빈도 높으면 SaaS 요금이 빠르게 올라감
3. **CI 통합** — 이미 GitHub Actions·Jenkins에 Playwright가 있으면 추가 인프라 없음
4. **소유권** — baseline이 git 저장소 내부에 있어 히스토리·리뷰 흐름 일관

### SaaS를 선택해야 할 신호

- 디자이너가 시각 diff를 직접 리뷰하는 워크플로 (전용 UI 필요)
- Chrome/Firefox/Safari 픽셀 회귀를 모두 잡아야 함 (자체 호스팅 시 baseline 관리 비용 폭증)
- 팀 규모 작고 인프라 운영 부담을 최소화하고 싶음

---

## 9. 흔한 실수 정리

| 실수 | 올바른 방법 |
|------|------------|
| Storybook 10에 Node 18 사용 | Node 20.19+ 또는 22.12+ 강제 |
| `.storybook/main.ts`를 CommonJS(`module.exports`)로 작성 | ESM (`export default`) 사용 |
| `preRender` / `postRender` 훅 사용 | `preVisit` / `postVisit` 사용 |
| macOS 로컬에서 만든 baseline을 CI(Linux)에서 비교 | Docker 또는 CI 러너에서 baseline 생성 |
| `animations` 옵션 미설정 | `animations: 'disabled'` 명시 |
| 폰트 로딩 안 기다리고 캡처 | `document.fonts.ready` await 또는 `waitForPageReady` 사용 |
| 로컬 dev 서버에서 시각 회귀 (HMR 영향) | `build-storybook` → 정적 서빙으로 결정적 환경 |
| Chromium·Firefox·WebKit 모두 baseline 보관 | 컴포넌트 회귀는 chromium 단일로 충분 |
| baseline 별도 PR로 commit | 코드 변경과 같은 PR에 함께 commit |
| `maxDiffPixelRatio: 0.5`로 느슨하게 설정 | 0.01(1%) 이내, 필요하면 케이스별 완화 |
