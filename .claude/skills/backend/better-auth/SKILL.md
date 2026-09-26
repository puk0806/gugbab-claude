---
name: better-auth
description: Better Auth(TypeScript 인증 라이브러리) 1.7.x 통합 패턴 — betterAuth() 서버 설정, Drizzle/Prisma 어댑터, 이메일·비밀번호 + OAuth 소셜 로그인, 세션(쿠키·만료·갱신·cookieCache), Next.js App Router·Hono 핸들러, createAuthClient, 플러그인(2FA·organization) 개요, 보안 체크리스트(CSRF·trustedOrigins·rate limit·secret)와 흔한 실수.
---

# Better Auth 통합 패턴

> 소스:
> - 공식 문서: https://www.better-auth.com/docs/installation , https://www.better-auth.com/docs/basic-usage , https://www.better-auth.com/docs/concepts/session-management , https://www.better-auth.com/docs/concepts/rate-limit , https://www.better-auth.com/docs/concepts/oauth , https://www.better-auth.com/docs/concepts/client , https://www.better-auth.com/docs/concepts/api , https://www.better-auth.com/docs/concepts/cli , https://www.better-auth.com/docs/reference/options , https://www.better-auth.com/docs/reference/security
> - 통합·어댑터: https://www.better-auth.com/docs/integrations/next , https://www.better-auth.com/docs/integrations/hono , https://www.better-auth.com/docs/adapters/drizzle , https://www.better-auth.com/docs/adapters/prisma
> - 인증·플러그인: https://www.better-auth.com/docs/authentication/email-password , https://www.better-auth.com/docs/authentication/google , https://www.better-auth.com/docs/plugins/2fa , https://www.better-auth.com/docs/plugins/organization , https://www.better-auth.com/docs/plugins/admin
> - 세션·저장소 상세(2026-09-26 추가): https://www.better-auth.com/docs/concepts/database (Secondary Storage 인터페이스·Redis 예시), npm `@better-auth/redis-storage`
> - GitHub: https://github.com/better-auth/better-auth (releases, `packages/better-auth/package.json`), 1.7 릴리스 블로그 https://better-auth.com/blog/1-7
>
> 검증일: 2026-09-25 (섹션 6·9·10 rate limit 키·secondaryStorage·강제 로그아웃 항목은 2026-09-26 보강)
> 기준 버전: `better-auth` **1.7.6** (npm dist-tag `latest`, 2026-09-24). 1.6 계열은 `release-1.6` 태그(1.6.33)로 유지보수 중.
> peer 범위(1.7.6 package.json): `next` ^14 / ^15 / ^16, `react` ^18 / ^19, `drizzle-orm` ^0.45.2 또는 >=1.0.0-rc.1, `@prisma/client` ^5 / ^6 / ^7

관련 스킬: Hono 라우팅·미들웨어 상세 → `backend/hono-api-patterns` / Prisma 상세 → `backend/prisma-orm` / 입력 검증 → `backend/zod-schema-validation` / Neon + Drizzle 연결 → `backend/drizzle-neon-postgres`

---

## 0. 언제 쓰나 / 쓰지 않나

| 상황 | 판단 |
|------|------|
| TS 풀스택(Next.js·Hono 등)에서 자체 DB에 사용자·세션을 두고 싶다 | **적합** — 세션 DB 저장 + httpOnly 쿠키가 기본 |
| 이메일·비밀번호 + 소셜 로그인 + 2FA·조직 기능을 빠르게 | **적합** — 플러그인으로 확장 |
| 순수 stateless JWT API(모바일 전용, DB 세션 불필요) | 직접 `jose` 구현 또는 `jwt`/`bearer` 플러그인 검토 |
| 외부 IdP(Auth0·Cognito 등)에 인증을 전부 위임 | Better Auth 불필요할 수 있음 |

---

## 1. 설치·환경변수

```bash
npm i better-auth
```

```bash
# .env — 절대 커밋하지 않는다
BETTER_AUTH_SECRET=<32자 이상 랜덤>   # openssl rand -base64 32  또는  npx auth@latest secret
BETTER_AUTH_URL=http://localhost:3000 # 서버 루트 URL (배포 시 https 도메인)
```

- `secret`을 옵션으로 안 넘기면 `BETTER_AUTH_SECRET` → `AUTH_SECRET` 순으로 읽는다. **프로덕션에서 미설정이면 에러를 던진다**(개발에선 기본값으로 동작하므로 배포 때 처음 터진다).
- 32자 미만이면 경고가 로깅된다.
- 키 교체는 `secrets: [{ version: 2, value: "new" }, { version: 1, value: "old" }]` 형태(버전 식별자로 복호화, 구 데이터는 lazy 재암호화).

### CLI — 패키지명이 바뀌었다

```bash
npx auth@latest generate   # ORM 스키마(Drizzle/Prisma) 또는 SQL 생성
npx auth@latest migrate    # DB에 직접 적용 — 내장 Kysely 어댑터 전용
npx auth@latest secret     # 시크릿 생성
```

> 주의: 구 패키지 `@better-auth/cli`(`npx @better-auth/cli generate`)는 **deprecated**. 오래된 튜토리얼의 명령은 `npx auth@latest ...`로 바꾼다. Drizzle/Prisma 사용 시 `migrate`는 쓰지 않고 각 ORM의 마이그레이션 도구로 적용한다.

---

## 2. 서버 설정 `betterAuth()`

```ts
// lib/auth.ts
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "./db";
import * as schema from "./db/schema";

export const auth = betterAuth({
  appName: "My App",
  baseURL: process.env.BETTER_AUTH_URL,
  // basePath 기본값 "/api/auth"
  database: drizzleAdapter(db, { provider: "pg", schema }),
  trustedOrigins: ["https://app.example.com"],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      void sendEmail({ to: user.email, subject: "Reset your password", text: url });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      void sendEmail({ to: user.email, subject: "Verify your email", text: url });
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7일 (기본값)
    updateAge: 60 * 60 * 24,     // 1일 (기본값)
  },
  plugins: [nextCookies()], // Next.js 서버 액션 사용 시. 반드시 마지막
});
```

주요 옵션(`reference/options`):

| 옵션 | 의미 |
|------|------|
| `baseURL` | 미지정 시 `BETTER_AUTH_URL`. 멀티 도메인이면 `{ allowedHosts: [...], protocol, fallback }` 객체 |
| `basePath` | 핸들러 마운트 경로. 기본 `/api/auth` |
| `trustedOrigins` | 허용 origin 목록. 와일드카드(`*.example.com`, `https://*.example.com`)와 `async (request) => string[]` 동적 함수 지원 |
| `user.additionalFields` | user 테이블 커스텀 컬럼 (`{ role: { type: "string" } }`) |
| `account.accountLinking` | `{ enabled, trustedProviders, allowDifferentEmails }` — 다중 provider 계정 연결 |
| `databaseHooks` | `user.create.before/after` 등 생명주기 훅 |
| `advanced.useSecureCookies` / `cookiePrefix` / `crossSubDomainCookies` / `defaultCookieAttributes` | 쿠키 제어 |

### 서버에서 API 직접 호출 — `auth.api`

```ts
import { headers } from "next/headers";
import { isAPIError } from "better-auth/api";

const session = await auth.api.getSession({ headers: await headers() }); // 없으면 null

try {
  await auth.api.signInEmail({
    body: { email, password },
    headers: await headers(),
  });
} catch (error) {
  if (isAPIError(error)) console.error(error.message, error.status);
}
```

- 인자는 `{ body, headers, query }` 객체로 넘긴다. 쿠키를 다루는 엔드포인트는 `headers`를 반드시 전달.
- `returnHeaders: true` → `{ headers, response }`, `asResponse: true` → `Response` 객체.
- 서버 쪽 `auth.api` 호출은 **rate limit이 적용되지 않는다**(클라이언트 발 요청만 대상). 공개 엔드포인트를 서버 액션으로 감쌀 때는 자체 제한을 고려.

---

## 3. DB 어댑터

기본 테이블: `user`, `session`, `account`, `verification`. 플러그인은 테이블·컬럼을 추가하므로 **플러그인 추가 후 항상 `generate` 재실행**.

### Drizzle

```bash
npm i @better-auth/drizzle-adapter drizzle-orm
npx auth@latest generate      # auth 스키마(.ts) 생성
npx drizzle-kit generate      # 마이그레이션 SQL
npx drizzle-kit migrate       # 적용
```

```ts
import { drizzleAdapter } from "@better-auth/drizzle-adapter";

drizzleAdapter(db, {
  provider: "pg",            // "pg" | "mysql" | "sqlite"
  schema: { ...schema, user: schema.users }, // 테이블명이 다르면 매핑
  // usePlural: true,        // 모든 테이블이 복수형일 때
});
```

- Drizzle Relations v2를 쓰면 `@better-auth/drizzle-adapter/relations-v2`에서 import(패키지는 동일).
- `advanced.database.joins: true` — 1.7부터 stable. Drizzle 스키마에 relations가 정의돼 있어야 한다.

> 주의: 공식 문서는 별도 패키지 `@better-auth/drizzle-adapter`를 안내하지만, `better-auth` 본체도 `better-auth/adapters/drizzle` 경로로 re-export한다(1.7.6 package.json `exports`에 존재, 어댑터 패키지를 dependencies로 포함). 기존 코드의 `better-auth/adapters/drizzle` import는 계속 동작한다. 1.7 블로그는 **모든 `@better-auth/*` 패키지를 같은 버전대로 함께 올리라**고 명시한다.

> 주의: Neon HTTP 드라이버(`drizzle-orm/neon-http`)는 interactive transaction(`db.transaction`)을 지원하지 않는다(`backend/drizzle-neon-postgres` 참조). 어댑터가 내부에서 트랜잭션을 요구하는 경로가 있는지는 **미검증** — 문제 발생 시 `neon-serverless`(WebSocket) 드라이버로 교체를 검토.

### Prisma

```ts
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma"; // 전역 싱글톤

prismaAdapter(prisma, { provider: "postgresql" });
```

```bash
npx auth@latest generate                      # schema.prisma에 모델 추가
npx prisma migrate dev --name add-better-auth
npx prisma generate
```

- Prisma 7은 `PrismaClient`에 드라이버 어댑터(예: `PrismaPg`)를 넘기는 구성이 공식 가이드 기준. Prisma 상세는 `backend/prisma-orm`.

---

## 4. 이메일·비밀번호

| 항목 | 기본값 / 동작 |
|------|--------------|
| 비밀번호 길이 | 최소 8, 최대 128 (`minPasswordLength` / `maxPasswordLength`) |
| 해시 | **scrypt**(Node 내장). `emailAndPassword.password: { hash, verify }`로 argon2 등 교체 가능 |
| 가입 후 자동 로그인 | `autoSignIn` 기본 `true` |
| 이메일 인증 강제 | `requireEmailVerification: true` → 미인증 로그인 시 **403** |
| 인증 메일 발송 시점 | `emailVerification.sendOnSignUp`(미지정 시 `requireEmailVerification`을 따름) |
| 이메일 열거 방지 | `requireEmailVerification: true` 또는 `autoSignIn: false`일 때 가입 응답이 기존 이메일 여부와 무관하게 동일 200 |

```ts
// 클라이언트
await authClient.signUp.email({ name, email, password, callbackURL: "/dashboard" });
const { data, error } = await authClient.signIn.email({ email, password, rememberMe: true });
if (error?.status === 403) { /* 이메일 인증 필요 */ }

await authClient.requestPasswordReset({ email, redirectTo: "https://example.com/reset-password" });
await authClient.resetPassword({ newPassword, token });
await authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/") } });
```

- **메일 발송을 `await` 하지 않는다** — 응답 시간 차로 계정 존재 여부가 드러나는 timing attack 방지(공식 권고). 서버리스(Vercel 등)에서는 함수가 먼저 종료될 수 있으므로 `waitUntil` 등으로 발송 완료를 보장.
- `revokeSessionsOnPasswordReset: true` — 비밀번호 재설정 시 다른 세션 전부 종료.

---

## 5. OAuth 소셜 로그인

```ts
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    accessType: "offline",              // refresh token 필요 시
    prompt: "select_account consent",
  },
},
```

- 콜백 URL 기본값: `{baseURL}/api/auth/callback/{provider}` — provider 콘솔에 로컬(`http://localhost:3000/api/auth/callback/google`)과 운영 URL을 **둘 다** 등록.
- `baseURL`이 틀리면 콜백 URL이 잘못 조립된다(redirect_uri_mismatch의 흔한 원인).

```ts
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
  errorCallbackURL: "/error",
  newUserCallbackURL: "/onboarding",
});
await authClient.linkSocial({ provider: "google", scopes: ["https://www.googleapis.com/auth/drive.file"] });
const { accessToken } = await authClient.getAccessToken({ accountId });
```

provider 옵션: `scope`, `redirectURI`, `mapProfileToUser`, `disableSignUp`(신규 가입 차단), `disableImplicitSignUp`.
OAuth state(CSRF 방지)·PKCE(코드 인젝션 방지)는 Better Auth가 저장·검증한다. 외부로 나가는 OAuth 요청은 HTTP 리다이렉트를 따르지 않는다.

---

## 6. 세션 관리

- 세션은 **DB에 저장**되고 브라우저에는 `session_token` httpOnly 쿠키가 간다.
- 기본: `expiresIn` 7일, `updateAge` 1일(사용 시 1일 경과마다 만료를 연장), `freshAge` 1일(민감 작업용 "fresh" 판정, `0`이면 비활성).
- `disableSessionRefresh: true` → 연장 끔. `deferSessionRefresh: true` → GET은 읽기 전용, 갱신은 클라이언트가 POST로 수행.

### cookieCache — DB 조회 줄이기

```ts
session: {
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60,                // 초
    strategy: "compact",           // 기본. "jwt" | "jwe"(암호화) 선택 가능
    refreshCache: { updateAge: 60 },
    // version: "2",               // 바꾸면 모든 캐시 세션 무효화
  },
},
```

> 주의: cookieCache를 켜면 **세션을 revoke해도 다른 기기에서는 `maxAge`까지 유효**하다(서버가 타 기기 쿠키를 지울 수 없음). 즉시 무효화가 중요한 화면은 `authClient.getSession({ query: { disableCookieCache: true } })`로 DB를 강제 조회한다.

- **`auth.api.getSession()`(서버)도 cookieCache 적용 대상이다.** 공식 문서는 `disableCookieCache: true`를 `authClient.getSession()`뿐 아니라 서버의 `auth.api.getSession({ query: { disableCookieCache: true }, headers })` 예시로도 제시한다 — 옵션이 서버 호출에도 존재한다는 것 자체가 서버 경로도 기본적으로 캐시를 거친다는 뜻이다. 따라서 Next.js 서버 컴포넌트에서 `auth.api.getSession()`으로 "진짜 보호"를 한다고 해도, cookieCache가 켜져 있으면 그 검증 결과 자체가 최대 `maxAge`만큼 오래된 값일 수 있다. **revoke 직후 즉시 반영이 필요한 서버 경로**(관리자 강제 로그아웃 직후 재검증 등)는 `disableCookieCache: true`를 명시한다.

### 6-1. secondaryStorage — Redis 설정 예시

```bash
npm i @better-auth/redis-storage ioredis   # 공식 Redis 저장소 패키지 (better-auth 팀 유지보수)
```

```ts
// lib/auth.ts
import { betterAuth } from "better-auth";
import { Redis } from "ioredis";
import { redisStorage } from "@better-auth/redis-storage";

const redis = new Redis(process.env.REDIS_URL!);

export const auth = betterAuth({
  // ...
  secondaryStorage: redisStorage({ client: redis, keyPrefix: "better-auth:" }),
});
```

- `secondaryStorage`를 설정하면 세션·rate limit 카운터 등 자주 읽고 쓰는 값이 DB 대신 여기로 간다(공식 문서: "session data, rate limit counters" 등).
- 공식 패키지 없이 직접 구현할 때는 `get`/`set`/`delete`(+`getAndDelete`/`increment`) 메서드를 갖춘 객체를 넘긴다. Redis라면 `set(key, value, "EX", ttl)`처럼 TTL을 반드시 함께 넘기고, 다른 앱과 같은 Redis를 공유한다면 `keyPrefix`로 키를 분리한다.
- Vercel·Workers 등 서버리스에서 `storage: "database"` 대신(또는 함께) 쓸 수 있는 선택지다 — 스키마 마이그레이션 없이 rate limit·세션을 외부화하고 싶을 때 더 가볍다.

### 세션 조회·폐기

```ts
const { data: session, isPending, error, refetch } = authClient.useSession(); // React
await authClient.listSessions();
await authClient.revokeSession({ token });
await authClient.revokeOtherSessions();
await authClient.revokeSessions();
```

타입: `typeof auth.$Infer.Session` (`session.user`, `session.session`).

### 관리자용 서버사이드 강제 로그아웃

클라이언트 `authClient.revoke*`는 **본인 세션만** 대상이다. 관리자가 *다른 사용자*의 세션을 서버에서 강제로 끊으려면 `auth.api`를 직접 호출한다(호출하는 쪽이 관리자 권한인지는 앱 코드가 검사해야 한다 — Better Auth가 대신 인가하지 않음):

```ts
// 특정 토큰 하나만 무효화
await auth.api.revokeUserSession({ body: { sessionToken }, headers: await headers() });

// 특정 유저의 모든 세션 무효화 ("전 기기 강제 로그아웃")
await auth.api.revokeUserSessions({ body: { userId }, headers: await headers() });

// 계정 정지 + 기존 세션 전부 무효화 (admin 플러그인)
await auth.api.banUser({ body: { userId, banReason: "ToS 위반" }, headers: await headers() });
```

- `revokeUserSessions`는 admin 플러그인 없이도 존재하는 서버 API다(§9의 `admin` 플러그인은 역할·권한 관리를 추가할 뿐).
- cookieCache가 켜져 있으면 강제 로그아웃 직후에도 대상 유저의 다른 기기가 `maxAge`까지 낙관적으로 유효할 수 있다 — 즉시 차단이 요구사항이면 위 cookieCache 주의사항과 함께 검토한다.

---

## 7. 프레임워크 통합

### Next.js App Router

```ts
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

```tsx
// 서버 컴포넌트 / 서버 액션 / 라우트 핸들러 — 진짜 보호는 여기서
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const session = await auth.api.getSession({ headers: await headers() });
if (!session) redirect("/sign-in");
```

- 서버 액션에서 `auth.api.signInEmail` 등 쿠키를 설정하는 호출을 하려면 `nextCookies()` 플러그인 필요 — **plugins 배열 마지막**에 둔다(뒤에 오는 플러그인의 Set-Cookie가 유실됨).
- Next.js 16 `proxy.ts`(구 middleware)는 Node 런타임이라 `auth.api.getSession()`으로 **전체 검증** 가능.
- `getSessionCookie(request)`(`better-auth/cookies`)는 **쿠키 존재만 확인하고 검증하지 않는다** — 낙관적 리다이렉트 용도로만. 쿠키명/prefix를 커스텀했다면 같은 설정을 넘겨야 한다.

```ts
// proxy.ts — 낙관적 리다이렉트 (보안 경계 아님)
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ["/dashboard/:path*"] };
```

### Hono

```ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { auth } from "./auth";

type Env = { Variables: { session: typeof auth.$Infer.Session | null } };

const app = new Hono<Env>();

// CORS는 auth 라우트보다 먼저 등록 (늦으면 preflight 실패)
app.use("/api/auth/*", cors({ origin: "http://localhost:3001", credentials: true }));
app.all("/api/auth/*", (c) => auth.handler(c.req.raw));

const sessionMiddleware = createMiddleware<Env>(async (c, next) => {
  c.set("session", await auth.api.getSession({ headers: c.req.raw.headers }));
  await next();
});

app.get("/me", sessionMiddleware, (c) => {
  const session = c.get("session");
  if (!session) throw new HTTPException(401);
  return c.json({ user: session.user });
});
```

- `credentials: true`이면 CORS `origin`에 `*` 금지 → 명시 origin + 같은 값을 `trustedOrigins`에도 추가.
- Cloudflare Workers: `AsyncLocalStorage` 때문에 `wrangler.jsonc`에 `"compatibility_flags": ["nodejs_compat"]`.
- Hono RPC 클라이언트로 교차 출처 호출 시 `hc(url, { init: { credentials: "include" } })`.
- 라우팅·에러 핸들링 상세 → `backend/hono-api-patterns`.

---

## 8. 클라이언트 `createAuthClient`

```ts
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react"; // /vue /svelte /solid, 프레임워크 무관: "better-auth/client"
import { twoFactorClient, organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // 같은 도메인이면 생략 가능
  plugins: [twoFactorClient(), organizationClient()],
  fetchOptions: {
    onError(ctx) {
      if (ctx.response.status === 429) {
        const retry = ctx.response.headers.get("X-Retry-After");
      }
    },
  },
});
```

- 모든 메서드는 `{ data, error }` 반환(`error.message`, `error.status`, `error.statusText`). throw하지 않으므로 **`error` 확인을 빠뜨리지 말 것**.
- 서버 플러그인과 **짝이 되는 클라이언트 플러그인**을 등록해야 `authClient.twoFactor.*` 같은 메서드·타입이 생긴다.

---

## 9. 플러그인 개요

| 플러그인 | 서버 import | 클라이언트 import | 요지 |
|----------|-------------|-------------------|------|
| 2FA | `twoFactor` from `better-auth/plugins` | `twoFactorClient` from `better-auth/client/plugins` | TOTP(기본)·OTP(`sendOTP` 구현 필요)·백업 코드. 로그인 응답에 `twoFactorRedirect: true` → `onTwoFactorRedirect`에서 처리. `authClient.twoFactor.enable({ password })`, `verifyTotp({ code, trustDevice })`. issuer 기본값은 `appName` |
| organization | `organization` from `better-auth/plugins` | `organizationClient` | 조직·멤버·초대. 기본 역할 `owner`/`admin`/`member`, 세션에 `activeOrganizationId`. 초대 메일은 `sendInvitationEmail` 구현. 커스텀 권한은 `createAccessControl` from `better-auth/plugins/access` |
| 기타 | `admin`, `magicLink`, `bearer`, `jwt` 등 | 대응 client 플러그인 | 필요 시 공식 문서 개별 확인 |

- 플러그인 추가 = 스키마 변경 → `npx auth@latest generate` 후 ORM 마이그레이션.
- 1.7에서 MCP 플러그인은 별도 패키지 `@better-auth/mcp`로 분리, SCIM은 organization에서 분리됐다.

---

## 10. 보안 체크리스트

- [ ] **secret**: 32자 이상 랜덤, 환경변수로만 주입, 환경별로 다르게. 코드·레포에 하드코딩 금지
- [ ] **baseURL**: 운영은 https 도메인으로 정확히. 프록시 뒤라면 호스트 추론에 의존하지 말고 명시
- [ ] **trustedOrigins**: 프론트가 다른 origin이면 명시 등록. `callbackURL`/`redirectTo`는 trusted origin이어야 통과 → open redirect 방지. 와일드카드는 최소 범위로
- [ ] **CSRF**: Origin 검증 + Fetch Metadata(`Sec-Fetch-*`) + `SameSite=Lax` 쿠키가 기본. `advanced.disableCSRFCheck: true`는 켜지 않는다(공식 문서: CSRF 공격에 노출)
- [ ] **쿠키**: httpOnly + (HTTPS에서) Secure + SameSite=Lax 기본값 유지. cross-site가 꼭 필요할 때만 `defaultCookieAttributes`로 `sameSite: "none"` + `secure: true`
- [ ] **rate limit**: 프로덕션에서 기본 활성(개발에선 비활성) — 60초/100회, `/sign-in/email`은 10초/3회. 초과 시 429 + `X-Retry-After`. `customRules`로 경로별 조정
- [ ] **rate limit 판정 키**: 계정(이메일 등) 기준이 아니라 **연결 IP 주소** 기준(공식 문서: "Rate limiting uses the connecting IP address to track the number of requests"). IP는 `x-forwarded-for`(기본, 헤더명은 `advanced.ipAddress.ipAddressHeaders`로 조정) 헤더에서 추출하고, IPv6는 `/64` 서브넷 단위로 정규화해 우회를 막는다. **로그인 실패를 계정 단위로 잠그는 기능이 아니므로**, 같은 계정을 여러 IP로 공격하는 시나리오까지 막으려면 앱 레벨에서 계정 기준 잠금을 추가해야 한다
- [ ] **rate limit 저장소**: 기본 `memory`는 **서버리스에서 무의미**(인스턴스마다 초기화). Vercel·Workers는 `storage: "database"`(스키마 필요) 또는 `secondaryStorage`(Redis 등, §6-1 예시)
- [ ] **IP 헤더**: 프록시 뒤라면 `advanced.ipAddress.ipAddressHeaders`(예: `cf-connecting-ip`)를 설정하되, **최종 사용자가 그 헤더를 위조할 수 없는** 구성인지 확인
- [ ] **이메일 인증·열거 방지**: `requireEmailVerification: true` 권장, 메일 발송은 await 없이(서버리스는 `waitUntil`)
- [ ] **보호 리소스**: 매 서버 핸들러에서 `auth.api.getSession()`으로 검증. 쿠키 존재 체크(`getSessionCookie`)만으로 인가 금지. 소유권(IDOR) 검사는 앱 코드 책임
- [ ] **즉시 무효화 요구**: cookieCache 사용 시 revoke 지연(`maxAge`)을 수용할 수 있는지 판단

---

## 11. 흔한 실수

| 실수 | 결과 | 해결 |
|------|------|------|
| `npx @better-auth/cli generate` 사용 | deprecated CLI | `npx auth@latest generate` |
| 플러그인 추가 후 스키마 미생성 | 런타임 컬럼/테이블 없음 에러 | `generate` → ORM 마이그레이션 |
| Drizzle/Prisma인데 `npx auth migrate` | Kysely 전용이라 동작 안 함 | drizzle-kit / prisma migrate 사용 |
| 운영에 `BETTER_AUTH_SECRET` 미설정 | 프로덕션 기동 시 에러 | 배포 환경변수 등록 |
| `nextCookies()`를 중간에 배치 | 서버 액션에서 일부 쿠키 유실 | plugins 배열 마지막 |
| `getSessionCookie`로 페이지 보호 완료로 간주 | 가짜 쿠키로 우회 | 서버에서 `getSession` 재검증 |
| Hono에서 CORS를 auth 라우트 뒤에 등록 / `origin: "*"` + credentials | preflight 실패, 쿠키 미전송 | CORS 먼저, 명시 origin, trustedOrigins 동기화 |
| 프론트 origin을 `trustedOrigins`에 누락 | origin 검증 실패로 요청 거부 | 등록 |
| OAuth 콜백 URL을 provider 콘솔에 로컬/운영 하나만 등록 | redirect_uri_mismatch | 두 환경 모두 등록, `baseURL` 확인 |
| 서버리스 + 기본 memory rate limit | 제한이 사실상 없음 | database / secondaryStorage |
| `sendVerificationEmail`에서 `await sendEmail()` | timing attack으로 계정 존재 노출 | `void` + `waitUntil` |
| 클라이언트 `{ error }` 무시 | 실패를 성공으로 처리 | 반환값의 `error` 분기 |
| 서버 액션 로그인에 rate limit 기대 | `auth.api` 호출은 rate limit 제외 | 앱 레벨 제한 추가 |
| `@better-auth/*` 패키지 버전 혼재 | 타입·런타임 불일치 | 함께 업그레이드 |

---

## 12. 테스트 관점 (적대적 케이스)

인증 코드 테스트에는 정상 로그인 외에 반드시 다음을 포함한다:
- 비로그인 → 보호 라우트 401, 타 유저 리소스 접근 → 403(IDOR)
- 위조·만료 `session_token` 쿠키, 수동 생성 쿠키 → 거부
- 신뢰되지 않은 `Origin`의 POST → 거부, 외부 도메인 `callbackURL` → 거부
- `/sign-in/email` 연속 실패 → 429
- 비밀번호 경계값(7자·129자), 빈 값, 초장문 이메일 → 검증 에러
- 미인증 이메일 로그인 → 403 (requireEmailVerification 사용 시)
