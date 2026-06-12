# 템플릿: java-spring-modern (6)

Java 21 + Spring Boot 3.x + Jar/Native + MyBatis 모던 백엔드 프로젝트.

```
./project-install.sh  →  번호 입력: 6
```

---

## 에이전트

| 카테고리 | 에이전트 | 설명 |
|----------|---------|------|
| meta | [agent-creator](../../.claude/agents/meta/agent-creator.md) | 에이전트 MD 파일 대화형 생성 |
| meta | [skill-creator](../../.claude/agents/meta/skill-creator.md) | 공식 문서 검증 후 SKILL.md 생성 |
| meta | [skill-tester](../../.claude/agents/meta/skill-tester.md) | PENDING_TEST 스킬 2단계 실사용 테스트 |
| meta | [freshness-auditor](../../.claude/agents/meta/freshness-auditor.md) | 에이전트·스킬 최신화 필요 항목 감사 |
| meta | [planner](../../.claude/agents/meta/planner.md) | 복잡한 작업 단계별 실행 계획 분해 |
| meta | [claude-code-guide](../../.claude/agents/meta/claude-code-guide.md) | Claude Code CLI 사용법·설정 가이드 |
| meta | [tech-stack-advisor](../../.claude/agents/meta/tech-stack-advisor.md) | 요구사항에 맞는 기술 스택 추천·비교 |
| meta | [mvp-scope-planner](../../.claude/agents/meta/mvp-scope-planner.md) | MVP Phase 1·2·3 범위 절단 |
| meta | [project-scaffolder](../../.claude/agents/meta/project-scaffolder.md) | 결정된 스택으로 프로젝트 부트스트랩 |
| backend | [java-backend-developer](../../.claude/agents/backend/java-backend-developer.md) | Java + Spring Boot 백엔드 코드 구현 |
| backend | [java-backend-architect](../../.claude/agents/backend/java-backend-architect.md) | Java + Spring Boot 백엔드 아키텍처 설계 |
| backend | [python-backend-developer](../../.claude/agents/backend/python-backend-developer.md) | FastAPI 백엔드 코드 구현 |
| backend | [python-backend-architect](../../.claude/agents/backend/python-backend-architect.md) | FastAPI 백엔드 아키텍처 설계 |
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
| validation | [qa-engineer](../../.claude/agents/validation/qa-engineer.md) | E2E 테스트·Playwright 코드 생성 |
| validation | [security-auditor](../../.claude/agents/validation/security-auditor.md) | OWASP·PIPA·LLM 리스크 보안 감사 |

> `build-error-resolver`는 Java 템플릿에서 제외됩니다 (Rust/TS 전용 기능).

---

## 스킬

| 카테고리 | 종류 | 링크 |
|----------|------|------|
| backend — Java 공통 (13종) | spring-boot-gradle-setup·mybatis·hikaricp·global-exception·logback·xss 등 | [→ 목록](../skills/backend/README.md) |
| backend — Java 모던 전용 (4종) | spring-security-6·springdoc-openapi-3·redis-redisson-modern·aws-sdk-v2 | [→ 목록](../skills/backend/README.md) |
| backend — Python (10종) | FastAPI·Pydantic·LlamaIndex·Anthropic SDK 등 | [→ 목록](../skills/backend/README.md) |
| devops (9종) | Docker·GitHub Actions·n8n·SEO 운영 | [→ 목록](../skills/devops/README.md) |
| architecture (2종) | DDD, 꿈 앱 데이터 모델 | [→ 목록](../skills/architecture/README.md) |
| meta (5종) | 워크플로우·프롬프트 엔지니어링 | [→ 목록](../skills/meta/README.md) |

> 레거시 전용 스킬(spring-security-5·swagger-springfox-2·redis-redisson-legacy·ehcache-2·aws-sdk-v1) 제외.

---

## 훅 (23종)

### 공통 (19종)

| 훅 | 이벤트 | 설명 |
|----|--------|------|
| [_lib.js](../../.claude/hooks/_lib.js) | — | 훅 공통 유틸리티 모듈 |
| [bash-guard.js](../../.claude/hooks/bash-guard.js) | PreToolUse Bash | 위험한 Bash 명령어 패턴 차단 (rm -rf 시스템 경로, force push 등) |
| [auto-approve.js](../../.claude/hooks/auto-approve.js) | PreToolUse | Bash를 제외한 도구 자동 승인 |
| [parry.js](../../.claude/hooks/parry.js) | PreToolUse Write | 시크릿·프롬프트 인젝션 패턴 스캔 — 감지 시 저장 차단 |
| [protect-secrets.js](../../.claude/hooks/protect-secrets.js) | PreToolUse Write/Edit | 민감 파일(.env, *.pem, *.key, credentials 등) 수정 차단 |
| [session-start.js](../../.claude/hooks/session-start.js) | SessionStart | 세션 시작 시 브랜치·미커밋 파일·최근 커밋 요약 출력 |
| [session-handoff-inject.js](../../.claude/hooks/session-handoff-inject.js) | SessionStart | 직전 세션 핸드오프(24h 이내) git 상태 컨텍스트 주입 |
| [session-summary.js](../../.claude/hooks/session-summary.js) | Stop / PostToolUse | 수정된 파일 목록 및 작업 요약 기록 |
| [session-handoff.js](../../.claude/hooks/session-handoff.js) | Stop | 세션 종료 시 브랜치·커밋·변경 파일 핸드오프 파일 저장 |
| [cc-notify.js](../../.claude/hooks/cc-notify.js) | Stop | 작업 완료 시 macOS 데스크탑 알림 |
| [instructions-loaded.js](../../.claude/hooks/instructions-loaded.js) | InstructionsLoaded | CLAUDE.md 로드 완료 시 규칙 요약 출력 |
| [pending-test-guard.js](../../.claude/hooks/pending-test-guard.js) | Stop | PENDING_TEST 스킬 존재 시 세션 종료 차단 |
| [readme-guard.js](../../.claude/hooks/readme-guard.js) | Stop / PreToolUse Bash | 에이전트·스킬 추가 후 README 미업데이트 경고 |
| [skill-md-guard.js](../../.claude/hooks/skill-md-guard.js) | PostToolUse Write | SKILL.md 소스 URL·검증일·필수 섹션 검증 |
| [agent-md-guard.js](../../.claude/hooks/agent-md-guard.js) | PostToolUse Write | 에이전트 .md name·description·tools·model·example 형식 검증 |
| [verification-guard.js](../../.claude/hooks/verification-guard.js) | PostToolUse Write | verification.md 필수 섹션 확인, UNVERIFIED 상태 차단 |
| [staleness-check.js](../../.claude/hooks/staleness-check.js) | InstructionsLoaded | 스킬 검증일 경과 감지 — 30~59일 경고, 60일+ 재검증 강제 |
| [task-plan-guard.js](../../.claude/hooks/task-plan-guard.js) | UserPromptSubmit | 복잡한 작업 요청 감지 시 계획 확인 절차 지시 |
| [statusline.sh](../../.claude/hooks/statusline.sh) | statusLine | 상태 바 — 브랜치·미커밋 수·PENDING_TEST 스킬 수 표시 |

### 개발 전용 (4종)

| 훅 | 이벤트 | 설명 |
|----|--------|------|
| [tdd-guard.js](../../.claude/hooks/tdd-guard.js) | PostToolUse Write/Edit | 소스 파일 수정 시 대응 테스트 파일 존재 여부 검사 (경고) |
| [test-fake-guard.js](../../.claude/hooks/test-fake-guard.js) | PreToolUse Bash / PostToolUse Write | 가짜 테스트 패턴 탐지·차단 |
| [verification-gate.js](../../.claude/hooks/verification-gate.js) | Stop | 소스 파일 수정 후 테스트 파일 변경 없으면 경고 출력 |
| [careful-with-judge.js](../../.claude/hooks/careful-with-judge.js) | PreToolUse Bash | rm -rf 분석 — 시스템·.git·홈 삭제는 차단, 그 외 경고 |

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
| [java.md](../../.claude/rules/java.md) | Java + Spring Boot 코딩 규칙 — 레거시(Java 11/SB 2.5)·모던(Java 21/SB 3.x) 양쪽 |

---

## CLAUDE.md

설치 시 [`examples/CLAUDE.java-spring-modern.md`](../../examples/CLAUDE.java-spring-modern.md)가 대상 프로젝트 루트에 복사됩니다.

이미 CLAUDE.md가 있으면 덮어쓸지 확인 후 처리합니다.

**사전 구성 내용:**
- Java 모던 전용 금지 사항 (javax.* import → jakarta.*, WebSecurityConfigurerAdapter → SecurityFilterChain, Springfox → Springdoc)
- 공통 원칙 (커밋·푸시 사용자 요청 시에만, 계획 확인 절차)
- 규칙 참조 표 (task-workflow·git·info-verification·java·agent-design·commands·readme-update)

---

## settings.json

`scripts/gen-settings.js --dev` 플래그로 생성됩니다.

이미 settings.json이 있으면 덮어쓸지 확인 후 처리합니다.

| 설정 | 값 |
|------|-----|
| `defaultMode` | `"acceptEdits"` — 파일 수정 도구 자동 승인 |
| `permissions.allow` | node/npm/gradle/git 조회·변경 명령어, Write/Edit/Read/Glob/Grep/WebSearch/WebFetch/Agent |
| `permissions.deny` | `git push --force`, `rm -rf` 시스템 경로, `chmod 777`, curl\|bash 패턴 |
| `permissions.additionalDirectories` | `/tmp`, `/private/tmp`, `/var/folders` |
| `statusLine` | 브랜치·미커밋·PENDING_TEST 상태 표시 (`statusline.sh`) |
| 훅 연결 | 공통 19종 + dev(tdd-guard·test-fake-guard·verification-gate·careful-with-judge) 연결 (TypeScript 훅 제외) |
