# 훅 (Hooks)

Claude Code 이벤트에 반응하는 자동화 훅 모음 (총 23종 = 실행 훅 21종 + 공통 유틸 `_lib.js` + `statusline.sh`).

훅 파일 위치: `.claude/hooks/`

> **2026-07 훅 다이어트**: 훅 29→22종, Stop 차단형 6→3개.
> 판단 기준 — *"없으면 비가역 사고가 나는가? 아니면 CLAUDE.md 한 줄/네이티브 기능으로 충분한가"*
> - `task-plan-guard` + `confirmation-gate` → 네이티브 **Plan Mode**로 대체
> - `pending-test-guard` + `readme-guard` + `session-summary`(추적) → **`deliverable-guard`** 1개로 통합
> - `session-handoff` / `session-handoff-inject` → 네이티브 **resume**이 커버, 제거
> - `careful-with-judge`(rm -rf 분석) → `bash-guard`에 흡수 / `verification-gate`(경고만) → 제거
> - 보호 파일(verification.md·SKILL.md·memory/) Bash 차단을 **쓰기 연산만**으로 축소 (읽기 전용 grep/diff 오탐 수정)
> - 차단형(blocking) 훅 전체에 `*.test.js` 필수화

---

## 공통 훅 (15종) — 모든 템플릿

| 훅 | 이벤트 | 설명 | 테스트 |
|----|--------|------|:---:|
| [_lib.js](../../.claude/hooks/_lib.js) | — | 훅 공통 유틸리티 모듈 — 프로젝트 해시·상태 파일 경로 | — |
| [bash-guard.js](../../.claude/hooks/bash-guard.js) | PreToolUse·PostToolUse·PermissionRequest | 위험 Bash 차단(rm -rf 시스템/홈/.git·force push 등) + 보호 파일 *쓰기 연산* 차단 + 안전 패턴 자동 허용 | ✅ |
| [auto-approve.js](../../.claude/hooks/auto-approve.js) | PreToolUse·PermissionRequest | Bash를 제외한 도구 자동 승인 (Bash 보안은 bash-guard가 담당) | ✅ |
| [parry.js](../../.claude/hooks/parry.js) | PreToolUse Write | 시크릿·프롬프트 인젝션 패턴 스캔 — 감지 시 저장 차단 | ✅ |
| [protect-secrets.js](../../.claude/hooks/protect-secrets.js) | PreToolUse Write/Edit | 민감 파일(.env, *.pem, *.key, credentials 등) 수정 차단 | ✅ |
| [deliverable-guard.js](../../.claude/hooks/deliverable-guard.js) | PostToolUse Write/Edit · PreToolUse Bash · Stop | **산출물 완결성 통합 훅** — 세션 수정 파일 추적 + git commit/push·세션 종료 시 README 동기화 검사 + PENDING_TEST 스킬 2단계 테스트 미수행 차단 (`.claude/worktrees/` 스캔 제외) | ✅ |
| [skill-md-guard.js](../../.claude/hooks/skill-md-guard.js) | PreToolUse Write · PostToolUse Edit | SKILL.md 소스 URL·검증일·필수 섹션 검증 — **위반 시 저장 자체 차단** (Edit는 디스크 재읽기 사후 검증) | ✅ |
| [agent-md-guard.js](../../.claude/hooks/agent-md-guard.js) | PreToolUse Write · PostToolUse Edit | 에이전트 .md name·description·tools·model·example 검증 — **위반 시 저장 자체 차단** | ✅ |
| [verification-guard.js](../../.claude/hooks/verification-guard.js) | PreToolUse Write · PostToolUse Edit | verification.md 필수 섹션·UNVERIFIED·"내장 지식" 자백 검증 — **위반 시 저장 자체 차단** | ✅ |
| [staleness-check.js](../../.claude/hooks/staleness-check.js) | InstructionsLoaded | 스킬 검증일 경과 감지 — 30~59일 경고, 60일+ 재검증 강제 지시 | — |
| [instructions-loaded.js](../../.claude/hooks/instructions-loaded.js) | InstructionsLoaded | CLAUDE.md 로드 완료 시 규칙 요약 출력 | — |
| [session-start.js](../../.claude/hooks/session-start.js) | SessionStart | 세션 시작 시 현재 브랜치·미커밋 파일·최근 커밋 요약 출력 | — |
| [session-export.js](../../.claude/hooks/session-export.js) | Stop | 세션 대화 요약(요청·응답·수정 파일·Codex 리뷰) 강제 보존 — memory 공유 모드면 레포 `exports/`에 커밋, 아니면 로컬 `~/.claude/projects/<해시>/exports/` (비차단) | ✅ |
| [cc-notify.js](../../.claude/hooks/cc-notify.js) | Stop | 작업 완료 시 macOS 데스크탑 알림 (비차단, 타 플랫폼 silent) | — |
| [statusline.sh](../../.claude/hooks/statusline.sh) | statusLine | 상태 바 — 브랜치 + 미커밋 수 + PENDING_TEST 스킬 수 표시 | — |

> 테스트 "—" 항목은 차단하지 않는 관찰·알림·컨텍스트 주입 훅 (오탐 시 피해 없음).
> **차단형(blocking) 훅은 전부 `*.test.js` 필수** — 2026-07-03 오탐 4건이 모두 미테스트 훅에서 발생한 데 따른 조치.

---

## 개발 전용 훅 (2종) — dev 템플릿 (react-spa·nextjs·rust-axum·java·unity)

| 훅 | 이벤트 | 설명 | 테스트 |
|----|--------|------|:---:|
| [tdd-guard.js](../../.claude/hooks/tdd-guard.js) | PostToolUse Write/Edit | 소스 파일 수정 시 대응 테스트 파일 존재 여부 검사 — 없으면 차단 (hooks/commands/scripts/ 제외) | ✅ |
| [test-fake-guard.js](../../.claude/hooks/test-fake-guard.js) | PreToolUse Bash | echo/printf/true로 테스트 결과를 흉내내는 가짜 테스트 실행 차단 | ✅ |

---

## TypeScript 전용 훅 (1종) — react-spa·nextjs 템플릿

| 훅 | 이벤트 | 설명 | 테스트 |
|----|--------|------|:---:|
| [typescript-quality.js](../../.claude/hooks/typescript-quality.js) | PostToolUse Write/Edit | .ts/.tsx 저장 시 tsc --noEmit 자동 실행 — 오류 있으면 차단 | ✅ |

---

## 메모리 훅 (3종) — Memory 공유 기능 선택 시

| 훅 | 이벤트 | 설명 | 테스트 |
|----|--------|------|:---:|
| [memory-pull.js](../../.claude/hooks/memory-pull.js) | SessionStart | symlink 자동 설정 + 원격 최신 memory pull | — |
| [memory-sync.js](../../.claude/hooks/memory-sync.js) | PostToolUse Write/Edit | memory 파일 변경 감지 → 즉시 git commit (push는 사용자가 직접) | — |
| [memory-stop-guard.js](../../.claude/hooks/memory-stop-guard.js) | Stop | 세션 종료 직전 미커밋 memory 변경 자동 커밋 | ✅ |

---

## Codex 훅 (1종) — Codex 리뷰 기능 선택 시

| 훅 | 이벤트 | 설명 | 테스트 |
|----|--------|------|:---:|
| [codex-review-guard.js](../../.claude/hooks/codex-review-guard.js) | Stop | 미커밋 코드 변경 감지 시 Codex 적대적 리뷰 3라운드 강제 — 로그인 미완료 시 로그인 선행 요구 | ✅ |

---

## 브랜치 보호 훅 (1종) — Branch Protection 선택 시

| 훅 | 이벤트 | 설명 | 테스트 |
|----|--------|------|:---:|
| [branch-protection.js](../../.claude/hooks/branch-protection.js) | PreToolUse Bash | main 브랜치로 직접 push 차단(PR 필수) + 피처 브랜치에서 새 브랜치 생성 차단(main에서만 허용) | ✅ |

---

## 훅 계층 구조

```
공통 (15종)      ← 모든 템플릿
├── 개발 전용 (2종)  ← react-spa·nextjs·rust-axum·java-spring-*·unity-game
│   └── TypeScript (1종)  ← react-spa·nextjs만 추가
├── Memory (3종)    ← --memory 옵션 선택 시 추가
├── Codex (1종)     ← --codex 옵션 선택 시 추가
└── Branch Protection (1종)  ← --branch-protection 옵션 선택 시 추가
```

## 테스트 실행

```bash
for f in .claude/hooks/*.test.js; do node "$f"; done
node scripts/gen-settings.test.js
```
