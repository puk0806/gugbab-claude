---
name: typescript-v4
description: TypeScript 4.x (4.0~4.9) 버전별 핵심 기능, 타입 시스템 고급 패턴, tsconfig 설정 가이드
---

# TypeScript 4.x 핵심 기능 가이드

> 소스: https://www.typescriptlang.org/docs/handbook/release-notes/overview.html
> 검증일: 2026-04-20

---

## 버전별 주요 기능 요약

| 버전 | 핵심 기능 |
|------|-----------|
| 4.0 | Variadic Tuple Types, Labeled Tuple Elements |
| 4.1 | Template Literal Types, Key Remapping in Mapped Types |
| 4.2 | Abstract Construct Signatures, Leading/Middle Rest Elements |
| 4.3 | `override` 키워드, Static Index Signatures |
| 4.4 | Control Flow Analysis 개선 (aliased conditions) |
| 4.5 | `Awaited` 유틸리티 타입, Tail-Recursion 조건부 타입 최적화 |
| 4.6 | Destructured Discriminated Unions CFA |
| 4.7 | `node16`/`nodenext` moduleResolution, Instantiation Expressions |
| 4.8 | Intersection Reduction 개선, `{}` 타입 좁히기 |
| 4.9 | `satisfies` 연산자, Auto-Accessors (Stage 3) |

---

## 4.0: Variadic Tuple Types

튜플 타입에 스프레드를 사용하여 가변 길이 튜플을 합성할 수 있다.

```typescript
type Concat<T extends unknown[], U extends unknown[]> = [...T, ...U]

type Result = Concat<[1, 2], [3, 4]>  // [1, 2, 3, 4]

// 실용 패턴: 함수 파라미터 합성
function concat<T extends unknown[], U extends unknown[]>(
  a: [...T], b: [...U]
): [...T, ...U] {
  return [...a, ...b] as [...T, ...U]
}
```

### Labeled Tuple Elements

튜플 요소에 이름을 부여하여 가독성을 높인다.

```typescript
// 이전: 의미 불명확
type Range = [number, number]

// 4.0+: 이름 부여
type Range = [start: number, end: number]

// 선택적 요소에도 적용
type Config = [host: string, port: number, secure?: boolean]
```

---

## 4.1: Template Literal Types

문자열 리터럴 타입을 템플릿으로 조합한다.

```typescript
type EventName = 'click' | 'focus' | 'blur'
type Handler = `on${Capitalize<EventName>}`  // 'onClick' | 'onFocus' | 'onBlur'

// 내장 문자열 유틸리티 타입 (4.1+)
type Upper = Uppercase<'hello'>      // 'HELLO'
type Lower = Lowercase<'HELLO'>      // 'hello'
type Cap   = Capitalize<'hello'>     // 'Hello'
type Uncap = Uncapitalize<'Hello'>   // 'hello'

// 실용 패턴: CSS 프로퍼티 타입
type CSSUnit = 'px' | 'em' | 'rem' | '%'
type CSSValue = `${number}${CSSUnit}`  // '16px', '1.5rem' 등
```

### Key Remapping in Mapped Types

`as` 절로 매핑 시 키를 변환한다.

```typescript
interface User {
  name: string
  age: number
  email: string
}

// getter 메서드 타입 생성
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

type UserGetters = Getters<User>
// { getName: () => string; getAge: () => number; getEmail: () => string }

// 특정 키 필터링
type RemoveKind<T> = {
  [K in keyof T as Exclude<K, 'kind'>]: T[K]
}
```

---

## 4.2: Abstract Construct Signatures

추상 클래스를 인자로 받는 팩토리 함수를 타입 안전하게 작성한다.

```typescript
// 4.2 이전: abstract 클래스를 new로 인스턴스화 불가 에러
// 4.2+: abstract construct signature
function create<T>(Ctor: abstract new () => T): T {
  // 직접 인스턴스화는 불가하지만 서브클래스는 가능
  return new (Ctor as new () => T)()
}
```

### Leading / Middle Rest Elements

튜플에서 rest 요소를 앞이나 중간에 배치할 수 있다.

```typescript
// 마지막 요소가 고정, 앞은 가변
type Strings = [...string[], boolean]
// ['a', 'b', true] ✅
// [true]           ✅
// ['a', 'b']       ❌

// 중간 rest
type Mixed = [first: string, ...middle: number[], last: boolean]
```

---

## 4.3: override 키워드

서브클래스에서 부모 메서드를 오버라이드할 때 명시한다. `noImplicitOverride: true`와 함께 사용한다.

```typescript
class Base {
  greet() { return 'hello' }
}

class Derived extends Base {
  override greet() { return 'hi' }      // ✅ 명시적 오버라이드

  // override unknown() { }             // ❌ 부모에 없는 메서드
}
```

**tsconfig:**
```json
{
  "compilerOptions": {
    "noImplicitOverride": true
  }
}
```

### Static Index Signatures

클래스의 static 멤버에 인덱스 시그니처를 사용할 수 있다.

```typescript
class Registry {
  static [key: string]: unknown
  static name = 'Registry'
  static version = 1
}
```

---

## 4.4: Control Flow Analysis 개선

변수에 할당된 조건 결과를 추적하여 타입을 좁힌다.

```typescript
function example(x: string | number) {
  const isString = typeof x === 'string'

  // 4.4 이전: isString으로 좁히기 불가
  // 4.4+: aliased condition도 CFA 적용
  if (isString) {
    x.toUpperCase()  // ✅ string으로 좁혀짐
  }
}

// 배열 요소 존재 검사도 개선
function getFirst(arr: string[]) {
  const first = arr[0]  // string | undefined (noUncheckedIndexedAccess)
  if (first !== undefined) {
    first.toUpperCase()  // ✅ string
  }
}
```

---

## 4.5: Awaited 유틸리티 타입

`Promise`를 재귀적으로 언래핑하는 내장 타입이다.

```typescript
type A = Awaited<Promise<string>>              // string
type B = Awaited<Promise<Promise<number>>>      // number
type C = Awaited<string | Promise<boolean>>     // string | boolean

// 실용: Promise.all 반환 타입 추론에 활용
async function fetchAll() {
  const [user, posts] = await Promise.all([
    fetchUser(),    // Promise<User>
    fetchPosts()    // Promise<Post[]>
  ])
  // user: User, posts: Post[]  — Awaited가 자동 적용
}
```

### Tail-Recursion 조건부 타입 최적화

깊은 재귀 조건부 타입에서 스택 오버플로를 방지한다.

```typescript
// 4.5 이전: 깊은 재귀 시 "Type instantiation is excessively deep" 에러
// 4.5+: tail position 재귀는 자동 최적화
type TrimLeft<T extends string> =
  T extends ` ${infer Rest}` ? TrimLeft<Rest> : T

type Result = TrimLeft<'    hello'>  // 'hello'
```

---

## 4.6: Destructured Discriminated Unions CFA

구조 분해된 판별 유니온도 Control Flow Analysis가 적용된다.

```typescript
type Action =
  | { kind: 'increment'; amount: number }
  | { kind: 'decrement'; amount: number }
  | { kind: 'reset' }

function handle(action: Action) {
  // 4.6+: 구조 분해 후에도 CFA 작동
  const { kind } = action

  if (kind === 'increment') {
    // action.amount 접근 가능 ✅ (4.6+)
    console.log(action.amount)
  }
}
```

---

## 4.7: Node16 / NodeNext Module Resolution

Node.js ESM 네이티브 지원을 위한 모듈 해석 전략이다.

```json
{
  "compilerOptions": {
    "module": "node16",
    "moduleResolution": "node16"
  }
}
```

**핵심 규칙:**
- `.mts` 파일 -> `.mjs` 출력 (ESM)
- `.cts` 파일 -> `.cjs` 출력 (CJS)
- `.ts` 파일 -> `package.json`의 `type` 필드에 따라 결정
- 상대 임포트 시 **파일 확장자 필수**: `import { x } from './util.js'`

```typescript
// ESM 환경 (.mts 또는 "type": "module")
import { helper } from './helper.js'  // 확장자 필수

// CJS 환경 (.cts 또는 "type": "commonjs")
const { helper } = require('./helper')
```

### Instantiation Expressions

제네릭 함수의 타입 파라미터를 미리 고정한다.

```typescript
function makeBox<T>(value: T) {
  return { value }
}

// 4.7+: 타입 인자만 고정, 호출은 나중에
const makeStringBox = makeBox<string>
// makeStringBox: (value: string) => { value: string }

const box = makeStringBox('hello')  // { value: string }
```

---

## 4.8: Intersection Reduction 개선

`{}` 타입과의 교차가 더 정확하게 축소된다.

```typescript
// 4.8+: NonNullable<T>가 T & {} 로 단순화
type NonNullable<T> = T & {}

// unknown이 {} | null | undefined로 분해
function narrowUnknown(x: unknown) {
  if (x !== null && x !== undefined) {
    x  // {} 타입 (non-nullable)
  }
}
```

---

## 4.9: satisfies 연산자

타입 검증을 수행하면서 리터럴 타입 추론을 유지한다.

```typescript
type Colors = Record<string, [number, number, number] | string>

// as const: 타입이 너무 좁아짐 (Colors와 호환 검증 불가)
// : Colors: 타입이 넓어져 리터럴 정보 소실

// satisfies: 양쪽 장점을 모두 확보
const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
  blue: [0, 0, 255]
} satisfies Colors

palette.green.toUpperCase()  // ✅ string 메서드 사용 가능
palette.red.map(x => x / 255)  // ✅ 튜플 메서드 사용 가능
// palette.purple  // ❌ 존재하지 않는 키 에러
```

**satisfies vs 타입 단언 vs 타입 어노테이션:**

| 방식 | 타입 검증 | 리터럴 유지 |
|------|:---------:|:-----------:|
| `satisfies T` | O | O |
| `: T` (어노테이션) | O | X (넓어짐) |
| `as T` (단언) | X (위험) | X |
| `as const` | X | O (좁아짐) |

### Auto-Accessors (Stage 3)

클래스 필드에 `accessor` 키워드를 사용하면 getter/setter가 자동 생성된다.

```typescript
class User {
  accessor name: string

  constructor(name: string) {
    this.name = name
  }
}

// 내부적으로 다음과 동일:
// get name(): string { return this.#name }
// set name(value: string) { this.#name = value }
```

> 주의: auto-accessor는 ECMAScript Stage 3 데코레이터 제안과 함께 사용되며, `useDefineForClassFields: true` 설정이 필요하다.

---

## 4.x tsconfig 권장 설정

### 라이브러리 / 패키지 프로젝트 (Node.js ESM)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "node16",
    "moduleResolution": "node16",
    "strict": true,
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

### React 프로젝트 (4.x 기준)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "node",
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

> 주의: 4.x에서는 `moduleResolution: "bundler"`가 없다. 이 옵션은 TypeScript 5.0에서 도입되었다. 4.x 프로젝트에서 번들러(Webpack, Vite)를 사용할 때는 `moduleResolution: "node"`를 사용한다.

---

## strict 관련 플래그 (4.x 기준)

`strict: true`는 다음 플래그를 모두 활성화한다:

| 플래그 | 효과 |
|--------|------|
| `strictNullChecks` | `null`/`undefined` 분리 체크 |
| `strictFunctionTypes` | 함수 파라미터 반공변성 체크 |
| `strictBindCallApply` | bind/call/apply 타입 검사 |
| `strictPropertyInitialization` | 클래스 프로퍼티 초기화 강제 |
| `noImplicitAny` | 암묵적 `any` 금지 |
| `noImplicitThis` | 암묵적 `this` 금지 |
| `alwaysStrict` | `"use strict"` 자동 삽입 |
| `useUnknownInCatchVariables` (4.4+) | catch 변수를 `unknown`으로 처리 |

**추가 권장 플래그 (strict에 미포함):**

| 플래그 | 도입 버전 | 효과 |
|--------|-----------|------|
| `noUncheckedIndexedAccess` | 4.1 | 인덱스 접근 시 `undefined` 포함 |
| `noImplicitOverride` | 4.3 | override 명시 강제 |
| `exactOptionalPropertyTypes` | 4.4 | 선택적 프로퍼티에서 `undefined` 할당 금지 |

---

## React 타입 패턴 (4.x 기준)

### ComponentProps 확장 (React 18 + TS 4.x)

```typescript
// React.ComponentProps로 HTML 속성 상속
interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
}

function Button({ variant = 'primary', loading, children, ...props }: ButtonProps) {
  return <button disabled={loading} {...props}>{children}</button>
}
```

### 제네릭 컴포넌트

```typescript
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}

// 사용: 타입 자동 추론
<List
  items={users}
  renderItem={user => <span>{user.name}</span>}
  keyExtractor={user => user.id}
/>
```

### Discriminated Union으로 Props 분기

```typescript
type ModalProps =
  | { type: 'alert'; message: string; onConfirm: () => void }
  | { type: 'confirm'; message: string; onConfirm: () => void; onCancel: () => void }
  | { type: 'prompt'; message: string; onSubmit: (value: string) => void }

function Modal(props: ModalProps) {
  switch (props.type) {
    case 'alert':
      return <div>{props.message}<button onClick={props.onConfirm}>OK</button></div>
    case 'confirm':
      return <div>{props.message}<button onClick={props.onCancel}>Cancel</button></div>
    case 'prompt':
      // props.onSubmit 접근 가능
      return <div>{props.message}</div>
  }
}
```

---

## 고급 타입 패턴

### Template Literal Types 활용

```typescript
// 이벤트 시스템 타입
type EventMap = {
  click: { x: number; y: number }
  focus: { target: HTMLElement }
  input: { value: string }
}

type EventHandler<T extends keyof EventMap> = (event: EventMap[T]) => void

// on + Capitalize 패턴
type EventHandlers = {
  [K in keyof EventMap as `on${Capitalize<string & K>}`]: EventHandler<K>
}
// { onClick: (event: { x: number; y: number }) => void; onFocus: ...; onInput: ... }
```

### 조건부 타입 + infer

```typescript
// 배열 요소 타입 추출
type ElementOf<T> = T extends (infer E)[] ? E : never
type Item = ElementOf<string[]>  // string

// 함수 반환 타입 추출 (ReturnType 구현)
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never

// Promise 내부 타입 추출 (Awaited 구현 원리)
type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T
```

### satisfies + as const 조합 (4.9+)

```typescript
const ROUTES = {
  home: '/',
  about: '/about',
  user: '/user/:id'
} as const satisfies Record<string, string>

// 키와 값 모두 리터럴 타입으로 유지
type RouteKey = keyof typeof ROUTES     // 'home' | 'about' | 'user'
type RoutePath = typeof ROUTES[RouteKey] // '/' | '/about' | '/user/:id'
```

---

## 4.x에서 5.0으로 마이그레이션 시 주의사항

| 4.x | 5.0+ | 비고 |
|-----|------|------|
| `moduleResolution: "node"` | `moduleResolution: "bundler"` | 번들러 환경에서 권장 변경 |
| `importsNotUsedAsValues` | `verbatimModuleSyntax` | 5.0에서 통합 대체 |
| `keyofStringsOnly` | 제거됨 | 5.0에서 삭제 |
| `suppressImplicitAnyIndexErrors` | 제거됨 | 5.0에서 삭제 |
| `target: "ES2020"` | `target: "ES2022"` 이상 권장 | class fields, top-level await |

---

## 흔한 에러와 해결

```typescript
// "Type instantiation is excessively deep and possibly infinite"
// → 재귀 조건부 타입 깊이 제한 (기본 ~50단계)
// → 4.5+ tail-recursion 최적화 활용, 또는 재귀 깊이 줄이기

// "The 'this' context of type '...' is not assignable"
// → 4.x strict 모드에서 클래스 메서드를 콜백으로 전달 시
class Timer {
  // 화살표 함수로 this 바인딩
  tick = () => { /* this가 Timer로 고정 */ }
}

// "Property 'X' has no initializer and is not definitely assigned"
// → strictPropertyInitialization 때문
class Config {
  host!: string  // ! (definite assignment assertion) — 외부 초기화가 확실할 때만
  port: number = 3000  // 기본값 제공이 더 안전
}

// 4.7+ "Relative import paths need explicit file extensions in ESM"
// → node16/nodenext 사용 시 확장자 필수
import { util } from './util.js'  // .ts 아닌 .js로 작성
```
