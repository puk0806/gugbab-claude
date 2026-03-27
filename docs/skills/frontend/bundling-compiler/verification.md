# bundling-compiler 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `bundling-compiler` |
| 스킬 경로 | `.claude/skills/frontend/bundling-compiler/SKILL.md` |
| 검증일 | 2026-03-27 |
| 스킬 버전 | v1 |

---

## 1. 작업 목록

- [x] tsup 공식 문서 확인
- [x] Vite 공식 문서 확인
- [x] Turbopack 공식 문서 확인 (nextjs.org)
- [x] React Compiler v1.0 공식 문서 확인
- [x] Vanilla Extract 공식 문서 확인
- [x] 번들러 선택 기준 정리
- [x] Tree Shaking 패턴 정리
- [x] 코드 스플리팅 패턴 정리
- [x] SKILL.md 파일 작성

---

## 2. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| tsup 공식 | https://tsup.egoist.dev | ⭐⭐⭐ High | - | 공식 |
| Vite 공식 가이드 | https://vitejs.dev/guide | ⭐⭐⭐ High | - | 공식 |
| Next.js Turbopack 문서 | https://nextjs.org/docs/app/api-reference/turbopack | ⭐⭐⭐ High | - | 공식 |
| React Compiler 문서 | https://react.dev/learn/react-compiler | ⭐⭐⭐ High | - | 공식 |
| Vanilla Extract 공식 | https://vanilla-extract.style/documentation | ⭐⭐⭐ High | - | 공식 |

---

## 3. 검증 체크리스트

### 3-1. 내용 정확성
- [x] React Compiler v1.0 안정화 날짜 (2025년 10월) 명시
- [x] Turbopack이 Next.js 16 기본값임을 반영
- [x] tsup format 옵션 (esm/cjs) 정확히 기술
- [x] sideEffects false 설정 의미 정확히 기술

### 3-2. 구조 완전성
- [x] 번들러 선택 기준 (결정 트리) 포함
- [x] 각 도구별 기본 설정 예시 포함
- [x] package.json exports 설정 패턴 포함
- [x] Tree Shaking 원리와 설정 포함
- [x] 코드 스플리팅 (lazy, dynamic) 패턴 포함
- [x] Vanilla Extract Next.js 설정 포함

### 3-3. 실용성
- [x] 도구 선택 기준이 명확한 기준으로 제시됨
- [x] 범용적 패턴 (특정 프로젝트 종속 없음)
- [ ] 에이전트 활용 테스트 (미실시)

---

## 4. 테스트 진행 기록

### 테스트 케이스 1: 번들러 선택 질문

**테스트 질문 (예정):**
```
React 컴포넌트 라이브러리를 npm에 배포하려는데 번들러 뭘 써야 해?
```

**기대 결과:**
- tsup 추천 (라이브러리 빌드 최적화)
- ESM + CJS 듀얼 빌드 설정 예시
- sideEffects: false 설정 언급

**판정:** ⏳ PENDING_TEST

---

### 테스트 케이스 2: React Compiler 도입 질문

**테스트 질문 (예정):**
```
React Compiler 도입하면 useMemo 다 지워도 돼?
```

**기대 결과:**
- Rules of React를 지키는 컴포넌트에 한해 자동 최적화
- 위반 시 해당 컴포넌트만 건너뜀
- 점진적 도입 권장

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

- [ ] 에이전트 테스트 수행
- [ ] Rolldown (Vite 8 기본 번들러) 내용 구체화
- [ ] Parcel 관련 내용 추가 고려

---

## 7. 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-03-27 | v1 | 최초 작성 |
