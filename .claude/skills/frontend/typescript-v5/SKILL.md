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

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
