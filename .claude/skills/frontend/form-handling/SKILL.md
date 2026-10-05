---
name: form-handling
description: React Hook Form + Zod 유효성 검증, 제어/비제어 폼 패턴, 서버 액션 연동
---

# Form Handling — React Hook Form + Zod

> 소스: https://react-hook-form.com/docs | https://zod.dev/ | https://zod.dev/v4/changelog
> 검증일: 2026-09-26 (Zod 4 예제 현행화 2026-09-25, 재테스트·선택 보강 2026-09-26)
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
>
> **deprecated 패턴의 실제 런타임 동작 (zod.dev/v4/changelog 확인, 2026-09-26):** 공식 changelog는 "The method forms (`z.string().email()`) still exist and work as before, but are now deprecated."라고 명시한다. 즉 `z.string().email()`을 그대로 써도 **런타임 예외는 발생하지 않고 기존과 동일하게 동작한다** — 에디터·타입체커의 deprecated 취소선 경고만 뜬다. 급하게 마이그레이션할 필요는 없지만, 신규 코드는 top-level 형태를 쓴다.

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

---

## coerce 스키마 — useForm 3-제네릭 전체 예제

> 소스: https://react-hook-form.com/ts (useForm 제네릭 3개: `TFieldValues`·`TContext`·`TTransformedValues`) | https://github.com/react-hook-form/resolvers (`z.input`/`z.output` 분리 예시)
> 검증일: 2026-09-26

`useForm<T>`처럼 제네릭 하나만 주면 입력·출력 타입이 같은 것으로 고정돼 `zodResolver`(입출력을 각각 추론)와 충돌한다. `z.coerce.number()`처럼 입력(`unknown`/`string`)과 출력(`number`)이 다른 필드가 있으면 제네릭을 생략해 추론에 맡기거나, 아래처럼 셋 다 명시한다.

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// 입력: 브라우저 <input>은 항상 문자열을 준다 → age는 string으로 들어옴
// 출력: coerce 후 number로 검증·제출됨
const AgeGateSchema = z.object({
  nickname: z.string().min(1, { error: '닉네임을 입력해주세요' }),
  age: z.coerce.number().min(14, { error: '14세 이상만 가입 가능합니다' }).max(120),
})

type AgeGateInput = z.input<typeof AgeGateSchema>   // { nickname: string; age: unknown } — coerce라 정확한 입력 타입은 unknown
type AgeGateOutput = z.output<typeof AgeGateSchema> // { nickname: string; age: number }

function AgeGateForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AgeGateInput, unknown, AgeGateOutput>({
    resolver: zodResolver(AgeGateSchema),
    defaultValues: { nickname: '', age: '' as unknown as number }, // defaultValues는 입력 타입 기준 — 빈 input 값은 문자열
  })

  // onSubmit이 받는 data는 TTransformedValues(AgeGateOutput) — age는 이미 number로 변환된 상태
  async function onSubmit(data: AgeGateOutput) {
    await registerUser({ nickname: data.nickname, age: data.age })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('nickname')} placeholder="닉네임" />
      {errors.nickname && <p role="alert">{errors.nickname.message}</p>}

      {/* register('age')는 입력 타입(AgeGateInput) 기준이라 문자열 입력을 그대로 받는다 */}
      <input type="number" {...register('age')} placeholder="나이" />
      {errors.age && <p role="alert">{errors.age.message}</p>}

      <button type="submit" disabled={isSubmitting}>가입하기</button>
    </form>
  )
}
```

> 세 번째 제네릭(`TTransformedValues`)을 생략하면 `TFieldValues`와 같다고 가정되어 `handleSubmit`의 콜백 파라미터가 coerce 이전 타입(문자열)으로 잘못 추론된다 — coerce·transform이 있는 스키마는 반드시 셋 다 명시하거나, 제네릭을 전부 생략해 `resolver`에서 추론시킨다.

---

## 서버 검증 에러 → RHF setError 통합 매핑

> 소스: https://zod.dev/error-formatting (`z.flattenError()` 반환 형태) | https://react-hook-form.com/docs/useform/setError
> 검증일: 2026-09-26

`z.flattenError(error)`는 `{ formErrors: string[], fieldErrors: Record<string, string[]> }` 형태를 반환한다. 서버 액션이 이 형태로 응답하면, 클라이언트는 `fieldErrors`의 각 키를 RHF `setError`로 순회 매핑해 필드별 에러를 그대로 재사용할 수 있다 — 클라이언트·서버가 동일 스키마를 쓰므로 필드명이 항상 일치한다.

```tsx
// app/actions.ts (Next.js Server Action)
'use server'
import * as z from 'zod'

const SignupServerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export async function submitSignup(input: unknown) {
  const result = SignupServerSchema.safeParse(input)
  if (!result.success) {
    return { ok: false as const, errors: z.flattenError(result.error) }
  }
  // 이메일 중복 등 스키마로 못 잡는 비즈니스 규칙 에러도 같은 형태로 맞춘다
  const existing = await findUserByEmail(result.data.email)
  if (existing) {
    return {
      ok: false as const,
      errors: { formErrors: [], fieldErrors: { email: ['이미 사용 중인 이메일입니다'] } },
    }
  }
  await createUser(result.data)
  return { ok: true as const }
}
```

```tsx
import { useForm, type FieldValues, type Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function SignupForm() {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<z.infer<typeof SignupServerSchema>>({ resolver: zodResolver(SignupServerSchema) })

  async function onSubmit(data: z.infer<typeof SignupServerSchema>) {
    const result = await submitSignup(data)
    if (!result.ok) {
      // fieldErrors 키를 그대로 RHF 필드명으로 사용해 매핑 — 스키마가 같으므로 키가 어긋날 일이 없다
      for (const [field, messages] of Object.entries(result.errors.fieldErrors)) {
        if (messages?.[0]) {
          setError(field as Path<typeof data>, { type: 'server', message: messages[0] })
        }
      }
      // path가 없는(formErrors) 전역 에러는 폼 최상단에 별도로 표시
      if (result.errors.formErrors.length > 0) {
        setError('root.serverError' as Path<typeof data>, { type: 'server', message: result.errors.formErrors[0] })
      }
      return
    }
    // 성공 처리
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {errors.root?.serverError && <p role="alert">{errors.root.serverError.message}</p>}
      <input {...register('email')} placeholder="이메일" />
      {errors.email && <p role="alert">{errors.email.message}</p>}
      <input type="password" {...register('password')} />
      {errors.password && <p role="alert">{errors.password.message}</p>}
      <button type="submit" disabled={isSubmitting}>가입하기</button>
    </form>
  )
}
```

> `setError(field, ...)`의 `field`는 `register`에 쓴 것과 같은 dot-path 문자열이어야 값이 실제 필드에 연결된다. 서버·클라이언트가 스키마를 공유하지 않는다면(별도 패키지가 아니라면) 필드명 오타로 매핑이 조용히 실패할 수 있으니, 공유 스키마(`backend/zod-schema-validation` 스킬 — 설치된 경우 — 의 서버 검증과 동일 스키마)를 쓰는 것을 권장한다.
