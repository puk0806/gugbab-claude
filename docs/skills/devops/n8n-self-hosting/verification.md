---
skill: n8n-self-hosting
category: devops
version: v3
date: 2026-09-28
status: PENDING_TEST
---

# n8n Self-Hosting 검증 문서

> 이 문서는 `.claude/skills/n8n-self-hosting/SKILL.md` 스킬의 검증 기록이다.

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `n8n-self-hosting` |
| 스킬 경로 | `.claude/skills/n8n-self-hosting/SKILL.md` |
| 검증일 | **2026-09-28** (최초 작성 2026-05-15, 재검증 2026-08-11 / 2026-09-28) |
| 검증자 | skill-creator (최초) → 최신화 재검증 (2026-08-11) → 2차 재검증 (2026-09-28) |
| 스킬 버전 | v3 |
| 대상 버전 | n8n v2.x — 2026-09-28 기준 **stable v2.40.7 / beta v2.41.3** (v1 작성 시점: v2.21.x, v2 재검증 시점: v2.33.7) |

---

## 1. 작업 목록 (Task List)

- [✅] 공식 문서 1순위 소스 확인 (docs.n8n.io)
- [✅] 공식 GitHub 2순위 소스 확인 (n8n-io/n8n-docs, n8n-io/n8n-hosting)
- [✅] 최신 버전 기준 내용 확인 (2026-05-14 기준 stable v2.21.x)
- [✅] 핵심 패턴·베스트 프랙티스 정리 (15개 섹션)
- [✅] 코드 예시 작성 (docker run, docker-compose, Caddyfile, .env, 큐 모드)
- [✅] 흔한 실수 패턴 정리 (7개 함정)
- [✅] SKILL.md 파일 작성
- [✅] verification.md 작성
- [✅] skill-tester 호출 (2026-05-15 완료 — content test 3/3 PASS, 실사용 필수 카테고리로 PENDING_TEST 유지)

---

## 2. 실행 에이전트 로그

| 단계 | 도구 | 입력 요약 | 출력 요약 |
|------|------|-----------|-----------|
| 조사 | WebSearch | "n8n self-hosting docker-compose 공식 문서 2026" 외 4건 | 공식 docs.n8n.io 페이지 다수 + n8n-io/n8n-hosting 레포 확인 |
| 조사 | WebFetch (raw GitHub) | docs.n8n.io 페이지 4건 raw markdown 직접 fetch | Docker 설치 명령, env 변수, queue mode, 2.0 breaking changes 확보 |
| 교차 검증 | WebSearch | encryption key·queue mode·라이선스·버전·백업 클레임 검증 | 8개 클레임 VERIFIED, 0 DISPUTED, 0 UNVERIFIED |
| 작성 | Write | SKILL.md (15섹션), verification.md | 본 문서 생성 |

---

## 3. 조사 소스

| 소스명 | URL | 신뢰도 | 날짜 | 비고 |
|--------|-----|--------|------|------|
| n8n 공식 — Hosting | https://docs.n8n.io/hosting/ | ⭐⭐⭐ High | 2026-05-15 | 1순위 |
| n8n 공식 — Docker | https://docs.n8n.io/hosting/installation/docker/ | ⭐⭐⭐ High | 2026-05-15 | 설치 명령 출처 |
| n8n 공식 — Docker Compose | https://docs.n8n.io/hosting/installation/server-setups/docker-compose/ | ⭐⭐⭐ High | 2026-05-15 | compose 구조 |
| n8n 공식 — DB env vars | https://docs.n8n.io/hosting/configuration/environment-variables/database/ | ⭐⭐⭐ High | 2026-05-15 | DB_POSTGRESDB_* 전체 표 |
| n8n 공식 — Encryption key | https://docs.n8n.io/hosting/configuration/configuration-examples/encryption-key/ | ⭐⭐⭐ High | 2026-05-15 | N8N_ENCRYPTION_KEY |
| n8n 공식 — Queue mode | https://docs.n8n.io/hosting/scaling/queue-mode/ | ⭐⭐⭐ High | 2026-05-15 | 큐 모드 아키텍처 |
| n8n 공식 — User Management self-hosted | https://docs.n8n.io/hosting/configuration/user-management-self-hosted/ | ⭐⭐⭐ High | 2026-05-15 | owner setup |
| n8n 공식 — Sustainable Use License | https://docs.n8n.io/sustainable-use-license/ | ⭐⭐⭐ High | 2026-05-15 | 라이선스 |
| n8n 공식 — 2.0 Breaking Changes | https://docs.n8n.io/2-0-breaking-changes/ | ⭐⭐⭐ High | 2026-05-15 | v2 변경점 |
| n8n GitHub — n8n-hosting | https://github.com/n8n-io/n8n-hosting | ⭐⭐⭐ High | 2026-05-15 | 공식 hosting 예시 |
| n8n GitHub — n8n-docs raw | https://raw.githubusercontent.com/n8n-io/n8n-docs/main/... | ⭐⭐⭐ High | 2026-05-15 | JS 렌더 우회용 raw |
| Docker Hub — n8nio/n8n | https://hub.docker.com/r/n8nio/n8n/tags | ⭐⭐⭐ High | 2026-05-15 | 버전 확인 |
| Release notes | https://docs.n8n.io/release-notes/ | ⭐⭐⭐ High | 2026-05-15 | 2026-05-14 릴리즈 확인 |

---

## 4. 검증 체크리스트 (Test List)

### 4-1. 내용 정확성

- [✅] 공식 문서와 불일치하는 내용 없음 (10개 클레임 전부 VERIFIED)
- [✅] 버전 정보 명시 (n8n v2.x stable, 2026-05 기준 v2.21.x)
- [✅] deprecated 패턴 권장 안 함 (v1 → v2 breaking changes 반영, MySQL 미사용)
- [✅] 코드 예시 실행 가능 형태 (docker run/compose/Caddyfile/.env)

### 4-2. 구조 완전성

- [✅] YAML frontmatter 포함 (name, description)
- [✅] 소스 URL과 검증일 명시 (10개 URL + 2026-05-15)
- [✅] 핵심 개념 설명 포함 (라이선스·설치 옵션·DB·HTTPS·인증·백업·업그레이드·큐 모드·보안)
- [✅] 코드 예시 포함 (docker-compose 풀스택, Caddyfile, .env, 큐 모드)
- [✅] 언제 사용/언제 사용하지 않을지 기준 포함 (설치 옵션 비교 표)
- [✅] 흔한 실수 패턴 포함 (7개 함정)

### 4-3. 실용성

- [✅] 에이전트 참조 시 실제 구축에 도움 (docker-compose 그대로 사용 가능)
- [✅] 이론적이 아닌 실용 예시 (.env 템플릿, openssl rand 명령, cron 백업)
- [✅] 범용적 사용 가능 (특정 프로젝트 종속 없음)

### 4-4. Claude Code 에이전트 활용 테스트

- [✅] 해당 스킬 참조 에이전트 테스트 질문 수행 (2026-05-15 3/3 PASS / 2026-09-28 재테스트 2/2 PASS / 2026-09-28 실사용(실행) 검증 정정분 재테스트 2/2 PASS — 누적 7/7 PASS)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-05-15, 2026-09-28 ×2)
- [✅] 잘못된 응답 발생 시 스킬 내용 보완 (gap 없음 — 경미한 문서 안내 표기 개선 후보 2건만 발견, 둘 다 차단 요인 아님)

### 4-5. 교차 검증 클레임 판정

| # | 클레임 | 소스 1 | 소스 2 | 판정 |
|---|--------|--------|--------|------|
| 1 | n8n stable Docker tag는 `docker.n8n.io/n8nio/n8n:stable`이며 2026-05 기준 v2.21.x | docs.n8n.io Docker | Docker Hub n8nio/n8n tags | VERIFIED |
| 2 | `DB_TYPE=postgresdb` + `DB_POSTGRESDB_*` 환경 변수로 PostgreSQL 연결 | docs.n8n.io database env | docs.n8n.io supported-databases | VERIFIED |
| 3 | `N8N_ENCRYPTION_KEY` 미명시 시 자동 생성되어 `~/.n8n/config`에 저장, 손실 시 모든 credentials 복호화 불가 | docs.n8n.io encryption-key | community.n8n.io 다수 보고 | VERIFIED |
| 4 | 큐 모드 시 모든 인스턴스가 동일한 `N8N_ENCRYPTION_KEY` 공유 필수 | docs.n8n.io queue-mode | docs.n8n.io encryption-key 문서 명시 | VERIFIED |
| 5 | 큐 모드는 Redis 6.0+ 필요, `EXECUTIONS_MODE=queue` + worker command | docs.n8n.io queue-mode | n8n-docs GitHub raw | VERIFIED |
| 6 | Sustainable Use License — 내부 비즈니스/비상업 자유, 상업 SaaS 임대는 별도 계약 필요, 컨설팅은 면제 | docs.n8n.io sustainable-use-license | blog.n8n.io 발표 | VERIFIED |
| 7 | v1.0+ User Management 내장 — 첫 접속자가 owner, `N8N_INSTANCE_OWNER_MANAGED_BY_ENV`로 사전 프로비저닝 | docs.n8n.io user-management-self-hosted | community.n8n.io | VERIFIED |
| 8 | v2.0 breaking — MySQL/MariaDB 제거(PostgreSQL only), `N8N_BLOCK_ENV_ACCESS_IN_NODE=true` 기본, `N8N_SKIP_AUTH_ON_OAUTH_CALLBACK=false` 기본 | docs.n8n.io 2-0-breaking-changes | n8n-docs GitHub raw | VERIFIED |
| 9 | 백업은 pg_dump가 1순위, `n8n export:workflow`·`export:credentials`는 보조 (실행 이력 미포함) | docs.n8n.io cli-commands | community.n8n.io 백업 가이드 다수 | VERIFIED |
| 10 | 리버스 프록시 뒤에서 `WEBHOOK_URL` 명시 안 하면 webhook callback 실패 | docs.n8n.io environment-variables | community.n8n.io 실제 사례 | VERIFIED |

**판정 요약 (v1, 2026-05-15): VERIFIED 10 / DISPUTED 0 / UNVERIFIED 0**

### 4-6. 최신화 재검증 클레임 판정 (2026-08-11, v2)

| # | 클레임 | 소스 1 | 소스 2 | 판정 |
|---|--------|--------|--------|------|
| 11 | 2026-08-11 기준 stable은 v2.33.7, beta는 v2.34.4 | GitHub n8n-io/n8n releases (2026-08-07) | docs.n8n.io install-with-docker 페이지 내 버전 표기 | VERIFIED |
| 12 | 공식 문서 경로가 `/hosting/...` → `/deploy/host-n8n/...`로 개편, 구 경로는 404 | 구 URL 4건 직접 fetch → 전부 404 | docs.n8n.io/sitemap.md 신규 경로 목록 | VERIFIED |
| 13 | **`N8N_RUNNERS_ENABLED`는 v2.0+에서 deprecated이며 지정 불필요** (v1 스킬은 "v2.0+ 권장 기본값 true"로 서술 → 오류) | docs.n8n.io install-with-docker / set-up-task-runners | n8n-docs issue #4328 + PR #4450 (문서에서 변수 제거) | **DISPUTED → 본문 정정 완료** |
| 14 | Task runner internal 모드는 uid/gid 공유로 공식 문서상 "insecure by design", 프로덕션은 external + `n8nio/runners` | docs.n8n.io set-up-task-runners | 동 문서 내 external 모드 env 표 | VERIFIED |
| 15 | 큐 모드 워커는 `QUEUE_HEALTH_CHECK_ACTIVE` 시 `/healthz`·`/healthz/readiness` 노출 | docs.n8n.io enable-queue-mode | 동 문서 webhook processor 절 | VERIFIED |
| 16 | v2.34에서 큐 모드 워커가 페이로드 크기 제한 없이 webhook 응답 반환 가능 | docs.n8n.io changelog release-notes-2.x | releases.sh / releasebot n8n 2.34 요약 | VERIFIED |
| 17 | v2.22~2.34 구간에 DB 스키마·마이그레이션·Docker 설치 절차 breaking change 없음 | docs.n8n.io changelog release-notes-2.x 전 구간 확인 | GitHub releases 목록(패치 위주) | VERIFIED |
| 18 | 신규 운영 env: `N8N_OTEL_ENABLED`/`N8N_OTEL_EXPORTER_OTLP_ENDPOINT`(2.15), `N8N_TOKEN_EXCHANGE_TRUSTED_KEYS`(2.16), `N8N_INSIGHTS_MAX_AGE_DAYS`(2.20) | docs.n8n.io changelog release-notes-2.x | 각 버전 릴리즈 노트 항목 | VERIFIED |
| 19 | v2.19부터 환경 변수만으로 instance bootstrapping 가능 | docs.n8n.io changelog release-notes-2.x v2.19 | — (단일 소스) | UNVERIFIED → 본문에 부가 언급만, 코드 예시 미포함 |
| 20 | Sustainable Use License 조건 변경 없음 (URL만 `/privacy-and-security/sustainable-use-license`로 이동) | docs.n8n.io 라이선스 페이지 | blog.n8n.io 라이선스 발표 + GitHub LICENSE.md | VERIFIED |

**판정 요약 (v2, 2026-08-11): VERIFIED 9 / DISPUTED 1(정정 완료) / UNVERIFIED 1(범위 축소 처리)**

> DISPUTED 1건(#13)은 v1 본문의 **명백한 오류**였다 — 함정 6이 "`N8N_RUNNERS_ENABLED` 누락 주의"로 정반대를 안내하고 있었고,
> 이번 개정에서 "v2에서는 삭제하라"로 뒤집었다.

---

## 5. 테스트 진행 기록

### [2026-09-28] skill-tester 재테스트 — WEBHOOK_URL 개명 + 압축 노드 기본값·PostgreSQL 16·internal task runner deprecated 정정분 검증

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (도메인 특화 에이전트 부재로 대체)
**수행 방법**: SKILL.md + references/REFERENCE.md만 근거로 답하도록 지시한 general-purpose 에이전트 2건을 병렬 실행. "실사용(실행) 검증"에서 정정된 5건 중 `N8N_WEBHOOK_URL` 개명, 압축 노드 기본값(2GiB/5000 vs 향후 축소 예정값), PostgreSQL 16 호환 등급 격하, internal task runner 모드 공식 제거 예정 표기를 직접 겨냥.

### 실제 수행 테스트

**Q1. Caddy 리버스 프록시 뒤에서 예전 `WEBHOOK_URL`을 그대로 써도 되는가**
- ✅ PASS
- 근거: SKILL.md §5 핵심 환경 변수 표 `N8N_WEBHOOK_URL`(구 `WEBHOOK_URL`) 행 + §7 webhook URL 주의 + §13 함정 2 + §4 docker-compose 예시
- 상세: `WEBHOOK_URL`이 v2.40.7 기동 로그 기준 deprecated alias이며 동작은 계속하지만 신규 구성은 `N8N_WEBHOOK_URL`을 써야 한다는 정정 내용을 정확히 인용. 값 형식(슬래시로 끝나야 함)까지 함정 2 근거로 정확히 제시. gap: REFERENCE.md 11절 webhook processor 분리 예시가 여전히 구 이름 `WEBHOOK_URL`만 쓰고 있어 SKILL.md §5/§7/§13의 정리된 원칙과 표기가 불일치한다는 점을 에이전트가 스스로 지적(아래 "발견된 gap" 참조).

**Q2. 신규 구축 시 PostgreSQL 16 그대로 사용 + Code 노드 격리 기본(internal) 설정 유지 — 문제 여부**
- ✅ PASS
- 근거: SKILL.md §6(PostgreSQL 16 "compatibility support only" 실측 주의문) + REFERENCE.md 11-1절(internal 모드 "insecure by design" + "deprecated and will be removed") + SKILL.md §12 보안 베스트 표 + §15 체크리스트
- 상세: PostgreSQL 16은 "즉시 차단 사유는 아니나 신규 구축은 17+ 우선 고려"라는 정확한 톤으로 답하고, Code 노드 격리는 기본(internal)이 공식적으로 "insecure by design"이며 v2.40.7 기동 로그에서 이미 제거 예정(deprecated) 경고까지 뜬다는 점을 근거로 `N8N_RUNNERS_MODE=external` 전환을 명확히 권장. 두 결정 모두 "문제없음"으로 답하지 않고 정확히 근거를 들어 반박.

### 발견된 gap

- 경미(선택 보강, 신규 발견): REFERENCE.md 11절 "webhook processor 분리" 예시(133행)가 `N8N_WEBHOOK_URL`이 아닌 구 이름 `WEBHOOK_URL`을 그대로 쓰고 있어, §5/§7/§13에서 정리한 "N8N_WEBHOOK_URL로 통일, WEBHOOK_URL은 deprecated alias" 원칙과 표기가 어긋남 — 2026-09-28 실사용 검증 정정 시 미반영된 잔재로 추정. 차단 요인 아님, SKILL.md 본 수정 범위 밖이라 이번엔 미수정.
- 경미: PostgreSQL 16의 정확한 호환성 지원 종료(EOL) 일정이 SKILL.md/REFERENCE.md에 없음 — "즉시 차단 사유는 아님"까지만 서술. 선택 보강.

### 판정

- agent content test: 2/2 PASS
- verification-policy 분류: 워크플로우/빌드 설정/인프라 스킬 — 실사용 필수 카테고리
- 최종 상태: PENDING_TEST 유지 (2026-09-28 실사용(실행) 검증 정정분 content test 통과, 실 self-host 전체 사이클 미충족은 기존과 동일)

---

### [2026-09-28] 실사용(실행) 검증

**수행일**: 2026-09-28
**수행 방법**: 로컬 Docker 27.3.1 데몬, 레포 밖 lab 작업공간에 docker-compose 5-서비스 스택(postgres:16 + redis:7-alpine + n8n-main + n8n-worker + n8nio/runners 사이드카, 전부 `2.40.7` 버전 핀) 구성. `docker compose pull` → `up -d` → `/healthz` curl → 로그·psql·redis-cli로 환경변수 서술 대조 → CLI(`import:workflow`/`execute`)로 Code 노드 `$env` 차단 동작 확인 → `docker compose down -v`로 정리(계정 생성·외부 webhook 노출·라이선스 활성화 없음).
**실행 결과** (서술과 대조):
- `docker compose up -d` 성공, 전 컨테이너 healthy. `curl http://127.0.0.1:5678/healthz` → `HTTP 200 {"status":"ok"}` — 서술과 **일치**.
- 큐 모드(`EXECUTIONS_MODE=queue` + `QUEUE_BULL_REDIS_HOST/PORT`): redis 내 `bull:jobs:stalled-check` 키 생성 확인, worker 로그 `Queue: jobs` `Concurrency: 5` — **일치**.
- Task runner external 모드(`N8N_RUNNERS_MODE=external` + `N8N_RUNNERS_BROKER_LISTEN_ADDRESS` + `n8nio/runners:2.40.7` 사이드카): n8n-main 로그에 `n8n Task Broker ready on 0.0.0.0, port 5679` + `Registered runner "launcher-python"` / `"launcher-javascript"` — 사이드카가 브로커에 정상 연결. REFERENCE.md 11-1절 서술과 **일치**.
- Durable scheduler(`N8N_SCHEDULER_ENABLED=true` + `N8N_USE_WORKFLOW_PUBLICATION_SERVICE=true`): 컨테이너 `printenv`로 값 인식 확인, 관련 마이그레이션(`CreateSchedulerTables`, `CreateWorkflowPublicationOutboxTable` 등) 전부 성공, 에러 없음. "재시작 후 스케줄 유지"까지는 이번 세션 범위 밖 — **부분 확인**.
- Code 노드 `N8N_BLOCK_ENV_ACCESS_IN_NODE` 차단(CLI `execute`로 3가지 조합 비교): 미지정(기본) → `$env.N8N_LAB_SECRET` 접근 시 `"access to env vars denied"`로 차단(**기본값 true와 일치**) / `=false` 명시 → canary 값(`leak-check-canary-value`) 그대로 반환(차단 해제 확인, **일치**) / `=true` 명시 → 동일하게 차단(**일치**). 참고: raw `process`(`process.env`)는 이 값과 무관하게 항상 `undefined` — Task Runner 샌드박스가 Node `process` 전역 자체를 노출하지 않으며, 실제 차단 대상은 n8n의 `$env` 프록시임을 이번 테스트로 명확히 확인(SKILL.md 서술과 모순은 아님, 브리핑이 요구한 `$env` 기준으로 검증 완료).
- PostgreSQL 스키마 마이그레이션: `\dt` 확인 결과 142개 테이블 정상 생성(`workflow_publication_outbox`·`workflow_publication_trigger_status` 등 durable scheduler 관련 테이블 포함) — 서술과 **일치**.
- **서술 오류 발견 및 정정** (실행으로 확인된 명백한 불일치, SKILL.md·references/REFERENCE.md Edit로 최소 정정 완료):
  1. `WEBHOOK_URL` — v2.40.7 기동 로그가 `"WEBHOOK_URL -> Use N8N_WEBHOOK_URL instead"` deprecation을 명시. 기존 SKILL.md docker-compose 예시·env 표·REFERENCE.md 함정 2가 전부 구 이름만 사용 → `N8N_WEBHOOK_URL`로 정정, 구 이름은 "deprecated alias"로 병기.
  2. `N8N_COMPRESSION_NODE_MAX_DECOMPRESSED_SIZE_BYTES` 기본값 — SKILL.md/§4-6 클레임 4는 `268435456`(256MiB)로 서술했으나 실측 기본값은 `2147483648`(2GiB)이며, 256MiB는 **향후 버전 예정 축소값**("will be reduced from 2 GiB to 256 MiB in a future version")이었음 → SKILL.md 표 정정. §4-6 클레임 4는 공식 문서 페이지 자체의 표기(설명 문구)를 그대로 옮긴 것으로 문서상 근거는 있었으나, **실행 중인 인스턴스의 실제 동작 기본값과는 달랐다** — 문서와 런타임 동작이 어긋나는 경우였음.
  3. `N8N_COMPRESSION_NODE_MAX_ZIP_ENTRIES` 기본값 — 서술은 `1000`이었으나 실측 기본값은 `5000`(1000은 향후 축소 예정값) → 위와 동일한 사유로 SKILL.md 표 정정.
  4. PostgreSQL 16 지원 등급 — v2.40.7 기동 로그가 `"Postgres 16 is outside the supported range and receives compatibility support only. Upgrade to Postgres 17 or newer."`를 명시적으로 출력. SKILL.md는 "PostgreSQL 14+" 권장만 서술 → 17+ 상향 권고 주의문 추가(16 자체는 기동·마이그레이션·실행 정상 확인되어 즉시 차단 사유는 아님을 병기).
  5. Task runner internal 모드 — REFERENCE.md는 "insecure by design"으로만 서술했으나 실측 로그는 `"Internal task runner mode is deprecated and will be removed in a future version"`까지 명시 → 공식 제거 예정 상태임을 추가 병기.
- **참고용 미반영 사항** (오류는 아니라 SKILL.md 미수정, 이 기록에만 남김): 큐 모드에서 `N8N_RUNNERS_MODE=external`을 main에만 지정하면 worker는 독립적으로 internal 모드 기본값을 쓴다(실측: worker 로그에 동일 deprecation 경고 + Python3 부재로 Python 러너 기동 실패, JS 러너는 자체 기동 성공 — 워크플로우 실행 자체는 JS 러너로 정상 처리됨). REFERENCE.md 11-1절 예시가 단일 `n8n:` 서비스만 보여 이 조합을 명시하지 않을 뿐 기존 서술과 모순은 아니므로 이번엔 미수정 — 아래 섹션 7에 향후 보강 후보로 기록.

**졸업 조건 충족 여부**: **부분** — 브리핑에서 요구한 핵심 항목(compose 기동, `/healthz` 헬스체크, 핵심 환경변수 서술 대조, CLI 워크플로우 삽입, Code 노드 `$env` 차단 확인)은 실제로 수행·확인함. 다만 아래 "향후 실 self-host 검증 시 확인할 항목" 체크리스트 중 HTTPS/Let's Encrypt·User Management owner 계정 생성·webhook 외부 노출·백업 복원 리허설·실제 minor 업그레이드(pull→up -d 반복) 사이클은 이번 세션에서 **의도적으로 제외**함(계정 생성 금지·외부 웹훅 공개 금지 지침 및 랩 세션 범위 제한에 따름). 남은 것: 해당 체크리스트 항목들.
**판정**: **PENDING_TEST 유지** — 이번 실행으로 핵심 서술(큐 모드·external task runner·durable scheduler 신규 변수·`$env` 차단 기본값·DB 마이그레이션)의 정확성은 강하게 확인되었고 서술 오류 5건은 정정했으나, 졸업 조건표가 요구하는 전체 범위(계정·HTTPS·백업 복원·업그레이드 사이클)를 전부 충족하지 못했으므로 APPROVED 전환은 보류.

---

### [2026-09-28] 선택 보강 반영

2026-09-28 재테스트 Q2에서 발견된 gap(91행 "아래 'task runner 모드' 참조" 문구가 어느 파일을 가리키는지 불명확) 반영. SKILL.md 91행(93행 번역 기준) 문구를 "`references/REFERENCE.md` '11-1. Task runner 모드 (Code 노드 격리)' 절 참조"로 구체화(내부 파일 내 절 번호 참조 — 소스 확인 불필요). status는 실사용 필수 카테고리 원칙에 따라 PENDING_TEST 유지.

**수행일**: 2026-09-28
**수행자**: skill-tester → general-purpose (도메인 전용 에이전트 미설치로 대체 사용)
**수행 방법**: 2026-09-28 2차 재검증(§섹션 5 "[2026-09-28] 재검증(2차)" 블록)에서 신규 보강된 v2.34~2.40 운영 변수(durable scheduler 등)를 겨냥해 SKILL.md + references/REFERENCE.md Read 후 실전 질문 2개 답변, 근거 파일·섹션 대조 및 참조 링크(REFERENCE.md) 실제 필요 여부 확인

### 실제 수행 테스트 (2026-09-28)

**Q1. Schedule Trigger 워크플로우가 재시작·멀티 인스턴스에서도 안 끊기게 하려면? (durable scheduler 신규 보강분 겨냥)**
- ✅ PASS
- 근거: SKILL.md §5 "v2.34~2.40에서 추가된 운영 변수" 표 + 표 아래 주의문 / REFERENCE.md §10 "v2.33→v2.40 사이 셀프호스팅 관점 변경 요약" 표 + §14 공식 링크
- 상세: `N8N_SCHEDULER_ENABLED` + `N8N_USE_WORKFLOW_PUBLICATION_SERVICE` 최소 구성, 도입 버전(v2.36 GA), opt-in이라 업그레이드만으로 강제 전환되지 않는 점, 껐다 되돌려도 커서 테이블이 자동 삭제되지 않는 점까지 정확히 답변. 핵심 답은 SKILL.md 본문만으로 충분했고 REFERENCE.md는 보강 근거로만 사용(참조 링크 필수는 아니었음 — 2026-09-28 신규 보강분이 SKILL.md 본체에 있었기 때문).

**Q2. v1→v2 업그레이드 후 남은 `N8N_RUNNERS_ENABLED=true` 처리 + Code 노드 프로덕션 격리 방법 (흔한 함정, 참조 링크 필요)**
- ✅ PASS
- 근거: SKILL.md 91-93행·219행 "N8N_RUNNERS_ENABLED deprecated" / REFERENCE.md "함정 6"·"11-1. Task runner 모드"·"12. 보안 베스트" 표
- 상세: deprecated 변수는 삭제 대상이라는 결론과 `N8N_RUNNERS_MODE=external` + `n8nio/runners` 사이드카 권장, 기본 `internal` 모드가 "insecure by design"인 이유(uid/gid 공유)까지 정확히 답변. **참조 링크(REFERENCE.md)를 실제로 따라가야 답이 나왔음** — SKILL.md 91행의 "실행 격리 설정은 아래 'task runner 모드' 참조" 문구가 REFERENCE.md 11-1절을 가리키는데 파일 구분 표시가 없어 혼동 소지가 있다고 에이전트가 지적(2026-09-25 REFERENCE.md 분리 이후 발생한 문구 — 축소는 아니고 문구 정합성 문제).

### 발견된 gap

- (경미, 선택 보강) SKILL.md 91행 "실행 격리 설정은 아래 'task runner 모드' 참조" 문구를 "(references/REFERENCE.md 11-1절 참조)"처럼 파일명을 명시하도록 개선하면 혼동을 줄일 수 있음 — 2026-09-25 SKILL.md/REFERENCE.md 분리 이후 생긴 문구 잔재. 차단 요인 아님.

### 판정

- agent content test: 2/2 PASS (축소 후 참조 링크 추적 정상 확인, 형제 파일 간 모순 없음)
- verification-policy 분류: 워크플로우/빌드 설정/인프라 스킬 — 실사용 필수 카테고리
- 최종 상태: PENDING_TEST 유지 (content test PASS, 실 self-host 검증은 별도 사이클 필요)

---

> (2026-05-15 원 기록, 참고용 보존)

**수행일**: 2026-05-15
**수행자**: skill-tester → general-purpose (에이전트 직접 대조 검증)
**수행 방법**: SKILL.md Read 후 3개 실전 질문 답변, 근거 섹션 존재 여부 및 anti-pattern 회피 확인

### 실제 수행 테스트

**Q1. N8N_ENCRYPTION_KEY 분실 시 어떤 영향이 발생하는가?**
- PASS
- 근거: SKILL.md "9. 백업·복구" 섹션 "복구 시나리오 — encryption key 손실" (줄 292-294) + "5. 핵심 환경 변수" 표 + "13. 흔한 함정" 함정 1
- 상세: 키 손실 시 모든 credentials가 복호화 불가능하며 재입력 외에 복구 방법이 없다는 내용이 명확히 기술됨. 예방책(환경 변수 명시 + 비밀 저장소 백업)도 함정 1 및 12절 보안 표에 명시됨. 큐 모드에서 워커 키 불일치 시 silent 실패도 함정 5에 기술됨.

**Q2. n8n 프로덕션에서 SQLite 대신 PostgreSQL을 권장하는 이유는?**
- PASS
- 근거: SKILL.md "6. PostgreSQL 백엔드 (프로덕션 권장)" 섹션 (줄 212-215) + "3. Docker 단일 컨테이너" 주의 (줄 84) + "11. 큐 모드" 필수 조건 + "13. 흔한 함정" 함정 3
- 상세: SQLite는 단일 프로세스 쓰기만 안전하여 동시 쓰기·큐 모드 불가라는 핵심 이유가 명시됨. v2.0에서 MySQL/MariaDB 제거로 PostgreSQL이 유일한 공식 지원 DB임도 기술됨. SQLite→PostgreSQL 자동 마이그레이션 없음(함정 3)도 처음부터 PostgreSQL 사용 권장의 근거로 포함됨.

**Q3. n8n v1에서 v2로 업그레이드 시 주요 breaking changes는?**
- PASS
- 근거: SKILL.md "10. 업그레이드" 섹션 "v1 → v2 주요 breaking changes" 목록 (줄 319-324) + "5. 핵심 환경 변수" 주의 (줄 207) + "13. 흔한 함정" 함정 6
- 상세: 5개 breaking change(MySQL/MariaDB 제거, `N8N_BLOCK_ENV_ACCESS_IN_NODE=true` 기본, OAuth callback 인증 강화, 파일 권한 0600 강제, Task runner 분리)가 모두 명시됨. Code 노드에서 `process.env` 접근 기본 차단됨을 섹션 5 주의에서도 재확인 가능. `N8N_RUNNERS_ENABLED` 미명시 시 deprecation warning 경고가 함정 6에 별도 기술됨.

### 발견된 gap

없음. 3개 질문 모두 SKILL.md 내 명확한 섹션·코드 근거로 완전히 답변 가능했으며 anti-pattern 사용 없음.

### 판정

- agent content test: 3/3 PASS
- verification-policy 분류: 워크플로우/빌드 설정/인프라 스킬 — 실사용 필수 카테고리
- 최종 상태: PENDING_TEST 유지 (content test PASS, 실 self-host 검증은 별도 사이클 필요)

### [2026-09-28] 재검증(2차) — v2.33.7→v2.40.7, durable scheduler·노드 리소스 한도 신규 env 반영

**수행일**: 2026-09-28
**수행 방법**: SKILL.md 전체 + references/REFERENCE.md Read → 핵심 클레임 5개를 1차 소스(docs.n8n.io, npm registry, GitHub)와 대조, 보강 검토 (배정 지침: v2.34~2.40 운영 환경변수 변경분을 release-notes로 확인해 반영)

**클레임 대조 결과**:
1. 2026-09-28 기준 n8n stable은 v2.40.7, beta는 v2.41.3 — `curl https://registry.npmjs.org/n8n/latest` → `2.40.7` 확인, GitHub releases 페이지에서 v2.41.x가 pre-release 채널로 병행 확인 → VERIFIED
2. `docs.n8n.io/changelog/release-notes-2.x`가 archived 상태이며 2.30 이전 버전에서 멈춰 있고, 현재 릴리즈 노트는 `docs.n8n.io/changelog/release-notes`로 통합됨 — 해당 페이지 WebFetch 직접 확인("This page is no longer updated" 문구) → VERIFIED (URL 정정 필요)
3. Durable scheduler가 v2.36에 GA(v2.32~2.35은 Preview)되었고, `N8N_SCHEDULER_ENABLED`/`N8N_USE_WORKFLOW_PUBLICATION_SERVICE`/`N8N_SCHEDULER_POLL_TRIGGERS_ENABLED`(이상 기본 false)/`N8N_SCHEDULER_SYSTEM_TASKS_ENABLED`(v2.40 추가)/`N8N_ENV_FEAT_SKIP_DURABLE_SCHEDULER` 환경 변수로 제어됨 — `docs.n8n.io/deploy/host-n8n/configure-n8n/durable-scheduler` 공식 문서 직접 확인 → VERIFIED
4. `NODES_MERGE_SQL_SANDBOX_MEMORY_LIMIT_MB`(기본 64MB, v2.38.1 도입)·`N8N_COMPRESSION_NODE_MAX_DECOMPRESSED_SIZE_BYTES`(기본 256MiB)·`N8N_COMPRESSION_NODE_MAX_ZIP_ENTRIES`(기본 1000)가 현재 공식 env var 문서(`.../use-environment-variables/nodes`)에 실재 — 공식 문서 페이지 직접 확인 + WebSearch 교차 검증(커뮤니티 언급 일치) → VERIFIED
   > **정정 (2026-09-28 실행 검증)**: 위 "기본 256MiB"·"기본 1000" 부분은 **문서 문구를 그대로 인용했으나 실제 v2.40.7 런타임 기본값과 다름** — 실기동 컨테이너 로그 확인 결과 현재 기본값은 각각 `2147483648`(2GiB)·`5000`이며, 256MiB/1000은 "향후 버전에서 축소 예정"인 목표값이었다. SKILL.md §5 표를 실측값으로 정정함(아래 "[2026-09-28] 실사용(실행) 검증" 블록 참조).
5. (부가) `N8N_AZURE_STORAGE_CUSTOM_ENDPOINTS_ENABLED`(v2.40, 기본 false) — GitHub PR #38181 + WebSearch 교차 확인 → VERIFIED

**보강(ADD)**: SKILL.md 5절에 "v2.34~2.40에서 추가된 운영 변수" 표 신설(durable scheduler 5종 + 노드 리소스 한도 3종 + Azure Storage 보안 게이트 1종). references/REFERENCE.md 10절에 "v2.33→v2.40 사이 셀프호스팅 관점 변경 요약" 표 추가(DB/마이그레이션 breaking change 없음 확인, 문서 구조 변경 명시). 소스 목록에 `durable-scheduler.md`·`use-environment-variables/nodes.md`·현행 `release-notes.md` 추가, 구 `release-notes-2.x`는 archived 표기로 정정. 버전 핀 예시(docker run 태그, `n8nio/runners` 태그)를 2.33.7→2.40.7로 갱신. 축소는 없음 — 함정 7개·보안 표·큐 모드 예시 등 기존 안전 가드는 그대로 유지.

**실전 질문 재검증**:
- Q1. "n8n 셀프호스팅에서 스케줄 트리거가 재시작해도 안 끊기게 하려면?" → SKILL.md "v2.34~2.40에서 추가된 운영 변수" 표(durable scheduler, `N8N_SCHEDULER_ENABLED` 등) 근거로 PASS
- Q2. "N8N_ENCRYPTION_KEY 분실 시 영향은?" (기존 Q1 재확인, 변경 없는 항목 회귀 검증) → SKILL.md "9. 백업·복구" 섹션 근거로 PASS

**재검증 최종 판정**: status **PENDING_TEST 유지** (실사용 필수 카테고리 — 내용 재검증만으로는 APPROVED 불가)

---

> 아래는 실 self-host 검증 시 확인할 항목 (별도 사이클)

**향후 실 self-host 검증 시 확인할 항목:**

- [✅] **(2026-09-28 완료)** `docker compose up -d`로 스택(postgres + n8n-main + n8n-worker + redis + n8nio/runners) 기동 성공, `/healthz` 200 확인 — Caddy(HTTPS)는 이번 세션에서 제외(계정 생성·외부 노출 금지 지침)
- [ ] Caddy가 Let's Encrypt 인증서 자동 발급 성공 (외부 도메인·포트 개방 필요 — 이번 세션 범위 밖)
- [ ] First-access wizard에서 owner 계정 생성 성공 (2026-09-28 세션은 계정 생성 금지 지침으로 의도적 제외 — CLI `import:workflow`/`execute`로 계정 없이 대체 검증)
- [✅] **(2026-09-28 완료)** PostgreSQL 컨테이너에서 n8n 스키마 마이그레이션 완료 (`\dt` → 142개 테이블 확인)
- [ ] Webhook 노드 등록 후 외부 curl로 호출 성공 (`N8N_WEBHOOK_URL` 반영 확인) — 외부 webhook 노출 금지 지침으로 이번 세션 제외
- [ ] `N8N_ENCRYPTION_KEY` 명시 후 credentials 저장 → 컨테이너 재기동 후 동일 키로 복호화 정상 (이번 세션은 encryption key 정상 인식만 확인, credentials 저장·재기동 복호화 사이클은 미실시)
- [ ] `pg_dump` 백업 후 새 PostgreSQL 인스턴스로 복원 → 워크플로우/credentials 보존 확인
- [ ] `docker compose pull && up -d`로 minor 업그레이드 → DB 자동 마이그레이션 성공 (단일 버전만 검증, 업그레이드 사이클 미실시)
- [✅] **(2026-09-28 완료)** 큐 모드 전환: Redis + worker 1개(스케일 3 아님) + external task runner 사이드카 구성, `bull:jobs:stalled-check` 키·worker `Queue: jobs` 로그로 큐 라우팅 확인. worker 3-replica 부하 분산까지는 미검증(선택 범위)

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (v1 10개 + v2 재검증 11개 클레임 대조. DISPUTED 1건 본문 정정 완료) |
| 구조 완전성 | ✅ (frontmatter, 소스, 검증일, 16개 섹션, 코드 예시, 함정 7개, 체크리스트) |
| 실용성 | ✅ (docker-compose 풀스택 예시 + 큐 모드·헬스체크·external task runner 예시, Caddyfile, .env 템플릿) |
| 에이전트 활용 테스트 | ✅ 누적 7/7 PASS (2026-05-15, 3/3 PASS — N8N_ENCRYPTION_KEY 분실 영향 / PostgreSQL 권장 이유 / v1→v2 breaking changes. 2026-09-28 skill-tester 재테스트 2/2 PASS — durable scheduler 신규 보강분·Task runner 격리 모드, REFERENCE.md 참조 링크 추적 확인. **2026-09-28 실사용(실행) 검증 정정분 재테스트 2/2 PASS** — N8N_WEBHOOK_URL 개명 / PostgreSQL 16·internal task runner deprecated 판단형 질문) |
| 최신성 (2026-08-11) | ✅ (버전 v2.33.7 반영, 문서 URL 개편 반영, runner 변수 오류 정정) |
| 최신성 (2026-09-28, 2차 재검증) | ✅ (버전 v2.40.7 반영, durable scheduler·노드 리소스 한도 env 5개 보강, release-notes URL 재개편 반영) |
| **실사용(실행) 검증 (2026-09-28)** | ✅ 부분 — docker compose 5-서비스 스택 실기동, `/healthz` 200, 큐 모드·external task runner·DB 마이그레이션·`$env` 차단 기본값 전부 서술과 일치 확인. 서술 오류 5건 발견·정정(WEBHOOK_URL 개명, 압축 노드 기본값 2건, PostgreSQL 16 지원 등급, task runner internal 모드 deprecated 표기). HTTPS/owner 계정/webhook 외부 호출/백업 복원/업그레이드 사이클은 지침상 제외 |
| **최종 판정** | **PENDING_TEST 유지** |

**PENDING_TEST 유지 사유:**
- content test 3/3 PASS 완료 (2026-05-15) + **2026-09-28 재테스트 2/2 PASS** (durable scheduler 신규 보강분 겨냥). 2026-08-11·2026-09-28 최신화는 모두 **내용 검증(1·2단계) 재수행**
- **2026-09-28 실사용(실행) 검증 수행** — docker compose 실기동·헬스체크·환경변수 실측 대조까지는 완료했으나, 졸업 조건표가 요구하는 전체 범위(HTTPS 발급·owner 계정 생성·webhook 외부 호출·백업 복원 리허설·업그레이드 사이클)는 계정 생성 금지·외부 노출 금지 지침에 따라 **의도적으로 제외**되어 전체 충족은 아님
- 이 스킬은 `verification-policy.md`의 **"실사용 필수 스킬"(워크플로우·빌드/인프라 설정)** 카테고리다.
  실제 서버 self-host로 docker-compose 기동·HTTPS 발급·webhook callback·백업/복원·업그레이드를 모두 검증해야 APPROVED 전환 가능
- 따라서 이번 부분 실행 검증에도 불구하고 **status는 PENDING_TEST를 유지**한다 (임의 APPROVED 전환 금지 — 부분 실행을 완전 실행처럼 전환하지 않음)

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 및 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS)
- [✅] 2026-08-11 최신화 재검증 (버전·문서 URL·runner 변수 정정)
- [✅] 2026-09-28 2차 재검증 (버전 v2.40.7, durable scheduler·노드 리소스 한도 env 보강, release-notes URL 정정)
- [✅] **(2026-09-28 완료)** 2026-09-28 보강분(durable scheduler) skill-tester 2단계 재테스트 — general-purpose 대체 수행, 2/2 PASS, REFERENCE.md 참조 링크 실제 추적 확인, PENDING_TEST 유지(실사용 필수 카테고리)
- [✅] **(2026-09-28 완료)** 실사용(실행) 검증 정정분(WEBHOOK_URL 개명·압축 노드 기본값·PostgreSQL 16·internal task runner deprecated) skill-tester 2단계 재테스트 — general-purpose 대체 수행, 2/2 PASS(누적 7/7), 신규 gap 1건 발견(REFERENCE.md 11절 webhook processor 예시 구 변수명 잔재, 선택 보강)
- [✅] **(2026-09-28 완료)** 실 self-host 사이클에서 **v2.40.7** 기준 docker-compose 실제 기동 결과 verification에 반영 — `/healthz`·큐 모드·external task runner·DB 마이그레이션·`$env` 차단까지 확인, 서술 오류 5건 발견·정정. 단, HTTPS·owner 계정·webhook 외부 호출·백업 복원·업그레이드 사이클은 지침상 제외되어 **완전한 졸업 조건 충족은 아직 아님** (남은 항목은 섹션 5 "향후 실 self-host 검증 시 확인할 항목" 참조 — 이 항목이 전부 완료되어야 APPROVED 전환 가능)
- [✅] (2026-09-28 반영) SKILL.md 91행 "실행 격리 설정은 아래 'task runner 모드' 참조" 문구에 파일명(REFERENCE.md 11-1절) 명시 — 2026-09-28 테스트에서 혼동 소지 발견, 같은 날 반영 완료(서식 명확화, 소스 확인 불필요)
- [✅] **(2026-09-28 완료)** `N8N_BLOCK_ENV_ACCESS_IN_NODE` 기본값(true) 실제 차단 동작 CLI로 확인 — `$env` 접근 시 미지정/`=true` 모두 차단, `=false`만 해제. raw `process.env`는 값과 무관하게 항상 undefined(Task Runner 샌드박스 특성)
- [✅] **(2026-09-28 완료)** `N8N_RUNNERS_MODE=external` + `n8nio/runners` 사이드카 실제 기동 검증 (11-1절 예시) — 브로커 연결·runner 등록 로그로 확인
- [ ] `N8N_SCHEDULER_ENABLED`(durable scheduler) 실제 기동 검증 — 재시작 후 스케줄 유지 확인 (2026-09-28: 변수 인식·관련 마이그레이션 성공까지만 확인, 재시작 생존 테스트는 미실시 — 선택 보강, 차단 요인 아님)
- [ ] **(2026-09-28 신규 발견, 선택 보강)** 큐 모드 + external task runner 조합에서 `N8N_RUNNERS_MODE=external`을 worker 서비스에도 별도로 지정해야 한다는 점을 REFERENCE.md 11-1절 예시에 명시 검토 — 실측 결과 main에만 지정 시 worker는 독립적으로 internal 모드로 폴백됨(JS 러너는 자체 기동 성공, Python 러너는 Python3 부재로 실패). 기존 서술과 모순은 아니라 이번엔 미수정
- [ ] **(2026-09-28 skill-tester 재테스트 신규 발견, 선택 보강)** REFERENCE.md 11절 "webhook processor 분리" 예시가 구 변수명 `WEBHOOK_URL`을 그대로 쓰고 있어 §5/§7/§13의 "N8N_WEBHOOK_URL 통일" 원칙과 표기 불일치 — 차단 요인 아님, 문구 정합만 필요
- [ ] n8n issue #28635(Anthropic thinking 포맷) 해소 여부 추적 — 짝 스킬 `n8n-llm-integration`과 연동
- [ ] Cloudflare Tunnel 경유 webhook URL 케이스 코드 예시 추가 검토 (선택 보강 — 차단 요인 아님, 현재 언급은 있음)
- [ ] Kubernetes/Helm 배포는 별도 스킬로 분리 검토 (선택 — 현재 스킬은 Docker/Compose 중심으로 범위 명확)
- [ ] 큐 모드 운영 시 워커 헬스체크·재시작 정책 추가 검토 (선택 보강 — 차단 요인 아님)
- [ ] 향후 v2.x → v3.x 메이저 업그레이드 시 별도 마이그레이션 스킬 검토 (선택 — 미래 작업)
- [ ] **(2026-09-28 신규)** PostgreSQL 17+ 예시로 compose 기본값 상향 검토 — 현재 16은 "compatibility support only" 등급(선택 보강, 16 자체는 정상 동작 확인되어 차단 요인 아님)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성. n8n v2.x(stable, v2.21.x 기준) Docker 셀프 호스팅 — 15개 섹션, 7개 함정, 풀스택 docker-compose 예시. 공식 문서 10개 클레임 전부 VERIFIED | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 N8N_ENCRYPTION_KEY 분실 영향 / Q2 PostgreSQL 권장 이유 / Q3 v1→v2 breaking changes) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
| 2026-08-11 | v2 | **최신화 재검증.** 대상 버전 v2.21.x → v2.33.7(stable)/v2.34.4(beta). 공식 문서 URL 개편(`/hosting/` → `/deploy/host-n8n/`) 반영 및 소스 링크 전면 교체. `N8N_RUNNERS_ENABLED` deprecated 정정(함정 6 서술 반전) — docker run·compose 예시에서 제거. task runner internal/external 모드 절(11-1) 신설. 큐 모드 헬스체크(`QUEUE_HEALTH_CHECK_ACTIVE` + `/healthz/readiness`)·webhook processor 분리·v2.34 대용량 webhook 응답 추가. 신규 운영 env 3종(OTel·token exchange·insights retention) 표 추가. "v2.21→v2.33 변경 요약" 표 신설. 이미지 태그 핀 가이드 추가. 클레임 11~20 재검증(VERIFIED 9 / DISPUTED 1 정정 / UNVERIFIED 1). status는 실사용 필수 카테고리로 **PENDING_TEST 유지** | 최신화 세션 |
| 2026-09-25 | v2 | 구조 개편: 상세 내용 references/REFERENCE.md 분리 (내용 변경 없음). SKILL.md는 1~9절(핵심 결정 기준·설치·핵심 환경 변수·PostgreSQL·HTTPS·인증·백업)만 유지, 10~15절(업그레이드·큐 모드·task runner 모드·보안 베스트·흔한 함정·짝 스킬·체크리스트)은 REFERENCE.md로 이동. 내용 손실 없음(비어있지 않은 줄 diff로 검증). status는 **PENDING_TEST 유지**(변경 없음) | Claude (Sonnet 5) |
| 2026-09-28 | v3 | **2차 재검증.** 대상 버전 v2.33.7 → v2.40.7(stable)/v2.41.3(beta). `docs.n8n.io/changelog/release-notes-2.x` archived 확인 → 현행 `release-notes`로 소스 교체. Durable scheduler(v2.36 GA) 관련 env 5종(`N8N_SCHEDULER_ENABLED` 등) + 노드 리소스 한도 env 3종(`NODES_MERGE_SQL_SANDBOX_MEMORY_LIMIT_MB` 등) + Azure Storage 보안 게이트 1종을 SKILL.md 5절 신규 표로 보강. references/REFERENCE.md 10절에 v2.33→v2.40 변경 요약 표 추가, runner 이미지 태그 예시 갱신. 클레임 5개 재검증(전부 VERIFIED). 축소 없음. status는 실사용 필수 카테고리로 **PENDING_TEST 유지** | 2차 재검증 세션 |
| 2026-09-28 | v3 | **2단계 실사용 테스트 재수행(skill-tester → general-purpose).** Q1 durable scheduler 신규 보강분(재시작·멀티 인스턴스 생존) / Q2 v1→v2 잔재 `N8N_RUNNERS_ENABLED` 처리 + Task runner 격리 모드(REFERENCE.md 참조 링크 실제 추적 필요) → 2/2 PASS. 실사용 필수 카테고리(워크플로우/인프라 설정)이므로 **PENDING_TEST 유지** | skill-tester |
| 2026-09-28 | v3 | 선택 보강 반영 — SKILL.md 91행 참조 문구에 `references/REFERENCE.md` "11-1. Task runner 모드" 절 번호 명시(파일명 누락으로 인한 혼동 해소). 내부 참조 명확화라 소스 확인 불필요, status PENDING_TEST 유지(실사용 필수 카테고리) | Claude (Opus 5.5) |
| 2026-09-28 | v3 | **실사용(실행) 검증 수행.** 로컬 Docker 27.3.1로 docker-compose 5-서비스 스택(postgres:16+redis:7-alpine+n8n-main+n8n-worker+n8nio/runners, 전부 2.40.7) 실기동 → `/healthz` 200 확인, 큐 모드(Redis bull 큐 키 확인)·external task runner(브로커+runner 등록 로그 확인)·durable scheduler 신규 env 인식·DB 마이그레이션(142개 테이블)·`N8N_BLOCK_ENV_ACCESS_IN_NODE` 기본값 `$env` 차단 동작(CLI로 3가지 조합 비교)까지 서술과 대조. **서술 오류 5건 발견·SKILL.md/REFERENCE.md 최소 정정**: ① `WEBHOOK_URL`→`N8N_WEBHOOK_URL` 개명(구 이름 deprecated) ② `N8N_COMPRESSION_NODE_MAX_DECOMPRESSED_SIZE_BYTES` 기본값 268435456(256MiB)→실측 2147483648(2GiB), 256MiB는 향후 예정값 ③ `N8N_COMPRESSION_NODE_MAX_ZIP_ENTRIES` 기본값 1000→실측 5000, 1000은 향후 예정값 ④ PostgreSQL 16 "compatibility support only" 등급 주의문 추가(17+ 권장 상향) ⑤ task runner internal 모드 "insecure by design"에 "공식 deprecated" 병기. HTTPS 발급·owner 계정 생성·webhook 외부 호출·백업 복원·업그레이드 사이클은 계정 생성 금지·외부 노출 금지 지침으로 의도적 제외 — **부분 실행 검증**이므로 status는 실사용 필수 카테고리 원칙에 따라 **PENDING_TEST 유지**(임의 APPROVED 전환 금지) | 실사용 검증 세션 |
| 2026-09-28 | v3 | **2단계 실사용 테스트 재수행(skill-tester → general-purpose).** Q1 `WEBHOOK_URL`→`N8N_WEBHOOK_URL` 개명 대응 / Q2 PostgreSQL 16·internal task runner deprecated 판단형 질문 → 2/2 PASS(누적 7/7). 신규 gap 1건(REFERENCE.md 11절 구 변수명 잔재) 발견·기록. 실사용 필수 카테고리(워크플로우/인프라 설정)이므로 **PENDING_TEST 유지** | skill-tester |
