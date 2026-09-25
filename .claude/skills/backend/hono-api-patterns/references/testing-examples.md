# Hono 테스트 예시 — 정상 · 악성 · 경계 3계층 (vitest + `app.request`)

> 소스: https://hono.dev/docs/guides/testing , https://hono.dev/docs/helpers/testing , https://github.com/honojs/hono/blob/main/src/validator/validator.ts
> 검증일: 2026-09-25 / 기준: hono 4.13.9, @hono/zod-validator 0.9.1, vitest
> SKILL.md 8절에서 분리한 전체 예시. 전제: SKILL.md 2~5절 구조(`src/app.ts`, `requireUser`, `validationHook`, 루트 `bodyLimit` 100KB, `onError`).

전제 모듈 분리 — 핸들러가 저장소 함수를 모듈로 import해야 테스트에서 모킹할 수 있다.

```ts
// src/routes/posts.ts (발췌)
import * as postRepo from '../repo/posts'      // findPost / insertPost
import { verifySession } from '../auth/session' // requireUser 내부에서 사용
```

## 1. REST 엔드포인트

```ts
// src/routes/posts.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as postRepo from '../repo/posts'
import * as session from '../auth/session'
import { app } from '../app'

vi.mock('../repo/posts')
vi.mock('../auth/session')

const auth = { Authorization: 'Bearer token-of-alice' }
const post = (body: unknown, headers: Record<string, string> = {}) =>
  app.request('/posts', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...headers },
  })

beforeEach(() => {
  vi.resetAllMocks()
  // 테스트 더블: 알려진 토큰만 사용자로 인정, 나머지는 null
  vi.mocked(session.verifySession).mockImplementation(async (t) => (t === 'token-of-alice' ? 'alice' : null))
  vi.mocked(postRepo.insertPost).mockImplementation(async (input) => ({ id: 1, ...input }))
})

describe('POST /posts — 정상', () => {
  it('인증된 사용자가 유효한 글을 만들면 201', async () => {
    const res = await post({ title: 'Hi', body: 'x' }, auth)
    expect(res.status).toBe(201)
    expect((await res.json()).post.authorId).toBe('alice')
  })
})

describe('POST /posts — 악성 유저 방어', () => {
  it('토큰 없이 요청하면 401', async () => {
    expect((await post({ title: 'Hi', body: 'x' })).status).toBe(401)
  })
  it('위조 토큰은 401', async () => {
    expect((await post({ title: 'Hi', body: 'x' }, { Authorization: 'Bearer forged' })).status).toBe(401)
  })
  it('Bearer 접두어 없는 토큰은 401', async () => {
    expect((await post({ title: 'Hi', body: 'x' }, { Authorization: 'token-of-alice' })).status).toBe(401)
  })
  it('본문에 authorId를 넣어도 세션 사용자로 저장된다 (권한 위장 차단)', async () => {
    await post({ title: 'Hi', body: 'x', authorId: 'victim' }, auth)
    expect(vi.mocked(postRepo.insertPost).mock.calls[0]?.[0].authorId).toBe('alice')
  })
  it('100KB 초과 본문은 413이고 저장소는 호출되지 않는다', async () => {
    const res = await post({ title: 'a', body: 'x'.repeat(200_000) }, auth)
    expect(res.status).toBe(413)
    expect(postRepo.insertPost).not.toHaveBeenCalled()
  })
  it('XSS 페이로드는 그대로 저장되지만 응답은 JSON(Content-Type)으로만 나간다', async () => {
    const res = await post({ title: '<script>alert(1)</script>', body: 'x' }, auth)
    expect(res.headers.get('content-type')).toContain('application/json')
  })
})

describe('POST /posts — 이상·경계 경로', () => {
  it('깨진 JSON은 400 (500 아님)', async () => {
    const res = await app.request('/posts', {
      method: 'POST', body: '{"title":', headers: { 'Content-Type': 'application/json', ...auth },
    })
    expect(res.status).toBe(400)
  })
  it('Content-Type 누락 시 본문이 {}로 취급되어 400', async () => {
    const res = await app.request('/posts', { method: 'POST', body: '{"title":"a","body":"b"}', headers: auth })
    expect(res.status).toBe(400)
  })
  it.each(['', '   ', 'a'.repeat(201)])('제목 경계값 %# 은 400', async (title) => {
    expect((await post({ title, body: 'x' }, auth)).status).toBe(400)
  })
  it('제목 정확히 200자는 201', async () => {
    expect((await post({ title: 'a'.repeat(200), body: 'x' }, auth)).status).toBe(201)
  })
  it('null 본문은 400', async () => {
    expect((await post(null, auth)).status).toBe(400)
  })
  it('저장소 예외 시 500이며 내부 메시지가 새지 않는다', async () => {
    vi.mocked(postRepo.insertPost).mockRejectedValueOnce(new Error('relation "posts" does not exist'))
    const res = await post({ title: 'Hi', body: 'x' }, auth)
    expect(res.status).toBe(500)
    expect(await res.text()).not.toContain('relation')
  })
  it('숫자가 아닌 id 경로는 404 (정규식 파라미터)', async () => {
    expect((await app.request('/posts/1%20OR%201=1')).status).toBe(404)
  })
})
```

## 2. SSE 엔드포인트 (Anthropic 업스트림 모킹)

```ts
// src/routes/chat.test.ts — Anthropic SDK를 모킹해 네트워크 없이 검증
import { describe, it, expect, vi } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => {
  class APIError extends Error { constructor(public status?: number) { super('upstream secret detail') } }
  class APIUserAbortError extends Error {}
  class Anthropic {
    static APIError = APIError
    static APIUserAbortError = APIUserAbortError
    messages = { stream: vi.fn() }
  }
  return { default: Anthropic }
})

// 각 테스트에서 messages.stream 구현을 바꿔 끼운다 (예: 텍스트 delta 2개 후 finalMessage, 또는 APIError(429) throw)

describe('POST /chat', () => {
  it('정상: delta 이벤트와 done 이벤트를 text/event-stream으로 보낸다', async () => { /* content-type·본문의 "event: delta" 확인 */ })
  it('악성: 비로그인 요청은 스트림을 열기 전에 401', async () => { /* status 401, messages.stream 미호출 */ })
  it('악성: messages 21개 또는 content 4001자는 400이고 업스트림 미호출', async () => { /* ... */ })
  it('경계: 업스트림 429 → event: error, code rate_limited, 원문 메시지 미포함', async () => {
    /* 본문에 'rate_limited' 포함, 'upstream secret detail' 미포함 */
  })
  it('경계: role이 system인 메시지 주입 시도는 400', async () => { /* z.enum(['user','assistant']) */ })
})
```

- 스트림 본문은 `await res.text()`로 전부 읽어 `event:`/`data:` 라인을 검사한다(콜백 종료 시 스트림이 닫히므로 대기 가능).
- 클라이언트 disconnect(abort) 경로는 `app.request`만으로 재현하기 어렵다 — `new Request(url, { signal })`로 만들어 `app.request(req)`에 넘기고 `controller.abort()` 후 업스트림 `abort` 호출 여부를 확인하되, 런타임별 abort 전파 차이가 있으므로 통합 환경에서도 한 번 확인한다.

## 3. 타입 안전 클라이언트로 테스트

```ts
import { testClient } from 'hono/testing'
import { routes } from '../app'          // 체이닝으로 조립된 앱이어야 타입이 붙는다

const client = testClient(routes)
const res = await client.posts.$post({ json: { title: 'Hi', body: 'x' } }, { headers: { Authorization: 'Bearer token-of-alice' } })
```
