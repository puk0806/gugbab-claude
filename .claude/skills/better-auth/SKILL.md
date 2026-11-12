---
name: better-auth
description: Better Auth 1.7.x 최근 변경점(CLI `auth` 패키지 이전·어댑터 패키지 분리·joins stable·MCP/SCIM 분리)과 실측 함정 — cookieCache revoke 지연(서버 getSession 포함), rate limit 기본값·IP 기준·서버 호출 제외, secondaryStorage, admin 강제 로그아웃, nextCookies 순서·getSessionCookie 비검증
---

# Better Auth 통합 패턴

> 소스:
> - 공식 문서: https://www.better-auth.com/docs/installation , https://www.better-auth.com/docs/basic-usage , https://www.better-auth.com/docs/concepts/session-management , https://www.better-auth.com/docs/concepts/rate-limit , https://www.better-auth.com/docs/concepts/oauth , https://www.better-auth.com/docs/concepts/client , https://www.better-auth.com/docs/concepts/api , https://www.better-auth.com/docs/concepts/cli , https://www.better-auth.com/docs/reference/options , https://www.better-auth.com/docs/reference/security
> - 통합·어댑터: https://www.better-auth.com/docs/integrations/next , https://www.better-auth.com/docs/integrations/hono , https://www.better-auth.com/docs/adapters/drizzle , https://www.better-auth.com/docs/adapters/prisma
> - 인증·플러그인: https://www.better-auth.com/docs/authentication/email-password , https://www.better-auth.com/docs/authentication/google , https://www.better-auth.com/docs/plugins/2fa , https://www.better-auth.com/docs/plugins/organization , https://www.better-auth.com/docs/plugins/admin
> - 세션·저장소 상세(2026-09-26 추가): https://www.better-auth.com/docs/concepts/database (Secondary Storage 인터페이스·Redis 예시), npm `@better-auth/redis-storage`
> - GitHub: https://github.com/better-auth/better-auth (releases, `packages/better-auth/package.json`), 1.7 릴리스 블로그 https://better-auth.com/blog/1-7
>
> 검증일: 2026-11-06
> 기준 버전: `better-auth` **1.7.18** (npm dist-tag `latest`, 2026-11-05). 1.6 계열은 `release-1.6` 태그(1.6.34)로 유지보수 중. 1.8은 `beta` 태그(1.8.0-beta.6)만 있고 정식 미출시.
> peer 범위(1.7.18 package.json): `next` ^14 / ^15 / ^16, `react` ^18 / ^19, `drizzle-orm` ^0.45.2 또는 >=1.0.0-rc.1 <2.0.0, `@prisma/client` ^5 / ^6 / ^7

관련 스킬: Prisma 상세 → `prisma-orm` / 입력 검증 → `zod-schema-validation` / Neon + Drizzle 연결 → `drizzle-neon-postgres`

---

## 이 스킬의 범위

1.7.x 기준 최근 변경점, 기본값을 잘못 알기 쉬운 곳, 문서만 보면 놓치는 보안 함정만 싣는다.
> 기본 사용법(betterAuth() 설정·signIn/signUp·useSession·라우트 핸들러 예제)은 공식 문서 수준이라 싣지 않는다.

---

## 1. 최근 변경점 (오래된 튜토리얼과 다른 곳)

| 항목 | 현재 (1.7.x) |
|------|-------------|
| CLI | `npx auth@latest generate / migrate / secret / upgrade`(그 외 init·check·info·create-admin). `upgrade`는 better-auth + `@better-auth/*`를 CLI 버전으로 함께 올림 |
| Drizzle 어댑터 | 공식 문서는 별도 패키지 `@better-auth/drizzle-adapter`. Relations v2는 `@better-auth/drizzle-adapter/relations-v2` |
| `advanced.database.joins: true` | 1.7부터 stable. Drizzle 스키마에 relations가 정의돼 있어야 한다 |
| MCP·SCIM | 1.7에서 MCP 플러그인은 별도 패키지 `@better-auth/mcp`로 분리, SCIM은 organization에서 분리 |
| 시크릿 키 교체 | `secrets: [{ version: 2, value: "new" }, { version: 1, value: "old" }]`(버전 식별자로 복호화, 구 데이터는 lazy 재암호화) |
| 비밀번호 해시 기본 | **scrypt**(Node 내장). `emailAndPassword.password: { hash, verify }`로 교체 가능 |

> 주의: 구 패키지 `@better-auth/cli`(`npx @better-auth/cli generate`)는 **deprecated**. 오래된 튜토리얼의 명령은 `npx auth@latest ...`로 바꾼다. Drizzle/Prisma 사용 시 `migrate`는 쓰지 않고(내장 Kysely 어댑터 전용) 각 ORM의 마이그레이션 도구로 적용한다.

> 주의: 공식 문서는 별도 패키지 `@better-auth/drizzle-adapter`를 안내하지만, `better-auth` 본체도 `better-auth/adapters/drizzle` 경로로 re-export한다(1.7.6·1.7.18 package.json `exports`에 존재, 어댑터 패키지를 dependencies로 포함). 기존 코드의 `better-auth/adapters/drizzle` import는 계속 동작한다. 1.7 블로그는 **모든 `@better-auth/*` 패키지를 같은 버전대로 함께 올리라**고 명시한다.

> 주의: Neon HTTP 드라이버(`drizzle-orm/neon-http`)는 interactive transaction(`db.transaction`)을 지원하지 않는다(`drizzle-neon-postgres` 참조). 어댑터가 내부에서 트랜잭션을 요구하는 경로가 있는지는 **미검증** — 문제 발생 시 `neon-serverless`(WebSocket) 드라이버로 교체를 검토.

- Prisma 7은 `PrismaClient`에 드라이버 어댑터(예: `PrismaPg`)를 넘기는 구성이 공식 가이드 기준. Prisma 상세는 `prisma-orm`.
- 플러그인은 테이블·컬럼을 추가하므로 **플러그인 추가 후 항상 `generate` 재실행** → ORM 마이그레이션.

---

## 2. 배포 때 처음 터지는 것

- `secret` 미지정 시 `BETTER_AUTH_SECRET` → `AUTH_SECRET` 순으로 읽는다. **프로덕션에서 미설정이면 에러를 던진다**(개발에선 기본값으로 동작). 32자 미만이면 경고 로깅.
- `baseURL`이 틀리면 OAuth 콜백 URL(`{baseURL}/api/auth/callback/{provider}`)이 잘못 조립된다 — redirect_uri_mismatch의 흔한 원인. provider 콘솔에 로컬·운영 URL **둘 다** 등록. 멀티 도메인이면 `baseURL: { allowedHosts, protocol, fallback }`.
- 메일 발송(`sendVerificationEmail`·`sendResetPassword`)은 **`await` 하지 않는다** — 응답 시간 차로 계정 존재 여부가 드러나는 timing attack 방지(공식 권고). 서버리스에서는 함수가 먼저 종료될 수 있으므로 `waitUntil` 등으로 발송 완료를 보장.
- 이메일 열거 방지: `requireEmailVerification: true` 또는 `autoSignIn: false`일 때 가입 응답이 기존 이메일 여부와 무관하게 동일 200. 미인증 로그인은 **403**.

---

## 3. 세션 — cookieCache 함정

- 세션 기본: `expiresIn` 7일, `updateAge` 1일, `freshAge` 1일(`0`이면 비활성). `deferSessionRefresh: true` → GET은 읽기 전용, 갱신은 클라이언트가 POST로.
- cookieCache `strategy`: `"compact"`(기본) | `"jwt"` | `"jwe"`. `version`을 바꾸면 모든 캐시 세션 무효화.

> 주의: cookieCache를 켜면 **세션을 revoke해도 다른 기기에서는 `maxAge`까지 유효**하다(서버가 타 기기 쿠키를 지울 수 없음). 즉시 무효화가 중요한 화면은 `authClient.getSession({ query: { disableCookieCache: true } })`로 DB를 강제 조회한다.

- **`auth.api.getSession()`(서버)도 cookieCache 적용 대상이다.** 공식 문서는 `disableCookieCache: true`를 서버의 `auth.api.getSession({ query: { disableCookieCache: true }, headers })` 예시로도 제시한다. Next.js 서버 컴포넌트에서 `getSession`으로 보호해도, cookieCache가 켜져 있으면 결과가 최대 `maxAge`만큼 오래된 값일 수 있다. **revoke 직후 즉시 반영이 필요한 서버 경로**는 `disableCookieCache: true`를 명시한다.

### secondaryStorage (Redis)

- 공식 패키지 `@better-auth/redis-storage`(`redisStorage({ client, keyPrefix })`). 세션·rate limit 카운터 등이 DB 대신 여기로 간다.
- 직접 구현 시 `get`/`set`/`delete`(+`getAndDelete`/`increment`). Redis라면 `set(key, value, "EX", ttl)`처럼 TTL을 반드시 넘기고, 공유 Redis면 `keyPrefix`로 분리.
- `secondaryStorage`를 설정하면 `rateLimit.storage` 기본값이 자동으로 `"secondary-storage"`가 되며(1.7.x 소스 확인), 이때 저장소에 `increment`가 없으면 에러를 던진다.

### 관리자 강제 로그아웃 = admin 플러그인 전용

- 클라이언트 `authClient.revoke*`는 **본인 세션만** 대상. 다른 사용자 세션은 admin 플러그인의 `auth.api.revokeUserSession({ body: { sessionToken } })`·`revokeUserSessions({ body: { userId } })`·`banUser({ body: { userId, banReason } })`(banExpiresIn: 초, 생략 시 무기한).
- 1.7.18 소스: `plugins/admin/routes.mjs`의 `/admin/revoke-user-session(s)`·`/admin/ban-user`. admin 플러그인 없이는 `auth.api.revokeUserSessions`가 존재하지 않는다.
- 각 엔드포인트에 `adminMiddleware` — `headers`로 넘긴 **호출자 세션**이 필요하고 그 역할에 `session: ["revoke"]`·`user: ["ban"]` 권한이 있어야 한다(기본 `admin` 역할 또는 `adminUserIds`). **`headers` 없이 백그라운드 작업에서 호출하면 실패**한다.
- cookieCache가 켜져 있으면 강제 로그아웃 직후에도 대상 유저 다른 기기가 `maxAge`까지 유효할 수 있다.

---

## 4. 프레임워크 통합 함정

- `nextCookies()` 플러그인(서버 액션에서 쿠키 설정 시 필요)은 **plugins 배열 마지막** — 뒤에 오는 플러그인의 Set-Cookie가 유실됨.
- Next.js 16 `proxy.ts`(구 middleware)는 Node 런타임이라 `auth.api.getSession()`으로 **전체 검증** 가능.
- `getSessionCookie(request)`(`better-auth/cookies`)는 **쿠키 존재만 확인하고 검증하지 않는다** — 낙관적 리다이렉트 용도로만. 쿠키명/prefix를 커스텀했다면 같은 설정을 넘겨야 한다.
- Hono: CORS 미들웨어를 auth 라우트(`app.all("/api/auth/*", (c) => auth.handler(c.req.raw))`)보다 **먼저** 등록(늦으면 preflight 실패). `credentials: true`면 `origin: "*"` 금지 → 명시 origin + 같은 값을 `trustedOrigins`에도.
- Cloudflare Workers: `AsyncLocalStorage` 때문에 `wrangler.jsonc`에 `"compatibility_flags": ["nodejs_compat"]`.
- Hono RPC 교차 출처 호출: `hc(url, { init: { credentials: "include" } })`.
- 클라이언트 메서드는 throw하지 않고 `{ data, error }` 반환 — `error` 분기 누락 주의. 서버 플러그인과 짝인 클라이언트 플러그인을 등록해야 `authClient.twoFactor.*` 등이 생긴다.

---

## 5. 보안 — 기본값과 한계

- **rate limit**: 프로덕션에서 기본 활성(개발에선 비활성) — 기본 **10초/100회**(`window: 10`, `max: 100`). 내장 엄격 규칙: `/sign-in*`·`/sign-up*`·`/change-password`·`/change-email`은 **10초/3회**, `/request-password-reset`·`/send-verification-email` 등 메일 발송 경로는 **60초/3회**. 초과 시 429 + `X-Retry-After`(초). `customRules`로 경로별 조정
  > 주의: 2026-11-06 검증 때 정정 — 이전 판의 "60초/100회"는 틀린 값이었다(공식 options 문서 `window` default `10`, 1.7.6·1.7.18 소스 모두 `window || 10`).
- **서버 쪽 `auth.api` 호출은 rate limit이 적용되지 않는다**(클라이언트 발 요청만 대상). 서버 액션으로 로그인을 감싸면 앱 레벨 제한 필요.
- **판정 키는 연결 IP**(계정 아님, 공식: "Rate limiting uses the connecting IP address"). `x-forwarded-for`(기본, `advanced.ipAddress.ipAddressHeaders`로 조정)에서 추출, IPv6는 `/64` 서브넷 단위 정규화. 계정 단위 잠금이 아니므로 다중 IP 공격은 앱 레벨에서 막아야 한다.
- **저장소**: 기본 `memory`는 **서버리스에서 무의미**(인스턴스마다 초기화). `storage: "database"`(스키마 필요) 또는 `"secondary-storage"`. 완전 커스텀은 원자적 `consume` 하나를 구현하는 `customStorage`.
- **IP 헤더**: 프록시 뒤라면 `ipAddressHeaders`(예: `cf-connecting-ip`)와 `advanced.ipAddress.trustedProxies`를 설정하되 최종 사용자가 그 헤더를 위조할 수 없는 구성인지 확인. `disableIpTracking: true`는 HTTP 요청의 내장 rate limit도 꺼 버린다.
- **CSRF**: Origin 검증 + Fetch Metadata(`Sec-Fetch-*`) + `SameSite=Lax`가 기본. `advanced.disableCSRFCheck: true`는 켜지 않는다. `callbackURL`/`redirectTo`는 trusted origin이어야 통과(open redirect 방지). `trustedOrigins`는 와일드카드와 `async (request) => string[]` 지원 — 최소 범위로.
- OAuth state·PKCE는 Better Auth가 저장·검증한다. 외부로 나가는 OAuth 요청은 HTTP 리다이렉트를 따르지 않는다.

---

## 6. 흔한 실수

| 실수 | 결과 | 해결 |
|------|------|------|
| `npx @better-auth/cli generate` 사용 | deprecated CLI | `npx auth@latest generate` |
| Drizzle/Prisma인데 `npx auth migrate` | Kysely 전용이라 동작 안 함 | drizzle-kit / prisma migrate |
| 플러그인 추가 후 스키마 미생성 | 컬럼/테이블 없음 에러 | `generate` → ORM 마이그레이션 |
| 운영에 `BETTER_AUTH_SECRET` 미설정 | 프로덕션 기동 시 에러 | 배포 환경변수 등록 |
| `nextCookies()`를 중간에 배치 | 서버 액션에서 일부 쿠키 유실 | 마지막에 |
| `getSessionCookie`로 페이지 보호 완료로 간주 | 가짜 쿠키로 우회 | 서버에서 `getSession` 재검증 |
| cookieCache + 즉시 revoke 기대 | `maxAge`까지 유효 | `disableCookieCache: true` |
| 서버리스 + 기본 memory rate limit | 제한이 사실상 없음 | database / secondaryStorage |
| 서버 액션 로그인에 rate limit 기대 | `auth.api` 호출은 제외 | 앱 레벨 제한 |
| `sendVerificationEmail`에서 `await sendEmail()` | timing attack으로 계정 존재 노출 | `void` + `waitUntil` |
| `@better-auth/*` 패키지 버전 혼재 | 타입·런타임 불일치 | 함께 업그레이드 |
