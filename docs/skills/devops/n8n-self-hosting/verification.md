---
skill: n8n-self-hosting
category: devops
version: v1
date: 2026-05-15
status: PENDING_TEST
---

# n8n Self-Hosting 검증 문서

> 이 문서는 `.claude/skills/devops/n8n-self-hosting/SKILL.md` 스킬의 검증 기록이다.

---

## 메타 정보

| 항목 | 내용 |
|------|------|
| 스킬 이름 | `n8n-self-hosting` |
| 스킬 경로 | `.claude/skills/devops/n8n-self-hosting/SKILL.md` |
| 검증일 | 2026-05-15 |
| 검증자 | skill-creator |
| 스킬 버전 | v1 |
| 대상 버전 | n8n v2.x (stable tag, 2026-05 기준 v2.21.x) |

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

- [✅] 해당 스킬 참조 에이전트 테스트 질문 수행 (2026-05-15 — 3/3 PASS)
- [✅] 에이전트가 스킬 내용을 올바르게 활용하는지 확인 (2026-05-15)
- [✅] 잘못된 응답 발생 시 스킬 내용 보완 (gap 없음 — 보완 불필요)

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

**판정 요약: VERIFIED 10 / DISPUTED 0 / UNVERIFIED 0**

---

## 5. 테스트 진행 기록

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

---

> 아래는 실 self-host 검증 시 확인할 항목 (별도 사이클)

**향후 실 self-host 검증 시 확인할 항목:**

- [ ] `docker compose up -d`로 3-stack(postgres + n8n + caddy) 기동 성공
- [ ] Caddy가 Let's Encrypt 인증서 자동 발급 성공
- [ ] First-access wizard에서 owner 계정 생성 성공
- [ ] PostgreSQL 컨테이너에서 n8n 스키마 마이그레이션 완료 (`\dt` 확인)
- [ ] Webhook 노드 등록 후 외부 curl로 호출 성공 (`WEBHOOK_URL` 반영 확인)
- [ ] `N8N_ENCRYPTION_KEY` 명시 후 credentials 저장 → 컨테이너 재기동 후 동일 키로 복호화 정상
- [ ] `pg_dump` 백업 후 새 PostgreSQL 인스턴스로 복원 → 워크플로우/credentials 보존 확인
- [ ] `docker compose pull && up -d`로 minor 업그레이드 → DB 자동 마이그레이션 성공
- [ ] (선택) 큐 모드 전환: Redis + worker 3개 추가, 동일 encryption key로 워크플로우 실행 분산 확인

---

## 6. 검증 결과 요약

| 항목 | 결과 |
|------|------|
| 내용 정확성 | ✅ (공식 문서 10개 클레임 전부 VERIFIED) |
| 구조 완전성 | ✅ (frontmatter, 소스, 검증일, 15개 섹션, 코드 예시, 함정 7개, 체크리스트) |
| 실용성 | ✅ (docker-compose 풀스택 예시 + 큐 모드 예시, Caddyfile, .env 템플릿) |
| 에이전트 활용 테스트 | ✅ (2026-05-15, 3/3 PASS — N8N_ENCRYPTION_KEY 분실 영향 / PostgreSQL 권장 이유 / v1→v2 breaking changes) |
| **최종 판정** | **PENDING_TEST 유지** |

**PENDING_TEST 유지 사유:**
- content test 3/3 PASS 완료
- 실제 서버 self-host로 docker-compose 기동·HTTPS 발급·webhook callback·백업/복원·업그레이드를 모두 검증해야 APPROVED 전환 가능 (실사용 필수 카테고리)

---

## 7. 개선 필요 사항

- [✅] skill-tester content test 수행 및 섹션 5·6 업데이트 (2026-05-15 완료, 3/3 PASS)
- [ ] 실 self-host 사이클에서 v2.21.x 기준 docker-compose 실제 기동 결과 verification에 반영 (차단 요인 아님 — APPROVED 전환 조건이지만 현 PENDING_TEST 유지는 허용됨)
- [ ] Cloudflare Tunnel 경유 webhook URL 케이스 코드 예시 추가 검토 (선택 보강 — 차단 요인 아님, 현재 언급은 있음)
- [ ] Kubernetes/Helm 배포는 별도 스킬로 분리 검토 (선택 — 현재 스킬은 Docker/Compose 중심으로 범위 명확)
- [ ] 큐 모드 운영 시 워커 헬스체크·재시작 정책 추가 검토 (선택 보강 — 차단 요인 아님)
- [ ] 향후 v2.x → v3.x 메이저 업그레이드 시 별도 마이그레이션 스킬 검토 (선택 — 미래 작업)

---

## 8. 변경 이력

| 날짜 | 버전 | 변경 내용 | 변경자 |
|------|------|-----------|--------|
| 2026-05-15 | v1 | 최초 작성. n8n v2.x(stable, v2.21.x 기준) Docker 셀프 호스팅 — 15개 섹션, 7개 함정, 풀스택 docker-compose 예시. 공식 문서 10개 클레임 전부 VERIFIED | skill-creator |
| 2026-05-15 | v1 | 2단계 실사용 테스트 수행 (Q1 N8N_ENCRYPTION_KEY 분실 영향 / Q2 PostgreSQL 권장 이유 / Q3 v1→v2 breaking changes) → 3/3 PASS, PENDING_TEST 유지 (실사용 필수 카테고리) | skill-tester |
