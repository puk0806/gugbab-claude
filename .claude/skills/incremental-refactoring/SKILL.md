---
name: incremental-refactoring
user-invocable: false
description: 수천 파일 프론트엔드 점진 재구조화에서 모델이 놓치는 최신 변경점과 실측 함정 - TypeScript 7 API 부재로 ts-morph 불가(6.0 side-by-side·7.1 Beta API), ts-morph move() 절대경로 필수·별칭 미갱신, jscodeshift --extensions 기본 js, git mv rename 50% 유사도, .git-blame-ignore-revs, size-limit 14 rolldown, PR 유형 분리·게이트·shim과 semantic conflict, baseline CI 재생성 금지
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
> 소스: https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/ (TypeScript 7.1 Beta, 2026-10-20)
> 소스: https://github.com/ai/size-limit/blob/main/CHANGELOG.md (size-limit 14.x)
> 검증일: 2026-11-09 (재검증, 이전 2026-09-28 실사용 검증 v1.1 · 2026-09-26 주기 재검증 · 최초 2026-08-26)

---

## 이 스킬의 범위

"목표 구조로 옮기기로 결정했다" 다음 단계 — **수천 파일을 서비스 중단 없이 옮길 때의 도구 버전 함정과 실측 함정**만 다룬다. 구조 선택은 `frontend-domain-structure`, 경계 규칙 설정은 `module-boundaries`, 특성화 테스트는 `characterization-testing`.

> 기본 사용법(Strangler Fig·Branch by Abstraction·Parallel Change 개념 해설, ts-morph/jscodeshift 기본 API·예제, 리프부터 옮기기 같은 일반 원칙)은 공식 문서 수준이라 싣지 않는다. 골격: 실체를 새 위치로 옮기고 옛 경로에 re-export shim(expand) → 호출부를 codemod로 이전(migrate) → shim 삭제 + 규칙 error 승격(contract).

---

## 0. 버전 기준

| 도구 | 최신 안정 버전 (2026-11-09 재확인) | 역할 |
|------|------|------|
| `ts-morph` | **28.0.0** (`@ts-morph/common` 0.29.0, 변동 없음) | TypeScript 컴파일러 API 래퍼. 타입/모듈 해석이 필요한 codemod |
| `jscodeshift` | **17.4.0** (Node >= 16, 변동 없음) | Babel/recast 기반 AST codemod 러너. 순수 구문 변환 |
| `dependency-cruiser` | **18.7.2** (09-26 확인 시 18.4.0 → 마이너 갱신, Node ^22 \|\| ^24 \|\| >=26 변동 없음) | 의존 규칙 검증 + baseline(알려진 위반) 관리 |
| `eslint-plugin-boundaries` | **7.4.2** (09-26 확인 시 7.2.0, peer eslint >=6 변동 없음 — 7.2.1 보안 패치 포함이므로 7.2.0은 피함) | ESLint 레벨 아키텍처 경계 규칙 |
| `tsconfig-paths` | **4.2.0** | codemod 안에서 `paths` 별칭을 직접 해석할 때 |
| `size-limit` | **14.3.0** (09-26 확인 시 13.0.3 → **메이저 14**. Node `^22.19 \|\| ^24.5 \|\| >=26`, `@size-limit/preset-small-lib` 기본 번들러가 rolldown 으로 바뀜 — 13→14 전후 수치를 같은 게이트에서 비교하지 말 것) | 번들 크기 게이트 |
| TypeScript | **7.0.2** (JS 구현 계열은 6.0.2, `7.1.0-beta` 2026-10-20 공개) | — |

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

> 재검증(2026-09-26): TypeScript 7.1의 신규 프로그래매틱 API는 **아직 출시되지 않았다**(공식 iteration plan 기준 7.1 Beta 2026-10-06 / RC 2026-11-10 / Stable 2026-11-24 예정). 즉 이 절의 side-by-side 회피책은 2026-09-26 현재도 여전히 유효한 최선의 방법이다. 7.1 stable 출시 시 이 절 전체를 재검증해야 한다.

> 재검증(2026-11-09): **TypeScript 7.1 Beta가 2026-10-20 공개**되어 새 프로그래매틱 API가 생겼다. 다만 기존 6.0 API와 **다른 형태**(`typescript/sync`·`typescript/async`·`typescript/fs`·`typescript/ast`·`typescript/ast/is`·`typescript/ast/factory` 진입점, `update*` 는 불변 갱신)이고, 공식 발표문은 RC를 "약 한 달 뒤", 정식을 "그 직후"로만 밝혔다. ts-morph 최신(28.0.0)은 여전히 6.0 API 기준이므로 **위 side-by-side 회피책은 2026-11-09 현재도 유효**하다. 7.1 API로 codemod 를 새로 짜는 것은 베타 API 변경 위험을 감수할 때만 고려한다.
> 주의: 미검증 — ts-morph 가 7.1 API 를 지원할지·시기는 공식 발표가 없다.

TS7 side-by-side 환경에서는 타입체크 게이트도 `tsc6 --noEmit`.

---

## 1. codemod 실측 함정

### ts-morph

- `tsConfigFilePath`만 주면 `paths` 별칭 해석이 컴파일러와 동일하게 동작한다. 모노레포에서 패키지마다 tsconfig가 다르면 **패키지별로 `Project`를 따로** 만든다(섞으면 별칭 해석이 어긋난다). 대형 레포는 `skipAddingFilesFromTsConfig: true` + `addSourceFilesAtPaths`로 범위를 좁힌다.
- import 재작성 시 `getImportDeclarations()`만 보지 말고 `getExportDeclarations()`(배럴 re-export)도 함께 처리한다. `--dry` 플래그로 저장 없이 건수부터 확인.

> **⚠️ 실행 검증(2026-09-28)으로 정정**: `move(filePath)`의 공식 타입 시그니처 JSDoc은 대상 경로를
> **"relative to the ORIGINAL file, or an absolute path"** 로 명시한다(ts-morph.d.ts 원문, ts-morph.com/details/source-files와 동일 표현).
> 즉 **프로젝트 루트 기준 상대경로**(`"src/features/order/ui/OrderCard.tsx"`)를 그대로 넘기면,
> `move()`는 이를 **이동 대상 파일 자신의 디렉터리 기준 상대경로**로 해석해버려 `src/components/src/features/order/ui/OrderCard.tsx`
> 같은 **중첩된 잘못된 경로**로 이동한다(경고·에러 없이 조용히 성공한 것처럼 보임) — 실제 프로젝트에 스니펫을 그대로 실행해 재현 확인됨.
> 반드시 `to`를 **절대 경로로 변환(`path.resolve(to)`)한 뒤** `move()`에 넘긴다.

```ts
const sf = project.getSourceFile(from);
if (!sf) { missing.push(from); continue; }   // 없으면 모아서 process.exit(1) — 조용히 일부만 이동시키지 않는다
sf.move(resolve(to));                        // 절대 경로 필수
```

**⚠️ 별칭(alias) import는 `move()`가 갱신하지 않는다.** 공식 문서가 갱신 범위를 "**relative** import and export declarations in the moving file and ... in other files"로 한정한다. `@/components/OrderCard` 같은 비상대 지정자는 보장 밖 → **`move()` 다음에 경로 재작성 codemod**를 이어서 실행한다. `copy()`는 갱신 범위가 복사된 파일 내부로 한정된다.

- `move()`는 git 명령을 대신하지 않는다 — `saveSync()` 시점에 삭제+생성으로 반영된다(rename 기록은 2절).
- `organizeImports()` 공식 경고: "This will forget all the previously navigated nodes so it's recommended to make this either the first or last action you do to a source file." → 파일당 마지막 동작으로.
- `save()`/`saveSync()`는 emit이 아니다.

### jscodeshift

> **`--extensions` 기본값이 `js`**라는 점이 실전에서 가장 흔한 사고 원인이다. TSX 프로젝트에서 "0 files transformed"가 나오면 여기부터 의심한다. `--parser`도 **기본 `babel`** — `--parser=tsx --extensions=ts,tsx`를 명시하거나 변환 파일에 `module.exports.parser = "tsx"`.

- `api.stats()`는 **`--dry` 실행에서만 동작**하는 카운터.
- 반환값 규약: 입력과 다른 문자열 = 변환 성공 / 동일 문자열 = 변환 실패 / 아무것도 반환 안 함 = 미변환.
- 모듈 해석 기능이 없다(`fileInfo`는 경로·소스뿐) → 별칭 해석은 `tsconfig-paths`의 `createMatchPath`로 직접 하거나, **해석이 필요한 매핑은 ts-morph로 생성(`getExportedDeclarations()`가 `export *`를 따라간 실제 선언 위치를 준다) → 텍스트 변환은 jscodeshift로 적용**한다.
- 배럴 해체 시 default/namespace import가 섞이면 건드리지 말고 리포트만, `import type`은 `importKind`로 보존.

| 판단 | 선택 |
|------|------|
| 파일 이동·심볼 추적·배럴 해석 | ts-morph |
| 순수 구문 치환을 수천 파일에·JS/Flow 코드베이스·TS7 전환기 | jscodeshift |
| "이 변환을 다른 브랜치에도 한 번 더 돌려야 하나?" | 그렇다면 무조건 codemod로 만들고 스크립트를 커밋(IDE 리팩터는 재실행 불가) |

---

## 2. git으로 히스토리 보존 — 정확한 동작

Git은 rename을 객체 DB에 저장하지 않는다. `git mv`는 인덱스만 갱신하고("The index is updated after successful completion, but the change must still be committed"), rename은 `git log`/`git diff`가 **유사도 기반으로 탐지**한다.

- `-M/--find-renames` **기본 유사도 임계값 50%** — 이동 커밋에서 내용을 많이 바꾸면 rename으로 안 잡혀 히스토리가 끊긴다. `diff.renames` 기본값은 `true`(저수준 `git-diff-files`에는 미적용). `-M100%`면 완전 동일만 인정.
- 따라서 **`git mv` 커밋 → import 경로 갱신 커밋**을 분리하고 `git diff -M --stat HEAD~2 HEAD`로 즉시 확인. `git log --follow`는 단일 파일에만 동작.
- `.git-blame-ignore-revs`에 codemod 커밋 SHA 등록 + `git config blame.ignoreRevsFile .git-blame-ignore-revs`. GitHub: "...which must be in the root directory of your repository, are hidden from the blame view" — **레포 루트**에 있어야 한다. 형식은 축약하지 않은 오브젝트 이름 한 줄에 하나(`#` 주석 허용). 한계: "If the commit was the last to modify a line, it will still appear in blame."
- 파일 **사이** 이동 코드 blame은 `git blame -C`(기본 40자), 파일 **내부** 이동은 `-M`(기본 20자).

---

## 3. PR 분할·게이트·되돌리기

**한 PR은 정확히 한 유형:** ① 준비(경계 규칙 전부 `warn`·baseline·스켈레톤, 이동 0건) ② codemod 스크립트(적용 0건, `--dry` 로그) ③ 이동(순수 이동+참조 갱신+shim, **로직 변경 0줄·이름 변경 0건·포맷터 재적용 0건**, 1 도메인) ④ 정리(shim 제거·`warn`→`error` 승격 1개). 이동 대상 100파일 초과 또는 rename이 아닌 수정 파일 30개 초과면 쪼갠다. 커밋은 `pure move` / `codemod` / `manual` 3종으로 고정해 리뷰어가 manual만 정독하게 한다.

**이동 PR 게이트 5종:** 타입체크 → 경계 규칙(위반 증가 없음) → 테스트 → 빌드 → **번들 diff**.

> **번들 diff를 반드시 넣어라.** 폴더 이동은 "동작은 같은데 청크 경계가 바뀌는" 대표적 변경이다. 배럴을 해체하면 보통 좋아지지만, 동적 import 경계를 가로지르는 파일을 옮기면 **공통 청크가 쪼개지며 초기 로드가 커진다.** 비교 전 파일명 해시를 제거하고, 순수 이동이면 총 크기 ±1%·청크 개수·청크별 모듈 집합이 동일해야 한다.

**타입체크·codemod가 못 잡는 것:**
- ``import(`@/pages/${name}`)`` 같은 **문자열 조합 동적 import** → 이동 전 ``grep -rn 'import(`' src``로 전수 조사, 손수정 커밋으로 분리.
- **CSS import 순서** — 배럴 해체·이동으로 번들 내 CSS 순서가 바뀌면 캐스케이드가 깨진다. 타입체크·빌드·유닛테스트 전부 통과하고 화면만 무너진다 → **이동 기간 한정 시각 회귀** 안전망(폐기 시점 명시, 스냅샷 갱신은 별도 PR, 임계값은 다소 느슨하게).
- `any`/`as` 레거시 구간, `window`/전역 등록처럼 import 순서에 의존하는 side effect.
- characterization test는 순수 이동에는 과잉인 경우가 많고, **구현 교체 단계**(Branch by Abstraction 3~4단계)에서 도입한다.

**되돌리기:** 이동 PR은 로직 0줄일 때만 `git revert -m 1`로 깨끗하다. **shim 제거가 되돌릴 수 없게 되는 지점**이다 — shim이 살아 있는 동안은 언제든 되돌아갈 수 있으므로 shim 제거는 이동과 분리된 별도 PR로 둔다.

---

## 4. 브랜치 충돌·프리즈 없이 진행

- **Semantic Conflict**(Fowler): 다른 브랜치가 옛 경로로 새 코드를 추가하면 git은 충돌을 보고하지 않는데 시스템은 깨진다. **shim이 실질적 완충재**다 — 옛 경로로 쓴 코드도 머지 후 컴파일되고 다음 codemod 실행에서 함께 이전된다.
- codemod 스크립트를 **먼저 머지**(다른 브랜치가 셀프 적용), 이동 PR 수명은 하루 이내, 머지 직전 공지·직후 전원 rebase, 진행 중 브랜치가 적은 시점(릴리즈 직후). 큰 기능 브랜치가 열려 있으면 그것을 먼저 머지.
- shim에는 `@deprecated` + **만료일**(주석과 이슈 양쪽)을 박고, `no-restricted-imports`로 **신규 사용만** 차단한다. 만료일 없는 shim은 영구화되어 구조가 두 개가 된다. `patterns`의 `group`과 `regex`는 함께 쓸 수 없다.
- shared는 **경계·공개 API는 가장 먼저 확정**(나중에 바꾸면 이미 옮긴 모든 도메인을 다시 고침), **대량 이동은 가장 마지막에** 하루 안에 단일 PR로.

---

## 5. 진행 추적 — baseline

- 진행 지표는 "몇 % 완료"가 아니라 **규칙 위반 수·shim 사용처 수·배럴 경유 import 수**(주간 CSV 커밋).
- `npx depcruise src --config --output-type baseline --output-to .dependency-cruiser-known-violations.json`(축약 `npx depcruise-baseline src`) → CI는 `--ignore-known`(매칭 위반의 severity를 `ignore`로 낮춤, "⚠ N known violations ignored." 배너). 진짜 잔량은 `--no-ignore-known`.

> **⚠️ 절대 금지: CI에서 baseline을 매번 재생성하는 것.** 그러면 새 위반이 자동으로 면제되어 회귀가 은폐된다. baseline은 **커밋해 두고, 위반을 고칠 때마다 줄여 나가는 파일**이다. baseline이 커지는 PR은 리뷰에서 반려한다.

- **중단해도 손해가 없게**: 모든 단계는 빌드·테스트 통과, 신·구 공존(shim 생존), 승격 범위 기록, 다음 할 일이 코드에(shim `@deprecated`·baseline) 남은 지점에서 끝낸다. ❌ "전체 이동 → import 수정 → 규칙" / ✅ "order 도메인만: 이동 + import 갱신 + shim + 규칙 warn까지 한 사이클".

---

## 6. 흔한 실패 패턴

| 실패 | 올바른 접근 |
|------|------|
| 빅뱅 리팩터 / 기능 개발과 이동을 같은 PR에 | 도메인 단위 사이클, PR 유형 4종 분리 |
| 이동만 하고 경계 규칙을 안 켬 | 같은 사이클에 `warn`, 정리 PR에서 `error` |
| shim 만료일 없음 | `@deprecated` + 만료일 + 사용처 카운트 |
| CI에서 baseline 재생성 | 커밋 후 줄여 나가는 파일 |
| 이동과 이름 변경을 한 커밋에 | 유사도 50% 미만 → rename 미인식. 커밋 분리 |
| codemod를 로컬에서만 돌림 | 스크립트를 별도 PR로 먼저 머지 |
| 번들 diff 게이트 생략 | 이동 PR 필수 게이트에 포함 |
| 동적 import 문자열을 codemod가 처리했다고 가정 | 전수 grep → 손수정 커밋 |
| CSS import 순서 미검증 | 이동 기간 한정 VR |
| jscodeshift `--extensions` 기본값(js) | `--extensions=ts,tsx --parser=tsx` |
| `move()`가 별칭 import까지 고쳐준다고 가정 | `move()` 다음 경로 재작성 codemod |
| `move()`에 프로젝트 루트 기준 상대경로 | `path.resolve(to)` |
| TS7 환경에서 ts-morph가 안 되니 codemod 포기 | `@typescript/typescript6` 별칭 설치 또는 jscodeshift |
| size-limit 13→14 전후 수치를 같은 게이트에서 비교 | 14는 기본 번들러가 rolldown — 기준 재측정 |
