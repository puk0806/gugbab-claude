---
name: next-intl-i18n
description: >
  Next.js 16.3+ App Router 앱 레벨 다국어 구현(next-intl 4.14). defineRouting·localePrefix 전략, proxy.ts(구 middleware.ts),
  next/root-params 기반 getRequestConfig, Server/Client Component 번역(getTranslations/useTranslations),
  AppConfig 타입 안전, ICU 복수형·날짜·숫자 포맷, 정적 렌더링, 로케일 전환 UI, 흔한 실수. 한국어(ko) 기본 + en.
  <example>사용자: "Next.js 16 앱에 한국어/영어 다국어 붙이려면 next-intl 설정 어떻게 해?"</example>
  <example>사용자: "next-intl에서 setRequestLocale 아직 써야 해? 정적 렌더링이 안 돼"</example>
  <example>사용자: "번역 키 오타를 타입 에러로 잡고 싶어"</example>
---

# next-intl — Next.js App Router 앱 레벨 다국어

> 소스:
> - next-intl 공식 문서: https://next-intl.dev/docs/routing/setup · https://next-intl.dev/docs/routing/configuration · https://next-intl.dev/docs/usage/configuration
> - next-intl 블로그 (2026-08-04): https://next-intl.dev/blog/nextjs-root-params
> - next-intl GitHub (releases·공식 example-app-router): https://github.com/amannn/next-intl
> - Next.js `next/root-params`: https://nextjs.org/docs/app/api-reference/functions/next-root-params
> - Next.js `proxy.js`: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
> - 2026-09-26 보강: next-intl routing/setup 문서(`experimental.rootParams` 문구) + https://github.com/vercel/next.js/pull/72837 (rootParams 실험 플래그 PR)
> 검증일: 2026-09-26 (최초 2026-09-25, 1장·5장·4장 보강·재테스트 2026-09-26)
> 기준 버전: **next-intl 4.14.7** (2026-09-24, npm latest) / **Next.js 16.3.x** (레포 `frontend/nextjs` 스킬 기준)

**관련 스킬 (중복 금지, 설치된 경우 참조):**
- hreflang·`alternates.languages`·다국어 sitemap·canonical·locale URL 전략의 SEO 판단 → `frontend/i18n-seo`(SEO 옵션 설치 시)
- Next.js 16 전반(캐싱·proxy·async params) → `frontend/nextjs`

---

**적용 범위:** App Router + URL(`/en/...`)·도메인별 로케일(i18n routing). 로케일을 URL 없이 쿠키·유저 설정으로만 정하는 "without i18n routing" 설정과 Pages Router는 범위 밖.

---

## 1. 버전 기준과 2026년 핵심 변화

| 항목 | 내용 |
|------|------|
| next-intl 최신 | 4.14.7 (peer: `next` ^12~^16, `react` ^16.8~^19) |
| Next.js 16 대응 | next-intl 4.4.0 "Next.js 16 update" |
| 파일명 | Next.js 16부터 `middleware.ts` → **`proxy.ts`** (middleware는 deprecated). next-intl API 이름(`next-intl/middleware`, `createMiddleware`)은 **그대로** |
| `next/root-params` | Next.js **16.3.0** 도입(기본 사용 가능). 16.3 미만은 `next.config`에 `experimental: { rootParams: true }` 필요 — next-intl 공식 문서(routing/setup)가 명시("In earlier versions, it needs to be enabled via `experimental.rootParams`")하고, Next.js 자체 PR(vercel/next.js#72837 "feat: rootParams (experimental)")로도 교차 확인됨(2026-09-26, 이전 "미검증" 갱신). 다만 레거시 버전은 안정성 문제로 7-2 `setRequestLocale` 경로가 여전히 더 검증된 선택 |
| `setRequestLocale` | **4.13.5에서 deprecated** (2026-08-04) — 하위 호환용으로 동작은 함 |
| `getRequestConfig`의 `requestLocale` 파라미터 | **4.13.6에서 deprecated** (2026-08-10) |
| 4.0 (2025-03-12) 이후 | `AppConfig` 타입 확장, `hasLocale`, `NextIntlClientProvider`가 messages·formats 자동 상속, 반환값에 `locale` 필수, ESM-only |

> 주의: 2026-08 이전 블로그·튜토리얼은 대부분 `middleware.ts` + `requestLocale` + `setRequestLocale` 패턴이다. Next.js 16.3+에서는 아래 root-params 패턴이 공식 권장이다.

---

## 2. 파일 구조

```
messages/
├── ko.json
└── en.json
global.ts                     ← AppConfig 타입 확장 (4장)
next.config.ts
src/
├── proxy.ts                  ← Next.js 16+ (15 이하: middleware.ts)
├── i18n/
│   ├── routing.ts
│   ├── navigation.ts
│   └── request.ts
└── app/
    ├── global-not-found.tsx  ← (선택) 매칭 안 되는 URL용 404
    └── [locale]/
        ├── layout.tsx        ← ★ 이것이 root layout. app/layout.tsx 두지 않음
        └── page.tsx
```

> **root-params 요구사항**: root layout이 `app/[locale]/layout.tsx`여야 한다. `app/layout.tsx`에 children만 넘기는 pass-through 레이아웃이 있으면 **그것이 root layout이 되어** `locale`이 root param으로 잡히지 않는다 (next-intl 블로그 명시).

---

## 3. 설정 코드 (Next.js 16.3+ 권장 경로)

### 3-1. 설치 + 플러그인

```bash
npm install next-intl
```

```ts
// next.config.ts
import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {};
// 기본 경로: ./i18n/request.ts 또는 ./src/i18n/request.ts
// 다른 위치면 createNextIntlPlugin({requestConfig: './somewhere/else/request.ts'})
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
```

### 3-2. routing.ts — `defineRouting`

```ts
// src/i18n/routing.ts
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  localePrefix: 'as-needed' // 한국어는 /about, 영어는 /en/about
});
```

**`localePrefix` 전략:**

| 모드 | URL | 메모 |
|------|-----|------|
| `'always'` (기본값) | `/ko/about`, `/en/about` | 가장 단순·명확 |
| `'as-needed'` | `/about`(ko), `/en/about` | matcher가 접두사 없는 경로를 잡아야 함. 로케일 기억용 쿠키·루트 리다이렉트 발생 가능 |
| `'never'` | `/about` (모든 로케일) | 도메인 기반·쿠키 기반 결정용. URL이 로케일별로 유일하지 않아 alternate 링크 비활성 |
| 커스텀 prefix | `{mode: 'always', prefixes: {'en-US': '/us'}}` | 내부 locale과 URL 접두사 분리 |

기타 옵션: `localeDetection: false`(accept-language·쿠키 감지 끔), `localeCookie`(이름·maxAge 조정 또는 `false`), `pathnames`(로케일별 URL 번역), `domains`(도메인 기반), `alternateLinks`(기본 `true` — hreflang `Link` 헤더 자동 생성. SEO 판단은 `frontend/i18n-seo` — SEO 옵션 설치 시).

> 4.0부터 로케일 쿠키는 기본 **세션 쿠키**이며, 사용자가 accept-language와 다른 로케일로 전환했을 때만 설정된다.

### 3-3. proxy.ts

```ts
// src/proxy.ts  (Next.js 15 이하에서는 파일명 middleware.ts)
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // api, trpc, _next, _vercel, 확장자 있는 경로(.*\\..*)는 제외
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
```

- Next.js 16 `proxy`는 Node.js 런타임 고정(`runtime` 설정 불가). default export 허용.
- 경로에 점이 들어가는 라우트(`/users/jane.doe`)는 위 matcher에서 빠지므로 추가: `['/((?!api|trpc|_next|_vercel|.*\\..*).*)', '/([\\w-]+)?/users/(.+)']`.
- 기존 `middleware.ts` 이관: `npx @next/codemod@canary middleware-to-proxy .`

### 3-4. navigation.ts — 로케일 인식 내비게이션

```ts
// src/i18n/navigation.ts
import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
```

앱 코드에서는 `next/link`·`next/navigation` 대신 **이 파일의 export**를 쓴다 (접두사·쿠키 자동 처리).

### 3-5. request.ts — `getRequestConfig` + `next/root-params`

```ts
// src/i18n/request.ts  (공식 example-app-router 기준)
import {hasLocale} from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
import * as rootParams from 'next/root-params';
import {routing} from './routing';

export default getRequestConfig(async ({locale}) => {
  // locale 인자: getTranslations({locale, ...}) 같은 "명시적 override"가 있을 때만 채워짐
  if (!locale) {
    const paramValue = await rootParams.locale();
    if (hasLocale(routing.locales, paramValue)) {
      locale = paramValue;
    } else {
      notFound(); // 허용 목록 밖 로케일 → 404 (메시지 동적 import 경로 오염 방지)
    }
  }

  return {
    locale, // 4.0부터 필수
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Asia/Seoul' // 서버/클라이언트 시간대 불일치(hydration mismatch) 방지
  };
});
```

- 설정 객체는 요청당 1회 생성된다 (내부적으로 React `cache`).
- `next/root-params`는 **Server Component 전용**이다. Client Component·Server Action·Route Handler에서는 쓸 수 없다(Route Handler는 향후 지원 예정). `unstable_cache` 안에서도 호출 불가(`'use cache'`는 가능).

### 3-6. `[locale]/layout.tsx` (root layout)

```tsx
// src/app/[locale]/layout.tsx
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getTranslations} from 'next-intl/server';
import {routing} from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata() {
  const t = await getTranslations('LocaleLayout'); // root-params 덕에 locale 전달 불필요
  return {title: t('title')};
  // hreflang(alternates.languages)은 frontend/i18n-seo 참조 (SEO 옵션 설치 시)
}

export default async function LocaleLayout({children}: LayoutProps<'/[locale]'>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>
        {/* 서버에서 렌더 시 locale·messages·now·timeZone·formats 자동 상속 */}
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 3-7. 매칭 안 되는 URL의 404

root layout이 `[locale]` 동적 세그먼트면 전역 404 구성이 어렵다. Next.js `global-not-found.tsx`(15.4+ **experimental**, `experimental.globalNotFound: true` 필요)를 `app/` 루트에 두고 `<html>`·`<body>`를 직접 포함해 반환한다. 이 파일은 레이아웃을 거치지 않으므로 전역 CSS·폰트를 직접 import한다.

---

## 4. 메시지 파일 구조와 타입 안전 (`AppConfig`)

```json
// messages/ko.json
{
  "LocaleLayout": {"title": "내 앱"},
  "HomePage": {
    "title": "안녕하세요, {name}님!",
    "followers": "팔로워 {count, plural, =0 {없음} other {#명}}"
  },
  "LocaleSwitcher": {"label": "언어 변경", "locale": "{locale, select, ko {한국어} en {English} other {알 수 없음}}"}
}
```

```json
// messages/en.json (키 구조 동일, 발췌)
{"HomePage": {"followers": "{count, plural, =0 {No followers yet} =1 {One follower} other {# followers}}"}}
```

- 네임스페이스(최상위 키)로 기능/페이지별 분리. **키에 `.` 사용 금지** (중첩 표기로 쓰임).
- 모든 로케일 파일의 키 구조를 동일하게 유지한다.

```ts
// global.ts  (tsconfig include 범위 안에 둘 것)
import {routing} from '@/i18n/routing';
import messages from './messages/ko.json'; // 기준 로케일 파일

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]; // 'ko' | 'en' — useLocale()·Link locale 등 전부 좁혀짐
    Messages: typeof messages;                // t('없는키') → 타입 에러
    // Formats: typeof formats;               // 전역 formats 쓸 때 (6장)
  }
}
```

**`AppConfig` 타입이 실제로 적용되려면** `global.ts`가 프로젝트의 `tsconfig.json` `include` 범위 안에 있어야 한다(TypeScript는 컴파일 대상에 포함된 파일의 `declare module` 선언만 전역에 반영한다). 기본 `create-next-app` 템플릿의 `include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]`는 `**/*.ts`가 이미 `global.ts`를 포함하므로 보통 별도 설정이 필요 없다. 파일을 `src/` 밖(예: 프로젝트 루트)에 두거나 `include`를 좁혀둔 프로젝트라면 명시적으로 추가한다(2026-09-26 추가, content test Q1 gap 보강):

```json
// tsconfig.json
{
  "compilerOptions": { /* ... */ },
  "include": ["next-env.d.ts", "global.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]
}
```

- `tsc --noEmit` 또는 에디터에서 `t('없는키')`가 타입 에러로 잡히지 않으면 가장 먼저 `global.ts`가 `include`(또는 `exclude`에 걸려 제외)되어 있는지 확인한다.

**ICU 인자까지 타입 검사**(선택, experimental):

```json
// tsconfig.json
{"compilerOptions": {"allowArbitraryExtensions": true}}
```

```ts
// next.config.ts
const withNextIntl = createNextIntlPlugin({
  experimental: {createMessagesDeclaration: './messages/ko.json'} // .d.json.ts 생성
});
```

> 4.0에서 전역 `IntlMessages` 선언 방식은 `AppConfig`(next-intl 모듈 스코프)로 대체됐다.

---

## 5. Server / Client Component에서 번역

| 컴포넌트 | API | import |
|----------|-----|--------|
| **async** Server Component, `generateMetadata` | `await getTranslations('NS')` | `next-intl/server` |
| 비-async 컴포넌트 (서버·클라이언트 공용) | `useTranslations('NS')` | `next-intl` |
| Client Component (`'use client'`) | `useTranslations`, `useFormatter`, `useLocale` | `next-intl` (상위에 `NextIntlClientProvider` 필수) |

그 외 awaitable: `getFormatter`, `getNow`, `getTimeZone`, `getMessages`, `getLocale`.

```tsx
// async Server Component
import {getTranslations} from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('HomePage');
  return <h1>{t('title', {name: '홍길동'})}</h1>;
}
```

```tsx
// 비-async 공용 컴포넌트 — 훅 사용 가능
import {useTranslations} from 'next-intl';

export function Followers({count}: {count: number}) {
  const t = useTranslations('HomePage');
  return <p>{t('followers', {count})}</p>;
}
```

**Client Component로 메시지 전달 전략 (공식 권장 순):**
1. 서버에서 번역한 문자열을 props로 넘긴다 (클라이언트엔 상태만).
2. 상태를 URL 파라미터·쿠키·DB에 두고 서버에서 번역.
3. 필요한 네임스페이스만 `pick(useMessages(), 'NS')`로 골라 하위 `NextIntlClientProvider`에 전달.
4. 전체 messages 전달(4.x 기본 상속 동작) — 간단하지만 번들·Core Web Vitals에 불리.

`onError`·`getMessageFallback` 같은 **함수 props는 직렬화 불가** → 서버에서 Provider에 직접 넘기지 말고 `'use client'` 래퍼 Provider를 만든다.

### Server Action / Route Handler — locale 명시 전달

root-params가 동작하지 않으므로 locale을 **명시적 override**로 넘긴다.

```ts
// app/[locale]/subscribe/actions.ts
'use server';
import type {Locale} from 'next-intl';
import {getTranslations} from 'next-intl/server';

export async function subscribe(locale: Locale, formData: FormData) {
  const t = await getTranslations({locale, namespace: 'Subscribe'});
  // ...
}
```

```tsx
// Server Component에서 bind
const locale = await getLocale();
<form action={subscribe.bind(null, locale)}>...</form>
```

> 주의: bind로 넘어온 `locale`도 클라이언트가 조작 가능한 입력이다. 서버에서 `hasLocale(routing.locales, locale)`로 재검증한다.

**재검증 실패 시 처리 (2026-09-26 추가, content test Q2 gap 보강):**

```ts
'use server';
import type {Locale} from 'next-intl';
import {hasLocale} from 'next-intl';
import {getTranslations} from 'next-intl/server';
import {routing} from '@/i18n/routing';

export async function subscribe(locale: Locale, formData: FormData) {
  if (!hasLocale(routing.locales, locale)) {
    // 허용 목록 밖 값 — 조작된 입력으로 간주. 기본 로케일로 조용히 폴백하지 않고 거부한다
    // (메시지 동적 import 경로 오염·엉뚱한 언어로 응답 방지).
    throw new Error('INVALID_LOCALE');
  }
  const t = await getTranslations({locale, namespace: 'Subscribe'});
  // ...
}
```

- **폴백 대신 거부를 권장하는 이유**: `locale`을 조용히 `routing.defaultLocale`로 대체하면 클라이언트가 의도한 언어와 다른 응답이 반환되는 것을 사용자가 알아채기 어렵다. Server Action은 폼 제출 흐름이므로 거부 시 화면에서 일반 에러 메시지로 처리하면 된다.
- Route Handler(API 라우트)라면 `throw` 대신 `Response.json({error: 'INVALID_LOCALE'}, {status: 400})`처럼 HTTP 상태로 표현한다.

---

## 6. 날짜·숫자·복수형 (ICU)

### 메시지 안 ICU 문법

| 용도 | 문법 |
|------|------|
| 보간 | `"안녕하세요, {name}님"` |
| 복수형 | `{count, plural, =0 {...} =1 {...} other {# ...}}` — `#`은 숫자 포맷 적용, `other` 필수 |
| 서수 | `{year, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}` |
| 선택 | `{gender, select, female {...} male {...} other {...}}` — `other` 필수 |
| 날짜 | `{orderDate, date, medium}` / 스켈레톤 `{orderDate, date, ::yyyyMMMd}` |
| 숫자 | `{value, number, percent}` / `{value, number, ::.##}` |
| 리치 텍스트 | `"<link>가이드</link>를 보세요"` + `t.rich('msg', {link: (c) => <a href="/help">{c}</a>})` |

> **한국어 복수형**: CLDR상 한국어(`ko`)는 복수 범주가 `other` **하나뿐**이다. `one`을 써도 매칭되지 않으므로 `=0`·`=1` 같은 **정확값 매칭**과 `other`만 쓴다. 영어는 `one`/`other`.

기타: `t.markup()`(HTML 문자열 생성), `t.raw()`(원문 — `dangerouslySetInnerHTML`과 쓸 땐 신뢰된 메시지만), `t.has('key')`(존재 여부).

### 포맷터 API

```tsx
'use client';
import {useFormatter, useNow} from 'next-intl';

export function OrderMeta({createdAt, price}: {createdAt: Date; price: number}) {
  const format = useFormatter();
  const now = useNow({updateInterval: 60_000}); // 1분마다 갱신
  return (
    <>
      <time>{format.dateTime(createdAt, {year: 'numeric', month: 'short', day: 'numeric'})}</time>
      <span>{format.relativeTime(createdAt, now)}</span>
      <span>{format.number(price, {style: 'currency', currency: 'KRW'})}</span>
    </>
  );
}
```

- async Server Component에서는 `const format = await getFormatter()`.
- 날짜는 ISO 8601 문자열로 저장·전달한다.
- `format.dateTimeRange(a, b, options)`도 있음.

**전역 formats** (`getRequestConfig` 반환값에 추가, `AppConfig.Formats`로 이름 검증):

```ts
import type {Formats} from 'next-intl';

export const formats = {
  dateTime: {short: {day: 'numeric', month: 'short', year: 'numeric'}},
  number: {precise: {maximumFractionDigits: 5}}
} satisfies Formats;
// format.dateTime(date, 'short')
```

---

## 7. 정적 렌더링

### 7-1. Next.js 16.3+ (권장) — 자동

2~3장 root-params 설정을 따르면 **추가 호출 없이** 정적 렌더링 대상이 된다. `generateStaticParams`(3-6 참조)만 layout(또는 page)에 둔다.

- Cache Components(`cacheComponents`) 사용 시에는 root param마다 최소 1개 값을 반환해야 빌드가 통과한다.
- 일부 로케일만 빌드 시점에 렌더해도 된다.

### 7-2. Next.js 16.3 미만 (레거시) — `setRequestLocale`

> 주의: `setRequestLocale`은 4.13.5에서 deprecated. 16.3+ 신규 코드에서는 쓰지 않는다. 16.3 미만 레거시 유지보수에서만 사용.

```tsx
// app/[locale]/layout.tsx (레거시) — page에도 동일하게
const {locale} = await params;               // params: Promise<{locale: string}>
if (!hasLocale(routing.locales, locale)) notFound();
setRequestLocale(locale); // 모든 layout·page에서, next-intl 함수 호출 "이전"에
```

레거시에서는 `generateMetadata`에서도 `getTranslations({locale, namespace: 'Metadata'})`로 locale을 넘겨야 한다.

**16.3+ 마이그레이션 체크리스트** (next-intl 블로그): ① `setRequestLocale()` 호출 제거 ② pass-through `app/layout.tsx` 제거 ③ 수동 `params` 읽기 → `getLocale()` ④ `generateMetadata`의 명시 locale override 제거 ⑤ `request.ts`를 3-5 패턴으로.

---

## 8. 로케일 전환 UI

`@/i18n/navigation`의 `useRouter().replace({pathname, params}, {locale})` 패턴으로 현재 라우트를 유지한 채 로케일만 바꾼다. 동적 세그먼트가 없으면 `router.replace(pathname, {locale: nextLocale})`로 충분. 링크 방식은 `<Link href="/" locale="en">English</Link>`, 서버 측 리다이렉트는 `redirect({href: '/login', locale})`(4.x는 객체 인자, 접두사 강제는 `forcePrefix: true`), 경로 문자열만 필요하면 `getPathname({locale: 'en', href: '/about'})`.

공식 example 기반 완전한 `LocaleSwitcherSelect` 컴포넌트(`useTransition` + `useParams` 포함) → [references/locale-switcher.md](references/locale-switcher.md)

---

## 9. 흔한 실수

| # | 실수 | 올바른 방법 |
|---|------|-------------|
| 1 | Next.js 16에서 `middleware.ts` 신규 작성 | `proxy.ts` (deprecated 경고). next-intl import 명은 `next-intl/middleware` 그대로 |
| 2 | `app/layout.tsx` pass-through 레이아웃 유지 | root-params 사용 시 제거. root layout = `app/[locale]/layout.tsx` |
| 3 | 16.3+ 신규 코드에 `setRequestLocale`·`requestLocale` 사용 | root-params 패턴 (3-5). 둘 다 deprecated |
| 4 | `hasLocale` 검증 없이 `import(\`../../messages/${locale}.json\`)` | 허용 목록 검증 후 불일치 시 `notFound()` — 임의 로케일 문자열이 경로로 흘러드는 것 차단 |
| 5 | Server Action·Route Handler에서 `getTranslations('NS')`만 호출 | root-params 미지원 → `getTranslations({locale, namespace})` + 서버 재검증 |
| 6 | async 컴포넌트에서 `useTranslations` | `await getTranslations()` (훅은 async 컴포넌트에서 호출 불가) |
| 7 | `next/link`·`next/navigation`의 `useRouter` 직접 사용 | `@/i18n/navigation`의 `Link`/`useRouter`/`redirect` |
| 8 | `as-needed`/`never`인데 matcher가 접두사 없는 경로를 못 잡음 | matcher가 `/about` 같은 경로를 포함하는지 확인 |
| 9 | 점 포함 경로(`/users/a.b`)가 404/미번역 | matcher에 해당 패턴 추가 (3-3) |
| 10 | 한국어 복수형에 `one` 분기 작성 | `ko`는 `other`뿐 → `=1` 정확값 사용 |
| 11 | `plural`/`select`에 `other` 누락 | ICU상 `other` 필수 (FormatJS는 없으면 에러) |
| 12 | 메시지 키에 `.` 사용 (`"a.b": "..."`) | 중첩 객체로 표현 |
| 13 | `timeZone` 미설정 | 서버·브라우저 시간대가 달라 hydration mismatch → `getRequestConfig`에 `timeZone` 지정 |
| 14 | 서버에서 `onError` 등 함수를 `NextIntlClientProvider`에 직접 전달 | `'use client'` 래퍼 Provider |
| 15 | 모든 메시지를 클라이언트로 전달하고 방치 | 서버 번역 → props, 또는 `pick`으로 네임스페이스 제한 |
| 16 | `unstable_cache` 안에서 로케일 의존 로직 | root-params 호출 불가 → `'use cache'` 사용 |
| 17 | `t.raw()` 결과를 사용자 입력과 섞어 `dangerouslySetInnerHTML` | 신뢰된 번역 원문에만. 사용자 값은 `t.rich`로 React 노드 렌더 |
