---
name: zod-schema-validation
description: Zod 4 서버 경계 검증의 버전 의존 사항 — `.default()` vs `.prefault()` 동작 변경, `__proto__` 처리(4.4.0+ 수정·`z.record` 4.6.5 실측), `.validate()`(4.6.0+)
---

# Zod 스키마 검증 — 서버 경계 패턴 (Zod 4)

> 소스: https://zod.dev/ (공식 문서) | https://zod.dev/v4/changelog (마이그레이션 가이드) | https://github.com/colinhacks/zod/releases
> 2026-09-26 보강: `npm i zod@4`로 로컬 실측(`z.record` `__proto__` 처리) | RFC 9110 §15.5.21(422) | npm dist-tag 히스토리(3.25.0~, `stringbool` 존재 확인)
> 검증일: 2026-11-09
> 기준 버전: **zod 4.6.5** 실측 작성, 2026-11-09 기준 최신 안정 **4.6.7**(4.6.6·4.6.7은 문서·릴리스 절차 변경만, API 변경 없음 — 4.6.7에서 `.validate()`·`z.record` `__proto__` 처리 재실측 동일). `.validate()`는 4.6.0+, `__proto__` 스킵 수정은 4.4.0+

**범위:** 서버 측 "신뢰 경계(trust boundary)" 검증. React Hook Form + Zod 폼 연동, Hono 미들웨어 통합(`zValidator` 등)은 다루지 않는다.

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

## 10. 악성 입력 방어

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
