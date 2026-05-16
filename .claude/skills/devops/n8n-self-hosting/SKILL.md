---
name: n8n-self-hosting
description: n8n self-host 운영 - Docker·docker-compose, PostgreSQL 백엔드, 리버스 프록시, 큐 모드, 인증·암호화 키·백업 보안 베스트
---

# n8n Self-Hosting

> 소스:
> - https://docs.n8n.io/hosting/
> - https://docs.n8n.io/hosting/installation/docker/
> - https://docs.n8n.io/hosting/installation/server-setups/docker-compose/
> - https://docs.n8n.io/hosting/configuration/environment-variables/database/
> - https://docs.n8n.io/hosting/configuration/configuration-examples/encryption-key/
> - https://docs.n8n.io/hosting/scaling/queue-mode/
> - https://docs.n8n.io/hosting/configuration/user-management-self-hosted/
> - https://docs.n8n.io/sustainable-use-license/
> - https://docs.n8n.io/2-0-breaking-changes/
> - https://github.com/n8n-io/n8n-hosting
>
> 검증일: 2026-05-15
> 대상 버전: n8n v2.x (stable tag, 2026-05 기준 v2.21.x)
> 짝 스킬: `devops/docker-deployment` (컨테이너 일반), `devops/n8n-workflow-design` (워크플로우 설계)

---

## 1. n8n이란

n8n은 노드 기반 시각적 워크플로우 자동화 도구다. Zapier·Make와 유사하지만 자체 서버에서 실행할 수 있고, JavaScript/Python 코드 노드와 자체 노드 개발을 지원한다.

**라이선스 — Sustainable Use License (fair-code)**

n8n은 OSI 인증 오픈소스가 아니다. 소스는 공개되지만 다음 제한이 있다:

- 내부 비즈니스 목적·비상업·개인 용도 자유 사용 가능
- 재배포는 무료·비상업 조건에서만 가능
- 라이선스·저작권 표기 변경 금지
- **상업적 SaaS 형태로 n8n을 제3자에게 판매·임대 시 n8n과 별도 상업 계약 필요**
- 예외: n8n 워크플로우 구축·컨설팅 서비스는 별도 계약 없이 제공 가능

> 주의: 클라이언트에게 n8n 인스턴스를 호스팅·임대해주는 형태(MSP)는 상업 라이선스 대상이다. 컨설팅/구축은 면제.

---

## 2. 설치 옵션 비교

| 옵션 | 적합한 경우 | 비고 |
|------|-----------|------|
| **n8n Cloud** | 운영 부담 최소화, 빠른 시작 | 유료, 실행 횟수 기반 과금 |
| **Docker (단일 컨테이너)** | 소규모 PoC, 개인 사용 | 가장 빠른 self-host |
| **docker-compose** | 소~중규모 프로덕션 | 권장 베이스. DB·리버스 프록시 통합 |
| **Kubernetes (Helm)** | 대규모, 멀티 워커 큐 모드 | n8n-hosting 레포의 helm 차트 사용 |
| **npm 글로벌 설치** | 비권장 | OS/Node 버전 호환성 이슈 잦음 |

n8n 공식은 **Docker 기반 설치를 일반 사용자에게 권장**하며, npm 글로벌 설치는 익숙한 사용자에게만 권장한다.

---

## 3. Docker 단일 컨테이너 (개발·PoC용)

공식 설치 명령:

```bash
docker volume create n8n_data

docker run -d \
  --name n8n \
  --restart unless-stopped \
  -p 5678:5678 \
  -e GENERIC_TIMEZONE="Asia/Seoul" \
  -e TZ="Asia/Seoul" \
  -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true \
  -e N8N_RUNNERS_ENABLED=true \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n:stable
```

| 환경 변수 | 의미 |
|----------|------|
| `GENERIC_TIMEZONE` | 스케줄러 노드(Cron 등) 타임존 |
| `TZ` | 컨테이너 OS 타임존 |
| `N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true` | `~/.n8n/config` 파일 `0600` 권한 강제 |
| `N8N_RUNNERS_ENABLED=true` | Task runner 활성화 (v2.0+ 권장 기본값) |

> 주의: 단일 컨테이너 + SQLite 조합은 동시 쓰기·큐 모드를 지원하지 않는다. 프로덕션은 PostgreSQL로 갈 것.

---

## 4. docker-compose — PostgreSQL + Caddy 리버스 프록시 (프로덕션)

공식 docker-compose 예시는 Traefik + SQLite를 사용하지만, 프로덕션은 **PostgreSQL + 리버스 프록시(Caddy 또는 Traefik)** 조합이 권장된다. 아래는 두 요소를 결합한 구성이다.

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}']
      interval: 5s
      timeout: 5s
      retries: 10

  n8n:
    image: docker.n8n.io/n8nio/n8n:stable
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      # DB
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: ${POSTGRES_DB}
      DB_POSTGRESDB_USER: ${POSTGRES_USER}
      DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD}
      DB_POSTGRESDB_SCHEMA: public
      # Host / URL
      N8N_HOST: ${N8N_HOST}                       # 예: n8n.example.com
      N8N_PROTOCOL: https
      N8N_PORT: 5678
      WEBHOOK_URL: https://${N8N_HOST}/
      # Security
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}
      N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS: 'true'
      N8N_RUNNERS_ENABLED: 'true'
      # Locale
      GENERIC_TIMEZONE: Asia/Seoul
      TZ: Asia/Seoul
    volumes:
      - n8n_data:/home/node/.n8n

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - n8n

volumes:
  postgres_data:
  n8n_data:
  caddy_data:
  caddy_config:
```

```caddy
# Caddyfile — Let's Encrypt 자동 발급
n8n.example.com {
    reverse_proxy n8n:5678
}
```

```bash
# .env
POSTGRES_USER=n8n
POSTGRES_PASSWORD=<강력한_랜덤_문자열>
POSTGRES_DB=n8n
N8N_HOST=n8n.example.com
N8N_ENCRYPTION_KEY=<32바이트_이상_랜덤_문자열>
```

`N8N_ENCRYPTION_KEY` 생성 예시:

```bash
openssl rand -hex 32
```

---

## 5. 핵심 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `N8N_HOST` | `localhost` | 외부에서 접근할 호스트명 (예: `n8n.example.com`) |
| `N8N_PROTOCOL` | `http` | `https` 권장 |
| `N8N_PORT` | `5678` | 컨테이너 내부 포트 |
| `WEBHOOK_URL` | `${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}/` | 외부 webhook 콜백 URL. 리버스 프록시 뒤에서는 명시 필수 |
| `DB_TYPE` | `sqlite` | 프로덕션은 `postgresdb` |
| `DB_POSTGRESDB_HOST` | `localhost` | PostgreSQL 호스트 |
| `DB_POSTGRESDB_PORT` | `5432` | PostgreSQL 포트 |
| `DB_POSTGRESDB_DATABASE` | `n8n` | DB 이름 |
| `DB_POSTGRESDB_USER` | `postgres` | DB 사용자 |
| `DB_POSTGRESDB_PASSWORD` | (없음) | DB 비밀번호 |
| `DB_POSTGRESDB_SCHEMA` | `public` | 스키마 |
| `DB_POSTGRESDB_POOL_SIZE` | `2` | 풀 크기 |
| `DB_POSTGRESDB_SSL_ENABLED` | `false` | RDS 등 외부 DB는 `true` |
| `N8N_ENCRYPTION_KEY` | (자동 생성) | **반드시 명시 + 백업**. credentials 암호화에 사용 |
| `GENERIC_TIMEZONE` | `America/New_York` | 스케줄러 타임존 |
| `N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS` | `false` (v1) → `true` 권장 | settings 파일 `0600` 권한 강제 |
| `N8N_RUNNERS_ENABLED` | v2.0+ `true` | Task runner 활성화 |
| `EXECUTIONS_MODE` | `regular` | 큐 모드는 `queue` |

> 주의 (v2.0 변경): `N8N_BLOCK_ENV_ACCESS_IN_NODE=true`가 기본. Code 노드에서 `process.env` 접근이 기본 차단된다. 필요 시 명시적으로 `false` 지정.

---

## 6. PostgreSQL 백엔드 (프로덕션 권장)

- **왜 PostgreSQL?** SQLite는 단일 프로세스 쓰기만 안전하다. 큐 모드·다중 워커·고가용성을 위해 PostgreSQL 필수.
- **버전 권장:** PostgreSQL 14+ (위 예시는 16 사용).
- **v2.0부터 MySQL/MariaDB 지원 중단.** PostgreSQL만 공식 지원.

**처음 PostgreSQL로 전환할 때 주의:**

1. n8n을 한 번도 띄우지 않은 상태에서 PostgreSQL 환경 변수 설정 후 시작 → 마이그레이션이 빈 DB에 테이블을 만든다.
2. SQLite로 운영하다가 PostgreSQL로 전환 시 데이터 마이그레이션은 자동이 아니다 → 워크플로우/credentials를 export 후 PostgreSQL 인스턴스로 import.

---

## 7. HTTPS·도메인 — 옵션별 선택

| 방식 | 적합한 경우 |
|------|-----------|
| **Caddy** | 가장 간단. Let's Encrypt 자동 발급/갱신. Caddyfile 한 파일 |
| **Traefik** | 다른 서비스도 함께 운영. 라벨 기반 라우팅 |
| **Cloudflare Tunnel** | 포트 개방 없이 외부 노출. webhook URL은 Cloudflare 도메인 |
| **Nginx + certbot** | 기존 Nginx 인프라가 있을 때 |

**webhook URL 주의:** 리버스 프록시 뒤에 있을 때 `WEBHOOK_URL`을 외부 URL로 명시하지 않으면 외부 서비스(GitHub, Stripe 등)가 잘못된 URL로 callback을 보낸다.

---

## 8. 인증 — User Management

n8n v1.0+부터 내장 User Management가 표준이다. 별도 BASIC_AUTH 설정 없이 첫 접속 시 owner 계정 생성 wizard가 뜬다.

**설정 흐름:**

1. n8n 시작 → 첫 접속자가 owner 계정 생성 (이메일 + 비밀번호)
2. 설치 직후 즉시 owner 계정을 만들어 외부 노출 전 잠금
3. `Settings → Users`에서 추가 사용자 초대 (SMTP 설정 필요)
4. 2FA 활성화 권장

**환경 변수로 owner 사전 프로비저닝 (자동화):**

```yaml
N8N_INSTANCE_OWNER_MANAGED_BY_ENV: 'true'
# (이메일/비밀번호 환경 변수는 공식 문서 참조)
```

**Enterprise 라이선스:**
- SSO (SAML, OIDC) — Enterprise 플랜
- LDAP — Enterprise 플랜
- 2FA — Community/Self-hosted에서도 사용 가능

> 주의: 인증 없이 n8n을 외부에 노출하면 누구나 워크플로우를 실행/수정할 수 있다. webhook URL만 비공개여도 워크플로우는 그대로 노출된다. **반드시 user management를 켜고 owner 생성 후 노출**.

---

## 9. 백업·복구

**3가지 백업 대상이 모두 필요하다:**

1. **PostgreSQL 데이터베이스** — 워크플로우 정의, 실행 이력, credentials(암호화된 형태)
2. **`~/.n8n` 볼륨** — encryption key, settings 파일
3. **`N8N_ENCRYPTION_KEY`** — 환경 변수로 명시한 경우, 별도 보관처에 백업

**PostgreSQL dump:**

```bash
# 백업
docker compose exec postgres pg_dump -U n8n -d n8n -F c > backups/n8n-$(date +%F).dump

# 복원
docker compose exec -T postgres pg_restore -U n8n -d n8n --clean < backups/n8n-2026-05-15.dump
```

**워크플로우 CLI export (보조 백업, Git 버전 관리용):**

```bash
docker compose exec n8n n8n export:workflow --all --output=/home/node/.n8n/exports/workflows.json
docker compose exec n8n n8n export:credentials --all --output=/home/node/.n8n/exports/credentials.json
# --decrypted 플래그는 평문 export (보안 위험, 신중히)
```

> 주의: 워크플로우 JSON export는 **DB 백업을 대체하지 않는다**. credentials와 실행 이력은 JSON에 포함되지 않음. pg_dump가 1순위, JSON export는 Git 버전 관리용 보조.

**복구 시나리오 — encryption key 손실:**

`N8N_ENCRYPTION_KEY`를 잃으면 모든 credentials가 invalid가 되어 복호화 불가능하다. **재입력 외에 복구 방법 없음**. 키는 password manager나 비밀 저장소(Vault 등)에 반드시 별도 보관.

---

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
- Task runner: 기본 이미지에서 분리. 외부 runner 모드는 `n8nio/runners` 이미지 사용

업그레이드 후 워크플로우 실행이 실패하면 → 컨테이너 로그(`docker compose logs n8n`)에서 마이그레이션 오류 확인.

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
| Code 노드 격리 | Task runner 모드(`n8nio/runners` 이미지) 활용 |

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

### 함정 2: 리버스 프록시 뒤에서 `WEBHOOK_URL` 누락

`https://n8n.example.com/` 도메인을 쓰는데 `WEBHOOK_URL`을 지정하지 않으면 n8n이 `http://localhost:5678/` 같은 내부 URL을 webhook 등록 URL로 외부에 알린다 → GitHub/Stripe 등 외부 서비스가 콜백 실패.

```yaml
WEBHOOK_URL: https://${N8N_HOST}/                  # 슬래시로 끝나야 함
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

### 함정 6: v1 → v2 업그레이드 시 `N8N_RUNNERS_ENABLED` 누락

v2.0부터 task runner가 기본 권장. 명시하지 않으면 deprecation warning이 뜨고, 일부 보안 격리 기능이 비활성화된다.

### 함정 7: 상업적 SaaS 형태로 n8n 호스팅 임대

Sustainable Use License는 "n8n을 제3자에게 서비스로 판매"하는 형태를 금지한다. 클라이언트에게 n8n 인스턴스를 임대해 월 사용료를 받는 비즈니스 모델이라면 n8n과 상업 계약 필요. (워크플로우 구축·컨설팅 자체는 면제)

---

## 14. 짝 스킬·관련 자료

| 스킬 | 관계 |
|------|------|
| `devops/docker-deployment` | Docker·docker-compose 일반 패턴 (멀티스테이지, 헬스체크 등) |
| `devops/n8n-workflow-design` | n8n 워크플로우 설계 패턴 (별도 스킬) |

**공식 자료:**
- Docs: https://docs.n8n.io/hosting/
- Hosting 예시 레포: https://github.com/n8n-io/n8n-hosting
- Release notes: https://docs.n8n.io/release-notes/
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

운영 중:
- [ ] 주 1회 docker pull + 업그레이드 (백업 후)
- [ ] 백업 복구 리허설 분기 1회
- [ ] 릴리즈 노트 확인 (major 업그레이드 시 breaking changes 점검)
