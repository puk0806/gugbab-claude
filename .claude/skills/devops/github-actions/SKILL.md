---
name: github-actions
description: GitHub Actions CI/CD 워크플로우 작성 패턴 - 트리거, 잡 의존성, 매트릭스, 캐싱, 시크릿, Docker, 배포, 모노레포
disable-model-invocation: true
---

# GitHub Actions CI/CD 워크플로우 패턴

> 소스: https://docs.github.com/en/actions
> 검증일: 2026-04-20

> 주의: 이 문서는 2026-04 기준 GitHub Actions 최신 상태로 작성되었습니다. actions/cache@v4, actions/checkout@v5, dorny/paths-filter@v3, Swatinem/rust-cache@v2 기준입니다.

---

## 워크플로우 기본 구조

워크플로우 파일은 `.github/workflows/` 디렉토리에 `.yml` 또는 `.yaml` 확장자로 저장한다.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - name: Build
        run: npm run build
```

---

## 이벤트 트리거

### push / pull_request

```yaml
on:
  push:
    branches:
      - main
      - 'releases/**'
    tags:
      - 'v*'
    paths:
      - 'src/**'
      - '*.json'
    paths-ignore:
      - 'docs/**'
      - '**.md'

  pull_request:
    types: [opened, synchronize, reopened]
    branches:
      - main
    paths:
      - 'src/**'
```

- `pull_request` 기본 activity types: `opened`, `synchronize`, `reopened`
- `branches`와 `branches-ignore`는 동시 사용 불가 (같은 이벤트 내에서)
- `paths`와 `paths-ignore`도 동시 사용 불가

### workflow_dispatch (수동 트리거)

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: '배포 환경'
        required: true
        type: choice
        options:
          - staging
          - production
      dry-run:
        description: 'Dry run 여부'
        type: boolean
        default: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying to ${{ inputs.environment }}"
```

- 최대 25개 입력 프로퍼티, 페이로드 65,535자 제한
- 입력 타입: `string`, `choice`, `boolean`, `environment`

### schedule (크론)

```yaml
on:
  schedule:
    - cron: '0 9 * * 1-5'  # 평일 09:00 UTC

jobs:
  nightly:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Scheduled job"
```

- POSIX cron 형식: `분(0-59) 시(0-23) 일(1-31) 월(1-12) 요일(0-6)`
- 최소 간격: 5분
- 기본 브랜치에서만 실행됨
- `timezone` 필드로 타임존 지정 가능

### workflow_call (재사용 워크플로우)

```yaml
on:
  workflow_call:
    inputs:
      node-version:
        type: string
        required: true
    secrets:
      npm-token:
        required: false
    outputs:
      build-result:
        description: "빌드 결과"
        value: ${{ jobs.build.outputs.result }}
```

---

## 잡 의존성 (needs)

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: npm test

  build:
    needs: [lint, test]  # lint, test 모두 성공 후 실행
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: npm run build

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying..."
```

- `needs`에 나열된 잡이 모두 성공해야 실행
- 실패한 잡 이후에도 실행하려면 `if: always()` 또는 `if: failure()` 사용

### 잡 출력 전달

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.get-version.outputs.version }}
    steps:
      - id: get-version
        run: echo "version=1.2.3" >> $GITHUB_OUTPUT

  use-version:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - run: echo "Version is ${{ needs.setup.outputs.version }}"
```

---

## 매트릭스 빌드

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false        # 하나 실패해도 나머지 계속 실행
      max-parallel: 3          # 동시 실행 최대 수
      matrix:
        node-version: [18, 20, 22]
        os: [ubuntu-latest, macos-latest]
        include:
          - node-version: 22
            os: ubuntu-latest
            experimental: true
        exclude:
          - node-version: 18
            os: macos-latest

    runs-on: ${{ matrix.os }}
    continue-on-error: ${{ matrix.experimental || false }}
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
```

- `fail-fast`: 기본값 `true` (하나 실패 시 전체 취소)
- `exclude`: 부분 매칭으로 제외 (모든 키를 명시하지 않아도 됨)
- `include`: exclude 이후 처리되므로 제외된 조합을 다시 추가 가능
- 매트릭스는 최대 256개 조합 생성 가능

---

## 캐싱 전략

### actions/cache 직접 사용

```yaml
- name: Cache node_modules
  id: cache-deps
  uses: actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-node-

- if: steps.cache-deps.outputs.cache-hit != 'true'
  run: pnpm install --frozen-lockfile
```

**캐시 키 매칭 순서:**
1. 현재 브랜치에서 `key` 정확히 일치
2. 현재 브랜치에서 `key` 접두사 일치
3. 현재 브랜치에서 `restore-keys` 순차 매칭
4. 기본 브랜치(main)에서 같은 순서 반복

**캐시 제한:**
- 기본 저장 한도: 레포지토리당 10 GB (설정으로 최대 10 TB까지 증가 가능)
- 7일간 접근되지 않은 캐시 자동 삭제
- 용량 초과 시 마지막 접근일 기준 오래된 순서대로 퇴거
- 업로드: 분당 200회 / 다운로드: 분당 1,500회 제한

### setup-node 캐시 (pnpm)

```yaml
- uses: pnpm/action-setup@v4
  with:
    version: 9

- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'pnpm'

- run: pnpm install --frozen-lockfile
```

### Rust 캐시 (Swatinem/rust-cache)

```yaml
- uses: dtolnay/rust-toolchain@stable
  with:
    components: clippy, rustfmt

- uses: Swatinem/rust-cache@v2

- run: cargo check
- run: cargo clippy -- -D warnings
- run: cargo test
```

- `~/.cargo` (레지스트리, 바이너리)와 `./target` (빌드 아티팩트)를 캐싱
- 캐시 키는 `Cargo.lock`, `Cargo.toml`, `rust-toolchain.toml`의 해시로 자동 생성

---

## 시크릿 관리

### 시크릿 레벨

| 레벨 | 범위 | CLI 생성 |
|------|------|----------|
| Repository | 단일 레포 | `gh secret set SECRET_NAME` |
| Environment | 특정 환경 | `gh secret set --env production SECRET_NAME` |
| Organization | 조직 전체 | `gh secret set --org ORG SECRET_NAME --visibility all` |

### 워크플로우에서 사용

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        env:
          API_KEY: ${{ secrets.API_KEY }}
          DB_URL: ${{ secrets.DATABASE_URL }}
        run: |
          deploy-script "$API_KEY"
```

**주의사항:**
- 포크된 레포의 워크플로우에는 시크릿이 전달되지 않음 (`GITHUB_TOKEN` 제외)
- 재사용 워크플로우에 시크릿이 자동 전달되지 않음 (명시적으로 전달 필요)
- 시크릿을 커맨드라인 인자로 직접 전달 금지 (환경 변수로 전달)
- 48 KB 초과 시크릿은 GPG 암호화 + 패스프레이즈 시크릿 조합으로 처리

### Environment 보호 규칙

```yaml
jobs:
  deploy-prod:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    steps:
      - run: echo "Production deploy"
```

- **Required reviewers**: 배포 전 승인 필요 (본인 승인 불가)
- **Wait timer**: 1~43,200분(30일) 대기 시간 설정
- **Deployment branches**: 특정 브랜치만 배포 허용
- **Custom protection rules**: GitHub App 기반 서드파티 보호 규칙 (최대 6개)

---

## Node.js / pnpm 프로젝트 CI

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
