# Prisma 7 — Neon 서버리스 드라이버 & 엣지 런타임 코드

> 소스: https://neon.com/docs/guides/prisma , https://neon.com/docs/serverless/serverless-driver , https://www.prisma.io/docs/orm/v7/prisma-client/deployment/edge/deploy-to-vercel , https://www.prisma.io/docs/guides/v7/deployment/cloudflare-workers , `@prisma/adapter-neon@7.10.0` README
> 검증일: 2026-09-25

## Neon 서버리스 드라이버 (Node에서 WebSocket)

```ts
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from './generated/prisma/client';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;   // WebSocket 내장이 없는 Node 환경에서만 필요
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });  // -pooler URL
export const prisma = new PrismaClient({ adapter });
```

> 주의: Neon 가이드 예시는 `./generated/prisma`에서 import하지만, Prisma v7 공식 문서의 `prisma-client` 제너레이터 기준 경로는 `./generated/prisma/client`다. 후자를 따른다.

## Cloudflare Workers — 요청 단위 생성

전역 PrismaClient를 요청 간 재사용하면 "한 요청 컨텍스트에서 만든 I/O 객체를 다른 요청에서 접근할 수 없다"는 오류가 난다. Neon 문서도 엣지에서 `Pool`/`Client`는 한 요청 안에서 연결·사용·종료하라고 명시한다.

```ts
// generator runtime = "cloudflare" (또는 "workerd")
import { PrismaClient } from './generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: env.DATABASE_URL }) });
    try {
      const users = await prisma.user.findMany({ select: { id: true }, take: 10 });
      return Response.json(users);
    } finally {
      ctx.waitUntil(prisma.$disconnect());
    }
  },
};
```

Prisma 공식 Cloudflare Workers 가이드는 `PrismaPg`로 같은 요청 단위 패턴을 보여준다(Workers의 TCP 소켓 지원 기반).

## Vercel Edge Functions

- 기본 런타임은 Node.js. `export const runtime = 'edge'`일 때만 엣지.
- 지원 어댑터: `@prisma/adapter-neon`, `@prisma/adapter-planetscale`, Turso(libSQL). **node-postgres(`pg`)는 Vercel Edge 미지원.**
- generator `runtime = "vercel-edge"`.
- Hobby 엣지 번들 1 MB 제한 초과 가능성 주의.

## Neon 연결 문자열 팁

- 런타임: `DATABASE_URL`(풀드, `-pooler`) / CLI·마이그레이션: `DATABASE_URL_UNPOOLED`(다이렉트) → `prisma.config.ts`
- scale-to-zero 후 기동 지연 대비: `?sslmode=require&connect_timeout=15`

## HTTP 변형(PrismaNeonHttp)

> 주의: HTTP 모드는 트랜잭션을 지원하지 않는다 — 배치 `$transaction`, 중첩 쓰기, 내부적으로 트랜잭션을 여는 `createMany`/`updateMany`가 "Transactions are not supported in HTTP mode"로 실패한다는 이슈 보고가 있다. v7 생성자 시그니처는 공식 문서에서 확인되지 않아(미검증) 예시를 싣지 않는다.
