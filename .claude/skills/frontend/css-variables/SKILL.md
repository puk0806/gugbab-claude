---
name: css-variables
description: CSS Custom Properties(CSS Variables) 핵심 패턴 — 선언, 상속, 폴백, 테마 전환, JS 연동
---

# CSS Variables (Custom Properties)

> 소스: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties | https://www.w3.org/TR/css-variables-1/
> 검증일: 2026-04-06

---

## 선언과 사용

```css
/* :root에 전역 변수 선언 */
:root {
  --color-primary: #3b82f6;
  --color-text: #1f2937;
  --spacing-unit: 8px;
  --font-size-base: 16px;
}

/* var()로 참조, 두 번째 인자는 폴백 값 */
.card {
  color: var(--color-text);
  padding: var(--spacing-unit);
  font-size: var(--font-size-base, 16px);
  border-color: var(--color-border, var(--color-primary)); /* 중첩 폴백 가능 */
}
```

**규칙:**
- 변수명은 반드시 `--`로 시작한다
- 대소문자를 구분한다 (`--Color`와 `--color`는 다른 변수)
- 선언된 요소의 하위 요소에 상속된다

---

## 스코프와 상속

```css
:root {
  --color-accent: blue;
}

/* 특정 요소에서 재정의 → 하위에만 적용 */
.dark-section {
  --color-accent: lightblue;
}

.button {
  background: var(--color-accent); /* 부모에 따라 blue 또는 lightblue */
}
```

---

## 다크 모드 테마 전환

```css
:root {
  --bg: #ffffff;
  --text: #1f2937;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111827;
    --text: #f9fafb;
  }
}

/* 또는 클래스 기반 전환 */
[data-theme="dark"] {
  --bg: #111827;
  --text: #f9fafb;
}
```

---

## JavaScript 연동

```js
// 읽기 (반환값에 선행 공백 포함 가능 — .trim() 필수)
const value = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-primary')
  .trim();

// 쓰기
document.documentElement.style.setProperty('--color-primary', '#ef4444');

// 특정 요소에 설정
element.style.setProperty('--local-var', '24px');
```

---

## calc()와 조합

```css
:root {
  --spacing: 8px;
  --columns: 3;
}

.grid-item {
  padding: calc(var(--spacing) * 2);
  width: calc(100% / var(--columns));
}
```

---

## 네이밍 컨벤션

```css
:root {
  /* 카테고리--속성--변형 */
  --color-primary: #3b82f6;
  --color-primary-light: #93c5fd;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
}
```

---

## 주의사항

- `var()`는 속성 값 위치에서만 사용 가능하다 (선택자, 속성명, 미디어 쿼리 조건에는 사용 불가)
- 유효하지 않은 값이 들어오면 해당 속성은 `unset`으로 처리된다. 상속 가능한 속성(예: `color`)은 부모 값을 상속하고, 상속 불가능한 속성(예: `width`)만 `initial` 값으로 리셋된다
- `@property`로 타입을 지정하면 애니메이션·전환이 가능하다 (브라우저 지원 확인 필요)

> 주의: `@property` 규칙은 비교적 새로운 기능으로, 구 브라우저에서는 지원되지 않을 수 있다. 사용 전 https://caniuse.com/mdn-css_at-rules_property 에서 지원 현황을 확인한다.
