# 훅 (Hooks)

Claude Code 이벤트에 반응하는 자동화 훅 모음 (총 29종).

훅 파일 위치: `.claude/hooks/`

---

## 공통 훅 (19종) — 모든 템플릿

| 훅 | 이벤트 | 설명 |
|----|--------|------|
| [_lib.js](../../.claude/hooks/_lib.js) | — | 훅 공통 유틸리티 모듈 — 프로젝트 해시·상태 파일·핸드오프 경로 |
| [bash-guard.js](../../.claude/hooks/bash-guard.js) | PreToolUse Bash | 위험한 Bash 명령어 패턴 차단 — git rm, rm -rf, SKILL.md sed 수정 등 |
| [auto-approve.js](../../.claude/hooks/auto-approve.js) | PreToolUse | Bash를 제외한 도구 자동 승인 (Bash 보안은 bash-guard.js가 담당) |
| [parry.js](../../.claude/hooks/parry.js) | PreToolUse Write | 시크릿·프롬프트 인젝션 패턴 스캔 — 감지 시 저장 차단 |
| [protect-secrets.js](../../.claude/hooks/protect-secrets.js) | PreToolUse Write/Edit | 민감 파일(.env, *.pem, *.key, credentials 등) 수정 차단 |
| [session-start.js](../../.claude/hooks/session-start.js) | SessionStart | 세션 시작 시 현재 브랜치·미커밋 파일·최근 커밋 요약 출력 |
| [session-handoff-inject.js](../../.claude/hooks/session-handoff-inject.js) | SessionStart | 직전 세션 핸드오프(24h 이내)가 있으면 git 상태를 컨텍스트로 주입 |
| [session-summary.js](../../.claude/hooks/session-summary.js) | Stop | 세션 종료 시 수정된 파일 목록 및 작업 요약 기록 |
| [session-handoff.js](../../.claude/hooks/session-handoff.js) | Stop | 세션 종료 시 브랜치·커밋·변경 파일 상태를 핸드오프 파일에 저장 |
| [cc-notify.js](../../.claude/hooks/cc-notify.js) | Stop | 작업 완료 시 macOS 데스크탑 알림 (타 플랫폼 silent) |
| [instructions-loaded.js](../../.claude/hooks/instructions-loaded.js) | InstructionsLoaded | CLAUDE.md 로드 완료 시 규칙 요약 출력 |
| [pending-test-guard.js](../../.claude/hooks/pending-test-guard.js) | Stop | 세션 종료 전 PENDING_TEST 상태 스킬 존재 시 차단 — 미테스트 스킬 누락 방지 |
| [readme-guard.js](../../.claude/hooks/readme-guard.js) | PreToolUse Bash / Stop | git commit·push 직전 README 미업데이트 차단 + 세션 종료 차단. SKILL.md·agents/*.md·.changeset/*.md 변경 감지 (git diff 기반) |
| [skill-md-guard.js](../../.claude/hooks/skill-md-guard.js) | PostToolUse Write | SKILL.md 저장 시 소스 URL·검증일·필수 섹션 존재 여부 검증 |
| [agent-md-guard.js](../../.claude/hooks/agent-md-guard.js) | PostToolUse Write | 에이전트 .md 저장 시 name·description·tools·model·example 형식 검증 |
| [verification-guard.js](../../.claude/hooks/verification-guard.js) | PostToolUse Write | verification.md 저장 시 필수 섹션 확인, UNVERIFIED 상태 차단 |
| [staleness-check.js](../../.claude/hooks/staleness-check.js) | InstructionsLoaded | 스킬 검증일 경과 감지 — 30~59일 경고, 60일+ 재검증 강제 지시 |
| [task-plan-guard.js](../../.claude/hooks/task-plan-guard.js) | UserPromptSubmit | 복잡한 작업 요청 감지 시 Claude에게 계획 확인 절차 지시 |
| [statusline.sh](../../.claude/hooks/statusline.sh) | statusLine | 상태 바 — 브랜치 + 미커밋 수 + PENDING_TEST 스킬 수 표시 |

---

## 개발 전용 훅 (4종) — dev 템플릿 (react-spa·nextjs·rust-axum·java·unity)

| 훅 | 이벤트 | 설명 |
|----|--------|------|
| [tdd-guard.js](../../.claude/hooks/tdd-guard.js) | PostToolUse Write/Edit | 소스 파일 수정 시 대응 테스트 파일 존재 여부 검사 — 없으면 차단 (hooks/commands/scripts/ 제외) |
| [test-fake-guard.js](../../.claude/hooks/test-fake-guard.js) | PostToolUse Write | 테스트 코드에서 가짜 패스(skip/mock 남용 등) 탐지 차단 |
| [verification-gate.js](../../.claude/hooks/verification-gate.js) | Stop | 소스 파일 수정 후 테스트 파일 변경 없으면 경고 출력 (차단 안 함) |
| [careful-with-judge.js](../../.claude/hooks/careful-with-judge.js) | PreToolUse Bash | rm -rf 분석 — 시스템·.git·홈 삭제는 차단, 그 외는 경고 |

---

## TypeScript 전용 훅 (1종) — react-spa·nextjs 템플릿

| 훅 | 이벤트 | 설명 |
|----|--------|------|
| [typescript-quality.js](../../.claude/hooks/typescript-quality.js) | PostToolUse Write/Edit | .ts/.tsx 저장 시 tsc --noEmit 자동 실행 — 오류 있으면 차단 |

---

## 메모리 훅 (3종) — Memory 공유 기능 선택 시

| 훅 | 이벤트 | 설명 |
|----|--------|------|
| [memory-pull.js](../../.claude/hooks/memory-pull.js) | SessionStart | symlink 자동 설정 + 원격 최신 memory pull |
| [memory-sync.js](../../.claude/hooks/memory-sync.js) | PostToolUse Write/Edit | memory 파일 변경 감지 → 즉시 git commit + push |
| [memory-stop-guard.js](../../.claude/hooks/memory-stop-guard.js) | Stop | 세션 종료 직전 미동기 memory 변경 재시도 — 강제 동기화 보장 |

---

## Codex 훅 (1종) — Codex 리뷰 기능 선택 시

| 훅 | 이벤트 | 설명 |
|----|--------|------|
| [codex-review-guard.js](../../.claude/hooks/codex-review-guard.js) | Stop | 미커밋 코드 변경 감지 시 Codex 적대적 리뷰 3라운드 강제 — 로그인 미완료 시 로그인 선행 요구 |

---

## 브랜치 보호 훅 (1종) — Branch Protection 선택 시

| 훅 | 이벤트 | 설명 |
|----|--------|------|
| [branch-protection.js](../../.claude/hooks/branch-protection.js) | PreToolUse Bash | main 브랜치로 직접 push 차단(PR 필수) + 피처 브랜치에서 새 브랜치 생성 차단(main에서만 허용) |

---

## 훅 계층 구조

```
공통 (19종)      ← 모든 템플릿
├── 개발 전용 (4종)  ← react-spa·nextjs·rust-axum·java-spring-*·unity-game
│   └── TypeScript (1종)  ← react-spa·nextjs만 추가
├── Memory (3종)    ← --memory 옵션 선택 시 추가
├── Codex (1종)     ← --codex 옵션 선택 시 추가
└── Branch Protection (1종)  ← --branch-protection 옵션 선택 시 추가
```
