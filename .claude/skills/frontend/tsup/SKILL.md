---
name: tsup
description: tsup 패키지 번들러 — esbuild 기반 TypeScript 라이브러리 빌드, CJS/ESM 동시 출력, DTS 생성, 모노레포 공유 패키지 빌드 패턴
---

# tsup 패키지 번들러

> 소스: https://tsup.egoist.dev | https://github.com/egoist/tsup/releases
> 검증일: 2026-04-20

---

## tsup이란

tsup은 **esbuild** 기반의 TypeScript/JavaScript 라이브러리 번들러다. 설정이 최소화되어 있고, CJS/ESM 동시 출력과 TypeScript declaration 파일 생성을 지원한다.

**최신 안정 버전: 8.5.1** (2024-11-12 릴리즈)

**적합한 경우:**
- npm에 배포하는 라이브러리/패키지
- 모노레포 내 공유 패키지 빌드
- 단순한 CLI 도구 빌드
- 설정 최소화를 원하는 TS/JS 라이브러리

**부적합한 경우:**
- SPA 애플리케이션 (Vite 사용)
- Next.js 프로젝트 (Turbopack/Webpack 내장)
- CSS-heavy 프로젝트에서 SCSS 빌드 (네이티브 SCSS 미지원)

---

## 설치

```bash
# npm
npm install tsup typescript --save-dev

# pnpm
pnpm add -D tsup typescript
```

---

## 기본 설정 (tsup.config.ts)

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
});
```

### 주요 옵션

| 옵션 | 타입 | 설명 |
|------|------|------|
| `entry` | `string[]` 또는 `Record<string, string>` | 엔트리 포인트 |
| `format` | `('cjs' \| 'esm' \| 'iife')[]` | 출력 포맷 |
| `dts` | `boolean \| DtsConfig` | TypeScript declaration 파일 생성 |
| `clean` | `boolean` | 빌드 전 출력 디렉토리 정리 |
| `sourcemap` | `boolean` | 소스맵 생성 |
| `splitting` | `boolean` | 코드 스플리팅 (ESM에서만 유효) |
| `minify` | `boolean` | 코드 압축 |
| `target` | `string` | 빌드 타겟 (예: `'es2022'`, `'node18'`) |
| `outDir` | `string` | 출력 디렉토리 (기본: `'dist'`) |
| `external` | `string[]` | 번들에서 제외할 패키지 |
| `noExternal` | `string[]` | 번들에 강제 포함할 패키지 |
| `treeshake` | `boolean \| TreeshakingStrategy` | Tree shaking 활성화 (Rollup 사용) |
| `onSuccess` | `string \| (() => Promise<void>)` | 빌드 성공 후 실행할 명령/함수 |
| `bundle` | `boolean` | 번들링 여부 (기본: true) |
| `banner` | `{ js?: string; css?: string }` | 출력 파일 상단에 추가할 텍스트 |
| `define` | `Record<string, string>` | 전역 상수 치환 |
| `esbuildPlugins` | `Plugin[]` | esbuild 플러그인 |

---

## 엔트리 포인트 설정

### 단일 엔트리

```typescript
export default defineConfig({
  entry: ['src/index.ts'],
});
```

### 다중 엔트리

```typescript
export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
});
```

### 이름 지정 엔트리 (출력 파일명 제어)

```typescript
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    utils: 'src/utils/index.ts',
  },
});
```

### Glob 패턴 (번들링 없이 개별 파일 변환)

```typescript
export default defineConfig({
  entry: ['src/**/*.ts'],
  bundle: false, // 파일을 하나로 묶지 않고 각각 변환
});
```

---

## CJS/ESM 동시 출력

```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
});
```

출력 결과:
```
dist/
├── index.js       # ESM
├── index.cjs      # CJS
├── index.d.ts     # ESM Declaration
└── index.d.cts    # CJS Declaration
```

> tsup 8.x에서 ESM은 `.js`, CJS는 `.cjs` 확장자가 기본이다. `package.json`의 `"type": "module"` 여부에 따라 달라질 수 있다.
> CJS 전용 `.d.cts` 파일은 TypeScript의 `moduleResolution: "NodeNext"/"Node16"` 환경에서 CJS 조건에 올바른 타입을 제공한다.

---

## TypeScript Declaration 파일 생성

### 기본 DTS

```typescript
export default defineConfig({
  dts: true, // TypeScript 컴파일러로 .d.ts 생성
});
```

### DTS 고급 설정

```typescript
export default defineConfig({
  dts: {
    resolve: true,                // 외부 타입도 인라인으로 포함
    entry: 'src/index.ts',
    tsconfig: './tsconfig.lib.json', // 별도 tsconfig 지정
  },
});
```

### 느린 DTS 빌드 분리 패턴

DTS 생성은 esbuild가 아닌 TypeScript 컴파일러를 사용하므로 느릴 수 있다. 빌드 속도가 중요하면 분리 실행:

```json
{
  "scripts": {
    "build": "tsup",
    "build:types": "tsc --emitDeclarationOnly --outDir dist"
  }
}
```

---

## External 패키지 설정

### 기본 동작

tsup은 `package.json`의 `dependencies`와 `peerDependencies`를 자동으로 external 처리한다. `devDependencies`는 번들에 포함된다.

### 명시적 external

```typescript
export default defineConfig({
  external: ['react', 'react-dom', 'lodash'],
});
```

### 강제 번들 포함 (noExternal)

```typescript
export default defineConfig({
  noExternal: ['some-esm-only-package'],
});
```

> 주의: CJS 포맷으로 빌드할 때 ESM-only 패키지가 external이면 런타임 에러가 발생할 수 있다. 이 경우 `noExternal`로 번들에 포함시킨다.

---

## Watch 모드 및 개발 워크플로우

### CLI에서 watch 모드

```bash
tsup src/index.ts --watch
```

### onSuccess 콜백

빌드 성공 후 명령어 실행:

```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  onSuccess: 'node dist/index.js',
  // 또는 함수로:
  // onSuccess: async () => { /* 빌드 후 작업 */ },
});
```

### package.json scripts 패턴

```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit"
  }
}
```

### 환경별 빌드 (함수형 설정)

```typescript
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  minify: !options.watch, // watch 모드에서는 압축 안 함
  sourcemap: true,
  clean: true,
}));
```

---

## 모노레포 내 공유 패키지 빌드 패턴

### 공유 패키지 구조

```
packages/
├── ui/
│   ├── src/
│   │   ├── index.ts
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── tsup.config.ts
│   └── package.json
├── utils/
│   ├── src/
│   │   └── index.ts
│   ├── tsup.config.ts
│   └── package.json
└── shared-types/
    └── src/
        └── index.ts   ← 타입만 있으면 tsup 불필요, tsc만으로 충분
```

### 공유 패키지 tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],         // 모노레포 내부용이면 ESM만으로 충분
  dts: true,
  external: ['react', 'react-dom'], // peer dependencies
  clean: true,
});
```

### 공유 패키지 package.json

```json
{
  "name": "@myorg/ui",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Turborepo와 연동

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "dependsOn": ["^build"],
      "persistent": true
    }
  }
}
```

---

## package.json exports 필드 설정

### CJS/ESM 듀얼 패키지 (표준 패턴)

```json
{
  "name": "my-lib",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  },
  "files": ["dist"]
}
```

> 주의: `types` 조건은 반드시 `default`보다 먼저 와야 한다. TypeScript가 조건을 순서대로 평가하기 때문에, `types`가 뒤에 오면 타입 해석이 무시된다.

### 다중 엔트리 exports

```json
{
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    "./utils": {
      "import": {
        "types": "./dist/utils.d.ts",
        "default": "./dist/utils.js"
      },
      "require": {
        "types": "./dist/utils.d.cts",
        "default": "./dist/utils.cjs"
      }
    },
    "./styles.css": "./dist/styles.css"
  }
}
```

대응하는 tsup 설정:

```typescript
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    utils: 'src/utils/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
});
```

---

## tsup vs Rollup vs Vite lib mode 선택 기준

```
라이브러리 빌드 도구 선택?
├── 설정 최소화, 빠른 빌드 → tsup
├── 최고 수준 Tree Shaking, 복잡한 플러그인 → Rollup
└── SCSS/PostCSS 등 CSS 파이프라인 필요 → Vite lib mode
```

| 기준 | tsup | Rollup | Vite lib mode |
|------|------|--------|---------------|
| 설정 복잡도 | 매우 간단 | 복잡 | 보통 |
| 빌드 속도 | 빠름 (esbuild 기반) | 느림 | 보통 (esbuild + Rollup) |
| CSS/SCSS | 기본 CSS만 | 플러그인 필요 | SCSS/PostCSS 지원 |
| Tree Shaking | esbuild 기본, `treeshake: true`로 Rollup 강화 | 최고 수준 | Rollup 기반 |
| 플러그인 | esbuild 플러그인 | 풍부한 생태계 | Rollup + Vite 플러그인 |
| DTS 생성 | `dts: true` 내장 | rollup-plugin-dts 필요 | vite-plugin-dts 필요 |
| 모노레포 사용성 | 좋음 | 보통 | 좋음 |
| ESM/CJS 동시 출력 | 간단 | 설정 필요 | 설정 필요 |

### 선택 가이드

- **tsup 선택**: 순수 TS/JS 라이브러리, 설정 최소화 원할 때, CLI 도구, 모노레포 공유 패키지
- **Rollup 선택**: 최고 수준 Tree Shaking 필요, 복잡한 빌드 파이프라인, 풍부한 플러그인 커스터마이징
- **Vite lib mode 선택**: SCSS/CSS Modules 필수, 이미 Vite 사용 중인 프로젝트, React 컴포넌트 라이브러리에서 스타일 번들링 필요

---

## 고급 설정 패턴

### 다중 설정 (배열)

```typescript
export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
  },
  {
    entry: ['src/cli.ts'],
    format: ['cjs'],
    banner: { js: '#!/usr/bin/env node' }, // CLI shebang
    dts: false,
  },
]);
```

### Tree Shaking 강화

```typescript
export default defineConfig({
  treeshake: true, // Rollup의 tree shaking 사용 (esbuild 대신)
  // esbuild 기본 tree shaking보다 더 공격적으로 제거
});
```

> 주의: Tree Shaking은 ESM 포맷에서만 유효하다. CJS 포맷으로 출력되는 파일은 소비자 번들러도 tree shake 불가.

### 환경 변수 주입

```typescript
export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
```

### CSS 번들링

```typescript
// 기본 CSS (자동 추출)
export default defineConfig({
  entry: ['src/index.ts'],
  // CSS import가 있으면 자동으로 .css 파일 추출됨
});

// SCSS 지원 (서드파티 esbuild 플러그인)
import { defineConfig } from 'tsup';
import { sassPlugin } from 'esbuild-sass-plugin';

export default defineConfig({
  esbuildPlugins: [sassPlugin()],
});
```

> 주의: `esbuild-sass-plugin`은 서드파티 패키지다. SCSS가 필수라면 Vite lib mode가 더 나은 선택일 수 있다.

---

## 흔한 실수

### 1. peerDependencies를 external에 안 넣기

tsup은 `peerDependencies`를 자동 external 처리하지만, `devDependencies`에만 넣고 `peerDependencies`에 안 넣으면 번들에 포함된다.

```json
// 잘못된 예 - react가 번들에 포함됨
{
  "devDependencies": {
    "react": "^18.0.0"
  }
}

// 올바른 예 - react가 external 처리됨
{
  "peerDependencies": {
    "react": ">=18"
  },
  "devDependencies": {
    "react": "^18.0.0"
  }
}
```

### 2. CJS에서 splitting 사용

```typescript
// 잘못된 예 - CJS에서 splitting은 동작하지 않음
export default defineConfig({
  format: ['cjs'],
  splitting: true, // 무시됨
});

// ESM에서만 splitting 유효
export default defineConfig({
  format: ['esm'],
  splitting: true,
});
```

### 3. exports 필드에서 types 순서 잘못됨

```json
// 잘못된 예 - types가 default 뒤에 있음 (TypeScript가 타입 무시)
{
  "exports": {
    ".": {
      "import": {
        "default": "./dist/index.js",
        "types": "./dist/index.d.ts"
      }
    }
  }
}

// 올바른 예 - types가 먼저 (TypeScript 4.7+ 요구사항)
{
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    }
  }
}
```

### 4. bundle: false 없이 glob 엔트리 사용

```typescript
// 주의 - 모든 파일을 하나로 번들링
export default defineConfig({
  entry: ['src/**/*.ts'],
});

// 개별 파일 변환 의도라면 bundle: false 필요
export default defineConfig({
  entry: ['src/**/*.ts'],
  bundle: false,
});
```

### 5. CJS 전용 타입 파일 누락

```json
// 잘못된 예 - require 조건에 .d.cts 없음
// TypeScript moduleResolution: NodeNext 환경에서 타입 미해석
{
  "exports": {
    ".": {
      "require": {
        "default": "./dist/index.cjs"
      }
    }
  }
}

// 올바른 예 - .d.cts 명시
{
  "exports": {
    ".": {
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  }
}
```
