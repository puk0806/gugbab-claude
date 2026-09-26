---
name: form-handling
description: React Hook Form + Zod 유효성 검증, 제어/비제어 폼 패턴, 서버 액션 연동
---

# Form Handling — React Hook Form + Zod

> 소스: https://react-hook-form.com/docs | https://zod.dev/ | https://zod.dev/v4/changelog
> 검증일: 2026-09-25 (Zod 4 예제 현행화)
> 기준 버전: react-hook-form 7.x · **zod 4.x (4.6 기준)** · @hookform/resolvers 5.x (`zodResolver`가 Zod 4 스키마를 자동 인식)
>
> 서버 측 검증(요청 body·환경변수·외부 API 응답·악성 입력 방어)과 Zod 3 → 4 변경점 상세는 `backend/zod-schema-validation` 스킬(설치된 경우)을 참조한다.

---

## 왜 React Hook Form인가

| | 일반 useState 폼 | React Hook Form |
|---|---|---|
| 리렌더링 | 입력마다 발생 | 최소화 (비제어) |
| 유효성 검증 | 수동 구현 | 스키마 기반 자동 |
| 에러 처리 | 직접 관리 | 자동 |
| 코드량 | 많음 | 적음 |

---

## 기본 설정

```bash
pnpm add react-hook-form zod @hookform/resolvers   # zod 4.x, @hookform/resolvers 5.x
```

> 주의: Zod 4에서 `z.string().email()/.uuid()/.url()/.datetime()`은 deprecated(동작은 함)이며 top-level `z.email()/z.uuid()/z.url()/z.iso.datetime()`을 쓴다. 에러 메시지 옵션 `message` → `error`, `invalid_type_error`/`required_error`는 제거, `.flatten()/.format()` → `z.flattenError()/z.treeifyError()`.

---

## Zod 스키마 + RHF 연동

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// 1. 스키마 정의 (단일 진실 공급원)
const SignupSchema = z.object({
  email: z.email({ error: '올바른 이메일을 입력해주세요' }),
  password: z
    .string()
    .min(8, { error: '비밀번호는 8자 이상이어야 합니다' })
    .regex(/[A-Z]/, { error: '대문자를 포함해야 합니다' }),
  passwordConfirm: z.string(),
  age: z.number().min(14, { error: '14세 이상만 가입 가능합니다' }).optional(),
}).refine(
  data => data.password === data.passwordConfirm,
  { error: '비밀번호가 일치하지 않습니다', path: ['passwordConfirm'] }
)

// 2. 타입 자동 추론
type SignupFormData = z.infer<typeof SignupSchema>

// 3. 폼 컴포넌트
function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { email: '', password: '', passwordConfirm: '' },
  })

  async function onSubmit(data: SignupFormData) {
    try {
      await signup(data)
    } catch (err) {
      // 서버 에러를 특정 필드에 연결
      setError('email', { message: '이미 사용 중인 이메일입니다' })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input {...register('email')} placeholder="이메일" />
        {errors.email && <p role="alert">{errors.email.message}</p>}
      </div>

      <div>
        <input type="password" {...register('password')} />
        {errors.password && <p role="alert">{errors.password.message}</p>}
      </div>

      <div>
        <input type="password" {...register('passwordConfirm')} />
        {errors.passwordConfirm && <p role="alert">{errors.passwordConfirm.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '처리 중...' : '가입하기'}
      </button>
    </form>
  )
}
```

---

## 재사용 가능한 필드 컴포넌트 (캡슐화)

```tsx
// FormField.tsx — 레이블, 입력, 에러를 캡슐화
import { type FieldError, type UseFormRegisterReturn } from 'react-hook-form'
import styles from './FormField.module.scss'

interface FormFieldProps {
  label: string
  registration: UseFormRegisterReturn
  error?: FieldError
  type?: string
  placeholder?: string
}

function FormField({ label, registration, error, type = 'text', placeholder }: FormFieldProps) {
  const id = registration.name
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={error ? styles.inputError : styles.input}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...registration}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className={styles.error}>
          {error.message}
        </p>
      )}
    </div>
  )
}

// 사용
<FormField
  label="이메일"
  registration={register('email')}
  error={errors.email}
  type="email"
/>
```

---

## 복잡한 폼 — useFieldArray (동적 필드)

```tsx
import { useFieldArray } from 'react-hook-form'

const Schema = z.object({
  members: z.array(z.object({
    name: z.string().min(1, { error: '이름을 입력해주세요' }),
    role: z.string(),
  })).min(1, { error: '최소 1명이 필요합니다' }),
})

function TeamForm() {
  const { control, register, formState: { errors } } = useForm({
    resolver: zodResolver(Schema),
    defaultValues: { members: [{ name: '', role: '' }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'members' })

  return (
    <form>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`members.${index}.name`)} placeholder="이름" />
          {errors.members?.[index]?.name && (
            <p>{errors.members[index].name.message}</p>
          )}
          <button type="button" onClick={() => remove(index)}>삭제</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: '', role: '' })}>
        멤버 추가
      </button>
    </form>
  )
}
```

---

## React 19 Server Actions 연동

```tsx
// app/actions.ts (Next.js Server Action)
'use server'
import * as z from 'zod'

const Schema = z.object({ email: z.email() })

export async function submitForm(formData: FormData) {
  const result = Schema.safeParse({ email: formData.get('email') })
  if (!result.success) {
    // Zod 4: error.flatten() deprecated → z.flattenError() ({ formErrors, fieldErrors })
    return { error: z.flattenError(result.error) }
  }
  // DB 저장 등...
  return { success: true }
}

// 클라이언트에서 RHF + Server Action 연동
function ContactForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(Schema),
  })

  // RHF handleSubmit은 스키마 타입 객체를 전달 (브라우저 FormData 아님)
  async function onSubmit(data: z.infer<typeof Schema>) {
    const formData = new FormData()
    Object.entries(data).forEach(([k, v]) => formData.append(k, String(v)))
    const result = await submitForm(formData)
    if (result.error) {
      setServerError(result.error.formErrors[0] ?? result.error.fieldErrors.email?.[0] ?? '오류')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {serverError && <p role="alert">{serverError}</p>}
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
    </form>
  )
}
```

---

## Zod 패턴 모음

```ts
// 선택적 필드 (비어있으면 undefined)
z.string().optional()

// 빈 문자열을 undefined로 변환
z.string().transform(v => v === '' ? undefined : v).optional()

// 숫자 입력 (input은 string으로 옴)
z.coerce.number().min(0).max(100)

// 날짜 (Zod 4: z.string().datetime() deprecated → z.iso.datetime())
z.iso.datetime()
z.iso.date()          // 'YYYY-MM-DD' (<input type="date"> 값)
z.coerce.date()

// 문자열 포맷 (Zod 4 top-level)
z.email()
z.url()
z.uuid()

// enum
z.enum(['admin', 'user', 'guest'])

// 조건부 유효성
z.discriminatedUnion('type', [
  z.object({ type: z.literal('email'), email: z.email() }),
  z.object({ type: z.literal('phone'), phone: z.string().min(10) }),
])

// 알 수 없는 키 거부/허용 (Zod 4: .strict()/.passthrough() 대신)
z.strictObject({ name: z.string() })   // 추가 키 → 에러
z.looseObject({ name: z.string() })    // 추가 키 통과
```

> 주의: `z.coerce.*`·`.transform()`을 쓰면 스키마의 입력 타입과 출력 타입이 달라진다. 이 경우 `useForm<z.input<typeof S>, unknown, z.output<typeof S>>({ resolver: zodResolver(S) })`처럼 입력/출력 제네릭을 분리한다(@hookform/resolvers 5.x).
