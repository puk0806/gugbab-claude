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
