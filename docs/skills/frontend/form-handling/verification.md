---
skill: form-handling
category: frontend
version: v1
date: 2026-09-26
status: APPROVED
---

# form-handling 스킬 검증 문서

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
| 스킬 이름 | form-handling |
| 스킬 경로 | `.claude/skills/form-handling/SKILL.md` |
| 최초 작성일 | 2026-04-01 |
| 검증일 | 2026-09-26 (최초 2026-04-01, 직전 재검증 2026-04-14 · Zod 4 현행화 2026-09-25 · 재테스트·선택 보강 2026-09-26) |
| 재검증일 | 2026-04-14 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | React Hook Form 최신, Zod v3, React 19 |

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
| 활용 테스트 | frontend-architect | zodResolver import, field.id key, Server Action 연동, formErrors 접근, coerce.number(), discriminatedUnion 6개 | 5/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| React Hook Form 공식 | https://react-hook-form.com/docs | ⭐⭐⭐ High |
| Zod 공식 | https://zod.dev/api | ⭐⭐⭐ High |

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
- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외
- [✅] 버전 명시 (React Hook Form 7.x, Zod 4.x(4.6), @hookform/resolvers 5.x, React 19)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED — v1)
- [✅] Zod 4 현행화(v3) 재테스트 수행 (2026-09-26, general-purpose 2문항)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-26
**수행자**: skill-tester → general-purpose (v3 Zod 4 예제 현행화 재테스트)
**수행 방법**: SKILL.md(v3) Read 후 실전 질문 2개 답변(Zod 4 top-level 포맷 함수, coerce 제네릭 분리 + Server Action flattenError), 근거 줄번호 확인

### 실제 수행 테스트 (v3, 2026-09-26)

**Q1. 이메일 필드 Zod 4 검증 문법 + `z.string().email()`·`message` 옵션 그대로 쓰면 문제**
- ✅ PASS
- 근거: SKILL.md "기본 설정" 주의 문구(33행), 스키마 예제(45~46행), "Zod 패턴 모음"(264~267행)
- 상세: `z.email({ error: ... })` top-level 문법과 `message`→`error` 옵션 변경을 정확히 인용. `z.string().email()`이 "deprecated(동작은 함)"이라는 문서 표현까지 정확히 반영. `message` 옵션을 그대로 쓸 때 런타임 동작(무시/타입에러 여부)이 SKILL.md에 명시되지 않은 점을 gap으로 지적

**Q2. `z.coerce.number()` 사용 시 useForm 제네릭 분리 + Server Action 에러 전달(Zod 4)**
- ✅ PASS
- 근거: SKILL.md "Zod 패턴 모음" 주의 문구(283행), "React 19 Server Actions 연동"(199~216행)
- 상세: `useForm<z.input<typeof S>, unknown, z.output<typeof S>>` 3-제네릭 분리 패턴과, Server Action에서 `safeParse` + `z.flattenError(result.error)`(구 `.flatten()` 대체)로 `{formErrors, fieldErrors}` 반환하는 흐름을 정확히 설명. coerce 스키마의 전체 컴포넌트 예제·`flattenError`→`setError` 필드 매핑 통합 예제 부재를 gap으로 지적

### 발견된 gap (v3)

- `z.string().email()` 등 deprecated 패턴을 실제로 썼을 때의 런타임 동작(무시/경고/타입에러)이 명시되지 않음 — 선택 보강, 비차단
- coerce 스키마 + 3-제네릭 분리 패턴의 전체 동작 컴포넌트 예제 없음 — 선택 보강, 비차단
- Server Action `flattenError` 결과를 필드별 `setError`에 매핑하는 통합 예제 없음 — 선택 보강, 비차단

### 판정 (v3)

- agent content test: 2/2 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 — content test PASS = APPROVED 가능
- 최종 상태: APPROVED 유지 (2026-09-25 "재테스트 권장" 표기 해소, 2026-09-26 재테스트 완료)

---

## 5-이전. v1 테스트 진행 기록 (참고용)

### 테스트 케이스 1: frontend-architect 에이전트 활용 테스트

**테스트 방법:** frontend-architect 에이전트에게 form-handling 관련 설계 질문 및 코드 리뷰 요청

**발견 및 수정 사항:**
- Server Action onSubmit 타입 오류: `onSubmit(data: FormData)` → `onSubmit(data: z.infer<typeof Schema>)` 수정. RHF handleSubmit은 스키마 타입 객체를 전달하며, FormData로 변환 후 Server Action에 전달하는 코드 추가

**판정:** ✅ PASS

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (frontend-architect, v1) / ✅ 2/2 PASS (general-purpose, v3 Zod 4 재테스트 2026-09-26) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] Zod 4 현행화(v3) 재테스트 — 완료 (2026-09-26, 2/2 PASS)
- [✅] deprecated 패턴(`z.string().email()` 등) 실사용 시 런타임 동작 명시 (2026-09-26, zod.dev/v4/changelog "still exist and work as before, but are now deprecated" 인용 — 런타임 예외 없음·타입 경고만)
- [✅] coerce 스키마 3-제네릭 분리 패턴의 전체 컴포넌트 예제 추가 (2026-09-26, `AgeGateForm` — `useForm<z.input<>, unknown, z.output<>>` 전체 동작 예제)
- [✅] Server Action `flattenError` → RHF `setError` 필드 매핑 통합 예제 추가 (2026-09-26, 서버 액션 + 클라이언트 `setError` 순회 매핑 통합 예제)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-01 | v1 | 최초 작성 및 frontend-architect 활용 테스트 완료 | frontend-architect 에이전트 |
| 2026-04-17 | v2 | verification.md 신규 8섹션 포맷으로 마이그레이션 | 메인 대화 오케스트레이션 |
| 2026-09-25 | v3 | **Zod 4 예제 현행화 — 재테스트 권장.** 기준 버전 명시(RHF 7.x·zod 4.x(4.6)·@hookform/resolvers 5.x). `z.string().email()`→`z.email()`, `z.string().datetime()`→`z.iso.datetime()`, 메시지 옵션 `message`→`{ error }`, `error.flatten()`→`z.flattenError()`, `import * as z`, `z.strictObject/z.looseObject`·coerce 시 input/output 제네릭 주의 추가. 서버 검증 상세는 `backend/zod-schema-validation` 링크. 근거: https://zod.dev/v4/changelog. 코드 예제 실질 변경이나 status **APPROVED 유지**(재테스트 권장) | 메인 대화 오케스트레이션 |
| 2026-09-25 | v3 | 교차 참조 조건부 표기 (내용 변경 없음) | Claude (Sonnet 5) |
| 2026-09-26 | v3 | 2단계 실사용 재테스트 수행 (Q1 Zod 4 top-level 이메일 포맷·`error` 옵션 / Q2 coerce 3-제네릭 분리·Server Action flattenError) → 2/2 PASS, "재테스트 권장" 해소·APPROVED 유지 | skill-tester |
| 2026-09-26 | v3 | **선택 보강 — skill-tester 지적 gap 해소.** deprecated 패턴 런타임 동작 명시(zod.dev/v4/changelog 인용, 예외 없이 동작·타입 경고만), coerce 3-제네릭(`useForm<z.input<>, unknown, z.output<>>`) 전체 컴포넌트 예제, 서버 `z.flattenError` → RHF `setError` 필드 매핑 통합 예제 추가. react-hook-form.com/ts·github.com/react-hook-form/resolvers·zod.dev/error-formatting WebFetch로 시그니처·반환 형태 확인. 기존 판정과 모순 없어 status **APPROVED 유지** | 메인 대화 오케스트레이션 |
