# 템플릿: dream-interpretation (9)

꿈 해몽 앱 개발 전용. dream 도메인 스킬·에이전트 + 프론트엔드·Python 백엔드 포함.

```
./project-install.sh  →  번호 입력: 9
```

---

## 에이전트 (27종)

| 카테고리 | 에이전트 | 설명 |
|----------|---------|------|
| frontend | [frontend-developer](../../.claude/agents/frontend/frontend-developer.md) | React/Next.js 컴포넌트·훅·API 연동 구현 |
| frontend | [frontend-architect](../../.claude/agents/frontend/frontend-architect.md) | 프론트엔드 아키텍처 설계·기술 판단 |
| backend | [python-backend-developer](../../.claude/agents/backend/python-backend-developer.md) | FastAPI 백엔드 코드 구현 |
| backend | [python-backend-architect](../../.claude/agents/backend/python-backend-architect.md) | FastAPI 백엔드 아키텍처 설계 |
| backend | [database-architect](../../.claude/agents/backend/database-architect.md) | DB 스키마·ERD·인덱싱 설계 |
| devops | [devops-engineer](../../.claude/agents/devops/devops-engineer.md) | Dockerfile·GitHub Actions·배포 설정 |
| domain | [api-spec-designer](../../.claude/agents/domain/api-spec-designer.md) | PRD → OpenAPI 3.1 스펙·에러 코드·인증 설계 |
| domain | [product-planner](../../.claude/agents/domain/product-planner.md) | 아이디어·요구사항 → PRD 작성 |
| domain | [ui-ux-designer](../../.claude/agents/domain/ui-ux-designer.md) | PRD → 와이어프레임·디자인 토큰·컴포넌트 스펙 |
| research | [dream-journal-coach](../../.claude/agents/research/dream-journal-coach.md) | 누적 꿈 일기 시리즈 반복 패턴·코칭 분석 |
| research | [dream-multi-perspective-synthesizer](../../.claude/agents/research/dream-multi-perspective-synthesizer.md) | 꿈 한국 전통·프로이트·융·애착 이론 다축 풀이 |
| research | [web-searcher](../../.claude/agents/research/web-searcher.md) | 검색 축별 소스 탐색 전담 |
| research | [deep-researcher](../../.claude/agents/research/deep-researcher.md) | 논문/오픈소스/기업 사례 3축 딥 리서치 |
| research | [research-reviewer](../../.claude/agents/research/research-reviewer.md) | 리서치 보고서 품질 평가 |
| validation | [dream-image-safety-classifier](../../.claude/agents/validation/dream-image-safety-classifier.md) | 꿈 시각화 프롬프트·이미지 5카테고리 안전 분류 |
| validation | [dream-interpretation-prompt-tester](../../.claude/agents/validation/dream-interpretation-prompt-tester.md) | 꿈 해몽 시스템 프롬프트 5축 품질 평가 |
| validation | [dream-safety-classifier](../../.claude/agents/validation/dream-safety-classifier.md) | 꿈 텍스트 위기 신호 5카테고리 실시간 분류 |
| validation | [fact-checker](../../.claude/agents/validation/fact-checker.md) | 사실·수치·주장 교차 검증 |
| validation | [source-validator](../../.claude/agents/validation/source-validator.md) | URL·문서 신뢰도 판정 |
| validation | [qa-engineer](../../.claude/agents/validation/qa-engineer.md) | E2E 테스트·Playwright 코드 생성 |
| validation | [security-auditor](../../.claude/agents/validation/security-auditor.md) | OWASP·PIPA·LLM 리스크 보안 감사 |
| meta | [planner](../../.claude/agents/meta/planner.md) | 복잡한 작업 단계별 실행 계획 분해 |
| meta | [claude-code-guide](../../.claude/agents/meta/claude-code-guide.md) | Claude Code CLI 사용법·설정 가이드 |
| meta | [tech-stack-advisor](../../.claude/agents/meta/tech-stack-advisor.md) | 요구사항에 맞는 기술 스택 추천·비교 |
| meta | [mvp-scope-planner](../../.claude/agents/meta/mvp-scope-planner.md) | MVP Phase 1·2·3 범위 절단 |
| meta | [project-scaffolder](../../.claude/agents/meta/project-scaffolder.md) | 결정된 스택으로 프로젝트 부트스트랩 |
| meta | [build-perf-benchmarker](../../.claude/agents/validation/build-perf-benchmarker.md) | 빌드·번들·Lighthouse 성능 지표 측정 |

---

## 스킬

| 카테고리 | 종류 | 링크 |
|----------|------|------|
| frontend (76종) | 프레임워크·상태관리·UI·빌드·테스트·성능·SEO·꿈 앱 UI | [→ frontend 스킬 목록](../skills/frontend/README.md) |
| backend — Python (10종) | FastAPI·Pydantic·LlamaIndex·Anthropic SDK 등 | [→ backend 스킬 목록](../skills/backend/README.md) |
| devops (9종) | Docker·GitHub Actions·n8n·SEO 운영 | [→ devops 스킬 목록](../skills/devops/README.md) |
| architecture (2종) | DDD + dream-journal-data-modeling | [→ architecture 스킬 목록](../skills/architecture/README.md) |
| humanities (7종) | 꿈 관련 전용 (dream-psychology·korean-dream·attachment 등) | [→ humanities 스킬 목록](../skills/humanities/README.md) |
| writing (4종) | SEO 콘텐츠 품질 (content-eeat-quality·ymyl·multilingual·accessibility-vpat) | [→ writing 스킬 목록](../skills/writing/README.md) |
| meta (5종) | 워크플로우 + 꿈 앱 프롬프트 엔지니어링 전체 | [→ meta 스킬 목록](../skills/meta/README.md) |

---

## 훅 (19종)

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

> 개발 전용(tdd-guard·test-fake-guard·verification-gate·careful-with-judge)·TypeScript(typescript-quality)·Memory 훅은 이 템플릿에 포함되지 않습니다.

---

## 규칙 (8종)

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

> 언어별 규칙(java.md·rust.md·typescript.md)은 이 템플릿에 포함되지 않습니다.

---

## CLAUDE.md

설치 시 [`examples/CLAUDE.dream-interpretation.md`](../../examples/CLAUDE.dream-interpretation.md)가 대상 프로젝트 루트에 복사됩니다.

이미 CLAUDE.md가 있으면 덮어쓸지 확인 후 처리합니다.

**사전 구성 내용:**
- 안전 정책 필수 사항 (자해·자살·트라우마 신호 감지 시 해몽 생략 + 위기 자원 안내, 꿈 해몽은 진단·치료 도구 아님 면책 명시, 사용자 꿈 데이터 분석 로그 원문 보관 금지)
- 공통 원칙 (커밋·푸시 사용자 요청 시에만, 계획 확인 절차)
- 규칙 참조 표 (task-workflow·git·info-verification·agent-design·commands·readme-update)

---

## settings.json

`scripts/gen-settings.js` 플래그 없이 생성됩니다. (개발·TypeScript 훅 제외)

이미 settings.json이 있으면 덮어쓸지 확인 후 처리합니다.

| 설정 | 값 |
|------|-----|
| `defaultMode` | `"acceptEdits"` — 파일 수정 도구 자동 승인 |
| `permissions.allow` | node/npm/git 조회·변경 명령어, Write/Edit/Read/Glob/Grep/WebSearch/WebFetch/Agent |
| `permissions.deny` | `git push --force`, `rm -rf` 시스템 경로, `chmod 777`, curl\|bash 패턴 |
| `permissions.additionalDirectories` | `/tmp`, `/private/tmp`, `/var/folders` |
| `statusLine` | 브랜치·미커밋·PENDING_TEST 상태 표시 (`statusline.sh`) |
| 훅 연결 | 공통 19종만 연결 (dev·TypeScript 훅 없음) |
