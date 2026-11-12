---
skill: prisma-orm
category: backend
version: v1
date: 2026-11-09
status: APPROVED
---

# prisma-orm 스킬 검증 문서

> Prisma ORM 7.x(TypeScript) 사용 패턴 스킬의 조사·교차 검증 기록

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `prisma-orm` |
| 스킬 경로 | `.claude/skills/prisma-orm/SKILL.md` (+ `references/v6-to-v7-upgrade.md`, `references/serverless-edge.md`) |
| 검증일 | 2026-11-09 (재검증, 이전 2026-09-26) |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 기준 버전 | Prisma ORM **7.10.1** (`@prisma/client`·`@prisma/adapter-pg`·`@prisma/adapter-neon` npm `latest` = 7.10.1, 2026-10-15 게시). `prisma` CLI npm `latest` = 8.0.0-rc.33 (`prev` = 7.10.1) — 2026-11-09 기준, v8 아직 RC |
| 대상 에이전트 | `typescript-backend-developer`, `typescript-backend-architect` |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (prisma.io/docs v7 경로, 업그레이드 가이드, CLI 레퍼런스, config 레퍼런스)
- [✅] 공식 GitHub 2순위 소스 확인 (github.com/prisma/orm releases, npm registry dist-tags, adapter-neon README)
- [✅] 최신 버전 기준 내용 확인 (날짜: 2026-09-25 — 7.10.0 안정 / 8.0.0-rc.17 RC)
- [✅] 핵심 패턴 / 베스트 프랙티스 정리 (모델링·관계, 마이그레이션, 트랜잭션, N+1, 서버리스·엣지, 테스트)
- [✅] 코드 예시 작성
- [✅] 흔한 실수 패턴 정리 (안티패턴 18개)
- [✅] SKILL.md 파일 작성 (490줄, 500줄 초과분은 references/ 2개로 분리)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 스타일 파악 | Read | typescript-backend-developer/architect 에이전트, backend/drizzle-neon-postgres SKILL.md | 표 중심 요약·안티패턴 표·체크 구조 차용, Drizzle 비교는 링크만 |
| 버전 조사 | WebSearch / WebFetch | Prisma changelog, release-status, GitHub releases, npm registry dist-tags(prisma, @prisma/client, adapter-pg, adapter-neon) | 7.10.0 안정 / v8 RC(GA 목표 2026-10) / **CLI latest 태그가 v8 RC** 발견 |
| 브레이킹 체인지 조사 | WebFetch | upgrading-to-prisma-7, guides/upgrade-prisma-orm/v7, generators, prisma-config-reference, cli/v7/migrate/dev | prisma-client 제너레이터·output 필수, 어댑터 필수, config 이동, directUrl 제거, $use 제거, generate/seed 자동 실행 제거 |
| 기능 조사 | WebFetch | transactions, relation-queries, query-optimization, referential-actions, connection-pool, raw-queries, error handling, unit/integration testing, Vitest 블로그 | 트랜잭션 기본값, relationJoins Preview, FK 인덱스, raw SQL 안전 경계, 테스트 패턴 |
| 서버리스 조사 | WebFetch | Prisma deploy-to-vercel(serverless/edge), cloudflare-workers 가이드, Next.js v7 가이드, Neon Prisma 가이드, Neon serverless driver, Neon vercel-connection-methods | 풀드/다이렉트 분리, attachDatabasePool, 엣지 요청 단위 생성 |
| 교차 검증 | WebSearch | 22개 클레임, 독립 소스 2개 이상 | VERIFIED 18 / DISPUTED 3 / UNVERIFIED 1 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| Prisma 7 업그레이드 가이드 | https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7 | ⭐⭐⭐ High | 2026-09-25 조회 | 공식 |
| Prisma 7 업그레이드(구 경로) | https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7 | ⭐⭐⭐ High | 2026-09-25 | 공식 |
| Generators (v7) | https://www.prisma.io/docs/orm/v7/prisma-schema/overview/generators | ⭐⭐⭐ High | 2026-09-25 | 공식 |
| Prisma Config 레퍼런스 (v7) | https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference | ⭐⭐⭐ High | 2026-09-25 | 공식 |
| CLI migrate dev (v7) | https://www.prisma.io/docs/cli/v7/migrate/dev | ⭐⭐⭐ High | 2026-09-25 | 공식 |
| Development and production (v7) | https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production | ⭐⭐⭐ High | 2026-09-25 | 공식 (generate 서술은 구버전 잔존) |
| Transactions (v7) | https://www.prisma.io/docs/orm/v7/prisma-client/queries/transactions | ⭐⭐⭐ High | 2026-09-25 | 공식 |
| Relation queries (v7) | https://www.prisma.io/docs/orm/v7/prisma-client/queries/relation-queries | ⭐⭐⭐ High | 2026-09-25 | 공식 |
| Query optimization (v7) | https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance | ⭐⭐⭐ High | 2026-09-25 | 공식 |
| Referential actions (v7) | https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/relations/referential-actions | ⭐⭐⭐ High | 2026-09-25 | 공식 |
| Connection pool (v7) | https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections/connection-pool | ⭐⭐⭐ High | 2026-09-25 | 공식 |
| Deploy to Vercel (v7) | https://www.prisma.io/docs/orm/v7/prisma-client/deployment/serverless/deploy-to-vercel | ⭐⭐⭐ High | 2026-09-25 | 공식 |
| Deploy to Vercel Edge (v7) | https://www.prisma.io/docs/orm/v7/prisma-client/deployment/edge/deploy-to-vercel | ⭐⭐⭐ High | 2026-09-25 | 공식 |
| Cloudflare Workers 가이드 (v7) | https://www.prisma.io/docs/guides/v7/deployment/cloudflare-workers | ⭐⭐⭐ High | 2026-09-25 | 공식 |
| Next.js 가이드 (v7) | https://www.prisma.io/docs/guides/v7/frameworks/nextjs | ⭐⭐⭐ High | 2026-09-25 | 공식 |
| Raw queries (v7) | https://www.prisma.io/docs/orm/v7/prisma-client/using-raw-sql/raw-queries | ⭐⭐⭐ High | 2026-09-25 | 공식 |
| Handling exceptions (v7) | https://www.prisma.io/docs/orm/v7/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors | ⭐⭐⭐ High | 2026-09-25 | 공식 |
| Unit / Integration testing (v7) | https://www.prisma.io/docs/orm/v7/prisma-client/testing/unit-testing , .../integration-testing | ⭐⭐⭐ High | 2026-09-25 | 공식 |
| Prisma 블로그 — Vitest 목킹 (Prisma 7) | https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o | ⭐⭐⭐ High | 2026-07-09 갱신 | 공식 블로그 |
| Release status | https://www.prisma.io/docs/orm/release-status | ⭐⭐⭐ High | 2026-09-25 | 공식 — v8 RC, GA 2026-10 목표, v7 18개월 지원 |
| Changelog 7.5.0 | https://www.prisma.io/changelog/2026-03-11 | ⭐⭐⭐ High | 2026-03-11 | 세이브포인트 |
| Prisma 7 발표 블로그 | https://www.prisma.io/blog/announcing-prisma-orm-7-0-0 | ⭐⭐⭐ High | 2025-11-19 | 공식 |
| GitHub prisma/orm releases | https://github.com/prisma/orm/releases | ⭐⭐⭐ High | 2026-09-24 | 7.10.0 Latest, v8 rc.12 pre-release |
| npm registry dist-tags | https://registry.npmjs.org/-/package/prisma/dist-tags (및 @prisma/client, adapter-pg, adapter-neon) | ⭐⭐⭐ High | 2026-09-25 | 1차 데이터 |
| adapter-neon README (7.10.0) | https://unpkg.com/@prisma/adapter-neon@7.10.0/README.md | ⭐⭐⭐ High | 2026-09-25 | 패키지 원본 |
| Neon — Prisma 가이드 | https://neon.com/docs/guides/prisma | ⭐⭐⭐ High | 2026-09-25 | 벤더 공식 |
| Neon — serverless driver | https://neon.com/docs/serverless/serverless-driver | ⭐⭐⭐ High | 2026-09-25 | 벤더 공식 |
| Neon — Vercel 연결 방식 | https://neon.com/docs/guides/vercel-connection-methods | ⭐⭐⭐ High | 2026-09-25 | 벤더 공식 |
| Vercel KB — Connection pooling | https://vercel.com/kb/guide/connection-pooling-with-functions | ⭐⭐⭐ High | 2026-09-25 | 벤더 공식 |
| prisma/prisma 이슈·토론 (FK 인덱스 #16543, P2002 meta.target #28953, Neon HTTP 트랜잭션) | https://github.com/prisma/prisma/issues/16543 , https://github.com/prisma/prisma/issues/28953 | ⭐⭐ Medium | 2026 | 보조 근거 |
| 2차 자료 (Medium·기술 블로그·mcpservers 등) | 검색 결과 요약 | ⭐ Low | 2026 | 교차 확인용으로만 사용 |
| npm registry dist-tags·time (재검증) | https://registry.npmjs.org/-/package/prisma/dist-tags , https://registry.npmjs.org/prisma | ⭐⭐⭐ High | 2026-11-09 | CLI latest 8.0.0-rc.33(2026-11-06), prev 7.10.1, client/adapter latest 7.10.1(2026-10-15) |
| GitHub 7.10.1 릴리스 노트 | https://github.com/prisma/prisma/releases/tag/7.10.1 | ⭐⭐⭐ High | 2026-11-09 | 패치 — 중첩 `$transaction` 옵션 변형 버그·P3025 섀도 DB 가드, 브레이킹 없음 |
| Release status (재검증) | https://www.prisma.io/docs/orm/release-status | ⭐⭐⭐ High | 2026-11-09 | 여전히 "v8 = RC, GA 2026-10 예상", v7 18개월 지원 문구 유지 |
| Transactions (v7, 재검증) · CLI migrate dev (v7, 재검증) | https://www.prisma.io/docs/orm/v7/prisma-client/queries/transactions , https://www.prisma.io/docs/cli/v7/migrate/dev | ⭐⭐⭐ High | 2026-11-09 | maxWait 2000 / timeout 5000, migrate dev가 generate·seed 자동 실행 안 함 재확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-0. 핵심 클레임 교차 검증

| # | 클레임 | 소스 A | 소스 B | 판정 |
|---|--------|--------|--------|------|
| 1 | 최신 안정 = 7.10.0 | npm dist-tags(@prisma/client latest) | GitHub releases "Latest" | VERIFIED |
| 2 | `prisma` CLI npm `latest` 태그 = 8.0.0-rc.17, `prev` = 7.10.0 → 무고정 설치 시 v8 RC | npm dist-tags(prisma) | 검색 결과(릴리즈 인덱스·v8 RC 설치 사례) + release-status("v8 설치 = npm install prisma", "v7은 ^7 고정") | VERIFIED |
| 3 | v8 GA 목표 2026-10, v7은 v8 GA 후 18개월 지원 | release-status | 검색 요약(Releasebot) | VERIFIED (블로그 3월 글의 "12개월"은 이후 문서로 갱신된 것으로 판단, 최신 release-status 채택) |
| 4 | `prisma-client-js` deprecated, `prisma-client` + `output` 필수 | 업그레이드 가이드 | generators 레퍼런스 | VERIFIED |
| 5 | import는 `<output>/client` | 업그레이드 가이드·Next.js 가이드·에러 처리 문서 | Vitest 블로그 | VERIFIED |
| 6 | 드라이버 어댑터 필수 | 업그레이드 가이드 | Neon 가이드, 2차 자료 | VERIFIED |
| 7 | `prisma.config.ts` datasource.url, `directUrl` v7 제거 | config 레퍼런스 | 업그레이드 가이드 | VERIFIED |
| 8 | `env()`는 미정의 변수에 throw, Bun은 .env 자동 로드 | config 레퍼런스 | 업그레이드 가이드 | VERIFIED |
| 9 | `$use` 미들웨어·Metrics 제거 | 업그레이드 가이드 | 2차 자료(마이그레이션 가이드 블로그) | VERIFIED |
| 10 | migrate dev/db push가 generate·seed 자동 실행 안 함 | CLI v7 migrate dev | 업그레이드 가이드 | **DISPUTED → 정정** (v7 workflows 문서의 "generate 트리거" 구 서술과 충돌. CLI 레퍼런스+업그레이드 가이드 채택, SKILL.md에 `> 주의:` 표기) |
| 11 | Node 20.19+ / TS 5.4+ | 업그레이드 가이드 | 2차 자료 | VERIFIED |
| 12 | "v7은 ESM 전용" | 2차 자료 주장 | generators 레퍼런스 `moduleFormat: esm|cjs` | **DISPUTED → 정정** (ESM 권장, CJS 옵션 존재로 기술) |
| 13 | pg 어댑터 풀 기본값 max 10 / idle 10s / connect timeout 0 | connection-pool 문서 | PostgreSQL 커넥터 문서(v6 대비 기본값) | VERIFIED |
| 14 | 인터랙티브 트랜잭션 기본 maxWait 2000 / timeout 5000, 초과 시 P2028 | transactions 문서 | GitHub 이슈·2차 자료 | VERIFIED |
| 15 | 7.5.0 세이브포인트 기반 중첩 트랜잭션 | changelog 2026-03-11 | GitHub release 7.5.0 / 공식 X | VERIFIED |
| 16 | relationLoadStrategy는 v7에서도 Preview(`relationJoins`), 활성 시 기본 join | v7 relation-queries | Prisma 블로그(join 전략) | VERIFIED |
| 17 | findUnique 같은 tick 자동 배치(데이터로더), findMany는 배치 안 됨 | query-optimization 문서 | 검색 요약(동일 문서 + 이슈) | VERIFIED |
| 18 | 참조 동작 기본값: 필수 Restrict / 선택 SetNull / onUpdate Cascade | referential-actions 문서 | 이전 버전 문서와 동일 | VERIFIED |
| 19 | PostgreSQL·Prisma 모두 FK 인덱스 자동 생성 안 함 | GitHub 이슈 #16543·토론 #25783 | PostgreSQL 일반 동작(검색 결과) | VERIFIED |
| 20 | Neon: config에 `DATABASE_URL_UNPOOLED`, 런타임 풀드 URL, `connect_timeout=15` | Neon Prisma 가이드 | Prisma v7 PostgreSQL 커넥터(-pooler) + config 레퍼런스(directUrl 제거) | VERIFIED. 단 Neon 가이드의 import 경로 `./generated/prisma`는 Prisma 공식(`/client`)과 **DISPUTED → 공식 경로 채택** |
| 21 | Vercel Fluid: `pg` Pool + `attachDatabasePool` + `PrismaPg(pool)` / Edge: pg 미지원, 엣지·Workers는 요청 단위 생성 | Prisma deploy-to-vercel·edge·cloudflare 문서 | Vercel KB, Neon vercel-connection-methods, Neon serverless driver | VERIFIED |
| 22 | `PrismaNeonHttp` v7 생성자 시그니처 | 2차 검색 요약(`neon()` 객체 전달형, v6 시절 형태) | 공식 v7 문서 미확인 | 최초 **UNVERIFIED** → 2026-09-26 `@prisma/adapter-neon@7.10.0`의 `dist/index.d.ts` 원본(1차 데이터, `curl`로 직접 확인)으로 **VERIFIED 전환**: `constructor(connectionString: string, options: neon.HTTPQueryOptions<boolean, boolean>)`, `HTTPQueryOptions` 필드 전부 optional(`@neondatabase/serverless@1.1.0` `index.d.ts`) |
| 23 | `$extends({ query: { $allOperations } })` 로깅 예시 — `model`·`operation`·`args`·`query`·`performance.now()`·`util.inspect` 사용 | 공식 문서 `prisma-client/client-extensions/query` | VERIFIED |
| 24 | Neon 공식 트러블슈팅: `connect_timeout`은 풀드 URL(`DATABASE_URL`)에 부착, 값 `0`은 타임아웃 비활성화 | Neon 공식 `guides/prisma` 문서 | VERIFIED |
| 25 | Vercel의 Neon 통합(Vercel-Managed·Neon-Managed 공통)이 `DATABASE_URL`(풀드)·`DATABASE_URL_UNPOOLED`(다이렉트)를 주입, `POSTGRES_*`는 구 Vercel Postgres 템플릿 호환용 별칭 | Neon 공식 Vercel 통합 문서 + WebSearch 교차 확인(Neon Previews 통합 문서) | VERIFIED |

| 26 | (2026-11-09) 최신 안정 = 7.10.1, CLI `latest` = 8.0.0-rc.33 / `prev` = 7.10.1 → 메이저 고정 필요성 유지 | npm dist-tags·time | GitHub 7.10.1 릴리스 | VERIFIED — SKILL.md §1·기준 버전 갱신 (#1·#2 값 대체) |
| 27 | (2026-11-09) v8 GA 2026-10 목표 → 11-09 현재 미도달(RC) | release-status (RC 문구 유지) | npm(8.0.0 정식 미게시, rc.33) | VERIFIED — §1에 "예고했지만 아직 RC" 반영 (#3 보완) |
| 28 | (2026-11-09) migrate dev generate·seed 자동 실행 없음, 트랜잭션 기본값 2000/5000 | CLI v7 migrate dev | v7 transactions 문서 | VERIFIED (변경 없음) |

보조 확인: `$queryRaw` 태그드 템플릿 파라미터화·`$queryRawUnsafe` 위험(공식 raw-queries), 에러 판별은 `Prisma.PrismaClientKnownRequestError`를 생성 클라이언트에서 import(공식 문서 — 2차 자료의 `@prisma/client/runtime/library` 경로는 채택하지 않음), P2002 `meta.target` 형태 변경은 이슈 1건 근거라 `> 주의:`로만 기재.

### 4-1. 내용 정확성
- [✅] 공식 문서와 불일치하는 내용 없음
- [✅] 버전 정보가 명시되어 있음 (Prisma ORM 7.10.0, Node 20.19+, TS 5.4+)
- [✅] deprecated된 패턴을 권장하지 않음 (`prisma-client-js`, `$use`, schema `url`/`directUrl` 모두 안티패턴으로 분류)
- [✅] 코드 예시가 실행 가능한 형태임

### 4-2. 구조 완전성
- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시
- [✅] 핵심 개념 설명 포함
- [✅] 코드 예시 포함
- [✅] 언제 사용 / 언제 사용하지 않을지 기준 포함 (런타임별 어댑터 선택 표, 트랜잭션 방식 표, 마이그레이션 명령 운영 사용 여부)
- [✅] 흔한 실수 패턴 포함 (안티패턴 18개)

### 4-3. 실용성
- [✅] 에이전트가 참조했을 때 실제 코드 작성에 도움이 되는 수준
- [✅] 지나치게 이론적이지 않고 실용적인 예시 포함
- [✅] 범용적으로 사용 가능 (특정 프로젝트 종속 X)

### 4-4. Claude Code 에이전트 활용 테스트
- [✅] 해당 스킬을 참조하는 에이전트에게 테스트 질문 수행 (2026-09-25, 2026-09-26, 2026-11-09 재테스트)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-09-25, 2026-09-26, 2026-11-09 재테스트)
- [✅] 잘못된 응답이 나오는 경우 스킬 내용 보완 (해당 없음 — 최초 3/3, 재테스트 3/3 PASS, 보완 불필요)

---

## 5. 테스트 진행 기록

**수행일**: 2026-11-09 (재검증 후 재시험)
**수행자**: skill-tester → general-purpose (TypeScript 백엔드 개발자 역할, 질문별 개별 에이전트 순차 수행)
**수행 방법**: 2026-11-09 재검증 변경분(§1 버전 정책 7.10.1·CLI v8 RC, 7.10.1 패치 수정사항) SKILL.md Read 후 실전 질문 2개 답변, 근거 줄 번호·anti-pattern 회피 확인

### 실제 수행 테스트 (2026-11-09)

**Q1. `npm i -D prisma` 설치 시 CLI가 8.0.0-rc로 깔림 — 최신 안정 버전·설치 방법·v8 GA 상황**
- ✅ PASS
- 근거: SKILL.md §1 "버전 정책 — 설치 함정" (37-55줄), §13 안티패턴 #1
- 상세: 최신 안정 7.10.1, CLI `latest`=8.0.0-rc.33 때문에 CLI(v8 RC)·클라이언트(v7) 혼재, `prisma@^7`·`@prisma/client@^7` 메이저 고정 명령, v8 GA 2026-10 예고했으나 11-09 현재 RC, v7 18개월 지원을 정확히 인용. anti-pattern(무고정 설치 권장) 회피.

**Q2. 중첩 `$transaction` 옵션 이상 동작·기본 maxWait/timeout·7.10.1 변경·migrate dev 후 generate/seed 자동 실행**
- ✅ PASS
- 근거: SKILL.md §8 트랜잭션(346-347·355줄), §1 45줄, §0·§2·§6
- 상세: 기본 maxWait 2000 / timeout 5000(P2028), 7.5.0+ 세이브포인트 중첩, 7.10.1이 옵션 객체 변형 버그(재사용 시 P2028)를 수정했음을 정확히 인용. migrate dev는 generate·seed 자동 실행 안 함(v7)도 정확하며, 구 문서 서술 충돌(`> 주의:`)도 반영.

### 발견된 gap (경미, 차단 아님)

- 7.10.1 중첩 `$transaction` 버그는 §1에 한 문장뿐이고 §8 중첩 트랜잭션 설명과 연결되지 않음(발생 시작 버전·옵션 상속 여부 미기재) — 선택 보강
- CLI가 이미 v8 RC로 깔린 경우의 되돌리기 절차(재설치·lockfile) 미명시 — 선택 보강

### 판정 (2026-11-09)

- agent content test: 2/2 PASS
- verification-policy 분류: 라이브러리 사용법 스킬(ORM 사용 패턴) — content test PASS로 APPROVED 가능한 카테고리
- 최종 상태: **APPROVED 유지**

---

### 이전 테스트 (2026-09-26 재테스트, 참고 보존)

**수행일**: 2026-09-26 (재테스트)
**수행자**: skill-tester → general-purpose (TypeScript 백엔드 개발자 역할, domain-specific 에이전트 세션 registry 미등록으로 대체 사용)
**수행 방법**: 2026-09-26 섹션 5·7·9·10 보강 내용(`$extends` 로깅 전체 예시, connect_timeout 위치·Vercel-Neon 환경변수명, 역방향 include, `PrismaNeonHttp` v7 생성자)을 겨냥해 SKILL.md(+references/) Read 후 실전 질문 3개 재답변, 근거 섹션·줄 번호 명시 및 anti-pattern 회피 확인

### 재테스트 (2026-09-26, 보강 내용 타깃)

**Q1(재). v6→v7 `$use` 로깅 미들웨어 → `$extends` 완전한 코드 전환**
- ✅ PASS
- 근거: SKILL.md §5 232줄(참조 안내) + references/v6-to-v7-upgrade.md "로깅·감사 미들웨어 전환" 절(52-81줄)
- 상세: `$extends({ query: { $allOperations({...}) {...} } })` 완전한 코드(어댑터 생성 포함)를 정확히 인용. `model`이 raw 쿼리에서 undefined일 수 있음, 확장된 인스턴스를 export해야 함, 에러를 삼키지 말고 rethrow해야 함까지 정확히 반영. gap: SKILL.md 본문의 `$allModels` 축약 표기와 참조 파일 실제 코드(전역 로깅이라 `$allModels` 생략)가 형태상 다르다는 점을 스스로 지적 — 사소한 표기 불일치, 차단 요인 아님.

**Q2(재). Vercel+Neon 콜드 스타트 타임아웃 — connect_timeout 부착 위치 + Vercel 자동 환경변수명**
- ✅ PASS
- 근거: SKILL.md §9-2 386~387줄
- 상세: "풀드 URL(`DATABASE_URL`)에 connect_timeout을 붙인다"(다이렉트 아님)와 그 이유(런타임 요청 시점 웨이크업 문제)를 정확히 인용. Vercel 자동 주입 환경변수명(`DATABASE_URL`/`DATABASE_URL_UNPOOLED`, 레거시 `POSTGRES_*` 별칭)까지 정확히 답변.

**Q3(재). 역방향 include(게시글+작성자 N+1) + `PrismaNeonHttp` v7 생성자·트랜잭션 지원 여부**
- ✅ PASS
- 근거: SKILL.md §7 291~296줄(역방향 include), §9-4 409줄 + references/serverless-edge.md 57~75줄(`PrismaNeonHttp` 생성자·HTTP 모드 트랜잭션 미지원)
- 상세: `post.findMany({ include: { author: { select } } })` 정확히 제시. `PrismaNeonHttp(connectionString, options: HTTPQueryOptions<boolean, boolean>)` 시그니처와 옵션 전부 optional(`{}` 가능)임을 패키지 원본 실측 근거와 함께 정확히 인용. "HTTP 모드는 트랜잭션 미지원 → 기본은 WebSocket(`PrismaNeon`)" 결론도 정확.

### 재테스트 판정

- agent content test (2026-09-26 보강분 타깃): 3/3 PASS
- 발견된 gap: SKILL.md 본문 `$allModels` 표기와 참조 파일 코드 형태 불일치(경미, 차단 아님). 그 외 2026-09-25 gap 3건은 이번 보강으로 전부 해소됨.
- verification-policy 분류: 라이브러리 사용법 스킬(ORM 사용 패턴) — content test PASS로 APPROVED 전환 가능한 카테고리
- 최종 상태: **APPROVED** (PENDING_TEST → APPROVED 재전환)

---

### 최초 테스트 (2026-09-25, 참고 보존)

**수행일**: 2026-09-25
**수행자**: skill-tester → typescript-backend-developer (도메인 특화 에이전트, 3회 순차 실행)
**수행 방법**: SKILL.md Read 후 실전 질문 3개 답변, 근거 섹션·줄 번호 명시 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. v6→v7 마이그레이션 — 어댑터 없는 `new PrismaClient()` + `$use` 로깅 미들웨어 전환**
- ✅ PASS
- 근거: SKILL.md §2 브레이킹 체인지 체크리스트(60-66행), §5 클라이언트 생성(199-231행), §13 안티패턴 #3·#5
- 상세: 어댑터 필수화·import 경로·`$extends({ query })` 전환을 정확히 근거 줄번호와 함께 답변. 경미한 gap: `$extends` 로깅 미들웨어의 완전한 코드 블록이 SKILL.md에 없고 한 줄 설명뿐(231행) — 에이전트가 스스로 합성해 답변, 오류는 없음

**Q2. Vercel + Neon — `migrate deploy` 풀드 URL 실패 → 환경변수 분리**
- ✅ PASS
- 근거: SKILL.md §9-2 "Neon — 풀드/다이렉트 분리"(362-378행), §13 안티패턴 #9
- 상세: `DATABASE_URL`(풀드)/`DATABASE_URL_UNPOOLED`(다이렉트) 분리와 `prisma.config.ts` 설정을 정확히 답변. 경미한 gap: `connect_timeout=15`를 어느 URL에 붙이는지, Vercel-Neon 통합의 실제 변수명 규칙(예: `POSTGRES_URL_NON_POOLING`)까지는 SKILL.md에 명시 없음 — 에이전트가 gap으로 정확히 짚어냄(할루시네이션 아님)

**Q3. N+1 문제 — 루프 안 `findMany` + 관련 인덱스**
- ✅ PASS
- 근거: SKILL.md §7 쿼리와 N+1 회피(264-289행), §4 schema 모델링(161-171·191-192행), §13 안티패턴 #10·#11
- 상세: N+1 원인 진단, `include`/`select` 대안, FK `@@index` 필요성까지 SKILL.md 예시와 1:1로 대응하는 답변. 경미한 gap: Post 기준 역방향 include 예시가 SKILL.md에 없어 유추 필요하다고 정확히 지적

### 발견된 gap (경미, 차단 아님)

- §5 `$extends` 로깅 미들웨어 완전한 코드 예시 부재 (현재 1줄 설명만)
- §9-2 `connect_timeout` 붙이는 위치(풀드/다이렉트 어느 쪽) 및 Vercel-Neon 통합 변수명 규칙 미언급
- §7 Post 기준 역방향 include(작성자 붙이기) 예시 부재

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 라이브러리 사용법 스킬(ORM 사용 패턴) — content test PASS로 APPROVED 전환 가능한 카테고리
- 최종 상태: APPROVED

---

권장 테스트 질문 후보 (참고용, 실제 수행 질문과 동일):
1. "Prisma 6 프로젝트를 7로 올리는데 `new PrismaClient()`와 `prisma.$use` 로깅 미들웨어를 어떻게 바꿔야 해?" — 기대: 어댑터 필수, `./generated/prisma/client` import, `$extends` 전환, `prisma@^7` 고정
2. "Vercel + Neon에서 Prisma 마이그레이션이 풀드 URL로 실패해. 설정을 어떻게 나눠?" — 기대: `prisma.config.ts`에 `DATABASE_URL_UNPOOLED`, 런타임 어댑터에 풀드 URL, `directUrl` 없음
3. "게시글 목록에 작성자 이름을 붙이는데 느려. 코드 봐줘 (루프 안 findUnique)" — 기대: N+1 진단, `include`/`select`, FK `@@index`

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (DISPUTED 3건 정정 반영, UNVERIFIED 1건은 2026-09-26 패키지 원본 실측으로 VERIFIED 전환) |
| 구조 완전성 | ✅ (500줄 유지 위해 §5·§9 코드 예시 일부를 references/로 이동) |
| 실용성 | ✅ |
| 에이전트 활용 테스트 | ✅ (최초 2026-09-25 typescript-backend-developer 3/3 PASS → 2026-09-26 보강분 재테스트 3/3 PASS → 2026-11-09 재검증 변경분(§1 버전 정책·7.10.1) 재시험 2/2 PASS) |
| **최종 판정** | **APPROVED** (2026-11-09 재시험 2/2 PASS로 유지) |

---

## 7. 개선 필요 사항

- [✅] skill-tester로 2단계 content test 수행 후 섹션 5·6 갱신 (2026-09-25 완료, 3/3 PASS)
- [❌] Prisma 8 GA(2026-10 목표) 이후: npm `latest` 태그·지원 정책 재확인, v8 전용 스킬 분리 여부 판단 — 차단 요인 아님, GA 시점 도래 후 선택 갱신 (2026-11-09 재확인: 아직 RC(rc.33), GA 미도달)
- [✅] `PrismaNeonHttp` v7 생성자 시그니처가 공식 문서에 게시되면 references/serverless-edge.md에 예시 추가 — 2026-09-26 공식 문서 대신 **패키지 원본**(`@prisma/adapter-neon@7.10.0`의 `dist/index.d.ts`, 1차 데이터)으로 직접 확인: `constructor(connectionString: string, options: neon.HTTPQueryOptions<boolean, boolean>)`. `HTTPQueryOptions`(`@neondatabase/serverless`)의 전 필드가 optional임도 확인해 `{}` 사용 가능함을 명시. references/serverless-edge.md에 코드 추가, SKILL.md §9-4 "미검증" 표기 제거
- [❌] P2002 `meta.target` v7 형태 변경 이슈(#28953) 해결 여부 추적 — 차단 요인 아님, 상류 이슈 추적용 선택 보강
- [✅] (2026-09-25 content test 발견) §5 `$extends` 로깅 미들웨어 완전한 코드 예시 추가 — 2026-09-26 공식 문서(`client-extensions/query`)의 `$allOperations` 로깅 예시를 v7 어댑터 패턴으로 조정해 references/v6-to-v7-upgrade.md에 전문 추가, SKILL.md §5에서 링크
- [✅] (2026-09-25 content test 발견) §9-2 `connect_timeout` 부착 위치 명시 — 2026-09-26 Neon 공식 문서(`guides/prisma` 트러블슈팅)로 **풀드 URL(`DATABASE_URL`)에 부착**함을 확인(런타임 요청 시점의 scale-to-zero 웨이크업 문제이므로). 동시에 Vercel-Neon 통합의 실제 환경변수명(`DATABASE_URL`/`DATABASE_URL_UNPOOLED`, 레거시 호환용 `POSTGRES_*`)도 Neon 공식 Vercel 통합 문서로 확인해 SKILL.md §9-2에 반영
- [✅] (2026-09-25 content test 발견) §7 Post 기준 역방향 include 예시 추가 — SKILL.md §7에 `post.findMany({ include: { author: { select } } })` 예시 신설(코드 예시라 별도 외부 검증 불필요)
- [✅] 2026-11-09 재검증 변경분(§1 버전 정책 7.10.1·CLI v8 RC, 7.10.1 패치)에 대한 skill-tester 재시험 수행 — 2026-11-09 완료, 2/2 PASS, APPROVED 유지
- [❌] (2026-11-09 content test 발견) §8 중첩 트랜잭션 설명에 7.10.1 옵션 객체 변형 버그 연결·CLI v8 RC로 깔린 경우 되돌리기 절차 보강 — 차단 요인 아님, 선택 보강
- [✅] 2026-09-26 보강분(`$extends` 로깅·connect_timeout 위치·Vercel-Neon 환경변수명·역방향 include·`PrismaNeonHttp` v7 생성자)에 대한 skill-tester 재테스트 수행 — Q1·Q2·Q3 모두 보강 내용을 직접 겨냥한 질문으로 재실행, 3/3 PASS. 경미한 표기 불일치(`$allModels`) 1건 외 gap 없음. PENDING_TEST → APPROVED 재전환

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-09-25 | v1 | 최초 작성 (Prisma ORM 7.10.0 기준, references 2종 분리) | skill-creator |
| 2026-09-25 | v1 | 2단계 실사용 테스트 수행 (Q1 v6→v7 마이그레이션 / Q2 Vercel+Neon 풀드 URL 분리 / Q3 N+1+인덱스) → 3/3 PASS, PENDING_TEST → APPROVED 전환 | skill-tester |
| 2026-09-26 | v1 | 섹션 7 선택 보강 4건 반영: `$extends` 로깅 전체 예시(references/v6-to-v7-upgrade.md 신설 절), `connect_timeout` 부착 위치(풀드 URL)·Vercel-Neon 환경변수명 명시, 역방향 include 예시(§7), `PrismaNeonHttp` v7 생성자 UNVERIFIED→VERIFIED 전환(패키지 원본 실측, references/serverless-edge.md). 500줄 유지 위해 코드 예시 일부를 references/로 이동. 내용 변경으로 APPROVED → PENDING_TEST 재전환(재테스트 대기) | Claude (Sonnet 5) |
| 2026-09-26 | v1 | 2단계 재테스트 수행 (Q1 `$extends` 로깅 완전 코드 / Q2 connect_timeout 위치+Vercel-Neon 환경변수 / Q3 역방향 include+`PrismaNeonHttp` v7 생성자·트랜잭션) — 보강 내용 전부 타깃, 3/3 PASS → PENDING_TEST → APPROVED 재전환 | skill-tester |
| 2026-09-26 | v1 | 표기 정합: SKILL.md 본문의 `$allModels.$allOperations` 축약 표기를 references 실제 코드(최상위 `query.$allOperations`, raw 쿼리 포함)와 일치시키고 두 형태의 범위 차이를 명시 (코드 변경 없음, status 유지) | Claude (Opus 5.5) |
| 2026-11-09 | v1 | 재검증 — npm·GitHub로 최신 안정 7.10.0 → **7.10.1**(패치, 브레이킹 없음) 갱신, CLI `latest` 8.0.0-rc.17 → rc.33, v8 GA(2026-10 목표) 미도달·여전히 RC 반영, 7.10.1 수정 사항(중첩 `$transaction` 옵션·P3025) 한 줄 추가. migrate dev·트랜잭션 기본값 등 API 변경 없음 확인. SKILL.md 500줄 유지 | Claude (Opus 5.5) |
| 2026-11-09 | v1 | 재검증 후 2단계 재시험 수행 (Q1 CLI v8 RC 설치 함정·최신 안정 7.10.1·메이저 고정 / Q2 중첩 `$transaction`·7.10.1 수정·기본 maxWait/timeout·migrate dev generate 비자동) → 2/2 PASS, APPROVED 유지 | skill-tester |
| 2026-11-12 | v1.1 | 정리(사실 재검증 아님) — 일반 지식 덜어내기: 남긴 것 v8 RC 설치 함정·7.10.1 패치 내용·v6→v7 브레이킹 표(references 상세 표 통합: db execute·migrate diff 플래그·엔진 env·Metrics 제거·풀 타임아웃 v6 호환값)·DISPUTED 2건·`$allOperations` 전환 요점·FK 인덱스 비자동/참조 동작 기본값·relationJoins Preview·트랜잭션 기본값/P2034/7.5 중첩·migrate deploy 락·Fluid attachDatabasePool·엣지 요청 단위·connect_timeout 위치·PrismaNeonHttp 트랜잭션 불가와 생성자 시그니처·v7 전용 안티패턴 / 덜어낸 것 설치 명령·package.json/tsconfig/config 예제·모델링 예제·싱글톤 코드·마이그레이션 명령표·N+1/raw SQL/트랜잭션/에러 처리/테스트 일반 예제·일반 안티패턴. references/ 2개는 SKILL.md 로 합치고 폴더 삭제 | 정리 |
