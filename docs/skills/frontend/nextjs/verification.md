---
skill: nextjs
category: frontend
version: v1
date: 2026-04-14
status: APPROVED
---

# nextjs 스킬 검증 문서

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 공식 문서 기반으로 내용 작성
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST

[2단계] 실제 사용 중 (온라인 검증)
  ├─ frontend-architect 에이전트 테스트 수행
  └─ 테스트 PASS → APPROVED
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | nextjs |
| 스킬 경로 | `.claude/skills/frontend/nextjs/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | Next.js 15/16 App Router |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인
- [✅] 최신 버전 기준 내용 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성
- [✅] Claude Code 에이전트에서 실제 활용 테스트

---

## 2. 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | App Router 구조, 데이터 페칭, Server Actions, 렌더링 전략, 메타데이터 API, Route Handlers 6개 | 4/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Next.js App Router 문서 | https://nextjs.org/docs/app | ⭐⭐⭐ High |
| Next.js 15 블로그 | https://nextjs.org/blog/next-15 | ⭐⭐⭐ High |
| Next.js 16 블로그 | https://nextjs.org/blog/next-16 | ⭐⭐⭐ High |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 공식 문서 1순위 소스 확인 (nextjs.org/docs)
- [✅] deprecated 패턴 제외 (middleware.ts → proxy.ts 구분 명시)
- [✅] 버전 명시 (Next.js 15/16)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)

---

## 5. 테스트 진행 기록

### 테스트 케이스 1: frontend-architect 에이전트 활용 테스트

**테스트 방법:** frontend-architect 에이전트에게 nextjs 관련 설계 질문 및 코드 리뷰 요청

**발견 및 수정 사항:**
- fetch 기본 캐싱 정책 오류: `cache: 'force-cache'`를 기본값으로 표기 → Next.js 15+에서는 `no-store`가 기본값. 주석 수정 완료
- 메타데이터 API 누락: `metadata` export / `generateMetadata` 함수 섹션 완전 누락 → 섹션 추가 완료
- unstable_cache 대체 API 미언급: Next.js 16 `'use cache'` 디렉티브 섹션 추가 완료
- useActionState Server Action 시그니처: `createPost` 함수에 `prevState` 첫 번째 파라미터 누락 → 수정 완료

**판정:** ✅ PASS

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (frontend-architect) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- 현재 없음

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-03-27 | v1 | 최초 작성 및 frontend-architect 활용 테스트 완료 | frontend-architect 에이전트 |
| 2026-04-17 | v2 | verification.md 신규 8섹션 포맷으로 마이그레이션 | 메인 대화 오케스트레이션 |
