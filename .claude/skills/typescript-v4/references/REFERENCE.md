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
