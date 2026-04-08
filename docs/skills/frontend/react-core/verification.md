# react-core 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `react-core` |
| 스킬 경로 | `.claude/skills/frontend/react-core/SKILL.md` |
| 검증일 | 2026-03-27 |
| 스킬 버전 | v1 |

---

## 1. 작업 목록

- [✅] 공식 문서 1순위 소스 확인 (react.dev)
- [✅] React 19 릴리즈 블로그 확인
- [✅] React 18→19 마이그레이션 가이드 확인
- [✅] React Compiler v1.0 릴리즈 내용 확인
- [✅] Server/Client Component 결정 기준 정리
- [✅] 렌더링 최적화 패턴 정리
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| React 19 릴리즈 블로그 | https://react.dev/blog/2024/12/05/react-19 | ⭐⭐⭐ High | 2024-12-05 | 공식 |
| React v18 릴리즈 블로그 | https://react.dev/blog/2022/03/29/react-v18 | ⭐⭐⭐ High | 2022-03-29 | 공식 |
| React 19 업그레이드 가이드 | https://react.dev/blog/2024/04/25/react-19-upgrade-guide | ⭐⭐⭐ High | 2024-04-25 | 공식 |
| React Compiler v1.0 | https://react.dev/blog/2025/10/07/react-compiler-1 | ⭐⭐⭐ High | 2025-10-07 | 공식 |
| useActionState 레퍼런스 | https://react.dev/reference/react/useActionState | ⭐⭐⭐ High | - | 공식 |
| useOptimistic 레퍼런스 | https://react.dev/reference/react/useOptimistic | ⭐⭐⭐ High | - | 공식 |

---

## 3. 검증 체크리스트

### 3-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] React 18 / React 19 버전 구분 명시
- [✅] deprecated 패턴 (ReactDOM.render 등) 제거 또는 비권장으로 표시
- [✅] 코드 예시가 TypeScript 기준으로 작성됨

### 3-2. 구조 완전성
- [✅] YAML frontmatter 포함
- [✅] 소스 URL과 검증일 명시
- [✅] React 18/19 핵심 기능 비교표 포함
- [✅] 코드 예시 포함 (useActionState, useOptimistic, use hook 등)
- [✅] Server/Client Component 결정 기준표 포함
- [✅] 흔한 실수 패턴 포함

### 3-3. 실용성
- [✅] 실제 코드에서 바로 쓸 수 있는 패턴
- [✅] 범용적 (특정 프로젝트 종속 X)
- [❌] 에이전트 활용 테스트 (미실시 - Claude CLI 테스트 필요)

---

## 4. 테스트 진행 기록

> Claude CLI에서 frontend-architect 에이전트 구성 후 테스트 예정

### 테스트 케이스 1: React 19 폼 패턴 질문

**테스트 질문 (예정):**
```
React 19에서 폼 제출을 처리하는 가장 좋은 방법은?
```

**기대 결과:**
- useActionState를 사용한 Server Action 패턴 제안
- useOptimistic으로 낙관적 업데이트 패턴 언급
- isPending 상태로 로딩 처리

**판정:** ⏳ PENDING_TEST

---

### 테스트 케이스 2: 렌더링 최적화 질문

**테스트 질문 (예정):**
```
React Compiler가 활성화된 환경에서 useMemo를 써야 할까?
```

**기대 결과:**
- React Compiler 활성화 시 useMemo 대부분 불필요 언급
- 단, Rules of React 준수 필요 조건 언급

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

- [❌] Claude CLI에서 frontend-architect 에이전트로 실제 테스트 수행
- [❌] React Compiler 적용/미적용 케이스별 최적화 패턴 보강 고려
- [❌] React Native 관련 패턴 필요 시 별도 스킬로 분리

---

## 7. 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-03-27 | v1 | 최초 작성 |
