---
skill: better-auth
category: backend
version: v1
date: 2026-11-06
status: APPROVED
---

# better-auth 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `better-auth` |
| 스킬 경로 | `.claude/skills/better-auth/SKILL.md` |
| 검증일 | 2026-11-06 (재검증, 이전 2026-09-26) |
| 검증자 | skill-creator 에이전트 |
| 스킬 버전 | v1 |
| 기준 버전 | `better-auth` 1.7.18 (npm `latest`, 2026-11-05) — 이전 1.7.6 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (better-auth.com/docs — installation, session, rate-limit, oauth, client, api, cli, options, security, next, hono, drizzle, prisma, email-password, google, 2fa, organization)
- [✅] 공식 GitHub 2순위 소스 확인 (releases, `packages/better-auth/package.json`, `docs/content/docs/*.mdx` 원문)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-09-25, npm registry dist-tags로 1.7.6 확인)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성 (서버 설정, 어댑터, 이메일/OAuth, 세션, Next.js/Hono, 클라이언트)
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 스타일 확인 | Read | `typescript-backend-developer` 에이전트, `drizzle-neon-postgres`, `jwt-auth` 스킬 | 소스·검증일·기준 버전 헤더 + 요약표 + 주의 표기 스타일 채택 |
| 조사 | WebFetch | registry.npmjs.org/better-auth, GitHub releases, package.json, 공식 docs 17개 페이지(원문 mdx 포함) | 최신 1.7.6 확인, CLI 패키지 `auth`로 전환, 어댑터 별도 패키지화, 세션·rate limit 기본값, Next 16 proxy 패턴 수집 |
| 조사 | WebFetch | better-auth.com/blog/1-7, releasebot.io | 1.7 공개일 2026-08-17(블로그)·1.7.0 태그 2026-08-18, 1.7.x 릴리스 날짜 |
| 교차 검증 | WebSearch | 12개 클레임, 독립 소스(공식 docs·GitHub 이슈/PR·npm·서드파티 가이드) | VERIFIED 12 / DISPUTED 1(수정 반영) / UNVERIFIED 1(주의 표기) |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Better Auth Installation | https://www.better-auth.com/docs/installation | ⭐⭐⭐ High | 2026-09-25 | 공식 문서 |
| Session Management | https://www.better-auth.com/docs/concepts/session-management | ⭐⭐⭐ High | 2026-09-25 | 공식 문서 |
| Rate Limit | https://www.better-auth.com/docs/concepts/rate-limit | ⭐⭐⭐ High | 2026-09-25 | 공식 문서 |
| OAuth | https://www.better-auth.com/docs/concepts/oauth | ⭐⭐⭐ High | 2026-09-25 | 공식 문서 |
| Client | https://www.better-auth.com/docs/concepts/client | ⭐⭐⭐ High | 2026-09-25 | 공식 문서 |
| API | https://www.better-auth.com/docs/concepts/api | ⭐⭐⭐ High | 2026-09-25 | 공식 문서 |
| CLI | https://www.better-auth.com/docs/concepts/cli | ⭐⭐⭐ High | 2026-09-25 | 공식 문서 |
| Options | https://www.better-auth.com/docs/reference/options | ⭐⭐⭐ High | 2026-09-25 | 공식 문서 |
| Security | https://www.better-auth.com/docs/reference/security | ⭐⭐⭐ High | 2026-09-25 | 공식 문서 |
| Next.js integration | https://www.better-auth.com/docs/integrations/next | ⭐⭐⭐ High | 2026-09-25 | 공식 문서 |
| Hono integration | https://www.better-auth.com/docs/integrations/hono | ⭐⭐⭐ High | 2026-09-25 | 공식 문서 |
| Drizzle adapter | https://www.better-auth.com/docs/adapters/drizzle | ⭐⭐⭐ High | 2026-09-25 | 공식 문서 |
| Prisma adapter | https://www.better-auth.com/docs/adapters/prisma | ⭐⭐⭐ High | 2026-09-25 | 공식 문서 |
| Email & Password | https://www.better-auth.com/docs/authentication/email-password | ⭐⭐⭐ High | 2026-09-25 | 공식 문서 |
| Google provider | https://www.better-auth.com/docs/authentication/google | ⭐⭐⭐ High | 2026-09-25 | 공식 문서 |
| 2FA plugin | https://www.better-auth.com/docs/plugins/2fa | ⭐⭐⭐ High | 2026-09-25 | 공식 문서 |
| Organization plugin | https://www.better-auth.com/docs/plugins/organization | ⭐⭐⭐ High | 2026-09-25 | 공식 문서 |
| Better Auth 1.7 블로그 | https://better-auth.com/blog/1-7 | ⭐⭐⭐ High | 2026-08-17 | 공식 릴리스 공지 |
| GitHub releases | https://github.com/better-auth/better-auth/releases | ⭐⭐⭐ High | 2026-09-24 | 공식 GitHub |
| package.json (1.7.6) | https://github.com/better-auth/better-auth/blob/main/packages/better-auth/package.json | ⭐⭐⭐ High | 2026-09-25 | exports·peerDependencies |
| npm registry | https://registry.npmjs.org/better-auth | ⭐⭐⭐ High | 2026-09-25 | dist-tags |
| npm @better-auth/drizzle-adapter | https://www.npmjs.com/package/@better-auth/drizzle-adapter | ⭐⭐⭐ High | 2026-09-25 | 별도 패키지 확인 |
| npm @better-auth/cli | https://www.npmjs.com/package/@better-auth/cli | ⭐⭐⭐ High | 2026-09-25 | deprecated 확인 |
| GitHub 이슈/PR (nextCookies·isAPIError·secret) | https://github.com/better-auth/better-auth/issues | ⭐⭐ Medium | 2025~2026 | 교차 검증 보조 |
| Releasebot | https://releasebot.io/updates/better-auth/betterauth | ⭐⭐ Medium | 2026-09 | 릴리스 날짜 교차 확인 |
| Makerkit rate limiting 가이드 | https://makerkit.dev/docs/nextjs-drizzle/better-auth/rate-limiting | ⭐⭐ Medium | 2026 | rate limit 기본값 교차 확인 |
| npm registry (2026-11-06 재검증) | https://registry.npmjs.org/better-auth · `/@better-auth/drizzle-adapter` · `/@better-auth/redis-storage` · `/auth` · `/@better-auth/cli` | ⭐⭐⭐ High | 2026-11-06 | dist-tags·peerDependencies·exports·deprecated |
| better-auth 1.7.6 / 1.7.18 패키지 소스 (npm tarball `dist/`) | https://registry.npmjs.org/better-auth/-/better-auth-1.7.18.tgz | ⭐⭐⭐ High | 2026-11-06 | `context/create-context.mjs`(rateLimit 기본값), `api/rate-limiter/index.mjs`(내장 규칙), `plugins/admin/routes.mjs`(revoke·ban 엔드포인트) |
| Rate Limit · Options · Session · CLI · Admin · Drizzle 문서 (2026-11-06 재조회) | https://www.better-auth.com/docs/concepts/rate-limit · https://www.better-auth.com/docs/reference/options · https://www.better-auth.com/docs/concepts/session-management · https://www.better-auth.com/docs/concepts/cli · https://www.better-auth.com/docs/plugins/admin · https://www.better-auth.com/docs/adapters/drizzle | ⭐⭐⭐ High | 2026-11-06 | 공식 문서 |

### 2026-11-06 재검증 클레임

| # | 클레임 | 소스 | 판정 |
|---|--------|------|------|
| R1 | 최신 안정 1.7.18(2026-11-05), `release-1.6`=1.6.34, 1.8은 beta(1.8.0-beta.6)만 | npm registry dist-tags(better-auth·@better-auth/drizzle-adapter·auth 모두 동일) | VERIFIED → 기준 버전 1.7.6→1.7.18 갱신 |
| R2 | peer 범위 next ^14/^15/^16, react ^18/^19, drizzle-orm ^0.45.2 \|\| >=1.0.0-rc.1 <2.0.0, @prisma/client ^5/^6/^7 | npm 1.7.18 package.json | VERIFIED (drizzle-orm 상한 `<2.0.0` 표기 추가) |
| R3 | CLI `npx auth@latest`, `migrate`는 내장 Kysely 전용, `@better-auth/cli` deprecated | 공식 CLI 문서 + npm(`@better-auth/cli` latest에 deprecated 메시지) | VERIFIED (upgrade·check·info·init·create-admin 서브커맨드 추가 기재) |
| R4 | rate limit 기본 "60초/100회" (기존 클레임 #7 일부) | 공식 options 문서 `window` default `10`·rate-limit 문서 "10 seconds" + 1.7.6·1.7.18 소스 `window: options.rateLimit?.window \|\| 10` | DISPUTED → **10초/100회로 정정**. 내장 규칙(sign-in·sign-up·change-password·change-email 10초/3회, 메일 발송 경로 60초/3회)도 소스로 확인해 기재 |
| R5 | `revokeUserSessions`는 admin 플러그인 없이도 존재, Better Auth가 인가하지 않음 (기존 클레임 #16 일부) | 공식 admin 플러그인 문서 + 1.7.18 소스 `plugins/admin/routes.mjs`(`/admin/revoke-user-sessions`, `use: [adminMiddleware]`, `hasPermission({ permissions: { session: ["revoke"] } })`) + session-management 문서에 서버 revoke API 미기재 | DISPUTED → **admin 플러그인 전용·플러그인이 호출자 권한 검사**로 정정 |
| R6 | `secondaryStorage` 설정 시 `rateLimit.storage` 기본값이 `"secondary-storage"`, `increment` 필요 | 공식 options 문서(storage 값 `"memory" \| "database" \| "secondary-storage"`) + 1.7.18 소스 | VERIFIED (신규 기재) |
| R7 | 세션 기본값 expiresIn 7일·updateAge 1일·freshAge 1일, cookieCache strategy 기본 `compact`, revoke 후 타 기기 maxAge까지 유효 | 공식 session-management + options 문서 | VERIFIED (변경 없음) |
| R8 | Drizzle 어댑터 `@better-auth/drizzle-adapter`, `relations-v2` 서브패스, `advanced.database.joins` | 공식 drizzle 어댑터 문서 + npm 1.7.18 exports(`.`, `./relations-v2`) | VERIFIED (변경 없음) |

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 핵심 클레임 교차 검증 결과

| # | 클레임 | 소스 | 판정 |
|---|--------|------|------|
| 1 | 최신 안정 버전은 1.7.6 (2026-09-24), 1.6 계열은 `release-1.6` 태그 | npm registry dist-tags, GitHub releases, Releasebot | VERIFIED |
| 2 | CLI는 `npx auth@latest`(generate/migrate/secret), `@better-auth/cli`는 deprecated | 공식 CLI 문서, installation, npm, 1.5 블로그 | VERIFIED |
| 3 | `migrate`는 내장 Kysely 어댑터 전용, Drizzle/Prisma는 각 ORM 마이그레이션 사용 | 공식 CLI, drizzle·prisma 어댑터 문서 | VERIFIED |
| 4 | Drizzle 어댑터 import 경로 | 공식 drizzle 문서(`@better-auth/drizzle-adapter`) vs package.json exports(`better-auth/adapters/drizzle` 존재) | DISPUTED → 둘 다 유효하게 수정, 공식 권장 경로를 기본으로 하고 `> 주의:` 표기 |
| 5 | 세션 기본값 expiresIn 7일 / updateAge 1일 / freshAge 1일, cookieCache 기본 strategy `compact` | 공식 session 문서(mdx 원문), options 문서, GitHub 이슈 | VERIFIED |
| 6 | cookieCache 사용 시 revoke가 타 기기에서 maxAge까지 지연 | 공식 session 문서 원문 | VERIFIED |
| 7 | rate limit은 프로덕션 기본 활성, 60초/100회, `/sign-in/email` 10초/3회, 429 + `X-Retry-After`, memory 저장소는 서버리스 부적합, `auth.api` 서버 호출은 제외 | 공식 rate-limit 문서, 검색 결과(공식 mdx + Makerkit + 서드파티 이슈) | VERIFIED → 2026-11-06 일부 DISPUTED(기본 창 60초는 오류, 10초가 맞음 — R4 참조) |
| 8 | `nextCookies()`는 plugins 배열 마지막 | 공식 Next.js 문서, GitHub 이슈 다수 | VERIFIED |
| 9 | `getSessionCookie`는 존재만 확인·검증 안 함, Next 16 proxy에서 `auth.api.getSession` 전체 검증 가능 | 공식 Next.js 문서 원문, GitHub 이슈 #6187·#6360 | VERIFIED |
| 10 | 비밀번호 해시 기본 scrypt, 길이 8~128, autoSignIn 기본 true, 미인증 로그인 403 | 공식 email-password·security 문서, GitHub 이슈 #6608, DeepWiki | VERIFIED |
| 11 | 프로덕션에서 secret 미설정 시 에러, `BETTER_AUTH_SECRET`/`AUTH_SECRET` 순 | 공식 options 문서, GitHub 이슈 #1118·#8469 | VERIFIED |
| 12 | Hono: `auth.handler(c.req.raw)`, CORS 먼저·명시 origin·credentials, trustedOrigins 동기화 | 공식 Hono 문서 원문, installation 문서, GitHub 이슈 #7434 | VERIFIED |
| 13 | 서버 에러 처리 `isAPIError` / `APIError` from `better-auth/api` | 공식 API 문서, GitHub PR #9211·#8734 | VERIFIED |
| 14 | Drizzle 어댑터가 neon-http(트랜잭션 미지원)에서 내부 트랜잭션을 요구하는지 | 확인 소스 없음 | UNVERIFIED → SKILL.md에 `> 주의: 미검증` 표기 |
| 15 | rate limit은 계정이 아니라 연결 IP 주소 기준으로 판정, IPv6는 `/64` 서브넷 정규화 | 공식 rate-limit 문서 ("Rate limiting uses the connecting IP address") | VERIFIED |
| 16 | 관리자 서버사이드 강제 로그아웃: `auth.api.revokeUserSession`(토큰 단위)·`revokeUserSessions`(유저 전체)·`banUser`(정지+세션 무효화) | 공식 session-management·admin 플러그인 문서 | VERIFIED(API 이름) → 2026-11-06 DISPUTED(플러그인 불필요·인가 없음 서술은 오류 — R5 참조) |
| 17 | 공식 Redis 저장소 패키지 `@better-auth/redis-storage`(ioredis 기반) 존재 | npm registry 실측(1.7.6, better-auth 팀 유지보수) + 공식 database 문서 언급 | VERIFIED |
| 18 | `auth.api.getSession()`(서버)도 cookieCache 대상 — `disableCookieCache` 옵션이 서버 호출 예시로도 제시됨 | 공식 session-management 문서의 서버측 예시 코드 | VERIFIED (문서가 "적용된다"를 평서문으로 못박진 않았으나, 서버 호출에 옵션을 노출한 것 자체가 근거) |

추가 제거·완화 항목 (초안 단계에서 근거 부족으로 제외):
- "쿠키가 기본으로 암호화된다"(security 페이지 요약에 등장했으나 session_token 서명과 혼동 가능) → 미기재
- `advanced.disableOriginCheck` 옵션명 → 이번 조사에서 원문 미확인, `disableCSRFCheck`만 기재
- "1.7에서 PKCE 기본 활성" → 블로그 문맥상 generic OAuth 한정일 수 있어 미기재
- trustedOrigins 누락 시 구체적 에러 메시지 문자열 → 미확인, 일반 서술로 대체

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (better-auth 1.7.18 — 2026-11-06 재검증 갱신, peer 범위 명시)
- [✅] 2026-11-06 재검증 DISPUTED 2건(rate limit 기본 창 60초→10초, admin 전용 revoke API·인가 주체) 정정 반영
- [✅] deprecated된 패턴을 권장하지 않음 (`@better-auth/cli` → `npx auth@latest`)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-09-25, 2026-09-26 재테스트, 2026-11-06 재시험)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-09-25, 2026-09-26 재테스트)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — FAIL 없음, 선택 보강 항목만 기록 (2026-09-25, 2026-09-26)

---

## 5. 테스트 진행 기록

**수행일**: 2026-11-06
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 부재로 대체, 대체 사실 명시)
**수행 방법**: 2026-11-06 재검증으로 수정된 내용(rate limit 기본값·내장 규칙, admin 플러그인 전용 revoke/ban API와 권한 검사, secondary-storage·trustedProxies·disableIpTracking)을 겨냥해 SKILL.md Read 후 실전 질문 3개 답변, 근거 줄 번호 및 anti-pattern 회피 확인

### 재검증 후 재시험 (2026-11-06)

**Q1. 프로덕션 rate limit 기본값, `/sign-in/email` vs 비밀번호 재설정 메일 경로 규칙, 초과 응답, 개발 환경 적용 여부**
- ✅ PASS
- 근거: SKILL.md §10 452~453줄, §8 418~421줄, §2 137줄
- 상세: 기본 10초/100회(구 "60초/100회" anti-pattern 회피, 정정 주석까지 인용), `/sign-in*` 10초/3회 vs 메일 발송 경로 60초/3회 구분, 429 + `X-Retry-After`, 개발에서는 비활성 모두 정확.

**Q2. 관리자 전 기기 강제 로그아웃·계정 정지 — admin 플러그인 필요 여부, 권한 검사 주체, headers 없는 백그라운드 호출, cookieCache 주의**
- ✅ PASS
- 근거: SKILL.md §6 "관리자용 서버사이드 강제 로그아웃" 309~328줄, cookieCache 269~271줄
- 상세: "admin 플러그인 전용, 없으면 존재하지 않음"과 "플러그인이 `adminMiddleware`로 호출자 권한(`session:["revoke"]`·`user:["ban"]`) 검사"를 정확히 인용(구 "플러그인 불필요·Better Auth가 인가 안 함" anti-pattern 회피). headers 없으면 실패, cookieCache maxAge 지연과 `disableCookieCache` 대응도 정확.

**Q3. Cloudflare 프록시 뒤 Vercel 서버리스 + Redis rate limit — storage 결정, 필요 메서드, IP 헤더·trustedProxies, disableIpTracking**
- ✅ PASS
- 근거: SKILL.md §6-1 293~295줄, §10 454~456줄, §11 476줄
- 상세: `secondaryStorage` 설정 시 `rateLimit.storage` 기본값 `"secondary-storage"` 자동 선택, `increment` 없으면 에러, `ipAddressHeaders`(`cf-connecting-ip`)+`trustedProxies`, 헤더 위조 불가 구성 확인, `disableIpTracking`이 내장 rate limit을 끈다는 점 모두 정확.

### 발견된 gap (선택 보강, 차단 요인 아님)

- 429 응답 본문 형식, 개발 환경에서 rate limit을 강제로 켜는 옵션 미기재
- `rateLimit.storage`·`advanced.ipAddress.*` 설정 코드 스니펫 없음(문장 서술만), `trustedProxies`의 XFF 홉 선택 동작 미설명
- 헤더 없는 서버 컨텍스트(크론)에서 강제 로그아웃하는 대안 미기재, `adminRoles`/`adminUserIds` 설정 예시 없음

### 판정 (2026-11-06)

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 — 실사용 필수 카테고리 아님
- 최종 상태: **APPROVED** 유지

---

### 이전 재테스트 (2026-09-26, 참고 보존)

**수행일**: 2026-09-26 (재테스트)
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 부재로 대체, 대체 사실 명시)
**수행 방법**: 2026-09-26 섹션 6·9·10 보강 내용(rate limit 키, 관리자 강제 로그아웃, secondaryStorage Redis, getSession cookieCache)을 겨냥해 SKILL.md Read 후 실전 질문 3개 재답변, 근거 섹션 및 anti-pattern 회피 확인

### 재테스트 (2026-09-26, 보강 내용 타깃)

**Q1(재). rate limit 판정 키(IP vs 계정) — 계정 분산 공격 방어 가능 여부**
- ✅ PASS
- 근거: SKILL.md §10 449줄("rate limit 판정 키" — 연결 IP 주소 기준, IPv6 `/64` 정규화), 448줄(60초/100회, `/sign-in/email` 10초/3회)
- 상세: "계정 기준이 아니라 IP 기준"임을 정확히 인용하고, "같은 계정을 여러 IP로 공격하는 시나리오는 기본 rate limit만으로 막을 수 없다"는 SKILL.md의 명시적 한계 서술(449줄)까지 그대로 전달. 서버 액션 경유 시 rate limit 자체가 제외된다는 점(136·474줄)도 함께 지적해 범위를 정확히 넓힘.

**Q2(재). 관리자 서버사이드 강제 로그아웃(전 기기) — 클라이언트 API로 가능한지 판단형**
- ✅ PASS
- 근거: SKILL.md §6 "관리자용 서버사이드 강제 로그아웃" 308~324줄
- 상세: "`authClient.revokeOtherSessions()`는 본인 세션만 대상이며 관리자용이 아니다"를 정확히 구분하고, `auth.api.revokeUserSessions({ body: { userId } })`를 정답으로 제시. "Better Auth가 대신 인가하지 않으므로 호출자가 관리자인지 앱 코드가 검사해야 한다"는 인가 책임 분리 원칙과 admin 플러그인 불필요 사실(323줄)까지 정확히 인용.

**Q3(재). Vercel 서버리스 secondaryStorage(Redis) 설정 + getSession() cookieCache 적용 여부**
- ✅ PASS
- 근거: SKILL.md §6-1 272~294줄(secondaryStorage Redis 예시), §6 270줄(`auth.api.getSession()`도 cookieCache 적용 대상)
- 상세: `redisStorage({ client, keyPrefix })` 설정 코드와 "DB 마이그레이션 없이 세션·rate limit 카운터 외부화" 근거(294줄)를 정확히 제시. cookieCache 관련 질문에는 "기본적으로 캐시된 값을 돌려주며 항상 DB를 직접 조회하지 않는다"고 270줄을 정확히 인용, 즉시 무효화가 필요하면 `disableCookieCache: true` 필요함을 정확히 연결.

### 재테스트 판정

- agent content test (2026-09-26 보강분 타깃): 3/3 PASS
- 발견된 gap: 없음(기존 2026-09-25 gap 4건은 이번 보강으로 전부 해소됨 — rate limit 키, 관리자 강제 로그아웃 API, secondaryStorage 예시, getSession cookieCache 적용 여부 명시)
- verification-policy 분류: 라이브러리 사용법 스킬 — 실사용 필수 카테고리 아님, content test PASS로 APPROVED 가능
- 최종 상태: **APPROVED** (PENDING_TEST → APPROVED 재전환)

---

### 최초 테스트 (2026-09-25, 참고 보존)

**수행일**: 2026-09-25
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 부재로 대체, 대체 사실 명시)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Next.js 16 App Router + Drizzle(Postgres)로 이메일·비밀번호 + Google 로그인 붙이고 /dashboard 보호**
- ✅ PASS
- 근거: SKILL.md §1(설치·환경변수), §2(서버 설정), §3(Drizzle 어댑터), §5(OAuth), §7(Next.js App Router), §8(클라이언트), §10(보안 체크리스트) 전 구간을 정확히 인용
- 상세: `npx auth@latest generate`(구 `@better-auth/cli` 아님), `nextCookies()` plugins 배열 마지막 배치, `/dashboard` 보호를 `getSessionCookie`(낙관적)가 아닌 서버 컴포넌트 `auth.api.getSession()`으로 수행 — 3대 anti-pattern 모두 회피. Google 콜백 URL 로컬/운영 둘 다 등록 언급

**Q2. Vercel 서버리스 Hono + Better Auth — 로그인 무차별 대입 방어 + 모든 기기 로그아웃**
- ✅ PASS
- 근거: SKILL.md §6(cookieCache·세션 조회·폐기), §10(rate limit·rate limit 저장소), §11(흔한 실수), §12(테스트 관점)
- 상세: 기본 `memory` rate limit 저장소가 서버리스에서 무의미함을 정확히 지적하고 `storage: "database"`/`secondaryStorage` 전환 제시. `auth.api` 서버 호출은 rate limit 제외됨을 언급해 서버 액션 우회 위험까지 커버. `revokeSessions()`/`revokeOtherSessions()` 정확히 구분
- gap: rate limit이 IP·계정 중 어느 키 기준인지 SKILL.md 미기재, 관리자가 특정 유저를 서버에서 강제 로그아웃하는 `auth.api` 대응 메서드 언급 없음, `secondaryStorage`(Redis) 설정 예시 코드 부재 — 선택 보강 사항으로 섹션 7에 기록

**Q3. cookieCache 활성 상태에서 revoke 후 타 기기 지연 로그인 유지 현상 + 즉시 무효화 대응**
- ✅ PASS
- 근거: SKILL.md §6 cookieCache 경고문("revoke해도 다른 기기에서는 maxAge까지 유효"), §10 보안 체크리스트 "즉시 무효화 요구" 항목
- 상세: 원인(로컬 캐시가 DB 상태와 분리)과 해결책(`authClient.getSession({ query: { disableCookieCache: true } })`)을 정확히 제시
- gap: 서버 사이드 `auth.api.getSession()`이 cookieCache를 타는지 여부가 SKILL.md에 명시되어 있지 않아 에이전트가 "추정"이라고 스스로 표시함 — 선택 보강 사항으로 섹션 7에 기록

### 발견된 gap (선택 보강, 차단 요인 아님)

- rate limit 판정 키(IP/계정/둘 다) 미기재
- 관리자용 서버사이드 강제 로그아웃(`auth.api` 대응 메서드) 언급 없음
- `secondaryStorage`(Redis) 설정 코드 예시 부재
- `auth.api.getSession()`이 cookieCache를 타는지 여부 불명확

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 — 실사용 필수 카테고리(빌드 설정/워크플로우/설정+실행/마이그레이션) 아님 → content test PASS로 APPROVED 가능
- 최종 상태: APPROVED

---

### 테스트 케이스 1: (예정, 위 실제 테스트로 대체됨) Next.js 16 App Router에 Better Auth + Drizzle 설정

**입력 (질문/요청):**
```
Next.js 16 App Router + Drizzle(Postgres)로 이메일·비밀번호 로그인과 Google 로그인을 붙이고, /dashboard를 보호하려면?
```

**기대 결과:**
```
- npx auth@latest generate → drizzle-kit generate/migrate
- app/api/auth/[...all]/route.ts에 toNextJsHandler(auth)
- 서버 컴포넌트에서 auth.api.getSession({ headers: await headers() })로 검증
- proxy.ts의 getSessionCookie는 낙관적 리다이렉트용일 뿐임을 명시
- Google 콜백 URL /api/auth/callback/google 로컬·운영 모두 등록
```

**실제 결과:** 위 "실제 수행 테스트 Q1"로 대체 — PASS

**판정:** PASS (대체됨, 원본 템플릿은 참고용으로만 보존)

---

### 테스트 케이스 2: (예정, 위 실제 테스트 Q2로 대체됨) Vercel 서버리스 rate limit·세션 즉시 무효화

**입력:**
```
Vercel에 배포한 Hono + Better Auth에서 로그인 무차별 대입 방어와 "모든 기기 로그아웃"을 구현하려면?
```

**기대 결과:** memory 저장소 부적합 → database/secondaryStorage, `revokeSessions()`, cookieCache 사용 시 maxAge 지연 경고, CORS 먼저 등록·trustedOrigins 동기화

**실제 결과:** 위 "실제 수행 테스트 Q2"로 대체 — PASS (CORS 순서는 Q2 답변 범위 밖이었으나 SKILL.md §7 Hono 절에 별도 기술되어 있어 누락 아님)

**판정:** PASS (대체됨, 원본 템플릿은 참고용으로만 보존)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (최초 3/3 PASS 2026-09-25 → 2026-09-26 재테스트 3/3 PASS → 2026-11-06 재검증 수정분 타깃 재시험 3/3 PASS) |
| **최종 판정** | **APPROVED** (2026-11-06 재검증 후 재시험 통과로 유지) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 content test 수행 후 섹션 5·6 갱신 (2026-09-25 완료, 3/3 PASS → APPROVED)
- [❌] neon-http 드라이버와 Drizzle 어댑터 트랜잭션 호환 여부 확인 (클레임 #14) — 선택 보강, 차단 요인 아님(현재 `> 주의: 미검증` 표기로 리스크 고지 완료, 실제 Neon HTTP 드라이버 프로젝트 도입 시점에 재확인)
- [❌] Better Auth 1.8 출시 시 어댑터 import 경로·CLI 변경 재확인 — 선택 보강, 신규 마이너 릴리스 발생 시에만 필요
- [✅] `backend/hono-api-patterns`, `backend/prisma-orm`, `backend/zod-schema-validation` 생성 완료 후 링크 유효성 확인 — 세 스킬 모두 레포에 존재 확인(2026-09-26)
- [✅] rate limit 판정 키(IP/계정) 명시 — 2026-09-26 공식 문서(`concepts/rate-limit`)로 확인: **연결 IP 주소** 기준(계정 기준 아님), IPv6는 `/64` 서브넷 정규화. SKILL.md §10에 반영
- [✅] 관리자용 서버사이드 강제 로그아웃(`auth.api` 대응 메서드) 보강 — 2026-09-26 공식 문서(`concepts/session-management`, `plugins/admin`)로 `auth.api.revokeUserSession`(단일 토큰)·`auth.api.revokeUserSessions`(유저 전체)·`auth.api.banUser`(정지+세션 무효화) 확인, SKILL.md §6에 "관리자용 서버사이드 강제 로그아웃" 절 신설
- [✅] `secondaryStorage`(Redis) 설정 코드 예시 추가 — 2026-09-26 공식 패키지 `@better-auth/redis-storage`(npm 실측, 1.7.6, better-auth 팀 유지보수 확인) 기반 예시를 SKILL.md §6-1에 신설. 수동 구현 시의 `get`/`set`/`delete` 인터페이스도 함께 기재
- [✅] `auth.api.getSession()`의 cookieCache 적용 여부 명시 — 2026-09-26 공식 문서(`concepts/session-management`)가 `disableCookieCache` 옵션을 서버 `auth.api.getSession({ query: { disableCookieCache: true } })` 예시로도 제시하는 것을 근거로 "서버 경로도 기본적으로 cookieCache를 탄다"고 SKILL.md §6에 명시(공식 문서가 명시적 평서문으로 확언하지는 않아 근거는 "옵션 존재 자체가 함의"임을 함께 밝힘)
- [✅] 2026-09-26 보강분(rate limit 키·관리자 강제 로그아웃·secondaryStorage Redis·getSession cookieCache)에 대한 skill-tester 재테스트 수행 — Q1·Q2·Q3 모두 보강 내용을 직접 겨냥한 질문으로 재실행, 3/3 PASS. 발견된 gap 없음(기존 4건 gap 전부 해소 확인). PENDING_TEST → APPROVED 재전환
- [✅] 2026-11-06 재검증 수정분(rate limit 10초/100회·내장 규칙, admin 플러그인 전용 revoke/ban·권한 검사, secondary-storage·trustedProxies)에 대한 skill-tester 재시험 수행 (2026-11-06 완료, 3/3 PASS, APPROVED 유지)
- [❌] 선택 보강: `rateLimit.storage`·`advanced.ipAddress.*` 설정 코드 스니펫, 429 응답 본문, 크론용 강제 로그아웃 대안 — 선택 보강, 차단 요인 아님(2026-11-06 재시험에서 발견)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-09-25 | v1 | 최초 작성 (better-auth 1.7.6 기준) | skill-creator |
| 2026-09-25 | v1 | 2단계 실사용 테스트 수행 (Q1 Next.js+Drizzle+Google 로그인 설정 / Q2 서버리스 rate limit·모든 기기 로그아웃 / Q3 cookieCache revoke 지연 대응) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-26 | v1 | 섹션 7 선택 보강 4건 반영: rate limit 판정 키(IP) 명시, 관리자 강제 로그아웃 API(`revokeUserSession(s)`/`banUser`) 추가, `secondaryStorage` Redis 예시(§6-1) 신설, `auth.api.getSession()` cookieCache 적용 여부 명시. 내용 변경으로 APPROVED → PENDING_TEST 재전환(재테스트 대기) | Claude (Sonnet 5) |
| 2026-09-26 | v1 | 2단계 재테스트 수행 (Q1 rate limit 판정 키 / Q2 관리자 강제 로그아웃 / Q3 secondaryStorage Redis + getSession cookieCache) — 보강 내용 전부 타깃, 3/3 PASS → PENDING_TEST → APPROVED 재전환 | skill-tester |
| 2026-11-06 | v1.1 | 재검증 — 기준 버전 1.7.6→1.7.18(1.6.34, 1.8 beta만) 갱신, peer·CLI·세션 기본값·Drizzle 어댑터 VERIFIED. 정정 2건: ① rate limit 기본 60초/100회 → **10초/100회**(공식 options + 패키지 소스), 내장 규칙(sign-in/up 등 10초/3회, 메일 발송 60초/3회) 기재 ② `revokeUserSession(s)`·`banUser`는 **admin 플러그인 전용**이며 플러그인이 호출자 권한(`session:revoke`·`user:ban`)을 검사 — "플러그인 없이 존재·Better Auth가 인가 안 함" 서술 삭제. 추가: `secondary-storage` 저장소 값·자동 선택, `trustedProxies`·`disableIpTracking`, CLI `upgrade` 등. 내용 수정 있음 — skill-tester 재시험 예정 | Claude (Opus 5.5) |
| 2026-11-06 | v1.1 | 재검증 후 2단계 재시험 수행 (Q1 rate limit 기본값·내장 규칙 / Q2 admin 플러그인 전용 강제 로그아웃·권한 검사 / Q3 secondary-storage·IP 헤더·trustedProxies) → 3/3 PASS, APPROVED 유지 | skill-tester |
| 2026-11-12 | v1.2 | 정리(사실 재검증 아님) — 일반 지식 덜어내기: 남긴 것 1.7 변경점(CLI `auth` 이전·어댑터 패키지·joins stable·MCP/SCIM 분리)·프로덕션 secret 에러·timing attack 메일 발송·cookieCache revoke 지연(서버 getSession 포함)·secondaryStorage 자동 저장소/`increment`·admin 플러그인 전용 강제 로그아웃·nextCookies 순서·getSessionCookie 비검증·rate limit 기본값/IP 기준/서버 호출 제외·흔한 실수 / 덜어낸 것 설치·betterAuth() 기본 설정 예제·옵션 표·Drizzle/Prisma 설치 명령·이메일/OAuth/클라이언트/세션 조회 기본 예제·Next.js/Hono 핸들러 코드·플러그인 개요표·적대적 테스트 일반 목록 | 정리 |
