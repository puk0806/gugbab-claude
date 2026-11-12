---
name: module-boundaries
description: 프론트엔드 모듈 경계 강제 도구의 버전 기준과 함정 - dependency-cruiser 18(Node 22+·tsConfig 누락 시 조용한 통과·$1 역참조·baseline), eslint-plugin-boundaries 7.x(패키지 이관·7.4.0 node: core 전환·deprecated 룰·ESLint 8은 4.2.2), eslint-plugin-import ESLint 10 미지원→import-x, no-restricted-imports 우회·9.37 TS 지원, exports moduleResolution 조건, 점진 도입
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
> 소스: https://github.com/javierbrea/eslint-plugin-boundaries/releases (v7.2.1~v7.4.2 릴리스 노트)
> 검증일: 2026-11-09 (재검증, 이전 2026-09-26 · 최초 2026-08-26)

---

## 이 스킬의 범위

경계 강제 도구의 **버전·호환 기준, 규칙이 조용히 무력화되는 함정, 점진 도입 절차**만 다룬다. ESLint 10 flat config 최신 변경점은 `code-convention` 스킬, 레이어 개념의 의미는 범위 밖.

> 기본 사용법(각 도구 설치·`depcruise --init`·forbidden 규칙 문법·zone 설정 예제·exports/imports/project references 기본·barrel 개념)은 공식 문서 수준이라 싣지 않는다.

**권장 조합:** `dependency-cruiser`(전체 그래프·순환·고아 + CI 게이트) + ESLint 계열 1종(에디터 피드백) + 모노레포면 `exports`/project references로 물리 차단. 셋은 경쟁이 아니라 계층이다.

---

## 0. 기준 버전 (2026-11-09 재확인, 이전 확인 2026-09-26 · 최초 2026-08-26)

| 도구 | 최신 버전 | ESLint 호환 | Node 요구 | 비고 |
|------|-----------|-------------|-----------|------|
| `dependency-cruiser` | **18.7.2** (09-26 확인 시 18.4.0 → 마이너 갱신) | 무관 (ESLint 비의존) | `^22 \|\| ^24 \|\| >=26` | v18에서 Node 20·25 지원 종료 |
| `eslint-plugin-boundaries` / `@boundaries/eslint-plugin` | **7.4.2** (09-26 확인 시 7.2.0) | v5.0.0+ = **ESLint 9+ flat config** / ESLint 8·eslintrc는 **v4.2.2** | `>=18.18` | 패키지명이 `@boundaries/eslint-plugin`로 이관 중 |
| `eslint-plugin-import` | **2.32.0** | `^2 \|\| ... \|\| ^8 \|\| ^9` — **ESLint 10 미지원** | `>=4` | eslintrc·flat 양쪽 지원 |
| `eslint-plugin-import-x` | **4.18.1** (09-26 확인 시 4.17.1) | `^8.57 \|\| ^9 \|\| ^10` | `^18.18 \|\| ^20.9 \|\| >=21.1` | import 플러그인의 경량·고속 포크 |
| `eslint-import-resolver-typescript` | **4.4.5** | eslint 무관(peer optional) | `^16.17 \|\| >=18.6` | `import`/`import-x` 양쪽 지원 |
| `madge` | **8.0.0** | 무관 | `>=18` | 순환 탐지·그래프 보조 도구 |
| `eslint` | **10.14.0** (09-26 확인 시 10.11.0 → 마이너 갱신) | — | `^20.19 \|\| ^22.13 \|\| >=24` | **v10에서 eslintrc 완전 제거** (변동 없음) |

> 주의 (boundaries 7.2.1~7.4.2, 2026-10~11): **7.2.1은 의존성 `handlebars` 보안 패치**(4.7.10, JavaScript 인젝션 권고 대응)라 7.2.0 고정 프로젝트는 올리는 것을 권한다. **7.3.0은 린트 속도 약 2.5배 개선**(공식 측정, 약 5,000파일 기준). **7.4.0부터 `node:` 접두사로만 존재하는 내장 모듈**(`node:test`·`node:sqlite` 등)의 origin 이 `external` → `core` 로 바뀌었다 — external 규칙으로 이를 막고 있었다면 core 규칙으로 옮겨야 한다(공식 upgrade notes v7-4-0). 7.4.2는 `capture`가 배열이 아니면 경고 후 무시한다.

> 주의: ESLint 10.0.0부터 `.eslintrc.*`·`.eslintignore`·`--no-eslintrc`·`--env`·`--resolve-plugins-relative-to` 등이 **제거**됐다. ESLint 8을 쓰는 프로젝트는 (a) 8에서 동작하는 조합으로 규칙을 먼저 켜고 (b) 9 → 10 마이그레이션 시 플러그인 조합을 재선정하는 2단계로 간다.

> 주의: `eslint-plugin-boundaries`(구 이름)와 `@boundaries/eslint-plugin`(신 이름) 모두 레지스트리에 7.4.2가 존재한다(2026-11-09 확인). 공식 마이그레이션 안내는 "v7부터 스코프 패키지만 발행"이라고 하지만 구 이름도 7.4.2가 게시돼 있고 deprecate 표시가 없다 → **신규 도입은 `@boundaries/eslint-plugin`을 쓰되, import 식별자·룰 접두사는 그대로 `boundaries/`다.**

---

## 1. dependency-cruiser — 자주 틀리는 점

- **`tsConfig`를 지정하지 않으면 alias import가 `couldNotResolve`로 잡혀 규칙이 조용히 무력화**된다(false green). 도입 직후 `--output-type err-long`으로 미해석 경고가 없는지 확인하고, 일부러 위반 코드를 하나 넣어 규칙이 실제로 빨간지 검증한다. alias를 쓰면 dependency-cruiser `tsConfig`와 ESLint `import/resolver: typescript`를 **동시에** 맞춘다.
- v18은 TS 경로 해석에 enhanced-resolve의 내장 tsconfig 기능을 쓴다(구 `tsconfig-paths-webpack-plugin` 대체). 17 이하에서 올라올 때 alias 해석 결과가 미세하게 달라질 수 있으므로 업그레이드 직후 위반 수를 비교한다.
- `path`/`pathNot`은 **정규식**(글롭 아님), 경로 구분자는 항상 `/`. `orphan`이 있으면 `to`는 무시된다.
- `from.path`의 캡처그룹은 `to.path`/`to.pathNot`에서 `$1`로 역참조된다 — "형제 feature끼리는 공개 API로만" 규칙의 핵심:

```js
{
  name: 'cross-feature-must-use-public-api',
  severity: 'error',
  from: { path: '^src/features/([^/]+)/' },
  to: { path: '^src/features/([^/]+)/', pathNot: '^src/features/($1/|[^/]+/index[.]ts$)' },
}
```

- `tsPreCompilationDeps: 'specify'`로 두면 `preCompilationOnly` 조건으로 "타입 전용 import만 허용"을 규칙화할 수 있다.
- 종료 코드 = error 심각도 위반 개수 → CI 게이트로 그대로 쓴다. v13+는 `--config` 생략 가능(구 `--validate`는 별칭).
- CI에서 `--affected main`을 쓰면 `actions/checkout`에 `fetch-depth: 0` 필수, dependency-cruiser 18은 Node 22+ 러너 필요.

---

## 2. ESLint 계열 — 자주 틀리는 점

### `no-restricted-imports` (코어)

- **정적 import 문자열 전용** — 동적 `import()` 미검사.

> 주의: 이 룰은 문자열 매칭이라 `../../features/x`처럼 상대경로로 우회된다. 반드시 `import/no-relative-parent-imports` 또는 alias 강제 규칙과 함께 쓰거나, 경로 기반 도구로 승격한다.

- 타입 전용 import만 예외로 허용하려면 `allowTypeImports: true`. ESLint 8에서는 `@typescript-eslint/no-restricted-imports`를 써야 하고, **ESLint 9.37.0부터는 코어 룰이 TS import 문법을 지원해 해당 확장 룰이 deprecated**됐다.

### `import/no-restricted-paths` · `import/no-cycle`

- zone `from`은 배열 가능하나 **디렉터리와 글롭을 섞을 수 없다**. `from`이 글롭이면 `except`도 글롭이어야 하고, 디렉터리면 `except`는 `from` 기준 상대경로이며 상위로 못 올라간다. `message`는 반드시 채운다(대안이 없으면 개발자가 disable로 도망간다).
- `import/no-cycle`은 공식 문서가 "비교적 계산 비용이 크다"고 명시 — `maxDepth`(1~3)·`ignoreExternal: true`로 시작하고, 전체 순환 검사는 dependency-cruiser `no-circular`로 이관한다. `allowUnsafeDynamicCyclicDependency`는 임시 완화용으로만(공식: 순환 의존은 항상 위험한 안티패턴).

> `eslint-plugin-import`는 peer 범위가 ESLint 9까지다. ESLint 10으로 갈 계획이면 동일 룰을 제공하는 `eslint-plugin-import-x`(4.18.1, peer `^8.57 || ^9 || ^10`)로 교체를 검토한다. 룰명 접두사만 `import-x/`로 바뀐다.

### `eslint-plugin-boundaries`

**v7 (ESLint 9+ flat, `@boundaries/eslint-plugin` 7.4.2):**
- 대표 룰은 `boundaries/dependencies`(`from: { element: { type } }` / `allow: { to: { element: { types: [...] } } }` 형태). 그 외 `boundaries/no-unknown-files`, `boundaries/no-unknown-dependencies`(구 `no-unknown`), `boundaries/no-ignored-dependencies`(구 `no-ignored`).
- **`element-types`·`entry-point`·`external`·`no-private`는 deprecated**(`element-types`는 `dependencies`의 별칭이며 경고 후 향후 메이저에서 제거 예정). `importKind`는 deprecated → `dependency.kind`(`value`/`type`/`typeof`).
- 정책은 **순서대로 평가되고 마지막에 매칭된 정책이 결과를 결정**한다. 한 정책 안에서는 `disallow`가 `allow`보다 먼저 평가된다.
- 프리셋: `recommended`(기존 프로젝트용, 일부 룰 off) / `strict`(신규) / `strictLegacy`(v6에서 올라오는 경우).
- capture 템플릿: v4 `${from.elementName}` → v7 `{{ from.element.captured.elementName }}`.

> 주의: 공식 quick-start 예제는 정책 배열 키를 `policies:`로, 룰 레퍼런스 문서는 `rules:`로 표기해 **문서 간 불일치**가 있다. 이 스킬은 룰 레퍼런스(`rules:`)를 따랐다. 실제 적용 시 설치한 버전의 타입 정의(`DependenciesRuleOptions`)로 키를 확인하라.

**v4.2.2 (ESLint 8 / `.eslintrc`):** 공식 설치 문서 "Starting from version `5.0.0`, this plugin is compatible with ESLint **v9 and above**" → **ESLint 8 + eslintrc라면 v4.2.2로 고정**. 이 버전에서는 `boundaries/element-types`·`entry-point`(공개 API 강제)·`external`·`no-private`·`no-unknown`을 쓴다.

> 주의: v4 → v5(flat config 전환) → v6 → v7(패키지명·룰명 변경)로 **API 변화가 큰 플러그인**이다. 버전을 정확히 고정(`4.2.2` 등)하고, 업그레이드는 공식 마이그레이션 가이드를 따라 별도 작업으로 진행한다.

---

## 3. 물리 경계 (모노레포) — 새는 지점

- `exports`가 정의되면 나열되지 않은 서브패스는 import 자체가 실패한다(`ERR_PACKAGE_PATH_NOT_EXPORTED`). `"./internal/*": null`로 구멍을 막을 수 있다.
- 조건부 export는 **객체에 선언된 순서대로 매칭** → `"types"`를 가장 먼저, `"default"`를 마지막에.
- TypeScript가 `exports`를 존중하려면 `"moduleResolution": "bundler"`(또는 `node16`/`nodenext`)여야 한다. 구 `"node"`면 무시되어 경계가 새어나간다.
- `imports` 항목은 항상 `#`로 시작해야 한다(공식). `tsconfig.paths`와 달리 런타임·테스트 러너별 설정 복제가 필요 없다.
- `paths` alias는 레이어 단위로만, 하나의 alias가 여러 물리 경로를 가리키지 않게 한다(경계 도구가 해석을 못 하거나 우회로가 생긴다).

### barrel

> 주의: Next.js `optimizePackageImports`는 여전히 `experimental` 네임스페이스이고, 기본 최적화 목록(`lucide-react`, `date-fns`, `@mui/material`, `react-icons/*` 등)에 있는 **외부 패키지** 대상이다. **내 앱 안의 배럴은 이 옵션이 해결해주지 않는다.**

배럴은 "밖에서 들어오는 문"(슬라이스당 공개 API 1개)으로만 쓰고 같은 슬라이스 내부에서 자기 배럴을 import하지 않는다(순환 최대 원인). 공개 API로 정했다면 1절 `$1` 규칙 또는 `boundaries/entry-point`(v4)로 **강제**한다. 동적 `import()`로 사이클을 숨기는 것은 해소가 아니다.

---

## 4. 점진 도입 — 기존 위반이 수백 건일 때

**첫날 목표는 "위반 0"이 아니라 "신규 위반 0"이다.**

```bash
# 현재 위반 전체를 baseline으로 스냅샷 → 이후 CI는 신규 위반만 실패
npx depcruise src --output-type baseline --output-to .dependency-cruiser-known-violations.json
npx depcruise src --ignore-known
```

- `--ignore-known` 기본 파일명은 `.dependency-cruiser-known-violations.json`(다르면 `--ignore-known <path>`). baseline은 커밋하고, PR에서 항목 수가 **늘어나면 실패**시킨다(줄어드는 변경만 승인).
- ESLint 쪽 대응물: `npx eslint --suppress-all src`(eslint-suppressions.json 생성) / `--prune-suppressions`.

> 주의: `--suppress-all`/`--prune-suppressions`는 ESLint 9 후반에 도입된 기능이라 **ESLint 8에는 없다.** ESLint 8 프로젝트에서는 `overrides`로 레거시 폴더만 `warn`으로 낮추고, 신규 폴더에만 `error`를 켜는 방식이 현실적이다.

- 승격: 순환 → 즉시 error, 위반 적은 규칙부터 warn → error, baseline은 줄어든 상태로만 재생성. 게이트는 하나만 빨갛게, 실패 메시지(`comment`/`message`)에 "대신 무엇을 하라"를 넣는다. dependency-cruiser는 pre-commit이 아니라 pre-push 또는 CI.

---

## 5. 흔한 실패 패턴

| 실패 패턴 | 올바른 접근 |
|-----------|-------------|
| 위반을 전부 `eslint-disable`/ignore 주석으로 덮기 | baseline 파일로 한 곳에 모아 감소 추이를 지표화, disable 주석은 개수 상한 검사 |
| `shared`를 예외 폴더로 열어둠 | **shared → 상위 레이어 금지**를 첫 error 규칙으로 |
| alias만 막고 상대경로를 안 막음 | 경로 기반 도구 + `import/no-relative-parent-imports` |
| `tsConfig`/resolver 설정 누락 | `couldNotResolve` 0 확인 + 일부러 위반 넣어 검증 |
| 첫날부터 전부 `error` | baseline + warn→error 승격 |
| `import/no-cycle` 무제한 depth | `maxDepth`·`ignoreExternal`, 전체 순환은 dependency-cruiser |
| 경계 플러그인 버전을 `^`로 느슨하게 | boundaries류는 메이저마다 API·패키지명이 바뀜 — 정확 버전 고정 |
| ESLint 10인데 `eslint-plugin-import` 유지 | peer 미지원 — `eslint-plugin-import-x` |
| boundaries 7.4.0+에서 `node:test` 등을 external 규칙으로 차단 | origin이 `core`로 바뀜 — core 규칙으로 이동 |
