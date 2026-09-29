---
name: vercel-workflow
description: Vercel Workflow SDK(`workflow` 패키지)로 durable 예약 작업을 구현하는 패턴. "use workflow"/"use step" 디렉티브, sleep(Date) 루프, 런 취소·재시작·훅, Hobby 이벤트 한도 계산, Cron Jobs 비교, 사용자별 지정 시각 Web Push 스케줄러 완결 예시를 다룬다.
---

# Vercel Workflow — durable 예약 작업 & 사용자별 시각 Web Push 스케줄러

> 소스:
> - https://vercel.com/docs/workflows (개요·멀티리전·관측성)
> - https://vercel.com/docs/workflows/concepts (디렉티브·sleep·hook·skew protection)
> - https://vercel.com/docs/workflows/pricing (과금·런 한도·보존)
> - https://vercel.com/docs/cron-jobs/usage-and-pricing (Cron 비교 근거)
> - https://workflow-sdk.dev/docs/getting-started/next, /docs/api-reference/workflow, /docs/api-reference/workflow-api,
>   /docs/api-reference/workflow/sleep, /docs/api-reference/workflow-globals, /docs/foundations/workflows-and-steps,
>   /docs/foundations/starting-workflows, /docs/foundations/hooks, /docs/foundations/versioning,
>   /docs/how-it-works/event-sourcing, /docs/observability, /worlds/local,
>   /cookbook/common-patterns/scheduling, /cookbook/advanced/child-workflows, /cookbook/agent-patterns/agent-cancellation
> - https://github.com/vercel/workflow , https://registry.npmjs.org/workflow/latest
>
> 검증일: 2026-09-28 (최초 2026-09-17 · 재검증 09-28: `workflow` npm latest 4.8.9 그대로, Hobby 한도·sleep(Date) API 변경 없음)
> 기준 버전: `workflow` **4.8.9** (npm latest, Apache-2.0). 과금·한도는 Vercel 문서 2026-06-16 갱신본 기준(09-28 재확인, 수치 변경 없음)
> 대상 시나리오: 개인용 PWA에서 **사용자 6명 / 사용자당 하루 최대 5회** 지정 시각에 Web Push를 보내는 스케줄러.
> 사용자마다 워크플로 런 1개가 `다음 시각까지 sleep → 발송 스텝 → 반복` 루프를 돌고, 시각 변경 시 기존 런을 취소하고 재시작한다. **Vercel Hobby(무료)** 운영.

---

## 1. 핵심 개념

Vercel Workflows는 **durable execution**(내구 실행) 프리미티브다. 평범한 async 함수에 디렉티브만 붙이면
진행 상태가 이벤트 로그로 영속되고, 크래시·재배포·수개월 대기를 건너 정확히 멈춘 지점부터 재개된다.
2026-04-21 GA. 오픈소스 [Workflow SDK](https://workflow-sdk.dev)(`workflow` 패키지) 위에 Vercel이
Functions(실행) + Queues(디스패치) + 관리형 영속성(상태·이벤트 로그)을 붙인 형태다.

| 추상 | 디렉티브/API | 역할 |
|------|--------------|------|
| **Workflow** | `'use workflow'` | 상태를 가진 오케스트레이터. 결정론적으로 **리플레이**되며 진행을 기억 |
| **Step** | `'use step'` | 부수효과 1단위. 자동 재시도, 결과가 이벤트 로그에 기록되어 재실행되지 않음 |
| **Sleep** | `sleep()` | 컴퓨트를 소비하지 않고 일시정지 |
| **Hook** | `createHook()` / `defineHook()` | 외부 이벤트(웹훅·사용자 액션)를 기다렸다 재개 |

```ts
// workflows/example.ts
export async function aiContentWorkflow(topic: string) {
  'use workflow';
  const draft = await generateDraft(topic);   // 스텝 호출
  const summary = await summarizeDraft(draft);
  return { draft, summary };
}

// steps/generate-draft.ts
async function generateDraft(topic: string) {
  'use step';                                  // 실패 시 자동 재시도(기본 최대 3회)
  return await aiGenerate({ prompt: `Write about ${topic}` });
}
```

### 1-1. 리플레이 & 결정론 — 실제 규칙

워크플로 본문은 **샌드박스**에서 여러 번 리플레이된다. 그래서 다음처럼 동작한다.

**결정론이 보장되는(패치된) 전역** — 워크플로 본문에서 그대로 써도 리플레이마다 같은 값:
- `Math.random()` — 시드 기반 (런마다 같은 시퀀스)
- `Date` / `Date.now()` / `new Date()` — 워크플로의 **논리 시계**를 따르는 고정 타임스탬프
- `crypto.randomUUID()`, `crypto.getRandomValues()` — 시드 기반
- `Headers`, `URL`, `TextEncoder`, `structuredClone`, `console`, `atob/btoa` 등 Web 표준 API
- `process.env` — 읽기 전용 동결 스냅샷

**워크플로 본문에서 던지는(금지된) 것**:
- Node core 모듈 (`fs`, `path`, `http`, `net`, `child_process` …)
- `setTimeout` / `setInterval` / `setImmediate` → **`sleep()`을 쓸 것**
- 전역 `fetch` → `import { fetch } from 'workflow'` 사용
- `Buffer` → `Uint8Array` + `toBase64()/toHex()`

> 즉 "워크플로 본문에서 `Date.now()`를 쓰면 안 된다"는 Temporal식 통념은 **이 SDK에는 그대로 적용되지 않는다**
> (논리 시계로 패치됨). 다만 DB·네트워크·타임존 데이터베이스(`Intl`)에 의존하는 계산은 **스텝 안에서** 하는 것이 안전하다.
> `Intl`은 위 전역 목록에 명시되어 있지 않다.
> 스텝 인자는 **pass-by-value**다. 스텝 안에서 객체를 mutate해도 워크플로 쪽에 반영되지 않으니 반드시 **반환**하라.

### 1-2. 런타임 / Next.js App Router 통합

```bash
npm i workflow          # 또는 pnpm i workflow
```

```ts
// next.config.ts
import { withWorkflow } from 'workflow/next';

export default withWorkflow(nextConfig);
```

- 빌드 시 `app/.well-known/workflow/`(src 구조면 `src/app/.well-known/workflow/`) 아래에 라우트가 생성된다.
  미들웨어/프록시 `matcher`에서 **`.well-known/workflow/*`를 반드시 제외**할 것.
- 워크플로·스텝은 각각 **Vercel Function(Node.js 런타임)** 으로 컴파일된다. Vercel은 Workflow에
  **Fluid compute** 사용을 권장한다(비용·성능). 스텝 1개의 최대 실행 시간은 Functions 한도를 따른다.
- 리전: 런은 시작한 함수의 리전에 **핀 고정**된다. 멀티리전은 `workflow` **5.0.0-beta.33+** 필요이며,
  **4.x 계열 런은 항상 `iad1`에 저장**된다(스텝 실행은 배포된 가장 가까운 리전).
- 트리거는 Route Handler에서 `start()`:

```ts
// app/api/signup/route.ts
import { start } from 'workflow/api';
import { handleUserSignup } from '@/workflows/user-signup';

export async function POST(req: Request) {
  const { email } = await req.json();
  const run = await start(handleUserSignup, [email]);   // 큐에 넣고 즉시 반환
  return Response.json({ runId: run.runId });
}
```

---

## 2. `sleep()` — 시그니처·한도·과금

```ts
import { sleep } from 'workflow';

await sleep('7 days');                    // 기간 문자열: '30s', '10m', '1d', '7 days'
await sleep(60_000);                      // 밀리초 숫자
await sleep(new Date('2026-09-18T07:30:00+09:00'));  // 절대 시각까지 대기
```

> **주의 (정정):** 이 SDK에는 **`sleepUntil()`이라는 별도 함수가 없다.** 절대 시각 대기는
> `sleep(date)` 오버로드로 표현한다. 다른 durable 엔진(Temporal·Mastra 등)의 `sleepUntil` API와 혼동하지 말 것.

| 항목 | 값 | 근거 |
|------|-----|------|
| 최대 `sleep` 지속시간 | **제한 없음** | Workflow Pricing/Limits 표 |
| 최대 런 지속시간 | **제한 없음** | 동 표 |
| 잠든 동안 컴퓨트 과금 | **없음** (함수가 떠 있지 않음) | "pauses … without consuming compute resources" |
| 잠든 동안 발생하는 과금 | 이벤트 2개(`wait_created`·`wait_completed`) + 그 이벤트의 Data Written | Event sourcing 문서 |
| 워크플로 1회 리플레이 최대 소요 | **240초** (초과 시 런 중단 가능) | 동 표 |

`sleep`은 "특별한 스텝 함수"라서 **워크플로 함수 안에서 직접 호출**해야 한다(다른 함수로 감싸 호출 금지).

---

## 3. 런 제어 API — 조회·취소·조기 기상·훅

### 3-1. `start()` / `getRun()`

```ts
import { start, getRun, resumeHook, getHookByToken } from 'workflow/api';

const run = await start(myWorkflow, [arg1, arg2], { deploymentId: 'latest' });
run.runId;                       // 식별자 — DB에 보관해야 나중에 취소 가능
await run.returnValue;           // 완료까지 폴링 (취소되면 WorkflowRunCancelledError)

const r = getRun(runId);         // runId만으로 핸들 획득 (비즈니스 키 조회 아님)
await r.exists;                  // boolean (throw 안 함)
await r.status;                  // 현재 상태
await r.cancel();                // 즉시 종료 — 대기자는 WorkflowRunCancelledError 수신
await r.wakeUp();                // 대기 중인 sleep 중단 → 조기 재개 (StopSleepOptions.correlationIds)
r.getReadable();                 // WorkflowReadableStream
```

- **`cancel()`은 하드 종료다.** 정리(cleanup) 코드가 돌지 않고, 스트리밍 클라이언트에 최종 통지도 없다.
- `start()`의 옵션 `deploymentId`는 `'latest'` 또는 커스텀 ID. 대시보드/CLI에서도 런을 취소할 수 있다.
- `getRun()`은 **runId가 반드시 있어야 한다.** 멱등 재시도용 "업무 키 조회"가 필요하면 `getHookByToken()`을 쓴다.

### 3-2. Hook — 실행 중인 런에 신호 보내기

```ts
// workflows/hooks.ts
import { defineHook } from 'workflow';
import { z } from 'zod';

export const scheduleHook = defineHook({
  schema: z.object({ kind: z.enum(['reschedule', 'stop']) }),   // Standard Schema v1 (zod/valibot)
});

// 워크플로 안 — 토큰은 결정론적으로
using hook = scheduleHook.create({ token: `sched:${userId}:${gen}:${i}` });
const payload = await hook;                 // 단일 수신
// for await (const p of hook) { ... }      // 다중 수신

// 외부(Route Handler)에서 재개
import { resumeHook } from 'workflow/api';
await resumeHook(token, { kind: 'reschedule' });
// 또는 타입 안전 래퍼: await scheduleHook.resume(token, { kind: 'reschedule' })
```

`sleep`과 훅을 **경합**시키면 "취소 없이 중간에 깨우는" 스케줄러가 된다:

```ts
const cancelled = await Promise.race([
  sleep('2d').then(() => false),
  hook.then(() => true),
]);
```

---

## 4. 한도 & Hobby 이벤트 예산 계산

### 4-1. 런 한도 (전 플랜 공통)

| 한도 | 값 |
|------|-----|
| 런당 이벤트 | **25,000** (상향은 문의) |
| 런당 스텝 | **10,000** |
| 런당 초당 이벤트 생성 | 200 (초과 시 throttle + 재시도) |
| 초당 런 생성 | 1,000 |
| 최대 페이로드(런/스텝/훅 입출력) | 50 MB |
| 런당 총 엔티티 저장 | 2 GB |
| 워크플로 리플레이 1회 최대 | 240초 |
| 런 지속시간 / `sleep` 지속시간 | 제한 없음 |
| 런당 attribute | 64개 (`setAttributes` 1회 쓰기 8 KiB) |

> **성능 권고:** 런이 **2,000 이벤트 또는 1 GB**를 넘기면 리플레이가 느려진다.
> 공식 권고는 **자식 워크플로로 쪼개기**. → 무한 루프 런은 **N회마다 새 런으로 회전**시켜야 한다.

### 4-2. Hobby 무료 한도 & 보존

| 리소스 | Hobby 포함량 | 초과 단가 |
|--------|--------------|-----------|
| Workflow Events | **50,000 events / 월** | $0.02 / 1K events |
| Workflow Data Written | **1 GB** | $0.50 / GB |
| Workflow Data Retained | **Hobby 미제공** | $0.50 / GB-month (Pro) |

| 플랜 | 런 완료 후 보존 |
|------|------------------|
| Hobby | **1일** |
| Pro | 7일 |
| Enterprise | 30일 |

요청 레이트 리밋: Hobby **100,000 req/분**. 초과해도 백오프 재시도되므로 런이 실패하진 않고 느려질 뿐이다.
스텝이 호출하는 Function 실행 비용과 Queues 사용량은 **별도 과금 지표**로 청구된다.

### 4-3. 이벤트 종류

| 그룹 | 이벤트 |
|------|--------|
| 런 | `run_created`, `run_started`, `run_completed`, `run_failed`, `run_cancelled` |
| 스텝 | `step_created`, `step_started`, `step_completed`, `step_failed`, `step_retrying` |
| 훅 | `hook_created`, `hook_conflict`, `hook_received`, `hook_disposed` |
| 대기(sleep) | `wait_created`, `wait_completed` |

**개수:** 정상 스텝 = 3개 / `sleep` = 2개 / 훅 = `hook_created` + 수신 n + `hook_disposed`.

### 4-4. 대상 시나리오 예산 계산 (사용자 6명 × 하루 5회)

루프 1회(= 알림 1건) 구성: `getNextFireAt` 스텝(3) + `sleep`(2) + `sendScheduledPush` 스텝(3) = **8 이벤트**

```
1일  = 6명 × 5회 × 8 = 240 이벤트
30일 = 7,200 이벤트  (+ 런 회전 오버헤드 ≈ 6명 × 6 ≈ 36)
→ 약 7,250 / 50,000 = 14.5%  ✅ Hobby 무료 범위
```

**런 회전(무한 루프 방지) 필요 여부 — 필요하다.**

```
2,000 이벤트(성능 권고선) ÷ 8 = 250회 반복 ≈ 50일
25,000 이벤트(하드 한도) ÷ 8 = 3,125회 반복 ≈ 625일
```

→ `MAX_ITERATIONS = 150`(하루 5회 기준 **약 30일**, 약 1,200 이벤트)에서 새 런으로 갈아타면
성능 권고선 아래를 유지하면서 **배포 핀 고정 문제까지 동시에 해결**된다(§7-a `rotateScheduler`).

훅 경합(§7-d)을 쓰면 루프당 훅 2 + 토큰 게시 스텝 3 = **+5 이벤트/회**(총 13) → 월 약 11,700 (23.4%). 여전히 무료 범위.

> 참고: 사용자가 60명으로 늘어도 월 72,500 이벤트 → Hobby 초과. 규모가 커지면 Pro 전환 또는
> "사용자별 런" 대신 "시간 슬롯별 런"(같은 시각 사용자를 한 런에서 배치 발송)으로 모델을 바꿔야 한다.

---

## 5. 로컬 개발 & 관찰 도구

- 프레임워크 dev 서버(`npm run dev` = `next dev`)만 띄우면 **Local World**가 자동 선택된다(설정 0).
  Vercel에 배포하면 자동으로 **Vercel World**로 전환된다.
- Local World는 이벤트를 **JSON 파일**로 저장한다. 기본 `.workflow-data/`
  (Next.js 프로젝트에서는 `.next/workflow-data/`로 안내되기도 한다). `WORKFLOW_LOCAL_DATA_DIR`로 변경 가능.
- **Local World 한계:** 큐가 **인메모리** → 서버 재시작 시 대기 중 작업 유실, 단일 인스턴스 전용, 인증 없음. **프로덕션 금지.**
  → 로컬에서 `sleep(new Date(내일 07:30))`을 검증하려면 `sleep('10s')`로 줄이거나 `getRun(id).wakeUp()`으로 깨워라.

관찰 CLI:

```bash
npx workflow inspect --help
npx workflow inspect runs              # 최근 런 목록
npx workflow inspect runs --web        # 로컬 Web UI
npx workflow inspect run <run_id>      # 단일 런 상세
npx workflow inspect run <run_id> --url
# 플래그: --json  --backend vercel  --decrypt  --env preview
```

배포 후에는 Vercel 대시보드 → **Observability → Workflows**에서 런·트레이스·취소가 가능하다.
Vercel의 런 데이터는 **종단 암호화**되어 있어 `--decrypt`(또는 UI의 Decrypt)로만 값이 보인다.
팀 소유자가 아닌 멤버에게는 **Workflow Run Data Viewer** 확장 권한이 필요하다.

> 주의: `npx workflow web` / `npx workflow cancel <run_id>` / `npx workflow health` 형태의 명령이
> 커뮤니티 자료에 등장하지만 **공식 CLI 레퍼런스 페이지에서 직접 확인하지 못했다(미검증).**
> 실제 설치 버전에서 `npx workflow --help`로 확인하라. 취소는 `getRun(id).cancel()` 또는 대시보드가 확실한 경로다.
> `vercel dev`에서의 동작도 공식 문서에 명시가 없다 — 문서화된 경로는 **프레임워크 dev 서버**다.

---

## 6. Vercel Cron Jobs와의 비교 — 왜 이 시나리오엔 Workflow인가

| | **Vercel Cron (Hobby)** | **Vercel Workflows** | **외부 스케줄러(cron-job.org 등)** |
|---|---|---|---|
| 최소 간격 | **하루 1회** (더 잦은 표현식은 배포 실패) | 제한 없음 (`sleep` 임의 시각) | 대개 1분 |
| 타이밍 정밀도 | **시간 단위 ±59분** (`0 1 * * *` → 01:00~01:59 임의) | 지정 시각에 만료 후 큐 디스패치 | 분 단위 |
| 프로젝트당 개수 | 100개 | 스케줄/크론 제한 없음 | 무료 플랜별 상이 |
| 사용자별 개별 시각 | ❌ (크론 1개 + 폴링 필요, 그런데 Hobby는 하루 1회) | ✅ 런 1개 = 사용자 1명 | 폴링 엔드포인트 직접 구현 |
| 상태·재시도 | 직접 구현 | 내장(이벤트 로그·자동 재시도·재개) | 직접 구현 |
| 과금 | Functions 과금만 | Events + Data Written + Functions/Queues | 외부 서비스 + Functions |

**결론:** Hobby 크론은 하루 1회 · ±59분이라 "사용자가 지정한 07:30에 알림"을 **구조적으로 만족할 수 없다.**
Pro(분 단위 크론)로 올려 1분마다 폴링하는 방식도 가능하지만, 월 43,200회 함수 호출을 태우고
실제 발송은 하루 30건뿐이라 낭비가 크다. Workflow는 **지정 시각까지 컴퓨트 0으로 잠들었다가 깨는** 모델이라
호출 수가 실제 알림 건수에 비례한다.

외부 스케줄러(cron-job.org 등 무료 HTTP 크론) + Vercel Route Handler 폴링도 Hobby 우회책이지만,
서드파티 가용성 의존 · 엔드포인트 인증(시크릿 헤더) · 중복 방지 · 상태 보관을 전부 직접 만들어야 한다.

**Workflow를 쓰지 말아야 할 때:** 초 단위 정밀 스케줄(재개 지연 상한이 공식 수치로 명시되어 있지 않음),
대상이 수만 명이어서 동시 런·이벤트가 폭증하는 경우, 이미 Pro에서 분 단위 크론 + 배치 조회로 충분한 경우.

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
