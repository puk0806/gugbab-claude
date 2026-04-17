# 코드베이스 도메인 분석 보고서 — lf-ui exhibition

**분석 대상:** /Users/lf/Desktop/workspace/00_lf-ui/lf-ui
**분석 범위:** exhibition(전시) 도메인
**서비스:** LF Mall (https://www.lfmall.co.kr/app)
**분석일:** 2026-04-17
**분석 기준:** DDD 스킬 (.claude/skills/architecture/ddd/SKILL.md)

> **범례**
> - ✅ **코드에서 확인됨** — 실제 소스 파일에서 직접 확인한 내용
> - ❓ **실제 소스 확인 필요** — 코드만으로 파악 불가. 비즈니스 담당자 또는 서버 소스 확인 필요

---

## 1. 프로젝트 개요

### 스택 ✅ 코드에서 확인됨

| 항목 | 내용 |
|------|------|
| 프레임워크 | React 18 + TypeScript 4.7 (CRA + Craco + SWC) |
| 상태관리 | Recoil (전역), TanStack Query v4 (서버 상태) |
| 스타일 | SCSS Modules |
| API 클라이언트 | `@lf/lf-restapi-client` (OpenAPI 자동생성) |
| 빌드 분리 | `src/mobile/lfmall`, `src/desktop/lfmall` 모바일/데스크톱 이중 빌드 |

### 폴더 구조 (3단계) ✅ 코드에서 확인됨

```
src/
├── api/exhibition/         # API factory (얇은 래퍼)
├── hooks/api/exhibition/   # TanStack Query 훅 (23개 서브디렉토리)
├── hooks/card/             # 카드 공통 훅
├── hooks/exhibition/       # 전시 전용 훅
├── lfmall/
│   ├── routes.ts           # ROUTE_PATH + PAGE_CODE 정의
│   ├── types/exhibition/   # 전시 카드 공통 타입/Enum
│   └── util/exhibition/    # 카드 유틸 함수
├── mobile/lfmall/
│   ├── routes/             # Exhibition* 페이지 컴포넌트
│   ├── components/cards/   # 레거시 카드
│   ├── components/cardsNew/ # 신규 카드 시스템 (Card2001~Card3333)
│   └── components/planning/ # 기획전 컴포넌트
└── types/exhibition/       # 도메인 타입 (best, benepia)
```

---

## 2. exhibition 도메인 코드 위치

### 주요 파일 목록 ✅ 코드에서 확인됨

| 경로 | 역할 |
|------|------|
| `src/api/exhibition/exhibition.ts` | ExhibitionApiFactory 래퍼 |
| `src/hooks/api/exhibition/` | TanStack Query 훅 23개 카테고리 |
| `src/lfmall/routes.ts` | `/exhibition/*` 경로 22개, PAGE_CODE 정의 |
| `src/lfmall/types/exhibition/card/types.ts` | 전시 카드 공통 Enum/타입 |
| `src/lfmall/util/exhibition/card/cardUtil.ts` | 카드 파싱 유틸 |
| `src/mobile/lfmall/components/cardsNew/CardMapMobile.ts` | templateType → 컴포넌트 매핑 (30종 이상) |
| `src/hooks/exhibition/useCard3333ScrollTargetContext.tsx` | 취향 맞춤 기획전 컨텍스트 |
| `src/hooks/api/exhibition/planning/usePlanningTemplate.tsx` | 기획전 혜택 타입 변환 로직 |

### hooks/api/exhibition 23개 서브도메인 ✅ 코드에서 확인됨

`banner`, `benefit`, `bestTab`, `brand`, `cart`, `concierge`, `event`, `giftShop`, `home`, `l4u`, `live`, `lnb`, `lookbook`, `planning`, `preview`, `product`, `recommend`, `search`, `sellerShop`, `short`, `sns`, `template`, `trend`

---

## 3. 역추출된 도메인 개념

### 유비쿼터스 언어

| 한국어 | 영어 코드 용어 | 의미 | 확인 여부 |
|--------|--------------|------|----------|
| 전시 | `exhibition` | 콘텐츠 전시 최상위 도메인 | ✅ |
| 메뉴 | `menu` | 전시 화면의 논리적 단위 (ID로 식별) | ✅ |
| 전시 영역 | `displayArea` | 메뉴 내 카드가 배치되는 영역 | ✅ |
| 카드 | `card` | 전시 영역에 배치되는 콘텐츠 단위 (templateType으로 타입 구분) | ✅ |
| 카드블록 | `cardBlock` | 카드 내 구획 (header/body 구조) | ✅ |
| 콘텐츠 | `content` (CardBlockContentDTO) | 카드블록 내 실제 데이터 단위 | ✅ |
| 기획전 | `planning` / `event` | 테마 기반 상품/혜택 이벤트 전시 | ✅ |
| 룩북 | `lookBook` | 스타일 이미지 큐레이션 | ✅ |
| 숏폼 | `shortForm` | 영상 콘텐츠 (좋아요, 쿠폰, SNS공유, 조회수) | ✅ |
| 혜택 | `benefit` | 쿠폰, EGM, 포인트 등 할인/적립 | ✅ |
| 트렌드 | `trend` | 카테고리별 트렌드 상품 | ✅ |
| 개인화 추천 | `recommend` / `hyperPersonal` | 사용자 기반 상품 추천 | ✅ |
| 취향 맞춤 기획전 | `Card3333` / `personalizedPlan` | 개인화 기획전 탭 (맞춤/인기) | ✅ |
| 랜딩 타입 | `targetPageType` | 카드 클릭 시 이동할 페이지 유형 (숫자 코드) | ✅ |
| 판매유형 | `productSaleType` | LF 자사(1,2) / 입점(3) 구분 | ✅ |
| 베네피아 | `benepia` | 복지몰 특화 전시 (kids/vacation) | ✅ |

### 도메인 상태 및 비즈니스 규칙

| 규칙 | 코드 위치 | 확인 여부 |
|------|----------|----------|
| `planInfoType`: DESIGN / TEMPLATE / TEMPLATE_V2 / TEMPLATE_V3 → 렌더링 방식 결정 | `useTargetPage.ts` | ✅ |
| `planInfoType` 미일치 시 레거시 `/planning.do` URL로 fallback | `useTargetPage.ts` | ✅ |
| `nonCachingCard` 대상 templateType: 44, 3600, 91, 920, 921, 916 | `cardUtil.ts` | ✅ |
| `areaType === 2`인 블록만 이벤트 목록으로 렌더링 | `ExhibitionAllEvent.tsx` | ✅ |
| `cardId === 11`이면 이미지 경로를 real 환경 URL로 고정 (하드코딩) | 컴포넌트 내 | ✅ |
| `planBenefitTabPersonalizedInfo` + 최근 본 상품 쿠키 → Card3333 초기 탭 결정 | `useCard3333*.ts` | ✅ |
| 숏폼 쿠폰: `allDownloadYn` 플래그로 전체/개별 다운로드 분기 | short 훅 | ✅ |
| `SaleType`: total / lf / external → Best 탭 필터 | `types/best` | ✅ |
| `benefitTypeName` A02~A09 코드별 혜택 렌더링 분기 | `usePlanningTemplate.tsx` | ✅ |

---

## 4. 현재 아키텍처 패턴

### 실제 데이터 흐름 ✅ 코드에서 확인됨

```
[서버 CMS]
  ↓ DisplayAreaDTO → CardDTO(templateType) → CardBlockDTO → CardBlockContentDTO
[API Layer]
  └── api/exhibition/exhibition.ts (ExhibitionApiFactory 단순 래퍼)
[Server State Layer]
  └── hooks/api/exhibition/** (TanStack Query 훅 60개 이상)
[UI State Layer]
  └── Recoil store (ExhibitionSearchRequestDTO 등)
[Presentation Layer]
  ├── routes/Exhibition*.tsx (페이지)
  └── components/cardsNew/CardMapMobile.ts
        └── templateType → Component 동적 매핑
```

**현재 패턴:** CMS-driven UI 패턴 + Feature-Hook 패턴

---

## 5. DDD 관점 진단

### 서브도메인 분류 (코드 기반 추정)

| 하위 영역 | 추정 분류 | 근거 | 확인 여부 |
|-----------|-----------|------|----------|
| 기획전(planning/event) | **Core Domain 후보** | 상품 큐레이션·혜택·개인화 — 차별화 요소 | ❓ 비즈니스 확인 필요 |
| 개인화 추천(recommend/hyper) | **Core Domain 후보** | 사용자 행동 기반, 경쟁사 차별화 | ❓ 비즈니스 확인 필요 |
| 숏폼(short) | **Supporting 후보** | 콘텐츠 채널 다양화, 범용 패턴 | ❓ 비즈니스 확인 필요 |
| 라이브(live) | **Supporting 후보** | 라이브커머스, 외부 서비스 연동 강함 | ❓ 비즈니스 확인 필요 |
| 브랜드관/LNB | **Supporting 후보** | 상품 탐색 지원, 범용 | ❓ 비즈니스 확인 필요 |
| 혜택다운로드(benefit) | **Generic 후보** | 쿠폰 발급은 범용 패턴 | ❓ 비즈니스 확인 필요 |

> ❓ 서브도메인 유형 최종 판단은 비즈니스 전략(무엇이 LF Mall의 경쟁 우위인가)을 알아야 가능.

### 잘된 부분 ✅ 코드에서 확인됨

1. **CMS-driven 카드 아키텍처 일관성** — `DisplayArea → Card → Block → Content` 계층이 API DTO부터 컴포넌트까지 유지됨. `CardMapMobile.ts`의 templateType 기반 동적 매핑으로 카드 추가 시 한 곳만 수정.
2. **훅 네이밍 명확성** — `useFetchGetExhibitionShortContents`, `useMutationPostExhibitionShortLike`처럼 HTTP 메서드 + 도메인 + 기능이 드러남.
3. **`TARGET_PAGE_TYPE_ENUM` 정의** — 랜딩 타입 숫자 코드를 Enum으로 표현.
4. **`PAGE_CODE` 중앙화** — 페이지별 ETag 코드를 `routes.ts`에서 일관 관리.

### 개선이 필요한 부분 ✅ 코드에서 확인됨

1. **Bounded Context 경계 없음** — `ExhibitionApiFactory` 하나가 브랜드·라이브·기획전·숏폼·추천 전체를 담당. 사실상 **Big Ball of Mud** 상태.
2. **도메인 모델 부재** — 모든 타입이 API DTO(`*DTO`, `*ResponseDTO`) 그대로 UI까지 노출. `ExhibitionProductDTO`가 Presentation 레이어에서 직접 사용됨.
3. **빈약한 도메인 모델(Anemic)** — 도메인 로직이 훅 안에 흩어짐. `usePlanningTemplate.tsx`의 `getCouponBenefit()`은 도메인 서비스 성격이나 훅으로 구현되어 경계 불명확.
4. **불투명한 숫자 코드** — `benefitTypeName`이 `"A02"~"A09"`, `targetPageType`이 `case 1:`, `case 26:` 주석 의존. `cardId === 11` 직접 비교. 유비쿼터스 언어 미반영.
5. **레이어 경계 위반** — `ExhibitionSnsDetail.tsx`에서 API 훅 호출·위시리스트 상태·로그인 체크·네비게이션 처리가 동시에 수행. Presentation + Application 혼재.
6. **레거시/신규 이중 구조** — `components/cards/`(레거시)와 `components/cardsNew/`(신규) 병존. 분류 기준 불명.
7. **도메인 이벤트 없음** — 좋아요·쿠폰 다운로드·조회수 기록 등 의미 있는 사건이 모두 직접 API 호출로만 처리. `ShortFormLiked`, `CouponDownloaded` 같은 도메인 이벤트 개념 없음.

---

## 6. 실제 소스 확인이 필요한 항목

> ❓ 아래 항목들은 프론트엔드 코드만으로 파악 불가. **서버 소스, 기획 문서, 또는 도메인 담당자 확인이 필요.**

| # | 항목 | 코드에서 발견된 단서 | 확인 필요 내용 |
|---|------|-------------------|--------------|
| 1 | `cardId === 11`의 의미 | 이미지 경로를 real 환경 URL로 강제 고정하는 조건으로 사용됨 | 어떤 전시 위치/용도의 카드인지. 왜 real URL 고정이 필요한지 |
| 2 | `templateType` 숫자 체계 설계 의도 | 1000번대, 2001~2407, 3333 범위가 혼재. CardMapMobile.ts에 주석 있음 | 번호 체계의 분류 기준. 1000번대 / 2000번대 / 3000번대가 의미하는 카드 세대 또는 유형 |
| 3 | `nonCachingCard` 대상 선정 근거 | templateType 44, 91, 920, 921, 916, 3600이 대상 | 이 카드들이 로그인 여부에 따라 다른 콘텐츠를 보여줘야 하는 비즈니스 이유 |
| 4 | `areaType === 2` 이벤트 필터 조건 | ExhibitionAllEvent.tsx에서 areaType 2만 렌더링 | areaType 1/3/4의 의미. 왜 2만 이벤트 목록 대상인지 |
| 5 | `planInfoType` 세대 교체 배경 | DESIGN → TEMPLATE → V2 → V3 순서 존재. 레거시 `/planning.do` fallback 로직 있음 | 각 버전의 전환 시점과 이유. 레거시 기획전의 폐기 계획 여부 |
| 6 | 개인화 데이터 생성 주체 | `planBenefitTabPersonalizedInfo` 필드가 서버에서 내려옴 | 서버 측 ML/추천 시스템의 구조. 개인화 기준(클릭, 구매, 찜 등) |
| 7 | 베네피아(Benepia)의 도메인 위치 | `types/exhibition/benepia`에 kids/vacation 두 종류 존재 | 복지몰 제휴 서비스인데 exhibition 안에 포함된 이유. 독립 바운디드 컨텍스트 후보인지 |
| 8 | `benefitTypeName` A02~A09 코드 체계 | `usePlanningTemplate.tsx`에서 분기 처리됨 | 코드 체계의 전체 목록 및 정의. 서버 공통 코드 정의 위치 |
| 9 | `l4u` 서브도메인의 의미 | `hooks/api/exhibition/l4u/`로 존재하나 코드 내 설명 없음 | l4u가 무엇을 의미하는지 (LF for You 등 추정이나 미확인) |
| 10 | `concierge` 서브도메인의 비즈니스 역할 | `hooks/api/exhibition/concierge/` 존재 | 컨시어지 서비스의 비즈니스 정의 및 일반 전시와의 차이 |
| 11 | `giftShop` 독립 컨텍스트 여부 | exhibition 하위에 위치하나 별도 기능 같음 | 선물하기 기능이 exhibition의 일부인지 독립 도메인인지 |
| 12 | `SaleType` (total/lf/external) 분류 기준 | Best 탭 필터로 사용됨 | 자사/외부 구분 기준. 판매유형이 전시 로직에 영향을 주는 범위 |

---

## 7. 종합 평가

| 항목 | 현재 수준 | 비고 |
|------|-----------|------|
| 바운디드 컨텍스트 분리 | ❌ 미적용 | exhibition 단일 모듈 안에 혼재 |
| 유비쿼터스 언어 | ⚠️ 부분 | 코드 용어는 일관되나 숫자 코드 혼재 |
| 도메인 모델 (Entity/VO/Aggregate) | ❌ 미적용 | DTO 직접 사용 |
| 레이어 분리 | ⚠️ 부분 | 훅 레이어는 있으나 도메인/앱 레이어 미분리 |
| 도메인 이벤트 | ❌ 미적용 | 직접 API 호출로만 처리 |
| CMS-driven 카드 아키텍처 | ✅ 잘됨 | templateType 기반 동적 매핑 일관성 |
