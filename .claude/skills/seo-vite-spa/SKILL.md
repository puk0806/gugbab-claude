---
name: seo-vite-spa
description: Vite / CRA SPA SEO의 최신 판단 기준 — 단계별 강화 경로, Rendertron·동적 렌더링 격하, react-helmet-async v3 / @unhead/react v3 peer(React 19.2.4+) 선택, vite-plugin-sitemap 정체, Vike Head API·프리렌더 플러그인 유지보수 상태
---

# SEO — Vite / CRA SPA (Client-Side Rendering)

> 소스:
> - react-helmet-async: https://github.com/staylor/react-helmet-async
> - @unhead/react: https://unhead.unjs.io/docs/react/head/guides/get-started/installation
> - Vike: https://vike.dev/pre-rendering, https://vike.dev/render-modes
> - CRA deprecation: https://react.dev/blog/2025/02/14/sunsetting-create-react-app
> - Googlebot JS rendering: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
>
> 검증일: 2026-11-09 (3차 재검증: react-helmet-async 3.0.0(변동 없음)·@unhead/react 3.4.3(v3 peer `react >=19.2.4` 확인 → React 18은 v2 라인)·Vike 0.4.270·vike-react 0.6.32(`useConfig`/`useData` export 유지)·vite-plugin-sitemap 0.8.2(정체 지속)·vite-prerender-plugin 0.5.14 VERIFIED)
> 이전 검증: 2026-09-28 (최초 2026-06-01 · 08-26 freshness 재검증: react-helmet-async 3.0.0(React 19 지원)·@unhead/react 3.x·Vike·CRA deprecated VERIFIED. 동적 렌더링/Rendertron 비권장 주의 블록 추가, vite-plugin-sitemap 유지보수 정체(2025-05 이후 무갱신) 주의 추가 · 09-28 2차 재검증: react-helmet-async 3.0.0(변동 없음)·@unhead/react 3.4.1(v3 유지)·Vike 0.4.266(활발히 유지보수, v1.0 아직 미출시) VERIFIED. Vike 네이티브 Head API(`+config`/`+Head`/`useConfig`) 보강(references/REFERENCE.md 6-1-1))

---

## 전제와 한계

> **주의 — 동적 렌더링(Dynamic Rendering)·Rendertron은 더 이상 권장 경로가 아니다 (2026-08-26 추가):** 크롤러 UA만 골라 헤드리스 브라우저로 렌더한 HTML을 주는 방식(Rendertron·prerender.io 류)은 Google이 **"권장 방식이 아닌 임시 우회책(workaround)"** 으로 격하했고, Rendertron 저장소는 2022년 archive 처리돼 유지보수가 없다. 이미 운영 중이면 당장 걷어낼 필요는 없지만, **신규 도입은 하지 말고** 아래 4·5단계(Vike/vite-prerender-plugin 프리렌더 또는 SSR)로 간다. 카카오·페이스북 공유 미리보기만 급하면 CDN/Edge에서 `og:*` 메타만 주입하는 가벼운 분기가 대안이다(`frontend/kakao-share-optimization` 5절).

---

## 단계별 SEO 강화 경로

| 단계 | 조치 | 효과 | 적합한 상황 |
|------|------|------|-------------|
| 0 | `public/index.html`에 정적 메타 태그 | 1차 크롤링 시 기본 메타 노출 | 모든 환경 (즉시 가능) |
| 1 | react-helmet-async 또는 @unhead/react로 라우트별 동적 메타 | Googlebot 2차 렌더 시 라우트 메타 반영 | 모든 SPA |
| 2 | `public/sitemap.xml`, `public/robots.txt` 추가 | 크롤링 우선순위·발견율 향상 | 모든 SPA |
| 3 | vite-plugin-sitemap 등으로 sitemap 자동 생성 | 라우트 변경 시 sitemap 동기화 | 라우트가 많거나 자주 변경되는 사이트 |
| 4 | Vike 또는 vite-prerender-plugin으로 빌드 타임 프리렌더(SSG) | 1차 크롤링에 완전한 HTML 제공 | 콘텐츠가 정적·반정적인 페이지 (랜딩, 블로그, 문서) |
| 5 | Vike 또는 별도 Node 서버로 SSR | 1차 크롤링 + 실시간 콘텐츠 | 콘텐츠가 자주 바뀌고 인덱싱 신선도가 중요한 경우 |

---

## 2. 라우트별 동적 메타 — react-helmet-async (현 시점 권장)

`react-helmet-async`는 v3.0.0(2026-03 출시)부터 React 19를 공식 지원한다. React 19에서는 `<Helmet>`이 실제 DOM 요소를 렌더링하고 React가 자동으로 `<head>`로 호이스팅한다. React 16~18에서는 기존 방식(태그 수집·중복 제거 후 DOM 조작)을 유지한다.

> 참고: 2024년~2026년 초까지 react-helmet-async는 한동안 무유지보수 상태였다가 v3에서 다시 활성화됐다. 장기적 대안으로는 @unhead/react가 있다 (다음 절 참조).

---

## 3. 대안: @unhead/react (React 19 기반 신규 프로젝트 권장)

`@unhead/react`는 unjs(Nuxt 팀이 만든 범용 패키지군)의 head 매니저로, Vue·React·Solid·Svelte·Angular를 동일한 API로 지원한다. v3(2026-04 기준 stable)부터 React에 1급 지원이 들어갔고 react-helmet 마이그레이션 가이드와 호환 export(`@unhead/react/helmet`)를 제공한다.

> 주의 (2026-11-09): `@unhead/react` v3(3.0.0~3.4.3)은 peerDependencies가 `react >=19.2.4`다(npm registry 확인). **React 18 SPA는 v3를 설치할 수 없으므로** `@unhead/react@^2`(peer `react >=18.3.1`)를 쓰거나 `react-helmet-async` v3(React 16~19 지원)를 선택한다.

### react-helmet-async vs @unhead/react 선택 기준

| 기준 | react-helmet-async v3 | @unhead/react v3 |
|------|----------------------|-------------------|
| 안정성 | 오래된 표준, 다수 프로젝트 채택 | 신규지만 unjs/Nuxt가 백업 |
| React 19 지원 | v3.0.0부터 공식 (peer React 16~19) | v3부터 1급 지원 (v3 peer `react >=19.2.4` — React 18은 v2) |
| TypeScript 타입 안전 | 보통 | 강함 (useSeoMeta로 컴파일 타임 검증) |
| 마이그레이션 비용 | 기존 react-helmet 코드 거의 그대로 | helmet 호환 export 제공 |
| 번들 사이즈 | 작음 | 약 11% 더 작다고 공식 발표 (v3 기준) |
| 추천 상황 | 기존 react-helmet 사용 중인 레거시 코드 | 신규 SPA, 타입 안전이 중요한 팀 |

신규 프로젝트라면 `@unhead/react`, 기존 코드 유지가 우선이면 `react-helmet-async`.

---

## 5. sitemap.xml / robots.txt

### 자동 생성 — vite-plugin-sitemap

> 주의 (2026-08-26): `vite-plugin-sitemap`은 최신 0.8.2가 **2025-05-15 발행 이후 갱신이 없다**(npm registry 기준). 동작은 하지만 Vite 8(Rolldown) 호환은 직접 확인해야 하며, 라우트가 동적(상품·카테고리 수만 개)인 커머스는 어차피 **빌드 스크립트나 서버에서 DB 기준으로 sitemap을 생성**하는 편이 맞다 — 플러그인은 정적 라우트 수십 개 수준에서만 쓴다.

---

> 상세 레퍼런스 (Vike Head API·프리렌더 플러그인 유지보수 상태) → [`references/REFERENCE.md`](references/REFERENCE.md)
