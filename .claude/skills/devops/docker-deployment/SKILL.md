---
name: docker-deployment
description: Docker 컨테이너화 및 배포 패턴 - 멀티스테이지 빌드, 이미지 최적화, Compose, 보안, Vercel/Railway 배포
disable-model-invocation: true
---

# Docker 컨테이너화 및 배포 패턴

> 소스: https://docs.docker.com/build/building/best-practices/ | https://docs.docker.com/build/building/multi-stage/ | https://docs.docker.com/guides/nodejs/containerize/ | https://docs.docker.com/guides/rust/build-images/
> 검증일: 2026-04-20

> 주의: 이 문서는 Docker Engine v29.x, Docker Compose v5.x 기준으로 작성되었습니다. Docker Engine v25 미만은 EOL 상태이므로 반드시 업그레이드하세요.

---

## 멀티스테이지 빌드 기본

멀티스테이지 빌드는 여러 `FROM` 문으로 빌드 환경과 런타임 환경을 분리한다. 최종 이미지에는 실행에 필요한 파일만 포함되어 크기와 공격 표면이 줄어든다.

```dockerfile
# 스테이지에 이름을 붙여 가독성 확보
FROM golang:1.25 AS build
WORKDIR /src
COPY . .
RUN go build -o /bin/app ./main.go

# 최종 스테이지: 바이너리만 복사
FROM scratch
COPY --from=build /bin/app /bin/app
CMD ["/bin/app"]
```

### 핵심 패턴

- **네이밍**: `FROM image AS name` — 숫자 인덱스 대신 이름 사용
- **선택적 복사**: `COPY --from=build /path /path` — 필요한 아티팩트만 복사
- **외부 이미지 참조**: `COPY --from=nginx:latest /etc/nginx/nginx.conf /nginx.conf`
- **특정 스테이지만 빌드**: `docker build --target build -t myapp .`
- **공통 스테이지 재사용**: 공유 의존성을 베이스 스테이지로 분리하면 Docker가 한 번만 빌드

---

## Node.js / Next.js 앱 Docker화

### Node.js 멀티스테이지 Dockerfile

```dockerfile
ARG NODE_VERSION=22-alpine
FROM node:${NODE_VERSION} AS base
WORKDIR /app

# 보안: non-root 사용자 생성
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# --- 의존성 설치 ---
FROM base AS deps
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# --- 빌드 ---
FROM base AS build
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build

# --- 프로덕션 ---
FROM base AS production
ENV NODE_ENV=production

COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=deps --chown=nodejs:nodejs /app/package*.json ./

USER nodejs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD ["node", "-e", "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"]

CMD ["node", "dist/server.js"]
```

### Next.js Standalone Dockerfile

Next.js의 `output: "standalone"` 모드를 활용하면 자체 포함 서버를 생성할 수 있다.

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: "standalone",
};
```

```dockerfile
ARG NODE_VERSION=22-alpine
FROM node:${NODE_VERSION} AS base
WORKDIR /app

# --- 의존성 ---
FROM base AS deps
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# --- 빌드 ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- 프로덕션 ---
FROM base AS production
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# standalone 출력물 복사
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Rust 앱 Docker화

Rust는 컴파일 언어이므로 빌드 스테이지에서 바이너리를 생성하고, 최종 스테이지에는 바이너리만 복사한다.

```dockerfile
ARG RUST_VERSION=1.86
ARG APP_NAME=myapp

# --- 빌드 스테이지 ---
FROM rust:${RUST_VERSION}-alpine AS build
ARG APP_NAME
WORKDIR /app

# musl 빌드 의존성 설치
RUN apk add --no-cache clang lld musl-dev

# 의존성 캐시 마운트로 빌드 속도 향상
RUN --mount=type=bind,source=src,target=src \
    --mount=type=bind,source=Cargo.toml,target=Cargo.toml \
    --mount=type=bind,source=Cargo.lock,target=Cargo.lock \
    --mount=type=cache,target=/app/target/ \
    --mount=type=cache,target=/usr/local/cargo/git/db \
    --mount=type=cache,target=/usr/local/cargo/registry/ \
    cargo build --locked --release && \
    cp ./target/release/$APP_NAME /bin/server

# --- 런타임 스테이지 ---
FROM alpine:3.21 AS runtime

# non-root 사용자
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /bin/server /bin/server

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD ["wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8000/health"]

CMD ["/bin/server"]
```

### Rust 캐시 마운트 요약

| 마운트 대상 | 용도 |
|------------|------|
| `/usr/local/cargo/registry/` | 다운로드된 크레이트 캐시 |
| `/usr/local/cargo/git/db` | Git 의존성 캐시 |
| `/app/target/` | 컴파일된 의존성 캐시 |

> 주의: CI 환경에서는 `--mount=type=cache`가 유지되지 않는다. CI에서는 `cache-from` / `cache-to` 레지스트리 캐시 전략을 사용한다.

---

## docker-compose.yml (개발 / 프로덕션)

### 개발 환경

```yaml
# compose.yaml
services:
  app:
    build:
      context: .
      target: development
    ports:
      - "3000:3000"
      - "9229:9229"  # 디버깅
    volumes:
      - .:/app          # 소스 바인드 마운트 (핫 리로드)
      - /app/node_modules  # 익명 볼륨으로 보호
    environment:
      - NODE_ENV=development
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpass
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

### 프로덕션 환경 (오버라이드 파일)

```yaml
# compose.production.yaml
services:
  app:
    build:
      context: .
      target: production
    ports:
      - "3000:3000"
    restart: always
    # 소스 볼륨 바인드 제거 — 코드는 이미지 내부에만 존재
    volumes: []
    environment:
      - NODE_ENV=production
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp

  db:
    restart: always
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

**실행 방법:**

```bash
# 개발
docker compose up

# 프로덕션 (오버라이드 합성)
docker compose -f compose.yaml -f compose.production.yaml up -d

# 프로덕션 서비스 업데이트 (의존 서비스 재시작 방지)
docker compose build app
docker compose up --no-deps -d app
```

---

## 이미지 최적화

### .dockerignore

```plaintext
node_modules
.git
.gitignore
*.md
.env*
.next
dist
target
Dockerfile*
compose*.yaml
.dockerignore
```

### 레이어 캐싱 최적화 원칙

1. **의존성 파일 먼저 복사**: `package.json` / `Cargo.toml` + `Cargo.lock`을 소스 코드보다 먼저 COPY — 의존성이 변경되지 않으면 캐시 재사용
2. **apt-get update + install 합치기**: 별도 RUN으로 분리하면 캐시 문제 발생

```dockerfile
# 권장: 하나의 RUN으로 합침
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*
```

3. **멀티라인 인자 정렬**: 알파벳순 정렬로 중복 방지 및 가독성 확보
4. **캐시 마운트 활용**: `--mount=type=cache`로 패키지 매니저 캐시 유지

### 경량 베이스 이미지 선택

| 베이스 이미지 | 크기 | 적합한 경우 |
|-------------|------|-----------|
| `alpine` | ~6MB | 최소 크기 필요 시 (musl libc 주의) |
| `node:22-alpine` | ~50MB | Node.js 앱 |
| `rust:1.86-alpine` | ~300MB | Rust 빌드 스테이지 |
| `scratch` | 0MB | 정적 바이너리 (Go, Rust musl) |
| `debian:bookworm-slim` | ~30MB | glibc 필요 시 |

### 이미지 다이제스트 고정 (공급망 보안)

```dockerfile
FROM alpine:3.21@sha256:a8560b36e8...
```

> 주의: 다이제스트 고정은 자동 보안 패치를 받지 못하는 트레이드오프가 있다. Docker Scout으로 다이제스트를 최신 상태로 유지하는 것을 권장한다.

---

## 헬스체크 설정

### Dockerfile HEALTHCHECK

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --start-interval=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1
```

| 옵션 | 기본값 | 설명 |
|------|-------|------|
| `--interval` | 30s | 검사 간격 |
| `--timeout` | 30s | 타임아웃 |
| `--start-period` | 0s | 컨테이너 시작 후 유예 기간 |
| `--start-interval` | 5s | 시작 기간 중 검사 간격 |
| `--retries` | 3 | unhealthy 판정까지 연속 실패 횟수 |

### Compose 헬스체크

```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
  interval: 30s
  timeout: 3s
  start_period: 10s
  retries: 3
```

### 종료 코드

| 코드 | 상태 |
|------|------|
| 0 | healthy |
| 1 | unhealthy |

> 주의: Dockerfile에 HEALTHCHECK가 여러 개 있으면 마지막 것만 적용된다. 스테이지당 하나만 정의한다.

---

---

> 상세 레퍼런스 (예제·고급 패턴·흔한 실수) → [`references/REFERENCE.md`](references/REFERENCE.md)
