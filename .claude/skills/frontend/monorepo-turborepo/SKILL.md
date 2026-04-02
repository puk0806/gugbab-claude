---
name: monorepo-turborepo
description: 모노레포 vs 멀티레포 선택 기준, Turborepo 구조 및 파이프라인 설정
---

# 모노레포 & Turborepo 패턴

> 소스: https://turbo.build/repo/docs | https://github.com/vercel/turborepo
> 검증일: 2026-03-27

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
  "packageManager": "pnpm@9.0.0",
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
