---
skill: incremental-refactoring
category: architecture
version: v1
date: 2026-08-26
status: PENDING_TEST
---

# incremental-refactoring 스킬 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `incremental-refactoring` |
| 스킬 경로 | `.claude/skills/architecture/incremental-refactoring/SKILL.md` |
| 검증일 | 2026-08-26 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 기준 버전 | ts-morph 28.0.0 / jscodeshift 17.4.0 / dependency-cruiser 18.2.0 / eslint-plugin-boundaries 7.2.0 / tsconfig-paths 4.2.0 / size-limit 13.0.3 / TypeScript 7.0.2(6.0.2 병행) |

---

## 1. 작업 목록 (Task List)

- [✅] 템플릿 확인 (`docs/skills/VERIFICATION_TEMPLATE.md` — 8개 섹션 구조 확보)
- [✅] 중복 스킬 확인 (`.claude/skills/**/incremental-refactoring/SKILL.md` → 결과 없음, 신규 생성 확정)
- [✅] 기존 관례 확인 (`architecture/ddd/SKILL.md` Read → frontmatter·`> 소스:`·`> 검증일:`·`> 주의:` 표기·표 중심 섹션 스타일 준수)
- [✅] 레포 내 중복 주제 확인 (`dependency-cruiser|eslint-plugin-boundaries|Strangler` Grep → 전 스킬에서 미등장, 신규 영역 확인)
- [✅] 1순위 원저자 소스 확인 — Martin Fowler bliki 3종(Strangler Fig / Branch by Abstraction / Parallel Change) + branching-patterns 아티클 + refactoring.com
- [✅] 2순위 공식 소스 확인 — Azure Architecture Center, ts-morph 공식 문서 + GitHub `latest` 브랜치 원문, jscodeshift GitHub README(raw), dependency-cruiser 공식 CLI 문서, git-scm 공식 문서 4종, ESLint 공식 룰 문서, GitHub Docs, Microsoft TypeScript devblog
- [✅] 최신 안정 버전 확인 (npm registry `latest` 직접 조회 — ts-morph / @ts-morph/common / jscodeshift / dependency-cruiser / eslint-plugin-boundaries / tsconfig-paths / size-limit / typescript)
- [✅] 대상 API가 현재도 유효한지 확인 (ts-morph `Project`/`move`/`setModuleSpecifier`/`organizeImports`/`getSourceFiles(glob)`/`addSourceFilesAtPaths`, jscodeshift transform 시그니처·CLI 옵션·parser)
- [✅] Strangler Fig 원 출처 기준 정의 + 프론트엔드 폴더/모듈 재구조화 매핑 작성
- [✅] codemod 3종 실행 예시 작성 (import 경로 일괄 재작성 / 파일 이동 후 참조 갱신 / barrel export 해체)
- [✅] TypeScript 프로젝트에서 `tsconfig` paths 인식 설정 작성 (ts-morph 네이티브 + jscodeshift 수동 해석)
- [✅] `git mv` + IDE 리팩터 vs codemod 사용 시점 기준 작성
- [✅] 안전장치 작성 (PR 분할 4유형 / 검증 게이트 5종 / 되돌리기 / git rename 보존 / 리뷰 가능성)
- [✅] 테스트 없는 코드베이스 안전망 작성 (characterization test·골든 마스터 / 타입체크·빌드 산출물 비교 / 스냅샷·VR 한계)
- [✅] 작업 순서 설계 작성 (리프 우선 / shared 경계 선행·이동 후행 / 브랜치 충돌 / 코드 프리즈 없이)
- [✅] 진행 추적 작성 (위반 수 지표 3종 / baseline / 중단 안전 단계 설계)
- [✅] 흔한 실패 패턴 14종 정리
- [✅] SKILL.md 파일 작성
- [✅] verification.md 작성
- [✅] skill-tester 2단계 테스트 — 2026-08-26 완료 (섹션 5 참조, 4/4 PASS)
- [❌] README.md 갱신 — **이번 작업에서 의도적으로 수행하지 않음 (오케스트레이터 담당)**

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 템플릿 확인 | Read | `docs/skills/VERIFICATION_TEMPLATE.md` | 8개 섹션 구조 확보 |
| 관례 확인 | Read | `.claude/skills/architecture/ddd/SKILL.md`, `docs/skills/frontend/tanstack-query/verification.md` | frontmatter·소스/검증일 줄·`> 주의:` 표기·표 중심 스타일 / verification 8섹션 서식 확보 |
| 중복 확인 | Glob | `.claude/skills/**/incremental-refactoring/SKILL.md`, `.claude/skills/architecture/*/SKILL.md` | 결과 없음 → 신규 생성 확정 (architecture 카테고리 기존 2종과 주제 비중복) |
| 범위 중복 확인 | Grep | `dependency-cruiser\|eslint-plugin-boundaries\|Strangler` in `.claude/skills` | 매칭 파일 0 → 기존 스킬과 내용 중복 없음 |
| 조사 (원저자) | WebFetch | martinfowler.com — StranglerFigApplication / BranchByAbstraction / ParallelChange / branching-patterns / refactoring.com | 원문 정의·단계·주의점·Semantic Conflict 원문 인용 확보 |
| 조사 (공식) | WebFetch | learn.microsoft.com Strangler Fig 패턴 페이지 | 4단계 파사드 흐름 + 고려사항 + 롤백 가능 구간 원문 확보 |
| 조사 (도구) | WebFetch | ts-morph.com (setup / details/source-files / details/imports / navigation) + raw.githubusercontent `latest` 브랜치 docs 2종 | Project 옵션·move/copy 갱신 범위·import API·glob 오버로드·addSourceFilesAtPaths 확보 |
| 조사 (도구) | WebFetch | github.com/facebook/jscodeshift + raw README | transform 시그니처·api.stats/report·CLI 옵션·parser 목록·반환값 규약 확보 |
| 조사 (도구) | WebFetch | dependency-cruiser `doc/cli.md` (main) | baseline 리포터·`depcruise-baseline`·`--ignore-known`·출력 타입 20종 확보 |
| 조사 (git) | WebFetch | git-scm.com — git-mv / git-diff / git-blame / git-log | 인덱스 갱신 문구·`-M` 기본 50%·`diff.renames` 기본 true·`--ignore-rev(s-file)`·`-M/-C` 임계·`--follow` 단일 파일 제약 확보 |
| 조사 (표준) | WebFetch | eslint.org `no-restricted-imports`, docs.github.com viewing-and-understanding-files | `patterns.group/regex` 제약·GitHub blame ignore 파일 위치와 한계 확보 |
| 조사 (버전) | WebFetch | registry.npmjs.org `/latest` × 8 (ts-morph, @ts-morph/common, jscodeshift, dependency-cruiser, eslint-plugin-boundaries, tsconfig-paths, size-limit, typescript) | 정확한 최신 버전·engines·의존성 확보 |
| 조사 (리스크) | WebSearch → WebFetch | TypeScript 7 네이티브 포트의 프로그래매틱 API 상태 | 블로그 다수 주장 → **공식 devblog 원문으로 확정** (7.0 API 미포함, 7.1 예정, `@typescript/typescript6`) |
| 조사 (근거) | WebFetch | vercel.com/blog/how-we-optimized-package-imports-in-next-js | 배럴 파일 비용 수치(200~800ms, 재귀 배럴 ~30s) 확보 |
| 교차 검증 | WebSearch + WebFetch | 15개 클레임, 각각 독립 소스 2개 이상 대조 | VERIFIED 13 / DISPUTED 2 / UNVERIFIED 0 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Martin Fowler — Strangler Fig Application | https://martinfowler.com/bliki/StranglerFigApplication.html | ⭐⭐⭐ High | 2026-08-26 | 원저자 1차 자료. 2024-08-22 갱신, 개명 경위·전이 아키텍처 |
| Martin Fowler — Branch By Abstraction | https://martinfowler.com/bliki/BranchByAbstraction.html | ⭐⭐⭐ High | 2026-08-26 | 정의·4단계·용어 창안자(Paul Hammant / 원안 Stacy Curl) |
| Danilo Sato — Parallel Change (martinfowler.com) | https://martinfowler.com/bliki/ParallelChange.html | ⭐⭐⭐ High | 2026-08-26 | expand/migrate/contract 3단계, 2014-05-13 |
| Martin Fowler — Patterns for Managing Source Code Branches | https://martinfowler.com/articles/branching-patterns.html | ⭐⭐⭐ High | 2026-08-26 | 리팩터링·통합 빈도, Feature Branching 부작용, Semantic Conflict |
| refactoring.com (Fowler) | https://refactoring.com/ | ⭐⭐⭐ High | 2026-08-26 | 리팩터링 정의(관찰 가능한 동작 불변) |
| Azure Architecture Center — Strangler Fig Pattern | https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig | ⭐⭐⭐ High | 2026-08-26 | 4단계 파사드, ACL 연계, 롤백 가능 구간 |
| ts-morph 공식 문서 — Setup | https://ts-morph.com/setup/ | ⭐⭐⭐ High | 2026-08-26 | `tsConfigFilePath`, `skipAddingFilesFromTsConfig`, compilerOptions 오버라이드 |
| ts-morph 공식 문서 — Source Files | https://ts-morph.com/details/source-files | ⭐⭐⭐ High | 2026-08-26 | move/copy 갱신 범위, organizeImports 경고, save≠emit |
| ts-morph GitHub `latest` — docs/details/source-files.md | https://raw.githubusercontent.com/dsherret/ts-morph/latest/docs/details/source-files.md | ⭐⭐⭐ High | 2026-08-26 | 위 문서의 독립 원문(교차 검증용) |
| ts-morph GitHub `latest` — getting-source-files.md | https://raw.githubusercontent.com/dsherret/ts-morph/latest/docs/navigation/getting-source-files.md | ⭐⭐⭐ High | 2026-08-26 | `getSourceFiles(glob)` 및 부정 glob 오버로드 |
| ts-morph GitHub `latest` — adding-source-files.md | https://raw.githubusercontent.com/dsherret/ts-morph/latest/docs/setup/adding-source-files.md | ⭐⭐⭐ High | 2026-08-26 | `addSourceFilesAtPaths` 시그니처 |
| ts-morph 공식 문서 — Imports | https://ts-morph.com/details/imports | ⭐⭐⭐ High | 2026-08-26 | `getModuleSpecifierValue`/`setModuleSpecifier`/`getNamedImports` |
| jscodeshift GitHub README | https://github.com/facebook/jscodeshift , https://raw.githubusercontent.com/facebook/jscodeshift/main/README.md | ⭐⭐⭐ High | 2026-08-26 | transform 시그니처·CLI 옵션·parser·`api.stats` dry 제약 |
| dependency-cruiser 공식 CLI 문서 | https://github.com/sverweij/dependency-cruiser/blob/main/doc/cli.md | ⭐⭐⭐ High | 2026-08-26 | baseline 리포터, `--ignore-known` 동작, 출력 타입 목록 |
| Git 공식 문서 — git-mv | https://git-scm.com/docs/git-mv | ⭐⭐⭐ High | 2026-08-26 | "The index is updated after successful completion…" |
| Git 공식 문서 — git-diff | https://git-scm.com/docs/git-diff | ⭐⭐⭐ High | 2026-08-26 | `-M` 기본 50%, `diff.renames` 기본 true |
| Git 공식 문서 — git-blame | https://git-scm.com/docs/git-blame | ⭐⭐⭐ High | 2026-08-26 | `--ignore-rev(s-file)`, `blame.ignoreRevsFile`, `-M`(20자)/`-C`(40자) |
| Git 공식 문서 — git-log | https://git-scm.com/docs/git-log | ⭐⭐⭐ High | 2026-08-26 | `--follow` = 단일 파일 한정 |
| GitHub Docs — Viewing and understanding files | https://docs.github.com/en/repositories/working-with-files/using-files/viewing-and-understanding-files | ⭐⭐⭐ High | 2026-08-26 | `.git-blame-ignore-revs` 루트 위치 요구·제외 한계 |
| ESLint 공식 룰 — no-restricted-imports | https://eslint.org/docs/latest/rules/no-restricted-imports | ⭐⭐⭐ High | 2026-08-26 | `patterns.group`(gitignore 스타일·`!` 부정), `regex`와 병용 불가 |
| Microsoft TypeScript devblog — Announcing TypeScript 7.0 | https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/ | ⭐⭐⭐ High | 2026-08-26 | 2026-07-08 릴리즈, API 미포함, 7.1 예정, `@typescript/typescript6`·`tsc6`·npm alias |
| Microsoft TypeScript devblog — TypeScript 7.0 Beta | https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-beta/ | ⭐⭐⭐ High | 2026-08-26 | "we won't have a stable programmatic API available until at least … TypeScript 7.1" (교차 검증) |
| npm registry `/latest` × 8 | https://registry.npmjs.org/{ts-morph,@ts-morph/common,jscodeshift,dependency-cruiser,eslint-plugin-boundaries,tsconfig-paths,size-limit,typescript}/latest | ⭐⭐⭐ High | 2026-08-26 | 최신 안정 버전·engines·의존성 원본 |
| Vercel Engineering Blog — optimizePackageImports | https://vercel.com/blog/how-we-optimized-package-imports-in-next-js | ⭐⭐ Medium-High | 2026-08-26 | 배럴 파일 비용 수치(벤더 자체 측정치로 명시 인용) |
| Wikipedia — Characterization test | https://en.wikipedia.org/wiki/Characterization_test | ⭐⭐ Medium | 2026-08-26 | Feathers 용어 창안 사실 교차 확인용 보조 소스 |
| Michael Feathers, *Working Effectively with Legacy Code* (Prentice Hall, 2004) | (서적) | ⭐⭐⭐ High | 2026-08-26 | characterization test 원저 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음 (DISPUTED 2건은 공식 문서 기준으로 수정 반영, 4-5·4-6 참조)
- [✅] 버전 정보가 명시되어 있음 (0절 버전 표 + 각 코드 예시에 대상 버전 병기)
- [✅] deprecated / 이미 무효한 패턴을 권장하지 않음 (`git mv`가 rename을 저장한다는 통념, `move()`가 별칭까지 고쳐준다는 통념 모두 정정)
- [✅] 코드 예시가 실행 가능한 형태임 (ts-morph 3종·jscodeshift 1종·bash 게이트·dependency-cruiser 설정·ESLint flat config 모두 문서화된 API만 사용)

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (`> 소스:` 10줄, `> 검증일: 2026-08-26`)
- [✅] 핵심 개념 설명 포함 (Strangler Fig / Branch by Abstraction / Parallel Change / characterization test)
- [✅] 코드 예시 포함 (전 실행 절 — 3·4·5·6·7·8절)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (9절 + 2절 이동 수단 선택표 + 4-4 도구 선택표)
- [✅] 흔한 실수 패턴 포함 (10절 14종, 각 항목에 해당 섹션 역참조)
- [✅] 요구된 7개 주제 전부 커버 (Strangler Fig 1절 / codemod 3·4절 / 안전장치 5절 / 테스트 없는 코드 6절 / 작업 순서 7절 / 진행 추적 8절 / 실패 패턴 10절)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 작업 수행에 도움이 되는 수준 (실행 명령·PR 템플릿·게이트 목록이 그대로 복사 가능)
- [✅] 지나치게 이론적이지 않음 (원저 정의는 근거로만 인용하고, 각 패턴을 프론트엔드 폴더 이동으로 즉시 매핑)
- [✅] 범용적으로 사용 가능 (특정 프로젝트·사내 도구 종속 없음. 경로는 `src/features`·`src/shared` 등 일반 예시)
- [✅] 기존 스킬과 역할 분리 (`architecture/ddd` = 경계를 어떻게 정할지 / 이 스킬 = 정해진 경계로 어떻게 옮길지, 본문 서두와 9절에서 명시)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] skill-tester를 통한 실전 질문 수행 — 2026-08-26 수행 (general-purpose 대체, Q1~Q4)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 — 4/4 PASS, 전부 근거 섹션 명시
- [✅] 잘못된 응답 발견 시 스킬 내용 보완 — 잘못된 응답 없음(보완 불필요)

### 4-5. 교차 검증 판정표

| # | 클레임 | 소스 1 | 소스 2 | 판정 |
|---|--------|--------|--------|------|
| 1 | Strangler Fig는 Fowler가 2001년 퀸즐랜드에서 관찰한 교살무화과 은유이며, 핵심은 "레거시의 동작을 조각 단위로 새 코드베이스로 옮기는 것", 전이 아키텍처가 필수 비용 | martinfowler.com/bliki/StranglerFigApplication.html (원저자, 2024-08-22 갱신) | learn.microsoft.com Strangler Fig 패턴(파사드 4단계 + "transitional architecture" 명시) | **VERIFIED** |
| 2 | 패턴의 정식 명칭은 "Strangler **Fig** Application" — Fowler가 원래 "Strangler Application"에서 개명 | 원저 페이지 본문(개명 경위 서술) | 페이지 타이틀·URL 자체가 StranglerFigApplication | **VERIFIED** |
| 3 | Branch by Abstraction 용어는 Paul Hammant가 명명, 개념 원안은 Stacy Curl. 추상화 계층 도입 → 클라이언트 이전 → 새 공급자 → 전환 후 옛것 삭제 | martinfowler.com/bliki/BranchByAbstraction.html | 동 페이지의 단계 서술 + Parallel Change 페이지의 동일 골격 대조 | **VERIFIED** |
| 4 | Parallel Change = expand / migrate / contract 3단계. Danilo Sato가 2014-05-13 martinfowler.com에 게재, 기법 자체는 Joshua Kerievsky가 2006년 먼저 문서화 | martinfowler.com/bliki/ParallelChange.html | 동 페이지 저자·출처 표기 | **VERIFIED** |
| 5 | ts-morph 최신 안정 버전은 **28.0.0**(`@ts-morph/common` 0.29.0), jscodeshift는 **17.4.0**(Node >= 16) | registry.npmjs.org/ts-morph/latest, /@ts-morph/common/latest, /jscodeshift/latest | WebSearch 결과(ts-morph 28.0.0 / jscodeshift 17.4.0) | **VERIFIED** |
| 6 | ts-morph `Project`에 `tsConfigFilePath`를 주면 tsconfig 관련 소스 파일이 자동 추가되고, `skipAddingFilesFromTsConfig`로 끌 수 있으며 `compilerOptions`로 덮어쓸 수 있다 | ts-morph.com/setup/ | ts-morph GitHub `latest` docs/setup/adding-source-files.md(`addSourceFilesAtPaths` 조합) | **VERIFIED** |
| 7 | `sourceFile.move()`는 이동 파일 내부 + **다른 파일들의 상대 경로** import/export 지정자까지 자동 갱신한다. `copy()`는 복사된 파일 내부로 한정 | ts-morph.com/details/source-files | raw.githubusercontent ts-morph `latest` docs/details/source-files.md (동일 원문 독립 확인) | **VERIFIED** |
| 8 | "`move()`가 `@/...` 같은 별칭(비상대) 지정자까지 갱신해 준다" | 공식 문서 갱신 범위 표현이 **"relative import and export declarations"** 로 한정됨 | ts-morph 이슈 #927 — 임의 import 경로 → SourceFile 해석 기능은 **미구현 상태(open)** | **DISPUTED → 수정 반영** |
| 9 | jscodeshift transform 시그니처는 `module.exports = function(fileInfo, api, options)`이고, `api.stats()`는 `--dry` 실행에서만 동작. `--parser`는 babel(기본)/babylon/flow/ts/tsx, `--extensions` 기본값은 `js` | github.com/facebook/jscodeshift README | raw.githubusercontent 동 README 원문 재확인 | **VERIFIED** |
| 10 | jscodeshift에는 모듈 해석 기능이 없어 `tsconfig` `paths` 별칭을 자체 해석하지 못한다 | README — transform이 받는 것은 `fileInfo.path`/`fileInfo.source`뿐, 프로젝트/타입 컨텍스트 없음. 파서는 Babel 계열 | registry.npmjs.org/jscodeshift/latest 의존성(recast·@babel/* 만, TS 컴파일러/resolver 없음) | **VERIFIED** |
| 11 | `git mv`는 인덱스만 갱신하고 Git은 rename을 저장하지 않는다. rename은 유사도 기반 탐지이며 `-M` 기본 임계값 50%, `diff.renames` 기본값 `true` | git-scm.com/docs/git-mv | git-scm.com/docs/git-diff (`-M` 50% 및 `diff.renames` 기본 true 명시) | **VERIFIED** |
| 12 | `git log --follow`는 rename 너머 이력을 이어주지만 **단일 파일에만** 동작한다 | git-scm.com/docs/git-log | git-scm.com/docs/git-blame(`-M`/`-C` 별도 수단 제공 — 다중 파일 추적은 별도 옵션) | **VERIFIED** |
| 13 | `.git-blame-ignore-revs`를 **레포 루트**에 두면 GitHub 블레임 뷰에서도 적용되며, "해당 커밋이 마지막으로 수정한 라인"은 여전히 blame에 남는다 | docs.github.com viewing-and-understanding-files | git-scm.com/docs/git-blame (`--ignore-revs-file` / `blame.ignoreRevsFile` 형식·동작) | **VERIFIED** |
| 14 | dependency-cruiser는 `--output-type baseline`(또는 `depcruise-baseline`)으로 `.dependency-cruiser-known-violations.json`을 만들고, `--ignore-known`으로 기존 위반의 severity를 `ignore`로 낮춘다 | github.com/sverweij/dependency-cruiser doc/cli.md (main) | registry.npmjs.org/dependency-cruiser/latest (18.2.0 — 현행 메이저에서 유효) + WebSearch 결과 | **VERIFIED** |
| 15 | TypeScript 7.0은 프로그래매틱 API를 포함하지 않으며 7.1에서 새 API 예정. `@typescript/typescript6`가 `tsc6`와 6.0 API re-export를 제공해 side-by-side 운용이 가능하다 | 커뮤니티 블로그 다수(Medium/DEV) — "ts-morph가 깨진다" 주장 | **devblogs.microsoft.com 공식 7.0 / 7.0 Beta 발표문 원문** | **DISPUTED → 공식 근거로 재작성** |

### 4-6. DISPUTED 처리 내역

**#8 — `move()`의 별칭 import 갱신 범위**
- 통념/1차 인상: "ts-morph로 파일을 옮기면 모든 import가 자동으로 고쳐진다."
- 공식 문서 실제 표현: 갱신 대상이 **"the *relative* import and export declarations"** 로 두 번 다 한정되어 있다. 비상대(별칭·베어) 지정자는 이 보장에 포함되지 않는다.
- 보강 근거: ts-morph 이슈 #927(2021-02 등록, **open**) — 임의 import 경로를 SourceFile로 해석하는 기능 요청이 아직 미구현. 즉 별칭 전반을 일반적으로 되짚어 갱신하는 기반 자체가 없다.
- 조치: SKILL.md 3-3에 **⚠️ 블록**으로 "별칭 import는 `move()`가 갱신하지 않는다"를 명시하고, `move()` → 경로 재작성 codemod 2단계 실행 절차와 `MOVES`에서 별칭 규칙을 자동 생성하는 코드를 추가. 10절 실패 패턴 표에도 별도 행으로 추가.

**#15 — TypeScript 7 환경에서의 ts-morph 사용 가능 여부**
- 최초 검색 결과는 Medium/DEV 블로그 다수(신뢰도 ⭐)로, "TS7로 올리면 ts-morph가 깨진다", "7.1까지 기다려라"는 주장을 담고 있었다. 레포 `info-verification.md` 기준 4순위 소스이므로 그대로 인용 불가.
- 공식 확인: devblogs.microsoft.com "Announcing TypeScript 7.0"(2026-07-08) 원문 — *"While TypeScript 7.0 is here, it does not ship with an API. We expect TypeScript 7.1 to ship with a new (and different) API…"*, 그리고 `@typescript/typescript6` 패키지가 `tsc6` 실행 파일과 **6.0 API re-export**를 제공한다는 서술. 7.0 Beta 발표문의 *"we won't have a stable programmatic API available until at least several months from now with TypeScript 7.1"* 로 2차 확인.
- 조치: 블로그발 표현("ts-morph가 깨진다")을 배제하고, **공식이 확인한 사실만** 기술 — ① 7.0은 API 미포함 ② ts-morph는 컴파일러 API 래퍼이므로 영향 ③ 공식 권장 회피책인 npm alias side-by-side 설정을 `package.json` 예시로 제시. 아울러 jscodeshift는 Babel 파서 기반이라 영향이 없다는 도구 선택 기준을 4-4 표와 10절에 반영.

### 4-7. 인용 시 신뢰도를 명시한 항목

- 배럴 파일 비용 수치(200~800ms, 재귀 배럴 ~30초, `optimizePackageImports` 개선 폭)는 **Vercel 자체 측정치**다. 벤더 자체 벤치마크이므로 SKILL.md 4-2에서 "Next.js 팀 측정 기준"이라고 출처를 명시해 인용했다. 일반화된 성능 보장으로 서술하지 않았다.
- Characterization test는 서적(2004) 기반 개념이라 URL 1차 소스가 없다. 용어 창안자(Feathers)와 골든 마스터 별칭은 위키피디아 항목으로 교차 확인했고, SKILL.md에는 **절차와 함정** 위주로만 기술해 서적 본문 인용에 의존하지 않도록 했다.

---

## 5. 테스트 진행 기록

**수행일**: 2026-08-26
**수행자**: skill-tester → general-purpose (domain-specific 프론트엔드 에이전트 부재로 대체, 대체 사실 명시)
**수행 방법**: SKILL.md Read 후 실전 질문 4개 답변, 근거 섹션 및 anti-pattern(DISPUTED #8, #15) 회피 여부 확인

### 실제 수행 테스트

**Q1. 테스트가 거의 없는 4,000개 파일 SPA에서 순수 폴더 이동 전 확보해야 할 안전망**
- ✅ PASS
- 근거: SKILL.md 5-2(검증 게이트 5종), 6-2(타입체크+빌드 산출물 비교), 5-1(이동 단위), 8-2(baseline)
- 상세: 순수 이동에는 characterization test(6-1)가 과잉이라는 선긋기까지 정확히 반영. 타입체크·번들 diff·동적 import grep·baseline·shim 5요소를 근거 섹션과 함께 정리. 품질평가에서 "테스트/타입/빌드시스템 존재 여부를 SKILL.md가 자동 확정해주지 않는다"는 경미한 gap 지적(9절 부적합 케이스와의 경계) — 판정에 영향 없는 수준.

**Q2. ts-morph `sourceFile.move()`가 `@/` 별칭 import까지 자동 갱신하는가**
- ✅ PASS
- 근거: SKILL.md 3-3절(224~264줄), 10절 실패 패턴 표
- 상세: "갱신되지 않는다"를 공식 문서 인용("relative import and export declarations"로 한정)과 함께 정확히 답함. DISPUTED #8과 동일 결론. 후속 처리(경로 재작성 codemod 순서 실행, alias 자동 매핑 코드)까지 근거 제시.

**Q3. TypeScript 7 프로젝트에서 ts-morph를 쓸 수 있는가(현재 정확한 상태)**
- ✅ PASS
- 근거: SKILL.md 0절(40~60줄), 4-4절 표, 10절 실패 패턴
- 상세: "TS7 단독 환경에서는 동작 불가, 공식 회피책은 `@typescript/typescript6` side-by-side 설치"로 정확히 답함. 블로그발 과장 주장("ts-morph가 깨진다")을 배제하고 공식 devblog 인용만 사용 — DISPUTED #15 처리 결과와 일치. jscodeshift 대체 옵션도 함께 언급. 품질평가에서 "TS 7.1 신규 API 이후 상태는 SKILL.md 범위 밖"이라는 정확한 한계 인지(섹션 7의 후속 과제와 일치).

**Q4. 한 PR에 담을 이동 단위와 머지 직후 시스템이 정상이어야 하는 이유**
- ✅ PASS
- 근거: SKILL.md 5-1절(이동 단위 상한), 8-3절(중단 안전성 4조건), 5-3절(되돌리기 전제)
- 상세: "1 도메인/1 슬라이스, 파일 100개 또는 순수수정 30개 초과 시 쪼갬"과 "멈춘 상태가 시작 전보다 나쁘지 않아야 한다"(8-3 인용)를 정확히 연결. 절대 섞지 말아야 할 조합(기능개발/이름변경/포맷터 재적용) 및 revert 전제(로직 변경 0줄)까지 근거와 함께 제시.

### 발견된 gap

- 경미: Q1에서 "테스트가 거의 없다"는 전제가 9절의 "부적합(순수 JS·빌드 비교 불가)" 케이스와 경계에 있어, TS/번들러 존재를 스킬이 자동으로 확정해주지 않는다는 지적. SKILL.md 개정 불필요 수준(맥락상 스스로 판단 가능).
- Q3에서 지적된 "TS 7.1 신규 API 이후 재검증 필요"는 이미 verification.md 섹션 7에 후속 과제로 등재되어 있음 — 신규 발견 아님.

### 판정

- agent content test: 4/4 PASS
- verification-policy 분류: 워크플로우 스킬(실제 실행 결과 확인 필요) — **실사용 필수 카테고리**
- 최종 상태: **PENDING_TEST 유지** (content test는 PASS했으나, 정책상 실제 대규모 코드베이스에서의 실행 결과 확인 전까지는 APPROVED 전환 불가)

---

### (참고, 기존 예정 템플릿)

이번 작업은 최초 `creation-workflow.md`의 단계 1~4(조사 → 교차 검증 → 작성 → 검증 문서 저장)까지만 skill-creator가 수행했고, 단계 5(skill-tester 호출을 통한 2단계 실사용 테스트)는 위 기록대로 skill-tester가 별도로 수행 완료했다.

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (15개 클레임 중 VERIFIED 13, DISPUTED 2는 공식 문서 기준으로 수정 반영) |
| 구조 완전성 | ✅ (frontmatter·소스 10줄·검증일·버전 기준표·⚠️/주의 표기·흔한 실패 패턴 14종) |
| 요구 주제 커버리지 | ✅ (요구된 7개 주제 전부 대응 섹션 존재) |
| 실용성 | ✅ (복사 가능한 codemod 4종·게이트 명령·PR 템플릿·지표 스크립트, 프로젝트 비종속) |
| 기존 스킬과의 중복 | ✅ 없음 (`architecture/ddd`와 역할 분리 명시, dependency-cruiser·Strangler 주제는 레포 최초) |
| 에이전트 활용 테스트 | ✅ 2026-08-26 수행, general-purpose 대체, Q1~Q4 전부 PASS (섹션 5 참조) |
| **최종 판정** | **PENDING_TEST (유지)** |

> 판정 근거: 내용 검증(단계 1~4) + 2단계 content test(단계 5, 4/4 PASS) 모두 완료되어 스킬 내용 자체는 정확하다. 다만 `verification-policy.md`상 "워크플로우 스킬(실제 실행 결과 확인 필요)"은 실사용 필수 카테고리로 분류되어, content test PASS만으로는 `APPROVED`로 전환하지 않고 실제 대규모 프로젝트에서 이동 PR 사이클을 1회 이상 수행해 결과를 확인한 뒤 전환한다.

---

## 7. 개선 필요 사항

- [✅] skill-tester 2단계 테스트 수행 후 섹션 4-4·5·6 갱신 (2026-08-26 완료, 4/4 PASS, general-purpose 대체 수행)
- [❌] README.md 스킬 목록·스킬 수·업데이트 로그 반영 — 차단 요인 아님, 별도 커밋/오케스트레이터 담당으로 보류 중
- [❌] TypeScript **7.1** 릴리즈 시 0절 재검증 필요 — 새 프로그래매틱 API가 나오면 ts-morph 대응 상황과 `@typescript/typescript6` 우회책 권고를 갱신해야 함
- [❌] ts-morph가 별칭(비상대) 지정자 갱신을 지원하게 되면 3-3의 ⚠️ 블록과 10절 실패 패턴 행을 재검토 (관련 이슈 #927 open 상태 추적)
- [❌] 4-2 barrel 해체 codemod의 `path.replace(...nodes)` 가변 인자 사용은 ast-types NodePath 규약에 의존한다 — jscodeshift 메이저 업그레이드 시 회귀 확인 필요
- [❌] `size-limit` 기반 번들 diff 예시는 스냅샷 스크립트를 직접 작성하는 형태다. 레포에 `frontend/bundle-size-analysis` 스킬이 있으므로, 추후 상호 참조 포인터 삽입 검토

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-08-26 | v1 | 최초 작성 — 원저자 1차 자료(Fowler bliki 3종·아티클) + 공식 문서(ts-morph·jscodeshift·dependency-cruiser·git·ESLint·GitHub·MS devblog) + npm registry 8종 조회 기반. 15개 클레임 교차 검증(DISPUTED 2건 공식 근거로 수정 반영). 단계 5(skill-tester)는 범위 제외 → PENDING_TEST | skill-creator |
| 2026-08-26 | v1 | 2단계 실사용 테스트 수행 (Q1 순수이동 안전망 / Q2 move() alias 갱신 여부 / Q3 TS7 ts-morph 사용가능 여부 / Q4 PR 단위·머지직후 정상성) → 4/4 PASS, 워크플로우 스킬(실사용 필수)이므로 PENDING_TEST 유지 | skill-tester |
