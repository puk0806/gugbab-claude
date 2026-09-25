## 9. 완결 예시 — Route Handler 3종

### 9-1. 구독 등록/갱신 (upsert)

```ts
// app/api/push/subscribe/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { getSessionUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const MAX_ENDPOINT_LEN = 2048;
const MAX_KEY_LEN = 256;

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();            // 인증 실패 시 null
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const { endpoint, keys } = (body ?? {}) as {
    endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown };
  };
  const p256dh = keys?.p256dh;
  const auth = keys?.auth;

  // 입력 검증 — 클라이언트가 보낸 userId는 절대 신뢰하지 않고 세션 값만 쓴다
  if (
    typeof endpoint !== 'string' || endpoint.length === 0 || endpoint.length > MAX_ENDPOINT_LEN ||
    !/^https:\/\//.test(endpoint) ||
    typeof p256dh !== 'string' || p256dh.length === 0 || p256dh.length > MAX_KEY_LEN ||
    typeof auth !== 'string' || auth.length === 0 || auth.length > MAX_KEY_LEN
  ) {
    return NextResponse.json({ error: 'invalid subscription' }, { status: 400 });
  }

  await db.insert(pushSubscriptions)
    .values({
      userId,
      endpoint,
      p256dh,
      auth,
      userAgent: request.headers.get('user-agent')?.slice(0, 255) ?? null,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        userId: sql`excluded.user_id`,   // 기기를 다른 계정이 재등록한 경우 소유자 이전
        p256dh: sql`excluded.p256dh`,
        auth: sql`excluded.auth`,
        updatedAt: sql`now()`,
      },
    });

  return new NextResponse(null, { status: 204 });
}
```

### 9-2. 사용자 구독 + 알림 시각 조회

```ts
// app/api/push/me/route.ts
import { NextResponse } from 'next/server';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { notificationTimes, pushSubscriptions } from '@/db/schema';
import { getSessionUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const [subs, times] = await db.batch([
    db.select({
        endpoint: pushSubscriptions.endpoint,
        createdAt: pushSubscriptions.createdAt,
      })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId)),      // 항상 세션 userId로 스코프 — IDOR 방지
    db.select({
        id: notificationTimes.id,
        hour: notificationTimes.hour,
        minute: notificationTimes.minute,
        enabled: notificationTimes.enabled,
      })
      .from(notificationTimes)
      .where(eq(notificationTimes.userId, userId))
      .orderBy(asc(notificationTimes.hour), asc(notificationTimes.minute)),
  ]);

  return NextResponse.json({ subscriptions: subs, times });
}
```

### 9-3. 발송 실패(410 Gone / 404) endpoint 정리

RFC 8030 기준 푸시 서비스는 구독이 사라지면 **404 또는 410**을 반환한다. 이때 서버는 해당 endpoint를 저장소에서 삭제해야 한다.

```ts
// app/api/cron/send/route.ts  (Vercel Cron에서 호출)
import { NextResponse } from 'next/server';
import { inArray } from 'drizzle-orm';
import webpush from 'web-push';
import { db } from '@/db';
import { pushSubscriptions } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Vercel Cron 호출만 허용 (외부에서 임의 호출 차단)
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_CONTACT!}`,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,   // 시크릿은 코드가 아니라 환경변수로만
  );

  const targets = await db.select().from(pushSubscriptions);
  const dead: string[] = [];

  const results = await Promise.allSettled(
    targets.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({ title: '알림', body: '예정된 알림입니다' }),
      ).catch((err: { statusCode?: number }) => {
        if (err.statusCode === 404 || err.statusCode === 410) dead.push(s.endpoint);
        throw err;   // 그 외 오류는 실패로 집계만 하고 구독은 유지
      }),
    ),
  );

  if (dead.length > 0) {
    // 만료 구독 일괄 삭제 — 다음 실행부터 재시도하지 않는다
    await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.endpoint, dead));
  }

  return NextResponse.json({
    sent: results.filter((r) => r.status === 'fulfilled').length,
    removed: dead.length,
  });
}
```

---

## 10. Neon 무료(Free) 플랜 한도 — 2026-09-17 기준

| 항목 | Free plan |
|------|-----------|
| 스토리지 | **0.5 GB / 프로젝트** |
| 컴퓨트 | **100 CU-hours / 프로젝트·월** (0.25 CU 기준 약 400시간) |
| 오토스케일 상한 | 최대 2 CU (8 GB RAM) |
| Scale to zero | **5분 비활성 후 자동 정지, 비활성화 불가** |
| 프로젝트 수 | 100 |
| 브랜치 | **10 / 프로젝트** (추가 브랜치 불가) |
| Instant restore | 6시간(최대 1 GB-month), 수동 스냅샷 1개 |
| 네트워크 전송(공용) | 5 GB / 프로젝트 |
| 모니터링 보존 | 1일 |

**6명 앱 관점 해석**
- 구독 행 수십 개 + 알림 시각 수백 개 = 수 MB도 안 된다. **0.5 GB는 전혀 문제가 안 된다.**
- 실질 제약은 **CU-hours**다. 0.25 CU 컴퓨트가 5분 규칙으로 계속 잠들면 실제 과금 시간은 "요청 발생 구간 + 5분"의 합이라 100 CU-hours를 넘기기 어렵다. 반대로 **keep-alive cron을 1분마다 돌리면 컴퓨트가 상시 깨어 있어 한도를 빠르게 소진**한다.
- Preview 브랜치를 남발하면 **브랜치 10개 상한**에 먼저 걸린다. 병합된 PR의 Preview 배포는 정리한다.
- 위 수치는 정책 변경 가능 항목이다. 재사용 시 plans 페이지를 다시 확인한다.

---

## 11. 대안 한 줄 비교 (사용자 6명 기준)

| 저장소 | 이 시나리오 적합도 | 선택 기준 |
|--------|-------------------|-----------|
| **Neon Postgres + Drizzle** | ✅ 기본값 | 관계·유니크 제약·쿼리(“이 시각에 알림 받을 사용자”)가 필요하고, 나중에 기록/통계가 붙을 여지가 있으면 |
| **Upstash Redis(KV)** | ⭕ 가능 | 구독을 `user:{id}:subs` 해시로만 다루고 **조회 패턴이 키 단건**일 때. 무료 티어 256 MB·월 50만 커맨드. 시각 기준 역조회·중복 제약은 직접 구현해야 함 |
| **Vercel Blob** | ❌ 부적합 | 파일(이미지·백업 JSON) 저장용. 행 단위 갱신·조회 대상이 아님 |
| **Vercel Global Config** (구 Edge Config) | ❌ 부적합 | "자주 읽고 드물게 쓰는" **읽기 최적화 설정 저장소**(피처 플래그·리다이렉트·IP 차단). 읽기 P99 15 ms지만 쓰기는 API·변동 지연이라 사용자 구독 데이터처럼 자주 쓰는 용도가 아니다 |

> 판단 규칙: **"시각/사용자 조건으로 검색해야 한다" → Postgres. "키로만 꺼낸다" → Redis. "설정값이다" → Global Config. "파일이다" → Blob.**

---

## 12. 안티패턴

| # | 안티패턴 | 왜 문제인가 | 올바른 방법 |
|---|---------|------------|------------|
| 1 | 요청마다 `new Pool(...)`을 만들고 닫지 않음 | WebSocket 커넥션 누수 → Neon 커넥션 한도 소진 | `neon-http`를 쓰거나, `Pool`은 핸들러 안에서 만들고 `finally`에서 `end()` |
| 2 | `Pool`/`Client`를 **모듈 최상위**에 생성해 요청 간 재사용 | 서버리스에서 WebSocket은 요청 수명을 넘길 수 없음(Neon 공식 경고) | 핸들러 내부 생성·종료. 단, **`neon()`(HTTP) 기반 `db`는 모듈 최상위 1회 생성이 정상**이며 매 요청 재생성이 오히려 낭비 |
| 3 | `neon-http`에서 `db.transaction()` 호출 | `No transactions support in neon-http driver` 런타임 에러 | `db.batch([...])` 또는 `neon-serverless`로 전환 |
| 4 | 런타임 요청 핸들러에서 `migrate()` 실행 | 동시 요청이 같은 DDL을 경쟁 실행, 콜드 스타트 지연, 롤백 불가 | 로컬/CI에서 `drizzle-kit migrate` 별도 실행 |
| 5 | 마이그레이션에 풀드(`-pooler`) 연결 사용 | PgBouncer transaction 모드에서 DDL·세션 의존 작업이 실패할 수 있음(Neon 공식) | `DATABASE_URL_UNPOOLED` 사용 |
| 6 | 프로덕션에서 `drizzle-kit push`로 스키마 반영 | SQL 이력이 남지 않아 리뷰·롤백 불가, 컬럼 rename이 drop+create로 처리되면 데이터 소실 | `generate` → 리뷰 → `migrate` |
| 7 | 연결 문자열·VAPID 키를 코드/리포지토리에 하드코딩 | 시크릿 유출 | 환경변수만 사용, `.env*`는 gitignore, `vercel env pull`로 동기화 |
| 8 | 구독 저장 시 클라이언트가 보낸 `userId`를 그대로 신뢰 | 타인 구독 덮어쓰기·탈취(IDOR) | 서버 세션에서 얻은 `userId`만 사용하고 모든 쿼리를 그 값으로 스코프 |
| 9 | endpoint에 유니크 제약 없이 매번 `insert` | 같은 기기가 재구독할 때마다 중복 행 → 중복 알림 | `endpoint` UNIQUE + `onConflictDoUpdate` |
| 10 | 발송 실패(404/410)를 로그만 남기고 방치 | 죽은 endpoint에 매 cron마다 재시도 → 비용·실패율 누적 | 404/410이면 해당 행 삭제(9-3) |
| 11 | 1분 간격 keep-alive cron으로 Neon을 계속 깨움 | Free 100 CU-hours를 빠르게 소진 | 콜드 스타트 수백 ms를 수용하거나 간격을 충분히 넓힘 |
| 12 | `select()`로 전체 컬럼을 늘 가져옴 | 전송량·네트워크 한도 낭비(특히 키 값은 민감) | 필요한 컬럼만 지정해 select |

---

## 13. 도입 체크리스트

- [ ] Vercel Marketplace에서 Neon 연결 → `DATABASE_URL` / `DATABASE_URL_UNPOOLED` 주입 확인
- [ ] `vercel link` → `vercel env pull .env.local`, `.env*` gitignore 확인
- [ ] `drizzle.config.ts`가 `DATABASE_URL_UNPOOLED`를 보도록 설정
- [ ] `src/db/index.ts`에서 `neon()` + `drizzle({ client })` 모듈 1회 생성
- [ ] `endpoint` UNIQUE, `(user_id, hour, minute)` 복합 UNIQUE, `user_id` 인덱스 적용
- [ ] `db:generate` → 생성 SQL 리뷰 → `db:migrate` (빌드 커맨드 아님)
- [ ] 구독 등록 핸들러: 세션 userId 사용 + 입력 길이·형식 검증 + upsert
- [ ] cron 발송 핸들러: `CRON_SECRET` 검증 + 404/410 endpoint 삭제
- [ ] Neon Free 한도(0.5 GB / 100 CU-hours / 브랜치 10) 기준 운영 계획 확인
