---
skill: zod-schema-validation
category: backend
version: v1
date: 2026-09-25
status: APPROVED
---

# zod-schema-validation 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `zod-schema-validation` |
| 스킬 경로 | `.claude/skills/backend/zod-schema-validation/SKILL.md` |
| 검증일 | 2026-09-25 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 대상 라이브러리 버전 | zod 4.6.5 (최신 안정), 비교 대상 valibot 1.5.0 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (zod.dev — changelog, api, basics, error-customization, error-formatting, packages/mini, v4/versioning, blog/zod-4-6)
- [✅] 공식 GitHub 2순위 소스 확인 (colinhacks/zod releases, PR #5898, issue #2227, src/v4/locales)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-09-25, zod 4.6.5)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (body/query/params, env, 외부 API, 에러 포맷, 악성 입력, 모노레포 공유)
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리 (섹션 14)
- [✅] SKILL.md 파일 작성
- [✅] `frontend/form-handling` 스킬과 중복 회피 확인 (RHF 연동은 링크만, 서버 경계에 집중)
- [✅] Hono 통합은 `backend/hono-api-patterns` 링크로 위임

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 사전 확인 | Read / Glob / Grep | VERIFICATION_TEMPLATE.md, 중복 스킬, `frontend/form-handling` Zod 섹션 | 중복 스킬 없음. form-handling은 Zod 3 스타일(`z.string().email()`) RHF 연동 위주 → 서버 경계로 범위 분리 |
| 조사 | WebFetch | zod.dev/v4/changelog, /api, /basics, /error-customization, /error-formatting(2회), /packages/mini, /v4/versioning, /blog/zod-4-6 | Zod 4 breaking/deprecated 목록, strictObject/looseObject, stringbool, default/prefault, codec, 에러 우선순위, 포맷 함수 3종, Mini 사용 권장 조건, 서브패스 구조, 4.6 `.validate()` |
| 조사 | WebFetch | github.com/colinhacks/zod/releases, PR #5898, issue #2227, src/v4/locales, newreleases.io v4.4.0·4.6.5 | 최신 4.6.5, 4.4.0 `__proto__` catchall 스킵 수정, record 경로 과거 이슈, ko 로케일 존재 |
| 조사 | WebSearch / WebFetch | "valibot 1.5.0", valibot.dev/guides/comparison, standardschema.dev | Valibot 1.5.0, 번들·성능 자체 비교, Standard Schema 개념 |
| 교차 검증 | WebSearch (6회) | 14개 클레임, 독립 소스(DEV 마이그레이션 글, pockit, buildmvpfast, react-doctor, dependabot PR, resolvers 문서 등) | VERIFIED 12 / DISPUTED 1 / UNVERIFIED 1 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Zod 공식 — Migration guide | https://zod.dev/v4/changelog | ⭐⭐⭐ High | 2026-09-25 | Zod 3 → 4 변경점 |
| Zod 공식 — Defining schemas | https://zod.dev/api | ⭐⭐⭐ High | 2026-09-25 | 객체 모드, stringbool, coerce, default/prefault, codec |
| Zod 공식 — Basics | https://zod.dev/basics | ⭐⭐⭐ High | 2026-09-25 | parse/safeParse/async, infer/input/output |
| Zod 공식 — Customizing errors | https://zod.dev/error-customization | ⭐⭐⭐ High | 2026-09-25 | `error` 파라미터, 우선순위, locales |
| Zod 공식 — Formatting errors | https://zod.dev/error-formatting | ⭐⭐⭐ High | 2026-09-25 | treeify/flatten/prettify |
| Zod 공식 — Zod Mini | https://zod.dev/packages/mini | ⭐⭐⭐ High | 2026-09-25 | 사용 권장 조건 |
| Zod 공식 — Versioning | https://zod.dev/v4/versioning | ⭐⭐⭐ High | 2026-09-25 | 서브패스 |
| Zod 공식 블로그 — Zod 4.6 | https://zod.dev/blog/zod-4-6 | ⭐⭐⭐ High | 2026-09-09 | `.validate()` |
| Zod GitHub Releases | https://github.com/colinhacks/zod/releases | ⭐⭐⭐ High | 2026-09-25 | 최신 v4.6.5 |
| Zod PR #5898 | https://github.com/colinhacks/zod/pull/5898 | ⭐⭐⭐ High | 2026-04-29 머지 | `__proto__` 스킵 |
| Zod Issue #2227 | https://github.com/colinhacks/zod/issues/2227 | ⭐⭐⭐ High | — | record `__proto__` 과거 보고 |
| Zod locales 소스 | https://github.com/colinhacks/zod/tree/main/packages/zod/src/v4/locales | ⭐⭐⭐ High | 2026-09-25 | ko.ts 존재 |
| newreleases.io zod 4.4.0 / 4.6.5 | https://newreleases.io/project/github/colinhacks/zod/release/v4.4.0 | ⭐⭐ Medium | 2026-09-25 | 릴리즈 노트 미러 |
| Valibot 공식 — Comparison | https://valibot.dev/guides/comparison/ | ⭐⭐⭐ High | 2026-09-25 | 자체 비교(이해관계자) |
| Standard Schema | https://standardschema.dev/ | ⭐⭐⭐ High | 2026-09-25 | `~standard` 인터페이스 |
| react-hook-form/resolvers | https://github.com/react-hook-form/resolvers | ⭐⭐⭐ High | 2026-09-25 | zodResolver v3/v4 자동 감지 |
| DEV — Migrating to Zod 4 (pockit) | https://dev.to/pockit_tools/migrating-to-zod-4-the-complete-guide-to-breaking-changes-performance-gains-and-new-features-3ll0 | ⭐⭐ Medium | 2026 | 교차 검증용 |
| buildmvpfast — Zod v4 Migration | https://www.buildmvpfast.com/blog/zod-v4-migration-validation-typescript-breaking-changes-2026 | ⭐⭐ Medium | 2026 | 교차 검증용 |

---

## 4. 검증 체크리스트 (Test List)

### 교차 검증 클레임 판정

| # | 클레임 | 소스 | 판정 |
|---|--------|------|------|
| 1 | 최신 안정 버전은 zod 4.6.5 | GitHub releases, newreleases.io, WebSearch | VERIFIED |
| 2 | 패키지 루트 `"zod"`가 Zod 4를 export, `zod/v3`·`zod/mini` 서브패스 제공 | zod.dev/v4/versioning, resolvers 문서 | VERIFIED |
| 3 | `z.string().email()` 등 메서드형 포맷 deprecated → `z.email()` 등 top-level | changelog, DEV/pockit, buildmvpfast | VERIFIED |
| 4 | `.strict()`/`.passthrough()` deprecated → `z.strictObject`/`z.looseObject` | changelog, api, DEV 마이그레이션 글 | VERIFIED |
| 5 | `message` deprecated, `invalid_type_error`/`required_error` 제거 → `error` 통합 | changelog, error-customization, 교차 검색 | VERIFIED |
| 6 | `.format()`/`.flatten()` deprecated → `z.treeifyError`; `z.flattenError`·`z.prettifyError` 제공 | changelog, error-formatting, react-doctor 규칙 | VERIFIED |
| 7 | `.default()` 출력 타입·short-circuit, 구 동작은 `.prefault()` | changelog, api, 교차 검색 | VERIFIED |
| 8 | `z.stringbool()` 기본 truthy/falsy 목록, 대소문자 무시 | api, 교차 검색 | VERIFIED |
| 9 | `z.config(z.locales.ko())` 한국어 로케일 존재 | error-customization, GitHub locales/ko.ts | VERIFIED |
| 10 | 에러 우선순위: 체크 → 스키마 → 파싱 시점 → 전역 → 로케일 | error-customization (공식 단일, 1순위) | VERIFIED |
| 11 | zod 4.4.0에서 catchall 경로 `__proto__` 스킵 (PR #5898) | newreleases v4.4.0, PR #5898 | VERIFIED |
| 12 | `.validate()`는 4.6.0 신규, 첫 이슈 short-circuit, 입력 타입 guard | zod blog 4.6, basics, WebSearch | VERIFIED |
| 13 | 4.4.0 `__proto__` 수정이 `z.record` 경로까지 포괄 | PR 요약은 record 언급, 코드 변경은 `handleCatchall` 한정, issue #2227 상태 불명확 | UNVERIFIED → SKILL.md에 `> 주의: 미검증` + 키 스키마 제한 방어 패턴 제시 |
| 14 | 교차 검증 소스 일부의 "deprecated API 사용 시 경고 로그 출력" 주장 | 공식 문서에는 해당 서술 없음 (JSDoc deprecated) | DISPUTED → SKILL.md에서는 "deprecated (동작은 함)"로만 기술, 경고 로그 주장 배제 |
| — | Valibot 최신 1.5.0 (2026-09) | 다수 dependabot PR, WebSearch | VERIFIED (보조 클레임) |
| — | `zodResolver`가 Zod 3.25+/4 자동 감지 | resolvers 문서, DeepWiki | VERIFIED (보조 클레임) |

### 3-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (zod 4.6.5, 4.4.0+, 4.6.0+, valibot 1.5.0)
- [✅] deprecated된 패턴을 권장하지 않음 (Zod 3 형식은 변경점 표·실수 표에만)
- [✅] 코드 예시가 실행 가능한 형태임

### 3-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (섹션 1)
- [✅] 흔한 실수 패턴 포함 (섹션 14)

### 3-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (프레임워크 무관 `Request`/`Response` 예시)

### 3-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-09-25)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-09-25)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — 잘못된 응답 없음, 보완 불필요 (2026-09-25)

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-25
**수행자**: skill-tester → general-purpose (TypeScript 백엔드 개발자 역할, domain-specific 에이전트 미등록으로 대체 사용)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Express 핸들러에서 요청 body 검증 — 미정의 필드 거부 + 422 + 필드별 에러**
- ✅ PASS
- 근거: SKILL.md 섹션 4-1(body 예시), 섹션 10-2·14(strictObject로 오염 필드 차단), 섹션 9(z.flattenError)
- 상세: `z.strictObject` + `safeParse` + `z.flattenError(result.error).fieldErrors`로 정확히 답변. fetch 기반 예시를 Express로 옮기며 한계(Hono 전용 참조 스킬이 Express 미들웨어를 다루지 않음)를 스스로 명시.

**Q2. query string 불리언(`includeDeleted=false`) 파싱 — `z.coerce.boolean()` 함정**
- ✅ PASS
- 근거: SKILL.md 섹션 4-2 141줄(`Boolean("false") === true` 함정), 섹션 14 흔한 실수 표
- 상세: 함정 원인과 `z.stringbool()` 해법, truthy/falsy 기본값까지 정확히 인용. `z.stringbool()` 도입 버전이 SKILL.md에 명시되지 않았다는 gap을 스스로 지적.

**Q3. `z.record(...)`의 `__proto__` 프로토타입 오염 방어 — 판단형**
- ✅ PASS
- 근거: SKILL.md 섹션 10-2 318~321줄(`> 주의: 미검증` 표기)
- 상세: `z.record`가 4.4.0 수정 대상(`looseObject`/`.passthrough()`/`.catchall()`)에 포함되지 않는다는 점을 근거로 "record 단독으로 안전을 단정할 수 없다"고 정확히 답변. SKILL.md가 자체 표기한 UNVERIFIED를 과신하지 않고 그대로 전달 — anti-pattern(과잉 확신) 회피 확인. `SafeKey.refine` 방어 패턴도 정확히 제시.

### 발견된 gap (있으면)

- `z.stringbool()` 도입 버전이 SKILL.md에 명시되어 있지 않음 (기준 버전 4.6.5에서 사용 가능하다는 것만 확인 가능) — 경미, 차단 요인 아님
- 422 vs 400 상태 코드 선택 근거에 대한 별도 설명 텍스트 부재 (코드 예시에만 422 사용) — 경미, 차단 요인 아님

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리 사용법 스킬 — 실사용 필수 카테고리 아님, content test PASS로 APPROVED 가능
- 최종 상태: APPROVED

---

### (참고) 테스트 케이스 템플릿 — 실행 완료로 아래는 참고용 보존

### 테스트 케이스 1: (skill-tester 실행 대기)

**입력 (질문/요청):**
```
(미실시)
```

**기대 결과:**
```
(미실시)
```

**실제 결과:**
```
(미실시)
```

**판정:** 미실시

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (3/3 PASS, 2026-09-25) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 2단계 content test 수행 (2026-09-25 완료, general-purpose 3/3 PASS — domain-specific 에이전트 미등록으로 general-purpose 대체 사용)
- [❌] `z.record`의 `__proto__` 키 처리 — 현행 소스(`$ZodRecord` 파싱 경로)로 실측 확인 후 섹션 10-2 주의 문구 갱신 — 선택 보강(차단 요인 아님, Q3 테스트에서 SKILL.md가 이미 미검증으로 정직하게 표기하고 있어 오답 유발 없음 확인됨)
- [✅] `backend/hono-api-patterns` 스킬 생성 완료 후 상호 링크 경로 유효성 확인 — 2026-09-25 hono-api-patterns 생성·레포 반영 완료
- [✅] `frontend/form-handling`의 Zod 3 스타일 예시를 Zod 4 형식으로 갱신 — 2026-09-25 form-handling 현행화 완료, 본 스킬 SKILL.md 상단 주의 문구도 함께 정정

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-09-25 | v1 | 최초 작성 (zod 4.6.5 기준) | skill-creator |
| 2026-09-25 | v1 | 2단계 실사용 테스트 수행 (Q1 body strictObject+422 / Q2 query boolean 함정 / Q3 z.record `__proto__` 판단형) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
