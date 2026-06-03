---
name: structured-data-validation-api
description: JSON-LD/Schema.org 구조화 데이터를 자동화 검증하기 위한 공식 도구·API·CI 통합 패턴. Google Rich Results Test, Schema Markup Validator, GSC URL Inspection API, schema-dts 타입 검증, Playwright 추출 + ajv 검증, GitHub Actions 통합.
---

# 구조화 데이터 검증 자동화 (JSON-LD)

> 소스:
> - Google Search Central — https://developers.google.com/search/docs/appearance/structured-data
> - Google 구조화 데이터 가이드라인 — https://developers.google.com/search/docs/appearance/structured-data/sd-policies
> - Rich Results Test — https://search.google.com/test/rich-results
> - Schema.org Validator — https://schema.org/docs/validator.html (서비스: https://validator.schema.org)
> - URL Inspection API 발표 — https://developers.google.com/search/blog/2022/01/url-inspection-api
> - google/schema-dts — https://github.com/google/schema-dts
> - google/react-schemaorg — https://github.com/google/react-schemaorg
> - Next.js JSON-LD 가이드 — https://nextjs.org/docs/app/guides/json-ld
> - iaincollins/structured-data-testing-tool — https://github.com/iaincollins/structured-data-testing-tool
>
> 검증일: 2026-06-02

이 스킬은 *작성된* JSON-LD 마크업을 자동으로 검증하는 도구·API·CI 패턴을 다룬다.
JSON-LD를 *어떻게 작성하는가*(카탈로그)는 별도 스킬 `frontend/schema-org-patterns`를 참조하라.

---

## 1. 검증 도구 비교 — 한눈에

| 도구 | 검증 범위 | 입력 | 공식 API | JS 렌더링 | 권장 용도 |
|------|-----------|------|:--------:|:---------:|-----------|
| Rich Results Test (RRT) | Google rich result 표시 가능 타입만 | URL / 코드 | 없음 | 있음 | 개발 중 즉시 확인 |
| Schema Markup Validator | schema.org 전체 스펙 (Google 기능 경고 없음) | URL / 코드 | 없음 | 있음 | 일반 schema.org 문법 검증 |
| GSC URL Inspection (UI) | 인덱싱된 페이지의 rich result 인식 결과 | URL | API 있음 | 있음 | 실제 인덱싱 후 결과 확인 |
| URL Inspection API | 위와 동일 (programmatic) | URL | **있음** | 있음 | CI/모니터링 |
| schema-dts (TS) | 타입 시그니처·필수 키 (컴파일 타임) | TS 소스 | N/A | 없음 | 작성 시점 정적 검증 |
| ajv + JSON Schema | 직접 정의한 schema 위반 | JSON | N/A | 없음 | 빌드/CI 단계 |
| structured-data-testing-tool | preset/스키마/태그 단위 검사 | URL / HTML | N/A | headless 가능 | E2E·smoke 검증 |

**공식 문서 권고 절차** (Google Search Central):
> "Start with the Rich Results Test to see what Google rich results can be generated for your page. For generic schema validation, use the Schema Markup Validator."

---

## 2. Google Rich Results Test (RRT)

### 정의
- URL 또는 코드 스니펫을 입력받아, Google이 *rich result로 표시 가능한 타입만* 검증.
- JavaScript 렌더링 포함(Google과 동일한 모바일 봇 가정).
- 결과: 유효한 항목 / 경고(권장 필드 누락) / 에러(필수 필드 누락·형식 오류).

### 자동화 한계 (중요)
> **공식 API 없음.** Google은 구 Structured Data Testing Tool API를 2020-12 폐기했고, RRT 후속 API는 제공하지 않는다.
> programmatic 검증은 GSC URL Inspection API 또는 schema.org Validator UI에 의존하거나, 직접 JSON-LD 파싱·검증 파이프라인을 구성해야 한다.

> 주의: User-Agent를 `Googlebot`으로 위장해 RRT 페이지를 스크래핑하는 방식은 *Google 서비스 약관 위반 소지*가 있고, IP/captcha 보호로 안정적이지 않다. 권장하지 않는다.

### 2026 변경 사항 — FAQ rich result deprecation
- 2026-05-07: FAQ rich result Google 검색 노출 중단
- 2026-06: RRT의 FAQPage 지원 제거 예정
- 2026-08: GSC API에서 FAQPage 보고서 제거 예정

> 주의: FAQPage JSON-LD를 작성한 페이지는 *마크업 자체는 유효*하지만 rich result는 더 이상 표시되지 않는다. 의료/정부 사이트 등 일부 예외는 별도 공지.

---

## 3. Schema Markup Validator (validator.schema.org)

- 출처: https://validator.schema.org
- schema.org 전체 어휘 기반으로 JSON-LD 1.0 / RDFa 1.1 / Microdata를 추출·검증.
- Google rich result 표시 여부와는 **별개**. "이 마크업이 schema.org 스펙에 부합하는가"만 본다.
- JavaScript로 삽입된 마크업 추출 가능.
- `@context`가 `https://schema.org`가 아닌 다른 URL이면 해당 context는 fetch/해석하지 않는다.
- **공식 API 없음.**

**활용 전략**: RRT가 모르는 타입(Google rich result 미지원)을 검증할 때 유용. 예: `Person`, `Course`(일부), 일반 메타데이터용 타입.

---

## 4. GSC URL Inspection API — 유일한 공식 자동화 경로

### 특징
- 엔드포인트: `POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect`
- 인증: OAuth 2.0 (Search Console 속성 소유권 확인된 계정만)
- 응답 필드 중 `richResultsResult`에 rich result 인식 결과 포함.
- 제약:
  - GSC에 등록·검증된 도메인의 URL만 가능
  - 이미 *인덱싱된* 또는 적어도 크롤링된 URL만 의미 있는 결과
  - **raw 코드 스니펫·staging URL·미인덱싱 URL은 검증 불가**
  - Rate limit: 속성당 분당 600회, 일 2,000회 (변경 가능, 공식 문서 재확인 필요)

### 사용 예시 (Node.js, googleapis 클라이언트)

```ts
import { google } from 'googleapis';

const searchconsole = google.searchconsole({
  version: 'v1',
  auth: oauth2Client, // OAuth2 인증된 클라이언트
});

const res = await searchconsole.urlInspection.index.inspect({
  requestBody: {
    inspectionUrl: 'https://example.com/products/123',
    siteUrl: 'https://example.com/', // GSC 등록된 속성 URL
  },
});

const rich = res.data.inspectionResult?.richResultsResult;
if (rich?.verdict !== 'PASS') {
  console.error('Rich result 검증 실패:', rich?.detectedItems);
  process.exit(1);
}
```

> 주의: 인덱싱 전 페이지에는 사용할 수 없으므로 *staging 환경 CI*에는 부적합. 프로덕션 배포 후 모니터링·회귀 감지 용도로 적합.

---

## 5. schema-dts — 컴파일 타임 타입 검증

### 정의
- Google이 만든 TypeScript 타입 정의 라이브러리. schema.org 전체 어휘를 판별 유니온(discriminated union)으로 제공.
- 최신 안정 버전: **v2.0.0** (2026-03-23 릴리스, npm `schema-dts`).
- 면책: GitHub 레포 README에 "This is not an officially supported Google product" 명시.

### 설치
```bash
npm install --save-dev schema-dts
```

### 사용 — `WithContext<T>`로 최상위 객체 타입 안전 작성

```ts
import type { Product, WithContext, Offer } from 'schema-dts';

const productJsonLd: WithContext<Product> = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Acme Widget',
  image: 'https://example.com/widget.png',
  description: 'A widget.',
  offers: {
    '@type': 'Offer',
    price: '19.99',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock', // ItemAvailability enum URL
  } satisfies Offer,
};
```

### 컴파일 타임에 잡히는 것
- `@type` 오타 (예: `Prouduct` → 타입 에러)
- 필수 필드 시그니처 누락 (Product의 `name` 등 — 단, schema.org 자체가 "required" 개념이 약해 일부는 옵셔널)
- 잘못된 값 형식 (예: `priceCurrency`에 숫자 할당 시도)
- 중첩 객체의 `@type` 누락 (`Offer` 자체가 판별 유니온이므로 `@type` 없으면 타입 매칭 실패)

### 한계 — 런타임 값은 못 잡음
- 빈 문자열, 잘못된 ISO 8601 날짜, 깨진 URL은 컴파일러가 모름 → ajv 등 런타임 검증과 병행 필요.

### react-schemaorg (보조 라이브러리)
- 출처: https://github.com/google/react-schemaorg
- v2.0.0 (2021-07), Apache-2.0, "not officially supported Google product"
- schema-dts 의존.
- `<JsonLd>` 컴포넌트, `jsonLdScriptProps` 헬퍼 제공.

> 주의: react-schemaorg는 2021년 이후 활발한 업데이트가 없다. **Next.js App Router를 쓴다면 react-schemaorg 없이 schema-dts + 직접 `<script>` 삽입이 공식 권장 패턴이다** (Next.js 공식 가이드).

### Next.js 공식 권장 패턴 (App Router)

```tsx
// app/products/[id]/page.tsx
import type { Product, WithContext } from 'schema-dts';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  const jsonLd: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
  };

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          // < 이스케이프 필수: XSS + JSON 파싱 실패 방지
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {/* ... */}
    </section>
  );
}
```

> Next.js 공식 안내: "JSON-LD는 실행 가능한 코드가 아니라 구조화된 데이터이므로 `next/script`가 아닌 네이티브 `<script>` 태그가 올바른 선택이다."

---

## 6. CI 통합 패턴 — 4가지 조합

| # | 패턴 | 검증 시점 | 강점 | 약점 |
|---|------|-----------|------|------|
| A | schema-dts 컴파일 타임 | `tsc` 단계 | 가장 빠름, 무료 | 타입 시그니처만, 런타임 값 못 잡음 |
| B | ajv + JSON Schema | 빌드/유닛 테스트 | 필수 필드·형식 강제, 빠름 | 직접 schema 정의 필요 |
| C | Playwright + JSON-LD 추출 + 검증 | E2E 단계 (staging) | 실제 렌더링 후 마크업 검증, JS 삽입 대응 | 느림, 브라우저 의존 |
| D | URL Inspection API 모니터링 | 프로덕션 배포 후 | Google 실제 인식 결과 | 인덱싱된 URL만, 즉시성 없음 |

권장 조합: **A + B는 빌드 단계 필수, C는 staging 회귀 방지, D는 프로덕션 모니터링 별도 잡(job)**.

### 6.1 ajv 검증 예시 (패턴 B)

```ts
// scripts/validate-jsonld.ts
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv); // date, uri, email 등 표준 format 추가

// 프로젝트 도메인에 맞춘 *최소 필수 필드* 스키마 (schema.org 전체가 아님)
const productSchema = {
  type: 'object',
  required: ['@context', '@type', 'name', 'image', 'description', 'offers'],
  properties: {
    '@context': { const: 'https://schema.org' },
    '@type': { const: 'Product' },
    name: { type: 'string', minLength: 1 },
    image: { type: 'string', format: 'uri' },
    description: { type: 'string', minLength: 1 },
    offers: {
      type: 'object',
      required: ['@type', 'price', 'priceCurrency', 'availability'],
      properties: {
        '@type': { const: 'Offer' },
        price: { type: 'string', pattern: '^\\d+(\\.\\d{1,2})?$' },
        priceCurrency: { type: 'string', pattern: '^[A-Z]{3}$' },
        availability: {
          enum: [
            'https://schema.org/InStock',
            'https://schema.org/OutOfStock',
            'https://schema.org/PreOrder',
          ],
        },
      },
    },
  },
};

const validate = ajv.compile(productSchema);

export function assertValidProductLd(jsonLd: unknown): void {
  if (!validate(jsonLd)) {
    const msg = ajv.errorsText(validate.errors, { separator: '\n  - ' });
    throw new Error(`JSON-LD validation failed:\n  - ${msg}`);
  }
}
```

> 주의: schema.org 전체를 JSON Schema로 그대로 옮긴 공식 스펙은 없다. `schemaorg-jsd` 같은 커뮤니티 프로젝트가 있으나 stars 100 미만이므로 *프로젝트가 실제로 노출하는 타입에 맞춘 최소 스키마*를 직접 정의하는 편이 안전하다.

### 6.2 Playwright 추출 + 검증 예시 (패턴 C)

```ts
// tests/seo/jsonld.spec.ts
import { test, expect } from '@playwright/test';
import { assertValidProductLd } from '../../scripts/validate-jsonld';

test('상품 상세 페이지에 유효한 Product JSON-LD가 있다', async ({ page }) => {
  await page.goto('/products/abc-123');

  // <script type="application/ld+json"> 모두 추출 (JS 삽입 후)
  const scripts = await page.locator('script[type="application/ld+json"]').all();
  expect(scripts.length).toBeGreaterThan(0);

  let productLd: unknown = null;
  for (const s of scripts) {
    const raw = await s.textContent();
    if (!raw) continue;
    const parsed = JSON.parse(raw);
    if (parsed['@type'] === 'Product') {
      productLd = parsed;
      break;
    }
  }

  expect(productLd, 'Product JSON-LD가 페이지에 존재해야 함').not.toBeNull();
  expect(() => assertValidProductLd(productLd)).not.toThrow();
});
```

> 주의: `<script>` 내부에 `<` 이스케이프(`<`)가 빠지면 `</script>` 시퀀스로 인해 *JSON 파싱 자체가 실패*한다. Next.js 공식 패턴(`.replace(/</g, '\\u003c')`)을 반드시 적용한다.

### 6.3 GitHub Actions 통합 (패턴 A+B+C 조합)

```yaml
# .github/workflows/seo-validate.yml
name: SEO Structured Data Validation

on:
  pull_request:
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      # 패턴 A — schema-dts 타입 검증은 tsc로 자연스럽게 포함
      - name: TypeScript type check (includes schema-dts)
        run: npx tsc --noEmit

      # 패턴 B — JSON-LD 픽스처 또는 빌드 산출물에 ajv 검증
      - name: ajv 런타임 검증 (unit tests)
        run: npm test -- jsonld

      # 패턴 C — Playwright로 렌더링 후 검증
      - name: Build
        run: npm run build
      - name: Start app
        run: npm start &
      - name: Wait for app
        run: npx wait-on http://localhost:3000
      - name: Playwright structured data tests
        run: npx playwright test tests/seo/
```

> 주의: GitHub Actions 러너에서 외부 `validator.schema.org`나 RRT를 자동 호출하지 말라. 공식 API가 없고, 비공식 우회는 약관 위반 소지가 있다.

### 6.4 structured-data-testing-tool (선택지)
- 출처: https://github.com/iaincollins/structured-data-testing-tool
- npm: `structured-data-testing-tool`
- 기능: HTML/JSON-LD/Microdata/RDFa 자동 추출, Twitter/Facebook/Google 프리셋, headless 브라우저로 JS 삽입 마크업 검증, CLI(`sdtt --url ...`).
- 활용: PR 단계 smoke 테스트, 또는 cron으로 프로덕션 URL 검증.

> 주의: 비공식 도구. stars 700+ 수준이지만 1순위 공식 도구(RRT, Schema Markup Validator) 결과와 *동등한 권위는 없다*. 보조 수단으로만 사용하라.

---

## 7. 검증 실패 시 흔한 원인 체크리스트

| 원인 | 증상 | 해결 |
|------|------|------|
| `@context` 오타·누락 | "@context not found" | 정확히 `https://schema.org` (트레일링 슬래시 없음) |
| 필수 필드 누락 | RRT "Missing field 'X'" 에러 | Google이 요구하는 *Google 가이드라인* 필수 필드 확인 (schema.org 자체 필수 ≠ Google 필수) |
| 잘못된 날짜 형식 | "Invalid date" | ISO 8601 (`2026-06-02T10:00:00+09:00`) |
| ItemAvailability 잘못된 값 | "Invalid availability" | `https://schema.org/InStock` 등 *URL 그대로*, 문자열 "InStock" 아님 |
| 중첩 객체 `@type` 누락 | "Type X expected" | 모든 중첩 객체에 `@type` 명시 |
| `<` 미이스케이프 | JSON 파싱 실패, 마크업 0개로 인식 | `JSON.stringify(x).replace(/</g, '\\u003c')` |
| 클라이언트 사이드만 삽입 | 정적 HTML 검증 도구가 못 잡음 | SSR/SSG로 초기 HTML에 포함, 또는 headless로 렌더링 후 검증 |
| 가격이 number | "price must be string" | Google은 `price`를 문자열 권장 |

---

## 8. Rich Result 표시 안 됨 — 진단 순서

마크업은 통과했는데 검색 결과에 rich result가 안 보일 때:

1. **GSC URL 검사 → 라이브 URL 테스트** — 인덱싱 여부 확인.
2. **GSC > 향상(Enhancements) 보고서** — 해당 타입(Product, Recipe 등)의 에러 분류.
3. **RRT 재실행** — Googlebot 시점의 렌더링 결과 재확인.
4. **품질 가이드라인 점검** —
   > Google 공식: "Google does not guarantee that your structured data will show up in search results, even if your page is marked up correctly."
   > "Violating a quality guideline can prevent syntactically correct structured data from being displayed as a rich result."
   - 사용자에게 숨겨진 콘텐츠를 마크업에 포함하지 않았는가
   - 페이지 주요 콘텐츠를 정확히 대표하는가
   - E-E-A-T 신호가 충분한가
5. **수동 조치(Manual Action) 확인** — GSC 좌측 메뉴.

> 주의: rich result는 표시 *자격*만 부여한다. 표시 보장은 없다. 표시 안 됨 ≠ 마크업 오류.

---

## 9. 흔한 실수 패턴 (anti-patterns)

| 실수 | 왜 문제인가 | 올바른 접근 |
|------|------------|------------|
| RRT만 보고 GSC 보고서 확인 안 함 | 인덱싱 시점에야 드러나는 에러 놓침 | RRT(개발) + GSC URL 검사(배포 후) 둘 다 |
| Schema Markup Validator만 통과하면 끝 | Google rich result 표시 여부는 별개 판정 | rich result 노리는 타입은 반드시 RRT 추가 |
| 검증 없이 프로덕션 배포 | 회귀 발견이 며칠 늦어짐 | 빌드 단계 schema-dts + ajv 필수 |
| 정적 HTML만 검증 | 클라이언트 사이드 삽입 마크업 누락 감지 못 함 | Playwright 등 headless로 렌더링 후 검증 |
| RRT 결과를 스크래핑으로 자동화 | 약관 위반 소지, captcha/IP 차단 | GSC URL Inspection API + 직접 검증 파이프라인 |
| Googlebot UA로 위장 | 위와 동일 | 사용 금지 |
| schema.org URL 끝 슬래시 다양화 | `https://schema.org/` vs `https://schema.org` 불일치 | `@context`는 `https://schema.org` (슬래시 없음) 고정 |
| FAQPage 새로 추가 | 2026-05-07부터 표시 안 됨 | 의료/정부 등 예외 케이스 외에는 추가 안 함 |
| `next/script`로 JSON-LD 삽입 | JSON-LD는 실행 코드가 아니라 데이터 | 네이티브 `<script type="application/ld+json">` |
| react-schemaorg에 의존 | 2021년 이후 정체, schema-dts로 충분 | Next.js는 schema-dts + 직접 `<script>` |

---

## 10. 의사결정 가이드

```
"내가 작성한 JSON-LD가 맞는지 확인하고 싶다"
  │
  ├─ 개발 중, 즉시 확인 → 브라우저로 RRT 또는 Schema Markup Validator
  ├─ TypeScript 프로젝트 → schema-dts로 컴파일 타임 잡기
  ├─ 빌드 단계 자동화 → ajv + 프로젝트 도메인 스키마
  ├─ Staging E2E 자동화 → Playwright로 렌더링 후 JSON-LD 추출 + ajv
  └─ 프로덕션 모니터링 → GSC URL Inspection API (인덱싱된 URL)

"Rich result가 안 나타난다"
  │
  ├─ 마크업 문법? → RRT
  ├─ 인덱싱? → GSC URL 검사
  ├─ 분류별 에러? → GSC 향상 보고서
  └─ 가이드라인 위반? → 수동 조치 확인 + 품질 가이드 점검
```
