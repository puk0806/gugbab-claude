---
name: vercel-workflow
description: Vercel Workflow SDK(`workflow` 5.x) 최신 기준·함정 — v5 변경점(start() 본문 호출·멀티리전 기본·MAX_EVENTS_EXCEEDED·cancelReason·Date() 문자열), 결정론 패치 전역과 금지 API, sleepUntil 없음(sleep(Date)), 런 한도·Hobby 이벤트 예산(50,000/월)·보존·레이트 리밋, 런 회전·배포 핀 고정, 취소 순서와 멱등 키, Hobby Cron(하루 1회·±59분) 대비 사용자별 예약 Web Push
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
> - https://vercel.com/docs/workflows/retention , 패키지 동봉 문서 `docs/whats-new.mdx`(v5 변경점)
>
> 검증일: 2026-11-09 (최초 2026-09-17 · 재검증 09-28 · 11-09: `workflow` npm latest **5.4.0**(2026-11-04)으로 메이저 상승, Hobby 요청 레이트 리밋 100,000→50,000 req/분 정정)
> 기준 버전: `workflow` **5.4.0** (npm latest, Apache-2.0. 5.0.0 GA 2026-09-30). 4.x 는 `workflow@4`(dist-tag `previous` = 4.8.16)로 계속 설치 가능·안정성 수정만.
> 과금·한도는 Vercel Workflow Pricing 문서 2026-09-16 갱신본 기준(11-09 확인).
>
> 대상 시나리오: 개인용 PWA에서 **사용자 6명 / 사용자당 하루 최대 5회** 지정 시각에 Web Push를 보내는 스케줄러.
> 사용자마다 워크플로 런 1개가 `다음 시각까지 sleep → 발송 스텝 → 반복` 루프를 돌고, 시각 변경 시 기존 런을 취소하고 재시작한다. **Vercel Hobby(무료)** 운영.

---

## 이 스킬의 범위

SDK 버전별 변경점, 리플레이 결정론 규칙, 한도·과금 수치, 예약 스케줄러 설계의 함정만 싣는다.
> 기본 사용법(`'use workflow'`/`'use step'` 예제, `withWorkflow` 설정, `start()` Route Handler, defineHook 기본 코드, 완결 스케줄러 코드)은 공식 문서 수준이라 싣지 않는다.

---

## 1. v4 → v5 변경점 (공식 "What's new in v5")

- 앱 코드 모델(디렉티브·`sleep`·`start`·훅)은 그대로. `runStep` 제거, `experimental_setAttributes` → `setAttributes`, `getHookByToken()`/`resumeHook()` 결과의 `hook.metadata` 가 Promise
- **`start()` 를 워크플로 본문에서 직접 호출 가능**(내부적으로 스텝으로 기록). v4 에서는 스텝 안에서만 가능했다
- **멀티리전 기본**: 런은 시작한 함수의 리전에 자동 핀 고정, `start(..., { region })` 로 지정 가능(그 리전에 앱도 배포돼 있어야 스텝이 리전 내 실행). 4.x 런은 계속 `iad1`
- 런당 이벤트 한도(25,000)를 런타임이 **강제** → 초과 시 `MAX_EVENTS_EXCEEDED` 로 런 실패 (런 회전이 더 중요해짐)
- 워크플로 본문에서 `new` 없는 `Date()` 는 문자열을 반환(사양대로) — `new Date()` 를 쓸 것
- `run.cancel({ cancelReason })` 지원(사유가 취소 이벤트·대시보드에 기록), CLI `workflow cancel <run_id>`(필터 일괄 취소 — `--status pending|running` 또는 `--workflowName` 필수, 1회 최대 100건)·`workflow web`·`workflow health` 공식화
- 업그레이드해도 진행 중인 4.x 런은 자신을 만든 배포에서 계속 실행된다(마이그레이션되지 않음)

- 2026-04-21 GA. Workflow SDK 위에 Vercel이 Functions(실행) + Queues(디스패치) + 관리형 영속성을 붙인 형태. 워크플로·스텝은 각각 Vercel Function(Node.js)으로 컴파일, **Fluid compute** 권장. 스텝 1개 최대 실행 시간은 Functions 한도.
- 빌드 시 `app/.well-known/workflow/`(src 구조면 `src/app/...`)에 라우트 생성 → 미들웨어/프록시 **matcher에서 `.well-known/workflow/*`를 반드시 제외**(안 하면 인증 미들웨어에 가로채여 런이 진행되지 않음).

---

## 2. 리플레이 결정론 — 실제 규칙

워크플로 본문은 **샌드박스**에서 여러 번 리플레이된다.

**결정론이 보장되는(패치된) 전역** — 본문에서 그대로 써도 리플레이마다 같은 값:
- `Math.random()`, `crypto.randomUUID()`, `crypto.getRandomValues()` — 시드 기반
- `Date` / `Date.now()` / `new Date()` — 워크플로의 **논리 시계**를 따르는 고정 타임스탬프
- `Headers`, `URL`, `TextEncoder`, `structuredClone`, `console`, `atob/btoa` 등 Web 표준 API
- `process.env` — 읽기 전용 동결 스냅샷

**본문에서 던지는(금지된) 것**: Node core 모듈(`fs`, `path`, `http`, `net`, `child_process` …), `setTimeout`/`setInterval`/`setImmediate`(→ `sleep()`), 전역 `fetch`(→ `import { fetch } from 'workflow'`), `Buffer`(→ `Uint8Array` + `toBase64()/toHex()`).

> 즉 "워크플로 본문에서 `Date.now()`를 쓰면 안 된다"는 Temporal식 통념은 **이 SDK에는 그대로 적용되지 않는다**
> (논리 시계로 패치됨). 다만 DB·네트워크·타임존 데이터베이스(`Intl`)에 의존하는 계산은 **스텝 안에서** 하는 것이 안전하다.
> `Intl`은 위 전역 목록에 명시되어 있지 않다.
> 스텝 인자는 **pass-by-value**다. 스텝 안에서 객체를 mutate해도 워크플로 쪽에 반영되지 않으니 반드시 **반환**하라.

- 스텝은 실패 시 자동 재시도(기본 최대 3회). 영구 실패는 `FatalError`, 일시 오류는 `RetryableError`.

---

## 3. `sleep()` 과 런 제어

> **주의 (정정):** 이 SDK에는 **`sleepUntil()`이라는 별도 함수가 없다.** 절대 시각 대기는
> `sleep(date)` 오버로드로 표현한다(`sleep('7 days')`·`sleep(60_000)`·`sleep(new Date(...))`). 다른 durable 엔진(Temporal·Mastra 등)의 `sleepUntil` API와 혼동하지 말 것.

| 항목 | 값 |
|------|-----|
| 최대 `sleep` / 런 지속시간 | **제한 없음** |
| 잠든 동안 컴퓨트 과금 | **없음** — 이벤트 2개(`wait_created`·`wait_completed`) + 그 Data Written만 |
| 워크플로 1회 리플레이 최대 | **240초** (초과 시 런 중단 가능) |

- `sleep`은 "특별한 스텝 함수"라 **워크플로 함수 안에서 직접 호출**해야 한다(다른 함수로 감싸 호출 금지).
- `getRun(runId)`은 **runId가 반드시 필요**(업무 키 조회 아님 — 그건 `getHookByToken()`). `r.exists`는 throw 안 하는 boolean, `r.wakeUp()`은 대기 중 sleep을 조기 재개(공식 문서는 테스트·커스텀 UI 용도로 소개).
- **`cancel()`은 하드 종료다.** 정리(cleanup) 코드가 돌지 않고 스트리밍 클라이언트에 최종 통지도 없다. 대기자는 `WorkflowRunCancelledError`.
- `start(wf, args, { deploymentId: 'latest' })` — 런은 **시작 배포에 핀 고정**(롤백해도 옛 배포에서 계속 재시도). 회전·재시작 시 `'latest'`.
- 훅: `defineHook({ schema })`(Standard Schema v1 — zod/valibot), 토큰은 결정론적으로(`sched:${userId}:${gen}:${i}`), `using hook = ...create({ token })`. `Promise.race([sleep(...), hook])`로 **취소 없이 같은 런에서 재스케줄** 가능(루프당 +5 이벤트).

---

## 4. 한도·과금

| 런 한도 (전 플랜) | 값 |
|------|-----|
| 런당 이벤트 | **25,000** (상향은 문의, v5 강제) |
| 런당 스텝 | **10,000** |
| 런당 초당 이벤트 생성 | 200 (초과 시 throttle + 재시도) |
| 초당 런 생성 | 1,000 |
| 최대 페이로드(런/스텝/훅 입출력) | 50 MB |
| 런당 총 엔티티 저장 | 2 GB |
| 런당 attribute | 64개 (`setAttributes` 1회 쓰기 8 KiB) |

> **성능 권고:** 런이 **2,000 이벤트 또는 1 GB**를 넘기면 리플레이가 느려진다.
> 공식 권고는 **자식 워크플로로 쪼개기**. → 무한 루프 런은 **N회마다 새 런으로 회전**시켜야 한다.

| Hobby 리소스 | 포함량 | 초과 단가 |
|--------|--------------|-----------|
| Workflow Events | **50,000 events / 월** | $0.02 / 1K events |
| Workflow Data Written | **1 GB** | $0.50 / GB |
| Workflow Data Retained | **Hobby 미제공** | $0.50 / GB-month (Pro) |

| 플랜 | 런 완료 후 페이로드 읽기 가능(보존) | 완전 삭제 상한 |
|------|------------------|------|
| Hobby | **1일** | 66일 |
| Pro | 7일 | 96일 |
| Enterprise | 30일 | 126일 |

(런 메타데이터는 별도 — Hobby 최소 1일·최대 1년. 실행 중·잠든 런은 기간 제한 없이 보관. 근거: Workflow Data Retention 문서) → Hobby 런 로그를 감사 기록으로 쓰지 말고 자체 DB에 기록.

- 요청 레이트 리밋: Hobby **50,000 req/분**(Pro 500,000 · Enterprise 2,500,000). 초과해도 백오프 재시도되므로 런이 실패하진 않고 느려질 뿐이다.
- 스텝이 호출하는 Function 실행 비용과 Queues 사용량은 **별도 과금 지표**.

### 이벤트 개수와 예산 계산

- 이벤트: 런(`run_created`·`run_started`·`run_completed`·`run_failed`·`run_cancelled`), 스텝(`step_created`·`step_started`·`step_completed`·`step_failed`·`step_retrying`), 훅(`hook_created`·`hook_conflict`·`hook_received`·`hook_disposed`), 대기(`wait_created`·`wait_completed`).
- **개수: 정상 스텝 = 3 / `sleep` = 2 / 훅 = `hook_created` + 수신 n + `hook_disposed`.**
- 루프 1회 = 다음 시각 계산 스텝(3) + `sleep`(2) + 발송 스텝(3) = **8 이벤트**. 6명 × 5회 × 8 × 30일 = 7,200(+회전 ≈36) → 약 7,250 / 50,000 = **14.5%**. 훅 경합 시 13/회 → 월 약 11,700(23.4%). 60명이면 월 72,500 → Hobby 초과 → Pro 또는 "시간 슬롯별 배치 런".
- 회전: 2,000 ÷ 8 = 250회 ≈ 50일, 25,000 ÷ 8 = 3,125회 ≈ 625일 → `MAX_ITERATIONS = 150`(≈30일·약 1,200 이벤트)에서 `start(..., { deploymentId: 'latest' })`로 새 런 — 성능 권고선 유지 + 배포 핀 고정 해소.

---

## 5. 스케줄러 설계 함정

| 함정 | 왜 문제인가 | 올바른 방법 |
|------|-------------|-------------|
| 본문에서 DB·`fetch`·web-push | 리플레이마다 재실행 + 전역 `fetch`·Node 모듈 throw | 모든 부수효과는 `'use step'` |
| 본문에서 `Intl`/타임존 계산 | 패치 전역 목록에 없음 | 스텝에서 계산 후 ISO 문자열 반환 → `sleep(new Date(at))` |
| (v4) 본문에서 `start()` | v4 금지 (v5.0+ 허용) | v4는 스텝 래퍼 안에서, 워크플로 참조는 스텝에 고정(인자로 넘기지 말 것). v5도 DB CAS와 한 단위로 묶으려면 스텝에 둔다 |
| 취소 없이 새 런만 시작 | 옛 런이 깨어나 **중복 발송** | 사용자당 활성 runId를 DB에 보관, `getRun(old).cancel()` |
| 옛 런을 먼저 취소 | `start()` 실패 시 스케줄러가 통째로 사라짐 | **① 새 런 시작 → ② DB CAS(generation) 교체 → ③ 옛 런 취소**. CAS에서 지면 방금 만든 런을 취소 |
| 취소가 항상 성공한다고 가정 | 시작·취소 경합, 하드 취소는 cleanup 미실행 | 발송 스텝에 **멱등 키**(`userId:slotAt`, `INSERT ... ON CONFLICT DO NOTHING`) |
| 모든 예외를 스텝에서 throw | 404/410(구독 만료)까지 3회 재시도 | 404/410은 구독 삭제 후 continue(또는 `FatalError`), 5xx·네트워크만 재시도 |
| 슬롯 입력 미검증 | 이벤트 예산·타인 스케줄 변경 | `HH:mm` 정규식·개수 상한(5)·인증/인가 |
| web-push 4.0 default import | 4.0.0(2026-11-06)부터 ESM 전용·default export 없음 → "does not provide an export named 'default'" | `import * as webpush from 'web-push'` (3.6.x 에 머무르면 default import 도 동작) |

---

## 6. 로컬 개발·관찰

- 프레임워크 dev 서버(`next dev`)만 띄우면 **Local World** 자동 선택, 배포하면 **Vercel World**. 이벤트는 JSON 파일(기본 `.workflow-data/`, Next.js에선 `.next/workflow-data/`로 안내되기도 함, `WORKFLOW_LOCAL_DATA_DIR`).
- **Local World 한계:** 큐가 **인메모리** → 서버 재시작 시 대기 작업 유실, 단일 인스턴스, 인증 없음. **프로덕션 금지.** 내일 07:30 sleep 검증은 `sleep('10s')`로 줄이거나 `wakeUp()`.
- `npx workflow inspect runs [--web]` / `inspect run <id> [--url]`, 플래그 `--json --backend vercel --decrypt --env preview`. 배포 후 대시보드 **Observability → Workflows**. 런 데이터는 **종단 암호화** — `--decrypt`(UI Decrypt)로만 보이고, 팀 소유자 외 멤버는 **Workflow Run Data Viewer** 권한 필요.

> 4.x 를 쓰면 설치 버전에서 `npx workflow --help`로 CLI를 확인하라. 코드에서는 `getRun(id).cancel()` 이 확실한 경로다.
> `vercel dev`에서의 동작은 공식 문서에 명시가 없다 — 문서화된 경로는 **프레임워크 dev 서버**다.

---

## 7. Cron Jobs 대비 판단

| | **Vercel Cron (Hobby)** | **Vercel Workflows** |
|---|---|---|
| 최소 간격 | **하루 1회** (더 잦은 표현식은 배포 실패) | 제한 없음 (`sleep` 임의 시각) |
| 타이밍 정밀도 | **시간 단위 ±59분** (`0 1 * * *` → 01:00~01:59 임의) | 지정 시각에 만료 후 큐 디스패치 |
| 프로젝트당 개수 | 100개 | 제한 없음 |
| 사용자별 개별 시각 | ❌ | ✅ 런 1개 = 사용자 1명 |

- Hobby 크론은 "사용자가 지정한 07:30"을 **구조적으로 만족할 수 없다.** Pro 분 단위 크론 폴링은 월 43,200회 호출로 낭비, 외부 무료 크론(cron-job.org 등)은 가용성·인증·중복 방지·상태를 직접 만들어야 한다.
- **Workflow를 쓰지 말아야 할 때:** 초 단위 정밀 스케줄(재개 지연 상한이 공식 수치로 명시되어 있지 않음), 대상이 수만 명이어서 동시 런·이벤트가 폭증하는 경우, 이미 Pro에서 분 단위 크론 + 배치 조회로 충분한 경우.
