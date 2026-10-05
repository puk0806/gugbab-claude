# 로케일 전환 UI — 전체 컴포넌트 코드

> 소스: https://github.com/amannn/next-intl/tree/main/examples/example-app-router (공식 example, `LocaleSwitcherSelect.tsx`)
> 검증일: 2026-09-25

```tsx
// src/components/LocaleSwitcherSelect.tsx  (공식 example 축약)
'use client';
import {useParams} from 'next/navigation';
import type {Locale} from 'next-intl';
import {useLocale, useTranslations} from 'next-intl';
import {useTransition, type ChangeEvent} from 'react';
import {usePathname, useRouter} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';

export default function LocaleSwitcherSelect() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname(); // 로케일 접두사 제외 경로 ('/en' → '/')
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  function onChange(e: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = e.target.value as Locale;
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- 현재 라우트의 pathname·params는 항상 일치
        {pathname, params},
        {locale: nextLocale}
      );
    });
  }

  return (
    <label>
      <span className="sr-only">{t('label')}</span>
      <select defaultValue={locale} disabled={isPending} onChange={onChange}>
        {routing.locales.map((cur) => (
          <option key={cur} value={cur}>{t('locale', {locale: cur})}</option>
        ))}
      </select>
    </label>
  );
}
```

- 동적 세그먼트가 없으면 `router.replace(pathname, {locale: nextLocale})`로 충분.
- 링크 방식: `<Link href="/" locale="en">English</Link>`.
- 서버 측 리다이렉트: `redirect({href: '/login', locale})` (4.x는 객체 인자). 접두사 강제는 `forcePrefix: true`.
- 경로 문자열만 필요: `getPathname({locale: 'en', href: '/about'})`.
