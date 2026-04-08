# typescript 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `typescript` |
| 스킬 경로 | `.claude/skills/frontend/typescript/SKILL.md` |
| 검증일 | 2026-03-27 |
| 스킬 버전 | v1 |

---

## 1. 작업 목록

- [✅] 공식 문서 확인 (typescriptlang.org/docs)
- [✅] tsconfig 핵심 옵션 정리
- [✅] 유틸리티 타입 패턴 정리
- [✅] React 타입 패턴 정리 (ComponentProps, PropsWithChildren 등)
- [✅] 타입 가드 패턴 정리
- [✅] as const / satisfies 정리
- [✅] 흔한 에러 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| TypeScript 핸드북 | https://www.typescriptlang.org/docs/handbook | ⭐⭐⭐ High | - | 공식 |
| tsconfig 레퍼런스 | https://www.typescriptlang.org/tsconfig | ⭐⭐⭐ High | - | 공식 |
| React TypeScript 가이드 | https://react.dev/learn/typescript | ⭐⭐⭐ High | - | 공식 |

---

## 3. 검증 체크리스트

### 3-1. 내용 정확성
- [✅] `moduleResolution: "bundler"` 최신 권장 설정 반영
- [✅] React.FC 비권장 이유 명시
- [✅] satisfies 연산자 (TS 4.9+) 버전 조건 명시
- [✅] noUncheckedIndexedAccess strict 설정 포함

### 3-2. 구조 완전성
- [✅] tsconfig 전체 권장 설정 포함
- [✅] 타입 vs 인터페이스 선택 기준표 포함
- [✅] 핵심 유틸리티 타입 사용 패턴 포함
- [✅] React 컴포넌트 타입 패턴 포함
- [✅] 타입 가드 패턴 (is, in, Discriminated Union) 포함
- [✅] 모노레포 tsconfig 상속 패턴 포함
- [✅] 흔한 에러 패턴 포함

### 3-3. 실용성
- [✅] 범용적 패턴 (React/Next.js 환경 기준)
- [✅] 실제 코드에서 바로 쓸 수 있는 예시
- [❌] 에이전트 활용 테스트 (미실시)

---

## 4. 테스트 진행 기록

### 테스트 케이스 1: 타입 선택 질문

**테스트 질문 (예정):**
```
API 응답 타입을 정의할 때 type과 interface 중 뭐가 좋아?
```

**기대 결과:**
- 객체 스키마는 interface, 유니언/유틸리티는 type 기준 제시
- 일관성 유지 원칙 언급

**판정:** ⏳ PENDING_TEST

---

### 테스트 케이스 2: React Props 타입 질문

**테스트 질문 (예정):**
```
HTML button 속성을 모두 받으면서 variant prop을 추가하고 싶어
```

**기대 결과:**
- `extends React.ComponentProps<'button'>` 패턴 제시
- spread props 전달 예시 포함

**판정:** ⏳ PENDING_TEST

---

## 5. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ⏳ PENDING |
| **최종 판정** | **PENDING_TEST** |

---

## 6. 개선 필요 사항

- [❌] 에이전트 테스트 수행
- [❌] Template Literal Types 패턴 추가 고려
- [❌] Mapped Types 심화 패턴 추가 고려

---

## 7. 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-03-27 | v1 | 최초 작성 |
