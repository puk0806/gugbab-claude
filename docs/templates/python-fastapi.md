# 템플릿: python-fastapi (13)

Python 3.12+ + FastAPI 백엔드 프로젝트. python 백엔드 스킬 10종·에이전트 2종의 **스택 소유 템플릿**.
프론트엔드·Java·Rust·Unity·학술·도메인 앱(health·dream·fortune) 전용 자산 제외.

```
./project-install.sh  →  번호 입력: 13  (또는 이름: python-fastapi / 프론트 병행: 13,2 · 13,3)
```

> **신설 배경 (2026-09-25)**: python 백엔드 자산은 그동안 도메인 앱 템플릿(dream-interpretation 9·fortune-app 12)과 `all`로만 설치됐다.
> Java·Rust처럼 독립 스택 템플릿으로 소유권을 부여했다. 9·12는 기존대로 python 자산을 계속 받는다(회귀 테스트로 고정).

---

## 에이전트 (24종 — 작성 도구 y 시 27종)

| 카테고리 | 에이전트 | 설명 |
|----------|---------|------|
| meta | [freshness-auditor](../../.claude/agents/meta/freshness-auditor.md) | 에이전트·스킬 최신화 필요 항목 감사 |
| meta | [claude-code-guide](../../.claude/agents/meta/claude-code-guide.md) | Claude Code CLI 사용법·설정 가이드 |
| meta | [tech-stack-advisor](../../.claude/agents/meta/tech-stack-advisor.md) | 요구사항에 맞는 기술 스택 추천·비교 |
| meta | [project-scaffolder](../../.claude/agents/meta/project-scaffolder.md) | 결정된 스택으로 프로젝트 부트스트랩 (FastAPI + uv init) |
| meta | [changelog-writer](../../.claude/agents/meta/changelog-writer.md) | git log → CHANGELOG.md 자동 작성 |
| backend | [python-backend-developer](../../.claude/agents/backend/python-backend-developer.md) | FastAPI·Pydantic v2·SQLAlchemy 2.x async·Anthropic SDK 코드 구현 |
| backend | [python-backend-architect](../../.claude/agents/backend/python-backend-architect.md) | FastAPI 모듈 구조·비동기 전략·DB/캐시/작업 큐 설계 |
| backend | [database-architect](../../.claude/agents/backend/database-architect.md) | DB 스키마·ERD·인덱싱 설계 |
| domain | [business-domain-analyst](../../.claude/agents/domain/business-domain-analyst.md) | 비즈니스 요구사항 → DDD 도메인 모델 도출 |
| domain | [codebase-domain-analyst](../../.claude/agents/domain/codebase-domain-analyst.md) | 코드베이스 역분석 → 도메인 구조 진단 |
| domain | [product-planner](../../.claude/agents/domain/product-planner.md) | 아이디어·요구사항 → PRD 작성 |
| domain | [ui-ux-designer](../../.claude/agents/domain/ui-ux-designer.md) | PRD → 와이어프레임·디자인 토큰·컴포넌트 스펙 |
| domain | [api-spec-designer](../../.claude/agents/domain/api-spec-designer.md) | PRD → OpenAPI 3.1 스펙·에러 코드·인증 설계 |
| devops | [devops-engineer](../../.claude/agents/devops/devops-engineer.md) | Dockerfile·GitHub Actions·배포 설정 |
| research | [deep-researcher](../../.claude/agents/research/deep-researcher.md) | 논문/오픈소스/기업 사례 3축 딥 리서치 |
| research | [web-searcher](../../.claude/agents/research/web-searcher.md) | 검색 축별 소스 탐색 전담 |
| research | [research-reviewer](../../.claude/agents/research/research-reviewer.md) | 리서치 보고서 품질 평가 |
| research | [data-analyst](../../.claude/agents/research/data-analyst.md) | 이벤트 택소노미·퍼널 분석·A/B 테스트 설계 |
| research | [competitor-analyst](../../.claude/agents/research/competitor-analyst.md) | 경쟁사 분석·기능 비교·차별화 포인트 도출 |
| validation | [fact-checker](../../.claude/agents/validation/fact-checker.md) | 사실·수치·주장 교차 검증 |
| validation | [source-validator](../../.claude/agents/validation/source-validator.md) | URL·문서 신뢰도 판정 |
| validation | [pr-reviewer](../../.claude/agents/validation/pr-reviewer.md) | PR diff 리뷰 코멘트·판정 생성 |
| validation | [qa-engineer](../../.claude/agents/validation/qa-engineer.md) | 테스트 계획·적대적 E2E 시나리오 생성 |
| validation | [security-auditor](../../.claude/agents/validation/security-auditor.md) | OWASP·PIPA·LLM 리스크 보안 감사 |

**제외 (EXCLUDE_AGENTS_PYTHON)**: frontend-developer·frontend-architect·frontend-domain-refactorer·`frontend/CLAUDE.md`·`backend/CLAUDE.md`(rust.md·java.md 임포트 — 이 템플릿엔 없는 규칙),
rust·java·typescript 백엔드 에이전트 6종, build-error-resolver(cargo·tsc·Vite 전담), SEO·a11y·성능 측정 검증 에이전트 5종.
학술·dream·fortune·health·game 전용 에이전트는 개발 템플릿 공통 규칙으로 제외된다.

---

## 스킬 (22종)

| 카테고리 | 종류 | 링크 |
|----------|------|------|
| backend — Python (10종) | python-fastapi · python-pydantic-v2 · python-async-asyncio · python-uv-project-setup · python-anthropic-sdk · python-langchain-current · python-llamaindex · python-embeddings-vector-db · python-korean-nlp-konlpy · python-cli-typer | [→ 목록](../skills/backend/README.md) |
| devops (8종) | docker-deployment · github-actions · n8n 5종 · vercel-sandbox | [→ 목록](../skills/devops/README.md) |
| architecture (3종) | ddd · incremental-refactoring · module-boundaries | [→ 목록](../skills/architecture/README.md) |
| meta (1종) | claude-code-hook-authoring | [→ 목록](../skills/meta/README.md) |

**차단**: backend 는 `backend/python-*` 만 (java·rust·drizzle-neon-postgres·claude-code-headless·만세력 제외),
frontend·game·humanities·education·research·writing 카테고리 전체, 프론트 전용 devops 3종(site-migration-seo·github-actions-visual-regression·vercel-workflow),
dream 전용 meta 3종·architecture 1종, frontend-domain-structure.

---

## 훅 (18종 — 공통 14 + 개발 전용 4)

공통 14종은 [fortune-app.md](./fortune-app.md#훅-19종--공통-14--개발-전용-4--typescript-1) 참조.

개발 전용: `tdd-guard.js` · `test-fake-guard.js` · `adversarial-test-guard.js` · `fake-impl-guard.js`

> TypeScript 훅(typescript-quality)은 포함되지 않는다. react-spa·nextjs 를 병행 선택(`13,2`)하면 union 으로 추가되고 레거시 프로파일 질문도 나온다.

---

## 규칙 (4종 기본 / 작성 도구 y 시 9종)

| 규칙 | 조건 |
|------|------|
| git.md | 항상 |
| info-verification.md | 항상 |
| task-workflow.md | 항상 |
| adversarial-testing.md | 항상 (dev 템플릿 공통) |
| agent-design.md · creation-workflow.md · commands.md · readme-update.md · verification-policy.md | 작성 도구 y |
| memory-sync.md | memory 공유 선택 시 |
| codex-review.md | Codex 선택 시 |

> 전용 `python.md` 코딩 규칙은 아직 없다 — 언어 규칙은 CLAUDE.md 금지 사항과 python 스킬이 담당한다.

---

## CLAUDE.md

설치 시 [`examples/CLAUDE.python-fastapi.md`](../../examples/CLAUDE.python-fastapi.md)가 대상 프로젝트 루트에 복사된다.
다른 템플릿과 병행 선택 시 첫 번째 템플릿이 베이스이고 나머지는 도메인 섹션·금지 사항만 병합된다.

**사전 구성 내용:**
- 금지 사항: async 경로의 blocking I/O, Pydantic v1 API 신규 작성, SQL 문자열 포매팅, `print()` 로깅, `uv` 를 거치지 않는 의존성 설치
- 필수 원칙: 계획 확인 절차 + 적대적 테스트 3계층
- 규칙 참조 표 — 미설치 규칙 행(작성 도구·Codex 옵션)은 설치 시 자동 제거

---

## settings.json

`scripts/gen-settings.js --dev` 플래그로 생성된다 (`--typescript` 없음). 이미 있으면 덮어쓸지 확인한다.

---

## 옵션 질문

| 질문 | 나오는가 |
|------|:---:|
| memory 공유 · Superpowers · 브랜치 보호 · README guard · staleness guard · 작성 도구 | ✅ |
| Codex 적대적 리뷰 (dev 템플릿) | ✅ |
| 레거시 TS 프로파일 | ❌ (TS 템플릿 병행 시에만) |
| SEO·GEO 옵트인 | ❌ (백엔드 — SEO 가 필요하면 `13,11` 또는 프론트 템플릿 병행) |

---

## 재설치·전환 수렴

python 스킬·에이전트가 빠지는 전환(`13→4`, `9→5` 등)에서는 조합 조건 없이 prune 목록에 기록되고,
매니페스트 해시가 일치하는(=손대지 않은) 파일과 짝 docs 만 삭제된다. 사용자가 수정한 사본은 보존된다.

---

## 설치 검증 (2026-09-25, 2026-09-30 재실측)

기본 옵션(전부 엔터) 실측: 스킬 22 · 에이전트 24 · 훅 18 · 규칙 4 · 커맨드 9 · 매니페스트 `templates: ["python-fastapi"]`.
`scripts/template-separation.test.js` — 단독 / 9·12 회귀 / `13,2` union / 잘못된 번호·이름 입력 / `13→4` 다운그레이드 수렴 케이스.
