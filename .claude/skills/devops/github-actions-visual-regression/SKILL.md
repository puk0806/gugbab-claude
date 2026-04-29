---
name: github-actions-visual-regression
description: GitHub Actions에서 Storybook + Playwright 시각 회귀를 자동 실행하고 PR에 결과(깨진 컴포넌트·diff PNG)를 시각화하는 workflow 패턴 - 트리거, 빌드 artifact 전달, baseline 캐시, 결과 업로드, PR 코멘트, 모노레포 matrix
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
>
> 검증일: 2026-04-29

> 주의: 이 문서는 2026-04 기준으로 작성되었습니다. actions/checkout@v5, actions/cache@v4, actions/upload-artifact@v4, actions/github-script@v7, dorny/paths-filter@v3, thollander/actions-comment-pull-request@v3 기준이며, 각 액션의 v6/v5/v4 신규 메이저는 출시되었으나 본 문서는 v5/v4 LTS 라인을 기준으로 합니다 (프로젝트의 다른 워크플로우와 버전 일치).

> 주의: 본 스킬은 시각 회귀 **CI 파이프라인 구성**에만 집중합니다. Playwright `toHaveScreenshot` 사용법, Storybook test-runner 설정 자체는 `frontend/storybook-visual-testing` 스킬을, 일반 CI 패턴은 `devops/github-actions` 스킬을 참조하세요.

---

## 1. 시각 회귀 워크플로우의 전체 구조

시각 회귀(Visual Regression) CI는 일반 단위 테스트와 다음이 다릅니다:

| 항목 | 일반 단위 테스트 | 시각 회귀 |
|------|-------------------|-----------|
| 결과물 | pass/fail 텍스트 | 깨진 컴포넌트의 diff PNG |
| 환경 민감도 | 낮음 | OS·폰트·anti-aliasing에 매우 민감 |
| baseline | 없음 | 스크린샷 baseline 필수 |
| 진단 | 로그로 충분 | PR에 이미지 첨부 + 다운로드 링크 필요 |
| 빌드 단계 | test 단독 | Storybook 빌드 → 정적 서빙 → 테스트 |

따라서 워크플로우는 **빌드 → baseline 복원 → 시각 테스트 → 결과 업로드 → PR 코멘트** 순서로 구성합니다.

```
┌────────────────────────────────────────────────────────────┐
│  pull_request (paths-filter)                                │
└─────────────────────┬──────────────────────────────────────┘
                      ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  build-sb    │───▶│  vrt (matrix)│───▶│ comment-pr   │
│  (artifact)  │    │  (baseline   │    │ (artifact    │
│              │    │   캐시)      │    │  링크 코멘트)│
└──────────────┘    └──────────────┘    └──────────────┘
                          │
                          ▼
                    test-results/
                    (PNG·HTML, 14일 보관)
```

---

## 2. 트리거: paths-filter로 시각 영향 경로만 실행

시각 회귀는 비싸므로(보통 5~15분 소요) **시각에 영향이 있는 파일이 변경됐을 때만** 실행합니다.

### 워크플로우 레벨 paths

```yaml
name: visual-regression

on:
  pull_request:
    branches: [main]
    paths:
      - 'apps/storybook-mui/**'
      - 'apps/storybook-radix/**'
      - 'packages/ui/**'
      - 'packages/tokens/**'
      - 'pnpm-lock.yaml'
      - '.github/workflows/visual-regression.yml'
  push:
    branches: [main]
    paths:
      - 'apps/storybook-mui/**'
      - 'apps/storybook-radix/**'
      - 'packages/ui/**'
      - 'packages/tokens/**'

permissions:
  contents: read
  pull-requests: write   # PR 코멘트용
  actions: read          # artifact 메타 조회용

concurrency:
  group: vrt-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**주의:**
- `concurrency`로 같은 PR의 중복 실행을 취소해 비용·러너 시간 절약
- `permissions`는 최소 권한 원칙 — 코멘트 쓰기에는 `pull-requests: write`만 필요
- `pnpm-lock.yaml` 변경도 트리거 대상 (의존성 변경이 시각에 영향)

### 잡 레벨 세분화 (모노레포에서 한쪽만 변경됐을 때)

```yaml
jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      mui: ${{ steps.filter.outputs.mui }}
      radix: ${{ steps.filter.outputs.radix }}
    steps:
      - uses: actions/checkout@v5
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            mui:
              - 'apps/storybook-mui/**'
              - 'packages/ui/**'
              - 'packages/tokens/**'
            radix:
              - 'apps/storybook-radix/**'
              - 'packages/ui/**'
              - 'packages/tokens/**'
```

> 주의: `pull_request_target` 트리거는 **사용 금지**. 포크 PR의 코드를 baseline으로 인정하면 시크릿 유출 + 임의 코드 실행으로 이어집니다 (자세한 내용은 섹션 8).

---

## 3. Storybook 빌드 + 정적 호스팅 (artifact로 다음 잡에 전달)

빌드는 한 번만 수행하고, 시각 테스트 잡은 빌드 결과물을 다운받아 정적 서빙합니다. 빌드와 테스트를 분리하면:
- matrix로 여러 브라우저·shard에서 테스트할 때 빌드를 중복하지 않음
- 빌드 실패 시 테스트 잡을 띄우지 않아 비용 절감

```yaml
  build-storybook:
    needs: changes
    if: needs.changes.outputs.mui == 'true' || needs.changes.outputs.radix == 'true'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app:
          - storybook-mui
          - storybook-radix
        # changes 결과로 동적 매트릭스를 만드는 것은 복잡하므로
        # 빌드는 양쪽 모두 수행하고, 시각 테스트만 변경된 쪽에서 돌립니다.
    steps:
      - uses: actions/checkout@v5

      - name: Use Node 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - run: pnpm install --frozen-lockfile

      - name: Build Storybook
        run: pnpm --filter ${{ matrix.app }} build:storybook

      - name: Upload storybook-static artifact
        uses: actions/upload-artifact@v4
        with:
          name: storybook-static-${{ matrix.app }}
          path: apps/${{ matrix.app }}/storybook-static
          retention-days: 7
          if-no-files-found: error
```

**핵심 포인트:**
- `actions/upload-artifact@v4`: v4부터 동일 이름의 artifact 덮어쓰기 불가. matrix와 함께 쓸 때는 이름에 `${{ matrix.app }}`를 포함해야 충돌 없음
- `if-no-files-found: error`: 빌드 결과물이 비었으면 즉시 실패 (default는 `warn`)
- `retention-days`: 1~90 사이. 시각 회귀 결과물은 PR이 머지되기 전까지만 필요하므로 7일 권장
- `cache: 'pnpm'`은 `actions/setup-node@v4`의 내장 캐시를 활용 (별도 `actions/cache` 불필요)

---

## 4. test-runner 실행: matrix 병렬 + start-server-and-test

### Storybook 두 개를 병렬 실행

```yaml
  visual-regression:
    needs: [changes, build-storybook]
    if: |
      always() &&
      needs.build-storybook.result == 'success' &&
      (needs.changes.outputs.mui == 'true' || needs.changes.outputs.radix == 'true')
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false   # 한 쪽 실패해도 나머지 결과를 끝까지 확인
      matrix:
        include:
          - app: storybook-mui
            run: ${{ needs.changes.outputs.mui == 'true' }}
          - app: storybook-radix
            run: ${{ needs.changes.outputs.radix == 'true' }}
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Skip if no changes
        if: matrix.run != 'true'
        run: echo "No changes for ${{ matrix.app }}, skipping" && exit 0

      - if: matrix.run == 'true'
        run: pnpm install --frozen-lockfile

      - name: Download storybook-static
        if: matrix.run == 'true'
        uses: actions/download-artifact@v4
        with:
          name: storybook-static-${{ matrix.app }}
          path: apps/${{ matrix.app }}/storybook-static

      - name: Restore visual baseline cache
        if: matrix.run == 'true'
        uses: actions/cache@v4
        with:
          path: apps/${{ matrix.app }}/__snapshots__
          key: vrt-baseline-${{ matrix.app }}-${{ runner.os }}-${{ hashFiles(format('apps/{0}/__snapshots__/**', matrix.app)) }}
          restore-keys: |
            vrt-baseline-${{ matrix.app }}-${{ runner.os }}-

      - name: Install Playwright (chromium only)
        if: matrix.run == 'true'
        run: pnpm exec playwright install --with-deps chromium

      - name: Run visual regression
        if: matrix.run == 'true'
        run: |
          pnpm --filter ${{ matrix.app }} exec start-server-and-test \
            "http-server storybook-static --port 6006 --silent" \
            http://127.0.0.1:6006 \
            "test-storybook --maxWorkers=2"

      - name: Upload test-results on failure
        if: failure() && matrix.run == 'true'
        uses: actions/upload-artifact@v4
        with:
          name: vrt-results-${{ matrix.app }}
          path: |
            apps/${{ matrix.app }}/test-results/
            apps/${{ matrix.app }}/playwright-report/
          retention-days: 14
          if-no-files-found: warn
```

**핵심 포인트:**
- `playwright install --with-deps chromium`: chromium만 설치 (전체 설치 대비 ~3배 빠름). 시각 회귀는 단일 브라우저만으로도 충분한 경우가 많음
- `start-server-and-test`: 정적 서버 기동 → URL ready 대기 → 테스트 실행 → 종료를 한 번에 처리. `wait-on + concurrently` 조합과 동일한 결과지만 더 단순
- `--maxWorkers=2`: GitHub-hosted runner의 기본 vCPU(2~4)에 맞춤. 더 늘리면 OOM 위험
- `if: failure()`로 **실패 시에만** 업로드 → 성공 시 artifact 비용 절감
- baseline 캐시 키에 `hashFiles(...)`를 쓰면 baseline이 바뀌었을 때 자동으로 새 키 생성. `restore-keys`의 prefix-only fallback이 항상 직전 baseline을 끌어옴

---

## 5. baseline 캐시: 갱신은 별도 PR로 분리

### 캐시 전략

| 시나리오 | 동작 |
|---------|------|
| PR에서 시각 변화 없음 | baseline 캐시 hit → 빠른 통과 |
| PR에서 의도하지 않은 변화 | baseline mismatch → 실패 (정상) |
| PR에서 의도한 디자인 변경 | 별도 "baseline 업데이트" PR로 처리 |

### baseline 업데이트 전용 워크플로우

```yaml
name: vrt-update-baseline

on:
  workflow_dispatch:
    inputs:
      app:
        description: 'Target storybook app'
        required: true
        type: choice
        options:
          - storybook-mui
          - storybook-radix

permissions:
  contents: write          # 새 baseline 커밋용
  pull-requests: write

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          ref: ${{ github.head_ref || github.ref_name }}

      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - run: pnpm install --frozen-lockfile

      - run: pnpm --filter ${{ inputs.app }} build:storybook
      - run: pnpm exec playwright install --with-deps chromium

      - name: Update baseline
        run: |
          pnpm --filter ${{ inputs.app }} exec start-server-and-test \
            "http-server storybook-static --port 6006 --silent" \
            http://127.0.0.1:6006 \
            "test-storybook -u"

      - name: Create PR with new baselines
        uses: peter-evans/create-pull-request@v7
        with:
          title: "chore(vrt): update baseline for ${{ inputs.app }}"
          branch: vrt/baseline-${{ inputs.app }}
          commit-message: "chore(vrt): update baseline"
          add-paths: apps/${{ inputs.app }}/__snapshots__/**
```

**왜 PR로 분리하는가:**
- baseline 변경은 시각 디자인 변경과 동일한 무게 — 코드 리뷰 대상
- 자동 갱신을 main에 직접 푸시하면 **regression이 baseline에 흡수되어 영원히 못 잡음**
- workflow_dispatch로 명시적으로만 갱신 (자동 트리거 금지)

> 주의: GitHub-hosted runner는 매번 새 VM이라 OS 폰트·렌더링이 일치합니다. 그러나 베이스라인을 **로컬(macOS) 환경에서 생성**하면 CI(Ubuntu)와 anti-aliasing 차이로 false positive가 무한 발생합니다. 반드시 **CI에서 생성한 baseline만 커밋**하세요.

---

## 6. 결과 업로드 + PR 코멘트 자동화

### 깨진 컴포넌트 목록 추출

`test-storybook`이 실패하면 `playwright-report/index.html`과 `test-results/<test>/test-failed-1.png`가 생성됩니다. 깨진 컴포넌트 목록은 Playwright의 JSON reporter로 추출합니다.

```yaml
      - name: Run visual regression
        if: matrix.run == 'true'
        run: |
          pnpm --filter ${{ matrix.app }} exec start-server-and-test \
            "http-server storybook-static --port 6006 --silent" \
            http://127.0.0.1:6006 \
            "test-storybook --maxWorkers=2"
        env:
          # test-runner의 jest config에서 json-reporter를 활성화하거나
          # PLAYWRIGHT_JSON_OUTPUT_NAME 등으로 결과를 파일로 떨굼
          STORYBOOK_TEST_REPORT_PATH: vrt-report.json
```

### actions/github-script로 코멘트

`actions/github-script@v7`은 octokit이 사전 주입돼 별도 의존성 없이 PR 코멘트를 작성할 수 있습니다.

```yaml
  comment-pr:
    needs: visual-regression
    if: always() && github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      actions: read
    steps:
      - name: Download all vrt-results
        uses: actions/download-artifact@v4
        with:
          path: artifacts
          pattern: vrt-results-*
          merge-multiple: false

      - name: Build comment body
        id: body
        run: |
          {
            echo 'body<<EOF'
            echo '## Visual Regression Result'
            echo ''
            if [ "${{ needs.visual-regression.result }}" = 'success' ]; then
              echo 'All visual tests passed.'
            else
              echo 'Visual diff detected. Download artifacts below to inspect:'
              echo ''
              for d in artifacts/vrt-results-*; do
                [ -d "$d" ] || continue
                app=$(basename "$d" | sed 's/^vrt-results-//')
                echo "- **$app**"
                find "$d" -name 'test-failed-*.png' -printf '  - %f\n' | head -20
              done
              echo ''
              echo "Run: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            fi
            echo 'EOF'
          } >> "$GITHUB_OUTPUT"

      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            const body = `${{ steps.body.outputs.body }}`;
            const { owner, repo } = context.repo;
            const issue_number = context.payload.pull_request.number;

            // 같은 마커가 있는 기존 코멘트 갱신 (스팸 방지)
            const marker = '<!-- vrt-comment -->';
            const finalBody = `${marker}\n${body}`;
            const { data: comments } = await github.rest.issues.listComments({
              owner, repo, issue_number,
            });
            const existing = comments.find(c => c.body?.startsWith(marker));
            if (existing) {
              await github.rest.issues.updateComment({
                owner, repo, comment_id: existing.id, body: finalBody,
              });
            } else {
              await github.rest.issues.createComment({
                owner, repo, issue_number, body: finalBody,
              });
            }
```

### thollander/actions-comment-pull-request 대체안

더 간단한 코멘트면 서드파티 액션도 가능합니다 (마커 갱신 로직 내장).

```yaml
      - name: Comment PR (simple)
        if: github.event_name == 'pull_request'
        uses: thollander/actions-comment-pull-request@v3
        with:
          message: |
            ## Visual Regression: ${{ needs.visual-regression.result }}
            [Run details](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})
          comment-tag: vrt-comment   # 같은 태그면 갱신
```

> 주의: `actions/github-script`는 v7이 안정. v8(Node 24)도 출시되어 있지만 본 문서는 v7 기준입니다. `thollander/actions-comment-pull-request`는 v3.0.1이 최신.

---

## 7. matrix 병렬: storybook-mui · storybook-radix 동시 실행

위 예시에서 이미 다뤘지만, 여기서는 **변경된 쪽만 실행**하는 패턴을 정리합니다.

```yaml
strategy:
  fail-fast: false
  matrix:
    include:
      - app: storybook-mui
        run: ${{ needs.changes.outputs.mui }}
      - app: storybook-radix
        run: ${{ needs.changes.outputs.radix }}
```

각 step에 `if: matrix.run == 'true'`를 걸면:
- mui만 변경 → mui 잡은 실제 실행, radix 잡은 빠른 skip (러너 슬롯은 잡지만 1초 안에 종료)
- 둘 다 변경 → 양쪽 동시 실행 (병렬)

> 주의: `if: matrix.run == 'true'`로 step을 건너뛰는 것보다 **잡 자체를 조건부**로 만드는 게 더 깔끔하지만, matrix는 잡 레벨 `if`에서 matrix 컨텍스트를 못 봅니다 (matrix는 잡 내부에서만 평가됨). 따라서 step 단위 가드가 표준 패턴입니다.

대안으로 동적 matrix를 쓸 수도 있습니다 (이전 잡에서 `outputs.matrix`를 JSON으로 만들어 다음 잡의 `strategy.matrix`로 주입). 복잡도가 올라가므로 앱이 5개 이상일 때만 검토하세요.

---

## 8. Anti-pattern: 절대 하지 말 것

### 8-1. `pull_request_target`로 시각 회귀 실행 — 시크릿 유출 위험

```yaml
# 절대 금지
on:
  pull_request_target:    # 포크 PR도 base 컨텍스트로 실행됨
    branches: [main]

jobs:
  vrt:
    steps:
      - uses: actions/checkout@v5
        with:
          ref: ${{ github.event.pull_request.head.sha }}   # 포크의 코드 체크아웃
      - run: pnpm install   # 포크의 package.json 스크립트 실행 → RCE
```

`pull_request_target`은 base repo 컨텍스트에서 실행되어 **시크릿 + write 권한이 그대로 노출**됩니다. 이 상태에서 포크의 코드를 체크아웃하면 임의 코드 실행으로 이어집니다 ("pwn requests"). GitHub Security Lab의 공식 권고:
- 포크 PR에서 **빌드/스크립트 실행이 필요하면 `pull_request` 사용** (base 시크릿·write 권한 없음)
- write 권한이 꼭 필요하면 `workflow_run` 트리거 + 격리된 unprivileged 환경에서 빌드

### 8-2. baseline drift — 자동 갱신을 main에 직접 커밋

```yaml
# 금지
- run: test-storybook -u   # main 브랜치에서 자동 갱신
- run: git commit -am "update baseline" && git push
```

regression이 baseline에 흡수되어 **시각 회귀가 영구히 무력화**됩니다. baseline 업데이트는 반드시 **별도 PR + 사람의 리뷰**를 거쳐야 합니다 (섹션 5의 `peter-evans/create-pull-request` 패턴).

### 8-3. 로컬에서 생성한 baseline을 커밋

macOS의 폰트 렌더링과 Ubuntu(GitHub-hosted runner)의 폰트 렌더링은 다릅니다 (특히 한글 폰트, anti-aliasing, sub-pixel hinting). 로컬에서 만든 baseline을 커밋하면 CI에서 **모든 스크린샷이 false positive**로 실패합니다.

대응:
- baseline은 항상 CI(Ubuntu)에서 생성 (섹션 5의 update-baseline 워크플로우)
- 로컬에서 확인할 때는 동일 OS의 Docker 이미지 사용: `mcr.microsoft.com/playwright:v1.x-jammy`

### 8-4. artifact 이름 충돌

```yaml
# 금지 - upload-artifact@v4는 동일 이름 덮어쓰기 불가
strategy:
  matrix:
    app: [mui, radix]
- uses: actions/upload-artifact@v4
  with:
    name: vrt-results   # 두 매트릭스가 동시에 같은 이름 업로드 시도 → 실패
```

```yaml
# 권장
- uses: actions/upload-artifact@v4
  with:
    name: vrt-results-${{ matrix.app }}
```

### 8-5. 매번 모든 브라우저 설치

```yaml
# 비권장
- run: pnpm exec playwright install --with-deps   # ~600MB, ~90초

# 권장
- run: pnpm exec playwright install --with-deps chromium   # ~200MB, ~30초
```

시각 회귀에서 멀티 브라우저는 보통 over-engineering입니다. 단일 chromium으로 시작하고, 브라우저 호환성 이슈가 실제로 보고된 후에만 확장하세요.

### 8-6. retention-days 무제한

`actions/upload-artifact@v4`의 `retention-days` 기본은 레포 설정값(보통 90일). 시각 회귀 PNG는 PR 머지 후 가치가 거의 없으므로 **7~14일로 명시**하는 게 비용·스토리지 관점에서 유리합니다.

---

## 9. 언제 사용 / 언제 사용하지 않을지

### 사용하면 좋은 경우
- 디자인 시스템 패키지 (`packages/ui` 등) PR마다 시각 회귀 자동 검증
- Storybook 2개 이상 (MUI + Radix 등)을 모노레포에서 병렬 검증
- 깨진 컴포넌트를 PR에서 즉시 시각화해야 하는 디자이너·개발자 협업 워크플로우

### 다른 도구가 나은 경우
- **Chromatic / Percy / Argos 사용 중** — 호스팅된 시각 회귀 SaaS는 baseline 관리·diff UI가 내장. self-managed보다 운영 부담 적음
- **시각보다 인터랙션·접근성 회귀가 더 중요** — `@storybook/test`의 play function + axe 검사가 우선순위
- **단일 패키지 + 단일 Storybook** — matrix 분리 가치가 적어 단순 워크플로우면 충분

---

## 10. 전체 워크플로우 예시 (조합)

위 섹션들을 조합한 완성형 워크플로우입니다.

```yaml
# .github/workflows/visual-regression.yml
name: visual-regression

on:
  pull_request:
    branches: [main]
    paths:
      - 'apps/storybook-mui/**'
      - 'apps/storybook-radix/**'
      - 'packages/ui/**'
      - 'packages/tokens/**'
      - 'pnpm-lock.yaml'
      - '.github/workflows/visual-regression.yml'
  push:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

concurrency:
  group: vrt-${{ github.ref }}
  cancel-in-progress: true

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      mui: ${{ steps.f.outputs.mui }}
      radix: ${{ steps.f.outputs.radix }}
    steps:
      - uses: actions/checkout@v5
      - uses: dorny/paths-filter@v3
        id: f
        with:
          filters: |
            mui:
              - 'apps/storybook-mui/**'
              - 'packages/ui/**'
              - 'packages/tokens/**'
            radix:
              - 'apps/storybook-radix/**'
              - 'packages/ui/**'
              - 'packages/tokens/**'

  build-storybook:
    needs: changes
    if: needs.changes.outputs.mui == 'true' || needs.changes.outputs.radix == 'true'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [storybook-mui, storybook-radix]
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter ${{ matrix.app }} build:storybook
      - uses: actions/upload-artifact@v4
        with:
          name: storybook-static-${{ matrix.app }}
          path: apps/${{ matrix.app }}/storybook-static
          retention-days: 7
          if-no-files-found: error

  visual-regression:
    needs: [changes, build-storybook]
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        include:
          - app: storybook-mui
            run: ${{ needs.changes.outputs.mui }}
          - app: storybook-radix
            run: ${{ needs.changes.outputs.radix }}
    steps:
      - uses: actions/checkout@v5
      - if: matrix.run != 'true'
        run: echo "skip ${{ matrix.app }}" && exit 0

      - if: matrix.run == 'true'
        uses: pnpm/action-setup@v4
        with: { version: 9 }
      - if: matrix.run == 'true'
        uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }
      - if: matrix.run == 'true'
        run: pnpm install --frozen-lockfile

      - if: matrix.run == 'true'
        uses: actions/download-artifact@v4
        with:
          name: storybook-static-${{ matrix.app }}
          path: apps/${{ matrix.app }}/storybook-static

      - if: matrix.run == 'true'
        uses: actions/cache@v4
        with:
          path: apps/${{ matrix.app }}/__snapshots__
          key: vrt-${{ matrix.app }}-${{ runner.os }}-${{ hashFiles(format('apps/{0}/__snapshots__/**', matrix.app)) }}
          restore-keys: vrt-${{ matrix.app }}-${{ runner.os }}-

      - if: matrix.run == 'true'
        run: pnpm exec playwright install --with-deps chromium

      - if: matrix.run == 'true'
        run: |
          pnpm --filter ${{ matrix.app }} exec start-server-and-test \
            "http-server storybook-static --port 6006 --silent" \
            http://127.0.0.1:6006 \
            "test-storybook --maxWorkers=2"

      - if: failure() && matrix.run == 'true'
        uses: actions/upload-artifact@v4
        with:
          name: vrt-results-${{ matrix.app }}
          path: |
            apps/${{ matrix.app }}/test-results/
            apps/${{ matrix.app }}/playwright-report/
          retention-days: 14
          if-no-files-found: warn

  comment-pr:
    needs: visual-regression
    if: always() && github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      actions: read
    steps:
      - uses: thollander/actions-comment-pull-request@v3
        with:
          comment-tag: vrt-comment
          message: |
            ## Visual Regression: ${{ needs.visual-regression.result }}
            [상세 결과 (artifact 다운로드)](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})
```
