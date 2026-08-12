---
skill: seo-nextjs
category: frontend
version: v3
date: 2026-08-11
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
| 스킬 경로 | `.claude/skills/frontend/seo-nextjs/SKILL.md` |
| 최초 작성일 | 2026-04-01 |
| 재검증일 | **2026-08-11** (Next.js 16 기준 최신화) |
| 검증 방법 | 공식 문서 교차 검증 (nextjs.org docs 각 API 레퍼런스 + 업그레이드 가이드 + 릴리즈 블로그) |
| 버전 기준 | **Next.js 16.3.0** (2026-08-03 릴리즈, 현재 최신 stable) |

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

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (DISPUTED 1건 수정 반영) |
| 구조 완전성 | ✅ |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ PASS (frontend-architect) |
| 버전 최신성 (2026-08-11 기준) | ✅ Next.js 16.3.0 반영 |
| 레포 내부 정합성 | ✅ `url-canonicalization-redirects`(16.x 기준)와 버전 기준 일치 |
| **최종 판정** | **APPROVED** |

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
