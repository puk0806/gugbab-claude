# frontend 스킬 (28종)

React·Next.js·TypeScript·SEO·접근성·성능·PWA·꿈 앱 UI·운세 앱 UI 등 프론트엔드 전 영역 스킬 모음.

> 각 스킬 클릭 → SKILL.md (패턴·코드 예시) | 검증 → verification.md

## 핵심 프레임워크·언어

| 스킬 | 설명 | 검증 |
|------|------|------|
| [nextjs](../../../.claude/skills/nextjs/SKILL.md) | Next.js 15/16 App Router, 데이터 페칭, 캐싱 전략, Server Actions | [→](./nextjs/verification.md) |
| [typescript-v5](../../../.claude/skills/typescript-v5/SKILL.md) | TypeScript 5.x 버전별 신규 기능, tsconfig, React 타입 패턴 | [→](./typescript-v5/verification.md) |
| [next-intl-i18n](../../../.claude/skills/next-intl-i18n/SKILL.md) | Next.js 16.3+ App Router 다국어(next-intl 4.14) — defineRouting·localePrefix, proxy.ts, next/root-params 기반 getRequestConfig, Server/Client 번역, ICU 복수형·날짜·숫자 포맷 | [→](./next-intl-i18n/verification.md) |

## 상태 관리·폼·에러

| 스킬 | 설명 | 검증 |
|------|------|------|
| [tanstack-query](../../../.claude/skills/tanstack-query/SKILL.md) | TanStack Query v5 최신 변경점(onMutate 시그니처·통합 메서드 deprecated·`'static'`)·실측 함정·App Router SSR + v4→v5 마이그레이션(codemod·런타임 함정) | [→](./tanstack-query/verification.md) |

## UI 컴포넌트·라이브러리

| 스킬 | 설명 | 검증 |
|------|------|------|
| [mui-v9](../../../.claude/skills/mui-v9/SKILL.md) | MUI v9 + Emotion — slots/slotProps, CSS Variables·colorSchemes, v5→v9 마이그레이션 | [→](./mui-v9/verification.md) |
| [mui-v5](../../../.claude/skills/mui-v5/SKILL.md) | MUI v5(EOL, 최종 5.18.0) 레거시 고정용 — Emotion styled/sx, v5 Grid item/xs 문법, components/componentsProps, CSS 변수는 experimental, @mui/styles React 18 비호환, v6+ 업그레이드 경로 | [→](./mui-v5/verification.md) |
| [ag-grid](../../../.claude/skills/ag-grid/SKILL.md) | AG Grid v33 — ModuleRegistry 모듈 등록, Theming API, Community(MIT) vs Enterprise 경계, React 셀 렌더러·getRowId, Next.js App Router, row model별 성능 | [→](./ag-grid/verification.md) |
| [srs-spaced-repetition](../../../.claude/skills/srs-spaced-repetition/SKILL.md) | 간격 반복 학습 알고리즘 — SM-2(Anki) + FSRS-5 비교 | [→](./srs-spaced-repetition/verification.md) |

## 빌드·번들러·마이그레이션

| 스킬 | 설명 | 검증 |
|------|------|------|
| [monorepo-turborepo](../../../.claude/skills/monorepo-turborepo/SKILL.md) | 모노레포 구조, Turborepo 파이프라인 | [→](./monorepo-turborepo/verification.md) |
| [webpack-vite-config-mapping](../../../.claude/skills/webpack-vite-config-mapping/SKILL.md) | Webpack/Craco 설정 → Vite 1:1 매핑 | [→](./webpack-vite-config-mapping/verification.md) |
| [vite-advanced-splitting](../../../.claude/skills/vite-advanced-splitting/SKILL.md) | Vite 고급 코드 스플리팅 — manualChunks 함수형, 멀티 빌드 | [→](./vite-advanced-splitting/verification.md) |
| [code-convention](../../../.claude/skills/code-convention/SKILL.md) | ESLint 9+ flat config, Biome, Prettier, Husky, lint-staged | [→](./code-convention/verification.md) |

## 테스트

| 스킬 | 설명 | 검증 |
|------|------|------|
| [testing](../../../.claude/skills/testing/SKILL.md) | Jest/Vitest + React Testing Library, 동작 중심 테스트 전략 | [→](./testing/verification.md) |
| [storybook](../../../.claude/skills/storybook/SKILL.md) | Storybook 8.x — CSF 3.0, args/controls, play function, autodocs | [→](./storybook/verification.md) |

## 성능

| 스킬 | 설명 | 검증 |
|------|------|------|
| [build-perf-benchmarking](../../../.claude/skills/build-perf-benchmarking/SKILL.md) | 빌드 시간·번들 크기·dev 서버(HMR) 측정 최신 변경점·함정 — hyperfine 2.0 파괴적 변경, size-limit 14, Vite 8 Rolldown (구 bundle-size-analysis·dev-server-hmr-benchmarking 통합) | [→](./build-perf-benchmarking/verification.md) |
| [lighthouse-ci-setup](../../../.claude/skills/lighthouse-ci-setup/SKILL.md) | Lighthouse CI + Core Web Vitals 회귀 감지 설정 | [→](./lighthouse-ci-setup/verification.md) |
| [web-vitals-rum-comparison](../../../.claude/skills/web-vitals-rum-comparison/SKILL.md) | RUM 실사용자 CWV — Sentry/Datadog 배포 전후 비교 | [→](./web-vitals-rum-comparison/verification.md) |

## SEO·접근성

| 스킬 | 설명 | 검증 |
|------|------|------|
| [seo-vite-spa](../../../.claude/skills/seo-vite-spa/SKILL.md) | Vite/CRA SPA SEO — Googlebot 한계, head 관리, SSG, CRA deprecated | [→](./seo-vite-spa/verification.md) |
| [geo-ai-discoverability](../../../.claude/skills/geo-ai-discoverability/SKILL.md) | GEO — llms.txt, AI 크롤러 robots 분기, 질문-답변 구조 | [→](./geo-ai-discoverability/verification.md) |
| [wcag-2.2-checklist](../../../.claude/skills/wcag-2.2-checklist/SKILL.md) | WCAG 2.2 A/AA 전체 체크리스트 + 2.2 신규 9개 SC + 미디어 SC(1.2.3 vs 1.2.5, captions vs subtitles) | [→](./wcag-2.2-checklist/verification.md) |
| [search-console-webmaster](../../../.claude/skills/search-console-webmaster/SKILL.md) | GSC·Bing·Naver·Yandex·Baidu 콘솔 운영, IndexNow(네이버 엔드포인트), Search Console API·cron 자동화 함정 | [→](./search-console-webmaster/verification.md) |
| [naver-seo-specifics](../../../.claude/skills/naver-seo-specifics/SKILL.md) | 네이버 SEO — C-Rank, D.I.A.+, 서치어드바이저, 통합검색 | [→](./naver-seo-specifics/verification.md) |
| [kakao-share-optimization](../../../.claude/skills/kakao-share-optimization/SKILL.md) | 카카오톡 공유 OG 최적화 — SDK 2.8.x, 캐시 초기화, SPA 주의 | [→](./kakao-share-optimization/verification.md) |
| [bot-management-seo](../../../.claude/skills/bot-management-seo/SKILL.md) | 봇 관리 — Cloudflare Bot, AWS WAF, Googlebot 화이트리스트 | [→](./bot-management-seo/verification.md) |

## LLM·음성·PWA

| 스킬 | 설명 | 검증 |
|------|------|------|
| [voice-input-ui](../../../.claude/skills/voice-input-ui/SKILL.md) | 음성 입력 최신 변경점·함정 — OpenAI 구 전사 모델 지원 종료(2027-02-26 제거)·gpt-transcribe, Web Speech 브라우저 지원 현실, MediaRecorder 함정 (구 web-speech-api-stt·media-recorder-api·whisper-api-integration 통합) | [→](./voice-input-ui/verification.md) |
| [pwa-push-notifications](../../../.claude/skills/pwa-push-notifications/SKILL.md) | Web Push API + VAPID — iOS Safari 16.4+, 권한 설계 | [→](./pwa-push-notifications/verification.md) |

## 꿈 앱 UI (꿈 도메인 블록 · 프리셋 `dream`)

| 스킬 | 설명 | 검증 |
|------|------|------|
| [dream-privacy-consent-ui](../../../.claude/skills/dream-privacy-consent-ui/SKILL.md) | 꿈 데이터 동의 UI — 개인정보보호법 제23조, GDPR | [→](./dream-privacy-consent-ui/verification.md) |

## 운세 앱 UI (운세 도메인 블록 · 프리셋 `fortune`)

| 스킬 | 설명 | 검증 |
|------|------|------|
| [saju-chart-visualization](../../../.claude/skills/saju-chart-visualization/SKILL.md) | 사주 원국 표·오행 분포 차트·대운 타임라인 — 오방정색 WCAG 재조정, "오행 개수=우열" 오독 방지, CJK 서브셋, SVG vs 차트 라이브러리 | [→](./saju-chart-visualization/verification.md) |
