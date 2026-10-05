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
