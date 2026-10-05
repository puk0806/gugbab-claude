---
name: frontend-domain-structure
user-invocable: false
description: 대규모 React/Next.js 프로젝트를 layer-first(types/·utils/·hooks/·api/·components/ 밑에 도메인이 반복되는 구조)에서 domain-first(feature/도메인 우선) 구조로 전환하는 설계 기준과 절차. Feature-Sliced Design 2.1 정본(layers 6종·slices·segments·import 규칙·@x 크로스임포트·public API), FSD를 쓰지 않는 경량 대안(features + shared 2~3계층 + ESLint import/no-restricted-paths), Next.js App Router 공존 전략(route group `()`·private folder `_`·colocation), Turborepo/Nx 모노레포에서 폴더↔패키지 승격 기준, colocation과 배럴 파일 성능 트레이드오프, 도메인 경계 역추출(import 그래프·change coupling·용어 클러스터), 전환 실패 패턴(shared 비대화·entities 남용·순환 의존·도메인=라우트 착각·조기 추상화). 도메인 개념 자체(바운디드 컨텍스트·유비쿼터스 언어)는 `architecture/ddd` 스킬을 참조한다.
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
> 검증일: 2026-09-26 (30~60일 주기 재검증, 최초 검증 2026-08-26 — 재검증 결과 실질 변경 없음)

> 기준 버전: **FSD 스펙 2.1** (2024-11-13 릴리즈, 변경 없음) / **Next.js 16.3.6** (문서 기준일 2025-12-19) / **Turborepo 2.10.12** / React 18·19

> 이 스킬은 **폴더 구조와 의존 방향**을 다룬다. "도메인이 무엇인가"(유비쿼터스 언어·서브도메인·바운디드 컨텍스트·컨텍스트 맵)는 중복 서술하지 않고 `architecture/ddd` 스킬을 참조한다. 프론트엔드의 slice/feature 경계는 **바운디드 컨텍스트의 UI측 투영**으로 이해하면 된다.

---

## 1. layer-first vs domain-first

### 1-1. 두 구조의 정의

**layer-first (기술 종류 우선)** — 최상위를 기술 성격으로 나누고, 그 아래에서 도메인 이름이 반복된다.

```
src/
├── types/       ├── order.ts       ├── product.ts    ├── user.ts
├── constants/   ├── order.ts       ├── product.ts    ├── user.ts
├── utils/       ├── order.ts       ├── product.ts    ├── user.ts
├── hooks/       ├── useOrder.ts    ├── useProduct.ts ├── useUser.ts
├── api/         ├── order.ts       ├── product.ts    ├── user.ts
└── components/  └── Order*.tsx     └── Product*.tsx  └── User*.tsx
```

**domain-first (feature-first, 도메인 우선)** — 최상위를 도메인으로 나누고, 그 안에서 기술 성격으로 나눈다.

```
src/
├── features/
│   ├── order/     ├── ui/  ├── api/  ├── model/  ├── lib/  └── index.ts
│   ├── product/   ├── ui/  ├── api/  ├── model/  ├── lib/  └── index.ts
│   └── user/      ├── ui/  ├── api/  ├── model/  ├── lib/  └── index.ts
└── shared/        ├── ui/  ├── api/  ├── lib/    └── config/
```

React 공식 FAQ도 이 두 축을 각각 "Grouping by features or routes"와 "Grouping by file type"으로 정리하며, 어느 쪽도 정답으로 규정하지 않는다. 대신 다음을 명시한다.

> "Unless you have a very compelling reason to use a deep folder structure, consider limiting yourself to a maximum of three or four nested folders." (React 공식 FAQ)
> "Don't spend more than five minutes on choosing a file structure." (React 공식 FAQ)

즉 **구조 선택 자체는 5분 안에 끝내되, 이미 커진 코드베이스를 바꾸는 것은 별개의 공학 작업**이다. 이 스킬은 후자를 다룬다.

### 1-2. layer-first가 무너지는 지점

| 증상 | 왜 발생하는가 |
|------|--------------|
| 기능 하나 수정에 6~8개 폴더를 오간다 | 한 도메인의 코드가 기술 레이어 수만큼 물리적으로 분산됨 |
| `utils/index.ts`, `types/common.ts`가 수천 줄로 비대해진다 | "어디에 둘지 모르겠다" → 공용 폴더로 밀어넣는 경로가 항상 열려 있음 |
| 삭제해야 할 코드가 남는다(orphan) | 도메인 단위 삭제가 불가능. 어떤 util이 어느 도메인 전용인지 추적 불가 |
| 순환 의존이 생긴다 | `utils → hooks → api → utils` 같은 레이어 간 역방향 참조를 막을 지점이 없음 |
| PR diff가 항상 전 폴더에 흩어진다 | 코드 오너십·리뷰 범위를 폴더로 지정할 수 없음 |
| 팀 간 충돌이 잦다 | 여러 팀이 같은 `utils/`·`types/`를 동시에 수정 |

**핵심 원인은 "변경 국소성(change locality)의 붕괴"다.** 함께 변하는 코드가 물리적으로 멀리 떨어져 있으면, 파일 수가 늘수록 변경 비용이 초선형으로 증가한다.

### 1-3. 전환 판단 기준

> 주의: 아래 임계치는 공식 스펙이 정한 수치가 아니라 **경험칙**이다. 절대 기준으로 인용하지 말고, 실제 코드베이스에서 6-2의 change coupling 지표로 확인하라.

| 축 | layer-first 유지 가능 | domain-first 전환 고려 | 전환 필수 신호 |
|----|------|------|------|
| 소스 파일 수 | ~수백 | 1,000 이상 | 3,000 이상 |
| 도메인(업무 영역) 수 | 1~3 | 5 이상 | 10 이상 |
| 동시 작업 팀·스쿼드 수 | 1 | 2~3 | 4 이상 |
| 변경 국소성 | 기능 변경이 대개 1~2 폴더 안에서 끝남 | 3~5 폴더를 오감 | 6개 이상 폴더를 항상 함께 수정 |
| 공용 폴더 크기 | `utils/`가 수십 파일 | 수백 파일 | "누구 것인지 모르는" 파일이 다수 |
| 삭제 가능성 | 기능 제거 시 관련 파일을 다 찾을 수 있음 | 자신 없음 | orphan 코드가 계속 쌓임 |

**전환하지 않는 것이 옳은 경우**
- 도메인이 사실상 하나뿐인 단일 목적 앱(관리자 대시보드 1개 화면군 등)
- 6개월 내 폐기 예정 / 프로토타입
- 팀이 1명이고 파일이 수백 개 수준 — 전환 비용이 이득을 초과한다
- **경계가 아직 안 보이는 초기 제품** — 조기 추상화가 더 큰 부채가 된다(8-5 참조)

---

## 2. Feature-Sliced Design 2.1 — 정본 정리

FSD는 프론트엔드 전용 아키텍처 방법론이며, 현재 스펙 버전은 **2.1**(2024-11-13 릴리즈)이다. v2.0 → v2.1은 **breaking change가 없다**(v2.0 프로젝트는 v2.1로도 유효).

### 2-1. 3단계 계층 구조

FSD는 코드를 3단계로 조직한다.

| 단계 | 이름 | 분류 축 | 이름 규칙 |
|------|------|---------|-----------|
| 1 | **Layers (레이어)** | 영향 범위(scope of influence) | **표준화됨** — 정해진 이름만 사용 |
| 2 | **Slices (슬라이스)** | 비즈니스 도메인 | **자유** — `order`, `photo`, `post` 등 |
| 3 | **Segments (세그먼트)** | 기술적 목적 | 관례 이름 + 필요 시 추가 |

```
src/
└── features/            ← Layer  (이름 고정)
    └── comment-form/    ← Slice  (도메인 이름, 자유)
        ├── ui/          ← Segment
        ├── model/       ← Segment
        ├── api/         ← Segment
        └── index.ts     ← Public API (필수)
```

### 2-2. Layers — 6종 (+ deprecated 1종)

위에서 아래로:

| # | Layer | 공식 정의 | 실무 예 |
|---|-------|-----------|---------|
| 1 | **app** | "everything that makes the app run — routing, entrypoints, global styles, providers" | Provider 트리, 글로벌 스타일, 라우터 설정 |
| — | ~~processes~~ | **deprecated** | v2.0에서 폐기. 내용은 `features`·`app`으로 이동 |
| 2 | **pages** | "full pages or large parts of a page in nested routing" | 상품 상세 화면, 주문 목록 화면 |
| 3 | **widgets** | "large self-contained chunks of functionality or UI, usually delivering an entire use case" | 헤더, 사이드바, 주문 요약 패널 |
| 4 | **features** | "reused implementations of entire product features, i.e. actions that bring business value" | 장바구니 담기, 리뷰 작성 |
| 5 | **entities** | "business entities that the project works with, like `user` or `product`" | `user`, `product`, `order` 모델·카드 UI |
| 6 | **shared** | "reusable functionality, especially when it's detached from the specifics of the project/business" | 디자인 시스템, HTTP 클라이언트, 유틸 |

> 공식 문구: "This layer has been deprecated. The current version of the spec recommends avoiding it and moving its contents to `features` and `app` instead." (processes)

**모든 레이어를 다 쓸 필요는 없다.**
> "You don't have to use every layer in your project — only add them if you think it brings value." — 다만 대부분의 프로젝트는 최소 **Shared, Pages, App** 세 레이어를 갖는다.

### 2-3. import 방향 규칙 (핵심)

> **"A module (file) in a slice can only import other slices when they are located on layers strictly below."**

- 위 레이어 → 아래 레이어 **만** 허용. 역방향 금지.
- **같은 레이어의 다른 slice import 금지** — 이것이 slice 간 zero coupling을 만든다.
- `app`과 `shared`는 **slice가 없고 세그먼트로 바로 나뉜다.** 두 레이어 내부에서는 세그먼트 간 자유로운 상호 참조가 허용된다.

```
app  →  pages  →  widgets  →  features  →  entities  →  shared
(각 화살표는 "import 가능" 방향. 역방향·같은 레이어 slice 간 import 금지)
```

**예외: `@x` 크로스 임포트 (v2.1 표준화)** — entities 레이어에 한해, 서로 참조가 불가피할 때 전용 public API를 만든다.

```
src/entities/
├── artist/
│   ├── @x/
│   │   └── song.ts        // "artist crossed with song" — song 전용 공개 계약
│   ├── model/
│   └── index.ts
└── song/
    └── model/song.ts
```

```ts
// src/entities/song/model/song.ts
import type { Artist } from "entities/artist/@x/song";
```

> 크로스 임포트는 **entities 레이어로만 제한**하고 최소로 유지한다. features 이상에서 서로를 참조하고 싶어진다면 그것은 slice 경계가 잘못 잡혔다는 신호다.

### 2-4. Segments — 기술적 목적으로 분류

| Segment | 담는 것 |
|---------|---------|
| `ui` | UI 컴포넌트, 날짜 포매터, 스타일 |
| `api` | 요청 함수, 데이터 타입, 매퍼 |
| `model` | 스키마, 인터페이스, 스토어, 비즈니스 로직 |
| `lib` | 해당 slice 내부 다른 모듈이 쓰는 라이브러리 코드 |
| `config` | 설정값, 피처 플래그 |

**세그먼트 이름은 "본질(essence)"이 아니라 "목적(purpose)"을 나타내야 한다.** 그래서 `components/`, `hooks/`, `types/`, `utils/` 같은 이름은 세그먼트로 쓰지 않는다.

FSD 공식 타입 배치 가이드의 명시적 경고:
> "Resist the temptation to create a `shared/types` folder, or to add a `types` segment to your slices. The category 'types' is similar to the category 'components' or 'hooks' in that it describes what the contents are, not what they are for."

**타입은 목적별로 흩어 놓는다.**

| 타입 종류 | 배치 |
|-----------|------|
| 유틸리티 타입 | `shared/lib/utility-types` |
| 비즈니스 엔티티 타입 | `entities/<name>/model` (교차 시 `@x`) |
| DTO·매퍼 | 요청 함수와 같은 곳(`api` 세그먼트) |
| enum | 사용처에 최대한 가깝게. UI용은 `ui`, 백엔드 상태는 `api` |
| Zod 스키마 | 검증 대상과 같은 세그먼트(백엔드 데이터→`api`, 폼→`ui`) |
| 컴포넌트 Props | 컴포넌트와 같은 파일 또는 같은 폴더 |

> **이 규칙이 layer-first → domain-first 전환의 핵심 타깃이다.** 기존 `types/`·`constants/`·`utils/` 폴더를 그대로 도메인 폴더 안으로 옮겨 `features/order/types/`를 만들면, 문제를 한 단계 아래로 내렸을 뿐 해결한 것이 아니다.

### 2-5. Public API

> "Every slice (and segment on layers that don't have slices) must contain a public API definition."
> "A public API is a *contract* between a group of modules, like a slice, and the code that uses it."

세 가지 원칙:
1. 구조 변경으로부터 소비자를 보호한다(내부 파일 경로 비노출)
2. 동작이 깨지면 API 형태로 신호를 준다
3. **필요한 것만 노출한다 — 와일드카드 re-export 금지**

```ts
// ❌ 공식 문서가 명시적으로 경고하는 패턴
export * from './ui/Comment';
export * from './model/comments';

// ✅ 필요한 것만 명시적으로
export { CommentCard } from './ui/CommentCard';
export { useComments } from './model/useComments';
export type { Comment } from './model/types';
```

**환경별 public API** — 실행 환경이 다른 모듈은 별도 진입점으로 나눈다(`index.server.ts`, `index.client.ts`). Next.js App Router에서는 서버 전용 모듈(DB 접근 등)이 클라이언트 컴포넌트로 새어 들어가 빌드가 깨지는 것을 막기 위해 이 분리가 특히 중요하다.

> 배럴 파일(index.ts)의 **번들·빌드 성능 트레이드오프**는 5-3에서 별도로 다룬다. FSD의 public API 요구와 "배럴 파일을 쓰지 마라"는 조언은 서로 충돌하는 지점이 있으며, 그대로 방치하면 실제 성능 문제가 된다.

### 2-6. v2.1의 "Pages come first"

v2.0의 관행은 UI에서 entity와 feature를 최대한 잘게 식별해 아래 레이어에 쌓고, pages는 조합만 하는 얇은 층으로 두는 것이었다. **v2.1은 이 순서를 뒤집었다.**

> "start with pages, and possibly even stopping there" — 재사용되지 않는 큰 UI 블록·폼·데이터 로직은 **그 페이지 slice 안에 그대로 둔다.** 재사용 가능한 토대만 Shared에 유지한다.
> widgets도 더 이상 단순 조합 계층이 아니라, 자기 스토어·비즈니스 로직·API 호출을 가질 수 있다.

**추출 임계값**: "여러 페이지에서 비즈니스 로직을 재사용할 필요가 생기면" 그때 아래 레이어로 뺀다. 한 페이지에서만 쓰이면 빼지 않는다.

이유는 명확하다 — **레이어는 그 안 모든 slice의 전역 네임스페이스**다. 네임스페이스 한 자리는 비싸다. 아무렇게나 쪼개면 화면 하나를 이해하는 데 폴더 6개를 열어야 한다.

### 2-7. 자동 검사 — Steiger

FSD 조직이 관리하는 아키텍처 린터. 약 20개 규칙을 검사한다.

| 규칙 | 검사 내용 |
|------|-----------|
| `fsd/forbidden-imports` | 레이어 역방향·같은 레이어 slice 간 import |
| `fsd/public-api` | slice의 public API 정의 존재 |
| `fsd/no-public-api-sidestep` | 내부 모듈 직접 import(우회) |
| `fsd/insignificant-slice` | **한 페이지에서만 쓰이는 entity/feature** → 그 페이지로 합치라는 신호 |
| `fsd/excessive-slicing` | 한 레이어의 slice가 지나치게 많음 → 과분해 |
| `fsd/no-segmentless-slices` | 세그먼트 없는 slice |

```bash
npm i -D steiger @feature-sliced/steiger-plugin
npx steiger ./src            # zero-config로 동작, --watch 지원
```

> 주의: Steiger는 **beta 단계**이며 0.5.0에서 설정 파일 포맷 breaking change가 있었다(codemod 제공). CI 게이트로 쓰려면 버전을 고정하라.

v2.0 → v2.1 마이그레이션에서는 `insignificant-slice`·`excessive-slicing` 경고를 **"합쳐라"는 지시로 읽는 것**이 공식 권장 절차다.

### 2-8. FSD를 쓸지 판단하기

| FSD 정본이 잘 맞는 경우 | FSD가 과한 경우 |
|------------------------|----------------|
| 도메인 10개 이상, 팀 3개 이상 | 도메인 2~3개, 팀 1개 |
| 신규 인원 온보딩이 잦아 **강제된 규약**이 필요 | 팀이 작고 합의로 유지 가능 |
| 아키텍처 위반을 CI로 막아야 함 | 코드 리뷰로 충분 |
| 여러 화면에 걸친 재사용 로직이 실제로 많음 | 화면별로 로직이 대부분 고유함 |
| 레이어 6개 어휘를 팀 전체가 학습할 여력이 있음 | 학습 비용 대비 이득이 불확실 |

FSD를 채택하지 않기로 했다면 3장의 경량 구조를 쓴다. **중요한 것은 레이어 이름이 아니라 "단방향 의존 + 도메인 단위 public API" 두 가지**다.

---

## 3. 경량 domain-first 대안 (FSD 미적용)

### 3-1. features + shared 구조

FSD의 6레이어를 3레이어로 줄인 형태. bulletproof-react가 대표적이다.

```
src/
├── app/                    # 앱 구동: 라우터, provider, 전역 스타일
├── features/               # 도메인 슬라이스
│   └── order/
│       ├── api/            # 이 도메인의 요청 함수 · 쿼리 훅
│       ├── components/     # 이 도메인 전용 컴포넌트
│       ├── hooks/
│       ├── stores/
│       ├── utils/
│       └── types.ts
├── components/             # 공용 UI (디자인 시스템)
├── hooks/  lib/  utils/  types/  config/  stores/  testing/  assets/
```

**의존 규칙: `shared 계열 → features → app` 단방향.** ESLint로 강제한다.

```js
// eslint.config.js — bulletproof-react 권장 설정
'import/no-restricted-paths': [
  'error',
  {
    zones: [
      // app은 features를 import할 수 있지만, features는 app을 import할 수 없다
      { target: './src/features', from: './src/app' },

      // features·app은 공용 모듈을 import할 수 있지만, 그 반대는 안 된다
      {
        target: [
          './src/components', './src/hooks', './src/lib',
          './src/types', './src/utils',
        ],
        from: ['./src/features', './src/app'],
      },
    ],
  },
],
```

> `import/no-restricted-paths`의 `target`은 "제한을 받는 쪽", `from`은 "가져올 수 없는 대상"이다. 방향을 반대로 쓰면 규칙이 무력해지므로, 도입 직후 **일부러 위반 코드를 넣어 에러가 나는지 확인**하라.

**feature 간 import도 막고 싶다면** zone을 추가한다.

```js
// features/order 는 features/product 를 직접 import 못 함
{ target: './src/features/order', from: './src/features/product' },
```

> feature 수가 많으면 zone을 일일이 쓰는 대신 `eslint-plugin-boundaries`나 `dependency-cruiser`의 `forbidden` 규칙으로 패턴 기반 선언을 쓰는 편이 유지보수하기 쉽다(6-1 참조).

### 3-2. Next.js App Router와의 공존

Next.js는 프로젝트 조직에 대해 **명시적으로 unopinionated**하며, 다음 도구를 제공한다.

| 도구 | 규약 | 효과 |
|------|------|------|
| **Colocation** | 그대로 둠 | `page.js`/`route.js`가 없는 폴더는 라우트가 되지 않는다. **프로젝트 파일을 `app/` 안에 안전하게 둘 수 있다** |
| **Private folder** | `_folderName` | 폴더와 **모든 하위 폴더**를 라우팅에서 제외 |
| **Route group** | `(folderName)` | URL 경로에 포함되지 않는 조직용 폴더. 레이아웃 분기 가능 |
| **`src` 폴더** | `src/app` | 애플리케이션 코드를 설정 파일과 분리 |

공식 문구:
> "even though route structure is defined through folders, a route is **not publicly accessible** until a `page.js` or `route.js` file is added to a route segment." → "project files can be safely colocated inside route segments in the `app` directory without accidentally being routable."
> "Since files in the `app` directory can be safely colocated by default, private folders are not required for colocation." (다만 라우팅 로직과 UI 로직 분리, 향후 파일 규약과의 이름 충돌 회피에는 유용하다)

Next.js 공식이 제시하는 조직 전략은 세 가지다.

| 전략 | 설명 | domain-first 적합도 |
|------|------|--------------------|
| **A. `app/` 밖에 프로젝트 파일 저장** | `app/`은 순수 라우팅만. 코드는 `src/features/…` | ★★★ 대규모 도메인 구조에 가장 잘 맞음 |
| **B. `app/` 최상위 폴더에 저장** | `app/components`, `app/lib` … | ★ layer-first로 회귀하기 쉬움 |
| **C. 기능/라우트별 분할** | 전역 공용은 `app/` 루트, 특정 코드는 그 라우트 세그먼트 안에 | ★★ 소규모·라우트=도메인일 때만 |

> 공식 문서는 "choose a strategy that works for you and your team and be consistent"라고만 말한다. 위 적합도 평가는 이 스킬의 판단이며 공식 순위가 아니다.

**권장 배치 (전략 A + 경량 domain-first)**

```
src/
├── app/                             # ← Next.js 라우팅 전용. 얇게 유지
│   ├── layout.tsx
│   ├── (marketing)/                 # route group: URL에 안 나타남
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── (shop)/
│       ├── layout.tsx
│       └── orders/
│           ├── page.tsx             # ← 조립만: 도메인 public API를 호출
│           ├── loading.tsx
│           └── _components/         # private folder: 이 라우트 전용 조각
│               └── OrdersToolbar.tsx
├── features/
│   └── order/
│       ├── api/  ui/  model/  lib/
│       ├── index.ts                 # 클라이언트 안전 public API
│       └── index.server.ts          # 서버 전용 public API (DB·secret 접근)
└── shared/
```

```tsx
// src/app/(shop)/orders/page.tsx — 라우트는 "조립"만 한다
import { getOrders } from '@/features/order/index.server';
import { OrderList } from '@/features/order';

export default async function OrdersPage() {
  const orders = await getOrders();
  return <OrderList orders={orders} />;
}
```

**규칙 4가지**
1. `app/` 아래에는 **라우팅 파일 규약(`layout`·`page`·`loading`·`error`·`route`·`template`·`default`)과 그 라우트에서만 쓰는 조각**만 둔다.
2. 그 라우트 전용 조각은 `_components/`·`_lib/` 같은 **private folder**에 둔다 — 향후 Next.js 파일 규약과의 이름 충돌을 원천 차단한다.
3. 두 라우트 이상에서 쓰이면 즉시 `src/features/<domain>/`으로 승격한다(FSD v2.1의 "재사용 필요 시 추출" 임계값과 같은 기준).
4. **route group `(...)`은 URL이 아니라 레이아웃·팀·섹션을 나누는 도구다.** 도메인 폴더와 1:1로 맞추려 하지 마라(8-4 참조).

### 3-3. FSD를 Next.js에 적용할 때 — 레이어 이름 충돌

FSD의 `app`·`pages` 레이어는 Next.js의 `app`(App Router)·`pages`(Pages Router) 폴더와 이름이 충돌한다. FSD 공식 해법:

> 어떤 라우터를 쓰든 **FSD 레이어 양쪽 모두**를 `_app`·`_pages`로 이름 바꾼다. 이 방식은 공식 린터와도 호환된다.

```
프로젝트 루트/
├── app/                 ← Next.js App Router (라우팅만)
└── src/
    ├── _app/            ← FSD app 레이어
    │   └── api-routes/  ← 라우트 핸들러용 세그먼트
    ├── _pages/          ← FSD pages 레이어
    ├── widgets/  features/  entities/  shared/
```

- Next.js는 특수 폴더(`app`/`pages`)를 **프로젝트 루트 또는 `src` 안**에서 찾는다. 일반적으로는 루트에 두어 `src/`가 FSD 코드만 담게 하는 편이 쉽다(필수는 아님).
- App Router 사용 시 `index.server.ts`를 `index.ts`와 별도로 만들어 서버 전용 모듈을 분리한다(2-5).
- 백엔드 로직이 커지면 프론트 구조에 끼워넣지 말고 **모노레포의 별도 패키지로 분리**한다 — "FSD is primarily intended for frontends".
- `middleware`·`instrumentation` 등은 FSD 구조 밖, 프로젝트 루트에 남는다.

> 주의: `_app`/`_pages` 리네이밍은 **FSD 공식 권고**이지 Next.js 공식 규약이 아니다. Next.js의 `_` prefix(private folder)는 **`app/` 디렉터리 내부의 라우팅 제외 규칙**이므로, `src/_pages`에서의 `_`는 단지 이름 충돌 회피용 접두사다. 두 개념을 같은 것으로 설명하지 말 것.

### 3-4. Vite + React SPA(대규모)에서의 배치

프레임워크 라우팅 규약이 없으므로 도메인 폴더가 **라우팅보다 상위**에 온다.

```
src/
├── app/
│   ├── providers/          # QueryClient, Router, Theme …
│   └── routes.tsx          # 라우트 테이블 — 도메인 public API만 참조
├── features/<domain>/…
├── shared/…
└── main.tsx
```

- 라우트 테이블은 **한 곳에 모으고**, 각 라우트는 `React.lazy(() => import('@/features/order/ui/OrderListPage'))` 형태로 도메인 public API를 가리킨다.
- 4,000 파일 규모라면 **경로 별칭이 필수**다. `tsconfig.json`의 `paths`와 `vite.config.ts`의 `resolve.alias`를 **동일하게** 유지한다(둘 중 하나만 바꾸면 타입만 통과하고 런타임이 깨진다).

```jsonc
// tsconfig.json
{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["src/*"] } } }
```

```ts
// vite.config.ts
resolve: { alias: { '@': path.resolve(__dirname, 'src') } }
```

- 코드 스플리팅 경계는 **도메인 경계와 일치시킨다.** 도메인 폴더가 곧 청크 단위가 되면 번들 분석 결과로 경계 위반을 눈으로 확인할 수 있다(도메인 A 청크에 도메인 B 코드가 섞여 있으면 경계가 새고 있다는 뜻).

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)

