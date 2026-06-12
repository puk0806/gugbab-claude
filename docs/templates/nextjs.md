# 템플릿: nextjs (3)

Next.js App Router + TypeScript 프로젝트. react-spa와 동일한 스킬·에이전트·훅·규칙 구성.

```
./project-install.sh  →  번호 입력: 3
```

---

## 에이전트

react-spa 템플릿과 동일한 에이전트 구성입니다. → [react-spa 에이전트 목록](./react-spa.md)

---

## 스킬

| 카테고리 | 종류 | 링크 |
|----------|------|------|
| frontend (76종) | 프레임워크·상태관리·UI·빌드·테스트·성능·SEO·LLM (Next.js·SSR·App Router 포함) | [→ 목록](../skills/frontend/README.md) |
| devops (9종) | Docker·GitHub Actions·n8n·SEO 운영 | [→ 목록](../skills/devops/README.md) |
| architecture (2종) | DDD, 꿈 앱 데이터 모델 | [→ 목록](../skills/architecture/README.md) |
| meta (5종) | 워크플로우·프롬프트 엔지니어링 | [→ 목록](../skills/meta/README.md) |
| writing (4종) | SEO 콘텐츠 품질 — content-eeat-quality·ymyl·multilingual·accessibility-vpat | [→ 목록](../skills/writing/README.md) |

---

## 훅 (17종)

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

### TypeScript 전용 (1종)

| 훅 | 이벤트 | 설명 |
|----|--------|------|
| [typescript-quality.js](../../.claude/hooks/typescript-quality.js) | PostToolUse Write/Edit | .ts/.tsx 저장 시 tsc --noEmit 자동 실행 — 오류 있으면 차단 |

> Memory 훅은 설치 시 Memory 공유 기능 선택 시 추가됩니다.

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
| [typescript.md](../../.claude/rules/typescript.md) | TypeScript + React 코딩 규칙 — 타입 시스템, 컴포넌트, 상태 관리, 금지 패턴 |

---

## CLAUDE.md

설치 시 [`examples/CLAUDE.nextjs.md`](../../examples/CLAUDE.nextjs.md)가 대상 프로젝트 루트에 복사됩니다.

이미 CLAUDE.md가 있으면 덮어쓸지 확인 후 처리합니다.

**사전 구성 내용:**
- Next.js App Router 전용 규칙 (Server/Client Component 구분, Metadata API 사용 등)
- 공통 원칙 (커밋·푸시 사용자 요청 시에만, 계획 확인 절차)
- 규칙 참조 표 (task-workflow·git·info-verification·typescript·agent-design·commands·readme-update)

---

## settings.json

`scripts/gen-settings.js --dev --typescript` 플래그로 생성됩니다. (react-spa와 동일)

이미 settings.json이 있으면 덮어쓸지 확인 후 처리합니다.

| 설정 | 값 |
|------|-----|
| `defaultMode` | `"acceptEdits"` — 파일 수정 도구 자동 승인 |
| `permissions.allow` | node/npm/pnpm/npx/git 조회·변경 명령어, Write/Edit/Read/Glob/Grep/WebSearch/WebFetch/Agent |
| `permissions.deny` | `git push --force`, `rm -rf` 시스템 경로, `chmod 777`, curl\|bash 패턴 |
| `permissions.additionalDirectories` | `/tmp`, `/private/tmp`, `/var/folders` |
| `statusLine` | 브랜치·미커밋·PENDING_TEST 상태 표시 (`statusline.sh`) |
| 훅 연결 | 공통 19종 + dev(tdd-guard·test-fake-guard·verification-gate·careful-with-judge) + TypeScript(typescript-quality) 전체 연결 |
