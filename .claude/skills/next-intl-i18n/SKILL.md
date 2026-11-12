---
name: next-intl-i18n
description: >
  next-intl 4.14 + Next.js 16.3+ 최신 패턴과 함정 — next/root-params 기반 getRequestConfig(setRequestLocale·requestLocale deprecated),
  proxy.ts 이름 변경(API 이름은 그대로), root layout = app/[locale]/layout.tsx 요구, Server Action·Route Handler locale 명시·재검증,
  AppConfig 타입 적용 조건, 한국어 복수형 other 전용, 16.3 미만 레거시 마이그레이션 체크리스트.
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
> 검증일: 2026-11-09 (재검증: npm 최신 버전·root-params/proxy 문서 재대조. 최초 2026-09-25, 1장·5장·4장 보강·재테스트 2026-09-26)
> 기준 버전: **next-intl 4.14.9** (2026-10-02, npm latest — 4.14.8·4.14.9는 `useExtracted` 버그 수정만) / **Next.js 16.3+** (2026-11-09 npm latest 16.4.5, root-params 패턴 동일)

**관련 스킬 (중복 금지, 설치된 경우 참조):**
- Next.js 16 전반(캐싱·proxy·async params) → `frontend/nextjs`

---

## 이 스킬의 범위

App Router + URL(`/en/...`)·도메인별 로케일(i18n routing)에서 **2026-08 이후 바뀐 설정 경로(root-params)와 실측 함정**만 다룬다. "without i18n routing"·Pages Router는 범위 밖.

> 기본 사용법(설치·플러그인·`defineRouting` 옵션·`createNavigation`·메시지 JSON·ICU 문법·`useFormatter`·로케일 전환 UI)은 공식 문서 수준이라 싣지 않는다.

---

## 1. 버전 기준과 2026년 핵심 변화

| 항목 | 내용 |
|------|------|
| next-intl 최신 | 4.14.9 (peer: `next` ^12~^16, `react` ^16.8~^19, `@types/react` 선택 peer — 4.14.7 추가) |
| Next.js 16 대응 | next-intl 4.4.0 "Next.js 16 update" |
| 파일명 | Next.js 16부터 `middleware.ts` → **`proxy.ts`** (middleware는 deprecated). next-intl API 이름(`next-intl/middleware`, `createMiddleware`)은 **그대로** |
| `next/root-params` | Next.js **16.3.0** 도입(기본 사용 가능). 16.3 미만은 `next.config`에 `experimental: { rootParams: true }` 필요 — next-intl 공식 문서(routing/setup)가 명시("In earlier versions, it needs to be enabled via `experimental.rootParams`")하고, Next.js 자체 PR(vercel/next.js#72837 "feat: rootParams (experimental)")로도 교차 확인됨(2026-09-26, 이전 "미검증" 갱신). 다만 레거시 버전은 안정성 문제로 5절 `setRequestLocale` 경로가 여전히 더 검증된 선택 |
| `setRequestLocale` | **4.13.5에서 deprecated** (2026-08-04) — 하위 호환용으로 동작은 함 |
| `getRequestConfig`의 `requestLocale` 파라미터 | **4.13.6에서 deprecated** (2026-08-10) |
| 4.0 (2025-03-12) 이후 | `AppConfig` 타입 확장, `hasLocale`, `NextIntlClientProvider`가 messages·formats 자동 상속, 반환값에 `locale` 필수, ESM-only |

> 주의: 2026-08 이전 블로그·튜토리얼은 대부분 `middleware.ts` + `requestLocale` + `setRequestLocale` 패턴이다. Next.js 16.3+에서는 아래 root-params 패턴이 공식 권장이다.

> 4.0부터 로케일 쿠키는 기본 **세션 쿠키**이며, 사용자가 accept-language와 다른 로케일로 전환했을 때만 설정된다.

---

## 2. root-params 패턴 (Next.js 16.3+ 권장 경로)

> **root-params 요구사항**: root layout이 `app/[locale]/layout.tsx`여야 한다. `app/layout.tsx`에 children만 넘기는 pass-through 레이아웃이 있으면 **그것이 root layout이 되어** `locale`이 root param으로 잡히지 않는다 (next-intl 블로그 명시).

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

- `next/root-params`는 **Server Component 전용**이다. Client Component·Server Action·Route Handler에서는 쓸 수 없다(Route Handler는 향후 지원 예정). `unstable_cache` 안에서도 호출 불가(`'use cache'`는 가능).
- root layout에서는 `params`를 읽지 않고 `await getLocale()`, `generateMetadata`에서는 locale 전달 없이 `await getTranslations('NS')`. `<NextIntlClientProvider>`는 props 없이 감싸면 locale·messages·now·timeZone·formats를 자동 상속한다.

### proxy.ts 함정

- Next.js 16 `proxy`는 Node.js 런타임 고정(`runtime` 설정 불가). default export(`export default createMiddleware(routing)`) 허용.
- 기본 matcher `'/((?!api|trpc|_next|_vercel|.*\\..*).*)'`는 **점이 들어간 경로**(`/users/jane.doe`)를 빠뜨린다 → `['/((?!api|trpc|_next|_vercel|.*\\..*).*)', '/([\\w-]+)?/users/(.+)']`처럼 추가.
- `localePrefix: 'as-needed'`·`'never'`이면 matcher가 접두사 없는 경로(`/about`)를 잡는지 확인한다. `'never'`는 URL이 로케일별로 유일하지 않아 alternate 링크가 비활성.
- 기존 `middleware.ts` 이관: `npx @next/codemod@canary middleware-to-proxy .`

### 매칭 안 되는 URL의 404

root layout이 `[locale]` 동적 세그먼트면 전역 404 구성이 어렵다. Next.js `global-not-found.tsx`(15.4+ **experimental**, `experimental.globalNotFound: true` 필요)를 `app/` 루트에 두고 `<html>`·`<body>`를 직접 포함해 반환한다. 이 파일은 레이아웃을 거치지 않으므로 전역 CSS·폰트를 직접 import한다.

---

## 3. `AppConfig` 타입 안전 — 적용이 안 될 때

```ts
// global.ts  (tsconfig include 범위 안에 둘 것)
import {routing} from '@/i18n/routing';
import messages from './messages/ko.json'; // 기준 로케일 파일

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]; // 'ko' | 'en'
    Messages: typeof messages;                // t('없는키') → 타입 에러
    // Formats: typeof formats;
  }
}
```

**`AppConfig` 타입이 실제로 적용되려면** `global.ts`가 프로젝트의 `tsconfig.json` `include` 범위 안에 있어야 한다(TypeScript는 컴파일 대상에 포함된 파일의 `declare module` 선언만 전역에 반영한다). 기본 `create-next-app` 템플릿의 `include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]`는 `**/*.ts`가 이미 `global.ts`를 포함하므로 보통 별도 설정이 필요 없다. 파일을 `src/` 밖(예: 프로젝트 루트)에 두거나 `include`를 좁혀둔 프로젝트라면 명시적으로 추가한다(2026-09-26 추가, content test Q1 gap 보강).

- `tsc --noEmit` 또는 에디터에서 `t('없는키')`가 타입 에러로 잡히지 않으면 가장 먼저 `global.ts`가 `include`(또는 `exclude`에 걸려 제외)되어 있는지 확인한다.
- ICU 인자까지 타입 검사(선택, experimental): tsconfig `allowArbitraryExtensions: true` + 플러그인 `createNextIntlPlugin({experimental: {createMessagesDeclaration: './messages/ko.json'}})` (`.d.json.ts` 생성).

> 4.0에서 전역 `IntlMessages` 선언 방식은 `AppConfig`(next-intl 모듈 스코프)로 대체됐다.

---

## 4. Server Action / Route Handler — locale 명시 전달 + 재검증

root-params가 동작하지 않으므로 locale을 **명시적 override**로 넘긴다 (Server Component에서 `subscribe.bind(null, await getLocale())`).

> 주의: bind로 넘어온 `locale`도 클라이언트가 조작 가능한 입력이다. 서버에서 `hasLocale(routing.locales, locale)`로 재검증한다.

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
- `onError`·`getMessageFallback` 같은 **함수 props는 직렬화 불가** → 서버에서 Provider에 직접 넘기지 말고 `'use client'` 래퍼 Provider를 만든다.

---

## 5. 정적 렌더링

### Next.js 16.3+ (권장) — 자동

2절 root-params 설정을 따르면 **추가 호출 없이** 정적 렌더링 대상이 된다. `generateStaticParams`(`routing.locales.map((locale) => ({locale}))`)만 layout(또는 page)에 둔다.

- Cache Components(`cacheComponents`) 사용 시에는 root param마다 최소 1개 값을 반환해야 빌드가 통과한다.
- 일부 로케일만 빌드 시점에 렌더해도 된다.

### Next.js 16.3 미만 (레거시) — `setRequestLocale`

> 주의: `setRequestLocale`은 4.13.5에서 deprecated. 16.3+ 신규 코드에서는 쓰지 않는다. 16.3 미만 레거시 유지보수에서만 사용.

모든 layout·page에서 `const {locale} = await params` → `hasLocale` 검증(불일치 시 `notFound()`) → `setRequestLocale(locale)`을 next-intl 함수 호출 **이전**에 한다. 레거시에서는 `generateMetadata`에서도 `getTranslations({locale, namespace: 'Metadata'})`로 locale을 넘겨야 한다.

**16.3+ 마이그레이션 체크리스트** (next-intl 블로그): ① `setRequestLocale()` 호출 제거 ② pass-through `app/layout.tsx` 제거 ③ 수동 `params` 읽기 → `getLocale()` ④ `generateMetadata`의 명시 locale override 제거 ⑤ `request.ts`를 2절 패턴으로.

---

## 6. 흔한 실수

| # | 실수 | 올바른 방법 |
|---|------|-------------|
| 1 | Next.js 16에서 `middleware.ts` 신규 작성 | `proxy.ts` (deprecated 경고). next-intl import 명은 `next-intl/middleware` 그대로 |
| 2 | `app/layout.tsx` pass-through 레이아웃 유지 | root-params 사용 시 제거. root layout = `app/[locale]/layout.tsx` |
| 3 | 16.3+ 신규 코드에 `setRequestLocale`·`requestLocale` 사용 | root-params 패턴 (2절). 둘 다 deprecated |
| 4 | `hasLocale` 검증 없이 `import(\`../../messages/${locale}.json\`)` | 허용 목록 검증 후 불일치 시 `notFound()` — 임의 로케일 문자열이 경로로 흘러드는 것 차단 |
| 5 | Server Action·Route Handler에서 `getTranslations('NS')`만 호출 | root-params 미지원 → `getTranslations({locale, namespace})` + 서버 재검증 |
| 6 | `next/link`·`next/navigation`의 `useRouter` 직접 사용 | `@/i18n/navigation`의 `Link`/`useRouter`/`redirect` (4.x `redirect`는 객체 인자, 접두사 강제는 `forcePrefix: true`) |
| 7 | 점 포함 경로(`/users/a.b`)가 404/미번역 | matcher에 해당 패턴 추가 (2절) |
| 8 | 한국어 복수형에 `one` 분기 작성 | CLDR상 `ko`는 복수 범주가 `other` **하나뿐** → `=0`·`=1` 정확값 매칭과 `other`만. 영어는 `one`/`other` |
| 9 | `plural`/`select`에 `other` 누락 | ICU상 `other` 필수 (FormatJS는 없으면 에러) |
| 10 | 메시지 키에 `.` 사용 (`"a.b": "..."`) | 중첩 객체로 표현 |
| 11 | `timeZone` 미설정 | 서버·브라우저 시간대가 달라 hydration mismatch → `getRequestConfig`에 `timeZone` 지정 |
| 12 | 모든 메시지를 클라이언트로 전달하고 방치 | 서버 번역 → props, 또는 `pick(useMessages(), 'NS')`로 네임스페이스 제한 |
| 13 | `unstable_cache` 안에서 로케일 의존 로직 | root-params 호출 불가 → `'use cache'` 사용 |
| 14 | `t.raw()` 결과를 사용자 입력과 섞어 `dangerouslySetInnerHTML` | 신뢰된 번역 원문에만. 사용자 값은 `t.rich`로 React 노드 렌더 |
