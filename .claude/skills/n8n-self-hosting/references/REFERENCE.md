## 10. 업그레이드

n8n은 거의 매주 minor 버전을 출시한다. Docker 업그레이드:

```bash
# docker-compose
docker compose pull
docker compose up -d

# 단일 컨테이너
docker pull docker.n8n.io/n8nio/n8n:stable
docker stop n8n && docker rm n8n
docker run -d ... docker.n8n.io/n8nio/n8n:stable
```

DB 마이그레이션은 컨테이너 시작 시 자동 수행된다. **업그레이드 전 반드시:**

1. PostgreSQL dump
2. `~/.n8n` 볼륨 스냅샷 (가능하면)
3. 릴리즈 노트 확인 (특히 major 버전 변경 — v1 → v2 등)

**v1 → v2 주요 breaking changes (2026 기준):**
- MySQL/MariaDB 지원 제거 → PostgreSQL만
- `N8N_BLOCK_ENV_ACCESS_IN_NODE` 기본값 `true`
- `N8N_SKIP_AUTH_ON_OAUTH_CALLBACK` 기본값 `false`
- `N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS` 동작 강화 (0600 강제)
- Task runner가 **기본 활성화** → `N8N_RUNNERS_ENABLED`는 deprecated (지정 불필요). 외부 runner 모드는 `n8nio/runners` 이미지 사용
- in-memory binary data 모드 제거

업그레이드 후 워크플로우 실행이 실패하면 → 컨테이너 로그(`docker compose logs n8n`)에서 마이그레이션 오류 확인.

**v2.21 → v2.33 사이 셀프호스팅 관점 변경 요약 (2026-08-11 확인):**

| 항목 | 내용 |
|------|------|
| 공식 문서 경로 | `/hosting/...` → `/deploy/host-n8n/...` 전면 개편 (구 경로 404) |
| `N8N_RUNNERS_ENABLED` | 공식 문서에서 제거 — v2에서 지정 불필요 |
| 큐 모드 (v2.34) | 워커가 **크기 제한 없이** webhook 응답을 반환할 수 있게 됨 (대용량 응답 페이로드 제약 해소) |
| AI (v2.22) | MCP Client 노드 없이 에이전트에 MCP 서버 직접 연결 |
| DB / 마이그레이션 | v2.22~2.34 구간에 스키마·마이그레이션 breaking change **없음** |
| 설치 방식 | Docker / docker-compose 절차 변경 **없음** |

> 즉 2.21 → 2.33 업그레이드는 **일반 minor 업그레이드 절차(pull → up -d)로 충분**하다. 별도 마이그레이션 작업은 없다.

**v2.33 → v2.40 사이 셀프호스팅 관점 변경 요약 (2026-09-28 확인):**

| 항목 | 내용 |
|------|------|
| 스케줄러 (v2.36 GA) | **Durable scheduler** GA — 시간 기반 워크플로우를 인메모리 대신 DB-backed 큐로 실행(재시작 생존, 멀티 인스턴스 분산). 기본 off, opt-in(`N8N_SCHEDULER_ENABLED` 등 — 5절 표) |
| 노드 리소스 한도 (v2.38.1) | `NODES_MERGE_SQL_SANDBOX_MEMORY_LIMIT_MB` 신설 — Merge 노드 SQL 샌드박스 메모리 한도(기본 64MB) |
| 보안 (v2.40) | `N8N_AZURE_STORAGE_CUSTOM_ENDPOINTS_ENABLED` 신설 — Azure Storage 커스텀 엔드포인트는 관리자가 명시적으로 켜야 사용 가능(기본 차단) |
| DB / 마이그레이션 | v2.34~2.40 구간에 스키마·마이그레이션 breaking change **없음** (durable scheduler는 opt-in 신규 테이블 추가이며 기존 인스턴스 동작에 영향 없음) |
| 설치 방식 | Docker / docker-compose 절차 변경 **없음** |
| 문서 구조 | `docs.n8n.io/changelog/release-notes-2.x`가 **archived**(더 이상 갱신 안 됨) — 현재 릴리즈 노트는 `docs.n8n.io/changelog/release-notes`로 통합 |

> 즉 2.33 → 2.40 업그레이드도 **일반 minor 업그레이드 절차로 충분**하다. Durable scheduler는 켜기 전까지 기존 인메모리 스케줄러 그대로 동작하므로 업그레이드 자체가 이 기능을 강제하지 않는다.

---

## 11. 큐 모드 (대규모 운영)

워크플로우 실행 부하가 커지면 큐 모드로 전환한다. 메인 인스턴스가 webhook/스케줄을 받아 Redis 큐에 작업을 넣고, 여러 워커가 큐에서 작업을 가져와 실행한다.

**필수 조건:**
- **PostgreSQL** (SQLite 불가)
- **Redis 6.0+** (메시지 브로커)
- 모든 인스턴스가 **동일한 `N8N_ENCRYPTION_KEY`** 공유

```yaml
services:
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

  n8n-main:
    image: docker.n8n.io/n8nio/n8n:stable
    environment:
      EXECUTIONS_MODE: queue
      QUEUE_BULL_REDIS_HOST: redis
      QUEUE_BULL_REDIS_PORT: 6379
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}
      DB_TYPE: postgresdb
      # ... DB 변수들
    depends_on: [postgres, redis]

  n8n-worker:
    image: docker.n8n.io/n8nio/n8n:stable
    command: worker --concurrency=10
    environment:
      EXECUTIONS_MODE: queue
      QUEUE_BULL_REDIS_HOST: redis
      QUEUE_BULL_REDIS_PORT: 6379
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}    # 메인과 반드시 동일
      DB_TYPE: postgresdb
      # ... DB 변수들
    depends_on: [postgres, redis]
    deploy:
      replicas: 3                                   # 워커 3개
```

**워커 스케일링 원칙:**
- 큰 워커 하나보다 **작은 워커 여러 개**가 효율적 (CPU 병렬·burst 흡수)
- 워커당 메모리 200~500MB
- `--concurrency` 기본 10. 워크플로우 무게에 따라 5~20

**워커 헬스체크 (`QUEUE_HEALTH_CHECK_ACTIVE=true`):**

활성화하면 워커가 두 엔드포인트를 노출한다 — 로드밸런서·오케스트레이터 probe에 연결한다.

| 엔드포인트 | 용도 |
|-----------|------|
| `/healthz` | liveness — 프로세스 생존 |
| `/healthz/readiness` | readiness — 큐·DB 연결까지 준비 완료 |

```yaml
  n8n-worker:
    environment:
      QUEUE_HEALTH_CHECK_ACTIVE: 'true'
    healthcheck:
      test: ['CMD-SHELL', 'wget -q -O- http://localhost:5678/healthz/readiness || exit 1']
      interval: 30s
      timeout: 5s
      retries: 3
```

**webhook processor 분리 (선택, 대규모):**

webhook 수신 부하가 큰 경우 메인 인스턴스에서 webhook 처리를 분리한 전용 프로세스를 둘 수 있다.

- `EXECUTIONS_MODE=queue` + 동일 Redis + **동일 `N8N_ENCRYPTION_KEY`** 필요
- `N8N_WEBHOOK_URL`(구 `WEBHOOK_URL`, deprecated alias)을 외부 URL로 지정
- 로드밸런서에서 `/webhook/*`, `/webhook-waiting/*` 경로를 메인이 아닌 webhook processor로 라우팅

> v2.34부터 큐 모드 워커가 **페이로드 크기 제한 없이** webhook 응답을 반환할 수 있다. 대용량 응답 때문에 webhook을
> 메인 프로세스로 우회시켰던 구성이 있으면 재검토 대상.

---

## 11-1. Task runner 모드 (Code 노드 격리)

v2.0부터 task runner가 기본 활성화다. 문제는 **어디서** 실행되느냐다.

| 모드 | 동작 | 적합성 |
|------|------|--------|
| **internal** (기본) | n8n이 같은 호스트에서 자식 프로세스로 runner 기동. uid/gid 공유 | 공식 문서상 **"insecure by design"** — 민감 데이터 프로덕션에는 부적합. **2026-09-28 실측(v2.40.7)**: 기동 로그에 "Internal task runner mode is deprecated and will be removed in a future version"이 명시적으로 출력됨 — 단순 보안 권고를 넘어 **공식 제거 예정** 상태 |
| **external** | 별도 컨테이너(`n8nio/runners`)에서 launcher가 runner 관리 | 프로덕션 권장. Code 노드가 n8n 프로세스와 격리됨 |

```yaml
  n8n:
    environment:
      N8N_RUNNERS_MODE: external
      N8N_RUNNERS_AUTH_TOKEN: ${RUNNERS_AUTH_TOKEN}     # 양쪽 동일
      N8N_RUNNERS_BROKER_LISTEN_ADDRESS: 0.0.0.0        # 외부 컨테이너 접속 허용

  n8n-runners:
    image: n8nio/runners:2.40.7                          # n8n 이미지와 버전 일치
    environment:
      N8N_RUNNERS_TASK_BROKER_URI: http://n8n:5679
      N8N_RUNNERS_AUTH_TOKEN: ${RUNNERS_AUTH_TOKEN}
```

> 주의: `n8nio/runners` 태그는 **n8n 본체 이미지와 동일 버전**으로 맞춘다. 버전 불일치 시 broker 프로토콜 호환 문제가 생길 수 있다.

---

## 12. 보안 베스트 (요약)

| 항목 | 권장 사항 |
|------|---------|
| `N8N_ENCRYPTION_KEY` | 환경 변수로 명시 + 비밀 저장소에 별도 백업 |
| HTTPS | 외부 노출 시 필수. Caddy/Traefik으로 자동 발급 |
| User Management | 첫 노출 전에 owner 계정 생성. 2FA 활성화 |
| webhook URL | 강력한 path 또는 인증 노드(Webhook 노드의 Authentication 옵션) |
| `N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS` | `true` (v2 기본) |
| `N8N_BLOCK_ENV_ACCESS_IN_NODE` | `true` 유지 (v2 기본). 꼭 필요할 때만 `false` |
| 공개 API | 사용 안 하면 `N8N_PUBLIC_API_DISABLED=true` |
| 데이터 보존 | `EXECUTIONS_DATA_PRUNE=true` + `EXECUTIONS_DATA_MAX_AGE` (시간 단위) |
| SSRF 보호 | `N8N_BLOCK_FILE_ACCESS_TO_N8N_FILES`, `N8N_RESTRICT_FILE_ACCESS_TO` 설정 |
| Code 노드 격리 | **`N8N_RUNNERS_MODE=external`** + `n8nio/runners` 사이드카 (기본 internal은 공식적으로 insecure by design) |
| 관측성 | `N8N_OTEL_ENABLED=true` + OTLP 컬렉터 — 실행 실패·지연 추적 (v2.15+) |

---

## 13. 흔한 함정

### 함정 1: `N8N_ENCRYPTION_KEY`를 명시하지 않고 운영

자동 생성 키가 `~/.n8n/config`에만 존재한다. 볼륨이 사라지면 모든 credentials를 잃는다.

```yaml
# 잘못
n8n:
  image: docker.n8n.io/n8nio/n8n:stable
  # N8N_ENCRYPTION_KEY 없음 → 자동 생성, 볼륨 의존
```

```yaml
# 맞음
n8n:
  environment:
    N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}      # .env에 명시 + 별도 백업
```

### 함정 2: 리버스 프록시 뒤에서 `N8N_WEBHOOK_URL`(구 `WEBHOOK_URL`) 누락

`https://n8n.example.com/` 도메인을 쓰는데 `N8N_WEBHOOK_URL`을 지정하지 않으면 n8n이 `http://localhost:5678/` 같은 내부 URL을 webhook 등록 URL로 외부에 알린다 → GitHub/Stripe 등 외부 서비스가 콜백 실패.

```yaml
N8N_WEBHOOK_URL: https://${N8N_HOST}/              # 슬래시로 끝나야 함. 구 WEBHOOK_URL은 2026-09-28 실측(v2.40.7) 기준 deprecated alias
```

### 함정 3: SQLite로 시작 → 나중에 PostgreSQL 전환

SQLite → PostgreSQL 자동 마이그레이션은 없다. 한참 운영 후 전환 시:
1. SQLite 모드로 `n8n export:workflow --all` + `export:credentials --all` 실행
2. PostgreSQL 빈 DB로 새 인스턴스 기동
3. `n8n import:workflow --input=...` + `import:credentials --input=...` 수행

처음부터 PostgreSQL로 시작하는 것이 가장 안전.

### 함정 4: 인증 없이 외부 노출

n8n을 EC2 public IP에 띄우고 User Management owner 계정도 안 만든 채로 외부 접속을 허용하면, 첫 접속자(악의적 외부인)가 owner가 된다. **설치 직후 즉시 owner 계정 생성 → 그 후에 방화벽 개방** 순서를 지킬 것.

### 함정 5: 큐 모드 워커에 다른 encryption key 설정

워커가 메인과 다른 `N8N_ENCRYPTION_KEY`를 갖고 있으면 DB에서 credentials를 복호화할 수 없어 워크플로우가 silent하게 실패한다 (로그도 모호함). docker-compose에서 동일 환경 변수 참조로 통일.

### 함정 6: v2에서 `N8N_RUNNERS_ENABLED`를 계속 지정 (2026-08 정정)

**방향이 반대다.** v2.0부터 task runner는 기본 활성화이며 `N8N_RUNNERS_ENABLED`는 **deprecated**다 —
공식 문서에서도 제거됐다(n8n-docs issue #4328 → PR #4450). v1 시절 compose 파일을 그대로 들고 v2로 올라오면
이 변수가 남아 있는데, 지금 해야 할 일은 **삭제**다. (v1.x를 아직 쓴다면 `true` 유지가 맞다.)

진짜 챙겨야 할 것은 **격리 모드**다 — 기본 `internal`은 n8n과 uid/gid를 공유하는 자식 프로세스라 공식 문서가
"insecure by design"이라 명시한다. 민감 데이터를 다루면 `N8N_RUNNERS_MODE=external` + `n8nio/runners` 사이드카로 간다 (11-1절).

### 함정 7: 상업적 SaaS 형태로 n8n 호스팅 임대

Sustainable Use License는 "n8n을 제3자에게 서비스로 판매"하는 형태를 금지한다. 클라이언트에게 n8n 인스턴스를 임대해 월 사용료를 받는 비즈니스 모델이라면 n8n과 상업 계약 필요. (워크플로우 구축·컨설팅 자체는 면제)

---

## 14. 짝 스킬·관련 자료

| 스킬 | 관계 |
|------|------|
| `devops/docker-deployment` | Docker·docker-compose 일반 패턴 (멀티스테이지, 헬스체크 등) |
| `devops/n8n-workflow-design` | n8n 워크플로우 설계 패턴 (별도 스킬) |

**공식 자료 (2026-08 개편 경로):**
- Docs: https://docs.n8n.io/deploy/host-n8n/
- Hosting 예시 레포: https://github.com/n8n-io/n8n-hosting
- Release notes (현행 통합, 2026-09 기준): https://docs.n8n.io/changelog/release-notes
- Durable scheduler: https://docs.n8n.io/deploy/host-n8n/configure-n8n/durable-scheduler
- Sitemap (경로 확인용): https://docs.n8n.io/sitemap.md
- Community: https://community.n8n.io/

---

## 15. 빠른 체크리스트 (프로덕션 셀프 호스팅)

설치 전:
- [ ] PostgreSQL 14+ 사용 결정
- [ ] `N8N_ENCRYPTION_KEY` 32바이트 이상 랜덤 생성 + 비밀 저장소 백업
- [ ] 도메인 + DNS A 레코드 준비
- [ ] HTTPS 방식 결정 (Caddy/Traefik/Cloudflare Tunnel)
- [ ] 백업 저장소 (S3 등) 준비

설치 직후:
- [ ] User Management owner 계정 즉시 생성
- [ ] 2FA 활성화
- [ ] webhook 노드 Authentication 옵션 검토
- [ ] 자동 백업 cron 설정 (pg_dump + 워크플로우 export)
- [ ] `EXECUTIONS_DATA_PRUNE` 활성화 (실행 이력 무한 적재 방지)
- [ ] compose 파일에 `N8N_RUNNERS_ENABLED`가 남아 있으면 삭제 (v2 deprecated)
- [ ] 민감 데이터 처리 시 `N8N_RUNNERS_MODE=external` + `n8nio/runners` 구성

운영 중:
- [ ] 주 1회 docker pull + 업그레이드 (백업 후)
- [ ] 백업 복구 리허설 분기 1회
- [ ] 릴리즈 노트 확인 (major 업그레이드 시 breaking changes 점검)
- [ ] 큐 모드 운영 시 `QUEUE_HEALTH_CHECK_ACTIVE` + `/healthz/readiness` probe 연결 확인
