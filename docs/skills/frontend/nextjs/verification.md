# nextjs 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `nextjs` |
| 스킬 경로 | `.claude/skills/frontend/nextjs/SKILL.md` |
| 검증일 | 2026-03-27 |
| 스킬 버전 | v1 |

---

## 1. 작업 목록

- [✅] 공식 문서 확인 (nextjs.org/docs)
- [✅] Next.js 15 주요 변경사항 확인 (async params/searchParams)
- [✅] Next.js 16 Breaking Changes 확인 (proxy.ts, Node.js 20.9.0, Turbopack 기본값)
- [✅] App Router 파일 컨벤션 정리
- [✅] 캐싱 4계층 구조 정리
- [✅] Server Actions 패턴 정리
- [✅] Streaming + Suspense 패턴 정리
- [✅] middleware.ts → proxy.ts 마이그레이션 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Next.js App Router 문서 | https://nextjs.org/docs/app | ⭐⭐⭐ High | - | 공식 |
| Next.js 캐싱 문서 | https://nextjs.org/docs/app/building-your-application/caching | ⭐⭐⭐ High | - | 공식 |
| Next.js 15 블로그 | https://nextjs.org/blog/next-15 | ⭐⭐⭐ High | 2024 | 공식 |

---

## 3. 검증 체크리스트

### 3-1. 내용 정확성
- [✅] Next.js 15 async params/searchParams Breaking Change 반영
- [✅] 캐싱 전략 (force-cache, no-store, revalidate) 정확히 기술
- [✅] Server Actions 'use server' 지시어 위치 정확히 기술
- [✅] Route Handler 응답 형식 (NextResponse) 정확히 기술

### 3-2. 구조 완전성
- [✅] YAML frontmatter 포함
- [✅] 파일 컨벤션 구조도 포함
- [✅] Server/Client Component 결정 기준 포함
- [✅] 데이터 페칭 패턴 (fetch, unstable_cache) 포함
- [✅] 캐싱 4계층 비교표 포함
- [✅] 흔한 실수 패턴 포함

### 3-3. 실용성
- [✅] Route Handler, Server Action, Middleware 예시 모두 포함
- [✅] 범용적 패턴 (특정 DB 라이브러리 종속 없음)
- [❌] 에이전트 활용 테스트 (미실시)

---

## 4. 테스트 진행 기록

### 테스트 케이스 1: 데이터 페칭 패턴 질문

**테스트 질문 (예정):**
```
Next.js에서 1시간마다 갱신되는 데이터를 페칭하려면?
```

**기대 결과:**
- `next: { revalidate: 3600 }` 옵션 사용 제안
- 또는 `unstable_cache`로 DB 쿼리 캐싱 언급

**판정:** ⏳ PENDING_TEST

---

### 테스트 케이스 2: Next.js 15 마이그레이션 질문

**테스트 질문 (예정):**
```
Next.js 14에서 15로 마이그레이션할 때 주의할 점은?
```

**기대 결과:**
- async params/searchParams Breaking Change 언급
- await params 패턴 코드 예시

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
- [❌] Next.js 16 특이사항 추가 (Turbopack 기본값 등)
- [❌] Parallel Routes / Intercepting Routes 패턴 추가 고려

---

## 7. 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2026-03-27 | v1 | 최초 작성 |
