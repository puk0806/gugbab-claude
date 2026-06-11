## webpack → Rsbuild 마이그레이션 요점

공식 가이드: https://rsbuild.rs/guide/migration/webpack

### 삭제 가능한 의존성 (Rsbuild 내장)

```
- css-loader, style-loader, mini-css-extract-plugin
- babel-loader, @babel/preset-env, @babel/preset-react (SWC 사용)
- postcss-loader, autoprefixer (내장)
- html-webpack-plugin (내장)
- webpack, webpack-cli, webpack-dev-server
```

### 남겨둘 수 있는 webpack 플러그인

Rsbuild는 Rspack 기반이고 Rspack은 webpack 플러그인 **대부분**을 호환한다. 커스텀 webpack 플러그인은 `tools.rspack` escape hatch로 주입:

```typescript
import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  tools: {
    rspack: (config, { appendPlugins }) => {
      appendPlugins([
        new MyCustomWebpackPlugin(),
      ]);
    },
  },
});
```

> 주의: Rsbuild는 `Rspack.devServer` 옵션을 직접 받지 않는다. devServer 설정은 Rsbuild의 `server` / `dev` 필드로 옮겨야 한다.

### Babel이 필요한 경우

styled-components, emotion 같은 Babel 플러그인이 필수라면:

```bash
npm add -D @rsbuild/plugin-babel
```

SWC가 기본이고, Babel은 보조적으로만 사용한다.

---

## Module Federation

### MF v1.5 (내장)

```typescript
export default defineConfig({
  moduleFederation: {
    options: {
      name: 'host',
      remotes: {
        remote_app: 'remote_app@http://localhost:3001/mf-manifest.json',
      },
      shared: ['react', 'react-dom'],
    },
  },
});
```

### MF v2.0 (별도 플러그인, 마이크로프론트엔드 권장)

```bash
npm add -D @module-federation/rsbuild-plugin
```

```typescript
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'remote',
      filename: 'remoteEntry.js',
      exposes: { './Button': './src/Button.tsx' },
      shared: ['react', 'react-dom'],
    }),
  ],
});
```

v2.0 추가 기능: 동적 TS 타입 힌트, Chrome DevTools 통합, Runtime 플러그인, preloading.

---

## 라이브러리 빌드: Rslib (Rsbuild ≠ tsup)

> **핵심:** Rsbuild 자체에는 라이브러리 빌드 모드가 없다. 라이브러리를 만들려면 같은 팀이 만든 **Rslib**을 쓴다.

### Rslib 포지셔닝

- Rslib은 Rsbuild 위에 얹혀 있으며 Rsbuild의 모든 설정을 그대로 쓸 수 있다.
- **Bundle 모드** (tsup/Rollup처럼 묶기) + **Bundleless 모드** (파일 구조 유지, tsc 같은 1:1 변환) 모두 지원.
- ESM / CJS / UMD 출력, declaration 파일, isolated declarations 지원.
- SCSS/Less/CSS Modules/PostCSS/Lightning CSS 등 Rsbuild의 CSS 파이프라인을 그대로 사용 → **tsup의 CSS 약점을 덮는다**.

### 언제 무엇을 쓰나

| 라이브러리 종류 | 추천 |
|-----------------|------|
| 순수 TS/JS 유틸 라이브러리 | tsup (가장 단순) 또는 Rslib |
| SCSS/CSS Modules 포함 React 컴포넌트 라이브러리 | **Rslib** (Vite lib mode도 대안) |
| webpack 플러그인 생태계 필요 라이브러리 | Rslib |
| 모노레포 내부 공유 TS 패키지 | tsup |

### Rslib 최소 예시

```bash
npm add -D @rslib/core
```

```typescript
// rslib.config.ts
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    { format: 'esm', syntax: 'es2022', dts: true },
    { format: 'cjs', syntax: 'es2022' },
  ],
  source: { entry: { index: './src/index.ts' } },
});
```

---

## 흔한 실수

### 1. Rsbuild로 라이브러리를 빌드하려 함

```
Rsbuild는 앱 빌드용. 라이브러리는 Rslib 또는 tsup.
Rsbuild로 lib 모드를 흉내내면 HTML 생성, 런타임 entry 주입 등이 끼어들어 npm 배포에 부적합한 산출물이 나온다.
```

### 2. 환경 변수 접두사를 잊음

```typescript
// .env
API_URL=https://...        // ❌ 접두사 없음 → 클라이언트에 주입 안 됨
PUBLIC_API_URL=https://... // ✅ 기본 접두사
REACT_APP_API_URL=...      // ❌ 기본값 아님. loadEnv({ prefixes: ['REACT_APP_'] }) 설정 필요
```

### 3. 타입 오류가 빌드를 막지 않는다고 착각

```
Rsbuild는 SWC 기반 → 타입 오류가 있어도 빌드가 통과한다.
CI에서 타입을 강제하려면 @rsbuild/plugin-type-check를 넣거나 별도로 tsc --noEmit를 돌린다.
```

### 4. webpack `devServer` 설정을 그대로 복붙

```typescript
// ❌ Rsbuild는 Rspack의 devServer를 직접 받지 않음
tools: {
  rspack: { devServer: { proxy: [...] } }, // 무시됨
}

// ✅ Rsbuild의 server 필드 사용
server: {
  proxy: {
    '/api': 'http://localhost:8080',
  },
}
```

### 5. Vite 플러그인을 그대로 쓰려 함

```
Rsbuild는 Vite/Rollup 플러그인과 호환되지 않는다.
webpack/Rspack 플러그인 호환이므로 vite-plugin-* 계열은 쓸 수 없다.
동등 기능의 Rsbuild 공식 플러그인이 있는지 먼저 확인한다.
```

### 6. CRA `%PUBLIC_URL%`를 그대로 두기

```html
<!-- ❌ Rsbuild는 %PUBLIC_URL%를 치환하지 않음 -->
<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />

<!-- ✅ assetPrefix 템플릿 변수 사용 -->
<link rel="icon" href="<%= assetPrefix %>/favicon.ico" />
```

### 7. 출력 디렉토리 차이를 놓침

```
CRA 기본: build/
Rsbuild 기본: dist/
→ 배포 스크립트(예: Netlify, S3 sync)가 build/를 바라보고 있으면 빌드 실패.
  output.distPath.root를 'build'로 지정하거나 배포 설정을 'dist'로 바꾼다.
```

---

## 공식 플러그인 한눈에 보기

| 카테고리 | 플러그인 |
|----------|----------|
| 프레임워크 | `@rsbuild/plugin-react`, `@rsbuild/plugin-vue`, `@rsbuild/plugin-svelte`, `@rsbuild/plugin-solid`, `@rsbuild/plugin-preact` |
| 스타일 | `@rsbuild/plugin-sass`, `@rsbuild/plugin-less`, `@rsbuild/plugin-stylus` |
| 자산 | `@rsbuild/plugin-svgr`, `@rsbuild/plugin-image-compress` |
| 품질/호환 | `@rsbuild/plugin-type-check`, `@rsbuild/plugin-check-syntax`, `@rsbuild/plugin-babel` |
| 런타임 | `@rsbuild/plugin-node-polyfill`, `@rsbuild/plugin-assets-retry`, `@rsbuild/plugin-umd` |
| 마이크로프론트엔드 | `@module-federation/rsbuild-plugin` (web-infra-dev 공식 파트너) |

---

## 참조

- Rsbuild 공식 문서: https://rsbuild.rs
- Rsbuild GitHub: https://github.com/web-infra-dev/rsbuild
- CRA 마이그레이션: https://rsbuild.rs/guide/migration/cra
- webpack 마이그레이션: https://rsbuild.rs/guide/migration/webpack
- Module Federation: https://rsbuild.rs/guide/advanced/module-federation
- Rslib (라이브러리용): https://rslib.rs
- Rspack: https://rspack.rs
