---
name: n8n-self-hosting
description: n8n 2.x self-host 버전 변경점·실측 함정 — v2.45 durable scheduler 기본 ON(고정 간격·legacy 모드), WEBHOOK_URL deprecated(2.35)→N8N_WEBHOOK_URL, N8N_RUNNERS_ENABLED deprecated·internal runner deprecated(external 권장), Compression 한도 2.x vs 3.0, Postgres 16 호환 지원 격하·MySQL 제거, 3.0 early access 사전 대비, 문서 URL 개편, 라이선스 경계
disable-model-invocation: true
---

# n8n Self-Hosting

> 소스:
> - https://docs.n8n.io/deploy/host-n8n/install-options/install-with-docker.md
> - https://docs.n8n.io/deploy/host-n8n/install-options/use-a-cloud-provider/use-docker-compose.md
> - https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/use-environment-variables/database.md
> - https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/use-environment-variables/deployment.md
> - https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/use-environment-variables/queue-mode.md
> - https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/use-environment-variables/nodes.md
> - https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/configuration-examples/set-a-custom-encryption-key.md
> - https://docs.n8n.io/deploy/host-n8n/configure-n8n/scaling/enable-queue-mode.md
> - https://docs.n8n.io/deploy/host-n8n/configure-n8n/set-up-task-runners.md
> - https://docs.n8n.io/deploy/host-n8n/configure-n8n/user-management.md
> - https://docs.n8n.io/deploy/host-n8n/configure-n8n/durable-scheduler.md
> - https://docs.n8n.io/privacy-and-security/sustainable-use-license
> - https://docs.n8n.io/changelog/release-notes.md (현행 — 2.x 통합, `release-notes-2.x`는 2026-09 기준 archived)
> - https://github.com/n8n-io/n8n-hosting
>
> - https://docs.n8n.io/changelog/v30-breaking-changes.md (n8n 3.0 — early access)
>
> 검증일: 2026-11-09 (최초 2026-05-15, 재검증 2026-08-11 / 2026-09-28 / 2026-11-09)
> 대상 버전: n8n v2.x — **2026-11-09 기준 stable v2.46.6 / beta v2.47.2** (npm dist-tag·GitHub Releases).
> **n8n 3.0** 은 2026-10-27 부터 **early access**(GitHub prerelease 3.0.0 → 3.1.0, npm 미배포) — 프로덕션은 아직 2.x stable.
>
> 짝 스킬: `n8n-error-handling` (에러 처리·재시도)

> **주의 — 공식 문서 URL 전면 개편 (2026-08 확인):** 구 `docs.n8n.io/hosting/...` 경로는 전부 404다.
> 현재 구조는 `docs.n8n.io/deploy/host-n8n/...`. 북마크·CI 링크체크·사내 위키에 구 경로가 남아 있으면 갱신할 것.
> 경로를 모를 때는 `https://docs.n8n.io/sitemap.md`로 현재 트리를 확인한다.

---

## 이 스킬의 범위

v1→v2→2.4x→3.0 사이의 환경 변수·기본값 변경, 기동 로그로 실측한 값, 운영 함정만 싣는다.
> 기본 사용법(docker run·docker-compose·Caddy/Traefik 구성, pg_dump 백업, User Management 초기 설정, 큐 모드 compose 예제)은 공식 문서 수준이라 싣지 않는다.

---

## 1. 2.41~2.46 / 3.0 에서 self-host 에 영향 있는 점 (2026-11-09 확인)

- **v2.45.0 부터 durable scheduler 가 기본 ON**(신규·기존 인스턴스 모두). "Every N seconds/minutes" 는 게시 시점 기준 고정 간격이 기본(`N8N_SCHEDULER_TRIGGER_NODE_MODE=legacy` 로 시계 정렬 유지). 인메모리 스케줄러·`N8N_SCHEDULER_ENABLED` 는 deprecated, `N8N_ENV_FEAT_SKIP_DURABLE_SCHEDULER`·노드별 Skip 설정은 제거
- `WEBHOOK_URL` 은 **v2.35.0 부터 deprecated alias**(공식 문서 명시, 기동 시 경고·동작은 계속) → `N8N_WEBHOOK_URL`
- task runner **internal 모드는 3.0 부터 deprecated**(2.x 에서도 경고 로그) → external 모드 권장
- v2.40.3: 암호화 키 회전 기능을 켠 뒤 다시 끌 수 있게 됨(3.0 에서 기본 ON 예정). 2.4x: **Settings → Migration Report** — 3.0 영향 워크플로우·설정 목록(2.45.4 에서 프로젝트별 필터)
- 3.0 예정 변경(지금 대비): **npm/npx 설치 미지원·Docker 필수**, Compression 기본 한도 2GiB→256MiB·5,000→1,000, `~/.n8n/binaryData`→`~/.n8n/storage` 이름 변경(둘 다 있으면 기동 실패 — `N8N_STORAGE_PATH` 로 유지 가능), `N8N_DEFAULT_BINARY_DATA_MODE=default`(in-memory) 값 무효화(남아 있으면 `filesystem` 으로 전환), `N8N_RUNNERS_TASK_TIMEOUT` 300→60초, `OFFLOAD_MANUAL_EXECUTIONS_TO_WORKERS`·`N8N_DB_PING_TIMEOUT`(→`DB_PING_TIMEOUT_MS`)·`N8N_WORKFLOW_TAGS_DISABLED`·`N8N_PRE_EXECUTE_ERROR_CREATES_EXECUTION` 제거, 암호화 키 회전 기본 ON, `N8N_UNVERIFIED_PACKAGES_ENABLED` 기본 false, SSRF 기본 차단 대역 확대, Slack 자격증명 signing secret 필수. 업그레이드 전 **Migration Report** 로 영향 확인

> 2.44 이하 → 2.45+ 업그레이드는 **스케줄 실행 방식이 바뀌는 업그레이드**다. 분 단위 정각 실행에 의존하는 워크플로우가 있으면 `legacy` 모드를 먼저 지정하고 올린다.

**이미지 태그:** 태그 생략 = 최신 stable. 프로덕션은 버전 핀(`:2.46.6`), `:stable`은 자동 추종이 필요할 때만, `:beta`/`:next`는 beta(2.47.x). 3.0 early access 는 별도 태그로 배포되므로 `:stable` 을 써도 3.0 으로 자동으로 넘어가지 않는다 — 3.0 정식 전환 시점에는 릴리즈 노트 확인 후 핀을 올릴 것.

---

## 2. v1 → v2 breaking changes

- MySQL/MariaDB 지원 제거 → PostgreSQL만
- `N8N_BLOCK_ENV_ACCESS_IN_NODE` 기본값 `true` — Code 노드 `process.env` 접근 기본 차단(필요 시 명시적 `false`)
- `N8N_SKIP_AUTH_ON_OAUTH_CALLBACK` 기본값 `false`
- `N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS` 동작 강화(0600 강제)
- Task runner **기본 활성화** → `N8N_RUNNERS_ENABLED`는 deprecated
- in-memory binary data 모드 제거

> **변경 (v2.0+):** `N8N_RUNNERS_ENABLED`는 **deprecated**다. v2.0부터 task runner가 항상 켜져 있어 이 변수를 지정할 필요가 없다
> (공식 문서에서도 제거됨 — n8n-docs issue #4328 / PR #4450). **v1.x에서만** `true` 지정이 필요하다.
> 기존 compose 파일에 남아 있으면 **삭제**한다(방향이 반대라는 점 주의 — 2026-08 정정).

---

## 3. 2.x 에서 추가·변경된 운영 변수

| 변수 | 도입 | 기본값 | 용도 |
|------|------|--------|------|
| `N8N_OTEL_ENABLED` / `N8N_OTEL_EXPORTER_OTLP_ENDPOINT` | v2.15 | — | 실행 트레이스를 OTLP 컬렉터로 |
| `N8N_TOKEN_EXCHANGE_TRUSTED_KEYS` | v2.16 | — | OAuth 2.0 Token Exchange 인증(임베디드) |
| (instance bootstrapping) | v2.19 | — | 최초 기동 시 환경 변수만으로 인스턴스 전체 설정 주입(IaC) |
| `N8N_INSIGHTS_MAX_AGE_DAYS` | v2.20 | 365(최대 730) | Insights 보존 기간 |
| `N8N_SCHEDULER_ENABLED` | v2.36 (GA, v2.32~2.35은 Preview) | **v2.45.0+ `true`** (이전 `false`) | **Durable scheduler** — 시간 기반 워크플로우를 DB-backed 큐로(재시작 생존, 멀티 인스턴스 분산). 2.45.0 부터 변수 자체가 deprecated — 인메모리로 되돌릴 때만 `false` |
| `N8N_SCHEDULER_TRIGGER_NODE_MODE` | v2.45 | (고정 간격) | `legacy` 지정 시 시계 정렬로 실행 (deprecated 경고 대상) |
| `N8N_USE_WORKFLOW_PUBLICATION_SERVICE` | v2.36 | `true` | Durable scheduler가 Schedule Trigger를 넘겨받기 위한 동반 설정. `false` 면 경고 후 인메모리 유지 |
| `N8N_SCHEDULER_POLL_TRIGGERS_ENABLED` | v2.36 | `false` | 폴링 트리거(Google Sheets 등)까지 durable 대상 포함 |
| `N8N_SCHEDULER_SYSTEM_TASKS_ENABLED` | v2.40 | `false` | 내부 유지보수 작업 이관 (2.40.0 시점엔 이관된 작업 없음) |
| ~~`N8N_ENV_FEAT_SKIP_DURABLE_SCHEDULER`~~ | v2.36 → **v2.45.0 제거** | — | 노드별 설정과 함께 제거 — 인스턴스 전체 `N8N_SCHEDULER_ENABLED=false` 로만 전환 |
| `NODES_MERGE_SQL_SANDBOX_MEMORY_LIMIT_MB` | v2.38.1 | `64` | Merge 노드 "Combine by SQL" 샌드박스 메모리(MB) |
| `N8N_COMPRESSION_NODE_MAX_DECOMPRESSED_SIZE_BYTES` | — | **`2147483648`(2GiB) — 2026-09-28 실측 정정** (구 서술 `268435456`/256MiB는 오류) | zip bomb 방지. v2.40.7 기동 로그: "default ... will be reduced from 2 GiB to 256 MiB in a future version" — 256MiB는 **n8n 3.0 기본값**(v3.0 Breaking changes, 2026-11-09 확인)이며 2.x 는 2GiB. 공식 nodes 환경변수 문서는 이미 3.0 값(256MiB)을 표기하므로 버전 혼동 주의. 현재 한도를 유지하려면 명시적으로 지정 |
| `N8N_COMPRESSION_NODE_MAX_ZIP_ENTRIES` | — | **`5000` — 2026-09-28 실측 정정** (구 서술 `1000`은 오류) | v2.40.7 기동 로그: "default ... will be reduced from 5000 to 1000 in a future version" — 1000은 **n8n 3.0 기본값**(2.x 는 5000) |
| `N8N_AZURE_STORAGE_CUSTOM_ENDPOINTS_ENABLED` | v2.40 | `false` | Azure Storage 커스텀 엔드포인트 허용. 꺼져 있으면 해당 credential 테스트 실패 |

> **Durable scheduler 주의 (2026-11-09 갱신):** v2.36~2.44 는 opt-in 이었으나 **v2.45.0 부터 기본 ON** — 2.44 이하에서 올리면 별도 설정 없이 durable 로 바뀌고, 분/초 간격 스케줄이 시계 정렬 → 게시 시점 기준 고정 간격으로 바뀐다(필요 시 `N8N_SCHEDULER_TRIGGER_NODE_MODE=legacy`). 켠 뒤 되돌려도(`false`) 이미 만들어진 durable 커서·스케줄 테이블은 자동 삭제되지 않는다("Cursors stay in their table").

- 그 외 기본값 참고: `DB_POSTGRESDB_POOL_SIZE` 2, `GENERIC_TIMEZONE` `America/New_York`(스케줄러 타임존 — `TZ`와 별개), `N8N_ENCRYPTION_KEY` 미지정 시 자동 생성되어 `~/.n8n/config`에만 존재.
- v2.21~2.40 구간은 DB 스키마·Docker 절차 breaking change 없음(일반 pull → up -d). v2.34부터 큐 모드 워커가 **페이로드 크기 제한 없이** webhook 응답 반환 — 대용량 응답 때문에 webhook을 메인으로 우회시켰던 구성은 재검토.

---

## 4. DB — PostgreSQL

> 주의 (2026-09-28 실측, v2.40.7 기동 로그): `Postgres 16 is outside the supported range and receives compatibility support only. Upgrade to Postgres 17 or newer.` — 14~16은 더 이상 완전 지원 대상이 아니고 "호환성 지원"으로 격하됨. 신규 구축은 **PostgreSQL 17+**를 우선 고려할 것 (16은 여전히 기동·마이그레이션·실행 자체는 정상 동작 확인됨 — 즉시 차단 사유는 아님).

- SQLite → PostgreSQL 자동 마이그레이션 없음: SQLite 모드에서 `n8n export:workflow --all` + `export:credentials --all` → 빈 PostgreSQL 인스턴스에 `import:*`. PostgreSQL로 가도 **`~/.n8n` 볼륨은 유지**(encryption key·settings).
- 워크플로우 JSON export는 DB 백업을 대체하지 않는다(실행 이력 미포함). `--decrypted`는 평문 export.

---

## 5. Task runner·큐 모드 함정

| 모드 | 동작 | 적합성 |
|------|------|--------|
| **internal** (기본) | 같은 호스트 자식 프로세스, uid/gid 공유 | 공식 문서상 **"insecure by design"**. **2026-09-28 실측(v2.40.7)**: 기동 로그에 "Internal task runner mode is deprecated and will be removed in a future version" — 공식 문서(2026-11-09 확인)도 "deprecated from n8n 3.0 and will be removed in a future version", `N8N_RUNNERS_MODE` 미지정 시에도 경고 |
| **external** | 별도 컨테이너 `n8nio/runners` | 프로덕션 권장. `N8N_RUNNERS_MODE=external`, `N8N_RUNNERS_AUTH_TOKEN`(양쪽 동일), `N8N_RUNNERS_BROKER_LISTEN_ADDRESS=0.0.0.0`, runner 쪽 `N8N_RUNNERS_TASK_BROKER_URI=http://n8n:5679` |

> 주의: `n8nio/runners` 태그는 **n8n 본체 이미지와 동일 버전**(예: 2.46.6)으로 맞춘다. 버전 불일치 시 broker 프로토콜 호환 문제가 생길 수 있다.

- 큐 모드: PostgreSQL + **Redis 6.0+** 필수, `EXECUTIONS_MODE=queue`, 워커 `worker --concurrency=10`(기본 10).
- **모든 인스턴스(메인·워커·webhook processor)가 동일 `N8N_ENCRYPTION_KEY`** — 다르면 credentials 복호화 실패로 워크플로우가 **silent하게 실패**(로그도 모호).
- `QUEUE_HEALTH_CHECK_ACTIVE=true` → 워커가 `/healthz`(liveness)·`/healthz/readiness`(큐·DB 준비) 노출.
- webhook processor 분리 시 로드밸런서에서 `/webhook/*`, `/webhook-waiting/*`를 processor로.

---

## 6. 운영 함정

- **리버스 프록시 뒤 `N8N_WEBHOOK_URL` 누락** → 외부 서비스에 `http://localhost:5678/` 같은 내부 URL을 알려 콜백 실패. 슬래시로 끝나야 한다.
- **인증 없이 외부 노출** → 첫 접속자가 owner가 된다. 설치 직후 owner 생성 → 그 후 방화벽 개방. SSO(SAML·OIDC)·LDAP는 Enterprise, 2FA는 Community에서도 가능. 자동화는 `N8N_INSTANCE_OWNER_MANAGED_BY_ENV`.
- **encryption key 손실** → 모든 credentials 복호화 불가, 재입력 외 복구 방법 없음 → 비밀 저장소에 별도 보관.
- 기타 보안 변수: `N8N_PUBLIC_API_DISABLED=true`(공개 API 미사용 시), `EXECUTIONS_DATA_PRUNE=true` + `EXECUTIONS_DATA_MAX_AGE`(시간), `N8N_BLOCK_FILE_ACCESS_TO_N8N_FILES`·`N8N_RESTRICT_FILE_ACCESS_TO`.

### 라이선스 — Sustainable Use License (fair-code, OSI 오픈소스 아님)

- 내부 비즈니스·비상업·개인 용도 자유, 재배포는 무료·비상업 조건만, 표기 변경 금지.
- **상업적 SaaS 형태로 n8n을 제3자에게 판매·임대 시 n8n과 별도 상업 계약 필요**. 예외: 워크플로우 구축·컨설팅 서비스.

> 주의: 클라이언트에게 n8n 인스턴스를 호스팅·임대해주는 형태(MSP)는 상업 라이선스 대상이다. 컨설팅/구축은 면제.
