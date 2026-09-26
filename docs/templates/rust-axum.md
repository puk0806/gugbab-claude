# 템플릿: rust-axum (4)

Rust + Axum 백엔드 프로젝트. 프론트엔드·Java·게임·학술 스킬 제외.

```
./project-install.sh  →  번호 입력: 4
```

---

## 에이전트 (30종 — 작성 도구 y 시 33종)

| 카테고리 | 에이전트 | 설명 |
|----------|---------|------|
| meta | [freshness-auditor](../../.claude/agents/meta/freshness-auditor.md) | 에이전트·스킬 최신화 필요 항목 감사 |
| meta | [claude-code-guide](../../.claude/agents/meta/claude-code-guide.md) | Claude Code CLI 사용법·설정 가이드 |
| meta | [tech-stack-advisor](../../.claude/agents/meta/tech-stack-advisor.md) | 요구사항에 맞는 기술 스택 추천·비교 |
| meta | [project-scaffolder](../../.claude/agents/meta/project-scaffolder.md) | 결정된 스택으로 프로젝트 부트스트랩 |
| meta | [changelog-writer](../../.claude/agents/meta/changelog-writer.md) | git log → CHANGELOG.md 자동 작성 |
| backend | [rust-backend-developer](../../.claude/agents/backend/rust-backend-developer.md) | Rust + Axum 백엔드 코드 구현 |
| backend | [rust-backend-architect](../../.claude/agents/backend/rust-backend-architect.md) | Rust + Axum 백엔드 아키텍처 설계 |
| backend | [database-architect](../../.claude/agents/backend/database-architect.md) | DB 스키마·ERD·인덱싱 설계 |
| backend | [build-error-resolver](../../.claude/agents/backend/build-error-resolver.md) | 빌드·컴파일·타입 에러 진단·수정 |
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
| validation | [qa-engineer](../../.claude/agents/validation/qa-engineer.md) | E2E 테스트·Playwright 코드 생성 |
| validation | [security-auditor](../../.claude/agents/validation/security-auditor.md) | OWASP·PIPA·LLM 리스크 보안 감사 |
| validation | [pr-reviewer](../../.claude/agents/validation/pr-reviewer.md) | PR diff 리뷰 코멘트·판정 생성 |
| validation | [a11y-auditor](../../.claude/agents/validation/a11y-auditor.md) | WCAG 2.2 접근성 자동 점검 |
| validation | [build-perf-benchmarker](../../.claude/agents/validation/build-perf-benchmarker.md) | 빌드·번들·Lighthouse 성능 실측 |
| validation | [perf-report-writer](../../.claude/agents/validation/perf-report-writer.md) | 성능 실측 결과 → 이해관계자용 보고서 작성 |
| validation | [seo-auditor](../../.claude/agents/validation/seo-auditor.md) | SEO·GEO 상태 통합 감사 |
| validation | [content-quality-reviewer](../../.claude/agents/validation/content-quality-reviewer.md) | 콘텐츠 E-E-A-T·신뢰 신호 진단 |

> `typescript-backend-developer`·`typescript-backend-architect`·`python-backend-developer`·`python-backend-architect`는 rust 템플릿에서 제외됩니다 (2026-09-25 TS 에이전트 누수 차단, python은 2026-09-11부터).
> 작성 도구 3종(agent-creator·skill-creator·skill-tester)은 "작성 도구" 옵션 y일 때만 포함됩니다 (기본 n).
> validation의 SEO/성능 계열 5종(seo-auditor·content-quality-reviewer·a11y-auditor·build-perf-benchmarker·perf-report-writer)은 기본 옵션 설치에도 포함된다 — 2026-09-25 실측 확인, 프론트 전용 스킬(frontend/*)은 여전히 설치되지 않는다.

---

## 스킬 (32종)

| 카테고리 | 종류 | 링크 |
|----------|------|------|
| backend — Rust (18종) | Axum·sqlx·thiserror·tokio·tower-http·serde·tracing 등 + claude-code-headless (Claude 구독 중계 연동용 예외) | [→ 목록](../skills/backend/README.md) |
| devops (8종) | docker-deployment·github-actions·n8n 5종·vercel-sandbox | [→ 목록](../skills/devops/README.md) |
| architecture (3종) | ddd·incremental-refactoring·module-boundaries | [→ 목록](../skills/architecture/README.md) |
| meta (3종) | claude-code-hook-authoring·ralph-loop·riper-workflow | [→ 목록](../skills/meta/README.md) |

> 2026-08-31: dream 전용(meta 3·architecture 1)·frontend-domain-structure가 fallthrough로 딸려가던 누수를 차단했습니다.
> 2026-09-11: python 에이전트 2종(python-backend-developer·python-backend-architect)을 배제 목록에 추가 — Python 스킬은 원래 설치되지 않습니다 (rust 화이트리스트 방식).
> 2026-09-25 실측: devops는 github-actions-visual-regression·site-migration-seo(프론트 전용)를 포함하지 않아 8종(이전 표의 10종은 과다 계상이었다).

---

## 훅 (19종)

### 공통 (15종)

| 훅 | 이벤트 | 설명 |
|----|--------|------|
| [_lib.js](../../.claude/hooks/_lib.js) | — | 훅 공통 유틸리티 모듈 |
| [bash-guard.js](../../.claude/hooks/bash-guard.js) | PreToolUse Bash | 위험한 Bash 명령어 패턴 차단 (rm -rf 시스템 경로, force push 등) |
| [auto-approve.js](../../.claude/hooks/auto-approve.js) | PreToolUse | Bash를 제외한 도구 자동 승인 |
| [parry.js](../../.claude/hooks/parry.js) | PreToolUse Write | 시크릿·프롬프트 인젝션 패턴 스캔 — 감지 시 저장 차단 |
| [protect-secrets.js](../../.claude/hooks/protect-secrets.js) | PreToolUse Write/Edit | 민감 파일(.env, *.pem, *.key, credentials 등) 수정 차단 |
| [session-start.js](../../.claude/hooks/session-start.js) | SessionStart | 세션 시작 시 브랜치·미커밋 파일·최근 커밋 요약 출력 |
| [session-export.js](../../.claude/hooks/session-export.js) | Stop | 세션 대화 요약을 로컬 exports에 기록 |
| [cc-notify.js](../../.claude/hooks/cc-notify.js) | Stop | 작업 완료 시 macOS 데스크탑 알림 |
| [instructions-loaded.js](../../.claude/hooks/instructions-loaded.js) | SessionStart | CLAUDE.md 로드 완료 시 규칙 요약 출력 |
| [deliverable-guard.js](../../.claude/hooks/deliverable-guard.js) | PostToolUse Write/Edit · PreToolUse Bash · Stop | 산출물 완결성 — 세션 수정 파일 추적 + README 동기화 검사 + PENDING_TEST 스킬 테스트 미수행 차단 |
| [skill-md-guard.js](../../.claude/hooks/skill-md-guard.js) | PostToolUse Write | SKILL.md 소스 URL·검증일·필수 섹션 검증 |
| [agent-md-guard.js](../../.claude/hooks/agent-md-guard.js) | PostToolUse Write | 에이전트 .md name·description·tools·model·example 형식 검증 |
| [verification-guard.js](../../.claude/hooks/verification-guard.js) | PostToolUse Write | verification.md 필수 섹션 확인, UNVERIFIED 상태 차단 |
| [staleness-check.js](../../.claude/hooks/staleness-check.js) | SessionStart | 스킬 검증일 경과 감지 — 30~59일 경고, 60일+ 재검증 강제 |
| [statusline.sh](../../.claude/hooks/statusline.sh) | statusLine | 상태 바 — 브랜치·미커밋 수·PENDING_TEST 스킬 수 표시 |

### 개발 전용 (4종)

| 훅 | 이벤트 | 설명 |
|----|--------|------|
| [tdd-guard.js](../../.claude/hooks/tdd-guard.js) | PostToolUse Write/Edit | 소스 파일 수정 시 대응 테스트 파일 존재 여부 검사 (경고) |
| [test-fake-guard.js](../../.claude/hooks/test-fake-guard.js) | PreToolUse Bash / PostToolUse Write | 가짜 테스트 패턴 탐지·차단 |
| [adversarial-test-guard.js](../../.claude/hooks/adversarial-test-guard.js) | PostToolUse Write/Edit | 테스트에 악성 유저 방어·경계 계층 없으면 차단 |
| [fake-impl-guard.js](../../.claude/hooks/fake-impl-guard.js) | PostToolUse Write/Edit | 테스트 기대 리터럴을 그대로 반환하는 가짜 구현 차단 |

> TypeScript 훅(typescript-quality)·Memory 훅은 이 템플릿에 포함되지 않습니다.

---

## 규칙 (9종)

| 규칙 | 설명 |
|------|------|
| [git.md](../../.claude/rules/git.md) | Git 커밋 컨벤션 — [category] Type: Subject 형식, 관심사별 커밋 분리 |
| [info-verification.md](../../.claude/rules/info-verification.md) | 외부 정보 검증 원칙 — 공식 문서 1순위, 교차 검증 절차 |
| [agent-design.md](../../.claude/rules/agent-design.md) | 에이전트 설계 규칙 — 모델 선택, 도구 부여 기준, 파일 작성 포맷 |
| [commands.md](../../.claude/rules/commands.md) | 슬래시 커맨드 작성 규칙 — 파일 위치, 작성 원칙, 기존 목록 |
| [creation-workflow.md](../../.claude/rules/creation-workflow.md) | 스킬·에이전트 생성 5단계 — 조사→교차검증→작성→검증문서→2단계테스트 |
| [readme-update.md](../../.claude/rules/readme-update.md) | README 업데이트 규칙 — 추가/삭제/이름변경 시 반영 항목 |
| [verification-policy.md](../../.claude/rules/verification-policy.md) | 검증 정책 — PENDING_TEST→APPROVED 전환 절차, 수정 도구 제한 |
| [task-workflow.md](../../.claude/rules/task-workflow.md) | 작업 착수 전 확인 절차 — 이해 확인→작업 목록→승인 후 실행 |
| [rust.md](../../.claude/rules/rust.md) | Rust + Axum 코딩 규칙 — 에러 처리, 타입 설계, 비동기, 아키텍처, Clippy 기준 |

---

## CLAUDE.md

설치 시 [`examples/CLAUDE.rust-axum.md`](../../examples/CLAUDE.rust-axum.md)가 대상 프로젝트 루트에 복사됩니다.

이미 CLAUDE.md가 있으면 덮어쓸지 확인 후 처리합니다.

**사전 구성 내용:**
- Rust 전용 금지 사항 (unwrap() 프로덕션 사용 금지, blocking 코드 async 함수 직접 실행 금지)
- 공통 원칙 (커밋·푸시 사용자 요청 시에만, 계획 확인 절차)
- 규칙 참조 표 (task-workflow·git·info-verification·rust·agent-design·commands·readme-update)

---

## settings.json

`scripts/gen-settings.js --dev` 플래그로 생성됩니다.

이미 settings.json이 있으면 덮어쓸지 확인 후 처리합니다.

| 설정 | 값 |
|------|-----|
| `defaultMode` | `"acceptEdits"` — 파일 수정 도구 자동 승인 |
| `permissions.allow` | node/npm/cargo/git 조회·변경 명령어, Write/Edit/Read/Glob/Grep/WebSearch/WebFetch/Agent |
| `permissions.deny` | `git push --force`, `rm -rf` 시스템 경로, `chmod 777`, curl\|bash 패턴 |
| `permissions.additionalDirectories` | `/tmp`, `/private/tmp`, `/var/folders` |
| `statusLine` | 브랜치·미커밋·PENDING_TEST 상태 표시 (`statusline.sh`) |
| 훅 연결 | 공통 15종 + dev(tdd-guard·test-fake-guard·adversarial-test-guard·fake-impl-guard) 연결 (TypeScript 훅 제외) |
