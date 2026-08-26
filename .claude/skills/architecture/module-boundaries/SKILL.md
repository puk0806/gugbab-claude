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
> 검증일: 2026-08-26

폴더를 도메인별로 나누는 것만으로는 경계가 유지되지 않는다. **import 방향을 CI에서 실패시키지 않으면** 몇 달 안에 다시 뒤엉킨다. 이 스킬은 "규칙을 코드로 만들고 CI 게이트에 올리는" 절차를 다룬다.

> ESLint·Prettier·husky·lint-staged **기본 설정 자체**는 이 스킬에서 다루지 않는다 → `frontend/code-convention` 스킬 참조.
> 레이어 개념(Domain/Application/Infrastructure)의 **의미**는 `architecture/ddd` 스킬 참조. 이 스킬은 그 레이어를 **강제하는 도구** 쪽만 다룬다.

---

## 0. 기준 버전 (2026-08-26 확인)

| 도구 | 최신 버전 | ESLint 호환 | Node 요구 | 비고 |
|------|-----------|-------------|-----------|------|
| `dependency-cruiser` | **18.2.0** | 무관 (ESLint 비의존) | `^22 \|\| ^24 \|\| >=26` | v18에서 Node 20·25 지원 종료 |
| `eslint-plugin-boundaries` / `@boundaries/eslint-plugin` | **7.2.0** | v5.0.0+ = **ESLint 9+ flat config** / ESLint 8·eslintrc는 **v4.2.2** | `>=18.18` | 패키지명이 `@boundaries/eslint-plugin`로 이관 중 |
| `eslint-plugin-import` | **2.32.0** | `^2 \|\| ... \|\| ^8 \|\| ^9` — **ESLint 10 미지원** | `>=4` | eslintrc·flat 양쪽 지원 |
| `eslint-plugin-import-x` | **4.17.1** | `^8.57 \|\| ^9 \|\| ^10` | `^18.18 \|\| ^20.9 \|\| >=21.1` | import 플러그인의 경량·고속 포크 |
| `eslint-import-resolver-typescript` | **4.4.5** | eslint 무관(peer optional) | `^16.17 \|\| >=18.6` | `import`/`import-x` 양쪽 지원 |
| `madge` | **8.0.0** | 무관 | `>=18` | 순환 탐지·그래프 보조 도구 |
| `eslint` | **10.9.1** | — | `^20.19 \|\| ^22.13 \|\| >=24` | **v10에서 eslintrc 완전 제거** |

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

## 3. ESLint로 강제하기

> 세 방식은 **강제력·표현력·비용**이 다르다. 하나만 고르지 말고, 아래 3-1의 기준으로 조합한다.

### 3-1. 세 방식 비교와 선택 기준

| 항목 | `no-restricted-imports` | `import/no-restricted-paths` | `eslint-plugin-boundaries` |
|------|------------------------|------------------------------|----------------------------|
| 설치 | **불필요**(코어 룰) | `eslint-plugin-import`(또는 `-import-x`) | `@boundaries/eslint-plugin` |
| 판정 기준 | import **문자열** 패턴 | **파일 경로 zone**(디렉터리/글롭) | **엘리먼트 타입 그래프**(정책 매트릭스) |
| 상대경로 우회 | ❌ 뚫린다(`../../server/x`) | ✅ 경로 기준이라 막힌다 | ✅ 막힌다 |
| 동적 `import()` | ❌ 미검사(정적 import 전용) | 제한적 | 제한적 |
| 규칙 N×N 확장성 | 낮음 | 중간(zone 폭증) | **높음**(type 매트릭스) |
| 성능 | 매우 저렴 | 모듈 해석 비용 | 중간 |
| 도입 난도 | 즉시 | 낮음 | 중간(설정 학습 필요) |

**선택 기준**
- 레이어가 3개 이하 + 규칙 5개 이하 → `no-restricted-imports`(+ 상대경로 금지 규칙 병행)로 충분.
- "client는 server를 못 본다" 같은 **디렉터리 대 디렉터리** → `import/no-restricted-paths`.
- 레이어 4개 이상 + 도메인 슬라이스별 공개 API까지 강제 → `eslint-plugin-boundaries`.
- 어느 쪽을 골라도 **전체 그래프·순환·고아는 dependency-cruiser로 별도 게이트**를 둔다.

### 3-2. `no-restricted-imports` (플러그인 0개)

```js
// flat config (ESLint 9+) — eslint.config.js
export default [
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/features/*', '@/app/*', '../features/*', '../../features/*'],
            message: 'shared는 상위 레이어(features/app)를 import할 수 없습니다.',
          },
        ],
      }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            // 다른 feature의 내부 파일 직접 접근 금지 (index만 허용)
            group: ['@/features/*/**', '!@/features/*/index'],
            message: 'feature 내부 파일 직접 import 금지 — 공개 API(index.ts)를 사용하세요.',
          },
        ],
      }],
    },
  },
];
```

```js
// legacy (.eslintrc.js, ESLint 8)
module.exports = {
  overrides: [
    {
      files: ['src/shared/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [{
            group: ['@/features/*', '@/app/*'],
            message: 'shared는 상위 레이어를 import할 수 없습니다.',
          }],
        }],
      },
    },
  ],
};
```

- `patterns[].group`은 **gitignore 스타일**(`!` 부정 지원), `regex`로 정규식 지정도 가능. `importNames`/`allowImportNames`/`importNamePattern`/`allowImportNamePattern`으로 **특정 export만** 막을 수도 있다. `paths`는 모듈명 완전일치용.
- 이 룰은 **정적 import 전용**이다. 동적 `import()`는 잡히지 않는다.
- 타입 전용 import만 예외로 허용하려면 `allowTypeImports: true`가 필요하다. ESLint 8에서는 `@typescript-eslint/no-restricted-imports`를 써야 하고, **ESLint 9.37.0부터는 코어 룰이 TS import 문법을 지원해 해당 확장 룰이 deprecated**됐다.

> 주의: 이 룰은 문자열 매칭이라 `../../features/x`처럼 상대경로로 우회된다. 반드시 `import/no-relative-parent-imports` 또는 alias 강제 규칙과 함께 쓰거나, 경로 기반 도구(3-3·3-4)로 승격한다.

### 3-3. `import/no-restricted-paths` + `import/no-cycle`

```js
// flat config (ESLint 9) — eslint.config.js
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    files: ['**/*.{ts,tsx}'],
    extends: [importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],
    settings: {
      'import/resolver': { typescript: true, node: true },
    },
    rules: {
      'import/no-restricted-paths': ['error', {
        basePath: './src',
        zones: [
          // 하위 레이어가 상위 레이어를 못 본다
          { target: './shared',   from: ['./features', './widgets', './app'],
            message: 'shared는 상위 레이어를 참조할 수 없습니다.' },
          { target: './entities', from: ['./features', './widgets', './app'] },
          { target: './features', from: './app' },

          // feature 간 횡단 차단 (glob) — 자기 자신 제외, 공개 API만 허용
          { target: './features/!(auth)/**/*',
            from:   './features/auth/**/*',
            except: ['./features/auth/index.ts'],
            message: 'feature 내부에 직접 접근하지 말고 index.ts를 통하세요.' },
        ],
      }],
      'import/no-cycle': ['error', { maxDepth: 3, ignoreExternal: true }],
      'import/no-self-import': 'error',
    },
  },
);
```

```js
// legacy (.eslintrc.js, ESLint 8)
module.exports = {
  extends: ['eslint:recommended', 'plugin:import/recommended', 'plugin:import/typescript'],
  settings: {
    'import/resolver': { typescript: true, node: true },
  },
  rules: {
    'import/no-restricted-paths': ['error', {
      basePath: './src',
      zones: [
        { target: './shared', from: ['./features', './app'],
          message: 'shared는 상위 레이어를 참조할 수 없습니다.' },
        { target: './entities', from: ['./features', './app'] },
      ],
    }],
    'import/no-cycle': ['warn', { maxDepth: 1, ignoreExternal: true }],
  },
};
```

**zone 규칙 문법 요약**
- `target`: 제한을 받는 쪽(=import 하는 파일). 디렉터리 경로 또는 글롭, 배열 가능. 디렉터리를 주면 하위 전체에 재귀 적용.
- `from`: 금지되는 대상(=import 되는 쪽). 배열 가능하나 **디렉터리와 글롭을 섞을 수 없다**.
- `except`: `from`의 예외. `from`이 글롭이면 `except`도 글롭이어야 하고, 디렉터리면 `from` 기준 상대경로이며 상위로 못 올라간다.
- `basePath`: zone 경로 해석 기준(기본은 cwd).
- `message`: 위반 시 표시할 안내 문구 — **반드시 채운다**(무엇을 대신 쓰라는지 없으면 개발자가 disable로 도망간다).

**`import/no-cycle` 성능 주의**
- 공식 문서가 "비교적 계산 비용이 크다"고 명시하며, 린트 시간이 부담되면 켜지 않는 선택지도 제시한다.
- 대형 레포에서는 `maxDepth`(예: 1~3)·`ignoreExternal: true`로 시작한다.
- `allowUnsafeDynamicCyclicDependency`는 동적 import가 낀 순환을 눈감아주는 옵션 — 공식 문서도 "순환 의존은 **항상** 위험한 안티패턴"이라고 경고한다. 임시 완화용으로만.
- `disableScc: true`는 SCC 전처리(최적화)를 끄는 옵션. 기본값(false, 최적화 켬)을 유지하고 특정 레포에서 느릴 때만 실험한다.
- CI 전체 검사에서는 `import/no-cycle` 대신 **dependency-cruiser의 `no-circular`가 훨씬 빠르다.** 에디터 피드백이 꼭 필요할 때만 ESLint 쪽을 켠다.

> `eslint-plugin-import`는 peer 범위가 ESLint 9까지다. ESLint 10으로 갈 계획이면 동일 룰을 제공하는 `eslint-plugin-import-x`(4.17.1, peer `^8.57 || ^9 || ^10`)로 교체를 검토한다. 룰명 접두사만 `import-x/`로 바뀐다.

### 3-4. `eslint-plugin-boundaries`

**개념:** 파일 경로를 `boundaries/elements` 패턴으로 **엘리먼트(type)** 로 분류한 뒤, 타입 간 의존을 정책 매트릭스로 허용/금지한다. 경로가 아니라 "타입"으로 말하기 때문에 레이어가 늘어도 설정이 선형으로만 커진다.

#### (a) ESLint 9+ / flat config — v7 (`@boundaries/eslint-plugin` 7.2.0)

```bash
npm install --save-dev @boundaries/eslint-plugin
```

```js
// eslint.config.js
import boundaries from '@boundaries/eslint-plugin';

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'shared',  pattern: 'src/shared/*' },
        { type: 'entity',  pattern: 'src/entities/*' },
        { type: 'feature', pattern: 'src/features/*' },
        { type: 'widget',  pattern: 'src/widgets/*' },
        { type: 'app',     pattern: 'src/app/*' },
      ],
      'boundaries/files': [
        { pattern: '**/*.{spec,test}.{ts,tsx}', category: 'test' },
      ],
    },
    rules: {
      ...boundaries.configs.recommended.rules,
      'boundaries/dependencies': ['error', {
        default: 'disallow',
        rules: [
          { from: { element: { type: 'app' } },
            allow: { to: { element: { types: ['widget', 'feature', 'entity', 'shared'] } } } },
          { from: { element: { type: 'widget' } },
            allow: { to: { element: { types: ['feature', 'entity', 'shared'] } } } },
          { from: { element: { type: 'feature' } },
            allow: { to: { element: { types: ['entity', 'shared'] } } } },
          { from: { element: { type: 'entity' } },
            allow: { to: { element: { type: 'shared' } } } },
          // 프로덕션 코드가 테스트 파일을 참조하는 것 차단
          { disallow: { to: { file: { categories: 'test' } } } },
        ],
      }],
    },
  },
];
```

- 정책은 **순서대로 평가되고 마지막에 매칭된 정책이 결과를 결정**한다. 한 정책 안에서는 `disallow`가 `allow`보다 먼저 평가된다.
- 셀렉터: `element.type`/`element.types`/`element.captured`, `file.categories`, `dependency.kind`(`value`/`type`/`typeof`), 외부 모듈용 `module.origin`/`module.source`.
- 옵션: `default`(`allow`/`disallow`), `checkAllOrigins`, `checkUnknownLocals`, `checkInternals`, `message`.
- 프리셋: `recommended`(기존 프로젝트용, 일부 룰 off) / `strict`(신규 프로젝트) / `strictLegacy`(v6에서 올라오는 경우). `createConfig` 헬퍼로 타입 안전한 설정을 만들 수 있다.
- v7 룰 구성: `boundaries/dependencies`(대표), `boundaries/no-unknown-files`, `boundaries/no-unknown-dependencies`(구 `no-unknown`), `boundaries/no-ignored-dependencies`(구 `no-ignored`). **`element-types`·`entry-point`·`external`·`no-private`는 deprecated**(`element-types`는 `dependencies`의 별칭이며 경고 후 향후 메이저에서 제거 예정).
- `importKind`는 deprecated → `dependency.kind`를 쓴다.

> 주의: 공식 quick-start 예제는 정책 배열 키를 `policies:`로, 룰 레퍼런스 문서는 `rules:`로 표기해 **문서 간 불일치**가 있다. 위 예시는 룰 레퍼런스(`rules:`)를 따랐다. 실제 적용 시 설치한 버전의 타입 정의(`DependenciesRuleOptions`)로 키를 확인하라.

#### (b) ESLint 8 / `.eslintrc` — v4.2.2 (레거시 프로젝트는 이쪽)

공식 설치 문서: "Starting from version `5.0.0`, this plugin is compatible with ESLint **v9 and above**" — 즉 **ESLint 8 + eslintrc라면 v4.2.2로 고정**한다.

```bash
npm install --save-dev eslint-plugin-boundaries@4.2.2
```

```jsonc
// .eslintrc.json (ESLint 8)
{
  "plugins": ["boundaries"],
  "extends": ["plugin:boundaries/recommended"],
  "settings": {
    "import/resolver": { "typescript": { "alwaysTryTypes": true } },
    "boundaries/elements": [
      { "type": "shared",  "pattern": "src/shared/*",   "capture": ["elementName"] },
      { "type": "entity",  "pattern": "src/entities/*", "capture": ["elementName"] },
      { "type": "feature", "pattern": "src/features/*", "capture": ["elementName"] },
      { "type": "app",     "pattern": "src/app/*",      "capture": ["elementName"] }
    ],
    "boundaries/ignore": ["**/*.{spec,test}.{ts,tsx}"]
  },
  "rules": {
    "boundaries/element-types": [2, {
      "default": "disallow",
      "rules": [
        { "from": "app",     "allow": ["feature", "entity", "shared"] },
        { "from": "feature", "allow": ["entity", "shared"] },
        { "from": "entity",  "allow": ["shared"] },
        { "from": "shared",  "allow": ["shared"] }
      ]
    }],
    // 다른 엘리먼트는 index.ts 로만 진입 (공개 API 강제)
    "boundaries/entry-point": [2, {
      "default": "disallow",
      "rules": [{ "from": ["app", "feature", "entity", "shared"], "allow": ["index.ts"] }]
    }],
    // 레이어별 허용 외부 패키지 제한
    "boundaries/external": [2, {
      "default": "allow",
      "rules": [{ "from": "entity", "disallow": ["react", "react-dom", "next/*"] }]
    }],
    "boundaries/no-private": 2,
    "boundaries/no-unknown": 2,
    "boundaries/no-unknown-files": 0
  }
}
```

- `plugin:boundaries/recommended`는 **기존 코드의 점진 정리를 전제로 일부 엄격 룰을 끈 프리셋**, `plugin:boundaries/strict`는 전면 준수 프리셋이다. 레거시 코드베이스는 recommended로 시작한다.

**`boundaries/elements` 필드 (v4·v7 공통 개념)**

| 필드 | 의미 |
|------|------|
| `type` | 룰에서 참조할 엘리먼트 이름 |
| `pattern` | micromatch 패턴. 경로 **오른쪽부터** 점진적으로 매칭 시도 |
| `mode` | `folder`(기본) / `file` / `full` — 패턴이 폴더를 가리키는지 파일을 가리키는지 |
| `capture` | 경로에서 뽑아낼 이름들(`["family","elementName"]`). 룰과 메시지에서 참조 |
| `basePattern` / `baseCapture` | 루트부터 왼쪽 구간을 따로 매칭·캡처 (모노레포에서 `packages/*` 처리에 유용) |

`capture`를 쓰면 "같은 도메인끼리만 허용" 같은 규칙을 한 줄로 쓸 수 있다(v4: `${from.elementName}` 템플릿, v7: `{{ from.element.captured.elementName }}` 템플릿).

> 주의: v4 → v5(flat config 전환) → v6 → v7(패키지명·룰명 변경)로 **API 변화가 큰 플러그인**이다. 버전을 정확히 고정(`4.2.2` 등)하고, 업그레이드는 공식 마이그레이션 가이드를 따라 별도 작업으로 진행한다.

---

## 4. 경계를 물리적으로 만들기 — TS project references / package exports

ESLint·dependency-cruiser는 "검사"다. **모노레포에서는 애초에 접근이 불가능하게** 만들 수 있다.

### 4-1. package.json `exports` — 내부 경로 접근 차단

```jsonc
// packages/ui/package.json
{
  "name": "@acme/ui",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js", "default": "./dist/index.js" },
    "./button": { "types": "./dist/button/index.d.ts", "import": "./dist/button/index.js" },
    "./styles.css": "./dist/styles.css",
    "./internal/*": null          // 내부 경로 명시적 차단
  }
}
```

- `exports`가 정의되면 **여기 나열되지 않은 서브패스는 import 자체가 실패**한다(`ERR_PACKAGE_PATH_NOT_EXPORTED`). Node 공식 문서는 이를 "이 캡슐화가 모듈 작성자가 패키지의 공개 인터페이스를 명확히 정의하게 해준다"고 설명한다.
- 조건부 export는 **객체에 선언된 순서대로 매칭**되므로 `"types"`를 가장 먼저, `"default"`를 마지막에 둔다.
- 패턴 `"./features/*.js": "./src/features/*.js"`의 `*`는 단순 문자열 치환이며, `null` 타깃으로 특정 경로만 뚫린 구멍을 막을 수 있다.
- 타깃 경로는 `./`로 시작해야 하고 `..`·`node_modules` 경유가 금지된다.
- TypeScript가 `exports`를 존중하게 하려면 `"moduleResolution": "bundler"`(또는 `node16`/`nodenext`)여야 한다. 구 `"node"`면 무시되어 경계가 새어나간다.

### 4-2. package.json `imports` — 앱 내부 alias를 표준 문법으로

```jsonc
// apps/web/package.json
{
  "imports": {
    "#shared/*": "./src/shared/*.ts",
    "#entities/*": "./src/entities/*.ts"
  }
}
```

`#`로 시작하는 내부 specifier는 번들러·Node·TS가 공통으로 이해한다(공식 문서: `imports` 항목은 외부 패키지 지정자와 구분되도록 **항상 `#`로 시작해야 한다**). `tsconfig.paths`만으로 alias를 만들면 런타임·테스트 러너별로 설정을 복제해야 하지만, `imports`는 **한 곳에서 끝난다**. `exports`와 달리 외부 패키지로도 매핑할 수 있다.

### 4-3. TypeScript project references

```jsonc
// packages/feature-cart/tsconfig.json
{
  "compilerOptions": {
    "composite": true,          // 참조 대상이 되려면 필수 (declaration 자동 요구)
    "declaration": true,
    "declarationMap": true,     // 편집기에서 정의로 이동·rename이 경계를 넘어 동작
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../ui" },
    { "path": "../shared" }
    // entities를 참조하지 않았으므로 import 시 타입 에러
  ]
}
```

```bash
tsc -b            # 참조 그래프 순서대로 증분 빌드
tsc -b --dry      # 무엇이 빌드될지만 확인
tsc -b --clean    # 산출물 삭제
```

- 참조하지 않은 프로젝트는 **컴파일 단계에서 import 불가** → 경계가 "빌드 실패"로 강제된다. 공식 문서도 "참조한 프로젝트에서만 import할 수 있어 잘못된 결합과 순환을 막는다"고 설명한다.
- 참조 대상 import 시 소스가 아닌 **출력 `.d.ts`** 를 읽는다. 대형 composite 프로젝트에서 편집기가 느리면 `disableSourceOfProjectReferenceRedirect`를 검토한다.
- 테스트 프로젝트를 분리해 참조를 끊으면 "프로덕션 코드가 테스트 유틸을 import"하는 사고를 원천 차단한다.

### 4-4. `paths` alias 설계 원칙

```jsonc
// tsconfig.base.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*":   ["src/shared/*"],
      "@entities/*": ["src/entities/*"],
      "@features/*": ["src/features/*"]
    }
  }
}
```

- alias는 **레이어 단위로만** 만든다. `@utils/*`, `@components/*`처럼 성격 기반으로 만들면 레이어 규칙을 정규식/zone으로 표현할 수 없게 된다.
- alias 하나가 여러 물리 경로를 가리키게(`["src/a/*","src/b/*"]`) 하지 않는다 — 경계 도구가 해석을 못 하거나 우회로가 생긴다.
- alias를 도입하면 dependency-cruiser `tsConfig`와 ESLint `import/resolver: typescript`를 **동시에** 맞춰야 한다. 한쪽만 맞추면 규칙이 조용히 통과한다.

---

## 5. 순환 참조와 barrel file (index.ts)

### 5-1. barrel이 만드는 3가지 비용

| 비용 | 메커니즘 |
|------|----------|
| **순환 참조** | A가 배럴로 B를 가져오고 B도 같은 배럴을 가져오면 A↔B 사이클 → 런타임 `Cannot access 'X' before initialization` |
| **번들 비대·트리셰이킹 저해** | 배럴 하나를 import하면 배럴이 재export하는 모듈 전체가 그래프에 들어온다. 배럴 안 모듈 중 하나라도 **최상위 사이드이펙트**(`window.X = ...` 등)가 있으면 번들러가 나머지를 흔들어 떨어뜨리지 못한다 |
| **개발 서버·타입체크 지연** | 트리셰이킹은 프로덕션 최적화다. dev 서버는 흔들지 않으므로 배럴을 타는 순간 관련 모듈 전부를 로드·트랜스폼·평가한다. `tsc`/TS 서버도 불필요한 모듈을 더 본다 |

Next.js는 이 문제 때문에 `experimental.optimizePackageImports`(13.5 도입)로 **외부 패키지의 거대한 배럴**을 직접 경로 import로 자동 치환한다. 공식 블로그 기준: 일부 라이브러리는 import만으로 200~800ms 소요, 아이콘 계열은 엔트리 배럴에 최대 10,000개 재export, 적용 후 로컬 개발 15~70% 개선 / 프로덕션 빌드 약 28% 개선 / 서버리스 콜드 스타트 40% 개선.

> 주의: `optimizePackageImports`는 여전히 `experimental` 네임스페이스이고, 기본 최적화 목록(`lucide-react`, `date-fns`, `@mui/material`, `react-icons/*` 등)에 있는 **외부 패키지** 대상이다. **내 앱 안의 배럴은 이 옵션이 해결해주지 않는다.**

### 5-2. barrel을 쓸 때 / 쓰지 말아야 할 때

| 상황 | 판단 |
|------|------|
| 도메인 슬라이스/패키지의 **공개 API 1개**(`features/cart/index.ts`) | ✅ 쓴다. 경계 강제의 핵심 수단 |
| 배럴이 **재export만** 하고 사이드이펙트가 없다 | ✅ 허용 |
| `components/index.ts`처럼 수십~수백 개를 모으는 편의용 배럴 | ❌ 금지 |
| 같은 슬라이스 **내부**에서 자기 배럴을 import | ❌ 금지 (순환의 최대 원인) |
| 배럴이 다른 배럴을 재export(중첩 배럴) | ❌ 금지 |
| 아이콘·상수 등 대량 export 모듈 | ❌ 배럴 대신 직접 경로 import |

**원칙:** *배럴은 "밖에서 들어오는 문"으로만 쓴다. 안에서는 항상 직접 경로로 import한다.*

```ts
// ❌ features/cart/model/useCart.ts
import { CartItem } from '../index';       // 자기 슬라이스 배럴 → 순환

// ✅
import { CartItem } from './types';
```

배럴을 공개 API로 쓰기로 했다면 **강제**한다 — dependency-cruiser 2-3(2)번 규칙 또는 `boundaries/entry-point`(v4)로 "다른 슬라이스는 index로만" 을 규칙화한다. 강제되지 않는 배럴은 그냥 비용만 남는다.

### 5-3. 순환 탐지·해소 절차

```bash
# 1) 탐지 — 어떤 사이클이 있는지 목록화
npx depcruise src --output-type err-long          # no-circular 규칙 위반 출력
npx madge --circular --extensions ts,tsx src      # 보조 확인(madge 8.0.0)

# 2) 시각화 — 사이클 경로를 그림으로
npx depcruise src --include-only "^src" --output-type dot | dot -T svg > cycles.svg

# 3) 특정 모듈 주변만 좁혀 보기
npx depcruise src --focus "^src/features/cart" --output-type dot | dot -T svg > cart.svg
```

**해소 4수단 (위에서부터 시도)**
1. **배럴 우회**: 사이클이 배럴 경유면 직접 경로 import로 바꿔 끊는다(대부분 여기서 해결).
2. **타입만 분리**: 값이 아니라 타입 때문이라면 `import type`으로 바꾸고 타입을 `types.ts`로 추출한다. (dependency-cruiser `tsPreCompilationDeps: 'specify'` + `preCompilationOnly` 조건으로 "타입만 허용"을 규칙화할 수 있다)
3. **공통 추출**: 양쪽이 쓰는 것을 하위 레이어(`shared`/`entities`)로 내린다.
4. **의존 역전**: 상위가 콜백/인터페이스를 주입하도록 바꿔 방향을 한쪽으로 정리한다.

> 동적 `import()`로 사이클을 숨기는 것은 해소가 아니다. 초기화 순서 버그를 런타임으로 미루는 것뿐이다.

---

## 6. 점진 도입 전략 — 기존 위반이 수백 건일 때

**핵심: 첫날 목표는 "위반 0"이 아니라 "신규 위반 0"이다.**

### 6-1. 1단계 — 현황 측정 (규칙은 아직 error로 켜지 않는다)

```bash
npx depcruise --init
npx depcruise src --output-type err-long | tail -5     # 위반 총계 파악
npx depcruise src --output-type markdown > docs/architecture-debt.md
```

### 6-2. 2단계 — baseline(기지선) 고정

```bash
# 현재 위반 전체를 known-violations 파일로 스냅샷
npx depcruise src --output-type baseline --output-to .dependency-cruiser-known-violations.json

# 이후 CI는 "알려진 위반"을 무시하고 신규 위반만 실패시킨다
npx depcruise src --ignore-known
```

- `--ignore-known`의 기본 파일명은 `.dependency-cruiser-known-violations.json`. 다른 경로면 `--ignore-known <path>`.
- 동일 결과를 `depcruise-baseline` 보조 커맨드로도 만들 수 있다.
- **baseline 파일은 반드시 커밋**하고, PR에서 이 파일이 **늘어나면 리뷰에서 막는다**(줄어드는 변경만 승인).

ESLint 쪽 대응물:

```bash
# ESLint 9 후반(9.24+)·10: 공식 억제(suppression) 파일 기능
npx eslint --suppress-all src         # eslint-suppressions.json 생성
npx eslint --prune-suppressions src   # 해결된 항목 정리
```

> 주의: `--suppress-all`/`--prune-suppressions`는 ESLint 9 후반에 도입된 기능이라 **ESLint 8에는 없다.** ESLint 8 프로젝트에서는 `overrides`로 레거시 폴더만 `warn`으로 낮추고, 신규 폴더에만 `error`를 켜는 방식이 현실적이다.

```js
// .eslintrc.js — ESLint 8에서의 점진 적용
module.exports = {
  rules: { 'import/no-restricted-paths': ['error', { /* ... */ }] },
  overrides: [
    {
      files: ['src/legacy/**/*.{ts,tsx}'],           // 아직 정리 안 된 구역만
      rules: { 'import/no-restricted-paths': 'warn' },
    },
  ],
};
```

### 6-3. 3단계 — warn → error 승격 로드맵

```js
// .dependency-cruiser.js — 레이어별로 심각도를 다르게 시작
forbidden: [
  { name: 'no-circular',          severity: 'error', from: {}, to: { circular: true } },       // 즉시 error
  { name: 'no-upward-layer-dep',  severity: 'error', from: { path: '^src/shared/' },
    to: { path: '^src/(features|app)/' } },                                                    // 위반 적은 것부터 error
  { name: 'cross-feature-must-use-public-api', severity: 'warn', /* ... */ },                  // 다음 분기에 error
  { name: 'no-orphans',           severity: 'info', from: { orphan: true }, to: {} },
],
```

| 시점 | 조치 | CI |
|------|------|-----|
| W1 | 규칙 작성 + baseline 스냅샷 | `--ignore-known`, 실패 없음 |
| W2~ | 신규 위반 차단 시작 | `--ignore-known` + **exit code 게이트 ON** |
| 분기 단위 | 위반 적은 규칙부터 `warn` → `error` 승격, baseline 재생성(줄어든 상태로만) | 게이트 유지 |
| 상시 | 스프린트마다 baseline 항목 N개 상환 | baseline 항목 수를 지표로 추적 |

### 6-4. 4단계 — CI 게이트 설계

```yaml
# .github/workflows/architecture.yml
jobs:
  boundaries:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'npm' }
      - run: npm ci

      # (1) 신규 위반만 실패 — 상시 게이트
      - name: Dependency rules (new violations only)
        run: npx depcruise src --ignore-known --output-type err-long

      # (2) baseline이 늘어났는지 검사 — 부채 증가 차단
      - name: Baseline must not grow
        run: |
          npx depcruise src --output-type baseline --output-to /tmp/current.json
          node -e "
            const a = require('./.dependency-cruiser-known-violations.json');
            const b = require('/tmp/current.json');
            if (b.length > a.length) {
              console.error('known violations increased: ' + a.length + ' -> ' + b.length);
              process.exit(1);
            }
          "

      # (3) PR 변경 범위 리포트 (참고용, 실패시키지 않음)
      - name: Affected graph
        if: github.event_name == 'pull_request'
        run: npx depcruise src --affected ${{ github.base_ref }} --output-type markdown >> $GITHUB_STEP_SUMMARY
```

- **게이트는 하나만 빨갛게** 만든다. 여러 잡이 동시에 실패하면 개발자는 원인을 안 보고 규칙을 끄러 간다.
- 실패 메시지에 **"대신 무엇을 하라"** 를 넣는다(`comment`/`message` 필드). 이것이 disable 주석 남발을 막는 가장 효과적인 장치다.
- pre-commit에는 넣지 않는다(전체 그래프 분석은 커밋 루프에 과하다). `lint-staged`에는 ESLint만, dependency-cruiser는 pre-push 또는 CI. → 훅 구성은 `frontend/code-convention` 참조.

---

## 7. 흔한 실패 패턴

| 실패 패턴 | 왜 실패하나 | 올바른 접근 |
|-----------|-------------|-------------|
| 규칙만 켜고 위반을 전부 `eslint-disable`/ignore 주석으로 덮기 | 규칙이 문서로 전락. CI만 초록 | baseline 파일로 **한 곳에 모아** 가시화하고 감소 추이를 지표화. disable 주석은 CI에서 개수 상한 검사 |
| `shared`를 "예외 폴더"로 열어둠 | 모든 코드가 shared로 흘러 들어가 shared가 만능 모듈이 됨 | shared도 하위 레이어일 뿐 — **shared → 상위 레이어 금지**를 첫 error 규칙으로. shared 안을 `shared/ui`·`shared/lib`·`shared/api`로 다시 나누고 그 사이도 규칙화 |
| alias만 막고 상대경로를 안 막음 | `../../features/x`로 전부 우회 | 경로 기반 도구(`no-restricted-paths`/boundaries/dependency-cruiser) 사용 + `import/no-relative-parent-imports`로 상위 상대경로 금지 |
| `tsConfig`/resolver 설정 누락 | alias가 미해석되어 규칙이 **조용히 통과**(false green) | 도입 직후 `couldNotResolve` 위반이 0인지 확인. 의도적으로 위반 코드를 하나 넣어 **규칙이 실제로 빨간지 검증** |
| 첫날부터 전부 `error` | 위반 수백 건 → 팀이 규칙을 통째로 끔 | baseline + warn→error 승격 로드맵(6장) |
| `import/no-cycle`을 전체 레포에 무제한 depth로 | 린트 시간 폭증 → "느려서" 규칙 제거 | `maxDepth`·`ignoreExternal` 설정, 전체 순환 검사는 dependency-cruiser로 이관 |
| 편의용 배럴(`components/index.ts`)을 계속 유지 | 순환·번들 비대·dev 지연 누적 | 공개 API 배럴 1개만 유지, 내부는 직접 경로 (5장) |
| 배럴을 공개 API로 정해놓고 강제하지 않음 | 누군가는 반드시 내부 경로로 들어온다 | `boundaries/entry-point`(v4) 또는 dependency-cruiser `$1` 역참조 규칙으로 강제 |
| 경계 규칙을 문서(위키)로만 관리 | 강제되지 않으면 3개월 뒤 무너짐 | 규칙을 **설정 파일**로 옮기고 CI 게이트에 연결. 문서는 "왜"만 남긴다 |
| 경계 플러그인 버전을 느슨하게(`^`) 고정 | boundaries류는 메이저마다 API·패키지명이 크게 바뀜 | 경계 도구는 **정확 버전 고정** + 업그레이드를 별도 작업으로 |
| 규칙 위반 메시지가 "not allowed"뿐 | 개발자가 대안을 몰라 disable | `comment`/`message`에 대체 방법과 근거를 문장으로 작성 |

---

## 8. 체크리스트

- [ ] 레이어와 도메인 슬라이스의 **허용 매트릭스**를 문서가 아니라 설정 파일로 표현했다
- [ ] alias/모노레포 해석 설정(`tsConfig`, `import/resolver`)이 맞아 `couldNotResolve` 위반이 0이다
- [ ] 일부러 위반 코드를 넣어 **규칙이 실제로 실패**하는 것을 확인했다
- [ ] 순환 참조 규칙이 `error`로 켜져 있다
- [ ] baseline 파일이 커밋돼 있고, PR에서 늘어나면 실패한다
- [ ] 실패 메시지에 "대신 무엇을 하라"가 들어 있다
- [ ] 공개 API 배럴은 슬라이스당 1개이고, 내부에서는 배럴을 import하지 않으며, 그 규칙이 도구로 강제된다
- [ ] 모노레포라면 `exports`(+`imports`)와 project references로 물리 경계를 이중화했다
- [ ] 사용 중인 ESLint 메이저(8/9/10)와 플러그인 peer 범위가 실제로 맞는다
- [ ] warn → error 승격 일정이 정해져 있다
