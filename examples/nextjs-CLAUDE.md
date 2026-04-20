# CLAUDE.md — Next.js 프로젝트

<!-- 이 파일을 프로젝트 루트에 CLAUDE.md로 복사해서 사용하세요 -->

## 기술 스택

- Next.js 15 (App Router)
- TypeScript
- TanStack Query (클라이언트 데이터 페칭)
- Zustand (클라이언트 상태)
- React Hook Form + Zod (폼)
- SCSS Modules (스타일)
- Vitest + Playwright (테스트)

## 개발 명령어

```bash
pnpm dev          # 개발 서버
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버 실행
pnpm test         # 단위·통합 테스트
pnpm e2e          # Playwright E2E
pnpm typecheck    # tsc --noEmit
```

## App Router 규칙

```
app/
├── (auth)/        ← 인증 필요 없는 라우트 그룹
│   └── login/
├── (dashboard)/   ← 인증 필요 라우트 그룹
│   └── page.tsx
├── api/           ← Route Handlers
├── layout.tsx     ← Root layout
└── globals.scss
```

- `page.tsx`: Server Component 기본
- 클라이언트 상태 필요 시 최소 단위에만 `'use client'`
- 데이터 페칭: Server Component에서 `fetch` / 클라이언트에서 TanStack Query
- 캐싱: `fetch(url, { next: { revalidate: N } })` 또는 `unstable_cache`
- 메타데이터: `export const metadata` 또는 `generateMetadata`

## 렌더링 전략

| 페이지 유형 | 전략 | 이유 |
|------------|------|------|
| 정적 콘텐츠 | SSG (기본) | 빠른 로딩 |
| SEO 중요 동적 페이지 | SSR | 검색엔진 노출 |
| 사용자 맞춤 데이터 | CSR (TanStack Query) | 캐싱·갱신 용이 |
| 자주 바뀌는 콘텐츠 | ISR (revalidate) | 빌드 비용 절약 |

## 에러 처리

- `error.tsx`: 라우트 세그먼트 에러 바운더리
- `not-found.tsx`: 404 처리
- Server Action 에러: `try/catch` → 직렬화 가능한 에러 객체 반환

## 에이전트 활용

| 작업 | 에이전트 |
|------|----------|
| 컴포넌트·훅 구현 | `frontend-developer` |
| 렌더링 전략·캐싱 설계 | `frontend-architect` |
| 빌드·타입 에러 | `build-error-resolver` |
| SEO 최적화 | `frontend-developer` (seo 스킬 활용) |
