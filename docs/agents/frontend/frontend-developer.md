# frontend-developer

## 개요

- **역할**: 프론트엔드 코드 구현 전담 에이전트. React/Next.js 컴포넌트, 커스텀 훅, API 연동, 폼 처리, 애니메이션 등 실제 코드를 작성하고 타입 에러를 분석/수정한다.
- **모델**: sonnet
- **도구**: Read, Write, Edit, Glob, Grep, Bash
- **카테고리**: frontend

## 사용 시점

- React/Next.js 컴포넌트를 새로 작성하거나 수정할 때
- 커스텀 훅, 유틸리티 함수를 구현할 때
- API 연동 코드(TanStack Query, fetch 등)를 작성할 때
- 폼 처리(React Hook Form + Zod) 코드를 구현할 때
- 무한 스크롤, 애니메이션 등 UI 인터랙션을 구현할 때
- TypeScript 타입 에러를 수정할 때
- 접근성(ARIA, 키보드 네비게이션)을 고려한 코드 작성이 필요할 때

## 사용 예시

- "로그인 폼 컴포넌트 만들어줘. React Hook Form + Zod 쓸게"
- "무한 스크롤 구현해줘. TanStack Query + IntersectionObserver"
- "TypeScript 타입 에러 나는데 고쳐줘" (에러 메시지 붙여넣기)

## 입력/출력

- **입력**: 구현 요청(컴포넌트 스펙, 기능 요구사항), 타입 에러 메시지, 프로젝트 경로
- **출력**: 작성/수정된 파일 목록, 주요 구현 내용 요약, `tsc --noEmit` 통과 확인 결과

## 관련 에이전트

- **frontend-architect** (frontend) -- 아키텍처 수준 질문은 이 에이전트에 위임
- **build-error-resolver** (backend) -- Vite/webpack 빌드 에러, tsc 에러 전담 해결
- **rust-backend-developer** (backend) -- 프론트엔드와 API 연동 시 백엔드 구현 협업
