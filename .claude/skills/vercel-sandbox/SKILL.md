---
name: vercel-sandbox
description: Vercel Sandbox(@vercel/sandbox v3) 최신 기준·함정 — runtime deprecated→image, Persistent 기본(name·getOrCreate·자동 재개), snapshot() 즉시 종료·30일 만료·리전 고정, 64GB vs 32GB 디스크, 19개 리전·failoverRegions(Pro+), 과금(2026-09-10 pricing, I/O 대기 미과금·다운로드 무료)·Hobby 한도(45분·420 GB-hours)와 상시 실행 불가 계산, CLI 출력 SSE 중계 패턴
---

# Vercel Sandbox — 마이크로VM에서 CLI/에이전트 실행 & 출력 중계

> 소스: https://vercel.com/docs/sandbox (개요·pricing·sdk-reference·persistent-sandboxes·snapshots·authentication·concepts/regions), https://vercel.com/kb/guide/how-to-use-snapshots-for-faster-sandbox-startup, https://vercel.com/blog/optimizing-vercel-sandbox-snapshots, https://vercel.com/changelog/run-claude-managed-agents-with-vercel-sandbox
> 검증일: 2026-11-09 (최초 2026-07-03, 재검증 09-28 · 11-09)
> 기준 버전: `@vercel/sandbox` v3 (npm 최신 3.9.1 — 2026-10-28, Persistent 기본), 과금·한도는 pricing 문서 2026-09-10 갱신본 기준. `runtime` 옵션은 **deprecated** — `image` 사용 권장(예: `vercel/sandbox/universal`)
> 대상 시나리오: Next.js API Route가 Vercel Sandbox 안에서 Claude Code CLI를 실행하고 stdout을 SSE로 클라이언트에 중계하는 개인용 중계 서버

---

## 이 스킬의 범위

v3 기준 기본값·deprecated, Persistent·스냅샷 동작, 과금·한도 수치, 비용 함정만 싣는다.
> 기본 사용법(Sandbox.create·runCommand 기본 호출, ReadableStream SSE 일반 코드)은 공식 문서 수준이라 싣지 않는다.

---

## 1. 기본값과 v3 변경점

- Firecracker 마이크로VM. 기본 이미지 `vercel/sandbox/universal`(현재 Node.js LTS·Python 3.14·코딩 에이전트·유틸리티 포함). Vercel Managed Image 또는 커스텀 OCI 이미지(Vercel Container Registry)도 가능. `sudo` 가능, 기본 작업 디렉터리 `/vercel/sandbox`.
  > 주의: `runtime: 'node24'` 같은 개별 런타임 지정 방식(`node26`/`node24`/`node22`/`python3.13`)은 **deprecated** — `image` 옵션을 쓴다. 레거시 `runtime` 경유로 생성하면 디스크가 32GB만 할당된다(`@vercel/sandbox` 3.0.0+ 또는 커스텀 이미지는 임시 NVMe **64GB**).
- 리전: 기본 `iad1`(생략 시 프로젝트 기본 리전 → 없으면 iad1). 총 **19개 리전** 중 `region`으로 선택(2026-07 전 리전 개방). Pro/Enterprise는 `failoverRegions`(Hobby·Pro 체험판은 설정 불가 — `payment_required` 오류).
- 기본 타임아웃 **5분**(`timeout` ms, `extendTimeout()`으로 플랜 최대까지 연장, `sandbox.timeout`은 남은 ms). 세션 단위 한도이며 persistent는 재개마다 리셋 → 수명은 사실상 무제한.
- 기본 리소스 **2 vCPU / 4GB**(vCPU당 2048MB 고정, vCPU는 1 또는 2~32 짝수 — 플랜 상한 내).
- 기타 옵션: `name`(프로젝트 내 유일, 생성 후 변경 불가), `ports`(최대 15), `source`(git/tarball/snapshot), `env`, `networkPolicy`(`allow-all` 기본/`deny-all`/커스텀 — 변경은 `sandbox.update({ networkPolicy })`, **`updateNetworkPolicy()`는 deprecated**), `persistent`(기본 true), `snapshotExpiration`, `keepLastSnapshots`.
- 출력 스트리밍: `runCommand({ cmd, args, env, detached: true })` → `command.logs()`(`AsyncGenerator<{ stream: 'stdout'|'stderr'; data }>`)가 SSE 중계에 가장 적합. 그 외 `runCommand({ stdout, stderr })`로 Writable 파이핑, `await cmd.wait()`로 `CommandFinished`.
- `stop()`은 여러 번 호출해도 안전하며 실제 과금 지표(`activeCpuDurationMs`, `networkTransfer: { ingress, egress }`)와 persistent면 `snapshot`을 반환.

### 인증

| 시나리오 | 방법 |
|----------|------|
| 로컬 개발 | OIDC(권장) — `vercel link` + `vercel env pull` → `.env.local`의 `VERCEL_OIDC_TOKEN` (**12시간 만료**, 만료 시 재실행) |
| Vercel 배포 | OIDC 자동 |
| 외부 CI/CD·비-Vercel | Access 토큰 — `VERCEL_TEAM_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN` |

---

## 2. Persistent Sandbox & 스냅샷

- `@vercel/sandbox` v2부터 **persistent가 기본**. `stop()` 시 파일시스템 자동 스냅샷, 같은 `name`으로 재개하면 마지막 상태에서 새 세션 부팅. 2단계 모델: **Sandbox**(`name`으로 식별되는 장수 엔티티) / **Session**(실제 VM 인스턴스).
- `Sandbox.getOrCreate({ name, image, onCreate })` — `onCreate`는 최초 1회(CLI 설치 등), `onResume`은 재개마다. 이후 `Sandbox.get({ name })`.
- **자동 재개**: 정지된 persistent 샌드박스에 `runCommand`/`writeFiles` 등을 호출하면 SDK가 새 세션을 시작해 재시도한다(`stop()`·`update()`만 자동 재개 안 함).
- persistent는 stop마다 스냅샷을 만들어 Snapshot Storage 소모 → `keepLastSnapshots: { count: 1 }`.

### 수동 스냅샷 (이름 없는 재사용·포크·팀 공유)

- `sandbox.snapshot({ expiration })` → `Sandbox.create({ source: { type: 'snapshot', snapshotId } })`. 콜드 스타트 16.49s → 0.4s 사례.

> 주의: `snapshot()` 호출 즉시 샌드박스는 자동 종료된다 (stop() 불필요).

- 스냅샷은 기본 **마지막 사용 후 30일** 만료(사용 시 리셋), `expiration: 0`이면 무기한.
- 스냅샷은 **생성된 리전에서만** 사용 가능 — 다른 리전 지정 시 `snapshot_region_mismatch`.

---

## 3. 과금 (pricing 2026-09-10 갱신본 기준)

| 지표 | 의미 | Pro 요율 |
|------|------|----------|
| **Active CPU** | CPU를 실제 사용한 시간. **I/O 대기(네트워크·DB·AI 모델 호출)는 미과금** | $0.128/시간 |
| **Provisioned Memory** | 할당 메모리(GB) × 실행 시간. vCPU당 2GB. **최소 1분 단위 과금** | $0.0212/GB-hour |
| **Sandbox Creations** | `Sandbox.create()` 호출 횟수 | $0.60 / 1M회 |
| **Data Transfer** | egress + 개방 포트 인/아웃. **인터넷에서 다운로드(npm·git clone 등)는 무료**(2026-07 정책 변경) | **Pro: Flat Rate CDN에 포함** (Enterprise $0.15/GB) |
| **Snapshot Storage** | 스냅샷 저장 용량 | $0.08/GB-month |
| Drive Storage / Reads / Writes | Drives(퍼블릭 베타 — 마운트 영속 볼륨, 실행당 최대 4개) | $0.05/GB-month · $0.0015/GB · $0.004/GB (Hobby 15 GB lifetime · 30 GB/월 · 30 GB/월 포함) |

> Active CPU는 100% 사용 가정 추정치보다 실제로는 낮은 경우가 많다. Claude CLI가 모델 응답을 기다리는 시간은 I/O 대기라 Active CPU에 계상되지 않기 때문이다.
> Active CPU·Provisioned Memory·Data Transfer 요율은 리전마다 다르다. 위 표는 기본 `iad1` 기준이며, 다른 리전 사용 시 공식 pricing 페이지의 Regional pricing을 확인한다.

### Hobby 한도 & 초과 동작

| 항목 | Hobby (무료) | Pro |
|------|-------------|-----|
| Active CPU | **5시간/월** | $0.128/시간 |
| Provisioned Memory | **420 GB-hours/월** | $0.0212/GB-hour |
| Sandbox Creations | **5,000회/월** | $0.60/1M |
| Data Transfer | 20 GB/월 | Flat Rate CDN에 포함 |
| Snapshot Storage | 15 GB(lifetime) | $0.08/GB-month |
| 동시 실행 | **10개** | 10,000개 |
| 최대 실행 시간 | **45분** | **24시간** |
| 최대 리소스 | **4 vCPU / 8GB** | 8 vCPU / 16GB |
| vCPU 생성 속도 | 시작 20/분 → 최대 40/분(동적 쿼터, 10분 유휴 시 초기화) | 시작 150/분 → 최대 5,000/분 |
| 포함 크레딧 | — | **$20/월** |

- Hobby 초과 시 **과금 없이 샌드박스 생성이 일시정지**, 최초 사용 후 30일이 지나 다음 청구 주기에 재개. Pro는 $20 크레딧 소진 후 요율 과금(Spend Management로 알림·중지).
- **Hobby 상시(24/7) 실행 불가**: 1 vCPU(2GB) 24/7 = `2GB × 720h = 1,440 GB-hours`(한도의 약 3.4배) → `420 ÷ 2 = 210시간 ≈ 8.75일`이면 소진, 기본 2 vCPU(4GB)는 `105시간 ≈ 4.4일`. 게다가 최대 실행 45분 → **요청 단위 resume→실행→stop**이 유일하게 지속 가능한 패턴.

---

## 4. 중계 패턴 원칙·안티패턴

요청마다 `Sandbox.get({ name })` → `runCommand({ detached: true, env })` → `logs()`를 `data: ...\n\n`로 SSE 중계 → `cmd.wait()` → **`finally`에서 `stop()`**.

| 안티패턴 | 문제 | 올바른 방법 |
|----------|------|-------------|
| 요청마다 CLI 재설치 | 매 요청 수십 초 콜드 스타트 | `onCreate`/수동 스냅샷으로 1회 설치 후 이름으로 재개 |
| `stop()` 없이 타임아웃 방치 | 유휴 상태에도 Provisioned Memory 과금 | 응답 완료 즉시 `stop()` (persistent라 상태 보존) |
| 시크릿을 커맨드 인자로 | `args`는 프로세스 목록·로그에 노출 | `runCommand({ env })` 또는 `Sandbox.create({ env })` |
| Hobby에서 샌드박스 상시 유지 | 45분·420 GB-hours로 불가능 | 요청 단위 resume→stop |
| persistent 스냅샷 방치 | Snapshot Storage 누적 | `keepLastSnapshots: { count: 1 }` |
| 리전 미지정 | 프로젝트 기본(없으면 `iad1`) | 데이터 소스 가까운 `region`, Pro+는 `failoverRegions` |
| 스냅샷을 다른 리전에서 재사용 | `snapshot_region_mismatch` | 해당 리전에서 새로 생성·재스냅샷 |
| 긴 스트림 중 세션 만료 | 5분 기본 타임아웃 | `sandbox.timeout` 확인 후 필요한 만큼만 `extendTimeout()` (Hobby 최대 45분) |
