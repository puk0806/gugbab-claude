---
skill: seo-nextjs
category: frontend
version: v4
date: 2026-09-28
status: APPROVED
---

# seo-nextjs 스킬 검증 문서

---

## 검증 워크플로우

```
[1단계] 스킬 작성 시 (오프라인 검증)
  ├─ 공식 문서 기반으로 내용 작성
  ├─ 내용 정확성 체크리스트 ✅
  ├─ 구조 완전성 체크리스트 ✅
  └─ 실용성 체크리스트 ✅
        ↓
  최종 판정: PENDING_TEST

[2단계] 실제 사용 중 (온라인 검증)
  ├─ frontend-architect 에이전트 테스트 수행
  └─ 테스트 PASS → APPROVED
```

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | seo-nextjs |
| 스킬 경로 | `.claude/skills/seo-nextjs/SKILL.md` |
| 최초 작성일 | 2026-04-01 |
| 검증일 | 2026-09-28 (최초 2026-04-01, 이전 재검증 2026-08-11) |
| 재검증일 | **2026-09-28** (재검증, 이전 2026-08-11 Next.js 16 기준 최신화) |
| 검증 방법 | 공식 문서 교차 검증 (nextjs.org docs 각 API 레퍼런스 + 업그레이드 가이드 + 릴리즈 블로그) |
| 버전 기준 | **Next.js 16.3.x** (16.3.0에서 API 확정, 2026-09-28 기준 최신 패치 16.3.6 — API 표면 무변경 확인) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인
- [✅] 최신 버전 기준 내용 확인
- [✅] 핵심 패턴 / 베스트 프랙티스 정리
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리
- [✅] SKILL.md 파일 작성
- [✅] Claude Code 에이전트에서 실제 활용 테스트

---

## 2. 실행 에이전트 로그

| 단계 | 에이전트 | 입력 요약 | 출력 요약 |
|------|----------|-----------|-----------|
| 활용 테스트 | frontend-architect | generateMetadata params Promise, ResolvingMetadata, JSON-LD script 삽입, XSS 방지, generateSitemaps 50000, MetadataRoute 타입 6개 | 6/6 PASS |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 |
|--------|-----|--------|
| Next.js generateMetadata | https://nextjs.org/docs/app/api-reference/functions/generate-metadata | ⭐⭐⭐ High |
| Next.js JSON-LD 가이드 | https://nextjs.org/docs/app/guides/json-ld | ⭐⭐⭐ High |
| Next.js generateSitemaps | https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps | ⭐⭐⭐ High |
| Next.js sitemap.xml 파일 컨벤션 | https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap | ⭐⭐⭐ High |
| Next.js robots.txt 파일 컨벤션 | https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots | ⭐⭐⭐ High |
| v15 → v16 업그레이드 가이드 | https://nextjs.org/docs/app/guides/upgrading/version-16 | ⭐⭐⭐ High |
| 캐싱(Cache Components) 문서 | https://nextjs.org/docs/app/getting-started/caching | ⭐⭐⭐ High |
| Next.js 16.3 블로그 (버전 확인) | https://nextjs.org/blog/next-16-3 | ⭐⭐⭐ High |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음
- [✅] deprecated된 패턴을 권장하지 않음
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함
- [✅] 흔한 실수 패턴 포함

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 공식 문서 1순위 소스 확인
- [✅] deprecated 패턴 제외 (Next.js 15 params Promise 반영)
- [✅] 버전 명시 (Next.js 15)
- [✅] Claude Code에서 실제 활용 테스트 (frontend-architect, 6/6 PASS)

---

## 5. 테스트 진행 기록

### 테스트 케이스 1: frontend-architect 에이전트 활용 테스트

**테스트 방법:** frontend-architect 에이전트에게 seo 관련 설계 질문 및 코드 리뷰 요청

**발견 및 수정 사항:**
발견된 오류 없음 — 스킬 내용 수정 불필요

**판정:** ✅ PASS

---

### 테스트 케이스 2: 2026-08-11 버전 재검증 (Next.js 15 → 16.3)

**수행일**: 2026-08-11
**수행 방법**: SEO 관련 공식 API 레퍼런스(generate-metadata / sitemap / robots / json-ld / caching)와 v15→v16 업그레이드 가이드를 대조. 각 문서 frontmatter의 `version` 필드로 16.3.0 기준임을 확인

**배경**: 스킬이 "Next.js 15" 기준(검증 2026-04-01)으로 2메이저 뒤처져 있었고, 같은 레포의 `frontend/url-canonicalization-redirects`가 이미 16.x 기준이라 레포 내부 정합성도 깨져 있었다.

**교차 검증 결과 — 클레임 판정표**

| # | 클레임 | 판정 | 근거 |
|---|--------|:----:|------|
| 1 | 최신 stable은 16.3.0 (2026-08-03) — 스킬 기준을 15 → 16으로 올려야 함 | **VERIFIED** | 16.3 블로그 `publishedAt` + 각 docs 페이지 frontmatter `version: 16.3.0` |
| 2 | `generateSitemaps` 사용 시 `sitemap({ id }: { id: number })` 동기 접근 (기존 SKILL 서술) | **DISPUTED → 수정** | sitemap 문서 Version History: **`v16.0.0` — "id is now a promise that resolves to a `string`"**. 공식 예제도 `const id = await props.id`. 기존 예제는 v16에서 `NaN` 산출. SKILL 수정 완료 |
| 3 | `generateMetadata`의 `params`/`searchParams`는 Promise, `await` 필수 | **VERIFIED** | generate-metadata 레퍼런스 (v15 도입분이 v16에서도 유지). 단 v16은 동기 호환 계층까지 제거 — 업그레이드 가이드 확인 |
| 4 | JSON-LD는 네이티브 `<script type="application/ld+json">` + `<` → `<` 이스케이프 | **VERIFIED** | json-ld 가이드 (v16.3.0 문서에서도 동일 권장). "`next/script`는 실행 코드용, JSON-LD는 네이티브 script가 옳다"는 Good to know 문구 추가 확인 |
| 5 | `MetadataRoute.Sitemap` 타입에 `alternates.languages` 지원, 이미지/비디오 사이트맵 지원 | **VERIFIED** | sitemap 문서 Returns + Image/Video Sitemaps 절 (v14.2.0 localization 추가 이력) |
| 6 | Google 사이트맵 한도 50,000 URL | **VERIFIED** | sitemap 문서 공식 주석 "Google's limit is 50,000 URLs per sitemap" |
| 7 | `robots.ts`의 `rules`가 **객체 또는 배열** 모두 허용, `crawlDelay`·`host` 필드 존재 | **VERIFIED** | robots 문서 Robots object 타입 정의 (기존 SKILL은 배열 예제만 제시 → 타입 전체 반영) |
| 8 | `robots.ts`에 **`other` 필드 신설** (비표준 per-agent 디렉티브) | **VERIFIED (신규 반영)** | robots 문서 Version History: **`v16.3.0` — "Added `other` field for non-standard per-agent directives"** |
| 9 | `opengraph-image`/`twitter-image`/`icon`/`apple-icon`의 `params`·`id`가 v16에서 Promise로 변경 | **VERIFIED (신규 반영)** | 업그레이드 가이드 "Async parameters for icon, and open-graph Image (Breaking change)" — `generateImageMetadata`의 `params`는 동기 유지 |
| 10 | Streaming metadata 동작 + `htmlLimitedBots` 설정 (JS 미실행 봇은 블로킹 렌더) | **VERIFIED (신규 반영)** | generate-metadata "Streaming metadata" 절. v15.2.0 도입 이력 |
| 11 | `cacheComponents: true` 환경에서 `generateMetadata`가 런타임 데이터 접근 시 에러/`use cache` 필요 | **VERIFIED (신규 반영)** | generate-metadata "With Cache Components" 절 + caching 문서 |
| 12 | 봇·크롤러는 static shell을 재사용하지 않고 요청 시 전체 동적 렌더 | **VERIFIED (신규 반영)** | caching 문서 "Bots and crawlers" 절 — shell이 빌드타임 전용 데이터에 의존하면 크롤러에서 실패 가능 |
| 13 | `metadataBase` 미설정 + 상대 경로 = 빌드 에러, URL 합성이 traversal 아님 | **VERIFIED (신규 반영)** | generate-metadata `metadataBase` / URL Composition 절 |
| 14 | 메타데이터 병합은 **얕은 병합** — 하위가 `openGraph` 정의 시 상위 OG 필드 전체 교체 | **VERIFIED (신규 반영)** | generate-metadata "Merging" 절. 기존 SKILL의 1줄 주의 문구를 근거·예제와 함께 정식 섹션으로 승격 |
| 15 | `metadata` / `generateMetadata`는 Server Component 전용, 동일 세그먼트 동시 export 불가 | **VERIFIED (신규 반영)** | generate-metadata Good to know + "Why generateMetadata is Server Component only" 절 |
| 16 | `themeColor`·`colorScheme`·`viewport`는 metadata에서 deprecated (v13.2.0~14) | **VERIFIED (신규 반영)** | generate-metadata 각 필드의 Deprecated 표기 |
| 17 | AMP 관련 SEO 서술이 유효한가 | **VERIFIED (제거 근거)** | 업그레이드 가이드 Removals — AMP 완전 제거. SKILL에 AMP 서술이 없어 수정 불필요하나, §0 변경표에 명시 |

**클레임 판정 집계: 17건 중 VERIFIED 16 / DISPUTED 1 (SKILL.md 수정 반영 완료) / UNVERIFIED 0**

> DISPUTED 1건(#2 `generateSitemaps`의 `id`)은 **런타임에 조용히 깨지는 유형**이다.
> `id`가 `Promise`이므로 `id * 50000`이 `NaN`이 되어 분할 사이트맵이 전부 빈 결과를 낸다.

**판정:** ✅ PASS (DISPUTED 1건 수정 후)

---

### [2026-09-28] 재검증(2차) — Next.js 16.3.x 패치 버전 대조, API 표면 변경 없음 확인

**수행일**: 2026-09-28
**수행 방법**: SKILL.md + REFERENCE.md 전체 Read → 핵심 클레임 4개를 1차 소스(nextjs.org/docs)와 WebFetch로 대조. 특히 이전 재검증(2026-08-11, v16.3.0 기준)에서 신규 반영했던 `generateSitemaps` id Promise·`robots.ts` `other` 필드가 이후 패치(16.3.1~16.3.6)에서도 유지되는지 집중 확인

**클레임 대조 결과**:
1. `generateSitemaps`로 분할된 `sitemap()`의 `id` 파라미터가 `Promise<string>`이고 `await` 후 `Number()` 변환 필요 → **VERIFIED** — sitemap.xml·generateSitemaps 공식 문서 Version History에 `v16.0.0` 항목 그대로 유지, 예제 코드도 `const id = await props.id` 동일 (nextjs.org/docs/app/api-reference/functions/generate-sitemaps, /file-conventions/metadata/sitemap)
2. `robots.ts` rule에 `other` 필드로 비표준 per-agent 디렉티브(Seznam `Request-Rate` 등) 추가 가능, 대소문자 보존·배열은 줄바꿈 출력 → **VERIFIED** — robots.txt 공식 문서 Version History `v16.3.0` 항목·타입 정의·예제 출력 모두 SKILL.md/REFERENCE.md 서술과 문자 그대로 일치
3. 현재 최신 Next.js 버전 → **VERIFIED (정정)** — 16.3.6(2026-09-22, 보안 패치)이 최신, SKILL.md의 "16.3.0이 현재 최신 stable" 표기는 정정 필요(패치만 있고 API 변경 없음은 확인됨)
4. `generateMetadata`의 얕은 병합(shallow merge)·`metadataBase` 미설정 시 빌드 에러·Server Component 전용·`themeColor`/`colorScheme`/`viewport` deprecated(v14)·Streaming metadata·Cache Components 하 `generateMetadata` 동작 → **VERIFIED** — generate-metadata 공식 문서(최종 갱신 2026-08-25) Merging/metadataBase/Why Server Component only/Version History/Streaming metadata/With Cache Components 섹션 전부 SKILL.md 서술과 일치, 신규 breaking change 없음

**ADD 검토 (사전 지정 2항목)**:
- `generateSitemaps` Promise 관련 시그니처 변화 → 이미 SKILL.md §0 표 + REFERENCE.md §6에 v16.0.0 breaking change로 반영되어 있음(2026-08-11 재검증 때 추가). 이번 재검증에서 최신 문서로 재확인만 하고 추가 변경 없음
- `robots` `other` 필드 → 이미 SKILL.md §7 "비표준 디렉티브 — `other` (v16.3.0 신규)" 섹션 + REFERENCE.md에 반영되어 있음. 이번 재검증에서 재확인만 하고 추가 변경 없음

**보강(ADD)·축소**: 버전 표기만 정정(16.3.0 고정 표기 → 16.3.x/패치 상황 명시, API 표면 무변경 명시). 코드 예시·패턴·주의사항 내용 변경 없음. 축소 없음(모든 섹션이 버전 고정 정보·함정 목록이라 유지)

**실전 질문 재검증**:
- Q1. "50,000개 넘는 상품을 sitemap으로 나눠야 하는데 Next.js 16에서 generateSitemaps 쓸 때 주의할 점은?" → SKILL.md REFERENCE.md §6 "분할 — generateSitemaps (v16에서 시그니처 변경)" 근거로 `id`가 `Promise<string>`이므로 `await` 후 `Number()` 변환해야 한다고 정확히 답변 — PASS
- Q2. "robots.ts에서 표준에 없는 Yandex Clean-param 지시문을 내보내려면?" → SKILL.md §7 "비표준 디렉티브 — other" 근거로 rule의 `other` 필드에 넣으면 되고, 값은 검증 없이 그대로 출력되니 대상 검색엔진 문서를 직접 확인해야 한다고 정확히 답변 — PASS

**재검증 최종 판정**: status **APPROVED 유지** (내용 정확성 변화 없음 — 버전 표기 정정은 코드 가이드 자체에 영향 없는 프레시니스 정정으로 판단, 실전 질문 2/2 PASS)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (DISPUTED 1건 수정 반영) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (frontend-architect) |
| 버전 최신성 (2026-08-11 기준) | ✅ Next.js 16.3.0 반영 |
| 버전 최신성 (2026-09-28 재검증) | ✅ 16.3.6까지 API 표면 무변경 확인, 버전 표기만 정정 |
| 레포 내부 정합성 | ✅ `url-canonicalization-redirects`(16.x 기준)와 버전 기준 일치 |
| **최종 판정** | **APPROVED** (2026-09-28 2차 재검증 후 유지) |

---

## 7. 개선 필요 사항

- Streaming metadata의 HTML-limited 봇 처리와 Cache Components 환경의 크롤러 동작은 **실제 색인 결과로만 최종 확인 가능**하다. 실서비스 색인 사례가 생기면 기록을 추가한다.
- 다음 재검증 시 `robots.ts`의 `other` 필드가 v16.3 신규인 만큼 후속 변경(검증 로직 추가 여부)을 우선 확인한다.

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-04-01 | v1 | 최초 작성 및 frontend-architect 활용 테스트 완료 | frontend-architect 에이전트 |
| 2026-04-17 | v2 | verification.md 신규 8섹션 포맷으로 마이그레이션 | 메인 대화 오케스트레이션 |
| 2026-06-01 | v2 | SEO 스킬 분할 작업에 따라 seo → seo-nextjs 리네이밍. 동일 SKILL 내용 유지(범위가 Next.js 한정으로 명확). seo-vite-spa·seo-static-html이 별도 스킬로 분리됨 | 메인 대화 |
| 2026-08-11 | v3 | **Next.js 15 → 16.3.0 기준 최신화(2메이저 갭 해소).** ① DISPUTED 1건 수정: `generateSitemaps`의 `id`가 v16.0.0부터 `Promise<string>` — 기존 `{ id: number }` 예제는 `NaN` 산출 ② §0 "15→16 SEO 영향 변경" 표 신설 ③ 신규 섹션: `metadataBase`/URL 합성, canonical·hreflang·alternates, 메타데이터 얕은 병합 규칙, 파일 기반 OG 이미지의 async params/id, Streaming metadata + `htmlLimitedBots`, Cache Components 하 `generateMetadata` 동작, 봇·크롤러 static shell 주의 ④ `robots.ts` `other` 필드(v16.3.0 신규)·Robots 타입 전체·per-agent 규칙 배열 반영 ⑤ 이미지/비디오/다국어 사이트맵 추가 ⑥ `PageProps` 타입 헬퍼 추가 ⑦ "흔한 실수 패턴" 섹션 신설 ⑧ `nextjs`·`url-canonicalization-redirects`와 역할 분리 상호 참조 명시 | 버전 재검증 (교차 검증 17 클레임) |
| 2026-09-25 | 구조 개편: 상세 내용 references/REFERENCE.md 분리 (내용 변경 없음) | |
| 2026-09-28 | v4 | **재검증(2차).** 핵심 클레임 4건 재대조(generateSitemaps id Promise·robots other 필드·generateMetadata 병합/metadataBase/deprecated 필드 모두 VERIFIED), 최신 패치 16.3.6까지 API 표면 무변경 확인. 버전 표기만 "16.3.0 현재 최신" → "16.3.x, 16.3.6까지 패치만" 으로 정정. 실전 질문 2/2 PASS. status APPROVED 유지 | 재검증 (2차, 교차 검증 4 클레임) |
