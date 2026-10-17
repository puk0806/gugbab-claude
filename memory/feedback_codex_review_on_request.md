---
name: feedback-codex-review-on-request
description: "Codex 리뷰는 래퍼 개편 1차본을 전부 완성한 뒤 맨 마지막에 한 번 — 그 전까지 `git config codex.skipReview true` 로 중지 유지, 구현 중에 재개 여부를 다시 묻지 않음"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 956a993c-0d69-41df-9a5f-10e37ec24b3f
  modified: 2026-10-16T02:13:16.731Z
---

2026-10-15 사용자: "리뷰는 내가 해달라고 할때 해줘. 지금 계속 리뷰하는건 무의미하고 지금에 대해서만 잠시 미뤄. 체크리스트 다 끝나고 나서부터 리뷰 들어가."
2026-10-16 (구현 진입 시 재개 여부를 묻자) 사용자: "코덱스 리뷰 지금 빼고 코덱스 리뷰는 맨마지막에 다 1차본 완성하고 진행하자 지금 말고"

- 이 레포에 `git config codex.skipReview true` 로 codex-review-guard **중지 유지** (로컬 git config, 레포 파일 변경 아님)
- 재개 시점: **래퍼 개편 1차본(구현까지) 전부 완성 후 맨 마지막** — 그때 `git config --unset codex.skipReview` 하고 리뷰
- 구현 단계 중간에는 재개 여부를 다시 묻지 않는다. 사용자가 먼저 리뷰를 요청하면 그때 실행
- 재개 전 준비: 로컬 전용(.gitignore) 파일이 리뷰 전송 범위에서 빠지는지 먼저 확인(외부 전송 방지) — [[local-index]]

**Why:** 계획·중간 구현마다 Stop 훅이 리뷰를 강제해 흐름을 끊었고, 작업 트리에 외부로 보내면 안 되는 로컬 전용 내용이 섞여 있었음.
**How to apply:** 중지 상태를 잊지 말 것 — 1차본 완료 보고 때 "이제 Codex 리뷰 진행" 을 다음 단계로 제시. 관련: [[feedback-codex-review-workflow]] [[project-shim-wrapper-direction]]
