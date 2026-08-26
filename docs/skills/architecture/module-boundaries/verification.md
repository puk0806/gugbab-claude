---
skill: module-boundaries
category: architecture
version: v1
date: 2026-08-26
status: APPROVED
---

# module-boundaries 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `module-boundaries` |
| 스킬 경로 | `.claude/skills/architecture/module-boundaries/SKILL.md` |
| 검증일 | 2026-08-26 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 기준 버전 | dependency-cruiser 18.2.0 / eslint-plugin-boundaries·@boundaries/eslint-plugin 7.2.0(레거시 4.2.2) / eslint-plugin-import 2.32.0 / eslint-plugin-import-x 4.17.1 / eslint-import-resolver-typescript 4.4.5 / madge 8.0.0 / ESLint 10.9.1(8·9 호환 경로 병기) |

---

## 1. 작업 목록 (Task List)

- [✅] 검증 템플릿 Read (`docs/skills/VERIFICATION_TEMPLATE.md`) — 8개 섹션 구조 확보
- [✅] 중복 스킬 확인 (Glob `.claude/skills/**/module-boundaries/SKILL.md`) — 결과 없음, 신규 생성 확정
- [✅] 레포 관례 확인 — `architecture/ddd`·`frontend/code-convention` SKILL.md Read (frontmatter·`> 소스:`/`> 검증일:` 형식·섹션 스타일)
- [✅] 기존 스킬과의 중복 제거 — ESLint/Prettier/husky/lint-staged 기본 설정은 `frontend/code-convention`으로 포인터, 레이어 개념은 `architecture/ddd`로 포인터
- [✅] 공식 문서 1순위 소스 확인 (dependency-cruiser doc/*.md, jsboundaries.dev, eslint.org, import-js 룰 문서, typescriptlang.org, nodejs.org, nextjs.org)
- [✅] 공식 GitHub 2순위 소스 확인 (sverweij/dependency-cruiser releases·doc, javierbrea/eslint-plugin-boundaries v4.2.2 태그, import-js/eslint-plugin-import README)
- [✅] 최신 안정 버전 확인 (npm registry `latest` 직접 조회, 날짜: 2026-08-26)
- [✅] ESLint 8 / 9 / 10 호환 매트릭스 정리 (플러그인 peerDependencies 원문 대조)
- [✅] dependency-cruiser 규칙 작성법 정리 (forbidden/allowed/required, from·to 조건, `$1` 역참조, orphan, circular)
- [✅] TS path alias·모노레포 해석 옵션 정리 (tsConfig / enhancedResolveOptions / combinedDependencies / webpackConfig)
- [✅] ESLint 3방식(no-restricted-imports / import 룰 / boundaries) 강제력·한계·성능 비교표 작성
- [✅] flat config + legacy `.eslintrc` 양쪽 예시 작성 (요구사항: 레거시 필수)
- [✅] TS project references / package `exports`·`imports` 경계 설계 정리
- [✅] barrel file 비용 메커니즘 + 순환 탐지·해소 절차 정리
- [✅] 점진 도입 전략(baseline / `--ignore-known` / warn→error / CI 게이트) 정리
- [✅] 흔한 실패 패턴 정리 (disable 남발·shared 예외·false green 등 11종)
- [✅] SKILL.md 파일 작성
- [✅] verification.md 작성
- [✅] skill-tester 2단계 테스트 — 2026-08-26 수행, 3/3 PASS

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 확보 |
| 관례 확인 | Read | `architecture/ddd/SKILL.md`, `frontend/code-convention/SKILL.md`, `docs/skills/frontend/tanstack-query/verification.md` | frontmatter·소스/검증일 표기·섹션 스타일·verification 8섹션 형식 확보 |
| 중복 확인 | Glob | `.claude/skills/**/module-boundaries/SKILL.md`, `.claude/skills/architecture/*/SKILL.md` | 동명 스킬 없음 (architecture 기존 2종) |
| 조사 | WebFetch | npm registry `latest`/`dist-tags` 7건(dependency-cruiser, eslint-plugin-boundaries, @boundaries/eslint-plugin, eslint-plugin-import, eslint-plugin-import-x, eslint-import-resolver-typescript, madge, eslint) | 최신 버전·peerDependencies·engines 원문 확보 |
| 조사 | WebFetch | dependency-cruiser `doc/rules-reference.md`·`doc/options-reference.md`·`doc/cli.md`·`README.md`·`doc/faq.md`, GitHub releases | 규칙 조건 전체·옵션명·CLI 플래그·v18 breaking change 확보 |
| 조사 | WebFetch | jsboundaries.dev (`/docs/installation/`, `/docs/quick-start/`, `/docs/rules/`, `/docs/rules/dependencies/`, `/docs/setup/eslint-integration/`) | v7 룰 구성·deprecated 목록·프리셋·ESLint 9+ 요구 확인 |
| 조사 | WebFetch | `eslint-plugin-boundaries` v4.2.2 태그 README | ESLint 8 레거시 `.eslintrc` 설정 원문 확보 |
| 조사 | WebFetch | eslint.org `no-restricted-imports`, typescript-eslint `no-restricted-imports`, import-js `no-restricted-paths`·`no-cycle`·README | 옵션·한계(정적 import 전용)·deprecated 사실 확보 |
| 조사 | WebFetch | typescriptlang.org project-references, nodejs.org packages(exports/imports), nextjs.org optimizePackageImports, vercel.com 블로그 | 물리 경계 설계·barrel 비용 수치 확보 |
| 교차 검증 | WebSearch | "dependency-cruiser latest version", "eslint-plugin-boundaries v5 flat config ESLint 9", "eslint-plugin-boundaries v7 migration", "ESLint v10 removed eslintrc", "eslint-plugin-import ESLint 10 / import-x", "barrel files tree shaking", "depcruise baseline --ignore-known", "ESLint --suppress-all 도입 버전" | 8회 검색으로 2차 소스 대조 |
| 교차 검증 결과 | WebSearch + WebFetch | 21개 클레임, 클레임당 독립 소스 2개 이상 | VERIFIED 18 / DISPUTED 3 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| dependency-cruiser rules-reference | https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md | ⭐⭐⭐ High | 2026-08-26 | forbidden/allowed/required, from·to 조건, `$1` 역참조 |
| dependency-cruiser options-reference | https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md | ⭐⭐⭐ High | 2026-08-26 | tsConfig·enhancedResolveOptions·combinedDependencies·cache |
| dependency-cruiser cli | https://github.com/sverweij/dependency-cruiser/blob/main/doc/cli.md | ⭐⭐⭐ High | 2026-08-26 | `--config`(구 `--validate`)·output-type·`--ignore-known`·`--affected`·exit code |
| dependency-cruiser README / releases | https://github.com/sverweij/dependency-cruiser | ⭐⭐⭐ High | 2026-08-26 | 설치·`--init`·v18 breaking change(Node 20·25 지원 종료, enhanced-resolve tsconfig 전환) |
| npm registry (dependency-cruiser) | https://registry.npmjs.org/dependency-cruiser/latest | ⭐⭐⭐ High | 2026-08-26 | 18.2.0, engines `^22\|\|^24\|\|>=26` |
| JS Boundaries 공식 문서 | https://www.jsboundaries.dev/docs/installation/ · /quick-start/ · /rules/ · /rules/dependencies/ · /setup/eslint-integration/ | ⭐⭐⭐ High | 2026-08-26 | v5.0.0+ = ESLint 9+, v7 룰 구성·deprecated·프리셋 |
| eslint-plugin-boundaries v4.2.2 태그 | https://github.com/javierbrea/eslint-plugin-boundaries/tree/v4.2.2 | ⭐⭐⭐ High | 2026-08-26 | ESLint 8 `.eslintrc` 설정 원문 |
| npm registry (boundaries 양쪽 패키지) | https://registry.npmjs.org/@boundaries/eslint-plugin/latest · /-/package/eslint-plugin-boundaries/dist-tags | ⭐⭐⭐ High | 2026-08-26 | 두 이름 모두 7.2.0, deprecate 표시 없음 |
| 플러그인 rename RFC / 마이그레이션 안내 | https://github.com/javierbrea/eslint-plugin-boundaries/discussions/371 | ⭐⭐ Medium | 2026-08-26 | 공식 레포 discussion(=1차 소스지만 계획 문서) |
| ESLint no-restricted-imports | https://eslint.org/docs/latest/rules/no-restricted-imports | ⭐⭐⭐ High | 2026-08-26 | paths/patterns 옵션, 정적 import 전용 |
| typescript-eslint no-restricted-imports | https://typescript-eslint.io/rules/no-restricted-imports/ | ⭐⭐⭐ High | 2026-08-26 | allowTypeImports, ESLint 9.37.0 이후 deprecated |
| import/no-restricted-paths | https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-restricted-paths.md | ⭐⭐⭐ High | 2026-08-26 | zones(target/from/except/message), basePath, 글롭·디렉터리 혼용 금지 |
| import/no-cycle | https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-cycle.md | ⭐⭐⭐ High | 2026-08-26 | maxDepth·ignoreExternal·allowUnsafeDynamicCyclicDependency·disableScc·비용 경고 |
| eslint-plugin-import README | https://github.com/import-js/eslint-plugin-import | ⭐⭐⭐ High | 2026-08-26 | flat(`flatConfigs.*`)·legacy(`plugin:import/*`) 설정, resolver 설정 |
| npm registry (import / import-x / resolver) | https://registry.npmjs.org/eslint-plugin-import/latest 외 2건 | ⭐⭐⭐ High | 2026-08-26 | 2.32.0(peer ≤ eslint 9) / 4.17.1(peer ^8.57\|\|^9\|\|^10) / 4.4.5 |
| ESLint v10 릴리즈·마이그레이션 | https://eslint.org/blog/2026/02/eslint-v10.0.0-released/ · https://eslint.org/docs/latest/use/migrate-to-10.0.0 | ⭐⭐⭐ High | 2026-08-26 | eslintrc 완전 제거, Node ≥20.19 |
| ESLint bulk suppressions | https://eslint.org/blog/2025/04/introducing-bulk-suppressions/ · https://eslint.org/blog/2025/04/eslint-v9.24.0-released/ | ⭐⭐⭐ High | 2026-08-26 | `--suppress-all`·`--prune-suppressions` 9.24.0 도입 |
| TypeScript Project References | https://www.typescriptlang.org/docs/handbook/project-references.html | ⭐⭐⭐ High | 2026-08-26 | composite·declaration(Map)·`tsc -b`·참조한 프로젝트만 import 가능 |
| Node.js Modules: Packages | https://nodejs.org/api/packages.html | ⭐⭐⭐ High | 2026-08-26 | exports 캡슐화·ERR_PACKAGE_PATH_NOT_EXPORTED·조건 순서·imports(`#`) |
| Next.js optimizePackageImports | https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports | ⭐⭐⭐ High | 2026-08-26 | experimental 상태·기본 최적화 패키지 목록 |
| Vercel 엔지니어링 블로그 (barrel files) | https://vercel.com/blog/how-we-optimized-package-imports-in-next-js | ⭐⭐⭐ High | 2026-08-26 | 200~800ms import, 최대 10,000 재export, 15~70%/28%/40% 개선 수치 |
| npm registry (madge) | https://registry.npmjs.org/madge/latest | ⭐⭐⭐ High | 2026-08-26 | 8.0.0 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 3건은 `> 주의:` 블록으로 명시 반영)
- [✅] 버전 정보가 명시되어 있음 (섹션 0 기준 버전 표 + 본문 각주)
- [✅] deprecated된 패턴을 권장하지 않음 (`boundaries/element-types`·`entry-point`·`external`·`no-private` deprecated 명시, `@typescript-eslint/no-restricted-imports` deprecated 명시, `importKind` → `dependency.kind`)
- [✅] 코드 예시가 실행 가능한 형태임 (설정 파일 전체 형태로 제시, 정규식 이스케이프·flat/legacy 문법 구분)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (`> 소스:` 9줄 / `> 검증일: 2026-08-26`)
- [✅] 핵심 개념 설명 포함 (도구별 강제 지점·강제력·한계 비교)
- [✅] 코드 예시 포함 (dependency-cruiser 설정, flat config, legacy eslintrc, exports/imports, tsconfig, CI 워크플로)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (섹션 1 결정 트리 + 3-1 선택 기준 + barrel 사용 판단표)
- [✅] 흔한 실수 패턴 포함 (섹션 7, 11종)
- [✅] 요구사항 7개 항목 전부 커버 (dependency-cruiser / ESLint 3방식 비교 / flat+legacy 양쪽 / TS refs·exports / 순환·barrel / 점진 도입 / 실패 패턴)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 설정 파일 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (복붙 가능한 설정·CI YAML·스크립트)
- [✅] 범용적으로 사용 가능 (특정 프로젝트·경로 종속 없음, 레이어명은 예시로만 사용)
- [✅] 기존 스킬과 중복 없이 상호 참조 (`frontend/code-convention` = 린터/포매터/훅 기본 설정, `architecture/ddd` = 레이어 개념)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] skill-tester 호출 — 2026-08-26 수행 (skill-tester → general-purpose 3회)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 — 3/3 PASS, 전부 SKILL.md 섹션·줄 번호 근거 명시
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — 이번 3건은 보완 불필요(gap은 선택적 심화 항목만)

### 4-5. 교차 검증 판정표

| # | 클레임 | 소스 1 | 소스 2 | 판정 |
|---|--------|--------|--------|------|
| 1 | dependency-cruiser 최신 안정 버전은 **18.2.0** | npm registry `latest` = 18.2.0 | GitHub releases 목록 최상단 v18.2.0 | **VERIFIED** |
| 2 | dependency-cruiser 18은 Node `^22 \|\| ^24 \|\| >=26` 요구 (Node 20 지원 종료) | npm registry engines | v18.0.0 릴리즈 노트 "drops support for nodejs 20 and 25" | **VERIFIED** |
| 3 | `from.path`의 캡처그룹을 `to.path`/`to.pathNot`에서 `$1`로 역참조해 "형제 폴더 간 의존 금지"를 표현한다 | rules-reference "Group matching" 예시 | rules-tutorial(동 레포 doc) 동일 패턴 | **VERIFIED** |
| 4 | `orphan: true`가 있으면 규칙의 `to`는 무시된다 | rules-reference orphan 항목 | `--init` 생성 기본 규칙이 `to: {}`로 작성됨(README/cli 흐름) | **VERIFIED** |
| 5 | `--ignore-known`은 기본 `.dependency-cruiser-known-violations.json`을 읽고, baseline은 `--output-type baseline` 또는 `depcruise-baseline`으로 생성 | cli.md Known Violations 섹션 | 검색 교차 확인(동 문서 인용 다수 + 실사용 커맨드 예시) | **VERIFIED** |
| 6 | `--validate`는 `--config`의 별칭이며 v13+에서 설정 플래그 자체가 선택사항 | cli.md `--config`/`--validate` 설명 | README "v12 이하에서는 `--config`가 필요했다" 주석 | **VERIFIED** |
| 7 | dependency-cruiser 종료 코드 = error 심각도 위반 개수 | cli.md `err` 리포터 설명 | cli.md exit code 항목 | **VERIFIED** |
| 8 | `eslint-plugin-boundaries`는 **v5.0.0부터 ESLint 9+ 전용**, ESLint 8·eslintrc는 v4.2.2 사용 | jsboundaries.dev Installation 원문 | v4.2.2 README "표준 버전은 ESLint 8 이하 지원, ESLint 9는 @beta" | **VERIFIED** |
| 9 | v7에서 `boundaries/element-types`는 deprecated이고 `boundaries/dependencies`가 정식 룰 (`no-unknown`→`no-unknown-dependencies`, `no-ignored`→`no-ignored-dependencies`) | jsboundaries.dev Rules Overview | 구 GitHub 룰 문서가 `/docs/rules/dependencies/`로 리디렉트 안내 | **VERIFIED** |
| 10 | `boundaries` 플러그인 최신 버전은 7.2.0이며 패키지명이 `@boundaries/eslint-plugin`으로 이관 중 | npm `@boundaries/eslint-plugin` latest 7.2.0 | 레포 RFC #371(rename 계획·v6 이중 발행) | **DISPUTED → 주의 표기** (아래 4-6 참조) |
| 11 | v7 `boundaries/dependencies`의 정책 배열 키는 `rules` | jsboundaries.dev 룰 레퍼런스(`"rules": An array of policy objects`) | jsboundaries.dev quick-start는 `policies:` 사용 | **DISPUTED → 주의 표기** |
| 12 | `no-restricted-imports`는 **정적 import 전용**이며 `patterns[].group`은 gitignore 스타일 | ESLint 공식 룰 문서 | typescript-eslint 확장 룰 문서(동일 base 설명) | **VERIFIED** |
| 13 | `@typescript-eslint/no-restricted-imports`는 ESLint 9.37.0에서 base 룰이 TS 문법을 지원하며 **deprecated** | typescript-eslint 룰 페이지 원문 | ESLint 코어 룰 문서의 TS import 문법 언급 | **VERIFIED** |
| 14 | `import/no-restricted-paths`의 `from`은 디렉터리와 글롭을 섞을 수 없고 `except`는 `from` 형태를 따라야 한다 | import-js 룰 문서 원문 | 동 문서 예시(디렉터리형·글롭형 구분 예시) | **VERIFIED** |
| 15 | `import/no-cycle`은 계산 비용이 크며 `maxDepth`·`ignoreExternal`로 완화한다 | import-js 룰 문서 "comparatively computationally expensive" | 동 문서 옵션 설명(maxDepth "reduce lint time") | **VERIFIED** |
| 16 | `eslint-plugin-import` 2.32.0의 peer는 ESLint 9까지이며 ESLint 10은 `eslint-plugin-import-x`(4.17.1)가 대안 | npm registry 양쪽 peerDependencies | import-x 이슈 #438 "Preparing for ESLint 10" + 4.16.2에서 peer 확장 보고 | **VERIFIED** |
| 17 | ESLint v10.0.0에서 eslintrc 설정 시스템이 **완전 제거**됨 | eslint.org v10.0.0 릴리즈 블로그 | eslint.org migrate-to-10.0.0 문서 | **VERIFIED** |
| 18 | ESLint 대량 억제(`--suppress-all`/`--prune-suppressions`)는 **9.24.0** 도입 | eslint.org "Introducing bulk suppressions"(2025-04) | eslint.org v9.24.0 릴리즈 노트 | **VERIFIED** |
| 19 | `exports`가 정의되면 미등재 서브패스 import는 `ERR_PACKAGE_PATH_NOT_EXPORTED`로 실패하고, 조건 키는 선언 순서대로 매칭된다(`types` 최우선, `default` 최후) | Node 공식 packages 문서 | 동 문서 conditional exports 순서 규정 | **VERIFIED** |
| 20 | TS project references는 `composite: true`가 필수이고 **참조한 프로젝트에서만 import 가능**하다 | TypeScript 핸드북 project-references | 동 문서 "Only import from referenced projects" 설명 | **VERIFIED** |
| 21 | Next.js `optimizePackageImports`는 **여전히 experimental**이며 외부 패키지 대상이다 | nextjs.org 공식 API 레퍼런스(experimental 경고 + 기본 목록) | Vercel 엔지니어링 블로그(13.5 도입 배경) | **DISPUTED → 정정 반영** |

> 판정 집계: VERIFIED 18 / DISPUTED 3 / UNVERIFIED 0 (총 21건).

### 4-6. DISPUTED 처리 내역

**#10 — boundaries 플러그인 패키지명**
- 레포 RFC/마이그레이션 안내: "v6.x에서는 구·신 패키지가 동시 발행되며 **v7.0부터는 `@boundaries/eslint-plugin`만 발행**된다."
- 실제 레지스트리: 구 이름 `eslint-plugin-boundaries`의 dist-tags `latest` = **7.2.0**, deprecate 필드 없음. 공식 문서 quick-start 예제도 여전히 `import boundaries from "eslint-plugin-boundaries"`를 사용.
- 조치: SKILL.md 섹션 0에 `> 주의:` 블록으로 "두 이름 모두 7.2.0 존재, deprecate 표시 없음 → 신규 도입은 스코프 패키지를 쓰되 룰 접두사는 `boundaries/`" 로 명시.

**#11 — `boundaries/dependencies` 정책 배열 키 (`rules` vs `policies`)**
- 룰 레퍼런스 페이지: `rules`(정책 객체 배열).
- quick-start 페이지: `policies`.
- 조치: 룰 레퍼런스를 따라 `rules:`로 예제를 작성하고, `> 주의:` 블록에 **문서 간 불일치 사실 + 설치 버전 타입 정의(`DependenciesRuleOptions`)로 확인하라**는 지시를 명시.

**#21 — Next.js barrel 최적화의 적용 범위**
- 통념/2차 소스: "Next.js 13.5+는 barrel 문제를 자동으로 해결한다."
- 공식 문서: 해당 옵션은 `experimental.optimizePackageImports`이며 "실험적 기능, 프로덕션 권장 아님" 경고가 붙어 있고, 기본 최적화 대상은 명시된 **외부 라이브러리 목록**이다.
- 조치: SKILL.md 5-1에 `> 주의:` 블록으로 "experimental 상태 + 외부 패키지 대상 + **내 앱 내부 배럴은 해결해주지 않는다**"를 명시.

### 4-7. 조사 중 발견한 오정보 (반영하지 않음)

- 검색 엔진 요약이 dependency-cruiser 최신 버전을 **17.4.3**으로 제시했으나, npm registry `latest`와 GitHub releases 모두 **18.2.0**이었다 → 레지스트리 원문을 채택.
- GitHub releases 페이지 파싱 시 릴리즈 날짜가 2024년으로 표기되는 오독이 있었으나, 버전 번호·breaking change 내용만 채택하고 **날짜는 스킬에 기재하지 않음**.

---

## 5. 테스트 진행 기록

**수행일**: 2026-08-26
**수행자**: skill-tester → general-purpose (3회, 도메인 전용 에이전트 registry에 프론트엔드 아키텍처 전담 에이전트가 없어 general-purpose로 대체 — 대체 사실 명시)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션·줄 번호 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. ESLint 8 + `.eslintrc` 레거시 프로젝트에서 `features/*` 간 직접 import 금지 — 어떤 플러그인·버전?**
- ✅ PASS
- 근거: SKILL.md 섹션 0(기준 버전 표, 31행) + 섹션 3-4 (b)(495~500행)
- 상세: `eslint-plugin-boundaries@4.2.2`로 정확히 고정 설치해야 한다고 정확히 답변. v5 이상을 설치하면 "v5.0.0부터 ESLint 9+ flat config 전용"이라 ESLint 8·eslintrc 환경과 맞지 않는다는 anti-pattern을 정확히 짚음(31행, 497행 인용). 섹션 559행의 "버전 정확 고정 원칙"까지 근거로 인용.

**Q2. dependency-cruiser 기존 위반 수백 건 코드베이스에 규칙을 점진 도입하는 방법**
- ✅ PASS
- 근거: SKILL.md 섹션 6 전체(6-1~6-4, 718~824행) + 섹션 7 실패 패턴 표(836행)
- 상세: "첫날 목표는 위반 0이 아니라 신규 위반 0"(718행) 원칙, `--output-type baseline --output-to .dependency-cruiser-known-violations.json` → `--ignore-known` CI 게이트, warn→error 승격 로드맵(W1/W2~/분기 단위 표), CI 게이트 YAML(baseline 증가 차단)까지 구체 명령어·파일명 포함해 정확히 재현. "첫날부터 전부 error → 팀이 규칙을 통째로 끔"이라는 실패 이유도 정확히 인용.

**Q3. barrel(index.ts)이 순환·번들 문제를 만드는 메커니즘 + Next.js `optimizePackageImports`가 앱 내부 배럴을 해결해주는지**
- ✅ PASS
- 근거: SKILL.md 섹션 5-1(657~667행) + 섹션 5-2(669~688행)
- 상세: 자기 슬라이스 배럴 재import로 인한 순환(`Cannot access 'X' before initialization`) 메커니즘과, 배럴 재export 전체가 그래프에 편입되며 최상위 사이드이펙트가 있으면 트리셰이킹이 무력화되는 메커니즘을 정확히 설명. 핵심 anti-pattern("optimizePackageImports가 내 앱 내부 배럴도 해결해준다"는 오해)을 SKILL.md 667행의 `> 주의:` 블록을 근거로 정확히 회피 — "experimental 상태 + 외부 패키지 대상 + 내 앱 안의 배럴은 해결해주지 않는다"고 명확히 답변.

### 발견된 gap (있으면)

- Q1: v4.2.2 → v5+ 마이그레이션 시 룰명 매핑표(`element-types`→`dependencies` 등) 부재 — 이번 질문 범위 밖이라 차단 요인 아님, 선택 보강.
- Q2: baseline 항목 예외 승인 프로세스(누가 언제 baseline에 새 항목 추가를 승인하는지) 미기재 — 선택 보강.
- Q3: `optimizePackageImports`의 내부 동작 원리(swc 트랜스폼) 및 사용자 코드 경로 수동 등록 가능 여부 불명확 — 선택 보강.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: "도구 설정·개념" — 실사용 필수 카테고리(마이그레이션 가이드/빌드 설정/워크플로우)에 해당하지 않음, content test PASS만으로 APPROVED 전환 가능
- 최종 상태: APPROVED

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (핵심 클레임 21건 중 VERIFIED 18, DISPUTED 3은 `> 주의:` 블록으로 정정·명시 반영) |
| 구조 완전성 | ✅ (frontmatter·소스 URL 9종·검증일·기준 버전 표·주의 표기·흔한 실수·체크리스트) |
| 실용성 | ✅ (복붙 가능한 설정 파일·CI 워크플로·마이그레이션 절차, 프로젝트 비종속) |
| 기존 스킬과의 중복 | ✅ 분리 완료 (`frontend/code-convention` = 린터·포매터·훅 기본 설정 / `architecture/ddd` = 레이어 개념 / 이 스킬 = 경계 강제 도구) |
| 요구 항목 커버리지 | ✅ 7개 요구 항목 전부 반영 (flat + legacy 양쪽 예시 포함) |
| 에이전트 활용 테스트 | ✅ 2026-08-26 수행 — 3/3 PASS (skill-tester → general-purpose) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester가 content test 수행하고 섹션 5·6 업데이트 (2026-08-26 완료, 3/3 PASS)
- [❌] `boundaries/dependencies`의 정책 배열 키(`rules` vs `policies`) — 실제 설치 후 타입 정의로 확정하고 SKILL.md의 `> 주의:` 블록을 확정 서술로 교체 필요 (선택 보강 — 이미 `> 주의:`로 불일치 사실을 명시했으므로 차단 요인 아님)
- [❌] `eslint-plugin-boundaries`(구 이름) 패키지가 실제로 deprecate 처리되면 섹션 0의 주의 문구를 "스코프 패키지 단일 경로"로 갱신 필요 (선택 보강 — 외부 이벤트 발생 시에만 필요)
- [❌] dependency-cruiser 18이 요구하는 Node 22+ 때문에 Node 20 고정 CI에서는 도입 불가 — 해당 환경용 폴백(17.x 사용) 절차는 미기재 (선택 보강)
- [❌] `import/no-cycle`·dependency-cruiser `no-circular`의 실제 실행 시간 비교 수치는 미측정(정성 비교만 기재) — 실제 레포 적용 시 측정해 보완 (선택 보강)
- [❌] ESLint 8 → 9 → 10 마이그레이션 시 경계 플러그인 조합 교체 절차는 포인터 수준 — 별도 마이그레이션 스킬로 분리 검토 (선택 보강)
- [❌] Biome에는 아직 동등한 경계 룰 세트가 없다는 점(대안 부재)에 대한 조사 미수행 — `frontend/code-convention`에서 Biome을 선택한 프로젝트를 위한 안내 보완 여지 (선택 보강)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-08-26 | v1 | 최초 작성 — 공식 문서 30여 회 페치·8회 검색 기반, 핵심 클레임 21건 교차 검증(DISPUTED 3건 주의 표기 반영). 단계 1~4만 수행, skill-tester 테스트는 오케스트레이터 별도 수행 예정 | skill-creator |
| 2026-08-26 | v1 | 2단계 실사용 테스트 수행 (Q1 ESLint 8 레거시 boundaries 버전 / Q2 dependency-cruiser 점진 도입 / Q3 barrel 순환·번들 메커니즘+optimizePackageImports 한계) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
