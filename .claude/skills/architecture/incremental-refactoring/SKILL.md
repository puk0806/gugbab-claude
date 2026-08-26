---
name: incremental-refactoring
user-invocable: false
description: 소스 파일 수천 개 규모 프론트엔드 코드베이스를 멈추지 않고 점진 재구조화하는 실행 전략 - Strangler Fig / Branch by Abstraction / Parallel Change, ts-morph·jscodeshift codemod, PR 분할·검증 게이트·되돌리기, 테스트 없는 코드의 안전망, 작업 순서 설계와 위반 수 기반 진행 추적
---

# 점진적 재구조화 (Incremental Refactoring)

> 소스: https://martinfowler.com/bliki/StranglerFigApplication.html (Martin Fowler, Strangler Fig Application, 2024-08-22 갱신)
> 소스: https://martinfowler.com/bliki/BranchByAbstraction.html (Martin Fowler / 용어 창안 Paul Hammant)
> 소스: https://martinfowler.com/bliki/ParallelChange.html (Danilo Sato, 2014-05-13, martinfowler.com 게재)
> 소스: https://martinfowler.com/articles/branching-patterns.html (Martin Fowler, Patterns for Managing Source Code Branches)
> 소스: https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig (Azure Architecture Center)
> 소스: Michael Feathers, "Working Effectively with Legacy Code" (Prentice Hall, 2004) — characterization test
> 소스: https://ts-morph.com/ (ts-morph 28.0.0 공식 문서)
> 소스: https://github.com/facebook/jscodeshift (jscodeshift 17.4.0 README)
> 소스: https://github.com/sverweij/dependency-cruiser/blob/main/doc/cli.md (dependency-cruiser 18.2.0 CLI 문서)
> 소스: https://git-scm.com/docs/git-mv , https://git-scm.com/docs/git-diff , https://git-scm.com/docs/git-blame , https://git-scm.com/docs/git-log
> 소스: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/ (TypeScript 7.0, 2026-07-08)
> 검증일: 2026-08-26

이 스킬은 **"도메인 폴더로 옮기기로 결정했다" 다음 단계**를 다룬다.
어떤 구조가 옳은지(레이어드 vs 기능 슬라이스 vs 도메인)는 다루지 않는다 — 그건 `architecture/ddd` 참조.
여기서 다루는 것은 **이미 정한 목표 구조로, 서비스를 멈추지 않고, 수천 개 파일을 실제로 옮기는 절차**다.

---

## 0. 버전 기준

| 도구 | 최신 안정 버전 (2026-08-26) | 역할 |
|------|------|------|
| `ts-morph` | **28.0.0** (`@ts-morph/common` 0.29.0) | TypeScript 컴파일러 API 래퍼. 타입/모듈 해석이 필요한 codemod |
| `jscodeshift` | **17.4.0** (Node >= 16) | Babel/recast 기반 AST codemod 러너. 순수 구문 변환 |
| `dependency-cruiser` | **18.2.0** (Node ^22 \|\| ^24 \|\| >=26) | 의존 규칙 검증 + baseline(알려진 위반) 관리 |
| `eslint-plugin-boundaries` | **7.2.0** (peer eslint >=6) | ESLint 레벨 아키텍처 경계 규칙 |
| `tsconfig-paths` | **4.2.0** | codemod 안에서 `paths` 별칭을 직접 해석할 때 |
| `size-limit` | **13.0.3** | 번들 크기 게이트 |
| TypeScript | **7.0.2** (JS 구현 계열은 6.0.2) | — |

### ⚠️ TypeScript 7 사용 시 codemod 도구 주의 (2026 현재 가장 중요한 함정)

TypeScript 7.0(2026-07-08 릴리즈, Go 네이티브 포트)은 **프로그래매틱 API를 포함하지 않는다.** 공식 발표문 원문:

> "While TypeScript 7.0 is here, it does not ship with an API. We expect TypeScript 7.1 to ship with a new (and different) API, but until then we have made it a priority to ensure TypeScript can be run side-by-side with TypeScript 6.0."

**ts-morph는 TypeScript 컴파일러 API 래퍼이므로, `typescript` 패키지가 7.0으로 올라간 프로젝트에서는 그대로 동작하지 않는다.** 공식 권장 회피책은 side-by-side 설치다:

```jsonc
// package.json — TS7로 타입체크하면서 6.0 API를 쓰는 도구(ts-morph 등)를 함께 유지
{
  "devDependencies": {
    "@typescript/native": "npm:typescript@^7.0.2",
    "typescript": "npm:@typescript/typescript6@^6.0.2"
  }
}
```

`@typescript/typescript6` 패키지는 `tsc6` 실행 파일을 제공하고 **TypeScript 6.0 API를 re-export** 한다.

> 주의: `jscodeshift`는 Babel 파서(`@babel/parser` + `@babel/preset-typescript`)를 쓰기 때문에 이 문제의 영향을 받지 않는다. TS7 전환기 프로젝트에서 codemod 도구를 고를 때 실질적인 판단 근거가 된다.

---

## 1. Strangler Fig — 원 출처 정의와 프론트엔드 적용

### 1-1. 원 출처 정의

Martin Fowler가 2001년 호주 퀸즐랜드 열대우림에서 본 **교살무화과(strangler fig)** 에서 따온 은유다. 무화과 씨앗이 숙주 나무 가지 틈에서 발아해 뿌리를 땅으로 내리며 자라고, 결국 자립하면 숙주 나무는 죽어 **원래 나무의 형태만 남긴 껍데기(echo of its shape)** 가 된다.

핵심 아이디어는 **한 번에 갈아엎지 않고, 레거시의 동작을 조각 단위로 새 코드베이스로 옮긴다(moving bits of behavior from the legacy system into the new code base)** 는 것이다.

Fowler가 명시한 주의점:
- **전이 아키텍처(transitional architecture)** — 신·구 공존을 위한 임시 코드가 반드시 필요하다. 사람들은 이걸 만드는 걸 꺼리지만, "점진적 접근이 주는 리스크 감소와 조기 가치 실현이 그 비용보다 크다."
- 조직 문화가 바뀌지 않으면 **새 시스템도 똑같이 취약해진다.**

> 주의: Fowler는 2001년 관찰 → 몇 년 뒤 최초 게시 → 이후 "Strangler Application"에서 **"Strangler Fig Application"으로 개명**했다(폭력적 함의 지적 때문). 최신 문서 기준 정확한 명칭은 **Strangler Fig**다.

### 1-2. Azure Architecture Center 판(4단계) — 서버 시스템 기준

1. 클라이언트와 레거시/신규 사이에 **파사드(프록시)** 를 넣는다. 처음엔 대부분 레거시로 라우팅.
2. 파사드가 요청을 점진적으로 신규 시스템 쪽으로 옮긴다.
3. 레거시 의존이 0이 되면 레거시를 폐기한다.
4. **파사드를 제거**하고 클라이언트가 신규와 직접 통신한다.

고려사항 중 재구조화에 그대로 적용되는 것:
- 신·구가 **동시에 접근하는 공유 자원**을 어떻게 다룰지 먼저 정한다.
- 신규 코드도 **나중에 또 교체 가능한 형태**(명확한 경계)로 만든다.
- 신·구 간 상호 호출은 **Anti-corruption Layer**로 번역한다. 없으면 신규가 레거시 관례에 오염된다.

### 1-3. 프론트엔드 폴더/모듈 재구조화로 구체화

프론트엔드 폴더 이동에는 **런타임 프록시가 없다.** 파사드 역할을 하는 것은 **모듈 경로 그 자체**다.

| Azure 판 요소 | 프론트엔드 재구조화 대응물 |
|------|------|
| 파사드(프록시) | 옛 경로에 남기는 **re-export shim** (`export * from "@/features/order/ui/OrderCard"`) |
| 요청 라우팅 이전 | 호출부의 import 경로를 신규 경로로 codemod 이전 |
| 레거시 폐기 | 옛 경로 파일 삭제 |
| 파사드 제거 | shim 삭제 + 경계 규칙 severity를 `error`로 승격 |
| ACL | 아직 안 옮긴 레거시 모듈을 신규 도메인이 참조할 때 두는 **어댑터 모듈** (신규가 레거시 타입/네이밍을 그대로 빨아들이지 않게) |

```
# 1단계 — 실체를 새 위치로, 옛 경로는 shim
src/features/order/ui/OrderCard.tsx      ← 실제 구현 (git mv 로 이동)
src/components/OrderCard.tsx             ← export * from "@/features/order/ui/OrderCard";  // @deprecated

# 2단계 — 호출부 이전 (codemod)
- import { OrderCard } from "@/components/OrderCard";
+ import { OrderCard } from "@/features/order/ui/OrderCard";

# 3단계 — shim 제거 + 규칙 승격
src/components/OrderCard.tsx  삭제
eslint no-restricted-imports: "@/components/*" → error
```

이 3단계는 아래 두 패턴과 정확히 같은 골격이다.

- **Parallel Change (= expand / migrate / contract)** — Danilo Sato: "하위 호환이 깨지는 인터페이스 변경을 **expand → migrate → contract** 세 단계로 나눠 안전하게 수행하는 패턴." (기법 자체는 Joshua Kerievsky가 2006년에 리팩터링 전략으로 먼저 문서화)
- **Branch by Abstraction** — Fowler: "시스템을 정기적으로 릴리즈하면서 대규모 변경을 점진적으로 수행하는 기법." 용어는 Paul Hammant가 명명, 개념 원안은 Stacy Curl.
  1. 클라이언트와 기존 공급자 사이의 상호작용을 포착하는 **추상화 계층**을 만들고, 클라이언트가 그것만 쓰게 한다
  2. 클라이언트를 점진적으로 추상화 계층으로 이전하며 테스트 커버리지를 올린다
  3. 같은 추상화 계층을 구현하는 **새 공급자**를 만든다
  4. 클라이언트를 새 공급자로 점진 전환하고, 다 끝나면 옛것을 삭제한다

> 폴더 이동만 하는 경우엔 Parallel Change(shim 방식)로 충분하다.
> **구현 자체를 갈아끼우는 경우**(예: 자체 폼 로직 → react-hook-form, styled-components → CSS Modules)에는 Branch by Abstraction이 맞다. 이때 추상화 계층은 `src/shared/form/index.ts` 같은 **내부 어댑터 모듈**이 된다.

---

## 2. 이동 수단 3종 — 무엇을 언제 쓰는가

| 수단 | 적합한 상황 | 부적합한 상황 |
|------|------|------|
| **`git mv` + IDE 리팩터** (VS Code "Update imports on file move") | 파일 **수십 개 이하**, 1회성, 이동 대상이 명확 | 수백~수천 개. IDE가 대용량에서 멈추거나 일부만 갱신 |
| **codemod (ts-morph / jscodeshift)** | 파일 **수백 개 이상**, 규칙이 기계적, **반복 실행**해야 함(다른 브랜치에도 적용) | 규칙이 "케이스마다 다르다"에 가까울 때 |
| **수작업** | 자동화가 판단할 수 없는 잔여 케이스 (동적 import 문자열, 순환 의존 해소, 공개 API 재설계) | 그 외 전부 |

**실무 판정 기준 한 줄:**
> "이 변환을 **다른 브랜치에도 한 번 더 돌려야 하나?"** → 그렇다면 무조건 codemod. 스크립트를 레포에 커밋해 두면 진행 중인 기능 브랜치가 rebase될 때 그대로 재실행할 수 있다. IDE 리팩터는 재실행이 불가능하다.

> 주의: `git mv`는 **인덱스만 갱신**한다("The index is updated after successful completion, but the change must still be committed"). Git은 객체 DB에 rename을 저장하지 않고, `git log`/`git diff`가 **유사도 기반으로 rename을 탐지**한다. 자세한 건 5-4 참조.

---

## 3. ts-morph codemod (28.0.0)

### 3-1. tsconfig paths를 인식시키는 프로젝트 설정

ts-morph는 TypeScript 컴파일러를 그대로 쓰므로, **`tsConfigFilePath`만 주면 `compilerOptions.paths` 별칭 해석이 컴파일러와 동일하게 동작한다.**

```ts
import { Project } from "ts-morph";

// (A) 가장 단순 — tsconfig의 include/files에 잡히는 소스 파일이 전부 자동 추가된다
const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

// (B) 대형 모노레포 — 자동 추가를 끄고 대상만 좁혀서 로드 (속도/메모리 절약)
const scoped = new Project({
  tsConfigFilePath: "tsconfig.json",
  skipAddingFilesFromTsConfig: true,
});
scoped.addSourceFilesAtPaths(["src/**/*.{ts,tsx}", "!src/**/*.d.ts"]);
```

- `tsConfigFilePath`를 주면 "will automatically add all the associated source files from the tsconfig.json".
- `compilerOptions` 객체를 함께 주면 tsconfig 옵션을 **덮어쓸 수 있다.**
- 모노레포에서 `tsconfig`가 패키지마다 다르면 **패키지별로 `Project`를 따로 만든다.** 하나의 Project에 서로 다른 `paths`를 섞으면 별칭 해석이 어긋난다.

### 3-2. 예시 ① import 경로 일괄 재작성

```ts
// scripts/codemod/rewrite-import-paths.ts
import { Project } from "ts-morph";

const DRY = process.argv.includes("--dry");

const project = new Project({ tsConfigFilePath: "tsconfig.json" });

const RULES: Array<[RegExp, string]> = [
  [/^@\/components\/(.+)$/, "@/shared/ui/$1"],
  [/^@\/utils\/date$/, "@/shared/lib/date"],
  [/^\.\.\/\.\.\/api\/(.+)$/, "@/shared/api/$1"], // 상대경로 탈출을 별칭으로 정규화
];

let rewritten = 0;
const touched = new Set<string>();

// getSourceFiles는 glob과 부정 glob(!)을 지원한다
for (const sourceFile of project.getSourceFiles(["src/**/*.ts", "src/**/*.tsx"])) {
  const decls = [
    ...sourceFile.getImportDeclarations(),
    ...sourceFile.getExportDeclarations(), // re-export(배럴)도 반드시 함께 처리
  ];

  for (const decl of decls) {
    const spec = decl.getModuleSpecifierValue();
    if (!spec) continue; // `export { x };` 처럼 from 절이 없는 경우

    for (const [from, to] of RULES) {
      if (!from.test(spec)) continue;
      decl.setModuleSpecifier(spec.replace(from, to));
      rewritten++;
      touched.add(sourceFile.getFilePath());
      break;
    }
  }
}

console.log(`[rewrite] ${rewritten} specifiers in ${touched.size} files`);
if (!DRY) project.saveSync(); // --dry면 저장하지 않는다 = 안전한 사전 집계
```

```bash
npx tsx scripts/codemod/rewrite-import-paths.ts --dry   # 먼저 건수만 확인
npx tsx scripts/codemod/rewrite-import-paths.ts         # 실제 적용
```

### 3-3. 예시 ② 파일 이동 후 참조 갱신

ts-morph의 진짜 강점. 공식 문서 원문:

> `move()`: "If necessary, this will automatically update the module specifiers of the **relative** import and export declarations **in the moving file and the relative import and export declarations in other files** to point to the new location."
> `copy()`: 갱신 범위가 **복사된 파일 내부로 한정**된다. 다른 파일은 갱신하지 않는다.

```ts
// scripts/codemod/move-to-feature.ts
import { Project } from "ts-morph";

const project = new Project({ tsConfigFilePath: "tsconfig.json" });

const MOVES: Array<[string, string]> = [
  ["src/components/OrderCard.tsx", "src/features/order/ui/OrderCard.tsx"],
  ["src/components/OrderList.tsx", "src/features/order/ui/OrderList.tsx"],
  ["src/hooks/useOrder.ts",        "src/features/order/model/useOrder.ts"],
];

const missing: string[] = [];
for (const [from, to] of MOVES) {
  const sf = project.getSourceFile(from);
  if (!sf) { missing.push(from); continue; }
  sf.move(to);              // 참조하던 다른 파일들의 '상대 경로' 지정자까지 갱신됨
}

if (missing.length) {
  console.error("[move] not found:\n" + missing.join("\n"));
  process.exit(1);          // 조용히 일부만 이동시키지 않는다
}

project.saveSync();
```

**⚠️ 별칭(alias) import는 `move()`가 갱신하지 않는다.**
공식 문서가 갱신 범위를 명시적으로 **"relative import and export declarations"** 로 한정하고 있다. `@/components/OrderCard` 같은 **비상대(non-relative) 지정자는 이 보장에 포함되지 않는다.**
별칭 컨벤션을 쓰는 프로젝트라면 **`move()` → 이어서 3-2의 경로 재작성 codemod**를 순서대로 돌려야 한다.

```ts
// 이동 대상별 옛 별칭 → 새 별칭 매핑을 MOVES에서 자동 생성해 3-2 규칙으로 넘기면 누락이 없다
const aliasRules = MOVES.map(([from, to]) => [
  new RegExp(`^${from.replace(/^src\//, "@/").replace(/\.tsx?$/, "")}$`),
  to.replace(/^src\//, "@/").replace(/\.tsx?$/, ""),
] as [RegExp, string]);
```

**⚠️ `move()`는 git 명령을 대신 실행해 주지 않는다.** `saveSync()` 시점에 파일시스템에서 삭제+생성으로 반영된다. rename으로 기록되게 하려면 5-4를 따른다.

또 알아둘 것:
- `sourceFile.organizeImports()` — 정리에 유용하지만 공식 문서 경고: "This will forget all the previously navigated nodes so it's recommended to make this either the first or last action you do to a source file." **파일당 마지막 동작**으로 돌려라.
- `sourceFileFrom.getRelativePathAsModuleSpecifierTo(sourceFileTo)` — 상대 지정자를 직접 계산해야 할 때.
- `save()` / `saveSync()` 는 **emit이 아니다** (컴파일 산출물을 내지 않는다).

---

## 4. jscodeshift codemod (17.4.0)

### 4-1. 기본 구조

README 원문 시그니처:

```js
module.exports = function(fileInfo, api, options) {
  // transform `fileInfo.source` here
  // ...
  // return changed source
  return source;
};
```

- `fileInfo`: `{ path, source }` — **파일 경로와 텍스트뿐이다. 타입 정보도, 모듈 해석도 없다.**
- `api.jscodeshift`: recast 래퍼(jQuery 같은 AST 탐색), `api.stats()`(**`--dry` 실행에서만 동작**하는 카운터), `api.report()`
- 반환값 규약: **입력과 다른 문자열 = 변환 성공 / 동일 문자열 = 변환 실패 / 아무것도 반환 안 함 = 미변환**

### 4-2. 예시 ③ barrel export 해체

배럴(`index.ts` 재export)은 **필요 없는 모듈까지 전부 로드**시킨다. Next.js 팀 측정 기준, 일부 인기 React 패키지는 "import 하는 데만 200~800ms"가 들고, 10,000개 중첩 모듈의 재귀적 배럴은 최적화 전 ~30초가 걸렸다.

```js
// codemods/expand-barrel-import.js
// import { Button, Card } from "@/shared/ui";
//   → import { Button } from "@/shared/ui/Button";
//     import { Card }   from "@/shared/ui/Card";

const MAP = require("./barrel-map.json"); // { "Button": "@/shared/ui/Button", ... }
const BARREL = "@/shared/ui";

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let dirty = false;

  root.find(j.ImportDeclaration, { source: { value: BARREL } }).forEach((path) => {
    const decl = path.node;
    const specs = decl.specifiers || [];

    // default / namespace import가 섞이면 기계가 판단할 수 없다 → 건드리지 않고 리포트만
    if (specs.length === 0 || !specs.every((s) => s.type === "ImportSpecifier")) {
      api.stats("skipped:non-named");
      return;
    }

    const resolved = [];
    const unresolved = [];
    specs.forEach((s) => {
      const target = MAP[s.imported.name];
      if (target) resolved.push([s, target]);
      else unresolved.push(s);
    });

    if (resolved.length === 0) {
      api.stats("skipped:unmapped");
      return;
    }

    const created = resolved.map(([s, target]) => {
      const d = j.importDeclaration(
        [j.importSpecifier(j.identifier(s.imported.name), j.identifier(s.local.name))],
        j.literal(target),
      );
      d.importKind = decl.importKind;   // `import type { ... }` 보존
      return d;
    });

    if (unresolved.length > 0) {
      decl.specifiers = unresolved;     // 매핑 못한 것만 배럴에 남긴다 (부분 적용)
      path.replace(decl, ...created);   // ast-types NodePath#replace 는 가변 인자 지원
    } else {
      path.replace(...created);
    }

    dirty = true;
    api.stats("rewritten");
  });

  if (!dirty) return;                   // 미변환 = 아무것도 반환하지 않는다
  return root.toSource({ quote: "single" });
};

module.exports.parser = "tsx";          // 파일 단위로 파서 고정 (CLI --parser 대신 사용 가능)
```

```bash
# 1) 먼저 --dry --print 로 통계와 diff만 본다 (api.stats는 dry에서만 집계된다)
npx jscodeshift -t codemods/expand-barrel-import.js src \
  --parser=tsx --extensions=ts,tsx --dry --print

# 2) 실제 적용
npx jscodeshift -t codemods/expand-barrel-import.js src \
  --parser=tsx --extensions=ts,tsx
```

주요 CLI 옵션 (README 기준):

| 옵션 | 의미 |
|------|------|
| `-t, --transform=FILE` | 변환 파일 경로 (기본 `./transform.js`) |
| `--parser=babel\|babylon\|flow\|ts\|tsx` | 파서 선택. **기본 `babel`** — TS/TSX는 반드시 명시 |
| `--extensions=EXT` | 대상 확장자, 쉼표 구분. **기본 `js`** — `ts,tsx` 지정 필수 |
| `-d, --dry` | 파일을 쓰지 않음 |
| `-p, --print` | 변환 결과를 stdout으로 |
| `--run-in-band` | 현재 프로세스에서 직렬 실행 (디버깅용) |
| `-c, --cpus=N` | 최대 자식 프로세스 수 |
| `--gitignore` / `--ignore-pattern=GLOB` | 제외 규칙 |

> **`--extensions` 기본값이 `js`**라는 점이 실전에서 가장 흔한 사고 원인이다. TSX 프로젝트에서 "0 files transformed"가 나오면 여기부터 의심한다.

### 4-3. jscodeshift에 tsconfig paths를 인식시키기

jscodeshift는 **모듈 해석 기능이 없다.** `fileInfo`에 경로와 소스만 들어오기 때문이다. 별칭을 해석해야 한다면 codemod 안에서 직접 로드한다.

```js
// codemods/lib/resolve-alias.js
const { loadConfig, createMatchPath } = require("tsconfig-paths"); // 4.2.0

const cfg = loadConfig(process.cwd());
if (cfg.resultType === "failed") throw new Error(cfg.message);

const matchPath = createMatchPath(cfg.absoluteBaseUrl, cfg.paths);

/** "@/shared/ui/Button" → 절대 파일 경로 (해석 실패 시 undefined) */
module.exports = function resolveAlias(specifier) {
  return matchPath(specifier, undefined, undefined, [".ts", ".tsx", ".js", ".jsx"]);
};
```

**더 나은 실무 조합:** 배럴 매핑처럼 **해석이 필요한 부분은 ts-morph로 만들고**, **텍스트 변환은 jscodeshift로 적용**한다.

```ts
// scripts/codemod/gen-barrel-map.ts — barrel-map.json 생성
import { Project } from "ts-morph";
import { writeFileSync } from "node:fs";

const project = new Project({ tsConfigFilePath: "tsconfig.json" });
const barrel = project.getSourceFileOrThrow("src/shared/ui/index.ts");

const map: Record<string, string> = {};
// getExportedDeclarations()는 `export *` 를 따라간 실제 선언 위치까지 알려준다
for (const [name, decls] of barrel.getExportedDeclarations()) {
  const filePath = decls[0]?.getSourceFile().getFilePath();
  if (!filePath) continue;
  map[name] = filePath
    .replace(/^.*\/src\//, "@/")
    .replace(/\/index\.tsx?$/, "")
    .replace(/\.tsx?$/, "");
}
writeFileSync("codemods/barrel-map.json", JSON.stringify(map, null, 2));
```

### 4-4. ts-morph vs jscodeshift 선택 기준

| 판단 축 | ts-morph 28 | jscodeshift 17 |
|------|------|------|
| 기반 | TypeScript 컴파일러 API 래퍼 | Babel 파서 + recast |
| 타입 정보 / 심볼 해석 | **가능** (`getExportedDeclarations`, 타입 조회) | 불가 (구문만) |
| `tsconfig` `paths` 인식 | **`tsConfigFilePath`만 주면 자동** | 없음 — 직접 구현 (`tsconfig-paths`) |
| 파일 이동 시 타 파일 참조 갱신 | **`move()`가 상대 지정자 자동 갱신** | 없음 |
| 원본 포맷 보존 | 변경 노드 주변만 재출력 | recast 기반, 미변경부 원문 유지 |
| 대규모 실행 속도 | 느림 (전체 프로그램 로드 + 메모리) | 빠름 (파일 단위 병렬, `-c` 옵션) |
| JS 전용/Flow 코드베이스 | 부적합 | 적합 |
| TypeScript 7 전환기 | ⚠️ 6.0 API side-by-side 필요 (0절) | 영향 없음 |

**선택 규칙:**
- **파일 이동·심볼 추적·배럴 해석** = ts-morph. 이 셋은 jscodeshift로 하면 손해다.
- **"이 문법 패턴을 저 문법 패턴으로" 순수 구문 치환**을 수천 파일에 = jscodeshift.
- 둘 다 필요하면 **ts-morph로 매핑 생성 → jscodeshift로 적용**(4-3).

---

## 5. 안전장치

### 5-1. 이동 단위를 나누는 기준 — 한 PR에 무엇까지

**절대 규칙: 한 PR은 아래 유형 중 정확히 하나만 담는다.**

| # | PR 유형 | 담는 것 | 담지 않는 것 | 규모 상한(권장) |
|---|------|------|------|------|
| 1 | **준비** | 경계 규칙 도입(전부 `warn`), baseline 생성, 타깃 폴더 스켈레톤 | 파일 이동 0건 | — |
| 2 | **codemod 스크립트** | `scripts/codemod/*.ts`, `codemods/*.js`, `--dry` 실행 결과 로그 | 변환 적용 0건 | — |
| 3 | **이동** | 순수 이동 + 참조 갱신 + shim 생성 | **로직 변경 0줄**, 이름 변경 0건, 포맷터 재적용 0건 | **1 도메인 / 1 슬라이스** |
| 4 | **정리** | shim 제거, 배럴 삭제, 규칙 `warn` → `error` 승격 | 새 이동 0건 | 승격한 규칙 1개 |

**"1 도메인"의 실질적 상한:** 이동 대상 파일이 100개를 넘거나, `git diff --stat` 상 **rename이 아닌 변경(순수 수정) 파일이 30개를 넘으면** 쪼갠다. 리뷰어가 "rename 목록 훑기 + 수정 30건 정독"을 30분 안에 못 끝내면 실질적으로 리뷰가 안 된다.

**같은 PR에 절대 섞지 말아야 하는 조합:**
- 이동 + 기능 개발 → revert가 불가능해진다
- 이동 + 이름 변경 → git rename 탐지 실패(5-4)
- 이동 + prettier/eslint --fix 전면 재적용 → diff가 전부 수정으로 보임

### 5-2. 각 단계의 검증 게이트

이동 PR은 **아래 5개를 전부 통과**해야 머지한다. 하나라도 빠지면 "이동만 하고 깨진 채 머지"가 발생한다.

```bash
# ① 타입체크 — 순수 이동 리팩터링의 1차 안전망
npx tsc --noEmit                 # (TS7 side-by-side 환경이면 tsc6 --noEmit)

# ② 경계 규칙 — 위반이 늘지 않았는가 (이게 진짜 게이트다)
npx depcruise src --config --output-type err-long

# ③ 테스트
npm test -- --run

# ④ 빌드 — 타입체크가 못 잡는 번들러 레벨 해석 실패를 잡는다
npm run build

# ⑤ 번들 diff — 이동으로 청크 구성/크기가 의도치 않게 변했는지
npx size-limit --json > /tmp/after.json
node scripts/compare-bundle.mjs /tmp/before.json /tmp/after.json
```

| 게이트 | 잡아주는 것 | **못 잡는 것** |
|------|------|------|
| ① 타입체크 | 끊긴 import, 시그니처 불일치 | `any`, 동적 `import(변수)`, 문자열 경로, side effect 순서 |
| ② 경계 규칙 | 새로 생긴 층/도메인 위반, 순환 참조 | 규칙에 안 걸리는 잘못된 배치 |
| ③ 테스트 | 커버된 동작 | 커버 안 된 동작 (레거시에선 대부분) |
| ④ 빌드 | 번들러 alias/확장자 해석 실패, 순환으로 인한 초기화 오류 | 런타임 조건 분기 |
| ⑤ 번들 diff | 배럴 해체/이동으로 인한 코드 스플리팅 붕괴, 중복 청크 | 시각적 회귀 |

> **⑤ 번들 diff를 반드시 넣어라.** 폴더 이동은 "동작은 같은데 청크 경계가 바뀌는" 대표적 변경이다. 배럴을 해체하면 보통 좋아지지만, 동적 import 경계를 가로지르는 파일을 옮기면 **공통 청크가 쪼개지며 초기 로드가 커진다.**

### 5-3. 되돌리기 전략

| 단계 | 되돌리는 법 | 전제 조건 |
|------|------|------|
| 이동 PR | `git revert -m 1 <merge-sha>` | **로직 변경이 0줄이어야 한다.** 섞여 있으면 기능까지 되돌아간다 |
| codemod 적용 | codemod 스크립트를 **레포에 커밋**해 두고 역방향 규칙으로 재실행 | 규칙이 양방향으로 표현 가능해야 함 |
| shim 제거(정리 PR) | revert하면 shim이 되살아나 옛 경로가 다시 동작 | shim 제거를 **이동과 분리한 별도 PR**로 뒀을 것 |
| 규칙 승격 | 해당 규칙만 `error` → `warn` 으로 복귀 | 규칙별로 커밋을 나눴을 것 |

**되돌릴 수 없게 되는 지점을 의도적으로 만들어라.** Azure의 DB 예시가 같은 구조다 — 롤백은 "레거시 객체를 아직 지우지 않은 동안"만 가능하고, **레거시 삭제는 각 도메인의 의도적 최종 단계**여야 한다. 프론트엔드에선 **shim 제거가 그 지점**이다. shim이 살아 있는 동안은 언제든 되돌아갈 수 있다.

### 5-4. `git mv`로 히스토리 보존하기 — 정확히 어떻게 동작하는가

**오해 정정:** Git은 rename을 **객체 DB에 저장하지 않는다.** `git mv`는 "인덱스를 갱신"할 뿐이고(`git-mv` 문서: "The index is updated after successful completion, but the change must still be committed"), rename은 `git log`/`git diff` 같은 **포슬린 명령이 유사도 기반으로 탐지**한다.

핵심 수치 (`git-diff` / `git-config` 문서):
- `-M/--find-renames`의 **기본 유사도 임계값은 50%** — "파일의 50% 이상이 그대로면 삭제/추가 쌍을 rename으로 간주"
- `diff.renames` 설정의 **기본값은 `true`** — 즉 rename 탐지는 기본적으로 켜져 있다 (단, `git-diff-files` 같은 저수준 명령에는 적용되지 않음)
- `-M100%`이면 완전 동일한 경우만 rename으로 인정

**따라서 실무 규칙:**

```bash
# ① 이동 커밋에는 내용 수정을 최소로 — 유사도 50% 미만이면 rename으로 안 잡힌다
git mv src/components/OrderCard.tsx src/features/order/ui/OrderCard.tsx
git commit -m "[refactor] Move: OrderCard to features/order (pure move)"

# ② import 경로 갱신은 '다음' 커밋으로 분리
npx tsx scripts/codemod/rewrite-import-paths.ts
git commit -m "[refactor] Modify: update import paths after OrderCard move"

# ③ rename으로 잡혔는지 즉시 확인
git diff -M --stat HEAD~2 HEAD

# ④ 이후 이력 추적 (--follow는 '단일 파일'에만 동작한다)
git log --follow src/features/order/ui/OrderCard.tsx

# ⑤ 이동/codemod로 깨진 blame 복구 — 해당 커밋 SHA를 등록
echo "<codemod-commit-sha>" >> .git-blame-ignore-revs
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

- `.git-blame-ignore-revs`는 **레포 루트**에 있어야 GitHub 블레임 뷰에서도 자동 적용된다. GitHub 문서: "All revisions specified in the `.git-blame-ignore-revs` file, which must be in the root directory of your repository, are hidden from the blame view using Git's `git blame --ignore-revs-file` configuration setting."
- 파일 형식은 **축약하지 않은 오브젝트 이름을 한 줄에 하나씩**이며 `#` 주석과 공백은 무시된다.
- 한계도 GitHub 문서에 명시돼 있다: "revisions are excluded if the commit introduced new lines or modified existing lines. If the commit was the last to modify a line, it will still appear in blame."
- 파일 **사이**를 오간 코드 블록의 blame을 추적하려면 `git blame -C`(기본 임계 40자)를, 파일 **내부** 이동은 `-M`(기본 20자)을 쓴다.

### 5-5. 대규모 이동 PR의 리뷰 가능성 확보

리뷰어에게 "1,200개 파일 변경"을 던지면 리뷰는 형식적으로 통과된다. 리뷰 가능하게 만드는 것은 **PR 크기가 아니라 diff의 종류를 분리하는 것**이다.

**커밋을 3종으로 고정한다:**
1. `pure move` — `git mv`만. 리뷰어는 **파일 목록만** 본다
2. `codemod` — 스크립트 실행 결과만. 리뷰어는 **스크립트를 읽고** diff는 표본만 본다
3. `manual` — 사람이 손댄 것. 리뷰어는 **전부 정독**한다

**PR 본문 템플릿:**

```markdown
## 종류
[x] 이동 PR (로직 변경 0줄)

## 이동 범위
order 도메인 — 47 files

## 재현 명령 (누구나 동일 결과를 얻을 수 있어야 함)
git mv ...                                        (커밋 a1b2c3d)
npx tsx scripts/codemod/move-to-feature.ts        (커밋 d4e5f6a)
npx tsx scripts/codemod/rewrite-import-paths.ts   (커밋 7g8h9i0)

## 손수정 커밋 (여기만 정독 부탁)
- j1k2l3m — 동적 import 문자열 3곳 (codemod가 못 잡음)

## 검증 게이트
- [x] tsc --noEmit
- [x] depcruise 위반 312 → 271 (-41, 신규 0)
- [x] test 1,842 passed
- [x] build
- [x] size-limit: main 214.3 kB → 214.1 kB (-0.2 kB)

## 리뷰 팁
git diff -M --stat main...HEAD   # rename으로 접혀 보임
git log --oneline main...HEAD    # 커밋 3종 분리 확인
```

---

## 6. 테스트가 거의 없는 코드베이스에서의 리팩터링

Fowler의 정의상 리팩터링은 **"관찰 가능한 동작을 바꾸지 않고(without changing its observable behavior) 내부 구조를 바꾸는 것"** 이다. 테스트가 없으면 "안 바뀌었다"를 증명할 수단이 없다. 그래서 **안전망을 먼저 깔고 시작한다.**

### 6-1. Characterization test (황금 마스터)

Michael Feathers(WELC, 2004)가 명명한 기법. **"코드가 무엇을 해야 하는가"가 아니라 "지금 실제로 무엇을 하는가"를 기록**하는 테스트다.

절차:
1. 대상에 입력 세트를 넣고 **현재 출력을 관찰**한다
2. 그 출력을 그대로 기대값으로 박아 테스트를 쓴다 (이게 **골든 마스터**)
3. 리팩터링 후 같은 입력을 재생(replay)해 골든 마스터와 비교한다
4. 차이가 나면 **의도치 않은 동작 변경**이다

```ts
// tests/characterization/order-price.golden.test.ts
import { describe, it, expect } from "vitest";
import { calcOrderPrice } from "@/features/order/model/calcOrderPrice";
import cases from "./order-price.cases.json";   // 실서비스 로그에서 뽑은 입력 500건
import golden from "./order-price.golden.json"; // 리팩터링 전 코드로 생성한 출력

describe("calcOrderPrice — characterization (동작 고정용, 정답 명세 아님)", () => {
  it.each(cases.map((c, i) => [i, c] as const))("case %i", (i, input) => {
    expect(calcOrderPrice(input)).toEqual(golden[i]);
  });
});
```

**골든 마스터의 성질을 오해하지 마라:**
- 이건 **명세가 아니다.** 현재 버그까지 그대로 고정한다. 파일 상단에 반드시 명시한다
- 입력 세트는 **실제 트래픽 로그**에서 뽑아야 커버리지가 의미 있다. 손으로 만든 5건은 안전망이 아니다
- 골든 파일을 "테스트가 깨져서" 재생성하는 순간 안전망은 사라진다. **재생성은 PR에서 별도 승인 대상**으로 다룬다

**프론트엔드 폴더 이동에서의 실제 위치:** 순수 이동에는 characterization test가 과잉일 때가 많다. **구현 교체를 동반하는 단계**(Branch by Abstraction의 3~4단계)에서만 도입하고, 이동 단계에서는 6-2·6-3으로 충분한 경우가 대부분이다.

### 6-2. 타입체크와 빌드 산출물 비교를 안전망으로 쓰는 법

**순수 이동 리팩터링에 한해서는, 이 둘이 테스트보다 강력하다.**

```bash
# 이동 전 — 기준 스냅샷 확보
git switch main
npm run build
node scripts/snapshot-bundle.mjs dist > /tmp/before.json

# 이동 후
git switch refactor/move-order
npm run build
node scripts/snapshot-bundle.mjs dist > /tmp/after.json
node scripts/compare-bundle.mjs /tmp/before.json /tmp/after.json
```

```js
// scripts/snapshot-bundle.mjs — '청크 이름 집합'과 '청크별 크기'를 뽑는다
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
const files = readdirSync(dir, { recursive: true })
  .filter((f) => /\.(js|css)$/.test(f))
  .map((f) => ({
    // 파일명 해시는 제거해야 비교가 성립한다
    name: f.replace(/[-.][a-f0-9]{8,}\./, "."),
    size: statSync(join(dir, f)).size,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

console.log(JSON.stringify({ total: files.reduce((s, f) => s + f.size, 0), files }, null, 2));
```

**무엇을 기대할 수 있고 없는지 명확히:**

| 비교 항목 | 순수 이동에서 기대값 | 어긋나면 의미 |
|------|------|------|
| 총 번들 크기 | **거의 동일** (±1% 이내) | 트리셰이킹이 깨졌거나 배럴이 새로 생김 |
| 청크 개수 | 동일 | 동적 import 경계가 이동으로 바뀜 |
| 청크별 모듈 집합 | 동일 | 코드 스플리팅 재배치 — **초기 로드에 영향** |
| 파일명 해시 | **달라짐이 정상** | (비교 전에 제거해야 함) |

**타입체크의 한계 — 이건 반드시 알고 있어야 한다:**
- `any`/`as`로 도배된 레거시 구간은 **타입체크를 통과해도 런타임이 깨진다**
- ``import(`@/pages/${name}`)`` 같은 **문자열 조합 동적 import**는 타입체크·codemod 둘 다 못 잡는다 → 이동 전에 ``grep -rn 'import(`' src`` 로 전수 조사
- **모듈 side effect 순서**를 검증하지 못한다. 특히 **CSS import 순서** — 배럴 해체나 파일 이동으로 CSS가 번들에 들어가는 순서가 바뀌면 캐스케이드가 깨져 스타일이 무너진다. 타입체크·빌드·유닛테스트 전부 통과하고 화면만 깨진다
- `window`/전역 등록 패턴(레거시에 흔함)은 import 순서 의존이라 동일 위험

### 6-3. 스냅샷 / 시각 회귀를 임시 안전망으로 쓰는 법과 한계

6-2가 못 잡는 **CSS 순서·레이아웃 붕괴**를 잡을 수 있는 유일한 저비용 수단이 시각 회귀(VR)다. 그래서 **이동 기간 한정으로 켠다.**

**한계를 명확히 인식하고 쓸 것:**

| 수단 | 커버 | **미커버** |
|------|------|------|
| DOM 스냅샷 (`toMatchSnapshot`) | 렌더 결과 구조 | 이벤트 핸들러 동작, 비동기 상태 전이, 실제 스타일 |
| 시각 회귀 (Playwright/Storybook) | 렌더된 픽셀 = **CSS 순서 붕괴 탐지 가능** | 상호작용 이후 상태, 데이터 조건 분기, 접근성 |

**공통 함정:**
- 스냅샷은 **"현재가 옳다"는 가정**을 고정한다 → 기존 버그까지 정답이 된다 (골든 마스터와 동일한 성질)
- **깨지면 무심코 `-u`로 갱신**하게 된다. 갱신이 습관이 되는 순간 안전망이 아니라 노이즈다 → 이동 기간에는 **스냅샷 갱신을 별도 PR로 강제**한다
- 유지비가 높다 → **폐기 시점을 처음부터 명시한다.** "order 도메인 이동 완료 후 이 스냅샷 스위트는 삭제하고 실제 동작 테스트로 대체" 같은 문장을 파일 상단과 이슈에 남긴다
- VR은 렌더 환경(폰트·OS·브라우저 버전)에 민감해 **false positive가 많다** → 이동 기간에만 쓰고 임계값을 다소 느슨하게 잡는다

---

## 7. 작업 순서 설계

### 7-1. 의존 그래프의 리프부터 올라가기

```bash
# 순환 참조와 고아 모듈부터 파악 — 순환이 남아 있으면 이동 순서를 정할 수 없다
npx depcruise src --config --output-type err-long

# 안정성 지표(metrics 리포터)로 "누가 리프인지" 정량 확인
npx depcruise src --config --output-type metrics
```

**리프(다른 것을 거의 참조하지 않고, 참조도 적게 받는 모듈)부터 옮기는 이유:**
1. 이동 시 **갱신해야 할 참조 파일 수가 적다** → PR이 작고 리뷰 가능
2. 동시에 열려 있는 기능 브랜치와 **충돌 확률이 낮다**
3. 실패해도 **되돌리기 영향 범위가 좁다**
4. 초기에 codemod 스크립트의 **버그를 저비용으로 발견**할 수 있다

**순서:** 리프 컴포넌트/훅 → 도메인 내부 모듈 → 도메인 진입점(페이지/라우트) → 마지막에 shared.

### 7-2. shared/공통 유틸을 먼저 정리해야 하는 이유 — "먼저"가 뜻하는 것

7-1과 모순돼 보이지만 아니다. **두 가지를 구분해야 한다.**

| | shared | 도메인 리프 |
|---|---|---|
| **경계·공개 API 확정** | **가장 먼저** | 나중 |
| **대량 파일 이동** | **가장 마지막**, 한 번에 | 먼저, 여러 번 나눠서 |

**shared의 경계를 먼저 확정해야 하는 이유:**
- shared는 **피의존이 가장 큰 모듈**이다. 나중에 shared 구조를 바꾸면 **이미 옮긴 모든 도메인의 import를 또 고쳐야 한다** → 재작업이 도메인 수만큼 곱해진다
- 도메인을 옮기다 보면 "이건 shared로 올려야 하나?"를 매번 판단하게 된다. shared의 수용 기준(무엇이 shared에 들어갈 자격이 있는가)이 없으면 **판단이 PR마다 달라지고 shared가 쓰레기통이 된다**
- shared 경계 규칙(`shared는 features를 import할 수 없다`)을 **먼저 켜 두면**, 이후 도메인 이동에서 잘못된 의존이 즉시 게이트에 걸린다

**shared의 대량 이동을 마지막에 하는 이유:** 피의존이 가장 커서 **충돌 폭발이 가장 크다**. 진행 중 기능 브랜치가 가장 적은 시점(릴리즈 직후 등)에 **하루 안에 끝내는 단일 PR**로 처리한다.

```js
// .dependency-cruiser.js — 준비 PR 시점에 shared 경계부터 정의한다
module.exports = {
  forbidden: [
    {
      name: "shared-no-features",
      comment: "shared는 어떤 도메인도 알아서는 안 된다",
      severity: "warn", // ← 준비 단계에서는 warn, 정리 PR에서 error로 승격
      from: { path: "^src/shared" },
      to: { path: "^src/features" },
    },
    {
      name: "no-cross-feature",
      comment: "도메인 간 직접 참조 금지 — 공개 API(index)만 허용",
      severity: "warn",
      from: { path: "^src/features/([^/]+)/" },
      to: { path: "^src/features/(?!$1)([^/]+)/(?!index)" },
    },
    { name: "no-circular", severity: "error", from: {}, to: { circular: true } },
  ],
  options: {
    tsConfig: { fileName: "tsconfig.json" }, // paths 별칭 해석에 필수
    doNotFollow: { path: "node_modules" },
  },
};
```

### 7-3. 진행 중인 기능 브랜치와의 충돌 최소화

Fowler의 브랜칭 패턴 문서가 핵심 근거를 준다.

> "Refactoring is at its most effective when it's done regularly and with little friction. Refactoring will introduce conflicts, if these conflicts aren't spotted and resolved quickly, merging gets fraught."
> "Feature Branching also discourages developers from making changes that aren't seen as part of the feature being built, which undermines the ability of refactoring to steadily improve a code base."

그리고 가장 위험한 것 — **Semantic Conflict**: "when Scarlett changes the name of a function, and Violet adds some code to her branch that calls this function under its old name." **텍스트 머지는 깨끗하게 되는데 시스템은 깨진다.** 파일 이동은 이 문제의 교과서적 사례다 — 옮긴 파일을 참조하는 코드를 다른 브랜치가 옛 경로로 추가하면, git은 충돌을 보고하지 않는다.

**실행 규칙:**

| 규칙 | 이유 |
|------|------|
| 이동 PR의 **수명을 하루 이내**로 | 오래 열어 두면 rebase 비용이 급격히 는다 |
| **codemod 스크립트를 먼저 머지**(PR 유형 2)하고 적용은 나중에 | 다른 브랜치 담당자가 자기 브랜치에서 같은 스크립트를 돌려 셀프 해결 가능 |
| 이동 머지 직전 **팀에 사전 공지**, 머지 직후 **전원 rebase** | semantic conflict를 컴파일 시점으로 앞당김 |
| 진행 중 브랜치가 **적은 시점**을 골라 머지 (릴리즈 직후, 스프린트 경계) | 충돌 대상 자체를 줄임 |
| **shim을 남긴다** | 다른 브랜치가 옛 경로로 쓴 코드가 **머지 후에도 컴파일된다** → semantic conflict가 빌드 실패로 터지지 않음 |
| 큰 기능 브랜치가 열려 있으면 **그것을 먼저 머지**하고 이동을 뒤로 | 이동은 codemod 재실행으로 rebase가 쉽지만, 기능 브랜치는 그렇지 않다 |

> **shim이 semantic conflict의 실질적 완충재다.** 옛 경로가 살아 있으면, 다른 브랜치가 옛 경로로 작성한 코드는 머지 후에도 정상 동작한다. 그 코드는 다음 codemod 실행에서 함께 이전된다.

### 7-4. 코드 프리즈 없이 진행하는 방법

**코드 프리즈가 필요해지는 이유는 "옛 경로가 죽어 있는 시간"이 존재하기 때문**이다. Parallel Change로 그 시간을 0으로 만든다.

```
[expand]   신규 경로에 실체를 두고, 옛 경로는 re-export shim으로 남긴다
           → 이 시점에 옛 경로·새 경로 둘 다 동작한다. 프리즈 불필요.
              ↓
[migrate]  호출부를 codemod로 점진 이전한다. 여러 PR로 나눠도 되고,
           중간에 몇 주 멈춰도 시스템은 정상이다.
              ↓
[contract] 옛 경로 사용처가 0이 되면 shim 삭제 + 규칙을 error로 승격
```

```ts
// src/components/OrderCard.tsx — expand 단계의 shim
/**
 * @deprecated 2026-10-31 삭제 예정.
 * 신규 코드는 "@/features/order/ui/OrderCard" 에서 import 할 것.
 */
export * from "@/features/order/ui/OrderCard";
```

**shim을 안전하게 운영하는 규칙:**
- **만료일을 주석과 이슈 양쪽에 박는다.** 만료일 없는 shim은 영구화되고, 그러면 배럴 문제(4-2)가 그대로 재발한다
- **신규 사용을 lint로 차단한다.** 기존 사용은 통과, 새로 쓰는 것만 막는다:

```js
// eslint.config.js
export default [{
  rules: {
    "no-restricted-imports": ["error", {
      patterns: [{
        group: ["@/components/*"],
        message: "레거시 경로입니다. @/features/*/ui 또는 @/shared/ui 를 사용하세요.",
      }],
    }],
  },
}];
```

  `patterns`의 `group`은 gitignore 스타일 패턴이고 `!` 로 부정할 수 있다(정규식이 필요하면 `regex`를 쓰되 `group`과 함께 쓸 수 없다). 기존 파일 전체를 한 번에 못 고칠 때는 `dependency-cruiser`의 baseline(8-2)으로 기존 위반만 면제한다.
- **shim 사용처 카운트를 지표로 노출한다**(8-1). 줄지 않으면 migrate 단계가 멈춘 것이다

---

## 8. 진행 상황 추적

### 8-1. 남은 위반 수를 지표로 삼기

**"몇 % 완료"는 재구조화에서 쓸모없는 지표다.** 옮긴 파일 수는 남은 리스크를 말해 주지 않는다. **실제로 추적해야 하는 것은 "규칙 위반 수"다** — 0으로 수렴해야 하는, 정의가 명확한 수치다.

**주간 추적 지표 3종:**

| 지표 | 측정 방법 | 목표 |
|------|------|------|
| 경계 규칙 위반 수 | `depcruise src --config --output-type err --no-ignore-known` 결과 카운트 | 단조 감소, 신규 0 |
| 레거시 경로(shim) 사용처 수 | `grep -rn "@/components/" src --include="*.ts*" \| wc -l` | 0 |
| 배럴 경유 import 수 | `grep -rn 'from "@/shared/ui"' src \| wc -l` | 0 |

```bash
# scripts/track-progress.sh — CI에서 주 1회 돌려 시계열로 쌓는다
DATE=$(date +%F)
VIOLATIONS=$(npx depcruise src --config --output-type err --no-ignore-known 2>&1 \
  | grep -cE "^(error|warn) " || true)
SHIM=$(grep -rn "@/components/" src --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
BARREL=$(grep -rn 'from "@/shared/ui"' src --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
echo "$DATE,$VIOLATIONS,$SHIM,$BARREL" >> docs/refactoring-progress.csv
```

`--no-ignore-known`을 붙이는 이유: baseline으로 면제된 것까지 포함한 **진짜 잔량**을 봐야 추이가 의미 있다.

### 8-2. baseline으로 "지금부터 나빠지지 않기"를 강제

수천 개 파일에 규칙을 `error`로 켜면 CI가 즉사한다. dependency-cruiser의 **baseline(알려진 위반)** 기능이 이 문제를 정확히 푼다.

```bash
# ① 현재 위반을 baseline으로 기록 (준비 PR에서 1회)
npx depcruise src --config --output-type baseline \
  --output-to .dependency-cruiser-known-violations.json
# 동일 동작 축약 명령
npx depcruise-baseline src

# ② CI — 기존 위반은 무시하고 '신규' 위반만 실패시킨다
npx depcruise src --config --ignore-known
#   → err/err-long 리포터가 "⚠ 20 known violations ignored." 배너를 띄운다

# ③ 진짜 잔량 확인
npx depcruise src --config --no-ignore-known --output-type err-long
```

`--ignore-known`은 매칭되는 위반의 **severity를 `ignore`로 낮춘다.** 기본 파일명은 `.dependency-cruiser-known-violations.json`이며 `--ignore-known <filename>` 으로 다른 파일을 지정할 수 있다.

> **⚠️ 절대 금지: CI에서 baseline을 매번 재생성하는 것.** 그러면 새 위반이 자동으로 면제되어 회귀가 은폐된다. baseline은 **커밋해 두고, 위반을 고칠 때마다 줄여 나가는 파일**이다. baseline이 커지는 PR은 리뷰에서 반려한다.

**baseline 파일 크기 자체가 최고의 진행 지표다.** `git log -p .dependency-cruiser-known-violations.json`으로 감소 추이를 그대로 볼 수 있다.

### 8-3. 중단해도 손해가 없도록 단계를 설계하는 법

재구조화는 **거의 항상 중간에 멈춘다** (우선순위 변경, 인력 이동, 릴리즈 압박). 그래서 **"멈춘 상태가 시작 전보다 나쁘지 않을 것"** 이 설계 제약이어야 한다.

**모든 단계는 아래 4조건을 만족하는 지점에서 끝나야 한다:**

1. **빌드·테스트가 통과한다** — 당연하지만, "다음 PR에서 고칠게요"를 허용하면 깨진다
2. **신·구 구조가 공존 가능하다** — shim이 살아 있고 옛 경로도 동작한다
3. **경계 규칙 승격 범위가 명확하다** — 이번에 `error`로 올린 규칙이 무엇인지 기록돼 있다
4. **다음에 할 일이 코드에 남아 있다** — shim의 `@deprecated` 주석 + 만료일, baseline 파일. **문서가 아니라 도구가 기억한다**

**중단 안전성 자가 점검:**

| 질문 | 아니오면 |
|------|------|
| 지금 멈추면 새 팀원이 **어느 구조를 따라야 할지** 알 수 있나? | lint 규칙으로 신규 경로를 강제하라 (7-4) |
| 지금 멈추면 **되돌아갈 수 있나?** | shim을 지우지 마라 (5-3) |
| 지금 멈추면 **다시 나빠지나?** | baseline + `--ignore-known`으로 회귀를 막아라 (8-2) |
| 지금 멈추면 **어디까지 했는지** 6개월 뒤에 알 수 있나? | 지표 CSV와 baseline을 커밋하라 (8-1) |

**나쁜 단계 설계 vs 좋은 단계 설계:**

```
❌ 나쁨: "전체 파일을 새 폴더로 옮긴다 → 그다음 import를 고친다 → 그다음 규칙을 켠다"
        → 1단계에서 멈추면 빌드가 깨진 채로 남는다

✅ 좋음: "order 도메인만: 이동 + import 갱신 + shim + 규칙 warn까지 한 사이클"
        → 여기서 멈춰도 빌드 정상, 되돌리기 가능, 다음 도메인은 같은 절차 반복
```

---

## 9. 언제 이 절차를 쓰고, 언제 쓰지 않는가

**적합:**
- 소스 파일 수백~수천 개, **서비스가 계속 배포되어야 하는** 코드베이스
- 목표 구조가 이미 합의되어 있고, 남은 문제가 "어떻게 옮기느냐"인 경우
- 여러 명이 동시에 기능 개발 중이라 코드 프리즈가 불가능한 경우

**부적합 — 더 단순한 방법을 써라:**
- 파일 수십 개 → `git mv` + IDE 리팩터로 끝난다. codemod 인프라가 오히려 비용
- **목표 구조가 아직 합의되지 않음** → 이동부터 하면 두 번 옮기게 된다. 경계 정의(`architecture/ddd`)가 먼저
- 곧 폐기될 코드 / 프로토타입 → 옮길 이유가 없다
- **테스트도 없고 타입도 없고(순수 JS) 빌드 산출물 비교도 불가능** → 안전망이 하나도 없다. 타입스크립트 도입이나 characterization test 확보가 선행 과제

---

## 10. 흔한 실패 패턴

| 실패 패턴 | 왜 실패하나 | 올바른 접근 |
|------|------|------|
| **빅뱅 리팩터** — 한 PR에 전부 옮김 | 리뷰 불가, revert 불가, 머지 시점에 모든 기능 브랜치가 동시에 깨짐 | 도메인 단위 사이클 반복 (8-3) |
| **기능 개발과 구조 변경을 같은 PR에 섞기** | revert하면 기능까지 사라짐. diff에서 로직 변경이 이동에 묻혀 리뷰를 못 받음 | PR 유형 4종 분리 (5-1) |
| **이동만 하고 경계 규칙을 안 켬** | 새 구조를 지킬 강제력이 없음 → 몇 주 안에 `features → features` 직접 참조가 다시 생겨 원상 복귀 | 이동과 같은 사이클에 규칙을 `warn`으로 켜고, 정리 PR에서 `error` 승격 (7-2, 8-2) |
| **shim을 만들고 만료일을 안 정함** | 옛 경로가 영구화 → 배럴/중복 경로가 남아 구조가 두 개가 됨 | `@deprecated` + 만료일 + 사용처 카운트 지표 (7-4, 8-1) |
| **CI에서 baseline 재생성** | 신규 위반이 자동 면제되어 회귀가 은폐됨 | baseline은 커밋 후 **줄여 나가는** 파일 (8-2) |
| **이동과 이름 변경을 한 커밋에** | 유사도 50% 미만이면 git이 rename으로 인식 못 함 → 히스토리 단절 | `git mv` 커밋과 내용 수정 커밋 분리 (5-4) |
| **codemod를 로컬에서만 돌리고 스크립트를 안 커밋** | 다른 브랜치에 재실행 불가 → 충돌을 전부 손으로 해결 | 스크립트를 별도 PR로 먼저 머지 (7-3) |
| **번들 diff 게이트 생략** | 이동으로 코드 스플리팅이 붕괴해도 아무도 모름. 초기 로드 회귀가 몇 주 뒤 발견됨 | 이동 PR 필수 게이트 5종에 포함 (5-2) |
| **동적 import 문자열을 codemod가 처리했다고 가정** | 문자열 조합 동적 import는 AST 상 변환 대상이 아니라 타입체크·빌드를 통과한 뒤 런타임에 터짐 | 이동 전 전수 grep → 손수정 커밋으로 분리 (6-2) |
| **CSS import 순서 변경을 검증 안 함** | 타입체크·테스트·빌드 전부 통과하고 화면만 무너짐 | 이동 기간 한정 VR 안전망 (6-3) |
| **`--extensions` 기본값(js) 그대로 jscodeshift 실행** | "0 files transformed"인데 성공한 줄 알고 넘어감 | `--extensions=ts,tsx --parser=tsx` 명시 (4-2) |
| **shared를 마지막에 "정의"** | 도메인을 옮길 때마다 shared 기준이 흔들려 재작업이 도메인 수만큼 곱해짐 | shared는 **경계를 먼저**, **이동은 마지막에** (7-2) |
| **`move()`가 별칭 import까지 고쳐줄 거라 가정** | 공식 문서 보장 범위는 **상대 경로 지정자**뿐 → 별칭 참조가 끊긴 채 남음 | `move()` 다음에 경로 재작성 codemod를 이어서 실행 (3-3) |
| **TS7 환경에서 ts-morph가 안 되니 codemod 자체를 포기** | 6.0 API side-by-side로 해결 가능한 문제 | `@typescript/typescript6` 별칭 설치 또는 jscodeshift로 대체 (0절) |
