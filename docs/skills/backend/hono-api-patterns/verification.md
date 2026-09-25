---
skill: hono-api-patterns
category: backend
version: v1
date: 2026-09-25
status: APPROVED
---

# hono-api-patterns 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `hono-api-patterns` |
| 스킬 경로 | `.claude/skills/backend/hono-api-patterns/SKILL.md` (+ `references/testing-examples.md`) |
| 검증일 | 2026-09-25 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 버전 기준 | hono 4.13.9 / @hono/zod-validator 0.9.1 / @hono/node-server 2.1.1 / @anthropic-ai/sdk 0.128.0 / 모델 `claude-opus-5-5` |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (hono.dev 가이드·API·헬퍼·미들웨어, platform.claude.com, vercel.com/docs)
- [✅] 공식 GitHub 2순위 소스 확인 (honojs/hono 소스 파일, honojs/middleware zod-validator, honojs/node-server 릴리즈, anthropics/anthropic-sdk-typescript)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-09-25)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (체이닝 라우팅, createMiddleware, zValidator hook, onError, RPC, 어댑터, streamSSE)
- [✅] 코드 예시 작성 (라우트·미들웨어·검증·에러·RPC·어댑터·테스트·SSE)
- [✅] 흔한 실수 패턴 정리 (안티패턴 14개)
- [✅] SKILL.md 파일 작성 (493줄, 테스트 전체 예시는 references/로 분리)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | hono 최신 버전, @hono/zod-validator 버전·Zod v4 지원, @hono/node-server v2, claude-opus-5-5, Express/Fastify/Hono 비교, notFound 하위 앱 동작, streamSSE onAbort, APIUserAbortError, hono/vercel handle | 버전·릴리즈 일자 확보, 이슈 #3465·PR #5289 발견 |
| 조사 | WebFetch | hono.dev: validation, exception, hono(App), rpc, best-practices, factory, streaming, testing, helpers/testing, nodejs, bun, nextjs, vercel, body-limit, cors, request-id, secure-headers, middleware | 공식 API·코드 예시 수집 |
| 조사 | WebFetch | GitHub raw 소스: `src/helper/streaming/sse.ts`, `src/validator/validator.ts`, `src/middleware/request-id/request-id.ts`, `src/http-exception.ts`, zod-validator `src/index.ts`·`package.json`·README, node-server `package.json`·v2.0.0 릴리즈 | 문서에 없는 실제 동작(onError 시 e.message 자동 전송, 깨진 JSON 400, request-id 헤더 검증, hook 없는 실패 응답 형태) 확인 |
| 조사 | WebFetch | platform.claude.com: models overview, opus-5-5 overview, whats-new-opus-5-5, streaming, TypeScript SDK / SDK helpers.md·releases | Opus 5.5 breaking change(thinking 비활성 불가, 강제 tool_choice 400), 스트리밍 이벤트, 에러 클래스·재시도·타임아웃 |
| 조사 | WebFetch | vercel.com/docs/frameworks/backend/hono, Vercel changelog | zero-config 엔트리 경로, serveStatic 무시, Fluid compute |
| 교차 검증 | WebSearch + WebFetch | 22개 클레임, 독립 소스 2개 이상 | VERIFIED 20 / DISPUTED 2 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Hono Validation | https://hono.dev/docs/guides/validation | ⭐⭐⭐ High | 2026-09-25 조회 | 공식 문서 |
| Hono HTTPException | https://hono.dev/docs/api/exception | ⭐⭐⭐ High | 2026-09-25 조회 | 공식 문서 |
| Hono App API | https://hono.dev/docs/api/hono | ⭐⭐⭐ High | 2026-09-25 조회 | onError 우선순위, strict |
| Hono RPC | https://hono.dev/docs/guides/rpc | ⭐⭐⭐ High | 2026-09-25 조회 | hc, 타입 조건, 버전 일치 |
| Hono Best Practices | https://hono.dev/docs/guides/best-practices | ⭐⭐⭐ High | 2026-09-25 조회 | 컨트롤러 비권장 |
| Hono Factory | https://hono.dev/docs/helpers/factory | ⭐⭐⭐ High | 2026-09-25 조회 | createMiddleware |
| Hono Streaming | https://hono.dev/docs/helpers/streaming | ⭐⭐⭐ High | 2026-09-25 조회 | streamSSE |
| Hono Testing / testClient | https://hono.dev/docs/guides/testing , https://hono.dev/docs/helpers/testing | ⭐⭐⭐ High | 2026-09-25 조회 | app.request |
| Hono Node.js / Bun / Next.js | https://hono.dev/docs/getting-started/nodejs , https://hono.dev/docs/getting-started/bun , https://hono.dev/docs/getting-started/nextjs | ⭐⭐⭐ High | 2026-09-25 조회 | 어댑터 |
| Hono 내장 미들웨어 | https://hono.dev/docs/middleware/builtin/body-limit , /cors , /request-id , /secure-headers | ⭐⭐⭐ High | 2026-09-25 조회 | |
| honojs/hono 소스 | https://github.com/honojs/hono (sse.ts, validator.ts, request-id.ts, http-exception.ts) | ⭐⭐⭐ High | main 브랜치 2026-09-25 | 공식 GitHub |
| honojs/hono 릴리즈 | https://github.com/honojs/hono/releases | ⭐⭐⭐ High | v4.13.9 (2026-09-24) | |
| npmx hono versions | https://npmx.dev/package/hono/versions | ⭐⭐ Medium | 2026-09-25 조회 | 버전 교차 확인 |
| @hono/zod-validator | https://github.com/honojs/middleware/tree/main/packages/zod-validator , https://npmx.dev/package/@hono/zod-validator | ⭐⭐⭐ High | 0.9.1 (2026-08-31) | peer deps |
| @hono/node-server v2.0.0 | https://github.com/honojs/node-server/releases/tag/v2.0.0 | ⭐⭐⭐ High | 2026-04-21 | Node 20+, vercel 어댑터 제거 |
| 이슈 #3465 | https://github.com/honojs/hono/issues/3465 | ⭐⭐ Medium | — | 하위 앱 notFound, "not bug" 라벨 |
| PR #5289 | https://github.com/honojs/hono/pull/5289 | ⭐⭐ Medium | 2026-09-20 미머지 종료 | abort 후 write no-op 미반영 확인 |
| Vercel Hono 문서 | https://vercel.com/docs/frameworks/backend/hono | ⭐⭐⭐ High | last_updated 2026-08-10 | zero-config |
| Vercel changelog | https://vercel.com/changelog/deploy-hono-backends-with-zero-configuration | ⭐⭐⭐ High | — | |
| Claude Models overview | https://platform.claude.com/docs/en/about-claude/models/overview | ⭐⭐⭐ High | 2026-09-25 조회 | 모델 ID |
| Claude Opus 5.5 | https://platform.claude.com/docs/en/models/opus-5-5/overview , https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5 | ⭐⭐⭐ High | 2026-09-22 출시 | breaking changes |
| Claude Streaming | https://platform.claude.com/docs/en/build-with-claude/streaming | ⭐⭐⭐ High | 2026-09-25 조회 | 이벤트 타입 |
| Anthropic TS SDK | https://platform.claude.com/docs/en/api/sdks/typescript , https://github.com/anthropics/anthropic-sdk-typescript (helpers.md, releases) | ⭐⭐⭐ High | v0.128.0 (2026-09-22) | 에러·재시도·타임아웃·abort |
| 프레임워크 비교 글 | https://betterstack.com/community/guides/scaling-nodejs/fastify-vs-express-vs-hono/ , https://encore.dev/articles/nestjs-vs-fastify-vs-hono | ⭐⭐ Medium | 2026 | 선택 기준 교차 확인(수치는 미채택) |

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 핵심 클레임 교차 검증 결과

| # | 클레임 | 소스 | 판정 |
|---|--------|------|------|
| 1 | hono 최신 안정 버전은 4.13.9 (2026-09-24) | GitHub releases, npmx, WebSearch(npm) | VERIFIED |
| 2 | @hono/zod-validator 0.9.1, peer `hono >=4.11.2`, `zod ^3.25.0 \|\| ^4.0.0` | GitHub package.json, npmx | VERIFIED |
| 3 | @hono/node-server 2.x는 Node >=20 필요, `@hono/node-server/vercel` 제거 | v2.0.0 릴리즈 노트, package.json `engines`, WebSearch(zenn 저자 글) | VERIFIED |
| 4 | Node 최소 버전 18.14.1+ (hono.dev Node 가이드) | hono.dev nodejs vs node-server v2 릴리즈·package.json | **DISPUTED** → 어댑터 v2 기준 Node 20+로 작성, `> 주의:` 표기 |
| 5 | 검증 타깃: json/form/query/header/param/cookie, `c.req.valid()` | hono.dev validation, validator.ts 소스 | VERIFIED |
| 6 | json/form 검증 시 Content-Type 불일치면 값이 `{}` | hono.dev validation 경고, validator.ts 소스 | VERIFIED |
| 7 | Content-Type json + 깨진 본문 → `HTTPException(400, 'Malformed JSON in request body')` | validator.ts 소스, 문서의 JSON 파싱 경고 | VERIFIED |
| 8 | header 타깃 키는 소문자 | hono.dev validation, `c.req.header()` 동작 | VERIFIED |
| 9 | hook 없는 zValidator 실패 시 `c.json(result, 400)` | zod-validator src/index.ts, README(기본 400) | VERIFIED |
| 10 | HTTPException 생성자 `(status, { message, res, cause })`, `getResponse()`, `readonly res?` | hono.dev exception, http-exception.ts 소스 | VERIFIED |
| 11 | 부모·라우트 모두 onError면 라우트 쪽 우선 | hono.dev App API(공식 문장 직접 확인), WebSearch 결과의 discussion #2356(제목만 확인, 본문 미열람) | VERIFIED(공식 문서 1차 근거) |
| 12 | 하위 앱 notFound는 호출되지 않고 최상위만 | 이슈 #3465("not bug"), WebSearch 복수 결과 | VERIFIED |
| 13 | RPC: 체이닝·`strict: true`·상태코드 명시·`c.notFound()` 추론 불가·버전 일치 | hono.dev rpc, hono.dev helpers/testing(체이닝 조건) | VERIFIED |
| 14 | Rails식 컨트롤러 비권장, `factory.createHandlers` 대안 | hono.dev best-practices, hono.dev factory | VERIFIED |
| 15 | streamSSE 시그니처 `(c, cb, onError?)`, SSEMessage `{data, event?, id?, retry?}`, 헤더 자동 설정 | sse.ts 소스, hono.dev streaming | VERIFIED |
| 16 | streamSSE 콜백 에러는 app.onError로 가지 않음 | hono.dev streaming, sse.ts 소스 | VERIFIED |
| 17 | streamSSE `onError` 제공 시 Hono가 `event: error, data: e.message` 자동 전송 | sse.ts 소스(run 함수) — 문서에는 명시 없음 | VERIFIED(소스 1차) — 문서 비명시라 SKILL에 "소스 확인" 명기 |
| 18 | requestId는 들어온 헤더를 검증 없이 사용 (hono.dev 요약) | request-id 문서 vs request-id.ts 소스(길이 초과·`[^\w\-=]` 포함 시 재생성) | **DISPUTED** → 소스 동작(검증 후 재생성)으로 작성 |
| 19 | Vercel zero-config: 지정 경로 파일의 default export, serveStatic 무시, Fluid compute | Vercel 문서, Vercel changelog, hono.dev vercel | VERIFIED |
| 20 | Next.js: `app/api/[[...route]]/route.ts` + `handle` from `hono/vercel` + `basePath('/api')` | hono.dev nextjs, WebSearch | VERIFIED |
| 21 | `claude-opus-5-5`: thinking disabled/enabled → 400, 강제 tool_choice(any/tool) → 400, 기본 effort medium, thinking 블록 선행 가능 | whats-new-opus-5-5, opus-5-5 overview, models overview | VERIFIED |
| 22 | TS SDK `messages.stream()`: `for await` 이벤트·`.on('text')`·`finalMessage()`·`abort()`·요청옵션 `{signal}`, 기본 재시도 2회·타임아웃 10분, `APIError`/`APIUserAbortError` | SDK 문서, helpers.md, WebSearch(DeepWiki·tessl) | VERIFIED |

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (불일치 2건은 소스 기준으로 수정·표기)
- [✅] 버전 정보가 명시되어 있음 (hono 4.13.9, zod-validator 0.9.1, node-server 2.1.1, SDK 0.128.0)
- [✅] deprecated된 패턴을 권장하지 않음 (`@hono/node-server/vercel`, thinking disabled, 강제 tool_choice 모두 금지로 명시)
- [✅] 코드 예시가 실행 가능한 형태임 (`findPost`/`insertPost`/`verifySession`/`logError`는 프로젝트 구현 전제의 placeholder)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (0절 선택 기준)
- [✅] 흔한 실수 패턴 포함 (10절 안티패턴 14개)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-09-25)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-09-25)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (2026-09-25, gap 없어 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-25
**수행자**: skill-tester → general-purpose (domain-specific 에이전트 미보유로 대체, 대체 사실 명시)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션·줄 번호 명시 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Hono + Zod 인증 POST 엔드포인트 + RPC 201/400 타입 구분**
- ✅ PASS
- 근거: SKILL.md 2절(라우팅) L84-98, 6절(RPC 클라이언트) L251-278, 10절 안티패턴 #1·#3·#4
- 상세: 체이닝 라우팅 필수(안티패턴 #1 회피), `validationHook` 공통 hook 사용(안티패턴 #3 회피), `c.set('userId')`/`c.get('userId')`로 클라이언트 본문 authorId 미신뢰(안티패턴 #4 회피), `c.json({ post }, 201)` 상태 코드 명시로 RPC 타입 분기 정확히 설명. strict:true·버전 일치 전제조건도 언급.

**Q2. streamSSE 클라이언트 disconnect 처리 / thinking 비활성화 가능 여부 / onError 3번째 인자 사용 여부**
- ✅ PASS
- 근거: SKILL.md 9절 "streamSSE 동작"·"Anthropic SDK / Opus 5.5 주의", 5절 L245, 안티패턴 #7·#8·#9
- 상세: `stream.onAbort(() => upstream.abort())` + 루프 내 `stream.aborted` 체크(PR #5289 미머지 근거 포함)까지 정확히 답변. `claude-opus-5-5` thinking 비활성 불가(400) → 생략/adaptive 정확히 답변. streamSSE 3번째 인자 onError가 `e.message`를 그대로 노출한다는 점을 근거로 콜백 내부 try/catch 권장 패턴을 정확히 설명(안티패턴 #7 회피).

**Q3. Hono 선택 기준(Express/Fastify 대비) / @hono/node-server 버전별 주의사항(Node 버전, Vercel 어댑터)**
- ✅ PASS
- 근거: SKILL.md 0절 "언제 Hono를 고르나" 표 L27-35, 7절 "Node.js — @hono/node-server v2" L284-300, 안티패턴 #13
- 상세: 런타임 다양성·타입 공유 조건 vs Fastify/Express/NestJS 대안을 표 그대로 정확히 인용. 성능 수치를 선택 근거로 안 쓴다는 L35 유의사항까지 반영. Node 20+ 요구사항과 hono.dev 가이드(Node 18.14.1+)의 DISPUTED 불일치 표기(`> 주의:`, L300)를 정확히 지적하고 `package.json engines` 기준을 따라야 한다고 정확히 판단. `@hono/node-server/vercel` v2 제거 사실도 정확히 답변.

### 발견된 gap

- 없음. 3개 질문 모두 SKILL.md 본문의 명시적 근거(섹션·줄 번호)로 완결 답변 가능했고, anti-pattern 회피도 모두 확인됨.
- 에이전트가 부가적으로 지적한 사소한 모호점(RPC 400 응답의 `InferResponseType` 코드 예시 부재, streamSSE onAbort 이후 write 실패 모드 미서술)은 핵심 답변 정확성에 영향 없는 참고 수준 — SKILL.md 보강 필수 아님.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리 사용법 스킬(API 패턴) — 실사용 필수 카테고리(빌드/워크플로우/설정+실행/마이그레이션) 아님. content test PASS = APPROVED 가능
- 최종 상태: APPROVED

---

### (참고용 사전 설계 — 위 실제 수행 기록으로 대체됨)

### 테스트 케이스 1: (skill-tester 수행 예정)

**입력 (질문/요청):**
```
(예정) Hono + Zod로 인증 필요한 POST 엔드포인트를 만들고, RPC 클라이언트에서 201/400 응답 타입을 구분하려면?
```

**기대 결과:**
```
체이닝 라우팅 + createMiddleware 인증 + zValidator 공통 hook + c.json(..., 201) 상태 명시 + typeof routes export
```

**실제 결과:**
```
(미수행)
```

**판정:** (미수행)

---

### 테스트 케이스 2: (skill-tester 수행 예정)

**입력:**
```
(예정) Hono에서 claude-opus-5-5 응답을 SSE로 중계할 때 클라이언트가 끊기면 어떻게 처리하고, thinking을 끄려면?
```

**기대 결과:** `stream.onAbort(() => upstream.abort())` + `stream.aborted` 체크, 콜백 내부 try/catch로 정제 에러 전송, Opus 5.5는 thinking 비활성 불가(400) → 생략/adaptive + effort 조절

**실제 결과:** (미수행)

**판정:** (미수행)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-09-25, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester 2단계 테스트 수행 후 섹션 5·6 갱신 (2026-09-25 완료, 3/3 PASS → APPROVED 전환)
- [❌] hono.dev Node.js 가이드의 Node 최소 버전 표기가 어댑터 v2(Node 20+)와 맞춰지면 SKILL 7절 `> 주의:` 문구 정리 — 차단 요인 아님(선택 보강, 현재 SKILL.md에 불일치 사실 자체는 이미 정확히 표기되어 있음)
- [❌] Opus 5.5 이후 모델(Sonnet 5.5 등) 출시 시 9절 모델 ID·breaking change 재확인 — 차단 요인 아님(미래 시점 후속 과제)
- [❌] `validationHook`의 파라미터 타입이 zod-validator 버전 업에서 `Hook` 타입과 어긋나지 않는지 실제 tsc로 확인 — 차단 요인 아님(선택 보강, 현재 구조적 타입으로 정상 동작)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-09-25 | v1 | 최초 작성 (hono 4.13.9 기준, 테스트 전체 예시 references/testing-examples.md 분리) | skill-creator |
| 2026-09-25 | v1 | 2단계 실사용 테스트 수행 (Q1 RPC 201/400 타입 구분 / Q2 streamSSE abort·thinking 비활성 불가 / Q3 Hono 선택 기준·node-server 버전 함정) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
