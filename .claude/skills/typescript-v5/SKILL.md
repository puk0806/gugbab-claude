---
name: typescript-v5
description: TS 6.0(마지막 JS 컴파일러)·7.0(Go 네이티브) GA·7.1 베타 시대의 버전 지형과 5.x → 6.0 → 7.0 마이그레이션(tsconfig 기본값 변경·deprecated 제거·7.0 breaking change·병행 설치)
---

# TypeScript 5.x 버전별 신규 기능 (6.0 · 7.0 시대 기준)

> 소스: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html
> 소스: https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
> 소스: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
> 소스: https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/
> 검증일: 2026-11-09 (최초 2026-04-20 · 08-11 v2 · 09-28 재검증(2차) · 11-09 재검증: 7.1 베타·API 반영, 7.0 병행 설치 명령 정정)

---

## 0. 지금 어디에 서 있는가 — 버전 지형

| 버전 | 출시 | 성격 |
|------|------|------|
| 5.0 ~ 5.8 | 2023 ~ 2025 | 이 스킬 본문의 범위. 현대 TS 타입 시스템 기능 대부분이 여기서 도입됨 |
| 5.9 | 2025-08 | 5.x의 마지막. `import defer`, `--module node20`, 최소화된 `tsc --init` |
| **6.0** | **2026-03-23** | **JavaScript 기반 컴파일러의 마지막 메이저.** 새 문법보다 *deprecation + 기본값 변경*이 핵심 — 7.0으로 가는 다리 |
| **7.0** | **2026-07-08** | **Go 네이티브 컴파일러(코드명 Corsa).** 전체 빌드 기준 통상 8~12배(공칭 "약 10배") 빠름. 2026-11-09 기준 npm `latest`는 **7.0.2**(7.0 GA 빌드 그대로) |
| 7.1 (베타) | 2026-10-20 베타 | **새 프로그래매틱 API**(`typescript/sync`·`typescript/async`·`typescript/fs`·`typescript/ast` 등) + Volar식 *content mapper* 플러그인 지점. `npm install -D typescript@beta`. RC는 베타 약 한 달 뒤, 정식은 그 직후 예정(공식 날짜 미공개) |

**핵심: 5.x의 *타입 시스템* 지식은 7.0에서도 그대로 유효하다.**
공식 발표 기준 "TypeScript 6.0에서 깨끗하게 컴파일되는 코드는 사실상 7.0에서도 동일하게 컴파일된다" — 7.0은 *언어 변경*이 아니라 *컴파일러 재작성*이다. 바뀐 것은 **컴파일러 구현·tsconfig 기본값·deprecated 옵션·툴링 API**이지, `const` 타입 매개변수·`NoInfer`·`using`·타입 서술어 추론 같은 문법·타입 규칙이 아니다.

| 이 스킬에서 여전히 유효한 것 | 이 스킬 밖에서 반드시 확인할 것 |
|------|------|
| 5.0~5.9 문법·타입 규칙 전부 (아래 본문) | tsconfig 기본값 — 6.0에서 대거 변경됨 (§9-1) |
| `const` 타입 매개변수, `NoInfer`, `using`, 타입 서술어 추론 | `target`/`module`/`moduleResolution` 선택지 — 6.0 deprecated → 7.0 하드 에러 (§9-2) |
| Stage 3 데코레이터, Import Attributes(`with`) | 빌드 도구·에디터 플러그인 호환성 — 7.0은 프로그래매틱 API 미제공 (§9-4) |

> 주의: 4.x 전용 레거시 지식(4.0~4.9 기능)은 다루지 않는다. 이 스킬은 5.x 이후 + 6/7 전환을 담당한다.

---

## 9. 5.x → 6.0 → 7.0 마이그레이션

공식 권장 경로는 **건너뛰기 없이 6.0을 경유**하는 것이다. 6.0이 경고·deprecation으로 알려주는 문제를 7.0은 하드 에러로 막기 때문이다.

```
5.x  ──►  6.0 (경고로 문제 노출·수정)  ──►  7.0 (동일 설정에서 10배 빌드)
```

### 9-1. 6.0에서 바뀐 tsconfig 기본값 — 가장 먼저 확인할 것

| 옵션 | 5.x 기본 | 6.0 기본 |
|------|----------|----------|
| `strict` | `false` | **`true`** |
| `module` | `commonjs` | **`esnext`** |
| `target` | `es3`(사실상 es5 지정) | **`es2025`** (매년 현행 ES로 이동) |
| `rootDir` | 입력 파일에서 추론 | **`tsconfig.json` 디렉터리** |
| `types` | `node_modules/@types` 전부 자동 포함 | **`[]`** (빈 배열) |
| `noUncheckedSideEffectImports` | `false` | **`true`** |
| `libReplacement` | `true` | **`false`** |

**대부분의 프로젝트가 실제로 손대야 하는 두 가지:**

```jsonc
{
  "compilerOptions": {
    // 1) types 자동 포함이 사라짐 — 필요한 것을 명시
    "types": ["node", "jest"],   // 또는 과거 동작 복원: ["*"]

    // 2) 소스가 하위 디렉터리에 있으면 rootDir 명시
    "rootDir": "./src"
  }
}
```

### 9-2. 6.0 deprecated → 7.0에서 제거·하드 에러

| 항목 | 대체 |
|------|------|
| `--target es5` | ES2015 이상. ES5 산출물이 꼭 필요하면 별도 다운레벨 도구 사용 |
| `--downlevelIteration` | 없음 (ES5 전용 기능이라 함께 사라짐) |
| `--moduleResolution node`(node10) / `classic` | `nodenext` 또는 `bundler` |
| `--module amd` / `umd` / `systemjs` / `none` | `esnext` 또는 `preserve` |
| `--baseUrl` | `paths` 항목에 접두사를 직접 기입 |
| `--outFile` | 외부 번들러(Vite·esbuild·webpack) |
| `esModuleInterop: false` / `allowSyntheticDefaultImports: false` / `alwaysStrict: false` | 항상 켜진 것으로 간주 — `false` 지정 불가 |
| 임포트 `assert` 키워드 | `with` (Import Attributes) |
| 네임스페이스의 레거시 `module` 문법 | `namespace` 키워드 |

전환 기간에는 6.0에서 `"ignoreDeprecations": "6.0"`으로 경고를 유예할 수 있으나, 7.0에서는 통하지 않는다.

**7.0에서 새로 확인된 추가 breaking change (2026-09-28 재검증, 공식 발표문 원문 재대조로 확인 + 예시 보강):**

> 주의(정정): 아래 표의 "값 위치의 enum을 타입 위치에 사용" 항목은 **일반 `.ts`/`.tsx` 파일과는 무관**하다. 공식 발표문에서 이 항목은 "JavaScript Differences"(JSDoc 기반 `.js` 파일 지원 재작성) 섹션의 항목 중 하나로, **JSDoc으로 타입을 다는 순수 `.js` 파일**에만 적용된다. `.ts` 파일에서 값을 타입 위치에 쓰려면 이전부터 항상 `typeof`가 필요했으며 이는 7.0에서도 변하지 않았다. 세 번째 행("JSDoc 기반 JS 분석")과 사실상 같은 공식 섹션(같은 글머리 기호 목록)에 속한 항목이다.

| 항목 | 내용 |
|------|------|
| (JSDoc `.js` 전용) 값 위치의 enum을 타입 위치에 사용 | 6.0까지는 `/** @enum */`으로 선언한 객체를 타입 이름으로 바로 참조할 수 있었으나, 7.0부터는 더 이상 자동 인정되지 않음 — `typeof someValue`를 명시해야 함(공식 문구: "Values cannot be used where types are expected – instead, write `typeof someValue`") |
| Template Literal Types의 유니코드 처리 | 이모지 등 서로게이트 쌍을 UTF-16 코드 유닛 단위로 쪼개지 않고 코드 포인트 단위로 처리 — UTF-16 분할을 전제로 한 타입 레벨 문자열 조작(예: 일부 `Length` 유틸리티)은 깨질 수 있음 |
| JSDoc 기반 JS 분석 | `.ts` 파일 분석과 일관되도록 재작성됨. `@enum` 태그 특수 인식 제거(`@typedef`로 대체), Closure 스타일 함수 문법(`function(string): void`) 미지원 — TS 화살표 함수 표기(`(s: string) => void`)로 대체 |

**before/after 예시 — JSDoc `@enum` (6.0 → 7.0, 공식 발표문 + 공식 JSDoc 레퍼런스 문서 기반):**

```js
// 6.0까지 — 순수 .js 파일, @enum 선언 후 이름을 타입으로 직접 참조 가능
/** @enum {number} */
const JSDocState = {
  BeginningOfLine: 0,
  SawAsterisk: 1,
  SavingComments: 2,
}

/** @param {JSDocState} state */
function processState(state) { /* ... */ }
```

```js
// 7.0 — @enum 특수 인식 제거. @typedef + typeof로 대체해야 함
/** @typedef {(typeof JSDocState)[keyof typeof JSDocState]} JSDocState */
const JSDocState = {
  BeginningOfLine: 0,
  SawAsterisk: 1,
  SavingComments: 2,
}

/** @param {JSDocState} state */
function processState(state) { /* ... */ }
```

**before/after 예시 — Template Literal Types 유니코드 처리 (공식 발표문 코드 예시 그대로):**

```ts
type HeadTail<S> = S extends `${infer Head}${infer Tail}` ? [Head, Tail] : never

type Result = HeadTail<"😀abc">
// 6.0까지: ["\ud83d", "\ude00abc"]  — UTF-16 코드 유닛(서로게이트 쌍)을 쪼갬
// 7.0:     ["😀", "abc"]           — 코드 포인트 단위로 처리
```

**before/after 예시 — JSDoc Closure 스타일 함수 문법 (공식 발표문 예시 그대로):**

```js
// 6.0까지 — Closure 스타일 함수 타입 문법 인식
/** @type {function(string): void} */
let callback
```

```js
// 7.0 — Closure 스타일 미지원. TS 화살표 함수 표기로 대체
/** @type {(s: string) => void} */
let callback
```

### 9-3. `--stableTypeOrdering`

병렬 타입 체크를 하는 7.0에서는 선언 출력·진단 순서가 달라질 수 있다. 6.0에 추가된 `--stableTypeOrdering`을 켜면 7.0과 동일한 결정적 순서로 맞춰볼 수 있다.

```jsonc
{ "compilerOptions": { "stableTypeOrdering": true } }
```

> 주의: 6.0에서는 옵트인이며 코드베이스에 따라 체크 속도가 최대 약 25% 느려진다(6.0↔7.0 차이 진단 목적, 상시 사용 비권장). 7.0에서는 기본값이자 비활성화 불가다.

### 9-4. 7.0 도입 전 반드시 확인할 제약

7.0은 타입 체크 동작은 호환되지만 **프로그래매틱 API가 아직 없다**. 다음에 해당하면 6.0을 유지하거나 병행 설치한다.

- `typescript-eslint`, webpack loader 등 TS 컴파일러 API에 의존하는 툴
- Vue·Svelte·Astro·MDX·Angular 템플릿 등 임베디드 언어 지원 (Volar 계열 language service 플러그인)
- → 새 API는 **7.1에서 제공** — 2026-10-20 7.1 베타로 공개(`typescript/sync`·`typescript/async` 등 진입점, 7.0 이전 API와 *다른* 형태). 베타 단계이므로 위 툴이 7.1 API로 옮겨왔는지 각 툴 릴리즈 노트로 확인한 뒤 전환한다. content mapper(Vue·Svelte·Astro·MDX 등)는 외부 코드를 실행하므로 `tsc`에 `--runExternalCode` 플래그가 필요하다.
- 7.1 베타는 분배 조건부 타입(distributive conditional types) 검사가 더 엄격해지고 `lib.d.ts` DOM 타입이 생성 방식으로 바뀌어, 7.0에서 통과하던 코드가 에러날 수 있다.

**6.0과 7.0 병행 설치 (공식 7.0 발표문 방식):**

```bash
npm install -D typescript                                # 7.0 단독 사용 → tsc
npm install -D typescript@npm:@typescript/typescript6    # "typescript"를 6.0 호환 패키지로 → tsc6
```

두 번째 별칭을 쓰면서 7.0의 `tsc`도 함께 쓰려면 `package.json` devDependencies에 `"@typescript/native": "npm:typescript@^7.0.2"` 별칭을 하나 더 둔다(공식 발표문).

> 주의(2026-11-09 정정): `@typescript/native` 는 npm에 **실제 패키지로 존재하지 않는다**(레지스트리 404) — 공식 발표문의 `"@typescript/native": "npm:typescript@^7.0.2"` 는 *별칭 이름*이다. 이전 판의 `npm install -D @typescript/native` 는 실패한다. `tsc6` 실행 파일은 `@typescript/typescript6`(npm latest 6.0.2)가 제공한다.

### 9-5. 실전 체크리스트

1. 5.x → 5.9로 올려 경고 정리
2. 6.0 설치 → `types`·`rootDir` 명시 → deprecation 경고 0으로 수렴
3. `stableTypeOrdering: true`로 순서 의존 이슈 사전 노출
4. 툴체인이 컴파일러 API에 의존하는지 확인 (§9-4)
5. 7.0 전환 — 타입 에러가 새로 나면 대개 *6.0 기본값 미반영*이 원인이다
