## 6. 빌드 타임 프리렌더 (SSG) — 가장 효과 큰 SEO 강화

### 6-1-1. Vike 자체 Head API (vike-react 사용 시, 2026-09-28 추가)

`vike-react`(또는 vike-vue/vike-solid) 통합 패키지를 쓰면 react-helmet-async/@unhead/react 없이도 Vike 자체 `+config`/`+Head` 설정만으로 메타 태그를 관리할 수 있다. 공식 문서: https://vike.dev/head-tags

전역 기본값 (override 가능·비누적):

```js
// pages/+config.js
export default {
  title: '서비스명',                // <title>, <meta property="og:title">
  description: '서비스 기본 설명',  // <meta name="description">, <meta property="og:description">
  image,                            // <meta property="og:image">
}
```

라우트별 오버라이드:

```js
// pages/products/+config.js
export default {
  title: product.name,
  description: product.description,
  image: product.image,
}
```

favicon 등 임의 태그는 `+Head.js`(누적·override 불가):

```jsx
// pages/+Head.js
export function Head() {
  return <link rel="icon" href={favicon} />
}
```

fetch한 데이터 기반 동적 메타는 `+data` 안에서 `useConfig()`:

```jsx
// pages/products/+data.js
import { useConfig } from 'vike-react/useConfig' // vike-vue/solid는 각각의 패키지 경로

export async function data(pageContext) {
  const config = useConfig()
  const product = await fetchProduct(pageContext.routeParams.id)
  config({ title: product.name, description: product.description })
  return { product }
}
```

> 주의: `+title`/`+description`/`+image`는 override(비누적, 마지막 값으로 덮어씀)지만 `+Head`는 cumulative(누적, 상위·하위 페이지 모두 합산)다 — 혼동하면 favicon은 잘 쌓이는데 title은 왜 안 합쳐지는지 헷갈릴 수 있다.
> 이 방식은 `vike-react`(또는 vike-vue/solid) 사용 시에만 제공된다. 순수 Vike(프레임워크 통합 없이)만 쓰면 `onBeforeRender` 훅에서 HTML head를 직접 조립해야 한다.
> react-helmet-async/@unhead/react 대비 선택 기준: Vike 전용 프로젝트면 네이티브 API가 의존성 하나 없이 더 간결하다. Next.js 등 다른 렌더러와 컴포넌트·훅을 공유해야 하면 react-helmet-async/@unhead/react 쪽이 이식성이 낫다.

**JSON-LD를 `+Head.js`로 삽입 (공식 문서 예제, 2026-09-28 추가)**: 임의 `<script>` 태그도 `+Head`가 담당한다. 공식 문서(https://vike.dev/head-tags)는 `dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}`를 예시로 들지만, 4절의 XSS 주의(`JSON.stringify` 결과를 이스케이프 없이 그대로 박으면 `</script>` 컨텍스트 탈출 가능)가 여기도 그대로 적용된다 — 실제 코드에서는 4절의 `serializeJsonLd` 헬퍼(`<` → `<` 치환)를 거쳐야 한다:

```jsx
// pages/products/+Head.js
// Environment: server
import { useData } from 'vike-react/useData'
import { serializeJsonLd } from '../../lib/seo' // 4절 참조

export function Head() {
  const { product } = useData() // fetch된 데이터 기반 동적 JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
  )
}
```

`+Head`는 누적이므로 라우트마다 다른 JSON-LD `@type`(Product·Article 등)을 상위 레이아웃과 충돌 없이 쌓을 수 있다. 동적 데이터는 `useData()`(또는 `usePageContext()`)로 페이지별 값을 가져온다.

### 6-2. vite-prerender-plugin — 가벼운 대안

이미 일반 Vite + React SPA로 운영 중이고 Vike만큼의 구조 변경 없이 핵심 라우트만 프리렌더하고 싶다면 `vite-prerender-plugin`(preactjs 조직 유지)을 사용할 수 있다.

> 주의: `vite-plugin-prerender`(Rudeus3Greyrat 저장소)는 최근 1년 이상 npm publish 활동이 없어 사실상 미유지보수 상태다. 신규 채택 시 활성 상태인 `vite-prerender-plugin`(preactjs 조직)을 선택할 것.

> 주의: `react-snap`(stereobooster)은 한때 표준처럼 쓰였지만 2019년 이후 신규 커밋이 끊긴 상태다. 신규 프로젝트에는 권장하지 않는다.
