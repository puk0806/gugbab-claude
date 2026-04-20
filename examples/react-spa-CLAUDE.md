# CLAUDE.md — React SPA 프로젝트

<!-- 이 파일을 프로젝트 루트에 CLAUDE.md로 복사해서 사용하세요 -->

## 기술 스택

- React 18/19 + TypeScript
- Vite (빌드)
- TanStack Query (서버 상태)
- Zustand (클라이언트 상태)
- React Hook Form + Zod (폼)
- SCSS Modules (스타일)
- Vitest + React Testing Library (테스트)

## 개발 명령어

```bash
pnpm dev          # 개발 서버
pnpm build        # 프로덕션 빌드
pnpm test         # 테스트 실행
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
```

## 프로젝트 구조

```
src/
├── components/    ← 재사용 UI 컴포넌트
├── pages/         ← 라우트별 페이지 컴포넌트
├── hooks/         ← 커스텀 훅
├── stores/        ← Zustand 스토어
├── api/           ← API 클라이언트·TanStack Query
├── types/         ← 공유 타입 정의
└── utils/         ← 순수 유틸 함수
```

## 코딩 규칙

- `any` 사용 금지 → `unknown` + 타입 가드
- 컴포넌트 파일명 PascalCase, 훅 파일명 `use{Name}.ts`
- 인라인 스타일 금지 → SCSS Modules 사용
- `console.log` 프로덕션 코드에 남기지 않기
- prop drilling 3단계 초과 시 Zustand 또는 Compound Component 패턴

## 에러 처리

- 비동기 에러: TanStack Query `onError` + ErrorBoundary
- 폼 에러: Zod 스키마 + React Hook Form `formState.errors`
- 전역 에러: Root ErrorBoundary + 사용자 친화적 fallback UI

## 테스트 기준

- 단위 테스트: 커스텀 훅, 유틸 함수
- 통합 테스트: 주요 사용자 흐름 (로그인, 폼 제출 등)
- 커버리지 목표: 주요 비즈니스 로직 80% 이상

## 에이전트 활용

| 작업 | 에이전트 |
|------|----------|
| 컴포넌트·훅 구현 | `frontend-developer` |
| 아키텍처 결정 | `frontend-architect` |
| 빌드·타입 에러 | `build-error-resolver` |
| 코드 리뷰 | 직접 작업 |
