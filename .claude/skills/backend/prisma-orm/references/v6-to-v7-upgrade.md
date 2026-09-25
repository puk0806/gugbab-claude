# Prisma v6 → v7 업그레이드 상세

> 소스: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7 , https://www.prisma.io/docs/orm/v7/prisma-schema/overview/generators , https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference , https://www.prisma.io/docs/cli/v7/migrate/dev , https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections/connection-pool
> 검증일: 2026-09-25 / 기준: Prisma ORM 7.10.0 (7.0.0 발표 2025-11-19)

## 전제 조건

- Node.js **20.19.0+** (22.x 권장), TypeScript **5.4.0+** (5.9.x 권장)

## 변경 표

| 영역 | v6 | v7 |
|------|----|----|
| 제너레이터 | `prisma-client-js`, `node_modules/.prisma` 출력 | `prisma-client` + **`output` 필수**, 소스 트리에 생성 |
| import | `import { PrismaClient } from '@prisma/client'` | `import { PrismaClient } from './generated/prisma/client'` |
| 연결 | 엔진이 URL로 직접 연결 | **드라이버 어댑터 필수** `new PrismaClient({ adapter })` |
| 설정 | schema `datasource { url, directUrl, shadowDatabaseUrl }` | **`prisma.config.ts`** `datasource.url` / `shadowDatabaseUrl` (`directUrl` 제거) |
| env 로딩 | `.env` 자동 로드 | 자동 로드 안 함 → `import 'dotenv/config'` (Bun은 자동) |
| 미들웨어 | `prisma.$use()` | **제거** → Client Extensions `$extends({ query })` |
| Metrics 프리뷰 | 있음 | 제거 |
| migrate dev / db push | 끝나면 generate(+seed) 자동 | **자동 실행 안 함**, `--skip-generate`·`--skip-seed` 플래그 제거 |
| `db execute` | `--schema`, `--url` | 해당 플래그 제거 |
| `migrate diff` | `--from-url` / `--to-url` | `--from-config-datasource` / `--to-config-datasource` |
| 엔진 env | `PRISMA_CLIENT_ENGINE_TYPE`, `PRISMA_QUERY_ENGINE_*` 등 | 제거 |
| 풀 설정 | URL `connection_limit`, `pool_timeout` | 드라이버 옵션(pg: `max` 기본 10, `idleTimeoutMillis` 10s, `connectionTimeoutMillis` 0=무제한) |
| SSL | 인증서 검증 느슨 | **기본 검증** (필요 시 `ssl: { rejectUnauthorized: false }` — 운영 비권장) |
| 모듈 | CJS 중심 | ESM 권장 (`"type": "module"`, `module: "ESNext"`, `moduleResolution: "bundler"`, `target: "ES2023"`) |

> 주의(DISPUTED 정정): "v7은 ESM 전용"이라는 2차 자료가 있으나, 공식 제너레이터 레퍼런스는 `moduleFormat = "esm" | "cjs"` 옵션을 제공한다. 신규 프로젝트는 ESM, 레거시 CJS 프로젝트는 `moduleFormat = "cjs"`로 대응한다.

## 코드 전후

```ts
// v6
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

// v7
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
```

```ts
// v6 미들웨어 → v7 확장
// prisma.$use(async (params, next) => next(params));   // ❌ 제거됨
const prisma = new PrismaClient({ adapter }).$extends({
  query: { user: { async findMany({ args, query }) { return query(args); } } },
});
```

## v6 풀 타임아웃과 동일하게 맞추기

```ts
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 300_000,
});
```

## 업그레이드 순서

1. Node/TS 버전 확인 → `prisma@^7`, `@prisma/client@^7`, 어댑터 설치
2. `generator`를 `prisma-client` + `output`으로 변경, 모든 import 경로 수정
3. `prisma.config.ts` 생성, schema `datasource`에서 `url`/`directUrl` 제거
4. `new PrismaClient({ adapter })`로 교체, `$use` → `$extends`
5. package.json 스크립트: `migrate dev` 뒤 `prisma generate`, seed는 `prisma db seed` 명시
6. 풀 타임아웃·SSL 기본값 변경 영향 점검
