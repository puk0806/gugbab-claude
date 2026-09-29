---
skill: tsup
category: frontend
version: v3
date: 2026-09-29
status: APPROVED
---

> 상태 참고: 본 스킬은 verification-policy.md "실사용 필수 스킬" 중 **빌드 설정 스킬(출력 결과물 검증 필요)** 카테고리였다. 2026-09-29 lab에서 실제 빌드 산출물(ESM/CJS/.d.ts, outExtension 결과) 검증을 완료해 APPROVED로 전환.

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | tsup |
| 스킬 경로 | .claude/skills/frontend/tsup/SKILL.md |
| 검증일 | 2026-09-26 (재검증, 최초 2026-04-20) |
| 검증자 | Claude (WebSearch + WebFetch) |
| 스킬 버전 | v2 |
| 버전 기준 | tsup 8.5.1 (2024-11-12, 변경 없음 — 유지보수 종료·tsdown 권장) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (tsup.egoist.dev)
- [✅] 공식 GitHub releases 2순위 소스 확인 (github.com/egoist/tsup/releases)
- [✅] 최신 버전 기준 내용 확인 (tsup 8.5.1, 2026-04-20)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "tsup bundler 2026 latest version configuration options CJS ESM TypeScript" | 10개 소스 발견, tsup.egoist.dev·LogRocket·jsDocs.io 확인 |
| 조사 | WebFetch | https://github.com/egoist/tsup/releases | 최신 버전 v8.5.1 (2024-11-12), 최근 릴리즈 이력 수집 |
| 교차 검증 | WebSearch | "tsup package.json exports map CJS ESM types field d.cts d.ts 2024 2025" | 8개 소스 발견, d.cts 타입 파일 관련 VERIFIED |
| 교차 검증 | WebSearch | "tsup monorepo turborepo shared package build pattern tsup.config.ts 2025" | 10개 소스 발견, Turborepo + tsup 패턴 VERIFIED |
| 교차 검증 | WebSearch | "tsup vs rollup vs vite lib mode comparison 2025 tree shaking DTS CSS" | 10개 소스 발견, 비교 분석 VERIFIED |
| 교차 검증 | WebSearch | "tsup d.cts declaration file CJS exports condition require types wrong 2024" | 타입 파일 .d.cts 필요성 VERIFIED, TypeScript 4.7+ 요구사항 확인 |
| 교차 검증 | WebSearch | "tsup 8.5 Options interface configuration dts external splitting treeshake banner define" | Options 인터페이스 항목 VERIFIED |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| tsup 공식 문서 | https://tsup.egoist.dev | ⭐⭐⭐ High | 2026-04-20 | 공식 문서 (SSL 이슈로 WebFetch 실패, WebSearch로 내용 교차 확인) |
| tsup GitHub Releases | https://github.com/egoist/tsup/releases | ⭐⭐⭐ High | 2026-04-20 | 최신 버전 v8.5.1 직접 확인 |
| jsDocs.io tsup@8.5.1 | https://www.jsdocs.io/package/tsup | ⭐⭐⭐ High | 2026-04-20 | API 타입 정보 (SSL 이슈로 WebFetch 실패, WebSearch로 확인) |
| LogRocket Blog | https://blog.logrocket.com/tsup/ | ⭐⭐ Medium | 2026-04-20 | 설정 옵션 실사용 예시 (SSL 이슈로 WebFetch 실패) |
| johnnyreilly.com | https://johnnyreilly.com/dual-publishing-esm-cjs-modules-with-tsup-and-are-the-types-wrong | ⭐⭐ Medium | 2026-04-20 | d.cts 타입 파일 패턴, exports 조건 순서 (SSL 이슈로 WebFetch 실패, WebSearch 스니펫 확인) |
| lirantal.com | https://lirantal.com/blog/typescript-in-2025-with-esm-and-cjs-npm-publishing | ⭐⭐ Medium | 2025 | 2025년 ESM/CJS 듀얼 퍼블리싱 현황 |
| pkgpulse.com | https://www.pkgpulse.com/blog/tsup-vs-rollup-vs-esbuild-2026 | ⭐⭐ Medium | 2026 | tsup vs rollup vs esbuild 비교 |
| TypeScript 공식 문서 | https://www.typescriptlang.org/docs/handbook/modules/reference.html | ⭐⭐⭐ High | - | exports 조건 타입 해석 규칙 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (tsup 8.5.1)
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
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완

---

## 5. 테스트 진행 기록

### [2026-09-29] 실사용(실행) 검증

**수행일**: 2026-09-29
**수행 방법**: lab 폴더에 `npm init -y` + `tsup`(`npm view tsup version` = 8.5.1, SKILL.md와 일치) + `typescript` 설치, 작은 TS 라이브러리(`src/index.ts`: 함수 1개 + interface 1개) 작성. `tsup.config.ts`에 `format: ['cjs','esm']`, `dts: true`, `outExtension`(커스텀: cjs→`.cjs.js`, esm→`.mjs.js`)을 설정해 `npx tsup` 빌드 2회 실행 — ① `typescript@5.7.3`(SKILL.md 기준 버전 계열) ② `typescript@latest`(오늘 npm `latest` 태그 = **7.0.2**).
**실행 결과**:
- TypeScript 5.7.3: 빌드 성공. `index.cjs.js`/`index.mjs.js`(outExtension 커스텀 반영) + `index.d.ts`/`index.d.mts`(dts 확장자는 outExtension 영향 없이 포맷 표준값 유지) 모두 생성 — SKILL.md의 "outExtension은 dts 확장자에 반영 안 됨"(egoist/tsup#939) 서술과 정확히 일치.
- TypeScript **7.0.2**(오늘 `npm install typescript` 기본값): JS 번들(CJS/ESM)은 정상 생성되나 **DTS 빌드 단계에서 크래시** — `TypeError: Cannot read properties of undefined (reading 'useCaseSensitiveFileNames')`(tsup이 자기 dist에 번들링한 `rollup-plugin-dts@6.1.1`이 TypeScript 7의 컴파일러 API 변경과 불일치). WebSearch로 공식 이슈 https://github.com/egoist/tsup/issues/1405 (2026-09 기준 미해결) 확인해 재현성·원인 교차 검증. 회피책(`dts: false` + `tsc --emitDeclarationOnly --outDir dist`)도 동일 lab에서 재실행해 정상 동작 확인(`index.d.ts` 정상 생성, JS 번들과 함께 완전한 산출물 구성).
**서술과 불일치 발견 및 정정**: SKILL.md는 "유지보수 종료"만 언급하고 TypeScript 7과의 구체적 비호환(크래시)은 다루지 않았음 — 오늘 `npm install tsup typescript --save-dev`를 그대로 실행하면 바로 이 크래시에 부딪히는 **차단급 문제**라 SKILL.md 상단에 새 `> 주의` 추가(원인·공식 이슈 링크·회피책 2가지) + "설치" 섹션에 `typescript@^5.7.3` 버전 고정 예시로 변경 + "느린 DTS 빌드 분리 패턴" 섹션에 "TypeScript 7 환경에서는 필수 우회책" 문구 추가(Edit 완료, 근거: lab 실행 재현 2회 + WebSearch 공식 이슈 대조). 추가로 회피책을 처음 `"build": "tsup --dts false"` CLI 플래그로 문서화했다가, lab에서 재검증한 결과 **CLI `--dts false`는 `tsup.config.ts`의 `dts: true`를 덮어쓰지 못하고 그대로 크래시함**을 확인(config 파일이 우선) → SKILL.md를 `tsup.config.ts`에서 직접 `dts: false`로 끄는 방식으로 재정정(2차 정정, 같은 세션 내 자체 발견·수정).
**졸업 조건 충족 여부**: 충족 (PENDING_TEST.md: "ESM/CJS·`.d.ts` 산출물과 `outExtension` 결과가 스킬 서술과 일치하는지 확인" — 일치 확인 + 추가로 TS7 비호환이라는 새 불일치를 발견해 정정까지 완료)
**판정**: APPROVED 전환 (SKILL.md 정정 포함)

### 재검증 (2026-09-26)

**수행일**: 2026-09-26
**수행 방법**: SKILL.md Read 후 핵심 클레임 3개 WebSearch/WebFetch 재검증 + 실전 질문 2개 자체 답변 확인

클레임 재검증:
| # | 클레임 | 판정 | 비고 |
|---|--------|------|------|
| 1 | tsup 최신 안정 버전은 8.5.1 | VERIFIED(단, DISPUTED 성격 추가 발견) | npm 최신 버전은 여전히 8.5.1(변경 없음). 단 공식 GitHub README에 "This project is not actively maintained anymore. Please consider using tsdown instead." 유지보수 중단 공지 신규 확인 → SKILL.md 상단에 `> 주의` 추가 |
| 2 | CJS/ESM 동시 출력 시 확장자는 `.js`(ESM)/`.cjs`(CJS), dts는 `.d.ts`/`.d.cts` | VERIFIED | 오늘(2026-09-26) bundling-compiler 스킬 재검증에서 tsup@8.5.1 실빌드로 재확인. 추가로 `outExtension`이 dts 확장자에는 반영되지 않는 공식 이슈(egoist/tsup#939, 미해결) 확인 → SKILL.md DTS 섹션에 `> 주의` 추가 |
| 3 | package.json exports 조건에서 `types`는 `default`보다 먼저 와야 함 | VERIFIED | TypeScript 공식 모듈 해석 문서 재확인, 변경 없음 |

Q1. "tsup 신규 프로젝트 시작해도 되나?" — SKILL.md 신규 주의 문구 기반 답변: 최신 버전은 안정적이나 공식적으로 유지보수 종료·tsdown 권장 상태이므로 신규 프로젝트는 tsdown을 우선 검토해야 한다. PASS
Q2. "`outExtension`으로 dts 파일 확장자도 바꿀 수 있나?" — SKILL.md DTS 섹션 답변: 불가, 공식 이슈 #939로 미해결. PASS

agent content test: 2/2 PASS. tsup 유지보수 중단 공지는 실행 가능한 예제 코드 자체를 깨뜨리지 않지만 "적합한 경우" 권장이 바뀌는 수준의 실질 변경이라 판단해 status를 PENDING_TEST로 되돌린다.

---

### 2단계 재테스트 (2026-09-28)

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (2개 병렬 호출)
**수행 방법**: SKILL.md Read 후 2개 실전 질문 답변, 근거 섹션·anti-pattern 회피 확인. 2026-09-26 재검증에서 정정된 부분(tsup 유지보수 중단·tsdown 권장, outExtension이 dts 확장자 미반영)을 겨냥한 질문 포함

**Q1. "신규 프로젝트에 tsup 채택해도 되나? outExtension으로 .d.ts 확장자도 바꿀 수 있나?"**
- ✅ PASS
- 근거: SKILL.md 상단 주의문(11행) + "최신 안정 버전" 서술(19행) + "TypeScript Declaration 파일 생성" 주의(171행)
- 상세: 유지보수 중단·tsdown 우선 검토 권고와 outExtension이 dts 확장자에 미반영되는 공식 이슈(#939)가 모두 정확히 답변됨.

**Q2. "React가 번들에 포함되는 이유+해결 + exports types 조건 순서 이유"**
- ✅ PASS
- 근거: SKILL.md "External 패키지 설정" 기본 동작(192행) + package.json exports 필드 주의(379행)
- 상세: devDependencies vs peerDependencies 자동 external 동작, types가 default보다 먼저 와야 하는 이유 모두 정확히 답변됨.

### 발견된 gap (2026-09-28)

없음 — 2개 질문 모두 정정된 최신 내용(유지보수 중단·outExtension 이슈)과 기존 핵심 API 서술이 모순 없이 답변에 반영됨.

### 판정 (2026-09-28)

- agent content test: 2/2 PASS
- verification-policy 분류: **빌드 설정 스킬 (실사용 필수 카테고리)** — 출력 결과물(빌드 산출물) 실사용 검증 필요, content test PASS만으로 APPROVED 전환하지 않음
- 최종 상태: PENDING_TEST 유지 (content test는 통과했으나 실사용 필수 카테고리이므로 실제 프로젝트 빌드 검증 전까지 유지)

---

### 테스트 케이스 1: CJS/ESM 듀얼 패키지 설정 요청

**입력 (질문/요청):**
```
npm 배포용 TypeScript 라이브러리를 CJS와 ESM 모두 지원하도록 tsup 설정을 잡아줘.
package.json exports 필드까지 포함해서.
```

**기대 결과:**
```
- tsup.config.ts에 format: ['cjs', 'esm'], dts: true 포함
- package.json exports에 import/require 조건 분리
- types 필드가 default보다 앞에 오는 순서 준수
- .d.cts 파일을 require.types에 명시
```

**실제 결과:**
```
SKILL.md "CJS/ESM 동시 출력" 섹션에서 tsup.config.ts 설정 제공 (format: ['cjs', 'esm'], dts: true).
"package.json exports 필드 설정" 섹션에서 CJS/ESM 듀얼 패키지 표준 패턴을 정확히 제공:
- import.types → import.default, require.types → require.default 순서 준수
- .d.cts 파일을 require.types에 명시
- "흔한 실수 #3"에서 types 순서 잘못되는 사례까지 안내
```

**판정:** ✅ PASS

---

### 테스트 케이스 2: React 의존성이 번들에 포함되는 문제 해결

**입력:**
```
tsup으로 React 컴포넌트 라이브러리를 빌드했는데, react가 번들에 포함돼서 용량이 커졌어요.
왜 그런가요?
```

**기대 결과:**
```
- peerDependencies에 react를 넣어야 자동 external 처리됨
- devDependencies에만 넣으면 번들에 포함됨
- 필요시 external 옵션으로 명시적 제외 가능
```

**실제 결과:**
```
SKILL.md "External 패키지 설정" 섹션에서 자동 external 동작 설명:
"tsup은 package.json의 dependencies와 peerDependencies를 자동으로 external 처리한다.
devDependencies는 번들에 포함된다."
"흔한 실수 #1"에서 정확히 이 시나리오를 다룸:
devDependencies에만 react를 넣으면 번들에 포함되고,
peerDependencies에도 넣어야 external 처리된다는 올바른/잘못된 예시 제공.
```

**판정:** ✅ PASS

**검증 비고:** WebSearch로 tsup 8.5.1이 최신 안정 버전임을 확인(npm, GitHub releases). defineConfig API, format/dts/external 옵션, peerDependencies 자동 external 동작 모두 공식 문서 및 GitHub discussions과 일치.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (WebSearch 교차 검증 완료, tsup 8.5.1 기준) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (2026-04-20 2건 PASS + 2026-09-26 재검증 2건 PASS + 2026-09-28 재테스트 2건 PASS) |
| 실사용(실행) 검증(2026-09-29) | ✅ lab 샘플에서 tsup 8.5.1 빌드 → CJS/ESM/.d.ts·outExtension 모두 서술과 일치. **신규 발견**: TypeScript 7(npm latest)과 `dts: true` 조합 크래시(egoist/tsup#1405) → SKILL.md에 주의·회피책 추가 |
| **최종 판정** | **APPROVED** (2026-09-29 실사용 실행 검증 완료 — 빌드 산출물이 SKILL.md 서술과 일치, TS7 비호환 발견분은 SKILL.md 정정 반영) |

---

## 7. 개선 필요 사항

- [✅] 에이전트 활용 테스트 — CJS/ESM 듀얼 + React external 2건 PASS (섹션 5 기록, 2026-04-20); 2026-09-28 재테스트 2/2 PASS 추가 수행
- [✅] 실사용(실제 프로젝트 빌드 산출물) 검증 완료 (2026-09-29) — lab 샘플에서 CJS/ESM/.d.ts·outExtension 전부 서술과 일치 확인 → APPROVED 전환
- [✅] TypeScript 7 + `dts: true` 크래시 신규 발견 → SKILL.md 상단 주의·설치 섹션 버전 고정·DTS 분리 패턴 섹션에 회피책 반영 (2026-09-29, 근거: lab 재현 2회 + egoist/tsup#1405 대조)
- [⏸️] tsup.egoist.dev 공식 문서 직접 접속 재시도 (SSL 이슈 해결 후) — 검증 보강 선택 사항
- [⏸️] 공식 문서의 전체 Options 인터페이스 항목 완전 수집 후 비교 — 검증 보강 선택 사항

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-20 | v1 | 최초 작성 (내장 지식 기반, 실시간 검증 미실시) | skill-creator |
| 2026-04-20 | v2 | WebSearch + WebFetch 공식 문서 조사·교차 검증 반영, tsup 8.5.1 버전 확인, d.cts 타입 파일 패턴 추가, exports 조건 순서 오류 사례 추가 | Claude |
| 2026-09-26 | v2 | 재검증. tsup GitHub README 유지보수 중단·tsdown 권장 공지 신규 확인 → SKILL.md 상단 주의 추가. `outExtension`이 dts 확장자에 미반영되는 공식 이슈(#939) 확인 → DTS 섹션 주의 추가. APPROVED → PENDING_TEST | 수동 검증 |
| 2026-09-28 | v2 | 2단계 재테스트 수행 (Q1 유지보수 중단+outExtension 이슈 / Q2 React external+exports types 순서) → 2/2 PASS. 빌드 설정 스킬(실사용 필수 카테고리)로 판단해 PENDING_TEST 유지 | skill-tester |
| 2026-09-29 | v3 | 실사용(실행) 검증 — lab 샘플(작은 TS 라이브러리)에서 tsup 8.5.1 빌드로 CJS/ESM/.d.ts·outExtension 확인, TypeScript 5.7.3/7.0.2 두 버전 비교 빌드로 TS7+dts 크래시(egoist/tsup#1405) 신규 발견·SKILL.md 정정(주의·설치 버전 고정·DTS 분리 필수화). status APPROVED 전환 | Claude (Sonnet 5) |
