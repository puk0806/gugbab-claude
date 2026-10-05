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
> 검증일: 2026-09-28 (실사용 검증 v1.1, 직전 30~60일 주기 재검증 2026-09-26, 최초 검증 2026-08-26)

이 스킬은 **"도메인 폴더로 옮기기로 결정했다" 다음 단계**를 다룬다.
어떤 구조가 옳은지(레이어드 vs 기능 슬라이스 vs 도메인)는 다루지 않는다 — 그건 `architecture/ddd` 참조.
여기서 다루는 것은 **이미 정한 목표 구조로, 서비스를 멈추지 않고, 수천 개 파일을 실제로 옮기는 절차**다.

---

## 0. 버전 기준

| 도구 | 최신 안정 버전 (2026-09-26 재확인) | 역할 |
|------|------|------|
| `ts-morph` | **28.0.0** (`@ts-morph/common` 0.29.0, 변동 없음) | TypeScript 컴파일러 API 래퍼. 타입/모듈 해석이 필요한 codemod |
| `jscodeshift` | **17.4.0** (Node >= 16, 변동 없음) | Babel/recast 기반 AST codemod 러너. 순수 구문 변환 |
| `dependency-cruiser` | **18.4.0** (2026-08-26 확인 시 18.2.0 → 마이너 갱신, Node ^22 \|\| ^24 \|\| >=26) | 의존 규칙 검증 + baseline(알려진 위반) 관리 |
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

> 재검증(2026-09-26): TypeScript 7.1의 신규 프로그래매틱 API는 **아직 출시되지 않았다**(공식 iteration plan 기준 7.1 Beta 2026-10-06 / RC 2026-11-10 / Stable 2026-11-24 예정). 즉 이 절의 side-by-side 회피책은 2026-09-26 현재도 여전히 유효한 최선의 방법이다. 7.1 stable 출시 시 이 절 전체를 재검증해야 한다.

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
| **`move()`에 프로젝트 루트 기준 상대경로를 그대로 넘김** (실행 검증 2026-09-28로 발견) | `move(filePath)`의 대상 경로는 **이동 대상 파일 자신의 디렉터리 기준 상대경로 또는 절대경로**만 인정한다 — 프로젝트 루트 기준 문자열(`"src/features/order/ui/X.tsx"`)을 그대로 넘기면 `src/components/src/features/order/ui/X.tsx` 같은 **중첩된 잘못된 위치**로 이동해버린다(경고·에러 없이 조용히 성공한 것처럼 보임) | `to`를 `path.resolve(to)`로 절대경로 변환 후 `move()`에 전달 (REFERENCE.md 3-3) |
| **TS7 환경에서 ts-morph가 안 되니 codemod 자체를 포기** | 6.0 API side-by-side로 해결 가능한 문제 | `@typescript/typescript6` 별칭 설치 또는 jscodeshift로 대체 (0절) |

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
