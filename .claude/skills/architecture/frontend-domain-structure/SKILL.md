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
> 검증일: 2026-08-26

> 기준 버전: **FSD 스펙 2.1** (2024-11-13 릴리즈) / **Next.js 16.3.3** (문서 기준일 2026-07-21) / **Turborepo 2.10.12** / React 18·19

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

## 4. 모노레포에서의 도메인 경계

### 4-1. Turborepo 공식 규칙

| 규칙 | 공식 문구 |
|------|-----------|
| 디렉터리 분할 | "splitting your packages into `apps/` for applications and services and `packages/` for everything else, like libraries and tooling" |
| 앱의 위치 | 앱은 "패키지 그래프의 **끝점(endpoints)**"이다. **앱은 다른 패키지의 의존성이 되면 안 된다.** 공유가 필요하면 `packages/`로 추출 |
| 패키지 단위 | "each package should do one thing well" — 단일 "purpose"를 갖는 패키지를 만든다 |
| 중첩 금지 | "Don't put packages inside packages" (Turborepo는 중첩 패키지를 지원하지 않음) |
| 네임스페이스 | npm 레지스트리 충돌 방지를 위해 `@repo/`·`@yourorg/` prefix 사용 |
| 의존성 설치 위치 | "Install dependencies in the package that uses them, not the root." 루트에는 리포 전역 도구(turbo, husky 등)만 |
| 경계 침범 금지 | "If you ever find yourself writing `../` to get from one package to another, you likely have an opportunity to re-think your approach by installing the package where it's needed." |

**진입점(exports)** — 단일 배럴보다 목적별 진입점을 권장한다.
```jsonc
// packages/math/package.json
{
  "name": "@repo/math",
  "exports": {
    "./add": { "types": "./dist/add.d.ts", "default": "./dist/add.js" },
    "./subtract": { "types": "./dist/subtract.d.ts", "default": "./dist/subtract.js" }
  }
}
```
→ `import { add } from '@repo/math/add'` 형태. 의존 추적이 정밀해지고 배럴 파일 비용(5-3)을 피한다.

### 4-2. 폴더로 둘 것인가, 패키지로 승격할 것인가

| 신호 | 판단 |
|------|------|
| 앱 1개에서만 쓴다 | **폴더** (`src/features/<domain>/`) |
| 앱 2개 이상이 실제로 소비한다 | **패키지 승격** |
| 릴리즈·버전을 독립적으로 가져가야 한다 | 패키지 |
| 별도 팀이 오너십을 갖고 CODEOWNERS를 분리해야 한다 | 패키지 |
| 빌드·테스트를 독립 캐시 단위로 돌리고 싶다(CI 시간 단축) | 패키지 |
| 외부(사내 다른 리포)에 배포할 계획이 있다 | 패키지 |
| "언젠가 공유할 것 같아서" | **폴더 유지** — 조기 추상화 |
| 도메인 경계가 아직 흔들린다 | **폴더 유지** — 패키지 경계는 되돌리는 비용이 크다 |

**승격 절차**
1. `src/features/<domain>/`에서 **public API(index.ts)를 통해서만** 소비되고 있는지 확인. 내부 직접 import가 남아 있으면 먼저 정리한다.
2. 그 도메인이 참조하는 shared 코드 목록을 뽑는다 → 함께 옮길지, `@repo/ui`·`@repo/lib`로 남길지 결정.
3. `packages/<domain>/`으로 이동, `package.json`의 `exports`를 목적별로 정의.
4. 소비 앱에 `dependencies`로 추가하고, 경로 별칭 import를 패키지 import로 치환.
5. 역방향 참조(패키지 → 앱)가 생기지 않는지 린트로 고정.

> **되돌리는 신호**: 패키지 하나를 고칠 때마다 다른 패키지도 항상 같이 고쳐야 한다면, 경계가 잘못됐다. 두 패키지를 합치거나 경계를 다시 그어라. (6-2의 change coupling으로 측정 가능)

### 4-3. Nx를 쓰는 경우 — 태그 기반 경계

Nx는 프로젝트에 태그를 붙이고 ESLint 규칙 `@nx/enforce-module-boundaries`로 의존을 제한한다.

```js
depConstraints: [
  { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
  { sourceTag: 'scope:order',  onlyDependOnLibsWithTags: ['scope:order', 'scope:shared'] },
]
```

- 태그 패턴은 정확한 문자열(`"scope:client"`), 와일드카드(`"scope:*"`), 정규식(`"/^scope.*/"`), 전체 허용(`"*"`)을 지원한다.
- **"Projects without any tags cannot depend on any other projects"** — 태그 없는 프로젝트가 가장 제약이 강한 기본값이다. 태그 부여를 빠뜨리면 빌드가 막히므로, 신규 프로젝트 생성 시 태그를 필수화하라.
- 도메인(scope) 축과 종류(type: feature/ui/data-access/util) 축을 **함께** 쓰면 "order 도메인의 UI는 order 도메인의 data-access를 참조할 수 있지만 그 반대는 안 된다" 같은 규칙을 표현할 수 있다.

---

## 5. Colocation과 Public API

### 5-1. Colocation 원칙

> "Place code as close to where it's relevant as possible" (Kent C. Dodds)
> "Things that change together should be located as close as reasonable." (Dan Abramov)

분리 배치가 만드는 문제 세 가지: **유지보수**(코드와 설명이 서로 모르게 낡음), **적용성**(맥락을 놓침), **사용 편의성**(파일 사이 컨텍스트 스위칭 비용).

### 5-2. 무엇을 도메인 폴더 안에 두는가

| 대상 | 기본 배치 | 예외 |
|------|-----------|------|
| 단위 테스트 | 대상 파일 옆 (`OrderCard.tsx` ↔ `OrderCard.test.tsx`) | — |
| 스타일 | 컴포넌트 옆(CSS Module 등) | 디자인 토큰·글로벌 리셋은 shared |
| 타입 | **목적별 세그먼트에 분산** (2-4) | 유틸리티 타입만 `shared/lib` |
| 상수 | 사용하는 세그먼트 안 | 여러 도메인이 쓰는 값만 `shared/config` |
| 목(mock)·픽스처 | 도메인 폴더 내부 | 크로스 도메인 시나리오는 별도 testing 폴더 |
| E2E 테스트 | **프로젝트 루트** | 시스템 전체를 가로지르므로 특정 소스 파일에 매핑되지 않음 |
| 통합 README | 그 도메인 폴더 루트 | — |

**중첩 깊이**는 React 공식 FAQ의 3~4단계 권고를 지킨다. `src/features/order/components/list/item/parts/…`처럼 깊어지면 도메인이 실제로는 여러 개라는 신호다.

### 5-3. Public API 노출 규칙과 배럴 파일 트레이드오프

**두 요구가 충돌한다.**

| 입장 | 주장 | 근거 |
|------|------|------|
| FSD 공식 | slice마다 public API(`index.ts`) **필수** | 구조 변경 격리, 계약 명시 |
| bulletproof-react | 배럴 파일 지양, **파일을 직접 import** | Vite tree shaking 방해 및 성능 이슈 |
| Vercel 공식 | 배럴은 빌드·개발 속도를 크게 떨어뜨림 | 측정치: `@material-ui/icons` dev 10.2s→2.9s, `lucide-react` 5.8s→3s, `next build` 약 28% 단축, 서버리스 콜드스타트 최대 40% 개선 |

> Vercel 설명 요지: 배럴에서 하나만 가져와도 "you are still paying the price of importing other unneeded modules"이며, 제대로 tree-shaking하려면 "analyze the whole module graph"가 필요해 빌드가 크게 느려진다.

**실무 절충안**

1. **경계에만 배럴을 둔다.** 도메인 **루트 1개**(`features/order/index.ts`)만 public API로 유지하고, 그 안쪽(`ui/index.ts`, `model/index.ts` 같은 중간 배럴)은 만들지 않는다. 배럴 개수가 곧 비용이다.
2. **`export *` 금지.** 명시적 named export만. (FSD 공식도 동일하게 경고)
3. **도메인 내부에서는 상대 경로로 직접 import.** 자기 자신의 배럴을 거치면 순환 의존이 쉽게 생긴다.
   ```ts
   // features/order/ui/OrderList.tsx
   import { useOrders } from '../model/useOrders';   // ✅ 직접
   import { useOrders } from '../index';             // ❌ 자기 배럴 경유 → 순환 위험
   ```
4. **성능이 실측으로 문제일 때만** 서브패스 진입점으로 전환한다. 모노레포 패키지는 `exports` 필드로 목적별 진입점을 제공(4-1)하고, 앱 내부는 경로 별칭 직접 import(`@/features/order/ui/OrderList`)로 바꾼다. 이 경우 "public API 계약"은 배럴 대신 **린트 규칙**(허용 경로 화이트리스트)으로 지킨다.
5. **외부 라이브러리 배럴**은 Next.js `optimizePackageImports`로 완화할 수 있다.
   ```js
   // next.config.js
   module.exports = { experimental: { optimizePackageImports: ['package-name'] } };
   ```
   > 주의: 이 옵션은 공식 문서상 **experimental**이며 "not recommended for production"으로 표기돼 있다. `lucide-react`·`date-fns`·`lodash-es`·`@mui/material`·`recharts`·`react-icons/*` 등은 **기본으로 최적화**된다. 대상은 설정에 나열한 **패키지**이며, "로컬 배럴 파일(`@/components`)까지 자동 최적화된다"는 서술은 공식 문서에서 확인되지 않았다 — 그 전제로 설계하지 말 것.

---

## 6. 도메인 경계를 코드에서 역추출하는 법

"우리 도메인이 뭔지 회의로 정하자"는 대개 실패한다. **이미 코드에 답이 들어 있다.** 세 가지 신호를 교차시킨다.

### 6-1. 신호 ① import 그래프 (정적 구조)

`dependency-cruiser`로 현재 의존을 뽑고, 순환·고아 모듈을 먼저 찾는다.

```bash
npx depcruise src --output-type dot | dot -T svg > dependency-graph.svg
npx depcruise src --output-type err   # 위반만 출력 (CI용)
```

규칙은 `forbidden` 배열에 `from`/`to` 경로 매처로 선언한다.

```json
{
  "forbidden": [
    {
      "name": "no-circular",
      "severity": "error",
      "from": {},
      "to": { "circular": true }
    },
    {
      "name": "shared-must-not-import-features",
      "comment": "shared는 어떤 도메인도 몰라야 한다",
      "severity": "error",
      "from": { "path": "^src/shared" },
      "to": { "path": "^src/features" }
    },
    {
      "name": "no-cross-feature",
      "comment": "도메인 간 직접 참조 금지 — public API 경유만 허용",
      "severity": "error",
      "from": { "path": "^src/features/([^/]+)/" },
      "to":   { "path": "^src/features/(?!$1)([^/]+)/(?!index)" }
    }
  ]
}
```

읽는 법:
- **강하게 뭉친 클러스터** = 도메인 후보
- **한쪽으로만 화살표가 몰리는 모듈** = shared 후보
- **양방향 화살표** = 경계가 잘못 그어진 지점(합치거나 인터페이스로 끊는다)
- **어디서도 참조되지 않는 파일(orphan)** = 전환 전에 삭제할 대상. 4,000 파일 규모에서는 여기서만 수백 파일이 줄기도 한다

> 대안 도구: `madge --circular src` (순환만 빠르게), FSD 프로젝트는 `steiger`.

### 6-2. 신호 ② 변경 동시성 (change coupling / temporal coupling)

버전 관리 이력에서 **함께 커밋되는 파일 쌍**을 뽑는다. Adam Tornhill의 behavioral code analysis가 이 기법을 체계화했고, `code-maat`이 대표 도구다.

```bash
# 최근 12개월 커밋 로그 추출
git log --since="12 months ago" --numstat --date=short \
  --pretty=format:'--%h--%ad--%aN' --no-renames > repo.log

# 변경 동시성 분석
java -jar code-maat.jar -l repo.log -c git2 -a coupling > coupling.csv
# 핫스팟(변경 빈도) 분석
java -jar code-maat.jar -l repo.log -c git2 -a revisions > revisions.csv
```

해석 규칙:

| 관찰 | 의미 | 조치 |
|------|------|------|
| `types/order.ts` ↔ `api/order.ts` ↔ `hooks/useOrder.ts`가 80% 함께 변경 | 같은 도메인인데 물리적으로 분산됨 | **한 폴더로 합칠 1순위 후보** |
| 서로 다른 도메인 파일이 항상 함께 변경 | 경계가 잘못됐거나 숨은 결합이 있음 | 경계 재설정 또는 인터페이스 추출 |
| `utils/common.ts`가 거의 모든 커밋에 등장 | 공용 폴더 비대화 | 도메인별로 분해해서 흡수 |
| 변경 빈도가 높은데 다른 파일과 거의 안 엮임 | 잘 격리된 코드 | 그대로 둔다 |

**이 지표가 1-3의 임계치 표보다 신뢰도가 높다.** 파일 수는 대리 지표일 뿐이고, change coupling은 실제 변경 비용을 직접 측정한다.

### 6-3. 신호 ③ 용어 클러스터

코드에 쓰인 명사를 모아 클러스터링한다. `Order`, `OrderItem`, `Fulfillment`, `Shipment`가 함께 등장하면 하나의 도메인 후보다.

- **같은 단어가 서로 다른 의미로 쓰이는 지점**(주문의 `Product` vs 카탈로그의 `Product`)이 곧 **경계선**이다 → `architecture/ddd`의 바운디드 컨텍스트 절 참조.
- 백엔드 API 경로·스키마 네임스페이스도 강한 힌트다. 다만 백엔드 경계를 그대로 복사하지는 마라 — 화면 흐름 기준으로 다르게 갈라져야 하는 경우가 흔하다.

### 6-4. 실행 순서

```
1) orphan·순환 제거          → dependency-cruiser (전환 전 청소)
2) 도메인 후보 도출          → change coupling 상위 쌍 + import 클러스터 + 용어
3) 후보 검증                 → "이 도메인만 삭제하면 앱에서 무엇이 사라지는가?"에
                               한 문장으로 답할 수 있으면 유효한 경계다
4) 경계 고정                 → 린트 규칙 먼저 작성 (아직 위반 상태여도 warn으로 시작)
5) 한 도메인씩 이동          → warn → error로 승격하며 전진
```

---

## 7. 전환 플레이북 (대규모 코드베이스)

### 7-1. 원칙

- **빅뱅 금지.** 4,000 파일을 한 PR로 옮기면 리뷰 불가·충돌 지옥·되돌리기 불가다.
- **가드레일 먼저.** 폴더를 옮기기 전에 린트 규칙을 `warn`으로 넣어 위반 건수를 계측한다. 이 숫자가 진척도 지표가 된다.
- **한 번에 한 도메인.** 새 구조와 옛 구조는 **공존**한다. 스트랭글러 패턴.
- **이동과 수정을 같은 커밋에 섞지 않는다.** 파일 이동은 이동만(가능하면 `git mv`), 내용 변경은 별도 커밋. 리뷰어가 diff를 읽을 수 있어야 한다.

### 7-2. 단계

| 단계 | 작업 | 완료 기준 |
|------|------|-----------|
| 0. 청소 | orphan 파일 삭제, 순환 의존 해소, 경로 별칭 정비 | `depcruise` 순환 0건 |
| 1. 계측 | change coupling·import 그래프로 도메인 후보 도출 | 도메인 목록 확정(5~15개 수준) |
| 2. 가드레일 | `import/no-restricted-paths` 또는 dependency-cruiser 규칙을 **warn**으로 추가 | CI에서 위반 건수가 리포트됨 |
| 3. 파일럿 | 가장 **작고 독립적인** 도메인 1개를 새 구조로 이동 + public API 정의 | 그 도메인 밖에서 내부 파일을 직접 import하는 곳 0건 |
| 4. 확산 | 도메인별 PR로 반복. 매 PR마다 위반 건수 감소 확인 | 도메인별 체크리스트 소진 |
| 5. shared 정리 | 남은 `utils/`·`types/`·`constants/`를 도메인으로 흡수하고, 진짜 공용만 shared에 남김 | shared에 도메인 용어가 등장하지 않음 |
| 6. 고정 | 린트 규칙을 **error**로 승격, CI 필수 통과로 설정 | 새 위반이 머지될 수 없음 |

### 7-3. 파일럿 도메인 선정 기준

가장 크거나 가장 중요한 도메인으로 시작하지 마라. **"작고, 의존이 적고, 곧 기능 변경이 예정되지 않은"** 도메인을 고른다. 목적은 성과가 아니라 **절차를 검증하는 것**이다.

### 7-4. 모노레포에서의 추가 고려

- 도메인 이동과 **패키지 승격을 동시에 하지 마라.** 먼저 앱 안에서 폴더로 안정화한 뒤, 4-2 기준을 충족하면 그때 패키지로 뺀다.
- Turborepo 캐시 키가 바뀌므로 대규모 이동 직후 첫 CI는 전량 재빌드된다. 릴리즈 직전 주간은 피한다.

---

## 8. 흔한 실패 패턴

### 8-1. shared 비대화

**증상**: `shared/`가 전체 코드의 40%를 넘고, 그 안에 `order`, `payment` 같은 도메인 용어가 등장한다.

**원인**: "어디 둘지 모르겠다 → 일단 shared". layer-first에서 가져온 습관.

**교정**
- shared에 넣기 전 질문: **"이 코드가 우리 비즈니스를 모르고도 성립하는가?"** 모른 채로 성립해야 shared다. `formatOrderStatus`는 shared가 아니다.
- **shared에는 도메인 용어가 등장하지 않는다**를 리뷰 규칙으로 명문화한다.
- FSD 관점: shared는 "detached from the specifics of the project/business"인 것만.
- 이미 비대해졌다면 shared 안에서 도메인 용어가 들어간 파일부터 각 도메인으로 되돌린다.

### 8-2. entities 남용 / 과분해

**증상**: `entities/`에 slice가 40개인데 대부분 한 페이지에서만 쓰인다. 화면 하나 이해하려고 폴더 6개를 연다.

**원인**: FSD v2.0식 "entity·feature 먼저 쪼개기"를 v2.1 이후에도 그대로 적용.

**교정**
- **FSD v2.1의 pages-first를 따른다.** 재사용되지 않는 UI·폼·데이터 로직은 그 페이지 slice에 그대로 둔다.
- 추출 임계값은 **"여러 페이지에서 재사용할 필요가 실제로 생겼을 때"**.
- Steiger의 `insignificant-slice`(한 페이지에서만 쓰임)·`excessive-slicing`(slice 과다) 경고를 "합쳐라"로 읽는다.
- 레이어는 전역 네임스페이스다. 자리 하나는 비싸다.

### 8-3. 순환 의존

**증상**: `features/order → features/user → features/order`. 또는 배럴을 경유한 미묘한 런타임 `undefined`.

**원인**: 같은 레이어 slice 간 직접 import 허용, 자기 배럴 경유 import, 공용 폴더가 도메인을 역참조.

**교정**
- **같은 레이어 slice 간 import 금지**를 린트로 강제한다(FSD 기본 규칙).
- 도메인 내부에서는 자기 배럴을 거치지 않고 상대 경로로 직접 import(5-3).
- 두 도메인이 정말 서로 알아야 하면 ① 한쪽을 아래 레이어로 내리거나 ② 공통 부분을 shared/entities로 추출하거나 ③ FSD면 `@x` 크로스 임포트를 쓴다.
- `depcruise --output-type err`의 `no-circular` 규칙을 CI error로 고정.

### 8-4. "도메인"과 "라우트"를 1:1로 착각

**증상**: `features/` 하위 폴더 이름이 URL 경로와 정확히 같다. `/settings/profile` 때문에 `features/settings/profile/`이 생기고, 같은 사용자 도메인 코드가 3개 라우트에 흩어진다.

**왜 틀렸나**: 라우트는 **네비게이션 단위**, 도메인은 **변경·오너십 단위**다. 하나의 도메인이 여러 라우트에 걸치고(주문 도메인 → 목록·상세·환불 화면), 하나의 라우트가 여러 도메인을 조립한다(대시보드 → 주문+정산+알림).

**교정**
- `app/` 라우트 세그먼트는 **조립만** 한다. 로직은 도메인 public API에서 가져온다.
- 라우트 전용 UI 조각은 route group `()`·private folder `_`로 그 라우트에 colocate하고, 두 라우트 이상에서 쓰이면 도메인으로 승격한다.
- **route group은 도메인이 아니라 레이아웃·섹션·팀 경계를 나누는 도구**다. Next.js 공식 용례도 "Organizing routes by site section, intent, or team"이다.
- 반대 함정도 있다: 도메인 폴더를 만들면서 라우팅 파일까지 그 안에 끌고 들어가면 Next.js 라우팅이 깨진다. **라우팅 규약 파일은 `app/`에 남는다.**

### 8-5. 조기 추상화

**증상**: 기능이 2개인데 레이어가 6개. 사용처가 하나뿐인 추상 인터페이스와 제네릭 팩토리.

**교정**
- 경계는 **증거가 쌓인 뒤에** 긋는다. 증거 = change coupling·실제 재사용 사례(6-2).
- "두 번째 사용처가 생겼을 때 추출"을 기본 규칙으로 삼는다. FSD v2.1의 추출 임계값과 동일한 사고방식이다.
- 패키지 승격은 특히 늦게 한다 — 폴더 되돌리기는 싸고, 패키지 되돌리기는 비싸다.

### 8-6. 그 외 빈발 패턴

| 실수 | 올바른 접근 |
|------|------------|
| 도메인 폴더 안에 `types/`·`utils/`·`constants/`를 그대로 재현 | 목적별 세그먼트(`model`·`api`·`lib`)로 분산. "무엇인지"가 아니라 "무엇을 위한 것인지"로 이름 짓기 |
| 모든 하위 폴더에 `index.ts` 배럴 생성 | 도메인 루트 1개만. `export *` 금지 (5-3) |
| 도메인 밖에서 내부 파일 직접 import | public API 경유. 린트로 차단(`no-public-api-sidestep` 상당) |
| 린트 규칙 없이 "합의"로만 운영 | 규칙 없는 경계는 3개월 안에 무너진다. CI error로 고정 |
| 이동 커밋에 로직 수정을 섞음 | 이동 전용 커밋 + 수정 커밋 분리 |
| 앱을 다른 패키지의 의존성으로 사용 | 앱은 그래프의 끝점. 공유 코드는 `packages/`로 추출 |
| `../../../` 로 패키지 경계를 넘음 | 해당 패키지를 의존성으로 설치해 import |
| 폴더만 옮기고 의존 방향은 그대로 | 구조는 방향을 강제할 때만 의미가 있다 |

---

## 9. 체크리스트

**전환 착수 전**
- [ ] orphan 파일·순환 의존을 제거했다
- [ ] change coupling으로 도메인 후보를 도출했다(회의로만 정하지 않았다)
- [ ] 각 도메인에 대해 "이걸 지우면 무엇이 사라지는가"를 한 문장으로 답할 수 있다
- [ ] 린트 규칙을 warn으로 넣고 현재 위반 건수를 계측했다

**구조 설계**
- [ ] 의존 방향이 **단방향**이고 린트로 강제된다
- [ ] 같은 레이어 slice 간 직접 import가 금지되어 있다
- [ ] 도메인마다 public API가 있고, `export *`를 쓰지 않는다
- [ ] shared에 도메인 용어가 등장하지 않는다
- [ ] `types/`·`utils/` 같은 "본질" 이름 폴더를 도메인 안에 재현하지 않았다
- [ ] 중첩 깊이가 3~4단계를 넘지 않는다
- [ ] (Next.js) `app/`은 라우팅 파일과 그 라우트 전용 조각만 담는다
- [ ] (Next.js+FSD) `_app`/`_pages` 리네이밍과 `index.server.ts` 분리를 적용했다
- [ ] (모노레포) 앱이 다른 패키지의 의존성이 아니다
- [ ] (모노레포) 패키지가 단일 purpose를 갖고, 중첩 패키지가 없다

**전환 진행 중**
- [ ] 도메인 단위 PR로 진행하고 있다(빅뱅 아님)
- [ ] 파일 이동 커밋과 로직 수정 커밋이 분리되어 있다
- [ ] 매 PR마다 린트 위반 건수가 감소한다
- [ ] 마지막에 린트를 error로 승격하고 CI 필수로 걸었다
