---
name: code-convention
description: ESLint 10+ flat config, Biome, Prettier, Husky, lint-staged, commitlint 설정 및 선택 기준
---

# 코드 컨벤션 & 품질 도구 패턴

> 소스: https://eslint.org/docs/latest | https://biomejs.dev/docs | https://prettier.io/docs
> 소스: https://eslint.org/blog/2026/02/eslint-v10.0.0-released/ | https://eslint.org/version-support/ | https://biomejs.dev/guides/upgrade-to-biome-v2/
> 검증일: 2026-08-26 (최초 2026-03-27 · 08-26 freshness 재검증: ESLint 10.0.0(2026-02-06)에서 eslintrc 완전 제거·v9는 2026-08-06 EOL, Biome 2.5.x의 `organizeImports`→`assist` 이동 반영)

> **버전 기준 (2026-08-26):** ESLint **10.x**(현행, v9.x는 2026-08-06부로 EOL, v8.x는 2024-10-05 EOL) · Biome **2.5.x** · Prettier 3.x · Husky 9 · lint-staged 최신.
> ESLint 10은 `.eslintrc.*`·`.eslintignore`·`ESLINT_USE_FLAT_CONFIG`·`--no-eslintrc`·`--rulesdir`·`--ignore-path` 를 **전부 제거**했고 Node `^20.19.0 || ^22.13.0 || >=24` 를 요구한다. `eslint.config.*` 탐색 기준도 cwd가 아니라 **린트 대상 파일의 디렉토리**로 바뀌었다(모노레포에서 패키지별 config가 잡히는 방식이 달라짐).
> **아직 ESLint 8 + `.eslintrc`를 쓰는 레거시 프로젝트**는 이 스킬의 flat config 예시를 그대로 적용할 수 없다 — 경계 규칙 등 v8 분기 설정은 `architecture/module-boundaries` 스킬(ESLint 8·9 양쪽 예시)을 참조하고, v10 이행은 eslintrc→flat config 변환(`@eslint/migrate-config`)을 선행한다.

---

## 도구 선택 기준

```
린터/포매터 선택?
├─ 속도 최우선 + 설정 간소화 원함
│  └─ Biome (린트 + 포맷 통합, Rust 기반)
│
└─ 기존 ESLint 플러그인 생태계 필요 (ex. Next.js, Tailwind)
   └─ ESLint 10+ flat config + Prettier
```

| 도구 | 역할 | 속도 | 플러그인 생태계 |
|------|------|------|--------------|
| Biome | 린트 + 포맷 통합 | ⭐⭐⭐⭐ 매우 빠름 | 제한적 |
| ESLint 10+ | 린트 전용 | ⭐⭐ | 풍부함 |
| Prettier | 포맷 전용 | ⭐⭐⭐ | - |

**모노레포 권장:** ESLint + Prettier (Next.js, eslint-config-next 호환성 때문)

---

## ESLint 10+ Flat Config

### 기본 구조 (eslint.config.js)

```javascript
// eslint.config.js (ESLint 9부터 기본, 10부터 유일한 포맷)
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import nextPlugin from '@next/eslint-plugin-next'

export default tseslint.config(
  // 전역 무시 패턴
  { ignores: ['dist/**', '.next/**', 'node_modules/**'] },

  // JS 기본 규칙
  js.configs.recommended,

  // TypeScript 규칙
  ...tseslint.configs.recommended,

  // React 규칙
  {
    plugins: { react: reactPlugin, 'react-hooks': reactHooks },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // React 17+ JSX Transform
      'react/prop-types': 'off',          // TypeScript가 커버
    },
    settings: { react: { version: 'detect' } },
  },

  // Next.js 규칙 (apps/web에만 적용)
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    plugins: { '@next/next': nextPlugin },
    rules: { ...nextPlugin.configs.recommended.rules },
  },

  // 공통 TypeScript 규칙
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error', // import type 강제
    },
  }
)
```

### 모노레포 설정 패턴

```
monorepo/
├── eslint.config.js         ← 루트 공통 설정
└── apps/web/
    └── eslint.config.js     ← 앱별 확장
```

```javascript
// apps/web/eslint.config.js
import rootConfig from '../../eslint.config.js'
import nextPlugin from '@next/eslint-plugin-next'

export default [
  ...rootConfig,
  {
    plugins: { '@next/next': nextPlugin },
    rules: { ...nextPlugin.configs['core-web-vitals'].rules },
  },
]
```

### 공유 패키지 설정 (packages/eslint-config)

```javascript
// packages/eslint-config/index.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export const base = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { ignores: ['dist/**'] }
)

export const react = tseslint.config(
  ...base,
  // React 규칙 추가
)

export const nextjs = tseslint.config(
  ...react,
  // Next.js 규칙 추가
)
```

---

## Biome (통합 린터+포매터)

### 설정

```json
// biome.json
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "assist": { "actions": { "source": { "organizeImports": "on" } } },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "useExhaustiveDependencies": "warn"
      },
      "suspicious": {
        "noExplicitAny": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "asNeeded"
    }
  },
  "files": {
    "ignore": ["dist/**", ".next/**", "node_modules/**"]
  }
}
```

### Biome vs ESLint+Prettier 비교

| 항목 | Biome | ESLint + Prettier |
|------|-------|-----------------|
| 설정 파일 수 | 1개 (biome.json) | 2개 이상 |
| 실행 속도 | 10-20x 빠름 | 기준 |
| next-eslint 지원 | ❌ (직접 없음) | ✅ |
| import 정렬 | ✅ 내장 | 플러그인 필요 |
| 성숙도 | v2 안정 (2025-06-17 v2.0 → 2.5.x, 린트 룰 500개) | 검증됨 |
| 타입 인지 린트 | v2부터 **tsc 없이** 자체 타입 추론으로 type-aware 룰 제공 (`typescript` 패키지 미설치도 가능) | `typescript-eslint` + `parserOptions.projectService` (tsc 프로그램 필요, 느림) |

---

## Prettier

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]  // Tailwind 사용 시
}
```

```
// .prettierignore
dist/
.next/
node_modules/
*.min.js
```

**ESLint와 충돌 방지:**

```bash
pnpm add -D eslint-config-prettier  # ESLint의 포맷 규칙 비활성화
```

```javascript
// eslint.config.js
import prettierConfig from 'eslint-config-prettier/flat'  // flat config용 서브패스
export default [...기존설정, prettierConfig]  // 항상 마지막에
```

---

## Husky + lint-staged (커밋 전 검사)

### 설치 및 설정

```bash
pnpm add -D husky lint-staged
npx husky init
```

```bash
# .husky/pre-commit
npx lint-staged
```

```json
// package.json (루트)
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yaml}": [
      "prettier --write"
    ]
  }
}
```

### commit-msg 훅 (커밋 메시지 검증)

```bash
# .husky/commit-msg
npx --no -- commitlint --edit $1
```

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'test', 'chore', 'ci', 'perf', 'revert'
    ]],
    'subject-max-length': [2, 'always', 72],
  }
}
```

---

## TypeScript 타입 체크

### 기본 명령어

```bash
# 타입 에러만 확인 (JS 파일 출력 없음)
tsc --noEmit

# 특정 tsconfig 지정
tsc --noEmit -p tsconfig.json

# watch 모드 (개발 중)
tsc --noEmit --watch
```

### 각 패키지에 typecheck 스크립트 추가

```json
// apps/web/package.json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}

// packages/ui/package.json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

### Turborepo 통합

```json
// turbo.json
{
  "tasks": {
    "typecheck": {
      "dependsOn": ["^typecheck"],  // 의존 패키지 타입 체크 먼저
      "cache": true
    },
    "lint": {
      "cache": true,
      "outputs": [".eslintcache"]
    }
  }
}
```

```json
// package.json (루트)
{
  "scripts": {
    "typecheck": "turbo run typecheck",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md}\""
  }
}
```

### pre-commit에 typecheck 포함 여부 판단 기준

```
typecheck를 pre-commit에 넣어야 할까?

느리다 (프로젝트 규모 클수록) → 보통 CI에서만 실행
빠르다 (소규모 프로젝트) → pre-commit에 포함 가능

권장 패턴:
- pre-commit: lint + format (빠름, 변경 파일만)
- pre-push 또는 CI: typecheck (전체 타입 검사)
```

```bash
# .husky/pre-push (pre-commit 대신 push 시 타입 체크)
pnpm typecheck
```

### ts-ignore vs ts-expect-error

```typescript
// ❌ ts-ignore: 다음 줄 에러를 무조건 무시 (에러 없어도 경고 없음)
// @ts-ignore
const value = badFunction()

// ✅ ts-expect-error: 에러가 있을 것을 명시적으로 표현
// → 에러가 사라지면 TypeScript가 오히려 경고를 줌
// @ts-expect-error: TODO 서드파티 타입 수정 전 임시 처리
const value = badFunction()

// ✅ 더 좋은 방법: 타입 단언으로 범위 제한
const value = (badFunction() as unknown) as ExpectedType
```

### strict 옵션별 의미

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,                    // 아래 옵션 모두 활성화
    // strict: true가 포함하는 것들:
    // "strictNullChecks": true,       // null/undefined 엄격 처리
    // "strictFunctionTypes": true,    // 함수 타입 반공변성 체크
    // "strictBindCallApply": true,    // bind/call/apply 타입 체크
    // "noImplicitAny": true,          // any 암묵적 추론 금지
    // "noImplicitThis": true,         // this 타입 명시 요구

    // strict에 포함 안 되지만 권장:
    "noUncheckedIndexedAccess": true,  // arr[0]에 undefined 포함
    "noImplicitReturns": true,         // 모든 코드 경로에 return 필요
    "noFallthroughCasesInSwitch": true // switch case fallthrough 금지
  }
}
```

---

## CI 통합 패턴

```yaml
# .github/workflows/quality.yml
name: Code Quality
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm format:check
```

---

## 흔한 실수 패턴

```javascript
// ❌ ESLint 8 방식 (레거시 .eslintrc.json)
// → ESLint 9까지는 eslintrc 병행 지원(옵션), ESLint 10부터 완전 제거 — flat config (eslint.config.js)만 동작
//   Biome v1 설정(`"organizeImports": { "enabled": true }`)도 v2에서 `assist.actions.source.organizeImports`로 이동 — `biome migrate --write`로 변환

// ❌ prettier와 eslint 포맷 규칙 중복 설정
// → eslint-config-prettier로 ESLint 포맷 규칙 비활성화 필수

// ❌ Husky pre-commit에서 전체 파일 린트
// "scripts": { "pre-commit": "eslint ." }  // 느림
// ✅ lint-staged로 변경된 파일만 검사

// ❌ 모노레포에서 각 패키지마다 별도 Prettier 설정
// → 루트 .prettierrc 하나로 통일
```
