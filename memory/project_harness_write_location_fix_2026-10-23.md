---
name: project_harness_write_location_fix_2026-10-23
description: "lfmall 세션 보고로 재현한 하네스 약점 4곳(자기 승인·Bash 쓰기 위치·검사 제외 범위·auto-format 링크) 수정 — 브랜치 fix/harness-write-location-2026-10-22, PR 때 v1.1.2"
metadata:
  node_type: memory
  type: project
  originSessionId: e56d6dae-5bbb-4b87-9782-cf342f4a6e7a
  modified: 2026-10-23T00:22:12.087Z
---

2026-10-23 lfmall-ai-toolkit 세션이 보고한 약점을 gugbab v1.1.1 에서 그대로 재현하고, lfmall 이 고친 방식대로 옮겼다(브랜치 `fix/harness-write-location-2026-10-22`, PR 때 버전 1.1.2).

1. 자기 승인: task-confirm-guard 맥 분기가 승인 상태 폴더(`$TMPDIR/claude-task-confirm-guard/`)를 임시 폴더 예외로 통과 → `inStateDir`(realpath.native, darwin 소문자 비교) 로 예외에서 뺌. bash-guard 도 그 폴더 쓰기 deny.
2. Bash 쓰기 위치: PermissionRequest 는 classifyShell 판정이 null 이면 자동 승인 → `cp x ~/.zshrc`·`~/.claude/settings.json`·`/etc/hosts` 가 자동 승인이었다. bash-guard `classifyWriteLocation` 추가(보호 파일 밖 deny·안 ask, 그 밖 프로젝트·허용·임시 폴더 밖 ask, ln 은 마지막 인자만, 변수 대상은 판정 안 함). relations.json `hook:bash-guard>hook:task-confirm-guard: mention`.
3. tdd·adversarial·fake-impl: `.claude/hooks` 부분 문자열 제외 → `isRootInfra`(프로젝트 루트 기준).
4. auto-format: 상위 폴더 링크로 밖의 포매터 실행 → realpath 로 다시 확인.

**Why:** 자동 허용은 읽기만 넓힌다는 원칙([[feedback_auto_allow_reads_only]])에 어긋난 구멍. 확인을 늘리는 방향이라 원칙과 맞다.

**How to apply:**
- 실행된 Bash 10,898건 재생 → 79건이 자동→확인. 전부 프로젝트·허용 폴더 밖 쓰기다(다른 레포, 다른 프로젝트 메모리, `~/.gugbab-fresh-install`). 다른 레포에 쓰는 작업(lfmall 전달 등)은 이제 확인 창이 뜬다.
- 고치기 전 코드로 실패 확인은 git stash 대신 사본을 바꿔 끼운다. 사본은 **홈 아래**에 둔다 — 임시 폴더에 두면 task-confirm-guard 임시 폴더 예외 때문에 기존 시험까지 깨진다.
- 남은 것: staleness-check 링크 너머, 윈도우 `git.exe` 현재 폴더, TUI 의 "프로젝트 자체 .claude 우선 항목 ✅ 표시"(lfmall 관찰).
- 이전 빈틈 수정: [[project_harness_gaps_from_user_report_2026-10-22]]
