---
skill: seo-vite-spa
category: frontend
version: v1.5
date: 2026-09-28
status: APPROVED
---

# seo-vite-spa 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `seo-vite-spa` |
| 스킬 경로 | `.claude/skills/frontend/seo-vite-spa/SKILL.md` |
| 검증일 | 2026-09-28 (재검증, 이전 2026-08-26, 최초 2026-06-01) |
| 검증자 | skill-creator (Claude Code 에이전트) |
| 스킬 버전 | v1.3 |

---

## 1. 작업 목록 (Task List)

- [✅] react-helmet-async 현재 유지보수·React 19 호환 상태 공식 GitHub 확인
- [✅] @unhead/react v3 안정성·React 1급 지원 공식 문서 확인
- [✅] Vike(구 vite-plugin-ssr) 리브랜드 및 prerender 모드 공식 문서 확인
- [✅] CRA deprecation 공식 발표(react.dev) 직접 확인
- [✅] react-snap 유지보수 상태 GitHub·외부 소스 교차 확인
- [✅] vite-plugin-sitemap 사용법·React Router 통합 확인
- [✅] Googlebot two-wave 렌더링·SPA 인덱싱 한계 공식·외부 소스 확인
- [✅] JSON-LD XSS 이스케이프 패턴(`<` → `<`) 확인
- [✅] satori OG 이미지 빌드 타임 생성 패턴 확인
- [✅] SKILL.md 작성 (8개 본문 섹션 + 한계·실수 패턴)
- [✅] verification.md 작성

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | react-helmet-async 유지보수 상태 / React 19 호환 | v3.0.0(2026-03)에서 React 19 지원 부활, GitHub issue·npm·블로그 다수 일치 |
| 조사 | WebSearch | @unhead/react stable / React 1급 지원 / v3 release | v3가 stable, 2026-04 문서 갱신, react-helmet 마이그레이션 가이드 존재 |
| 조사 | WebSearch | Vike vite-plugin-ssr 리브랜드 / prerender / SSG | vike.dev가 공식, v0.4.142가 dual-publish 마지막 버전, prerender:true 지원 |
| 조사 | WebSearch | CRA deprecated react.dev official 2025 | 2025-02-14 공식 sunset 발표, react.dev/blog 게시 |
| 조사 | WebSearch | react-snap maintenance / vite-plugin-prerender npm 상태 | react-snap 2019 이후 dormant, vite-plugin-prerender(Rudeus3Greyrat) inactive, vite-prerender-plugin은 활성 |
| 조사 | WebSearch | vite-plugin-sitemap React Router config | sitemap-ts 기반, dist 스캔 후 sitemap.xml + robots.txt 생성, dynamicRoutes·exclude 지원 |
| 조사 | WebSearch | JSON-LD XSS react-helmet ld+json escape | `<` → `<` 치환 패턴이 표준, JSON.stringify 단독으로는 부족 |
| 조사 | WebSearch | Googlebot JS rendering SPA two-wave | 1차 HTML 크롤 + 2차 JS 렌더 분리, 지연 수 시간~수 일, AI 크롤러는 정적 HTML만 봄 |
| 조사 | WebSearch | satori vercel OG image build time | JSX → SVG → PNG, useState 등 React API 미지원, 빌드 스크립트로 사용 |
| 조사 | WebFetch | vike.dev/pre-rendering / vike.dev/render-modes | prerender 옵션 시그니처와 SPA/SSR/SSG/HTML-only 정의 직접 확인 |
| 조사 | WebFetch | unhead.unjs.io React 설치 가이드 | createHead + UnheadProvider + useHead 시그니처 직접 확인 |
| 조사 | WebFetch | react.dev/blog/2025/02/14/sunsetting-create-react-app | 공식 권장 경로(Next.js → React Router → Vite) 직접 확인 |
| 조사 | WebFetch | github.com/staylor/react-helmet-async | v3.0.0 React 19 런타임 분기 동작 직접 확인 |
| 교차 검증 | WebSearch | 9개 핵심 클레임, 각 2개 이상 독립 소스 | VERIFIED 9 / DISPUTED 0 / UNVERIFIED 0 (주의 표기 3건은 dormant 라이브러리 식별) |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Vike 공식 (pre-rendering) | https://vike.dev/pre-rendering | ⭐⭐⭐ High | 2026-06-01 | 공식 문서 |
| Vike 공식 (render modes) | https://vike.dev/render-modes | ⭐⭐⭐ High | 2026-06-01 | 공식 문서 |
| vite-plugin-ssr 마이그레이션 안내 | https://vite-plugin-ssr.com/vike | ⭐⭐⭐ High | 2026-06-01 | 공식 리브랜드 안내 |
| Unhead React 설치 | https://unhead.unjs.io/docs/react/head/guides/get-started/installation | ⭐⭐⭐ High | 2026-06-01 | 공식 문서 |
| Unhead v3 릴리스 노트 | https://unhead.unjs.io/docs/releases/v3 | ⭐⭐⭐ High | 2026-04-05 | 공식 릴리스 |
| React 공식 — CRA Sunset | https://react.dev/blog/2025/02/14/sunsetting-create-react-app | ⭐⭐⭐ High | 2025-02-14 | React 팀 공식 |
| react-helmet-async GitHub | https://github.com/staylor/react-helmet-async | ⭐⭐⭐ High | 2026-06-01 | 공식 저장소 |
| react-helmet-async issue #254 (v3 안내) | https://github.com/staylor/react-helmet-async/issues/254 | ⭐⭐⭐ High | 2026-03 | 공식 저장소 |
| Google Search Central — JS SEO | https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics | ⭐⭐⭐ High | 2026-06-01 | 검색엔진 공식 |
| Vercel — How Google handles JavaScript | https://vercel.com/blog/how-google-handles-javascript-throughout-the-indexing-process | ⭐⭐ Medium-High | 2026-06-01 | Vercel 기술 블로그 |
| Vercel satori GitHub | https://github.com/vercel/satori | ⭐⭐⭐ High | 2026-06-01 | 공식 저장소 |
| vite-plugin-sitemap npm | https://www.npmjs.com/package/vite-plugin-sitemap | ⭐⭐ Medium | 2026-06-01 | npm 패키지 |
| react-snap GitHub | https://github.com/stereobooster/react-snap | ⭐ Low (dormant) | 2026-06-01 | 미유지보수 확인용 |
| vite-prerender-plugin (preactjs) | https://github.com/preactjs/vite-prerender-plugin | ⭐⭐ Medium | 2026-06-01 | 활성 대안 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음 (9개 핵심 클레임 모두 VERIFIED)
- [✅] 버전 정보가 명시되어 있음 (react-helmet-async v3.0.0, @unhead/react v3, Vike v0.4.142 dual-publish 등)
- [✅] deprecated된 패턴을 권장하지 않음 (CRA·react-snap·vite-plugin-prerender는 "주의" 표기 후 대안 제시)
- [✅] 코드 예시가 실행 가능한 형태임 (TypeScript + React 18+ 기준, import·Provider·실제 API 시그니처 일치)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (5개 공식 URL + 검증일 2026-06-01)
- [✅] 핵심 개념 설명 포함 (CSR 한계, two-wave 렌더링, SSG/SSR/SPA 비교)
- [✅] 코드 예시 포함 (index.html, Helmet, useHead, useSeoMeta, JSON-LD, sitemap, Vike config, satori 스크립트)
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 ("전제와 한계" + "언제 이 스킬이 부족한가" 절)
- [✅] 흔한 실수 패턴 포함 ("흔한 실수 패턴" 표 8개 항목)

### 4-3. 실용성

- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준 (단계별 0~5 강화 경로 + 코드 블록)
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함 (Vike config, sitemap config, satori 스크립트 모두 즉시 적용 가능)
- [✅] 범용적으로 사용 가능 (특정 프로젝트명·PR 번호·로컬 경로 없음)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-06-01)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-06-01)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 — 보완 필요 없음, 3/3 PASS
- [✅] 2026-09-28 재검증(2차) 보강분(REFERENCE.md 6-1-1 Vike 네이티브 Head API) content test 재수행 — 2/2 PASS
- [✅] 2026-09-28 선택 보강분(REFERENCE.md 6-1-1 JSON-LD × Vike +Head 예제, XSS 이스케이프) content test 재수행 — 2/2 PASS

---

## 5. 테스트 진행 기록

### [2026-09-28] 재테스트(skill-tester) — REFERENCE.md 6-1-1 JSON-LD × Vike +Head 예제·XSS 이스케이프 반영 확인

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (domain-specific 프론트엔드 에이전트 미설치로 대체)
**수행 방법**: SKILL.md + REFERENCE.md Read 후 실전 질문 2개 답변, 근거 섹션 인용 확인. 질문 모두 REFERENCE.md 6-1-1에 신설된 "JSON-LD를 `+Head.js`로 삽입" 예제(공식 문서 예제 그대로 쓰면 안 되고 `serializeJsonLd` 이스케이프 필요, `+Head` cumulative 동작)를 직접 겨냥.

**Q1. Vike 공식 문서 예제(`dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}`)를 `+Head.js`에 그대로 복붙해도 안전한가?**
- ✅ PASS
- 근거: REFERENCE.md 6-1-1 "JSON-LD를 `+Head.js`로 삽입 (공식 문서 예제, 2026-09-28 추가)" + SKILL.md §4 JSON-LD XSS 주의 문구
- 상세: 안전하지 않다고 정확히 판정 — 공식 예제가 이스케이프 없이 `JSON.stringify`를 그대로 쓰지만, SKILL.md §4의 `</script>` 컨텍스트 탈출 XSS 경고가 여기도 그대로 적용됨을 지적하고, `serializeJsonLd` 헬퍼를 거친 교정 코드를 REFERENCE.md 예제 그대로 제시. 이스케이프 없는 공식 예제를 맹신하는 anti-pattern에 빠지지 않음.

**Q2. 상위 레이아웃 `+Head.js`의 `Organization` JSON-LD와 하위 Product 페이지 `+Head.js`의 `Product` JSON-LD — 하나가 다른 하나를 덮어쓰는가, 둘 다 유지되는가? title/description과 동작이 같은가?**
- ✅ PASS
- 근거: REFERENCE.md 6-1-1 "주의" 문구("`+title`/`+description`/`+image`는 override(비누적)지만 `+Head`는 cumulative(누적)") + 127행 "`+Head`는 누적이므로 라우트마다 다른 JSON-LD `@type`을 상위 레이아웃과 충돌 없이 쌓을 수 있다"
- 상세: title/description(override, 마지막 값으로 덮어씀)과 `+Head.js`(JSON-LD 포함, cumulative)의 동작이 다르다고 정확히 구분. 상위 `Organization`과 하위 `Product` JSON-LD가 둘 다 유지되어 별도 script 태그로 출력된다고 정확히 결론.

### 발견된 gap (경미, 선택 보강)

- `+Head.js`가 정확히 몇 개의 `<script>` 태그로 렌더링되는지(개별 태그 vs 배열 병합) 구체적 출력 형태 예시 없음 — 차단 요인 아님.
- 순수 Vike(비-vike-react)에서 `onBeforeRender`로 조립할 때도 override/cumulative 구분이 유지되는지 명시 안 됨 — 차단 요인 아님.

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 해당 없음 (라이브러리 사용법·패턴 정리형 — content test로 충분)
- 최종 상태: APPROVED (PENDING_TEST → APPROVED 전환)

---

### [2026-09-28] 선택 보강 반영 — REFERENCE.md 6-1-1 JSON-LD × Vike 네이티브 Head API 조합 예제

- 반영 내용: REFERENCE.md "6-1-1. Vike 자체 Head API" 절에 JSON-LD를 `+Head.js`로 삽입하는 예제 추가 — 공식 문서의 `dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}` 예시를 그대로 쓰지 않고, 4절의 `serializeJsonLd`(XSS 이스케이프) 헬퍼를 거치도록 코드 예시 구성. `useData()`로 페이지별 동적 JSON-LD 구성, `+Head` cumulative 특성으로 라우트별 `@type` 병존 가능함을 서술
- 근거: https://vike.dev/head-tags (WebFetch로 공식 문서 확인 — `+Head`가 임의 `<script>` 태그를 지원하며 `dangerouslySetInnerHTML`+`JSON.stringify`로 구조화 데이터를 넣는 예제를 공식 제공. 단, 이 예제 자체는 이스케이프 없이 JSON.stringify를 그대로 쓰므로, SKILL.md 4절 기존 XSS 경고(`JSON.stringify` 결과를 그대로 script에 박음 → XSS 위험, `serializeJsonLd` 헬퍼 사용)에 맞춰 예시를 안전하게 재구성)
- status 영향: 새 코드 예제(공식 API 사용법) 추가이므로 PENDING_TEST 전환 — 메인의 skill-tester 재테스트 필요

### [2026-09-28] 재테스트 (skill-tester) — Vike 네이티브 Head API(REFERENCE.md 6-1-1) 반영 확인

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (domain-specific 프론트엔드 에이전트 미설치로 대체)
**수행 방법**: SKILL.md Read 후 실전 질문 2개 답변. 질문 1개는 2026-09-28 재검증(2차)에서 REFERENCE.md에 신설된 "6-1-1. Vike 자체 Head API" 절을 직접 겨냥 — SKILL.md 본문에는 없고 하단 참조 포인터를 따라가야만 답이 나오는 구조이므로, "참조 링크를 따라가면 답이 나오는지"를 함께 확인.

**Q1. Vike SSG 프로젝트에서 react-helmet-async/@unhead/react 없이 title/description·fetch 데이터 기반 동적 메타를 관리하는 방법**
- ✅ PASS
- 근거: REFERENCE.md "6-1-1. Vike 자체 Head API (vike-react 사용 시, 2026-09-28 추가)" (SKILL.md 하단 `references/REFERENCE.md` 포인터를 따라가 확인)
- 상세: `+config`(title/description/image, override·비누적) / `+Head.js`(임의 태그, 누적) / `+data`의 `useConfig()`(동적 메타) 3가지 모두 정확히 인용, override vs cumulative 차이 경고 문구까지 반영. 참조 링크 추적이 정상 작동함을 확인 — SKILL.md 본문만 봐서는 답이 안 나오는 구조이나 하단 포인터로 정확히 도달.
- gap(경미): JSON-LD를 네이티브 Head API로 삽입하는 방법은 REFERENCE.md 6-1-1에 없음(4절 react-helmet-async/@unhead 전용 예제만 존재) — 차단 요인 아님.

**Q2. 상품 수만 개 이커머스 SPA에서 vite-plugin-sitemap으로 sitemap 자동 생성해도 되는가**
- ✅ PASS
- 근거: SKILL.md "5. sitemap.xml / robots.txt" 절 "자동 생성 — vite-plugin-sitemap" 주의 블록(2026-08-26 추가, 이번 2차 재검증에서 변경 없음 재확인된 서술)
- 상세: "라우트가 동적(상품·카테고리 수만 개)인 커머스는 어차피 빌드 스크립트나 서버에서 DB 기준으로 sitemap을 생성하는 편이 맞다"는 기존 주의 문구를 정확히 인용해 vite-plugin-sitemap 채택을 만류. "전제와 한계" 섹션 근거로 4·5단계(프리렌더/SSR) 병행 필요성까지 확장 답변. 축소·중복 제거 이력은 없는 절이지만 남은 본문과 모순 없음 확인.

**발견된 gap**: JSON-LD × 네이티브 Head API 조합 예제 부재(경미, 선택 보강).

**판정**: agent content test 2/2 PASS. REFERENCE.md 6-1-1 신설 내용이 참조 링크를 통해 정확히 답변에 반영됨. 남은 본문(섹션 5 sitemap 주의, "전제와 한계")과 모순 없음.

---

**수행일**: 2026-06-01
**수행자**: skill-tester → frontend-developer (general-purpose 대체 없이 domain-specific 에이전트 직접 사용)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. 카카오톡/페이스북 OG 미리보기가 비어 있는 원인과 해결책**
- PASS
- 근거: SKILL.md "전제와 한계" 섹션 (two-wave 렌더링, LLM/비-Googlebot 크롤러 한계) + 섹션 1 public/index.html 정적 메타 + "흔한 실수 패턴" 표 (public/index.html에 메타 없이 helmet만 의존)
- 상세: two-wave 방식(1차 HTML + 2차 JS 렌더 분리) 근거가 정확히 명시됨. 해결책(index.html 정적 OG + 프리렌더)도 단계별 SEO 강화 경로 표에서 확인됨. anti-pattern 회피: "helmet만 의존" 실수 패턴이 표에 명시됨.

**Q2. CRA → Vite 마이그레이션 시 기존 react-helmet SEO 이전 방법**
- PASS
- 근거: SKILL.md "전제와 한계" 섹션 (CRA deprecated 2025-02-14 공식 명시) + 섹션 2 react-helmet-async v3 + 섹션 3 @unhead/react + 섹션 5 vite-plugin-sitemap + 섹션 8 CRA 레거시 즉시 가능한 조치
- 상세: CRA deprecated 사실, react-helmet → react-helmet-async v3 이전, Vite index.html 위치 차이(프로젝트 루트 vs public/), vite-plugin-sitemap 추가 등 모든 기대 요소가 SKILL.md에 있음.

**Q3. react-helmet-async로 Product 페이지에 JSON-LD를 XSS 안전하게 삽입하는 방법**
- PASS
- 근거: SKILL.md 섹션 4 "JSON-LD 구조화 데이터" — serializeJsonLd 헬퍼(`replace(/</g, '\\u003c')`) 코드 예시 + react-helmet-async와 함께 사용하는 `<Helmet><script type="application/ld+json">{serializeJsonLd(jsonLd)}</script></Helmet>` 패턴 + "흔한 실수 패턴" 표 (`JSON.stringify` 결과 그대로 박기 XSS 경고)
- 상세: anti-pattern(`dangerouslySetInnerHTML` + JSON.stringify 그대로 박기)을 SKILL.md 286행에서 명시적으로 금지함. 올바른 이스케이프 헬퍼 코드가 즉시 적용 가능한 형태로 제공됨.

### 발견된 gap

없음 — 3개 질문 모두 SKILL.md의 명확한 섹션에서 근거 도출 가능. 실수 패턴 표도 anti-pattern 회피를 충분히 지원.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 해당 없음 (라이브러리 사용법·패턴 정리형 — content test PASS = APPROVED 가능)
- 최종 상태: APPROVED

---

### 테스트 케이스 1: (참고) Vite SPA에서 라우트별 OG 메타 동적 갱신 — 원래 예정 케이스

**입력 (질문/요청):**
```
Vite + React 18 SPA인데 react-helmet-async로 라우트별 OG 메타를 갱신하고 있다.
카카오톡·페이스북 미리보기가 종종 비어 있는데 원인과 해결책은?
```

**기대 결과:**
- 1차 크롤(=Facebook/Kakao 봇 포함 대부분의 OG 크롤러)은 JS를 실행하지 않거나 매우 제한적으로 실행한다는 점 지적
- `public/index.html`에 사이트 전역 OG 메타를 정적으로 박는 것을 1차 해결책으로 제시
- 라우트별로도 OG 미리보기가 필요하면 빌드 타임 프리렌더(Vike prerender 또는 vite-prerender-plugin)를 권장
- react-helmet-async만으로는 부족한 이유를 two-wave 렌더링 관점에서 설명

### 테스트 케이스 2: (참고) CRA → Vite 마이그레이션 시 SEO 어떻게 가져갈지 — 원래 예정 케이스

**입력:**
```
CRA 레거시 앱을 Vite로 옮기는 중인데, 기존에 react-helmet으로 했던 SEO 작업은
무엇을 바꾸고 무엇을 추가하면 되나?
```

**기대 결과:**
- CRA가 공식 deprecated된 사실 명시
- react-helmet → react-helmet-async v3 또는 @unhead/react로 이전 권장 (이유 포함)
- Vite로 옮기면서 추가할 수 있는 옵션: vite-plugin-sitemap, Vike(prerender 모드)
- public/index.html 위치만 프로젝트 루트로 바뀐다는 점, public/sitemap.xml 등은 그대로 동작한다는 점

### 테스트 케이스 3: (참고) JSON-LD를 안전하게 SPA에 삽입하는 방법 — 원래 예정 케이스

**입력:**
```
react-helmet-async로 Product 페이지에 JSON-LD를 넣고 있는데, 사용자 입력이 description에 들어간다.
어떻게 안전하게 처리해야 하나?
```

**기대 결과:**
- `JSON.stringify` 결과를 그대로 박지 말고 `<` → `<` 이스케이프 헬퍼 사용
- `<script type="application/ld+json">{serializeJsonLd(data)}</script>` 패턴
- `dangerouslySetInnerHTML` + 그대로 stringify는 안티패턴

---

### [2026-09-28] 재검증(2차) — 라이브러리 버전 현행성 확인 + Vike 네이티브 Head API 보강

**수행일**: 2026-09-28
**수행 방법**: SKILL.md·REFERENCE.md 전체 Read → 핵심 클레임 5개를 npm registry·GitHub API·공식 문서로 대조, 보강 검토

**클레임 대조 결과**:
1. react-helmet-async 최신 버전이 3.0.0인가 → VERIFIED, 변동 없음 (npm registry `dist-tags.latest: 3.0.0`, 발행일 2026-03-03; GitHub 저장소 `v3.0.0` 태그 존재, repo `pushed_at: 2026-03-03`로 이후 신규 커밋 없음 — https://registry.npmjs.org/react-helmet-async/latest , https://api.github.com/repos/staylor/react-helmet-async)
2. @unhead/react가 여전히 v3 stable 라인이고 API(createHead/UnheadProvider/useHead/useSeoMeta, import 경로 `@unhead/react/client`)가 유지되는가 → VERIFIED (npm registry `dist-tags.latest: 3.4.1`, 발행일 2026-09-15; 공식 문서 상단에 "React v3 (stable)" 배지, 설치 가이드 페이지에 동일 API·import 경로 확인 — https://registry.npmjs.org/@unhead/react/latest , https://unhead.unjs.io/docs/react/head/guides/get-started/installation). 단, 설치 가이드 코드블록이 `pnpm add @unhead/react@next`로 표기돼 있으나 npm dist-tag `next`는 실제로 `3.0.0-beta.9`(latest 3.4.1보다 낮음)로 문서 예제가 stale함을 확인 — SKILL.md의 기존 `npm i @unhead/react`(태그 미지정) 표기가 오히려 올바르므로 수정하지 않음.
3. Vike가 여전히 0.4.x이고 활발히 유지보수되는가, v1.0 출시나 breaking change가 있는가 → VERIFIED, 변동 없음 (npm registry latest `0.4.266`, 발행 2026-09-02; GitHub repo `pushed_at: 2026-09-27`, release 태그가 0.4.262~0.4.266으로 거의 매일 발행 — 활발히 유지보수 중, v1.0 출시 공지 없음 — https://registry.npmjs.org/vike/latest , https://api.github.com/repos/vikejs/vike)
4. vite-plugin-sitemap 유지보수 정체 상태가 여전한가 → VERIFIED, 변동 없음 (npm registry latest 여전히 0.8.2, 발행일 2026-05-15로 불변 — https://registry.npmjs.org/vite-plugin-sitemap/latest)
5. Vike 0.4.x에 SEO/메타 관련 전용 API가 있는가(ADD 대상) → VERIFIED, **누락 발견**. `vike-react`(또는 vike-vue/solid) 사용 시 `+config`(title/description/image)·`+Head.js`(임의 태그, 누적)·`+data` 안 `useConfig()`(동적 메타) 3가지 네이티브 설정으로 react-helmet-async/@unhead/react 없이 메타를 관리할 수 있음이 공식 문서에 명시됨 — https://vike.dev/head-tags

**보강(ADD)·축소**: REFERENCE.md 섹션 "6-1-1. Vike 자체 Head API (vike-react 사용 시)" 신설 — `+config`(title/description/image, override·비누적)·`+Head.js`(누적·override 불가)·`+data`의 `useConfig()`(fetch 데이터 기반 동적 메타) 코드 예시 + react-helmet-async/@unhead/react 대비 선택 기준 추가. 축소한 내용 없음(기존 섹션·번호·주의 블록 전부 보존).

**실전 질문 재검증**:
- Q1. "Vike로 SSG하는 프로젝트인데 react-helmet-async 없이 페이지별 title/description을 관리할 방법이 있나?" → REFERENCE.md "6-1-1. Vike 자체 Head API" 근거로 PASS (신설 섹션이 정확히 이 케이스를 다룸)
- Q2. "react-helmet-async 최신 버전이 여전히 3.0.0이 맞나, React 19에서 문제없이 쓸 수 있나?" → SKILL.md 섹션 2 + 검증일 인용 근거로 PASS (npm/GitHub 대조로 변동 없음 확인됨)

**재검증 최종 판정**: status **PENDING_TEST 전환** (REFERENCE.md에 신규 섹션 보강이 있었으므로 재검증 절차상 PENDING_TEST 전환 — 실사용 필수 카테고리는 아니며 이후 skill-tester content test로 APPROVED 전환 가능)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (9/9 클레임 VERIFIED) |
| 구조 완전성 | ✅ (frontmatter + 소스 + 검증일 + 8개 본문 섹션 + 실수 패턴) |
| 실용성 | ✅ (단계별 강화 경로 + 실행 가능 코드 + 범용 표현) |
| 에이전트 활용 테스트 | ✅ (3/3 PASS, 2026-06-01 / 2026-09-28 재테스트: 2/2 PASS — Vike 네이티브 Head API 반영·참조 링크 추적 확인 / 2026-09-28 재테스트②: 2/2 PASS — JSON-LD × +Head XSS 이스케이프·cumulative 동작 반영 확인) |
| **최종 판정** | **APPROVED** (2026-09-28 skill-tester 재테스트② 2/2 PASS — REFERENCE.md 6-1-1 JSON-LD × Vike +Head 예제·XSS 이스케이프가 답변에 정확히 반영됨 확인, PENDING_TEST → APPROVED 전환) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 3개 테스트 케이스 실행 → 통과 시 APPROVED 전환 (2026-06-01 완료, 3/3 PASS)
- [✅] 2026-09-28 재검증(2차) 보강분(REFERENCE.md 6-1-1 Vike 네이티브 Head API) skill-tester content test 수행 — 2/2 PASS, PENDING_TEST → APPROVED 전환 완료 (2026-09-28)
- [❌] react-helmet-async가 다시 dormant 상태가 되거나 v3.1+ 변경이 있으면 재검증 — 차단 요인 아님, 선택적 신선도 재검증 과제
- [❌] @unhead/react가 react-helmet 호환 export(`@unhead/react/helmet`) 동작을 한 번이라도 실제 프로젝트에서 검증한 사례가 누적되면 권장 우선순위를 재평가 — 차단 요인 아님, 실전 도입 후 추가 보강 권장
- [❌] Vike v1.0 정식 배포 시점에 prerender API 변경 여부 확인 — 차단 요인 아님, v1.0 출시 시 재검증 권장
- [✅] REFERENCE.md 6-1-1에 JSON-LD × Vike 네이티브 Head API 조합 예제 추가 (2026-09-28 반영 — vike.dev 공식 문서 확인 후 `serializeJsonLd` 이스케이프 헬퍼 적용 예제로 추가. 2026-09-28 skill-tester 재테스트② 완료, 2/2 PASS — PENDING_TEST → APPROVED 전환)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-01 | v1 | 최초 작성. Vite/CRA SPA SEO 토픽 7개(public 메타, react-helmet-async, @unhead/react, JSON-LD, sitemap, Vike 프리렌더, OG 이미지) + CRA 레거시 대응 절. 9개 핵심 클레임 VERIFIED. | skill-creator |
| 2026-06-01 | v1 | 2단계 실사용 테스트 수행 (Q1 OG 미리보기 원인·해결 / Q2 CRA→Vite SEO 이전 / Q3 JSON-LD XSS 안전 삽입) → 3/3 PASS, APPROVED 전환 | skill-tester |
| 2026-08-26 | v1.1 | freshness 재검증(86일 경과) — react-helmet-async 3.0.0(2026-03-03, React 19 지원)·@unhead/react 3.x·Vike·CRA deprecated(2025-02-14) VERIFIED. **누락 2건 보강**: ① 동적 렌더링/Rendertron이 Google 기준 비권장 우회책이며 2022년 archive라는 주의 블록(전제와 한계 절) — `kakao-share-optimization`과 서술 일치 ② `vite-plugin-sitemap` 0.8.2가 2025-05-15 이후 무갱신(npm registry 직접 확인)이라 대형 커머스는 DB 기준 서버 생성 권고 | freshness-auditor + orchestrator |
| 2026-09-28 | v1.2 | 2차 재검증(33일 경과) — react-helmet-async 3.0.0(변동 없음)·@unhead/react 3.4.1(v3 유지, API 불변)·Vike 0.4.266(활발히 유지보수, v1.0 미출시)·vite-plugin-sitemap 0.8.2(정체 지속) 5개 클레임 npm registry·GitHub API로 재대조 VERIFIED. **보강**: Vike 네이티브 Head API(`+config`/`+Head.js`/`useConfig()`) 섹션(REFERENCE.md 6-1-1) 신설 — react-helmet-async/@unhead/react 없이 vike-react로 메타 관리하는 공식 경로 누락 발견. status APPROVED → PENDING_TEST 전환(보강분 content test 필요) | orchestrator (재검증 배치) |
| 2026-09-28 | v1.3 | 2단계 재테스트 수행 (Q1 Vike 네이티브 Head API — 참조 링크 추적 확인 / Q2 대규모 커머스 sitemap 회피) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-28 | v1.4 | 선택 보강 반영 — vike.dev 공식 문서(head-tags) 확인 후 REFERENCE.md 6-1-1에 JSON-LD × `+Head.js` 조합 예제 추가(`serializeJsonLd` 이스케이프 적용). status APPROVED → PENDING_TEST (메인 skill-tester 재테스트 필요) | orchestrator (선택 보강 반영 배치) |
| 2026-09-28 | v1.5 | 2단계 재테스트 수행② (Q1 공식 예제 그대로 쓰면 안전한가·XSS 이스케이프 필요 확인 / Q2 +Head cumulative vs title/description override 구분) → 2/2 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
