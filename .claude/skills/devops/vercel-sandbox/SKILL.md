---
name: vercel-sandbox
description: Vercel Sandbox(@vercel/sandbox) 마이크로VM에서 CLI·에이전트를 실행하고 SSE로 출력을 중계하는 패턴. Sandbox.create/runCommand 스트리밍, Persistent Sandbox·스냅샷, 과금·Hobby 한도, 비용 최소화·안티패턴을 다룬다.
---

# Vercel Sandbox — 마이크로VM에서 CLI/에이전트 실행 & 출력 중계

> 소스: https://vercel.com/docs/sandbox (개요·pricing·sdk-reference·persistent-sandboxes·snapshots·authentication), https://vercel.com/kb/guide/how-to-use-snapshots-for-faster-sandbox-startup, https://vercel.com/blog/optimizing-vercel-sandbox-snapshots, https://vercel.com/changelog/run-claude-managed-agents-with-vercel-sandbox
> 검증일: 2026-07-03
> 기준 버전: `@vercel/sandbox` v2 (Persistent 기본), 과금·한도는 2026-06 기준
> 대상 시나리오: Next.js API Route가 Vercel Sandbox 안에서 Claude Code CLI를 실행하고 stdout을 SSE로 클라이언트에 중계하는 개인용 중계 서버

---

## 1. 핵심 개념

Vercel Sandbox는 **Firecracker 마이크로VM**에서 임의 코드를 격리 실행하는 compute primitive다.

- 런타임: Amazon Linux 2023, `node26` / `node24`(기본) / `node22` / `python3.13`. `sudo` 사용 가능, 기본 작업 디렉터리 `/vercel/sandbox`
- 리전: **`iad1` 전용** (다른 리전 선택 불가)
- 기본 타임아웃: **5분** (`timeout` 옵션으로 조정, `extendTimeout()`으로 연장)
- 기본 리소스: **2 vCPU / 4GB** (vCPU당 2048MB 고정), 임시 NVMe 디스크 32GB
- 인증: Vercel OIDC 토큰(권장) 또는 Access 토큰

설치:
```bash
npm i @vercel/sandbox
```

---

## 2. 핵심 API (@vercel/sandbox v2)

### Sandbox.create()
```ts
import { Sandbox } from '@vercel/sandbox';

const sandbox = await Sandbox.create({
  name: 'claude-relay',            // 프로젝트 내 유일. 생략 시 자동 생성, 생성 후 변경 불가
  runtime: 'node24',
  resources: { vcpus: 2 },         // 기본 2 (2048MB/vCPU)
  timeout: 5 * 60 * 1000,          // 기본 5분(ms)
  // persistent: true 가 기본 — stop 시 자동 스냅샷 & 다음 resume 때 복원
});
```
주요 옵션: `name`, `runtime`, `resources.vcpus`, `timeout`(ms), `ports`(최대 15), `source`(git/tarball/snapshot), `env`, `networkPolicy`(`allow-all` 기본/`deny-all`/커스텀), `persistent`(기본 true), `snapshotExpiration`, `keepLastSnapshots`.

### runCommand() — 블로킹 & 스트리밍
```ts
// 블로킹: CommandFinished 반환 (완료까지 대기)
const result = await sandbox.runCommand('node', ['--version']);
console.log(result.exitCode, await result.stdout());

// 객체 오버로드: cwd/env/sudo/detached/stdout/stderr 지정
const cmd = await sandbox.runCommand({
  cmd: 'claude',
  args: ['-p', prompt, '--output-format', 'stream-json'],
  env: { ANTHROPIC_API_KEY: apiKey },   // 커맨드 인자가 아닌 env로 시크릿 전달
  detached: true,                        // 즉시 Command 반환 (장기 실행/스트리밍용)
});
```

**출력 스트리밍 3가지 방법:**
1. `command.logs()` — `AsyncGenerator<{ stream: 'stdout'|'stderr'; data: string }>`. SSE 중계에 가장 적합.
   ```ts
   for await (const log of cmd.logs()) {
     if (log.stream === 'stdout') controller.enqueue(encoder.encode(`data: ${log.data}\n\n`));
   }
   ```
2. `runCommand({ stdout, stderr })` — Node `Writable`에 직접 파이핑
3. `detached: true` 후 `await cmd.wait()` — 완료 시 `CommandFinished` (exitCode 확정)

기타: `command.stdout()`, `command.stderr()`, `command.output('both')`, `command.kill('SIGKILL')`, `command.exitCode`.

### 생명주기 제어
```ts
console.log(sandbox.timeout);           // 남은 시간(ms). 짧으면 아래로 연장
await sandbox.extendTimeout(60_000);    // 60초 연장 (플랜 최대 한도까지)

const stopped = await sandbox.stop();   // VM 정지. persistent면 자동 스냅샷
console.log(stopped.snapshot?.id, stopped.activeCpuUsageMs, stopped.networkTransfer);
```
`stop()`은 여러 번 호출해도 안전하며, 정지 시 실제 과금 지표(`activeCpuUsageMs`, `networkTransfer`)를 반환한다.

### 인증
| 시나리오 | 방법 | 필요한 값 |
|----------|------|-----------|
| 로컬 개발 | OIDC(권장) | `vercel link` + `vercel env pull` → `.env.local`의 `VERCEL_OIDC_TOKEN` (12시간 만료, 만료 시 재실행) |
| Vercel 배포 | OIDC(자동) | 별도 설정 불필요 |
| 외부 CI/CD·비-Vercel | Access 토큰 | `VERCEL_TEAM_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN` 환경변수 |

---

## 3. Persistent Sandbox & 스냅샷 — CLI 사전 설치 보존

### Persistent Sandbox (기본, 자동)
`@vercel/sandbox` v2부터 **persistent가 기본**이다. `stop()` 시 파일시스템이 자동 스냅샷되고, 같은 `name`으로 재개하면 마지막 상태에서 새 세션이 부팅된다. 2단계 모델:
- **Sandbox**: `name`으로 식별되는 장수(long-lived) 엔티티. 여러 VM 부팅에 걸쳐 유지
- **Session**: 샌드박스 안에서 실제 실행되는 단일 VM 인스턴스

```ts
// 최초 1회만 onCreate 실행(CLI 설치), 재개마다 onResume 실행
const sandbox = await Sandbox.getOrCreate({
  name: 'claude-relay',
  runtime: 'node24',
  onCreate: async (sbx) => {
    await sbx.runCommand('npm', ['install', '-g', '@anthropic-ai/claude-code']); // CLI 1회 설치
  },
});

// 이후 요청: 이름으로 재개 — 설치 상태 보존됨
const s = await Sandbox.get({ name: 'claude-relay' }); // 다음 SDK 호출 시 자동 resume
await s.runCommand('claude', ['-p', prompt]);
```
자동 재개: 정지된 persistent 샌드박스에 `runCommand`/`writeFiles` 등을 호출하면 SDK가 새 세션을 시작해 재시도한다(`stop()`·`update()`만 자동 재개 안 함).

**스토리지 관리**: persistent는 stop마다 스냅샷을 만들어 Snapshot Storage를 소모한다. `keepLastSnapshots: { count: 1 }`로 최신 1개만 유지해 스토리지를 평탄하게 관리한다.

### 수동 스냅샷 (이름 없는 재사용/포크용)
```ts
const sandbox = await Sandbox.create({ timeout: 10 * 60 * 1000 });
await sandbox.runCommand('npm', ['install', '-g', '@anthropic-ai/claude-code']);
const snapshot = await sandbox.snapshot({ expiration: 14 * 24 * 60 * 60 * 1000 });
// 주의: snapshot() 호출 즉시 샌드박스는 자동 종료된다 (stop() 불필요)

// 이후: 스냅샷에서 새 샌드박스 생성 — 설치 단계 건너뜀 (콜드 스타트 16.49s → 0.4s 사례)
const fresh = await Sandbox.create({
  source: { type: 'snapshot', snapshotId: snapshot.snapshotId },
});
```
스냅샷은 기본적으로 **마지막 사용 후 30일**에 만료되며, 사용할 때마다 타이머가 리셋된다. `expiration: 0`으로 무기한 유지.

**Persistent vs 수동 스냅샷 선택**: 단일 샌드박스를 요청 간에 유지 → `Sandbox.get({ name })`(persistent). 여러 세션·팀원과 동일 환경 공유·포크 → 수동 `snapshot()`.

---

## 4. 과금 모델 (2026-06 기준)

| 지표 | 의미 | Pro 요율 |
|------|------|----------|
| **Active CPU** | CPU를 실제 사용한 시간. **I/O 대기(네트워크·DB·AI 모델 호출)는 미과금** | $0.128/시간 |
| **Provisioned Memory** | 할당 메모리(GB) × 실행 시간(시간). vCPU당 2GB. **최소 1분 단위 과금** | $0.0212/GB-hour |
| **Sandbox Creations** | `Sandbox.create()` 호출 횟수 (실행 시간 무관) | $0.60 / 1M회 |
| **Data Transfer** | 인/아웃 네트워크 전송량 | $0.15/GB |
| **Snapshot Storage** | 스냅샷 저장 용량 | $0.08/GB-month |

메모리 예시: 4 vCPU(8GB) 30분 실행 = `8GB × 0.5h = 4 GB-hours`.

> Active CPU는 100% 사용 가정 추정치보다 실제로는 낮은 경우가 많다. Claude CLI가 모델 응답을 기다리는 시간은 I/O 대기라 Active CPU에 계상되지 않기 때문이다.

---

## 5. Hobby 무료 한도 & 초과 동작

| 항목 | Hobby (무료) | Pro |
|------|-------------|-----|
| Active CPU | **5시간/월** | $0.128/시간 |
| Provisioned Memory | **420 GB-hours/월** | $0.0212/GB-hour |
| Sandbox Creations | **5,000회/월** | $0.60/1M |
| Data Transfer | 20 GB/월 | $0.15/GB |
| Snapshot Storage | 15 GB(lifetime) | $0.08/GB-month |
| 동시 실행 | **10개** | 2,000개 |
| 최대 실행 시간 | **45분** | **24시간** |
| 최대 리소스 | **4 vCPU / 8GB** | 8 vCPU / 16GB |
| vCPU 생성 속도 | 40 vCPU / 10분 | 200 vCPU / 분 |
| 포함 크레딧 | — | **$20/월** |

**초과 시 동작**: Hobby는 한도 초과 시 **과금 없이 샌드박스 생성이 일시정지**되며, 최초 사용 후 30일이 지나 다음 청구 주기가 오면 재개된다. 계속 쓰려면 Pro로 업그레이드한다. Pro는 $20 크레딧 소진 후 초과분이 요율대로 과금된다(Spend Management로 알림·중지 설정 가능).

---

## 6. 실전 패턴 — 요청 단위 resume→실행→stop

Claude 중계 서버는 **요청마다 재개→CLI 실행→SSE 중계→stop**으로 비용을 최소화한다.

```ts
// Next.js Route Handler (예시)
export async function POST(req: Request) {
  const { prompt } = await req.json();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // 1) 이름으로 재개 (CLI 사전 설치 상태 보존)
      const sandbox = await Sandbox.get({ name: 'claude-relay' });
      try {
        // 2) detached 실행 후 로그를 SSE로 중계
        const cmd = await sandbox.runCommand({
          cmd: 'claude',
          args: ['-p', prompt, '--output-format', 'stream-json'],
          env: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY! }, // env로 시크릿 전달
          detached: true,
        });
        for await (const log of cmd.logs()) {
          if (log.stream === 'stdout') {
            controller.enqueue(encoder.encode(`data: ${log.data}\n\n`));
          }
        }
        await cmd.wait();
      } finally {
        // 3) 반드시 stop — persistent라 상태는 자동 스냅샷됨
        await sandbox.stop();
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}
```

**핵심 원칙:**
- 응답 스트림이 길어질 것 같으면 `sandbox.timeout`을 확인해 `extendTimeout()`으로 필요한 만큼만 연장 (Hobby 최대 45분)
- 응답 완료 즉시 `stop()` — 타임아웃까지 방치하면 메모리 GB-hours가 계속 쌓인다
- 실행 결과가 필요 없으면 요청마다 새로 만들지 말고 이름 있는 샌드박스를 재사용해 생성 횟수·설치 비용을 줄인다

### Hobby에서 상시(24/7) 실행이 불가능한 이유
Hobby 메모리 한도는 **420 GB-hours/월**이다. 최소 구성인 1 vCPU(2GB)를 24/7 돌리면:
- `2GB × 720시간(30일) = 1,440 GB-hours` → 한도의 약 3.4배
- 즉 1 vCPU 상시 실행은 `420 ÷ 2 = 210시간 ≈ 8.75일`이면 월 한도를 소진
- 기본 2 vCPU(4GB)면 `420 ÷ 4 = 105시간 ≈ 4.4일`이면 소진

게다가 Hobby **최대 실행 시간이 45분**이라 세션 하나가 연속으로 계속 떠 있을 수도 없다. 따라서 상시 실행 대신 **요청 단위 resume→stop**이 유일하게 지속 가능한 패턴이다.

---

## 7. 안티패턴

| 안티패턴 | 문제 | 올바른 방법 |
|----------|------|-------------|
| 요청마다 CLI 재설치 | 매 요청 수십 초 콜드 스타트 + Data Transfer 낭비 | `onCreate`/수동 스냅샷으로 1회 설치 후 `Sandbox.get({ name })`로 재개 |
| `stop()` 없이 타임아웃 방치 | 유휴 상태에도 Provisioned Memory(GB-hours) 계속 과금 | 응답 완료 즉시 `stop()` (persistent라 상태는 보존됨) |
| 시크릿을 커맨드 라인 인자로 전달 | `args`는 프로세스 목록·로그에 노출됨 | `runCommand({ env: { API_KEY } })` 또는 `Sandbox.create({ env })`로 환경변수 주입 |
| Hobby에서 샌드박스 상시 유지 | 45분 최대 실행·420 GB-hours 한도로 불가능 | 요청 단위 resume→실행→stop |
| persistent인데 스냅샷 방치 | stop마다 스냅샷 누적 → Snapshot Storage 증가 | `keepLastSnapshots: { count: 1 }`로 최신만 유지 |
| 다른 리전 기대 | Sandbox는 `iad1` 전용 | 레이턴시 민감 시 앱도 iad1 근처에 배치 |

---

## 요약 체크리스트

- [ ] `@vercel/sandbox` v2, 인증은 배포 환경이면 OIDC 자동 / 외부면 `VERCEL_TOKEN`+`TEAM_ID`+`PROJECT_ID`
- [ ] CLI는 `onCreate` 또는 수동 스냅샷으로 1회만 설치 → 이름으로 재개
- [ ] SSE 중계는 `runCommand({ detached: true })` + `command.logs()`
- [ ] 시크릿은 `env`로만 전달 (커맨드 인자 금지)
- [ ] 응답 완료 시 즉시 `stop()`, `keepLastSnapshots: { count: 1 }`
- [ ] Hobby 한도(45분·420 GB-hours·동시 10개·iad1·최대 4vCPU/8GB) 인지, 상시 실행 금지
