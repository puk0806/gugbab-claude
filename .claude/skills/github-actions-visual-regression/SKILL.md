---
name: github-actions-visual-regression
description: GitHub Actions 시각 회귀(Storybook + Playwright) 최신 변경점과 함정 - 액션 최신 메이저(checkout v7·upload v7·download v8·github-script v9), checkout v7 포크 PR 체크아웃 기본 차단(v2~v6 백포트), artifact 불변·이름 충돌, github-script v9 ESM·스크립트 주입 방지, test-runner 지원 종료(2026-09-30)와 index.json→Playwright 대안, Storybook 10 CI 요구, toHaveScreenshot·baseline 실측 함정
disable-model-invocation: true
---

# GitHub Actions 시각 회귀 워크플로우 패턴

> 소스:
> - https://docs.github.com/en/actions
> - https://github.com/storybookjs/test-runner#running-against-deployed-storybooks
> - https://storybook.js.org/docs/writing-tests/in-ci
> - https://github.com/actions/cache
> - https://github.com/actions/upload-artifact
> - https://github.com/actions/checkout
> - https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/
> - https://github.blog/changelog/2026-06-18-safer-pull_request_target-defaults-for-github-actions-checkout/
>
> - https://playwright.dev/docs/docker
> - https://storybook.js.org/docs/releases/migration-guide (5절 — 구 storybook-visual-testing 에서 옮김)
> - https://playwright.dev/docs/test-snapshots (5절)
> - https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/migration-guide (5절)
>
> 검증일: 2026-11-09 (최초 2026-04-29 · 재검증 08-11, 09-28, 11-09)

> 주의: 이 문서는 2026-11-09 기준 최신 메이저 버전으로 작성되었습니다.
> `actions/checkout@v7`(7.0.1, 2026-07-20), `actions/cache@v6`(6.1.0), `actions/upload-artifact@v7`(7.0.2),
> `actions/download-artifact@v8`(8.0.2), `actions/setup-node@v7`(7.1.0), `actions/github-script@v9`(9.0.0),
> `dorny/paths-filter@v4`(4.0.3), `pnpm/action-setup@v6`(6.1.1), `peter-evans/create-pull-request@v8`(8.1.1),
> `thollander/actions-comment-pull-request@v3`(3.0.1) 기준입니다. (11-09: GitHub Releases API 전수 재확인 — 메이저 변경 없음, setup-node 7.1.0·upload 7.0.2·download 8.0.2·pnpm 6.1.1 패치만 상승)

> **보안 필독 — actions/checkout v7 기본값 변경 (2026-06-18):** `pull_request_target` 및
> `workflow_run`(pull_request 계열 이벤트 트리거) 워크플로우에서 **포크 PR 코드 체크아웃이 기본 차단**됩니다.
> 2026-07-20부터 v2~v6 지원 메이저에도 백포트되어, `@v5` 같은 부동 태그를 쓰던 기존 시각 회귀 워크플로우도 그대로 영향을 받습니다.
> 시각 회귀는 `pull_request_target`을 쓰고 싶어지는 대표 사례라 특히 주의해야 합니다 — 1절 참조.

> **test-runner 지원 종료 (2026-09-30):** `test-storybook`(@storybook/test-runner)은 공식 지원이 끝났습니다. 기존 워크플로우는 계속 돌지만, 신규 구성은 5절의 "index.json → 순수 Playwright" 패턴으로 만들고 실행 단계의 `test-storybook` 자리에 `playwright test`를 넣으세요.

---

## 이 스킬의 범위

시각 회귀 CI에서 **2026년에 바뀐 액션·보안 기본값·Storybook/test-runner 상황과 실측 함정**만 다룬다. Storybook 기본 설치·스토리 작성은 `storybook` 스킬.

> 기본 사용법(paths/paths-filter 트리거, concurrency, 빌드 → artifact → matrix 테스트 → 결과 업로드 → PR 코멘트 잡 구성, start-server-and-test, 전체 YAML 예시)은 공식 문서 수준이라 싣지 않는다.

---

## 1. 트리거 보안 — `pull_request_target` 금지

> 주의: `pull_request_target` 트리거는 **사용 금지**. 포크 PR의 코드를 baseline으로 인정하면 시크릿 유출 + 임의 코드 실행으로 이어집니다("pwn requests" — base repo 컨텍스트라 시크릿·write 권한이 노출된 상태에서 포크의 `package.json` 스크립트가 실행됨).
>
> 2026-06-18 `actions/checkout@v7`부터는 이 실수가 **액션 차원에서 차단**됩니다 — `pull_request_target`·`workflow_run`(pull_request 계열)에서 포크 PR의 head/merge ref·SHA 또는 포크 `repository:`를 체크아웃하려 하면 액션이 실패합니다(예외 입력 `allow-unsafe-pr-checkout`, 기본 `false`). 2026-07-20 백포트로 v2~v6 부동 태그에도 적용되므로, 이 패턴을 쓰던 기존 시각 회귀 워크플로우는 **버전을 올리지 않아도 갑자기 실패**할 수 있습니다. 해결책은 `allow-unsafe-pr-checkout: true`를 켜는 것이 아니라, 시각 테스트는 시크릿이 전달되지 않는 `pull_request`에서 돌리고 결과 코멘트만 별도 신뢰 잡으로 분리하는 것입니다.

GitHub Security Lab 권고: 포크 PR에서 빌드/스크립트 실행이 필요하면 `pull_request`, write 권한이 꼭 필요하면 `workflow_run` + 격리된 unprivileged 빌드.

---

## 2. artifact·캐시·matrix 함정

- `actions/upload-artifact@v7`: v4 이후 artifact는 **불변(immutable)** 이라 여러 잡이 같은 이름으로 업로드할 수 없다. matrix와 함께 쓸 때는 이름에 `${{ matrix.app }}`를 포함해야 충돌 없음 (같은 이름을 굳이 갱신해야 하면 `overwrite: true`).
- v7에서 추가된 `archive: false`(단일 파일을 zip 없이 직접 업로드)는 Storybook 정적 빌드처럼 **디렉토리**를 올릴 때는 쓰지 않는다 — 기본값 `archive: true` 유지.
- `if-no-files-found` 기본은 `warn` — 빌드 결과물 업로드에는 `error`. `retention-days` 기본은 레포 설정값(보통 90일)이므로 시각 회귀 PNG는 7~14일로 명시.
- `actions/download-artifact@v8`: `digest-mismatch: error`가 기본(해시 불일치 시 실패), `skip-decompress: true`를 주지 않는 한 zip은 자동 해제.
- `actions/setup-node@v7`의 `cache: 'pnpm'` 내장 캐시로 별도 `actions/cache` 불필요. `pnpm/action-setup@v6`의 `version`은 `package.json`에 `packageManager`/`devEngines.packageManager`가 있으면 생략 가능.
- baseline 캐시 키는 `hashFiles(format('apps/{0}/__snapshots__/**', matrix.app))` + prefix-only `restore-keys`로 직전 baseline을 끌어온다.
- **matrix는 잡 레벨 `if`에서 matrix 컨텍스트를 못 본다**(잡 내부에서만 평가) → 변경된 앱만 돌리려면 `include`에 `run:` 값을 넣고 step마다 `if: matrix.run == 'true'` 가드가 표준 패턴. 앱이 5개 이상이면 동적 matrix(`outputs.matrix` JSON) 검토.
- `playwright install --with-deps chromium`만(전체 ~600MB·~90초 vs chromium ~200MB·~30초). GitHub-hosted runner에서는 `--maxWorkers=2` 수준(더 늘리면 OOM 위험).

---

## 3. PR 코멘트 — `actions/github-script@v9`

> 주의: v9는 `@actions/github` v9(ESM 전용)로 올라가면서 스크립트 안의 `require('@actions/github')`가 더 이상 동작하지 않습니다. 또 주입되는 `getOctokit` 인자를 `const`/`let`으로 재선언하면 `SyntaxError`가 납니다. v7/v8에서 올릴 때 이 두 가지만 확인하면 기존 코드는 그대로 동작합니다.

> 주의: `actions/github-script`는 v9(9.0.0)가 최신입니다. v8부터 스크립트가 Node 24에서 실행되며 Actions Runner 2.327.1 이상이 필요합니다(self-hosted 러너 확인 필요). `thollander/actions-comment-pull-request`는 v3.0.1이 여전히 최신입니다(`comment-tag`가 같으면 기존 코멘트 갱신).

**스크립트 주입 방지** — 이전 스텝 출력은 `env`로 넘긴다. `${{ }}`를 `script:` 안에 직접 넣으면 앱 이름·파일 이름의 백틱·`${}`가 JS 코드로 실행된다.

```yaml
- uses: actions/github-script@v9
  env:
    VRT_BODY: ${{ steps.body.outputs.body }}
  with:
    script: |
      const body = process.env.VRT_BODY ?? '';
      // 마커(<!-- vrt-comment -->)로 기존 코멘트를 찾아 updateComment, 없으면 createComment (스팸 방지)
```

---

## 4. baseline 운영

- baseline 갱신은 `workflow_dispatch` 전용 워크플로우 → `peter-evans/create-pull-request@v8`로 **별도 PR + 사람 리뷰**. main에 자동 커밋하면 regression이 baseline에 흡수되어 시각 회귀가 영구히 무력화된다.

> 주의: GitHub-hosted runner는 매번 새 VM이라 OS 폰트·렌더링이 일치합니다. 그러나 베이스라인을 **로컬(macOS) 환경에서 생성**하면 CI(Ubuntu)와 anti-aliasing 차이로 false positive가 무한 발생합니다(특히 한글 폰트·sub-pixel hinting). 반드시 **CI에서 생성한 baseline만 커밋**하세요.

- 호스팅 SaaS(Chromatic·Percy·Argos)를 이미 쓰거나, 인터랙션·접근성 회귀가 더 중요하면 self-managed 파이프라인은 과잉일 수 있다.

---

## 5. 러너·스냅샷 함정 — Storybook 10 · test-runner 지원 종료 · toHaveScreenshot

> 2026-11-11 구 `storybook-visual-testing` 스킬에서 옮긴 절. 기준: Storybook 10.6.x(최신 안정 10.6.6, 11은 베타) · @storybook/test-runner 0.26.0(마지막) · Playwright v1.65.x. 원 검증일 2026-11-09.

### 5-1. @storybook/test-runner 공식 지원 종료

- 저장소가 **2026-09-30 보관(archived)** 처리됐고, 마지막 0.26.0은 실행할 때마다 지원 종료 경고를 출력하며 수정·호환성 업데이트를 받지 않는다. 기존 설정은 "사용자 책임"으로 계속 쓸 수 있다(공식 MIGRATION.md "Test runner support ended").
- 0.26.0의 `peerDependencies`는 `storybook ^10.x`·`^11.0.0-0`·`>=11`까지 받아 **설치는 막히지 않는다** — 막히지 않는다고 지원되는 것은 아니다.
- **신규 구성 기본값 = 스토리 `index.json` → 순수 Playwright 테스트**(공식 MIGRATION.md가 제시하는 대안, test-runner 의존 없음):

```typescript
// e2e/visual/components.spec.ts — build-storybook 결과물을 정적 서빙한 뒤 실행
import { test, expect } from '@playwright/test';
import storyIndex from '../../storybook-static/index.json';

const stories = Object.values(storyIndex.entries).filter((e: any) => e.type === 'story');

for (const story of stories) {
  test(`visual: ${story.title} - ${story.name}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);   // 폰트 fallback 순간 캡처 방지
    await expect(page.locator('#storybook-root')).toHaveScreenshot(`${story.id}.png`, {
      animations: 'disabled',
    });
  });
}
```

- Vite 기반이면 공식 권장 경로는 Vitest 애드온 이전이지만, Vitest 애드온의 "visual tests"는 **Chromatic 연동**이다. 외부 SaaS 없이 픽셀 비교가 목적이면 위 패턴이 맞다.
- 이미 test-runner를 쓰는 프로젝트를 유지보수한다면: `preRender`/`postRender` 훅은 deprecated → `preVisit`/`postVisit`만 쓴다. CI에서 a11y를 빌드 게이트로 강제하려면 `postVisit`에서 `axe-playwright`의 `injectAxe`/`checkA11y`를 부른다(`@storybook/addon-a11y`는 패널 표시만 한다). 갱신은 `test-storybook -u`.

### 5-2. Storybook 10 이 CI 이미지에 요구하는 것

| 항목 | 요구 | 함정 |
|------|------|------|
| Node.js | **20.19+ 또는 22.12+** (`require(esm)` 플래그 없이 필요) | 일부 글의 "20.16+ / 22.19+"는 틀림(공식 마이그레이션 가이드 기준 20.19+/22.12+). CI·Docker 이미지도 이 버전 이상으로 맞춘다 |
| `.storybook/main`·`preview` | **ESM 필수**(`export default`) | 프로젝트가 CJS여도 이 두 파일은 ESM 문법 |
| `addons` 배열 | `@storybook/addon-essentials`·`addon-interactions` **제거** | v9에서 코어에 내장됨 — 남겨 두면 시작 시 에러로 빌드 잡이 실패 |
| 업그레이드 | `npx storybook@latest upgrade` | 10.4~10.6 추가분(Vite 8·Next.js 16.2 지원 등)은 시각 테스트 셋업에 영향 없음 |

### 5-3. toHaveScreenshot·baseline 실측 함정

- **baseline 파일명에 플랫폼이 붙는다**(`card-chromium-linux.png` / `card-chromium-darwin.png`) — macOS에서 만든 baseline은 Linux 러너에서 "없는 baseline"이거나 1px 차이로 깨진다(4절 주의와 같은 원인).
- 로컬에서 CI와 같은 baseline을 만들 때 Docker 이미지 태그는 **프로젝트의 `@playwright/test` 버전과 같게 고정**한다(공식 Docker 문서). 베이스는 `-noble`(Ubuntu 24.04, `ubuntu-latest`와 일치, 태그 생략 시 기본)·`-jammy`(22.04, 러너를 `ubuntu-22.04`로 고정했을 때만)·`-resolute`(26.04)가 제공된다(2026-11-09 MCR 태그 확인).

```bash
docker run --rm -v $(pwd):/work -w /work \
  mcr.microsoft.com/playwright:v1.65.0-noble \
  npx playwright test --update-snapshots
```

- `maxDiffPixels`와 `maxDiffPixelRatio`를 함께 쓰면 **둘 중 하나만 만족해도 통과(OR)** 한다 — 의도보다 느슨해진다. 한쪽만 쓴다.
- 모노레포에서 Storybook이 여러 개면 baseline 경로를 인스턴스별로 분리한다: `toHaveScreenshot(['mui', `${id}.png`])` — 같은 story id가 겹쳐도 덮어쓰지 않는다.
- 브라우저는 chromium 하나로 고정(Firefox/WebKit까지 쓰면 baseline이 3배가 되고 각자 픽셀이 다르다).
