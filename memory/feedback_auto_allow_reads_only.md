---
name: feedback-auto-allow-reads-only
description: "자동 허용을 넓힐 때는 읽기만 — Edit·Write·삭제·실행은 새로 자동 허용하지 않는다 (2026-10-21 사용자 지시, 훅으로 강제)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: e56d6dae-5bbb-4b87-9782-cf342f4a6e7a
  modified: 2026-10-21T00:43:39.856Z
---

권한 확인 창을 줄이는 작업에서 **새로 자동 허용하는 것은 읽기 전용 동작뿐**이다. Edit·Write·파일 쓰기 리다이렉트·삭제·프로그램 실행은 같은 요청 안에서도 새로 자동 허용하지 않고 지금처럼 확인을 받는다. 반드시 훅(bash-guard·auto-approve)으로 강제하고 적대적 테스트로 고정한다.

**Why:** 사용자(2026-10-21): "read 에 대해서는 allow 안 해도 되게… 에딧이랑 라이트 이런건 허용하면 안 되고 리드에 대해서만 해야 해, 훅으로 강제해줘". 확인 창을 없애는 편의보다 쓰기·실행 통제가 우선.

**How to apply:**
- 읽기 판정은 엄격한 목록으로(쓰기·실행이 가능한 `sed`·`awk`·`xargs`·`less`, `find -exec`, `sort -o`, `rg --pre`, 출력 리다이렉트, git `-c`·쓰기 하위 명령은 읽기 아님).
- 바꾸기 전에 실제 확인 창 기록(세션 jsonl 의 `permissionDecision.source: "user_temporary"`)을 모아 지금 버전에 다시 넣어 보고, 무엇이 실제로 줄어드는지 수치로 보고한다 — 2026-10-21 재생해 보니 읽기 확인 창은 이미 0건이었다.
- 쓰기·삭제가 확인 없이 실행되는 경우는 Claude Code `acceptEdits` 가 작업·임시 폴더 안 파일 명령을 스스로 허용하는 것일 수 있다(실측) — 훅 변경과 구분해서 보고.
- 관련: 계획서 결정 42, [[project-harness-status-2026-10-15]]
