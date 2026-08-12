---
name: typescript-v5
description: TypeScript 5.x (5.0~5.9) 버전별 신규 기능과 tsconfig·React 타입 패턴, 그리고 TS 6.0(마지막 JS 컴파일러)·7.0(Go 네이티브) 시대에서 5.x 지식의 유효 범위와 마이그레이션 경로
---

# TypeScript 5.x 버전별 신규 기능 (6.0 · 7.0 시대 기준)

> 소스: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html
> 소스: https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
> 소스: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
> 검증일: 2026-08-11

---

## 0. 지금 어디에 서 있는가 — 버전 지형

| 버전 | 출시 | 성격 |
|------|------|------|
| 5.0 ~ 5.8 | 2023 ~ 2025 | 이 스킬 본문의 범위. 현대 TS 타입 시스템 기능 대부분이 여기서 도입됨 |
| 5.9 | 2025-08 | 5.x의 마지막. `import defer`, `--module node20`, 최소화된 `tsc --init` |
| **6.0** | **2026-03-23** | **JavaScript 기반 컴파일러의 마지막 메이저.** 새 문법보다 *deprecation + 기본값 변경*이 핵심 — 7.0으로 가는 다리 |
| **7.0** | **2026-07-08** | **Go 네이티브 컴파일러(코드명 Corsa).** 전체 빌드 기준 통상 8~12배(공칭 "약 10배") 빠름 |

**핵심: 5.x의 *타입 시스템* 지식은 7.0에서도 그대로 유효하다.**
공식 발표 기준 "TypeScript 6.0에서 깨끗하게 컴파일되는 코드는 사실상 7.0에서도 동일하게 컴파일된다" — 7.0은 *언어 변경*이 아니라 *컴파일러 재작성*이다. 바뀐 것은 **컴파일러 구현·tsconfig 기본값·deprecated 옵션·툴링 API**이지, `const` 타입 매개변수·`NoInfer`·`using`·타입 서술어 추론 같은 문법·타입 규칙이 아니다.

| 이 스킬에서 여전히 유효한 것 | 이 스킬 밖에서 반드시 확인할 것 |
|------|------|
| 5.0~5.9 문법·타입 규칙 전부 (아래 본문) | tsconfig 기본값 — 6.0에서 대거 변경됨 (§9-1) |
| `const` 타입 매개변수, `NoInfer`, `using`, 타입 서술어 추론 | `target`/`module`/`moduleResolution` 선택지 — 6.0 deprecated → 7.0 하드 에러 (§9-2) |
| Stage 3 데코레이터, Import Attributes(`with`) | 빌드 도구·에디터 플러그인 호환성 — 7.0은 프로그래매틱 API 미제공 (§9-4) |

> 주의: 4.x 전용 레거시 지식(4.0~4.9 기능)은 짝 스킬 `frontend/typescript-v4`를 참조한다. 이 스킬은 5.x 이후 + 6/7 전환을 담당한다.

---

## 0-1. 5.9 — 5.x의 마지막 릴리즈

```tsx
// import defer — 모듈을 임포트하되 실제 사용 시점까지 평가(실행)를 지연
import defer * as heavy from "./heavy-module.js"
// heavy의 멤버에 처음 접근하는 순간 모듈 본문이 실행됨
```

> 주의: `import defer`는 `--module` 이 `preserve` 또는 `esnext` 일 때만 동작한다.

- `--module node20`: Node.js 20 동작을 고정 모델링. 계속 진화하는 `nodenext`(암묵적 `target esnext`)와 달리 `target es2023`으로 고정된다.
- `tsc --init` 산출물이 최소·처방적(prescriptive) 형태로 축소됨.

---

## 5.0: Decorators (Stage 3) & const Type Parameters

### Stage 3 Decorators

TS 5.0에서 TC39 Stage 3 Decorators를 정식 지원한다. 기존 `experimentalDecorators`와는 별개의 사양이다.

```tsx
// 새 Stage 3 Decorator — tsconfig에서 별도 플래그 불필요 (5.0+)
function logged(originalMethod: any, context: ClassMethodDecoratorContext) {
  const methodName = String(context.name)
  function replacementMethod(this: any, ...args: any[]) {
    console.log(`LOG: Entering method '${methodName}'.`)
    const result = originalMethod.call(this, ...args)
    console.log(`LOG: Exiting method '${methodName}'.`)
    return result
  }
  return replacementMethod
}

class Person {
  name: string
  constructor(name: string) {
    this.name = name
  }

  @logged
  greet() {
    console.log(`Hello, my name is ${this.name}.`)
  }
}
```

**Stage 3 vs experimentalDecorators 차이:**

| 항목 | Stage 3 (5.0+) | experimentalDecorators |
|------|----------------|----------------------|
| 활성화 | 기본 활성 | `"experimentalDecorators": true` 필요 |
| 메타데이터 | `context` 매개변수로 접근 | `reflect-metadata` 필요 |
| 호환성 | TC39 표준 | 레거시 (Angular, NestJS 등) |
| 매개변수 데코레이터 | 미지원 | 지원 |

> 주의: Angular, NestJS 등 기존 프레임워크는 여전히 `experimentalDecorators`를 사용한다. 마이그레이션 시 주의 필요.

### const Type Parameters

제네릭 매개변수에 `const` 수식어를 추가하면 인수를 `as const`로 추론한다.

```tsx
// 5.0 이전: as const를 호출 측에서 명시해야 함
declare function getRoutes<T extends readonly string[]>(routes: T): T
const r1 = getRoutes(["home", "about"] as const) // readonly ["home", "about"]

// 5.0+: const type parameter
declare function getRoutes<const T extends readonly string[]>(routes: T): T
const r2 = getRoutes(["home", "about"]) // readonly ["home", "about"] — as const 불필요
```

### enum / namespace 개선

- 모든 `enum` 멤버가 computed 값일 때도 union 타입으로 처리
- `namespace` 내 `export` 없이도 타입 참조 가능 (합리적인 케이스에서)

---

## 5.1: Getter/Setter 타입 분리 & JSX 개선

### 서로 다른 타입의 Getter/Setter

```tsx
class Box {
  #value: number = 0

  // getter는 number 반환
  get value(): number {
    return this.#value
  }

  // setter는 string | number 수용
  set value(newValue: string | number) {
    this.#value = typeof newValue === "string" ? parseInt(newValue) : newValue
  }
}
```

### 반환 타입이 undefined인 함수 허용

```tsx
// 5.1+: 반환 타입이 undefined이면 return 문 생략 가능
function doSomething(): undefined {
  // return 없어도 에러 아님
}
```

### JSX 개선

- JSX 태그의 반환 타입 범위 확장 (React.ReactNode 외 타입 가능)
- 네임스페이스 JSX 속성 지원 (`<Foo a:b="value" />`)

---

## 5.2: using / await using (Explicit Resource Management)

TC39 Stage 3 Explicit Resource Management를 지원한다. `Symbol.dispose` / `Symbol.asyncDispose`로 리소스 정리를 자동화한다.

```tsx
// using: 동기 리소스 정리
function readFile() {
  using file = openFile("data.txt") // Symbol.dispose 호출됨
  // 스코프 종료 시 file[Symbol.dispose]() 자동 호출
  return file.read()
}

// await using: 비동기 리소스 정리
async function connectDB() {
  await using connection = await getConnection()
  // 스코프 종료 시 connection[Symbol.asyncDispose]() 자동 await 호출
  return connection.query("SELECT ...")
}

// DisposableStack: 여러 리소스 일괄 관리
function processFiles() {
  using stack = new DisposableStack()
  const file1 = stack.use(openFile("a.txt"))
  const file2 = stack.use(openFile("b.txt"))
  // 스코프 종료 시 역순으로 dispose
}
```

**Disposable 인터페이스 구현:**

```tsx
class TempFile implements Disposable {
  #path: string
  constructor(path: string) {
    this.#path = path
  }
  [Symbol.dispose]() {
    // 정리 로직: 임시 파일 삭제 등
    fs.unlinkSync(this.#path)
  }
}
```

### Decorator Metadata

데코레이터에서 `context.metadata`를 통해 메타데이터를 읽고 쓸 수 있다.

```tsx
const validators: Map<symbol, { key: string; fn: (v: any) => boolean }[]> = new Map()

function validate(fn: (v: any) => boolean) {
  return function (target: any, context: ClassFieldDecoratorContext) {
    // context.metadata를 통해 메타데이터 기록
  }
}
```

---

## 5.3: Import Attributes & switch(true) Narrowing

### Import Attributes

```tsx
// JSON 모듈 임포트 시 타입 명시
import data from "./data.json" with { type: "json" }

// 동적 임포트
const config = await import("./config.json", { with: { type: "json" } })
```

> 주의: 이전 `assert` 구문은 deprecated — `with` 키워드 사용.

### switch(true) Narrowing

```tsx
function classify(x: string | number | boolean) {
  switch (true) {
    case typeof x === "string":
      // x: string으로 좁혀짐
      return x.toUpperCase()
    case typeof x === "number":
      // x: number로 좁혀짐
      return x.toFixed(2)
    default:
      // x: boolean으로 좁혀짐
      return !x
  }
}
```

### Interactive Inlay Hints (에디터)

- 인레이 힌트를 통해 추론된 타입을 빠르게 확인 가능

---

## 5.4: NoInfer & Preserved Narrowing in Closures

### NoInfer<T>

제네릭 추론에서 특정 위치를 추론 후보에서 제외한다.

```tsx
// 5.4 이전: defaultValue가 T 추론에 영향
function createSignal<T>(value: T, defaultValue: T): T { ... }
createSignal("hello", 42) // T: string | number — 의도와 다름

// 5.4+: NoInfer로 추론 차단
function createSignal<T>(value: T, defaultValue: NoInfer<T>): T { ... }
createSignal("hello", 42)  // 에러! number는 string에 할당 불가
createSignal("hello", "world") // OK, T: string
```

**실용 패턴:**

```tsx
// 이벤트 핸들러에서 타입 추론 제어
function on<T extends string>(
  event: T,
  callback: (data: NoInfer<EventMap[T]>) => void
): void { ... }

// 기본값 패턴
function withDefault<T>(items: T[], fallback: NoInfer<T>): T[] {
  return items.length > 0 ? items : [fallback]
}
```

### Preserved Narrowing in Closures

클로저 내에서 마지막 할당 이후 좁혀진 타입이 보존된다.

```tsx
function getUrls(url: string | URL) {
  if (typeof url === "string") {
    // 5.4 이전: 클로저 안에서 url이 string | URL로 돌아감
    // 5.4+: url이 string으로 유지됨
    const handler = () => {
      url // string (보존!)
    }
  }
}
```

---

## 5.5: Inferred Type Predicates & RegExp Syntax Checking

### Inferred Type Predicates

TS 5.5부터 함수 본문을 분석하여 타입 가드를 자동 추론한다.

```tsx
// 5.5 이전: 명시적 타입 가드 필요
function isNumber(x: unknown): x is number {
  return typeof x === "number"
}

// 5.5+: 자동 추론됨 (반환 타입에 x is number가 자동 추론)
function isNumber(x: unknown) {
  return typeof x === "number"
  // 추론된 반환 타입: x is number
}

// 배열 필터에서 실용적 효과
const nums = [1, null, 2, undefined, 3].filter(x => x != null)
// 5.5 이전: (number | null | undefined)[]
// 5.5+: number[] — 자동 추론!
```

### Regular Expression Syntax Checking

정규식 리터럴에 대해 문법 오류를 컴파일 타임에 검사한다.

```tsx
// 5.5+: 정규식 문법 에러 감지
const re = /(?<name>\w+) \k<naem>/  // 에러: 존재하지 않는 그룹 참조
const re2 = /[a-Z]/                  // 에러: 잘못된 범위
```

---

## 5.6: Disallowed Nullish and Truthy Checks

### 항상 truthy/nullish인 표현식 검사

```tsx
function check(x: string) {
  // 5.6+: 에러! string은 항상 truthy가 아닐 수 있지만,
  // 함수 참조는 항상 truthy
  if (check) {  // 에러: 함수는 항상 truthy
    // ...
  }
}

// nullish 검사
function process(x: string) {
  if (x ?? true) {  // 경고: 항상 truthy
    // ...
  }
}
```

### Iterator Helper Methods 타입

`Iterator.prototype.map()`, `.filter()`, `.take()` 등 새로운 이터레이터 헬퍼 메서드의 타입을 지원한다.

---

## 5.7: Relative Path Rewriting & Never-Initialized Variables

### --rewriteRelativeImportExtensions

`.ts` 확장자로 임포트하면 출력 시 자동으로 `.js`로 변환한다.

```tsx
// 소스 코드 (index.ts)
import { helper } from "./utils.ts"  // .ts 확장자 사용 가능

// 출력 (index.js) — 자동 변환
import { helper } from "./utils.js"
```

**tsconfig 설정:**
```json
{
  "compilerOptions": {
    "rewriteRelativeImportExtensions": true
  }
}
```

### 초기화되지 않은 변수 검사 강화

```tsx
let x: number
console.log(x) // 5.7+: 에러! 변수 'x'가 할당되기 전에 사용됨

// 조건부 초기화도 감지
let result: string
if (condition) {
  result = "yes"
}
console.log(result) // 에러: 모든 경로에서 초기화되지 않음
```

### 경로 이동 지원 (Path Completions)

- `.ts` 확장자 기반 경로 자동 완성 지원 개선

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
| 임포트 `assert` 키워드 | `with` (Import Attributes, §5.3 참조) |
| 네임스페이스의 레거시 `module` 문법 | `namespace` 키워드 |

전환 기간에는 6.0에서 `"ignoreDeprecations": "6.0"`으로 경고를 유예할 수 있으나, 7.0에서는 통하지 않는다.

### 9-3. `--stableTypeOrdering`

병렬 타입 체크를 하는 7.0에서는 선언 출력·진단 순서가 달라질 수 있다. 6.0에 추가된 `--stableTypeOrdering`을 켜면 7.0과 동일한 결정적 순서로 맞춰볼 수 있다.

```jsonc
{ "compilerOptions": { "stableTypeOrdering": true } }
```

> 주의: 6.0에서는 옵트인이며 체크 속도가 약 25% 느려진다(진단 목적). 7.0에서는 기본값이자 비활성화 불가다.

### 9-4. 7.0 도입 전 반드시 확인할 제약

7.0은 타입 체크 동작은 호환되지만 **프로그래매틱 API가 아직 없다**. 다음에 해당하면 6.0을 유지하거나 병행 설치한다.

- `typescript-eslint`, webpack loader 등 TS 컴파일러 API에 의존하는 툴
- Vue·Svelte·Astro·MDX·Angular 템플릿 등 임베디드 언어 지원 (Volar 계열 language service 플러그인)
- → API는 7.1에서 제공 예정

**6.0과 7.0 병행 설치:**

```bash
npm install -D typescript@npm:@typescript/typescript6   # tsc6 로 6.0 실행
npm install -D @typescript/native                       # tsc 로 7.0 실행
```

### 9-5. 실전 체크리스트

1. 5.x → 5.9로 올려 경고 정리
2. 6.0 설치 → `types`·`rootDir` 명시 → deprecation 경고 0으로 수렴
3. `stableTypeOrdering: true`로 순서 의존 이슈 사전 노출
4. 툴체인이 컴파일러 API에 의존하는지 확인 (§9-4)
5. 7.0 전환 — 타입 에러가 새로 나면 대개 *6.0 기본값 미반영*이 원인이다

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
