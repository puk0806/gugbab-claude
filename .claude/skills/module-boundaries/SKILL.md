---
name: module-boundaries
description: 프론트엔드 코드베이스에서 도메인·레이어 간 의존 방향을 도구로 강제하는 방법 - dependency-cruiser, eslint-plugin-boundaries, import/no-restricted-paths, no-restricted-imports, TS project references, package exports, 순환 참조·barrel 관리, 점진 도입 전략
---

# 모듈 경계 강제 (Module Boundaries Enforcement)

> 소스: https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md
> 소스: https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md
> 소스: https://github.com/sverweij/dependency-cruiser/blob/main/doc/cli.md
> 소스: https://www.jsboundaries.dev/docs/ (eslint-plugin-boundaries 공식 문서) / https://github.com/javierbrea/eslint-plugin-boundaries/tree/v4.2.2 (ESLint 8 레거시)
> 소스: https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-restricted-paths.md
> 소스: https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-cycle.md
> 소스: https://eslint.org/docs/latest/rules/no-restricted-imports
> 소스: https://www.typescriptlang.org/docs/handbook/project-references.html
> 소스: https://nodejs.org/api/packages.html
> 검증일: 2026-09-26 (30~60일 주기 재검증, 최초 검증 2026-08-26)

폴더를 도메인별로 나누는 것만으로는 경계가 유지되지 않는다. **import 방향을 CI에서 실패시키지 않으면** 몇 달 안에 다시 뒤엉킨다. 이 스킬은 "규칙을 코드로 만들고 CI 게이트에 올리는" 절차를 다룬다.

> ESLint·Prettier·husky·lint-staged **기본 설정 자체**는 이 스킬에서 다루지 않는다 → `frontend/code-convention` 스킬(설치된 경우) 참조.
> 레이어 개념(Domain/Application/Infrastructure)의 **의미**는 `architecture/ddd` 스킬 참조. 이 스킬은 그 레이어를 **강제하는 도구** 쪽만 다룬다.

---

## 0. 기준 버전 (2026-09-26 재확인, 최초 확인 2026-08-26)

| 도구 | 최신 버전 | ESLint 호환 | Node 요구 | 비고 |
|------|-----------|-------------|-----------|------|
| `dependency-cruiser` | **18.4.0** (2026-08-26 확인 시 18.2.0 → 마이너 갱신) | 무관 (ESLint 비의존) | `^22 \|\| ^24 \|\| >=26` | v18에서 Node 20·25 지원 종료 |
| `eslint-plugin-boundaries` / `@boundaries/eslint-plugin` | **7.2.0** (변동 없음) | v5.0.0+ = **ESLint 9+ flat config** / ESLint 8·eslintrc는 **v4.2.2** | `>=18.18` | 패키지명이 `@boundaries/eslint-plugin`로 이관 중 |
| `eslint-plugin-import` | **2.32.0** | `^2 \|\| ... \|\| ^8 \|\| ^9` — **ESLint 10 미지원** | `>=4` | eslintrc·flat 양쪽 지원 |
| `eslint-plugin-import-x` | **4.17.1** | `^8.57 \|\| ^9 \|\| ^10` | `^18.18 \|\| ^20.9 \|\| >=21.1` | import 플러그인의 경량·고속 포크 |
| `eslint-import-resolver-typescript` | **4.4.5** | eslint 무관(peer optional) | `^16.17 \|\| >=18.6` | `import`/`import-x` 양쪽 지원 |
| `madge` | **8.0.0** | 무관 | `>=18` | 순환 탐지·그래프 보조 도구 |
| `eslint` | **10.11.0** (2026-08-26 확인 시 10.9.1 → 마이너 갱신) | — | `^20.19 \|\| ^22.13 \|\| >=24` | **v10에서 eslintrc 완전 제거** (변동 없음) |

> 주의: ESLint 10.0.0부터 `.eslintrc.*`·`.eslintignore`·`--no-eslintrc`·`--env`·`--resolve-plugins-relative-to` 등이 **제거**됐다. ESLint 8을 쓰는 프로젝트는 (a) 8에서 동작하는 조합으로 규칙을 먼저 켜고 (b) 9 → 10 마이그레이션 시 플러그인 조합을 재선정하는 2단계로 간다.

> 주의: `eslint-plugin-boundaries`(구 이름)와 `@boundaries/eslint-plugin`(신 이름) 모두 레지스트리에 7.2.0이 존재한다. 공식 마이그레이션 안내는 "v7부터 스코프 패키지만 발행"이라고 하지만 구 이름도 7.2.0이 게시돼 있고 deprecate 표시가 없다 → **신규 도입은 `@boundaries/eslint-plugin`을 쓰되, import 식별자·룰 접두사는 그대로 `boundaries/`다.**

---

## 1. 도구 선택 — 무엇을 언제 쓰나

```
경계를 강제하고 싶다
├─ 레이어/도메인 그래프 전체를 규칙화 + 순환·고아 모듈까지 잡고 싶다
│  └─ dependency-cruiser (별도 CLI, CI 게이트)   ← 강제력 최상
│
├─ 에디터에서 즉시 빨간 줄이 떠야 한다 (개발자 피드백 루프)
│  ├─ 규칙이 "레이어 N개 × 허용 매트릭스"로 복잡  → eslint-plugin-boundaries
│  ├─ 규칙이 "폴더 A는 폴더 B를 못 본다" 수준     → import/no-restricted-paths
│  └─ 규칙이 "이 패키지/경로 문자열 금지" 수준     → no-restricted-imports (플러그인 0개)
│
└─ 물리적으로 접근 자체를 막고 싶다 (모노레포)
   └─ package.json exports + TS project references  ← 강제력 = 빌드 실패
```

| 방식 | 강제 지점 | 강제력 | 성능 부담 | 한계 |
|------|-----------|--------|-----------|------|
| `no-restricted-imports` (ESLint 코어) | 에디터·CI | 중 | 거의 없음 | **정적 import 문자열만**. 동적 `import()` 미검사, 상대경로(`../../`) 우회 취약 |
| `import/no-restricted-paths` | 에디터·CI | 중상 | 중 (모듈 해석 필요) | zone(target/from) 단순 구조라 매트릭스가 커지면 관리 난이도 급증 |
| `import/no-cycle` | 에디터·CI | 상(순환 한정) | **높음** (그래프 탐색) | 순환 전용. 대형 레포에서 린트 시간 급증 |
| `eslint-plugin-boundaries` | 에디터·CI | 상 | 중 | 설정 학습 곡선. 플러그인 메이저마다 API 변화 큼 |
| `dependency-cruiser` | CI(별도 명령) | **최상** | 낮음(캐시 O) | 에디터 실시간 피드백 없음 |
| `exports` + project references | **빌드/런타임** | **최상** | 없음 | 패키지 단위에서만 유효(같은 패키지 내부 경계는 못 막음) |

**권장 조합:** `dependency-cruiser`(전체 그래프·순환·고아 + CI 게이트) + ESLint 계열 1종(에디터 피드백) + 모노레포면 `exports`로 물리 차단. 셋은 **경쟁이 아니라 계층**이다.

---

## 2. dependency-cruiser

### 2-1. 설치·초기화

```bash
npm install --save-dev dependency-cruiser
npx depcruise --init          # 대화형으로 .dependency-cruiser.js 생성
```

`--init`은 대부분 프로젝트에 유효한 기본 규칙(순환 참조, package.json 미선언 의존, orphan, 프로덕션 코드의 devDependencies 사용 등)을 넣어준다. **여기서 시작해 레이어 규칙만 추가하는 것이 가장 빠르다.**

### 2-2. 설정 파일 구조

```js
// .dependency-cruiser.js
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [ /* 금지 규칙 — 위반마다 개별 에러 */ ],
  allowed:   [ /* 화이트리스트 — 여기 없는 의존은 not-in-allowed */ ],
  required:  [ /* 특정 모듈이 반드시 의존해야 하는 대상 */ ],
  options:   { /* 해석·필터·리포터 설정 */ },
};
```

- `forbidden`: 규칙마다 `name`·`comment`·`severity`(`error`/`warn`/`info`/`ignore`)·`from`·`to`.
- `allowed`: 화이트리스트. 위반 시 `not-in-allowed` 메시지가 나가고 심각도는 `allowedSeverity`(기본 `warn`)로 조정.
- `required`: `module`(대상 선택) + `to`(반드시 있어야 할 의존). 예: `*-controller.ts`는 반드시 base-controller에 의존.

### 2-3. forbidden 규칙 작성법

```js
// .dependency-cruiser.js (forbidden 발췌)
forbidden: [
  // (1) 레이어 역방향 금지 — 안쪽 레이어가 바깥을 참조하면 에러
  {
    name: 'no-upward-layer-dep',
    comment: 'shared/entities는 상위 레이어(features/app)를 알아선 안 된다',
    severity: 'error',
    from: { path: '^src/(shared|entities)/' },
    to:   { path: '^src/(features|widgets|app)/' },
  },
  {
    name: 'features-not-into-app',
    severity: 'error',
    from: { path: '^src/features/' },
    to:   { path: '^src/app/' },
  },

  // (2) 도메인(슬라이스) 간 횡단 금지 — $1 역참조로 "자기 자신"만 예외
  {
    name: 'cross-feature-must-use-public-api',
    comment: '다른 feature는 그 feature의 index.ts(공개 API)로만 접근한다',
    severity: 'error',
    from: { path: '^src/features/([^/]+)/' },
    to: {
      path: '^src/features/([^/]+)/',
      // $1 = from.path의 첫 캡처그룹(=자기 feature 이름)
      pathNot: '^src/features/($1/|[^/]+/index[.]ts$)',
    },
  },

  // (3) 순환 참조 금지
  {
    name: 'no-circular',
    severity: 'error',
    from: {},
    to: { circular: true },
  },

  // (4) 고아 모듈(들어오는·나가는 의존이 모두 없는 파일) 감지
  {
    name: 'no-orphans',
    comment: '아무도 안 쓰는 잔여 파일 — 삭제하거나 연결하라',
    severity: 'warn',
    from: {
      orphan: true,
      pathNot: [
        '(^|/)[.][^/]+[.](js|cjs|mjs|ts|mts|cts|json)$', // 닷파일
        '[.]d[.]ts$',                                    // 타입 선언
        '(^|/)tsconfig[.]json$',
        '(^|/)(babel|webpack|vite|next)[.]config[.](js|cjs|mjs|ts|json)$',
      ],
    },
    to: {},
  },

  // (5) 테스트 코드가 프로덕션 코드에 섞여 들어가는 것 차단
  {
    name: 'not-to-test',
    severity: 'error',
    from: { path: '^src/', pathNot: '[.](spec|test)[.](ts|tsx)$' },
    to:   { path: '[.](spec|test)[.](ts|tsx)$' },
  },
],
```

**`from`/`to`에서 자주 쓰는 조건 (전부 공식 rules-reference 기준):**

| 조건 | 의미 |
|------|------|
| `path` / `pathNot` | **정규식**(글롭 아님). 경로 구분자는 항상 `/`. 문자열 또는 문자열 배열 |
| `circular` | 순환에 참여하는 의존. `via`/`viaOnly`로 경유 모듈 제한 |
| `orphan` | 들어오고 나가는 의존이 모두 없는 모듈. **`orphan`이 있으면 `to`는 무시된다** |
| `couldNotResolve` | 해석 실패(존재하지 않는 모듈) |
| `dependencyTypes` / `dependencyTypesNot` | `local`·`npm`·`npm-dev`·`core` 등 의존 종류 |
| `dynamic` | `import()` 동적 의존 여부 |
| `exoticallyRequired` / `exoticRequire` | `require` 래퍼 함수를 통한 의존 |
| `reachable` | (간접 포함) 도달 가능 여부 — 데드코드·전이 의존 차단에 사용 |
| `preCompilationOnly` | 컴파일 후 사라지는 타입 전용 의존 (`tsPreCompilationDeps: 'specify'` 필요) |
| `moreUnstable` | 자신보다 불안정한 모듈에 의존(SDP 위반) |
| `numberOfDependentsMoreThan` / `numberOfDependentsLessThan` | 피의존 수 기준 |

> `from.path`의 캡처그룹은 `to.path`/`to.pathNot`에서 `$1`, `$2`로 역참조된다. "형제 폴더끼리 서로 못 본다" 규칙의 핵심 문법이다.

### 2-4. TypeScript path alias · 모노레포 해석 설정

```js
// .dependency-cruiser.js (options 발췌)
options: {
  doNotFollow: { path: 'node_modules' },     // 보이되 더 파고들지 않음
  exclude: { path: '^(coverage|dist|[.]next)/' },
  includeOnly: '^(src|apps|packages)/',

  // TS path alias(@/*, @app/* 등) 해석 — 이게 없으면 alias import가 전부 미해석 처리된다
  tsConfig: { fileName: 'tsconfig.json' },
  tsPreCompilationDeps: true,                // 타입 전용 import도 그래프에 포함
                                             // 'specify'로 두면 preCompilationOnly 조건 사용 가능

  enhancedResolveOptions: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    mainFields: ['module', 'main', 'types', 'typings'],
    exportsFields: ['exports'],              // package.json exports 존중
    conditionNames: ['import', 'require', 'types', 'default'],
  },

  // 모노레포: 조상 package.json들의 의존을 합쳐서 판단
  combinedDependencies: true,

  cache: { folder: 'node_modules/.cache/dependency-cruiser', strategy: 'metadata' },

  reporterOptions: {
    archi: { collapsePattern: '^(packages|src)/[^/]+' },
  },
},
```

- 웹팩 프로젝트라면 `webpackConfig: { fileName: 'webpack.config.js' }`로 `resolve` 설정을 그대로 가져올 수 있다.
- `tsConfig`를 지정하지 않으면 alias import가 `couldNotResolve`로 잡혀 **규칙이 조용히 무력화**된다. 도입 직후 반드시 `--output-type err-long`으로 미해석 경고가 없는지 확인한다.
- v18은 TS 경로 해석에 enhanced-resolve의 내장 tsconfig 기능을 쓴다(구 `tsconfig-paths-webpack-plugin` 대체). 17 이하에서 올라올 때 alias 해석 결과가 미세하게 달라질 수 있으므로 업그레이드 직후 위반 수를 비교한다.

### 2-5. CI 연동과 그래프 시각화

```bash
# 검증 (v13+ 부터 --config 생략 가능. 구버전 문서의 --validate 는 --config 의 별칭)
npx depcruise src --output-type err-long

# 캐시 사용 (반복 실행 빠름)
npx depcruise src --cache

# PR 범위만 검사: 기준 리비전 이후 변경 모듈 + 그 의존자
npx depcruise src --affected main --output-type err-long

# 그래프 (GraphViz 필요)
npx depcruise src --include-only "^src" --output-type dot | dot -T svg > docs/dependency-graph.svg
# 상위 구조만 (폴더 단위로 접기)
npx depcruise src --output-type archi | dot -T svg > docs/architecture.svg
# GitHub/GitLab에 그대로 붙는 mermaid
npx depcruise src --output-type mermaid
# PR 코멘트용 리포트
npx depcruise src --output-type markdown
```

- **종료 코드 = error 심각도 위반 개수** → CI에서 그대로 게이트로 쓸 수 있다.
- 조사용 플래그: `--focus <regex>`(해당 모듈과 직접 이웃), `--reaches <regex>`(그 모듈에 도달하는 모든 것).

```yaml
# .github/workflows/architecture.yml
name: Architecture
on: [push, pull_request]
jobs:
  boundaries:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }          # --affected 쓸 거면 필수
      - uses: actions/setup-node@v4
        with: { node-version: 22 }        # dependency-cruiser 18은 Node 22+ 필요
      - run: npm ci
      - run: npx depcruise src --output-type err-long
```

```json
// package.json
{
  "scripts": {
    "dep:check": "depcruise src --output-type err-long",
    "dep:graph": "depcruise src --include-only ^src --output-type dot | dot -T svg > docs/dependency-graph.svg",
    "dep:baseline": "depcruise src --output-type baseline --output-to .dependency-cruiser-known-violations.json"
  }
}
```

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
