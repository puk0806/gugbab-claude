---
name: sass
description: SCSS 핵심 패턴, CSS Modules + SCSS, 캡슐화 중심 스타일 설계
---

# SASS / SCSS 패턴

> 소스: https://sass-lang.com/documentation/ | https://nextjs.org/docs/app/building-your-application/styling/sass
> 검증일: 2026-04-01

---

## CSS Modules + SCSS (권장 조합)

```scss
// Button.module.scss
.button {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 4px;

  &--primary {
    background: var(--color-primary);
    color: #fff;
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__icon {
    margin-right: 8px;
  }
}
```

```tsx
// Button.tsx — 클래스명이 컴포넌트 밖으로 누출되지 않음
import styles from './Button.module.scss'

function Button({ variant, disabled, icon, children }) {
  return (
    <button
      className={[
        styles.button,
        styles[`button--${variant}`],
        disabled && styles['button--disabled'],
      ].filter(Boolean).join(' ')}
      disabled={disabled}
    >
      {icon && <span className={styles.button__icon}>{icon}</span>}
      {children}
    </button>
  )
}
```

**캡슐화 원칙:** CSS Modules는 클래스명을 자동으로 해시 처리 → 외부에서 직접 스타일 덮어쓰기 불가.

---

## 변수 & 디자인 토큰

```scss
// tokens/_colors.scss
$color-primary: #3b82f6;
$color-primary-dark: #1d4ed8;
$color-error: #ef4444;
$color-surface: #ffffff;
$color-text: #111827;

// tokens/_spacing.scss
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// tokens/_typography.scss
$font-size-sm: 0.875rem;
$font-size-base: 1rem;
$font-size-lg: 1.125rem;
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-bold: 700;
```

**CSS Custom Properties와 병행 사용:**

```scss
// globals.scss — CSS 변수로 노출 (JS에서도 접근 가능)
:root {
  --color-primary: #{$color-primary};
  --spacing-md: #{$spacing-md};
}
```

---

## Mixin — 재사용 스타일 로직

```scss
// mixins/_responsive.scss
@use 'sass:map';

$breakpoints: (
  'sm': 640px,
  'md': 768px,
  'lg': 1024px,
  'xl': 1280px,
);

@mixin respond-to($breakpoint) {
  @if map.has-key($breakpoints, $breakpoint) {
    @media (min-width: map.get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

// 사용
.card {
  width: 100%;

  @include respond-to('md') {
    width: 50%;
  }

  @include respond-to('lg') {
    width: 33.333%;
  }
}
```

```scss
// mixins/_typography.scss
@mixin text-ellipsis($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

@mixin visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);  // clip: rect() deprecated
  white-space: nowrap;
  border: 0;
}
```

---

## Function — 계산 로직

```scss
// functions/_unit.scss
@use 'sass:math';
@use 'sass:map';

@function rem($px) {
  @return math.div($px, 16) * 1rem;
}

@function z($layer) {
  $z-layers: (
    'below': -1,
    'base': 0,
    'float': 10,
    'overlay': 100,
    'modal': 200,
    'toast': 300,
  );
  @return map.get($z-layers, $layer);
}

// 사용
.modal {
  z-index: z('modal');
  padding: rem(24);
}
```

---

## 폴더 구조 (7-1 패턴 간소화)

```
styles/
├── tokens/
│   ├── _colors.scss
│   ├── _spacing.scss
│   └── _typography.scss
├── mixins/
│   ├── _responsive.scss
│   └── _typography.scss
├── functions/
│   └── _unit.scss
├── base/
│   ├── _reset.scss
│   └── _globals.scss
└── index.scss      ← 전체 export (토큰/믹스인만, 컴포넌트 스타일 제외)
```

```scss
// styles/index.scss — 전역 유틸리티만 노출
@forward 'tokens/colors';
@forward 'tokens/spacing';
@forward 'tokens/typography';
@forward 'mixins/responsive';
@forward 'mixins/typography';
@forward 'functions/unit';
```

**컴포넌트 스타일은 각 컴포넌트 폴더에 `.module.scss`로 보관.** 전역 index.scss에 포함시키지 않는다.

---

## ❌ 피해야 할 패턴

```scss
// ❌ 깊은 중첩 (3단계 초과)
.card {
  .header {
    .title {
      span { color: red; } // 과도한 중첩
    }
  }
}

// ✅ BEM + 1-2단계 중첩만
.card__title span { color: red; }

// ❌ 전역 클래스 남용
.active { color: blue; } // 어디서든 덮어쓸 수 있음

// ✅ CSS Modules로 스코프 제한
.active { color: blue; } // Button.module.scss 안에서만 유효
```
