---
name: typescript-v5
description: TypeScript 5.x (5.0~5.8) 버전별 신규 기능, tsconfig 5.x 설정, React 타입 패턴, 4.x와의 차이점
---

# TypeScript 5.x 버전별 신규 기능

> 소스: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html
> 소스: https://devblogs.microsoft.com/typescript/
> 검증일: 2026-04-20

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

## 5.8: Granular Checks for Conditional Return Expressions

### 조건부 반환 표현식 세밀한 검사

`return condition ? exprA : exprB`에서 각 분기를 개별 검사한다.

```tsx
function example(x: string | number): string {
  // 5.8 이전: 전체 조건식을 string | number로 판단 → 에러
  // 5.8+: 각 분기를 개별 검사
  return typeof x === "string" ? x : String(x) // OK
}

// 실용 예시
function formatValue(value: unknown): string {
  return typeof value === "string"
    ? value        // string — OK
    : String(value) // string — OK
  // 5.8+: 양쪽 분기 모두 string이므로 통과
}
```

### require() 지원 (--module nodenext)

```tsx
// 5.8+: ESM 파일에서 CJS require() 타입 지원 개선
// --module nodenext, --moduleResolution nodenext 환경
```

---

## tsconfig 5.x 주요 설정

### 5.x에서 추가/변경된 옵션

| 옵션 | 도입 버전 | 설명 |
|------|-----------|------|
| `verbatimModuleSyntax` | 5.0 | `import type`을 강제하여 불필요한 런타임 임포트 방지 (`importsNotUsedAsValues` 대체) |
| `moduleResolution: "bundler"` | 5.0 | 번들러 환경 최적화 모듈 해석 |
| `allowImportingTsExtensions` | 5.0 | `.ts` 확장자 임포트 허용 (`noEmit` 필수) |
| `customConditions` | 5.0 | `package.json` exports의 커스텀 조건 해석 |
| `resolvePackageJsonExports` | 5.0 | `package.json` exports 필드 해석 |
| `resolvePackageJsonImports` | 5.0 | `package.json` imports 필드 해석 |
| `allowArbitraryExtensions` | 5.0 | `.css.d.ts` 등 임의 확장자 선언 파일 허용 |
| `erasableSyntaxOnly` | 5.8 | `enum`, `namespace` 등 런타임 코드 생성 구문 금지 (Node.js --strip-types 호환) |
| `rewriteRelativeImportExtensions` | 5.7 | `.ts` → `.js` 자동 변환 |

### 5.x 권장 tsconfig (React + Vite)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,

    "jsx": "react-jsx",
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,

    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
```

### 5.x 권장 tsconfig (Node.js + ESM)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "NodeNext",
    "moduleResolution": "nodenext",

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,

    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true
  },
  "include": ["src"]
}
```

---

## 4.x에서 5.x 마이그레이션 주요 변경사항

### Breaking Changes

| 변경 | 설명 | 대응 |
|------|------|------|
| `target: ES3` 삭제 | 5.0에서 ES3 타겟 제거 | `ES5` 이상으로 변경 |
| `moduleResolution: node` deprecated | `bundler` 또는 `node16`/`nodenext` 사용 권장 | tsconfig 업데이트 |
| `importsNotUsedAsValues` 제거 | `verbatimModuleSyntax`로 대체 | 마이그레이션 |
| `preserveValueImports` 제거 | `verbatimModuleSyntax`로 통합 | 마이그레이션 |
| `keyofStringsOnly` 제거 | 5.0에서 삭제 | 해당 옵션 제거 |
| `noImplicitUseStrict` 제거 | 5.0에서 삭제 | 해당 옵션 제거 |
| `suppressExcessPropertyErrors` 제거 | 5.0에서 삭제 | 코드 수정 |
| `out` 옵션 제거 | `outDir` 사용 | tsconfig 수정 |

### 타입 수준 변경

```tsx
// 4.x: enum 멤버가 리터럴 타입이 아닌 경우 있음
// 5.0+: 모든 enum 멤버가 고유한 타입으로 처리

enum Status {
  Active = 1,
  Inactive = 2
}

function check(s: Status) {
  if (s === Status.Active) {
    // 5.0+: s가 Status.Active로 좁혀짐
  }
}
```

---

## React 타입 패턴 (5.x 기준)

### verbatimModuleSyntax와 React 임포트

```tsx
// verbatimModuleSyntax: true 환경에서
import type { FC, ReactNode } from "react"  // 타입 전용 — import type 필수
import { useState, useEffect } from "react"  // 런타임 — 일반 import

// 혼합 임포트 시
import { useState, type Dispatch, type SetStateAction } from "react"
```

### @types/react 19 + TS 5.x

```tsx
// React 19 + TS 5.x에서 ref를 props로 직접 전달 (forwardRef 불필요)
interface InputProps extends React.ComponentProps<"input"> {
  label: string
}

function Input({ label, ref, ...props }: InputProps) {
  return (
    <div>
      <label>{label}</label>
      <input ref={ref} {...props} />
    </div>
  )
}

// useActionState 타입
import { useActionState } from "react"

const [state, formAction, isPending] = useActionState(
  async (prevState: FormState, formData: FormData) => {
    // 서버 액션 로직
    return { success: true }
  },
  { success: false }
)
```

### Inferred Type Predicates + React (5.5+)

```tsx
interface Item {
  id: string
  value: string | null
}

// 5.5+: filter 콜백에서 타입 자동 추론
const validItems = items.filter(item => item.value != null)
// 5.5+: Item[] (value가 non-null로 좁혀짐은 아님, 원소 자체의 존재 필터링)

// null 원소 제거에서 효과적
const values = [1, null, 2, undefined, 3].filter(v => v != null)
// 5.5+: number[]
```

---

## 언제 사용 / 언제 사용하지 않을지

### 즉시 도입 권장

| 기능 | 이유 |
|------|------|
| `const` type parameters | 호출 측 `as const` 제거, DX 향상 |
| `NoInfer<T>` | 제네릭 추론 정확도 향상 |
| `verbatimModuleSyntax` | 임포트 정리 자동화 |
| `moduleResolution: "bundler"` | 번들러 환경 정확한 해석 |
| Inferred Type Predicates | `.filter()` 타입 개선 (자동) |

### 점진적 도입 권장

| 기능 | 이유 |
|------|------|
| Stage 3 Decorators | Angular/NestJS는 `experimentalDecorators` 필요 |
| `using` / `await using` | 런타임 폴리필 필요 (Symbol.dispose), 브라우저 지원 확인 |
| Import Attributes | 번들러 지원 확인 필요 |
| `erasableSyntaxOnly` | enum → union literal 마이그레이션 선행 필요 |

---

## 흔한 실수 패턴

```tsx
// 1. Stage 3 Decorator와 experimentalDecorators 혼용
// tsconfig에 둘 다 설정하면 충돌 — 하나만 선택
{
  "experimentalDecorators": true,  // NestJS/Angular용
  // Stage 3 Decorators는 이 옵션이 false(기본)일 때 활성
}

// 2. verbatimModuleSyntax 없이 타입 임포트 혼용
import { User } from "./types"  // 런타임에 빈 임포트 남을 수 있음
import type { User } from "./types"  // 올바름

// 3. using 없이 리소스 정리 누락
// 나쁨: 수동 정리 (finally 누락 위험)
const file = openFile("data.txt")
try {
  file.read()
} finally {
  file.close()  // 빠뜨리기 쉬움
}

// 좋음: using으로 자동 정리 (5.2+)
using file = openFile("data.txt")
file.read() // 스코프 종료 시 자동 dispose

// 4. NoInfer를 모든 제네릭에 남용
// NoInfer는 추론 후보에서 "제외"하는 것 — 추론이 필요한 곳에 넣으면 안 됨
function bad<T>(a: NoInfer<T>, b: NoInfer<T>): T { ... }  // T를 추론할 곳이 없음!

// 5. rewriteRelativeImportExtensions를 emit 없이 사용
// 이 옵션은 emit을 수행할 때만 의미 있음 (noEmit: true이면 불필요)
```
