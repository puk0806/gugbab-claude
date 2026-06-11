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
