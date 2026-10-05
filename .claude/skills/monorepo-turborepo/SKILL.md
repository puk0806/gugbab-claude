---
name: monorepo-turborepo
description: 모노레포 vs 멀티레포 선택 기준, Turborepo 구조 및 파이프라인 설정
---

# 모노레포 & Turborepo 패턴

> 소스: https://turborepo.dev/docs | https://github.com/vercel/turborepo
> 검증일: 2026-09-28 (최초 2026-03-27 · 08-11 v4 · 09-28 재검증(2차))
> 기준 버전: Turborepo **2.11.4** (2026-09-24) / pnpm **12.6.0** (2026-08-26 GA, Rust 재작성 — 명령어·플래그·설정·lockfile 포맷은 11과 호환)
>
> 참고: 구 도메인 `turbo.build`는 현재 `turborepo.dev`로 301 리다이렉트된다.

---

## 모노레포 vs 멀티레포 선택 기준

| 기준 | 모노레포 | 멀티레포 |
|------|---------|---------|
| 패키지 간 의존성 | 많음 (공유 컴포넌트/유틸) | 적음 (독립 서비스) |
| 팀 규모 | 한 팀이 여러 패키지 관리 | 팀별 독립 저장소 |
| 배포 단위 | 함께 배포되는 경우 많음 | 완전 독립 배포 |
| 변경 영향도 | 한 곳에서 파악 가능 | 저장소마다 확인 필요 |
| 도구 통일 | 중앙 관리 | 팀마다 다를 수 있음 |

**모노레포 적합:**
- 디자인 시스템 + 여러 앱
- 풀스택 (프론트 + 백 + 공유 타입)
- 내부 패키지 라이브러리 운영 시

**멀티레포 적합:**
- 완전 독립 서비스 (마이크로서비스)
- 팀 / 기술 스택이 완전히 다른 경우

---

## 표준 폴더 구조

```
monorepo/
├── apps/                    # 실행 애플리케이션
│   ├── web/                 # Next.js 앱
│   ├── mobile/              # React Native
│   └── storybook/           # 컴포넌트 문서
├── packages/                # 공유 라이브러리
│   ├── ui/                  # UI 컴포넌트 (tsup 빌드)
│   ├── utils/               # 유틸리티 함수
│   ├── types/               # 공유 TypeScript 타입
│   ├── tsconfig/            # 공유 tsconfig
│   └── eslint-config/       # 공유 ESLint 설정
├── turbo.json
├── pnpm-workspace.yaml      # 또는 package.json workspaces
└── package.json             # private: true
```

### 루트 package.json

```json
{
  "name": "myorg",
  "private": true,
  "packageManager": "pnpm@12.6.0",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck"
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## turbo.json 파이프라인

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": ["NODE_ENV", "TURBO_TELEMETRY_DISABLED"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],          // 의존 패키지 build 먼저
      "outputs": [".next/**", "dist/**", "!.next/cache/**"],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true               // 장기 실행 프로세스
    },
    "lint": {
      "cache": true,
      "outputs": [".eslintcache"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "cache": true
    }
  }
}
```

**`^` (caret) 의미:** 의존하는 패키지의 해당 task를 먼저 실행

```
apps/web (ui 패키지 의존)
→ turbo run build 실행 시:
   1. packages/ui build 먼저 실행
   2. apps/web build 실행
```

---

## 워크스페이스 패키지 참조

```json
// apps/web/package.json
{
  "dependencies": {
    "@myorg/ui": "workspace:*",       // 항상 로컬 버전 사용
    "@myorg/utils": "workspace:*",
    "@myorg/types": "workspace:*"
  }
}
```

**`workspace:*` 장점:**
- npm 레지스트리 조회 없이 로컬 패키지 직접 참조
- 발행(publish) 시 자동으로 실제 버전으로 변환
- 변경사항 즉시 반영 (빌드 필요 여부는 패키지 설정에 따라 다름)

---

## 내부 패키지 유형

### UI 패키지 (컴포넌트 라이브러리)

```json
// packages/ui/package.json
{
  "name": "@myorg/ui",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch"
  }
}
```

### Config 패키지 (설정 공유)

```json
// packages/tsconfig/package.json
{
  "name": "@myorg/tsconfig",
  "files": ["base.json", "nextjs.json", "react.json"]
}
```

```json
// packages/tsconfig/base.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "moduleResolution": "bundler"
  }
}
```

### 타입 전용 패키지

```json
// packages/types/package.json
{
  "name": "@myorg/types",
  "main": "./src/index.ts",  // 타입만이면 빌드 불필요
  "types": "./src/index.ts"
}
```

---

## 캐싱 전략

### 로컬 캐시 (기본)

```bash
turbo run build            # 캐시 히트 시 즉시 완료
turbo run build --force    # 강제 재빌드
turbo run build --dry      # 실행 계획만 확인 (실제 실행 안 함)
```

### Remote Cache (Vercel)

```bash
turbo login                # Vercel 계정으로 로그인
turbo link                 # 현재 레포를 원격 캐시에 연결
```

**장점:** 팀원 간 / CI 간 캐시 공유 → 빌드 시간 40-85% 단축

### 환경변수와 캐시

```json
{
  "tasks": {
    "build": {
      "env": ["NEXT_PUBLIC_API_URL", "API_*"]  // 변경 시 캐시 무효화
    }
  }
}
```

---

## Changesets 버전 관리

```bash
# 설치
pnpm add -D @changesets/cli
pnpm changeset init

# 변경사항 기록
pnpm changeset        # 인터랙티브: 패키지 선택, 버전 타입, 설명

# 버전 적용
pnpm changeset version  # package.json 버전 업데이트 + CHANGELOG 생성

# 발행
pnpm changeset publish  # npm 발행
```

**워크플로우:**
```
개발 → changeset 작성 → PR 머지 → Release PR 자동 생성 → 승인 → 발행
```

---

## 자주 쓰는 Turbo 명령어

```bash
# 특정 패키지만 실행
turbo run build --filter=@myorg/web

# 특정 패키지와 의존 패키지 포함
turbo run build --filter=@myorg/web...

# 변경된 패키지만 실행 (git 기반) — main 브랜치 대비
turbo run build --filter=[main...HEAD]
# 또는 간략하게
turbo run build --affected

# 실행 그래프 시각화
turbo run build --graph

# 병렬 실행 (dev 서버 여러 개)
turbo run dev --parallel
```

---

## 환경변수 관리

```
apps/web/
├── .env.local          # 로컬 전용 (gitignore)
├── .env.development    # 개발 환경
├── .env.production     # 프로덕션 환경
└── .env.example        # 필요 변수 목록 (git 포함)
```

**❌ 루트에 .env 두지 않기:** 각 앱이 독립적인 환경변수 관리 필요
**✅ .env.example는 git에 포함:** 팀원이 필요한 변수 파악 가능

---

## 흔한 실수

```bash
# ❌ 루트에서 패키지 직접 설치
npm install react  # 루트 node_modules에 설치됨

# ✅ 특정 워크스페이스에 설치
pnpm add react --filter @myorg/web
pnpm add -D typescript --filter @myorg/ui
```

```json
// ❌ turbo.json에 환경변수 선언 누락
// → 환경변수 변경해도 캐시 무효화 안 됨

// ✅ 사용하는 환경변수 명시
{
  "tasks": {
    "build": {
      "env": ["NEXT_PUBLIC_API_URL"]
    }
  }
}
```

---

## pnpm 12 — 2026-08-26 GA (Rust 재작성)

> **주의 (2026-09-28 갱신):** pnpm **12.0**이 2026-08-26 GA로 출시됐고, 2026-09-28 기준 npm의 `latest` 태그도 12.6.0으로 이미 넘어갔다(11.x는 더 이상 최신이 아니다). pnpm 공식 발표: "pnpm 12는 Rust로 재작성됐지만, 명령어·플래그·설정·lockfile 포맷은 pnpm 11과 그대로 호환된다 — 업그레이드가 마이그레이션처럼 느껴지지 않아야 한다."
>
> **pnpm 12의 실제 breaking change** (공식 릴리즈 노트 `pnpm.io/blog/releases/12.0` 기준):
> - Git 의존성이 "저장소 신원" 기준으로 바뀜 — GitHub/GitLab/Bitbucket 저장소는 SSH URL 대신 항상 HTTPS로 해석되어 lockfile에 기록(SSH가 필요하면 git의 `url.insteadOf` 재작성 사용)
> - `pnpm-workspace.yaml`의 인식 못 하는 설정 키를 이제 보고함(버전 핀이 있으면 에러, 없으면 경고) — 오탈자(`minimumReleaseAge` 등) 무시되던 과거 동작 종료
> - 순환 의존성 그래프의 lockfile이 진입 순서와 무관하게 항상 같은 바이트로 결정적 생성됨(pnpm 11까지는 설치할 때마다 달라질 수 있었음)
> - `packageImportMethod: auto`가 Linux에서 하드링크를 우선 시도
> - `engineStrict`가 서브트리 전체가 아니라 의존성 엣지 단위로 적용됨
>
> **Turborepo와의 호환:** Turborepo 저장소 자체도 이미 pnpm 12로 전환했다(PR #13879). `pnpm turbo gen <name>`이 pnpm 12에서 실패하는 이슈(#14096)가 있었으나 종결(closed) 처리됐고, 2.11.5(canary 단계, 2026-09-28 기준 아직 stable 미출시)에서는 "pnpm 워크스페이스별 lockfile 해시 안정화" 수정이 진행 중이다.
> > 주의: 미검증 — 이 lockfile 해시 안정화가 정확히 어떤 증상을 고치는지, 2.10 때(pnpm 11 lockfile 파싱 실패)처럼 실사용에 영향이 큰 이슈인지는 이번 재검증에서 이슈 본문까지 확인하지 못했다(GitHub API 레이트 리밋). pnpm 12 + Turborepo 조합을 쓰다가 lockfile 관련 이상 동작이 보이면 Turborepo를 2.11.5 이상으로 올려서 재현되는지부터 확인한다.

## pnpm 11 + Turborepo 호환성 (2026-08-11 기준 — 이슈 해소됨, 현재는 레거시)

> **주의:** pnpm 11(2026-04-28 출시)은 Node.js 22+ 필수. pnpm 10에서 11로 업그레이드 시 CI/개발 환경도 Node.js 22 이상으로 함께 올려야 한다. **2026-09-28 기준 pnpm 12가 현행이므로, 신규 세팅이라면 아래 대신 위 "pnpm 12" 섹션부터 본다.** 이미 pnpm 11에 고정된 프로젝트를 위해 이 섹션은 그대로 유지한다.

```bash
# pnpm 11 주요 변경사항
# - Node.js 22+ 필수 (18/19/20/21 지원 종료)
# - 순수 ESM으로 전환
# - SQLite 기반 스토어 인덱스 (JSON-per-package → 단일 SQLite DB)
# - 자체 publish 구현 (npm CLI 폴백 제거)
# - lockfile 구조 변경 (configDependencies가 별도 YAML 문서로 분리)
```

**과거 Turborepo + pnpm 11 lockfile 이슈 — 모두 Turborepo 2.9.7(2026-05-01)에서 해소:**

| 이슈 | 원인 | 해소 버전 |
|------|------|-----------|
| multi-document YAML lockfile 파싱 실패 | pnpm 11의 `configDependencies` 사용 시 멀티 YAML 문서 생성 | **2.9.7** (PR #12616) |
| `patchedDependencies` flat-string 형식 경고 | pnpm 11이 `{path, hash}` 대신 flat 해시 문자열로 변경 | **2.9.7** (PR #12676) |

**대응 방법:**
- **Turborepo 2.9.7 이상**을 쓰면 pnpm 11의 `configDependencies`·`patchedDependencies`를 그대로 사용할 수 있다. 신규 세팅은 이 문서 기준 버전(2.11.4, 상단 참조)을 권장한다.
- 2.9.6 이하에 고정돼 있다면 위 두 기능 사용 시 lockfile 파싱 실패·경고가 발생하므로 **업그레이드가 유일한 해법**이다 (우회 설정 없음).
- pnpm 11로 올릴 때는 Turborepo 버전보다 **Node.js 22+ 요구사항**이 실제 CI 실패의 더 흔한 원인이다 — 런타임을 먼저 확인한다.

---

## Turborepo 2.10 신규 기능 (2026-06-24)

| 기능 | 내용 |
|------|------|
| **로컬 캐시 자동 정리** | `turbo.json` 최상위 `cacheMaxAge`·`cacheMaxSize`로 오래되거나 용량 초과한 캐시 항목 자동 제거 |
| **`--affected` + `--filter` 조합** | 이전에는 배타적이었던 두 옵션을 함께 사용 가능 |
| **Graceful shutdown** | 태스크 중단 시 정상 종료 절차·exit code 보존 |
| **Incremental task caching** | 태스크 단위 증분 캐싱 |
| **Boundaries 순환 의존성 탐지** | `turbo boundaries`가 패키지 간 순환 의존성을 검출 |

```jsonc
// turbo.json — 로컬 캐시 자동 정리 (기본값은 둘 다 "0" = 비활성)
{
  "$schema": "https://turbo.build/schema.json",
  "cacheMaxAge": "7d",      // 30s | 5m | 24h | 7d | 2w
  "cacheMaxSize": "10GB",   // 500MB | 10GB | 1.5GB (대소문자 무관)
  "tasks": { }
}
```

```bash
# 2.10부터 --affected와 --filter 동시 사용 가능
turbo run build --affected --filter=@myorg/web
```

---

## Turborepo 2.11 신규 기능 (2026-09-18)

> 소스: https://turborepo.dev/blog/2-11 (공식 릴리즈 공지)

| 기능 | 내용 |
|------|------|
| **`turbo prune --production`** | 워크스페이스 패키지가 `devDependencies`로만 참조될 때 prune 결과에서 제외 — Docker 이미지 등 배포용 산출물을 더 작게 만든다 |
| **Time to First Task 최대 4배 개선** | 2.9 대비. Vercel 사내 1037개 패키지 모노레포 기준 716ms → 394ms(45% 개선), 신규 `create-turbo` 프로젝트는 132ms → 34ms(74% 개선) |
| **`devEngines.packageManager` 지원** | 루트 `package.json`의 `devEngines.packageManager`(Node.js 표준 방식)로 패키지 매니저를 선언하면 Turborepo가 이를 인식 |
| **nub·aube 지원** | 새로 등장한 JS 패키지 매니저 2종을 pnpm/yarn/npm/bun과 동일하게 지원 |
| **Rust·Python·Go 네이티브 지원(Experimental)** | Cargo·uv·`go.work` 워크스페이스를 같은 Task Graph로 통합 — 언어를 넘나드는 태스크 의존성(`dependsOn`)·필터링·affected 계산·Watch Mode·prune이 전부 적용됨. `futureFlags.experimentalCargoWorkspaces` / `experimentalPythonWorkspaces`로 옵트인 |

```bash
# 배포용 이미지에서 devDependencies 전용 워크스페이스 패키지 제외
turbo prune web --production
```

```jsonc
// turbo.json — Rust/Python 워크스페이스를 같은 Task Graph에 편입(Experimental)
{
  "futureFlags": {
    "experimentalCargoWorkspaces": true,
    "experimentalPythonWorkspaces": true
  },
  "tasks": {
    "my-django-api#test": {
      "dependsOn": ["rust-api-core#build"]   // Rust 패키지 빌드가 끝나야 Python 테스트 실행
    }
  }
}
```

> 이 레포 프론트엔드 기준(TypeScript/JavaScript 전용 모노레포)에서는 Rust/Python/Go 네이티브 지원이 당장 관련 없다. `--production` prune과 `devEngines.packageManager`가 실사용 우선순위가 높다.
> 업그레이드: `pnpm dlx @turbo/codemod migrate` (자동 코드모드), 신규 프로젝트는 `pnpm dlx create-turbo@latest`.
