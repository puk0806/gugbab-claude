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
