---
name: typescript
description: TypeScript 핵심 패턴, React 타입 패턴, tsconfig 설정 가이드
---

# TypeScript 핵심 패턴

> 소스: https://www.typescriptlang.org/docs | https://react.dev/learn/typescript
> 검증일: 2026-03-27

---

## tsconfig 핵심 설정

```json
{
  "compilerOptions": {
    // 필수 strict 설정
    "strict": true,
    "noUncheckedIndexedAccess": true,  // 배열 접근 시 undefined 포함

    // 모듈
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",     // Vite/Next.js 환경
    "lib": ["ES2020", "DOM", "DOM.Iterable"],

    // React
    "jsx": "react-jsx",
    "noEmit": true,                    // 번들러가 변환 담당

    // 편의
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,

    // 경로 별칭
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

**moduleResolution 선택 기준:**
- `bundler`: Vite, Next.js, tsup 등 번들러 사용 시 (권장)
- `node16` / `nodenext`: Node.js 네이티브 ESM 사용 시
- `node`: 레거시 CommonJS 환경 (deprecated, 신규 프로젝트 사용 비권장)

---

## 타입 vs 인터페이스 선택 기준

| 상황 | 선택 |
|------|------|
| 객체 스키마 정의 | `interface` (확장성, 선언 병합) |
| 유니언 / 튜플 | `type` |
| 제네릭 유틸리티 타입 | `type` |
| 함수 타입 | `type` |
| 라이브러리 공개 API | `interface` (사용자가 병합 가능) |

```tsx
// ✅ interface: 객체 스키마
interface User {
  id: string
  name: string
  email?: string
}

interface AdminUser extends User {
  permissions: string[]
}

// ✅ type: 유니언, 유틸리티
type Status = 'pending' | 'success' | 'error'
type UserId = string
type ReadonlyUser = Readonly<User>
type UserWithId<T> = T & { id: string }
```

---

## 핵심 유틸리티 타입

```tsx
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

// 실용적 사용 패턴
type CreateUserInput = Omit<User, 'id'>              // 생성 요청
type UpdateUserInput = Partial<Omit<User, 'id'>>     // PATCH 요청
type UserPreview = Pick<User, 'id' | 'name'>         // 목록 표시
type UserRecord = Record<string, User>               // 맵 구조

// 함수 타입 추출
async function fetchUser(id: string): Promise<User> { ... }
type FetchUserReturn = Awaited<ReturnType<typeof fetchUser>>  // User
type FetchUserParams = Parameters<typeof fetchUser>           // [string]
```

---

## React 타입 패턴

### 컴포넌트 Props 정의

```tsx
// ✅ 권장: 함수 선언 + 명시적 Props 타입
interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}

function Button({ variant = 'primary', loading, disabled, children, ...props }: ButtonProps) {
  return (
    <button disabled={loading || disabled} {...props}>
      {loading ? '로딩...' : children}
    </button>
  )
}

// ❌ 비권장: React.FC (@types/react 18 이후 children 자동 포함 제거됨, 반환 타입 강제)
const OldButton: React.FC<ButtonProps> = ({ children }) => <button>{children}</button>
```

### children 타입

```tsx
// ReactNode: 모든 렌더링 가능한 값 (가장 넓음)
interface CardProps {
  children: React.ReactNode  // string, number, JSX, null, array 등
}

// ReactElement: JSX만 허용
interface WrapperProps {
  children: React.ReactElement
}

// PropsWithChildren: 기존 Props에 children 추가
type WithChildren<T> = T & { children: React.ReactNode }
```

### 이벤트 핸들러 타입

```tsx
function Form() {
  // 타입 자동 추론됨
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log(e.currentTarget.dataset.id)
  }
}
```

### ComponentProps로 HTML 속성 확장

```tsx
// input 모든 속성 상속 + 추가 props
interface TextInputProps extends React.ComponentProps<'input'> {
  label: string
  error?: string
}

function TextInput({ label, error, ...inputProps }: TextInputProps) {
  return (
    <div>
      <label>{label}</label>
      <input {...inputProps} />
      {error && <span>{error}</span>}
    </div>
  )
}
```

---

## 타입 가드 패턴

```tsx
// Discriminated Union: 가장 안전한 패턴
type ApiResult<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }
  | { status: 'loading' }

function handleResult<T>(result: ApiResult<T>) {
  if (result.status === 'success') {
    console.log(result.data) // T 타입으로 좁혀짐
  } else if (result.status === 'error') {
    console.log(result.message) // string
  }
}

// is 키워드: 커스텀 타입 가드
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as User).id === 'string'
  )
}

// in 연산자
function handleShape(shape: Circle | Rectangle) {
  if ('radius' in shape) {
    return Math.PI * shape.radius ** 2  // Circle
  }
  return shape.width * shape.height     // Rectangle
}
```

---

## as const / satisfies

```tsx
// as const: 리터럴 타입으로 고정
const ROUTES = {
  home: '/',
  about: '/about',
  dashboard: '/dashboard'
} as const

type Route = typeof ROUTES[keyof typeof ROUTES]  // '/' | '/about' | '/dashboard'

// satisfies: 타입 검증 + 리터럴 유지 (TS 4.9+)
const config = {
  theme: 'dark',
  colors: { primary: '#ff0000' }
} satisfies Record<string, unknown>

config.theme  // 'dark' (리터럴 타입 유지, any 아님)
```

---

## 제네릭 패턴

```tsx
// API 응답 래퍼
interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

async function fetchApi<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url)
  return res.json()
}

// 사용: 타입 명시
const result = await fetchApi<User[]>('/api/users')
result.data  // User[]

// 제약 조건
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

getProperty(user, 'name')  // ✅ string 반환
getProperty(user, 'age')   // ❌ 컴파일 에러

// 조건부 타입
type Flatten<T> = T extends Array<infer U> ? U : T
type Item = Flatten<string[]>  // string
type Same = Flatten<number>    // number
```

---

## 흔한 에러 패턴과 해결

```tsx
// Object is possibly 'undefined'
function getUserName(user?: User) {
  return user?.name ?? '익명'  // ✅ 옵셔널 체이닝 + nullish
}

// Type 'X' is not assignable to type 'Y'
// → Discriminated Union 또는 타입 가드로 좁히기

// Property does not exist on type 'unknown'
function parse(data: unknown) {
  if (isUser(data)) {  // 타입 가드 통과 후 접근
    return data.name   // ✅
  }
}

// Cannot find module '@/components'
// → tsconfig.json paths 설정 확인
// → "baseUrl": ".", "paths": { "@/*": ["src/*"] }

// 타입 단언 최소화: as는 최후 수단
const el = document.getElementById('root') as HTMLElement  // 불가피한 경우만
// 대신 타입 가드 사용:
const el = document.getElementById('root')
if (!el) throw new Error('root element not found')
```

---

## 모노레포 환경 tsconfig 상속

```json
// packages/tsconfig/base.json (공유 설정)
{
  "compilerOptions": { "strict": true, ... }
}

// apps/web/tsconfig.json (앱 설정)
{
  "extends": "@myorg/tsconfig/base.json",
  "compilerOptions": {
    "jsx": "preserve",    // Next.js는 preserve
    "plugins": [{ "name": "next" }]
  },
  "include": ["src", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

// packages/ui/tsconfig.json (패키지 설정)
{
  "extends": "@myorg/tsconfig/base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "declaration": true,
    "declarationDir": "./dist"
  }
}
```
