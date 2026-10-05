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

> **⚠️ 실행 검증(2026-09-28)으로 정정**: `move(filePath)`의 공식 타입 시그니처 JSDoc은 대상 경로를
> **"relative to the ORIGINAL file, or an absolute path"** 로 명시한다(ts-morph.d.ts 원문, ts-morph.com/details/source-files와 동일 표현).
> 즉 아래처럼 `MOVES` 배열에 **프로젝트 루트 기준 상대경로**(`"src/features/order/ui/OrderCard.tsx"`)를 그대로 넘기면,
> `move()`는 이를 **이동 대상 파일 자신의 디렉터리 기준 상대경로**로 해석해버려 `src/components/src/features/order/ui/OrderCard.tsx`
> 같은 **중첩된 잘못된 경로**로 이동한다 — 실제 프로젝트에 이 스니펫을 그대로 실행해 재현 확인됨.
> 반드시 `to`를 **절대 경로로 변환(`path.resolve(to)`)한 뒤** `move()`에 넘긴다.

```ts
// scripts/codemod/move-to-feature.ts
import { Project } from "ts-morph";
import { resolve } from "node:path";

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
  sf.move(resolve(to));     // ← 절대 경로로 변환 필수(위 주의 참조). 참조하던 다른 파일들의 '상대 경로' 지정자까지 갱신됨
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
