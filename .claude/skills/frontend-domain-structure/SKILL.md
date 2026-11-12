---
name: frontend-domain-structure
user-invocable: false
description: layer-first → domain-first 프론트엔드 구조 전환에서 모델이 틀리기 쉬운 지점 — FSD 2.1(pages-first·@x 크로스임포트·processes deprecated·types 세그먼트 금지), Steiger 0.9.0 베타·설정 탐색 기준 변경, Next.js+FSD `_app`/`_pages` 리네이밍과 private folder `_` 구분, index.server.ts 분리, optimizePackageImports 한계, Nx 태그 없는 프로젝트 제약, change coupling 기반 경계 추출, 전환 실패 패턴. 도메인 개념 자체는 다루지 않는다.
---

# frontend-domain-structure — 프론트엔드 도메인 우선 폴더 구조

> 소스:
> - Feature-Sliced Design 공식 — Overview https://feature-sliced.design/docs/get-started/overview
> - FSD 공식 — Layers https://feature-sliced.design/docs/reference/layers
> - FSD 공식 — Slices and segments https://feature-sliced.design/docs/reference/slices-segments
> - FSD 공식 — Public API https://feature-sliced.design/docs/reference/public-api
> - FSD 공식 — Usage with Next.js https://feature-sliced.design/docs/guides/tech/with-nextjs
> - FSD 공식 — Types 배치 가이드 https://feature-sliced.design/docs/guides/examples/types
> - FSD 공식 — Migration from v2.0 to v2.1 https://feature-sliced.design/docs/guides/migration/from-v2-0
> - FSD 공식 릴리즈 — v2.1 "Pages come first!" https://github.com/feature-sliced/documentation/releases/tag/v2.1
> - FSD 공식 린터 — Steiger https://github.com/feature-sliced/steiger
> - Next.js 공식 — Project structure and organization https://nextjs.org/docs/app/getting-started/project-structure
> - Next.js 공식 — optimizePackageImports https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports
> - Vercel 공식 블로그 — How we optimized package imports in Next.js https://vercel.com/blog/how-we-optimized-package-imports-in-next-js
> - Turborepo 공식 — Structuring a repository https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository
> - Turborepo 공식 — Creating an Internal Package https://turborepo.dev/docs/crafting-your-repository/creating-an-internal-package
> - Turborepo 공식 GitHub — best-practices RULE.md https://github.com/vercel/turborepo/blob/main/skills/turborepo/references/best-practices/RULE.md
> - Nx 공식 — Enforce Module Boundaries https://nx.dev/features/enforce-module-boundaries
> - React 공식(legacy) FAQ — File Structure https://legacy.reactjs.org/docs/faq-structure.html
> - bulletproof-react — Project Structure https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md
> - dependency-cruiser https://github.com/sverweij/dependency-cruiser
> - Kent C. Dodds — Colocation https://kentcdodds.com/blog/colocation
> - Adam Tornhill, "Software Design X-Rays" (Pragmatic Bookshelf, 2018) / code-maat https://github.com/adamtornhill/code-maat
> 검증일: 2026-11-09 (재검증, 이전 2026-09-26 · 최초 2026-08-26 — 기준 버전 숫자만 갱신, 권장사항 변경 없음)

> 기준 버전: **FSD 스펙 2.1** (2024-11-13 릴리즈, 2026-11-09 현재도 최신 — 변경 없음) / **Next.js 16.4.5** (project-structure 문서 lastUpdated 2026-07-21, route group·private folder 규칙 변동 없음) / **Turborepo 2.11.10** / Steiger 0.9.0 / React 18·19

---

## 이 스킬의 범위

layer-first → domain-first 전환에서 **최신 스펙(FSD 2.1·Steiger 0.9)과 Next.js 공존 규칙, 실측 함정**만 다룬다. "도메인이 무엇인가"(바운디드 컨텍스트 등)는 범위 밖. 경계 강제 도구 설정은 `module-boundaries`, 이동 실행 전략은 `incremental-refactoring`.

> 기본 사용법(layer-first/domain-first 정의·FSD 레이어 6종 정의·세그먼트 이름·public API 원칙·colocation 원칙·bulletproof-react 구조·Turborepo apps/packages 규칙)은 공식 문서 수준이라 싣지 않는다.

**핵심은 레이어 이름이 아니라 "단방향 의존 + 도메인 단위 public API" 두 가지다.**

---

## 1. 전환 판단

> 주의: 아래 임계치는 공식 스펙이 정한 수치가 아니라 **경험칙**이다. 절대 기준으로 인용하지 말고, 실제 코드베이스에서 4절의 change coupling 지표로 확인하라.

| 축 | layer-first 유지 가능 | domain-first 전환 고려 | 전환 필수 신호 |
|----|------|------|------|
| 소스 파일 수 | ~수백 | 1,000 이상 | 3,000 이상 |
| 도메인(업무 영역) 수 | 1~3 | 5 이상 | 10 이상 |
| 동시 작업 팀·스쿼드 수 | 1 | 2~3 | 4 이상 |
| 변경 국소성 | 기능 변경이 대개 1~2 폴더 안에서 끝남 | 3~5 폴더를 오감 | 6개 이상 폴더를 항상 함께 수정 |

전환하지 않는 것이 옳은 경우: 도메인이 사실상 하나, 6개월 내 폐기·프로토타입, 1인 팀·수백 파일, **경계가 아직 안 보이는 초기 제품**(조기 추상화가 더 큰 부채).

---

## 2. FSD 2.1 — 모델이 v2.0 지식으로 틀리는 점

- 현재 스펙은 **2.1**(2024-11-13). v2.0 → v2.1은 **breaking change가 없다**.
- **`processes` 레이어는 deprecated** — 공식: "This layer has been deprecated. The current version of the spec recommends avoiding it and moving its contents to `features` and `app` instead." 모든 레이어를 쓸 필요는 없고 대부분은 최소 Shared·Pages·App.
- **"Pages come first"(v2.1)**: v2.0식 "entity·feature 먼저 잘게 쪼개기"를 뒤집었다. "start with pages, and possibly even stopping there" — 재사용되지 않는 큰 UI·폼·데이터 로직은 그 페이지 slice에 둔다. **추출 임계값은 "여러 페이지에서 재사용할 필요가 실제로 생겼을 때"**. widgets도 자기 스토어·로직·API 호출을 가질 수 있다. 이유: 레이어는 그 안 모든 slice의 전역 네임스페이스라 자리 하나가 비싸다.
- **`@x` 크로스 임포트(v2.1 표준화)**: entities 레이어에 한해 `entities/artist/@x/song.ts`("artist crossed with song") 전용 계약을 만들고 `import type { Artist } from "entities/artist/@x/song"`. **entities로만 제한**하고 최소로 — features 이상에서 서로를 참조하고 싶어지면 slice 경계가 잘못됐다는 신호.
- `app`과 `shared`는 slice 없이 세그먼트로 바로 나뉘고 내부 세그먼트 간 상호 참조가 허용된다.
- **`types` 세그먼트·`shared/types` 금지**(공식 Types 가이드): "Resist the temptation to create a `shared/types` folder, or to add a `types` segment to your slices. The category 'types' is similar to the category 'components' or 'hooks' in that it describes what the contents are, not what they are for." → 유틸리티 타입 `shared/lib/utility-types`, 엔티티 타입 `entities/<name>/model`(교차 시 `@x`), DTO·매퍼는 `api`, Zod 스키마는 검증 대상과 같은 세그먼트.

  > **이 규칙이 전환의 핵심 타깃이다.** 기존 `types/`·`constants/`·`utils/` 폴더를 그대로 `features/order/types/`로 옮기면 문제를 한 단계 아래로 내렸을 뿐이다.

- public API: `export *` 와일드카드 re-export는 공식 문서가 명시적으로 경고. 실행 환경이 다른 모듈은 `index.server.ts`/`index.client.ts`로 진입점을 나눈다 — App Router에서 서버 전용 모듈이 클라이언트로 새어 빌드가 깨지는 것을 막는다.

### Steiger (FSD 공식 린터)

`npx steiger ./src`(zero-config, `--watch`). 주요 규칙: `fsd/forbidden-imports`, `fsd/public-api`, `fsd/no-public-api-sidestep`, `fsd/insignificant-slice`(한 페이지에서만 쓰이는 entity/feature), `fsd/excessive-slicing`, `fsd/no-segmentless-slices`.

> 주의: Steiger는 **beta 단계**(README: "The project is in beta … Some APIs may change", 2026-11-09 최신 0.9.0)이며 0.5.0에서 설정 파일 포맷 breaking change가 있었다(codemod 제공). 0.9.0부터는 설정 파일을 작업 디렉토리가 아니라 **린트 대상 경로 기준으로 찾는다** — 모노레포에서 루트에서 `npx steiger apps/web/src`로 돌리던 경우 설정 위치를 확인하라. CI 게이트로 쓰려면 버전을 고정하라.

v2.0 → v2.1 마이그레이션에서는 `insignificant-slice`·`excessive-slicing` 경고를 **"합쳐라"는 지시로 읽는 것**이 공식 권장 절차다.

---

## 3. Next.js App Router와의 공존

- `page.js`/`route.js`가 없는 폴더는 라우트가 되지 않아 `app/` 안 colocation이 안전하다. 공식: "Since files in the `app` directory can be safely colocated by default, private folders are not required for colocation." private folder `_x`는 폴더와 **모든 하위 폴더**를 라우팅에서 제외(라우팅/UI 분리, 향후 파일 규약과의 이름 충돌 회피용).
- 대규모 domain-first에는 "`app/` 밖에 프로젝트 파일 저장" 전략이 가장 잘 맞는다 — `app/`에는 라우팅 규약 파일과 그 라우트 전용 조각(`_components/`)만 두고, 두 라우트 이상에서 쓰이면 `src/features/<domain>/`로 승격, 라우트는 도메인 public API를 **조립만** 한다.

  > 공식 문서는 "choose a strategy that works for you and your team and be consistent"라고만 말한다. 이 적합도 평가는 이 스킬의 판단이며 공식 순위가 아니다.

- **route group `(...)`은 도메인이 아니라 레이아웃·섹션·팀 경계를 나누는 도구**다(공식 용례 "Organizing routes by site section, intent, or team"). 라우팅 규약 파일은 `app/`에 남는다 — 도메인 폴더로 끌고 들어가면 라우팅이 깨진다.

### FSD + Next.js — 레이어 이름 충돌

FSD 공식 해법: 어떤 라우터를 쓰든 **FSD 레이어 양쪽 모두**를 `_app`·`_pages`로 이름 바꾼다(공식 린터 호환). Next.js 라우팅 폴더(`app/`)는 루트에, `src/`는 FSD 코드만(필수는 아님). 백엔드 로직이 커지면 모노레포 별도 패키지로 — "FSD is primarily intended for frontends". `middleware`·`instrumentation`은 FSD 구조 밖 루트에.

> 주의: `_app`/`_pages` 리네이밍은 **FSD 공식 권고**이지 Next.js 공식 규약이 아니다. Next.js의 `_` prefix(private folder)는 **`app/` 디렉터리 내부의 라우팅 제외 규칙**이므로, `src/_pages`에서의 `_`는 단지 이름 충돌 회피용 접두사다. 두 개념을 같은 것으로 설명하지 말 것.

### 배럴 파일 트레이드오프

FSD는 slice마다 public API 필수, bulletproof-react는 배럴 지양, Vercel은 배럴이 빌드·dev 속도를 크게 떨어뜨린다고 측정(`@material-ui/icons` dev 10.2s→2.9s, `lucide-react` 5.8s→3s, `next build` 약 28% 단축, 서버리스 콜드스타트 최대 40% 개선). 절충: **도메인 루트 1개만 배럴**(중간 배럴 금지), `export *` 금지, 도메인 내부는 상대 경로 직접 import(자기 배럴 경유 → 순환), 실측으로 문제일 때만 서브패스 진입점 + 린트 화이트리스트.

> 주의: `optimizePackageImports` 옵션은 공식 문서상 **experimental**이며 "not recommended for production"으로 표기돼 있다. `lucide-react`·`date-fns`·`lodash-es`·`@mui/material`·`recharts`·`react-icons/*` 등은 **기본으로 최적화**된다. 대상은 설정에 나열한 **패키지**이며, "로컬 배럴 파일(`@/components`)까지 자동 최적화된다"는 서술은 공식 문서에서 확인되지 않았다 — 그 전제로 설계하지 말 것.

Vite SPA: `tsconfig.json` `paths`와 `vite.config.ts` `resolve.alias`를 **동일하게** 유지(하나만 바꾸면 타입만 통과하고 런타임이 깨진다).

---

## 4. 모노레포·도메인 경계 추출

- 폴더 → 패키지 승격은 **앱 2개 이상이 실제로 소비**·독립 릴리즈·별도 팀 오너십·독립 캐시 단위가 필요할 때만. "언젠가 공유할 것 같아서"·경계가 흔들리는 중이면 폴더 유지(패키지 되돌리기는 비싸다). 도메인 이동과 패키지 승격을 동시에 하지 않는다. 대규모 이동 직후 첫 CI는 Turborepo 캐시 키가 바뀌어 전량 재빌드된다.
- Turborepo 공식: 앱은 패키지 그래프의 끝점(다른 패키지의 의존성 금지), 중첩 패키지 미지원, 단일 배럴보다 목적별 `exports` 진입점, `../`로 패키지 경계를 넘지 말고 의존성으로 설치.
- **Nx**: `@nx/enforce-module-boundaries`의 `depConstraints`. **"Projects without any tags cannot depend on any other projects"** — 태그 없는 프로젝트가 가장 제약이 강한 기본값이라 태그를 빠뜨리면 빌드가 막힌다. 태그 패턴은 정확 문자열·와일드카드(`"scope:*"`)·정규식(`"/^scope.*/"`)·`"*"`. scope 축과 type 축을 함께 쓴다.
- **경계 역추출 3신호**: ① import 그래프(dependency-cruiser — 뭉친 클러스터 = 도메인 후보, 한쪽으로 몰리는 화살표 = shared 후보, 양방향 = 잘못 그은 경계, orphan = 전환 전 삭제 대상) ② **change coupling**(code-maat):

```bash
git log --since="12 months ago" --numstat --date=short \
  --pretty=format:'--%h--%ad--%aN' --no-renames > repo.log
java -jar code-maat.jar -l repo.log -c git2 -a coupling > coupling.csv
```

  `types/order.ts`·`api/order.ts`·`hooks/useOrder.ts`가 함께 변경되면 합칠 1순위, 서로 다른 도메인이 항상 함께 변하면 숨은 결합. **이 지표가 1절 임계치 표보다 신뢰도가 높다.** ③ 용어 클러스터 — 같은 단어가 다른 의미로 쓰이는 지점이 경계선. 백엔드 경계를 그대로 복사하지 않는다.
- 후보 검증: "이 도메인만 삭제하면 앱에서 무엇이 사라지는가?"에 한 문장으로 답할 수 있으면 유효한 경계.

---

## 5. 전환 실패 패턴

| 실패 | 교정 |
|------|------|
| **shared 비대화** — shared에 `order`·`payment` 같은 도메인 용어 등장 | "이 코드가 우리 비즈니스를 모르고도 성립하는가?" — `formatOrderStatus`는 shared가 아니다. "shared에 도메인 용어 금지"를 리뷰 규칙으로 |
| **entities 남용** — slice 40개가 대부분 한 페이지 전용 | v2.1 pages-first, Steiger `insignificant-slice`·`excessive-slicing`을 "합쳐라"로 |
| **순환 의존** | 같은 레이어 slice 간 import 금지 강제, 자기 배럴 경유 금지, 필요 시 아래 레이어로 내림·공통 추출·`@x` |
| **도메인 = 라우트 착각** — `features/settings/profile/`이 URL과 동일 | 라우트는 네비게이션 단위, 도메인은 변경·오너십 단위. 라우트는 조립만 |
| **조기 추상화** — 기능 2개에 레이어 6개 | 경계는 증거(change coupling·실제 재사용) 뒤에, "두 번째 사용처가 생겼을 때 추출" |
| 도메인 폴더 안에 `types/`·`utils/`·`constants/` 재현 | 목적별 세그먼트(`model`·`api`·`lib`)로 분산 |
| 모든 하위 폴더에 `index.ts` | 도메인 루트 1개만, `export *` 금지 |
| 빅뱅 이동·이동 커밋에 로직 수정 섞기 | 도메인 하나씩, 이동 전용 커밋(`git mv`) 분리, 린트 warn으로 위반 수 계측 → 감소 확인 → error 승격 |
| 파일럿을 가장 크거나 중요한 도메인으로 | "작고, 의존이 적고, 곧 기능 변경이 없는" 도메인 — 목적은 절차 검증 |
