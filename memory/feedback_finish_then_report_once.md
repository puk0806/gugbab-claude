---
name: feedback-finish-then-report-once
description: 작업을 다 끝내고 한 번만 보고한다 — 중간에 되묻거나 같은 확인을 반복하지 않는다
metadata:
  node_type: memory
  type: feedback
  originSessionId: fcd01deb-5e2e-4ed8-8072-cbe66cb8d86f
  modified: 2026-11-24T00:18:32.907Z
---

"다 진행해"·"작업 다 하고 보고해" 를 받았으면 남은 작업·테스트를 끝까지 한 뒤 한 번만 보고한다. 정할 것이 있으면 추천안으로 정하고 보고에 적는다.

**Why:** 2026-11-23 사용자가 같은 지시를 여러 번 반복한 끝에 "작업다하고 보고하라고 … 몇번 말해" 라며 크게 화를 냈다. 중간 보고마다 "진행할까요?"·"정할 것이 있습니다" 로 멈춘 것이 원인(일부는 승인 확인 훅이 새 메시지마다 승인을 푼 탓 — 사용량 한도 재개 알림도 새 메시지로 처리된다).

**How to apply:**
- 훅 때문에 "진행할까요?" 가 꼭 필요하면 계획을 3줄 이내로 한 번만 묻고, 승인 뒤에는 끝까지 간다.
- 커밋·푸시·PR·머지처럼 따로 허락이 필요한 것만 남기고 나머지는 묻지 않는다([[feedback-commit-policy]]).
- 관련: [[feedback-report-after-full-tests]], [[feedback-one-decision-at-a-time]] (질문이 꼭 필요할 때의 형식).
