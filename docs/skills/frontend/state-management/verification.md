# state-management 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `state-management` |
| 스킬 경로 | `.claude/skills/frontend/state-management/SKILL.md` |
| 검증일 | 2026-03-27 |
| 스킬 버전 | v1 |

---

## 1. 작업 목록

- [x] Zustand v5 공식 문서 확인 (named import, useShallow)
- [x] TanStack Query v5 공식 문서 확인 (객체 방식 API, onSuccess 제거)
- [x] v4→v5 Breaking Changes 정리
- [x] 슬라이스 패턴 정리
- [x] 쿼리 키 팩토리 패턴 정리
- [x] Next.js App Router + SSR Prefetching 패턴 정리
- [x] Zustand + TanStack Query 역할 분리 기준 정리
- [x] SKILL.md 파일 작성

---

## 2. 조사 소스

| 소스명 | URL | 신뢰도 | 비고 |
|--------|-----|--------|------|
| Zustand 공식 문서 | https://zustand.docs.pmnd.rs | ⭐⭐⭐ High | 공식 |
| Zustand v5 마이그레이션 | https://zustand.docs.pmnd.rs/migrations/migrating-to-v5 | ⭐⭐⭐ High | 공식 |
| TanStack Query v5 공식 | https://tanstack.com/query/v5/docs/framework/react/overview | ⭐⭐⭐ High | 공식 |
| TanStack Query v5 마이그레이션 | https://tanstack.com/query/v5/docs/framework/react/guides/migrating-to-v5 | ⭐⭐⭐ High | 공식 |

---

## 3. 검증 체크리스트

### 3-1. 내용 정확성
- [x] Zustand v5 named import (`import { create }`) 반영
- [x] useShallow 임포트 경로 (`zustand/react/shallow`) 정확
- [x] TanStack Query v5 객체 방식 API 반영
- [x] v5에서 onSuccess/onError 제거됨 표시
- [x] gcTime (구 cacheTime) 명칭 변경 반영
- [x] isPending vs isLoading 차이 설명

### 3-2. 구조 완전성
- [x] 상태 분류 기준표 (언제 뭘 쓸지) 포함
- [x] 슬라이스 패턴 코드 예시 포함
- [x] 쿼리 키 팩토리 패턴 포함
- [x] useMutation + 낙관적 업데이트 포함
- [x] useInfiniteQuery 패턴 포함
- [x] Next.js SSR Prefetching 포함
- [x] 흔한 실수 패턴 포함

### 3-3. 실용성
- [x] 범용적 패턴 (특정 도메인 종속 없음)
- [x] 즉시 적용 가능한 코드 예시
- [ ] 에이전트 활용 테스트 (미실시)

---

## 4. 테스트 케이스 (예정)

### 테스트 1: 상태 관리 도구 선택 질문
```
유저 목록 API 데이터와 사이드바 열림 상태를 관리하려면 뭘 써야 해?
```
**기대:** API 데이터 → TanStack Query, 사이드바 → Zustand로 분리 제안

### 테스트 2: v5 마이그레이션 질문
```
TanStack Query v4에서 v5로 올리는데 뭐가 바뀌었어?
```
**기대:** 객체 방식 API, onSuccess 제거, gcTime 명칭 변경, isPending 추가 언급

### 테스트 3: 캐시 전략 질문
```
TanStack Query에서 유저 상세 데이터를 5분간 캐싱하고 싶어
```
**기대:** staleTime: 5 * 60 * 1000 설정 + queryKey 팩토리 패턴 제안

---

## 5. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 에이전트 활용 테스트 | ⏳ PENDING |
| **최종 판정** | **PENDING_TEST** |

---

## 6. 개선 필요 사항

- [ ] 에이전트 테스트 수행
- [ ] Jotai와 비교 내용 추가 고려 (요청 시)
- [ ] React 19 use() hook과 TanStack Query 조합 패턴 추가 고려

---

## 7. 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-03-27 | v1 | 최초 작성 |
