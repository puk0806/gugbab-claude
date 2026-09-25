---
name: drizzle-neon-postgres
description: Next.js(App Router) + Vercel 서버리스에서 Drizzle ORM + Neon Postgres(서버리스 드라이버)로 소규모 데이터를 저장하는 패턴. neon-http vs neon-serverless 선택, 스키마·마이그레이션, upsert·트랜잭션 제약, Vercel Marketplace 환경변수, Neon 무료 티어 한도와 안티패턴을 다룬다.
---

# Drizzle ORM + Neon Postgres on Vercel (서버리스)

> 소스:
> - Drizzle: https://orm.drizzle.team/docs/get-started/neon-new , https://orm.drizzle.team/docs/connect-neon , https://orm.drizzle.team/docs/sql-schema-declaration , https://orm.drizzle.team/docs/indexes-constraints , https://orm.drizzle.team/docs/insert , https://orm.drizzle.team/docs/batch-api , https://orm.drizzle.team/docs/migrations , https://orm.drizzle.team/docs/drizzle-kit-migrate , https://orm.drizzle.team/docs/upgrade-v1
> - Neon: https://neon.com/docs/serverless/serverless-driver , https://neon.com/docs/connect/choose-connection , https://neon.com/docs/connect/connection-pooling , https://neon.com/docs/guides/drizzle , https://neon.com/docs/guides/drizzle-migrations , https://neon.com/docs/guides/vercel-native-integration , https://neon.com/docs/introduction/plans , https://neon.com/docs/introduction/scale-to-zero
> - Vercel: https://vercel.com/docs/cli/env , https://vercel.com/docs/global-config
> - GitHub: https://github.com/neondatabase/serverless , https://github.com/drizzle-team/drizzle-orm
>
> 검증일: 2026-09-17
> 기준 버전: `drizzle-orm` **0.45.2**(2026-03-27, dist-tag `latest`) / `drizzle-kit` **0.31.10**(2026-03-17) / `@neondatabase/serverless` **1.1.0**(2026-04-17) / Next.js 16.x App Router
> Neon 무료 티어 한도는 2026-09-17 기준 공식 plans 페이지 값
>
> 대상 시나리오: **개인용 PWA 푸시 알림 앱(사용자 6명)**. Web Push 구독(endpoint·p256dh·auth)과 사용자별 알림 시각 목록을 저장. Vercel Hobby + Neon Free로 운영.

---

## 0. 30초 요약 (이 시나리오의 정답 조합)

| 결정 | 선택 | 이유 |
|------|------|------|
| 드라이버 | `drizzle-orm/neon-http` (`neon()`) | 서버리스 함수에서 단발 쿼리 중심. HTTP fetch라 커넥션 수명 관리 불필요 |
| 런타임 연결 문자열 | `DATABASE_URL` (풀드, `-pooler`) | Vercel Neon 통합이 기본 주입 |
| 마이그레이션 연결 문자열 | `DATABASE_URL_UNPOOLED` (다이렉트) | 풀드로 마이그레이션 시 오류 가능 — Neon 공식 경고 |
| 스키마 반영 | `drizzle-kit generate` → `migrate`(로컬/CI에서 수동 실행) | 6명 앱이라도 SQL 파일이 남아야 롤백·리뷰 가능 |
| 다중 쓰기 원자성 | `db.batch([...])` | neon-http는 `db.transaction()` 미지원 (에러 throw) |
| 구독 저장 | `onConflictDoUpdate({ target: endpoint })` | endpoint 유니크 갱신(upsert) |

---

## 1. 설치

```bash
npm i drizzle-orm @neondatabase/serverless
npm i -D drizzle-kit tsx dotenv
```

- `@neondatabase/serverless`는 **HTTP(`neon()`)와 WebSocket(`Pool`/`Client`)을 모두 포함**하는 단일 패키지다. 드라이버 선택은 import 경로(`drizzle-orm/neon-http` vs `drizzle-orm/neon-serverless`)로 한다.
- Node.js 환경에서 WebSocket 경로를 쓸 때만 `ws`(+선택 `bufferutil`)가 추가로 필요하다. Vercel Edge/Workers 등 WebSocket 내장 환경에서는 불필요.

> **주의(버전 정책):** Drizzle 공식 get-started 문서는 현재 `npm i drizzle-orm@rc` / `drizzle-kit@rc`(= v1.0.0-rc 계열, 최신 rc.5는 2026-09-09)를 안내한다. 그러나 **dist-tag `latest`는 여전히 0.45.2**이며 v1은 RC 단계다. v1에서는 마이그레이션 폴더 구조가 바뀌고(`journal.json` 제거, `drizzle-kit drop` 삭제, `drizzle-kit up`으로 구조 이전) 관계형 쿼리 API도 바뀐다. 개인 프로젝트를 안정적으로 굴릴 목적이면 **0.45.x + drizzle-kit 0.31.x 고정**을 기본값으로 삼고, v1 RC는 의도적으로 선택할 때만 쓴다. 이 문서의 코드는 0.45.x 기준이다.

---

## 2. Vercel Marketplace로 Neon 붙이기 & 환경변수

Vercel 대시보드 → Marketplace에서 **Neon** 설치 → 리전·플랜·DB 이름 선택 → 프로젝트에 연결. 통합이 프로젝트 환경변수를 자동 주입한다.

| 환경변수 | 내용 | 용도 |
|----------|------|------|
| `DATABASE_URL` | **풀드(PgBouncer)** 연결 문자열 (호스트명에 `-pooler`) | 앱 런타임 쿼리 |
| `DATABASE_URL_UNPOOLED` | **다이렉트** 연결 문자열 | 마이그레이션, `CREATE INDEX CONCURRENTLY`, `LISTEN/NOTIFY` |
| `PGHOST` / `PGHOST_UNPOOLED` / `PGUSER` / `PGDATABASE` / `PGPASSWORD` | 연결 문자열 구성 요소 | 직접 문자열 조립이 필요할 때 |
| `POSTGRES_*` (레거시) | 구 Vercel 템플릿 호환용 | 신규 코드에서는 사용하지 않음 |

- 변수는 Production·Development에 먼저 주입되고, Preview 배포가 생기면 Preview에도 주입된다.
- Preview 브랜치 옵션을 켜면 Vercel Preview 배포마다 **Neon 브랜치(copy-on-write)** 가 만들어지고, 배포 삭제 시 브랜치도 정리된다.

### 로컬 개발 — 값을 손으로 복사하지 않는다

```bash
npm i -g vercel        # 또는 npx vercel
vercel link            # 로컬 폴더를 Vercel 프로젝트에 연결
vercel env pull .env.local          # development 환경변수를 .env.local로 내려받음
vercel env pull .env.local --environment=preview   # 필요 시 preview 값
```

- `.env.local`(및 `.env*`)은 반드시 `.gitignore`에 포함한다.
- 대시보드에서 값을 바꾸면 **다시 `vercel env pull`** 해야 로컬에 반영된다.
- 파일로 떨구고 싶지 않으면 `vercel env run -- next dev`로 환경변수를 주입해 실행할 수도 있다.
- `vercel build` / `vercel dev`를 쓰는 경우엔 `vercel pull`(`.vercel/`에 저장)을 쓴다.

---

## 3. 드라이버 선택 — neon-http vs neon-serverless

| | `drizzle-orm/neon-http` | `drizzle-orm/neon-serverless` |
|---|---|---|
| 전송 | HTTP(fetch) | WebSocket |
| 적합 | **단발 쿼리 / 비대화형 배치** — 서버리스 함수, Edge | 세션·**대화형 트랜잭션**, `pg` 드롭인 대체 |
| 왕복 | 적음(설정 왕복 ~3회) | 많음(~8회) |
| `db.transaction()` | ❌ **미지원** — `No transactions support in neon-http driver` throw | ✅ 지원 |
| `db.batch([...])` | ✅ 지원 (내부적으로 Neon HTTP `transaction()` 호출) | — |
| 커넥션 수명 | 없음(요청마다 fetch) | **핸들러 안에서 생성·사용·종료 필수** |

**선택 기준 한 줄:** 요청 하나에서 쿼리 1~3개를 독립적으로 날리면 `neon-http`. "읽고 판단해서 그 결과로 쓰는" 대화형 트랜잭션이 필요하면 `neon-serverless`. 푸시 구독 저장/조회/삭제는 전부 전자에 해당한다.

### neon-http 클라이언트 (권장)

```ts
// src/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle({ client: sql, schema });
```

- 이 모듈은 **모듈 최상위에서 1회 생성해 재사용**한다. `neon()`은 TCP 커넥션을 열지 않는 fetch 기반 객체라 서버리스에서 모듈 스코프 생성이 안전하며, Drizzle 공식 예제도 동일한 형태다.
- `drizzle(process.env.DATABASE_URL!)` 축약형도 동작하지만, `client`를 명시하면 `neon()` 옵션(예: `fetchOptions`)을 붙이기 쉽다.

### neon-serverless(WebSocket)가 꼭 필요할 때

```ts
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';                      // Node.js 런타임에서만 필요
neonConfig.webSocketConstructor = ws;

export async function withTx<T>(fn: (db: ReturnType<typeof drizzle>) => Promise<T>) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });  // 핸들러 내부에서 생성
  try {
    return await fn(drizzle({ client: pool }));
  } finally {
    await pool.end();                     // 반드시 같은 요청 안에서 닫는다
  }
}
```

> Neon 공식 문서: 서버리스에서는 "WebSocket 커넥션이 단일 요청보다 오래 살 수 없다". `Pool`/`Client`는 **요청 핸들러 밖에서 만들지 말 것.**

---

## 4. drizzle.config.ts

```ts
// drizzle.config.ts
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',   // 폴더로 나누려면 './src/db/schema'
  out: './drizzle',
  dbCredentials: {
    // 마이그레이션은 다이렉트(비풀드) 연결을 쓴다 — 풀드로 하면 오류가 날 수 있다(Neon 공식)
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
  },
});
```

---

## 5. 스키마 정의 (Web Push 구독 + 알림 시각)

```ts
// src/db/schema.ts
import {
  pgTable, integer, text, smallint, boolean, timestamp, index, unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey(),                       // 6명 규모: 외부 인증 subject 그대로 사용
  displayName: text('display_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const pushSubscriptions = pgTable(
  'push_subscriptions',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull().unique(),   // 브라우저마다 유일 — upsert 기준 키
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('push_subscriptions_user_id_idx').on(t.userId)],
);

export const notificationTimes = pgTable(
  'notification_times',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    hour: smallint('hour').notNull(),                // 0-23 (앱 레벨에서 검증)
    minute: smallint('minute').notNull(),            // 0-59
    enabled: boolean('enabled').notNull().default(true),
  },
  (t) => [
    unique('notification_times_user_time_uq').on(t.userId, t.hour, t.minute), // 같은 시각 중복 등록 차단
    index('notification_times_user_idx').on(t.userId),
  ],
);
```

**문법 포인트**
- 세 번째 인자는 **배열 반환 콜백**(`(t) => [...]`)이다. 0.36.0부터 배열이 표준이고 객체 반환은 deprecated.
- 컬럼 유니크: `.unique()` / `.unique('custom_name')` / `.unique('name', { nulls: 'not distinct' })`.
- 복합 유니크: `unique('name').on(t.a, t.b)`, 복합 PK: `primaryKey({ columns: [t.a, t.b] })`.
- 인덱스: `index('name').on(t.col)`, `uniqueIndex('name').on(t.col)`, 부분 인덱스는 `.where(sql\`...\`)`.
- 체크 제약(`hour BETWEEN 0 AND 23`)을 DB로 밀고 싶으면 `check()`를 추가로 쓰되, **앱 레벨 검증은 어차피 필수**다(9절 참고).

### 타입 추론

```ts
export type PushSubscription = typeof pushSubscriptions.$inferSelect;   // SELECT 결과 타입
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert; // INSERT 입력 타입
// 동등 표현: InferSelectModel<typeof pushSubscriptions> / InferInsertModel<...>
```

### 관계(선택)

```ts
export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(pushSubscriptions),
  times: many(notificationTimes),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, { fields: [pushSubscriptions.userId], references: [users.id] }),
}));
```

> **주의:** 이 `relations()` 형태와 `db.query.*` 관계형 쿼리는 **0.45.x 기준**이다. v1에서는 관계 정의·쿼리 API가 바뀌어 별도 마이그레이션 경로가 필요하다(공식 upgrade 문서). 6명 규모에서는 관계형 쿼리 없이 `leftJoin` 또는 쿼리 2번으로 끝내는 편이 업그레이드 부담이 적다.

---

## 6. 마이그레이션 — generate / migrate / push

| 명령 | 동작 | 쓰는 곳 |
|------|------|---------|
| `drizzle-kit generate` | TS 스키마와 이전 스냅샷을 비교해 **SQL 파일 생성**(컬럼 rename은 프롬프트) | 변경할 때마다. 파일은 git에 커밋 |
| `drizzle-kit migrate` | 생성된 SQL 중 **미적용분만** DB에 적용. 적용 이력은 `drizzle.__drizzle_migrations` 테이블 | 배포 파이프라인 / 수동 실행 |
| `drizzle-kit push` | SQL 파일 없이 **DB 상태를 스키마에 직접 맞춤** | 프로토타이핑·로컬 실험 |
| `drizzle-kit pull` | 기존 DB → TS 스키마 역생성 | database-first 도입 시 |

```jsonc
// package.json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

프로그래밍 방식 실행(원하면):

```ts
// src/db/migrate.ts  ← tsx로 실행. 런타임 요청 경로에서 호출하지 않는다
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
await migrate(drizzle({ client: sql }), { migrationsFolder: './drizzle' });
```

### Vercel 빌드 단계에서 마이그레이션을 돌려도 되나

- Drizzle 공식 문서가 권장하는 형태는 **① CI/CD 파이프라인에서 `migrate` 실행** 또는 **② 앱 시작/배포 시점에 `migrate()` 호출**이다.
- 반면 "Vercel `buildCommand`에 `drizzle-kit migrate`를 넣어라"는 **공식 권장으로 문서화되어 있지 않다**. 빌드는 Preview 포함 여러 배포에서 병렬로 돌 수 있어 같은 DB에 동시에 DDL을 치는 상황이 생긴다.
- **6명짜리 개인 앱의 안전한 기본값:** 스키마를 바꿨을 때 로컬(또는 GitHub Actions)에서 `npm run db:generate && npm run db:migrate`를 **배포 전에 한 번** 돌리고, 배포는 코드만 올린다. 굳이 빌드에 넣는다면 `DATABASE_URL_UNPOOLED`를 쓰고 Production 배포에만 걸리도록 분기한다.

> **주의:** 위 "빌드 단계에 넣지 말라"는 공식 금지 문구가 아니라, 공식 권장 경로(CI/CD·배포 시점) + 프리뷰 배포 동시성이라는 검증된 사실에서 도출한 운영 권고다.

---

## 7. 쿼리 패턴

```ts
import { and, eq, asc, inArray } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { pushSubscriptions, notificationTimes } from '@/db/schema';
```

### SELECT

```ts
const subs = await db
  .select()
  .from(pushSubscriptions)
  .where(eq(pushSubscriptions.userId, userId));

// 필요한 컬럼만
const times = await db
  .select({ hour: notificationTimes.hour, minute: notificationTimes.minute })
  .from(notificationTimes)
  .where(and(eq(notificationTimes.userId, userId), eq(notificationTimes.enabled, true)))
  .orderBy(asc(notificationTimes.hour), asc(notificationTimes.minute));
```

### INSERT / UPSERT

```ts
// 단순 insert (+ 반환)
const [row] = await db.insert(notificationTimes)
  .values({ userId, hour: 9, minute: 0 })
  .returning({ id: notificationTimes.id });

// 중복 무시
await db.insert(notificationTimes)
  .values({ userId, hour: 9, minute: 0 })
  .onConflictDoNothing({ target: [notificationTimes.userId, notificationTimes.hour, notificationTimes.minute] });

// ★ 구독 upsert — endpoint 유니크 기준으로 키 갱신
await db.insert(pushSubscriptions)
  .values({ userId, endpoint, p256dh, auth, userAgent })
  .onConflictDoUpdate({
    target: pushSubscriptions.endpoint,
    set: {
      userId: sql`excluded.user_id`,     // excluded.* 는 DB 컬럼명 기준
      p256dh: sql`excluded.p256dh`,
      auth: sql`excluded.auth`,
      updatedAt: sql`now()`,
    },
  });
```

- `target`은 컬럼 1개 또는 복합 배열(`[t.a, t.b]`).
- 부분 인덱스 대응은 `targetWhere`, 조건부 갱신은 `setWhere`.
- `.values([...])`로 다중 행 insert 가능. 모든 값은 자동 파라미터 바인딩된다.

### UPDATE / DELETE

```ts
await db.update(notificationTimes)
  .set({ enabled: false })
  .where(and(eq(notificationTimes.userId, userId), eq(notificationTimes.id, timeId)));

await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.endpoint, deadEndpoints));
```

### 트랜잭션 — neon-http에서는 batch

```ts
// ❌ neon-http: Error: No transactions support in neon-http driver
await db.transaction(async (tx) => { /* ... */ });

// ✅ 비대화형 배치 — Drizzle이 Neon HTTP transaction() 한 번으로 보낸다
const [inserted, cleaned] = await db.batch([
  db.insert(notificationTimes).values({ userId, hour: 7, minute: 30 }).returning({ id: notificationTimes.id }),
  db.delete(notificationTimes).where(and(eq(notificationTimes.userId, userId), eq(notificationTimes.enabled, false))),
]);
```

- `batch`는 **쿼리 배열을 미리 만들어 한 번에** 보낸다. 앞 쿼리 결과를 보고 뒤 쿼리를 바꾸는 건 불가능하다 → 그게 필요하면 `neon-serverless`로 바꾼다.
- Neon HTTP의 `transaction()`은 `isolationLevel`·`readOnly`·`deferrable` 옵션을 지원한다.

---

## 8. Vercel 서버리스 주의점

| 항목 | 내용 |
|------|------|
| 커넥션 풀링 | `neon-http`는 매 쿼리가 HTTPS fetch라 **앱 쪽 풀링이 필요 없다**. 그래도 `DATABASE_URL`(=`-pooler`)을 쓰는 게 기본값이며, 다른 도구가 TCP로 붙을 때를 대비한 안전한 선택이다 |
| 클라이언트 생성 위치 | `neon()`+`drizzle()`은 모듈 최상위 1회. `Pool`/`Client`(WebSocket)는 **요청 핸들러 안에서 생성→사용→`end()`** |
| 콜드 스타트 | 함수 콜드 스타트 + **Neon scale-to-zero(5분 비활성 후, Free에서 비활성화 불가)** 가 겹친다. suspend 후 첫 쿼리는 컴퓨트 기동에 수백 ms가 추가되고, 버퍼가 차가워 초기 쿼리가 더 느릴 수 있다. 7일 이상 idle이면 기동이 조금 더 길어질 수 있다 |
| 완화책 | 6명 앱에서는 **수용하는 게 정답**. 정 급하면 cron으로 가벼운 `SELECT 1`을 주기 실행해 깨워둘 수 있으나 CU-hours를 그만큼 더 태운다 |
| 환경변수 | 런타임 `DATABASE_URL`, 마이그레이션 `DATABASE_URL_UNPOOLED`. 로컬은 `vercel env pull .env.local` |
| 캐싱 | Next.js 15부터 **GET Route Handler 기본값이 static → dynamic**으로 바뀌어 DB 조회 결과가 임의로 캐시되지 않는다. 그래도 조회 핸들러에는 명시적으로 `export const dynamic = 'force-dynamic'`를 두면 의도가 분명해진다 |
| 리전 | Vercel 함수 리전과 Neon 프로젝트 리전을 맞추면 왕복 지연이 줄어든다(Hobby는 함수 리전 선택이 제한적이므로 **Neon 리전을 Vercel 기본 리전에 맞춰 생성**) |

---

> → references/REFERENCE.md §9 완결 예시 — Route Handler 3종

---

> → references/REFERENCE.md §10 Neon 무료(Free) 플랜 한도 — 2026-09-17 기준

---

> → references/REFERENCE.md §11 대안 한 줄 비교 (사용자 6명 기준)

---

> → references/REFERENCE.md §12 안티패턴

---

> → references/REFERENCE.md §13 도입 체크리스트

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
