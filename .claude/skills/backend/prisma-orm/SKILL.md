---
name: prisma-orm
description: Prisma ORM 7.x(TypeScript) 사용 패턴 — prisma-client 제너레이터·prisma.config.ts·드라이버 어댑터 필수화 등 v7 브레이킹 체인지, schema.prisma 모델링·관계, migrate dev/deploy 워크플로, 트랜잭션(batch/interactive), N+1 회피, Neon·Vercel 서버리스/엣지 연결, 테스트 전략, 안티패턴. npm `latest`가 v8 RC를 가리키는 설치 함정 포함.
---

# Prisma ORM 7.x (TypeScript) 사용 패턴

> 소스:
> - Prisma v7 문서: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7 , https://www.prisma.io/docs/orm/v7/prisma-schema/overview/generators , https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference , https://www.prisma.io/docs/cli/v7/migrate/dev , https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production , https://www.prisma.io/docs/orm/v7/prisma-client/queries/transactions , https://www.prisma.io/docs/orm/v7/prisma-client/queries/relation-queries , https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance , https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/relations/referential-actions , https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections/connection-pool , https://www.prisma.io/docs/orm/v7/prisma-client/deployment/serverless/deploy-to-vercel , https://www.prisma.io/docs/orm/v7/prisma-client/deployment/edge/deploy-to-vercel , https://www.prisma.io/docs/guides/v7/deployment/cloudflare-workers , https://www.prisma.io/docs/guides/v7/frameworks/nextjs , https://www.prisma.io/docs/orm/v7/prisma-client/using-raw-sql/raw-queries , https://www.prisma.io/docs/orm/v7/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors , https://www.prisma.io/docs/orm/v7/prisma-client/testing/unit-testing , https://www.prisma.io/docs/orm/v7/prisma-client/testing/integration-testing
> - Prisma 릴리즈: https://www.prisma.io/docs/orm/release-status , https://www.prisma.io/changelog/2026-03-11 , https://github.com/prisma/orm/releases , https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o
> - Neon: https://neon.com/docs/guides/prisma , https://neon.com/docs/serverless/serverless-driver , https://neon.com/docs/guides/vercel-connection-methods
> - Vercel: https://vercel.com/kb/guide/connection-pooling-with-functions
>
> 검증일: 2026-09-25
> 기준 버전: **Prisma ORM 7.10.0** (`@prisma/client`·`@prisma/adapter-*` dist-tag `latest` = 7.10.0, GitHub "Latest" = 7.10.0, 2026-08-25)
> 최소 요구: Node.js **20.19.0+** (22.x 권장), TypeScript **5.4.0+** (5.9.x 권장)

---

## 0. 30초 요약

| 결정 | 선택 | 이유 |
|------|------|------|
| 버전 | **`prisma@^7` + `@prisma/client@^7` 고정** | npm `prisma`의 `latest` 태그가 **8.0.0-rc**를 가리킨다(아래 §1) |
| 제너레이터 | `provider = "prisma-client"` + `output` 필수 | `prisma-client-js`는 deprecated |
| import | `./generated/prisma/client` | `@prisma/client`에서 `PrismaClient` import 금지 |
| 연결 | **드라이버 어댑터 필수** (`@prisma/adapter-pg`, `@prisma/adapter-neon` 등) | v7은 Rust 엔진 제거, 풀링은 드라이버가 담당 |
| CLI 연결 URL | `prisma.config.ts`의 `datasource.url` | schema의 `url`/`directUrl`은 v7에서 제거·deprecated |
| 스키마 변경 | `migrate dev` → **`prisma generate` 명시 실행** | v7부터 migrate dev가 generate·seed를 자동 실행하지 않음 |
| 운영 반영 | CI/배포 단계에서 `prisma migrate deploy` | `migrate dev`/`reset`은 운영 금지 |
| 연관 로딩 | `select`/`include`로 한 번에 | 루프 안 쿼리 = N+1 |

---

## 1. 버전 정책 — 설치 함정 (2026-09-25 기준)

| 패키지 | npm `latest` | 비고 |
|--------|--------------|------|
| `prisma` (CLI) | **8.0.0-rc.17** | `prev` 태그 = 7.10.0 |
| `@prisma/client` | 7.10.0 | |
| `@prisma/adapter-pg` / `@prisma/adapter-neon` | 7.10.0 | |

- Prisma 8은 **TypeScript 전면 재작성판 RC**(쿼리 API·스키마 작성 방식 변경)이며 공식 GA 목표는 **2026년 10월**이다. Prisma 7은 v8 GA 이후 **18개월간 버그·보안 수정**이 이어진다(release-status 문서).
- 그래서 `npm i -D prisma` 한 줄이면 **CLI는 v8 RC, 클라이언트는 v7**이 섞인다. 반드시 메이저를 고정한다.

```bash
npm i -D prisma@^7 tsx
npm i @prisma/client@^7 @prisma/adapter-pg@^7 pg dotenv
npm i -D @types/pg
# Neon 서버리스 드라이버를 쓸 때: npm i @prisma/adapter-neon@^7 @neondatabase/serverless ws
```

> 주의: 이 문서는 v7 기준이다. v8을 의도적으로 도입하면 설치 패키지부터 다르다(예: `@prisma/orm-postgres`). v8 API는 RC라 변경 가능성이 있어 이 스킬에 포함하지 않는다.

---

## 2. v6 → v7 브레이킹 체인지 체크리스트

| 영역 | v6 | v7 |
|------|----|----|
| 제너레이터 | `prisma-client-js` | `prisma-client` + **`output` 필수** (소스 트리에 생성) |
| import | `@prisma/client` | `./generated/prisma/client` |
| 연결 | 엔진이 URL로 직접 연결 | **드라이버 어댑터 필수** `new PrismaClient({ adapter })` |
| 설정 | schema `datasource { url, directUrl }` | **`prisma.config.ts`** `datasource.url` (`directUrl` 제거) |
| env 로딩 | `.env` 자동 로드 | 자동 로드 안 함 → `import 'dotenv/config'` (Bun은 자동) |
| 미들웨어 | `prisma.$use()` | **제거** → `$extends({ query })` |
| migrate dev / db push | generate(+seed) 자동 | **자동 실행 안 함**, `--skip-generate`·`--skip-seed` 제거 |
| 풀 설정 | URL `connection_limit`, `pool_timeout` | 드라이버 옵션 (pg: `max` 10, idle 10s, connect timeout 0=무제한) |
| SSL | 인증서 검증 느슨 | **기본 검증** |

> 주의(DISPUTED 정정): "v7은 ESM 전용"이라는 2차 자료가 있으나 공식 제너레이터는 `moduleFormat = "esm" | "cjs"`를 제공한다. 신규는 ESM, 레거시 CJS는 `moduleFormat = "cjs"`.

전체 표·코드 전후·풀 타임아웃 v6 호환 설정·업그레이드 순서 → [references/v6-to-v7-upgrade.md](references/v6-to-v7-upgrade.md)

---

## 3. 프로젝트 구성

```jsonc
// package.json
{
  "type": "module",
  "scripts": {
    "postinstall": "prisma generate",          // Vercel 등 CI 빌드에서 클라이언트 재생성
    "db:migrate": "prisma migrate dev && prisma generate",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "prisma db seed"
  }
}
```

```jsonc
// tsconfig.json (핵심만)
{ "compilerOptions": { "module": "ESNext", "moduleResolution": "bundler", "target": "ES2023", "strict": true } }
```

```ts
// prisma.config.ts — 모든 prisma CLI 명령이 읽는다
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),   // env()는 변수가 없으면 throw. 선택값이면 process.env 직접 사용
  },
});
```

```prisma
// prisma/schema.prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"
  moduleFormat = "esm"          // 생략 시 추론. runtime 기본값은 nodejs
}

datasource db {
  provider = "postgresql"       // v7: url은 여기 두지 않고 prisma.config.ts로
}
```

- `runtime` 허용값: `nodejs`(기본), `deno`, `bun`, `workerd`, `cloudflare`, `vercel-edge`, `edge-light`, `react-native`.
- 생성물: `client.ts`(서버용 PrismaClient+타입), `browser.ts`(Node 의존 없는 타입), `models.ts`, `enums.ts` 등. **프론트엔드 번들에서 타입만 필요하면 `browser`/`models`/`enums`를 import**한다.
- 생성 디렉터리를 커밋할지는 팀 정책이지만, 커밋하지 않는다면 `postinstall`의 `prisma generate`는 필수다.

---

## 4. schema.prisma 모델링·관계

```prisma
enum Role {
  USER
  ADMIN
}

model User {
  id        String   @id @default(uuid(7))          // uuid(7): 시간순 정렬 가능 (5.18+)
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
  profile   Profile?
  createdAt DateTime @default(now()) @db.Timestamptz(6)
  updatedAt DateTime @updatedAt      @db.Timestamptz(6)

  @@map("users")
}

model Profile {                                     // 1:1 — FK에 @unique
  id     Int    @id @default(autoincrement())
  bio    String?
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Post {                                        // 1:N
  id        Int       @id @default(autoincrement())
  title     String
  published Boolean   @default(false)
  authorId  String
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  tags      PostTag[]

  @@index([authorId])                               // PostgreSQL은 FK 인덱스를 자동 생성하지 않는다
  @@index([published, id])
}

model Tag {
  id    Int       @id @default(autoincrement())
  name  String    @unique
  posts PostTag[]
}

model PostTag {                                     // 명시적 M:N — 조인 테이블에 속성·제약을 둘 때
  postId     Int
  tagId      Int
  assignedAt DateTime @default(now())
  post       Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag        Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
  @@index([tagId])
}
```

**규칙**
- **FK 스칼라 필드에 `@@index`를 직접 단다.** PostgreSQL도 Prisma도 FK 인덱스를 자동 생성하지 않는다(복합 PK의 선두 컬럼은 제외). 없으면 `include`·관계 필터가 풀스캔.
- 참조 동작 기본값: **필수 관계 `onDelete: Restrict`**, 선택 관계 `onDelete: SetNull`, `onUpdate`는 둘 다 `Cascade`. 의도가 있으면 명시한다.
- 암시적 M:N(`Post.categories Category[]` ↔ `Category.posts Post[]`)은 Prisma가 조인 테이블을 관리한다. 조인 행에 속성(`assignedAt` 등)이 필요해지면 명시적 M:N으로 설계해야 하므로, 확장 가능성이 있으면 처음부터 명시적으로 만든다.
- `@map`/`@@map`으로 DB는 snake_case, TS는 camelCase로 분리할 수 있다.

---

## 5. 클라이언트 생성 — 싱글톤

### 장기 실행 서버 (Express/Fastify/NestJS/Hono on Node)

```ts
// src/db.ts
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({ adapter });   // 프로세스당 1개

// graceful shutdown
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
```

### Next.js (dev HMR에서 인스턴스 누적 방지)

```ts
// lib/prisma.ts — Prisma 공식 Next.js v7 가이드 패턴
import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export default prisma;
```

미들웨어(`$use`)가 필요했던 로깅·감사 등은 `$extends({ query: { $allModels: { async $allOperations({ args, query }) { ... return query(args); } } } })`로 옮긴다.

---

## 6. 마이그레이션 워크플로

| 명령 | 용도 | 운영 사용 |
|------|------|:---:|
| `prisma migrate dev --name <이름>` | 섀도 DB로 드리프트 감지 → 새 마이그레이션 SQL 생성 → 개발 DB에 적용 | ❌ |
| `prisma migrate dev --create-only` | SQL만 생성(적용 안 함) → 수동 편집 후 적용 | ❌ |
| `prisma generate` | 클라이언트 재생성 — **v7부터 migrate dev 뒤 직접 실행** | 빌드 시 |
| `prisma db seed` | seed 실행 — **v7부터 자동 실행 없음** | 필요 시 |
| `prisma migrate deploy` | 미적용 마이그레이션만 적용, 드리프트 감지·리셋·generate 없음 | ✅ CI/배포 |
| `prisma migrate reset` | DB 초기화 후 전체 재적용 | ❌ (개발 전용) |
| `prisma db push` | 마이그레이션 파일 없이 스키마 동기화 | ❌ (프로토타이핑) |

**흐름**

```
개발:  schema.prisma 수정 → prisma migrate dev --name add_post_tags → prisma generate
       → prisma/migrations/<timestamp>_add_post_tags/migration.sql 커밋·리뷰
운영:  CI(또는 배포 직전 단계)에서 prisma migrate deploy → 앱 배포
```

- `migrate deploy`는 PostgreSQL/MySQL/SQL Server에서 **어드바이저리 락(10초 타임아웃)**을 잡아 동시 실행을 막는다. 그래도 여러 인스턴스 부팅 시 매번 실행하는 구조보다 **파이프라인 1회 실행**이 안전하다.
- 컬럼 rename·데이터 이관처럼 파괴적 변경은 `--create-only`로 SQL을 받아 직접 고친 뒤 적용한다(자동 생성 SQL은 drop+add가 될 수 있음).
- 적용된 마이그레이션 파일을 수정하면 `migrate deploy`가 경고한다 — 새 마이그레이션으로 고친다.
- Vercel 공식 예시 빌드 커맨드: `prisma generate && prisma migrate deploy && next build`. Preview 배포가 운영 DB를 보고 있으면 Preview마다 DDL이 돌므로 **Preview는 별도 DB(브랜치)로 분리**한다.

> 주의(DISPUTED 정정): v7 "Development and production" 문서 일부에는 migrate dev가 "Prisma Client 생성을 트리거한다"는 구 서술이 남아 있다. **CLI v7 레퍼런스와 업그레이드 가이드가 "자동 실행 안 함"으로 일치**하므로 그쪽을 따른다.

---

## 7. 쿼리와 N+1 회피

```ts
// ❌ N+1 — 사용자 수만큼 추가 쿼리
const users = await prisma.user.findMany();
for (const u of users) {
  u.posts = await prisma.post.findMany({ where: { authorId: u.id } });
}

// ✅ include — 연관을 한 번에 (기본 전략: 테이블당 1쿼리 = 여기선 2쿼리)
const users = await prisma.user.findMany({ include: { posts: true } });

// ✅ select — 필요한 필드만 (응답 페이로드·민감정보 노출 최소화)
const users = await prisma.user.findMany({
  select: {
    id: true, email: true,
    posts: { select: { id: true, title: true }, where: { published: true }, take: 5 },
  },
});

// ✅ in 필터로 직접 배치
const posts = await prisma.post.findMany({ where: { authorId: { in: userIds } } });

// ✅ 같은 tick의 findUnique는 Prisma 데이터로더가 자동 배치 (GraphQL resolver에 유용)
const posts = await prisma.user.findUnique({ where: { id } }).posts();
```

- **같은 레벨에서 `include`와 `select`를 함께 쓸 수 없다.** `include` 안에 중첩 `select`는 가능.
- **단일 SQL JOIN**이 필요하면 `relationLoadStrategy: "join"`을 쓴다. v7에서도 **Preview**라 `generator`에 `previewFeatures = ["relationJoins"]`를 추가해야 하며(PostgreSQL·CockroachDB·MySQL), 활성화 시 기본 전략이 `join`이다.
- 관계 필터: to-many는 `some`/`every`/`none`, to-one은 `is`/`isNot`.
- 페이지네이션은 `take` + `cursor`(+`skip: 1`)를 기본으로, 대용량 `skip` 오프셋은 피한다.

### Raw SQL — 인젝션 경계

```ts
// ✅ 태그드 템플릿: 자동 파라미터 바인딩
const rows = await prisma.$queryRaw`SELECT id FROM users WHERE email = ${email}`;
// ✅ 배열은 Prisma.join
import { Prisma } from './generated/prisma/client';
await prisma.$queryRaw`SELECT * FROM users WHERE id IN (${Prisma.join(ids)})`;
// ❌ 사용자 입력을 문자열로 이어 붙이거나 $queryRawUnsafe에 넣기 — SQL 인젝션
```

---

## 8. 트랜잭션

| 방식 | 언제 | 예 |
|------|------|----|
| **중첩 쓰기** | 부모+자식 동시 생성·연결 | `user.create({ data: { posts: { create: [...] } } })` — 자동으로 하나의 트랜잭션 |
| **배치 `$transaction([...])`** | 서로 독립적인 쿼리를 원자적으로 | 목록 + 카운트, 다건 업데이트 |
| **인터랙티브 `$transaction(async tx => …)`** | 읽은 값으로 판단해 쓰기 | 잔액 확인 후 차감 |

```ts
// 배치
const [posts, total] = await prisma.$transaction([
  prisma.post.findMany({ where: { published: true }, take: 20 }),
  prisma.post.count({ where: { published: true } }),
]);

// 인터랙티브 — 콜백 안에서는 반드시 tx 사용
import { Prisma } from './generated/prisma/client';

await prisma.$transaction(
  async (tx) => {
    const from = await tx.account.update({
      where: { id: fromId },
      data: { balance: { decrement: amount } },   // 원자적 증감 — read-modify-write 금지
    });
    if (from.balance < 0) throw new Error('INSUFFICIENT_FUNDS');   // throw → 전체 롤백
    await tx.account.update({ where: { id: toId }, data: { balance: { increment: amount } } });
  },
  {
    maxWait: 5_000,     // 기본 2000ms — 트랜잭션 획득 대기
    timeout: 10_000,    // 기본 5000ms — 초과 시 P2028
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  },
);
```

- **짧게 유지한다.** 콜백 안에서 외부 HTTP 호출·LLM 호출·느린 연산 금지 — 커넥션을 붙잡고 데드락을 키운다.
- `Serializable` 충돌은 **`P2034`로 실패**하므로 재시도 루프를 둔다.
- **7.5.0+**: 인터랙티브 트랜잭션 클라이언트(`tx`)에서 다시 `$transaction`을 호출하면 **세이브포인트 기반 중첩 트랜잭션**이 되며, 바깥이 실패하면 안쪽도 롤백된다.

---

## 9. 서버리스·엣지 연결 (Neon / Vercel)

### 9-1. 선택 표

| 런타임 | 어댑터 | 클라이언트 생성 위치 | 근거 |
|--------|--------|---------------------|------|
| 장기 실행 Node 서버 | `PrismaPg` | 모듈 1회 | 풀은 드라이버가 관리 |
| **Vercel Functions (Fluid compute, Node)** | `PrismaPg(pool)` + `attachDatabasePool(pool)` | 모듈 1회 | Prisma·Vercel·Neon 공식 모두 Fluid에서는 TCP 풀 + attachDatabasePool 권장 |
| Vercel Edge / Cloudflare Workers | `PrismaNeon` (pg는 Vercel Edge 미지원) | **요청마다** 생성·정리 | 엣지에서 WebSocket/I/O 객체는 요청 수명을 넘길 수 없음 |

### 9-2. Neon — 풀드/다이렉트 분리

| 변수 | 내용 | 용도 |
|------|------|------|
| `DATABASE_URL` | 풀드(호스트에 `-pooler`, PgBouncer) | 런타임 어댑터 |
| `DATABASE_URL_UNPOOLED` | 다이렉트 | **`prisma.config.ts` → migrate** |

```ts
// prisma.config.ts — CLI(마이그레이션)는 다이렉트 연결
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: { url: env('DATABASE_URL_UNPOOLED') },
});
```

- v7에는 `directUrl`이 없다. **"CLI용 URL은 config, 런타임 URL은 어댑터"**로 역할이 갈린다.
- Neon scale-to-zero 후 첫 연결이 늦을 수 있으므로 연결 문자열에 `connect_timeout=15`를 붙이는 것이 Neon 공식 권장이다.

### 9-3. Vercel Fluid compute (Node 런타임)

```ts
// lib/prisma.ts
import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });  // Neon이면 -pooler URL
attachDatabasePool(pool);          // 인스턴스 suspend 전에 유휴 커넥션 정리
export const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
```

### 9-4. Neon 서버리스 드라이버 · 엣지

- Node에서 `PrismaNeon`(WebSocket)을 쓰면 `neonConfig.webSocketConstructor = ws` 설정 후 `new PrismaNeon({ connectionString })`.
- **엣지(Workers/Vercel Edge)는 요청마다 `new PrismaClient({ adapter })` → 끝나면 `ctx.waitUntil(prisma.$disconnect())`.** 전역 재사용 시 요청 간 I/O 객체 접근 오류.
- Vercel Edge는 `export const runtime = 'edge'`일 때만(기본은 Node), `pg` 미지원, Hobby 번들 1 MB 제한.

> 주의: HTTP 변형(`PrismaNeonHttp`)은 **트랜잭션 미지원**(배치 `$transaction`·중첩 쓰기·`createMany`/`updateMany` 실패 이슈 보고). v7 생성자는 미검증이라 예시를 싣지 않는다 — 기본은 `PrismaNeon`.

코드 전문 → [references/serverless-edge.md](references/serverless-edge.md)

---

## 10. 에러 처리

```ts
import { Prisma } from './generated/prisma/client';

try {
  await prisma.user.create({ data: { email } });
} catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2002') throw new ConflictError('이미 사용 중인 이메일');   // unique 위반
    if (e.code === 'P2025') throw new NotFoundError();                        // update/delete 대상 없음, *OrThrow
  }
  throw e;
}
```

- 에러 객체를 그대로 HTTP 응답에 싣지 않는다(스키마·쿼리 정보 노출). 코드로 매핑한 뒤 응답한다.

> 주의: v7에서 P2002의 `meta.target` 형태가 v6와 달라졌다는 이슈 보고가 있다(prisma/prisma #28953). 어떤 필드가 충돌했는지를 `meta.target`에 의존해 분기하지 말고, 호출 맥락으로 판단한다.

---

## 11. 테스트 전략

| 계층 | 방법 | 검증 대상 |
|------|------|-----------|
| 단위 | `vitest-mock-extended`의 `mockDeep<PrismaClient>()` | 서비스 로직 분기(권한·검증·에러 매핑). **쿼리 자체는 검증 못 함** |
| 통합 | Docker Postgres(또는 Neon 브랜치) + `prisma migrate deploy` → 실제 쿼리 | 제약·트랜잭션·관계·인덱스 |

```ts
// src/lib/__mocks__/prisma.ts — Prisma 공식 Vitest 가이드 형태
import { beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { PrismaClient } from '../../generated/prisma/client';

const prisma = mockDeep<PrismaClient>();
beforeEach(() => { mockReset(prisma); });
export default prisma;
// 테스트 파일: vi.mock('../src/lib/prisma')
```

```jsonc
// 통합 테스트 스크립트 예 — 테스트 전용 DATABASE_URL(.env.test)
"test:int": "docker compose up -d && prisma migrate deploy && vitest run --config vitest.int.config.ts"
```

- 테스트 간 정리는 `deleteMany`(FK 순서 주의) 또는 `$executeRaw`의 `TRUNCATE ... CASCADE`.
- 통합 테스트는 병렬 실행 시 데이터가 섞이므로 워커별 스키마/DB를 쓰거나 직렬 실행한다.
- **적대적·경계 케이스를 반드시 포함한다** (@.claude/rules/adversarial-testing.md):
  - IDOR: 다른 사용자 `id`로 `update`/`delete` 시도 → `where`에 소유자(`authorId: session.userId`) 조건이 있어 `P2025`/0건 처리되는지
  - 인젝션: `email = "' OR 1=1 --"` 같은 입력이 `$queryRaw` 경로에서 문자열 그대로 비교되는지
  - 동시성: 같은 계좌 동시 차감 2건 → 잔액 음수 불가(원자적 decrement + 검사 or Serializable 재시도)
  - 중복: 동일 email 동시 가입 → 한 건만 성공하고 나머지 `P2002` → 409 매핑
  - 경계: 빈 문자열·초장문·`null` 선택 필드, `take` 음수/거대값 입력 거부

---

## 12. Drizzle과의 선택 기준

Drizzle(특히 Neon HTTP 드라이버 + Vercel 서버리스) 쪽 패턴·제약은 [`backend/drizzle-neon-postgres`](../drizzle-neon-postgres/SKILL.md) 스킬을 참조한다. 이 스킬에서는 비교 결론을 반복하지 않는다.

---

## 13. 안티패턴

| # | 안티패턴 | 문제 | 올바른 방법 |
|---|---------|------|------------|
| 1 | 버전 미고정 `npm i -D prisma` | CLI v8 RC + 클라이언트 v7 혼재 | `prisma@^7`·`@prisma/client@^7` 고정 |
| 2 | `@prisma/client`에서 `PrismaClient` import | v7 `prisma-client` 제너레이터와 불일치, 번들러 모듈 해석 오류 | `output` 경로의 `/client`에서 import |
| 3 | 어댑터 없이 `new PrismaClient()` / `datasourceUrl` 옵션 | v7에서 연결 불가 | `new PrismaClient({ adapter })` |
| 4 | schema `datasource`에 `url`/`directUrl` 유지 | v7에서 deprecated·제거 | `prisma.config.ts`의 `datasource.url` |
| 5 | `prisma.$use()` 미들웨어 | v7에서 제거됨 | `$extends({ query })` |
| 6 | 요청마다 `new PrismaClient()` (Node 서버) | 풀 중복 생성 → 커넥션 고갈 | 모듈 싱글톤 / Next.js는 `globalThis` 패턴 (엣지만 예외) |
| 7 | migrate dev 후 generate 생략 | 스키마와 타입 불일치 | `migrate dev && prisma generate` |
| 8 | 운영에서 `migrate dev`/`reset`/`db push` | 데이터 소실·드리프트 | CI에서 `migrate deploy` |
| 9 | 마이그레이션을 Neon 풀드 URL로 실행 | PgBouncer 경유 DDL·세션 작업 실패 가능 | config에는 `DATABASE_URL_UNPOOLED` |
| 10 | 루프 안 `findMany`/`findFirst` | N+1 | `include`/`select`/`in` 필터 |
| 11 | FK 필드 인덱스 누락 | 관계 조회 풀스캔 | `@@index([fkField])` |
| 12 | `findMany()` 전체 컬럼 반환 후 JSON 응답 | 비밀번호 해시 등 민감정보 노출 | `select`로 공개 필드만 |
| 13 | 인터랙티브 트랜잭션 안에서 외부 API 호출 | 타임아웃(P2028)·락 장기 점유 | 트랜잭션 밖에서 호출, 트랜잭션은 DB 작업만 |
| 14 | 트랜잭션 콜백 안에서 `prisma.*` 사용 | 트랜잭션 밖에서 실행되어 원자성 깨짐 | 콜백 인자 `tx.*`만 사용 |
| 15 | read → 계산 → write로 재고·잔액 갱신 | 레이스 컨디션 | `increment`/`decrement` + 조건, 또는 Serializable + P2034 재시도 |
| 16 | `$queryRawUnsafe`·문자열 연결 SQL | SQL 인젝션 | `$queryRaw` 태그드 템플릿, `Prisma.sql`/`Prisma.join` |
| 17 | 클라이언트가 보낸 `userId`로 where 구성 | IDOR | 세션 사용자 ID로 스코프 |
| 18 | `PrismaClientKnownRequestError`를 응답에 그대로 전달 | 내부 스키마 노출 | 코드→도메인 에러 매핑 |
