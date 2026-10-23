---
name: feedback_keep_busy_during_tests
description: "긴 시험은 백그라운드로 돌리고 답변을 끝내지 말고, 앞에서 돌려 끝날 때까지 작업 중 상태를 유지"
metadata:
  node_type: memory
  type: feedback
  originSessionId: e56d6dae-5bbb-4b87-9782-cf342f4a6e7a
  modified: 2026-10-23T00:58:21.762Z
---

시험(단위·매트릭스·E2E)이 도는 동안에도 에이전트 표시가 "작업 중"으로 보여야 한다. 2026-10-23 사용자 지적: "테스트 돌아갈때도 에이전트에 불들어와서 아직 작업중이다가 표시되게".

**Why:** run_in_background 로 띄우고 답변을 끝내면 세션이 대기 상태로 보여 comux 에이전트 불이 꺼진다. 사용자는 작업이 끝난 줄 안다.

**How to apply:**
- 긴 시험은 foreground Bash 로 돌린다(timeout 최대 600000ms). 10분이 넘으면 나눠서 연달아 돌린다.
- 결과를 다 받은 뒤 한 번에 보고한다([[feedback_report_after_full_tests]]).
- 백그라운드는 정말 다른 일을 병렬로 할 때만 쓰고, 그때도 답변을 끝내지 않는다.
