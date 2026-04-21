# devops-engineer

## 개요

- **역할**: 프로젝트의 빌드·배포·인프라 설정 전담 에이전트. Dockerfile 멀티스테이지 빌드, docker-compose, GitHub Actions CI/CD 파이프라인, Vercel/Railway 배포 설정, 환경변수 관리를 수행한다.
- **모델**: sonnet
- **도구**: Read, Write, Edit, Glob, Grep, Bash
- **카테고리**: devops

## 사용 시점

- 프로젝트를 Docker 컨테이너로 패키징할 때
- docker-compose로 멀티 서비스 환경을 구성할 때
- GitHub Actions CI/CD 파이프라인을 구축할 때
- Vercel, Railway 등 클라우드 플랫폼 배포 설정이 필요할 때
- 환경변수 관리 체계를 잡을 때
- .dockerignore, .env.example 등 인프라 관련 파일을 작성할 때

## 사용 예시

- "이 프로젝트 Docker화해줘"
- "GitHub Actions CI/CD 파이프라인 만들어줘"
- "Vercel 배포 설정해줘"
- "Railway에 배포할 수 있게 railway.toml 만들어줘"
- "docker-compose로 개발 환경 구성해줘"

## 입력/출력

- **입력**: 프로젝트 경로, 배포 대상 플랫폼, 기술 스택 정보, CI/CD 요구사항
- **출력**: Dockerfile, docker-compose.yml, GitHub Actions 워크플로우, 배포 설정 파일(vercel.json, railway.toml), .env.example, .dockerignore

## 산출물

| 산출물 | 설명 |
|--------|------|
| Dockerfile | 멀티스테이지 빌드, non-root 사용자, 레이어 캐싱 최적화 |
| docker-compose.yml | 서비스 오케스트레이션, 헬스체크, 네트워크 분리 |
| .github/workflows/*.yml | CI(lint, test, build) 및 CD(deploy) 파이프라인 |
| vercel.json / railway.toml | 플랫폼별 배포 설정 |
| .env.example | 환경변수 템플릿 (실제 값 미포함) |
| .dockerignore | Docker 빌드 제외 파일 목록 |

## 검증 소스

| 항목 | 공식 문서 | 검증일 |
|------|-----------|--------|
| Dockerfile 모범 사례 | https://docs.docker.com/build/building/best-practices/ | 2026-04-20 |
| Docker 멀티스테이지 빌드 | https://docs.docker.com/build/building/multi-stage/ | 2026-04-20 |
| GitHub Actions 재사용 워크플로우 | https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows | 2026-04-20 |
| Vercel 프로젝트 설정 | https://vercel.com/docs/project-configuration/vercel-json | 2026-04-20 |
| Railway Config as Code | https://docs.railway.com/config-as-code | 2026-04-20 |

## 관련 에이전트

- **frontend-developer** (frontend) -- 프론트엔드 코드 수정이 필요할 때 위임
- **rust-backend-developer** (backend) -- Rust 백엔드 코드 수정이 필요할 때 위임
