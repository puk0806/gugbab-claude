---
name: project-memory-architecture
description: "2026-07-10 메모리 저장 구조 개편 — 전역 1차 저장 + 레포 미러, 자동 커밋 전면 폐지"
metadata: 
  node_type: memory
  type: project
  originSessionId: 326d382d-a205-4839-bf71-16d21252358a
  modified: 2026-09-01T00:20:14.098Z
---

2026-07-10 사용자 요청으로 메모리 저장 구조를 개편했다.

**구조** (자세한 규칙: `.claude/rules/memory-sync.md`):
- 전역 `~/.claude/projects/<해시>/memory/` = **실제 디렉토리, 1차 저장소** (symlink 폐지)
- 레포 `memory/` = 워킹트리 미러 (memory-sync.js가 양방향 복사)
- **자동 git commit 전면 폐지** — memory·exports 모두. 커밋·푸시는 사용자가 직접
- Y/N 판별: 레포에 `memory/` 디렉토리 존재 = Y. 이 레포는 **Y**
- memory-stop-guard.js·setup-memory-link.sh 삭제, 훅 23→22종

**Why:** `[memory] sync`/`[export] sync` 자동 커밋이 깃 트리를 오염시켜 불편했고,
N(거부) 시 메모리가 아예 유실되는 문제가 있었다. 전역을 1차 저장소로 두면
커밋 여부와 무관하게 메모리가 항상 보존된다.

**How to apply:** memory 파일은 전역·레포 어느 쪽을 수정해도 반대쪽에 미러된다.
커밋을 제안하지 말 것([[feedback_commit_policy]] 그대로). 다른 PC 공유는
사용자가 수동 push/pull → SessionStart의 memory-pull.js가 레포→전역 반영.
push·PR 직전에는 memory·exports가 커밋된 상태여야 함 — deliverable-guard가
차단하므로, 메모리 정리 → `session-export.js --refresh` → [memory]/[export]
커밋 순서를 지킨다 (2026-07-10 강제화). 세션 요약의 Stop(매 턴) 기록은
로컬 exports/에만 쌓이고, 레포 exports/는 --refresh 시점에만 생성된다
— push 후 워킹트리가 dirty로 남지 않는 이유.

**--refresh 함정 (2026-08-31 실측):** `session-export.js --refresh`는
`CLAUDE_PROJECT_DIR` env로 로컬 트랜스크립트를 찾는데, Claude가 Bash로 수동
실행하면 이 env가 비어 있어 **무음 no-op(exit 0, 출력 없음)** 이 된다.
반드시 `CLAUDE_PROJECT_DIR=<레포 절대경로> node .claude/hooks/session-export.js
--refresh`로 실행하고, 성공 시 `[session-export] refresh 완료: <id>` 출력과
레포 exports/ 신규 파일을 확인할 것.

**deliverable-guard 푸시 게이트 (2026-08-31 실측):** 커밋과 push를 한 Bash
명령에 &&로 묶으면 훅이 *명령 실행 전* 미커밋 memory/exports를 보고 통째로
차단한다 — 커밋 명령과 push 명령을 별도 호출로 분리할 것.
