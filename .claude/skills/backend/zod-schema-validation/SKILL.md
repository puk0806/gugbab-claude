---
name: zod-schema-validation
description: Zod 4 서버 경계 검증 패턴 — 요청 body/query/params, 환경변수, 외부 API 응답, 모노레포 FE/BE 스키마 공유, 에러 포맷팅, 악성 입력 방어(초장문·__proto__·strict/loose)와 Zod 3 → 4 변경점
---

# Zod 스키마 검증 — 서버 경계 패턴 (Zod 4)

> 소스: https://zod.dev/ (공식 문서) | https://zod.dev/v4/changelog (마이그레이션 가이드) | https://github.com/colinhacks/zod/releases
> 2026-09-26 보강: `npm i zod@4`로 로컬 실측(`z.record` `__proto__` 처리) | RFC 9110 §15.5.21(422) | npm dist-tag 히스토리(3.25.0~, `stringbool` 존재 확인)
> 검증일: 2026-09-25 (섹션 4-2·10-2 보강은 2026-09-26)
> 기준 버전: **zod 4.6.5** (2026-09 기준 최신 안정, 위 실측도 이 버전으로 수행). `.validate()`는 4.6.0+, `__proto__` 스킵 수정은 4.4.0+

**범위:** 서버 측 "신뢰 경계(trust boundary)" 검증. React Hook Form + Zod 폼 연동은 `frontend/form-handling` 스킬, Hono 미들웨어 통합(`zValidator` 등)은 `backend/hono-api-patterns` 스킬을 참조한다.

> 주의: 외부 튜토리얼에 흔한 Zod 3 스타일(`z.string().email()`, `z.string().datetime()`)은 Zod 4에서도 동작하지만 **deprecated**이며 신규 코드는 아래 top-level 형식을 쓴다. (`frontend/form-handling`은 2026-09-25에 Zod 4 형식으로 현행화됨)

---

## 1. 언제 쓰나 / 쓰지 않나

| 사용 | 사용하지 않음 |
|------|--------------|
| HTTP 요청 body·query·params·header 등 외부 입력 | 이미 검증된 내부 함수 간 호출(타입으로 충분) |
| `process.env` 부팅 시 검증 | 초고빈도 핫패스에서 동일 데이터 반복 검증 |
| 외부 API·웹훅·큐 메시지 응답 | 인가(authorization) 판단 — 스키마는 *형태*만 검증한다 |
| FE/BE 공유 계약(DTO) | DB 제약(unique 등) — DB/서비스 레이어 책임 |

**원칙:** 경계에서 한 번 `parse`하고, 내부에는 `z.infer` 타입만 흘려보낸다 ("parse, don't validate").

---

## 2. 설치·임포트 (Zod 4)

```bash
pnpm add zod   # 4.x — 패키지 루트 "zod"가 Zod 4를 export
```

```ts
import * as z from "zod";       // 공식 문서 표준 임포트
// import * as z from "zod/mini"; // 번들 제약이 극단적인 프론트용 (서버에선 불필요)
// import * as z from "zod/v3";   // 레거시 Zod 3 코드 유지용 서브패스
```

| 서브패스 | 내용 |
|---------|------|
| `zod` | Zod 4 (2025-07부터 루트 = v4, 권장) |
| `zod/v4` | Zod 4 (영구 유지) |
| `zod/mini` | Zod Mini — 함수형·tree-shakable API |
| `zod/v3` | Zod 3 (계속 제공) |

**Zod Mini는 서버에서 쓸 이유가 거의 없다.** 공식 문서는 "흔치 않게 엄격한 번들 크기 제약"이 있을 때만 권장하며, 백엔드에서는 일반 Zod 번들 크기가 성능에 무의미하다고 명시한다.

```ts
// Zod Mini 스타일 (참고)
import * as z from "zod/mini";
const Name = z.string().check(z.minLength(1), z.maxLength(50), z.trim());
const Opt = z.optional(z.string()); // 메서드 체인 대신 함수 래핑
```

---

## 3. Zod 3 → 4 핵심 변경점 (서버 코드에 영향 큰 것)

| Zod 3 | Zod 4 | 상태 |
|-------|-------|------|
| `z.string().email()` / `.uuid()` / `.url()` / `.datetime()` | `z.email()` / `z.uuid()` / `z.url()` / `z.iso.datetime()` | 메서드형 deprecated (동작은 함) |
| `.ip()` / `.cidr()` | `z.ipv4()`·`z.ipv6()` / `z.cidrv4()`·`z.cidrv6()` | 제거 |
| `{ message }` | `{ error }` (문자열 또는 함수) | `message` deprecated |
| `invalid_type_error`, `required_error` | `error: (iss) => ...` 로 통합 | 제거 |
| `errorMap` | `error` | 이름 변경 |
| `.strict()` / `.passthrough()` | `z.strictObject()` / `z.looseObject()` | deprecated |
| `.merge(other)` | `.extend(other.shape)` 또는 스프레드 | deprecated |
| `err.format()` / `err.flatten()` | `z.treeifyError(err)` / `z.flattenError(err)` | deprecated |
| `err.errors` | `err.issues` | 제거 |
| `z.nativeEnum(E)` | `z.enum(E)` (enum-like 입력 지원) | deprecated |
| `z.record(valueSchema)` 단일 인자 | `z.record(keySchema, valueSchema)` | 단일 인자 제거 |
| `.default(x)` (입력 타입 기준, 파싱 통과) | `.default(x)`는 **출력 타입** 기준·즉시 반환 / 구 동작은 `.prefault(x)` | 동작 변경 |
| `.uuid()` 느슨 | `z.uuid()`는 RFC 9562/4122 엄격, 느슨하게는 `z.guid()` | 동작 변경 |
| `z.number()` Infinity 허용 | Infinity 거부, `.int()`는 safe integer 범위만 | 동작 변경 |
| `.superRefine`의 `ctx.path` | 제거 | 제거 |

---

## 4. 요청 검증 — body / query / params

### 4-1. body (JSON)

```ts
import * as z from "zod";

export const CreateOrderBody = z.strictObject({
  productId: z.uuid(),
  quantity: z.number().int().min(1).max(100),
  memo: z.string().trim().max(500).optional(),
  couponCode: z.string().regex(/^[A-Z0-9]{6,12}$/).optional(),
});
export type CreateOrderBody = z.infer<typeof CreateOrderBody>;

// 프레임워크 무관 핸들러 예시
export async function handleCreateOrder(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const result = CreateOrderBody.safeParse(raw);
  if (!result.success) {
    return Response.json(
      { error: "VALIDATION_FAILED", details: z.flattenError(result.error).fieldErrors },
      { status: 422 },
    );
  }
  const body = result.data; // 타입 확정, 미정의 키 없음
  // 가격·권한 등은 여기서 서버가 재계산/재검증 — 스키마 통과 ≠ 인가
  return Response.json({ ok: true, productId: body.productId });
}
```

**왜 422가 아니라 400을 쓰는 곳도 있는가 (상태 코드 선택 근거):** HTTP는 요청을 "구문(syntax)"과 "의미(semantic)" 두 층위로 나눈다. 서버가 JSON 자체를 파싱하지 못하면(형식 오류) 400 Bad Request, JSON은 문법적으로 유효하지만 스키마 검증(의미)에 실패하면 422 Unprocessable Content(RFC 9110 §15.5.21, 원래 WebDAV RFC 4918에서 도입)가 더 정확한 의미를 전달한다. 이 스킬의 예시는 이 구분(파싱 실패 400 / 스키마 검증 실패 422)을 따른다. 다만 이는 업계 관행이지 강제 표준은 아니며 — 다수 API가 클라이언트 에러를 전부 400으로 통일하는 것도 정당한 선택이다. **핵심은 같은 API 안에서 일관성을 유지하는 것**(엔드포인트마다 400/422를 섞어 쓰면 클라이언트가 상태 코드로 분기할 수 없다).

- `parse`는 실패 시 `ZodError`를 throw, `safeParse`는 `{ success, data | error }` 판별 유니언을 반환한다. 핸들러에서는 `safeParse`가 흐름 제어에 유리하다.
- **비동기 refine/transform이 있으면 `parseAsync`/`safeParseAsync` 필수.** 동기 `parse`로 호출하면 에러가 난다.
- `parse` 결과는 입력의 deep clone이므로, 원본 `raw`를 다시 쓰지 말고 `result.data`만 쓴다.

### 4-2. query string — 전부 문자열로 들어온다

```ts
export const ListQuery = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["createdAt", "price"]).default("createdAt"),
  includeDeleted: z.stringbool().default(false),
  q: z.string().trim().max(100).optional(),
});

const url = new URL(req.url);
const query = ListQuery.safeParse(Object.fromEntries(url.searchParams));
// 같은 키가 여러 번 오는 배열 파라미터는 url.searchParams.getAll("tag")로 따로 뽑아 z.array(...)로 검증
```

- `z.coerce.number()`의 입력 타입은 `unknown`. `Number("")`은 `0`이 되므로 **빈 문자열이 0으로 통과**할 수 있다 → `.min(1)` 같은 범위로 막는다.
- **`z.coerce.boolean()` 금지:** `Boolean("false") === true`. 문자열 불리언은 `z.stringbool()`을 쓴다.
- `z.stringbool()` 기본값 — truthy: `"true","1","yes","on","y","enabled"` / falsy: `"false","0","no","off","n","disabled"`, 대소문자 무시. 그 외 문자열은 에러. `z.stringbool({ truthy: [...], falsy: [...], case: "sensitive" })`로 변경 가능.
- `z.stringbool()` 도입 버전: 패키지 루트 `"zod"`가 Zod 4(당시 베타)를 export하기 시작한 **3.25.0(2025-05-19)** 부터 이미 포함되어 있었고, 이후 정식 `zod@4.x` 라인에 그대로 이어진다(codec 도입 이전부터 존재, 내부적으로 codec 기반 재구현됨). 기준 버전 4.6.5에서도 그대로 사용 가능.

### 4-3. path params

```ts
export const OrderParams = z.object({ orderId: z.uuid() });
// z.uuid()는 RFC 엄격 — DB가 비표준 UUID(버전 비트 없음)를 쓰면 z.guid() 사용
```

---

## 5. `.default()` vs `.prefault()` (Zod 4 동작 변경)

```ts
// default: 입력이 undefined면 파싱을 건너뛰고 기본값을 그대로 반환 (값은 출력 타입이어야 함)
z.string().transform((v) => v.length).default(0).parse(undefined);       // 0

// prefault: 기본값을 입력으로 넣어 파이프라인을 통과시킴 (Zod 3의 default 동작)
z.string().transform((v) => v.length).prefault("tuna").parse(undefined); // 4
```

또한 Zod 4에서는 `z.string().default("x").optional()`처럼 **optional 안의 default도 적용**되어 키가 없어도 값이 채워진다.

---

## 6. 환경변수 검증 — 부팅 시 fail-fast

```ts
// src/env.ts
import * as z from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  API_BASE_URL: z.httpUrl(),
  JWT_SECRET: z.string().min(32),
  ENABLE_METRICS: z.stringbool().default(false),
  ALLOWED_ORIGINS: z
    .string()
    .transform((s) => s.split(",").map((o) => o.trim()).filter(Boolean))
    .pipe(z.array(z.url()).min(1)),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // 값(비밀)을 로그에 남기지 않도록 prettifyError의 메시지만 출력
  console.error("Invalid environment variables:\n" + z.prettifyError(parsed.error));
  process.exit(1);
}
export const env = parsed.data;
```

- `process.env` 값은 모두 `string | undefined` → 숫자·불리언은 `z.coerce.number()` / `z.stringbool()`로 변환.
- 기본 `z.object`는 미정의 키를 **strip**하므로 `process.env`의 수백 개 키 중 스키마 키만 남는다 (여기서 `strictObject` 쓰면 안 됨).
- 에러 이슈에 입력값을 포함시키는 `reportInput: true` 옵션은 비밀값 유출 위험이 있으므로 env 검증에서 켜지 않는다.

---

## 7. 외부 API 응답·웹훅 검증

```ts
const Upstream = z.object({          // 기본 strip — 상대가 필드를 추가해도 깨지지 않음
  id: z.string(),
  status: z.enum(["pending", "paid", "failed"]),
  amount: z.number().int().nonnegative(),
  paidAt: z.iso.datetime({ offset: true }).nullable(),
});

export async function fetchPayment(id: string) {
  const res = await fetch(`${env.API_BASE_URL}/payments/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  const result = Upstream.safeParse(await res.json());
  if (!result.success) {
    // 스키마 드리프트: 조용히 진행하지 말고 관측 가능하게 실패
    throw new Error("Upstream schema drift: " + z.prettifyError(result.error));
  }
  return result.data;
}

// 웹훅 이벤트는 discriminated union으로 분기
const WebhookEvent = z.discriminatedUnion("type", [
  z.object({ type: z.literal("payment.succeeded"), data: z.object({ paymentId: z.string() }) }),
  z.object({ type: z.literal("payment.failed"), data: z.object({ reason: z.string().max(1000) }) }),
]);
```

| 경계 | 객체 모드 권장 | 이유 |
|------|---------------|------|
| 클라이언트 → 서버 요청 body | `z.strictObject` (또는 기본 strip) | 오타·오염 필드를 명시적으로 거부하려면 strict, 조용히 버리려면 strip |
| 외부 API 응답 | `z.object` (strip) | 상대 필드 추가에 내성, strict면 상대 배포 한 번에 장애 |
| 프록시·패스스루 | `z.looseObject` | 모르는 키도 보존해야 할 때만 |
| 동적 키 맵 | `z.record(keySchema, value)` 또는 `.catchall(schema)` | 키도 검증 |

- `z.iso.datetime()`은 기본적으로 **UTC `Z`만 허용**하고 `+09:00` 같은 offset은 거부한다. offset 허용은 `{ offset: true }`, 로컬(타임존 없는) 형식은 `{ local: true }`.
- ISO 문자열 ↔ `Date` 양방향 변환이 필요하면 `z.codec(z.iso.datetime(), z.date(), { decode, encode })` + `z.decode`/`z.encode`.

---

## 8. 에러 커스터마이즈 (Zod 4 `error` 파라미터)

```ts
z.string("문자열이어야 합니다");                         // 스키마 레벨 (문자열 축약)
z.string().min(2, "2자 이상");                           // 체크 레벨
z.string().min(2, { error: "2자 이상" });
z.string({
  error: (iss) => (iss.input === undefined ? "필수 항목입니다" : "문자열이어야 합니다"),
}); // Zod 3의 required_error / invalid_type_error 대체

// 파싱 시점 에러 맵
Schema.parse(data, { error: (iss) => `invalid: ${iss.code}` });

// 전역: 한국어 로케일 (zod 패키지에 ko 로케일 포함)
z.config(z.locales.ko());
```

**우선순위 (높음 → 낮음):** 체크 레벨 → 스키마 레벨 → 파싱 시점 에러 맵 → 전역 `z.config({ customError })` → 로케일.

에러 함수가 `undefined`를 반환하면 다음 우선순위 에러 맵으로 넘어간다.

---

## 9. 에러 포맷팅 — API 응답 형태

| 함수 | 출력 | 용도 |
|------|------|------|
| `z.flattenError(err)` | `{ formErrors: string[], fieldErrors: { [k]: string[] } }` | 평평한 폼·요청 body (가장 흔함) |
| `z.treeifyError(err)` | `{ errors: [], properties: { field: { errors: [...] } } }` (배열은 `items`) | 중첩 구조 |
| `z.prettifyError(err)` | 사람이 읽는 여러 줄 문자열 | 로그·디버깅 |
| `err.issues` | 원본 이슈 배열 (`code`, `path`, `message` …) | 커스텀 포맷 |

```ts
// RFC 9457 Problem Details 스타일 예시
function toProblem(err: z.ZodError) {
  return {
    type: "https://example.com/problems/validation",
    title: "Validation failed",
    status: 422,
    errors: err.issues.map((i) => ({ path: i.path.join("."), code: i.code, message: i.message })),
  };
}

// 전역 에러 핸들러에서 식별
if (error instanceof z.ZodError) { /* 422 */ }
```

- **응답에 `issues` 원본(입력값 포함 가능)을 그대로 노출하지 않는다.** `path`·`code`·`message`만 추려서 반환한다.
- 외부 API 응답 검증 실패는 클라이언트 잘못이 아니므로 422가 아니라 502/500으로 매핑한다.

---

## 10. 악성 입력 방어

### 10-1. 초장문·초대용량

Zod는 **요청 크기를 제한하지 않는다.** 파싱 전에 이미 전체 body가 메모리에 올라온다.

1. 프레임워크/리버스 프록시에서 body size limit 먼저 (예: 1MB).
2. 모든 문자열에 `.max()`, 모든 배열에 `.max()`를 건다. `z.string()`에는 기본 길이 제한이 없다.
3. 정규식은 입력 길이를 먼저 제한한 뒤 적용 (ReDoS 표면 축소) — `.max(100).regex(...)` 순서.

```ts
const Tags = z.array(z.string().trim().min(1).max(30)).max(20);
const Comment = z.string().trim().min(1).max(2000);
```

### 10-2. 프로토타입 오염 (`__proto__`)

```ts
// JSON.parse('{"__proto__": {"isAdmin": true}}') 는 "__proto__"를 own property로 만든다
const payload = JSON.parse('{"name":"a","__proto__":{"isAdmin":true}}');

z.object({ name: z.string() }).parse(payload);       // strip: { name: "a" } — 미정의 키 제거
z.strictObject({ name: z.string() }).safeParse(payload); // 미정의 키 → 실패
```

- **zod 4.4.0 이상 필수:** 4.4.0에서 catchall 경로(`z.looseObject`, `.passthrough()`, `.catchall()`)가 `__proto__` 키를 건너뛰도록 수정됐다 (PR #5898). 이전 버전은 `output[key] = value`가 `__proto__` setter를 호출해 결과 객체의 프로토타입이 공격자 값으로 바뀔 수 있었다.
- 요청 body에는 `looseObject`/`catchall`보다 **`strictObject` 또는 기본 strip**을 쓴다.

**`z.record(...)`의 `__proto__` 키 처리 (2026-09-26 zod 4.6.5로 실측, 이전 "미검증" 문구 갱신):**

```ts
const payload = JSON.parse('{"name":"a","__proto__":{"isAdmin":true}}');
// JSON.parse는 "__proto__"를 own property로 만든다 (프로토타입 setter를 타지 않음)

const result = z.record(z.string(), z.any()).parse(payload);
console.log(Object.getOwnPropertyNames(result));      // ["name"] — "__proto__" 키 자체가 결과에 없음
console.log(Object.getPrototypeOf(result) === Object.prototype); // true — 오염 없음
console.log(({} as any).isAdmin);                       // undefined — 전역 Object.prototype도 안전
```

zod 4.6.5 기준 `z.record(keySchema, valueSchema).parse(payload)`는 `"__proto__"` 키를 결과 객체의 own property로 복사하지 않으며, `Object.prototype`도 오염되지 않는다(과거 이슈 #2227이 보고했던 경로는 현재 버전에서 재현되지 않음). 다만 이는 이 스킬이 실측한 단일 버전·단일 케이스 결과이고, 4.4.0 PR #5898의 변경 로그가 `z.record` 경로를 명시적으로 언급하지는 않으므로 **버전 업그레이드 시 재확인을 권장**한다. 방어의 원칙 자체는 유지한다 — 동적 키 맵에는 **키 스키마로 허용 문자를 제한**해 원천 차단한다.

```ts
const SafeKey = z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/); // "__proto__"도 막으려면 refine 추가
const Labels = z.record(
  SafeKey.refine((k) => k !== "__proto__" && k !== "constructor" && k !== "prototype"),
  z.string().max(200),
);
```

### 10-3. Mass assignment (필드 주입)

```ts
// ❌ 클라이언트가 role/isAdmin/price를 끼워 넣을 여지
const UpdateUser = UserSchema.partial();

// ✅ 클라이언트가 바꿀 수 있는 필드만 pick
const UpdateUser = UserSchema.pick({ nickname: true, bio: true }).partial();
```

### 10-4. 기타

- 수량·금액: `.int()`, `.min()`, `.max()` — Zod 4의 `.int()`는 safe integer 범위 밖(`2**53` 이상)을 거부. 가격은 **클라이언트 값을 신뢰하지 말고 서버가 재계산**.
- URL: `z.url()`만으로는 스킴 제한이 없으므로 리다이렉트/SSRF 표면에는 `z.httpUrl()` 또는 `z.url({ protocol: /^https$/, hostname: /^api\.example\.com$/ })`로 제한.
- 이메일: `z.email()` 기본 패턴 사용, 정규화가 필요하면 `z.string().trim().toLowerCase().pipe(z.email())`.
- 교차 필드 검증은 `.refine(fn, { error, path: ["field"] })` — `path`를 지정해야 필드 에러로 매핑된다.

---

## 11. 모노레포 FE/BE 스키마 공유

```
packages/
  contracts/            ← 스키마 전용 패키지 (런타임 의존성: zod만)
    src/order.ts
apps/
  web/                  ← zodResolver(CreateOrderBody)
  api/                  ← CreateOrderBody.safeParse(body)
```

```ts
// packages/contracts/src/order.ts
import * as z from "zod";
export const CreateOrderBody = z.strictObject({ /* ... */ });
export type CreateOrderInput = z.input<typeof CreateOrderBody>;   // 폼(입력) 타입
export type CreateOrderOutput = z.output<typeof CreateOrderBody>; // 서버(파싱 후) 타입 = z.infer
```

- `zod`는 contracts 패키지의 `peerDependencies`로 두고 앱에서 **단일 버전**을 설치한다. 버전이 둘이면 `instanceof z.ZodError` 판별이 어긋날 수 있다.
- transform/coerce/default가 있으면 입력≠출력이므로 FE는 `z.input`, BE는 `z.output`을 쓴다.
- **FE 검증은 UX용, BE 검증이 보안 경계다.** 같은 스키마를 공유해도 서버에서 반드시 다시 parse한다.
- 서버 전용 규칙(DB 조회 refine 등)은 공유 스키마에 넣지 말고 BE에서 `.extend()` / `.refine()`으로 덧붙인다 (공유 패키지가 서버 의존성을 끌고 오지 않도록).
- `@hookform/resolvers`의 `zodResolver`는 Zod v3(3.25+)·v4 스키마를 런타임에 자동 감지한다.
- 스키마 조합: `.extend()`, `.pick()`, `.omit()`, `.partial()`. 기존 필드를 호환 안 되는 타입으로 덮는 실수를 막으려면 `.safeExtend()`.

---

## 12. 빠른 boolean 검사 — `.validate()` (4.6.0+)

```ts
if (Player.validate(data)) {
  data.username; // 입력 타입으로 narrowing
}
z.validate(z.string(), "hi"); // true
```

- 첫 이슈에서 short-circuit하므로 `.safeParse().success`보다 빠르다. 비동기 refine은 `.validateAsync()`.
- **변환 결과를 돌려주지 않는다** (transform/default/coerce 결과가 필요하면 `safeParse`). 요청 처리에는 `safeParse`를 쓰고, `.validate()`는 필터링·가드 용도로만.

---

## 13. Valibot 짧은 비교

| 항목 | Zod 4 | Valibot 1.x (1.5.0, 2026-09) |
|------|-------|-----------------------------|
| API | 메서드 체인 (`z.string().min(1)`) / Mini는 함수형 | 함수형 `v.pipe(v.string(), v.minLength(1))` |
| 번들 | 일반 Zod는 크고, Zod Mini로 축소 가능 | 모듈 단위 import로 가장 작음 (공식 비교: 로그인 폼 1.37kB vs Zod 17.7kB) |
| 런타임 성능 | — | Valibot 공식 문서 스스로 "midfield"라고 기술 |
| 생태계 | 가장 넓음 (resolvers·Hono·tRPC·OpenAPI 등) | Standard Schema 지원 라이브러리에서 사용 가능 |

**서버 기준 결론:** 번들 크기가 무의미한 서버에서는 생태계가 넓은 Zod 4가 기본값. Valibot은 엣지/클라이언트 번들 제약이 크고 팀이 함수형 API를 선호할 때 고려. Zod·Valibot·ArkType 모두 Standard Schema(`~standard` 인터페이스)를 구현하므로 이를 받는 라이브러리에서는 교체 가능하다.

> 주의: 번들 수치는 Valibot 공식 비교 페이지의 자체 측정값이며 측정 조건(번들러·스키마)에 따라 다르다.

---

## 14. 흔한 실수

| 실수 | 결과 | 수정 |
|------|------|------|
| `z.coerce.boolean()`로 query/env 불리언 파싱 | `"false"` → `true` | `z.stringbool()` |
| 문자열·배열에 `.max()` 없음 | 초장문·대량 배열로 CPU/메모리 소모 | 모든 경계 필드에 상한 |
| 외부 API 응답에 `strictObject` | 상대 필드 추가 시 장애 | 기본 strip `z.object` |
| 요청 body에 `looseObject` / `catchall(z.any())` | 오염 필드·`__proto__` 표면 | `strictObject` 또는 strip, zod ≥ 4.4.0 |
| async refine 스키마를 `parse`로 호출 | 런타임 에러 | `parseAsync` / `safeParseAsync` |
| `.default()`에 입력 타입 값 전달(transform 앞 값) | 타입 에러 또는 변환 누락 | 출력 타입 값, 구 동작은 `.prefault()` |
| `{ message: ... }`, `required_error` (Zod 3 스타일) | deprecated / 제거 | `{ error: ... }` |
| `err.errors`, `err.flatten()` | 제거 / deprecated | `err.issues`, `z.flattenError(err)` |
| `z.iso.datetime()`에 `+09:00` 입력 | 실패 | `{ offset: true }` |
| FE 검증만 하고 서버 parse 생략 | 우회 가능 | 서버에서 항상 재검증 |
| 스키마 통과를 인가로 착각 | IDOR·권한 상승 | 소유권·권한은 서비스 레이어에서 검사 |

---

## 15. 테스트 시 체크 (적대적 케이스 포함)

스키마 테스트는 정상 입력뿐 아니라 아래를 반드시 포함한다.

- 필수 필드 누락·`null`·잘못된 타입 → 실패
- 경계값: `max` 정확히 / `max + 1`, `0`, 음수, `Number.MAX_SAFE_INTEGER + 1`, `Infinity`, `NaN`
- 초장문 문자열, 상한 초과 배열
- 미정의 필드 주입(`role: "admin"`) → strict면 실패, strip이면 결과에 없음
- `JSON.parse('{"__proto__":{"isAdmin":true}}')` → 결과 객체의 `isAdmin`이 `undefined`
- query 문자열 불리언 `"false"` → `false`, 알 수 없는 값 `"maybe"` → 실패
