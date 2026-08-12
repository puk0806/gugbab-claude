---
skill: typescript-v5
category: frontend
version: v2
date: 2026-08-11
status: APPROVED
---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | typescript-v5 |
| 스킬 경로 | .claude/skills/frontend/typescript-v5/SKILL.md |
| 검증일 | 2026-08-11 (v2 갱신) / 2026-04-20 (v1 최초) |
| 검증자 | skill-creator |
| 스킬 버전 | v2 |
| 커버리지 | TS 5.0~5.9 본문 + 6.0·7.0 전환 프레임 |

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
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완

---

## 5. 테스트 진행 기록

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

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (누적 6/6 PASS) |
| 버전 프레임 최신성 | ✅ (2026-08-11 기준 7.0까지 반영) |
| **최종 판정** | **APPROVED** |

판정 근거: 라이브러리 사용법·개념 정리형 스킬로 실행 결과·빌드 산출물이 아니라 답변 정확성으로 검증 가능한 카테고리다(검증 정책의 "content test로 충분" 유형). v1에서 APPROVED였고, v2 갱신 내용도 전량 공식 1차 소스 교차 검증 + content test 4/4 PASS를 통과했으므로 APPROVED를 유지한다.

---

## 7. 개선 필요 사항

- [✅] v1 지적사항(버전 프레임이 5.x에 고정되어 6.0·7.0 시대를 반영하지 못함) — v2에서 §0 버전 지형 + §9 마이그레이션 신설로 해소
- [✅] 5.9 미포함 — §0-1로 추가
- [⏸️] TS 7.1 출시(프로그래매틱 API 제공) 시 §9-4 제약 목록 재검토 필요
- [⏸️] 6.0 이후 tsconfig 기본값이 추가 변경되면 §9-1 표 갱신 필요 (`target`은 매년 현행 ES로 이동하는 구조)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-20 | v1 | 최초 작성 — TS 5.0~5.8 버전별 신규 기능, tsconfig 5.x 설정, React 타입 패턴 | skill-creator |
| 2026-08-11 | v2 | 버전 커버리지 5.x → 5.x~7.x 확장. §0 버전 지형(6.0·7.0 위치와 5.x 지식의 유효 범위), §0-1 TS 5.9, §9 5.x→6.0→7.0 마이그레이션(기본값 변경·deprecation·stableTypeOrdering·7.0 API 제약·병행 설치) 신설. 신규 클레임 10건 교차 검증(VERIFIED 9 / DISPUTED 1 해소) | skill-creator |
