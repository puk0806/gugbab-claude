# TypeScript / React 코딩 규칙

이 파일은 TypeScript + React 코드 작성 시 준수해야 할 규칙입니다.
프론트엔드 스킬·에이전트 작업 시 참조한다.

---

## 타입 시스템

- `any` 사용 금지 — `unknown` + 타입 가드로 대체
- `as` 타입 단언은 외부 API 응답 경계에서만 허용
- 유니온/인터섹션 타입보다 명시적 인터페이스 우선
- `interface`는 확장 가능한 객체 형태, `type`은 유니온·유틸리티 타입에 사용
- `strictNullChecks: true` 준수 — 옵셔널 체이닝(`?.`), nullish 병합(`??`) 활용

## React 컴포넌트

- 컴포넌트 파일명: `PascalCase.tsx`
- 훅 파일명: `use{Name}.ts`
- 한 파일에 컴포넌트 1개 원칙 (작은 헬퍼 컴포넌트는 예외)
- props 타입은 `interface {ComponentName}Props` 명명
- 기본 export: 컴포넌트 / named export: 훅·유틸리티

## 상태 관리

- 로컬 UI 상태: `useState` / `useReducer`
- 전역 클라이언트 상태: Zustand
- 서버 상태·캐싱: TanStack Query — `useQuery`, `useMutation` 직접 사용
- Context는 테마·인증 등 변경 빈도가 낮은 값에만 사용

## 임포트 순서

```
1. React / 외부 라이브러리
2. 내부 모듈 (@/components, @/hooks, ...)
3. 타입 임포트 (import type ...)
4. 상대 경로 임포트
5. 스타일 파일
```

## 에러 처리

- 비동기 함수: `try/catch` 또는 TanStack Query `onError` 콜백
- 컴포넌트 경계: `ErrorBoundary` 래핑
- 사용자에게 보이는 에러 메시지는 기술 스택 정보 노출 금지

## 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `UserCard` |
| 훅 | camelCase + use 접두사 | `useUserData` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY` |
| 일반 변수·함수 | camelCase | `fetchUser` |
| 타입·인터페이스 | PascalCase | `UserProfile` |

## 금지 패턴

- `console.log` 프로덕션 코드에 남기지 않기
- 인라인 스타일(`style={{}}`) — CSS Module 또는 SCSS 사용
- `useEffect` 내부에서 상태 직접 업데이트 (무한 루프 위험)
- prop drilling 3단계 초과 — Zustand 또는 Compound Component 패턴 사용
