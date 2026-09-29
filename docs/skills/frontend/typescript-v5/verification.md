---
skill: typescript-v5
category: frontend
version: v4
date: 2026-09-28
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | typescript-v5 |
| 스킬 경로 | .claude/skills/frontend/typescript-v5/SKILL.md |
| 검증일 | 2026-09-28 (NEEDS_REVISION 보강) / 2026-09-28 (재검증(2차)) / 2026-08-11 (v2) / 2026-04-20 (v1 최초) |
| 검증자 | skill-creator (v1·v2) → 재검증(2차) → NEEDS_REVISION 보강 |
| 스킬 버전 | v4 |
| 커버리지 | TS 5.0~5.9 본문 + 6.0·7.0 전환 프레임 (7.0.2 patch 기준) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (devblogs 6.0·7.0 발표문 직접 fetch)
- [✅] 공식 GitHub 2순위 소스 확인 (microsoft/TypeScript releases)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-08-11 — TS 7.0이 현행 최신)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성
- [✅] **v2 갱신**: 버전 프레임을 5.x 단독 → 5.x~7.x 지형으로 확장
- [✅] **v2 갱신**: 5.9 섹션 및 6.0→7.0 마이그레이션 섹션(§9) 신설

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 (v1) | 공식 문서 URL 참조 | TypeScript 5.0~5.8 릴리즈 노트 | 소스 3종, 버전별 핵심 기능 수집 |
| 교차 검증 (v1) | WebSearch | 15개 클레임 | VERIFIED 15 / DISPUTED 0 / UNVERIFIED 0 |
| 조사 (v2) | WebSearch | "TypeScript 6.0 release announcing", "TypeScript 7.0 native Go compiler 10x", "TypeScript 5.9 import defer node20" | 6.0·7.0·5.9 릴리즈 정보 및 언론 보도 수집 |
| 조사 (v2) | WebFetch | devblogs `announcing-typescript-6-0`, `announcing-typescript-7-0`, devblogs 인덱스, github.com/microsoft/TypeScript/releases | 6.0 deprecation·기본값 표, 7.0 제약·설치법, 게시일 확인 |
| 교차 검증 (v2) | WebSearch + WebFetch | 10개 신규 클레임 | VERIFIED 9 / DISPUTED 1 (7.0 출시일) / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| TypeScript 공식 릴리즈 노트 | https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html | ⭐⭐⭐ High | 2023~2025 | 공식 문서, 5.0~5.8 |
| Announcing TypeScript 6.0 (공식) | https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/ | ⭐⭐⭐ High | 2026-03-23 | deprecation·기본값 변경 1차 출처 |
| Announcing TypeScript 7.0 (공식) | https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/ | ⭐⭐⭐ High | 2026-07-08 | 네이티브 컴파일러·제약·병행 설치 1차 출처 |
| TypeScript 공식 블로그 인덱스 | https://devblogs.microsoft.com/typescript/ | ⭐⭐⭐ High | 2026-08 | 게시일 확인용 |
| TypeScript GitHub Releases | https://github.com/microsoft/TypeScript/releases | ⭐⭐⭐ High | 2026-08 | 해당 레포 최신 태그는 6.0.3 — 7.0은 네이티브(Go) 배포 경로 |
| Announcing TypeScript 5.9 (공식) | https://devblogs.microsoft.com/typescript/announcing-typescript-5-9/ | ⭐⭐⭐ High | 2025-08 | import defer / node20 |
| InfoWorld — Go-based TypeScript 7.0 arrives | https://www.infoworld.com/article/4196378/go-based-typescript-7-0-arrives.html | ⭐⭐ Medium-High | 2026-07-13 | 독립 매체 교차 확인 |
| InfoQ — TypeScript 7.0 released | https://www.infoq.com/news/2026/08/typescript-7-released/ | ⭐⭐ Medium-High | 2026-08 | 독립 매체, 7.1 API 계획 |
| Visual Studio Magazine — TS 6.0 ships as final JS-based release | https://visualstudiomagazine.com/articles/2026/03/23/typescript-6-0-ships-as-final-javascript-based-release-clears-path-for-go-native-7-0.aspx | ⭐⭐ Medium-High | 2026-03-23 | 6.0 출시일 독립 확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (본문 5.0~5.9 + 6.0·7.0 지형)
- [✅] deprecated된 패턴을 권장하지 않음 (6.0 deprecation 목록을 §9-2에 반영)
- [✅] 코드 예시가 실행 가능한 형태임
- [✅] "현재 최신 버전" 프레임이 실제 최신(7.0)과 일치

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (2026-08-11)
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함
- [✅] 짝 스킬(typescript-v4, 레거시 4.x 전용)과의 역할 분리 명시

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-04-20 · 2026-08-11 · 2026-09-28(1차) · 2026-09-28(2차, 보강 후 최종) skill-tester 재테스트)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-09-28 2차 재테스트: 2/2 PASS — 근거 섹션·코드 예시 정확히 인용)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — 2026-09-28 1차 재테스트에서 §9-2 신규 breaking change 표 3건에 코드 예시 부재로 PARTIAL 2건 발견 → 공식 발표문·JSDoc 핸드북 원문 기반 before/after 예시 3쌍 추가 + 서술 정정 완료 → 2026-09-28 2차 재테스트에서 2/2 PASS로 gap 해소 확인, APPROVED 전환

---

## 5. 테스트 진행 기록

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (실제 Agent 도구 호출, 최종 재테스트)
**수행 방법**: NEEDS_REVISION 보강(코드 예시 3쌍 추가 + JSDoc `.js` 전용 스코프 정정)이 반영된 최신 SKILL.md를 general-purpose 에이전트 2개에게 각각 Read시켜, 보강분을 직접 겨냥한 실전 질문 2개(①.ts 파일 무관 여부 확인 ②이모지 Template Literal Types 결과 변화)를 답변하게 함

### 실제 수행 테스트 (최종, 2026-09-28)

**Q1. ".ts/.tsx 전용 프로젝트에도 '값 위치 enum→typeof' breaking change가 영향을 미치는가?" (스코프 정정 겨냥)**
- ✅ PASS
- 근거: SKILL.md §9-2 표 위 "주의(정정)" 블록(L455-457) + 표 1행 "(JSDoc `.js` 전용)" 태그(L461) + before/after 예시(L465-491)
- 상세: 에이전트가 "영향 없음"으로 정확히 답변하고, 정정 블록·표 태그·JS 전용 예시 코드를 모두 근거로 인용. 1차 재테스트에서 지적된 "스코프 불명확" gap이 완전히 해소됨.

**Q2. "이모지 포함 HeadTail류 Template Literal Types가 6.0→7.0에서 어떻게 달라지는가?" (유니코드 보강분 겨냥)**
- ✅ PASS
- 근거: SKILL.md §9-2 "Template Literal Types의 유니코드 처리" 행(L462) + before/after 코드 예시(L493-501)
- 상세: `HeadTail<"😀abc">` 예시를 원문 그대로 정확히 인용해 before(`["\ud83d","\ude00abc"]`)/after(`["😀","abc"]`)를 설명. 1차 재테스트에서 지적된 "코드 예시 부재" gap이 완전히 해소됨. 부가 논평(Length 유틸리티 등 파생 영향)도 SKILL.md 경고 문구(L462)를 정확히 인용.

### 판정 (최종)

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (개념·버전별 기능 정리형 스킬 — content test로 충분한 카테고리)
- 최종 상태: **APPROVED** — 1차 재테스트에서 발견된 코드 예시 부재·스코프 모호성 gap이 보강 후 2차 재테스트에서 모두 해소됨을 확인

### 1차 재테스트 (2026-09-28, 보강 전) — PARTIAL, 아래 최종 재테스트로 해소됨

**Q1. 값 위치 enum을 타입 위치에 쓰다가 TS 7.0.2에서 에러 발생 — 원인과 수정법 (신규 보강분 겨냥)**
- 🟡 PARTIAL
- 근거: SKILL.md §9-2 "7.0에서 새로 확인된 추가 breaking change" 표, "값 위치의 enum을 타입 위치에 사용" 행 (L459)
- 상세: 원인 진단은 SKILL.md 근거와 정확히 일치("typeof someValue 명시 필요"). 다만 이 표 항목에 before/after 코드 예시가 없어, 에이전트가 정확한 치환 문법을 확정하지 못하고 "코드 예제가 없어 확정하기 어렵다"고 스스로 보고함 — 문서 전반의 다른 섹션(5.0~5.9, §9-1 등)은 모두 코드 블록을 동반하는데 이 신규 표 3건만 예외.

**Q2. 이모지 포함 Template Literal Types가 TS 7.0에서 결과가 달라짐 — 원인 (신규 보강분 겨냥)**
- 🟡 PARTIAL
- 근거: SKILL.md §9-2 "7.0에서 새로 확인된 추가 breaking change" 표, "Template Literal Types의 유니코드 처리" 행 (L460)
- 상세: 원인(UTF-16 코드 유닛 → 코드 포인트 처리 변경) 진단은 정확. 단 이 항목도 구체적 before/after 코드 예시·마이그레이션 패턴이 없어 "배경지식 없는 독자는 유추가 필요하다"고 에이전트가 명시. Q1과 동일한 패턴의 gap.

**발견된 gap (해소됨)**: §9-2 아래 신설된 "7.0에서 새로 확인된 추가 breaking change" 표 3건(enum-typeof·Template Literal 유니코드·JSDoc 분석 변경) 전부에 코드 예시(before/after)가 없음. 문서 본문 전체가 일관되게 코드 블록을 제공하는 것과 대비되는 구조적 공백 — 2개 질문에서 동일하게 재현된 신규 결함. → NEEDS_REVISION 보강(코드 예시 3쌍 + 스코프 정정)으로 해소, 위 "최종 재테스트"에서 2/2 PASS 확인.

**1차 판정**: agent content test 2/2 PARTIAL → 당시 NEEDS_REVISION 전환(SKILL.md는 원칙에 따라 직접 수정하지 않고 보강안만 사용자 승인 대기). 이후 보강 완료 → 본 세션에서 최종 재테스트 수행 → APPROVED.

---

### v1 content test (2026-04-20)

**수행일**: 2026-04-20
**수행자**: skill-tester → general-purpose

Q1. TS 5.4에서 defaultValue 매개변수가 T 추론을 넓히는 문제 해결법 — PASS (근거: SKILL.md "5.4 NoInfer" 섹션, `NoInfer<T>` 적용 + createSignal 예시)
Q2. `using` 키워드 사용에 필요한 버전과 구현 인터페이스 — PASS (근거: SKILL.md "5.2" 섹션, TS 5.2+ / `Disposable` + `[Symbol.dispose]()`)

agent content test: 2/2 PASS

### v2 갱신 재검증 (2026-08-11)

**수행일**: 2026-08-11
**수행자**: skill-creator (버전 프레임 갱신에 따른 재검증)
**수행 방법**: 갱신된 SKILL.md 기준 실전 질문 4개를 답변 경로 대조로 확인

Q1. "TS 5.4 프로젝트인데 빌드 속도 때문에 7.0으로 바로 올려도 되나?" — PASS
　(근거: §9 "5.x → 6.0 → 7.0", 6.0 경유 권장 + §9-5 체크리스트)
Q2. "7.0으로 올렸더니 `@types/node` 타입이 안 잡힌다" — PASS
　(근거: §9-1 `types` 기본값이 `[]`로 변경 → 명시 필요)
Q3. "typescript-eslint를 쓰는데 7.0으로 갈 수 있나?" — PASS
　(근거: §9-4 프로그래매틱 API 미제공·7.1 예정 + 6.0/7.0 병행 설치 명령)
Q4. "5.4에서 배운 `NoInfer`는 7.0에서도 그대로 쓰나?" — PASS
　(근거: §0 "5.x 타입 시스템 지식은 7.0에서도 유효" 표 — 7.0은 언어 변경이 아닌 컴파일러 재작성)

agent content test: 4/4 PASS (v1 2/2 포함 누적 6/6)

### WebSearch·WebFetch 교차 검증 (v1, 2026-04-20)

| 클레임 | 검증 소스 | 판정 |
|--------|-----------|------|
| TS 5.0에서 Stage 3 Decorators + const type parameters 도입 | typescriptlang.org 릴리즈 노트, devblogs | VERIFIED |
| TS 5.2에서 using/await using (Explicit Resource Management) 도입 | typescriptlang.org 릴리즈 노트, devblogs | VERIFIED |
| TS 5.5에서 Inferred Type Predicates 도입 | typescriptlang.org 릴리즈 노트, devblogs | VERIFIED |
| TS 5.7에서 rewriteRelativeImportExtensions 도입 | typescriptlang.org tsconfig 문서 | VERIFIED |
| TS 5.8에서 erasableSyntaxOnly 도입 | typescriptlang.org tsconfig 문서 | VERIFIED |

### WebSearch·WebFetch 교차 검증 (v2, 2026-08-11)

| # | 클레임 | 검증 소스 (2개 이상) | 판정 |
|---|--------|----------------------|------|
| 1 | TS 6.0은 2026-03-23 출시, JS 기반 컴파일러의 마지막 메이저 | devblogs 6.0 발표문 + Visual Studio Magazine(2026-03-23) | VERIFIED |
| 2 | TS 7.0은 Go로 재작성된 네이티브 컴파일러(코드명 Corsa) | devblogs 7.0 발표문 + InfoWorld + InfoQ | VERIFIED |
| 3 | TS 7.0 성능은 전체 빌드 기준 통상 8~12배("약 10배") | devblogs 7.0 발표문 + InfoWorld | VERIFIED |
| 4 | **TS 7.0 정식 출시일** | devblogs 인덱스(게시일 2026-07-08) + InfoWorld(발표 2026-07-08, RC 2026-06-18) ↔ InfoQ는 "2026-08-03 발표"로 보도 | **DISPUTED → 2026-07-08 채택** |
| 5 | 6.0 기본값 변경: strict=true, module=esnext, target=es2025, rootDir=./, types=[], noUncheckedSideEffectImports=true, libReplacement=false | devblogs 6.0 발표문 + devblogs 7.0 발표문(7.0이 6.0 기본값 승계 명시) | VERIFIED |
| 6 | 6.0 deprecated(→7.0 하드 에러): target es5, downlevelIteration, moduleResolution node10/classic, module amd·umd·systemjs·none, baseUrl, outFile, esModuleInterop:false, allowSyntheticDefaultImports:false, alwaysStrict:false, import assert | devblogs 6.0 발표문 + devblogs 7.0 발표문 | VERIFIED |
| 7 | `--stableTypeOrdering`은 6.0 신규(옵트인, 약 25% 감속), 7.0에서는 기본값·비활성화 불가 | devblogs 6.0 발표문 + devblogs 7.0 발표문 | VERIFIED |
| 8 | 7.0은 프로그래매틱 API 미제공 — typescript-eslint·Volar 계열·Vue/Svelte/Astro/MDX/Angular 템플릿 툴링은 6.0 필요, API는 7.1 예정 | devblogs 7.0 발표문 + InfoQ | VERIFIED |
| 9 | 6.0/7.0 병행 설치: `typescript@npm:@typescript/typescript6`(tsc6) + `@typescript/native`(tsc) | devblogs 7.0 발표문 + InfoWorld(@typescript/typescript6 호환 패키지 언급) | VERIFIED |
| 10 | 5.9(2025-08): import defer는 module preserve/esnext에서만 동작, --module node20은 target es2023 고정 | devblogs 5.9 발표문 + Visual Studio Magazine | VERIFIED |

**DISPUTED 처리 (#4)**: 7.0 출시일에 대해 2026-07-08(공식 블로그 게시일, InfoWorld 일치)과 2026-08-03(InfoQ 보도) 두 값이 확인됨. 1순위 소스인 공식 블로그 게시일을 채택하여 SKILL.md에 **2026-07-08**로 기재했다. 감사 지적서에 적힌 "2026-08-05"는 어느 1차 소스에서도 확인되지 않아 채택하지 않았다.

**참고**: github.com/microsoft/TypeScript/releases의 최신 태그는 6.0.3이다. 7.0은 Go 기반 별도 구현이라 해당 레포의 릴리즈 태그 목록만으로는 최신 버전을 판단할 수 없다 — 버전 확인 시 공식 블로그를 함께 봐야 한다.

---

### [2026-09-28] 재검증(2차) — 7.0.x patch·§9-4 API 제공 여부 확인 + enum/Unicode/JSDoc breaking change 보강

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 Read → 핵심 클레임 3개를 1차 소스와 대조, §9-4 중심으로 7.0 패치 변화 확인, 보강 검토

**클레임 대조 결과**:
1. 2026-09-28 기준 TypeScript 최신 버전 → VERIFIED (`npm registry typescript@latest` = 7.0.2, `npm dist-tags`의 `next`는 `7.1.0-dev.20260926.1` — 7.1은 아직 dev 프리릴리즈 단계, beta/rc 미출시)
2. §9-4 "7.0은 프로그래매틱 API 미제공, 7.1 예정" 이 7.0.2 시점에도 여전히 유효한가 → VERIFIED (devblogs.microsoft.com/typescript/announcing-typescript-7-0/ 재확인 — 안정 API는 여전히 7.1 계획 단계, npm에 7.1 정식/베타 태그 없음. 서드파티 블로그의 "7.1 베타 10/6·정식 11/24" 구체 날짜는 공식 소스로 확인 안 돼 미반영)
3. 7.0에서 §9-2에 없던 추가 breaking change가 있는가 → VERIFIED(보강 대상 확인): 공식 발표문에서 (a) 값 위치 enum을 타입 위치에 쓸 때 `typeof` 명시 필수, (b) Template Literal Types가 UTF-16 코드 유닛 대신 유니코드 코드 포인트 기준으로 처리(서로게이트 쌍 분할 방식 변경), (c) JSDoc 기반 JS 분석에서 `@enum` 특수 인식 제거·Closure 스타일 함수 문법 미지원 — 3건 확인, 기존 §9-2 표에 없었음

**보강(ADD)·축소**: §9-2 아래에 "7.0에서 새로 확인된 추가 breaking change" 표 신설(enum-typeof, 템플릿 리터럴 유니코드, JSDoc 분석 변경 3건). §0 버전 지형 표에 7.0.2 patch·7.1 dev 단계 상태 추가. 축소 없음.

**실전 질문 재검증**:
- Q1. "TS 7.0.2 환경에서 typescript-eslint를 아직도 6.0으로 돌려야 하나?" → SKILL.md §9-4 근거로 "예, 7.1 API 전까지는 그대로" — PASS
- Q2. "enum 값을 타입 자리에 쓰다가 7.0에서 갑자기 에러 난다" → SKILL.md §9-2 신규 표 "값 위치의 enum을 타입 위치에 사용" 근거로 `typeof` 명시 필요 — PASS

**재검증 최종 판정**: status **PENDING_TEST 전환** (§9-2 breaking change 3건 보강 — skill-tester 재테스트 필요)

---

### [2026-09-28] NEEDS_REVISION 보강 — §9-2 신규 표 3건 before/after 코드 예시 추가

**수행일**: 2026-09-28
**수행 방법**: skill-tester가 2026-09-28 재검증(2차)에서 지적한 gap(§9-2 "7.0에서 새로 확인된 추가 breaking change" 표 3건에 코드 예시 부재, 2/2 PARTIAL)에 대해 TypeScript 공식 발표문·공식 JSDoc 레퍼런스 원문을 직접 재대조하고, 원문에 명시된 예시·문구만 근거로 SKILL.md에 before/after 코드 예시를 추가

**대조 소스**:
- https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/ ("Template Literal Types Now Preserve Unicode Code Points" 섹션, "JavaScript Differences" 섹션 — 1차 소스, 공식 블로그)
- https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html (`@enum` 태그 사용법 — 1차 소스, 공식 핸드북)

**항목별 확인 결과**:
1. **값 위치의 enum을 타입 위치에 사용 → `typeof` 필요** — VERIFIED, 단 **서술 정정**: 공식 발표문 원문에서 이 항목은 "JavaScript Differences" 섹션(JSDoc 기반 **순수 `.js` 파일** 지원 재작성)에 속한 글머리 기호 중 하나이며, 원문 인용은 "Values cannot be used where types are expected – instead, write `typeof someValue`"다. **일반 `.ts`/`.tsx` 파일에는 적용되지 않는다** — `.ts` 파일은 이전부터 항상 `typeof`가 필요했고 7.0에서도 그대로다. SKILL.md 표 서술이 이 범위를 명시하지 않아 오해 소지가 있었으므로 "(JSDoc `.js` 전용)" 표기와 주의 문구를 추가해 정정했다. 공식 발표문 자체에는 이 항목 전용 코드 예시가 없어, 같은 목록의 `@enum` → `@typedef` 대체 예시(공식 발표문 인용: "create a `@typedef` on `(typeof YourEnumDeclaration)[keyof typeof YourEnumDeclaration]`")와 공식 JSDoc 핸드북의 `@enum` 사용 예시(before 상태 확인용)를 결합해 before/after 예시를 구성했다 — 둘 다 1차 소스 원문 그대로이며 추측 코드가 아니다.
2. **Template Literal Types 유니코드 코드 포인트 처리** — VERIFIED. 공식 발표문에 `HeadTail<"😀abc">` before(`["\ud83d", "\ude00abc"]`)/after(`["😀", "abc"]`) 예시가 그대로 실려 있어 원문 그대로 인용해 추가했다.
3. **JSDoc 기반 JS 분석 변경(`@enum` 제거·Closure 스타일 함수 문법 미지원)** — VERIFIED. 공식 발표문 "JavaScript Differences" 섹션 원문 목록에 그대로 있음. Closure 스타일 함수 문법 예시는 원문이 프로즈에서 직접 제시한 `function(string): void` → `(s: string) => void` 쌍을 그대로 코드 블록화해 추가했다.

**보강 내용**: SKILL.md §9-2 신규 표 아래에 (a) JSDoc `@enum` before/after, (b) Template Literal Types 유니코드 before/after, (c) JSDoc Closure 스타일 함수 문법 before/after — 총 3쌍의 코드 예시 추가. 표 1행에 "(JSDoc `.js` 전용)" 스코프 정정 및 주의 문구 추가. 축소 없음.

**최종 판정**: status **PENDING_TEST 유지** — 코드 예시·서술 정정을 반영했으므로 메인이 skill-tester로 재테스트 후 APPROVED 전환 여부 판단

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (누적 6/6 PASS(구 버전 대상) + 2026-09-28 1차 재테스트 2/2 PARTIAL(§9-2 신규 표 3건 코드 예시 부재 gap) → 보강 완료 → 2026-09-28 최종 재테스트 2/2 PASS로 gap 해소 확인) |
| 버전 프레임 최신성 | ✅ (2026-09-28 기준 7.0.2 patch까지 반영, 7.1은 아직 dev 단계) |
| **최종 판정** | **APPROVED** (2026-09-28 최종 재테스트 2/2 PASS — §9-2 신규 표 3건 코드 예시 보강 + 스코프 정정이 실전 질문에서 정확히 반영됨을 확인) |

판정 근거: 라이브러리 사용법·개념 정리형 스킬로 실행 결과·빌드 산출물이 아니라 답변 정확성으로 검증 가능한 카테고리다(검증 정책의 "content test로 충분" 유형). v1·v2에서 APPROVED였고 2026-09-28 재검증에서 §9-2에 breaking change 3건을 새로 보강했으나, skill-tester 1차 재테스트 결과 신규 보강 3건 전부에 코드 예시가 없어 두 질문 모두 PARTIAL 판정을 받았다(원인 진단 자체는 정확했으므로 사실 오류는 아니었음). 이후 공식 발표문(devblogs 7.0)과 공식 JSDoc 핸드북을 재대조해 before/after 코드 예시 3쌍을 추가하고, enum-typeof 항목이 실제로는 JSDoc `.js` 전용이라는 서술 오류도 정정했다. 보강된 SKILL.md로 최종 재테스트를 수행한 결과 ①.ts 파일 무관 스코프 정정 ②이모지 Template Literal Types 예시 두 질문 모두 PASS — 콘텐츠 완성도 gap이 완전히 해소되었으므로 APPROVED로 전환한다.

---

## 7. 개선 필요 사항

- [✅] v1 지적사항(버전 프레임이 5.x에 고정되어 6.0·7.0 시대를 반영하지 못함) — v2에서 §0 버전 지형 + §9 마이그레이션 신설로 해소
- [✅] 5.9 미포함 — §0-1로 추가
- [⏸️] TS 7.1 출시(프로그래매틱 API 제공) 시 §9-4 제약 목록 재검토 필요
- [⏸️] 6.0 이후 tsconfig 기본값이 추가 변경되면 §9-1 표 갱신 필요 (`target`은 매년 현행 ES로 이동하는 구조)
- [✅] §9-2 아래 "7.0에서 새로 확인된 추가 breaking change" 표 3건(enum-typeof·Template Literal 유니코드·JSDoc 분석 변경)에 코드 예시(before/after) 보강 완료 (2026-09-28) — 공식 발표문(devblogs 7.0)·공식 JSDoc 핸드북 원문 기반. enum-typeof 항목은 JSDoc `.js` 전용이라는 스코프 정정도 함께 반영
- [✅] skill-tester 재테스트 완료 (2026-09-28, 2/2 PASS) — PENDING_TEST → APPROVED 전환

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-20 | v1 | 최초 작성 — TS 5.0~5.8 버전별 신규 기능, tsconfig 5.x 설정, React 타입 패턴 | skill-creator |
| 2026-08-11 | v2 | 버전 커버리지 5.x → 5.x~7.x 확장. §0 버전 지형(6.0·7.0 위치와 5.x 지식의 유효 범위), §0-1 TS 5.9, §9 5.x→6.0→7.0 마이그레이션(기본값 변경·deprecation·stableTypeOrdering·7.0 API 제약·병행 설치) 신설. 신규 클레임 10건 교차 검증(VERIFIED 9 / DISPUTED 1 해소) | skill-creator |
| 2026-09-28 | v3 | 재검증(2차) — 7.0.2 patch·7.1 dev 단계 상태 반영, §9-2에 enum-typeof·템플릿 리터럴 유니코드·JSDoc 분석 변경 breaking change 3건 보강. §9-4(API 미제공) 결론은 그대로 유효 확인 | 재검증(2차) |
| 2026-09-28 | v3 | 2단계 실사용 재테스트 수행 (Q1 enum-typeof / Q2 Template Literal 유니코드, 둘 다 §9-2 신규 보강분 겨냥) → 2/2 PARTIAL(진단은 정확하나 코드 예시 부재), PENDING_TEST → NEEDS_REVISION 전환. 원칙에 따라 SKILL.md 미수정, 보강안 사용자 승인 대기 | skill-tester |
| 2026-09-28 | v4 | NEEDS_REVISION 보강 — devblogs TypeScript 7.0 발표문·공식 JSDoc 핸드북 원문 재대조 후 §9-2 신규 표 3건에 before/after 코드 예시 추가(JSDoc `@enum`, Template Literal Types 유니코드, JSDoc Closure 스타일 함수 문법). enum-typeof 행이 실제로는 JSDoc `.js` 전용이라는 서술 오류 정정. NEEDS_REVISION → PENDING_TEST 전환(재테스트는 메인이 수행) | 재검증 보강 |
| 2026-09-28 | v4 | 2단계 실사용 최종 재테스트 수행 (Q1 .ts 파일 스코프 무관 확인 / Q2 이모지 Template Literal Types before/after) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
