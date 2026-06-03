---
skill: seo-vite-spa
category: frontend
version: v1
date: 2026-06-01
status: APPROVED
---

# seo-vite-spa 검증 문서

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `seo-vite-spa` |
| 스킬 경로 | `.claude/skills/frontend/seo-vite-spa/SKILL.md` |
| 검증일 | 2026-06-01 |
| 검증자 | skill-creator (Claude Code 에이전트) |
| 스킬 버전 | v1 |

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

---

## 5. 테스트 진행 기록

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

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (9/9 클레임 VERIFIED) |
| 구조 완전성 | ✅ (frontmatter + 소스 + 검증일 + 8개 본문 섹션 + 실수 패턴) |
| 실용성 | ✅ (단계별 강화 경로 + 실행 가능 코드 + 범용 표현) |
| 에이전트 활용 테스트 | ✅ (3/3 PASS, 2026-06-01) |
| **최종 판정** | **APPROVED** |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 3개 테스트 케이스 실행 → 통과 시 APPROVED 전환 (2026-06-01 완료, 3/3 PASS)
- [❌] react-helmet-async가 다시 dormant 상태가 되거나 v3.1+ 변경이 있으면 재검증 — 차단 요인 아님, 선택적 신선도 재검증 과제
- [❌] @unhead/react가 react-helmet 호환 export(`@unhead/react/helmet`) 동작을 한 번이라도 실제 프로젝트에서 검증한 사례가 누적되면 권장 우선순위를 재평가 — 차단 요인 아님, 실전 도입 후 추가 보강 권장
- [❌] Vike v1.0 정식 배포 시점에 prerender API 변경 여부 확인 — 차단 요인 아님, v1.0 출시 시 재검증 권장

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-06-01 | v1 | 최초 작성. Vite/CRA SPA SEO 토픽 7개(public 메타, react-helmet-async, @unhead/react, JSON-LD, sitemap, Vike 프리렌더, OG 이미지) + CRA 레거시 대응 절. 9개 핵심 클레임 VERIFIED. | skill-creator |
| 2026-06-01 | v1 | 2단계 실사용 테스트 수행 (Q1 OG 미리보기 원인·해결 / Q2 CRA→Vite SEO 이전 / Q3 JSON-LD XSS 안전 삽입) → 3/3 PASS, APPROVED 전환 | skill-tester |
