## 6. 다크 모드 / 테마 전환

### 방법 A: CSS Custom Properties + data 속성 (권장)

```scss
// _themes.scss
$theme-light: (
  'color-bg': #ffffff,
  'color-text': #1f2937,
  'color-primary': #3b82f6,
  'color-surface': #f3f4f6,
  'shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
);

$theme-dark: (
  'color-bg': #111827,
  'color-text': #f9fafb,
  'color-primary': #60a5fa,
  'color-surface': #1f2937,
  'shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
);

@mixin apply-theme($theme) {
  @each $key, $value in $theme {
    --#{$key}: #{$value};
  }
}

// 기본: 라이트
:root {
  @include apply-theme($theme-light);
}

// OS 설정 연동
@media (prefers-color-scheme: dark) {
  :root {
    @include apply-theme($theme-dark);
  }
}

// 수동 전환 (JS에서 data-theme 속성 토글)
[data-theme="dark"] {
  @include apply-theme($theme-dark);
}

[data-theme="light"] {
  @include apply-theme($theme-light);
}
```

```tsx
// ThemeToggle.tsx
function ThemeToggle() {
  const toggle = () => {
    const current = document.documentElement.dataset.theme;
    document.documentElement.dataset.theme =
      current === 'dark' ? 'light' : 'dark';
  };
  return <button onClick={toggle}>테마 전환</button>;
}
```

### 방법 B: 테마별 SCSS 파일 + Style Dictionary

```js
// sd.config.mjs — 테마별 빌드
const themes = ['light', 'dark'];

const config = {
  source: ['tokens/core/**/*.json'],
  platforms: {},
};

for (const theme of themes) {
  config.platforms[`css-${theme}`] = {
    transformGroup: 'css',
    buildPath: `build/css/`,
    files: [
      {
        destination: `${theme}.css`,
        format: 'css/variables',
        options: {
          selector: theme === 'light' ? ':root' : '[data-theme="dark"]',
        },
      },
    ],
  };
}
```

---

## 7. 컴포넌트 라이브러리에서 토큰 소비 패턴

### 패키지 구조

```
packages/
├── tokens/                    ← 토큰 패키지
│   ├── src/
│   │   ├── core.json          ← Primitive 토큰
│   │   └── semantic.json      ← Semantic 토큰
│   ├── build/
│   │   ├── scss/
│   │   │   ├── _variables.scss
│   │   │   └── _map.scss
│   │   └── css/
│   │       └── variables.css
│   ├── sd.config.mjs
│   └── package.json
└── ui/                        ← 컴포넌트 라이브러리
    ├── src/
    │   └── Button/
    │       ├── Button.tsx
    │       └── Button.module.scss
    └── package.json
```

### 컴포넌트에서 토큰 사용

```scss
// ui/src/Button/Button.module.scss
@use '@my-org/tokens/build/scss/variables' as tokens;

.button {
  // CSS Custom Properties 참조 (런타임 테마 대응)
  background: var(--color-primary);
  color: var(--color-text);

  // SCSS 변수 참조 (컴파일 타임 계산)
  padding: tokens.$spacing-sm tokens.$spacing-md;
  border-radius: tokens.$radius-md;

  &:hover {
    background: var(--color-primary-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

### Next.js에서 전역 토큰 주입

```js
// next.config.mjs
const nextConfig = {
  sassOptions: {
    // 모든 SCSS 파일에 자동으로 토큰 import
    additionalData: `@use "@my-org/tokens/build/scss/variables" as tokens;`,
  },
};

export default nextConfig;
```

```scss
// 컴포넌트에서 @use 없이 바로 사용 가능
.card {
  padding: tokens.$spacing-md;
}
```

---

## 8. 흔한 실수 패턴

### 실수 1: Semantic 계층 없이 Primitive를 직접 사용

```scss
// BAD — 색상 변경 시 모든 컴포넌트를 수정해야 함
.button { background: var(--blue-500); }
.link { color: var(--blue-500); }

// GOOD — Semantic 토큰으로 간접 참조
.button { background: var(--color-primary); }
.link { color: var(--color-link); }
```

### 실수 2: 미디어 쿼리에 CSS Custom Properties 사용

```scss
// BAD — CSS Custom Properties는 미디어 쿼리 조건에 사용 불가
@media (min-width: var(--breakpoint-md)) { ... }

// GOOD — 미디어 쿼리 조건에는 SCSS 변수 또는 리터럴 사용
@media (min-width: $breakpoint-md) { ... }
@media (min-width: 768px) { ... }
```

### 실수 3: SCSS 변수를 CSS Custom Properties에 보간 없이 대입

```scss
$color: #3b82f6;

// BAD — SCSS 변수 그대로 넣으면 리터럴 문자열이 됨
:root { --color-primary: $color; }

// GOOD — #{} 보간 필수
:root { --color-primary: #{$color}; }
```

### 실수 4: 토큰 계층 역참조

```json
// BAD — Primitive가 Semantic을 참조 (계층 역전)
{
  "color": {
    "primitive": {
      "blue": { "$value": "{color.semantic.primary}" }
    }
  }
}

// GOOD — 항상 상위 → 하위 방향으로만 참조
// Primitive → Semantic → Component
```

### 실수 5: Style Dictionary v4에서 v3 API 사용

```js
// BAD (v3 API — v4에서 deprecated)
StyleDictionary.registerTransform({ ... });
const sd = StyleDictionary.extend(config);
sd.buildAllPlatforms();

// GOOD (v4 API)
const sd = new StyleDictionary({
  hooks: {
    transforms: { ... },
  },
  ...config,
});
await sd.buildAllPlatforms();
```

### 실수 6: 테마 전환 시 SCSS 변수만 사용

```scss
// BAD — SCSS 변수는 컴파일 타임에 고정되므로 런타임 테마 전환 불가
$bg: #fff;
.card { background: $bg; } // 빌드 후 background: #fff로 고정

// GOOD — 테마 전환 속성은 CSS Custom Properties 사용
.card { background: var(--color-bg); }
```

---

## 전체 파이프라인 요약

```
Figma (Tokens Studio / Variables)
  ↓ Export / API
tokens/*.json (DTCG 포맷, $value/$type)
  ↓ Style Dictionary v4
build/scss/_variables.scss  ← 컴파일 타임 로직용
build/scss/_map.scss        ← SCSS map 구조 접근용
build/css/variables.css     ← 런타임 테마용
  ↓ 컴포넌트 라이브러리
Button.module.scss          ← SCSS 변수 + CSS Custom Properties 혼용
```
