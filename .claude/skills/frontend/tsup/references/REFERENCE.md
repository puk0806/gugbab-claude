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
