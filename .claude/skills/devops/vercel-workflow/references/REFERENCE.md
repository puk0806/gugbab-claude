## 7. 완결 예시 — 사용자별 지정 시각 Web Push 스케줄러

### 7-c. 타임존(Asia/Seoul) 다음 발송 시각 계산 유틸

> 스텝(Node.js 런타임)에서 호출한다. `Intl`은 워크플로 샌드박스 전역 목록에 없으므로 **워크플로 본문에서 직접 부르지 말 것.**

```ts
// lib/next-fire-time.ts
type Parts = { y: number; m: number; d: number; h: number; min: number; s: number };

function tzParts(date: Date, tz: string): Parts {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const p = Object.fromEntries(dtf.formatToParts(date).map((x) => [x.type, x.value]));
  return {
    y: +p.year, m: +p.month, d: +p.day,
    h: +p.hour % 24,            // en-US hour12:false는 24를 낼 수 있다
    min: +p.minute, s: +p.second,
  };
}

/** 해당 tz의 "벽시계 시각"을 실제 UTC 인스턴트로 변환 (DST 전환 포함 2회 보정) */
function wallTimeToUtc(y: number, m: number, d: number, h: number, min: number, tz: string): Date {
  const guess = Date.UTC(y, m - 1, d, h, min, 0);
  const off1 = tzOffset(new Date(guess), tz);
  const off2 = tzOffset(new Date(guess - off1), tz);
  return new Date(guess - off2);
}

/** tz 오프셋(ms) = 해당 tz의 벽시계를 UTC로 읽은 값 − 실제 UTC (KST면 +9h) */
function tzOffset(utc: Date, tz: string): number {
  const p = tzParts(utc, tz);
  const asIfUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s);
  return asIfUtc - (utc.getTime() - utc.getUTCMilliseconds());
}

/**
 * slots: 'HH:mm' 문자열 배열(사용자 지정, 최대 5개). now 이후 가장 이른 발송 시각을 반환.
 * 오늘 남은 슬롯이 없으면 내일 첫 슬롯.
 */
export function nextFireAt(slots: string[], now: Date = new Date(), tz = 'Asia/Seoul'): Date | null {
  if (slots.length === 0) return null;
  const today = tzParts(now, tz);

  const candidates: Date[] = [];
  for (const dayOffset of [0, 1]) {
    // 월/연 롤오버는 Date.UTC 정규화에 위임
    const base = new Date(Date.UTC(today.y, today.m - 1, today.d + dayOffset));
    for (const slot of slots) {
      const [h, min] = slot.split(':').map(Number);
      if (!Number.isInteger(h) || !Number.isInteger(min) || h > 23 || min > 59) {
        throw new Error(`invalid slot: ${slot}`);        // 악성/오염 입력 차단
      }
      candidates.push(
        wallTimeToUtc(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(), h, min, tz),
      );
    }
  }

  const future = candidates
    .filter((d) => d.getTime() > now.getTime())
    .sort((a, b) => a.getTime() - b.getTime());
  return future[0] ?? null;
}
```

### 7-a. 워크플로 + 스텝 (sleep 루프 → 발송 → 회전)

```ts
// workflows/push-scheduler.ts
import { sleep } from 'workflow';
import { getNextFireAt, sendScheduledPush, rotateScheduler } from './push-scheduler.steps';

// 하루 5회 기준 ≈ 30일. 8 events/회 × 150 ≈ 1,200 events → 2,000 권고선 아래 유지
const MAX_ITERATIONS = 150;

export async function pushScheduler(userId: string, generation: number) {
  'use workflow';

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const next = await getNextFireAt(userId);                 // 스텝: DB + Intl 계산
    if (!next) return { userId, generation, reason: 'no-slots' as const };

    await sleep(new Date(next.at));                           // 절대 시각까지 컴퓨트 0으로 대기
    await sendScheduledPush(userId, next.at);                 // 스텝: 멱등 발송
  }

  await rotateScheduler(userId, generation);                  // 새 런으로 갈아타기
  return { userId, generation, reason: 'rotated' as const };
}
```

```ts
// workflows/push-scheduler.steps.ts
import { start, getRun } from 'workflow/api';
import webpush from 'web-push';
import { db } from '@/lib/db';
import { nextFireAt } from '@/lib/next-fire-time';
import { pushScheduler } from './push-scheduler';

export async function getNextFireAt(userId: string) {
  'use step';
  const slots = await db.getSlots(userId);              // 예: ['07:30','12:00','18:00'] (최대 5개)
  const at = nextFireAt(slots, new Date(), 'Asia/Seoul');
  return at ? { at: at.toISOString() } : null;          // 직렬화 가능한 값만 반환
}

export async function sendScheduledPush(userId: string, slotAt: string) {
  'use step';                                            // 실패 시 기본 최대 3회 재시도
  // 멱등성: 같은 (userId, slotAt)은 취소·재시작·재시도가 겹쳐도 1회만 발송
  const claimed = await db.claimDelivery(`${userId}:${slotAt}`);   // INSERT ... ON CONFLICT DO NOTHING
  if (!claimed) return { skipped: true as const };

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,        // 'mailto:...' 또는 'https://...' (localhost placeholder 금지)
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  const subs = await db.getSubscriptions(userId);
  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        sub.raw,
        JSON.stringify({ title: '알림', body: '예약된 알림입니다', tag: `${userId}:${slotAt}` }),
        { TTL: 3600, urgency: 'high' },
      );
      sent++;
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await db.deleteSubscription(sub.id);   // 만료·해지된 구독 — 재시도해도 영구 실패
        continue;
      }
      throw err;                               // 그 외(5xx·네트워크)는 스텝 자동 재시도에 맡김
    }
  }
  return { skipped: false as const, sent };
}

export async function rotateScheduler(userId: string, generation: number) {
  'use step';                                   // ⚠️ start()는 워크플로 본문이 아니라 스텝에서 호출해야 한다(v4)
  const run = await start(pushScheduler, [userId, generation + 1], { deploymentId: 'latest' });

  // CAS: 회전 중 사용자가 시각을 바꿔 새 런이 이미 등록됐다면 방금 만든 런을 폐기
  const swapped = await db.replaceRun(userId, {
    expectGeneration: generation,
    runId: run.runId,
    generation: generation + 1,
  });
  if (!swapped) await getRun(run.runId).cancel();
  return { runId: run.runId, swapped };
}
```

### 7-b. 시각 변경 시 취소·재시작 Route Handler

```ts
// app/api/schedule/route.ts
import { start, getRun } from 'workflow/api';
import { z } from 'zod';
import { pushScheduler } from '@/workflows/push-scheduler';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';

const Body = z.object({
  slots: z.array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/))
    .max(5)                       // 하루 최대 5회 — 이벤트 예산 보호
    .transform((s) => [...new Set(s)].sort()),
});

export async function PUT(req: Request) {
  const user = await requireUser(req);                 // 비로그인 401 / 타인 리소스 403
  const { slots } = Body.parse(await req.json());      // 형식·개수 위반은 여기서 거부

  await db.setSlots(user.id, slots);

  const current = await db.getRunRecord(user.id);      // { runId, generation } | null
  const prevGeneration = current?.generation ?? 0;
  const generation = prevGeneration + 1;

  // 순서 주의: ① 새 런 시작 → ② DB CAS 교체 → ③ 옛 런 취소
  //   취소를 먼저 하면 start() 실패 시 스케줄러가 통째로 사라진다.
  //   ①~③ 사이 짧은 중복 구간은 sendScheduledPush의 멱등 키가 막는다.
  const run = await start(pushScheduler, [user.id, generation], { deploymentId: 'latest' });

  const swapped = await db.replaceRun(user.id, {
    expectGeneration: prevGeneration,
    runId: run.runId,
    generation,
  });
  if (!swapped) {
    await getRun(run.runId).cancel();                  // 동시 요청이 이겼다 — 내 런 폐기
    return Response.json({ ok: true, runId: current?.runId ?? null });
  }

  if (current?.runId && (await getRun(current.runId).exists)) {
    await getRun(current.runId).cancel();              // 옛 런 정리 — 안 하면 중복 발송
  }
  return Response.json({ ok: true, runId: run.runId });
}
```

### 7-d. (확장) 취소 없이 재스케줄 — hook + `Promise.race`

취소·재시작은 단순하지만 매번 런이 새로 생긴다. 훅을 `sleep`과 경합시키면 **같은 런에서** 시각 변경을 흡수할 수 있다.

```ts
// 워크플로 루프 안
using hook = scheduleHook.create({ token: `sched:${userId}:${generation}:${i}` });
await publishWaitToken(userId, `sched:${userId}:${generation}:${i}`);   // 스텝: 라우트가 읽을 수 있게 게시

const signal = await Promise.race([
  sleep(new Date(next.at)).then(() => 'fire' as const),
  hook.then((p) => p.kind),                                            // 'reschedule' | 'stop'
]);

if (signal === 'stop') return { userId, reason: 'stopped' as const };
if (signal === 'reschedule') continue;                                 // 다음 루프에서 시각 재계산
await sendScheduledPush(userId, next.at);
```

라우트는 `db.getWaitToken(userId)`로 토큰을 읽어 `resumeHook(token, { kind: 'reschedule' })`만 호출하면 된다.
비용은 루프당 +5 이벤트(§4-4). 세 번째 선택지로 `getRun(runId).wakeUp()`이 있으나 공식 문서는 이를
테스트·커스텀 UI 용도로 소개한다.

---

## 8. 안티패턴

| # | 안티패턴 | 왜 문제인가 | 올바른 방법 |
|---|----------|-------------|-------------|
| 1 | 워크플로 본문에서 DB 조회·`fetch`·web-push 발송 | 리플레이마다 재실행 + 전역 `fetch`·Node 모듈은 **throw**됨 | 모든 부수효과를 `'use step'` 함수로 |
| 2 | `setTimeout`/`setInterval`로 대기 | 워크플로 샌드박스에서 **throw** | `sleep(ms \| '1d' \| Date)` |
| 3 | 워크플로 본문에서 `Intl`/타임존 계산 | 패치 전역 목록에 없음 — 동작 보장 안 됨 | 스텝에서 계산 후 ISO 문자열 반환 → `sleep(new Date(at))` |
| 4 | `sleepUntil()`을 찾아 씀 | **존재하지 않는 API** | `sleep(date)` 오버로드 |
| 5 | 워크플로 본문에서 `start()` 직접 호출 | v4에서 금지 | `'use step'` 래퍼 안에서 호출, 워크플로 참조는 스텝에 고정(인자로 넘기지 말 것) |
| 6 | 취소 없이 새 런만 시작 | 옛 런이 계속 잠들어 있다가 **중복 발송** | `getRun(oldRunId).cancel()` + runId를 DB에 보관 |
| 7 | 취소가 항상 성공한다고 가정 | 취소·시작 사이 경합, 하드 취소는 cleanup 미실행 | 발송 스텝에 **멱등 키**(`userId:slotAt`) + DB CAS(generation) |
| 8 | 한 런에서 무한 루프 | 2,000 이벤트 초과 시 리플레이 저하, 25,000에서 하드 한도 | `MAX_ITERATIONS` 후 `start(..., { deploymentId: 'latest' })`로 회전 |
| 9 | 잠든 런 수를 관리하지 않음 | 사용자·재시도마다 런이 쌓여 이벤트 예산 잠식 | 사용자당 활성 런 1개를 DB로 단일화, 고아 런은 대시보드/CLI로 정리 |
| 10 | 재배포하면 로직이 바뀐다고 가정 | 런은 **시작 배포에 핀 고정** — 롤백해도 옛 배포에서 계속 재시도됨 | 회전/재시작 시 `deploymentId: 'latest'`, 불필요한 런은 명시 취소 |
| 11 | 이벤트 한도를 계산하지 않고 사용자 확장 | Hobby 50,000/월을 조용히 초과 | §4-4 공식으로 사전 계산, 규모 커지면 "시간 슬롯별 배치 런"으로 모델 변경 |
| 12 | 스텝 인자 객체를 mutate하고 워크플로에서 읽음 | pass-by-value — 변경이 보이지 않음 | 수정 결과를 **반환** |
| 13 | 모든 예외를 스텝에서 그대로 throw | 404/410(구독 만료)까지 3회 재시도 → 낭비·지연 | 영구 실패는 구독 삭제 후 continue(또는 `FatalError`), 일시 오류만 재시도/`RetryableError` |
| 14 | Hobby에서 런 로그를 감사 기록으로 사용 | 완료 후 **1일** 보존 | 필요한 결과는 자체 DB에 기록 |
| 15 | 미들웨어 matcher에서 `.well-known/workflow/*` 미제외 | 워크플로 라우트가 인증 미들웨어에 가로채여 런이 진행되지 않음 | matcher에서 명시 제외 |
| 16 | Local World를 프로덕션처럼 신뢰 | 인메모리 큐 — dev 서버 재시작 시 대기 작업 유실, 인증 없음 | 로컬은 짧은 `sleep`·`wakeUp()`으로 검증, 실제 검증은 프리뷰 배포에서 |

---

## 9. 체크리스트

- [ ] `next.config.ts`에 `withWorkflow` 적용 / 미들웨어 matcher에서 `.well-known/workflow/*` 제외
- [ ] 모든 I/O가 `'use step'` 안에 있는가
- [ ] `sleep`은 워크플로 본문에서 **직접** 호출하는가 (래핑 금지)
- [ ] 발송 스텝에 멱등 키가 있는가 (취소·재시도·경합에도 1회 발송)
- [ ] 사용자당 활성 runId를 DB에 보관하고, 재설정 시 **새 런 시작 → CAS → 옛 런 취소** 순서를 지키는가
- [ ] `MAX_ITERATIONS` 회전 + `deploymentId: 'latest'`로 배포 핀 고정을 끊는가
- [ ] 월 이벤트 예산을 계산했는가 (`사용자수 × 하루횟수 × 8 × 30`)
- [ ] 입력 검증: 슬롯 개수 상한·`HH:mm` 정규식·인증/인가 (타인 스케줄 변경 차단)
