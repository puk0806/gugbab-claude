---
name: prisma-orm
description: Prisma ORM 7.x 버전 함정과 v7 브레이킹 체인지 — npm `prisma` latest가 v8 RC(설치 시 메이저 고정), prisma-client 제너레이터·prisma.config.ts·드라이버 어댑터 필수·$use 제거·migrate dev 자동 generate 중단, 7.5 중첩 트랜잭션, relationJoins 여전히 Preview, Vercel Fluid attachDatabasePool·엣지 요청 단위 생성·PrismaNeonHttp 트랜잭션 불가
---

# Prisma ORM 7.x (TypeScript) 사용 패턴

> 소스:
> - Prisma v7 문서: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7 , https://www.prisma.io/docs/orm/v7/prisma-schema/overview/generators , https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference , https://www.prisma.io/docs/cli/v7/migrate/dev , https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production , https://www.prisma.io/docs/orm/v7/prisma-client/queries/transactions , https://www.prisma.io/docs/orm/v7/prisma-client/queries/relation-queries , https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance , https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/relations/referential-actions , https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections/connection-pool , https://www.prisma.io/docs/orm/v7/prisma-client/deployment/serverless/deploy-to-vercel , https://www.prisma.io/docs/orm/v7/prisma-client/deployment/edge/deploy-to-vercel , https://www.prisma.io/docs/guides/v7/deployment/cloudflare-workers , https://www.prisma.io/docs/guides/v7/frameworks/nextjs , https://www.prisma.io/docs/orm/v7/prisma-client/using-raw-sql/raw-queries , https://www.prisma.io/docs/orm/v7/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors , https://www.prisma.io/docs/orm/v7/prisma-client/testing/unit-testing , https://www.prisma.io/docs/orm/v7/prisma-client/testing/integration-testing
> - Prisma 릴리즈: https://www.prisma.io/docs/orm/release-status , https://www.prisma.io/changelog/2026-03-11 , https://github.com/prisma/orm/releases , https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o
> - Neon: https://neon.com/docs/guides/prisma , https://neon.com/docs/serverless/serverless-driver , https://neon.com/docs/guides/vercel-connection-methods
> - Vercel: https://vercel.com/kb/guide/connection-pooling-with-functions
> - 2026-09-26 보강: https://www.prisma.io/docs/orm/prisma-client/client-extensions/query ($extends 로깅 전체 예시), https://neon.com/docs/guides/prisma (connect_timeout 위치), https://neon.com/docs/guides/vercel-managed-integration (Vercel-Neon 환경변수명), https://unpkg.com/@prisma/adapter-neon@7.10.0/dist/index.d.ts (PrismaNeonHttp 생성자 원본 확인)
> - 2026-11-09 재검증: https://registry.npmjs.org/-/package/prisma/dist-tags , https://github.com/prisma/prisma/releases/tag/7.10.1
>
> 검증일: 2026-11-09 (최초 2026-09-25, 섹션 5·7·9·10 보강·재테스트 2026-09-26)
> 기준 버전: **Prisma ORM 7.10.1** (`@prisma/client`·`@prisma/adapter-*` dist-tag `latest` = 7.10.1, npm 게시 2026-10-15 — 패치 릴리스, 브레이킹 없음)
> 최소 요구: Node.js **20.19.0+** (22.x 권장), TypeScript **5.4.0+** (5.9.x 권장)

---

## 이 스킬의 범위

v7 브레이킹 체인지(구 v6 API를 섞지 않도록), v8 RC 설치 함정, 서버리스·엣지 연결 함정만 싣는다.
> 기본 사용법(모델링·관계 정의·include/select·N+1 회피·트랜잭션·에러 처리·테스트 일반)은 공식 문서 수준이라 싣지 않는다. Drizzle 쪽은 `drizzle-neon-postgres` 참조.

---

## 1. 버전 정책 — 설치 함정 (2026-11-09 기준)

| 패키지 | npm `latest` | 비고 |
|--------|--------------|------|
| `prisma` (CLI) | **8.0.0-rc.33** | `prev` 태그 = 7.10.1 |
| `@prisma/client` | 7.10.1 | |
| `@prisma/adapter-pg` / `@prisma/adapter-neon` | 7.10.1 | |

- Prisma 8은 **TypeScript 전면 재작성판 RC**(쿼리 API·스키마 작성 방식 변경)다. release-status 문서는 GA를 **2026년 10월**로 예고했지만 **2026-11-09 현재 아직 RC**(rc.33, 2026-11-06)다. Prisma 7은 v8 GA 이후 **18개월간 버그·보안 수정**이 이어진다(release-status 문서). 7.10.1(패치): 중첩 `$transaction`이 넘긴 옵션 객체를 변형하던 버그(재사용 시 P2028) 수정, 섀도 DB URL이 메인 DB와 같으면 `P3025`로 거부.
- 그래서 `npm i -D prisma` 한 줄이면 **CLI는 v8 RC, 클라이언트는 v7**이 섞인다. 반드시 `prisma@^7`·`@prisma/client@^7`·`@prisma/adapter-*@^7`로 메이저를 고정한다.

> 주의: 이 문서는 v7 기준이다. v8을 의도적으로 도입하면 설치 패키지부터 다르다(예: `@prisma/orm-postgres`). v8 API는 RC라 변경 가능성이 있어 이 스킬에 포함하지 않는다.

---

## 2. v6 → v7 브레이킹 체인지

| 영역 | v6 | v7 |
|------|----|----|
| 제너레이터 | `prisma-client-js`, `node_modules/.prisma` 출력 | `prisma-client` + **`output` 필수**, 소스 트리에 생성 |
| import | `@prisma/client` | `./generated/prisma/client` (`Prisma` 네임스페이스도 여기서) |
| 연결 | 엔진이 URL로 직접 연결, `datasourceUrl` 옵션 | **드라이버 어댑터 필수** `new PrismaClient({ adapter })` (Rust 엔진 제거) |
| 설정 | schema `datasource { url, directUrl, shadowDatabaseUrl }` | **`prisma.config.ts`** `datasource.url` / `shadowDatabaseUrl` (`directUrl` 제거) |
| env 로딩 | `.env` 자동 로드 | 자동 로드 안 함 → `import 'dotenv/config'` (Bun은 자동). `env()`는 변수가 없으면 throw |
| 미들웨어 | `prisma.$use()` | **제거** → `$extends({ query })` |
| Metrics 프리뷰 | 있음 | 제거 |
| migrate dev / db push | 끝나면 generate(+seed) 자동 | **자동 실행 안 함**, `--skip-generate`·`--skip-seed` 플래그 제거 → `migrate dev && prisma generate`, seed는 `prisma db seed` |
| `db execute` | `--schema`, `--url` | 해당 플래그 제거 |
| `migrate diff` | `--from-url` / `--to-url` | `--from-config-datasource` / `--to-config-datasource` |
| 엔진 env | `PRISMA_CLIENT_ENGINE_TYPE`, `PRISMA_QUERY_ENGINE_*` 등 | 제거 |
| 풀 설정 | URL `connection_limit`, `pool_timeout` | 드라이버 옵션(pg: `max` 기본 10, `idleTimeoutMillis` 10s, `connectionTimeoutMillis` 0=무제한). v6와 맞추려면 `new PrismaPg({ connectionString, connectionTimeoutMillis: 5_000, idleTimeoutMillis: 300_000 })` |
| SSL | 인증서 검증 느슨 | **기본 검증** (필요 시 `ssl: { rejectUnauthorized: false }` — 운영 비권장) |

> 주의(DISPUTED 정정): "v7은 ESM 전용"이라는 2차 자료가 있으나 공식 제너레이터는 `moduleFormat = "esm" | "cjs"`를 제공한다. 신규는 ESM, 레거시 CJS는 `moduleFormat = "cjs"`.

> 주의(DISPUTED 정정): v7 "Development and production" 문서 일부에는 migrate dev가 "Prisma Client 생성을 트리거한다"는 구 서술이 남아 있다. **CLI v7 레퍼런스와 업그레이드 가이드가 "자동 실행 안 함"으로 일치**하므로 그쪽을 따른다.

- generator `runtime` 허용값: `nodejs`(기본), `deno`, `bun`, `workerd`, `cloudflare`, `vercel-edge`, `edge-light`, `react-native`.
- 생성물: `client.ts`(서버용), `browser.ts`(Node 의존 없는 타입), `models.ts`, `enums.ts`. **프론트엔드 번들에서 타입만 필요하면 `browser`/`models`/`enums`를 import**. 생성 디렉터리를 커밋하지 않으면 `postinstall: prisma generate` 필수.
- `$use` 대체: 모든 연산 가로채기는 최상위 `query.$allOperations({ model, operation, args, query })`(raw 포함, `model`은 raw에서 `undefined`), 모델 연산만이면 `query.$allModels.$allOperations`. `$extends()`는 **새 인스턴스를 반환**하므로 확장된 인스턴스를 export. `query(args)`가 던진 에러는 삼키지 말고 다시 던진다(트랜잭션 롤백 신호 보존).
- 업그레이드 순서: Node/TS 확인 → `^7` + 어댑터 설치 → 제너레이터·import 경로 → `prisma.config.ts`·schema `url` 제거 → `{ adapter }`·`$extends` → 스크립트(`generate`·`db seed` 명시) → 풀 타임아웃·SSL 영향 점검.

---

## 3. 잘못 알기 쉬운 동작

- **FK 인덱스는 자동 생성되지 않는다**(PostgreSQL도 Prisma도, 복합 PK 선두 컬럼 제외) → FK 스칼라에 `@@index` 직접.
- 참조 동작 기본값: **필수 관계 `onDelete: Restrict`**, 선택 관계 `SetNull`, `onUpdate`는 둘 다 `Cascade`.
- **단일 SQL JOIN**(`relationLoadStrategy: "join"`)은 v7에서도 **Preview** — `previewFeatures = ["relationJoins"]` 필요(PostgreSQL·CockroachDB·MySQL), 활성화 시 기본 전략이 `join`. 미활성 기본 전략은 테이블당 1쿼리.
- 인터랙티브 트랜잭션 기본 `maxWait` 2000ms·`timeout` 5000ms(초과 시 P2028). `Serializable` 충돌은 **P2034** → 재시도 루프.
- **7.5.0+**: 인터랙티브 트랜잭션 클라이언트(`tx`)에서 다시 `$transaction`을 호출하면 **세이브포인트 기반 중첩 트랜잭션**이 되며, 바깥이 실패하면 안쪽도 롤백된다.
- `migrate deploy`는 PostgreSQL/MySQL/SQL Server에서 **어드바이저리 락(10초 타임아웃)**으로 동시 실행을 막는다. 그래도 인스턴스 부팅마다 실행보다 파이프라인 1회가 안전.
- Vercel 공식 예시 빌드 커맨드 `prisma generate && prisma migrate deploy && next build` — Preview가 운영 DB를 보면 Preview마다 DDL이 돈다 → **Preview는 별도 DB(브랜치)**.

> 주의: v7에서 P2002의 `meta.target` 형태가 v6와 달라졌다는 이슈 보고가 있다(prisma/prisma #28953). 어떤 필드가 충돌했는지를 `meta.target`에 의존해 분기하지 말고, 호출 맥락으로 판단한다.

---

## 4. 서버리스·엣지 연결 (Neon / Vercel)

| 런타임 | 어댑터 | 클라이언트 생성 위치 | 근거 |
|--------|--------|---------------------|------|
| 장기 실행 Node 서버 | `PrismaPg` | 모듈 1회 (Next.js dev는 `globalThis` 캐시) | 풀은 드라이버가 관리 |
| **Vercel Functions (Fluid compute, Node)** | `PrismaPg(pool)` + `attachDatabasePool(pool)`(`@vercel/functions`) | 모듈 1회 | Prisma·Vercel·Neon 공식 모두 Fluid에서는 TCP 풀 + attachDatabasePool 권장(suspend 전 유휴 커넥션 정리) |
| Vercel Edge / Cloudflare Workers | `PrismaNeon` (pg는 Vercel Edge 미지원) | **요청마다** 생성 → `ctx.waitUntil(prisma.$disconnect())` | 엣지에서 I/O 객체는 요청 수명을 넘길 수 없음(전역 재사용 시 요청 간 I/O 객체 접근 오류) |

- Prisma 공식 Cloudflare Workers 가이드는 `PrismaPg`로 같은 요청 단위 패턴을 보여준다(Workers TCP 소켓 기반). generator `runtime = "cloudflare"`(또는 `"workerd"`).
- Vercel Edge는 `export const runtime = 'edge'`일 때만(기본 Node). 지원 어댑터 `@prisma/adapter-neon`·`@prisma/adapter-planetscale`·Turso(libSQL), generator `runtime = "vercel-edge"`, Hobby 엣지 번들 1 MB 제한.
- Node에서 `PrismaNeon`(WebSocket)은 `neonConfig.webSocketConstructor = ws` 후 `new PrismaNeon({ connectionString })`.

> 주의: Neon 가이드 예시는 `./generated/prisma`에서 import하지만, Prisma v7 `prisma-client` 제너레이터 기준 경로는 `./generated/prisma/client`다. 후자를 따른다.

### Neon 연결 문자열

- v7에는 `directUrl`이 없다 — **CLI용 URL은 `prisma.config.ts`(`DATABASE_URL_UNPOOLED`, 다이렉트), 런타임 URL은 어댑터(`DATABASE_URL`, `-pooler`)**. 마이그레이션을 풀드 URL로 돌리면 PgBouncer 경유 DDL·세션 작업 실패 가능.
- **`connect_timeout`은 풀드 URL(런타임 쪽)에 붙인다.** Neon 공식 트러블슈팅은 "쿼리 엔진이 Neon 컴퓨트가 깨어나기 전에 타임아웃"에 대해 `DATABASE_URL="postgresql://...?sslmode=require&connect_timeout=15"` 예시를 든다(scale-to-zero 웨이크업은 런타임 요청 시점). `0`은 타임아웃 비활성화.
- Vercel Neon 통합(Vercel-Managed·Neon-Managed 공통)은 `DATABASE_URL`·`DATABASE_URL_UNPOOLED`를 주입한다. `POSTGRES_URL`·`POSTGRES_URL_NON_POOLING` 등 `POSTGRES_*`는 **레거시 호환용** 별칭.

### HTTP 변형(PrismaNeonHttp)

> 주의: HTTP 모드는 트랜잭션을 지원하지 않는다 — 배치 `$transaction`, 중첩 쓰기, 내부적으로 트랜잭션을 여는 `createMany`/`updateMany`가 "Transactions are not supported in HTTP mode"로 실패한다는 이슈 보고가 있다. 트랜잭션이 필요 없는 단발성 읽기 위주 엣지 함수에서만 고려한다. 기본은 `PrismaNeon`(WebSocket).

- v7 생성자 시그니처는 공식 문서에 없고 `@prisma/adapter-neon@7.10.0` `dist/index.d.ts` 원본으로 확인(2026-09-26): `constructor(connectionString: string, options: neon.HTTPQueryOptions<boolean, boolean>)`. 두 번째 인자는 타입상 필수지만 내부 필드가 전부 선택값이라 `new PrismaNeonHttp(process.env.DATABASE_URL!, {})`로 충분하다.

---

## 5. v7 전용 안티패턴

| 안티패턴 | 문제 | 올바른 방법 |
|---------|------|------------|
| 버전 미고정 `npm i -D prisma` | CLI v8 RC + 클라이언트 v7 혼재 | `prisma@^7`·`@prisma/client@^7` 고정 |
| `@prisma/client`에서 `PrismaClient` import | `prisma-client` 제너레이터와 불일치, 번들러 모듈 해석 오류 | `output` 경로의 `/client` |
| 어댑터 없이 `new PrismaClient()` / `datasourceUrl` | v7에서 연결 불가 | `new PrismaClient({ adapter })` |
| schema `datasource`에 `url`/`directUrl` 유지 | deprecated·제거 | `prisma.config.ts` |
| `prisma.$use()` | 제거됨 | `$extends({ query })` |
| migrate dev 후 generate 생략 | 스키마와 타입 불일치 | `migrate dev && prisma generate` |
| 엣지에서 전역 PrismaClient 재사용 | 요청 간 I/O 객체 접근 오류 | 요청마다 생성·`waitUntil($disconnect)` |
| `PrismaNeonHttp`로 트랜잭션·`createMany` | HTTP 모드 트랜잭션 실패 | `PrismaNeon`(WebSocket) |
