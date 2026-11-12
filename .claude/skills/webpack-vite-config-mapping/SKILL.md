---
name: webpack-vite-config-mapping
description: Webpack/Craco → Vite 설정 매핑 중 Vite 8(Rolldown·Oxc)에서 바뀐 부분 — cacheGroups→codeSplitting.groups 정규식 이식, console 제거(dropConsole이 console.error까지 제거·manualPureFunctions·build.esbuildOptions 없음·esbuild deprecated), resolve.tsconfigPaths 네이티브, 레거시 manualChunks priority 함정
---

# Webpack/Craco → Vite 설정 매핑

> 소스: https://vitejs.dev/config/ | https://vitejs.dev/guide/api-plugin | https://craco.js.org/docs/configuration/webpack/ | https://vite.dev/guide/migration
> 검증일: 2026-11-09 (11-09 재검증: Vite 8.3.6·Rolldown 1.3.0 확인, Vite 6/7 console 제거 예시의 `build.esbuildOptions` 오류를 최상위 `esbuild` 로 정정, `console.error` 유지용 `treeshake.manualPureFunctions` 추가 · 최초 작성 2026-04-20 · 08-11 Vite 8 대응 주의사항 추가 · 09-28 재검증: Vite 8.3.1 확인, 아래 매핑을 주 경로/레거시로 재정리. 상세 `codeSplitting.groups`·청크 재시도 전체 예시는 중복을 피해 `vite-advanced-splitting` 스킬로 일원화 · 09-28 실행 검증: lab 샘플 빌드로 1·2·5·6·7절 전 항목 확인, 7절에 Vite 8 네이티브 `resolve.tsconfigPaths` 옵션 보강)

> **주의 (Vite 8+):** Vite 8부터 Rolldown이 기본 번들러로 전환되며 `build.rollupOptions`는 `build.rolldownOptions`로 개명(`rollupOptions`는 deprecated alias로 하위호환 유지, 당장 깨지지 않음). `output.manualChunks` **객체 형식은 더 이상 지원되지 않음**(함수 형식은 deprecated로 계속 동작). 아래 1절의 매핑은 **Vite 8+ 주 경로**(`rolldownOptions.output.codeSplitting.groups`)를 우선 제시하고, 아직 Vite 6/7(Rollup 기반)이면 레거시 `manualChunks` 매핑을 쓴다. `codeSplitting.groups`의 필드(`name`/`test`/`priority` 등)와 함수형 패키지 자동 분할 전체 예시는 → [`vite-advanced-splitting` 스킬 1절](../vite-advanced-splitting/SKILL.md) 참조. 출처: https://vite.dev/guide/migration

> **배경:** Craco는 CRA의 webpack 설정을 커스터마이징하는 래퍼. CRA deprecated(2025-02)와 함께 Craco도 maintenance-only 상태.

---

## 이 스킬의 범위

craco.config.js 설정을 vite.config.ts로 옮길 때 **Vite 8(Rolldown·Oxc)에서 경로가 바뀐 항목과 실측 함정**만 다룬다.

> 기본 사용법(`server.proxy`·`server.https`·`define`·`import.meta.env`·top-level await 기본 지원·HtmlWebpackPlugin/MiniCssExtract 내장 등 일반 대응)은 공식 문서 수준이라 싣지 않는다.

---

## 1. cacheGroups → codeSplitting.groups(Vite 8+) / manualChunks(레거시)

- craco `cacheGroups`의 `test` 정규식은 `codeSplitting.groups`의 `test`로 거의 그대로 이식 가능(webpack `test: /[\\/]node_modules[\\/]swiper[\\/]/` → Vite `test: /node_modules[\\/]swiper[\\/]/`, 앞의 `[\\/]`만 제거). `priority`는 두 시스템 모두 숫자가 클수록 먼저 평가.
- `webpackConfig.optimization.splitChunks = {...}`를 그대로 복사할 수 없다 — `rolldownOptions.output.codeSplitting`(Vite 8+) 또는 `rollupOptions.output.manualChunks`(레거시)로 재작성.

> **주의:** `manualChunks` 객체 형식에서 존재하지 않는 패키지명을 넣으면 빌드 에러. 실제 설치된 패키지명으로 정확히 작성.
>
> **주의 (Vite 8+):** 위 객체 형식은 Vite 8+에서 **미지원**. 함수형 패키지 자동 분할 예시(deprecated로 계속 동작)와 Vite 8+ `codeSplitting.groups` 전체 필드 설명은 → [`vite-advanced-splitting` 스킬 1절](../vite-advanced-splitting/SKILL.md) 참조.

**레거시 함정 — 함수형 `manualChunks`에는 priority 개념이 없다.** 먼저 `return`하는 조건이 우선한다(`@sentry` 검사를 `node_modules` catch-all보다 앞에). Vite 8+ `codeSplitting.groups`는 `priority` 필드가 실제로 존재해 cacheGroups처럼 숫자로 우선순위를 지정할 수 있다 — 이 함정은 레거시 경로에서만 해당.

---

## 2. console 제거 (Babel `transform-remove-console` 대체)

### Vite 8+ 주 경로 — Oxc 미니파이어

```typescript
// vite.config.ts (Vite 8+) — 추가 패키지 불필요
build: {
  rolldownOptions: {
    output: {
      minify: { compress: { dropConsole: mode === 'production' } }, // console.* 전부 제거 (console.error 포함)
    },
  },
},
```

> **주의:** `dropConsole: true`는 `console.error`도 함께 제거됨(Rolldown 1.3.0 타입 정의 "discard calls to `console.*`"). Oxc `compress`에는 메서드별 옵션이 없다. `console.error`만 남기려면 `dropConsole` 대신 **입력 옵션 `treeshake.manualPureFunctions`**(terser `pure_funcs`·esbuild `pure` 동치 — 결과를 쓰지 않는 호출을 제거)를 쓴다:
>
> ```typescript
> build: {
>   rolldownOptions: {
>     treeshake: mode === 'production'
>       ? { manualPureFunctions: ['console.log', 'console.info', 'console.warn', 'console.debug'] }
>       : undefined,
>   },
> },
> ```
>
> (Rolldown 1.3.0 `InputOptions.treeshake.manualPureFunctions` 타입 정의로 확인 · 실제 빌드 결과는 미실측 — `> 주의: 미검증`)

### 레거시 (Vite 6/7) — 최상위 `esbuild`

`esbuild: { drop: mode === 'production' ? ['console'] : [] }` (console.error 유지는 `drop` 대신 `pure: ['console.log', 'console.warn', 'console.debug']`). terser 사용 시 `build.terserOptions.compress.drop_console`.

> **주의:** esbuild `drop: ['console']`은 `console.error`도 제거. 특정 메서드만 유지하려면 `pure` 옵션 사용.
>
> **주의:** `build.esbuildOptions` 라는 옵션은 없다(`esbuildOptions` 는 `optimizeDeps` 안에만 있음 — 이전 판 예시 오류 정정, 2026-11-09 Vite 8.3.6 타입 정의 확인). console 제거는 최상위 `esbuild.drop`.
>
> **주의 (Vite 8+):** 최상위 `esbuild` 옵션은 Vite 8+에서 deprecated(자동으로 `oxc` 로 변환되어 하위호환). 공식 마이그레이션 가이드상 `esbuild.drop` 은 `build.rolldownOptions.output.minify.compress.drop*` 로 대응하므로 위 "Vite 8+ 주 경로"의 `dropConsole`을 사용할 것.

---

## 3. Webpack 플러그인 대응 중 주의할 것

| Webpack 플러그인 | Vite 대응 |
|----------------|----------|
| `webpack-retry-chunk-load-plugin` | `vite:preloadError` 이벤트 리스너 (→ `vite-advanced-splitting` 스킬 3절). 브라우저 런타임 이벤트라 Vite 8+ Rolldown 전환과 무관하게 동일하게 동작 |
| `CopyWebpackPlugin` | Vite 내장 (`publicDir`) 또는 `vite-plugin-static-copy` |
| `BabelWebpackPlugin` | `@vitejs/plugin-react` (babel 옵션 포함) |

> **주의:** `HTTPS=true`는 CRA 전용 환경 변수. Vite에서는 `server.https` 객체(`key`·`cert`)로 명시. 또 Vite 앱 코드에서 `process.env`는 undefined — `import.meta.env.DEV` 등으로 바꾼다.

---

## 4. path alias (CRA `baseUrl: "src"`)

### Vite 8+ 주 경로 — `resolve.tsconfigPaths` 네이티브 옵션(플러그인 불필요)

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true }, // 기본값 false
})
```

> Vite 8.0부터 `resolve.tsconfigPaths` 옵션이 내장되어 `vite-tsconfig-paths` 플러그인 없이도 `tsconfig.json`의 `baseUrl`/`paths`를 그대로 해석한다(공식 블로그 https://vite.dev/blog/announcing-vite8 확인, 2026-09-28 실행 검증: lab 샘플에서 플러그인 제거 후 `resolve.tsconfigPaths: true`만으로 `baseUrl: "src"` alias import가 빌드 성공). 약간의 성능 비용이 있어 기본값은 `false`.

### 레거시 (Vite 6/7) — `vite-tsconfig-paths` 플러그인

`plugins: [react(), tsconfigPaths()]` — `resolve.alias` 별도 설정 불필요.

> **주의 (Vite 8+):** 플러그인 방식은 Vite 8+에서도 계속 동작하지만(2026-09-28 실행 검증으로 확인), Vite 8+ 신규 프로젝트는 위 네이티브 `resolve.tsconfigPaths` 옵션을 우선 사용할 것 — 추가 의존성이 없고 별도 안내 메시지("Vite now supports tsconfig paths resolution natively...")도 뜨지 않는다.
