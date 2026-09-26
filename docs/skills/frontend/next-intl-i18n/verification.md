---
skill: next-intl-i18n
category: frontend
version: v1
date: 2026-09-25
status: APPROVED
---

# 스킬 검증 — next-intl-i18n

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `next-intl-i18n` |
| 스킬 경로 | `.claude/skills/frontend/next-intl-i18n/SKILL.md` |
| 검증일 | 2026-09-25 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 버전 기준 | next-intl 4.14.7 (2026-09-24, npm latest) / Next.js 16.3.x (공식 문서 16.3.6 시점) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (next-intl.dev routing/setup·configuration·usage·typescript·navigation)
- [✅] 공식 GitHub 2순위 소스 확인 (amannn/next-intl releases, CHANGELOG, docs mdx 원문, examples/example-app-router)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-09-25, next-intl 4.14.7)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (root-params 기반 request config, proxy.ts, AppConfig)
- [✅] 코드 예시 작성 (routing·proxy·navigation·request·layout·global.ts·locale switcher·Server Action)
- [✅] 흔한 실수 패턴 정리 (17항목)
- [✅] SKILL.md 파일 작성 (491줄, 500줄 이하)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 사전 | Read / Glob | VERIFICATION_TEMPLATE.md, `frontend/i18n-seo`, `frontend/nextjs` SKILL.md, 중복 스킬 확인 | 중복 없음. Next.js 기준 16.3.x, proxy.ts 명칭 확인. SEO 범위(hreflang·sitemap·alternates)는 i18n-seo로 위임 |
| 조사 | WebFetch | next-intl.dev routing/setup, routing/configuration, usage/configuration, usage/plugin, blog/nextjs-root-params, blog/next-intl-4-0 | root-params 기반 request.ts 공식 권장, setRequestLocale 레거시화, localePrefix 3모드 |
| 조사 | WebFetch | raw.githubusercontent.com docs mdx (setup, configuration, server-client-components, typescript, translations, dates-times, numbers, navigation) | 코드 원문 확보 |
| 조사 | WebFetch | examples/example-app-router (layout.tsx, request.ts, LocaleSwitcherSelect.tsx, global.ts) | 공식 예제 코드 원문 확보 |
| 조사 | WebFetch | registry.npmjs.org/next-intl/latest, GitHub releases, CHANGELOG | 4.14.7, peer next ^16 포함 |
| 교차 검증 | WebFetch | nextjs.org next-root-params, proxy.js, not-found.js | 16.3.0 도입·제약, middleware→proxy(v16.0.0), global-not-found experimental |
| 교차 검증 | WebFetch | GitHub release v4.13.5 / v4.13.6 | setRequestLocale·requestLocale deprecation 원문 확인 |
| 교차 검증 | WebSearch | ICU plural/selectordinal(FormatJS), CLDR 한국어 복수 범주, `Formats` 타입, root-params 관련 | VERIFIED 다수 |
| 교차 검증 합계 | WebSearch + WebFetch | 18개 클레임, 독립 소스 2개 이상 | VERIFIED 16 / DISPUTED 1 / UNVERIFIED 1 (주의 표기) |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| next-intl — Setup locale-based routing | https://next-intl.dev/docs/routing/setup | ⭐⭐⭐ High | 2026-09-25 확인 | 공식 문서 |
| next-intl — Routing configuration | https://next-intl.dev/docs/routing/configuration | ⭐⭐⭐ High | 2026-09-25 확인 | 공식 문서 |
| next-intl — Request configuration | https://next-intl.dev/docs/usage/configuration | ⭐⭐⭐ High | 2026-09-25 확인 | 공식 문서 |
| next-intl — Plugin | https://next-intl.dev/docs/usage/plugin | ⭐⭐⭐ High | 2026-09-25 확인 | 공식 문서 |
| next-intl — TypeScript augmentation | https://next-intl.dev/docs/workflows/typescript | ⭐⭐⭐ High | 2026-09-25 확인 | 공식 문서 |
| next-intl — Server & Client Components / Translations / Dates / Numbers / Navigation (docs mdx 원문) | https://github.com/amannn/next-intl/tree/main/docs/src/pages/docs | ⭐⭐⭐ High | 2026-09-25 확인 | 공식 GitHub |
| next-intl 블로그 — Using next/root-params in Next.js 16.3 | https://next-intl.dev/blog/nextjs-root-params | ⭐⭐⭐ High | 2026-08-04 | 공식 블로그(메인테이너) |
| next-intl 블로그 — next-intl 4.0 | https://next-intl.dev/blog/next-intl-4-0 | ⭐⭐⭐ High | 2025-03-12 | 공식 블로그 |
| next-intl releases (v4.13.5, v4.13.6, v4.14.7) | https://github.com/amannn/next-intl/releases | ⭐⭐⭐ High | 2026-08-04 ~ 2026-09-24 | 공식 GitHub |
| next-intl example-app-router | https://github.com/amannn/next-intl/tree/main/examples/example-app-router | ⭐⭐⭐ High | 2026-09-25 확인 | 공식 예제 |
| npm registry next-intl latest | https://registry.npmjs.org/next-intl/latest | ⭐⭐⭐ High | 2026-09-25 | 버전·peerDeps |
| Next.js — next/root-params | https://nextjs.org/docs/app/api-reference/functions/next-root-params | ⭐⭐⭐ High | docs 16.3.6 | 공식 문서 |
| Next.js — proxy.js | https://nextjs.org/docs/app/api-reference/file-conventions/proxy | ⭐⭐⭐ High | docs 16.3.6 | 공식 문서 |
| Next.js — not-found.js (global-not-found) | https://nextjs.org/docs/app/api-reference/file-conventions/not-found | ⭐⭐⭐ High | docs 16.3.6 | 공식 문서 |
| FormatJS — ICU syntax | https://formatjs.github.io/docs/core-concepts/icu-syntax/ | ⭐⭐⭐ High | 2026-09-25 확인 | ICU 복수형·`other` 필수 |
| Unicode CLDR — Language Plural Rules | https://www.unicode.org/cldr/charts/48/supplemental/language_plural_rules.html | ⭐⭐⭐ High | CLDR 48 | 한국어 `other` 단일 범주 |

---

## 4. 검증 체크리스트 (Test List)

### 교차 검증 클레임 판정표

| # | 클레임 | 소스 | 판정 |
|---|--------|------|------|
| 1 | next-intl 최신 안정 버전은 4.14.7 (2026-09-24) | npm registry + GitHub releases | VERIFIED |
| 2 | next-intl peer `next`에 ^16.0.0 포함 | npm registry + CHANGELOG(4.4.0 "Next.js 16 update") | VERIFIED |
| 3 | Next.js 16에서 `middleware` 파일 컨벤션이 deprecated되고 `proxy`로 이름 변경, Node.js 런타임 기본·runtime 설정 불가 | Next.js proxy.js 문서 version history + next-intl setup 문서("Prior to Next.js 16, this file was named middleware.ts") + 레포 nextjs 스킬 | VERIFIED |
| 4 | next-intl 쪽 import는 `createMiddleware from 'next-intl/middleware'` 그대로 | next-intl setup 문서 코드 + 공식 example | VERIFIED |
| 5 | `next/root-params`는 Next.js 16.3.0 도입, 16.3+ 기본 사용 가능 | Next.js root-params 문서 version history + next-intl 블로그/setup | VERIFIED |
| 6 | root-params는 Server Component 전용, Client Component·Server Action 불가, Route Handler는 향후 지원 예정, `unstable_cache` 내부 불가 | Next.js root-params 문서 + next-intl 블로그 | VERIFIED |
| 7 | root-params 사용 시 pass-through `app/layout.tsx` 제거 필요 (root layout이 `[locale]`이어야 함) | next-intl 블로그 + Next.js 문서("dynamic segments that appear before the root layout") | VERIFIED |
| 8 | `setRequestLocale`은 4.13.5에서 deprecated | GitHub release v4.13.5 원문 + CHANGELOG + setup 문서 deprecation notice | VERIFIED |
| 9 | `getRequestConfig`의 `requestLocale` 파라미터는 4.13.6에서 deprecated | GitHub release v4.13.6 원문 + CHANGELOG + configuration 문서("legacy") | VERIFIED |
| 10 | 권장 request.ts: `getRequestConfig(async ({locale}) => { if (!locale) rootParams.locale() + hasLocale + notFound })`, 반환값 `locale` 필수 | setup 문서 mdx 원문 + example-app-router request.ts + 4.0 블로그(locale 필수) | VERIFIED |
| 11 | `localePrefix` 모드: `always`(기본)·`as-needed`·`never`, 후 두 모드는 matcher가 접두사 없는 경로를 잡아야 함 | routing/configuration 문서 + setup 문서 | VERIFIED |
| 12 | `NextIntlClientProvider`는 서버에서 렌더 시 messages·formats 등 자동 상속(4.0~), 함수형 props(onError 등)는 상속 안 됨 | 4.0 블로그 + configuration 문서 + example layout(`<NextIntlClientProvider>` props 없음) | VERIFIED |
| 13 | 타입 확장은 `declare module 'next-intl' { interface AppConfig { Locale; Messages; Formats } }` | typescript 문서 + example global.ts + 4.0 블로그 | VERIFIED |
| 14 | async 컴포넌트는 `getTranslations`, 비-async 컴포넌트는 `useTranslations` | server-client-components 문서 + example layout(getTranslations) | VERIFIED |
| 15 | ICU plural `#`·`=0`·`other` 필수, selectordinal, select `other` 필수 | next-intl translations 문서 + FormatJS ICU 문서 | VERIFIED |
| 16 | 한국어(ko)는 CLDR 복수 범주가 `other` 하나뿐 | CLDR plural rules 차트 + 복수 가이드(Locize 등) 검색 | VERIFIED |
| 17 | `global-not-found.tsx`로 `[locale]` root layout 앱의 전역 404 처리 | Next.js not-found 문서 — 15.4.0 도입이며 **여전히 experimental**, `experimental.globalNotFound: true` 필요 | DISPUTED → SKILL.md에 "experimental·플래그 필요"로 정정 표기 |
| 18 | 16.3 미만에서는 `experimental.rootParams` 플래그로 root-params 사용 가능 | next-intl setup 문서에만 언급, Next.js 16.3 문서 version history에는 이전 experimental 이력 미기재 | UNVERIFIED → SKILL.md 1장에 한 줄로만 언급, 레거시 경로는 `setRequestLocale`로 안내 |

### 3-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (next-intl 4.14.7, Next.js 16.3.x)
- [✅] deprecated된 패턴을 권장하지 않음 (setRequestLocale·requestLocale·middleware.ts는 레거시로만 표기)
- [✅] 코드 예시가 실행 가능한 형태임 (공식 example-app-router 기반)

### 3-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (적용 범위, i18n-seo·nextjs 위임)
- [✅] 흔한 실수 패턴 포함 (17항목)

### 3-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (ko 기본 + en)
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 3-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-09-25)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-09-25)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — 잘못된 응답 없음, 경미한 gap만 발견 (2026-09-25)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-25
**수행자**: skill-tester → general-purpose (domain-specific 에이전트 대체 사용)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Next.js 16.3 App Router에 ko/en next-intl 신규 설정 — 핵심 기능 사용**
- ✅ PASS
- 근거: SKILL.md 2장(파일 구조), 3장(설정 코드), 4장(메시지·AppConfig), 5장(Server/Client 번역)
- 상세: 필요 파일 10개(설치·messages·next.config·routing·proxy·navigation·request·layout·global.ts·page)를 순서대로 근거 줄번호와 함께 정확히 제시. `app/layout.tsx` pass-through 금지, `proxy.ts` 파일명, root-params 자동 정적 렌더링까지 정확히 반영. 사소한 gap: `AppConfig` tsconfig include 구체 예시 부재(스킬도 주석 한 줄로만 언급 — 사소함)

**Q2. Server Action에서 getTranslations 로케일 인식 실패 — 흔한 함정**
- ✅ PASS
- 근거: SKILL.md §3-5(root-params 서버 컴포넌트 전용 제약), §5 "Server Action / Route Handler — locale 명시 전달", §9 흔한 실수 #5
- 상세: root-params가 Server Action에서 동작하지 않는 원인과 `getTranslations({locale, namespace})` + `.bind(null, locale)` 해법을 정확히 제시. "클라이언트가 넘긴 locale을 믿으면 안 된다"는 §5 335행의 `hasLocale` 재검증 요구사항까지 정확히 연결(anti-pattern 회피 확인됨). 사소한 gap: `hasLocale` 검증 실패 시 구체적 처리 코드(에러/notFound/폴백) 예시가 SKILL.md에 없음 — 원칙만 명시된 상태

**Q3. Next.js 15→16.3 마이그레이션 판단형 질문**
- ✅ PASS
- 근거: SKILL.md 1장 표(root-params 16.3.0 도입), 7-2절(레거시 setRequestLocale 패턴), 7-2 하단 "16.3+ 마이그레이션 체크리스트"
- 상세: 15에서는 7-2 레거시 경로(`middleware.ts`+`setRequestLocale`+수동 locale 전달)를, 16.3 전환 시 5단계 공식 체크리스트(setRequestLocale 제거 등)를 정확히 인용. 버전 무관 영역(routing/navigation/메시지/ICU)과 버전 분기 영역을 정확히 구분. 사소한 gap: 15 단계에서 미리 `app/[locale]/layout.tsx` 단일 구조로 짜두면 안전하다는 조언은 SKILL.md에 명시 없음(에이전트가 자기 추론임을 스스로 밝힘 — 명확히 구분되어 오염 없음)

### 발견된 gap (SKILL.md 보강 권장, 차단 요인 아님)

- Server Action에서 `hasLocale` 재검증 실패 시 구체적 처리 패턴(에러 throw/notFound/기본 로케일 폴백) 코드 예시 추가 권장
- `AppConfig` 타입이 적용되려면 `global.ts`가 어느 tsconfig `include` 경로에 있어야 하는지 구체 예시 추가 권장

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리 사용법 스킬(next-intl) — 실사용 필수 카테고리(빌드 설정/워크플로우/설정+실행/마이그레이션) 아님. content test PASS만으로 APPROVED 가능
- 최종 상태: APPROVED

---

### (참고용, 실행 전 작성된 예정 템플릿)

### 테스트 케이스 1: Next.js 16.3 신규 앱 설정

**입력 (질문/요청):**
```
Next.js 16.3 App Router에 ko(기본)/en 다국어를 next-intl로 붙이려면 어떤 파일을 어떻게 만들어야 해?
```

**기대 결과:**
```
routing.ts(defineRouting) + src/proxy.ts(createMiddleware) + navigation.ts + request.ts(root-params+hasLocale+notFound)
+ app/[locale]/layout.tsx를 root layout으로(app/layout.tsx 없음), setRequestLocale 미사용
```

**실제 결과:** (skill-tester 수행 대기)

**판정:** 미실행

---

### 테스트 케이스 2: Server Action에서 번역

**입력:**
```
Server Action 안에서 getTranslations('Form')를 호출했더니 로케일을 못 찾아. 왜?
```

**기대 결과:** root-params는 Server Action 미지원 → locale을 bind로 전달해 `getTranslations({locale, namespace})`, 서버에서 hasLocale 재검증

**실제 결과:** (skill-tester 수행 대기)

**판정:** 미실행

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (3/3 PASS, 2026-09-25 수행) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 2단계 content test 수행 후 섹션 5·6 갱신 (2026-09-25 완료, 3/3 PASS)
- [❌] Next.js root-params의 Route Handler 지원이 추가되면 5장 "Server Action / Route Handler" 섹션 갱신 — 차단 요인 아님, Next.js 측 기능 출시 시점에 맞춰 선택 갱신
- [❌] `global-not-found`가 stable로 전환되면 3-7 섹션의 experimental 표기 갱신 — 차단 요인 아님, Next.js 측 stable 전환 시점에 맞춰 선택 갱신
- [❌] 클레임 #18(`experimental.rootParams` 16.3 미만 지원 범위) 추가 확인 — 차단 요인 아님, SKILL.md에 이미 "주의: 미검증" 표기로 리스크 고지됨. 정확한 범위 확인은 선택 보강
- [❌] Server Action `hasLocale` 재검증 실패 시 처리 코드 예시 보강 — 차단 요인 아님, 원칙은 명시되어 있고 코드 예시만 부재(content test Q2에서 발견된 선택 보강 항목)
- [❌] `AppConfig` 타입 적용을 위한 tsconfig include 구체 예시 보강 — 차단 요인 아님, 선택 보강(content test Q1에서 발견)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-09-25 | v1 | 최초 작성 (next-intl 4.14.7 / Next.js 16.3.x 기준) | skill-creator |
| 2026-09-25 | v1 | 2단계 실사용 테스트 수행 (Q1 신규 설정 / Q2 Server Action 함정 / Q3 15→16.3 마이그레이션) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-25 | v1 | 교차 참조 조건부 표기 (내용 변경 없음) | Claude (Sonnet 5) |
