## 환경변수 관리

### ARG vs ENV

| 구분 | `ARG` | `ENV` |
|------|-------|-------|
| 존재 시점 | 빌드 시에만 | 빌드 + 런타임 |
| 최종 이미지 포함 | 아니오 | 예 |
| `docker run`에서 접근 | 불가 | `--env`로 오버라이드 가능 |
| 용도 | 빌드 시 버전/옵션 전달 | 런타임 설정 |

```dockerfile
# 빌드 시에만 필요한 값 — ARG
ARG NODE_VERSION=22

# 런타임에도 필요한 값 — ENV
ENV NODE_ENV=production

# 민감한 값은 ARG/ENV에 넣지 않는다 — 빌드 히스토리에 남음
# 대신 시크릿 마운트 사용:
RUN --mount=type=secret,id=api_key \
    cat /run/secrets/api_key > /app/.env
```

### Compose 환경변수 우선순위

1. CLI `docker compose run -e` 오버라이드
2. `environment:` 섹션
3. `env_file:` 에서 로드
4. Dockerfile `ENV`
5. `.env` 파일 (Compose 변수 보간용)

> 주의: `.env` 파일에 민감한 정보를 넣지 않는다. Docker Compose Secrets를 사용한다.

---

## Docker 보안

### 필수 보안 패턴

```dockerfile
# 1. non-root 사용자로 실행
RUN groupadd -r appgroup && useradd --no-log-init -r -g appgroup appuser
USER appuser

# 2. 명시적 UID/GID 부여 (결정론적 결과)
RUN adduser -S -u 1001 -G appgroup appuser

# 3. 파일 소유권 명시
COPY --chown=appuser:appgroup ./dist ./dist
```

### Compose 보안 설정

```yaml
services:
  app:
    security_opt:
      - no-new-privileges:true   # 권한 상승 방지
    read_only: true               # 읽기 전용 파일시스템
    tmpfs:
      - /tmp                      # 쓰기 필요한 경로만 tmpfs
    cap_drop:
      - ALL                       # 모든 Linux 기능 제거
    cap_add:
      - NET_BIND_SERVICE          # 필요한 기능만 추가
```

### 보안 체크리스트

- [ ] `USER` 지시어로 non-root 실행
- [ ] `--no-log-init` 사용 (로그 관련 디스크 고갈 방지)
- [ ] `sudo` 대신 `gosu` 사용 (필요 시)
- [ ] `read_only: true` + `tmpfs` 조합
- [ ] `no-new-privileges` 설정
- [ ] 민감한 데이터는 Secrets로 관리
- [ ] `.dockerignore`에 `.env*`, `.git` 포함
- [ ] 신뢰할 수 있는 베이스 이미지 사용 (Docker Official / Verified Publisher)

---

## Vercel 배포 설정

```jsonc
// vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "regions": ["icn1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ],
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 3 * * *"
    }
  ]
}
```

### 주요 필드

| 필드 | 설명 |
|------|------|
| `framework` | 프레임워크 프리셋 (nextjs, vite, sveltekit 등) |
| `buildCommand` | 빌드 명령 오버라이드 |
| `outputDirectory` | 빌드 출력 디렉토리 |
| `installCommand` | 의존성 설치 명령 |
| `regions` | 함수 배포 리전 (Pro: 3개, Enterprise: 무제한) |
| `crons` | 크론 잡 스케줄 |
| `headers` / `rewrites` / `redirects` | 라우팅 규칙 |

> 소스: https://vercel.com/docs/project-configuration/vercel-json

---

## Railway 배포 설정

```toml
# railway.toml

[build]
dockerfilePath = "Dockerfile"
buildTarget = "production"

[deploy]
startCommand = "node dist/server.js"
healthcheckPath = "/health"
healthcheckTimeout = 10
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
numReplicas = 2
```

### 주요 필드

| 섹션 | 필드 | 설명 |
|------|------|------|
| `[build]` | `dockerfilePath` | Dockerfile 경로 |
| `[build]` | `buildTarget` | 멀티스테이지 빌드 타겟 |
| `[deploy]` | `startCommand` | 시작 명령 |
| `[deploy]` | `healthcheckPath` | 헬스체크 엔드포인트 |
| `[deploy]` | `healthcheckTimeout` | 헬스체크 타임아웃 (초) |
| `[deploy]` | `restartPolicyType` | `ON_FAILURE` / `ALWAYS` / `NEVER` |
| `[deploy]` | `restartPolicyMaxRetries` | 최대 재시작 횟수 |
| `[deploy]` | `numReplicas` | 레플리카 수 |

> 소스: https://docs.railway.com/config-as-code/reference

---

## 언제 사용 / 언제 사용하지 않을지

### 사용해야 할 때

- 로컬 개발 환경을 팀원 간에 동일하게 유지하고 싶을 때
- Node.js/Rust 앱을 프로덕션에 배포할 때
- CI/CD 파이프라인에서 재현 가능한 빌드가 필요할 때
- 마이크로서비스 아키텍처에서 서비스별 격리가 필요할 때

### 사용하지 않아도 될 때

- 정적 사이트만 배포 (Vercel/Netlify가 자체 빌드 제공)
- 서버리스 함수만 사용하는 경우
- 로컬 스크립트 / 일회성 도구

---

## 흔한 실수

| 실수 | 올바른 방법 |
|------|-----------|
| `apt-get update`를 별도 RUN에 분리 | `update + install`을 하나의 RUN으로 합침 |
| 소스 코드 COPY 후 의존성 설치 | 의존성 파일 먼저 COPY, 소스는 나중에 |
| root로 컨테이너 실행 | `USER` 지시어로 non-root 전환 |
| `.env` 파일을 이미지에 포함 | `.dockerignore`에 추가, 런타임에 주입 |
| 개발용 볼륨 바인드를 프로덕션에 사용 | 프로덕션에서는 볼륨 바인드 제거 |
| `latest` 태그 사용 | 버전 고정 (`node:22-alpine`, `rust:1.86`) |
| `ADD`로 로컬 파일 복사 | `COPY` 사용 (`ADD`는 원격 URL/압축 해제에만) |
| `sudo` 사용 | `gosu` 사용 또는 빌드 시 root, 런타임 시 non-root |
