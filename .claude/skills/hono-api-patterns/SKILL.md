---
name: hono-api-patterns
description: Hono 4.x 기반 TypeScript REST API 패턴 — 체이닝 라우팅·app.route 분할, createMiddleware 타입 변수, hono/validator·@hono/zod-validator 검증, HTTPException·onError 에러 계층, RPC 클라이언트(hc) 타입 공유, Node(@hono/node-server v2)·Bun·Vercel 어댑터, app.request 테스트, Anthropic SDK SSE 스트리밍(streamSSE), Express/Fastify 선택 기준.
---

# Hono API 패턴 (TypeScript REST)

> 소스:
> - Hono 공식: https://hono.dev/docs/guides/validation , https://hono.dev/docs/api/exception , https://hono.dev/docs/api/hono , https://hono.dev/docs/guides/rpc , https://hono.dev/docs/guides/best-practices , https://hono.dev/docs/helpers/factory , https://hono.dev/docs/helpers/streaming , https://hono.dev/docs/guides/testing , https://hono.dev/docs/helpers/testing , https://hono.dev/docs/getting-started/nodejs , https://hono.dev/docs/getting-started/bun , https://hono.dev/docs/getting-started/nextjs , https://hono.dev/docs/middleware/builtin/body-limit , https://hono.dev/docs/middleware/builtin/cors , https://hono.dev/docs/middleware/builtin/request-id
> - Hono GitHub(소스 확인): https://github.com/honojs/hono (`src/helper/streaming/sse.ts`, `src/validator/validator.ts`, `src/middleware/request-id/request-id.ts`), https://github.com/honojs/middleware/tree/main/packages/zod-validator , https://github.com/honojs/node-server/releases/tag/v2.0.0
> - Vercel: https://vercel.com/docs/frameworks/backend/hono
> - Anthropic: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5 , https://platform.claude.com/docs/en/build-with-claude/streaming , https://platform.claude.com/docs/en/api/sdks/typescript , https://github.com/anthropics/anthropic-sdk-typescript/blob/main/helpers.md
>
> 검증일: 2026-09-25
> 기준 버전: `hono` **4.13.9**(2026-09-24) / `@hono/zod-validator` **0.9.1**(peer: `hono >=4.11.2`, `zod ^3.25.0 || ^4.0.0`) / `@hono/node-server` **2.1.1**(Node **>=20**) / `@anthropic-ai/sdk` **0.128.0**(2026-09-22, `claude-opus-5-5` 지원 추가)

**관련 스킬 (중복 서술 안 함 — 설치된 경우 해당 스킬 참조):**
- Zod 스키마 작성 자체 → `backend/zod-schema-validation`
- ORM → `backend/prisma-orm`, `backend/drizzle-neon-postgres`
- 세션·OAuth 인증 → `backend/better-auth`
- 브라우저에서 SSE 소비 → `frontend/claude-api-streaming-frontend`

---

## 0. 언제 Hono를 고르나 (Express / Fastify와 짧은 비교)

| 조건 | 선택 |
|------|------|
| Vercel·Cloudflare Workers·Bun·Deno 등 **여러 런타임/엣지** 배포, Web 표준 `Request/Response` 기반 | **Hono** |
| 프론트(React/Next.js)와 **API 타입을 코드 생성 없이 공유**(RPC `hc`) | **Hono** |
| Node 전용 장기 실행 서버, JSON 스키마 기반 직렬화·플러그인 생태계가 중요 | Fastify 5 |
| 기존 Express 미들웨어 자산(passport 등) 재사용이 최우선 | Express 5 |
| 대규모 팀, DI·모듈 구조 강제 필요 | NestJS (Hono 범위 밖) |

> 성능 벤치마크 수치는 소스마다 편차가 커서 이 스킬에서는 선택 근거로 쓰지 않는다. 실서비스 병목은 대개 DB·외부 API다.

---

## 1. 설치 · 구조

```bash
npm i hono @hono/zod-validator zod
npm i @hono/node-server            # Node 런타임에서만
npm i @anthropic-ai/sdk             # LLM 스트리밍 쓸 때
npm i -D vitest typescript tsx
```

```
src/
├── index.ts          # 런타임 엔트리 (Node: serve / Bun·Vercel: export default)
├── app.ts            # 루트 앱 조립: 공통 미들웨어 + app.route() + onError/notFound
├── env.ts            # AppEnv 타입 (Bindings / Variables)
├── middleware/auth.ts
└── routes/
    ├── posts.ts      # new Hono<AppEnv>().get(...).post(...) 체이닝
    └── chat.ts       # SSE 스트리밍
```

- `tsconfig.json`은 `"strict": true` 필수 — RPC 타입 추론 전제 조건(공식 RPC 가이드). 모노레포면 **클라이언트·서버 양쪽 모두**.

---

## 2. 라우팅

```ts
// src/env.ts
import type { RequestIdVariables } from 'hono/request-id'

export type AppEnv = {
  Bindings: Record<string, never>            // Workers 바인딩 쓸 때 채움. Node에서는 HttpBindings 가능
  Variables: RequestIdVariables & { userId: string }
}
```

```ts
// src/routes/posts.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import * as z from 'zod'
import type { AppEnv } from '../env'
import { requireUser } from '../middleware/auth'
import { validationHook } from '../validation'

const createPost = z.object({ title: z.string().trim().min(1).max(200), body: z.string().max(20_000) })

// ✅ 체이닝으로 정의해야 RPC / testClient 타입이 흐른다
export const posts = new Hono<AppEnv>()
  .get('/:id{[0-9]+}', async (c) => {           // 정규식 파라미터로 숫자만 매칭
    const id = Number(c.req.param('id'))
    const post = await findPost(id)
    if (!post) return c.json({ error: 'not_found' }, 404)   // c.notFound() 대신 — RPC 타입 유지
    return c.json({ post }, 200)
  })
  .post('/', requireUser, zValidator('json', createPost, validationHook), async (c) => {
    const input = c.req.valid('json')
    const post = await insertPost({ ...input, authorId: c.get('userId') })  // 작성자는 세션에서만
    return c.json({ post }, 201)
  })
```

```ts
// src/app.ts
import { Hono } from 'hono'
export const app = new Hono<AppEnv>()
// ...공통 미들웨어(3절), onError/notFound(5절)
export const routes = app.route('/posts', posts).route('/chat', chat)   // 체이닝 결과를 export
export type AppType = typeof routes
```

**규칙**
- **Rails식 컨트롤러 분리 금지**(공식 Best Practices) — 핸들러를 따로 빼면 path param 타입 추론이 깨진다. 굳이 분리하려면 `createFactory<AppEnv>().createHandlers(...)`.
- 큰 앱은 기능별 `new Hono()`를 만들고 루트에서 `app.route('/prefix', sub)`로 조립.
- `new Hono({ strict: true })`가 기본 — `/hello`와 `/hello/`를 구분한다. 필요 시 `{ strict: false }`.
- `basePath('/api')`는 Next.js catch-all 통합 등에서 사용(7절).

---

## 3. 미들웨어

미들웨어는 **양파(onion) 구조** — `await next()` 이전은 요청 방향, 이후는 응답 방향. `next()`를 await하지 않으면 뒤쪽 결과(에러 포함)를 놓친다.

```ts
// src/middleware/auth.ts
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import type { AppEnv } from '../env'

export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
  const auth = c.req.header('authorization')        // header()는 대소문자 무관 조회
  const userId = auth?.startsWith('Bearer ') ? await verifySession(auth.slice(7)) : null
  if (!userId) throw new HTTPException(401, { message: 'unauthorized' })
  c.set('userId', userId)                            // 이후 c.get('userId') / c.var.userId (타입 안전)
  await next()
})
```

공통 미들웨어 등록 순서 예시(루트 앱, **라우트 등록보다 먼저**):

```ts
import { requestId } from 'hono/request-id'
import { secureHeaders } from 'hono/secure-headers'
import { cors } from 'hono/cors'
import { bodyLimit } from 'hono/body-limit'
import { logger } from 'hono/logger'

app.use(requestId())                                 // c.get('requestId')
app.use(logger())
app.use(secureHeaders())
app.use('/*', cors({
  origin: (origin) => (ALLOWED_ORIGINS.includes(origin) ? origin : null),  // credentials면 '*' 금지
  credentials: true,
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
  maxAge: 600,
}))
app.use('/*', bodyLimit({
  maxSize: 100 * 1024,                               // 100 KB
  onError: (c) => c.json({ error: 'payload_too_large' }, 413),
}))
```

| 내장 미들웨어 | import | 메모 |
|---|---|---|
| `requestId` | `hono/request-id` | 들어온 `X-Request-Id`가 255자 초과이거나 `[\w\-=]` 밖 문자를 포함하면 **무시하고 새로 생성**(소스 확인) |
| `cors` | `hono/cors` | 라우트보다 먼저 등록. `origin` 기본값 `*` |
| `bodyLimit` | `hono/body-limit` | `Content-Length` 먼저 검사, 없으면 스트림을 읽으며 검사. Bun에서 128 MiB 초과 한도는 `Bun.serve({ maxRequestBodySize })`도 같이 조정 |
| `secureHeaders` | `hono/secure-headers` | 기본 보안 헤더 일괄 |
| 그 외 | `hono/logger`, `hono/timeout`, `hono/csrf`, `hono/jwt`, `hono/bearer-auth` | 필요 시 |

---

## 4. 검증 — `hono/validator` · `@hono/zod-validator`

타깃: `json` · `form` · `query` · `param` · `header` · `cookie`. 검증 결과는 `c.req.valid('<target>')`로 꺼낸다.

```ts
// 수동 검증기 (라이브러리 없이)
import { validator } from 'hono/validator'

app.get('/search', validator('query', (value, c) => {
  const q = value['q']
  if (typeof q !== 'string' || q.length === 0 || q.length > 100) {
    return c.json({ error: 'invalid_query' }, 400)     // Response 반환 → 핸들러 실행 안 됨
  }
  return { q }                                          // 반환값이 c.req.valid('query') 타입
}), (c) => c.json({ q: c.req.valid('query').q }))
```

```ts
// src/validation.ts — zValidator 공통 hook: 에러 응답 형식을 통일하고 입력값 에코를 막는다
import type { Context } from 'hono'

export const validationHook = (
  result: { success: boolean; error?: { issues: ReadonlyArray<{ path: PropertyKey[]; message: string }> } },
  c: Context,
) => {
  if (!result.success) {
    return c.json({
      error: 'validation_failed',
      issues: result.error?.issues.map((i) => ({ path: i.path.map(String).join('.'), message: i.message })),
    }, 400)
  }
}
```

**반드시 알아야 할 동작 (공식 문서 + 소스 확인)**
- hook 없이 실패하면 `zValidator`는 `c.json(result, 400)` — **Zod 실패 결과 객체 전체**를 그대로 반환한다. 응답 형식 통제·내부 스키마 노출 방지를 위해 공통 hook을 두는 것을 권장.
- hook에서 `throw new HTTPException(...)`을 던져 `onError`로 위임해도 된다.
- `json`/`form` 검증은 요청 `Content-Type`이 맞아야 본문을 파싱한다. 헤더가 없거나 다르면 값이 `{}`가 되어 스키마 검증에서 400으로 떨어진다.
- `Content-Type: application/json`인데 본문이 깨진 JSON이면 검증기 내부에서 `HTTPException(400, 'Malformed JSON in request body')`가 던져진다 → `onError`에서 처리.
- `header` 타깃 스키마의 키는 **소문자**로 쓴다(`'idempotency-key'`).
- Zod 외 라이브러리(Valibot·ArkType)는 `@hono/standard-validator`의 `sValidator` 사용.
- 기본 파싱은 `safeParseAsync`. 옵션 4번째 인자 `validationFunction`으로 교체 가능.

---

## 5. 에러 핸들링 — `HTTPException` · `onError` · `notFound`

```ts
import { HTTPException } from 'hono/http-exception'

throw new HTTPException(409, { message: 'already_exists' })
throw new HTTPException(401, { res: new Response('Unauthorized', { headers: { 'WWW-Authenticate': 'Bearer' } }) })
throw new HTTPException(502, { message: 'upstream_failed', cause: err })   // cause는 로깅용
```

```ts
// src/app.ts
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    // 커스텀 res가 있으면 그대로, 없으면 표준 JSON 형태로
    if (err.res) return err.getResponse()
    return c.json({ error: err.message, requestId: c.get('requestId') }, err.status)
  }
  logError({ err, requestId: c.get('requestId') })       // 스택은 로그로만
  return c.json({ error: 'internal_error', requestId: c.get('requestId') }, 500)
})

app.notFound((c) => c.json({ error: 'not_found' }, 404))
```

**규칙**
- `notFound`는 **최상위 앱의 것만** 호출된다. `app.route()`로 붙인 하위 앱의 `notFound`는 무시된다(이슈 #3465, "not bug" 라벨). 하위 앱 전용 404가 필요하면 하위 앱 끝에 `sub.all('*', ...)`.
- 부모 앱과 하위 라우트가 모두 `onError`를 가지면 **라우트 쪽이 우선**한다(공식 App 문서).
- `onError`에서 `err.message`·스택을 500 응답에 그대로 싣지 않는다 — DB 에러 문자열 등 내부 정보 누출.
- `streamSSE` 콜백 안에서 던진 에러는 **`app.onError`로 가지 않는다**(스트림이 이미 시작됨). 9절 참고.

---

## 6. RPC 클라이언트 (`hc`) — 코드 생성 없는 타입 공유

```ts
// client (프론트 or 다른 서비스)
import { hc, type InferRequestType, type InferResponseType } from 'hono/client'
import type { AppType } from '../server/src/app'    // type-only import — 서버 코드 번들링 안 됨

const client = hc<AppType>(import.meta.env.VITE_API_URL, {
  headers: () => ({ Authorization: `Bearer ${getToken()}` }),
})

const res = await client.posts.$post({ json: { title: 'Hi', body: '...' } })
if (res.status === 201) {
  const { post } = await res.json()                 // 201 응답 타입으로 좁혀짐
} else if (res.status === 400) {
  const err = await res.json()
}

type CreatePostReq = InferRequestType<typeof client.posts.$post>['json']
type GetPost200 = InferResponseType<(typeof client.posts)[':id']['$get'], 200>
const url = client.posts[':id'].$url({ param: { id: '1' } })   // $url은 절대 URL 기반, $path는 경로만
```

**타입이 흐르는 조건 / 함정**
- 라우트를 **체이닝**으로 정의하고, 체이닝 결과(`typeof routes`)를 export.
- 상태 코드별 타입을 원하면 `c.json(body, 201)`처럼 **상태 코드를 명시**.
- `c.notFound()`는 타입 추론이 안 된다 → `c.json({ error }, 404)` 사용(또는 공식 문서의 `NotFoundResponse` 모듈 augmentation).
- 서버·클라이언트의 **hono 버전을 일치**시킨다. 불일치 시 "Type instantiation is excessively deep and possibly infinite" 에러.
- 라우트가 많아 IDE가 느려지면 공식 "compile types" 패턴: 서버 쪽에서 `hc<typeof app>`로 만든 클라이언트 타입을 미리 계산해 `hcWithType` 팩토리로 export.
- `parseResponse(client.x.$get())`(hono/client) — 비 2xx면 `DetailedError`를 throw하는 헬퍼.

---

## 7. 런타임 어댑터

### Node.js — `@hono/node-server` v2

```ts
// src/index.ts
import { serve } from '@hono/node-server'
import { app } from './app'

const server = serve({ fetch: app.fetch, port: Number(process.env.PORT ?? 3000) })

process.on('SIGINT', () => { server.close(); process.exit(0) })
process.on('SIGTERM', () => { server.close((err) => process.exit(err ? 1 : 0)) })
```

- v2(2026-04-21)부터 **Node.js 20 이상** 필요. `@hono/node-server/vercel` 어댑터는 **v2에서 제거**됐다.
- 정적 파일: `serveStatic` from `@hono/node-server/serve-static`. Node 원시 객체는 `HttpBindings`로 `c.env.incoming` / `c.env.outgoing`.

> 주의: hono.dev Node.js 가이드에는 아직 "Node 18.14.1+" 요구사항이 남아 있으나, 어댑터 v2 릴리즈 노트·`package.json`(`engines.node >=20`) 기준으로 **Node 20+**가 맞다. v1.19.x 라인은 유지보수 중.

### Bun

```ts
// src/index.ts
import { app } from './app'
export default { port: 3000, fetch: app.fetch }     // 또는 export default app
```

- 정적 파일은 `serveStatic` from `hono/bun`. 테스트는 `bun:test`에서도 `app.request()` 그대로.

### Vercel — zero-config

```ts
// src/index.ts (또는 app.ts / server.ts / index.ts / src/app.ts / src/server.ts 중 하나)
import { app } from './app'
export default app
```

- Vercel이 위 경로에서 hono를 import하는 파일을 찾아 **빌드 설정 없이** 배포. 라우트는 Vercel Functions(Fluid compute 기본)로 동작. 로컬은 `vc dev`.
- 정적 파일은 `public/**`에 둔다 — **Hono `serveStatic()`은 Vercel에서 무시**된다.
- **Next.js App Router 안에 넣을 때**: `app/api/[[...route]]/route.ts`에서
  ```ts
  import { Hono } from 'hono'
  import { handle } from 'hono/vercel'
  const app = new Hono().basePath('/api')
  app.get('/hello', (c) => c.json({ message: 'Hello Next.js!' }))
  export const GET = handle(app)
  export const POST = handle(app)
  ```

---

## 8. 테스트 — `app.request()` (정상 + 악성 + 경계 3계층)

`app.request(path | Request, init?, env?)` — 서버 기동 없이 `Response`를 받는다. 3번째 인자로 Bindings(mock env)를 주입.

```ts
// src/routes/posts.test.ts (요약 — 전체는 references/testing-examples.md)
import { it, expect } from 'vitest'
import { app } from '../app'

const post = (body: unknown, headers: Record<string, string> = {}) =>
  app.request('/posts', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...headers } })

it('정상: 인증 + 유효 본문 → 201', async () => {
  expect((await post({ title: 'Hi', body: 'x' }, { Authorization: 'Bearer token-of-alice' })).status).toBe(201)
})
it('악성: 토큰 없음 → 401', async () => {
  expect((await post({ title: 'Hi', body: 'x' })).status).toBe(401)
})
it('악성: 100KB 초과 본문 → 413', async () => {
  expect((await post({ title: 'a', body: 'x'.repeat(200_000) }, { Authorization: 'Bearer token-of-alice' })).status).toBe(413)
})
it('경계: 깨진 JSON → 400 (500 아님)', async () => {
  const res = await app.request('/posts', { method: 'POST', body: '{"title":', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token-of-alice' } })
  expect(res.status).toBe(400)
})
```

| 계층 | 반드시 넣을 케이스 |
|------|------------------|
| 정상 | 201/200 + 응답 본문 형태 |
| 악성 | 토큰 없음·위조·접두어 누락 → 401 / 본문 `authorId` 위장 무시 / 본문 한도 초과 413 / SSE는 스트림 열기 전 401·400 |
| 경계 | 깨진 JSON 400 / `Content-Type` 누락 400 / 길이 경계(0·공백·max·max+1) / `null` 본문 / 저장소 예외 시 500 + 내부 메시지 미노출 / 정규식 param 불일치 404 |

- 타입 안전 테스트 클라이언트: `testClient(app)` from `hono/testing` — 앱이 **체이닝으로 정의**돼 있어야 타입이 붙는다. `client.search.$get({ query }, { headers })`.
- 세션 검증·저장소는 `vi.mock`으로 테스트 더블 처리. 구현 코드가 테스트 토큰 값을 하드코딩해서는 안 된다.
- 전체 예시(REST 3계층 + Anthropic 모킹 SSE 테스트 골격): [`references/testing-examples.md`](references/testing-examples.md)

---

## 9. Anthropic SDK SSE 스트리밍 (`streamSSE`)

```ts
// src/routes/chat.ts
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { bodyLimit } from 'hono/body-limit'
import { zValidator } from '@hono/zod-validator'
import * as z from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import type { AppEnv } from '../env'
import { requireUser } from '../middleware/auth'
import { validationHook } from '../validation'

const anthropic = new Anthropic({ maxRetries: 2 })   // ANTHROPIC_API_KEY 환경변수 사용 — 코드에 키 금지

const chatInput = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(4_000),
  })).min(1).max(20),
})

export const chat = new Hono<AppEnv>().post(
  '/',
  requireUser,
  // 루트 bodyLimit(100KB)가 먼저 적용된다. 경로별 한도는 루트보다 "작게"만 의미가 있다.
  // 더 큰 한도가 필요하면 루트 bodyLimit 등록 경로에서 이 경로를 빼야 한다.
  bodyLimit({ maxSize: 64 * 1024, onError: (c) => c.json({ error: 'payload_too_large' }, 413) }),
  zValidator('json', chatInput, validationHook),
  (c) => {
    const { messages } = c.req.valid('json')
    const requestId = c.get('requestId')

    return streamSSE(c, async (stream) => {
      const upstream = anthropic.messages.stream({
        model: 'claude-opus-5-5',
        max_tokens: 8_192,           // 적응형 thinking이 항상 켜져 있으므로 thinking 몫까지 여유
        system: '간결하게 한국어로 답한다.',
        messages,
        // thinking / tool_choice 지정 안 함 — 아래 주의 참고
      })
      stream.onAbort(() => upstream.abort())   // 브라우저가 끊으면 업스트림도 끊어 토큰 낭비 차단

      let seq = 0
      try {
        for await (const event of upstream) {
          if (stream.aborted) break
          // thinking 블록이 먼저 올 수 있으므로 위치가 아니라 delta 타입으로 거른다
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            await stream.writeSSE({ event: 'delta', id: String(seq++), data: JSON.stringify({ text: event.delta.text }) })
          }
        }
        if (stream.aborted) return
        const final = await upstream.finalMessage()
        await stream.writeSSE({
          event: 'done',
          data: JSON.stringify({ stopReason: final.stop_reason, usage: final.usage }),  // 'refusal'이면 클라가 안내 문구 표시
        })
      } catch (err) {
        if (err instanceof Anthropic.APIUserAbortError || stream.aborted) return   // 클라이언트 취소는 정상 종료
        logError({ err, requestId })
        const status = err instanceof Anthropic.APIError ? err.status : undefined
        // 업스트림 에러 원문을 클라이언트에 보내지 않는다
        await stream.writeSSE({ event: 'error', data: JSON.stringify({ code: status === 429 ? 'rate_limited' : 'upstream_error', requestId }) })
      }
    })
  },
)
```

**streamSSE 동작 (소스 `sse.ts` 확인)**
- 시그니처: `streamSSE(c, cb, onError?)`. 응답 헤더 `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`, `Transfer-Encoding: chunked`를 자동 설정.
- `writeSSE({ data, event?, id?, retry? })` — `data`는 문자열. 객체는 `JSON.stringify`.
- 콜백 종료 시 스트림은 자동으로 닫힌다(`finally { stream.close() }`).
- 콜백에서 던진 에러는 `app.onError`로 가지 않는다. 3번째 인자 `onError`를 주면 **그 콜백 실행 후 Hono가 `event: error`, `data: e.message`를 자동 전송**한다 → 내부 메시지가 그대로 노출될 수 있으므로, 위 예시처럼 **콜백 내부 try/catch로 정제한 에러를 직접 쓰는 방식**을 권장. `onError`를 안 주면 `console.error`만 하고 닫힌다.
- 끊긴 클라이언트 감지: `stream.onAbort(cb)`, `stream.aborted`. abort 이후 write가 no-op이 되도록 바꾸는 PR(#5289)은 머지되지 않았으므로 루프에서 `stream.aborted`를 직접 확인한다.

**Anthropic SDK / Opus 5.5 주의**
- `messages.stream()`은 `MessageStream` — `for await`로 원시 이벤트(`content_block_delta` 등) 순회, `.on('text', ...)` 헬퍼, `finalMessage()`, `abort()`(= `controller.abort()`), 두 번째 인자 요청 옵션 `{ signal, timeout, maxRetries }` 지원.
- 스트림 중간에 `error` 이벤트(예: `overloaded_error`)가 올 수 있고, `ping` 이벤트도 섞인다 — 텍스트 delta만 골라 전달.
- **`claude-opus-5-5`는 thinking을 끌 수 없다.** `thinking: { type: 'disabled' }` 또는 `{ type: 'enabled', budget_tokens }`는 400 `invalid_request_error`. `thinking`을 생략하거나 `{ type: 'adaptive' }`. 깊이는 `effort`로 조절(Opus 5.5 기본 `medium`).
- **강제 tool 사용 불가.** `tool_choice: { type: 'any' }` / `{ type: 'tool', name }`는 400. `auto`(기본) 또는 `none`만 — 스키마 보장이 필요하면 strict tool use나 structured outputs.
- 응답은 thinking 블록으로 시작할 수 있다(기본 `display: 'omitted'`면 내용이 빈 문자열). 블록은 **`type`으로** 고른다.
- 거부 시 HTTP 200 + `stop_reason: 'refusal'` — `done` 이벤트로 전달해 클라이언트가 처리.
- SDK 기본: 재시도 2회(408/409/429/5xx/연결 오류), 타임아웃 10분.

---

## 10. 안티패턴

| # | 안티패턴 | 문제 | 올바른 방법 |
|---|---------|------|------------|
| 1 | `const app = new Hono(); app.get(...)` 따로 호출 후 `typeof app`을 RPC에 export | 라우트 타입이 흐르지 않아 `hc`가 `unknown` | 체이닝 결과를 export |
| 2 | Rails식 컨트롤러 파일로 핸들러 분리 | path param 추론 깨짐 | 라우트 옆에 인라인 또는 `factory.createHandlers` |
| 3 | hook 없는 `zValidator`를 공개 API에 그대로 노출 | Zod 실패 객체 전체가 응답으로 나감 | 공통 `validationHook`으로 형식 통일 |
| 4 | 클라이언트 본문의 `userId`/`authorId`를 신뢰 | 권한 위장·IDOR | `createMiddleware`로 세션에서 `c.set`, 핸들러는 `c.get`만 사용 |
| 5 | `onError`에서 `err.message`·stack을 500 응답에 포함 | 내부 정보 누출 | 로그로만 남기고 `requestId`만 응답 |
| 6 | 하위 앱에 `notFound` 정의하고 동작한다고 가정 | 최상위 `notFound`만 호출됨 | 루트에서 정의, 하위는 `sub.all('*')` |
| 7 | `streamSSE` 3번째 인자 `onError`만 믿고 에러 처리 | Hono가 `e.message`를 SSE로 자동 전송 | 콜백 내부 try/catch로 정제된 에러 전송 |
| 8 | 클라이언트 disconnect 후에도 Anthropic 스트림 계속 소비 | 불필요한 토큰 비용 | `stream.onAbort(() => upstream.abort())` + `stream.aborted` 체크 |
| 9 | Opus 5.5에 `thinking: { type: 'disabled' }`·강제 `tool_choice` | 400 에러 | 생략/`adaptive`, `tool_choice: auto` |
| 10 | 요청 본문 크기 제한 없음 | 대용량 본문으로 메모리 고갈 | `bodyLimit` + Zod `max()` |
| 11 | `cors({ origin: '*', credentials: true })` | 브라우저가 거부하거나 과도 허용 | origin 화이트리스트 함수 |
| 12 | Vercel에서 `serveStatic()`으로 정적 파일 제공 기대 | Vercel에선 무시됨 | `public/**` |
| 13 | Node 18에서 `@hono/node-server` v2 사용 / v2에서 `@hono/node-server/vercel` import | 엔진 불일치·모듈 없음 | Node 20+, Vercel은 `export default app` |
| 14 | 서버·클라이언트 hono 버전 불일치 | RPC 타입 "excessively deep" 에러 | 워크스페이스에서 단일 버전 고정 |

---

## 11. 도입 체크리스트

- [ ] `strict: true` (서버·클라이언트 양쪽)
- [ ] 기능별 `new Hono<AppEnv>()` 체이닝 → 루트에서 `.route()` 체이닝 → `AppType` export
- [ ] 공통 미들웨어: `requestId` → `logger` → `secureHeaders` → `cors`(화이트리스트) → `bodyLimit`
- [ ] 인증은 `createMiddleware<AppEnv>`에서 `c.set('userId')`, 실패 시 `HTTPException(401)`
- [ ] `zValidator` + 공통 hook, 문자열 `max()`·배열 `max()` 상한
- [ ] 루트 `onError`(HTTPException 분기 + 500 정제) · `notFound`
- [ ] 런타임: Node면 `@hono/node-server` v2(Node 20+), Vercel이면 `export default app`
- [ ] SSE: `onAbort`로 업스트림 abort, 콜백 내부 try/catch, `claude-opus-5-5`에 thinking disabled·강제 tool_choice 금지
- [ ] 테스트: `app.request()`로 정상·악성(401/413/권한 위장)·경계(깨진 JSON, Content-Type 누락, 길이 경계, 500 메시지 누출) 3계층
