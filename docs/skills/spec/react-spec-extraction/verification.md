---
skill: react-spec-extraction
category: spec
version: v1
date: 2026-10-08
status: APPROVED
---

# react-spec-extraction 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `react-spec-extraction` |
| 스킬 경로 | `.claude/skills/react-spec-extraction/SKILL.md` |
| 검증일 | 2026-10-08 |
| 검증자 | Claude (skill-creator 절차 직접 수행) |
| 스킬 버전 | v1 |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (reactrouter.com, nextjs.org, zod.dev, react-hook-form.com, tanstack.com, ts-morph.com)
- [✅] 공식 GitHub 2순위 소스 확인 (colinhacks/zod 문서 원문 MDX, facebookexperimental/Recoil·dsherret/ts-morph 저장소 상태 API, zod-to-json-schema README)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-10-08, npm 레지스트리 직접 조회)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (라우트·API·폼·이벤트·권한·전역 상태 추출 절차)
- [✅] 코드 예시 작성 (ts-morph 스크립트 5종 + Node 파일 스캔 스크립트 1종 — 가상 fixture에서 실행 검증)
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | Read | spec-extraction-method SKILL.md·references/spec-templates.md, 기존 스킬 nextjs·form-handling·zod-schema-validation·tanstack-query·frontend-domain-structure·state-management 목차 | 양식·규약 정본 확인, 중복 회피 경계 설정 |
| 조사 | WebFetch | reactrouter.com data/declarative/framework routing, nextjs.org project-structure·pages-and-layouts·api-routes·proxy, zod.dev/json-schema, react-hook-form register·Controller, tanstack query-keys·migrating-to-v5, ts-morph setup·navigation | 공식 문서 12페이지 확인 |
| 조사 | WebSearch | zod 4 toJSONSchema 릴리스, React Router v8 변경점, Next.js app/pages 충돌 에러, Recoil archived | 독립 2차 소스 확보 |
| 교차 검증 | Bash (npm view, curl GitHub raw/API) | 패키지 최신 버전 11종, zod 문서 원문 MDX, Recoil·ts-morph 저장소 상태, zod-to-json-schema README | 버전·도입 버전·저장소 상태 확정 |
| 실측 | Bash (scratchpad에 zod 4.6.5·ts-morph 28.0.0·react-router 8.4.0 등 설치) | z.toJSONSchema 출력, 가상 React/Next fixture에 SKILL.md 스크립트 추출 실행, 라이브러리 타입 정의 grep | 스크립트 6종 전부 기대 출력, refine·메시지 누락 실측 |
| 교차 검증 결과 | — | 25개 클레임 | VERIFIED 21 / DISPUTED 1 / UNVERIFIED 3 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| React Router — Data mode Routing | https://reactrouter.com/start/data/routing | ⭐⭐⭐ High | 2026-10-08 열람 (8.4.0) | 공식 문서 |
| React Router — Declarative Routing | https://reactrouter.com/start/declarative/routing | ⭐⭐⭐ High | 2026-10-08 열람 | 공식 문서 |
| React Router — Framework Routing | https://reactrouter.com/start/framework/routing | ⭐⭐⭐ High | 2026-10-08 열람 | 공식 문서 |
| React Router v8 changelog / 블로그 | https://reactrouter.com/8.0.0/changelog · https://remix.run/blog/react-router-v8 | ⭐⭐⭐ High | 2026-06-17 릴리스 | 검색 결과 요약으로 확인 |
| Next.js Project structure | https://nextjs.org/docs/app/getting-started/project-structure | ⭐⭐⭐ High | 16.4.0, 2026-07-21 갱신 | 공식 문서 |
| Next.js Pages and Layouts | https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts | ⭐⭐⭐ High | 16.4.0 | 공식 문서 |
| Next.js API Routes (Pages) | https://nextjs.org/docs/pages/building-your-application/routing/api-routes | ⭐⭐⭐ High | 2026-09-28 갱신 | 공식 문서 |
| Next.js proxy.js | https://nextjs.org/docs/app/api-reference/file-conventions/proxy | ⭐⭐⭐ High | 2026-09-04 갱신 | 공식 문서 (v16.0.0 개명) |
| Next.js app/pages 충돌 에러 | github.com/vercel/next.js PR #41656 및 e2e 테스트 `conflicting-app-page-error` | ⭐⭐ Medium | — | 검색 결과 |
| ts-morph Setup / Navigation | https://ts-morph.com/setup/ · https://ts-morph.com/navigation/ | ⭐⭐⭐ High | 28.0.0 (npm) | 공식 문서, GitHub 6.2k stars, 2026-09-29 push |
| Zod JSON Schema | https://zod.dev/json-schema + github.com/colinhacks/zod `packages/docs/content/json-schema.mdx` | ⭐⭐⭐ High | zod 4.6.5 | 공식 문서 원문 |
| zod-to-json-schema README | https://github.com/StefanTerdell/zod-to-json-schema | ⭐⭐ Medium | 3.25.2 | 유지보수 중단 공지(2025-11) |
| React Hook Form register / Controller | https://react-hook-form.com/docs/useform/register · .../usecontroller/controller | ⭐⭐⭐ High | 7.89.0 (npm) | 공식 문서 |
| TanStack Query Query Keys / Migrating to v5 | https://tanstack.com/query/latest/docs/framework/react/guides/query-keys · .../migrating-to-v5 | ⭐⭐⭐ High | 5.104.1 (npm) | 공식 문서 |
| Recoil 저장소 상태 | https://github.com/facebookexperimental/Recoil (GitHub API `archived: true`) | ⭐⭐⭐ High | 마지막 push 2025-01-01 | npm 0.7.7 |
| npm 레지스트리 | `npm view <pkg> version` | ⭐⭐⭐ High | 2026-10-08 | 버전 기준 |

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 클레임별 교차 검증 결과

| # | 클레임 | 소스 | 판정 |
|---|--------|------|------|
| C1 | Data mode route 객체 필드: path·Component/element·children·index·loader·action·lazy, path 없는 route = 레이아웃 | RR 공식 문서 + react-router 8.4.0 타입 정의(lazy·middleware 등 확인) | VERIFIED |
| C2 | Declarative `<Routes>/<Route path element>`, index·레이아웃·`:id`·`:lang?`·`files/*` | RR 공식 문서 + fixture 실행 | VERIFIED |
| C3 | Framework mode `app/routes.ts`의 route/index/layout/prefix, `@react-router/fs-routes` flatRoutes | RR 공식 문서 + v8 업그레이드 자료 | VERIFIED |
| C4 | fs-routes 파일명 규칙 세부 | 문서 본문 미확인 | UNVERIFIED → 주의 표기, 추정 처리 지시 |
| C5 | react-router 8.4.0·react-router-dom 7.18.4 최신, v8 2026-06-17 릴리스 | npm 레지스트리 + 공식 문서 버전 표기 + remix 블로그/InfoQ 검색 | VERIFIED |
| C6 | v8 라우트 middleware 기본 활성·API 시그니처 | 검색 요약 + 타입 정의에 `middleware` 프로퍼티 존재. 시그니처 미검증 | UNVERIFIED(시그니처) → 주의 표기 |
| C7 | App Router 라우팅 파일 목록(layout·page·loading·not-found·error·global-error·route·template·default) | Next.js 16.4 Project structure + 개별 파일 규칙 링크 | VERIFIED |
| C8 | (group)·_private·[slug]/[...slug]/[[...slug]]·@slot·(.)/(..)/(..)(..)/(...) | Project structure 문서 + fixture 스크립트 실행 | VERIFIED |
| C9 | page/route 파일 없으면 공개 안 됨(colocation) | Project structure 문서(2곳 서술) | VERIFIED |
| C10 | app·pages 동일 라우트 → 빌드 에러 "Conflicting app and page files" | Next.js e2e 테스트·PR 검색 2건 | VERIFIED |
| C11 | Pages Router index·중첩·동적·_app, `pages/api/*` → `/api/*` | Pages and Layouts + API Routes 공식 문서 | VERIFIED |
| C12 | v16.0.0 middleware→proxy 개명·deprecated, matcher 상수(정적 분석), Server Function은 별도 라우트 아님 | proxy.js 공식 문서(Version history·Good to know) + nextjs 스킬의 proxy 기술과 일치 | VERIFIED |
| C13 | `new Project({ tsConfigFilePath })` 자동 파일 추가, `skipAddingFilesFromTsConfig` | ts-morph Setup 문서 + 실행 | VERIFIED |
| C14 | 스크립트에 쓴 ts-morph API(getDescendantsOfKind·findReferencesAsNodes·getType·Node.is* 등) 동작 | ts-morph 28.0.0 실제 실행(6종) + Navigation 문서 | VERIFIED |
| C15 | `z.toJSONSchema` 도입 버전 | WebFetch 요약은 "3.20"/"3.23" → 원문 MDX "Introduced in `zod@4.0`" + `zod/v3`에 함수 없음 실측 + 2차 자료(LogRocket·InfoQ 등 "Zod 4 introduces") | DISPUTED → 4.0으로 정정, 주의 표기 |
| C16 | 옵션 target(기본 draft-2020-12)·io(기본 output)·unrepresentable(기본 throw/any/함수), 표현 불가 타입 | 원문 MDX + 실측 | VERIFIED |
| C17 | 검증 메시지는 JSON Schema에 안 들어가고 `.refine`은 흔적 없이 사라짐, optional은 required에서 빠짐 | zod 4.6.5 실측(문서는 해당 동작 명시 없음 — unrepresentable 목록에 refine 없음과 일치) | VERIFIED(실측) |
| C18 | zod-to-json-schema 2025-11 유지보수 중단 공지 | README 원문 + npm 3.25.2 | VERIFIED |
| C19 | v3 스키마를 v4 toJSONSchema에 넘기면 동작 안 함 | 미실측 | UNVERIFIED → 주의 표기(실행해 판정 지시) |
| C20 | register 검증 옵션·메시지 형식(문자열 또는 {value,message}) | RHF register 문서 + fixture 실행 | VERIFIED |
| C21 | Controller `rules`는 register 옵션과 같은 형식 | RHF Controller 문서 + fixture 실행 | VERIFIED |
| C22 | TanStack Query v5는 객체 시그니처만 지원 | Migrating to v5 문서 + Query Keys 문서 예시 | VERIFIED |
| C23 | queryKey는 최상위 배열, 쿼리 함수 의존성 역할 | Query Keys 문서 + tanstack-query 스킬 | VERIFIED |
| C24 | Recoil 저장소 archived, npm 최신 0.7.7 | GitHub API + npm | VERIFIED |
| C25 | zustand `create` export, RTK createSlice(name·initialState·reducers), Recoil atom/selector `key` 필수 | 설치한 패키지 타입 정의 grep + state-management 스킬 | VERIFIED |

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (react-router 8.4.0, next 16.4.0, zod 4.6.5, ts-morph 28.0.0 등)
- [✅] deprecated된 패턴을 권장하지 않음 (middleware→proxy 병기, Recoil archived 명시, zod-to-json-schema 중단 공지 명시)
- [✅] 코드 예시가 실행 가능한 형태임 (스크립트 6종 fixture 실행 확인)

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
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X — 예시는 전부 가상 fixture)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-10-08, 3문항)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (3/3 PASS)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (잘못된 응답 없음 — 보강 후보만 섹션 5 기록, 선택 사항)

---

## 5. 테스트 진행 기록

**수행일**: 2026-10-08
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 대신 general-purpose 사용)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. Next.js 레거시 파일 트리(그룹·_private·인터셉트·병렬 슬롯·loading·route·pages/api·_app)에서 화면 목록/API 목록 산출**
- ✅ PASS
- 근거: SKILL.md "2-1. Next.js 파일 기반 라우트" 규칙표·스크립트, "10. 흔한 실수"
- 상세: 화면 3개(/cart, /photo/[id], /legacy)·API 2개(/api/health, /api/ping) 정확. 인터셉트는 별도 화면 아님, `_components`·`loading`·`_app` 제외, 폴더 수 ≠ 화면 수 설명, proxy/middleware·rewrites 별도 읽기 지시까지 근거와 일치. anti-pattern(인터셉트를 별도 화면 등록, route를 화면에 혼합) 회피.

**Q2. RHF+zod 폼에서 `z.toJSONSchema`로 검증 명세 만들기 (min 메시지·refine·z.date·zod 3.22)**
- ✅ PASS
- 근거: SKILL.md "4-2. zod 스키마 → JSON Schema" 함정 표, "10. 흔한 실수"
- 상세: `io: "input"` 실행, z.date()는 기본 throw(`unrepresentable` 옵션), 메시지·refine 누락 → AST 보완, zod 3엔 함수 없음(4.0 도입)·zod-to-json-schema 대안(유지보수 중단 명시)까지 정확. 에이전트가 추론한 부분(3.22 변환기 동작)은 추론이라고 스스로 구분 표기.

**Q3. CRA 레거시에서 rg `.get(` 한계, API 인벤토리, 0건 시 의심, 동적 URL·queryKey 기록, 화면 역추적**
- ✅ PASS
- 근거: SKILL.md "3-1~3-4", "10. 흔한 실수"
- 상세: ts-morph 타입 판별, node_modules 미설치 시 any→0건, `{url}`+추정, queryKey는 캐시 식별자(비고만), HAR/E2E로 확인됨 승격, trace-callers 반복으로 라우트 컴포넌트까지 역추적 모두 근거와 일치. anti-pattern(동적 URL 지어내기, queryKey를 URL로 기록) 회피.

### 발견된 gap (선택 보강, SKILL.md 수정은 이번 범위 아님)

- §2-1: 스크립트가 인터셉트 라우트를 원 라우트와 별도 행으로 출력하는데 "합쳐서 1화면"으로 후처리하라는 안내가 없음
- §3-2: JS 전용 CRA(tsconfig 없음, `allowJs`/jsconfig) 대응과 0건 시 의심 항목이 node_modules 외에 부족(tsconfig include, 래퍼 타입 문자열 불일치)
- §4-2: zod 스키마의 refine·메시지를 뽑는 AST 스크립트는 없음(문장 지시만)

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 — 사용 결과가 "답변 정확성"으로 검증되는 방법론·라이브러리 사용 스킬이며, 스크립트 6종은 작성 시 가상 fixture에서 이미 실행 검증됨(섹션 2). 빌드 산출물·마이그레이션 변환 결과로만 검증되는 유형이 아니므로 content test PASS = APPROVED
- 최종 상태: APPROVED

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (DISPUTED 1건 정정, UNVERIFIED 3건 주의 표기) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-10-08, 3/3 PASS) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-10-08 완료, 3/3 PASS → APPROVED)
- [❌] React Router fs-routes(flatRoutes) 파일명 규칙을 공식 문서(how-to/file-route-conventions)로 확인 후 §2-3에 매핑표 추가 — 선택 보강(차단 요인 아님, SKILL.md에 UNVERIFIED·추정 처리 지시 있음)
- [❌] React Router v8 라우트 `middleware` 시그니처 확인 후 §6 권한 가드 추출 규칙 구체화 — 선택 보강(차단 요인 아님, 주의 표기 있음)
- [❌] zod 3 스키마를 zod 4 `toJSONSchema`에 넘겼을 때 동작 실측(과도기 레포 대응) — 선택 보강(차단 요인 아님)
- [❌] 실제 규모의 React 레포(수백 화면)에서 스크립트 성능·누락률 측정 — 현재는 가상 fixture로만 실행 검증. 선택 보강(실사용 후 갱신)
- [❌] content test에서 나온 gap 반영: 인터셉트 행 병합 후처리 안내(§2-1), JS 전용 CRA(allowJs)·0건 의심 항목 확장(§3-2), zod refine/메시지 AST 스크립트(§4-2) — 선택 보강(차단 요인 아님)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-10-08 | v1 | 최초 작성 (조사·교차 검증·스크립트 실행 검증) | Claude |
| 2026-10-08 | v1 | 2단계 실사용 테스트 수행 (Q1 Next.js 화면/API 목록 산출 / Q2 zod toJSONSchema 한계·zod 3 대응 / Q3 CRA API 인벤토리·동적 URL·역추적) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-10-08 | v1.1 | 설치 검수 반영 — spec-extraction 템플릿 단독 설치본에 없는 스킬(`form-handling`·`zod-schema-validation`·`tanstack-query`·`state-management`·`recoil-to-zustand-migration`·`frontend-domain-structure`) 참조에 "(설치된 경우)" 조건 표기(담당 표 머리글·전역 상태 절 2곳). 내용 클레임 변경 없음 | Claude |
