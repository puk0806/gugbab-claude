---
skill: bundling-compiler
category: frontend
version: v9
date: 2026-09-26
status: APPROVED
---

# bundling-compiler 스킬 검증 문서

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
| 스킬 이름 | bundling-compiler |
| 스킬 경로 | `.claude/skills/bundling-compiler/SKILL.md` |
| 최초 작성일 | 2026-03-27 |
| 검증일 | 2026-09-26 (최초 2026-03-27, 직전 재검증 2026-06-20) |
| 재검증일 | 2026-06-20 |
| 검증 방법 | frontend-architect 활용 테스트 |
| 버전 기준 | Vite 8.0.16, Next.js 16.2.9, React Compiler 1.x |

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
| 활용 테스트 | frontend-architect | Vite 설정, Next.js 빌드, React Compiler, 번들 분석, 환경변수, Tree shaking 6개 | 3/6 PASS → SKILL.md 수정 후 APPROVED |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Next.js reactCompiler 설정 | https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler | ⭐⭐⭐ High |
| @vitejs/plugin-react v6 릴리즈 | https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-react@6.0.0 | ⭐⭐⭐ High |
| MDN — Array.prototype.toSorted() | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted | ⭐⭐⭐ High (2026-09-26 추가, ES2023·Baseline 2023-07~) |
| Node.js ES2023 지원 이슈(tsconfig/bases #217) | https://github.com/tsconfig/bases/issues/217 | ⭐⭐ Medium (2026-09-26 추가, Node 20+에서 toSorted 지원 교차 확인) |

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
- [✅] 버전 명시 (Vite 5-8, Next.js 15/16)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 수정 후 APPROVED)
- [✅] 2026-09-26 `performance` 스킬 병합 반영분 포함 재테스트 (frontend-architect, 3/3 PASS)
- [✅] 2026-09-26 `items.sort` → `[...items].sort`/`toSorted` 정정 반영 후 재테스트 (frontend-architect, 3/3 PASS — 정정된 부분 겨냥 질문 포함)
- [✅] 2026-09-26 tsup `outExtension`↔dts 확장자 불일치 정정(exports를 import/require 조건별 types+default 분리) 반영 후 재테스트 (general-purpose 대체 사용, 2/2 PASS — Q1 tsup dual 패키지 exports 설정, Q2 정정된 부분을 직접 겨냥한 함정 질문)

---

## 5. 테스트 진행 기록

### [2026-09-28] 선택 보강 반영

- 반영 내용: "package.json exports 설정" 코드 예시 바로 앞에 "아래 exports 예시는 이 불일치를 그대로 반영한 결과다 — `.d.ts` 하나로 겸용하지 않고 `import`는 `.d.mts`, `require`는 `.d.ts`로 조건별 분리했다"는 연결 문장 추가
- 근거: 기존 "주의" 문단(tsup 8.5.1 실측, egoist/tsup#939)과 코드 예시 자체의 재설명 — 새 사실 추가 없는 **내부 명확화** (creation-workflow.md "문서 내부 명확화는 소스 확인 불필요" 적용)
- status 영향: 없음 — 순수 서술 연결 문장이며 사실·코드 변경이 아니므로 APPROVED 유지

**수행일**: 2026-09-26
**수행자**: skill-tester → general-purpose (frontend-architect 세션 registry 부재로 대체 사용)
**수행 방법**: tsup `outExtension`↔dts 확장자 불일치 실측 정정(exports를 import/require 조건별 `types`+`default` 분리)이 SKILL.md에 반영된 뒤 재테스트. Read 후 실전 질문 2개 답변(Q1 tsup dual 패키지 exports 설정, Q2는 정정된 부분을 직접 겨냥한 흔한 함정 시나리오), 근거 섹션 및 anti-pattern 회피 확인. 에이전트에게 Read 도구만 허용하고 WebSearch·WebFetch·자기 지식 사용을 금지해 SKILL.md 근거만으로 답하도록 제한.

### 실제 수행 테스트 (v9 — tsup exports 정정 재테스트)

**Q1. 핵심 기능 — npm 배포용 TS 라이브러리 tsup ESM+CJS+dts 빌드와 package.json dual-package exports**
- ✅ PASS
- 근거: SKILL.md "tsup (라이브러리 빌드)" 기본 설정·다중 Entry 패턴·"package.json exports 설정"의 "주의 (2026-09-26 실측, tsup 8.5.1)" 문단과 코드 예시(L34~103)
- 상세: tsup.config.ts(단일/다중 entry)와 exports를 정확히 작성했고, `outExtension`의 `js` 오버라이드가 dts 확장자에는 전파되지 않는다는 정정된 주의 문단을 정확히 인용해 `import`→`.d.mts`/`require`→`.d.ts` 분리 이유를 설명. `types` 키를 `default`보다 먼저 선언해야 하는 순서 규칙까지 근거로 답변.

**Q2. (정정된 부분 직접 겨냥) outExtension으로 js를 강제하면 dts도 따라간다고 착각해 exports에 `.d.cts`를 쓴 흔한 함정 시나리오**
- ✅ PASS
- 근거: SKILL.md "package.json exports 설정"의 "주의 (2026-09-26 실측, tsup 8.5.1)" 문단, egoist/tsup#939 인용
- 상세: `outExtension`이 dts에 전파되지 않는 tsup 자체 미해결 제약이 근본 원인이며, 실제 산출물은 `index.d.cts`가 아니라 `index.d.ts`이므로 `require.types`를 `./dist/index.d.cts` → `./dist/index.d.ts`로 고쳐야 한다고 정확히 답변. anti-pattern(잘못된 `.d.cts` 가정)을 명시적으로 지적하고 올바른 exports 코드로 교정.

### 발견된 gap (v9)

- exports 예시 코드(L74~103)가 이미 정정된 결과물임을 보여주지만, 바로 위 "주의" 문단과의 연결이 암시적 — "이 예시가 위 주의사항을 반영한 결과"라는 한 문장 추가 권장(선택 보강, 차단 요인 아님)
- `"type": "module"` 프로젝트(반대 케이스: ESM `.d.ts`/CJS `.d.cts`)의 별도 exports 예제 코드 부재 — 규칙만 주의 문단에 언급, 선택 보강

### 판정 (v9)

- agent content test: 2/2 PASS (general-purpose 대체 사용 — Read 외 도구 사용 금지 지시로 SKILL.md 근거만 사용하도록 제한)
- verification-policy 분류: 라이브러리·패턴 스킬(번들러/컴파일러 사용법) — content test PASS = APPROVED 가능 카테고리
- 최종 상태: PENDING_TEST → **APPROVED** (tsup exports 정정 반영 재테스트 통과)

---

### (참고) v7 테스트 기록 (items.sort 정정 후)

**수행일**: 2026-09-26
**수행자**: skill-tester → frontend-architect
**수행 방법**: 공식 문서 대조로 `items.sort` mutate 결함이 `[...items].sort`/`toSorted`로 SKILL.md에 정정된 뒤 재테스트. Read 후 실전 질문 3개 답변(Q2는 정정된 부분을 직접 겨냥), 근거 섹션 및 anti-pattern 회피 확인. frontend-architect에게 Read 도구만 허용하고 WebSearch·WebFetch·자기 지식 사용을 금지해 SKILL.md 근거만으로 답하도록 제한.

### 실제 수행 테스트

**Q1. 핵심 기능 — npm 배포용 TS 유틸 라이브러리 tsup ESM+CJS+dts 설정**
- ✅ PASS
- 근거: SKILL.md "번들러 선택 기준" 결정 트리, "tsup" 기본 설정·다중 Entry 패턴·package.json exports, "Tree Shaking" 핵심 원칙
- 상세: 결정 트리에서 tsup을 도출하고 `format`/`dts`/`sideEffects: false`까지 정확히 근거로 답변. 기본 설정에 `outExtension`이 없어 exports 예시의 `.mjs`/`.cjs`와 안 맞을 수 있다는 SKILL.md 내부 gap을 스스로 지적하고 다중 Entry 패턴의 `outExtension`으로 보완.

**Q2. (정정된 부분 겨냥) React Compiler + 배열 정렬 — `items.sort()` in-place mutate anti-pattern**
- ✅ PASS
- 근거: SKILL.md "React Compiler 활성화 시 변경되는 것" 코드와 바로 아래 주의 문단, "React Compiler 제약사항", "수동 메모가 필요한 경우" 표
- 상세: `items.sort()`를 그대로 쓰면 안 되는 이유(제자리 변경 → Rules of React 위반 → Compiler 메모이제이션 전제 붕괴)를 정정된 주의 문단 근거로 정확히 답변. 수정안으로 `items.toSorted(...)`(Compiler 자동 처리, Node 20+/2023-07~ 브라우저)와 구형 타깃용 `[...items].sort(...)`(수동 `useMemo`) 양쪽을 모두 정확히 제시.

**Q3. 판단형 — Next.js dev 서버 번들러 선택(Turbopack) + Webpack 플러그인 비호환 이유**
- ✅ PASS
- 근거: SKILL.md "번들러 선택 기준" 트리, "Turbopack" 활성화 방법, "Webpack vs Turbopack" 표, Vanilla Extract 주의 문단
- 상세: Next.js 15(CLI 플래그) vs 16(기본값) 차이와 Rust 기반이라 Webpack 플러그인이 재구현 없이는 호환되지 않는다는 점을 정확히 답변. vanilla-extract의 Turbopack 지원 버전 조건(Next 16+·`unstable_turbopack` 명시 필요)까지 구체 사례로 인용.

### 발견된 gap

- tsup 기본 설정과 package.json exports 확장자 불일치(`outExtension` 부재) — 기존에 이미 식별된 gap과 동일, 선택 보강
- CJS용 타입 선언 파일 처리 방식 미기재 — 선택 보강, 차단 요인 아님
- SKILL.md 상단 "검증일: 2026-06-20"과 "2026-09-26 병합" 표기가 併記되어 최신 검증 기준이 헷갈릴 수 있음 — 선택 보강(frontmatter 정리 권장, 차단 요인 아님)

### 판정

- agent content test: 3/3 PASS (frontend-architect, Read 외 도구 사용 금지)
- verification-policy 분류: 라이브러리·패턴 스킬(번들러/컴파일러 사용법) — content test PASS = APPROVED 가능 카테고리
- 최종 상태: PENDING_TEST → **APPROVED** (정정된 `[...items].sort`/`toSorted` 패턴 재테스트 통과)

---

### (참고) 직전 테스트 기록 (정정 전 — 이슈 발견 시점)

**수행일**: 2026-09-26
**수행자**: skill-tester → frontend-architect
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변(구 `performance` 스킬 병합 반영분을 겨냥한 질문 1개 포함), 근거 섹션 및 anti-pattern 회피 확인. frontend-architect에게 Read 도구만 허용하고 WebSearch·WebFetch·자기 지식 사용을 금지해 SKILL.md 근거만으로 답하도록 제한.

### 실제 수행 테스트

**Q1. npm 배포용 유틸 라이브러리(ESM+CJS+dts) tsup 설정과 package.json exports**
- ✅ PASS
- 근거: SKILL.md "tsup (라이브러리 빌드)" 기본 설정·다중 Entry 패턴·package.json exports 섹션, "Tree Shaking" 섹션
- 상세: 도구 선택(tsup)·설정 코드·package.json exports/sideEffects까지 근거를 정확히 인용해 답변. 다만 "기본 설정" 예시(outExtension 미포함)와 "package.json exports" 예시(.mjs/.cjs 확장자 전제)가 서로 안 맞는 SKILL.md 내부 gap을 스스로 발견해 outExtension을 조합하는 방식으로 보완 답변함.

**Q2. Next.js 15/16 Turbopack 활성화 차이 + React Compiler 설정이 Next 버전이 아닌 번들러(Vite plugin-react 버전)에 따라 갈리는지**
- ✅ PASS
- 근거: SKILL.md "Turbopack (Next.js 내장) > 활성화 방법", "Webpack vs Turbopack" 표, "React Compiler > 활성화" 섹션
- 상세: Next.js 15(CLI 플래그 `--turbopack`) vs 16(기본값) 차이, React Compiler 설정은 Next.js 버전이 아니라 Vite `@vitejs/plugin-react` v5/v6 여부에 따라 갈린다는 점을 정확히 구분해 답변. Next.js 15 프로덕션 Turbopack 여부·16에서 Webpack으로 되돌리는 방법 등 SKILL.md 미기재 gap도 발견.

**Q3. React Compiler 사용 중에도 수동 메모가 필요한 경우 + 리렌더 비용 측정 (병합 반영분 겨냥)**
- ✅ PASS
- 근거: SKILL.md "React Compiler 사용 중에도 수동 메모가 필요한 경우" 표(Rules of React 위반·`useEffect` 의존성 정밀 제어·`'use no memo'`), Profiler `actualDuration`/`baseDuration` 비교 문단
- 상세: 병합으로 옮겨온 3케이스 표와 Profiler 측정 설명을 정확한 근거로 답변. 다만 답변 과정에서 SKILL.md의 기존(병합과 무관한) "React Compiler 활성화 시 변경되는 것" 섹션 예시 `items.sort(...)`가 배열을 제자리 변경(mutate)하여 Rules of React를 예시 스스로 위반할 수 있는 pre-existing 정확성 결함을 발견함.

### 발견된 gap (SKILL.md 보강 권장 — 이번 세션에서 직접 수정하지 않음. 다른 작업자가 frontend 참조 정리 중이라 보고만 하고 verification.md만 반영)

- tsup 기본 설정과 package.json exports 예시의 확장자 불일치(`outExtension` 부재) — 선택 보강, 차단 요인 아님
- CJS 전용 타입 선언·`"type"` 필드 전략·peer dependency external 처리(tsup) 언급 없음 — 선택 보강, 차단 요인 아님
- Next.js 15 프로덕션 Turbopack 지원 여부, 16에서 Webpack으로 되돌리는 방법, `reactCompiler: true` 사용 시 `babel-plugin-react-compiler` 패키지 설치 필요 여부 미기재 — 선택 보강, 차단 요인 아님
- **"React Compiler 활성화 시 변경되는 것" 예시의 `items.sort(...)`가 배열을 제자리 변경(mutate)함 — 정확성 결함.** `[...items].sort(...)`로 교체 권장. 병합 반영분이 아닌 기존 콘텐츠의 결함이며, 우선 수정을 권장하되 이번 APPROVED 전환의 차단 요인으로 처리하지 않음(다른 작업자 작업 종료 후 반영 필요)

### 판정

- agent content test: 3/3 PASS (frontend-architect 대체 사용 — Read 외 도구 사용 금지 지시로 SKILL.md 근거만 사용하도록 제한)
- verification-policy 분류: 라이브러리·패턴 스킬(번들러/컴파일러 사용법) — content test PASS = APPROVED 가능 카테고리
- 최종 상태: APPROVED (`items.sort` mutate 예시는 별도 정확성 이슈로 후속 보강 권장 — 차단 요인 아님)

### 2026-09-26 추가 — `items.sort` mutate 결함 정정

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|----------|----------|------|
| 1 | `items.sort(...)`는 배열을 제자리(in-place) 변경하므로 props/state를 렌더 중 직접 변경하는 Rules of React 위반 예시가 된다 | react.dev Rules of React ("컴포넌트와 훅은 순수해야 한다" — props/state 직접 변경 금지 원칙) | 2026-09-26 skill-tester content test에서 frontend-architect가 독립적으로 발견·보고 | **DISPUTED → 수정 반영**: `[...items].sort(...)`(useMemo 경로) / `items.toSorted(...)`(Compiler 자동 처리 경로)로 교체, mutate가 문제인 이유 1줄 설명 추가 |
| 2 | `Array.prototype.toSorted()`는 ES2023 — Node 20+ / 모던 브라우저 2023-07~에서 사용 가능, 그 이전 타깃은 미지원 | MDN `Array.prototype.toSorted()` ("Baseline: widely available since July 2023") | GitHub `tsconfig/bases` issue #217 ("Node.js 18/19는 일부 ES2023 미지원, toSorted는 Node 20+") | VERIFIED — SKILL.md 예시 주석에 지원 범위 명시 |

요약(추가분): **VERIFIED 1건 / DISPUTED 1건 (수정 반영) / UNVERIFIED 0건**

### 2026-09-26 추가 — tsup outExtension·dts 확장자 불일치 실측 정정

| # | 클레임 | 1차 소스 | 2차 소스 | 판정 |
|---|--------|----------|----------|------|
| 1 | tsup은 `outExtension`으로 `js` 확장자(`.mjs`/`.cjs`)를 강제해도 dts(`.d.ts`/`.d.mts`/`.d.cts`) 확장자는 그 오버라이드를 따르지 않고 package.json `"type"` 필드 기본 규칙만 따른다 (무/`"commonjs"` → ESM `.d.mts`·CJS `.d.ts`, `"module"` → ESM `.d.ts`·CJS `.d.cts`) | 임시 디렉토리에서 `tsup@8.5.1`(+ `typescript@5.7.3`) 실제 빌드 4회 실측(무 type field·"commonjs"·"module" 3가지 + outExtension으로 js만 강제한 경우) — 매번 dts 확장자가 js 오버라이드와 무관하게 package.json type 규칙대로만 나옴 | GitHub `egoist/tsup` Issue #939("Option to specify outExtension for generated dts files?", 미해결) — `outExtension`에 `dts` 속성을 반환해도 적용되지 않는다는 동일 증상 보고 | **VERIFIED**: SKILL.md "package.json exports 설정" 예시가 이 불일치를 반영하지 않고 `.d.ts` 하나로 import/require를 겸용시켜 실제 tsup 산출물과 어긋남 → exports를 `import`/`require` 조건별 `types`+`default` 분리로 수정 반영 |

요약(추가분 2): **VERIFIED 1건 (SKILL.md 예시 정정 반영) / DISPUTED 0건 / UNVERIFIED 0건**
버전 기준: tsup 8.5.1, typescript 5.7.3 (실측 환경)

---

### (참고) 이전 테스트 기록

### 테스트 케이스 1: frontend-architect 에이전트 활용 테스트

**테스트 방법:** frontend-architect 에이전트에게 bundling-compiler 관련 설계 질문 및 코드 리뷰 요청

**발견 및 수정 사항:**
- reactCompiler 위치 오류: `experimental.reactCompiler` → Next.js 15+ top-level `reactCompiler: true` 수정 완료
- Vite React Compiler 버전 구분 누락: @vitejs/plugin-react v5 (babel 옵션) vs v6 (@rolldown/plugin-babel) 분기 추가 완료
- turbopack 설정 오류: `experimental: { turbopack: true }` → CLI 플래그 + top-level 커스터마이징 객체로 수정 완료

**판정:** ✅ PASS

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (frontend-architect, 2026-09-26 재테스트 3/3 — 병합 반영분 포함) + ✅ 3/3 PASS (2026-09-26 `[...items].sort`/`toSorted` 정정 반영 후 재테스트) + ✅ 2/2 PASS (2026-09-26 tsup `outExtension`↔dts exports 정정 반영 후 재테스트, general-purpose 대체 사용) |
| **최종 판정** | **APPROVED** (2026-09-26 tsup `outExtension`↔dts 확장자 불일치 실측 정정분 재테스트 2/2 PASS) |

---

## 7. 개선 필요 사항

- ✅ (2026-09-26 완료, 3/3 PASS) skill-tester가 병합 반영분 포함 content test 수행하고 섹션 5·6 업데이트
- ✅ (2026-09-26 완료, 2/2 PASS) tsup 기본 설정 ↔ package.json exports 예시 확장자 불일치를 `tsup@8.5.1` 실측으로 확정: `outExtension`의 `js` 오버라이드는 dts 확장자에 전파되지 않음(package.json `"type"` 규칙만 따름, egoist/tsup#939로 교차 확인) → exports를 `import`/`require` 조건별 `types` 분리로 수정, 근거 주의문 추가. skill-tester가 재테스트 수행하고 섹션 5·6 업데이트 → APPROVED 전환
- ❌ (선택 보강, 차단 요인 아님) Next.js 15 프로덕션 Turbopack 지원 여부·16 Webpack 롤백 방법·`babel-plugin-react-compiler` 설치 안내 보강
- ✅ (2026-09-26 완료) "React Compiler 활성화 시 변경되는 것" 예시의 `items.sort(...)` mutate 결함 정정 — `[...items].sort(...)`(useMemo 경로) / `items.toSorted(...)`(Node 20+·2023-07~ 브라우저, Compiler 자동 처리 경로)로 교체, mutate가 Rules of React 위반인 이유 1줄 추가. (2026-09-26 재테스트 완료, 3/3 PASS → APPROVED 전환)
- ✅ (2026-09-26 완료) frontmatter/헤더의 "검증일: 2026-06-20"과 "2026-09-26 병합" 併記 정리 — SKILL.md `> 검증일:`을 실제 마지막 검증일(2026-09-26)로 단일화, 병합 이력은 본 verification.md 8절에만 기록
- ✅ (2026-09-28 반영) "package.json exports 설정" 예시 코드가 바로 위 "주의" 문단을 반영한 결과임을 명시하는 연결 문장 추가 (2026-09-26 v9 재테스트에서 general-purpose가 암시적이라고 지적)
- ❌ (선택 보강, 차단 요인 아님) `"type": "module"` 프로젝트의 반대 케이스(ESM `.d.ts`/CJS `.d.cts`) exports 예제 코드 추가 — 현재는 주의 문단에 규칙만 서술, 별도 코드 예시 없음

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-03-27 | v1 | 최초 작성 및 frontend-architect 활용 테스트 완료 | frontend-architect 에이전트 |
| 2026-04-17 | v2 | verification.md 신규 8섹션 포맷으로 마이그레이션 | 메인 대화 오케스트레이션 |
| 2026-06-20 | v3 | Turbopack 프로덕션 빌드 안정화 반영 (SKILL.md 수정) — Vite 최신 8.0.16, Next.js 16.2.9 확인 | 버전 재검증 |
| 2026-09-26 | v4 | **병합**: 구 `frontend/performance` 스킬 제거(스킬 트리아지 MERGE 판정)하면서 고유분만 "React Compiler 사용 중에도 수동 메모가 필요한 경우" 소절로 이관 — 수동 메모 필요 3케이스 표(Rules of React 위반·useEffect 의존성 안정화·`'use no memo'`), "Compiler는 메모이제이션만 담당" 원칙, Profiler `actualDuration`/`baseDuration` 비교. lazy·next/dynamic·TanStack Virtual·next/image 절은 본 스킬 코드 스플리팅 절·core-web-vitals·image-optimization-seo·chat-ui-pattern(가상화 비교표)과 중복이라 이관하지 않음. 출처: https://react.dev/learn/react-compiler , https://react.dev/reference/react/Profiler (구 performance verification.md, 검증일 2026-04-01, APPROVED). status APPROVED → PENDING_TEST | 메인 대화 (스킬 정리) |
| 2026-09-26 | v5 | 2단계 실사용 테스트 재수행 (Q1 tsup ESM/CJS 라이브러리 설정 / Q2 Next.js 15·16 Turbopack+React Compiler 번들러별 분기 / Q3 병합 반영분 — React Compiler 사용 중 수동 메모 필요 케이스+Profiler 측정) → 3/3 PASS, PENDING_TEST → APPROVED 전환. 부수적으로 기존(병합과 무관) 예시 `items.sort` mutate 정확성 이슈 발견 — SKILL.md는 수정하지 않고 보고만 함(다른 작업자 frontend 참조 정리 중) | skill-tester |
| 2026-09-26 | v6 | Q3에서 발견된 `items.sort` mutate 결함 정정: MDN `toSorted()` + Node ES2023 지원 이슈 교차 검증 후 SKILL.md "React Compiler 활성화 시 변경되는 것" 예시를 `[...items].sort(...)`/`items.toSorted(...)`(Node 20+·2023-07~ 지원 명시)로 교체, mutate가 Rules of React 위반인 이유 설명 추가. status APPROVED → PENDING_TEST (재테스트 필요) | 메인 대화 (정정 작업) |
| 2026-09-26 | v7 | 2단계 실사용 테스트 재수행 (Q1 tsup ESM/CJS 라이브러리 설정 / Q2 정정된 `items.sort` → `[...items].sort`/`toSorted` 겨냥 / Q3 Next.js Turbopack 선택+Webpack 플러그인 비호환 이유) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-26 | v8 | tsup `outExtension`↔dts 확장자 불일치를 임시 디렉토리에서 `tsup@8.5.1`+`typescript@5.7.3` 실제 빌드 4회로 실측(무 type field·`"commonjs"`·`"module"`·outExtension 조합) 후 GitHub `egoist/tsup#939`로 교차 확인: `outExtension`의 `js` 오버라이드는 dts 확장자에 전파되지 않고 package.json `"type"` 기본 규칙만 따름. SKILL.md "package.json exports 설정" 예시를 `import`/`require` 조건별 `types`+`default` 분리로 정정하고 실측 근거 주의문 추가, 상단 "검증일" 併記(2026-06-20/2026-09-26 병합)를 2026-09-26 단일 표기로 정리(병합 이력은 본 문서 8절에 보존). status APPROVED → PENDING_TEST (exports 예시 실질 정정으로 재테스트 필요) | 메인 대화 (실측 정정 작업) |
| 2026-09-26 | v9 | 재검증: 2단계 실사용 테스트 재수행 (Q1 tsup ESM/CJS 라이브러리 dual-package exports 설정 / Q2 정정된 부분을 직접 겨냥한 흔한 함정 — outExtension이 dts에 전파된다는 착각으로 `.d.cts` 오기재) → 2/2 PASS(general-purpose 대체 사용), PENDING_TEST → APPROVED 전환. 선택 보강 gap 2건(exports-주의문 연결 문장, `"type":"module"` 반대 케이스 예제) 섹션 7에 기록 | skill-tester |
| 2026-09-28 | v9 | 선택 보강 반영 — "package.json exports 설정" 예시 앞에 "이 불일치를 그대로 반영한 결과" 연결 문장 추가 (내부 명확화, 사실 변경 없음, status 유지) | orchestrator (선택 보강 반영 배치) |
