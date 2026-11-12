---
name: vite-advanced-splitting
description: Vite 8 Rolldown 전환 후 코드 스플리팅 — rolldownOptions 개명, manualChunks 객체 미지원·함수 deprecated → codeSplitting.groups(test·name 함수·priority) 이전과 함정, vite:preloadError 공식 동작·HTML no-cache 조건
---

# Vite 고급 코드 스플리팅 & 빌드 자동화

> 소스: https://vitejs.dev/config/build-options | https://vitejs.dev/guide/api-plugin | https://vitejs.dev/guide/build | https://vite.dev/guide/migration | https://rolldown.rs/reference/OutputOptions.codeSplitting
> 검증일: 2026-11-09 (최초 작성 2026-04-20 · 09-28 `codeSplitting.groups` 주 경로로 재작성 · 11-09 재검증: Vite 8.3.6·Rolldown 1.3.0 확인, `groups[].test`가 문자열·정규식·함수 모두 받는 것으로 정정)

> **버전 분기:** Vite 8부터 Rolldown이 기본 번들러로 전환되며 `build.rollupOptions`는 `build.rolldownOptions`로 개명(`rollupOptions`는 deprecated alias로 하위호환 유지, 당장 깨지지 않음). `output.manualChunks`는 **객체 형식 미지원**, 함수 형식은 **deprecated로만 동작**. 신규 프로젝트·Vite 8+ 환경은 아래 "Vite 8+ 주 경로"(`codeSplitting.groups`)를 쓰고, 아직 Vite 6/7(Rollup 기반)을 유지 중이면 "레거시" 절의 `manualChunks`를 그대로 쓴다. 출처: https://vite.dev/guide/migration

---

## 이 스킬의 범위

Vite 8(Rolldown)에서 바뀐 청크 분할 설정과 그 함정, `vite:preloadError` 공식 동작만 다룬다.

> 기본 사용법(`loadEnv`·mode 분리 빌드·`transformIndexHtml`·플러그인 훅 순서·`React.lazy` 라우트 분할·파일명 패턴)은 공식 문서 수준이라 싣지 않는다.

---

## 1. Vite 8+ 주 경로 — `rolldownOptions.output.codeSplitting`

```typescript
// vite.config.ts (Vite 8+)
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // priority 숫자가 클수록 먼저 평가됨 (먼저 매칭되는 그룹이 우선 배정)
            { name: 'common-react-dom', test: /node_modules[\\/](react|react-dom|react-router-dom)[\\/]/, priority: 30 },
            { name: 'vendors-mui', test: /node_modules[\\/](@mui|@emotion)[\\/]/, priority: 20 },
            // test 없이 마지막에 두면 나머지 node_modules를 모두 흡수하는 catch-all
            { name: 'vendor', test: /node_modules/ },
          ],
        },
      },
    },
  },
})
```

> `groups` 각 항목: `name`(청크명, 문자열 또는 함수 `(moduleId, ctx) => string | null`) · `test`(문자열 = id 포함 여부, 정규식 = id 매칭, 함수 `(id) => boolean`, 생략 = 모든 모듈) · `priority`(숫자가 클수록 먼저 평가, 기본 0, 같으면 배열 앞쪽 우선) · `minSize`/`maxSize`/`minModuleSize`/`maxModuleSize`/`minShareCount`(크기·공유 기준 세부 제어, 미달 시 그룹 무시). 경로 구분자는 윈도우 대비 `/` 대신 `[\\/]`로 쓴다(공식 권장). 출처: https://rolldown.rs/reference/OutputOptions.codeSplitting (Rolldown 1.3.0 타입 정의로 확인, 2026-11-09)

구 함수형 `manualChunks`처럼 패키지명을 파싱해 동적으로 청크명을 정하는 로직은 **`name` 함수**로 옮긴다 — `test`로 대상 모듈을 고르고 `name`이 청크명을 돌려준다.

```typescript
{
  name: (id) => id.match(/node_modules[\\/](lf-[^\\/]+-api-client)[\\/]/)?.[1] ?? null,
  test: /node_modules[\\/]lf-[^\\/]+-api-client[\\/]/,
  priority: 25,
}
```

> 주의: `test`·`name` 함수는 Rolldown이 모듈마다 정해진 순서로 호출한다 — `test`가 쓴 "현재 모듈" 같은 바깥 변수를 `name`에서 읽지 말 것(마지막 모듈 값이 남는다). 상태가 필요하면 모듈 id 를 키로 저장한다.

같은 `rolldownOptions.output` 아래로 옮겨진 것: `chunkFileNames`·`entryFileNames`·`assetFileNames`(옵션명 동일), console 제거 `minify: { compress: { dropConsole: true } }`(→ `webpack-vite-config-mapping` 2절). 분리 빌드의 `input`도 `rolldownOptions.input`.

---

## 2. 레거시 (Vite 6/7, Rollup 기반) — `manualChunks`

> **주의 (Vite 8+):** 아래 방식은 Vite 8에서 객체 형식 **미지원**, 함수 형식은 **deprecated**(당장 동작은 하나 신규 작성 금지). 신규 프로젝트는 위 "Vite 8+ 주 경로"를 사용할 것 — 이 절은 기존 Vite 6/7 프로젝트를 마이그레이션 전까지 유지 보수하는 용도로만 참고한다.

- 위치: `build.rollupOptions.output.manualChunks`. 객체(`{ 'react-vendor': ['react', 'react-dom'] }`) 또는 함수(`(id) => string | undefined`).
- 함수형에서 scoped 패키지(`@org/pkg`)는 `id.split('/node_modules/')` 마지막 조각의 앞 두 세그먼트로 이름을 뽑는다. 앱 코드 분기는 `return` 없이 통과시킨다.
- 이전 매핑: 객체 형식 → `groups`의 `{ name, test }` 항목, 함수 형식 분기 → `name` 함수 + `test` (1절).

---

## 3. 청크 로드 실패 재시도 (`vite:preloadError`)

webpack의 `webpack-retry-chunk-load-plugin` 대체. `window.addEventListener('vite:preloadError', ...)`에서 `event.preventDefault()` 후 재시도 횟수를 쿼리(`_retry`)로 실어 새로고침하는 방식이 일반적이다(무한 새로고침 방지를 위해 상한을 둔다).

> 공식 문서 보충 (2026-11-09 확인): `event.payload`에 원래 import 에러가 들어 있고, `event.preventDefault()`를 부르면 에러가 throw 되지 않는다. 새 배포 후 구 청크 404 대응이 목적이면 **HTML 에 `Cache-Control: no-cache`** 를 걸어야 한다(아니면 새로고침해도 옛 자산을 참조). 재시도 가능한 모듈 로딩을 지원하는 브라우저에선 새로고침 없이 같은 dynamic import 를 다시 시도할 수 있고, 구형 브라우저는 실패를 모듈 맵에 캐시하므로 새로고침이 필요하다. 출처: https://vite.dev/guide/build#load-error-handling

---

## 4. 흔한 실수

| 실수 | 바른 처리 |
|------|----------|
| Vite 8에서 `manualChunks` 객체 형식 사용 | 미지원 — `codeSplitting.groups` |
| Vite 8 신규 코드에 함수형 `manualChunks`·`rollupOptions` | deprecated alias — `rolldownOptions` + `groups` |
| 그룹 `test`(또는 `manualChunks`)로 앱 내부 파일(`src/pages`) 강제 분할 | circular dependency 위험 — node_modules만 타겟, 앱 코드는 `React.lazy` 라우트 분할 |
| `test`에서 쓴 바깥 변수를 `name`에서 읽음 | 마지막 모듈 값이 남음 — 모듈 id 키로 저장 |
| 경로 구분자를 `/`로만 작성 | 윈도우 빌드 누락 — `[\\/]` |
| preloadError 새로고침만 넣고 HTML 캐시 방치 | HTML `Cache-Control: no-cache` |
| postbuild 파일 복사를 `writeBundle`에서 | 모든 번들 작업 완료 후인 `closeBundle`에서 |
