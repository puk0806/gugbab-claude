---
name: design-token-scss
description: 디자인 토큰 3계층 설계, Figma 토큰 추출, Style Dictionary v4 SCSS/CSS 변환, 테마 전환 패턴
---

# Design Token + SCSS 시스템

> 소스: https://styledictionary.com/ | https://sass-lang.com/documentation/ | https://tr.designtokens.org/format/ | https://docs.tokens.studio/
> 검증일: 2026-04-17

---

## 1. 디자인 토큰 3계층 구조

> 주의: Primitive/Semantic/Component 3계층은 W3C DTCG 공식 용어가 아닌 업계 통용 패턴이다. DTCG 스펙은 `$value`, `$type`만 정의한다.

```
Primitive (Global) → Semantic (Alias) → Component
────────────────    ──────────────────    ─────────
blue-500: #3b82f6   color-primary: {blue-500}   button-bg: {color-primary}
gray-100: #f3f4f6   color-surface: {gray-100}   card-bg: {color-surface}
16px                 spacing-md: {16px}          button-padding: {spacing-md}
```

**Primitive:** 색상 팔레트, 타이포그래피 스케일, 간격 스케일 등 raw 값. 의미(semantic)를 부여하지 않는다.

**Semantic:** 용도별 별칭(alias). 테마 전환 시 이 계층에서 값을 교체한다.

**Component:** 특정 컴포넌트에 바인딩된 토큰. 선택적 계층으로, 소규모 시스템에서는 Semantic까지만 사용해도 충분하다.

### DTCG 포맷 (Style Dictionary v4 호환)

```json
{
  "color": {
    "primitive": {
      "blue-500": { "$value": "#3b82f6", "$type": "color" },
      "blue-700": { "$value": "#1d4ed8", "$type": "color" }
    },
    "semantic": {
      "primary": { "$value": "{color.primitive.blue-500}", "$type": "color" },
      "primary-hover": { "$value": "{color.primitive.blue-700}", "$type": "color" }
    },
    "component": {
      "button-bg": { "$value": "{color.semantic.primary}", "$type": "color" },
      "button-bg-hover": { "$value": "{color.semantic.primary-hover}", "$type": "color" }
    }
  }
}
```

---

## 2. Figma 토큰 추출 방법

### 방법 A: Tokens Studio (구 Figma Tokens) 플러그인

Figma에서 토큰을 직접 관리하고 JSON으로 내보내는 플러그인.

```
Tokens Studio → Export → Style Dictionary 호환 JSON
```

- Style Dictionary 호환 JSON 포맷으로 직접 내보내기 가능
- GitHub/GitLab 연동으로 토큰 JSON을 자동 커밋
- 무료 버전에서도 기본 Export 가능, Pro에서 멀티파일/테마 지원

**워크플로우:**
1. Figma에서 Tokens Studio 플러그인으로 토큰 정의
2. GitHub 저장소에 토큰 JSON 자동 동기화
3. CI에서 Style Dictionary로 SCSS/CSS 빌드
4. 빌드 산출물을 패키지로 배포

### 방법 B: Figma Variables + REST API

Figma Variables(네이티브 기능)를 REST API로 추출.

```bash
# Figma REST API로 변수 추출
curl -H "X-FIGMA-TOKEN: ${FIGMA_TOKEN}" \
  "https://api.figma.com/v1/files/${FILE_KEY}/variables/local"
```

> 주의: Figma Variables REST API는 Enterprise plan에서만 사용 가능하다. Professional 이하 plan에서는 접근 불가.

**API 응답을 Style Dictionary JSON으로 변환하는 스크립트가 필요하다.** Figma API 응답 구조는 Style Dictionary 포맷과 다르므로 변환 레이어를 작성해야 한다.

### 선택 기준

| 기준 | Tokens Studio | Figma Variables + API |
|------|---------------|----------------------|
| 설정 난이도 | 낮음 (플러그인 설치) | 높음 (변환 스크립트 필요) |
| Figma 네이티브 통합 | 별도 플러그인 | 네이티브 |
| SD 호환성 | 직접 호환 | 변환 필요 |
| 팀 협업 | GitHub 연동 | API 자동화 |
| 비용 | 무료/Pro | Professional plan 이상 |

---

## 3. Style Dictionary v4 설정 (SCSS/CSS 변환)

### 기본 설정 (`sd.config.mjs`)

Style Dictionary v4는 ESM 기반 설정 파일을 사용한다.

```js
// sd.config.mjs
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({
  source: ['tokens/**/*.json'],
  platforms: {
    scss: {
      transformGroup: 'scss',
      buildPath: 'build/scss/',
      files: [
        {
          destination: '_variables.scss',
          format: 'scss/variables',
        },
        {
          destination: '_map.scss',
          format: 'scss/map-deep',
        },
      ],
    },
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();
```

### v4 주요 변경점 (v3에서 마이그레이션 시)

| v3 | v4 |
|----|----|
| `config.json` 또는 `config.js` | `sd.config.mjs` (ESM) |
| `StyleDictionary.registerTransform()` | `hooks.transforms` 객체에 정의 |
| `StyleDictionary.registerFormat()` | `hooks.formats` 객체에 정의 |
| `value` 키 | `$value` 키 (DTCG 호환) |
| `type` 키 | `$type` 키 (DTCG 호환) |
| `StyleDictionary.extend(config).buildAllPlatforms()` | `new StyleDictionary(config)` + `await sd.buildAllPlatforms()` |

### 커스텀 변환 예시 (v4 hooks API)

```js
// sd.config.mjs
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({
  hooks: {
    transforms: {
      'size/pxToRem': {
        type: 'value',
        filter: (token) => token.$type === 'dimension',
        transform: (token) => {
          const val = parseFloat(token.$value);
          return `${val / 16}rem`;
        },
      },
    },
  },
  source: ['tokens/**/*.json'],
  platforms: {
    scss: {
      transforms: ['attribute/cti', 'name/kebab', 'size/pxToRem'],
      buildPath: 'build/scss/',
      files: [
        { destination: '_variables.scss', format: 'scss/variables' },
      ],
    },
  },
});

await sd.buildAllPlatforms();
```

### 빌드 산출물 예시

```scss
// build/scss/_variables.scss (scss/variables 포맷)
$color-primitive-blue-500: #3b82f6;
$color-semantic-primary: #3b82f6;
$spacing-md: 1rem;
```

```css
/* build/css/variables.css (css/variables 포맷) */
:root {
  --color-primitive-blue-500: #3b82f6;
  --color-semantic-primary: #3b82f6;
  --spacing-md: 1rem;
}
```

---

## 4. SCSS 변수 vs CSS Custom Properties 선택 기준

| 기준 | SCSS 변수 (`$var`) | CSS Custom Properties (`--var`) |
|------|--------------------|---------------------------------|
| 평가 시점 | **컴파일 타임** | **런타임** |
| 테마 전환 | 불가 (빌드 시 고정) | 가능 (JS/클래스로 동적 변경) |
| 조건 분기 | `@if`/`@each` 등 SCSS 로직 | 미디어 쿼리 / 클래스 스코프 |
| 번들 크기 | 사용된 곳에 값이 인라인됨 | 변수 선언 1회 + 참조 |
| 폴백 | 불필요 (컴파일 시 해결) | `var(--x, fallback)` 가능 |
| JS 접근 | 불가 | `getComputedStyle` / `setProperty` |

### 권장 전략: 하이브리드

```scss
// _tokens.scss — SCSS 변수로 정적 값 정의 (컴파일 타임 로직용)
$color-primary: #3b82f6;
$spacing-md: 16px;
$breakpoint-md: 768px; // 미디어 쿼리에는 SCSS 변수만 사용 가능

// _theme.scss — CSS Custom Properties로 런타임 테마용 노출
:root {
  --color-primary: #{$color-primary};
  --spacing-md: #{$spacing-md};
}

// 컴포넌트에서 사용
.button {
  // 런타임 테마가 필요한 속성 → CSS Custom Property
  background: var(--color-primary);
  color: var(--color-text);

  // 정적 레이아웃 → SCSS 변수 직접 사용도 가능
  padding: $spacing-md;

  // 미디어 쿼리 조건 → SCSS 변수 필수 (CSS 변수 사용 불가)
  @media (min-width: $breakpoint-md) {
    padding: $spacing-md * 1.5;
  }
}
```

**핵심 규칙:**
- 미디어 쿼리 조건에는 SCSS 변수만 사용 (CSS Custom Properties는 미디어 쿼리 조건에 사용 불가)
- 테마 전환이 필요한 시각적 속성(색상, 그림자 등)은 CSS Custom Properties
- 컴파일 타임 계산/반복(`@each`, `@if`, `math.div`)은 SCSS 변수

---

## 5. SCSS Maps를 이용한 토큰 관리

### 기본 패턴

```scss
@use 'sass:map';

$colors: (
  'primary': #3b82f6,
  'primary-hover': #2563eb,
  'secondary': #8b5cf6,
  'error': #ef4444,
  'success': #22c55e,
);

$spacing: (
  'xs': 4px,
  'sm': 8px,
  'md': 16px,
  'lg': 24px,
  'xl': 32px,
);

// 유틸리티 함수로 접근
@function color($key) {
  @if not map.has-key($colors, $key) {
    @error "색상 '#{$key}'가 $colors 맵에 존재하지 않습니다.";
  }
  @return map.get($colors, $key);
}

@function spacing($key) {
  @if not map.has-key($spacing, $key) {
    @error "간격 '#{$key}'가 $spacing 맵에 존재하지 않습니다.";
  }
  @return map.get($spacing, $key);
}

// 사용
.card {
  background: color('primary');
  padding: spacing('md');
}
```

### CSS Custom Properties 자동 생성

```scss
@use 'sass:map';

// SCSS map에서 CSS Custom Properties 일괄 생성
@mixin generate-css-vars($map, $prefix) {
  @each $key, $value in $map {
    --#{$prefix}-#{$key}: #{$value};
  }
}

:root {
  @include generate-css-vars($colors, 'color');
  @include generate-css-vars($spacing, 'spacing');
}

// 출력:
// :root {
//   --color-primary: #3b82f6;
//   --color-primary-hover: #2563eb;
//   --spacing-xs: 4px;
//   --spacing-sm: 8px;
//   ...
// }
```

### Nested Map (Style Dictionary `scss/map-deep` 산출물 활용)

```scss
@use 'sass:map';

// Style Dictionary의 scss/map-deep 포맷 산출물
$tokens: (
  'color': (
    'primitive': (
      'blue-500': #3b82f6,
      'gray-100': #f3f4f6,
    ),
    'semantic': (
      'primary': #3b82f6,
      'surface': #f3f4f6,
    ),
  ),
  'spacing': (
    'md': 16px,
    'lg': 24px,
  ),
);

// deep-get 유틸리티
@function token($keys...) {
  $result: $tokens;
  @each $key in $keys {
    $result: map.get($result, $key);
  }
  @return $result;
}

// 사용
.card {
  background: token('color', 'semantic', 'surface');
  padding: token('spacing', 'md');
}
```

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
