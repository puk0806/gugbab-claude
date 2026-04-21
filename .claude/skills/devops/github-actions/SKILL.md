---
name: github-actions
description: GitHub Actions CI/CD 워크플로우 작성 패턴 - 트리거, 잡 의존성, 매트릭스, 캐싱, 시크릿, Docker, 배포, 모노레포
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

## Rust 프로젝트 CI

```yaml
name: Rust CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

env:
  CARGO_TERM_COLOR: always

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: clippy, rustfmt
      - uses: Swatinem/rust-cache@v2

      - name: Format check
        run: cargo fmt --all -- --check
      - name: Clippy
        run: cargo clippy --all-targets --all-features -- -D warnings
      - name: Build
        run: cargo build --all-features
      - name: Test
        run: cargo test --all-features
```

---

## Docker 빌드 + GHCR 푸시

```yaml
name: Docker Build & Push

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      attestations: write
      id-token: write
    steps:
      - uses: actions/checkout@v5

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push
        id: push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

- `docker/metadata-action`: 브랜치, 태그, SHA 기반 자동 태깅
- `cache-from/cache-to: type=gha`: GitHub Actions 캐시를 Docker 빌드캐시로 활용
- `GITHUB_TOKEN`으로 GHCR 인증 (별도 토큰 불필요)

---

## 배포 워크플로우

### Vercel 배포

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Railway 배포

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: my-service
```

### AWS (ECR + ECS)

```yaml
name: Deploy to AWS ECS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v5

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ap-northeast-2

      - uses: aws-actions/amazon-ecr-login@v2
        id: ecr-login

      - name: Build & push to ECR
        env:
          REGISTRY: ${{ steps.ecr-login.outputs.registry }}
          REPO: my-app
          TAG: ${{ github.sha }}
        run: |
          docker build -t "$REGISTRY/$REPO:$TAG" .
          docker push "$REGISTRY/$REPO:$TAG"

      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: task-definition.json
          service: my-service
          cluster: my-cluster
          wait-for-service-stability: true
```

---

## Reusable Workflows

### 재사용 워크플로우 정의

```yaml
# .github/workflows/reusable-ci.yml
name: Reusable CI

on:
  workflow_call:
    inputs:
      node-version:
        type: string
        default: '20'
      working-directory:
        type: string
        default: '.'
    secrets:
      npm-token:
        required: false

jobs:
  ci:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ${{ inputs.working-directory }}
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

### 호출 워크플로우

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]

jobs:
  ci:
    uses: ./.github/workflows/reusable-ci.yml
    with:
      node-version: '20'
    secrets:
      npm-token: ${{ secrets.NPM_TOKEN }}
```

- 재사용 워크플로우는 `jobs.<job_id>.uses`로 호출 (steps 내부가 아님)
- 시크릿은 `secrets: inherit`로 전체 전달하거나 개별 명시
- 최대 4단계 중첩 가능

### Composite Action

```yaml
# .github/actions/setup-pnpm/action.yml
name: 'Setup pnpm'
description: 'pnpm 설치 및 의존성 캐시'
inputs:
  node-version:
    description: 'Node.js 버전'
    required: false
    default: '20'
outputs:
  cache-hit:
    description: '캐시 히트 여부'
    value: ${{ steps.cache.outputs.cache-hit }}
runs:
  using: "composite"
  steps:
    - uses: pnpm/action-setup@v4
      with:
        version: 9
      shell: bash

    - uses: actions/setup-node@v4
      id: cache
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'pnpm'

    - run: pnpm install --frozen-lockfile
      shell: bash
```

**Reusable Workflow vs Composite Action:**

| 구분 | Reusable Workflow | Composite Action |
|------|-------------------|------------------|
| 단위 | 전체 워크플로우 (여러 잡) | 단일 스텝 (잡 내부) |
| runner | 자체 `runs-on` 지정 | 호출자의 runner 사용 |
| 시크릿 접근 | 명시적 전달 필요 | 호출 잡의 시크릿 접근 가능 |
| 적합한 경우 | 독립 CI 파이프라인 공유 | 반복 스텝 묶음 재사용 |

---

## 모노레포 변경 감지

### paths 필터 (워크플로우 레벨)

```yaml
on:
  push:
    paths:
      - 'packages/frontend/**'
      - 'packages/shared/**'
```

- 워크플로우 단위로만 필터링 가능
- 잡/스텝 단위 조건부 실행 불가

### dorny/paths-filter (잡 레벨)

```yaml
jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      frontend: ${{ steps.filter.outputs.frontend }}
      backend: ${{ steps.filter.outputs.backend }}
    steps:
      - uses: actions/checkout@v5
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            frontend:
              - 'packages/frontend/**'
              - 'packages/shared/**'
            backend:
              - 'packages/backend/**'
              - 'packages/shared/**'

  frontend-ci:
    needs: changes
    if: needs.changes.outputs.frontend == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: pnpm --filter frontend test

  backend-ci:
    needs: changes
    if: needs.changes.outputs.backend == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: pnpm --filter backend test
```

### Turborepo 연동

```yaml
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0  # turbo prune에 필요

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Turbo 캐시와 함께 빌드
        run: pnpm turbo build --filter=...[origin/main]
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
```

---

## Concurrency (동시 실행 제어)

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

- 같은 concurrency 그룹의 워크플로우가 이미 실행 중이면 대기 또는 취소
- `cancel-in-progress: true`: 기존 실행을 취소하고 새 실행 시작
- PR의 중복 빌드 방지에 효과적

---

## Permissions (GITHUB_TOKEN 권한)

```yaml
permissions:
  contents: read
  pull-requests: write
  packages: write
  id-token: write   # OIDC 토큰 (AWS, GCP 인증 등)
```

- 워크플로우 또는 잡 레벨에서 설정 가능
- 최소 권한 원칙: 필요한 권한만 명시적으로 부여
- `permissions: read-all` / `write-all`로 전체 설정 가능하나 비권장

---

## 조건부 실행 (if)

```yaml
steps:
  - name: Deploy
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    run: npm run deploy

  - name: Comment PR
    if: github.event_name == 'pull_request'
    run: echo "PR comment"

  - name: Always run cleanup
    if: always()
    run: echo "Cleanup"

  - name: Run on failure
    if: failure()
    run: echo "Something failed"
```

---

## 흔한 실수 패턴

### 1. paths와 paths-ignore 동시 사용

```yaml
# 금지 - 에러 발생
on:
  push:
    paths: ['src/**']
    paths-ignore: ['src/test/**']

# 권장 - paths에서 제외 패턴 직접 관리
on:
  push:
    paths:
      - 'src/**'
      - '!src/test/**'
```

### 2. 시크릿을 커맨드 인자로 직접 전달

```yaml
# 금지 - 프로세스 목록에 노출
- run: curl -H "Authorization: ${{ secrets.TOKEN }}" https://api.example.com

# 권장 - 환경 변수 사용
- run: curl -H "Authorization: $TOKEN" https://api.example.com
  env:
    TOKEN: ${{ secrets.TOKEN }}
```

### 3. 캐시 키에 해시 미포함

```yaml
# 비권장 - 의존성 변경 시 stale 캐시 사용
key: ${{ runner.os }}-node-modules

# 권장 - lock 파일 해시 포함
key: ${{ runner.os }}-node-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### 4. checkout 없이 코드 참조

```yaml
# 금지 - 코드가 없음
steps:
  - run: npm test

# 권장
steps:
  - uses: actions/checkout@v5
  - run: npm test
```

### 5. 불필요한 write 권한

```yaml
# 비권장
permissions: write-all

# 권장 - 최소 권한
permissions:
  contents: read
```

---

## 언제 사용 / 언제 사용하지 않을지

### 사용하면 좋은 경우

- GitHub 레포지토리에 코드가 호스팅된 프로젝트의 CI/CD
- PR 기반 코드 리뷰 + 자동 검증 워크플로우
- GitHub Container Registry(GHCR) 연동 Docker 빌드
- OIDC 기반 클라우드 배포 (AWS, GCP, Azure)

### 다른 도구가 나은 경우

- 복잡한 DAG 파이프라인 (Buildkite, CircleCI가 나을 수 있음)
- 셀프호스트 러너 대규모 운영 (Jenkins, GitLab CI 고려)
- GitHub 외 Git 호스팅 사용 시 (GitLab CI, Bitbucket Pipelines)
