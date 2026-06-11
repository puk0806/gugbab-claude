---
name: workflow-agents-2026-05-15
description: "2026-05-15 추가한 범용 \"0→MVP\" 워크플로우 에이전트 9종. 기획→스택 결정→DB 설계→MVP 분해→부트스트랩→구현→보안 감사 갭 메움. tech-stack-advisor·mvp-scope-planner·project-scaffolder·python-backend-architect·python-backend-developer·typescript-backend-architect·typescript-backend-developer·database-architect·security-auditor"
metadata: 
  node_type: memory
  type: project
  originSessionId: fad2d3a7-7551-4503-a516-6a3524b02835
---

## 신규 산출물 9개

### A. meta — 워크플로우 오케스트레이션 (3종)

| 에이전트 | 모델 | 도구 | 역할 |
|---------|------|------|------|
| `tech-stack-advisor` | sonnet | Read/Write/WebSearch/WebFetch | 서비스 요구사항·제약 → 후보 스택 2~3개 비교 + 추천 1개 + 트레이드오프 + 다음 단계 에이전트 매핑. 프론트엔드·백엔드·DB·캐시·배포·관측 종합 결정 |
| `mvp-scope-planner` | sonnet | Read/Write | PRD·기능 후보 → MVP Phase 1·2·3 절단 + 핵심 가설 + 비기능 최소선(인증·보안·관측·접근성·법적) + 완료 조건 + Phase 트리거 + 리스크 + 다음 단계 |
| `project-scaffolder` | sonnet | Read/Write/Edit/Bash | 스택 결정 후 빈 디렉토리 부트스트랩 — CLI init(npm create / cargo new / uv init / Spring Initializr) + 폴더 구조 + .gitignore + README skeleton + 의존성 + lint·format·test 스크립트 + (옵션)Docker·CI + git init 초기 커밋 |

### B. backend — Python 백엔드 (2종, Python 16 스킬 짝)

| 에이전트 | 모델 | 도구 | 역할 |
|---------|------|------|------|
| `python-backend-architect` | sonnet | Read/WebSearch/WebFetch | FastAPI 모듈 구조·레이어드·비동기 전략·DB·캐시·작업 큐 선택·에러 계층·인증/인가·LLM 통합 패턴 결정. 코드 구현은 위임 |
| `python-backend-developer` | sonnet | Read/Write/Edit/Glob/Grep/Bash | FastAPI 라우터·Pydantic v2·서비스·SQLAlchemy 2.x async·Anthropic SSE 스트리밍·JWT·pytest 코드 구현, mypy·ruff·런타임 traceback 에러 분석·수정 (Python 3.12+ / FastAPI 0.115+) |

### C. backend — TypeScript 백엔드 (2종, 신규 갭)

| 에이전트 | 모델 | 도구 | 역할 |
|---------|------|------|------|
| `typescript-backend-architect` | sonnet | Read/WebSearch/WebFetch | Node·Bun·Deno 런타임 / Express·Fastify·NestJS·Hono·Elysia 프레임워크 / Prisma·Drizzle·Kysely ORM / Zod·Valibot·ArkType 검증 / 인증·캐시·LLM 통합·테스트·배포 종합 결정 |
| `typescript-backend-developer` | sonnet | Read/Write/Edit/Glob/Grep/Bash | TS 백엔드 라우터·Zod·Prisma/Drizzle·Anthropic SSE·JWT·vitest 코드 구현, tsc·런타임 에러 분석·수정 |

### D. backend — DB 종합 (1종, 언어 독립)

| 에이전트 | 모델 | 도구 | 역할 |
|---------|------|------|------|
| `database-architect` | sonnet | Read/Write/WebSearch/WebFetch | DBMS 선택(PostgreSQL/MySQL/Oracle/MongoDB/Redis/벡터 DB) + ERD(Mermaid) + 인덱싱(B-tree/GIN/GiST/BRIN) + 트랜잭션 격리·락킹 + 파티셔닝·샤딩 + 캐시·검색·시계열 + 마이그레이션 + 데이터 라이프사이클(PIPA Art.21·36 / GDPR Art.17) + 백업·복구 RPO·RTO |

### E. validation — 보안 진단 (1종)

| 에이전트 | 모델 | 도구 | 역할 |
|---------|------|------|------|
| `security-auditor` | sonnet | Read/Glob/Grep/WebSearch | 17영역 진단 — OWASP Top 10·인증/인가·시크릿·HTTP 헤더·CORS·입력 검증·CSRF·파일 업로드·의존성 CVE·HTTPS·암호화·PIPA·GDPR·HIPAA·PCI-DSS·AI/LLM 리스크(프롬프트 인젝션·PII 외부 전송). severity별 분류 + 파일 경로:라인 + 권장 수정 출력. 진단·권장만, 수정은 다른 에이전트 위임 |

## 통합 워크플로우 — "아이디어 → MVP 출시"

```
사용자: "OO 서비스 만들고 싶어"
  ↓
1. socratic-interviewer (모호함 → 명세)
  ↓
2. competitor-analyst (시장·차별화)
  ↓
3. product-planner (PRD)
  ↓
4. mvp-scope-planner ★ (Phase 1·2·3 절단)
  ↓
5. business-domain-analyst (DDD 도메인 모델)
  ↓
6. tech-stack-advisor ★ (스택 종합 결정)
  ↓
7. database-architect ★ (ERD + 스키마)
  ↓
8. {python|typescript|java|rust}-backend-architect (백엔드 구조)
  ↓
9. frontend-architect (프론트 구조)
  ↓
10. api-spec-designer (OpenAPI)
  ↓
11. ui-ux-designer (와이어프레임)
  ↓
12. project-scaffolder ★ (빈 디렉토리 부트스트랩)
  ↓
13. {language}-backend-developer + frontend-developer (구현)
  ↓
14. qa-engineer (테스트 계획·E2E)
  ↓
15. security-auditor ★ (출시 전 보안 감사)
  ↓
16. devops-engineer (배포)
```

★ = 이번 작업에서 신규 추가

## 카운트 변화

- 에이전트 총 45 → **54** (+9)
- meta: 6 → 9 (+3 — tech-stack-advisor·mvp-scope-planner·project-scaffolder)
- backend: 5 → 10 (+5 — python 2·typescript 2·database 1)
- validation: 12 → 13 (+1 — security-auditor)

## 검증

`agent-design.md` 기준 *역할 정의·도구·실행 절차 중심* — 외부 기술 정보(특정 버전·API 시그니처)는 본문에 박지 않고 실행 시점에 WebSearch/사용자 환경에서 확인. 5단계 외부 검증 생략 가능 카테고리. 9개 모두 동일 패턴.

## 활용 패턴

- 신규 프로젝트 시작 시: `socratic-interviewer → product-planner → mvp-scope-planner → tech-stack-advisor → database-architect → project-scaffolder → developers` 순차
- 기존 프로젝트 점검: `security-auditor` 단독 호출
- 스택 의사결정만 필요: `tech-stack-advisor` 단독 호출
- 백엔드 신규 언어 도입: `{language}-backend-architect → {language}-backend-developer`
- Python 16 스킬 + 2 에이전트 = Python 백엔드 컨벤션 자산 완성

## 커밋·푸시 완료

- `862ffa1` [agent] 워크플로우 에이전트 9종
- `a1dcf88` [docs] README 동기화 (에이전트 9 추가 + 카운트 45→54)

모두 origin/main 푸시 완료.
